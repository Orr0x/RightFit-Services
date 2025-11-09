import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MapPin,
  Navigation2,
  Search,
  Loader2,
  AlertCircle,
  Home,
  Calendar,
  ArrowLeft,
  SlidersHorizontal,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useGeolocation } from '../../hooks/useGeolocation'
import type { Coordinates } from '@rightfit/shared/types/navigation'

/**
 * Property location data with distance/ETA info
 */
interface PropertyLocation {
  property_id: string
  property_name: string
  property_address: string
  latitude: number
  longitude: number
  location_type: string
  plus_code: string | null
  what3words: string | null
  job_count: number
  distance_meters?: number
  distance_km?: number
  distance_miles?: number
  eta_minutes?: number
}

/**
 * Sort options for property list
 */
type SortOption = 'distance' | 'name' | 'jobs'

/**
 * MyLocations Page Component
 *
 * Displays all unique property locations where the worker has jobs.
 * Shows distance from user's current location and provides navigation options.
 *
 * Features:
 * - List of all job properties
 * - Distance and ETA calculations
 * - Search by property name or address
 * - Sort by distance, name, or job count
 * - Navigate to any property
 * - View property details
 * - Geolocation integration
 * - Mobile-responsive design
 * - Loading and error states
 *
 * API Endpoint: GET /api/navigation/my-locations
 */
