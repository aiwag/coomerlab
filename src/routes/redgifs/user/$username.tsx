// src/routes/redgifs/user/$username.tsx
import { createFileRoute } from '@tanstack/react-router'
import { UserView } from '@/components/redgifs/views/UserView'

export const Route = createFileRoute('/redgifs/user/$username')({
  component: UserView,
})