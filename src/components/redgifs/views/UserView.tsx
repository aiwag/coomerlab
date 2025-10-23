// src/components/redgifs/views/UserView.tsx
import { useParams } from '@tanstack/react-router'
import { useUserContent } from '@/hooks/useRedGifs'
import { MediaGrid } from '../MediaGrid'
import { MediaReels } from '../MediaReels'
import { MediaTikTok } from '../MediaTikTok'
import { MediaTV } from '../MediaTV'
import { useRedGifsSettings } from '../RedGifsContext'

export function UserView() {
  const { username } = useParams({ from: '/redgifs/user/$username' })
  const { data, isLoading, fetchNextPage, hasNextPage } = useUserContent(username)
  const { viewMode } = useRedGifsSettings()
  
  const allMedia = data?.pages.flatMap(page => page.gifs) || []
  const user = data?.pages[0]?.users?.[0]
  
  if (isLoading && allMedia.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }
  
  return (
    <div className="h-full flex flex-col">
      {user && (
        <div className="bg-gray-800 p-4 flex items-center space-x-4">
          <img
            src={user.profileImageUrl}
            alt={user.name}
            className="w-16 h-16 rounded-full object-cover"
          />
          <div>
            <h2 className="text-xl font-bold">{user.name}</h2>
            <p className="text-gray-400">@{user.username}</p>
            <p className="text-sm text-gray-300 mt-1">{user.description}</p>
            <div className="flex items-center space-x-4 mt-2 text-sm">
              <span>{user.followers.toLocaleString()} followers</span>
              <span>{user.gifs.toLocaleString()} posts</span>
              <span>{user.views.toLocaleString()} views</span>
            </div>
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