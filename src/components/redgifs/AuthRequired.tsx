// src/components/redgifs/AuthRequired.tsx
import React from 'react'
import { useRedGifsAuth } from '@/hooks/useRedGifsAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, AlertCircle, Info } from 'lucide-react'

interface AuthRequiredProps {
  children: React.ReactNode
}

export function AuthRequired({ children }: AuthRequiredProps) {
  const { isAuthenticated, isAuthenticating, authenticate } = useRedGifsAuth()
  
  if (isAuthenticating) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-96">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Connecting
            </CardTitle>
            <CardDescription>
              Connecting to RedGifs API...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }
  
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-96">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Connection Required
            </CardTitle>
            <CardDescription>
              You need to connect to RedGifs to view content.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={authenticate}>
              Connect to RedGifs
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  return (
    <div className="relative h-full">
      {children}
      <div className="absolute bottom-4 right-4 bg-yellow-100 dark:bg-yellow-900 p-2 rounded-md max-w-xs">
        <div className="flex items-start gap-2">
          <Info className="h-4 w-4 text-yellow-800 dark:text-yellow-200 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-yellow-800 dark:text-yellow-200">
            This is a demo app. Some features may be limited due to API restrictions.
          </p>
        </div>
      </div>
    </div>
  )
}