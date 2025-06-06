import DynamicBackgroundImage from "@/components/dynamic-background-image";

export default async function Home() {
  let imageUrl = "/window.svg"; // Default image if API fails or no data

  try {
    const response = await fetch("https://api.jikan.moe/v4/top/anime?limit=5", {
      next: { revalidate: 3600 }, // Revalidate data every hour
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    if (data.data && data.data.length > 0) {
      // Pick a random anime from the top 5 for the background
      const randomIndex = Math.floor(Math.random() * data.data.length);
      imageUrl = data.data[randomIndex].images.webp.large_image_url;
    }
  } catch (error) {
    console.error("Failed to fetch top anime:", error);
    // imageUrl remains the default if fetch fails
  }

  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center text-white font-sans overflow-hidden">
      {/* Background Image */}
      <DynamicBackgroundImage src={imageUrl} />

      {/* Overlay to ensure text readability */}
      <div className="absolute inset-0 bg-black bg-opacity-40 z-10"></div>

      <main className="relative z-20 flex flex-col items-center justify-center flex-grow px-4 text-center py-20">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 text-purple-400 drop-shadow-lg">
          Swipe right on your next favorite anime.
        </h1>
        <p className="text-lg md:text-xl max-w-2xl text-gray-300 leading-relaxed">
          AniSwipe helps you discover new anime by swiping through personalized recommendations.
          Connect with your favorite shows, explore new genres, and build your perfect watchlist with ease.
          Dive into the world of anime like never before!
        </p>
      </main>
    </div>
  );
}
