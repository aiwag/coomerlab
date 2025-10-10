import { useState, useEffect, useCallback, useRef, useMemo, memo } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { 
  Search, RefreshCw, Clock, Zap, Users, MapPin, Calendar, X, ChevronLeft, ChevronRight, 
  Filter, AlertCircle, Wifi, WifiOff, Check, XCircle, Play, Pause, Maximize2, Heart,
  Settings, Volume2, VolumeX, Eye, Grid, List, TrendingUp, Star, Camera, Monitor,
  Download, Share2, Bell, BellOff, Shield, Activity, Gauge, Layers, ChevronDown
} from 'lucide-react'

// ==================== TYPE DEFINITIONS ====================

/**
 * Interface for streamer data from the API
 */
interface Streamer {
  display_age: number | null;
  gender: string;
  location: string;
  current_show: string;
  username: string;
  tags: string[];
  is_new: boolean;
  num_users: number;
  num_followers: number;
  start_dt_utc: string;
  country: string;
  has_password: boolean;
  private_price: number;
  spy_show_price: number;
  is_gaming: boolean;
  is_age_verified: boolean;
  label: string;
  is_following: boolean;
  source_name: string;
  start_timestamp: number;
  img: string;
  subject: string;
}

/**
 * Interface for API response
 */
interface ApiResponse {
  rooms: Streamer[];
  total_count: number;
  all_rooms_count: number;
  room_list_id: string;
  bls_payload: string;
  has_fingerprint: boolean;
}

/**
 * Interface for filter options
 */
interface Filters {
  gender: string;
  minFollowers: number;
  maxFollowers: number;
  minAge: number;
  maxAge: number;
  location: string;
  tags: string[];
  showNewOnly: boolean;
  showAgeVerified: boolean;
  showHDOnly: boolean;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

/**
 * Interface for thumbnail frame in animation
 */
interface ThumbnailFrame {
  url: string;
  timestamp: number;
}

/**
 * Interface for room animation state
 */
interface RoomAnimation {
  frames: ThumbnailFrame[];
  currentFrame: number;
  isPlaying: boolean;
  speed: number;
  lastUpdated: number;
}

/**
 * Interface for user preferences
 */
interface UserPreferences {
  theme: 'dark' | 'darker';
  animationQuality: 'low' | 'medium' | 'high';
  autoPlayAnimations: boolean;
  showNotifications: boolean;
  compactView: boolean;
  gridSize: 'small' | 'medium' | 'large';
  soundEnabled: boolean;
}

/**
 * Interface for performance metrics
 */
interface PerformanceMetrics {
  avgFetchTime: number;
  successRate: number;
  totalRequests: number;
  failedRequests: number;
  cacheHitRate: number;
}

// ==================== CONSTANTS ====================

const API_BASE_URL = 'https://chaturbate.com/api/ts/roomlist/room-list/';
const ROOMS_PER_PAGE = 20;
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;
const HOVER_THROTTLE_MS = 300;
const MIN_REFRESH_INTERVAL = 1000;
const MAX_CONCURRENT_REQUESTS = 8;
const ANIMATION_FRAME_COUNT = 10;
const ANIMATION_INTERVAL = 500; // ms between frames
const CACHE_EXPIRY = 30000; // 30 seconds
const NOTIFICATION_DURATION = 5000; // 5 seconds

// Browser-compatible headers to mimic Chrome
const CHROME_HEADERS = {
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache',
  'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
  'Sec-Ch-Ua-Mobile': '?0',
  'Sec-Ch-Ua-Platform': '"Windows"',
  'Sec-Fetch-Dest': 'empty',
  'Sec-Fetch-Mode': 'cors',
  'Sec-Fetch-Site': 'same-site',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
};

// ==================== UTILITY FUNCTIONS ====================

/**
 * Custom debounce implementation for browser compatibility
 */
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  options: { leading?: boolean; trailing?: boolean } = {}
): T & { cancel: () => void; flush: () => void; isPending: () => boolean } {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastCallTime = 0;
  let lastInvokeTime = 0;
  let lastArgs: Parameters<T> | null = null;
  let result: ReturnType<T>;
  let isPending = false;

  const invokeFunc = (time: number) => {
    const args = lastArgs!;
    lastArgs = null;
    lastInvokeTime = time;
    result = func(...args);
    isPending = false;
    return result;
  };

  const leadingEdge = (time: number) => {
    lastInvokeTime = time;
    timeoutId = setTimeout(timerExpired, wait);
    return options.leading ? invokeFunc(time) : result;
  };

  const remainingWait = (time: number) => {
    const timeSinceLastCall = time - lastCallTime;
    const timeSinceLastInvoke = time - lastInvokeTime;
    const timeWaiting = wait - timeSinceLastCall;
    return timeSinceLastInvoke > wait ? wait : timeWaiting;
  };

  const shouldInvoke = (time: number) => {
    const timeSinceLastCall = time - lastCallTime;
    const timeSinceLastInvoke = time - lastInvokeTime;
    return (lastCallTime === 0 || timeSinceLastCall >= wait || timeSinceLastCall < 0) &&
           (options.trailing || timeSinceLastInvoke > wait);
  };

  const timerExpired = () => {
    const time = Date.now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    timeoutId = setTimeout(timerExpired, remainingWait(time));
  };

  const trailingEdge = (time: number) => {
    timeoutId = null;
    if (options.trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = null;
    return result;
  };

  const cancel = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    lastInvokeTime = 0;
    lastArgs = null;
    timeoutId = null;
    isPending = false;
  };

  const flush = () => {
    return timeoutId === null ? result : trailingEdge(Date.now());
  };

  const debounced = function(this: any, ...args: Parameters<T>) {
    const time = Date.now();
    const isInvoking = shouldInvoke(time);
    
    lastArgs = args;
    lastCallTime = time;
    isPending = true;

    if (isInvoking) {
      if (timeoutId === null) {
        return leadingEdge(lastCallTime);
      }
      if (options.leading) {
        lastInvokeTime = lastCallTime;
        timeoutId = setTimeout(timerExpired, wait);
        return invokeFunc(lastCallTime);
      }
    }
    
    if (timeoutId === null) {
      timeoutId = setTimeout(timerExpired, wait);
    }
    
    return result;
  } as T & { cancel: () => void; flush: () => void; isPending: () => boolean };

  debounced.cancel = cancel;
  debounced.flush = flush;
  debounced.isPending = () => isPending;

  return debounced;
}

/**
 * Format large numbers with K, M suffixes
 */
function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

/**
 * Format time since a given date
 */
