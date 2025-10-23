// src/components/redgifs/ErrorBoundary.tsx
import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface ErrorBoundaryProps {
  error: Error
  resetErrorBoundary: () => void
}

export function ErrorBoundary({ error, resetErrorBoundary }: ErrorBoundaryProps) {
  return (
    <div className="flex items-center justify-center h-full">
      <Card className="w-96">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Something went wrong
          </CardTitle>
          <CardDescription>
            {error.message || 'Failed to load content from RedGifs'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button onClick={resetErrorBoundary} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Try again
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}