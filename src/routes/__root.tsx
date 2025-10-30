// src/routes/__root.tsx
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import BaseLayout from "@/layouts/BaseLayout";
import { Outlet, createRootRoute, ErrorComponent } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Toaster } from 'sonner'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw } from 'lucide-react'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 3,
    },
  },
});

function Root() {
  return (
    <QueryClientProvider client={queryClient}>
      <BaseLayout>
        <Outlet />
        {/* Uncomment the following line to enable the router devtools */}
        <TanStackRouterDevtools />
        <ReactQueryDevtools initialIsOpen={false} />
        <Toaster position="top-right" />
      </BaseLayout>
    </QueryClientProvider>
  );
}

export const Route = createRootRoute({
  component: Root,
  errorComponent: ({ error }) => (
    <div className="flex items-center justify-center h-screen">
      <div className="max-w-md p-6 bg-background rounded-lg shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="h-6 w-6 text-red-500" />
          <h1 className="text-xl font-bold">Something went wrong</h1>
        </div>
        <p className="text-muted-foreground mb-4">
          {error.message || 'An unexpected error occurred'}
        </p>
        <Button onClick={() => window.location.reload()} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Reload
        </Button>
      </div>
    </div>
  ),
});