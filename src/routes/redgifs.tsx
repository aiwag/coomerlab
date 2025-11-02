import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { useVirtualizer } from '@tanstack/react-virtual';
import Plyr from 'plyr';
import 'plyr-react/plyr.css';

// API Endpoints
const API_BASE = 'https://api.redgifs.com/v2';
const AUTH_API = `${API_BASE}/auth/temporary`;
const TRENDS_API = `${API_BASE}/gifs/search?order=trending&count=30&type=g&verified=y`;
const CREATORS_API = `${API_BASE}/creators/search/previews?order=trending&page=1&count=30&verified=y`;
const NICHES_API = `${API_BASE}/niches/search/previews?order=subscribers&page=1&count=30`;

// Types
interface MediaItem {
  id: string;
  userName: string;
  urls: {
    thumbnail: string;
    sd: string;
    hd: string;
    poster: string;
    html: string;
    silent?: string;
  };
  type: number; // 1 for video, 2 for image
  duration?: number;
  hasAudio: boolean;
  likes: number;
  views: number;
  tags: string[];
  niches: string[] | Record<string, string>;
  avgColor: string;
  height: number;
  width: number;
  verified: boolean;
  description?: string;
  createDate?: number;
}

interface Creator {
  username: string;
  name: string;
  description: string | null;
  followers: number;
  gifs: number;
  profileImageUrl: string | null;
  profileUrl: string | null;
  url: string;
  verified: boolean;
  views: number;
  likes?: number;
  creationtime: number;
  status: string;
  subscription: number;
  studio: boolean;
  ageVerified: boolean;
  blockedTags: string[] | null;
  publishedGifs?: number;
}

interface Niche {
  id: string;
  name: string;
  description: string;
  cover: string | null;
  thumbnail: string;
  subscribers: number;
  gifs: number;
}

interface UserProfile {
  creationtime: number;
  description: string | null;
  followers: number;
  following: number;
  gifs: number;
  name: string;
  profileImageUrl: string | null;
  profileUrl: string | null;
  publishedCollections: number;
  publishedGifs: number;
  socialUrl1?: string;
  socialUrl2?: string;
  socialUrl3?: string;
  socialUrl4?: string;
  socialUrl5?: string;
  socialUrl6?: string;
  socialUrl7?: string;
  socialUrl8?: string;
  socialUrl9?: string;
  socialUrl10?: string;
  socialUrl11?: string;
  socialUrl12?: string;
  socialUrl13?: string;
  socialUrl14?: string;
  socialUrl15?: string;
  socialUrl16?: string;
  socialUrl17?: string;
  studio: boolean;
  subscription: number;
  url: string;
  username: string;
  verified: boolean;
  views: number;
}

interface ApiResponse {
  gifs?: MediaItem[];
  users?: Creator[];
  niches?: Niche[];
  tags?: string[];
  page: number;
  pages: number;
  total: number;
  items?: Creator[];
  cursor?: string;
}

interface AuthResponse {
  token: string;
  addr: string;
  agent: string;
  session: string;
  rtfm: string;
}

// Sort options
type SortOption = 'trending' | 'latest' | 'top7' | 'top28' | 'top365' | 'random';
type ContentType = 'all' | 'gifs' | 'images' | 'videos';

// Auth context
interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  getAuthToken: () => Promise<string | null>;
}

const AuthContext = React.createContext<AuthContextType>({
  token: null,
  isAuthenticated: false,
  getAuthToken: async () => null,
});

// Auth provider component
const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const getAuthToken = useCallback(async () => {
    try {
      const response = await fetch(AUTH_API);
      if (!response.ok) throw new Error('Failed to get auth token');
      const data: AuthResponse = await response.json();
      setToken(data.token);
      setIsAuthenticated(true);
      return data.token;
    } catch (error) {
      console.error('Error getting auth token:', error);
      setToken(null);
      setIsAuthenticated(false);
      return null;
    }
  }, []);
  
  useEffect(() => {
    getAuthToken();
  }, [getAuthToken]);
  
  return (
    <AuthContext.Provider value={{ token, isAuthenticated, getAuthToken }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for using auth
const useAuth = () => React.useContext(AuthContext);

// API fetch function with auth
const fetchWithAuth = async (url: string, token: string | null) => {
  if (!token) {
    throw new Error('No authentication token available');
  }
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'accept': 'application/json, text/plain, */*',
      'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
      'origin': 'https://www.redgifs.com',
      'referer': 'https://www.redgifs.com/',
    }
  });
  
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Authentication failed');
    }
    throw new Error(`API request failed with status ${response.status}`);
  }
  
  return response.json();
};

// Custom hooks for API calls with infinite scrolling
const useInfiniteContent = (
  endpoint: string, 
  aiFilter: boolean, 
  sortOption: SortOption = 'trending',
  contentType: ContentType = 'all'
) => {
  const { token, getAuthToken } = useAuth();
  
  return useInfiniteQuery<ApiResponse>({
    queryKey: [endpoint, aiFilter, sortOption, contentType],
    queryFn: async ({ pageParam = 1 }) => {
      let authToken = token;
      if (!authToken) {
        authToken = await getAuthToken();
      }
      
      let url = endpoint;
      if (endpoint.includes('?')) {
        url = `${endpoint}&page=${pageParam}`;
      } else {
        url = `${endpoint}?page=${pageParam}`;
      }
      
      // Add sort option if not already in URL
      if (!endpoint.includes('order=')) {
        url = url.includes('?') 
          ? `${url}&order=${sortOption}` 
          : `${url}?order=${sortOption}`;
      }
      
      // Add content type filter
      if (contentType !== 'all') {
        const typeMap = {
          'gifs': 'g',
          'images': 'i',
          'videos': 'v'
        };
        url = `${url}&type=${typeMap[contentType]}`;
      }
      
      return fetchWithAuth(url, authToken);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.page < lastPage.pages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    enabled: !!token,
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message === 'Authentication failed' && failureCount < 1) {
        return true;
      }
      return false;
    },
    retryDelay: 1000,
  });
};

