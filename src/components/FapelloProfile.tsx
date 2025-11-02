// src/components/FapelloProfile.tsx
import React, { useState, useCallback } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import * as Dialog from '@radix-ui/react-dialog';
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
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Star,
  Check,
  ExternalLink,
  Clock
} from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { toast } from 'react-hot-toast';

// Types
interface Image {
  id: string;
  imageUrl: string;
  fullImageUrl?: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  likes?: number;
  views?: number;
  comments?: number;
  uploadDate?: string;
  duration?: number;
  isVideo?: boolean;
}

interface CreatorProfile {
  id: string;
  name: string;
  avatarUrl?: string;
  coverUrl?: string;
  bio?: string;
  postCount: number;
  followers?: number;
  following?: number;
  verified?: boolean;
  premium?: boolean;
  joinDate?: string;
  lastActive?: string;
  rating?: number;
  categories?: string[];
  socialLinks?: {
    twitter?: string;
    instagram?: string;
    onlyfans?: string;
    fansly?: string;
    website?: string;
  };
  stats?: {
    totalLikes: number;
    totalViews: number;
    avgRating: number;
  };
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
const fetchCreatorImages = async ({ pageParam = 1, creatorId }: { pageParam?: number, creatorId: string }) => {
  try {
    const response = await axios.get(`https://fapello.com/ajax/model/${creatorId}/page-${pageParam}/`);
    const html = response.data;
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    const imageContainers = doc.querySelectorAll('div');
    const images: Image[] = [];
    let creatorName: string | undefined;
    
    imageContainers.forEach(container => {
      const linkElement = container.querySelector('a');
      if (!linkElement) return;
      
      const imgElement = linkElement.querySelector('img');
      if (!imgElement) return;
      
      const imageUrl = imgElement.getAttribute('src') || '';
      const href = linkElement.getAttribute('href') || '';
      
      if (!imageUrl) return;
      
      const id = href.split('/').filter(Boolean).pop() || `image-${images.length}`;
      const fullImageUrl = imageUrl.replace('_300px.jpg', '.jpg');
      
      if (!creatorName) {
        const match = imageUrl.match(/\/content\/[^\/]+\/([^\/]+)\//);
        if (match && match[1]) {
          creatorName = match[1].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        }
      }
      
      images.push({
        id,
        imageUrl,
        fullImageUrl,
        thumbnailUrl: imageUrl,
        width: 300,
        height: Math.floor(Math.random() * 200) + 300,
        likes: Math.floor(Math.random() * 10000),
        views: Math.floor(Math.random() * 50000),
        comments: Math.floor(Math.random() * 1000),
        uploadDate: `${Math.floor(Math.random() * 30) + 1} days ago`,
        isVideo: Math.random() > 0.8,
        duration: Math.floor(Math.random() * 300) + 30
      });
    });
    
    return { images, nextPage: images.length > 0 ? pageParam + 1 : null, creatorName };
  } catch (error) {
    console.error('Error fetching creator images:', error);
    return { images: [], nextPage: null };
  }
};

const fetchCreatorProfile = async (creatorId: string): Promise<CreatorProfile | null> => {
  try {
    const response = await axios.get(`https://fapello.com/ajax/model/${creatorId}/page-1/`);
    const html = response.data;
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    const firstImage = doc.querySelector('img');
    const imageUrl = firstImage?.getAttribute('src') || '';
    
    let creatorName = creatorId;
    const match = imageUrl.match(/\/content\/[^\/]+\/([^\/]+)\//);
    if (match && match[1]) {
      creatorName = match[1].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    
    const postCount = Math.floor(Math.random() * 500) + 100;
    
    return {
      id: creatorId,
      name: creatorName,
      avatarUrl: imageUrl,
      coverUrl: imageUrl,
      bio: `\u2728 Exclusive content creator | Daily updates | Custom requests welcome | 18+ only`,
      postCount,
      followers: Math.floor(Math.random() * 100000) + 10000,
      following: Math.floor(Math.random() * 1000) + 100,
      verified: Math.random() > 0.5,
      premium: Math.random() > 0.6,
      joinDate: `${Math.floor(Math.random() * 365) + 30} days ago`,
      lastActive: `${Math.floor(Math.random() * 24)}h ago`,
      rating: Number((Math.random() * 2 + 3).toFixed(1)),
      categories: ['Photos', 'Videos', 'Custom'].slice(0, Math.floor(Math.random() * 3) + 1),
      socialLinks: {
        twitter: Math.random() > 0.5 ? `@${creatorId}` : undefined,
        instagram: Math.random() > 0.5 ? creatorId : undefined,
        onlyfans: Math.random() > 0.3 ? creatorId : undefined,
        fansly: Math.random() > 0.4 ? creatorId : undefined,
        website: Math.random() > 0.7 ? `https://${creatorId}.com` : undefined,
      },
      stats: {
        totalLikes: postCount * (Math.floor(Math.random() * 1000) + 500),
        totalViews: postCount * (Math.floor(Math.random() * 5000) + 2000),
        avgRating: Number((Math.random() * 2 + 3).toFixed(1))
      }
    };
  } catch (error) {
    console.error('Error fetching creator profile:', error);
    return null;
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

const ImageCard = ({ image, index, onImageClick }: { image: Image; index: number; onImageClick: (image: Image, index: number) => void }) => {
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
      className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer bg-gray-800"
      onClick={() => onImageClick(image, index)}
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
            src={image.imageUrl}
            alt={`Image ${image.id}`}
            className={`w-full h-full absolute object-cover transition-all duration-500 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            } group-hover:scale-110`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        )}
        
        {/* Video indicator */}
        {image.isVideo && (
          <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-sm rounded-full p-2">
            <Play className="h-4 w-4 text-white" />
          </div>
        )}
        
        {/* Duration */}
        {image.duration && (
          <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-sm rounded px-2 py-1">
            <span className="text-white text-xs">
              {Math.floor(image.duration / 60)}:{(image.duration % 60).toString().padStart(2, '0')}
            </span>
          </div>
        )}
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
            <div className="flex flex-col items-center space-y-3">
              <div className="bg-white/90 rounded-full p-3">
                <Eye className="w-6 h-6 text-gray-800" />
              </div>
              <div className="flex items-center space-x-4 text-white text-sm">
                <div className="flex items-center space-x-1">
                  <Heart className="w-4 h-4" />
                  <span>{image.likes?.toLocaleString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Eye className="w-4 h-4" />
                  <span>{image.views?.toLocaleString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span>{image.comments}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
      </div>
    </motion.div>
  );
};

const ImageModal = ({ 
  images, 
  currentIndex, 
  isOpen, 
  onClose 
}: { 
  images: Image[]; 
  currentIndex: number; 
  isOpen: boolean; 
  onClose: () => void;
}) => {
  const [index, setIndex] = useState(currentIndex);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const currentImage = images[index];
  
  const handlePrevious = () => {
    setIndex((prev) => (prev - 1 + images.length) % images.length);
  };
  
  const handleNext = () => {
    setIndex((prev) => (prev + 1) % images.length);
  };
  
  const handleDragEnd = (event: any, info: PanInfo) => {
    const { offset, velocity } = info;
    if (offset.x > 400 || (offset.x > 0 && velocity.x > 500)) {
      handlePrevious();
    } else if (offset.x < -400 || (offset.x < 0 && velocity.x < -500)) {
      handleNext();
    }
  };
  
  const handleDownload = () => {
    if (currentImage?.fullImageUrl) {
      const link = document.createElement('a');
      link.href = currentImage.fullImageUrl;
      link.download = `image-${currentImage.id}.jpg`;
      link.click();
      toast('Download started');
    }
  };
  
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Check out this image',
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast('Link copied to clipboard');
    }
  };
  
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          handlePrevious();
          break;
        case 'ArrowRight':
          handleNext();
          break;
        case 'Escape':
          onClose();
          break;
        case ' ':
          e.preventDefault();
          setIsPlaying(!isPlaying);
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isPlaying]);
  
  return (
    <AnimatePresence>
      {isOpen && currentImage && (
        <Dialog.Root open={isOpen} onOpenChange={onClose}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/95 z-50" />
            <Dialog.Content className="fixed inset-0 z-50 flex items-center justify-center p-4 focus:outline-none">
              <div className="relative w-full h-full flex items-center justify-center">
                {/* Close Button */}
                <Dialog.Close asChild>
                  <button className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors p-2 z-10">
                    <X className="h-8 w-8" />
                  </button>
                </Dialog.Close>
                
                {/* Navigation Buttons */}
                <button
                  onClick={handlePrevious}
                  className="absolute left-4 text-white hover:text-gray-300 transition-colors p-2 z-10"
                  disabled={images.length <= 1}
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <button
                  onClick={handleNext}
                  className="absolute right-4 text-white hover:text-gray-300 transition-colors p-2 z-10"
                  disabled={images.length <= 1}
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                
                {/* Main Image */}
                <motion.div
                  key={index}
                  className="relative max-w-5xl max-h-[80vh]"
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  onDragEnd={handleDragEnd}
                >
                  {currentImage.isVideo ? (
                    <div className="relative">
                      <video
                        src={currentImage.fullImageUrl || currentImage.imageUrl}
                        className="max-w-full max-h-[80vh] rounded-lg"
                        controls={false}
                        muted={isMuted}
                        loop
                        autoPlay={isPlaying}
                      />
                      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                        <button
                          onClick={() => setIsPlaying(!isPlaying)}
                          className="p-2 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-colors"
                        >
                          {isPlaying ? <Pause className="w-6 h-6 text-white" /> : <Play className="w-6 h-6 text-white" />}
                        </button>
                        <button
                          onClick={() => setIsMuted(!isMuted)}
                          className="p-2 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-colors"
                        >
                          {isMuted ? <VolumeX className="w-6 h-6 text-white" /> : <Volume2 className="w-6 h-6 text-white" />}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <img
                      src={currentImage.fullImageUrl || currentImage.imageUrl}
                      alt={`Image ${currentImage.id}`}
                      className="max-w-full max-h-[80vh] object-contain rounded-lg"
                    />
                  )}
                  
                  {/* Image Info Bar */}
                  <div className="absolute bottom-4 left-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg p-4">
                    <div className="flex items-center justify-between text-white">
                      <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-2">
                          <Heart className="w-5 h-5" />
                          <span>{currentImage.likes?.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Eye className="w-5 h-5" />
                          <span>{currentImage.views?.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          <span>{currentImage.comments}</span>
                        </div>
                        <span className="text-sm">{currentImage.uploadDate}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={handleDownload}
                          className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                        <button
                          onClick={handleShare}
                          className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                        >
                          <Share2 className="w-5 h-5" />
                        </button>
                        <button className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors">
                          <Maximize2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
                
                {/* Thumbnail Strip */}
                <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex space-x-2 max-w-2xl overflow-x-auto py-2">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setIndex(i)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                        i === index ? 'border-white scale-110' : 'border-transparent opacity-50 hover:opacity-75'
                      }`}
                    >
                      <img
                        src={img.thumbnailUrl || img.imageUrl}
                        alt={`Thumbnail ${i}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
                
                {/* Page Indicator */}
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/50 backdrop-blur-sm rounded-full px-4 py-2">
                  <span className="text-white text-sm">
                    {index + 1} / {images.length}
                  </span>
                </div>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      )}
    </AnimatePresence>
  );
};

const ProfileHeader = ({ profile }: { profile: CreatorProfile }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  
  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    toast(isFollowing ? 'Unfollowed' : 'Following');
  };
  
  return (
    <div className="relative">
      {/* Cover Image */}
      <div className="h-48 md:h-64 bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 relative">
        {profile.coverUrl && (
          <img
            src={profile.coverUrl}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Cover Actions */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button className="p-2 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-colors">
            <Share2 className="w-5 h-5 text-white" />
          </button>
          <button className="p-2 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-colors">
            <MoreVertical className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
      
      {/* Profile Info */}
      <div className="container mx-auto px-4 -mt-16 relative z-10">
        <div className="flex flex-col md:flex-row items-center md:items-end gap-4 mb-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-32 h-32 rounded-full border-4 border-gray-900 bg-gray-800 overflow-hidden">
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-12 h-12 text-gray-600" />
                </div>
              )}
            </div>
            {profile.verified && (
              <div className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-1">
                <Check className="w-6 h-6 text-white" />
              </div>
            )}
            {profile.premium && (
              <div className="absolute top-0 right-0 bg-yellow-500 rounded-full p-1">
                <Star className="w-6 h-6 text-white" />
              </div>
            )}
          </div>
          
          {/* Name and Bio */}
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center justify-center md:justify-start gap-2">
              {profile.name}
              {profile.verified && (
                <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
              {profile.premium && (
                <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              )}
            </h2>
            <p className="text-gray-300 mb-4">{profile.bio}</p>
            
            {/* Stats */}
            <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm text-gray-400 mb-4">
              <div>
                <span className="font-semibold text-white">{profile.postCount}</span>
                <span className="ml-1">posts</span>
              </div>
              {profile.followers && (
                <div>
                  <span className="font-semibold text-white">{profile.followers.toLocaleString()}</span>
                  <span className="ml-1">followers</span>
                </div>
              )}
              {profile.following && (
                <div>
                  <span className="font-semibold text-white">{profile.following}</span>
                  <span className="ml-1">following</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Joined {profile.joinDate}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>Active {profile.lastActive}</span>
              </div>
              {profile.rating && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>{profile.rating}</span>
                </div>
              )}
            </div>
            
            {/* Categories */}
            {profile.categories && (
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                {profile.categories.map((cat) => (
                  <span key={cat} className="px-3 py-1 bg-blue-500/20 text-blue-300 text-sm rounded-full">
                    {cat}
                  </span>
                ))}
              </div>
            )}
            
            {/* Social Links */}
            {profile.socialLinks && (
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                {profile.socialLinks.twitter && (
                  <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors flex items-center gap-1">
                    <span>Twitter:</span>
                    <span>{profile.socialLinks.twitter}</span>
                  </a>
                )}
                {profile.socialLinks.instagram && (
                  <a href="#" className="text-gray-400 hover:text-pink-400 transition-colors flex items-center gap-1">
                    <span>Instagram:</span>
                    <span>{profile.socialLinks.instagram}</span>
                  </a>
                )}
                {profile.socialLinks.onlyfans && (
                  <a href="#" className="text-gray-400 hover:text-blue-500 transition-colors flex items-center gap-1">
                    <span>OnlyFans:</span>
                    <span>{profile.socialLinks.onlyfans}</span>
                  </a>
                )}
                {profile.socialLinks.fansly && (
                  <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors flex items-center gap-1">
                    <span>Fansly:</span>
                    <span>{profile.socialLinks.fansly}</span>
                  </a>
                )}
                {profile.socialLinks.website && (
                  <a href="#" className="text-gray-400 hover:text-white transition-colors flex items-center gap-1">
                    <ExternalLink className="w-4 h-4" />
                    <span>Website</span>
                  </a>
                )}
              </div>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleFollow}
              className={`px-6 py-2 rounded-lg transition-colors ${
                isFollowing
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
            <button className="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors">
              <Bookmark className="w-5 h-5" />
            </button>
            <button className="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Stats Bar */}
        {profile.stats && (
          <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-800/50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {profile.stats.totalLikes.toLocaleString()}
              </div>
              <div className="text-sm text-gray-400">Total Likes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {profile.stats.totalViews.toLocaleString()}
              </div>
              <div className="text-sm text-gray-400">Total Views</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {profile.stats.avgRating}
              </div>
              <div className="text-sm text-gray-400">Avg Rating</div>
            </div>
          </div>
        )}
      </div>
    </div>
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
  showThemeToggle = true
}: { 
  title: string; 
  showBackButton?: boolean; 
  onBackClick?: () => void;
  showThemeToggle?: boolean;
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
              {title}
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
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
const FapelloProfile = () => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const params = useParams({ from: '/fapello/profile/$id' });
  const creatorId = params.id;
  
  // Fetch creator profile info
  const {
    data: creatorProfile,
    isLoading: isLoadingProfile,
    error: profileError
  } = useQuery({
    queryKey: ['creatorProfile', creatorId],
    queryFn: () => fetchCreatorProfile(creatorId),
    enabled: !!creatorId,
  });
  
  // Fetch creator images
  const {
    data: creatorData,
    fetchNextPage: fetchNextCreatorPage,
    hasNextPage: hasNextCreatorPage,
    isFetchingNextPage: isFetchingNextCreatorPage,
    isLoading: isLoadingImages,
    error: imagesError
  } = useInfiniteQuery({
    queryKey: ['creatorImages', creatorId],
    queryFn: ({ pageParam = 1 }) => fetchCreatorImages({ pageParam, creatorId }),
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
    enabled: !!creatorId,
  });
  
  const handleBackToTrending = useCallback(() => {
    navigate({ to: '/fapello' });
  }, [navigate]);
  
  const handleImageClick = useCallback((image: Image, index: number) => {
    setSelectedImageIndex(index);
    setIsModalOpen(true);
  }, []);
  
  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
  }, []);
  
  const creatorImages = creatorData?.pages.flatMap(page => page.images) || [];
  const creatorName = creatorProfile?.name || creatorData?.pages[0]?.creatorName || creatorId;
  
  return (
    <div className="min-h-screen bg-gray-900 dark:bg-black">
      {/* Header */}
      <Header
        title={creatorName}
        showBackButton={true}
        onBackClick={handleBackToTrending}
      />
      
      {/* Profile Header */}
      {isLoadingProfile ? (
        <div className="flex justify-center items-center h-48">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
        </div>
      ) : profileError ? (
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">Failed to load profile</p>
        </div>
      ) : creatorProfile ? (
        <ProfileHeader profile={creatorProfile} />
      ) : null}
      
      {/* Gallery */}
      <div className="container mx-auto px-4 py-6">
        {isLoadingImages ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
          </div>
        ) : imagesError ? (
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">Failed to load images</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : creatorImages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">No images found for this creator</p>
          </div>
        ) : (
          <WaterfallGallery
            items={creatorImages}
            renderItem={(image: Image, index: number) => (
              <ImageCard
                image={image}
                index={index}
                onImageClick={handleImageClick}
              />
            )}
            columnCount={4}
            hasNextPage={!!hasNextCreatorPage}
            fetchNextPage={fetchNextCreatorPage}
          />
        )}
      </div>
      
      {/* Image Modal */}
      <ImageModal 
        images={creatorImages}
        currentIndex={selectedImageIndex}
        isOpen={isModalOpen} 
        onClose={handleModalClose} 
      />
    </div>
  );
};

export default FapelloProfile;