import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import axios from 'axios';
import { createStorage } from 'unstorage';
import indexedDbDriver from "unstorage/drivers/indexedb";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Loader2, RefreshCw, Search, ExternalLink, ImageOff, AlertCircle, Filter, X, Play, Pause, 
  ChevronLeft, ChevronRight, Heart, MessageCircle, Share2, Grid3x3, Bookmark, 
  MoreHorizontal, Send, Smile, ChevronDown, ArrowUp, Maximize2, Minimize2, Volume2, VolumeX,
  Settings, Download, ZoomIn, ZoomOut, RotateCw, Shuffle, SkipForward, SkipBack, Eye,
  ThumbsUp, ThumbsDown, Copy, Check, Info, Wifi, WifiOff, PauseCircle, PlayCircle
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from '@/components/ui/textarea';
import InfiniteScroll from 'react-infinite-scroll-component';
import {
  Slider
} from "@/components/ui/slider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { createFileRoute } from '@tanstack/react-router';

// Define the creator type based on the API schema
interface Creator {
  favorited: number;
  id: string;
  indexed: number;
  name: string;
  service: string;
  updated: number;
}

// Define the profile type
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

// Define the post type based on the API response
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

// Define the API response type for creators
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

// Service configurations
const COOMER_SERVICES = ['onlyfans', 'fansly', 'candfans'];
const KEMONO_SERVICES = ['patreon', 'fanbox', 'discord', 'fantia', 'afdian', 'boosty', 'dlsite', 'gumroad', 'subscribestar'];

const SERVICES = [
  { value: 'all', label: 'All Services' },
  { value: 'coomer', label: 'Coomer (All)' },
  ...COOMER_SERVICES.map(service => ({ value: service, label: service.charAt(0).toUpperCase() + service.slice(1) })),
  { value: 'kemono', label: 'Kemono (All)' },
  ...KEMONO_SERVICES.map(service => ({ value: service, label: service.charAt(0).toUpperCase() + service.slice(1) }))
];

// Initialize unstorage with IndexedDB driver
const storage = createStorage({
  driver: indexedDbDriver({ 
    base: 'creators:',
    dbName: 'creators-db',
    storeName: 'creators-store'
  })
});

// Cache keys
const CACHE_TIMESTAMP_KEY = 'creators:timestamp';
const CACHE_VERSION_KEY = 'creators:version';
const CACHE_VERSION = '1.0';
const CACHE_EXPIRY_MS = 12 * 60 * 60 * 1000; // 12 hours

// API settings
const COOMER_API_BASE_URL = 'https://kemono-api.mbaharip.com/coomer';
const KEMONO_API_BASE_URL = 'https://kemono-api.mbaharip.com/kemono';
const COOMER_POSTS_API_BASE_URL = 'https://coomer.st/api/v1';
const KEMONO_POSTS_API_BASE_URL = 'https://kemono.su/api/v1';
const ITEMS_PER_PAGE = 30;
const POSTS_PER_PAGE = 20;

