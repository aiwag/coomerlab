
// import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
// import axios from 'axios';
// import { createStorage } from 'unstorage';
// import indexedDbDriver from "unstorage/drivers/indexedb";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Badge } from '@/components/ui/badge';
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// import { 
//   Loader2, RefreshCw, Search, ExternalLink, ImageOff, AlertCircle, Filter, X, Play, Pause, 
//   ChevronLeft, ChevronRight, Heart, MessageCircle, Share2, Grid3x3, Bookmark, 
//   MoreHorizontal, Send, Smile, ChevronDown, ArrowUp, Maximize2, Minimize2, Volume2, VolumeX,
//   Settings, Download, ZoomIn, ZoomOut, RotateCw, Shuffle, SkipForward, SkipBack, Eye,
//   ThumbsUp, ThumbsDown, Copy, Check, Info, Wifi, WifiOff, PauseCircle, PlayCircle,
//   Tv, Film, Power, FolderOpen, HardDrive, Package, Sliders, Key, Sun, Moon,
//   Grid, List, MousePointer, Monitor, Smartphone, Tablet, Zap, Image as ImageIcon,
//   Save,
//   Loader,
//   CheckCircle
// } from 'lucide-react';
// import { toast } from 'sonner';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Drawer,
//   DrawerClose,
//   DrawerContent,
//   DrawerDescription,
//   DrawerFooter,
//   DrawerHeader,
//   DrawerTitle,
//   DrawerTrigger,
// } from "@/components/ui/drawer";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Textarea } from '@/components/ui/textarea';
// import InfiniteScroll from 'react-infinite-scroll-component';
// import {
//   Slider
// } from "@/components/ui/slider";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipProvider,
//   TooltipTrigger,
// } from "@/components/ui/tooltip";
// import { Switch } from "@/components/ui/switch";
// import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
// import { createFileRoute } from '@tanstack/react-router';

// // Define the creator type based on the API schema
// interface Creator {
//   favorited: number;
//   id: string;
//   indexed: number;
//   name: string;
//   service: string;
//   updated: number;
// }

// // Define the profile type
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

// // Define the post type based on the API response
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

// // Define the API response type for creators
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

// // Service configurations
// const COOMER_SERVICES = ['onlyfans', 'fansly', 'candfans'];
// const KEMONO_SERVICES = ['patreon', 'fanbox', 'discord', 'fantia', 'afdian', 'boosty', 'dlsite', 'gumroad', 'subscribestar'];

// const SERVICES = [
//   { value: 'all', label: 'All Services' },
//   { value: 'coomer', label: 'Coomer (All)' },
//   ...COOMER_SERVICES.map(service => ({ value: service, label: service.charAt(0).toUpperCase() + service.slice(1) })),
//   { value: 'kemono', label: 'Kemono (All)' },
//   ...KEMONO_SERVICES.map(service => ({ value: service, label: service.charAt(0).toUpperCase() + service.slice(1) }))
// ];

// // Initialize unstorage with IndexedDB driver
// const storage = createStorage({
//   driver: indexedDbDriver({ 
//     base: 'creators:',
//     dbName: 'creators-db',
//     storeName: 'creators-store'
//   })
// });

// // Cache keys
// const CACHE_TIMESTAMP_KEY = 'creators:timestamp';
// const CACHE_VERSION_KEY = 'creators:version';
// const CACHE_VERSION = '1.0';
// const CACHE_EXPIRY_MS = 12 * 60 * 60 * 1000; // 12 hours

// // API settings
// const COOMER_API_BASE_URL = 'https://kemono-api.mbaharip.com/coomer';
// const KEMONO_API_BASE_URL = 'https://kemono-api.mbaharip.com/kemono';
// const COOMER_POSTS_API_BASE_URL = 'https://coomer.st/api/v1';
// const KEMONO_POSTS_API_BASE_URL = 'https://kemono.su/api/v1';
// const ITEMS_PER_PAGE = 30;
// const POSTS_PER_PAGE = 20;

// // Electron APIs
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

// // Download Service for Electron
// class DownloadService {
//   private static instance: DownloadService;
  
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
//         // Fallback for web environment
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
//     onProgress?: (progress: number) => void
//   ): Promise<string> {
//     try {
//       if (window.electronAPI) {
//         // Use Electron's native download
//         await window.electronAPI.downloadFile(url, destination, onProgress);
//         return destination;
//       } else {
//         // Fallback for web environment
//         const response = await fetch(url);
//         const blob = await response.blob();
        
//         // Create a temporary link to trigger download
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

//   async openFileLocation(filePath: string): Promise<void> {
//     try {
//       if (window.electronAPI) {
//         await window.electronAPI.openPath(filePath);
//       } else {
//         // Fallback for web environment
//         window.open(`file://${filePath}`, '_blank');
//       }
//     } catch (error) {
//       console.error('Error opening file location:', error);
//       toast.error('Failed to open file location');
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

// // Image Cache Component with Performance Optimizations
// const ImageWithCache = React.memo(({ 
//   src, 
//   alt, 
//   className, 
//   onLoad, 
//   onError,
//   style,
//   objectFit = 'cover'
// }: { 
//   src: string; 
//   alt: string; 
//   className?: string; 
//   onLoad?: () => void; 
//   onError?: () => void;
//   style?: React.CSSProperties;
//   objectFit?: 'cover' | 'contain' | 'fill';
// }) => {
//   const [imageSrc, setImageSrc] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isError, setIsError] = useState(false);
//   const imageRef = useRef<HTMLImageElement>(null);

//   useEffect(() => {
//     setIsLoading(true);
//     setIsError(false);
    
//     const loadImage = async () => {
//       try {
//         // For this example, we'll just use the original URL
//         // In a real app, you would implement caching here
//         setImageSrc(src);
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
    
//     // Cleanup function
//     return () => {
//       if (imageSrc && imageSrc.startsWith('blob:')) {
//         URL.revokeObjectURL(imageSrc);
//       }
//     };
//   }, [src, onLoad, onError]);

//   // Intersection Observer for lazy loading
//   useEffect(() => {
//     if (!imageRef.current) return;
    
//     const observer = new IntersectionObserver(
//       (entries) => {
//         entries.forEach((entry) => {
//           if (entry.isIntersecting) {
//             // Image is in viewport, load it
//             const img = entry.target as HTMLImageElement;
//             if (img.dataset.src) {
//               img.src = img.dataset.src;
//               img.removeAttribute('data-src');
//             }
//           }
//         });
//       },
//       { rootMargin: '50px' } // Start loading 50px before it comes into view
//     );
    
//     observer.observe(imageRef.current);
    
//     return () => {
//       if (imageRef.current) {
//         observer.unobserve(imageRef.current);
//       }
//     };
//   }, []);

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
//         ref={imageRef}
//         data-src={imageSrc || src}
//         src={imageSrc || src}
//         alt={alt}
//         className={`${className} transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
//         style={{ ...style, objectFit }}
//         loading="lazy"
//       />
//     </>
//   );
// });

// // Hover Preview Component with Zoom/Crop
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
//   const previewRef = useRef<HTMLDivElement>(null);
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
//     if (!enabled || !previewRef.current || !mediaUrl) return;

//     const updatePosition = () => {
//       const viewportWidth = window.innerWidth;
//       const viewportHeight = window.innerHeight;
//       const previewWidth = Math.min(viewportWidth * 0.7, 900);
//       const previewHeight = Math.min(viewportHeight * 0.8, 700);
      
//       // Calculate position to keep preview in viewport
//       let left = mousePosition.x + 20;
//       let top = mousePosition.y - previewHeight / 2;
      
//       // Adjust if preview would go outside viewport
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
//       ref={previewRef}
//       className="fixed z-50 bg-black rounded-lg shadow-2xl overflow-hidden border border-gray-800"
//       style={{
//         top: `${position.top}px`,
//         left: `${position.left}px`,
//         width: `${position.width}px`,
//         height: `${position.height}px`,
//       }}
//     >
//       <ImageWithCache
//         src={mediaUrl}
//         alt={`Preview of ${post.id}`}
//         className="w-full h-full"
//         objectFit="cover" // Always use cover to fill the preview space
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

// // Masonry Grid Component for Gapless Layout
// const MasonryGrid = React.memo(({ 
//   posts, 
//   onPostClick, 
//   gridScale, 
//   onHover, 
//   hoverPreviewEnabled,
//   service,
//   selectedPosts,
//   showSelection
// }: {
//   posts: Post[];
//   onPostClick: (post: Post) => void;
//   gridScale: number;
//   onHover: (post: Post | null) => void;
//   hoverPreviewEnabled: boolean;
//   service: string;
//   selectedPosts: Set<string>;
//   showSelection: boolean;
// }) => {
//   const containerRef = useRef<HTMLDivElement>(null);
//   const [columns, setColumns] = useState(4);
//   const [columnWidth, setColumnWidth] = useState(0);
//   const [gridItems, setGridItems] = useState<Array<{ post: Post; index: number; height: number; top: number; left: number }>>([]);

//   // Calculate responsive columns
//   useEffect(() => {
//     const calculateColumns = () => {
//       if (!containerRef.current) return;
      
//       const containerWidth = containerRef.current.offsetWidth;
//       const minColumnWidth = 200 * gridScale;
//       const maxColumns = Math.floor(containerWidth / minColumnWidth);
//       const newColumns = Math.max(2, Math.min(maxColumns, 8));
      
//       setColumns(newColumns);
//       setColumnWidth((containerWidth - (newColumns - 1) * 2) / newColumns); // 2px gap between columns
//     };

//     calculateColumns();
    
//     const handleResize = () => calculateColumns();
//     window.addEventListener('resize', handleResize);
    
//     return () => window.removeEventListener('resize', handleResize);
//   }, [gridScale]);

//   // Calculate masonry layout
//   useEffect(() => {
//     if (!columnWidth || posts.length === 0) return;
    
//     const columnHeights = new Array(columns).fill(0);
//     const items = posts.map((post, index) => {
//       // For this example, we'll use a fixed aspect ratio
//       // In a real app, you would calculate this based on the actual image dimensions
//       const aspectRatio = 1.5; // 3:2 aspect ratio
//       const height = columnWidth / aspectRatio;
      
//       // Find the shortest column
//       let shortestColumnIndex = 0;
//       let shortestHeight = columnHeights[0];
      
//       for (let i = 1; i < columns; i++) {
//         if (columnHeights[i] < shortestHeight) {
//           shortestColumnIndex = i;
//           shortestHeight = columnHeights[i];
//         }
//       }
      
//       // Position the item
//       const top = shortestHeight;
//       const left = shortestColumnIndex * (columnWidth + 2); // 2px gap between columns
      
//       // Update column height
//       columnHeights[shortestColumnIndex] += height + 2; // 2px gap between rows
      
//       return {
//         post,
//         index,
//         height,
//         top,
//         left
//       };
//     });
    
//     setGridItems(items);
//   }, [posts, columns, columnWidth]);

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
//     <div 
//       ref={containerRef} 
//       className="relative w-full"
//       style={{ height: `${Math.max(...gridItems.map(item => item.top + item.height))}px` }}
//     >
//       {gridItems.map((item) => (
//         <MasonryGridItem
//           key={`${item.post.id}-${item.index}`}
//           post={item.post}
//           index={item.index}
//           width={columnWidth}
//           height={item.height}
//           top={item.top}
//           left={item.left}
//           onClick={() => onPostClick(item.post)}
//           onHover={onHover}
//           hoverPreviewEnabled={hoverPreviewEnabled}
//           service={service}
//           isSelected={selectedPosts.has(item.post.id)}
//           showSelection={showSelection}
//         />
//       ))}
//     </div>
//   );
// });

// // Individual Masonry Grid Item
// const MasonryGridItem = React.memo(({ 
//   post, 
//   index, 
//   width, 
//   height, 
//   top, 
//   left, 
//   onClick, 
//   onHover, 
//   hoverPreviewEnabled,
//   service,
//   isSelected,
//   showSelection
// }: {
//   post: Post;
//   index: number;
//   width: number;
//   height: number;
//   top: number;
//   left: number;
//   onClick: () => void;
//   onHover: (post: Post | null) => void;
//   hoverPreviewEnabled: boolean;
//   service: string;
//   isSelected: boolean;
//   showSelection: boolean;
// }) => {
//   const [isHovered, setIsHovered] = useState(false);
//   const [isLiked, setIsLiked] = useState(false);
//   const [isBookmarked, setIsBookmarked] = useState(false);

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

//   const handleLike = (e: React.MouseEvent) => {
//     e.stopPropagation();
//     setIsLiked(!isLiked);
//   };

//   const handleBookmark = (e: React.MouseEvent) => {
//     e.stopPropagation();
//     setIsBookmarked(!isBookmarked);
//   };

//   const handleDownload = (e: React.MouseEvent) => {
//     e.stopPropagation();
//     // In a real app, this would trigger a download
//     toast('Download started');
//   };

//   const handleMouseEnter = () => {
//     setIsHovered(true);
//     if (hoverPreviewEnabled) {
//       onHover(post);
//     }
//   };

//   const handleMouseLeave = () => {
//     setIsHovered(false);
//     if (hoverPreviewEnabled) {
//       onHover(null);
//     }
//   };

//   const imageUrl = getPostImageUrl(post);

//   return (
//     <div
//       className={`absolute bg-gray-200 dark:bg-gray-800 overflow-hidden cursor-pointer group ${
//         showSelection && isSelected ? 'ring-2 ring-blue-500' : ''
//       }`}
//       style={{
//         width: `${width}px`,
//         height: `${height}px`,
//         top: `${top}px`,
//         left: `${left}px`,
//       }}
//       onClick={onClick}
//       onMouseEnter={handleMouseEnter}
//       onMouseLeave={handleMouseLeave}
//     >
//       {/* Selection Checkbox */}
//       {showSelection && (
//         <div className="absolute top-1 left-1 z-10">
//           <div className={`w-5 h-5 rounded-full border-2 border-white flex items-center justify-center ${
//             isSelected ? 'bg-blue-500' : 'bg-black/50'
//           }`}>
//             {isSelected && (
//               <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
//                 <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
//               </svg>
//             )}
//           </div>
//         </div>
//       )}
      
//       {/* Video Indicator */}
//       {isVideo(post.file?.name || post.attachments?.[0]?.name) && (
//         <div className="absolute top-1 right-1 z-10 bg-black/50 rounded-full p-1">
//           <PlayCircle size={12} className="text-white" />
//         </div>
//       )}
      
//       {/* Multiple Attachments Indicator */}
//       {post.attachments && post.attachments.length > 0 && (
//         <div className="absolute top-1 right-1 z-10 bg-black/50 rounded-full px-2 py-0.5">
//           <span className="text-xs text-white">+{post.attachments.length}</span>
//         </div>
//       )}
      
//       {imageUrl ? (
//         <ImageWithCache
//           src={imageUrl}
//           alt={`Post ${post.id}`}
//           className="w-full h-full transition-transform duration-300 ease-out group-hover:scale-105"
//           objectFit="cover"
//         />
//       ) : (
//         <div className="w-full h-full flex items-center justify-center bg-gray-300 dark:bg-gray-700">
//           <ImageOff size={24} className="text-gray-500 dark:text-gray-400" />
//         </div>
//       )}

//       {/* Hover Overlay */}
//       <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300 ${
//         isHovered ? 'opacity-100' : 'opacity-0'
//       }`} />

