// import React, { useRef, useEffect, useState, useCallback } from "react";
// import { useSortable } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";
// import { GripVertical } from "lucide-react";
// import { useGridStore } from "@/state/gridStore";
// import { StreamControls } from "./StreamControls";

// interface SortableWebviewProps {
//   id: string;
//   url: string;
//   index: number;
//   isFullViewMode?: boolean;
// }

// export function SortableWebview({
//   id,
//   url,
//   index,
//   isFullViewMode = false,
// }: SortableWebviewProps) {
//   const {
//     attributes,
//     listeners,
//     setNodeRef,
//     transform,
//     transition,
//     isDragging,
//   } = useSortable({ id });
//   const webviewRef = useRef<HTMLWebViewElement>(null);

//   const { setPlaying, updateStreamStatus } = useGridStore();

//   const [showThumbnail, setShowThumbnail] = useState(true);

//   const username = url.match(/chaturbate\.com\/([^/]+)/)?.[1] ?? "unknown";
//   const thumbUrl = `https://jpeg.live.mmcdn.com/stream?room=${username}`;

//   const style = {
//     transform: CSS.Transform.toString(transform),
//     transition: isDragging ? "none" : transition,
//     opacity: isDragging ? 0.5 : 1,
//     zIndex: isDragging ? 1000 : 1,
//   };

//   useEffect(() => {
//     const webview = webviewRef.current;
//     if (!webview) return;

//     // This robust setup function will handle timing issues
//     const setupWebview = () => {
//       // --- SCRIPT 1: Hide UI Elements ---
//       const uiHidingScript = `(function(){try{document.body.style.backgroundColor='black';document.body.style.margin='0';document.body.style.overflow='hidden';['#header','.footer-holder','.RoomSignupPopup','#roomTabs','.playerTitleBar','.genderTabs','#TheaterModePlayer > div:nth-child(8)','.video-overlay','.video-controls','.chat-container','.chat-panel','.bio-section','.tip-menu','.tip-button','.header-container'].forEach(s=>{document.querySelectorAll(s).forEach(e=>e.style.setProperty('display','none','important'))});const vfs=()=>{const v=document.querySelector('video')||document.querySelector('#chat-player_html5_api'),d=document.querySelector('.videoPlayerDiv'),p=document.querySelector('.player-container');if(v){v.style.position='fixed';v.style.top='0';v.style.left='0';v.style.width='100vw';v.style.height='100vh';v.style.objectFit='cover';v.style.zIndex='1'}if(d){d.style.position='fixed';d.style.top='0';d.style.left='0';d.style.width='100vw';d.style.height='100vh';d.style.overflow='hidden';d.style.background='black';d.style.zIndex='0'}if(p){p.style.position='fixed';p.style.top='0';p.style.left='0';p.style.width='100vw';p.style.height='100vh';p.style.overflow='hidden';p.style.zIndex='0'}};vfs();window.addEventListener('resize',vfs);setInterval(vfs,2e3)}catch(e){console.error('Injection Error:',e)}})();`;

//       webview.executeJavaScript(uiHidingScript).catch(console.error);

//       // --- SCRIPT 2: Add Video Play Listener (with retry mechanism) ---
//       let attempts = 0;
//       const videoListenerInterval = setInterval(() => {
//         attempts++;
//         const videoListenerScript = `(function(){const v=document.querySelector('video');if(v){const p=()=>window.electron.ipcRenderer.sendToHost('video-played',${index});v.addEventListener('playing',p);v.addEventListener('play',p);return true}return false})();`;

//         webview
//           .executeJavaScript(videoListenerScript)
//           .then((found) => {
//             if (found) {
//               clearInterval(videoListenerInterval); // Success, stop trying
//             }
//           })
//           .catch(console.error);

//         if (attempts > 20) {
//           // Stop after ~10 seconds to prevent infinite loops
//           clearInterval(videoListenerInterval);
//         }
//       }, 500); // Try every half second
//     };

//     const onIpcMessage = (event: any) => {
//       if (event.channel === "video-played" && event.args[0] === index) {
//         setShowThumbnail(false);
//         setPlaying(index, true);
//         updateStreamStatus(index, true);
//       }
//     };

