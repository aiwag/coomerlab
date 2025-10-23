// src/routes/redgifs/niche/$nicheId.tsx
import { createFileRoute } from '@tanstack/react-router'
import { NicheView } from '@/components/redgifs/views/NicheView'

export const Route = createFileRoute('/redgifs/niche/$nicheId')({
  component: NicheView,
})