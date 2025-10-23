// src/components/redgifs/views/NicheView.tsx
import { useParams } from '@tanstack/react-router'
import { useNicheContent } from '@/hooks/useRedGifs'
import { MediaGrid } from '../MediaGrid'
import { MediaReels } from '../MediaReels'
import { MediaTikTok } from '../MediaTikTok'
import { MediaTV } from '../MediaTV'
import { useRedGifsSettings } from '../RedGifsContext'

export function NicheView() {
  const { nicheId } = useParams({ from: '/redgifs/niche/$nicheId' })
  const { data, isLoading, fetchNextPage, hasNextPage } = useNicheContent(nicheId)
  const { viewMode } = useRedGifsSettings()
  
  const allMedia = data?.pages.flatMap(page => page.gifs) || []
  const niche = data?.pages[0]?.niches?.[0]
  
  if (isLoading && allMedia.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }
  
  return (
    <div className="h-full flex flex-col">
      {niche && (
        <div className="bg-gray-800 p-4">
          <h2 className="text-xl font-bold">{niche.name}</h2>
          <p className="text-gray-400 mt-1">{niche.description}</p>
          <div className="flex items-center space-x-4 mt-2 text-sm">
            <span>{niche.subscribers.toLocaleString()} subscribers</span>
            <span>{niche.gifs.toLocaleString()} posts</span>
          </div>
        </div>
      )}
      
      <div className="flex-1">
        {viewMode === 'grid' && (
          <MediaGrid
            media={allMedia}
            onLoadMore={() => hasNextPage && fetchNextPage()}
            isLoading={isLoading}
          />
        )}
        {viewMode === 'reels' && (
          <MediaReels
            media={allMedia}
            onLoadMore={() => hasNextPage && fetchNextPage()}
            isLoading={isLoading}
          />
        )}
        {viewMode === 'tiktok' && (
          <MediaTikTok
            media={allMedia}
            onLoadMore={() => hasNextPage && fetchNextPage()}
            isLoading={isLoading}
          />
        )}
        {viewMode === 'tv' && (
          <MediaTV
            media={allMedia}
            onLoadMore={() => hasNextPage && fetchNextPage()}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  )
}