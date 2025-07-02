import { create } from 'zustand';
interface RecommendationStore {
  recommendations: number[];
  setRecommendations: (recommendationIds: number[]) => void;
  getTopRecommendation: () => number | undefined;
  removeTopRecommendation: () => void;
  moveTopRecommendationToBack: () => void; // New action to move top card to back
  userListRefreshTrigger: number; // New state for refreshing user list
  incrementUserListRefreshTrigger: () => void; // New action to increment refresh trigger
}

export const useRecommendationStore = create<RecommendationStore>((set) => ({
  recommendations: [],
  setRecommendations: (recommendationIds: number[]) => {
    set({ recommendations: recommendationIds });
  },
  getTopRecommendation: () => {
    let topAnime: number | undefined;
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