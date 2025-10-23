// src/components/redgifs/views/NichesView.tsx
import { useNiches } from '@/hooks/useRedGifs'
import { Link } from '@tanstack/react-router'
import { RedGifsNiche } from '@/services/redgifs'

export function NichesView() {
  const { data, isLoading, fetchNextPage, hasNextPage } = useNiches()
  
  const allNiches = data?.pages.flatMap(page => page.niches || []) || []
  
  if (isLoading && allNiches.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }
  
  return (
    <div className="p-4 overflow-y-auto h-full">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {allNiches.map((niche: RedGifsNiche) => (
          <Link
            key={niche.id}
            to="/redgifs/niche/$nicheId"
            params={{ nicheId: niche.id }}
            className="group relative overflow-hidden rounded-lg"
          >
            <img
              src={niche.cover}
              alt={niche.name}
              className="w-full h-40 object-cover group-hover:scale-105 transition-transform"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-70"></div>
            <div className="absolute bottom-0 left-0 right-0 p-2">
              <h3 className="text-white font-bold truncate">{niche.name}</h3>
              <p className="text-gray-300 text-sm">{niche.subscribers.toLocaleString()} subscribers</p>
            </div>
          </Link>
        ))}
      </div>
      
      {hasNextPage && (
        <div className="flex justify-center mt-4">
          <button
            onClick={() => fetchNextPage()}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  )
}