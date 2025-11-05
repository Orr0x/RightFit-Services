# Worker App - Technical Specification

**Date**: 2025-11-05
**Version**: 1.0
**Status**: Planning Phase

---

## Architecture Overview

### Application Structure
```
apps/web-worker/                    # Port 5178
├── src/
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── Login.tsx
│   │   │   └── ForgotPassword.tsx
│   │   ├── dashboard/
│   │   │   └── WorkerDashboard.tsx
│   │   ├── jobs/
│   │   │   ├── TodaysJobs.tsx
│   │   │   ├── JobDetails.tsx
│   │   │   ├── JobChecklist.tsx
│   │   │   └── StartJobModal.tsx
│   │   │   └── CompleteJobModal.tsx
│   │   ├── schedule/
│   │   │   ├── MySchedule.tsx
│   │   │   └── WeekView.tsx
│   │   ├── availability/
│   │   │   ├── ManageAvailability.tsx
│   │   │   └── BlockDatesModal.tsx
│   │   ├── profile/
│   │   │   ├── MyProfile.tsx
│   │   │   ├── EditProfile.tsx
│   │   │   └── WorkHistory.tsx
│   │   └── Layout.tsx
│   ├── components/
│   │   ├── ui/              # Shared UI components
│   │   ├── jobs/
│   │   │   ├── JobCard.tsx
│   │   │   ├── JobStatusBadge.tsx
│   │   │   ├── ChecklistItem.tsx
│   │   │   └── PhotoUpload.tsx
│   │   ├── schedule/
│   │   │   ├── CalendarView.tsx
│   │   │   └── JobSlot.tsx
│   │   └── layout/
│   │       ├── Header.tsx
│   │       ├── Navigation.tsx
│   │       └── MobileNav.tsx
│   ├── lib/
│   │   ├── api.ts          # API client
│   │   ├── auth.ts         # Auth context
│   │   └── imageCompression.ts
│   ├── hooks/
│   │   ├── useWorker.ts
│   │   ├── useJobs.ts
│   │   └── usePhotoUpload.ts
│   ├── types/
│   │   └── worker.ts
│   └── App.tsx
├── package.json
└── vite.config.ts
```

---

## Database Schema

### Existing Tables (No Changes)
- Worker
- CleaningJob
- CleaningJobTimesheet
- Customer
- CustomerProperty

### New Table: WorkerAvailability

```prisma
model WorkerAvailability {
  id                String   @id @default(uuid())
  worker_id         String
  service_provider_id String
  start_date        DateTime
  end_date          DateTime
  reason            String?  @db.Text
  status            WorkerAvailabilityStatus @default(BLOCKED)
  created_at        DateTime @default(now())
  updated_at        DateTime @updatedAt

  worker            Worker   @relation(fields: [worker_id], references: [id], onDelete: Cascade)
  service_provider  ServiceProvider @relation(fields: [service_provider_id], references: [id], onDelete: Cascade)

  @@index([worker_id])
  @@index([service_provider_id])
  @@index([start_date, end_date])
}

enum WorkerAvailabilityStatus {
  BLOCKED      // Worker not available
  HOLIDAY      // Paid holiday
  SICK         // Sick leave
  REQUESTED    // Availability request pending approval
}
```

---

## Backend API Specification

### New Backend Service: WorkerAvailabilityService

**File**: `apps/api/src/services/WorkerAvailabilityService.ts`

```typescript
class WorkerAvailabilityService {
  // Get worker's availability blocks
  async getWorkerAvailability(
    workerId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<WorkerAvailability[]>

  // Create availability block
  async createAvailabilityBlock(data: {
    worker_id: string
    service_provider_id: string
    start_date: Date
    end_date: Date
    reason?: string
    status: WorkerAvailabilityStatus
  }): Promise<WorkerAvailability>

  // Update availability block
  async updateAvailabilityBlock(
    id: string,
    data: Partial<WorkerAvailability>
  ): Promise<WorkerAvailability>

  // Delete availability block
  async deleteAvailabilityBlock(id: string): Promise<void>

  // Check if worker is available on date
  async isWorkerAvailable(
    workerId: string,
    date: Date
  ): Promise<boolean>

  // Get conflicting availability blocks
  async getConflictingBlocks(
    workerId: string,
    startDate: Date,
    endDate: Date
  ): Promise<WorkerAvailability[]>
}
```

### New Backend Routes

**File**: `apps/api/src/routes/worker-availability.ts`

