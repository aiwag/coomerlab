import React from "react";
import { useGridStore } from "@/state/gridStore";

interface MinimizedStreamProps {
  url: string;
  index: number;
}

export function MinimizedStream({ url, index }: MinimizedStreamProps) {
  const { setFullViewMode, playingStreams } = useGridStore();
  const isPlaying = playingStreams.has(index);
  const username = url.match(/chaturbate\.com\/([^/]+)/)?.[1] ?? "unknown";
  const thumbUrl = `https://jpeg.live.mmcdn.com/stream?room=${username}`;

  return (
    <div
      className="relative h-full w-32 flex-shrink-0 cursor-pointer overflow-hidden rounded transition-all hover:ring-2 hover:ring-cyan-500"
      onClick={() => setFullViewMode(index)}
    >
      <img
        src={thumbUrl}
        alt={username}
        className="h-full w-full object-cover"
      />
      <div className="absolute inset-0 flex items-end bg-black/50 p-1">
        <span className="truncate text-xs text-white">{username}</span>
      </div>
      <div
        className={`absolute top-1 right-1 h-2.5 w-2.5 rounded-full border-2 border-black ${isPlaying ? "bg-green-500" : "bg-red-500"}`}
      />
    </div>
  );
}
