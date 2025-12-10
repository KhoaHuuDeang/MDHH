'use client'

import { useState, useEffect } from 'react'
import { csrAxiosClient } from '@/utils/axiosClient'

/**
 * useCartCount - Fetch and track cart item count
 * - Fetches count on mount
 * - Listens to cartUpdated event for real-time sync
 * - No polling - only event-driven updates
 */
export default function useCartCount() {
  const [count, setCount] = useState(0)

  const fetchCount = async () => {
    try {
      const res = await csrAxiosClient.get('/cart/count')
      setCount(res.data.result?.count || 0)
    } catch (err) {
      console.error('[useCartCount] Failed to fetch cart count:', err)
    }
  }

  useEffect(() => {
    // Fetch count on mount
    fetchCount()

    // Listen for cart updates from other components
    // (fired when user adds/removes items from shop or cart page)
    const handleCartUpdate = () => {
      console.debug('[useCartCount] cartUpdated event received, refetching count')
      fetchCount()
    }

    window.addEventListener('cartUpdated', handleCartUpdate)

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate)
    }
  }, [])

  // Clear count when navigating to cart (user has seen the notification)
  const clearCount = () => setCount(0)

  return { count, refetch: fetchCount, clear: clearCount }
}