//     webview.addEventListener("dom-ready", setupWebview);
//     webview.addEventListener("ipc-message", onIpcMessage);

//     return () => {
//       webview.removeEventListener("dom-ready", setupWebview);
//       webview.removeEventListener("ipc-message", onIpcMessage);
//     };
//   }, [index, setPlaying, updateStreamStatus]);

//   const containerClasses = isFullViewMode
//     ? "w-full h-full relative overflow-hidden bg-black group"
//     : "aspect-video relative overflow-hidden rounded-md border border-neutral-700 bg-black group";

//   return (
//     <div ref={setNodeRef} style={style} className={containerClasses}>
//       <div
//         {...attributes}
//         {...listeners}
//         className="absolute top-1 right-1 z-30 flex cursor-grab items-center gap-1 rounded-l bg-cyan-600/80 px-1.5 py-0.5 text-xs font-semibold text-white select-none active:cursor-grabbing"
//       >
//         <GripVertical size={12} />
//         {username}
//       </div>

//       {showThumbnail && (
//         <img
//           src={thumbUrl}
//           alt={username}
//           className="absolute inset-0 z-10 h-full w-full object-cover"
//           draggable={false}
//         />
//       )}

//       <webview
//         ref={webviewRef}
//         src={url}
//         className="h-full w-full bg-black"
//         preload="./preload.js"
//         style={{ opacity: showThumbnail ? 0 : 1 }}
//       />

//       <StreamControls index={index} />
//     </div>
//   );
// }



// import React, { useRef, useEffect, useState, useCallback } from 'react';
// import { useSortable } from '@dnd-kit/sortable';
// import { CSS } from '@dnd-kit/utilities';
// import { GripVertical } from 'lucide-react';
// import { useGridStore } from '@/state/gridStore';
// import { StreamControls } from './StreamControls';

// interface SortableWebviewProps {
//   id: string;
//   url: string;
//   index: number;
//   isFullViewMode?: boolean;
// }

// export function SortableWebview({ id, url, index, isFullViewMode = false }: SortableWebviewProps) {
//   const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
//   const webviewRef = useRef<HTMLWebViewElement>(null);
  
//   const { setPlaying, updateStreamStatus } = useGridStore();
//   const [showThumbnail, setShowThumbnail] = useState(true);
  
//   const username = url.match(/chaturbate\.com\/([^/]+)/)?.[1] ?? "unknown";
//   const thumbUrl = `https://jpeg.live.mmcdn.com/stream?room=${username}`;

//   const style = {
//     transform: CSS.Transform.toString(transform),
//     transition: isDragging ? "none" : transition,
//     opacity: isDragging ? 0.5 : 1,
//     zIndex: isDragging ? 1000 : 1,
//   };

//   useEffect(() => {
//     const webview = webviewRef.current;
//     if (!webview) return;

//     // This is the new, robust setup function that forces playback.
//     const setupWebview = () => {
//       // --- SCRIPT: This combines UI hiding and a persistent autoplay attempt ---
//       const injectionScript = `
//         (function() {
//           try {
//             // Part 1: Aggressive UI Hiding (Your Script)
//             document.body.style.backgroundColor='black';
//             document.body.style.margin='0';
//             document.body.style.overflow='hidden';
//             [
//               '#header','.footer-holder','.RoomSignupPopup','#roomTabs','.playerTitleBar',
//               '.genderTabs','#TheaterModePlayer > div:nth-child(8)','.video-overlay',
//               '.video-controls','.chat-container','.chat-panel','.bio-section',
//               '.tip-menu','.tip-button','.header-container'
//             ].forEach(sel => {
//               document.querySelectorAll(sel).forEach(el => el.style.setProperty('display','none','important'));
//             });

//             const makeVideoFullscreen = () => {
//               const video = document.querySelector('video') || document.querySelector('#chat-player_html5_api');
//               if (video) {
//                 video.style.position='fixed'; video.style.top='0'; video.style.left='0';
//                 video.style.width='100vw'; video.style.height='100vh';
//                 video.style.objectFit='cover'; video.style.zIndex='1';
//               }
//             };
//             makeVideoFullscreen();
//             setInterval(makeVideoFullscreen, 2000);