```typescript
// Get worker availability
GET /api/workers/:workerId/availability
Query params:
  - start_date (optional)
  - end_date (optional)

// Create availability block
POST /api/workers/:workerId/availability
Body: {
  start_date: string (ISO date)
  end_date: string (ISO date)
  reason?: string
  status: 'BLOCKED' | 'HOLIDAY' | 'SICK'
}

// Update availability block
PATCH /api/workers/:workerId/availability/:id
Body: {
  start_date?: string
  end_date?: string
  reason?: string
  status?: string
}

// Delete availability block
DELETE /api/workers/:workerId/availability/:id

// Check availability
GET /api/workers/:workerId/availability/check?date=YYYY-MM-DD
Response: { available: boolean }
```

### Enhanced Worker Routes

**File**: `apps/api/src/routes/workers.ts` (Add new endpoints)

```typescript
// Get worker's assigned jobs (filtered)
GET /api/workers/:workerId/jobs
Query params:
  - date (optional) - Filter by specific date
  - status (optional) - Filter by job status
  - start_date (optional) - Date range start
  - end_date (optional) - Date range end

// Get worker's today's jobs
GET /api/workers/:workerId/jobs/today

// Get worker dashboard stats
GET /api/workers/:workerId/stats
Response: {
  jobs_today: number
  jobs_this_week: number
  hours_this_week: number
  jobs_completed: number
}
```

---

## Frontend Technical Specifications

### Authentication

#### Login Flow
1. Worker enters email and password
2. POST /api/auth/login with credentials
3. Store worker ID and token in localStorage
4. Redirect to dashboard
5. Auto-redirect to login if token expired

#### AuthContext
```typescript
interface AuthContextType {
  worker: Worker | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
  loading: boolean
}
```

### API Client

**File**: `apps/web-worker/src/lib/api.ts`

```typescript
// API configuration
const API_BASE_URL = 'http://localhost:3001/api'

// Workers API
export const workersAPI = {
  getProfile: (workerId: string) =>
    fetch(`${API_BASE_URL}/workers/${workerId}`),

  updateProfile: (workerId: string, data: Partial<Worker>) =>
    fetch(`${API_BASE_URL}/workers/${workerId}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    }),

  uploadPhoto: (workerId: string, photo: File) => {
    const formData = new FormData()
    formData.append('photo', photo)
    return fetch(`${API_BASE_URL}/workers/${workerId}/photo`, {
      method: 'POST',
      body: formData
    })
  },

  getJobs: (workerId: string, params?: {
    date?: string
    status?: string
    start_date?: string
    end_date?: string
  }) => fetch(`${API_BASE_URL}/workers/${workerId}/jobs?${new URLSearchParams(params)}`),

  getTodaysJobs: (workerId: string) =>
    fetch(`${API_BASE_URL}/workers/${workerId}/jobs/today`),

  getStats: (workerId: string) =>
    fetch(`${API_BASE_URL}/workers/${workerId}/stats`)
}

// Jobs API
export const jobsAPI = {
  getJob: (jobId: string) =>
    fetch(`${API_BASE_URL}/cleaning-jobs/${jobId}`),

  updateChecklist: (jobId: string, checklist: any) =>
    fetch(`${API_BASE_URL}/cleaning-jobs/${jobId}`, {
      method: 'PATCH',
      body: JSON.stringify({ checklist_items: checklist })
    })
}

