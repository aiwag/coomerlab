// src/components/camviewer/grid/SortableWebview.tsx


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



// // src/components/camviewer/grid/SortableWebview.tsx

// import React, { useRef, useEffect, useState } from 'react';
// import { useSortable } from '@dnd-kit/sortable';
// import { CSS } from '@dnd-kit/utilities';
// import { useInView } from 'react-intersection-observer';
// import { GripVertical, PlayCircle, VideoOff } from 'lucide-react';
// import { useGridStore } from '@/state/gridStore';
// import { StreamControls } from './StreamControls';
// import { getUsernameFromUrl, generateThumbUrl } from '@/utils/formatters';

// interface SortableWebviewProps {
//   id: string;
//   url: string;
//   index: number;
//   isFullViewMode?: boolean;
// }

// const executeWebviewScript = (webview: Electron.WebviewTag | null, script: string) => {
//   if (webview) {
//     webview.executeJavaScript(script).catch(err => console.error(`Script execution failed:`, err));
//   }
// };

// export function SortableWebview({ id, url, index, isFullViewMode = false }: SortableWebviewProps) {
//   const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
//   const webviewRef = useRef<Electron.WebviewTag>(null);
  
//   const { setPlaying, updateStreamStatus } = useGridStore();
  
//   const { ref: viewRef, inView } = useInView({
//     rootMargin: '200px 0px',
//     onChange: (inView) => {
//       if (isWebviewReady) {
//         executeWebviewScript(webviewRef.current, inView ? "document.querySelector('video')?.play();" : "document.querySelector('video')?.pause();");
//         setPlaying(index, inView);
//       }
//     },
//   });

//   const [isWebviewReady, setIsWebviewReady] = useState(false);
//   const username = getUsernameFromUrl(url);
//   const thumbUrl = generateThumbUrl(username);

//   const style = {
//     transform: CSS.Transform.toString(transform),
//     transition: isDragging ? "none" : transition,
//     opacity: isDragging ? 0.5 : 1,
//     zIndex: isDragging ? 1000 : 1,
//   };

//   useEffect(() => {
//     const webview = webviewRef.current;
//     if (!webview) return;

//     const setupWebview = () => {
//       const injectionScript = `(function(){try{document.body.style.backgroundColor='black';document.body.style.margin='0';document.body.style.overflow='hidden';['#header','.footer-holder','.RoomSignupPopup','#roomTabs','.playerTitleBar','.genderTabs','#TheaterModePlayer > div:nth-child(8)','.video-overlay','.video-controls','.chat-container','.chat-panel','.bio-section','.tip-menu','.tip-button','.header-container'].forEach(s=>{document.querySelectorAll(s).forEach(e=>e.style.setProperty('display','none','important'))});const vfs=()=>{const v=document.querySelector('video')||document.querySelector('#chat-player_html5_api');if(v){v.style.position='fixed';v.style.top='0';v.style.left='0';v.style.width='100vw';v.style.height='100vh';v.style.objectFit='cover';v.style.zIndex='1'}};vfs();setInterval(vfs,2e3);let a=0;const pi=setInterval(()=>{const v=document.querySelector('video'),p=document.querySelector('.vjs-big-play-button');if(v){v.muted=true;v.play().then(()=>{window.electron.ipcRenderer.sendToHost('webview-ready',${index});clearInterval(pi)}).catch(()=>{if(p)p.click()})}else if(p){p.click()}a++;if(a>20)clearInterval(pi)},500)}catch(e){}})();`;
//       executeWebviewScript(webview, injectionScript);
//     };

//     const onIpcMessage = (event: any) => {
//       if (event.channel === 'webview-ready' && event.args[0] === index) {
//         setIsWebviewReady(true);
//         updateStreamStatus(index, true);
//         if (inView) {
//           executeWebviewScript(webview, "document.querySelector('video').muted=false; document.querySelector('video').play();");
//           setPlaying(index, true);
//         } else {
//             executeWebviewScript(webview, "document.querySelector('video').pause();");
//             setPlaying(index, false);
//         }
//       }
//     };
    
