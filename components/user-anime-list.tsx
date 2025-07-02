"use client";

import React, { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { getUserAnimeList, searchAnime } from "@/app/swipe/actions";
import { Badge } from "@/components/ui/badge";
import { useRecommendationStore } from "@/stores/recommendation-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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

import { UserAnimeEntry } from "@/lib/types";

interface UserAnimeListProps {
  userAnimeList: UserAnimeEntry[];
}

export function UserAnimeList({ userAnimeList: initialUserAnimeList }: UserAnimeListProps) {
  const [animeList, setAnimeList] = useState<UserAnimeEntry[]>(initialUserAnimeList);
  const [loading, setLoading] = useState(false); // No longer loading initially as data comes from props
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Anime[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedAnimeId, setSelectedAnimeId] = useState<number | null>(null);
  const { userListRefreshTrigger } = useRecommendationStore();

  useEffect(() => {
    // If the prop changes, update the internal state
    setAnimeList(initialUserAnimeList);
  }, [initialUserAnimeList]);

  useEffect(() => {
    // This effect can still be used for client-side search clearing if needed
    if (searchTerm.trim() === "") {
      setSearchResults([]);
    }
  }, [searchTerm]);

  // Remove fetchUserList as data is passed via props.
  // The fetchUserList function now refers to refreshing the list after an action.
  const refreshUserList = async () => {
    setLoading(true);
    try {
      const list = await getUserAnimeList(); // Call server action to get updated list
      setAnimeList(list || []);
    } catch (error) {
      console.error("Error fetching user anime list:", error);
      setAnimeList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userListRefreshTrigger) {
      refreshUserList(); // Trigger refresh if something in store indicates a change
    }
  }, [userListRefreshTrigger]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }
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

  const formatStatus = (status: string) => {
    if (status === "plan_to_watch" || status === "planned") {
      return "Plan to Watch";
    }
    return status
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const getScoreColor = (score: number) => {
    if (score >= 0 && score <= 5) return { backgroundColor: "hsl(0, 70%, 50%)" };
    if (score >= 6 && score <= 7) return { backgroundColor: "hsl(40, 90%, 50%)" };
    if (score >= 8 && score <= 10) return { backgroundColor: "hsl(120, 60%, 45%)" };
    return {};
  };

  const displayList = useMemo(() => {
    if (searchTerm.trim() && searchResults.length > 0) {
      return searchResults.map(anime => ({
        anime_id: `search-${anime.mal_id}`,
        status: 'search_result',
        score: 0,
        Anime: {
          mal_id: anime.mal_id,
          title: anime.title,
          image_url: anime.images.jpg.image_url,
        },
      }));
    }
    return animeList;
  }, [animeList, searchResults, searchTerm]);

  if (loading && animeList.length === 0) {
    return <div className="text-center mt-8">Loading your anime list...</div>;
  }

  return (
    <div className="mt-8">
      <div className="flex w-full max-w-lg items-center space-x-2 mb-4">
        <Input
          type="search"
          placeholder="Search for anime..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="flex-grow"
        />
        <Button onClick={handleSearch} disabled={isSearching}>
          {isSearching ? "Searching..." : "Search"}
        </Button>
      </div>

      {displayList.length === 0 && searchTerm.trim() && !isSearching && (
        <div className="text-center p-8">
          <p className="text-lg font-semibold">No results found for &quot;{searchTerm}&quot;</p>
        </div>
      )}

      {displayList.length === 0 && !searchTerm.trim() && !loading && (
         <div className="text-center p-8 border border-dashed border-border rounded-lg bg-muted/20 text-muted-foreground">
           <p className="text-lg font-semibold mb-2">Your list is empty!</p>
           <p className="text-sm">Start by swiping, searching for an anime above, or importing your MAL profile!</p>
         </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayList.filter(entry => entry.Anime).map((entry, index) => (
          <div key={entry.anime_id} className="relative overflow-hidden rounded-lg aspect-[2/3]">
            <Image
              src={entry.Anime.image_url}
              alt={entry.Anime.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              priority={index < 6}
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end text-white">
              <div className="flex flex-col p-4">
                <h3 className="text-lg font-bold mb-2 line-clamp-2">{entry.Anime.title}</h3>
                <div className="flex items-center gap-x-2">
                  {entry.status === 'search_result' ? (
                    <div className="flex justify-center w-full">
                      <Button
                        onClick={() => setSelectedAnimeId(entry.Anime.mal_id)}
                        disabled={animeList.some(item => item.Anime.mal_id === entry.Anime.mal_id)}
                      >
                        Add to List
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Badge
                        variant={(() => {
                          switch (entry.status) {
                            case "completed": return "completed";
                            case "plan_to_watch":
                            case "planned":
                              return "plan_to_watch";
                            case "watching": return "watching";
                            case "dropped": return "destructive";
                            default: return "default";
                          }
                        })()}
                      >
                        {formatStatus(entry.status)}
                      </Badge>
                      {(entry.score !== null && entry.score > 0) && (
                        <Badge style={getScoreColor(entry.score)} className="text-white border-transparent">
                          Score: {entry.score}/10
                        </Badge>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedAnimeId !== null && (
        <AddAnimeDialog
          animeId={selectedAnimeId}
          onAnimeAdded={() => {
            refreshUserList();
            setSelectedAnimeId(null); // Close the dialog after adding
          }}
          onClose={() => setSelectedAnimeId(null)} // Allow dialog to close itself
        />
      )}
    </div>
  );
}