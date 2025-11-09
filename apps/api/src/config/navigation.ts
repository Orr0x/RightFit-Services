/**
 * Navigation API Configuration
 *
 * Centralized configuration for GPS navigation APIs including:
 * - Weather API (required)
 * - TomTom Traffic API (optional)
 * - what3words API (optional)
 * - Rate limiting and caching settings
 */

export interface NavigationConfig {
  weather: {
    apiKey: string
    enabled: boolean
    cacheTtl: number // seconds
    timeout: number // milliseconds
  }
  tomtom: {
    apiKey: string | null
    enabled: boolean
    cacheTtl: number
    timeout: number
  }
  what3words: {
    apiKey: string | null
    enabled: boolean
    timeout: number
  }
  geocoding: {
    nominatimUserAgent: string
    cacheDays: number
    rateLimit: number // requests per second
    timeout: number
  }
  routing: {
    osrmBaseUrl: string
    cacheTtl: number
    timeout: number
  }
}

/**
 * Load and validate navigation configuration from environment variables
 */
export function loadNavigationConfig(): NavigationConfig {
  // Weather API (Required)
  const weatherApiKey = process.env.WEATHER_API_KEY

  if (!weatherApiKey) {
    console.warn(
      '⚠️  WEATHER_API_KEY not set - weather features will be disabled'
    )
    console.warn('   Get a free API key at: https://www.weatherapi.com/signup.aspx')
  }

  // TomTom Traffic API (Optional)
  const tomtomApiKey = process.env.TOMTOM_API_KEY || null

  if (!tomtomApiKey) {
    console.info(
      'ℹ️  TOMTOM_API_KEY not set - traffic features will be degraded'
    )
    console.info('   Get a free API key at: https://developer.tomtom.com/')
  }

  // what3words API (Optional)
  const what3wordsApiKey = process.env.WHAT3WORDS_API_KEY || null

  if (!what3wordsApiKey) {
    console.info(
      'ℹ️  WHAT3WORDS_API_KEY not set - will use Plus Codes as fallback'
    )
    console.info('   Get a free API key at: https://developer.what3words.com/')
  }

  const config: NavigationConfig = {
    weather: {
      apiKey: weatherApiKey || '',
      enabled: Boolean(weatherApiKey),
      cacheTtl: 3600, // 1 hour
      timeout: 10000, // 10 seconds
    },
    tomtom: {
      apiKey: tomtomApiKey,
      enabled: Boolean(tomtomApiKey),
      cacheTtl: 300, // 5 minutes
      timeout: 10000, // 10 seconds
    },
    what3words: {
      apiKey: what3wordsApiKey,
      enabled: Boolean(what3wordsApiKey),
      timeout: 5000, // 5 seconds
    },
    geocoding: {
      nominatimUserAgent: 'RightFit-Services/1.0 (GPS Navigation Feature)',
      cacheDays: 30, // Cache geocoded addresses for 30 days
      rateLimit: 1, // 1 request per second (Nominatim requirement)
      timeout: 10000, // 10 seconds
    },
    routing: {
      osrmBaseUrl: process.env.OSRM_BASE_URL || 'http://router.project-osrm.org',
      cacheTtl: 600, // 10 minutes
      timeout: 15000, // 15 seconds
    },
  }

  return config
}

/**
 * Validate navigation configuration and report status
 */
export function validateNavigationConfig(): {
  valid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []

  const weatherApiKey = process.env.WEATHER_API_KEY

  // Weather API is required for full functionality
  if (!weatherApiKey) {
    warnings.push('WEATHER_API_KEY not set - weather features disabled')
  } else if (weatherApiKey.length < 10) {
    errors.push('WEATHER_API_KEY appears to be invalid (too short)')
  }

  // Optional APIs
  const tomtomApiKey = process.env.TOMTOM_API_KEY
  if (!tomtomApiKey) {
    warnings.push('TOMTOM_API_KEY not set - traffic features degraded')
  }

  const what3wordsApiKey = process.env.WHAT3WORDS_API_KEY
  if (!what3wordsApiKey) {
    warnings.push('WHAT3WORDS_API_KEY not set - using Plus Codes fallback')
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

// Singleton instance
let configInstance: NavigationConfig | null = null

/**
 * Get navigation configuration (singleton)
 */
export function getNavigationConfig(): NavigationConfig {
  if (!configInstance) {
    configInstance = loadNavigationConfig()
  }
  return configInstance
}

/**
 * Reset configuration (for testing)
 */
export function resetNavigationConfig(): void {
  configInstance = null
}
