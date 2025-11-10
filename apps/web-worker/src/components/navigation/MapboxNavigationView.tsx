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
   * Initialize Mapbox map
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

      // Wait for map to load
      map.on('load', () => {
        mapRef.current = map
        setMapReady(true)

        // Add user location marker
        if (userLocation) {
          new mapboxgl.Marker({ color: '#3B82F6' })
            .setLngLat([userLocation.longitude, userLocation.latitude])
            .setPopup(
              new mapboxgl.Popup().setHTML(
                '<div style="text-align: center;"><strong>Your Location</strong></div>'
              )
            )
            .addTo(map)
        }

        // Add destination marker
        new mapboxgl.Marker({ color: '#EF4444' })
          .setLngLat([destination.longitude, destination.latitude])
          .setPopup(
            new mapboxgl.Popup().setHTML(
              '<div style="text-align: center;"><strong>Destination</strong></div>'
            )
          )
          .addTo(map)

        // Add route polyline if available
        if (route && route.coordinates.length > 0) {
          map.addSource('route', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: route.coordinates.map((coord) => [
                  coord.longitude,
                  coord.latitude,
                ]),
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
        }

        if (onMapReady) {
          onMapReady()
        }
      })

    } catch (err) {
      console.error('Error initializing Mapbox:', err)
    }

    // Cleanup function
    return () => {
      isInitializingRef.current = false
      if (mapRef.current) {
        try {
          mapRef.current.remove()
        } catch (err) {
          console.error('Error removing map:', err)
        }
        mapRef.current = null
      }
      // Clear container on cleanup
      if (mapContainerRef.current) {
        mapContainerRef.current.innerHTML = ''
      }
      setMapReady(false)
    }
  }, [mapboxLoaded, destination, onMapReady])

  /**
   * Update camera position when user location changes (follow mode)
   */
  useEffect(() => {
    if (!mapReady || !mapRef.current || !followMode || !userLocation) return

    const map = mapRef.current

    try {
      // Smooth camera transition to user location
      map.easeTo({
        center: [userLocation.longitude, userLocation.latitude],
        zoom: navigationMode === 'satnav' ? 18 : map.getZoom(),
        bearing: navigationMode === 'satnav' ? bearing : 0,
        pitch: navigationMode === 'satnav' ? pitch : 0,
        duration: 1000,
        essential: true,
      })
    } catch (err) {
      console.error('Error updating camera:', err)
    }
  }, [mapReady, followMode, userLocation, bearing, pitch, navigationMode])

  /**
   * Update navigation mode (satnav vs overview)
   */
  useEffect(() => {
    if (!mapReady || !mapRef.current) return

    const map = mapRef.current

    try {
      if (navigationMode === 'satnav') {
        // Satnav mode: 3D tilted view, auto-follow
        map.easeTo({
          pitch,
          zoom: 18,
          bearing,
          duration: 800,
        })
      } else {
        // Overview mode: 2D top-down, fit route bounds
        map.easeTo({
          pitch: 0,
          bearing: 0,
          duration: 800,
        })

        // Fit bounds to show full route (or at least user + destination)
        const mapboxgl = (window as any).mapboxgl
        const bounds = new mapboxgl.LngLatBounds()

        // Add route coordinates if available
        if (route && route.coordinates.length > 0) {
          route.coordinates.forEach((coord) => {
            bounds.extend([coord.longitude, coord.latitude])
          })
        } else {
          // No route - fit bounds to show user location and destination
          if (userLocation) {
            bounds.extend([userLocation.longitude, userLocation.latitude])
          }
          bounds.extend([destination.longitude, destination.latitude])
        }

        // Only fit bounds if we have at least 2 points
        if (!bounds.isEmpty()) {
          map.fitBounds(bounds, {
            padding: 80,
            duration: 800,
          })
        }
      }
    } catch (err) {
      console.error('Error updating navigation mode:', err)
    }
  }, [mapReady, navigationMode, pitch, bearing, route])

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
