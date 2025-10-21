// import { create } from 'zustand';
// import { persist } from 'zustand/middleware';

// export type LayoutMode = 'magic' | 'hierarchical' | 2 | 3 | 4;

// interface SettingsState {
//   sidebarVisible: boolean;
//   sidebarCollapsed: boolean;
//   layoutMode: LayoutMode;
//   browserVisible: boolean;
  
//   toggleSidebar: () => void;
//   toggleSidebarCollapse: () => void;
//   setLayoutMode: (mode: LayoutMode) => void;
//   setBrowserVisible: (visible: boolean) => void;
// }

// export const useSettingsStore = create<SettingsState>()(
//   persist(
//     (set) => ({
//       sidebarVisible: true,
//       sidebarCollapsed: false,
//       layoutMode: 'magic', // Intelligent "Magic Grid" is the default
//       browserVisible: true,
      
//       toggleSidebar: () => set((state) => ({ sidebarVisible: !state.sidebarVisible })),
//       toggleSidebarCollapse: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
//       setLayoutMode: (mode) => set({ layoutMode: mode }),
//       setBrowserVisible: (visible) => set({ browserVisible: visible }),
//     }),
//     {
//       name: 'camviewer-settings-storage-v8', // Version bump for new state
//     }
//   )
// );




import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type LayoutMode = 'magic' | 'hierarchical' | 2 | 3 | 4;

interface SettingsState {
  sidebarVisible: boolean;
  sidebarCollapsed: boolean;
  layoutMode: LayoutMode;
  browserVisible: boolean;
  
  toggleSidebar: () => void;
  toggleSidebarCollapse: () => void;
  setLayoutMode: (mode: LayoutMode) => void;
  setBrowserVisible: (visible: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      sidebarVisible: true,
      sidebarCollapsed: false,
      layoutMode: 'magic', // Intelligent "Magic Grid" is the default
      browserVisible: true,
      
      toggleSidebar: () => set((state) => ({ sidebarVisible: !state.sidebarVisible })),
      toggleSidebarCollapse: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setLayoutMode: (mode) => set({ layoutMode: mode }),
      setBrowserVisible: (visible) => set({ browserVisible: visible }),
    }),
    {
      name: 'camviewer-settings-storage-v8',
    }
  )
);