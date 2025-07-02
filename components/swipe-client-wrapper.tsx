"use client";

import { UserAnimeList } from "@/components/user-anime-list";
import RecommendationDataFetcher from "@/components/recommendation-data-fetcher";
import { UserAnimeEntry } from "@/lib/types";

interface SwipeClientWrapperProps {
  userAnimeList: UserAnimeEntry[];
  recommendationIds: number[];
  recommendationError: string | null;
}

export default function SwipeClientWrapper({
  userAnimeList,
  recommendationIds,
  recommendationError,
}: SwipeClientWrapperProps) {
  return (
    <div className="flex flex-col md:flex-row min-h-screen py-2 w-full">
      {/* Left Column (Recommendations/Swiping) */}
      <div className="flex-1 border-r border-gray-300 pr-4 flex flex-col items-center justify-center mt-8">
        <h1 className="text-4xl font-bold text-center mb-4">
          Anime Recommendations
        </h1>
        <RecommendationDataFetcher
          userAnimeList={userAnimeList}
          recommendationIds={recommendationIds}
          recommendationError={recommendationError}
        />
      </div>

      {/* Right Column (User Anime List) */}
      <div className="flex-1 pl-4 h-screen overflow-y-auto mt-8">
        <h1 className="text-4xl font-bold text-center mb-4">Your Anime List</h1>
        <UserAnimeList userAnimeList={userAnimeList} />
      </div>
    </div>
  );
}