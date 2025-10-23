// src/components/redgifs/RedGifsLayout.tsx
import React, { useState } from 'react'
import { Outlet } from '@tanstack/react-router'
import { RedGifsNav } from './RedGifsNav'
import { RedGifsSettings } from './RedGifsSettings'
import { AuthRequired } from './AuthRequired'
import { RedGifsProvider } from './RedGifsContext'

export function RedGifsLayout() {
  const [showSettings, setShowSettings] = useState(false)
  
  return (
    <RedGifsProvider>
      <div className="flex flex-col h-screen bg-background">
        <RedGifsNav onSettingsClick={() => setShowSettings(true)} />
        <div className="flex-1 overflow-hidden">
          <AuthRequired>
            <Outlet />
          </AuthRequired>
        </div>
        <RedGifsSettings open={showSettings} onClose={() => setShowSettings(false)} />
      </div>
    </RedGifsProvider>
  )
}