//       {/* Quick Actions */}
//       <div className={`absolute bottom-0 left-0 right-0 p-2 text-white transition-transform duration-300 ${
//         isHovered ? 'translate-y-0' : 'translate-y-full'
//       }`}>
//         <div className="flex justify-between items-center">
//           <div className="text-xs">
//             <p className="font-semibold truncate">{post.title}</p>
//             <div className="flex items-center gap-2 mt-1">
//               <span className="flex items-center gap-1">
//                 <Heart size={10} />
//                 {Math.floor(Math.random() * 1000) + 100}
//               </span>
//               <span className="flex items-center gap-1">
//                 <Eye size={10} />
//                 {Math.floor(Math.random() * 10000) + 1000}
//               </span>
//             </div>
//           </div>
//           <div className="flex gap-1">
//             <button
//               onClick={handleLike}
//               className={`p-1 rounded-full transition-colors ${
//                 isLiked ? 'bg-red-500 text-white' : 'bg-black/50 text-white hover:bg-black/70'
//               }`}
//             >
//               <Heart size={12} fill={isLiked ? 'white' : 'none'} />
//             </button>
//             <button
//               onClick={handleBookmark}
//               className={`p-1 rounded-full transition-colors ${
//                 isBookmarked ? 'bg-blue-500 text-white' : 'bg-black/50 text-white hover:bg-black/70'
//               }`}
//             >
//               <Bookmark size={12} fill={isBookmarked ? 'white' : 'none'} />
//             </button>
//             <button
//               onClick={handleDownload}
//               className="p-1 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
//             >
//               <Download size={12} />
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// });

// // Movie Mode Component with TV Interface
// const MovieMode = ({
//   posts,
//   onClose,
//   keywords,
//   infiniteMode,
//   onKeywordChange,
//   service
// }: {
//   posts: Post[];
//   onClose: () => void;
//   keywords: {
//     topLeft: string;
//     topRight: string;
//     bottomLeft: string;
//     bottomRight: string;
//   };
//   infiniteMode: boolean;
//   onKeywordChange: (position: keyof typeof keywords, value: string) => void;
//   service: string;
// }) => {
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [keywordInputs, setKeywordInputs] = useState(keywords);
//   const [showControls, setShowControls] = useState(true);
//   const intervalRef = useRef<NodeJS.Timeout | null>(null);
//   const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

//   // Filter posts based on keywords
//   const filteredPosts = useMemo(() => {
//     if (!keywords.topLeft && !keywords.topRight && !keywords.bottomLeft && !keywords.bottomRight) {
//       return posts;
//     }

//     return posts.filter(post => {
//       const title = post.title.toLowerCase();
//       const content = post.content.toLowerCase();
//       const allText = `${title} ${content}`;

//       return (
//         (keywords.topLeft && allText.includes(keywords.topLeft.toLowerCase())) ||
//         (keywords.topRight && allText.includes(keywords.topRight.toLowerCase())) ||
//         (keywords.bottomLeft && allText.includes(keywords.bottomLeft.toLowerCase())) ||
//         (keywords.bottomRight && allText.includes(keywords.bottomRight.toLowerCase()))
//       );
//     });
//   }, [posts, keywords]);

//   // Get 4 posts for current display
//   const getDisplayPosts = () => {
//     const result = [];
//     const startIndex = currentIndex * 4;
    
//     for (let i = 0; i < 4; i++) {
//       const index = (startIndex + i) % filteredPosts.length;
//       result.push(filteredPosts[index]);
//     }
    
//     return result;
//   };

//   const displayPosts = getDisplayPosts();

//   // Auto-advance slideshow
//   useEffect(() => {
//     if (isPlaying) {
//       intervalRef.current = setInterval(() => {
//         setCurrentIndex(prev => {
//           const maxIndex = Math.ceil(filteredPosts.length / 4) - 1;
//           if (infiniteMode && prev >= maxIndex) {
//             return 0; // Loop back to start
//           }
//           return prev < maxIndex ? prev + 1 : prev;
//         });
//       }, 3000); // Change every 3 seconds
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
//   }, [isPlaying, filteredPosts.length, infiniteMode]);

//   // Handle mouse movement for controls
//   const handleMouseMove = () => {
//     setShowControls(true);
//     if (controlsTimeoutRef.current) {
//       clearTimeout(controlsTimeoutRef.current);
//     }
//     controlsTimeoutRef.current = setTimeout(() => {
//       setShowControls(false);
//     }, 3000);
//   };

//   const handleKeywordInputChange = (position: keyof typeof keywords, value: string) => {
//     setKeywordInputs(prev => ({ ...prev, [position]: value }));
//   };

//   const handleKeywordSubmit = (position: keyof typeof keywords) => {
//     onKeywordChange(position, keywordInputs[position]);
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
//                   const position = ['topLeft', 'topRight', 'bottomLeft', 'bottomRight'][index] as keyof typeof keywords;
//                   const imageUrl = getPostImageUrl(post);
//                   return (
//                     <div key={index} className="relative bg-gray-900 overflow-hidden">
//                       {imageUrl ? (
//                         <ImageWithCache
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
                      
//                       {/* Keyword Input Overlay */}
//                       <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-2">
//                         <div className="flex items-center gap-2">
//                           <input
//                             type="text"
//                             value={keywordInputs[position]}
//                             onChange={(e) => handleKeywordInputChange(position, e.target.value)}
//                             placeholder={`Keywords for ${position.replace(/([A-Z])/g, ' $1').toLowerCase()}`}
//                             className="flex-1 px-2 py-1 bg-black/70 text-white text-xs rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
//                             onClick={(e) => e.stopPropagation()}
//                           />
//                           <button
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               handleKeywordSubmit(position);
//                             }}
//                             className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
//                           >
//                             <Save size={12} />
//                           </button>
//                         </div>
//                         <p className="text-white text-xs mt-1 truncate">{post.title}</p>
//                       </div>
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
//       <div className={`absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-4 transition-opacity duration-300 ${
//         showControls ? 'opacity-100' : 'opacity-0'
//       }`}>
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
//                     const maxIndex = Math.ceil(filteredPosts.length / 4) - 1;
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
//                   onChange={() => {}} // Will be handled by parent
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
//       <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
//         showControls ? 'opacity-100' : 'opacity-0'
//       }`}>
//         <div className="max-w-4xl mx-auto">
//           <div className="w-full bg-gray-700 rounded-full h-2">
//             <div
//               className="bg-blue-500 h-2 rounded-full transition-all duration-1000 ease-linear"
//               style={{ 
//                 width: `${((currentIndex + 1) / Math.ceil(filteredPosts.length / 4)) * 100}%` 
//               }}
//             />
//           </div>
//           <p className="text-white text-sm mt-2 text-center">
//             Set {currentIndex + 1} / {Math.ceil(filteredPosts.length / 4)} • {filteredPosts.length} posts
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// // Download Manager Component
// const DownloadManager = ({ 
//   isOpen, 
//   setIsOpen, 
//   downloads, 
//   onClearCompleted 
// }: { 
//   isOpen: boolean; 
//   setIsOpen: (open: boolean) => void; 
//   downloads: Array<{
//     id: string;
//     post: Post;
//     status: 'pending' | 'downloading' | 'completed' | 'error';
//     progress: number;
//     filePath?: string;
//     error?: string;
//   }>;
//   onClearCompleted: () => void;
// }) => {
//   const pendingCount = downloads.filter(d => d.status === 'pending' || d.status === 'downloading').length;
//   const completedCount = downloads.filter(d => d.status === 'completed').length;
//   const errorCount = downloads.filter(d => d.status === 'error').length;

//   return (
//     <div className="relative">
//       <button
//         onClick={() => setIsOpen(!isOpen)}
//         className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors relative"
//       >
//         <Package size={16} />
//         <span className="text-sm">Downloads</span>
//         {pendingCount > 0 && (
//           <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
//             {pendingCount}
//           </span>
//         )}
//         <ChevronDown size={14} className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
//       </button>

//       {isOpen && (
//         <div className="absolute top-full right-0 mt-1 w-80 bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-hidden flex flex-col">
//           <div className="p-3 border-b border-gray-200 dark:border-gray-700">
//             <div className="flex justify-between items-center">
//               <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Downloads</h3>
//               <button
//                 onClick={onClearCompleted}
//                 className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
//               >
//                 Clear Completed
//               </button>
//             </div>
//             <div className="flex gap-2 mt-2 text-xs">
//               <span className="flex items-center gap-1">
//                 <Loader size={10} className="text-blue-500" />
//                 {pendingCount} Pending
//               </span>
//               <span className="flex items-center gap-1">
//                 <CheckCircle size={10} className="text-green-500" />
//                 {completedCount} Completed
//               </span>
//               <span className="flex items-center gap-1">
//                 <AlertCircle size={10} className="text-red-500" />
//                 {errorCount} Failed
//               </span>
//             </div>
//           </div>
          
//           <div className="flex-1 overflow-y-auto">
//             {downloads.length === 0 ? (
//               <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
//                 No downloads yet
//               </div>
//             ) : (
//               <div className="divide-y divide-gray-200 dark:divide-gray-700">
//                 {downloads.map((download) => (
//                   <div key={download.id} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800">
//                     <div className="flex items-start gap-2">
//                       <div className="flex-shrink-0 w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
//                         {download.post.file ? (
//                           <img
//                             src={
//                               COOMER_SERVICES.includes(download.post.service) 
//                                 ? `https://coomer.st${download.post.file.path}`
//                                 : `https://kemono.su${download.post.file.path}`
//                             }
//                             alt={download.post.id}
//                             className="w-full h-full object-cover"
//                           />
//                         ) : (
//                           <div className="w-full h-full flex items-center justify-center">
//                             <ImageOff size={16} className="text-gray-500" />
//                           </div>
//                         )}
//                       </div>
//                       <div className="flex-1 min-w-0">
//                         <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
//                           {download.post.title}
//                         </p>
//                         <p className="text-xs text-gray-500 dark:text-gray-400">
//                           {download.post.service}
//                         </p>
//                         <div className="flex items-center justify-between mt-1">
//                           <div className="flex items-center gap-1">
//                             {download.status === 'pending' && <Loader size={10} className="text-blue-500 animate-spin" />}
//                             {download.status === 'downloading' && <Loader size={10} className="text-blue-500 animate-spin" />}
//                             {download.status === 'completed' && <CheckCircle size={10} className="text-green-500" />}
//                             {download.status === 'error' && <AlertCircle size={10} className="text-red-500" />}
//                             <span className="text-xs capitalize">{download.status}</span>
//                           </div>
//                           {download.status === 'downloading' && (
//                             <span className="text-xs text-gray-500 dark:text-gray-400">
//                               {download.progress}%
//                             </span>
//                           )}
//                         </div>
//                         {download.status === 'downloading' && (
//                           <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 mt-1">
//                             <div
//                               className="bg-blue-500 h-1 rounded-full transition-all duration-300"
//                               style={{ width: `${download.progress}%` }}
//                             />
//                           </div>
//                         )}
//                         {download.status === 'error' && (
//                           <p className="text-xs text-red-500 mt-1">{download.error}</p>
//                         )}
//                         {download.status === 'completed' && download.filePath && (
//                           <button
//                             onClick={() => DownloadService.getInstance().openFileLocation(download.filePath!)}
//                             className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1"
//                           >
//                             Open File Location
//                           </button>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// // Batch Download Component
// const BatchDownload = ({ 
//   posts, 
//   onDownloadStart 
// }: { 
//   posts: Post[];
//   onDownloadStart: (count: number) => void;
// }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [count, setCount] = useState(10);

//   const handleDownload = () => {
//     if (count > 0 && count <= posts.length) {
//       onDownloadStart(count);
//       setIsOpen(false);
//     }
//   };

//   return (
//     <div className="relative">
//       <button
//         onClick={() => setIsOpen(!isOpen)}
//         className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
//       >
//         <Download size={16} />
//         <span className="text-sm">Batch Download</span>
//         <ChevronDown size={14} className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
//       </button>

//       {isOpen && (
//         <div className="absolute top-full right-0 mt-1 w-64 bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 z-50">
//           <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Batch Download</h3>
          
//           <div className="mb-3">
//             <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
//               Number of Posts
//             </label>
//             <div className="flex items-center gap-2">
//               <input
//                 type="range"
//                 min="1"
//                 max={Math.min(posts.length, 100)}
//                 value={count}
//                 onChange={(e) => setCount(parseInt(e.target.value))}
//                 className="flex-1"
//               />
//               <span className="text-sm text-gray-700 dark:text-gray-300 w-8">{count}</span>
//             </div>
//             <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
//               Max: {Math.min(posts.length, 100)} posts
//             </p>
//           </div>
          
//           <button
//             onClick={handleDownload}
//             className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
//           >
//             Start Download
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// // Enhanced Creator Profile Drawer Component
// function CreatorProfileDrawer({ 
//   creator, 
//   isOpen, 
//   onClose 
// }: { 
//   creator: Creator | null; 
//   isOpen: boolean; 
//   onClose: () => void;
// }) {
//   const [posts, setPosts] = useState<Post[]>([]);
//   const [profile, setProfile] = useState<Profile | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [loadingMore, setLoadingMore] = useState(false);
//   const [selectedPost, setSelectedPost] = useState<Post | null>(null);
//   const [isPostModalOpen, setIsPostModalOpen] = useState(false);
//   const [viewMode, setViewMode] = useState<'grid' | 'slideshow'>('grid');
//   const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [hoveredPost, setHoveredPost] = useState<Post | null>(null);
//   const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
//   const [currentPage, setCurrentPage] = useState(0);
//   const [hasMorePosts, setHasMorePosts] = useState(false);
//   const [isFullscreen, setIsFullscreen] = useState(false);
//   const [showControls, setShowControls] = useState(true);
//   const [autoplaySpeed, setAutoplaySpeed] = useState(1);
//   const [isMuted, setIsMuted] = useState(false);
//   const [volume, setVolume] = useState(50);
//   const [zoomLevel, setZoomLevel] = useState(1);
//   const [rotation, setRotation] = useState(0);
//   const [isShuffled, setIsShuffled] = useState(false);
//   const [isLooping, setIsLooping] = useState(false);
//   const [playbackRate, setPlaybackRate] = useState(1);
//   const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set());
//   const [showSelection, setShowSelection] = useState(false);
//   const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'mostLiked' | 'mostViewed'>('newest');
//   const [filterType, setFilterType] = useState<'all' | 'images' | 'videos'>('all');
//   const [gridScale, setGridScale] = useState(1);
//   const [hoverPreviewEnabled, setHoverPreviewEnabled] = useState(false);
//   const [movieModeActive, setMovieModeActive] = useState(false);
//   const [movieModeKeywords, setMovieModeKeywords] = useState({
//     topLeft: '',
//     topRight: '',
//     bottomLeft: '',
//     bottomRight: '',
//   });
//   const [movieModeInfinite, setMovieModeInfinite] = useState(true);
//   const [downloads, setDownloads] = useState<Array<{
//     id: string;
//     post: Post;
//     status: 'pending' | 'downloading' | 'completed' | 'error';
//     progress: number;
//     filePath?: string;
//     error?: string;
//   }>>([]);
//   const [downloadManagerOpen, setDownloadManagerOpen] = useState(false);
//   const intervalRef = useRef<NodeJS.Timeout | null>(null);
//   const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
        
//         const postsResponse = await axios.get<Post[]>(
//           `${COOMER_POSTS_API_BASE_URL}/${creator.service}/user/${creator.id}/posts?o=0`,
//           { headers: isCoomer ? { 'Accept': 'text/css' } : {} }
//         );
        
//         const transformedPosts: Post[] = postsResponse.data.map((post: any) => ({
//           id: post.id,
//           user: post.user || creator.id,
//           service: creator.service,
//           title: post.title || 'Untitled',
//           content: post.content || '',
//           published: post.published,
//           file: post.file,
//           attachments: post.attachments || []
//         }));
        
//         setPosts(transformedPosts);
//         setHasMorePosts(transformedPosts.length === POSTS_PER_PAGE && profileResponse.data.post_count > POSTS_PER_PAGE);
//       } catch (error: any) {
//         console.error('Failed to fetch data:', error);
//         toast.error('Failed to load creator data');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [creator]);

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

