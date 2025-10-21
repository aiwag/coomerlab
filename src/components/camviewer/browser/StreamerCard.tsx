import React from 'react';
import { Plus, User, Users } from 'lucide-react';
import { Streamer } from '@/services/chaturbateApiService';
import { useGridStore } from '@/state/gridStore';
import { formatNumber, getGenderColor } from '@/utils/formatters';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface StreamerCardProps { streamer: Streamer; }

export const StreamerCardSkeleton = () => (<div className="p-2 animate-pulse"><div className="bg-neutral-800 rounded-lg border border-neutral-700 flex h-[96px]"><div className="w-24 bg-neutral-700"/><div className="p-2 flex flex-col justify-between flex-grow"><div><div className="h-4 w-3/4 bg-neutral-700 rounded"/><div className="flex gap-2 mt-2"><div className="h-3 w-10 bg-neutral-700 rounded"/><div className="h-3 w-10 bg-neutral-700 rounded"/></div></div><div className="h-8 w-8 bg-neutral-700 rounded self-end"/></div></div></div>);

export const StreamerCard = React.memo(({ streamer }: StreamerCardProps) => {
  const addStream = useGridStore((state) => state.addStream);
  const handleAddStream = (e: React.MouseEvent) => { e.stopPropagation(); addStream(`https://www.chaturbate.com/fullvideo/?b=${streamer.username}`); };

  return (
    <div className="p-2">
        <div className="bg-neutral-800 rounded-lg overflow-hidden border border-neutral-700 hover:border-cyan-500 transition-all group flex h-[96px]">
            <div className="w-24 relative flex-shrink-0 cursor-pointer" onClick={handleAddStream}>
                <img src={streamer.img} alt={streamer.username} className="w-full h-full object-cover" loading="lazy" />
                <div className="absolute top-1 left-1.5"><span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold text-white ${getGenderColor(streamer.gender)}`}>{streamer.gender.toUpperCase()}</span></div>
            </div>
            <div className="p-2 flex flex-col justify-between flex-grow min-w-0">
                <div>
                    <h3 className="text-white font-bold text-sm truncate">{streamer.username}</h3>
                    <div className="flex items-center gap-3 text-xs text-neutral-300 mt-1">
                        <div className="flex items-center gap-1" title="Viewers"><Users size={14}/><span>{formatNumber(streamer.num_users)}</span></div>
                        <div className="flex items-center gap-1" title="Age"><User size={14}/><span>{streamer.display_age}</span></div>
                        <div title="Country"><span>{streamer.country}</span></div>
                    </div>
                </div>
                 <Button size="icon" className="h-8 w-8 self-end flex-shrink-0" onClick={handleAddStream} title="Add to Grid"><Plus size={16}/></Button>
            </div>
        </div>
    </div>
  );
});