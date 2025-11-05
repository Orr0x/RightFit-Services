# Worker App Stories: Profile & Work History
## Stories WA-014, WA-015

**Sprint**: Phase 4 - Worker Web Application
**Phase**: 5 - Profile & Polish
**Total Points**: 4
**Estimated Duration**: 1-2 days
**Dependencies**: WA-001 (Project Setup), WA-002 (Authentication)

---

## Overview

This document covers the implementation of the worker's profile management and work history features. Workers need to view and update their personal information and review their completed job history.

**User Story**: As a worker, I want to view and update my profile information and see my work history, so that I can keep my details current and track my completed jobs.

---

## Story WA-014: Worker Profile Page

**Story Points**: 2
**Priority**: MEDIUM
**Status**: TODO

### Description

Create a profile page where workers can view and edit their personal information, view employment details, and upload a profile photo.

### User Stories

```
As a worker,
I want to view and edit my personal information,
So that my contact details are always up to date.

As a worker,
I want to see my employment details and statistics,
So that I know my job performance metrics.
```

### Technical Requirements

#### API Endpoints Used
```typescript
GET /api/workers/:workerId           // Get worker profile
PATCH /api/workers/:workerId         // Update profile
POST /api/workers/:workerId/photo    // Upload profile photo
GET /api/workers/:workerId/stats     // Get worker statistics
```

#### Routes
```
/profile          - View profile
/profile/edit     - Edit profile
```

### Implementation Details

#### 1. Create Profile Page Component

**File**: `apps/web-worker/src/pages/profile/MyProfile.tsx`

