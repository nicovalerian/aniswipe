import Navbar from "@/components/navbar";
import { getUserAnimeList } from "./actions";
import { getRecommendations } from "@/lib/recommendation-api";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import SwipeClientWrapper from "@/components/swipe-client-wrapper";
import { UserAnimeEntry } from "@/lib/types";
import Image from "next/image"; // Add Image import
import animeImage from "../kokou no hito.jpg"; // Add animeImage import

export default async function SwipePage() {
  let userAnimeList: UserAnimeEntry[] = [];
  try {
    userAnimeList = await getUserAnimeList();
  } catch (error) {
    console.error("Failed to fetch user anime list:", error);
  }

  let recommendationIds: number[] = [];
  let recommendationError: string | null = null;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('mal_username')
      .eq('id', user.id)
      .single();

    if (profileError) {
      if (profileError.code !== 'PGRST116') {
        recommendationError = "Failed to load user profile.";
      }
    } else if (profile && profile.mal_username) {
      try {
        const formattedUserAnimeList = userAnimeList.map(item => ({
          mal_id: item.Anime.mal_id,
          score: item.score,
        }));
        recommendationIds = await getRecommendations(profile.mal_username, formattedUserAnimeList);
      } catch (error) {
        recommendationError = `Failed to fetch recommendations: ${(error as Error).message}`;
      }
    } else {
      recommendationError = "MAL Username not found. Please update your profile.";
    }
  } else {
    recommendationError = "User not authenticated. Please log in.";
  }

  return (
    <div className="relative min-h-screen flex flex-col text-white font-sans overflow-hidden">
      <Image
        src={animeImage}
        alt="Anime landscape background"
        fill
        className="object-cover"
        style={{ zIndex: -2 }}
      />
      <div
        className="absolute inset-0 bg-gradient-to-br from-purple-900/80 via-pink-900/70 to-blue-900/80"
        style={{ zIndex: -1 }}
      />
      <Navbar />
      <main className="relative z-10 flex flex-col md:flex-row items-start justify-center flex-grow p-4 gap-8 mx-auto w-full">
        <div className="flex-1 min-w-[300px]">
          <SwipeClientWrapper
            userAnimeList={userAnimeList}
            recommendationIds={recommendationIds}
            recommendationError={recommendationError}
          />
        </div>
      </main>
    </div>
  );
}