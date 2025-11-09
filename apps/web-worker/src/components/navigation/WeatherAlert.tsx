import { useEffect, useState } from 'react'
import {
  Cloud,
  CloudRain,
  CloudSnow,
  CloudDrizzle,
  CloudFog,
  Sun,
  CloudLightning,
  Wind,
  Snowflake,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle,
  Loader2,
  Droplets,
  Eye,
  Navigation,
} from 'lucide-react'
import type { Coordinates } from '@rightfit/shared/types/navigation'

/**
 * Weather condition from API
 */
export interface WeatherCondition {
  text: string
  icon: string
  code: number
}

/**
 * Current weather data
 */
export interface CurrentWeather {
  temp_c: number
  temp_f: number
  condition: WeatherCondition
  wind_kph: number
  wind_mph: number
  wind_degree: number
  wind_dir: string
  precip_mm: number
  precip_in: number
  humidity: number
  cloud: number
  feelslike_c: number
  feelslike_f: number
  vis_km: number
  vis_miles: number
  uv: number
  gust_kph: number
  gust_mph: number
}

/**
 * Weather location data
 */
export interface WeatherLocation {
  name: string
  region: string
  country: string
  lat: number
  lon: number
}

/**
 * Complete weather data from API
 */
export interface WeatherData {
  location: WeatherLocation
  current: CurrentWeather
  last_updated: Date
}

/**
 * Weather recommendation from API
 */
export interface WeatherRecommendation {
  is_safe_to_travel: boolean
  warnings: string[]
  suggestions: string[]
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'SEVERE'
}

/**
 * Props for WeatherAlert component
 */
export interface WeatherAlertProps {
  /**
   * Location coordinates to fetch weather for
   */
  location: Coordinates

  /**
   * Show detailed weather info (default: false)
   */
  detailed?: boolean

  /**
   * Auto-refresh interval in minutes (default: 15, 0 to disable)
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
   * Callback when weather is loaded
   */
  onWeatherLoaded?: (weather: WeatherData, recommendations: WeatherRecommendation) => void
}

/**
 * WeatherAlert Component
 *
 * Displays current weather conditions and safety recommendations for travel.
 * Fetches data from the navigation API weather endpoint.
 *
 * Features:
 * - Real-time weather data
 * - Safety recommendations based on conditions
 * - Severity indicators (LOW, MEDIUM, HIGH, SEVERE)
 * - Weather warnings and suggestions
 * - Auto-refresh capability
 * - Detailed and compact display modes
 * - Accessible with ARIA labels
 * - Mobile-responsive
 *
 * @example
 * ```tsx
 * <WeatherAlert
 *   location={{ latitude: 51.5074, longitude: -0.1278 }}
 *   detailed={true}
 *   refreshInterval={15}
 * />
 * ```
 */
