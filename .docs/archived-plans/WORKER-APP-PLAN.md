# Worker Web App: Mobile-First Interface for Field Workers

**Created**: 2025-11-03
**Status**: PLANNING

---

## 🎯 Purpose

A dedicated mobile-first web application for cleaning and maintenance workers to:
- View assigned jobs
- Enter timesheets
- Upload photos
- Complete checklists
- View property access information

---

## 👥 User Personas

### Primary User: Field Worker (Cleaner or Maintenance Technician)
**Needs**:
- Simple, mobile-friendly interface
- Quick job completion workflow
- Easy photo upload
- Checklist tracking
- Property access codes

**Does NOT Need**:
- Business analytics
- Customer management
- Invoice generation
- Contract management
- Quote creation

---

## 🏗️ Architecture

### New Application
**Path**: `apps/web-worker`
**Port**: 5183 (next available)
**Tech Stack**: Same as other apps (React + Vite + MUI)

### App Structure
```
RightFit Platform Web Apps:
├── web-landlord (5173) - Original landlord app
├── web-cleaning (5174) - Cleaning business management
├── web-maintenance (5175) - Maintenance business management
├── web-customer (5176) - Customer portal
├── guest-tablet (5177) - Guest AI dashboard
└── web-worker (5183) - Worker field app ⭐ NEW
```

---

## 📱 Key Features

### 1. Job Dashboard
**Purpose**: View assigned jobs for today and upcoming

**Features**:
- Today's jobs (priority)
- Upcoming jobs (next 7 days)
- Job cards show:
  - Property name and address
  - Scheduled time
  - Job type (cleaning or maintenance)
  - Status (scheduled, in progress)
  - Customer name

**Mobile Optimization**:
- Large tap targets
- Swipe-able job cards
- Pull to refresh

### 2. Job Details View
**Purpose**: See all information needed to complete a job

**Features**:
- Property details:
  - Address with map link
  - Access codes
  - Special instructions
  - Customer contact info (if needed)
- Job requirements:
  - Scheduled time window
  - Estimated duration
  - Checklist template
  - Any special notes

**Actions**:
- Start Job button
- View checklist
- Call customer
- Navigate to property (map link)

### 3. Job Execution Workflow

#### For Cleaning Jobs:
```
Start Job → Photo Capture → Work → Checklist → Final Photos → Complete
   ↓              ↓           ↓         ↓            ↓            ↓
Clock in    Before pics   Perform    Check off   After pics   Enter time
                         cleaning     items                   Submit
```

**Steps**:
1. **Start Job**: Clock in, auto-records start time
2. **Before Photos**: Take/upload before photos
3. **Checklist**: Interactive checklist with checkboxes
4. **During Work**: Can add notes, take issue photos
5. **After Photos**: Take/upload after photos
6. **Complete**: Review total time, submit

#### For Maintenance Jobs:
```
Start Job → Photo Capture → Work → Progress Notes → Photos → Complete
   ↓              ↓           ↓          ↓             ↓         ↓
Clock in     Issue pics   Perform     Describe    Before/After Submit
                          repair      work done     pics      + time
```

### 4. Timesheet Entry
**Purpose**: Track time worked accurately

**Features**:
- Auto clock-in when job started
- Manual time adjustment if needed
- Break tracking (optional)
- Total hours calculation
- Notes field for work performed

**Mobile UX**:
- Large time display
- Simple +/- buttons for adjustment
- Quick "Lunch Break" button
- Auto-save draft

### 5. Photo Upload
**Purpose**: Document work with before/after photos

**Features**:
- Camera integration (use device camera)
- Photo categories:
  - Before
  - After
  - Issues found
  - Work in progress
- Thumbnail previews
- Delete/retake option
- Compress images for upload

**Mobile Optimization**:
- Direct camera access
- Photo grid view
- Swipe to delete
- Works offline (uploads when online)

### 6. Checklist Completion
**Purpose**: Ensure all tasks completed

**Features**:
- Property-specific checklist
- Interactive checkboxes
- Progress bar (X of Y completed)
- Add custom items
- Mark items as N/A if not applicable
- Notes per checklist item

**UX**:
- Large checkboxes (easy to tap)
- Grouped by room/area
- Expand/collapse sections
- Visual progress indicator

### 7. Schedule View
**Purpose**: See upcoming week of work

**Features**:
- Calendar view (day/week toggle)
- Color-coded by job type
- Tap job to view details
- Filter by status
- Sync with phone calendar (optional)

---

## 🔐 Authentication & Authorization

### Worker Login
**Route**: `/login`
**Fields**:
- Email
- Password

**Session**:
- JWT token stored in localStorage
- Auto-logout after 24 hours
- Remember me option

### Worker Profile
**Access**:
- View own profile
- View assigned jobs only
- Cannot see other workers
- Cannot see business analytics
- Cannot manage contracts/customers

---

## 🎨 UI/UX Design Principles

