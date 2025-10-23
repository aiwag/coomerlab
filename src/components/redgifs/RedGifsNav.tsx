// src/components/redgifs/RedGifsNav.tsx
import React from 'react'
import { Link } from '@tanstack/react-router'
import { useRedGifsStore } from '@/stores/redgifs'
import { useRedGifsAuth } from '@/hooks/useRedGifsAuth'
import { Button } from '@/components/ui/button'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { 
  Grid3X3, 
  PlaySquare, 
  Smartphone, 
  Tv, 
  Settings,
  Search,
  Shield,
  ShieldAlert,
  Key,
  WifiLow,
  WifiHigh
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { HeaderInput } from './HeaderInput'
import { useQueryClient } from '@tanstack/react-query'

interface RedGifsNavProps {
  onSettingsClick: () => void
}

export function RedGifsNav({ onSettingsClick }: RedGifsNavProps) {
  const { quality, setQuality, viewMode, setViewMode } = useRedGifsStore()
  const { isAuthenticated, isAuthenticating } = useRedGifsAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const queryClient = useQueryClient()
  
  const handleHeadersSet = () => {
    // Invalidate all queries to refresh data with new headers
    queryClient.invalidateQueries({ queryKey: ['redgifs'] })
  }
  
  return (
    <div className="bg-background border-b px-4 py-2">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/redgifs/trending" className="font-bold text-xl text-red-500 flex items-center gap-2">
            RedGifs
            {isAuthenticated ? (
              <Shield className="h-4 w-4 text-green-500" />
            ) : (
              <ShieldAlert className="h-4 w-4 text-red-500" />
            )}
          </Link>
          <nav className="hidden md:flex items-center gap-2">
            <Button variant="ghost" asChild disabled={!isAuthenticated}>
              <Link to="/redgifs/trending">Trending</Link>
            </Button>
            <Button variant="ghost" asChild disabled={!isAuthenticated}>
              <Link to="/redgifs/creators">Creators</Link>
            </Button>
            <Button variant="ghost" asChild disabled={!isAuthenticated}>
              <Link to="/redgifs/niches">Niches</Link>
            </Button>
          </nav>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Header Input */}
          <HeaderInput onHeadersSet={handleHeadersSet} />
          
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 w-64"
              disabled={!isAuthenticated}
            />
          </div>
          
          {/* Quality Toggle */}
          <ToggleGroup
            type="single"
            value={quality}
            onValueChange={(value) => value && setQuality(value as 'sd' | 'hd')}
            variant="outline"
            disabled={!isAuthenticated}
          >
            <ToggleGroupItem value="sd" aria-label="SD Quality">
              <WifiLow className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="hd" aria-label="HD Quality">
              <WifiHigh className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
          
          {/* View Mode Toggle */}
          <ToggleGroup
            type="single"
            value={viewMode}
            onValueChange={(value) => value && setViewMode(value as any)}
            variant="outline"
            disabled={!isAuthenticated}
          >
            <ToggleGroupItem value="grid" aria-label="Grid View">
              <Grid3X3 className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="reels" aria-label="Reels Mode">
              <PlaySquare className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="tiktok" aria-label="TikTok Mode">
              <Smartphone className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="tv" aria-label="TV Mode">
              <Tv className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
          
          {/* Settings */}
          <Button variant="ghost" size="icon" onClick={onSettingsClick}>
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}