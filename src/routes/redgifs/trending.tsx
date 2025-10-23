// src/routes/redgifs/trending.tsx
import { createFileRoute } from '@tanstack/react-router'
import { TrendingView } from '@/components/redgifs/views/TrendingView'

export const Route = createFileRoute('/redgifs/trending')({
  component: TrendingView,
})