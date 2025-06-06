"use client";

import React, { useEffect, useState, useMemo } from "react";
import { getRecommendations, addAnimeToList } from "@/app/swipe/actions";
import { useRecommendationStore } from "@/stores/recommendation-store";
import { SwipeCard } from "./swipe-card";
import TinderCard from "react-tinder-card";
import { AddAnimeDialog } from "./add-anime-dialog";

interface AnimeRecommendation {
  mal_id: number;
  title: string;
  image_url: string;
  synopsis: string;
  score: number;
  genres: string[];
}

export function RecommendationSwiper() {
  const { recommendations, setRecommendations, getNextAnime } = useRecommendationStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lastDirection, setLastDirection] = useState<string>();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedAnime, setSelectedAnime] = useState<AnimeRecommendation | null>(null);

  useEffect(() => {
    const fetchAndSetRecommendations = async () => {
      const initialRecommendations = await getRecommendations();
      setRecommendations(initialRecommendations);
    };
    fetchAndSetRecommendations();
  }, [setRecommendations]);

  const characters = useMemo(
    () => recommendations.slice(currentIndex),
    [recommendations, currentIndex]
  );

  const onSwipe = async (direction: string, anime: AnimeRecommendation) => {
    setLastDirection(direction);
    setSelectedAnime(anime);

    if (direction === "right") {
      await addAnimeToList({
        mal_id: anime.mal_id,
        title: anime.title,
        image_url: anime.image_url,
        status: "planned",
        score: null,
      });
    } else if (direction === "up") {
      setShowAddDialog(true);
    }

    const nextAnime = getNextAnime();
    if (nextAnime) {
      setCurrentIndex((prevIndex) => prevIndex + 1);
    }
  };

  const onCardLeftScreen = (direction: string, mal_id: number) => {
    console.log(mal_id + " left the screen to the " + direction);
    // Here we can fetch more recommendations if the queue is low
  };

  const handleDialogClose = () => {
    setShowAddDialog(false);
    setSelectedAnime(null);
  };

  return (
    <div className="relative flex justify-center items-center w-full h-[500px]">
      {recommendations.length > 0 ? (
        characters.map((anime) => (
          <TinderCard
            key={anime.mal_id}
            onSwipe={(dir) => onSwipe(dir, anime)}
            onCardLeftScreen={(dir) => onCardLeftScreen(dir, anime.mal_id)}
            preventSwipe={["down"]}
            className="absolute"
          >
            <SwipeCard {...anime} />
          </TinderCard>
        ))
      ) : (
        <p>No more recommendations for now. Check back later!</p>
      )}

      {lastDirection && (
        <h2 className="absolute bottom-0 text-xl font-bold">You swiped {lastDirection}</h2>
      )}

      {selectedAnime && (
        <AddAnimeDialog
          open={showAddDialog}
          onOpenChange={setShowAddDialog}
          mal_id={selectedAnime.mal_id}
          title={selectedAnime.title}
          image_url={selectedAnime.image_url}
          onAnimeAdded={handleDialogClose}
        />
      )}
    </div>
  );
}