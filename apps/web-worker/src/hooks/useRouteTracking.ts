import { useState, useEffect, useCallback, useRef } from 'react'
import type { Coordinates } from '@rightfit/shared/types/navigation'
import {
  routeHistoryManager,
  type RouteHistoryEntry,
} from '../utils/routeHistory'
import { useGeolocation } from './useGeolocation'

/**
 * Configuration for route tracking
 */
export interface RouteTrackingConfig {
  /** Job ID being navigated to */
  jobId: string
  /** Property ID being navigated to */
  propertyId: string
  /** Estimated distance from OSRM (meters) */
  estimatedDistance: number
  /** Enable/disable route tracking */
  enabled: boolean
  /** Interval for collecting GPS breadcrumbs (milliseconds, default: 30000 = 30 seconds) */
  breadcrumbInterval?: number
  /** Minimum distance to trigger new breadcrumb (meters, default: 50) */
  minBreadcrumbDistance?: number
  /** Metadata for the route */
  metadata?: {
    propertyName?: string
    propertyAddress?: string
  }
  /** Callback when route is completed */
  onRouteComplete?: (route: RouteHistoryEntry) => void
}

/**
 * Route tracking state
 */
export interface RouteTrackingState {
  /** Whether route tracking is currently active */
  isTracking: boolean
  /** Current route being tracked (null if not tracking) */
  activeRoute: RouteHistoryEntry | null
  /** Number of GPS breadcrumbs collected */
  breadcrumbCount: number
  /** Current total distance traveled (meters) */
  currentDistance: number
  /** Formatted distance string */
  formattedDistance: string
  /** Start tracking */
  startTracking: () => void
  /** Stop tracking */
  stopTracking: () => void
  /** Cancel tracking without saving */
  cancelTracking: () => void
}

/**
 * Hook for automatic route tracking with GPS breadcrumb collection
 *
 * Monitors GPS location during navigation and automatically collects breadcrumbs
 * for accurate mileage calculation.
 *
 * @param config - Route tracking configuration
 * @returns Route tracking state and controls
 *
 * @example
 * ```typescript
 * const { isTracking, currentDistance, formattedDistance, startTracking, stopTracking } = useRouteTracking({
 *   jobId: job.id,
 *   propertyId: job.property_id,
 *   estimatedDistance: routeData.distance_meters,
 *   enabled: true,
 *   metadata: {
 *     propertyName: job.property.name,
 *     propertyAddress: job.property.address
 *   },
 *   onRouteComplete: (route) => {
 *     console.log(`Route completed: ${route.totalDistanceMeters}m`)
 *     // Sync to server
 *     syncRouteToServer(route)
 *   }
 * })
 *
 * // In your navigation component
 * useEffect(() => {
 *   startTracking()
 *   return () => stopTracking()
 * }, [])
 * ```
 */
