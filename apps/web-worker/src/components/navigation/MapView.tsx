import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L, { LatLngBounds, LatLngTuple } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Coordinates } from '@rightfit/shared/types/navigation'
import { Loader2, AlertCircle, Navigation2, Home } from 'lucide-react'

// Fix for default marker icons in Leaflet with Vite
// Leaflet's default icon paths don't work with Vite's asset handling
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
})

/**
 * Route data for map visualization
 */
export interface RouteData {
  /**
   * Array of coordinates forming the route polyline
   */
  coordinates: Coordinates[]

  /**
   * Total distance in meters
   */
  distance_meters: number

  /**
   * Estimated duration in seconds
   */
  duration_seconds: number
}

/**
 * Props for MapView component
 */
export interface MapViewProps {
  /**
   * User's current location (optional)
   */
  userLocation?: Coordinates | null

  /**
   * Destination location (required)
   */
  destination: Coordinates

  /**
   * Destination address for popup
   */
  destinationAddress?: string

  /**
   * Route data for polyline display (optional)
   */
  route?: RouteData | null

  /**
   * Map height (default: 400px)
   */
  height?: string | number

  /**
   * Map width (default: 100%)
   */
  width?: string | number

  /**
   * Show user location marker (default: true)
   */
  showUserMarker?: boolean

  /**
   * Show destination marker (default: true)
   */
  showDestinationMarker?: boolean

  /**
   * Show route polyline (default: true if route provided)
   */
  showRoute?: boolean

  /**
   * Auto-fit bounds to show all markers and route (default: true)
   */
  autoFitBounds?: boolean

  /**
   * Default zoom level if not auto-fitting (default: 13)
   */
  defaultZoom?: number

  /**
   * Enable follow mode (center map on user location continuously)
   */
  followMode?: boolean

  /**
   * Zoom level for follow mode (default: 16)
   */
  followZoom?: number

  /**
   * Programmatically zoom to a specific location
   */
  zoomTarget?: { lat: number; lng: number; zoom: number } | null

  /**
   * Callback when zoom animation completes
   */
  onZoomComplete?: () => void

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
 * Component to handle auto-fitting map bounds
 * Only runs once on mount to prevent zoom resetting on user interaction
 */
function MapBoundsHandler({
  userLocation,
  destination,
  route,
  autoFitBounds,
}: {
  userLocation?: Coordinates | null
  destination: Coordinates
  route?: RouteData | null
  autoFitBounds: boolean
}) {
  const map = useMap()
  const hasAutoFittedRef = useRef(false)

  useEffect(() => {
    // Only auto-fit once when the component mounts and we have the necessary data
    if (!autoFitBounds || hasAutoFittedRef.current) return

    const bounds = new LatLngBounds([])

    // Add user location to bounds
    if (userLocation) {
      bounds.extend([userLocation.latitude, userLocation.longitude])
    }

    // Add destination to bounds
    bounds.extend([destination.latitude, destination.longitude])

    // Add route coordinates to bounds
    if (route && route.coordinates.length > 0) {
      route.coordinates.forEach((coord) => {
        bounds.extend([coord.latitude, coord.longitude])
      })
    }

    // Fit map to bounds with padding
    if (bounds.isValid()) {
      map.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 15,
      })
      hasAutoFittedRef.current = true
    }
  }, [map, userLocation, destination, route, autoFitBounds])

  return null
}

/**
 * Component to handle follow mode (center map on user location)
 */
function FollowModeHandler({
  userLocation,
  followMode,
  zoom,
}: {
  userLocation?: Coordinates | null
  followMode: boolean
  zoom?: number
}) {
  const map = useMap()

  useEffect(() => {
    if (!followMode || !userLocation) return

    // Center map on user location
    map.setView([userLocation.latitude, userLocation.longitude], zoom || map.getZoom(), {
      animate: true,
      duration: 0.5,
    })
  }, [map, userLocation, followMode, zoom])

  return null
}

/**
 * Component to handle programmatic zoom to specific locations
 */
function ZoomTargetHandler({
  zoomTarget,
  onZoomComplete,
}: {
  zoomTarget?: { lat: number; lng: number; zoom: number } | null
  onZoomComplete?: () => void
}) {
  const map = useMap()

  useEffect(() => {
    if (!zoomTarget) return

    // Zoom to target location
    map.setView([zoomTarget.lat, zoomTarget.lng], zoomTarget.zoom, {
      animate: true,
      duration: 0.8,
    })

    // Call completion callback after animation
    if (onZoomComplete) {
      setTimeout(() => {
        onZoomComplete()
      }, 800)
    }
  }, [map, zoomTarget, onZoomComplete])

  return null
}

/**
 * MapView Component
 *
 * Interactive map using Leaflet.js and OpenStreetMap tiles.
 * Displays user location, destination, and optional route polyline.
 *
 * Features:
 * - User location marker (blue)
 * - Destination marker (red)
 * - Route polyline visualization
 * - Auto-fit bounds to show all markers
 * - Responsive and mobile-friendly
 * - Accessible with keyboard navigation
 * - Loading and error states
 * - Customizable height and zoom
 *
 * @example
 * ```tsx
 * <MapView
 *   userLocation={{ latitude: 51.5074, longitude: -0.1278 }}
 *   destination={{ latitude: 51.5007, longitude: -0.1246 }}
 *   destinationAddress="Big Ben, London"
 *   route={routeData}
 *   height="500px"
 * />
 * ```
 */
