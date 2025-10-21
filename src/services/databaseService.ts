class DatabaseService {
  private isInitialized = false;

  public async init() {
    if (this.isInitialized) return;
    this.isInitialized = true;
  }

  private get<T>(key: string, fallback: T): T {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch (error) {
      console.error(`Failed to read from localStorage with key "${key}"`, error);
      return fallback;
    }
  }

  private set(key: string, value: any): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Failed to write to localStorage with key "${key}"`, error);
    }
  }

  // --- METHODS FOR GRID STORE ---

  /**
   * This is the critical fix. It is now guaranteed to ALWAYS return a string array.
   */
  public async getViewArrangement(key: string): Promise<string[]> {
    return this.get<string[]>(key, []); // Use the fallback to return an empty array if null
  }

  public async setViewArrangement(key: string, arrangement: string[]): Promise<void> {
    this.set(key, arrangement);
  }
}

// Export a singleton instance for use across the app
export const dbService = new DatabaseService();