//   useEffect(() => {
//     if (isPlaying && viewMode === 'slideshow' && posts.length > 0) {
//       intervalRef.current = setInterval(() => {
//         if (isShuffled) {
//           const randomIndex = Math.floor(Math.random() * posts.length);
//           setCurrentSlideIndex(randomIndex);
//         } else {
//           setCurrentSlideIndex((prev) => (prev + 1) % posts.length);
//         }
//       }, 10000 / autoplaySpeed);
//     } else {
//       if (intervalRef.current) {
//         clearInterval(intervalRef.current);
//       }
//     }

//     return () => {
//       if (intervalRef.current) {
//         clearInterval(intervalRef.current);
//       }
//     };
//   }, [isPlaying, viewMode, posts.length, autoplaySpeed, isShuffled]);

//   useEffect(() => {
//     setCurrentSlideIndex(0);
//     setIsPlaying(false);
//     setViewMode('grid');
//     setCurrentPage(0);
//     setSelectedPosts(new Set());
//   }, [creator]);

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

//   const handlePostClick = useCallback((post: Post) => {
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
//       setIsPostModalOpen(true);
//     }
//   }, [showSelection, selectedPosts]);

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
//         // In a real app, you would sort by actual like count
//         filtered.sort(() => Math.random() - 0.5);
//         break;
//       case 'mostViewed':
//         // In a real app, you would sort by actual view count
//         filtered.sort(() => Math.random() - 0.5);
//         break;
//     }
    
//     return filtered;
//   }, [posts, filterType, sortBy]);

//   const getPostImageUrl = useCallback((post: Post) => {
//     if (post.file) {
//       const baseUrl = COOMER_SERVICES.includes(post.service) ? 'https://coomer.st' : 'https://kemono.su';
//       return `${baseUrl}${post.file.path}`;
//     }
//     if (post.attachments && post.attachments.length > 0) {
//       const baseUrl = COOMER_SERVICES.includes(post.service) ? 'https://coomer.st' : 'https://kemono.su';
//       return `${baseUrl}${post.attachments[0].path}`;
//     }
//     return null;
//   }, []);

//   const isVideo = useCallback((filename?: string) => {
//     if (!filename) return false;
//     return filename.includes('.mp4') || filename.includes('.mov') || filename.includes('.avi') || filename.includes('.webm');
//   }, []);

//   const handleDownload = useCallback(async (post: Post) => {
//     const downloadService = DownloadService.getInstance();
//     const dir = await downloadService.selectDownloadDirectory();
//     if (!dir) return;
    
//     const fileName = `${post.id}.${post.file?.name?.split('.').pop() || 'jpg'}`;
//     const filePath = `${dir}/${fileName}`;
    
//     try {
//       const url = COOMER_SERVICES.includes(post.service) 
//         ? `https://coomer.st${post.file?.path || ''}`
//         : `https://kemono.su${post.file?.path || ''}`;
      
//       // Create download item
//       const downloadId = `download-${Date.now()}-${post.id}`;
//       const newDownload = {
//         id: downloadId,
//         post,
//         status: 'pending' as const,
//         progress: 0,
//       };
      
//       // Add to downloads list
//       setDownloads(prev => [...prev, newDownload]);
      
//       // Update status to downloading
//       setDownloads(prev => 
//         prev.map(d => 
//           d.id === downloadId 
//             ? { ...d, status: 'downloading' as const, progress: 0 }
//             : d
//         )
//       );
      
//       // Download file with progress tracking
//       await downloadService.downloadFile(
//         url, 
//         filePath,
//         (progress) => {
//           setDownloads(prev => 
//             prev.map(d => 
//               d.id === downloadId 
//                 ? { ...d, progress }
//                 : d
//             )
//           );
//         }
//       );
      
//       // Update status to completed
//       setDownloads(prev => 
//         prev.map(d => 
//           d.id === downloadId 
//             ? { ...d, status: 'completed' as const, progress: 100, filePath }
//             : d
//         )
//       );
      
//       toast.success(`Downloaded: ${fileName}`);
//     } catch (error) {
//       console.error('Download error:', error);
//       // Update status to error
//       setDownloads(prev => 
//         prev.map(d => 
//           d.id === downloadId 
//             ? { ...d, status: 'error' as const, error: 'Download failed' }
//             : d
//         )
//       );
//       toast.error(`Failed to download: ${post.title}`);
//     }
//   }, []);

//   const handleShare = useCallback((post: Post) => {
//     const url = COOMER_SERVICES.includes(post.service) 
//       ? `https://coomer.st${post.file?.path || ''}`
//       : `https://kemono.su${post.file?.path || ''}`;
    
//     navigator.clipboard.writeText(url);
//     toast('Link copied to clipboard');
//   }, []);

//   const handleCopyLink = useCallback((post: Post) => {
//     const url = COOMER_SERVICES.includes(post.service) 
//       ? `https://coomer.st${post.file?.path || ''}`
//       : `https://kemono.su${post.file?.path || ''}`;
    
//     navigator.clipboard.writeText(url);
//     toast('Link copied to clipboard');
//   }, []);

//   // Batch download handler with Electron APIs
//   const handleBatchDownload = useCallback(async (count: number) => {
//     const downloadService = DownloadService.getInstance();
    
//     // Select download directory
//     const dir = await downloadService.selectDownloadDirectory();
//     if (!dir) return;
    
//     // Select the first 'count' posts for download
//     const postsToDownload = filteredPosts.slice(0, count);
    
//     // Create download items
//     const newDownloads = postsToDownload.map(post => ({
//       id: `download-${Date.now()}-${post.id}`,
//       post,
//       status: 'pending' as const,
//       progress: 0,
//     }));
    
//     // Add to downloads list
//     setDownloads(prev => [...prev, ...newDownloads]);
    
//     toast.success(`Started downloading ${count} posts to ${dir}`);
    
//     // Start downloads
//     newDownloads.forEach(async (download, index) => {
//       try {
//         // Update status to downloading
//         setDownloads(prev => 
//           prev.map(d => 
//             d.id === download.id 
//               ? { ...d, status: 'downloading' as const, progress: 0 }
//               : d
//           )
//         );
        
//         const url = COOMER_SERVICES.includes(download.post.service) 
//           ? `https://coomer.st${download.post.file?.path || ''}`
//           : `https://kemono.su${download.post.file?.path || ''}`;
        
//         const fileName = `${download.post.id}.${download.post.file?.name?.split('.').pop() || 'jpg'}`;
//         const filePath = `${dir}/${fileName}`;
        
//         // Download file with progress tracking
//         await downloadService.downloadFile(
//           url, 
//           filePath,
//           (progress) => {
//             setDownloads(prev => 
//               prev.map(d => 
//                 d.id === download.id 
//                   ? { ...d, progress }
//                   : d
//               )
//             );
//           }
//         );
        
//         // Update status to completed
//         setDownloads(prev => 
//           prev.map(d => 
//             d.id === download.id 
//               ? { ...d, status: 'completed' as const, progress: 100, filePath }
//               : d
//           )
//         );
        
//         toast.success(`Downloaded: ${fileName}`);
//       } catch (error) {
//         console.error('Download error:', error);
//         // Update status to error
//         setDownloads(prev => 
//           prev.map(d => 
//             d.id === download.id 
//               ? { ...d, status: 'error' as const, error: 'Download failed' }
//               : d
//           )
//         );
//         toast.error(`Failed to download: ${download.post.title}`);
//       }
//     });
//   }, [filteredPosts]);

//   const handleClearCompletedDownloads = useCallback(() => {
//     setDownloads(prev => prev.filter(d => d.status !== 'completed'));
//   }, []);

//   const handleMovieModeToggle = () => {
//     setMovieModeActive(!movieModeActive);
//   };

//   const handleMovieModeKeywordChange = (position: keyof typeof movieModeKeywords, value: string) => {
//     setMovieModeKeywords(prev => ({ ...prev, [position]: value }));
//   };

//   const handleSelectAll = () => {
//     if (selectedPosts.size === filteredPosts.length) {
//       setSelectedPosts(new Set());
//     } else {
//       setSelectedPosts(new Set(filteredPosts.map(post => post.id)));
//     }
//   };

//   const handleDownloadSelected = async () => {
//     const downloadService = DownloadService.getInstance();
//     const dir = await downloadService.selectDownloadDirectory();
//     if (!dir) return;
    
//     const selectedPostsList = filteredPosts.filter(post => selectedPosts.has(post.id));
    
//     selectedPostsList.forEach(async (post, index) => {
//       try {
//         const url = COOMER_SERVICES.includes(post.service) 
//           ? `https://coomer.st${post.file?.path || ''}`
//           : `https://kemono.su${post.file?.path || ''}`;
        
//         const fileName = `${post.id}.${post.file?.name?.split('.').pop() || 'jpg'}`;
//         const filePath = `${dir}/${fileName}`;
        
//         await downloadService.downloadFile(url, filePath);
        
//         toast.success(`Downloaded: ${fileName}`);
//       } catch (error) {
//         console.error('Download error:', error);
//         toast.error(`Failed to download: ${post.title}`);
//       }
//     });
//   };

//   const handleCreatePlaylist = () => {
//     // In a real app, this would create a playlist from selected posts
//     toast('Playlist created from selected posts');
//   };

//   if (!creator) return null;

//   return (
//     <>
//       <Drawer open={isOpen} onOpenChange={onClose}>
//         <DrawerContent className="max-w-7xl h-[95vh] bg-black/95 backdrop-blur-xl border-white/10 text-white mx-auto">
//           <div className="flex flex-col h-full mx-auto w-full max-w-7xl">
//             <div className="flex items-center justify-between p-4 border-b border-white/10 flex-shrink-0">
//               <div className="flex items-center gap-3">
//                 <Avatar className="h-10 w-10">
//                   <AvatarImage src={
//                     COOMER_SERVICES.includes(creator.service) 
//                       ? `https://coomer.st/icons/${creator.service}/${creator.id}`
//                       : `https://kemono.su/icons/${creator.service}/${creator.id}`
//                   } />
//                   <AvatarFallback>{creator.name.charAt(0).toUpperCase()}</AvatarFallback>
//                 </Avatar>
//                 <div>
//                   <DrawerTitle className="text-lg font-bold">{creator.name}</DrawerTitle>
//                   <DrawerDescription className="text-sm text-gray-400">
//                     {creator.service} • {creator.favorited} favorites
//                     {profile && <span className="ml-2">{profile.post_count} posts</span>}
//                   </DrawerDescription>
//                 </div>
//               </div>
//               <div className="flex items-center gap-2">
//                 {showSelection && (
//                   <div className="flex items-center gap-2 mr-2">
//                     <Button
//                       variant="ghost"
//                       size="sm"
//                       className="text-white"
//                       onClick={handleSelectAll}
//                     >
//                       {selectedPosts.size === filteredPosts.length ? 'Deselect All' : 'Select All'}
//                     </Button>
//                     <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
//                       {selectedPosts.size} selected
//                     </Badge>
//                     <Button
//                       variant="ghost"
//                       size="sm"
//                       className="text-white"
//                       onClick={handleDownloadSelected}
//                       disabled={selectedPosts.size === 0}
//                     >
//                       <Download className="h-4 w-4 mr-1" />
//                       Download
//                     </Button>
//                     <Button
//                       variant="ghost"
//                       size="sm"
//                       className="text-white"
//                       onClick={handleCreatePlaylist}
//                       disabled={selectedPosts.size === 0}
//                     >
//                       <PlayCircle className="h-4 w-4 mr-1" />
//                       Playlist
//                     </Button>
//                   </div>
//                 )}
                
//                 <Button
//                   variant="ghost"
//                   size="sm"
//                   className={`text-white ${showSelection ? 'bg-white/20' : ''}`}
//                   onClick={() => setShowSelection(!showSelection)}
//                 >
//                   <Grid3x3 className="h-4 w-4" />
//                 </Button>
                
//                 <Select value={filterType} onValueChange={(value) => setFilterType(value as 'all' | 'images' | 'videos')}>
//                   <SelectTrigger className="w-32 bg-white/10 backdrop-blur-md border-white/20 text-white">
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent className="bg-black/90 backdrop-blur-xl border-white/10">
//                     <SelectItem value="all" className="text-white">All</SelectItem>
//                     <SelectItem value="images" className="text-white">Images</SelectItem>
//                     <SelectItem value="videos" className="text-white">Videos</SelectItem>
//                   </SelectContent>
//                 </Select>
                
//                 <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'newest' | 'oldest' | 'mostLiked' | 'mostViewed')}>
//                   <SelectTrigger className="w-32 bg-white/10 backdrop-blur-md border-white/20 text-white">
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent className="bg-black/90 backdrop-blur-xl border-white/10">
//                     <SelectItem value="newest" className="text-white">Newest</SelectItem>
//                     <SelectItem value="oldest" className="text-white">Oldest</SelectItem>
//                     <SelectItem value="mostLiked" className="text-white">Most Liked</SelectItem>
//                     <SelectItem value="mostViewed" className="text-white">Most Viewed</SelectItem>
//                   </SelectContent>
//                 </Select>
                
//                 <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'grid' | 'slideshow')}>
//                   <TabsList className="bg-white/10 border-white/20">
//                     <TabsTrigger value="grid" className="data-[state=active]:bg-white/20">
//                       <Grid3x3 className="h-4 w-4 mr-2" />
//                       Grid
//                     </TabsTrigger>
//                     <TabsTrigger value="slideshow" className="data-[state=active]:bg-white/20">
//                       <PlayCircle className="h-4 w-4 mr-2" />
//                       Slideshow
//                     </TabsTrigger>
//                   </TabsList>
//                 </Tabs>
                
//                 <Button
//                   onClick={handleMovieModeToggle}
//                   className="flex items-center gap-1 px-2 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition-colors"
//                 >
//                   <Tv size={14} />
//                   Movie Mode
//                 </Button>
                
//                 <BatchDownload
//                   posts={filteredPosts}
//                   onDownloadStart={handleBatchDownload}
//                 />
                
//                 <DownloadManager
//                   isOpen={downloadManagerOpen}
//                   setIsOpen={setDownloadManagerOpen}
//                   downloads={downloads}
//                   onClearCompleted={handleClearCompletedDownloads}
//                 />
                
//                 <div className="flex items-center gap-1">
//                   <Button
//                     variant="ghost"
//                     size="sm"
//                     className={`text-white ${hoverPreviewEnabled ? 'bg-blue-500' : ''}`}
//                     onClick={() => setHoverPreviewEnabled(!hoverPreviewEnabled)}
//                   >
//                     <MousePointer size={16} />
//                   </Button>
                  
//                   <div className="flex items-center bg-white/10 backdrop-blur-md rounded px-1">
//                     <span className="text-xs text-gray-300 mr-1">Scale</span>
//                     <input
//                       type="range"
//                       min="0.5"
//                       max="2"
//                       step="0.1"
//                       value={gridScale}
//                       onChange={(e) => setGridScale(parseFloat(e.target.value))}
//                       className="w-16 h-4 bg-gray-700 rounded-lg appearance-none cursor-pointer"
//                     />
//                     <span className="text-xs text-gray-300 ml-1">{gridScale.toFixed(1)}x</span>
//                   </div>
//                 </div>
                
//                 <DrawerClose asChild>
//                   <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
//                     <X className="h-5 w-5" />
//                   </Button>
//                 </DrawerClose>
//               </div>
//             </div>

