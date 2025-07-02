"use client"; // Make it a client component
// components/recommendation-data-fetcher.tsx
import { RecommendationSwiper } from "./recommendation-swiper";
import { Spinner } from "./ui/spinner";

interface UserAnimeEntry {
  anime_id: number;
  status: string;
  score: number | null;
  Anime: {
    mal_id: number;
    title: string;
    image_url: string;
  };
}

interface RecommendationDataFetcherProps {
  userAnimeList: UserAnimeEntry[];
  recommendationIds: number[];
  recommendationError: string | null;
}

export default function RecommendationDataFetcher({
  userAnimeList,
  recommendationIds,
  recommendationError,
}: RecommendationDataFetcherProps) {

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-4">
      {!recommendationIds.length && !recommendationError && (
        <div className="text-center">
          <Spinner />
          <p className="mt-2 text-lg text-white">Loading recommendations...</p>
        </div>
      )}
      {recommendationError && <p className="text-red-500 text-lg">{recommendationError}</p>}
      {!recommendationError && recommendationIds.length > 0 && (
        <RecommendationSwiper recommendationIds={recommendationIds} userAnimeList={userAnimeList} />
      )}
      {!recommendationError && recommendationIds.length === 0 && (
        <p className="text-lg text-white">No recommendations available.</p>
      )}
    </div>
  );
}