import type { Coordinates } from '@rightfit/shared/types/navigation'
import { calculateRouteDistance } from './geofencing'

/**
 * A single route history entry representing one navigation session
 */
export interface RouteHistoryEntry {
  /** Unique identifier for this route */
  id: string
  /** Job ID associated with this route */
  jobId: string
  /** Property ID being navigated to */
  propertyId: string
  /** When navigation started */
  startTime: Date
  /** When navigation ended (null if still active) */
  endTime: Date | null
  /** Starting GPS location */
  startLocation: Coordinates
  /** Ending GPS location (null if still active) */
  endLocation: Coordinates | null
  /** Array of GPS breadcrumbs collected during navigation */
  routePoints: Coordinates[]
  /** Actual distance traveled based on GPS breadcrumbs (meters) */
  totalDistanceMeters: number
  /** Estimated distance from OSRM route (meters) */
  estimatedDistanceMeters: number
  /** Whether this route has been synced to the server */
  syncedToServer: boolean
  /** Metadata */
  metadata?: {
    propertyName?: string
    propertyAddress?: string
    arrivalDetected?: boolean
    arrivalTime?: Date
  }
}

/**
 * Statistics for all route history
 */
export interface RouteHistoryStats {
  /** Total number of routes tracked */
  totalRoutes: number
  /** Total distance traveled across all routes (meters) */
  totalDistanceMeters: number
  /** Total distance traveled across all routes (kilometers) */
  totalDistanceKm: number
  /** Total distance traveled across all routes (miles) */
  totalDistanceMiles: number
  /** Number of routes not yet synced */
  unsyncedRoutes: number
  /** Routes from last 7 days */
  recentRoutes: RouteHistoryEntry[]
}

/**
 * Manager class for route history using localStorage
 *
 * Provides offline-first storage of navigation routes for mileage tracking
 * and expense reimbursement.
 */
export class RouteHistoryManager {
  private storageKey = 'rightfit_route_history'
  private activeRouteKey = 'rightfit_active_route'

  /**
   * Get all route history entries
   */
  getAll(): RouteHistoryEntry[] {
    try {
      const stored = localStorage.getItem(this.storageKey)
      if (!stored) return []

      const parsed = JSON.parse(stored)
      // Convert date strings back to Date objects
      return parsed.map((entry: any) => ({
        ...entry,
        startTime: new Date(entry.startTime),
        endTime: entry.endTime ? new Date(entry.endTime) : null,
        metadata: entry.metadata
          ? {
              ...entry.metadata,
              arrivalTime: entry.metadata.arrivalTime
                ? new Date(entry.metadata.arrivalTime)
                : undefined,
            }
          : undefined,
      }))
    } catch (error) {
      console.error('Error loading route history:', error)
      return []
    }
  }

