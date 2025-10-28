# RightFit Services - Sprint Plans (MVP Development)

**Document Version:** 1.0
**Date:** 2025-10-27
**Project Manager:** John (PM Agent)
**Sprint Duration:** 2 weeks (14 days)
**Total Sprints:** 6 (Week 1-12)

---

## Sprint Planning Methodology

### Sprint Structure
- **Sprint Length:** 2 weeks (14 days)
- **Developer Availability:** 20-30 hours/week (40-60 hours per sprint)
- **Sprint Ceremonies:**
  - **Planning:** Monday Week 1 (1 hour)
  - **Daily Check-in:** Async via GitHub/Trello (10 min)
  - **Review:** Friday Week 2 (30 min)
  - **Retrospective:** Friday Week 2 (30 min)

### Story Point Estimation
- **1 point** = 1 hour of focused work
- **Sprint capacity:** 40-60 points per sprint (conservative: 45 points)
- **Buffer:** 10% for meetings, context switching, unexpected issues

### Definition of Done
- ✅ All acceptance criteria met
- ✅ Unit tests written (critical paths)
- ✅ Manually tested (happy path + edge cases)
- ✅ Code reviewed (self-review for solo dev)
- ✅ Deployed to staging environment
- ✅ No critical bugs

---

## Sprint 1: Foundation (Week 1-2)

### Sprint Goal
**"Developer can create account and add properties"**

By the end of Sprint 1, we have a working monorepo with authentication, property management, and AWS infrastructure ready for development.

### User Stories

#### US-Setup-1: Monorepo Setup (8 points)
**As a** developer
**I want** a Turborepo monorepo with apps (mobile, web, api) and shared packages
**So that** I can develop all platforms with code sharing

**Acceptance Criteria:**
- [x] Turborepo configured with pnpm workspaces
- [x] apps/mobile (React Native + Expo)
- [x] apps/web (React + Vite)
- [x] apps/api (Node.js + Express)
- [x] packages/shared (TypeScript types)
- [x] packages/database (Prisma schema)
- [x] All apps run with `turbo run dev`

**Technical Notes:**
- Follow source tree structure from `docs/architecture/source-tree.md`
- Setup TypeScript strict mode
- Configure ESLint + Prettier

**Estimate:** 8 hours

---

#### US-AWS-1: AWS Infrastructure Setup (8 points)
**As a** developer
**I want** AWS infrastructure (EC2, RDS, S3) provisioned
**So that** I can deploy the API and store data

**Acceptance Criteria:**
- [x] RDS PostgreSQL db.t3.micro created (Single-AZ)
- [x] S3 bucket for photos created (`rightfit-photos-dev`)
- [x] EC2 t3.small instance launched (or use local dev initially)
- [x] Security groups configured (RDS accessible from EC2 only)
- [x] Database connection string stored in Secrets Manager
- [x] Prisma connected to RDS successfully

**Technical Notes:**
- Follow deployment guide: `docs/architecture/deployment.md`
- Use AWS free tier where possible (db.t3.micro)
- Setup billing alerts at £50, £100, £150

**Estimate:** 8 hours

---

#### US-Auth-1: User Registration (6 points)
**As a** landlord
**I want** to register an account with email and password
**So that** I can access the platform

**Acceptance Criteria:**
- [x] POST /api/v1/auth/register endpoint
- [x] Email validation (must be valid email format)
- [x] Password validation (min 8 chars, 1 uppercase, 1 number)
- [x] Password hashed with bcrypt (10 rounds)
- [x] Creates User record in database
- [x] Creates Tenant record (multi-tenancy)
- [x] Returns JWT access token + refresh token
- [x] Error handling (email already exists, validation errors)

**Technical Notes:**
- Use Zod schema validation (`packages/shared/src/schemas/auth.schema.ts`)
- Auto-start 30-day trial on registration
- Reference: `docs/architecture/database-schema.md` User and Tenant models

**Estimate:** 6 hours

---

#### US-Auth-2: User Login (4 points)
**As a** registered landlord
**I want** to login with my email and password
**So that** I can access my properties and work orders

**Acceptance Criteria:**
- [x] POST /api/v1/auth/login endpoint
- [x] Validate email + password
- [x] Return JWT access token (15 min expiry) + refresh token (30 days)
- [x] JWT contains: user_id, tenant_id, role
- [x] Error handling (invalid credentials, account not found)

**Estimate:** 4 hours

---

#### US-Auth-3: JWT Token Refresh (3 points)
**As a** logged-in user
**I want** my session to stay active without re-login
**So that** I don't have to login every 15 minutes

**Acceptance Criteria:**
- [x] POST /api/v1/auth/refresh endpoint
- [x] Accepts refresh token in request body
- [x] Validates refresh token signature
- [x] Returns new access token + new refresh token (token rotation)
- [x] Invalidates old refresh token

**Technical Notes:**
- Implement token rotation for security
- Store refresh tokens in database (for revocation capability in future)

**Estimate:** 3 hours

---

#### US-Prop-1: Create Property (6 points)
**As a** landlord
**I want** to create a property record
**So that** I can track maintenance for that property