const useUserProfile = (username: string) => {
  const { token, getAuthToken } = useAuth();
  
  return useQuery<UserProfile>({
    queryKey: ['userProfile', username],
    queryFn: async () => {
      let authToken = token;
      if (!authToken) {
        authToken = await getAuthToken();
      }
      
      // First get the user content to extract profile info
      const contentData = await fetchWithAuth(`${API_BASE}/users/${username}/search?order=new&count=1`, authToken);
      
      if (contentData.users && contentData.users.length > 0) {
        return contentData.users[0] as UserProfile;
      }
      
      throw new Error('User not found');
    },
    enabled: !!token && !!username,
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message === 'Authentication failed' && failureCount < 1) {
        return true;
      }
      return false;
    },
    retryDelay: 1000,
  });
};

const useSearch = (query: string, type: 'all' | 'creators' | 'gifs' | 'user' = 'all', aiFilter: boolean) => {
  const { token, getAuthToken } = useAuth();
  
  return useInfiniteQuery<ApiResponse>({
    queryKey: ['search', query, type, aiFilter],
    queryFn: async ({ pageParam = 1 }) => {
      let authToken = token;
      if (!authToken) {
        authToken = await getAuthToken();
      }
      
      let url = '';
      if (type === 'user') {
        // Direct user profile lookup
        url = `${API_BASE}/users/${query}/search?order=new&count=1`;
      } else if (type === 'creators') {
        url = `${API_BASE}/creators/search?search_text=${encodeURIComponent(query)}&page=${pageParam}&count=30`;
      } else if (type === 'gifs') {
        url = `${API_BASE}/gifs/search?search_text=${encodeURIComponent(query)}&page=${pageParam}&count=30`;
      } else {
        url = `${API_BASE}/gifs/search?search_text=${encodeURIComponent(query)}&page=${pageParam}&count=30`;
      }
      
      return fetchWithAuth(url, authToken);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.page < lastPage.pages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    enabled: !!token && !!query,
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message === 'Authentication failed' && failureCount < 1) {
        return true;
      }
      return false;
    },
    retryDelay: 1000,
  });
};

// Media Item Component
const MediaItem: React.FC<{
  item: MediaItem;
  quality: 'hd' | 'sd';
  onClick: () => void;
  onUserClick: (username: string) => void;
  isActive?: boolean;
  style?: React.CSSProperties;
  gridColumns: number;
}> = ({ item, quality, onClick, onUserClick, isActive = false, style, gridColumns }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<Plyr | null>(null);
  
  const mediaUrl = quality === 'hd' ? item.urls.hd : item.urls.sd;
  const isVideo = item.type === 1;
  
  // Calculate aspect ratio
  const aspectRatio = item.width && item.height ? item.width / item.height : 1;
  const itemHeight = gridColumns === 1 ? 400 : gridColumns === 2 ? 300 : 240;
  const itemWidth = itemHeight * aspectRatio;
  
  useEffect(() => {
    if (isVideo && videoRef.current && !isActive) {
      if (isHovered && !isPlaying) {
        videoRef.current.play().then(() => setIsPlaying(true));
      } else if (!isHovered && isPlaying) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
        setIsPlaying(false);
      }
    }
  }, [isHovered, isPlaying, isVideo, isActive]);
  
  useEffect(() => {
    if (isActive && isVideo && videoRef.current && !playerRef.current) {
      playerRef.current = new Plyr(videoRef.current, {
        controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'fullscreen'],
        autoplay: true,
        muted: false,
        clickToPlay: true,
        hideControls: true,
        resetOnEnd: false,
        tooltips: { controls: true, seek: true },
        captions: { active: false, update: false, language: 'auto' },
        fullscreen: { enabled: true, fallback: true, iosNative: true },
        storage: { enabled: false },
      });
      
      return () => {
        if (playerRef.current) {
          playerRef.current.destroy();
          playerRef.current = null;
        }
      };
    }
  }, [isActive, isVideo]);
  
  return (
    <div
      className={`relative overflow-hidden rounded-lg cursor-pointer bg-gray-900 group transition-all duration-300 ${isActive ? 'ring-2 ring-blue-500 shadow-2xl' : 'hover:ring-1 hover:ring-gray-600'}`}
      style={style}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isVideo ? (
        <video
          ref={videoRef}
          src={mediaUrl}
          poster={item.urls.poster}
          className="w-full h-full object-cover"
          muted={!isActive}
          loop={!isActive}
          playsInline
        />
      ) : (
        <img
          src={mediaUrl}
          alt={item.id}
          className="w-full h-full object-cover"
        />
      )}
      
      {isHovered && !isActive && (
        <div className="absolute inset-0 bg-black bg-opacity-30 flex flex-col justify-end p-2 transition-opacity duration-300">
          <div className="flex items-center justify-between">
            <div className="text-white text-xs truncate">{item.userName}</div>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 rounded transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onUserClick(item.userName);
              }}
            >
              Profile
            </button>
          </div>
          <div className="flex justify-between text-white text-xs mt-1">
            <span>{item.likes} likes</span>
            <span>{item.views} views</span>
          </div>
        </div>
      )}
      
      {item.verified && (
        <div className="absolute top-2 right-2 bg-blue-500 rounded-full p-1 z-10">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
      )}
      
      {isVideo && (
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 rounded px-1 py-0.5 text-xs text-white">
          {item.duration && `${Math.floor(item.duration / 60)}:${(item.duration % 60).toString().padStart(2, '0')}`}
        </div>
      )}
    </div>
  );
};

