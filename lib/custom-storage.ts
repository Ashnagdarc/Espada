// Custom storage adapter for Supabase with enhanced debugging and reliability

export interface StorageAdapter {
  getItem: (key: string) => string | null | Promise<string | null>
  setItem: (key: string, value: string) => void | Promise<void>
  removeItem: (key: string) => void | Promise<void>
}

class DebugLocalStorage implements StorageAdapter {
  private prefix = '[Espada Storage]';

  getItem(key: string): string | null {
    try {
      const value = localStorage.getItem(key);
      console.log(`${this.prefix} GET ${key}:`, {
        hasValue: !!value,
        valueLength: value?.length || 0,
        valuePreview: value ? value.substring(0, 50) + '...' : null
      });
      return value;
    } catch (error) {
      console.error(`${this.prefix} GET ERROR for ${key}:`, error);
      return null;
    }
  }

  setItem(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
      console.log(`${this.prefix} SET ${key}:`, {
        valueLength: value.length,
        success: true,
        timestamp: new Date().toISOString()
      });
      
      // Immediately verify the storage
      const verification = localStorage.getItem(key);
      if (verification !== value) {
        console.error(`${this.prefix} VERIFICATION FAILED for ${key}:`, {
          expected: value.substring(0, 50),
          actual: verification?.substring(0, 50)
        });
      } else {
        console.log(`${this.prefix} VERIFICATION SUCCESS for ${key}`);
      }
    } catch (error) {
      console.error(`${this.prefix} SET ERROR for ${key}:`, error);
    }
  }

  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
      console.log(`${this.prefix} REMOVE ${key}: success`);
    } catch (error) {
      console.error(`${this.prefix} REMOVE ERROR for ${key}:`, error);
    }
  }
}

// Create a singleton instance
export const debugStorage = new DebugLocalStorage();

// Fallback storage for SSR
export const createStorageAdapter = (): StorageAdapter => {
  if (typeof window !== 'undefined') {
    return debugStorage;
  }
  
  // Server-side fallback
  return {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {}
  };
};