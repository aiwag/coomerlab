import { create } from "zustand";
import {
  getMostViewedRooms,
  searchRooms,
  getTopRatedRooms,
  getTrendingRooms,
  Streamer,
  CarouselGender,
} from "@/services/chaturbateApiService";

export type BrowseMode = "mostViewed" | "topRated" | "trending" | "search";

interface BrowserState {
  streamers: Streamer[];
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  hasMore: boolean;
  browseMode: BrowseMode;
  searchTerm: string;
  activeSearchQuery: string;
  carouselGender: CarouselGender;

  // Actions
  fetchStreamers: (isLoadMore?: boolean) => Promise<void>;
  setBrowseMode: (mode: BrowseMode) => void;
  setSearchTerm: (term: string) => void;
  executeSearch: (term: string) => void;
  setCarouselGender: (gender: CarouselGender) => void;
}

export const useBrowserStore = create<BrowserState>((set, get) => ({
  streamers: [],
  isLoading: false,
  error: null,
  currentPage: 1,
  hasMore: true,
  browseMode: "mostViewed",
  searchTerm: "",
  activeSearchQuery: "",
  carouselGender: "",

  fetchStreamers: async (isLoadMore = false) => {
    const state = get();
    if (state.isLoading) return;
    set({ isLoading: true, error: null });

    const pageToFetch = isLoadMore ? state.currentPage + 1 : 1;

    try {
      let response;
      const canPaginate =
        state.browseMode === "mostViewed" || state.browseMode === "search";

      if (!canPaginate && isLoadMore) {
        set({ isLoading: false, hasMore: false });
        return;
      }

      switch (state.browseMode) {
        case "search":
          if (!state.activeSearchQuery) {
            set({ isLoading: false, streamers: [], hasMore: false });
            return;
          }
          response = await searchRooms(state.activeSearchQuery, pageToFetch);
          break;
        case "topRated":
          response = await getTopRatedRooms(state.carouselGender);
          break;
        case "trending":
          response = await getTrendingRooms(state.carouselGender);
          break;
        case "mostViewed":
        default:
          response = await getMostViewedRooms(pageToFetch);
          break;
      }

      const newStreamers = isLoadMore
        ? [...state.streamers, ...response.rooms]
        : response.rooms;

      set({
        streamers: newStreamers,
        currentPage: pageToFetch,
        hasMore: canPaginate && response.rooms.length === response.limit,
      });
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ isLoading: false });
    }
  },

  setBrowseMode: (mode: BrowseMode) => {
    const canPaginate = mode === "mostViewed" || mode === "search";
    set({
      browseMode: mode,
      streamers: [],
      currentPage: 1,
      hasMore: canPaginate,
      error: null,
    });
    if (mode !== "search") {
      get().fetchStreamers();
    }
  },

  setSearchTerm: (term: string) => {
    set({ searchTerm: term });
  },

  executeSearch: (term: string) => {
    if (!term) {
      if (get().browseMode === "search") {
        get().setBrowseMode("mostViewed");
      }
      return;
    }
    set({
      browseMode: "search",
      activeSearchQuery: term,
      streamers: [],
      currentPage: 1,
      hasMore: true,
      error: null,
    });
    get().fetchStreamers();
  },

  setCarouselGender: (gender: CarouselGender) => {
    if (get().carouselGender === gender) return;
    set({
      carouselGender: gender,
      currentPage: 1,
      streamers: [],
      hasMore: false,
    });
    get().fetchStreamers();
  },
}));
