// import React, { useMemo } from "react";
// import {
//   Users,
//   ChevronLeft,
//   ChevronRight,
//   Plus,
//   Clipboard,
//   Trash2,
//   Star,
//   Maximize2,
// } from "lucide-react";
// import { useGridStore } from "@/state/gridStore";
// import { useSettingsStore } from "@/state/settingsStore";

// export function StreamListSidebar() {
//   const {
//     streamUrls,
//     favorites,
//     playingStreams,
//     removeStream,
//     toggleFavorite,
//     setFullViewMode,
//   } = useGridStore();
//   const { sidebarVisible, sidebarCollapsed, toggleSidebarCollapse } =
//     useSettingsStore();

//   const streamData = useMemo(() => {
//     return streamUrls.map((url, index) => {
//       const usernameMatch = url.match(/chaturbate\.com\/([^/]+)/);
//       const username = usernameMatch ? usernameMatch[1] : `stream-${index}`;
//       const thumb = `https://jpeg.live.mmcdn.com/stream?room=${username}`;
//       return {
//         url,
//         username,
//         thumb,
//         isFavorite: favorites.has(index),
//         isPlaying: playingStreams.has(index),
//       };
//     });
//   }, [streamUrls, favorites, playingStreams]);

//   if (!sidebarVisible) return null;

//   return (
//     <aside
//       className={`flex flex-col border-r border-neutral-700 bg-neutral-800 transition-all duration-300 ${sidebarCollapsed ? "w-14" : "w-64"}`}
//     >
//       <header className="flex items-center justify-between border-b border-neutral-700 p-2">
//         {!sidebarCollapsed && (
//           <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
//             <Users size={16} />
//             <span>Streams</span>
//           </h3>
//         )}
//         <button
//           onClick={toggleSidebarCollapse}
//           className="rounded p-1 hover:bg-neutral-700"
//           title={sidebarCollapsed ? "Expand" : "Collapse"}
//         >
//           {sidebarCollapsed ? (
//             <ChevronRight size={16} />
//           ) : (
//             <ChevronLeft size={16} />
//           )}
//         </button>
//       </header>

//       {!sidebarCollapsed && (
//         <>
//           <div className="flex items-center justify-around border-b border-neutral-700 p-2">
//             <button
//               className="rounded p-1 hover:bg-neutral-700"
//               title="Add Stream"
//             >
//               <Plus size={16} />
//             </button>
//             <button
//               className="rounded p-1 hover:bg-neutral-700"
//               title="Paste from Clipboard"
//             >
//               <Clipboard size={16} />
//             </button>
//           </div>
//           <div className="custom-scrollbar flex-1 space-y-2 overflow-y-auto p-2">
//             {streamData.map((stream, index) => (
//               <div
//                 key={stream.url}
//                 className="rounded-lg bg-neutral-700 p-2 transition-colors hover:bg-neutral-600"
//               >
//                 <div className="flex items-center gap-2">
//                   <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded">
//                     <img
//                       src={stream.thumb}
//                       alt={stream.username}
//                       className="h-full w-full object-cover"
//                     />
//                     <div
//                       className={`absolute right-0.5 bottom-0.5 h-2 w-2 rounded-full border border-neutral-700 ${stream.isPlaying ? "bg-green-500" : "bg-red-500"}`}
//                     />
//                   </div>
//                   <div className="min-w-0 flex-1">
//                     <h4 className="truncate text-sm font-medium text-white">
//                       {stream.username}
//                     </h4>
//                     <div className="mt-1 flex items-center gap-1">
//                       <button
//                         onClick={() => toggleFavorite(index)}
//                         className="p-1 text-neutral-400 hover:text-white"
//                         title="Favorite"
//                       >
//                         <Star
//                           size={14}
//                           className={
//                             stream.isFavorite
//                               ? "fill-yellow-400 text-yellow-400"
//                               : ""
//                           }
//                         />
//                       </button>
//                       <button
//                         onClick={() => setFullViewMode(index)}
//                         className="p-1 text-neutral-400 hover:text-white"
//                         title="Focus View"
//                       >
//                         <Maximize2 size={14} />
//                       </button>
//                       <button
//                         onClick={() => removeStream(index)}
//                         className="p-1 text-neutral-400 hover:text-red-400"
//                         title="Remove Stream"
//                       >
//                         <Trash2 size={14} />
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </>
//       )}
//     </aside>
//   );
// }






