"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { fetchMalAnimeList, confirmImport } from "./actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Spinner } from "@/components/ui/spinner"; // Assuming a Spinner component exists or will be created

interface MalAnimeEntry {
  node: {
    id: number;
    title: string;
    main_picture?: {
      medium: string;
      large: string;
    };
  };
  list_status: {
    status: string;
    score: number;
  };
}

export default function ImportMalPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [animeList, setAnimeList] = useState<MalAnimeEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [importSuccess, setImportSuccess] = useState(false);

  const handleFetchList = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setAnimeList([]);
    setImportSuccess(false);

    try {
      const data = await fetchMalAnimeList(username);
      setAnimeList(data);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmImport = async () => {
    setLoading(true);
    setError("");

    try {
      await confirmImport(animeList, username);
      setImportSuccess(true);
      setAnimeList([]); // Clear list after successful import
      setTimeout(() => {
        router.push("/swipe");
      }, 2000);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

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
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Import MyAnimeList Profile</h1>
      <p className="mb-4">Enter your MyAnimeList username to import your anime list.</p>
      <form onSubmit={handleFetchList} className="flex space-x-2 mb-4">
        <Input
          type="text"
          placeholder="MAL Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={loading}
        />
        <Button type="submit" disabled={loading} variant="outline">
          {loading ? "Fetching..." : "Fetch List"}
        </Button>
      </form>

      {error && <p className="text-destructive mb-4">{error}</p>}
      {importSuccess && (
        <p className="text-primary mb-4">
          Your MyAnimeList profile has been successfully imported!
        </p>
      )}

      <AlertDialog open={loading}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Fetching Data...</AlertDialogTitle>
            <AlertDialogDescription>
              Please wait while we fetch your MyAnimeList profile. This may take a moment.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-center py-4">
            <Spinner size="lg" /> {/* Use the Spinner component */}
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {animeList.length > 0 && (
        <>
          <h2 className="text-2xl font-semibold mb-4">Fetched Anime List</h2>
          <div className="flex items-center space-x-4 mb-4">
            <Button onClick={handleConfirmImport} disabled={loading} size="lg" variant="outline">
              {loading ? "Saving..." : "Confirm Import"}
            </Button>
            <p className="text-muted-foreground text-sm">
              Warning: This will override your current AniSwipe list.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {animeList.map((anime, index) => (
              <div key={anime.node.id} className="relative overflow-hidden rounded-lg aspect-[2/3]">
                <Image
                  src={anime.node.main_picture?.large || anime.node.main_picture?.medium || `https://via.placeholder.com/225x320.png?text=${encodeURIComponent(anime.node.title)}`}
                  alt={anime.node.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  priority={index < 6} // Prioritize loading images for the first few items
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end text-white">
                  <div className="flex flex-col p-4">
                    <h3 className="text-lg font-bold mb-2 line-clamp-2">{anime.node.title}</h3>
                    <div className="flex items-center gap-x-2">
                      <Badge
                        variant={(() => {
                          switch (anime.list_status.status) {
                            case "completed":
                              return "outline";
                            case "plan_to_watch":
                              return "plan_to_watch";
                            case "dropped":
                              return "destructive";
                            case "watching":
                            case "on_hold":
                            default:
                              return "default";
                          }
                        })()}
                        className={
                          anime.list_status.status === "completed"
                            ? "bg-zinc-200 text-zinc-900 border-transparent"
                            : ""
                        }
                      >
                        {formatStatus(anime.list_status.status)}
                      </Badge>
                      {anime.list_status.score > 0 && (
                        <Badge
                          style={getScoreColor(anime.list_status.score)}
                          className="text-white border-transparent"
                        >
                          Score: {anime.list_status.score}/10
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}