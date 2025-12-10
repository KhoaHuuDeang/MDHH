'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

export interface LayoutDimensions {
  viewport: {
    width: number
    height: number
  }
  header: {
    height: number
  }
  sidebar: {
    width: number
    isCollapsed: boolean
  }
  footer: {
    height: number
  }
  mainContent: {
    width: number
    height: number
    top: number
    left: number
  }
  breakpoint: 'mobile' | 'tablet' | 'desktop'
}

interface UseLayoutDimensionsOptions {
  headerRef?: React.RefObject<HTMLElement | null>
  sidebarRef?: React.RefObject<HTMLElement | null>
  footerRef?: React.RefObject<HTMLElement | null>
  sidebarCollapsedWidth?: number
  sidebarExpandedWidth?: number
}

/**
 * CPU-based layout dimensions calculator
 * Uses ResizeObserver and getBoundingClientRect for accurate measurements
 * NO GPU animations - pure CPU calculations
 */
export function useLayoutDimensions(options: UseLayoutDimensionsOptions = {}) {
  const {
    headerRef,
    sidebarRef,
    footerRef,
    sidebarCollapsedWidth = 80,
    sidebarExpandedWidth = 248,
  } = options

  const [dimensions, setDimensions] = useState<LayoutDimensions>({
    viewport: {
      width: typeof window !== 'undefined' ? window.innerWidth : 1920,
      height: typeof window !== 'undefined' ? window.innerHeight : 1080,
    },
    header: {
      height: 80, // Default estimate
    },
    sidebar: {
      width: sidebarExpandedWidth,
      isCollapsed: false,
    },
    footer: {
      height: 200, // Default estimate
    },
    mainContent: {
      width: 0,
      height: 0,
      top: 0,
      left: 0,
    },
    breakpoint: 'desktop',
  })

  // Performance optimization: debounce calculations
  const calculationTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const resizeObserverRef = useRef<ResizeObserver | null>(null)

  // CPU-based dimension calculation
  const calculateDimensions = useCallback(() => {
    if (typeof window === 'undefined') return

    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    // Determine breakpoint (CPU calculation)
    let breakpoint: 'mobile' | 'tablet' | 'desktop' = 'desktop'
    if (viewportWidth < 768) {
      breakpoint = 'mobile'
    } else if (viewportWidth < 1024) {
      breakpoint = 'tablet'
    }

    // Measure header height using getBoundingClientRect (CPU-only)
    const headerHeight = headerRef?.current
      ? headerRef.current.getBoundingClientRect().height
      : 80

    // Measure sidebar width
    let sidebarWidth = 0
    let sidebarCollapsed = false

    if (breakpoint === 'desktop') {
      if (sidebarRef?.current) {
        const rect = sidebarRef.current.getBoundingClientRect()
        sidebarWidth = rect.width
        // Detect if collapsed based on actual width
        sidebarCollapsed = sidebarWidth <= sidebarCollapsedWidth + 10 // 10px tolerance
      } else {
        sidebarWidth = sidebarExpandedWidth
      }
    }

    // Measure footer height
    const footerHeight = footerRef?.current
      ? footerRef.current.getBoundingClientRect().height
      : 200

    // Calculate main content dimensions using pure math (CPU)
    const mainContentWidth = viewportWidth - sidebarWidth
    const mainContentHeight = viewportHeight - headerHeight - footerHeight
    const mainContentTop = headerHeight
    const mainContentLeft = sidebarWidth

    setDimensions({
      viewport: {
        width: viewportWidth,
        height: viewportHeight,
      },
      header: {
        height: headerHeight,
      },
      sidebar: {
        width: sidebarWidth,
        isCollapsed: sidebarCollapsed,
      },
      footer: {
        height: footerHeight,
      },
      mainContent: {
        width: Math.max(0, mainContentWidth),
        height: Math.max(0, mainContentHeight),
        top: mainContentTop,
        left: mainContentLeft,
      },
      breakpoint,
    })
  }, [headerRef, sidebarRef, footerRef, sidebarCollapsedWidth, sidebarExpandedWidth])

  // Debounced calculation to prevent excessive recalculations
  const debouncedCalculate = useCallback(() => {
    if (calculationTimeoutRef.current) {
      clearTimeout(calculationTimeoutRef.current)
    }
    calculationTimeoutRef.current = setTimeout(() => {
      calculateDimensions()
    }, 16) // ~60fps, CPU-friendly
  }, [calculateDimensions])

  // Setup ResizeObserver for efficient element size tracking
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Initial calculation
    calculateDimensions()

    // Observe viewport resize (CPU-based)
    const handleResize = () => {
      debouncedCalculate()
    }

    window.addEventListener('resize', handleResize, { passive: true })

    // Setup ResizeObserver for precise element measurements
    const elementsToObserve: HTMLElement[] = []
    if (headerRef?.current) elementsToObserve.push(headerRef.current)
    if (sidebarRef?.current) elementsToObserve.push(sidebarRef.current)
    if (footerRef?.current) elementsToObserve.push(footerRef.current)

    if (elementsToObserve.length > 0) {
      resizeObserverRef.current = new ResizeObserver(() => {
        debouncedCalculate()
      })

      elementsToObserve.forEach((el) => {
        resizeObserverRef.current?.observe(el)
      })
    }

    return () => {
      window.removeEventListener('resize', handleResize)
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect()
      }
      if (calculationTimeoutRef.current) {
        clearTimeout(calculationTimeoutRef.current)
      }
    }
  }, [calculateDimensions, debouncedCalculate, headerRef, sidebarRef, footerRef])

  return dimensions
}
