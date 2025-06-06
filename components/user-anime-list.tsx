"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { getUserAnimeList } from "@/app/swipe/actions";

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

  useEffect(() => {
    fetchUserList();
  }, []);

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

  return (
    <div className="mt-8 overflow-y-auto h-[calc(100vh-250px)]"> {/* Adjust height as needed */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {animeList.map((entry) => (
          <Card key={entry.anime_id} className="flex flex-col border border-border rounded-lg shadow-sm overflow-hidden bg-card text-card-foreground">
            <CardHeader className="p-0">
              {entry.Anime.image_url && (
                <div className="relative w-full h-48 sm:h-56 lg:h-64 overflow-hidden">
                  <Image
                    src={entry.Anime.image_url}
                    alt={entry.Anime.title}
                    fill
                    style={{ objectFit: "cover" }}
                    className="rounded-t-lg transition-transform duration-300 hover:scale-105"
                  />
                </div>
              )}
            </CardHeader>
            <CardContent className="p-4 flex-grow">
              <CardTitle className="text-lg font-semibold mb-2 line-clamp-2 text-primary">
                {entry.Anime.title}
              </CardTitle>
              <p className="text-sm text-muted-foreground">Status: <span className="font-medium text-foreground">{entry.status}</span></p>
              <p className="text-sm text-muted-foreground">Score: <span className="font-medium text-foreground">{entry.score}/10</span></p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}