import { useState, useEffect } from 'react'
import { User, Mail, Phone, MapPin, Briefcase, DollarSign, Camera, CheckCircle, Clock } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { Worker } from '../../types'

export default function WorkerProfile() {
  const { worker, logout } = useAuth()
  const [stats, setStats] = useState({
    totalJobs: 0,
    averageRating: 0,
    completionRate: 0,
    totalHours: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (worker) {
      fetchStats()
    }
  }, [worker])

  const fetchStats = async () => {
    if (!worker) return

    setLoading(true)
    try {
      const token = localStorage.getItem('worker_token')
      const serviceProviderId = localStorage.getItem('service_provider_id')

      const response = await fetch(
        `/api/workers/${worker.id}/history/stats?service_provider_id=${serviceProviderId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        setStats({
          totalJobs: data.data?.total_jobs || 0,
          averageRating: data.data?.average_rating || 0,
          completionRate: data.data?.completion_rate || 0,
          totalHours: data.data?.total_hours || 0,
        })
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!worker) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Loading profile...</p>
      </div>
    )
  }

  const getInitials = () => {
    return `${worker.first_name.charAt(0)}${worker.last_name.charAt(0)}`.toUpperCase()
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24 md:pb-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600 mt-1">View your profile and work statistics</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        {/* Profile Header with Banner */}
        <div className="h-24 bg-gradient-to-r from-blue-500 to-blue-600"></div>

        <div className="px-6 pb-6">
          {/* Profile Photo */}
          <div className="relative -mt-12 mb-4">
            <div className="w-24 h-24 rounded-full border-4 border-white bg-white shadow-lg flex items-center justify-center overflow-hidden">
              {worker.profile_photo_url ? (
                <img
                  src={worker.profile_photo_url}
                  alt={`${worker.first_name} ${worker.last_name}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">{getInitials()}</span>
                </div>
              )}
            </div>
            <button
              className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors"
              title="Change photo"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          {/* Worker Info */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {worker.first_name} {worker.last_name}
            </h2>
            <p className="text-gray-600 capitalize">
              {worker.worker_type.toLowerCase()} • {worker.employment_type.replace('_', ' ')}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Briefcase className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-medium text-gray-600">Total Jobs</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.totalJobs}</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-green-600" />
              <span className="text-xs font-medium text-gray-600">Total Hours</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.totalHours.toFixed(1)}</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-medium text-gray-600">Completion</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.completionRate}%</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-medium text-gray-600">Hourly Rate</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">${worker.hourly_rate}</p>
          </div>
        </div>
      )}

      {/* Contact Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h3 className="font-bold text-gray-900 mb-4">Contact Information</h3>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-600">Email</p>
              <p className="text-gray-900">{worker.email}</p>
            </div>
          </div>

          {worker.phone && (
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-600">Phone</p>
                <p className="text-gray-900">{worker.phone}</p>
              </div>
            </div>
          )}

          {worker.address && (
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-600">Address</p>
                <p className="text-gray-900">{worker.address}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Employment Details */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h3 className="font-bold text-gray-900 mb-4">Employment Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Worker Type</p>
            <p className="text-gray-900 capitalize">{worker.worker_type.toLowerCase()}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Employment Type</p>
            <p className="text-gray-900 capitalize">{worker.employment_type.replace('_', ' ')}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Hourly Rate</p>
            <p className="text-gray-900">${worker.hourly_rate.toFixed(2)}/hour</p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Member Since</p>
            <p className="text-gray-900">
              {new Date(worker.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <button
          onClick={() => {
            // TODO: Implement edit profile
            alert('Edit profile feature coming soon!')
          }}
          className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Edit Profile
        </button>

        <button
          onClick={() => {
            if (confirm('Are you sure you want to log out?')) {
              logout()
            }
          }}
          className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
        >
          Log Out
        </button>
      </div>
    </div>
  )
}
