import { create } from 'zustand';
import { fetchAnimeDetails, AnimeRecommendation } from '@/lib/anime-api';
import { getRecommendations } from '@/lib/recommendation-api'; // Import getRecommendations

interface RecommendationStore {
  recommendations: AnimeRecommendation[];
  setRecommendations: (malUsername: string | null) => Promise<void>; // Change to accept malUsername
getTopRecommendation: () => AnimeRecommendation | undefined;
removeTopRecommendation: () => void;
}

export const useRecommendationStore = create<RecommendationStore>((set) => ({
  recommendations: [],
  setRecommendations: async (malUsername: string | null) => {
    if (!malUsername) {
      set({ recommendations: [] });
      return;
    }
    try {
      // Single API call to get full recommendations
      const fetchedAnimes = await getRecommendations(malUsername);
      set({ recommendations: fetchedAnimes });
    } catch (error) {
      console.error("Error setting recommendations:", error);
      set({ recommendations: [] });
    }
  },
  getTopRecommendation: () => {
    let topAnime: AnimeRecommendation | undefined;
    set((state) => {
      if (state.recommendations.length > 0) {
        topAnime = state.recommendations[0];
      }
      return state;
    });
    return topAnime;
  },
  removeTopRecommendation: () => {
    set((state) => {
      if (state.recommendations.length > 0) {
        return { recommendations: state.recommendations.slice(1) };
      }
      return state;
    });
  },
}));