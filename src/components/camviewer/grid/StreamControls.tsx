import React from "react";
import {
  Volume2,
  VolumeX,
  Star,
  Camera,
  PictureInPicture,
  Maximize2,
} from "lucide-react";
import { useGridStore } from "@/state/gridStore";

export function StreamControls({ index }: { index: number }) {
  const {
    mutedStreams,
    favorites,
    toggleMute,
    toggleFavorite,
    setFullViewMode,
    setFullscreenStream,
    streamUrls,
  } = useGridStore();
  const isMuted = mutedStreams.has(index);
  const isFavorite = favorites.has(index);

  const handleFullscreen = () => {
    const url = streamUrls[index];
    const username = url.match(/chaturbate\.com\/([^/]+)/)?.[1] ?? "unknown";
    setFullscreenStream({ url, username });
  };

  return (
    <div className="absolute right-0 bottom-0 left-0 z-20 flex items-center justify-between bg-gradient-to-t from-black/70 to-transparent p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
      <div className="flex gap-1.5">
        <button
          onClick={() => toggleMute(index)}
          className="rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
        </button>
        <button
          onClick={() => toggleFavorite(index)}
          className="rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
          title="Favorite"
        >
          <Star
            size={14}
            className={isFavorite ? "fill-yellow-400 text-yellow-400" : ""}
          />
        </button>
      </div>
      <div className="flex gap-1.5">
        <button
          className="rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
          title="Snapshot"
        >
          <Camera size={14} />
        </button>
        <button
          className="rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
          title="Picture-in-Picture"
        >
          <PictureInPicture size={14} />
        </button>
        <button
          onClick={() => setFullViewMode(index)}
          className="rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
          title="Focus View"
        >
          <Maximize2 size={14} />
        </button>
        <button
          onClick={handleFullscreen}
          className="rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
          title="Fullscreen"
        >
          <Maximize2 size={14} />
        </button>
      </div>
    </div>
  );
}
