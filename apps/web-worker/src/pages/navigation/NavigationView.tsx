import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  MapPin,
  Home,
  Navigation2,
  Clock,
  Ruler,
  Loader2,
  AlertCircle,
  ChevronRight,
  RefreshCw,
  Cloud,
  Car,
  Layers,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useGeolocation } from '../../hooks/useGeolocation'
import MapboxNavigationView from '../../components/navigation/MapboxNavigationView'
import WeatherAlert from '../../components/navigation/WeatherAlert'
import TrafficAlert from '../../components/navigation/TrafficAlert'
import type { Coordinates } from '@rightfit/shared/types/navigation'
import { decodePolyline } from '../../utils/polyline'

/**
 * Route data for MapboxNavigationView
 */
export interface RouteData {
  coordinates: Coordinates[]
  distance_meters: number
  duration_seconds: number
}

/**
 * Property details from navigation API
 */
interface PropertyDetails {
  property_id: string
  property_name: string
  property_address: string
  latitude: number
  longitude: number
  location_type: string
  plus_code: string | null
  what3words: string | null
  geocoded_at: string | null
}

/**
 * Complete navigation data from API
 */
interface NavigationData {
  property: PropertyDetails
  distance?: {
    distance_meters: number
    distance_km: number
    distance_miles: number
  } | null
  route?: {
    distance_meters: number
    duration_seconds: number
    steps: Array<{
      instruction: string
      distance_meters: number
      duration_seconds: number
      maneuver?: string
    }>
    polyline?: string
  } | null
  user_location?: Coordinates | null
}

/**
 * Route step with coordinates for map polyline
 */
interface RouteStep {
  instruction: string
  distance_meters: number
  duration_seconds: number
  maneuver?: string
}

/**
 * NavigationView Page Component
 *
 * Full navigation view for a specific property with:
 * - Interactive map with route
 * - Turn-by-turn directions
 * - Weather conditions and safety recommendations
 * - Distance and ETA information
 * - Navigation button to open native maps
 *
 * API Endpoint: GET /api/navigation/property/:propertyId
 */
