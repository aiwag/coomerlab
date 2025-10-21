// import React from "react";
// import {
//   Clock,
//   Activity,
//   Wifi,
//   Zap,
//   Maximize2,
//   Minimize2,
//   Settings,
//   ChevronLeft,
//   ChevronRight,
//   Search,
//   Layers,
// } from "lucide-react";
// import { useSettingsStore } from "@/state/settingsStore";
// import { useGridStore } from "@/state/gridStore";

// export function CompactToolbar() {
//   const {
//     gridSize,
//     setGridSize,
//     autoMode,
//     setAutoMode,
//     gridMode,
//     setGridMode,
//     sidebarVisible,
//     toggleSidebar,
//     sidebarCollapsed,
//     browserVisible,
//     setBrowserVisible,
//     fullViewMode,
//   } = useSettingsStore();

//   const handleSetFullViewMode = useGridStore((state) => state.setFullViewMode);

//   // Dummy metrics for display
//   const sessionTime = "00:12:34";
//   const bandwidth = "8.4MB/s";
//   const latency = "24ms";
//   const screenFps = "60FPS";

//   return (
//     <div className="flex items-center justify-between border-b border-neutral-700 bg-neutral-800 px-2 py-1 text-xs text-white select-none">
//       <div className="flex items-center gap-3">
//         <button
//           onClick={toggleSidebar}
//           className="rounded p-1 hover:bg-neutral-700"
//           title="Toggle Stream List"
//         >
//           {sidebarVisible ? (
//             <ChevronLeft size={16} />
//           ) : (
//             <ChevronRight size={16} />
//           )}
//         </button>
//         <button
//           onClick={() => setBrowserVisible(!browserVisible)}
//           className={`rounded p-1 ${browserVisible ? "bg-cyan-600" : "hover:bg-neutral-700"}`}
//           title="Toggle Stream Browser"
//         >
//           <Search size={16} />
//         </button>
//         {/* Status Indicators */}
//         <div className="hidden items-center gap-3 md:flex">
//           <div className="flex items-center gap-1">
//             <Clock size={14} className="text-cyan-400" />
//             <span>{sessionTime}</span>
//           </div>
//           <div className="flex items-center gap-1">
//             <Activity size={14} className="text-green-400" />
//             <span>{bandwidth}</span>
//           </div>
//           <div className="flex items-center gap-1">
//             <Wifi size={14} className="text-green-400" />
//             <span>{latency}</span>
//           </div>
//           <div className="flex items-center gap-1">
//             <Zap size={14} className="text-purple-400" />
//             <span>{screenFps}</span>
//           </div>
//         </div>
//       </div>

//       <div className="flex items-center gap-2">
//         {/* Grid Mode */}
//         <div className="flex items-center gap-1 rounded bg-neutral-700 p-0.5">
//           <button
//             onClick={() => setGridMode("standard")}
//             className={`rounded px-1.5 py-0.5 text-xs ${gridMode === "standard" ? "bg-cyan-600" : "hover:bg-neutral-600"}`}
//             title="Standard View"
//           >
//             <Layers size={12} /> Std
//           </button>
//           <button
//             onClick={() => setGridMode("professional")}
//             className={`rounded px-1.5 py-0.5 text-xs ${gridMode === "professional" ? "bg-cyan-600" : "hover:bg-neutral-600"}`}
//             title="Professional View"
//           >
//             <Layers size={12} /> Pro
//           </button>
//         </div>

//         {/* Grid Controls */}
//         <div className="flex items-center gap-1 rounded bg-neutral-700 p-0.5">
//           <button
//             onClick={() => setAutoMode(!autoMode)}
//             className={`rounded px-1.5 py-0.5 text-xs ${autoMode ? "bg-cyan-600" : "hover:bg-neutral-600"}`}
//             title="Auto Grid"
//           >
//             <Zap size={12} /> Auto
//           </button>
//           {!autoMode &&
//             [1, 2, 3, 4].map((size) => (
//               <button
//                 key={size}
//                 onClick={() => setGridSize(size)}
//                 className={`rounded px-2 py-0.5 text-xs ${gridSize === size ? "bg-cyan-600" : "hover:bg-neutral-600"}`}
//               >
//                 {size}x{size}
//               </button>
//             ))}
//         </div>

//         <button
//           onClick={() =>
//             handleSetFullViewMode(fullViewMode !== null ? null : 0)
//           }
//           className={`rounded p-1 ${fullViewMode !== null ? "bg-cyan-600" : "hover:bg-neutral-700"}`}
//           title="Toggle Full View"
//         >
//           {fullViewMode !== null ? (
//             <Minimize2 size={16} />
//           ) : (
//             <Maximize2 size={16} />
//           )}
//         </button>
//         <button className="rounded p-1 hover:bg-neutral-700" title="Settings">
//           <Settings size={16} />
//         </button>
//       </div>
//     </div>
//   );
// }




// src/components/camviewer/CompactToolbar.tsx
import React from 'react';
import { Sparkles, Maximize2, Minimize2 } from 'lucide-react';
import { useSettingsStore } from '@/state/settingsStore';
import { useGridStore } from '@/state/gridStore';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

export function GridControls() {
  const { magicGrid, toggleMagicGrid } = useSettingsStore();
  const { fullViewMode, setFullViewMode } = useGridStore();

  return (
    <div className="p-2 border-b border-neutral-700 bg-neutral-800 space-y-2">
        <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-white">View Controls</h3>
        </div>
        <div className="flex items-center gap-1">
            <TooltipProvider delayDuration={0}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant={magicGrid ? 'secondary' : 'ghost'} size="sm" className="flex-1" onClick={toggleMagicGrid}>
                            <Sparkles size={16} />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>Toggle Magic Grid (Auto-fit)</p></TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant={fullViewMode !== null ? 'secondary' : 'ghost'} size="sm" className="flex-1" onClick={() => setFullViewMode(fullViewMode !== null ? null : 0)}>
                           {fullViewMode !== null ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>Toggle Full View</p></TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    </div>
  );
}