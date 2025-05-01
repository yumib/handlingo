"use client";

import { useEffect, useState } from "react";

type Props = {
  videoUrl: string
};

export default function LessonVid({ videoUrl}: Props) {
  const [error, setError] = useState<string | null>(null);

  if (error) return <p className="text-red-500">Error: {error}</p>;
  if (!videoUrl) return <p>Loading video...</p>;

  return (
    <video
      className="w-full rounded-lg shadow-md"
      controls
      src={videoUrl}
      preload="metadata"
    >
      Your browser does not support the video tag.
    </video>
  );
}