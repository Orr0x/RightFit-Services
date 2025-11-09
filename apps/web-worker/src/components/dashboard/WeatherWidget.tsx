import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Cloud, Sun, CloudRain, AlertTriangle, ChevronRight, MapPin, Loader2 } from 'lucide-react'
import { useGeolocation } from '../../hooks/useGeolocation'
import type { Coordinates } from '@rightfit/shared/types/navigation'

/**
 * Simplified weather data for widget display
 */
interface WeatherSummary {
  temp_c: number
  condition_text: string
  condition_code: number
  is_safe_to_travel: boolean
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'SEVERE'
  warning_count: number
}

/**
 * Props for WeatherWidget component
 */
export interface WeatherWidgetProps {
  /**
   * Optional fixed location (uses user location if not provided)
   */
  location?: Coordinates

  /**
   * Location name for display
   */
  locationName?: string

  /**
   * Show link to full weather view (default: true)
   */
  showLink?: boolean

  /**
   * Additional CSS classes
   */
  className?: string
}

/**
 * WeatherWidget Component
 *
 * Compact weather widget for dashboard display.
 * Shows at-a-glance current weather and safety status.
 *
 * Features:
 * - Current temperature and condition
 * - Weather icon
 * - Safety indicator
 * - Warning count
 * - Link to full navigation/weather view
 * - Auto-refresh every 30 minutes
 *
 * @example
 * ```tsx
 * <WeatherWidget
 *   location={{ latitude: 51.5074, longitude: -0.1278 }}
 *   locationName="London"
 * />
 * ```
 */
export default function WeatherWidget({
  location,
  locationName,
  showLink = true,
  className = '',
}: WeatherWidgetProps) {
  const navigate = useNavigate()
  const { location: userLocation, requestLocation, loading: locationLoading } = useGeolocation()

  const [weather, setWeather] = useState<WeatherSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Use provided location or user location
  const targetLocation = location || userLocation

  /**
   * Fetch weather data from API
   */
  const fetchWeather = async () => {
    if (!targetLocation) return

    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem('worker_token')
      const response = await fetch(
        `/api/navigation/weather?lat=${targetLocation.latitude}&lon=${targetLocation.longitude}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch weather')
      }

      const responseData = await response.json()
      const data = responseData.data // API wraps response in { data: { weather, recommendations } }

      // Extract summary data
      const summary: WeatherSummary = {
        temp_c: data.weather.current.temp_c,
        condition_text: data.weather.current.condition.text,
        condition_code: data.weather.current.condition.code,
        is_safe_to_travel: data.recommendations.is_safe_to_travel,
        severity: data.recommendations.severity,
        warning_count: data.recommendations.warnings.length,
      }

      setWeather(summary)
    } catch (err) {
      console.error('Weather fetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load weather')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Fetch weather on mount and set up 30-minute refresh
   */
  useEffect(() => {
    if (targetLocation) {
      fetchWeather()

      // Refresh every 30 minutes
      const intervalId = setInterval(fetchWeather, 30 * 60 * 1000)
      return () => clearInterval(intervalId)
    }
  }, [targetLocation?.latitude, targetLocation?.longitude])

  /**
   * Get weather icon based on condition code
   */
  const getWeatherIcon = (code: number): React.ReactNode => {
    const iconClass = "w-8 h-8"

    if (code === 1000) return <Sun className={`${iconClass} text-yellow-500`} />
    if ([1063, 1180, 1183, 1186, 1189, 1192, 1195, 1240, 1243, 1246].includes(code)) {
      return <CloudRain className={`${iconClass} text-blue-500`} />
    }
    return <Cloud className={`${iconClass} text-gray-500`} />
  }

  /**
   * Get severity color
   */
  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'LOW':
        return 'border-green-300 bg-green-50'
      case 'MEDIUM':
        return 'border-amber-300 bg-amber-50'
      case 'HIGH':
        return 'border-orange-300 bg-orange-50'
      case 'SEVERE':
        return 'border-red-300 bg-red-50'
      default:
        return 'border-gray-300 bg-gray-50'
    }
  }

  /**
   * Handle widget click - navigate to locations or request location
   */
  const handleClick = () => {
    if (showLink) {
      if (userLocation) {
        navigate('/navigation/my-locations')
      } else {
        requestLocation()
      }
    }
  }

  // No location available
  if (!targetLocation && !locationLoading) {
    return (
      <div
        className={`bg-white border-2 border-blue-200 rounded-lg p-4 ${className}`}
        onClick={() => requestLocation()}
        role="button"
        tabIndex={0}
      >
        <div className="flex items-center gap-3">
          <MapPin className="w-8 h-8 text-blue-600" />
          <div className="flex-1">
            <p className="font-semibold text-sm text-gray-900">Weather</p>
            <p className="text-xs text-gray-600">Share location to view</p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>
      </div>
    )
  }

  // Loading state
  if (loading || !weather) {
    return (
      <div className={`bg-white border-2 border-gray-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center gap-3">
          <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
          <div className="flex-1">
            <p className="font-semibold text-sm text-gray-900">Weather</p>
            <p className="text-xs text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div
        className={`bg-white border-2 border-red-200 rounded-lg p-4 ${className}`}
        onClick={fetchWeather}
        role="button"
        tabIndex={0}
      >
        <div className="flex items-center gap-3">
          <Cloud className="w-8 h-8 text-red-400" />
          <div className="flex-1">
            <p className="font-semibold text-sm text-gray-900">Weather</p>
            <p className="text-xs text-red-600">Tap to retry</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`bg-white border-2 rounded-lg p-4 transition-shadow ${getSeverityColor(
        weather.severity
      )} ${showLink ? 'hover:shadow-md cursor-pointer' : ''} ${className}`}
      onClick={handleClick}
      role={showLink ? 'button' : 'article'}
      tabIndex={showLink ? 0 : undefined}
      aria-label={`Current weather: ${Math.round(weather.temp_c)} degrees, ${
        weather.condition_text
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Weather Icon */}
        <div className="flex-shrink-0">
          {getWeatherIcon(weather.condition_code)}
        </div>

        {/* Weather Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-1">
            <p className="text-2xl font-bold text-gray-900">
              {Math.round(weather.temp_c)}°C
            </p>
            {!weather.is_safe_to_travel && (
              <AlertTriangle className="w-4 h-4 text-orange-600 flex-shrink-0" />
            )}
          </div>
          <p className="text-xs text-gray-700 truncate">{weather.condition_text}</p>
          {locationName && (
            <p className="text-xs text-gray-500 truncate mt-0.5">{locationName}</p>
          )}
        </div>

        {/* Warning Badge */}
        {weather.warning_count > 0 && (
          <div className="flex-shrink-0">
            <div className="bg-orange-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
              {weather.warning_count}
            </div>
          </div>
        )}

        {/* Arrow */}
        {showLink && (
          <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
        )}
      </div>

      {/* Safety Status */}
      {!weather.is_safe_to_travel && (
        <div className="mt-2 pt-2 border-t border-orange-200">
          <p className="text-xs font-medium text-orange-800">
            ⚠️ Travel advisory - check conditions
          </p>
        </div>
      )}
    </div>
  )
}
