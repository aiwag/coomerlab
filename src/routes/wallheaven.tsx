// import { createFileRoute } from '@tanstack/react-router';
// import { QueryClient, QueryClientProvider, useInfiniteQuery } from '@tanstack/react-query';
// import { useEffect, useState, useCallback, useRef } from 'react';
// import InfiniteScroll from 'react-infinite-scroll-component';
// import { useInView } from 'react-intersection-observer';
// import { Toaster, toast } from 'react-hot-toast';
// import {
//   Search,
//   X,
//   Download,
//   ChevronLeft,
//   ChevronRight,
//   Play,
//   Pause,
//   Maximize,
//   Minimize,
//   Filter,
//   ChevronDown,
//   ArrowUp,
//   Grid,
//   List,
//   Heart,
//   Eye,
//   Info,
//   Settings,
//   Sliders,
//   Zap,
//   Image as ImageIcon,
//   Monitor,
//   Smartphone,
//   Tablet,
//   Sun,
//   Moon,
//   RefreshCw,
//   Bookmark,
//   Share2,
//   ExternalLink,
// } from 'lucide-react';

// // --- TYPES ---
// interface Wallpaper {
//   id: string;
//   path: string;
//   url: string;
//   dimension_x: number;
//   dimension_y: number;
//   resolution: string;
//   file_size: number;
//   file_type?: string | null;
//   category?: string | null;
//   purity: string;
//   ratio: string;
//   source: string | null;
//   views: number;
//   favorites: number;
//   created_at: string;
//   thumbs: {
//     small: string;
//     original: string;
//   };
//   uploader?: {
//     username?: string | null;
//   } | null;
//   tags?: Tag[] | null;
// }

// interface Tag {
//   id: number;
//   name: string;
//   alias?: string | null;
//   category?: string | null;
// }

// interface ApiResponse {
//   data: Wallpaper[];
//   meta: {
//     current_page: number;
//     last_page: number;
//   };
// }

// interface FilterOptions {
//   categories: {
//     general: boolean;
//     anime: boolean;
//     people: boolean;
//   };
//   purity: {
//     sfw: boolean;
//     sketchy: boolean;
//     nsfw: boolean;
//   };
//   sorting: 'toplist' | 'date_added' | 'relevance' | 'random' | 'views' | 'favorites';
//   topRange: '1d' | '3d' | '1w' | '1M' | '3M' | '6M' | '1y';
//   resolutions: string[];
//   ratios: string[];
//   colors: string[];
// }

// // --- API Service ---
// const API_KEY = 'EFkCFHGlTBVugFhK9SOI4F5GoQJTOW0W';
// const BASE_URL = 'https://wallhaven.cc/api/v1/search';

// type FetchParams = {
//   pageParam?: number;
//   signal?: AbortSignal;
//   filters: FilterOptions;
// };

// const fetchWallpapers = async ({ pageParam = 1, signal, filters }: FetchParams): Promise<ApiResponse> => {
//   // Build categories string (3 bits: general, anime, people)
//   const categoriesString = 
//     (filters.categories.general ? '1' : '0') +
//     (filters.categories.anime ? '1' : '0') +
//     (filters.categories.people ? '1' : '0');

//   // Build purity string (3 bits: sfw, sketchy, nsfw)
//   const purityString = 
//     (filters.purity.sfw ? '1' : '0') +
//     (filters.purity.sketchy ? '1' : '0') +
//     (filters.purity.nsfw ? '1' : '0');

//   const params = new URLSearchParams({
//     apikey: API_KEY,
//     sorting: filters.sorting,
//     categories: categoriesString,
//     purity: purityString,
//     topRange: filters.topRange,
//     page: pageParam.toString(),
//   });

//   const response = await fetch(`${BASE_URL}?${params.toString()}`, { signal });

//   if (response.status === 429) {
//     toast.error('Rate limit exceeded. Please wait a moment.');
//     throw new Error('Rate limit exceeded');
//   }

//   if (!response.ok) {
//     throw new Error('Network response was not ok');
//   }

//   const data: ApiResponse = await response.json();
//   return data;
// };

// // --- COMPONENTS ---

// // Compact Filter Panel Component
// const CompactFilterPanel = ({ 
//   filters, 
//   setFilters,
//   isOpen,
//   setIsOpen 
// }: { 
//   filters: FilterOptions; 
//   setFilters: (filters: FilterOptions) => void;
//   isOpen: boolean;
//   setIsOpen: (open: boolean) => void;
// }) => {
//   const handleCategoryToggle = (category: keyof FilterOptions['categories']) => {
//     setFilters({
//       ...filters,
//       categories: {
//         ...filters.categories,
//         [category]: !filters.categories[category],
//       },
//     });
//   };

//   const handlePurityToggle = (purity: keyof FilterOptions['purity']) => {
//     setFilters({
//       ...filters,
//       purity: {
//         ...filters.purity,
//         [purity]: !filters.purity[purity],
//       },
//     });
//   };

//   // Close on click outside
//   useEffect(() => {
//     const handleClickOutside = (e: MouseEvent) => {
//       const target = e.target as HTMLElement;
//       if (isOpen && !target.closest('.filter-panel')) {
//         setIsOpen(false);
//       }
//     };

//     document.addEventListener('click', handleClickOutside);
//     return () => document.removeEventListener('click', handleClickOutside);
//   }, [isOpen, setIsOpen]);

//   return (
//     <div className="relative filter-panel">
//       <button
//         onClick={() => setIsOpen(!isOpen)}
//         className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
//       >
//         <Sliders size={16} />
//         <span className="text-sm">Filters</span>
//         <ChevronDown size={14} className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
//       </button>

//       {isOpen && (
//         <div className="absolute top-full right-0 mt-1 w-72 bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-3 z-50">
//           {/* Quick Categories */}
//           <div className="mb-3">
//             <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Categories</h3>
//             <div className="flex gap-2">
//               <button
//                 onClick={() => handleCategoryToggle('general')}
//                 className={`px-2 py-1 text-xs rounded ${
//                   filters.categories.general 
//                     ? 'bg-blue-500 text-white' 
//                     : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
//                 }`}
//               >
//                 General
//               </button>
//               <button
//                 onClick={() => handleCategoryToggle('anime')}
//                 className={`px-2 py-1 text-xs rounded ${
//                   filters.categories.anime 
//                     ? 'bg-blue-500 text-white' 
//                     : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
//                 }`}
//               >
//                 Anime
//               </button>
//               <button
//                 onClick={() => handleCategoryToggle('people')}
//                 className={`px-2 py-1 text-xs rounded ${
//                   filters.categories.people 
//                     ? 'bg-blue-500 text-white' 
//                     : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
//                 }`}
//               >
//                 People
//               </button>
//             </div>
//           </div>

//           {/* Quick Purity */}
//           <div className="mb-3">
//             <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Purity</h3>
//             <div className="flex gap-2">
//               <button
//                 onClick={() => handlePurityToggle('sfw')}
//                 className={`px-2 py-1 text-xs rounded ${
//                   filters.purity.sfw 
//                     ? 'bg-green-500 text-white' 
//                     : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
//                 }`}
//               >
//                 SFW
//               </button>
//               <button
//                 onClick={() => handlePurityToggle('sketchy')}
//                 className={`px-2 py-1 text-xs rounded ${
//                   filters.purity.sketchy 
//                     ? 'bg-yellow-500 text-white' 
//                     : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
//                 }`}
//               >
//                 Sketchy
//               </button>
//               <button
//                 onClick={() => handlePurityToggle('nsfw')}
//                 className={`px-2 py-1 text-xs rounded ${
//                   filters.purity.nsfw 
//                     ? 'bg-red-500 text-white' 
//                     : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
//                 }`}
//               >
//                 NSFW
//               </button>
//             </div>
//           </div>

//           {/* Sorting */}
//           <div className="mb-3">
//             <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Sort By</h3>
//             <select
//               value={filters.sorting}
//               onChange={(e) => setFilters({ ...filters, sorting: e.target.value as FilterOptions['sorting'] })}
//               className="w-full px-2 py-1 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 focus:border-blue-500 dark:text-gray-300"
//             >
//               <option value="toplist">Top List</option>
//               <option value="date_added">Date Added</option>
//               <option value="relevance">Relevance</option>
//               <option value="random">Random</option>
//               <option value="views">Views</option>
//               <option value="favorites">Favorites</option>
//             </select>
//           </div>

//           {/* Time Range (only for toplist) */}
//           {filters.sorting === 'toplist' && (
//             <div>
//               <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Time Range</h3>
//               <select
//                 value={filters.topRange}
//                 onChange={(e) => setFilters({ ...filters, topRange: e.target.value as FilterOptions['topRange'] })}
//                 className="w-full px-2 py-1 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 focus:border-blue-500 dark:text-gray-300"
//               >
//                 <option value="1d">Last Day</option>
//                 <option value="3d">Last 3 Days</option>
//                 <option value="1w">Last Week</option>
//                 <option value="1M">Last Month</option>
//                 <option value="3M">Last 3 Months</option>
//                 <option value="6M">Last 6 Months</option>
//                 <option value="1y">Last Year</option>
//               </select>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// // Compact Image Card Component
// const CompactImageCard = ({
//   wallpaper,
//   onClick,
//   index,
// }: {
//   wallpaper: Wallpaper;
//   onClick: () => void;
//   index: number;
// }) => {
//   const [imageError, setImageError] = useState(false);
//   const [isHovered, setIsHovered] = useState(false);
//   const [isLiked, setIsLiked] = useState(false);
//   const [isBookmarked, setIsBookmarked] = useState(false);

//   // Purity indicator colors
//   const purityColors = {
//     sfw: 'bg-green-500',
//     sketchy: 'bg-yellow-500',
//     nsfw: 'bg-red-500',
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
//     window.open(wallpaper.path, '_blank');
//   };

//   return (
//     <div
//       className="relative block w-full aspect-[2/3] bg-gray-200 dark:bg-gray-800 overflow-hidden cursor-pointer group"
//       onClick={onClick}
//       onMouseEnter={() => setIsHovered(true)}
//       onMouseLeave={() => setIsHovered(false)}
//     >
//       {/* Purity Indicator */}
//       <div className={`absolute top-1 left-1 w-1.5 h-1.5 rounded-full z-10 ${purityColors[wallpaper.purity as keyof typeof purityColors]}`} />
      
//       {/* Index Badge */}
//       <div className="absolute top-1 right-1 z-10 bg-black/50 text-white text-xs px-1 rounded">
//         {index + 1}
//       </div>
      
//       {!imageError ? (
//         <img
//           src={wallpaper.thumbs?.small ?? wallpaper.thumbs?.original ?? wallpaper.path}
//           alt={`Wallpaper ${wallpaper.id}`}
//           className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
//           loading="lazy"
//           onError={() => setImageError(true)}
//         />
//       ) : (
//         <div className="w-full h-full flex items-center justify-center bg-gray-300 dark:bg-gray-700">
//           <ImageIcon size={24} className="text-gray-500 dark:text-gray-400" />
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
//             <p className="font-semibold">{wallpaper.resolution}</p>
//             <div className="flex items-center gap-2 mt-1">
//               <span className="flex items-center gap-1">
//                 <Heart size={10} />
//                 {wallpaper.favorites}
//               </span>
//               <span className="flex items-center gap-1">
//                 <Eye size={10} />
//                 {wallpaper.views}
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
// };

// // Enhanced Image Modal Component
// const ImmersiveImageModal = ({
//   wallpaper,
//   onClose,
//   onPrev,
//   onNext,
//   onStartSlideshow,
//   hasPrev,
//   hasNext,
//   currentIndex,
//   totalCount,
// }: {
//   wallpaper: Wallpaper;
//   onClose: () => void;
//   onPrev: () => void;
//   onNext: () => void;
//   onStartSlideshow: () => void;
//   hasPrev: boolean;
//   hasNext: boolean;
//   currentIndex: number;
//   totalCount: number;
// }) => {
//   const [isFullscreen, setIsFullscreen] = useState(false);
//   const [imageLoaded, setImageLoaded] = useState(false);
//   const [showInfo, setShowInfo] = useState(false);
//   const [isLiked, setIsLiked] = useState(false);
//   const [isBookmarked, setIsBookmarked] = useState(false);
//   const modalRef = useRef<HTMLDivElement>(null);
//   const uploaderName = wallpaper.uploader?.username ?? 'Anonymous';

//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       if (e.key === 'Escape') {
//         if (isFullscreen) {
//           setIsFullscreen(false);
//         } else {
//           onClose();
//         }
//       }
//       if (e.key === 'ArrowLeft' && hasPrev) onPrev();
//       if (e.key === 'ArrowRight' && hasNext) onNext();
//       if (e.key === ' ') {
//         e.preventDefault();
//         onStartSlideshow();
//       }
//       if (e.key === 'f') {
//         e.preventDefault();
//         setIsFullscreen((prev) => !prev);
//       }
//       if (e.key === 'i') {
//         e.preventDefault();
//         setShowInfo((prev) => !prev);
//       }
//       if (e.key === 'l') {
//         e.preventDefault();
//         setIsLiked(!isLiked);
//       }
//       if (e.key === 'b') {
//         e.preventDefault();
//         setIsBookmarked(!isBookmarked);
//       }
//     };

//     window.addEventListener('keydown', handleKeyDown);
//     return () => window.removeEventListener('keydown', handleKeyDown);
//   }, [onClose, onPrev, onNext, hasPrev, hasNext, isFullscreen, onStartSlideshow, isLiked, isBookmarked]);

//   useEffect(() => {
//     if (isFullscreen) {
//       document.documentElement.requestFullscreen?.();
//     } else if (document.fullscreenElement) {
//       document.exitFullscreen?.();
//     }
//   }, [isFullscreen]);

//   const handleImageLoad = () => {
//     setImageLoaded(true);
//   };

//   // Reset image loaded state when wallpaper changes
//   useEffect(() => {
//     setImageLoaded(false);
//   }, [wallpaper.id]);

//   const handleLike = () => {
//     setIsLiked(!isLiked);
//   };

//   const handleBookmark = () => {
//     setIsBookmarked(!isBookmarked);
//   };

//   const handleDownload = () => {
//     window.open(wallpaper.path, '_blank');
//   };

//   const handleShare = () => {
//     if (navigator.share) {
//       navigator.share({
//         title: `Wallpaper by ${uploaderName}`,
//         text: `Check out this amazing wallpaper!`,
//         url: wallpaper.path,
//       });
//     } else {
//       navigator.clipboard.writeText(wallpaper.path);
//       toast.success('Link copied to clipboard!');
//     }
//   };

//   return (
//     <div
//       className={`fixed inset-0 bg-black z-50 flex items-center justify-center transition-all duration-300 ${
//         isFullscreen ? 'p-0' : 'p-0'
//       }`}
//       onClick={onClose}
//     >
//       <div
//         ref={modalRef}
//         className={`relative w-full h-full flex flex-col transition-all duration-300 ${
//           isFullscreen ? 'w-full h-full' : 'w-full h-full'
//         }`}
//         onClick={(e) => e.stopPropagation()}
//       >
//         {/* Top Controls Bar */}
//         <div className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/70 to-transparent p-4">
//           <div className="flex justify-between items-center">
//             <div className="flex items-center gap-3 text-white">
//               <span className="text-sm bg-black/50 px-2 py-1 rounded backdrop-blur-sm">
//                 {currentIndex + 1} / {totalCount}
//               </span>
//               <span className="text-sm">{wallpaper.resolution}</span>
//               <span className="text-sm capitalize">{wallpaper.purity}</span>
//             </div>
//             <div className="flex items-center gap-2">
//               <button
//                 onClick={handleLike}
//                 className={`p-2 rounded-full transition-colors ${
//                   isLiked ? 'bg-red-500 text-white' : 'bg-black/50 text-white hover:bg-black/70'
//                 }`}
//                 title="Like (L)"
//               >
//                 <Heart size={18} fill={isLiked ? 'white' : 'none'} />
//               </button>
//               <button
//                 onClick={handleBookmark}
//                 className={`p-2 rounded-full transition-colors ${
//                   isBookmarked ? 'bg-blue-500 text-white' : 'bg-black/50 text-white hover:bg-black/70'
//                 }`}
//                 title="Bookmark (B)"
//               >
//                 <Bookmark size={18} fill={isBookmarked ? 'white' : 'none'} />
//               </button>
//               <button
//                 onClick={handleShare}
//                 className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
//                 title="Share"
//               >
//                 <Share2 size={18} />
//               </button>
//               <button
//                 onClick={handleDownload}
//                 className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
//                 title="Download"
//               >
//                 <Download size={18} />
//               </button>
//               <button
//                 onClick={() => setShowInfo(!showInfo)}
//                 className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
//                 title="Info (I)"
//               >
//                 <Info size={18} />
//               </button>
//               <button
//                 onClick={onStartSlideshow}
//                 className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
//                 title="Start Slideshow (Space)"
//               >
//                 <Play size={18} />
//               </button>
//               <button
//                 onClick={() => setIsFullscreen((prev) => !prev)}
//                 className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
//                 title="Toggle Fullscreen (F)"
//               >
//                 {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
//               </button>
//               <button
//                 onClick={onClose}
//                 className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
//                 title="Close (Esc)"
//               >
//                 <X size={18} />
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Navigation Arrows */}
//         {hasPrev && (
//           <button
//             onClick={onPrev}
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
//           {!imageLoaded && (
//             <div className="absolute inset-0 flex items-center justify-center">
//               <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
//             </div>
//           )}
//           <img
//             src={wallpaper.path}
//             alt={`Wallpaper ${wallpaper.id}`}
//             className={`max-w-full max-h-full object-contain transition-opacity duration-300 ${
//               imageLoaded ? 'opacity-100' : 'opacity-0'
//             }`}
//             onLoad={handleImageLoad}
//           />
//         </div>

//         {/* Info Panel */}
//         {showInfo && (
//           <div className="absolute bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-black/80 to-transparent p-4 text-white">
//             <div className=" mx-auto">
//               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
//                 <div>
//                   <p className="font-semibold text-gray-300">Uploader</p>
//                   <p>{uploaderName}</p>
//                 </div>
//                 <div>
//                   <p className="font-semibold text-gray-300">Resolution</p>
//                   <p>{wallpaper.resolution}</p>
//                 </div>
//                 <div>
//                   <p className="font-semibold text-gray-300">Ratio</p>
//                   <p>{wallpaper.ratio}</p>
//                 </div>
//                 <div>
//                   <p className="font-semibold text-gray-300">Category</p>
//                   <p>{wallpaper.category ?? '\u2014'}</p>
//                 </div>
//                 <div>
//                   <p className="font-semibold text-gray-300">Favorites</p>
//                   <p>{wallpaper.favorites.toLocaleString()}</p>
//                 </div>
//                 <div>
//                   <p className="font-semibold text-gray-300">Views</p>
//                   <p>{wallpaper.views.toLocaleString()}</p>
//                 </div>
//                 <div>
//                   <p className="font-semibold text-gray-300">File Type</p>
//                   <p>{wallpaper.file_type ?? 'Unknown'}</p>
//                 </div>
//                 <div>
//                   <p className="font-semibold text-gray-300">Purity</p>
//                   <p className="capitalize">{wallpaper.purity}</p>
//                 </div>
//               </div>
//               <div className="mt-3">
//                 <p className="font-semibold text-gray-300 mb-1">Tags</p>
//                 <div className="flex flex-wrap gap-1">
//                   {(wallpaper.tags ?? []).map((tag) => (
//                     <span
//                       key={tag.id}
//                       className="bg-white/20 text-xs px-2 py-0.5 rounded-full"
//                     >
//                       {tag.name}
//                     </span>
//                   ))}
//                   {(wallpaper.tags ?? []).length === 0 && (
//                     <span className="text-xs text-gray-400">No tags</span>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// // Enhanced Slideshow Component
// const ImmersiveSlideshow = ({
//   wallpapers,
//   initialIndex,
//   onClose,
//   isPlaying,
//   onTogglePlay,
//   onNext,
//   onPrev,
//   currentIndex,
// }: {
//   wallpapers: Wallpaper[];
//   initialIndex: number;
//   onClose: () => void;
//   isPlaying: boolean;
//   onTogglePlay: () => void;
//   onNext: () => void;
//   onPrev: () => void;
//   currentIndex: number;
// }) => {
//   const [imageLoaded, setImageLoaded] = useState(false);
//   const [showControls, setShowControls] = useState(true);
//   const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       if (e.key === 'Escape') onClose();
//       if (e.key === ' ') {
//         e.preventDefault();
//         onTogglePlay();
//       }
//       if (e.key === 'ArrowLeft') onPrev();
//       if (e.key === 'ArrowRight') onNext();
//       if (e.key === 'h') {
//         e.preventDefault();
//         setShowControls((prev) => !prev);
//       }
//     };

//     window.addEventListener('keydown', handleKeyDown);
//     return () => window.removeEventListener('keydown', handleKeyDown);
//   }, [onClose, onTogglePlay, onNext, onPrev]);

//   const handleImageLoad = () => {
//     setImageLoaded(true);
//   };

//   useEffect(() => {
//     setImageLoaded(false);
//   }, [currentIndex]);

//   const handleMouseMove = () => {
//     setShowControls(true);
//     if (controlsTimeoutRef.current) {
//       clearTimeout(controlsTimeoutRef.current);
//     }
//     controlsTimeoutRef.current = setTimeout(() => {
//       setShowControls(false);
//     }, 3000);
//   };

//   useEffect(() => {
//     const container = document.getElementById('slideshow-container');
//     if (container) {
//       container.addEventListener('mousemove', handleMouseMove);
//       return () => {
//         container.removeEventListener('mousemove', handleMouseMove);
//         if (controlsTimeoutRef.current) {
//           clearTimeout(controlsTimeoutRef.current);
//         }
//       };
//     }
//   }, []);

//   return (
//     <div id="slideshow-container" className="fixed inset-0 bg-black z-50 flex items-center justify-center w-full h-full" onClick={onClose}>
//       {/* Controls */}
//       <div className={`absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/70 to-transparent p-4 transition-opacity duration-300 ${
//         showControls ? 'opacity-100' : 'opacity-0'
//       }`}>
//         <div className="flex justify-between items-center text-white">
//           <span className="text-sm bg-black/50  py-1 rounded-full backdrop-blur-sm">
//             {currentIndex + 1} / {wallpapers.length}
//           </span>
//           <div className="flex items-center gap-2">
//             <button
//               onClick={(e) => {
//                 e.stopPropagation();
//                 onTogglePlay();
//               }}
//               className="p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors backdrop-blur-sm"
//             >
//               {isPlaying ? <Pause size={20} /> : <Play size={20} />}
//             </button>
//             <button
//               onClick={(e) => {
//                 e.stopPropagation();
//                 onClose();
//               }}
//               className="p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors backdrop-blur-sm"
//             >
//               <X size={20} />
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Navigation Arrows */}
//       <div className={`absolute left-0 right-0 top-1/2 -translate-y-1/2 z-40 flex justify-between px-4 transition-opacity duration-300 ${
//         showControls ? 'opacity-100' : 'opacity-0'
//       }`}>
//         <button
//           onClick={(e) => {
//             e.stopPropagation();
//             onPrev();
//           }}
//           className="p-3 text-white bg-black/50 rounded-full hover:bg-black/70 transition-all backdrop-blur-sm hover:scale-110"
//         >
//           <ChevronLeft size={28} />
//         </button>
//         <button
//           onClick={(e) => {
//             e.stopPropagation();
//             onNext();
//           }}
//           className="p-3 text-white bg-black/50 rounded-full hover:bg-black/70 transition-all backdrop-blur-sm hover:scale-110"
//         >
//           <ChevronRight size={28} />
//         </button>
//       </div>

//       {/* Image */}
//       <div className="relative max-w-full max-h-full" onClick={(e) => e.stopPropagation()}>
//         {!imageLoaded && (
//           <div className="absolute inset-0 flex items-center justify-center">
//             <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin" />
//           </div>
//         )}
//         <img
//           src={wallpapers[currentIndex].path}
//           alt={`Slideshow image ${currentIndex + 1}`}
//           className={`max-w-full max-h-screen object-contain transition-opacity duration-300 ${
//             imageLoaded ? 'opacity-100' : 'opacity-0'
//           }`}
//           onLoad={handleImageLoad}
//         />
//       </div>

//       {/* Progress Bar */}
//       <div className={`absolute bottom-0 left-0 right-0 z-50 p-4 transition-opacity duration-300 ${
//         showControls ? 'opacity-100' : 'opacity-0'
//       }`}>
//         <div className="w-full bg-gray-600 rounded-full h-1">
//           <div
//             className="bg-white h-1 rounded-full transition-all duration-1000 ease-linear"
//             style={{ width: `${((currentIndex + 1) / wallpapers.length) * 100}%` }}
//           />
//         </div>
//         <div className="text-center text-white text-xs mt-2">
//           {wallpapers[currentIndex].resolution} \u2022 {wallpapers[currentIndex].purity}
//         </div>
//       </div>
//     </div>
//   );
// };

// // Compact Header Component
// const CompactHeader = ({
//   title,
//   onRefresh,
//   onViewModeChange,
//   viewMode,
//   onThemeToggle,
//   isDarkMode,
//   activeImageIndex,
//   onStartSlideshow,
//   filterPanelOpen,
//   setFilterPanelOpen,
//   filters,
//   setFilters,
// }: {
//   title: string;
//   onRefresh: () => void;
//   onViewModeChange: (mode: 'grid' | 'list') => void;
//   viewMode: 'grid' | 'list';
//   onThemeToggle: () => void;
//   isDarkMode: boolean;
//   activeImageIndex: number | null;
//   onStartSlideshow: () => void;
//   filterPanelOpen: boolean;
//   setFilterPanelOpen: (open: boolean) => void;
//   filters: FilterOptions;
//   setFilters: (filters: FilterOptions) => void;
// }) => {
//   return (
//     <header className="flex-shrink-0 sticky top-0 z-40 bg-white/90 dark:bg-gray-950/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
//       <div className="container mx-auto px-2 py-2 flex justify-between items-center">
//         <div className="flex items-center gap-2">
//           <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">{title}</h1>
//           <button
//             onClick={onRefresh}
//             className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
//             title="Refresh"
//           >
//             <RefreshCw size={16} />
//           </button>
//         </div>
        
//         <div className="flex items-center gap-2">
//           {activeImageIndex !== null && (
//             <button
//               onClick={onStartSlideshow}
//               className="flex items-center gap-1 px-2 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
//             >
//               <Play size={14} />
//               Slideshow
//             </button>
//           )}
          
//           <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded">
//             <button
//               onClick={() => onViewModeChange('grid')}
//               className={`p-1 rounded ${
//                 viewMode === 'grid' 
//                   ? 'bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white' 
//                   : 'text-gray-600 dark:text-gray-400'
//               }`}
//               title="Grid View"
//             >
//               <Grid size={16} />
//             </button>
//             <button
//               onClick={() => onViewModeChange('list')}
//               className={`p-1 rounded ${
//                 viewMode === 'list' 
//                   ? 'bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white' 
//                   : 'text-gray-600 dark:text-gray-400'
//               }`}
//               title="List View"
//             >
//               <List size={16} />
//             </button>
//           </div>
          
//           <CompactFilterPanel 
//             filters={filters} 
//             setFilters={setFilters} 
//             isOpen={filterPanelOpen}
//             setIsOpen={setFilterPanelOpen}
//           />
          
//           <button
//             onClick={onThemeToggle}
//             className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
//             title="Toggle Theme"
//           >
//             {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
//           </button>
//         </div>
//       </div>
//     </header>
//   );
// };

// // Main Component
// function RouteComponent() {
//   const { ref, inView } = useInView();
//   const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);
//   const [isSlideshowActive, setIsSlideshowActive] = useState(false);
//   const [isSlideshowPlaying, setIsSlideshowPlaying] = useState(true);
//   const [filterPanelOpen, setFilterPanelOpen] = useState(false);
//   const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
//   const [isDarkMode, setIsDarkMode] = useState(true);
//   const slideshowIntervalRef = useRef<number | null>(null);

//   // Filter state
//   const [filters, setFilters] = useState<FilterOptions>({
//     categories: {
//       general: false,
//       anime: true,
//       people: true,
//     },
//     purity: {
//       sfw: true,
//       sketchy: true,
//       nsfw: true,
//     },
//     sorting: 'toplist',
//     topRange: '1M',
//     resolutions: [],
//     ratios: [],
//     colors: [],
//   });

//   const { data, error, fetchNextPage, hasNextPage, isFetchingNextPage, status, refetch } = useInfiniteQuery({
//     queryKey: ['wallpapers', filters],
//     queryFn: ({ pageParam, signal }) => fetchWallpapers({ pageParam, signal, filters }),
//     getNextPageParam: (lastPage) =>
//       lastPage.meta.current_page < lastPage.meta.last_page ? lastPage.meta.current_page + 1 : undefined,
//     initialPageParam: 1,
//     retry: (failureCount, err: any) => (err?.name === 'AbortError' ? false : failureCount < 2),
//     refetchOnWindowFocus: false,
//   });

//   // Reset active image when filters change
//   useEffect(() => {
//     setActiveImageIndex(null);
//     setIsSlideshowActive(false);
//   }, [filters]);

//   useEffect(() => {
//     if (inView && hasNextPage && !isFetchingNextPage) {
//       fetchNextPage();
//     }
//   }, [inView, hasNextPage, fetchNextPage, isFetchingNextPage]);

//   const allWallpapers = data?.pages.flatMap((page) => page.data) ?? [];

//   // Navigation handlers
//   const handleNextImage = useCallback(() => {
//     if (activeImageIndex !== null && activeImageIndex < allWallpapers.length - 1) {
//       setActiveImageIndex(activeImageIndex + 1);
//     }
//   }, [activeImageIndex, allWallpapers.length]);

//   const handlePrevImage = useCallback(() => {
//     if (activeImageIndex !== null && activeImageIndex > 0) {
//       setActiveImageIndex(activeImageIndex - 1);
//     }
//   }, [activeImageIndex]);

//   // Slideshow handlers
//   const startSlideshow = useCallback(() => {
//     if (activeImageIndex === null) return;
//     setIsSlideshowActive(true);
//     setIsSlideshowPlaying(true);
//   }, [activeImageIndex]);

//   const stopSlideshow = useCallback(() => {
//     setIsSlideshowActive(false);
//     setIsSlideshowPlaying(false);
//     if (slideshowIntervalRef.current) {
//       clearInterval(slideshowIntervalRef.current);
//       slideshowIntervalRef.current = null;
//     }
//   }, []);

//   const toggleSlideshowPlay = useCallback(() => {
//     setIsSlideshowPlaying((prev) => !prev);
//   }, []);