//             <div className="flex-1 overflow-hidden">
//               {loading ? (
//                 <div className="flex items-center justify-center h-full">
//                   <Loader2 className="h-8 w-8 animate-spin text-white" />
//                 </div>
//               ) : filteredPosts.length === 0 ? (
//                 <div className="flex items-center justify-center h-full">
//                   <p className="text-gray-400">No posts available</p>
//                 </div>
//               ) : (
//                 <>
//                   {viewMode === 'grid' ? (
//                     <div id="posts-scroll-container" className="h-full overflow-y-auto">
//                       <InfiniteScroll
//                         dataLength={filteredPosts.length}
//                         next={loadMorePosts}
//                         hasMore={hasMorePosts}
//                         loader={<div className="flex justify-center py-4"><Loader2 className="h-6 w-6 animate-spin text-white" /></div>}
//                         scrollableTarget="posts-scroll-container"
//                         endMessage={<p className="text-center text-gray-400 py-4">No more posts</p>}
//                       >
//                         <MasonryGrid
//                           posts={filteredPosts}
//                           onPostClick={handlePostClick}
//                           gridScale={gridScale}
//                           onHover={setHoveredPost}
//                           hoverPreviewEnabled={hoverPreviewEnabled}
//                           service={creator.service}
//                           selectedPosts={selectedPosts}
//                           showSelection={showSelection}
//                         />
//                       </InfiniteScroll>
//                     </div>
//                   ) : (
//                     <div className="relative h-full flex items-center justify-center bg-black">
//                       {/* Slideshow view would go here */}
//                       <div className="text-center text-white">
//                         <PlayCircle className="h-16 w-16 mx-auto mb-4" />
//                         <p className="text-xl">Slideshow Mode</p>
//                         <p className="text-sm text-gray-400 mt-2">Feature coming soon</p>
//                       </div>
//                     </div>
//                   )}
//                 </>
//               )}
//             </div>
//           </div>
//         </DrawerContent>
//       </Drawer>

//       {/* Post Detail Modal */}
//       <Dialog open={isPostModalOpen} onOpenChange={setIsPostModalOpen}>
//         <DialogContent className="max-w-4xl h-[90vh] bg-black/95 backdrop-blur-xl border-white/10 text-white">
//           <DialogHeader>
//             <DialogTitle className="text-xl font-bold text-white">
//               {selectedPost?.title || 'Post Details'}
//             </DialogTitle>
//           </DialogHeader>
//           <div className="flex flex-col h-full">
//             <div className="flex-1 flex items-center justify-center">
//               {selectedPost && (
//                 <div className="w-full h-full flex items-center justify-center">
//                   {getPostImageUrl(selectedPost) ? (
//                     <img
//                       src={getPostImageUrl(selectedPost) || ''}
//                       alt={selectedPost.title}
//                       className="max-w-full max-h-full object-contain"
//                     />
//                   ) : (
//                     <div className="text-center">
//                       <ImageOff className="h-12 w-12 text-gray-500 mx-auto mb-2" />
//                       <p className="text-gray-400">No media available</p>
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>
//             <div className="p-4 border-t border-white/10">
//               <div className="flex justify-between items-center">
//                 <div className="flex gap-2">
//                   <Button
//                     variant="ghost"
//                     size="sm"
//                     className="text-white"
//                     onClick={() => selectedPost && handleDownload(selectedPost)}
//                   >
//                     <Download className="h-4 w-4 mr-1" />
//                     Download
//                   </Button>
//                   <Button
//                     variant="ghost"
//                     size="sm"
//                     className="text-white"
//                     onClick={() => selectedPost && handleShare(selectedPost)}
//                   >
//                     <Share2 className="h-4 w-4 mr-1" />
//                     Share
//                   </Button>
//                 </div>
//                 <Button
//                   variant="ghost"
//                   size="sm"
//                   className="text-white"
//                   onClick={() => setIsPostModalOpen(false)}
//                 >
//                   Close
//                 </Button>
//               </div>
//             </div>
//           </div>
//         </DialogContent>
//       </Dialog>

//       {/* Movie Mode Modal */}
//       {movieModeActive && (
//         <MovieMode
//           posts={filteredPosts}
//           onClose={() => setMovieModeActive(false)}
//           keywords={movieModeKeywords}
//           infiniteMode={movieModeInfinite}
//           onKeywordChange={handleMovieModeKeywordChange}
//           service={creator.service}
//         />
//       )}

//       {/* Hover Preview */}
//       {hoverPreviewEnabled && hoveredPost && (
//         <HoverPreview
//           post={hoveredPost}
//           enabled={hoverPreviewEnabled}
//           mousePosition={mousePosition}
//           service={creator.service}
//         />
//       )}
//     </>
//   );
// }

// function RouteComponent() {
//   const [creators, setCreators] = useState<Creator[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedService, setSelectedService] = useState('all');
//   const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
//   const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
//   const [apiError, setApiError] = useState<string | null>(null);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(0);
//   const [totalCreators, setTotalCreators] = useState(0);
//   const [hasMore, setHasMore] = useState(true);
//   const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
//   const [isCreatorDrawerOpen, setIsCreatorDrawerOpen] = useState(false);
//   const [isDarkMode, setIsDarkMode] = useState(true);

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
//     if (!searchTerm.trim()) return creators;
//     return creators.filter(creator =>
//       creator.name.toLowerCase().includes(searchTerm.toLowerCase())
//     );
//   }, [creators, searchTerm]);

//   const handleRefresh = useCallback(() => {
//     setRefreshing(true);
//     setCurrentPage(1);
//     setCreators([]);
//     fetchCreators(1);
//   }, [fetchCreators]);

//   const formatDate = useCallback((timestamp: number) => {
//     const date = new Date(timestamp * 1000);
//     return date.toLocaleDateString();
//   }, []);

//   const getCreatorImageUrl = useCallback((creator: Creator) => {
//     if (COOMER_SERVICES.includes(creator.service)) {
//       return `https://coomer.st/icons/${creator.service}/${creator.id}`;
//     } else {
//       return `https://kemono.su/icons/${creator.service}/${creator.id}`;
//     }
//   }, []);

//   const getServiceDisplayName = useCallback((service: string) => {
//     const serviceObj = SERVICES.find(s => s.value === service);
//     return serviceObj ? serviceObj.label : service;
//   }, []);

//   const handleImageError = useCallback((creatorId: string) => {
//     setImageErrors(prev => new Set(prev).add(creatorId));
//   }, []);

//   const handleCreatorClick = useCallback((creator: Creator) => {
//     setSelectedCreator(creator);
//     setIsCreatorDrawerOpen(true);
//   }, []);

//   const handleThemeToggle = () => {
//     setIsDarkMode(!isDarkMode);
//   };

//   return (
//     <div className={`h-screen w-screen flex flex-col ${isDarkMode ? 'dark' : ''} bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-pink-900/20`}>
//       {/* Fixed Header */}
//       <header className="flex-shrink-0 bg-black/40 backdrop-blur-lg border-b border-white/10">
//         <div className="container mx-auto px-4 py-4">
//           <div className="flex flex-col gap-4">
//             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
//               <div>
//                 <h1 className="text-2xl font-bold tracking-tight text-white">Creator Browser</h1>
//                 <p className="text-gray-300 text-sm">
//                   Browse creators from Coomer and Kemono
//                   {lastUpdated && <span className="ml-2 text-xs">Updated: {lastUpdated.toLocaleTimeString()}</span>}
//                   {totalCreators > 0 && <span className="ml-2 text-xs">{creators.length}/{totalCreators}</span>}
//                 </p>
//               </div>
//               <div className="flex items-center gap-2">
//                 <Button 
//                   variant="outline" 
//                   size="sm"
//                   onClick={handleRefresh} 
//                   disabled={refreshing || loading}
//                   className="flex items-center gap-2 bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20"
//                 >
//                   {refreshing || loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
//                   Refresh
//                 </Button>
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={handleThemeToggle}
//                   className="flex items-center gap-2 bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20"
//                 >
//                   {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
//                 </Button>
//               </div>
//             </div>

//             {apiError && (
//               <div className="bg-red-500/20 backdrop-blur-md border border-red-500/30 rounded-md p-3 flex items-start gap-2">
//                 <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
//                 <div>
//                   <h3 className="font-medium text-red-400 text-sm">API Error</h3>
//                   <p className="text-xs text-red-300 mt-1">{apiError}</p>
//                 </div>
//               </div>
//             )}

//             <div className="flex flex-col sm:flex-row gap-3">
//               <div className="relative flex-1 max-w-md">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
//                 <Input
//                   placeholder="Search creators..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="pl-10 bg-white/10 backdrop-blur-md border-white/20 text-white placeholder:text-gray-400 focus:border-white/40"
//                 />
//               </div>
//               <div className="flex items-center gap-2">
//                 <Filter className="h-4 w-4 text-gray-400" />
//                 <Select value={selectedService} onValueChange={setSelectedService}>
//                   <SelectTrigger className="w-48 bg-white/10 backdrop-blur-md border-white/20 text-white">
//                     <SelectValue placeholder="Select service" />
//                   </SelectTrigger>
//                   <SelectContent className="bg-black/90 backdrop-blur-xl border-white/10">
//                     {SERVICES.map((service) => (
//                       <SelectItem key={service.value} value={service.value} className="text-white">
//                         {service.label}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>
//             </div>
//           </div>
//         </div>
//       </header>

//       {/* Scrollable Content */}
//       <main id="main-scroll-container" className="flex-1 overflow-y-auto">
//         <div className="container mx-auto px-4 py-4">
//           {loading && creators.length === 0 ? (
//             <div className="flex flex-col justify-center items-center py-12 gap-4">
//               <Loader2 className="h-8 w-8 animate-spin text-white" />
//               <p className="text-sm text-gray-300">Loading creators...</p>
//             </div>
//           ) : filteredCreators.length === 0 ? (
//             <div className="text-center py-12">
//               <p className="text-gray-300 text-sm">
//                 {searchTerm || selectedService !== 'all' ? 'No creators found matching your search or filter.' : 'No creators available.'}
//               </p>
//             </div>
//           ) : (
//             <InfiniteScroll
//               dataLength={filteredCreators.length}
//               next={loadMoreCreators}
//               hasMore={hasMore}
//               loader={<div className="flex justify-center py-4"><Loader2 className="h-6 w-6 animate-spin text-white" /></div>}
//               scrollableTarget="main-scroll-container"
//               endMessage={<p className="text-center text-gray-400 py-4">You've reached the end</p>}
//             >
//               <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-3">
//                 {filteredCreators.map((creator) => (
//                   <Card 
//                     key={creator.id} 
//                     className="overflow-hidden bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-all duration-200 hover:shadow-xl hover:shadow-white/10 cursor-pointer group hover:scale-105"
//                     onClick={() => handleCreatorClick(creator)}
//                   >
//                     <div className="aspect-square relative overflow-hidden bg-black/30">
//                       {!imageErrors.has(creator.id) ? (
//                         <>
//                           <img
//                             src={getCreatorImageUrl(creator)}
//                             alt={creator.name}
//                             className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-110"
//                             onError={() => handleImageError(creator.id)}
//                             loading="lazy"
//                           />
//                           <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
//                             <div className="absolute bottom-0 left-0 right-0 p-2">
//                               <h3 className="font-bold text-xs text-white truncate">{creator.name}</h3>
//                               <p className="text-xs text-gray-300">{getServiceDisplayName(creator.service)}</p>
//                             </div>
//                           </div>
//                         </>
//                       ) : (
//                         <div className="w-full h-full flex items-center justify-center">
//                           <ImageOff className="h-8 w-8 text-gray-500" />
//                         </div>
//                       )}
//                     </div>
//                     <div className="p-2">
//                       <div className="flex items-center justify-between mb-1">
//                         <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-xs px-1 py-0">
//                           {getServiceDisplayName(creator.service)}
//                         </Badge>
//                       </div>
//                       <p className="text-xs text-white truncate font-medium">{creator.name}</p>
//                       <div className="flex justify-between text-xs text-gray-400 mt-1">
//                         <span>{creator.favorited} ❤️</span>
//                         <span>{formatDate(creator.updated)}</span>
//                       </div>
//                     </div>
//                   </Card>
//                 ))}
//               </div>
//             </InfiniteScroll>
//           )}
//         </div>
//       </main>

//       <CreatorProfileDrawer
//         creator={selectedCreator}
//         isOpen={isCreatorDrawerOpen}
//         onClose={() => setIsCreatorDrawerOpen(false)}
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
// const CACHE_EXPIRY_MS = 12 * 60 * 60 * 1000; // 12 hours

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

// // --- DOWNLOAD SERVICE ---
// class DownloadService {
//   private static instance: DownloadService;
  
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
//     onProgress?: (progress: number) => void
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

//   async openFileLocation(filePath: string): Promise<void> {
//     try {
//       if (window.electronAPI) {
//         await window.electronAPI.openPath(filePath);
//       } else {
//         window.open(`file://${filePath}`, '_blank');
//       }
//     } catch (error) {
//       console.error('Error opening file location:', error);
//       toast.error('Failed to open file location');
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

// // --- IMAGE CACHE SYSTEM ---
// class ImageCache {
//   private cache = new Map<string, { url: string; timestamp: number }>();
//   private loadingPromises = new Map<string, Promise<string>>();
//   private maxCacheSize = 200; // Maximum number of images to cache
//   private cacheExpiry = 30 * 60 * 1000; // 30 minutes

//   async getImage(originalUrl: string): Promise<string> {
//     // Check if already cached
//     if (this.cache.has(originalUrl)) {
//       const cached = this.cache.get(originalUrl)!;
//       if (Date.now() - cached.timestamp < this.cacheExpiry) {
//         return cached.url;
//       } else {
//         this.cache.delete(originalUrl);
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
      
//       // Add to cache
//       this.cache.set(originalUrl, { url: objectUrl, timestamp: Date.now() });
      
//       // Clean up old cache entries if needed
//       if (this.cache.size > this.maxCacheSize) {
//         this.cleanupCache();
//       }
      
//       return objectUrl;
//     } catch (error) {
//       console.error('Failed to load image:', error);
//       return originalUrl; // Return original URL as fallback
//     }
//   }

//   private cleanupCache(): void {
//     const entries = Array.from(this.cache.entries());
//     entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    
//     // Remove oldest 25% of entries
//     const toRemove = Math.floor(entries.length * 0.25);
//     for (let i = 0; i < toRemove; i++) {
//       const [url, data] = entries[i];
//       URL.revokeObjectURL(data.url);
//       this.cache.delete(url);
//     }
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
// }

// const imageCache = new ImageCache();

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
        
//         const cachedUrl = await imageCache.getImage(src);
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
//   const [likes, setLikes] = useState(creator.favorited);

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
//       <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-3 flex flex-col justify-between transition-opacity duration-300 ${
//         isHovered ? 'opacity-100' : 'opacity-0'
//       }`}>
//         <div className="flex justify-end">
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
//   onPostClick: (post: Post) => void;
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

//     imageCache.preloadImages(imageUrls);
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
//         {posts.map((post) => {
//           const imageUrl = getPostImageUrl(post);
//           const isSelected = selectedPosts.has(post.id);
//           const hasVideo = isVideo(post.file?.name || post.attachments?.[0]?.name);
//           const hasMultiple = post.attachments && post.attachments.length > 0;
          
//           return (
//             <div
//               key={post.id}
//               className={`relative aspect-square overflow-hidden rounded-lg cursor-pointer group transform transition-all duration-300 hover:scale-105 ${
//                 showSelection && isSelected ? 'ring-2 ring-blue-500' : ''
//               }`}
//               onClick={() => onPostClick(post)}
//               onMouseEnter={() => setHoveredPost(post)}
//               onMouseLeave={() => setHoveredPost(null)}
//             >
//               {/* Selection checkbox */}
//               {showSelection && (
//                 <div className="absolute top-2 left-2 z-10">
//                   <div className={`w-5 h-5 rounded-full border-2 border-white flex items-center justify-center ${
//                     isSelected ? 'bg-blue-500' : 'bg-black/50'
//                   }`}>
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
//   keywords,
//   infiniteMode,
//   onKeywordChange,
//   service
// }: {
//   posts: Post[];
//   onClose: () => void;
//   keywords: {
//     topLeft: string;
//     topRight: string;
//     bottomLeft: string;
//     bottomRight: string;
//   };
//   infiniteMode: boolean;
//   onKeywordChange: (position: keyof typeof keywords, value: string) => void;
//   service: string;
// }) => {
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [keywordInputs, setKeywordInputs] = useState(keywords);
//   const [showControls, setShowControls] = useState(true);
//   const intervalRef = useRef<NodeJS.Timeout | null>(null);
//   const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