**Acceptance Criteria:**
- [x] POST /api/v1/properties endpoint (requires auth)
- [x] Accepts: name, address_line1, city, postcode, property_type, bedrooms, bathrooms
- [x] Validates postcode format (UK postcodes)
- [x] Auto-injects tenant_id from JWT (multi-tenancy)
- [x] Returns created property with ID
- [x] Audit log entry created

**Technical Notes:**
- Use Prisma `property.create()`
- Tenant middleware must inject tenant_id from JWT
- Validation schema: `packages/shared/src/schemas/property.schema.ts`

**Estimate:** 6 hours

---

#### US-Prop-2: List Properties (4 points)
**As a** landlord
**I want** to see all my properties
**So that** I can select one to manage

**Acceptance Criteria:**
- [x] GET /api/v1/properties endpoint
- [x] Returns only properties for authenticated user's tenant
- [x] Filters out soft-deleted properties (deleted_at IS NULL)
- [x] Sorted by created_at DESC (newest first)
- [x] Pagination support (limit=20, offset=0 by default)

**Estimate:** 4 hours

---

#### US-Prop-3: Update Property (4 points)
**As a** landlord
**I want** to edit a property's details
**So that** I can keep information up-to-date

**Acceptance Criteria:**
- [x] PUT /api/v1/properties/:id endpoint
- [x] Validates property belongs to user's tenant (security check)
- [x] Updates only provided fields (partial update)
- [x] Returns updated property
- [x] Audit log entry created

**Estimate:** 4 hours

---

#### US-Prop-4: Delete Property (Soft Delete) (3 points)
**As a** landlord
**I want** to delete a property
**So that** I can remove properties I no longer manage

**Acceptance Criteria:**
- [x] DELETE /api/v1/properties/:id endpoint
- [x] Soft delete (sets deleted_at timestamp)
- [x] Property no longer appears in list endpoint
- [x] Audit log entry created

**Technical Notes:**
- Soft delete preserves data for recovery
- Future: Admin panel can permanently purge after 90 days

**Estimate:** 3 hours

---

### Sprint 1 Summary

**Total Story Points:** 50 hours
**Sprint Capacity:** 40-60 hours (fits well!)

**Story Breakdown:**
- Setup & Infrastructure: 16 hours (32%)
- Authentication: 13 hours (26%)
- Property Management: 21 hours (42%)

**Risks:**
- ⚠️ AWS setup may take longer if first-time using RDS (add 2-4 hours)
- ⚠️ Monorepo configuration can be tricky (add 2 hours buffer)

**Dependencies:**
- AWS account must be created Day 1 (approval can take 24-48 hours)
- Turborepo and Prisma familiarity (developer should review docs beforehand)

**Sprint 1 Checklist:**
- [ ] Monday Week 1: Sprint planning meeting (1 hour)
- [ ] Day 1: AWS account created, monorepo initialized
- [ ] Day 3-5: Auth endpoints complete
- [ ] Day 6-8: Property CRUD complete
- [ ] Day 9-10: Integration testing, bug fixes
- [ ] Friday Week 2: Sprint review + retrospective

---

## Sprint 2: Core Workflows (Week 3-4)

### Sprint Goal
**"Landlord can create work orders, assign contractors, and send SMS notifications"**

By the end of Sprint 2, the core maintenance workflow is functional: create work orders, assign to contractors, and notify them via SMS.

### User Stories

#### US-WO-1: Create Work Order (8 points)
**As a** landlord
**I want** to create a work order for a property
**So that** I can track maintenance issues

**Acceptance Criteria:**
- [x] POST /api/v1/work-orders endpoint
- [x] Requires: property_id, title, description, priority, category
- [x] Optional: due_date, estimated_cost
- [x] Auto-sets: status=OPEN, tenant_id from JWT, created_by_user_id
- [x] Validates property belongs to user's tenant
- [x] Returns created work order with ID

**Technical Notes:**
- Work order categories: PLUMBING, ELECTRICAL, HEATING, APPLIANCES, EXTERIOR, INTERIOR, OTHER
- Priority levels: EMERGENCY, HIGH, MEDIUM, LOW

**Estimate:** 8 hours

---

#### US-WO-2: List Work Orders (5 points)
**As a** landlord
**I want** to see all work orders for my properties
**So that** I can track maintenance status

**Acceptance Criteria:**
- [x] GET /api/v1/work-orders endpoint
- [x] Returns only work orders for user's tenant
- [x] Optional filters: status, priority, property_id
- [x] Sorted by priority DESC, due_date ASC (urgent first)
- [x] Includes property details (JOIN)
- [x] Pagination support

**Estimate:** 5 hours

---

#### US-WO-3: Update Work Order (4 points)
**As a** landlord or contractor
**I want** to update a work order's status
**So that** I can track progress

**Acceptance Criteria:**
- [x] PUT /api/v1/work-orders/:id endpoint
- [x] Can update: status, description, priority, due_date, actual_cost
- [x] Validates work order belongs to user's tenant
- [x] Auto-sets: started_at when status → IN_PROGRESS, completed_at when status → COMPLETED
- [x] Audit log entry

**Estimate:** 4 hours

---

#### US-Contractor-1: Create Contractor (6 points)
**As a** landlord
**I want** to add a contractor to my database
**So that** I can assign them work orders