//   // Slideshow auto-advance
//   useEffect(() => {
//     if (isSlideshowActive && isSlideshowPlaying) {
//       slideshowIntervalRef.current = window.setInterval(() => {
//         setActiveImageIndex((prev) => {
//           if (prev === null) return 0;
//           return prev < allWallpapers.length - 1 ? prev + 1 : 0;
//         });
//       }, 3000); // Change image every 3 seconds
//     } else {
//       if (slideshowIntervalRef.current) {
//         clearInterval(slideshowIntervalRef.current);
//         slideshowIntervalRef.current = null;
//       }
//     }

//     return () => {
//       if (slideshowIntervalRef.current) {
//         clearInterval(slideshowIntervalRef.current);
//         slideshowIntervalRef.current = null;
//       }
//     };
//   }, [isSlideshowActive, isSlideshowPlaying, allWallpapers.length]);

//   const handleSlideshowNext = useCallback(() => {
//     setActiveImageIndex((prev) => {
//       if (prev === null) return 0;
//       return prev < allWallpapers.length - 1 ? prev + 1 : 0;
//     });
//   }, [allWallpapers.length]);

//   const handleSlideshowPrev = useCallback(() => {
//     setActiveImageIndex((prev) => {
//       if (prev === null) return 0;
//       return prev > 0 ? prev - 1 : allWallpapers.length - 1;
//     });
//   }, [allWallpapers.length]);

//   const handleThemeToggle = () => {
//     setIsDarkMode(!isDarkMode);
//     if (!isDarkMode) {
//       document.documentElement.classList.add('dark');
//     } else {
//       document.documentElement.classList.remove('dark');
//     }
//   };

//   // Apply dark mode on mount
//   useEffect(() => {
//     if (isDarkMode) {
//       document.documentElement.classList.add('dark');
//     } else {
//       document.documentElement.classList.remove('dark');
//     }
//   }, [isDarkMode]);

//   return (
//     <div className={`h-screen w-screen flex flex-col ${isDarkMode ? 'dark' : ''} bg-white dark:bg-gray-950`}>
//       <CompactHeader
//         title="Wallhaven Explorer"
//         onRefresh={() => refetch()}
//         onViewModeChange={setViewMode}
//         viewMode={viewMode}
//         onThemeToggle={handleThemeToggle}
//         isDarkMode={isDarkMode}
//         activeImageIndex={activeImageIndex}
//         onStartSlideshow={startSlideshow}
//         filterPanelOpen={filterPanelOpen}
//         setFilterPanelOpen={setFilterPanelOpen}
//         filters={filters}
//         setFilters={setFilters}
//       />

//       <main id="scroll-container" className="flex-1 overflow-y-auto" style={{ height: 'calc(100vh - 48px)' }}>
//         <div className="w-full flex flex-col p-5">
//           {/* Active filters display */}
//           <div className="mb-2 flex flex-wrap gap-1">
//             {Object.entries(filters.categories).filter(([_, v]) => v).map(([key]) => (
//               <span key={key} className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full capitalize">
//                 {key}
//               </span>
//             ))}
//             {Object.entries(filters.purity).filter(([_, v]) => v).map(([key]) => (
//               <span key={key} className={`px-2 py-0.5 text-xs rounded-full capitalize ${
//                 key === 'sfw' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
//                 key === 'sketchy' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
//                 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
//               }`}>
//                 {key}
//               </span>
//             ))}
//           </div>

//           {status === 'pending' ? (
//             <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 2xl:grid-cols-12 gap-0.5">
//               {Array.from({ length: 30 }).map((_, index) => (
//                 <div key={index} className="aspect-[2/3] bg-gray-200 dark:bg-gray-800 animate-pulse" />
//               ))}
//             </div>
//           ) : status === 'error' ? (
//             <div className="text-center text-red-500 py-8">Error: {(error as any)?.message ?? 'Unknown error'}</div>
//           ) : (
//             <>
//               <InfiniteScroll
//                 dataLength={allWallpapers.length}
//                 next={fetchNextPage}
//                 hasMore={!!hasNextPage}
//                 loader={
//                   <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 2xl:grid-cols-12 gap-0.5">
//                     {Array.from({ length: 12 }).map((_, index) => (
//                       <div key={index} className="aspect-[2/3] bg-gray-200 dark:bg-gray-800 animate-pulse" />
//                     ))}
//                   </div>
//                 }
//                 scrollableTarget="scroll-container"
//                 endMessage={
//                   <p className="text-center text-gray-500 dark:text-gray-400 my-4 py-2 text-sm">
//                     \U0001f389 You've seen all the amazing wallpapers!
//                   </p>
//                 }
//               >
//                 <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 2xl:grid-cols-12 gap-0.5">
//                   {allWallpapers.map((wallpaper, index) => (
//                     <CompactImageCard
//                       key={`${wallpaper.id}-${index}`}
//                       wallpaper={wallpaper}
//                       onClick={() => setActiveImageIndex(index)}
//                       index={index}
//                     />
//                   ))}
//                 </div>
//               </InfiniteScroll>

//               {/* Infinite scroll trigger for fallback */}
//               <div ref={ref} className="h-1" />
//             </>
//           )}
//         </div>
//       </main>

//       {/* Image Modal */}
//       {activeImageIndex !== null && !isSlideshowActive && (
//         <ImmersiveImageModal
//           wallpaper={allWallpapers[activeImageIndex]}
//           onClose={() => setActiveImageIndex(null)}
//           onPrev={handlePrevImage}
//           onNext={handleNextImage}
//           onStartSlideshow={startSlideshow}
//           hasPrev={activeImageIndex > 0}
//           hasNext={activeImageIndex < allWallpapers.length - 1}
//           currentIndex={activeImageIndex}
//           totalCount={allWallpapers.length}
//         />
//       )}

//       {/* Slideshow Modal */}
//       {isSlideshowActive && activeImageIndex !== null && (
//         <ImmersiveSlideshow
//           wallpapers={allWallpapers}
//           initialIndex={activeImageIndex}
//           onClose={stopSlideshow}
//           isPlaying={isSlideshowPlaying}
//           onTogglePlay={toggleSlideshowPlay}
//           onNext={handleSlideshowNext}
//           onPrev={handleSlideshowPrev}
//           currentIndex={activeImageIndex}
//         />
//       )}
//     </div>
//   );
// }

// // --- TanStack Router and Query Client Setup ---
// const queryClient = new QueryClient({
//   defaultOptions: {
//     queries: {
//       staleTime: 5 * 60 * 1000, // 5 minutes
//       gcTime: 10 * 60 * 1000, // 10 minutes
//     },
//   },
// });

// export const Route = createFileRoute('/wallheaven')({
//   errorComponent: ({ error }) => (
//     <div className="p-6 text-red-500">
//       Oops! {(error as any)?.message ? String((error as any).message) : String(error)}
//     </div>
//   ),
//   component: () => (
//     <QueryClientProvider client={queryClient}>
//       <RouteComponent />
//       <Toaster
//         position="bottom-right"
//         toastOptions={{
//           duration: 4000,
//           style: {
//             background: '#363636',
//             color: '#fff',
//           },
//         }}
//       />
//     </QueryClientProvider>
//   ),
// });







// import { createFileRoute } from '@tanstack/react-router';
// import { QueryClient, QueryClientProvider, useInfiniteQuery } from '@tanstack/react-query';
// import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
// import InfiniteScroll from 'react-infinite-scroll-component';
// import { useInView } from 'react-intersection-observer';
// import { Toaster, toast } from 'react-hot-toast';
// import {
//   Search,
//   X,
//   Download,
//   ChevronLeft,
//   ChevronRight,
//   Play,
//   Pause,
//   Maximize,
//   Minimize,
//   Filter,
//   ChevronDown,
//   ArrowUp,
//   Grid,
//   List,
//   Heart,
//   Eye,
//   Info,
//   Settings,
//   Sliders,
//   Zap,
//   Image as ImageIcon,
//   Monitor,
//   Smartphone,
//   Tablet,
//   Sun,
//   Moon,
//   RefreshCw,
//   Bookmark,
//   Share2,
//   ExternalLink,
//   Key,
//   Film,
//   Save,
//   FolderOpen,
//   HardDrive,
//   MousePointer,
// } from 'lucide-react';

// // --- TYPES ---
// interface Wallpaper {
//   id: string;
//   path: string;
//   url: string;
//   dimension_x: number;
//   dimension_y: number;
//   resolution: string;
//   file_size: number;
//   file_type?: string | null;
//   category?: string | null;
//   purity: string;
//   ratio: string;
//   source: string | null;
//   views: number;
//   favorites: number;
//   created_at: string;
//   thumbs: {
//     small: string;
//     original: string;
//   };
//   uploader?: {
//     username?: string | null;
//   } | null;
//   tags?: Tag[] | null;
// }

// interface Tag {
//   id: number;
//   name: string;
//   alias?: string | null;
//   category?: string | null;
// }

// interface ApiResponse {
//   data: Wallpaper[];
//   meta: {
//     current_page: number;
//     last_page: number;
//   };
// }

// interface FilterOptions {
//   categories: {
//     general: boolean;
//     anime: boolean;
//     people: boolean;
//   };
//   purity: {
//     sfw: boolean;
//     sketchy: boolean;
//     nsfw: boolean;
//   };
//   sorting: 'toplist' | 'date_added' | 'relevance' | 'random' | 'views' | 'favorites';
//   topRange: '1d' | '3d' | '1w' | '1M' | '3M' | '6M' | '1y';
//   resolutions: string[];
//   ratios: string[];
//   colors: string[];
//   keywords?: string;
// }

// interface AppState {
//   filters: FilterOptions;
//   activeImageIndex: number | null;
//   viewMode: 'grid' | 'list';
//   isDarkMode: boolean;
//   gridScale: number;
//   hoverPreviewEnabled: boolean;
//   movieModeActive: boolean;
//   movieModeKeywords: {
//     topLeft: string;
//     topRight: string;
//     bottomLeft: string;
//     bottomRight: string;
//   };
//   movieModeInfinite: boolean;
//   apiKey: string;
//   cacheDirectory: string;
// }

// // --- IndexedDB Storage ---
// const DB_NAME = 'wallhaven_explorer_db';
// const DB_VERSION = 1;
// const STORE_NAME = 'app_state';
// const IMAGE_CACHE_STORE = 'image_cache';

// class AppStorage {
//   private db: IDBDatabase | null = null;

//   async init() {
//     return new Promise<void>((resolve, reject) => {
//       const request = indexedDB.open(DB_NAME, DB_VERSION);
      
//       request.onerror = () => reject(request.error);
//       request.onsuccess = () => {
//         this.db = request.result;
//         resolve();
//       };
      
//       request.onupgradeneeded = (event) => {
//         const db = (event.target as IDBOpenDBRequest).result;
        
//         // Create store for app state
//         if (!db.objectStoreNames.contains(STORE_NAME)) {
//           db.createObjectStore(STORE_NAME);
//         }
        
//         // Create store for image cache
//         if (!db.objectStoreNames.contains(IMAGE_CACHE_STORE)) {
//           const imageStore = db.createObjectStore(IMAGE_CACHE_STORE);
//           imageStore.createIndex('url', 'url', { unique: true });
//         }
//       };
//     });
//   }

//   async saveState(state: Partial<AppState>) {
//     if (!this.db) await this.init();
    
//     return new Promise<void>((resolve, reject) => {
//       const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
//       const store = transaction.objectStore(STORE_NAME);
//       const request = store.put(state, 'app_state');
      
//       request.onerror = () => reject(request.error);
//       request.onsuccess = () => resolve();
//     });
//   }

//   async loadState(): Promise<Partial<AppState> | null> {
//     if (!this.db) await this.init();
    
//     return new Promise((resolve, reject) => {
//       const transaction = this.db!.transaction([STORE_NAME], 'readonly');
//       const store = transaction.objectStore(STORE_NAME);
//       const request = store.get('app_state');
      
//       request.onerror = () => reject(request.error);
//       request.onsuccess = () => resolve(request.result || null);
//     });
//   }

//   async cacheImage(url: string, blob: Blob) {
//     if (!this.db) await this.init();
    
//     return new Promise<void>((resolve, reject) => {
//       const transaction = this.db!.transaction([IMAGE_CACHE_STORE], 'readwrite');
//       const store = transaction.objectStore(IMAGE_CACHE_STORE);
//       const request = store.put({ url, blob, timestamp: Date.now() }, url);
      
//       request.onerror = () => reject(request.error);
//       request.onsuccess = () => resolve();
//     });
//   }

//   async getCachedImage(url: string): Promise<Blob | null> {
//     if (!this.db) await this.init();
    
//     return new Promise((resolve, reject) => {
//       const transaction = this.db!.transaction([IMAGE_CACHE_STORE], 'readonly');
//       const store = transaction.objectStore(IMAGE_CACHE_STORE);
//       const request = store.get(url);
      
//       request.onerror = () => reject(request.error);
//       request.onsuccess = () => {
//         const result = request.result;
//         if (result) {
//           resolve(result.blob);
//         } else {
//           resolve(null);
//         }
//       };
//     });
//   }

//   async clearOldCache(maxAge: number = 7 * 24 * 60 * 60 * 1000) { // Default: 7 days
//     if (!this.db) await this.init();
    
//     return new Promise<void>((resolve, reject) => {
//       const transaction = this.db!.transaction([IMAGE_CACHE_STORE], 'readwrite');
//       const store = transaction.objectStore(IMAGE_CACHE_STORE);
//       const index = store.index('url');
//       const request = index.openCursor();
      
//       request.onerror = () => reject(request.error);
//       request.onsuccess = (event) => {
//         const cursor = (event.target as IDBRequest).result;
//         if (cursor) {
//           const data = cursor.value;
//           if (Date.now() - data.timestamp > maxAge) {
//             cursor.delete();
//           }
//           cursor.continue();
//         } else {
//           resolve();
//         }
//       };
//     });
//   }
// }

// const appStorage = new AppStorage();

// // --- API Service ---
// let API_KEY = 'EFkCFHGlTBVugFhK9SOI4F5GoQJTOW0W';
// const BASE_URL = 'https://wallhaven.cc/api/v1/search';

// type FetchParams = {
//   pageParam?: number;
//   signal?: AbortSignal;
//   filters: FilterOptions;
// };

// const fetchWallpapers = async ({ pageParam = 1, signal, filters }: FetchParams): Promise<ApiResponse> => {
//   // Build categories string (3 bits: general, anime, people)
//   const categoriesString = 
//     (filters.categories.general ? '1' : '0') +
//     (filters.categories.anime ? '1' : '0') +
//     (filters.categories.people ? '1' : '0');

//   // Build purity string (3 bits: sfw, sketchy, nsfw)
//   const purityString = 
//     (filters.purity.sfw ? '1' : '0') +
//     (filters.purity.sketchy ? '1' : '0') +
//     (filters.purity.nsfw ? '1' : '0');

//   const params = new URLSearchParams({
//     apikey: API_KEY,
//     sorting: filters.sorting,
//     categories: categoriesString,
//     purity: purityString,
//     topRange: filters.topRange,
//     page: pageParam.toString(),
//   });

//   if (filters.keywords) {
//     params.append('q', filters.keywords);
//   }

//   const response = await fetch(`${BASE_URL}?${params.toString()}`, { signal });

//   if (response.status === 429) {
//     toast.error('Rate limit exceeded. Please wait a moment.');
//     throw new Error('Rate limit exceeded');
//   }

//   if (!response.ok) {
//     throw new Error('Network response was not ok');
//   }

//   const data: ApiResponse = await response.json();
//   return data;
// };

// // --- COMPONENTS ---

// // Image Cache Component
// const ImageWithCache = ({ 
//   src, 
//   alt, 
//   className, 
//   onLoad, 
//   onError 
// }: { 
//   src: string; 
//   alt: string; 
//   className?: string; 
//   onLoad?: () => void; 
//   onError?: () => void; 
// }) => {
//   const [imageSrc, setImageSrc] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     const loadImage = async () => {
//       try {
//         // Try to get from cache first
//         const cachedBlob = await appStorage.getCachedImage(src);
        
//         if (cachedBlob) {
//           const objectUrl = URL.createObjectURL(cachedBlob);
//           setImageSrc(objectUrl);
//           setIsLoading(false);
//           onLoad?.();
//           return;
//         }
        
//         // If not in cache, fetch and cache
//         const response = await fetch(src);
//         const blob = await response.blob();
        
//         // Cache the image
//         await appStorage.cacheImage(src, blob);
        
//         // Create object URL
//         const objectUrl = URL.createObjectURL(blob);
//         setImageSrc(objectUrl);
//         setIsLoading(false);
//         onLoad?.();
//       } catch (error) {
//         console.error('Error loading image:', error);
//         setImageSrc(src); // Fallback to original URL
//         setIsLoading(false);
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

//   if (isLoading) {
//     return (
//       <div className={`flex items-center justify-center bg-gray-200 dark:bg-gray-800 ${className}`}>
//         <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
//       </div>
//     );
//   }

//   return (
//     <img
//       src={imageSrc || src}
//       alt={alt}
//       className={className}
//       loading="lazy"
//     />
//   );
// };

// // Hover Preview Component
// const HoverPreview = ({ 
//   wallpaper, 
//   enabled, 
//   mousePosition 
// }: { 
//   wallpaper: Wallpaper; 
//   enabled: boolean; 
//   mousePosition: { x: number; y: number } 
// }) => {
//   const [position, setPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });
//   const previewRef = useRef<HTMLDivElement>(null);
//   const [isVisible, setIsVisible] = useState(false);

//   useEffect(() => {
//     if (!enabled || !previewRef.current) return;

//     const updatePosition = () => {
//       const viewportWidth = window.innerWidth;
//       const viewportHeight = window.innerHeight;
//       const previewWidth = Math.min(viewportWidth * 0.6, 800);
//       const previewHeight = Math.min(viewportHeight * 0.8, 600);
      
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
//   }, [enabled, mousePosition]);

//   useEffect(() => {
//     if (enabled) {
//       const timer = setTimeout(() => setIsVisible(true), 300);
//       return () => clearTimeout(timer);
//     } else {
//       setIsVisible(false);
//     }
//   }, [enabled]);

//   if (!enabled || !isVisible) return null;

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
//         src={wallpaper.path}
//         alt={`Preview of ${wallpaper.id}`}
//         className="w-full h-full object-contain"
//       />
//       <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 text-white">
//         <p className="text-sm font-semibold">{wallpaper.resolution}</p>
//         <div className="flex items-center gap-2 mt-1">
//           <span className="flex items-center gap-1 text-xs">
//             <Heart size={10} />
//             {wallpaper.favorites}
//           </span>
//           <span className="flex items-center gap-1 text-xs">
//             <Eye size={10} />
//             {wallpaper.views}
//           </span>
//         </div>
//       </div>
//     </div>
//   );
// };

// // Compact Filter Panel Component
// const CompactFilterPanel = ({ 
//   filters, 
//   setFilters,
//   isOpen,
//   setIsOpen 
// }: { 
//   filters: FilterOptions; 
//   setFilters: (filters: FilterOptions) => void;
//   isOpen: boolean;
//   setIsOpen: (open: boolean) => void;
// }) => {
//   const handleCategoryToggle = (category: keyof FilterOptions['categories']) => {
//     setFilters({
//       ...filters,
//       categories: {
//         ...filters.categories,
//         [category]: !filters.categories[category],
//       },
//     });
//   };

//   const handlePurityToggle = (purity: keyof FilterOptions['purity']) => {
//     setFilters({
//       ...filters,
//       purity: {
//         ...filters.purity,
//         [purity]: !filters.purity[purity],
//       },
//     });
//   };

//   // Close on click outside
//   useEffect(() => {
//     const handleClickOutside = (e: MouseEvent) => {
//       const target = e.target as HTMLElement;
//       if (isOpen && !target.closest('.filter-panel')) {
//         setIsOpen(false);
//       }
//     };

//     document.addEventListener('click', handleClickOutside);
//     return () => document.removeEventListener('click', handleClickOutside);
//   }, [isOpen, setIsOpen]);

//   return (
//     <div className="relative filter-panel">
//       <button
//         onClick={() => setIsOpen(!isOpen)}
//         className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
//       >
//         <Sliders size={16} />
//         <span className="text-sm">Filters</span>
//         <ChevronDown size={14} className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
//       </button>

//       {isOpen && (
//         <div className="absolute top-full right-0 mt-1 w-72 bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-3 z-50">
//           {/* Keywords Search */}
//           <div className="mb-3">
//             <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Keywords</h3>
//             <input
//               type="text"
//               value={filters.keywords || ''}
//               onChange={(e) => setFilters({ ...filters, keywords: e.target.value })}
//               placeholder="Enter keywords..."
//               className="w-full px-2 py-1 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 focus:border-blue-500 dark:text-gray-300"
//             />
//           </div>

//           {/* Quick Categories */}
//           <div className="mb-3">
//             <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Categories</h3>
//             <div className="flex gap-2">
//               <button
//                 onClick={() => handleCategoryToggle('general')}
//                 className={`px-2 py-1 text-xs rounded ${
//                   filters.categories.general 
//                     ? 'bg-blue-500 text-white' 
//                     : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
//                 }`}
//               >
//                 General
//               </button>
//               <button
//                 onClick={() => handleCategoryToggle('anime')}
//                 className={`px-2 py-1 text-xs rounded ${
//                   filters.categories.anime 
//                     ? 'bg-blue-500 text-white' 
//                     : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
//                 }`}
//               >
//                 Anime
//               </button>
//               <button
//                 onClick={() => handleCategoryToggle('people')}
//                 className={`px-2 py-1 text-xs rounded ${
//                   filters.categories.people 
//                     ? 'bg-blue-500 text-white' 
//                     : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
//                 }`}
//               >
//                 People
//               </button>
//             </div>
//           </div>

//           {/* Quick Purity */}
//           <div className="mb-3">
//             <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Purity</h3>
//             <div className="flex gap-2">
//               <button
//                 onClick={() => handlePurityToggle('sfw')}
//                 className={`px-2 py-1 text-xs rounded ${
//                   filters.purity.sfw 
//                     ? 'bg-green-500 text-white' 
//                     : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
//                 }`}
//               >
//                 SFW
//               </button>
//               <button
//                 onClick={() => handlePurityToggle('sketchy')}
//                 className={`px-2 py-1 text-xs rounded ${
//                   filters.purity.sketchy 
//                     ? 'bg-yellow-500 text-white' 
//                     : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
//                 }`}
//               >
//                 Sketchy
//               </button>
//               <button
//                 onClick={() => handlePurityToggle('nsfw')}
//                 className={`px-2 py-1 text-xs rounded ${
//                   filters.purity.nsfw 
//                     ? 'bg-red-500 text-white' 
//                     : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
//                 }`}
//               >
//                 NSFW
//               </button>
//             </div>
//           </div>

//           {/* Sorting */}
//           <div className="mb-3">
//             <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Sort By</h3>
//             <select
//               value={filters.sorting}
//               onChange={(e) => setFilters({ ...filters, sorting: e.target.value as FilterOptions['sorting'] })}
//               className="w-full px-2 py-1 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 focus:border-blue-500 dark:text-gray-300"
//             >
//               <option value="toplist">Top List</option>
//               <option value="date_added">Date Added</option>
//               <option value="relevance">Relevance</option>
//               <option value="random">Random</option>
//               <option value="views">Views</option>
//               <option value="favorites">Favorites</option>
//             </select>
//           </div>

//           {/* Time Range (only for toplist) */}
//           {filters.sorting === 'toplist' && (
//             <div>
//               <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Time Range</h3>
//               <select
//                 value={filters.topRange}
//                 onChange={(e) => setFilters({ ...filters, topRange: e.target.value as FilterOptions['topRange'] })}
//                 className="w-full px-2 py-1 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 focus:border-blue-500 dark:text-gray-300"
//               >
//                 <option value="1d">Last Day</option>
//                 <option value="3d">Last 3 Days</option>
//                 <option value="1w">Last Week</option>
//                 <option value="1M">Last Month</option>
//                 <option value="3M">Last 3 Months</option>
//                 <option value="6M">Last 6 Months</option>
//                 <option value="1y">Last Year</option>
//               </select>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// // Compact Image Card Component
// const CompactImageCard = ({
//   wallpaper,
//   onClick,
//   index,
//   gridScale,
//   onHover,
//   hoverPreviewEnabled,
// }: {
//   wallpaper: Wallpaper;
//   onClick: () => void;
//   index: number;
//   gridScale: number;
//   onHover: (wallpaper: Wallpaper | null) => void;
//   hoverPreviewEnabled: boolean;
// }) => {
//   const [imageError, setImageError] = useState(false);
//   const [isHovered, setIsHovered] = useState(false);
//   const [isLiked, setIsLiked] = useState(false);
//   const [isBookmarked, setIsBookmarked] = useState(false);

//   // Purity indicator colors
//   const purityColors = {
//     sfw: 'bg-green-500',
//     sketchy: 'bg-yellow-500',
//     nsfw: 'bg-red-500',
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
//     window.open(wallpaper.path, '_blank');
//   };

//   const handleMouseEnter = () => {
//     setIsHovered(true);
//     if (hoverPreviewEnabled) {
//       onHover(wallpaper);
//     }
//   };

//   const handleMouseLeave = () => {
//     setIsHovered(false);
//     if (hoverPreviewEnabled) {
//       onHover(null);
//     }
//   };

//   return (
//     <div
//       className="relative block bg-gray-200 dark:bg-gray-800 overflow-hidden cursor-pointer group"
//       style={{
//         aspectRatio: `${wallpaper.dimension_x}/${wallpaper.dimension_y}`,
//         width: `${100 * gridScale}%`,
//       }}
//       onClick={onClick}
//       onMouseEnter={handleMouseEnter}
//       onMouseLeave={handleMouseLeave}
//     >
//       {/* Purity Indicator */}
//       <div className={`absolute top-1 left-1 w-1.5 h-1.5 rounded-full z-10 ${purityColors[wallpaper.purity as keyof typeof purityColors]}`} />
      
//       {/* Index Badge */}
//       <div className="absolute top-1 right-1 z-10 bg-black/50 text-white text-xs px-1 rounded">
//         {index + 1}
//       </div>
      
//       {!imageError ? (
//         <ImageWithCache
//           src={wallpaper.thumbs?.small ?? wallpaper.thumbs?.original ?? wallpaper.path}
//           alt={`Wallpaper ${wallpaper.id}`}
//           className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
//           onError={() => setImageError(true)}
//         />
//       ) : (
//         <div className="w-full h-full flex items-center justify-center bg-gray-300 dark:bg-gray-700">
//           <ImageIcon size={24} className="text-gray-500 dark:text-gray-400" />
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
//             <p className="font-semibold">{wallpaper.resolution}</p>
//             <div className="flex items-center gap-2 mt-1">
//               <span className="flex items-center gap-1">
//                 <Heart size={10} />
//                 {wallpaper.favorites}
//               </span>
//               <span className="flex items-center gap-1">
//                 <Eye size={10} />
//                 {wallpaper.views}
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
// };

// // Movie Mode Component
// const MovieMode = ({
//   wallpapers,
//   onClose,
//   keywords,
//   infiniteMode,
//   onKeywordChange,
// }: {
//   wallpapers: Wallpaper[];
//   onClose: () => void;
//   keywords: {
//     topLeft: string;
//     topRight: string;
//     bottomLeft: string;
//     bottomRight: string;
//   };
//   infiniteMode: boolean;
//   onKeywordChange: (position: keyof typeof keywords, value: string) => void;
// }) => {
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [isPlaying, setIsPlaying] = useState(true);
//   const [keywordInputs, setKeywordInputs] = useState(keywords);
//   const intervalRef = useRef<NodeJS.Timeout | null>(null);

//   // Filter wallpapers based on keywords
//   const filteredWallpapers = useMemo(() => {
//     if (!keywords.topLeft && !keywords.topRight && !keywords.bottomLeft && !keywords.bottomRight) {
//       return wallpapers;
//     }

//     return wallpapers.filter(wallpaper => {
//       const tags = wallpaper.tags?.map(tag => tag.name.toLowerCase()).join(' ') || '';
//       const category = wallpaper.category?.toLowerCase() || '';
//       const purity = wallpaper.purity.toLowerCase();
//       const allText = `${tags} ${category} ${purity}`.toLowerCase();

//       return (
//         (keywords.topLeft && allText.includes(keywords.topLeft.toLowerCase())) ||
//         (keywords.topRight && allText.includes(keywords.topRight.toLowerCase())) ||
//         (keywords.bottomLeft && allText.includes(keywords.bottomLeft.toLowerCase())) ||
//         (keywords.bottomRight && allText.includes(keywords.bottomRight.toLowerCase()))
//       );
//     });
//   }, [wallpapers, keywords]);

//   // Get 4 wallpapers for current display
//   const getDisplayWallpapers = () => {
//     const result = [];
//     const startIndex = currentIndex * 4;
    
//     for (let i = 0; i < 4; i++) {
//       const index = (startIndex + i) % filteredWallpapers.length;
//       result.push(filteredWallpapers[index]);
//     }
    
//     return result;
//   };

//   const displayWallpapers = getDisplayWallpapers();

//   // Auto-advance slideshow
//   useEffect(() => {
//     if (isPlaying) {
//       intervalRef.current = setInterval(() => {
//         setCurrentIndex(prev => {
//           const maxIndex = Math.ceil(filteredWallpapers.length / 4) - 1;
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
//   }, [isPlaying, filteredWallpapers.length, infiniteMode]);

//   const handleKeywordInputChange = (position: keyof typeof keywords, value: string) => {
//     setKeywordInputs(prev => ({ ...prev, [position]: value }));
//   };

//   const handleKeywordSubmit = (position: keyof typeof keywords) => {
//     onKeywordChange(position, keywordInputs[position]);
//   };

//   return (
//     <div className="fixed inset-0 bg-black z-50 flex flex-col">
//       {/* Controls */}
//       <div className="bg-gray-900 p-4 flex justify-between items-center">
//         <div className="flex items-center gap-4">
//           <h2 className="text-white text-xl font-bold flex items-center gap-2">
//             <Film size={24} />
//             Movie Mode
//           </h2>
//           <div className="flex items-center gap-2">
//             <button
//               onClick={() => setIsPlaying(!isPlaying)}
//               className="p-2 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition-colors"
//             >
//               {isPlaying ? <Pause size={20} /> : <Play size={20} />}
//             </button>
//             <button
//               onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
//               className="p-2 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition-colors"
//             >
//               <ChevronLeft size={20} />
//             </button>
//             <button
//               onClick={() => setCurrentIndex(prev => {
//                 const maxIndex = Math.ceil(filteredWallpapers.length / 4) - 1;
//                 return prev < maxIndex ? prev + 1 : prev;
//               })}
//               className="p-2 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition-colors"
//             >
//               <ChevronRight size={20} />
//             </button>
//           </div>
//           <div className="flex items-center gap-2">
//             <label className="text-white text-sm flex items-center gap-1">
//               <input
//                 type="checkbox"
//                 checked={infiniteMode}
//                 onChange={() => {}} // Will be handled by parent
//                 className="rounded"
//               />
//               Infinite Loop
//             </label>
//           </div>
//         </div>
//         <button
//           onClick={onClose}
//           className="p-2 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition-colors"
//         >
//           <X size={20} />
//         </button>
//       </div>