//             // Part 2: Persistent Autoplay Trigger
//             let attempts = 0;
//             const playInterval = setInterval(() => {
//               const video = document.querySelector('video');
//               const playButton = document.querySelector('.vjs-big-play-button');
              
//               if (video) {
//                 video.muted = false; // Attempt to play with sound
//                 video.play().then(() => {
//                   // If playback succeeds, we can stop trying
//                   clearInterval(playInterval);
//                 }).catch(error => {
//                   // Autoplay was likely blocked, try clicking the play button
//                   if (playButton) {
//                     playButton.click();
//                   }
//                 });
//               } else if (playButton) {
//                  playButton.click();
//               }
              
//               attempts++;
//               if (attempts > 20) { // Stop after 10 seconds
//                 clearInterval(playInterval);
//               }
//             }, 500);

//           } catch (e) { console.error('Injection Error:', e); }
//         })();
//       `;
      
//       webview.executeJavaScript(injectionScript).catch(console.error);
//     };

//     // Add the listener
//     webview.addEventListener('dom-ready', setupWebview);
    
//     // --- OPTIMISTIC UI UPDATE ---
//     // We no longer wait for an IPC message. We assume the script will work.
//     const playTimer = setTimeout(() => {
//       setShowThumbnail(false);
//       setPlaying(index, true);
//       updateStreamStatus(index, true);
//     }, 3000); // 3-second delay to allow player to initialize

//     return () => {
//       webview.removeEventListener('dom-ready', setupWebview);
//       clearTimeout(playTimer);
//     };
//   }, [index, setPlaying, updateStreamStatus]); // Rerun if index changes

//   const containerClasses = isFullViewMode 
//     ? "w-full h-full relative overflow-hidden bg-black group"
//     : "aspect-video relative overflow-hidden rounded-md border border-neutral-700 bg-black group";

//   return (
//     <div ref={setNodeRef} style={style} className={containerClasses}>
//       <div {...attributes} {...listeners} className="absolute top-1 right-1 bg-cyan-600/80 text-white text-xs font-semibold px-1.5 py-0.5 rounded-l select-none z-30 flex items-center gap-1 cursor-grab active:cursor-grabbing">
//         <GripVertical size={12} />
//         {username}
//       </div>
      
//       {showThumbnail && (
//         <img src={thumbUrl} alt={username} className="absolute inset-0 w-full h-full object-cover z-10" draggable={false} />
//       )}
      
//       <webview
//         ref={webviewRef}
//         src={url}
//         className="w-full h-full bg-black"
//         preload="./preload.js"
//         style={{ opacity: showThumbnail ? 0 : 1 }}
//       />

//       <StreamControls index={index} />
//     </div>
//   );
// }





import React, { useRef, useEffect, useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useInView } from 'react-intersection-observer';
import { GripVertical, Loader2 } from 'lucide-react';
import { useGridStore } from '@/state/gridStore';
import { StreamControls } from './StreamControls';

interface SortableWebviewProps {
  id: string;
  url: string;
  index: number;
  isFullViewMode?: boolean;
}

