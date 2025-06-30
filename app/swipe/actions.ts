"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

interface AnimeData {
  mal_id: number;
  title: string;
  image_url: string;
}

interface AddAnimeEntryData extends AnimeData {
  status: string;
  score?: number | null; // Make score optional and nullable
}

export async function searchAnime(query: string) {
  const res = await fetch(`https://api.jikan.moe/v4/anime?q=${query}&limit=10`);
  if (!res.ok) {
    throw new Error("Failed to fetch anime");
  }
  const data = await res.json();
  return data.data;
}

export async function addAnimeToList(data: AddAnimeEntryData) {
  const { mal_id, title, image_url, status, score } = data;

  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    console.error("Authentication error in addAnimeToList:", userError);
    throw new Error("User not authenticated.");
  }
  const userId = user.id;

  // Upsert anime into the Anime table
  const { data: upsertedAnime, error: upsertAnimeError } = await supabase
    .from("Anime")
    .upsert({ mal_id, title, image_url }, { onConflict: "mal_id" }) // Assuming mal_id is unique
    .select("id")
    .single();

  if (upsertAnimeError || !upsertedAnime) {
    console.error("Failed to upsert anime:", upsertAnimeError);
    throw upsertAnimeError || new Error("Failed to upsert anime.");
  }
  const animeId = upsertedAnime.id;

  // Create or update UserAnimeEntry
  const { error: upsertEntryError } = await supabase
    .from("UserAnimeEntry")
    .upsert(
      { user_id: userId, anime_id: animeId, status, score: score }, // Use 'score' as the column name
      { onConflict: "user_id,anime_id" }
    );

  if (upsertEntryError) {
    console.error("Failed to upsert UserAnimeEntry:", upsertEntryError);
    throw upsertEntryError;
  }

  // Revalidate the path to show updated list and the user's anime list
  revalidatePath("/swipe");
  revalidatePath("/user-anime-list"); // Assuming this is the path for the user's anime list
}

export async function getUserAnimeList() {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error("User not authenticated.");
  }
  const userId = user.id;

  const { data: userAnimeEntries, error } = await supabase
    .from("UserAnimeEntry")
    .select(`*, Anime(*)`)
    .eq("user_id", userId);

  if (error) {
    throw error;
  }

  return userAnimeEntries;
}