//       {/* 2x2 Grid */}
//       <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-1 p-1">
//         {displayWallpapers.map((wallpaper, index) => {
//           const position = ['topLeft', 'topRight', 'bottomLeft', 'bottomRight'][index] as keyof typeof keywords;
//           return (
//             <div key={index} className="relative bg-gray-800 overflow-hidden">
//               <ImageWithCache
//                 src={wallpaper.path}
//                 alt={`Movie mode image ${index + 1}`}
//                 className="w-full h-full object-cover"
//               />
//               <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
//                 <div className="flex items-center gap-2">
//                   <input
//                     type="text"
//                     value={keywordInputs[position]}
//                     onChange={(e) => handleKeywordInputChange(position, e.target.value)}
//                     placeholder={`Keywords for ${position.replace(/([A-Z])/g, ' $1').toLowerCase()}`}
//                     className="flex-1 px-2 py-1 bg-black/50 text-white text-xs rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
//                   />
//                   <button
//                     onClick={() => handleKeywordSubmit(position)}
//                     className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
//                   >
//                     <Save size={14} />
//                   </button>
//                 </div>
//                 <p className="text-white text-xs mt-1">{wallpaper.resolution}</p>
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       {/* Progress Bar */}
//       <div className="bg-gray-900 p-2">
//         <div className="w-full bg-gray-700 rounded-full h-1">
//           <div
//             className="bg-blue-500 h-1 rounded-full transition-all duration-1000 ease-linear"
//             style={{ 
//               width: `${((currentIndex + 1) / Math.ceil(filteredWallpapers.length / 4)) * 100}%` 
//             }}
//           />
//         </div>
//         <p className="text-white text-xs mt-1 text-center">
//           {currentIndex + 1} / {Math.ceil(filteredWallpapers.length / 4)} sets
//         </p>
//       </div>
//     </div>
//   );
// };

// // Enhanced Image Modal Component
// const ImmersiveImageModal = ({
//   wallpaper,
//   onClose,
//   onPrev,
//   onNext,
//   onStartSlideshow,
//   hasPrev,
//   hasNext,
//   currentIndex,
//   totalCount,
// }: {
//   wallpaper: Wallpaper;
//   onClose: () => void;
//   onPrev: () => void;
//   onNext: () => void;
//   onStartSlideshow: () => void;
//   hasPrev: boolean;
//   hasNext: boolean;
//   currentIndex: number;
//   totalCount: number;
// }) => {
//   const [isFullscreen, setIsFullscreen] = useState(false);
//   const [imageLoaded, setImageLoaded] = useState(false);
//   const [showInfo, setShowInfo] = useState(false);
//   const [isLiked, setIsLiked] = useState(false);
//   const [isBookmarked, setIsBookmarked] = useState(false);
//   const modalRef = useRef<HTMLDivElement>(null);
//   const uploaderName = wallpaper.uploader?.username ?? 'Anonymous';

//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       if (e.key === 'Escape') {
//         if (isFullscreen) {
//           setIsFullscreen(false);
//         } else {
//           onClose();
//         }
//       }
//       if (e.key === 'ArrowLeft' && hasPrev) onPrev();
//       if (e.key === 'ArrowRight' && hasNext) onNext();
//       if (e.key === ' ') {
//         e.preventDefault();
//         onStartSlideshow();
//       }
//       if (e.key === 'f') {
//         e.preventDefault();
//         setIsFullscreen((prev) => !prev);
//       }
//       if (e.key === 'i') {
//         e.preventDefault();
//         setShowInfo((prev) => !prev);
//       }
//       if (e.key === 'l') {
//         e.preventDefault();
//         setIsLiked(!isLiked);
//       }
//       if (e.key === 'b') {
//         e.preventDefault();
//         setIsBookmarked(!isBookmarked);
//       }
//     };

//     window.addEventListener('keydown', handleKeyDown);
//     return () => window.removeEventListener('keydown', handleKeyDown);
//   }, [onClose, onPrev, onNext, hasPrev, hasNext, isFullscreen, onStartSlideshow, isLiked, isBookmarked]);

//   useEffect(() => {
//     if (isFullscreen) {
//       document.documentElement.requestFullscreen?.();
//     } else if (document.fullscreenElement) {
//       document.exitFullscreen?.();
//     }
//   }, [isFullscreen]);

//   const handleImageLoad = () => {
//     setImageLoaded(true);
//   };

//   // Reset image loaded state when wallpaper changes
//   useEffect(() => {
//     setImageLoaded(false);
//   }, [wallpaper.id]);

//   const handleLike = () => {
//     setIsLiked(!isLiked);
//   };

//   const handleBookmark = () => {
//     setIsBookmarked(!isBookmarked);
//   };

//   const handleDownload = () => {
//     window.open(wallpaper.path, '_blank');
//   };

//   const handleShare = () => {
//     if (navigator.share) {
//       navigator.share({
//         title: `Wallpaper by ${uploaderName}`,
//         text: `Check out this amazing wallpaper!`,
//         url: wallpaper.path,
//       });
//     } else {
//       navigator.clipboard.writeText(wallpaper.path);
//       toast.success('Link copied to clipboard!');
//     }
//   };

//   return (
//     <div
//       className={`fixed inset-0 bg-black z-50 flex items-center justify-center transition-all duration-300 ${
//         isFullscreen ? 'p-0' : 'p-0'
//       }`}
//       onClick={onClose}
//     >
//       <div
//         ref={modalRef}
//         className={`relative w-full h-full flex flex-col transition-all duration-300 ${
//           isFullscreen ? 'w-full h-full' : 'w-full h-full'
//         }`}
//         onClick={(e) => e.stopPropagation()}
//       >
//         {/* Top Controls Bar */}
//         <div className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/70 to-transparent p-4">
//           <div className="flex justify-between items-center">
//             <div className="flex items-center gap-3 text-white">
//               <span className="text-sm bg-black/50 px-2 py-1 rounded backdrop-blur-sm">
//                 {currentIndex + 1} / {totalCount}
//               </span>
//               <span className="text-sm">{wallpaper.resolution}</span>
//               <span className="text-sm capitalize">{wallpaper.purity}</span>
//             </div>
//             <div className="flex items-center gap-2">
//               <button
//                 onClick={handleLike}
//                 className={`p-2 rounded-full transition-colors ${
//                   isLiked ? 'bg-red-500 text-white' : 'bg-black/50 text-white hover:bg-black/70'
//                 }`}
//                 title="Like (L)"
//               >
//                 <Heart size={18} fill={isLiked ? 'white' : 'none'} />
//               </button>
//               <button
//                 onClick={handleBookmark}
//                 className={`p-2 rounded-full transition-colors ${
//                   isBookmarked ? 'bg-blue-500 text-white' : 'bg-black/50 text-white hover:bg-black/70'
//                 }`}
//                 title="Bookmark (B)"
//               >
//                 <Bookmark size={18} fill={isBookmarked ? 'white' : 'none'} />
//               </button>
//               <button
//                 onClick={handleShare}
//                 className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
//                 title="Share"
//               >
//                 <Share2 size={18} />
//               </button>
//               <button
//                 onClick={handleDownload}
//                 className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
//                 title="Download"
//               >
//                 <Download size={18} />
//               </button>
//               <button
//                 onClick={() => setShowInfo(!showInfo)}
//                 className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
//                 title="Info (I)"
//               >
//                 <Info size={18} />
//               </button>
//               <button
//                 onClick={onStartSlideshow}
//                 className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
//                 title="Start Slideshow (Space)"
//               >
//                 <Play size={18} />
//               </button>
//               <button
//                 onClick={() => setIsFullscreen((prev) => !prev)}
//                 className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
//                 title="Toggle Fullscreen (F)"
//               >
//                 {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
//               </button>
//               <button
//                 onClick={onClose}
//                 className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
//                 title="Close (Esc)"
//               >
//                 <X size={18} />
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Navigation Arrows */}
//         {hasPrev && (
//           <button
//             onClick={onPrev}
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
//           {!imageLoaded && (
//             <div className="absolute inset-0 flex items-center justify-center">
//               <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
//             </div>
//           )}
//           <ImageWithCache
//             src={wallpaper.path}
//             alt={`Wallpaper ${wallpaper.id}`}
//             className={`max-w-full max-h-full object-contain transition-opacity duration-300 ${
//               imageLoaded ? 'opacity-100' : 'opacity-0'
//             }`}
//             onLoad={handleImageLoad}
//           />
//         </div>

//         {/* Info Panel */}
//         {showInfo && (
//           <div className="absolute bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-black/80 to-transparent p-4 text-white">
//             <div className=" mx-auto">
//               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
//                 <div>
//                   <p className="font-semibold text-gray-300">Uploader</p>
//                   <p>{uploaderName}</p>
//                 </div>
//                 <div>
//                   <p className="font-semibold text-gray-300">Resolution</p>
//                   <p>{wallpaper.resolution}</p>
//                 </div>
//                 <div>
//                   <p className="font-semibold text-gray-300">Ratio</p>
//                   <p>{wallpaper.ratio}</p>
//                 </div>
//                 <div>
//                   <p className="font-semibold text-gray-300">Category</p>
//                   <p>{wallpaper.category ?? '\u2014'}</p>
//                 </div>
//                 <div>
//                   <p className="font-semibold text-gray-300">Favorites</p>
//                   <p>{wallpaper.favorites.toLocaleString()}</p>
//                 </div>
//                 <div>
//                   <p className="font-semibold text-gray-300">Views</p>
//                   <p>{wallpaper.views.toLocaleString()}</p>
//                 </div>
//                 <div>
//                   <p className="font-semibold text-gray-300">File Type</p>
//                   <p>{wallpaper.file_type ?? 'Unknown'}</p>
//                 </div>
//                 <div>
//                   <p className="font-semibold text-gray-300">Purity</p>
//                   <p className="capitalize">{wallpaper.purity}</p>
//                 </div>
//               </div>
//               <div className="mt-3">
//                 <p className="font-semibold text-gray-300 mb-1">Tags</p>
//                 <div className="flex flex-wrap gap-1">
//                   {(wallpaper.tags ?? []).map((tag) => (
//                     <span
//                       key={tag.id}
//                       className="bg-white/20 text-xs px-2 py-0.5 rounded-full"
//                     >
//                       {tag.name}
//                     </span>
//                   ))}
//                   {(wallpaper.tags ?? []).length === 0 && (
//                     <span className="text-xs text-gray-400">No tags</span>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// // Enhanced Slideshow Component
// const ImmersiveSlideshow = ({
//   wallpapers,
//   initialIndex,
//   onClose,
//   isPlaying,
//   onTogglePlay,
//   onNext,
//   onPrev,
//   currentIndex,
// }: {
//   wallpapers: Wallpaper[];
//   initialIndex: number;
//   onClose: () => void;
//   isPlaying: boolean;
//   onTogglePlay: () => void;
//   onNext: () => void;
//   onPrev: () => void;
//   currentIndex: number;
// }) => {
//   const [imageLoaded, setImageLoaded] = useState(false);
//   const [showControls, setShowControls] = useState(true);
//   const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       if (e.key === 'Escape') onClose();
//       if (e.key === ' ') {
//         e.preventDefault();
//         onTogglePlay();
//       }
//       if (e.key === 'ArrowLeft') onPrev();
//       if (e.key === 'ArrowRight') onNext();
//       if (e.key === 'h') {
//         e.preventDefault();
//         setShowControls((prev) => !prev);
//       }
//     };

//     window.addEventListener('keydown', handleKeyDown);
//     return () => window.removeEventListener('keydown', handleKeyDown);
//   }, [onClose, onTogglePlay, onNext, onPrev]);

//   const handleImageLoad = () => {
//     setImageLoaded(true);
//   };

//   useEffect(() => {
//     setImageLoaded(false);
//   }, [currentIndex]);

//   const handleMouseMove = () => {
//     setShowControls(true);
//     if (controlsTimeoutRef.current) {
//       clearTimeout(controlsTimeoutRef.current);
//     }
//     controlsTimeoutRef.current = setTimeout(() => {
//       setShowControls(false);
//     }, 3000);
//   };

//   useEffect(() => {
//     const container = document.getElementById('slideshow-container');
//     if (container) {
//       container.addEventListener('mousemove', handleMouseMove);
//       return () => {
//         container.removeEventListener('mousemove', handleMouseMove);
//         if (controlsTimeoutRef.current) {
//           clearTimeout(controlsTimeoutRef.current);
//         }
//       };
//     }
//   }, []);

//   return (
//     <div id="slideshow-container" className="fixed inset-0 bg-black z-50 flex items-center justify-center w-full h-full" onClick={onClose}>
//       {/* Controls */}
//       <div className={`absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/70 to-transparent p-4 transition-opacity duration-300 ${
//         showControls ? 'opacity-100' : 'opacity-0'
//       }`}>
//         <div className="flex justify-between items-center text-white">
//           <span className="text-sm bg-black/50  py-1 rounded-full backdrop-blur-sm">
//             {currentIndex + 1} / {wallpapers.length}
//           </span>
//           <div className="flex items-center gap-2">
//             <button
//               onClick={(e) => {
//                 e.stopPropagation();
//                 onTogglePlay();
//               }}
//               className="p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors backdrop-blur-sm"
//             >
//               {isPlaying ? <Pause size={20} /> : <Play size={20} />}
//             </button>
//             <button
//               onClick={(e) => {
//                 e.stopPropagation();
//                 onClose();
//               }}
//               className="p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors backdrop-blur-sm"
//             >
//               <X size={20} />
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Navigation Arrows */}
//       <div className={`absolute left-0 right-0 top-1/2 -translate-y-1/2 z-40 flex justify-between px-4 transition-opacity duration-300 ${
//         showControls ? 'opacity-100' : 'opacity-0'
//       }`}>
//         <button
//           onClick={(e) => {
//             e.stopPropagation();
//             onPrev();
//           }}
//           className="p-3 text-white bg-black/50 rounded-full hover:bg-black/70 transition-all backdrop-blur-sm hover:scale-110"
//         >
//           <ChevronLeft size={28} />
//         </button>
//         <button
//           onClick={(e) => {
//             e.stopPropagation();
//             onNext();
//           }}
//           className="p-3 text-white bg-black/50 rounded-full hover:bg-black/70 transition-all backdrop-blur-sm hover:scale-110"
//         >
//           <ChevronRight size={28} />
//         </button>
//       </div>

//       {/* Image */}
//       <div className="relative max-w-full max-h-full" onClick={(e) => e.stopPropagation()}>
//         {!imageLoaded && (
//           <div className="absolute inset-0 flex items-center justify-center">
//             <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin" />
//           </div>
//         )}
//         <ImageWithCache
//           src={wallpapers[currentIndex].path}
//           alt={`Slideshow image ${currentIndex + 1}`}
//           className={`max-w-full max-h-screen object-contain transition-opacity duration-300 ${
//             imageLoaded ? 'opacity-100' : 'opacity-0'
//           }`}
//           onLoad={handleImageLoad}
//         />
//       </div>

//       {/* Progress Bar */}
//       <div className={`absolute bottom-0 left-0 right-0 z-50 p-4 transition-opacity duration-300 ${
//         showControls ? 'opacity-100' : 'opacity-0'
//       }`}>
//         <div className="w-full bg-gray-600 rounded-full h-1">
//           <div
//             className="bg-white h-1 rounded-full transition-all duration-1000 ease-linear"
//             style={{ width: `${((currentIndex + 1) / wallpapers.length) * 100}%` }}
//           />
//         </div>
//         <div className="text-center text-white text-xs mt-2">
//           {wallpapers[currentIndex].resolution} • {wallpapers[currentIndex].purity}
//         </div>
//       </div>
//     </div>
//   );
// };

// // API Key Manager Component
// const ApiKeyManager = ({ 
//   isOpen, 
//   setIsOpen, 
//   apiKey, 
//   setApiKey 
// }: { 
//   isOpen: boolean; 
//   setIsOpen: (open: boolean) => void; 
//   apiKey: string; 
//   setApiKey: (key: string) => void; 
// }) => {
//   const [tempApiKey, setTempApiKey] = useState(apiKey);
//   const [savedKeys, setSavedKeys] = useState<string[]>([]);

//   useEffect(() => {
//     // Load saved API keys from local storage
//     const keys = JSON.parse(localStorage.getItem('savedApiKeys') || '[]');
//     setSavedKeys(keys);
//   }, []);

//   const handleSaveKey = () => {
//     if (tempApiKey.trim()) {
//       // Update the global API key
//       setApiKey(tempApiKey);
//       API_KEY = tempApiKey;
      
//       // Save to local storage
//       const keys = [...savedKeys.filter(k => k !== tempApiKey), tempApiKey];
//       localStorage.setItem('savedApiKeys', JSON.stringify(keys));
//       setSavedKeys(keys);
      
//       toast.success('API key updated successfully!');
//       setIsOpen(false);
//     } else {
//       toast.error('Please enter a valid API key');
//     }
//   };

//   const handleSelectKey = (key: string) => {
//     setTempApiKey(key);
//   };

//   const handleDeleteKey = (keyToDelete: string) => {
//     const updatedKeys = savedKeys.filter(k => k !== keyToDelete);
//     localStorage.setItem('savedApiKeys', JSON.stringify(updatedKeys));
//     setSavedKeys(updatedKeys);
    
//     if (tempApiKey === keyToDelete) {
//       setTempApiKey('');
//     }
    
//     toast.success('API key removed');
//   };

//   return (
//     <div className="relative">
//       <button
//         onClick={() => setIsOpen(!isOpen)}
//         className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
//       >
//         <Key size={16} />
//         <span className="text-sm">API Key</span>
//         <ChevronDown size={14} className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
//       </button>

//       {isOpen && (
//         <div className="absolute top-full right-0 mt-1 w-80 bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 z-50">
//           <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">API Key Management</h3>
          
//           <div className="mb-3">
//             <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
//               Enter API Key
//             </label>
//             <div className="flex gap-2">
//               <input
//                 type="text"
//                 value={tempApiKey}
//                 onChange={(e) => setTempApiKey(e.target.value)}
//                 placeholder="Your Wallhaven API key"
//                 className="flex-1 px-2 py-1 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 focus:border-blue-500 dark:text-gray-300"
//               />
//               <button
//                 onClick={handleSaveKey}
//                 className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
//               >
//                 Save
//               </button>
//             </div>
//           </div>

//           {savedKeys.length > 0 && (
//             <div>
//               <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Saved Keys</h4>
//               <div className="space-y-1 max-h-32 overflow-y-auto">
//                 {savedKeys.map((key, index) => (
//                   <div key={index} className="flex items-center justify-between p-1 bg-gray-50 dark:bg-gray-800 rounded">
//                     <button
//                       onClick={() => handleSelectKey(key)}
//                       className="text-xs text-gray-700 dark:text-gray-300 truncate flex-1 text-left"
//                     >
//                       {key.substring(0, 10)}...{key.substring(key.length - 5)}
//                     </button>
//                     <button
//                       onClick={() => handleDeleteKey(key)}
//                       className="p-1 text-red-500 hover:text-red-700 transition-colors"
//                     >
//                       <X size={12} />
//                     </button>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// // Cache Manager Component
// const CacheManager = ({ 
//   isOpen, 
//   setIsOpen,
//   cacheDirectory,
//   setCacheDirectory 
// }: { 
//   isOpen: boolean; 
//   setIsOpen: (open: boolean) => void;
//   cacheDirectory: string;
//   setCacheDirectory: (dir: string) => void;
// }) => {
//   const [cacheSize, setCacheSize] = useState(0);
//   const [isClearing, setIsClearing] = useState(false);

//   useEffect(() => {
//     // Calculate cache size
//     const calculateCacheSize = async () => {
//       try {
//         if ('storage' in navigator && 'estimate' in navigator.storage) {
//           const estimate = await navigator.storage.estimate();
//           setCacheSize(Math.round((estimate.usage || 0) / (1024 * 1024))); // Convert to MB
//         }
//       } catch (error) {
//         console.error('Error calculating cache size:', error);
//       }
//     };

//     calculateCacheSize();
//   }, [isOpen]);

//   const handleClearCache = async () => {
//     setIsClearing(true);
//     try {
//       await appStorage.clearOldCache(0); // Clear all cache
//       toast.success('Cache cleared successfully!');
//       setCacheSize(0);
//     } catch (error) {
//       console.error('Error clearing cache:', error);
//       toast.error('Failed to clear cache');
//     } finally {
//       setIsClearing(false);
//     }
//   };

//   const handleSelectDirectory = () => {
//     // In a real Electron app, you would use the dialog API
//     // For this example, we'll just use a prompt
//     const dir = prompt('Enter cache directory path:', cacheDirectory);
//     if (dir) {
//       setCacheDirectory(dir);
//       localStorage.setItem('cacheDirectory', dir);
//       toast.success('Cache directory updated!');
//     }
//   };

//   return (
//     <div className="relative">
//       <button
//         onClick={() => setIsOpen(!isOpen)}
//         className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
//       >
//         <HardDrive size={16} />
//         <span className="text-sm">Cache</span>
//         <ChevronDown size={14} className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
//       </button>

//       {isOpen && (
//         <div className="absolute top-full right-0 mt-1 w-72 bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 z-50">
//           <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Cache Management</h3>
          
//           <div className="mb-3">
//             <div className="flex justify-between items-center mb-2">
//               <span className="text-xs text-gray-600 dark:text-gray-400">Cache Size</span>
//               <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{cacheSize} MB</span>
//             </div>
//             <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
//               <div 
//                 className="bg-blue-600 h-2 rounded-full" 
//                 style={{ width: `${Math.min(100, (cacheSize / 500) * 100)}%` }}
//               />
//             </div>
//           </div>

//           <div className="mb-3">
//             <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
//               Cache Directory
//             </label>
//             <div className="flex gap-2">
//               <div className="flex-1 px-2 py-1 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 truncate">
//                 {cacheDirectory}
//               </div>
//               <button
//                 onClick={handleSelectDirectory}
//                 className="p-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
//                 title="Select Directory"
//               >
//                 <FolderOpen size={14} />
//               </button>
//             </div>
//           </div>

//           <button
//             onClick={handleClearCache}
//             disabled={isClearing || cacheSize === 0}
//             className="w-full px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
//           >
//             {isClearing ? 'Clearing...' : 'Clear Cache'}
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// // Compact Header Component
// const CompactHeader = ({
//   title,
//   onRefresh,
//   onViewModeChange,
//   viewMode,
//   onThemeToggle,
//   isDarkMode,
//   activeImageIndex,
//   onStartSlideshow,
//   filterPanelOpen,
//   setFilterPanelOpen,
//   filters,
//   setFilters,
//   gridScale,
//   onGridScaleChange,
//   hoverPreviewEnabled,
//   onHoverPreviewToggle,
//   apiKeyManagerOpen,
//   setApiKeyManagerOpen,
//   apiKey,
//   setApiKey,
//   cacheManagerOpen,
//   setCacheManagerOpen,
//   cacheDirectory,
//   setCacheDirectory,
//   onMovieModeToggle,
// }: {
//   title: string;
//   onRefresh: () => void;
//   onViewModeChange: (mode: 'grid' | 'list') => void;
//   viewMode: 'grid' | 'list';
//   onThemeToggle: () => void;
//   isDarkMode: boolean;
//   activeImageIndex: number | null;
//   onStartSlideshow: () => void;
//   filterPanelOpen: boolean;
//   setFilterPanelOpen: (open: boolean) => void;
//   filters: FilterOptions;
//   setFilters: (filters: FilterOptions) => void;
//   gridScale: number;
//   onGridScaleChange: (scale: number) => void;
//   hoverPreviewEnabled: boolean;
//   onHoverPreviewToggle: () => void;
//   apiKeyManagerOpen: boolean;
//   setApiKeyManagerOpen: (open: boolean) => void;
//   apiKey: string;
//   setApiKey: (key: string) => void;
//   cacheManagerOpen: boolean;
//   setCacheManagerOpen: (open: boolean) => void;
//   cacheDirectory: string;
//   setCacheDirectory: (dir: string) => void;
//   onMovieModeToggle: () => void;
// }) => {
//   return (
//     <header className="flex-shrink-0 sticky top-0 z-40 bg-white/90 dark:bg-gray-950/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
//       <div className="container mx-auto px-2 py-2 flex justify-between items-center">
//         <div className="flex items-center gap-2">
//           <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">{title}</h1>
//           <button
//             onClick={onRefresh}
//             className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
//             title="Refresh"
//           >
//             <RefreshCw size={16} />
//           </button>
//         </div>
        
//         <div className="flex items-center gap-2">
//           {activeImageIndex !== null && (
//             <button
//               onClick={onStartSlideshow}
//               className="flex items-center gap-1 px-2 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
//             >
//               <Play size={14} />
//               Slideshow
//             </button>
//           )}
          
//           <button
//             onClick={onMovieModeToggle}
//             className="flex items-center gap-1 px-2 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition-colors"
//           >
//             <Film size={14} />
//             Movie Mode
//           </button>
          
//           <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded">
//             <button
//               onClick={() => onViewModeChange('grid')}
//               className={`p-1 rounded ${
//                 viewMode === 'grid' 
//                   ? 'bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white' 
//                   : 'text-gray-600 dark:text-gray-400'
//               }`}
//               title="Grid View"
//             >
//               <Grid size={16} />
//             </button>
//             <button
//               onClick={() => onViewModeChange('list')}
//               className={`p-1 rounded ${
//                 viewMode === 'list' 
//                   ? 'bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white' 
//                   : 'text-gray-600 dark:text-gray-400'
//               }`}
//               title="List View"
//             >
//               <List size={16} />
//             </button>
//           </div>
          
//           <div className="flex items-center gap-1">
//             <button
//               onClick={onHoverPreviewToggle}
//               className={`p-1 rounded ${
//                 hoverPreviewEnabled 
//                   ? 'bg-blue-500 text-white' 
//                   : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
//               }`}
//               title="Toggle Hover Preview"
//             >
//               <MousePointer size={16} />
//             </button>
            
//             <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded px-1">
//               <span className="text-xs text-gray-600 dark:text-gray-400 mr-1">Scale</span>
//               <input
//                 type="range"
//                 min="0.5"
//                 max="2"
//                 step="0.1"
//                 value={gridScale}
//                 onChange={(e) => onGridScaleChange(parseFloat(e.target.value))}
//                 className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
//               />
//               <span className="text-xs text-gray-600 dark:text-gray-400 ml-1">{gridScale.toFixed(1)}x</span>
//             </div>
//           </div>
          
//           <CompactFilterPanel 
//             filters={filters} 
//             setFilters={setFilters} 
//             isOpen={filterPanelOpen}
//             setIsOpen={setFilterPanelOpen}
//           />
          
//           <ApiKeyManager
//             isOpen={apiKeyManagerOpen}
//             setIsOpen={setApiKeyManagerOpen}
//             apiKey={apiKey}
//             setApiKey={setApiKey}
//           />
          
//           <CacheManager
//             isOpen={cacheManagerOpen}
//             setIsOpen={setCacheManagerOpen}
//             cacheDirectory={cacheDirectory}
//             setCacheDirectory={setCacheDirectory}
//           />
          
//           <button
//             onClick={onThemeToggle}
//             className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
//             title="Toggle Theme"
//           >
//             {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
//           </button>
//         </div>
//       </div>
//     </header>
//   );
// };

// // Main Component
// function RouteComponent() {
//   const { ref, inView } = useInView();
//   const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);
//   const [isSlideshowActive, setIsSlideshowActive] = useState(false);
//   const [isSlideshowPlaying, setIsSlideshowPlaying] = useState(true);
//   const [filterPanelOpen, setFilterPanelOpen] = useState(false);
//   const [apiKeyManagerOpen, setApiKeyManagerOpen] = useState(false);
//   const [cacheManagerOpen, setCacheManagerOpen] = useState(false);
//   const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
//   const [isDarkMode, setIsDarkMode] = useState(true);
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
//   const [apiKey, setApiKey] = useState(API_KEY);
//   const [cacheDirectory, setCacheDirectory] = useState('');
//   const [hoveredWallpaper, setHoveredWallpaper] = useState<Wallpaper | null>(null);
//   const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
//   const abortControllerRef = useRef<AbortController | null>(null);
//   const slideshowIntervalRef = useRef<number | null>(null);

//   // Filter state
//   const [filters, setFilters] = useState<FilterOptions>({
//     categories: {
//       general: false,
//       anime: true,
//       people: true,
//     },
//     purity: {
//       sfw: true,
//       sketchy: true,
//       nsfw: true,
//     },
//     sorting: 'toplist',
//     topRange: '1M',
//     resolutions: [],
//     ratios: [],
//     colors: [],
//     keywords: '',
//   });

//   // Load saved state on mount
//   useEffect(() => {
//     const loadState = async () => {
//       try {
//         const savedState = await appStorage.loadState();
        
//         if (savedState) {
//           if (savedState.filters) setFilters(savedState.filters);
//           if (savedState.activeImageIndex !== undefined) setActiveImageIndex(savedState.activeImageIndex);
//           if (savedState.viewMode) setViewMode(savedState.viewMode);
//           if (savedState.isDarkMode !== undefined) setIsDarkMode(savedState.isDarkMode);
//           if (savedState.gridScale) setGridScale(savedState.gridScale);
//           if (savedState.hoverPreviewEnabled !== undefined) setHoverPreviewEnabled(savedState.hoverPreviewEnabled);
//           if (savedState.movieModeKeywords) setMovieModeKeywords(savedState.movieModeKeywords);
//           if (savedState.movieModeInfinite !== undefined) setMovieModeInfinite(savedState.movieModeInfinite);
//           if (savedState.apiKey) {
//             setApiKey(savedState.apiKey);
//             API_KEY = savedState.apiKey;
//           }
//           if (savedState.cacheDirectory) setCacheDirectory(savedState.cacheDirectory);
//         }
        
