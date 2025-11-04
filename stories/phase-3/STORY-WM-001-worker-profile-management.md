# STORY-WM-001: Worker Profile Management System

**Epic:** Worker Management
**Status:** 🔨 In Progress (Frontend Complete, Backend Pending)
**Points:** 8
**Priority:** High
**Created:** 2025-11-04

---

## 📋 Overview

Comprehensive worker profile system allowing service providers to manage worker information, upload photos, store certificates, track availability, and view work schedules.

---

## 🎯 User Stories

### WM-001.1: Worker Detail Page (✅ COMPLETE)
**As a** service provider
**I want to** view detailed information about a worker in a comprehensive profile page
**So that** I can access all worker information and manage their profile in one place

**Acceptance Criteria:**
- ✅ Worker details page displays full worker information
- ✅ Photo upload section with preview
- ✅ 4-tab interface: Overview, Schedule, Certificates, Availability
- ✅ Performance statistics (hourly rate, jobs completed, upcoming jobs, rating)
- ✅ Navigation from Workers list and Calendar worker cards
- ✅ Responsive design for mobile/tablet/desktop

**Files Created:**
- ✅ [WorkerDetails.tsx](apps/web-cleaning/src/pages/WorkerDetails.tsx)

**Routes Added:**
- ✅ `/workers/:id` - Worker detail page

---

### WM-001.2: Worker Photo Upload (⏭️ BACKEND NEEDED)
**As a** service provider
**I want to** upload and display worker photos
**So that** I can easily identify workers and maintain professional profiles

**Acceptance Criteria:**
- ✅ Photo upload UI with drag & drop
- ✅ Image preview before save
- ✅ Photo display in worker profile header
- ❌ **PENDING**: Backend API endpoint for photo storage
- ❌ **PENDING**: Photo storage in database
- ❌ **PENDING**: File storage in server uploads directory
- ❌ **PENDING**: Photo persistence across page refreshes

**Current Status:**
- Frontend complete with local preview (base64 data URL)
- Photo lost on page refresh (needs backend)

**API Endpoints Needed:**
```typescript
POST   /api/workers/:id/photo        # Upload worker photo
GET    /api/workers/:id/photo        # Get worker photo URL
DELETE /api/workers/:id/photo        # Delete worker photo
```

**Database Schema Needed:**
```prisma
model Worker {
  // ... existing fields
  photo_url  String?  @db.Text
}
```

**Backend Implementation Required:**
1. Create photo upload endpoint using existing PhotosService pattern
2. Store files in `apps/api/uploads/tenants/{tenant_id}/workers/{worker_id}/photo.{ext}`
3. Save photo_url in Worker table
4. Add photo migration to Prisma schema

---

### WM-001.3: Worker Certificate Management (⏭️ BACKEND NEEDED)
**As a** service provider
**I want to** upload and store worker certificates, licenses, and training documents
**So that** I can maintain compliance and verify worker qualifications

**Acceptance Criteria:**
- ✅ Certificate upload UI (PDF, JPG, JPEG, PNG)
- ✅ Certificate list display with upload dates
- ✅ View certificate functionality (opens in new tab)
- ✅ Delete certificate with confirmation
- ❌ **PENDING**: Backend API endpoints for certificate CRUD
- ❌ **PENDING**: Database storage for certificates
- ❌ **PENDING**: File storage for certificate files
- ❌ **PENDING**: Certificate expiry date tracking
- ❌ **PENDING**: Expiry notifications/warnings

**Current Status:**
- Frontend complete with local blob URLs
- Certificates lost on page refresh (needs backend)

**API Endpoints Needed:**
```typescript
POST   /api/workers/:id/certificates            # Upload certificate
GET    /api/workers/:id/certificates            # List worker certificates
GET    /api/workers/:id/certificates/:certId    # Get certificate details
DELETE /api/workers/:id/certificates/:certId    # Delete certificate
PUT    /api/workers/:id/certificates/:certId    # Update certificate (add expiry date)
```

