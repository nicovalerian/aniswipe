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
  const { recommendations, setRecommendations, getNextAnime } =
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
      // After swipe, remove the swiped anime from the store
      // Assuming getNextAnime also removes the current anime from the list
      getNextAnime();
    },
    [getNextAnime, setSelectedAnime, setLastDirection]
  );

  const handleDialogClose = () => {
    setSelectedAnime(null); // Clear selected anime when dialog is closed
  };

  const handleKeyDown = useCallback(async (event: KeyboardEvent) => {
    if (!swiperRef.current || recommendations.length === 0) return;

    const currentAnime = recommendations[0]; // Assuming the first item is the current one

    let direction = "";
    if (event.key === "ArrowRight") {
      direction = "right";
      swiperRef.current.slideNext(); // Simulate swipe right
    } else if (event.key === "ArrowLeft") {
      direction = "left";
      swiperRef.current.slidePrev(); // Simulate swipe left
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
    <div className="relative flex justify-center items-center w-full h-[500px]">
      {recommendations.length > 0 ? (
        <Swiper
          effect={'cards'}
          grabCursor={true}
          modules={[EffectCards]}
          className="mySwiper w-full h-full"
          onSwiper={(swiper) => (swiperRef.current = swiper)}
          onSlideChange={(swiper) => {
            // When slide changes, it means the previous card was "swiped"
            // We need to manually trigger the handleSwipe for the previous card
            // This is a simplification, actual swipe direction would need more logic
            if (swiper.previousIndex !== undefined && swiper.previousIndex < recommendations.length) {
              const swipedAnime = recommendations[swiper.previousIndex];
              // Determine direction based on slide change (simplified for now)
              const direction = swiper.activeIndex > swiper.previousIndex ? 'right' : 'left';
              handleSwipe(direction, swipedAnime);
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