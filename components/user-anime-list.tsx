"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { getUserAnimeList } from "@/app/swipe/actions";
import { Badge } from "@/components/ui/badge";
import { useRecommendationStore } from "@/stores/recommendation-store"; // Import the store

interface UserAnimeEntry {
  anime_id: string;
  status: string;
  score: number;
  Anime: {
    mal_id: number;
    title: string;
    image_url: string;
  };
}

export function UserAnimeList() {
  const [animeList, setAnimeList] = useState<UserAnimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { userListRefreshTrigger } = useRecommendationStore(); // Get the refresh trigger

  useEffect(() => {
    fetchUserList();
  }, [userListRefreshTrigger]); // Add userListRefreshTrigger to dependencies

  const fetchUserList = async () => {
    setLoading(true);
    try {
      const list = await getUserAnimeList();
      setAnimeList(list || []);
    } catch (error) {
      console.error("Error fetching user anime list:", error);
      setAnimeList([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center">Loading your anime list...</div>;
  }

  if (animeList.length === 0) {
    return (
      <div className="text-center p-8 border border-dashed border-border rounded-lg bg-muted/20 text-muted-foreground">
        <p className="text-lg font-semibold mb-2">Your list is empty!</p>
        <p className="text-sm">Start by swiping, searching for an anime above, or importing your MAL profile!</p>
      </div>
    );
  }

  const formatStatus = (status: string) => {
    return status
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const getScoreColor = (score: number) => {
    if (score >= 0 && score <= 5) {
      return { backgroundColor: "hsl(0, 70%, 50%)" }; // Red
    }
    if (score >= 6 && score <= 7) {
      return { backgroundColor: "hsl(40, 90%, 50%)" }; // Greenish-Orange
    }
    if (score >= 8 && score <= 10) {
      return { backgroundColor: "hsl(120, 60%, 45%)" }; // Green
    }
    return {}; // No color for unscored or out of range
  };

  return (
    <div className="mt-8 overflow-y-auto h-[calc(100vh-250px)]"> {/* Adjust height as needed */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {animeList.filter(entry => entry.Anime).map((entry, index) => (
          <div key={entry.anime_id} className="relative overflow-hidden rounded-lg aspect-[2/3]">
            <Image
              src={entry.Anime.image_url}
              alt={entry.Anime.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              priority={index < 6} // Prioritize loading images for the first few items
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end text-white">
              <div className="flex flex-col p-4">
                <h3 className="text-lg font-bold mb-2 line-clamp-2">{entry.Anime.title}</h3>
                <div className="flex items-center gap-x-2">
                  <Badge
                    variant={(() => {
                      switch (entry.status) {
                        case "completed":
                          return "outline";
                        case "plan_to_watch":
                          return "secondary";
                        case "dropped":
                          return "destructive";
                        case "watching":
                        case "on_hold":
                        default:
                          return "default";
                      }
                    })()}
                    className={
                      entry.status === "completed"
                        ? "bg-zinc-200 text-zinc-900 border-transparent"
                        : ""
                    }
                  >
                    {formatStatus(entry.status)}
                  </Badge>
                  {entry.score > 0 && (
                    <Badge
                      style={getScoreColor(entry.score)}
                      className="text-white border-transparent"
                    >
                      Score: {entry.score}/10
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}