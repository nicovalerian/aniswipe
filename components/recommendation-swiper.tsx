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
import { toast } from "sonner";


interface RecommendationSwiperProps {
  malUsername: string | null;
}

export function RecommendationSwiper({ malUsername }: RecommendationSwiperProps) {
  const { recommendations, setRecommendations, removeTopRecommendation, moveTopRecommendationToBack } =
    useRecommendationStore();
  const [lastDirection, setLastDirection] = useState<string>();
  const [selectedAnime, setSelectedAnime] =
    useState<AnimeRecommendation | null>(null);
  const [userListRefreshKey, setUserListRefreshKey] = useState(0); // New state for refreshing user list
  const swiperRef = useRef<import('swiper/types').Swiper | null>(null); // Ref for Swiper instance

  // Initialize recommendations from props
  useEffect(() => {
    setRecommendations(malUsername);
  }, [malUsername, setRecommendations]);

  const handleSwipe = useCallback(
    async (direction: string, anime: AnimeRecommendation) => {
      const swipedAnimeTitle = anime.title; // Capture the title of the swiped anime
      setLastDirection(direction);
      setSelectedAnime(anime);

      if (direction === "right") {
        try {
          await addAnimeToList({
            mal_id: anime.mal_id,
            title: anime.title,
            image_url: anime.image_url,
            status: "planned",
            score: null,
          });
          toast.success(`Added "${swipedAnimeTitle}" to your planned list!`);
        } catch (error) {
          console.error("Failed to add anime to list:", error);
          toast.error(`Failed to add "${swipedAnimeTitle}". Please try again.`);
        } finally {
          setUserListRefreshKey(prevKey => prevKey + 1); // Increment key to trigger refresh
        }
      } else if (direction === "up") {
        // The AddAnimeDialog now manages its own open state, so no need to set showAddDialog here
      } else if (direction === "left") {
        moveTopRecommendationToBack(); // Move the skipped anime to the back of the deck
      }

      // Always advance the card and remove the recommendation after a swipe action (or keyboard action)
      if (swiperRef.current) {
        swiperRef.current.slideNext();
      }
      // For right and up swipes, remove the top recommendation. For left, it's moved to back.
      if (direction === "right" || direction === "up") {
        removeTopRecommendation();
      } else if (direction === "left") {
        moveTopRecommendationToBack(); // Move the skipped anime to the back of the deck
      }
    },
    [setSelectedAnime, setLastDirection, removeTopRecommendation, moveTopRecommendationToBack]
  );

  const handleDialogClose = () => {
    setSelectedAnime(null); // Clear selected anime when dialog is closed
  };

  const handleKeyDown = useCallback(async (event: KeyboardEvent) => {
    if (!swiperRef.current || recommendations.length === 0) {
      return;
    }

    const currentAnime = recommendations[swiperRef.current.activeIndex];

    if (!currentAnime) {
      // This case should ideally not happen if recommendations.length > 0
      // and activeIndex is within bounds, but good for defensive programming.
      console.error("Could not find current anime data for active slide at index:", swiperRef.current.activeIndex);
      return;
    }

    let direction = "";
    if (event.key === "ArrowRight") { // User wants to "like" (visual swipe right)
      direction = "right";
    } else if (event.key === "ArrowLeft") { // User wants to "skip" (visual swipe left)
      direction = "left";
    } else if (event.key === "ArrowUp") {
      direction = "up";
      // Swiper doesn't have a direct "up" swipe, so we'll just trigger the dialog
    }

    if (direction && currentAnime) {
      handleSwipe(direction, currentAnime);
    }
  }, [recommendations, handleSwipe, swiperRef]);

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
            // The actual data manipulation (removeTopRecommendation or moveTopRecommendationToBack)
            // is handled within handleSwipe, which is called by handleKeyDown or direct swipe.
            // This onSlideChange is primarily for reacting to Swiper's internal state changes,
            // e.g., if a user manually drags a card.
            // If the user manually drags, we need to ensure the state is updated.
            // However, for now, we rely on handleSwipe to manage both the visual slide and the data.
            // If manual dragging needs to trigger state changes, additional logic would be needed here.
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