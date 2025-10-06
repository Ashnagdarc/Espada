// Simple in-memory cache for admin data
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class Cache {
  private cache = new Map<string, CacheEntry<unknown>>();

  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void { // Default 5 minutes
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if cache entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

export const cache = new Cache();

// Cache keys
export const CACHE_KEYS = {
  ANALYTICS: (timeRange: string) => `analytics:${timeRange}`,
  ORDERS: (page: number, status: string) => `orders:${page}:${status}`,
  CUSTOMERS: (page: number, search: string, status: string) => `customers:${page}:${search}:${status}`,
  SETTINGS: 'admin:settings',
  PRODUCTS: (page: number) => `products:${page}`
};

// Cache TTL values (in milliseconds)
export const CACHE_TTL = {
  ANALYTICS: 2 * 60 * 1000, // 2 minutes
  ORDERS: 1 * 60 * 1000, // 1 minute
  CUSTOMERS: 5 * 60 * 1000, // 5 minutes
  SETTINGS: 10 * 60 * 1000, // 10 minutes
  PRODUCTS: 5 * 60 * 1000 // 5 minutes
};