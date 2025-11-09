import { useState, useEffect, useCallback, useRef } from 'react'
import type { Coordinates } from '@rightfit/shared/types/navigation'

/**
 * Geolocation permission states
 */
export type GeolocationPermission = 'GRANTED' | 'DENIED' | 'PROMPT' | 'UNSUPPORTED'

/**
 * Geolocation error types matching browser GeolocationPositionError codes
 */
export type GeolocationErrorCode =
  | 'PERMISSION_DENIED' // User denied permission
  | 'POSITION_UNAVAILABLE' // GPS unavailable
  | 'TIMEOUT' // Request timed out
  | 'UNSUPPORTED' // Browser doesn't support geolocation
  | 'UNKNOWN' // Unexpected error

/**
 * Structured geolocation error
 */
export interface GeolocationError {
  code: GeolocationErrorCode
  message: string
}

/**
 * Options for geolocation requests
 */
export interface GeolocationOptions {
  /**
   * Enable high accuracy mode (uses GPS)
   * @default true
   */
  enableHighAccuracy?: boolean

  /**
   * Maximum age of cached position in milliseconds
   * @default 60000 (1 minute)
   */
  maximumAge?: number

  /**
   * Timeout for position request in milliseconds
   * @default 10000 (10 seconds)
   */
  timeout?: number
}

/**
 * Return type for useGeolocation hook
 */
export interface UseGeolocationReturn {
  /**
   * Current user location (null if not available)
   */
  location: Coordinates | null

  /**
   * Error object if geolocation failed
   */
  error: GeolocationError | null

  /**
   * Loading state while requesting location
   */
  loading: boolean

  /**
   * Current permission state
   */
  permission: GeolocationPermission

  /**
   * Request location permission and get current position
   */
  requestLocation: () => Promise<void>

  /**
   * Start watching position (continuous updates)
   */
  startWatching: () => void

  /**
   * Stop watching position
   */
  stopWatching: () => void

  /**
   * Whether position watching is active
   */
  isWatching: boolean

  /**
   * Clear current location and error state
   */
  clearLocation: () => void

  /**
   * Check if browser supports geolocation
   */
  isSupported: boolean
}

/**
 * Default geolocation options
 */
const DEFAULT_OPTIONS: GeolocationOptions = {
  enableHighAccuracy: true,
  maximumAge: 60000, // 1 minute cache
  timeout: 10000, // 10 seconds
}

/**
 * Mock location for testing (Burton On Trent, Staffordshire)
 * what3words: ///rental.shut.ozone
 * Address: 123 Stanton Road, Burton On Trent, DE15 9SE
 * To enable: localStorage.setItem('mock_location', 'true')
 * To disable: localStorage.removeItem('mock_location')
 */
const MOCK_LOCATION: Coordinates = {
  latitude: 52.78505,
  longitude: -1.61504,
  accuracy: 3, // what3words is accurate to 3m x 3m square
}

/**
 * Custom React hook for browser geolocation with permission handling
 *
 * Features:
 * - Automatic permission request on mount (optional)
 * - Manual permission request support
 * - Error handling with structured error types
 * - Loading states
 * - Location caching (1 minute default)
 * - High accuracy GPS mode
 * - Mock location support for testing
 * - TypeScript strict mode compliance
 *
 * Testing:
 * To enable mock location (///rental.shut.ozone - Burton On Trent):
 * ```js
 * localStorage.setItem('mock_location', 'true')
 * ```
 * To disable:
 * ```js
 * localStorage.removeItem('mock_location')
 * ```
 *
 * @param options - Geolocation configuration options
 * @param requestOnMount - Automatically request location on mount (default: false)
 * @returns Geolocation state and control functions
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { location, error, loading, requestLocation } = useGeolocation()
 *
 *   if (loading) return <div>Getting your location...</div>
 *   if (error) return <div>Error: {error.message}</div>
 *   if (!location) return <button onClick={requestLocation}>Share Location</button>
 *
 *   return <div>You are at {location.latitude}, {location.longitude}</div>
 * }
 * ```
 */
