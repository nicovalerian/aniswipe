"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Card, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { fetchAnimeDetails, AnimeRecommendation } from "@/lib/anime-api";

interface SwipeCardProps {
  animeId: number;
  userAnimeEntry?: {
    status: string;
    score: number | null;
  };
}

export function SwipeCard({ animeId, userAnimeEntry }: SwipeCardProps) {
  const [anime, setAnime] = useState<AnimeRecommendation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getAnimeDetails = async () => {
      try {
        const data = await fetchAnimeDetails(animeId);
        if (data) {
          setAnime(data);
        } else {
          setError("Failed to load anime details.");
        }
      } catch (err) {
        console.error("Error fetching anime details:", err);
        setError("Error loading anime details.");
      } finally {
        setIsLoading(false);
      }
    };

    getAnimeDetails();
  }, [animeId]);

  if (isLoading) {
    return (
      <Card className="relative w-full h-full flex-shrink-0 shadow-lg rounded-xl overflow-hidden text-white flex items-center justify-center">
        <Spinner />
        <p className="ml-2">Loading anime details...</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="relative w-full h-full flex-shrink-0 shadow-lg rounded-xl overflow-hidden text-white flex items-center justify-center bg-red-800 text-center p-4">
        <p className="text-lg">Error: {error}</p>
        <p className="text-sm mt-2">Could not load details for anime ID: {animeId}</p>
      </Card>
    );
  }

  if (!anime) {
    return (
      <Card className="relative w-full h-full flex-shrink-0 shadow-lg rounded-xl overflow-hidden text-white flex items-center justify-center bg-gray-800 text-center p-4">
        <p className="text-lg">No anime data available.</p>
      </Card>
    );
  }

  const shortSynopsis = anime.synopsis?.length > 150 ? anime.synopsis.substring(0, 147) + "..." : anime.synopsis;

  return (
    <Card
      className="relative w-full h-full flex-shrink-0 shadow-lg rounded-xl overflow-hidden text-white"
      tabIndex={0}
      autoFocus
      data-mal-id={anime.mal_id}
    >
      <Image
        src={anime.image_url}
        alt={anime.title}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        style={{ objectFit: "cover" }}
        className="absolute inset-0 z-0"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10" />
      <div className="relative z-20 flex flex-col justify-end h-full p-6">
        <div className="space-y-2">
          <CardTitle className="text-3xl font-bold leading-tight line-clamp-2">{anime.title}</CardTitle>
          {userAnimeEntry ? (
            <>
              <div className="text-md">
                Status: <span className="font-semibold capitalize">{userAnimeEntry.status}</span>
              </div>
              <div className="text-md">
                Your Score: <span className="font-semibold">{userAnimeEntry.score || "N/A"}</span>
              </div>
            </>
          ) : (
            <div className="text-md">
              MAL Score: <span className="font-semibold">{anime.score || "N/A"}</span>
            </div>
          )}
          <div className="flex flex-wrap gap-2 py-2">
            {anime.genres?.slice(0, 3).map((genre) => (
              <span key={genre} className="bg-white/20 text-white text-xs px-3 py-1 rounded-full font-medium">
                {genre}
              </span>
            ))}
          </div>
          <p className="text-sm line-clamp-3">{shortSynopsis}</p>
        </div>
        {!userAnimeEntry && (
          <div className="mt-4 text-center text-xs text-white/70 space-y-1">
            <p>
              <span className="font-semibold">Swipe Right</span> to Add to Planned
            </p>
            <p>
              <span className="font-semibold">Swipe Left</span> to Skip
            </p>
            <p>
              <span className="font-semibold">Swipe Up</span> for More Options
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}