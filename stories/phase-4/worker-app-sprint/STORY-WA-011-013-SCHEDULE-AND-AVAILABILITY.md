# Worker App Stories: Schedule & Availability Management
## Stories WA-011, WA-012, WA-013

**Sprint**: Phase 4 - Worker Web Application
**Phase**: 4 - Schedule & Availability
**Total Points**: 12
**Estimated Duration**: 3 days
**Dependencies**: WA-001 (Project Setup), WA-002 (Authentication)

---

## Overview

This document covers the implementation of the worker's schedule view and availability management system. Workers need to see their upcoming job schedule and be able to block out dates when they're not available for work.

**User Story**: As a worker, I want to view my upcoming schedule and block out dates when I'm unavailable, so that my manager doesn't schedule me on days I can't work.

---

## Story WA-011: My Schedule Page

**Story Points**: 5
**Priority**: HIGH
**Status**: TODO

### Description

Create a schedule/rota view that displays the worker's assigned jobs in a calendar format. This gives workers visibility into their upcoming work schedule.

### User Stories

```
As a worker,
I want to view my upcoming job schedule in a calendar format,
So that I can plan my week and see when I'm working.

As a worker,
I want to see job details when I click on a scheduled job,
So that I can prepare for upcoming work.
```

### Technical Requirements

#### API Endpoints Used
```typescript
GET /api/workers/:workerId/jobs?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
// Returns jobs assigned to worker within date range

GET /api/cleaning-jobs/:jobId
// Returns job details when clicking on calendar event
```

#### Route
```
/schedule
```

### Implementation Details

#### 1. Create Schedule Page Component

**File**: `apps/web-worker/src/pages/schedule/MySchedule.tsx`