//         // Load cache directory from localStorage as fallback
//         const localCacheDir = localStorage.getItem('cacheDirectory');
//         if (localCacheDir && !cacheDirectory) {
//           setCacheDirectory(localCacheDir);
//         }
        
//         // Load API key from localStorage as fallback
//         const localApiKey = localStorage.getItem('apiKey');
//         if (localApiKey && !apiKey) {
//           setApiKey(localApiKey);
//           API_KEY = localApiKey;
//         }
//       } catch (error) {
//         console.error('Error loading saved state:', error);
//       }
//     };
    
//     loadState();
//   }, []);

//   // Save state when it changes
//   useEffect(() => {
//     const saveState = async () => {
//       try {
//         await appStorage.saveState({
//           filters,
//           activeImageIndex,
//           viewMode,
//           isDarkMode,
//           gridScale,
//           hoverPreviewEnabled,
//           movieModeKeywords,
//           movieModeInfinite,
//           apiKey,
//           cacheDirectory,
//         });
//       } catch (error) {
//         console.error('Error saving state:', error);
//       }
//     };
    
//     saveState();
//   }, [
//     filters,
//     activeImageIndex,
//     viewMode,
//     isDarkMode,
//     gridScale,
//     hoverPreviewEnabled,
//     movieModeKeywords,
//     movieModeInfinite,
//     apiKey,
//     cacheDirectory,
//   ]);

//   // Apply dark mode on mount
//   useEffect(() => {
//     if (isDarkMode) {
//       document.documentElement.classList.add('dark');
//     } else {
//       document.documentElement.classList.remove('dark');
//     }
//   }, [isDarkMode]);

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

//   // Handle keywords search with abort controller
//   useEffect(() => {
//     // Cancel previous request if keywords changed
//     if (abortControllerRef.current) {
//       abortControllerRef.current.abort();
//     }

//     // Create new abort controller
//     abortControllerRef.current = new AbortController();

//     return () => {
//       // Clean up on unmount
//       if (abortControllerRef.current) {
//         abortControllerRef.current.abort();
//       }
//     };
//   }, [filters.keywords]);

//   const { data, error, fetchNextPage, hasNextPage, isFetchingNextPage, status, refetch } = useInfiniteQuery({
//     queryKey: ['wallpapers', filters],
//     queryFn: ({ pageParam, signal }) => fetchWallpapers({ pageParam, signal: signal || abortControllerRef.current?.signal, filters }),
//     getNextPageParam: (lastPage) =>
//       lastPage.meta.current_page < lastPage.meta.last_page ? lastPage.meta.current_page + 1 : undefined,
//     initialPageParam: 1,
//     retry: (failureCount, err: any) => (err?.name === 'AbortError' ? false : failureCount < 2),
//     refetchOnWindowFocus: false,
//   });

//   // Reset active image when filters change
//   useEffect(() => {
//     setActiveImageIndex(null);
//     setIsSlideshowActive(false);
//   }, [filters]);

//   useEffect(() => {
//     if (inView && hasNextPage && !isFetchingNextPage) {
//       fetchNextPage();
//     }
//   }, [inView, hasNextPage, fetchNextPage, isFetchingNextPage]);

//   const allWallpapers = data?.pages.flatMap((page) => page.data) ?? [];

//   // Navigation handlers
//   const handleNextImage = useCallback(() => {
//     if (activeImageIndex !== null && activeImageIndex < allWallpapers.length - 1) {
//       setActiveImageIndex(activeImageIndex + 1);
//     }
//   }, [activeImageIndex, allWallpapers.length]);

//   const handlePrevImage = useCallback(() => {
//     if (activeImageIndex !== null && activeImageIndex > 0) {
//       setActiveImageIndex(activeImageIndex - 1);
//     }
//   }, [activeImageIndex]);

//   // Slideshow handlers
//   const startSlideshow = useCallback(() => {
//     if (activeImageIndex === null) return;
//     setIsSlideshowActive(true);
//     setIsSlideshowPlaying(true);
//   }, [activeImageIndex]);

//   const stopSlideshow = useCallback(() => {
//     setIsSlideshowActive(false);
//     setIsSlideshowPlaying(false);
//     if (slideshowIntervalRef.current) {
//       clearInterval(slideshowIntervalRef.current);
//       slideshowIntervalRef.current = null;
//     }
//   }, []);

//   const toggleSlideshowPlay = useCallback(() => {
//     setIsSlideshowPlaying((prev) => !prev);
//   }, []);

//   // Slideshow auto-advance
//   useEffect(() => {
//     if (isSlideshowActive && isSlideshowPlaying) {
//       slideshowIntervalRef.current = window.setInterval(() => {
//         setActiveImageIndex((prev) => {
//           if (prev === null) return 0;
//           return prev < allWallpapers.length - 1 ? prev + 1 : 0;
//         });
//       }, 3000); // Change image every 3 seconds
//     } else {
//       if (slideshowIntervalRef.current) {
//         clearInterval(slideshowIntervalRef.current);
//         slideshowIntervalRef.current = null;
//       }
//     }

//     return () => {
//       if (slideshowIntervalRef.current) {
//         clearInterval(slideshowIntervalRef.current);
//         slideshowIntervalRef.current = null;
//       }
//     };
//   }, [isSlideshowActive, isSlideshowPlaying, allWallpapers.length]);

//   const handleSlideshowNext = useCallback(() => {
//     setActiveImageIndex((prev) => {
//       if (prev === null) return 0;
//       return prev < allWallpapers.length - 1 ? prev + 1 : 0;
//     });
//   }, [allWallpapers.length]);

//   const handleSlideshowPrev = useCallback(() => {
//     setActiveImageIndex((prev) => {
//       if (prev === null) return 0;
//       return prev > 0 ? prev - 1 : allWallpapers.length - 1;
//     });
//   }, [allWallpapers.length]);

//   const handleThemeToggle = () => {
//     setIsDarkMode(!isDarkMode);
//   };

//   const handleGridScaleChange = (scale: number) => {
//     setGridScale(scale);
//   };

//   const handleHoverPreviewToggle = () => {
//     setHoverPreviewEnabled(!hoverPreviewEnabled);
//   };

//   const handleMovieModeToggle = () => {
//     setMovieModeActive(!movieModeActive);
//   };

//   const handleMovieModeKeywordChange = (position: keyof typeof movieModeKeywords, value: string) => {
//     setMovieModeKeywords(prev => ({ ...prev, [position]: value }));
//   };

//   // Calculate responsive grid columns
//   const gridColumns = useMemo(() => {
//     const width = window.innerWidth;
//     if (width < 640) return 2; // sm
//     if (width < 768) return 3; // md
//     if (width < 1024) return 4; // lg
//     if (width < 1280) return 6; // xl
//     return 8; // 2xl
//   }, []);

//   return (
//     <div className={`h-screen w-screen flex flex-col ${isDarkMode ? 'dark' : ''} bg-white dark:bg-gray-950`}>
//       <CompactHeader
//         title="Wallhaven Explorer"
//         onRefresh={() => refetch()}
//         onViewModeChange={setViewMode}
//         viewMode={viewMode}
//         onThemeToggle={handleThemeToggle}
//         isDarkMode={isDarkMode}
//         activeImageIndex={activeImageIndex}
//         onStartSlideshow={startSlideshow}
//         filterPanelOpen={filterPanelOpen}
//         setFilterPanelOpen={setFilterPanelOpen}
//         filters={filters}
//         setFilters={setFilters}
//         gridScale={gridScale}
//         onGridScaleChange={handleGridScaleChange}
//         hoverPreviewEnabled={hoverPreviewEnabled}
//         onHoverPreviewToggle={handleHoverPreviewToggle}
//         apiKeyManagerOpen={apiKeyManagerOpen}
//         setApiKeyManagerOpen={setApiKeyManagerOpen}
//         apiKey={apiKey}
//         setApiKey={setApiKey}
//         cacheManagerOpen={cacheManagerOpen}
//         setCacheManagerOpen={setCacheManagerOpen}
//         cacheDirectory={cacheDirectory}
//         setCacheDirectory={setCacheDirectory}
//         onMovieModeToggle={handleMovieModeToggle}
//       />

//       <main id="scroll-container" className="flex-1 overflow-y-auto" style={{ height: 'calc(100vh - 48px)' }}>
//         <div className="w-full flex flex-col p-5">
//           {/* Active filters display */}
//           <div className="mb-2 flex flex-wrap gap-1">
//             {filters.keywords && (
//               <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs rounded-full">
//                 Keywords: {filters.keywords}
//               </span>
//             )}
//             {Object.entries(filters.categories).filter(([_, v]) => v).map(([key]) => (
//               <span key={key} className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full capitalize">
//                 {key}
//               </span>
//             ))}
//             {Object.entries(filters.purity).filter(([_, v]) => v).map(([key]) => (
//               <span key={key} className={`px-2 py-0.5 text-xs rounded-full capitalize ${
//                 key === 'sfw' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
//                 key === 'sketchy' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
//                 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
//               }`}>
//                 {key}
//               </span>
//             ))}
//           </div>

//           {status === 'pending' ? (
//             <div className={`grid gap-0.5`} style={{ gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))` }}>
//               {Array.from({ length: 30 }).map((_, index) => (
//                 <div key={index} className="aspect-[2/3] bg-gray-200 dark:bg-gray-800 animate-pulse" />
//               ))}
//             </div>
//           ) : status === 'error' ? (
//             <div className="text-center text-red-500 py-8">Error: {(error as any)?.message ?? 'Unknown error'}</div>
//           ) : (
//             <>
//               <InfiniteScroll
//                 dataLength={allWallpapers.length}
//                 next={fetchNextPage}
//                 hasMore={!!hasNextPage}
//                 loader={
//                   <div className={`grid gap-0.5`} style={{ gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))` }}>
//                     {Array.from({ length: 12 }).map((_, index) => (
//                       <div key={index} className="aspect-[2/3] bg-gray-200 dark:bg-gray-800 animate-pulse" />
//                     ))}
//                   </div>
//                 }
//                 scrollableTarget="scroll-container"
//                 endMessage={
//                   <p className="text-center text-gray-500 dark:text-gray-400 my-4 py-2 text-sm">
//                     🎉 You've seen all the amazing wallpapers!
//                   </p>
//                 }
//               >
//                 <div className={`grid gap-0.5`} style={{ gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))` }}>
//                   {allWallpapers.map((wallpaper, index) => (
//                     <CompactImageCard
//                       key={`${wallpaper.id}-${index}`}
//                       wallpaper={wallpaper}
//                       onClick={() => setActiveImageIndex(index)}
//                       index={index}
//                       gridScale={gridScale}
//                       onHover={setHoveredWallpaper}
//                       hoverPreviewEnabled={hoverPreviewEnabled}
//                     />
//                   ))}
//                 </div>
//               </InfiniteScroll>

//               {/* Infinite scroll trigger for fallback */}
//               <div ref={ref} className="h-1" />
//             </>
//           )}
//         </div>
//       </main>

//       {/* Hover Preview */}
//       {hoverPreviewEnabled && hoveredWallpaper && (
//         <HoverPreview
//           wallpaper={hoveredWallpaper}
//           enabled={hoverPreviewEnabled}
//           mousePosition={mousePosition}
//         />
//       )}

//       {/* Image Modal */}
//       {activeImageIndex !== null && !isSlideshowActive && !movieModeActive && (
//         <ImmersiveImageModal
//           wallpaper={allWallpapers[activeImageIndex]}
//           onClose={() => setActiveImageIndex(null)}
//           onPrev={handlePrevImage}
//           onNext={handleNextImage}
//           onStartSlideshow={startSlideshow}
//           hasPrev={activeImageIndex > 0}
//           hasNext={activeImageIndex < allWallpapers.length - 1}
//           currentIndex={activeImageIndex}
//           totalCount={allWallpapers.length}
//         />
//       )}

//       {/* Slideshow Modal */}
//       {isSlideshowActive && activeImageIndex !== null && (
//         <ImmersiveSlideshow
//           wallpapers={allWallpapers}
//           initialIndex={activeImageIndex}
//           onClose={stopSlideshow}
//           isPlaying={isSlideshowPlaying}
//           onTogglePlay={toggleSlideshowPlay}
//           onNext={handleSlideshowNext}
//           onPrev={handleSlideshowPrev}
//           currentIndex={activeImageIndex}
//         />
//       )}

//       {/* Movie Mode Modal */}
//       {movieModeActive && (
//         <MovieMode
//           wallpapers={allWallpapers}
//           onClose={() => setMovieModeActive(false)}
//           keywords={movieModeKeywords}
//           infiniteMode={movieModeInfinite}
//           onKeywordChange={handleMovieModeKeywordChange}
//         />
//       )}
//     </div>
//   );
// }

// // --- TanStack Router and Query Client Setup ---
// const queryClient = new QueryClient({
//   defaultOptions: {
//     queries: {
//       staleTime: 5 * 60 * 1000, // 5 minutes
//       gcTime: 10 * 60 * 1000, // 10 minutes
//     },
//   },
// });

// export const Route = createFileRoute('/wallheaven')({
//   errorComponent: ({ error }) => (
//     <div className="p-6 text-red-500">
//       Oops! {(error as any)?.message ? String((error as any).message) : String(error)}
//     </div>
//   ),
//   component: () => (
//     <QueryClientProvider client={queryClient}>
//       <RouteComponent />
//       <Toaster
//         position="bottom-right"
//         toastOptions={{
//           duration: 4000,
//           style: {
//             background: '#363636',
//             color: '#fff',
//           },
//         }}
//       />
//     </QueryClientProvider>
//   ),
// });





















// import { createFileRoute } from '@tanstack/react-router';
// import { QueryClient, QueryClientProvider, useInfiniteQuery } from '@tanstack/react-query';
// import { useEffect, useState, useCallback, useRef, useMemo, memo } from 'react';
// import InfiniteScroll from 'react-infinite-scroll-component';
// import { useInView } from 'react-intersection-observer';
// import { Toaster, toast } from 'react-hot-toast';
// import {
//   Search,
//   X,
//   Download,
//   ChevronLeft,
//   ChevronRight,
//   Play,
//   Pause,
//   Maximize,
//   Minimize,
//   Filter,
//   ChevronDown,
//   ArrowUp,
//   Grid,
//   List,
//   Heart,
//   Eye,
//   Info,
//   Settings,
//   Sliders,
//   Zap,
//   Image as ImageIcon,
//   Monitor,
//   Smartphone,
//   Tablet,
//   Sun,
//   Moon,
//   RefreshCw,
//   Bookmark,
//   Share2,
//   ExternalLink,
//   Key,
//   Film,
//   Save,
//   FolderOpen,
//   HardDrive,
//   MousePointer,
//   Package,
//   CheckCircle,
//   AlertCircle,
//   Loader,
//   Folder,
// } from 'lucide-react';

// // --- TYPES ---
// interface Wallpaper {
//   id: string;
//   path: string;
//   url: string;
//   dimension_x: number;
//   dimension_y: number;
//   resolution: string;
//   file_size: number;
//   file_type?: string | null;
//   category?: string | null;
//   purity: string;
//   ratio: string;
//   source: string | null;
//   views: number;
//   favorites: number;
//   created_at: string;
//   thumbs: {
//     small: string;
//     original: string;
//   };
//   uploader?: {
//     username?: string | null;
//   } | null;
//   tags?: Tag[] | null;
// }

// interface Tag {
//   id: number;
//   name: string;
//   alias?: string | null;
//   category?: string | null;
// }

// interface ApiResponse {
//   data: Wallpaper[];
//   meta: {
//     current_page: number;
//     last_page: number;
//   };
// }

// interface FilterOptions {
//   categories: {
//     general: boolean;
//     anime: boolean;
//     people: boolean;
//   };
//   purity: {
//     sfw: boolean;
//     sketchy: boolean;
//     nsfw: boolean;
//   };
//   sorting: 'toplist' | 'date_added' | 'relevance' | 'random' | 'views' | 'favorites';
//   topRange: '1d' | '3d' | '1w' | '1M' | '3M' | '6M' | '1y';
//   resolutions: string[];
//   ratios: string[];
//   colors: string[];
//   keywords?: string;
// }

// interface AppState {
//   filters: FilterOptions;
//   activeImageIndex: number | null;
//   viewMode: 'grid' | 'list';
//   isDarkMode: boolean;
//   gridScale: number;
//   hoverPreviewEnabled: boolean;
//   movieModeActive: boolean;
//   movieModeKeywords: {
//     topLeft: string;
//     topRight: string;
//     bottomLeft: string;
//     bottomRight: string;
//   };
//   movieModeInfinite: boolean;
//   apiKey: string;
//   cacheDirectory: string;
// }

// interface DownloadItem {
//   id: string;
//   wallpaper: Wallpaper;
//   status: 'pending' | 'downloading' | 'completed' | 'error';
//   progress: number;
//   filePath?: string;
//   error?: string;
// }

// // --- IndexedDB Storage ---
// const DB_NAME = 'wallhaven_explorer_db';
// const DB_VERSION = 1;
// const STORE_NAME = 'app_state';
// const IMAGE_CACHE_STORE = 'image_cache';

// class AppStorage {
//   private db: IDBDatabase | null = null;

//   async init() {
//     return new Promise<void>((resolve, reject) => {
//       const request = indexedDB.open(DB_NAME, DB_VERSION);
      
//       request.onerror = () => reject(request.error);
//       request.onsuccess = () => {
//         this.db = request.result;
//         resolve();
//       };
      
//       request.onupgradeneeded = (event) => {
//         const db = (event.target as IDBOpenDBRequest).result;
        
//         // Create store for app state
//         if (!db.objectStoreNames.contains(STORE_NAME)) {
//           db.createObjectStore(STORE_NAME);
//         }
        
//         // Create store for image cache
//         if (!db.objectStoreNames.contains(IMAGE_CACHE_STORE)) {
//           const imageStore = db.createObjectStore(IMAGE_CACHE_STORE);
//           imageStore.createIndex('url', 'url', { unique: true });
//         }
//       };
//     });
//   }

//   async saveState(state: Partial<AppState>) {
//     if (!this.db) await this.init();
    
//     return new Promise<void>((resolve, reject) => {
//       const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
//       const store = transaction.objectStore(STORE_NAME);
//       const request = store.put(state, 'app_state');
      
//       request.onerror = () => reject(request.error);
//       request.onsuccess = () => resolve();
//     });
//   }

//   async loadState(): Promise<Partial<AppState> | null> {
//     if (!this.db) await this.init();
    
//     return new Promise((resolve, reject) => {
//       const transaction = this.db!.transaction([STORE_NAME], 'readonly');
//       const store = transaction.objectStore(STORE_NAME);
//       const request = store.get('app_state');
      
//       request.onerror = () => reject(request.error);
//       request.onsuccess = () => resolve(request.result || null);
//     });
//   }

//   async cacheImage(url: string, blob: Blob) {
//     if (!this.db) await this.init();
    
//     return new Promise<void>((resolve, reject) => {
//       const transaction = this.db!.transaction([IMAGE_CACHE_STORE], 'readwrite');
//       const store = transaction.objectStore(IMAGE_CACHE_STORE);
//       const request = store.put({ url, blob, timestamp: Date.now() }, url);
      
//       request.onerror = () => reject(request.error);
//       request.onsuccess = () => resolve();
//     });
//   }

//   async getCachedImage(url: string): Promise<Blob | null> {
//     if (!this.db) await this.init();
    
//     return new Promise((resolve, reject) => {
//       const transaction = this.db!.transaction([IMAGE_CACHE_STORE], 'readonly');
//       const store = transaction.objectStore(IMAGE_CACHE_STORE);
//       const request = store.get(url);
      
//       request.onerror = () => reject(request.error);
//       request.onsuccess = () => {
//         const result = request.result;
//         if (result) {
//           resolve(result.blob);
//         } else {
//           resolve(null);
//         }
//       };
//     });
//   }

//   async clearOldCache(maxAge: number = 7 * 24 * 60 * 60 * 1000) { // Default: 7 days
//     if (!this.db) await this.init();
    
//     return new Promise<void>((resolve, reject) => {
//       const transaction = this.db!.transaction([IMAGE_CACHE_STORE], 'readwrite');
//       const store = transaction.objectStore(IMAGE_CACHE_STORE);
//       const index = store.index('url');
//       const request = index.openCursor();
      
//       request.onerror = () => reject(request.error);
//       request.onsuccess = (event) => {
//         const cursor = (event.target as IDBRequest).result;
//         if (cursor) {
//           const data = cursor.value;
//           if (Date.now() - data.timestamp > maxAge) {
//             cursor.delete();
//           }
//           cursor.continue();
//         } else {
//           resolve();
//         }
//       };
//     });
//   }
// }

// const appStorage = new AppStorage();

// // --- API Service ---
// let API_KEY = 'EFkCFHGlTBVugFhK9SOI4F5GoQJTOW0W';
// const BASE_URL = 'https://wallhaven.cc/api/v1/search';

// type FetchParams = {
//   pageParam?: number;
//   signal?: AbortSignal;
//   filters: FilterOptions;
// };

// const fetchWallpapers = async ({ pageParam = 1, signal, filters }: FetchParams): Promise<ApiResponse> => {
//   // Build categories string (3 bits: general, anime, people)
//   const categoriesString = 
//     (filters.categories.general ? '1' : '0') +
//     (filters.categories.anime ? '1' : '0') +
//     (filters.categories.people ? '1' : '0');

//   // Build purity string (3 bits: sfw, sketchy, nsfw)
//   const purityString = 
//     (filters.purity.sfw ? '1' : '0') +
//     (filters.purity.sketchy ? '1' : '0') +
//     (filters.purity.nsfw ? '1' : '0');

//   const params = new URLSearchParams({
//     apikey: API_KEY,
//     sorting: filters.sorting,
//     categories: categoriesString,
//     purity: purityString,
//     topRange: filters.topRange,
//     page: pageParam.toString(),
//   });

//   if (filters.keywords) {
//     params.append('q', filters.keywords);
//   }

//   const response = await fetch(`${BASE_URL}?${params.toString()}`, { signal });

//   if (response.status === 429) {
//     toast.error('Rate limit exceeded. Please wait a moment.');
//     throw new Error('Rate limit exceeded');
//   }

//   if (!response.ok) {
//     throw new Error('Network response was not ok');
//   }

//   const data: ApiResponse = await response.json();
//   return data;
// };

// // --- COMPONENTS ---

// // Image Cache Component with Performance Optimizations
// const ImageWithCache = memo(({ 
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
//         // Try to get from cache first
//         const cachedBlob = await appStorage.getCachedImage(src);
        
//         if (cachedBlob) {
//           const objectUrl = URL.createObjectURL(cachedBlob);
//           setImageSrc(objectUrl);
//           setIsLoading(false);
//           onLoad?.();
//           return;
//         }
        
//         // If not in cache, fetch and cache
//         const response = await fetch(src);
//         const blob = await response.blob();
        
//         // Cache the image
//         await appStorage.cacheImage(src, blob);
        
//         // Create object URL
//         const objectUrl = URL.createObjectURL(blob);
//         setImageSrc(objectUrl);
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
//         <ImageIcon size={24} className="text-gray-500 dark:text-gray-400" />
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
//   wallpaper, 
//   enabled, 
//   mousePosition 
// }: { 
//   wallpaper: Wallpaper; 
//   enabled: boolean; 
//   mousePosition: { x: number; y: number } 
// }) => {
//   const [position, setPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });
//   const previewRef = useRef<HTMLDivElement>(null);
//   const [isVisible, setIsVisible] = useState(false);

//   useEffect(() => {
//     if (!enabled || !previewRef.current) return;

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
//   }, [enabled, mousePosition]);

//   useEffect(() => {
//     if (enabled) {
//       const timer = setTimeout(() => setIsVisible(true), 300);
//       return () => clearTimeout(timer);
//     } else {
//       setIsVisible(false);
//     }
//   }, [enabled]);

//   if (!enabled || !isVisible) return null;

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
//         src={wallpaper.path}
//         alt={`Preview of ${wallpaper.id}`}
//         className="w-full h-full"
//         objectFit="cover" // Always use cover to fill the preview space
//       />
//       <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 text-white">
//         <p className="text-sm font-semibold">{wallpaper.resolution}</p>
//         <div className="flex items-center gap-2 mt-1">
//           <span className="flex items-center gap-1 text-xs">
//             <Heart size={10} />
//             {wallpaper.favorites}
//           </span>
//           <span className="flex items-center gap-1 text-xs">
//             <Eye size={10} />
//             {wallpaper.views}
//           </span>
//         </div>
//       </div>
//     </div>
//   );
// };

// // Masonry Grid Component for Gapless Layout
// const MasonryGrid = memo(({ 
//   wallpapers, 
//   onImageClick, 
//   gridScale, 
//   onHover, 
//   hoverPreviewEnabled 
// }: {
//   wallpapers: Wallpaper[];
//   onImageClick: (index: number) => void;
//   gridScale: number;
//   onHover: (wallpaper: Wallpaper | null) => void;
//   hoverPreviewEnabled: boolean;
// }) => {
//   const containerRef = useRef<HTMLDivElement>(null);
//   const [columns, setColumns] = useState(4);
//   const [columnWidth, setColumnWidth] = useState(0);
//   const [gridItems, setGridItems] = useState<Array<{ wallpaper: Wallpaper; index: number; height: number; top: number; left: number }>>([]);

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
//     if (!columnWidth || wallpapers.length === 0) return;
    
//     const columnHeights = new Array(columns).fill(0);
//     const items = wallpapers.map((wallpaper, index) => {
//       // Calculate image height based on aspect ratio
//       const aspectRatio = wallpaper.dimension_y / wallpaper.dimension_x;
//       const height = columnWidth * aspectRatio;
      
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
//         wallpaper,
//         index,
//         height,
//         top,
//         left
//       };
//     });
    
//     setGridItems(items);
//   }, [wallpapers, columns, columnWidth]);

//   return (
//     <div 
//       ref={containerRef} 
//       className="relative w-full"
//       style={{ height: `${Math.max(...gridItems.map(item => item.top + item.height))}px` }}
//     >
//       {gridItems.map((item) => (
//         <MasonryGridItem
//           key={`${item.wallpaper.id}-${item.index}`}
//           wallpaper={item.wallpaper}
//           index={item.index}
//           width={columnWidth}
//           height={item.height}
//           top={item.top}
//           left={item.left}
//           onClick={() => onImageClick(item.index)}
//           onHover={onHover}
//           hoverPreviewEnabled={hoverPreviewEnabled}
//         />
//       ))}
//     </div>
//   );
// });

// // Individual Masonry Grid Item
// const MasonryGridItem = memo(({ 
//   wallpaper, 
//   index, 
//   width, 
//   height, 
//   top, 
//   left, 
//   onClick, 
//   onHover, 
//   hoverPreviewEnabled 
// }: {
//   wallpaper: Wallpaper;
//   index: number;
//   width: number;
//   height: number;
//   top: number;
//   left: number;
//   onClick: () => void;
//   onHover: (wallpaper: Wallpaper | null) => void;
//   hoverPreviewEnabled: boolean;
// }) => {
//   const [isHovered, setIsHovered] = useState(false);
//   const [isLiked, setIsLiked] = useState(false);
//   const [isBookmarked, setIsBookmarked] = useState(false);

//   // Purity indicator colors
//   const purityColors = {
//     sfw: 'bg-green-500',
//     sketchy: 'bg-yellow-500',
//     nsfw: 'bg-red-500',
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
//     window.open(wallpaper.path, '_blank');
//   };

//   const handleMouseEnter = () => {
//     setIsHovered(true);
//     if (hoverPreviewEnabled) {
//       onHover(wallpaper);
//     }
//   };

//   const handleMouseLeave = () => {
//     setIsHovered(false);
//     if (hoverPreviewEnabled) {
//       onHover(null);
//     }
//   };

//   return (
//     <div
//       className="absolute bg-gray-200 dark:bg-gray-800 overflow-hidden cursor-pointer group"
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
//       {/* Purity Indicator */}
//       <div className={`absolute top-1 left-1 w-1.5 h-1.5 rounded-full z-10 ${purityColors[wallpaper.purity as keyof typeof purityColors]}`} />
      
//       {/* Index Badge */}
//       <div className="absolute top-1 right-1 z-10 bg-black/50 text-white text-xs px-1 rounded">
//         {index + 1}
//       </div>
      
//       <ImageWithCache
//         src={wallpaper.thumbs?.small ?? wallpaper.thumbs?.original ?? wallpaper.path}
//         alt={`Wallpaper ${wallpaper.id}`}
//         className="w-full h-full transition-transform duration-300 ease-out group-hover:scale-105"
//         objectFit="cover"
//       />

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
//             <p className="font-semibold">{wallpaper.resolution}</p>
//             <div className="flex items-center gap-2 mt-1">
//               <span className="flex items-center gap-1">
//                 <Heart size={10} />
//                 {wallpaper.favorites}
//               </span>
//               <span className="flex items-center gap-1">
//                 <Eye size={10} />
//                 {wallpaper.views}
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

// // Download Manager Component
// const DownloadManager = ({ 
//   isOpen, 
//   setIsOpen, 
//   downloads, 
//   onClearCompleted 
// }: { 
//   isOpen: boolean; 
//   setIsOpen: (open: boolean) => void; 
//   downloads: DownloadItem[];
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
//                         <ImageWithCache
//                           src={download.wallpaper.thumbs?.small || download.wallpaper.path}
//                           alt={download.wallpaper.id}
//                           className="w-full h-full"
//                           objectFit="cover"
//                         />
//                       </div>
//                       <div className="flex-1 min-w-0">
//                         <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
//                           {download.wallpaper.id}
//                         </p>
//                         <p className="text-xs text-gray-500 dark:text-gray-400">
//                           {download.wallpaper.resolution} • {(download.wallpaper.file_size / 1024 / 1024).toFixed(2)} MB
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
//                             onClick={() => window.open(`file://${download.filePath}`, '_blank')}
//                             className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1"
//                           >
//                             Open File
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
//   wallpapers, 
//   onDownloadStart 
// }: { 
//   wallpapers: Wallpaper[];
//   onDownloadStart: (count: number) => void;
// }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [count, setCount] = useState(10);

//   const handleDownload = () => {
//     if (count > 0 && count <= wallpapers.length) {
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
//               Number of Images
//             </label>
//             <div className="flex items-center gap-2">
//               <input
//                 type="range"
//                 min="1"
//                 max={Math.min(wallpapers.length, 100)}
//                 value={count}
//                 onChange={(e) => setCount(parseInt(e.target.value))}
//                 className="flex-1"
//               />
//               <span className="text-sm text-gray-700 dark:text-gray-300 w-8">{count}</span>
//             </div>
//             <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
//               Max: {Math.min(wallpapers.length, 100)} images
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

