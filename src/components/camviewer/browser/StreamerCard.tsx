// // src/components/camviewer/browser/StreamerCard.tsx

// import React from "react";
// import { Plus, Check } from "lucide-react";
// import { Streamer } from "@/services/chaturbateApiService";
// import { useGridStore } from "@/state/gridStore";
// import { formatNumber, getGenderColor } from "@/utils/formatters"; // We'll create this

// interface StreamerCardProps {
//   streamer: Streamer;
// }

// export const StreamerCard = React.memo(({ streamer }: StreamerCardProps) => {
//   const addStream = useGridStore((state) => state.addStream);

//   const handleAddStream = (e: React.MouseEvent) => {
//     e.stopPropagation();
//     addStream(`https://chaturbate.com/fullvideo/?b=${streamer.username}`);
//   };

//   return (
//     <div
//       className="m-2 cursor-pointer rounded-lg bg-neutral-700 p-1.5 transition-colors hover:bg-neutral-600"
//       onClick={handleAddStream}
//     >
//       <div className="flex items-center gap-2">
//         <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded">
//           <img
//             src={streamer.img}
//             alt={streamer.username}
//             className="h-full w-full object-cover"
//           />
//         </div>
//         <div className="min-w-0 flex-1">
//           <div className="flex items-center justify-between">
//             <h4 className="truncate text-sm font-medium text-white">
//               {streamer.username}
//             </h4>
//             <button
//               onClick={handleAddStream}
//               className="rounded bg-cyan-600 p-1 text-white hover:bg-cyan-700"
//               title="Add to Grid"
//             >
//               <Plus size={12} />
//             </button>
//           </div>
//           <div className="mt-1 flex items-center gap-3 text-xs text-gray-400">
//             <span>{formatNumber(streamer.num_users)} v</span>
//             <span>{formatNumber(streamer.num_followers)} f</span>
//           </div>
//           <div className="mt-1.5 flex items-center gap-1">
//             <span
//               className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${getGenderColor(streamer.gender)}`}
//             >
//               {streamer.gender.toUpperCase()}
//             </span>
//             {streamer.is_new && (
//               <span className="rounded-full bg-green-500 px-1.5 py-0.5 text-[10px] font-semibold">
//                 NEW
//               </span>
//             )}
//             {streamer.is_age_verified && (
//               <span className="flex items-center gap-0.5 rounded-full bg-blue-500 px-1.5 py-0.5 text-[10px] font-semibold">
//                 <Check size={8} /> 18+
//               </span>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// });




// src/components/camviewer/browser/StreamerCard.tsx

// import React from 'react';
// import { Plus, Check, User, Users } from 'lucide-react';
// import { Streamer } from '@/services/chaturbateApiService';
// import { useGridStore } from '@/state/gridStore';
// import { formatNumber, getGenderColor } from '@/utils/formatters';
// import { Badge } from '@/components/ui/badge';
// import { Button } from '@/components/ui/button';

// interface StreamerCardProps {
//   streamer: Streamer;
// }

// export const StreamerCard = React.memo(({ streamer }: StreamerCardProps) => {
//   const addStream = useGridStore((state) => state.addStream);

//   const handleAddStream = (e: React.MouseEvent) => {
//     e.stopPropagation();
//     addStream(`https://www.chaturbate.com/fullvideo/?b=${streamer.username}`);
//   };

//   const cleanSubject = streamer.subject.replace(/<[^>]*>?/gm, '');

//   return (
//     <div className="p-2">
//         <div className="bg-neutral-800 rounded-lg overflow-hidden border border-neutral-700 hover:border-cyan-500 transition-all group">
//             <div className="relative aspect-video cursor-pointer" onClick={handleAddStream}>
//                 <img src={streamer.img} alt={streamer.username} className="w-full h-full object-cover" />
//                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
//                 <div className="absolute top-2 left-2 flex items-center gap-1">
//                     <span className={`px-2 py-0.5 rounded-full text-xs font-bold text-white ${getGenderColor(streamer.gender)}`}>{streamer.gender.toUpperCase()}</span>
//                     {streamer.is_new && <Badge variant="destructive" className="text-xs">NEW</Badge>}
//                 </div>
//                 <div className="absolute bottom-2 left-2 right-2">
//                     <h3 className="text-white font-bold truncate">{streamer.username}</h3>
//                     <div className="flex items-center gap-4 text-xs text-neutral-300 mt-1">
//                         <div className="flex items-center gap-1"><Users size={14}/><span>{formatNumber(streamer.num_users)}</span></div>
//                         <div className="flex items-center gap-1"><User size={14}/><span>{streamer.display_age}</span></div>
//                         <div className="flex items-center gap-1"><span>{streamer.country}</span></div>
//                     </div>
//                 </div>
//             </div>
//             <div className="p-3">
//                 <p className="text-xs text-neutral-400 h-8 overflow-hidden">{cleanSubject}</p>
//                 <div className="flex flex-wrap gap-1 mt-2 h-12 overflow-hidden">
//                     {streamer.tags.slice(0, 5).map(tag => (
//                         <Badge key={tag} variant="secondary" className="text-xs cursor-pointer">{tag}</Badge>
//                     ))}
//                 </div>
//                  <Button size="sm" className="w-full mt-3" onClick={handleAddStream}>
//                     <Plus size={16} className="mr-2"/> Add to Grid
//                 </Button>
//             </div>
//         </div>
//     </div>
//   );
// });



import React from 'react';
import { Plus, Check, User, Users } from 'lucide-react';
import { Streamer } from '@/services/chaturbateApiService';
import { useGridStore } from '@/state/gridStore';
import { formatNumber, getGenderColor } from '@/utils/formatters';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface StreamerCardProps {
  streamer: Streamer;
}

export const StreamerCard = React.memo(({ streamer }: StreamerCardProps) => {
  const addStream = useGridStore((state) => state.addStream);

  const handleAddStream = (e: React.MouseEvent) => {
    e.stopPropagation();
    addStream(`https://www.chaturbate.com/fullvideo/?b=${streamer.username}`);
  };

  return (
    <div className="p-2">
        <div className="bg-neutral-800 rounded-lg overflow-hidden border border-neutral-700 hover:border-cyan-500 transition-all group flex">
            {/* Image and basic info */}
            <div className="w-24 h-24 relative flex-shrink-0 cursor-pointer" onClick={handleAddStream}>
                <img src={streamer.img} alt={streamer.username} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-1 left-1.5">
                    <h3 className="text-white font-bold text-sm truncate">{streamer.username}</h3>
                </div>
                 <div className="absolute top-1 left-1.5 flex items-center gap-1">
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold text-white ${getGenderColor(streamer.gender)}`}>{streamer.gender.toUpperCase()}</span>
                </div>
            </div>

            {/* Details and Actions */}
            <div className="p-2 flex flex-col justify-between flex-grow">
                <div>
                    <div className="flex items-center gap-3 text-xs text-neutral-300">
                        <div className="flex items-center gap-1" title="Viewers"><Users size={14}/><span>{formatNumber(streamer.num_users)}</span></div>
                        <div className="flex items-center gap-1" title="Age"><User size={14}/><span>{streamer.display_age}</span></div>
                        <div title="Country"><span>{streamer.country}</span></div>
                    </div>
                     <div className="flex flex-wrap gap-1 mt-2 max-h-10 overflow-hidden">
                        {streamer.tags.slice(0, 3).map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                        ))}
                    </div>
                </div>
                <Button size="icon" className="h-8 w-8 self-end" onClick={handleAddStream} title="Add to Grid">
                    <Plus size={16}/>
                </Button>
            </div>
        </div>
    </div>
  );
});