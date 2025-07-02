"use client";

import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger, // Re-add this import
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button"; // Re-add this import
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { addAnimeToList } from "@/app/swipe/actions";

import { fetchAnimeDetails, AnimeRecommendation } from "@/lib/anime-api";
import { toast } from "sonner";
import { Spinner } from "./ui/spinner";

interface AddAnimeDialogProps {
  animeId: number | null; // Change to accept animeId
  onAnimeAdded: () => void;
}

export function AddAnimeDialog({ animeId, onAnimeAdded }: AddAnimeDialogProps) {
  const [status, setStatus] = useState("plan_to_watch");
  const [score, setScore] = useState(0); // Initialize with a default score
  const [open, setOpen] = useState(false); // Manage dialog open state internally
  const [fetchedAnime, setFetchedAnime] = useState<AnimeRecommendation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (animeId) {
      setOpen(true); // Open dialog when animeId is provided
      setIsLoading(true);
      setError(null);
      fetchAnimeDetails(animeId)
        .then((data) => {
          if (data) {
            setFetchedAnime(data);
          } else {
            setError("Failed to load anime details.");
          }
        })
        .catch((err) => {
          console.error("Error fetching anime details:", err);
          setError("Error loading anime details.");
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setOpen(false); // Close dialog if animeId is null
      setFetchedAnime(null);
    }
  }, [animeId]);

  const handleAddToList = async () => {
    if (!fetchedAnime) {
      toast.error("Anime details not loaded yet. Please try again.");
      return;
    }
    try {
      await addAnimeToList({
        mal_id: fetchedAnime.mal_id,
        title: fetchedAnime.title,
        image_url: fetchedAnime.image_url,
        status,
        score,
      });
      toast.success(`Added "${fetchedAnime.title}" to your list!`);
      onAnimeAdded(); // Call the callback
      setOpen(false); // Close the dialog on success
    } catch (error) {
      console.error("Error adding anime to list:", error);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button className="px-8 bg-slate-700 hover:bg-slate-600">Add to List</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Add {fetchedAnime?.title || "Anime"} to your list?</AlertDialogTitle>
          <AlertDialogDescription>
            Set the status and your score for this anime.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Status
            </Label>
            <Select onValueChange={setStatus} defaultValue="plan_to_watch">
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="plan_to_watch">Plan to Watch</SelectItem>
                <SelectItem value="watching">Watching</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="dropped">Dropped</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {status === "completed" && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="score" className="text-right">
                Score: {score}
              </Label>
              <Slider
                id="score"
                min={0}
                max={10}
                step={1}
                value={[score]}
                onValueChange={(val) => setScore(val[0])}
                className="col-span-3"
              />
            </div>
          )}
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleAddToList}>
            Add to List
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}