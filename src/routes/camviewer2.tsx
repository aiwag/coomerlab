import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  CollisionDetection,
  rectIntersection,
  pointerWithin,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  Grid,
  Activity,
  Clock,
  Wifi,
  Maximize2,
  Volume2,
  VolumeX,
  Star,
  StarOff,
  Camera,
  Monitor,
  Zap,
  Settings,
  Play,
  Pause,
  PictureInPicture,
  X,
  ChevronDown,
  Filter,
  Users,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Database,
  WifiOff,
  WifiLow,
  WifiHigh,
  Layout,
  Minimize2,
  Plus,
  Trash2,
  Clipboard,
  Layers,
  ThumbsUp,
  MessageSquare,
  UserCheck,
  Search,
  RefreshCw,
  AlertCircle,
  MapPin,
  TrendingUp,
  Download,
  Share2,
  Bell,
  BellOff,
  Shield,
  Gauge,
  Heart,
  XCircle,
  Check,
  Expand
} from "lucide-react";

// =============== TYPE DEFINITIONS ====================

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

// =============== CONSTANTS ====================

const API_BASE_URL = 'https://chaturbate.com/api/ts/roomlist/room-list/';
const ROOMS_PER_PAGE = 30; // Increased for more rooms per page
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

// =============== DATABASE SERVICE ===============
class DatabaseService {
  private db: any = null;

  async init() {
    if (typeof window !== 'undefined') {
      this.db = {
        get: (key: string) => {
          const value = localStorage.getItem(key);
          return value ? JSON.parse(value) : null;
        },
        set: (key: string, value: any) => {
          localStorage.setItem(key, JSON.stringify(value));
        }
      };

      // Initialize default values if they don't exist
      if (!this.db.get('favorites')) {
        this.db.set('favorites', []);
      }
      if (!this.db.get('settings')) {
        this.db.set('settings', {
          gridSize: 2,
          sidebarVisible: true,
          sidebarCollapsed: false,
          bandwidthMode: 'medium',
          autoMode: false,
          fullViewMode: null,
          viewArrangement: 'grid',
          showOffline: true,
          gridMode: 'standard',
          browserWidth: 320, // Default browser width
          browserOpen: true,  // Browser open by default
          browserExpanded: false // Browser not expanded by default
        });
      }
      if (!this.db.get('streamStatus')) {
        this.db.set('streamStatus', {});
      }
      if (!this.db.get('customStreams')) {
        this.db.set('customStreams', []);
      }
      if (!this.db.get('removedStreams')) {
        this.db.set('removedStreams', []);
      }
    }
  }

  async getFavorites(): Promise<number[]> {
    return this.db?.get('favorites') || [];
  }

  async setFavorites(favorites: number[]): Promise<void> {
    this.db?.set('favorites', favorites);
  }

  async getSettings(): Promise<any> {
    return this.db?.get('settings') || {
      gridSize: 2,
      sidebarVisible: true,
      sidebarCollapsed: false,
      bandwidthMode: 'medium',
      autoMode: false,
      fullViewMode: null,
      viewArrangement: 'grid',
      showOffline: true,
      gridMode: 'standard',
      browserWidth: 320,
      browserOpen: true,
      browserExpanded: false
    };
  }

  async setSettings(settings: any): Promise<void> {
    this.db?.set('settings', settings);
  }

  async getStreamStatus(): Promise<any> {
    return this.db?.get('streamStatus') || {};
  }

  async setStreamStatus(status: any): Promise<void> {
    this.db?.set('streamStatus', status);
  }

  async getViewArrangement(): Promise<any> {
    return this.db?.get('viewArrangement') || {
      type: 'grid',
      gridSize: 2,
      fullViewMode: null,
      streamOrder: []
    };
  }

  async setViewArrangement(arrangement: any): Promise<void> {
    this.db?.set('viewArrangement', arrangement);
  }

  async getCustomStreams(): Promise<string[]> {
    return this.db?.get('customStreams') || [];
  }

  async setCustomStreams(streams: string[]): Promise<void> {
    this.db?.set('customStreams', streams);
  }

  async getRemovedStreams(): Promise<string[]> {
    return this.db?.get('removedStreams') || [];
  }

  async setRemovedStreams(streams: string[]): Promise<void> {
    this.db?.set('removedStreams', streams);
  }

  async removeStream(url: string): Promise<void> {
    // Remove from custom streams
    const customStreams = await this.getCustomStreams();
    const filteredCustomStreams = customStreams.filter(stream => stream !== url);
    await this.setCustomStreams(filteredCustomStreams);

    // Add to removed streams list
    const removedStreams = await this.getRemovedStreams();
    if (!removedStreams.includes(url)) {
      await this.setRemovedStreams([...removedStreams, url]);
    }

    // Remove from view arrangement
    const viewArrangement = await this.getViewArrangement();
    const filteredStreamOrder = viewArrangement.streamOrder.filter(stream => stream !== url);
    await this.setViewArrangement({
      ...viewArrangement,
      streamOrder: filteredStreamOrder
    });
  }
}

// =============== UTILITY FUNCTIONS ====================

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

  const debounced = function (this: any, ...args: Parameters<T>) {
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
 * Format session time
 */
function formatSessionTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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

// =============== CUSTOM HOOKS ====================

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

      // Instead of fetching individual thumbnails, we'll use the thumbnail URL directly
      // from the streamer data we already have
      const thumbnailUrl = `https://jpeg.live.mmcdn.com/stream?room=${username}`;
      
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

      // Remove from active requests
      setActiveRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(username);
        return newSet;
      });
    });

    setActiveRequests(newActiveRequests);

    // Remove processed items from queue
    setFetchQueue(prev => prev.slice(nextBatch.length));
  }, [fetchQueue, activeRequests, addFrame]);

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
 * Hook for FPS monitoring
 */
function useFPSMonitor() {
  const [fps, setFps] = useState(0);
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());

  useEffect(() => {
    let animationFrameId: number;

    const calculateFPS = () => {
      frameCount.current++;
      const currentTime = performance.now();

      if (currentTime >= lastTime.current + 1000) {
        setFps(Math.round((frameCount.current * 1000) / (currentTime - lastTime.current)));
        frameCount.current = 0;
        lastTime.current = currentTime;
      }

      animationFrameId = requestAnimationFrame(calculateFPS);
    };

    animationFrameId = requestAnimationFrame(calculateFPS);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return fps;
}

/**
 * Hook for clipboard monitoring
 */
function useClipboardMonitor(onPaste: (text: string) => void) {
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        const text = e.clipboardData?.getData('text') || '';
        if (text.trim()) {
          onPaste(text.trim());
        }
      }
    };

    document.addEventListener('paste', handlePaste);

    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, [onPaste]);
}

/**
 * Hook for infinite scroll
 */
function useInfiniteScroll(
  callback: () => void,
  isLoading: boolean,
  hasMore: boolean,
  containerRef: React.RefObject<HTMLElement>
) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (
        container.scrollTop + container.clientHeight >=
        container.scrollHeight - 100
      ) {
        if (!isLoading && hasMore) {
          callback();
        }
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [callback, isLoading, hasMore, containerRef]);
}

// =============== COMPONENTS ====================

/**
 * Resizable Component Hook
 */
function useResizable(initialWidth: number, minWidth: number, maxWidth: number) {
  const [width, setWidth] = useState(initialWidth);
  const [isResizing, setIsResizing] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !elementRef.current) return;

      const newWidth = e.clientX - elementRef.current.getBoundingClientRect().left;
      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, minWidth, maxWidth]);

  const startResizing = useCallback(() => {
    setIsResizing(true);
  }, []);

  return { width, isResizing, elementRef, startResizing };
}

/**
 * Compact Toolbar Component
 */
