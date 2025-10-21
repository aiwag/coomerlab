// // src/components/camviewer/grid/StreamGrid.tsx

// import React, { useMemo, useCallback } from "react";
// import {
//   DndContext,
//   PointerSensor,
//   useSensor,
//   useSensors,
//   DragOverlay,
// } from "@dnd-kit/core";
// import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
// import { useGridStore } from "@/state/gridStore";
// import { useSettingsStore } from "@/state/settingsStore";
// import { SortableWebview } from "./SortableWebview";

// export function StreamGrid() {
//   const { streamUrls, handleDragStart, handleDragEnd, activeId } =
//     useGridStore();
//   const { gridSize, autoMode } = useSettingsStore();

//   const sensors = useSensors(
//     useSensor(PointerSensor, { activationConstraint: { distance: 10 } }),
//   );

//   const calculateOptimalGrid = useCallback(() => {
//     if (!autoMode) return gridSize;
//     const count = streamUrls.length;
//     if (count <= 1) return 1;
//     if (count <= 4) return 2;
//     if (count <= 9) return 3;
//     return 4; // Max auto size
//   }, [autoMode, gridSize, streamUrls.length]);

//   const finalGridSize = useMemo(calculateOptimalGrid, [calculateOptimalGrid]);

//   return (
//     <DndContext
//       sensors={sensors}
//       onDragStart={handleDragStart}
//       onDragEnd={handleDragEnd}
//     >
//       <SortableContext items={streamUrls} strategy={rectSortingStrategy}>
//         <div
//           className="custom-scrollbar grid h-full gap-1.5 overflow-y-auto p-1.5"
//           style={{
//             gridTemplateColumns: `repeat(${finalGridSize}, minmax(0, 1fr))`,
//           }}
//         >
//           {streamUrls.map((url, index) => (
//             <SortableWebview key={url} id={url} url={url} index={index} />
//           ))}
//         </div>
//       </SortableContext>
//       <DragOverlay>
//         {activeId ? (
//           <div className="flex aspect-video items-center justify-center rounded-md border border-cyan-500 bg-neutral-800 p-1 text-white">
//             Dragging {activeId.split("/").pop()}
//           </div>
//         ) : null}
//       </DragOverlay>
//     </DndContext>
//   );
// }





// src/components/camviewer/grid/StreamGrid.tsx

import React, { useMemo } from 'react';
import { DndContext, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { useGridStore } from '@/state/gridStore';
import { useSettingsStore } from '@/state/settingsStore';
import { useResizeObserver } from '@/hooks/useResizeObserver';
import { SortableWebview } from './SortableWebview';
import { getUsernameFromUrl } from '@/utils/formatters';

const TARGET_RATIO = 16 / 9; // Target a "watchable" 16:9 aspect ratio for each cell

export function StreamGrid() {
  const { streamUrls, handleDragStart, handleDragEnd, activeId } = useGridStore();
  const { magicGrid } = useSettingsStore();
  const { ref, entry } = useResizeObserver<HTMLDivElement>();

  const optimalColumns = useMemo(() => {
    if (!magicGrid || !entry || streamUrls.length === 0) {
      return Math.ceil(Math.sqrt(streamUrls.length)) || 1; // Default to a simple square grid
    }

    const containerWidth = entry.contentRect.width;
    const containerHeight = entry.contentRect.height;
    let bestLayout = { cols: 1, ratioDiff: Infinity };

    // Iterate through possible column counts to find the best fit
    for (let cols = 1; cols <= streamUrls.length; cols++) {
      const rows = Math.ceil(streamUrls.length / cols);
      const cellWidth = containerWidth / cols;
      const cellHeight = containerHeight / rows;
      const currentRatio = cellWidth / cellHeight;
      const ratioDiff = Math.abs(currentRatio - TARGET_RATIO);
      
      if (ratioDiff < bestLayout.ratioDiff) {
        bestLayout = { cols, ratioDiff };
      }
    }
    return bestLayout.cols;
  }, [magicGrid, entry, streamUrls.length]);
  
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 10 } }));

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <SortableContext items={streamUrls} strategy={rectSortingStrategy}>
        <div
          ref={ref}
          className="h-full w-full grid bg-black custom-scrollbar overflow-hidden gap-px"
          style={{ gridTemplateColumns: `repeat(${optimalColumns}, minmax(0, 1fr))` }}
        >
          {streamUrls.map((url, index) => (
            <SortableWebview key={url} id={url} url={url} index={index} />
          ))}
        </div>
      </SortableContext>
      <DragOverlay>
        {activeId ? <div className="aspect-video p-1 rounded-md border border-cyan-500 bg-neutral-800 flex items-center justify-center text-white font-semibold">{getUsernameFromUrl(activeId) ?? '...'}</div> : null}
      </DragOverlay>
    </DndContext>
  );
}