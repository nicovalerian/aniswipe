import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SwipeCardProps {
  mal_id: number;
  title: string;
  image_url: string;
  synopsis: string;
  score: number;
  genres: string[];
}

export function SwipeCard({ mal_id, title, image_url, synopsis, score, genres }: SwipeCardProps) {
  const shortSynopsis = synopsis.length > 300 ? synopsis.substring(0, 297) + "..." : synopsis;

  return (
    <Card className="w-[350px] flex-shrink-0 bg-card text-card-foreground shadow-lg">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-2xl font-bold leading-tight line-clamp-2">{title}</CardTitle>
        <div className="text-sm text-muted-foreground mt-1">MAL Score: <span className="font-semibold text-primary">{score || "N/A"}</span></div>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="relative w-full h-[250px] mb-4 rounded-md overflow-hidden">
          <Image src={image_url} alt={title} fill style={{ objectFit: "cover" }} className="transition-transform duration-300 hover:scale-105" />
        </div>
        <p className="text-sm text-foreground mb-3 line-clamp-4">{shortSynopsis}</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {genres.map((genre) => (
            <span key={genre} className="bg-secondary text-secondary-foreground text-xs px-3 py-1 rounded-full font-medium">
              {genre}
            </span>
          ))}
        </div>
        <div className="mt-4 text-center text-xs text-muted-foreground space-y-1">
          <p>
            <span className="font-semibold text-primary">Swipe Right</span> to Add to Planned
          </p>
          <p>
            <span className="font-semibold text-destructive">Swipe Left</span> to Skip
          </p>
          <p>
            <span className="font-semibold text-accent">Swipe Up</span> for More Options
          </p>
        </div>
      </CardContent>
    </Card>
  );
}