  /**
   * Save route history entries
   */
  private save(entries: RouteHistoryEntry[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(entries))
    } catch (error) {
      console.error('Error saving route history:', error)
    }
  }

  /**
   * Start tracking a new route
   *
   * @param jobId - Job ID being navigated to
   * @param propertyId - Property ID
   * @param startLocation - Starting GPS coordinates
   * @param estimatedDistance - Estimated distance from OSRM (meters)
   * @param metadata - Optional metadata
   * @returns Route ID
   */
  startTracking(
    jobId: string,
    propertyId: string,
    startLocation: Coordinates,
    estimatedDistance: number,
    metadata?: RouteHistoryEntry['metadata']
  ): string {
    const routeId = `route_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const newEntry: RouteHistoryEntry = {
      id: routeId,
      jobId,
      propertyId,
      startTime: new Date(),
      endTime: null,
      startLocation,
      endLocation: null,
      routePoints: [startLocation],
      totalDistanceMeters: 0,
      estimatedDistanceMeters: estimatedDistance,
      syncedToServer: false,
      metadata,
    }

    // Save as active route
    try {
      localStorage.setItem(this.activeRouteKey, JSON.stringify(newEntry))
    } catch (error) {
      console.error('Error saving active route:', error)
    }

    return routeId
  }

  /**
   * Get currently active route (if any)
   */
  getActiveRoute(): RouteHistoryEntry | null {
    try {
      const stored = localStorage.getItem(this.activeRouteKey)
      if (!stored) return null

      const entry = JSON.parse(stored)
      return {
        ...entry,
        startTime: new Date(entry.startTime),
        endTime: entry.endTime ? new Date(entry.endTime) : null,
        metadata: entry.metadata
          ? {
              ...entry.metadata,
              arrivalTime: entry.metadata.arrivalTime
                ? new Date(entry.metadata.arrivalTime)
                : undefined,
            }
          : undefined,
      }
    } catch (error) {
      console.error('Error loading active route:', error)
      return null
    }
  }

  /**
   * Add a GPS breadcrumb to the active route
   *
   * @param newPoint - New GPS coordinate
   * @returns true if successful
   */
  addBreadcrumb(newPoint: Coordinates): boolean {
    const activeRoute = this.getActiveRoute()
    if (!activeRoute) {
      console.warn('No active route to add breadcrumb to')
      return false
    }

    // Add new point to route
    activeRoute.routePoints.push(newPoint)

    // Recalculate total distance
    activeRoute.totalDistanceMeters = calculateRouteDistance(activeRoute.routePoints)

    // Save updated route
    try {
      localStorage.setItem(this.activeRouteKey, JSON.stringify(activeRoute))
      return true
    } catch (error) {
      console.error('Error updating route breadcrumbs:', error)
      return false
    }
  }

  /**
   * End tracking for the active route
   *
   * @param endLocation - Final GPS coordinates
   * @param metadata - Additional metadata to merge
   * @returns Completed route entry
   */
  endTracking(
    endLocation: Coordinates,
    metadata?: Partial<RouteHistoryEntry['metadata']>
  ): RouteHistoryEntry | null {
    const activeRoute = this.getActiveRoute()
    if (!activeRoute) {
      console.warn('No active route to end')
      return null
    }

    // Add final location
    activeRoute.endLocation = endLocation
    activeRoute.endTime = new Date()

    // Add final breadcrumb if different from last
    const lastPoint = activeRoute.routePoints[activeRoute.routePoints.length - 1]
    if (
      lastPoint.latitude !== endLocation.latitude ||
      lastPoint.longitude !== endLocation.longitude
    ) {
      activeRoute.routePoints.push(endLocation)
    }

    // Recalculate distance
    activeRoute.totalDistanceMeters = calculateRouteDistance(activeRoute.routePoints)

    // Merge metadata
    if (metadata) {
      activeRoute.metadata = {
        ...activeRoute.metadata,
        ...metadata,
      }
    }

    // Move from active to history
    const allRoutes = this.getAll()
    allRoutes.push(activeRoute)
    this.save(allRoutes)

    // Clear active route
    try {
      localStorage.removeItem(this.activeRouteKey)
    } catch (error) {
      console.error('Error clearing active route:', error)
    }

    return activeRoute
  }

  /**
   * Cancel active route tracking without saving
   */
  cancelTracking(): void {
    try {
      localStorage.removeItem(this.activeRouteKey)
    } catch (error) {
      console.error('Error canceling route:', error)
    }
  }

  /**
   * Get route history for a specific job
   */
  getByJobId(jobId: string): RouteHistoryEntry[] {
    return this.getAll().filter((entry) => entry.jobId === jobId)
  }

  /**
   * Get route history for a specific property
   */
  getByPropertyId(propertyId: string): RouteHistoryEntry[] {
    return this.getAll().filter((entry) => entry.propertyId === propertyId)
  }

  /**
   * Get statistics for all route history
   */
  getStats(): RouteHistoryStats {
    const allRoutes = this.getAll()
    const totalDistanceMeters = allRoutes.reduce(
      (sum, route) => sum + route.totalDistanceMeters,
      0
    )

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const recentRoutes = allRoutes.filter(
      (route) => route.startTime >= sevenDaysAgo
    )

    return {
      totalRoutes: allRoutes.length,
      totalDistanceMeters,
      totalDistanceKm: totalDistanceMeters / 1000,
      totalDistanceMiles: totalDistanceMeters / 1609.34,
      unsyncedRoutes: allRoutes.filter((r) => !r.syncedToServer).length,
      recentRoutes,
    }
  }

  /**
   * Mark routes as synced to server
   */
  markAsSynced(routeIds: string[]): void {
    const allRoutes = this.getAll()
    const updated = allRoutes.map((route) => {
      if (routeIds.includes(route.id)) {
        return { ...route, syncedToServer: true }
      }
      return route
    })
    this.save(updated)
  }

  /**
   * Get unsynced routes (for server sync)
   */
  getUnsynced(): RouteHistoryEntry[] {
    return this.getAll().filter((route) => !route.syncedToServer)
  }

  /**
   * Clear all route history (use with caution!)
   */
  clearAll(): void {
    try {
      localStorage.removeItem(this.storageKey)
      localStorage.removeItem(this.activeRouteKey)
    } catch (error) {
      console.error('Error clearing route history:', error)
    }
  }

  /**
   * Delete a specific route
   */
  deleteRoute(routeId: string): boolean {
    const allRoutes = this.getAll()
    const filtered = allRoutes.filter((route) => route.id !== routeId)

    if (filtered.length === allRoutes.length) {
      return false // Route not found
    }

    this.save(filtered)
    return true
  }

  /**
   * Export route history as JSON (for debugging or data export)
   */
  exportToJSON(): string {
    return JSON.stringify(
      {
        routes: this.getAll(),
        activeRoute: this.getActiveRoute(),
        stats: this.getStats(),
        exportedAt: new Date().toISOString(),
      },
      null,
      2
    )
  }

  /**
   * Import route history from JSON
   */
  importFromJSON(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString)
      if (data.routes && Array.isArray(data.routes)) {
        this.save(data.routes)
        return true
      }
      return false
    } catch (error) {
      console.error('Error importing route history:', error)
      return false
    }
  }
}

// Export singleton instance
export const routeHistoryManager = new RouteHistoryManager()