// // Cache Manager Component with Open Folder Button
// const CacheManager = ({ 
//   isOpen, 
//   setIsOpen,
//   cacheDirectory,
//   setCacheDirectory 
// }: { 
//   isOpen: boolean; 
//   setIsOpen: (open: boolean) => void;
//   cacheDirectory: string;
//   setCacheDirectory: (dir: string) => void;
// }) => {
//   const [cacheSize, setCacheSize] = useState(0);
//   const [isClearing, setIsClearing] = useState(false);

//   useEffect(() => {
//     // Calculate cache size
//     const calculateCacheSize = async () => {
//       try {
//         if ('storage' in navigator && 'estimate' in navigator.storage) {
//           const estimate = await navigator.storage.estimate();
//           setCacheSize(Math.round((estimate.usage || 0) / (1024 * 1024))); // Convert to MB
//         }
//       } catch (error) {
//         console.error('Error calculating cache size:', error);
//       }
//     };

//     calculateCacheSize();
//   }, [isOpen]);

//   const handleClearCache = async () => {
//     setIsClearing(true);
//     try {
//       await appStorage.clearOldCache(0); // Clear all cache
//       toast.success('Cache cleared successfully!');
//       setCacheSize(0);
//     } catch (error) {
//       console.error('Error clearing cache:', error);
//       toast.error('Failed to clear cache');
//     } finally {
//       setIsClearing(false);
//     }
//   };

//   const handleSelectDirectory = () => {
//     // In a real Electron app, you would use the dialog API
//     // For this example, we'll just use a prompt
//     const dir = prompt('Enter cache directory path:', cacheDirectory);
//     if (dir) {
//       setCacheDirectory(dir);
//       localStorage.setItem('cacheDirectory', dir);
//       toast.success('Cache directory updated!');
//     }
//   };

//   const handleOpenCacheFolder = () => {
//     // In a real Electron app, you would use the shell API
//     // For this example, we'll try to open with the file protocol
//     if (cacheDirectory) {
//       try {
//         // This would work in Electron
//         if (window.require) {
//           const { shell } = window.require('electron');
//           shell.openPath(cacheDirectory);
//         } else {
//           // Fallback for web environment
//           window.open(`file://${cacheDirectory}`, '_blank');
//         }
//       } catch (error) {
//         console.error('Error opening cache folder:', error);
//         toast.error('Failed to open cache folder');
//       }
//     } else {
//       toast.error('No cache directory set');
//     }
//   };

//   return (
//     <div className="relative">
//       <button
//         onClick={() => setIsOpen(!isOpen)}
//         className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
//       >
//         <HardDrive size={16} />
//         <span className="text-sm">Cache</span>
//         <ChevronDown size={14} className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
//       </button>

//       {isOpen && (
//         <div className="absolute top-full right-0 mt-1 w-72 bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 z-50">
//           <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Cache Management</h3>
          
//           <div className="mb-3">
//             <div className="flex justify-between items-center mb-2">
//               <span className="text-xs text-gray-600 dark:text-gray-400">Cache Size</span>
//               <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{cacheSize} MB</span>
//             </div>
//             <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
//               <div 
//                 className="bg-blue-600 h-2 rounded-full" 
//                 style={{ width: `${Math.min(100, (cacheSize / 500) * 100)}%` }}
//               />
//             </div>
//           </div>

//           <div className="mb-3">
//             <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
//               Cache Directory
//             </label>
//             <div className="flex gap-2">
//               <div className="flex-1 px-2 py-1 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 truncate">
//                 {cacheDirectory || 'Not set'}
//               </div>
//               <button
//                 onClick={handleSelectDirectory}
//                 className="p-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
//                 title="Select Directory"
//               >
//                 <FolderOpen size={14} />
//               </button>
//               <button
//                 onClick={handleOpenCacheFolder}
//                 className="p-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
//                 title="Open Cache Folder"
//               >
//                 <Folder size={14} />
//               </button>
//             </div>
//           </div>

//           <button
//             onClick={handleClearCache}
//             disabled={isClearing || cacheSize === 0}
//             className="w-full px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
//           >
//             {isClearing ? 'Clearing...' : 'Clear Cache'}
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// // Compact Filter Panel Component
// const CompactFilterPanel = ({ 
//   filters, 
//   setFilters,
//   isOpen,
//   setIsOpen 
// }: { 
//   filters: FilterOptions; 
//   setFilters: (filters: FilterOptions) => void;
//   isOpen: boolean;
//   setIsOpen: (open: boolean) => void;
// }) => {
//   const handleCategoryToggle = (category: keyof FilterOptions['categories']) => {
//     setFilters({
//       ...filters,
//       categories: {
//         ...filters.categories,
//         [category]: !filters.categories[category],
//       },
//     });
//   };

//   const handlePurityToggle = (purity: keyof FilterOptions['purity']) => {
//     setFilters({
//       ...filters,
//       purity: {
//         ...filters.purity,
//         [purity]: !filters.purity[purity],
//       },
//     });
//   };

//   // Close on click outside
//   useEffect(() => {
//     const handleClickOutside = (e: MouseEvent) => {
//       const target = e.target as HTMLElement;
//       if (isOpen && !target.closest('.filter-panel')) {
//         setIsOpen(false);
//       }
//     };

//     document.addEventListener('click', handleClickOutside);
//     return () => document.removeEventListener('click', handleClickOutside);
//   }, [isOpen, setIsOpen]);

//   return (
//     <div className="relative filter-panel">
//       <button
//         onClick={() => setIsOpen(!isOpen)}
//         className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
//       >
//         <Sliders size={16} />
//         <span className="text-sm">Filters</span>
//         <ChevronDown size={14} className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
//       </button>

//       {isOpen && (
//         <div className="absolute top-full right-0 mt-1 w-72 bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-3 z-50">
//           {/* Keywords Search */}
//           <div className="mb-3">
//             <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Keywords</h3>
//             <input
//               type="text"
//               value={filters.keywords || ''}
//               onChange={(e) => setFilters({ ...filters, keywords: e.target.value })}
//               placeholder="Enter keywords..."
//               className="w-full px-2 py-1 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 focus:border-blue-500 dark:text-gray-300"
//             />
//           </div>

//           {/* Quick Categories */}
//           <div className="mb-3">
//             <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Categories</h3>
//             <div className="flex gap-2">
//               <button
//                 onClick={() => handleCategoryToggle('general')}
//                 className={`px-2 py-1 text-xs rounded ${
//                   filters.categories.general 
//                     ? 'bg-blue-500 text-white' 
//                     : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
//                 }`}
//               >
//                 General
//               </button>
//               <button
//                 onClick={() => handleCategoryToggle('anime')}
//                 className={`px-2 py-1 text-xs rounded ${
//                   filters.categories.anime 
//                     ? 'bg-blue-500 text-white' 
//                     : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
//                 }`}
//               >
//                 Anime
//               </button>
//               <button
//                 onClick={() => handleCategoryToggle('people')}
//                 className={`px-2 py-1 text-xs rounded ${
//                   filters.categories.people 
//                     ? 'bg-blue-500 text-white' 
//                     : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
//                 }`}
//               >
//                 People
//               </button>
//             </div>
//           </div>

//           {/* Quick Purity */}
//           <div className="mb-3">
//             <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Purity</h3>
//             <div className="flex gap-2">
//               <button
//                 onClick={() => handlePurityToggle('sfw')}
//                 className={`px-2 py-1 text-xs rounded ${
//                   filters.purity.sfw 
//                     ? 'bg-green-500 text-white' 
//                     : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
//                 }`}
//               >
//                 SFW
//               </button>
//               <button
//                 onClick={() => handlePurityToggle('sketchy')}
//                 className={`px-2 py-1 text-xs rounded ${
//                   filters.purity.sketchy 
//                     ? 'bg-yellow-500 text-white' 
//                     : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
//                 }`}
//               >
//                 Sketchy
//               </button>
//               <button
//                 onClick={() => handlePurityToggle('nsfw')}
//                 className={`px-2 py-1 text-xs rounded ${
//                   filters.purity.nsfw 
//                     ? 'bg-red-500 text-white' 
//                     : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
//                 }`}
//               >
//                 NSFW
//               </button>
//             </div>
//           </div>

//           {/* Sorting */}
//           <div className="mb-3">
//             <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Sort By</h3>
//             <select
//               value={filters.sorting}
//               onChange={(e) => setFilters({ ...filters, sorting: e.target.value as FilterOptions['sorting'] })}
//               className="w-full px-2 py-1 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 focus:border-blue-500 dark:text-gray-300"
//             >
//               <option value="toplist">Top List</option>
//               <option value="date_added">Date Added</option>
//               <option value="relevance">Relevance</option>
//               <option value="random">Random</option>
//               <option value="views">Views</option>
//               <option value="favorites">Favorites</option>
//             </select>
//           </div>

//           {/* Time Range (only for toplist) */}
//           {filters.sorting === 'toplist' && (
//             <div>
//               <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Time Range</h3>
//               <select
//                 value={filters.topRange}
//                 onChange={(e) => setFilters({ ...filters, topRange: e.target.value as FilterOptions['topRange'] })}
//                 className="w-full px-2 py-1 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 focus:border-blue-500 dark:text-gray-300"
//               >
//                 <option value="1d">Last Day</option>
//                 <option value="3d">Last 3 Days</option>
//                 <option value="1w">Last Week</option>
//                 <option value="1M">Last Month</option>
//                 <option value="3M">Last 3 Months</option>
//                 <option value="6M">Last 6 Months</option>
//                 <option value="1y">Last Year</option>
//               </select>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// // API Key Manager Component
// const ApiKeyManager = ({ 
//   isOpen, 
//   setIsOpen, 
//   apiKey, 
//   setApiKey 
// }: { 
//   isOpen: boolean; 
//   setIsOpen: (open: boolean) => void; 
//   apiKey: string; 
//   setApiKey: (key: string) => void; 
// }) => {
//   const [tempApiKey, setTempApiKey] = useState(apiKey);
//   const [savedKeys, setSavedKeys] = useState<string[]>([]);

//   useEffect(() => {
//     // Load saved API keys from local storage
//     const keys = JSON.parse(localStorage.getItem('savedApiKeys') || '[]');
//     setSavedKeys(keys);
//   }, []);

//   const handleSaveKey = () => {
//     if (tempApiKey.trim()) {
//       // Update the global API key
//       setApiKey(tempApiKey);
//       API_KEY = tempApiKey;
      
//       // Save to local storage
//       const keys = [...savedKeys.filter(k => k !== tempApiKey), tempApiKey];
//       localStorage.setItem('savedApiKeys', JSON.stringify(keys));
//       setSavedKeys(keys);
      
//       toast.success('API key updated successfully!');
//       setIsOpen(false);
//     } else {
//       toast.error('Please enter a valid API key');
//     }
//   };

//   const handleSelectKey = (key: string) => {
//     setTempApiKey(key);
//   };

//   const handleDeleteKey = (keyToDelete: string) => {
//     const updatedKeys = savedKeys.filter(k => k !== keyToDelete);
//     localStorage.setItem('savedApiKeys', JSON.stringify(updatedKeys));
//     setSavedKeys(updatedKeys);
    
//     if (tempApiKey === keyToDelete) {
//       setTempApiKey('');
//     }
    
//     toast.success('API key removed');
//   };

//   return (
//     <div className="relative">
//       <button
//         onClick={() => setIsOpen(!isOpen)}
//         className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
//       >
//         <Key size={16} />
//         <span className="text-sm">API Key</span>
//         <ChevronDown size={14} className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
//       </button>

//       {isOpen && (
//         <div className="absolute top-full right-0 mt-1 w-80 bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 z-50">
//           <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">API Key Management</h3>
          
//           <div className="mb-3">
//             <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
//               Enter API Key
//             </label>
//             <div className="flex gap-2">
//               <input
//                 type="text"
//                 value={tempApiKey}
//                 onChange={(e) => setTempApiKey(e.target.value)}
//                 placeholder="Your Wallhaven API key"
//                 className="flex-1 px-2 py-1 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 focus:border-blue-500 dark:text-gray-300"
//               />
//               <button
//                 onClick={handleSaveKey}
//                 className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
//               >
//                 Save
//               </button>
//             </div>
//           </div>

//           {savedKeys.length > 0 && (
//             <div>
//               <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Saved Keys</h4>
//               <div className="space-y-1 max-h-32 overflow-y-auto">
//                 {savedKeys.map((key, index) => (
//                   <div key={index} className="flex items-center justify-between p-1 bg-gray-50 dark:bg-gray-800 rounded">
//                     <button
//                       onClick={() => handleSelectKey(key)}
//                       className="text-xs text-gray-700 dark:text-gray-300 truncate flex-1 text-left"
//                     >
//                       {key.substring(0, 10)}...{key.substring(key.length - 5)}
//                     </button>
//                     <button
//                       onClick={() => handleDeleteKey(key)}
//                       className="p-1 text-red-500 hover:text-red-700 transition-colors"
//                     >
//                       <X size={12} />
//                     </button>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// // Movie Mode Component
// const MovieMode = ({
//   wallpapers,
//   onClose,
//   keywords,
//   infiniteMode,
//   onKeywordChange,
// }: {
//   wallpapers: Wallpaper[];
//   onClose: () => void;
//   keywords: {
//     topLeft: string;
//     topRight: string;
//     bottomLeft: string;
//     bottomRight: string;
//   };
//   infiniteMode: boolean;
//   onKeywordChange: (position: keyof typeof keywords, value: string) => void;
// }) => {
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [isPlaying, setIsPlaying] = useState(true);
//   const [keywordInputs, setKeywordInputs] = useState(keywords);
//   const intervalRef = useRef<NodeJS.Timeout | null>(null);

//   // Filter wallpapers based on keywords
//   const filteredWallpapers = useMemo(() => {
//     if (!keywords.topLeft && !keywords.topRight && !keywords.bottomLeft && !keywords.bottomRight) {
//       return wallpapers;
//     }

//     return wallpapers.filter(wallpaper => {
//       const tags = wallpaper.tags?.map(tag => tag.name.toLowerCase()).join(' ') || '';
//       const category = wallpaper.category?.toLowerCase() || '';
//       const purity = wallpaper.purity.toLowerCase();
//       const allText = `${tags} ${category} ${purity}`.toLowerCase();

//       return (
//         (keywords.topLeft && allText.includes(keywords.topLeft.toLowerCase())) ||
//         (keywords.topRight && allText.includes(keywords.topRight.toLowerCase())) ||
//         (keywords.bottomLeft && allText.includes(keywords.bottomLeft.toLowerCase())) ||
//         (keywords.bottomRight && allText.includes(keywords.bottomRight.toLowerCase()))
//       );
//     });
//   }, [wallpapers, keywords]);

//   // Get 4 wallpapers for current display
//   const getDisplayWallpapers = () => {
//     const result = [];
//     const startIndex = currentIndex * 4;
    
//     for (let i = 0; i < 4; i++) {
//       const index = (startIndex + i) % filteredWallpapers.length;
//       result.push(filteredWallpapers[index]);
//     }
    
//     return result;
//   };

//   const displayWallpapers = getDisplayWallpapers();

//   // Auto-advance slideshow
//   useEffect(() => {
//     if (isPlaying) {
//       intervalRef.current = setInterval(() => {
//         setCurrentIndex(prev => {
//           const maxIndex = Math.ceil(filteredWallpapers.length / 4) - 1;
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
//   }, [isPlaying, filteredWallpapers.length, infiniteMode]);

//   const handleKeywordInputChange = (position: keyof typeof keywords, value: string) => {
//     setKeywordInputs(prev => ({ ...prev, [position]: value }));
//   };

//   const handleKeywordSubmit = (position: keyof typeof keywords) => {
//     onKeywordChange(position, keywordInputs[position]);
//   };

//   return (
//     <div className="fixed inset-0 bg-black z-50 flex flex-col">
//       {/* Controls */}
//       <div className="bg-gray-900 p-4 flex justify-between items-center">
//         <div className="flex items-center gap-4">
//           <h2 className="text-white text-xl font-bold flex items-center gap-2">
//             <Film size={24} />
//             Movie Mode
//           </h2>
//           <div className="flex items-center gap-2">
//             <button
//               onClick={() => setIsPlaying(!isPlaying)}
//               className="p-2 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition-colors"
//             >
//               {isPlaying ? <Pause size={20} /> : <Play size={20} />}
//             </button>
//             <button
//               onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
//               className="p-2 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition-colors"
//             >
//               <ChevronLeft size={20} />
//             </button>
//             <button
//               onClick={() => setCurrentIndex(prev => {
//                 const maxIndex = Math.ceil(filteredWallpapers.length / 4) - 1;
//                 return prev < maxIndex ? prev + 1 : prev;
//               })}
//               className="p-2 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition-colors"
//             >
//               <ChevronRight size={20} />
//             </button>
//           </div>
//           <div className="flex items-center gap-2">
//             <label className="text-white text-sm flex items-center gap-1">
//               <input
//                 type="checkbox"
//                 checked={infiniteMode}
//                 onChange={() => {}} // Will be handled by parent
//                 className="rounded"
//               />
//               Infinite Loop
//             </label>
//           </div>
//         </div>
//         <button
//           onClick={onClose}
//           className="p-2 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition-colors"
//         >
//           <X size={20} />
//         </button>
//       </div>

//       {/* 2x2 Grid */}
//       <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-1 p-1">
//         {displayWallpapers.map((wallpaper, index) => {
//           const position = ['topLeft', 'topRight', 'bottomLeft', 'bottomRight'][index] as keyof typeof keywords;
//           return (
//             <div key={index} className="relative bg-gray-800 overflow-hidden">
//               <ImageWithCache
//                 src={wallpaper.path}
//                 alt={`Movie mode image ${index + 1}`}
//                 className="w-full h-full"
//                 objectFit="cover"
//               />
//               <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
//                 <div className="flex items-center gap-2">
//                   <input
//                     type="text"
//                     value={keywordInputs[position]}
//                     onChange={(e) => handleKeywordInputChange(position, e.target.value)}
//                     placeholder={`Keywords for ${position.replace(/([A-Z])/g, ' $1').toLowerCase()}`}
//                     className="flex-1 px-2 py-1 bg-black/50 text-white text-xs rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
//                   />
//                   <button
//                     onClick={() => handleKeywordSubmit(position)}
//                     className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
//                   >
//                     <Save size={14} />
//                   </button>
//                 </div>
//                 <p className="text-white text-xs mt-1">{wallpaper.resolution}</p>
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       {/* Progress Bar */}
//       <div className="bg-gray-900 p-2">
//         <div className="w-full bg-gray-700 rounded-full h-1">
//           <div
//             className="bg-blue-500 h-1 rounded-full transition-all duration-1000 ease-linear"
//             style={{ 
//               width: `${((currentIndex + 1) / Math.ceil(filteredWallpapers.length / 4)) * 100}%` 
//             }}
//           />
//         </div>
//         <p className="text-white text-xs mt-1 text-center">
//           {currentIndex + 1} / {Math.ceil(filteredWallpapers.length / 4)} sets
//         </p>
//       </div>
//     </div>
//   );
// };

// // Enhanced Image Modal Component
// const ImmersiveImageModal = ({
//   wallpaper,
//   onClose,
//   onPrev,
//   onNext,
//   onStartSlideshow,
//   hasPrev,
//   hasNext,
//   currentIndex,
//   totalCount,
// }: {
//   wallpaper: Wallpaper;
//   onClose: () => void;
//   onPrev: () => void;
//   onNext: () => void;
//   onStartSlideshow: () => void;
//   hasPrev: boolean;
//   hasNext: boolean;
//   currentIndex: number;
//   totalCount: number;
// }) => {
//   const [isFullscreen, setIsFullscreen] = useState(false);
//   const [imageLoaded, setImageLoaded] = useState(false);
//   const [showInfo, setShowInfo] = useState(false);
//   const [isLiked, setIsLiked] = useState(false);
//   const [isBookmarked, setIsBookmarked] = useState(false);
//   const modalRef = useRef<HTMLDivElement>(null);
//   const uploaderName = wallpaper.uploader?.username ?? 'Anonymous';

//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       if (e.key === 'Escape') {
//         if (isFullscreen) {
//           setIsFullscreen(false);
//         } else {
//           onClose();
//         }
//       }
//       if (e.key === 'ArrowLeft' && hasPrev) onPrev();
//       if (e.key === 'ArrowRight' && hasNext) onNext();
//       if (e.key === ' ') {
//         e.preventDefault();
//         onStartSlideshow();
//       }
//       if (e.key === 'f') {
//         e.preventDefault();
//         setIsFullscreen((prev) => !prev);
//       }
//       if (e.key === 'i') {
//         e.preventDefault();
//         setShowInfo((prev) => !prev);
//       }
//       if (e.key === 'l') {
//         e.preventDefault();
//         setIsLiked(!isLiked);
//       }
//       if (e.key === 'b') {
//         e.preventDefault();
//         setIsBookmarked(!isBookmarked);
//       }
//     };

//     window.addEventListener('keydown', handleKeyDown);
//     return () => window.removeEventListener('keydown', handleKeyDown);
//   }, [onClose, onPrev, onNext, hasPrev, hasNext, isFullscreen, onStartSlideshow, isLiked, isBookmarked]);

//   useEffect(() => {
//     if (isFullscreen) {
//       document.documentElement.requestFullscreen?.();
//     } else if (document.fullscreenElement) {
//       document.exitFullscreen?.();
//     }
//   }, [isFullscreen]);

//   const handleImageLoad = () => {
//     setImageLoaded(true);
//   };

//   // Reset image loaded state when wallpaper changes
//   useEffect(() => {
//     setImageLoaded(false);
//   }, [wallpaper.id]);

//   const handleLike = () => {
//     setIsLiked(!isLiked);
//   };

//   const handleBookmark = () => {
//     setIsBookmarked(!isBookmarked);
//   };

//   const handleDownload = () => {
//     window.open(wallpaper.path, '_blank');
//   };

//   const handleShare = () => {
//     if (navigator.share) {
//       navigator.share({
//         title: `Wallpaper by ${uploaderName}`,
//         text: `Check out this amazing wallpaper!`,
//         url: wallpaper.path,
//       });
//     } else {
//       navigator.clipboard.writeText(wallpaper.path);
//       toast.success('Link copied to clipboard!');
//     }
//   };

//   return (
//     <div
//       className={`fixed inset-0 bg-black z-50 flex items-center justify-center transition-all duration-300 ${
//         isFullscreen ? 'p-0' : 'p-0'
//       }`}
//       onClick={onClose}
//     >
//       <div
//         ref={modalRef}
//         className={`relative w-full h-full flex flex-col transition-all duration-300 ${
//           isFullscreen ? 'w-full h-full' : 'w-full h-full'
//         }`}
//         onClick={(e) => e.stopPropagation()}
//       >
//         {/* Top Controls Bar */}
//         <div className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/70 to-transparent p-4">
//           <div className="flex justify-between items-center">
//             <div className="flex items-center gap-3 text-white">
//               <span className="text-sm bg-black/50 px-2 py-1 rounded backdrop-blur-sm">
//                 {currentIndex + 1} / {totalCount}
//               </span>
//               <span className="text-sm">{wallpaper.resolution}</span>
//               <span className="text-sm capitalize">{wallpaper.purity}</span>
//             </div>
//             <div className="flex items-center gap-2">
//               <button
//                 onClick={handleLike}
//                 className={`p-2 rounded-full transition-colors ${
//                   isLiked ? 'bg-red-500 text-white' : 'bg-black/50 text-white hover:bg-black/70'
//                 }`}
//                 title="Like (L)"
//               >
//                 <Heart size={18} fill={isLiked ? 'white' : 'none'} />
//               </button>
//               <button
//                 onClick={handleBookmark}
//                 className={`p-2 rounded-full transition-colors ${
//                   isBookmarked ? 'bg-blue-500 text-white' : 'bg-black/50 text-white hover:bg-black/70'
//                 }`}
//                 title="Bookmark (B)"
//               >
//                 <Bookmark size={18} fill={isBookmarked ? 'white' : 'none'} />
//               </button>
//               <button
//                 onClick={handleShare}
//                 className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
//                 title="Share"
//               >
//                 <Share2 size={18} />
//               </button>
//               <button
//                 onClick={handleDownload}
//                 className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
//                 title="Download"
//               >
//                 <Download size={18} />
//               </button>
//               <button
//                 onClick={() => setShowInfo(!showInfo)}
//                 className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
//                 title="Info (I)"
//               >
//                 <Info size={18} />
//               </button>
//               <button
//                 onClick={onStartSlideshow}
//                 className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
//                 title="Start Slideshow (Space)"
//               >
//                 <Play size={18} />
//               </button>
//               <button
//                 onClick={() => setIsFullscreen((prev) => !prev)}
//                 className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
//                 title="Toggle Fullscreen (F)"
//               >
//                 {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
//               </button>
//               <button
//                 onClick={onClose}
//                 className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
//                 title="Close (Esc)"
//               >
//                 <X size={18} />
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Navigation Arrows */}
//         {hasPrev && (
//           <button
//             onClick={onPrev}
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
//           {!imageLoaded && (
//             <div className="absolute inset-0 flex items-center justify-center">
//               <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
//             </div>
//           )}
//           <ImageWithCache
//             src={wallpaper.path}
//             alt={`Wallpaper ${wallpaper.id}`}
//             className={`max-w-full max-h-full object-contain transition-opacity duration-300 ${
//               imageLoaded ? 'opacity-100' : 'opacity-0'
//             }`}
//             onLoad={handleImageLoad}
//           />
//         </div>

//         {/* Info Panel */}
//         {showInfo && (
//           <div className="absolute bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-black/80 to-transparent p-4 text-white">
//             <div className=" mx-auto">
//               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
//                 <div>
//                   <p className="font-semibold text-gray-300">Uploader</p>
//                   <p>{uploaderName}</p>
//                 </div>
//                 <div>
//                   <p className="font-semibold text-gray-300">Resolution</p>
//                   <p>{wallpaper.resolution}</p>
//                 </div>
//                 <div>
//                   <p className="font-semibold text-gray-300">Ratio</p>
//                   <p>{wallpaper.ratio}</p>
//                 </div>
//                 <div>
//                   <p className="font-semibold text-gray-300">Category</p>
//                   <p>{wallpaper.category ?? '\u2014'}</p>
//                 </div>
//                 <div>
//                   <p className="font-semibold text-gray-300">Favorites</p>
//                   <p>{wallpaper.favorites.toLocaleString()}</p>
//                 </div>
//                 <div>
//                   <p className="font-semibold text-gray-300">Views</p>
//                   <p>{wallpaper.views.toLocaleString()}</p>
//                 </div>
//                 <div>
//                   <p className="font-semibold text-gray-300">File Type</p>
//                   <p>{wallpaper.file_type ?? 'Unknown'}</p>
//                 </div>
//                 <div>
//                   <p className="font-semibold text-gray-300">Purity</p>
//                   <p className="capitalize">{wallpaper.purity}</p>
//                 </div>
//               </div>
//               <div className="mt-3">
//                 <p className="font-semibold text-gray-300 mb-1">Tags</p>
//                 <div className="flex flex-wrap gap-1">
//                   {(wallpaper.tags ?? []).map((tag) => (
//                     <span
//                       key={tag.id}
//                       className="bg-white/20 text-xs px-2 py-0.5 rounded-full"
//                     >
//                       {tag.name}
//                     </span>
//                   ))}
//                   {(wallpaper.tags ?? []).length === 0 && (
//                     <span className="text-xs text-gray-400">No tags</span>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// // Enhanced Slideshow Component
// const ImmersiveSlideshow = ({
//   wallpapers,
//   initialIndex,
//   onClose,
//   isPlaying,
//   onTogglePlay,
//   onNext,
//   onPrev,
//   currentIndex,
// }: {
//   wallpapers: Wallpaper[];
//   initialIndex: number;
//   onClose: () => void;
//   isPlaying: boolean;
//   onTogglePlay: () => void;
//   onNext: () => void;
//   onPrev: () => void;
//   currentIndex: number;
// }) => {
//   const [imageLoaded, setImageLoaded] = useState(false);
//   const [showControls, setShowControls] = useState(true);
//   const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       if (e.key === 'Escape') onClose();
//       if (e.key === ' ') {
//         e.preventDefault();
//         onTogglePlay();
//       }
//       if (e.key === 'ArrowLeft') onPrev();
//       if (e.key === 'ArrowRight') onNext();
//       if (e.key === 'h') {
//         e.preventDefault();
//         setShowControls((prev) => !prev);
//       }
//     };

//     window.addEventListener('keydown', handleKeyDown);
//     return () => window.removeEventListener('keydown', handleKeyDown);
//   }, [onClose, onTogglePlay, onNext, onPrev]);

//   const handleImageLoad = () => {
//     setImageLoaded(true);
//   };

//   useEffect(() => {
//     setImageLoaded(false);
//   }, [currentIndex]);

//   const handleMouseMove = () => {
//     setShowControls(true);
//     if (controlsTimeoutRef.current) {
//       clearTimeout(controlsTimeoutRef.current);
//     }
//     controlsTimeoutRef.current = setTimeout(() => {
//       setShowControls(false);
//     }, 3000);
//   };

//   useEffect(() => {
//     const container = document.getElementById('slideshow-container');
//     if (container) {
//       container.addEventListener('mousemove', handleMouseMove);
//       return () => {
//         container.removeEventListener('mousemove', handleMouseMove);
//         if (controlsTimeoutRef.current) {
//           clearTimeout(controlsTimeoutRef.current);
//         }
//       };
//     }
//   }, []);

//   return (
//     <div id="slideshow-container" className="fixed inset-0 bg-black z-50 flex items-center justify-center w-full h-full" onClick={onClose}>
//       {/* Controls */}
//       <div className={`absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/70 to-transparent p-4 transition-opacity duration-300 ${
//         showControls ? 'opacity-100' : 'opacity-0'
//       }`}>
//         <div className="flex justify-between items-center text-white">
//           <span className="text-sm bg-black/50  py-1 rounded-full backdrop-blur-sm">
//             {currentIndex + 1} / {wallpapers.length}
//           </span>
//           <div className="flex items-center gap-2">
//             <button
//               onClick={(e) => {
//                 e.stopPropagation();
//                 onTogglePlay();
//               }}
//               className="p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors backdrop-blur-sm"
//             >
//               {isPlaying ? <Pause size={20} /> : <Play size={20} />}
//             </button>
//             <button
//               onClick={(e) => {
//                 e.stopPropagation();
//                 onClose();
//               }}
//               className="p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors backdrop-blur-sm"
//             >
//               <X size={20} />
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Navigation Arrows */}
//       <div className={`absolute left-0 right-0 top-1/2 -translate-y-1/2 z-40 flex justify-between px-4 transition-opacity duration-300 ${
//         showControls ? 'opacity-100' : 'opacity-0'
//       }`}>
//         <button
//           onClick={(e) => {
//             e.stopPropagation();
//             onPrev();
//           }}
//           className="p-3 text-white bg-black/50 rounded-full hover:bg-black/70 transition-all backdrop-blur-sm hover:scale-110"
//         >
//           <ChevronLeft size={28} />
//         </button>
//         <button
//           onClick={(e) => {
//             e.stopPropagation();
//             onNext();
//           }}
//           className="p-3 text-white bg-black/50 rounded-full hover:bg-black/70 transition-all backdrop-blur-sm hover:scale-110"
//         >
//           <ChevronRight size={28} />
//         </button>
//       </div>

