// import React, { useMemo } from "react";
// import { useGridStore } from "@/state/gridStore";
// import { SortableWebview } from "./grid/SortableWebview";
// import { MinimizedStream } from "./MinimizedStream";

// export function FullViewLayout() {
//   const { fullViewMode, streamUrls } = useGridStore();

//   if (fullViewMode === null) return null;

//   const focusedStream = streamUrls[fullViewMode];
//   const minimizedStreams = useMemo(
//     () =>
//       streamUrls
//         .map((url, index) => ({ url, index }))
//         .filter((item) => item.index !== fullViewMode),
//     [streamUrls, fullViewMode],
//   );

//   return (
//     <div className="flex h-full flex-col">
//       <div className="relative flex-1">
//         {focusedStream && (
//           <SortableWebview
//             id={focusedStream}
//             url={focusedStream}
//             index={fullViewMode}
//           />
//         )}
//       </div>
//       <div className="custom-scrollbar-horizontal flex h-24 gap-2 overflow-x-auto border-t border-neutral-700 bg-neutral-800 p-2">
//         {minimizedStreams.map(({ url, index }) => (
//           <MinimizedStream key={url} url={url} index={index} />
//         ))}
//       </div>
//     </div>
//   );
// }




// import React, { useMemo } from 'react';
// import { useGridStore } from '@/state/gridStore';
// import { SortableWebview } from './grid/SortableWebview';
// import { MinimizedStream } from './MinimizedStream';

// export function FullViewLayout() {
//   const { fullViewMode, streamUrls } = useGridStore();

//   if (fullViewMode === null) return null;

//   const focusedStream = streamUrls[fullViewMode];
//   const minimizedStreams = useMemo(() => 
//     streamUrls.map((url, index) => ({ url, index }))
//               .filter(item => item.index !== fullViewMode),
//     [streamUrls, fullViewMode]
//   );
  
//   return (
//     <div className="flex flex-col h-full w-full">
//       {/* This flex-shrink-0 is the key fix to prevent the bottom bar from being pushed off-screen */}
//       <div className="flex-1 relative bg-black min-h-0">
//         {focusedStream && (
//             <SortableWebview 
//                 id={focusedStream} 
//                 url={focusedStream} 
//                 index={fullViewMode} 
//                 isFullViewMode={true}
//             />
//         )}
//       </div>
//       {/* This flex-shrink-0 ensures this bar always has its defined height */}
//       <div className="h-20 bg-neutral-800 border-t border-neutral-700 p-1.5 flex gap-1.5 overflow-x-auto custom-scrollbar-horizontal flex-shrink-0">
//         {minimizedStreams.map(({ url, index }) => (
//           <MinimizedStream key={url} url={url} index={index} />
//         ))}
//       </div>
//     </div>
//   );
// }




import React, { useMemo } from 'react';
import { useGridStore } from '@/state/gridStore';
import { SortableWebview } from './grid/SortableWebview';
import { MinimizedStream } from './MinimizedStream';

export function FullViewLayout() {
  const { fullViewMode, streamUrls } = useGridStore();

  if (fullViewMode === null) return null;

  const focusedStream = streamUrls[fullViewMode];
  const minimizedStreams = useMemo(() => 
    streamUrls.map((url, index) => ({ url, index }))
              .filter(item => item.index !== fullViewMode),
    [streamUrls, fullViewMode]
  );
  
  return (
    <div className="flex flex-col h-full w-full">
      {/* This flex-shrink-0 is the key fix to prevent the bottom bar from being pushed off-screen */}
      <div className="flex-1 relative bg-black min-h-0">
        {focusedStream && (
            <SortableWebview 
                id={focusedStream} 
                url={focusedStream} 
                index={fullViewMode} 
                isFullViewMode={true}
            />
        )}
      </div>
      {/* This flex-shrink-0 ensures this bar always has its defined height */}
      <div className="h-20 bg-neutral-800 border-t border-neutral-700 p-1.5 flex gap-1.5 overflow-x-auto custom-scrollbar-horizontal flex-shrink-0">
        {minimizedStreams.map(({ url, index }) => (
          <MinimizedStream key={url} url={url} index={index} />
        ))}
      </div>
    </div>
  );
}