function CompactToolbar({
  sessionTime,
  bandwidth,
  latency,
  gridSize,
  setGridSize,
  autoMode,
  setAutoMode,
  screenFps,
  resolution,
  toggleSidebar,
  sidebarVisible,
  sidebarCollapsed,
  bandwidthMode,
  setBandwidthMode,
  fullViewMode,
  setFullViewMode,
  gridMode,
  setGridMode,
  showBrowser,
  setShowBrowser,
  fetchMetrics
}: {
  sessionTime: number;
  bandwidth: number;
  latency: number;
  gridSize: number;
  setGridSize: (size: number) => void;
  autoMode: boolean;
  setAutoMode: (enabled: boolean) => void;
  screenFps: number;
  resolution: string;
  toggleSidebar: () => void;
  sidebarVisible: boolean;
  sidebarCollapsed: boolean;
  bandwidthMode: 'low' | 'medium' | 'high';
  setBandwidthMode: (mode: 'low' | 'medium' | 'high') => void;
  fullViewMode: number | null;
  setFullViewMode: (index: number | null) => void;
  gridMode: 'standard' | 'professional';
  setGridMode: (mode: 'standard' | 'professional') => void;
  showBrowser: boolean;
  setShowBrowser: (show: boolean) => void;
  fetchMetrics: PerformanceMetrics;
}) {
  const getBandwidthIcon = () => {
    switch (bandwidthMode) {
      case 'low': return <WifiOff size={12} className="text-red-400" />;
      case 'medium': return <WifiLow size={12} className="text-yellow-400" />;
      case 'high': return <WifiHigh size={12} className="text-green-400" />;
      default: return <Wifi size={12} />;
    }
  };

  return (
    <div className="bg-neutral-800 text-white px-2 py-1 flex items-center justify-between text-xs border-b border-neutral-700">
      <div className="flex items-center gap-2">
        {/* Sidebar Toggle */}
        <button
          onClick={toggleSidebar}
          className="p-1 rounded hover:bg-neutral-700 transition-colors"
          title="Toggle Sidebar"
        >
          {sidebarVisible ? (sidebarCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />) : <ChevronRight size={12} />}
        </button>

        {/* Browser Toggle */}
        <button
          onClick={() => setShowBrowser(!showBrowser)}
          className={`p-1 rounded hover:bg-neutral-700 transition-colors ${showBrowser ? 'bg-cyan-600' : ''}`}
          title="Toggle Stream Browser"
        >
          <Search size={12} />
        </button>

        {/* Status Indicators */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Clock size={12} className="text-cyan-400" />
            <span className="hidden sm:inline">{formatSessionTime(sessionTime)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Activity size={12} className="text-green-400" />
            <span className="hidden sm:inline">{bandwidth.toFixed(1)} MB/s</span>
          </div>
          <div className="flex items-center gap-1">
            {getBandwidthIcon()}
            <span className="hidden sm:inline">{bandwidthMode}</span>
          </div>
          <div className="flex items-center gap-1">
            <Wifi size={12} className={latency < 30 ? "text-green-400" : latency < 60 ? "text-yellow-400" : "text-red-400"} />
            <span className="hidden sm:inline">{latency} ms</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap size={12} className="text-purple-400" />
            <span className="hidden sm:inline">{screenFps} FPS</span>
          </div>
          <div className="flex items-center gap-1">
            <Monitor size={12} className="text-blue-400" />
            <span className="hidden sm:inline">{resolution}</span>
          </div>
          {showBrowser && (
            <div className="flex items-center gap-1">
              <Activity size={12} className="text-cyan-400" />
              <span className="hidden sm:inline">{fetchMetrics.avgFetchTime.toFixed(0)}ms</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Bandwidth Mode */}
        <div className="flex items-center gap-1 bg-neutral-700 rounded p-1">
          {(['low', 'medium', 'high'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setBandwidthMode(mode)}
              className={`px-1 py-1 rounded text-xs flex items-center gap-1 ${bandwidthMode === mode
                ? "bg-cyan-600 text-white"
                : "text-neutral-300 hover:bg-neutral-600"
                }`}
              title={`${mode.charAt(0).toUpperCase() + mode.slice(1)} Bandwidth`}
            >
              {mode === 'low' && <WifiOff size={10} />}
              {mode === 'medium' && <WifiLow size={10} />}
              {mode === 'high' && <WifiHigh size={10} />}
            </button>
          ))}
        </div>

        {/* Grid Mode */}
        <div className="flex items-center gap-1 bg-neutral-700 rounded p-1">
          <button
            onClick={() => setGridMode(gridMode === 'standard' ? 'professional' : 'standard')}
            className={`px-1 py-1 rounded text-xs flex items-center gap-1 ${gridMode === 'professional'
              ? "bg-cyan-600 text-white"
              : "text-neutral-300 hover:bg-neutral-600"
              }`}
            title="Toggle Grid Mode"
          >
            <Layers size={10} />
            <span className="hidden sm:inline">{gridMode === 'professional' ? 'Pro' : 'Std'}</span>
          </button>
        </div>

        {/* Grid Controls */}
        <div className="flex items-center gap-1 bg-neutral-700 rounded p-1">
          <button
            onClick={() => setAutoMode(!autoMode)}
            className={`px-1 py-1 rounded text-xs flex items-center gap-1 ${autoMode
              ? "bg-cyan-600 text-white"
              : "text-neutral-300 hover:bg-neutral-600"
              }`}
            title="Auto Mode"
          >
            <Zap size={10} />
            <span className="hidden sm:inline">Auto</span>
          </button>

          {!autoMode && (
            <>
              {[1, 2, 3, 4].map(size => (
                <button
                  key={size}
                  onClick={() => setGridSize(size)}
                  className={`px-1 py-1 rounded text-xs ${gridSize === size
                    ? "bg-cyan-600 text-white"
                    : "text-neutral-300 hover:bg-neutral-600"
                    }`}
                  title={`${size}×${size} Grid`}
                >
                  {size}×{size}
                </button>
              ))}
            </>
          )}
        </div>

        {/* Full View Mode */}
        <button
          onClick={() => setFullViewMode(fullViewMode !== null ? null : 0)}
          className={`px-1 py-1 rounded text-xs flex items-center gap-1 ${fullViewMode !== null
            ? "bg-cyan-600 text-white"
            : "text-neutral-300 hover:bg-neutral-600"
            }`}
          title="Full View Mode"
        >
          {fullViewMode !== null ? <Minimize2 size={10} /> : <Maximize2 size={10} />}
          <span className="hidden sm:inline">Full</span>
        </button>

        {/* Settings */}
        <button className="p-1 rounded hover:bg-neutral-700 transition-colors">
          <Settings size={12} />
        </button>
      </div>
    </div>
  );
}

/**
 * Stream Browser Sidebar Component
 */
function StreamBrowserSidebar({
  visible,
  onClose,
  onAddStream,
  streamers,
  filteredStreamers,
  searchTerm,
  setSearchTerm,
  filters,
  setFilters,
  allTags,
  toggleTagFilter,
  clearFilters,
  isLoading,
  error,
  handleRefresh,
  isAnimatedMode,
  toggleAnimatedMode,
  refreshInterval,
  handleIntervalChange,
  connectionStatus,
  lastRefresh,
  fetchMetrics,
  width,
  isResizing,
  startResizing,
  onWidthChange,
  expanded,
  onToggleExpanded,
  currentPage,
  totalPages,
  hasMore,
  handleLoadMore,
  containerRef
}: {
  visible: boolean;
  onClose: () => void;
  onAddStream: (streamer: Streamer) => void;
  streamers: Streamer[];
  filteredStreamers: Streamer[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filters: Filters;
  setFilters: (filters: Partial<Filters>) => void;
  allTags: string[];
  toggleTagFilter: (tag: string) => void;
  clearFilters: () => void;
  isLoading: boolean;
  error: string | null;
  handleRefresh: () => void;
  isAnimatedMode: boolean;
  toggleAnimatedMode: () => void;
  refreshInterval: number;
  handleIntervalChange: (interval: number) => void;
  connectionStatus: 'connected' | 'disconnected' | 'limited';
  lastRefresh: Date;
  fetchMetrics: PerformanceMetrics;
  width: number;
  isResizing: boolean;
  startResizing: () => void;
  onWidthChange: (width: number) => void;
  expanded: boolean;
  onToggleExpanded: () => void;
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
  handleLoadMore: () => void;
  containerRef: React.RefObject<HTMLElement>;
}) {
  // Calculate how many streamers to show based on width
  const calculateVisibleCount = useCallback(() => {
    // Base count for minimum width
    let count = 8; // Increased from 5 to 8
    
    // Add more streamers as width increases
    if (width > 320) count += Math.floor((width - 320) / 40); // Reduced from 50 to 40 for more streamers
    
    // If expanded, show more
    if (expanded) count *= 2;
    
    // Cap at a reasonable maximum
    return Math.min(count, 30); // Increased from 20 to 30
  }, [width, expanded]);

  const visibleCount = calculateVisibleCount();

  // Infinite scroll hook
  useInfiniteScroll(
    handleLoadMore,
    isLoading,
    hasMore,
    containerRef
  );

  if (!visible) return null;

  return (
    <div 
      ref={useRef<HTMLDivElement>(null)}
      className={`bg-neutral-800 border-r border-neutral-700 flex flex-col h-full relative ${expanded ? 'z-20' : 'z-10'}`}
      style={{ 
        width: expanded ? '50%' : `${width}px`,
        minWidth: expanded ? '400px' : '280px',
        maxWidth: expanded ? '80%' : '600px'
      }}
    >
      {/* Resize Handle */}
      {!expanded && (
        <div
          className="absolute top-0 right-0 w-1 h-full bg-neutral-700 hover:bg-cyan-600 cursor-col-resize z-10"
          onMouseDown={startResizing}
          title="Drag to resize"
        />
      )}

      {/* Header */}
      <div className="p-2 border-b border-neutral-700 flex items-center justify-between">
        <h2 className="text-xs font-semibold text-white flex items-center gap-1">
          <Search size={14} />
          <span>Stream Browser</span>
        </h2>
        <div className="flex items-center gap-1">
          <button
            onClick={onToggleExpanded}
            className={`p-1 rounded hover:bg-neutral-700 transition-colors ${expanded ? 'bg-cyan-600' : ''}`}
            title={expanded ? "Collapse" : "Expand"}
          >
            <Expand size={14} />
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-neutral-700 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="p-2 border-b border-neutral-700 space-y-2">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={12} />
          <input
            type="text"
            placeholder="Search streamers..."
            className="w-full bg-neutral-700 text-white pl-8 pr-2 py-1 rounded text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Connection Status */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1">
            {connectionStatus === 'connected' && <Wifi size={12} className="text-green-500" />}
            {connectionStatus === 'limited' && <Wifi size={12} className="text-yellow-500" />}
            {connectionStatus === 'disconnected' && <WifiOff size={12} className="text-red-500" />}
            <span className="text-gray-400">
              {connectionStatus === 'connected' && 'Connected'}
              {connectionStatus === 'limited' && 'Rate Limited'}
              {connectionStatus === 'disconnected' && 'Disconnected'}
            </span>
          </div>
          <span className="text-gray-400">
            {formatTimeSinceRefresh(lastRefresh)}
          </span>
        </div>

        {/* Refresh Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleRefresh}
            className="p-1 bg-neutral-700 rounded hover:bg-neutral-600 transition-colors"
            disabled={isLoading}
          >
            <RefreshCw className={isLoading ? 'animate-spin' : ''} size={12} />
          </button>
          <div className="flex items-center gap-1 bg-neutral-700 rounded p-1">
            <button
              onClick={() => handleIntervalChange(3)}
              className={`px-1 py-1 rounded text-xs transition-all ${refreshInterval === 3 && !isAnimatedMode ? 'bg-cyan-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              3s
            </button>
            <button
              onClick={() => handleIntervalChange(10)}
              className={`px-1 py-1 rounded text-xs transition-all ${refreshInterval === 10 && !isAnimatedMode ? 'bg-cyan-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              10s
            </button>
            <button
              onClick={() => handleIntervalChange(30)}
              className={`px-1 py-1 rounded text-xs transition-all ${refreshInterval === 30 && !isAnimatedMode ? 'bg-cyan-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              30s
            </button>
            <button
              onClick={toggleAnimatedMode}
              className={`px-1 py-1 rounded text-xs transition-all flex items-center gap-1 ${isAnimatedMode ? 'bg-cyan-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <Zap size={10} />
              <span>Live</span>
            </button>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <div className="flex items-center gap-1">
            <Activity size={10} />
            <span>{fetchMetrics.avgFetchTime.toFixed(0)}ms</span>
          </div>
          <div className="flex items-center gap-1">
            <Gauge size={10} />
            <span>{fetchMetrics.successRate.toFixed(0)}%</span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-1 bg-red-900 bg-opacity-30 border border-red-800 rounded flex items-center gap-1">
            <AlertCircle size={10} className="text-red-400" />
            <span className="text-red-200 text-xs">{error}</span>
          </div>
        )}
      </div>

      {/* Quick Filters */}
      <div className="p-2 border-b border-neutral-700">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-xs font-semibold text-white">Quick Filters</h3>
          <button
            onClick={clearFilters}
            className="text-xs text-cyan-400 hover:text-cyan-300"
          >
            Clear All
          </button>
        </div>

        {/* Gender Filter */}
        <div className="mb-2">
          <label className="block text-xs text-gray-400 mb-1">Gender</label>
          <div className="grid grid-cols-3 gap-1">
            {['all', 'f', 'm', 'c', 's'].map(gender => (
              <button
                key={gender}
                onClick={() => setFilters({ gender })}
                className={`px-1 py-1 rounded text-xs transition-all ${filters.gender === gender
                    ? 'bg-cyan-600 text-white'
                    : 'bg-neutral-700 text-gray-300 hover:bg-neutral-600'
                  }`}
              >
                {gender === 'all' ? 'All' :
                  gender === 'f' ? 'F' :
                    gender === 'm' ? 'M' :
                      gender === 'c' ? 'C' : 'T'}
              </button>
            ))}
          </div>
        </div>

        {/* Special Filters */}
        <div className="space-y-1">
          <label className="flex items-center gap-1 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.showNewOnly}
              onChange={(e) => setFilters({ showNewOnly: e.target.checked })}
              className="w-3 h-3 text-cyan-600 bg-neutral-700 border-neutral-600 rounded focus:ring-cyan-500"
            />
            <span className="text-xs text-gray-300">New Streamers Only</span>
          </label>
          <label className="flex items-center gap-1 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.showAgeVerified}
              onChange={(e) => setFilters({ showAgeVerified: e.target.checked })}
              className="w-3 h-3 text-cyan-600 bg-neutral-700 border-neutral-600 rounded focus:ring-cyan-500"
            />
            <span className="text-xs text-gray-300">Age Verified Only</span>
          </label>
        </div>
      </div>

      {/* Stream List */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar"
      >
        {isLoading && streamers.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-cyan-500"></div>
          </div>
        ) : filteredStreamers.length === 0 ? (
          <div className="text-center text-gray-400 text-xs py-2">
            {streamers.length === 0 ? 'No streamers available.' : 'No streamers found matching your criteria.'}
          </div>
        ) : (
          <>
            {filteredStreamers.slice(0, visibleCount).map((streamer) => (
              <div
                key={streamer.username}
                className="bg-neutral-700 rounded p-1 hover:bg-neutral-600 transition-colors cursor-pointer"
                onClick={() => onAddStream(streamer)}
              >
                <div className="flex items-center gap-1">
                  <div className="relative w-10 h-10 rounded overflow-hidden flex-shrink-0">
                    <img
                      src={streamer.img}
                      alt={streamer.username}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-medium text-white truncate">{streamer.username}</h4>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddStream(streamer);
                        }}
                        className="p-1 bg-cyan-600 text-white rounded hover:bg-cyan-700 transition-colors"
                        title="Add to Grid"
                      >
                        <Plus size={10} />
                      </button>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <span>{formatNumber(streamer.num_users)} viewers</span>
                      <span>{formatNumber(streamer.num_followers)} followers</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <span className={`px-1 py-0 rounded-full text-xs font-semibold ${getGenderColor(streamer.gender)}`}>
                        {streamer.gender.toUpperCase()}
                      </span>
                      {streamer.is_new && (
                        <span className="px-1 py-0 rounded-full text-xs font-semibold bg-green-500">
                          NEW
                        </span>
                      )}
                      {streamer.is_age_verified && (
                        <span className="px-1 py-0 rounded-full text-xs font-semibold bg-blue-500 flex items-center gap-1">
                          <Check size={6} />
                          18+
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Load More Indicator */}
            {isLoading && streamers.length > 0 && (
              <div className="flex justify-center py-1">
                <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-cyan-500"></div>
              </div>
            )}
            
            {/* Pagination Info */}
            {!isLoading && hasMore && (
              <div className="text-center text-xs text-gray-400 py-1">
                Showing {filteredStreamers.length} of {streamers.length} streamers
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Sidebar Component
 */
function Sidebar({
  streams,
  favorites,
  onToggleFavorite,
  onFocusStream,
  visible,
  collapsed,
  onToggleCollapse,
  onAddStream,
  onRemoveStream,
  showOffline,
  onPasteFromClipboard,
  onFullscreenStream,
  showBrowser,
  setShowBrowser
}: {
  streams: Array<{ url: string; username: string; thumb: string; isPlaying: boolean; viewerCount: number; online: boolean }>;
  favorites: Set<number>;
  onToggleFavorite: (index: number) => void;
  onFocusStream: (index: number) => void;
  visible: boolean;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onAddStream: (url: string) => void;
  onRemoveStream: (index: number) => void;
  showOffline: boolean;
  onPasteFromClipboard: () => void;
  onFullscreenStream: (index: number) => void;
  showBrowser: boolean;
  setShowBrowser: (show: boolean) => void;
}) {
  const [showAddStream, setShowAddStream] = useState(false);
  const [newStreamUrl, setNewStreamUrl] = useState("");

  if (!visible) return null;

  const handleAddStream = () => {
    if (newStreamUrl.trim()) {
      onAddStream(newStreamUrl.trim());
      setNewStreamUrl("");
      setShowAddStream(false);
    }
  };

  const filteredStreams = showOffline
    ? streams
    : streams.filter(stream => stream.online);

  return (
    <div className={`bg-neutral-800 border-r border-neutral-700 transition-all duration-300 flex flex-col ${collapsed ? 'w-10' : 'w-48'
      } overflow-hidden`}>
      <div className="p-1 border-b border-neutral-700 flex items-center justify-between">
        {!collapsed && (
          <h3 className="text-xs font-semibold text-white flex items-center gap-1">
            <Users size={12} />
            <span>Streams</span>
          </h3>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-1 rounded hover:bg-neutral-700 transition-colors"
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </div>

      {!collapsed && (
        <>
          <div className="p-1 border-b border-neutral-700 flex items-center justify-between">
            <Database size={10} className="text-neutral-400" title="Data saved locally" />
            <Layout size={10} className="text-neutral-400" title="View arrangement saved" />
            <button
              onClick={() => setShowAddStream(!showAddStream)}
              className="p-1 rounded hover:bg-neutral-700 transition-colors"
              title="Add Stream"
            >
              <Plus size={10} />
            </button>
            <button
              onClick={() => setShowBrowser(!showBrowser)}
              className={`p-1 rounded hover:bg-neutral-700 transition-colors ${showBrowser ? 'bg-cyan-600' : ''}`}
              title="Browse Streams"
            >
              <Search size={10} />
            </button>
            <button
              onClick={onPasteFromClipboard}
              className="p-1 rounded hover:bg-neutral-700 transition-colors"
              title="Paste Stream URL"
            >
              <Clipboard size={10} />
            </button>
          </div>

          {showAddStream && (
            <div className="p-1 border-b border-neutral-700">
              <div className="flex gap-1">
                <input
                  type="text"
                  value={newStreamUrl}
                  onChange={(e) => setNewStreamUrl(e.target.value)}
                  placeholder="Stream URL..."
                  className="flex-1 bg-neutral-700 text-white px-1 py-1 rounded text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
                <button
                  onClick={handleAddStream}
                  className="p-1 bg-cyan-600 text-white rounded hover:bg-cyan-700 transition-colors"
                >
                  <Plus size={10} />
                </button>
                <button
                  onClick={() => setShowAddStream(false)}
                  className="p-1 bg-neutral-700 text-white rounded hover:bg-neutral-600 transition-colors"
                >
                  <X size={10} />
                </button>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-1 space-y-1 custom-scrollbar">
            {filteredStreams.map((stream, index) => (
              <div
                key={`${stream.url}-${index}`}
                className="bg-neutral-700 rounded p-1 hover:bg-neutral-600 transition-colors cursor-pointer"
                onClick={() => onFocusStream(index)}
              >
                <div className="flex items-center gap-1">
                  <div className="relative w-8 h-8 rounded overflow-hidden flex-shrink-0">
                    <img
                      src={stream.thumb}
                      alt={stream.username}
                      className="w-full h-full object-cover"
                    />
                    <div className={`absolute bottom-0 right-0 w-1.5 h-1.5 rounded-full ${stream.isPlaying ? "bg-green-500" : "bg-red-500"}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-medium text-white truncate">{stream.username}</h4>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite(index);
                          }}
                          className="p-0.5"
                        >
                          {favorites.has(index) ?
                            <Star size={8} className="fill-yellow-400 text-yellow-400" /> :
                            <StarOff size={8} className="text-neutral-400" />
                          }
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onFullscreenStream(index);
                          }}
                          className="p-0.5"
                          title="Fullscreen"
                        >
                          <Maximize2 size={8} className="text-neutral-400" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveStream(index);
                          }}
                          className="p-0.5"
                        >
                          <Trash2 size={8} className="text-red-400" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-neutral-400">
                      <span>{stream.viewerCount} viewers</span>
                      {!stream.online && <span className="text-red-400">Offline</span>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {collapsed && (
        <div className="flex flex-col items-center py-1 gap-1">
          <Users size={12} className="text-neutral-400" />
          <Database size={10} className="text-neutral-400" title="Data saved locally" />
          <Layout size={10} className="text-neutral-400" title="View arrangement saved" />
          <button
            onClick={() => setShowAddStream(!showAddStream)}
            className="p-1 rounded hover:bg-neutral-700 transition-colors"
            title="Add Stream"
          >
            <Plus size={10} />
          </button>
          <button
            onClick={() => setShowBrowser(!showBrowser)}
            className={`p-1 rounded hover:bg-neutral-700 transition-colors ${showBrowser ? 'bg-cyan-600' : ''}`}
            title="Browse Streams"
          >
            <Search size={10} />
          </button>
          <button
            onClick={onPasteFromClipboard}
            className="p-1 rounded hover:bg-neutral-700 transition-colors"
            title="Paste Stream URL"
          >
            <Clipboard size={10} />
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Minimized Stream Component
 */
function MinimizedStream({
  stream,
  index,
  onRestore,
  isPlaying
}: {
  stream: { url: string; username: string; thumb: string };
  index: number;
  onRestore: (index: number) => void;
  isPlaying: boolean;
}) {
  return (
    <div
      className="relative w-20 h-14 rounded overflow-hidden cursor-pointer hover:ring-2 hover:ring-cyan-500 transition-all flex-shrink-0"
      onClick={() => onRestore(index)}
    >
      <img
        src={stream.thumb}
        alt={stream.username}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
        <span className="text-white text-xs truncate px-1">{stream.username}</span>
      </div>
      <div className={`absolute top-1 right-1 w-1.5 h-1.5 rounded-full ${isPlaying ? "bg-green-500" : "bg-red-500"}`} />
    </div>
  );
}

/**
 * Stream Controls Component
 */
function StreamControls({
  isMuted,
  onToggleMute,
  isFavorite,
  onToggleFavorite,
  onSnapshot,
  onFullscreen,
  onPiP,
  isPlaying,
  onFullView
}: {
  isMuted: boolean;
  onToggleMute: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onSnapshot: () => void;
  onFullscreen: () => void;
  onPiP: () => void;
  isPlaying: boolean;
  onFullView: () => void;
}) {
  return (
    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-1 flex justify-between items-center opacity-0 hover:opacity-100 transition-opacity">
      <div className="flex gap-1">
        <button
          onClick={onToggleMute}
          className="p-0.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <VolumeX size={10} /> : <Volume2 size={10} />}
        </button>
        <button
          onClick={onToggleFavorite}
          className="p-0.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          title={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          {isFavorite ? <Star size={10} className="fill-yellow-400 text-yellow-400" /> : <Star size={10} />}
        </button>
      </div>

      <div className="flex gap-1">
        <button
          onClick={onSnapshot}
          className="p-0.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          title="Take snapshot"
        >
          <Camera size={10} />
        </button>
        <button
          onClick={onPiP}
          className="p-0.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          title="Picture in Picture"
        >
          <PictureInPicture size={10} />
        </button>
        <button
          onClick={onFullView}
          className="p-0.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          title="Full View"
        >
          <Maximize2 size={10} />
        </button>
        <button
          onClick={onFullscreen}
          className="p-0.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          title="Fullscreen"
        >
          <Maximize2 size={10} />
        </button>
      </div>
    </div>
  );
}

/**
 * SortableWebview Component
 */
function SortableWebview({
  id,
  url,
  index,
  webviewRefs,
  onVideoPlay,
  onSnapshot,
  onToggleFavorite,
  isFavorite,
  onToggleMute,
  isMuted,
  onFullscreen,
  onPiP,
  isPlaying,
  isDragging,
  dragOverlay,
  onFullView,
  bandwidthMode,
  isFullViewMode,
  gridMode
}: {
  id: string;
  url: string;
  index: number;
  webviewRefs: React.MutableRefObject<(HTMLWebViewElement | null)[]>;
  onVideoPlay: (index: number) => void;
  onSnapshot: (index: number) => void;
  onToggleFavorite: (index: number) => void;
  isFavorite: boolean;
  onToggleMute: (index: number) => void;
  isMuted: boolean;
  onFullscreen: (index: number) => void;
  onPiP: (index: number) => void;
  isPlaying: boolean;
  isDragging: boolean;
  dragOverlay: boolean;
  onFullView: () => void;
  bandwidthMode: 'low' | 'medium' | 'high';
  isFullViewMode: boolean;
  gridMode: 'standard' | 'professional';
}) {
  const [hasVideoStarted, setHasVideoStarted] = useState(false);
  const [thumbTimeoutPassed, setThumbTimeoutPassed] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [streamQuality, setStreamQuality] = useState("HD");
  const [viewerCount, setViewerCount] = useState(0);
  const [likes, setLikes] = useState(0);
  const [messages, setMessages] = useState(0);
  const [followers, setFollowers] = useState(0);
  const loadingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const injectionIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id,
    transition: null, // Disable transition for smoother dragging
  });

  // Extract username from URL
  const username = url.match(/chaturbate\.com\/([^/]+)/)?.[1] ?? "unknown";

  // Thumbnail URL
  const thumb = `https://jpeg.live.mmcdn.com/stream?room=${username}`;

  // Show thumbnail if video hasn't started AND timeout not passed
  const showThumbnail = !hasVideoStarted && !thumbTimeoutPassed;

  // Style for drag handle
  const dragHandleProps = {
    ...attributes,
    ...listeners,
    style: {
      cursor: isDragging ? "grabbing" : "grab",
      userSelect: "none",
    },
  };

  // Style for container drag transform
  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? "none" : transition, // Disable transition during drag
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
    transformOrigin: "top left",
  };

  // Persistent injection function
  const injectStyles = useCallback(() => {
    const webview = webviewRefs.current[index];
    if (!webview) return;

    const script = `
      (function() {
        try {
          console.log('Injecting styles for ${username}');

          document.body.querySelector("#close_entrance_terms")?.click();

          const theaterVideoControls = document.querySelector('.theater-video-controls');
          if (theaterVideoControls) theaterVideoControls.style.background = 'transparent';
          
          // Hide UI elements
          document.body.style.backgroundColor = 'black';
          document.body.style.margin = '0';
          document.body.style.padding = '0';
          document.body.style.overflow = 'hidden';
          
          // Common elements to hide
          const elementsToHide = [
            '#header', '.footer-holder', '.RoomSignupPopup', '#roomTabs',
            '.playerTitleBar', '.genderTabs', '#TheaterModePlayer > div:nth-child(8)',
            '#TheaterModePlayer > div:nth-child(10)',
            '.video-overlay', '.video-controls', '.chat-container', '.chat-panel',
            '.top-bar', '.RoomSignupPopup', '#entrance_terms_overlay', '#gameInfoBar',
            '#DraggableChatTabContainer', '#ChatTabContainer', '.draggableCanvasWindow', '.theater-video-controls', '.dark-gradient-bg', '#video-player-toast-container', '.vjs-poster .vjs-hidden', '.vjs-control-text','.vjs-control-bar', '.vjs-modal-dialog .vjs-hidden  .vjs-text-track-settings', '.vjs-text-track-display', '.fullscreen-dropdown', '#entrance_terms_overlay', '.bottom-bar', '#VideoPanel > div:nth-child(3)', '.hover-btn', '.cbLogo', '.social-icons', '.share-buttons', '.drop-shadow-container'
          ];
          
          elementsToHide.forEach(sel => {
            const elements = document.querySelectorAll(sel);
            elements.forEach(el => el.style.display = 'none');
          });

          

          // Style video player to fill entire viewport
          const makeVideoFullscreen = () => {
            const video = document.querySelector('video') || document.querySelector('#chat-player_html5_api');
            const videoDiv = document.querySelector('.videoPlayerDiv');
            const playerContainer = document.querySelector('.player-container');
            
            if (video) {
              video.style.position = 'fixed';
              video.style.top = '0';
              video.style.left = '0';
              video.style.width = '100vw';
              video.style.height = '100vh';
              video.style.objectFit = '${isFullViewMode ? 'cover' : 'cover'}';
              video.style.zIndex = '1';
            }
            
            if (videoDiv) {
              videoDiv.style.position = 'fixed';
              videoDiv.style.top = '0';
              videoDiv.style.left = '0';
              videoDiv.style.width = '100vw';
              videoDiv.style.height = '100vh';
              videoDiv.style.overflow = 'hidden';
              videoDiv.style.background = 'black';
              videoDiv.style.zIndex = '0';
            }
            
            if (playerContainer) {
              playerContainer.style.position = 'fixed';
              playerContainer.style.top = '0';
              playerContainer.style.left = '0';
              playerContainer.style.width = '100vw';
              playerContainer.style.height = '100vh';
              playerContainer.style.overflow = 'hidden';
              playerContainer.style.zIndex = '0';
            }
          };
          
          // Initial styling
          makeVideoFullscreen();
          
          // Listen for resize events
          window.addEventListener('resize', makeVideoFullscreen);
          
          // Listen for video play events
          const video = document.querySelector('video') || document.querySelector('#chat-player_html5_api');
          if (video) {
            video.addEventListener('playing', () => {
              window.ipcRenderer && window.ipcRenderer.sendToHost('video-played');
              window.postMessage({ type: 'video-played' }, '*');
              makeVideoFullscreen(); // Ensure fullscreen when video starts
            });
            video.addEventListener('play', () => {
              window.ipcRenderer && window.ipcRenderer.sendToHost('video-played');
              window.postMessage({ type: 'video-played' }, '*');
              makeVideoFullscreen(); // Ensure fullscreen when video starts
            });
            video.addEventListener('loadedmetadata', makeVideoFullscreen);
          }
          
          // Handle dynamic content changes
          const observer = new MutationObserver(makeVideoFullscreen);
          observer.observe(document.body, { childList: true, subtree: true });
          
          // Periodic check to ensure video stays fullscreen
          setInterval(makeVideoFullscreen, 2000);
          
          console.log('Styles injected successfully for ${username}');
        } catch (e) {
          console.error('Injection error:', e);
        }
      })();
    `;

    webview.executeJavaScript(script).catch(console.error);
  }, [index, webviewRefs, username, isFullViewMode]);

  // Simulate loading progress and stream metrics
  useEffect(() => {
    if (isLoading) {
      loadingIntervalRef.current = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 100) {
            setIsLoading(false);
            return 100;
          }
          return prev + Math.random() * 15;
        });

        // Simulate viewer count
        setViewerCount(Math.floor(Math.random() * 1000) + 100);

        // Simulate additional metrics for professional mode
        setLikes(Math.floor(Math.random() * 500) + 50);
        setMessages(Math.floor(Math.random() * 200) + 20);
        setFollowers(Math.floor(Math.random() * 5000) + 500);

        // Simulate stream quality based on bandwidth mode
        if (bandwidthMode === 'low') {
          setStreamQuality("480p");
        } else if (bandwidthMode === 'medium') {
          const qualities = ["480p", "720p"];
          setStreamQuality(qualities[Math.floor(Math.random() * qualities.length)]);
        } else {
          const qualities = ["720p", "1080p", "4K"];
          setStreamQuality(qualities[Math.floor(Math.random() * qualities.length)]);
        }
      }, 300);
    } else {
      if (loadingIntervalRef.current) {
        clearInterval(loadingIntervalRef.current);
      }
    }

    return () => {
      if (loadingIntervalRef.current) {
        clearInterval(loadingIntervalRef.current);
      }
    };
  }, [isLoading, bandwidthMode]);

  // Setup listener for video-play event from webview
  useEffect(() => {
    const webview = webviewRefs.current[index];
    if (!webview) return;

    const onIpc = (event: any) => {
      if (event.channel === "video-played") {
        setHasVideoStarted(true);
        setIsLoading(false);
        onVideoPlay(index);
      }
    };

    webview.addEventListener("ipc-message", onIpc);
    return () => {
      webview.removeEventListener("ipc-message", onIpc);
    };
  }, [index, onVideoPlay, webviewRefs]);

  // Persistent injection - inject on dom-ready and periodically
  useEffect(() => {
    const webview = webviewRefs.current[index];
    if (!webview) return;

    const injectOnDomReady = () => {
      setTimeout(() => {
        injectStyles();
      }, 500);
    };

    webview.addEventListener("dom-ready", injectOnDomReady);

    // Also inject periodically to ensure persistence
    injectionIntervalRef.current = setInterval(() => {
      injectStyles();
    }, 5000);

    return () => {
      webview.removeEventListener("dom-ready", injectOnDomReady);
      if (injectionIntervalRef.current) {
        clearInterval(injectionIntervalRef.current);
      }
    };
  }, [index, webviewRefs, injectStyles]);

  // Auto hide thumbnail after 5 seconds even if no video playback
  useEffect(() => {
    const timeout = setTimeout(() => setThumbTimeoutPassed(true), 5000);
    return () => clearTimeout(timeout);
  }, []);

  // If this is a drag overlay, render a simplified version
  if (dragOverlay) {
    return (
      <div className="aspect-video p-1 rounded-md border border-cyan-500 bg-neutral-800 opacity-90 shadow-lg">
        <div className="flex items-center justify-center h-full">
          <span className="text-cyan-400 font-medium">{username}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${isFullViewMode ? 'w-full h-full' : gridMode === 'professional' ? 'h-full min-h-0' : 'aspect-video'} p-1 relative overflow-hidden rounded-md border border-neutral-700 bg-neutral-800 group`}
    >
      {/* Username badge as drag handle */}
      <div
        {...dragHandleProps}
        className={`absolute top-1 right-1 bg-cyan-600 text-white text-xs font-semibold px-1 py-0.5 rounded-l select-none z-10 flex items-center gap-1 ${isDragging ? "opacity-80" : "opacity-100"
          }`}
        title="Drag to reorder"
      >
        <GripVertical size={10} />
        {username}
      </div>

      {/* Professional Mode - Industry Level Details */}
      {gridMode === 'professional' && !isFullViewMode && (
        <>
          {/* Top Stats Bar */}
          <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-1 z-10">
            <div className="flex items-center justify-between text-white text-xs">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${isPlaying ? "bg-green-500" : "bg-red-500"}`} />
                  <span className="font-medium">{streamQuality}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users size={10} />
                  <span>{viewerCount.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <ThumbsUp size={10} />
                  <span>{likes.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare size={10} />
                  <span>{messages.toLocaleString()}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <UserCheck size={10} />
                <span>{followers.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Bottom Engagement Bar */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-1 z-10">
            <div className="flex items-center justify-between text-white text-xs">
              <div className="flex items-center gap-1">
                <span className="font-medium">{username}</span>
                <span className="text-neutral-300">• Live</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-neutral-300">Engagement:</span>
                <span className="text-green-400 font-medium">
                  {Math.round((likes + messages) / Math.max(viewerCount, 1) * 100)}%
                </span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Standard Mode - Simple Status Badge */}
      {gridMode === 'standard' && !isFullViewMode && (
        <div className="absolute top-1 left-1 bg-black/60 text-white text-xs px-1 py-0.5 rounded z-10 flex items-center gap-1">
          <div className={`w-1.5 h-1.5 rounded-full ${isPlaying ? "bg-green-500" : "bg-red-500"}`} />
          <span>{streamQuality}</span>
          <span>•</span>
          <span>{viewerCount}</span>
        </div>
      )}

      {/* Loading progress bar */}
      {isLoading && (
        <div className="absolute top-0 left-0 w-full h-1 bg-neutral-700 z-10">
          <div
            className="h-full bg-cyan-500 transition-all duration-300"
            style={{ width: `${loadingProgress}%` }}
          />
        </div>
      )}

      {/* Thumbnail */}
      {showThumbnail && (
        <img
          src={thumb}
          alt={`Thumbnail for ${username}`}
          className="absolute top-0 left-0 w-full h-full object-cover z-0 transition-opacity duration-700 ease-in-out"
          style={{ opacity: showThumbnail ? 1 : 0 }}
          draggable={false}
        />
      )}

      {/* Webview */}
      <webview
        ref={(el) => {
          if (el) webviewRefs.current[index] = el;
        }}
        src={url}
        className="w-full h-full z-10 rounded-md"
        style={{
          minWidth: 0,
          minHeight: 0,
          opacity: showThumbnail ? 0 : 1,
          transition: "opacity 0.7s ease-in-out",
          backgroundColor: "black",
        }}
        preload=""
      />

      {/* Stream Controls */}
      <StreamControls
        isMuted={isMuted}
        onToggleMute={() => onToggleMute(index)}
        isFavorite={isFavorite}
        onToggleFavorite={() => onToggleFavorite(index)}
        onSnapshot={() => onSnapshot(index)}
        onFullscreen={() => onFullscreen(index)}
        onPiP={() => onPiP(index)}
        isPlaying={isPlaying}
        onFullView={onFullView}
      />
    </div>
  );
}

/**
 * Fullscreen Modal Component
 */
function FullscreenModal({
  isOpen,
  onClose,
  streamUrl,
  streamUsername
}: {
  isOpen: boolean;
  onClose: () => void;
  streamUrl: string;
  streamUsername: string;
}) {
  const webviewRef = useRef<HTMLWebViewElement | null>(null);

  useEffect(() => {
    if (isOpen && webviewRef.current) {
      const injectScript = () => {
        const script = `
          (function() {
            try {
              // Hide UI elements
              document.body.style.backgroundColor = 'black';
              document.body.style.margin = '0';
              document.body.style.padding = '0';
              document.body.style.overflow = 'hidden';
              [
                '#header', '.footer-holder', '.RoomSignupPopup', '#roomTabs',
                '.playerTitleBar', '.genderTabs', '#TheaterModePlayer > div:nth-child(8)',
                '.video-overlay', '.video-controls', '.chat-container', '.chat-panel',
                '.bio-section', '.tip-menu', '.tip-button', '.header-container'
              ].forEach(sel => {
                const el = document.querySelector(sel);
                if (el) el.style.display = 'none';
              });

              // Style video player to fill entire viewport
              const makeVideoFullscreen = () => {
                const video = document.querySelector('video') || document.querySelector('#chat-player_html5_api');
                const videoDiv = document.querySelector('.videoPlayerDiv');
                const playerContainer = document.querySelector('.player-container');
                
                if (video) {
                  video.style.position = 'fixed';
                  video.style.top = '0';
                  video.style.left = '0';
                  video.style.width = '100vw';
                  video.style.height = '100vh';
                  video.style.objectFit = 'cover';
                  video.style.zIndex = '1';
                }
                
                if (videoDiv) {
                  videoDiv.style.position = 'fixed';
                  videoDiv.style.top = '0';
                  videoDiv.style.left = '0';
                  videoDiv.style.width = '100vw';
                  videoDiv.style.height = '100vh';
                  videoDiv.style.overflow = 'hidden';
                  videoDiv.style.background = 'black';
                  videoDiv.style.zIndex = '0';
                }
                
                if (playerContainer) {
                  playerContainer.style.position = 'fixed';
                  playerContainer.style.top = '0';
                  playerContainer.style.left = '0';
                  playerContainer.style.width = '100vw';
                  playerContainer.style.height = '100vh';
                  playerContainer.style.overflow = 'hidden';
                  playerContainer.style.zIndex = '0';
                }
              };
              
              // Initial styling
              makeVideoFullscreen();
              
              // Listen for resize events
              window.addEventListener('resize', makeVideoFullscreen);
              
              // Periodic check to ensure video stays fullscreen
              setInterval(makeVideoFullscreen, 2000);
            } catch (e) {
              console.error('Injection error:', e);
            }
          })();
        `;

        setTimeout(() => {
          webviewRef.current?.executeJavaScript(script).catch(console.error);
        }, 300);
      };

      webviewRef.current.addEventListener("dom-ready", injectScript);
      return () => {
        webviewRef.current?.removeEventListener("dom-ready", injectScript);
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="bg-neutral-800 text-white p-2 flex justify-between items-center">
        <h2 className="text-lg font-semibold">{streamUsername}</h2>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-neutral-700 transition-colors"
        >
          <X size={20} />
        </button>
      </div>
      <div className="flex-1 relative">
        <webview
          ref={webviewRef}
          src={streamUrl}
          className="w-full h-full"
          style={{
            backgroundColor: "black",
          }}
          preload=""
        />
      </div>
    </div>
  );
}

// =============== MAIN COMPONENT ====================

function HomePage() {
  const webviewRefs = useRef<(HTMLWebViewElement | null)[]>([]);
  const [streamUrls, setStreamUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [gridSize, setGridSize] = useState(2); // Default 2x2 grid
  const [autoMode, setAutoMode] = useState(false); // Default to manual mode
  const [activeId, setActiveId] = useState<string | null>(null);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [fullViewMode, setFullViewMode] = useState<number | null>(null);
  const [bandwidthMode, setBandwidthMode] = useState<'low' | 'medium' | 'high'>('medium');
  const [showOffline, setShowOffline] = useState(true);
  const [gridMode, setGridMode] = useState<'standard' | 'professional'>('standard');
  const [showBrowser, setShowBrowser] = useState(true); // Browser open by default
  const [browserExpanded, setBrowserExpanded] = useState(false); // Browser not expanded by default

  // Database service
  const [dbService] = useState(() => new DatabaseService());
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [streamStatus, setStreamStatus] = useState<Record<number, { online: boolean; lastSeen: number }>>({});

  // Metrics state
  const [sessionTime, setSessionTime] = useState(0);
  const [bandwidth, setBandwidth] = useState(0);
  const [latency, setLatency] = useState(0);
  const [resolution, setResolution] = useState("1920x1080");
  const screenFps = useFPSMonitor();

  // Stream controls state
  const [mutedStreams, setMutedStreams] = useState<Set<number>>(new Set());
  const [playingStreams, setPlayingStreams] = useState<Set<number>>(new Set());

  // Fullscreen modal state
  const [fullscreenStream, setFullscreenStream] = useState<{ url: string; username: string } | null>(null);

  // Track which videos played
  const [playedIndices, setPlayedIndices] = useState<Set<number>>(new Set());

  // Chaturbate browser state
  const [streamers, setStreamers] = useState<Streamer[]>([]);
  const [filteredStreamers, setFilteredStreamers] = useState<Streamer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshInterval, setRefreshInterval] = useState(10);
  const [isAnimatedMode, setIsAnimatedMode] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [isThumbsLoading, setIsThumbsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'limited'>('connected');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [duplicateUsernames, setDuplicateUsernames] = useState<Set<string>>(new Set());
  const [hoveredRoom, setHoveredRoom] = useState<string | null>(null);
  const [favoritesUsernames, setFavoritesUsernames] = useState<Set<string>>(new Set());
  const [showSpotlight, setShowSpotlight] = useState(false);
  const [spotlightStreamer, setSpotlightStreamer] = useState<Streamer | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('num_users');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Browser width state
  const [browserWidth, setBrowserWidth] = useState(320);
  const { isResizing, startResizing } = useResizable(browserWidth, 280, 600);
  
  // Ref for infinite scroll
  const browserContainerRef = useRef<HTMLElement>(null);

  // Custom hooks for Chaturbate browser
  const { robustFetch, metrics: fetchMetrics } = useRobustFetch();
  const { animations, startAnimation, stopAnimation, toggleAnimation, setAnimationSpeed, getCurrentFrame } = useRoomAnimation();
  const { addToQueue, getThumbnail, activeRequests } = useParallelThumbnailFetch();
  const { notifications, addNotification, removeNotification } = useNotifications();

  // Filters for Chaturbate browser
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

  // Refs
  const thumbRefreshInterval = useRef<NodeJS.Timeout | null>(null);
  const roomListRefreshInterval = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Initialize database and load saved data
  useEffect(() => {
    const initDb = async () => {
      await dbService.init();

      // Load favorites
      const savedFavorites = await dbService.getFavorites();
      setFavorites(new Set(savedFavorites));

      // Load settings
      const savedSettings = await dbService.getSettings();
      setGridSize(savedSettings.gridSize || 2);
      setSidebarVisible(savedSettings.sidebarVisible !== false);
      setSidebarCollapsed(savedSettings.sidebarCollapsed || false);
      setBandwidthMode(savedSettings.bandwidthMode || 'medium');
      setAutoMode(savedSettings.autoMode || false);
      setFullViewMode(savedSettings.fullViewMode || null);
      setShowOffline(savedSettings.showOffline !== false);
      setGridMode(savedSettings.gridMode || 'standard');
      setShowBrowser(savedSettings.browserOpen !== false); // Browser open by default
      setBrowserWidth(savedSettings.browserWidth || 320);
      setBrowserExpanded(savedSettings.browserExpanded || false);

      // Load stream status
      const savedStatus = await dbService.getStreamStatus();
      setStreamStatus(savedStatus);

      // Load removed streams
      const removedStreams = await dbService.getRemovedStreams();
    };

    initDb();
  }, [dbService]);

  // Save settings when they change
  useEffect(() => {
    const saveSettings = async () => {
      await dbService.setSettings({
        gridSize,
        sidebarVisible,
        sidebarCollapsed,
        bandwidthMode,
        autoMode,
        fullViewMode,
        showOffline,
        gridMode,
        browserOpen: showBrowser,
        browserWidth,
        browserExpanded
      });
    };

    saveSettings();
  }, [gridSize, sidebarVisible, sidebarCollapsed, bandwidthMode, autoMode, fullViewMode, showOffline, gridMode, showBrowser, browserWidth, browserExpanded, dbService]);

  // Save favorites when they change
  useEffect(() => {
    const saveFavorites = async () => {
      await dbService.setFavorites(Array.from(favorites));
    };

    saveFavorites();
  }, [favorites, dbService]);

  // Save stream status when it changes
  useEffect(() => {
    const saveStreamStatus = async () => {
      await dbService.setStreamStatus(streamStatus);
    };

    saveStreamStatus();
  }, [streamStatus, dbService]);

  // Save view arrangement when it changes
  useEffect(() => {
    const saveViewArrangement = async () => {
      await dbService.setViewArrangement({
        type: fullViewMode !== null ? 'full' : 'grid',
        gridSize,
        fullViewMode,
        streamOrder: streamUrls
      });
    };

    saveViewArrangement();
  }, [fullViewMode, gridSize, streamUrls, dbService]);

  // Load stream URLs
  useEffect(() => {
    const loadStreams = async () => {
      try {
        // Load default streams
        const defaultStreams = await fetch("./streams.json").then(res => res.json());

        // Load custom streams
        const customStreams = await dbService.getCustomStreams();

        // Load removed streams
        const removedStreams = await dbService.getRemovedStreams();

        // Load saved view arrangement
        const viewArrangement = await dbService.getViewArrangement();

        // Combine streams and filter out removed ones
        let allStreams = [...defaultStreams, ...customStreams].filter(url => !removedStreams.includes(url));

        // Use saved order if available
        if (viewArrangement.streamOrder && viewArrangement.streamOrder.length > 0) {
          // Filter out streams that are no longer available or removed
          const availableStreams = allStreams.filter(url =>
            viewArrangement.streamOrder.includes(url) && !removedStreams.includes(url)
          );

          // Add any new streams that weren't in the saved order
          const newStreams = allStreams.filter(url =>
            !viewArrangement.streamOrder.includes(url) && !removedStreams.includes(url)
          );

          setStreamUrls([...availableStreams, ...newStreams]);
        } else {
          setStreamUrls(allStreams);
        }
      } catch (e) {
        console.error("Failed to load stream URLs", e);
      } finally {
        setLoading(false);
      }
    };

    loadStreams();
  }, [dbService]);

  // Update session timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Simulate bandwidth and latency metrics
  useEffect(() => {
    const metricsTimer = setInterval(() => {
      // Adjust bandwidth based on mode
      let baseBandwidth = 5;
      if (bandwidthMode === 'low') {
        baseBandwidth = 2;
      } else if (bandwidthMode === 'high') {
        baseBandwidth = 10;
      }

      setBandwidth(baseBandwidth + Math.random() * 2);
      setLatency(Math.floor(Math.random() * 50) + 10);
      const resolutions = ["1920x1080", "1280x720", "3840x2160"];
      setResolution(resolutions[Math.floor(Math.random() * resolutions.length)]);
    }, 2000);
    return () => clearInterval(metricsTimer);
  }, [bandwidthMode]);

  // Simulate playing streams and update status
  useEffect(() => {
    const playingTimer = setInterval(() => {
      const newPlaying = new Set<number>();
      const newStatus = { ...streamStatus };

      streamUrls.forEach((_, index) => {
        const isPlaying = Math.random() > 0.3;
        if (isPlaying) {
          newPlaying.add(index);
          newStatus[index] = { online: true, lastSeen: Date.now() };
        } else {
          if (newStatus[index]) {
            newStatus[index].online = false;
          }
        }
      });

      setPlayingStreams(newPlaying);
      setStreamStatus(newStatus);
    }, 5000);
    return () => clearInterval(playingTimer);
  }, [streamUrls, streamStatus]);

  // Chaturbate browser functions
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
        
        // Append new streamers to existing ones for pagination
        if (page === 1) {
          setStreamers(data.rooms || []);
        } else {
          setStreamers(prev => [...prev, ...(data.rooms || [])]);
        }
        
        setLastRefresh(new Date());
        setTotalPages(Math.ceil(data.total_count / ROOMS_PER_PAGE));
        setHasMore(data.rooms.length === ROOMS_PER_PAGE && page < totalPages);
        setError(null);

        // Add all usernames to thumbnail queue
        addToQueue(data.rooms.map(room => room.username));
      } else {
        // Only update thumbnails for existing rooms
        setLastRefresh(new Date());

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
  }, [currentPage, streamers.length, totalPages, robustFetch, addToQueue, addNotification]);

  // Load more streamers for pagination
  const handleLoadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      setCurrentPage(prev => prev + 1);
    }
  }, [isLoading, hasMore]);

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

  // Initial fetch for Chaturbate browser
  useEffect(() => {
    if (showBrowser) {
      fetchStreamers();
    }

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (thumbRefreshInterval.current) clearInterval(thumbRefreshInterval.current);
      if (roomListRefreshInterval.current) clearInterval(roomListRefreshInterval.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [showBrowser, fetchStreamers]);

  // Fetch more streamers when page changes
  useEffect(() => {
    if (currentPage > 1) {
      fetchStreamers(false, currentPage);
    }
  }, [currentPage, fetchStreamers]);

  // Set up refresh intervals for Chaturbate browser
  useEffect(() => {
    if (!showBrowser) return;

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
  }, [showBrowser, isAnimatedMode, refreshInterval, fetchStreamers]);

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

  // Chaturbate browser event handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchStreamers(false, page);
  };

  const handleRefresh = () => {
    setCurrentPage(1);
    fetchStreamers();
  };

  const handleIntervalChange = (interval: number) => {
    setRefreshInterval(interval);
    setIsAnimatedMode(false);
  };

  const toggleAnimatedMode = () => {
    setIsAnimatedMode(!isAnimatedMode);
    if (!isAnimatedMode) {
      addNotification('info', 'Live Mode', 'Live mode activated. Thumbnails will refresh more frequently.');
    }
  };

  const handleFilterChange = (key: keyof Filters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleTagFilter = (tag: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

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

  const handleRoomHover = (username: string) => {
    setHoveredRoom(username);
    fetchRoomThumb(username);

    // Start animation if auto-play is enabled
    const animation = animations.get(username);
    if (animation && animation.frames.length > 1 && !animation.isPlaying) {
      startAnimation(username, animation.frames, 1);
    }
  };

  const handleRoomLeave = () => {
    setHoveredRoom(null);
  };

  const toggleFavoriteUsername = (username: string) => {
    setFavoritesUsernames(prev => {
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

  const openSpotlight = (streamer: Streamer) => {
    setSpotlightStreamer(streamer);
    setShowSpotlight(true);

    // Start animation for this room
    const animation = animations.get(streamer.username);
    if (animation && animation.frames.length > 0) {
      startAnimation(streamer.username, animation.frames, 1);
    }
  };

  const closeSpotlight = () => {
    setShowSpotlight(false);

    // Stop animation for this room
    if (spotlightStreamer) {
      stopAnimation(spotlightStreamer.username);
    }
  };

  const addStreamerToGrid = (streamer: Streamer) => {
    const url = `https://chaturbate.com/${streamer.username}`;
    
    // Check if the stream already exists
    if (streamUrls.includes(url)) {
      addNotification('warning', 'Duplicate Stream', `${streamer.username} is already in your grid.`);
      return;
    }
    
    setStreamUrls(prev => [...prev, url]);

    // Save to custom streams
    dbService.getCustomStreams().then(customStreams => {
      dbService.setCustomStreams([...customStreams, url]);
    });
  };

  // Handle browser width change
  const handleBrowserWidthChange = useCallback((width: number) => {
    setBrowserWidth(width);
    // Save to settings
    dbService.getSettings().then(settings => {
      dbService.setSettings({ ...settings, browserWidth: width });
    });
  }, [dbService]);

  // Toggle browser expanded state
  const toggleBrowserExpanded = useCallback(() => {
    setBrowserExpanded(prev => !prev);
    // Save to settings
    dbService.getSettings().then(settings => {
      dbService.setSettings({ ...settings, browserExpanded: !browserExpanded });
    });
  }, [browserExpanded, dbService]);

  // Main stream viewer functions
  const handleVideoPlay = (idx: number) => {
    setPlayedIndices((prev) => {
      const newSet = new Set(prev);
      newSet.add(idx);
      return newSet;
    });
    setPlayingStreams(prev => {
      const newSet = new Set(prev);
      newSet.add(idx);
      return newSet;
    });

    // Update stream status
    setStreamStatus(prev => ({
      ...prev,
      [idx]: { online: true, lastSeen: Date.now() }
    }));
  };

  const handleToggleFavorite = (idx: number) => {
    setFavorites(prev => {
      const newSet = new Set(prev);
      if (newSet.has(idx)) {
        newSet.delete(idx);
      } else {
        newSet.add(idx);
      }
      return newSet;
    });
  };

  const handleToggleMute = (idx: number) => {
    setMutedStreams(prev => {
      const newSet = new Set(prev);
      if (newSet.has(idx)) {
        newSet.delete(idx);
      } else {
        newSet.add(idx);
      }
      return newSet;
    });
  };

  const handleSnapshot = (idx: number) => {
    // In a real implementation, this would capture the current frame
    console.log(`Snapshot taken for stream ${idx}`);
  };

  const handleFullscreen = (idx: number) => {
    const url = streamUrls[idx];
    const username = url.match(/chaturbate\.com\/([^/]+)/)?.[1] ?? "unknown";
    setFullscreenStream({ url, username });
  };

  const handlePiP = (idx: number) => {
    // In a real implementation, this would enable picture-in-picture mode
    console.log(`PiP enabled for stream ${idx}`);
  };

  const handleFocusStream = (idx: number) => {
    // Focus on a specific stream when clicked in the sidebar
    const element = document.getElementById(`stream-${idx}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Add a highlight effect
      element.classList.add('ring-2', 'ring-cyan-500');
      setTimeout(() => {
        element.classList.remove('ring-2', 'ring-cyan-500');
      }, 2000);
    }
  };

  const handleFullscreenStream = (idx: number) => {
    setFullViewMode(idx);
  };

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleAddStream = async (url: string) => {
    // Check if the stream already exists
    if (streamUrls.includes(url)) {
      addNotification('warning', 'Duplicate Stream', 'This stream is already in your grid.');
      return;
    }
    
    // Add the new stream to the list
    setStreamUrls(prev => [...prev, url]);

    // Save to custom streams
    const customStreams = await dbService.getCustomStreams();
    await dbService.setCustomStreams([...customStreams, url]);
  };

  const handleRemoveStream = async (index: number) => {
    const urlToRemove = streamUrls[index];

    // Remove from the list
    setStreamUrls(prev => prev.filter((_, i) => i !== index));

    // Remove from storage using the database service
    await dbService.removeStream(urlToRemove);
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text.trim()) {
        handleAddStream(text.trim());
      }
    } catch (err) {
      console.error('Failed to read clipboard:', err);
    }
  };

  // Handle paste from clipboard with Ctrl+V
  useClipboardMonitor(handlePasteFromClipboard);

  // Custom collision detection for better drag and drop
  const customCollisionDetection: CollisionDetection = (args) => {
    // First check for pointer intersection
    const pointerIntersections = pointerWithin(args);
    if (pointerIntersections.length > 0) {
      return pointerIntersections;
    }

    // Fall back to rect intersection
    return rectIntersection(args);
  };

  // Improved sensors for better drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Minimum distance to start dragging
      },
    })
  );

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    setActiveId(null);

    if (active.id !== over?.id) {
      const oldIndex = streamUrls.findIndex((url) => url === active.id);
      const newIndex = streamUrls.findIndex((url) => url === over.id);

      // Create a new array with the reordered items
      const newStreamUrls = arrayMove(streamUrls, oldIndex, newIndex);
      setStreamUrls(newStreamUrls);

      // Save the new order to the database
      dbService.setViewArrangement({
        type: fullViewMode !== null ? 'full' : 'grid',
        gridSize,
        fullViewMode,
        streamOrder: newStreamUrls
      });
    }
  };

  // Calculate optimal grid layout for auto mode
  const calculateOptimalGrid = useCallback(() => {
    if (!autoMode) return { columns: gridSize, rows: gridSize };

    const streamCount = streamUrls.length;
    if (streamCount === 0) return { columns: 1, rows: 1 };

    // For 2x2 grid (which works well)
    if (streamCount <= 4) {
      return { columns: 2, rows: 2 };
    }

    // For 3x3 grid
    if (streamCount <= 9) {
      return { columns: 3, rows: 3 };
    }

    // For 4x4 grid
    if (streamCount <= 16) {
      return { columns: 4, rows: 4 };
    }

    // For more streams, calculate based on screen aspect ratio
    const screenRatio = window.innerWidth / window.innerHeight;
    let columns = Math.ceil(Math.sqrt(streamCount));
    let rows = Math.ceil(streamCount / columns);

    // Adjust for wide screens
    if (screenRatio > 1.5) {
      columns = Math.min(columns + 1, streamCount);
      rows = Math.ceil(streamCount / columns);
    }

    // Adjust for tall screens
    if (screenRatio < 0.8) {
      rows = Math.min(rows + 1, streamCount);
      columns = Math.ceil(streamCount / rows);
    }

    // Ensure we don't exceed reasonable limits
    columns = Math.min(Math.max(columns, 1), 6);
    rows = Math.min(Math.max(rows, 1), 6);

    return { columns, rows };
  }, [autoMode, gridSize, streamUrls.length]);

  const gridLayout = useMemo(() => calculateOptimalGrid(), [calculateOptimalGrid]);

  // Prepare stream data for sidebar
  const streamData = useMemo(() => {
    return streamUrls.map((url, index) => {
      const username = url.match(/chaturbate\.com\/([^/]+)/)?.[1] ?? "unknown";
      const thumb = `https://jpeg.live.mmcdn.com/stream?room=${username}`;
      const status = streamStatus[index] || { online: false, lastSeen: 0 };
      return {
        url,
        username,
        thumb,
        isPlaying: playingStreams.has(index),
        viewerCount: Math.floor(Math.random() * 1000) + 100,
        online: status.online,
        lastSeen: status.lastSeen
      };
    });
  }, [streamUrls, playingStreams, streamStatus]);

  // Add custom scrollbar styles
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .custom-scrollbar::-webkit-scrollbar {
        width: 4px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.1);
        border-radius: 2px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.2);
        border-radius: 2px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.3);
      }
      .custom-scrollbar-horizontal::-webkit-scrollbar {
        height: 4px;
      }
      .custom-scrollbar-horizontal::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.1);
        border-radius: 2px;
      }
      .custom-scrollbar-horizontal::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.2);
        border-radius: 2px;
      }
      .custom-scrollbar-horizontal::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.3);
      }
      .professional-grid {
        display: grid;
        gap: 0.25rem;
        padding: 0.25rem;
        height: 100%;
        overflow: hidden;
      }
      @media (min-width: 768px) {
        .professional-grid {
          gap: 0.5rem;
          padding: 0.5rem;
        }
      }
      @media (min-width: 1024px) {
        .professional-grid {
          gap: 0.75rem;
          padding: 0.75rem;
        }
      }
      @media (min-width: 1280px) {
        .professional-grid {
          gap: 1rem;
          padding: 1rem;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Render content based on state
  const renderContent = () => {
    if (loading) {
      return <div className="text-center p-4 text-white">Loading...</div>;
    }

    // If in full view mode, show the selected stream in full view
    if (fullViewMode !== null) {
      const selectedStream = streamUrls[fullViewMode];
      const username = selectedStream?.match(/chaturbate\.com\/([^/]+)/)?.[1] ?? "unknown";

      return (
        <div className="flex flex-col h-screen w-screen overflow-hidden bg-neutral-900 text-white">
          {/* Compact Toolbar */}
          <CompactToolbar
            sessionTime={sessionTime}
            bandwidth={bandwidth}
            latency={latency}
            gridSize={gridSize}
            setGridSize={setGridSize}
            autoMode={autoMode}
            setAutoMode={setAutoMode}
            screenFps={screenFps}
            resolution={resolution}
            toggleSidebar={toggleSidebar}
            sidebarVisible={sidebarVisible}
            sidebarCollapsed={sidebarCollapsed}
            bandwidthMode={bandwidthMode}
            setBandwidthMode={setBandwidthMode}
            fullViewMode={fullViewMode}
            setFullViewMode={setFullViewMode}
            gridMode={gridMode}
            setGridMode={setGridMode}
            showBrowser={showBrowser}
            setShowBrowser={setShowBrowser}
            fetchMetrics={fetchMetrics}
          />
          <div className="flex flex-1 overflow-hidden">
            {/* Stream Browser Sidebar */}
            <StreamBrowserSidebar
              visible={showBrowser}
              onClose={() => setShowBrowser(false)}
              onAddStream={addStreamerToGrid}
              streamers={streamers}
              filteredStreamers={filteredStreamers}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filters={filters}
              setFilters={handleFilterChange}
              allTags={allTags}
              toggleTagFilter={toggleTagFilter}
              clearFilters={clearFilters}
              isLoading={isLoading}
              error={error}
              handleRefresh={handleRefresh}
              isAnimatedMode={isAnimatedMode}
              toggleAnimatedMode={toggleAnimatedMode}
              refreshInterval={refreshInterval}
              handleIntervalChange={handleIntervalChange}
              connectionStatus={connectionStatus}
              lastRefresh={lastRefresh}
              fetchMetrics={fetchMetrics}
              width={browserWidth}
              isResizing={isResizing}
              startResizing={startResizing}
              onWidthChange={handleBrowserWidthChange}
              expanded={browserExpanded}
              onToggleExpanded={toggleBrowserExpanded}
              currentPage={currentPage}
              totalPages={totalPages}
              hasMore={hasMore}
              handleLoadMore={handleLoadMore}
              containerRef={browserContainerRef}
            />

            {/* Main Sidebar */}
            <Sidebar
              streams={streamData}
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
              onFocusStream={handleFocusStream}
              visible={sidebarVisible}
              collapsed={sidebarCollapsed}
              onToggleCollapse={toggleSidebarCollapse}
              onAddStream={handleAddStream}
              onRemoveStream={handleRemoveStream}
              showOffline={showOffline}
              onPasteFromClipboard={handlePasteFromClipboard}
              onFullscreenStream={handleFullscreenStream}
              showBrowser={showBrowser}
              setShowBrowser={setShowBrowser}
            />

            {/* Main Content */}
            <div className="flex-1 overflow-hidden flex flex-col">
              {/* Full View Stream */}
              <div className="flex-1 relative">
                <SortableWebview
                  id={selectedStream}
                  url={selectedStream}
                  index={fullViewMode}
                  webviewRefs={webviewRefs}
                  onVideoPlay={handleVideoPlay}
                  onSnapshot={handleSnapshot}
                  onToggleFavorite={handleToggleFavorite}
                  isFavorite={favorites.has(fullViewMode)}
                  onToggleMute={handleToggleMute}
                  isMuted={mutedStreams.has(fullViewMode)}
                  onFullscreen={handleFullscreen}
                  onPiP={handlePiP}
                  isPlaying={playingStreams.has(fullViewMode)}
                  isDragging={false}
                  dragOverlay={false}
                  onFullView={() => setFullViewMode(null)}
                  bandwidthMode={bandwidthMode}
                  isFullViewMode={true}
                  gridMode={gridMode}
                />
              </div>

              {/* Minimized Streams */}
              <div className="h-16 bg-neutral-800 border-t border-neutral-700 p-1 flex gap-1 overflow-x-auto custom-scrollbar-horizontal">
                {streamUrls.map((url, index) => {
                  if (index === fullViewMode) return null;
                  const username = url.match(/chaturbate\.com\/([^/]+)/)?.[1] ?? "unknown";
                  const thumb = `https://jpeg.live.mmcdn.com/stream?room=${username}`;

                  return (
                    <MinimizedStream
                      key={`${url}-${index}`}
                      stream={{ url, username, thumb }}
                      index={index}
                      onRestore={() => setFullViewMode(index)}
                      isPlaying={playingStreams.has(index)}
                    />
                  );
                })}
              </div>
            </div>
          </div>
          {/* Fullscreen Modal */}
          {fullscreenStream && (
            <FullscreenModal
              isOpen={!!fullscreenStream}
              onClose={() => setFullscreenStream(null)}
              streamUrl={fullscreenStream.url}
              streamUsername={fullscreenStream.username}
            />
          )}
          {/* Notifications */}
          <div className="fixed bottom-4 right-4 space-y-2 z-50">
            {notifications.map(notification => (
              <div
                key={notification.id}
                className={`p-2 rounded-lg shadow-lg max-w-sm ${notification.type === 'error' ? 'bg-red-900 bg-opacity-80' :
                    notification.type === 'warning' ? 'bg-yellow-900 bg-opacity-80' :
                      notification.type === 'success' ? 'bg-green-900 bg-opacity-80' :
                        'bg-blue-900 bg-opacity-80'
                  } text-white`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-xs">{notification.title}</h4>
                    <p className="text-xs mt-1">{notification.message}</p>
                  </div>
                  <button
                    onClick={() => removeNotification(notification.id)}
                    className="ml-2 text-white hover:text-gray-300"
                  >
                    <X size={12} />
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
                        onClick={() => toggleFavoriteUsername(spotlightStreamer.username)}
                        className={`p-2 rounded-lg ${favoritesUsernames.has(spotlightStreamer.username) ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-opacity-70'}`}
                      >
                        <Heart size={16} fill={favoritesUsernames.has(spotlightStreamer.username) ? 'currentColor' : 'none'} />
                      </button>
                      <button
                        onClick={() => addStreamerToGrid(spotlightStreamer)}
                        className="p-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-all"
                      >
                        <Plus size={16} />
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
          )}
        </div>
      )
    }

    // Normal grid view
    return (
      <div className="flex flex-col h-screen w-screen overflow-hidden bg-neutral-900 text-white">
        {/* Compact Toolbar */}
        <CompactToolbar
          sessionTime={sessionTime}
          bandwidth={bandwidth}
          latency={latency}
          gridSize={gridSize}
          setGridSize={setGridSize}
          autoMode={autoMode}
          setAutoMode={setAutoMode}
          screenFps={screenFps}
          resolution={resolution}
          toggleSidebar={toggleSidebar}
          sidebarVisible={sidebarVisible}
          sidebarCollapsed={sidebarCollapsed}
          bandwidthMode={bandwidthMode}
          setBandwidthMode={setBandwidthMode}
          fullViewMode={fullViewMode}
          setFullViewMode={setFullViewMode}
          gridMode={gridMode}
          setGridMode={setGridMode}
          showBrowser={showBrowser}
          setShowBrowser={setShowBrowser}
          fetchMetrics={fetchMetrics}
        />

        <div className="flex flex-1 overflow-hidden">
          {/* Stream Browser Sidebar */}
          <StreamBrowserSidebar
            visible={showBrowser}
            onClose={() => setShowBrowser(false)}
            onAddStream={addStreamerToGrid}
            streamers={streamers}
            filteredStreamers={filteredStreamers}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filters={filters}
            setFilters={handleFilterChange}
            allTags={allTags}
            toggleTagFilter={toggleTagFilter}
            clearFilters={clearFilters}
            isLoading={isLoading}
            error={error}
            handleRefresh={handleRefresh}
            isAnimatedMode={isAnimatedMode}
            toggleAnimatedMode={toggleAnimatedMode}
            refreshInterval={refreshInterval}
            handleIntervalChange={handleIntervalChange}
            connectionStatus={connectionStatus}
            lastRefresh={lastRefresh}
            fetchMetrics={fetchMetrics}
            width={browserWidth}
            isResizing={isResizing}
            startResizing={startResizing}
            onWidthChange={handleBrowserWidthChange}
            expanded={browserExpanded}
            onToggleExpanded={toggleBrowserExpanded}
            currentPage={currentPage}
            totalPages={totalPages}
            hasMore={hasMore}
            handleLoadMore={handleLoadMore}
            containerRef={browserContainerRef}
          />

          {/* Main Sidebar */}
          <Sidebar
            streams={streamData}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onFocusStream={handleFocusStream}
            visible={sidebarVisible}
            collapsed={sidebarCollapsed}
            onToggleCollapse={toggleSidebarCollapse}
            onAddStream={handleAddStream}
            onRemoveStream={handleRemoveStream}
            showOffline={showOffline}
            onPasteFromClipboard={handlePasteFromClipboard}
            onFullscreenStream={handleFullscreenStream}
            showBrowser={showBrowser}
            setShowBrowser={setShowBrowser}
          />

          {/* Main Content */}
          <div className="flex-1 overflow-hidden">
            <DndContext
              sensors={sensors}
              collisionDetection={customCollisionDetection}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={streamUrls}
                strategy={rectSortingStrategy}
              >
                {gridMode === 'professional' ? (
                  <div
                    className="professional-grid custom-scrollbar"
                    style={{
                      gridTemplateColumns: `repeat(${gridLayout.columns}, minmax(0, 1fr))`,
                      gridTemplateRows: `repeat(${gridLayout.rows}, minmax(0, 1fr))`,
                    }}
                  >
                    {streamUrls.map((url, index) => (
                      <div key={`${url}-${index}`} id={`stream-${index}`} className="h-full min-h-0">
                        <SortableWebview
                          id={url}
                          url={url}
                          index={index}
                          webviewRefs={webviewRefs}
                          onVideoPlay={handleVideoPlay}
                          onSnapshot={handleSnapshot}
                          onToggleFavorite={handleToggleFavorite}
                          isFavorite={favorites.has(index)}
                          onToggleMute={handleToggleMute}
                          isMuted={mutedStreams.has(index)}
                          onFullscreen={handleFullscreen}
                          onPiP={handlePiP}
                          isPlaying={playingStreams.has(index)}
                          isDragging={activeId === url}
                          dragOverlay={false}
                          onFullView={() => setFullViewMode(index)}
                          bandwidthMode={bandwidthMode}
                          isFullViewMode={false}
                          gridMode={gridMode}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    className={`h-full p-1 grid gap-1 custom-scrollbar`}
                    style={{
                      gridTemplateColumns: `repeat(${gridLayout.columns}, minmax(0, 1fr))`,
                      gridAutoRows: "minmax(0, 1fr)",
                      minHeight: 0,
                      overflowY: "auto"
                    }}
                  >
                    {streamUrls.map((url, index) => (
                      <div key={`${url}-${index}`} id={`stream-${index}`}>
                        <SortableWebview
                          id={url}
                          url={url}
                          index={index}
                          webviewRefs={webviewRefs}
                          onVideoPlay={handleVideoPlay}
                          onSnapshot={handleSnapshot}
                          onToggleFavorite={handleToggleFavorite}
                          isFavorite={favorites.has(index)}
                          onToggleMute={handleToggleMute}
                          isMuted={mutedStreams.has(index)}
                          onFullscreen={handleFullscreen}
                          onPiP={handlePiP}
                          isPlaying={playingStreams.has(index)}
                          isDragging={activeId === url}
                          dragOverlay={false}
                          onFullView={() => setFullViewMode(index)}
                          bandwidthMode={bandwidthMode}
                          isFullViewMode={false}
                          gridMode={gridMode}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </SortableContext>

              <DragOverlay>
                {activeId ? (
                  <SortableWebview
                    id={activeId}
                    url={activeId}
                    index={streamUrls.findIndex(url => url === activeId)}
                    webviewRefs={webviewRefs}
                    onVideoPlay={handleVideoPlay}
                    onSnapshot={handleSnapshot}
                    onToggleFavorite={handleToggleFavorite}
                    isFavorite={favorites.has(streamUrls.findIndex(url => url === activeId))}
                    onToggleMute={handleToggleMute}
                    isMuted={mutedStreams.has(streamUrls.findIndex(url => url === activeId))}
                    onFullscreen={handleFullscreen}
                    onPiP={handlePiP}
                    isPlaying={playingStreams.has(streamUrls.findIndex(url => url === activeId))}
                    isDragging={true}
                    dragOverlay={true}
                    onFullView={() => { }}
                    bandwidthMode={bandwidthMode}
                    isFullViewMode={false}
                    gridMode={gridMode}
                  />
                ) : null}
              </DragOverlay>
            </DndContext>
          </div>
        </div>

        {/* Fullscreen Modal */}
        {fullscreenStream && (
          <FullscreenModal
            isOpen={!!fullscreenStream}
            onClose={() => setFullscreenStream(null)}
            streamUrl={fullscreenStream.url}
            streamUsername={fullscreenStream.username}
          />
        )}

        {/* Notifications */}
        <div className="fixed bottom-4 right-4 space-y-2 z-50">
          {notifications.map(notification => (
            <div
              key={notification.id}
              className={`p-2 rounded-lg shadow-lg max-w-sm ${notification.type === 'error' ? 'bg-red-900 bg-opacity-80' :
                  notification.type === 'warning' ? 'bg-yellow-900 bg-opacity-80' :
                    notification.type === 'success' ? 'bg-green-900 bg-opacity-80' :
                      'bg-blue-900 bg-opacity-80'
                } text-white`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-xs">{notification.title}</h4>
                  <p className="text-xs mt-1">{notification.message}</p>
                </div>
                <button
                  onClick={() => removeNotification(notification.id)}
                  className="ml-2 text-white hover:text-gray-300"
                >
                  <X size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      {renderContent()}
    </>
  );
}

// =============== ROUTE EXPORT ===============
export const Route = createFileRoute("/camviewer2")({
  component: HomePage,
});