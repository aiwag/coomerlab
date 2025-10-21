// import React, { useRef, useEffect, useState } from 'react';
// import { useSortable } from '@dnd-kit/sortable';
// import { CSS } from '@dnd-kit/utilities';
// import { useInView } from 'react-intersection-observer';
// import { GripVertical, Loader2, VideoOff, Trash2 } from 'lucide-react';
// import { useGridStore } from '@/state/gridStore';
// import { StreamControls } from './StreamControls';
// import { getUsernameFromUrl, generateThumbUrl } from '@/utils/formatters';
// import { webviewInjectionScript } from '@/lib/webview-injection';

// interface SortableWebviewProps {
//   id: string; url: string; index: number; isFullViewMode?: boolean; isDragging: boolean; isDraggable: boolean;
//   width: number | string; height: number | string; top: number; left: number;
// }

// const executeWebviewScript = (webview: Electron.WebviewTag | null, script: string) => { if (webview && webview.getWebContentsId()) webview.executeJavaScript(script).catch(() => {}); };

// export function SortableWebview({ id, url, index, isFullViewMode = false, isDragging, isDraggable, width, height, top, left }: SortableWebviewProps) {
//   const { attributes, listeners, setNodeRef, transform, transition, isOver } = useSortable({ id, disabled: !isDraggable });
//   const webviewRef = useRef<Electron.WebviewTag>(null);
//   const { removeStream, setPlaying } = useGridStore();
  
//   // This state is the single source of truth for the initial loading overlay.
//   const [showLoadingOverlay, setShowLoadingOverlay] = useState(true);

//   const { ref: viewRef, inView } = useInView({ rootMargin: '200px 0px' });
//   const username = getUsernameFromUrl(url);
//   const thumbUrl = generateThumbUrl(username);

//   const style = {
//     position: 'absolute' as const, top, left, width, height,
//     transform: isDraggable ? CSS.Transform.toString(transform) : undefined,
//     transition: isDraggable && !isDragging ? 'all 250ms ease-in-out' : undefined,
//     zIndex: isDragging ? 100 : 10,
//   };

//   // --- EFFECT 1: THE "SUPER SNAPPY" LOADING LOGIC ---
//   useEffect(() => {
//     setShowLoadingOverlay(true); // Always start in a loading state for a new stream
//     const webview = webviewRef.current;
//     if (!webview) return;

//     let timerId: NodeJS.Timeout | null = null;
    
//     // This function is the single point of cleanup for the loading phase.
//     const finishLoading = () => {
//         if (timerId) clearTimeout(timerId);
//         setShowLoadingOverlay(false);
//     };

//     const handleDomReady = () => {
//       const scriptWithIndex = webviewInjectionScript.replace(`sendToHost('webview-ready')`, `sendToHost('webview-ready', ${index})`);
//       executeWebviewScript(webview, scriptWithIndex);
//     };

//     const onIpcMessage = (event: any) => {
//       if (event.channel === 'webview-ready' && event.args[0] === index) {
//         // The video is ready before the timer! This is the "snappy" path.
//         finishLoading();
//       }
//     };
    
//     webview.addEventListener('dom-ready', handleDomReady);
//     webview.addEventListener('ipc-message', onIpcMessage);

//     // Start the aggressive 2-second timer.
//     timerId = setTimeout(finishLoading, 2000);

//     return () => {
//       webview.removeEventListener('dom-ready', handleDomReady);
//       webview.removeEventListener('ipc-message', onIpcMessage);
//       if (timerId) clearTimeout(timerId);
//     };
//   }, [id, index]); // This hook re-runs ONLY for a new stream URL.

//   // --- EFFECT 2: ONGOING PLAY/PAUSE LOGIC ---
//   useEffect(() => {
//     // Only attempt to play/pause if the initial loading phase is over.
//     if (!showLoadingOverlay) {
//       const shouldBePlaying = inView || isFullViewMode;
//       const script = shouldBePlaying ? "const v=document.querySelector('video');if(v){v.muted=false;v.play();}" : "document.querySelector('video')?.pause();";
//       executeWebviewScript(webviewRef.current, script);
//       setPlaying(index, shouldBePlaying);
//     }
//   }, [inView, isFullViewMode, showLoadingOverlay, index, setPlaying]);

//   const containerClasses = ["overflow-hidden bg-black group", isDragging ? "opacity-0" : "opacity-100"].join(" ");
//   const dropIndicatorClasses = ["absolute inset-0 z-50 pointer-events-none transition-all", isDraggable && isOver ? "bg-cyan-500/30 ring-2 ring-cyan-500" : ""].join(" ");