// // src/components/camviewer/StreamListSidebar.tsx

// import React, { useMemo } from 'react';
// import { Users, ChevronLeft, ChevronRight, Plus, Clipboard, Trash2, Star, Maximize2 } from 'lucide-react';
// import { useGridStore } from '@/state/gridStore';
// import { useSettingsStore } from '@/state/settingsStore';
// import { CompactToolbar } from './CompactToolbar';
// import { getUsernameFromUrl, generateThumbUrl } from '@/utils/formatters';

// export function StreamListSidebar() {
//   const { streamUrls, favorites, playingStreams, removeStream, toggleFavorite, setFullViewMode } = useGridStore();
//   const { sidebarVisible, sidebarCollapsed, toggleSidebarCollapse } = useSettingsStore();

//   const streamData = useMemo(() => {
//     return streamUrls.map((url, index) => {
//       const username = getUsernameFromUrl(url);
//       return {
//         url,
//         username: username ?? `stream-${index}`,
//         thumb: generateThumbUrl(username),
//         isFavorite: favorites.has(index),
//         isPlaying: playingStreams.has(index),
//       };
//     });
//   }, [streamUrls, favorites, playingStreams]);

//   if (!sidebarVisible) return null;

//   return (
//     <aside className={`bg-neutral-800 border-r border-neutral-700 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'w-14' : 'w-64'}`}>
//       <header className="p-2 border-b border-neutral-700 flex items-center justify-between flex-shrink-0">
//         {!sidebarCollapsed && <h3 className="text-sm font-semibold text-white flex items-center gap-2"><Users size={16} /><span>Streams</span></h3>}
//         <button onClick={toggleSidebarCollapse} className="p-1 rounded hover:bg-neutral-700" title={sidebarCollapsed ? "Expand" : "Collapse"}>
//           {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
//         </button>
//       </header>
      
//       {!sidebarCollapsed && (
//         <>
//             <div className="p-2 border-b border-neutral-700 flex items-center justify-around">
//                 <button className="p-1 rounded hover:bg-neutral-700" title="Add Stream"><Plus size={16} /></button>
//                 <button className="p-1 rounded hover:bg-neutral-700" title="Paste from Clipboard"><Clipboard size={16} /></button>
//             </div>
            
//             {/* Toolbar is now inside the sidebar */}
//             <CompactToolbar />
            
//             <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
//                 {streamData.map((stream, index) => (
//                     <div key={stream.url} className="bg-neutral-700 rounded-lg p-2 hover:bg-neutral-600 transition-colors">
//                         <div className="flex items-center gap-2">
//                             <div className="relative w-12 h-12 rounded overflow-hidden flex-shrink-0">
//                                 <img src={stream.thumb} alt={stream.username} className="w-full h-full object-cover" />
//                                 <div className={`absolute bottom-0.5 right-0.5 w-2 h-2 rounded-full border border-neutral-700 ${stream.isPlaying ? "bg-green-500" : "bg-red-500"}`} />
//                             </div>
//                             <div className="flex-1 min-w-0">
//                                 <h4 className="text-sm font-medium text-white truncate">{stream.username}</h4>
//                                 <div className="flex items-center gap-1 mt-1">
//                                     <button onClick={() => toggleFavorite(index)} className="p-1 text-neutral-400 hover:text-white" title="Favorite"><Star size={14} className={stream.isFavorite ? 'fill-yellow-400 text-yellow-400' : ''} /></button>
//                                     <button onClick={() => setFullViewMode(index)} className="p-1 text-neutral-400 hover:text-white" title="Focus View"><Maximize2 size={14} /></button>
//                                     <button onClick={() => removeStream(index)} className="p-1 text-neutral-400 hover:text-red-400" title="Remove Stream"><Trash2 size={14} /></button>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 ))}
//             </div>
//         </>
//       )}
//     </aside>
//   );
// }