//       {/* Image */}
//       <div className="relative max-w-full max-h-full" onClick={(e) => e.stopPropagation()}>
//         {!imageLoaded && (
//           <div className="absolute inset-0 flex items-center justify-center">
//             <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin" />
//           </div>
//         )}
//         <ImageWithCache
//           src={wallpapers[currentIndex].path}
//           alt={`Slideshow image ${currentIndex + 1}`}
//           className={`max-w-full max-h-screen object-contain transition-opacity duration-300 ${
//             imageLoaded ? 'opacity-100' : 'opacity-0'
//           }`}
//           onLoad={handleImageLoad}
//         />
//       </div>

//       {/* Progress Bar */}
//       <div className={`absolute bottom-0 left-0 right-0 z-50 p-4 transition-opacity duration-300 ${
//         showControls ? 'opacity-100' : 'opacity-0'
//       }`}>
//         <div className="w-full bg-gray-600 rounded-full h-1">
//           <div
//             className="bg-white h-1 rounded-full transition-all duration-1000 ease-linear"
//             style={{ width: `${((currentIndex + 1) / wallpapers.length) * 100}%` }}
//           />
//         </div>
//         <div className="text-center text-white text-xs mt-2">
//           {wallpapers[currentIndex].resolution} • {wallpapers[currentIndex].purity}
//         </div>
//       </div>
//     </div>
//   );
// };

// // Compact Header Component
// const CompactHeader = ({
//   title,
//   onRefresh,
//   onViewModeChange,
//   viewMode,
//   onThemeToggle,
//   isDarkMode,
//   activeImageIndex,
//   onStartSlideshow,
//   filterPanelOpen,
//   setFilterPanelOpen,
//   filters,
//   setFilters,
//   gridScale,
//   onGridScaleChange,
//   hoverPreviewEnabled,
//   onHoverPreviewToggle,
//   apiKeyManagerOpen,
//   setApiKeyManagerOpen,
//   apiKey,
//   setApiKey,
//   cacheManagerOpen,
//   setCacheManagerOpen,
//   cacheDirectory,
//   setCacheDirectory,
//   onMovieModeToggle,
//   downloadManagerOpen,
//   setDownloadManagerOpen,
//   downloads,
//   onClearCompletedDownloads,
//   onBatchDownload,
// }: {
//   title: string;
//   onRefresh: () => void;
//   onViewModeChange: (mode: 'grid' | 'list') => void;
//   viewMode: 'grid' | 'list';
//   onThemeToggle: () => void;
//   isDarkMode: boolean;
//   activeImageIndex: number | null;
//   onStartSlideshow: () => void;
//   filterPanelOpen: boolean;
//   setFilterPanelOpen: (open: boolean) => void;
//   filters: FilterOptions;
//   setFilters: (filters: FilterOptions) => void;
//   gridScale: number;
//   onGridScaleChange: (scale: number) => void;
//   hoverPreviewEnabled: boolean;
//   onHoverPreviewToggle: () => void;
//   apiKeyManagerOpen: boolean;
//   setApiKeyManagerOpen: (open: boolean) => void;
//   apiKey: string;
//   setApiKey: (key: string) => void;
//   cacheManagerOpen: boolean;
//   setCacheManagerOpen: (open: boolean) => void;
//   cacheDirectory: string;
//   setCacheDirectory: (dir: string) => void;
//   onMovieModeToggle: () => void;
//   downloadManagerOpen: boolean;
//   setDownloadManagerOpen: (open: boolean) => void;
//   downloads: DownloadItem[];
//   onClearCompletedDownloads: () => void;
//   onBatchDownload: (count: number) => void;
// }) => {
//   return (
//     <header className="flex-shrink-0 sticky top-0 z-40 bg-white/90 dark:bg-gray-950/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
//       <div className="container mx-auto px-2 py-2 flex justify-between items-center">
//         <div className="flex items-center gap-2">
//           <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">{title}</h1>
//           <button
//             onClick={onRefresh}
//             className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
//             title="Refresh"
//           >
//             <RefreshCw size={16} />
//           </button>
//         </div>
        
//         <div className="flex items-center gap-2">
//           {activeImageIndex !== null && (
//             <button
//               onClick={onStartSlideshow}
//               className="flex items-center gap-1 px-2 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
//             >
//               <Play size={14} />
//               Slideshow
//             </button>
//           )}
          
//           <button
//             onClick={onMovieModeToggle}
//             className="flex items-center gap-1 px-2 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition-colors"
//           >
//             <Film size={14} />
//             Movie Mode
//           </button>
          
//           <BatchDownload
//             wallpapers={[]} // Will be passed from parent
//             onDownloadStart={onBatchDownload}
//           />
          
//           <DownloadManager
//             isOpen={downloadManagerOpen}
//             setIsOpen={setDownloadManagerOpen}
//             downloads={downloads}
//             onClearCompleted={onClearCompletedDownloads}
//           />
          
//           <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded">
//             <button
//               onClick={() => onViewModeChange('grid')}
//               className={`p-1 rounded ${
//                 viewMode === 'grid' 
//                   ? 'bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white' 
//                   : 'text-gray-600 dark:text-gray-400'
//               }`}
//               title="Grid View"
//             >
//               <Grid size={16} />
//             </button>
//             <button
//               onClick={() => onViewModeChange('list')}
//               className={`p-1 rounded ${
//                 viewMode === 'list' 
//                   ? 'bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white' 
//                   : 'text-gray-600 dark:text-gray-400'
//               }`}
//               title="List View"
//             >
//               <List size={16} />
//             </button>
//           </div>
          
//           <div className="flex items-center gap-1">
//             <button
//               onClick={onHoverPreviewToggle}
//               className={`p-1 rounded ${
//                 hoverPreviewEnabled 
//                   ? 'bg-blue-500 text-white' 
//                   : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
//               }`}
//               title="Toggle Hover Preview"
//             >
//               <MousePointer size={16} />
//             </button>
            
//             <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded px-1">
//               <span className="text-xs text-gray-600 dark:text-gray-400 mr-1">Scale</span>
//               <input
//                 type="range"
//                 min="0.5"
//                 max="2"
//                 step="0.1"
//                 value={gridScale}
//                 onChange={(e) => onGridScaleChange(parseFloat(e.target.value))}
//                 className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
//               />
//               <span className="text-xs text-gray-600 dark:text-gray-400 ml-1">{gridScale.toFixed(1)}x</span>
//             </div>
//           </div>
          
//           <CompactFilterPanel 
//             filters={filters} 
//             setFilters={setFilters} 
//             isOpen={filterPanelOpen}
//             setIsOpen={setFilterPanelOpen}
//           />
          
//           <ApiKeyManager
//             isOpen={apiKeyManagerOpen}
//             setIsOpen={setApiKeyManagerOpen}
//             apiKey={apiKey}
//             setApiKey={setApiKey}
//           />
          
//           <CacheManager
//             isOpen={cacheManagerOpen}
//             setIsOpen={setCacheManagerOpen}
//             cacheDirectory={cacheDirectory}
//             setCacheDirectory={setCacheDirectory}
//           />
          
//           <button
//             onClick={onThemeToggle}
//             className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
//             title="Toggle Theme"
//           >
//             {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
//           </button>
//         </div>
//       </div>
//     </header>
//   );
// };

// // Main Component
// function RouteComponent() {
//   const { ref, inView } = useInView();
//   const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);
//   const [isSlideshowActive, setIsSlideshowActive] = useState(false);
//   const [isSlideshowPlaying, setIsSlideshowPlaying] = useState(true);
//   const [filterPanelOpen, setFilterPanelOpen] = useState(false);
//   const [apiKeyManagerOpen, setApiKeyManagerOpen] = useState(false);
//   const [cacheManagerOpen, setCacheManagerOpen] = useState(false);
//   const [downloadManagerOpen, setDownloadManagerOpen] = useState(false);
//   const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
//   const [isDarkMode, setIsDarkMode] = useState(true);
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
//   const [apiKey, setApiKey] = useState(API_KEY);
//   const [cacheDirectory, setCacheDirectory] = useState('');
//   const [hoveredWallpaper, setHoveredWallpaper] = useState<Wallpaper | null>(null);
//   const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
//   const [downloads, setDownloads] = useState<DownloadItem[]>([]);
//   const abortControllerRef = useRef<AbortController | null>(null);
//   const slideshowIntervalRef = useRef<number | null>(null);

//   // Filter state
//   const [filters, setFilters] = useState<FilterOptions>({
//     categories: {
//       general: false,
//       anime: true,
//       people: true,
//     },
//     purity: {
//       sfw: true,
//       sketchy: true,
//       nsfw: true,
//     },
//     sorting: 'toplist',
//     topRange: '1M',
//     resolutions: [],
//     ratios: [],
//     colors: [],
//     keywords: '',
//   });

//   // Load saved state on mount
//   useEffect(() => {
//     const loadState = async () => {
//       try {
//         const savedState = await appStorage.loadState();
        
//         if (savedState) {
//           if (savedState.filters) setFilters(savedState.filters);
//           if (savedState.activeImageIndex !== undefined) setActiveImageIndex(savedState.activeImageIndex);
//           if (savedState.viewMode) setViewMode(savedState.viewMode);
//           if (savedState.isDarkMode !== undefined) setIsDarkMode(savedState.isDarkMode);
//           if (savedState.gridScale) setGridScale(savedState.gridScale);
//           if (savedState.hoverPreviewEnabled !== undefined) setHoverPreviewEnabled(savedState.hoverPreviewEnabled);
//           if (savedState.movieModeKeywords) setMovieModeKeywords(savedState.movieModeKeywords);
//           if (savedState.movieModeInfinite !== undefined) setMovieModeInfinite(savedState.movieModeInfinite);
//           if (savedState.apiKey) {
//             setApiKey(savedState.apiKey);
//             API_KEY = savedState.apiKey;
//           }
//           if (savedState.cacheDirectory) setCacheDirectory(savedState.cacheDirectory);
//         }
        
//         // Load cache directory from localStorage as fallback
//         const localCacheDir = localStorage.getItem('cacheDirectory');
//         if (localCacheDir && !cacheDirectory) {
//           setCacheDirectory(localCacheDir);
//         }
        
//         // Load API key from localStorage as fallback
//         const localApiKey = localStorage.getItem('apiKey');
//         if (localApiKey && !apiKey) {
//           setApiKey(localApiKey);
//           API_KEY = localApiKey;
//         }
//       } catch (error) {
//         console.error('Error loading saved state:', error);
//       }
//     };
    
//     loadState();
//   }, []);

//   // Save state when it changes
//   useEffect(() => {
//     const saveState = async () => {
//       try {
//         await appStorage.saveState({
//           filters,
//           activeImageIndex,
//           viewMode,
//           isDarkMode,
//           gridScale,
//           hoverPreviewEnabled,
//           movieModeKeywords,
//           movieModeInfinite,
//           apiKey,
//           cacheDirectory,
//         });
//       } catch (error) {
//         console.error('Error saving state:', error);
//       }
//     };
    
//     saveState();
//   }, [
//     filters,
//     activeImageIndex,
//     viewMode,
//     isDarkMode,
//     gridScale,
//     hoverPreviewEnabled,
//     movieModeKeywords,
//     movieModeInfinite,
//     apiKey,
//     cacheDirectory,
//   ]);

//   // Apply dark mode on mount
//   useEffect(() => {
//     if (isDarkMode) {
//       document.documentElement.classList.add('dark');
//     } else {
//       document.documentElement.classList.remove('dark');
//     }
//   }, [isDarkMode]);

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

//   // Handle keywords search with abort controller
//   useEffect(() => {
//     // Cancel previous request if keywords changed
//     if (abortControllerRef.current) {
//       abortControllerRef.current.abort();
//     }

//     // Create new abort controller
//     abortControllerRef.current = new AbortController();

//     return () => {
//       // Clean up on unmount
//       if (abortControllerRef.current) {
//         abortControllerRef.current.abort();
//       }
//     };
//   }, [filters.keywords]);

//   const { data, error, fetchNextPage, hasNextPage, isFetchingNextPage, status, refetch } = useInfiniteQuery({
//     queryKey: ['wallpapers', filters],
//     queryFn: ({ pageParam, signal }) => fetchWallpapers({ pageParam, signal: signal || abortControllerRef.current?.signal, filters }),
//     getNextPageParam: (lastPage) =>
//       lastPage.meta.current_page < lastPage.meta.last_page ? lastPage.meta.current_page + 1 : undefined,
//     initialPageParam: 1,
//     retry: (failureCount, err: any) => (err?.name === 'AbortError' ? false : failureCount < 2),
//     refetchOnWindowFocus: false,
//   });

//   // Reset active image when filters change
//   useEffect(() => {
//     setActiveImageIndex(null);
//     setIsSlideshowActive(false);
//   }, [filters]);

//   useEffect(() => {
//     if (inView && hasNextPage && !isFetchingNextPage) {
//       fetchNextPage();
//     }
//   }, [inView, hasNextPage, fetchNextPage, isFetchingNextPage]);

//   const allWallpapers = data?.pages.flatMap((page) => page.data) ?? [];

//   // Navigation handlers
//   const handleNextImage = useCallback(() => {
//     if (activeImageIndex !== null && activeImageIndex < allWallpapers.length - 1) {
//       setActiveImageIndex(activeImageIndex + 1);
//     }
//   }, [activeImageIndex, allWallpapers.length]);

//   const handlePrevImage = useCallback(() => {
//     if (activeImageIndex !== null && activeImageIndex > 0) {
//       setActiveImageIndex(activeImageIndex - 1);
//     }
//   }, [activeImageIndex]);

//   // Slideshow handlers
//   const startSlideshow = useCallback(() => {
//     if (activeImageIndex === null) return;
//     setIsSlideshowActive(true);
//     setIsSlideshowPlaying(true);
//   }, [activeImageIndex]);

//   const stopSlideshow = useCallback(() => {
//     setIsSlideshowActive(false);
//     setIsSlideshowPlaying(false);
//     if (slideshowIntervalRef.current) {
//       clearInterval(slideshowIntervalRef.current);
//       slideshowIntervalRef.current = null;
//     }
//   }, []);

//   const toggleSlideshowPlay = useCallback(() => {
//     setIsSlideshowPlaying((prev) => !prev);
//   }, []);

//   // Slideshow auto-advance
//   useEffect(() => {
//     if (isSlideshowActive && isSlideshowPlaying) {
//       slideshowIntervalRef.current = window.setInterval(() => {
//         setActiveImageIndex((prev) => {
//           if (prev === null) return 0;
//           return prev < allWallpapers.length - 1 ? prev + 1 : 0;
//         });
//       }, 3000); // Change image every 3 seconds
//     } else {
//       if (slideshowIntervalRef.current) {
//         clearInterval(slideshowIntervalRef.current);
//         slideshowIntervalRef.current = null;
//       }
//     }

//     return () => {
//       if (slideshowIntervalRef.current) {
//         clearInterval(slideshowIntervalRef.current);
//         slideshowIntervalRef.current = null;
//       }
//     };
//   }, [isSlideshowActive, isSlideshowPlaying, allWallpapers.length]);

//   const handleSlideshowNext = useCallback(() => {
//     setActiveImageIndex((prev) => {
//       if (prev === null) return 0;
//       return prev < allWallpapers.length - 1 ? prev + 1 : 0;
//     });
//   }, [allWallpapers.length]);

//   const handleSlideshowPrev = useCallback(() => {
//     setActiveImageIndex((prev) => {
//       if (prev === null) return 0;
//       return prev > 0 ? prev - 1 : allWallpapers.length - 1;
//     });
//   }, [allWallpapers.length]);

//   const handleThemeToggle = () => {
//     setIsDarkMode(!isDarkMode);
//   };

//   const handleGridScaleChange = (scale: number) => {
//     setGridScale(scale);
//   };

//   const handleHoverPreviewToggle = () => {
//     setHoverPreviewEnabled(!hoverPreviewEnabled);
//   };

//   const handleMovieModeToggle = () => {
//     setMovieModeActive(!movieModeActive);
//   };

//   const handleMovieModeKeywordChange = (position: keyof typeof movieModeKeywords, value: string) => {
//     setMovieModeKeywords(prev => ({ ...prev, [position]: value }));
//   };

//   // Batch download handler
//   const handleBatchDownload = useCallback((count: number) => {
//     // Select the first 'count' wallpapers for download
//     const wallpapersToDownload = allWallpapers.slice(0, count);
    
//     // Create download items
//     const newDownloads: DownloadItem[] = wallpapersToDownload.map(wallpaper => ({
//       id: `download-${Date.now()}-${wallpaper.id}`,
//       wallpaper,
//       status: 'pending' as const,
//       progress: 0,
//     }));
    
//     // Add to downloads list
//     setDownloads(prev => [...prev, ...newDownloads]);
    
//     // Start downloads (in a real app, this would be handled by a download service)
//     toast.success(`Started downloading ${count} images`);
    
//     // Simulate download progress
//     newDownloads.forEach((download, index) => {
//       setTimeout(() => {
//         setDownloads(prev => 
//           prev.map(d => 
//             d.id === download.id 
//               ? { ...d, status: 'downloading' as const, progress: 0 }
//               : d
//           )
//         );
        
//         // Simulate progress updates
//         const progressInterval = setInterval(() => {
//           setDownloads(prev => {
//             const updatedDownloads = prev.map(d => {
//               if (d.id === download.id) {
//                 const newProgress = Math.min(d.progress + Math.random() * 20, 100);
//                 return {
//                   ...d,
//                   progress: newProgress,
//                   status: newProgress >= 100 ? 'completed' as const : 'downloading' as const,
//                   filePath: newProgress >= 100 ? `${cacheDirectory}/${download.wallpaper.id}.${download.wallpaper.file_type || 'jpg'}` : undefined
//                 };
//               }
//               return d;
//             });
            
//             // Check if all downloads are completed
//             const completedDownload = updatedDownloads.find(d => d.id === download.id);
//             if (completedDownload?.status === 'completed') {
//               clearInterval(progressInterval);
//             }
            
//             return updatedDownloads;
//           });
//         }, 500);
//       }, index * 200); // Stagger the start of each download
//     });
//   }, [allWallpapers, cacheDirectory]);

//   const handleClearCompletedDownloads = useCallback(() => {
//     setDownloads(prev => prev.filter(d => d.status !== 'completed'));
//   }, []);

//   return (
//     <div className={`h-screen w-screen flex flex-col ${isDarkMode ? 'dark' : ''} bg-white dark:bg-gray-950`}>
//       <CompactHeader
//         title="Wallhaven Explorer"
//         onRefresh={() => refetch()}
//         onViewModeChange={setViewMode}
//         viewMode={viewMode}
//         onThemeToggle={handleThemeToggle}
//         isDarkMode={isDarkMode}
//         activeImageIndex={activeImageIndex}
//         onStartSlideshow={startSlideshow}
//         filterPanelOpen={filterPanelOpen}
//         setFilterPanelOpen={setFilterPanelOpen}
//         filters={filters}
//         setFilters={setFilters}
//         gridScale={gridScale}
//         onGridScaleChange={handleGridScaleChange}
//         hoverPreviewEnabled={hoverPreviewEnabled}
//         onHoverPreviewToggle={handleHoverPreviewToggle}
//         apiKeyManagerOpen={apiKeyManagerOpen}
//         setApiKeyManagerOpen={setApiKeyManagerOpen}
//         apiKey={apiKey}
//         setApiKey={setApiKey}
//         cacheManagerOpen={cacheManagerOpen}
//         setCacheManagerOpen={setCacheManagerOpen}
//         cacheDirectory={cacheDirectory}
//         setCacheDirectory={setCacheDirectory}
//         onMovieModeToggle={handleMovieModeToggle}
//         downloadManagerOpen={downloadManagerOpen}
//         setDownloadManagerOpen={setDownloadManagerOpen}
//         downloads={downloads}
//         onClearCompletedDownloads={handleClearCompletedDownloads}
//         onBatchDownload={handleBatchDownload}
//       />

//       <main id="scroll-container" className="flex-1 overflow-y-auto" style={{ height: 'calc(100vh - 48px)' }}>
//         <div className="w-full flex flex-col p-5">
//           {/* Active filters display */}
//           <div className="mb-2 flex flex-wrap gap-1">
//             {filters.keywords && (
//               <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs rounded-full">
//                 Keywords: {filters.keywords}
//               </span>
//             )}
//             {Object.entries(filters.categories).filter(([_, v]) => v).map(([key]) => (
//               <span key={key} className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full capitalize">
//                 {key}
//               </span>
//             ))}
//             {Object.entries(filters.purity).filter(([_, v]) => v).map(([key]) => (
//               <span key={key} className={`px-2 py-0.5 text-xs rounded-full capitalize ${
//                 key === 'sfw' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
//                 key === 'sketchy' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
//                 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
//               }`}>
//                 {key}
//               </span>
//             ))}
//           </div>

//           {status === 'pending' ? (
//             <div className="flex justify-center items-center h-64">
//               <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
//             </div>
//           ) : status === 'error' ? (
//             <div className="text-center text-red-500 py-8">Error: {(error as any)?.message ?? 'Unknown error'}</div>
//           ) : (
//             <>
//               {viewMode === 'grid' ? (
//                 <MasonryGrid
//                   wallpapers={allWallpapers}
//                   onImageClick={setActiveImageIndex}
//                   gridScale={gridScale}
//                   onHover={setHoveredWallpaper}
//                   hoverPreviewEnabled={hoverPreviewEnabled}
//                 />
//               ) : (
//                 <InfiniteScroll
//                   dataLength={allWallpapers.length}
//                   next={fetchNextPage}
//                   hasMore={!!hasNextPage}
//                   loader={
//                     <div className="flex justify-center items-center h-32">
//                       <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
//                     </div>
//                   }
//                   scrollableTarget="scroll-container"
//                   endMessage={
//                     <p className="text-center text-gray-500 dark:text-gray-400 my-4 py-2 text-sm">
//                       🎉 You've seen all the amazing wallpapers!
//                     </p>
//                   }
//                 >
//                   <div className="space-y-4">
//                     {allWallpapers.map((wallpaper, index) => (
//                       <div
//                         key={`${wallpaper.id}-${index}`}
//                         className="flex gap-4 p-3 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
//                         onClick={() => setActiveImageIndex(index)}
//                       >
//                         <div className="flex-shrink-0 w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
//                           <ImageWithCache
//                             src={wallpaper.thumbs?.small || wallpaper.path}
//                             alt={wallpaper.id}
//                             className="w-full h-full"
//                             objectFit="cover"
//                           />
//                         </div>
//                         <div className="flex-1">
//                           <h3 className="text-lg font-medium text-gray-900 dark:text-white">
//                             {wallpaper.id}
//                           </h3>
//                           <p className="text-sm text-gray-600 dark:text-gray-400">
//                             {wallpaper.resolution} • {wallpaper.category} • {wallpaper.purity}
//                           </p>
//                           <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
//                             <span className="flex items-center gap-1">
//                               <Heart size={14} />
//                               {wallpaper.favorites}
//                             </span>
//                             <span className="flex items-center gap-1">
//                               <Eye size={14} />
//                               {wallpaper.views}
//                             </span>
//                             <span>
//                               {(wallpaper.file_size / 1024 / 1024).toFixed(2)} MB
//                             </span>
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </InfiniteScroll>
//               )}

//               {/* Infinite scroll trigger for fallback */}
//               <div ref={ref} className="h-1" />
//             </>
//           )}
//         </div>
//       </main>

//       {/* Hover Preview */}
//       {hoverPreviewEnabled && hoveredWallpaper && (
//         <HoverPreview
//           wallpaper={hoveredWallpaper}
//           enabled={hoverPreviewEnabled}
//           mousePosition={mousePosition}
//         />
//       )}

//       {/* Image Modal */}
//       {activeImageIndex !== null && !isSlideshowActive && !movieModeActive && (
//         <ImmersiveImageModal
//           wallpaper={allWallpapers[activeImageIndex]}
//           onClose={() => setActiveImageIndex(null)}
//           onPrev={handlePrevImage}
//           onNext={handleNextImage}
//           onStartSlideshow={startSlideshow}
//           hasPrev={activeImageIndex > 0}
//           hasNext={activeImageIndex < allWallpapers.length - 1}
//           currentIndex={activeImageIndex}
//           totalCount={allWallpapers.length}
//         />
//       )}

//       {/* Slideshow Modal */}
//       {isSlideshowActive && activeImageIndex !== null && (
//         <ImmersiveSlideshow
//           wallpapers={allWallpapers}
//           initialIndex={activeImageIndex}
//           onClose={stopSlideshow}
//           isPlaying={isSlideshowPlaying}
//           onTogglePlay={toggleSlideshowPlay}
//           onNext={handleSlideshowNext}
//           onPrev={handleSlideshowPrev}
//           currentIndex={activeImageIndex}
//         />
//       )}

//       {/* Movie Mode Modal */}
//       {movieModeActive && (
//         <MovieMode
//           wallpapers={allWallpapers}
//           onClose={() => setMovieModeActive(false)}
//           keywords={movieModeKeywords}
//           infiniteMode={movieModeInfinite}
//           onKeywordChange={handleMovieModeKeywordChange}
//         />
//       )}
//     </div>
//   );
// }

// // --- TanStack Router and Query Client Setup ---
// const queryClient = new QueryClient({
//   defaultOptions: {
//     queries: {
//       staleTime: 5 * 60 * 1000, // 5 minutes
//       gcTime: 10 * 60 * 1000, // 10 minutes
//     },
//   },
// });

// export const Route = createFileRoute('/wallheaven')({
//   errorComponent: ({ error }) => (
//     <div className="p-6 text-red-500">
//       Oops! {(error as any)?.message ? String((error as any).message) : String(error)}
//     </div>
//   ),
//   component: () => (
//     <QueryClientProvider client={queryClient}>
//       <RouteComponent />
//       <Toaster
//         position="bottom-right"
//         toastOptions={{
//           duration: 4000,
//           style: {
//             background: '#363636',
//             color: '#fff',
//           },
//         }}
//       />
//     </QueryClientProvider>
//   ),
// });
















import { createFileRoute } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider, useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useState, useCallback, useRef, useMemo, memo } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useInView } from 'react-intersection-observer';
import { Toaster, toast } from 'react-hot-toast';
import {
  Search,
  X,
  Download,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Maximize,
  Minimize,
  Filter,
  ChevronDown,
  ArrowUp,
  Grid,
  List,
  Heart,
  Eye,
  Info,
  Settings,
  Sliders,
  Zap,
  Image as ImageIcon,
  Monitor,
  Smartphone,
  Tablet,
  Sun,
  Moon,
  RefreshCw,
  Bookmark,
  Share2,
  ExternalLink,
  Key,
  Film,
  Save,
  FolderOpen,
  HardDrive,
  MousePointer,
  Package,
  CheckCircle,
  AlertCircle,
  Loader,
  Folder,
  Tv,
  Power,
} from 'lucide-react';

// --- TYPES ---
interface Wallpaper {
  id: string;
  path: string;
  url: string;
  dimension_x: number;
  dimension_y: number;
  resolution: string;
  file_size: number;
  file_type?: string | null;
  category?: string | null;
  purity: string;
  ratio: string;
  source: string | null;
  views: number;
  favorites: number;
  created_at: string;
  thumbs: {
    small: string;
    original: string;
  };
  uploader?: {
    username?: string | null;
  } | null;
  tags?: Tag[] | null;
}

interface Tag {
  id: number;
  name: string;
  alias?: string | null;
  category?: string | null;
}

interface ApiResponse {
  data: Wallpaper[];
  meta: {
    current_page: number;
    last_page: number;
  };
}

interface FilterOptions {
  categories: {
    general: boolean;
    anime: boolean;
    people: boolean;
  };
  purity: {
    sfw: boolean;
    sketchy: boolean;
    nsfw: boolean;
  };
  sorting: 'toplist' | 'date_added' | 'relevance' | 'random' | 'views' | 'favorites';
  topRange: '1d' | '3d' | '1w' | '1M' | '3M' | '6M' | '1y';
  resolutions: string[];
  ratios: string[];
  colors: string[];
  keywords?: string;
}

interface AppState {
  filters: FilterOptions;
  activeImageIndex: number | null;
  viewMode: 'grid' | 'list';
  isDarkMode: boolean;
  gridScale: number;
  hoverPreviewEnabled: boolean;
  movieModeActive: boolean;
  movieModeKeywords: {
    topLeft: string;
    topRight: string;
    bottomLeft: string;
    bottomRight: string;
  };
  movieModeInfinite: boolean;
  apiKey: string;
  cacheDirectory: string;
}

interface DownloadItem {
  id: string;
  wallpaper: Wallpaper;
  status: 'pending' | 'downloading' | 'completed' | 'error';
  progress: number;
  filePath?: string;
  error?: string;
}

// Electron APIs
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

// --- IndexedDB Storage ---
const DB_NAME = 'wallhaven_explorer_db';
const DB_VERSION = 1;
const STORE_NAME = 'app_state';
const IMAGE_CACHE_STORE = 'image_cache';

class AppStorage {
  private db: IDBDatabase | null = null;

