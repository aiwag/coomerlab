import React, { useMemo } from "react";
import {
  Users,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clipboard,
  Trash2,
  Star,
  Maximize2,
} from "lucide-react";
import { useGridStore } from "@/state/gridStore";
import { useSettingsStore } from "@/state/settingsStore";

export function StreamListSidebar() {
  const {
    streamUrls,
    favorites,
    playingStreams,
    removeStream,
    toggleFavorite,
    setFullViewMode,
  } = useGridStore();
  const { sidebarVisible, sidebarCollapsed, toggleSidebarCollapse } =
    useSettingsStore();

  const streamData = useMemo(() => {
    return streamUrls.map((url, index) => {
      const usernameMatch = url.match(/chaturbate\.com\/([^/]+)/);
      const username = usernameMatch ? usernameMatch[1] : `stream-${index}`;
      const thumb = `https://jpeg.live.mmcdn.com/stream?room=${username}`;
      return {
        url,
        username,
        thumb,
        isFavorite: favorites.has(index),
        isPlaying: playingStreams.has(index),
      };
    });
  }, [streamUrls, favorites, playingStreams]);

  if (!sidebarVisible) return null;

  return (
    <aside
      className={`flex flex-col border-r border-neutral-700 bg-neutral-800 transition-all duration-300 ${sidebarCollapsed ? "w-14" : "w-64"}`}
    >
      <header className="flex items-center justify-between border-b border-neutral-700 p-2">
        {!sidebarCollapsed && (
          <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
            <Users size={16} />
            <span>Streams</span>
          </h3>
        )}
        <button
          onClick={toggleSidebarCollapse}
          className="rounded p-1 hover:bg-neutral-700"
          title={sidebarCollapsed ? "Expand" : "Collapse"}
        >
          {sidebarCollapsed ? (
            <ChevronRight size={16} />
          ) : (
            <ChevronLeft size={16} />
          )}
        </button>
      </header>

      {!sidebarCollapsed && (
        <>
          <div className="flex items-center justify-around border-b border-neutral-700 p-2">
            <button
              className="rounded p-1 hover:bg-neutral-700"
              title="Add Stream"
            >
              <Plus size={16} />
            </button>
            <button
              className="rounded p-1 hover:bg-neutral-700"
              title="Paste from Clipboard"
            >
              <Clipboard size={16} />
            </button>
          </div>
          <div className="custom-scrollbar flex-1 space-y-2 overflow-y-auto p-2">
            {streamData.map((stream, index) => (
              <div
                key={stream.url}
                className="rounded-lg bg-neutral-700 p-2 transition-colors hover:bg-neutral-600"
              >
                <div className="flex items-center gap-2">
                  <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded">
                    <img
                      src={stream.thumb}
                      alt={stream.username}
                      className="h-full w-full object-cover"
                    />
                    <div
                      className={`absolute right-0.5 bottom-0.5 h-2 w-2 rounded-full border border-neutral-700 ${stream.isPlaying ? "bg-green-500" : "bg-red-500"}`}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="truncate text-sm font-medium text-white">
                      {stream.username}
                    </h4>
                    <div className="mt-1 flex items-center gap-1">
                      <button
                        onClick={() => toggleFavorite(index)}
                        className="p-1 text-neutral-400 hover:text-white"
                        title="Favorite"
                      >
                        <Star
                          size={14}
                          className={
                            stream.isFavorite
                              ? "fill-yellow-400 text-yellow-400"
                              : ""
                          }
                        />
                      </button>
                      <button
                        onClick={() => setFullViewMode(index)}
                        className="p-1 text-neutral-400 hover:text-white"
                        title="Focus View"
                      >
                        <Maximize2 size={14} />
                      </button>
                      <button
                        onClick={() => removeStream(index)}
                        className="p-1 text-neutral-400 hover:text-red-400"
                        title="Remove Stream"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </aside>
  );
}
