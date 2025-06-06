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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
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

interface AddAnimeDialogProps {
  mal_id: number;
  title: string;
  image_url: string;
  onAnimeAdded: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddAnimeDialog({
  mal_id,
  title,
  image_url,
  onAnimeAdded,
  open,
  onOpenChange,
}: AddAnimeDialogProps) {
  const [status, setStatus] = useState("Planned");
  const [score, setScore] = useState(0); // Initialize with a default score

  const handleAddToList = async () => {
    try {
      await addAnimeToList({
        mal_id,
        title,
        image_url,
        status,
        score,
      });
      // Optionally, add a success message or trigger a refresh of the user's list
      console.log("Anime added to list successfully!");
    } catch (error) {
      console.error("Error adding anime to list:", error);
      // Optionally, display an error message
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Add {title} to your list?</AlertDialogTitle>
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
          <AlertDialogAction
            onClick={() => {
              handleAddToList();
              onAnimeAdded();
            }}
          >
            Add to List
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}