/**
 * Cache Utilities
 *
 * This module provides utilities for client-side caching using localStorage.
 * It handles storing, retrieving, and validating cached data to reduce API calls.
 *
 * Key functions:
 * - getCachedData: Retrieves data from cache if available and valid
 * - setCachedData: Stores data in cache with timestamp
 * - clearCache: Removes specific or all cached items
 *
 * The default cache expiration is 5 minutes, which balances freshness with performance.
 */

// Cache keys
export const CACHE_KEYS = {
  MENU_ANALYTICS: "menu-analytics",
  VOLUME_DATA: "volume-data",
  TIMELINE_DATA: "timeline-data",
};

// Cache expiration time (5 minutes in milliseconds)
const CACHE_EXPIRATION = 5 * 60 * 1000;

interface CachedItem<T> {
  data: T;
  timestamp: number;
}

/**
 * Get data from cache if it exists and hasn't expired
 */
export function getCachedData<T>(
  key: string,
  expirationTime = CACHE_EXPIRATION
): T | null {
  // Only run in browser environment
  if (typeof window === "undefined") return null;

  try {
    const cachedItemStr = localStorage.getItem(key);
    if (!cachedItemStr) return null;

    const cachedItem: CachedItem<T> = JSON.parse(cachedItemStr);
    const now = Date.now();

    // Check if cache has expired
    if (now - cachedItem.timestamp > expirationTime) {
      localStorage.removeItem(key);
      return null;
    }

    return cachedItem.data;
  } catch (error) {
    console.error("Error retrieving from cache:", error);
    return null;
  }
}

/**
 * Store data in cache with current timestamp
 */
export function setCachedData<T>(key: string, data: T): void {
  // Only run in browser environment
  if (typeof window === "undefined") return;

  try {
    const cacheItem: CachedItem<T> = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(key, JSON.stringify(cacheItem));
  } catch (error) {
    console.error("Error setting cache:", error);
  }
}

/**
 * Clear specific cache or all caches
 */
export function clearCache(key?: string): void {
  // Only run in browser environment
  if (typeof window === "undefined") return;

  try {
    if (key) {
      localStorage.removeItem(key);
    } else {
      // Clear all application cache keys
      Object.values(CACHE_KEYS).forEach((cacheKey) => {
        localStorage.removeItem(cacheKey);
      });
    }
  } catch (error) {
    console.error("Error clearing cache:", error);
  }
}
