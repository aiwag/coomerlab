import React, { useRef, useEffect } from 'react';
import { Search, X, AlertCircle, ArrowUp, SlidersHorizontal } from 'lucide-react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useBrowserStore } from '@/state/browserStore';
import { useSettingsStore } from '@/state/settingsStore';
import { useDebounce } from '@/hooks/useDebounce';
import { StreamerCard, StreamerCardSkeleton } from './StreamerCard';
import { FilterPanel } from './FilterPanel';
import { Button } from '@/components/ui/button';

export function StreamBrowserSidebar() {
  const { browserVisible, setBrowserVisible } = useSettingsStore();
  const { filteredStreamers, isLoading, error, fetchStreamers, setSearchTerm, searchTerm, executeSearch, setBrowseMode, browseMode, hasMore, cleanup, toggleFilterPanel } = useBrowserStore();
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({ count: hasMore ? filteredStreamers.length + 1 : filteredStreamers.length, getScrollElement: () => parentRef.current, estimateSize: () => 112, overscan: 5 });

  useEffect(() => { executeSearch(debouncedSearchTerm) }, [debouncedSearchTerm, executeSearch]);
  useEffect(() => { const items = rowVirtualizer.getVirtualItems(); if (!items.length) return; const last = items[items.length - 1]; if (last && last.index >= filteredStreamers.length - 1 && hasMore && !isLoading) fetchStreamers(true) }, [rowVirtualizer.getVirtualItems(), filteredStreamers.length, hasMore, isLoading, fetchStreamers]);
  
  // --- ROBUST LIFECYCLE MANAGEMENT ---
  useEffect(() => {
    if (browserVisible) {
      // Fetch initial data only if the list is empty
      if (filteredStreamers.length === 0) {
        fetchStreamers();
      }
    } else {
      // When the browser is hidden, call the cleanup action
      cleanup();
    }
    // The return function of useEffect is the cleanup
    return () => {
        cleanup();
    };
  }, [browserVisible]);

  if (!browserVisible) return null;

  const showBackToTop = rowVirtualizer.getVirtualItems().length > 0 && rowVirtualizer.getVirtualItems()[0].index > 5;

  return (
    <aside className="w-80 bg-neutral-900 border-r border-neutral-700 flex flex-col h-full relative">
      <header className="p-2 border-b border-neutral-700 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
            <Button variant={browseMode==='mostViewed'?'secondary':'ghost'} size="sm" onClick={() => setBrowseMode('mostViewed')}>View</Button>
            <Button variant={browseMode==='topRated'?'secondary':'ghost'} size="sm" onClick={() => setBrowseMode('topRated')}>Top</Button>
            <Button variant={browseMode==='trending'?'secondary':'ghost'} size="sm" onClick={() => setBrowseMode('trending')}>Trend</Button>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setBrowserVisible(false)}><X size={16}/></Button>
      </header>
      <div className="p-2 border-b border-neutral-700 flex-shrink-0 flex gap-2">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
          <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-neutral-800 border border-neutral-700 text-white pl-9 pr-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"/>
        </div>
        <Button variant="outline" size="icon" onClick={toggleFilterPanel}><SlidersHorizontal size={16}/></Button>
      </div>

      <FilterPanel />
      
      {error && <div className="p-2 text-center bg-red-900/30 text-xs text-red-200"><AlertCircle size={12} className="inline mr-1"/>{error}</div>}

      <div ref={parentRef} className="flex-1 overflow-y-auto custom-scrollbar">
        <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: 'relative' }}>
          {(isLoading && filteredStreamers.length === 0) && Array.from({ length: 5 }).map((_, i) => <StreamerCardSkeleton key={i} />)}
          
          {rowVirtualizer.getVirtualItems().map(item => {
            const isLoader = item.index > filteredStreamers.length - 1;
            const streamer = filteredStreamers[item.index];
            if (isLoader) return <div key="loader" className="flex justify-center items-center h-[112px]"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-500"/></div>;
            if (!streamer) return null;
            return (<div key={`${browseMode}-${streamer.username}`} style={{ position: 'absolute', top: 0, left: 0, width: '100%', transform: `translateY(${item.start}px)` }}><StreamerCard streamer={streamer}/></div>)
          })}
          {(!hasMore && !isLoading && filteredStreamers.length > 0) && <div className="text-center py-4 text-xs text-gray-500">End of results.</div>}
        </div>
      </div>
      
      {showBackToTop && <Button size="sm" className="absolute bottom-4 right-4 rounded-full" onClick={() => rowVirtualizer.scrollToIndex(0)}><ArrowUp size={16} className="mr-1"/>Back to Top</Button>}
    </aside>
  );
}