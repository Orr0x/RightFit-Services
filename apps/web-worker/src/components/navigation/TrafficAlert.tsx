import { useEffect, useState } from 'react'
import {
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle,
  Loader2,
  Car,
  Clock,
  MapPin,
  TrendingUp,
  X,
} from 'lucide-react'
import type { Coordinates } from '@rightfit/shared/types/navigation'

/**
 * Traffic incident from API
 */
export interface TrafficIncident {
  id: string
  type: string
  description: string
  severity: 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE'
  location: {
    latitude: number
    longitude: number
  }
  delay_minutes: number
  start_time: string
  end_time: string
  affected_roads: string[]
  from: string
  to: string
}

/**
 * Traffic flow data
 */
export interface TrafficFlow {
  overall_congestion: 'NONE' | 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE'
  average_speed_kmh: number
  average_delay_minutes: number
  total_incidents: number
}

/**
 * Complete traffic data
 */
export interface TrafficData {
  incidents: TrafficIncident[]
  flow: TrafficFlow
  last_updated: Date
  configured: boolean
}

/**
 * Props for TrafficAlert component
 */
export interface TrafficAlertProps {
  /**
   * Route coordinates to check traffic for
   */
  routeCoordinates: Coordinates[]

  /**
   * Auto-refresh interval in minutes (default: 5, 0 to disable)
   */
  refreshInterval?: number

  /**
   * Compact mode (default: false)
   */
  compact?: boolean

  /**
   * Additional CSS classes
   */
  className?: string

  /**
   * Callback when traffic is loaded
   */
  onTrafficLoaded?: (traffic: TrafficData) => void
}

/**
 * TrafficAlert Component
 *
 * Displays real-time traffic conditions and incidents for a route.
 * Fetches data from TomTom Traffic API via navigation endpoint.
 *
 * Features:
 * - Real-time traffic incidents (accidents, closures, etc.)
 * - Congestion level indicators
 * - Delay estimates
 * - Severity-based color coding
 * - Auto-refresh capability
 * - Detailed and compact display modes
 *
 * @example
 * ```tsx
 * <TrafficAlert
 *   routeCoordinates={routeCoordinates}
 *   refreshInterval={5}
 * />
 * ```
 */