**Acceptance Criteria:**
- [x] POST /api/v1/contractors endpoint
- [x] Requires: name, phone, specialties (array)
- [x] Optional: company_name, email, service_area, hourly_rate, notes
- [x] Validates UK phone number format
- [x] Auto-injects tenant_id
- [x] Returns created contractor

**Technical Notes:**
- Specialties match work order categories
- Phone number used for SMS notifications

**Estimate:** 6 hours

---

#### US-Contractor-2: List Contractors (3 points)
**As a** landlord
**I want** to see all my contractors
**So that** I can select one to assign to a work order

**Acceptance Criteria:**
- [x] GET /api/v1/contractors endpoint
- [x] Returns only contractors for user's tenant
- [x] Optional filter: specialty
- [x] Sorted by preferred DESC (preferred contractors first), name ASC

**Estimate:** 3 hours

---

#### US-WO-4: Assign Work Order to Contractor (6 points)
**As a** landlord
**I want** to assign a work order to a contractor
**So that** they know to complete the work

**Acceptance Criteria:**
- [x] POST /api/v1/work-orders/:id/assign endpoint
- [x] Requires: contractor_id
- [x] Updates work order: contractor_id, status=ASSIGNED
- [x] Validates contractor belongs to user's tenant
- [x] Returns updated work order

**Technical Notes:**
- This endpoint triggers SMS notification (next story)

**Estimate:** 6 hours

---

#### US-SMS-1: Twilio SMS Notification (8 points)
**As a** landlord
**I want** the contractor to receive an SMS when assigned a work order
**So that** they are notified immediately

**Acceptance Criteria:**
- [x] Twilio integration setup (account, API keys)
- [x] Send SMS on work order assignment
- [x] SMS includes: property address, work order title, priority, landlord contact
- [x] SMS format: "URGENT: Heating failure at 123 Main St. Contact John: 07123456789"
- [x] Error handling (invalid phone number, Twilio API error)
- [x] Log SMS delivery status

**Technical Notes:**
- Use Twilio SDK: `npm install twilio`
- Store Twilio credentials in Secrets Manager
- Cost: ~£0.04 per SMS (budget £90 for MVP = 2,250 SMS)

**Estimate:** 8 hours

---

#### US-Photo-1: Photo Upload to S3 (10 points)
**As a** landlord
**I want** to upload photos to a work order or property
**So that** I can document issues and repairs

**Acceptance Criteria:**
- [x] POST /api/v1/photos endpoint
- [x] Accepts: multipart/form-data with image file
- [x] Requires: entity_type (work_order or property), entity_id
- [x] Validates: file size <10MB, mime type (image/jpeg, image/png)
- [x] Uploads to S3 bucket with key: `tenants/{tenant_id}/photos/{photo_id}.jpg`
- [x] Generates thumbnail (400x400) using Sharp library
- [x] Saves photo metadata to database (s3_key, s3_url, thumbnail_url, file_size)
- [x] Returns photo record with CloudFront URL

**Technical Notes:**
- Use AWS SDK v3: `@aws-sdk/client-s3`
- Use Sharp for image optimization: `npm install sharp`
- CloudFront URL format: `https://{cloudfront_domain}/{s3_key}`

**Estimate:** 10 hours

---

### Sprint 2 Summary

**Total Story Points:** 50 hours
**Sprint Capacity:** 40-60 hours (fits well!)

**Story Breakdown:**
- Work Orders: 17 hours (34%)
- Contractors: 9 hours (18%)
- SMS Integration: 8 hours (16%)
- Photo Upload: 10 hours (20%)
- Contingency: 6 hours (12%)

**Risks:**
- ⚠️ Twilio SMS integration may require UK phone number verification (1-2 days delay)
- ⚠️ S3 photo upload with Sharp image processing can be complex (add 2-4 hours buffer)

**Dependencies:**
- Twilio account must be created + verified (do this Week 2)
- AWS S3 bucket already created in Sprint 1

**Sprint 2 Checklist:**
- [ ] Monday Week 3: Sprint planning meeting
- [ ] Day 1-3: Work order CRUD complete
- [ ] Day 4-5: Contractor CRUD complete
- [ ] Day 6-7: SMS integration complete
- [ ] Day 8-10: Photo upload complete
- [ ] Friday Week 4: Sprint review + retrospective

**Go/No-Go Decision Point (Week 4):**
- **Question:** Are we on track for 12-week MVP?
- **Criteria:** Foundation + core workflows complete, <1 week behind schedule
- **If NO:** Emergency meeting, cut 1-2 features (e.g., delay UK compliance to Phase 2)

---

## Sprint 3: Mobile App Foundation (Week 5-6)

### Sprint Goal
**"Mobile app is functional for core workflows (properties, work orders, photo upload)"**

By the end of Sprint 3, landlords can use the mobile app to view properties, create work orders, and take photos.

### User Stories

#### US-Mobile-1: React Native + Expo Setup (8 points)
**As a** developer
**I want** a React Native mobile app with Expo
**So that** I can build iOS and Android apps from one codebase

**Acceptance Criteria:**
- [x] apps/mobile initialized with Expo 50+
- [x] React Navigation setup (tab + stack navigation)
- [x] React Native Paper UI library installed
- [x] TypeScript configured
- [x] Axios API client setup (with auth token handling)
- [x] Redux Toolkit store setup
- [x] App runs on iOS Simulator and Android Emulator