**Database Schema Needed:**
```prisma
model WorkerCertificate {
  id              String    @id @default(uuid())
  worker_id       String
  worker          Worker    @relation(fields: [worker_id], references: [id], onDelete: Cascade)

  name            String                    // Certificate name/title
  file_url        String    @db.Text        // S3 or local file URL
  file_type       String                    // pdf, jpg, png
  file_size       Int                       // bytes

  expiry_date     DateTime?                 // Optional expiration date
  uploaded_at     DateTime  @default(now())
  updated_at      DateTime  @updatedAt

  @@index([worker_id])
  @@index([expiry_date])  // For finding expiring certificates
}

model Worker {
  // ... existing fields
  photo_url      String?              @db.Text
  certificates   WorkerCertificate[]
}
```

**Backend Implementation Required:**
1. Create WorkerCertificate table in Prisma schema
2. Create WorkerCertificatesService with CRUD operations
3. Create API routes for certificate management
4. Implement file upload using multipart/form-data
5. Store files in `apps/api/uploads/tenants/{tenant_id}/workers/{worker_id}/certificates/`
6. Add certificate expiry checking endpoint
7. (Future) Add notification system for expiring certificates

---

### WM-001.4: Worker Schedule View (✅ COMPLETE)
**As a** service provider
**I want to** view a worker's upcoming and completed jobs
**So that** I can track their workload and performance

**Acceptance Criteria:**
- ✅ Display upcoming jobs in chronological order
- ✅ Display recently completed jobs
- ✅ Job cards show property, date, time, and status
- ✅ Click job card to view job details
- ✅ Empty state when no jobs scheduled
- ✅ Status badges with color coding

**Implementation:**
- Schedule tab in WorkerDetails page
- Loads jobs filtered by `assigned_worker_id`
- Displays job information with navigation to job details

---

### WM-001.5: Worker Availability Calendar (⏭️ FUTURE)
**As a** service provider
**I want to** set worker availability dates and time-off
**So that** I can schedule jobs only when workers are available

**Acceptance Criteria:**
- ❌ Calendar view of worker availability
- ❌ Mark dates as available/unavailable
- ❌ Block out vacation time
- ❌ Set recurring availability patterns (e.g., Mon-Fri only)
- ❌ Integration with job scheduling system
- ❌ Conflict warnings when scheduling during unavailable times

**Current Status:**
- Placeholder UI in Availability tab
- Requires calendar component and backend API

**Implementation Notes:**
- Consider using existing calendar view patterns from PropertyCalendar
- May require new `WorkerAvailability` table
- Should integrate with scheduling system to prevent conflicts

---

## 🏗️ Technical Architecture

### Current Frontend Implementation

**Component Structure:**
```typescript
WorkerDetails.tsx
├── Header Section
│   ├── Photo Upload (120x120px)
│   ├── Worker Name & Email
│   ├── Status Badges (Active/Inactive, Worker Type, Employment Type)
│   └── Stats Cards (Hourly Rate, Jobs Completed, Upcoming Jobs, Rating)
├── Tabs Component (Overview, Schedule, Certificates, Availability)
│   ├── Overview Tab
│   │   ├── Basic Information Form (editable)
│   │   └── Performance Summary Card
│   ├── Schedule Tab
│   │   ├── Upcoming Jobs List
│   │   └── Completed Jobs History
│   ├── Certificates Tab
│   │   ├── Upload Certificate Button
│   │   └── Certificate Grid (View/Delete actions)
│   └── Availability Tab
│       └── Placeholder for calendar (future)
```

**State Management:**
```typescript
// Worker data from API
const [worker, setWorker] = useState<Worker | null>(null)
const [jobs, setJobs] = useState<CleaningJob[]>([])

// Local state (temporary, needs backend)
const [photoPreview, setPhotoPreview] = useState<string | null>(null)
const [photoFile, setPhotoFile] = useState<File | null>(null)
const [certificates, setCertificates] = useState<Certificate[]>([])
const [availability, setAvailability] = useState<{ [date: string]: boolean }>({})
```