//     webview.addEventListener('dom-ready', setupWebview);
//     webview.addEventListener('ipc-message', onIpcMessage);

//     return () => {
//       webview.removeEventListener('dom-ready', setupWebview);
//       webview.removeEventListener('ipc-message', onIpcMessage);
//     };
//   }, [index, inView, setPlaying, updateStreamStatus]);

//   const containerClasses = isFullViewMode 
//     ? "w-full h-full relative overflow-hidden bg-black group"
//     // No border or rounding for the compact video wall effect
//     : "aspect-video relative overflow-hidden bg-black group";

//   return (
//     <div ref={(node) => { setNodeRef(node); viewRef(node); }} style={style} className={containerClasses}>
//       {/* Drag handle is always present */}
//       <div {...attributes} {...listeners} className="absolute top-0 right-0 bg-cyan-600/70 text-white text-xs font-semibold px-1.5 py-0.5 rounded-bl-md select-none z-30 flex items-center gap-1 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity">
//         <GripVertical size={12} />
//         {username}
//       </div>
      
//       <webview
//         ref={webviewRef}
//         src={url}
//         className="w-full h-full bg-black"
//         preload="./preload.js"
//         webpreferences="backgroundThrottling=true"
//       />
      
//       {!inView && !isFullViewMode && (
//         <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-gray-400 z-20">
//             <VideoOff size={32} />
//             <span className="text-xs mt-2">Paused</span>
//         </div>
//       )}

//       {!isWebviewReady && (
//          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
//             <img src={thumbUrl} alt={username ?? ''} className="w-full h-full object-cover opacity-30" />
//             <div className="absolute">
//                 <PlayCircle size={48} className="text-white/60" />
//             </div>
//         </div>
//       )}

//       <StreamControls index={index} />
//     </div>
//   );
// }




// import React, { useRef, useEffect, useState } from 'react';
// import { useSortable } from '@dnd-kit/sortable';
// import { CSS } from '@dnd-kit/utilities';
// import { useInView } from 'react-intersection-observer';
// import { GripVertical, Loader2, VideoOff } from 'lucide-react';
// import { useGridStore } from '@/state/gridStore';
// import { StreamControls } from './StreamControls';
// import { getUsernameFromUrl, generateThumbUrl } from '@/utils/formatters';

// interface SortableWebviewProps {
//   id: string;
//   url: string;
//   index: number;
//   isFullViewMode?: boolean;
// }

// const executeWebviewScript = (webview: Electron.WebviewTag | null, script: string) => {
//   if (webview) {
//     webview.executeJavaScript(script).catch(err => console.error(`Script execution failed:`, err));
//   }
// };

// export function SortableWebview({ id, url, index, isFullViewMode = false }: SortableWebviewProps) {
//   const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
//   const webviewRef = useRef<Electron.WebviewTag>(null);
  
//   const { setPlaying, updateStreamStatus } = useGridStore();
  
//   const [isWebviewReady, setIsWebviewReady] = useState(false);
//   const [showThumbnail, setShowThumbnail] = useState(true); // New state to control thumbnail

//   const { ref: viewRef, inView } = useInView({
//     rootMargin: '200px 0px',
//     onChange: (inView) => {
//       if (isWebviewReady) {
//         executeWebviewScript(webviewRef.current, inView ? "document.querySelector('video')?.play();" : "document.querySelector('video')?.pause();");
//         setPlaying(index, inView);
//       }
//     },
//   });

//   const username = getUsernameFromUrl(url);
//   const thumbUrl = generateThumbUrl(username);

//   const style = {
//     transform: CSS.Transform.toString(transform),
//     transition: isDragging ? "none" : transition,
//     opacity: isDragging ? 0.5 : 1,
//     zIndex: isDragging ? 1000 : 1,
//   };

//   useEffect(() => {
//     const webview = webviewRef.current;
//     if (!webview) return;

