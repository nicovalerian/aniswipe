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

interface Anime {
  mal_id: number;
  title: string;
  images: {
    jpg: {
      image_url: string;
    };
  };
}

interface AddAnimeDialogProps {
  anime: Anime; // Change to accept an anime object
  onAnimeAdded: () => void;
}

export function AddAnimeDialog({ anime, onAnimeAdded }: AddAnimeDialogProps) {
  const [status, setStatus] = useState("Planned");
  const [score, setScore] = useState(0); // Initialize with a default score
  const [open, setOpen] = useState(false); // Manage dialog open state internally

  const handleAddToList = async () => {
    try {
      await addAnimeToList({
        mal_id: anime.mal_id,
        title: anime.title,
        image_url: anime.images.jpg.image_url,
        status,
        score,
      });
      console.log("Anime added to list successfully!");
      onAnimeAdded(); // Call the callback
      setOpen(false); // Close the dialog on success
    } catch (error) {
      console.error("Error adding anime to list:", error);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button className="w-full">Add to List</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Add {anime.title} to your list?</AlertDialogTitle>
          <AlertDialogDescription>
            Set the status and your score for this anime.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Status
            </Label>
            <Select onValueChange={setStatus} defaultValue="Planned">
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Planned">Planned</SelectItem>
                <SelectItem value="Watching">Watching</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Dropped">Dropped</SelectItem>
              </SelectContent>
            </Select>
          </div>
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