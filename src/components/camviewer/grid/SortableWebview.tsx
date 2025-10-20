import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
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

    // This is the new, robust setup function that forces playback.
    const setupWebview = () => {
      // --- SCRIPT: This combines UI hiding and a persistent autoplay attempt ---
      const injectionScript = `
        (function() {
          try {
            // Part 1: Aggressive UI Hiding (Your Script)
            document.body.style.backgroundColor='black';
            document.body.style.margin='0';
            document.body.style.overflow='hidden';
            [
              '#header','.footer-holder','.RoomSignupPopup','#roomTabs','.playerTitleBar',
              '.genderTabs','#TheaterModePlayer > div:nth-child(8)','.video-overlay',
              '.video-controls','.chat-container','.chat-panel','.bio-section',
              '.tip-menu','.tip-button','.header-container'
            ].forEach(sel => {
              document.querySelectorAll(sel).forEach(el => el.style.setProperty('display','none','important'));
            });

            const makeVideoFullscreen = () => {
              const video = document.querySelector('video') || document.querySelector('#chat-player_html5_api');
              if (video) {
                video.style.position='fixed'; video.style.top='0'; video.style.left='0';
                video.style.width='100vw'; video.style.height='100vh';
                video.style.objectFit='cover'; video.style.zIndex='1';
              }
            };
            makeVideoFullscreen();
            setInterval(makeVideoFullscreen, 2000);

            // Part 2: Persistent Autoplay Trigger
            let attempts = 0;
            const playInterval = setInterval(() => {
              const video = document.querySelector('video');
              const playButton = document.querySelector('.vjs-big-play-button');
              
              if (video) {
                video.muted = false; // Attempt to play with sound
                video.play().then(() => {
                  // If playback succeeds, we can stop trying
                  clearInterval(playInterval);
                }).catch(error => {
                  // Autoplay was likely blocked, try clicking the play button
                  if (playButton) {
                    playButton.click();
                  }
                });
              } else if (playButton) {
                 playButton.click();
              }
              
              attempts++;
              if (attempts > 20) { // Stop after 10 seconds
                clearInterval(playInterval);
              }
            }, 500);

          } catch (e) { console.error('Injection Error:', e); }
        })();
      `;
      
      webview.executeJavaScript(injectionScript).catch(console.error);
    };

    // Add the listener
    webview.addEventListener('dom-ready', setupWebview);
    
    // --- OPTIMISTIC UI UPDATE ---
    // We no longer wait for an IPC message. We assume the script will work.
    const playTimer = setTimeout(() => {
      setShowThumbnail(false);
      setPlaying(index, true);
      updateStreamStatus(index, true);
    }, 3000); // 3-second delay to allow player to initialize

    return () => {
      webview.removeEventListener('dom-ready', setupWebview);
      clearTimeout(playTimer);
    };
  }, [index, setPlaying, updateStreamStatus]); // Rerun if index changes

  const containerClasses = isFullViewMode 
    ? "w-full h-full relative overflow-hidden bg-black group"
    : "aspect-video relative overflow-hidden rounded-md border border-neutral-700 bg-black group";

  return (
    <div ref={setNodeRef} style={style} className={containerClasses}>
      <div {...attributes} {...listeners} className="absolute top-1 right-1 bg-cyan-600/80 text-white text-xs font-semibold px-1.5 py-0.5 rounded-l select-none z-30 flex items-center gap-1 cursor-grab active:cursor-grabbing">
        <GripVertical size={12} />
        {username}
      </div>
      
      {showThumbnail && (
        <img src={thumbUrl} alt={username} className="absolute inset-0 w-full h-full object-cover z-10" draggable={false} />
      )}
      
      <webview
        ref={webviewRef}
        src={url}
        className="w-full h-full bg-black"
        preload="./preload.js"
        style={{ opacity: showThumbnail ? 0 : 1 }}
      />

      <StreamControls index={index} />
    </div>
  );
}