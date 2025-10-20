import React from "react";
import { Plus, Check } from "lucide-react";
import { Streamer } from "@/services/chaturbateApiService";
import { useGridStore } from "@/state/gridStore";
import { formatNumber, getGenderColor } from "@/utils/formatters"; // We'll create this

interface StreamerCardProps {
  streamer: Streamer;
}

export const StreamerCard = React.memo(({ streamer }: StreamerCardProps) => {
  const addStream = useGridStore((state) => state.addStream);

  const handleAddStream = (e: React.MouseEvent) => {
    e.stopPropagation();
    addStream(`https://chaturbate.com/${streamer.username}`);
  };

  return (
    <div
      className="m-2 cursor-pointer rounded-lg bg-neutral-700 p-1.5 transition-colors hover:bg-neutral-600"
      onClick={handleAddStream}
    >
      <div className="flex items-center gap-2">
        <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded">
          <img
            src={streamer.img}
            alt={streamer.username}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <h4 className="truncate text-sm font-medium text-white">
              {streamer.username}
            </h4>
            <button
              onClick={handleAddStream}
              className="rounded bg-cyan-600 p-1 text-white hover:bg-cyan-700"
              title="Add to Grid"
            >
              <Plus size={12} />
            </button>
          </div>
          <div className="mt-1 flex items-center gap-3 text-xs text-gray-400">
            <span>{formatNumber(streamer.num_users)} v</span>
            <span>{formatNumber(streamer.num_followers)} f</span>
          </div>
          <div className="mt-1.5 flex items-center gap-1">
            <span
              className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${getGenderColor(streamer.gender)}`}
            >
              {streamer.gender.toUpperCase()}
            </span>
            {streamer.is_new && (
              <span className="rounded-full bg-green-500 px-1.5 py-0.5 text-[10px] font-semibold">
                NEW
              </span>
            )}
            {streamer.is_age_verified && (
              <span className="flex items-center gap-0.5 rounded-full bg-blue-500 px-1.5 py-0.5 text-[10px] font-semibold">
                <Check size={8} /> 18+
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});