// Creator Card Component
const CreatorCard: React.FC<{
  creator: Creator;
  onClick: () => void;
}> = ({ creator, onClick }) => {
  return (
    <div 
      className="bg-gray-800 rounded-lg p-4 cursor-pointer hover:bg-gray-700 transition-all duration-300 hover:shadow-lg hover:shadow-gray-900/50"
      onClick={onClick}
    >
      <div className="flex items-center space-x-4">
        <img 
          src={creator.profileImageUrl || 'https://via.placeholder.com/64'} 
          alt={creator.username} 
          className="w-16 h-16 rounded-full object-cover ring-2 ring-gray-700"
        />
        <div className="flex-1">
          <div className="flex items-center">
            <h3 className="text-white font-medium">{creator.name}</h3>
            {creator.verified && (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <p className="text-gray-400 text-sm">@{creator.username}</p>
          <p className="text-gray-500 text-xs mt-1 line-clamp-2">{creator.description || 'No description'}</p>
          <div className="flex space-x-4 mt-2 text-xs text-gray-400">
            <span>{creator.followers} followers</span>
            <span>{creator.gifs} gifs</span>
            <span>{creator.views.toLocaleString()} views</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Niche Card Component
const NicheCard: React.FC<{
  niche: Niche;
  onClick: () => void;
}> = ({ niche, onClick }) => {
  return (
    <div 
      className="bg-gray-800 rounded-lg overflow-hidden cursor-pointer hover:bg-gray-700 transition-all duration-300 hover:shadow-lg hover:shadow-gray-900/50"
      onClick={onClick}
    >
      <div className="relative h-32">
        <img 
          src={niche.cover || 'https://via.placeholder.com/300x200'} 
          alt={niche.name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
        <div className="absolute bottom-2 left-2">
          <h3 className="text-white font-medium">{niche.name}</h3>
          <p className="text-gray-300 text-xs">{niche.subscribers.toLocaleString()} subscribers</p>
        </div>
      </div>
      <div className="p-3">
        <p className="text-gray-400 text-xs line-clamp-2">{niche.description}</p>
        <div className="mt-2 text-xs text-gray-500">
          {niche.gifs.toLocaleString()} gifs
        </div>
      </div>
    </div>
  );
};

// User Profile Component
const UserProfileComponent: React.FC<{
  username: string;
  onClose: () => void;
  onContentClick: (item: MediaItem, index: number) => void;
  aiFilter: boolean;
  gridColumns: number;
  quality: 'hd' | 'sd';
}> = ({ username, onClose, onContentClick, aiFilter, gridColumns, quality }) => {
  const userProfileQuery = useUserProfile(username);
  const userContentQuery = useInfiniteContent(
    `${API_BASE}/users/${username}/search?order=new&count=40`,
    aiFilter
  );
  
  const [sortOption, setSortOption] = useState<SortOption>('new');
  const [contentType, setContentType] = useState<ContentType>('all');
  
  // Refetch content when sort option or content type changes
  useEffect(() => {
    if (username) {
      userContentQuery.refetch();
    }
  }, [sortOption, contentType, username]);
  
  const userContentData = useMemo(() => {
    const allItems = userContentQuery.data?.pages.flatMap(page => page.gifs || []) || [];
    if (aiFilter) {
      return allItems.filter(item => 
        !item.tags.some(tag => tag.toLowerCase().includes('ai')) &&
        !item.description?.toLowerCase().includes('ai')
      );
    }
    return allItems;
  }, [userContentQuery.data, aiFilter]);
  
  if (userProfileQuery.isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!userProfileQuery.data) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-white">User not found</p>
      </div>
    );
  }
  
  const user = userProfileQuery.data;
  
  return (
    <div className="flex flex-col h-full">
      {/* User Profile Header */}
      <div className="bg-gray-800 p-6">
        <div className="flex items-center space-x-4">
          <button 
            className="bg-gray-700 rounded-full p-2 text-white hover:bg-gray-600 transition-colors"
            onClick={onClose}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          </button>
          
          <img 
            src={user.profileImageUrl || 'https://via.placeholder.com/100'} 
            alt={user.username} 
            className="w-20 h-20 rounded-full object-cover ring-2 ring-gray-700"
          />
          
          <div className="flex-1">
            <div className="flex items-center">
              <h2 className="text-2xl font-bold text-white">{user.name}</h2>
              {user.verified && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 ml-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <p className="text-gray-400 text-sm">@{user.username}</p>
            <p className="text-gray-300 text-sm mt-2">{user.description}</p>
            
            <div className="flex space-x-6 mt-4 text-sm">
              <div>
                <span className="text-white font-medium">{user.followers.toLocaleString()}</span>
                <span className="text-gray-400 ml-1">followers</span>
              </div>
              <div>
                <span className="text-white font-medium">{user.publishedGifs || user.gifs}</span>
                <span className="text-gray-400 ml-1">gifs</span>
              </div>
              <div>
                <span className="text-white font-medium">{user.views.toLocaleString()}</span>
                <span className="text-gray-400 ml-1">views</span>
              </div>
            </div>
            
            {/* Social Links */}
            {user.socialUrl6 && (
              <div className="mt-4">
                <a 
                  href={user.socialUrl6} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 0 4 4 0 018 0zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z"/>
                  </svg>
                  OnlyFans
                </a>
              </div>
            )}
          </div>
        </div>
        
        {/* Sort and Filter Options */}
        <div className="flex space-x-4 mt-4">
          <div className="flex items-center space-x-2">
            <label className="text-gray-300 text-sm">Sort:</label>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className="bg-gray-700 text-white px-3 py-1 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="new">Latest</option>
              <option value="trending">Trending</option>
              <option value="top7">This Week</option>
              <option value="top28">This Month</option>
              <option value="top365">This Year</option>
              <option value="random">Random</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <label className="text-gray-300 text-sm">Type:</label>
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value as ContentType)}
              className="bg-gray-700 text-white px-3 py-1 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All</option>
              <option value="gifs">Gifs</option>
              <option value="videos">Videos</option>
              <option value="images">Images</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* User Content Grid */}
      <div className="flex-1">
        <MasonryGrid
          items={userContentData}
          quality={quality}
          onItemClick={onContentClick}
          gridColumns={gridColumns}
          fetchNextPage={userContentQuery.fetchNextPage}
          hasNextPage={userContentQuery.hasNextPage}
          isFetchingNextPage={userContentQuery.isFetchingNextPage}
        />
      </div>
    </div>
  );
};

// Media Modal Component
const MediaModal: React.FC<{
  item: MediaItem | null;
  quality: 'hd' | 'sd';
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onUserClick?: (username: string) => void;
}> = ({ item, quality, onClose, onNext, onPrevious, onUserClick }) => {
  const playerRef = useRef<Plyr | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    if (item && videoRef.current) {
      playerRef.current = new Plyr(videoRef.current, {
        controls: [
          'play-large', 
          'play', 
          'progress', 
          'current-time', 
          'mute', 
          'volume', 
          'captions', 
          'settings', 
          'pip', 
          'airplay', 
          'fullscreen'
        ],
        autoplay: true,
        muted: false,
        clickToPlay: true,
        hideControls: false,
        resetOnEnd: false,
        tooltips: { controls: true, seek: true },
        captions: { active: false, update: false, language: 'auto' },
        fullscreen: { enabled: true, fallback: true, iosNative: true },
        storage: { enabled: true },
        quality: { default: quality === 'hd' ? 720 : 480, options: [2160, 1440, 1080, 720, 480, 360] },
      });
      
      return () => {
        if (playerRef.current) {
          playerRef.current.destroy();
          playerRef.current = null;
        }
      };
    }
  }, [item, quality]);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' && onNext) {
        onNext();
      } else if (e.key === 'ArrowLeft' && onPrevious) {
        onPrevious();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onNext, onPrevious]);
  
  if (!item) return null;
  
  const mediaUrl = quality === 'hd' ? item.urls.hd : item.urls.sd;
  const isVideo = item.type === 1;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="relative max-w-6xl max-h-full w-full" onClick={(e) => e.stopPropagation()}>
        <button 
          className="absolute top-2 right-2 bg-black bg-opacity-50 rounded-full p-2 text-white z-10 hover:bg-opacity-70 transition-all"
          onClick={onClose}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        {onPrevious && (
          <button 
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 rounded-full p-2 text-white z-10 hover:bg-opacity-70 transition-all"
            onClick={onPrevious}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        
        {onNext && (
          <button 
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 rounded-full p-2 text-white z-10 hover:bg-opacity-70 transition-all"
            onClick={onNext}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
        
        <div className="bg-gray-900 rounded-lg overflow-hidden">
          {isVideo ? (
            <video
              ref={videoRef}
              src={mediaUrl}
              poster={item.urls.poster}
              className="w-full max-h-[80vh] object-contain"
              playsInline
            />
          ) : (
            <img
              src={mediaUrl}
              alt={item.id}
              className="w-full max-h-[80vh] object-contain"
            />
          )}
          
          <div className="p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <h3 className="font-medium text-lg">{item.userName}</h3>
                {item.verified && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              
              {onUserClick && (
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded transition-colors"
                  onClick={() => onUserClick(item.userName)}
                >
                  View Profile
                </button>
              )}
            </div>
            
            <div className="flex justify-between mt-2 text-sm text-gray-400">
              <span>{item.likes} likes</span>
              <span>{item.views} views</span>
            </div>
            {item.description && (
              <p className="mt-2 text-sm text-gray-300">{item.description}</p>
            )}
            <div className="mt-2 flex flex-wrap gap-1">
              {item.tags.map(tag => (
                <span key={tag} className="bg-gray-700 text-xs px-2 py-1 rounded text-gray-300">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Masonry Grid Component
const MasonryGrid: React.FC<{
  items: MediaItem[];
  quality: 'hd' | 'sd';
  onItemClick: (item: MediaItem, index: number) => void;
  onUserClick: (username: string) => void;
  activeIndex?: number;
  gridColumns: number;
  fetchNextPage?: () => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
}> = ({ 
  items, 
  quality, 
  onItemClick, 
  onUserClick,
  activeIndex, 
  gridColumns,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [columns, setColumns] = useState<MediaItem[][]>([]);
  
  // Initialize columns
  useEffect(() => {
    const newColumns: MediaItem[][] = Array.from({ length: gridColumns }, () => []);
    const columnHeights = Array(gridColumns).fill(0);
    
    items.forEach(item => {
      const aspectRatio = item.width && item.height ? item.width / item.height : 1;
      const baseHeight = gridColumns === 1 ? 400 : gridColumns === 2 ? 300 : 240;
      const itemHeight = baseHeight / aspectRatio;
      
      // Find the shortest column
      const shortestColumnIndex = columnHeights.indexOf(Math.min(...columnHeights));
      newColumns[shortestColumnIndex].push(item);
      columnHeights[shortestColumnIndex] += itemHeight + 8; // 8px gap
    });
    
    setColumns(newColumns);
  }, [items, gridColumns]);
  
  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!fetchNextPage || !hasNextPage) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );
    
    const sentinel = document.getElementById('scroll-sentinel');
    if (sentinel) {
      observer.observe(sentinel);
    }
    
    return () => {
      if (sentinel) {
        observer.unobserve(sentinel);
      }
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);
  
  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900 p-4">
      <div className="flex gap-2" style={{ height: 'fit-content' }}>
        {columns.map((column, columnIndex) => (
          <div key={columnIndex} className="flex-1 flex flex-col gap-2">
            {column.map((item, itemIndex) => {
              const globalIndex = items.indexOf(item);
              const aspectRatio = item.width && item.height ? item.width / item.height : 1;
              const baseHeight = gridColumns === 1 ? 400 : gridColumns === 2 ? 300 : 240;
              const itemHeight = baseHeight / aspectRatio;
              
              return (
                <MediaItem
                  key={item.id}
                  item={item}
                  quality={quality}
                  onClick={() => onItemClick(item, globalIndex)}
                  onUserClick={onUserClick}
                  isActive={activeIndex === globalIndex}
                  style={{ height: `${itemHeight}px` }}
                  gridColumns={gridColumns}
                />
              );
            })}
          </div>
        ))}
      </div>
      
      {hasNextPage && (
        <div id="scroll-sentinel" className="flex justify-center py-4">
          {isFetchingNextPage && (
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          )}
        </div>
      )}
    </div>
  );
};

// Grid Settings Menu Component
const GridSettingsMenu: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  gridColumns: number;
  setGridColumns: (columns: number) => void;
  aiFilter: boolean;
  setAiFilter: (filter: boolean) => void;
}> = ({ isOpen, onClose, gridColumns, setGridColumns, aiFilter, setAiFilter }) => {
  if (!isOpen) return null;
  
  return (
    <div className="absolute top-full right-0 mt-2 w-64 bg-gray-800 rounded-lg shadow-lg p-4 z-30">
      <h3 className="text-white font-medium mb-4">Grid Settings</h3>
      
      <div className="mb-4">
        <label className="text-gray-300 text-sm block mb-2">Columns</label>
        <input
          type="range"
          min="1"
          max="6"
          value={gridColumns}
          onChange={(e) => setGridColumns(Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-gray-400 text-xs mt-1">
          <span>1</span>
          <span>{gridColumns}</span>
          <span>6</span>
        </div>
      </div>
      
      <div className="mb-4">
        <label className="flex items-center text-gray-300 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={aiFilter}
            onChange={(e) => setAiFilter(e.target.checked)}
            className="mr-2"
          />
          Filter AI Content
        </label>
      </div>
      
      <button
        onClick={onClose}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition-colors"
      >
        Close
      </button>
    </div>
  );
};

// Search Component
const SearchComponent: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  aiFilter: boolean;
  onUserClick: (username: string) => void;
}> = ({ isOpen, onClose, aiFilter, onUserClick }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'all' | 'creators' | 'gifs' | 'user'>('all');
  const searchQueryResult = useSearch(searchQuery, searchType, aiFilter);
  
  if (!isOpen) return null;
  
  const handleItemClick = (item: any) => {
    if (searchType === 'user' || item.username) {
      // Handle user profile click
      onUserClick(item.username);
    } else if (searchType === 'creators' || item.username) {
      // Handle creator click
      onUserClick(item.username);
    } else {
      // Handle media item click
      console.log('Media clicked:', item);
    }
    onClose();
  };
  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // If the search query looks like a username (contains underscore), search for user directly
      if (searchQuery.includes('_')) {
        setSearchType('user');
      }
    }
  };
  
  return (
    <div className="absolute top-full right-0 mt-2 w-96 bg-gray-800 rounded-lg shadow-lg p-4 z-30">
      <form onSubmit={handleSearchSubmit} className="flex items-center space-x-2 mb-4">
        <input
          type="text"
          placeholder="Search users, creators, or content..."
          className="flex-1 bg-gray-700 text-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          autoFocus
        />
        <select
          value={searchType}
          onChange={(e) => setSearchType(e.target.value as any)}
          className="bg-gray-700 text-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All</option>
          <option value="user">User Profile</option>
          <option value="creators">Creators</option>
          <option value="gifs">Gifs</option>
        </select>
      </form>
      
      {searchQuery && (
        <div className="max-h-96 overflow-y-auto">
          {searchQueryResult.data?.pages.flatMap(page => {
            if (searchType === 'user') {
              return page.users || [];
            } else if (searchType === 'creators') {
              return page.items || [];
            }
            return page.gifs || [];
          }).map((item: any) => (
            <div
              key={item.id || item.username}
              className="p-2 hover:bg-gray-700 rounded cursor-pointer flex items-center space-x-2"
              onClick={() => handleItemClick(item)}
            >
              {item.profileImageUrl ? (
                <img
                  src={item.profileImageUrl}
                  alt={item.username}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <img
                  src={item.urls?.thumbnail}
                  alt={item.id}
                  className="w-8 h-8 rounded object-cover"
                />
              )}
              <div className="flex-1">
                <div className="text-white text-sm truncate">
                  {item.name || item.userName}
                </div>
                <div className="text-gray-400 text-xs">
                  {item.username ? `@${item.username}` : `${item.likes} likes`}
                </div>
              </div>
            </div>
          ))}
          
          {searchQueryResult.hasNextPage && (
            <button
              onClick={() => searchQueryResult.fetchNextPage()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded mt-2 transition-colors"
            >
              Load More
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// Main App Component
const RedGifsApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'trends' | 'creators' | 'niches' | 'search'>('trends');
  const [quality, setQuality] = useState<'hd' | 'sd'>('hd');
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [selectedCreator, setSelectedCreator] = useState<string | null>(null);
  const [selectedNiche, setSelectedNiche] = useState<string | null>(null);
  const [currentMediaIndex, setCurrentMediaIndex] = useState<number>(-1);
  const [focusedItemIndex, setFocusedItemIndex] = useState<number>(0);
  const [gridColumns, setGridColumns] = useState(4);
  const [aiFilter, setAiFilter] = useState(false);
  const [isGridSettingsOpen, setIsGridSettingsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>('trending');
  const [contentType, setContentType] = useState<ContentType>('all');
  
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  
  // API queries with infinite scrolling
  const trendsQuery = useInfiniteContent(TRENDS_API, aiFilter, sortOption, contentType);
  const creatorsQuery = useInfiniteContent(CREATORS_API, aiFilter, sortOption, contentType);
  const nichesQuery = useInfiniteContent(NICHES_API, aiFilter, sortOption, contentType);
  const userContentQuery = useInfiniteContent(
    `${API_BASE}/users/${selectedCreator}/search?order=new&count=40`,
    aiFilter,
    sortOption,
    contentType
  );
  const nicheContentQuery = useInfiniteContent(
    `${API_BASE}/niches/${selectedNiche}/gifs`,
    aiFilter,
    sortOption,
    contentType
  );
  
  // Flatten infinite query data and filter AI content
  const trendsData = useMemo(() => {
    const allItems = trendsQuery.data?.pages.flatMap(page => page.gifs || []) || [];
    if (aiFilter) {
      return allItems.filter(item => 
        !item.tags.some(tag => tag.toLowerCase().includes('ai')) &&
        !item.description?.toLowerCase().includes('ai')
      );
    }
    return allItems;
  }, [trendsQuery.data, aiFilter]);
  
  const creatorsData = useMemo(() => {
    const allItems = creatorsQuery.data?.pages.flatMap(page => page.gifs || []) || [];
    if (aiFilter) {
      return allItems.filter(item => 
        !item.tags.some(tag => tag.toLowerCase().includes('ai')) &&
        !item.description?.toLowerCase().includes('ai')
      );
    }
    return allItems;
  }, [creatorsQuery.data, aiFilter]);
  
  const nichesData = useMemo(() => {
    const allItems = nichesQuery.data?.pages.flatMap(page => page.gifs || []) || [];
    if (aiFilter) {
      return allItems.filter(item => 
        !item.tags.some(tag => tag.toLowerCase().includes('ai')) &&
        !item.description?.toLowerCase().includes('ai')
      );
    }
    return allItems;
  }, [nichesQuery.data, aiFilter]);
  
  const userContentData = useMemo(() => {
    const allItems = userContentQuery.data?.pages.flatMap(page => page.gifs || []) || [];
    if (aiFilter) {
      return allItems.filter(item => 
        !item.tags.some(tag => tag.toLowerCase().includes('ai')) &&
        !item.description?.toLowerCase().includes('ai')
      );
    }
    return allItems;
  }, [userContentQuery.data, aiFilter]);
  
  const nicheContentData = useMemo(() => {
    const allItems = nicheContentQuery.data?.pages.flatMap(page => page.gifs || []) || [];
    if (aiFilter) {
      return allItems.filter(item => 
        !item.tags.some(tag => tag.toLowerCase().includes('ai')) &&
        !item.description?.toLowerCase().includes('ai')
      );
    }
    return allItems;
  }, [nicheContentQuery.data, aiFilter]);
  
  // Determine which data to display
  let displayData: MediaItem[] = [];
  let isLoading = false;
  let hasNextPage = false;
  let fetchNextPage: (() => void) | undefined;
  let isFetchingNextPage = false;
  
  if (selectedCreator) {
    displayData = userContentData;
    isLoading = userContentQuery.isLoading;
    hasNextPage = userContentQuery.hasNextPage || false;
    fetchNextPage = userContentQuery.fetchNextPage;
    isFetchingNextPage = userContentQuery.isFetchingNextPage;
  } else if (selectedNiche) {
    displayData = nicheContentData;
    isLoading = nicheContentQuery.isLoading;
    hasNextPage = nicheContentQuery.hasNextPage || false;
    fetchNextPage = nicheContentQuery.fetchNextPage;
    isFetchingNextPage = nicheContentQuery.isFetchingNextPage;
  } else if (activeTab === 'trends') {
    displayData = trendsData;
    isLoading = trendsQuery.isLoading;
    hasNextPage = trendsQuery.hasNextPage || false;
    fetchNextPage = trendsQuery.fetchNextPage;
    isFetchingNextPage = trendsQuery.isFetchingNextPage;
  } else if (activeTab === 'creators') {
    displayData = creatorsData;
    isLoading = creatorsQuery.isLoading;
    hasNextPage = creatorsQuery.hasNextPage || false;
    fetchNextPage = creatorsQuery.fetchNextPage;
    isFetchingNextPage = creatorsQuery.isFetchingNextPage;
  } else if (activeTab === 'niches') {
    displayData = nichesData;
    isLoading = nichesQuery.isLoading;
    hasNextPage = nichesQuery.hasNextPage || false;
    fetchNextPage = nichesQuery.fetchNextPage;
    isFetchingNextPage = nichesQuery.isFetchingNextPage;
  }
  
  // Refetch data when sort option or content type changes
  useEffect(() => {
    if (activeTab === 'trends') {
      trendsQuery.refetch();
    } else if (activeTab === 'creators') {
      creatorsQuery.refetch();
    } else if (activeTab === 'niches') {
      nichesQuery.refetch();
    }
  }, [sortOption, contentType, activeTab]);
  
  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedMedia) {
          setSelectedMedia(null);
        } else if (selectedCreator || selectedNiche) {
          setSelectedCreator(null);
          setSelectedNiche(null);
        } else if (isGridSettingsOpen) {
          setIsGridSettingsOpen(false);
        } else if (isSearchOpen) {
          setIsSearchOpen(false);
        }
      } else if (e.key === 'ArrowUp' && !selectedMedia) {
        e.preventDefault();
        setFocusedItemIndex(prev => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowDown' && !selectedMedia) {
        e.preventDefault();
        setFocusedItemIndex(prev => Math.min(displayData.length - 1, prev + 1));
      } else if (e.key === 'Enter' && !selectedMedia && displayData[focusedItemIndex]) {
        handleMediaClick(displayData[focusedItemIndex], focusedItemIndex);
      } else if (e.key === '/' && !selectedMedia) {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedMedia, selectedCreator, selectedNiche, displayData, focusedItemIndex, isGridSettingsOpen, isSearchOpen]);
  
  // Handle media item click
  const handleMediaClick = useCallback((item: MediaItem, index: number) => {
    setSelectedMedia(item);
    setCurrentMediaIndex(index);
    setFocusedItemIndex(index);
  }, []);
  
  // Handle creator click
  const handleCreatorClick = useCallback((creator: Creator) => {
    setSelectedCreator(creator.username);
    setSelectedNiche(null);
    setFocusedItemIndex(0);
  }, []);
  
  // Handle niche click
  const handleNicheClick = useCallback((niche: Niche) => {
    setSelectedNiche(niche.id);
    setSelectedCreator(null);
    setFocusedItemIndex(0);
  }, []);
  
  // Handle user profile click
  const handleUserProfileClick = useCallback((username: string) => {
    setSelectedCreator(username);
    setSelectedNiche(null);
    setFocusedItemIndex(0);
  }, []);
  
  // Handle back navigation
  const handleBack = useCallback(() => {
    setSelectedCreator(null);
    setSelectedNiche(null);
    setFocusedItemIndex(0);
  }, []);
  
  // Handle next/previous in modal
  const handleNextMedia = useCallback(() => {
    if (currentMediaIndex < displayData.length - 1) {
      const nextIndex = currentMediaIndex + 1;
      setSelectedMedia(displayData[nextIndex]);
      setCurrentMediaIndex(nextIndex);
      setFocusedItemIndex(nextIndex);
    }
  }, [currentMediaIndex, displayData]);
  
  const handlePreviousMedia = useCallback(() => {
    if (currentMediaIndex > 0) {
      const prevIndex = currentMediaIndex - 1;
      setSelectedMedia(displayData[prevIndex]);
      setCurrentMediaIndex(prevIndex);
      setFocusedItemIndex(prevIndex);
    }
  }, [currentMediaIndex, displayData]);
  
  // Render content based on view mode
  const renderContent = () => {
    if (!isAuthenticated) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-white">Authenticating with RedGifs...</p>
          </div>
        </div>
      );
    }
    
    if (isLoading && displayData.length === 0) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }
    
    if (selectedCreator) {
      return (
        <UserProfileComponent
          username={selectedCreator}
          onClose={handleBack}
          onContentClick={handleMediaClick}
          aiFilter={aiFilter}
          gridColumns={gridColumns}
          quality={quality}
        />
      );
    }
    
    if (selectedNiche && nicheContentQuery.data) {
      return (
        <div className="flex flex-col h-full">
          <div className="bg-gray-800 p-4 flex items-center">
            <button 
              className="mr-4 bg-gray-700 rounded-full p-2 text-white hover:bg-gray-600 transition-colors"
              onClick={handleBack}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </button>
            <h2 className="text-xl font-bold text-white">
              {nicheContentQuery.data.pages[0]?.niches?.find(n => n.id === selectedNiche)?.name || selectedNiche}
            </h2>
          </div>
          
          <MasonryGrid
            items={displayData}
            quality={quality}
            onItemClick={handleMediaClick}
            onUserClick={handleUserProfileClick}
            activeIndex={currentMediaIndex}
            gridColumns={gridColumns}
            fetchNextPage={fetchNextPage}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
          />
        </div>
      );
    }
    
    if (activeTab === 'trends') {
      return (
        <div className="flex flex-col h-full">
          <div className="bg-gray-800 p-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Trending</h2>
            
            {/* Sort and Filter Options */}
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <label className="text-gray-300 text-sm">Sort:</label>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value as SortOption)}
                  className="bg-gray-700 text-white px-3 py-1 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="trending">Trending</option>
                  <option value="new">Latest</option>
                  <option value="top7">This Week</option>
                  <option value="top28">This Month</option>
                  <option value="top365">This Year</option>
                  <option value="random">Random</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <label className="text-gray-300 text-sm">Type:</label>
                <select
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value as ContentType)}
                  className="bg-gray-700 text-white px-3 py-1 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All</option>
                  <option value="gifs">Gifs</option>
                  <option value="videos">Videos</option>
                  <option value="images">Images</option>
                </select>
              </div>
            </div>
          </div>
          
          <MasonryGrid
            items={displayData}
            quality={quality}
            onItemClick={handleMediaClick}
            onUserClick={handleUserProfileClick}
            activeIndex={currentMediaIndex}
            gridColumns={gridColumns}
            fetchNextPage={fetchNextPage}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
          />
        </div>
      );
    }
    
    if (activeTab === 'creators') {
      return (
        <div className="flex flex-col h-full">
          <div className="bg-gray-800 p-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Creators</h2>
            
            {/* Sort Options */}
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <label className="text-gray-300 text-sm">Sort:</label>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value as SortOption)}
                  className="bg-gray-700 text-white px-3 py-1 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="trending">Trending</option>
                  <option value="new">Latest</option>
                  <option value="top7">This Week</option>
                  <option value="top28">This Month</option>
                  <option value="top365">This Year</option>
                  <option value="random">Random</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {creatorsQuery.data?.pages.flatMap(page => page.users || []).map(creator => (
                <CreatorCard
                  key={creator.username}
                  creator={creator}
                  onClick={() => handleCreatorClick(creator)}
                />
              ))}
            </div>
            
            {hasNextPage && (
              <div className="flex justify-center mt-4">
                <button 
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  onClick={() => fetchNextPage && fetchNextPage()}
                  disabled={isLoading}
                >
                  {isLoading ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </div>
        </div>
      );
    }
    
    if (activeTab === 'niches') {
      return (
        <div className="flex flex-col h-full">
          <div className="bg-gray-800 p-4">
            <h2 className="text-xl font-bold text-white">Niches</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {nichesQuery.data?.pages.flatMap(page => page.niches || []).map(niche => (
                <NicheCard
                  key={niche.id}
                  niche={niche}
                  onClick={() => handleNicheClick(niche)}
                />
              ))}
            </div>
            
            {hasNextPage && (
              <div className="flex justify-center mt-4">
                <button 
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  onClick={() => fetchNextPage && fetchNextPage()}
                  disabled={isLoading}
                >
                  {isLoading ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </div>
        </div>
      );
    }
    
    return null;
  };
  
  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 p-4 flex items-center justify-between shadow-lg">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          RedGifs Viewer
        </h1>
        
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <button 
              className="bg-gray-700 rounded-full p-2 text-white hover:bg-gray-600 transition-colors"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            
            <SearchComponent
              isOpen={isSearchOpen}
              onClose={() => setIsSearchOpen(false)}
              aiFilter={aiFilter}
              onUserClick={handleUserProfileClick}
            />
          </div>
          
          {/* Grid Settings */}
          <div className="relative">
            <button 
              className="bg-gray-700 rounded-full p-2 text-white hover:bg-gray-600 transition-colors"
              onClick={() => setIsGridSettingsOpen(!isGridSettingsOpen)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            
            <GridSettingsMenu
              isOpen={isGridSettingsOpen}
              onClose={() => setIsGridSettingsOpen(false)}
              gridColumns={gridColumns}
              setGridColumns={setGridColumns}
              aiFilter={aiFilter}
              setAiFilter={setAiFilter}
            />
          </div>
          
          {/* Quality Toggle */}
          <button 
            className="bg-gray-700 rounded-full px-3 py-1 text-white text-sm hover:bg-gray-600 transition-colors"
            onClick={() => setQuality(quality === 'hd' ? 'sd' : 'hd')}
          >
            {quality === 'hd' ? 'HD' : 'SD'}
          </button>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {renderContent()}
      </main>
      
      {/* Navigation Bar */}
      <nav className="bg-gray-800 p-2 flex items-center justify-around shadow-lg">
        <button 
          className={`p-2 rounded transition-colors ${activeTab === 'trends' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
          onClick={() => setActiveTab('trends')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </button>
        
        <button 
          className={`p-2 rounded transition-colors ${activeTab === 'creators' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
          onClick={() => setActiveTab('creators')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </button>
        
        <button 
          className={`p-2 rounded transition-colors ${activeTab === 'niches' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
          onClick={() => setActiveTab('niches')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        </button>
      </nav>
      
      {/* Media Modal */}
      <MediaModal
        item={selectedMedia}
        quality={quality}
        onClose={() => setSelectedMedia(null)}
        onNext={handleNextMedia}
        onPrevious={handlePreviousMedia}
        onUserClick={handleUserProfileClick}
      />
    </div>
  );
};

// Route Component
function RouteComponent() {
  return (
    <AuthProvider>
      <RedGifsApp />
    </AuthProvider>
  );
}

export const Route = createFileRoute('/redgifs')({
  component: RouteComponent,
});