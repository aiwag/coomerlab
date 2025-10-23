// src/routes/redgifs/creators.tsx
import { createFileRoute } from '@tanstack/react-router'
import { CreatorsView } from '@/components/redgifs/views/CreatorsView'

export const Route = createFileRoute('/redgifs/creators')({
  component: CreatorsView,
})