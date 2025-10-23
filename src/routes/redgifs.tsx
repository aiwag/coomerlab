// src/routes/redgifs.tsx
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { RedGifsLayout } from '@/components/redgifs/RedGifsLayout'

export const Route = createFileRoute('/redgifs')({
  component: () => (
    <RedGifsLayout>
      <Outlet />
    </RedGifsLayout>
  ),
})