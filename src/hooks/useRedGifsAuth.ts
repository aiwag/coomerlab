// src/hooks/useRedGifsAuth.ts
import { useState, useEffect } from 'react'
import { toast } from 'sonner'

export function useRedGifsAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(true) // Default to true for now
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  
  const authenticate = async () => {
    setIsAuthenticating(true)
    try {
      // For now, we'll just simulate authentication
      // In a real app, you would implement proper OAuth flow
      await new Promise(resolve => setTimeout(resolve, 1000))
      setIsAuthenticated(true)
      toast.success('Connected to RedGifs')
    } catch (error) {
      console.error('Authentication failed:', error)
      toast.error('Failed to connect to RedGifs')
    } finally {
      setIsAuthenticating(false)
    }
  }
  
  useEffect(() => {
    // Try to authenticate on mount
    authenticate()
  }, [])
  
  return {
    isAuthenticated,
    isAuthenticating,
    authenticate
  }
}