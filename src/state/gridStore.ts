import { create } from 'zustand';
import { arrayMove } from '@dnd-kit/sortable';
import { dbService } from '@/services/databaseService'; // We'll create this next

interface GridState {
  streamUrls: string[];
  activeId: string | null;
  favorites: Set<number>;
  mutedStreams: Set<number>;
  playingStreams: Set<number>;
  streamStatus: Record<number, { online: boolean; lastSeen: number }>;
  fullViewMode: number | null;
  fullscreenStream: { url: string; username: string } | null;

  // Actions
  initializeStreams: () => Promise<void>;
  addStream: (url: string) => Promise<void>;
  removeStream: (index: number) => Promise<void>;
  handleDragStart: (event: any) => void;
  handleDragEnd: (event: any) => Promise<void>;
  toggleFavorite: (index: number) => void;
  toggleMute: (index: number) => void;
  setPlaying: (index: number, isPlaying: boolean) => void;
  updateStreamStatus: (index: number, online: boolean) => void;
  setFullViewMode: (index: number | null) => void;
  setFullscreenStream: (stream: { url: string; username: string } | null) => void;
}

export const useGridStore = create<GridState>((set, get) => ({
  streamUrls: [],
  activeId: null,
  favorites: new Set(),
  mutedStreams: new Set(),
  playingStreams: new Set(),
  streamStatus: {},
  fullViewMode: null,
  fullscreenStream: null,
  
  initializeStreams: async () => {
    await dbService.init();
    const defaultStreams = await fetch("/streams.json").then((res) => res.json());
    const customStreams = await dbService.getCustomStreams();
    const removedStreams = await dbService.getRemovedStreams();
    const viewArrangement = await dbService.getViewArrangement();
    const savedFavorites = await dbService.getFavorites();

    let allStreams = [...defaultStreams, ...customStreams].filter(url => !removedStreams.includes(url));
    let finalUrls = allStreams;

    if (viewArrangement.streamOrder?.length > 0) {
      const ordered = viewArrangement.streamOrder
        .filter(url => allStreams.includes(url));
      const newStreams = allStreams.filter(url => !viewArrangement.streamOrder.includes(url));
      finalUrls = [...ordered, ...newStreams];
    }
    
    set({ streamUrls: finalUrls, favorites: new Set(savedFavorites) });
  },

  addStream: async (url) => {
    if (get().streamUrls.includes(url)) {
      console.warn('Stream already exists');
      // Here you would call a notification service
      return;
    }
    const newUrls = [...get().streamUrls, url];
    set({ streamUrls: newUrls });
    await dbService.addCustomStream(url);
    await dbService.setViewArrangement({ ...await dbService.getViewArrangement(), streamOrder: newUrls });
  },
  
  removeStream: async (index) => {
    const urlToRemove = get().streamUrls[index];
    const newUrls = get().streamUrls.filter((_, i) => i !== index);
    set({ streamUrls: newUrls });
    await dbService.removeStream(urlToRemove);
    await dbService.setViewArrangement({ ...await dbService.getViewArrangement(), streamOrder: newUrls });
  },

  handleDragStart: (event) => set({ activeId: event.active.id }),
  
  handleDragEnd: async (event) => {
    const { active, over } = event;
    set({ activeId: null });
    if (over && active.id !== over.id) {
      const oldIndex = get().streamUrls.findIndex(url => url === active.id);
      const newIndex = get().streamUrls.findIndex(url => url === over.id);
      const newUrls = arrayMove(get().streamUrls, oldIndex, newIndex);
      set({ streamUrls: newUrls });
      await dbService.setViewArrangement({ ...await dbService.getViewArrangement(), streamOrder: newUrls });
    }
  },

  toggleFavorite: (index) => {
    const newFavorites = new Set(get().favorites);
    if (newFavorites.has(index)) {
      newFavorites.delete(index);
    } else {
      newFavorites.add(index);
    }
    set({ favorites: newFavorites });
    dbService.setFavorites(Array.from(newFavorites));
  },
  
  toggleMute: (index) => {
    const newMuted = new Set(get().mutedStreams);
    if (newMuted.has(index)) newMuted.delete(index);
    else newMuted.add(index);
    set({ mutedStreams: newMuted });
  },
  
  setPlaying: (index, isPlaying) => {
    const newPlaying = new Set(get().playingStreams);
    if (isPlaying) newPlaying.add(index);
    else newPlaying.delete(index);
    set({ playingStreams: newPlaying });
  },

  updateStreamStatus: (index, online) => {
    set(state => ({
      streamStatus: {
        ...state.streamStatus,
        [index]: { online, lastSeen: Date.now() },
      }
    }));
  },
  
  setFullViewMode: (index) => set({ fullViewMode: index }),
  setFullscreenStream: (stream) => set({ fullscreenStream: stream }),
}));