// Scroll to Top Button Component
const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      const scrollElement = document.getElementById('main-scroll-container');
      if (scrollElement && scrollElement.scrollTop > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    const scrollElement = document.getElementById('main-scroll-container');
    scrollElement?.addEventListener('scroll', toggleVisibility);

    return () => scrollElement?.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    const scrollElement = document.getElementById('main-scroll-container');
    scrollElement?.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-8 right-8 z-40 p-3 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition-all duration-300 ${
        isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-16 pointer-events-none'
      }`}
    >
      <ArrowUp size={24} />
    </button>
  );
};

// Enhanced Media Viewer Component
const MediaViewer = ({ 
  media, 
  currentIndex, 
  onIndexChange, 
  isPlaying, 
  onPlayChange,
  isFullscreen,
  onFullscreenChange,
  showControls,
  onControlsChange,
  autoplaySpeed,
  onAutoplaySpeedChange,
  isMuted,
  onMutedChange,
  volume,
  onVolumeChange,
  zoomLevel,
  onZoomLevelChange,
  rotation,
  onRotationChange,
  isShuffled,
  onShuffledChange,
  isLooping,
  onLoopingChange,
  playbackRate,
  onPlaybackRateChange,
  onDownload,
  onShare,
  onCopyLink,
  service
}: {
  media: Array<{ name: string; path: string }>;
  currentIndex: number;
  onIndexChange: (index: number) => void;
  isPlaying: boolean;
  onPlayChange: (playing: boolean) => void;
  isFullscreen: boolean;
  onFullscreenChange: (fullscreen: boolean) => void;
  showControls: boolean;
  onControlsChange: (show: boolean) => void;
  autoplaySpeed: number;
  onAutoplaySpeedChange: (speed: number) => void;
  isMuted: boolean;
  onMutedChange: (muted: boolean) => void;
  volume: number;
  onVolumeChange: (volume: number) => void;
  zoomLevel: number;
  onZoomLevelChange: (zoom: number) => void;
  rotation: number;
  onRotationChange: (rotation: number) => void;
  isShuffled: boolean;
  onShuffledChange: (shuffled: boolean) => void;
  isLooping: boolean;
  onLoopingChange: (looping: boolean) => void;
  playbackRate: number;
  onPlaybackRateChange: (rate: number) => void;
  onDownload: (path: string) => void;
  onShare: (path: string) => void;
  onCopyLink: (path: string) => void;
  service: string;
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showSettings, setShowSettings] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [copied, setCopied] = useState(false);
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });
  const [touchEnd, setTouchEnd] = useState({ x: 0, y: 0 });
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const autoplayTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const currentMedia = media[currentIndex];
  const isVideo = currentMedia?.name?.includes('.mp4') || 
                  currentMedia?.name?.includes('.mov') || 
                  currentMedia?.name?.includes('.avi') || 
                  currentMedia?.name?.includes('.webm');

  const getMediaUrl = (path: string, service: string) => {
    if (COOMER_SERVICES.includes(service)) {
      return `https://coomer.st${path}`;
    } else {
      return `https://kemono.su${path}`;
    }
  };

  const handleMediaLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleMediaError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const handleNext = useCallback(() => {
    if (isShuffled) {
      const randomIndex = Math.floor(Math.random() * media.length);
      onIndexChange(randomIndex);
    } else {
      onIndexChange((currentIndex + 1) % media.length);
    }
  }, [isShuffled, currentIndex, media.length, onIndexChange]);

  const handlePrevious = useCallback(() => {
    if (isShuffled) {
      const randomIndex = Math.floor(Math.random() * media.length);
      onIndexChange(randomIndex);
    } else {
      onIndexChange((currentIndex - 1 + media.length) % media.length);
    }
  }, [isShuffled, currentIndex, media.length, onIndexChange]);

  const handlePlayPause = useCallback(() => {
    onPlayChange(!isPlaying);
  }, [isPlaying, onPlayChange]);

  const handleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      onFullscreenChange(true);
    } else {
      document.exitFullscreen();
      onFullscreenChange(false);
    }
  }, [onFullscreenChange]);

  const handleZoomIn = useCallback(() => {
    onZoomLevelChange(Math.min(zoomLevel + 0.25, 3));
  }, [zoomLevel, onZoomLevelChange]);

  const handleZoomOut = useCallback(() => {
    onZoomLevelChange(Math.max(zoomLevel - 0.25, 0.5));
  }, [zoomLevel, onZoomLevelChange]);

  const handleRotate = useCallback(() => {
    onRotationChange((rotation + 90) % 360);
  }, [rotation, onRotationChange]);

  const handleReset = useCallback(() => {
    onZoomLevelChange(1);
    onRotationChange(0);
    setDragOffset({ x: 0, y: 0 });
  }, [onZoomLevelChange, onRotationChange]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y });
    }
  }, [zoomLevel, dragOffset]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      setDragOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchEnd({ x: touch.clientX, y: touch.clientY });
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!touchStart.x || !touchEnd.x) return;
    
    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    
    const isLeftSwipe = distanceX > 50;
    const isRightSwipe = distanceX < -50;
    
    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrevious();
    }
  }, [touchStart, touchEnd, handleNext, handlePrevious]);

  const handleDownload = useCallback(() => {
    if (currentMedia) {
      onDownload(currentMedia.path);
    }
  }, [currentMedia, onDownload]);

  const handleShare = useCallback(() => {
    if (currentMedia) {
      onShare(currentMedia.path);
    }
  }, [currentMedia, onShare]);

  const handleCopyLink = useCallback(async () => {
    if (currentMedia) {
      try {
        await navigator.clipboard.writeText(getMediaUrl(currentMedia.path, service));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        onCopyLink(currentMedia.path);
      } catch (err) {
        console.error('Failed to copy link:', err);
      }
    }
  }, [currentMedia, service, onCopyLink]);

  const handleVolumeChange = useCallback((value: number[]) => {
    onVolumeChange(value[0]);
    if (videoRef.current) {
      videoRef.current.volume = value[0] / 100;
    }
  }, [onVolumeChange]);

  const handleMuteToggle = useCallback(() => {
    onMutedChange(!isMuted);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  }, [isMuted, onMutedChange]);

  const handlePlaybackRateChange = useCallback((rate: number) => {
    onPlaybackRateChange(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
  }, [onPlaybackRateChange]);

  const handleAutoplaySpeedChange = useCallback((speed: number) => {
    onAutoplaySpeedChange(speed);
  }, [onAutoplaySpeedChange]);

  const handleShuffleToggle = useCallback(() => {
    onShuffledChange(!isShuffled);
  }, [isShuffled, onShuffledChange]);

  const handleLoopToggle = useCallback(() => {
    onLoopingChange(!isLooping);
  }, [isLooping, onLoopingChange]);

  useEffect(() => {
    if (isPlaying && media.length > 1) {
      autoplayTimeoutRef.current = setTimeout(() => {
        handleNext();
      }, 10000 / autoplaySpeed);
    } else {
      if (autoplayTimeoutRef.current) {
        clearTimeout(autoplayTimeoutRef.current);
      }
    }

    return () => {
      if (autoplayTimeoutRef.current) {
        clearTimeout(autoplayTimeoutRef.current);
      }
    };
  }, [isPlaying, currentIndex, autoplaySpeed, media.length, handleNext]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          handlePrevious();
          break;
        case 'ArrowRight':
          handleNext();
          break;
        case ' ':
          e.preventDefault();
          handlePlayPause();
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
        case 'm':
          handleMuteToggle();
          break;
        case 's':
          handleShuffleToggle();
          break;
        case 'l':
          handleLoopToggle();
          break;
        case 'd':
          handleDownload();
          break;
        case 'c':
          handleCopyLink();
          break;
        case 'i':
          setShowInfo(!showInfo);
          break;
        case 'Escape':
          if (isFullscreen) {
            handleFullscreen();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrevious, handleNext, handlePlayPause, handleFullscreen, handleZoomIn, handleZoomOut, handleRotate, handleReset, handleMuteToggle, handleShuffleToggle, handleLoopToggle, handleDownload, handleCopyLink, showInfo, isFullscreen]);

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-full bg-black flex items-center justify-center overflow-hidden ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={() => onControlsChange(!showControls)}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
        </div>
      )}
      
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 z-10">
          <ImageOff className="h-12 w-12 text-gray-400 mb-2" />
          <p className="text-gray-400">Failed to load media</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2 text-white border-white/20"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      )}
      
      {currentMedia && (
        <div 
          className="relative w-full h-full flex items-center justify-center"
          style={{
            transform: `scale(${zoomLevel}) rotate(${rotation}deg) translate(${dragOffset.x}px, ${dragOffset.y}px)`,
            transition: isDragging ? 'none' : 'transform 0.3s ease'
          }}
        >
          {isVideo ? (
            <video
              ref={videoRef}
              src={getMediaUrl(currentMedia.path, service)}
              className="max-w-full max-h-full object-contain"
              controls={false}
              autoPlay={isPlaying}
              loop={isLooping}
              muted={isMuted}
              playbackRate={playbackRate}
              onLoadedData={handleMediaLoad}
              onError={handleMediaError}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <img
              src={getMediaUrl(currentMedia.path, service)}
              alt={currentMedia.name}
              className="max-w-full max-h-full object-contain"
              onLoad={handleMediaLoad}
              onError={handleMediaError}
              draggable={false}
            />
          )}
        </div>
      )}
      
      {showControls && (
        <>
          {/* Top Controls */}
          <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/70 to-transparent">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-black/50 text-white border-white/20">
                  {currentIndex + 1} / {media.length}
                </Badge>
                {isVideo && (
                  <Badge variant="secondary" className="bg-black/50 text-white border-white/20">
                    Video
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/20"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowInfo(!showInfo);
                        }}
                      >
                        <Info className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Info</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/20"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowSettings(!showSettings);
                        }}
                      >
                        <Settings className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Settings</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/20"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFullscreen();
                        }}
                      >
                        {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Fullscreen</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
          
          {/* Side Navigation */}
          {media.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevious();
                }}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}
          
          {/* Bottom Controls */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevious();
                  }}
                >
                  <SkipBack className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlayPause();
                  }}
                >
                  {isPlaying ? <PauseCircle className="h-6 w-6" /> : <PlayCircle className="h-6 w-6" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                >
                  <SkipForward className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className={`text-white hover:bg-white/20 ${isShuffled ? 'text-blue-400' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShuffleToggle();
                  }}
                >
                  <Shuffle className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`text-white hover:bg-white/20 ${isLooping ? 'text-blue-400' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLoopToggle();
                  }}
                >
                  <RotateCw className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleZoomOut();
                  }}
                >
                  <ZoomOut className="h-5 w-5" />
                </Button>
                <Badge variant="secondary" className="bg-black/50 text-white border-white/20">
                  {Math.round(zoomLevel * 100)}%
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleZoomIn();
                  }}
                >
                  <ZoomIn className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRotate();
                  }}
                >
                  <RotateCw className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReset();
                  }}
                >
                  <span className="text-xs">1:1</span>
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                {isVideo && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white hover:bg-white/20"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMuteToggle();
                      }}
                    >
                      {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                    </Button>
                    <div className="w-20">
                      <Slider
                        value={[volume]}
                        onValueChange={handleVolumeChange}
                        max={100}
                        step={1}
                        className="w-full"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload();
                  }}
                >
                  <Download className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShare();
                  }}
                >
                  <Share2 className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopyLink();
                  }}
                >
                  {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                </Button>
              </div>
            </div>
            
            {/* Progress Indicator */}
            {media.length > 1 && (
              <div className="flex items-center justify-center mt-2 gap-1">
                {media.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      onIndexChange(index);
                    }}
                    className={`w-2 h-2 rounded-full transition-all duration-200 ${
                      index === currentIndex ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/70'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}
      
      {/* Settings Panel */}
      {showSettings && (
        <div className="absolute top-16 right-4 bg-black/80 backdrop-blur-md rounded-lg p-4 w-64 text-white">
          <h3 className="font-semibold mb-3">Settings</h3>
          
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-300">Autoplay Speed</label>
              <div className="flex items-center gap-2 mt-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                  onClick={() => handleAutoplaySpeedChange(Math.max(autoplaySpeed - 0.25, 0.25))}
                >
                  -
                </Button>
                <span className="text-sm w-12 text-center">{autoplaySpeed}x</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                  onClick={() => handleAutoplaySpeedChange(Math.min(autoplaySpeed + 0.25, 2))}
                >
                  +
                </Button>
              </div>
            </div>
            
            {isVideo && (
              <div>
                <label className="text-sm text-gray-300">Playback Rate</label>
                <div className="flex items-center gap-2 mt-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20"
                    onClick={() => handlePlaybackRateChange(Math.max(playbackRate - 0.25, 0.25))}
                  >
                    -
                  </Button>
                  <span className="text-sm w-12 text-center">{playbackRate}x</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20"
                    onClick={() => handlePlaybackRateChange(Math.min(playbackRate + 0.25, 2))}
                  >
                    +
                  </Button>
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Shuffle</span>
              <Switch
                checked={isShuffled}
                onCheckedChange={handleShuffleToggle}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Loop</span>
              <Switch
                checked={isLooping}
                onCheckedChange={handleLoopToggle}
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Info Panel */}
      {showInfo && currentMedia && (
        <div className="absolute top-16 left-4 bg-black/80 backdrop-blur-md rounded-lg p-4 w-64 text-white">
          <h3 className="font-semibold mb-3">Media Info</h3>
          
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-400">Name:</span>
              <p className="truncate">{currentMedia.name}</p>
            </div>
            
            <div>
              <span className="text-gray-400">Type:</span>
              <p>{isVideo ? 'Video' : 'Image'}</p>
            </div>
            
            <div>
              <span className="text-gray-400">Index:</span>
              <p>{currentIndex + 1} of {media.length}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Enhanced Post Detail Modal Component
function PostDetailModal({ 
  post, 
  isOpen, 
  onClose 
}: { 
  post: Post | null; 
  isOpen: boolean; 
  onClose: () => void;
}) {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [comment, setComment] = useState('');
  const [likes, setLikes] = useState(Math.floor(Math.random() * 1000) + 100);
  const [dislikes, setDislikes] = useState(Math.floor(Math.random() * 100) + 10);
  const [views, setViews] = useState(Math.floor(Math.random() * 10000) + 1000);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [autoplaySpeed, setAutoplaySpeed] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(50);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isShuffled, setIsShuffled] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([
    { id: 1, user: 'User1', text: 'Amazing content!', timestamp: '2 hours ago', likes: 12 },
    { id: 2, user: 'User2', text: 'Love this post', timestamp: '5 hours ago', likes: 8 },
    { id: 3, user: 'User3', text: 'Thanks for sharing', timestamp: '1 day ago', likes: 5 }
  ]);
  const [newComment, setNewComment] = useState('');
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const [showRelated, setShowRelated] = useState(false);
  const [contentExpanded, setContentExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [reportMenuOpen, setReportMenuOpen] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const allMedia = useMemo(() => {
    if (!post) return [];
    const media = post.file ? [post.file] : [];
    return [...media, ...post.attachments];
  }, [post]);

  useEffect(() => {
    if (isOpen && post) {
      // Simulate loading related posts
      setLoadingRelated(true);
      setTimeout(() => {
        setRelatedPosts([
          { id: '1', user: post.user, service: post.service, title: 'Related Post 1', content: 'This is a related post', published: '2023-01-01', attachments: [] },
          { id: '2', user: post.user, service: post.service, title: 'Related Post 2', content: 'This is another related post', published: '2023-01-02', attachments: [] },
          { id: '3', user: post.user, service: post.service, title: 'Related Post 3', content: 'This is yet another related post', published: '2023-01-03', attachments: [] }
        ]);
        setLoadingRelated(false);
      }, 1000);
      
      // Increment view count
      setViews(prev => prev + 1);
    }
  }, [isOpen, post]);

  useEffect(() => {
    setCurrentMediaIndex(0);
    setIsPlaying(false);
    setZoomLevel(1);
    setRotation(0);
    setContentExpanded(false);
    setShowComments(false);
    setShowRelated(false);
  }, [post]);

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

  const handleLike = useCallback(() => {
    setIsLiked(!isLiked);
    setLikes(prev => isLiked ? prev - 1 : prev + 1);
  }, [isLiked]);

  const handleDislike = useCallback(() => {
    setDislikes(prev => isLiked ? prev + 1 : prev - 1);
    if (isLiked) {
      setIsLiked(false);
      setLikes(prev => prev - 1);
    }
  }, [isLiked]);

  const handleSave = useCallback(() => {
    setIsSaved(!isSaved);
    toast(isSaved ? 'Removed from saved' : 'Saved to collection');
  }, [isSaved]);

  const handleShare = useCallback((platform: string) => {
    const url = window.location.href;
    let shareUrl = '';
    
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(post?.title || '')}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'reddit':
        shareUrl = `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(post?.title || '')}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast('Link copied to clipboard');
        return;
      default:
        return;
    }
    
    window.open(shareUrl, '_blank');
    setShareMenuOpen(false);
  }, [post?.title]);

  const handleReport = useCallback((reason: string) => {
    toast(`Report submitted: ${reason}`);
    setReportMenuOpen(false);
  }, []);

  const handleDownload = useCallback(async (path: string) => {
    setIsDownloading(true);
    setDownloadProgress(0);
    
    try {
      const url = COOMER_SERVICES.includes(post?.service || '') 
        ? `https://coomer.st${path}`
        : `https://kemono.su${path}`;
      
      // Simulate download progress
      const interval = setInterval(() => {
        setDownloadProgress(prev => {
          if (prev >= 95) {
            clearInterval(interval);
            return prev;
          }
          return prev + 5;
        });
      }, 200);
      
      // Create a download link
      const a = document.createElement('a');
      a.href = url;
      a.download = path.split('/').pop() || 'download';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Complete the download
      setTimeout(() => {
        setDownloadProgress(100);
        setTimeout(() => {
          setIsDownloading(false);
          setDownloadProgress(0);
        }, 500);
      }, 1000);
      
      toast('Download started');
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Download failed');
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  }, [post?.service]);

  const handleAddComment = useCallback(() => {
    if (newComment.trim()) {
      const comment = {
        id: comments.length + 1,
        user: 'You',
        text: newComment,
        timestamp: 'Just now',
        likes: 0
      };
      setComments([comment, ...comments]);
      setNewComment('');
      toast('Comment added');
    }
  }, [newComment, comments]);

  const handleLikeComment = useCallback((commentId: number) => {
    setComments(comments.map(comment => 
      comment.id === commentId 
        ? { ...comment, likes: comment.likes + 1 }
        : comment
    ));
  }, [comments]);

  const isVideo = useCallback((filename?: string) => {
    if (!filename) return false;
    return filename.includes('.mp4') || filename.includes('.mov') || filename.includes('.avi') || filename.includes('.webm');
  }, []);

  const getMediaUrl = useCallback((path: string, service: string) => {
    if (COOMER_SERVICES.includes(service)) {
      return `https://coomer.st${path}`;
    } else {
      return `https://kemono.su${path}`;
    }
  }, []);

  const formatContent = useCallback((content: string) => {
    // Simple content formatting - in a real app, you might use a library like markdown-it
    return content
      .replace(/\n/g, '<br />')
      .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:underline">$1</a>')
      .replace(/#(\w+)/g, '<span class="text-blue-400">#$1</span>')
      .replace(/@(\w+)/g, '<span class="text-blue-400">@$1</span>');
  }, []);

  if (!post) return null;

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="max-w-7xl h-[95vh] bg-black/95 backdrop-blur-xl border-white/10 text-white mx-auto">
        <div className="flex flex-col h-full mx-auto w-full max-w-7xl">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10 flex-shrink-0">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={
                  COOMER_SERVICES.includes(post.service) 
                    ? `https://coomer.st/icons/${post.service}/${post.user}`
                    : `https://kemono.su/icons/${post.service}/${post.user}`
                } />
                <AvatarFallback>{post.user?.charAt(0)?.toUpperCase() || 'U'}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold">{post.user || 'Unknown'}</p>
                <p className="text-xs text-gray-400">
                  {new Date(post.published).toLocaleDateString()} • {views.toLocaleString()} views
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu open={shareMenuOpen} onOpenChange={setShareMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                    <Share2 className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-black/90 backdrop-blur-xl border-white/10 text-white">
                  <DropdownMenuItem onClick={() => handleShare('twitter')}>
                    Share on Twitter
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShare('facebook')}>
                    Share on Facebook
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShare('reddit')}>
                    Share on Reddit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShare('copy')}>
                    {copied ? 'Link Copied!' : 'Copy Link'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <DropdownMenu open={reportMenuOpen} onOpenChange={setReportMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                    <MoreHorizontal className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-black/90 backdrop-blur-xl border-white/10 text-white">
                  <DropdownMenuItem onClick={() => handleReport('Inappropriate content')}>
                    Report
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleReport('Spam')}>
                    Report as Spam
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleReport('Copyright violation')}>
                    Report Copyright
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <DrawerClose asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                  <X className="h-5 w-5" />
                </Button>
              </DrawerClose>
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Media Viewer */}
            <div className="flex-1 relative bg-black">
              {allMedia.length > 0 ? (
                <MediaViewer
                  media={allMedia}
                  currentIndex={currentMediaIndex}
                  onIndexChange={setCurrentMediaIndex}
                  isPlaying={isPlaying}
                  onPlayChange={setIsPlaying}
                  isFullscreen={isFullscreen}
                  onFullscreenChange={setIsFullscreen}
                  showControls={showControls}
                  onControlsChange={setShowControls}
                  autoplaySpeed={autoplaySpeed}
                  onAutoplaySpeedChange={setAutoplaySpeed}
                  isMuted={isMuted}
                  onMutedChange={setIsMuted}
                  volume={volume}
                  onVolumeChange={setVolume}
                  zoomLevel={zoomLevel}
                  onZoomLevelChange={setZoomLevel}
                  rotation={rotation}
                  onRotationChange={setRotation}
                  isShuffled={isShuffled}
                  onShuffledChange={setIsShuffled}
                  isLooping={isLooping}
                  onLoopingChange={setIsLooping}
                  playbackRate={playbackRate}
                  onPlaybackRateChange={setPlaybackRate}
                  onDownload={handleDownload}
                  onShare={() => setShareMenuOpen(true)}
                  onCopyLink={() => handleShare('copy')}
                  service={post.service}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <ImageOff className="h-12 w-12 text-gray-500 mx-auto mb-2" />
                    <p className="text-gray-400">No media available</p>
                  </div>
                </div>
              )}
              
              {/* Download Progress */}
              {isDownloading && (
                <div className="absolute bottom-4 left-4 right-4 bg-black/70 backdrop-blur-md rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">Downloading...</span>
                    <span className="text-sm">{downloadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${downloadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {/* Post Details Sidebar */}
            <div className="w-full md:w-96 border-l border-white/10 flex flex-col">
              <div className="p-4 border-b border-white/10 flex-shrink-0">
                <h3 className="font-bold text-lg">{post.title}</h3>
              </div>

              <div className="flex items-center justify-between p-4 border-b border-white/10 flex-shrink-0">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`p-2 ${isLiked ? 'text-red-500' : 'text-white'}`}
                    onClick={handleLike}
                  >
                    <ThumbsUp className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2 text-white"
                    onClick={handleDislike}
                  >
                    <ThumbsDown className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2 text-white"
                    onClick={() => setShowComments(!showComments)}
                  >
                    <MessageCircle className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2 text-white"
                    onClick={() => setShareMenuOpen(true)}
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2 text-white"
                  onClick={handleSave}
                >
                  <Bookmark className={`h-5 w-5 ${isSaved ? 'fill-current' : ''}`} />
                </Button>
              </div>

              <div className="px-4 py-2 border-b border-white/10 flex-shrink-0">
                <p className="text-sm font-semibold">{likes.toLocaleString()} likes • {dislikes.toLocaleString()} dislikes</p>
              </div>

              <Tabs defaultValue="content" className="flex-1 flex flex-col">
                <TabsList className="grid w-full grid-cols-3 bg-white/10 border-white/20 mx-4 mt-2">
                  <TabsTrigger value="content" className="data-[state=active]:bg-white/20">Content</TabsTrigger>
                  <TabsTrigger value="comments" className="data-[state=active]:bg-white/20">Comments</TabsTrigger>
                  <TabsTrigger value="related" className="data-[state=active]:bg-white/20">Related</TabsTrigger>
                </TabsList>
                
                <TabsContent value="content" className="flex-1 overflow-y-auto p-4">
                  <div 
                    className="text-sm text-gray-300"
                    dangerouslySetInnerHTML={{ __html: formatContent(post.content) }}
                  />
                  {post.content.length > 300 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-blue-400 text-xs mt-2 p-0 h-auto"
                      onClick={() => setContentExpanded(!contentExpanded)}
                    >
                      {contentExpanded ? 'Show less' : 'Show more'}
                    </Button>
                  )}
                </TabsContent>
                
                <TabsContent value="comments" className="flex-1 overflow-y-auto">
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Smile className="h-5 w-5 text-gray-400" />
                      <Input
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="bg-transparent border-none text-white placeholder:text-gray-400 text-sm flex-1"
                        onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                      />
                      <Button size="sm" className="text-blue-400 text-xs font-semibold" onClick={handleAddComment}>
                        Post
                      </Button>
                    </div>
                    
                    <div className="space-y-3">
                      {comments.map(comment => (
                        <div key={comment.id} className="border-b border-white/10 pb-3">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-semibold">{comment.user}</p>
                            <p className="text-xs text-gray-400">{comment.timestamp}</p>
                          </div>
                          <p className="text-sm text-gray-300 mb-2">{comment.text}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-400 text-xs p-0 h-auto"
                            onClick={() => handleLikeComment(comment.id)}
                          >
                            <Heart className="h-3 w-3 mr-1" />
                            {comment.likes}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="related" className="flex-1 overflow-y-auto">
                  <div className="p-4">
                    {loadingRelated ? (
                      <div className="flex justify-center py-4">
                        <Loader2 className="h-6 w-6 animate-spin text-white" />
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {relatedPosts.map(relatedPost => (
                          <div key={relatedPost.id} className="border-b border-white/10 pb-3">
                            <h4 className="text-sm font-semibold mb-1">{relatedPost.title}</h4>
                            <p className="text-xs text-gray-400 mb-2">{new Date(relatedPost.published).toLocaleDateString()}</p>
                            <p className="text-sm text-gray-300 truncate">{relatedPost.content}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

// Enhanced Creator Profile Drawer Component
function CreatorProfileDrawer({ 
  creator, 
  isOpen, 
  onClose 
}: { 
  creator: Creator | null; 
  isOpen: boolean; 
  onClose: () => void;
}) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'slideshow'>('grid');
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMorePosts, setHasMorePosts] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [autoplaySpeed, setAutoplaySpeed] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(50);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isShuffled, setIsShuffled] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set());
  const [showSelection, setShowSelection] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'mostLiked' | 'mostViewed'>('newest');
  const [filterType, setFilterType] = useState<'all' | 'images' | 'videos'>('all');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
  }, [creator, currentPage, hasMorePosts, loadingMore, profile]);

  useEffect(() => {
    if (isPlaying && viewMode === 'slideshow' && posts.length > 0) {
      intervalRef.current = setInterval(() => {
        if (isShuffled) {
          const randomIndex = Math.floor(Math.random() * posts.length);
          setCurrentSlideIndex(randomIndex);
        } else {
          setCurrentSlideIndex((prev) => (prev + 1) % posts.length);
        }
      }, 10000 / autoplaySpeed);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, viewMode, posts.length, autoplaySpeed, isShuffled]);

  useEffect(() => {
    setCurrentSlideIndex(0);
    setIsPlaying(false);
    setViewMode('grid');
    setCurrentPage(0);
    setSelectedPosts(new Set());
  }, [creator]);

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

  const handlePostClick = useCallback((post: Post) => {
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
      setIsPostModalOpen(true);
    }
  }, [showSelection, selectedPosts]);

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
        // In a real app, you would sort by actual like count
        filtered.sort(() => Math.random() - 0.5);
        break;
      case 'mostViewed':
        // In a real app, you would sort by actual view count
        filtered.sort(() => Math.random() - 0.5);
        break;
    }
    
    return filtered;
  }, [posts, filterType, sortBy]);

  const getPostImageUrl = useCallback((post: Post) => {
    if (post.file) {
      const baseUrl = COOMER_SERVICES.includes(post.service) ? 'https://coomer.st' : 'https://kemono.su';
      return `${baseUrl}${post.file.path}`;
    }
    if (post.attachments && post.attachments.length > 0) {
      const baseUrl = COOMER_SERVICES.includes(post.service) ? 'https://coomer.st' : 'https://kemono.su';
      return `${baseUrl}${post.attachments[0].path}`;
    }
    return null;
  }, []);

  const isVideo = useCallback((filename?: string) => {
    if (!filename) return false;
    return filename.includes('.mp4') || filename.includes('.mov') || filename.includes('.avi') || filename.includes('.webm');
  }, []);

  const handleDownload = useCallback(async (path: string) => {
    try {
      const url = COOMER_SERVICES.includes(creator?.service || '') 
        ? `https://coomer.st${path}`
        : `https://kemono.su${path}`;
      
      // Create a download link
      const a = document.createElement('a');
      a.href = url;
      a.download = path.split('/').pop() || 'download';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      toast('Download started');
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Download failed');
    }
  }, [creator?.service]);

  const handleShare = useCallback((path: string) => {
    const url = COOMER_SERVICES.includes(creator?.service || '') 
      ? `https://coomer.st${path}`
      : `https://kemono.su${path}`;
    
    navigator.clipboard.writeText(url);
    toast('Link copied to clipboard');
  }, [creator?.service]);

  const handleCopyLink = useCallback((path: string) => {
    const url = COOMER_SERVICES.includes(creator?.service || '') 
      ? `https://coomer.st${path}`
      : `https://kemono.su${path}`;
    
    navigator.clipboard.writeText(url);
    toast('Link copied to clipboard');
  }, [creator?.service]);

  if (!creator) return null;

  return (
    <>
      <Drawer open={isOpen} onOpenChange={onClose}>
        <DrawerContent className="max-w-7xl h-[95vh] bg-black/95 backdrop-blur-xl border-white/10 text-white mx-auto">
          <div className="flex flex-col h-full mx-auto w-full max-w-7xl">
            <div className="flex items-center justify-between p-4 border-b border-white/10 flex-shrink-0">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={
                    COOMER_SERVICES.includes(creator.service) 
                      ? `https://coomer.st/icons/${creator.service}/${creator.id}`
                      : `https://kemono.su/icons/${creator.service}/${creator.id}`
                  } />
                  <AvatarFallback>{creator.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <DrawerTitle className="text-lg font-bold">{creator.name}</DrawerTitle>
                  <DrawerDescription className="text-sm text-gray-400">
                    {creator.service} • {creator.favorited} favorites
                    {profile && <span className="ml-2">{profile.post_count} posts</span>}
                  </DrawerDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {showSelection && (
                  <div className="flex items-center gap-2 mr-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white"
                      onClick={handleSelectAll}
                    >
                      {selectedPosts.size === filteredPosts.length ? 'Deselect All' : 'Select All'}
                    </Button>
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                      {selectedPosts.size} selected
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white"
                      onClick={handleDownloadSelected}
                      disabled={selectedPosts.size === 0}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white"
                      onClick={handleCreatePlaylist}
                      disabled={selectedPosts.size === 0}
                    >
                      <PlayCircle className="h-4 w-4 mr-1" />
                      Playlist
                    </Button>
                  </div>
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  className={`text-white ${showSelection ? 'bg-white/20' : ''}`}
                  onClick={() => setShowSelection(!showSelection)}
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
                
                <Select value={filterType} onValueChange={(value) => setFilterType(value as 'all' | 'images' | 'videos')}>
                  <SelectTrigger className="w-32 bg-white/10 backdrop-blur-md border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-black/90 backdrop-blur-xl border-white/10">
                    <SelectItem value="all" className="text-white">All</SelectItem>
                    <SelectItem value="images" className="text-white">Images</SelectItem>
                    <SelectItem value="videos" className="text-white">Videos</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'newest' | 'oldest' | 'mostLiked' | 'mostViewed')}>
                  <SelectTrigger className="w-32 bg-white/10 backdrop-blur-md border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-black/90 backdrop-blur-xl border-white/10">
                    <SelectItem value="newest" className="text-white">Newest</SelectItem>
                    <SelectItem value="oldest" className="text-white">Oldest</SelectItem>
                    <SelectItem value="mostLiked" className="text-white">Most Liked</SelectItem>
                    <SelectItem value="mostViewed" className="text-white">Most Viewed</SelectItem>
                  </SelectContent>
                </Select>
                
                <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'grid' | 'slideshow')}>
                  <TabsList className="bg-white/10 border-white/20">
                    <TabsTrigger value="grid" className="data-[state=active]:bg-white/20">
                      <Grid3x3 className="h-4 w-4 mr-2" />
                      Grid
                    </TabsTrigger>
                    <TabsTrigger value="slideshow" className="data-[state=active]:bg-white/20">
                      <PlayCircle className="h-4 w-4 mr-2" />
                      Slideshow
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                
                <DrawerClose asChild>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                    <X className="h-5 w-5" />
                  </Button>
                </DrawerClose>
              </div>
            </div>

            <div className="flex-1 overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-white" />
                </div>
              ) : filteredPosts.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-400">No posts available</p>
                </div>
              ) : (
                <>
                  {viewMode === 'grid' ? (
                    <div id="posts-scroll-container" className="h-full overflow-y-auto">
                      <InfiniteScroll
                        dataLength={filteredPosts.length}
                        next={loadMorePosts}
                        hasMore={hasMorePosts}
                        loader={<div className="flex justify-center py-4"><Loader2 className="h-6 w-6 animate-spin text-white" /></div>}
                        scrollableTarget="posts-scroll-container"
                        endMessage={<p className="text-center text-gray-400 py-4">No more posts</p>}
                      >
                        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-1 p-2">
                          {filteredPosts.map((post, index) => (
                            <div
                              key={post.id}
                              className={`aspect-square relative overflow-hidden cursor-pointer group ${
                                showSelection && selectedPosts.has(post.id) ? 'ring-2 ring-blue-500' : ''
                              }`}
                              onClick={() => handlePostClick(post)}
                              onMouseEnter={() => setHoveredIndex(index)}
                              onMouseLeave={() => setHoveredIndex(null)}
                            >
                              {getPostImageUrl(post) ? (
                                <>
                                  <img
                                    src={getPostImageUrl(post) || ''}
                                    alt={post.title}
                                    className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-110"
                                    loading="lazy"
                                    onError={(e) => {
                                      e.currentTarget.src = '';
                                      e.currentTarget.style.display = 'none';
                                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                    }}
                                  />
                                  <div className="hidden w-full h-full bg-gray-800 flex items-center justify-center">
                                    <ImageOff className="h-6 w-6 text-gray-600" />
                                  </div>
                                  <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-200 ${
                                    hoveredIndex === index ? 'opacity-100' : 'opacity-0'
                                  }`}>
                                    {isVideo(post.file?.name || post.attachments?.[0]?.name) ? (
                                      <PlayCircle className="h-8 w-8 text-white" />
                                    ) : (
                                      <div className="text-center">
                                        <p className="text-white text-xs font-bold truncate px-2">{post.title}</p>
                                      </div>
                                    )}
                                  </div>
                                  {post.attachments && post.attachments.length > 0 && (
                                    <div className="absolute top-1 right-1 bg-black/70 rounded-full px-2 py-0.5">
                                      <span className="text-xs text-white">+{post.attachments.length}</span>
                                    </div>
                                  )}
                                  {showSelection && (
                                    <div className="absolute top-1 left-1">
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
                                </>
                              ) : (
                                <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                                  <ImageOff className="h-6 w-6 text-gray-600" />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </InfiniteScroll>
                    </div>
                  ) : (
                    <div className="relative h-full flex items-center justify-center bg-black">
                      <MediaViewer
                        media={filteredPosts.map(post => ({
                          name: post.file?.name || post.attachments?.[0]?.name || '',
                          path: post.file?.path || post.attachments?.[0]?.path || ''
                        }))}
                        currentIndex={currentSlideIndex}
                        onIndexChange={setCurrentSlideIndex}
                        isPlaying={isPlaying}
                        onPlayChange={setIsPlaying}
                        isFullscreen={isFullscreen}
                        onFullscreenChange={setIsFullscreen}
                        showControls={showControls}
                        onControlsChange={setShowControls}
                        autoplaySpeed={autoplaySpeed}
                        onAutoplaySpeedChange={setAutoplaySpeed}
                        isMuted={isMuted}
                        onMutedChange={setIsMuted}
                        volume={volume}
                        onVolumeChange={setVolume}
                        zoomLevel={zoomLevel}
                        onZoomLevelChange={setZoomLevel}
                        rotation={rotation}
                        onRotationChange={setRotation}
                        isShuffled={isShuffled}
                        onShuffledChange={setIsShuffled}
                        isLooping={isLooping}
                        onLoopingChange={setIsLooping}
                        playbackRate={playbackRate}
                        onPlaybackRateChange={setPlaybackRate}
                        onDownload={handleDownload}
                        onShare={handleShare}
                        onCopyLink={handleCopyLink}
                        service={creator.service}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      <PostDetailModal
        post={selectedPost}
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
      />
    </>
  );
}

function RouteComponent() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState('all');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [apiError, setApiError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCreators, setTotalCreators] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [isCreatorDrawerOpen, setIsCreatorDrawerOpen] = useState(false);

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

  const formatDate = useCallback((timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString();
  }, []);

  const getCreatorImageUrl = useCallback((creator: Creator) => {
    if (COOMER_SERVICES.includes(creator.service)) {
      return `https://coomer.st/icons/${creator.service}/${creator.id}`;
    } else {
      return `https://kemono.su/icons/${creator.service}/${creator.id}`;
    }
  }, []);

  const getServiceDisplayName = useCallback((service: string) => {
    const serviceObj = SERVICES.find(s => s.value === service);
    return serviceObj ? serviceObj.label : service;
  }, []);

  const handleImageError = useCallback((creatorId: string) => {
    setImageErrors(prev => new Set(prev).add(creatorId));
  }, []);

  const handleCreatorClick = useCallback((creator: Creator) => {
    setSelectedCreator(creator);
    setIsCreatorDrawerOpen(true);
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-pink-900/20">
      {/* Fixed Header */}
      <header className="flex-shrink-0 bg-black/40 backdrop-blur-lg border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">Creator Browser</h1>
                <p className="text-gray-300 text-sm">
                  Browse creators from Coomer and Kemono
                  {lastUpdated && <span className="ml-2 text-xs">Updated: {lastUpdated.toLocaleTimeString()}</span>}
                  {totalCreators > 0 && <span className="ml-2 text-xs">{creators.length}/{totalCreators}</span>}
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleRefresh} 
                disabled={refreshing || loading}
                className="flex items-center gap-2 bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20"
              >
                {refreshing || loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                Refresh
              </Button>
            </div>

            {apiError && (
              <div className="bg-red-500/20 backdrop-blur-md border border-red-500/30 rounded-md p-3 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-red-400 text-sm">API Error</h3>
                  <p className="text-xs text-red-300 mt-1">{apiError}</p>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search creators..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/10 backdrop-blur-md border-white/20 text-white placeholder:text-gray-400 focus:border-white/40"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <Select value={selectedService} onValueChange={setSelectedService}>
                  <SelectTrigger className="w-48 bg-white/10 backdrop-blur-md border-white/20 text-white">
                    <SelectValue placeholder="Select service" />
                  </SelectTrigger>
                  <SelectContent className="bg-black/90 backdrop-blur-xl border-white/10">
                    {SERVICES.map((service) => (
                      <SelectItem key={service.value} value={service.value} className="text-white">
                        {service.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Scrollable Content */}
      <main id="main-scroll-container" className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-4">
          {loading && creators.length === 0 ? (
            <div className="flex flex-col justify-center items-center py-12 gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-white" />
              <p className="text-sm text-gray-300">Loading creators...</p>
            </div>
          ) : filteredCreators.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-300 text-sm">
                {searchTerm || selectedService !== 'all' ? 'No creators found matching your search or filter.' : 'No creators available.'}
              </p>
            </div>
          ) : (
            <InfiniteScroll
              dataLength={filteredCreators.length}
              next={loadMoreCreators}
              hasMore={hasMore}
              loader={<div className="flex justify-center py-4"><Loader2 className="h-6 w-6 animate-spin text-white" /></div>}
              scrollableTarget="main-scroll-container"
              endMessage={<p className="text-center text-gray-400 py-4">You've reached the end</p>}
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-3">
                {filteredCreators.map((creator) => (
                  <Card 
                    key={creator.id} 
                    className="overflow-hidden bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-all duration-200 hover:shadow-xl hover:shadow-white/10 cursor-pointer group hover:scale-105"
                    onClick={() => handleCreatorClick(creator)}
                  >
                    <div className="aspect-square relative overflow-hidden bg-black/30">
                      {!imageErrors.has(creator.id) ? (
                        <>
                          <img
                            src={getCreatorImageUrl(creator)}
                            alt={creator.name}
                            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-110"
                            onError={() => handleImageError(creator.id)}
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <div className="absolute bottom-0 left-0 right-0 p-2">
                              <h3 className="font-bold text-xs text-white truncate">{creator.name}</h3>
                              <p className="text-xs text-gray-300">{getServiceDisplayName(creator.service)}</p>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageOff className="h-8 w-8 text-gray-500" />
                        </div>
                      )}
                    </div>
                    <div className="p-2">
                      <div className="flex items-center justify-between mb-1">
                        <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-xs px-1 py-0">
                          {getServiceDisplayName(creator.service)}
                        </Badge>
                      </div>
                      <p className="text-xs text-white truncate font-medium">{creator.name}</p>
                      <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>{creator.favorited} ❤️</span>
                        <span>{formatDate(creator.updated)}</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </InfiniteScroll>
          )}
        </div>
      </main>

      <ScrollToTopButton />

      <CreatorProfileDrawer
        creator={selectedCreator}
        isOpen={isCreatorDrawerOpen}
        onClose={() => setIsCreatorDrawerOpen(false)}
      />
    </div>
  );
}

export const Route = createFileRoute('/coomerKemono')({
  component: RouteComponent,
});