//   // Filter posts based on keywords
//   const filteredPosts = useMemo(() => {
//     if (!keywords.topLeft && !keywords.topRight && !keywords.bottomLeft && !keywords.bottomRight) {
//       return posts;
//     }

//     return posts.filter(post => {
//       const title = post.title.toLowerCase();
//       const content = post.content.toLowerCase();
//       const allText = `${title} ${content}`;

//       return (
//         (keywords.topLeft && allText.includes(keywords.topLeft.toLowerCase())) ||
//         (keywords.topRight && allText.includes(keywords.topRight.toLowerCase())) ||
//         (keywords.bottomLeft && allText.includes(keywords.bottomLeft.toLowerCase())) ||
//         (keywords.bottomRight && allText.includes(keywords.bottomRight.toLowerCase()))
//       );
//     });
//   }, [posts, keywords]);

//   // Get 4 posts for current display
//   const getDisplayPosts = () => {
//     const result = [];
//     const startIndex = currentIndex * 4;
    
//     for (let i = 0; i < 4; i++) {
//       const index = (startIndex + i) % filteredPosts.length;
//       result.push(filteredPosts[index]);
//     }
    
//     return result;
//   };

//   const displayPosts = getDisplayPosts();

//   // Auto-advance slideshow
//   useEffect(() => {
//     if (isPlaying) {
//       intervalRef.current = setInterval(() => {
//         setCurrentIndex(prev => {
//           const maxIndex = Math.ceil(filteredPosts.length / 4) - 1;
//           if (infiniteMode && prev >= maxIndex) {
//             return 0;
//           }
//           return prev < maxIndex ? prev + 1 : prev;
//         });
//       }, 3000);
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
//   }, [isPlaying, filteredPosts.length, infiniteMode]);

//   // Handle mouse movement for controls
//   const handleMouseMove = () => {
//     setShowControls(true);
//     if (controlsTimeoutRef.current) {
//       clearTimeout(controlsTimeoutRef.current);
//     }
//     controlsTimeoutRef.current = setTimeout(() => {
//       setShowControls(false);
//     }, 3000);
//   };

//   const handleKeywordInputChange = (position: keyof typeof keywords, value: string) => {
//     setKeywordInputs(prev => ({ ...prev, [position]: value }));
//   };

//   const handleKeywordSubmit = (position: keyof typeof keywords) => {
//     onKeywordChange(position, keywordInputs[position]);
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
//                   const position = ['topLeft', 'topRight', 'bottomLeft', 'bottomRight'][index] as keyof typeof keywords;
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
                      
//                       {/* Keyword Input Overlay */}
//                       <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-2">
//                         <div className="flex items-center gap-2">
//                           <input
//                             type="text"
//                             value={keywordInputs[position]}
//                             onChange={(e) => handleKeywordInputChange(position, e.target.value)}
//                             placeholder={`Keywords for ${position.replace(/([A-Z])/g, ' $1').toLowerCase()}`}
//                             className="flex-1 px-2 py-1 bg-black/70 text-white text-xs rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
//                             onClick={(e) => e.stopPropagation()}
//                           />
//                           <button
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               handleKeywordSubmit(position);
//                             }}
//                             className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
//                           >
//                             <Save size={12} />
//                           </button>
//                         </div>
//                         <p className="text-white text-xs mt-1 truncate">{post.title}</p>
//                       </div>
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
//       <div className={`absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-4 transition-opacity duration-300 ${
//         showControls ? 'opacity-100' : 'opacity-0'
//       }`}>
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
//                     const maxIndex = Math.ceil(filteredPosts.length / 4) - 1;
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
//                   onChange={() => {}}
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
//       <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
//         showControls ? 'opacity-100' : 'opacity-0'
//       }`}>
//         <div className="max-w-4xl mx-auto">
//           <div className="w-full bg-gray-700 rounded-full h-2">
//             <div
//               className="bg-blue-500 h-2 rounded-full transition-all duration-1000 ease-linear"
//               style={{ 
//                 width: `${((currentIndex + 1) / Math.ceil(filteredPosts.length / 4)) * 100}%` 
//               }}
//             />
//           </div>
//           <p className="text-white text-sm mt-2 text-center">
//             Set {currentIndex + 1} / {Math.ceil(filteredPosts.length / 4)} • {filteredPosts.length} posts
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// // --- IMMERSIVE POST VIEWER ---
// const ImmersivePostViewer = ({ 
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

//   const mediaUrl = post ? (post.file ? getMediaUrl(post.file.path, service) : 
//     post.attachments.length > 0 ? getMediaUrl(post.attachments[0].path, service) : null) : null;

//   const isVideo = post?.file?.name?.includes('.mp4') || 
//                   post?.file?.name?.includes('.mov') || 
//                   post?.file?.name?.includes('.avi') || 
//                   post?.file?.name?.includes('.webm') ||
//                   post?.attachments?.some(att => 
//                     att.name?.includes('.mp4') || 
//                     att.name?.includes('.mov') || 
//                     att.name?.includes('.avi') || 
//                     att.name?.includes('.webm')
//                   );

//   const handleLike = () => {
//     setIsLiked(!isLiked);
//     setLikes(prev => isLiked ? prev - 1 : prev + 1);
//   };

//   const handleBookmark = () => {
//     setIsBookmarked(!isBookmarked);
//     toast(isBookmarked ? 'Removed from bookmarks' : 'Added to bookmarks');
//   };

//   const handleShare = async () => {
//     if (post && mediaUrl) {
//       try {
//         await navigator.clipboard.writeText(mediaUrl);
//         setCopied(true);
//         setTimeout(() => setCopied(false), 2000);
//         toast('Link copied to clipboard');
//       } catch (err) {
//         console.error('Failed to copy link:', err);
//       }
//     }
//   };

//   const handleDownload = async () => {
//     if (!post || !mediaUrl) return;
    
//     const downloadService = DownloadService.getInstance();
//     const dir = await downloadService.selectDownloadDirectory();
//     if (!dir) return;
    
//     const fileName = `${post.id}.${post.file?.name?.split('.').pop() || 'jpg'}`;
//     const filePath = `${dir}/${fileName}`;
    
//     try {
//       await downloadService.downloadFile(mediaUrl, filePath);
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
//           if (hasPrevious) onPrevious();
//           break;
//         case 'ArrowRight':
//           if (hasNext) onNext();
//           break;
//         case ' ':
//           e.preventDefault();
//           setIsPlaying(!isPlaying);
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
//   }, [onClose, onPrevious, onNext, hasPrevious, hasNext, isFullscreen, isPlaying, showInfo, isLiked]);

//   if (!post) return null;

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
//         <div className={`absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/70 to-transparent p-4 transition-opacity duration-300 ${
//           showControls ? 'opacity-100' : 'opacity-0'
//         }`}>
//           <div className="flex justify-between items-center">
//             <div className="flex items-center gap-3 text-white">
//               <span className="text-sm bg-black/50 px-2 py-1 rounded backdrop-blur-sm">
//                 {currentIndex + 1} / {totalCount}
//               </span>
//               <span className="text-sm">{post.service}</span>
//             </div>
//             <div className="flex items-center gap-2">
//               <button
//                 onClick={handleLike}
//                 className={`p-2 rounded-full transition-colors ${
//                   isLiked ? 'bg-red-500 text-white' : 'bg-black/50 text-white hover:bg-black/70'
//                 }`}
//               >
//                 <Heart size={18} fill={isLiked ? 'white' : 'none'} />
//               </button>
//               <button
//                 onClick={handleBookmark}
//                 className={`p-2 rounded-full transition-colors ${
//                   isBookmarked ? 'bg-blue-500 text-white' : 'bg-black/50 text-white hover:bg-black/70'
//                 }`}
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
//         {hasPrevious && (
//           <button
//             onClick={onPrevious}
//             className="absolute left-4 top-1/2 -translate-y-1/2 z-40 p-3 text-white bg-black/50 rounded-full hover:bg-black/70 transition-all backdrop-blur-sm hover:scale-110"
//           >
//             <ChevronLeft size={28} />
//           </button>
//         )}

//         {hasNext && (
//           <button
//             onClick={onNext}
//             className="absolute right-4 top-1/2 -translate-y-1/2 z-40 p-3 text-white bg-black/50 rounded-full hover:bg-black/70 transition-all backdrop-blur-sm hover:scale-110"
//           >
//             <ChevronRight size={28} />
//           </button>
//         )}

//         {/* Main Image Area */}
//         <div className="flex-grow flex items-center justify-center bg-black relative overflow-hidden">
//           {mediaUrl ? (
//             <div 
//               className="relative w-full h-full flex items-center justify-center"
//               style={{
//                 transform: `scale(${zoomLevel}) rotate(${rotation}deg) translate(${dragOffset.x}px, ${dragOffset.y}px)`,
//                 transition: isDragging ? 'none' : 'transform 0.3s ease'
//               }}
//             >
//               {isVideo ? (
//                 <video
//                   src={mediaUrl}
//                   className="max-w-full max-h-full object-contain"
//                   controls={false}
//                   autoPlay={isPlaying}
//                   loop
//                   muted
//                   onClick={(e) => e.stopPropagation()}
//                 />
//               ) : (
//                 <OptimizedImage
//                   src={mediaUrl}
//                   alt={post.title}
//                   className="max-w-full max-h-full object-contain"
//                   priority={true}
//                 />
//               )}
//             </div>
//           ) : (
//             <div className="text-center">
//               <ImageOff className="h-12 w-12 text-gray-500 mx-auto mb-2" />
//               <p className="text-gray-400">No media available</p>
//             </div>
//           )}
//         </div>

//         {/* Bottom Controls */}
//         <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 transition-opacity duration-300 ${
//           showControls ? 'opacity-100' : 'opacity-0'
//         }`}>
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-2">
//               <button
//                 onClick={onPrevious}
//                 className="p-2 text-white hover:bg-white/20 rounded-full"
//               >
//                 <ChevronLeft size={20} />
//               </button>
//               <button
//                 onClick={() => setIsPlaying(!isPlaying)}
//                 className="p-2 text-white hover:bg-white/20 rounded-full"
//               >
//                 {isPlaying ? <Pause size={20} /> : <Play size={20} />}
//               </button>
//               <button
//                 onClick={onNext}
//                 className="p-2 text-white hover:bg-white/20 rounded-full"
//               >
//                 <ChevronRight size={20} />
//               </button>
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
//                   onClick={() => {}} // Would navigate to that index
//                   className={`w-2 h-2 rounded-full transition-all duration-200 ${
//                     index === currentIndex ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/70'
//                   }`}
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
//   const [movieModeKeywords, setMovieModeKeywords] = useState({
//     topLeft: '',
//     topRight: '',
//     bottomLeft: '',
//     bottomRight: '',
//   });
//   const [movieModeInfinite, setMovieModeInfinite] = useState(true);
//   const [currentPage, setCurrentPage] = useState(0);
//   const [hasMorePosts, setHasMorePosts] = useState(false);
//   const [downloads, setDownloads] = useState<Array<{
//     id: string;
//     post: Post;
//     status: 'pending' | 'downloading' | 'completed' | 'error';
//     progress: number;
//     filePath?: string;
//     error?: string;
//   }>>([]);
//   const [downloadManagerOpen, setDownloadManagerOpen] = useState(false);
//   const [isFollowing, setIsFollowing] = useState(false);
//   const [followers, setFollowers] = useState(Math.floor(Math.random() * 10000) + 1000);
//   const [isLiked, setIsLiked] = useState(false);
//   const [likes, setLikes] = useState(Math.floor(Math.random() * 1000) + 100);

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
        
//         // Fetch posts
//         const postsResponse = await axios.get<Post[]>(
//           `${COOMER_POSTS_API_BASE_URL}/${creator.service}/user/${creator.id}/posts?o=0`,
//           { headers: isCoomer ? { 'Accept': 'text/css' } : {} }
//         );
        
//         const transformedPosts: Post[] = postsResponse.data.map((post: any) => ({
//           id: post.id,
//           user: post.user || creator.id,
//           service: creator.service,
//           title: post.title || 'Untitled',
//           content: post.content || '',
//           published: post.published,
//           file: post.file,
//           attachments: post.attachments || []
//         }));
        
//         setPosts(transformedPosts);
//         setHasMorePosts(transformedPosts.length === POSTS_PER_PAGE && profileResponse.data.post_count > POSTS_PER_PAGE);
//       } catch (error: any) {
//         console.error('Failed to fetch data:', error);
//         toast.error('Failed to load creator data');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [creator]);

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
//     const dir = await downloadService.selectDownloadDirectory();
//     if (!dir) return;
    
//     const selectedPostsList = filteredPosts.filter(post => selectedPosts.has(post.id));
    
//     selectedPostsList.forEach(async (post, index) => {
//       try {
//         const url = COOMER_SERVICES.includes(post.service) 
//           ? `https://coomer.st${post.file?.path || ''}`
//           : `https://kemono.su${post.file?.path || ''}`;
        
//         const fileName = `${post.id}.${post.file?.name?.split('.').pop() || 'jpg'}`;
//         const filePath = `${dir}/${fileName}`;
        
//         await downloadService.downloadFile(url, filePath);
        
//         toast.success(`Downloaded: ${fileName}`);
//       } catch (error) {
//         console.error('Download error:', error);
//         toast.error(`Failed to download: ${post.title}`);
//       }
//     });
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

//   const handleMovieModeKeywordChange = (position: keyof typeof movieModeKeywords, value: string) => {
//     setMovieModeKeywords(prev => ({ ...prev, [position]: value }));
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
//                   className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
//                     isFollowing 
//                       ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white' 
//                       : 'bg-blue-500 text-white hover:bg-blue-600'
//                   }`}
//                 >
//                   {isFollowing ? 'Following' : 'Follow'}
//                 </button>
                
//                 <button
//                   onClick={handleLike}
//                   className={`p-2 rounded-full transition-colors ${
//                     isLiked 
//                       ? 'bg-red-500 text-white' 
//                       : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-red-500 hover:text-white'
//                   }`}
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
//                       onPostClick={() => handlePostClick}
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

//       {/* Immersive Post Viewer */}
//       {isPostViewerOpen && selectedPost && (
//         <ImmersivePostViewer
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
//           keywords={movieModeKeywords}
//           infiniteMode={movieModeInfinite}
//           onKeywordChange={handleMovieModeKeywordChange}
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
//     if (!searchTerm.trim()) return creators;
//     return creators.filter(creator =>
//       creator.name.toLowerCase().includes(searchTerm.toLowerCase())
//     );
//   }, [creators, searchTerm]);

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

