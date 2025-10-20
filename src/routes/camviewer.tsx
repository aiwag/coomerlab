import { createFileRoute } from "@tanstack/react-router";
import React, { useEffect } from "react";

import { useGridStore } from "@/state/gridStore";
import { useSettingsStore } from "@/state/settingsStore";
import { CompactToolbar } from "@/components/camviewer/CompactToolbar";
import { StreamListSidebar } from "@/components/camviewer/StreamListSidebar";
import { StreamBrowserSidebar } from "@/components/camviewer/browser/StreamBrowserSidebar";
import { StreamGrid } from "@/components/camviewer/grid/StreamGrid";
import { FullViewLayout } from "@/components/camviewer/FullViewLayout";
import { FullscreenModal } from "@/components/camviewer/FullscreenModal";

function CamViewerPage() {
  const initializeStreams = useGridStore((state) => state.initializeStreams);
  const fullViewMode = useGridStore((state) => state.fullViewMode);
  const browserVisible = useSettingsStore((state) => state.browserVisible);

  // Initialize streams from database on component mount
  useEffect(() => {
    initializeStreams();
  }, [initializeStreams]);

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-neutral-900 text-white">
      <CompactToolbar />
      <div className="flex flex-1 overflow-hidden">
        {browserVisible && <StreamBrowserSidebar />}
        <StreamListSidebar />
        <main className="flex-1 overflow-hidden">
          {fullViewMode !== null ? <FullViewLayout /> : <StreamGrid />}
        </main>
      </div>
      <FullscreenModal />
    </div>
  );
}

export const Route = createFileRoute("/camviewer")({
  component: CamViewerPage,
});
