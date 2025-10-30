// import React, { useMemo, useState } from 'react';
// import { DndContext, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
// import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
// import { useGridStore } from '@/state/gridStore';
// import { useSettingsStore } from '@/state/settingsStore';
// import { SortableWebview } from './SortableWebview';
// import { getUsernameFromUrl, generateThumbUrl } from '@/utils/formatters';
// import { HierarchicalLayout } from './HierarchicalLayout';

// function DraggingItem({ url }: { url: string }) {
//     const username = getUsernameFromUrl(url);
//     const thumbUrl = generateThumbUrl(username);
//     return (<div className="rounded-md border-2 border-cyan-500 bg-neutral-800 shadow-2xl relative overflow-hidden h-full w-full"><img src={thumbUrl} className="w-full h-full object-cover opacity-30" alt="" /><div className="absolute inset-0 flex items-center justify-center"><p className="text-white font-semibold text-lg">{username}</p></div></div>);
// }

// export function StreamGrid() {
//   const { streamUrls, handleDragEnd } = useGridStore();
//   const { layoutMode } = useSettingsStore();
//   const [activeId, setActiveId] = useState<string | null>(null);

//   // This simple algorithm finds the most "square-like" grid configuration.
//   const gridStyle = useMemo(() => {
//     const count = streamUrls.length;
//     if (count === 0) return { gridTemplateColumns: '1fr' };

//     let cols = typeof layoutMode === 'number' ? layoutMode : Math.ceil(Math.sqrt(count));
//     let rows = Math.ceil(count / cols);

//     if (layoutMode === 'magic') {
//         // A simple optimization for aspect ratio
//         if (window.innerWidth > window.innerHeight) {
//             cols = Math.ceil(Math.sqrt(count * (window.innerWidth / window.innerHeight)));
//             rows = Math.ceil(count / cols);
//         } else {
//             rows = Math.ceil(Math.sqrt(count * (window.innerHeight / window.innerWidth)));
//             cols = Math.ceil(count / rows);
//         }
//     }
    
//     return {
//       gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
//       gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
//     };
//   }, [streamUrls.length, layoutMode]);
  
//   const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 10 } }));

//   // --- LAYOUT ROUTER ---
//   if (layoutMode === 'hierarchical') return <HierarchicalLayout />;

//   const isDraggable = layoutMode === 'magic' || typeof layoutMode === 'number';

//   return (
//     <DndContext sensors={sensors} onDragStart={(e) => setActiveId(e.active.id as string)} onDragEnd={(e) => { handleDragEnd(e); setActiveId(null); }}>
//       <SortableContext items={streamUrls} strategy={rectSortingStrategy}>
//         <div
//           className="h-full w-full grid bg-black gap-px" // Use CSS Grid
//           style={gridStyle}
//         >
//           {streamUrls.map((url, index) => (
//             <SortableWebview 
//                 key={url} 
//                 id={url} 
//                 url={url} 
//                 index={index}
//                 isDragging={activeId === url}
//                 isDraggable={isDraggable}
//             />
//           ))}
//         </div>
//       </SortableContext>
//       <DragOverlay>{activeId ? <DraggingItem url={activeId} /> : null}</DragOverlay>
//     </DndContext>
//   );
// }




import React, { useMemo, useState, useRef, useEffect } from 'react';
import { DndContext, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { useGridStore } from '@/state/gridStore';
import { useSettingsStore } from '@/state/settingsStore';
import { SortableWebview } from './SortableWebview';
import { getUsernameFromUrl, generateThumbUrl } from '@/utils/formatters';
import { HierarchicalLayout } from './HierarchicalLayout';

function DraggingItem({ url }: { url: string }) {
    const username = getUsernameFromUrl(url);
    const thumbUrl = generateThumbUrl(username);
    return (
        <div className="rounded-md border-2 border-cyan-500 bg-neutral-800 shadow-2xl relative overflow-hidden h-full w-full">
            <img src={thumbUrl} className="w-full h-full object-cover opacity-30" alt="" />
            <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-white font-semibold text-lg">{username}</p>
            </div>
        </div>
    );
}

export function StreamGrid() {
  const { streamUrls, handleDragEnd } = useGridStore();
  const { layoutMode } = useSettingsStore();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [webviewsReady, setWebviewsReady] = useState<Set<string>>(new Set());
  const gridRef = useRef<HTMLDivElement>(null);

  // This simple algorithm finds the most "square-like" grid configuration.
  const gridStyle = useMemo(() => {
    const count = streamUrls.length;
    if (count === 0) return { gridTemplateColumns: '1fr' };

    let cols = typeof layoutMode === 'number' ? layoutMode : Math.ceil(Math.sqrt(count));
    let rows = Math.ceil(count / cols);

    if (layoutMode === 'magic') {
        // A simple optimization for aspect ratio
        if (window.innerWidth > window.innerHeight) {
            cols = Math.ceil(Math.sqrt(count * (window.innerWidth / window.innerHeight)));
            rows = Math.ceil(count / cols);
        } else {
            rows = Math.ceil(Math.sqrt(count * (window.innerHeight / window.innerWidth)));
            cols = Math.ceil(count / rows);
        }
    }
    
    return {
      gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
      gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
    };
  }, [streamUrls.length, layoutMode]);
  
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 10 } }));

  // Function to mark a WebView as ready
  const markWebviewReady = (url: string) => {
    setWebviewsReady(prev => new Set(prev).add(url));
  };

  // Function to check if a WebView is ready
  const isWebviewReady = (url: string) => {
    return webviewsReady.has(url);
  };

  // --- LAYOUT ROUTER ---
  if (layoutMode === 'hierarchical') return <HierarchicalLayout />;

  const isDraggable = layoutMode === 'magic' || typeof layoutMode === 'number';

  return (
    <DndContext 
      sensors={sensors} 
      onDragStart={(e) => setActiveId(e.active.id as string)} 
      onDragEnd={(e) => { 
        // Only handle drag end if the webview is ready
        if (isWebviewReady(e.active.id as string)) {
          handleDragEnd(e); 
        }
        setActiveId(null); 
      }}
    >
      <SortableContext items={streamUrls} strategy={rectSortingStrategy}>
        <div
          ref={gridRef}
          className="h-full w-full grid bg-black gap-px" // Use CSS Grid
          style={gridStyle}
        >
          {streamUrls.map((url, index) => (
            <SortableWebview 
                key={url} 
                id={url} 
                url={url} 
                index={index}
                isDragging={activeId === url}
                isDraggable={isDraggable}
                onWebviewReady={() => markWebviewReady(url)}
                isWebviewReady={isWebviewReady(url)}
            />
          ))}
        </div>
      </SortableContext>
      <DragOverlay>
        {activeId ? <DraggingItem url={activeId} /> : null}
      </DragOverlay>
    </DndContext>
  );
}