//     const setupWebview = () => {
//       const injectionScript = `(function(){try{document.body.style.backgroundColor='black';document.body.style.margin='0';document.body.style.overflow='hidden';['#header','.footer-holder','.RoomSignupPopup','#roomTabs','.playerTitleBar','.genderTabs','#TheaterModePlayer > div:nth-child(8)','.video-overlay','.video-controls','.chat-container','.chat-panel','.bio-section','.tip-menu','.tip-button','.header-container'].forEach(s=>{document.querySelectorAll(s).forEach(e=>e.style.setProperty('display','none','important'))});const vfs=()=>{const v=document.querySelector('video')||document.querySelector('#chat-player_html5_api');if(v){v.style.position='fixed';v.style.top='0';v.style.left='0';v.style.width='100vw';v.style.height='100vh';v.style.objectFit='cover';v.style.zIndex='1'}};vfs();setInterval(vfs,2e3);let a=0;const pi=setInterval(()=>{const v=document.querySelector('video'),p=document.querySelector('.vjs-big-play-button');if(v){v.muted=true;v.play().then(()=>{window.electron.ipcRenderer.sendToHost('webview-ready',${index});clearInterval(pi)}).catch(()=>{if(p)p.click()})}else if(p){p.click()}a++;if(a>20)clearInterval(pi)},500)}catch(e){}})();`;
//       executeWebviewScript(webview, injectionScript);
//     };

//     const onIpcMessage = (event: any) => {
//       if (event.channel === 'webview-ready' && event.args[0] === index) {
//         setIsWebviewReady(true);
//         updateStreamStatus(index, true);
        
//         // Hide thumbnail permanently once video is confirmed ready
//         setShowThumbnail(false); 

//         if (inView) {
//           executeWebviewScript(webview, "document.querySelector('video').muted=false; document.querySelector('video').play();");
//           setPlaying(index, true);
//         } else {
//             executeWebviewScript(webview, "document.querySelector('video').pause();");
//             setPlaying(index, false);
//         }
//       }
//     };
    
//     webview.addEventListener('dom-ready', setupWebview);
//     webview.addEventListener('ipc-message', onIpcMessage);

//     return () => {
//       webview.removeEventListener('dom-ready', setupWebview);
//       webview.removeEventListener('ipc-message', onIpcMessage);
//     };
//   }, [index, inView, setPlaying, updateStreamStatus]);

//   const containerClasses = isFullViewMode 
//     ? "w-full h-full relative overflow-hidden bg-black group"
//     : "aspect-video relative overflow-hidden bg-black group";

//   return (
//     <div ref={(node) => { setNodeRef(node); viewRef(node); }} style={style} className={containerClasses}>
//       <div {...attributes} {...listeners} className="absolute top-0 right-0 bg-cyan-600/70 text-white text-xs font-semibold px-1.5 py-0.5 rounded-bl-md select-none z-30 flex items-center gap-1 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity">
//         <GripVertical size={12} />
//         {username}
//       </div>
      
//       <webview
//         ref={webviewRef}
//         src={url}
//         className="w-full h-full bg-black"
//         preload="./preload.js"
//         webpreferences="backgroundThrottling=true"
//       />
      
//       {/* Thumbnail/Loading Overlay */}
//       {showThumbnail && (
//          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
//             <img src={thumbUrl} alt={username ?? ''} className="w-full h-full object-cover opacity-30" />
//             <div className="absolute">
//                 <Loader2 size={48} className="text-white/60 animate-spin" />
//             </div>
//         </div>
//       )}

//       {/* Paused Overlay */}
//       {!inView && !isFullViewMode && isWebviewReady && (
//         <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-gray-400 z-20">
//             <VideoOff size={32} />
//             <span className="text-xs mt-2">Paused</span>
//         </div>
//       )}

//       <StreamControls index={index} />
//     </div>
//   );
// }





