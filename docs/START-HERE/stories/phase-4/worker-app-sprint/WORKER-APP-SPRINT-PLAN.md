# Worker App Sprint Plan

**Sprint Name**: Worker Web Application
**Sprint Duration**: 12-15 days
**Total Story Points**: 52 points
**Team Size**: 1 developer
**Sprint Goal**: Build a fully functional worker-facing web application for managing daily cleaning jobs

---

## Sprint Overview

### Objectives
1. Enable workers to view their daily schedule and job assignments
2. Provide complete property information including access codes and navigation
3. Allow workers to start/complete jobs with photo documentation
4. Implement availability management for workers to block out dates
5. Create a responsive, mobile-first interface optimized for field use

### Success Criteria
- Workers can complete full job workflow (start → checklist → photos → complete)
- Workers can view and manage their schedule
- Workers can block out unavailable dates
- Workers can update their profile information
- All features work on mobile devices (iOS Safari, Android Chrome)
- Photo upload success rate > 95%
- Page load time < 3 seconds

---

## Sprint Phases

### Phase 1: Foundation & Authentication (Days 1-2) - 8 points
Setup project structure, authentication, and routing

### Phase 2: Dashboard & Jobs (Days 3-5) - 14 points
Build dashboard, job listing, and job details pages

### Phase 3: Job Workflow (Days 6-8) - 16 points
Implement start/complete job workflow with checklists and photos

### Phase 4: Schedule & Availability (Days 9-11) - 10 points
Build schedule view and availability management

### Phase 5: Profile & Polish (Days 12-15) - 4 points
Worker profile, history, and final polish

---

## Detailed Story Breakdown

### Phase 1: Foundation & Authentication (Days 1-2)

#### **WA-001: Project Setup & Structure** (2 pts)
**Priority**: CRITICAL
**Effort**: 0.5 days

**Description**:
Create new web-worker application with Vite + React + TypeScript

**Acceptance Criteria**:
- [ ] New app created at `apps/web-worker/`
- [ ] Runs on port 5178
- [ ] Uses existing UI components from web-cleaning
- [ ] TypeScript configured with strict mode
- [ ] ESLint and Prettier configured
- [ ] Basic routing setup with React Router
- [ ] Package.json with required dependencies

**Dependencies**: None

**Files to Create**:
- apps/web-worker/package.json
- apps/web-worker/vite.config.ts
- apps/web-worker/tsconfig.json
- apps/web-worker/src/App.tsx
- apps/web-worker/src/main.tsx

**Technical Notes**:
```json
{
  "name": "@rightfit/web-worker",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite --port 5178",
    "build": "tsc && vite build"
  }
}
```

---

#### **WA-002: Worker Authentication** (3 pts)
**Priority**: CRITICAL
**Effort**: 0.75 days

**Description**:
Implement worker login, logout, and auth context

**Acceptance Criteria**:
- [ ] Login page with email/password form
- [ ] POST /api/auth/login with worker credentials
- [ ] Auth context stores worker ID and token
- [ ] Protected routes redirect to login if not authenticated
- [ ] Remember me checkbox saves credentials
- [ ] Logout functionality clears session
- [ ] Auto-redirect on token expiration
- [ ] Password reset flow (forgot password page)

**API Endpoints** (Existing):
- POST /api/auth/login
- POST /api/auth/forgot-password

**Files to Create**:
- apps/web-worker/src/pages/auth/Login.tsx
- apps/web-worker/src/pages/auth/ForgotPassword.tsx
- apps/web-worker/src/lib/auth.ts
- apps/web-worker/src/contexts/AuthContext.tsx

**UI Design**:
- Simple login form
- Large touch-friendly buttons
- Error messages
- Loading state

**Technical Notes**:
```typescript
interface AuthContextType {
  worker: Worker | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
  loading: boolean
}
```

---

#### **WA-003: Layout & Navigation** (3 pts)
**Priority**: HIGH
**Effort**: 0.75 days

**Description**:
Create responsive layout with mobile-first navigation