**Technical Notes:**
- Follow tech stack: `docs/architecture/tech-stack.md`
- Use Expo managed workflow (not bare workflow)

**Estimate:** 8 hours

---

#### US-Mobile-2: Authentication Screens (6 points)
**As a** landlord
**I want** to login on the mobile app
**So that** I can access my properties

**Acceptance Criteria:**
- [x] Login screen (email, password, submit button)
- [x] Register screen (email, password, confirm password, name)
- [x] Form validation (Zod + react-hook-form)
- [x] Calls /api/v1/auth/login and /register
- [x] Stores JWT token in AsyncStorage
- [x] Redirects to home screen on success
- [x] Shows error messages on failure

**Estimate:** 6 hours

---

#### US-Mobile-3: Properties List Screen (6 points)
**As a** landlord
**I want** to see all my properties on mobile
**So that** I can select one to manage

**Acceptance Criteria:**
- [x] Properties list screen (tab navigation)
- [x] Fetches GET /api/v1/properties on mount
- [x] Displays properties in list (card layout)
- [x] Shows: property name, address, bedrooms, bathrooms
- [x] Tap property → navigates to Property Details screen
- [x] Pull-to-refresh

**Estimate:** 6 hours

---

#### US-Mobile-4: Property Details Screen (4 points)
**As a** landlord
**I want** to see property details and associated work orders
**So that** I can understand the property's maintenance status

**Acceptance Criteria:**
- [x] Property details screen (stack navigation)
- [x] Shows: full address, property type, access instructions
- [x] Shows list of work orders for this property
- [x] Button: "Create Work Order" → navigates to Create Work Order screen

**Estimate:** 4 hours

---

#### US-Mobile-5: Work Orders List Screen (6 points)
**As a** landlord
**I want** to see all my work orders on mobile
**So that** I can track maintenance

**Acceptance Criteria:**
- [x] Work orders list screen (tab navigation)
- [x] Fetches GET /api/v1/work-orders on mount
- [x] Displays work orders in list (card layout)
- [x] Shows: title, property name, priority badge, status badge
- [x] Color-coded priority (RED=Emergency, ORANGE=High, YELLOW=Medium, GREEN=Low)
- [x] Tap work order → navigates to Work Order Details screen
- [x] Pull-to-refresh

**Estimate:** 6 hours

---

#### US-Mobile-6: Work Order Details Screen (5 points)
**As a** landlord
**I want** to see work order details
**So that** I can review the issue and resolution

**Acceptance Criteria:**
- [x] Work order details screen
- [x] Shows: title, description, property, priority, status, due date
- [x] Shows assigned contractor (if any)
- [x] Shows photos attached to work order
- [x] Button: "Assign Contractor" (Phase 2 - skip for now)

**Estimate:** 5 hours

---

#### US-Mobile-7: Create Work Order Screen (8 points)
**As a** landlord
**I want** to create a work order on mobile
**So that** I can log maintenance issues on-site

**Acceptance Criteria:**
- [x] Create work order screen (modal or stack navigation)
- [x] Form fields: property (dropdown), title, description, priority, category
- [x] Form validation
- [x] Button: "Add Photos" → opens camera/gallery
- [x] Calls POST /api/v1/work-orders
- [x] Shows success message, navigates back to list

**Technical Notes:**
- Photo upload is separate story (US-Mobile-8)
- For now, just create work order without photos

**Estimate:** 8 hours

---

#### US-Mobile-8: Camera Photo Upload (10 points)
**As a** landlord
**I want** to take photos with my phone camera and attach to work order
**So that** I can document issues

**Acceptance Criteria:**
- [x] Button: "Take Photo" → opens camera
- [x] Button: "Choose from Gallery" → opens photo picker
- [x] Compress photo before upload (max 1920x1920, 85% quality)
- [x] Shows photo thumbnail after capture
- [x] Button: "Upload" → calls POST /api/v1/photos
- [x] Shows upload progress indicator
- [x] Error handling (camera permission denied, upload failed)

**Technical Notes:**
- Use Expo Camera: `expo-camera`
- Use Expo Image Picker: `expo-image-picker`
- Use Expo Image Manipulator for compression: `expo-image-manipulator`

**Estimate:** 10 hours

---

### Sprint 3 Summary

**Total Story Points:** 53 hours
**Sprint Capacity:** 40-60 hours (slightly over - may need to defer 1 story)

**Story Breakdown:**
- Setup: 8 hours (15%)
- Auth Screens: 6 hours (11%)
- Properties: 10 hours (19%)
- Work Orders: 19 hours (36%)
- Camera: 10 hours (19%)

**Risks:**
- ⚠️ React Native + Expo first-time setup can be complex (add 2-4 hours buffer)
- ⚠️ Camera permissions on iOS require Info.plist configuration
- ⚠️ Photo upload on slow mobile networks may need optimization

**Dependencies:**
- Developer must have iOS Simulator (macOS) or Android Emulator (any OS) installed
- Expo account created (free)

**Sprint 3 Checklist:**
- [ ] Monday Week 5: Sprint planning
- [ ] Day 1-2: React Native setup, auth screens
- [ ] Day 3-5: Properties screens
- [ ] Day 6-8: Work orders screens
- [ ] Day 9-10: Camera + photo upload
- [ ] Friday Week 6: Sprint review + retrospective

