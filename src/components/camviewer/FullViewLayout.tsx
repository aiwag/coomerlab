import React, { useMemo } from 'react';
import { useGridStore } from '@/state/gridStore';
import { SortableWebview } from './grid/SortableWebview';
import { MinimizedStream } from './MinimizedStream'; // Corrected path

export function FullViewLayout() {
  const { fullViewMode, streamUrls } = useGridStore();

  if (fullViewMode === null) return null;

  const focusedStream = streamUrls[fullViewMode];
  const minimizedStreams = useMemo(() => 
    streamUrls.map((url, index) => ({ url, index }))
              .filter(item => item.index !== fullViewMode),
    [streamUrls, fullViewMode]
  );
  
  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex-1 relative bg-black min-h-0">
        {focusedStream && (
            <SortableWebview 
                // These props are all that's needed for the "fill parent" mode
                id={focusedStream} 
                url={focusedStream} 
                index={fullViewMode}
                isFullViewMode={true}
                isDraggable={false} // Dragging is disabled in this mode
                isDragging={false}
            />
        )}
      </div>
      <div className="h-20 bg-neutral-800 border-t border-neutral-700 p-1.5 flex gap-1.5 overflow-x-auto custom-scrollbar-horizontal flex-shrink-0">
        {minimizedStreams.map(({ url, index }) => (
          <MinimizedStream key={url} url={url} index={index} />
        ))}
      </div>
    </div>
  );
}