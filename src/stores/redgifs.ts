// src/stores/redgifs.ts
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

type ViewMode = 'grid' | 'reels' | 'tiktok' | 'tv'
type Quality = 'sd' | 'hd'

interface RedGifsState {
  quality: Quality
  viewMode: ViewMode
  autoplay: boolean
  soundEnabled: boolean
  setQuality: (quality: Quality) => void
  setViewMode: (mode: ViewMode) => void
  setAutoplay: (autoplay: boolean) => void
  setSoundEnabled: (enabled: boolean) => void
}

export const useRedGifsStore = create<RedGifsState>()(
  subscribeWithSelector((set) => ({
    quality: 'sd',
    viewMode: 'grid',
    autoplay: true,
    soundEnabled: false,
    
    setQuality: (quality) => set({ quality }),
    setViewMode: (viewMode) => set({ viewMode }),
    setAutoplay: (autoplay) => set({ autoplay }),
    setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
  }))
)