**Possible Scope Adjustment:**
- If running behind, defer US-Mobile-8 (Camera) to Sprint 4

---

## Sprint 4: Offline Mode (Week 7-8) 🚨 CRITICAL

### Sprint Goal
**"Mobile app works fully offline (create work orders, take photos, auto-sync when online)"**

By the end of Sprint 4, the app's most important differentiator is working: offline mode.

### User Stories

#### US-Offline-1: WatermelonDB Setup (10 points)
**As a** developer
**I want** WatermelonDB local database configured
**So that** I can store data offline

**Acceptance Criteria:**
- [x] WatermelonDB installed + configured
- [x] Local schema defined (properties, work_orders, sync_queue tables)
- [x] Schema matches server database structure
- [x] Can create, read, update records in local DB
- [x] Data persists after app closed and reopened

**Technical Notes:**
- Follow tech stack: WatermelonDB schema in `docs/architecture/tech-stack.md`
- Use SQLite adapter for iOS/Android

**Estimate:** 10 hours

---

#### US-Offline-2: Sync Properties on Login (8 points)
**As a** landlord
**I want** my properties downloaded to local storage on login
**So that** I can view them offline

**Acceptance Criteria:**
- [x] On successful login, fetch GET /api/v1/properties
- [x] Save all properties to WatermelonDB local storage
- [x] Property list screen reads from local DB (not API)
- [x] Works offline after initial sync

**Technical Notes:**
- Sync on app foreground (if >5 min since last sync)
- Show "Last synced: 2 min ago" indicator

**Estimate:** 8 hours

---

#### US-Offline-3: Create Work Order Offline (10 points)
**As a** landlord
**I want** to create work orders offline
**So that** I can log issues in rural areas with no signal

**Acceptance Criteria:**
- [x] Create work order screen works offline
- [x] Work order saved to local WatermelonDB
- [x] Temporary client-side ID assigned (UUID)
- [x] Work order added to sync_queue table (action: CREATE, status: PENDING)
- [x] Work order appears in list immediately (optimistic UI)
- [x] Shows "Not synced" badge on work order card

**Technical Notes:**
- Use optimistic UI pattern (show immediately, sync in background)

**Estimate:** 10 hours

---

#### US-Offline-4: Sync Queue Processor (12 points)
**As a** developer
**I want** a sync queue that uploads offline changes when connection restored
**So that** no data is lost

**Acceptance Criteria:**
- [x] Sync service runs when app regains connectivity
- [x] Processes sync_queue items in order (FIFO)
- [x] For each CREATE action: calls POST /api/v1/work-orders
- [x] On success: updates local record with server ID, marks sync_queue item as SYNCED
- [x] On failure: increments retry_count, sets status=FAILED
- [x] Exponential backoff for retries (1 min, 5 min, 15 min, 1 hour)
- [x] Shows sync progress indicator in UI

**Technical Notes:**
- Use NetInfo to detect connectivity: `@react-native-community/netinfo`
- Sync queue must handle conflicts (last-write-wins for MVP)

**Estimate:** 12 hours

---

#### US-Offline-5: Offline Photo Upload (10 points)
**As a** landlord
**I want** to take photos offline and have them upload automatically
**So that** I don't have to remember to retry manually

**Acceptance Criteria:**
- [x] Photos taken offline stored in local file system (Expo FileSystem)
- [x] Photo upload added to sync_queue (action: UPLOAD_PHOTO)
- [x] Sync processor uploads photo to S3 when online
- [x] Photo metadata saved to database after successful upload
- [x] Shows "Not synced" badge on photo thumbnail

**Technical Notes:**
- Store photos temporarily in Expo FileSystem cache directory
- Clean up local photos after successful upload (to save space)

**Estimate:** 10 hours

---

#### US-Offline-6: Conflict Resolution (6 points)
**As a** developer
**I want** basic conflict resolution for offline edits
**So that** data isn't lost when two devices edit the same record

**Acceptance Criteria:**
- [x] Last-write-wins strategy (server wins on conflict)
- [x] If server returns 409 Conflict, fetch latest data and overwrite local
- [x] Show toast message: "Work order updated by another user"
- [x] Audit log records conflict events

**Technical Notes:**
- For MVP, last-write-wins is acceptable (no complex CRDTs needed)
- Phase 2: Add more sophisticated conflict resolution

**Estimate:** 6 hours

---

### Sprint 4 Summary

**Total Story Points:** 56 hours
**Sprint Capacity:** 40-60 hours (slightly over capacity)

**Story Breakdown:**
- WatermelonDB Setup: 10 hours (18%)
- Sync Properties: 8 hours (14%)
- Offline Work Orders: 10 hours (18%)
- Sync Queue: 12 hours (21%)
- Offline Photos: 10 hours (18%)
- Conflict Resolution: 6 hours (11%)

**CRITICAL SPRINT - NO COMPROMISES:**
This is the most important sprint. Offline mode is the core differentiator vs. competitors.

**Risks:**
- 🚨 WatermelonDB learning curve is steep (first time using?)
- 🚨 Sync queue logic is complex (edge cases: network flakiness, partial uploads)
- 🚨 Sprint is slightly over capacity - may need to extend by 2-3 days

