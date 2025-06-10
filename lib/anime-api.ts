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
export async function fetchAnimeDetails(malIds: number[]): Promise<AnimeRecommendation[]> {
  const animeDetails: AnimeRecommendation[] = [];
  const JIKAN_API_BASE_URL = "https://api.jikan.moe/v4"; // Jikan API base URL

  for (const id of malIds) {
    try {
      const response = await fetch(`${JIKAN_API_BASE_URL}/anime/${id}`);
      if (!response.ok) {
        console.error(`Failed to fetch details for MAL ID ${id}: ${response.statusText}`);
        continue;
      }
      const data = await response.json();
      const anime = data.data;

      if (anime) {
        animeDetails.push({
          mal_id: anime.mal_id,
          title: anime.title,
          image_url: anime.images?.jpg?.image_url || '',
          synopsis: anime.synopsis || 'No synopsis available.',
          score: anime.score || 0,
          genres: anime.genres?.map((g: { name: string }) => g.name) || [],
          images: anime.images, // Add the images property
        });
      }
    } catch (error) {
      console.error(`Error fetching details for MAL ID ${id}:`, error);
    }
    // Add a small delay to respect API rate limits
    await new Promise(resolve => setTimeout(resolve, 350));
  }
  return animeDetails;
}