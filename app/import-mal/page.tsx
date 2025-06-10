"use client";

import Image from "next/image";
import { useState } from "react";
import { fetchMalAnimeList, confirmImport } from "./actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    main_picture: {
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
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
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
        <Button type="submit" disabled={loading}>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {animeList.map((anime) => (
              <Card key={anime.node.id} className="flex flex-col">
                <CardHeader className="flex-shrink-0">
                  <CardTitle className="text-lg">{anime.node.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col flex-grow">
                  <a
                    href={`https://myanimelist.net/anime/${anime.node.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block mb-2 overflow-hidden rounded-md flex-shrink-0"
                  >
                    <Image
                      src={anime.node.main_picture.large || anime.node.main_picture.medium}
                      alt={anime.node.title}
                      width={225}
                      height={320}
                      className="w-full h-auto object-cover transition-transform duration-200 hover:scale-105"
                    />
                  </a>
                  <p className="text-sm">
                    <strong className="font-semibold">Score:</strong> {anime.list_status.score || "N/A"}
                  </p>
                  <p className="text-sm">
                    <strong className="font-semibold">Status:</strong> {anime.list_status.status}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            <Button onClick={handleConfirmImport} disabled={loading}>
              {loading ? "Saving..." : "Confirm Import"}
            </Button>
            <p className="text-muted-foreground text-sm">
              Warning: This will override your current AniSwipe list.
            </p>
          </div>
        </>
      )}
    </div>
  );
}