export function useRouteTracking(
  config: RouteTrackingConfig
): RouteTrackingState {
  const {
    jobId,
    propertyId,
    estimatedDistance,
    enabled,
    breadcrumbInterval = 30000, // 30 seconds
    minBreadcrumbDistance = 50, // 50 meters
    metadata,
    onRouteComplete,
  } = config

  const [isTracking, setIsTracking] = useState(false)
  const [activeRoute, setActiveRoute] = useState<RouteHistoryEntry | null>(null)
  const [breadcrumbCount, setBreadcrumbCount] = useState(0)
  const [currentDistance, setCurrentDistance] = useState(0)

  const routeIdRef = useRef<string | null>(null)
  const lastBreadcrumbRef = useRef<Coordinates | null>(null)
  const breadcrumbIntervalRef = useRef<number | null>(null)

  // Get GPS location
  const { location } = useGeolocation()

  /**
   * Start tracking a new route
   */
  const startTracking = useCallback(() => {
    if (!enabled || !location) {
      console.warn('Cannot start tracking: disabled or no GPS location')
      return
    }

    // Check if already tracking
    if (isTracking || routeIdRef.current) {
      console.warn('Route tracking already active')
      return
    }

    // Start tracking in route history manager
    const routeId = routeHistoryManager.startTracking(
      jobId,
      propertyId,
      location,
      estimatedDistance,
      metadata
    )

    routeIdRef.current = routeId
    lastBreadcrumbRef.current = location
    setIsTracking(true)

    // Load active route
    const route = routeHistoryManager.getActiveRoute()
    if (route) {
      setActiveRoute(route)
      setBreadcrumbCount(route.routePoints.length)
      setCurrentDistance(route.totalDistanceMeters)
    }

    console.log(`Started route tracking: ${routeId}`)
  }, [enabled, location, jobId, propertyId, estimatedDistance, metadata, isTracking])

  /**
   * Stop tracking and save route
   */
  const stopTracking = useCallback(() => {
    if (!isTracking || !routeIdRef.current || !location) {
      console.warn('No active route to stop')
      return
    }

    // Clear breadcrumb interval
    if (breadcrumbIntervalRef.current) {
      clearInterval(breadcrumbIntervalRef.current)
      breadcrumbIntervalRef.current = null
    }

    // End tracking
    const completedRoute = routeHistoryManager.endTracking(location, metadata)

    if (completedRoute) {
      console.log(
        `Route completed: ${completedRoute.totalDistanceMeters.toFixed(0)}m (${completedRoute.routePoints.length} breadcrumbs)`
      )

      if (onRouteComplete) {
        onRouteComplete(completedRoute)
      }
    }

    // Reset state
    routeIdRef.current = null
    lastBreadcrumbRef.current = null
    setIsTracking(false)
    setActiveRoute(null)
    setBreadcrumbCount(0)
    setCurrentDistance(0)
  }, [isTracking, location, metadata, onRouteComplete])

  /**
   * Cancel tracking without saving
   */
  const cancelTracking = useCallback(() => {
    if (!isTracking || !routeIdRef.current) {
      return
    }

    // Clear breadcrumb interval
    if (breadcrumbIntervalRef.current) {
      clearInterval(breadcrumbIntervalRef.current)
      breadcrumbIntervalRef.current = null
    }

    // Cancel tracking
    routeHistoryManager.cancelTracking()

    console.log('Route tracking cancelled')

    // Reset state
    routeIdRef.current = null
    lastBreadcrumbRef.current = null
    setIsTracking(false)
    setActiveRoute(null)
    setBreadcrumbCount(0)
    setCurrentDistance(0)
  }, [isTracking])

  /**
   * Collect GPS breadcrumbs at regular intervals
   */
  useEffect(() => {
    if (!isTracking || !enabled || !location) {
      return
    }

    // Calculate distance from last breadcrumb
    const shouldCollectBreadcrumb = (() => {
      if (!lastBreadcrumbRef.current) return true

      // Simple distance calculation (approximation)
      const lat1 = lastBreadcrumbRef.current.latitude
      const lon1 = lastBreadcrumbRef.current.longitude
      const lat2 = location.latitude
      const lon2 = location.longitude

      const R = 6371000 // Earth radius in meters
      const dLat = ((lat2 - lat1) * Math.PI) / 180
      const dLon = ((lon2 - lon1) * Math.PI) / 180
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      const distance = R * c

      return distance >= minBreadcrumbDistance
    })()

    if (shouldCollectBreadcrumb) {
      // Add breadcrumb
      const success = routeHistoryManager.addBreadcrumb(location)

      if (success) {
        lastBreadcrumbRef.current = location

        // Update state
        const route = routeHistoryManager.getActiveRoute()
        if (route) {
          setActiveRoute(route)
          setBreadcrumbCount(route.routePoints.length)
          setCurrentDistance(route.totalDistanceMeters)
        }
      }
    }
  }, [location, isTracking, enabled, minBreadcrumbDistance])

  /**
   * Set up periodic breadcrumb collection
   */
  useEffect(() => {
    if (!isTracking || !enabled) {
      return
    }

    // Set up interval for periodic updates
    breadcrumbIntervalRef.current = window.setInterval(() => {
      // Force re-render to check for new breadcrumbs
      const route = routeHistoryManager.getActiveRoute()
      if (route) {
        setActiveRoute(route)
        setBreadcrumbCount(route.routePoints.length)
        setCurrentDistance(route.totalDistanceMeters)
      }
    }, breadcrumbInterval)

    return () => {
      if (breadcrumbIntervalRef.current) {
        clearInterval(breadcrumbIntervalRef.current)
        breadcrumbIntervalRef.current = null
      }
    }
  }, [isTracking, enabled, breadcrumbInterval])

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      // Clear interval on unmount
      if (breadcrumbIntervalRef.current) {
        clearInterval(breadcrumbIntervalRef.current)
      }
    }
  }, [])

  // Format distance for display
  const formattedDistance =
    currentDistance < 1000
      ? `${currentDistance.toFixed(0)}m`
      : `${(currentDistance / 1000).toFixed(1)}km`

  return {
    isTracking,
    activeRoute,
    breadcrumbCount,
    currentDistance,
    formattedDistance,
    startTracking,
    stopTracking,
    cancelTracking,
  }
}