**API Integration:**
```typescript
// Existing (working)
workersAPI.get(id, SERVICE_PROVIDER_ID)           // Get worker details
workersAPI.update(id, data)                        // Update worker info
cleaningJobsAPI.list(SERVICE_PROVIDER_ID, filters) // Get worker's jobs

// Needed (to be implemented)
workersAPI.uploadPhoto(id, file)
workersAPI.deletePhoto(id)
workersAPI.uploadCertificate(id, file, metadata)
workersAPI.getCertificates(id)
workersAPI.deleteCertificate(id, certId)
```

### Backend Implementation Pattern

Following existing architecture from `PhotosService.ts`:

**1. File Upload Service** (Create `WorkerPhotosService.ts` & `WorkerCertificatesService.ts`)
```typescript
import { PhotosService } from './PhotosService'

export class WorkerPhotosService {
  private photosService: PhotosService

  constructor() {
    this.photosService = new PhotosService()
  }

  async uploadWorkerPhoto(workerId: string, tenantId: string, file: Express.Multer.File) {
    // Upload photo using PhotosService
    const photoUrl = await this.photosService.uploadPhoto(
      tenantId,
      `workers/${workerId}`,
      file
    )

    // Update worker record with photo_url
    await prisma.worker.update({
      where: { id: workerId },
      data: { photo_url: photoUrl }
    })

    return photoUrl
  }

  async deleteWorkerPhoto(workerId: string, tenantId: string) {
    const worker = await prisma.worker.findUnique({ where: { id: workerId } })

    if (worker?.photo_url) {
      await this.photosService.deletePhoto(worker.photo_url, tenantId)
      await prisma.worker.update({
        where: { id: workerId },
        data: { photo_url: null }
      })
    }
  }
}
```

**2. API Routes** (Create `apps/api/src/routes/workers.ts` or extend existing)
```typescript
import multer from 'multer'
import { WorkerPhotosService } from '../services/WorkerPhotosService'
import { WorkerCertificatesService } from '../services/WorkerCertificatesService'

const upload = multer({ storage: multer.memoryStorage() })

// Photo upload
router.post('/workers/:id/photo',
  authenticateToken,
  upload.single('photo'),
  async (req, res) => {
    // Implementation
  }
)

// Certificate upload
router.post('/workers/:id/certificates',
  authenticateToken,
  upload.single('certificate'),
  async (req, res) => {
    // Implementation
  }
)
```

**3. Prisma Migration**
```bash
# Add photo_url field to Worker table
npx prisma migrate dev --name add_worker_photo_url

# Create WorkerCertificate table
npx prisma migrate dev --name create_worker_certificates
```

---

## 📁 File Structure

### Files Created (Frontend)
```
apps/web-cleaning/src/pages/
└── WorkerDetails.tsx          ✅ Complete (needs backend integration)

apps/web-cleaning/src/App.tsx  ✅ Route added: /workers/:id
```

### Files to Create (Backend)
```
apps/api/src/services/
├── WorkerPhotosService.ts      ❌ Pending
└── WorkerCertificatesService.ts ❌ Pending

apps/api/src/routes/
└── workers.ts                  ❌ Pending (or extend existing)

packages/database/prisma/
└── schema.prisma               ❌ Needs migration for photo_url and WorkerCertificate table
```

---

## 🔄 Integration Points

### Navigation
- ✅ Workers list page → Worker details (`/workers/:id`)
- ✅ Calendar worker cards → Worker details (click to navigate)
- ✅ Worker details → Back to workers list

