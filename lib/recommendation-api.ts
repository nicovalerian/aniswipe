// lib/recommendation-api.ts

export async function getRecommendations(malUsername: string, userAnimeList: unknown[]): Promise<number[]> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_RECOMMENDATION_API_URL}/recommend`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username: malUsername, user_anime_list: userAnimeList }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch recommendation IDs');
  }

  const data = await response.json();
  // The backend now returns a list of anime IDs
  return data.recommendation_ids || [];
}