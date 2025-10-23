// src/components/redgifs/views/CreatorsView.tsx
import { useCreators } from '@/hooks/useRedGifs'
import { MediaGrid } from '../MediaGrid'
import { MediaReels } from '../MediaReels'
import { MediaTikTok } from '../MediaTikTok'
import { MediaTV } from '../MediaTV'
import { useRedGifsSettings } from '../RedGifsContext'

export function CreatorsView() {
  const { data, isLoading, fetchNextPage, hasNextPage } = useCreators()
  const { viewMode } = useRedGifsSettings()
  
  const allMedia = data?.pages.flatMap(page => page.gifs) || []
  
  if (isLoading && allMedia.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }
  
  switch (viewMode) {
    case 'grid':
      return (
        <MediaGrid
          media={allMedia}
          onLoadMore={() => hasNextPage && fetchNextPage()}
          isLoading={isLoading}
        />
      )
    case 'reels':
      return (
        <MediaReels
          media={allMedia}
          onLoadMore={() => hasNextPage && fetchNextPage()}
          isLoading={isLoading}
        />
      )
    case 'tiktok':
      return (
        <MediaTikTok
          media={allMedia}
          onLoadMore={() => hasNextPage && fetchNextPage()}
          isLoading={isLoading}
        />
      )
    case 'tv':
      return (
        <MediaTV
          media={allMedia}
          onLoadMore={() => hasNextPage && fetchNextPage()}
          isLoading={isLoading}
        />
      )
    default:
      return null
  }
}