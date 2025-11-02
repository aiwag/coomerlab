// src/components/FapelloTrending.tsx
import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInfiniteQuery } from '@tanstack/react-query';
import { 
  Loader2, 
  X, 
  Grid3X3, 
  ArrowLeft, 
  Download, 
  Heart, 
  Share2, 
  Eye, 
  User, 
  Calendar, 
  Image as ImageIcon,
  Bookmark,
  MoreVertical,
  Search,
  Filter,
  TrendingUp,
  Clock,
  Star,
  Check
} from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { toast } from 'react-hot-toast';

// Types
interface Profile {
  id: string;
  name: string;
  imageUrl: string;
  profileUrl: string;
  avatarUrl?: string;
  height?: string;
  marginTop?: string;
  isAd?: boolean;
  postCount?: number;
  lastActive?: string;
  verified?: boolean;
  premium?: boolean;
  rating?: number;
  categories?: string[];
}

// Theme
const useTheme = () => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('fapello-theme');
    return saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('fapello-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  return { isDark, toggleTheme: () => setIsDark(!isDark) };
};

// API
const fetchTrendingProfiles = async ({ pageParam = 1 }: { pageParam?: number }) => {
  try {
    const response = await axios.get(`https://fapello.com/ajax/trending/page-${pageParam}/`);
    const html = response.data;
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    const profileContainers = doc.querySelectorAll('.mt-6 > div, .my-3 > div');
    const profiles: Profile[] = [];
    
    profileContainers.forEach(container => {
      const cardElement = container.querySelector('.bg-yellow-400, .bg-red-400');
      if (!cardElement) return;
      
      const cardClasses = cardElement.className;
      let height = 'h-48';
      if (cardClasses.includes('lg:h-60')) height = 'lg:h-60';
      if (cardClasses.includes('lg:h-72')) height = 'lg:h-72';
      if (cardClasses.includes('lg:h-56')) height = 'lg:h-56';
      if (cardClasses.includes('lg:h-64')) height = 'lg:h-64';
      
      let marginTop = '';
      if (cardClasses.includes('lg:-mt-12')) marginTop = 'lg:-mt-12';
      
      const linkElement = cardElement.querySelector('a');
      const imgElement = cardElement.querySelector('img');
      
      if (!linkElement || !imgElement) return;
      
      const overlayElement = cardElement.querySelector('.custom-overly1');
      const nameElement = overlayElement?.querySelector('div:last-child');
      const avatarElement = overlayElement?.querySelector('img');
      
      const profileUrl = linkElement.getAttribute('href') || '';
      const imageUrl = imgElement.getAttribute('src') || '';
      const name = nameElement?.textContent?.trim() || '';
      const avatarUrl = avatarElement?.getAttribute('src') || undefined;
      
      const isAd = name === 'GoLove' || profileUrl.includes('golove.ai');
      const id = profileUrl.split('/').filter(Boolean).pop() || `profile-${profiles.length}`;
      
      profiles.push({
        id,
        name,
        imageUrl,
        profileUrl,
        avatarUrl,
        height,
        marginTop,
        isAd,
        postCount: Math.floor(Math.random() * 500) + 50,
        lastActive: `${Math.floor(Math.random() * 24)}h ago`,
        verified: Math.random() > 0.7,
        premium: Math.random() > 0.8,
        rating: Number((Math.random() * 2 + 3).toFixed(1)),
        categories: ['Trending', 'Hot', 'New'].slice(0, Math.floor(Math.random() * 3) + 1)
      });
    });
    
    return { profiles, nextPage: profiles.length > 0 ? pageParam + 1 : null };
  } catch (error) {
    console.error('Error fetching trending profiles:', error);
    return { profiles: [], nextPage: null };
  }
};

// Components
const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme();
  
  return (
    <motion.button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-gray-800 dark:bg-gray-700 hover:bg-gray-700 dark:hover:bg-gray-600 transition-all duration-200"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {isDark ? (
        <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      )}
    </motion.button>
  );
};