export default function MyLocations() {
  const { worker } = useAuth()
  const navigate = useNavigate()
  const { location: userLocation, requestLocation, loading: locationLoading } = useGeolocation()

  const [locations, setLocations] = useState<PropertyLocation[]>([])
  const [filteredLocations, setFilteredLocations] = useState<PropertyLocation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('distance')
  const [showFilters, setShowFilters] = useState(false)

  /**
   * Fetch property locations from API
   */
  const fetchLocations = async () => {
    if (!worker) return

    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem('worker_token')

      // Build URL with optional user location
      let url = '/api/navigation/my-locations'
      if (userLocation) {
        url += `?user_lat=${userLocation.latitude}&user_lon=${userLocation.longitude}`
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to load locations')
      }

      const data = await response.json()
      setLocations(data.data || [])
      setFilteredLocations(data.data || [])
    } catch (err) {
      console.error('Error fetching locations:', err)
      setError(err instanceof Error ? err.message : 'Failed to load locations')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Fetch locations on mount and when user location changes
   */
  useEffect(() => {
    fetchLocations()
  }, [worker, userLocation])

  /**
   * Filter locations based on search query
   */
  useEffect(() => {
    let filtered = [...locations]

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (loc) =>
          loc.property_name.toLowerCase().includes(query) ||
          loc.property_address.toLowerCase().includes(query)
      )
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'distance':
          if (!a.distance_meters || !b.distance_meters) {
            return a.property_name.localeCompare(b.property_name)
          }
          return a.distance_meters - b.distance_meters

        case 'name':
          return a.property_name.localeCompare(b.property_name)

        case 'jobs':
          return b.job_count - a.job_count

        default:
          return 0
      }
    })

    setFilteredLocations(filtered)
  }, [searchQuery, sortBy, locations])

  /**
   * Format distance for display
   */
  const formatDistance = (location: PropertyLocation): string => {
    if (!location.distance_km) return 'Distance unknown'

    if (location.distance_km < 1) {
      return `${Math.round(location.distance_meters!)}m away`
    }
    return `${location.distance_km.toFixed(1)}km away`
  }

  /**
   * Format ETA for display
   */
  const formatETA = (minutes?: number): string => {
    if (!minutes) return ''

    if (minutes < 60) {
      return `${Math.round(minutes)}min`
    }
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = Math.round(minutes % 60)
    return `${hours}h ${remainingMinutes}min`
  }

  /**
   * Get location type badge color
   */
  const getLocationTypeBadge = (type: string): { color: string; text: string } => {
    switch (type) {
      case 'ADDRESS':
        return { color: 'bg-green-100 text-green-800', text: 'Address' }
      case 'RURAL':
        return { color: 'bg-amber-100 text-amber-800', text: 'Rural' }
      case 'REMOTE':
        return { color: 'bg-orange-100 text-orange-800', text: 'Remote' }
      case 'COORDINATES_ONLY':
        return { color: 'bg-gray-100 text-gray-800', text: 'Coordinates' }
      case 'PLUS_CODE':
        return { color: 'bg-blue-100 text-blue-800', text: 'Plus Code' }
      default:
        return { color: 'bg-gray-100 text-gray-800', text: type }
    }
  }

  /**
   * Navigate to property details or navigation page
   */
  const handlePropertyClick = (propertyId: string) => {
    navigate(`/navigation/${propertyId}`)
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b sticky top-0 z-10">
          <div className="px-4 py-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-bold text-gray-900">My Locations</h1>
            </div>
          </div>
        </div>

        {/* Loading content */}
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
            <p className="text-sm text-gray-600">Loading locations...</p>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b sticky top-0 z-10">
          <div className="px-4 py-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-bold text-gray-900">My Locations</h1>
            </div>
          </div>
        </div>

        {/* Error content */}
        <div className="p-4">
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-red-800 text-sm">Error Loading Locations</p>
                <p className="text-xs text-red-600 mt-1">{error}</p>
                <button
                  onClick={fetchLocations}
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

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-bold text-gray-900">My Locations</h1>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 hover:bg-gray-100 rounded-lg"
              aria-label="Toggle filters"
            >
              <SlidersHorizontal className="w-5 h-5" />
            </button>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs font-semibold text-gray-700 mb-2">Sort by:</p>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setSortBy('distance')}
                  className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${
                    sortBy === 'distance'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300'
                  }`}
                >
                  Distance
                </button>
                <button
                  onClick={() => setSortBy('name')}
                  className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${
                    sortBy === 'name'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300'
                  }`}
                >
                  Name
                </button>
                <button
                  onClick={() => setSortBy('jobs')}
                  className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${
                    sortBy === 'jobs'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300'
                  }`}
                >
                  Job Count
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Location permission banner */}
      {!userLocation && !locationLoading && (
        <div className="mx-4 mt-4">
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-blue-900 text-sm">Enable Location</p>
                <p className="text-xs text-blue-700 mt-1">
                  Share your location to see distances and ETAs
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

      {/* Location count */}
      <div className="px-4 py-3 bg-white border-b">
        <p className="text-sm text-gray-600">
          {filteredLocations.length} {filteredLocations.length === 1 ? 'location' : 'locations'}
          {searchQuery && ` matching "${searchQuery}"`}
        </p>
      </div>

      {/* Locations list */}
      <div className="px-4 py-4 space-y-3">
        {filteredLocations.length === 0 ? (
          <div className="text-center py-12">
            <Home className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="font-medium text-gray-900 mb-1">No locations found</p>
            <p className="text-sm text-gray-600">
              {searchQuery ? 'Try a different search' : 'You have no scheduled jobs'}
            </p>
          </div>
        ) : (
          filteredLocations.map((location) => {
            const locationBadge = getLocationTypeBadge(location.location_type)

            return (
              <div
                key={location.property_id}
                className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-900">{location.property_name}</h3>
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full ${locationBadge.color}`}
                      >
                        {locationBadge.text}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 flex items-start gap-1">
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{location.property_address}</span>
                    </p>
                  </div>
                </div>

                {/* Distance and job info */}
                <div className="flex items-center gap-4 mb-3 text-sm">
                  {location.distance_km !== undefined && (
                    <div className="flex items-center gap-1 text-gray-700">
                      <Navigation2 className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">{formatDistance(location)}</span>
                      {location.eta_minutes && (
                        <span className="text-gray-500">
                          · {formatETA(location.eta_minutes)}
                        </span>
                      )}
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-gray-700">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span>
                      {location.job_count} {location.job_count === 1 ? 'job' : 'jobs'}
                    </span>
                  </div>
                </div>

                {/* Plus Code and what3words */}
                {(location.plus_code || location.what3words) && (
                  <div className="mb-3 text-xs text-gray-600 space-y-1">
                    {location.plus_code && (
                      <p>Plus Code: <span className="font-mono">{location.plus_code}</span></p>
                    )}
                    {location.what3words && (
                      <p>what3words: <span className="font-mono text-red-600">/{location.what3words}/</span></p>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePropertyClick(location.property_id)}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Navigation2 className="w-4 h-4" />
                    Navigate Here
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