// // src/components/camviewer/StreamListSidebar.tsx

// import React, { useMemo, useState } from 'react';
// import { Users, ChevronLeft, ChevronRight, Plus, Clipboard, Trash2, Star, Maximize2, Search } from 'lucide-react';
// import { useGridStore } from '@/state/gridStore';
// import { useSettingsStore } from '@/state/settingsStore';
// import { CompactToolbar } from './CompactToolbar';
// import { getUsernameFromUrl, generateThumbUrl } from '@/utils/formatters';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// export function StreamListSidebar() {
//   const { addStream, streamUrls, favorites, playingStreams, removeStream, toggleFavorite, setFullViewMode } = useGridStore();
//   const { sidebarVisible, sidebarCollapsed, toggleSidebarCollapse, setBrowserVisible } = useSettingsStore();

//   // State for the new stream URL input
//   const [newStreamUrl, setNewStreamUrl] = useState("");
//   const [showAddInput, setShowAddInput] = useState(false);

//   const handleAddStream = () => {
//     if (newStreamUrl.trim()) {
//       addStream(newStreamUrl.trim());
//       setNewStreamUrl("");
//       setShowAddInput(false);
//     }
//   };

//   const handlePaste = async () => {
//     try {
//       const text = await navigator.clipboard.readText();
//       if (text.trim()) {
//         addStream(text.trim());
//       }
//     } catch (err) {
//       console.error('Failed to read clipboard:', err);
//       // You could show a notification here
//     }
//   };

//   const streamData = useMemo(() => {
//     return streamUrls.map((url, index) => {
//       const username = getUsernameFromUrl(url);
//       return {
//         url,
//         username: username ?? `stream-${index}`,
//         thumb: generateThumbUrl(username),
//         isFavorite: favorites.has(index),
//         isPlaying: playingStreams.has(index),
//       };
//     });
//   }, [streamUrls, favorites, playingStreams]);

//   if (!sidebarVisible) return null;

//   // Collapsed View
//   if (sidebarCollapsed) {
//     return (
//       <aside className="bg-neutral-800 border-r border-neutral-700 flex flex-col items-center p-2 gap-2">
//         <Button variant="ghost" size="icon" onClick={toggleSidebarCollapse} title="Expand Sidebar">
//           <ChevronRight size={18} />
//         </Button>
//         <TooltipProvider>
//             <Tooltip>
//                 <TooltipTrigger asChild>
//                     <Button variant="ghost" size="icon" onClick={() => setBrowserVisible(true)} title="Browse Streams">
//                         <Search size={18} />
//                     </Button>
//                 </TooltipTrigger>
//                 <TooltipContent side="right"><p>Browse Streams</p></TooltipContent>
//             </Tooltip>
//             <Tooltip>
//                 <TooltipTrigger asChild>
//                     <Button variant="ghost" size="icon" onClick={() => setShowAddInput(!showAddInput)} title="Add Stream URL">
//                         <Plus size={18} />
//                     </Button>
//                 </TooltipTrigger>
//                  <TooltipContent side="right"><p>Add Stream URL</p></TooltipContent>
//             </Tooltip>
//              <Tooltip>
//                 <TooltipTrigger asChild>
//                     <Button variant="ghost" size="icon" onClick={handlePaste} title="Paste from Clipboard">
//                         <Clipboard size={18} />
//                     </Button>
//                 </TooltipTrigger>
//                 <TooltipContent side="right"><p>Paste from Clipboard</p></TooltipContent>
//             </Tooltip>
//         </TooltipProvider>
//       </aside>
//     );
//   }

//   // Expanded View
//   return (
//     <aside className={`bg-neutral-800 border-r border-neutral-700 flex flex-col transition-all duration-300 w-64`}>
//       <header className="p-2 border-b border-neutral-700 flex items-center justify-between flex-shrink-0">
//         <h3 className="text-sm font-semibold text-white flex items-center gap-2"><Users size={16} /><span>Streams</span></h3>
//         <Button variant="ghost" size="icon" onClick={toggleSidebarCollapse} title="Collapse Sidebar">
//             <ChevronLeft size={18} />
//         </Button>
//       </header>
      
