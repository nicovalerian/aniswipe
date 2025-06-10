import Image from "next/image";
import { Card, CardTitle } from "@/components/ui/card";

interface SwipeCardProps {
  mal_id: number;
  title: string;
  image_url: string;
  synopsis: string;
  score: number;
  genres: string[];
}

export function SwipeCard({ title, image_url, synopsis, score, genres }: SwipeCardProps) {
  const shortSynopsis = synopsis.length > 150 ? synopsis.substring(0, 147) + "..." : synopsis;

  return (
    <Card className="relative w-[350px] h-[500px] flex-shrink-0 shadow-lg rounded-xl overflow-hidden text-white" tabIndex={0} autoFocus>
      <Image
        src={image_url}
        alt={title}
        fill
        style={{ objectFit: "cover" }}
        className="absolute inset-0 z-0"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10" />
      <div className="relative z-20 flex flex-col justify-end h-full p-6">
        <div className="space-y-2">
          <CardTitle className="text-3xl font-bold leading-tight line-clamp-2">{title}</CardTitle>
          <div className="text-md">
            MAL Score: <span className="font-semibold">{score || "N/A"}</span>
          </div>
          <div className="flex flex-wrap gap-2 py-2">
            {genres.slice(0, 3).map((genre) => (
              <span key={genre} className="bg-white/20 text-white text-xs px-3 py-1 rounded-full font-medium">
                {genre}
              </span>
            ))}
          </div>
          <p className="text-sm line-clamp-3">{shortSynopsis}</p>
        </div>
        <div className="mt-4 text-center text-xs text-white/70 space-y-1">
          <p>
            <span className="font-semibold">Swipe Right</span> to Add to Planned
          </p>
          <p>
            <span className="font-semibold">Swipe Left</span> to Skip
          </p>
          <p>
            <span className="font-semibold">Swipe Up</span> for More Options
          </p>
        </div>
      </div>
    </Card>
  );
}