// import React, { useRef, useEffect, useState } from 'react';
// import { useSortable } from '@dnd-kit/sortable';
// import { CSS } from '@dnd-kit/utilities';
// import { useInView } from 'react-intersection-observer';
// import { GripVertical, Loader2, VideoOff } from 'lucide-react';
// import { useGridStore } from '@/state/gridStore';
// import { StreamControls } from './StreamControls';
// import { getUsernameFromUrl, generateThumbUrl } from '@/utils/formatters';

// interface SortableWebviewProps {
//   id: string;
//   url: string;
//   index: number;
//   isFullViewMode?: boolean;
// }

// const executeWebviewScript = (webview: Electron.WebviewTag | null, script: string) => {
//   if (webview) {
//     webview.executeJavaScript(script).catch(err => console.error(`Script execution failed:`, err));
//   }
// };

// export function SortableWebview({ id, url, index, isFullViewMode = false }: SortableWebviewProps) {
//   const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
//   const webviewRef = useRef<Electron.WebviewTag>(null);
  
//   const { setPlaying } = useGridStore();
  
//   // This state is now solely responsible for the initial overlay.
//   const [showLoadingOverlay, setShowLoadingOverlay] = useState(true);

//   const { ref: viewRef, inView } = useInView({
//     rootMargin: '200px 0px',
//     onChange: (inView) => {
//       // Only pause/play if the loading phase is over.
//       if (!showLoadingOverlay) {
//         executeWebviewScript(webviewRef.current, inView ? "document.querySelector('video')?.play();" : "document.querySelector('video')?.pause();");
//         setPlaying(index, inView);
//       }
//     },
//   });

//   const username = getUsernameFromUrl(url);
//   const thumbUrl = generateThumbUrl(username);

//   const style = {
//     transform: CSS.Transform.toString(transform),
//     transition: isDragging ? "none" : transition,
//     opacity: isDragging ? 0.5 : 1,
//     zIndex: isDragging ? 1000 : 1,
//   };

//   useEffect(() => {
//     // Reset the loading state if the URL changes (e.g., when the grid is reordered)
//     setShowLoadingOverlay(true);
//     const webview = webviewRef.current;
//     if (!webview) return;

//     const setupWebview = () => {
//       const injectionScript = `(function(){try{document.body.style.backgroundColor='black';document.body.style.margin='0';document.body.style.overflow='hidden';['#header','.footer-holder','.RoomSignupPopup','#roomTabs','.playerTitleBar','.genderTabs','#TheaterModePlayer > div:nth-child(8)','.video-overlay','.video-controls','.chat-container','.chat-panel','.bio-section','.tip-menu','.tip-button','.header-container'].forEach(s=>{document.querySelectorAll(s).forEach(e=>e.style.setProperty('display','none','important'))});const vfs=()=>{const v=document.querySelector('video')||document.querySelector('#chat-player_html5_api');if(v){v.style.position='fixed';v.style.top='0';v.style.left='0';v.style.width='100vw';v.style.height='100vh';v.style.objectFit='cover';v.style.zIndex='1'}};vfs();setInterval(vfs,2e3);let a=0;const pi=setInterval(()=>{const v=document.querySelector('video'),p=document.querySelector('.vjs-big-play-button');if(v){v.muted=true;v.play().then(()=>clearInterval(pi)).catch(()=>{if(p)p.click()})}else if(p){p.click()}a++;if(a>20)clearInterval(pi)},500)}catch(e){}})();`;
//       executeWebviewScript(webview, injectionScript);
//     };

//     // --- THE CRITICAL CHANGE ---
//     // We add the listener AND start our own reliable timer.
//     webview.addEventListener('dom-ready', setupWebview);

