// A simplified singleton pattern for the database service
class DatabaseService {
  private isInitialized = false;

  async init() {
    if (this.isInitialized) return;
    // In a real app, you might initialize an IndexedDB connection here.
    // For now, we assume localStorage is available.
    this.isInitialized = true;
  }

  private get(key: string): any {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  }

  private set(key: string, value: any): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  // Methods for data Zustand's persist doesn't handle as well
  async getCustomStreams(): Promise<string[]> {
    return this.get("customStreams") || [];
  }

  async addCustomStream(url: string): Promise<void> {
    const streams = await this.getCustomStreams();
    if (!streams.includes(url)) {
      this.set("customStreams", [...streams, url]);
    }
  }

  async getRemovedStreams(): Promise<string[]> {
    return this.get("removedStreams") || [];
  }

  async removeStream(url: string): Promise<void> {
    const customStreams = await this.getCustomStreams();
    this.set(
      "customStreams",
      customStreams.filter((s) => s !== url),
    );

    const removedStreams = await this.getRemovedStreams();
    if (!removedStreams.includes(url)) {
      this.set("removedStreams", [...removedStreams, url]);
    }
  }

  async getViewArrangement(): Promise<any> {
    return this.get("viewArrangement") || { streamOrder: [] };
  }

  async setViewArrangement(arrangement: any): Promise<void> {
    this.set("viewArrangement", arrangement);
  }

  // Favorites are now handled by this service to keep logic consistent
  async getFavorites(): Promise<number[]> {
    return this.get("favorites") || [];
  }

  async setFavorites(favorites: number[]): Promise<void> {
    this.set("favorites", favorites);
  }
}

export const dbService = new DatabaseService();