function formatTimeSinceRefresh(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

/**
 * Get gender color based on gender string
 */
function getGenderColor(gender: string): string {
  switch (gender) {
    case 'f': return 'bg-pink-500';
    case 'm': return 'bg-blue-500';
    case 'c': return 'bg-purple-500';
    case 's': return 'bg-green-500';
    default: return 'bg-gray-500';
  }
}

// ==================== CUSTOM HOOKS ====================

/**
 * Hook for managing browser-compatible fetch with retry logic
 */
function useRobustFetch() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    avgFetchTime: 0,
    successRate: 100,
    totalRequests: 0,
    failedRequests: 0,
    cacheHitRate: 0
  });

  const cacheRef = useRef<Map<string, { data: any; timestamp: number }>>(new Map());
  const activeRequestsRef = useRef<Map<string, Promise<any>>>(new Map());

  const robustFetch = useCallback(async (url: string, options: RequestInit = {}, retries = MAX_RETRIES): Promise<any> => {
    const startTime = Date.now();
    const cacheKey = `${url}_${JSON.stringify(options)}`;
    
    // Check cache first
    const cached = cacheRef.current.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_EXPIRY) {
      setMetrics(prev => ({
        ...prev,
        cacheHitRate: (prev.cacheHitRate * prev.totalRequests + 1) / (prev.totalRequests + 1)
      }));
      return cached.data;
    }

    // Check if request is already active
    if (activeRequestsRef.current.has(cacheKey)) {
      // Return the existing promise
      return activeRequestsRef.current.get(cacheKey);
    }

    // Create new request promise
    const requestPromise = (async () => {
      const defaultOptions = {
        headers: CHROME_HEADERS,
        mode: 'cors' as RequestMode,
        credentials: 'omit' as RequestCredentials,
        ...options
      };

      try {
        const response = await fetch(url, defaultOptions);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Clone the response before reading to avoid "body stream already read" error
        const data = await response.clone().json();
        
        // Cache the response data
        cacheRef.current.set(cacheKey, { data, timestamp: Date.now() });
        
        // Update metrics
        const fetchTime = Date.now() - startTime;
        setMetrics(prev => {
          const newTotal = prev.totalRequests + 1;
          const newAvgTime = (prev.avgFetchTime * prev.totalRequests + fetchTime) / newTotal;
          return {
            ...prev,
            avgFetchTime: newAvgTime,
            totalRequests: newTotal,
            successRate: ((prev.totalRequests - prev.failedRequests) / newTotal) * 100
          };
        });
        
        return data;
      } catch (error: any) {
        setMetrics(prev => ({
          ...prev,
          failedRequests: prev.failedRequests + 1,
          successRate: ((prev.totalRequests - prev.failedRequests) / Math.max(1, prev.totalRequests)) * 100
        }));
        
        if (retries > 0) {
          console.warn(`Fetch failed, retrying... (${MAX_RETRIES - retries + 1}/${MAX_RETRIES})`, error);
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
          return robustFetch(url, options, retries - 1);
        }
        throw error;
      } finally {
        // Remove from active requests
        activeRequestsRef.current.delete(cacheKey);
      }
    })();

    // Add to active requests
    activeRequestsRef.current.set(cacheKey, requestPromise);

    return requestPromise;
  }, []);

  return { robustFetch, metrics };
}

/**
 * Hook for managing room animations
 */
function useRoomAnimation() {
  const [animations, setAnimations] = useState<Map<string, RoomAnimation>>(new Map());
  const animationIntervalsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const startAnimation = useCallback((username: string, frames: ThumbnailFrame[], speed = 1) => {
    // Clear existing interval if any
    if (animationIntervalsRef.current.has(username)) {
      clearInterval(animationIntervalsRef.current.get(username)!);
    }

    // Create new animation state
    const newAnimation: RoomAnimation = {
      frames,
      currentFrame: 0,
      isPlaying: true,
      speed,
      lastUpdated: Date.now()
    };

    setAnimations(prev => new Map(prev).set(username, newAnimation));

    // Set up interval for frame updates
    const interval = setInterval(() => {
      setAnimations(prev => {
        const animation = prev.get(username);
        if (!animation || !animation.isPlaying) return prev;

        const nextFrame = (animation.currentFrame + 1) % animation.frames.length;
        const updatedAnimation = {
          ...animation,
          currentFrame: nextFrame,
          lastUpdated: Date.now()
        };

        return new Map(prev).set(username, updatedAnimation);
      });
    }, ANIMATION_INTERVAL / speed);

    animationIntervalsRef.current.set(username, interval);
  }, []);

  const stopAnimation = useCallback((username: string) => {
    if (animationIntervalsRef.current.has(username)) {
      clearInterval(animationIntervalsRef.current.get(username)!);
      animationIntervalsRef.current.delete(username);
    }

    setAnimations(prev => {
      const animation = prev.get(username);
      if (!animation) return prev;
      
      const updatedAnimation = { ...animation, isPlaying: false };
      return new Map(prev).set(username, updatedAnimation);
    });
  }, []);

  const toggleAnimation = useCallback((username: string) => {
    const animation = animations.get(username);
    if (animation?.isPlaying) {
      stopAnimation(username);
    } else if (animation) {
      startAnimation(username, animation.frames, animation.speed);
    }
  }, [animations, startAnimation, stopAnimation]);

  const setAnimationSpeed = useCallback((username: string, speed: number) => {
    const animation = animations.get(username);
    if (!animation) return;

    // Restart animation with new speed
    stopAnimation(username);
    startAnimation(username, animation.frames, speed);
  }, [animations, stopAnimation, startAnimation]);

  const addFrame = useCallback((username: string, frame: ThumbnailFrame) => {
    setAnimations(prev => {
      const animation = prev.get(username);
      if (!animation) return prev;

      // Add new frame to the beginning and remove oldest if exceeding max
      const newFrames = [frame, ...animation.frames].slice(0, ANIMATION_FRAME_COUNT);
      const updatedAnimation = {
        ...animation,
        frames: newFrames
      };

      return new Map(prev).set(username, updatedAnimation);
    });
  }, []);

  const getCurrentFrame = useCallback((username: string): ThumbnailFrame | null => {
    const animation = animations.get(username);
    if (!animation || animation.frames.length === 0) return null;
    return animation.frames[animation.currentFrame];
  }, [animations]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      animationIntervalsRef.current.forEach(interval => clearInterval(interval));
    };
  }, []);

  return {
    animations,
    startAnimation,
    stopAnimation,
    toggleAnimation,
    setAnimationSpeed,
    addFrame,
    getCurrentFrame
  };
}

/**
 * Hook for managing parallel thumbnail fetching with proper room-thumb mapping
 */