```typescript
import { useState, useEffect } from 'react'
import { Calendar, Clock, MapPin, Home } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks } from 'date-fns'

interface ScheduledJob {
  id: string
  property_id: string
  property_name: string
  property_address: string
  scheduled_date: string
  scheduled_time_start: string
  scheduled_time_end: string
  status: string
  quoted_price: number
}

export default function MySchedule() {
  const { worker } = useAuth()
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [jobs, setJobs] = useState<ScheduledJob[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'week' | 'month'>('week')

  useEffect(() => {
    loadSchedule()
  }, [currentWeek, view])

  const loadSchedule = async () => {
    setLoading(true)
    try {
      const start = view === 'week'
        ? startOfWeek(currentWeek, { weekStartsOn: 1 })
        : startOfMonth(currentWeek)

      const end = view === 'week'
        ? endOfWeek(currentWeek, { weekStartsOn: 1 })
        : endOfMonth(currentWeek)

      const response = await fetch(
        `/api/workers/${worker?.id}/jobs?start_date=${format(start, 'yyyy-MM-dd')}&end_date=${format(end, 'yyyy-MM-dd')}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('worker_token')}`
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        setJobs(data.jobs)
      }
    } catch (error) {
      console.error('Failed to load schedule:', error)
    } finally {
      setLoading(false)
    }
  }

  const goToPreviousWeek = () => {
    setCurrentWeek(prev => subWeeks(prev, 1))
  }

  const goToNextWeek = () => {
    setCurrentWeek(prev => addWeeks(prev, 1))
  }

  const goToToday = () => {
    setCurrentWeek(new Date())
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Calendar className="w-6 h-6 text-blue-600" />
          My Schedule
        </h1>

        {/* View Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setView('week')}
            className={`px-4 py-2 rounded-lg ${
              view === 'week'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setView('month')}
            className={`px-4 py-2 rounded-lg ${
              view === 'month'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Month
          </button>
        </div>
      </div>

      {/* Week Navigation */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex items-center justify-between">
          <button
            onClick={goToPreviousWeek}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            ← Previous
          </button>

          <div className="text-center">
            <h2 className="text-lg font-semibold">
              {format(startOfWeek(currentWeek, { weekStartsOn: 1 }), 'MMM d')} - {format(endOfWeek(currentWeek, { weekStartsOn: 1 }), 'MMM d, yyyy')}
            </h2>
            <button
              onClick={goToToday}
              className="text-sm text-blue-600 hover:underline"
            >
              Today
            </button>
          </div>

          <button
            onClick={goToNextWeek}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            Next →
          </button>
        </div>
      </div>

      {/* Week View Grid */}
      {view === 'week' && (
        <WeekView
          jobs={jobs}
          currentWeek={currentWeek}
          loading={loading}
        />
      )}

      {/* Month View Grid */}
      {view === 'month' && (
        <MonthView
          jobs={jobs}
          currentMonth={currentWeek}
          loading={loading}
        />
      )}

      {/* Schedule Summary */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl">
              📅
            </div>
            <div>
              <p className="text-sm text-blue-600 font-medium">This Week</p>
              <p className="text-2xl font-bold text-blue-900">
                {jobs.filter(j => isThisWeek(j.scheduled_date)).length} Jobs
              </p>
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
              <p className="text-2xl font-bold text-green-900">
                {calculateTotalHours(jobs)} hrs
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white text-xl">
              💰
            </div>
            <div>
              <p className="text-sm text-purple-600 font-medium">Est. Earnings</p>
              <p className="text-2xl font-bold text-purple-900">
                £{calculateEarnings(jobs)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
```

#### 2. Create Week View Component

**File**: `apps/web-worker/src/components/schedule/WeekView.tsx`

```typescript
import { format, startOfWeek, addDays, isSameDay } from 'date-fns'
import { Clock, MapPin } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface WeekViewProps {
  jobs: ScheduledJob[]
  currentWeek: Date
  loading: boolean
}

export default function WeekView({ jobs, currentWeek, loading }: WeekViewProps) {
  const navigate = useNavigate()
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 })
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const getJobsForDay = (day: Date) => {
    return jobs.filter(job => isSameDay(new Date(job.scheduled_date), day))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 border-green-300 text-green-800'
      case 'IN_PROGRESS': return 'bg-blue-100 border-blue-300 text-blue-800'
      case 'SCHEDULED': return 'bg-gray-100 border-gray-300 text-gray-800'
      default: return 'bg-gray-100 border-gray-300 text-gray-800'
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading schedule...</div>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
      {days.map((day, index) => {
        const dayJobs = getJobsForDay(day)
        const isToday = isSameDay(day, new Date())

        return (
          <div
            key={index}
            className={`bg-white rounded-xl shadow-sm overflow-hidden ${
              isToday ? 'ring-2 ring-blue-500' : ''
            }`}
          >
            {/* Day Header */}
            <div className={`p-3 ${isToday ? 'bg-blue-600 text-white' : 'bg-gray-50'}`}>
              <p className="text-xs font-medium uppercase">
                {format(day, 'EEE')}
              </p>
              <p className={`text-2xl font-bold ${isToday ? 'text-white' : 'text-gray-900'}`}>
                {format(day, 'd')}
              </p>
            </div>

            {/* Jobs for Day */}
            <div className="p-2 space-y-2">
              {dayJobs.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No jobs</p>
              ) : (
                dayJobs.map(job => (
                  <button
                    key={job.id}
                    onClick={() => navigate(`/jobs/${job.id}`)}
                    className={`w-full text-left p-3 rounded-lg border-2 hover:shadow-md transition-all ${getStatusColor(job.status)}`}
                  >
                    <div className="flex items-start gap-2 mb-2">
                      <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold">
                          {job.scheduled_time_start} - {job.scheduled_time_end}
                        </p>
                        <p className="text-sm font-medium truncate">
                          {job.property_name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0 opacity-70" />
                      <p className="text-xs opacity-80 line-clamp-2">
                        {job.property_address}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
```

### Acceptance Criteria

- [ ] Worker can view their schedule in week view
- [ ] Worker can view their schedule in month view
- [ ] Week navigation (previous, next, today) works correctly
- [ ] Jobs are displayed with correct date, time, and property info
- [ ] Clicking a job navigates to job details page
- [ ] Today's date is visually highlighted
- [ ] Jobs are color-coded by status (scheduled, in-progress, completed)
- [ ] Schedule summary shows correct totals (jobs, hours, earnings)
- [ ] Loading state shows while fetching schedule
- [ ] Empty days show "No jobs" message
- [ ] Schedule is responsive on mobile and desktop

### Testing Checklist

- [ ] Load schedule for current week
- [ ] Navigate to previous and next weeks
- [ ] Click "Today" button returns to current week
- [ ] Switch between week and month views
- [ ] Click on scheduled job navigates to details
- [ ] Verify jobs show correct time and location
- [ ] Test with worker who has no jobs scheduled
- [ ] Test with worker who has multiple jobs per day
- [ ] Verify schedule respects tenant isolation

---

## Story WA-012: Availability Management Backend

**Story Points**: 3
**Priority**: HIGH
**Status**: TODO

### Description

Create backend service and API endpoints for workers to manage their availability. Workers can block out dates when they're unavailable, preventing managers from scheduling them.

### Technical Requirements

#### Database Schema

**File**: `packages/database/prisma/schema.prisma`

```prisma
model WorkerAvailability {
  id                  String   @id @default(uuid())
  worker_id           String
  service_provider_id String
  start_date          DateTime @db.Date
  end_date            DateTime @db.Date
  reason              String?
  status              WorkerAvailabilityStatus @default(BLOCKED)
  created_at          DateTime @default(now())
  updated_at          DateTime @updatedAt

  worker              Worker          @relation(fields: [worker_id], references: [id], onDelete: Cascade)
  service_provider    ServiceProvider @relation(fields: [service_provider_id], references: [id], onDelete: Cascade)

  @@index([worker_id])
  @@index([service_provider_id])
  @@index([start_date, end_date])
  @@map("worker_availability")
}

enum WorkerAvailabilityStatus {
  BLOCKED      // Worker is not available
  AVAILABLE    // Worker is available (can be used for overrides)
}
```

#### API Endpoints

```typescript
GET    /api/workers/:workerId/availability       // Get worker's blocked dates
POST   /api/workers/:workerId/availability       // Block out dates
DELETE /api/workers/:workerId/availability/:id   // Remove blocked dates
GET    /api/workers/:workerId/stats               // Get worker stats
```

### Implementation Details

#### 1. Create Availability Service

**File**: `apps/api/src/services/workerAvailability.service.ts`

```typescript
import { db } from '@rightfit/database'

export class WorkerAvailabilityService {
  /**
   * Get all availability records for a worker
   */
  async getWorkerAvailability(workerId: string, serviceProviderId: string) {
    return await db.workerAvailability.findMany({
      where: {
        worker_id: workerId,
        service_provider_id: serviceProviderId,
      },
      orderBy: {
        start_date: 'asc',
      },
    })
  }

  /**
   * Block out dates for a worker
   */
  async blockDates(data: {
    workerId: string
    serviceProviderId: string
    startDate: Date
    endDate: Date
    reason?: string
  }) {
    const { workerId, serviceProviderId, startDate, endDate, reason } = data

    // Validate dates
    if (startDate > endDate) {
      throw new Error('Start date must be before end date')
    }

    // Check for overlapping blocked dates
    const overlapping = await db.workerAvailability.findFirst({
      where: {
        worker_id: workerId,
        service_provider_id: serviceProviderId,
        status: 'BLOCKED',
        OR: [
          {
            start_date: { lte: endDate },
            end_date: { gte: startDate },
          },
        ],
      },
    })

    if (overlapping) {
      throw new Error('Dates overlap with existing blocked period')
    }

    // Create availability record
    return await db.workerAvailability.create({
      data: {
        worker_id: workerId,
        service_provider_id: serviceProviderId,
        start_date: startDate,
        end_date: endDate,
        reason: reason || null,
        status: 'BLOCKED',
      },
    })
  }

  /**
   * Remove blocked dates
   */
  async unblockDates(availabilityId: string, serviceProviderId: string) {
    // Verify ownership
    const availability = await db.workerAvailability.findFirst({
      where: {
        id: availabilityId,
        service_provider_id: serviceProviderId,
      },
    })

    if (!availability) {
      throw new Error('Availability record not found')
    }

    return await db.workerAvailability.delete({
      where: { id: availabilityId },
    })
  }

  /**
   * Check if worker is available on a specific date
   */
  async isWorkerAvailable(
    workerId: string,
    date: Date,
    serviceProviderId: string
  ): Promise<boolean> {
    const blocked = await db.workerAvailability.findFirst({
      where: {
        worker_id: workerId,
        service_provider_id: serviceProviderId,
        status: 'BLOCKED',
        start_date: { lte: date },
        end_date: { gte: date },
      },
    })

    return !blocked
  }

  /**
   * Get worker statistics
   */
  async getWorkerStats(workerId: string, serviceProviderId: string) {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())

    // Get completed jobs count
    const completedThisMonth = await db.cleaningJob.count({
      where: {
        assigned_worker_id: workerId,
        service_provider_id: serviceProviderId,
        status: 'COMPLETED',
        scheduled_date: { gte: startOfMonth },
      },
    })

    // Get total hours from timesheets
    const timesheets = await db.cleaningJobTimesheet.findMany({
      where: {
        worker_id: workerId,
        service_provider_id: serviceProviderId,
        start_time: { gte: startOfWeek },
        end_time: { not: null },
      },
      select: {
        start_time: true,
        end_time: true,
      },
    })

    const totalHours = timesheets.reduce((sum, ts) => {
      if (ts.end_time) {
        const hours = (ts.end_time.getTime() - ts.start_time.getTime()) / (1000 * 60 * 60)
        return sum + hours
      }
      return sum
    }, 0)

    return {
      completedThisMonth,
      hoursThisWeek: Math.round(totalHours * 10) / 10,
      upcomingJobs: await db.cleaningJob.count({
        where: {
          assigned_worker_id: workerId,
          service_provider_id: serviceProviderId,
          status: 'SCHEDULED',
          scheduled_date: { gte: now },
        },
      }),
    }
  }
}

export const workerAvailabilityService = new WorkerAvailabilityService()
```

#### 2. Create API Routes

**File**: `apps/api/src/routes/workerAvailability.routes.ts`

```typescript
import { Router } from 'express'
import { workerAvailabilityService } from '../services/workerAvailability.service'
import { authenticate } from '../middleware/auth'
import { validateWorkerAccess } from '../middleware/validateWorkerAccess'

const router = Router()

// Get worker availability
router.get(
  '/workers/:workerId/availability',
  authenticate,
  validateWorkerAccess,
  async (req, res) => {
    try {
      const { workerId } = req.params
      const serviceProviderId = req.user.service_provider_id

      const availability = await workerAvailabilityService.getWorkerAvailability(
        workerId,
        serviceProviderId
      )

      res.json({ availability })
    } catch (error) {
      console.error('Get availability error:', error)
      res.status(500).json({ error: 'Failed to get availability' })
    }
  }
)

// Block dates
router.post(
  '/workers/:workerId/availability',
  authenticate,
  validateWorkerAccess,
  async (req, res) => {
    try {
      const { workerId } = req.params
      const { start_date, end_date, reason } = req.body
      const serviceProviderId = req.user.service_provider_id

      // Validate input
      if (!start_date || !end_date) {
        return res.status(400).json({ error: 'Start date and end date are required' })
      }

      const availability = await workerAvailabilityService.blockDates({
        workerId,
        serviceProviderId,
        startDate: new Date(start_date),
        endDate: new Date(end_date),
        reason,
      })

      res.json({ availability })
    } catch (error: any) {
      console.error('Block dates error:', error)
      res.status(400).json({ error: error.message || 'Failed to block dates' })
    }
  }
)

// Unblock dates
router.delete(
  '/workers/:workerId/availability/:id',
  authenticate,
  validateWorkerAccess,
  async (req, res) => {
    try {
      const { id } = req.params
      const serviceProviderId = req.user.service_provider_id

      await workerAvailabilityService.unblockDates(id, serviceProviderId)

      res.json({ success: true })
    } catch (error: any) {
      console.error('Unblock dates error:', error)
      res.status(400).json({ error: error.message || 'Failed to unblock dates' })
    }
  }
)

// Get worker stats
router.get(
  '/workers/:workerId/stats',
  authenticate,
  validateWorkerAccess,
  async (req, res) => {
    try {
      const { workerId } = req.params
      const serviceProviderId = req.user.service_provider_id

      const stats = await workerAvailabilityService.getWorkerStats(
        workerId,
        serviceProviderId
      )

      res.json(stats)
    } catch (error) {
      console.error('Get stats error:', error)
      res.status(500).json({ error: 'Failed to get stats' })
    }
  }
)

export default router
```

#### 3. Create Migration

**File**: `packages/database/prisma/migrations/XXX_add_worker_availability/migration.sql`

```sql
-- CreateEnum
CREATE TYPE "WorkerAvailabilityStatus" AS ENUM ('BLOCKED', 'AVAILABLE');

-- CreateTable
CREATE TABLE "worker_availability" (
    "id" TEXT NOT NULL,
    "worker_id" TEXT NOT NULL,
    "service_provider_id" TEXT NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "reason" TEXT,
    "status" "WorkerAvailabilityStatus" NOT NULL DEFAULT 'BLOCKED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "worker_availability_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "worker_availability_worker_id_idx" ON "worker_availability"("worker_id");

-- CreateIndex
CREATE INDEX "worker_availability_service_provider_id_idx" ON "worker_availability"("service_provider_id");

-- CreateIndex
CREATE INDEX "worker_availability_start_date_end_date_idx" ON "worker_availability"("start_date", "end_date");

-- AddForeignKey
ALTER TABLE "worker_availability" ADD CONSTRAINT "worker_availability_worker_id_fkey" FOREIGN KEY ("worker_id") REFERENCES "workers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_availability" ADD CONSTRAINT "worker_availability_service_provider_id_fkey" FOREIGN KEY ("service_provider_id") REFERENCES "service_providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

### Acceptance Criteria

- [ ] WorkerAvailability table created in database
- [ ] Migration runs successfully
- [ ] Worker can block out date ranges
- [ ] System prevents overlapping blocked dates
- [ ] Worker can view their blocked dates
- [ ] Worker can delete blocked dates
- [ ] Availability respects tenant isolation
- [ ] API validates start_date < end_date
- [ ] Worker stats endpoint returns correct data
- [ ] Blocked dates prevent job scheduling (future enhancement)

### Testing Checklist

- [ ] Run migration on test database
- [ ] Create availability record via API
- [ ] Verify overlapping dates are rejected
- [ ] Delete availability record
- [ ] Get worker availability list
- [ ] Verify tenant isolation (can't access other tenant's data)
- [ ] Test with invalid date ranges
- [ ] Get worker stats and verify calculations

---

## Story WA-013: Manage Availability Page

**Story Points**: 4
**Priority**: HIGH
**Status**: TODO

### Description

Create the frontend UI for workers to view and manage their availability calendar. Workers can block out dates when they're not available and see existing blocked periods.

### User Stories

```
As a worker,
I want to block out dates when I'm not available,
So that my manager doesn't schedule me on those days.

As a worker,
I want to see all my blocked dates in a calendar view,
So that I can manage my availability easily.
```

### Implementation Details

#### 1. Create Manage Availability Page

**File**: `apps/web-worker/src/pages/availability/ManageAvailability.tsx`

```typescript
import { useState, useEffect } from 'react'
import { Calendar as CalendarIcon, Plus, X, AlertCircle } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { format, isSameDay, isWithinInterval } from 'date-fns'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'

interface BlockedPeriod {
  id: string
  start_date: string
  end_date: string
  reason: string | null
}

export default function ManageAvailability() {
  const { worker } = useAuth()
  const [blockedPeriods, setBlockedPeriods] = useState<BlockedPeriod[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    loadAvailability()
  }, [])

  const loadAvailability = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/workers/${worker?.id}/availability`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('worker_token')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setBlockedPeriods(data.availability)
      }
    } catch (error) {
      console.error('Failed to load availability:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteBlockedPeriod = async (id: string) => {
    if (!confirm('Remove this blocked period?')) return

    try {
      const response = await fetch(`/api/workers/${worker?.id}/availability/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('worker_token')}`
        }
      })

      if (response.ok) {
        setBlockedPeriods(prev => prev.filter(p => p.id !== id))
      }
    } catch (error) {
      console.error('Failed to delete blocked period:', error)
      alert('Failed to remove blocked period')
    }
  }

  const tileClassName = ({ date }: { date: Date }) => {
    const isBlocked = blockedPeriods.some(period => {
      const start = new Date(period.start_date)
      const end = new Date(period.end_date)
      return isWithinInterval(date, { start, end })
    })

    return isBlocked ? 'blocked-date' : ''
  }

  if (loading) {
    return <div className="text-center py-12">Loading availability...</div>
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <CalendarIcon className="w-6 h-6 text-purple-600" />
          Manage Availability
        </h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
        >
          <Plus className="w-5 h-5" />
          Block Dates
        </button>
      </div>

      {/* Info Alert */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-900">
          <p className="font-medium mb-1">How it works</p>
          <p>
            Block out dates when you're not available for work. Your manager will be notified
            and won't schedule you on these dates.
          </p>
        </div>
      </div>

      {/* Calendar View */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Availability Calendar</h2>
        <Calendar
          className="availability-calendar w-full"
          tileClassName={tileClassName}
        />
        <div className="mt-4 flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-200 rounded border-2 border-red-400"></div>
            <span className="text-gray-600">Blocked (unavailable)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded border-2 border-gray-300"></div>
            <span className="text-gray-600">Available</span>
          </div>
        </div>
      </div>

      {/* Blocked Periods List */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Blocked Periods</h2>

        {blockedPeriods.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No blocked periods. You're available for all dates.
          </p>
        ) : (
          <div className="space-y-3">
            {blockedPeriods.map(period => (
              <div
                key={period.id}
                className="flex items-start justify-between p-4 bg-red-50 border border-red-200 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {format(new Date(period.start_date), 'MMM d, yyyy')} - {format(new Date(period.end_date), 'MMM d, yyyy')}
                  </p>
                  {period.reason && (
                    <p className="text-sm text-gray-600 mt-1">
                      Reason: {period.reason}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => deleteBlockedPeriod(period.id)}
                  className="text-red-600 hover:text-red-800 p-1"
                  title="Remove blocked period"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Blocked Period Modal */}
      {showAddModal && (
        <AddBlockedPeriodModal
          workerId={worker?.id || ''}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            loadAvailability()
            setShowAddModal(false)
          }}
        />
      )}

      {/* Custom CSS */}
      <style>{`
        .availability-calendar .blocked-date {
          background-color: #fee2e2;
          border: 2px solid #f87171;
          color: #991b1b;
          font-weight: 600;
        }

        .availability-calendar .react-calendar__tile--active {
          background: #3b82f6;
          color: white;
        }
      `}</style>
    </div>
  )
}
```

