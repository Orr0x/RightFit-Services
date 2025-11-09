import { useState } from 'react'
import { Navigation, MapPin, Loader2, AlertCircle } from 'lucide-react'
import { useGeolocation } from '../../hooks/useGeolocation'
import type { Coordinates } from '@rightfit/shared/types/navigation'

/**
 * Navigation mode for routing
 */
export type NavigationMode = 'driving' | 'walking' | 'cycling'

/**
 * Props for NavigationButton component
 */
export interface NavigationButtonProps {
  /**
   * Destination coordinates
   */
  destination: Coordinates

  /**
   * Destination address for display
   */
  address?: string

  /**
   * Navigation mode (default: driving)
   */
  mode?: NavigationMode

  /**
   * Button variant (default: primary)
   */
  variant?: 'primary' | 'secondary' | 'outline'

  /**
   * Button size (default: medium)
   */
  size?: 'small' | 'medium' | 'large'

  /**
   * Show icon (default: true)
   */
  showIcon?: boolean

  /**
   * Custom button text (default: "Navigate Here")
   */
  text?: string

  /**
   * Full width button (default: false)
   */
  fullWidth?: boolean

  /**
   * Disabled state
   */
  disabled?: boolean

  /**
   * Additional CSS classes
   */
  className?: string

  /**
   * Callback when navigation is opened
   */
  onNavigate?: (destination: Coordinates, origin?: Coordinates) => void
}

/**
 * NavigationButton Component
 *
 * A smart button that opens native maps apps with turn-by-turn directions.
 * Handles platform detection and automatically uses:
 * - Google Maps on Android
 * - Apple Maps on iOS
 * - Google Maps web on desktop browsers
 *
 * Features:
 * - Automatic user location detection
 * - Fallback to destination-only navigation if location unavailable
 * - Error handling with user-friendly messages
 * - Loading states
 * - Accessible and keyboard-navigable
 * - Mobile-responsive
 *
 * @example
 * ```tsx
 * <NavigationButton
 *   destination={{ latitude: 51.5074, longitude: -0.1278 }}
 *   address="10 Downing Street, London"
 *   mode="driving"
 * />
 * ```
 */
