import { useState, useEffect, useCallback, useRef } from 'react'
import type { Coordinates } from '@rightfit/shared/types/navigation'
import {
  isWithinRadius,
  getDistanceBetweenCoordinates,
  GEOFENCE_RADII,
  formatDistance,
  isValidCoordinates,
} from '../utils/geofencing'
import { useGeolocation } from './useGeolocation'

/**
 * Arrival event details
 */
export interface ArrivalEvent {
  /** Job ID that was arrived at */
  jobId: string
  /** Exact time of arrival detection */
  arrivalTime: Date
  /** Distance from property center when arrival was detected (meters) */
  distanceFromProperty: number
  /** Worker's location when arrival was detected */
  arrivalLocation: Coordinates
  /** Property location */
  propertyLocation: Coordinates
}

/**
 * Configuration for arrival detection
 */
export interface ArrivalDetectionConfig {
  /** Job ID being monitored */
  jobId: string
  /** Property GPS coordinates */
  propertyLocation: Coordinates
  /** Arrival detection radius in meters (default: 50m) */
  arrivalRadius?: number
  /** Callback fired when arrival is detected */
  onArrival: (event: ArrivalEvent) => void
  /** Callback fired when approaching property (optional) */
  onApproaching?: (distance: number) => void
  /** Enable/disable arrival detection */
  enabled: boolean
  /** Distance threshold for "approaching" callback (default: 200m) */
  approachingRadius?: number
}

/**
 * Arrival detection state
 */
export interface ArrivalDetectionState {
  /** Whether worker has arrived */
  hasArrived: boolean
  /** Whether worker is approaching (within approaching radius) */
  isApproaching: boolean
  /** Current distance from property (null if no GPS fix) */
  currentDistance: number | null
  /** Formatted distance string for display */
  formattedDistance: string | null
  /** Arrival event details (null if not arrived) */
  arrivalEvent: ArrivalEvent | null
  /** Manually trigger arrival (for testing or manual confirmation) */
  triggerArrival: () => void
  /** Reset arrival state */
  reset: () => void
}

/**
 * Hook for automatic job arrival detection using GPS geofencing
 *
 * Monitors the worker's GPS location and automatically detects when they arrive
 * within a specified radius of the property. Provides callbacks for arrival and
 * approaching events, plus utilities for manual control.
 *
 * @param config - Arrival detection configuration
 * @returns Arrival detection state and controls
 *
 * @example
 * ```typescript
 * const { hasArrived, currentDistance, formattedDistance } = useArrivalDetection({
 *   jobId: job.id,
 *   propertyLocation: job.property.location,
 *   arrivalRadius: 50, // 50 meters
 *   enabled: true,
 *   onArrival: (event) => {
 *     console.log(`Arrived at ${event.jobId} at ${event.arrivalTime}`)
 *     // Update job status to 'in_progress'
 *     updateJobStatus(event.jobId, 'in_progress')
 *   },
 *   onApproaching: (distance) => {
 *     console.log(`${distance}m away from property`)
 *   }
 * })
 *
 * return (
 *   <div>
 *     {hasArrived ? (
 *       <Badge>At Property</Badge>
 *     ) : (
 *       <Text>{formattedDistance} away</Text>
 *     )}
 *   </div>
 * )
 * ```
 */
export function useArrivalDetection(
  config: ArrivalDetectionConfig
): ArrivalDetectionState {
  const {
    jobId,
    propertyLocation,
    arrivalRadius = GEOFENCE_RADII.ARRIVAL,
    approachingRadius = GEOFENCE_RADII.NEARBY,
    onArrival,
    onApproaching,
    enabled,
  } = config

  // State
  const [hasArrived, setHasArrived] = useState(false)
  const [isApproaching, setIsApproaching] = useState(false)
  const [currentDistance, setCurrentDistance] = useState<number | null>(null)
  const [arrivalEvent, setArrivalEvent] = useState<ArrivalEvent | null>(null)

  // Refs to prevent multiple triggers
  const arrivalTriggeredRef = useRef(false)
  const approachingNotifiedRef = useRef(false)

  // Get GPS location
  const { location, loading: locationLoading, error: locationError } = useGeolocation()

  /**
   * Trigger arrival manually (for testing or user confirmation)
   */
  const triggerArrival = useCallback(() => {
    if (hasArrived || !location) return

    const event: ArrivalEvent = {
      jobId,
      arrivalTime: new Date(),
      distanceFromProperty: currentDistance || 0,
      arrivalLocation: location,
      propertyLocation,
    }

    setHasArrived(true)
    setArrivalEvent(event)
    arrivalTriggeredRef.current = true
    onArrival(event)
  }, [
    jobId,
    location,
    propertyLocation,
    currentDistance,
    hasArrived,
    onArrival,
  ])

  /**
   * Reset arrival state (e.g., when leaving property or switching jobs)
   */
  const reset = useCallback(() => {
    setHasArrived(false)
    setIsApproaching(false)
    setCurrentDistance(null)
    setArrivalEvent(null)
    arrivalTriggeredRef.current = false
    approachingNotifiedRef.current = false
  }, [])

  /**
   * Main effect: Monitor GPS and detect arrival
   */
  useEffect(() => {
    // Don't run if disabled, already arrived, or missing data
    if (
      !enabled ||
      arrivalTriggeredRef.current ||
      !location ||
      locationLoading ||
      locationError
    ) {
      return
    }

    // Validate coordinates
    if (!isValidCoordinates(location) || !isValidCoordinates(propertyLocation)) {
      console.warn('Invalid coordinates for arrival detection')
      return
    }

    // Calculate distance
    const distance = getDistanceBetweenCoordinates(location, propertyLocation)
    setCurrentDistance(distance)

    // Check for approaching (within approaching radius)
    const nowApproaching = distance <= approachingRadius
    if (nowApproaching && !approachingNotifiedRef.current) {
      setIsApproaching(true)
      approachingNotifiedRef.current = true
      if (onApproaching) {
        onApproaching(distance)
      }
    } else if (!nowApproaching && approachingNotifiedRef.current) {
      // Left the approaching zone
      setIsApproaching(false)
      approachingNotifiedRef.current = false
    }

    // Check for arrival (within arrival radius)
    const withinRadius = isWithinRadius(location, propertyLocation, arrivalRadius)

    if (withinRadius && !hasArrived && !arrivalTriggeredRef.current) {
      const event: ArrivalEvent = {
        jobId,
        arrivalTime: new Date(),
        distanceFromProperty: distance,
        arrivalLocation: location,
        propertyLocation,
      }

      setHasArrived(true)
      setArrivalEvent(event)
      arrivalTriggeredRef.current = true
      onArrival(event)
    }
  }, [
    enabled,
    location,
    locationLoading,
    locationError,
    propertyLocation,
    arrivalRadius,
    approachingRadius,
    hasArrived,
    jobId,
    onArrival,
    onApproaching,
  ])

  // Format distance for display
  const formattedDistance = currentDistance !== null ? formatDistance(currentDistance) : null

  return {
    hasArrived,
    isApproaching,
    currentDistance,
    formattedDistance,
    arrivalEvent,
    triggerArrival,
    reset,
  }
}