//     // This timer is the new source of truth for hiding the overlay.
//     // It is not cancellable and does not depend on any message from the webview.
//     const hideOverlayTimer = setTimeout(() => {
//       setShowLoadingOverlay(false);
//       // After hiding, if the stream is in view, we tell it to play with sound.
//       if (inView) {
//           executeWebviewScript(webviewRef.current, "const v = document.querySelector('video'); if(v){v.muted=false; v.play();}");
//           setPlaying(index, true);
//       } else {
//           // If it's not in view, ensure it's paused to save resources.
//           executeWebviewScript(webviewRef.current, "document.querySelector('video')?.pause();");
//           setPlaying(index, false);
//       }
//     }, 4000); // 4 seconds should be plenty of time for the player to initialize.

//     return () => {
//       webview.removeEventListener('dom-ready', setupWebview);
//       clearTimeout(hideOverlayTimer); // Cleanup timer on component unmount
//       setPlaying(index, false); // Ensure status is reset
//     };
//   }, [id, inView, index, setPlaying]); // Rerun this entire setup if the component's ID (URL) changes.

//   const containerClasses = isFullViewMode 
//     ? "w-full h-full relative overflow-hidden bg-black group"
//     : "aspect-video relative overflow-hidden bg-black group";

//   return (
//     <div ref={(node) => { setNodeRef(node); viewRef(node); }} style={style} className={containerClasses}>
//       <div {...attributes} {...listeners} className="absolute top-0 right-0 bg-cyan-600/70 text-white text-xs font-semibold px-1.5 py-0.5 rounded-bl-md select-none z-30 flex items-center gap-1 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity">
//         <GripVertical size={12} />
//         {username}
//       </div>
      
//       <webview
//         ref={webviewRef}
//         src={url}
//         className="w-full h-full bg-black"
//         preload="./preload.js"
//         webpreferences="backgroundThrottling=true"
//       />
      
//       {/* Loading Overlay: This entire block will be removed from the DOM after the timer fires. */}
//       {showLoadingOverlay && (
//          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20 pointer-events-none">
//             <img src={thumbUrl} alt={username ?? ''} className="w-full h-full object-cover opacity-30" />
//             <div className="absolute">
//                 <Loader2 size={48} className="text-white/60 animate-spin" />
//             </div>
//         </div>
//       )}

//       {/* Paused Overlay: This only shows AFTER the loading overlay is gone AND the item is out of view. */}
//       {!showLoadingOverlay && !inView && !isFullViewMode && (
//         <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-gray-400 z-20 pointer-events-none">
//             <VideoOff size={32} />
//             <span className="text-xs mt-2">Paused</span>
//         </div>
//       )}

//       <StreamControls index={index} />
//     </div>
//   );
// }



// import React, { useRef, useEffect, useState } from 'react';
// import { useSortable } from '@dnd-kit/sortable';
// import { CSS } from '@dnd-kit/utilities';
// import { useInView } from 'react-intersection-observer';
// import { GripVertical, Loader2, VideoOff, Trash2 } from 'lucide-react';
// import { useGridStore } from '@/state/gridStore';
// import { StreamControls } from './StreamControls';
// import { getUsernameFromUrl, generateThumbUrl } from '@/utils/formatters';
// import { webviewInjectionScript } from '@/lib/webview-injection'; // Import the script

// interface SortableWebviewProps {
//   id: string;
//   url: string;
//   index: number;
//   isFullViewMode?: boolean;
// }

// const executeWebviewScript = (webview: Electron.WebviewTag | null, script: string) => {
//   if (webview) webview.executeJavaScript(script).catch(err => console.error(`Script execution failed:`, err));
// };

// export function SortableWebview({ id, url, index, isFullViewMode = false }: SortableWebviewProps) {
//   const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
//   const webviewRef = useRef<Electron.WebviewTag>(null);
  
//   const { removeStream, setPlaying } = useGridStore();
//   const [showLoadingOverlay, setShowLoadingOverlay] = useState(true);

//   const { ref: viewRef, inView } = useInView({ rootMargin: '200px 0px', onChange: (inView) => { if (!showLoadingOverlay) { executeWebviewScript(webviewRef.current, inView ? "document.querySelector('video')?.play();" : "document.querySelector('video')?.pause();"); setPlaying(index, inView); } } });