**Acceptance Criteria**:
- [ ] Header with worker name and logout
- [ ] Bottom navigation bar for mobile (4 tabs)
- [ ] Side navigation for desktop
- [ ] Tabs: Dashboard, Schedule, Jobs, Profile
- [ ] Active tab indicator
- [ ] Responsive breakpoints (320px, 768px, 1024px)
- [ ] Dark mode support (matches system theme)

**Files to Create**:
- apps/web-worker/src/components/layout/Header.tsx
- apps/web-worker/src/components/layout/MobileNav.tsx
- apps/web-worker/src/components/layout/Sidebar.tsx
- apps/web-worker/src/components/layout/Layout.tsx

**UI Components**:
- Header: Worker name, profile photo, logout
- Mobile Nav: 4 icons (Home, Calendar, List, User)
- Sidebar: Expanded menu for desktop

---

### Phase 2: Dashboard & Jobs (Days 3-5)

#### **WA-004: Worker Dashboard** (4 pts)
**Priority**: CRITICAL
**Effort**: 1 day

**Description**:
Build main dashboard showing today's jobs and quick stats

**Acceptance Criteria**:
- [ ] Welcome message: "Good morning, {First Name}"
- [ ] Current date and time display
- [ ] Stats cards:
  - Jobs Today
  - Hours This Week
  - Jobs Completed (total)
- [ ] Today's jobs list (using JobCard component)
- [ ] Quick actions: View Schedule, Manage Availability
- [ ] Loading state while fetching data
- [ ] Error state with retry button
- [ ] Empty state: "No jobs scheduled today"

**API Endpoints**:
- GET /api/workers/:id/jobs/today
- GET /api/workers/:id/stats

**Data Required**:
```typescript
interface WorkerStats {
  jobs_today: number
  jobs_this_week: number
  hours_this_week: number
  jobs_completed: number
}
```

**Files to Create**:
- apps/web-worker/src/pages/dashboard/WorkerDashboard.tsx
- apps/web-worker/src/hooks/useWorker.ts
- apps/web-worker/src/lib/api.ts (worker APIs)

---

#### **WA-005: Job Card Component** (2 pts)
**Priority**: HIGH
**Effort**: 0.5 days

**Description**:
Reusable job card showing job summary

**Acceptance Criteria**:
- [ ] Property name and address (truncated if long)
- [ ] Time window (e.g., "9:00 AM - 11:00 AM")
- [ ] Status badge (color-coded)
- [ ] Navigate button (opens Google Maps with property address)
- [ ] Action button based on status:
  - Not started: "Start Job"
  - In progress: "Continue"
  - Completed: "View Details"
- [ ] Compact mode for list view
- [ ] Expanded mode for dashboard
- [ ] Responsive design

**Props**:
```typescript
interface JobCardProps {
  job: CleaningJob
  onStartJob?: () => void
  onViewDetails?: () => void
  compact?: boolean
}
```

**Files to Create**:
- apps/web-worker/src/components/jobs/JobCard.tsx
- apps/web-worker/src/components/jobs/JobStatusBadge.tsx

**Design**:
- Gradient background based on status
- Large touch targets (min 44px)
- Icons for visual clarity

---

#### **WA-006: Job Details Page** (5 pts)
**Priority**: CRITICAL
**Effort**: 1.25 days

**Description**:
Comprehensive job details page with all property information

**Acceptance Criteria**:
- [ ] **Property Information Section**:
  - Property name, address, postcode
  - Property type, bedrooms, bathrooms
  - Navigate button (Google Maps link)
- [ ] **Access Information Section**:
  - Access instructions
  - Access code (large, copyable)
  - Key location
- [ ] **Additional Property Info**:
  - WiFi SSID and password
  - Parking information
  - Pet information
- [ ] **Job Details Section**:
  - Scheduled date and time
  - Customer name and contact
  - Special requirements
  - Pricing type and quoted price (optional visibility)
- [ ] **Actions**:
  - Start Job button (if not started)
  - View Checklist button
  - Complete Job button (if in progress)
  - Report Issue button
