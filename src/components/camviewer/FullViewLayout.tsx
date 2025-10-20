import React, { useMemo } from "react";
import { useGridStore } from "@/state/gridStore";
import { SortableWebview } from "./grid/SortableWebview";
import { MinimizedStream } from "./MinimizedStream";

export function FullViewLayout() {
  const { fullViewMode, streamUrls } = useGridStore();

  if (fullViewMode === null) return null;

  const focusedStream = streamUrls[fullViewMode];
  const minimizedStreams = useMemo(
    () =>
      streamUrls
        .map((url, index) => ({ url, index }))
        .filter((item) => item.index !== fullViewMode),
    [streamUrls, fullViewMode],
  );

  return (
    <div className="flex h-full flex-col">
      <div className="relative flex-1">
        {focusedStream && (
          <SortableWebview
            id={focusedStream}
            url={focusedStream}
            index={fullViewMode}
          />
        )}
      </div>
      <div className="custom-scrollbar-horizontal flex h-24 gap-2 overflow-x-auto border-t border-neutral-700 bg-neutral-800 p-2">
        {minimizedStreams.map(({ url, index }) => (
          <MinimizedStream key={url} url={url} index={index} />
        ))}
      </div>
    </div>
  );
}