function useParallelThumbnailFetch() {
  const [fetchQueue, setFetchQueue] = useState<string[]>([]);
  const [activeRequests, setActiveRequests] = useState<Set<string>>(new Set());
  const [thumbnails, setThumbnails] = useState<Map<string, string>>(new Map());
  const { robustFetch } = useRobustFetch();
  const { addFrame } = useRoomAnimation();

  // Process queue whenever it changes
  useEffect(() => {
    if (fetchQueue.length === 0 || activeRequests.size >= MAX_CONCURRENT_REQUESTS) return;

    const nextBatch = fetchQueue.slice(0, MAX_CONCURRENT_REQUESTS - activeRequests.size);
    const newActiveRequests = new Set(activeRequests);
    
    nextBatch.forEach(username => {
      newActiveRequests.add(username);
      
      // Fetch thumbnail for this username
      robustFetch(`${API_BASE_URL}?limit=1&offset=0&username=${username}`)
        .then((data: ApiResponse) => {
          // Ensure we have valid data with rooms
          if (data && data.rooms && data.rooms.length > 0) {
            const room = data.rooms[0];
            
            // Verify the username matches to prevent mixing thumbnails
            if (room.username === username) {
              const thumbnailUrl = room.img;
              
              // Update thumbnail with strict username mapping
              setThumbnails(prev => {
                const newThumbnails = new Map(prev);
                newThumbnails.set(username, thumbnailUrl);
                return newThumbnails;
              });
              
              // Add frame to animation
              addFrame(username, {
                url: thumbnailUrl,
                timestamp: Date.now()
              });
            } else {
              console.warn(`Username mismatch: requested ${username}, got ${room.username}`);
            }
          }
        })
        .catch(error => {
          console.error(`Error fetching thumbnail for ${username}:`, error);
        })
        .finally(() => {
          // Remove from active requests
          setActiveRequests(prev => {
            const newSet = new Set(prev);
            newSet.delete(username);
            return newSet;
          });
        });
    });
    
    setActiveRequests(newActiveRequests);
    
    // Remove processed items from queue
    setFetchQueue(prev => prev.slice(nextBatch.length));
  }, [fetchQueue, activeRequests, robustFetch, addFrame]);

  const addToQueue = useCallback((usernames: string[]) => {
    setFetchQueue(prev => {
      // Filter out already active or queued items
      const newItems = usernames.filter(
        username => !activeRequests.has(username) && !prev.includes(username)
      );
      return [...prev, ...newItems];
    });
  }, [activeRequests]);

  const getThumbnail = useCallback((username: string, defaultThumb: string): string => {
    // Ensure we only return the thumbnail for the exact username
    return thumbnails.get(username) || defaultThumb;
  }, [thumbnails]);

  return { addToQueue, getThumbnail, activeRequests };
}

/**
 * Hook for managing notifications
 */
function useNotifications() {
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'info' | 'success' | 'warning' | 'error';
    title: string;
    message: string;
    timestamp: number;
  }>>([]);

  const addNotification = useCallback((
    type: 'info' | 'success' | 'warning' | 'error',
    title: string,
    message: string
  ) => {
    const id = Date.now().toString();
    const notification = {
      id,
      type,
      title,
      message,
      timestamp: Date.now()
    };

    setNotifications(prev => [...prev, notification]);

    // Auto-remove after duration
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, NOTIFICATION_DURATION);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return { notifications, addNotification, removeNotification };
}

/**
 * Hook for managing user preferences
 */
function useUserPreferences() {
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: 'dark',
    animationQuality: 'medium',
    autoPlayAnimations: true,
    showNotifications: true,
    compactView: false,
    gridSize: 'medium',
    soundEnabled: true
  });

  const updatePreference = useCallback(<K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  }, []);

  return { preferences, updatePreference };
}

// ==================== MAIN COMPONENT ====================

export const Route = createFileRoute('/chaturbate')({
  component: RouteComponent,
})