### Data Flow
```
1. User selects worker from list/calendar
   ↓
2. Navigate to /workers/:id
   ↓
3. Load worker data from API (GET /api/workers/:id)
   ↓
4. Load worker's jobs (GET /api/cleaning-jobs?assigned_worker_id={id})
   ↓
5. Display in tabs (Overview, Schedule, Certificates, Availability)
   ↓
6. User uploads photo/certificate
   ↓
7. [NEEDS BACKEND] POST to /api/workers/:id/photo or /certificates
   ↓
8. [NEEDS BACKEND] File stored, database updated
   ↓
9. UI updates to show new photo/certificate
```

---

## ✅ Acceptance Testing

### Manual Test Cases

**Photo Upload:**
- ✅ Can select photo from file picker
- ✅ Photo preview displays correctly
- ✅ Save button appears when photo selected
- ❌ Photo persists after save (needs backend)
- ❌ Photo loads on page refresh (needs backend)
- ❌ Can delete/replace photo (needs backend)

**Certificate Upload:**
- ✅ Can upload PDF, JPG, JPEG, PNG files
- ✅ Certificate appears in list immediately
- ✅ Upload date shows correctly
- ✅ Can view certificate in new tab
- ✅ Can delete certificate with confirmation
- ❌ Certificates persist after page refresh (needs backend)
- ❌ Can add expiry dates (needs backend)

**Worker Schedule:**
- ✅ Upcoming jobs display in chronological order
- ✅ Completed jobs show in separate section
- ✅ Job cards show correct information
- ✅ Click job card navigates to job details
- ✅ Empty state shows when no jobs

**Navigation:**
- ✅ Back button returns to workers list
- ✅ Can navigate from workers list
- ✅ Can navigate from calendar worker cards

---

## 🚀 Deployment Notes

### Phase 1: Frontend Only (✅ COMPLETE)
- Worker details page fully functional
- Photo/certificate upload UI works
- Data stored in component state (temporary)
- **Limitation**: Data lost on page refresh

### Phase 2: Backend Implementation (⏭️ NEXT)
1. Add photo_url column to Worker table
2. Create WorkerCertificate table
3. Implement WorkerPhotosService
4. Implement WorkerCertificatesService
5. Create API routes for photo/certificate operations
6. Set up file storage directories
7. Update frontend to use real API endpoints

### Phase 3: Enhanced Features (⏭️ FUTURE)
- Availability calendar implementation
- Certificate expiry notifications
- Bulk certificate upload
- Photo cropping/editing
- Certificate templates

---

## 📊 Success Metrics

**Current Progress:**
- ✅ Worker details page: 100%
- ✅ Photo upload UI: 100%
- ✅ Certificate management UI: 100%
- ✅ Schedule view: 100%
- ❌ Photo backend: 0%
- ❌ Certificate backend: 0%
- ❌ Availability calendar: 0%

**Overall Story Progress: 60% Complete**
- Frontend: 95% complete
- Backend: 0% complete
- Integration: 0% complete

---

## 📝 Developer Notes

**Why Frontend First?**
- Allows UI/UX testing and validation
- User can provide feedback on interface
- Backend can be implemented in parallel
- Demonstrates value quickly

**Known Limitations (Temporary):**
- Photos stored as base64 in React state
- Certificates stored as blob URLs in React state
- Data lost on page refresh
- No multi-user synchronization
- No file size validation on frontend

**Next Steps:**
1. Get user approval on UI/UX
2. Prioritize photo vs certificate backend first
3. Implement backend endpoints following existing patterns
4. Add Prisma migrations
5. Update frontend to use real APIs
6. Add comprehensive error handling
7. Add file validation (type, size limits)

---

## 🔗 Related Stories

- STORY-WM-002: Worker Assignment to Jobs (scheduling conflicts)
- STORY-WM-003: Worker Performance Analytics
- STORY-WM-004: Worker Time Tracking Integration
- STORY-WM-005: Worker Certification Expiry Notifications

---

**Last Updated:** 2025-11-04
**Status:** Frontend complete, awaiting backend implementation
