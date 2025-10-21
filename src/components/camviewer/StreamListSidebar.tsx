import React, { useMemo, useState } from 'react';
import { Users, ChevronLeft, ChevronRight, Plus, Clipboard, Trash2, Star, Maximize2, Search, Sparkles, Grid2X2, Grid3X3, Grid, Columns } from 'lucide-react';
import { useGridStore } from '@/state/gridStore';
import { useSettingsStore, LayoutMode } from '@/state/settingsStore';
import { getUsernameFromUrl, generateThumbUrl } from '@/utils/formatters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';

export function StreamListSidebar() {
  const { addStream, streamUrls, favorites, playingStreams, removeStream, toggleFavorite, setFullViewMode } = useGridStore();
  const { sidebarVisible, sidebarCollapsed, toggleSidebarCollapse, setBrowserVisible, layoutMode, setLayoutMode } = useSettingsStore();
  const [newStreamUrl, setNewStreamUrl] = useState("");
  const [showAddInput, setShowAddInput] = useState(false);

  const handleAddStream = () => { if (newStreamUrl.trim()) { addStream(newStreamUrl.trim()); setNewStreamUrl(""); setShowAddInput(false); } };
  const handlePaste = async () => { try { const text = await navigator.clipboard.readText(); if (text.trim()) addStream(text.trim()); } catch (err) { console.error('Failed to read clipboard:', err); } };

  const streamData = useMemo(() => streamUrls.map((url, index) => { const username = getUsernameFromUrl(url); return { url, username: username ?? `stream-${index}`, thumb: generateThumbUrl(username), isFavorite: favorites.has(index), isPlaying: playingStreams.has(index) }; }), [streamUrls, favorites, playingStreams]);

  if (!sidebarVisible) return null;

  if (sidebarCollapsed) {
    return (
      <aside className="bg-neutral-800 border-r border-neutral-700 flex flex-col items-center p-2 gap-2 flex-shrink-0">
        <Button variant="ghost" size="icon" onClick={toggleSidebarCollapse} title="Expand Sidebar"><ChevronRight size={18} /></Button>
        <TooltipProvider>
            <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={() => setBrowserVisible(true)}><Search size={18} /></Button></TooltipTrigger><TooltipContent side="right">Browse Streams</TooltipContent></Tooltip>
            <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={handlePaste}><Clipboard size={18} /></Button></TooltipTrigger><TooltipContent side="right">Paste URL</TooltipContent></Tooltip>
            <Separator className="my-1 bg-white/10" />
            <Tooltip><TooltipTrigger asChild><Button variant={layoutMode === 'magic' ? 'secondary' : 'ghost'} size="icon" onClick={() => setLayoutMode('magic')}><Sparkles size={18} /></Button></TooltipTrigger><TooltipContent side="right">Magic Grid</TooltipContent></Tooltip>
            <Tooltip><TooltipTrigger asChild><Button variant={layoutMode === 2 ? 'secondary' : 'ghost'} size="icon" onClick={() => setLayoutMode(2)}><Grid2X2 size={18} /></Button></TooltipTrigger><TooltipContent side="right">2x2 Grid</TooltipContent></Tooltip>
            <Tooltip><TooltipTrigger asChild><Button variant={layoutMode === 3 ? 'secondary' : 'ghost'} size="icon" onClick={() => setLayoutMode(3)}><Grid3X3 size={18} /></Button></TooltipTrigger><TooltipContent side="right">3x3 Grid</TooltipContent></Tooltip>
            <Tooltip><TooltipTrigger asChild><Button variant={layoutMode === 4 ? 'secondary' : 'ghost'} size="icon" onClick={() => setLayoutMode(4)}><Grid size={18} /></Button></TooltipTrigger><TooltipContent side="right">4x4 Grid</TooltipContent></Tooltip>
            <Tooltip><TooltipTrigger asChild><Button variant={layoutMode === 'hierarchical' ? 'secondary' : 'ghost'} size="icon" onClick={() => setLayoutMode('hierarchical')}><Columns size={18} /></Button></TooltipTrigger><TooltipContent side="right">Focus Layout</TooltipContent></Tooltip>
        </TooltipProvider>
      </aside>
    );
  }

  return (
    <aside className="bg-neutral-800 border-r border-neutral-700 flex flex-col w-64 flex-shrink-0">
      <header className="p-2 border-b border-neutral-700 flex items-center justify-between"><h3 className="text-sm font-semibold text-white flex items-center gap-2"><Users size={16} /><span>Streams</span></h3><Button variant="ghost" size="icon" onClick={toggleSidebarCollapse}><ChevronLeft size={18} /></Button></header>
      <div className="p-2 border-b border-neutral-700 flex items-center justify-around"><Button variant="ghost" size="icon" onClick={() => setBrowserVisible(true)}><Search size={18} /></Button><Button variant="ghost" size="icon" onClick={() => setShowAddInput(!showAddInput)}><Plus size={18} /></Button><Button variant="ghost" size="icon" onClick={handlePaste}><Clipboard size={18} /></Button></div>
      {showAddInput && (<div className="p-2 border-b border-neutral-700 flex gap-2"><Input type="text" placeholder="Stream URL..." value={newStreamUrl} onChange={(e) => setNewStreamUrl(e.target.value)} className="h-9 text-xs" /><Button size="sm" onClick={handleAddStream}>Add</Button></div>)}
      <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar min-h-0">
        {streamData.map((stream, index) => (<div key={index} className="bg-neutral-700 rounded-lg p-2 hover:bg-neutral-600"><div className="flex items-center gap-2"><div className="relative w-12 h-12 rounded-md overflow-hidden flex-shrink-0"><img src={stream.thumb} alt={stream.username} className="w-full h-full object-cover" /><div className={`absolute bottom-0.5 right-0.5 w-2 h-2 rounded-full border border-neutral-700 ${stream.isPlaying ? "bg-green-500" : "bg-red-500"}`} /></div><div className="flex-1 min-w-0"><h4 className="text-sm font-medium text-white truncate">{stream.username}</h4><div className="flex items-center gap-1 mt-1"><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toggleFavorite(index)}><Star size={14} className={stream.isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-neutral-400'} /></Button><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setFullViewMode(index)}><Maximize2 size={14} className="text-neutral-400" /></Button><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeStream(index)}><Trash2 size={14} className="text-neutral-400 hover:text-red-400" /></Button></div></div></div></div>))}
      </div>
    </aside>
  );
}