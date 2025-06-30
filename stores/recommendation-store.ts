import { create } from 'zustand';
import { fetchAnimeDetails, AnimeRecommendation } from '@/lib/anime-api';
import { getRecommendations } from '@/lib/recommendation-api'; // Import getRecommendations
import { getUserAnimeList } from '@/app/swipe/actions'; // Import getUserAnimeList

interface RecommendationStore {
  recommendations: AnimeRecommendation[];
  setRecommendations: (malUsername: string | null) => Promise<void>; // Change to accept malUsername
  getTopRecommendation: () => AnimeRecommendation | undefined;
  removeTopRecommendation: () => void;
  moveTopRecommendationToBack: () => void; // New action to move top card to back
  userListRefreshTrigger: number; // New state for refreshing user list
  incrementUserListRefreshTrigger: () => void; // New action to increment refresh trigger
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

      // Fetch user's existing anime list
      const userAnimeList = await getUserAnimeList();
      const userAnimeMalIds = new Set(userAnimeList.map(entry => entry.Anime.mal_id));

      // Filter out recommendations that are already in the user's list
      const filteredRecommendations = fetchedAnimes.filter(anime => !userAnimeMalIds.has(anime.mal_id));

      set({ recommendations: filteredRecommendations });
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
        const newRecommendations = state.recommendations.slice(1);
        return { recommendations: newRecommendations };
      }
      return state;
    });
  },
  moveTopRecommendationToBack: () => {
    set((state) => {
      if (state.recommendations.length > 0) {
        const [top, ...rest] = state.recommendations;
        const newRecommendations = [...rest, top];
        return { recommendations: newRecommendations };
      }
      return state;
    });
  },
  userListRefreshTrigger: 0, // Initialize trigger
  incrementUserListRefreshTrigger: () =>
    set((state) => ({ userListRefreshTrigger: state.userListRefreshTrigger + 1 })),
}));