"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { searchAnime } from "@/app/swipe/actions";
import { AddAnimeDialog } from "@/components/add-anime-dialog";

interface Anime {
  mal_id: number;
  title: string;
  images: {
    jpg: {
      image_url: string;
    };
  };
}

export function AnimeSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Anime[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    setIsSearching(true);
    try {
      const results = await searchAnime(searchTerm);
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching anime:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex w-full max-w-lg items-center space-x-2">
        <Input
          type="search"
          placeholder="Search for anime..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch();
            }
          }}
          className="flex-grow rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
        <Button onClick={handleSearch} disabled={!searchTerm.trim() || isSearching} className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
          {isSearching ? "Searching..." : "Search"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {searchResults.map((anime) => (
          <Card key={anime.mal_id} className="flex flex-col border border-border rounded-lg shadow-sm overflow-hidden bg-card text-card-foreground">
            <CardHeader className="p-0">
              {anime.images?.jpg?.image_url && (
                <div className="relative w-full h-48 sm:h-56 lg:h-64 overflow-hidden">
                  <Image
                    src={anime.images.jpg.image_url}
                    alt={anime.title}
                    fill
                    style={{ objectFit: "cover" }}
                    className="rounded-t-lg transition-transform duration-300 hover:scale-105"
                  />
                </div>
              )}
            </CardHeader>
            <CardContent className="p-4 flex-grow flex flex-col justify-between">
              <CardTitle className="text-lg font-semibold mb-2 line-clamp-2 text-primary">
                {anime.title}
              </CardTitle>
              <AddAnimeDialog anime={anime} onAnimeAdded={() => console.log("Anime added from search!")} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}