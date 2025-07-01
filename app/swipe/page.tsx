import { UserAnimeList } from "@/components/user-anime-list";
import RecommendationDataFetcher from "@/components/recommendation-data-fetcher"; // Import the new Server Component

export default function SwipePage() {
  return (
    <div className="flex min-h-screen py-2">
      {/* Left Column (Recommendations/Swiping) */}
      <div className="flex-1 border-r border-gray-300 pr-4 flex flex-col items-center justify-center mt-8">
        <h1 className="text-4xl font-bold text-center mb-4">Anime Recommendations</h1>
        <RecommendationDataFetcher /> {/* Render the new Server Component here */}
      </div>

      {/* Right Column (User Anime List) */}
      <div className="flex-1 pl-4 h-screen overflow-y-auto mt-8">
        <h1 className="text-4xl font-bold text-center mb-4">Your Anime List</h1>
        <UserAnimeList />
      </div>
    </div>
  );
}