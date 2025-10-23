// src/components/redgifs/views/TrendingView.tsx
import { useTrending } from '@/hooks/useRedGifs'
import { MediaGrid } from '../MediaGrid'
import { MediaReels } from '../MediaReels'
import { MediaTikTok } from '../MediaTikTok'
import { MediaTV } from '../MediaTV'
import { ErrorBoundary } from '../ErrorBoundary'
import { useRedGifsStore } from '@/stores/redgifs'

export function TrendingView() {
  const { data, isLoading, fetchNextPage, hasNextPage, error, refetch } = useTrending()
  const { viewMode } = useRedGifsStore()
  
  const allMedia = data?.pages.flatMap(page => page.gifs) || []
  
  if (error) {
    return (
      <ErrorBoundary 
        error={error} 
        resetErrorBoundary={() => refetch()} 
      />
    )
  }
  
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