- [ ] Loading state
- [ ] Error handling
- [ ] Breadcrumb navigation

**API Endpoints** (Existing):
- GET /api/cleaning-jobs/:id

**Files to Create**:
- apps/web-worker/src/pages/jobs/JobDetails.tsx

**UI Sections**:
1. Header with back button and job status
2. Property info cards (gradient style)
3. Access info (highlighted, large font)
4. Additional details (collapsible)
5. Action buttons (sticky footer on mobile)

---

#### **WA-007: Job Checklist Component** (3 pts)
**Priority**: CRITICAL
**Effort**: 0.75 days

**Description**:
Interactive checklist for job completion

**Acceptance Criteria**:
- [ ] List of checklist items
- [ ] Checkbox for each item
- [ ] Check/uncheck functionality
- [ ] Progress bar showing % complete
- [ ] "Mark All Complete" button
- [ ] Real-time progress update
- [ ] Save checklist state to backend
- [ ] Cannot complete job without 100% checklist
- [ ] Optimistic UI updates
- [ ] Error handling on save failure

**API Endpoints**:
- PATCH /api/cleaning-jobs/:id (update checklist_items)

**Files to Create**:
- apps/web-worker/src/components/jobs/ChecklistItem.tsx
- apps/web-worker/src/pages/jobs/JobChecklist.tsx

**Data Structure**:
```typescript
interface ChecklistItem {
  id: string
  description: string
  completed: boolean
  order: number
}
```

**UI Design**:
- Large checkboxes (easy to tap)
- Strikethrough on completed items
- Progress bar at top
- Sticky "Save" button

---

### Phase 3: Job Workflow (Days 6-8)

#### **WA-008: Start Job Modal** (3 pts)
**Priority**: CRITICAL
**Effort**: 0.75 days

**Description**:
Modal for starting a job and creating timesheet

**Acceptance Criteria**:
- [ ] Shows job details (property name, time)
- [ ] Confirmation message: "Ready to begin?"
- [ ] Start button creates timesheet
- [ ] Records start time automatically
- [ ] Updates job status to IN_PROGRESS
- [ ] Success toast notification
- [ ] Error handling
- [ ] Loading state during API call
- [ ] Cannot start if already started
- [ ] Cannot start other jobs while one is in progress

**API Endpoints** (Existing):
- POST /api/cleaning-timesheets

**Request Body**:
```typescript
{
  cleaning_job_id: string
  worker_id: string
  start_time: string (ISO datetime)
}
```

**Files to Create**:
- apps/web-worker/src/components/jobs/StartJobModal.tsx

**Workflow**:
1. Worker clicks "Start Job"
2. Modal opens with confirmation
3. Worker clicks "Start Job Now"
4. POST request creates timesheet
5. Job status updates to IN_PROGRESS
6. Modal closes
7. Success toast appears
8. Page refreshes to show "In Progress" status

---

#### **WA-009: Photo Upload Component** (5 pts)
**Priority**: CRITICAL
**Effort**: 1.25 days

**Description**:
Photo capture and upload with compression

**Acceptance Criteria**:
- [ ] Camera integration (mobile)
- [ ] File upload (desktop)
- [ ] Photo categories: Before, After, Issue
- [ ] Multiple photos per category (max 10 each)
- [ ] Photo preview before upload
- [ ] Delete/retake functionality
- [ ] Image compression to < 1MB
- [ ] Upload progress indicator
- [ ] Retry failed uploads
- [ ] Queue photos for upload
- [ ] Show upload success/failure per photo
- [ ] Works offline (queue for later upload)

**API Endpoints** (Existing):
- POST /api/cleaning-timesheets/:id/photos

**Files to Create**:
- apps/web-worker/src/components/jobs/PhotoUpload.tsx
- apps/web-worker/src/lib/imageCompression.ts
- apps/web-worker/src/hooks/usePhotoUpload.ts

**Technical Implementation**:
```typescript
// Use browser-image-compression library
import imageCompression from 'browser-image-compression'

const compressImage = async (file: File) => {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true
  }
  return await imageCompression(file, options)
}
```