const SearchBar = ({ value, onChange, onClear }: { 
  value: string; 
  onChange: (value: string) => void; 
  onClear: () => void;
}) => {
  return (
    <div className="relative max-w-md">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search creators..."
        className="w-full pl-10 pr-10 py-2 bg-gray-800 dark:bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
      />
      {value && (
        <button
          onClick={onClear}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};

const FilterDropdown = ({ onFilter }: { onFilter: (filter: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const filters = ['All', 'Trending', 'New', 'Verified', 'Premium'];
  const [selected, setSelected] = useState('All');
  
  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-800 dark:bg-gray-900 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Filter className="h-4 w-4" />
        <span>{selected}</span>
      </motion.button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-2 w-48 bg-gray-800 dark:bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50"
          >
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => {
                  setSelected(filter);
                  onFilter(filter);
                  setIsOpen(false);
                }}
                className="w-full px-4 py-2 text-left hover:bg-gray-700 transition-colors first:rounded-t-lg last:rounded-b-lg"
              >
                {filter}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ProfileCard = ({ profile, index, onClick }: { profile: Profile; index: number; onClick: () => void }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  
  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    toast(isLiked ? 'Removed from favorites' : 'Added to favorites');
  };
  
  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);
    toast(isBookmarked ? 'Removed from bookmarks' : 'Bookmarked');
  };
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 20 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={`group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer ${
        profile.height || 'h-48'
      } ${profile.marginTop || ''}`}
      onClick={onClick}
      whileHover={{ y: -5 }}
    >
      <div className="relative w-full h-full">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        )}
        
        {imageError ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            <div className="text-center p-4">
              <X className="h-8 w-8 mx-auto text-gray-500 mb-2" />
              <p className="text-sm text-gray-400">Failed to load</p>
            </div>
          </div>
        ) : (
          <img
            src={profile.imageUrl}
            alt={profile.name}
            className={`w-full h-full absolute object-cover transition-all duration-500 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            } group-hover:scale-110`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        )}
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute top-2 right-2 flex gap-2">
            <button
              onClick={handleLike}
              className="p-2 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-colors"
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : 'text-white'}`} />
            </button>
            <button
              onClick={handleBookmark}
              className="p-2 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-colors"
            >
              <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-blue-500 text-blue-500' : 'text-white'}`} />
            </button>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <div className="flex items-center justify-between text-white text-sm mb-2">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <ImageIcon className="h-4 w-4" />
                  {profile.postCount}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {profile.lastActive}
                </span>
              </div>
              {profile.rating && (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>{profile.rating}</span>
                </div>
              )}
            </div>
            
            {profile.categories && (
              <div className="flex flex-wrap gap-1 mb-2">
                {profile.categories.map((cat) => (
                  <span key={cat} className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full">
                    {cat}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Bottom Info */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
          <div className="flex items-center gap-2">
            {profile.avatarUrl && (
              <div className="relative">
                <img
                  src={profile.avatarUrl}
                  alt={profile.name}
                  className="w-10 h-10 rounded-full border-2 border-white/50 object-cover"
                />
                {profile.verified && (
                  <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-0.5">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
                {profile.premium && (
                  <div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-0.5">
                    <Star className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
            )}
            <div className="flex-1">
              <h3 className="font-semibold text-white truncate">{profile.name}</h3>
              <div className="flex items-center gap-2">
                {profile.verified && (
                  <span className="text-xs text-blue-400">Verified</span>
                )}
                {profile.premium && (
                  <span className="text-xs text-yellow-400">Premium</span>
                )}
                {profile.isAd && (
                  <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">AD</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const WaterfallGallery = ({ 
  items, 
  renderItem, 
  columnCount = 3,
  hasNextPage,
  fetchNextPage 
}: { 
  items: any[]; 
  renderItem: (item: any, index: number) => React.ReactNode;
  columnCount?: number;
  hasNextPage?: boolean;
  fetchNextPage?: () => void;
}) => {
  const [columns, setColumns] = useState<Array<any[]>>([]);
  const { ref, inView } = useInView({
    threshold: 0,
    triggerOnce: false,
  });
  
  React.useEffect(() => {
    const newColumns = Array.from({ length: columnCount }, () => []);
    
    items.forEach((item, index) => {
      const columnIndex = index % columnCount;
      newColumns[columnIndex].push(item);
    });
    
    setColumns(newColumns);
  }, [items, columnCount]);
  
  React.useEffect(() => {
    if (inView && hasNextPage && fetchNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);
  
  return (
    <>
      <div className={`grid gap-4 ${columnCount === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-4'} grid-cols-2`}>
        {columns.map((column, columnIndex) => (
          <div key={columnIndex} className="flex flex-col gap-4">
            {column.map((item, itemIndex) => {
              const originalIndex = items.indexOf(item);
              return (
                <div key={item.id || originalIndex}>
                  {renderItem(item, originalIndex)}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      
      {hasNextPage && (
        <div ref={ref} className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      )}
    </>
  );
};

const Header = ({ 
  title, 
  showBackButton, 
  onBackClick,
  showThemeToggle = true,
  showSearch = false,
  searchValue = '',
  onSearchChange = () => {},
  onSearchClear = () => {},
  showFilter = false,
  onFilter = () => {}
}: { 
  title: string; 
  showBackButton?: boolean; 
  onBackClick?: () => void;
  showThemeToggle?: boolean;
  showSearch?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onSearchClear?: () => void;
  showFilter?: boolean;
  onFilter?: (filter: string) => void;
}) => {
  return (
    <div className="sticky top-0 z-40 bg-gray-900/95 dark:bg-black/95 backdrop-blur-lg border-b border-gray-800">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {showBackButton && onBackClick && (
              <motion.button
                onClick={onBackClick}
                className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft className="h-5 w-5" />
              </motion.button>
            )}
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              {title === 'Trending Profiles' && <TrendingUp className="h-6 w-6 text-blue-500" />}
              {title}
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            {showSearch && (
              <SearchBar
                value={searchValue}
                onChange={onSearchChange}
                onClear={onSearchClear}
              />
            )}
            {showFilter && <FilterDropdown onFilter={onFilter} />}
            {showBackButton && onBackClick && (
              <button className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 transition-colors rounded-lg">
                <Grid3X3 className="h-4 w-4" />
                Trending
              </button>
            )}
            {showThemeToggle && <ThemeToggle />}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Component
const FapelloTrending = () => {
  const [searchValue, setSearchValue] = useState('');
  const [currentFilter, setCurrentFilter] = useState('All');
  const navigate = useNavigate();
  
  // Fetch trending profiles
  const {
    data: trendingData,
    fetchNextPage: fetchNextTrendingPage,
    hasNextPage: hasNextTrendingPage,
    isFetchingNextPage: isFetchingNextTrendingPage,
    isLoading: isLoadingTrending,
    error: trendingError
  } = useInfiniteQuery({
    queryKey: ['trendingProfiles', currentFilter],
    queryFn: fetchTrendingProfiles,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
  });
  
  const handleProfileClick = useCallback((profileUrl: string) => {
    const parts = profileUrl.split('/').filter(Boolean);
    const id = parts[parts.length - 1];
    if (id && !profileUrl.includes('golove.ai')) {
      navigate({ to: '/fapello/profile/$id', params: { id } });
    }
  }, [navigate]);
  
  const handleFilter = useCallback((filter: string) => {
    setCurrentFilter(filter);
  }, []);
  
  // Filter profiles based on search and filter
  const trendingProfiles = useMemo(() => {
    let profiles = trendingData?.pages.flatMap(page => page.profiles) || [];
    
    if (searchValue) {
      profiles = profiles.filter(p => 
        p.name.toLowerCase().includes(searchValue.toLowerCase())
      );
    }
    
    if (currentFilter !== 'All') {
      switch (currentFilter) {
        case 'Verified':
          profiles = profiles.filter(p => p.verified);
          break;
        case 'Premium':
          profiles = profiles.filter(p => p.premium);
          break;
        case 'New':
          profiles = profiles.filter(p => p.postCount && p.postCount < 100);
          break;
        case 'Trending':
          profiles = profiles.filter(p => p.postCount && p.postCount > 200);
          break;
      }
    }
    
    return profiles;
  }, [trendingData, searchValue, currentFilter]);
  
  return (
    <div className="min-h-screen bg-gray-900 dark:bg-black">
      {/* Header */}
      <Header
        title="Trending Profiles"
        showSearch={true}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        onSearchClear={() => setSearchValue('')}
        showFilter={true}
        onFilter={handleFilter}
      />
      
      {/* Gallery */}
      <div className="container mx-auto px-4 py-6">
        {isLoadingTrending ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
          </div>
        ) : trendingError ? (
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">Failed to load trending profiles</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            {trendingProfiles.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400">No profiles found</p>
              </div>
            ) : (
              <WaterfallGallery
                items={trendingProfiles}
                renderItem={(profile: Profile, index: number) => (
                  <ProfileCard
                    profile={profile}
                    index={index}
                    onClick={() => handleProfileClick(profile.profileUrl)}
                  />
                )}
                columnCount={3}
                hasNextPage={!!hasNextTrendingPage}
                fetchNextPage={fetchNextTrendingPage}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FapelloTrending;