export default function NavigationButton({
  destination,
  address,
  mode = 'driving',
  variant = 'primary',
  size = 'medium',
  showIcon = true,
  text = 'Navigate Here',
  fullWidth = false,
  disabled = false,
  className = '',
  onNavigate,
}: NavigationButtonProps) {
  const [isNavigating, setIsNavigating] = useState(false)
  const { location: userLocation, requestLocation, loading, error } = useGeolocation()

  /**
   * Detect user's platform/device
   */
  const detectPlatform = (): 'ios' | 'android' | 'web' => {
    const userAgent = navigator.userAgent.toLowerCase()

    if (/iphone|ipad|ipod/.test(userAgent)) {
      return 'ios'
    } else if (/android/.test(userAgent)) {
      return 'android'
    } else {
      return 'web'
    }
  }

  /**
   * Build navigation URL for different platforms
   */
  const buildNavigationUrl = (origin?: Coordinates): string => {
    const platform = detectPlatform()
    const { latitude: destLat, longitude: destLon } = destination
    const destCoords = `${destLat},${destLon}`

    // Build URL based on platform
    switch (platform) {
      case 'ios':
        // Apple Maps URL scheme
        // Format: maps://?saddr=START_LAT,START_LON&daddr=DEST_LAT,DEST_LON&dirflg=MODE
        const iosModeMap: Record<NavigationMode, string> = {
          driving: 'd',
          walking: 'w',
          cycling: 'b', // Note: Apple Maps uses 'b' for biking
        }

        if (origin) {
          const originCoords = `${origin.latitude},${origin.longitude}`
          return `maps://?saddr=${originCoords}&daddr=${destCoords}&dirflg=${iosModeMap[mode]}`
        } else {
          return `maps://?daddr=${destCoords}&dirflg=${iosModeMap[mode]}`
        }

      case 'android':
        // Google Maps URL scheme for Android
        // Format: google.navigation:q=DEST_LAT,DEST_LON&mode=MODE
        const androidModeMap: Record<NavigationMode, string> = {
          driving: 'd',
          walking: 'w',
          cycling: 'b',
        }

        if (origin) {
          // Use directions mode with origin
          const originCoords = `${origin.latitude},${origin.longitude}`
          return `https://www.google.com/maps/dir/?api=1&origin=${originCoords}&destination=${destCoords}&travelmode=${mode}`
        } else {
          // Use navigation mode (destination only)
          return `google.navigation:q=${destCoords}&mode=${androidModeMap[mode]}`
        }

      case 'web':
      default:
        // Google Maps web URL
        // Format: https://www.google.com/maps/dir/?api=1&origin=START&destination=DEST&travelmode=MODE
        if (origin) {
          const originCoords = `${origin.latitude},${origin.longitude}`
          return `https://www.google.com/maps/dir/?api=1&origin=${originCoords}&destination=${destCoords}&travelmode=${mode}`
        } else {
          return `https://www.google.com/maps/dir/?api=1&destination=${destCoords}&travelmode=${mode}`
        }
    }
  }

  /**
   * Handle navigation button click
   */
  const handleNavigate = async () => {
    if (disabled || isNavigating) return

    setIsNavigating(true)

    try {
      let origin: Coordinates | undefined

      // Try to get user location if not already available
      if (!userLocation && !error) {
        await requestLocation()
        // Use the location from state after request
        origin = userLocation ?? undefined
      } else if (userLocation) {
        origin = userLocation
      }

      // Build navigation URL
      const navUrl = buildNavigationUrl(origin)

      // Call onNavigate callback if provided
      if (onNavigate) {
        onNavigate(destination, origin)
      }

      // Open navigation URL
      // On mobile, this will open the native maps app
      // On desktop, this will open Google Maps in a new tab
      window.open(navUrl, '_blank')
    } catch (err) {
      console.error('Navigation error:', err)
      // Even if we can't get user location, we can still navigate to destination
      const navUrl = buildNavigationUrl()
      window.open(navUrl, '_blank')
    } finally {
      setIsNavigating(false)
    }
  }

  /**
   * Get button variant styles
   */
  const getVariantStyles = (): string => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
      case 'secondary':
        return 'bg-gray-600 text-white hover:bg-gray-700 active:bg-gray-800'
      case 'outline':
        return 'bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-50 active:bg-blue-100'
      default:
        return 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
    }
  }

  /**
   * Get button size styles
   */
  const getSizeStyles = (): string => {
    switch (size) {
      case 'small':
        return 'px-3 py-1.5 text-sm'
      case 'medium':
        return 'px-4 py-2 text-base'
      case 'large':
        return 'px-6 py-3 text-lg'
      default:
        return 'px-4 py-2 text-base'
    }
  }

  /**
   * Get icon size based on button size
   */
  const getIconSize = (): string => {
    switch (size) {
      case 'small':
        return 'w-4 h-4'
      case 'medium':
        return 'w-5 h-5'
      case 'large':
        return 'w-6 h-6'
      default:
        return 'w-5 h-5'
    }
  }

  const isLoading = loading || isNavigating
  const isDisabled = disabled || isLoading

  return (
    <button
      onClick={handleNavigate}
      disabled={isDisabled}
      className={`
        flex items-center justify-center gap-2
        font-medium rounded-lg
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${getVariantStyles()}
        ${getSizeStyles()}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      aria-label={`Navigate to ${address || 'destination'}`}
      title={address || `Navigate to ${destination.latitude}, ${destination.longitude}`}
    >
      {/* Icon or Loading Spinner */}
      {showIcon && (
        <>
          {isLoading ? (
            <Loader2 className={`${getIconSize()} animate-spin`} aria-hidden="true" />
          ) : error ? (
            <MapPin className={`${getIconSize()}`} aria-hidden="true" />
          ) : (
            <Navigation className={`${getIconSize()}`} aria-hidden="true" />
          )}
        </>
      )}

      {/* Button Text */}
      <span>{text}</span>

      {/* Error Indicator (subtle) */}
      {error && !isLoading && (
        <AlertCircle
          className="w-4 h-4 text-amber-400"
          aria-hidden="true"
          title="Location unavailable - will navigate to destination only"
        />
      )}
    </button>
  )
}