**UI Design**:
- Grid of photo thumbnails
- Upload button (camera icon on mobile)
- Progress bar for each photo
- Category tabs: Before | After | Issue
- Delete icon on each thumbnail

---

#### **WA-010: Complete Job Modal** (8 pts)
**Priority**: CRITICAL
**Effort**: 2 days

**Description**:
Complete job workflow with photos and notes

**Acceptance Criteria**:
- [ ] Validate checklist is 100% complete before allowing completion
- [ ] Show modal with form
- [ ] **Work Performed** (required, textarea)
- [ ] **Before Photos** section (optional, min 0)
- [ ] **After Photos** section (required, min 2)
- [ ] **Notes** (optional, textarea)
- [ ] Validate required fields
- [ ] Submit button disabled until valid
- [ ] Upload photos first (with progress)
- [ ] Then complete timesheet
- [ ] Record end time automatically
- [ ] Calculate total hours worked
- [ ] Update job status to COMPLETED
- [ ] Success confirmation
- [ ] Error handling with retry
- [ ] Loading state during submission

**API Endpoints** (Existing):
- POST /api/cleaning-timesheets/:id/photos (multiple calls)
- POST /api/cleaning-timesheets/:id/complete

**Workflow**:
1. Worker clicks "Complete Job"
2. System validates checklist is 100%
3. If not, show error: "Please complete all checklist items first"
4. If complete, show modal
5. Worker fills in work performed
6. Worker uploads before photos (optional)
7. Worker uploads after photos (required, min 2)
8. Worker adds notes (optional)
9. Worker clicks "Complete Job"
10. Photos upload with progress bar
11. Timesheet completes
12. Success message
13. Redirect to dashboard

**Files to Create**:
- apps/web-worker/src/components/jobs/CompleteJobModal.tsx

**Validation Rules**:
- work_performed: Required, min 10 characters
- after_photos: Required, min 2 photos
- before_photos: Optional
- notes: Optional

---

### Phase 4: Schedule & Availability (Days 9-11)

#### **WA-011: My Schedule Page** (5 pts)
**Priority**: HIGH
**Effort**: 1.25 days

**Description**:
Calendar view of assigned jobs

**Acceptance Criteria**:
- [ ] Week view by default
- [ ] Month view option (toggle)
- [ ] Shows all assigned jobs for selected period
- [ ] Color-coded by status:
  - Blue: Scheduled
  - Green: Completed
  - Gray: Cancelled
- [ ] Click job to view details
- [ ] Today indicator (highlighted)
- [ ] Navigation: Previous/Next week/month
- [ ] Current week/month label
- [ ] Loading state
- [ ] Empty state: "No jobs scheduled"
- [ ] Responsive design (mobile/desktop)

**API Endpoints**:
- GET /api/workers/:id/jobs?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD

**Files to Create**:
- apps/web-worker/src/pages/schedule/MySchedule.tsx
- apps/web-worker/src/components/schedule/CalendarView.tsx
- apps/web-worker/src/components/schedule/JobSlot.tsx

**Libraries**:
- Use `date-fns` for date manipulation
- Custom calendar component (avoid heavy libraries)

**UI Design**:
```
┌─────────────────────────────────┐
│ Week of Nov 5 - 11    [< >]     │
├──────┬──────┬──────┬──────┬─────┤
│ Mon  │ Tue  │ Wed  │ Thu  │ Fri │
│  5   │  6   │  7   │  8   │  9  │
├──────┼──────┼──────┼──────┼─────┤
│ 9am  │ 9am  │      │ 10am │ 9am │
│ 🏠   │ 🏠   │      │ 🏠   │ 🏠  │
│      │ 1pm  │      │      │     │
│      │ 🏠   │      │      │     │
└──────┴──────┴──────┴──────┴─────┘
```

---

#### **WA-012: Availability Management Backend** (3 pts)
**Priority**: HIGH
**Effort**: 0.75 days

**Description**:
Backend service and routes for worker availability