//   return (
//     <div ref={(node) => { setNodeRef(node); viewRef(node); }} style={style} className={containerClasses}>
//       <div className={dropIndicatorClasses} />
//       {isDraggable && <div {...attributes} {...listeners} className="absolute top-0 right-0 bg-cyan-600/70 text-white text-xs font-semibold px-1.5 py-0.5 rounded-bl-md select-none z-40 flex items-center gap-1 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100"><GripVertical size={12} />{username}</div>}
//       <button onClick={() => removeStream(index)} className="absolute top-0 left-0 bg-red-600/70 text-white p-1 rounded-br-md select-none z-40 opacity-0 group-hover:opacity-100" title="Remove"><Trash2 size={14} /></button>
      
//       <webview ref={webviewRef} src={url} className="w-full h-full bg-black" preload="./preload.js" webpreferences="backgroundThrottling=true" />
      
//       {/* Loading Overlay: This is now guaranteed to disappear quickly. */}
//       {showLoadingOverlay && (<div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20 pointer-events-none"><img src={thumbUrl} alt={username ?? ''} className="w-full h-full object-cover opacity-30" /><div className="absolute"><Loader2 size={48} className="text-white/60 animate-spin" /></div></div>)}
      
//       {/* Paused Overlay: Only shows AFTER loading is done AND it's not in view */}
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
import { webviewInjectionScript } from '@/lib/webview-injection'; // Ensure this script uses object-fit: cover

interface SortableWebviewProps {
  id: string; url: string; index: number; isFullViewMode?: boolean; isDragging: boolean; isDraggable: boolean;
}

const executeWebviewScript = (webview: Electron.WebviewTag | null, script: string) => { if (webview && webview.getWebContentsId()) webview.executeJavaScript(script).catch(() => {}); };

export function SortableWebview({ id, url, index, isFullViewMode = false, isDragging, isDraggable }: SortableWebviewProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isOver } = useSortable({ id, disabled: !isDraggable });
  const webviewRef = useRef<Electron.WebviewTag>(null);
  const { removeStream, setPlaying } = useGridStore();
  const [isLoading, setIsLoading] = useState(true);

  const { ref: viewRef, inView } = useInView({ rootMargin: '200px 0px' });
  const username = getUsernameFromUrl(url);
  const thumbUrl = generateThumbUrl(username);

  // The component is now a simple relative block. The transform is for drag-and-drop movement.
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 10,
  };

  useEffect(() => {
    setIsLoading(true);
    const webview = webviewRef.current;
    if (!webview) return;
    const handleDomReady = () => executeWebviewScript(webview, webviewInjectionScript);
    webview.addEventListener('dom-ready', handleDomReady);
    const hideOverlayTimer = setTimeout(() => setIsLoading(false), 5000);
    return () => { webview.removeEventListener('dom-ready', handleDomReady); clearTimeout(hideOverlayTimer); };
  }, [id]);

  useEffect(() => {
    if (!isLoading) {
      const shouldPlay = inView || isFullViewMode;
      const script = shouldPlay ? "const v=document.querySelector('video');if(v){v.muted=false;v.play();}" : "document.querySelector('video')?.pause();";
      executeWebviewScript(webviewRef.current, script);
      setPlaying(index, shouldPlay);
    }
  }, [inView, isFullViewMode, isLoading, index, setPlaying]);

  const containerClasses = ["relative h-full w-full overflow-hidden bg-black group", isDragging ? "opacity-0" : "opacity-100"].join(" ");
  const dropIndicatorClasses = ["absolute inset-0 z-50 pointer-events-none transition-all", isDraggable && isOver ? "bg-cyan-500/30 ring-2 ring-cyan-500" : ""].join(" ");

  return (
    <div ref={(node) => { setNodeRef(node); viewRef(node); }} style={style} className={containerClasses}>
      <div className={dropIndicatorClasses} />
      {isDraggable && <div {...attributes} {...listeners} className="absolute top-0 right-0 bg-cyan-600/70 text-white text-xs font-semibold px-1.5 py-0.5 rounded-bl-md select-none z-40 flex items-center gap-1 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100"><GripVertical size={12} />{username}</div>}
      <button onClick={() => removeStream(index)} className="absolute top-0 left-0 bg-red-600/70 text-white p-1 rounded-br-md select-none z-40 opacity-0 group-hover:opacity-100" title="Remove"><Trash2 size={14} /></button>
      
      <webview ref={webviewRef} src={url} className="w-full h-full bg-black" preload="./preload.js" webpreferences="backgroundThrottling=true" />
      
      {isLoading && (<div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20 pointer-events-none"><img src={thumbUrl} alt={username ?? ''} className="w-full h-full object-cover" /><div className="absolute"><Loader2 size={48} className="text-white/60 animate-spin" /></div></div>)}
      {!isLoading && !inView && !isFullViewMode && (<div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-gray-400 z-20 pointer-events-none"><VideoOff size={32} /><span className="text-xs mt-2">Paused</span></div>)}

      <StreamControls index={index} />
    </div>
  );
}