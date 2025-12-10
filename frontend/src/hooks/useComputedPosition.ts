'use client'

import { useMemo } from 'react'
import { LayoutDimensions } from './useLayoutDimensions'

export interface ComputedPosition {
  position: 'fixed' | 'absolute' | 'relative' | 'static'
  top?: string | number
  left?: string | number
  right?: string | number
  bottom?: string | number
  width?: string | number
  height?: string | number
  minHeight?: string | number
  maxHeight?: string | number
  zIndex?: number
}

export interface ComputedStyles {
  header: ComputedPosition
  sidebar: ComputedPosition
  footer: ComputedPosition
  mainContent: ComputedPosition
}

/**
 * CPU-based position calculator using CSS calc() for elegant layouts
 * NO GPU animations - only position and dimension calculations
 * Ensures layouts never break regardless of viewport size
 */
export function useComputedPosition(dimensions: LayoutDimensions): ComputedStyles {
  const computedStyles = useMemo(() => {
    const { viewport, header, sidebar, footer, breakpoint } = dimensions

    // Header: Fixed at top with computed height
    const headerStyles: ComputedPosition = {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: header.height,
      zIndex: 40,
      width: '100%',
    }

    // Sidebar: Fixed positioning WITHOUT width
    // Width is controlled by Tailwind's conditional classes for collapse animation
    const sidebarStyles: ComputedPosition = {
      position: 'fixed',
      top: 0,
      left: 0,
      bottom: 0,
      // width removed - let Tailwind handle it via ${isCollapsed ? 'w-20' : 'w-62'}
      height: '100vh',
      zIndex: 30,
    }

    // Hide sidebar on mobile/tablet using display (CPU-only, no transform)
    if (breakpoint === 'mobile' || breakpoint === 'tablet') {
      sidebarStyles.width = 0 // Only set width for hide on mobile/tablet
    }

    // Footer: Fixed at bottom with computed height
    const footerStyles: ComputedPosition = {
      position: 'fixed',
      bottom: 0,
      left: breakpoint === 'desktop' ? sidebar.width : 0,
      right: 0,
      height: footer.height,
      zIndex: 10,
    }

    // Main Content: Computed offsets for perfect positioning
    // Uses CSS calc() with computed values for CPU-friendly layout
    const mainContentStyles: ComputedPosition = {
      position: 'fixed',
      top: header.height,
      left: breakpoint === 'desktop' ? sidebar.width : 0,
      right: 0,
      bottom: footer.height,
      // Calculate dimensions using viewport - offsets
      width: breakpoint === 'desktop'
        ? `calc(100vw - ${sidebar.width}px)`
        : '100vw',
      height: `calc(100vh - ${header.height}px - ${footer.height}px)`,
      minHeight: 300, // Prevent collapse
      maxHeight: `calc(100vh - ${header.height}px - ${footer.height}px)`,
      zIndex: 1,
    }

    return {
      header: headerStyles,
      sidebar: sidebarStyles,
      footer: footerStyles,
      mainContent: mainContentStyles,
    }
  }, [dimensions])

  return computedStyles
}

/**
 * Generate inline CSS string from ComputedPosition object
 * Useful for applying styles directly to elements
 */
export function generateCSSString(position: ComputedPosition): string {
  const cssProps: string[] = []

  Object.entries(position).forEach(([key, value]) => {
    if (value === undefined) return

    // Convert camelCase to kebab-case
    const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase()

    // Handle numeric values (add 'px' unit)
    const cssValue = typeof value === 'number' ? `${value}px` : value

    cssProps.push(`${cssKey}: ${cssValue}`)
  })

  return cssProps.join('; ')
}

/**
 * Generate Tailwind-compatible style object from ComputedPosition
 */
export function generateStyleObject(position: ComputedPosition): React.CSSProperties {
  const styleObj: React.CSSProperties = {}

  Object.entries(position).forEach(([key, value]) => {
    if (value === undefined) return

    // Type assertion to satisfy TypeScript
    (styleObj as any)[key] = typeof value === 'number' ? `${value}px` : value
  })

  return styleObj
}

/**
 * Helper to generate safe overflow styles for scrollable content
 * CPU-friendly scrolling without GPU acceleration
 */
export function getScrollableContentStyles(maxHeight?: string | number): React.CSSProperties {
  return {
    overflowY: 'auto',
    overflowX: 'hidden',
    maxHeight: typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight,
    // Disable GPU-accelerated scrolling for potato PCs
    WebkitOverflowScrolling: 'auto',
  }
}
