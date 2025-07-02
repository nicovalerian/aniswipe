// components/recommendation-data-fetcher.tsx
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { RecommendationSwiper } from "./recommendation-swiper";
import { getUserAnimeList } from "@/app/swipe/actions";
import { getRecommendations } from "@/lib/recommendation-api";
import { AnimeRecommendation } from "@/lib/anime-api";
import { Spinner } from "./ui/spinner"; // Assuming you have a Spinner component

export default async function RecommendationDataFetcher() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  let malUsername: string | null = null;
  let error: string | null = null;
  let recommendationIds: number[] = [];
  let isLoading = true; // Start as loading

  if (user) {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('mal_username')
      .eq('id', user.id)
      .single();

    if (profileError) {
      if (profileError.code !== 'PGRST116') {
        error = "Failed to load user profile.";
      }
    } else if (profile) {
      malUsername = profile.mal_username;
    }

    if (malUsername) {
      try {
        const userAnimeList = await getUserAnimeList();
        recommendationIds = await getRecommendations(malUsername, userAnimeList);
      } catch (e) {
        error = "Failed to fetch recommendations.";
      }
    } else {
      error = "MAL Username not found. Please update your profile.";
    }
  } else {
    error = "User not authenticated. Please log in.";
  }

  isLoading = false; // Finished loading

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-4">
      {isLoading && (
        <div className="text-center">
          <Spinner />
          <p className="mt-2 text-lg text-white">Loading recommendations...</p>
        </div>
      )}
      {!isLoading && error && <p className="text-red-500 text-lg">{error}</p>}
      {!isLoading && !error && (
        <RecommendationSwiper recommendationIds={recommendationIds} />
      )}
    </div>
  );
}