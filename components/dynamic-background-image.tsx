"use client";

import Image from "next/image";
import { useState } from "react";

interface DynamicBackgroundImageProps {
  src: string;
}

export default function DynamicBackgroundImage({ src }: DynamicBackgroundImageProps) {
  const [imageUrl, setImageUrl] = useState(src);
  const fallbackImage = "/fallback-bg.jpg"; // Path to your fallback image

  return (
    <Image
      src={imageUrl}
      alt="Anime Background"
      layout="fill"
      objectFit="cover"
      quality={75}
      className="z-0 blur-sm brightness-50"
      priority
      onError={() => {
        setImageUrl(fallbackImage);
      }}
    />
  );
}