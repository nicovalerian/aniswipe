// lib/recommendation-api.ts

const RECOMMENDATION_API_URL = process.env.NEXT_PUBLIC_RECOMMENDATION_API_URL || 'http://localhost:5000';

export async function getRecommendations(username: string): Promise<number[]> {
  try {
    const response = await fetch(`${RECOMMENDATION_API_URL}/recommend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.recommendations;
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    return [];
  }
}