export default function WeatherAlert({
  location,
  detailed = false,
  refreshInterval = 15,
  compact = false,
  className = '',
  onWeatherLoaded,
}: WeatherAlertProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [recommendations, setRecommendations] = useState<WeatherRecommendation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /**
   * Fetch weather data from API
   */
  const fetchWeather = async () => {
    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem('worker_token')
      const response = await fetch(
        `/api/navigation/weather?lat=${location.latitude}&lon=${location.longitude}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch weather data')
      }

      const responseData = await response.json()
      const data = responseData.data // API wraps response in { data: { weather, recommendations } }

      // Convert last_updated string to Date
      const weatherData: WeatherData = {
        ...data.weather,
        last_updated: new Date(data.weather.last_updated),
      }

      setWeather(weatherData)
      setRecommendations(data.recommendations)

      if (onWeatherLoaded) {
        onWeatherLoaded(weatherData, data.recommendations)
      }
    } catch (err) {
      console.error('Weather fetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load weather')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Fetch weather on mount and set up refresh interval
   */
  useEffect(() => {
    fetchWeather()

    // Set up auto-refresh if enabled
    if (refreshInterval > 0) {
      const intervalId = setInterval(() => {
        fetchWeather()
      }, refreshInterval * 60 * 1000) // Convert minutes to milliseconds

      return () => clearInterval(intervalId)
    }
  }, [location.latitude, location.longitude, refreshInterval])

  /**
   * Get weather icon component based on condition code
   */
  const getWeatherIcon = (condition: WeatherCondition): React.ReactNode => {
    const code = condition.code
    const iconClass = "w-8 h-8"

    // Weather condition code mapping (based on WeatherAPI.com codes)
    if (code === 1000) return <Sun className={iconClass} /> // Sunny/Clear
    if ([1003, 1006, 1009].includes(code)) return <Cloud className={iconClass} /> // Cloudy
    if ([1030, 1135, 1147].includes(code)) return <CloudFog className={iconClass} /> // Fog/Mist
    if ([1063, 1180, 1183, 1186, 1189, 1192, 1195, 1240, 1243, 1246].includes(code)) {
      return <CloudRain className={iconClass} /> // Rain
    }
    if ([1150, 1153, 1168, 1171].includes(code)) return <CloudDrizzle className={iconClass} /> // Drizzle
    if ([1066, 1210, 1213, 1216, 1219, 1222, 1225, 1255, 1258].includes(code)) {
      return <CloudSnow className={iconClass} /> // Snow
    }
    if ([1087, 1273, 1276, 1279, 1282].includes(code)) {
      return <CloudLightning className={iconClass} /> // Thunder
    }
    if ([1114, 1117, 1204, 1207, 1237, 1249, 1252, 1261, 1264].includes(code)) {
      return <Snowflake className={iconClass} /> // Sleet/Ice
    }

    return <Cloud className={iconClass} /> // Default
  }

  /**
   * Get severity color classes
   */
  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'LOW':
        return 'bg-green-100 border-green-300 text-green-800'
      case 'MEDIUM':
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
   * Get severity icon
   */
  const getSeverityIcon = (severity: string): React.ReactNode => {
    const iconClass = "w-5 h-5"
    switch (severity) {
      case 'LOW':
        return <CheckCircle className={iconClass} />
      case 'MEDIUM':
        return <Info className={iconClass} />
      case 'HIGH':
        return <AlertCircle className={iconClass} />
      case 'SEVERE':
        return <AlertTriangle className={iconClass} />
      default:
        return <Info className={iconClass} />
    }
  }

  /**
   * Format wind direction
   */
  const formatWindDirection = (degree: number, direction: string): string => {
    return `${direction} (${degree}°)`
  }

  // Loading state
  if (loading && !weather) {
    return (
      <div
        className={`flex items-center justify-center p-4 bg-gray-100 rounded-lg ${className}`}
        role="status"
        aria-label="Loading weather"
      >
        <Loader2 className="w-6 h-6 text-blue-600 animate-spin mr-2" />
        <span className="text-sm text-gray-600">Loading weather...</span>
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
            <p className="font-medium text-red-800 text-sm">Weather Unavailable</p>
            <p className="text-xs text-red-600 mt-1">{error}</p>
            <button
              onClick={fetchWeather}
              className="mt-2 text-xs text-red-700 underline hover:text-red-800"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!weather || !recommendations) {
    return null
  }

  // Compact mode
  if (compact) {
    return (
      <div className={`flex items-center gap-3 p-3 bg-white border rounded-lg shadow-sm ${className}`}>
        <div className="text-blue-600">
          {getWeatherIcon(weather.current.condition)}
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-900">
            {Math.round(weather.current.temp_c)}°C
          </p>
          <p className="text-xs text-gray-600">{weather.current.condition.text}</p>
        </div>
        {!recommendations.is_safe_to_travel && (
          <AlertTriangle className="w-5 h-5 text-orange-600" title="Travel advisory" />
        )}
      </div>
    )
  }

  // Full display mode
  return (
    <div className={`bg-white border-2 rounded-lg shadow-md overflow-hidden ${className}`}>
      {/* Header with severity indicator */}
      <div
        className={`px-4 py-3 border-b-2 ${getSeverityColor(recommendations.severity)}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getSeverityIcon(recommendations.severity)}
            <div>
              <p className="font-bold text-sm">
                {recommendations.is_safe_to_travel ? 'Safe to Travel' : 'Travel Advisory'}
              </p>
              <p className="text-xs opacity-75">
                Severity: {recommendations.severity}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{Math.round(weather.current.temp_c)}°C</p>
            <p className="text-xs opacity-75">
              Feels like {Math.round(weather.current.feelslike_c)}°C
            </p>
          </div>
        </div>
      </div>

      {/* Current conditions */}
      <div className="px-4 py-3 border-b">
        <div className="flex items-center gap-3 mb-3">
          <div className="text-blue-600">
            {getWeatherIcon(weather.current.condition)}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{weather.current.condition.text}</p>
            <p className="text-xs text-gray-600">{weather.location.name}, {weather.location.region}</p>
          </div>
        </div>

        {/* Detailed weather metrics */}
        {detailed && (
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Wind className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-600">Wind</p>
                <p className="font-medium">
                  {Math.round(weather.current.wind_kph)} km/h {weather.current.wind_dir}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Droplets className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-600">Humidity</p>
                <p className="font-medium">{weather.current.humidity}%</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-600">Visibility</p>
                <p className="font-medium">{weather.current.vis_km} km</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <CloudRain className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-600">Precipitation</p>
                <p className="font-medium">{weather.current.precip_mm} mm</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Warnings */}
      {recommendations.warnings.length > 0 && (
        <div className="px-4 py-3 bg-amber-50 border-b border-amber-200">
          <p className="font-semibold text-sm text-amber-900 mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Warnings
          </p>
          <ul className="space-y-1">
            {recommendations.warnings.map((warning, index) => (
              <li key={index} className="text-xs text-amber-800 flex items-start gap-2">
                <span className="text-amber-600 mt-0.5">•</span>
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Suggestions */}
      {recommendations.suggestions.length > 0 && (
        <div className="px-4 py-3">
          <p className="font-semibold text-sm text-gray-900 mb-2 flex items-center gap-2">
            <Info className="w-4 h-4" />
            Suggestions
          </p>
          <ul className="space-y-1">
            {recommendations.suggestions.map((suggestion, index) => (
              <li key={index} className="text-xs text-gray-700 flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">✓</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Last updated */}
      <div className="px-4 py-2 bg-gray-50 border-t text-center">
        <p className="text-xs text-gray-500">
          Last updated: {weather.last_updated.toLocaleTimeString()}
        </p>
      </div>
    </div>
  )
}