**Acceptance Criteria**:
- [ ] Database table: WorkerAvailability created
- [ ] WorkerAvailabilityService.ts created
- [ ] Routes for availability management:
  - GET /api/workers/:id/availability
  - POST /api/workers/:id/availability
  - DELETE /api/workers/:id/availability/:availabilityId
  - GET /api/workers/:id/availability/check?date=YYYY-MM-DD
- [ ] Validation:
  - End date must be after start date
  - Cannot block past dates
  - Cannot conflict with existing jobs (warn only)
- [ ] Return conflicts in response

**Database Schema**:
```prisma
model WorkerAvailability {
  id                  String   @id @default(uuid())
  worker_id           String
  service_provider_id String
  start_date          DateTime
  end_date            DateTime
  reason              String?
  status              WorkerAvailabilityStatus @default(BLOCKED)
  created_at          DateTime @default(now())
  updated_at          DateTime @updatedAt

  worker              Worker @relation(fields: [worker_id], references: [id])
}

enum WorkerAvailabilityStatus {
  BLOCKED
  HOLIDAY
  SICK
}
```

**Files to Create**:
- apps/api/src/services/WorkerAvailabilityService.ts
- apps/api/src/routes/worker-availability.ts
- packages/database/prisma/schema.prisma (add WorkerAvailability model)

**Technical Notes**:
- Check for existing jobs in date range
- Return warning if jobs exist
- Allow manager to override
- Notify manager of new blocks

---

#### **WA-013: Manage Availability Page** (4 pts)
**Priority**: HIGH
**Effort**: 1 day

**Description**:
Frontend page for blocking unavailable dates

**Acceptance Criteria**:
- [ ] Calendar view showing blocked dates (highlighted in red)
- [ ] "Block Dates" button
- [ ] Modal with date range picker
- [ ] Start date and end date selection
- [ ] Reason field (optional)
- [ ] Status dropdown: Blocked, Holiday, Sick Leave
- [ ] Submit button
- [ ] Show existing blocks in list below calendar
- [ ] Delete block button for each entry
- [ ] Confirmation before deleting
- [ ] Warning if jobs exist in selected range
- [ ] Success/error toasts

**API Endpoints**:
- GET /api/workers/:id/availability
- POST /api/workers/:id/availability
- DELETE /api/workers/:id/availability/:id

**Files to Create**:
- apps/web-worker/src/pages/availability/ManageAvailability.tsx
- apps/web-worker/src/components/availability/BlockDatesModal.tsx
- apps/web-worker/src/components/availability/AvailabilityCalendar.tsx

**UI Design**:
```
┌─────────────────────────────────┐
│ My Availability  [Block Dates]  │
├─────────────────────────────────┤
│ November 2025                   │
│                                 │
│  S  M  T  W  T  F  S           │
│     1  2  3  4  5  6           │
│  7  8  9 10 11 12 13           │
│ 14 15 16 17 18 19 20           │
│ 21 22 23 24 25 26 27           │
│ 28 29 30                       │
│                                 │
│ 🔴 = Blocked dates              │
│                                 │
│ Blocked Periods:                │
│ ┌──────────────────────────┐   │
│ │ Nov 10-12 (Holiday)  [x] │   │
│ │ Nov 25-26 (Personal) [x] │   │
│ └──────────────────────────┘   │
└─────────────────────────────────┘
```

**Modal for Blocking**:
```
┌─────────────────────────────────┐
│ Block Unavailable Dates         │
├─────────────────────────────────┤
│ Start Date *                    │
│ [Date Picker: Nov 10, 2025]     │
│                                 │
│ End Date *                      │
│ [Date Picker: Nov 12, 2025]     │
│                                 │
│ Reason (optional)               │
│ [____________Holiday____________]│
│                                 │
│ Status                          │
│ [Holiday ▼]                     │
│                                 │
│ ⚠️ Warning: You have 1 job     │
│    scheduled on Nov 11          │
│                                 │
│ [Cancel]  [Block Dates]         │
└─────────────────────────────────┘
```

---

### Phase 5: Profile & Polish (Days 12-15)

