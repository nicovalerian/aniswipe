"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

interface MalAnimeEntry {
  node: {
    id: number;
    title: string;
    main_picture: {
      medium: string;
      large: string;
    };
  };
  list_status: {
    status: string;
    score: number;
  };
}

export async function fetchMalAnimeList(username: string) {
  const supabase = await createSupabaseServerClient();
  const { data: { user: sessionUser }, error: authError } = await supabase.auth.getUser();

  if (authError) {
    console.error("Auth error in fetchMalAnimeList:", authError);
    throw new Error(`Authentication error: ${authError.message}`);
  }

  if (!sessionUser) {
    console.error("User not authenticated in fetchMalAnimeList.");
    throw new Error("User not authenticated.");
  }
  console.log("Session user in fetchMalAnimeList:", sessionUser.id);

  const malApiBaseUrl = process.env.NEXT_PUBLIC_MAL_API_BASE_URL;
  const malClientId = process.env.NEXT_PUBLIC_MAL_CLIENT_ID;

  if (!malApiBaseUrl || !malClientId) {
    throw new Error("MyAnimeList API base URL or client ID is not configured.");
  }

  const malApiUrl = `${malApiBaseUrl}/users/${username}/animelist?fields=list_status,main_picture`;

  try {
    const response = await fetch(malApiUrl, {
      headers: {
        "X-MAL-CLIENT-ID": malClientId,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("MyAnimeList user not found.");
      }
      throw new Error(`Failed to fetch MAL list: ${response.statusText} (Status: ${response.status})`);
    }
    const data = await response.json();

    // After successfully fetching the MAL list, save the username to the profiles table
    const { error: upsertError } = await supabase
      .from('profiles')
      .upsert({ id: sessionUser.id, mal_username: username }, { onConflict: 'id' });

    if (upsertError) {
      console.error("Supabase upsert error in fetchMalAnimeList:", upsertError);
      throw new Error(`Failed to save MAL username: ${upsertError.message}`);
    }

    return data.data as MalAnimeEntry[];
  } catch (error: unknown) {
    console.error("Error fetching MAL list:", error);
    throw new Error(`Error fetching MAL list: ${(error as Error).message}`);
  }
}

export async function confirmImport(animeList: MalAnimeEntry[], malUsername: string) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated.");
  }
 
  const userId = user.id;

  try {
    // Upsert mal_username into profiles table
    const { error: upsertProfileError } = await supabase
      .from('profiles')
      .upsert({ id: userId, mal_username: malUsername }, { onConflict: 'id' });

    if (upsertProfileError) {
      console.error("Error upserting profile:", upsertProfileError);
      throw new Error(`Error saving MAL username to profile: ${upsertProfileError.message}`);
    }

    // First, get all mal_ids from the incoming list
    const malIds = animeList.map((entry) => entry.node.id);

    // Fetch all existing anime from our DB that match the mal_ids
    const { data: existingAnimes, error: fetchAnimesError } = await supabase
      .from("Anime")
      .select("id, mal_id")
      .in("mal_id", malIds);

    if (fetchAnimesError) {
      throw new Error(`Error fetching existing anime: ${fetchAnimesError.message}`);
    }

    const animeIdMap = new Map(
      existingAnimes.map((anime) => [anime.mal_id, anime.id])
    );

    // Find which anime are new
    const newAnimeToInsert = animeList
      .filter((entry) => !animeIdMap.has(entry.node.id))
      .map((entry) => ({
        mal_id: entry.node.id,
        title: entry.node.title,
        image_url:
          entry.node.main_picture.large || entry.node.main_picture.medium,
      }));

    // If there are new animes, insert them
    if (newAnimeToInsert.length > 0) {
      const { data: insertedAnimes, error: insertAnimeError } = await supabase
        .from("Anime")
        .insert(newAnimeToInsert)
        .select("id, mal_id");

      if (insertAnimeError) {
        throw new Error(`Error inserting new anime: ${insertAnimeError.message}`);
      }

      // Add the newly inserted animes to our map
      if (insertedAnimes) {
        for (const anime of insertedAnimes) {
          animeIdMap.set(anime.mal_id, anime.id);
        }
      }
    }

    // Now, create the UserAnimeEntry objects
    const userAnimeEntriesToInsert = animeList.map((entry) => {
      const animeId = animeIdMap.get(entry.node.id);
      if (!animeId) {
        console.error(`Could not find id for mal_id ${entry.node.id}`);
        return null;
      }
      return {
        user_id: userId,
        anime_id: animeId,
        status: entry.list_status.status,
        score: entry.list_status.score,
      };
    }).filter(Boolean);

    // Delete existing UserAnimeEntry records for the current user
    const { error: deleteError } = await supabase
      .from("UserAnimeEntry")
      .delete()
      .eq("user_id", userId);

    if (deleteError) {
      throw new Error(`Error deleting existing entries: ${deleteError.message}`);
    }

    // Bulk insert user anime entries
    if (userAnimeEntriesToInsert.length > 0) {
      const { error: insertUserEntriesError } = await supabase
        .from("UserAnimeEntry")
        .insert(userAnimeEntriesToInsert as any);

      if (insertUserEntriesError) {
        throw new Error(`Error inserting user anime entries: ${insertUserEntriesError.message}`);
      }
    }

    revalidatePath("/swipe"); // Revalidate the swipe page to show updated list
    return { success: true };
  } catch (error: unknown) {
    console.error("Error confirming import:", error);
    throw new Error(`Error confirming import: ${(error as Error).message}`);
  }
}