  async init() {
    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create store for app state
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
        
        // Create store for image cache
        if (!db.objectStoreNames.contains(IMAGE_CACHE_STORE)) {
          const imageStore = db.createObjectStore(IMAGE_CACHE_STORE);
          imageStore.createIndex('url', 'url', { unique: true });
        }
      };
    });
  }

  async saveState(state: Partial<AppState>) {
    if (!this.db) await this.init();
    
    return new Promise<void>((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(state, 'app_state');
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async loadState(): Promise<Partial<AppState> | null> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get('app_state');
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  async cacheImage(url: string, blob: Blob) {
    if (!this.db) await this.init();
    
    return new Promise<void>((resolve, reject) => {
      const transaction = this.db!.transaction([IMAGE_CACHE_STORE], 'readwrite');
      const store = transaction.objectStore(IMAGE_CACHE_STORE);
      const request = store.put({ url, blob, timestamp: Date.now() }, url);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getCachedImage(url: string): Promise<Blob | null> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([IMAGE_CACHE_STORE], 'readonly');
      const store = transaction.objectStore(IMAGE_CACHE_STORE);
      const request = store.get(url);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result;
        if (result) {
          resolve(result.blob);
        } else {
          resolve(null);
        }
      };
    });
  }

  async clearOldCache(maxAge: number = 7 * 24 * 60 * 60 * 1000) { // Default: 7 days
    if (!this.db) await this.init();
    
    return new Promise<void>((resolve, reject) => {
      const transaction = this.db!.transaction([IMAGE_CACHE_STORE], 'readwrite');
      const store = transaction.objectStore(IMAGE_CACHE_STORE);
      const index = store.index('url');
      const request = index.openCursor();
      
      request.onerror = () => reject(request.error);
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          const data = cursor.value;
          if (Date.now() - data.timestamp > maxAge) {
            cursor.delete();
          }
          cursor.continue();
        } else {
          resolve();
        }
      };
    });
  }
}

const appStorage = new AppStorage();

