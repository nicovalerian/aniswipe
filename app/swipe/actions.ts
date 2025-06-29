"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

interface AnimeData {
  mal_id: number;
  title: string;
  image_url: string;
}

interface AddAnimeEntryData extends AnimeData {
  status: string;
  score: number | null;
}

interface JikanAnime {
  mal_id: number;
  title: string;
  images: {
    jpg: {
      large_image_url: string;
    };
  };
  synopsis: string;
  score: number;
  genres: { name: string }[];
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
    throw new Error("User not authenticated.");
  }
  const userId = user.id;

  // Check if anime exists in our Anime table, if not, add it
  const { data: animeExists, error: fetchAnimeError } = await supabase
    .from("Anime")
    .select("id")
    .eq("mal_id", mal_id)
    .single();

  let animeId: string;
  if (fetchAnimeError || !animeExists) {
    // Anime does not exist, insert it
    const { data: newAnime, error: insertAnimeError } = await supabase
      .from("Anime")
      .insert({ mal_id, title, image_url })
      .select("id")
      .single();

    if (insertAnimeError || !newAnime) {
      throw insertAnimeError || new Error("Failed to insert new anime.");
    }
    animeId = newAnime.id;
  } else {
    animeId = animeExists.id;
  }

  // Create or update UserAnimeEntry
  const { error: upsertEntryError } = await supabase
    .from("UserAnimeEntry")
    .upsert(
      { user_id: userId, anime_id: animeId, status, user_score: score ?? 0 },
      { onConflict: "user_id,anime_id" }
    );

  if (upsertEntryError) {
    throw upsertEntryError;
  }
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

export async function getRecommendations() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error("User not authenticated.");
  }

  // 1. Get the user's MAL username from their profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("mal_username")
    .eq("id", user.id)
    .single();

  if (profileError || !profile || !profile.mal_username) {
    console.error("Could not find MAL username for the user.", profileError);
    return [];
  }

  const malUsername = profile.mal_username;

  // 2. Call the Python Recommendation API
  try {
    const res = await fetch("http://127.0.0.1:5000/recommend", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: malUsername }),
    });

    if (!res.ok) {
      const errorBody = await res.text();
      throw new Error(
        `Failed to fetch recommendations from Python API: ${res.status} ${res.statusText} - ${errorBody}`
      );
    }

    const data = await res.json();

    // The Python API returns a list of Jikan-like objects. We need to map them.
    return (data.recommendations as JikanAnime[]).map((anime) => ({
      mal_id: anime.mal_id,
      title: anime.title,
      image_url: anime.images?.jpg?.large_image_url,
      synopsis: anime.synopsis,
      score: anime.score,
      genres: anime.genres.map((genre) => genre.name),
    }));
  } catch (error) {
    console.error("Error calling recommendation API:", error);
    return [];
  }
}