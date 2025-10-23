// src/components/redgifs/RedGifsSettings.tsx
import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRedGifsStore } from '@/stores/redgifs'
import { useSearchCreators } from '@/hooks/useRedGifs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Link } from '@tanstack/react-router'
import { HeaderInput } from './HeaderInput'
import { useQueryClient } from '@tanstack/react-query'

interface RedGifsSettingsProps {
  open: boolean
  onClose: () => void
}

export function RedGifsSettings({ open, onClose }: RedGifsSettingsProps) {
  const { 
    quality, 
    setQuality, 
    viewMode, 
    setViewMode, 
    autoplay, 
    setAutoplay, 
    soundEnabled, 
    setSoundEnabled 
  } = useRedGifsStore()
  
  const [searchQuery, setSearchQuery] = useState('')
  const { data: searchResults, isLoading } = useSearchCreators(searchQuery, searchQuery.length > 2)
  const queryClient = useQueryClient()
  
  const handleHeadersSet = () => {
    // Invalidate all queries to refresh data with new headers
    queryClient.invalidateQueries({ queryKey: ['redgifs'] })
  }
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* API Authentication */}
          <div className="space-y-3">
            <Label className="text-base font-medium">API Authentication</Label>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Import headers from RedGifs cURL command
              </span>
              <HeaderInput onHeadersSet={handleHeadersSet} />
            </div>
          </div>
          
          {/* Quality Settings */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Quality</Label>
            <div className="flex gap-2">
              <Button
                variant={quality === 'sd' ? 'default' : 'outline'}
                onClick={() => setQuality('sd')}
                className="flex-1"
              >
                SD (Standard)
              </Button>
              <Button
                variant={quality === 'hd' ? 'default' : 'outline'}
                onClick={() => setQuality('hd')}
                className="flex-1"
              >
                HD (High)
              </Button>
            </div>
          </div>
          
          {/* View Mode Settings */}
          <div className="space-y-3">
            <Label className="text-base font-medium">View Mode</Label>
            <div className="grid grid-cols-2 gap-2">
              {(['grid', 'reels', 'tiktok', 'tv'] as const).map((mode) => (
                <Button
                  key={mode}
                  variant={viewMode === mode ? 'default' : 'outline'}
                  onClick={() => setViewMode(mode)}
                  className="capitalize"
                >
                  {mode}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Playback Settings */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Playback</Label>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="autoplay">Autoplay</Label>
                <Switch
                  id="autoplay"
                  checked={autoplay}
                  onCheckedChange={setAutoplay}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="sound">Sound</Label>
                <Switch
                  id="sound"
                  checked={soundEnabled}
                  onCheckedChange={setSoundEnabled}
                />
              </div>
            </div>
          </div>
          
          {/* Search Creators */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Search Creators</Label>
            <Input
              placeholder="Search for creators..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            
            {searchResults?.users && (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {searchResults.users.map((user) => (
                  <Link
                    key={user.username}
                    to="/redgifs/user/$username"
                    params={{ username: user.username }}
                    onClick={onClose}
                  >
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors cursor-pointer">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.profileImageUrl} alt={user.name} />
                        <AvatarFallback>{user.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{user.name}</p>
                        <p className="text-sm text-muted-foreground truncate">@{user.username}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}