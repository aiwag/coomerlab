// src/routes/fapello.tsx
import { createFileRoute } from '@tanstack/react-router';
import FapelloTrending from '@/components/FapelloTrending';

export const Route = createFileRoute('/fapello')({
  component: FapelloTrending,
});