//     imageCache.preloadImages(imageUrls);
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
//               {totalCreators > 0 && `${creators.length}/${totalCreators} creators`}
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
//               {searchTerm || selectedService !== 'all' ? 'No creators found matching your search or filter.' : 'No creators available.'}
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
  Eye, Settings, Sliders, MousePointer, Monitor, Smartphone, Tablet,
  Tv, Film, Power, FolderOpen, HardDrive, Package, Zap, Image as ImageIcon,
  Wifi, WifiOff, PauseCircle, PlayCircle, Maximize2, Minimize2, Volume2, VolumeX,
  Copy, Check, Info, ThumbsUp, ThumbsDown, Send, Smile, ChevronDown, ArrowUp,
  Sparkles, Flame, TrendingUp, Clock, Calendar, User, Users, Hash, AtSign,
  Camera, Layers, Aperture, Focus, Grid3X3, List, LayoutGrid, LayoutList,
  Filter as FilterIcon, SortAsc, SortDesc, DownloadCloud, Share, Link2,
  ExternalLink, HeartHandshake, Star, Award, Trophy, Crown, Gem, Database,
  Cloud, CloudOff, Sync, Save, Trash2, Archive, Image as ImageIcon2,
  Layers3, Grid3x3 as GridIcon, Grid4x4, Grid5x5, Grid6x6, Grid7x7, Grid8x8,
  Image as ImageIcon3, Image as ImageIcon4, Image as ImageIcon5, Image as ImageIcon6,
  Image as ImageIcon7, Image as ImageIcon8, Image as ImageIcon9, Image as ImageIcon10,
  Image as ImageIcon11, Image as ImageIcon12, Image as ImageIcon13, Image as ImageIcon14,
  Image as ImageIcon15, Image as ImageIcon16, Image as ImageIcon17, Image as ImageIcon18,
  Image as ImageIcon19, Image as ImageIcon20, Image as ImageIcon21, Image as ImageIcon22,
  Image as ImageIcon23, Image as ImageIcon24, Image as ImageIcon25, Image as ImageIcon26,
  Image as ImageIcon27, Image as ImageIcon28, Image as ImageIcon29, Image as ImageIcon30,
  Image as ImageIcon31, Image as ImageIcon32, Image as ImageIcon33, Image as ImageIcon34,
  Image as ImageIcon35, Image as ImageIcon36, Image as ImageIcon37, Image as ImageIcon38,
  Image as ImageIcon39, Image as ImageIcon40, Image as ImageIcon41, Image as ImageIcon42,
  Image as ImageIcon43, Image as ImageIcon44, Image as ImageIcon45, Image as ImageIcon46,
  Image as ImageIcon47, Image as ImageIcon48, Image as ImageIcon49, Image as ImageIcon50,
  Image as ImageIcon51, Image as ImageIcon52, Image as ImageIcon53, Image as ImageIcon54,
  Image as ImageIcon55, Image as ImageIcon56, Image as ImageIcon57, Image as ImageIcon58,
  Image as ImageIcon59, Image as ImageIcon60, Image as ImageIcon61, Image as ImageIcon62,
  Image as ImageIcon63, Image as ImageIcon64, Image as ImageIcon65, Image as ImageIcon66,
  Image as ImageIcon67, Image as ImageIcon68, Image as ImageIcon69, Image as ImageIcon70,
  Image as ImageIcon71, Image as ImageIcon72, Image as ImageIcon73, Image as ImageIcon74,
  Image as ImageIcon75, Image as ImageIcon76, Image as ImageIcon77, Image as ImageIcon78,
  Image as ImageIcon79, Image as ImageIcon80, Image as ImageIcon81, Image as ImageIcon82,
  Image as ImageIcon83, Image as ImageIcon84, Image as ImageIcon85, Image as ImageIcon86,
  Image as ImageIcon87, Image as ImageIcon88, Image as ImageIcon89, Image as ImageIcon90,
  Image as ImageIcon91, Image as ImageIcon92, Image as ImageIcon93, Image as ImageIcon94,
  Image as ImageIcon95, Image as ImageIcon96, Image as ImageIcon97, Image as ImageIcon98,
  Image as ImageIcon99, Image as ImageIcon100, Image as ImageIcon101, Image as ImageIcon102,
  Image as ImageIcon103, Image as ImageIcon104, Image as ImageIcon105, Image as ImageIcon106,
  Image as ImageIcon107, Image as ImageIcon108, Image as ImageIcon109, Image as ImageIcon110,
  Image as ImageIcon111, Image as ImageIcon112, Image as ImageIcon113, Image as ImageIcon114,
  Image as ImageIcon115, Image as ImageIcon116, Image as ImageIcon117, Image as ImageIcon118,
  Image as ImageIcon119, Image as ImageIcon120, Image as ImageIcon121, Image as ImageIcon122,
  Image as ImageIcon123, Image as ImageIcon124, Image as ImageIcon125, Image as ImageIcon126,
  Image as ImageIcon127, Image as ImageIcon128, Image as ImageIcon129, Image as ImageIcon130,
  Image as ImageIcon131, Image as ImageIcon132, Image as ImageIcon133, Image as ImageIcon134,
  Image as ImageIcon135, Image as ImageIcon136, Image as ImageIcon137, Image as ImageIcon138,
  Image as ImageIcon139, Image as ImageIcon140, Image as ImageIcon141, Image as ImageIcon142,
  Image as ImageIcon143, Image as ImageIcon144, Image as ImageIcon145, Image as ImageIcon146,
  Image as ImageIcon147, Image as ImageIcon148, Image as ImageIcon149, Image as ImageIcon150,
  Image as ImageIcon151, Image as ImageIcon152, Image as ImageIcon153, Image as ImageIcon154,
  Image as ImageIcon155, Image as ImageIcon156, Image as ImageIcon157, Image as ImageIcon158,
  Image as ImageIcon159, Image as ImageIcon160, Image as ImageIcon161, Image as ImageIcon162,
  Image as ImageIcon163, Image as ImageIcon164, Image as ImageIcon165, Image as ImageIcon166,
  Image as ImageIcon167, Image as ImageIcon168, Image as ImageIcon169, Image as ImageIcon170,
  Image as ImageIcon171, Image as ImageIcon172, Image as ImageIcon173, Image as ImageIcon174,
  Image as ImageIcon175, Image as ImageIcon176, Image as ImageIcon177, Image as ImageIcon178,
  Image as ImageIcon179, Image as ImageIcon180, Image as ImageIcon181, Image as ImageIcon182,
  Image as ImageIcon183, Image as ImageIcon184, Image as ImageIcon185, Image as ImageIcon186,
  Image as ImageIcon187, Image as ImageIcon188, Image as ImageIcon189, Image as ImageIcon190,
  Image as ImageIcon191, Image as ImageIcon192, Image as ImageIcon193, Image as ImageIcon194,
  Image as ImageIcon195, Image as ImageIcon196, Image as ImageIcon197, Image as ImageIcon198,
  Image as ImageIcon199, Image as ImageIcon200,
  CloudDownload
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
    base: 'creatorhub:',
    dbName: 'creatorhub-db',
    storeName: 'creatorhub-store'
  })
});

const CACHE_TIMESTAMP_KEY = 'creatorhub:timestamp';
const CACHE_VERSION_KEY = 'creatorhub:version';
const CACHE_VERSION = '3.0';
const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

// --- API SETTINGS ---
const COOMER_API_BASE_URL = 'https://kemono-api.mbaharip.com/coomer';
const KEMONO_API_BASE_URL = 'https://kemono-api.mbaharip.com/kemono';
const COOMER_POSTS_API_BASE_URL = 'https://coomer.st/api/v1';
const KEMONO_POSTS_API_BASE_URL = 'https://kemono.su/api/v1';
const ITEMS_PER_PAGE = 50; // Increased for better performance
const POSTS_PER_PAGE = 30; // Increased for better performance

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
      getTempPath: () => string;
      getUserPath: () => string;
    };
  }
}

// --- DOWNLOAD SERVICE ---
class DownloadService {
  private static instance: DownloadService;
  
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
    onProgress?: (progress: number) => void
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

