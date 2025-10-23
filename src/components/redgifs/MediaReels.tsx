// src/components/redgifs/MediaReels.tsx
import { RedGifsMedia } from '@/services/redgifs'
import { MediaItem } from './MediaItem'
import { useCallback, useRef } from 'react'
import { List } from 'react-window'

interface MediaReelsProps {
  media: RedGifsMedia[]
  onLoadMore: () => void
  isLoading: boolean
}

export function MediaReels({ media, onLoadMore, isLoading }: MediaReelsProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
      if (scrollHeight - scrollTop <= clientHeight * 1.5 && !isLoading) {
        onLoadMore()
      }
    },
    [onLoadMore, isLoading]
  )
  
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    return (
      <div style={style} className="px-4 py-2">
        <MediaItem media={media[index]} className="w-full h-96" />
      </div>
    )
  }
  
  return (
    <div
      ref={containerRef}
      className="h-full overflow-y-auto"
      onScroll={handleScroll}
    >
      <List
        height={window.innerHeight - 60}
        itemCount={media.length}
        itemSize={window.innerHeight * 0.75}
        width={window.innerWidth}
      >
        {Row}
      </List>
      {isLoading && (
        <div className="flex justify-center py-4">
          <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  )
}