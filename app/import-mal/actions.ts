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

export async function confirmImport(animeList: MalAnimeEntry[], malUsername: string) { // Add malUsername parameter
  const supabase = await createSupabaseServerClient();
  const { data: { user: sessionUser } } = await supabase.auth.getUser();

  if (!sessionUser) {
    throw new Error("User not authenticated.");
  }

  const userId = sessionUser.id;

  try {
    // Upsert mal_username into profiles table
    const { error: upsertProfileError } = await supabase
      .from('profiles')
      .upsert({ id: userId, mal_username: malUsername }, { onConflict: 'id' });

    if (upsertProfileError) {
      console.error("Error upserting profile:", upsertProfileError);
      throw new Error(`Error saving MAL username to profile: ${upsertProfileError.message}`);
    }

    // Delete existing UserAnimeEntry records for the current user
    const { error: deleteError } = await supabase
      .from("UserAnimeEntry")
      .delete()
      .eq("user_id", userId);

    if (deleteError) {
      throw new Error(`Error deleting existing entries: ${deleteError.message}`);
    }

    const animeToInsert: { mal_id: number; title: string; image_url: string; mal_url: string }[] = [];
    const userAnimeEntriesToInsert: { user_id: string; anime_id: number; status: string; score: number }[] = [];

    for (const entry of animeList) {
      // Check if anime exists in our Anime table
      const { data: existingAnime, error: fetchAnimeError } = await supabase
        .from("Anime")
        .select("id, mal_id")
        .eq("mal_id", entry.node.id)
        .single();

      if (fetchAnimeError && fetchAnimeError.code !== "PGRST116") { // PGRST116 is "No rows found"
        console.error("Error fetching anime:", fetchAnimeError);
      }

      let animeId: number | null = null;

      if (!existingAnime) {
        // Anime does not exist, prepare to insert
        const newAnime = {
          mal_id: entry.node.id,
          title: entry.node.title,
          image_url: entry.node.main_picture.large || entry.node.main_picture.medium,
          mal_url: `https://myanimelist.net/anime/${entry.node.id}`, // Construct MAL URL
        };
        animeToInsert.push(newAnime);
        // We'll get the ID after bulk insert or by selecting again
      } else {
        animeId = existingAnime.id;
      }

      // Prepare UserAnimeEntry
      userAnimeEntriesToInsert.push({
        user_id: userId,
        anime_id: animeId!, // Will be updated after bulk insert if new anime
        status: entry.list_status.status,
        score: entry.list_status.score,
      });
    }

    // Bulk insert new anime if any
    if (animeToInsert.length > 0) {
      const { data: insertedAnime, error: insertAnimeError } = await supabase
        .from("Anime")
        .insert(animeToInsert)
        .select("id, mal_id");

      if (insertAnimeError) {
        throw new Error(`Error inserting new anime: ${insertAnimeError.message}`);
      }

      // Update anime_id in userAnimeEntriesToInsert for newly inserted anime
      userAnimeEntriesToInsert.forEach((userEntry) => {
        const matchingNewAnime = insertedAnime.find((newAni) => newAni.mal_id === userEntry.anime_id);
        if (matchingNewAnime) {
          userEntry.anime_id = matchingNewAnime.id;
        }
      });
    }

    // Bulk insert user anime entries
    const { error: insertUserEntriesError } = await supabase
      .from("UserAnimeEntry")
      .insert(userAnimeEntriesToInsert);

    if (insertUserEntriesError) {
      throw new Error(`Error inserting user anime entries: ${insertUserEntriesError.message}`);
    }

    revalidatePath("/swipe"); // Revalidate the swipe page to show updated list
    return { success: true };
  } catch (error: unknown) {
    console.error("Error confirming import:", error);
    throw new Error(`Error confirming import: ${(error as Error).message}`);
  }
}