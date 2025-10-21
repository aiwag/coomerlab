import { create } from 'zustand';

interface SearchResult {
  type: 'page' | 'streamer' | 'action';
  title: string;
  description?: string;
  to?: string; // URL for linking
  action?: () => void; // Function to execute
}

interface SearchState {
  query: string;
  results: SearchResult[];
  isOpen: boolean;
  setQuery: (query: string) => void;
  setIsOpen: (isOpen: boolean) => void;
}

// --- Sample Data & Search Logic ---
const allMenuItems = [
  { type: 'page', title: 'Home', to: '/' },
  { type: 'page', title: 'Cam Viewer', to: '/camviewer' },
  { type: 'page', title: 'Downloads', to: '/downloads' },
  { type: 'page', title: 'Favorites', to: '/favorites' },
];

const performSearch = (query: string): SearchResult[] => {
    if (!query) return [];
    const lowerQuery = query.toLowerCase();
    
    const pageResults = allMenuItems.filter(item => item.title.toLowerCase().includes(lowerQuery));
    
    // In a real app, you would get this from useBrowserStore.getState().streamers
    const streamerResults: SearchResult[] = [
        { type: 'streamer', title: 'cutegirl', description: 'Now online!', to: '/camviewer' },
        { type: 'streamer', title: 'another_model', description: 'Offline', to: '/camviewer' },
    ].filter(s => s.title.toLowerCase().includes(lowerQuery));

    return [...pageResults, ...streamerResults];
};

export const useSearchStore = create<SearchState>((set, get) => ({
  query: '',
  results: [],
  isOpen: false,
  
  setQuery: (query) => {
    set({ query, results: performSearch(query), isOpen: !!query });
  },

  setIsOpen: (isOpen) => set({ isOpen }),
}));