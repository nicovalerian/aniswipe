import Navbar from "@/components/navbar";
import { getUserAnimeList } from "./actions";
import { getRecommendations } from "@/lib/recommendation-api";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import SwipeClientWrapper from "@/components/swipe-client-wrapper";
import { UserAnimeEntry } from "@/lib/types";

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
    <>
      <Navbar />
      <SwipeClientWrapper
        userAnimeList={userAnimeList}
        recommendationIds={recommendationIds}
        recommendationError={recommendationError}
      />
    </>
  );
}