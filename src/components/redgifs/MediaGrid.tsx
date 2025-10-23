// src/components/redgifs/MediaGrid.tsx
import React from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { RedGifsMedia } from '@/services/redgifs'
import { MediaItem } from './MediaItem'
import { cn } from '@/lib/utils'

interface MediaGridProps {
  media: RedGifsMedia[]
  onLoadMore: () => void
  isLoading: boolean
  className?: string
}

export function MediaGrid({ media, onLoadMore, isLoading, className }: MediaGridProps) {
  const parentRef = React.useRef<HTMLDivElement>(null)
  
  const virtualizer = useVirtualizer({
    count: Math.ceil(media.length / 3),
    getScrollElement: () => parentRef.current,
    estimateSize: () => window.innerWidth / 3,
    overscan: 5,
  })
  
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
    if (scrollHeight - scrollTop <= clientHeight * 1.5 && !isLoading) {
      onLoadMore()
    }
  }
  
  return (
    <div
      ref={parentRef}
      className={cn("h-full overflow-y-auto", className)}
      onScroll={handleScroll}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const startIndex = virtualItem.index * 3
          const endIndex = Math.min(startIndex + 3, media.length)
          const rowItems = media.slice(startIndex, endIndex)
          
          return (
            <div
              key={virtualItem.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              <div className="grid grid-cols-3 gap-1 p-1 h-full">
                {rowItems.map((item, colIndex) => (
                  <MediaItem
                    key={item.id}
                    media={item}
                    index={startIndex + colIndex}
                  />
                ))}
                {rowItems.length < 3 && (
                  Array.from({ length: 3 - rowItems.length }).map((_, emptyIndex) => (
                    <div key={`empty-${emptyIndex}`} className="p-1" />
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>
      
      {isLoading && (
        <div className="flex justify-center py-4">
          <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  )
}