//         <div className="p-2 border-b border-neutral-700 flex items-center justify-around">
//             <Button variant="ghost" size="icon" onClick={() => setBrowserVisible(true)} title="Browse Streams"><Search size={18} /></Button>
//             <Button variant="ghost" size="icon" onClick={() => setShowAddInput(!showAddInput)} title="Add Stream URL"><Plus size={18} /></Button>
//             <Button variant="ghost" size="icon" onClick={handlePaste} title="Paste from Clipboard"><Clipboard size={18} /></Button>
//         </div>
        
//         {showAddInput && (
//             <div className="p-2 border-b border-neutral-700 flex gap-2">
//                 <Input 
//                     type="text"
//                     placeholder="Stream URL..."
//                     value={newStreamUrl}
//                     onChange={(e) => setNewStreamUrl(e.target.value)}
//                     className="h-9 text-xs"
//                 />
//                 <Button size="sm" onClick={handleAddStream}>Add</Button>
//             </div>
//         )}
        
//         <CompactToolbar />
        
//         <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
//             {streamData.map((stream, index) => (
//                 <div key={stream.url} className="bg-neutral-700 rounded-lg p-2 hover:bg-neutral-600 transition-colors">
//                     <div className="flex items-center gap-2">
//                         <div className="relative w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
//                             <img src={stream.thumb} alt={stream.username} className="w-full h-full object-cover" />
//                             <div className={`absolute bottom-0.5 right-0.5 w-2 h-2 rounded-full border border-neutral-700 ${stream.isPlaying ? "bg-green-500" : "bg-red-500"}`} />
//                         </div>
//                         <div className="flex-1 min-w-0">
//                             <h4 className="text-sm font-medium text-white truncate">{stream.username}</h4>
//                             <div className="flex items-center gap-1 mt-1">
//                                 <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toggleFavorite(index)} title="Favorite"><Star size={14} className={stream.isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-neutral-400'} /></Button>
//                                 <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setFullViewMode(index)} title="Focus View"><Maximize2 size={14} className="text-neutral-400" /></Button>
//                                 <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeStream(index)} title="Remove Stream"><Trash2 size={14} className="text-neutral-400 hover:text-red-400" /></Button>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             ))}
//         </div>
//     </aside>
//   );
// }




