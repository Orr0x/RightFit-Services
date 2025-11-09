/**
 * WeatherService - Weather data and alerts for navigation
 *
 * Integrates with WeatherAPI.com (FREE - 1M calls/month) to provide:
 * - Current weather conditions
 * - Weather alerts and warnings
 * - Worker safety recommendations
 *
 * Implements in-memory caching (1 hour TTL) to minimize API calls
 */

import axios, { AxiosError } from 'axios';
import { getNavigationConfig } from '../config/navigation';

interface WeatherData {
  location: {
    name: string;
    region: string;
    country: string;
    lat: number;
    lon: number;
  };
  current: {
    temp_c: number;
    temp_f: number;
    condition: {
      text: string;
      icon: string;
      code: number;
    };
    wind_kph: number;
    wind_mph: number;
    wind_degree: number;
    wind_dir: string;
    pressure_mb: number;
    precip_mm: number;
    humidity: number;
    cloud: number;
    feelslike_c: number;
    feelslike_f: number;
    vis_km: number;
    uv: number;
  };
  last_updated: Date;
}

interface WeatherAlert {
  severity: 'ADVISORY' | 'WATCH' | 'WARNING' | 'EXTREME';
  headline: string;
  description: string;
  effective: Date;
  expires: Date;
}

interface WeatherRecommendation {
  is_safe_to_travel: boolean;
  warnings: string[];
  suggestions: string[];
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'SEVERE';
}

interface CachedWeather {
  data: WeatherData;
  cached_at: number;
}

export class WeatherService {
  private config = getNavigationConfig();
  private cache = new Map<string, CachedWeather>();

  /**
   * Get current weather for coordinates
   */
  async getCurrentWeather(lat: number, lon: number): Promise<WeatherData> {
    if (!this.config.weather.enabled) {
      throw new Error('Weather API not configured. Please set WEATHER_API_KEY in environment.');
    }

    // Check cache
    const cacheKey = `${lat.toFixed(4)},${lon.toFixed(4)}`;
    const cached = this.cache.get(cacheKey);

    if (cached) {
      const age = Date.now() - cached.cached_at;
      if (age < this.config.weather.cacheTtl * 1000) {
        return cached.data;
      }
    }

    // Fetch fresh data
    try {
      const response = await axios.get('https://api.weatherapi.com/v1/current.json', {
        params: {
          key: this.config.weather.apiKey,
          q: `${lat},${lon}`,
          aqi: 'no', // Don't need air quality
        },
        timeout: this.config.weather.timeout,
      });

      const weatherData: WeatherData = {
        location: {
          name: response.data.location.name,
          region: response.data.location.region,
          country: response.data.location.country,
          lat: response.data.location.lat,
          lon: response.data.location.lon,
        },
        current: {
          temp_c: response.data.current.temp_c,
          temp_f: response.data.current.temp_f,
          condition: {
            text: response.data.current.condition.text,
            icon: response.data.current.condition.icon,
            code: response.data.current.condition.code,
          },
          wind_kph: response.data.current.wind_kph,
          wind_mph: response.data.current.wind_mph,
          wind_degree: response.data.current.wind_degree,
          wind_dir: response.data.current.wind_dir,
          pressure_mb: response.data.current.pressure_mb,
          precip_mm: response.data.current.precip_mm,
          humidity: response.data.current.humidity,
          cloud: response.data.current.cloud,
          feelslike_c: response.data.current.feelslike_c,
          feelslike_f: response.data.current.feelslike_f,
          vis_km: response.data.current.vis_km,
          uv: response.data.current.uv,
        },
        last_updated: new Date(response.data.current.last_updated),
      };

      // Cache it
      this.cache.set(cacheKey, {
        data: weatherData,
        cached_at: Date.now(),
      });

      return weatherData;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.status === 403) {
          throw new Error('Weather API key invalid or expired');
        }
        if (axiosError.response?.status === 429) {
          throw new Error('Weather API rate limit exceeded');
        }
        throw new Error(`Weather API error: ${axiosError.message}`);
      }
      throw error;
    }
  }

  /**
   * Generate worker safety recommendations based on weather
   */
  generateRecommendations(weather: WeatherData): WeatherRecommendation {
    const warnings: string[] = [];
    const suggestions: string[] = [];
    let severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'SEVERE' = 'LOW';
    let isSafeToTravel = true;

    const { current } = weather;

    // Temperature extremes
    if (current.temp_c < 0) {
      warnings.push('Freezing temperatures - roads may be icy');
      suggestions.push('Drive slowly and allow extra travel time');
      severity = 'MEDIUM';
    } else if (current.temp_c > 35) {
      warnings.push('Extreme heat - stay hydrated');
      suggestions.push('Take breaks in shade, carry water');
      severity = 'MEDIUM';
    }

    // Precipitation
    if (current.precip_mm > 10) {
      warnings.push('Heavy rain - reduced visibility');
      suggestions.push('Use headlights, reduce speed, increase following distance');
      severity = 'HIGH';
    } else if (current.precip_mm > 5) {
      warnings.push('Moderate rain - wet roads');
      suggestions.push('Drive cautiously, watch for standing water');
      if (severity === 'LOW') severity = 'MEDIUM';
    }

    // Wind
    if (current.wind_kph > 60) {
      warnings.push('Very strong winds - hazardous driving conditions');
      suggestions.push('Be alert for debris, avoid parking under trees');
      severity = 'SEVERE';
      isSafeToTravel = false;
    } else if (current.wind_kph > 40) {
      warnings.push('Strong winds - difficult driving');
      suggestions.push('Grip steering wheel firmly, be alert for gusts');
      severity = 'HIGH';
    }

    // Visibility
    if (current.vis_km < 1) {
      warnings.push('Very poor visibility - dangerous conditions');
      suggestions.push('Use fog lights, reduce speed significantly');
      severity = 'SEVERE';
      isSafeToTravel = false;
    } else if (current.vis_km < 5) {
      warnings.push('Reduced visibility');
      suggestions.push('Use headlights, maintain safe distance');
      if (severity === 'LOW' || severity === 'MEDIUM') severity = 'MEDIUM';
    }

    // UV index
    if (current.uv > 8) {
      suggestions.push('Very high UV - use sunscreen if working outdoors');
    }

    // Good conditions
    if (warnings.length === 0) {
      suggestions.push('Good weather conditions for travel');
    }

    return {
      is_safe_to_travel: isSafeToTravel,
      warnings,
      suggestions,
      severity,
    };
  }

  /**
   * Clear weather cache (for testing or manual refresh)
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache size (for monitoring)
   */
  getCacheSize(): number {
    return this.cache.size;
  }
}