// Timesheet API
export const timesheetAPI = {
  startJob: (jobId: string, workerId: string) =>
    fetch(`${API_BASE_URL}/cleaning-timesheets`, {
      method: 'POST',
      body: JSON.stringify({
        cleaning_job_id: jobId,
        worker_id: workerId,
        start_time: new Date().toISOString()
      })
    }),

  completeJob: (timesheetId: string, data: {
    work_performed: string
    notes?: string
  }) =>
    fetch(`${API_BASE_URL}/cleaning-timesheets/${timesheetId}/complete`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  uploadPhotos: (timesheetId: string, photos: File[]) => {
    const formData = new FormData()
    photos.forEach((photo, index) => {
      formData.append(`photo_${index}`, photo)
    })
    return fetch(`${API_BASE_URL}/cleaning-timesheets/${timesheetId}/photos`, {
      method: 'POST',
      body: formData
    })
  }
}

// Availability API
export const availabilityAPI = {
  getAvailability: (workerId: string, params?: {
    start_date?: string
    end_date?: string
  }) =>
    fetch(`${API_BASE_URL}/workers/${workerId}/availability?${new URLSearchParams(params)}`),

  blockDates: (workerId: string, data: {
    start_date: string
    end_date: string
    reason?: string
    status: string
  }) =>
    fetch(`${API_BASE_URL}/workers/${workerId}/availability`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  unblockDates: (workerId: string, availabilityId: string) =>
    fetch(`${API_BASE_URL}/workers/${workerId}/availability/${availabilityId}`, {
      method: 'DELETE'
    }),

  checkAvailability: (workerId: string, date: string) =>
    fetch(`${API_BASE_URL}/workers/${workerId}/availability/check?date=${date}`)
}
```

### Image Compression

**File**: `apps/web-worker/src/lib/imageCompression.ts`

```typescript
/**
 * Compress image before upload
 * Target: < 1MB per image
 */
export async function compressImage(
  file: File,
  maxSizeMB: number = 1,
  maxWidthOrHeight: number = 1920
): Promise<File> {
  // Use browser-image-compression library
  // Or implement custom canvas-based compression
}
```

---

## Component Specifications

### 1. WorkerDashboard

**Purpose**: Main landing page showing today's jobs and quick stats

**Data Sources**:
- GET /api/workers/:id/jobs/today
- GET /api/workers/:id/stats

**UI Elements**:
- Welcome message: "Good morning, {First Name}"
- Today's date
- Stats cards:
  - Jobs Today (number)
  - Hours This Week (number)
  - Jobs Completed (total)
- Today's Jobs list (JobCard components)
- Quick actions:
  - View Full Schedule
  - Manage Availability
  - View Profile

**State**:
```typescript
interface DashboardState {
  todaysJobs: CleaningJob[]
  stats: WorkerStats
  loading: boolean
  error: string | null
}
```

### 2. JobCard

**Purpose**: Display summary of a single job

**Props**:
```typescript
interface JobCardProps {
  job: CleaningJob
  onStartJob?: () => void
  onViewDetails?: () => void
  compact?: boolean  // For list view
}
```

**UI Elements**:
- Property name and address
- Time window (e.g., "9:00 AM - 11:00 AM")
- Status badge
- Navigate button (opens Google Maps)
- Action button:
  - "Start Job" (if not started)
  - "Continue" (if in progress)
  - "View Details" (if completed)

### 3. JobDetails

**Purpose**: Full job information page

**Data Sources**:
- GET /api/cleaning-jobs/:id

**Sections**:
1. Property Information
   - Name, address, postcode
   - Property type, bedrooms, bathrooms
   - Navigation button
2. Access Information
   - Access instructions
   - Access code
   - WiFi credentials
   - Parking info
3. Job Details
   - Schedule date and time
   - Customer name and contact
   - Special requirements
   - Pricing (if visible to worker)
4. Checklist
   - View/update checklist items
   - Progress indicator
5. Actions
   - Start Job
   - Complete Job
   - Report Issue

### 4. StartJobModal

**Purpose**: Confirm job start and create timesheet

**Workflow**:
1. Show modal with job details
2. Worker confirms start
3. POST /api/cleaning-timesheets
4. Update job status to IN_PROGRESS
5. Close modal and return to dashboard

**UI**:
```
┌─────────────────────────────┐
│  Start Job                  │
├─────────────────────────────┤
│  Property: Lodge 7          │
│  Time: 9:00 AM              │
│                             │
│  Ready to begin this job?   │
│                             │
│  [Cancel]  [Start Job Now]  │
└─────────────────────────────┘
```

### 5. CompleteJobModal

**Purpose**: Complete job with photos and notes

**Workflow**:
1. Validate checklist is 100% complete
2. Show modal with form
3. Worker enters work performed
4. Worker uploads before/after photos
5. Worker adds optional notes
6. POST /api/cleaning-timesheets/:id/complete
7. Upload photos: POST /api/cleaning-timesheets/:id/photos
8. Update job status to COMPLETED
9. Show success message
10. Return to dashboard

**UI**:
```
┌─────────────────────────────┐
│  Complete Job               │
├─────────────────────────────┤
│  Work Performed *           │
│  ┌─────────────────────┐    │
│  │                     │    │
│  └─────────────────────┘    │
│                             │
│  Before Photos              │
│  [Upload] [📷] [📷]         │
│                             │
│  After Photos               │
│  [Upload] [📷] [📷] [📷]    │
│                             │
│  Notes (optional)           │
│  ┌─────────────────────┐    │
│  │                     │    │
│  └─────────────────────┘    │
│                             │
│  [Cancel]  [Complete Job]   │
└─────────────────────────────┘
```

### 6. MySchedule (Calendar View)

**Purpose**: View upcoming jobs in calendar format

**Data Sources**:
- GET /api/workers/:id/jobs (with date range)

**Views**:
- Week view (default)
- Month view (optional)

**Features**:
- Color-coded by status
- Click job to view details
- Today indicator
- Navigation: Previous/Next week/month

**UI Elements**:
```
Week of Nov 5 - Nov 11, 2025        [< Prev]  [Next >]

Mon  Tue  Wed  Thu  Fri  Sat  Sun
 5    6    7    8    9   10   11
┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐
│🏠│ │🏠│ │  │ │🏠│ │🏠│ │  │ │  │
│9am│ │9am│ │  │ │10│ │9am│ │  │ │  │
└──┘ └──┘ └──┘ └──┘ └──┘ └──┘ └──┘
 2    2    0    1    2    0    0
jobs jobs      job  jobs
```

### 7. ManageAvailability

**Purpose**: Block out unavailable dates

**Data Sources**:
- GET /api/workers/:id/availability
- POST /api/workers/:id/availability (create block)
- DELETE /api/workers/:id/availability/:id (remove block)

**UI Elements**:
- Calendar view showing blocked dates
- "Block Dates" button
- List of existing blocks with delete option
- Date range picker in modal

**Workflow**:
1. Worker clicks "Block Dates"
2. Modal opens with date range picker
3. Worker selects start and end date
4. Worker enters reason (optional)
5. Worker selects status (Blocked/Holiday/Sick)
6. Worker clicks "Confirm"
7. POST request creates block
8. Calendar updates to show blocked dates
9. Manager receives notification (future)

---

## Responsive Design Breakpoints

```css
/* Mobile (default) */
@media (min-width: 320px) {
  --font-size-base: 16px;
  --spacing-base: 8px;
  --button-height: 48px;
}

/* Tablet */
@media (min-width: 768px) {
  --font-size-base: 18px;
  --spacing-base: 12px;
}

/* Desktop */
@media (min-width: 1024px) {
  --font-size-base: 16px;
  --spacing-base: 16px;
}
```

### Mobile Navigation
- Bottom navigation bar (fixed)
- 4 main tabs: Dashboard, Schedule, Jobs, Profile
- Hamburger menu for secondary actions

### Desktop Navigation
- Left sidebar navigation
- Expanded menu items with labels
- User profile in header

---

## Performance Optimizations

### Image Optimization
- Compress images to < 1MB before upload
- Use progressive JPEG or WebP format
- Lazy load images in job history
- Cache property photos

### Data Caching
- Cache today's jobs for 5 minutes
- Cache property details for 1 hour
- Cache worker profile for session duration
- Invalidate cache on job status change

### Code Splitting
- Lazy load routes:
  - `/schedule` (calendar libraries)
  - `/availability` (date picker libraries)
  - `/history` (photo galleries)

---

## Security Considerations

### Authentication
- JWT tokens with 24-hour expiration
- Refresh token for extended sessions
- Automatic logout on token expiration
- Secure password requirements

### Authorization
- Workers can only view their own jobs
- Workers can only edit their own profile
- Workers cannot see other workers' schedules
- Workers cannot delete timesheets

### Data Privacy
- Worker can only see assigned properties
- Customer phone numbers masked (optional)
- Payment information hidden from workers
- Photos are worker-specific (not shared)

---

## Testing Strategy

### Unit Tests
- API client functions
- Image compression utility
- Date/time formatting
- Checklist completion logic

### Integration Tests
- Login flow
- Start job workflow
- Complete job workflow
- Photo upload
- Availability blocking

### E2E Tests
- Full job completion workflow
- Schedule view and navigation
- Profile update
- Availability management

### Mobile Testing
- iOS Safari (latest 2 versions)
- Android Chrome (latest 2 versions)
- Tablet landscape/portrait
- Touch gestures

---

## Deployment Configuration

### Environment Variables
```
VITE_API_BASE_URL=http://localhost:3001/api
VITE_GOOGLE_MAPS_KEY=<api_key>
VITE_MAX_PHOTO_SIZE_MB=10
VITE_IMAGE_COMPRESSION_QUALITY=0.8
```

### Build Configuration
```json
{
  "scripts": {
    "dev": "vite --port 5178",
    "build": "tsc && vite build",
    "preview": "vite preview --port 5178"
  }
}
```

### Docker (Future)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 5178
CMD ["npm", "run", "preview"]
```

---

## Dependencies

### Required NPM Packages
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.16.0",
    "date-fns": "^2.30.0",
    "browser-image-compression": "^2.0.2",
    "@mui/icons-material": "^5.14.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "typescript": "^5.0.0",
    "vite": "^4.4.0"
  }
}
```

---

## Metrics and Monitoring

### Key Metrics to Track
- Photo upload success rate
- Average time to complete job
- Login success rate
- API response times
- Mobile vs desktop usage

### Error Tracking
- Failed photo uploads (retry mechanism)
- API errors (show user-friendly messages)
- Authentication failures (redirect to login)
- Network timeouts (offline mode indicator)

---

**Document Version**: 1.0
**Last Updated**: 2025-11-05
**Next Review**: After Sprint Planning
