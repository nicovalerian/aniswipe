import { create } from 'zustand';
import { fetchAnimeDetails, AnimeRecommendation } from '@/lib/anime-api';
import { getRecommendations } from '@/lib/recommendation-api'; // Import getRecommendations

interface RecommendationStore {
  recommendations: AnimeRecommendation[];
  setRecommendations: (malUsername: string | null) => Promise<void>; // Change to accept malUsername
  getNextAnime: () => AnimeRecommendation | undefined;
}

export const useRecommendationStore = create<RecommendationStore>((set) => ({
  recommendations: [],
  setRecommendations: async (malUsername: string | null) => {
    if (!malUsername) {
      set({ recommendations: [] });
      return;
    }
    try {
      const malIds = await getRecommendations(malUsername);
      const fetchedAnimes = await fetchAnimeDetails(malIds);
      set({ recommendations: fetchedAnimes });
    } catch (error) {
      console.error("Error setting recommendations:", error);
      set({ recommendations: [] });
    }
  },
  getNextAnime: () => {
    let nextAnime: AnimeRecommendation | undefined;
    set((state) => {
      if (state.recommendations.length > 0) {
        nextAnime = state.recommendations[0];
        return { recommendations: state.recommendations.slice(1) };
      }
      return state;
    });
    return nextAnime;
  },
}));