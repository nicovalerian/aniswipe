import Image from "next/image";
import imageUrl from "./kokou no hito.jpg";

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center text-white font-sans overflow-hidden">
      <Image
        src={imageUrl}
        alt="Background"
        fill
        className="object-cover"
        style={{ zIndex: -2 }}
      />
      <div
        className="absolute inset-0"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.4)", zIndex: -1 }}
      ></div>
      <main className="relative z-10 flex flex-col items-center justify-center flex-grow px-4 text-center py-20">
        <div className="bg-black/5 rounded-xl p-4 mb-6">
          <h1 className="text-5xl md:text-7xl font-bold text-purple-400 drop-shadow-lg">
            Swipe right on your next favorite anime.
          </h1>
        </div>
        <p className="text-lg md:text-xl max-w-2xl text-gray-300 leading-relaxed">
          AniSwipe helps you discover new anime by swiping through personalized recommendations.
          Connect with your favorite shows, explore new genres, and build your perfect watchlist with ease.
          Dive into the world of anime like never before!
        </p>
      </main>
    </div>
  );
}
