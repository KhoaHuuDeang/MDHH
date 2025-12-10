'use client'

import { getSession } from 'next-auth/react';

interface CachedToken {
  token: string;
  expiresAt: number;
}

/**
 * TokenCacheManager - Caches access token to reduce getSession() calls
 * - 5-minute cache duration (matches SessionProvider refetchInterval)
 * - Auto-clears on logout (listens to storage events)
 * - Used by axios interceptor and services
 */
class TokenCacheManager {
  private cache: CachedToken | null = null;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  async getToken(): Promise<string> {
    // Return cached token if valid
    if (this.isCacheValid()) {
      console.debug('[TokenCache] Hit - using cached token');
      return this.cache!.token;
    }

    console.debug('[TokenCache] Miss - fetching fresh token');

    // Cache miss or expired - fetch fresh session
    const session = await getSession();
    const token = session?.accessToken || '';

    if (token) {
      this.updateCache(token);
    }

    return token;
  }

  /**
   * Update cache with new token
   */
  updateCache(token: string): void {
    this.cache = {
      token,
      expiresAt: Date.now() + this.CACHE_DURATION
    };
    console.debug('[TokenCache] Updated cache, expires in 5 minutes');
  }

  /**
   * Clear cached token (called on logout)
   */
  clearCache(): void {
    this.cache = null;
    console.debug('[TokenCache] Cleared cache');
  }

  /**
   * Check if cached token is still valid
   */
  private isCacheValid(): boolean {
    return this.cache !== null && Date.now() < this.cache.expiresAt;
  }
}

// Export singleton instance
export const tokenCache = new TokenCacheManager();

// Listen for logout events to clear cache
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === 'nextauth.message') {
      try {
        const message = JSON.parse(e.newValue || '{}');
        // NextAuth sends event with event='session' and data=null on signout
        if (message.event === 'session' && message.data === null) {
          tokenCache.clearCache();
        }
      } catch (err) {
        // Ignore JSON parse errors
      }
    }
  });
}
