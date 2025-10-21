import React, { useState } from 'react';
import { DndContext, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import { useGridStore } from '@/state/gridStore';
import { useSettingsStore } from '@/state/settingsStore';
import { useResizeObserver } from '@/hooks/useResizeObserver';
import { useMagicGrid } from '@/hooks/useMagicGrid';
import { SortableWebview } from './SortableWebview';
import { getUsernameFromUrl, generateThumbUrl } from '@/utils/formatters';
import { HierarchicalLayout } from './HierarchicalLayout';

function DraggingItem({ url }: { url: string }) {
    const username = getUsernameFromUrl(url);
    const thumbUrl = generateThumbUrl(username);
    return (<div className="rounded-md border-2 border-cyan-500 bg-neutral-800 shadow-2xl relative overflow-hidden h-full w-full"><img src={thumbUrl} className="w-full h-full object-cover opacity-30" alt="" /><div className="absolute inset-0 flex items-center justify-center"><p className="text-white font-semibold text-lg">{username}</p></div></div>);
}

export function StreamGrid() {
  const { streamUrls, handleDragEnd } = useGridStore();
  const { layoutMode } = useSettingsStore();
  const { ref, entry } = useResizeObserver<HTMLDivElement>();
  const [activeId, setActiveId] = useState<string | null>(null);

  const containerWidth = entry?.contentRect.width || 0;
  const containerHeight = entry?.contentRect.height || 0;

  const { columns: magicColumns, cellWidth, cellHeight } = useMagicGrid({
    containerWidth,
    containerHeight,
    streamCount: streamUrls.length,
  });
  
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 10 } }));

  // --- LAYOUT ROUTER ---
  if (layoutMode === 'hierarchical') return <HierarchicalLayout />;

  const columns = typeof layoutMode === 'number' ? layoutMode : magicColumns;
  const isDraggable = typeof layoutMode === 'number' || layoutMode === 'magic';

  return (
    <DndContext sensors={sensors} onDragStart={(e) => setActiveId(e.active.id as string)} onDragEnd={(e) => { handleDragEnd(e); setActiveId(null); }}>
      <SortableContext items={streamUrls}>
        <div ref={ref} className="h-full w-full bg-black relative overflow-hidden">
          {streamUrls.map((url, index) => {
            const calculatedWidth = layoutMode === 'magic' ? cellWidth : containerWidth / columns;
            const calculatedHeight = layoutMode === 'magic' ? cellHeight : calculatedWidth / (16/9);
            const col = index % columns;
            const row = Math.floor(index / columns);
            const top = row * calculatedHeight;
            const left = col * calculatedWidth;

            if (calculatedWidth === 0 || calculatedHeight === 0) return null;

            return (
              <SortableWebview 
                  key={url} id={url} url={url} index={index}
                  isDragging={activeId === url}
                  isDraggable={isDraggable}
                  width={calculatedWidth} height={calculatedHeight} top={top} left={left}
              />
            );
          })}
        </div>
      </SortableContext>
      <DragOverlay>{activeId ? <DraggingItem url={activeId} /> : null}</DragOverlay>
    </DndContext>
  );
}