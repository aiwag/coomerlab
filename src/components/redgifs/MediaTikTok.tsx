// src/components/redgifs/MediaTikTok.tsx
import { useState, useEffect, useRef } from 'react'
import { RedGifsMedia } from '@/services/redgifs'
import { MediaItem } from './MediaItem'

interface MediaTikTokProps {
  media: RedGifsMedia[]
  onLoadMore: () => void
  isLoading: boolean
}

export function MediaTikTok({ media, onLoadMore, isLoading }: MediaTikTokProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' && currentIndex < media.length - 1) {
        setCurrentIndex(prev => prev + 1)
      } else if (e.key === 'ArrowUp' && currentIndex > 0) {
        setCurrentIndex(prev => prev - 1)
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex, media.length])
  
  useEffect(() => {
    if (currentIndex >= media.length - 5 && !isLoading) {
      onLoadMore()
    }
  }, [currentIndex, media.length, onLoadMore, isLoading])
  
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: currentIndex * window.innerHeight,
        behavior: 'smooth'
      })
    }
  }, [currentIndex])
  
  const handleScroll = () => {
    if (!containerRef.current) return
    
    const scrollTop = containerRef.current.scrollTop
    const newIndex = Math.round(scrollTop / window.innerHeight)
    
    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < media.length) {
      setCurrentIndex(newIndex)
    }
  }
  
  return (
    <div
      ref={containerRef}
      className="h-full overflow-y-auto snap-y snap-mandatory"
      onScroll={handleScroll}
    >
      {media.map((item, index) => (
        <div
          key={item.id}
          className="h-screen snap-start flex items-center justify-center bg-black"
        >
          <MediaItem
            media={item}
            className="w-full h-full max-w-md max-h-screen"
          />
        </div>
      ))}
      {isLoading && (
        <div className="h-screen flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  )
}