### 1. Mobile-First
- Designed for phones primarily
- Large touch targets (minimum 44px)
- Bottom navigation for key actions
- Thumb-friendly controls

### 2. Simple & Clean
- Minimal text
- Clear hierarchy
- One task per screen
- Big buttons

### 3. Offline-Capable
- Cache job details
- Store photos locally
- Sync when online
- Show offline indicator

### 4. Fast
- Quick load times
- Instant feedback
- Progress indicators
- Optimistic UI updates

---

## 📊 Data Flow

### Worker Authentication
```
Worker → Login → API → Verify Worker → Return Token → Access Jobs
```

### Job Assignment
```
Business (Cleaning/Maintenance) → Assign Worker → Worker sees in dashboard
```

### Job Completion
```
Worker → Complete Job Form → Upload Photos → Submit Timesheet → API → Update DB
                                                                  ↓
                                                      Notify Business
                                                      Update Job Status
                                                      Store Timesheet
```

### Three-Way Information Sharing
```
Customer ← Business ← Worker
   ↓         ↓          ↓
View       Manage    Perform
progress   assign    work
photos     review    photos
request    approve   notes
```

---

## 🛠️ Technical Implementation

### Routes
```typescript
/login - Worker login
/dashboard - Today's jobs
/jobs/:id - Job details
/jobs/:id/start - Start job workflow
/jobs/:id/complete - Complete job form
/schedule - Calendar view
/profile - Worker profile
```

### API Endpoints (Reuse Existing)
```
GET  /api/workers/:id - Get worker details
GET  /api/workers/:id/jobs - Get assigned jobs
POST /api/cleaning-jobs/:id/start - Start cleaning job
POST /api/cleaning-jobs/:id/complete - Complete with timesheet
POST /api/maintenance-jobs/:id/start - Start maintenance job
POST /api/maintenance-jobs/:id/complete - Complete with timesheet
POST /api/photos - Upload photos
```

### State Management
- React Context for auth
- Local state for job workflow
- IndexedDB for offline storage
- Service Worker for caching

---

## 📋 Implementation Phases

### Phase 1: Core Worker App (Week 1)
- [ ] Create `apps/web-worker` structure
- [ ] Worker authentication
- [ ] Job dashboard (list view)
- [ ] Job details view
- [ ] Basic navigation

### Phase 2: Job Execution (Week 2)
- [ ] Start job workflow
- [ ] Photo upload component
- [ ] Checklist component
- [ ] Timesheet entry
- [ ] Complete job form

### Phase 3: Enhanced Features (Week 3)
- [ ] Calendar/schedule view
- [ ] Offline support
- [ ] Push notifications
- [ ] Profile management
- [ ] Job history

### Phase 4: Polish & Optimization (Week 4)
- [ ] Performance optimization
- [ ] Mobile responsiveness testing
- [ ] Camera integration
- [ ] PWA features (installable)
- [ ] Cross-browser testing

---

## 🔄 Integration with Existing Apps

### Cleaning Business App
- Assigns workers to cleaning jobs
- Views worker timesheets
- Sees worker-uploaded photos
- Monitors job completion

### Maintenance Business App
- Assigns workers to maintenance jobs
- Reviews worker completion notes
- Approves time worked
- Views before/after photos

### Customer Portal
- Sees worker assigned to their job
- Views worker-uploaded photos
- Sees completion status
- Can rate worker (after completion)

---

## 📱 Mobile PWA Features

### Install Prompt
- Add to home screen
- App icon
- Splash screen
- Standalone mode (no browser chrome)

### Push Notifications
- New job assigned
- Job starting soon (30min reminder)
- Message from business
- Schedule changes

### Offline Mode
- Cache today's jobs
- Store photos locally
- Sync when back online
- Offline indicator

---

## 🎯 Success Metrics

**User Experience**:
- Job completion time < 2 minutes (for form submission)
- Photo upload success rate > 95%
- App load time < 2 seconds
- Zero data loss (offline sync)

**Business Value**:
- Worker adoption rate > 80%
- Time tracking accuracy improved
- Photo documentation rate = 100%
- Reduced administrative overhead

---

## 🚀 Deployment Strategy

### Development
- Run on port 5183
- Use dev API (localhost:3001)
- Hot reload enabled

### Production
- Deploy as separate app
- PWA with service worker
- Mobile-optimized
- Fast CDN delivery

---

## 📝 Notes

**Priorities**:
1. Simple, intuitive UX
2. Fast performance on mobile networks
3. Offline capability
4. Photo upload reliability
5. Accurate time tracking

**Future Enhancements**:
- Voice notes for work description
- Barcode scanning for materials/parts
- Integration with worker payroll
- Worker-to-worker messaging
- Team coordination features

---

**Status**: ✅ **REQUIREMENTS DOCUMENTED - READY TO BUILD**

*Plan created: 2025-11-03*
*To be implemented after cleaning contract workflow Phase 1*
