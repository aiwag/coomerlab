// src/services/redgifs.ts
import { ofetch } from 'ofetch'

const API_BASE = 'https://api.redgifs.com/v2'

// Store for auth token and headers
let authToken: string | null = null
let sessionId: string | null = null
let customHeaders: Record<string, string> = {}

// Generate a random session ID
const generateSessionId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

// Initialize session with temporary token
const initializeSession = async () => {
  if (!sessionId) {
    sessionId = generateSessionId()
  }
  
  try {
    // Get temporary auth token
    const response = await ofetch('https://api.redgifs.com/v2/auth/temporary', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (response.token) {
      authToken = response.token
      // Store additional session info
      customHeaders = {
        'accept': 'application/json, text/plain, */*',
        'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
        'authorization': `Bearer ${response.token}`,
        'origin': 'https://www.redgifs.com',
        'priority': 'u=1, i',
        'referer': 'https://www.redgifs.com/',
        'sec-ch-ua': '"Chromium";v="140", "Not=A?Brand";v="24", "Google Chrome";v="140"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Linux"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
        'user-agent': response.agent || 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
        'x-session-id': response.session || sessionId,
      }
      return true
    }
    return false
  } catch (error) {
    console.error('Failed to initialize session:', error)
    return false
  }
}

// Parse cURL command to extract headers
export const parseCurlCommand = (curlCommand: string): Record<string, string> => {
  const headers: Record<string, string> = {}
  
  // Extract URL
  const urlMatch = curlCommand.match(/curl\s+'([^']+)'/);
  if (!urlMatch) {
    throw new Error('Invalid cURL command: Could not find URL');
  }
  
  // Extract headers
  const headerRegex = /-H\s+'([^:]+):\s*([^']+)'/g;
  let match;
  
  while ((match = headerRegex.exec(curlCommand)) !== null) {
    headers[match[1]] = match[2];
  }
  
  return headers;
}

// Set custom headers from cURL command
export const setHeadersFromCurl = (curlCommand: string) => {
  try {
    const headers = parseCurlCommand(curlCommand);
    customHeaders = headers;
    
    // Extract token from authorization header
    if (headers.authorization && headers.authorization.startsWith('Bearer ')) {
      authToken = headers.authorization.substring(7);
    }
    
    // Extract session ID
    if (headers['x-session-id']) {
      sessionId = headers['x-session-id'];
    }
    
    return true;
  } catch (error) {
    console.error('Failed to parse cURL command:', error);
    return false;
  }
}

// Create a fetch instance with auth headers
const createAuthenticatedFetch = () => {
  return ofetch.create({
    onRequest({ options }) {
      // Set required headers
      options.headers = {
        ...options.headers,
        ...customHeaders,
      }
    },
    onResponseError({ response }) {
      // If we get a 401, try to re-authenticate
      if (response.status === 401) {
        authToken = null;
        initializeSession();
      }
    }
  })
}

export interface RedGifsMedia {
  id: string
  userName: string
  urls: {
    thumbnail: string
    sd: string
    hd: string
    poster: string
    html: string
    silent?: string
  }
  tags: string[]
  likes: number
  views: number
  duration?: number
  hasAudio: boolean
  type: number // 1 for video, 2 for image
  width: number
  height: number
  avgColor: string
  createDate: number
  verified: boolean
  description?: string
  niches: string[]
}

export interface RedGifsUser {
  username: string
  name: string
  description: string
  followers: number
  following: number
  gifs: number
  profileImageUrl: string
  verified: boolean
  views: number
  url: string
}

export interface RedGifsNiche {
  id: string
  name: string
  description: string
  cover: string
  thumbnail: string
  subscribers: number
  gifs: number
}

export interface RedGifsResponse<T> {
  gifs: T[]
  users?: RedGifsUser[]
  niches?: RedGifsNiche[]
  tags: string[]
  page: number
  pages: number
  total: number
}

// Initialize session on module load
initializeSession();

