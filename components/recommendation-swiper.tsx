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
  recommendationIds: number[];
  userAnimeList: {
    anime_id: number;
    status: string;
    score: number | null;
    Anime: {
      mal_id: number;
      title: string;
      image_url: string;
    };
  }[];
}

export function RecommendationSwiper({ recommendationIds, userAnimeList }: RecommendationSwiperProps) {
  const setRecommendations = useRecommendationStore((state) => state.setRecommendations);
  const { recommendations, removeTopRecommendation, moveTopRecommendationToBack, incrementUserListRefreshTrigger } =
    useRecommendationStore();

  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      const filteredRecommendations = recommendationIds.filter(
        (id) => !userAnimeList.some((entry) => entry.Anime.mal_id === id)
      );
      setRecommendations(filteredRecommendations);
      initialized.current = true;
    }
  }, [recommendationIds, setRecommendations, userAnimeList]);

  const [lastDirection, setLastDirection] = useState<string>();
  const [selectedAnime, setSelectedAnime] = useState<number | null>(null);
  const swiperRef = useRef<import('swiper/types').Swiper | null>(null); // Ref for Swiper instance


  const handleSwipe = useCallback(
    async (direction: string, animeId: number) => {
     // SwipeCard will need to expose the full anime object, or we fetch it here.
     // For now, I'll update the swipecard component.
     // The `handleSwipe` function will receive `animeId` instead of the full `AnimeRecommendation` object.
     // I will need to fetch the anime details when a swipe action occurs.
     // This will involve calling `fetchAnimeDetails(animeId)` inside `handleSwipe`.
     let anime: AnimeRecommendation | null = null;
     try {
       const { fetchAnimeDetails } = await import("@/lib/anime-api");
       anime = await fetchAnimeDetails(animeId);
     } catch (e) {
       console.error("Error fetching anime details on swipe:", e);
       toast.error("Failed to fetch anime details for swipe action.");
       return;
     }

     if (!anime) {
       toast.error("Anime details not found for swipe action.");
       removeTopRecommendation(); // Remove the card even if details not found
       return;
     }
     const swipedAnimeTitle = anime.title;
      setLastDirection(direction);

      // The swiper will automatically move to the next slide because the underlying data changes.
      // We don't need to call swiperRef.current.slideNext() manually.

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
          incrementUserListRefreshTrigger(); // Trigger list refresh
        } catch (err: unknown) {
          console.error("Error updating recommendation index:", err);
          toast.error(`Failed to add "${swipedAnimeTitle}". Please try again.`);
        }
        removeTopRecommendation();
      } else if (direction === "up") {
        setSelectedAnime(anime.mal_id);
        // The AddAnimeDialog now manages its own open state.
        // The recommendation is removed immediately, consistent with original behavior.
        removeTopRecommendation();
      } else if (direction === "left") {
        moveTopRecommendationToBack(); // Move the skipped anime to the back of the deck
      }
    },
    [setSelectedAnime, setLastDirection, removeTopRecommendation, moveTopRecommendationToBack, incrementUserListRefreshTrigger]
  );

  const handleDialogClose = () => {
    setSelectedAnime(null); // Clear selected anime when dialog is closed
  };

  const handleKeyDown = useCallback(async (event: KeyboardEvent) => {
    if (!swiperRef.current || recommendations.length === 0) {
      return;
    }

    const swiper = swiperRef.current;
    if (!swiper) return;

    const currentAnimeId = recommendations[swiper.activeIndex];

    if (!currentAnimeId) {
      // This case should ideally not happen if recommendations.length > 0
      // and activeIndex is within bounds, but good for defensive programming.
      return;
    }

    if (event.key === "ArrowRight") {
      swiper.slideNext();
      handleSwipe("right", currentAnimeId);
    } else if (event.key === "ArrowLeft") {
      swiper.slideNext();
      handleSwipe("left", currentAnimeId);
    } else if (event.key === "ArrowUp") {
      handleSwipe("up", currentAnimeId);
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
          onSlideChange={() => {
            // The actual data manipulation (removeTopRecommendation or moveTopRecommendationToBack)
            // is handled within handleSwipe, which is called by handleKeyDown or direct swipe.
            // This onSlideChange is primarily for reacting to Swiper's internal state changes,
            // e.g., if a user manually drags a card.
            // If the user manually drags, we need to ensure the state is updated.
            // However, for now, we rely on handleSwipe to manage both the visual slide and the data.
            // If manual dragging needs to trigger state changes, additional logic would be needed here.
          }}
        >
          {recommendations.map((animeId) => {
            const userEntry = userAnimeList.find((entry) => entry.Anime.mal_id === animeId);
            return (
              <SwiperSlide key={animeId}>
                <SwipeCard animeId={animeId} userAnimeEntry={userEntry} />
              </SwiperSlide>
            );
          })}
        </Swiper>
      ) : (
        <div className="text-center flex flex-col items-center">
          {/*
            The malUsername check has been moved to RecommendationDataFetcher
            or should be handled by checking the existence of recommendations in the store
            after initialization.
            For now, we will simply display the "No more recommendations" message.
          */}
          <div className="text-lg text-white">No more recommendations for now. Check back later!</div>
        </div>
      )}

      {lastDirection && (
        <h2 className="absolute bottom-[-4rem] text-xl font-bold">
          You swiped {lastDirection}
        </h2>
      )}

      {selectedAnime && (
        <AddAnimeDialog
          animeId={selectedAnime}
          onAnimeAdded={handleDialogClose}
          onClose={handleDialogClose}
        />
      )}
    </div>
  );
}