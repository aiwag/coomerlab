// import React, { useState, useEffect, useCallback, useMemo, useRef, Suspense } from 'react';
// import axios from 'axios';
// import { createStorage } from 'unstorage';
// import indexedDbDriver from "unstorage/drivers/indexedb";
// import { createFileRoute } from '@tanstack/react-router';
// import { toast } from 'sonner';
// import {
//   Loader2, RefreshCw, Search, ImageOff, AlertCircle, Filter, X, Play, Pause,
//   ChevronLeft, ChevronRight, Heart, Share2, Bookmark, MoreHorizontal,
//   Grid3x3, Download, ZoomIn, ZoomOut, RotateCw, Shuffle, SkipForward, SkipBack,
//   Eye, Settings, Sliders, MousePointer, Sun, Moon, Monitor, Smartphone, Tablet,
//   Tv, Film, Power, FolderOpen, HardDrive, Package, Zap, Image as ImageIcon,
//   Wifi, WifiOff, PauseCircle, PlayCircle, Maximize2, Minimize2, Volume2, VolumeX,
//   Copy, Check, Info, ThumbsUp, ThumbsDown, Send, Smile, ChevronDown, ArrowUp,
//   Sparkles, Flame, TrendingUp, Clock, Calendar, User, Users, Hash, AtSign,
//   Camera, Layers, Aperture, Focus, Grid3X3, List, LayoutGrid, LayoutList,
//   Filter as FilterIcon, SortAsc, SortDesc, DownloadCloud, Share, Link2,
//   ExternalLink, HeartHandshake, Star, Award, Trophy, Crown, Gem,
//   Save
// } from 'lucide-react';

// // --- TYPES ---
// interface Creator {
//   favorited: number;
//   id: string;
//   indexed: number;
//   name: string;
//   service: string;
//   updated: number;
// }

// interface Profile {
//   id: string;
//   name: string;
//   service: string;
//   indexed: string;
//   updated: string;
//   public_id: string;
//   relation_id: string | null;
//   post_count: number;
//   dm_count: number;
//   share_count: number;
//   chat_count: number;
// }

// interface Post {
//   id: string;
//   user: string;
//   service: string;
//   title: string;
//   content: string;
//   published: string;
//   file?: {
//     name: string;
//     path: string;
//   };
//   attachments: Array<{
//     name: string;
//     path: string;
//   }>;
// }

// interface CreatorApiResponse {
//   message: string;
//   timestamp: number;
//   data: Creator[];
//   pagination: {
//     currentPage: number;
//     itemsPerPage: number;
//     totalPages: number;
//     totalItems: number;
//     isNextPage: boolean;
//     isPrevPage: boolean;
//   };
// }

// // --- CONFIGURATION ---
// const COOMER_SERVICES = ['onlyfans', 'fansly', 'candfans'];
// const KEMONO_SERVICES = ['patreon', 'fanbox', 'discord', 'fantia', 'afdian', 'boosty', 'dlsite', 'gumroad', 'subscribestar'];

// const SERVICES = [
//   { value: 'all', label: 'All Services' },
//   { value: 'coomer', label: 'Coomer (All)' },
//   ...COOMER_SERVICES.map(service => ({ value: service, label: service.charAt(0).toUpperCase() + service.slice(1) })),
//   { value: 'kemono', label: 'Kemono (All)' },
//   ...KEMONO_SERVICES.map(service => ({ value: service, label: service.charAt(0).toUpperCase() + service.slice(1) }))
// ];

// // --- STORAGE & CACHE ---
// const storage = createStorage({
//   driver: indexedDbDriver({
//     base: 'creators:',
//     dbName: 'creators-db',
//     storeName: 'creators-store'
//   })
// });

// const CACHE_TIMESTAMP_KEY = 'creators:timestamp';
// const CACHE_VERSION_KEY = 'creators:version';
// const CACHE_VERSION = '2.0';
// const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

// // --- API SETTINGS ---
// const COOMER_API_BASE_URL = 'https://kemono-api.mbaharip.com/coomer';
// const KEMONO_API_BASE_URL = 'https://kemono-api.mbaharip.com/kemono';
// const COOMER_POSTS_API_BASE_URL = 'https://coomer.st/api/v1';
// const KEMONO_POSTS_API_BASE_URL = 'https://kemono.su/api/v1';
// const ITEMS_PER_PAGE = 30;
// const POSTS_PER_PAGE = 20;

// // --- ELECTRON APIS ---
// declare global {
//   interface Window {
//     require: any;
//     electronAPI?: {
//       showSaveDialog: (options: any) => Promise<any>;
//       showOpenDialog: (options: any) => Promise<any>;
//       openPath: (path: string) => Promise<void>;
//       createDirectory: (path: string) => Promise<void>;
//       downloadFile: (url: string, destination: string, onProgress?: (progress: number) => void) => Promise<void>;
//       getAppPath: (name: string) => string;
//       getPath: (name: string) => string;
//     };
//   }
// }

// // --- ADVANCED IMAGE CACHE SYSTEM ---
// class AdvancedImageCache {
//   private cache = new Map<string, { url: string; timestamp: number; size: number }>();
//   private loadingPromises = new Map<string, Promise<string>>();
//   private maxCacheSize = 500; // Maximum number of images to cache
//   private maxCacheSizeBytes = 500 * 1024 * 1024; // 500MB limit
//   private cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours
//   private currentCacheSize = 0;
//   private storageKey = 'advanced-image-cache';

//   constructor() {
//     this.loadCacheFromStorage();
//   }

//   async loadCacheFromStorage() {
//     try {
//       const cachedData = localStorage.getItem(this.storageKey);
//       if (cachedData) {
//         const parsedCache = JSON.parse(cachedData);
//         this.cache = new Map(parsedCache.entries);
//         this.currentCacheSize = parsedCache.size || 0;
        
//         // Clean up expired entries
//         this.cleanupExpiredEntries();
//       }
//     } catch (error) {
//       console.error('Failed to load cache from storage:', error);
//     }
//   }

//   saveCacheToStorage() {
//     try {
//       const cacheData = {
//         entries: Array.from(this.cache.entries()),
//         size: this.currentCacheSize
//       };
//       localStorage.setItem(this.storageKey, JSON.stringify(cacheData));
//     } catch (error) {
//       console.error('Failed to save cache to storage:', error);
//     }
//   }

//   async getImage(originalUrl: string): Promise<string> {
//     // Check if already cached
//     if (this.cache.has(originalUrl)) {
//       const cached = this.cache.get(originalUrl)!;
//       if (Date.now() - cached.timestamp < this.cacheExpiry) {
//         return cached.url;
//       } else {
//         this.removeFromCache(originalUrl);
//       }
//     }

//     // Check if already loading
//     if (this.loadingPromises.has(originalUrl)) {
//       return this.loadingPromises.get(originalUrl)!;
//     }

//     // Create loading promise
//     const loadingPromise = this.loadImage(originalUrl);
//     this.loadingPromises.set(originalUrl, loadingPromise);

//     try {
//       const url = await loadingPromise;
//       return url;
//     } finally {
//       this.loadingPromises.delete(originalUrl);
//     }
//   }

//   private async loadImage(originalUrl: string): Promise<string> {
//     try {
//       const response = await fetch(originalUrl);
//       const blob = await response.blob();
//       const objectUrl = URL.createObjectURL(blob);
//       const size = blob.size;

//       // Add to cache
//       this.cache.set(originalUrl, { url: objectUrl, timestamp: Date.now(), size });
//       this.currentCacheSize += size;

//       // Clean up old cache entries if needed
//       if (this.cache.size > this.maxCacheSize || this.currentCacheSize > this.maxCacheSizeBytes) {
//         this.cleanupCache();
//       }

//       // Save cache to localStorage
//       this.saveCacheToStorage();

//       return objectUrl;
//     } catch (error) {
//       console.error('Failed to load image:', error);
//       return originalUrl; // Return original URL as fallback
//     }
//   }

//   private removeFromCache(url: string) {
//     if (this.cache.has(url)) {
//       const cached = this.cache.get(url)!;
//       URL.revokeObjectURL(cached.url);
//       this.currentCacheSize -= cached.size;
//       this.cache.delete(url);
//     }
//   }

//   private cleanupExpiredEntries() {
//     const now = Date.now();
//     const expiredKeys: string[] = [];
    
//     this.cache.forEach((value, key) => {
//       if (now - value.timestamp > this.cacheExpiry) {
//         expiredKeys.push(key);
//       }
//     });

//     expiredKeys.forEach(key => this.removeFromCache(key));
//   }

//   private cleanupCache() {
//     // Sort by timestamp (oldest first)
//     const entries = Array.from(this.cache.entries());
//     entries.sort((a, b) => a[1].timestamp - b[1].timestamp);

//     // Remove oldest entries until we're under the limits
//     while (
//       (this.cache.size > this.maxCacheSize || this.currentCacheSize > this.maxCacheSizeBytes) &&
//       entries.length > 0
//     ) {
//       const [url] = entries.shift()!;
//       this.removeFromCache(url);
//     }

//     // Save the updated cache
//     this.saveCacheToStorage();
//   }

//   preloadImages(urls: string[]): void {
//     // Preload images in the background without blocking
//     urls.forEach(url => {
//       if (!this.cache.has(url) && !this.loadingPromises.has(url)) {
//         this.getImage(url).catch(() => {
//           // Silently fail preloading
//         });
//       }
//     });
//   }

//   clearCache() {
//     // Revoke all object URLs
//     this.cache.forEach((value) => {
//       URL.revokeObjectURL(value.url);
//     });
    
//     this.cache.clear();
//     this.currentCacheSize = 0;
    
//     // Clear localStorage
//     localStorage.removeItem(this.storageKey);
//   }

//   getCacheInfo() {
//     return {
//       count: this.cache.size,
//       sizeBytes: this.currentCacheSize,
//       sizeMB: Math.round(this.currentCacheSize / (1024 * 1024) * 100) / 100,
//       maxSizeMB: Math.round(this.maxCacheSizeBytes / (1024 * 1024))
//     };
//   }
// }

// const advancedImageCache = new AdvancedImageCache();

// // --- FAVORITES SYSTEM ---
// class FavoritesManager {
//   private storageKey = 'creator-favorites';
//   private favorites: Set<string> = new Set();

//   constructor() {
//     this.loadFavorites();
//   }

//   loadFavorites() {
//     try {
//       const stored = localStorage.getItem(this.storageKey);
//       if (stored) {
//         this.favorites = new Set(JSON.parse(stored));
//       }
//     } catch (error) {
//       console.error('Failed to load favorites:', error);
//     }
//   }

//   saveFavorites() {
//     try {
//       localStorage.setItem(this.storageKey, JSON.stringify(Array.from(this.favorites)));
//     } catch (error) {
//       console.error('Failed to save favorites:', error);
//     }
//   }

//   addFavorite(creatorId: string) {
//     this.favorites.add(creatorId);
//     this.saveFavorites();
//   }

//   removeFavorite(creatorId: string) {
//     this.favorites.delete(creatorId);
//     this.saveFavorites();
//   }

//   isFavorite(creatorId: string): boolean {
//     return this.favorites.has(creatorId);
//   }

//   getFavorites(): string[] {
//     return Array.from(this.favorites);
//   }
// }

// const favoritesManager = new FavoritesManager();

// // --- OFFLINE SYNC SYSTEM ---
// class OfflineSyncManager {
//   private storageKey = 'offline-sync-data';
//   private syncData: Map<string, Post[]> = new Map();
//   private isSyncing = false;
//   private syncProgress = 0;

//   async syncCreatorPosts(creatorId: string, posts: Post[]): Promise<void> {
//     this.isSyncing = true;
//     this.syncProgress = 0;

//     try {
//       // Simulate sync progress
//       for (let i = 0; i < posts.length; i++) {
//         await new Promise(resolve => setTimeout(resolve, 100)); // Simulate processing time
//         this.syncProgress = Math.round((i / posts.length) * 100);
//       }

//       // Store posts for offline viewing
//       this.syncData.set(creatorId, posts);
//       this.saveSyncData();
//     } finally {
//       this.isSyncing = false;
//       this.syncProgress = 0;
//     }
//   }

//   getSyncedPosts(creatorId: string): Post[] {
//     return this.syncData.get(creatorId) || [];
//   }

//   isCreatorSynced(creatorId: string): boolean {
//     return this.syncData.has(creatorId);
//   }

//   getSyncProgress(): number {
//     return this.syncProgress;
//   }

//   isCurrentlySyncing(): boolean {
//     return this.isSyncing;
//   }

//   private saveSyncData() {
//     try {
//       const data = Array.from(this.syncData.entries());
//       localStorage.setItem(this.storageKey, JSON.stringify(data));
//     } catch (error) {
//       console.error('Failed to save sync data:', error);
//     }
//   }

//   loadSyncData() {
//     try {
//       const stored = localStorage.getItem(this.storageKey);
//       if (stored) {
//         const data = JSON.parse(stored);
//         this.syncData = new Map(data);
//       }
//     } catch (error) {
//       console.error('Failed to load sync data:', error);
//     }
//   }

//   clearSyncData() {
//     this.syncData.clear();
//     localStorage.removeItem(this.storageKey);
//   }
// }

// const offlineSyncManager = new OfflineSyncManager();
// offlineSyncManager.loadSyncData();

// // --- DOWNLOAD SERVICE ---
// class DownloadService {
//   private static instance: DownloadService;
//   private downloads: Map<string, {
//     id: string;
//     post: Post;
//     status: 'pending' | 'downloading' | 'completed' | 'error';
//     progress: number;
//     filePath?: string;
//     error?: string;
//   }> = new Map();

//   static getInstance(): DownloadService {
//     if (!DownloadService.instance) {
//       DownloadService.instance = new DownloadService();
//     }
//     return DownloadService.instance;
//   }

//   async selectDownloadDirectory(): Promise<string | null> {
//     try {
//       if (window.electronAPI) {
//         const result = await window.electronAPI.showOpenDialog({
//           properties: ['openDirectory'],
//           title: 'Select Download Directory'
//         });

//         if (!result.canceled && result.filePaths.length > 0) {
//           return result.filePaths[0];
//         }
//       } else {
//         const dir = prompt('Enter download directory path:');
//         return dir || null;
//       }
//     } catch (error) {
//       console.error('Error selecting directory:', error);
//       toast.error('Failed to select directory');
//       return null;
//     }
//     return null;
//   }

//   async downloadFile(
//     url: string,
//     destination: string,
//     onProgress?: (progress: number) => void,
//     downloadId?: string
//   ): Promise<string> {
//     try {
//       if (window.electronAPI) {
//         await window.electronAPI.downloadFile(url, destination, onProgress);
//         return destination;
//       } else {
//         const response = await fetch(url);
//         const blob = await response.blob();

//         const downloadUrl = URL.createObjectURL(blob);
//         const link = document.createElement('a');
//         link.href = downloadUrl;
//         link.download = destination.split('/').pop() || 'download';
//         document.body.appendChild(link);
//         link.click();
//         document.body.removeChild(link);
//         URL.revokeObjectURL(downloadUrl);

//         return destination;
//       }
//     } catch (error) {
//       console.error('Download error:', error);
//       throw error;
//     }
//   }

//   async downloadPosts(posts: Post[], service: string): Promise<void> {
//     const dir = await this.selectDownloadDirectory();
//     if (!dir) return;

//     posts.forEach(async (post, index) => {
//       const downloadId = `download-${post.id}-${Date.now()}`;
      
//       // Add to downloads tracking
//       this.downloads.set(downloadId, {
//         id: downloadId,
//         post,
//         status: 'pending',
//         progress: 0
//       });

//       try {
//         // Update status to downloading
//         this.downloads.get(downloadId)!.status = 'downloading';
        
//         const url = COOMER_SERVICES.includes(service)
//           ? `https://coomer.st${post.file?.path || ''}`
//           : `https://kemono.su${post.file?.path || ''}`;

//         const fileName = `${post.id}.${post.file?.name?.split('.').pop() || 'jpg'}`;
//         const filePath = `${dir}/${fileName}`;

//         await this.downloadFile(
//           url, 
//           filePath, 
//           (progress) => {
//             this.downloads.get(downloadId)!.progress = progress;
//           },
//           downloadId
//         );

//         // Update status to completed
//         this.downloads.get(downloadId)!.status = 'completed';
//         this.downloads.get(downloadId)!.filePath = filePath;
        
//         toast.success(`Downloaded: ${fileName}`);
//       } catch (error) {
//         console.error('Download failed:', error);
//         this.downloads.get(downloadId)!.status = 'error';
//         this.downloads.get(downloadId)!.error = error instanceof Error ? error.message : 'Unknown error';
//         toast.error(`Failed to download: ${post.title}`);
//       }
//     });
//   }

//   getDownloads() {
//     return Array.from(this.downloads.values());
//   }

//   openFileLocation(filePath: string): Promise<void> {
//     try {
//       if (window.electronAPI) {
//         return window.electronAPI.openPath(filePath);
//       } else {
//         window.open(`file://${filePath}`, '_blank');
//         return Promise.resolve();
//       }
//     } catch (error) {
//       console.error('Error opening file location:', error);
//       toast.error('Failed to open file location');
//       return Promise.reject(error);
//     }
//   }

//   async ensureDirectoryExists(dirPath: string): Promise<void> {
//     try {
//       if (window.electronAPI) {
//         await window.electronAPI.createDirectory(dirPath);
//       }
//     } catch (error) {
//       console.error('Error creating directory:', error);
//     }
//   }
// }

// // --- PERFORMANCE-OPTIMIZED IMAGE COMPONENT ---
// const OptimizedImage = React.memo(({
//   src,
//   alt,
//   className,
//   onLoad,
//   onError,
//   style,
//   objectFit = 'cover',
//   priority = false
// }: {
//   src: string;
//   alt: string;
//   className?: string;
//   onLoad?: () => void;
//   onError?: () => void;
//   style?: React.CSSProperties;
//   objectFit?: 'cover' | 'contain' | 'fill';
//   priority?: boolean;
// }) => {
//   const [imageSrc, setImageSrc] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isError, setIsError] = useState(false);
//   const [isInView, setIsInView] = useState(false);
//   const imgRef = useRef<HTMLImageElement>(null);

//   useEffect(() => {
//     if (!priority && !isInView) return;

//     const loadImage = async () => {
//       try {
//         setIsLoading(true);
//         setIsError(false);

//         const cachedUrl = await advancedImageCache.getImage(src);
//         setImageSrc(cachedUrl);
//         setIsLoading(false);
//         onLoad?.();
//       } catch (error) {
//         console.error('Error loading image:', error);
//         setImageSrc(src); // Fallback to original URL
//         setIsLoading(false);
//         setIsError(true);
//         onError?.();
//       }
//     };

//     loadImage();
//   }, [src, priority, isInView, onLoad, onError]);

//   // Intersection Observer for lazy loading
//   useEffect(() => {
//     if (!imgRef.current || priority) return;

//     const observer = new IntersectionObserver(
//       (entries) => {
//         entries.forEach((entry) => {
//           if (entry.isIntersecting) {
//             setIsInView(true);
//             observer.unobserve(entry.target);
//           }
//         });
//       },
//       { rootMargin: '100px' } // Start loading 100px before it comes into view
//     );

//     observer.observe(imgRef.current);

//     return () => {
//       if (imgRef.current) {
//         observer.unobserve(imgRef.current);
//       }
//     };
//   }, [priority]);

//   if (isError) {
//     return (
//       <div className={`flex items-center justify-center bg-gray-200 dark:bg-gray-800 ${className}`} style={style}>
//         <ImageOff size={24} className="text-gray-500 dark:text-gray-400" />
//       </div>
//     );
//   }

//   return (
//     <>
//       {isLoading && (
//         <div className={`absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-800 ${className}`} style={style}>
//           <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
//         </div>
//       )}
//       <img
//         ref={imgRef}
//         src={imageSrc || src}
//         alt={alt}
//         className={`${className} transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
//         style={{ ...style, objectFit }}
//         loading="lazy"
//       />
//     </>
//   );
// });

// // --- COMPACT CREATOR CARD ---
// const CompactCreatorCard = React.memo(({
//   creator,
//   onClick
// }: {
//   creator: Creator;
//   onClick: () => void;
// }) => {
//   const [imageError, setImageError] = useState(false);
//   const [isHovered, setIsHovered] = useState(false);
//   const [isLiked, setIsLiked] = useState(false);
//   const [isFavorited, setIsFavorited] = useState(false);
//   const [likes, setLikes] = useState(creator.favorited);

//   useEffect(() => {
//     setIsFavorited(favoritesManager.isFavorite(creator.id));
//   }, [creator.id]);

//   const getCreatorImageUrl = () => {
//     if (COOMER_SERVICES.includes(creator.service)) {
//       return `https://coomer.st/icons/${creator.service}/${creator.id}`;
//     } else {
//       return `https://kemono.su/icons/${creator.service}/${creator.id}`;
//     }
//   };

//   const handleLike = (e: React.MouseEvent) => {
//     e.stopPropagation();
//     setIsLiked(!isLiked);
//     setLikes(prev => isLiked ? prev - 1 : prev + 1);
//   };

//   const handleFavorite = (e: React.MouseEvent) => {
//     e.stopPropagation();
//     if (isFavorited) {
//       favoritesManager.removeFavorite(creator.id);
//       setIsFavorited(false);
//       toast('Removed from favorites');
//     } else {
//       favoritesManager.addFavorite(creator.id);
//       setIsFavorited(true);
//       toast('Added to favorites');
//     }
//   };

//   const getServiceColor = () => {
//     if (COOMER_SERVICES.includes(creator.service)) {
//       return 'from-purple-500 to-pink-500';
//     } else {
//       return 'from-blue-500 to-cyan-500';
//     }
//   };

//   return (
//     <div
//       className="relative aspect-square overflow-hidden rounded-xl cursor-pointer group transform transition-all duration-300 hover:scale-105"
//       onClick={onClick}
//       onMouseEnter={() => setIsHovered(true)}
//       onMouseLeave={() => setIsHovered(false)}
//     >
//       {/* Background gradient based on service */}
//       <div className={`absolute inset-0 bg-gradient-to-br ${getServiceColor()} opacity-80`} />

//       {/* Creator image */}
//       <div className="absolute inset-0 p-2">
//         {!imageError ? (
//           <OptimizedImage
//             src={getCreatorImageUrl()}
//             alt={creator.name}
//             className="w-full h-full object-cover rounded-lg"
//             onError={() => setImageError(true)}
//           />
//         ) : (
//           <div className="w-full h-full bg-gray-800 rounded-lg flex items-center justify-center">
//             <User size={24} className="text-gray-600" />
//           </div>
//         )}
//       </div>

//       {/* Overlay with info */}
//       <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-3 flex flex-col justify-between transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'
//         }`}>
//         <div className="flex justify-end gap-1">
//           <button
//             onClick={handleFavorite}
//             className="p-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
//           >
//             <Star size={14} className={isFavorited ? 'fill-yellow-500 text-yellow-500' : ''} />
//           </button>
//           <button
//             onClick={handleLike}
//             className="p-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
//           >
//             <Heart size={14} className={isLiked ? 'fill-red-500 text-red-500' : ''} />
//           </button>
//         </div>

//         <div>
//           <h3 className="text-white font-bold text-sm truncate">{creator.name}</h3>
//           <div className="flex items-center justify-between">
//             <span className="text-white/80 text-xs">{creator.service}</span>
//             <span className="text-white/80 text-xs flex items-center gap-1">
//               <Heart size={10} />
//               {likes}
//             </span>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// });

// // --- COMPACT POST GRID ---
// const CompactPostGrid = React.memo(({
//   posts,
//   onPostClick,
//   service,
//   selectedPosts,
//   showSelection,
//   gridColumns = 4
// }: {
//   posts: Post[];
//   onPostClick: (post: Post, index: number) => void;
//   service: string;
//   selectedPosts: Set<string>;
//   showSelection: boolean;
//   gridColumns?: number;
// }) => {
//   const [hoveredPost, setHoveredPost] = useState<Post | null>(null);
//   const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
//   const [hoverPreviewEnabled, setHoverPreviewEnabled] = useState(false);

//   // Track mouse position for hover preview
//   useEffect(() => {
//     const handleMouseMove = (e: MouseEvent) => {
//       setMousePosition({ x: e.clientX, y: e.clientY });
//     };

//     if (hoverPreviewEnabled) {
//       window.addEventListener('mousemove', handleMouseMove);
//     }

//     return () => {
//       window.removeEventListener('mousemove', handleMouseMove);
//     };
//   }, [hoverPreviewEnabled]);

//   // Preload images for better performance
//   useEffect(() => {
//     const imageUrls = posts.slice(0, 20).map(post => {
//       if (post.file) {
//         const baseUrl = COOMER_SERVICES.includes(service) ? 'https://coomer.st' : 'https://kemono.su';
//         return `${baseUrl}${post.file.path}`;
//       }
//       if (post.attachments && post.attachments.length > 0) {
//         const baseUrl = COOMER_SERVICES.includes(service) ? 'https://coomer.st' : 'https://kemono.su';
//         return `${baseUrl}${post.attachments[0].path}`;
//       }
//       return '';
//     }).filter(Boolean);

//     advancedImageCache.preloadImages(imageUrls);
//   }, [posts, service]);

//   const getPostImageUrl = (post: Post) => {
//     if (post.file) {
//       const baseUrl = COOMER_SERVICES.includes(service) ? 'https://coomer.st' : 'https://kemono.su';
//       return `${baseUrl}${post.file.path}`;
//     }
//     if (post.attachments && post.attachments.length > 0) {
//       const baseUrl = COOMER_SERVICES.includes(service) ? 'https://coomer.st' : 'https://kemono.su';
//       return `${baseUrl}${post.attachments[0].path}`;
//     }
//     return null;
//   };

//   const isVideo = (filename?: string) => {
//     if (!filename) return false;
//     return filename.includes('.mp4') || filename.includes('.mov') || filename.includes('.avi') || filename.includes('.webm');
//   };

//   return (
//     <>
//       <div
//         className={`grid gap-1 w-full`}
//         style={{ gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))` }}
//       >
//         {posts.map((post, index) => {
//           const imageUrl = getPostImageUrl(post);
//           const isSelected = selectedPosts.has(post.id);
//           const hasVideo = isVideo(post.file?.name || post.attachments?.[0]?.name);
//           const hasMultiple = post.attachments && post.attachments.length > 0;

//           return (
//             <div
//               key={post.id}
//               className={`relative aspect-square overflow-hidden rounded-lg cursor-pointer group transform transition-all duration-300 hover:scale-105 ${showSelection && isSelected ? 'ring-2 ring-blue-500' : ''
//                 }`}
//               onClick={() => onPostClick(post, index)}
//               onMouseEnter={() => setHoveredPost(post)}
//               onMouseLeave={() => setHoveredPost(null)}
//             >
//               {/* Selection checkbox */}
//               {showSelection && (
//                 <div className="absolute top-2 left-2 z-10">
//                   <div className={`w-5 h-5 rounded-full border-2 border-white flex items-center justify-center ${isSelected ? 'bg-blue-500' : 'bg-black/50'
//                     }`}>
//                     {isSelected && (
//                       <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
//                         <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
//                       </svg>
//                     )}
//                   </div>
//                 </div>
//               )}

//               {/* Media indicators */}
//               {hasVideo && (
//                 <div className="absolute top-2 right-2 z-10 bg-black/50 rounded-full p-1">
//                   <PlayCircle size={12} className="text-white" />
//                 </div>
//               )}

//               {hasMultiple && (
//                 <div className="absolute top-2 right-2 z-10 bg-black/50 rounded-full px-1.5 py-0.5">
//                   <span className="text-xs text-white">+{post.attachments.length}</span>
//                 </div>
//               )}

//               {/* Image */}
//               {imageUrl ? (
//                 <OptimizedImage
//                   src={imageUrl}
//                   alt={post.title}
//                   className="w-full h-full object-cover"
//                 />
//               ) : (
//                 <div className="w-full h-full bg-gray-800 flex items-center justify-center">
//                   <ImageOff size={24} className="text-gray-600" />
//                 </div>
//               )}

//               {/* Hover overlay */}
//               <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
//                 <div className="absolute bottom-0 left-0 right-0 p-2">
//                   <p className="text-white text-xs font-medium truncate">{post.title}</p>
//                 </div>
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       {/* Hover Preview */}
//       {hoverPreviewEnabled && hoveredPost && (
//         <HoverPreview
//           post={hoveredPost}
//           enabled={hoverPreviewEnabled}
//           mousePosition={mousePosition}
//           service={service}
//         />
//       )}
//     </>
//   );
// });

// // --- HOVER PREVIEW COMPONENT ---
// const HoverPreview = ({
//   post,
//   enabled,
//   mousePosition,
//   service
// }: {
//   post: Post;
//   enabled: boolean;
//   mousePosition: { x: number; y: number };
//   service: string;
// }) => {
//   const [position, setPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });
//   const [isVisible, setIsVisible] = useState(false);

//   const getMediaUrl = (path: string, service: string) => {
//     if (COOMER_SERVICES.includes(service)) {
//       return `https://coomer.st${path}`;
//     } else {
//       return `https://kemono.su${path}`;
//     }
//   };

//   const mediaUrl = post.file ? getMediaUrl(post.file.path, service) :
//     post.attachments.length > 0 ? getMediaUrl(post.attachments[0].path, service) : null;

//   useEffect(() => {
//     if (!enabled || !mediaUrl) return;

//     const updatePosition = () => {
//       const viewportWidth = window.innerWidth;
//       const viewportHeight = window.innerHeight;
//       const previewWidth = Math.min(viewportWidth * 0.7, 900);
//       const previewHeight = Math.min(viewportHeight * 0.8, 700);

//       let left = mousePosition.x + 20;
//       let top = mousePosition.y - previewHeight / 2;

//       if (left + previewWidth > viewportWidth) {
//         left = mousePosition.x - previewWidth - 20;
//       }

//       if (top < 10) {
//         top = 10;
//       } else if (top + previewHeight > viewportHeight - 10) {
//         top = viewportHeight - previewHeight - 10;
//       }

//       setPosition({ top, left, width: previewWidth, height: previewHeight });
//     };

//     updatePosition();

//     const handleResize = () => updatePosition();
//     window.addEventListener('resize', handleResize);

//     return () => window.removeEventListener('resize', handleResize);
//   }, [enabled, mousePosition, mediaUrl]);

//   useEffect(() => {
//     if (enabled && mediaUrl) {
//       const timer = setTimeout(() => setIsVisible(true), 300);
//       return () => clearTimeout(timer);
//     } else {
//       setIsVisible(false);
//     }
//   }, [enabled, mediaUrl]);

//   if (!enabled || !isVisible || !mediaUrl) return null;

//   return (
//     <div
//       className="fixed z-50 bg-black rounded-lg shadow-2xl overflow-hidden border border-gray-800"
//       style={{
//         top: `${position.top}px`,
//         left: `${position.left}px`,
//         width: `${position.width}px`,
//         height: `${position.height}px`,
//       }}
//     >
//       <OptimizedImage
//         src={mediaUrl}
//         alt={`Preview of ${post.id}`}
//         className="w-full h-full"
//         objectFit="cover"
//       />
//       <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 text-white">
//         <p className="text-sm font-semibold truncate">{post.title}</p>
//         <div className="flex items-center gap-2 mt-1">
//           <span className="flex items-center gap-1 text-xs">
//             <Heart size={10} />
//             {Math.floor(Math.random() * 1000) + 100}
//           </span>
//           <span className="flex items-center gap-1 text-xs">
//             <Eye size={10} />
//             {Math.floor(Math.random() * 10000) + 1000}
//           </span>
//         </div>
//       </div>
//     </div>
//   );
// };

// // --- MOVIE MODE COMPONENT ---
// const MovieMode = ({
//   posts,
//   onClose,
//   infiniteMode,
//   service
// }: {
//   posts: Post[];
//   onClose: () => void;
//   infiniteMode: boolean;
//   service: string;
// }) => {
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [showControls, setShowControls] = useState(true);
//   const intervalRef = useRef<NodeJS.Timeout | null>(null);
//   const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

//   // Get 4 posts for current display
//   const getDisplayPosts = () => {
//     const result = [];
//     const startIndex = currentIndex * 4;

//     for (let i = 0; i < 4; i++) {
//       const index = (startIndex + i) % posts.length;
//       result.push(posts[index]);
//     }

//     return result;
//   };

//   const displayPosts = getDisplayPosts();

//   // Auto-advance slideshow
//   useEffect(() => {
//     if (isPlaying) {
//       intervalRef.current = setInterval(() => {
//         setCurrentIndex(prev => {
//           const maxIndex = Math.ceil(posts.length / 4) - 1;
//           if (infiniteMode && prev >= maxIndex) {
//             return 0;
//           }
//           return prev < maxIndex ? prev + 1 : prev;
//         });
//       }, 4000); // 4-second intervals
//     } else {
//       if (intervalRef.current) {
//         clearInterval(intervalRef.current);
//         intervalRef.current = null;
//       }
//     }

//     return () => {
//       if (intervalRef.current) {
//         clearInterval(intervalRef.current);
//         intervalRef.current = null;
//       }
//     };
//   }, [isPlaying, posts.length, infiniteMode]);

//   // Handle mouse movement for controls
//   const handleMouseMove = () => {
//     setShowControls(true);
//     if (controlsTimeoutRef.current) {
//       clearTimeout(controlsTimeoutRef.current);
//     }
//     controlsTimeoutRef.current = setTimeout(() => {
//       setShowControls(false);
//     }, 3000); // Auto-hide after 3 seconds
//   };

//   const handleStart = () => {
//     setIsPlaying(true);
//   };

//   const handleStop = () => {
//     setIsPlaying(false);
//   };

//   const getPostImageUrl = (post: Post) => {
//     if (post.file) {
//       const baseUrl = COOMER_SERVICES.includes(service) ? 'https://coomer.st' : 'https://kemono.su';
//       return `${baseUrl}${post.file.path}`;
//     }
//     if (post.attachments && post.attachments.length > 0) {
//       const baseUrl = COOMER_SERVICES.includes(service) ? 'https://coomer.st' : 'https://kemono.su';
//       return `${baseUrl}${post.attachments[0].path}`;
//     }
//     return null;
//   };

//   return (
//     <div
//       className="fixed inset-0 bg-black z-50 flex items-center justify-center"
//       onClick={onClose}
//       onMouseMove={handleMouseMove}
//     >
//       {/* TV Frame Background */}
//       <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
//         {/* TV Frame Border */}
//         <div className="absolute inset-8 border-8 border-gray-700 rounded-3xl shadow-2xl">
//           {/* TV Screen Bezel */}
//           <div className="absolute inset-4 border-4 border-gray-600 rounded-2xl">
//             {/* TV Screen */}
//             <div className="absolute inset-2 bg-black rounded-xl overflow-hidden">
//               {/* 2x2 Grid Container */}
//               <div className="grid grid-cols-2 grid-rows-2 gap-1 h-full">
//                 {displayPosts.map((post, index) => {
//                   const imageUrl = getPostImageUrl(post);
//                   return (
//                     <div key={index} className="relative bg-gray-900 overflow-hidden">
//                       {imageUrl ? (
//                         <OptimizedImage
//                           src={imageUrl}
//                           alt={`Movie mode post ${index + 1}`}
//                           className="w-full h-full"
//                           objectFit="cover"
//                         />
//                       ) : (
//                         <div className="w-full h-full flex items-center justify-center">
//                           <ImageOff size={24} className="text-gray-600" />
//                         </div>
//                       )}
//                     </div>
//                   );
//                 })}
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* TV Brand Logo */}
//         <div className="absolute top-12 left-1/2 transform -translate-x-1/2 text-gray-600 text-2xl font-bold">
//           CREATOR TV
//         </div>

//         {/* TV Power Button */}
//         <div className="absolute bottom-12 right-12 w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center shadow-lg">
//           <Power size={24} className="text-gray-500" />
//         </div>
//       </div>

//       {/* Controls Overlay */}
//       <div className={`absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'
//         }`}>
//         <div className="flex justify-between items-center">
//           <div className="flex items-center gap-4">
//             <h2 className="text-white text-xl font-bold flex items-center gap-2">
//               <Tv size={24} />
//               Movie Mode
//             </h2>
//             <div className="flex items-center gap-2">
//               {!isPlaying ? (
//                 <button
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     handleStart();
//                   }}
//                   className="p-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors"
//                 >
//                   <Play size={20} />
//                 </button>
//               ) : (
//                 <button
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     handleStop();
//                   }}
//                   className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
//                 >
//                   <Pause size={20} />
//                 </button>
//               )}
//               <button
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   setCurrentIndex(Math.max(0, currentIndex - 1));
//                 }}
//                 className="p-2 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition-colors"
//               >
//                 <ChevronLeft size={20} />
//               </button>
//               <button
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   setCurrentIndex(prev => {
//                     const maxIndex = Math.ceil(posts.length / 4) - 1;
//                     return prev < maxIndex ? prev + 1 : prev;
//                   });
//                 }}
//                 className="p-2 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition-colors"
//               >
//                 <ChevronRight size={20} />
//               </button>
//             </div>
//             <div className="flex items-center gap-2">
//               <label className="text-white text-sm flex items-center gap-1">
//                 <input
//                   type="checkbox"
//                   checked={infiniteMode}
//                   onChange={() => { }}
//                   className="rounded"
//                 />
//                 Infinite Loop
//               </label>
//             </div>
//           </div>
//           <button
//             onClick={(e) => {
//               e.stopPropagation();
//               onClose();
//             }}
//             className="p-2 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition-colors"
//           >
//             <X size={20} />
//           </button>
//         </div>
//       </div>

//       {/* Progress Bar */}
//       <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'
//         }`}>
//         <div className="max-w-4xl mx-auto">
//           <div className="w-full bg-gray-700 rounded-full h-2">
//             <div
//               className="bg-blue-500 h-2 rounded-full transition-all duration-1000 ease-linear"
//               style={{
//                 width: `${((currentIndex + 1) / Math.ceil(posts.length / 4)) * 100}%`
//               }}
//             />
//           </div>
//           <p className="text-white text-sm mt-2 text-center">
//             Set {currentIndex + 1} / {Math.ceil(posts.length / 4)} • {posts.length} posts
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// // --- GALLERY VIEWER ---
// const GalleryViewer = ({
//   post,
//   isOpen,
//   onClose,
//   onNext,
//   onPrevious,
//   hasNext,
//   hasPrevious,
//   currentIndex,
//   totalCount,
//   service
// }: {
//   post: Post | null;
//   isOpen: boolean;
//   onClose: () => void;
//   onNext: () => void;
//   onPrevious: () => void;
//   hasNext: boolean;
//   hasPrevious: boolean;
//   currentIndex: number;
//   totalCount: number;
//   service: string;
// }) => {
//   const [currentImageIndex, setCurrentImageIndex] = useState(0);
//   const [isFullscreen, setIsFullscreen] = useState(false);
//   const [showInfo, setShowInfo] = useState(false);
//   const [isLiked, setIsLiked] = useState(false);
//   const [isBookmarked, setIsBookmarked] = useState(false);
//   const [likes, setLikes] = useState(Math.floor(Math.random() * 1000) + 100);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [showControls, setShowControls] = useState(true);
//   const [zoomLevel, setZoomLevel] = useState(1);
//   const [rotation, setRotation] = useState(0);
//   const [isDragging, setIsDragging] = useState(false);
//   const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
//   const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
//   const [copied, setCopied] = useState(false);
//   const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
//   const containerRef = useRef<HTMLDivElement>(null);

//   const getMediaUrl = (path: string, service: string) => {
//     if (COOMER_SERVICES.includes(service)) {
//       return `https://coomer.st${path}`;
//     } else {
//       return `https://kemono.su${path}`;
//     }
//   };

//   // Get all media items for this post
//   const mediaItems = useMemo(() => {
//     if (!post) return [];
    
//     const items = [];
    
//     if (post.file) {
//       items.push({
//         type: post.file.name?.includes('.mp4') || 
//               post.file.name?.includes('.mov') || 
//               post.file.name?.includes('.avi') || 
//               post.file.name?.includes('.webm') ? 'video' : 'image',
//         url: getMediaUrl(post.file.path, service),
//         name: post.file.name
//       });
//     }
    
//     if (post.attachments && post.attachments.length > 0) {
//       post.attachments.forEach(att => {
//         items.push({
//           type: att.name?.includes('.mp4') || 
//                 att.name?.includes('.mov') || 
//                 att.name?.includes('.avi') || 
//                 att.name?.includes('.webm') ? 'video' : 'image',
//           url: getMediaUrl(att.path, service),
//           name: att.name
//         });
//       });
//     }
    
//     return items;
//   }, [post, service]);

//   const currentMedia = mediaItems[currentImageIndex];

//   const handleLike = () => {
//     setIsLiked(!isLiked);
//     setLikes(prev => isLiked ? prev - 1 : prev + 1);
//   };

//   const handleBookmark = () => {
//     setIsBookmarked(!isBookmarked);
//     toast(isBookmarked ? 'Removed from bookmarks' : 'Added to bookmarks');
//   };

//   const handleShare = async () => {
//     if (currentMedia) {
//       try {
//         await navigator.clipboard.writeText(currentMedia.url);
//         setCopied(true);
//         setTimeout(() => setCopied(false), 2000);
//         toast('Link copied to clipboard');
//       } catch (err) {
//         console.error('Failed to copy link:', err);
//       }
//     }
//   };

//   const handleDownload = async () => {
//     if (!currentMedia) return;

//     const downloadService = DownloadService.getInstance();
//     const dir = await downloadService.selectDownloadDirectory();
//     if (!dir) return;

//     const fileName = currentMedia.name || `${post?.id || 'download'}.${currentMedia.type === 'video' ? 'mp4' : 'jpg'}`;
//     const filePath = `${dir}/${fileName}`;

//     try {
//       await downloadService.downloadFile(currentMedia.url, filePath);
//       toast.success(`Downloaded: ${fileName}`);
//     } catch (error) {
//       console.error('Download failed:', error);
//       toast.error('Download failed');
//     }
//   };

//   const handleFullscreen = () => {
//     if (!document.fullscreenElement) {
//       containerRef.current?.requestFullscreen();
//       setIsFullscreen(true);
//     } else {
//       document.exitFullscreen();
//       setIsFullscreen(false);
//     }
//   };

//   const handleZoomIn = () => {
//     setZoomLevel(prev => Math.min(prev + 0.25, 3));
//   };

//   const handleZoomOut = () => {
//     setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
//   };

//   const handleRotate = () => {
//     setRotation(prev => (prev + 90) % 360);
//   };

//   const handleReset = () => {
//     setZoomLevel(1);
//     setRotation(0);
//     setDragOffset({ x: 0, y: 0 });
//   };

//   const handleMouseDown = (e: React.MouseEvent) => {
//     if (zoomLevel > 1) {
//       setIsDragging(true);
//       setDragStart({ x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y });
//     }
//   };

//   const handleMouseMove = (e: React.MouseEvent) => {
//     if (isDragging) {
//       setDragOffset({
//         x: e.clientX - dragStart.x,
//         y: e.clientY - dragStart.y
//       });
//     }
//   };

//   const handleMouseUp = () => {
//     setIsDragging(false);
//   };

//   const handleNextImage = () => {
//     if (currentImageIndex < mediaItems.length - 1) {
//       setCurrentImageIndex(currentImageIndex + 1);
//     }
//   };

//   const handlePreviousImage = () => {
//     if (currentImageIndex > 0) {
//       setCurrentImageIndex(currentImageIndex - 1);
//     }
//   };

//   // Auto-hide controls
//   useEffect(() => {
//     if (showControls) {
//       controlsTimeoutRef.current = setTimeout(() => {
//         setShowControls(false);
//       }, 3000);
//     } else {
//       if (controlsTimeoutRef.current) {
//         clearTimeout(controlsTimeoutRef.current);
//       }
//     }

//     return () => {
//       if (controlsTimeoutRef.current) {
//         clearTimeout(controlsTimeoutRef.current);
//       }
//     };
//   }, [showControls]);

//   // Keyboard shortcuts
//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       switch (e.key) {
//         case 'Escape':
//           if (isFullscreen) {
//             handleFullscreen();
//           } else {
//             onClose();
//           }
//           break;
//         case 'ArrowLeft':
//           if (mediaItems.length > 1) {
//             handlePreviousImage();
//           } else if (hasPrevious) {
//             onPrevious();
//           }
//           break;
//         case 'ArrowRight':
//           if (mediaItems.length > 1) {
//             handleNextImage();
//           } else if (hasNext) {
//             onNext();
//           }
//           break;
//         case ' ':
//           e.preventDefault();
//           if (currentMedia?.type === 'video') {
//             setIsPlaying(!isPlaying);
//           }
//           break;
//         case 'f':
//           handleFullscreen();
//           break;
//         case '+':
//         case '=':
//           handleZoomIn();
//           break;
//         case '-':
//         case '_':
//           handleZoomOut();
//           break;
//         case 'r':
//           handleRotate();
//           break;
//         case '0':
//           handleReset();
//           break;
//         case 'l':
//           handleLike();
//           break;
//         case 'b':
//           handleBookmark();
//           break;
//         case 'd':
//           handleDownload();
//           break;
//         case 'c':
//           handleShare();
//           break;
//         case 'i':
//           setShowInfo(!showInfo);
//           break;
//       }
//     };

//     window.addEventListener('keydown', handleKeyDown);
//     return () => window.removeEventListener('keydown', handleKeyDown);
//   }, [onClose, onPrevious, onNext, hasPrevious, hasNext, isFullscreen, isPlaying, showInfo, isLiked, currentMedia, mediaItems]);

//   if (!post || !currentMedia) return null;

//   return (
//     <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
//       <div
//         ref={containerRef}
//         className={`relative w-full h-full flex flex-col ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
//         onMouseDown={handleMouseDown}
//         onMouseMove={handleMouseMove}
//         onMouseUp={handleMouseUp}
//         onMouseLeave={handleMouseUp}
//         onClick={() => setShowControls(!showControls)}
//       >
//         {/* Top Controls */}
//         <div className={`absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/70 to-transparent p-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'
//           }`}>
//           <div className="flex justify-between items-center">
//             <div className="flex items-center gap-3 text-white">
//               <span className="text-sm bg-black/50 px-2 py-1 rounded backdrop-blur-sm">
//                 {currentIndex + 1} / {totalCount}
//               </span>
//               {mediaItems.length > 1 && (
//                 <span className="text-sm bg-black/50 px-2 py-1 rounded backdrop-blur-sm">
//                   {currentImageIndex + 1} / {mediaItems.length}
//                 </span>
//               )}
//               <span className="text-sm">{post.service}</span>
//             </div>
//             <div className="flex items-center gap-2">
//               <button
//                 onClick={handleLike}
//                 className={`p-2 rounded-full transition-colors ${isLiked ? 'bg-red-500 text-white' : 'bg-black/50 text-white hover:bg-black/70'
//                   }`}
//               >
//                 <Heart size={18} fill={isLiked ? 'white' : 'none'} />
//               </button>
//               <button
//                 onClick={handleBookmark}
//                 className={`p-2 rounded-full transition-colors ${isBookmarked ? 'bg-blue-500 text-white' : 'bg-black/50 text-white hover:bg-black/70'
//                   }`}
//               >
//                 <Bookmark size={18} fill={isBookmarked ? 'white' : 'none'} />
//               </button>
//               <button
//                 onClick={handleShare}
//                 className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
//               >
//                 {copied ? <Check size={18} /> : <Copy size={18} />}
//               </button>
//               <button
//                 onClick={handleDownload}
//                 className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
//               >
//                 <Download size={18} />
//               </button>
//               <button
//                 onClick={() => setShowInfo(!showInfo)}
//                 className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
//               >
//                 <Info size={18} />
//               </button>
//               <button
//                 onClick={handleFullscreen}
//                 className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
//               >
//                 {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
//               </button>
//               <button
//                 onClick={onClose}
//                 className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
//               >
//                 <X size={18} />
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Navigation Arrows */}
//         {mediaItems.length > 1 && (
//           <>
//             {currentImageIndex > 0 && (
//               <button
//                 onClick={handlePreviousImage}
//                 className="absolute left-4 top-1/2 -translate-y-1/2 z-40 p-3 text-white bg-black/50 rounded-full hover:bg-black/70 transition-all backdrop-blur-sm hover:scale-110"
//               >
//                 <ChevronLeft size={28} />
//               </button>
//             )}

//             {currentImageIndex < mediaItems.length - 1 && (
//               <button
//                 onClick={handleNextImage}
//                 className="absolute right-4 top-1/2 -translate-y-1/2 z-40 p-3 text-white bg-black/50 rounded-full hover:bg-black/70 transition-all backdrop-blur-sm hover:scale-110"
//               >
//                 <ChevronRight size={28} />
//               </button>
//             )}
//           </>
//         )}

//         {/* Main Image Area */}
//         <div className="flex-grow flex items-center justify-center bg-black relative overflow-hidden">
//           <div
//             className="relative w-full h-full flex items-center justify-center"
//             style={{
//               transform: `scale(${zoomLevel}) rotate(${rotation}deg) translate(${dragOffset.x}px, ${dragOffset.y}px)`,
//               transition: isDragging ? 'none' : 'transform 0.3s ease'
//             }}
//           >
//             {currentMedia.type === 'video' ? (
//               <video
//                 src={currentMedia.url}
//                 className="max-w-full max-h-full object-contain"
//                 controls={false}
//                 autoPlay={isPlaying}
//                 loop
//                 muted
//                 onClick={(e) => e.stopPropagation()}
//               />
//             ) : (
//               <OptimizedImage
//                 src={currentMedia.url}
//                 alt={post.title}
//                 className="max-w-full max-h-full object-contain"
//                 priority={true}
//               />
//             )}
//           </div>
//         </div>

//         {/* Bottom Controls */}
//         <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'
//           }`}>
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-2">
//               {hasPrevious && (
//                 <button
//                   onClick={onPrevious}
//                   className="p-2 text-white hover:bg-white/20 rounded-full"
//                 >
//                   <ChevronLeft size={20} />
//                 </button>
//               )}
              
//               {currentMedia.type === 'video' && (
//                 <button
//                   onClick={() => setIsPlaying(!isPlaying)}
//                   className="p-2 text-white hover:bg-white/20 rounded-full"
//                 >
//                   {isPlaying ? <Pause size={20} /> : <Play size={20} />}
//                 </button>
//               )}
              
//               {hasNext && (
//                 <button
//                   onClick={onNext}
//                   className="p-2 text-white hover:bg-white/20 rounded-full"
//                 >
//                   <ChevronRight size={20} />
//                 </button>
//               )}
//             </div>

//             <div className="flex items-center gap-2">
//               <button
//                 onClick={handleZoomOut}
//                 className="p-2 text-white hover:bg-white/20 rounded-full"
//               >
//                 <ZoomOut size={20} />
//               </button>
//               <span className="text-white text-sm w-8 text-center">{Math.round(zoomLevel * 100)}%</span>
//               <button
//                 onClick={handleZoomIn}
//                 className="p-2 text-white hover:bg-white/20 rounded-full"
//               >
//                 <ZoomIn size={20} />
//               </button>
//               <button
//                 onClick={handleRotate}
//                 className="p-2 text-white hover:bg-white/20 rounded-full"
//               >
//                 <RotateCw size={20} />
//               </button>
//               <button
//                 onClick={handleReset}
//                 className="p-2 text-white hover:bg-white/20 rounded-full"
//               >
//                 <span className="text-xs">1:1</span>
//               </button>
//             </div>
//           </div>

//           {/* Progress Indicator */}
//           {totalCount > 1 && (
//             <div className="flex items-center justify-center mt-2 gap-1">
//               {Array.from({ length: totalCount }).map((_, index) => (
//                 <button
//                   key={index}
//                   onClick={() => { }} // Would navigate to that index
//                   className={`w-2 h-2 rounded-full transition-all duration-200 ${index === currentIndex ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/70'
//                     }`}
//                 />
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Info Panel */}
//         {showInfo && (
//           <div className="absolute bottom-20 left-4 right-4 bg-black/80 backdrop-blur-md rounded-lg p-4 text-white max-w-md">
//             <h3 className="font-semibold mb-3">{post.title}</h3>
//             <div className="space-y-2 text-sm">
//               <div className="flex justify-between">
//                 <span className="text-gray-400">Service:</span>
//                 <span>{post.service}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-gray-400">Published:</span>
//                 <span>{new Date(post.published).toLocaleDateString()}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-gray-400">Likes:</span>
//                 <span>{likes}</span>
//               </div>
//               {post.content && (
//                 <div>
//                   <span className="text-gray-400">Content:</span>
//                   <p className="mt-1 line-clamp-3">{post.content}</p>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// // --- COMPACT PROFILE VIEWER ---
// const CompactProfileViewer = ({
//   creator,
//   isOpen,
//   onClose
// }: {
//   creator: Creator | null;
//   isOpen: boolean;
//   onClose: () => void;
// }) => {
//   const [posts, setPosts] = useState<Post[]>([]);
//   const [profile, setProfile] = useState<Profile | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [loadingMore, setLoadingMore] = useState(false);
//   const [selectedPost, setSelectedPost] = useState<Post | null>(null);
//   const [isPostViewerOpen, setIsPostViewerOpen] = useState(false);
//   const [currentPostIndex, setCurrentPostIndex] = useState(0);
//   const [viewMode, setViewMode] = useState<'grid' | 'slideshow'>('grid');
//   const [gridColumns, setGridColumns] = useState(4);
//   const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'mostLiked'>('newest');
//   const [filterType, setFilterType] = useState<'all' | 'images' | 'videos'>('all');
//   const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set());
//   const [showSelection, setShowSelection] = useState(false);
//   const [hoverPreviewEnabled, setHoverPreviewEnabled] = useState(false);
//   const [movieModeActive, setMovieModeActive] = useState(false);
//   const [movieModeInfinite, setMovieModeInfinite] = useState(true);
//   const [currentPage, setCurrentPage] = useState(0);
//   const [hasMorePosts, setHasMorePosts] = useState(false);
//   const [isFollowing, setIsFollowing] = useState(false);
//   const [followers, setFollowers] = useState(Math.floor(Math.random() * 10000) + 1000);
//   const [isLiked, setIsLiked] = useState(false);
//   const [likes, setLikes] = useState(Math.floor(Math.random() * 1000) + 100);
//   const [isSyncing, setIsSyncing] = useState(false);
//   const [syncProgress, setSyncProgress] = useState(0);
//   const [isSynced, setIsSynced] = useState(false);
//   const [showCacheInfo, setShowCacheInfo] = useState(false);
//   const [cacheInfo, setCacheInfo] = useState({ count: 0, sizeMB: 0, maxSizeMB: 500 });

//   useEffect(() => {
//     if (!creator) return;

//     const fetchData = async () => {
//       setLoading(true);
//       try {
//         const isCoomer = COOMER_SERVICES.includes(creator.service);

//         // Fetch profile
//         const profileResponse = await axios.get<Profile>(
//           `${COOMER_POSTS_API_BASE_URL}/${creator.service}/user/${creator.id}/profile`,
//           { headers: isCoomer ? { 'Accept': 'text/css' } : {} }
//         );
//         setProfile(profileResponse.data);

//         // Check if posts are already synced for offline viewing
//         const syncedPosts = offlineSyncManager.getSyncedPosts(creator.id);
//         if (syncedPosts.length > 0) {
//           setPosts(syncedPosts);
//           setIsSynced(true);
//         } else {
//           // Fetch posts
//           const postsResponse = await axios.get<Post[]>(
//             `${COOMER_POSTS_API_BASE_URL}/${creator.service}/user/${creator.id}/posts?o=0`,
//             { headers: isCoomer ? { 'Accept': 'text/css' } : {} }
//           );

//           const transformedPosts: Post[] = postsResponse.data.map((post: any) => ({
//             id: post.id,
//             user: post.user || creator.id,
//             service: creator.service,
//             title: post.title || 'Untitled',
//             content: post.content || '',
//             published: post.published,
//             file: post.file,
//             attachments: post.attachments || []
//           }));

//           setPosts(transformedPosts);
//           setHasMorePosts(transformedPosts.length === POSTS_PER_PAGE && profileResponse.data.post_count > POSTS_PER_PAGE);
//         }
//       } catch (error: any) {
//         console.error('Failed to fetch data:', error);
//         toast.error('Failed to load creator data');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [creator]);

//   useEffect(() => {
//     // Update cache info
//     const updateCacheInfo = () => {
//       setCacheInfo(advancedImageCache.getCacheInfo());
//     };

//     updateCacheInfo();
//     const interval = setInterval(updateCacheInfo, 5000); // Update every 5 seconds

//     return () => clearInterval(interval);
//   }, []);

//   const loadMorePosts = useCallback(async () => {
//     if (!creator || !hasMorePosts || loadingMore) return;

//     setLoadingMore(true);
//     try {
//       const isCoomer = COOMER_SERVICES.includes(creator.service);
//       const offset = (currentPage + 1) * POSTS_PER_PAGE;

//       const response = await axios.get<Post[]>(
//         `${COOMER_POSTS_API_BASE_URL}/${creator.service}/user/${creator.id}/posts?o=${offset}`,
//         { headers: isCoomer ? { 'Accept': 'text/css' } : {} }
//       );

//       const transformedPosts: Post[] = response.data.map((post: any) => ({
//         id: post.id,
//         user: post.user || creator.id,
//         service: creator.service,
//         title: post.title || 'Untitled',
//         content: post.content || '',
//         published: post.published,
//         file: post.file,
//         attachments: post.attachments || []
//       }));

//       setPosts(prev => [...prev, ...transformedPosts]);
//       setCurrentPage(prev => prev + 1);

//       if (profile) {
//         setHasMorePosts((currentPage + 2) * POSTS_PER_PAGE < profile.post_count);
//       }
//     } catch (error: any) {
//       console.error('Failed to load more posts:', error);
//       toast.error('Failed to load more posts');
//     } finally {
//       setLoadingMore(false);
//     }
//   }, [creator, currentPage, hasMorePosts, loadingMore, profile]);

//   const filteredPosts = useMemo(() => {
//     let filtered = [...posts];

//     // Filter by type
//     if (filterType === 'images') {
//       filtered = filtered.filter(post =>
//         !post.file?.name?.includes('.mp4') &&
//         !post.file?.name?.includes('.mov') &&
//         !post.file?.name?.includes('.avi') &&
//         !post.file?.name?.includes('.webm') &&
//         !post.attachments?.some(att =>
//           att.name?.includes('.mp4') ||
//           att.name?.includes('.mov') ||
//           att.name?.includes('.avi') ||
//           att.name?.includes('.webm')
//         )
//       );
//     } else if (filterType === 'videos') {
//       filtered = filtered.filter(post =>
//         post.file?.name?.includes('.mp4') ||
//         post.file?.name?.includes('.mov') ||
//         post.file?.name?.includes('.avi') ||
//         post.file?.name?.includes('.webm') ||
//         post.attachments?.some(att =>
//           att.name?.includes('.mp4') ||
//           att.name?.includes('.mov') ||
//           att.name?.includes('.avi') ||
//           att.name?.includes('.webm')
//         )
//       );
//     }

//     // Sort by
//     switch (sortBy) {
//       case 'newest':
//         filtered.sort((a, b) => new Date(b.published).getTime() - new Date(a.published).getTime());
//         break;
//       case 'oldest':
//         filtered.sort((a, b) => new Date(a.published).getTime() - new Date(b.published).getTime());
//         break;
//       case 'mostLiked':
//         filtered.sort(() => Math.random() - 0.5);
//         break;
//     }

//     return filtered;
//   }, [posts, filterType, sortBy]);

//   const handlePostClick = useCallback((post: Post, index: number) => {
//     if (showSelection) {
//       const newSelectedPosts = new Set(selectedPosts);
//       if (newSelectedPosts.has(post.id)) {
//         newSelectedPosts.delete(post.id);
//       } else {
//         newSelectedPosts.add(post.id);
//       }
//       setSelectedPosts(newSelectedPosts);
//     } else {
//       setSelectedPost(post);
//       setCurrentPostIndex(index);
//       setIsPostViewerOpen(true);
//     }
//   }, [showSelection, selectedPosts]);

//   const handleNextPost = useCallback(() => {
//     if (currentPostIndex < filteredPosts.length - 1) {
//       setCurrentPostIndex(currentPostIndex + 1);
//       setSelectedPost(filteredPosts[currentPostIndex + 1]);
//     }
//   }, [currentPostIndex, filteredPosts]);

//   const handlePreviousPost = useCallback(() => {
//     if (currentPostIndex > 0) {
//       setCurrentPostIndex(currentPostIndex - 1);
//       setSelectedPost(filteredPosts[currentPostIndex - 1]);
//     }
//   }, [currentPostIndex, filteredPosts]);

//   const handleSelectAll = () => {
//     if (selectedPosts.size === filteredPosts.length) {
//       setSelectedPosts(new Set());
//     } else {
//       setSelectedPosts(new Set(filteredPosts.map(post => post.id)));
//     }
//   };

//   const handleDownloadSelected = async () => {
//     const downloadService = DownloadService.getInstance();
//     const selectedPostsList = filteredPosts.filter(post => selectedPosts.has(post.id));
    
//     await downloadService.downloadPosts(selectedPostsList, creator?.service || '');
//   };

//   const handleSyncForOffline = async () => {
//     if (!creator) return;
    
//     setIsSyncing(true);
//     setSyncProgress(0);
    
//     try {
//       // Simulate sync progress
//       const interval = setInterval(() => {
//         setSyncProgress(prev => {
//           if (prev >= 100) {
//             clearInterval(interval);
//             return 100;
//           }
//           return prev + 10;
//         });
//       }, 500);
      
//       await offlineSyncManager.syncCreatorPosts(creator.id, posts);
//       setIsSynced(true);
//       toast('Posts synced for offline viewing');
//     } catch (error) {
//       console.error('Failed to sync posts:', error);
//       toast.error('Failed to sync posts');
//     } finally {
//       setIsSyncing(false);
//       setSyncProgress(0);
//     }
//   };

//   const handleClearCache = () => {
//     advancedImageCache.clearCache();
//     toast('Cache cleared');
//   };

//   const handleFollow = () => {
//     setIsFollowing(!isFollowing);
//     setFollowers(prev => isFollowing ? prev - 1 : prev + 1);
//     toast(isFollowing ? 'Unfollowed' : 'Following');
//   };

//   const handleLike = () => {
//     setIsLiked(!isLiked);
//     setLikes(prev => isLiked ? prev - 1 : prev + 1);
//   };

//   const handleMovieModeToggle = () => {
//     setMovieModeActive(!movieModeActive);
//   };

//   if (!creator) return null;

//   return (
//     <>
//       <div className={`fixed inset-0 z-50 ${isOpen ? 'block' : 'hidden'}`}>
//         <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
//         <div className="absolute inset-0 bg-white dark:bg-gray-900 text-white overflow-hidden flex flex-col">
//           {/* Header */}
//           <div className="flex-shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-3">
//                 <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
//                   <img
//                     src={
//                       COOMER_SERVICES.includes(creator.service)
//                         ? `https://coomer.st/icons/${creator.service}/${creator.id}`
//                         : `https://kemono.su/icons/${creator.service}/${creator.id}`
//                     }
//                     alt={creator.name}
//                     className="w-full h-full object-cover"
//                   />
//                 </div>
//                 <div>
//                   <h2 className="text-xl font-bold">{creator.name}</h2>
//                   <p className="text-sm text-gray-500 dark:text-gray-400">
//                     {creator.service} • {profile?.post_count || 0} posts
//                   </p>
//                 </div>
//               </div>

//               <div className="flex items-center gap-2">
//                 <button
//                   onClick={handleFollow}
//                   className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${isFollowing
//                       ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white'
//                       : 'bg-blue-500 text-white hover:bg-blue-600'
//                     }`}
//                 >
//                   {isFollowing ? 'Following' : 'Follow'}
//                 </button>

//                 <button
//                   onClick={handleLike}
//                   className={`p-2 rounded-full transition-colors ${isLiked
//                       ? 'bg-red-500 text-white'
//                       : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-red-500 hover:text-white'
//                     }`}
//                 >
//                   <Heart size={16} className={isLiked ? 'fill-current' : ''} />
//                 </button>

//                 <span className="text-sm text-gray-500 dark:text-gray-400">
//                   {likes} likes • {followers} followers
//                 </span>

//                 <button
//                   onClick={handleMovieModeToggle}
//                   className="flex items-center gap-1 px-3 py-2 bg-purple-600 text-white text-sm rounded-full hover:bg-purple-700 transition-colors"
//                 >
//                   <Tv size={14} />
//                   Movie Mode
//                 </button>

//                 <button
//                   onClick={() => setShowCacheInfo(!showCacheInfo)}
//                   className="flex items-center gap-1 px-3 py-2 bg-gray-600 text-white text-sm rounded-full hover:bg-gray-700 transition-colors"
//                 >
//                   <HardDrive size={14} />
//                   Cache
//                 </button>

//                 <button
//                   onClick={onClose}
//                   className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
//                 >
//                   <X size={16} />
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* Controls */}
//           <div className="flex-shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-3">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-2">
//                 {showSelection && (
//                   <div className="flex items-center gap-2 mr-2">
//                     <button
//                       onClick={handleSelectAll}
//                       className="text-sm text-gray-600 dark:text-gray-400"
//                     >
//                       {selectedPosts.size === filteredPosts.length ? 'Deselect All' : 'Select All'}
//                     </button>
//                     <span className="text-sm text-gray-600 dark:text-gray-400">
//                       {selectedPosts.size} selected
//                     </span>
//                     <button
//                       onClick={handleDownloadSelected}
//                       disabled={selectedPosts.size === 0}
//                       className="text-sm text-blue-600 dark:text-blue-400 disabled:text-gray-400"
//                     >
//                       Download
//                     </button>
//                   </div>
//                 )}

//                 <button
//                   onClick={() => setShowSelection(!showSelection)}
//                   className={`p-2 rounded ${showSelection ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}
//                 >
//                   <Grid3x3 size={16} />
//                 </button>

//                 <button
//                   onClick={() => setHoverPreviewEnabled(!hoverPreviewEnabled)}
//                   className={`p-2 rounded ${hoverPreviewEnabled ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}
//                 >
//                   <MousePointer size={16} />
//                 </button>

//                 <select
//                   value={filterType}
//                   onChange={(e) => setFilterType(e.target.value as 'all' | 'images' | 'videos')}
//                   className="px-2 py-1 text-sm bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300"
//                 >
//                   <option value="all">All</option>
//                   <option value="images">Images</option>
//                   <option value="videos">Videos</option>
//                 </select>

//                 <select
//                   value={sortBy}
//                   onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'mostLiked')}
//                   className="px-2 py-1 text-sm bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300"
//                 >
//                   <option value="newest">Newest</option>
//                   <option value="oldest">Oldest</option>
//                   <option value="mostLiked">Most Liked</option>
//                 </select>

//                 <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded px-2 py-1">
//                   <span className="text-xs text-gray-600 dark:text-gray-400 mr-1">Columns</span>
//                   <input
//                     type="range"
//                     min="2"
//                     max="6"
//                     value={gridColumns}
//                     onChange={(e) => setGridColumns(parseInt(e.target.value))}
//                     className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
//                   />
//                   <span className="text-xs text-gray-600 dark:text-gray-400 ml-1">{gridColumns}</span>
//                 </div>

//                 <button
//                   onClick={handleSyncForOffline}
//                   disabled={isSyncing || isSynced}
//                   className={`flex items-center gap-1 px-3 py-1 text-sm rounded-full transition-colors ${
//                     isSynced 
//                       ? 'bg-green-600 text-white' 
//                       : isSyncing 
//                         ? 'bg-gray-400 text-white cursor-not-allowed' 
//                         : 'bg-blue-600 text-white hover:bg-blue-700'
//                   }`}
//                 >
//                   {isSyncing ? (
//                     <>
//                       <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                       {syncProgress}%
//                     </>
//                   ) : isSynced ? (
//                     <>
//                       <Wifi size={12} />
//                       Synced
//                     </>
//                   ) : (
//                     <>
//                       <WifiOff size={12} />
//                       Sync Offline
//                     </>
//                   )}
//                 </button>
//               </div>

//               <div className="flex items-center gap-2">
//                 <div className="flex bg-gray-100 dark:bg-gray-800 rounded">
//                   <button
//                     onClick={() => setViewMode('grid')}
//                     className={`p-2 rounded-l ${viewMode === 'grid' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}
//                   >
//                     <Grid3X3 size={16} />
//                   </button>
//                   <button
//                     onClick={() => setViewMode('slideshow')}
//                     className={`p-2 rounded-r ${viewMode === 'slideshow' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}
//                   >
//                     <PlayCircle size={16} />
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Content */}
//           <div className="flex-1 overflow-hidden">
//             {loading ? (
//               <div className="flex items-center justify-center h-full">
//                 <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
//               </div>
//             ) : filteredPosts.length === 0 ? (
//               <div className="flex items-center justify-center h-full">
//                 <p className="text-gray-500 dark:text-gray-400">No posts available</p>
//               </div>
//             ) : (
//               <div className="h-full overflow-y-auto">
//                 {viewMode === 'grid' ? (
//                   <div className="p-4">
//                     <CompactPostGrid
//                       posts={filteredPosts}
//                       onPostClick={handlePostClick}
//                       service={creator.service}
//                       selectedPosts={selectedPosts}
//                       showSelection={showSelection}
//                       gridColumns={gridColumns}
//                     />

//                     {hasMorePosts && (
//                       <div className="flex justify-center py-4">
//                         <button
//                           onClick={loadMorePosts}
//                           disabled={loadingMore}
//                           className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
//                         >
//                           {loadingMore ? (
//                             <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                           ) : 'Load More'}
//                         </button>
//                       </div>
//                     )}
//                   </div>
//                 ) : (
//                   <div className="h-full flex items-center justify-center bg-black">
//                     <div className="text-center text-white">
//                       <PlayCircle className="h-16 w-16 mx-auto mb-4" />
//                       <p className="text-xl">Slideshow Mode</p>
//                       <p className="text-sm text-gray-400 mt-2">Feature coming soon</p>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Cache Info Modal */}
//       {showCacheInfo && (
//         <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
//           <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
//             <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Cache Information</h3>
//             <div className="space-y-3">
//               <div className="flex justify-between">
//                 <span className="text-gray-600 dark:text-gray-400">Cached Images:</span>
//                 <span className="text-gray-900 dark:text-white">{cacheInfo.count}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-gray-600 dark:text-gray-400">Cache Size:</span>
//                 <span className="text-gray-900 dark:text-white">{cacheInfo.sizeMB} MB / {cacheInfo.maxSizeMB} MB</span>
//               </div>
//               <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
//                 <div 
//                   className="bg-blue-500 h-2 rounded-full" 
//                   style={{ width: `${(cacheInfo.sizeMB / cacheInfo.maxSizeMB) * 100}%` }}
//                 />
//               </div>
//             </div>
//             <div className="flex justify-end gap-2 mt-6">
//               <button
//                 onClick={handleClearCache}
//                 className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
//               >
//                 Clear Cache
//               </button>
//               <button
//                 onClick={() => setShowCacheInfo(false)}
//                 className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Gallery Viewer */}
//       {isPostViewerOpen && selectedPost && (
//         <GalleryViewer
//           post={selectedPost}
//           isOpen={isPostViewerOpen}
//           onClose={() => setIsPostViewerOpen(false)}
//           onNext={handleNextPost}
//           onPrevious={handlePreviousPost}
//           hasNext={currentPostIndex < filteredPosts.length - 1}
//           hasPrevious={currentPostIndex > 0}
//           currentIndex={currentPostIndex}
//           totalCount={filteredPosts.length}
//           service={creator.service}
//         />
//       )}

//       {/* Movie Mode Modal */}
//       {movieModeActive && (
//         <MovieMode
//           posts={filteredPosts}
//           onClose={() => setMovieModeActive(false)}
//           infiniteMode={movieModeInfinite}
//           service={creator.service}
//         />
//       )}
//     </>
//   );
// };

// // --- MAIN COMPONENT ---
// function RouteComponent() {
//   const [creators, setCreators] = useState<Creator[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedService, setSelectedService] = useState('all');
//   const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
//   const [apiError, setApiError] = useState<string | null>(null);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(0);
//   const [totalCreators, setTotalCreators] = useState(0);
//   const [hasMore, setHasMore] = useState(true);
//   const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
//   const [isProfileViewerOpen, setIsProfileViewerOpen] = useState(false);
//   const [isDarkMode, setIsDarkMode] = useState(true);
//   const [viewMode, setViewMode] = useState<'compact' | 'detailed'>('compact');
//   const [gridColumns, setGridColumns] = useState(6);
//   const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

//   const isCacheValid = useCallback(async () => {
//     try {
//       const cachedTimestamp = await storage.getItem(CACHE_TIMESTAMP_KEY) as string;
//       const cacheVersion = await storage.getItem(CACHE_VERSION_KEY) as string;

//       if (!cachedTimestamp || cacheVersion !== CACHE_VERSION) {
//         return false;
//       }

//       const timestamp = new Date(cachedTimestamp);
//       const now = new Date();
//       return (now.getTime() - timestamp.getTime()) < CACHE_EXPIRY_MS;
//     } catch (error) {
//       console.error('Error checking cache validity:', error);
//       return false;
//     }
//   }, []);

//   const loadFromIndexedDB = useCallback(async (page: number = 1) => {
//     try {
//       const isValid = await isCacheValid();
//       if (!isValid) return false;

//       const cacheKey = selectedService === 'all'
//         ? `creators:page:${page}`
//         : `creators:${selectedService}:page:${page}`;

//       const pageData = await storage.getItem(cacheKey) as Creator[];
//       const cachedTimestamp = await storage.getItem(CACHE_TIMESTAMP_KEY) as string;

//       if (pageData && pageData.length > 0) {
//         setCreators(prev => page === 1 ? pageData : [...prev, ...pageData]);
//         setLastUpdated(new Date(cachedTimestamp));
//         return true;
//       }

//       return false;
//     } catch (error) {
//       console.error('Error loading from IndexedDB:', error);
//       return false;
//     }
//   }, [isCacheValid, selectedService]);

//   const fetchCreators = useCallback(async (page: number = 1) => {
//     try {
//       setApiError(null);

//       if (page === 1) {
//         const cacheLoaded = await loadFromIndexedDB(page);
//         if (cacheLoaded) {
//           setLoading(false);
//           return;
//         }
//       }

//       if (page === 1) {
//         setLoading(true);
//       }

//       let apiUrl: string;

//       if (selectedService === 'all') {
//         const [coomerResponse, kemonoResponse] = await Promise.all([
//           axios.get<CreatorApiResponse>(`${COOMER_API_BASE_URL}?page=${page}&itemsPerPage=${Math.ceil(ITEMS_PER_PAGE / 2)}`),
//           axios.get<CreatorApiResponse>(`${KEMONO_API_BASE_URL}?page=${page}&itemsPerPage=${Math.ceil(ITEMS_PER_PAGE / 2)}`)
//         ]);

//         const combinedData = [...coomerResponse.data.data, ...kemonoResponse.data.data];
//         const combinedPagination = {
//           totalPages: Math.max(coomerResponse.data.pagination.totalPages, kemonoResponse.data.pagination.totalPages),
//           totalItems: coomerResponse.data.pagination.totalItems + kemonoResponse.data.pagination.totalItems,
//           isNextPage: coomerResponse.data.pagination.isNextPage || kemonoResponse.data.pagination.isNextPage,
//         };

//         setTotalPages(combinedPagination.totalPages);
//         setTotalCreators(combinedPagination.totalItems);
//         setHasMore(combinedPagination.isNextPage);

//         await storage.setItem(`creators:page:${page}`, combinedData);
//         setCreators(prev => page === 1 ? combinedData : [...prev, ...combinedData]);

//         if (page === 1) {
//           await storage.setItem(CACHE_TIMESTAMP_KEY, new Date().toISOString());
//           await storage.setItem(CACHE_VERSION_KEY, CACHE_VERSION);
//         }
//       } else if (selectedService === 'coomer' || selectedService === 'kemono') {
//         apiUrl = selectedService === 'coomer' ? COOMER_API_BASE_URL : KEMONO_API_BASE_URL;

//         const response = await axios.get<CreatorApiResponse>(`${apiUrl}?page=${page}&itemsPerPage=${ITEMS_PER_PAGE}`);
//         const { data, pagination } = response.data;

//         setTotalPages(pagination.totalPages);
//         setTotalCreators(pagination.totalItems);
//         setHasMore(pagination.isNextPage);

//         await storage.setItem(`creators:${selectedService}:page:${page}`, data);
//         setCreators(prev => page === 1 ? data : [...prev, ...data]);

//         if (page === 1) {
//           await storage.setItem(CACHE_TIMESTAMP_KEY, new Date().toISOString());
//           await storage.setItem(CACHE_VERSION_KEY, CACHE_VERSION);
//         }
//       } else {
//         const isCoomer = COOMER_SERVICES.includes(selectedService);
//         apiUrl = isCoomer ? COOMER_API_BASE_URL : KEMONO_API_BASE_URL;

//         const response = await axios.get<CreatorApiResponse>(`${apiUrl}/${selectedService}?page=${page}&itemsPerPage=${ITEMS_PER_PAGE}`);
//         const { data, pagination } = response.data;

//         setTotalPages(pagination.totalPages);
//         setTotalCreators(pagination.totalItems);
//         setHasMore(pagination.isNextPage);

//         await storage.setItem(`creators:${selectedService}:page:${page}`, data);
//         setCreators(prev => page === 1 ? data : [...prev, ...data]);

//         if (page === 1) {
//           await storage.setItem(CACHE_TIMESTAMP_KEY, new Date().toISOString());
//           await storage.setItem(CACHE_VERSION_KEY, CACHE_VERSION);
//         }
//       }

//       setLastUpdated(new Date());
//       if (page === 1) {
//         toast.success('Successfully loaded creators');
//       }
//     } catch (error: any) {
//       console.error('Fetch failed:', error);
//       setApiError('Failed to fetch creators data');
//       toast.error('Failed to fetch creators');

//       if (page === 1) {
//         await loadFromIndexedDB(page);
//       }
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   }, [loadFromIndexedDB, selectedService]);

//   const loadMoreCreators = useCallback(() => {
//     if (!hasMore || loading) return;
//     const nextPage = currentPage + 1;
//     setCurrentPage(nextPage);
//     fetchCreators(nextPage);
//   }, [currentPage, hasMore, loading, fetchCreators]);

//   useEffect(() => {
//     setCurrentPage(1);
//     setCreators([]);
//     fetchCreators(1);
//   }, [selectedService]);

//   const filteredCreators = useMemo(() => {
//     let filtered = creators;
    
//     if (showFavoritesOnly) {
//       const favoriteIds = favoritesManager.getFavorites();
//       filtered = filtered.filter(creator => favoriteIds.includes(creator.id));
//     }
    
//     if (!searchTerm.trim()) return filtered;
//     return filtered.filter(creator =>
//       creator.name.toLowerCase().includes(searchTerm.toLowerCase())
//     );
//   }, [creators, searchTerm, showFavoritesOnly]);

//   const handleRefresh = useCallback(() => {
//     setRefreshing(true);
//     setCurrentPage(1);
//     setCreators([]);
//     fetchCreators(1);
//   }, [fetchCreators]);

//   const handleCreatorClick = useCallback((creator: Creator) => {
//     setSelectedCreator(creator);
//     setIsProfileViewerOpen(true);
//   }, []);

//   const handleThemeToggle = () => {
//     setIsDarkMode(!isDarkMode);
//   };

//   // Preload creator images for better performance
//   useEffect(() => {
//     const imageUrls = creators.slice(0, 20).map(creator => {
//       if (COOMER_SERVICES.includes(creator.service)) {
//         return `https://coomer.st/icons/${creator.service}/${creator.id}`;
//       } else {
//         return `https://kemono.su/icons/${creator.service}/${creator.id}`;
//       }
//     });

//     advancedImageCache.preloadImages(imageUrls);
//   }, [creators]);

//   return (
//     <div className={`h-screen w-screen flex flex-col ${isDarkMode ? 'dark' : ''} bg-gray-50 dark:bg-gray-900`}>
//       {/* Ultra-compact Header */}
//       <header className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center gap-3">
//             <div className="flex items-center gap-2">
//               <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
//                 <Sparkles className="w-4 h-4 text-white" />
//               </div>
//               <h1 className="text-lg font-bold text-gray-900 dark:text-white">CreatorHub</h1>
//             </div>
//             <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
//               {totalCreators > 0 && `${filteredCreators.length}/${totalCreators} creators`}
//               {lastUpdated && <span className="ml-2">• Updated: {lastUpdated.toLocaleTimeString()}</span>}
//             </p>
//           </div>

//           <div className="flex items-center gap-2">
//             <div className="relative hidden sm:block">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
//               <input
//                 type="text"
//                 placeholder="Search creators..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="pl-10 pr-4 py-1.5 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-48"
//               />
//             </div>

//             <div className="flex items-center gap-1">
//               <select
//                 value={selectedService}
//                 onChange={(e) => setSelectedService(e.target.value)}
//                 className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               >
//                 {SERVICES.map((service) => (
//                   <option key={service.value} value={service.value}>
//                     {service.label}
//                   </option>
//                 ))}
//               </select>

//               <button
//                 onClick={handleRefresh}
//                 disabled={refreshing || loading}
//                 className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
//               >
//                 {refreshing || loading ? (
//                   <Loader2 className="h-4 w-4 animate-spin" />
//                 ) : (
//                   <RefreshCw className="h-4 w-4" />
//                 )}
//               </button>

//               <button
//                 onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
//                 className={`p-1.5 rounded-lg transition-colors ${
//                   showFavoritesOnly 
//                     ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400' 
//                     : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
//                 }`}
//               >
//                 <Star className="h-4 w-4" />
//               </button>

//               <button
//                 onClick={handleThemeToggle}
//                 className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
//               >
//                 {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
//               </button>
//             </div>

//             <div className="flex items-center gap-1">
//               <button
//                 onClick={() => setViewMode('compact')}
//                 className={`p-1.5 rounded-lg ${viewMode === 'compact' ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
//               >
//                 <LayoutGrid className="h-4 w-4" />
//               </button>

//               <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg px-2 py-1">
//                 <span className="text-xs text-gray-600 dark:text-gray-400 mr-1">Grid</span>
//                 <input
//                   type="range"
//                   min="3"
//                   max="8"
//                   value={gridColumns}
//                   onChange={(e) => setGridColumns(parseInt(e.target.value))}
//                   className="w-16 h-4 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
//                 />
//                 <span className="text-xs text-gray-600 dark:text-gray-400 ml-1">{gridColumns}</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </header>

//       {/* Main Content */}
//       <main className="flex-1 overflow-hidden">
//         {loading && creators.length === 0 ? (
//           <div className="flex flex-col justify-center items-center h-full">
//             <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
//             <p className="text-gray-500 dark:text-gray-400">Loading creators...</p>
//           </div>
//         ) : filteredCreators.length === 0 ? (
//           <div className="flex flex-col justify-center items-center h-full">
//             <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mb-4">
//               <Search className="h-8 w-8 text-gray-500" />
//             </div>
//             <p className="text-gray-500 dark:text-gray-400">
//               {searchTerm || showFavoritesOnly || selectedService !== 'all' ? 'No creators found matching your search or filter.' : 'No creators available.'}
//             </p>
//           </div>
//         ) : (
//           <div className="h-full overflow-y-auto">
//             <div className="p-4">
//               <div
//                 className="grid gap-2"
//                 style={{ gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))` }}
//               >
//                 {filteredCreators.map((creator) => (
//                   <CompactCreatorCard
//                     key={creator.id}
//                     creator={creator}
//                     onClick={() => handleCreatorClick(creator)}
//                   />
//                 ))}
//               </div>

//               {hasMore && (
//                 <div className="flex justify-center mt-4">
//                   <button
//                     onClick={loadMoreCreators}
//                     disabled={loading}
//                     className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
//                   >
//                     {loading ? (
//                       <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                     ) : 'Load More'}
//                   </button>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}
//       </main>

//       {/* Compact Profile Viewer */}
//       <CompactProfileViewer
//         creator={selectedCreator}
//         isOpen={isProfileViewerOpen}
//         onClose={() => setIsProfileViewerOpen(false)}
//       />
//     </div>
//   );
// }

// export const Route = createFileRoute('/coomerKemono')({
//   component: RouteComponent,
// });










// import React, { useState, useEffect, useCallback, useMemo, useRef, Suspense } from 'react';
// import axios from 'axios';
// import { createStorage } from 'unstorage';
// import indexedDbDriver from "unstorage/drivers/indexedb";
// import { createFileRoute } from '@tanstack/react-router';
// import { toast } from 'sonner';
// import {
//   Loader2, RefreshCw, Search, ImageOff, AlertCircle, Filter, X, Play, Pause,
//   ChevronLeft, ChevronRight, Heart, Share2, Bookmark, MoreHorizontal,
//   Grid3x3, Download, ZoomIn, ZoomOut, RotateCw, Shuffle, SkipForward, SkipBack,
//   Eye, Settings, Sliders, MousePointer, Sun, Moon, Monitor, Smartphone, Tablet,
//   Tv, Film, Power, FolderOpen, HardDrive, Package, Zap, Image as ImageIcon,
//   Wifi, WifiOff, PauseCircle, PlayCircle, Maximize2, Minimize2, Volume2, VolumeX,
//   Copy, Check, Info, ThumbsUp, ThumbsDown, Send, Smile, ChevronDown, ArrowUp,
//   Sparkles, Flame, TrendingUp, Clock, Calendar, User, Users, Hash, AtSign,
//   Camera, Layers, Aperture, Focus, Grid3X3, List, LayoutGrid, LayoutList,
//   Filter as FilterIcon, SortAsc, SortDesc, DownloadCloud, Share, Link2,
//   ExternalLink, HeartHandshake, Star, Award, Trophy, Crown, Gem,
//   Save
// } from 'lucide-react';

// // --- TYPES ---
// interface Creator {
//   favorited: number;
//   id: string;
//   indexed: number;
//   name: string;
//   service: string;
//   updated: number;
// }

// interface Profile {
//   id: string;
//   name: string;
//   service: string;
//   indexed: string;
//   updated: string;
//   public_id: string;
//   relation_id: string | null;
//   post_count: number;
//   dm_count: number;
//   share_count: number;
//   chat_count: number;
// }

// interface Post {
//   id: string;
//   user: string;
//   service: string;
//   title: string;
//   content: string;
//   published: string;
//   file?: {
//     name: string;
//     path: string;
//   };
//   attachments: Array<{
//     name: string;
//     path: string;
//   }>;
// }

// interface CreatorApiResponse {
//   message: string;
//   timestamp: number;
//   data: Creator[];
//   pagination: {
//     currentPage: number;
//     itemsPerPage: number;
//     totalPages: number;
//     totalItems: number;
//     isNextPage: boolean;
//     isPrevPage: boolean;
//   };
// }

// // --- CONFIGURATION ---
// const COOMER_SERVICES = ['onlyfans', 'fansly', 'candfans'];
// const KEMONO_SERVICES = ['patreon', 'fanbox', 'discord', 'fantia', 'afdian', 'boosty', 'dlsite', 'gumroad', 'subscribestar'];

// const SERVICES = [
//   { value: 'all', label: 'All Services' },
//   { value: 'coomer', label: 'Coomer (All)' },
//   ...COOMER_SERVICES.map(service => ({ value: service, label: service.charAt(0).toUpperCase() + service.slice(1) })),
//   { value: 'kemono', label: 'Kemono (All)' },
//   ...KEMONO_SERVICES.map(service => ({ value: service, label: service.charAt(0).toUpperCase() + service.slice(1) }))
// ];

// // --- STORAGE & CACHE ---
// const storage = createStorage({
//   driver: indexedDbDriver({
//     base: 'creators:',
//     dbName: 'creators-db',
//     storeName: 'creators-store'
//   })
// });

// const CACHE_TIMESTAMP_KEY = 'creators:timestamp';
// const CACHE_VERSION_KEY = 'creators:version';
// const CACHE_VERSION = '2.0';
// const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

// // --- API SETTINGS ---
// const COOMER_API_BASE_URL = 'https://kemono-api.mbaharip.com/coomer';
// const KEMONO_API_BASE_URL = 'https://kemono-api.mbaharip.com/kemono';
// const COOMER_POSTS_API_BASE_URL = 'https://coomer.st/api/v1';
// const KEMONO_POSTS_API_BASE_URL = 'https://kemono.su/api/v1';
// const ITEMS_PER_PAGE = 30;
// const POSTS_PER_PAGE = 20;

// // --- ELECTRON APIS ---
// declare global {
//   interface Window {
//     require: any;
//     electronAPI?: {
//       showSaveDialog: (options: any) => Promise<any>;
//       showOpenDialog: (options: any) => Promise<any>;
//       openPath: (path: string) => Promise<void>;
//       createDirectory: (path: string) => Promise<void>;
//       downloadFile: (url: string, destination: string, onProgress?: (progress: number) => void) => Promise<void>;
//       getAppPath: (name: string) => string;
//       getPath: (name: string) => string;
//     };
//   }
// }

// // --- ADVANCED IMAGE CACHE SYSTEM ---
// class AdvancedImageCache {
//   private cache = new Map<string, { url: string; timestamp: number; size: number }>();
//   private loadingPromises = new Map<string, Promise<string>>();
//   private maxCacheSize = 500;
//   private maxCacheSizeBytes = 500 * 1024 * 1024;
//   private cacheExpiry = 24 * 60 * 60 * 1000;
//   private currentCacheSize = 0;
//   private storageKey = 'advanced-image-cache';

//   constructor() {
//     this.loadCacheFromStorage();
//   }

//   async loadCacheFromStorage() {
//     try {
//       const cachedData = localStorage.getItem(this.storageKey);
//       if (cachedData) {
//         const parsedCache = JSON.parse(cachedData);
//         this.cache = new Map(parsedCache.entries);
//         this.currentCacheSize = parsedCache.size || 0;
//         this.cleanupExpiredEntries();
//       }
//     } catch (error) {
//       console.error('Failed to load cache from storage:', error);
//     }
//   }

//   saveCacheToStorage() {
//     try {
//       const cacheData = {
//         entries: Array.from(this.cache.entries()),
//         size: this.currentCacheSize
//       };
//       localStorage.setItem(this.storageKey, JSON.stringify(cacheData));
//     } catch (error) {
//       console.error('Failed to save cache to storage:', error);
//     }
//   }

//   async getImage(originalUrl: string): Promise<string> {
//     if (this.cache.has(originalUrl)) {
//       const cached = this.cache.get(originalUrl)!;
//       if (Date.now() - cached.timestamp < this.cacheExpiry) {
//         return cached.url;
//       } else {
//         this.removeFromCache(originalUrl);
//       }
//     }

//     if (this.loadingPromises.has(originalUrl)) {
//       return this.loadingPromises.get(originalUrl)!;
//     }

//     const loadingPromise = this.loadImage(originalUrl);
//     this.loadingPromises.set(originalUrl, loadingPromise);

//     try {
//       const url = await loadingPromise;
//       return url;
//     } finally {
//       this.loadingPromises.delete(originalUrl);
//     }
//   }

//   private async loadImage(originalUrl: string): Promise<string> {
//     try {
//       const response = await fetch(originalUrl);
//       const blob = await response.blob();
//       const objectUrl = URL.createObjectURL(blob);
//       const size = blob.size;

//       this.cache.set(originalUrl, { url: objectUrl, timestamp: Date.now(), size });
//       this.currentCacheSize += size;

//       if (this.cache.size > this.maxCacheSize || this.currentCacheSize > this.maxCacheSizeBytes) {
//         this.cleanupCache();
//       }

//       this.saveCacheToStorage();
//       return objectUrl;
//     } catch (error) {
//       console.error('Failed to load image:', error);
//       return originalUrl;
//     }
//   }

//   private removeFromCache(url: string) {
//     if (this.cache.has(url)) {
//       const cached = this.cache.get(url)!;
//       URL.revokeObjectURL(cached.url);
//       this.currentCacheSize -= cached.size;
//       this.cache.delete(url);
//     }
//   }

//   private cleanupExpiredEntries() {
//     const now = Date.now();
//     const expiredKeys: string[] = [];
    
//     this.cache.forEach((value, key) => {
//       if (now - value.timestamp > this.cacheExpiry) {
//         expiredKeys.push(key);
//       }
//     });

//     expiredKeys.forEach(key => this.removeFromCache(key));
//   }

//   private cleanupCache() {
//     const entries = Array.from(this.cache.entries());
//     entries.sort((a, b) => a[1].timestamp - b[1].timestamp);

//     while (
//       (this.cache.size > this.maxCacheSize || this.currentCacheSize > this.maxCacheSizeBytes) &&
//       entries.length > 0
//     ) {
//       const [url] = entries.shift()!;
//       this.removeFromCache(url);
//     }

//     this.saveCacheToStorage();
//   }

//   preloadImages(urls: string[]): void {
//     urls.forEach(url => {
//       if (!this.cache.has(url) && !this.loadingPromises.has(url)) {
//         this.getImage(url).catch(() => {});
//       }
//     });
//   }

//   clearCache() {
//     this.cache.forEach((value) => {
//       URL.revokeObjectURL(value.url);
//     });
    
//     this.cache.clear();
//     this.currentCacheSize = 0;
//     localStorage.removeItem(this.storageKey);
//   }

//   getCacheInfo() {
//     return {
//       count: this.cache.size,
//       sizeBytes: this.currentCacheSize,
//       sizeMB: Math.round(this.currentCacheSize / (1024 * 1024) * 100) / 100,
//       maxSizeMB: Math.round(this.maxCacheSizeBytes / (1024 * 1024))
//     };
//   }
// }

// const advancedImageCache = new AdvancedImageCache();

// // --- FAVORITES SYSTEM ---
// class FavoritesManager {
//   private storageKey = 'creator-favorites';
//   private favorites: Set<string> = new Set();

//   constructor() {
//     this.loadFavorites();
//   }

//   loadFavorites() {
//     try {
//       const stored = localStorage.getItem(this.storageKey);
//       if (stored) {
//         this.favorites = new Set(JSON.parse(stored));
//       }
//     } catch (error) {
//       console.error('Failed to load favorites:', error);
//     }
//   }

//   saveFavorites() {
//     try {
//       localStorage.setItem(this.storageKey, JSON.stringify(Array.from(this.favorites)));
//     } catch (error) {
//       console.error('Failed to save favorites:', error);
//     }
//   }

//   addFavorite(creatorId: string) {
//     this.favorites.add(creatorId);
//     this.saveFavorites();
//   }

//   removeFavorite(creatorId: string) {
//     this.favorites.delete(creatorId);
//     this.saveFavorites();
//   }

//   isFavorite(creatorId: string): boolean {
//     return this.favorites.has(creatorId);
//   }

//   getFavorites(): string[] {
//     return Array.from(this.favorites);
//   }
// }

// const favoritesManager = new FavoritesManager();

// // --- OFFLINE SYNC SYSTEM ---
// class OfflineSyncManager {
//   private storageKey = 'offline-sync-data';
//   private syncData: Map<string, Post[]> = new Map();
//   private isSyncing = false;
//   private syncProgress = 0;

//   async syncCreatorPosts(creatorId: string, posts: Post[]): Promise<void> {
//     this.isSyncing = true;
//     this.syncProgress = 0;

//     try {
//       for (let i = 0; i < posts.length; i++) {
//         await new Promise(resolve => setTimeout(resolve, 100));
//         this.syncProgress = Math.round((i / posts.length) * 100);
//       }

//       this.syncData.set(creatorId, posts);
//       this.saveSyncData();
//     } finally {
//       this.isSyncing = false;
//       this.syncProgress = 0;
//     }
//   }

//   getSyncedPosts(creatorId: string): Post[] {
//     return this.syncData.get(creatorId) || [];
//   }

//   isCreatorSynced(creatorId: string): boolean {
//     return this.syncData.has(creatorId);
//   }

//   getSyncProgress(): number {
//     return this.syncProgress;
//   }

//   isCurrentlySyncing(): boolean {
//     return this.isSyncing;
//   }

//   private saveSyncData() {
//     try {
//       const data = Array.from(this.syncData.entries());
//       localStorage.setItem(this.storageKey, JSON.stringify(data));
//     } catch (error) {
//       console.error('Failed to save sync data:', error);
//     }
//   }

//   loadSyncData() {
//     try {
//       const stored = localStorage.getItem(this.storageKey);
//       if (stored) {
//         const data = JSON.parse(stored);
//         this.syncData = new Map(data);
//       }
//     } catch (error) {
//       console.error('Failed to load sync data:', error);
//     }
//   }

//   clearSyncData() {
//     this.syncData.clear();
//     localStorage.removeItem(this.storageKey);
//   }
// }

// const offlineSyncManager = new OfflineSyncManager();
// offlineSyncManager.loadSyncData();

// // --- DOWNLOAD SERVICE ---
// class DownloadService {
//   private static instance: DownloadService;
//   private downloads: Map<string, {
//     id: string;
//     post: Post;
//     status: 'pending' | 'downloading' | 'completed' | 'error';
//     progress: number;
//     filePath?: string;
//     error?: string;
//   }> = new Map();

//   static getInstance(): DownloadService {
//     if (!DownloadService.instance) {
//       DownloadService.instance = new DownloadService();
//     }
//     return DownloadService.instance;
//   }

//   async selectDownloadDirectory(): Promise<string | null> {
//     try {
//       if (window.electronAPI) {
//         const result = await window.electronAPI.showOpenDialog({
//           properties: ['openDirectory'],
//           title: 'Select Download Directory'
//         });

//         if (!result.canceled && result.filePaths.length > 0) {
//           return result.filePaths[0];
//         }
//       } else {
//         const dir = prompt('Enter download directory path:');
//         return dir || null;
//       }
//     } catch (error) {
//       console.error('Error selecting directory:', error);
//       toast.error('Failed to select directory');
//       return null;
//     }
//     return null;
//   }

//   async downloadFile(
//     url: string,
//     destination: string,
//     onProgress?: (progress: number) => void,
//     downloadId?: string
//   ): Promise<string> {
//     try {
//       if (window.electronAPI) {
//         await window.electronAPI.downloadFile(url, destination, onProgress);
//         return destination;
//       } else {
//         const response = await fetch(url);
//         const blob = await response.blob();

//         const downloadUrl = URL.createObjectURL(blob);
//         const link = document.createElement('a');
//         link.href = downloadUrl;
//         link.download = destination.split('/').pop() || 'download';
//         document.body.appendChild(link);
//         link.click();
//         document.body.removeChild(link);
//         URL.revokeObjectURL(downloadUrl);

//         return destination;
//       }
//     } catch (error) {
//       console.error('Download error:', error);
//       throw error;
//     }
//   }

//   async downloadPosts(posts: Post[], service: string): Promise<void> {
//     const dir = await this.selectDownloadDirectory();
//     if (!dir) return;

//     posts.forEach(async (post, index) => {
//       const downloadId = `download-${post.id}-${Date.now()}`;
      
//       this.downloads.set(downloadId, {
//         id: downloadId,
//         post,
//         status: 'pending',
//         progress: 0
//       });

//       try {
//         this.downloads.get(downloadId)!.status = 'downloading';
        
//         const url = COOMER_SERVICES.includes(service)
//           ? `https://coomer.st${post.file?.path || ''}`
//           : `https://kemono.su${post.file?.path || ''}`;

//         const fileName = `${post.id}.${post.file?.name?.split('.').pop() || 'jpg'}`;
//         const filePath = `${dir}/${fileName}`;

//         await this.downloadFile(
//           url, 
//           filePath, 
//           (progress) => {
//             this.downloads.get(downloadId)!.progress = progress;
//           },
//           downloadId
//         );

//         this.downloads.get(downloadId)!.status = 'completed';
//         this.downloads.get(downloadId)!.filePath = filePath;
        
//         toast.success(`Downloaded: ${fileName}`);
//       } catch (error) {
//         console.error('Download failed:', error);
//         this.downloads.get(downloadId)!.status = 'error';
//         this.downloads.get(downloadId)!.error = error instanceof Error ? error.message : 'Unknown error';
//         toast.error(`Failed to download: ${post.title}`);
//       }
//     });
//   }

//   getDownloads() {
//     return Array.from(this.downloads.values());
//   }

//   openFileLocation(filePath: string): Promise<void> {
//     try {
//       if (window.electronAPI) {
//         return window.electronAPI.openPath(filePath);
//       } else {
//         window.open(`file://${filePath}`, '_blank');
//         return Promise.resolve();
//       }
//     } catch (error) {
//       console.error('Error opening file location:', error);
//       toast.error('Failed to open file location');
//       return Promise.reject(error);
//     }
//   }

//   async ensureDirectoryExists(dirPath: string): Promise<void> {
//     try {
//       if (window.electronAPI) {
//         await window.electronAPI.createDirectory(dirPath);
//       }
//     } catch (error) {
//       console.error('Error creating directory:', error);
//     }
//   }
// }

// // --- PERFORMANCE-OPTIMIZED IMAGE COMPONENT ---
// const OptimizedImage = React.memo(({
//   src,
//   alt,
//   className,
//   onLoad,
//   onError,
//   style,
//   objectFit = 'cover',
//   priority = false
// }: {
//   src: string;
//   alt: string;
//   className?: string;
//   onLoad?: () => void;
//   onError?: () => void;
//   style?: React.CSSProperties;
//   objectFit?: 'cover' | 'contain' | 'fill';
//   priority?: boolean;
// }) => {
//   const [imageSrc, setImageSrc] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isError, setIsError] = useState(false);
//   const [isInView, setIsInView] = useState(false);
//   const imgRef = useRef<HTMLImageElement>(null);

//   useEffect(() => {
//     if (!priority && !isInView) return;

//     const loadImage = async () => {
//       try {
//         setIsLoading(true);
//         setIsError(false);

//         const cachedUrl = await advancedImageCache.getImage(src);
//         setImageSrc(cachedUrl);
//         setIsLoading(false);
//         onLoad?.();
//       } catch (error) {
//         console.error('Error loading image:', error);
//         setImageSrc(src);
//         setIsLoading(false);
//         setIsError(true);
//         onError?.();
//       }
//     };

//     loadImage();
//   }, [src, priority, isInView, onLoad, onError]);

//   useEffect(() => {
//     if (!imgRef.current || priority) return;

//     const observer = new IntersectionObserver(
//       (entries) => {
//         entries.forEach((entry) => {
//           if (entry.isIntersecting) {
//             setIsInView(true);
//             observer.unobserve(entry.target);
//           }
//         });
//       },
//       { rootMargin: '100px' }
//     );

//     observer.observe(imgRef.current);

//     return () => {
//       if (imgRef.current) {
//         observer.unobserve(imgRef.current);
//       }
//     };
//   }, [priority]);

//   if (isError) {
//     return (
//       <div className={`flex items-center justify-center bg-gray-200 dark:bg-gray-800 ${className}`} style={style}>
//         <ImageOff size={24} className="text-gray-500 dark:text-gray-400" />
//       </div>
//     );
//   }

//   return (
//     <>
//       {isLoading && (
//         <div className={`absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-800 ${className}`} style={style}>
//           <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
//         </div>
//       )}
//       <img
//         ref={imgRef}
//         src={imageSrc || src}
//         alt={alt}
//         className={`${className} transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
//         style={{ ...style, objectFit }}
//         loading="lazy"
//       />
//     </>
//   );
// });

// // --- COMPACT CREATOR CARD ---
// // const CompactCreatorCard = React.memo(({
// //   creator,
// //   onClick
// // }: {
// //   creator: Creator;
// //   onClick: () => void;
// // }) => {
// //   const [imageError, setImageError] = useState(false);
// //   const [isHovered, setIsHovered] = useState(false);
// //   const [isLiked, setIsLiked] = useState(false);
// //   const [isFavorited, setIsFavorited] = useState(false);
// //   const [likes, setLikes] = useState(creator.favorited);

// //   useEffect(() => {
// //     setIsFavorited(favoritesManager.isFavorite(creator.id));
// //   }, [creator.id]);

// //   const getCreatorImageUrl = () => {
// //     if (COOMER_SERVICES.includes(creator.service)) {
// //       return `https://coomer.st/icons/${creator.service}/${creator.id}`;
// //     } else {
// //       return `https://kemono.su/icons/${creator.service}/${creator.id}`;
// //     }
// //   };

// //   const handleLike = (e: React.MouseEvent) => {
// //     e.stopPropagation();
// //     setIsLiked(!isLiked);
// //     setLikes(prev => isLiked ? prev - 1 : prev + 1);
// //   };

// //   const handleFavorite = (e: React.MouseEvent) => {
// //     e.stopPropagation();
// //     if (isFavorited) {
// //       favoritesManager.removeFavorite(creator.id);
// //       setIsFavorited(false);
// //       toast('Removed from favorites');
// //     } else {
// //       favoritesManager.addFavorite(creator.id);
// //       setIsFavorited(true);
// //       toast('Added to favorites');
// //     }
// //   };

// //   const getServiceColor = () => {
// //     if (COOMER_SERVICES.includes(creator.service)) {
// //       return 'from-purple-500 to-pink-500';
// //     } else {
// //       return 'from-blue-500 to-cyan-500';
// //     }
// //   };

// //   return (
// //     <div
// //       className="relative aspect-square overflow-hidden rounded-xl cursor-pointer group transform transition-all duration-300 hover:scale-105"
// //       onClick={onClick}
// //       onMouseEnter={() => setIsHovered(true)}
// //       onMouseLeave={() => setIsHovered(false)}
// //     >
// //       <div className={`absolute inset-0 bg-gradient-to-br ${getServiceColor()} opacity-80`} />

// //       <div className="absolute inset-0 p-2">
// //         {!imageError ? (
// //           <OptimizedImage
// //             src={getCreatorImageUrl()}
// //             alt={creator.name}
// //             className="w-full h-full object-cover rounded-lg"
// //             onError={() => setImageError(true)}
// //           />
// //         ) : (
// //           <div className="w-full h-full bg-gray-800 rounded-lg flex items-center justify-center">
// //             <User size={24} className="text-gray-600" />
// //           </div>
// //         )}
// //       </div>

// //       <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-3 flex flex-col justify-between transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'
// //         }`}>
// //         <div className="flex justify-end gap-1">
// //           <button
// //             onClick={handleFavorite}
// //             className="p-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
// //           >
// //             <Star size={14} className={isFavorited ? 'fill-yellow-500 text-yellow-500' : ''} />
// //           </button>
// //           <button
// //             onClick={handleLike}
// //             className="p-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
// //           >
// //             <Heart size={14} className={isLiked ? 'fill-red-500 text-red-500' : ''} />
// //           </button>
// //         </div>

// //         <div>
// //           <h3 className="text-white font-bold text-sm truncate">{creator.name}</h3>
// //           <div className="flex items-center justify-between">
// //             <span className="text-white/80 text-xs">{creator.service}</span>
// //             <span className="text-white/80 text-xs flex items-center gap-1">
// //               <Heart size={10} />
// //               {likes}
// //             </span>
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // });

// // --- COMPACT CREATOR CARD ---
// const CompactCreatorCard = React.memo(({
//   creator,
//   onClick
// }: {
//   creator: Creator;
//   onClick: () => void;
// }) => {
//   const [imageError, setImageError] = useState(false);
//   const [isHovered, setIsHovered] = useState(false);
//   const [isLiked, setIsLiked] = useState(false);
//   const [isFavorited, setIsFavorited] = useState(false);
//   const [likes, setLikes] = useState(creator.favorited);

//   useEffect(() => {
//     setIsFavorited(favoritesManager.isFavorite(creator.id));
//   }, [creator.id]);

//   const getCreatorImageUrl = () => {
//     if (COOMER_SERVICES.includes(creator.service)) {
//       return `https://coomer.st/icons/${creator.service}/${creator.id}`;
//     } else {
//       return `https://kemono.su/icons/${creator.service}/${creator.id}`;
//     }
//   };

//   const handleLike = (e: React.MouseEvent) => {
//     e.stopPropagation();
//     setIsLiked(!isLiked);
//     setLikes(prev => isLiked ? prev - 1 : prev + 1);
//   };

//   const handleFavorite = (e: React.MouseEvent) => {
//     e.stopPropagation();
//     if (isFavorited) {
//       favoritesManager.removeFavorite(creator.id);
//       setIsFavorited(false);
//       toast('Removed from favorites');
//     } else {
//       favoritesManager.addFavorite(creator.id);
//       setIsFavorited(true);
//       toast('Added to favorites');
//     }
//   };

//   const getServiceColor = () => {
//     if (COOMER_SERVICES.includes(creator.service)) {
//       return 'from-purple-500 to-pink-500';
//     } else {
//       return 'from-blue-500 to-cyan-500';
//     }
//   };

//   return (
//     <div
//       className="relative aspect-square overflow-hidden rounded-xl cursor-pointer group transform transition-all duration-300 hover:scale-105"
//       onClick={onClick}
//       onMouseEnter={() => setIsHovered(true)}
//       onMouseLeave={() => setIsHovered(false)}
//     >
//       <div className={`absolute inset-0 bg-gradient-to-br ${getServiceColor()} opacity-80`} />

//       <div className="absolute inset-0 p-2">
//         {!imageError ? (
//           <img
//             src={getCreatorImageUrl()}
//             alt={creator.name}
//             className="w-full h-full object-cover rounded-lg"
//             onError={() => setImageError(true)}
//             loading="lazy"
//           />
//         ) : (
//           <div className="w-full h-full bg-gray-800 rounded-lg flex items-center justify-center">
//             <User size={24} className="text-gray-600" />
//           </div>
//         )}
//       </div>

//       <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-3 flex flex-col justify-between transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'
//         }`}>
//         <div className="flex justify-end gap-1">
//           <button
//             onClick={handleFavorite}
//             className="p-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
//           >
//             <Star size={14} className={isFavorited ? 'fill-yellow-500 text-yellow-500' : ''} />
//           </button>
//           <button
//             onClick={handleLike}
//             className="p-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
//           >
//             <Heart size={14} className={isLiked ? 'fill-red-500 text-red-500' : ''} />
//           </button>
//         </div>

//         <div>
//           <h3 className="text-white font-bold text-sm truncate">{creator.name}</h3>
//           <div className="flex items-center justify-between">
//             <span className="text-white/80 text-xs">{creator.service}</span>
//             <span className="text-white/80 text-xs flex items-center gap-1">
//               <Heart size={10} />
//               {likes}
//             </span>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// });


// // --- COMPACT POST GRID ---
// const CompactPostGrid = React.memo(({
//   posts,
//   onPostClick,
//   service,
//   selectedPosts,
//   showSelection,
//   gridColumns = 4,
//   onLoadMore
// }: {
//   posts: Post[];
//   onPostClick: (post: Post, index: number) => void;
//   service: string;
//   selectedPosts: Set<string>;
//   showSelection: boolean;
//   gridColumns?: number;
//   onLoadMore?: () => void;
// }) => {
//   const [hoveredPost, setHoveredPost] = useState<Post | null>(null);
//   const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
//   const [hoverPreviewEnabled, setHoverPreviewEnabled] = useState(false);
//   const loadMoreRef = useRef<HTMLDivElement>(null);

//   // Infinite scroll for posts
//   useEffect(() => {
//     if (!loadMoreRef.current || !onLoadMore) return;

//     const observer = new IntersectionObserver(
//       (entries) => {
//         if (entries[0].isIntersecting) {
//           onLoadMore();
//         }
//       },
//       { threshold: 0.1 }
//     );

//     observer.observe(loadMoreRef.current);

//     return () => {
//       if (loadMoreRef.current) {
//         observer.unobserve(loadMoreRef.current);
//       }
//     };
//   }, [onLoadMore]);

//   // Track mouse position for hover preview
//   useEffect(() => {
//     const handleMouseMove = (e: MouseEvent) => {
//       setMousePosition({ x: e.clientX, y: e.clientY });
//     };

//     if (hoverPreviewEnabled) {
//       window.addEventListener('mousemove', handleMouseMove);
//     }

//     return () => {
//       window.removeEventListener('mousemove', handleMouseMove);
//     };
//   }, [hoverPreviewEnabled]);

//   // Preload images for better performance
//   useEffect(() => {
//     const imageUrls = posts.slice(0, 20).map(post => {
//       if (post.file) {
//         const baseUrl = COOMER_SERVICES.includes(service) ? 'https://coomer.st' : 'https://kemono.su';
//         return `${baseUrl}${post.file.path}`;
//       }
//       if (post.attachments && post.attachments.length > 0) {
//         const baseUrl = COOMER_SERVICES.includes(service) ? 'https://coomer.st' : 'https://kemono.su';
//         return `${baseUrl}${post.attachments[0].path}`;
//       }
//       return '';
//     }).filter(Boolean);

//     advancedImageCache.preloadImages(imageUrls);
//   }, [posts, service]);

//   const getPostImageUrl = (post: Post) => {
//     if (post.file) {
//       const baseUrl = COOMER_SERVICES.includes(service) ? 'https://coomer.st' : 'https://kemono.su';
//       return `${baseUrl}${post.file.path}`;
//     }
//     if (post.attachments && post.attachments.length > 0) {
//       const baseUrl = COOMER_SERVICES.includes(service) ? 'https://coomer.st' : 'https://kemono.su';
//       return `${baseUrl}${post.attachments[0].path}`;
//     }
//     return null;
//   };

//   const isVideo = (filename?: string) => {
//     if (!filename) return false;
//     return filename.includes('.mp4') || filename.includes('.mov') || filename.includes('.avi') || filename.includes('.webm');
//   };

//   return (
//     <>
//       <div
//         className={`grid gap-1 w-full`}
//         style={{ gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))` }}
//       >
//         {posts.map((post, index) => {
//           const imageUrl = getPostImageUrl(post);
//           const isSelected = selectedPosts.has(post.id);
//           const hasVideo = isVideo(post.file?.name || post.attachments?.[0]?.name);
//           const hasMultiple = post.attachments && post.attachments.length > 0;

//           return (
//             <div
//               key={post.id}
//               className={`relative aspect-square overflow-hidden rounded-lg cursor-pointer group transform transition-all duration-300 hover:scale-105 ${showSelection && isSelected ? 'ring-2 ring-blue-500' : ''
//                 }`}
//               onClick={() => onPostClick(post, index)}
//               onMouseEnter={() => setHoveredPost(post)}
//               onMouseLeave={() => setHoveredPost(null)}
//             >
//               {showSelection && (
//                 <div className="absolute top-2 left-2 z-10">
//                   <div className={`w-5 h-5 rounded-full border-2 border-white flex items-center justify-center ${isSelected ? 'bg-blue-500' : 'bg-black/50'
//                     }`}>
//                     {isSelected && (
//                       <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
//                         <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
//                       </svg>
//                     )}
//                   </div>
//                 </div>
//               )}

//               {hasVideo && (
//                 <div className="absolute top-2 right-2 z-10 bg-black/50 rounded-full p-1">
//                   <PlayCircle size={12} className="text-white" />
//                 </div>
//               )}

//               {hasMultiple && (
//                 <div className="absolute top-2 right-2 z-10 bg-black/50 rounded-full px-1.5 py-0.5">
//                   <span className="text-xs text-white">+{post.attachments.length}</span>
//                 </div>
//               )}

//               {imageUrl ? (
//                 <OptimizedImage
//                   src={imageUrl}
//                   alt={post.title}
//                   className="w-full h-full object-cover"
//                 />
//               ) : (
//                 <div className="w-full h-full bg-gray-800 flex items-center justify-center">
//                   <ImageOff size={24} className="text-gray-600" />
//                 </div>
//               )}

//               <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
//                 <div className="absolute bottom-0 left-0 right-0 p-2">
//                   <p className="text-white text-xs font-medium truncate">{post.title}</p>
//                 </div>
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       {/* Infinite scroll trigger */}
//       {onLoadMore && (
//         <div ref={loadMoreRef} className="flex justify-center py-4">
//           <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
//         </div>
//       )}

//       {/* Hover Preview */}
//       {hoverPreviewEnabled && hoveredPost && (
//         <HoverPreview
//           post={hoveredPost}
//           enabled={hoverPreviewEnabled}
//           mousePosition={mousePosition}
//           service={service}
//         />
//       )}
//     </>
//   );
// });

// // --- HOVER PREVIEW COMPONENT ---
// const HoverPreview = ({
//   post,
//   enabled,
//   mousePosition,
//   service
// }: {
//   post: Post;
//   enabled: boolean;
//   mousePosition: { x: number; y: number };
//   service: string;
// }) => {
//   const [position, setPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });
//   const [isVisible, setIsVisible] = useState(false);

//   const getMediaUrl = (path: string, service: string) => {
//     if (COOMER_SERVICES.includes(service)) {
//       return `https://coomer.st${path}`;
//     } else {
//       return `https://kemono.su${path}`;
//     }
//   };

//   const mediaUrl = post.file ? getMediaUrl(post.file.path, service) :
//     post.attachments.length > 0 ? getMediaUrl(post.attachments[0].path, service) : null;

//   useEffect(() => {
//     if (!enabled || !mediaUrl) return;

//     const updatePosition = () => {
//       const viewportWidth = window.innerWidth;
//       const viewportHeight = window.innerHeight;
//       const previewWidth = Math.min(viewportWidth * 0.7, 900);
//       const previewHeight = Math.min(viewportHeight * 0.8, 700);

//       let left = mousePosition.x + 20;
//       let top = mousePosition.y - previewHeight / 2;

//       if (left + previewWidth > viewportWidth) {
//         left = mousePosition.x - previewWidth - 20;
//       }

//       if (top < 10) {
//         top = 10;
//       } else if (top + previewHeight > viewportHeight - 10) {
//         top = viewportHeight - previewHeight - 10;
//       }

//       setPosition({ top, left, width: previewWidth, height: previewHeight });
//     };

//     updatePosition();

//     const handleResize = () => updatePosition();
//     window.addEventListener('resize', handleResize);

//     return () => window.removeEventListener('resize', handleResize);
//   }, [enabled, mousePosition, mediaUrl]);

//   useEffect(() => {
//     if (enabled && mediaUrl) {
//       const timer = setTimeout(() => setIsVisible(true), 300);
//       return () => clearTimeout(timer);
//     } else {
//       setIsVisible(false);
//     }
//   }, [enabled, mediaUrl]);

//   if (!enabled || !isVisible || !mediaUrl) return null;

//   return (
//     <div
//       className="fixed z-50 bg-black rounded-lg shadow-2xl overflow-hidden border border-gray-800"
//       style={{
//         top: `${position.top}px`,
//         left: `${position.left}px`,
//         width: `${position.width}px`,
//         height: `${position.height}px`,
//       }}
//     >
//       <OptimizedImage
//         src={mediaUrl}
//         alt={`Preview of ${post.id}`}
//         className="w-full h-full"
//         objectFit="cover"
//       />
//       <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 text-white">
//         <p className="text-sm font-semibold truncate">{post.title}</p>
//         <div className="flex items-center gap-2 mt-1">
//           <span className="flex items-center gap-1 text-xs">
//             <Heart size={10} />
//             {Math.floor(Math.random() * 1000) + 100}
//           </span>
//           <span className="flex items-center gap-1 text-xs">
//             <Eye size={10} />
//             {Math.floor(Math.random() * 10000) + 1000}
//           </span>
//         </div>
//       </div>
//     </div>
//   );
// };

// // --- MOVIE MODE COMPONENT ---
// const MovieMode = ({
//   posts,
//   onClose,
//   infiniteMode,
//   service
// }: {
//   posts: Post[];
//   onClose: () => void;
//   infiniteMode: boolean;
//   service: string;
// }) => {
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [showControls, setShowControls] = useState(true);
//   const intervalRef = useRef<NodeJS.Timeout | null>(null);
//   const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

//   const getDisplayPosts = () => {
//     const result = [];
//     const startIndex = currentIndex * 4;

//     for (let i = 0; i < 4; i++) {
//       const index = (startIndex + i) % posts.length;
//       result.push(posts[index]);
//     }

//     return result;
//   };

//   const displayPosts = getDisplayPosts();

//   useEffect(() => {
//     if (isPlaying) {
//       intervalRef.current = setInterval(() => {
//         setCurrentIndex(prev => {
//           const maxIndex = Math.ceil(posts.length / 4) - 1;
//           if (infiniteMode && prev >= maxIndex) {
//             return 0;
//           }
//           return prev < maxIndex ? prev + 1 : prev;
//         });
//       }, 4000);
//     } else {
//       if (intervalRef.current) {
//         clearInterval(intervalRef.current);
//         intervalRef.current = null;
//       }
//     }

//     return () => {
//       if (intervalRef.current) {
//         clearInterval(intervalRef.current);
//         intervalRef.current = null;
//       }
//     };
//   }, [isPlaying, posts.length, infiniteMode]);

//   const handleMouseMove = () => {
//     setShowControls(true);
//     if (controlsTimeoutRef.current) {
//       clearTimeout(controlsTimeoutRef.current);
//     }
//     controlsTimeoutRef.current = setTimeout(() => {
//       setShowControls(false);
//     }, 3000);
//   };

//   const handleStart = () => {
//     setIsPlaying(true);
//   };

//   const handleStop = () => {
//     setIsPlaying(false);
//   };

//   const getPostImageUrl = (post: Post) => {
//     if (post.file) {
//       const baseUrl = COOMER_SERVICES.includes(service) ? 'https://coomer.st' : 'https://kemono.su';
//       return `${baseUrl}${post.file.path}`;
//     }
//     if (post.attachments && post.attachments.length > 0) {
//       const baseUrl = COOMER_SERVICES.includes(service) ? 'https://coomer.st' : 'https://kemono.su';
//       return `${baseUrl}${post.attachments[0].path}`;
//     }
//     return null;
//   };

//   return (
//     <div
//       className="fixed inset-0 bg-black z-50 flex items-center justify-center"
//       onClick={onClose}
//       onMouseMove={handleMouseMove}
//     >
//       <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
//         <div className="absolute inset-8 border-8 border-gray-700 rounded-3xl shadow-2xl">
//           <div className="absolute inset-4 border-4 border-gray-600 rounded-2xl">
//             <div className="absolute inset-2 bg-black rounded-xl overflow-hidden">
//               <div className="grid grid-cols-2 grid-rows-2 gap-1 h-full">
//                 {displayPosts.map((post, index) => {
//                   const imageUrl = getPostImageUrl(post);
//                   return (
//                     <div key={index} className="relative bg-gray-900 overflow-hidden">
//                       {imageUrl ? (
//                         <OptimizedImage
//                           src={imageUrl}
//                           alt={`Movie mode post ${index + 1}`}
//                           className="w-full h-full"
//                           objectFit="cover"
//                         />
//                       ) : (
//                         <div className="w-full h-full flex items-center justify-center">
//                           <ImageOff size={24} className="text-gray-600" />
//                         </div>
//                       )}
//                     </div>
//                   );
//                 })}
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="absolute top-12 left-1/2 transform -translate-x-1/2 text-gray-600 text-2xl font-bold">
//           CREATOR TV
//         </div>

//         <div className="absolute bottom-12 right-12 w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center shadow-lg">
//           <Power size={24} className="text-gray-500" />
//         </div>
//       </div>

//       <div className={`absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'
//         }`}>
//         <div className="flex justify-between items-center">
//           <div className="flex items-center gap-4">
//             <h2 className="text-white text-xl font-bold flex items-center gap-2">
//               <Tv size={24} />
//               Movie Mode
//             </h2>
//             <div className="flex items-center gap-2">
//               {!isPlaying ? (
//                 <button
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     handleStart();
//                   }}
//                   className="p-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors"
//                 >
//                   <Play size={20} />
//                 </button>
//               ) : (
//                 <button
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     handleStop();
//                   }}
//                   className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
//                 >
//                   <Pause size={20} />
//                 </button>
//               )}
//               <button
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   setCurrentIndex(Math.max(0, currentIndex - 1));
//                 }}
//                 className="p-2 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition-colors"
//               >
//                 <ChevronLeft size={20} />
//               </button>
//               <button
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   setCurrentIndex(prev => {
//                     const maxIndex = Math.ceil(posts.length / 4) - 1;
//                     return prev < maxIndex ? prev + 1 : prev;
//                   });
//                 }}
//                 className="p-2 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition-colors"
//               >
//                 <ChevronRight size={20} />
//               </button>
//             </div>
//             <div className="flex items-center gap-2">
//               <label className="text-white text-sm flex items-center gap-1">
//                 <input
//                   type="checkbox"
//                   checked={infiniteMode}
//                   onChange={() => { }}
//                   className="rounded"
//                 />
//                 Infinite Loop
//               </label>
//             </div>
//           </div>
//           <button
//             onClick={(e) => {
//               e.stopPropagation();
//               onClose();
//             }}
//             className="p-2 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition-colors"
//           >
//             <X size={20} />
//           </button>
//         </div>
//       </div>

//       <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'
//         }`}>
//         <div className="max-w-4xl mx-auto">
//           <div className="w-full bg-gray-700 rounded-full h-2">
//             <div
//               className="bg-blue-500 h-2 rounded-full transition-all duration-1000 ease-linear"
//               style={{
//                 width: `${((currentIndex + 1) / Math.ceil(posts.length / 4)) * 100}%`
//               }}
//             />
//           </div>
//           <p className="text-white text-sm mt-2 text-center">
//             Set {currentIndex + 1} / {Math.ceil(posts.length / 4)} • {posts.length} posts
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// // --- GALLERY VIEWER ---
// const GalleryViewer = ({
//   post,
//   isOpen,
//   onClose,
//   onNext,
//   onPrevious,
//   hasNext,
//   hasPrevious,
//   currentIndex,
//   totalCount,
//   service
// }: {
//   post: Post | null;
//   isOpen: boolean;
//   onClose: () => void;
//   onNext: () => void;
//   onPrevious: () => void;
//   hasNext: boolean;
//   hasPrevious: boolean;
//   currentIndex: number;
//   totalCount: number;
//   service: string;
// }) => {
//   const [currentImageIndex, setCurrentImageIndex] = useState(0);
//   const [isFullscreen, setIsFullscreen] = useState(false);
//   const [showInfo, setShowInfo] = useState(false);
//   const [isLiked, setIsLiked] = useState(false);
//   const [isBookmarked, setIsBookmarked] = useState(false);
//   const [likes, setLikes] = useState(Math.floor(Math.random() * 1000) + 100);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [showControls, setShowControls] = useState(true);
//   const [zoomLevel, setZoomLevel] = useState(1);
//   const [rotation, setRotation] = useState(0);
//   const [isDragging, setIsDragging] = useState(false);
//   const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
//   const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
//   const [copied, setCopied] = useState(false);
//   const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
//   const containerRef = useRef<HTMLDivElement>(null);

//   const getMediaUrl = (path: string, service: string) => {
//     if (COOMER_SERVICES.includes(service)) {
//       return `https://coomer.st${path}`;
//     } else {
//       return `https://kemono.su${path}`;
//     }
//   };

//   const mediaItems = useMemo(() => {
//     if (!post) return [];
    
//     const items = [];
    
//     if (post.file) {
//       items.push({
//         type: post.file.name?.includes('.mp4') || 
//               post.file.name?.includes('.mov') || 
//               post.file.name?.includes('.avi') || 
//               post.file.name?.includes('.webm') ? 'video' : 'image',
//         url: getMediaUrl(post.file.path, service),
//         name: post.file.name
//       });
//     }
    
//     if (post.attachments && post.attachments.length > 0) {
//       post.attachments.forEach(att => {
//         items.push({
//           type: att.name?.includes('.mp4') || 
//                 att.name?.includes('.mov') || 
//                 att.name?.includes('.avi') || 
//                 att.name?.includes('.webm') ? 'video' : 'image',
//           url: getMediaUrl(att.path, service),
//           name: att.name
//         });
//       });
//     }
    
//     return items;
//   }, [post, service]);

//   const currentMedia = mediaItems[currentImageIndex];

//   const handleLike = () => {
//     setIsLiked(!isLiked);
//     setLikes(prev => isLiked ? prev - 1 : prev + 1);
//   };

//   const handleBookmark = () => {
//     setIsBookmarked(!isBookmarked);
//     toast(isBookmarked ? 'Removed from bookmarks' : 'Added to bookmarks');
//   };

//   const handleShare = async () => {
//     if (currentMedia) {
//       try {
//         await navigator.clipboard.writeText(currentMedia.url);
//         setCopied(true);
//         setTimeout(() => setCopied(false), 2000);
//         toast('Link copied to clipboard');
//       } catch (err) {
//         console.error('Failed to copy link:', err);
//       }
//     }
//   };

//   const handleDownload = async () => {
//     if (!currentMedia) return;

//     const downloadService = DownloadService.getInstance();
//     const dir = await downloadService.selectDownloadDirectory();
//     if (!dir) return;

//     const fileName = currentMedia.name || `${post?.id || 'download'}.${currentMedia.type === 'video' ? 'mp4' : 'jpg'}`;
//     const filePath = `${dir}/${fileName}`;

//     try {
//       await downloadService.downloadFile(currentMedia.url, filePath);
//       toast.success(`Downloaded: ${fileName}`);
//     } catch (error) {
//       console.error('Download failed:', error);
//       toast.error('Download failed');
//     }
//   };

//   const handleFullscreen = () => {
//     if (!document.fullscreenElement) {
//       containerRef.current?.requestFullscreen();
//       setIsFullscreen(true);
//     } else {
//       document.exitFullscreen();
//       setIsFullscreen(false);
//     }
//   };

//   const handleZoomIn = () => {
//     setZoomLevel(prev => Math.min(prev + 0.25, 3));
//   };

//   const handleZoomOut = () => {
//     setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
//   };

//   const handleRotate = () => {
//     setRotation(prev => (prev + 90) % 360);
//   };

//   const handleReset = () => {
//     setZoomLevel(1);
//     setRotation(0);
//     setDragOffset({ x: 0, y: 0 });
//   };

//   const handleMouseDown = (e: React.MouseEvent) => {
//     if (zoomLevel > 1) {
//       setIsDragging(true);
//       setDragStart({ x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y });
//     }
//   };

//   const handleMouseMove = (e: React.MouseEvent) => {
//     if (isDragging) {
//       setDragOffset({
//         x: e.clientX - dragStart.x,
//         y: e.clientY - dragStart.y
//       });
//     }
//   };

//   const handleMouseUp = () => {
//     setIsDragging(false);
//   };

//   const handleNextImage = () => {
//     if (currentImageIndex < mediaItems.length - 1) {
//       setCurrentImageIndex(currentImageIndex + 1);
//     }
//   };

//   const handlePreviousImage = () => {
//     if (currentImageIndex > 0) {
//       setCurrentImageIndex(currentImageIndex - 1);
//     }
//   };

//   useEffect(() => {
//     if (showControls) {
//       controlsTimeoutRef.current = setTimeout(() => {
//         setShowControls(false);
//       }, 3000);
//     } else {
//       if (controlsTimeoutRef.current) {
//         clearTimeout(controlsTimeoutRef.current);
//       }
//     }

//     return () => {
//       if (controlsTimeoutRef.current) {
//         clearTimeout(controlsTimeoutRef.current);
//       }
//     };
//   }, [showControls]);

//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       switch (e.key) {
//         case 'Escape':
//           if (isFullscreen) {
//             handleFullscreen();
//           } else {
//             onClose();
//           }
//           break;
//         case 'ArrowLeft':
//           if (mediaItems.length > 1) {
//             handlePreviousImage();
//           } else if (hasPrevious) {
//             onPrevious();
//           }
//           break;
//         case 'ArrowRight':
//           if (mediaItems.length > 1) {
//             handleNextImage();
//           } else if (hasNext) {
//             onNext();
//           }
//           break;
//         case ' ':
//           e.preventDefault();
//           if (currentMedia?.type === 'video') {
//             setIsPlaying(!isPlaying);
//           }
//           break;
//         case 'f':
//           handleFullscreen();
//           break;
//         case '+':
//         case '=':
//           handleZoomIn();
//           break;
//         case '-':
//         case '_':
//           handleZoomOut();
//           break;
//         case 'r':
//           handleRotate();
//           break;
//         case '0':
//           handleReset();
//           break;
//         case 'l':
//           handleLike();
//           break;
//         case 'b':
//           handleBookmark();
//           break;
//         case 'd':
//           handleDownload();
//           break;
//         case 'c':
//           handleShare();
//           break;
//         case 'i':
//           setShowInfo(!showInfo);
//           break;
//       }
//     };

//     window.addEventListener('keydown', handleKeyDown);
//     return () => window.removeEventListener('keydown', handleKeyDown);
//   }, [onClose, onPrevious, onNext, hasPrevious, hasNext, isFullscreen, isPlaying, showInfo, isLiked, currentMedia, mediaItems]);

//   if (!post || !currentMedia) return null;

//   return (
//     <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
//       <div
//         ref={containerRef}
//         className={`relative w-full h-full flex flex-col ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
//         onMouseDown={handleMouseDown}
//         onMouseMove={handleMouseMove}
//         onMouseUp={handleMouseUp}
//         onMouseLeave={handleMouseUp}
//         onClick={() => setShowControls(!showControls)}
//       >
//         <div className={`absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/70 to-transparent p-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'
//           }`}>
//           <div className="flex justify-between items-center">
//             <div className="flex items-center gap-3 text-white">
//               <span className="text-sm bg-black/50 px-2 py-1 rounded backdrop-blur-sm">
//                 {currentIndex + 1} / {totalCount}
//               </span>
//               {mediaItems.length > 1 && (
//                 <span className="text-sm bg-black/50 px-2 py-1 rounded backdrop-blur-sm">
//                   {currentImageIndex + 1} / {mediaItems.length}
//                 </span>
//               )}
//               <span className="text-sm">{post.service}</span>
//             </div>
//             <div className="flex items-center gap-2">
//               <button
//                 onClick={handleLike}
//                 className={`p-2 rounded-full transition-colors ${isLiked ? 'bg-red-500 text-white' : 'bg-black/50 text-white hover:bg-black/70'
//                   }`}
//               >
//                 <Heart size={18} fill={isLiked ? 'white' : 'none'} />
//               </button>
//               <button
//                 onClick={handleBookmark}
//                 className={`p-2 rounded-full transition-colors ${isBookmarked ? 'bg-blue-500 text-white' : 'bg-black/50 text-white hover:bg-black/70'
//                   }`}
//               >
//                 <Bookmark size={18} fill={isBookmarked ? 'white' : 'none'} />
//               </button>
//               <button
//                 onClick={handleShare}
//                 className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
//               >
//                 {copied ? <Check size={18} /> : <Copy size={18} />}
//               </button>
//               <button
//                 onClick={handleDownload}
//                 className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
//               >
//                 <Download size={18} />
//               </button>
//               <button
//                 onClick={() => setShowInfo(!showInfo)}
//                 className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
//               >
//                 <Info size={18} />
//               </button>
//               <button
//                 onClick={handleFullscreen}
//                 className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
//               >
//                 {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
//               </button>
//               <button
//                 onClick={onClose}
//                 className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
//               >
//                 <X size={18} />
//               </button>
//             </div>
//           </div>
//         </div>

//         {mediaItems.length > 1 && (
//           <>
//             {currentImageIndex > 0 && (
//               <button
//                 onClick={handlePreviousImage}
//                 className="absolute left-4 top-1/2 -translate-y-1/2 z-40 p-3 text-white bg-black/50 rounded-full hover:bg-black/70 transition-all backdrop-blur-sm hover:scale-110"
//               >
//                 <ChevronLeft size={28} />
//               </button>
//             )}

//             {currentImageIndex < mediaItems.length - 1 && (
//               <button
//                 onClick={handleNextImage}
//                 className="absolute right-4 top-1/2 -translate-y-1/2 z-40 p-3 text-white bg-black/50 rounded-full hover:bg-black/70 transition-all backdrop-blur-sm hover:scale-110"
//               >
//                 <ChevronRight size={28} />
//               </button>
//             )}
//           </>
//         )}

//         <div className="flex-grow flex items-center justify-center bg-black relative overflow-hidden">
//           <div
//             className="relative w-full h-full flex items-center justify-center"
//             style={{
//               transform: `scale(${zoomLevel}) rotate(${rotation}deg) translate(${dragOffset.x}px, ${dragOffset.y}px)`,
//               transition: isDragging ? 'none' : 'transform 0.3s ease'
//             }}
//           >
//             {currentMedia.type === 'video' ? (
//               <video
//                 src={currentMedia.url}
//                 className="max-w-full max-h-full object-contain"
//                 controls={false}
//                 autoPlay={isPlaying}
//                 loop
//                 muted
//                 onClick={(e) => e.stopPropagation()}
//               />
//             ) : (
//               <OptimizedImage
//                 src={currentMedia.url}
//                 alt={post.title}
//                 className="max-w-full max-h-full object-contain"
//                 priority={true}
//               />
//             )}
//           </div>
//         </div>

//         <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'
//           }`}>
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-2">
//               {hasPrevious && (
//                 <button
//                   onClick={onPrevious}
//                   className="p-2 text-white hover:bg-white/20 rounded-full"
//                 >
//                   <ChevronLeft size={20} />
//                 </button>
//               )}
              
//               {currentMedia.type === 'video' && (
//                 <button
//                   onClick={() => setIsPlaying(!isPlaying)}
//                   className="p-2 text-white hover:bg-white/20 rounded-full"
//                 >
//                   {isPlaying ? <Pause size={20} /> : <Play size={20} />}
//                 </button>
//               )}
              
//               {hasNext && (
//                 <button
//                   onClick={onNext}
//                   className="p-2 text-white hover:bg-white/20 rounded-full"
//                 >
//                   <ChevronRight size={20} />
//                 </button>
//               )}
//             </div>

//             <div className="flex items-center gap-2">
//               <button
//                 onClick={handleZoomOut}
//                 className="p-2 text-white hover:bg-white/20 rounded-full"
//               >
//                 <ZoomOut size={20} />
//               </button>
//               <span className="text-white text-sm w-8 text-center">{Math.round(zoomLevel * 100)}%</span>
//               <button
//                 onClick={handleZoomIn}
//                 className="p-2 text-white hover:bg-white/20 rounded-full"
//               >
//                 <ZoomIn size={20} />
//               </button>
//               <button
//                 onClick={handleRotate}
//                 className="p-2 text-white hover:bg-white/20 rounded-full"
//               >
//                 <RotateCw size={20} />
//               </button>
//               <button
//                 onClick={handleReset}
//                 className="p-2 text-white hover:bg-white/20 rounded-full"
//               >
//                 <span className="text-xs">1:1</span>
//               </button>
//             </div>
//           </div>

//           {totalCount > 1 && (
//             <div className="flex items-center justify-center mt-2 gap-1">
//               {Array.from({ length: totalCount }).map((_, index) => (
//                 <button
//                   key={index}
//                   onClick={() => { }}
//                   className={`w-2 h-2 rounded-full transition-all duration-200 ${index === currentIndex ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/70'
//                     }`}
//                 />
//               ))}
//             </div>
//           )}
//         </div>

//         {showInfo && (
//           <div className="absolute bottom-20 left-4 right-4 bg-black/80 backdrop-blur-md rounded-lg p-4 text-white max-w-md">
//             <h3 className="font-semibold mb-3">{post.title}</h3>
//             <div className="space-y-2 text-sm">
//               <div className="flex justify-between">
//                 <span className="text-gray-400">Service:</span>
//                 <span>{post.service}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-gray-400">Published:</span>
//                 <span>{new Date(post.published).toLocaleDateString()}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-gray-400">Likes:</span>
//                 <span>{likes}</span>
//               </div>
//               {post.content && (
//                 <div>
//                   <span className="text-gray-400">Content:</span>
//                   <p className="mt-1 line-clamp-3">{post.content}</p>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// // --- COMPACT PROFILE VIEWER ---
// const CompactProfileViewer = ({
//   creator,
//   isOpen,
//   onClose
// }: {
//   creator: Creator | null;
//   isOpen: boolean;
//   onClose: () => void;
// }) => {
//   const [posts, setPosts] = useState<Post[]>([]);
//   const [profile, setProfile] = useState<Profile | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [loadingMore, setLoadingMore] = useState(false);
//   const [selectedPost, setSelectedPost] = useState<Post | null>(null);
//   const [isPostViewerOpen, setIsPostViewerOpen] = useState(false);
//   const [currentPostIndex, setCurrentPostIndex] = useState(0);
//   const [viewMode, setViewMode] = useState<'grid' | 'slideshow'>('grid');
//   const [gridColumns, setGridColumns] = useState(4);
//   const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'mostLiked'>('newest');
//   const [filterType, setFilterType] = useState<'all' | 'images' | 'videos'>('all');
//   const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set());
//   const [showSelection, setShowSelection] = useState(false);
//   const [hoverPreviewEnabled, setHoverPreviewEnabled] = useState(false);
//   const [movieModeActive, setMovieModeActive] = useState(false);
//   const [movieModeInfinite, setMovieModeInfinite] = useState(true);
//   const [currentPage, setCurrentPage] = useState(0);
//   const [hasMorePosts, setHasMorePosts] = useState(false);
//   const [isFollowing, setIsFollowing] = useState(false);
//   const [followers, setFollowers] = useState(Math.floor(Math.random() * 10000) + 1000);
//   const [isLiked, setIsLiked] = useState(false);
//   const [likes, setLikes] = useState(Math.floor(Math.random() * 1000) + 100);
//   const [isSyncing, setIsSyncing] = useState(false);
//   const [syncProgress, setSyncProgress] = useState(0);
//   const [isSynced, setIsSynced] = useState(false);
//   const [showCacheInfo, setShowCacheInfo] = useState(false);
//   const [cacheInfo, setCacheInfo] = useState({ count: 0, sizeMB: 0, maxSizeMB: 500 });

//   useEffect(() => {
//     if (!creator) return;

//     const fetchData = async () => {
//       setLoading(true);
//       try {
//         const isCoomer = COOMER_SERVICES.includes(creator.service);

//         const profileResponse = await axios.get<Profile>(
//           `${COOMER_POSTS_API_BASE_URL}/${creator.service}/user/${creator.id}/profile`,
//           { headers: isCoomer ? { 'Accept': 'text/css' } : {} }
//         );
//         setProfile(profileResponse.data);

//         const syncedPosts = offlineSyncManager.getSyncedPosts(creator.id);
//         if (syncedPosts.length > 0) {
//           setPosts(syncedPosts);
//           setIsSynced(true);
//         } else {
//           const postsResponse = await axios.get<Post[]>(
//             `${COOMER_POSTS_API_BASE_URL}/${creator.service}/user/${creator.id}/posts?o=0`,
//             { headers: isCoomer ? { 'Accept': 'text/css' } : {} }
//           );

//           const transformedPosts: Post[] = postsResponse.data.map((post: any) => ({
//             id: post.id,
//             user: post.user || creator.id,
//             service: creator.service,
//             title: post.title || 'Untitled',
//             content: post.content || '',
//             published: post.published,
//             file: post.file,
//             attachments: post.attachments || []
//           }));

//           setPosts(transformedPosts);
//           setHasMorePosts(transformedPosts.length === POSTS_PER_PAGE && profileResponse.data.post_count > POSTS_PER_PAGE);
//         }
//       } catch (error: any) {
//         console.error('Failed to fetch data:', error);
//         toast.error('Failed to load creator data');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [creator]);

//   useEffect(() => {
//     const updateCacheInfo = () => {
//       setCacheInfo(advancedImageCache.getCacheInfo());
//     };

//     updateCacheInfo();
//     const interval = setInterval(updateCacheInfo, 5000);

//     return () => clearInterval(interval);
//   }, []);

//   const loadMorePosts = useCallback(async () => {
//     if (!creator || !hasMorePosts || loadingMore) return;

//     setLoadingMore(true);
//     try {
//       const isCoomer = COOMER_SERVICES.includes(creator.service);
//       const offset = (currentPage + 1) * POSTS_PER_PAGE;

//       const response = await axios.get<Post[]>(
//         `${COOMER_POSTS_API_BASE_URL}/${creator.service}/user/${creator.id}/posts?o=${offset}`,
//         { headers: isCoomer ? { 'Accept': 'text/css' } : {} }
//       );

//       const transformedPosts: Post[] = response.data.map((post: any) => ({
//         id: post.id,
//         user: post.user || creator.id,
//         service: creator.service,
//         title: post.title || 'Untitled',
//         content: post.content || '',
//         published: post.published,
//         file: post.file,
//         attachments: post.attachments || []
//       }));

//       setPosts(prev => [...prev, ...transformedPosts]);
//       setCurrentPage(prev => prev + 1);

//       if (profile) {
//         setHasMorePosts((currentPage + 2) * POSTS_PER_PAGE < profile.post_count);
//       }
//     } catch (error: any) {
//       console.error('Failed to load more posts:', error);
//       toast.error('Failed to load more posts');
//     } finally {
//       setLoadingMore(false);
//     }
//   }, [creator, currentPage, hasMorePosts, loadingMore, profile]);

//   const filteredPosts = useMemo(() => {
//     let filtered = [...posts];

//     if (filterType === 'images') {
//       filtered = filtered.filter(post =>
//         !post.file?.name?.includes('.mp4') &&
//         !post.file?.name?.includes('.mov') &&
//         !post.file?.name?.includes('.avi') &&
//         !post.file?.name?.includes('.webm') &&
//         !post.attachments?.some(att =>
//           att.name?.includes('.mp4') ||
//           att.name?.includes('.mov') ||
//           att.name?.includes('.avi') ||
//           att.name?.includes('.webm')
//         )
//       );
//     } else if (filterType === 'videos') {
//       filtered = filtered.filter(post =>
//         post.file?.name?.includes('.mp4') ||
//         post.file?.name?.includes('.mov') ||
//         post.file?.name?.includes('.avi') ||
//         post.file?.name?.includes('.webm') ||
//         post.attachments?.some(att =>
//           att.name?.includes('.mp4') ||
//           att.name?.includes('.mov') ||
//           att.name?.includes('.avi') ||
//           att.name?.includes('.webm')
//         )
//       );
//     }

//     switch (sortBy) {
//       case 'newest':
//         filtered.sort((a, b) => new Date(b.published).getTime() - new Date(a.published).getTime());
//         break;
//       case 'oldest':
//         filtered.sort((a, b) => new Date(a.published).getTime() - new Date(b.published).getTime());
//         break;
//       case 'mostLiked':
//         filtered.sort(() => Math.random() - 0.5);
//         break;
//     }

//     return filtered;
//   }, [posts, filterType, sortBy]);

//   const handlePostClick = useCallback((post: Post, index: number) => {
//     if (showSelection) {
//       const newSelectedPosts = new Set(selectedPosts);
//       if (newSelectedPosts.has(post.id)) {
//         newSelectedPosts.delete(post.id);
//       } else {
//         newSelectedPosts.add(post.id);
//       }
//       setSelectedPosts(newSelectedPosts);
//     } else {
//       setSelectedPost(post);
//       setCurrentPostIndex(index);
//       setIsPostViewerOpen(true);
//     }
//   }, [showSelection, selectedPosts]);

//   const handleNextPost = useCallback(() => {
//     if (currentPostIndex < filteredPosts.length - 1) {
//       setCurrentPostIndex(currentPostIndex + 1);
//       setSelectedPost(filteredPosts[currentPostIndex + 1]);
//     }
//   }, [currentPostIndex, filteredPosts]);

//   const handlePreviousPost = useCallback(() => {
//     if (currentPostIndex > 0) {
//       setCurrentPostIndex(currentPostIndex - 1);
//       setSelectedPost(filteredPosts[currentPostIndex - 1]);
//     }
//   }, [currentPostIndex, filteredPosts]);

//   const handleSelectAll = () => {
//     if (selectedPosts.size === filteredPosts.length) {
//       setSelectedPosts(new Set());
//     } else {
//       setSelectedPosts(new Set(filteredPosts.map(post => post.id)));
//     }
//   };

//   const handleDownloadSelected = async () => {
//     const downloadService = DownloadService.getInstance();
//     const selectedPostsList = filteredPosts.filter(post => selectedPosts.has(post.id));
    
//     await downloadService.downloadPosts(selectedPostsList, creator?.service || '');
//   };

//   const handleSyncForOffline = async () => {
//     if (!creator) return;
    
//     setIsSyncing(true);
//     setSyncProgress(0);
    
//     try {
//       const interval = setInterval(() => {
//         setSyncProgress(prev => {
//           if (prev >= 100) {
//             clearInterval(interval);
//             return 100;
//           }
//           return prev + 10;
//         });
//       }, 500);
      
//       await offlineSyncManager.syncCreatorPosts(creator.id, posts);
//       setIsSynced(true);
//       toast('Posts synced for offline viewing');
//     } catch (error) {
//       console.error('Failed to sync posts:', error);
//       toast.error('Failed to sync posts');
//     } finally {
//       setIsSyncing(false);
//       setSyncProgress(0);
//     }
//   };

//   const handleClearCache = () => {
//     advancedImageCache.clearCache();
//     toast('Cache cleared');
//   };

//   const handleFollow = () => {
//     setIsFollowing(!isFollowing);
//     setFollowers(prev => isFollowing ? prev - 1 : prev + 1);
//     toast(isFollowing ? 'Unfollowed' : 'Following');
//   };

//   const handleLike = () => {
//     setIsLiked(!isLiked);
//     setLikes(prev => isLiked ? prev - 1 : prev + 1);
//   };

//   const handleMovieModeToggle = () => {
//     setMovieModeActive(!movieModeActive);
//   };

//   if (!creator) return null;

//   return (
//     <>
//       <div className={`fixed inset-0 z-50 ${isOpen ? 'block' : 'hidden'}`}>
//         <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
//         <div className="absolute inset-0 bg-white dark:bg-gray-900 text-white overflow-hidden flex flex-col">
//           <div className="flex-shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-3">
//                 <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
//                   <img
//                     src={
//                       COOMER_SERVICES.includes(creator.service)
//                         ? `https://coomer.st/icons/${creator.service}/${creator.id}`
//                         : `https://kemono.su/icons/${creator.service}/${creator.id}`
//                     }
//                     alt={creator.name}
//                     className="w-full h-full object-cover"
//                   />
//                 </div>
//                 <div>
//                   <h2 className="text-xl font-bold">{creator.name}</h2>
//                   <p className="text-sm text-gray-500 dark:text-gray-400">
//                     {creator.service} • {profile?.post_count || 0} posts
//                   </p>
//                 </div>
//               </div>

//               <div className="flex items-center gap-2">
//                 <button
//                   onClick={handleFollow}
//                   className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${isFollowing
//                       ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white'
//                       : 'bg-blue-500 text-white hover:bg-blue-600'
//                     }`}
//                 >
//                   {isFollowing ? 'Following' : 'Follow'}
//                 </button>

//                 <button
//                   onClick={handleLike}
//                   className={`p-2 rounded-full transition-colors ${isLiked
//                       ? 'bg-red-500 text-white'
//                       : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-red-500 hover:text-white'
//                     }`}
//                 >
//                   <Heart size={16} className={isLiked ? 'fill-current' : ''} />
//                 </button>

//                 <span className="text-sm text-gray-500 dark:text-gray-400">
//                   {likes} likes • {followers} followers
//                 </span>

//                 <button
//                   onClick={handleMovieModeToggle}
//                   className="flex items-center gap-1 px-3 py-2 bg-purple-600 text-white text-sm rounded-full hover:bg-purple-700 transition-colors"
//                 >
//                   <Tv size={14} />
//                   Movie Mode
//                 </button>

//                 <button
//                   onClick={() => setShowCacheInfo(!showCacheInfo)}
//                   className="flex items-center gap-1 px-3 py-2 bg-gray-600 text-white text-sm rounded-full hover:bg-gray-700 transition-colors"
//                 >
//                   <HardDrive size={14} />
//                   Cache
//                 </button>

//                 <button
//                   onClick={onClose}
//                   className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
//                 >
//                   <X size={16} />
//                 </button>
//               </div>
//             </div>
//           </div>

//           <div className="flex-shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-3">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-2">
//                 {showSelection && (
//                   <div className="flex items-center gap-2 mr-2">
//                     <button
//                       onClick={handleSelectAll}
//                       className="text-sm text-gray-600 dark:text-gray-400"
//                     >
//                       {selectedPosts.size === filteredPosts.length ? 'Deselect All' : 'Select All'}
//                     </button>
//                     <span className="text-sm text-gray-600 dark:text-gray-400">
//                       {selectedPosts.size} selected
//                     </span>
//                     <button
//                       onClick={handleDownloadSelected}
//                       disabled={selectedPosts.size === 0}
//                       className="text-sm text-blue-600 dark:text-blue-400 disabled:text-gray-400"
//                     >
//                       Download
//                     </button>
//                   </div>
//                 )}

//                 <button
//                   onClick={() => setShowSelection(!showSelection)}
//                   className={`p-2 rounded ${showSelection ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}
//                 >
//                   <Grid3x3 size={16} />
//                 </button>

//                 <button
//                   onClick={() => setHoverPreviewEnabled(!hoverPreviewEnabled)}
//                   className={`p-2 rounded ${hoverPreviewEnabled ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}
//                 >
//                   <MousePointer size={16} />
//                 </button>

//                 <select
//                   value={filterType}
//                   onChange={(e) => setFilterType(e.target.value as 'all' | 'images' | 'videos')}
//                   className="px-2 py-1 text-sm bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300"
//                 >
//                   <option value="all">All</option>
//                   <option value="images">Images</option>
//                   <option value="videos">Videos</option>
//                 </select>

//                 <select
//                   value={sortBy}
//                   onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'mostLiked')}
//                   className="px-2 py-1 text-sm bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300"
//                 >
//                   <option value="newest">Newest</option>
//                   <option value="oldest">Oldest</option>
//                   <option value="mostLiked">Most Liked</option>
//                 </select>

//                 <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded px-2 py-1">
//                   <span className="text-xs text-gray-600 dark:text-gray-400 mr-1">Columns</span>
//                   <input
//                     type="range"
//                     min="2"
//                     max="6"
//                     value={gridColumns}
//                     onChange={(e) => setGridColumns(parseInt(e.target.value))}
//                     className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
//                   />
//                   <span className="text-xs text-gray-600 dark:text-gray-400 ml-1">{gridColumns}</span>
//                 </div>

//                 <button
//                   onClick={handleSyncForOffline}
//                   disabled={isSyncing || isSynced}
//                   className={`flex items-center gap-1 px-3 py-1 text-sm rounded-full transition-colors ${
//                     isSynced 
//                       ? 'bg-green-600 text-white' 
//                       : isSyncing 
//                         ? 'bg-gray-400 text-white cursor-not-allowed' 
//                         : 'bg-blue-600 text-white hover:bg-blue-700'
//                   }`}
//                 >
//                   {isSyncing ? (
//                     <>
//                       <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                       {syncProgress}%
//                     </>
//                   ) : isSynced ? (
//                     <>
//                       <Wifi size={12} />
//                       Synced
//                     </>
//                   ) : (
//                     <>
//                       <WifiOff size={12} />
//                       Sync Offline
//                     </>
//                   )}
//                 </button>
//               </div>

//               <div className="flex items-center gap-2">
//                 <div className="flex bg-gray-100 dark:bg-gray-800 rounded">
//                   <button
//                     onClick={() => setViewMode('grid')}
//                     className={`p-2 rounded-l ${viewMode === 'grid' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}
//                   >
//                     <Grid3X3 size={16} />
//                   </button>
//                   <button
//                     onClick={() => setViewMode('slideshow')}
//                     className={`p-2 rounded-r ${viewMode === 'slideshow' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}
//                   >
//                     <PlayCircle size={16} />
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="flex-1 overflow-hidden">
//             {loading ? (
//               <div className="flex items-center justify-center h-full">
//                 <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
//               </div>
//             ) : filteredPosts.length === 0 ? (
//               <div className="flex items-center justify-center h-full">
//                 <p className="text-gray-500 dark:text-gray-400">No posts available</p>
//               </div>
//             ) : (
//               <div className="h-full overflow-y-auto">
//                 {viewMode === 'grid' ? (
//                   <div className="p-4">
//                     <CompactPostGrid
//                       posts={filteredPosts}
//                       onPostClick={handlePostClick}
//                       service={creator.service}
//                       selectedPosts={selectedPosts}
//                       showSelection={showSelection}
//                       gridColumns={gridColumns}
//                       onLoadMore={hasMorePosts ? loadMorePosts : undefined}
//                     />
//                   </div>
//                 ) : (
//                   <div className="h-full flex items-center justify-center bg-black">
//                     <div className="text-center text-white">
//                       <PlayCircle className="h-16 w-16 mx-auto mb-4" />
//                       <p className="text-xl">Slideshow Mode</p>
//                       <p className="text-sm text-gray-400 mt-2">Feature coming soon</p>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {showCacheInfo && (
//         <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
//           <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
//             <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Cache Information</h3>
//             <div className="space-y-3">
//               <div className="flex justify-between">
//                 <span className="text-gray-600 dark:text-gray-400">Cached Images:</span>
//                 <span className="text-gray-900 dark:text-white">{cacheInfo.count}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-gray-600 dark:text-gray-400">Cache Size:</span>
//                 <span className="text-gray-900 dark:text-white">{cacheInfo.sizeMB} MB / {cacheInfo.maxSizeMB} MB</span>
//               </div>
//               <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
//                 <div 
//                   className="bg-blue-500 h-2 rounded-full" 
//                   style={{ width: `${(cacheInfo.sizeMB / cacheInfo.maxSizeMB) * 100}%` }}
//                 />
//               </div>
//             </div>
//             <div className="flex justify-end gap-2 mt-6">
//               <button
//                 onClick={handleClearCache}
//                 className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
//               >
//                 Clear Cache
//               </button>
//               <button
//                 onClick={() => setShowCacheInfo(false)}
//                 className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {isPostViewerOpen && selectedPost && (
//         <GalleryViewer
//           post={selectedPost}
//           isOpen={isPostViewerOpen}
//           onClose={() => setIsPostViewerOpen(false)}
//           onNext={handleNextPost}
//           onPrevious={handlePreviousPost}
//           hasNext={currentPostIndex < filteredPosts.length - 1}
//           hasPrevious={currentPostIndex > 0}
//           currentIndex={currentPostIndex}
//           totalCount={filteredPosts.length}
//           service={creator.service}
//         />
//       )}

//       {movieModeActive && (
//         <MovieMode
//           posts={filteredPosts}
//           onClose={() => setMovieModeActive(false)}
//           infiniteMode={movieModeInfinite}
//           service={creator.service}
//         />
//       )}
//     </>
//   );
// };

// // --- MAIN COMPONENT ---
// function RouteComponent() {
//   const [creators, setCreators] = useState<Creator[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedService, setSelectedService] = useState('all');
//   const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
//   const [apiError, setApiError] = useState<string | null>(null);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(0);
//   const [totalCreators, setTotalCreators] = useState(0);
//   const [hasMore, setHasMore] = useState(true);
//   const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
//   const [isProfileViewerOpen, setIsProfileViewerOpen] = useState(false);
//   const [isDarkMode, setIsDarkMode] = useState(true);
//   const [viewMode, setViewMode] = useState<'compact' | 'detailed'>('compact');
//   const [gridColumns, setGridColumns] = useState(6);
//   const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
//   const loadMoreRef = useRef<HTMLDivElement>(null);

//   const isCacheValid = useCallback(async () => {
//     try {
//       const cachedTimestamp = await storage.getItem(CACHE_TIMESTAMP_KEY) as string;
//       const cacheVersion = await storage.getItem(CACHE_VERSION_KEY) as string;

//       if (!cachedTimestamp || cacheVersion !== CACHE_VERSION) {
//         return false;
//       }

//       const timestamp = new Date(cachedTimestamp);
//       const now = new Date();
//       return (now.getTime() - timestamp.getTime()) < CACHE_EXPIRY_MS;
//     } catch (error) {
//       console.error('Error checking cache validity:', error);
//       return false;
//     }
//   }, []);

//   const loadFromIndexedDB = useCallback(async (page: number = 1) => {
//     try {
//       const isValid = await isCacheValid();
//       if (!isValid) return false;

//       const cacheKey = selectedService === 'all'
//         ? `creators:page:${page}`
//         : `creators:${selectedService}:page:${page}`;

//       const pageData = await storage.getItem(cacheKey) as Creator[];
//       const cachedTimestamp = await storage.getItem(CACHE_TIMESTAMP_KEY) as string;

//       if (pageData && pageData.length > 0) {
//         setCreators(prev => page === 1 ? pageData : [...prev, ...pageData]);
//         setLastUpdated(new Date(cachedTimestamp));
//         return true;
//       }

//       return false;
//     } catch (error) {
//       console.error('Error loading from IndexedDB:', error);
//       return false;
//     }
//   }, [isCacheValid, selectedService]);

//   const fetchCreators = useCallback(async (page: number = 1) => {
//     try {
//       setApiError(null);

//       if (page === 1) {
//         const cacheLoaded = await loadFromIndexedDB(page);
//         if (cacheLoaded) {
//           setLoading(false);
//           return;
//         }
//       }

//       if (page === 1) {
//         setLoading(true);
//       }

//       let apiUrl: string;

//       if (selectedService === 'all') {
//         const [coomerResponse, kemonoResponse] = await Promise.all([
//           axios.get<CreatorApiResponse>(`${COOMER_API_BASE_URL}?page=${page}&itemsPerPage=${Math.ceil(ITEMS_PER_PAGE / 2)}`),
//           axios.get<CreatorApiResponse>(`${KEMONO_API_BASE_URL}?page=${page}&itemsPerPage=${Math.ceil(ITEMS_PER_PAGE / 2)}`)
//         ]);

//         const combinedData = [...coomerResponse.data.data, ...kemonoResponse.data.data];
//         const combinedPagination = {
//           totalPages: Math.max(coomerResponse.data.pagination.totalPages, kemonoResponse.data.pagination.totalPages),
//           totalItems: coomerResponse.data.pagination.totalItems + kemonoResponse.data.pagination.totalItems,
//           isNextPage: coomerResponse.data.pagination.isNextPage || kemonoResponse.data.pagination.isNextPage,
//         };

//         setTotalPages(combinedPagination.totalPages);
//         setTotalCreators(combinedPagination.totalItems);
//         setHasMore(combinedPagination.isNextPage);

//         await storage.setItem(`creators:page:${page}`, combinedData);
//         setCreators(prev => page === 1 ? combinedData : [...prev, ...combinedData]);

//         if (page === 1) {
//           await storage.setItem(CACHE_TIMESTAMP_KEY, new Date().toISOString());
//           await storage.setItem(CACHE_VERSION_KEY, CACHE_VERSION);
//         }
//       } else if (selectedService === 'coomer' || selectedService === 'kemono') {
//         apiUrl = selectedService === 'coomer' ? COOMER_API_BASE_URL : KEMONO_API_BASE_URL;

//         const response = await axios.get<CreatorApiResponse>(`${apiUrl}?page=${page}&itemsPerPage=${ITEMS_PER_PAGE}`);
//         const { data, pagination } = response.data;

//         setTotalPages(pagination.totalPages);
//         setTotalCreators(pagination.totalItems);
//         setHasMore(pagination.isNextPage);

//         await storage.setItem(`creators:${selectedService}:page:${page}`, data);
//         setCreators(prev => page === 1 ? data : [...prev, ...data]);

//         if (page === 1) {
//           await storage.setItem(CACHE_TIMESTAMP_KEY, new Date().toISOString());
//           await storage.setItem(CACHE_VERSION_KEY, CACHE_VERSION);
//         }
//       } else {
//         const isCoomer = COOMER_SERVICES.includes(selectedService);
//         apiUrl = isCoomer ? COOMER_API_BASE_URL : KEMONO_API_BASE_URL;

//         const response = await axios.get<CreatorApiResponse>(`${apiUrl}/${selectedService}?page=${page}&itemsPerPage=${ITEMS_PER_PAGE}`);
//         const { data, pagination } = response.data;

//         setTotalPages(pagination.totalPages);
//         setTotalCreators(pagination.totalItems);
//         setHasMore(pagination.isNextPage);

//         await storage.setItem(`creators:${selectedService}:page:${page}`, data);
//         setCreators(prev => page === 1 ? data : [...prev, ...data]);

//         if (page === 1) {
//           await storage.setItem(CACHE_TIMESTAMP_KEY, new Date().toISOString());
//           await storage.setItem(CACHE_VERSION_KEY, CACHE_VERSION);
//         }
//       }

//       setLastUpdated(new Date());
//       if (page === 1) {
//         toast.success('Successfully loaded creators');
//       }
//     } catch (error: any) {
//       console.error('Fetch failed:', error);
//       setApiError('Failed to fetch creators data');
//       toast.error('Failed to fetch creators');

//       if (page === 1) {
//         await loadFromIndexedDB(page);
//       }
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   }, [loadFromIndexedDB, selectedService]);

//   const loadMoreCreators = useCallback(() => {
//     if (!hasMore || loading) return;
//     const nextPage = currentPage + 1;
//     setCurrentPage(nextPage);
//     fetchCreators(nextPage);
//   }, [currentPage, hasMore, loading, fetchCreators]);

//   // Infinite scroll for creators
//   useEffect(() => {
//     if (!loadMoreRef.current || !hasMore) return;

//     const observer = new IntersectionObserver(
//       (entries) => {
//         if (entries[0].isIntersecting) {
//           loadMoreCreators();
//         }
//       },
//       { threshold: 0.1 }
//     );

//     observer.observe(loadMoreRef.current);

//     return () => {
//       if (loadMoreRef.current) {
//         observer.unobserve(loadMoreRef.current);
//       }
//     };
//   }, [hasMore, loadMoreCreators]);

//   useEffect(() => {
//     setCurrentPage(1);
//     setCreators([]);
//     fetchCreators(1);
//   }, [selectedService]);

//   const filteredCreators = useMemo(() => {
//     let filtered = creators;
    
//     if (showFavoritesOnly) {
//       const favoriteIds = favoritesManager.getFavorites();
//       filtered = filtered.filter(creator => favoriteIds.includes(creator.id));
//     }
    
//     if (!searchTerm.trim()) return filtered;
//     return filtered.filter(creator =>
//       creator.name.toLowerCase().includes(searchTerm.toLowerCase())
//     );
//   }, [creators, searchTerm, showFavoritesOnly]);

//   const handleRefresh = useCallback(() => {
//     setRefreshing(true);
//     setCurrentPage(1);
//     setCreators([]);
//     fetchCreators(1);
//   }, [fetchCreators]);

//   const handleCreatorClick = useCallback((creator: Creator) => {
//     setSelectedCreator(creator);
//     setIsProfileViewerOpen(true);
//   }, []);

//   const handleThemeToggle = () => {
//     setIsDarkMode(!isDarkMode);
//   };

//   useEffect(() => {
//     const imageUrls = creators.slice(0, 20).map(creator => {
//       if (COOMER_SERVICES.includes(creator.service)) {
//         return `https://coomer.st/icons/${creator.service}/${creator.id}`;
//       } else {
//         return `https://kemono.su/icons/${creator.service}/${creator.id}`;
//       }
//     });

//     advancedImageCache.preloadImages(imageUrls);
//   }, [creators]);

//   return (
//     <div className={`h-screen w-screen flex flex-col ${isDarkMode ? 'dark' : ''} bg-gray-50 dark:bg-gray-900`}>
//       <header className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center gap-3">
//             <div className="flex items-center gap-2">
//               <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
//                 <Sparkles className="w-4 h-4 text-white" />
//               </div>
//               <h1 className="text-lg font-bold text-gray-900 dark:text-white">CreatorHub</h1>
//             </div>
//             <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
//               {totalCreators > 0 && `${filteredCreators.length}/${totalCreators} creators`}
//               {lastUpdated && <span className="ml-2">• Updated: {lastUpdated.toLocaleTimeString()}</span>}
//             </p>
//           </div>

//           <div className="flex items-center gap-2">
//             <div className="relative hidden sm:block">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
//               <input
//                 type="text"
//                 placeholder="Search creators..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="pl-10 pr-4 py-1.5 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-48"
//               />
//             </div>

//             <div className="flex items-center gap-1">
//               <select
//                 value={selectedService}
//                 onChange={(e) => setSelectedService(e.target.value)}
//                 className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               >
//                 {SERVICES.map((service) => (
//                   <option key={service.value} value={service.value}>
//                     {service.label}
//                   </option>
//                 ))}
//               </select>

//               <button
//                 onClick={handleRefresh}
//                 disabled={refreshing || loading}
//                 className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
//               >
//                 {refreshing || loading ? (
//                   <Loader2 className="h-4 w-4 animate-spin" />
//                 ) : (
//                   <RefreshCw className="h-4 w-4" />
//                 )}
//               </button>

//               <button
//                 onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
//                 className={`p-1.5 rounded-lg transition-colors ${
//                   showFavoritesOnly 
//                     ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400' 
//                     : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
//                 }`}
//               >
//                 <Star className="h-4 w-4" />
//               </button>

//               <button
//                 onClick={handleThemeToggle}
//                 className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
//               >
//                 {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
//               </button>
//             </div>

//             <div className="flex items-center gap-1">
//               <button
//                 onClick={() => setViewMode('compact')}
//                 className={`p-1.5 rounded-lg ${viewMode === 'compact' ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
//               >
//                 <LayoutGrid className="h-4 w-4" />
//               </button>

//               <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg px-2 py-1">
//                 <span className="text-xs text-gray-600 dark:text-gray-400 mr-1">Grid</span>
//                 <input
//                   type="range"
//                   min="3"
//                   max="8"
//                   value={gridColumns}
//                   onChange={(e) => setGridColumns(parseInt(e.target.value))}
//                   className="w-16 h-4 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
//                 />
//                 <span className="text-xs text-gray-600 dark:text-gray-400 ml-1">{gridColumns}</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </header>

//       <main className="flex-1 overflow-hidden">
//         {loading && creators.length === 0 ? (
//           <div className="flex flex-col justify-center items-center h-full">
//             <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
//             <p className="text-gray-500 dark:text-gray-400">Loading creators...</p>
//           </div>
//         ) : filteredCreators.length === 0 ? (
//           <div className="flex flex-col justify-center items-center h-full">
//             <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mb-4">
//               <Search className="h-8 w-8 text-gray-500" />
//             </div>
//             <p className="text-gray-500 dark:text-gray-400">
//               {searchTerm || showFavoritesOnly || selectedService !== 'all' ? 'No creators found matching your search or filter.' : 'No creators available.'}
//             </p>
//           </div>
//         ) : (
//           <div className="h-full overflow-y-auto">
//             <div className="p-4">
//               <div
//                 className="grid gap-2"
//                 style={{ gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))` }}
//               >
//                 {filteredCreators.map((creator) => (
//                   <CompactCreatorCard
//                     key={creator.id}
//                     creator={creator}
//                     onClick={() => handleCreatorClick(creator)}
//                   />
//                 ))}
//               </div>

//               {/* Infinite scroll trigger for creators */}
//               {hasMore && (
//                 <div ref={loadMoreRef} className="flex justify-center py-4">
//                   <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
//                 </div>
//               )}
//             </div>
//           </div>
//         )}
//       </main>

//       <CompactProfileViewer
//         creator={selectedCreator}
//         isOpen={isProfileViewerOpen}
//         onClose={() => setIsProfileViewerOpen(false)}
//       />
//     </div>
//   );
// }

// export const Route = createFileRoute('/coomerKemono')({
//   component: RouteComponent,
// });













// import React, { useState, useEffect, useCallback, useMemo, useRef, Suspense } from 'react';
// import axios from 'axios';
// import { createStorage } from 'unstorage';
// import indexedDbDriver from "unstorage/drivers/indexedb";
// import { createFileRoute } from '@tanstack/react-router';
// import { toast } from 'sonner';
// import {
//   Loader2, RefreshCw, Search, ImageOff, AlertCircle, Filter, X, Play, Pause,
//   ChevronLeft, ChevronRight, Heart, Share2, Bookmark, MoreHorizontal,
//   Grid3x3, Download, ZoomIn, ZoomOut, RotateCw, Shuffle, SkipForward, SkipBack,
//   Eye, Settings, Sliders, MousePointer, Sun, Moon, Monitor, Smartphone, Tablet,
//   Tv, Film, Power, FolderOpen, HardDrive, Package, Zap, Image as ImageIcon,
//   Wifi, WifiOff, PauseCircle, PlayCircle, Maximize2, Minimize2, Volume2, VolumeX,
//   Copy, Check, Info, ThumbsUp, ThumbsDown, Send, Smile, ChevronDown, ArrowUp,
//   Sparkles, Flame, TrendingUp, Clock, Calendar, User, Users, Hash, AtSign,
//   Camera, Layers, Aperture, Focus, Grid3X3, List, LayoutGrid, LayoutList,
//   Filter as FilterIcon, SortAsc, SortDesc, DownloadCloud, Share, Link2,
//   ExternalLink, HeartHandshake, Star, Award, Trophy, Crown, Gem,
//   Save
// } from 'lucide-react';

// // --- TYPES ---
// interface Creator {
//   favorited: number;
//   id: string;
//   indexed: number;
//   name: string;
//   service: string;
//   updated: number;
// }

// interface Profile {
//   id: string;
//   name: string;
//   service: string;
//   indexed: string;
//   updated: string;
//   public_id: string;
//   relation_id: string | null;
//   post_count: number;
//   dm_count: number;
//   share_count: number;
//   chat_count: number;
// }

// interface Post {
//   id: string;
//   user: string;
//   service: string;
//   title: string;
//   content: string;
//   published: string;
//   file?: {
//     name: string;
//     path: string;
//   };
//   attachments: Array<{
//     name: string;
//     path: string;
//   }>;
// }

// interface CreatorApiResponse {
//   message: string;
//   timestamp: number;
//   data: Creator[];
//   pagination: {
//     currentPage: number;
//     itemsPerPage: number;
//     totalPages: number;
//     totalItems: number;
//     isNextPage: boolean;
//     isPrevPage: boolean;
//   };
// }

// // --- CONFIGURATION ---
// const COOMER_SERVICES = ['onlyfans', 'fansly', 'candfans'];
// const KEMONO_SERVICES = ['patreon', 'fanbox', 'discord', 'fantia', 'afdian', 'boosty', 'dlsite', 'gumroad', 'subscribestar'];

// const SERVICES = [
//   { value: 'all', label: 'All Services' },
//   { value: 'coomer', label: 'Coomer (All)' },
//   ...COOMER_SERVICES.map(service => ({ value: service, label: service.charAt(0).toUpperCase() + service.slice(1) })),
//   { value: 'kemono', label: 'Kemono (All)' },
//   ...KEMONO_SERVICES.map(service => ({ value: service, label: service.charAt(0).toUpperCase() + service.slice(1) }))
// ];

// // --- STORAGE & CACHE ---
// const storage = createStorage({
//   driver: indexedDbDriver({
//     base: 'creators:',
//     dbName: 'creators-db',
//     storeName: 'creators-store'
//   })
// });

// const CACHE_TIMESTAMP_KEY = 'creators:timestamp';
// const CACHE_VERSION_KEY = 'creators:version';
// const CACHE_VERSION = '2.0';
// const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000;

// // --- API SETTINGS ---
// const COOMER_API_BASE_URL = 'https://kemono-api.mbaharip.com/coomer';
// const KEMONO_API_BASE_URL = 'https://kemono-api.mbaharip.com/kemono';
// const COOMER_POSTS_API_BASE_URL = 'https://coomer.st/api/v1';
// const KEMONO_POSTS_API_BASE_URL = 'https://kemono.su/api/v1';
// const ITEMS_PER_PAGE = 30;
// const POSTS_PER_PAGE = 50;

// // --- ELECTRON APIS ---
// declare global {
//   interface Window {
//     require: any;
//     electronAPI?: {
//       showSaveDialog: (options: any) => Promise<any>;
//       showOpenDialog: (options: any) => Promise<any>;
//       openPath: (path: string) => Promise<void>;
//       createDirectory: (path: string) => Promise<void>;
//       downloadFile: (url: string, destination: string, onProgress?: (progress: number) => void) => Promise<void>;
//       getAppPath: (name: string) => string;
//       getPath: (name: string) => string;
//     };
//   }
// }

// // --- ADVANCED IMAGE CACHE SYSTEM ---
// class AdvancedImageCache {
//   private cache = new Map<string, { url: string; timestamp: number; size: number }>();
//   private loadingPromises = new Map<string, Promise<string>>();
//   private maxCacheSize = 500;
//   private maxCacheSizeBytes = 500 * 1024 * 1024;
//   private cacheExpiry = 24 * 60 * 60 * 1000;
//   private currentCacheSize = 0;
//   private storageKey = 'advanced-image-cache';

//   constructor() {
//     this.loadCacheFromStorage();
//   }

//   async loadCacheFromStorage() {
//     try {
//       const cachedData = localStorage.getItem(this.storageKey);
//       if (cachedData) {
//         const parsedCache = JSON.parse(cachedData);
//         this.cache = new Map(parsedCache.entries);
//         this.currentCacheSize = parsedCache.size || 0;
//         this.cleanupExpiredEntries();
//       }
//     } catch (error) {
//       console.error('Failed to load cache from storage:', error);
//     }
//   }

//   saveCacheToStorage() {
//     try {
//       const cacheData = {
//         entries: Array.from(this.cache.entries()),
//         size: this.currentCacheSize
//       };
//       localStorage.setItem(this.storageKey, JSON.stringify(cacheData));
//     } catch (error) {
//       console.error('Failed to save cache to storage:', error);
//     }
//   }

//   async getImage(originalUrl: string): Promise<string> {
//     if (this.cache.has(originalUrl)) {
//       const cached = this.cache.get(originalUrl)!;
//       if (Date.now() - cached.timestamp < this.cacheExpiry) {
//         return cached.url;
//       } else {
//         this.removeFromCache(originalUrl);
//       }
//     }

//     if (this.loadingPromises.has(originalUrl)) {
//       return this.loadingPromises.get(originalUrl)!;
//     }

//     const loadingPromise = this.loadImage(originalUrl);
//     this.loadingPromises.set(originalUrl, loadingPromise);

//     try {
//       const url = await loadingPromise;
//       return url;
//     } finally {
//       this.loadingPromises.delete(originalUrl);
//     }
//   }

//   private async loadImage(originalUrl: string): Promise<string> {
//     try {
//       const response = await fetch(originalUrl);
//       const blob = await response.blob();
//       const objectUrl = URL.createObjectURL(blob);
//       const size = blob.size;

//       this.cache.set(originalUrl, { url: objectUrl, timestamp: Date.now(), size });
//       this.currentCacheSize += size;

//       if (this.cache.size > this.maxCacheSize || this.currentCacheSize > this.maxCacheSizeBytes) {
//         this.cleanupCache();
//       }

//       this.saveCacheToStorage();
//       return objectUrl;
//     } catch (error) {
//       console.error('Failed to load image:', error);
//       return originalUrl;
//     }
//   }

//   private removeFromCache(url: string) {
//     if (this.cache.has(url)) {
//       const cached = this.cache.get(url)!;
//       URL.revokeObjectURL(cached.url);
//       this.currentCacheSize -= cached.size;
//       this.cache.delete(url);
//     }
//   }

//   private cleanupExpiredEntries() {
//     const now = Date.now();
//     const expiredKeys: string[] = [];
    
//     this.cache.forEach((value, key) => {
//       if (now - value.timestamp > this.cacheExpiry) {
//         expiredKeys.push(key);
//       }
//     });

//     expiredKeys.forEach(key => this.removeFromCache(key));
//   }

//   private cleanupCache() {
//     const entries = Array.from(this.cache.entries());
//     entries.sort((a, b) => a[1].timestamp - b[1].timestamp);

//     while (
//       (this.cache.size > this.maxCacheSize || this.currentCacheSize > this.maxCacheSizeBytes) &&
//       entries.length > 0
//     ) {
//       const [url] = entries.shift()!;
//       this.removeFromCache(url);
//     }

//     this.saveCacheToStorage();
//   }

//   preloadImages(urls: string[]): void {
//     urls.forEach(url => {
//       if (!this.cache.has(url) && !this.loadingPromises.has(url)) {
//         this.getImage(url).catch(() => {});
//       }
//     });
//   }

//   clearCache() {
//     this.cache.forEach((value) => {
//       URL.revokeObjectURL(value.url);
//     });
    
//     this.cache.clear();
//     this.currentCacheSize = 0;
//     localStorage.removeItem(this.storageKey);
//   }

//   getCacheInfo() {
//     return {
//       count: this.cache.size,
//       sizeBytes: this.currentCacheSize,
//       sizeMB: Math.round(this.currentCacheSize / (1024 * 1024) * 100) / 100,
//       maxSizeMB: Math.round(this.maxCacheSizeBytes / (1024 * 1024))
//     };
//   }
// }

// const advancedImageCache = new AdvancedImageCache();

// // --- FAVORITES SYSTEM ---
// class FavoritesManager {
//   private storageKey = 'creator-favorites';
//   private favorites: Set<string> = new Set();

//   constructor() {
//     this.loadFavorites();
//   }

//   loadFavorites() {
//     try {
//       const stored = localStorage.getItem(this.storageKey);
//       if (stored) {
//         this.favorites = new Set(JSON.parse(stored));
//       }
//     } catch (error) {
//       console.error('Failed to load favorites:', error);
//     }
//   }

//   saveFavorites() {
//     try {
//       localStorage.setItem(this.storageKey, JSON.stringify(Array.from(this.favorites)));
//     } catch (error) {
//       console.error('Failed to save favorites:', error);
//     }
//   }

//   addFavorite(creatorId: string) {
//     this.favorites.add(creatorId);
//     this.saveFavorites();
//   }

//   removeFavorite(creatorId: string) {
//     this.favorites.delete(creatorId);
//     this.saveFavorites();
//   }

//   isFavorite(creatorId: string): boolean {
//     return this.favorites.has(creatorId);
//   }

//   getFavorites(): string[] {
//     return Array.from(this.favorites);
//   }
// }

// const favoritesManager = new FavoritesManager();

// // --- OFFLINE SYNC SYSTEM ---
// class OfflineSyncManager {
//   private storageKey = 'offline-sync-data';
//   private syncData: Map<string, Post[]> = new Map();
//   private isSyncing = false;
//   private syncProgress = 0;

//   async syncCreatorPosts(creatorId: string, posts: Post[]): Promise<void> {
//     this.isSyncing = true;
//     this.syncProgress = 0;

//     try {
//       for (let i = 0; i < posts.length; i++) {
//         await new Promise(resolve => setTimeout(resolve, 100));
//         this.syncProgress = Math.round((i / posts.length) * 100);
//       }

//       this.syncData.set(creatorId, posts);
//       this.saveSyncData();
//     } finally {
//       this.isSyncing = false;
//       this.syncProgress = 0;
//     }
//   }

//   getSyncedPosts(creatorId: string): Post[] {
//     return this.syncData.get(creatorId) || [];
//   }

//   isCreatorSynced(creatorId: string): boolean {
//     return this.syncData.has(creatorId);
//   }

//   getSyncProgress(): number {
//     return this.syncProgress;
//   }

//   isCurrentlySyncing(): boolean {
//     return this.isSyncing;
//   }

//   private saveSyncData() {
//     try {
//       const data = Array.from(this.syncData.entries());
//       localStorage.setItem(this.storageKey, JSON.stringify(data));
//     } catch (error) {
//       console.error('Failed to save sync data:', error);
//     }
//   }

//   loadSyncData() {
//     try {
//       const stored = localStorage.getItem(this.storageKey);
//       if (stored) {
//         const data = JSON.parse(stored);
//         this.syncData = new Map(data);
//       }
//     } catch (error) {
//       console.error('Failed to load sync data:', error);
//     }
//   }

//   clearSyncData() {
//     this.syncData.clear();
//     localStorage.removeItem(this.storageKey);
//   }
// }

// const offlineSyncManager = new OfflineSyncManager();
// offlineSyncManager.loadSyncData();

// // --- DOWNLOAD SERVICE ---
// class DownloadService {
//   private static instance: DownloadService;
//   private downloads: Map<string, {
//     id: string;
//     post: Post;
//     status: 'pending' | 'downloading' | 'completed' | 'error';
//     progress: number;
//     filePath?: string;
//     error?: string;
//   }> = new Map();

//   static getInstance(): DownloadService {
//     if (!DownloadService.instance) {
//       DownloadService.instance = new DownloadService();
//     }
//     return DownloadService.instance;
//   }

//   async selectDownloadDirectory(): Promise<string | null> {
//     try {
//       if (window.electronAPI) {
//         const result = await window.electronAPI.showOpenDialog({
//           properties: ['openDirectory'],
//           title: 'Select Download Directory'
//         });

//         if (!result.canceled && result.filePaths.length > 0) {
//           return result.filePaths[0];
//         }
//       } else {
//         const dir = prompt('Enter download directory path:');
//         return dir || null;
//       }
//     } catch (error) {
//       console.error('Error selecting directory:', error);
//       toast.error('Failed to select directory');
//       return null;
//     }
//     return null;
//   }

//   async downloadFile(
//     url: string,
//     destination: string,
//     onProgress?: (progress: number) => void,
//     downloadId?: string
//   ): Promise<string> {
//     try {
//       if (window.electronAPI) {
//         await window.electronAPI.downloadFile(url, destination, onProgress);
//         return destination;
//       } else {
//         const response = await fetch(url);
//         const blob = await response.blob();

//         const downloadUrl = URL.createObjectURL(blob);
//         const link = document.createElement('a');
//         link.href = downloadUrl;
//         link.download = destination.split('/').pop() || 'download';
//         document.body.appendChild(link);
//         link.click();
//         document.body.removeChild(link);
//         URL.revokeObjectURL(downloadUrl);

//         return destination;
//       }
//     } catch (error) {
//       console.error('Download error:', error);
//       throw error;
//     }
//   }

//   async downloadPosts(posts: Post[], service: string): Promise<void> {
//     const dir = await this.selectDownloadDirectory();
//     if (!dir) return;

//     posts.forEach(async (post, index) => {
//       const downloadId = `download-${post.id}-${Date.now()}`;
      
//       this.downloads.set(downloadId, {
//         id: downloadId,
//         post,
//         status: 'pending',
//         progress: 0
//       });

//       try {
//         this.downloads.get(downloadId)!.status = 'downloading';
        
//         const url = COOMER_SERVICES.includes(service)
//           ? `https://coomer.st${post.file?.path || ''}`
//           : `https://kemono.su${post.file?.path || ''}`;

//         const fileName = `${post.id}.${post.file?.name?.split('.').pop() || 'jpg'}`;
//         const filePath = `${dir}/${fileName}`;

//         await this.downloadFile(
//           url, 
//           filePath, 
//           (progress) => {
//             this.downloads.get(downloadId)!.progress = progress;
//           },
//           downloadId
//         );

//         this.downloads.get(downloadId)!.status = 'completed';
//         this.downloads.get(downloadId)!.filePath = filePath;
        
//         toast.success(`Downloaded: ${fileName}`);
//       } catch (error) {
//         console.error('Download failed:', error);
//         this.downloads.get(downloadId)!.status = 'error';
//         this.downloads.get(downloadId)!.error = error instanceof Error ? error.message : 'Unknown error';
//         toast.error(`Failed to download: ${post.title}`);
//       }
//     });
//   }

//   getDownloads() {
//     return Array.from(this.downloads.values());
//   }

//   openFileLocation(filePath: string): Promise<void> {
//     try {
//       if (window.electronAPI) {
//         return window.electronAPI.openPath(filePath);
//       } else {
//         window.open(`file://${filePath}`, '_blank');
//         return Promise.resolve();
//       }
//     } catch (error) {
//       console.error('Error opening file location:', error);
//       toast.error('Failed to open file location');
//       return Promise.reject(error);
//     }
//   }

//   async ensureDirectoryExists(dirPath: string): Promise<void> {
//     try {
//       if (window.electronAPI) {
//         await window.electronAPI.createDirectory(dirPath);
//       }
//     } catch (error) {
//       console.error('Error creating directory:', error);
//     }
//   }
// }

// // --- PERFORMANCE-OPTIMIZED IMAGE COMPONENT ---
// const OptimizedImage = React.memo(({
//   src,
//   alt,
//   className,
//   onLoad,
//   onError,
//   style,
//   objectFit = 'cover',
//   priority = false
// }: {
//   src: string;
//   alt: string;
//   className?: string;
//   onLoad?: () => void;
//   onError?: () => void;
//   style?: React.CSSProperties;
//   objectFit?: 'cover' | 'contain' | 'fill';
//   priority?: boolean;
// }) => {
//   const [imageSrc, setImageSrc] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isError, setIsError] = useState(false);
//   const [isInView, setIsInView] = useState(false);
//   const imgRef = useRef<HTMLImageElement>(null);

//   useEffect(() => {
//     if (!priority && !isInView) return;

//     const loadImage = async () => {
//       try {
//         setIsLoading(true);
//         setIsError(false);

//         const cachedUrl = await advancedImageCache.getImage(src);
//         setImageSrc(cachedUrl);
//         setIsLoading(false);
//         onLoad?.();
//       } catch (error) {
//         console.error('Error loading image:', error);
//         setImageSrc(src);
//         setIsLoading(false);
//         setIsError(true);
//         onError?.();
//       }
//     };

//     loadImage();
//   }, [src, priority, isInView, onLoad, onError]);

//   useEffect(() => {
//     if (!imgRef.current || priority) return;

//     const observer = new IntersectionObserver(
//       (entries) => {
//         entries.forEach((entry) => {
//           if (entry.isIntersecting) {
//             setIsInView(true);
//             observer.unobserve(entry.target);
//           }
//         });
//       },
//       { rootMargin: '100px' }
//     );

//     observer.observe(imgRef.current);

//     return () => {
//       if (imgRef.current) {
//         observer.unobserve(imgRef.current);
//       }
//     };
//   }, [priority]);

//   if (isError) {
//     return (
//       <div className={`flex items-center justify-center bg-gray-200 dark:bg-gray-800 ${className}`} style={style}>
//         <ImageOff size={24} className="text-gray-500 dark:text-gray-400" />
//       </div>
//     );
//   }

//   return (
//     <>
//       {isLoading && (
//         <div className={`absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-800 ${className}`} style={style}>
//           <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
//         </div>
//       )}
//       <img
//         ref={imgRef}
//         src={imageSrc || src}
//         alt={alt}
//         className={`${className} transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
//         style={{ ...style, objectFit }}
//         loading="lazy"
//       />
//     </>
//   );
// });

// // --- COMPACT CREATOR CARD ---
// const CompactCreatorCard = React.memo(({
//   creator,
//   onClick
// }: {
//   creator: Creator;
//   onClick: () => void;
// }) => {
//   const [imageError, setImageError] = useState(false);
//   const [isHovered, setIsHovered] = useState(false);
//   const [isLiked, setIsLiked] = useState(false);
//   const [isFavorited, setIsFavorited] = useState(false);
//   const [likes, setLikes] = useState(creator.favorited);

//   useEffect(() => {
//     setIsFavorited(favoritesManager.isFavorite(creator.id));
//   }, [creator.id]);

//   const getCreatorImageUrl = () => {
//     if (COOMER_SERVICES.includes(creator.service)) {
//       return `https://coomer.st/icons/${creator.service}/${creator.id}`;
//     } else {
//       return `https://kemono.su/icons/${creator.service}/${creator.id}`;
//     }
//   };

//   const handleLike = (e: React.MouseEvent) => {
//     e.stopPropagation();
//     setIsLiked(!isLiked);
//     setLikes(prev => isLiked ? prev - 1 : prev + 1);
//   };

//   const handleFavorite = (e: React.MouseEvent) => {
//     e.stopPropagation();
//     if (isFavorited) {
//       favoritesManager.removeFavorite(creator.id);
//       setIsFavorited(false);
//       toast('Removed from favorites');
//     } else {
//       favoritesManager.addFavorite(creator.id);
//       setIsFavorited(true);
//       toast('Added to favorites');
//     }
//   };

//   const getServiceColor = () => {
//     if (COOMER_SERVICES.includes(creator.service)) {
//       return 'from-purple-500 to-pink-500';
//     } else {
//       return 'from-blue-500 to-cyan-500';
//     }
//   };

//   return (
//     <div
//       className="relative aspect-square overflow-hidden rounded-xl cursor-pointer group transform transition-all duration-300 hover:scale-105"
//       onClick={onClick}
//       onMouseEnter={() => setIsHovered(true)}
//       onMouseLeave={() => setIsHovered(false)}
//     >
//       <div className={`absolute inset-0 bg-gradient-to-br ${getServiceColor()} opacity-80`} />

//       <div className="absolute inset-0 p-2">
//         {!imageError ? (
//           <img
//             src={getCreatorImageUrl()}
//             alt={creator.name}
//             className="w-full h-full object-cover rounded-lg"
//             onError={() => setImageError(true)}
//             loading="lazy"
//           />
//         ) : (
//           <div className="w-full h-full bg-gray-800 rounded-lg flex items-center justify-center">
//             <User size={24} className="text-gray-600" />
//           </div>
//         )}
//       </div>

//       <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-3 flex flex-col justify-between transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'
//         }`}>
//         <div className="flex justify-end gap-1">
//           <button
//             onClick={handleFavorite}
//             className="p-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
//           >
//             <Star size={14} className={isFavorited ? 'fill-yellow-500 text-yellow-500' : ''} />
//           </button>
//           <button
//             onClick={handleLike}
//             className="p-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
//           >
//             <Heart size={14} className={isLiked ? 'fill-red-500 text-red-500' : ''} />
//           </button>
//         </div>

//         <div>
//           <h3 className="text-white font-bold text-sm truncate">{creator.name}</h3>
//           <div className="flex items-center justify-between">
//             <span className="text-white/80 text-xs">{creator.service}</span>
//             <span className="text-white/80 text-xs flex items-center gap-1">
//               <Heart size={10} />
//               {likes}
//             </span>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// });

// // --- MEDIA COMPONENT (Handles both images and videos) ---
// const MediaComponent = React.memo(({
//   src,
//   alt,
//   className,
//   type,
//   onLoad,
//   onError,
//   style,
//   objectFit = 'cover',
//   priority = false
// }: {
//   src: string;
//   alt: string;
//   className?: string;
//   type: 'image' | 'video';
//   onLoad?: () => void;
//   onError?: () => void;
//   style?: React.CSSProperties;
//   objectFit?: 'cover' | 'contain' | 'fill';
//   priority?: boolean;
// }) => {
//   const [isLoading, setIsLoading] = useState(true);
//   const [isError, setIsError] = useState(false);
//   const videoRef = useRef<HTMLVideoElement>(null);

//   if (type === 'video') {
//     return (
//       <>
//         {isLoading && (
//           <div className={`absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-800 ${className}`} style={style}>
//             <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
//           </div>
//         )}
//         <video
//           ref={videoRef}
//           src={src}
//           className={`${className} transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
//           style={{ ...style, objectFit }}
//           onLoadedData={() => {
//             setIsLoading(false);
//             onLoad?.();
//           }}
//           onError={() => {
//             setIsError(true);
//             setIsLoading(false);
//             onError?.();
//           }}
//           muted
//           loop
//           playsInline
//           onMouseEnter={(e) => {
//             e.currentTarget.play().catch(() => {});
//           }}
//           onMouseLeave={(e) => {
//             e.currentTarget.pause();
//           }}
//         />
//         {isError && (
//           <div className={`absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-800 ${className}`} style={style}>
//             <ImageOff size={24} className="text-gray-500 dark:text-gray-400" />
//           </div>
//         )}
//         <div className="absolute top-2 right-2 bg-black/50 rounded-full p-1">
//           <PlayCircle size={12} className="text-white" />
//         </div>
//       </>
//     );
//   }

//   return (
//     <OptimizedImage
//       src={src}
//       alt={alt}
//       className={className}
//       onLoad={onLoad}
//       onError={onError}
//       style={style}
//       objectFit={objectFit}
//       priority={priority}
//     />
//   );
// });

// // --- COMPACT POST GRID ---
// const CompactPostGrid = React.memo(({
//   posts,
//   onPostClick,
//   service,
//   selectedPosts,
//   showSelection,
//   gridColumns = 4,
//   onLoadMore,
//   hasMore
// }: {
//   posts: Post[];
//   onPostClick: (post: Post, index: number) => void;
//   service: string;
//   selectedPosts: Set<string>;
//   showSelection: boolean;
//   gridColumns?: number;
//   onLoadMore?: () => void;
//   hasMore?: boolean;
// }) => {
//   const [hoveredPost, setHoveredPost] = useState<Post | null>(null);
//   const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
//   const [hoverPreviewEnabled, setHoverPreviewEnabled] = useState(false);
//   const loadMoreRef = useRef<HTMLDivElement>(null);

//   // Infinite scroll for posts
//   useEffect(() => {
//     if (!loadMoreRef.current || !onLoadMore || !hasMore) return;

//     const observer = new IntersectionObserver(
//       (entries) => {
//         if (entries[0].isIntersecting) {
//           onLoadMore();
//         }
//       },
//       { threshold: 0.1 }
//     );

//     observer.observe(loadMoreRef.current);

//     return () => {
//       if (loadMoreRef.current) {
//         observer.unobserve(loadMoreRef.current);
//       }
//     };
//   }, [onLoadMore, hasMore]);

//   // Track mouse position for hover preview
//   useEffect(() => {
//     const handleMouseMove = (e: MouseEvent) => {
//       setMousePosition({ x: e.clientX, y: e.clientY });
//     };

//     if (hoverPreviewEnabled) {
//       window.addEventListener('mousemove', handleMouseMove);
//     }

//     return () => {
//       window.removeEventListener('mousemove', handleMouseMove);
//     };
//   }, [hoverPreviewEnabled]);

//   // Preload images for better performance
//   useEffect(() => {
//     const imageUrls = posts.slice(0, 20).map(post => {
//       if (post.file) {
//         const baseUrl = COOMER_SERVICES.includes(service) ? 'https://coomer.st' : 'https://kemono.su';
//         return `${baseUrl}${post.file.path}`;
//       }
//       if (post.attachments && post.attachments.length > 0) {
//         const baseUrl = COOMER_SERVICES.includes(service) ? 'https://coomer.st' : 'https://kemono.su';
//         return `${baseUrl}${post.attachments[0].path}`;
//       }
//       return '';
//     }).filter(Boolean);

//     advancedImageCache.preloadImages(imageUrls);
//   }, [posts, service]);

//   const getPostMedia = (post: Post) => {
//     const baseUrl = COOMER_SERVICES.includes(service) ? 'https://coomer.st' : 'https://kemono.su';
    
//     if (post.file) {
//       return {
//         url: `${baseUrl}${post.file.path}`,
//         type: post.file.name?.includes('.mp4') || 
//               post.file.name?.includes('.mov') || 
//               post.file.name?.includes('.avi') || 
//               post.file.name?.includes('.webm') ? 'video' : 'image',
//         name: post.file.name
//       };
//     }
    
//     if (post.attachments && post.attachments.length > 0) {
//       return {
//         url: `${baseUrl}${post.attachments[0].path}`,
//         type: post.attachments[0].name?.includes('.mp4') || 
//               post.attachments[0].name?.includes('.mov') || 
//               post.attachments[0].name?.includes('.avi') || 
//               post.attachments[0].name?.includes('.webm') ? 'video' : 'image',
//         name: post.attachments[0].name
//       };
//     }
    
//     return null;
//   };

//   const isVideo = (filename?: string) => {
//     if (!filename) return false;
//     return filename.includes('.mp4') || filename.includes('.mov') || filename.includes('.avi') || filename.includes('.webm');
//   };

//   return (
//     <>
//       <div
//         className={`grid gap-1 w-full`}
//         style={{ gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))` }}
//       >
//         {posts.map((post, index) => {
//           const media = getPostMedia(post);
//           const isSelected = selectedPosts.has(post.id);
//           const hasMultiple = post.attachments && post.attachments.length > 0;

//           return (
//             <div
//               key={post.id}
//               className={`relative aspect-square overflow-hidden rounded-lg cursor-pointer group transform transition-all duration-300 hover:scale-105 ${showSelection && isSelected ? 'ring-2 ring-blue-500' : ''
//                 }`}
//               onClick={() => onPostClick(post, index)}
//               onMouseEnter={() => setHoveredPost(post)}
//               onMouseLeave={() => setHoveredPost(null)}
//             >
//               {showSelection && (
//                 <div className="absolute top-2 left-2 z-10">
//                   <div className={`w-5 h-5 rounded-full border-2 border-white flex items-center justify-center ${isSelected ? 'bg-blue-500' : 'bg-black/50'
//                     }`}>
//                     {isSelected && (
//                       <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
//                         <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
//                       </svg>
//                     )}
//                   </div>
//                 </div>
//               )}

//               {hasMultiple && (
//                 <div className="absolute top-2 right-2 z-10 bg-black/50 rounded-full px-1.5 py-0.5">
//                   <span className="text-xs text-white">+{post.attachments.length}</span>
//                 </div>
//               )}

//               {media ? (
//                 <MediaComponent
//                   src={media.url}
//                   alt={post.title}
//                   type={media.type}
//                   className="w-full h-full"
//                 />
//               ) : (
//                 <div className="w-full h-full bg-gray-800 flex items-center justify-center">
//                   <ImageOff size={24} className="text-gray-600" />
//                 </div>
//               )}

//               <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
//                 <div className="absolute bottom-0 left-0 right-0 p-2">
//                   <p className="text-white text-xs font-medium truncate">{post.title}</p>
//                 </div>
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       {/* Infinite scroll trigger */}
//       {hasMore && onLoadMore && (
//         <div ref={loadMoreRef} className="flex justify-center py-4">
//           <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
//         </div>
//       )}

//       {/* Hover Preview */}
//       {hoverPreviewEnabled && hoveredPost && (
//         <HoverPreview
//           post={hoveredPost}
//           enabled={hoverPreviewEnabled}
//           mousePosition={mousePosition}
//           service={service}
//         />
//       )}
//     </>
//   );
// });

// // --- HOVER PREVIEW COMPONENT ---
// const HoverPreview = ({
//   post,
//   enabled,
//   mousePosition,
//   service
// }: {
//   post: Post;
//   enabled: boolean;
//   mousePosition: { x: number; y: number };
//   service: string;
// }) => {
//   const [position, setPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });
//   const [isVisible, setIsVisible] = useState(false);

//   const getMediaUrl = (path: string, service: string) => {
//     if (COOMER_SERVICES.includes(service)) {
//       return `https://coomer.st${path}`;
//     } else {
//       return `https://kemono.su${path}`;
//     }
//   };

//   const mediaUrl = post.file ? getMediaUrl(post.file.path, service) :
//     post.attachments.length > 0 ? getMediaUrl(post.attachments[0].path, service) : null;

//   useEffect(() => {
//     if (!enabled || !mediaUrl) return;

//     const updatePosition = () => {
//       const viewportWidth = window.innerWidth;
//       const viewportHeight = window.innerHeight;
//       const previewWidth = Math.min(viewportWidth * 0.7, 900);
//       const previewHeight = Math.min(viewportHeight * 0.8, 700);

//       let left = mousePosition.x + 20;
//       let top = mousePosition.y - previewHeight / 2;

//       if (left + previewWidth > viewportWidth) {
//         left = mousePosition.x - previewWidth - 20;
//       }

//       if (top < 10) {
//         top = 10;
//       } else if (top + previewHeight > viewportHeight - 10) {
//         top = viewportHeight - previewHeight - 10;
//       }

//       setPosition({ top, left, width: previewWidth, height: previewHeight });
//     };

//     updatePosition();

//     const handleResize = () => updatePosition();
//     window.addEventListener('resize', handleResize);

//     return () => window.removeEventListener('resize', handleResize);
//   }, [enabled, mousePosition, mediaUrl]);

//   useEffect(() => {
//     if (enabled && mediaUrl) {
//       const timer = setTimeout(() => setIsVisible(true), 300);
//       return () => clearTimeout(timer);
//     } else {
//       setIsVisible(false);
//     }
//   }, [enabled, mediaUrl]);

//   if (!enabled || !isVisible || !mediaUrl) return null;

//   const isVideo = post.file?.name?.includes('.mp4') || 
//                  post.file?.name?.includes('.mov') || 
//                  post.file?.name?.includes('.avi') || 
//                  post.file?.name?.includes('.webm') ||
//                  post.attachments?.[0]?.name?.includes('.mp4') ||
//                  post.attachments?.[0]?.name?.includes('.mov') ||
//                  post.attachments?.[0]?.name?.includes('.avi') ||
//                  post.attachments?.[0]?.name?.includes('.webm');

//   return (
//     <div
//       className="fixed z-50 bg-black rounded-lg shadow-2xl overflow-hidden border border-gray-800"
//       style={{
//         top: `${position.top}px`,
//         left: `${position.left}px`,
//         width: `${position.width}px`,
//         height: `${position.height}px`,
//       }}
//     >
//       {isVideo ? (
//         <video
//           src={mediaUrl}
//           className="w-full h-full"
//           autoPlay
//           muted
//           loop
//         />
//       ) : (
//         <OptimizedImage
//           src={mediaUrl}
//           alt={`Preview of ${post.id}`}
//           className="w-full h-full"
//           objectFit="cover"
//         />
//       )}
//       <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 text-white">
//         <p className="text-sm font-semibold truncate">{post.title}</p>
//         <div className="flex items-center gap-2 mt-1">
//           <span className="flex items-center gap-1 text-xs">
//             <Heart size={10} />
//             {Math.floor(Math.random() * 1000) + 100}
//           </span>
//           <span className="flex items-center gap-1 text-xs">
//             <Eye size={10} />
//             {Math.floor(Math.random() * 10000) + 1000}
//           </span>
//         </div>
//       </div>
//     </div>
//   );
// };

// // --- MOVIE MODE COMPONENT ---
// const MovieMode = ({
//   posts,
//   onClose,
//   infiniteMode,
//   service
// }: {
//   posts: Post[];
//   onClose: () => void;
//   infiniteMode: boolean;
//   service: string;
// }) => {
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [showControls, setShowControls] = useState(true);
//   const intervalRef = useRef<NodeJS.Timeout | null>(null);
//   const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

//   const getDisplayPosts = () => {
//     const result = [];
//     const startIndex = currentIndex * 4;

//     for (let i = 0; i < 4; i++) {
//       const index = (startIndex + i) % posts.length;
//       result.push(posts[index]);
//     }

//     return result;
//   };

//   const displayPosts = getDisplayPosts();

//   useEffect(() => {
//     if (isPlaying) {
//       intervalRef.current = setInterval(() => {
//         setCurrentIndex(prev => {
//           const maxIndex = Math.ceil(posts.length / 4) - 1;
//           if (infiniteMode && prev >= maxIndex) {
//             return 0;
//           }
//           return prev < maxIndex ? prev + 1 : prev;
//         });
//       }, 4000);
//     } else {
//       if (intervalRef.current) {
//         clearInterval(intervalRef.current);
//         intervalRef.current = null;
//       }
//     }

//     return () => {
//       if (intervalRef.current) {
//         clearInterval(intervalRef.current);
//         intervalRef.current = null;
//       }
//     };
//   }, [isPlaying, posts.length, infiniteMode]);

//   const handleMouseMove = () => {
//     setShowControls(true);
//     if (controlsTimeoutRef.current) {
//       clearTimeout(controlsTimeoutRef.current);
//     }
//     controlsTimeoutRef.current = setTimeout(() => {
//       setShowControls(false);
//     }, 3000);
//   };

//   const handleStart = () => {
//     setIsPlaying(true);
//   };

//   const handleStop = () => {
//     setIsPlaying(false);
//   };

//   const getPostMedia = (post: Post) => {
//     const baseUrl = COOMER_SERVICES.includes(service) ? 'https://coomer.st' : 'https://kemono.su';
    
//     if (post.file) {
//       return {
//         url: `${baseUrl}${post.file.path}`,
//         type: post.file.name?.includes('.mp4') || 
//               post.file.name?.includes('.mov') || 
//               post.file.name?.includes('.avi') || 
//               post.file.name?.includes('.webm') ? 'video' : 'image'
//       };
//     }
    
//     if (post.attachments && post.attachments.length > 0) {
//       return {
//         url: `${baseUrl}${post.attachments[0].path}`,
//         type: post.attachments[0].name?.includes('.mp4') || 
//               post.attachments[0].name?.includes('.mov') || 
//               post.attachments[0].name?.includes('.avi') || 
//               post.attachments[0].name?.includes('.webm') ? 'video' : 'image'
//       };
//     }
    
//     return null;
//   };

//   return (
//     <div
//       className="fixed inset-0 bg-black z-50 flex items-center justify-center"
//       onClick={onClose}
//       onMouseMove={handleMouseMove}
//     >
//       <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
//         <div className="absolute inset-8 border-8 border-gray-700 rounded-3xl shadow-2xl">
//           <div className="absolute inset-4 border-4 border-gray-600 rounded-2xl">
//             <div className="absolute inset-2 bg-black rounded-xl overflow-hidden">
//               <div className="grid grid-cols-2 grid-rows-2 gap-1 h-full">
//                 {displayPosts.map((post, index) => {
//                   const media = getPostMedia(post);
//                   return (
//                     <div key={index} className="relative bg-gray-900 overflow-hidden">
//                       {media ? (
//                         media.type === 'video' ? (
//                           <video
//                             src={media.url}
//                             className="w-full h-full object-cover"
//                             autoPlay
//                             muted
//                             loop
//                           />
//                         ) : (
//                           <OptimizedImage
//                             src={media.url}
//                             alt={`Movie mode post ${index + 1}`}
//                             className="w-full h-full"
//                             objectFit="cover"
//                           />
//                         )
//                       ) : (
//                         <div className="w-full h-full flex items-center justify-center">
//                           <ImageOff size={24} className="text-gray-600" />
//                         </div>
//                       )}
//                     </div>
//                   );
//                 })}
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="absolute top-12 left-1/2 transform -translate-x-1/2 text-gray-600 text-2xl font-bold">
//           CREATOR TV
//         </div>

//         <div className="absolute bottom-12 right-12 w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center shadow-lg">
//           <Power size={24} className="text-gray-500" />
//         </div>
//       </div>

//       <div className={`absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'
//         }`}>
//         <div className="flex justify-between items-center">
//           <div className="flex items-center gap-4">
//             <h2 className="text-white text-xl font-bold flex items-center gap-2">
//               <Tv size={24} />
//               Movie Mode
//             </h2>
//             <div className="flex items-center gap-2">
//               {!isPlaying ? (
//                 <button
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     handleStart();
//                   }}
//                   className="p-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors"
//                 >
//                   <Play size={20} />
//                 </button>
//               ) : (
//                 <button
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     handleStop();
//                   }}
//                   className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
//                 >
//                   <Pause size={20} />
//                 </button>
//               )}
//               <button
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   setCurrentIndex(Math.max(0, currentIndex - 1));
//                 }}
//                 className="p-2 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition-colors"
//               >
//                 <ChevronLeft size={20} />
//               </button>
//               <button
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   setCurrentIndex(prev => {
//                     const maxIndex = Math.ceil(posts.length / 4) - 1;
//                     return prev < maxIndex ? prev + 1 : prev;
//                   });
//                 }}
//                 className="p-2 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition-colors"
//               >
//                 <ChevronRight size={20} />
//               </button>
//             </div>
//             <div className="flex items-center gap-2">
//               <label className="text-white text-sm flex items-center gap-1">
//                 <input
//                   type="checkbox"
//                   checked={infiniteMode}
//                   onChange={() => { }}
//                   className="rounded"
//                 />
//                 Infinite Loop
//               </label>
//             </div>
//           </div>
//           <button
//             onClick={(e) => {
//               e.stopPropagation();
//               onClose();
//             }}
//             className="p-2 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition-colors"
//           >
//             <X size={20} />
//           </button>
//         </div>
//       </div>

//       <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'
//         }`}>
//         <div className="max-w-4xl mx-auto">
//           <div className="w-full bg-gray-700 rounded-full h-2">
//             <div
//               className="bg-blue-500 h-2 rounded-full transition-all duration-1000 ease-linear"
//               style={{
//                 width: `${((currentIndex + 1) / Math.ceil(posts.length / 4)) * 100}%`
//               }}
//             />
//           </div>
//           <p className="text-white text-sm mt-2 text-center">
//             Set {currentIndex + 1} / {Math.ceil(posts.length / 4)} • {posts.length} posts
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// // --- GALLERY VIEWER ---
// const GalleryViewer = ({
//   post,
//   isOpen,
//   onClose,
//   onNext,
//   onPrevious,
//   hasNext,
//   hasPrevious,
//   currentIndex,
//   totalCount,
//   service
// }: {
//   post: Post | null;
//   isOpen: boolean;
//   onClose: () => void;
//   onNext: () => void;
//   onPrevious: () => void;
//   hasNext: boolean;
//   hasPrevious: boolean;
//   currentIndex: number;
//   totalCount: number;
//   service: string;
// }) => {
//   const [currentImageIndex, setCurrentImageIndex] = useState(0);
//   const [isFullscreen, setIsFullscreen] = useState(false);
//   const [showInfo, setShowInfo] = useState(false);
//   const [isLiked, setIsLiked] = useState(false);
//   const [isBookmarked, setIsBookmarked] = useState(false);
//   const [likes, setLikes] = useState(Math.floor(Math.random() * 1000) + 100);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [showControls, setShowControls] = useState(true);
//   const [zoomLevel, setZoomLevel] = useState(1);
//   const [rotation, setRotation] = useState(0);
//   const [isDragging, setIsDragging] = useState(false);
//   const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
//   const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
//   const [copied, setCopied] = useState(false);
//   const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
//   const containerRef = useRef<HTMLDivElement>(null);

//   const getMediaUrl = (path: string, service: string) => {
//     if (COOMER_SERVICES.includes(service)) {
//       return `https://coomer.st${path}`;
//     } else {
//       return `https://kemono.su${path}`;
//     }
//   };

//   const mediaItems = useMemo(() => {
//     if (!post) return [];
    
//     const items = [];
    
//     if (post.file) {
//       items.push({
//         type: post.file.name?.includes('.mp4') || 
//               post.file.name?.includes('.mov') || 
//               post.file.name?.includes('.avi') || 
//               post.file.name?.includes('.webm') ? 'video' : 'image',
//         url: getMediaUrl(post.file.path, service),
//         name: post.file.name
//       });
//     }
    
//     if (post.attachments && post.attachments.length > 0) {
//       post.attachments.forEach(att => {
//         items.push({
//           type: att.name?.includes('.mp4') || 
//                 att.name?.includes('.mov') || 
//                 att.name?.includes('.avi') || 
//                 att.name?.includes('.webm') ? 'video' : 'image',
//           url: getMediaUrl(att.path, service),
//           name: att.name
//         });
//       });
//     }
    
//     return items;
//   }, [post, service]);

//   const currentMedia = mediaItems[currentImageIndex];

//   const handleLike = () => {
//     setIsLiked(!isLiked);
//     setLikes(prev => isLiked ? prev - 1 : prev + 1);
//   };

//   const handleBookmark = () => {
//     setIsBookmarked(!isBookmarked);
//     toast(isBookmarked ? 'Removed from bookmarks' : 'Added to bookmarks');
//   };

//   const handleShare = async () => {
//     if (currentMedia) {
//       try {
//         await navigator.clipboard.writeText(currentMedia.url);
//         setCopied(true);
//         setTimeout(() => setCopied(false), 2000);
//         toast('Link copied to clipboard');
//       } catch (err) {
//         console.error('Failed to copy link:', err);
//       }
//     }
//   };

//   const handleDownload = async () => {
//     if (!currentMedia) return;

//     const downloadService = DownloadService.getInstance();
//     const dir = await downloadService.selectDownloadDirectory();
//     if (!dir) return;

//     const fileName = currentMedia.name || `${post?.id || 'download'}.${currentMedia.type === 'video' ? 'mp4' : 'jpg'}`;
//     const filePath = `${dir}/${fileName}`;

//     try {
//       await downloadService.downloadFile(currentMedia.url, filePath);
//       toast.success(`Downloaded: ${fileName}`);
//     } catch (error) {
//       console.error('Download failed:', error);
//       toast.error('Download failed');
//     }
//   };

//   const handleFullscreen = () => {
//     if (!document.fullscreenElement) {
//       containerRef.current?.requestFullscreen();
//       setIsFullscreen(true);
//     } else {
//       document.exitFullscreen();
//       setIsFullscreen(false);
//     }
//   };

//   const handleZoomIn = () => {
//     setZoomLevel(prev => Math.min(prev + 0.25, 3));
//   };

//   const handleZoomOut = () => {
//     setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
//   };

//   const handleRotate = () => {
//     setRotation(prev => (prev + 90) % 360);
//   };

//   const handleReset = () => {
//     setZoomLevel(1);
//     setRotation(0);
//     setDragOffset({ x: 0, y: 0 });
//   };

//   const handleMouseDown = (e: React.MouseEvent) => {
//     if (zoomLevel > 1) {
//       setIsDragging(true);
//       setDragStart({ x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y });
//     }
//   };

//   const handleMouseMove = (e: React.MouseEvent) => {
//     if (isDragging) {
//       setDragOffset({
//         x: e.clientX - dragStart.x,
//         y: e.clientY - dragStart.y
//       });
//     }
//   };

//   const handleMouseUp = () => {
//     setIsDragging(false);
//   };

//   const handleNextImage = () => {
//     if (currentImageIndex < mediaItems.length - 1) {
//       setCurrentImageIndex(currentImageIndex + 1);
//     }
//   };

//   const handlePreviousImage = () => {
//     if (currentImageIndex > 0) {
//       setCurrentImageIndex(currentImageIndex - 1);
//     }
//   };

//   useEffect(() => {
//     if (showControls) {
//       controlsTimeoutRef.current = setTimeout(() => {
//         setShowControls(false);
//       }, 3000);
//     } else {
//       if (controlsTimeoutRef.current) {
//         clearTimeout(controlsTimeoutRef.current);
//       }
//     }

//     return () => {
//       if (controlsTimeoutRef.current) {
//         clearTimeout(controlsTimeoutRef.current);
//       }
//     };
//   }, [showControls]);

//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       switch (e.key) {
//         case 'Escape':
//           if (isFullscreen) {
//             handleFullscreen();
//           } else {
//             onClose();
//           }
//           break;
//         case 'ArrowLeft':
//           if (mediaItems.length > 1) {
//             handlePreviousImage();
//           } else if (hasPrevious) {
//             onPrevious();
//           }
//           break;
//         case 'ArrowRight':
//           if (mediaItems.length > 1) {
//             handleNextImage();
//           } else if (hasNext) {
//             onNext();
//           }
//           break;
//         case ' ':
//           e.preventDefault();
//           if (currentMedia?.type === 'video') {
//             setIsPlaying(!isPlaying);
//           }
//           break;
//         case 'f':
//           handleFullscreen();
//           break;
//         case '+':
//         case '=':
//           handleZoomIn();
//           break;
//         case '-':
//         case '_':
//           handleZoomOut();
//           break;
//         case 'r':
//           handleRotate();
//           break;
//         case '0':
//           handleReset();
//           break;
//         case 'l':
//           handleLike();
//           break;
//         case 'b':
//           handleBookmark();
//           break;
//         case 'd':
//           handleDownload();
//           break;
//         case 'c':
//           handleShare();
//           break;
//         case 'i':
//           setShowInfo(!showInfo);
//           break;
//       }
//     };

//     window.addEventListener('keydown', handleKeyDown);
//     return () => window.removeEventListener('keydown', handleKeyDown);
//   }, [onClose, onPrevious, onNext, hasPrevious, hasNext, isFullscreen, isPlaying, showInfo, isLiked, currentMedia, mediaItems]);

//   if (!post || !currentMedia) return null;

//   return (
//     <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
//       <div
//         ref={containerRef}
//         className={`relative w-full h-full flex flex-col ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
//         onMouseDown={handleMouseDown}
//         onMouseMove={handleMouseMove}
//         onMouseUp={handleMouseUp}
//         onMouseLeave={handleMouseUp}
//         onClick={() => setShowControls(!showControls)}
//       >
//         <div className={`absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/70 to-transparent p-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'
//           }`}>
//           <div className="flex justify-between items-center">
//             <div className="flex items-center gap-3 text-white">
//               <span className="text-sm bg-black/50 px-2 py-1 rounded backdrop-blur-sm">
//                 {currentIndex + 1} / {totalCount}
//               </span>
//               {mediaItems.length > 1 && (
//                 <span className="text-sm bg-black/50 px-2 py-1 rounded backdrop-blur-sm">
//                   {currentImageIndex + 1} / {mediaItems.length}
//                 </span>
//               )}
//               <span className="text-sm">{post.service}</span>
//             </div>
//             <div className="flex items-center gap-2">
//               <button
//                 onClick={handleLike}
//                 className={`p-2 rounded-full transition-colors ${isLiked ? 'bg-red-500 text-white' : 'bg-black/50 text-white hover:bg-black/70'
//                   }`}
//               >
//                 <Heart size={18} fill={isLiked ? 'white' : 'none'} />
//               </button>
//               <button
//                 onClick={handleBookmark}
//                 className={`p-2 rounded-full transition-colors ${isBookmarked ? 'bg-blue-500 text-white' : 'bg-black/50 text-white hover:bg-black/70'
//                   }`}
//               >
//                 <Bookmark size={18} fill={isBookmarked ? 'white' : 'none'} />
//               </button>
//               <button
//                 onClick={handleShare}
//                 className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
//               >
//                 {copied ? <Check size={18} /> : <Copy size={18} />}
//               </button>
//               <button
//                 onClick={handleDownload}
//                 className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
//               >
//                 <Download size={18} />
//               </button>
//               <button
//                 onClick={() => setShowInfo(!showInfo)}
//                 className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
//               >
//                 <Info size={18} />
//               </button>
//               <button
//                 onClick={handleFullscreen}
//                 className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
//               >
//                 {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
//               </button>
//               <button
//                 onClick={onClose}
//                 className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
//               >
//                 <X size={18} />
//               </button>
//             </div>
//           </div>
//         </div>

//         {mediaItems.length > 1 && (
//           <>
//             {currentImageIndex > 0 && (
//               <button
//                 onClick={handlePreviousImage}
//                 className="absolute left-4 top-1/2 -translate-y-1/2 z-40 p-3 text-white bg-black/50 rounded-full hover:bg-black/70 transition-all backdrop-blur-sm hover:scale-110"
//               >
//                 <ChevronLeft size={28} />
//               </button>
//             )}

//             {currentImageIndex < mediaItems.length - 1 && (
//               <button
//                 onClick={handleNextImage}
//                 className="absolute right-4 top-1/2 -translate-y-1/2 z-40 p-3 text-white bg-black/50 rounded-full hover:bg-black/70 transition-all backdrop-blur-sm hover:scale-110"
//               >
//                 <ChevronRight size={28} />
//               </button>
//             )}
//           </>
//         )}

//         <div className="flex-grow flex items-center justify-center bg-black relative overflow-hidden">
//           <div
//             className="relative w-full h-full flex items-center justify-center"
//             style={{
//               transform: `scale(${zoomLevel}) rotate(${rotation}deg) translate(${dragOffset.x}px, ${dragOffset.y}px)`,
//               transition: isDragging ? 'none' : 'transform 0.3s ease'
//             }}
//           >
//             {currentMedia.type === 'video' ? (
//               <video
//                 src={currentMedia.url}
//                 className="max-w-full max-h-full object-contain"
//                 controls={false}
//                 autoPlay={isPlaying}
//                 loop
//                 muted
//                 onClick={(e) => e.stopPropagation()}
//               />
//             ) : (
//               <OptimizedImage
//                 src={currentMedia.url}
//                 alt={post.title}
//                 className="max-w-full max-h-full object-contain"
//                 priority={true}
//               />
//             )}
//           </div>
//         </div>

//         <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'
//           }`}>
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-2">
//               {hasPrevious && (
//                 <button
//                   onClick={onPrevious}
//                   className="p-2 text-white hover:bg-white/20 rounded-full"
//                 >
//                   <ChevronLeft size={20} />
//                 </button>
//               )}
              
//               {currentMedia.type === 'video' && (
//                 <button
//                   onClick={() => setIsPlaying(!isPlaying)}
//                   className="p-2 text-white hover:bg-white/20 rounded-full"
//                 >
//                   {isPlaying ? <Pause size={20} /> : <Play size={20} />}
//                 </button>
//               )}
              
//               {hasNext && (
//                 <button
//                   onClick={onNext}
//                   className="p-2 text-white hover:bg-white/20 rounded-full"
//                 >
//                   <ChevronRight size={20} />
//                 </button>
//               )}
//             </div>

//             <div className="flex items-center gap-2">
//               <button
//                 onClick={handleZoomOut}
//                 className="p-2 text-white hover:bg-white/20 rounded-full"
//               >
//                 <ZoomOut size={20} />
//               </button>
//               <span className="text-white text-sm w-8 text-center">{Math.round(zoomLevel * 100)}%</span>
//               <button
//                 onClick={handleZoomIn}
//                 className="p-2 text-white hover:bg-white/20 rounded-full"
//               >
//                 <ZoomIn size={20} />
//               </button>
//               <button
//                 onClick={handleRotate}
//                 className="p-2 text-white hover:bg-white/20 rounded-full"
//               >
//                 <RotateCw size={20} />
//               </button>
//               <button
//                 onClick={handleReset}
//                 className="p-2 text-white hover:bg-white/20 rounded-full"
//               >
//                 <span className="text-xs">1:1</span>
//               </button>
//             </div>
//           </div>

//           {totalCount > 1 && (
//             <div className="flex items-center justify-center mt-2 gap-1">
//               {Array.from({ length: totalCount }).map((_, index) => (
//                 <button
//                   key={index}
//                   onClick={() => { }}
//                   className={`w-2 h-2 rounded-full transition-all duration-200 ${index === currentIndex ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/70'
//                     }`}
//                 />
//               ))}
//             </div>
//           )}
//         </div>

//         {showInfo && (
//           <div className="absolute bottom-20 left-4 right-4 bg-black/80 backdrop-blur-md rounded-lg p-4 text-white max-w-md">
//             <h3 className="font-semibold mb-3">{post.title}</h3>
//             <div className="space-y-2 text-sm">
//               <div className="flex justify-between">
//                 <span className="text-gray-400">Service:</span>
//                 <span>{post.service}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-gray-400">Published:</span>
//                 <span>{new Date(post.published).toLocaleDateString()}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-gray-400">Likes:</span>
//                 <span>{likes}</span>
//               </div>
//               {post.content && (
//                 <div>
//                   <span className="text-gray-400">Content:</span>
//                   <p className="mt-1 line-clamp-3">{post.content}</p>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// // --- COMPACT PROFILE VIEWER ---
// const CompactProfileViewer = ({
//   creator,
//   isOpen,
//   onClose
// }: {
//   creator: Creator | null;
//   isOpen: boolean;
//   onClose: () => void;
// }) => {
//   const [posts, setPosts] = useState<Post[]>([]);
//   const [profile, setProfile] = useState<Profile | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [loadingMore, setLoadingMore] = useState(false);
//   const [selectedPost, setSelectedPost] = useState<Post | null>(null);
//   const [isPostViewerOpen, setIsPostViewerOpen] = useState(false);
//   const [currentPostIndex, setCurrentPostIndex] = useState(0);
//   const [viewMode, setViewMode] = useState<'grid' | 'slideshow'>('grid');
//   const [gridColumns, setGridColumns] = useState(4);
//   const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'mostLiked'>('newest');
//   const [filterType, setFilterType] = useState<'all' | 'images' | 'videos'>('all');
//   const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set());
//   const [showSelection, setShowSelection] = useState(false);
//   const [hoverPreviewEnabled, setHoverPreviewEnabled] = useState(false);
//   const [movieModeActive, setMovieModeActive] = useState(false);
//   const [movieModeInfinite, setMovieModeInfinite] = useState(true);
//   const [currentPage, setCurrentPage] = useState(0);
//   const [hasMorePosts, setHasMorePosts] = useState(false);
//   const [isFollowing, setIsFollowing] = useState(false);
//   const [followers, setFollowers] = useState(Math.floor(Math.random() * 10000) + 1000);
//   const [isLiked, setIsLiked] = useState(false);
//   const [likes, setLikes] = useState(Math.floor(Math.random() * 1000) + 100);
//   const [isSyncing, setIsSyncing] = useState(false);
//   const [syncProgress, setSyncProgress] = useState(0);
//   const [isSynced, setIsSynced] = useState(false);
//   const [showCacheInfo, setShowCacheInfo] = useState(false);
//   const [cacheInfo, setCacheInfo] = useState({ count: 0, sizeMB: 0, maxSizeMB: 500 });

//   useEffect(() => {
//     if (!creator) return;

//     const fetchData = async () => {
//       setLoading(true);
//       try {
//         const isCoomer = COOMER_SERVICES.includes(creator.service);

//         const profileResponse = await axios.get<Profile>(
//           `${COOMER_POSTS_API_BASE_URL}/${creator.service}/user/${creator.id}/profile`,
//           { headers: isCoomer ? { 'Accept': 'text/css' } : {} }
//         );
//         setProfile(profileResponse.data);

//         const syncedPosts = offlineSyncManager.getSyncedPosts(creator.id);
//         if (syncedPosts.length > 0) {
//           setPosts(syncedPosts);
//           setIsSynced(true);
//         } else {
//           const postsResponse = await axios.get<Post[]>(
//             `${COOMER_POSTS_API_BASE_URL}/${creator.service}/user/${creator.id}/posts?o=0`,
//             { headers: isCoomer ? { 'Accept': 'text/css' } : {} }
//           );

//           const transformedPosts: Post[] = postsResponse.data.map((post: any) => ({
//             id: post.id,
//             user: post.user || creator.id,
//             service: creator.service,
//             title: post.title || 'Untitled',
//             content: post.content || '',
//             published: post.published,
//             file: post.file,
//             attachments: post.attachments || []
//           }));

//           setPosts(transformedPosts);
//           setHasMorePosts(transformedPosts.length === POSTS_PER_PAGE && profileResponse.data.post_count > POSTS_PER_PAGE);
//         }
//       } catch (error: any) {
//         console.error('Failed to fetch data:', error);
//         toast.error('Failed to load creator data');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [creator]);

//   useEffect(() => {
//     const updateCacheInfo = () => {
//       setCacheInfo(advancedImageCache.getCacheInfo());
//     };

//     updateCacheInfo();
//     const interval = setInterval(updateCacheInfo, 5000);

//     return () => clearInterval(interval);
//   }, []);

//   const loadMorePosts = useCallback(async () => {
//     if (!creator || !hasMorePosts || loadingMore) return;

//     setLoadingMore(true);
//     try {
//       const isCoomer = COOMER_SERVICES.includes(creator.service);
//       const offset = (currentPage + 1) * POSTS_PER_PAGE;

//       const response = await axios.get<Post[]>(
//         `${COOMER_POSTS_API_BASE_URL}/${creator.service}/user/${creator.id}/posts?o=${offset}`,
//         { headers: isCoomer ? { 'Accept': 'text/css' } : {} }
//       );

//       const transformedPosts: Post[] = response.data.map((post: any) => ({
//         id: post.id,
//         user: post.user || creator.id,
//         service: creator.service,
//         title: post.title || 'Untitled',
//         content: post.content || '',
//         published: post.published,
//         file: post.file,
//         attachments: post.attachments || []
//       }));

//       setPosts(prev => [...prev, ...transformedPosts]);
//       setCurrentPage(prev => prev + 1);

//       if (profile) {
//         setHasMorePosts((currentPage + 2) * POSTS_PER_PAGE < profile.post_count);
//       }
//     } catch (error: any) {
//       console.error('Failed to load more posts:', error);
//       toast.error('Failed to load more posts');
//     } finally {
//       setLoadingMore(false);
//     }
//   }, [creator, currentPage, hasMorePosts, loadingMore, profile]);

//   const filteredPosts = useMemo(() => {
//     let filtered = [...posts];

//     if (filterType === 'images') {
//       filtered = filtered.filter(post =>
//         !post.file?.name?.includes('.mp4') &&
//         !post.file?.name?.includes('.mov') &&
//         !post.file?.name?.includes('.avi') &&
//         !post.file?.name?.includes('.webm') &&
//         !post.attachments?.some(att =>
//           att.name?.includes('.mp4') ||
//           att.name?.includes('.mov') ||
//           att.name?.includes('.avi') ||
//           att.name?.includes('.webm')
//         )
//       );
//     } else if (filterType === 'videos') {
//       filtered = filtered.filter(post =>
//         post.file?.name?.includes('.mp4') ||
//         post.file?.name?.includes('.mov') ||
//         post.file?.name?.includes('.avi') ||
//         post.file?.name?.includes('.webm') ||
//         post.attachments?.some(att =>
//           att.name?.includes('.mp4') ||
//           att.name?.includes('.mov') ||
//           att.name?.includes('.avi') ||
//           att.name?.includes('.webm')
//         )
//       );
//     }

//     switch (sortBy) {
//       case 'newest':
//         filtered.sort((a, b) => new Date(b.published).getTime() - new Date(a.published).getTime());
//         break;
//       case 'oldest':
//         filtered.sort((a, b) => new Date(a.published).getTime() - new Date(b.published).getTime());
//         break;
//       case 'mostLiked':
//         filtered.sort(() => Math.random() - 0.5);
//         break;
//     }

//     return filtered;
//   }, [posts, filterType, sortBy]);

//   const handlePostClick = useCallback((post: Post, index: number) => {
//     if (showSelection) {
//       const newSelectedPosts = new Set(selectedPosts);
//       if (newSelectedPosts.has(post.id)) {
//         newSelectedPosts.delete(post.id);
//       } else {
//         newSelectedPosts.add(post.id);
//       }
//       setSelectedPosts(newSelectedPosts);
//     } else {
//       setSelectedPost(post);
//       setCurrentPostIndex(index);
//       setIsPostViewerOpen(true);
//     }
//   }, [showSelection, selectedPosts]);

//   const handleNextPost = useCallback(() => {
//     if (currentPostIndex < filteredPosts.length - 1) {
//       setCurrentPostIndex(currentPostIndex + 1);
//       setSelectedPost(filteredPosts[currentPostIndex + 1]);
//     }
//   }, [currentPostIndex, filteredPosts]);

//   const handlePreviousPost = useCallback(() => {
//     if (currentPostIndex > 0) {
//       setCurrentPostIndex(currentPostIndex - 1);
//       setSelectedPost(filteredPosts[currentPostIndex - 1]);
//     }
//   }, [currentPostIndex, filteredPosts]);

//   const handleSelectAll = () => {
//     if (selectedPosts.size === filteredPosts.length) {
//       setSelectedPosts(new Set());
//     } else {
//       setSelectedPosts(new Set(filteredPosts.map(post => post.id)));
//     }
//   };

//   const handleDownloadSelected = async () => {
//     const downloadService = DownloadService.getInstance();
//     const selectedPostsList = filteredPosts.filter(post => selectedPosts.has(post.id));
    
//     await downloadService.downloadPosts(selectedPostsList, creator?.service || '');
//   };

//   const handleSyncForOffline = async () => {
//     if (!creator) return;
    
//     setIsSyncing(true);
//     setSyncProgress(0);
    
//     try {
//       const interval = setInterval(() => {
//         setSyncProgress(prev => {
//           if (prev >= 100) {
//             clearInterval(interval);
//             return 100;
//           }
//           return prev + 10;
//         });
//       }, 500);
      
//       await offlineSyncManager.syncCreatorPosts(creator.id, posts);
//       setIsSynced(true);
//       toast('Posts synced for offline viewing');
//     } catch (error) {
//       console.error('Failed to sync posts:', error);
//       toast.error('Failed to sync posts');
//     } finally {
//       setIsSyncing(false);
//       setSyncProgress(0);
//     }
//   };

//   const handleClearCache = () => {
//     advancedImageCache.clearCache();
//     toast('Cache cleared');
//   };

//   const handleFollow = () => {
//     setIsFollowing(!isFollowing);
//     setFollowers(prev => isFollowing ? prev - 1 : prev + 1);
//     toast(isFollowing ? 'Unfollowed' : 'Following');
//   };

//   const handleLike = () => {
//     setIsLiked(!isLiked);
//     setLikes(prev => isLiked ? prev - 1 : prev + 1);
//   };

//   const handleMovieModeToggle = () => {
//     setMovieModeActive(!movieModeActive);
//   };

//   if (!creator) return null;

//   return (
//     <>
//       <div className={`fixed inset-0 z-50 ${isOpen ? 'block' : 'hidden'}`}>
//         <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
//         <div className="absolute inset-0 bg-white dark:bg-gray-900 text-white overflow-hidden flex flex-col">
//           <div className="flex-shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-3">
//                 <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
//                   <img
//                     src={
//                       COOMER_SERVICES.includes(creator.service)
//                         ? `https://coomer.st/icons/${creator.service}/${creator.id}`
//                         : `https://kemono.su/icons/${creator.service}/${creator.id}`
//                     }
//                     alt={creator.name}
//                     className="w-full h-full object-cover"
//                   />
//                 </div>
//                 <div>
//                   <h2 className="text-xl font-bold">{creator.name}</h2>
//                   <p className="text-sm text-gray-500 dark:text-gray-400">
//                     {creator.service} • {profile?.post_count || 0} posts
//                   </p>
//                 </div>
//               </div>

//               <div className="flex items-center gap-2">
//                 <button
//                   onClick={handleFollow}
//                   className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${isFollowing
//                       ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white'
//                       : 'bg-blue-500 text-white hover:bg-blue-600'
//                     }`}
//                 >
//                   {isFollowing ? 'Following' : 'Follow'}
//                 </button>

//                 <button
//                   onClick={handleLike}
//                   className={`p-2 rounded-full transition-colors ${isLiked
//                       ? 'bg-red-500 text-white'
//                       : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-red-500 hover:text-white'
//                     }`}
//                 >
//                   <Heart size={16} className={isLiked ? 'fill-current' : ''} />
//                 </button>

//                 <span className="text-sm text-gray-500 dark:text-gray-400">
//                   {likes} likes • {followers} followers
//                 </span>

//                 <button
//                   onClick={handleMovieModeToggle}
//                   className="flex items-center gap-1 px-3 py-2 bg-purple-600 text-white text-sm rounded-full hover:bg-purple-700 transition-colors"
//                 >
//                   <Tv size={14} />
//                   Movie Mode
//                 </button>

//                 <button
//                   onClick={() => setShowCacheInfo(!showCacheInfo)}
//                   className="flex items-center gap-1 px-3 py-2 bg-gray-600 text-white text-sm rounded-full hover:bg-gray-700 transition-colors"
//                 >
//                   <HardDrive size={14} />
//                   Cache
//                 </button>

//                 <button
//                   onClick={onClose}
//                   className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
//                 >
//                   <X size={16} />
//                 </button>
//               </div>
//             </div>
//           </div>

//           <div className="flex-shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-3">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-2">
//                 {showSelection && (
//                   <div className="flex items-center gap-2 mr-2">
//                     <button
//                       onClick={handleSelectAll}
//                       className="text-sm text-gray-600 dark:text-gray-400"
//                     >
//                       {selectedPosts.size === filteredPosts.length ? 'Deselect All' : 'Select All'}
//                     </button>
//                     <span className="text-sm text-gray-600 dark:text-gray-400">
//                       {selectedPosts.size} selected
//                     </span>
//                     <button
//                       onClick={handleDownloadSelected}
//                       disabled={selectedPosts.size === 0}
//                       className="text-sm text-blue-600 dark:text-blue-400 disabled:text-gray-400"
//                     >
//                       Download
//                     </button>
//                   </div>
//                 )}

//                 <button
//                   onClick={() => setShowSelection(!showSelection)}
//                   className={`p-2 rounded ${showSelection ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}
//                 >
//                   <Grid3x3 size={16} />
//                 </button>

//                 <button
//                   onClick={() => setHoverPreviewEnabled(!hoverPreviewEnabled)}
//                   className={`p-2 rounded ${hoverPreviewEnabled ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}
//                 >
//                   <MousePointer size={16} />
//                 </button>

//                 <select
//                   value={filterType}
//                   onChange={(e) => setFilterType(e.target.value as 'all' | 'images' | 'videos')}
//                   className="px-2 py-1 text-sm bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300"
//                 >
//                   <option value="all">All</option>
//                   <option value="images">Images</option>
//                   <option value="videos">Videos</option>
//                 </select>

//                 <select
//                   value={sortBy}
//                   onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'mostLiked')}
//                   className="px-2 py-1 text-sm bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300"
//                 >
//                   <option value="newest">Newest</option>
//                   <option value="oldest">Oldest</option>
//                   <option value="mostLiked">Most Liked</option>
//                 </select>

//                 <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded px-2 py-1">
//                   <span className="text-xs text-gray-600 dark:text-gray-400 mr-1">Columns</span>
//                   <input
//                     type="range"
//                     min="2"
//                     max="6"
//                     value={gridColumns}
//                     onChange={(e) => setGridColumns(parseInt(e.target.value))}
//                     className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
//                   />
//                   <span className="text-xs text-gray-600 dark:text-gray-400 ml-1">{gridColumns}</span>
//                 </div>

//                 <button
//                   onClick={handleSyncForOffline}
//                   disabled={isSyncing || isSynced}
//                   className={`flex items-center gap-1 px-3 py-1 text-sm rounded-full transition-colors ${
//                     isSynced 
//                       ? 'bg-green-600 text-white' 
//                       : isSyncing 
//                         ? 'bg-gray-400 text-white cursor-not-allowed' 
//                         : 'bg-blue-600 text-white hover:bg-blue-700'
//                   }`}
//                 >
//                   {isSyncing ? (
//                     <>
//                       <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                       {syncProgress}%
//                     </>
//                   ) : isSynced ? (
//                     <>
//                       <Wifi size={12} />
//                       Synced
//                     </>
//                   ) : (
//                     <>
//                       <WifiOff size={12} />
//                       Sync Offline
//                     </>
//                   )}
//                 </button>
//               </div>

//               <div className="flex items-center gap-2">
//                 <div className="flex bg-gray-100 dark:bg-gray-800 rounded">
//                   <button
//                     onClick={() => setViewMode('grid')}
//                     className={`p-2 rounded-l ${viewMode === 'grid' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}
//                   >
//                     <Grid3X3 size={16} />
//                   </button>
//                   <button
//                     onClick={() => setViewMode('slideshow')}
//                     className={`p-2 rounded-r ${viewMode === 'slideshow' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}
//                   >
//                     <PlayCircle size={16} />
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="flex-1 overflow-hidden">
//             {loading ? (
//               <div className="flex items-center justify-center h-full">
//                 <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
//               </div>
//             ) : filteredPosts.length === 0 ? (
//               <div className="flex items-center justify-center h-full">
//                 <p className="text-gray-500 dark:text-gray-400">No posts available</p>
//               </div>
//             ) : (
//               <div className="h-full overflow-y-auto">
//                 {viewMode === 'grid' ? (
//                   <div className="p-4">
//                     <CompactPostGrid
//                       posts={filteredPosts}
//                       onPostClick={handlePostClick}
//                       service={creator.service}
//                       selectedPosts={selectedPosts}
//                       showSelection={showSelection}
//                       gridColumns={gridColumns}
//                       onLoadMore={hasMorePosts ? loadMorePosts : undefined}
//                       hasMore={hasMorePosts}
//                     />
//                   </div>
//                 ) : (
//                   <div className="h-full flex items-center justify-center bg-black">
//                     <div className="text-center text-white">
//                       <PlayCircle className="h-16 w-16 mx-auto mb-4" />
//                       <p className="text-xl">Slideshow Mode</p>
//                       <p className="text-sm text-gray-400 mt-2">Feature coming soon</p>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {showCacheInfo && (
//         <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
//           <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
//             <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Cache Information</h3>
//             <div className="space-y-3">
//               <div className="flex justify-between">
//                 <span className="text-gray-600 dark:text-gray-400">Cached Images:</span>
//                 <span className="text-gray-900 dark:text-white">{cacheInfo.count}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-gray-600 dark:text-gray-400">Cache Size:</span>
//                 <span className="text-gray-900 dark:text-white">{cacheInfo.sizeMB} MB / {cacheInfo.maxSizeMB} MB</span>
//               </div>
//               <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
//                 <div 
//                   className="bg-blue-500 h-2 rounded-full" 
//                   style={{ width: `${(cacheInfo.sizeMB / cacheInfo.maxSizeMB) * 100}%` }}
//                 />
//               </div>
//             </div>
//             <div className="flex justify-end gap-2 mt-6">
//               <button
//                 onClick={handleClearCache}
//                 className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
//               >
//                 Clear Cache
//               </button>
//               <button
//                 onClick={() => setShowCacheInfo(false)}
//                 className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {isPostViewerOpen && selectedPost && (
//         <GalleryViewer
//           post={selectedPost}
//           isOpen={isPostViewerOpen}
//           onClose={() => setIsPostViewerOpen(false)}
//           onNext={handleNextPost}
//           onPrevious={handlePreviousPost}
//           hasNext={currentPostIndex < filteredPosts.length - 1}
//           hasPrevious={currentPostIndex > 0}
//           currentIndex={currentPostIndex}
//           totalCount={filteredPosts.length}
//           service={creator.service}
//         />
//       )}

//       {movieModeActive && (
//         <MovieMode
//           posts={filteredPosts}
//           onClose={() => setMovieModeActive(false)}
//           infiniteMode={movieModeInfinite}
//           service={creator.service}
//         />
//       )}
//     </>
//   );
// };

// // --- MAIN COMPONENT ---
// function RouteComponent() {
//   const [creators, setCreators] = useState<Creator[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedService, setSelectedService] = useState('all');
//   const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
//   const [apiError, setApiError] = useState<string | null>(null);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(0);
//   const [totalCreators, setTotalCreators] = useState(0);
//   const [hasMore, setHasMore] = useState(true);
//   const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
//   const [isProfileViewerOpen, setIsProfileViewerOpen] = useState(false);
//   const [isDarkMode, setIsDarkMode] = useState(true);
//   const [viewMode, setViewMode] = useState<'compact' | 'detailed'>('compact');
//   const [gridColumns, setGridColumns] = useState(6);
//   const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
//   const loadMoreRef = useRef<HTMLDivElement>(null);

//   const isCacheValid = useCallback(async () => {
//     try {
//       const cachedTimestamp = await storage.getItem(CACHE_TIMESTAMP_KEY) as string;
//       const cacheVersion = await storage.getItem(CACHE_VERSION_KEY) as string;

//       if (!cachedTimestamp || cacheVersion !== CACHE_VERSION) {
//         return false;
//       }

//       const timestamp = new Date(cachedTimestamp);
//       const now = new Date();
//       return (now.getTime() - timestamp.getTime()) < CACHE_EXPIRY_MS;
//     } catch (error) {
//       console.error('Error checking cache validity:', error);
//       return false;
//     }
//   }, []);

//   const loadFromIndexedDB = useCallback(async (page: number = 1) => {
//     try {
//       const isValid = await isCacheValid();
//       if (!isValid) return false;

//       const cacheKey = selectedService === 'all'
//         ? `creators:page:${page}`
//         : `creators:${selectedService}:page:${page}`;

//       const pageData = await storage.getItem(cacheKey) as Creator[];
//       const cachedTimestamp = await storage.getItem(CACHE_TIMESTAMP_KEY) as string;

//       if (pageData && pageData.length > 0) {
//         setCreators(prev => page === 1 ? pageData : [...prev, ...pageData]);
//         setLastUpdated(new Date(cachedTimestamp));
//         return true;
//       }

//       return false;
//     } catch (error) {
//       console.error('Error loading from IndexedDB:', error);
//       return false;
//     }
//   }, [isCacheValid, selectedService]);

//   const fetchCreators = useCallback(async (page: number = 1) => {
//     try {
//       setApiError(null);

//       if (page === 1) {
//         const cacheLoaded = await loadFromIndexedDB(page);
//         if (cacheLoaded) {
//           setLoading(false);
//           return;
//         }
//       }

//       if (page === 1) {
//         setLoading(true);
//       }

//       let apiUrl: string;

//       if (selectedService === 'all') {
//         const [coomerResponse, kemonoResponse] = await Promise.all([
//           axios.get<CreatorApiResponse>(`${COOMER_API_BASE_URL}?page=${page}&itemsPerPage=${Math.ceil(ITEMS_PER_PAGE / 2)}`),
//           axios.get<CreatorApiResponse>(`${KEMONO_API_BASE_URL}?page=${page}&itemsPerPage=${Math.ceil(ITEMS_PER_PAGE / 2)}`)
//         ]);

//         const combinedData = [...coomerResponse.data.data, ...kemonoResponse.data.data];
//         const combinedPagination = {
//           totalPages: Math.max(coomerResponse.data.pagination.totalPages, kemonoResponse.data.pagination.totalPages),
//           totalItems: coomerResponse.data.pagination.totalItems + kemonoResponse.data.pagination.totalItems,
//           isNextPage: coomerResponse.data.pagination.isNextPage || kemonoResponse.data.pagination.isNextPage,
//         };

//         setTotalPages(combinedPagination.totalPages);
//         setTotalCreators(combinedPagination.totalItems);
//         setHasMore(combinedPagination.isNextPage);

//         await storage.setItem(`creators:page:${page}`, combinedData);
//         setCreators(prev => page === 1 ? combinedData : [...prev, ...combinedData]);

//         if (page === 1) {
//           await storage.setItem(CACHE_TIMESTAMP_KEY, new Date().toISOString());
//           await storage.setItem(CACHE_VERSION_KEY, CACHE_VERSION);
//         }
//       } else if (selectedService === 'coomer' || selectedService === 'kemono') {
//         apiUrl = selectedService === 'coomer' ? COOMER_API_BASE_URL : KEMONO_API_BASE_URL;

//         const response = await axios.get<CreatorApiResponse>(`${apiUrl}?page=${page}&itemsPerPage=${ITEMS_PER_PAGE}`);
//         const { data, pagination } = response.data;

//         setTotalPages(pagination.totalPages);
//         setTotalCreators(pagination.totalItems);
//         setHasMore(pagination.isNextPage);

//         await storage.setItem(`creators:${selectedService}:page:${page}`, data);
//         setCreators(prev => page === 1 ? data : [...prev, ...data]);

//         if (page === 1) {
//           await storage.setItem(CACHE_TIMESTAMP_KEY, new Date().toISOString());
//           await storage.setItem(CACHE_VERSION_KEY, CACHE_VERSION);
//         }
//       } else {
//         const isCoomer = COOMER_SERVICES.includes(selectedService);
//         apiUrl = isCoomer ? COOMER_API_BASE_URL : KEMONO_API_BASE_URL;

//         const response = await axios.get<CreatorApiResponse>(`${apiUrl}/${selectedService}?page=${page}&itemsPerPage=${ITEMS_PER_PAGE}`);
//         const { data, pagination } = response.data;

//         setTotalPages(pagination.totalPages);
//         setTotalCreators(pagination.totalItems);
//         setHasMore(pagination.isNextPage);

//         await storage.setItem(`creators:${selectedService}:page:${page}`, data);
//         setCreators(prev => page === 1 ? data : [...prev, ...data]);

//         if (page === 1) {
//           await storage.setItem(CACHE_TIMESTAMP_KEY, new Date().toISOString());
//           await storage.setItem(CACHE_VERSION_KEY, CACHE_VERSION);
//         }
//       }

//       setLastUpdated(new Date());
//       if (page === 1) {
//         toast.success('Successfully loaded creators');
//       }
//     } catch (error: any) {
//       console.error('Fetch failed:', error);
//       setApiError('Failed to fetch creators data');
//       toast.error('Failed to fetch creators');

//       if (page === 1) {
//         await loadFromIndexedDB(page);
//       }
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   }, [loadFromIndexedDB, selectedService]);

//   const loadMoreCreators = useCallback(() => {
//     if (!hasMore || loading) return;
//     const nextPage = currentPage + 1;
//     setCurrentPage(nextPage);
//     fetchCreators(nextPage);
//   }, [currentPage, hasMore, loading, fetchCreators]);

//   // Infinite scroll for creators
//   useEffect(() => {
//     if (!loadMoreRef.current || !hasMore) return;

//     const observer = new IntersectionObserver(
//       (entries) => {
//         if (entries[0].isIntersecting) {
//           loadMoreCreators();
//         }
//       },
//       { threshold: 0.1 }
//     );

//     observer.observe(loadMoreRef.current);

//     return () => {
//       if (loadMoreRef.current) {
//         observer.unobserve(loadMoreRef.current);
//       }
//     };
//   }, [hasMore, loadMoreCreators]);

//   useEffect(() => {
//     setCurrentPage(1);
//     setCreators([]);
//     fetchCreators(1);
//   }, [selectedService]);

//   const filteredCreators = useMemo(() => {
//     let filtered = creators;
    
//     if (showFavoritesOnly) {
//       const favoriteIds = favoritesManager.getFavorites();
//       filtered = filtered.filter(creator => favoriteIds.includes(creator.id));
//     }
    
//     if (!searchTerm.trim()) return filtered;
//     return filtered.filter(creator =>
//       creator.name.toLowerCase().includes(searchTerm.toLowerCase())
//     );
//   }, [creators, searchTerm, showFavoritesOnly]);

//   const handleRefresh = useCallback(() => {
//     setRefreshing(true);
//     setCurrentPage(1);
//     setCreators([]);
//     fetchCreators(1);
//   }, [fetchCreators]);

//   const handleCreatorClick = useCallback((creator: Creator) => {
//     setSelectedCreator(creator);
//     setIsProfileViewerOpen(true);
//   }, []);

//   const handleThemeToggle = () => {
//     setIsDarkMode(!isDarkMode);
//   };

//   useEffect(() => {
//     const imageUrls = creators.slice(0, 20).map(creator => {
//       if (COOMER_SERVICES.includes(creator.service)) {
//         return `https://coomer.st/icons/${creator.service}/${creator.id}`;
//       } else {
//         return `https://kemono.su/icons/${creator.service}/${creator.id}`;
//       }
//     });

//     advancedImageCache.preloadImages(imageUrls);
//   }, [creators]);

//   return (
//     <div className={`h-screen w-screen flex flex-col ${isDarkMode ? 'dark' : ''} bg-gray-50 dark:bg-gray-900`}>
//       <header className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center gap-3">
//             <div className="flex items-center gap-2">
//               <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
//                 <Sparkles className="w-4 h-4 text-white" />
//               </div>
//               <h1 className="text-lg font-bold text-gray-900 dark:text-white">CreatorHub</h1>
//             </div>
//             <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
//               {totalCreators > 0 && `${filteredCreators.length}/${totalCreators} creators`}
//               {lastUpdated && <span className="ml-2">• Updated: {lastUpdated.toLocaleTimeString()}</span>}
//             </p>
//           </div>

//           <div className="flex items-center gap-2">
//             <div className="relative hidden sm:block">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
//               <input
//                 type="text"
//                 placeholder="Search creators..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="pl-10 pr-4 py-1.5 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-48"
//               />
//             </div>

//             <div className="flex items-center gap-1">
//               <select
//                 value={selectedService}
//                 onChange={(e) => setSelectedService(e.target.value)}
//                 className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               >
//                 {SERVICES.map((service) => (
//                   <option key={service.value} value={service.value}>
//                     {service.label}
//                   </option>
//                 ))}
//               </select>

//               <button
//                 onClick={handleRefresh}
//                 disabled={refreshing || loading}
//                 className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
//               >
//                 {refreshing || loading ? (
//                   <Loader2 className="h-4 w-4 animate-spin" />
//                 ) : (
//                   <RefreshCw className="h-4 w-4" />
//                 )}
//               </button>

//               <button
//                 onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
//                 className={`p-1.5 rounded-lg transition-colors ${
//                   showFavoritesOnly 
//                     ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400' 
//                     : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
//                 }`}
//               >
//                 <Star className="h-4 w-4" />
//               </button>

//               <button
//                 onClick={handleThemeToggle}
//                 className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
//               >
//                 {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
//               </button>
//             </div>

//             <div className="flex items-center gap-1">
//               <button
//                 onClick={() => setViewMode('compact')}
//                 className={`p-1.5 rounded-lg ${viewMode === 'compact' ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
//               >
//                 <LayoutGrid className="h-4 w-4" />
//               </button>

//               <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg px-2 py-1">
//                 <span className="text-xs text-gray-600 dark:text-gray-400 mr-1">Grid</span>
//                 <input
//                   type="range"
//                   min="3"
//                   max="8"
//                   value={gridColumns}
//                   onChange={(e) => setGridColumns(parseInt(e.target.value))}
//                   className="w-16 h-4 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
//                 />
//                 <span className="text-xs text-gray-600 dark:text-gray-400 ml-1">{gridColumns}</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </header>

//       <main className="flex-1 overflow-hidden">
//         {loading && creators.length === 0 ? (
//           <div className="flex flex-col justify-center items-center h-full">
//             <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
//             <p className="text-gray-500 dark:text-gray-400">Loading creators...</p>
//           </div>
//         ) : filteredCreators.length === 0 ? (
//           <div className="flex flex-col justify-center items-center h-full">
//             <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mb-4">
//               <Search className="h-8 w-8 text-gray-500" />
//             </div>
//             <p className="text-gray-500 dark:text-gray-400">
//               {searchTerm || showFavoritesOnly || selectedService !== 'all' ? 'No creators found matching your search or filter.' : 'No creators available.'}
//             </p>
//           </div>
//         ) : (
//           <div className="h-full overflow-y-auto">
//             <div className="p-4">
//               <div
//                 className="grid gap-2"
//                 style={{ gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))` }}
//               >
//                 {filteredCreators.map((creator) => (
//                   <CompactCreatorCard
//                     key={creator.id}
//                     creator={creator}
//                     onClick={() => handleCreatorClick(creator)}
//                   />
//                 ))}
//               </div>

//               {/* Infinite scroll trigger for creators */}
//               {hasMore && (
//                 <div ref={loadMoreRef} className="flex justify-center py-4">
//                   <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
//                 </div>
//               )}
//             </div>
//           </div>
//         )}
//       </main>

//       <CompactProfileViewer
//         creator={selectedCreator}
//         isOpen={isProfileViewerOpen}
//         onClose={() => setIsProfileViewerOpen(false)}
//       />
//     </div>
//   );
// }

// export const Route = createFileRoute('/coomerKemono')({
//   component: RouteComponent,
// });














import React, { useState, useEffect, useCallback, useMemo, useRef, Suspense } from 'react';
import axios from 'axios';
import { createStorage } from 'unstorage';
import indexedDbDriver from "unstorage/drivers/indexedb";
import { createFileRoute } from '@tanstack/react-router';
import { toast } from 'sonner';
import {
  Loader2, RefreshCw, Search, ImageOff, AlertCircle, Filter, X, Play, Pause,
  ChevronLeft, ChevronRight, Heart, Share2, Bookmark, MoreHorizontal,
  Grid3x3, Download, ZoomIn, ZoomOut, RotateCw, Shuffle, SkipForward, SkipBack,
  Eye, Settings, Sliders, MousePointer, Sun, Moon, Monitor, Smartphone, Tablet,
  Tv, Film, Power, FolderOpen, HardDrive, Package, Zap, Image as ImageIcon,
  Wifi, WifiOff, PauseCircle, PlayCircle, Maximize2, Minimize2, Volume2, VolumeX,
  Copy, Check, Info, ThumbsUp, ThumbsDown, Send, Smile, ChevronDown, ArrowUp,
  Sparkles, Flame, TrendingUp, Clock, Calendar, User, Users, Hash, AtSign,
  Camera, Layers, Aperture, Focus, Grid3X3, List, LayoutGrid, LayoutList,
  Filter as FilterIcon, SortAsc, SortDesc, DownloadCloud, Share, Link2,
  ExternalLink, HeartHandshake, Star, Award, Trophy, Crown, Gem,
  Save
} from 'lucide-react';

// --- TYPES ---
interface Creator {
  favorited: number;
  id: string;
  indexed: number;
  name: string;
  service: string;
  updated: number;
}

interface Profile {
  id: string;
  name: string;
  service: string;
  indexed: string;
  updated: string;
  public_id: string;
  relation_id: string | null;
  post_count: number;
  dm_count: number;
  share_count: number;
  chat_count: number;
}

interface Post {
  id: string;
  user: string;
  service: string;
  title: string;
  content: string;
  published: string;
  file?: {
    name: string;
    path: string;
  };
  attachments: Array<{
    name: string;
    path: string;
  }>;
}

interface CreatorApiResponse {
  message: string;
  timestamp: number;
  data: Creator[];
  pagination: {
    currentPage: number;
    itemsPerPage: number;
    totalPages: number;
    totalItems: number;
    isNextPage: boolean;
    isPrevPage: boolean;
  };
}

// --- CONFIGURATION ---
const COOMER_SERVICES = ['onlyfans', 'fansly', 'candfans'];
const KEMONO_SERVICES = ['patreon', 'fanbox', 'discord', 'fantia', 'afdian', 'boosty', 'dlsite', 'gumroad', 'subscribestar'];

const SERVICES = [
  { value: 'all', label: 'All Services' },
  { value: 'coomer', label: 'Coomer (All)' },
  ...COOMER_SERVICES.map(service => ({ value: service, label: service.charAt(0).toUpperCase() + service.slice(1) })),
  { value: 'kemono', label: 'Kemono (All)' },
  ...KEMONO_SERVICES.map(service => ({ value: service, label: service.charAt(0).toUpperCase() + service.slice(1) }))
];

// --- STORAGE & CACHE ---
const storage = createStorage({
  driver: indexedDbDriver({
    base: 'creators:',
    dbName: 'creators-db',
    storeName: 'creators-store'
  })
});

const CACHE_TIMESTAMP_KEY = 'creators:timestamp';
const CACHE_VERSION_KEY = 'creators:version';
const CACHE_VERSION = '2.0';
const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000;

// --- API SETTINGS ---
const COOMER_API_BASE_URL = 'https://kemono-api.mbaharip.com/coomer';
const KEMONO_API_BASE_URL = 'https://kemono-api.mbaharip.com/kemono';
const COOMER_POSTS_API_BASE_URL = 'https://coomer.st/api/v1';
const KEMONO_POSTS_API_BASE_URL = 'https://kemono.su/api/v1';
const ITEMS_PER_PAGE = 30;
const POSTS_PER_PAGE = 50;

// --- ELECTRON APIS ---
declare global {
  interface Window {
    require: any;
    electronAPI?: {
      showSaveDialog: (options: any) => Promise<any>;
      showOpenDialog: (options: any) => Promise<any>;
      openPath: (path: string) => Promise<void>;
      createDirectory: (path: string) => Promise<void>;
      downloadFile: (url: string, destination: string, onProgress?: (progress: number) => void) => Promise<void>;
      getAppPath: (name: string) => string;
      getPath: (name: string) => string;
    };
  }
}

// --- NETWORK STATUS HOOK ---
const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};

// --- DEBOUNCE HOOK ---
const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// --- MASONRY LAYOUT HOOK ---
const useMasonryLayout = (
  items: any[],
  columnCount: number,
  gap: number = 8
) => {
  const [layout, setLayout] = useState<{
    positions: { top: number; left: number; width: number; height: number }[];
    containerHeight: number;
  }>({ positions: [], containerHeight: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const itemHeights = useRef<number[]>([]);

  const updateLayout = useCallback(() => {
    if (!containerRef.current || items.length === 0) return;

    const containerWidth = containerRef.current.offsetWidth;
    const columnWidth = (containerWidth - gap * (columnCount - 1)) / columnCount;
    const columns = Array(columnCount).fill(0);

    const positions = items.map((_, index) => {
      const height = itemHeights.current[index] || 200; // Default height if not measured yet
      const shortestColumnIndex = columns.indexOf(Math.min(...columns));
      const top = columns[shortestColumnIndex];
      const left = shortestColumnIndex * (columnWidth + gap);

      columns[shortestColumnIndex] += height + gap;

      return {
        top,
        left,
        width: columnWidth,
        height
      };
    });

    const containerHeight = Math.max(...columns) - gap;

    setLayout({ positions, containerHeight });
  }, [items, columnCount, gap]);

  useEffect(() => {
    updateLayout();
  }, [updateLayout]);

  const measureItem = useCallback((index: number, height: number) => {
    if (itemHeights.current[index] !== height) {
      itemHeights.current[index] = height;
      updateLayout();
    }
  }, [updateLayout]);

  return { containerRef, layout, measureItem };
};

// --- ADVANCED IMAGE CACHE SYSTEM ---
class AdvancedImageCache {
  private cache = new Map<string, { url: string; timestamp: number; size: number; blob?: Blob }>();
  private loadingPromises = new Map<string, Promise<string>>();
  private maxCacheSize = 500;
  private maxCacheSizeBytes = 500 * 1024 * 1024;
  private cacheExpiry = 24 * 60 * 60 * 1000;
  private currentCacheSize = 0;
  private storageKey = 'advanced-image-cache';

  constructor() {
    this.loadCacheFromStorage();
  }

  async loadCacheFromStorage() {
    try {
      const cachedData = localStorage.getItem(this.storageKey);
      if (cachedData) {
        const parsedCache = JSON.parse(cachedData);
        this.cache = new Map(parsedCache.entries);
        this.currentCacheSize = parsedCache.size || 0;
        this.cleanupExpiredEntries();
      }
    } catch (error) {
      console.error('Failed to load cache from storage:', error);
    }
  }

  saveCacheToStorage() {
    try {
      const cacheData = {
        entries: Array.from(this.cache.entries()),
        size: this.currentCacheSize
      };
      localStorage.setItem(this.storageKey, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Failed to save cache to storage:', error);
    }
  }

  async getImage(originalUrl: string): Promise<string> {
    if (this.cache.has(originalUrl)) {
      const cached = this.cache.get(originalUrl)!;
      if (Date.now() - cached.timestamp < this.cacheExpiry) {
        // Re-create object URL if it doesn't exist
        if (!cached.url.startsWith('blob:')) {
          if (cached.blob) {
            cached.url = URL.createObjectURL(cached.blob);
          }
        }
        return cached.url;
      } else {
        this.removeFromCache(originalUrl);
      }
    }

    if (this.loadingPromises.has(originalUrl)) {
      return this.loadingPromises.get(originalUrl)!;
    }

    const loadingPromise = this.loadImage(originalUrl);
    this.loadingPromises.set(originalUrl, loadingPromise);

    try {
      const url = await loadingPromise;
      return url;
    } finally {
      this.loadingPromises.delete(originalUrl);
    }
  }

  private async loadImage(originalUrl: string): Promise<string> {
    try {
      const response = await fetch(originalUrl);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const size = blob.size;

      this.cache.set(originalUrl, { url: objectUrl, timestamp: Date.now(), size, blob });
      this.currentCacheSize += size;

      if (this.cache.size > this.maxCacheSize || this.currentCacheSize > this.maxCacheSizeBytes) {
        this.cleanupCache();
      }

      this.saveCacheToStorage();
      return objectUrl;
    } catch (error) {
      console.error('Failed to load image:', error);
      return originalUrl;
    }
  }

  private removeFromCache(url: string) {
    if (this.cache.has(url)) {
      const cached = this.cache.get(url)!;
      if (cached.url.startsWith('blob:')) {
        URL.revokeObjectURL(cached.url);
      }
      this.currentCacheSize -= cached.size;
      this.cache.delete(url);
    }
  }

  private cleanupExpiredEntries() {
    const now = Date.now();
    const expiredKeys: string[] = [];
    
    this.cache.forEach((value, key) => {
      if (now - value.timestamp > this.cacheExpiry) {
        expiredKeys.push(key);
      }
    });

    expiredKeys.forEach(key => this.removeFromCache(key));
  }

  private cleanupCache() {
    const entries = Array.from(this.cache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);

    while (
      (this.cache.size > this.maxCacheSize || this.currentCacheSize > this.maxCacheSizeBytes) &&
      entries.length > 0
    ) {
      const [url] = entries.shift()!;
      this.removeFromCache(url);
    }

    this.saveCacheToStorage();
  }

  preloadImages(urls: string[]): void {
    urls.forEach(url => {
      if (!this.cache.has(url) && !this.loadingPromises.has(url)) {
        this.getImage(url).catch(() => {});
      }
    });
  }

  clearCache() {
    this.cache.forEach((value) => {
      if (value.url.startsWith('blob:')) {
        URL.revokeObjectURL(value.url);
      }
    });
    
    this.cache.clear();
    this.currentCacheSize = 0;
    localStorage.removeItem(this.storageKey);
  }

  getCacheInfo() {
    return {
      count: this.cache.size,
      sizeBytes: this.currentCacheSize,
      sizeMB: Math.round(this.currentCacheSize / (1024 * 1024) * 100) / 100,
      maxSizeMB: Math.round(this.maxCacheSizeBytes / (1024 * 1024))
    };
  }
}

const advancedImageCache = new AdvancedImageCache();

// --- FAVORITES SYSTEM ---
class FavoritesManager {
  private storageKey = 'creator-favorites';
  private favorites: Set<string> = new Set();

  constructor() {
    this.loadFavorites();
  }

  loadFavorites() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.favorites = new Set(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load favorites:', error);
    }
  }

  saveFavorites() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(Array.from(this.favorites)));
    } catch (error) {
      console.error('Failed to save favorites:', error);
    }
  }

  addFavorite(creatorId: string) {
    this.favorites.add(creatorId);
    this.saveFavorites();
  }

  removeFavorite(creatorId: string) {
    this.favorites.delete(creatorId);
    this.saveFavorites();
  }

  isFavorite(creatorId: string): boolean {
    return this.favorites.has(creatorId);
  }

  getFavorites(): string[] {
    return Array.from(this.favorites);
  }
}

const favoritesManager = new FavoritesManager();

// --- OFFLINE SYNC SYSTEM ---
class OfflineSyncManager {
  private storageKey = 'offline-sync-data';
  private syncData: Map<string, Post[]> = new Map();
  private isSyncing = false;
  private syncProgress = 0;

  async syncCreatorPosts(creatorId: string, posts: Post[]): Promise<void> {
    this.isSyncing = true;
    this.syncProgress = 0;

    try {
      for (let i = 0; i < posts.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 100));
        this.syncProgress = Math.round((i / posts.length) * 100);
      }

      this.syncData.set(creatorId, posts);
      this.saveSyncData();
    } finally {
      this.isSyncing = false;
      this.syncProgress = 0;
    }
  }

  getSyncedPosts(creatorId: string): Post[] {
    return this.syncData.get(creatorId) || [];
  }

  isCreatorSynced(creatorId: string): boolean {
    return this.syncData.has(creatorId);
  }

  getSyncProgress(): number {
    return this.syncProgress;
  }

  isCurrentlySyncing(): boolean {
    return this.isSyncing;
  }

  private saveSyncData() {
    try {
      const data = Array.from(this.syncData.entries());
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save sync data:', error);
    }
  }

  loadSyncData() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        this.syncData = new Map(data);
      }
    } catch (error) {
      console.error('Failed to load sync data:', error);
    }
  }

  clearSyncData() {
    this.syncData.clear();
    localStorage.removeItem(this.storageKey);
  }
}

const offlineSyncManager = new OfflineSyncManager();
offlineSyncManager.loadSyncData();

// --- DOWNLOAD SERVICE ---
class DownloadService {
  private static instance: DownloadService;
  private downloads: Map<string, {
    id: string;
    post: Post;
    status: 'pending' | 'downloading' | 'completed' | 'error';
    progress: number;
    filePath?: string;
    error?: string;
  }> = new Map();

  static getInstance(): DownloadService {
    if (!DownloadService.instance) {
      DownloadService.instance = new DownloadService();
    }
    return DownloadService.instance;
  }

  async selectDownloadDirectory(): Promise<string | null> {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.showOpenDialog({
          properties: ['openDirectory'],
          title: 'Select Download Directory'
        });

        if (!result.canceled && result.filePaths.length > 0) {
          return result.filePaths[0];
        }
      } else {
        const dir = prompt('Enter download directory path:');
        return dir || null;
      }
    } catch (error) {
      console.error('Error selecting directory:', error);
      toast.error('Failed to select directory');
      return null;
    }
    return null;
  }

  async downloadFile(
    url: string,
    destination: string,
    onProgress?: (progress: number) => void,
    downloadId?: string
  ): Promise<string> {
    try {
      if (window.electronAPI) {
        await window.electronAPI.downloadFile(url, destination, onProgress);
        return destination;
      } else {
        const response = await fetch(url);
        const blob = await response.blob();

        const downloadUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = destination.split('/').pop() || 'download';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(downloadUrl);

        return destination;
      }
    } catch (error) {
      console.error('Download error:', error);
      throw error;
    }
  }

  async downloadPosts(posts: Post[], service: string): Promise<void> {
    const dir = await this.selectDownloadDirectory();
    if (!dir) return;

    posts.forEach(async (post, index) => {
      const downloadId = `download-${post.id}-${Date.now()}`;
      
      this.downloads.set(downloadId, {
        id: downloadId,
        post,
        status: 'pending',
        progress: 0
      });

      try {
        this.downloads.get(downloadId)!.status = 'downloading';
        
        const url = COOMER_SERVICES.includes(service)
          ? `https://coomer.st${post.file?.path || ''}`
          : `https://kemono.su${post.file?.path || ''}`;

        const fileName = `${post.id}.${post.file?.name?.split('.').pop() || 'jpg'}`;
        const filePath = `${dir}/${fileName}`;

        await this.downloadFile(
          url, 
          filePath, 
          (progress) => {
            this.downloads.get(downloadId)!.progress = progress;
          },
          downloadId
        );

        this.downloads.get(downloadId)!.status = 'completed';
        this.downloads.get(downloadId)!.filePath = filePath;
        
        toast.success(`Downloaded: ${fileName}`);
      } catch (error) {
        console.error('Download failed:', error);
        this.downloads.get(downloadId)!.status = 'error';
        this.downloads.get(downloadId)!.error = error instanceof Error ? error.message : 'Unknown error';
        toast.error(`Failed to download: ${post.title}`);
      }
    });
  }

  getDownloads() {
    return Array.from(this.downloads.values());
  }

  openFileLocation(filePath: string): Promise<void> {
    try {
      if (window.electronAPI) {
        return window.electronAPI.openPath(filePath);
      } else {
        window.open(`file://${filePath}`, '_blank');
        return Promise.resolve();
      }
    } catch (error) {
      console.error('Error opening file location:', error);
      toast.error('Failed to open file location');
      return Promise.reject(error);
    }
  }

  async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      if (window.electronAPI) {
        await window.electronAPI.createDirectory(dirPath);
      }
    } catch (error) {
      console.error('Error creating directory:', error);
    }
  }
}

// --- PERFORMANCE-OPTIMIZED IMAGE COMPONENT ---
const OptimizedImage = React.memo(({
  src,
  alt,
  className,
  onLoad,
  onError,
  style,
  objectFit = 'cover',
  priority = false
}: {
  src: string;
  alt: string;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
  style?: React.CSSProperties;
  objectFit?: 'cover' | 'contain' | 'fill';
  priority?: boolean;
}) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!priority && !isInView) return;

    const loadImage = async () => {
      try {
        setIsLoading(true);
        setIsError(false);

        const cachedUrl = await advancedImageCache.getImage(src);
        setImageSrc(cachedUrl);
        setIsLoading(false);
        onLoad?.();
      } catch (error) {
        console.error('Error loading image:', error);
        setImageSrc(src);
        setIsLoading(false);
        setIsError(true);
        onError?.();
      }
    };

    loadImage();
  }, [src, priority, isInView, onLoad, onError]);

  useEffect(() => {
    if (!imgRef.current || priority) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '100px' }
    );

    observer.observe(imgRef.current);

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [priority]);

  if (isError) {
    return (
      <div className={`flex items-center justify-center bg-gray-200 dark:bg-gray-800 ${className}`} style={style}>
        <ImageOff size={24} className="text-gray-500 dark:text-gray-400" />
      </div>
    );
  }

  return (
    <>
      {isLoading && (
        <div className={`absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-800 ${className}`} style={style}>
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <img
        ref={imgRef}
        src={imageSrc || src}
        alt={alt}
        className={`${className} transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        style={{ ...style, objectFit }}
        loading="lazy"
      />
    </>
  );
});

// --- COMPACT CREATOR CARD ---
const CompactCreatorCard = React.memo(({
  creator,
  onClick,
  index,
  onMeasure
}: {
  creator: Creator;
  onClick: () => void;
  index: number;
  onMeasure?: (index: number, height: number) => void;
}) => {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [likes, setLikes] = useState(creator.favorited);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsFavorited(favoritesManager.isFavorite(creator.id));
  }, [creator.id]);

  useEffect(() => {
    if (cardRef.current && onMeasure) {
      const resizeObserver = new ResizeObserver(entries => {
        for (const entry of entries) {
          onMeasure(index, entry.contentRect.height);
        }
      });
      
      resizeObserver.observe(cardRef.current);
      
      return () => {
        resizeObserver.disconnect();
      };
    }
  }, [index, onMeasure]);

  const getCreatorImageUrl = () => {
    if (COOMER_SERVICES.includes(creator.service)) {
      return `https://coomer.st/icons/${creator.service}/${creator.id}`;
    } else {
      return `https://kemono.su/icons/${creator.service}/${creator.id}`;
    }
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    setLikes(prev => isLiked ? prev - 1 : prev + 1);
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFavorited) {
      favoritesManager.removeFavorite(creator.id);
      setIsFavorited(false);
      toast('Removed from favorites');
    } else {
      favoritesManager.addFavorite(creator.id);
      setIsFavorited(true);
      toast('Added to favorites');
    }
  };

  const getServiceColor = () => {
    if (COOMER_SERVICES.includes(creator.service)) {
      return 'from-purple-500 to-pink-500';
    } else {
      return 'from-blue-500 to-cyan-500';
    }
  };

  return (
    <div
      ref={cardRef}
      className="relative overflow-hidden rounded-xl cursor-pointer group transform transition-all duration-300 hover:scale-105"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${getServiceColor()} opacity-80`} />

      <div className="aspect-square relative">
        <div className="absolute inset-0 p-2">
          {!imageError ? (
            <img
              src={getCreatorImageUrl()}
              alt={creator.name}
              className="w-full h-full object-cover rounded-lg"
              onError={() => setImageError(true)}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gray-800 rounded-lg flex items-center justify-center">
              <User size={24} className="text-gray-600" />
            </div>
          )}
        </div>

        <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-3 flex flex-col justify-between transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'
          }`}>
          <div className="flex justify-end gap-1">
            <button
              onClick={handleFavorite}
              className="p-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
            >
              <Star size={14} className={isFavorited ? 'fill-yellow-500 text-yellow-500' : ''} />
            </button>
            <button
              onClick={handleLike}
              className="p-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
            >
              <Heart size={14} className={isLiked ? 'fill-red-500 text-red-500' : ''} />
            </button>
          </div>

          <div>
            <h3 className="text-white font-bold text-sm truncate">{creator.name}</h3>
            <div className="flex items-center justify-between">
              <span className="text-white/80 text-xs">{creator.service}</span>
              <span className="text-white/80 text-xs flex items-center gap-1">
                <Heart size={10} />
                {likes}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

// --- MEDIA COMPONENT (Handles both images and videos) ---
const MediaComponent = React.memo(({
  src,
  alt,
  className,
  type,
  onLoad,
  onError,
  style,
  objectFit = 'cover',
  priority = false
}: {
  src: string;
  alt: string;
  className?: string;
  type: 'image' | 'video';
  onLoad?: () => void;
  onError?: () => void;
  style?: React.CSSProperties;
  objectFit?: 'cover' | 'contain' | 'fill';
  priority?: boolean;
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  if (type === 'video') {
    return (
      <>
        {isLoading && (
          <div className={`absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-800 ${className}`} style={style}>
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <video
          ref={videoRef}
          src={src}
          className={`${className} transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          style={{ ...style, objectFit }}
          onLoadedData={() => {
            setIsLoading(false);
            onLoad?.();
          }}
          onError={() => {
            setIsError(true);
            setIsLoading(false);
            onError?.();
          }}
          muted
          loop
          playsInline
          onMouseEnter={(e) => {
            e.currentTarget.play().catch(() => {});
          }}
          onMouseLeave={(e) => {
            e.currentTarget.pause();
          }}
        />
        {isError && (
          <div className={`absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-800 ${className}`} style={style}>
            <ImageOff size={24} className="text-gray-500 dark:text-gray-400" />
          </div>
        )}
        <div className="absolute top-2 right-2 bg-black/50 rounded-full p-1">
          <PlayCircle size={12} className="text-white" />
        </div>
      </>
    );
  }

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      className={className}
      onLoad={onLoad}
      onError={onError}
      style={style}
      objectFit={objectFit}
      priority={priority}
    />
  );
});

// --- COMPACT POST GRID ---
const CompactPostGrid = React.memo(({
  posts,
  onPostClick,
  service,
  selectedPosts,
  showSelection,
  gridColumns = 4,
  onLoadMore,
  hasMore
}: {
  posts: Post[];
  onPostClick: (post: Post, index: number) => void;
  service: string;
  selectedPosts: Set<string>;
  showSelection: boolean;
  gridColumns?: number;
  onLoadMore?: () => void;
  hasMore?: boolean;
}) => {
  const [hoveredPost, setHoveredPost] = useState<Post | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hoverPreviewEnabled, setHoverPreviewEnabled] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Infinite scroll for posts
  useEffect(() => {
    if (!loadMoreRef.current || !onLoadMore || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(loadMoreRef.current);

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [onLoadMore, hasMore]);

  // Track mouse position for hover preview
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    if (hoverPreviewEnabled) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [hoverPreviewEnabled]);

  // Preload images for better performance
  useEffect(() => {
    const imageUrls = posts.slice(0, 20).map(post => {
      if (post.file) {
        const baseUrl = COOMER_SERVICES.includes(service) ? 'https://coomer.st' : 'https://kemono.su';
        return `${baseUrl}${post.file.path}`;
      }
      if (post.attachments && post.attachments.length > 0) {
        const baseUrl = COOMER_SERVICES.includes(service) ? 'https://coomer.st' : 'https://kemono.su';
        return `${baseUrl}${post.attachments[0].path}`;
      }
      return '';
    }).filter(Boolean);

    advancedImageCache.preloadImages(imageUrls);
  }, [posts, service]);

  const getPostMedia = (post: Post) => {
    const baseUrl = COOMER_SERVICES.includes(service) ? 'https://coomer.st' : 'https://kemono.su';
    
    if (post.file) {
      return {
        url: `${baseUrl}${post.file.path}`,
        type: post.file.name?.includes('.mp4') || 
              post.file.name?.includes('.mov') || 
              post.file.name?.includes('.avi') || 
              post.file.name?.includes('.webm') ? 'video' : 'image',
        name: post.file.name
      };
    }
    
    if (post.attachments && post.attachments.length > 0) {
      return {
        url: `${baseUrl}${post.attachments[0].path}`,
        type: post.attachments[0].name?.includes('.mp4') || 
              post.attachments[0].name?.includes('.mov') || 
              post.attachments[0].name?.includes('.avi') || 
              post.attachments[0].name?.includes('.webm') ? 'video' : 'image',
        name: post.attachments[0].name
      };
    }
    
    return null;
  };

  const isVideo = (filename?: string) => {
    if (!filename) return false;
    return filename.includes('.mp4') || filename.includes('.mov') || filename.includes('.avi') || filename.includes('.webm');
  };

  return (
    <>
      <div
        className={`grid gap-1 w-full`}
        style={{ gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))` }}
      >
        {posts.map((post, index) => {
          const media = getPostMedia(post);
          const isSelected = selectedPosts.has(post.id);
          const hasMultiple = post.attachments && post.attachments.length > 0;

          return (
            <div
              key={post.id}
              className={`relative aspect-square overflow-hidden rounded-lg cursor-pointer group transform transition-all duration-300 hover:scale-105 ${showSelection && isSelected ? 'ring-2 ring-blue-500' : ''
                }`}
              onClick={() => onPostClick(post, index)}
              onMouseEnter={() => setHoveredPost(post)}
              onMouseLeave={() => setHoveredPost(null)}
            >
              {showSelection && (
                <div className="absolute top-2 left-2 z-10">
                  <div className={`w-5 h-5 rounded-full border-2 border-white flex items-center justify-center ${isSelected ? 'bg-blue-500' : 'bg-black/50'
                    }`}>
                    {isSelected && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
              )}

              {hasMultiple && (
                <div className="absolute top-2 right-2 z-10 bg-black/50 rounded-full px-1.5 py-0.5">
                  <span className="text-xs text-white">+{post.attachments.length}</span>
                </div>
              )}

              {media ? (
                <MediaComponent
                  src={media.url}
                  alt={post.title}
                  type={media.type}
                  className="w-full h-full"
                />
              ) : (
                <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                  <ImageOff size={24} className="text-gray-600" />
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-2">
                  <p className="text-white text-xs font-medium truncate">{post.title}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Infinite scroll trigger */}
      {hasMore && onLoadMore && (
        <div ref={loadMoreRef} className="flex justify-center py-4">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Hover Preview */}
      {hoverPreviewEnabled && hoveredPost && (
        <HoverPreview
          post={hoveredPost}
          enabled={hoverPreviewEnabled}
          mousePosition={mousePosition}
          service={service}
        />
      )}
    </>
  );
});

// --- HOVER PREVIEW COMPONENT ---
const HoverPreview = ({
  post,
  enabled,
  mousePosition,
  service
}: {
  post: Post;
  enabled: boolean;
  mousePosition: { x: number; y: number };
  service: string;
}) => {
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const [isVisible, setIsVisible] = useState(false);

  const getMediaUrl = (path: string, service: string) => {
    if (COOMER_SERVICES.includes(service)) {
      return `https://coomer.st${path}`;
    } else {
      return `https://kemono.su${path}`;
    }
  };

  const mediaUrl = post.file ? getMediaUrl(post.file.path, service) :
    post.attachments.length > 0 ? getMediaUrl(post.attachments[0].path, service) : null;

  useEffect(() => {
    if (!enabled || !mediaUrl) return;

    const updatePosition = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const previewWidth = Math.min(viewportWidth * 0.7, 900);
      const previewHeight = Math.min(viewportHeight * 0.8, 700);

      let left = mousePosition.x + 20;
      let top = mousePosition.y - previewHeight / 2;

      if (left + previewWidth > viewportWidth) {
        left = mousePosition.x - previewWidth - 20;
      }

      if (top < 10) {
        top = 10;
      } else if (top + previewHeight > viewportHeight - 10) {
        top = viewportHeight - previewHeight - 10;
      }

      setPosition({ top, left, width: previewWidth, height: previewHeight });
    };

    updatePosition();

    const handleResize = () => updatePosition();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, [enabled, mousePosition, mediaUrl]);

  useEffect(() => {
    if (enabled && mediaUrl) {
      const timer = setTimeout(() => setIsVisible(true), 300);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [enabled, mediaUrl]);

  if (!enabled || !isVisible || !mediaUrl) return null;

  const isVideo = post.file?.name?.includes('.mp4') || 
                 post.file?.name?.includes('.mov') || 
                 post.file?.name?.includes('.avi') || 
                 post.file?.name?.includes('.webm') ||
                 post.attachments?.[0]?.name?.includes('.mp4') ||
                 post.attachments?.[0]?.name?.includes('.mov') ||
                 post.attachments?.[0]?.name?.includes('.avi') ||
                 post.attachments?.[0]?.name?.includes('.webm');

  return (
    <div
      className="fixed z-50 bg-black rounded-lg shadow-2xl overflow-hidden border border-gray-800"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        width: `${position.width}px`,
        height: `${position.height}px`,
      }}
    >
      {isVideo ? (
        <video
          src={mediaUrl}
          className="w-full h-full"
          autoPlay
          muted
          loop
        />
      ) : (
        <OptimizedImage
          src={mediaUrl}
          alt={`Preview of ${post.id}`}
          className="w-full h-full"
          objectFit="cover"
        />
      )}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 text-white">
        <p className="text-sm font-semibold truncate">{post.title}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="flex items-center gap-1 text-xs">
            <Heart size={10} />
            {Math.floor(Math.random() * 1000) + 100}
          </span>
          <span className="flex items-center gap-1 text-xs">
            <Eye size={10} />
            {Math.floor(Math.random() * 10000) + 1000}
          </span>
        </div>
      </div>
    </div>
  );
};

// --- MOVIE MODE COMPONENT ---
const MovieMode = ({
  posts,
  onClose,
  infiniteMode,
  service
}: {
  posts: Post[];
  onClose: () => void;
  infiniteMode: boolean;
  service: string;
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getDisplayPosts = () => {
    const result = [];
    const startIndex = currentIndex * 4;

    for (let i = 0; i < 4; i++) {
      const index = (startIndex + i) % posts.length;
      result.push(posts[index]);
    }

    return result;
  };

  const displayPosts = getDisplayPosts();

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex(prev => {
          const maxIndex = Math.ceil(posts.length / 4) - 1;
          if (infiniteMode && prev >= maxIndex) {
            return 0;
          }
          return prev < maxIndex ? prev + 1 : prev;
        });
      }, 4000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPlaying, posts.length, infiniteMode]);

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  const handleStart = () => {
    setIsPlaying(true);
  };

  const handleStop = () => {
    setIsPlaying(false);
  };

  const getPostMedia = (post: Post) => {
    const baseUrl = COOMER_SERVICES.includes(service) ? 'https://coomer.st' : 'https://kemono.su';
    
    if (post.file) {
      return {
        url: `${baseUrl}${post.file.path}`,
        type: post.file.name?.includes('.mp4') || 
              post.file.name?.includes('.mov') || 
              post.file.name?.includes('.avi') || 
              post.file.name?.includes('.webm') ? 'video' : 'image'
      };
    }
    
    if (post.attachments && post.attachments.length > 0) {
      return {
        url: `${baseUrl}${post.attachments[0].path}`,
        type: post.attachments[0].name?.includes('.mp4') || 
              post.attachments[0].name?.includes('.mov') || 
              post.attachments[0].name?.includes('.avi') || 
              post.attachments[0].name?.includes('.webm') ? 'video' : 'image'
      };
    }
    
    return null;
  };

  return (
    <div
      className="fixed inset-0 bg-black z-50 flex items-center justify-center"
      onClick={onClose}
      onMouseMove={handleMouseMove}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="absolute inset-8 border-8 border-gray-700 rounded-3xl shadow-2xl">
          <div className="absolute inset-4 border-4 border-gray-600 rounded-2xl">
            <div className="absolute inset-2 bg-black rounded-xl overflow-hidden">
              <div className="grid grid-cols-2 grid-rows-2 gap-1 h-full">
                {displayPosts.map((post, index) => {
                  const media = getPostMedia(post);
                  return (
                    <div key={index} className="relative bg-gray-900 overflow-hidden">
                      {media ? (
                        media.type === 'video' ? (
                          <video
                            src={media.url}
                            className="w-full h-full object-cover"
                            autoPlay
                            muted
                            loop
                          />
                        ) : (
                          <OptimizedImage
                            src={media.url}
                            alt={`Movie mode post ${index + 1}`}
                            className="w-full h-full"
                            objectFit="cover"
                          />
                        )
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageOff size={24} className="text-gray-600" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="absolute top-12 left-1/2 transform -translate-x-1/2 text-gray-600 text-2xl font-bold">
          CREATOR TV
        </div>

        <div className="absolute bottom-12 right-12 w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center shadow-lg">
          <Power size={24} className="text-gray-500" />
        </div>
      </div>

      <div className={`absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'
        }`}>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h2 className="text-white text-xl font-bold flex items-center gap-2">
              <Tv size={24} />
              Movie Mode
            </h2>
            <div className="flex items-center gap-2">
              {!isPlaying ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStart();
                  }}
                  className="p-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors"
                >
                  <Play size={20} />
                </button>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStop();
                  }}
                  className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                >
                  <Pause size={20} />
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(Math.max(0, currentIndex - 1));
                }}
                className="p-2 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(prev => {
                    const maxIndex = Math.ceil(posts.length / 4) - 1;
                    return prev < maxIndex ? prev + 1 : prev;
                  });
                }}
                className="p-2 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-white text-sm flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={infiniteMode}
                  onChange={() => { }}
                  className="rounded"
                />
                Infinite Loop
              </label>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-2 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'
        }`}>
        <div className="max-w-4xl mx-auto">
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-1000 ease-linear"
              style={{
                width: `${((currentIndex + 1) / Math.ceil(posts.length / 4)) * 100}%`
              }}
            />
          </div>
          <p className="text-white text-sm mt-2 text-center">
            Set {currentIndex + 1} / {Math.ceil(posts.length / 4)} • {posts.length} posts
          </p>
        </div>
      </div>
    </div>
  );
};

// --- GALLERY VIEWER ---
const GalleryViewer = ({
  post,
  isOpen,
  onClose,
  onNext,
  onPrevious,
  hasNext,
  hasPrevious,
  currentIndex,
  totalCount,
  service
}: {
  post: Post | null;
  isOpen: boolean;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
  hasNext: boolean;
  hasPrevious: boolean;
  currentIndex: number;
  totalCount: number;
  service: string;
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likes, setLikes] = useState(Math.floor(Math.random() * 1000) + 100);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [copied, setCopied] = useState(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const getMediaUrl = (path: string, service: string) => {
    if (COOMER_SERVICES.includes(service)) {
      return `https://coomer.st${path}`;
    } else {
      return `https://kemono.su${path}`;
    }
  };

  const mediaItems = useMemo(() => {
    if (!post) return [];
    
    const items = [];
    
    if (post.file) {
      items.push({
        type: post.file.name?.includes('.mp4') || 
              post.file.name?.includes('.mov') || 
              post.file.name?.includes('.avi') || 
              post.file.name?.includes('.webm') ? 'video' : 'image',
        url: getMediaUrl(post.file.path, service),
        name: post.file.name
      });
    }
    
    if (post.attachments && post.attachments.length > 0) {
      post.attachments.forEach(att => {
        items.push({
          type: att.name?.includes('.mp4') || 
                att.name?.includes('.mov') || 
                att.name?.includes('.avi') || 
                att.name?.includes('.webm') ? 'video' : 'image',
          url: getMediaUrl(att.path, service),
          name: att.name
        });
      });
    }
    
    return items;
  }, [post, service]);

  const currentMedia = mediaItems[currentImageIndex];

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes(prev => isLiked ? prev - 1 : prev + 1);
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast(isBookmarked ? 'Removed from bookmarks' : 'Added to bookmarks');
  };

  const handleShare = async () => {
    if (currentMedia) {
      try {
        await navigator.clipboard.writeText(currentMedia.url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast('Link copied to clipboard');
      } catch (err) {
        console.error('Failed to copy link:', err);
      }
    }
  };

  const handleDownload = async () => {
    if (!currentMedia) return;

    const downloadService = DownloadService.getInstance();
    const dir = await downloadService.selectDownloadDirectory();
    if (!dir) return;

    const fileName = currentMedia.name || `${post?.id || 'download'}.${currentMedia.type === 'video' ? 'mp4' : 'jpg'}`;
    const filePath = `${dir}/${fileName}`;

    try {
      await downloadService.downloadFile(currentMedia.url, filePath);
      toast.success(`Downloaded: ${fileName}`);
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Download failed');
    }
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleReset = () => {
    setZoomLevel(1);
    setRotation(0);
    setDragOffset({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setDragOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleNextImage = () => {
    if (currentImageIndex < mediaItems.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const handlePreviousImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  useEffect(() => {
    if (showControls) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    } else {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    }

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [showControls]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          if (isFullscreen) {
            handleFullscreen();
          } else {
            onClose();
          }
          break;
        case 'ArrowLeft':
          if (mediaItems.length > 1) {
            handlePreviousImage();
          } else if (hasPrevious) {
            onPrevious();
          }
          break;
        case 'ArrowRight':
          if (mediaItems.length > 1) {
            handleNextImage();
          } else if (hasNext) {
            onNext();
          }
          break;
        case ' ':
          e.preventDefault();
          if (currentMedia?.type === 'video') {
            setIsPlaying(!isPlaying);
          }
          break;
        case 'f':
          handleFullscreen();
          break;
        case '+':
        case '=':
          handleZoomIn();
          break;
        case '-':
        case '_':
          handleZoomOut();
          break;
        case 'r':
          handleRotate();
          break;
        case '0':
          handleReset();
          break;
        case 'l':
          handleLike();
          break;
        case 'b':
          handleBookmark();
          break;
        case 'd':
          handleDownload();
          break;
        case 'c':
          handleShare();
          break;
        case 'i':
          setShowInfo(!showInfo);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onPrevious, onNext, hasPrevious, hasNext, isFullscreen, isPlaying, showInfo, isLiked, currentMedia, mediaItems]);

  if (!post || !currentMedia) return null;

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      <div
        ref={containerRef}
        className={`relative w-full h-full flex flex-col ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={() => setShowControls(!showControls)}
      >
        <div className={`absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/70 to-transparent p-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'
          }`}>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3 text-white">
              <span className="text-sm bg-black/50 px-2 py-1 rounded backdrop-blur-sm">
                {currentIndex + 1} / {totalCount}
              </span>
              {mediaItems.length > 1 && (
                <span className="text-sm bg-black/50 px-2 py-1 rounded backdrop-blur-sm">
                  {currentImageIndex + 1} / {mediaItems.length}
                </span>
              )}
              <span className="text-sm">{post.service}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleLike}
                className={`p-2 rounded-full transition-colors ${isLiked ? 'bg-red-500 text-white' : 'bg-black/50 text-white hover:bg-black/70'
                  }`}
              >
                <Heart size={18} fill={isLiked ? 'white' : 'none'} />
              </button>
              <button
                onClick={handleBookmark}
                className={`p-2 rounded-full transition-colors ${isBookmarked ? 'bg-blue-500 text-white' : 'bg-black/50 text-white hover:bg-black/70'
                  }`}
              >
                <Bookmark size={18} fill={isBookmarked ? 'white' : 'none'} />
              </button>
              <button
                onClick={handleShare}
                className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
              </button>
              <button
                onClick={handleDownload}
                className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
              >
                <Download size={18} />
              </button>
              <button
                onClick={() => setShowInfo(!showInfo)}
                className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
              >
                <Info size={18} />
              </button>
              <button
                onClick={handleFullscreen}
                className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
              >
                {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              </button>
              <button
                onClick={onClose}
                className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </div>

        {mediaItems.length > 1 && (
          <>
            {currentImageIndex > 0 && (
              <button
                onClick={handlePreviousImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-40 p-3 text-white bg-black/50 rounded-full hover:bg-black/70 transition-all backdrop-blur-sm hover:scale-110"
              >
                <ChevronLeft size={28} />
              </button>
            )}

            {currentImageIndex < mediaItems.length - 1 && (
              <button
                onClick={handleNextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-40 p-3 text-white bg-black/50 rounded-full hover:bg-black/70 transition-all backdrop-blur-sm hover:scale-110"
              >
                <ChevronRight size={28} />
              </button>
            )}
          </>
        )}

        <div className="flex-grow flex items-center justify-center bg-black relative overflow-hidden">
          <div
            className="relative w-full h-full flex items-center justify-center"
            style={{
              transform: `scale(${zoomLevel}) rotate(${rotation}deg) translate(${dragOffset.x}px, ${dragOffset.y}px)`,
              transition: isDragging ? 'none' : 'transform 0.3s ease'
            }}
          >
            {currentMedia.type === 'video' ? (
              <video
                src={currentMedia.url}
                className="max-w-full max-h-full object-contain"
                controls={false}
                autoPlay={isPlaying}
                loop
                muted
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <OptimizedImage
                src={currentMedia.url}
                alt={post.title}
                className="max-w-full max-h-full object-contain"
                priority={true}
              />
            )}
          </div>
        </div>

        <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'
          }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {hasPrevious && (
                <button
                  onClick={onPrevious}
                  className="p-2 text-white hover:bg-white/20 rounded-full"
                >
                  <ChevronLeft size={20} />
                </button>
              )}
              
              {currentMedia.type === 'video' && (
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-2 text-white hover:bg-white/20 rounded-full"
                >
                  {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                </button>
              )}
              
              {hasNext && (
                <button
                  onClick={onNext}
                  className="p-2 text-white hover:bg-white/20 rounded-full"
                >
                  <ChevronRight size={20} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleZoomOut}
                className="p-2 text-white hover:bg-white/20 rounded-full"
              >
                <ZoomOut size={20} />
              </button>
              <span className="text-white text-sm w-8 text-center">{Math.round(zoomLevel * 100)}%</span>
              <button
                onClick={handleZoomIn}
                className="p-2 text-white hover:bg-white/20 rounded-full"
              >
                <ZoomIn size={20} />
              </button>
              <button
                onClick={handleRotate}
                className="p-2 text-white hover:bg-white/20 rounded-full"
              >
                <RotateCw size={20} />
              </button>
              <button
                onClick={handleReset}
                className="p-2 text-white hover:bg-white/20 rounded-full"
              >
                <span className="text-xs">1:1</span>
              </button>
            </div>
          </div>

          {totalCount > 1 && (
            <div className="flex items-center justify-center mt-2 gap-1">
              {Array.from({ length: totalCount }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => { }}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${index === currentIndex ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/70'
                    }`}
                />
              ))}
            </div>
          )}
        </div>

        {showInfo && (
          <div className="absolute bottom-20 left-4 right-4 bg-black/80 backdrop-blur-md rounded-lg p-4 text-white max-w-md">
            <h3 className="font-semibold mb-3">{post.title}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Service:</span>
                <span>{post.service}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Published:</span>
                <span>{new Date(post.published).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Likes:</span>
                <span>{likes}</span>
              </div>
              {post.content && (
                <div>
                  <span className="text-gray-400">Content:</span>
                  <p className="mt-1 line-clamp-3">{post.content}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- COMPACT PROFILE VIEWER ---
const CompactProfileViewer = ({
  creator,
  isOpen,
  onClose
}: {
  creator: Creator | null;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isPostViewerOpen, setIsPostViewerOpen] = useState(false);
  const [currentPostIndex, setCurrentPostIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'slideshow'>('grid');
  const [gridColumns, setGridColumns] = useState(4);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'mostLiked'>('newest');
  const [filterType, setFilterType] = useState<'all' | 'images' | 'videos'>('all');
  const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set());
  const [showSelection, setShowSelection] = useState(false);
  const [hoverPreviewEnabled, setHoverPreviewEnabled] = useState(false);
  const [movieModeActive, setMovieModeActive] = useState(false);
  const [movieModeInfinite, setMovieModeInfinite] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMorePosts, setHasMorePosts] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followers, setFollowers] = useState(Math.floor(Math.random() * 10000) + 1000);
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(Math.floor(Math.random() * 1000) + 100);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [isSynced, setIsSynced] = useState(false);
  const [showCacheInfo, setShowCacheInfo] = useState(false);
  const [cacheInfo, setCacheInfo] = useState({ count: 0, sizeMB: 0, maxSizeMB: 500 });

  useEffect(() => {
    if (!creator) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const isCoomer = COOMER_SERVICES.includes(creator.service);

        const profileResponse = await axios.get<Profile>(
          `${COOMER_POSTS_API_BASE_URL}/${creator.service}/user/${creator.id}/profile`,
          { headers: isCoomer ? { 'Accept': 'text/css' } : {} }
        );
        setProfile(profileResponse.data);

        const syncedPosts = offlineSyncManager.getSyncedPosts(creator.id);
        if (syncedPosts.length > 0) {
          setPosts(syncedPosts);
          setIsSynced(true);
        } else {
          const postsResponse = await axios.get<Post[]>(
            `${COOMER_POSTS_API_BASE_URL}/${creator.service}/user/${creator.id}/posts?o=0`,
            { headers: isCoomer ? { 'Accept': 'text/css' } : {} }
          );

          const transformedPosts: Post[] = postsResponse.data.map((post: any) => ({
            id: post.id,
            user: post.user || creator.id,
            service: creator.service,
            title: post.title || 'Untitled',
            content: post.content || '',
            published: post.published,
            file: post.file,
            attachments: post.attachments || []
          }));

          setPosts(transformedPosts);
          setHasMorePosts(transformedPosts.length === POSTS_PER_PAGE && profileResponse.data.post_count > POSTS_PER_PAGE);
        }
      } catch (error: any) {
        console.error('Failed to fetch data:', error);
        toast.error('Failed to load creator data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [creator]);

  useEffect(() => {
    const updateCacheInfo = () => {
      setCacheInfo(advancedImageCache.getCacheInfo());
    };

    updateCacheInfo();
    const interval = setInterval(updateCacheInfo, 5000);

    return () => clearInterval(interval);
  }, []);

  const loadMorePosts = useCallback(async () => {
    if (!creator || !hasMorePosts || loadingMore) return;

    setLoadingMore(true);
    try {
      const isCoomer = COOMER_SERVICES.includes(creator.service);
      const offset = (currentPage + 1) * POSTS_PER_PAGE;

      const response = await axios.get<Post[]>(
        `${COOMER_POSTS_API_BASE_URL}/${creator.service}/user/${creator.id}/posts?o=${offset}`,
        { headers: isCoomer ? { 'Accept': 'text/css' } : {} }
      );

      const transformedPosts: Post[] = response.data.map((post: any) => ({
        id: post.id,
        user: post.user || creator.id,
        service: creator.service,
        title: post.title || 'Untitled',
        content: post.content || '',
        published: post.published,
        file: post.file,
        attachments: post.attachments || []
      }));

      setPosts(prev => [...prev, ...transformedPosts]);
      setCurrentPage(prev => prev + 1);

      if (profile) {
        setHasMorePosts((currentPage + 2) * POSTS_PER_PAGE < profile.post_count);
      }
    } catch (error: any) {
      console.error('Failed to load more posts:', error);
      toast.error('Failed to load more posts');
    } finally {
      setLoadingMore(false);
    }
  }, [creator, currentPage, hasMorePosts, loadingMore, profile]);

  const filteredPosts = useMemo(() => {
    let filtered = [...posts];

    if (filterType === 'images') {
      filtered = filtered.filter(post =>
        !post.file?.name?.includes('.mp4') &&
        !post.file?.name?.includes('.mov') &&
        !post.file?.name?.includes('.avi') &&
        !post.file?.name?.includes('.webm') &&
        !post.attachments?.some(att =>
          att.name?.includes('.mp4') ||
          att.name?.includes('.mov') ||
          att.name?.includes('.avi') ||
          att.name?.includes('.webm')
        )
      );
    } else if (filterType === 'videos') {
      filtered = filtered.filter(post =>
        post.file?.name?.includes('.mp4') ||
        post.file?.name?.includes('.mov') ||
        post.file?.name?.includes('.avi') ||
        post.file?.name?.includes('.webm') ||
        post.attachments?.some(att =>
          att.name?.includes('.mp4') ||
          att.name?.includes('.mov') ||
          att.name?.includes('.avi') ||
          att.name?.includes('.webm')
        )
      );
    }

    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.published).getTime() - new Date(a.published).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.published).getTime() - new Date(b.published).getTime());
        break;
      case 'mostLiked':
        filtered.sort(() => Math.random() - 0.5);
        break;
    }

    return filtered;
  }, [posts, filterType, sortBy]);

  const handlePostClick = useCallback((post: Post, index: number) => {
    if (showSelection) {
      const newSelectedPosts = new Set(selectedPosts);
      if (newSelectedPosts.has(post.id)) {
        newSelectedPosts.delete(post.id);
      } else {
        newSelectedPosts.add(post.id);
      }
      setSelectedPosts(newSelectedPosts);
    } else {
      setSelectedPost(post);
      setCurrentPostIndex(index);
      setIsPostViewerOpen(true);
    }
  }, [showSelection, selectedPosts]);

  const handleNextPost = useCallback(() => {
    if (currentPostIndex < filteredPosts.length - 1) {
      setCurrentPostIndex(currentPostIndex + 1);
      setSelectedPost(filteredPosts[currentPostIndex + 1]);
    }
  }, [currentPostIndex, filteredPosts]);

  const handlePreviousPost = useCallback(() => {
    if (currentPostIndex > 0) {
      setCurrentPostIndex(currentPostIndex - 1);
      setSelectedPost(filteredPosts[currentPostIndex - 1]);
    }
  }, [currentPostIndex, filteredPosts]);

  const handleSelectAll = () => {
    if (selectedPosts.size === filteredPosts.length) {
      setSelectedPosts(new Set());
    } else {
      setSelectedPosts(new Set(filteredPosts.map(post => post.id)));
    }
  };

  const handleDownloadSelected = async () => {
    const downloadService = DownloadService.getInstance();
    const selectedPostsList = filteredPosts.filter(post => selectedPosts.has(post.id));
    
    await downloadService.downloadPosts(selectedPostsList, creator?.service || '');
  };

  const handleSyncForOffline = async () => {
    if (!creator) return;
    
    setIsSyncing(true);
    setSyncProgress(0);
    
    try {
      const interval = setInterval(() => {
        setSyncProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 500);
      
      await offlineSyncManager.syncCreatorPosts(creator.id, posts);
      setIsSynced(true);
      toast('Posts synced for offline viewing');
    } catch (error) {
      console.error('Failed to sync posts:', error);
      toast.error('Failed to sync posts');
    } finally {
      setIsSyncing(false);
      setSyncProgress(0);
    }
  };

  const handleClearCache = () => {
    advancedImageCache.clearCache();
    toast('Cache cleared');
  };

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    setFollowers(prev => isFollowing ? prev - 1 : prev + 1);
    toast(isFollowing ? 'Unfollowed' : 'Following');
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes(prev => isLiked ? prev - 1 : prev + 1);
  };

  const handleMovieModeToggle = () => {
    setMovieModeActive(!movieModeActive);
  };

  if (!creator) return null;

  return (
    <>
      <div className={`fixed inset-0 z-50 ${isOpen ? 'block' : 'hidden'}`}>
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
        <div className="absolute inset-0 bg-white dark:bg-gray-900 text-white overflow-hidden flex flex-col">
          <div className="flex-shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                  <img
                    src={
                      COOMER_SERVICES.includes(creator.service)
                        ? `https://coomer.st/icons/${creator.service}/${creator.id}`
                        : `https://kemono.su/icons/${creator.service}/${creator.id}`
                    }
                    alt={creator.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{creator.name}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {creator.service} • {profile?.post_count || 0} posts
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleFollow}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${isFollowing
                      ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </button>

                <button
                  onClick={handleLike}
                  className={`p-2 rounded-full transition-colors ${isLiked
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-red-500 hover:text-white'
                    }`}
                >
                  <Heart size={16} className={isLiked ? 'fill-current' : ''} />
                </button>

                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {likes} likes • {followers} followers
                </span>

                <button
                  onClick={handleMovieModeToggle}
                  className="flex items-center gap-1 px-3 py-2 bg-purple-600 text-white text-sm rounded-full hover:bg-purple-700 transition-colors"
                >
                  <Tv size={14} />
                  Movie Mode
                </button>

                <button
                  onClick={() => setShowCacheInfo(!showCacheInfo)}
                  className="flex items-center gap-1 px-3 py-2 bg-gray-600 text-white text-sm rounded-full hover:bg-gray-700 transition-colors"
                >
                  <HardDrive size={14} />
                  Cache
                </button>

                <button
                  onClick={onClose}
                  className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          </div>

          <div className="flex-shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {showSelection && (
                  <div className="flex items-center gap-2 mr-2">
                    <button
                      onClick={handleSelectAll}
                      className="text-sm text-gray-600 dark:text-gray-400"
                    >
                      {selectedPosts.size === filteredPosts.length ? 'Deselect All' : 'Select All'}
                    </button>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedPosts.size} selected
                    </span>
                    <button
                      onClick={handleDownloadSelected}
                      disabled={selectedPosts.size === 0}
                      className="text-sm text-blue-600 dark:text-blue-400 disabled:text-gray-400"
                    >
                      Download
                    </button>
                  </div>
                )}

                <button
                  onClick={() => setShowSelection(!showSelection)}
                  className={`p-2 rounded ${showSelection ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}
                >
                  <Grid3x3 size={16} />
                </button>

                <button
                  onClick={() => setHoverPreviewEnabled(!hoverPreviewEnabled)}
                  className={`p-2 rounded ${hoverPreviewEnabled ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}
                >
                  <MousePointer size={16} />
                </button>

                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as 'all' | 'images' | 'videos')}
                  className="px-2 py-1 text-sm bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300"
                >
                  <option value="all">All</option>
                  <option value="images">Images</option>
                  <option value="videos">Videos</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'mostLiked')}
                  className="px-2 py-1 text-sm bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="mostLiked">Most Liked</option>
                </select>

                <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded px-2 py-1">
                  <span className="text-xs text-gray-600 dark:text-gray-400 mr-1">Columns</span>
                  <input
                    type="range"
                    min="2"
                    max="6"
                    value={gridColumns}
                    onChange={(e) => setGridColumns(parseInt(e.target.value))}
                    className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-xs text-gray-600 dark:text-gray-400 ml-1">{gridColumns}</span>
                </div>

                <button
                  onClick={handleSyncForOffline}
                  disabled={isSyncing || isSynced}
                  className={`flex items-center gap-1 px-3 py-1 text-sm rounded-full transition-colors ${
                    isSynced 
                      ? 'bg-green-600 text-white' 
                      : isSyncing 
                        ? 'bg-gray-400 text-white cursor-not-allowed' 
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isSyncing ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {syncProgress}%
                    </>
                  ) : isSynced ? (
                    <>
                      <Wifi size={12} />
                      Synced
                    </>
                  ) : (
                    <>
                      <WifiOff size={12} />
                      Sync Offline
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex bg-gray-100 dark:bg-gray-800 rounded">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-l ${viewMode === 'grid' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}
                  >
                    <Grid3X3 size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode('slideshow')}
                    className={`p-2 rounded-r ${viewMode === 'slideshow' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}
                  >
                    <PlayCircle size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500 dark:text-gray-400">No posts available</p>
              </div>
            ) : (
              <div className="h-full overflow-y-auto">
                {viewMode === 'grid' ? (
                  <div className="p-4">
                    <CompactPostGrid
                      posts={filteredPosts}
                      onPostClick={handlePostClick}
                      service={creator.service}
                      selectedPosts={selectedPosts}
                      showSelection={showSelection}
                      gridColumns={gridColumns}
                      onLoadMore={hasMorePosts ? loadMorePosts : undefined}
                      hasMore={hasMorePosts}
                    />
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center bg-black">
                    <div className="text-center text-white">
                      <PlayCircle className="h-16 w-16 mx-auto mb-4" />
                      <p className="text-xl">Slideshow Mode</p>
                      <p className="text-sm text-gray-400 mt-2">Feature coming soon</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {showCacheInfo && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Cache Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Cached Images:</span>
                <span className="text-gray-900 dark:text-white">{cacheInfo.count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Cache Size:</span>
                <span className="text-gray-900 dark:text-white">{cacheInfo.sizeMB} MB / {cacheInfo.maxSizeMB} MB</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full" 
                  style={{ width: `${(cacheInfo.sizeMB / cacheInfo.maxSizeMB) * 100}%` }}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={handleClearCache}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                Clear Cache
              </button>
              <button
                onClick={() => setShowCacheInfo(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {isPostViewerOpen && selectedPost && (
        <GalleryViewer
          post={selectedPost}
          isOpen={isPostViewerOpen}
          onClose={() => setIsPostViewerOpen(false)}
          onNext={handleNextPost}
          onPrevious={handlePreviousPost}
          hasNext={currentPostIndex < filteredPosts.length - 1}
          hasPrevious={currentPostIndex > 0}
          currentIndex={currentPostIndex}
          totalCount={filteredPosts.length}
          service={creator.service}
        />
      )}

      {movieModeActive && (
        <MovieMode
          posts={filteredPosts}
          onClose={() => setMovieModeActive(false)}
          infiniteMode={movieModeInfinite}
          service={creator.service}
        />
      )}
    </>
  );
};

// --- MAIN COMPONENT ---
function RouteComponent() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState('all');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCreators, setTotalCreators] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [isProfileViewerOpen, setIsProfileViewerOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [viewMode, setViewMode] = useState<'compact' | 'detailed'>('compact');
  const [gridColumns, setGridColumns] = useState(6);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [searchResults, setSearchResults] = useState<Creator[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchMode, setSearchMode] = useState(false);
  const [pageInput, setPageInput] = useState('');
  const [showPageInput, setShowPageInput] = useState(false);
  const [layoutMode, setLayoutMode] = useState<'grid' | 'masonry'>('grid');
  const loadMoreRef = useRef<HTMLDivElement>(null);
  
  const isOnline = useNetworkStatus();
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  
  const { containerRef, layout, measureItem } = useMasonryLayout(
    layoutMode === 'masonry' ? creators : [],
    gridColumns,
    8
  );

  const isCacheValid = useCallback(async () => {
    try {
      const cachedTimestamp = await storage.getItem(CACHE_TIMESTAMP_KEY) as string;
      const cacheVersion = await storage.getItem(CACHE_VERSION_KEY) as string;

      if (!cachedTimestamp || cacheVersion !== CACHE_VERSION) {
        return false;
      }

      const timestamp = new Date(cachedTimestamp);
      const now = new Date();
      return (now.getTime() - timestamp.getTime()) < CACHE_EXPIRY_MS;
    } catch (error) {
      console.error('Error checking cache validity:', error);
      return false;
    }
  }, []);

  const loadFromIndexedDB = useCallback(async (page: number = 1) => {
    try {
      const isValid = await isCacheValid();
      if (!isValid) return false;

      const cacheKey = selectedService === 'all'
        ? `creators:page:${page}`
        : `creators:${selectedService}:page:${page}`;

      const pageData = await storage.getItem(cacheKey) as Creator[];
      const cachedTimestamp = await storage.getItem(CACHE_TIMESTAMP_KEY) as string;

      if (pageData && pageData.length > 0) {
        setCreators(prev => page === 1 ? pageData : [...prev, ...pageData]);
        setLastUpdated(new Date(cachedTimestamp));
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error loading from IndexedDB:', error);
      return false;
    }
  }, [isCacheValid, selectedService]);

  const fetchCreators = useCallback(async (page: number = 1) => {
    try {
      setApiError(null);

      if (page === 1) {
        const cacheLoaded = await loadFromIndexedDB(page);
        if (cacheLoaded) {
          setLoading(false);
          return;
        }
      }

      if (page === 1) {
        setLoading(true);
      }

      let apiUrl: string;

      if (selectedService === 'all') {
        const [coomerResponse, kemonoResponse] = await Promise.all([
          axios.get<CreatorApiResponse>(`${COOMER_API_BASE_URL}?page=${page}&itemsPerPage=${Math.ceil(ITEMS_PER_PAGE / 2)}`),
          axios.get<CreatorApiResponse>(`${KEMONO_API_BASE_URL}?page=${page}&itemsPerPage=${Math.ceil(ITEMS_PER_PAGE / 2)}`)
        ]);

        const combinedData = [...coomerResponse.data.data, ...kemonoResponse.data.data];
        const combinedPagination = {
          totalPages: Math.max(coomerResponse.data.pagination.totalPages, kemonoResponse.data.pagination.totalPages),
          totalItems: coomerResponse.data.pagination.totalItems + kemonoResponse.data.pagination.totalItems,
          isNextPage: coomerResponse.data.pagination.isNextPage || kemonoResponse.data.pagination.isNextPage,
        };

        setTotalPages(combinedPagination.totalPages);
        setTotalCreators(combinedPagination.totalItems);
        setHasMore(combinedPagination.isNextPage);

        await storage.setItem(`creators:page:${page}`, combinedData);
        setCreators(prev => page === 1 ? combinedData : [...prev, ...combinedData]);

        if (page === 1) {
          await storage.setItem(CACHE_TIMESTAMP_KEY, new Date().toISOString());
          await storage.setItem(CACHE_VERSION_KEY, CACHE_VERSION);
        }
      } else if (selectedService === 'coomer' || selectedService === 'kemono') {
        apiUrl = selectedService === 'coomer' ? COOMER_API_BASE_URL : KEMONO_API_BASE_URL;

        const response = await axios.get<CreatorApiResponse>(`${apiUrl}?page=${page}&itemsPerPage=${ITEMS_PER_PAGE}`);
        const { data, pagination } = response.data;

        setTotalPages(pagination.totalPages);
        setTotalCreators(pagination.totalItems);
        setHasMore(pagination.isNextPage);

        await storage.setItem(`creators:${selectedService}:page:${page}`, data);
        setCreators(prev => page === 1 ? data : [...prev, ...data]);

        if (page === 1) {
          await storage.setItem(CACHE_TIMESTAMP_KEY, new Date().toISOString());
          await storage.setItem(CACHE_VERSION_KEY, CACHE_VERSION);
        }
      } else {
        const isCoomer = COOMER_SERVICES.includes(selectedService);
        apiUrl = isCoomer ? COOMER_API_BASE_URL : KEMONO_API_BASE_URL;

        const response = await axios.get<CreatorApiResponse>(`${apiUrl}/${selectedService}?page=${page}&itemsPerPage=${ITEMS_PER_PAGE}`);
        const { data, pagination } = response.data;

        setTotalPages(pagination.totalPages);
        setTotalCreators(pagination.totalItems);
        setHasMore(pagination.isNextPage);

        await storage.setItem(`creators:${selectedService}:page:${page}`, data);
        setCreators(prev => page === 1 ? data : [...prev, ...data]);

        if (page === 1) {
          await storage.setItem(CACHE_TIMESTAMP_KEY, new Date().toISOString());
          await storage.setItem(CACHE_VERSION_KEY, CACHE_VERSION);
        }
      }

      setLastUpdated(new Date());
      if (page === 1) {
        toast.success('Successfully loaded creators');
      }
    } catch (error: any) {
      console.error('Fetch failed:', error);
      setApiError('Failed to fetch creators data');
      toast.error('Failed to fetch creators');

      if (page === 1) {
        await loadFromIndexedDB(page);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [loadFromIndexedDB, selectedService]);

  const searchCreators = useCallback(async (term: string) => {
    if (!term.trim()) {
      setSearchMode(false);
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setSearchMode(true);

    try {
      // Try to search from cached data first if offline
      if (!isOnline) {
        const cachedResults = creators.filter(creator =>
          creator.name.toLowerCase().includes(term.toLowerCase())
        );
        setSearchResults(cachedResults);
        setIsSearching(false);
        return;
      }

      // Search from API
      let apiUrl: string;
      
      if (selectedService === 'all') {
        const [coomerResponse, kemonoResponse] = await Promise.all([
          axios.get<CreatorApiResponse>(`${COOMER_API_BASE_URL}?search=${encodeURIComponent(term)}`),
          axios.get<CreatorApiResponse>(`${KEMONO_API_BASE_URL}?search=${encodeURIComponent(term)}`)
        ]);
        
        const combinedData = [...coomerResponse.data.data, ...kemonoResponse.data.data];
        setSearchResults(combinedData);
      } else if (selectedService === 'coomer' || selectedService === 'kemono') {
        apiUrl = selectedService === 'coomer' ? COOMER_API_BASE_URL : KEMONO_API_BASE_URL;
        const response = await axios.get<CreatorApiResponse>(`${apiUrl}?search=${encodeURIComponent(term)}`);
        setSearchResults(response.data.data);
      } else {
        const isCoomer = COOMER_SERVICES.includes(selectedService);
        apiUrl = isCoomer ? COOMER_API_BASE_URL : KEMONO_API_BASE_URL;
        const response = await axios.get<CreatorApiResponse>(`${apiUrl}/${selectedService}?search=${encodeURIComponent(term)}`);
        setSearchResults(response.data.data);
      }
    } catch (error) {
      console.error('Search failed:', error);
      toast.error('Search failed. Showing cached results if available.');
      
      // Fallback to cached results
      const cachedResults = creators.filter(creator =>
        creator.name.toLowerCase().includes(term.toLowerCase())
      );
      setSearchResults(cachedResults);
    } finally {
      setIsSearching(false);
    }
  }, [selectedService, isOnline, creators]);

  const loadMoreCreators = useCallback(() => {
    if (!hasMore || loading) return;
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchCreators(nextPage);
  }, [currentPage, hasMore, loading, fetchCreators]);

  // Infinite scroll for creators
  useEffect(() => {
    if (!loadMoreRef.current || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreCreators();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(loadMoreRef.current);

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [hasMore, loadMoreCreators]);

  // Search when debounced search term changes
  useEffect(() => {
    searchCreators(debouncedSearchTerm);
  }, [debouncedSearchTerm, searchCreators]);

  useEffect(() => {
    setCurrentPage(1);
    setCreators([]);
    fetchCreators(1);
  }, [selectedService]);

  const filteredCreators = useMemo(() => {
    let filtered = searchMode ? searchResults : creators;
    
    if (showFavoritesOnly) {
      const favoriteIds = favoritesManager.getFavorites();
      filtered = filtered.filter(creator => favoriteIds.includes(creator.id));
    }
    
    return filtered;
  }, [creators, searchResults, searchMode, showFavoritesOnly]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setCurrentPage(1);
    setCreators([]);
    fetchCreators(1);
  }, [fetchCreators]);

  const handleCreatorClick = useCallback((creator: Creator) => {
    setSelectedCreator(creator);
    setIsProfileViewerOpen(true);
  }, []);

  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handlePageJump = () => {
    const page = parseInt(pageInput);
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setCreators([]);
      fetchCreators(page);
      setShowPageInput(false);
      setPageInput('');
    } else {
      toast.error('Invalid page number');
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      const prevPage = currentPage - 1;
      setCurrentPage(prevPage);
      setCreators([]);
      fetchCreators(prevPage);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      setCreators([]);
      fetchCreators(nextPage);
    }
  };

  useEffect(() => {
    const imageUrls = creators.slice(0, 20).map(creator => {
      if (COOMER_SERVICES.includes(creator.service)) {
        return `https://coomer.st/icons/${creator.service}/${creator.id}`;
      } else {
        return `https://kemono.su/icons/${creator.service}/${creator.id}`;
      }
    });

    advancedImageCache.preloadImages(imageUrls);
  }, [creators]);

  return (
    <div className={`h-screen w-screen flex flex-col ${isDarkMode ? 'dark' : ''} bg-gray-50 dark:bg-gray-900`}>
      <header className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">CreatorHub</h1>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
              {totalCreators > 0 && `${filteredCreators.length}/${totalCreators} creators`}
              {lastUpdated && <span className="ml-2">• Updated: {lastUpdated.toLocaleTimeString()}</span>}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search creators..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-1.5 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-48"
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                </div>
              )}
            </div>

            <div className="flex items-center gap-1">
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {SERVICES.map((service) => (
                  <option key={service.value} value={service.value}>
                    {service.label}
                  </option>
                ))}
              </select>

              <button
                onClick={handleRefresh}
                disabled={refreshing || loading}
                className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {refreshing || loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </button>

              <button
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={`p-1.5 rounded-lg transition-colors ${
                  showFavoritesOnly 
                    ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Star className="h-4 w-4" />
              </button>

              <button
                onClick={handleThemeToggle}
                className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setViewMode('compact')}
                className={`p-1.5 rounded-lg ${viewMode === 'compact' ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>

              <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg px-2 py-1">
                <span className="text-xs text-gray-600 dark:text-gray-400 mr-1">Grid</span>
                <input
                  type="range"
                  min="3"
                  max="8"
                  value={gridColumns}
                  onChange={(e) => setGridColumns(parseInt(e.target.value))}
                  className="w-16 h-4 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-xs text-gray-600 dark:text-gray-400 ml-1">{gridColumns}</span>
              </div>

              <button
                onClick={() => setLayoutMode(layoutMode === 'grid' ? 'masonry' : 'grid')}
                className={`p-1.5 rounded-lg ${layoutMode === 'masonry' ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
              >
                {layoutMode === 'masonry' ? <Layers className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        {loading && creators.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-full">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Loading creators...</p>
          </div>
        ) : filteredCreators.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-full">
            <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-gray-500" />
            </div>
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm || showFavoritesOnly || selectedService !== 'all' ? 'No creators found matching your search or filter.' : 'No creators available.'}
            </p>
          </div>
        ) : (
          <div className="h-full overflow-y-auto">
            <div className="p-4">
              {layoutMode === 'grid' ? (
                <div
                  className="grid gap-2"
                  style={{ gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))` }}
                >
                  {filteredCreators.map((creator, index) => (
                    <CompactCreatorCard
                      key={creator.id}
                      creator={creator}
                      onClick={() => handleCreatorClick(creator)}
                      index={index}
                    />
                  ))}
                </div>
              ) : (
                <div ref={containerRef} className="relative" style={{ height: `${layout.containerHeight}px` }}>
                  {filteredCreators.map((creator, index) => {
                    const position = layout.positions[index];
                    return (
                      <div
                        key={creator.id}
                        className="absolute"
                        style={{
                          top: `${position.top}px`,
                          left: `${position.left}px`,
                          width: `${position.width}px`,
                          height: `${position.height}px`,
                        }}
                      >
                        <CompactCreatorCard
                          creator={creator}
                          onClick={() => handleCreatorClick(creator)}
                          index={index}
                          onMeasure={measureItem}
                        />
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Infinite scroll trigger for creators */}
              {hasMore && (
                <div ref={loadMoreRef} className="flex justify-center py-4">
                  <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 flex items-center gap-2">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className="p-1 rounded text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} />
          </button>
          
          <button
            onClick={() => setShowPageInput(true)}
            className="px-2 py-1 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            {currentPage} / {totalPages}
          </button>
          
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="p-1 rounded text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Page Input Modal */}
      {showPageInput && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Go to Page</h3>
            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                max={totalPages}
                value={pageInput}
                onChange={(e) => setPageInput(e.target.value)}
                className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={`1-${totalPages}`}
                autoFocus
              />
              <button
                onClick={handlePageJump}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Go
              </button>
              <button
                onClick={() => {
                  setShowPageInput(false);
                  setPageInput('');
                }}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Offline Status Indicator */}
      {!isOnline && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-40">
          <WifiOff size={16} />
          <span className="text-sm">You're offline. Showing cached content.</span>
        </div>
      )}

      <CompactProfileViewer
        creator={selectedCreator}
        isOpen={isProfileViewerOpen}
        onClose={() => setIsProfileViewerOpen(false)}
      />
    </div>
  );
}

export const Route = createFileRoute('/coomerKemono')({
  component: RouteComponent,
});