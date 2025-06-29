"use client";

import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { addAnimeToList } from "@/app/swipe/actions";
import { useRecommendationStore } from "@/stores/recommendation-store";
import { SwipeCard } from "./swipe-card";
import { AddAnimeDialog } from "./add-anime-dialog";
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/effect-cards';
import { EffectCards } from 'swiper/modules';
import { AnimeRecommendation } from "@/lib/anime-api"; // Import AnimeRecommendation


interface RecommendationSwiperProps {
  malUsername: string | null;
}

export function RecommendationSwiper({ malUsername }: RecommendationSwiperProps) {
  const { recommendations, setRecommendations, removeTopRecommendation } =
    useRecommendationStore();
  const [lastDirection, setLastDirection] = useState<string>();
  const [selectedAnime, setSelectedAnime] =
    useState<AnimeRecommendation | null>(null);
  const swiperRef = useRef<import('swiper/types').Swiper | null>(null); // Ref for Swiper instance

  // Initialize recommendations from props
  useEffect(() => {
    setRecommendations(malUsername);
  }, [malUsername, setRecommendations]);

  const handleSwipe = useCallback(
    async (direction: string, anime: AnimeRecommendation) => {
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
        // The AddAnimeDialog now manages its own open state, so no need to set showAddDialog here
      }
      // The store will be updated by the Swiper's onSlideChange event, but only when the slide actually advances.
    },
    [setSelectedAnime, setLastDirection]
  );

  const handleDialogClose = () => {
    setSelectedAnime(null); // Clear selected anime when dialog is closed
  };

  const handleKeyDown = useCallback(async (event: KeyboardEvent) => {
    if (!swiperRef.current || recommendations.length === 0) return;

    const currentAnime = recommendations[0]; // Assuming the first item is the current one

    let direction = "";
    if (event.key === "ArrowRight") { // User wants to "like" (visual swipe right)
      direction = "right";
      swiperRef.current.slideNext(); // Always advance the card
    } else if (event.key === "ArrowLeft") { // User wants to "skip" (visual swipe left)
      direction = "left";
      swiperRef.current.slideNext(); // Always advance the card
    } else if (event.key === "ArrowUp") {
      direction = "up";
      // Swiper doesn't have a direct "up" swipe, so we'll just trigger the dialog
    }

    if (direction && currentAnime) {
      handleSwipe(direction, currentAnime);
    }
  }, [recommendations, handleSwipe]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-4">
      {recommendations.length > 0 ? (
        <Swiper
          effect={'cards'}
          grabCursor={true}
          modules={[EffectCards]}
          className="mySwiper w-[350px] h-[500px]"
          onSwiper={(swiper) => (swiperRef.current = swiper)}
          onSlideChange={(swiper) => {
            // Only remove the top recommendation if the Swiper has truly advanced to the next slide.
            // This prevents double-skipping and ensures removal only for forward movements.
            if (swiper.previousIndex !== undefined && swiper.activeIndex === swiper.previousIndex + 1) {
              removeTopRecommendation();
            }
          }}
        >
          {recommendations.map((anime) => (
            <SwiperSlide key={anime.mal_id}>
              <SwipeCard {...anime} />
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        <p>No more recommendations for now. Check back later!</p>
      )}

      {lastDirection && (
        <h2 className="absolute bottom-0 text-xl font-bold">
          You swiped {lastDirection}
        </h2>
      )}

      {selectedAnime && (
        <AddAnimeDialog
          anime={selectedAnime}
          onAnimeAdded={handleDialogClose}
        />
      )}
    </div>
  );
}