export function useGeolocation(
  options: GeolocationOptions = {},
  requestOnMount = false
): UseGeolocationReturn {
  const [location, setLocation] = useState<Coordinates | null>(null)
  const [error, setError] = useState<GeolocationError | null>(null)
  const [loading, setLoading] = useState(false)
  const [permission, setPermission] = useState<GeolocationPermission>('PROMPT')
  const [isWatching, setIsWatching] = useState(false)

  // Merge options with defaults
  const geoOptions = { ...DEFAULT_OPTIONS, ...options }

  // Track if component is mounted to prevent state updates after unmount
  const isMountedRef = useRef(true)

  // Track watch ID for cleanup
  const watchIdRef = useRef<number | null>(null)

  // Check if geolocation is supported
  const isSupported = 'geolocation' in navigator

  /**
   * Convert browser GeolocationPositionError to structured error
   */
  const createGeolocationError = useCallback((err: GeolocationPositionError): GeolocationError => {
    switch (err.code) {
      case err.PERMISSION_DENIED:
        return {
          code: 'PERMISSION_DENIED',
          message: 'Location permission denied. Please enable location access in your browser settings.',
        }
      case err.POSITION_UNAVAILABLE:
        return {
          code: 'POSITION_UNAVAILABLE',
          message: 'Location unavailable. Please check your GPS settings or try again later.',
        }
      case err.TIMEOUT:
        return {
          code: 'TIMEOUT',
          message: 'Location request timed out. Please try again.',
        }
      default:
        return {
          code: 'UNKNOWN',
          message: err.message || 'An unknown error occurred while getting your location.',
        }
    }
  }, [])

  /**
   * Get current position from browser Geolocation API
   * Supports mock location for testing via localStorage
   */
  const getCurrentPosition = useCallback((): Promise<Coordinates> => {
    return new Promise((resolve, reject) => {
      // Check if mock location is enabled for testing
      const useMockLocation = localStorage.getItem('mock_location') === 'true'

      if (useMockLocation) {
        console.info('📍 Using mock location for testing:', MOCK_LOCATION)
        // Simulate async delay like real geolocation
        setTimeout(() => resolve(MOCK_LOCATION), 100)
        return
      }

      if (!isSupported) {
        reject({
          code: 'UNSUPPORTED',
          message: 'Geolocation is not supported by your browser.',
        })
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: Coordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude ?? undefined,
            altitudeAccuracy: position.coords.altitudeAccuracy ?? undefined,
          }
          resolve(coords)
        },
        (err) => {
          reject(createGeolocationError(err))
        },
        geoOptions
      )
    })
  }, [isSupported, geoOptions, createGeolocationError])

  /**
   * Check permission state using Permissions API (if supported)
   */
  const checkPermission = useCallback(async (): Promise<GeolocationPermission> => {
    if (!isSupported) {
      return 'UNSUPPORTED'
    }

    // Permissions API is not supported in all browsers
    if (!navigator.permissions) {
      return 'PROMPT'
    }

    try {
      const result = await navigator.permissions.query({ name: 'geolocation' })

      switch (result.state) {
        case 'granted':
          return 'GRANTED'
        case 'denied':
          return 'DENIED'
        default:
          return 'PROMPT'
      }
    } catch {
      // Permissions API query failed, return PROMPT as fallback
      return 'PROMPT'
    }
  }, [isSupported])

  /**
   * Request location permission and get current position
   */
  const requestLocation = useCallback(async (): Promise<void> => {
    if (!isMountedRef.current) return

    setLoading(true)
    setError(null)

    try {
      const coords = await getCurrentPosition()

      if (isMountedRef.current) {
        setLocation(coords)
        setPermission('GRANTED')
      }
    } catch (err) {
      if (isMountedRef.current) {
        const geoError = err as GeolocationError
        setError(geoError)

        if (geoError.code === 'PERMISSION_DENIED') {
          setPermission('DENIED')
        } else if (geoError.code === 'UNSUPPORTED') {
          setPermission('UNSUPPORTED')
        }
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false)
      }
    }
  }, [getCurrentPosition])

  /**
   * Start watching position for continuous updates
   */
  const startWatching = useCallback((): void => {
    if (!isSupported || watchIdRef.current !== null) return

    // Check if mock location is enabled
    const useMockLocation = localStorage.getItem('mock_location') === 'true'

    if (useMockLocation) {
      // For mock location, just set it once (no simulated movement)
      console.info('📍 Starting mock location watch')
      setIsWatching(true)
      setLocation(MOCK_LOCATION)
      setPermission('GRANTED')
      return
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        if (isMountedRef.current) {
          const coords: Coordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude ?? undefined,
            altitudeAccuracy: position.coords.altitudeAccuracy ?? undefined,
          }
          setLocation(coords)
          setPermission('GRANTED')
          setError(null)
        }
      },
      (err) => {
        if (isMountedRef.current) {
          const geoError = createGeolocationError(err)
          setError(geoError)

          if (geoError.code === 'PERMISSION_DENIED') {
            setPermission('DENIED')
          }
        }
      },
      geoOptions
    )

    watchIdRef.current = watchId
    setIsWatching(true)
  }, [isSupported, geoOptions, createGeolocationError])

  /**
   * Stop watching position
   */
  const stopWatching = useCallback((): void => {
    if (watchIdRef.current !== null && isSupported) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    setIsWatching(false)
  }, [isSupported])

  /**
   * Clear current location and error state
   */
  const clearLocation = useCallback((): void => {
    setLocation(null)
    setError(null)
  }, [])

  /**
   * Check initial permission state on mount
   */
  useEffect(() => {
    isMountedRef.current = true

    const initPermission = async () => {
      const permissionState = await checkPermission()
      if (isMountedRef.current) {
        setPermission(permissionState)
      }
    }

    initPermission()

    return () => {
      isMountedRef.current = false
      // Clean up watch on unmount
      if (watchIdRef.current !== null && isSupported) {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }
    }
  }, [checkPermission, isSupported])

  /**
   * Optionally request location on mount
   */
  useEffect(() => {
    if (requestOnMount && isSupported) {
      requestLocation()
    }
  }, [requestOnMount, isSupported, requestLocation])

  return {
    location,
    error,
    loading,
    permission,
    requestLocation,
    startWatching,
    stopWatching,
    isWatching,
    clearLocation,
    isSupported,
  }
}