export function SortableWebview({ id, url, index, isFullViewMode = false }: SortableWebviewProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const webviewRef = useRef<HTMLWebViewElement>(null);

  const { setPlaying, updateStreamStatus } = useGridStore();
  
  // Visibility detection hook
  const { ref: viewRef, inView } = useInView({
    triggerOnce: false,
    rootMargin: '200px 0px', // Pre-load webviews 200px before they enter the screen
  });

  // State to control if the <webview> tag is rendered
  const [isMounted, setIsMounted] = useState(false);

  const username = url.match(/chaturbate\.com\/([^/]+)/)?.[1] ?? "unknown";
  const thumbUrl = `https://jpeg.live.mmcdn.com/stream?room=${username}`;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? "none" : transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
  };

  // Effect to mount/unmount the webview based on visibility
  useEffect(() => {
    if (isFullViewMode) {
      // The focused stream in full view should always be mounted
      setIsMounted(true);
      return;
    }

    if (inView) {
      // When it becomes visible, mount the webview
      setIsMounted(true);
    } else {
      // When it scrolls out of view, wait a moment then unmount it to save resources
      const timer = setTimeout(() => setIsMounted(false), 2000); // 2-second delay before unloading
      return () => clearTimeout(timer);
    }
  }, [inView, isFullViewMode]);

  // Effect for injection and playback, runs only when the webview is mounted
  useEffect(() => {
    if (!isMounted) return;

    const webview = webviewRef.current;
    if (!webview) return;
    
    let isCancelled = false; // Flag to prevent updates after unmount

    const setupWebview = () => {
      if (isCancelled) return;
      const injectionScript = `(function(){try{document.body.style.backgroundColor='black';document.body.style.margin='0';document.body.style.overflow='hidden';['#header','.footer-holder','.RoomSignupPopup','#roomTabs','.playerTitleBar','.genderTabs','#TheaterModePlayer > div:nth-child(8)','.video-overlay','.video-controls','.chat-container','.chat-panel','.bio-section','.tip-menu','.tip-button','.header-container'].forEach(s=>{document.querySelectorAll(s).forEach(e=>e.style.setProperty('display','none','important'))});const vfs=()=>{const v=document.querySelector('video')||document.querySelector('#chat-player_html5_api');if(v){v.style.position='fixed';v.style.top='0';v.style.left='0';v.style.width='100vw';v.style.height='100vh';v.style.objectFit='cover';v.style.zIndex='1'}};vfs();setInterval(vfs,2e3);let a=0;const pi=setInterval(()=>{const v=document.querySelector('video'),p=document.querySelector('.vjs-big-play-button');if(v){v.muted=false;v.play().then(()=>clearInterval(pi)).catch(()=>{if(p)p.click()})}else if(p){p.click()}a++;if(a>20)clearInterval(pi)},500)}catch(e){console.error('Injection Error:',e)}})();`;
      webview.executeJavaScript(injectionScript).catch(console.error);
    };

    webview.addEventListener('dom-ready', setupWebview);
    
    const playTimer = setTimeout(() => {
      if (!isCancelled) {
        setPlaying(index, true);
        updateStreamStatus(index, true);
      }
    }, 3000);

    return () => {
      isCancelled = true;
      webview.removeEventListener('dom-ready', setupWebview);
      clearTimeout(playTimer);
      setPlaying(index, false);
      updateStreamStatus(index, false);
    };
  }, [isMounted, index, setPlaying, updateStreamStatus]);

  const containerClasses = isFullViewMode 
    ? "w-full h-full relative overflow-hidden bg-black group"
    // Use `aspect-video` for grid view to maintain proportions before webview loads
    : "aspect-video relative overflow-hidden rounded-md border border-neutral-700 bg-black group";

  return (
    // Combine the refs for the DnD kit and the intersection observer
    <div ref={(node) => { setNodeRef(node); viewRef(node); }} style={style} className={containerClasses}>
      <div {...attributes} {...listeners} className="absolute top-1 right-1 bg-cyan-600/80 text-white text-xs font-semibold px-1.5 py-0.5 rounded-l select-none z-30 flex items-center gap-1 cursor-grab active:cursor-grabbing">
        <GripVertical size={12} />
        {username}
      </div>
      
      {/* Conditionally render the webview or a placeholder */}
      {isMounted ? (
        <webview
          ref={webviewRef}
          src={url}
          className="w-full h-full bg-black"
          preload="./preload.js"
          // This preference helps throttle background tabs to save CPU
          webpreferences="backgroundThrottling=true"
        />
      ) : (
        // Render a lightweight placeholder when the webview is not mounted
        <div className="w-full h-full bg-black relative">
          <img src={thumbUrl} alt={username} className="w-full h-full object-cover opacity-50" draggable={false} />
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
          </div>
        </div>
      )}

      {/* Controls are always rendered to allow interaction (e.g., favoriting) even when unloaded */}
      <StreamControls index={index} />
    </div>
  );
}