**Mitigation:**
- Developer should review WatermelonDB docs in advance (Week 6)
- If not working by Week 8, **EXTEND SPRINT 4 by 1 week** (delay Sprint 5)
- Alternative pivot: Simplify offline mode (cache read-only data, no offline creates)

**Dependencies:**
- Good internet connection for testing (simulate offline with Airplane Mode)

**Sprint 4 Checklist:**
- [ ] Monday Week 7: Sprint planning (emphasize criticality)
- [ ] Day 1-3: WatermelonDB setup + sync properties
- [ ] Day 4-6: Offline work order creation
- [ ] Day 7-9: Sync queue processor
- [ ] Day 10-12: Offline photos + conflict resolution
- [ ] Day 13-14: Integration testing, edge case handling
- [ ] Friday Week 8: Sprint review + retrospective

**Go/No-Go Decision Point (Week 8):**
- **Question:** Is offline mode working reliably?
- **Criteria:** Can create work orders offline, sync automatically when online, no data loss, <3 critical bugs
- **If NO:** Extend Sprint 4 by 1 week, delay Sprint 5 and 6 (push launch to Week 13)

---

## Sprint 5: AI + UK Compliance (Week 9-10)

### Sprint Goal
**"Photo quality checks via AI and UK compliance certificate tracking working"**

By the end of Sprint 5, RightFit has AI-powered photo quality checks and UK landlord compliance reminders.

### User Stories

#### US-AI-1: Google Vision API Integration (6 points)
**As a** developer
**I want** Google Vision API integrated
**So that** I can analyze photo quality

**Acceptance Criteria:**
- [x] Google Cloud Vision API key obtained (free tier)
- [x] @google-cloud/vision library installed
- [x] API call: analyze uploaded photo
- [x] Extract: brightness score, blur score
- [x] Save results to photos.quality_check_details (JSON column)

**Technical Notes:**
- Free tier: 1,000 images/month (sufficient for MVP beta testing)
- API response time: ~500ms-1s

**Estimate:** 6 hours

---

#### US-AI-2: Photo Quality Check Warning (6 points)
**As a** landlord
**I want** to be warned if a photo is too dark or blurry
**So that** I can retake the photo

**Acceptance Criteria:**
- [x] After photo upload, analyze with Google Vision
- [x] If brightness < 30% → "Photo too dark, consider retaking"
- [x] If blur score > 70% → "Photo blurry, consider retaking"
- [x] Show warning modal with option: "Retake" or "Keep Anyway"
- [x] User can proceed with low-quality photo (non-blocking)

**Technical Notes:**
- Warning is advisory only (not blocking)
- Helps landlords capture better documentation

**Estimate:** 6 hours

---

#### US-Cert-1: Certificate Upload (8 points)
**As a** landlord
**I want** to upload compliance certificates
**So that** I can track expiration dates

**Acceptance Criteria:**
- [x] POST /api/v1/certificates endpoint
- [x] Requires: property_id, certificate_type, issue_date, expiry_date, document_url
- [x] Certificate types: GAS_SAFETY, ELECTRICAL, EPC, STL_LICENSE, OTHER
- [x] Validates expiry_date > issue_date
- [x] Uploads PDF to S3 (separate bucket: rightfit-certificates-prod)
- [x] Returns certificate record

**Technical Notes:**
- Support PDF uploads (mime type: application/pdf)
- UK compliance requirements:
  - Gas Safety: Annual (365 days)
  - Electrical: 5 years
  - EPC: 10 years

**Estimate:** 8 hours

---

#### US-Cert-2: List Certificates (4 points)
**As a** landlord
**I want** to see all certificates for a property
**So that** I can check compliance status

**Acceptance Criteria:**
- [x] GET /api/v1/properties/:id/certificates endpoint
- [x] Returns certificates for property, sorted by expiry_date ASC
- [x] Shows: certificate_type, issue_date, expiry_date, days_until_expiry
- [x] Color-coded: RED=expired, ORANGE=<30 days, YELLOW=<60 days, GREEN=>60 days

**Estimate:** 4 hours

---

#### US-Cert-3: Certificate Expiration Push Notifications (10 points)
**As a** landlord
**I want** push notifications before certificates expire
**So that** I can renew them on time

**Acceptance Criteria:**
- [x] Firebase Cloud Messaging (FCM) setup (iOS + Android)
- [x] Expo push notification permissions requested on app start
- [x] Store FCM device token in users table
- [x] Background job (cron): Check certificates expiring in 60, 30, 7 days
- [x] Send push notification: "Gas Safety certificate expires in 7 days for Property X"
- [x] Tap notification → navigates to property certificates screen

**Technical Notes:**
- Use Expo Notifications: `expo-notifications`
- Cron job runs daily at 9 AM UK time (use node-cron on EC2)
- Notifications sent via Firebase Admin SDK

**Estimate:** 10 hours

---

#### US-Cert-4: Background Job for Certificate Reminders (8 points)
**As a** developer
**I want** a background job that sends certificate reminders
**So that** landlords are notified automatically

**Acceptance Criteria:**
- [x] Cron job runs daily at 9 AM UK time
- [x] Query: SELECT certificates WHERE expiry_date IN (NOW() + 60 days, 30 days, 7 days)
- [x] For each certificate: send push notification + email (SendGrid)
- [x] Log notification delivery status
- [x] Job runs on EC2 (use PM2 or systemd)