#### 2. Create Add Blocked Period Modal

**File**: `apps/web-worker/src/components/availability/AddBlockedPeriodModal.tsx`

```typescript
import { useState } from 'react'
import { X, Calendar, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'

interface AddBlockedPeriodModalProps {
  workerId: string
  onClose: () => void
  onSuccess: () => void
}

export default function AddBlockedPeriodModal({
  workerId,
  onClose,
  onSuccess,
}: AddBlockedPeriodModalProps) {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!startDate || !endDate) {
      setError('Please select both start and end dates')
      return
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError('Start date must be before end date')
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch(`/api/workers/${workerId}/availability`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('worker_token')}`
        },
        body: JSON.stringify({
          start_date: startDate,
          end_date: endDate,
          reason: reason.trim() || null,
        }),
      })

      if (response.ok) {
        onSuccess()
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to block dates')
      }
    } catch (error) {
      console.error('Block dates error:', error)
      setError('Failed to block dates. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Calendar className="w-6 h-6 text-purple-600" />
            Block Out Dates
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date *
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              min={format(new Date(), 'yyyy-MM-dd')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date *
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate || format(new Date(), 'yyyy-MM-dd')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason (Optional)
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Holiday, Personal appointment"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              maxLength={100}
            />
            <p className="text-xs text-gray-500 mt-1">
              Optional reason visible to your manager
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              disabled={submitting}
            >
              {submitting ? 'Blocking...' : 'Block Dates'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
```

### Acceptance Criteria

- [ ] Worker can view their availability calendar
- [ ] Blocked dates show in red on calendar
- [ ] Worker can click "Block Dates" to open modal
- [ ] Modal validates start date < end date
- [ ] Worker can enter optional reason for blocking
- [ ] Blocked periods list shows all existing blocks
- [ ] Worker can delete blocked periods with X button
- [ ] Delete requires confirmation
- [ ] Overlapping dates show error message
- [ ] Success message shows after blocking dates
- [ ] Calendar updates after adding/removing blocks
- [ ] Page is responsive on mobile

### Testing Checklist

- [ ] Open manage availability page
- [ ] Block out a single date
- [ ] Block out a date range (e.g., 1 week)
- [ ] Try to block overlapping dates (should fail)
- [ ] Add reason when blocking dates
- [ ] Delete a blocked period
- [ ] Verify calendar shows blocked dates in red
- [ ] Test on mobile device
- [ ] Verify only worker can manage their own availability

---

## Dependencies

### Existing Code
- Authentication system (WA-002)
- Worker layout and navigation (WA-003)
- Worker model and database
- React Calendar library (install: `react-calendar`)
- Date utilities (`date-fns`)

### New Code Created
- WorkerAvailability database table
- WorkerAvailabilityService backend
- Worker availability API routes
- MySchedule page component
- ManageAvailability page component
- WeekView and MonthView components
- AddBlockedPeriodModal component

---

## Installation Steps

```bash
# Install dependencies
cd apps/web-worker
pnpm add react-calendar date-fns
pnpm add -D @types/react-calendar

# Run database migration
cd packages/database
npx prisma migrate dev --name add_worker_availability

# Generate Prisma client
npx prisma generate
```

---

## Notes

- Workers can only manage their own availability (validated in middleware)
- Blocked dates are soft constraints (managers can override if needed)
- Future enhancement: Email notifications to manager when worker blocks dates
- Future enhancement: Validate blocked dates don't conflict with existing scheduled jobs
- Calendar library provides accessibility out of the box
- Mobile responsiveness is critical for this feature

---

**Document Version**: 1.0
**Last Updated**: 2025-11-05