//   const username = getUsernameFromUrl(url);
//   const thumbUrl = generateThumbUrl(username);

//   const style = { transform: CSS.Transform.toString(transform), transition: isDragging ? "none" : transition, opacity: isDragging ? 0.5 : 1, zIndex: isDragging ? 1000 : 1 };

//   useEffect(() => {
//     setShowLoadingOverlay(true);
//     const webview = webviewRef.current;
//     if (!webview) return;

//     const setupWebview = () => {
//       // Inject the imported script, but add the specific index to the 'webview-ready' message
//       const scriptWithIndex = webviewInjectionScript.replace(`sendToHost('webview-ready')`, `sendToHost('webview-ready', ${index})`);
//       executeWebviewScript(webview, scriptWithIndex);
//     };
    
//     const onIpcMessage = (event: any) => { if (event.channel === 'webview-ready' && event.args[0] === index) { setShowLoadingOverlay(false); if (inView) { executeWebviewScript(webview, "const v=document.querySelector('video');if(v){v.muted=false;v.play();}"); setPlaying(index, true); } else { executeWebviewScript(webview, "document.querySelector('video')?.pause();"); setPlaying(index, false); } } };
    
//     webview.addEventListener('dom-ready', setupWebview);
//     webview.addEventListener('ipc-message', onIpcMessage);

//     return () => { webview.removeEventListener('dom-ready', setupWebview); webview.removeEventListener('ipc-message', onIpcMessage); setPlaying(index, false); };
//   }, [id, inView, index, setPlaying]);

//   const containerClasses = isFullViewMode ? "w-full h-full relative overflow-hidden bg-black group" : "relative overflow-hidden bg-black group";

//   return (
//     <div ref={(node) => { setNodeRef(node); viewRef(node); }} style={style} className={containerClasses}>
//       <div {...attributes} {...listeners} className="absolute top-0 right-0 bg-cyan-600/70 text-white text-xs font-semibold px-1.5 py-0.5 rounded-bl-md select-none z-30 flex items-center gap-1 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity">
//         <GripVertical size={12} />
//         {username}
//       </div>
      
//       {/* Delete button on hover */}
//       <button onClick={() => removeStream(index)} className="absolute top-0 left-0 bg-red-600/70 text-white p-1 rounded-br-md select-none z-30 opacity-0 group-hover:opacity-100 transition-opacity" title="Remove Stream">
//         <Trash2 size={14} />
//       </button>

//       <webview ref={webviewRef} src={url} className="w-full h-full bg-black" preload="./preload.js" webpreferences="backgroundThrottling=true" />
      
//       {showLoadingOverlay && (<div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20 pointer-events-none"><img src={thumbUrl} alt={username ?? ''} className="w-full h-full object-cover opacity-30" /><div className="absolute"><Loader2 size={48} className="text-white/60 animate-spin" /></div></div>)}
//       {!showLoadingOverlay && !inView && !isFullViewMode && (<div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-gray-400 z-20 pointer-events-none"><VideoOff size={32} /><span className="text-xs mt-2">Paused</span></div>)}

//       <StreamControls index={index} />
//     </div>
//   );
// }





import React, { useRef, useEffect, useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useInView } from 'react-intersection-observer';
import { GripVertical, Loader2, VideoOff, Trash2 } from 'lucide-react';
import { useGridStore } from '@/state/gridStore';
import { StreamControls } from './StreamControls';
import { getUsernameFromUrl, generateThumbUrl } from '@/utils/formatters';
import { webviewInjectionScript } from '@/lib/webview-injection';

interface SortableWebviewProps {
  id: string;
  url: string;
  index: number;
  isFullViewMode?: boolean;
}

const executeWebviewScript = (webview: Electron.WebviewTag | null, script: string) => {
  if (webview) webview.executeJavaScript(script).catch(err => console.error(`Script execution failed:`, err));
};