export const redGifsApi = {
  // Get trending content
  getTrending: async (page = 1, count = 30): Promise<RedGifsResponse<RedGifsMedia>> => {
    const apiFetch = createAuthenticatedFetch();
    return apiFetch(`${API_BASE}/feeds/trending/popular?page=${page}&count=${count}`);
  },

  // Get creators list
  getCreators: async (page = 1, count = 30): Promise<RedGifsResponse<RedGifsMedia>> => {
    const apiFetch = createAuthenticatedFetch();
    return apiFetch(`${API_BASE}/creators/search/previews?order=trending&page=${page}&count=${count}&verified=y`);
  },

  // Get user content
  getUserContent: async (
    username: string,
    page = 1,
    count = 40
  ): Promise<RedGifsResponse<RedGifsMedia>> => {
    const apiFetch = createAuthenticatedFetch();
    return apiFetch(`${API_BASE}/users/${username}/search?order=new&count=${count}&page=${page}&type=g`);
  },

  // Get niches list
  getNiches: async (page = 1, count = 30): Promise<RedGifsResponse<RedGifsNiche>> => {
    const apiFetch = createAuthenticatedFetch();
    return apiFetch(`${API_BASE}/niches/search/previews?order=subscribers&page=${page}&count=${count}`);
  },

  // Get niche content
  getNicheContent: async (
    nicheId: string,
    page = 1,
    count = 30,
    order = 'hot'
  ): Promise<RedGifsResponse<RedGifsMedia>> => {
    const apiFetch = createAuthenticatedFetch();
    return apiFetch(`${API_BASE}/niches/${nicheId}/gifs?count=${count}&page=${page}&order=${order}`);
  },

  // Search for creators
  searchCreators: async (query: string, page = 1, count = 30): Promise<RedGifsResponse<RedGifsUser>> => {
    const apiFetch = createAuthenticatedFetch();
    return apiFetch(`${API_BASE}/creators/search?search_text=${query}&page=${page}&count=${count}`);
  },
};

// Add this at the end of the file
import { redGifsFallbackApi } from './redgifs-fallback'

// Create a wrapper that tries the real API first, then falls back to mock data
const createApiWithFallback = () => {
  return {
    getTrending: async (page = 1, count = 30) => {
      try {
        return await redGifsApi.getTrending(page, count)
      } catch (error) {
        console.warn('Failed to fetch from RedGifs API, using fallback data', error)
        return await redGifsFallbackApi.getTrending(page, count)
      }
    },
    getCreators: async (page = 1, count = 30) => {
      try {
        return await redGifsApi.getCreators(page, count)
      } catch (error) {
        console.warn('Failed to fetch from RedGifs API, using fallback data', error)
        return await redGifsFallbackApi.getCreators(page, count)
      }
    },
    getUserContent: async (username: string, page = 1, count = 40) => {
      try {
        return await redGifsApi.getUserContent(username, page, count)
      } catch (error) {
        console.warn('Failed to fetch from RedGifs API, using fallback data', error)
        return await redGifsFallbackApi.getUserContent(username, page, count)
      }
    },
    getNiches: async (page = 1, count = 30) => {
      try {
        return await redGifsApi.getNiches(page, count)
      } catch (error) {
        console.warn('Failed to fetch from RedGifs API, using fallback data', error)
        return await redGifsFallbackApi.getNiches(page, count)
      }
    },
    getNicheContent: async (nicheId: string, page = 1, count = 30, order = 'hot') => {
      try {
        return await redGifsApi.getNicheContent(nicheId, page, count, order)
      } catch (error) {
        console.warn('Failed to fetch from RedGifs API, using fallback data', error)
        return await redGifsFallbackApi.getNicheContent(nicheId, page, count, order)
      }
    },
    searchCreators: async (query: string, page = 1, count = 30) => {
      try {
        return await redGifsApi.searchCreators(query, page, count)
      } catch (error) {
        console.warn('Failed to fetch from RedGifs API, using fallback data', error)
        return await redGifsFallbackApi.searchCreators(query, page, count)
      }
    },
  }
}

// Export the API with fallback
export const redGifsApiWithFallback = createApiWithFallback()