**Technical Notes:**
- Use node-cron: `npm install node-cron`
- SendGrid email template: "Your Gas Safety certificate expires in 7 days"

**Estimate:** 8 hours

---

### Sprint 5 Summary

**Total Story Points:** 42 hours
**Sprint Capacity:** 40-60 hours (fits well!)

**Story Breakdown:**
- AI Photo Quality: 12 hours (29%)
- Certificate Management: 12 hours (29%)
- Push Notifications: 18 hours (42%)

**Risks:**
- ⚠️ Google Vision API setup requires GCP account creation (1-2 hours)
- ⚠️ Push notifications on iOS require APNs certificate (complex)
- ⚠️ Background job deployment on EC2 (needs systemd or PM2 setup)

**Dependencies:**
- Firebase project created (free)
- SendGrid account created (free tier: 100 emails/day)

**Sprint 5 Checklist:**
- [ ] Monday Week 9: Sprint planning
- [ ] Day 1-3: Google Vision API integration
- [ ] Day 4-6: Certificate upload + list
- [ ] Day 7-10: Push notifications + background job
- [ ] Friday Week 10: Sprint review + retrospective

**Go/No-Go Decision Point (Week 10):**
- **Question:** Are we ready for final sprint (polish + launch)?
- **Criteria:** All core features working, <10 critical bugs, uptime >99%
- **If NO:** Cut AI photo quality (nice-to-have), focus on bug fixes and stability

---

## Sprint 6: Payments + Polish + Launch (Week 11-12)

### Sprint Goal
**"MVP launched to beta users with Stripe payments, monitoring, and CI/CD"**

By the end of Sprint 6, RightFit Services is live with paying customers!

### User Stories

#### US-Pay-1: Stripe Integration (8 points)
**As a** developer
**I want** Stripe integrated for subscriptions
**So that** landlords can pay monthly

**Acceptance Criteria:**
- [x] Stripe account created (production mode)
- [x] POST /api/v1/subscriptions/create-checkout endpoint
- [x] Creates Stripe Checkout Session
- [x] Pricing plans: £15/month (Basic), £25/month (Pro)
- [x] Redirects to Stripe Checkout page
- [x] Webhook: /api/v1/stripe/webhook handles checkout.session.completed
- [x] Updates tenant.subscription_status = ACTIVE, trial_ends_at = NULL

**Technical Notes:**
- Use Stripe SDK: `npm install stripe`
- Test mode during Sprint 6, production mode after launch

**Estimate:** 8 hours

---

#### US-Pay-2: Pricing Page (4 points)
**As a** landlord
**I want** to see pricing plans
**So that** I can choose a subscription

**Acceptance Criteria:**
- [x] Pricing page on web app (app.rightfitservices.co.uk/pricing)
- [x] Shows two plans: Basic (£15/mo), Pro (£25/mo)
- [x] Feature comparison table
- [x] Button: "Subscribe" → calls create-checkout endpoint
- [x] Mobile: Pricing page in app (bottom sheet or modal)

**Estimate:** 4 hours

---

#### US-Pay-3: Free 30-Day Trial (3 points)
**As a** landlord
**I want** a free 30-day trial
**So that** I can test the platform before paying

**Acceptance Criteria:**
- [x] On registration, set trial_ends_at = NOW() + 30 days
- [x] During trial: full access to all features (no credit card required)
- [x] 7 days before trial end: send email + push notification
- [x] After trial end: block access, show "Subscribe Now" screen

**Estimate:** 3 hours

---

#### US-Pay-4: Subscription Management (5 points)
**As a** landlord
**I want** to view and cancel my subscription
**So that** I can manage billing

**Acceptance Criteria:**
- [x] GET /api/v1/subscriptions/current endpoint
- [x] Returns: plan name, amount, next billing date, status
- [x] Web app: "Manage Subscription" page
- [x] Button: "Cancel Subscription" → calls Stripe Cancel Subscription API
- [x] On cancel: subscription_status = CANCELLED, access until period end

**Estimate:** 5 hours

---

#### US-Test-1: Bug Fixes from Internal Testing (10 points)
**As a** developer
**I want** to fix all critical bugs found during testing
**So that** MVP is stable

**Acceptance Criteria:**
- [x] Developer tests all features end-to-end (create account → create property → create work order → assign contractor → upload photo → offline mode)
- [x] Test on iOS and Android
- [x] Test offline mode in rural areas (simulate with Airplane Mode)
- [x] Fix all critical bugs (data loss, crashes, auth issues)
- [x] Test edge cases (no internet, slow internet, invalid inputs)

**Estimate:** 10 hours

---

#### US-Deploy-1: CI/CD Pipeline (8 points)
**As a** developer
**I want** automated deployment pipeline
**So that** I can deploy quickly

**Acceptance Criteria:**
- [x] GitHub Actions workflow: `.github/workflows/deploy-api.yml`
- [x] On push to main: run tests, build Docker image, deploy to EC2
- [x] GitHub Actions workflow: `.github/workflows/deploy-web.yml`
- [x] On push to main: build React app, deploy to S3, invalidate CloudFront
- [x] Slack notification on successful/failed deploy

