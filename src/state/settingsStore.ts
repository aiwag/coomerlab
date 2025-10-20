import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingsState {
  sidebarVisible: boolean;
  sidebarCollapsed: boolean;
  gridSize: number;
  autoMode: boolean;
  gridMode: "standard" | "professional";
  bandwidthMode: "low" | "medium" | "high";
  showOffline: boolean;
  browserVisible: boolean;
  browserExpanded: boolean;
  browserWidth: number;

  // Actions
  toggleSidebar: () => void;
  toggleSidebarCollapse: () => void;
  setGridSize: (size: number) => void;
  setAutoMode: (auto: boolean) => void;
  setGridMode: (mode: "standard" | "professional") => void;
  setBandwidthMode: (mode: "low" | "medium" | "high") => void;
  setShowOffline: (show: boolean) => void;
  setBrowserVisible: (visible: boolean) => void;
  toggleBrowserExpanded: () => void;
  setBrowserWidth: (width: number) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      sidebarVisible: true,
      sidebarCollapsed: false,
      gridSize: 2,
      autoMode: false,
      gridMode: "standard",
      bandwidthMode: "medium",
      showOffline: true,
      browserVisible: true,
      browserExpanded: false,
      browserWidth: 320,

      toggleSidebar: () =>
        set((state) => ({ sidebarVisible: !state.sidebarVisible })),
      toggleSidebarCollapse: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setGridSize: (size) => set({ gridSize: size, autoMode: false }),
      setAutoMode: (auto) => set({ autoMode: auto }),
      setGridMode: (mode) => set({ gridMode: mode }),
      setBandwidthMode: (mode) => set({ bandwidthMode: mode }),
      setShowOffline: (show) => set({ showOffline: show }),
      setBrowserVisible: (visible) => set({ browserVisible: visible }),
      toggleBrowserExpanded: () =>
        set((state) => ({ browserExpanded: !state.browserExpanded })),
      setBrowserWidth: (width) => set({ browserWidth: width }),
    }),
    {
      name: "camviewer-settings-storage", // The key in localStorage
    },
  ),
);
