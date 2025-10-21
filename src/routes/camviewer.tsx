import { createFileRoute } from '@tanstack/react-router';
import React, { useEffect } from 'react';
import { useGridStore } from '@/state/gridStore';
import { useSettingsStore } from '@/state/settingsStore';
import { StreamListSidebar } from '@/components/camviewer/StreamListSidebar';
import { StreamBrowserSidebar } from '@/components/camviewer/browser/StreamBrowserSidebar';
import { StreamGrid } from '@/components/camviewer/grid/StreamGrid';
import { FullViewLayout } from '@/components/camviewer/FullViewLayout';
import { FullscreenModal } from '@/components/camviewer/FullscreenModal';

function CamViewerPage() {
  const initializeStreams = useGridStore((state) => state.initializeStreams);
  const fullViewMode = useGridStore((state) => state.fullViewMode);
  const browserVisible = useSettingsStore((state) => state.browserVisible);

  useEffect(() => {
    // This effect runs once on mount to load initial data
    initializeStreams();
  }, [initializeStreams]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-neutral-900 text-white">
      {browserVisible && <StreamBrowserSidebar />}
      <StreamListSidebar />
      <main className="flex-1 overflow-hidden bg-black">
        {fullViewMode !== null ? <FullViewLayout /> : <StreamGrid />}
      </main>
      <FullscreenModal />
    </div>
  );
}

export const Route = createFileRoute('/camviewer')({
  component: CamViewerPage,
});