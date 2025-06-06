import { create } from 'zustand';

interface AnimeRecommendation {
  mal_id: number;
  title: string;
  image_url: string;
  synopsis: string;
  score: number;
  genres: string[];
}

interface RecommendationStore {
  recommendations: AnimeRecommendation[];
  setRecommendations: (animes: AnimeRecommendation[]) => void;
  getNextAnime: () => AnimeRecommendation | undefined;
}

export const useRecommendationStore = create<RecommendationStore>((set) => ({
  recommendations: [],
  setRecommendations: (animes) => set({ recommendations: animes }),
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