"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { AnimeSearch } from "@/components/anime-search";
import { UserAnimeList } from "@/components/user-anime-list";
import { RecommendationSwiper } from "@/components/recommendation-swiper";

export default function SwipePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
      } else {
        setLoading(false);
      }
    };
    checkUser();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen py-2">
      {/* Left Column (Recommendations/Swiping) */}
      <div className="flex-1 border-r border-gray-300 pr-4 flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold text-center mb-4">Anime Recommendations</h1>
        <RecommendationSwiper />
      </div>

      {/* Right Column (User Anime List) */}
      <div className="flex-1 pl-4">
        <h1 className="text-4xl font-bold text-center mb-4">Your Anime List</h1>
        <AnimeSearch />
        <UserAnimeList />
      </div>
    </div>
  );
}