  async openFileLocation(filePath: string): Promise<void> {
    try {
      if (window.electronAPI) {
        await window.electronAPI.openPath(filePath);
      } else {
        window.open(`file://${filePath}`, '_blank');
      }
    } catch (error) {
      console.error('Error opening file location:', error);
      toast.error('Failed to open file location');
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

// --- ADVANCED IMAGE CACHE SYSTEM ---
class AdvancedImageCache {
  private cache = new Map<string, { url: string; timestamp: number; size: number }>();
  private loadingPromises = new Map<string, Promise<string>>();
  private maxCacheSize = 500; // Increased cache size
  private maxCacheSizeBytes = 500 * 1024 * 1024; // 500MB
  private cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours
  private currentCacheSize = 0;

  async getImage(originalUrl: string): Promise<string> {
    // Check if already cached
    if (this.cache.has(originalUrl)) {
      const cached = this.cache.get(originalUrl)!;
      if (Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.url;
      } else {
        // Remove expired entry
        URL.revokeObjectURL(cached.url);
        this.cache.delete(originalUrl);
        this.currentCacheSize -= cached.size;
      }
    }

    // Check if already loading
    if (this.loadingPromises.has(originalUrl)) {
      return this.loadingPromises.get(originalUrl)!;
    }

    // Create loading promise
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
      // Get image size first
      const headResponse = await fetch(originalUrl, { method: 'HEAD' });
      const contentLength = parseInt(headResponse.headers.get('content-length') || '0');
      
      // Check if we have space in cache
      if (this.currentCacheSize + contentLength > this.maxCacheSizeBytes) {
        this.cleanupCache();
      }
      
      const response = await fetch(originalUrl);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      
      // Add to cache
      this.cache.set(originalUrl, { url: objectUrl, timestamp: Date.now(), size: contentLength });
      this.currentCacheSize += contentLength;
      
      // Clean up old cache entries if needed
      if (this.cache.size > this.maxCacheSize) {
        this.cleanupCache();
      }
      
      return objectUrl;
    } catch (error) {
      console.error('Failed to load image:', error);
      return originalUrl; // Return original URL as fallback
    }
  }

  private cleanupCache(): void {
    // Sort by timestamp (oldest first)
    const entries = Array.from(this.cache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    // Remove oldest 25% of entries
    const toRemove = Math.floor(entries.length * 0.25);
    for (let i = 0; i < toRemove; i++) {
      const [url, data] = entries[i];
      URL.revokeObjectURL(data.url);
      this.cache.delete(url);
      this.currentCacheSize -= data.size;
    }
  }

  preloadImages(urls: string[]): void {
    // Preload images in the background without blocking
    urls.forEach(url => {
      if (!this.cache.has(url) && !this.loadingPromises.has(url)) {
        this.getImage(url).catch(() => {
          // Silently fail preloading
        });
      }
    });
  }

  getCacheInfo(): { size: number; count: number; maxSize: number; maxSizeBytes: number } {
    return {
      size: this.currentCacheSize,
      count: this.cache.size,
      maxSize: this.maxCacheSize,
      maxSizeBytes: this.maxCacheSizeBytes
    };
  }

  clearCache(): void {
    // Clear all cached images
    for (const [url, data] of this.cache.entries()) {
      URL.revokeObjectURL(data.url);
    }
    this.cache.clear();
    this.currentCacheSize = 0;
  }
}

const advancedImageCache = new AdvancedImageCache();

// --- FAVORITES MANAGEMENT ---
class FavoritesManager {
  private static instance: FavoritesManager;
  private favorites: Set<string> = new Set();

  static getInstance(): FavoritesManager {
    if (!FavoritesManager.instance) {
      FavoritesManager.instance = new FavoritesManager();
    }
    return FavoritesManager.instance;
  }

  async loadFavorites(): Promise<void> {
    try {
      const stored = await storage.getItem('favorites') as string[];
      if (stored) {
        this.favorites = new Set(stored);
      }
    } catch (error) {
      console.error('Failed to load favorites:', error);
    }
  }

  async saveFavorites(): Promise<void> {
    try {
      await storage.setItem('favorites', Array.from(this.favorites));
    } catch (error) {
      console.error('Failed to save favorites:', error);
    }
  }

  addFavorite(id: string): void {
    this.favorites.add(id);
    this.saveFavorites();
  }

  removeFavorite(id: string): void {
    this.favorites.delete(id);
    this.saveFavorites();
  }

  isFavorite(id: string): boolean {
    return this.favorites.has(id);
  }

  getFavorites(): string[] {
    return Array.from(this.favorites);
  }
}

const favoritesManager = FavoritesManager.getInstance();

// --- OFFLINE SYNC MANAGER ---
class OfflineSyncManager {
  private static instance: OfflineSyncManager;
  private syncedCreators: Set<string> = new Set();
  private syncInProgress: Set<string> = new Set();

  static getInstance(): OfflineSyncManager {
    if (!OfflineSyncManager.instance) {
      OfflineSyncManager.instance = new OfflineSyncManager();
    }
    return OfflineSyncManager.instance;
  }

  async loadSyncedCreators(): Promise<void> {
    try {
      const stored = await storage.getItem('syncedCreators') as string[];
      if (stored) {
        this.syncedCreators = new Set(stored);
      }
    } catch (error) {
      console.error('Failed to load synced creators:', error);
    }
  }

  async saveSyncedCreators(): Promise<void> {
    try {
      await storage.setItem('syncedCreators', Array.from(this.syncedCreators));
    } catch (error) {
      console.error('Failed to save synced creators:', error);
    }
  }

  async syncCreator(creatorId: string, posts: Post[]): Promise<void> {
    if (this.syncInProgress.has(creatorId)) return;
    
    this.syncInProgress.add(creatorId);
    
    try {
      // Get temp directory
      let tempDir = '';
      if (window.electronAPI) {
        tempDir = window.electronAPI.getTempPath();
      } else {
        tempDir = '/tmp';
      }
      
      const creatorDir = `${tempDir}/creatorhub/${creatorId}`;
      await DownloadService.getInstance().ensureDirectoryExists(creatorDir);
      
      // Download all posts
      const downloadPromises = posts.map(async (post, index) => {
        try {
          if (post.file) {
            const url = COOMER_SERVICES.includes(post.service) 
              ? `https://coomer.st${post.file.path}`
              : `https://kemono.su${post.file.path}`;
            
            const fileName = `${post.id}_${index}.${post.file.name?.split('.').pop() || 'jpg'}`;
            const filePath = `${creatorDir}/${fileName}`;
            
            await DownloadService.getInstance().downloadFile(url, filePath);
          }
          
          // Download attachments
          if (post.attachments && post.attachments.length > 0) {
            for (let i = 0; i < post.attachments.length; i++) {
              const attachment = post.attachments[i];
              const url = COOMER_SERVICES.includes(post.service) 
                ? `https://coomer.st${attachment.path}`
                : `https://kemono.su${attachment.path}`;
              
              const fileName = `${post.id}_${index}_attachment_${i}.${attachment.name?.split('.').pop() || 'jpg'}`;
              const filePath = `${creatorDir}/${fileName}`;
              
              await DownloadService.getInstance().downloadFile(url, filePath);
            }
          }
        } catch (error) {
          console.error(`Failed to sync post ${post.id}:`, error);
        }
      });
      
      await Promise.all(downloadPromises);
      
      this.syncedCreators.add(creatorId);
      await this.saveSyncedCreators();
      
      toast.success(`Synced ${posts.length} posts for offline viewing`);
    } catch (error) {
      console.error(`Failed to sync creator ${creatorId}:`, error);
      toast.error(`Failed to sync creator: ${error}`);
    } finally {
      this.syncInProgress.delete(creatorId);
    }
  }

  isSynced(creatorId: string): boolean {
    return this.syncedCreators.has(creatorId);
  }

  getSyncedCreators(): string[] {
    return Array.from(this.syncedCreators);
  }
}

const offlineSyncManager = OfflineSyncManager.getInstance();

// --- PERFORMANCE-OPTIMIZED IMAGE COMPONENT ---
const OptimizedImage = React.memo(({ 
  src, 
  alt, 
  className, 
  onLoad, 
  onError,
  style,
  objectFit = 'cover',
  priority = false,
  onClick
}: { 
  src: string; 
  alt: string; 
  className?: string; 
  onLoad?: () => void; 
  onError?: () => void;
  style?: React.CSSProperties;
  objectFit?: 'cover' | 'contain' | 'fill';
  priority?: boolean;
  onClick?: () => void;
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

  // Intersection Observer for lazy loading
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
      { rootMargin: '200px' } // Start loading 200px before it comes into view
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
      <div className={`flex items-center justify-center bg-gray-200 dark:bg-gray-800 ${className}`} style={style} onClick={onClick}>
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
        onClick={onClick}
      />
    </>
  );
});

// --- GALLERY VIEWER COMPONENT ---
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
  const [showControls, setShowControls] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [copied, setCopied] = useState(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Get all images for this post
  const allImages = useMemo(() => {
    if (!post) return [];
    const images = [];
    
    if (post.file) {
      images.push({
        url: COOMER_SERVICES.includes(post.service) 
          ? `https://coomer.st${post.file.path}`
          : `https://kemono.su${post.file.path}`,
        name: post.file.name
      });
    }
    
    if (post.attachments && post.attachments.length > 0) {
      post.attachments.forEach(attachment => {
        images.push({
          url: COOMER_SERVICES.includes(post.service) 
            ? `https://coomer.st${attachment.path}`
            : `https://kemono.su${attachment.path}`,
          name: attachment.name
        });
      });
    }
    
    return images;
  }, [post]);

  const currentImage = allImages[currentImageIndex] || null;

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes(prev => isLiked ? prev - 1 : prev + 1);
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast(isBookmarked ? 'Removed from bookmarks' : 'Added to bookmarks');
  };

  const handleShare = async () => {
    if (currentImage) {
      try {
        await navigator.clipboard.writeText(currentImage.url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast('Link copied to clipboard');
      } catch (err) {
        console.error('Failed to copy link:', err);
      }
    }
  };

  const handleDownload = async () => {
    if (!currentImage) return;
    
    const downloadService = DownloadService.getInstance();
    const dir = await downloadService.selectDownloadDirectory();
    if (!dir) return;
    
    const fileName = currentImage.name || 'image.jpg';
    const filePath = `${dir}/${fileName}`;
    
    try {
      await downloadService.downloadFile(currentImage.url, filePath);
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

  const handleNextImage = () => {
    if (currentImageIndex < allImages.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const handlePreviousImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
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

  // Auto-hide controls
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

  // Keyboard shortcuts
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
          if (hasPrevious) onPrevious();
          else handlePreviousImage();
          break;
        case 'ArrowRight':
          if (hasNext) onNext();
          else handleNextImage();
          break;
        case ' ':
          e.preventDefault();
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
  }, [onClose, onPrevious, onNext, hasPrevious, hasNext, isFullscreen, showInfo, isLiked, currentImageIndex, allImages.length]);

  if (!post) return null;

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      <div 
        ref={containerRef}
        className={`relative w-full h-full flex flex-col ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={() => setShowControls(!showControls)}
      >
        {/* Top Controls */}
        <div className={`absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/70 to-transparent p-4 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3 text-white">
              <span className="text-sm bg-black/50 px-2 py-1 rounded backdrop-blur-sm">
                {currentImageIndex + 1} / {allImages.length}
              </span>
              <span className="text-sm">{post.service}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleLike}
                className={`p-2 rounded-full transition-colors ${
                  isLiked ? 'bg-red-500 text-white' : 'bg-black/50 text-white hover:bg-black/70'
                }`}
              >
                <Heart size={18} fill={isLiked ? 'white' : 'none'} />
              </button>
              <button
                onClick={handleBookmark}
                className={`p-2 rounded-full transition-colors ${
                  isBookmarked ? 'bg-blue-500 text-white' : 'bg-black/50 text-white hover:bg-black/70'
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

        {/* Navigation Arrows */}
        {hasPrevious && (
          <button
            onClick={onPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-40 p-3 text-white bg-black/50 rounded-full hover:bg-black/70 transition-all backdrop-blur-sm hover:scale-110"
          >
            <ChevronLeft size={28} />
          </button>
        )}

        {hasNext && (
          <button
            onClick={onNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-40 p-3 text-white bg-black/50 rounded-full hover:bg-black/70 transition-all backdrop-blur-sm hover:scale-110"
          >
            <ChevronRight size={28} />
          </button>
        )}

        {/* Image Navigation */}
        {allImages.length > 1 && (
          <div className="absolute top-1/2 left-0 right-0 transform -translate-y-1/2 flex justify-center items-center gap-2 z-40">
            <button
              onClick={handlePreviousImage}
              className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-all backdrop-blur-sm"
              disabled={currentImageIndex === 0}
            >
              <ChevronLeft size={16} />
            </button>
            <div className="flex items-center gap-1 bg-black/50 px-3 py-1 rounded-full">
              <span className="text-xs text-white">{currentImageIndex + 1} / {allImages.length}</span>
            </div>
            <button
              onClick={handleNextImage}
              className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-all backdrop-blur-sm"
              disabled={currentImageIndex === allImages.length - 1}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* Main Image Area */}
        <div className="flex-grow flex items-center justify-center bg-black relative overflow-hidden">
          {currentImage ? (
            <div 
              className="relative w-full h-full flex items-center justify-center"
              style={{
                transform: `scale(${zoomLevel}) rotate(${rotation}deg) translate(${dragOffset.x}px, ${dragOffset.y}px)`,
                transition: isDragging ? 'none' : 'transform 0.3s ease'
              }}
            >
              <OptimizedImage
                src={currentImage.url}
                alt={currentImage.name}
                className="max-w-full max-h-full object-contain"
                priority={true}
              />
            </div>
          ) : (
            <div className="text-center">
              <ImageOff className="h-12 w-12 text-gray-500 mx-auto mb-2" />
              <p className="text-gray-400">No media available</p>
            </div>
          )}
        </div>

        {/* Bottom Controls */}
        <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}>
          <div className="flex items-center justify-between">
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
            
            <div className="flex items-center gap-2">
              <span className="text-white text-sm">{post.title}</span>
            </div>
          </div>
        </div>

        {/* Info Panel */}
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

// --- MOVIE MODE COMPONENT ---
const MovieMode = ({
  posts,
  onClose,
  service
}: {
  posts: Post[];
  onClose: () => void;
  service: string;
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get 4 posts for current display
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

  // Auto-advance slideshow
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex(prev => {
          const maxIndex = Math.ceil(posts.length / 4) - 1;
          return prev < maxIndex ? prev + 1 : 0;
        });
      }, 4000); // Change every 4 seconds
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
  }, [isPlaying, posts.length]);

  // Handle mouse movement for controls
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

  const getPostImageUrl = (post: Post) => {
    if (post.file) {
      const baseUrl = COOMER_SERVICES.includes(service) ? 'https://coomer.st' : 'https://kemono.su';
      return `${baseUrl}${post.file.path}`;
    }
    if (post.attachments && post.attachments.length > 0) {
      const baseUrl = COOMER_SERVICES.includes(service) ? 'https://coomer.st' : 'https://kemono.su';
      return `${baseUrl}${post.attachments[0].path}`;
    }
    return null;
  };

  return (
    <div 
      className="fixed inset-0 bg-black z-50 flex items-center justify-center"
      onClick={onClose}
      onMouseMove={handleMouseMove}
    >
      {/* TV Frame Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        {/* TV Frame Border */}
        <div className="absolute inset-8 border-8 border-gray-700 rounded-3xl shadow-2xl">
          {/* TV Screen Bezel */}
          <div className="absolute inset-4 border-4 border-gray-600 rounded-2xl">
            {/* TV Screen */}
            <div className="absolute inset-2 bg-black rounded-xl overflow-hidden">
              {/* 2x2 Grid Container */}
              <div className="grid grid-cols-2 grid-rows-2 gap-1 h-full">
                {displayPosts.map((post, index) => {
                  const imageUrl = getPostImageUrl(post);
                  return (
                    <div key={index} className="relative bg-gray-900 overflow-hidden">
                      {imageUrl ? (
                        <OptimizedImage
                          src={imageUrl}
                          alt={`Movie mode post ${index + 1}`}
                          className="w-full h-full"
                          objectFit="cover"
                        />
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
        
        {/* TV Brand Logo */}
        <div className="absolute top-12 left-1/2 transform -translate-x-1/2 text-gray-600 text-2xl font-bold">
          CREATOR TV
        </div>
        
        {/* TV Power Button */}
        <div className="absolute bottom-12 right-12 w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center shadow-lg">
          <Power size={24} className="text-gray-500" />
        </div>
      </div>

      {/* Controls Overlay */}
      <div className={`absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-4 transition-opacity duration-300 ${
        showControls ? 'opacity-100' : 'opacity-0'
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

      {/* Progress Bar */}
      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
        showControls ? 'opacity-100' : 'opacity-0'
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

// --- COMPACT CREATOR CARD ---
const CompactCreatorCard = React.memo(({ 
  creator, 
  onClick 
}: { 
  creator: Creator; 
  onClick: () => void;
}) => {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(creator.favorited);

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

  const getServiceColor = () => {
    if (COOMER_SERVICES.includes(creator.service)) {
      return 'from-purple-500 to-pink-500';
    } else {
      return 'from-blue-500 to-cyan-500';
    }
  };

  return (
    <div 
      className="relative aspect-square overflow-hidden rounded-xl cursor-pointer group transform transition-all duration-300 hover:scale-105"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background gradient based on service */}
      <div className={`absolute inset-0 bg-gradient-to-br ${getServiceColor()} opacity-80`} />
      
      {/* Creator image */}
      <div className="absolute inset-0 p-2">
        {!imageError ? (
          <OptimizedImage
            src={getCreatorImageUrl()}
            alt={creator.name}
            className="w-full h-full object-cover rounded-lg"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gray-800 rounded-lg flex items-center justify-center">
            <User size={24} className="text-gray-600" />
          </div>
        )}
      </div>
      
      {/* Overlay with info */}
      <div className={`absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent p-3 flex flex-col justify-between transition-opacity duration-300 ${
        isHovered ? 'opacity-100' : 'opacity-0'
      }`}>
        <div className="flex justify-end">
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
  );
});

// --- COMPACT POST GRID ---
const CompactPostGrid = React.memo(({ 
  posts, 
  onPostClick, 
  service,
  selectedPosts,
  showSelection,
  gridColumns = 4
}: {
  posts: Post[];
  onPostClick: (post: Post) => void;
  service: string;
  selectedPosts: Set<string>;
  showSelection: boolean;
  gridColumns?: number;
}) => {
  const [hoveredPost, setHoveredPost] = useState<Post | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hoverPreviewEnabled, setHoverPreviewEnabled] = useState(false);

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

  const getPostImageUrl = (post: Post) => {
    if (post.file) {
      const baseUrl = COOMER_SERVICES.includes(post.service) ? 'https://coomer.st' : 'https://kemono.su';
      return `${baseUrl}${post.file.path}`;
    }
    if (post.attachments && post.attachments.length > 0) {
      const baseUrl = COOMER_SERVICES.includes(post.service) ? 'https://coomer.st' : 'https://kemono.su';
      return `${baseUrl}${post.attachments[0].path}`;
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
        {posts.map((post) => {
          const imageUrl = getPostImageUrl(post);
          const isSelected = selectedPosts.has(post.id);
          const hasVideo = isVideo(post.file?.name || post.attachments?.[0]?.name);
          const hasMultiple = post.attachments && post.attachments.length > 0;
          const hasGallery = post.attachments && post.attachments.length > 1;
          
          return (
            <div
              key={post.id}
              className={`relative aspect-square overflow-hidden rounded-lg cursor-pointer group transform transition-all duration-300 hover:scale-105 ${
                showSelection && isSelected ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => onPostClick(post)}
              onMouseEnter={() => setHoveredPost(post)}
              onMouseLeave={() => setHoveredPost(null)}
            >
              {/* Selection checkbox */}
              {showSelection && (
                <div className="absolute top-2 left-2 z-10">
                  <div className={`w-5 h-5 rounded-full border-2 border-white flex items-center justify-center ${
                    isSelected ? 'bg-blue-500' : 'bg-black/50'
                  }`}>
                    {isSelected && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
              )}
              
              {/* Media indicators */}
              {hasVideo && (
                <div className="absolute top-2 right-2 z-10 bg-black/50 rounded-full p-1">
                  <PlayCircle size={12} className="text-white" />
                </div>
              )}
              
              {hasMultiple && (
                <div className="absolute top-2 right-2 z-10 bg-black/50 rounded-full p-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Open gallery viewer
                    }}
                    className="w-full h-full flex items-center justify-center text-white"
                  >
                    <Layers3 size={12} />
                  </button>
                </div>
              )}
              
              {/* Image */}
              {imageUrl ? (
                <OptimizedImage
                  src={imageUrl}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                  <ImageOff size={24} className="text-gray-600" />
                </div>
              )}
              
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-2">
                  <p className="text-white text-xs font-medium truncate">{post.title}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
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
      <OptimizedImage
        src={mediaUrl}
        alt={`Preview of ${post.id}`}
        className="w-full h-full"
        objectFit="cover"
      />
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
}

// --- CACHE MANAGER COMPONENT ---
const CacheManager = ({ 
  isOpen, 
  setIsOpen,
  cacheInfo,
  onClearCache
}: { 
  isOpen: boolean; 
  setIsOpen: (open: boolean) => void;
  cacheInfo: { size: number; count: number; maxSize: number; maxSizeBytes: number };
  onClearCache: () => void;
}) => {
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const mb = k * 1024;
    const gb = mb * 1024;
    
    if (bytes < k) return bytes + ' B';
    if (bytes < mb) return (bytes / k).toFixed(2) + ' KB';
    if (bytes < gb) return (bytes / mb).toFixed(2) + ' MB';
    return (bytes / gb).toFixed(2) + ' GB';
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      >
        <HardDrive size={16} />
        <span className="text-sm">Cache</span>
        <ChevronDown size={14} className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 w-80 bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 z-50">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Cache Management</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-gray-600 dark:text-gray-400">Size</span>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {formatBytes(cacheInfo.size)} / {formatBytes(cacheInfo.maxSizeBytes)}
              </span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-gray-600 dark:text-gray-400">Images</span>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{cacheInfo.count}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full"
                style={{ width: `${Math.min(100, (cacheInfo.size / cacheInfo.maxSizeBytes) * 100)}%` }}
              />
            </div>
            
            <button
              onClick={onClearCache}
              className="w-full px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
            >
              Clear Cache
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// --- FAVORITES GALLERY COMPONENT ---
const FavoritesGallery = ({ 
  isOpen, 
  onClose 
}: { 
  isOpen: boolean; 
  onClose: () => void;
}) => {
  const [favorites, setFavorites] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [gridColumns, setGridColumns] = useState(6);

  useEffect(() => {
    if (isOpen) {
      loadFavorites();
    }
  }, [isOpen]);

  const loadFavorites = async () => {
    setLoading(true);
    try {
      // In a real app, you would load favorites from IndexedDB
      // For this example, we'll use a mock implementation
      const stored = localStorage.getItem('favoritesGallery');
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? 'block' : 'hidden'}`}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-0 bg-white dark:bg-gray-900 text-white overflow-hidden flex flex-col">
        <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
          <h2 className="text-lg font-bold">Favorites Gallery</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            <X size={16} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : favorites.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <Heart className="w-16 h-16 text-gray-400 mb-4" />
              <p className="text-gray-400">No favorites yet</p>
              <p className="text-sm text-gray-500">Start adding creators to your favorites to see them here</p>
            </div>
          ) : (
            <div 
              className="grid gap-2"
              style={{ gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))` }}
            >
              {favorites.map((post, index) => (
                <div key={index} className="relative aspect-square overflow-hidden rounded-lg cursor-pointer group transform transition-all duration-300 hover:scale-105">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 opacity-80" />
                  
                  <div className="absolute inset-0 p-2">
                    <OptimizedImage
                      src={post.file ? 
                        (COOMER_SERVICES.includes(post.service) 
                          ? `https://coomer.st${post.file.path}`
                          : `https://kemono.su${post.file.path}`)
                        : post.attachments.length > 0 
                          ? `https://kemono.su${post.attachments[0].path}`
                          : ''
                      }
                      alt={post.title}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-2">
                      <p className="text-white text-xs font-medium truncate">{post.title}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
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
  const [gridColumns, setGridColumns] = useState(6);
  const [hoverPreviewEnabled, setHoverPreviewEnabled] = useState(false);
  const [cacheManagerOpen, setCacheManagerOpen] = useState(false);
  const [favoritesGalleryOpen, setFavoritesGalleryOpen] = useState(false);
  const [movieModeActive, setMovieModeActive] = useState(false);
  const [selectedCreatorForMovie, setSelectedCreatorForMovie] = useState<Creator | null>(null);
  const [postsForMovie, setPostsForMovie] = useState<Post[]>([]);
  const [cacheInfo, setCacheInfo] = useState({ size: 0, count: 0, maxSize: 0, maxSizeBytes: 0 });

  // Load cache info
  useEffect(() => {
    setCacheInfo(advancedImageCache.getCacheInfo());
  }, []);

  // Load favorites on mount
  useEffect(() => {
    favoritesManager.loadFavorites();
    offlineSyncManager.loadSyncedCreators();
  }, []);

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

  const loadMoreCreators = useCallback(() => {
    if (!hasMore || loading) return;
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchCreators(nextPage);
  }, [currentPage, hasMore, loading, fetchCreators]);

  useEffect(() => {
    setCurrentPage(1);
    setCreators([]);
    fetchCreators(1);
  }, [selectedService]);

  const filteredCreators = useMemo(() => {
    if (!searchTerm.trim()) return creators;
    return creators.filter(creator =>
      creator.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [creators, searchTerm]);

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

  const handleMovieModeToggle = useCallback(() => {
    if (selectedCreator) {
      setMovieModeActive(!movieModeActive);
      if (!movieModeActive) {
        // Load posts for movie mode
        loadPostsForMovie(selectedCreator);
      }
    } else {
      setMovieModeActive(false);
    }
  }, [selectedCreator, movieModeActive]);

  const loadPostsForMovie = async (creator: Creator) => {
    try {
      const isCoomer = COOMER_SERVICES.includes(creator.service);
      
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
      
      setPostsForMovie(transformedPosts);
    } catch (error) {
      console.error('Failed to load posts for movie mode:', error);
      toast.error('Failed to load posts for movie mode');
    }
  };

  const handleClearCache = () => {
    advancedImageCache.clearCache();
    setCacheInfo({ size: 0, count: 0, maxSize: 0, maxSizeBytes: 0 });
    toast.success('Cache cleared');
  };

  const handleSyncCreator = async () => {
    if (!selectedCreator) return;
    
    // Load all posts for the creator
    try {
      const isCoomer = COOMER_SERVICES.includes(selectedCreator.service);
      
      const postsResponse = await axios.get<Post[]>(
        `${COOMER_POSTS_API_BASE_URL}/${selectedCreator.service}/user/${selectedCreator.id}/posts?o=0`,
        { headers: isCoomer ? { 'Accept': 'text/css' } : {} }
      );
      
      const transformedPosts: Post[] = postsResponse.data.map((post: any) => ({
        id: post.id,
        user: post.user || selectedCreator.id,
        service: selectedCreator.service,
        title: post.title || 'Untitled',
        content: post.content || '',
        published: post.published,
        file: post.file,
        attachments: post.attachments || []
      }));
      
      await offlineSyncManager.syncCreator(selectedCreator.id, transformedPosts);
    } catch (error) {
      console.error('Failed to sync creator:', error);
      toast.error('Failed to sync creator');
    }
  };

  return (
    <div className="h-screen w-screen flex flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Ultra-compact Header */}
      <header className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">CreatorHub</h1>
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
            </div>
            
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
            
            <div className="flex items-center gap-1">
              <button
                onClick={() => setFavoritesGalleryOpen(true)}
                className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <Heart className="h-4 w-4" />
              </button>
              
              <button
                onClick={() => setCacheManagerOpen(!cacheManagerOpen)}
                className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <Database className="h-4 w-4" />
              </button>
              
              <button
                onClick={() => setMovieModeActive(!movieModeActive)}
                className={`p-1.5 rounded-lg text-white ${
                  movieModeActive ? 'bg-purple-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Tv className="h-4 w-4" />
              </button>
              
              <button
                onClick={() => {
                  if (selectedCreator) {
                    handleSyncCreator();
                  }
                }}
                className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                disabled={!selectedCreator}
              >
                <CloudDownload className="h-4 w-4" />
              </button>
            </div>
          </div>
          </div>
        </header>

      {/* Main Content */}
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
              {searchTerm || selectedService !== 'all' ? 'No creators found matching your search or filter.' : 'No creators available.'}
            </p>
          </div>
        ) : (
          <div className="h-full overflow-y-auto">
            <div className="p-2">
              <div 
                className="grid gap-1"
                style={{ gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))` }}
              >
                {filteredCreators.map((creator) => (
                  <CompactCreatorCard
                    key={creator.id}
                    creator={creator}
                    onClick={() => handleCreatorClick(creator)}
                  />
                ))}
              </div>
            </div>
            
            {/* Sticky Load More Button */}
            {hasMore && (
              <div className="sticky bottom-4 right-4 flex justify-end">
                <button
                  onClick={loadMoreCreators}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors shadow-lg"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : 'Load More'}
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Compact Profile Viewer */}
      <CompactProfileViewer
        creator={selectedCreator}
        isOpen={isProfileViewerOpen}
        onClose={() => setIsProfileViewerOpen(false)}
        gridColumns={gridColumns}
        hoverPreviewEnabled={hoverPreviewEnabled}
        onToggleHoverPreview={() => setHoverPreviewEnabled(!hoverPreviewEnabled)}
      />

      {/* Movie Mode */}
      {movieModeActive && selectedCreator && (
        <MovieMode
          posts={postsForMovie}
          onClose={() => setMovieModeActive(false)}
          service={selectedCreator.service}
        />
      )}

      {/* Favorites Gallery */}
      <FavoritesGallery
        isOpen={favoritesGalleryOpen}
        onClose={() => setFavoritesGalleryOpen(false)}
      />

      {/* Cache Manager */}
      <CacheManager
        isOpen={cacheManagerOpen}
        setIsOpen={setCacheManagerOpen}
        cacheInfo={cacheInfo}
        onClearCache={handleClearCache}
      />
    </div>
  );
}

// --- COMPACT PROFILE VIEWER ---
const CompactProfileViewer = ({ 
  creator, 
  isOpen, 
  onClose,
  gridColumns,
  hoverPreviewEnabled,
  onToggleHoverPreview
}: { 
  creator: Creator | null; 
  isOpen: boolean; 
  onClose: () => void;
  gridColumns?: number;
  hoverPreviewEnabled?: boolean;
  onToggleHoverPreview?: () => void;
}) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isPostViewerOpen, setIsPostViewerOpen] = useState(false);
  const [currentPostIndex, setCurrentPostIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'gallery'>('grid');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'mostLiked'>('newest');
  const [filterType, setFilterType] = useState<'all' | 'images' | 'videos'>('all');
  const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set());
  const [showSelection, setShowSelection] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followers, setFollowers] = useState(Math.floor(Math.random() * 10000) + 1000);
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(Math.floor(Math.random() * 1000) + 100));
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMorePosts, setHasMorePosts] = useState(false);
  const [isSynced, setIsSynced] = useState(false);

  useEffect(() => {
    if (!creator) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const isCoomer = COOMER_SERVICES.includes(creator.service);
        
        // Fetch profile
        const profileResponse = await axios.get<Profile>(
          `${COOMER_POSTS_API_BASE_URL}/${creator.service}/user/${creator.id}/profile`,
          { headers: isCoomer ? { 'Accept': 'text/css' } : {} }
        );
        setProfile(profileResponse.data);
        
        // Check if synced
        setIsSynced(offlineSyncManager.isSynced(creator.id));
        
        // Fetch posts
        const postsResponse = await axios.get<Post[]>(
          `${COOMER_POSTS_API_BASE_URL}/${creator.service}/user/${creator.id}/posts?o=${currentPage * POSTS_PER_PAGE}`,
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
        
        setPosts(prev => [...prev, ...transformedPosts]);
        setHasMorePosts(transformedPosts.length === POSTS_PER_PAGE && profileResponse.data.post_count > POSTS_PER_PAGE);
      } catch (error: any) {
        console.error('Failed to fetch data:', error);
        toast.error('Failed to load creator data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [creator]);

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
  }, [creator, hasMorePosts, loadingMore, profile]);

  const filteredPosts = useMemo(() => {
    let filtered = [...posts];
    
    // Filter by type
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
    
    // Sort by
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
    
    return filteredPosts;
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
      if (post.attachments && post.attachments.length > 1) {
        // Open gallery viewer for posts with multiple images
        setSelectedPost(post);
        setCurrentPostIndex(index);
        setIsPostViewerOpen(true);
      } else {
        // Open regular post viewer
        setSelectedPost(post);
        setCurrentPostIndex(index);
        setIsPostViewerOpen(true);
      }
    }
  }, [showSelection, selectedPosts]);

  const handleSelectAll = () => {
    if (selectedPosts.size === filteredPosts.length) {
      setSelectedPosts(new Set());
    } else {
      setSelectedPosts(new Set(filteredPosts.map(post => post.id));
    }
  };

  const handleDownloadSelected = async () => {
    const downloadService = DownloadService.getInstance();
    const dir = await downloadService.selectDownloadDirectory();
    if (!dir) return;
    
    const selectedPostsList = filteredPosts.filter(post => selectedPosts.has(post.id));
    
    selectedPostsList.forEach(async (post, index) => {
      try {
        const url = COOMER_SERVICES.includes(post.service) 
          ? `https://coomer.st${post.file?.path || ''}`
          : `https://kemono.su${post.file?.path || ''}`;
        
        const fileName = `${post.id}.${post.file?.name?.split('.').pop() || 'jpg'}`;
        const filePath = `${dir}/${fileName}`;
        
        await downloadService.downloadFile(url, filePath);
        
        toast.success(`Downloaded: ${fileName}`);
      } catch (error) {
        console.error('Download error:', error);
        toast.error(`Failed to download: ${post.title}`);
      }
    });
  };

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    setFollowers(prev => isFollowing ? prev - 1 : prev + 1);
    toast(isFollowing ? 'Unfollowed' : 'Following');
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes(prev => isLiked ? prev - 1 : prev + 1);
    favoritesManager.addFavorite(creator.id);
  };

  const handleSync = async () => {
    if (!creator) return;
    
    await offlineSyncManager.syncCreator(creator.id, posts);
    setIsSynced(true);
  };

  if (!creator) return null;

  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? 'block' : 'hidden'}`}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-0 bg-white dark:bg-gray-900 text-white overflow-hidden flex flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
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
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{creator.name}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {creator.service} • {profile?.post_count || 0} posts
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleFollow}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  isFollowing 
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white' 
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
              
              <button
                onClick={handleLike}
                className={`p-2 rounded-full transition-colors ${
                  isLiked 
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
                onClick={handleSync}
                className={`p-2 rounded-full transition-colors ${
                  isSynced 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-green-500 hover:text-white'
                }`}
              >
                <CloudDownload className={isSynced ? 'fill-current' : ''} />
              </button>
            </div>
          </div>

          {/* Controls */}
          <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowSelection(!showSelection)}
                  className={`p-2 rounded ${showSelection ? 'bg-blue-500 text-white' : 'text-gray-600 dark:text-gray-400'}`}
                >
                  <Grid3x3 size={16} />
                </button>
                
                <button
                  onClick={() => setHoverPreviewEnabled(!hoverPreviewEnabled)}
                  className={`p-2 rounded ${hoverPreviewEnabled ? 'bg-blue-500 text-white' : 'text-gray-600 dark:text-gray-400'}`}
                >
                  <MousePointer size={16} />
                </button>
                
                <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg px-2 py-1">
                  <span className="text-xs text-gray-600 dark:text-gray-400 mr-1">Columns</span>
                  <input
                    type="range"
                    min="2"
                    max="8"
                    value={gridColumns}
                    onChange={(e) => setGridColumns(parseInt(e.target.value)}
                    className="w-16 h-4 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-xs text-gray-600 dark:text-gray-400 ml-1">{gridColumns}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg px-2 py-1">
                  <span className="text-xs text-gray-600 dark:text-gray-400 mr-1">View</span>
                  <div className="flex bg-white dark:bg-gray-800 rounded-lg">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-1 rounded-l ${viewMode === 'grid' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}
                    >
                      <LayoutGrid size={14} />
                    </button>
                    <button
                      onClick={() => setViewMode('gallery')}
                      className={`p-1 rounded-r ${viewMode === 'gallery' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}
                    >
                      <Layers3 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="flex flex-col justify-center items-center h-full">
                <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mb-4">
                  <ImageOff className="h-8 w-8 text-gray-500" />
                </div>
                <p className="text-gray-500 dark:text-gray-400">No posts available</p>
              </div>
            ) : (
              <div className="p-4">
                {viewMode === 'grid' ? (
                  <CompactPostGrid
                    posts={filteredPosts}
                    onPostClick={handlePostClick}
                    service={creator.service}
                    selectedPosts={selectedPosts}
                    showSelection={showSelection}
                    gridColumns={gridColumns}
                  />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {filteredPosts.map((post, index) => {
                      const imageUrl = post.file ? 
                        (COOMER_SERVICES.includes(post.service) 
                          ? `https://coomer.st${post.file.path}`
                          : `https://kemono.su${post.file.path}`
                        : post.attachments && post.attachments.length > 0 
                          ? `https://kemono.su${post.attachments[0].path}`
                          : '';
                      
                      return (
                        <div
                          key={post.id}
                          className="relative aspect-square overflow-hidden rounded-lg cursor-pointer group transform transition-all duration-300 hover:scale-105"
                          onClick={() => handlePostClick(post, index)}
                        >
                          {/* Selection checkbox */}
                          {showSelection && (
                            <div className="absolute top-2 left-2 z-10">
                              <div className={`w-5 h-5 rounded-full border-2 border-white flex items-center justify-center ${
                                selectedPosts.has(post.id) ? 'bg-blue-500' : 'bg-black/50'
                              }`}>
                                {selectedPosts.has(post.id) && (
                                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </div>
                            </div>
                          )}
                          
                          {/* Media indicators */}
                          {post.file?.name?.includes('.mp4') && (
                            <div className="absolute top-2 right-2 z-10 bg-black/50 rounded-full p-1">
                              <PlayCircle size={12} className="text-white" />
                            </div>
                          )}
                          
                          {post.attachments && post.attachments.length > 0 && (
                            <div className="absolute top-2 right-2 z-10 bg-black/50 rounded-full px-1.5 py-0.5">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Open gallery viewer
                                }}
                                className="w-full h-full flex items-center justify-center text-white"
                              >
                                <Layers3 size={12} />
                              </button>
                            </div>
                          )}
                          
                          {/* Image */}
                          {imageUrl ? (
                            <OptimizedImage
                              src={imageUrl}
                              alt={post.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                              <ImageOff size={24} className="text-gray-600" />
                            </div>
                          )}
                          
                          {/* Hover overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="absolute bottom-0 left-0 right-0 p-2">
                              <p className="text-white text-xs font-medium truncate">{post.title}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-white">
                      <Layers3 size={24} className="text-gray-400 mb-2" />
                      <p className="text-gray-400">Gallery mode coming soon</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

{/* // --- TANSTACK ROUTE --- */}
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

export const Route = createFileRoute('/coomerKemono')({
  component: RouteComponent,
});