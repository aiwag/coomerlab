import React, { useMemo, useCallback } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import { useGridStore } from "@/state/gridStore";
import { useSettingsStore } from "@/state/settingsStore";
import { SortableWebview } from "./SortableWebview";

export function StreamGrid() {
  const { streamUrls, handleDragStart, handleDragEnd, activeId } =
    useGridStore();
  const { gridSize, autoMode } = useSettingsStore();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 10 } }),
  );

  const calculateOptimalGrid = useCallback(() => {
    if (!autoMode) return gridSize;
    const count = streamUrls.length;
    if (count <= 1) return 1;
    if (count <= 4) return 2;
    if (count <= 9) return 3;
    return 4; // Max auto size
  }, [autoMode, gridSize, streamUrls.length]);

  const finalGridSize = useMemo(calculateOptimalGrid, [calculateOptimalGrid]);

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={streamUrls} strategy={rectSortingStrategy}>
        <div
          className="custom-scrollbar grid h-full gap-1.5 overflow-y-auto p-1.5"
          style={{
            gridTemplateColumns: `repeat(${finalGridSize}, minmax(0, 1fr))`,
          }}
        >
          {streamUrls.map((url, index) => (
            <SortableWebview key={url} id={url} url={url} index={index} />
          ))}
        </div>
      </SortableContext>
      <DragOverlay>
        {activeId ? (
          <div className="flex aspect-video items-center justify-center rounded-md border border-cyan-500 bg-neutral-800 p-1 text-white">
            Dragging {activeId.split("/").pop()}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