function RouteComponent() {
  // State management
  const [streamers, setStreamers] = useState<Streamer[]>([]);
  const [filteredStreamers, setFilteredStreamers] = useState<Streamer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshInterval, setRefreshInterval] = useState(10);
  const [isAnimatedMode, setIsAnimatedMode] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [lastThumbRefresh, setLastThumbRefresh] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [isThumbsLoading, setIsThumbsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'limited'>('connected');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    gender: 'all',
    minFollowers: 0,
    maxFollowers: 10000000,
    minAge: 18,
    maxAge: 99,
    location: '',
    tags: [],
    showNewOnly: false,
    showAgeVerified: false,
    showHDOnly: false,
    sortBy: 'num_users',
    sortOrder: 'desc'
  });
  const [hoveredRoom, setHoveredRoom] = useState<string | null>(null);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [duplicateUsernames, setDuplicateUsernames] = useState<Set<string>>(new Set());
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showSpotlight, setShowSpotlight] = useState(false);
  const [spotlightStreamer, setSpotlightStreamer] = useState<Streamer | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('num_users');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Custom hooks
  const { robustFetch, metrics } = useRobustFetch();
  const { animations, startAnimation, stopAnimation, toggleAnimation, setAnimationSpeed, getCurrentFrame } = useRoomAnimation();
  const { addToQueue, getThumbnail, activeRequests } = useParallelThumbnailFetch();
  const { notifications, addNotification, removeNotification } = useNotifications();
  const { preferences, updatePreference } = useUserPreferences();

  // Refs
  const thumbRefreshInterval = useRef<NodeJS.Timeout | null>(null);
  const roomListRefreshInterval = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Fetch streamers data with proper error handling
  const fetchStreamers = useCallback(async (isThumbRefresh = false, page = currentPage) => {
    // Cancel any ongoing requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();
    
    try {
      if (!isThumbRefresh) {
        setIsLoading(true);
        setConnectionStatus('connected');
      } else {
        setIsThumbsLoading(true);
      }
      
      const offset = (page - 1) * ROOMS_PER_PAGE;
      const data = await robustFetch(
        `${API_BASE_URL}?limit=${ROOMS_PER_PAGE}&offset=${offset}`,
        { signal: abortControllerRef.current.signal }
      );
      
      if (!isThumbRefresh) {
        // Check for duplicates
        const usernames = new Set<string>();
        const duplicates = new Set<string>();
        
        data.rooms.forEach(room => {
          if (usernames.has(room.username)) {
            duplicates.add(room.username);
          } else {
            usernames.add(room.username);
          }
        });
        
        setDuplicateUsernames(duplicates);
        setStreamers(data.rooms || []);
        setLastRefresh(new Date());
        setTotalPages(Math.ceil(data.total_count / ROOMS_PER_PAGE));
        setError(null);
        
        // Add all usernames to thumbnail queue
        addToQueue(data.rooms.map(room => room.username));
      } else {
        // Only update thumbnails for existing rooms
        const newThumbs: { [key: string]: string } = {};
        
        data.rooms.forEach(room => {
          // Ensure strict username-thumb mapping
          newThumbs[room.username] = room.img;
        });
        
        setLastThumbRefresh(new Date());
        
        // Add all usernames to thumbnail queue
        addToQueue(data.rooms.map(room => room.username));
      }
    } catch (err: any) {
      console.error('Error fetching streamers:', err);
      
      // Handle different error types
      if (err.name === 'AbortError') {
        console.log('Request was aborted');
        return;
      }
      
      if (err.message.includes('502') || err.message.includes('503') || err.message.includes('429')) {
        setConnectionStatus('limited');
        setError('Server is experiencing issues. Retrying with reduced frequency...');
        addNotification('warning', 'Connection Limited', 'Server is experiencing issues. Retrying with reduced frequency.');
      } else if (err.message.includes('CORS')) {
        setConnectionStatus('disconnected');
        setError('CORS error: The API may not be accessible from this domain. Try using a CORS proxy or VPN.');
        addNotification('error', 'Connection Error', 'CORS error: The API may not be accessible from this domain.');
      } else {
        setConnectionStatus('disconnected');
        setError(`Failed to load streamers: ${err.message}`);
        addNotification('error', 'Fetch Error', `Failed to load streamers: ${err.message}`);
      }
      
      if (!isThumbRefresh) {
        // If it's not a thumb refresh and we have data, keep the existing data
        if (streamers.length === 0) {
          // If we have no data at all, try to load cached data or show a proper error state
          setError('Unable to load streamers. Please check your connection and try again.');
        }
      }
    } finally {
      if (!isThumbRefresh) {
        setIsLoading(false);
      } else {
        setIsThumbsLoading(false);
      }
    }
  }, [currentPage, streamers.length, robustFetch, addToQueue, addNotification]);

  // Fetch individual room thumb on hover with debouncing
  const fetchRoomThumb = useCallback(
    debounce(async (username: string) => {
      // Add to queue for parallel processing
      addToQueue([username]);
    }, HOVER_THROTTLE_MS),
    [addToQueue]
  );

  // Extract all unique tags from streamers
  useEffect(() => {
    if (streamers.length > 0) {
      const tags = new Set<string>();
      streamers.forEach(streamer => {
        streamer.tags.forEach(tag => tags.add(tag));
      });
      setAllTags(Array.from(tags));
    }
  }, [streamers]);

  // Initial fetch
  useEffect(() => {
    fetchStreamers();
    
    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (thumbRefreshInterval.current) clearInterval(thumbRefreshInterval.current);
      if (roomListRefreshInterval.current) clearInterval(roomListRefreshInterval.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  // Set up refresh intervals with proper cleanup
  useEffect(() => {
    // Clear existing intervals
    if (thumbRefreshInterval.current) clearInterval(thumbRefreshInterval.current);
    if (roomListRefreshInterval.current) clearInterval(roomListRefreshInterval.current);

    if (isAnimatedMode) {
      // Refresh thumbs more frequently in animated mode
      const thumbInterval = Math.max(500, MIN_REFRESH_INTERVAL);
      thumbRefreshInterval.current = setInterval(() => {
        fetchStreamers(true);
      }, thumbInterval);
      
      // Refresh room list every 5 seconds
      roomListRefreshInterval.current = setInterval(() => {
        fetchStreamers(false);
      }, 5000);
    } else {
      // Normal refresh mode with minimum interval check
      const interval = Math.max(refreshInterval * 1000, MIN_REFRESH_INTERVAL);
      roomListRefreshInterval.current = setInterval(() => {
        fetchStreamers(false);
      }, interval);
    }

    return () => {
      if (thumbRefreshInterval.current) clearInterval(thumbRefreshInterval.current);
      if (roomListRefreshInterval.current) clearInterval(roomListRefreshInterval.current);
    };
  }, [isAnimatedMode, refreshInterval, fetchStreamers]);

  // Filter and sort streamers based on search term and filters
  useEffect(() => {
    let filtered = [...streamers];
    
    // Apply search term
    if (searchTerm.trim() !== '') {
      const lowercasedSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(streamer => 
        streamer.username.toLowerCase().includes(lowercasedSearch) ||
        streamer.tags.some(tag => tag.toLowerCase().includes(lowercasedSearch)) ||
        streamer.subject.toLowerCase().includes(lowercasedSearch)
      );
    }
    
    // Apply filters
    if (filters.gender !== 'all') {
      filtered = filtered.filter(streamer => streamer.gender === filters.gender);
    }
    
    if (filters.minFollowers > 0) {
      filtered = filtered.filter(streamer => streamer.num_followers >= filters.minFollowers);
    }
    
    if (filters.maxFollowers < 10000000) {
      filtered = filtered.filter(streamer => streamer.num_followers <= filters.maxFollowers);
    }
    
    if (filters.location.trim() !== '') {
      const lowercasedLocation = filters.location.toLowerCase();
      filtered = filtered.filter(streamer => 
        streamer.location.toLowerCase().includes(lowercasedLocation) ||
        streamer.country.toLowerCase().includes(lowercasedLocation)
      );
    }
    
    if (filters.tags.length > 0) {
      filtered = filtered.filter(streamer => 
        filters.tags.some(tag => streamer.tags.includes(tag))
      );
    }
    
    if (filters.showNewOnly) {
      filtered = filtered.filter(streamer => streamer.is_new);
    }
    
    if (filters.showAgeVerified) {
      filtered = filtered.filter(streamer => streamer.is_age_verified);
    }
    
    if (filters.showHDOnly) {
      filtered = filtered.filter(streamer => 
        streamer.subject.toLowerCase().includes('hd') || 
        streamer.tags.some(tag => tag.toLowerCase().includes('hd'))
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof Streamer];
      let bValue: any = b[sortBy as keyof Streamer];
      
      // Handle string comparison
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = (bValue as string).toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    setFilteredStreamers(filtered);
  }, [streamers, searchTerm, filters, sortBy, sortOrder]);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchStreamers(false, page);
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchStreamers();
  };

  // Handle interval change
  const handleIntervalChange = (interval: number) => {
    setRefreshInterval(interval);
    setIsAnimatedMode(false);
  };

  // Toggle animated mode
  const toggleAnimatedMode = () => {
    setIsAnimatedMode(!isAnimatedMode);
    if (!isAnimatedMode) {
      addNotification('info', 'Live Mode', 'Live mode activated. Thumbnails will refresh more frequently.');
    }
  };

  // Handle filter change
  const handleFilterChange = (key: keyof Filters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Toggle tag filter
  const toggleTagFilter = (tag: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      gender: 'all',
      minFollowers: 0,
      maxFollowers: 10000000,
      minAge: 18,
      maxAge: 99,
      location: '',
      tags: [],
      showNewOnly: false,
      showAgeVerified: false,
      showHDOnly: false,
      sortBy: 'num_users',
      sortOrder: 'desc'
    });
  };

  // Handle room hover
  const handleRoomHover = (username: string) => {
    setHoveredRoom(username);
    fetchRoomThumb(username);
    
    // Start animation if auto-play is enabled
    if (preferences.autoPlayAnimations) {
      const animation = animations.get(username);
      if (animation && animation.frames.length > 1 && !animation.isPlaying) {
        startAnimation(username, animation.frames, 1);
      }
    }
  };

  // Handle room leave
  const handleRoomLeave = () => {
    setHoveredRoom(null);
  };

  // Toggle favorite
  const toggleFavorite = (username: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(username)) {
        newFavorites.delete(username);
        addNotification('info', 'Favorite Removed', `${username} removed from favorites.`);
      } else {
        newFavorites.add(username);
        addNotification('success', 'Favorite Added', `${username} added to favorites.`);
      }
      return newFavorites;
    });
  };

  // Open spotlight
  const openSpotlight = (streamer: Streamer) => {
    setSpotlightStreamer(streamer);
    setShowSpotlight(true);
    
    // Start animation for this room
    const animation = animations.get(streamer.username);
    if (animation && animation.frames.length > 0) {
      startAnimation(streamer.username, animation.frames, 1);
    }
  };

  // Close spotlight
  const closeSpotlight = () => {
    setShowSpotlight(false);
    
    // Stop animation for this room
    if (spotlightStreamer) {
      stopAnimation(spotlightStreamer.username);
    }
  };

  // Get grid size class based on preference
  const getGridSizeClass = () => {
    switch (preferences.gridSize) {
      case 'small': return 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7';
      case 'large': return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
      default: return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6';
    }
  };

  return (
    <div className={`flex flex-col h-screen ${preferences.theme === 'darker' ? 'bg-gray-950' : 'bg-gray-900'} text-white overflow-hidden`}>
      {/* Header */}
      <header className="bg-gray-800 bg-opacity-90 backdrop-blur-md border-b border-gray-700 p-4 z-10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            Live Streamers
          </h1>
          <div className="flex items-center gap-4">
            {/* Performance Metrics */}
            <div className="hidden md:flex items-center gap-2 text-xs text-gray-400">
              <div className="flex items-center gap-1">
                <Activity size={14} />
                <span>{metrics.avgFetchTime.toFixed(0)}ms</span>
              </div>
              <div className="flex items-center gap-1">
                <Gauge size={14} />
                <span>{metrics.successRate.toFixed(0)}%</span>
              </div>
            </div>
            
            {/* Connection Status */}
            <div className="flex items-center gap-2">
              {connectionStatus === 'connected' && <Wifi size={18} className="text-green-500" />}
              {connectionStatus === 'limited' && <Wifi size={18} className="text-yellow-500" />}
              {connectionStatus === 'disconnected' && <WifiOff size={18} className="text-red-500" />}
              <span className="text-xs text-gray-400">
                {connectionStatus === 'connected' && 'Connected'}
                {connectionStatus === 'limited' && 'Rate Limited'}
                {connectionStatus === 'disconnected' && 'Disconnected'}
              </span>
            </div>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search streamers..."
                className="w-64 bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-gray-700 bg-opacity-50 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                <Grid size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                <List size={16} />
              </button>
            </div>
            
            {/* Refresh Controls */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-gray-700 bg-opacity-50 rounded-lg p-1">
                <button
                  onClick={() => handleIntervalChange(3)}
                  className={`px-2 py-1 rounded-md text-xs transition-all ${refreshInterval === 3 && !isAnimatedMode ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  3s
                </button>
                <button
                  onClick={() => handleIntervalChange(10)}
                  className={`px-2 py-1 rounded-md text-xs transition-all ${refreshInterval === 10 && !isAnimatedMode ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  10s
                </button>
                <button
                  onClick={() => handleIntervalChange(30)}
                  className={`px-2 py-1 rounded-md text-xs transition-all ${refreshInterval === 30 && !isAnimatedMode ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  30s
                </button>
                <button
                  onClick={() => handleIntervalChange(60)}
                  className={`px-2 py-1 rounded-md text-xs transition-all ${refreshInterval === 60 && !isAnimatedMode ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  60s
                </button>
                <button
                  onClick={toggleAnimatedMode}
                  className={`px-2 py-1 rounded-md text-xs transition-all flex items-center gap-1 ${isAnimatedMode ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  <Zap size={14} />
                  <span>Live</span>
                </button>
              </div>
              <button
                onClick={handleRefresh}
                className="p-2 bg-gray-700 bg-opacity-50 rounded-lg hover:bg-opacity-70 transition-all"
                disabled={isLoading}
              >
                <RefreshCw className={isLoading ? 'animate-spin' : ''} size={18} />
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-lg transition-all ${showFilters ? 'bg-purple-600' : 'bg-gray-700 bg-opacity-50 hover:bg-opacity-70'}`}
              >
                <Filter size={18} />
              </button>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2 rounded-lg transition-all ${showSettings ? 'bg-purple-600' : 'bg-gray-700 bg-opacity-50 hover:bg-opacity-70'}`}
              >
                <Settings size={18} />
              </button>
            </div>
          </div>
        </div>
        
        {/* Status Bar */}
        <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
          <span>Showing {filteredStreamers.length} of {streamers.length} streamers</span>
          <div className="flex items-center gap-4">
            {isAnimatedMode && (
              <span className="flex items-center gap-1">
                <Zap size={14} />
                Thumbs: {formatTimeSinceRefresh(lastThumbRefresh)}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock size={14} />
              Data: {formatTimeSinceRefresh(lastRefresh)}
            </span>
            <span className="flex items-center gap-1">
              <Layers size={14} />
              Active: {activeRequests.size}
            </span>
          </div>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="mt-2 p-2 bg-red-900 bg-opacity-30 border border-red-800 rounded-lg flex items-center gap-2">
            <AlertCircle size={16} className="text-red-400" />
            <span className="text-red-200 text-sm">{error}</span>
          </div>
        )}
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Filters Sidebar */}
        <aside className={`${showFilters ? 'w-64' : 'w-0'} transition-all duration-300 bg-gray-800 bg-opacity-90 backdrop-blur-md border-r border-gray-700 overflow-y-auto`}>
          {showFilters && (
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Filters</h2>
                <button onClick={clearFilters} className="text-xs text-purple-400 hover:text-purple-300">
                  Clear All
                </button>
              </div>
              
              {/* Gender Filter */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Gender</label>
                <div className="grid grid-cols-2 gap-2">
                  {['all', 'f', 'm', 'c', 's'].map(gender => (
                    <button
                      key={gender}
                      onClick={() => handleFilterChange('gender', gender)}
                      className={`px-3 py-2 rounded-lg text-xs transition-all ${
                        filters.gender === gender
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-700 bg-opacity-50 text-gray-300 hover:bg-opacity-70'
                      }`}
                    >
                      {gender === 'all' ? 'All' : 
                       gender === 'f' ? 'Female' :
                       gender === 'm' ? 'Male' :
                       gender === 'c' ? 'Couple' : 'Trans'}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Special Filters */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Special Filters</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.showNewOnly}
                      onChange={(e) => handleFilterChange('showNewOnly', e.target.checked)}
                      className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm">New Streamers Only</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.showAgeVerified}
                      onChange={(e) => handleFilterChange('showAgeVerified', e.target.checked)}
                      className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm">Age Verified Only</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.showHDOnly}
                      onChange={(e) => handleFilterChange('showHDOnly', e.target.checked)}
                      className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm">HD Quality Only</span>
                  </label>
                </div>
              </div>
              
              {/* Sort Options */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Sort By</label>
                <div className="space-y-2">
                  <select
                    className="w-full bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="num_users">Viewers</option>
                    <option value="num_followers">Followers</option>
                    <option value="username">Username</option>
                    <option value="country">Country</option>
                  </select>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSortOrder('asc')}
                      className={`flex-1 px-2 py-1 rounded text-xs transition-all ${
                        sortOrder === 'asc' ? 'bg-purple-600 text-white' : 'bg-gray-700 bg-opacity-50 text-gray-300 hover:bg-opacity-70'
                      }`}
                    >
                      Asc
                    </button>
                    <button
                      onClick={() => setSortOrder('desc')}
                      className={`flex-1 px-2 py-1 rounded text-xs transition-all ${
                        sortOrder === 'desc' ? 'bg-purple-600 text-white' : 'bg-gray-700 bg-opacity-50 text-gray-300 hover:bg-opacity-70'
                      }`}
                    >
                      Desc
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Followers Filter */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Followers</label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      className="w-full bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Min followers"
                      value={filters.minFollowers}
                      onChange={(e) => handleFilterChange('minFollowers', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      className="w-full bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Max followers"
                      value={filters.maxFollowers}
                      onChange={(e) => handleFilterChange('maxFollowers', parseInt(e.target.value) || 10000000)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleFilterChange('minFollowers', 1000)}
                      className="flex-1 px-2 py-1 bg-gray-700 bg-opacity-50 rounded text-xs hover:bg-opacity-70"
                    >
                      1K+
                    </button>
                    <button
                      onClick={() => handleFilterChange('minFollowers', 10000)}
                      className="flex-1 px-2 py-1 bg-gray-700 bg-opacity-50 rounded text-xs hover:bg-opacity-70"
                    >
                      10K+
                    </button>
                    <button
                      onClick={() => handleFilterChange('minFollowers', 100000)}
                      className="flex-1 px-2 py-1 bg-gray-700 bg-opacity-50 rounded text-xs hover:bg-opacity-70"
                    >
                      100K+
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Location Filter */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Location</label>
                <input
                  type="text"
                  className="w-full bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter location..."
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                />
              </div>
              
              {/* Tags Filter */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Popular Tags</label>
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                  {allTags.slice(0, 30).map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleTagFilter(tag)}
                      className={`px-2 py-1 rounded-full text-xs transition-all ${
                        filters.tags.includes(tag)
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-700 bg-opacity-50 text-gray-300 hover:bg-opacity-70'
                      }`}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
                {filters.tags.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-400 mb-1">Selected Tags:</p>
                    <div className="flex flex-wrap gap-1">
                      {filters.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-purple-600 bg-opacity-30 rounded text-xs flex items-center gap-1">
                          #{tag}
                          <button
                            onClick={() => toggleTagFilter(tag)}
                            className="hover:text-red-400"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </aside>

        {/* Settings Sidebar */}
        <aside className={`${showSettings ? 'w-64' : 'w-0'} transition-all duration-300 bg-gray-800 bg-opacity-90 backdrop-blur-md border-r border-gray-700 overflow-y-auto`}>
          {showSettings && (
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Settings</h2>
                <button onClick={() => setShowSettings(false)} className="text-xs text-purple-400 hover:text-purple-300">
                  <X size={16} />
                </button>
              </div>
              
              {/* Theme */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Theme</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => updatePreference('theme', 'dark')}
                    className={`px-3 py-2 rounded-lg text-xs transition-all ${
                      preferences.theme === 'dark'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-700 bg-opacity-50 text-gray-300 hover:bg-opacity-70'
                    }`}
                  >
                    Dark
                  </button>
                  <button
                    onClick={() => updatePreference('theme', 'darker')}
                    className={`px-3 py-2 rounded-lg text-xs transition-all ${
                      preferences.theme === 'darker'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-700 bg-opacity-50 text-gray-300 hover:bg-opacity-70'
                    }`}
                  >
                    Darker
                  </button>
                </div>
              </div>
              
              {/* Animation Quality */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Animation Quality</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['low', 'medium', 'high'] as const).map(quality => (
                    <button
                      key={quality}
                      onClick={() => updatePreference('animationQuality', quality)}
                      className={`px-3 py-2 rounded-lg text-xs transition-all capitalize ${
                        preferences.animationQuality === quality
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-700 bg-opacity-50 text-gray-300 hover:bg-opacity-70'
                      }`}
                    >
                      {quality}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Grid Size */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Grid Size</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['small', 'medium', 'large'] as const).map(size => (
                    <button
                      key={size}
                      onClick={() => updatePreference('gridSize', size)}
                      className={`px-3 py-2 rounded-lg text-xs transition-all capitalize ${
                        preferences.gridSize === size
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-700 bg-opacity-50 text-gray-300 hover:bg-opacity-70'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Toggle Settings */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.autoPlayAnimations}
                    onChange={(e) => updatePreference('autoPlayAnimations', e.target.checked)}
                    className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm">Auto-play Animations</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.showNotifications}
                    onChange={(e) => updatePreference('showNotifications', e.target.checked)}
                    className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm">Show Notifications</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.compactView}
                    onChange={(e) => updatePreference('compactView', e.target.checked)}
                    className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm">Compact View</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.soundEnabled}
                    onChange={(e) => updatePreference('soundEnabled', e.target.checked)}
                    className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm">Sound Effects</span>
                </label>
              </div>
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {isLoading && streamers.length === 0 ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : filteredStreamers.length === 0 ? (
            <div className="flex justify-center items-center h-full">
              <div className="text-center">
                <p className="text-gray-400 text-lg mb-4">
                  {streamers.length === 0 ? 'No streamers available.' : 'No streamers found matching your criteria.'}
                </p>
                {streamers.length > 0 && (
                  <button onClick={clearFilters} className="px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition-all">
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="p-4">
              {viewMode === 'grid' ? (
                <div className={`grid ${getGridSizeClass()} gap-4`}>
                  {filteredStreamers.map((streamer) => (
                    <StreamerCard
                      key={streamer.username}
                      streamer={streamer}
                      onHover={() => handleRoomHover(streamer.username)}
                      onLeave={handleRoomLeave}
                      isHovered={hoveredRoom === streamer.username}
                      thumbUrl={getThumbnail(streamer.username, streamer.img)}
                      isDuplicate={duplicateUsernames.has(streamer.username)}
                      isLoading={activeRequests.has(streamer.username)}
                      isFavorite={favorites.has(streamer.username)}
                      onFavoriteToggle={() => toggleFavorite(streamer.username)}
                      onSpotlight={() => openSpotlight(streamer)}
                      animation={animations.get(streamer.username)}
                      onToggleAnimation={() => toggleAnimation(streamer.username)}
                      onSetSpeed={(speed) => setAnimationSpeed(streamer.username, speed)}
                      compactView={preferences.compactView}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredStreamers.map((streamer) => (
                    <StreamerListItem
                      key={streamer.username}
                      streamer={streamer}
                      onHover={() => handleRoomHover(streamer.username)}
                      onLeave={handleRoomLeave}
                      isHovered={hoveredRoom === streamer.username}
                      thumbUrl={getThumbnail(streamer.username, streamer.img)}
                      isDuplicate={duplicateUsernames.has(streamer.username)}
                      isLoading={activeRequests.has(streamer.username)}
                      isFavorite={favorites.has(streamer.username)}
                      onFavoriteToggle={() => toggleFavorite(streamer.username)}
                      onSpotlight={() => openSpotlight(streamer)}
                      animation={animations.get(streamer.username)}
                      onToggleAnimation={() => toggleAnimation(streamer.username)}
                      onSetSpeed={(speed) => setAnimationSpeed(streamer.username, speed)}
                    />
                  ))}
                </div>
              )}
              
              {/* Pagination */}
              <div className="flex justify-center items-center mt-6 gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 bg-gray-700 bg-opacity-50 rounded-lg hover:bg-opacity-70 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={18} />
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    const isActive = pageNum === currentPage;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all ${
                          isActive
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-700 bg-opacity-50 text-gray-300 hover:bg-opacity-70'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  {totalPages > 5 && (
                    <>
                      <span className="text-gray-400">...</span>
                      <button
                        onClick={() => handlePageChange(totalPages)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all ${
                          currentPage === totalPages
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-700 bg-opacity-50 text-gray-300 hover:bg-opacity-70'
                        }`}
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                </div>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 bg-gray-700 bg-opacity-50 rounded-lg hover:bg-opacity-70 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Notifications */}
      <div className="fixed bottom-4 right-4 space-y-2 z-50">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className={`p-3 rounded-lg shadow-lg max-w-sm ${
              notification.type === 'error' ? 'bg-red-900 bg-opacity-80' :
              notification.type === 'warning' ? 'bg-yellow-900 bg-opacity-80' :
              notification.type === 'success' ? 'bg-green-900 bg-opacity-80' :
              'bg-blue-900 bg-opacity-80'
            } text-white`}
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold text-sm">{notification.title}</h4>
                <p className="text-xs mt-1">{notification.message}</p>
              </div>
              <button
                onClick={() => removeNotification(notification.id)}
                className="ml-2 text-white hover:text-gray-300"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Spotlight Modal */}
      {showSpotlight && spotlightStreamer && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-full overflow-hidden">
            <div className="relative">
              {/* Close Button */}
              <button
                onClick={closeSpotlight}
                className="absolute top-4 right-4 z-10 p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70"
              >
                <X size={20} />
              </button>
              
              {/* Streamer Image with Animation */}
              <div className="relative aspect-video">
                <img
                  src={getCurrentFrame(spotlightStreamer.username)?.url || spotlightStreamer.img}
                  alt={spotlightStreamer.username}
                  className="w-full h-full object-contain"
                />
                
                {/* Animation Controls */}
                <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black bg-opacity-50 rounded-lg p-2">
                  <button
                    onClick={() => toggleAnimation(spotlightStreamer.username)}
                    className="p-1 bg-white bg-opacity-20 rounded hover:bg-opacity-30"
                  >
                    {animations.get(spotlightStreamer.username)?.isPlaying ? <Pause size={16} /> : <Play size={16} />}
                  </button>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setAnimationSpeed(spotlightStreamer.username, 0.5)}
                      className={`px-2 py-1 text-xs rounded ${animations.get(spotlightStreamer.username)?.speed === 0.5 ? 'bg-purple-600' : 'bg-white bg-opacity-20 hover:bg-opacity-30'}`}
                    >
                      0.5x
                    </button>
                    <button
                      onClick={() => setAnimationSpeed(spotlightStreamer.username, 1)}
                      className={`px-2 py-1 text-xs rounded ${animations.get(spotlightStreamer.username)?.speed === 1 ? 'bg-purple-600' : 'bg-white bg-opacity-20 hover:bg-opacity-30'}`}
                    >
                      1x
                    </button>
                    <button
                      onClick={() => setAnimationSpeed(spotlightStreamer.username, 2)}
                      className={`px-2 py-1 text-xs rounded ${animations.get(spotlightStreamer.username)?.speed === 2 ? 'bg-purple-600' : 'bg-white bg-opacity-20 hover:bg-opacity-30'}`}
                    >
                      2x
                    </button>
                  </div>
                </div>
                
                {/* Streamer Info Overlay */}
                <div className="absolute top-4 left-4 bg-black bg-opacity-50 rounded-lg p-3">
                  <h2 className="text-xl font-bold">{spotlightStreamer.username}</h2>
                  <p className="text-sm mt-1">{spotlightStreamer.subject.replace(/<[^>]*>?/gm, '')}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <span className="flex items-center gap-1">
                      <Eye size={14} />
                      {formatNumber(spotlightStreamer.num_users)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={14} />
                      {formatNumber(spotlightStreamer.num_followers)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={14} />
                      {spotlightStreamer.country}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Streamer Details */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getGenderColor(spotlightStreamer.gender)}`}>
                      {spotlightStreamer.gender.toUpperCase()}
                    </span>
                    {spotlightStreamer.is_new && (
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-500">
                        NEW
                      </span>
                    )}
                    {spotlightStreamer.is_age_verified && (
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-500 flex items-center gap-1">
                        <Check size={10} />
                        18+
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleFavorite(spotlightStreamer.username)}
                      className={`p-2 rounded-lg ${favorites.has(spotlightStreamer.username) ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-opacity-70'}`}
                    >
                      <Heart size={16} fill={favorites.has(spotlightStreamer.username) ? 'currentColor' : 'none'} />
                    </button>
                    <button className="p-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-opacity-70">
                      <Share2 size={16} />
                    </button>
                  </div>
                </div>
                
                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {spotlightStreamer.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-gray-700 bg-opacity-50 rounded text-xs">
                      #{tag}
                    </span>
                  ))}
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button className="flex-1 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all">
                    Join Room
                  </button>
                  <button className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-opacity-70 transition-all">
                    <Download size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== SUB-COMPONENTS ====================

interface StreamerCardProps {
  streamer: Streamer;
  onHover: () => void;
  onLeave: () => void;
  isHovered: boolean;
  thumbUrl: string;
  isDuplicate: boolean;
  isLoading: boolean;
  isFavorite: boolean;
  onFavoriteToggle: () => void;
  onSpotlight: () => void;
  animation?: RoomAnimation;
  onToggleAnimation: () => void;
  onSetSpeed: (speed: number) => void;
  compactView: boolean;
}

const StreamerCard = memo(function StreamerCard({
  streamer,
  onHover,
  onLeave,
  isHovered,
  thumbUrl,
  isDuplicate,
  isLoading,
  isFavorite,
  onFavoriteToggle,
  onSpotlight,
  animation,
  onToggleAnimation,
  onSetSpeed,
  compactView
}: StreamerCardProps) {
  return (
    <div
      className={`bg-gray-800 bg-opacity-50 backdrop-blur-sm border rounded-lg overflow-hidden hover:transform hover:scale-105 transition-all duration-300 cursor-pointer ${
        isDuplicate ? 'border-yellow-500' : 'border-gray-700'
      }`}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      <div className="relative aspect-video">
        <img
          src={thumbUrl}
          alt={streamer.username}
          className={`w-full h-full object-cover ${isHovered ? 'animate-pulse' : ''} ${isLoading ? 'opacity-70' : ''}`}
          onError={(e) => {
            // Fallback to a placeholder image if the thumbnail fails to load
            (e.target as HTMLImageElement).src = `https://via.placeholder.com/320x180/1a1a1a/ffffff?text=${streamer.username}`;
          }}
        />
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        )}
        
        {/* Animation Controls (shown on hover) */}
        {isHovered && animation && animation.frames.length > 1 && (
          <div className="absolute bottom-1 left-1 flex items-center gap-1 bg-black bg-opacity-60 rounded p-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleAnimation();
              }}
              className="p-1 bg-white bg-opacity-20 rounded hover:bg-opacity-30"
            >
              {animation.isPlaying ? <Pause size={12} /> : <Play size={12} />}
            </button>
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSetSpeed(0.5);
                }}
                className={`px-1 py-0.5 text-xs rounded ${animation.speed === 0.5 ? 'bg-purple-600' : 'bg-white bg-opacity-20 hover:bg-opacity-30'}`}
              >
                0.5x
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSetSpeed(1);
                }}
                className={`px-1 py-0.5 text-xs rounded ${animation.speed === 1 ? 'bg-purple-600' : 'bg-white bg-opacity-20 hover:bg-opacity-30'}`}
              >
                1x
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSetSpeed(2);
                }}
                className={`px-1 py-0.5 text-xs rounded ${animation.speed === 2 ? 'bg-purple-600' : 'bg-white bg-opacity-20 hover:bg-opacity-30'}`}
              >
                2x
              </button>
            </div>
          </div>
        )}
        
        {/* Top Badges */}
        <div className="absolute top-1 left-1 flex items-center gap-1">
          <span className={`px-1.5 py-0.5 rounded-full text-xs font-semibold ${getGenderColor(streamer.gender)}`}>
            {streamer.gender.toUpperCase()}
          </span>
          {streamer.is_new && (
            <span className="px-1.5 py-0.5 rounded-full text-xs font-semibold bg-green-500">
              NEW
            </span>
          )}
          {streamer.is_age_verified && (
            <span className="px-1.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500 flex items-center gap-1">
              <Check size={10} />
              18+
            </span>
          )}
        </div>
        
        {/* Duplicate Badge */}
        {isDuplicate && (
          <div className="absolute top-1 right-1">
            <span className="px-1.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-500 flex items-center gap-1">
              <XCircle size={10} />
              Duplicate
            </span>
          </div>
        )}
        
        {/* Viewers Count */}
        <div className="absolute bottom-1 right-1 bg-black bg-opacity-60 px-1.5 py-0.5 rounded text-xs flex items-center gap-1">
          <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
          {formatNumber(streamer.num_users)}
        </div>
        
        {/* Spotlight Button (shown on hover) */}
        {isHovered && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSpotlight();
            }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-2 bg-black bg-opacity-60 rounded-full text-white hover:bg-opacity-80"
          >
            <Maximize2 size={20} />
          </button>
        )}
      </div>
      
      {/* Streamer Info */}
      <div className={`p-2 ${compactView ? 'py-1' : ''}`}>
        <div className="flex items-center justify-between">
          <h3 className={`font-semibold truncate ${compactView ? 'text-xs' : 'text-sm'}`}>
            {streamer.username}
          </h3>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFavoriteToggle();
            }}
            className={`p-1 rounded ${isFavorite ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
          >
            <Heart size={14} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
        </div>
        {!compactView && (
          <p className="text-gray-400 text-xs truncate mt-1">
            {streamer.subject.replace(/<[^>]*>?/gm, '')}
          </p>
        )}
        <div className={`flex justify-between items-center ${compactView ? 'mt-0.5' : 'mt-1'} text-xs text-gray-500`}>
          <span>{formatNumber(streamer.num_followers)} followers</span>
          <span>{streamer.country}</span>
        </div>
      </div>
    </div>
  );
});

interface StreamerListItemProps {
  streamer: Streamer;
  onHover: () => void;
  onLeave: () => void;
  isHovered: boolean;
  thumbUrl: string;
  isDuplicate: boolean;
  isLoading: boolean;
  isFavorite: boolean;
  onFavoriteToggle: () => void;
  onSpotlight: () => void;
  animation?: RoomAnimation;
  onToggleAnimation: () => void;
  onSetSpeed: (speed: number) => void;
}

const StreamerListItem = memo(function StreamerListItem({
  streamer,
  onHover,
  onLeave,
  isHovered,
  thumbUrl,
  isDuplicate,
  isLoading,
  isFavorite,
  onFavoriteToggle,
  onSpotlight,
  animation,
  onToggleAnimation,
  onSetSpeed
}: StreamerListItemProps) {
  return (
    <div
      className={`bg-gray-800 bg-opacity-50 backdrop-blur-sm border rounded-lg p-3 hover:bg-opacity-70 transition-all duration-300 cursor-pointer ${
        isDuplicate ? 'border-yellow-500' : 'border-gray-700'
      }`}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      <div className="flex gap-3">
        {/* Thumbnail */}
        <div className="relative w-32 h-24 flex-shrink-0">
          <img
            src={thumbUrl}
            alt={streamer.username}
            className={`w-full h-full object-cover rounded ${isHovered ? 'animate-pulse' : ''} ${isLoading ? 'opacity-70' : ''}`}
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://via.placeholder.com/320x180/1a1a1a/ffffff?text=${streamer.username}`;
            }}
          />
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded">
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          )}
          
          {/* Viewers Count */}
          <div className="absolute bottom-1 right-1 bg-black bg-opacity-60 px-1.5 py-0.5 rounded text-xs flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
            {formatNumber(streamer.num_users)}
          </div>
        </div>
        
        {/* Streamer Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold truncate">{streamer.username}</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onFavoriteToggle();
                }}
                className={`p-1 rounded ${isFavorite ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
              >
                <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSpotlight();
                }}
                className="p-1 rounded text-gray-400 hover:text-white"
              >
                <Maximize2 size={16} />
              </button>
            </div>
          </div>
          
          <p className="text-gray-400 text-sm truncate mt-1">
            {streamer.subject.replace(/<[^>]*>?/gm, '')}
          </p>
          
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Users size={14} />
              {formatNumber(streamer.num_followers)} followers
            </span>
            <span className="flex items-center gap-1">
              <MapPin size={14} />
              {streamer.country}
            </span>
          </div>
          
          {/* Badges */}
          <div className="flex items-center gap-2 mt-2">
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getGenderColor(streamer.gender)}`}>
              {streamer.gender.toUpperCase()}
            </span>
            {streamer.is_new && (
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-500">
                NEW
              </span>
            )}
            {streamer.is_age_verified && (
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-500 flex items-center gap-1">
                <Check size={10} />
                18+
              </span>
            )}
            {isDuplicate && (
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-500 flex items-center gap-1">
                <XCircle size={10} />
                Duplicate
              </span>
            )}
          </div>
          
          {/* Tags */}
          <div className="flex flex-wrap gap-1 mt-2">
            {streamer.tags.slice(0, 5).map(tag => (
              <span key={tag} className="px-1.5 py-0.5 bg-gray-700 bg-opacity-50 rounded text-xs">
                #{tag}
              </span>
            ))}
            {streamer.tags.length > 5 && (
              <span className="px-1.5 py-0.5 bg-gray-700 bg-opacity-50 rounded text-xs">
                +{streamer.tags.length - 5}
              </span>
            )}
          </div>
          
          {/* Animation Controls (shown on hover) */}
          {isHovered && animation && animation.frames.length > 1 && (
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleAnimation();
                }}
                className="p-1 bg-gray-700 rounded hover:bg-opacity-70"
              >
                {animation.isPlaying ? <Pause size={14} /> : <Play size={14} />}
              </button>
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSetSpeed(0.5);
                  }}
                  className={`px-2 py-1 text-xs rounded ${animation.speed === 0.5 ? 'bg-purple-600' : 'bg-gray-700 hover:bg-opacity-70'}`}
                >
                  0.5x
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSetSpeed(1);
                  }}
                  className={`px-2 py-1 text-xs rounded ${animation.speed === 1 ? 'bg-purple-600' : 'bg-gray-700 hover:bg-opacity-70'}`}
                >
                  1x
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSetSpeed(2);
                  }}
                  className={`px-2 py-1 text-xs rounded ${animation.speed === 2 ? 'bg-purple-600' : 'bg-gray-700 hover:bg-opacity-70'}`}
                >
                  2x
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});