// src/routes/redgifs/niches.tsx
import { createFileRoute } from '@tanstack/react-router'
import { NichesView } from '@/components/redgifs/views/NichesView'

export const Route = createFileRoute('/redgifs/niches')({
  component: NichesView,
})