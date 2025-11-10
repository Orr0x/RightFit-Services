import { useRef, useEffect, useState, useCallback } from 'react'
import type { Coordinates } from '@rightfit/shared/types/navigation'
import type { RouteData } from './MapView'
import { Loader2, AlertCircle } from 'lucide-react'

/**
 * Props for MapboxNavigationView component
 */
export interface MapboxNavigationViewProps {
  /**
   * User's current location (required for satnav mode)
   */
  userLocation: Coordinates | null

  /**
   * Destination location (required)
   */
  destination: Coordinates

  /**
   * Route data from OSRM for polyline display (optional)
   */
  route?: RouteData | null

  /**
   * Compass bearing in degrees (0 = North, 90 = East, 180 = South, 270 = West)
   */
  bearing?: number

  /**
   * Camera pitch/tilt in degrees (0 = top-down, 60 = tilted for driving)
   */
  pitch?: number

  /**
   * Enable follow mode (camera follows user location)
   */
  followMode?: boolean

  /**
   * Navigation mode: satnav (3D tilted) vs overview (2D top-down)
   */
  navigationMode?: 'satnav' | 'overview'

  /**
   * Map height (default: 100%)
   */
  height?: string | number

  /**
   * Map width (default: 100%)
   */
  width?: string | number

  /**
   * Additional CSS classes
   */
  className?: string

  /**
   * Loading state
   */
  loading?: boolean

  /**
   * Error message
   */
  error?: string | null

  /**
   * Callback when map is ready
   */
  onMapReady?: () => void
}

/**
 * MapboxNavigationView Component
 *
 * Professional satnav-style 3D navigation view using Mapbox GL JS.
 * Provides driver-focused navigation with tilted perspective, auto-rotation,
 * and real-time GPS tracking.
 *
 * Features:
 * - 3D perspective with configurable pitch
 * - Auto-rotation based on compass bearing or movement direction
 * - Smooth camera follow mode
 * - Toggle between satnav and overview modes
 * - Route polyline visualization
 * - User location and destination markers
 *
 * @example
 * ```tsx
 * <MapboxNavigationView
 *   userLocation={currentLocation}
 *   destination={propertyLocation}
 *   route={routeData}
 *   bearing={compassBearing}
 *   pitch={60}
 *   followMode={true}
 *   navigationMode="satnav"
 * />
 * ```
 */
