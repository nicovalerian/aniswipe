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

// --- Jikan API Request Queue ---
const JIKAN_API_BASE_URL = "https://api.jikan.moe/v4";
const REQUEST_INTERVAL = 400; // 3 requests per second = ~333ms delay, 400ms for safety

interface QueuedRequest {
  malId: number;
  resolve: (value: AnimeRecommendation | null) => void;
  reject: (reason?: Error) => void;
  retries: number;
}

const requestQueue: QueuedRequest[] = [];
let isProcessing = false;

async function processQueue() {
  if (isProcessing || requestQueue.length === 0) {
    return;
  }
  isProcessing = true;

  const { malId, resolve, reject, retries } = requestQueue.shift()!;

  try {
    const response = await fetch(`${JIKAN_API_BASE_URL}/anime/${malId}`);
    
    if (response.status === 429 && retries > 0) {
      console.warn(`Rate limited on ID ${malId}. Re-queueing. Retries left: ${retries - 1}`);
      requestQueue.unshift({ malId, resolve, reject, retries: retries - 1 });
    } else if (!response.ok) {
      console.error(`Failed to fetch details for MAL ID ${malId}. Status: ${response.status}`);
      resolve(null);
    } else {
      const data = await response.json();
      const anime = data.data;
      if (anime) {
        const animeDetails: AnimeRecommendation = {
          mal_id: anime.mal_id,
          title: anime.title,
          image_url: anime.images?.jpg?.image_url || '',
          synopsis: anime.synopsis || 'No synopsis available.',
          score: anime.score || 0,
          genres: anime.genres?.map((g: { name: string }) => g.name) || [],
          images: anime.images,
        };
        resolve(animeDetails);
      } else {
        resolve(null);
      }
    }
  } catch (error) {
    console.error(`Network error for MAL ID ${malId}:`, error);
    if (retries > 0) {
      requestQueue.unshift({ malId, resolve, reject, retries: retries - 1 });
    } else {
      if (error instanceof Error) {
        reject(error);
      } else {
        reject(new Error(String(error)));
      }
    }
  } finally {
    setTimeout(() => {
      isProcessing = false;
      processQueue();
    }, REQUEST_INTERVAL);
  }
}

export function fetchAnimeDetails(malId: number): Promise<AnimeRecommendation | null> {
  return new Promise((resolve, reject) => {
    requestQueue.push({ malId, resolve, reject, retries: 3 });
    if (!isProcessing) {
      processQueue();
    }
  });
}