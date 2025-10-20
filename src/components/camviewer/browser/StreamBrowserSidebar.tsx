import React, { useRef, useEffect } from "react";
import { Search, X, AlertCircle, TrendingUp, Star, Flame } from "lucide-react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useBrowserStore, BrowseMode } from "@/state/browserStore";
import { useSettingsStore } from "@/state/settingsStore";
import { useDebounce } from "@/hooks/useDebounce";
import { CarouselGender } from "@/services/chaturbateApiService";
import { StreamerCard } from "./StreamerCard";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export function StreamBrowserSidebar() {
  const { browserVisible, setBrowserVisible } = useSettingsStore();
  const {
    streamers,
    isLoading,
    error,
    fetchStreamers,
    setSearchTerm,
    searchTerm,
    executeSearch,
    setBrowseMode,
    browseMode,
    hasMore,
    carouselGender,
    setCarouselGender,
  } = useBrowserStore();

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: streamers.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 70,
    overscan: 10,
  });

  useEffect(() => {
    executeSearch(debouncedSearchTerm);
  }, [debouncedSearchTerm, executeSearch]);

  useEffect(() => {
    const virtualItems = rowVirtualizer.getVirtualItems();
    if (!virtualItems.length) return;
    const lastItem = virtualItems[virtualItems.length - 1];
    if (
      lastItem &&
      lastItem.index >= streamers.length - 10 &&
      hasMore &&
      !isLoading
    ) {
      fetchStreamers(true);
    }
  }, [
    rowVirtualizer.getVirtualItems(),
    streamers.length,
    hasMore,
    isLoading,
    fetchStreamers,
  ]);

  useEffect(() => {
    if (browserVisible && streamers.length === 0) {
      fetchStreamers();
    }
  }, [browserVisible, streamers.length, fetchStreamers]);

  if (!browserVisible) return null;

  const showGenderFilter =
    browseMode === "topRated" || browseMode === "trending";

  return (
    <aside className="flex h-full w-72 flex-col border-r border-neutral-700 bg-neutral-800">
      <header className="flex items-center justify-between border-b border-neutral-700 p-2">
        <h2 className="text-sm font-semibold text-white">Stream Browser</h2>
        <button
          onClick={() => setBrowserVisible(false)}
          className="rounded p-1 hover:bg-neutral-700"
        >
          <X size={16} />
        </button>
      </header>

      <div className="space-y-2 border-b border-neutral-700 p-2">
        <div className="relative">
          <Search
            className="absolute top-1/2 left-2.5 -translate-y-1/2 text-gray-400"
            size={14}
          />
          <input
            type="text"
            placeholder="Search for streamers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded bg-neutral-700 py-1.5 pr-3 pl-8 text-sm text-white focus:ring-1 focus:ring-cyan-500 focus:outline-none"
          />
        </div>

        <ToggleGroup
          type="single"
          value={browseMode}
          onValueChange={(v) => v && setBrowseMode(v as BrowseMode)}
          className="grid w-full grid-cols-3"
        >
          <ToggleGroupItem
            value="mostViewed"
            title="Most Viewed"
            className="gap-1 text-xs"
          >
            <Flame size={14} />
            Most
          </ToggleGroupItem>
          <ToggleGroupItem
            value="topRated"
            title="Top Rated"
            className="gap-1 text-xs"
          >
            <Star size={14} />
            Top
          </ToggleGroupItem>
          <ToggleGroupItem
            value="trending"
            title="Trending"
            className="gap-1 text-xs"
          >
            <TrendingUp size={14} />
            Trend
          </ToggleGroupItem>
        </ToggleGroup>

        {showGenderFilter && (
          <div className="space-y-1">
            <label className="px-1 text-xs text-gray-400">Filter Gender</label>
            <ToggleGroup
              type="single"
              value={carouselGender}
              onValueChange={(g) =>
                g !== null && setCarouselGender(g as CarouselGender)
              }
              className="grid w-full grid-cols-5"
            >
              <ToggleGroupItem value="" className="text-xs">
                All
              </ToggleGroupItem>
              <ToggleGroupItem value="f" className="text-xs">
                F
              </ToggleGroupItem>
              <ToggleGroupItem value="m" className="text-xs">
                M
              </ToggleGroupItem>
              <ToggleGroupItem value="c" className="text-xs">
                C
              </ToggleGroupItem>
              <ToggleGroupItem value="t" className="text-xs">
                T
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        )}

        {error && (
          <div className="bg-red-900/30 p-2 text-xs text-red-200">
            <AlertCircle size={12} />
            {error}
          </div>
        )}
      </div>

      <div ref={parentRef} className="custom-scrollbar flex-1 overflow-y-auto">
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            position: "relative",
          }}
        >
          {isLoading && streamers.length === 0 && (
            <div className="flex justify-center p-4">
              <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-cyan-500"></div>
            </div>
          )}

          {rowVirtualizer.getVirtualItems().map((virtualItem) => {
            const streamer = streamers[virtualItem.index];
            if (!streamer) return null;
            return (
              <div
                key={`${browseMode}-${streamer.username}-${virtualItem.index}`}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                <StreamerCard streamer={streamer} />
              </div>
            );
          })}

          {isLoading && streamers.length > 0 && (
            <div className="py-2 text-center text-xs text-gray-400">
              Loading more...
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
