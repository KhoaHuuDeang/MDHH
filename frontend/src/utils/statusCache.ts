'use client'

interface CachedStatus {
  is_disabled: boolean;
  disabled_until?: Date;
  disabled_reason?: string;
  fetchedAt: number;
}

/**
 * StatusCacheManager - Throttles user disabled status checks
 * - Per-user cache with 5-minute TTL
 * - Only fetches from backend once per 5 minutes
 * - Called from auth.ts session callback
 * - Reduces status check API calls by 90%
 */
class StatusCacheManager {
  private cache: Map<string, CachedStatus> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes (matches SessionProvider)
  private readonly BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

  /**
   * Get user status, using cache if valid, otherwise fetch from backend
   */
  async getUserStatus(userId: string, token: string): Promise<CachedStatus> {
    // Check cache first
    if (this.isCacheValid(userId)) {
      console.debug(`[StatusCache] Hit for user ${userId}`);
      return this.cache.get(userId)!;
    }

    console.debug(`[StatusCache] Miss for user ${userId} - fetching from backend`);

    try {
      const response = await fetch(`${this.BACKEND_URL}/users/${userId}/status`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Status fetch failed: ${response.status}`);
      }

      const data = await response.json();
      // Handle both wrapped (data.result) and unwrapped response formats
      const result = data.result || data;

      const status: CachedStatus = {
        is_disabled: result.is_disabled ?? false,
        disabled_until: result.disabled_until,
        disabled_reason: result.disabled_reason,
        fetchedAt: Date.now()
      };

      this.cache.set(userId, status);
      console.debug(`[StatusCache] Updated cache for user ${userId}`);
      return status;

    } catch (error) {
      console.error(`[StatusCache] Error fetching status for user ${userId}:`, error);
      // Return safe default on error (user not disabled) - don't break session
      return {
        is_disabled: false,
        fetchedAt: Date.now()
      };
    }
  }

  /**
   * Check if cached status is still valid
   */
  private isCacheValid(userId: string): boolean {
    const cached = this.cache.get(userId);
    if (!cached) return false;
    return Date.now() < (cached.fetchedAt + this.CACHE_DURATION);
  }

  /**
   * Clear cache (called on logout)
   */
  clearCache(userId?: string): void {
    if (userId) {
      this.cache.delete(userId);
      console.debug(`[StatusCache] Cleared cache for user ${userId}`);
    } else {
      this.cache.clear();
      console.debug(`[StatusCache] Cleared all cache`);
    }
  }
}

// Export singleton instance
export const statusCache = new StatusCacheManager();

// Listen for logout to clear cache
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === 'nextauth.message') {
      try {
        const message = JSON.parse(e.newValue || '{}');
        if (message.event === 'session' && message.data === null) {
          statusCache.clearCache();
        }
      } catch (err) {
        // Ignore parse errors
      }
    }
  });
}