export function SortableWebview({ id, url, index, isFullViewMode = false }: SortableWebviewProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const webviewRef = useRef<Electron.WebviewTag>(null);
  
  const { removeStream, setPlaying } = useGridStore();
  
  // This state is ONLY for the initial loading overlay.
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(true);

  const { ref: viewRef, inView } = useInView({ rootMargin: '200px 0px' });

  const username = getUsernameFromUrl(url);
  const thumbUrl = generateThumbUrl(username);

  const style = { transform: CSS.Transform.toString(transform), transition: isDragging ? "none" : transition, opacity: isDragging ? 0.5 : 1, zIndex: isDragging ? 1000 : 1 };

  // --- EFFECT 1: ONE-TIME SETUP AND RELIABLE TIMER ---
  // This hook runs ONLY when the component's URL (id) changes. It is not affected by scrolling.
  useEffect(() => {
    // 1. Reset the UI to the loading state for the new stream.
    setShowLoadingOverlay(true);
    const webview = webviewRef.current;
    if (!webview) return;

    const setupWebview = () => {
      // 2. Inject the script to clean the UI and attempt autoplay.
      executeWebviewScript(webview, webviewInjectionScript);
    };
    
    webview.addEventListener('dom-ready', setupWebview);

    // 3. Start a non-cancellable timer. This is the new source of truth.
    const hideOverlayTimer = setTimeout(() => {
      setShowLoadingOverlay(false); // Forcefully remove the overlay.
    }, 4000); // 4 seconds.

    return () => {
      webview.removeEventListener('dom-ready', setupWebview);
      clearTimeout(hideOverlayTimer);
    };
  }, [id]); // Dependency array ONLY has `id`.

  // --- EFFECT 2: ONGOING PLAY/PAUSE LOGIC ---
  // This hook handles the play/pause functionality based on visibility.
  useEffect(() => {
    // Only run this logic AFTER the initial loading is finished.
    if (!showLoadingOverlay) {
      const script = inView || isFullViewMode 
        ? "const v=document.querySelector('video'); if(v){v.muted=false; v.play();}" 
        : "document.querySelector('video')?.pause();";
      executeWebviewScript(webviewRef.current, script);
      setPlaying(index, inView || isFullViewMode);
    }
  }, [inView, isFullViewMode, showLoadingOverlay, index, setPlaying]);


  const containerClasses = isFullViewMode 
    ? "w-full h-full relative overflow-hidden bg-black group"
    : "relative overflow-hidden bg-black group";

  return (
    <div ref={(node) => { setNodeRef(node); viewRef(node); }} style={style} className={containerClasses}>
      <div {...attributes} {...listeners} className="absolute top-0 right-0 bg-cyan-600/70 text-white text-xs font-semibold px-1.5 py-0.5 rounded-bl-md select-none z-30 flex items-center gap-1 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity">
        <GripVertical size={12} />
        {username}
      </div>
      
      <button onClick={() => removeStream(index)} className="absolute top-0 left-0 bg-red-600/70 text-white p-1 rounded-br-md select-none z-30 opacity-0 group-hover:opacity-100 transition-opacity" title="Remove Stream">
        <Trash2 size={14} />
      </button>

      <webview ref={webviewRef} src={url} className="w-full h-full bg-black" preload="./preload.js" webpreferences="backgroundThrottling=true" />
      
      {/* Loading Overlay: This is now guaranteed to be removed. */}
      {showLoadingOverlay && (
         <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20 pointer-events-none">
            <img src={thumbUrl} alt={username ?? ''} className="w-full h-full object-cover opacity-30" />
            <div className="absolute"><Loader2 size={48} className="text-white/60 animate-spin" /></div>
        </div>
      )}

      {/* Paused Overlay */}
      {!showLoadingOverlay && !inView && !isFullViewMode && (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-gray-400 z-20 pointer-events-none">
            <VideoOff size={32} /><span className="text-xs mt-2">Paused</span>
        </div>
      )}

      <StreamControls index={index} />
    </div>
  );
}