"use server";

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

interface JikanAnimeEntry {
  mal_id: number;
  entry: {
    mal_id: number;
    url: string;
    images: {
      webp: {
        image_url: string;
        small_image_url: string;
        large_image_url: string;
      };
    };
    title: string;
  };
  score: number;
  status: string;
}

export async function fetchMalAnimeList(username: string) {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("User not authenticated.");
  }

  const jikanApiUrl = `https://api.jikan.moe/v4/users/${username}/animelist`;

  try {
    const response = await fetch(jikanApiUrl);
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("MyAnimeList user not found.");
      }
      if (response.status === 429) {
        throw new Error("Too many requests to MyAnimeList API. Please wait a moment and try again.");
      }
      if (response.status === 403) {
        throw new Error("MyAnimeList user list is private or not accessible.");
      }
      throw new Error(`Failed to fetch MAL list: ${response.statusText}`);
    }
    const data = await response.json();
    return data.data as JikanAnimeEntry[];
  } catch (error: unknown) {
    console.error("Error fetching MAL list:", error);
    throw new Error(`Error fetching MAL list: ${(error as Error).message}`);
  }
}

export async function confirmImport(animeList: JikanAnimeEntry[]) {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("User not authenticated.");
  }

  const userId = session.user.id;

  try {
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
        .eq("mal_id", entry.entry.mal_id)
        .single();

      if (fetchAnimeError && fetchAnimeError.code !== "PGRST116") { // PGRST116 is "No rows found"
        console.error("Error fetching anime:", fetchAnimeError);
      }

      let animeId: number | null = null;

      if (!existingAnime) {
        // Anime does not exist, prepare to insert
        const newAnime = {
          mal_id: entry.entry.mal_id,
          title: entry.entry.title,
          image_url: entry.entry.images.webp.image_url,
          mal_url: entry.entry.url,
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
        status: entry.status,
        score: entry.score,
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