```typescript
import { useState, useEffect } from 'react'
import { User, Mail, Phone, MapPin, Edit, Camera, Award, Clock } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

interface WorkerProfile {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  address: string | null
  profile_photo_url: string | null
  worker_type: string
  employment_type: string
  hourly_rate: number
  certificates: any[]
}

interface WorkerStats {
  completedThisMonth: number
  hoursThisWeek: number
  upcomingJobs: number
}

export default function MyProfile() {
  const { worker } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState<WorkerProfile | null>(null)
  const [stats, setStats] = useState<WorkerStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProfile()
    loadStats()
  }, [])

  const loadProfile = async () => {
    try {
      const response = await fetch(`/api/workers/${worker?.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('worker_token')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setProfile(data.worker)
      }
    } catch (error) {
      console.error('Failed to load profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const response = await fetch(`/api/workers/${worker?.id}/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('worker_token')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('photo', file)

    try {
      const response = await fetch(`/api/workers/${worker?.id}/photo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('worker_token')}`
        },
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setProfile(prev => prev ? { ...prev, profile_photo_url: data.photo_url } : null)
      }
    } catch (error) {
      console.error('Failed to upload photo:', error)
      alert('Failed to upload photo')
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading profile...</div>
  }

  if (!profile) {
    return <div className="text-center py-12 text-red-600">Failed to load profile</div>
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <User className="w-6 h-6 text-blue-600" />
          My Profile
        </h1>
        <button
          onClick={() => navigate('/profile/edit')}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Edit className="w-4 h-4" />
          Edit Profile
        </button>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        {/* Profile Photo Section */}
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center mb-6 pb-6 border-b">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
              {profile.profile_photo_url ? (
                <img
                  src={profile.profile_photo_url}
                  alt={`${profile.first_name} ${profile.last_name}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                `${profile.first_name[0]}${profile.last_name[0]}`
              )}
            </div>
            <label className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white cursor-pointer hover:bg-blue-700">
              <Camera className="w-4 h-4" />
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>
          </div>

          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">
              {profile.first_name} {profile.last_name}
            </h2>
            <p className="text-gray-600 capitalize">{profile.worker_type.replace('_', ' ')}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                {profile.employment_type}
              </span>
              <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                £{profile.hourly_rate}/hour
              </span>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium text-gray-900">{profile.email}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="font-medium text-gray-900">{profile.phone || 'Not provided'}</p>
            </div>
          </div>

          {profile.address && (
            <div className="flex items-start gap-3 md:col-span-2">
              <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Address</p>
                <p className="font-medium text-gray-900">{profile.address}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl">
                ✅
              </div>
              <div>
                <p className="text-sm text-blue-600 font-medium">Completed</p>
                <p className="text-2xl font-bold text-blue-900">
                  {stats.completedThisMonth}
                </p>
                <p className="text-xs text-blue-600">This month</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white text-xl">
                ⏰
              </div>
              <div>
                <p className="text-sm text-green-600 font-medium">Hours</p>
                <p className="text-2xl font-bold text-green-900">
                  {stats.hoursThisWeek}
                </p>
                <p className="text-xs text-green-600">This week</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white text-xl">
                📅
              </div>
              <div>
                <p className="text-sm text-purple-600 font-medium">Upcoming</p>
                <p className="text-2xl font-bold text-purple-900">
                  {stats.upcomingJobs}
                </p>
                <p className="text-xs text-purple-600">Scheduled jobs</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Certificates Section */}
      {profile.certificates && profile.certificates.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-600" />
            Certificates & Qualifications
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {profile.certificates.map((cert: any, index: number) => (
              <div
                key={index}
                className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
              >
                <p className="font-medium text-gray-900">{cert.name}</p>
                {cert.expires_at && (
                  <p className="text-sm text-gray-600">
                    Expires: {new Date(cert.expires_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
```

#### 2. Create Edit Profile Page

**File**: `apps/web-worker/src/pages/profile/EditProfile.tsx`

```typescript
import { useState, useEffect } from 'react'
import { User, Save, X, AlertCircle } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function EditProfile() {
  const { worker } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
  })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const response = await fetch(`/api/workers/${worker?.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('worker_token')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setFormData({
          first_name: data.worker.first_name,
          last_name: data.worker.last_name,
          email: data.worker.email,
          phone: data.worker.phone || '',
          address: data.worker.address || '',
        })
      }
    } catch (error) {
      console.error('Failed to load profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setSubmitting(true)

    try {
      const response = await fetch(`/api/workers/${worker?.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('worker_token')}`
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => navigate('/profile'), 1500)
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Update profile error:', error)
      setError('Failed to update profile. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <User className="w-6 h-6 text-blue-600" />
          Edit Profile
        </h1>
        <button
          onClick={() => navigate('/profile')}
          className="text-gray-600 hover:text-gray-800"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-green-800">Profile updated successfully!</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name *
              </label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
              disabled={submitting}
            >
              <Save className="w-4 h-4" />
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
```

### Acceptance Criteria

- [ ] Worker can view their full profile information
- [ ] Profile displays photo with upload button
- [ ] Worker can upload profile photo
- [ ] Statistics cards show correct data
- [ ] Worker can click "Edit Profile" button
- [ ] Edit page loads with current data
- [ ] Worker can update first name, last name
- [ ] Worker can update email and phone
- [ ] Worker can update address
- [ ] Form validation prevents invalid data
- [ ] Success message shows after saving
- [ ] Returns to profile page after save
- [ ] Certificates display if worker has any
- [ ] Page is responsive on mobile

### Testing Checklist

- [ ] View profile page
- [ ] Upload profile photo
- [ ] Click edit profile
- [ ] Update all fields
- [ ] Submit with missing required fields (should fail)
- [ ] Submit with valid data
- [ ] Verify data persists after page reload
- [ ] Test on mobile device
- [ ] Verify tenant isolation

---

## Story WA-015: Work History Page

**Story Points**: 2
**Priority**: LOW
**Status**: TODO

### Description

Create a work history page that displays all completed jobs with photos, earnings, and hours worked. This helps workers review their past work.

### User Stories

```
As a worker,
I want to view my completed job history,
So that I can review my past work and track my earnings.
```

### Technical Requirements

#### API Endpoints Used
```typescript
GET /api/workers/:workerId/jobs?status=COMPLETED&page=1&limit=20
// Returns paginated completed jobs

GET /api/cleaning-timesheets/:jobId/photos
// Returns photos for a specific job
```

#### Route
```
/history
```

### Implementation Details

#### 1. Create Work History Page

**File**: `apps/web-worker/src/pages/profile/WorkHistory.tsx`

```typescript
import { useState, useEffect } from 'react'
import { Clock, Calendar, MapPin, Image as ImageIcon, ChevronRight } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { format } from 'date-fns'

interface CompletedJob {
  id: string
  property_name: string
  property_address: string
  scheduled_date: string
  status: string
  quoted_price: number
  timesheet?: {
    id: string
    start_time: string
    end_time: string
    hours_worked: number
    photo_count: number
  }
}

export default function WorkHistory() {
  const { worker } = useAuth()
  const [jobs, setJobs] = useState<CompletedJob[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [selectedJob, setSelectedJob] = useState<string | null>(null)
  const [photos, setPhotos] = useState<any[]>([])

  useEffect(() => {
    loadHistory()
  }, [page])

  const loadHistory = async () => {
    setLoading(true)
    try {
      const response = await fetch(
        `/api/workers/${worker?.id}/jobs?status=COMPLETED&page=${page}&limit=20&sort=scheduled_date:desc`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('worker_token')}`
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        setJobs(prev => page === 1 ? data.jobs : [...prev, ...data.jobs])
        setHasMore(data.has_more)
      }
    } catch (error) {
      console.error('Failed to load history:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadPhotos = async (timesheetId: string) => {
    try {
      const response = await fetch(`/api/cleaning-timesheets/${timesheetId}/photos`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('worker_token')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setPhotos(data.photos)
      }
    } catch (error) {
      console.error('Failed to load photos:', error)
    }
  }

  const calculateTotals = () => {
    const totalHours = jobs.reduce((sum, job) =>
      sum + (job.timesheet?.hours_worked || 0), 0
    )
    const totalEarnings = jobs.reduce((sum, job) =>
      sum + job.quoted_price, 0
    )

    return {
      totalJobs: jobs.length,
      totalHours: Math.round(totalHours * 10) / 10,
      totalEarnings: totalEarnings.toFixed(2),
    }
  }

  const totals = calculateTotals()

  if (loading && page === 1) {
    return <div className="text-center py-12">Loading history...</div>
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Clock className="w-6 h-6 text-green-600" />
        Work History
      </h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl">
              ✅
            </div>
            <div>
              <p className="text-sm text-blue-600 font-medium">Total Jobs</p>
              <p className="text-2xl font-bold text-blue-900">{totals.totalJobs}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white text-xl">
              ⏰
            </div>
            <div>
              <p className="text-sm text-green-600 font-medium">Total Hours</p>
              <p className="text-2xl font-bold text-green-900">{totals.totalHours}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white text-xl">
              💰
            </div>
            <div>
              <p className="text-sm text-purple-600 font-medium">Total Earnings</p>
              <p className="text-2xl font-bold text-purple-900">£{totals.totalEarnings}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Job History List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {jobs.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No completed jobs yet</p>
          </div>
        ) : (
          <div className="divide-y">
            {jobs.map((job) => (
              <div key={job.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Date */}
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {format(new Date(job.scheduled_date), 'EEE, MMM d, yyyy')}
                      </span>
                    </div>

                    {/* Property Name */}
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {job.property_name}
                    </h3>

                    {/* Address */}
                    <div className="flex items-start gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                      <span className="text-sm text-gray-600">{job.property_address}</span>
                    </div>

                    {/* Timesheet Info */}
                    {job.timesheet && (
                      <div className="flex flex-wrap gap-4 mt-2">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-blue-600" />
                          <span className="text-sm text-gray-700">
                            {job.timesheet.hours_worked.toFixed(1)} hours
                          </span>
                        </div>

                        {job.timesheet.photo_count > 0 && (
                          <button
                            onClick={() => {
                              setSelectedJob(job.id)
                              loadPhotos(job.timesheet!.id)
                            }}
                            className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                          >
                            <ImageIcon className="w-4 h-4" />
                            {job.timesheet.photo_count} photos
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Price */}
                  <div className="text-right ml-4">
                    <p className="text-lg font-bold text-green-600">
                      £{job.quoted_price.toFixed(2)}
                    </p>
                    <span className="inline-block mt-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      Completed
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More Button */}
        {hasMore && !loading && (
          <div className="p-4 text-center border-t">
            <button
              onClick={() => setPage(p => p + 1)}
              className="text-blue-600 hover:underline font-medium"
            >
              Load More
            </button>
          </div>
        )}

        {loading && page > 1 && (
          <div className="p-4 text-center border-t text-gray-500">
            Loading...
          </div>
        )}
      </div>

      {/* Photo Modal */}
      {selectedJob && (
        <PhotoModal
          photos={photos}
          onClose={() => {
            setSelectedJob(null)
            setPhotos([])
          }}
        />
      )}
    </div>
  )
}
```

#### 2. Create Photo Modal Component

**File**: `apps/web-worker/src/components/history/PhotoModal.tsx`

```typescript
import { X } from 'lucide-react'

interface PhotoModalProps {
  photos: Array<{
    id: string
    photo_url: string
    category: string
    uploaded_at: string
  }>
  onClose: () => void
}

export default function PhotoModal({ photos, onClose }: PhotoModalProps) {
  const groupedPhotos = photos.reduce((acc, photo) => {
    const category = photo.category || 'other'
    if (!acc[category]) acc[category] = []
    acc[category].push(photo)
    return acc
  }, {} as Record<string, typeof photos>)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <h2 className="text-xl font-bold">Job Photos</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Photos by Category */}
        <div className="p-6 space-y-6">
          {Object.entries(groupedPhotos).map(([category, categoryPhotos]) => (
            <div key={category}>
              <h3 className="text-lg font-semibold capitalize mb-3">
                {category} Photos ({categoryPhotos.length})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {categoryPhotos.map((photo) => (
                  <div
                    key={photo.id}
                    className="aspect-square rounded-lg overflow-hidden bg-gray-100"
                  >
                    <img
                      src={photo.photo_url}
                      alt={`${category} photo`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                      onClick={() => window.open(photo.photo_url, '_blank')}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

### Acceptance Criteria

- [ ] Worker can view list of completed jobs
- [ ] Jobs show date, property, hours, and earnings
- [ ] Summary cards show totals (jobs, hours, earnings)
- [ ] Jobs are sorted by date (newest first)
- [ ] Worker can click to view photos for a job
- [ ] Photos are grouped by category (before, after, issue)
- [ ] Photos open in full size when clicked
- [ ] "Load More" button loads additional jobs
- [ ] Empty state shows when no jobs completed
- [ ] Page is responsive on mobile

### Testing Checklist

- [ ] View work history page
- [ ] Verify completed jobs display correctly
- [ ] Check total calculations are accurate
- [ ] Click on job photos
- [ ] Verify photo categories group correctly
- [ ] Click "Load More" to paginate
- [ ] Test with worker who has no completed jobs
- [ ] Test on mobile device
- [ ] Open photo in new tab

---

## Dependencies

### Existing Code
- Authentication system (WA-002)
- Worker layout and navigation (WA-003)
- Worker model and database
- Timesheet photos API

### New Code Created
- MyProfile page component
- EditProfile page component
- WorkHistory page component
- PhotoModal component

---

## Notes

- Profile photo uploads should be stored in cloud storage (S3 or similar)
- Employment details (worker_type, hourly_rate) are read-only for workers
- Managers can update worker details from cleaning dashboard
- Work history helps workers track their performance
- Future enhancement: Export work history to PDF/CSV
- Future enhancement: Filter work history by date range

---

**Document Version**: 1.0
**Last Updated**: 2025-11-05
