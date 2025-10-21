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