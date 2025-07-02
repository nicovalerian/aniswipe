"use client";

import Image from "next/image";
import animeImage from "../kokou no hito.jpg";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { fetchMalAnimeList, confirmImport } from "./actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Spinner } from "@/components/ui/spinner";
import { ArrowLeft } from "lucide-react";

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
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <Image
        src={animeImage}
        alt="Anime background"
        fill
        className="object-cover"
        style={{ zIndex: -2 }}
      />
      <div
        className="absolute inset-0 bg-gradient-to-br from-purple-900/90 via-pink-900/80 to-blue-900/90"
        style={{ zIndex: -1 }}
      />

      {/* Back to home */}
      <Link
        href="/"
        className="absolute top-6 left-6 z-20 flex items-center space-x-2 text-white hover:text-purple-300 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Home</span>
      </Link>

      <Card className="w-full max-w-md bg-white/10 backdrop-blur-md border-white/20 text-white m-4">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-white">Import MyAnimeList Profile</CardTitle>
          <CardDescription className="text-gray-300">Enter your MyAnimeList username to import your anime list.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleFetchList} className="flex space-x-2 mb-4">
            <Input
              type="text"
              placeholder="MAL Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-400"
            />
            <Button
              type="submit"
              disabled={loading}
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 px-8 py-3 text-lg bg-transparent"
            >
              {loading ? "Fetching..." : "Fetch List"}
            </Button>
          </form>

          {error && <p className="text-red-400 text-sm text-center mb-4">{error}</p>}
          {importSuccess && (
            <p className="text-green-400 text-sm text-center mb-4">
              Your MyAnimeList profile has been successfully imported!
            </p>
          )}

          <AlertDialog open={loading}>
            <AlertDialogContent className="bg-gray-800/95 backdrop-blur-md border-white/20 text-white">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-white">Fetching Data...</AlertDialogTitle>
                <AlertDialogDescription className="text-gray-300">
                  Please wait while we fetch your MyAnimeList profile. This may
                  take a moment.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="flex justify-center py-4">
                <Spinner size="lg" />
              </div>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>

      {animeList.length > 0 && (
        <div className="w-full max-w-4xl mt-8">
          <h2 className="text-2xl font-bold mb-4 text-white">Fetched Anime List</h2>
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-4">
            <Button
              onClick={handleConfirmImport}
              disabled={loading}
              size="lg"
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
            >
              {loading ? "Saving..." : "Confirm Import"}
            </Button>
            <p className="text-gray-300 text-sm">
              Warning: This will override your current AniSwipe list.
            </p>
          </div>
<div className="max-h-[calc(100vh-400px)] overflow-y-auto p-4 rounded-lg bg-white/5 backdrop-blur-sm mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {animeList.map((anime, index) => (
                <div
                  key={anime.node.id}
                  className="relative overflow-hidden rounded-lg aspect-[2/3] group"
                >
                  <Image
                    src={
                      anime.node.main_picture?.large ||
                      anime.node.main_picture?.medium ||
                      `https://via.placeholder.com/225x320.png?text=${encodeURIComponent(
                        anime.node.title
                      )}`
                    }
                    alt={anime.node.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    priority={index < 6}
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end text-white p-4">
                    <h3 className="text-lg font-bold mb-2 line-clamp-2">
                      {anime.node.title}
                    </h3>
                    <div className="flex items-center gap-x-2 flex-wrap">
                      <Badge
                        variant={(() => {
                          switch (anime.list_status.status) {
                            case "completed":
                              return "outline";
                            case "plan_to_watch":
                              return "default"; // Use default for plan_to_watch for better consistency, it's typically a light blue/gray
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
                            : anime.list_status.status === "plan_to_watch"
                              ? "bg-blue-500 text-white border-transparent"
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
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