#### **WA-014: Worker Profile Page** (2 pts)
**Priority**: MEDIUM
**Effort**: 0.5 days

**Description**:
View and edit worker profile

**Acceptance Criteria**:
- [ ] Display worker information:
  - Profile photo
  - First name, last name
  - Email, phone
  - Address (optional)
  - Worker type (read-only)
  - Employment type (read-only)
  - Hourly rate (read-only)
- [ ] Edit button opens edit mode
- [ ] Edit fields: First name, last name, phone, address
- [ ] Upload profile photo
- [ ] Save changes button
- [ ] Cancel button
- [ ] Success/error toasts
- [ ] Loading state

**API Endpoints** (Existing):
- GET /api/workers/:id
- PATCH /api/workers/:id
- POST /api/workers/:id/photo

**Files to Create**:
- apps/web-worker/src/pages/profile/MyProfile.tsx
- apps/web-worker/src/pages/profile/EditProfile.tsx

**UI Design**:
- Profile photo at top (large, circular)
- Info cards below
- Edit button in header
- Save/Cancel buttons when editing

---

#### **WA-015: Work History Page** (2 pts)
**Priority**: LOW
**Effort**: 0.5 days

**Description**:
View past completed jobs

**Acceptance Criteria**:
- [ ] List of completed jobs (past 30 days default)
- [ ] Filter by date range
- [ ] Show for each job:
  - Property name
  - Date completed
  - Hours worked
  - Photos (thumbnails)
- [ ] Click to view full job details
- [ ] Pagination (20 jobs per page)
- [ ] Loading state
- [ ] Empty state: "No completed jobs"

**API Endpoints**:
- GET /api/workers/:id/jobs?status=COMPLETED&start_date=YYYY-MM-DD

**Files to Create**:
- apps/web-worker/src/pages/profile/WorkHistory.tsx

**UI Design**:
- Filter bar at top
- List of job cards
- Pagination at bottom
- Scroll to load more (mobile)

---

## Backend Work Summary

### New Backend Services (8 pts)
These are needed to support the Worker App:

#### **WA-BACKEND-001: WorkerAvailabilityService** (3 pts)
- Create WorkerAvailabilityService.ts
- CRUD operations for availability blocks
- Check availability on specific dates
- Find conflicts with existing jobs

#### **WA-BACKEND-002: Worker Availability Routes** (2 pts)
- GET /api/workers/:id/availability
- POST /api/workers/:id/availability
- DELETE /api/workers/:id/availability/:id
- GET /api/workers/:id/availability/check

#### **WA-BACKEND-003: Enhanced Worker Routes** (3 pts)
- GET /api/workers/:id/jobs (with filters)
- GET /api/workers/:id/jobs/today
- GET /api/workers/:id/stats

### Database Migration (Included in WA-012)
- Add WorkerAvailability table
- Add indexes for performance

---

## Story Point Summary

### Phase 1: Foundation (8 pts)
- WA-001: Project Setup (2 pts)
- WA-002: Authentication (3 pts)
- WA-003: Layout & Navigation (3 pts)

### Phase 2: Dashboard & Jobs (14 pts)
- WA-004: Worker Dashboard (4 pts)
- WA-005: Job Card Component (2 pts)
- WA-006: Job Details Page (5 pts)
- WA-007: Job Checklist (3 pts)

### Phase 3: Job Workflow (16 pts)
- WA-008: Start Job Modal (3 pts)
- WA-009: Photo Upload (5 pts)
- WA-010: Complete Job Modal (8 pts)

### Phase 4: Schedule & Availability (10 pts)
- WA-011: My Schedule (5 pts)
- WA-012: Availability Backend (3 pts)
- WA-013: Manage Availability (4 pts)

### Phase 5: Profile & Polish (4 pts)
- WA-014: Worker Profile (2 pts)
- WA-015: Work History (2 pts)

**Total Sprint Points**: 52 points
**Estimated Duration**: 12-15 days (solo developer)

---

## Sprint Schedule