// --- Download Service ---
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
        // Fallback for web environment
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
        // Use Electron's native download
        await window.electronAPI.downloadFile(url, destination, onProgress);
        return destination;
      } else {
        // Fallback for web environment
        const response = await fetch(url);
        const blob = await response.blob();
        
        // Create a temporary link to trigger download
        const downloadUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = destination.split('/').pop() || 'wallpaper.jpg';
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
        // Fallback for web environment
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

// --- API Service ---
let API_KEY = 'EFkCFHGlTBVugFhK9SOI4F5GoQJTOW0W';
const BASE_URL = 'https://wallhaven.cc/api/v1/search';

type FetchParams = {
  pageParam?: number;
  signal?: AbortSignal;
  filters: FilterOptions;
};

const fetchWallpapers = async ({ pageParam = 1, signal, filters }: FetchParams): Promise<ApiResponse> => {
  // Build categories string (3 bits: general, anime, people)
  const categoriesString = 
    (filters.categories.general ? '1' : '0') +
    (filters.categories.anime ? '1' : '0') +
    (filters.categories.people ? '1' : '0');

  // Build purity string (3 bits: sfw, sketchy, nsfw)
  const purityString = 
    (filters.purity.sfw ? '1' : '0') +
    (filters.purity.sketchy ? '1' : '0') +
    (filters.purity.nsfw ? '1' : '0');

  const params = new URLSearchParams({
    apikey: API_KEY,
    sorting: filters.sorting,
    categories: categoriesString,
    purity: purityString,
    topRange: filters.topRange,
    page: pageParam.toString(),
  });

  if (filters.keywords) {
    params.append('q', filters.keywords);
  }

  const response = await fetch(`${BASE_URL}?${params.toString()}`, { signal });

  if (response.status === 429) {
    toast.error('Rate limit exceeded. Please wait a moment.');
    throw new Error('Rate limit exceeded');
  }

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  const data: ApiResponse = await response.json();
  return data;
};

// --- COMPONENTS ---

// Image Cache Component with Performance Optimizations
const ImageWithCache = memo(({ 
  src, 
  alt, 
  className, 
  onLoad, 
  onError,
  style,
  objectFit = 'cover'
}: { 
  src: string; 
  alt: string; 
  className?: string; 
  onLoad?: () => void; 
  onError?: () => void;
  style?: React.CSSProperties;
  objectFit?: 'cover' | 'contain' | 'fill';
}) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setIsLoading(true);
    setIsError(false);
    
    const loadImage = async () => {
      try {
        // Try to get from cache first
        const cachedBlob = await appStorage.getCachedImage(src);
        
        if (cachedBlob) {
          const objectUrl = URL.createObjectURL(cachedBlob);
          setImageSrc(objectUrl);
          setIsLoading(false);
          onLoad?.();
          return;
        }
        
        // If not in cache, fetch and cache
        const response = await fetch(src);
        const blob = await response.blob();
        
        // Cache the image
        await appStorage.cacheImage(src, blob);
        
        // Create object URL
        const objectUrl = URL.createObjectURL(blob);
        setImageSrc(objectUrl);
        setIsLoading(false);
        onLoad?.();
      } catch (error) {
        console.error('Error loading image:', error);
        setImageSrc(src); // Fallback to original URL
        setIsLoading(false);
        setIsError(true);
        onError?.();
      }
    };

    loadImage();
    
    // Cleanup function
    return () => {
      if (imageSrc && imageSrc.startsWith('blob:')) {
        URL.revokeObjectURL(imageSrc);
      }
    };
  }, [src, onLoad, onError]);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!imageRef.current) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Image is in viewport, load it
            const img = entry.target as HTMLImageElement;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
            }
          }
        });
      },
      { rootMargin: '50px' } // Start loading 50px before it comes into view
    );
    
    observer.observe(imageRef.current);
    
    return () => {
      if (imageRef.current) {
        observer.unobserve(imageRef.current);
      }
    };
  }, []);

  if (isError) {
    return (
      <div className={`flex items-center justify-center bg-gray-200 dark:bg-gray-800 ${className}`} style={style}>
        <ImageIcon size={24} className="text-gray-500 dark:text-gray-400" />
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
        ref={imageRef}
        data-src={imageSrc || src}
        src={imageSrc || src}
        alt={alt}
        className={`${className} transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        style={{ ...style, objectFit }}
        loading="lazy"
      />
    </>
  );
});

// Hover Preview Component with Zoom/Crop
const HoverPreview = ({ 
  wallpaper, 
  enabled, 
  mousePosition 
}: { 
  wallpaper: Wallpaper; 
  enabled: boolean; 
  mousePosition: { x: number; y: number } 
}) => {
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const previewRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!enabled || !previewRef.current) return;

    const updatePosition = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const previewWidth = Math.min(viewportWidth * 0.7, 900);
      const previewHeight = Math.min(viewportHeight * 0.8, 700);
      
      // Calculate position to keep preview in viewport
      let left = mousePosition.x + 20;
      let top = mousePosition.y - previewHeight / 2;
      
      // Adjust if preview would go outside viewport
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
  }, [enabled, mousePosition]);

  useEffect(() => {
    if (enabled) {
      const timer = setTimeout(() => setIsVisible(true), 300);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [enabled]);

  if (!enabled || !isVisible) return null;

  return (
    <div
      ref={previewRef}
      className="fixed z-50 bg-black rounded-lg shadow-2xl overflow-hidden border border-gray-800"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        width: `${position.width}px`,
        height: `${position.height}px`,
      }}
    >
      <ImageWithCache
        src={wallpaper.path}
        alt={`Preview of ${wallpaper.id}`}
        className="w-full h-full"
        objectFit="cover" // Always use cover to fill the preview space
      />
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 text-white">
        <p className="text-sm font-semibold">{wallpaper.resolution}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="flex items-center gap-1 text-xs">
            <Heart size={10} />
            {wallpaper.favorites}
          </span>
          <span className="flex items-center gap-1 text-xs">
            <Eye size={10} />
            {wallpaper.views}
          </span>
        </div>
      </div>
    </div>
  );
};

// Masonry Grid Component for Gapless Layout
const MasonryGrid = memo(({ 
  wallpapers, 
  onImageClick, 
  gridScale, 
  onHover, 
  hoverPreviewEnabled 
}: {
  wallpapers: Wallpaper[];
  onImageClick: (index: number) => void;
  gridScale: number;
  onHover: (wallpaper: Wallpaper | null) => void;
  hoverPreviewEnabled: boolean;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [columns, setColumns] = useState(4);
  const [columnWidth, setColumnWidth] = useState(0);
  const [gridItems, setGridItems] = useState<Array<{ wallpaper: Wallpaper; index: number; height: number; top: number; left: number }>>([]);

  // Calculate responsive columns
  useEffect(() => {
    const calculateColumns = () => {
      if (!containerRef.current) return;
      
      const containerWidth = containerRef.current.offsetWidth;
      const minColumnWidth = 200 * gridScale;
      const maxColumns = Math.floor(containerWidth / minColumnWidth);
      const newColumns = Math.max(2, Math.min(maxColumns, 8));
      
      setColumns(newColumns);
      setColumnWidth((containerWidth - (newColumns - 1) * 2) / newColumns); // 2px gap between columns
    };

    calculateColumns();
    
    const handleResize = () => calculateColumns();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, [gridScale]);

  // Calculate masonry layout
  useEffect(() => {
    if (!columnWidth || wallpapers.length === 0) return;
    
    const columnHeights = new Array(columns).fill(0);
    const items = wallpapers.map((wallpaper, index) => {
      // Calculate image height based on aspect ratio
      const aspectRatio = wallpaper.dimension_y / wallpaper.dimension_x;
      const height = columnWidth * aspectRatio;
      
      // Find the shortest column
      let shortestColumnIndex = 0;
      let shortestHeight = columnHeights[0];
      
      for (let i = 1; i < columns; i++) {
        if (columnHeights[i] < shortestHeight) {
          shortestColumnIndex = i;
          shortestHeight = columnHeights[i];
        }
      }
      
      // Position the item
      const top = shortestHeight;
      const left = shortestColumnIndex * (columnWidth + 2); // 2px gap between columns
      
      // Update column height
      columnHeights[shortestColumnIndex] += height + 2; // 2px gap between rows
      
      return {
        wallpaper,
        index,
        height,
        top,
        left
      };
    });
    
    setGridItems(items);
  }, [wallpapers, columns, columnWidth]);

  return (
    <div 
      ref={containerRef} 
      className="relative w-full"
      style={{ height: `${Math.max(...gridItems.map(item => item.top + item.height))}px` }}
    >
      {gridItems.map((item) => (
        <MasonryGridItem
          key={`${item.wallpaper.id}-${item.index}`}
          wallpaper={item.wallpaper}
          index={item.index}
          width={columnWidth}
          height={item.height}
          top={item.top}
          left={item.left}
          onClick={() => onImageClick(item.index)}
          onHover={onHover}
          hoverPreviewEnabled={hoverPreviewEnabled}
        />
      ))}
    </div>
  );
});

// Individual Masonry Grid Item
const MasonryGridItem = memo(({ 
  wallpaper, 
  index, 
  width, 
  height, 
  top, 
  left, 
  onClick, 
  onHover, 
  hoverPreviewEnabled 
}: {
  wallpaper: Wallpaper;
  index: number;
  width: number;
  height: number;
  top: number;
  left: number;
  onClick: () => void;
  onHover: (wallpaper: Wallpaper | null) => void;
  hoverPreviewEnabled: boolean;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Purity indicator colors
  const purityColors = {
    sfw: 'bg-green-500',
    sketchy: 'bg-yellow-500',
    nsfw: 'bg-red-500',
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(wallpaper.path, '_blank');
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (hoverPreviewEnabled) {
      onHover(wallpaper);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (hoverPreviewEnabled) {
      onHover(null);
    }
  };

  return (
    <div
      className="absolute bg-gray-200 dark:bg-gray-800 overflow-hidden cursor-pointer group"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        top: `${top}px`,
        left: `${left}px`,
      }}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Purity Indicator */}
      <div className={`absolute top-1 left-1 w-1.5 h-1.5 rounded-full z-10 ${purityColors[wallpaper.purity as keyof typeof purityColors]}`} />
      
      {/* Index Badge */}
      <div className="absolute top-1 right-1 z-10 bg-black/50 text-white text-xs px-1 rounded">
        {index + 1}
      </div>
      
      <ImageWithCache
        src={wallpaper.thumbs?.small ?? wallpaper.thumbs?.original ?? wallpaper.path}
        alt={`Wallpaper ${wallpaper.id}`}
        className="w-full h-full transition-transform duration-300 ease-out group-hover:scale-105"
        objectFit="cover"
      />

      {/* Hover Overlay */}
      <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300 ${
        isHovered ? 'opacity-100' : 'opacity-0'
      }`} />

      {/* Quick Actions */}
      <div className={`absolute bottom-0 left-0 right-0 p-2 text-white transition-transform duration-300 ${
        isHovered ? 'translate-y-0' : 'translate-y-full'
      }`}>
        <div className="flex justify-between items-center">
          <div className="text-xs">
            <p className="font-semibold">{wallpaper.resolution}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="flex items-center gap-1">
                <Heart size={10} />
                {wallpaper.favorites}
              </span>
              <span className="flex items-center gap-1">
                <Eye size={10} />
                {wallpaper.views}
              </span>
            </div>
          </div>
          <div className="flex gap-1">
            <button
              onClick={handleLike}
              className={`p-1 rounded-full transition-colors ${
                isLiked ? 'bg-red-500 text-white' : 'bg-black/50 text-white hover:bg-black/70'
              }`}
            >
              <Heart size={12} fill={isLiked ? 'white' : 'none'} />
            </button>
            <button
              onClick={handleBookmark}
              className={`p-1 rounded-full transition-colors ${
                isBookmarked ? 'bg-blue-500 text-white' : 'bg-black/50 text-white hover:bg-black/70'
              }`}
            >
              <Bookmark size={12} fill={isBookmarked ? 'white' : 'none'} />
            </button>
            <button
              onClick={handleDownload}
              className="p-1 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
            >
              <Download size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

// Download Manager Component
const DownloadManager = ({ 
  isOpen, 
  setIsOpen, 
  downloads, 
  onClearCompleted 
}: { 
  isOpen: boolean; 
  setIsOpen: (open: boolean) => void; 
  downloads: DownloadItem[];
  onClearCompleted: () => void;
}) => {
  const pendingCount = downloads.filter(d => d.status === 'pending' || d.status === 'downloading').length;
  const completedCount = downloads.filter(d => d.status === 'completed').length;
  const errorCount = downloads.filter(d => d.status === 'error').length;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors relative"
      >
        <Package size={16} />
        <span className="text-sm">Downloads</span>
        {pendingCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
            {pendingCount}
          </span>
        )}
        <ChevronDown size={14} className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 w-80 bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-hidden flex flex-col">
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Downloads</h3>
              <button
                onClick={onClearCompleted}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                Clear Completed
              </button>
            </div>
            <div className="flex gap-2 mt-2 text-xs">
              <span className="flex items-center gap-1">
                <Loader size={10} className="text-blue-500" />
                {pendingCount} Pending
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle size={10} className="text-green-500" />
                {completedCount} Completed
              </span>
              <span className="flex items-center gap-1">
                <AlertCircle size={10} className="text-red-500" />
                {errorCount} Failed
              </span>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {downloads.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                No downloads yet
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {downloads.map((download) => (
                  <div key={download.id} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <div className="flex items-start gap-2">
                      <div className="flex-shrink-0 w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
                        <ImageWithCache
                          src={download.wallpaper.thumbs?.small || download.wallpaper.path}
                          alt={download.wallpaper.id}
                          className="w-full h-full"
                          objectFit="cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {download.wallpaper.id}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {download.wallpaper.resolution} • {(download.wallpaper.file_size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <div className="flex items-center gap-1">
                            {download.status === 'pending' && <Loader size={10} className="text-blue-500 animate-spin" />}
                            {download.status === 'downloading' && <Loader size={10} className="text-blue-500 animate-spin" />}
                            {download.status === 'completed' && <CheckCircle size={10} className="text-green-500" />}
                            {download.status === 'error' && <AlertCircle size={10} className="text-red-500" />}
                            <span className="text-xs capitalize">{download.status}</span>
                          </div>
                          {download.status === 'downloading' && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {download.progress}%
                            </span>
                          )}
                        </div>
                        {download.status === 'downloading' && (
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 mt-1">
                            <div
                              className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                              style={{ width: `${download.progress}%` }}
                            />
                          </div>
                        )}
                        {download.status === 'error' && (
                          <p className="text-xs text-red-500 mt-1">{download.error}</p>
                        )}
                        {download.status === 'completed' && download.filePath && (
                          <button
                            onClick={() => DownloadService.getInstance().openFileLocation(download.filePath!)}
                            className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1"
                          >
                            Open File Location
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Batch Download Component
const BatchDownload = ({ 
  wallpapers, 
  onDownloadStart 
}: { 
  wallpapers: Wallpaper[];
  onDownloadStart: (count: number) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [count, setCount] = useState(10);

  const handleDownload = () => {
    if (count > 0 && count <= wallpapers.length) {
      onDownloadStart(count);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
      >
        <Download size={16} />
        <span className="text-sm">Batch Download</span>
        <ChevronDown size={14} className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 w-64 bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 z-50">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Batch Download</h3>
          
          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Number of Images
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="1"
                max={Math.min(wallpapers.length, 100)}
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300 w-8">{count}</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Max: {Math.min(wallpapers.length, 100)} images
            </p>
          </div>
          
          <button
            onClick={handleDownload}
            className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
          >
            Start Download
          </button>
        </div>
      )}
    </div>
  );
};

// Movie Mode Component with TV Interface
const MovieMode = ({
  wallpapers,
  onClose,
  keywords,
  infiniteMode,
  onKeywordChange,
}: {
  wallpapers: Wallpaper[];
  onClose: () => void;
  keywords: {
    topLeft: string;
    topRight: string;
    bottomLeft: string;
    bottomRight: string;
  };
  infiniteMode: boolean;
  onKeywordChange: (position: keyof typeof keywords, value: string) => void;
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [keywordInputs, setKeywordInputs] = useState(keywords);
  const [showControls, setShowControls] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Filter wallpapers based on keywords
  const filteredWallpapers = useMemo(() => {
    if (!keywords.topLeft && !keywords.topRight && !keywords.bottomLeft && !keywords.bottomRight) {
      return wallpapers;
    }

    return wallpapers.filter(wallpaper => {
      const tags = wallpaper.tags?.map(tag => tag.name.toLowerCase()).join(' ') || '';
      const category = wallpaper.category?.toLowerCase() || '';
      const purity = wallpaper.purity.toLowerCase();
      const allText = `${tags} ${category} ${purity}`.toLowerCase();

      return (
        (keywords.topLeft && allText.includes(keywords.topLeft.toLowerCase())) ||
        (keywords.topRight && allText.includes(keywords.topRight.toLowerCase())) ||
        (keywords.bottomLeft && allText.includes(keywords.bottomLeft.toLowerCase())) ||
        (keywords.bottomRight && allText.includes(keywords.bottomRight.toLowerCase()))
      );
    });
  }, [wallpapers, keywords]);

  // Get 4 wallpapers for current display
  const getDisplayWallpapers = () => {
    const result = [];
    const startIndex = currentIndex * 4;
    
    for (let i = 0; i < 4; i++) {
      const index = (startIndex + i) % filteredWallpapers.length;
      result.push(filteredWallpapers[index]);
    }
    
    return result;
  };

  const displayWallpapers = getDisplayWallpapers();

  // Auto-advance slideshow
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex(prev => {
          const maxIndex = Math.ceil(filteredWallpapers.length / 4) - 1;
          if (infiniteMode && prev >= maxIndex) {
            return 0; // Loop back to start
          }
          return prev < maxIndex ? prev + 1 : prev;
        });
      }, 3000); // Change every 3 seconds
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
  }, [isPlaying, filteredWallpapers.length, infiniteMode]);

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

  const handleKeywordInputChange = (position: keyof typeof keywords, value: string) => {
    setKeywordInputs(prev => ({ ...prev, [position]: value }));
  };

  const handleKeywordSubmit = (position: keyof typeof keywords) => {
    onKeywordChange(position, keywordInputs[position]);
  };

  const handleStart = () => {
    setIsPlaying(true);
  };

  const handleStop = () => {
    setIsPlaying(false);
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
                {displayWallpapers.map((wallpaper, index) => {
                  const position = ['topLeft', 'topRight', 'bottomLeft', 'bottomRight'][index] as keyof typeof keywords;
                  return (
                    <div key={index} className="relative bg-gray-900 overflow-hidden">
                      <ImageWithCache
                        src={wallpaper.path}
                        alt={`Movie mode image ${index + 1}`}
                        className="w-full h-full"
                        objectFit="cover"
                      />
                      
                      {/* Keyword Input Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={keywordInputs[position]}
                            onChange={(e) => handleKeywordInputChange(position, e.target.value)}
                            placeholder={`Keywords for ${position.replace(/([A-Z])/g, ' $1').toLowerCase()}`}
                            className="flex-1 px-2 py-1 bg-black/70 text-white text-xs rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleKeywordSubmit(position);
                            }}
                            className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                          >
                            <Save size={12} />
                          </button>
                        </div>
                        <p className="text-white text-xs mt-1 truncate">{wallpaper.resolution}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        
        {/* TV Brand Logo */}
        <div className="absolute top-12 left-1/2 transform -translate-x-1/2 text-gray-600 text-2xl font-bold">
          WALLHAVEN TV
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
                    const maxIndex = Math.ceil(filteredWallpapers.length / 4) - 1;
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
                  onChange={() => {}} // Will be handled by parent
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

      {/* Progress Bar */}
      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
        showControls ? 'opacity-100' : 'opacity-0'
      }`}>
        <div className="max-w-4xl mx-auto">
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-1000 ease-linear"
              style={{ 
                width: `${((currentIndex + 1) / Math.ceil(filteredWallpapers.length / 4)) * 100}%` 
              }}
            />
          </div>
          <p className="text-white text-sm mt-2 text-center">
            Set {currentIndex + 1} / {Math.ceil(filteredWallpapers.length / 4)} • {filteredWallpapers.length} images
          </p>
        </div>
      </div>
    </div>
  );
};

// Compact Filter Panel Component
const CompactFilterPanel = ({ 
  filters, 
  setFilters,
  isOpen,
  setIsOpen 
}: { 
  filters: FilterOptions; 
  setFilters: (filters: FilterOptions) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}) => {
  const handleCategoryToggle = (category: keyof FilterOptions['categories']) => {
    setFilters({
      ...filters,
      categories: {
        ...filters.categories,
        [category]: !filters.categories[category],
      },
    });
  };

  const handlePurityToggle = (purity: keyof FilterOptions['purity']) => {
    setFilters({
      ...filters,
      purity: {
        ...filters.purity,
        [purity]: !filters.purity[purity],
      },
    });
  };

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (isOpen && !target.closest('.filter-panel')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isOpen, setIsOpen]);

  return (
    <div className="relative filter-panel">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      >
        <Sliders size={16} />
        <span className="text-sm">Filters</span>
        <ChevronDown size={14} className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 w-72 bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-3 z-50">
          {/* Keywords Search */}
          <div className="mb-3">
            <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Keywords</h3>
            <input
              type="text"
              value={filters.keywords || ''}
              onChange={(e) => setFilters({ ...filters, keywords: e.target.value })}
              placeholder="Enter keywords..."
              className="w-full px-2 py-1 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 focus:border-blue-500 dark:text-gray-300"
            />
          </div>

          {/* Quick Categories */}
          <div className="mb-3">
            <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Categories</h3>
            <div className="flex gap-2">
              <button
                onClick={() => handleCategoryToggle('general')}
                className={`px-2 py-1 text-xs rounded ${
                  filters.categories.general 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                General
              </button>
              <button
                onClick={() => handleCategoryToggle('anime')}
                className={`px-2 py-1 text-xs rounded ${
                  filters.categories.anime 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                Anime
              </button>
              <button
                onClick={() => handleCategoryToggle('people')}
                className={`px-2 py-1 text-xs rounded ${
                  filters.categories.people 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                People
              </button>
            </div>
          </div>

          {/* Quick Purity */}
          <div className="mb-3">
            <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Purity</h3>
            <div className="flex gap-2">
              <button
                onClick={() => handlePurityToggle('sfw')}
                className={`px-2 py-1 text-xs rounded ${
                  filters.purity.sfw 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                SFW
              </button>
              <button
                onClick={() => handlePurityToggle('sketchy')}
                className={`px-2 py-1 text-xs rounded ${
                  filters.purity.sketchy 
                    ? 'bg-yellow-500 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                Sketchy
              </button>
              <button
                onClick={() => handlePurityToggle('nsfw')}
                className={`px-2 py-1 text-xs rounded ${
                  filters.purity.nsfw 
                    ? 'bg-red-500 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                NSFW
              </button>
            </div>
          </div>

          {/* Sorting */}
          <div className="mb-3">
            <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Sort By</h3>
            <select
              value={filters.sorting}
              onChange={(e) => setFilters({ ...filters, sorting: e.target.value as FilterOptions['sorting'] })}
              className="w-full px-2 py-1 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 focus:border-blue-500 dark:text-gray-300"
            >
              <option value="toplist">Top List</option>
              <option value="date_added">Date Added</option>
              <option value="relevance">Relevance</option>
              <option value="random">Random</option>
              <option value="views">Views</option>
              <option value="favorites">Favorites</option>
            </select>
          </div>

          {/* Time Range (only for toplist) */}
          {filters.sorting === 'toplist' && (
            <div>
              <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Time Range</h3>
              <select
                value={filters.topRange}
                onChange={(e) => setFilters({ ...filters, topRange: e.target.value as FilterOptions['topRange'] })}
                className="w-full px-2 py-1 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 focus:border-blue-500 dark:text-gray-300"
              >
                <option value="1d">Last Day</option>
                <option value="3d">Last 3 Days</option>
                <option value="1w">Last Week</option>
                <option value="1M">Last Month</option>
                <option value="3M">Last 3 Months</option>
                <option value="6M">Last 6 Months</option>
                <option value="1y">Last Year</option>
              </select>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// API Key Manager Component
const ApiKeyManager = ({ 
  isOpen, 
  setIsOpen, 
  apiKey, 
  setApiKey 
}: { 
  isOpen: boolean; 
  setIsOpen: (open: boolean) => void; 
  apiKey: string; 
  setApiKey: (key: string) => void; 
}) => {
  const [tempApiKey, setTempApiKey] = useState(apiKey);
  const [savedKeys, setSavedKeys] = useState<string[]>([]);

  useEffect(() => {
    // Load saved API keys from local storage
    const keys = JSON.parse(localStorage.getItem('savedApiKeys') || '[]');
    setSavedKeys(keys);
  }, []);

  const handleSaveKey = () => {
    if (tempApiKey.trim()) {
      // Update the global API key
      setApiKey(tempApiKey);
      API_KEY = tempApiKey;
      
      // Save to local storage
      const keys = [...savedKeys.filter(k => k !== tempApiKey), tempApiKey];
      localStorage.setItem('savedApiKeys', JSON.stringify(keys));
      setSavedKeys(keys);
      
      toast.success('API key updated successfully!');
      setIsOpen(false);
    } else {
      toast.error('Please enter a valid API key');
    }
  };

  const handleSelectKey = (key: string) => {
    setTempApiKey(key);
  };

  const handleDeleteKey = (keyToDelete: string) => {
    const updatedKeys = savedKeys.filter(k => k !== keyToDelete);
    localStorage.setItem('savedApiKeys', JSON.stringify(updatedKeys));
    setSavedKeys(updatedKeys);
    
    if (tempApiKey === keyToDelete) {
      setTempApiKey('');
    }
    
    toast.success('API key removed');
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      >
        <Key size={16} />
        <span className="text-sm">API Key</span>
        <ChevronDown size={14} className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 w-80 bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 z-50">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">API Key Management</h3>
          
          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Enter API Key
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
                placeholder="Your Wallhaven API key"
                className="flex-1 px-2 py-1 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 focus:border-blue-500 dark:text-gray-300"
              />
              <button
                onClick={handleSaveKey}
                className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
              >
                Save
              </button>
            </div>
          </div>

          {savedKeys.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Saved Keys</h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {savedKeys.map((key, index) => (
                  <div key={index} className="flex items-center justify-between p-1 bg-gray-50 dark:bg-gray-800 rounded">
                    <button
                      onClick={() => handleSelectKey(key)}
                      className="text-xs text-gray-700 dark:text-gray-300 truncate flex-1 text-left"
                    >
                      {key.substring(0, 10)}...{key.substring(key.length - 5)}
                    </button>
                    <button
                      onClick={() => handleDeleteKey(key)}
                      className="p-1 text-red-500 hover:text-red-700 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Cache Manager Component with Open Folder Button
const CacheManager = ({ 
  isOpen, 
  setIsOpen,
  cacheDirectory,
  setCacheDirectory 
}: { 
  isOpen: boolean; 
  setIsOpen: (open: boolean) => void;
  cacheDirectory: string;
  setCacheDirectory: (dir: string) => void;
}) => {
  const [cacheSize, setCacheSize] = useState(0);
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    // Calculate cache size
    const calculateCacheSize = async () => {
      try {
        if ('storage' in navigator && 'estimate' in navigator.storage) {
          const estimate = await navigator.storage.estimate();
          setCacheSize(Math.round((estimate.usage || 0) / (1024 * 1024))); // Convert to MB
        }
      } catch (error) {
        console.error('Error calculating cache size:', error);
      }
    };

    calculateCacheSize();
  }, [isOpen]);

  const handleClearCache = async () => {
    setIsClearing(true);
    try {
      await appStorage.clearOldCache(0); // Clear all cache
      toast.success('Cache cleared successfully!');
      setCacheSize(0);
    } catch (error) {
      console.error('Error clearing cache:', error);
      toast.error('Failed to clear cache');
    } finally {
      setIsClearing(false);
    }
  };

  const handleSelectDirectory = async () => {
    const downloadService = DownloadService.getInstance();
    const dir = await downloadService.selectDownloadDirectory();
    if (dir) {
      setCacheDirectory(dir);
      localStorage.setItem('cacheDirectory', dir);
      toast.success('Cache directory updated!');
    }
  };

  const handleOpenCacheFolder = async () => {
    const downloadService = DownloadService.getInstance();
    if (cacheDirectory) {
      await downloadService.openFileLocation(cacheDirectory);
    } else {
      toast.error('No cache directory set');
    }
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
        <div className="absolute top-full right-0 mt-1 w-72 bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 z-50">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Cache Management</h3>
          
          <div className="mb-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-gray-600 dark:text-gray-400">Cache Size</span>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{cacheSize} MB</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${Math.min(100, (cacheSize / 500) * 100)}%` }}
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Cache Directory
            </label>
            <div className="flex gap-2">
              <div className="flex-1 px-2 py-1 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 truncate">
                {cacheDirectory || 'Not set'}
              </div>
              <button
                onClick={handleSelectDirectory}
                className="p-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                title="Select Directory"
              >
                <FolderOpen size={14} />
              </button>
              <button
                onClick={handleOpenCacheFolder}
                className="p-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                title="Open Cache Folder"
              >
                <Folder size={14} />
              </button>
            </div>
          </div>

          <button
            onClick={handleClearCache}
            disabled={isClearing || cacheSize === 0}
            className="w-full px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isClearing ? 'Clearing...' : 'Clear Cache'}
          </button>
        </div>
      )}
    </div>
  );
};

// Enhanced Image Modal Component
const ImmersiveImageModal = ({
  wallpaper,
  onClose,
  onPrev,
  onNext,
  onStartSlideshow,
  hasPrev,
  hasNext,
  currentIndex,
  totalCount,
}: {
  wallpaper: Wallpaper;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onStartSlideshow: () => void;
  hasPrev: boolean;
  hasNext: boolean;
  currentIndex: number;
  totalCount: number;
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const uploaderName = wallpaper.uploader?.username ?? 'Anonymous';

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          onClose();
        }
      }
      if (e.key === 'ArrowLeft' && hasPrev) onPrev();
      if (e.key === 'ArrowRight' && hasNext) onNext();
      if (e.key === ' ') {
        e.preventDefault();
        onStartSlideshow();
      }
      if (e.key === 'f') {
        e.preventDefault();
        setIsFullscreen((prev) => !prev);
      }
      if (e.key === 'i') {
        e.preventDefault();
        setShowInfo((prev) => !prev);
      }
      if (e.key === 'l') {
        e.preventDefault();
        setIsLiked(!isLiked);
      }
      if (e.key === 'b') {
        e.preventDefault();
        setIsBookmarked(!isBookmarked);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onPrev, onNext, hasPrev, hasNext, isFullscreen, onStartSlideshow, isLiked, isBookmarked]);

  useEffect(() => {
    if (isFullscreen) {
      document.documentElement.requestFullscreen?.();
    } else if (document.fullscreenElement) {
      document.exitFullscreen?.();
    }
  }, [isFullscreen]);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  // Reset image loaded state when wallpaper changes
  useEffect(() => {
    setImageLoaded(false);
  }, [wallpaper.id]);

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  const handleDownload = async () => {
    const downloadService = DownloadService.getInstance();
    const dir = await downloadService.selectDownloadDirectory();
    if (dir) {
      const fileName = `${wallpaper.id}.${wallpaper.file_type || 'jpg'}`;
      const filePath = `${dir}/${fileName}`;
      try {
        await downloadService.downloadFile(wallpaper.path, filePath);
        toast.success(`Downloaded: ${fileName}`);
      } catch (error) {
        toast.error('Download failed');
      }
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Wallpaper by ${uploaderName}`,
        text: `Check out this amazing wallpaper!`,
        url: wallpaper.path,
      });
    } else {
      navigator.clipboard.writeText(wallpaper.path);
      toast.success('Link copied to clipboard!');
    }
  };

  return (
    <div
      className={`fixed inset-0 bg-black z-50 flex items-center justify-center transition-all duration-300 ${
        isFullscreen ? 'p-0' : 'p-0'
      }`}
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className={`relative w-full h-full flex flex-col transition-all duration-300 ${
          isFullscreen ? 'w-full h-full' : 'w-full h-full'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Controls Bar */}
        <div className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/70 to-transparent p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3 text-white">
              <span className="text-sm bg-black/50 px-2 py-1 rounded backdrop-blur-sm">
                {currentIndex + 1} / {totalCount}
              </span>
              <span className="text-sm">{wallpaper.resolution}</span>
              <span className="text-sm capitalize">{wallpaper.purity}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleLike}
                className={`p-2 rounded-full transition-colors ${
                  isLiked ? 'bg-red-500 text-white' : 'bg-black/50 text-white hover:bg-black/70'
                }`}
                title="Like (L)"
              >
                <Heart size={18} fill={isLiked ? 'white' : 'none'} />
              </button>
              <button
                onClick={handleBookmark}
                className={`p-2 rounded-full transition-colors ${
                  isBookmarked ? 'bg-blue-500 text-white' : 'bg-black/50 text-white hover:bg-black/70'
                }`}
                title="Bookmark (B)"
              >
                <Bookmark size={18} fill={isBookmarked ? 'white' : 'none'} />
              </button>
              <button
                onClick={handleShare}
                className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                title="Share"
              >
                <Share2 size={18} />
              </button>
              <button
                onClick={handleDownload}
                className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                title="Download"
              >
                <Download size={18} />
              </button>
              <button
                onClick={() => setShowInfo(!showInfo)}
                className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                title="Info (I)"
              >
                <Info size={18} />
              </button>
              <button
                onClick={onStartSlideshow}
                className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                title="Start Slideshow (Space)"
              >
                <Play size={18} />
              </button>
              <button
                onClick={() => setIsFullscreen((prev) => !prev)}
                className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                title="Toggle Fullscreen (F)"
              >
                {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
              </button>
              <button
                onClick={onClose}
                className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                title="Close (Esc)"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        {hasPrev && (
          <button
            onClick={onPrev}
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

        {/* Main Image Area */}
        <div className="flex-grow flex items-center justify-center bg-black relative overflow-hidden">
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          <ImageWithCache
            src={wallpaper.path}
            alt={`Wallpaper ${wallpaper.id}`}
            className={`max-w-full max-h-full object-contain transition-opacity duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={handleImageLoad}
          />
        </div>

        {/* Info Panel */}
        {showInfo && (
          <div className="absolute bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-black/80 to-transparent p-4 text-white">
            <div className=" mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="font-semibold text-gray-300">Uploader</p>
                  <p>{uploaderName}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-300">Resolution</p>
                  <p>{wallpaper.resolution}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-300">Ratio</p>
                  <p>{wallpaper.ratio}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-300">Category</p>
                  <p>{wallpaper.category ?? '\u2014'}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-300">Favorites</p>
                  <p>{wallpaper.favorites.toLocaleString()}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-300">Views</p>
                  <p>{wallpaper.views.toLocaleString()}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-300">File Type</p>
                  <p>{wallpaper.file_type ?? 'Unknown'}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-300">Purity</p>
                  <p className="capitalize">{wallpaper.purity}</p>
                </div>
              </div>
              <div className="mt-3">
                <p className="font-semibold text-gray-300 mb-1">Tags</p>
                <div className="flex flex-wrap gap-1">
                  {(wallpaper.tags ?? []).map((tag) => (
                    <span
                      key={tag.id}
                      className="bg-white/20 text-xs px-2 py-0.5 rounded-full"
                    >
                      {tag.name}
                    </span>
                  ))}
                  {(wallpaper.tags ?? []).length === 0 && (
                    <span className="text-xs text-gray-400">No tags</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Enhanced Slideshow Component
const ImmersiveSlideshow = ({
  wallpapers,
  initialIndex,
  onClose,
  isPlaying,
  onTogglePlay,
  onNext,
  onPrev,
  currentIndex,
}: {
  wallpapers: Wallpaper[];
  initialIndex: number;
  onClose: () => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrev: () => void;
  currentIndex: number;
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === ' ') {
        e.preventDefault();
        onTogglePlay();
      }
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
      if (e.key === 'h') {
        e.preventDefault();
        setShowControls((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onTogglePlay, onNext, onPrev]);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  useEffect(() => {
    setImageLoaded(false);
  }, [currentIndex]);

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  useEffect(() => {
    const container = document.getElementById('slideshow-container');
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      return () => {
        container.removeEventListener('mousemove', handleMouseMove);
        if (controlsTimeoutRef.current) {
          clearTimeout(controlsTimeoutRef.current);
        }
      };
    }
  }, []);

  return (
    <div id="slideshow-container" className="fixed inset-0 bg-black z-50 flex items-center justify-center w-full h-full" onClick={onClose}>
      {/* Controls */}
      <div className={`absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/70 to-transparent p-4 transition-opacity duration-300 ${
        showControls ? 'opacity-100' : 'opacity-0'
      }`}>
        <div className="flex justify-between items-center text-white">
          <span className="text-sm bg-black/50  py-1 rounded-full backdrop-blur-sm">
            {currentIndex + 1} / {wallpapers.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTogglePlay();
              }}
              className="p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors backdrop-blur-sm"
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors backdrop-blur-sm"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <div className={`absolute left-0 right-0 top-1/2 -translate-y-1/2 z-40 flex justify-between px-4 transition-opacity duration-300 ${
        showControls ? 'opacity-100' : 'opacity-0'
      }`}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
          className="p-3 text-white bg-black/50 rounded-full hover:bg-black/70 transition-all backdrop-blur-sm hover:scale-110"
        >
          <ChevronLeft size={28} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          className="p-3 text-white bg-black/50 rounded-full hover:bg-black/70 transition-all backdrop-blur-sm hover:scale-110"
        >
          <ChevronRight size={28} />
        </button>
      </div>

      {/* Image */}
      <div className="relative max-w-full max-h-full" onClick={(e) => e.stopPropagation()}>
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <ImageWithCache
          src={wallpapers[currentIndex].path}
          alt={`Slideshow image ${currentIndex + 1}`}
          className={`max-w-full max-h-screen object-contain transition-opacity duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={handleImageLoad}
        />
      </div>

      {/* Progress Bar */}
      <div className={`absolute bottom-0 left-0 right-0 z-50 p-4 transition-opacity duration-300 ${
        showControls ? 'opacity-100' : 'opacity-0'
      }`}>
        <div className="w-full bg-gray-600 rounded-full h-1">
          <div
            className="bg-white h-1 rounded-full transition-all duration-1000 ease-linear"
            style={{ width: `${((currentIndex + 1) / wallpapers.length) * 100}%` }}
          />
        </div>
        <div className="text-center text-white text-xs mt-2">
          {wallpapers[currentIndex].resolution} • {wallpapers[currentIndex].purity}
        </div>
      </div>
    </div>
  );
};

// Compact Header Component
const CompactHeader = ({
  title,
  onRefresh,
  onViewModeChange,
  viewMode,
  onThemeToggle,
  isDarkMode,
  activeImageIndex,
  onStartSlideshow,
  filterPanelOpen,
  setFilterPanelOpen,
  filters,
  setFilters,
  gridScale,
  onGridScaleChange,
  hoverPreviewEnabled,
  onHoverPreviewToggle,
  apiKeyManagerOpen,
  setApiKeyManagerOpen,
  apiKey,
  setApiKey,
  cacheManagerOpen,
  setCacheManagerOpen,
  cacheDirectory,
  setCacheDirectory,
  onMovieModeToggle,
  downloadManagerOpen,
  setDownloadManagerOpen,
  downloads,
  onClearCompletedDownloads,
  onBatchDownload,
}: {
  title: string;
  onRefresh: () => void;
  onViewModeChange: (mode: 'grid' | 'list') => void;
  viewMode: 'grid' | 'list';
  onThemeToggle: () => void;
  isDarkMode: boolean;
  activeImageIndex: number | null;
  onStartSlideshow: () => void;
  filterPanelOpen: boolean;
  setFilterPanelOpen: (open: boolean) => void;
  filters: FilterOptions;
  setFilters: (filters: FilterOptions) => void;
  gridScale: number;
  onGridScaleChange: (scale: number) => void;
  hoverPreviewEnabled: boolean;
  onHoverPreviewToggle: () => void;
  apiKeyManagerOpen: boolean;
  setApiKeyManagerOpen: (open: boolean) => void;
  apiKey: string;
  setApiKey: (key: string) => void;
  cacheManagerOpen: boolean;
  setCacheManagerOpen: (open: boolean) => void;
  cacheDirectory: string;
  setCacheDirectory: (dir: string) => void;
  onMovieModeToggle: () => void;
  downloadManagerOpen: boolean;
  setDownloadManagerOpen: (open: boolean) => void;
  downloads: DownloadItem[];
  onClearCompletedDownloads: () => void;
  onBatchDownload: (count: number) => void;
}) => {
  return (
    <header className="flex-shrink-0 sticky top-0 z-40 bg-white/90 dark:bg-gray-950/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-2 py-2 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">{title}</h1>
          <button
            onClick={onRefresh}
            className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            title="Refresh"
          >
            <RefreshCw size={16} />
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          {activeImageIndex !== null && (
            <button
              onClick={onStartSlideshow}
              className="flex items-center gap-1 px-2 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
            >
              <Play size={14} />
              Slideshow
            </button>
          )}
          
          <button
            onClick={onMovieModeToggle}
            className="flex items-center gap-1 px-2 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition-colors"
          >
            <Tv size={14} />
            Movie Mode
          </button>
          
          <BatchDownload
            wallpapers={[]} // Will be passed from parent
            onDownloadStart={onBatchDownload}
          />
          
          <DownloadManager
            isOpen={downloadManagerOpen}
            setIsOpen={setDownloadManagerOpen}
            downloads={downloads}
            onClearCompleted={onClearCompletedDownloads}
          />
          
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-1 rounded ${
                viewMode === 'grid' 
                  ? 'bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white' 
                  : 'text-gray-600 dark:text-gray-400'
              }`}
              title="Grid View"
            >
              <Grid size={16} />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`p-1 rounded ${
                viewMode === 'list' 
                  ? 'bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white' 
                  : 'text-gray-600 dark:text-gray-400'
              }`}
              title="List View"
            >
              <List size={16} />
            </button>
          </div>
          
          <div className="flex items-center gap-1">
            <button
              onClick={onHoverPreviewToggle}
              className={`p-1 rounded ${
                hoverPreviewEnabled 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
              }`}
              title="Toggle Hover Preview"
            >
              <MousePointer size={16} />
            </button>
            
            <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded px-1">
              <span className="text-xs text-gray-600 dark:text-gray-400 mr-1">Scale</span>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={gridScale}
                onChange={(e) => onGridScaleChange(parseFloat(e.target.value))}
                className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-xs text-gray-600 dark:text-gray-400 ml-1">{gridScale.toFixed(1)}x</span>
            </div>
          </div>
          
          <CompactFilterPanel 
            filters={filters} 
            setFilters={setFilters} 
            isOpen={filterPanelOpen}
            setIsOpen={setFilterPanelOpen}
          />
          
          <ApiKeyManager
            isOpen={apiKeyManagerOpen}
            setIsOpen={setApiKeyManagerOpen}
            apiKey={apiKey}
            setApiKey={setApiKey}
          />
          
          <CacheManager
            isOpen={cacheManagerOpen}
            setIsOpen={setCacheManagerOpen}
            cacheDirectory={cacheDirectory}
            setCacheDirectory={setCacheDirectory}
          />
          
          <button
            onClick={onThemeToggle}
            className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            title="Toggle Theme"
          >
            {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </div>
    </header>
  );
};

// Main Component
function RouteComponent() {
  const { ref, inView } = useInView();
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);
  const [isSlideshowActive, setIsSlideshowActive] = useState(false);
  const [isSlideshowPlaying, setIsSlideshowPlaying] = useState(true);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [apiKeyManagerOpen, setApiKeyManagerOpen] = useState(false);
  const [cacheManagerOpen, setCacheManagerOpen] = useState(false);
  const [downloadManagerOpen, setDownloadManagerOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [gridScale, setGridScale] = useState(1);
  const [hoverPreviewEnabled, setHoverPreviewEnabled] = useState(false);
  const [movieModeActive, setMovieModeActive] = useState(false);
  const [movieModeKeywords, setMovieModeKeywords] = useState({
    topLeft: '',
    topRight: '',
    bottomLeft: '',
    bottomRight: '',
  });
  const [movieModeInfinite, setMovieModeInfinite] = useState(true);
  const [apiKey, setApiKey] = useState(API_KEY);
  const [cacheDirectory, setCacheDirectory] = useState('');
  const [hoveredWallpaper, setHoveredWallpaper] = useState<Wallpaper | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);
  const slideshowIntervalRef = useRef<number | null>(null);

  // Filter state
  const [filters, setFilters] = useState<FilterOptions>({
    categories: {
      general: false,
      anime: true,
      people: true,
    },
    purity: {
      sfw: true,
      sketchy: true,
      nsfw: true,
    },
    sorting: 'toplist',
    topRange: '1M',
    resolutions: [],
    ratios: [],
    colors: [],
    keywords: '',
  });

  // Load saved state on mount
  useEffect(() => {
    const loadState = async () => {
      try {
        const savedState = await appStorage.loadState();
        
        if (savedState) {
          if (savedState.filters) setFilters(savedState.filters);
          if (savedState.activeImageIndex !== undefined) setActiveImageIndex(savedState.activeImageIndex);
          if (savedState.viewMode) setViewMode(savedState.viewMode);
          if (savedState.isDarkMode !== undefined) setIsDarkMode(savedState.isDarkMode);
          if (savedState.gridScale) setGridScale(savedState.gridScale);
          if (savedState.hoverPreviewEnabled !== undefined) setHoverPreviewEnabled(savedState.hoverPreviewEnabled);
          if (savedState.movieModeKeywords) setMovieModeKeywords(savedState.movieModeKeywords);
          if (savedState.movieModeInfinite !== undefined) setMovieModeInfinite(savedState.movieModeInfinite);
          if (savedState.apiKey) {
            setApiKey(savedState.apiKey);
            API_KEY = savedState.apiKey;
          }
          if (savedState.cacheDirectory) setCacheDirectory(savedState.cacheDirectory);
        }
        
        // Load cache directory from localStorage as fallback
        const localCacheDir = localStorage.getItem('cacheDirectory');
        if (localCacheDir && !cacheDirectory) {
          setCacheDirectory(localCacheDir);
        }
        
        // Load API key from localStorage as fallback
        const localApiKey = localStorage.getItem('apiKey');
        if (localApiKey && !apiKey) {
          setApiKey(localApiKey);
          API_KEY = localApiKey;
        }
      } catch (error) {
        console.error('Error loading saved state:', error);
      }
    };
    
    loadState();
  }, []);

  // Save state when it changes
  useEffect(() => {
    const saveState = async () => {
      try {
        await appStorage.saveState({
          filters,
          activeImageIndex,
          viewMode,
          isDarkMode,
          gridScale,
          hoverPreviewEnabled,
          movieModeKeywords,
          movieModeInfinite,
          apiKey,
          cacheDirectory,
        });
      } catch (error) {
        console.error('Error saving state:', error);
      }
    };
    
    saveState();
  }, [
    filters,
    activeImageIndex,
    viewMode,
    isDarkMode,
    gridScale,
    hoverPreviewEnabled,
    movieModeKeywords,
    movieModeInfinite,
    apiKey,
    cacheDirectory,
  ]);

  // Apply dark mode on mount
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

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

  // Handle keywords search with abort controller
  useEffect(() => {
    // Cancel previous request if keywords changed
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    return () => {
      // Clean up on unmount
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [filters.keywords]);

  const { data, error, fetchNextPage, hasNextPage, isFetchingNextPage, status, refetch } = useInfiniteQuery({
    queryKey: ['wallpapers', filters],
    queryFn: ({ pageParam, signal }) => fetchWallpapers({ pageParam, signal: signal || abortControllerRef.current?.signal, filters }),
    getNextPageParam: (lastPage) =>
      lastPage.meta.current_page < lastPage.meta.last_page ? lastPage.meta.current_page + 1 : undefined,
    initialPageParam: 1,
    retry: (failureCount, err: any) => (err?.name === 'AbortError' ? false : failureCount < 2),
    refetchOnWindowFocus: false,
  });

  // Reset active image when filters change
  useEffect(() => {
    setActiveImageIndex(null);
    setIsSlideshowActive(false);
  }, [filters]);

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage, isFetchingNextPage]);

  const allWallpapers = data?.pages.flatMap((page) => page.data) ?? [];

  // Navigation handlers
  const handleNextImage = useCallback(() => {
    if (activeImageIndex !== null && activeImageIndex < allWallpapers.length - 1) {
      setActiveImageIndex(activeImageIndex + 1);
    }
  }, [activeImageIndex, allWallpapers.length]);

  const handlePrevImage = useCallback(() => {
    if (activeImageIndex !== null && activeImageIndex > 0) {
      setActiveImageIndex(activeImageIndex - 1);
    }
  }, [activeImageIndex]);

  // Slideshow handlers
  const startSlideshow = useCallback(() => {
    if (activeImageIndex === null) return;
    setIsSlideshowActive(true);
    setIsSlideshowPlaying(true);
  }, [activeImageIndex]);

  const stopSlideshow = useCallback(() => {
    setIsSlideshowActive(false);
    setIsSlideshowPlaying(false);
    if (slideshowIntervalRef.current) {
      clearInterval(slideshowIntervalRef.current);
      slideshowIntervalRef.current = null;
    }
  }, []);

  const toggleSlideshowPlay = useCallback(() => {
    setIsSlideshowPlaying((prev) => !prev);
  }, []);

  // Slideshow auto-advance
  useEffect(() => {
    if (isSlideshowActive && isSlideshowPlaying) {
      slideshowIntervalRef.current = window.setInterval(() => {
        setActiveImageIndex((prev) => {
          if (prev === null) return 0;
          return prev < allWallpapers.length - 1 ? prev + 1 : 0;
        });
      }, 3000); // Change image every 3 seconds
    } else {
      if (slideshowIntervalRef.current) {
        clearInterval(slideshowIntervalRef.current);
        slideshowIntervalRef.current = null;
      }
    }

    return () => {
      if (slideshowIntervalRef.current) {
        clearInterval(slideshowIntervalRef.current);
        slideshowIntervalRef.current = null;
      }
    };
  }, [isSlideshowActive, isSlideshowPlaying, allWallpapers.length]);

  const handleSlideshowNext = useCallback(() => {
    setActiveImageIndex((prev) => {
      if (prev === null) return 0;
      return prev < allWallpapers.length - 1 ? prev + 1 : 0;
    });
  }, [allWallpapers.length]);

  const handleSlideshowPrev = useCallback(() => {
    setActiveImageIndex((prev) => {
      if (prev === null) return 0;
      return prev > 0 ? prev - 1 : allWallpapers.length - 1;
    });
  }, [allWallpapers.length]);

  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleGridScaleChange = (scale: number) => {
    setGridScale(scale);
  };

  const handleHoverPreviewToggle = () => {
    setHoverPreviewEnabled(!hoverPreviewEnabled);
  };

  const handleMovieModeToggle = () => {
    setMovieModeActive(!movieModeActive);
  };

  const handleMovieModeKeywordChange = (position: keyof typeof movieModeKeywords, value: string) => {
    setMovieModeKeywords(prev => ({ ...prev, [position]: value }));
  };

  // Batch download handler with Electron APIs
  const handleBatchDownload = useCallback(async (count: number) => {
    const downloadService = DownloadService.getInstance();
    
    // Select download directory
    const dir = await downloadService.selectDownloadDirectory();
    if (!dir) return;
    
    // Select the first 'count' wallpapers for download
    const wallpapersToDownload = allWallpapers.slice(0, count);
    
    // Create download items
    const newDownloads: DownloadItem[] = wallpapersToDownload.map(wallpaper => ({
      id: `download-${Date.now()}-${wallpaper.id}`,
      wallpaper,
      status: 'pending' as const,
      progress: 0,
    }));
    
    // Add to downloads list
    setDownloads(prev => [...prev, ...newDownloads]);
    
    toast.success(`Started downloading ${count} images to ${dir}`);
    
    // Start downloads
    newDownloads.forEach(async (download, index) => {
      try {
        // Update status to downloading
        setDownloads(prev => 
          prev.map(d => 
            d.id === download.id 
              ? { ...d, status: 'downloading' as const, progress: 0 }
              : d
          )
        );
        
        const fileName = `${download.wallpaper.id}.${download.wallpaper.file_type || 'jpg'}`;
        const filePath = `${dir}/${fileName}`;
        
        // Download file with progress tracking
        await downloadService.downloadFile(
          download.wallpaper.path, 
          filePath,
          (progress) => {
            setDownloads(prev => 
              prev.map(d => 
                d.id === download.id 
                  ? { ...d, progress }
                  : d
              )
            );
          }
        );
        
        // Update status to completed
        setDownloads(prev => 
          prev.map(d => 
            d.id === download.id 
              ? { ...d, status: 'completed' as const, progress: 100, filePath }
              : d
          )
        );
        
        toast.success(`Downloaded: ${fileName}`);
      } catch (error) {
        console.error('Download error:', error);
        // Update status to error
        setDownloads(prev => 
          prev.map(d => 
            d.id === download.id 
              ? { ...d, status: 'error' as const, error: 'Download failed' }
              : d
          )
        );
        toast.error(`Failed to download: ${download.wallpaper.id}`);
      }
    });
  }, [allWallpapers]);

  const handleClearCompletedDownloads = useCallback(() => {
    setDownloads(prev => prev.filter(d => d.status !== 'completed'));
  }, []);

  return (
    <div className={`h-screen w-screen flex flex-col ${isDarkMode ? 'dark' : ''} bg-white dark:bg-gray-950`}>
      <CompactHeader
        title="Wallhaven Explorer"
        onRefresh={() => refetch()}
        onViewModeChange={setViewMode}
        viewMode={viewMode}
        onThemeToggle={handleThemeToggle}
        isDarkMode={isDarkMode}
        activeImageIndex={activeImageIndex}
        onStartSlideshow={startSlideshow}
        filterPanelOpen={filterPanelOpen}
        setFilterPanelOpen={setFilterPanelOpen}
        filters={filters}
        setFilters={setFilters}
        gridScale={gridScale}
        onGridScaleChange={handleGridScaleChange}
        hoverPreviewEnabled={hoverPreviewEnabled}
        onHoverPreviewToggle={handleHoverPreviewToggle}
        apiKeyManagerOpen={apiKeyManagerOpen}
        setApiKeyManagerOpen={setApiKeyManagerOpen}
        apiKey={apiKey}
        setApiKey={setApiKey}
        cacheManagerOpen={cacheManagerOpen}
        setCacheManagerOpen={setCacheManagerOpen}
        cacheDirectory={cacheDirectory}
        setCacheDirectory={setCacheDirectory}
        onMovieModeToggle={handleMovieModeToggle}
        downloadManagerOpen={downloadManagerOpen}
        setDownloadManagerOpen={setDownloadManagerOpen}
        downloads={downloads}
        onClearCompletedDownloads={handleClearCompletedDownloads}
        onBatchDownload={handleBatchDownload}
      />

      <main id="scroll-container" className="flex-1 overflow-y-auto" style={{ height: 'calc(100vh - 48px)' }}>
        <div className="w-full flex flex-col p-5">
          {/* Active filters display */}
          <div className="mb-2 flex flex-wrap gap-1">
            {filters.keywords && (
              <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs rounded-full">
                Keywords: {filters.keywords}
              </span>
            )}
            {Object.entries(filters.categories).filter(([_, v]) => v).map(([key]) => (
              <span key={key} className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full capitalize">
                {key}
              </span>
            ))}
            {Object.entries(filters.purity).filter(([_, v]) => v).map(([key]) => (
              <span key={key} className={`px-2 py-0.5 text-xs rounded-full capitalize ${
                key === 'sfw' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                key === 'sketchy' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
                'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
              }`}>
                {key}
              </span>
            ))}
          </div>

          {status === 'pending' ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : status === 'error' ? (
            <div className="text-center text-red-500 py-8">Error: {(error as any)?.message ?? 'Unknown error'}</div>
          ) : (
            <>
              {viewMode === 'grid' ? (
                <MasonryGrid
                  wallpapers={allWallpapers}
                  onImageClick={setActiveImageIndex}
                  gridScale={gridScale}
                  onHover={setHoveredWallpaper}
                  hoverPreviewEnabled={hoverPreviewEnabled}
                />
              ) : (
                <InfiniteScroll
                  dataLength={allWallpapers.length}
                  next={fetchNextPage}
                  hasMore={!!hasNextPage}
                  loader={
                    <div className="flex justify-center items-center h-32">
                      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  }
                  scrollableTarget="scroll-container"
                  endMessage={
                    <p className="text-center text-gray-500 dark:text-gray-400 my-4 py-2 text-sm">
                      🎉 You've seen all the amazing wallpapers!
                    </p>
                  }
                >
                  <div className="space-y-4">
                    {allWallpapers.map((wallpaper, index) => (
                      <div
                        key={`${wallpaper.id}-${index}`}
                        className="flex gap-4 p-3 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => setActiveImageIndex(index)}
                      >
                        <div className="flex-shrink-0 w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
                          <ImageWithCache
                            src={wallpaper.thumbs?.small || wallpaper.path}
                            alt={wallpaper.id}
                            className="w-full h-full"
                            objectFit="cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            {wallpaper.id}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {wallpaper.resolution} • {wallpaper.category} • {wallpaper.purity}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <Heart size={14} />
                              {wallpaper.favorites}
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye size={14} />
                              {wallpaper.views}
                            </span>
                            <span>
                              {(wallpaper.file_size / 1024 / 1024).toFixed(2)} MB
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </InfiniteScroll>
              )}

              {/* Infinite scroll trigger for fallback */}
              <div ref={ref} className="h-1" />
            </>
          )}
        </div>
      </main>

      {/* Hover Preview */}
      {hoverPreviewEnabled && hoveredWallpaper && (
        <HoverPreview
          wallpaper={hoveredWallpaper}
          enabled={hoverPreviewEnabled}
          mousePosition={mousePosition}
        />
      )}

      {/* Image Modal */}
      {activeImageIndex !== null && !isSlideshowActive && !movieModeActive && (
        <ImmersiveImageModal
          wallpaper={allWallpapers[activeImageIndex]}
          onClose={() => setActiveImageIndex(null)}
          onPrev={handlePrevImage}
          onNext={handleNextImage}
          onStartSlideshow={startSlideshow}
          hasPrev={activeImageIndex > 0}
          hasNext={activeImageIndex < allWallpapers.length - 1}
          currentIndex={activeImageIndex}
          totalCount={allWallpapers.length}
        />
      )}

      {/* Slideshow Modal */}
      {isSlideshowActive && activeImageIndex !== null && (
        <ImmersiveSlideshow
          wallpapers={allWallpapers}
          initialIndex={activeImageIndex}
          onClose={stopSlideshow}
          isPlaying={isSlideshowPlaying}
          onTogglePlay={toggleSlideshowPlay}
          onNext={handleSlideshowNext}
          onPrev={handleSlideshowPrev}
          currentIndex={activeImageIndex}
        />
      )}

      {/* Movie Mode Modal */}
      {movieModeActive && (
        <MovieMode
          wallpapers={allWallpapers}
          onClose={() => setMovieModeActive(false)}
          keywords={movieModeKeywords}
          infiniteMode={movieModeInfinite}
          onKeywordChange={handleMovieModeKeywordChange}
        />
      )}
    </div>
  );
}

// --- TanStack Router and Query Client Setup ---
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

export const Route = createFileRoute('/wallheaven')({
  errorComponent: ({ error }) => (
    <div className="p-6 text-red-500">
      Oops! {(error as any)?.message ? String((error as any).message) : String(error)}
    </div>
  ),
  component: () => (
    <QueryClientProvider client={queryClient}>
      <RouteComponent />
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </QueryClientProvider>
  ),
});