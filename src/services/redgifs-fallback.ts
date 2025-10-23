// src/services/redgifs-fallback.ts
import { RedGifsMedia, RedGifsUser, RedGifsNiche, RedGifsResponse } from './redgifs'

// Create mock data for development
const createMockMedia = (index: number): RedGifsMedia => ({
  id: `mock-${index}`,
  userName: `user${index}`,
  urls: {
    thumbnail: `https://picsum.photos/seed/thumb${index}/200/300.jpg`,
    sd: `https://picsum.photos/seed/sd${index}/400/600.jpg`,
    hd: `https://picsum.photos/seed/hd${index}/800/1200.jpg`,
    poster: `https://picsum.photos/seed/poster${index}/400/600.jpg`,
    html: `https://example.com/mock-${index}`,
  },
  tags: ['tag1', 'tag2', 'tag3'],
  likes: Math.floor(Math.random() * 10000),
  views: Math.floor(Math.random() * 100000),
  duration: Math.floor(Math.random() * 60),
  hasAudio: Math.random() > 0.5,
  type: Math.random() > 0.3 ? 1 : 2,
  width: 800,
  height: 600,
  avgColor: '#000000',
  createDate: Date.now() - Math.floor(Math.random() * 1000000000),
  verified: Math.random() > 0.7,
  description: `Mock description for item ${index}`,
  niches: ['niche1', 'niche2'],
})

const createMockUser = (index: number): RedGifsUser => ({
  username: `user${index}`,
  name: `User ${index}`,
  description: `Description for user ${index}`,
  followers: Math.floor(Math.random() * 10000),
  following: Math.floor(Math.random() * 1000),
  gifs: Math.floor(Math.random() * 100),
  profileImageUrl: `https://picsum.photos/seed/avatar${index}/100/100.jpg`,
  verified: Math.random() > 0.7,
  views: Math.floor(Math.random() * 1000000),
  url: `https://example.com/user${index}`,
})

const createMockNiche = (index: number): RedGifsNiche => ({
  id: `niche-${index}`,
  name: `Niche ${index}`,
  description: `Description for niche ${index}`,
  cover: `https://picsum.photos/seed/cover${index}/400/300.jpg`,
  thumbnail: `https://picsum.photos/seed/thumb${index}/200/150.jpg`,
  subscribers: Math.floor(Math.random() * 10000),
  gifs: Math.floor(Math.random() * 1000),
})

const createMockResponse = <T,>(
  items: T[],
  page: number,
  totalPages: number
): RedGifsResponse<T> => ({
  gifs: items as any,
  page,
  pages: totalPages,
  total: items.length * totalPages,
  tags: ['tag1', 'tag2', 'tag3'],
})

export const redGifsFallbackApi = {
  // Get trending content
  getTrending: async (page = 1, count = 30): Promise<RedGifsResponse<RedGifsMedia>> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const items = Array.from({ length: count }, (_, i) => 
      createMockMedia((page - 1) * count + i)
    )
    
    return createMockResponse(items, page, 10)
  },

  // Get creators list
  getCreators: async (page = 1, count = 30): Promise<RedGifsResponse<RedGifsMedia>> => {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const items = Array.from({ length: count }, (_, i) => 
      createMockMedia((page - 1) * count + i)
    )
    
    return createMockResponse(items, page, 10)
  },

  // Get user content
  getUserContent: async (
    username: string,
    page = 1,
    count = 40
  ): Promise<RedGifsResponse<RedGifsMedia>> => {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const items = Array.from({ length: count }, (_, i) => 
      createMockMedia((page - 1) * count + i)
    )
    
    return createMockResponse(items, page, 10)
  },

  // Get niches list
  getNiches: async (page = 1, count = 30): Promise<RedGifsResponse<RedGifsNiche>> => {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const items = Array.from({ length: count }, (_, i) => 
      createMockNiche((page - 1) * count + i)
    )
    
    return createMockResponse(items, page, 10)
  },

  // Get niche content
  getNicheContent: async (
    nicheId: string,
    page = 1,
    count = 30,
    order = 'hot'
  ): Promise<RedGifsResponse<RedGifsMedia>> => {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const items = Array.from({ length: count }, (_, i) => 
      createMockMedia((page - 1) * count + i)
    )
    
    return createMockResponse(items, page, 10)
  },

  // Search for creators
  searchCreators: async (query: string, page = 1, count = 30): Promise<RedGifsResponse<RedGifsUser>> => {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const items = Array.from({ length: count }, (_, i) => 
      createMockUser((page - 1) * count + i)
    )
    
    return createMockResponse(items, page, 10)
  },
}