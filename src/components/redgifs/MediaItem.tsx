// src/components/redgifs/MediaItem.tsx
import React, { useState, useRef } from 'react'
import { RedGifsMedia } from '@/services/redgifs'
import { useRedGifsStore } from '@/stores/redgifs'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { Play, Pause, Volume2, VolumeX, Eye, Heart, VerifiedIcon } from 'lucide-react'

interface MediaItemProps {
  media: RedGifsMedia
  onClick?: () => void
  className?: string
  index?: number
}

export function MediaItem({ media, onClick, className = '', index = 0 }: MediaItemProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  
  const { quality, soundEnabled } = useRedGifsStore()
  
  const isVideo = media.type === 1
  const mediaUrl = quality === 'hd' ? media.urls.hd : media.urls.sd
  
  const handleMediaClick = () => {
    if (onClick) onClick()
    if (isVideo && videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }
  
  const handleMouseEnter = () => {
    setIsHovered(true)
    if (isVideo && videoRef.current && !isPlaying) {
      videoRef.current.play()
      setIsPlaying(true)
    }
  }
  
  const handleMouseLeave = () => {
    setIsHovered(false)
    if (isVideo && videoRef.current && isPlaying) {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
      setIsPlaying(false)
    }
  }
  
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }
  
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        "relative overflow-hidden rounded-lg cursor-pointer group bg-gray-900",
        className
      )}
      style={{ backgroundColor: media.avgColor || '#000' }}
      onClick={handleMediaClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {isVideo ? (
        <video
          ref={videoRef}
          src={mediaUrl}
          poster={media.urls.poster}
          className="w-full h-full object-cover"
          loop
          muted={!soundEnabled}
          playsInline
          onLoadStart={() => setIsLoaded(false)}
          onCanPlay={() => setIsLoaded(true)}
        />
      ) : (
        <img
          src={mediaUrl}
          alt={media.description || ''}
          className="w-full h-full object-cover"
          onLoad={() => setIsLoaded(true)}
        />
      )}
      
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      {/* Overlay with controls */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {/* Top badges */}
        <div className="absolute top-2 left-2 flex items-center space-x-2">
          {media.verified && (
            <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
              <VerifiedIcon className="w-3 h-3 mr-1" />
              Verified
            </div>
          )}
        </div>
        
        {/* Center play button */}
        {isVideo && (
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
            >
              {isPlaying ? (
                <Pause className="w-8 h-8 text-white" />
              ) : (
                <Play className="w-8 h-8 text-white ml-1" />
              )}
            </motion.div>
          </div>
        )}
        
        {/* Bottom info */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <p className="text-white text-sm font-medium truncate mb-1">@{media.userName}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 text-white/80 text-xs">
              <span className="flex items-center">
                <Eye className="w-3 h-3 mr-1" />
                {formatNumber(media.views)}
              </span>
              <span className="flex items-center">
                <Heart className="w-3 h-3 mr-1" />
                {formatNumber(media.likes)}
              </span>
            </div>
            {media.duration && (
              <span className="text-white/80 text-xs">
                {formatDuration(media.duration)}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}