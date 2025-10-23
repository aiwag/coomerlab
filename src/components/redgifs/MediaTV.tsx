// src/components/redgifs/MediaTV.tsx
import { useState, useEffect, useRef } from 'react'
import { RedGifsMedia } from '@/services/redgifs'
import { MediaItem } from './MediaItem'

interface MediaTVProps {
  media: RedGifsMedia[]
  onLoadMore: () => void
  isLoading: boolean
}

export function MediaTV({ media, onLoadMore, isLoading }: MediaTVProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex(prev => {
          if (prev >= media.length - 1) {
            return 0
          }
          return prev + 1
        })
      }, 10000) // Change every 10 seconds
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isPlaying, media.length])
  
  useEffect(() => {
    if (currentIndex >= media.length - 5 && !isLoading) {
      onLoadMore()
    }
  }, [currentIndex, media.length, onLoadMore, isLoading])
  
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }
  
  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % media.length)
  }
  
  const handlePrevious = () => {
    setCurrentIndex(prev => (prev - 1 + media.length) % media.length)
  }
  
  if (media.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }
  
  return (
    <div className="h-full relative bg-black">
      <MediaItem
        media={media[currentIndex]}
        className="w-full h-full"
      />
      
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handlePrevious}
              className="p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors"
            >
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.445 14.832A1 1 0 0010 14v-8a1 1 0 00-1.555-.832L3 9.168V6a1 1 0 00-2 0v8a1 1 0 002 0v-3.168l5.445 4z" />
              </svg>
            </button>
            
            <button
              onClick={handlePlayPause}
              className="p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors"
            >
              {isPlaying ? (
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              )}
            </button>
            
            <button
              onClick={handleNext}
              className="p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors"
            >
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 10.832V14a1 1 0 002 0V6a1 1 0 00-2 0v3.168L4.555 5.168z" />
              </svg>
            </button>
          </div>
          
          <div className="text-white">
            {currentIndex + 1} / {media.length}
          </div>
        </div>
      </div>
    </div>
  )
}