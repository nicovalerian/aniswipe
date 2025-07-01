// lib/anime-api.ts

export interface AnimeRecommendation {
  mal_id: number;
  title: string;
  image_url: string;
  synopsis: string;
  score: number;
  genres: string[];
  images: {
    jpg: {
      image_url: string;
    };
  };
}

// Function to fetch anime details from Jikan API
export async function fetchAnimeDetails(malId: number, retries = 3, delay = 1000): Promise<AnimeRecommendation | null> {
  const JIKAN_API_BASE_URL = "https://api.jikan.moe/v4"; // Jikan API base URL

  try {
    const response = await fetch(`${JIKAN_API_BASE_URL}/anime/${malId}`);
    if (response.status === 429) {
      if (retries > 0) {
        console.warn(`Rate limited. Retrying in ${delay}ms... (${retries} retries left)`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchAnimeDetails(malId, retries - 1, delay * 2); // Exponential backoff
      } else {
        console.error(`Failed to fetch details for MAL ID ${malId} after multiple retries.`);
        return null;
      }
    }
    if (!response.ok) {
      console.error(`Failed to fetch details for MAL ID ${malId}: ${response.statusText}`);
      return null;
    }
    const data = await response.json();
    const anime = data.data;

    if (anime) {
      return {
        mal_id: anime.mal_id,
        title: anime.title,
        image_url: anime.images?.jpg?.image_url || '',
        synopsis: anime.synopsis || 'No synopsis available.',
        score: anime.score || 0,
        genres: anime.genres?.map((g: { name: string }) => g.name) || [],
        images: anime.images,
      };
    }
  } catch (error) {
    console.error(`Error fetching details for MAL ID ${malId}:`, error);
  }
  return null;
}