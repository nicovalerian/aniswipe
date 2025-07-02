"use client";

import { useState } from "react";
import { UserAnimeList } from "@/components/user-anime-list";
import RecommendationDataFetcher from "@/components/recommendation-data-fetcher";
import { UserAnimeEntry, AnimeRecommendation } from "@/lib/types";
import { searchAnime } from "@/app/swipe/actions"; // Relative import for action
import { RecommendationSwiper } from "@/components/recommendation-swiper";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";



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
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<AnimeRecommendation[]>([]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() === "") {
      setSearchResults([]);
      return;
    }
    const results = await searchAnime(searchQuery);
    setSearchResults(results);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
  };

  return (
    <div className="flex min-h-screen py-2">
      {/* Left Column (Recommendations/Swiping/Search) */}
      <div className="flex-1 border-r border-gray-300 pr-4 flex flex-col items-center justify-center mt-8">
        <h1 className="text-4xl font-bold text-center mb-4">
          {searchResults.length > 0 ? "Search Results" : "Anime Recommendations"}
        </h1>
        <form onSubmit={handleSearch} className="flex w-full max-w-sm items-center space-x-2 mb-4">
          <Input
            type="text"
            placeholder="Search anime..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          {searchQuery && (
            <Button variant="ghost" size="icon" onClick={clearSearch}>
              <X className="h-4 w-4" />
            </Button>
          )}
          <Button type="submit">Search</Button>
        </form>

        {searchResults.length > 0 ? (
          <RecommendationSwiper
            recommendationIds={searchResults.map((anime) => anime.mal_id)}
            userAnimeList={userAnimeList}
          />
        ) : (
          <RecommendationDataFetcher
            userAnimeList={userAnimeList}
            recommendationIds={recommendationIds}
            recommendationError={recommendationError}
          />
        )}
      </div>

      {/* Right Column (User Anime List) */}
      <div className="flex-1 pl-4 h-screen overflow-y-auto mt-8">
        <h1 className="text-4xl font-bold text-center mb-4">Your Anime List</h1>
        <UserAnimeList userAnimeList={userAnimeList} />
      </div>
    </div>
  );
}