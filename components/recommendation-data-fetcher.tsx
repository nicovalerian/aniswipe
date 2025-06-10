// components/recommendation-data-fetcher.tsx
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { RecommendationSwiper } from "./recommendation-swiper";

export default async function RecommendationDataFetcher() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  let malUsername: string | null = null;
  let error: string | null = null;

  if (user) {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('mal_username')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
      error = "Failed to load user profile.";
    } else if (profile && profile.mal_username) {
      malUsername = profile.mal_username;
    } else {
      error = "MyAnimeList username not found. Please import your MAL list.";
    }
  } else {
    error = "User not authenticated. Please log in.";
  }

  return (
    <>
      {error && <p className="text-red-500">{error}</p>}
      {!error && (
        <RecommendationSwiper malUsername={malUsername} />
      )}
    </>
  );
}