export default function MapboxNavigationView({
  userLocation,
  destination,
  route,
  bearing = 0,
  pitch = 60,
  followMode = true,
  navigationMode = 'satnav',
  height = '100%',
  width = '100%',
  className = '',
  loading = false,
  error = null,
  onMapReady,
}: MapboxNavigationViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const [mapReady, setMapReady] = useState(false)
  const [mapboxLoaded, setMapboxLoaded] = useState(false)
  const isInitializingRef = useRef(false)
  const userMarkerRef = useRef<any>(null)
  const destinationMarkerRef = useRef<any>(null)
  const userInteractedRef = useRef(false)
  const lastNavigationModeRef = useRef<string | null>(null)

  /**
   * Load Mapbox GL JS dynamically via CDN
   * This is a temporary solution until we fix the npm workspace issue
   */
  useEffect(() => {
    // Check if mapbox-gl is already loaded
    if (typeof window !== 'undefined' && (window as any).mapboxgl) {
      setMapboxLoaded(true)
      return
    }

    // Load Mapbox CSS
    const link = document.createElement('link')
    link.href = 'https://api.mapbox.com/mapbox-gl-js/v3.0.0/mapbox-gl.css'
    link.rel = 'stylesheet'
    document.head.appendChild(link)

    // Load Mapbox JS
    const script = document.createElement('script')
    script.src = 'https://api.mapbox.com/mapbox-gl-js/v3.0.0/mapbox-gl.js'
    script.async = true
    script.onload = () => {
      setMapboxLoaded(true)
    }
    document.head.appendChild(script)

    return () => {
      // Cleanup
      document.head.removeChild(link)
      document.head.removeChild(script)
    }
  }, [])

  /**
   * Initialize Mapbox map - only once on mount
   */
  useEffect(() => {
    // Prevent multiple initializations (React Strict Mode protection)
    if (!mapboxLoaded || !mapContainerRef.current || mapRef.current || isInitializingRef.current) {
      return
    }

    const mapboxgl = (window as any).mapboxgl
    if (!mapboxgl) return

    // Mark as initializing
    isInitializingRef.current = true

    // Clear container to prevent "container should be empty" warning
    if (mapContainerRef.current) {
      mapContainerRef.current.innerHTML = ''
    }

    try {
      // Set Mapbox access token
      mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN

      // Determine initial center and zoom based on mode
      const center: [number, number] = userLocation
        ? [userLocation.longitude, userLocation.latitude]
        : [destination.longitude, destination.latitude]

      const initialZoom = navigationMode === 'satnav' ? 16 : 12
      const initialPitch = navigationMode === 'satnav' ? pitch : 0
      const initialBearing = navigationMode === 'satnav' ? bearing : 0

      // Create map instance
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/streets-v12', // Using streets style for navigation
        center,
        zoom: initialZoom,
        pitch: initialPitch,
        bearing: initialBearing,
        attributionControl: true,
      })

      // Add navigation controls (zoom buttons)
      map.addControl(new mapboxgl.NavigationControl(), 'bottom-right')

      // Track user interaction
      map.on('dragstart', () => {
        userInteractedRef.current = true
      })
      map.on('zoomstart', () => {
        userInteractedRef.current = true
      })
      map.on('rotatestart', () => {
        userInteractedRef.current = true
      })
      map.on('pitchstart', () => {
        userInteractedRef.current = true
      })

      // Wait for map to load
      map.on('load', () => {
        mapRef.current = map
        setMapReady(true)

        // Create user location marker (will be updated in separate effect)
        if (userLocation) {
          userMarkerRef.current = new mapboxgl.Marker({ color: '#3B82F6' })
            .setLngLat([userLocation.longitude, userLocation.latitude])
            .setPopup(
              new mapboxgl.Popup().setHTML(
                '<div style="text-align: center;"><strong>Your Location</strong></div>'
              )
            )
            .addTo(map)
        }

        // Create destination marker (will be updated in separate effect)
        destinationMarkerRef.current = new mapboxgl.Marker({ color: '#EF4444' })
          .setLngLat([destination.longitude, destination.latitude])
          .setPopup(
            new mapboxgl.Popup().setHTML(
              '<div style="text-align: center;"><strong>Destination</strong></div>'
            )
          )
          .addTo(map)

        // Add route source and layer (will be updated in separate effect)
        map.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: route && route.coordinates.length > 0
                ? route.coordinates.map((coord) => [coord.longitude, coord.latitude])
                : [],
            },
          },
        })

        map.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': '#3B82F6',
            'line-width': 4,
            'line-opacity': 0.7,
          },
        })

        if (onMapReady) {
          onMapReady()
        }
      })

    } catch (err) {
      console.error('Error initializing Mapbox:', err)
    }

    // Cleanup function - only runs when component unmounts
    return () => {
      if (mapRef.current) {
        try {
          mapRef.current.remove()
        } catch (err) {
          console.error('Error removing map:', err)
        }
        mapRef.current = null
      }
      setMapReady(false)
      isInitializingRef.current = false
    }
  }, [mapboxLoaded]) // Only reinitialize if mapbox library loads

  /**
   * Update destination marker when destination changes (marker position ONLY)
   */
  useEffect(() => {
    if (!mapReady || !destinationMarkerRef.current) return

    try {
      destinationMarkerRef.current.setLngLat([destination.longitude, destination.latitude])
    } catch (err) {
      console.error('Error updating destination marker:', err)
    }
  }, [mapReady, destination])

  /**
   * Update user location marker when location changes
   */
  useEffect(() => {
    if (!mapReady || !userLocation) return

    try {
      const mapboxgl = (window as any).mapboxgl

      // Create user marker if it doesn't exist
      if (!userMarkerRef.current && mapRef.current) {
        userMarkerRef.current = new mapboxgl.Marker({ color: '#3B82F6' })
          .setLngLat([userLocation.longitude, userLocation.latitude])
          .setPopup(
            new mapboxgl.Popup().setHTML(
              '<div style="text-align: center;"><strong>Your Location</strong></div>'
            )
          )
          .addTo(mapRef.current)
      } else if (userMarkerRef.current) {
        // Update existing marker position
        userMarkerRef.current.setLngLat([userLocation.longitude, userLocation.latitude])
      }
    } catch (err) {
      console.error('Error updating user location marker:', err)
    }
  }, [mapReady, userLocation])

  /**
   * Update route polyline when route changes
   */
  useEffect(() => {
    if (!mapReady || !mapRef.current) return

    const map = mapRef.current

    try {
      const source = map.getSource('route')
      if (source) {
        source.setData({
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: route && route.coordinates.length > 0
              ? route.coordinates.map((coord) => [coord.longitude, coord.latitude])
              : [],
          },
        })
      }
    } catch (err) {
      console.error('Error updating route:', err)
    }
  }, [mapReady, route])

  /**
   * UNIFIED CAMERA CONTROL - handles all camera movements
   * Only runs when navigationMode changes, not on every GPS update
   */
  useEffect(() => {
    if (!mapReady || !mapRef.current) return

    const map = mapRef.current
    const mapboxgl = (window as any).mapboxgl

    // Check if navigationMode actually changed
    const modeChanged = lastNavigationModeRef.current !== navigationMode
    if (modeChanged) {
      lastNavigationModeRef.current = navigationMode
      // Reset user interaction flag when mode changes
      userInteractedRef.current = false
    }

    // Skip camera updates if user has manually interacted with the map
    // (except when mode changes - always update then)
    if (userInteractedRef.current && !modeChanged) {
      return
    }

    try {
      if (navigationMode === 'satnav') {
        // ===== SATNAV MODE (3D Driver View) =====

        // Determine center point for satnav view
        let centerPoint: [number, number]
        let zoomLevel = 16

        if (followMode && userLocation) {
          // Following user: center on user location
          centerPoint = [userLocation.longitude, userLocation.latitude]
          zoomLevel = 18
        } else if (userLocation) {
          // Not following but have user location: center on user
          centerPoint = [userLocation.longitude, userLocation.latitude]
          zoomLevel = 16
        } else {
          // No user location: center on destination
          centerPoint = [destination.longitude, destination.latitude]
          zoomLevel = 16
        }

        // Apply 3D view with appropriate center and zoom
        map.easeTo({
          center: centerPoint,
          zoom: zoomLevel,
          pitch,
          bearing,
          duration: 600,
        })
      } else {
        // ===== OVERVIEW MODE (2D Top-Down) =====
        // Set 2D view properties
        map.easeTo({
          pitch: 0,
          bearing: 0,
          duration: 300,
        })

        // Fit bounds to show full route
        const bounds = new mapboxgl.LngLatBounds()

        // Add route coordinates if available
        if (route && route.coordinates.length > 0) {
          route.coordinates.forEach((coord) => {
            if (coord && typeof coord.longitude === 'number' && typeof coord.latitude === 'number') {
              bounds.extend([coord.longitude, coord.latitude])
            }
          })
        } else {
          // No route - fit bounds to show user location and destination
          if (userLocation && typeof userLocation.longitude === 'number' && typeof userLocation.latitude === 'number') {
            bounds.extend([userLocation.longitude, userLocation.latitude])
          }
          if (destination && typeof destination.longitude === 'number' && typeof destination.latitude === 'number') {
            bounds.extend([destination.longitude, destination.latitude])
          }
        }

        // Only fit bounds if we have at least 2 points
        if (!bounds.isEmpty()) {
          map.fitBounds(bounds, {
            padding: 80,
            duration: 600,
            maxZoom: 15,
          })
        }
      }
    } catch (err) {
      console.error('Error updating camera:', err)
    }
  }, [mapReady, navigationMode, followMode, userLocation, destination, pitch, bearing, route])

  // Show loading state
  if (loading || !mapboxLoaded) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}
        style={{ height, width }}
        role="status"
        aria-label="Loading map"
      >
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
          <p className="text-sm text-gray-600">
            {mapboxLoaded ? 'Initializing map...' : 'Loading Mapbox GL...'}
          </p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div
        className={`flex items-center justify-center bg-red-50 border-2 border-red-200 rounded-lg ${className}`}
        style={{ height, width }}
        role="alert"
        aria-label="Map error"
      >
        <div className="text-center px-4">
          <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-red-800 mb-1">Map Error</p>
          <p className="text-xs text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`} style={{ height, width }}>
      {/* Mapbox map container */}
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

      {/* Navigation mode indicator */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg px-3 py-2 z-10">
        <p className="text-xs font-semibold text-gray-700 uppercase">
          {navigationMode === 'satnav' ? 'Driver View' : 'Overview'}
        </p>
      </div>
    </div>
  )
}
