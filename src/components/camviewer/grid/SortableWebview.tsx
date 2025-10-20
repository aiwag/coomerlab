import React, { useRef, useEffect, useState, useCallback } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { useGridStore } from "@/state/gridStore";
import { StreamControls } from "./StreamControls";

interface SortableWebviewProps {
  id: string;
  url: string;
  index: number;
  isFullViewMode?: boolean;
}

export function SortableWebview({
  id,
  url,
  index,
  isFullViewMode = false,
}: SortableWebviewProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });
  const webviewRef = useRef<HTMLWebViewElement>(null);

  const { setPlaying, updateStreamStatus } = useGridStore();

  const [showThumbnail, setShowThumbnail] = useState(true);

  const username = url.match(/chaturbate\.com\/([^/]+)/)?.[1] ?? "unknown";
  const thumbUrl = `https://jpeg.live.mmcdn.com/stream?room=${username}`;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? "none" : transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
  };

  useEffect(() => {
    const webview = webviewRef.current;
    if (!webview) return;

    // This robust setup function will handle timing issues
    const setupWebview = () => {
      // --- SCRIPT 1: Hide UI Elements ---
      const uiHidingScript = `(function(){try{document.body.style.backgroundColor='black';document.body.style.margin='0';document.body.style.overflow='hidden';['#header','.footer-holder','.RoomSignupPopup','#roomTabs','.playerTitleBar','.genderTabs','#TheaterModePlayer > div:nth-child(8)','.video-overlay','.video-controls','.chat-container','.chat-panel','.bio-section','.tip-menu','.tip-button','.header-container'].forEach(s=>{document.querySelectorAll(s).forEach(e=>e.style.setProperty('display','none','important'))});const vfs=()=>{const v=document.querySelector('video')||document.querySelector('#chat-player_html5_api'),d=document.querySelector('.videoPlayerDiv'),p=document.querySelector('.player-container');if(v){v.style.position='fixed';v.style.top='0';v.style.left='0';v.style.width='100vw';v.style.height='100vh';v.style.objectFit='cover';v.style.zIndex='1'}if(d){d.style.position='fixed';d.style.top='0';d.style.left='0';d.style.width='100vw';d.style.height='100vh';d.style.overflow='hidden';d.style.background='black';d.style.zIndex='0'}if(p){p.style.position='fixed';p.style.top='0';p.style.left='0';p.style.width='100vw';p.style.height='100vh';p.style.overflow='hidden';p.style.zIndex='0'}};vfs();window.addEventListener('resize',vfs);setInterval(vfs,2e3)}catch(e){console.error('Injection Error:',e)}})();`;

      webview.executeJavaScript(uiHidingScript).catch(console.error);

      // --- SCRIPT 2: Add Video Play Listener (with retry mechanism) ---
      let attempts = 0;
      const videoListenerInterval = setInterval(() => {
        attempts++;
        const videoListenerScript = `(function(){const v=document.querySelector('video');if(v){const p=()=>window.electron.ipcRenderer.sendToHost('video-played',${index});v.addEventListener('playing',p);v.addEventListener('play',p);return true}return false})();`;

        webview
          .executeJavaScript(videoListenerScript)
          .then((found) => {
            if (found) {
              clearInterval(videoListenerInterval); // Success, stop trying
            }
          })
          .catch(console.error);

        if (attempts > 20) {
          // Stop after ~10 seconds to prevent infinite loops
          clearInterval(videoListenerInterval);
        }
      }, 500); // Try every half second
    };

    const onIpcMessage = (event: any) => {
      if (event.channel === "video-played" && event.args[0] === index) {
        setShowThumbnail(false);
        setPlaying(index, true);
        updateStreamStatus(index, true);
      }
    };

    webview.addEventListener("dom-ready", setupWebview);
    webview.addEventListener("ipc-message", onIpcMessage);

    return () => {
      webview.removeEventListener("dom-ready", setupWebview);
      webview.removeEventListener("ipc-message", onIpcMessage);
    };
  }, [index, setPlaying, updateStreamStatus]);

  const containerClasses = isFullViewMode
    ? "w-full h-full relative overflow-hidden bg-black group"
    : "aspect-video relative overflow-hidden rounded-md border border-neutral-700 bg-black group";

  return (
    <div ref={setNodeRef} style={style} className={containerClasses}>
      <div
        {...attributes}
        {...listeners}
        className="absolute top-1 right-1 z-30 flex cursor-grab items-center gap-1 rounded-l bg-cyan-600/80 px-1.5 py-0.5 text-xs font-semibold text-white select-none active:cursor-grabbing"
      >
        <GripVertical size={12} />
        {username}
      </div>

      {showThumbnail && (
        <img
          src={thumbUrl}
          alt={username}
          className="absolute inset-0 z-10 h-full w-full object-cover"
          draggable={false}
        />
      )}

      <webview
        ref={webviewRef}
        src={url}
        className="h-full w-full bg-black"
        preload="./preload.js"
        style={{ opacity: showThumbnail ? 0 : 1 }}
      />

      <StreamControls index={index} />
    </div>
  );
}