export default function MapView({
  userLocation,
  destination,
  destinationAddress,
  route,
  height = '400px',
  width = '100%',
  showUserMarker = true,
  showDestinationMarker = true,
  showRoute = true,
  autoFitBounds = true,
  defaultZoom = 13,
  followMode = false,
  followZoom = 16,
  zoomTarget = null,
  onZoomComplete,
  className = '',
  loading = false,
  error = null,
  onMapReady,
}: MapViewProps) {
  const [mapReady, setMapReady] = useState(false)
  const mapRef = useRef<L.Map | null>(null)

  /**
   * Calculate map center based on available location data
   */
  const getMapCenter = (): LatLngTuple => {
    if (userLocation) {
      return [userLocation.latitude, userLocation.longitude]
    }
    return [destination.latitude, destination.longitude]
  }

  /**
   * Format distance for display
   */
  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`
    }
    return `${(meters / 1000).toFixed(1)}km`
  }

  /**
   * Format duration for display
   */
  const formatDuration = (seconds: number): string => {
    const minutes = Math.round(seconds / 60)
    if (minutes < 60) {
      return `${minutes}min`
    }
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours}h ${remainingMinutes}min`
  }

  /**
   * Create custom icon for user location
   */
  const userIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.5 0C5.596 0 0 5.596 0 12.5c0 9.375 12.5 28.125 12.5 28.125S25 21.875 25 12.5C25 5.596 19.404 0 12.5 0z" fill="#3B82F6"/>
        <circle cx="12.5" cy="12.5" r="6" fill="white"/>
      </svg>
    `),
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [0, -41],
  })

  /**
   * Create custom icon for destination
   */
  const destinationIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.5 0C5.596 0 0 5.596 0 12.5c0 9.375 12.5 28.125 12.5 28.125S25 21.875 25 12.5C25 5.596 19.404 0 12.5 0z" fill="#EF4444"/>
        <circle cx="12.5" cy="12.5" r="6" fill="white"/>
      </svg>
    `),
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [0, -41],
  })

  /**
   * Convert route coordinates to Leaflet format
   */
  const getRoutePolyline = (): LatLngTuple[] | null => {
    if (!route || !route.coordinates || route.coordinates.length === 0) {
      return null
    }
    return route.coordinates.map((coord) => [coord.latitude, coord.longitude])
  }

  /**
   * Handle map initialization
   */
  const handleMapCreated = (map: L.Map) => {
    mapRef.current = map
    setMapReady(true)
    if (onMapReady) {
      onMapReady()
    }
  }

  // Show loading state
  if (loading) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}
        style={{ height, width }}
        role="status"
        aria-label="Loading map"
      >
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
          <p className="text-sm text-gray-600">Loading map...</p>
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

  const routePolyline = showRoute ? getRoutePolyline() : null

  return (
    <div className={`relative ${className}`} style={{ height, width }}>
      <MapContainer
        center={getMapCenter()}
        zoom={defaultZoom}
        style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
        ref={handleMapCreated}
        scrollWheelZoom={true}
        zoomControl={true}
        attributionControl={true}
      >
        {/* OpenStreetMap tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User location marker */}
        {showUserMarker && userLocation && (
          <Marker
            position={[userLocation.latitude, userLocation.longitude]}
            icon={userIcon}
          >
            <Popup>
              <div className="text-center">
                <Navigation2 className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                <p className="font-semibold text-sm">Your Location</p>
                {userLocation.accuracy && (
                  <p className="text-xs text-gray-600">
                    Accuracy: ±{Math.round(userLocation.accuracy)}m
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        )}

        {/* Destination marker */}
        {showDestinationMarker && (
          <Marker
            position={[destination.latitude, destination.longitude]}
            icon={destinationIcon}
          >
            <Popup>
              <div className="text-center">
                <Home className="w-5 h-5 text-red-600 mx-auto mb-1" />
                <p className="font-semibold text-sm">Destination</p>
                {destinationAddress && (
                  <p className="text-xs text-gray-600 mt-1">{destinationAddress}</p>
                )}
              </div>
            </Popup>
          </Marker>
        )}

        {/* Route polyline */}
        {routePolyline && routePolyline.length > 0 && (
          <Polyline
            positions={routePolyline}
            pathOptions={{
              color: '#3B82F6',
              weight: 4,
              opacity: 0.7,
            }}
          />
        )}

        {/* Auto-fit bounds handler */}
        <MapBoundsHandler
          userLocation={userLocation}
          destination={destination}
          route={route}
          autoFitBounds={autoFitBounds && !followMode}
        />

        {/* Follow mode handler */}
        <FollowModeHandler
          userLocation={userLocation}
          followMode={followMode}
          zoom={followZoom}
        />

        {/* Zoom target handler */}
        <ZoomTargetHandler
          zoomTarget={zoomTarget}
          onZoomComplete={onZoomComplete}
        />
      </MapContainer>

      {/* Route info overlay - positioned top-right to avoid covering zoom controls */}
      {route && (
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg px-4 py-2 z-[1000]">
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-1">
              <span className="font-semibold text-gray-700">Distance:</span>
              <span className="text-blue-600 font-medium">
                {formatDistance(route.distance_meters)}
              </span>
            </div>
            <div className="w-px h-4 bg-gray-300" />
            <div className="flex items-center gap-1">
              <span className="font-semibold text-gray-700">Time:</span>
              <span className="text-blue-600 font-medium">
                {formatDuration(route.duration_seconds)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
