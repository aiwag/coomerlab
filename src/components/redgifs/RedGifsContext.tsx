// src/components/redgifs/RedGifsContext.tsx
import { createContext, useContext, useState, ReactNode } from 'react'

type ViewMode = 'grid' | 'reels' | 'tiktok' | 'tv'
type Quality = 'sd' | 'hd'

interface RedGifsContextType {
  quality: Quality
  setQuality: (quality: Quality) => void
  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void
  autoplay: boolean
  setAutoplay: (autoplay: boolean) => void
  soundEnabled: boolean
  setSoundEnabled: (enabled: boolean) => void
}

const RedGifsContext = createContext<RedGifsContextType | undefined>(undefined)

export function RedGifsProvider({ children }: { children: ReactNode }) {
  const [quality, setQuality] = useState<Quality>('sd')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [autoplay, setAutoplay] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(false)
  
  return (
    <RedGifsContext.Provider
      value={{
        quality,
        setQuality,
        viewMode,
        setViewMode,
        autoplay,
        setAutoplay,
        soundEnabled,
        setSoundEnabled,
      }}
    >
      {children}
    </RedGifsContext.Provider>
  )
}

export function useRedGifsSettings() {
  const context = useContext(RedGifsContext)
  if (!context) {
    throw new Error('useRedGifsSettings must be used within a RedGifsProvider')
  }
  return context
}