import React, { useMemo, useState } from 'react';
import { Users, ChevronLeft, ChevronRight, Plus, Clipboard, Trash2, Star, Maximize2, Minimize2, Search, Sparkles } from 'lucide-react';
import { useGridStore } from '@/state/gridStore';
import { useSettingsStore } from '@/state/settingsStore';
import { getUsernameFromUrl, generateThumbUrl } from '@/utils/formatters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// A new, small component for the grid controls in the collapsed sidebar
function CollapsedGridControls() {
    const { magicGrid, toggleMagicGrid } = useSettingsStore();
    const { fullViewMode, setFullViewMode } = useGridStore();

    return (
        <>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant={magicGrid ? 'secondary' : 'ghost'} size="icon" onClick={toggleMagicGrid}>
                        <Sparkles size={18} />
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="right"><p>Toggle Magic Grid</p></TooltipContent>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant={fullViewMode !== null ? 'secondary' : 'ghost'} size="icon" onClick={() => setFullViewMode(fullViewMode !== null ? null : 0)}>
                        {fullViewMode !== null ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="right"><p>Toggle Full View</p></TooltipContent>
            </Tooltip>
        </>
    );
}

export function StreamListSidebar() {
  const { addStream, streamUrls, favorites, playingStreams, removeStream, toggleFavorite, setFullViewMode } = useGridStore();
  const { sidebarVisible, sidebarCollapsed, toggleSidebarCollapse, setBrowserVisible } = useSettingsStore();

  const [newStreamUrl, setNewStreamUrl] = useState("");
  const [showAddInput, setShowAddInput] = useState(false);

  const handleAddStream = () => { if (newStreamUrl.trim()) { addStream(newStreamUrl.trim()); setNewStreamUrl(""); setShowAddInput(false); } };
  const handlePaste = async () => { try { const text = await navigator.clipboard.readText(); if (text.trim()) addStream(text.trim()); } catch (err) { console.error('Failed to read clipboard:', err); } };

  const streamData = useMemo(() => {
    return streamUrls.map((url, index) => {
      const username = getUsernameFromUrl(url);
      return { url, username: username ?? `stream-${index}`, thumb: generateThumbUrl(username), isFavorite: favorites.has(index), isPlaying: playingStreams.has(index) };
    });
  }, [streamUrls, favorites, playingStreams]);

  if (!sidebarVisible) return null;

  if (sidebarCollapsed) {
    return (
      <aside className="bg-neutral-800 border-r border-neutral-700 flex flex-col items-center p-2 gap-2">
        <Button variant="ghost" size="icon" onClick={toggleSidebarCollapse} title="Expand Sidebar"><ChevronRight size={18} /></Button>
        <TooltipProvider>
            <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={() => setBrowserVisible(true)}><Search size={18} /></Button></TooltipTrigger><TooltipContent side="right"><p>Browse Streams</p></TooltipContent></Tooltip>
            <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={handlePaste}><Clipboard size={18} /></Button></TooltipTrigger><TooltipContent side="right"><p>Paste URL</p></TooltipContent></Tooltip>
            {/* The new controls are here */}
            <CollapsedGridControls />
        </TooltipProvider>
      </aside>
    );
  }

  return (
    <aside className="bg-neutral-800 border-r border-neutral-700 flex flex-col transition-all duration-300 w-64">
      <header className="p-2 border-b border-neutral-700 flex items-center justify-between flex-shrink-0">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2"><Users size={16} /><span>Streams</span></h3>
        <Button variant="ghost" size="icon" onClick={toggleSidebarCollapse} title="Collapse Sidebar"><ChevronLeft size={18} /></Button>
      </header>
        <div className="p-2 border-b border-neutral-700 flex items-center justify-around">
            <Button variant="ghost" size="icon" onClick={() => setBrowserVisible(true)} title="Browse Streams"><Search size={18} /></Button>
            <Button variant="ghost" size="icon" onClick={() => setShowAddInput(!showAddInput)} title="Add Stream URL"><Plus size={18} /></Button>
            <Button variant="ghost" size="icon" onClick={handlePaste} title="Paste from Clipboard"><Clipboard size={18} /></Button>
        </div>
        {showAddInput && (<div className="p-2 border-b border-neutral-700 flex gap-2"><Input type="text" placeholder="Stream URL..." value={newStreamUrl} onChange={(e) => setNewStreamUrl(e.target.value)} className="h-9 text-xs" /><Button size="sm" onClick={handleAddStream}>Add</Button></div>)}
        
        {/* We no longer need the separate GridControls component here, simplifying the structure */}
        
        <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
            {streamData.map((stream, index) => (<div key={index} className="bg-neutral-700 rounded-lg p-2 hover:bg-neutral-600 transition-colors"><div className="flex items-center gap-2"><div className="relative w-12 h-12 rounded-md overflow-hidden flex-shrink-0"><img src={stream.thumb} alt={stream.username} className="w-full h-full object-cover" /><div className={`absolute bottom-0.5 right-0.5 w-2 h-2 rounded-full border border-neutral-700 ${stream.isPlaying ? "bg-green-500" : "bg-red-500"}`} /></div><div className="flex-1 min-w-0"><h4 className="text-sm font-medium text-white truncate">{stream.username}</h4><div className="flex items-center gap-1 mt-1"><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toggleFavorite(index)} title="Favorite"><Star size={14} className={stream.isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-neutral-400'} /></Button><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setFullViewMode(index)} title="Focus View"><Maximize2 size={14} className="text-neutral-400" /></Button><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeStream(index)} title="Remove Stream"><Trash2 size={14} className="text-neutral-400 hover:text-red-400" /></Button></div></div></div></div>))}
        </div>
    </aside>
  );
}