export default function TrafficAlert({
  routeCoordinates,
  refreshInterval = 5,
  compact = false,
  className = '',
  onTrafficLoaded,
}: TrafficAlertProps) {
  const [traffic, setTraffic] = useState<TrafficData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(false)

  /**
   * Fetch traffic data from API
   */
  const fetchTraffic = async () => {
    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem('worker_token')
      const response = await fetch('/api/navigation/traffic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          coordinates: routeCoordinates,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch traffic data')
      }

      const responseData = await response.json()
      const data = responseData.data

      // Convert last_updated string to Date
      const trafficData: TrafficData = {
        ...data,
        last_updated: new Date(data.last_updated),
      }

      setTraffic(trafficData)

      if (onTrafficLoaded) {
        onTrafficLoaded(trafficData)
      }
    } catch (err) {
      console.error('Traffic fetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load traffic')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Fetch traffic on mount and set up refresh interval
   */
  useEffect(() => {
    if (routeCoordinates.length < 2) return

    fetchTraffic()

    // Set up auto-refresh if enabled
    if (refreshInterval > 0) {
      const intervalId = setInterval(() => {
        fetchTraffic()
      }, refreshInterval * 60 * 1000)

      return () => clearInterval(intervalId)
    }
  }, [routeCoordinates, refreshInterval])

  /**
   * Get congestion color classes
   */
  const getCongestionColor = (level: string): string => {
    switch (level) {
      case 'NONE':
        return 'bg-green-100 border-green-300 text-green-800'
      case 'LOW':
        return 'bg-blue-100 border-blue-300 text-blue-800'
      case 'MODERATE':
        return 'bg-amber-100 border-amber-300 text-amber-800'
      case 'HIGH':
        return 'bg-orange-100 border-orange-300 text-orange-800'
      case 'SEVERE':
        return 'bg-red-100 border-red-300 text-red-800'
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800'
    }
  }

  /**
   * Get congestion icon
   */
  const getCongestionIcon = (level: string): React.ReactNode => {
    const iconClass = "w-5 h-5"
    switch (level) {
      case 'NONE':
        return <CheckCircle className={iconClass} />
      case 'LOW':
        return <Info className={iconClass} />
      case 'MODERATE':
      case 'HIGH':
        return <AlertCircle className={iconClass} />
      case 'SEVERE':
        return <AlertTriangle className={iconClass} />
      default:
        return <Info className={iconClass} />
    }
  }

  /**
   * Get severity color for incident
   */
  const getIncidentSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'LOW':
        return 'text-blue-600'
      case 'MODERATE':
        return 'text-amber-600'
      case 'HIGH':
        return 'text-orange-600'
      case 'SEVERE':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  // Loading state
  if (loading && !traffic) {
    return (
      <div
        className={`flex items-center justify-center p-4 bg-gray-100 rounded-lg ${className}`}
        role="status"
        aria-label="Loading traffic"
      >
        <Loader2 className="w-6 h-6 text-blue-600 animate-spin mr-2" />
        <span className="text-sm text-gray-600">Loading traffic...</span>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div
        className={`p-4 bg-red-50 border-2 border-red-200 rounded-lg ${className}`}
        role="alert"
      >
        <div className="flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-800 text-sm">Traffic Unavailable</p>
            <p className="text-xs text-red-600 mt-1">{error}</p>
            <button
              onClick={fetchTraffic}
              className="mt-2 text-xs text-red-700 underline hover:text-red-800"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!traffic) {
    return null
  }

  // If API is not configured, show message
  if (!traffic.configured) {
    return (
      <div className={`p-4 bg-blue-50 border-2 border-blue-200 rounded-lg ${className}`}>
        <div className="flex items-start gap-2">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-blue-900 text-sm">Traffic Data Unavailable</p>
            <p className="text-xs text-blue-700 mt-1">
              TomTom API key not configured. Add TOMTOM_API_KEY to enable real-time traffic updates.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const { incidents, flow } = traffic

  // Compact mode
  if (compact) {
    return (
      <div className={`flex items-center gap-3 p-3 bg-white border rounded-lg shadow-sm ${className}`}>
        <div className={getIncidentSeverityColor(flow.overall_congestion)}>
          <Car className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-900 capitalize">
            {flow.overall_congestion.toLowerCase()} Traffic
          </p>
          <p className="text-xs text-gray-600">
            {incidents.length} incident{incidents.length !== 1 ? 's' : ''}
            {flow.average_delay_minutes > 0 && ` · +${flow.average_delay_minutes} min delay`}
          </p>
        </div>
        {flow.overall_congestion !== 'NONE' && (
          <AlertTriangle className="w-5 h-5 text-orange-600" title="Traffic issues" />
        )}
      </div>
    )
  }

  // Full display mode
  return (
    <div className={`bg-white border-2 rounded-lg shadow-md overflow-hidden ${className}`}>
      {/* Header with congestion indicator */}
      <div
        className={`px-4 py-3 border-b-2 ${getCongestionColor(flow.overall_congestion)}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getCongestionIcon(flow.overall_congestion)}
            <div>
              <p className="font-bold text-sm capitalize">
                {flow.overall_congestion.toLowerCase()} Traffic
              </p>
              {flow.average_speed_kmh > 0 && (
                <p className="text-xs opacity-75 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Average: {Math.round(flow.average_speed_kmh)} km/h
                </p>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold">{incidents.length} Incident{incidents.length !== 1 ? 's' : ''}</p>
            {flow.average_delay_minutes > 0 && (
              <p className="text-xs opacity-75 flex items-center gap-1 justify-end">
                <Clock className="w-3 h-3" />
                +{flow.average_delay_minutes} min
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Incidents list */}
      {incidents.length > 0 && (
        <div className="divide-y">
          {/* Show first 2 incidents, rest collapsed */}
          {incidents.slice(0, expanded ? undefined : 2).map((incident, index) => (
            <div key={incident.id} className="px-4 py-3">
              <div className="flex items-start gap-3">
                <AlertTriangle className={`w-5 h-5 flex-shrink-0 ${getIncidentSeverityColor(incident.severity)}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{incident.description}</p>
                  {incident.affected_roads.length > 0 && (
                    <p className="text-xs text-gray-600 mt-1">
                      <MapPin className="w-3 h-3 inline mr-1" />
                      {incident.affected_roads.join(', ')}
                    </p>
                  )}
                  {incident.delay_minutes > 0 && (
                    <p className="text-xs text-orange-600 font-medium mt-1">
                      +{incident.delay_minutes} min delay
                    </p>
                  )}
                </div>
                <span className={`text-xs px-2 py-1 rounded ${
                  incident.severity === 'SEVERE' ? 'bg-red-100 text-red-800' :
                  incident.severity === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                  incident.severity === 'MODERATE' ? 'bg-amber-100 text-amber-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {incident.severity}
                </span>
              </div>
            </div>
          ))}

          {/* Show more button */}
          {incidents.length > 2 && (
            <div className="px-4 py-2 bg-gray-50">
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                {expanded ? `Show less` : `Show ${incidents.length - 2} more incident${incidents.length - 2 !== 1 ? 's' : ''}`}
              </button>
            </div>
          )}
        </div>
      )}

      {/* No incidents message */}
      {incidents.length === 0 && (
        <div className="px-4 py-3 text-center">
          <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
          <p className="text-sm text-gray-700">No traffic incidents reported</p>
          <p className="text-xs text-gray-500 mt-1">Clear conditions ahead</p>
        </div>
      )}

      {/* Last updated */}
      <div className="px-4 py-2 bg-gray-50 border-t text-center">
        <p className="text-xs text-gray-500">
          Last updated: {traffic.last_updated.toLocaleTimeString()}
        </p>
      </div>
    </div>
  )
}
