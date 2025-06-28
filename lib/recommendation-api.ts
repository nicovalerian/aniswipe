// lib/recommendation-api.ts
import { AnimeRecommendation } from './anime-api';

export async function getRecommendations(malUsername: string): Promise<AnimeRecommendation[]> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_RECOMMENDATION_API_URL}/recommend`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username: malUsername }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch recommendations');
  }

  const data = await response.json();
  // The backend now returns the full anime objects
  return data.recommendations.map((anime: any) => ({
      mal_id: anime.mal_id,
      title: anime.title,
      image_url: anime.images?.jpg?.image_url || '',
      synopsis: anime.synopsis || 'No synopsis available.',
      score: anime.score || 0,
      genres: anime.genres?.map((g: { name: string }) => g.name) || [],
      images: anime.images,
  }));
}