export default function NavigationView() {
  const { propertyId } = useParams<{ propertyId: string }>()
  const { worker } = useAuth()
  const navigate = useNavigate()
  const {
    location: userLocation,
    requestLocation,
    loading: locationLoading,
    startWatching,
    stopWatching,
    isWatching,
  } = useGeolocation({}, true) // Request on mount

  const [navData, setNavData] = useState<NavigationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDirections, setShowDirections] = useState(false)
  const [showWeather, setShowWeather] = useState(false)
  const [showTraffic, setShowTraffic] = useState(false)
  const [followMode, setFollowMode] = useState(false)
  const [mapZoomTarget, setMapZoomTarget] = useState<{ lat: number; lng: number; zoom: number } | null>(null)
  const [useMapbox, setUseMapbox] = useState(true) // Default to 3D Mapbox satnav view

  /**
   * Fetch navigation data from API
   */
  const fetchNavigationData = async () => {
    if (!worker || !propertyId || !userLocation) return

    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem('worker_token')

      // Build URL with user location (required by API)
      const url = `/api/navigation/property/${propertyId}?user_lat=${userLocation.latitude}&user_lon=${userLocation.longitude}`

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to load navigation data')
      }

      const responseData = await response.json()
      setNavData(responseData.data)
    } catch (err) {
      console.error('Error fetching navigation data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load navigation data')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Fetch navigation data on mount and when user location changes
   */
  useEffect(() => {
    if (userLocation) {
      fetchNavigationData()
    }
  }, [worker, propertyId, userLocation])

  /**
   * Handle GPS tracking lifecycle for follow mode
   */
  useEffect(() => {
    if (followMode && !isWatching) {
      startWatching()
    } else if (!followMode && isWatching) {
      stopWatching()
    }

    // Cleanup on unmount
    return () => {
      if (isWatching) {
        stopWatching()
      }
    }
  }, [followMode, isWatching, startWatching, stopWatching])

  /**
   * Zoom map to user's current location
   */
  const zoomToUserLocation = () => {
    if (!userLocation) return
    setMapZoomTarget({
      lat: userLocation.latitude,
      lng: userLocation.longitude,
      zoom: 16,
    })
  }

  /**
   * Zoom map to destination location
   */
  const zoomToDestination = () => {
    if (!navData?.property) return
    setMapZoomTarget({
      lat: navData.property.latitude,
      lng: navData.property.longitude,
      zoom: 16,
    })
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
   * Get maneuver icon
   */
  const getManeuverIcon = (maneuver?: string): React.ReactNode => {
    // Based on OSRM maneuver types
    if (!maneuver) return <ChevronRight className="w-4 h-4" />

    const iconClass = "w-4 h-4"

    // Simplified maneuver mapping - in production, use full OSRM maneuver types
    if (maneuver.includes('left')) return <span className={iconClass}>⬅️</span>
    if (maneuver.includes('right')) return <span className={iconClass}>➡️</span>
    if (maneuver.includes('straight')) return <span className={iconClass}>⬆️</span>
    if (maneuver.includes('u-turn')) return <span className={iconClass}>↩️</span>

    return <ChevronRight className={iconClass} />
  }

  /**
   * Convert route data to MapView format
   */
  const getMapRouteData = (): RouteData | null => {
    if (!navData?.route || !userLocation) return null

    // Decode polyline if available
    let coordinates: Coordinates[] = []

    if (navData.route.polyline) {
      try {
        // OSRM uses precision 5 for polylines
        coordinates = decodePolyline(navData.route.polyline, 5)
      } catch (error) {
        console.error('Error decoding polyline:', error)
        // Fall back to straight line between origin and destination
        coordinates = []
      }
    }

    return {
      coordinates,
      distance_meters: navData.route.distance_meters,
      duration_seconds: navData.route.duration_seconds,
    }
  }

  /**
   * Memoized route data to prevent unnecessary re-renders
   * Only recalculates when route or user location changes
   */
  const memoizedRouteData = useMemo(() => {
    return getMapRouteData()
  }, [navData?.route, userLocation])

  /**
   * Memoized route coordinates to prevent infinite re-renders in TrafficAlert
   * Only recalculates when route data changes
   */
  const memoizedRouteCoordinates = useMemo(() => {
    return memoizedRouteData?.coordinates || []
  }, [memoizedRouteData])

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b sticky top-0 z-10">
          <div className="px-4 py-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-bold text-gray-900">Navigation</h1>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
            <p className="text-sm text-gray-600">Loading navigation...</p>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !navData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b sticky top-0 z-10">
          <div className="px-4 py-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-bold text-gray-900">Navigation</h1>
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-red-800 text-sm">Error</p>
                <p className="text-xs text-red-600 mt-1">{error || 'Failed to load navigation'}</p>
                <button
                  onClick={fetchNavigationData}
                  className="mt-2 px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const { property, distance, route } = navData
  const destination: Coordinates = {
    latitude: property.latitude,
    longitude: property.longitude,
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-bold text-gray-900">Navigation</h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFollowMode(!followMode)}
                className={`p-2 rounded-lg transition-colors ${
                  followMode
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
                aria-label={followMode ? 'Disable follow mode' : 'Enable follow mode'}
                title={followMode ? 'Following your location' : 'Follow my location'}
              >
                <Navigation2 className="w-5 h-5" />
              </button>
              <button
                onClick={fetchNavigationData}
                className="p-2 hover:bg-gray-100 rounded-lg"
                aria-label="Refresh"
                title="Refresh navigation data"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="p-4 relative">
        {/* Map View Toggle Button */}
        <button
          onClick={() => setUseMapbox(!useMapbox)}
          className="absolute bottom-6 left-6 z-10 bg-white rounded-lg shadow-lg px-3 py-2 flex items-center gap-2 hover:bg-gray-50 transition-colors border border-gray-200"
          title={useMapbox ? 'Switch to Overview' : 'Switch to Driver View'}
        >
          {useMapbox ? (
            <Layers className="w-4 h-4 text-gray-700" />
          ) : (
            <Car className="w-4 h-4 text-gray-700" />
          )}
          <span className="text-xs font-semibold text-gray-700">
            {useMapbox ? 'Overview' : 'Drive'}
          </span>
        </button>

        {/* Conditional Map Rendering - Both use Mapbox now */}
        <MapboxNavigationView
          userLocation={userLocation}
          destination={destination}
          route={memoizedRouteData}
          height="300px"
          followMode={useMapbox ? followMode : false}
          navigationMode={useMapbox ? "satnav" : "overview"}
          pitch={useMapbox ? 60 : 0}
          bearing={0}
          className="shadow-lg"
        />
      </div>

      {/* Property Info */}
      <div className="px-4 mb-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="flex items-start gap-3 mb-3">
            <div className="flex gap-2">
              <button
                onClick={zoomToUserLocation}
                disabled={!userLocation}
                className="p-2 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Zoom to my location"
                aria-label="Zoom to my location"
              >
                <Home className="w-6 h-6 text-blue-600" />
              </button>
              <button
                onClick={zoomToDestination}
                className="p-2 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
                title="Zoom to destination"
                aria-label="Zoom to destination"
              >
                <MapPin className="w-6 h-6 text-red-600" />
              </button>
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-lg text-gray-900 mb-1">{property.property_name}</h2>
              <p className="text-sm text-gray-600">{property.property_address}</p>
            </div>
          </div>

          {/* Distance and ETA */}
          {distance && route && (
            <div className="grid grid-cols-2 gap-4 mb-3 pb-3 border-b">
              <div className="flex items-center gap-2">
                <Ruler className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-600">Distance</p>
                  <p className="font-semibold text-gray-900">
                    {formatDistance(distance.distance_meters)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-600">ETA</p>
                  <p className="font-semibold text-gray-900">
                    {formatDuration(route.duration_seconds)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Plus Code and what3words */}
          {(property.plus_code || property.what3words) && (
            <div className="text-xs text-gray-600 space-y-1">
              {property.plus_code && (
                <p>
                  <span className="font-semibold">Plus Code:</span>{' '}
                  <span className="font-mono">{property.plus_code}</span>
                </p>
              )}
              {property.what3words && (
                <p>
                  <span className="font-semibold">what3words:</span>{' '}
                  <span className="font-mono text-red-600">/{property.what3words}/</span>
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Weather Conditions - Collapsible */}
      {userLocation && (
        <div className="px-4 mb-4">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <button
              onClick={() => setShowWeather(!showWeather)}
              className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Cloud className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-gray-900">
                  Weather Conditions
                </span>
              </div>
              <ChevronRight
                className={`w-5 h-5 text-gray-400 transition-transform ${
                  showWeather ? 'rotate-90' : ''
                }`}
              />
            </button>

            {!showWeather && (
              <div className="px-4 pb-3">
                <WeatherAlert location={destination} compact refreshInterval={30} />
              </div>
            )}

            {showWeather && (
              <div className="p-4">
                <WeatherAlert location={destination} detailed refreshInterval={30} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Traffic Conditions - Collapsible */}
      {userLocation && route && getMapRouteData()?.coordinates && (
        <div className="px-4 mb-4">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <button
              onClick={() => setShowTraffic(!showTraffic)}
              className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Car className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-gray-900">
                  Traffic Conditions
                </span>
              </div>
              <ChevronRight
                className={`w-5 h-5 text-gray-400 transition-transform ${
                  showTraffic ? 'rotate-90' : ''
                }`}
              />
            </button>

            {!showTraffic && (
              <div className="px-4 pb-3">
                <TrafficAlert
                  routeCoordinates={memoizedRouteCoordinates}
                  refreshInterval={0}
                  compact
                />
              </div>
            )}

            {showTraffic && (
              <div className="p-4">
                <TrafficAlert
                  routeCoordinates={memoizedRouteCoordinates}
                  refreshInterval={0}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Location Permission Banner */}
      {!userLocation && !locationLoading && (
        <div className="px-4 mb-4">
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Navigation2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-blue-900 text-sm">Enable Location</p>
                <p className="text-xs text-blue-700 mt-1">
                  Share your location to see route, distance, and ETA
                </p>
                <button
                  onClick={requestLocation}
                  className="mt-2 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                >
                  Share Location
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Turn-by-turn directions */}
      {route && route.steps.length > 0 && (
        <div className="px-4 mb-4">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <button
              onClick={() => setShowDirections(!showDirections)}
              className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Navigation2 className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-gray-900">
                  Turn-by-Turn Directions
                </span>
                <span className="text-xs text-gray-600">
                  ({route.steps.length} steps)
                </span>
              </div>
              <ChevronRight
                className={`w-5 h-5 text-gray-400 transition-transform ${
                  showDirections ? 'rotate-90' : ''
                }`}
              />
            </button>

            {showDirections && (
              <div className="divide-y">
                {route.steps.map((step, index) => (
                  <div key={index} className="px-4 py-3 flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start gap-2 mb-1">
                        {getManeuverIcon(step.maneuver)}
                        <p className="text-sm text-gray-900">{step.instruction}</p>
                      </div>
                      <p className="text-xs text-gray-600">
                        {formatDistance(step.distance_meters)} ·{' '}
                        {formatDuration(step.duration_seconds)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
