import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MapPin,
  Navigation2,
  Clock,
  Ruler,
  ChevronRight,
  Calendar,
  Loader2,
  Home,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useGeolocation } from '../../hooks/useGeolocation'
import type { CleaningJob } from '../../types'

/**
 * Next job with navigation info
 */
interface NextJobWithNav extends CleaningJob {
  distance_meters?: number
  distance_km?: number
  eta_minutes?: number
}

/**
 * Props for NextJobWidget component
 */
export interface NextJobWidgetProps {
  /**
   * Show navigation button (default: true)
   */
  showNavButton?: boolean

  /**
   * Additional CSS classes
   */
  className?: string
}

/**
 * NextJobWidget Component
 *
 * Dashboard widget showing the next upcoming job with:
 * - Job details (time, property, customer)
 * - Distance from current location
 * - Estimated travel time (ETA)
 * - Quick navigation action
 *
 * Features:
 * - Finds next scheduled or in-progress job
 * - Calculates distance and ETA using navigation API
 * - Click to view job details or navigate
 * - Geolocation integration
 * - Auto-refresh on location change
 *
 * @example
 * ```tsx
 * <NextJobWidget showNavButton={true} />
 * ```
 */
export default function NextJobWidget({
  showNavButton = true,
  className = '',
}: NextJobWidgetProps) {
  const { worker } = useAuth()
  const navigate = useNavigate()
  const { location: userLocation } = useGeolocation()

  const [nextJob, setNextJob] = useState<NextJobWithNav | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /**
   * Fetch next job and calculate navigation data
   */
  const fetchNextJob = async () => {
    if (!worker) return

    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem('worker_token')
      const serviceProviderId = localStorage.getItem('service_provider_id')

      // Fetch upcoming jobs for today
      const today = new Date().toISOString().split('T')[0]

      const response = await fetch(
        `/api/cleaning-jobs?service_provider_id=${serviceProviderId}&assigned_worker_id=${worker.id}&start_date=${today}&end_date=${today}&status=SCHEDULED&status=IN_PROGRESS`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch jobs')
      }

      const data = await response.json()
      const jobs = data.data || []

      if (jobs.length === 0) {
        setNextJob(null)
        return
      }

      // Find next job (first in_progress or first scheduled)
      const inProgressJob = jobs.find((j: CleaningJob) => j.status === 'IN_PROGRESS')
      const scheduledJobs = jobs.filter((j: CleaningJob) => j.status === 'SCHEDULED')

      const job = inProgressJob || scheduledJobs[0]

      if (!job) {
        setNextJob(null)
        return
      }

      // If we have user location and property has coordinates, calculate distance
      if (userLocation && job.property_latitude && job.property_longitude) {
        try {
          const distanceResponse = await fetch('/api/navigation/distance', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              origin: {
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
              },
              destination: {
                latitude: parseFloat(job.property_latitude),
                longitude: parseFloat(job.property_longitude),
              },
            }),
          })

          if (distanceResponse.ok) {
            const distanceData = await distanceResponse.json()

            // Estimate ETA based on distance (assuming 50 km/h average speed)
            const avgSpeedKmh = 50
            const etaMinutes = (distanceData.distance_km / avgSpeedKmh) * 60

            setNextJob({
              ...job,
              distance_meters: distanceData.distance_meters,
              distance_km: distanceData.distance_km,
              eta_minutes: etaMinutes,
            })
            return
          }
        } catch (err) {
          console.error('Error fetching distance:', err)
          // Continue without distance data
        }
      }

      setNextJob(job)
    } catch (err) {
      console.error('Error fetching next job:', err)
      setError(err instanceof Error ? err.message : 'Failed to load next job')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Fetch next job on mount and when location changes
   */
  useEffect(() => {
    fetchNextJob()

    // Refresh every 5 minutes
    const intervalId = setInterval(fetchNextJob, 5 * 60 * 1000)
    return () => clearInterval(intervalId)
  }, [worker, userLocation])

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
   * Format ETA for display
   */
  const formatETA = (minutes: number): string => {
    if (minutes < 60) {
      return `${Math.round(minutes)}min`
    }
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = Math.round(minutes % 60)
    return `${hours}h ${remainingMinutes}min`
  }

  /**
   * Get job status color
   */
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'SCHEDULED':
        return 'bg-amber-100 text-amber-800 border-amber-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  /**
   * Handle navigate to property
   */
  const handleNavigate = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (nextJob?.property_id) {
      navigate(`/navigation/${nextJob.property_id}`)
    }
  }

  /**
   * Handle view job details
   */
  const handleViewJob = () => {
    if (nextJob?.id) {
      navigate(`/jobs/${nextJob.id}`)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className={`bg-white border-2 border-gray-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center gap-3">
          <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
          <div className="flex-1">
            <p className="font-semibold text-sm text-gray-900">Next Job</p>
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
        onClick={fetchNextJob}
        role="button"
        tabIndex={0}
      >
        <div className="flex items-center gap-3">
          <Home className="w-8 h-8 text-red-400" />
          <div className="flex-1">
            <p className="font-semibold text-sm text-gray-900">Next Job</p>
            <p className="text-xs text-red-600">Tap to retry</p>
          </div>
        </div>
      </div>
    )
  }

  // No jobs
  if (!nextJob) {
    return (
      <div
        className={`bg-white border-2 border-gray-200 rounded-lg p-4 ${className}`}
        onClick={() => navigate('/schedule')}
        role="button"
        tabIndex={0}
      >
        <div className="flex items-center gap-3">
          <Calendar className="w-8 h-8 text-gray-400" />
          <div className="flex-1">
            <p className="font-semibold text-sm text-gray-900">Next Job</p>
            <p className="text-xs text-gray-600">No jobs scheduled for today</p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>
      </div>
    )
  }

  return (
    <div
      className={`bg-white border-2 border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow ${className}`}
      onClick={handleViewJob}
      role="button"
      tabIndex={0}
    >
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <p className="text-xs font-semibold text-blue-900">Next Job</p>
          </div>
          <span
            className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getStatusColor(
              nextJob.status
            )}`}
          >
            {nextJob.status.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Job Info */}
      <div className="p-4">
        {/* Time */}
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-4 h-4 text-gray-500" />
          <p className="text-sm font-semibold text-gray-900">
            {nextJob.scheduled_time_start} - {nextJob.scheduled_time_end}
          </p>
        </div>

        {/* Property */}
        <div className="mb-3">
          <h3 className="font-bold text-gray-900 mb-1">{nextJob.property_name}</h3>
          <p className="text-xs text-gray-600 flex items-start gap-1">
            <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
            <span>{nextJob.property_address}</span>
          </p>
        </div>

        {/* Distance and ETA */}
        {nextJob.distance_km !== undefined && nextJob.eta_minutes !== undefined && (
          <div className="flex items-center gap-4 mb-3 pb-3 border-b text-xs">
            <div className="flex items-center gap-1 text-gray-700">
              <Ruler className="w-3 h-3 text-blue-600" />
              <span className="font-medium">{formatDistance(nextJob.distance_meters!)}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-700">
              <Navigation2 className="w-3 h-3 text-blue-600" />
              <span className="font-medium">{formatETA(nextJob.eta_minutes)}</span>
            </div>
          </div>
        )}

        {/* Customer */}
        {nextJob.customer_name && (
          <p className="text-xs text-gray-600 mb-3">
            <span className="font-medium">Customer:</span> {nextJob.customer_name}
          </p>
        )}

        {/* Navigate Button */}
        {showNavButton && nextJob.property_latitude && nextJob.property_longitude && (
          <button
            onClick={handleNavigate}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Navigation2 className="w-4 h-4" />
            <span>Navigate Here</span>
          </button>
        )}
      </div>

      {/* View Details Link */}
      <div className="px-4 py-2 bg-gray-50 border-t flex items-center justify-between">
        <p className="text-xs text-gray-600">Tap for job details</p>
        <ChevronRight className="w-4 h-4 text-gray-400" />
      </div>
    </div>
  )
}
