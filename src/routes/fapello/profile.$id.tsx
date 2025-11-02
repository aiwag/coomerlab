// src/routes/fapello/profile.$id.tsx
import { createFileRoute } from '@tanstack/react-router';
import FapelloProfile from '../../components/FapelloProfile';

export const Route = createFileRoute('/fapello/profile/$id')({
  component: FapelloProfile,
});