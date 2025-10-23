// src/hooks/useRedGifs.ts
import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { redGifsApiWithFallback, RedGifsMedia, RedGifsUser, RedGifsNiche } from '@/services/redgifs'
import { useRedGifsAuth } from './useRedGifsAuth'

export const useTrending = (enabled = true) => {
  const { isAuthenticated } = useRedGifsAuth()
  
  return useInfiniteQuery({
    queryKey: ['redgifs', 'trending'],
    queryFn: ({ pageParam = 1 }) => redGifsApiWithFallback.getTrending(pageParam),
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.pages) return lastPage.page + 1
      return undefined
    },
    enabled: enabled, // Remove the isAuthenticated check for now
    retry: 1, // Reduce retry count
    retryDelay: 1000,
  })
}

export const useCreators = (enabled = true) => {
  const { isAuthenticated } = useRedGifsAuth()
  
  return useInfiniteQuery({
    queryKey: ['redgifs', 'creators'],
    queryFn: ({ pageParam = 1 }) => redGifsApiWithFallback.getCreators(pageParam),
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.pages) return lastPage.page + 1
      return undefined
    },
    enabled: enabled, // Remove the isAuthenticated check for now
    retry: 1, // Reduce retry count
    retryDelay: 1000,
  })
}

export const useUserContent = (username: string, enabled = true) => {
  const { isAuthenticated } = useRedGifsAuth()
  
  return useInfiniteQuery({
    queryKey: ['redgifs', 'user', username],
    queryFn: ({ pageParam = 1 }) => redGifsApiWithFallback.getUserContent(username, pageParam),
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.pages) return lastPage.page + 1
      return undefined
    },
    enabled: enabled && !!username, // Remove the isAuthenticated check for now
    retry: 1, // Reduce retry count
    retryDelay: 1000,
  })
}

export const useNiches = (enabled = true) => {
  const { isAuthenticated } = useRedGifsAuth()
  
  return useInfiniteQuery({
    queryKey: ['redgifs', 'niches'],
    queryFn: ({ pageParam = 1 }) => redGifsApiWithFallback.getNiches(pageParam),
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.pages) return lastPage.page + 1
      return undefined
    },
    enabled: enabled, // Remove the isAuthenticated check for now
    retry: 1, // Reduce retry count
    retryDelay: 1000,
  })
}

export const useNicheContent = (nicheId: string, enabled = true) => {
  const { isAuthenticated } = useRedGifsAuth()
  
  return useInfiniteQuery({
    queryKey: ['redgifs', 'niche', nicheId],
    queryFn: ({ pageParam = 1 }) => redGifsApiWithFallback.getNicheContent(nicheId, pageParam),
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.pages) return lastPage.page + 1
      return undefined
    },
    enabled: enabled && !!nicheId, // Remove the isAuthenticated check for now
    retry: 1, // Reduce retry count
    retryDelay: 1000,
  })
}

export const useSearchCreators = (query: string, enabled = true) => {
  const { isAuthenticated } = useRedGifsAuth()
  
  return useQuery({
    queryKey: ['redgifs', 'search-creators', query],
    queryFn: () => redGifsApiWithFallback.searchCreators(query),
    enabled: enabled && !!query, // Remove the isAuthenticated check for now
    retry: 1, // Reduce retry count
    retryDelay: 1000,
  })
}