### Week 1 (Days 1-5)
- **Day 1**: WA-001, WA-002 (Setup + Auth)
- **Day 2**: WA-003, Start WA-004 (Layout + Dashboard)
- **Day 3**: Finish WA-004, WA-005 (Dashboard + Job Card)
- **Day 4**: WA-006 (Job Details)
- **Day 5**: WA-007 (Checklist)

### Week 2 (Days 6-10)
- **Day 6**: WA-008 (Start Job Modal)
- **Day 7**: WA-009 (Photo Upload)
- **Day 8**: WA-010 Part 1 (Complete Job Modal - Form)
- **Day 9**: WA-010 Part 2 (Complete Job Modal - Integration)
- **Day 10**: WA-011 (My Schedule)

### Week 3 (Days 11-15)
- **Day 11**: WA-012 (Availability Backend)
- **Day 12**: WA-013 (Manage Availability Frontend)
- **Day 13**: WA-014, WA-015 (Profile + History)
- **Day 14**: Bug fixes, testing
- **Day 15**: Polish, responsive testing, deployment

---

## Testing Plan

### Unit Tests (Throughout Sprint)
- API client functions
- Image compression
- Date/time utilities
- Form validation

### Integration Tests (End of Each Phase)
- Login flow
- Start job → Complete job workflow
- Photo upload
- Availability blocking

### E2E Tests (Final Days)
- Full job completion workflow
- Schedule navigation
- Profile update
- Mobile responsiveness

### Manual Testing Devices
- iPhone (iOS Safari latest)
- Android phone (Chrome latest)
- iPad (tablet view)
- Desktop (Chrome, Firefox, Safari)

---

## Risk Mitigation

### High Risk Items
1. **Photo Upload Failures**
   - Mitigation: Implement retry logic, queue failed uploads
   - Testing: Test on slow 3G network

2. **Workers Not Understanding Workflow**
   - Mitigation: Add tooltips, onboarding tour
   - Testing: User acceptance testing with real workers

3. **Mobile Network Issues**
   - Mitigation: Implement offline mode for viewing jobs
   - Testing: Test in airplane mode

### Medium Risk Items
1. **Calendar Component Complexity**
   - Mitigation: Use simple month/week view, avoid heavy libraries

2. **Image Compression Performance**
   - Mitigation: Use Web Workers for compression

### Low Risk Items
1. **Profile Updates**
   - Standard CRUD operations

2. **Work History**
   - Simple list view with pagination

---

## Definition of Done

For each story to be considered "Done":
- [ ] Code written and tested locally
- [ ] Unit tests written (where applicable)
- [ ] Integration tests passing
- [ ] Works on mobile (iOS Safari, Android Chrome)
- [ ] Works on desktop (Chrome, Firefox)
- [ ] Responsive design verified (320px, 768px, 1024px)
- [ ] Error handling implemented
- [ ] Loading states implemented
- [ ] Success/error toasts shown
- [ ] Code reviewed (self-review minimum)
- [ ] Committed to Git with descriptive message
- [ ] Documented in session summary

---

## Success Metrics (Post-Launch)

### User Metrics
- Login success rate > 90%
- Photo upload success rate > 95%
- Average time to complete job < 5 minutes
- Availability blocking usage > 50% of workers
- Mobile usage > 70% (workers prefer mobile)

### Technical Metrics
- Page load time < 3 seconds
- Photo upload time < 30 seconds
- API response time < 500ms
- Error rate < 1%
- Uptime > 99%

### Business Metrics
- Reduced office calls from workers
- Faster job completion times
- Better photo documentation quality
- Improved schedule compliance
- Fewer scheduling conflicts

---

## Next Steps After Sprint

### Phase 6: Advanced Features (Future)
- Push notifications for job reminders
- GPS check-in verification
- Offline mode with full sync
- Earnings dashboard
- Chat with manager
- Training materials

### Phase 7: Mobile Native App (Future)
- React Native app for iOS/Android
- Better camera integration
- Push notifications
- Offline-first architecture
- Background sync

---

**Document Version**: 1.0
**Last Updated**: 2025-11-05
**Ready for Implementation**: YES