**Technical Notes:**
- Follow deployment guide: `docs/architecture/deployment.md`

**Estimate:** 8 hours

---

#### US-Monitor-1: Error Monitoring (4 points)
**As a** developer
**I want** error monitoring with Sentry
**So that** I can fix bugs quickly

**Acceptance Criteria:**
- [x] Sentry account created (free tier: 5k errors/month)
- [x] Sentry SDK installed on API, web, mobile
- [x] All errors automatically sent to Sentry
- [x] Email alerts for critical errors
- [x] Sentry dashboard accessible

**Estimate:** 4 hours

---

#### US-Monitor-2: Uptime Monitoring (3 points)
**As a** developer
**I want** uptime monitoring with UptimeRobot
**So that** I know if the API is down

**Acceptance Criteria:**
- [x] UptimeRobot account created (free tier)
- [x] Monitor: https://api.rightfitservices.co.uk/health (5 min interval)
- [x] Alert via email + Slack if down >2 min
- [x] Public status page: status.rightfitservices.co.uk

**Estimate:** 3 hours

---

#### US-Launch-1: App Store Submission (6 points)
**As a** developer
**I want** to submit apps to App Store and Google Play
**So that** beta users can download

**Acceptance Criteria:**
- [x] iOS: Submit to App Store Connect (TestFlight for beta)
- [x] Android: Submit to Google Play Console (closed beta track)
- [x] App Store listing: screenshots, description, keywords
- [x] Privacy policy and terms of service uploaded
- [x] App approved (may take 1-2 weeks)

**Technical Notes:**
- iOS review typically takes 2-5 days
- Android review typically takes 1-2 days
- Have privacy policy ready (use template)

**Estimate:** 6 hours

---

### Sprint 6 Summary

**Total Story Points:** 53 hours
**Sprint Capacity:** 40-60 hours (slightly over - prioritize ruthlessly)

**Story Breakdown:**
- Stripe Payments: 20 hours (38%)
- Bug Fixes: 10 hours (19%)
- CI/CD: 8 hours (15%)
- Monitoring: 7 hours (13%)
- App Store Submission: 6 hours (11%)
- Contingency: 2 hours (4%)

**Risks:**
- ⚠️ App Store rejection can delay launch by 1-2 weeks (submit early Week 10-11!)
- ⚠️ Bug fixes may uncover more bugs (time-box to 10 hours max)
- ⚠️ Stripe production mode requires business verification (1-2 days)

**Mitigation:**
- Submit to App Store during Sprint 5 (Week 10) to allow buffer time
- If App Store rejected, launch via TestFlight (iOS) and APK direct download (Android)

**Sprint 6 Checklist:**
- [ ] Monday Week 11: Sprint planning
- [ ] Day 1-3: Stripe integration complete
- [ ] Day 4-6: Bug fixes (prioritize critical bugs)
- [ ] Day 7-8: CI/CD pipeline + monitoring
- [ ] Day 9-10: App Store submission, final polish
- [ ] Day 11-14: LAUNCH WEEK
  - [ ] Beta user onboarding (10-20 users)
  - [ ] Monitor Sentry for errors
  - [ ] Daily check-ins with beta users (WhatsApp group)
  - [ ] Fix critical bugs within 24 hours
- [ ] Friday Week 12: Sprint review + retrospective

**Week 12 Milestone: 🚀 MVP LAUNCH**
- **Target:** 10-20 beta users onboarded and actively using app
- **Success Criteria:**
  - 99%+ uptime (UptimeRobot)
  - <3 critical bugs open (Sentry)
  - >10 beta users created at least 1 work order
  - Positive feedback from beta users ("easier than Arthur Online")

---

## Sprint Retrospective Template

After each sprint, conduct a 30-minute retrospective:

### What Went Well? ✅
- [Developer lists 3 things that went well]

### What Didn't Go Well? ⚠️
- [Developer lists 3 challenges or blockers]

### What Will We Do Differently Next Sprint? 🔄
- [Action items for improvement]

### Velocity Analysis 📊
- **Planned story points:** [e.g., 50]
- **Completed story points:** [e.g., 45]
- **Velocity:** [90%]
- **Adjustment for next sprint:** [If <80%, reduce scope by 10-20%]

---

## Sprint Health Indicators

Track weekly:

| Indicator | Green ✅ | Yellow ⚠️ | Red 🚨 |
|-----------|---------|----------|--------|
| **Velocity** | >90% of planned points | 70-90% | <70% |
| **Critical Bugs** | 0-2 | 3-5 | >5 |
| **Developer Hours** | 20-30/week | 30-35/week | >35/week (burnout risk) |
| **AWS Costs** | <£100/month | £100-150/month | >£150/month |
| **Sprint Progress** | On track | 1-2 days behind | >3 days behind |

**Action Required When Red:**
- **Velocity <70%:** Emergency meeting, cut scope immediately
- **>5 Critical Bugs:** Stop new features, focus on bug fixes
- **>35 Hours/Week:** Developer burnout risk, enforce 1-day break
- **AWS >£150/month:** Cost optimization required (downsize instances)
- **>3 Days Behind:** Call Go/No-Go meeting, consider extending sprint

---

**Last Updated:** 2025-10-27
**Next Review:** After each sprint (every 2 weeks)
**Document Owner:** John (PM)
