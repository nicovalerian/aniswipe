export interface UserAnimeEntry {
  anime_id: number;
  status: string;
  score: number | null;
  Anime: {
    mal_id: number;
    title: string;
    image_url: string;
  };
}

export interface AnimeRecommendation {
  mal_id: number;
  title: string;
  image_url: string;
}