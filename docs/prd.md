# Product Requirements Document: RightFit Services MVP

**Version:** 1.0
**Date:** 2025-10-27
**Author:** Sarah Chen (Product Owner)
**Project:** RightFit Services - Property Maintenance SaaS for UK Landlords
**Timeline:** 12 weeks (6 x 2-week sprints)
**Target:** Solo Developer Build

---

## 1. Product Overview

### 1.1 Product Vision

RightFit Services is a **mobile-first property maintenance SaaS platform** designed to help UK landlords (managing 1-50 properties) efficiently track maintenance, coordinate contractors, and stay compliant with UK regulations. Our core differentiator is **rock-solid offline functionality** that enables landlords to create work orders, upload photos, and manage properties from remote locations (e.g., Scottish Highlands, rural cottages) without internet connectivity, with automatic sync when connection is restored.

**Positioning Statement:** "Arthur Online reliability without the outages, at half the price"

**Core Value Proposition:**
- **99.5%+ uptime guarantee** (vs. Arthur Online's frequent outages)
- **Mobile-first design** with native iOS/Android apps (vs. Landlord Vision's web-only approach)
- **Offline-first architecture** using WatermelonDB (unique in market)
- **Affordable pricing** at £15-25/month (vs. Arthur Online's £62.50-126/month)
- **Basic AI assistance** for photo quality checks (brightness, blur detection)

### 1.2 Target Users

**Primary Persona: Jamie - Cabin Owner (Scottish Highlands)**
- **Demographics:** 38 years old, manages 3 short-term rental cabins
- **Pain Points:**
  - Unreliable mobile signal in remote locations
  - Needs to create work orders during guest stays without internet
  - Frustrated with Arthur Online's frequent downtime during peak season
- **Jobs to Be Done:** "When I discover a maintenance issue during a property inspection, I need to immediately create a work order with photos and assign a contractor, even if I have no mobile signal, so that repairs don't get forgotten or delayed."

**Secondary Persona: Sarah - Professional Cleaning Company Owner**
- **Demographics:** 42 years old, runs cleaning company with 8 employees serving 25 properties
- **Pain Points:**
  - Needs efficient batch invoicing for multiple properties
  - Requires contractor coordination across multiple sites
  - Wants photo evidence of cleaning completion
- **Jobs to Be Done:** "When my team completes cleaning jobs, I need to automatically generate invoices and track completion with photos, so I can bill landlords accurately without manual admin work."

**Tertiary Persona: Mark - First-Time STR Landlord**
- **Demographics:** 29 years old, recently converted 1 cottage to short-term rental
- **Pain Points:**
  - Overwhelmed by complex property management software
  - Needs simple compliance tracking (Gas Safe, EPC, etc.)
  - Wants guidance on maintenance schedules
- **Jobs to Be Done:** "When I need to track compliance certificates, I need simple reminders and document storage, so I don't get fined or have bookings cancelled due to expired certificates."

### 1.3 Market Context

**Total Addressable Market (TAM):** UK private landlords managing 1-50 properties
- 4.6M private rental households in UK
- Estimated £175M - £1.6B TAM at £15-25/month pricing

**Competitive Landscape:**
1. **Arthur Online** - Market leader but unreliable (frequent outages), expensive (£62.50-126/month), no native mobile app
2. **Landlord Vision** - Complex, web-only, no mobile app, £12-20/month
3. **Landlord Studio** - Basic features, mobile app exists but limited offline functionality, £8-15/month

**Our Differentiators:**
- Only solution with true offline-first mobile architecture
- Native mobile apps (React Native) with full feature parity to web
- Middle-market pricing with premium reliability
- Purpose-built for small-to-medium portfolio landlords (1-50 properties)

### 1.4 Success Metrics

**MVP Launch Targets (Month 3):**
- 10-20 beta users actively using the platform
- 95% of beta users successfully create work orders on mobile app
- 80% of beta users utilize offline mode at least once
- NPS (Net Promoter Score) ≥ 40

**6-Month Targets:**
- 50-100 paying customers
- £750-2,000 Monthly Recurring Revenue (MRR)
- 90-day retention rate ≥ 75%
- Average time to create work order <60 seconds
- Mobile app usage ≥ 60% of total sessions

**12-Month Targets:**
- 200-500 paying customers
- £4,000-12,500 MRR
- Customer Acquisition Cost (CAC) ≤ £150
- Lifetime Value (LTV) ≥ £450 (LTV:CAC ratio of 3:1)
- App Store rating ≥ 4.5 stars (iOS and Android)

**Technical Performance KPIs:**
- API uptime: 99.5%+ (measured monthly)
- Mobile app crash rate: <1% of sessions
- Offline sync success rate: ≥ 95%
- Average API response time: <500ms (p95)
- Mobile interaction response time: <100ms
- Time to first content load: <2 seconds

**User Engagement Metrics:**
- Daily Active Users (DAU) / Monthly Active Users (MAU) ratio: ≥ 30%
- Average work orders created per user per month: ≥ 8
- Photo uploads per work order: ≥ 2
- Contractor assignment rate: ≥ 70% of work orders

**Revenue Metrics:**
- Average Revenue Per User (ARPU): £15-25/month
- Gross Churn Rate: <5% monthly
- Payment failure rate: <2%

---

## 2. User Stories & Acceptance Criteria

This section details all 10 MVP features with comprehensive acceptance criteria and technical specifications.

### 2.1 Feature 1: Property Management

**User Story:** As a landlord, I want to create and manage properties with full details (address, type, tenants), so that I can organize my portfolio and track maintenance per property.

**Priority:** CRITICAL (Sprint 1)

**Acceptance Criteria:**

**AC-1.1: Create Property**
- GIVEN user is authenticated
- WHEN user taps "Add Property" FAB (React Native Paper, bottom-right, backgroundColor: #2563EB)
- THEN display Create Property form with fields:
  - `name` (TextInput, required, max 100 chars)
  - `address` (TextInput, required, max 255 chars, multiline: 3 rows)
  - `postcode` (TextInput, required, UK validation: `^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$`)
  - `property_type` (Dropdown: HOUSE, FLAT, COTTAGE, COMMERCIAL)
  - `bedrooms` (NumberInput, min: 0, max: 50)
  - `bathrooms` (NumberInput, min: 0, max: 20)
- AND submit to `POST /api/properties`
- AND display SnackBar: "Property created successfully"
- AND navigate to Property Detail screen

**AC-1.2: List Properties**
- GIVEN user has properties
- WHEN user views Properties screen
- THEN display FlatList of PropertyCard:
  - Shows: name, address, property_type badge, work order count
  - Sort by created_at DESC
- AND enable pull-to-refresh (RefreshControl)
- AND implement pagination (20 items per page)

**AC-1.3: View Property Details**
- GIVEN user taps PropertyCard
- THEN display:
  - Property details (name, address, type, bedrooms, bathrooms)
  - Tabbed interface: Work Orders | Compliance | Photos
- AND show Edit/Delete IconButtons

**AC-1.4: Soft Delete Property**
- GIVEN user confirms deletion
- THEN submit to `DELETE /api/properties/:id`
- AND API sets `deleted_at` timestamp (soft delete, preserves data)

**Edge Cases:**
- User deletes property with active work orders → Show warning with work order count
- User accesses property from different tenant → API returns 404

---

### 2.2 Feature 2: Work Order Management

**User Story:** As a landlord, I want to create work orders with priority levels, assign contractors, and track status, so that I efficiently manage maintenance tasks.

**Priority:** CRITICAL (Sprint 2)

**Acceptance Criteria:**

**AC-2.1: Create Work Order (Mobile)**
- GIVEN user on Property Detail screen
- WHEN user taps "Create Work Order" FAB
- THEN display form with:
  - `title` (TextInput, required, max 255 chars)
  - `description` (TextInput, multiline: 5 rows, max 2000 chars)
  - `priority` ButtonGroup (3 buttons, 60x60px, borderRadius: 8):
    - LOW (green #16A34A)
    - MEDIUM (orange #F59E0B)
    - HIGH (red #DC2626)
  - `contractor_id` (Autocomplete, searchable, optional)
  - `due_date` (DatePicker, optional, minDate: today)
  - Photo upload section
- AND submit to `POST /api/work-orders` with property_id

**AC-2.2: List Work Orders**
- THEN display FlatList of WorkOrderCard:
  - Card has left border (4px, priority color)
  - Shows: title, status badge, priority, property name, contractor, due date, photo count
  - Sort by priority DESC, created_at DESC
- AND enable filtering (BottomSheet): status, priority, property, contractor
- AND pagination (20 items)

**AC-2.3: Update Work Order Status**
- WHEN user taps Status badge
- THEN show BottomSheet with Radio buttons: OPEN, IN_PROGRESS, COMPLETED, CANCELLED
- IF status = COMPLETED: Show Dialog for completion note, set completed_at
- IF status = CANCELLED: Require cancellation reason
- AND submit to `PATCH /api/work-orders/:id`

**AC-2.4: Assign Contractor**
- WHEN user assigns contractor AND contractor has phone
- THEN show Dialog: "Send SMS notification?"
- On Yes, trigger `POST /api/notifications/sms`

**Edge Cases:**
- Contractor has 10+ active work orders → Show warning
- Work order overdue 7+ days → Display red "OVERDUE" badge
- Create while offline → Queue in WatermelonDB sync (see Feature 3)

---

### 2.3 Feature 3: Offline Mode (CRITICAL)

**User Story:** As a landlord in remote locations, I want to create work orders offline, so that poor signal doesn't prevent capturing urgent issues.

**Priority:** CRITICAL (Sprint 4 - Most complex)

**Acceptance Criteria:**

**AC-3.1: Offline Detection**
- Use NetInfo module for network status
- Display yellow banner when offline: "You're offline. Changes will sync automatically."
- Store status in React Context

**AC-3.2: WatermelonDB Setup**
- Database: `rightfit.db`
- Tables: properties, work_orders, contractors, certificates, photos
- Fields: id, tenant_id, created_at, updated_at, deleted_at, is_synced
- On first launch: Fetch all data from API, hydrate WatermelonDB
- WatermelonDB = single source of truth for UI

**AC-3.3: Offline Create**
- Generate UUID client-side
- Store in WatermelonDB with `is_synced: false`
- Add to sync_queue table:
  - operation (CREATE/UPDATE/DELETE)
  - entity_type (PROPERTY/WORK_ORDER/etc)
  - entity_id, payload (JSON), attempts, timestamps
- Show "cloud-off" icon, "Pending sync" badge
- SnackBar: "Saved locally. Will sync when online."

**AC-3.4: Offline Photo Upload**
- Store in device: `${FileSystem.documentDirectory}/photos/${uuid}.jpg`
- Store metadata in WatermelonDB photos table with local file_path
- Add PHOTO_UPLOAD to sync_queue

**AC-3.5: Background Sync Processor**
- Trigger on: offline→online transition, app resume, manual pull-to-refresh
- Algorithm:
  1. Query sync_queue (FIFO, created_at ASC)
  2. For each entry, execute API call (POST/PATCH/DELETE)
  3. On success: Update WatermelonDB, set is_synced=true, remove from queue
  4. On failure: Increment attempts, exponential backoff (2^attempts seconds)
  5. After 5 attempts: Move to sync_errors table
- Display progress SnackBar: "Syncing 3 of 10 items..."

**AC-3.6: Conflict Resolution**
- MVP: LAST-WRITE-WINS (server updated_at > client updated_at)
- Warn user if local changes overwritten

**AC-3.7: Sync Errors UI**
- Settings → "Sync Errors" button (if errors exist)
- Show BottomSheet: entity_type, operation, error message, attempts
- Actions: Retry Now | View Details | Discard

**Performance Requirements:**
- Sync ≥10 operations/second when online
- WatermelonDB queries <50ms (≤1000 records)
- Offline create feels instant (<100ms UI update)
- Photos compressed to ≤1MB

**Edge Cases:**
- Create then delete offline → Remove CREATE from queue (no API calls)
- Edit 10 times offline → Single UPDATE with latest payload
- Create work order + 5 photos offline → Sync work order first, then photos with correct work_order_id
- 401 during sync → Trigger re-auth, don't retry until new token

---

### 2.4 Feature 4: Photo Management with AI Quality Checks

**User Story:** As a landlord, I want to capture photos with automatic quality checks, so that I have clear visual evidence of maintenance issues.

**Priority:** HIGH (Sprint 2 basic, Sprint 5 AI)

**Acceptance Criteria:**

**AC-4.1: Photo Capture**
- WHEN user taps "Add Photo" on work order form
- THEN show ActionSheet: "Take Photo" | "Choose from Gallery" | "Cancel"
- Use expo-camera / expo-image-picker
- Compress to max 1920x1080px, JPEG quality 0.85, ≤1MB
- Allow up to 10 photos per work order

**AC-4.2: Photo Upload (Online)**
- Submit to `POST /api/photos/upload` (multipart/form-data)
- API uploads to S3: `rightfit-photos-{env}/{tenant_id}/{uuid}.jpg`
- Returns: uploaded_url, ai_quality_score, ai_brightness_score
- Show ProgressBar during upload

**AC-4.3: AI Quality Checks (Google Vision API)**
- API sends S3 URL to Google Vision API (IMAGE_PROPERTIES)
- Calculate scores:
  - brightness_score: 0-100 (40-80 = good, <20 or >90 = bad)
  - overall_quality_score: brightness * 0.6 + blur * 0.4
- IF quality < 50: Send push notification "Photo may be too dark/blurry"
- Display quality indicator:
  - 80-100: Green "High quality"
  - 50-79: Orange "Acceptable"
  - 0-49: Red "Poor quality - retake"

**AC-4.4: Photo Gallery**
- Horizontal ScrollView with 100x100px thumbnails
- Tap for full-screen viewer (react-native-image-viewing)
- Pinch-to-zoom, swipe navigation
- Actions: Delete | Share

---

### 2.5 Feature 5: Contractor Database

**User Story:** As a landlord, I want to maintain a contractor database with contact details and trades, so that I can quickly assign the right person to work orders.

**Priority:** MEDIUM (Sprint 2)

**Acceptance Criteria:**

**AC-5.1: Create Contractor**
- Form fields:
  - `name` (required, max 100 chars)
  - `trade` (Dropdown: Plumber, Electrician, Gas Engineer, Carpenter, Cleaner, Gardener, Handyman, Other/custom)
  - `company_name` (optional, max 100 chars)
  - `phone` (required, UK format: `^(\+44|0)\d{10}$`)
  - `email` (optional, email validation)
  - `notes` (optional, max 500 chars)
- Submit to `POST /api/contractors`

**AC-5.2: List Contractors**
- FlatList of ContractorCard:
  - Shows: name, trade badge, company, phone, active jobs count
  - Sort by name ASC
- SearchBar (name, trade, company)
- Filter by trade (BottomSheet)

**AC-5.3: View Contractor Details**
- Display: name, trade, company, phone (tappable to call), email, notes
- Work Orders section: All assigned work orders
- Stats: Total jobs, Completed, Avg completion time
- Actions: Edit | Delete | Call | Send SMS

**AC-5.4: Delete Contractor**
- IF has active work orders: Show warning "[N] active work orders will be unassigned"
- Soft delete (set deleted_at)
- Unassign from all work orders (contractor_id = null)

---

### 2.6 Feature 6: UK Compliance Tracking

**User Story:** As a UK landlord, I want to track compliance certificates with expiry dates and reminders, so that I stay legally compliant.

**Priority:** MEDIUM (Sprint 5)

**Acceptance Criteria:**

**AC-6.1: Certificate Types & Validity**
- Supported types (enum):
  - GAS_SAFE (12 months)
  - EPC (10 years)
  - EICR (5 years)
  - PAT (12 months)
  - FIRE_ALARM, CARBON_MONOXIDE, LEGIONELLA, HMO_LICENSE (12 months each)

**AC-6.2: Create Certificate**
- Form: certificate_type, issue_date, expiry_date (auto-calc + override), issuer_name, certificate_number, notes
- Document upload (PDF/image, ≤10MB) → S3: `rightfit-certificates-{env}`
- Submit to `POST /api/certificates` with property_id

**AC-6.3: List Certificates**
- Property Detail → Compliance tab shows CertificateCard:
  - Type badge, expiry status (VALID/EXPIRING_SOON/EXPIRED)
  - Color-coded: green (>30 days), orange (0-30 days), red (expired)
  - Shows: issuer, dates, "View Document" button
  - Sort by expiry_date ASC

**AC-6.4: Expiry Notifications**
- Push notifications at: 30 days, 7 days, 0 days (expiry), 7 days overdue
- Messages: "Your [type] for [property] expires in X days!"

**AC-6.5: Renew Certificate**
- Pre-fill form with same type, property, issuer
- issue_date = today, expiry_date auto-calculated
- Creates NEW certificate, optionally marks old as superseded

---

### 2.7 Feature 7: Authentication & Multi-Tenancy

**User Story:** As a system admin, I want secure authentication with multi-tenant data isolation, so that each landlord's data is private.

**Priority:** CRITICAL (Sprint 1 - Foundation)

**Acceptance Criteria:**

**AC-7.1: User Registration**
- Form: email, password (min 8 chars, 1 upper, 1 lower, 1 number, 1 special), confirm_password, full_name, company_name
- Show password strength indicator
- Terms & Privacy checkboxes (required)
- Submit to `POST /api/auth/register`
- API creates Tenant + User (role=ADMIN), returns JWT tokens
- Store tokens in expo-secure-store

**AC-7.2: User Login**
- Form: email, password, "Remember me" checkbox
- Submit to `POST /api/auth/login`
- Returns: access_token (1 hour), refresh_token (30 days)
- On failure (401): "Invalid email or password"
- After 5 failed attempts: Show CAPTCHA

**AC-7.3: JWT Structure**
- access_token payload: user_id, tenant_id, email, role, iat, exp (1 hour)
- refresh_token payload: user_id, tenant_id, iat, exp (30 days)
- Signed with HS256 + JWT_SECRET (256-bit)

**AC-7.4: Token Refresh**
- When access_token expires: Auto-submit refresh_token to `POST /api/auth/refresh`
- Returns new access_token, retries original request
- On refresh failure: Clear storage, navigate to Login

**AC-7.5: Multi-Tenancy Isolation**
- ALL API endpoints use tenantMiddleware (extracts tenant_id from JWT)
- ALL Prisma queries: `where: { tenant_id: req.user.tenant_id, deleted_at: null }`
- NO cross-tenant data access

**AC-7.6: Password Reset**
- "Forgot Password" → Enter email → `POST /api/auth/forgot-password`
- API generates reset token (UUID, expires 1 hour), emails link
- User clicks link → Reset Password form → `POST /api/auth/reset-password`
- Updates password (bcrypt), marks token as used

**Security:**
- bcrypt hash (salt rounds: 10)
- HTTPS enforced
- Rate limiting: Login 5/15min, Register 3/hour, Reset 3/hour

---

### 2.8 Feature 8: Payment Processing (Stripe)

**User Story:** As a landlord, I want to subscribe monthly via Stripe, so that I can access the platform securely.

**Priority:** MEDIUM (Sprint 6 - Launch)

**Acceptance Criteria:**

**AC-8.1: Subscription Plans**
- **Starter**: £15/month, up to 10 properties
- **Professional**: £25/month, up to 50 properties
- Both: Unlimited work orders/contractors, mobile+web, email support

**AC-8.2: Free Trial**
- 14 days, no credit card, full Professional features
- Show "Trial: X days left" badge
- Notifications at 7 days, 3 days, 0 days
- After trial: Read-only mode + "Subscribe Now" banner

**AC-8.3: Subscription Flow**
- User selects plan → `POST /api/payments/create-checkout-session`
- API creates Stripe Checkout Session, returns checkout_url
- Open in WebView/browser
- On success: Redirect to `rightfit://subscription-success`
- Show success screen, refresh subscription status

**AC-8.4: Stripe Webhooks**
- Listen at `POST /api/webhooks/stripe`, verify signature
- Events:
  - `checkout.session.completed`: Create Subscription record, set status=ACTIVE
  - `invoice.payment_succeeded`: Extend current_period_end
  - `invoice.payment_failed`: Set status=PAST_DUE, send notification, after 3 attempts → CANCELLED
  - `customer.subscription.deleted`: Set status=CANCELLED, 30-day read-only grace

**AC-8.5: Manage Subscription**
- Settings → "Manage Subscription" → `POST /api/payments/create-portal-session`
- Open Stripe Customer Portal (update payment, view invoices, cancel, upgrade/downgrade)

**AC-8.6: Enforce Limits**
- Starter: Max 10 properties (API returns 403 on 11th)
- Professional: Max 50 properties
- Show "Upgrade Plan" button on limit error

---

### 2.9 Feature 9: SMS Notifications (Twilio)

**User Story:** As a landlord, I want to send SMS to contractors when assigning work orders, so they receive immediate alerts.

**Priority:** MEDIUM (Sprint 2)

**Acceptance Criteria:**

**AC-9.1: Send SMS**
- Trigger: User taps "Send SMS" when assigning contractor OR on Contractor Detail
- Show Dialog with message template (editable):
  - "Hi [name], I've assigned you to: [title]. Property: [property]. Priority: [priority]. Check app."
- Submit to `POST /api/notifications/sms` with to_phone, message, work_order_id, contractor_id
- API calls Twilio:
  ```javascript
  twilio.messages.create({
    body: message,
    from: TWILIO_PHONE_NUMBER,
    to: to_phone
  });
  ```
- Log to database: to_phone, message_body, twilio_message_sid, status, sent_at
- SnackBar: "SMS sent to [contractor]"

**AC-9.2: SMS Status Webhooks**
- Listen at `POST /api/webhooks/twilio`
- Update status: SENT, DELIVERED, FAILED

**AC-9.3: Rate Limiting**
- Max 10 SMS/hour per user
- Max 100 SMS/day per tenant
- On exceed: Return 429 "SMS rate limit exceeded"

**AC-9.4: Opt-Out**
- SMS footer: "Reply STOP to opt out" (Twilio auto-handles)
- Store opt_out in contractors table
- Show "(Opted out)" badge, prevent SMS sending

---

### 2.10 Feature 10: Push Notifications

**User Story:** As a landlord, I want push notifications for important events, so I stay informed without checking the app.

**Priority:** MEDIUM (Sprint 5)

**Acceptance Criteria:**

**AC-10.1: Setup**
- Request permissions on first launch (expo-notifications)
- Obtain Expo Push Token
- Submit to `POST /api/devices/register` with push_token, device_id, platform
- Store in devices table: user_id, tenant_id, push_token, platform

**AC-10.2: Notification Triggers**
- Certificate expiring (30d, 7d, 0d, 7d overdue)
- Photo quality alert (AI score <50)
- Subscription ending (trial/payment issues)

**AC-10.3: Send Push**
- API queries devices table for user's push_tokens
- Construct payload:
  ```javascript
  {
    to: push_token,
    title: 'Certificate Expiring Soon',
    body: 'Your Gas Safe for 123 Main St expires in 7 days!',
    data: { type: 'CERTIFICATE_EXPIRY', certificate_id, property_id, deep_link },
    badge: 1,
    priority: 'high'
  }
  ```
- POST to Expo API: `https://exp.host/--/api/v2/push/send`
- Log to notifications table: user_id, type, title, body, sent_at, read_at

**AC-10.4: Notification Inbox**
- Main tab with bell icon + unread badge
- FlatList of NotificationCard (title, body, timestamp, type icon, read/unread)
- Tap → Mark as read, navigate to deep_link

**AC-10.5: Deep Linking**
- Handle: `rightfit://properties/:id`, `rightfit://work-orders/:id`, etc.
- Configure scheme in app.json: `"scheme": "rightfit"`

**AC-10.6: Preferences**
- Settings toggles: Certificate reminders, Photo alerts, Work order updates, Billing alerts, Marketing
- Store in user_notification_preferences table
- API checks before sending (except critical billing)

**AC-10.7: Badge Management**
- Update badge count on: new notification (+1), read (-1), mark all read (0)
- Use expo-notifications.setBadgeCountAsync()

---

## 3. Data Models & Relationships

This section defines the database schema using Prisma ORM. All models include multi-tenancy (`tenant_id`) and soft delete (`deleted_at`) patterns.

### 3.1 Core Models

**Tenant** (Multi-tenancy root)
```prisma
model Tenant {
  id                    String    @id @default(uuid())
  tenant_name           String    @db.VarChar(100)
  subscription_status   SubscriptionStatus @default(TRIAL)
  trial_ends_at         DateTime?
  created_at            DateTime  @default(now())
  updated_at            DateTime  @updatedAt

  // Relations
  users                 User[]
  properties            Property[]
  work_orders           WorkOrder[]
  contractors           Contractor[]
  certificates          Certificate[]
  subscriptions         Subscription[]
}

enum SubscriptionStatus {
  TRIAL
  ACTIVE
  PAST_DUE
  CANCELLED
}
```

**User**
```prisma
model User {
  id                String    @id @default(uuid())
  tenant_id         String
  email             String    @unique @db.VarChar(255)
  password_hash     String    @db.VarChar(255)
  full_name         String    @db.VarChar(100)
  role              UserRole  @default(ADMIN)
  created_at        DateTime  @default(now())
  updated_at        DateTime  @updatedAt
  deleted_at        DateTime?

  tenant            Tenant    @relation(fields: [tenant_id], references: [id])
  devices           Device[]
  notifications     Notification[]

  @@index([tenant_id])
  @@index([email])
}

enum UserRole {
  ADMIN
  MEMBER
}
```

**Property**
```prisma
model Property {
  id                String    @id @default(uuid())
  tenant_id         String
  name              String    @db.VarChar(100)
  address           String    @db.VarChar(255)
  postcode          String    @db.VarChar(10)
  property_type     PropertyType
  bedrooms          Int       @default(0)
  bathrooms         Int       @default(0)
  created_at        DateTime  @default(now())
  updated_at        DateTime  @updatedAt
  deleted_at        DateTime?

  tenant            Tenant    @relation(fields: [tenant_id], references: [id])
  work_orders       WorkOrder[]
  certificates      Certificate[]

  @@index([tenant_id])
  @@index([tenant_id, deleted_at])
}

enum PropertyType {
  HOUSE
  FLAT
  COTTAGE
  COMMERCIAL
}
```

**WorkOrder**
```prisma
model WorkOrder {
  id                String    @id @default(uuid())
  tenant_id         String
  property_id       String
  contractor_id     String?
  title             String    @db.VarChar(255)
  description       String?   @db.Text
  priority          Priority  @default(MEDIUM)
  status            WorkOrderStatus @default(OPEN)
  due_date          DateTime?
  completed_at      DateTime?
  completion_note   String?   @db.VarChar(500)
  cancellation_reason String? @db.VarChar(500)
  created_at        DateTime  @default(now())
  updated_at        DateTime  @updatedAt
  deleted_at        DateTime?

  tenant            Tenant    @relation(fields: [tenant_id], references: [id])
  property          Property  @relation(fields: [property_id], references: [id])
  contractor        Contractor? @relation(fields: [contractor_id], references: [id])
  photos            Photo[]

  @@index([tenant_id])
  @@index([tenant_id, status])
  @@index([property_id])
  @@index([contractor_id])
}

enum Priority {
  LOW
  MEDIUM
  HIGH
}

enum WorkOrderStatus {
  OPEN
  IN_PROGRESS
  COMPLETED
  CANCELLED
}
```

**Contractor**
```prisma
model Contractor {
  id                String    @id @default(uuid())
  tenant_id         String
  name              String    @db.VarChar(100)
  trade             String    @db.VarChar(50)
  company_name      String?   @db.VarChar(100)
  phone             String    @db.VarChar(20)
  email             String?   @db.VarChar(255)
  notes             String?   @db.VarChar(500)
  sms_opt_out       Boolean   @default(false)
  created_at        DateTime  @default(now())
  updated_at        DateTime  @updatedAt
  deleted_at        DateTime?

  tenant            Tenant    @relation(fields: [tenant_id], references: [id])
  work_orders       WorkOrder[]

  @@index([tenant_id])
  @@index([tenant_id, trade])
}
```

**Certificate**
```prisma
model Certificate {
  id                String    @id @default(uuid())
  tenant_id         String
  property_id       String
  certificate_type  CertificateType
  issue_date        DateTime
  expiry_date       DateTime
  issuer_name       String    @db.VarChar(100)
  certificate_number String?  @db.VarChar(50)
  document_url      String?   @db.VarChar(500)
  notes             String?   @db.VarChar(500)
  created_at        DateTime  @default(now())
  updated_at        DateTime  @updatedAt
  deleted_at        DateTime?

  tenant            Tenant    @relation(fields: [tenant_id], references: [id])
  property          Property  @relation(fields: [property_id], references: [id])

  @@index([tenant_id])
  @@index([property_id])
  @@index([expiry_date])
}

enum CertificateType {
  GAS_SAFE
  EPC
  EICR
  PAT
  FIRE_ALARM
  CARBON_MONOXIDE
  LEGIONELLA
  HMO_LICENSE
}
```

**Photo**
```prisma
model Photo {
  id                String    @id @default(uuid())
  tenant_id         String
  work_order_id     String
  uploaded_url      String    @db.VarChar(500)
  file_size_bytes   Int
  width_px          Int?
  height_px         Int?
  ai_quality_score  Decimal?  @db.Decimal(5, 2)
  ai_brightness_score Decimal? @db.Decimal(5, 2)
  ai_blur_score     Decimal?  @db.Decimal(5, 2)
  ai_checked_at     DateTime?
  created_at        DateTime  @default(now())
  deleted_at        DateTime?

  work_order        WorkOrder @relation(fields: [work_order_id], references: [id])

  @@index([tenant_id])
  @@index([work_order_id])
}
```

### 3.2 Payment Models

**Subscription**
```prisma
model Subscription {
  id                    String    @id @default(uuid())
  tenant_id             String
  stripe_customer_id    String    @unique @db.VarChar(255)
  stripe_subscription_id String   @unique @db.VarChar(255)
  plan                  SubscriptionPlan
  status                SubscriptionStatus
  current_period_start  DateTime
  current_period_end    DateTime
  created_at            DateTime  @default(now())
  updated_at            DateTime  @updatedAt

  tenant                Tenant    @relation(fields: [tenant_id], references: [id])

  @@index([tenant_id])
  @@index([stripe_customer_id])
}

enum SubscriptionPlan {
  STARTER
  PROFESSIONAL
}
```

### 3.3 Notification Models

**Device**
```prisma
model Device {
  id                String    @id @default(uuid())
  user_id           String
  tenant_id         String
  push_token        String    @db.VarChar(255)
  device_id         String    @db.VarChar(255)
  platform          DevicePlatform
  is_active         Boolean   @default(true)
  registered_at     DateTime  @default(now())

  user              User      @relation(fields: [user_id], references: [id])

  @@unique([device_id, user_id])
  @@index([user_id])
}

enum DevicePlatform {
  IOS
  ANDROID
}
```

**Notification**
```prisma
model Notification {
  id                String    @id @default(uuid())
  user_id           String
  tenant_id         String
  notification_type NotificationType
  title             String    @db.VarChar(255)
  body              String    @db.Text
  data              Json?
  sent_at           DateTime  @default(now())
  read_at           DateTime?

  user              User      @relation(fields: [user_id], references: [id])

  @@index([user_id, read_at])
  @@index([tenant_id])
}

enum NotificationType {
  CERTIFICATE_EXPIRY
  PHOTO_QUALITY
  WORK_ORDER_ASSIGNED
  SUBSCRIPTION_ENDING
  PAYMENT_FAILED
  SYSTEM_ANNOUNCEMENT
}
```

**SmsLog**
```prisma
model SmsLog {
  id                String    @id @default(uuid())
  tenant_id         String
  to_phone          String    @db.VarChar(20)
  message_body      String    @db.Text
  twilio_message_sid String?  @db.VarChar(255)
  status            SmsStatus @default(QUEUED)
  sent_at           DateTime  @default(now())
  delivered_at      DateTime?
  error_message     String?   @db.Text

  @@index([tenant_id])
  @@index([twilio_message_sid])
}

enum SmsStatus {
  QUEUED
  SENT
  DELIVERED
  FAILED
}
```

### 3.4 Offline Sync Models (WatermelonDB only)

These tables exist only in WatermelonDB on the mobile client for offline functionality:

**sync_queue** (Mobile only)
```typescript
// WatermelonDB schema (not Prisma)
{
  id: uuid,
  operation: 'CREATE' | 'UPDATE' | 'DELETE' | 'PHOTO_UPLOAD',
  entity_type: 'PROPERTY' | 'WORK_ORDER' | 'CONTRACTOR' | 'CERTIFICATE' | 'PHOTO',
  entity_id: uuid,
  payload: json,
  attempts: number,
  last_attempt_at: timestamp?,
  created_at: timestamp
}
```

**sync_errors** (Mobile only)
```typescript
// WatermelonDB schema (not Prisma)
{
  id: uuid,
  operation: string,
  entity_type: string,
  entity_id: uuid,
  payload: json,
  error_message: text,
  attempts: number,
  created_at: timestamp
}
```

### 3.5 Key Relationships

**Tenant → Users (1:N):** Each tenant has multiple users (team members, post-MVP)
**Tenant → Properties (1:N):** Each tenant owns multiple properties
**Property → WorkOrders (1:N):** Each property has multiple work orders
**Property → Certificates (1:N):** Each property has multiple compliance certificates
**Contractor → WorkOrders (1:N):** Each contractor can be assigned to multiple work orders
**WorkOrder → Photos (1:N):** Each work order can have multiple photos
**User → Devices (1:N):** Each user can have multiple devices registered for push notifications
**User → Notifications (1:N):** Each user receives multiple notifications

### 3.6 Data Integrity Rules

1. **Multi-Tenancy:** ALL models (except Tenant) have `tenant_id` foreign key
2. **Soft Delete:** ALL user-facing models have `deleted_at` timestamp (properties, work orders, contractors, certificates, photos)
3. **Cascade Behavior:**
   - Delete Property → Soft delete all associated WorkOrders and Certificates
   - Delete Contractor → Set contractor_id = null on all WorkOrders (unassign)
   - Delete WorkOrder → Soft delete all associated Photos
4. **Required Fields:**
   - Property: name, address, postcode, property_type
   - WorkOrder: title, priority, status, property_id
   - Contractor: name, trade, phone
   - Certificate: certificate_type, issue_date, expiry_date, issuer_name, property_id
5. **Validation:**
   - UK postcode format: `^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$`
   - UK phone format: `^(\+44|0)\d{10}$`
   - Email format: Standard email regex
   - Password: Min 8 chars, 1 upper, 1 lower, 1 number, 1 special

---

## 4. Workflows & User Flows

This section details the key user workflows and navigation flows. Each workflow is optimized for mobile-first interaction with ≤60 second completion time for critical paths.

### 4.1 Critical Workflow: Emergency Maintenance During Guest Stay (Offline)

**Goal:** Jamie (Scottish Highlands landlord) discovers a leak during property inspection with no mobile signal. Creates urgent work order offline in <60 seconds.

**Flow:**
1. **Open App** (while offline, yellow "Offline" banner appears at top)
2. **Tap "Properties" tab** → Properties list loads from WatermelonDB
3. **Tap "Cabin 2" PropertyCard** → Property Detail screen loads
4. **Tap "Create Work Order" FAB** → Create Work Order form appears
5. **Enter title:** "Leaking pipe in bathroom sink" (autocomplete suggests similar past issues)
6. **Tap HIGH priority button** (red, 60x60px) → Priority selected
7. **Tap "Add Photo"** → Camera opens
8. **Take 2 photos** of leak → Photos compress to <1MB, stored locally
9. **Tap "Assign Contractor"** → Contractor list loads from WatermelonDB
10. **Select "Highland Plumbing - John Smith"** → Contractor assigned
11. **Tap "Create Work Order"** button → Work order saved to WatermelonDB
    - SnackBar: "Saved locally. Will sync when online."
    - Work order shows "cloud-off" icon indicating pending sync
12. **Close app** → Work order remains in sync_queue
13. **1 hour later, return to civilization with mobile signal**
14. **App automatically detects online** → Background sync processor starts
    - SnackBar: "Syncing 1 of 3 items..." (work order + 2 photos)
    - API creates work order, uploads photos to S3, returns uploaded_urls
    - WatermelonDB updates with server data, sets is_synced=true
    - SnackBar: "All changes synced successfully"
15. **OPTIONAL: Tap "Send SMS to Contractor"** → SMS sent via Twilio

**Total Time:** 45 seconds (offline), plus automatic sync when online

**Success Criteria:**
- Work order created in <60 seconds even with no signal
- Photos captured and stored locally without upload errors
- Sync happens automatically without user intervention
- Contractor receives SMS notification once online

---

### 4.2 User Flow: First-Time User Onboarding

**Goal:** Mark (first-time landlord) registers, adds first property, creates first work order.

**Flow:**
1. **Download app** from App Store/Google Play
2. **Launch app** → Sign Up screen
3. **Enter registration details:**
   - Email: mark@example.com
   - Password: SecurePass123! (strength indicator shows "Strong")
   - Full name: Mark Johnson
   - Company name: (leave blank)
   - Check "I agree to Terms & Privacy" checkboxes
4. **Tap "Sign Up"** → API creates tenant + user, returns JWT tokens
   - SnackBar: "Welcome to RightFit Services!"
   - Navigate to App Home (Dashboard)
5. **See onboarding tour** (optional, skippable):
   - Screen 1: "Welcome! Let's add your first property"
   - Screen 2: "Create work orders in seconds"
   - Screen 3: "Works offline - no signal needed"
   - Screen 4: "Track compliance certificates"
6. **Tap "Add Property"** from Dashboard CTA
7. **Fill property form:**
   - Name: Rose Cottage
   - Address: 123 High Street, Cotswolds
   - Postcode: GL54 1AB (auto-validates)
   - Type: COTTAGE
   - Bedrooms: 2, Bathrooms: 1
8. **Tap "Create Property"** → Property Detail screen
9. **Tap "Create Work Order" FAB**
10. **Fill work order form:**
    - Title: Annual boiler service
    - Priority: MEDIUM (orange)
    - Due date: 2 weeks from now
11. **Tap "Create"** → Work Order Detail screen
    - SnackBar: "Work order created successfully"
12. **See empty state:** "No contractor assigned yet. Add a contractor?"
13. **Tap "Add Contractor"** → Create Contractor form
14. **Fill contractor details:**
    - Name: ABC Heating Services
    - Trade: Gas Engineer
    - Phone: 07123456789
15. **Tap "Create Contractor"** → Returns to Work Order Detail, contractor auto-assigned
    - SnackBar: "Contractor assigned successfully"
16. **See completion prompt:** "Send SMS notification to contractor?"
17. **Tap "Yes"** → SMS sent
    - SnackBar: "SMS sent to ABC Heating Services"

**Total Time:** ~5 minutes for complete onboarding

---

### 4.3 Workflow: Add Compliance Certificate with Document Upload

**Goal:** User adds Gas Safe certificate with PDF document to property.

**Flow:**
1. **Navigate to Property Detail** → Tap "Compliance" tab
2. **See empty state** or existing certificates
3. **Tap "Add Certificate" FAB**
4. **Fill certificate form:**
   - Type: GAS_SAFE (from dropdown)
   - Issue date: Select today from DatePicker
   - Expiry date: Auto-fills to 12 months from issue date (user can override)
   - Issuer name: "ABC Gas Services Ltd"
   - Certificate number: GS12345678 (optional)
   - Notes: "Annual service completed, all appliances passed"
5. **Tap "Upload Document"**
   - ActionSheet: "Take Photo" | "Choose from Files" | "Cancel"
   - User selects "Choose from Files"
   - File picker opens → User selects PDF from Downloads
6. **PDF preview shows** (react-native-pdf component)
7. **Tap "Create Certificate"** → Loading indicator
   - API uploads PDF to S3: `rightfit-certificates-prod/{tenant_id}/{uuid}.pdf`
   - API creates certificate record with document_url
   - SnackBar: "Certificate added successfully"
8. **Certificate appears in Compliance tab** with:
   - Type badge: "Gas Safe" (with flame icon)
   - Status: VALID (green background)
   - Expiry: 12 months from today
   - "View Document" button

**Automatic Follow-up:**
- **30 days before expiry:** Push notification "Your Gas Safe certificate expires in 30 days"
- **7 days before expiry:** Push notification "URGENT: Gas Safe certificate expires in 7 days"
- **On expiry:** Email + push notification "Gas Safe certificate has EXPIRED"

---

### 4.4 Workflow: Review and Pay for Subscription

**Goal:** User's 14-day trial is ending, subscribes to Starter plan.

**Flow:**
1. **Day 11 of trial** → Push notification: "Your trial ends in 3 days. Subscribe now to keep your data."
2. **User opens app** → Dashboard shows banner: "Trial ends in 3 days - Subscribe now"
3. **Tap banner** → Navigate to Subscription screen
4. **See plan comparison:**
   - Starter: £15/month, up to 10 properties
   - Professional: £25/month, up to 50 properties
5. **User has 2 properties** → Starter plan is sufficient
6. **Tap "Select Starter Plan"** → API creates Stripe Checkout Session
7. **Stripe hosted checkout page opens** in WebView:
   - Shows: Monthly charge £15
   - Form: Card number, Expiry, CVC, Postcode
8. **User enters payment details** → Taps "Subscribe"
9. **Stripe processes payment** → Redirects to `rightfit://subscription-success`
10. **App handles deep link:**
    - Success screen: "Subscription activated! 🎉"
    - Confetti animation (optional)
    - "Continue to Dashboard" button
11. **Stripe webhook fires:** `checkout.session.completed`
    - API creates Subscription record
    - Updates Tenant.subscription_status = ACTIVE
12. **User sees updated header:** "Subscribed" badge (green)
13. **Settings screen shows:**
    - Current plan: Starter
    - Next billing date: 30 days from today
    - Monthly cost: £15
    - "Manage Subscription" button

**Monthly Recurring:**
- **Every 30 days:** Stripe charges card automatically
- **If payment succeeds:** `invoice.payment_succeeded` webhook → Extend subscription
- **If payment fails:** `invoice.payment_failed` webhook → User notified, 3 retry attempts

---

### 4.5 Navigation Structure (Mobile App)

**Bottom Tab Navigator** (5 tabs):
1. **Dashboard (Home Icon)**
   - Quick stats: Active work orders, Expiring certificates, Properties count
   - Recent work orders (last 5)
   - Quick actions: "Create Work Order", "Add Property"

2. **Properties (Building Icon)**
   - FlatList of PropertyCard
   - SearchBar + filter options
   - FAB: "Add Property"

3. **Work Orders (Clipboard Icon with badge for open items)**
   - FlatList of WorkOrderCard
   - Filter BottomSheet: status, priority, property, contractor
   - FAB: "Create Work Order" (requires property selection)

4. **Contractors (People Icon)**
   - FlatList of ContractorCard
   - SearchBar + filter by trade
   - FAB: "Add Contractor"

5. **Settings (Gear Icon)**
   - Profile section: Name, email, "Edit Profile"
   - Subscription section: Plan, billing, "Manage Subscription"
   - Notification preferences toggles
   - "Sync Errors" (if any exist, shows badge)
   - "Help & Support"
   - "Log Out"

**Stack Navigators** (nested within tabs):
- **Properties Stack:** Properties List → Property Detail → Edit Property / Create Work Order
- **Work Orders Stack:** Work Orders List → Work Order Detail → Edit Work Order / Assign Contractor
- **Contractors Stack:** Contractors List → Contractor Detail → Edit Contractor / Send SMS

**Modal Screens** (overlay navigation):
- Create/Edit forms (full-screen modals with "Cancel" and "Save" buttons)
- Photo viewer (full-screen with swipe-to-dismiss)
- Subscription selection (modal with "Close" button)

---

### 4.6 Workflow: Handle Photo Quality Alert

**Goal:** User uploads dark photo, receives AI quality alert, retakes photo.

**Flow:**
1. **User creates work order** with 1 photo of dark basement
2. **Photo uploads to S3** → API triggers Google Vision API check
3. **AI analyzes photo:**
   - brightness_score = 18 (very dark, threshold is 40)
   - overall_quality_score = 27 (poor, threshold is 50)
4. **API sends push notification:**
   - Title: "Photo Quality Alert"
   - Body: "One of your photos may be too dark. Tap to retake."
   - Data: { work_order_id, photo_id, deep_link }
5. **User receives notification** → Taps it
6. **App opens to Work Order Detail** → Photo gallery shows photo with red warning badge
   - Badge: "Poor quality - consider retaking"
   - Quality score: 27/100 displayed
7. **User taps photo thumbnail** → Full-screen viewer opens
8. **Sees photo is indeed too dark** to see issue clearly
9. **Taps "Delete Photo" IconButton** → Confirmation dialog
10. **Confirms deletion** → Photo soft-deleted from DB
11. **Taps "Add Photo" on work order** → Camera opens
12. **Turns on flashlight** → Takes new photo with better lighting
13. **New photo uploads** → AI checks again:
    - brightness_score = 62 (good)
    - overall_quality_score = 78 (acceptable)
14. **Photo displays with orange badge:** "Acceptable quality"
15. **User satisfied** → Work order now has clear visual evidence

---

### 4.7 Offline Sync Edge Case: Conflict Resolution

**Goal:** User edits work order on mobile while offline, then edits same work order on web while online. Sync resolves conflict.

**Flow:**
1. **User on mobile (offline):**
   - Edits Work Order #123: Changes status from OPEN → IN_PROGRESS
   - Changes stored in WatermelonDB with is_synced=false
   - UPDATE operation added to sync_queue
   - updated_at = 2025-10-27T10:00:00Z (local timestamp)

2. **Same user on web browser (online):**
   - Edits same Work Order #123: Changes priority from MEDIUM → HIGH
   - API updates database directly
   - Server sets updated_at = 2025-10-27T10:05:00Z (server timestamp)

3. **User's mobile device comes online** → Sync processor starts
   - Attempts to PATCH /api/work-orders/123 with mobile changes
   - Request payload: { status: 'IN_PROGRESS', updated_at: '2025-10-27T10:00:00Z' }

4. **API detects conflict:**
   - Server updated_at (10:05:00) > Client updated_at (10:00:00)
   - **Conflict resolution strategy: LAST-WRITE-WINS**
   - Server changes take precedence (priority=HIGH wins)
   - Client changes are discarded (status remains OPEN)

5. **API returns 409 Conflict** with latest server data:
   - Response: { conflict: true, latest_data: { status: 'OPEN', priority: 'HIGH', updated_at: '...' } }

6. **Mobile app handles conflict:**
   - Updates WatermelonDB with server data (overwrites local changes)
   - Shows notification: "Your changes to Work Order #123 were overwritten by a more recent update"
   - Logs conflict to analytics for future improvement

7. **User sees updated work order:**
   - Status: OPEN (server version, user's mobile change lost)
   - Priority: HIGH (server version, user's web change won)

**Post-MVP Enhancement:** Implement smart merge (combine non-conflicting fields) or prompt user to resolve manually.

---

## 5. UI/UX Component Specifications

This section defines the design system and component library based on Material Design 3 for mobile (React Native Paper) and web (Material-UI).

### 5.1 Design System Tokens

**Colors:**
```javascript
// Primary palette
primary: '#2563EB',          // Blue - main brand color
primaryContainer: '#EFF6FF', // Light blue background

// Priority colors
priorityLow: '#16A34A',      // Green
priorityMedium: '#F59E0B',   // Orange
priorityHigh: '#DC2626',     // Red/Emergency

// Status colors
statusOpen: '#2563EB',       // Blue
statusInProgress: '#F59E0B', // Orange
statusCompleted: '#16A34A',  // Green
statusCancelled: '#6B7280',  // Grey

// Compliance colors
valid: '#16A34A',            // Green
expiringSoon: '#F59E0B',     // Orange
expired: '#DC2626',          // Red

// Neutral palette
background: '#FFFFFF',
surface: '#F9FAFB',
textPrimary: '#111827',
textSecondary: '#6B7280',
border: '#E5E7EB',
```

**Typography:**
```javascript
// Mobile (React Native Paper)
fontFamily: 'Roboto',
fontSizes: {
  h1: 24,
  h2: 20,
  h3: 18,
  body: 16,
  caption: 14,
  label: 12
},
fontWeights: {
  regular: '400',
  medium: '500',
  bold: '700'
},
// Minimum touch target: 48x48px
// Minimum input text: 16pt (prevents iOS zoom on focus)
```

**Spacing (8pt grid):**
```javascript
spacing: {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48
}
```

**Border Radius:**
```javascript
borderRadius: {
  sm: 4,
  md: 8,
  lg: 12,
  full: 9999 // Pills/fully rounded
}
```

### 5.2 Core Components

**PropertyCard**
```jsx
<Card style={{ marginBottom: 8, borderRadius: 8 }}>
  <Card.Content>
    <Text style={{ fontSize: 18, fontWeight: '500' }}>{property.name}</Text>
    <Text style={{ fontSize: 14, color: '#6B7280' }}>{property.address}</Text>
    <View style={{ flexDirection: 'row', marginTop: 8 }}>
      <Chip icon="home" mode="outlined">{property.property_type}</Chip>
      {workOrderCount > 0 && (
        <Chip icon="clipboard-alert" style={{ marginLeft: 8 }}>
          {workOrderCount} active work orders
        </Chip>
      )}
    </View>
  </Card.Content>
</Card>
```

**WorkOrderCard**
```jsx
<Card style={{
  marginBottom: 8,
  borderRadius: 8,
  borderLeftWidth: 4,
  borderLeftColor: priorityColor // #16A34A, #F59E0B, or #DC2626
}}>
  <Card.Content>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <Text style={{ fontSize: 16, fontWeight: '500', flex: 1 }}>
        {workOrder.title}
      </Text>
      <StatusBadge status={workOrder.status} />
    </View>

    <View style={{ flexDirection: 'row', marginTop: 8, alignItems: 'center' }}>
      <Chip size="small" icon="alert" style={{ backgroundColor: priorityColor }}>
        {workOrder.priority}
      </Chip>
      <Icon name="building" size={16} style={{ marginLeft: 12 }} />
      <Text style={{ fontSize: 14, marginLeft: 4 }}>{property.name}</Text>
    </View>

    {workOrder.contractor && (
      <View style={{ flexDirection: 'row', marginTop: 4, alignItems: 'center' }}>
        <Icon name="account" size={16} />
        <Text style={{ fontSize: 14, marginLeft: 4 }}>{contractor.name}</Text>
      </View>
    )}

    {workOrder.due_date && (
      <View style={{ flexDirection: 'row', marginTop: 4, alignItems: 'center' }}>
        <Icon name="calendar" size={16} />
        <Text style={{
          fontSize: 14,
          marginLeft: 4,
          color: isOverdue ? '#DC2626' : '#6B7280'
        }}>
          {formatDate(workOrder.due_date)}
          {isOverdue && ' - OVERDUE'}
        </Text>
      </View>
    )}

    {photoCount > 0 && (
      <Chip size="small" icon="camera" style={{ marginTop: 8 }}>
        {photoCount} photos
      </Chip>
    )}
  </Card.Content>
</Card>
```

**StatusBadge**
```jsx
<Chip
  mode="flat"
  style={{
    backgroundColor: statusColor,
    height: 24
  }}
  textStyle={{ fontSize: 12, color: '#FFFFFF' }}
>
  {status}
</Chip>

// Colors:
// OPEN: #2563EB
// IN_PROGRESS: #F59E0B
// COMPLETED: #16A34A
// CANCELLED: #6B7280
```

**PriorityButtonGroup** (Create Work Order form)
```jsx
<View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 16 }}>
  <Button
    mode={priority === 'LOW' ? 'contained' : 'outlined'}
    onPress={() => setPriority('LOW')}
    style={{
      width: 90,
      height: 60,
      backgroundColor: priority === 'LOW' ? '#16A34A' : 'transparent',
      borderRadius: 8,
      justifyContent: 'center'
    }}
    icon="arrow-down"
  >
    Low
  </Button>

  <Button
    mode={priority === 'MEDIUM' ? 'contained' : 'outlined'}
    onPress={() => setPriority('MEDIUM')}
    style={{
      width: 90,
      height: 60,
      backgroundColor: priority === 'MEDIUM' ? '#F59E0B' : 'transparent',
      borderRadius: 8,
      justifyContent: 'center'
    }}
    icon="minus"
  >
    Medium
  </Button>

  <Button
    mode={priority === 'HIGH' ? 'contained' : 'outlined'}
    onPress={() => setPriority('HIGH')}
    style={{
      width: 90,
      height: 60,
      backgroundColor: priority === 'HIGH' ? '#DC2626' : 'transparent',
      borderRadius: 8,
      justifyContent: 'center'
    }}
    icon="arrow-up"
  >
    High
  </Button>
</View>
```

**FloatingActionButton (FAB)**
```jsx
<FAB
  icon="plus"
  style={{
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#2563EB'
  }}
  onPress={handleCreate}
/>
```

**CertificateCard**
```jsx
<Card style={{
  marginBottom: 8,
  borderRadius: 8,
  backgroundColor: expiryStatus === 'EXPIRED' ? '#FEE2E2' :
                   expiryStatus === 'EXPIRING_SOON' ? '#FEF3C7' : '#FFFFFF',
  borderWidth: expiryStatus === 'EXPIRED' ? 2 : 0,
  borderColor: '#DC2626'
}}>
  <Card.Content>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <Chip icon="fire" style={{ backgroundColor: certificateTypeColor }}>
        {certificate.certificate_type}
      </Chip>
      <Chip
        icon={expiryStatus === 'VALID' ? 'check-circle' : 'alert-circle'}
        style={{ backgroundColor: expiryStatusColor }}
      >
        {expiryStatus}
      </Chip>
    </View>

    <Text style={{ fontSize: 14, marginTop: 8 }}>
      Issuer: {certificate.issuer_name}
    </Text>
    <Text style={{ fontSize: 14, color: '#6B7280' }}>
      Expires: {formatDate(certificate.expiry_date)}
      {daysUntilExpiry > 0 && ` (${daysUntilExpiry} days)`}
      {daysUntilExpiry < 0 && ` (${Math.abs(daysUntilExpiry)} days overdue)`}
    </Text>

    {certificate.document_url && (
      <Button
        mode="outlined"
        icon="eye"
        style={{ marginTop: 8 }}
        onPress={handleViewDocument}
      >
        View Document
      </Button>
    )}
  </Card.Content>
</Card>
```

### 5.3 Form Components

**TextInput (React Native Paper)**
```jsx
<TextInput
  label="Property Name"
  value={name}
  onChangeText={setName}
  mode="outlined"
  error={errors.name}
  style={{ marginBottom: 16 }}
  maxLength={100}
/>
{errors.name && (
  <HelperText type="error" visible={true}>
    {errors.name}
  </HelperText>
)}
```

**DatePicker**
```jsx
<Button
  mode="outlined"
  icon="calendar"
  onPress={() => setShowDatePicker(true)}
>
  {dueDate ? formatDate(dueDate) : 'Select due date'}
</Button>

<DatePickerModal
  locale="en-GB"
  mode="single"
  visible={showDatePicker}
  onDismiss={() => setShowDatePicker(false)}
  date={dueDate}
  onConfirm={(params) => {
    setDueDate(params.date);
    setShowDatePicker(false);
  }}
/>
```

### 5.4 Empty States

```jsx
<View style={{
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  padding: 32
}}>
  <Icon name="clipboard-outline" size={64} color="#9CA3AF" />
  <Text style={{
    fontSize: 18,
    fontWeight: '500',
    marginTop: 16,
    textAlign: 'center'
  }}>
    No work orders yet
  </Text>
  <Text style={{
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center'
  }}>
    Create your first work order to get started
  </Text>
  <Button
    mode="contained"
    icon="plus"
    style={{ marginTop: 24 }}
    onPress={handleCreate}
  >
    Create Work Order
  </Button>
</View>
```

---

## 6. API Requirements

This section defines all API endpoints with request/response schemas, validation rules, and business logic.

### 6.1 Authentication Endpoints

**POST /api/auth/register**
```javascript
// Request
{
  email: 'user@example.com',
  password: 'SecurePass123!',
  full_name: 'John Smith',
  company_name: 'Smith Properties' // optional
}

// Response (201 Created)
{
  user: {
    id: 'uuid',
    email: 'user@example.com',
    full_name: 'John Smith',
    role: 'ADMIN',
    tenant_id: 'uuid'
  },
  tenant: {
    id: 'uuid',
    tenant_name: 'Smith Properties',
    subscription_status: 'TRIAL',
    trial_ends_at: '2025-11-10T00:00:00Z'
  },
  access_token: 'eyJhbGc...',
  refresh_token: 'eyJhbGc...'
}

// Validation
- email: Valid email format, unique in database
- password: Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
- full_name: Required, max 100 chars
- company_name: Optional, max 100 chars

// Business Logic
1. Check if email already exists → Return 409 Conflict
2. Hash password with bcrypt (salt rounds: 10)
3. Create Tenant record (tenant_name = company_name OR full_name)
4. Create User record with tenant_id, role = ADMIN
5. Set trial_ends_at = now + 14 days
6. Generate JWT tokens (access: 1h, refresh: 30d)
7. Return user, tenant, and tokens
```

**POST /api/auth/login**
```javascript
// Request
{
  email: 'user@example.com',
  password: 'SecurePass123!'
}

// Response (200 OK)
{
  user: { ... },
  tenant: { ... },
  access_token: 'eyJhbGc...',
  refresh_token: 'eyJhbGc...'
}

// Response (401 Unauthorized)
{
  error: 'Invalid email or password'
}

// Business Logic
1. Query User by email
2. Compare password with bcrypt.compare(password, user.password_hash)
3. If invalid → Return 401 with error message
4. If valid → Generate new JWT tokens, return user/tenant/tokens
5. Rate limiting: Max 5 attempts per 15 min per IP (after 5: return 429)
```

### 6.2 Property Endpoints

**GET /api/properties**
```javascript
// Query params
?page=1&limit=20&search=cottage&property_type=COTTAGE

// Response (200 OK)
{
  properties: [
    {
      id: 'uuid',
      tenant_id: 'uuid',
      name: 'Rose Cottage',
      address: '123 High St, Cotswolds',
      postcode: 'GL54 1AB',
      property_type: 'COTTAGE',
      bedrooms: 2,
      bathrooms: 1,
      work_order_count: 3, // Computed field
      created_at: '2025-01-15T10:00:00Z',
      updated_at: '2025-01-15T10:00:00Z'
    }
  ],
  total: 25,
  page: 1,
  limit: 20,
  hasMore: true
}

// Business Logic
1. Apply tenantMiddleware (filter by tenant_id from JWT)
2. Filter: WHERE deleted_at IS NULL
3. If search param: WHERE name ILIKE %search% OR address ILIKE %search%
4. If property_type param: WHERE property_type = ?
5. Include work_order_count: COUNT(work_orders WHERE deleted_at IS NULL AND status != 'COMPLETED')
6. Order by created_at DESC
7. Paginate: OFFSET (page-1)*limit LIMIT limit
```

**POST /api/properties**
```javascript
// Request
{
  name: 'Rose Cottage',
  address: '123 High St, Cotswolds',
  postcode: 'GL54 1AB',
  property_type: 'COTTAGE',
  bedrooms: 2,
  bathrooms: 1
}

// Response (201 Created)
{
  id: 'uuid',
  tenant_id: 'uuid',
  // ... all fields
}

// Validation
- name: Required, max 100 chars
- address: Required, max 255 chars
- postcode: Required, UK format ^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$
- property_type: Required, enum [HOUSE, FLAT, COTTAGE, COMMERCIAL]
- bedrooms: Min 0, max 50
- bathrooms: Min 0, max 20

// Business Logic
1. Validate all fields
2. Check subscription property limit:
   - Query Subscription for tenant
   - Count existing properties (WHERE deleted_at IS NULL)
   - If STARTER plan AND count >= 10: Return 403 "Property limit reached"
   - If PROFESSIONAL plan AND count >= 50: Return 403
3. Generate UUID for id
4. Insert with tenant_id from JWT token
5. Return created property
```

### 6.3 Work Order Endpoints

**POST /api/work-orders**
```javascript
// Request
{
  property_id: 'uuid',
  contractor_id: 'uuid', // optional
  title: 'Fix leaking tap',
  description: 'Kitchen sink tap dripping constantly',
  priority: 'HIGH',
  due_date: '2025-11-05T00:00:00Z' // optional
}

// Response (201 Created)
{
  id: 'uuid',
  tenant_id: 'uuid',
  property_id: 'uuid',
  contractor_id: 'uuid',
  title: 'Fix leaking tap',
  description: 'Kitchen sink tap dripping constantly',
  priority: 'HIGH',
  status: 'OPEN', // Default
  due_date: '2025-11-05T00:00:00Z',
  completed_at: null,
  completion_note: null,
  cancellation_reason: null,
  created_at: '2025-10-27T14:30:00Z',
  updated_at: '2025-10-27T14:30:00Z',
  deleted_at: null
}

// Validation
- property_id: Required, must exist and belong to same tenant
- contractor_id: Optional, if provided must exist and belong to same tenant
- title: Required, max 255 chars
- description: Optional, max 2000 chars
- priority: Required, enum [LOW, MEDIUM, HIGH]
- due_date: Optional, cannot be in the past

// Business Logic
1. Validate all fields
2. Verify property_id exists: SELECT id FROM properties WHERE id = ? AND tenant_id = ? AND deleted_at IS NULL
3. If contractor_id provided, verify exists
4. Set status = 'OPEN' (default)
5. Insert work order with tenant_id from JWT
6. Return created work order
```

**PATCH /api/work-orders/:id**
```javascript
// Request (partial update)
{
  status: 'COMPLETED',
  completion_note: 'Replaced tap washer, all working now'
}

// Business Logic for status changes
- If status → COMPLETED:
  - Require completion_note (optional but recommended)
  - Set completed_at = NOW()
- If status → CANCELLED:
  - Require cancellation_reason
  - completed_at remains null
- If status → IN_PROGRESS from OPEN:
  - No special logic
- If status → OPEN from COMPLETED:
  - Clear completed_at, completion_note
```

### 6.4 Photo Upload Endpoint

**POST /api/photos/upload**
```javascript
// Request (multipart/form-data)
FormData: {
  file: <binary>,
  work_order_id: 'uuid'
}

// Response (201 Created)
{
  id: 'uuid',
  tenant_id: 'uuid',
  work_order_id: 'uuid',
  uploaded_url: 'https://cdn.rightfitservices.com/photos/tenant-uuid/photo-uuid.jpg',
  file_size_bytes: 524288,
  width_px: 1920,
  height_px: 1080,
  ai_quality_score: null, // Computed async
  ai_brightness_score: null,
  ai_blur_score: null,
  ai_checked_at: null,
  created_at: '2025-10-27T14:35:00Z'
}

// Business Logic
1. Validate file:
   - Type: image/jpeg, image/png, image/heic
   - Size: <= 10MB
2. Verify work_order_id exists and belongs to tenant
3. Generate UUID for filename
4. Upload to S3:
   - Bucket: rightfit-photos-{env}
   - Key: {tenant_id}/{photo_uuid}.jpg
   - ACL: private (serve via CloudFront signed URLs)
5. Extract image dimensions using sharp library
6. Insert photo record in database
7. Queue async job for Google Vision API quality check
8. Return photo metadata
```

### 6.5 Stripe Webhooks

**POST /api/webhooks/stripe**
```javascript
// Stripe sends webhook events

// Event: checkout.session.completed
{
  type: 'checkout.session.completed',
  data: {
    object: {
      id: 'cs_...',
      customer: 'cus_...',
      subscription: 'sub_...',
      metadata: {
        tenant_id: 'uuid'
      }
    }
  }
}

// Business Logic
1. Verify Stripe signature using webhook secret
2. Handle based on event type:

// checkout.session.completed:
- Extract customer, subscription, tenant_id
- Query Stripe API for subscription details
- Create Subscription record:
  {
    tenant_id,
    stripe_customer_id,
    stripe_subscription_id,
    plan: 'STARTER' or 'PROFESSIONAL', // from price_id mapping
    status: 'ACTIVE',
    current_period_start,
    current_period_end
  }
- Update Tenant.subscription_status = 'ACTIVE'

// invoice.payment_failed:
- Query Subscription by stripe_subscription_id
- Update status = 'PAST_DUE'
- Send push notification to user
- If attempt_count >= 3: Update status = 'CANCELLED'

// customer.subscription.deleted:
- Update Subscription.status = 'CANCELLED'
- Set Tenant.subscription_status = 'CANCELLED'
```

### 6.6 Middleware & Security

**tenantMiddleware** (Applied to ALL endpoints except auth/webhooks)
```javascript
function tenantMiddleware(req, res, next) {
  // Extract JWT from Authorization header
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Verify and decode JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info to request
    req.user = {
      user_id: decoded.user_id,
      tenant_id: decoded.tenant_id,
      email: decoded.email,
      role: decoded.role
    };

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
```

**Rate Limiting**
```javascript
const rateLimit = require('express-rate-limit');

// Auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many login attempts, please try again later'
});

app.post('/api/auth/login', authLimiter, loginHandler);

// SMS endpoints
const smsLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 SMS per hour per user
  keyGenerator: (req) => req.user.user_id // Rate limit per user
});
```

---

## 7. Non-Functional Requirements

### 7.1 Performance Requirements

**API Response Times (p95):**
- List endpoints (GET /properties, /work-orders): <500ms
- Detail endpoints (GET /properties/:id): <200ms
- Create/Update operations (POST, PATCH): <300ms
- Photo upload: <2s for 1MB file
- Search queries: <800ms

**Mobile App Performance:**
- Time to interactive (first launch): <3s
- Time to interactive (subsequent): <2s
- Navigation transitions: <100ms (60fps)
- List scroll performance: Maintain 60fps with 100+ items (use FlatList virtualization)
- Offline operations (create/update): <100ms perceived latency

**Database Query Optimization:**
- All foreign keys indexed: tenant_id, property_id, contractor_id, work_order_id
- Compound indexes: [tenant_id, deleted_at], [tenant_id, status]
- Use EXPLAIN ANALYZE to verify query plans
- Connection pooling: Min 5, max 20 connections

### 7.2 Reliability & Availability

**API Uptime:** 99.5% monthly (measured by uptime monitoring service)
- Allows ~3.6 hours downtime per month
- Planned maintenance windows on Sundays 02:00-04:00 GMT (notify users 7 days in advance)

**Error Handling:**
- All API errors return consistent format:
  ```json
  {
    error: 'User-friendly error message',
    code: 'PROPERTY_NOT_FOUND',
    field: 'property_id', // For validation errors
    details: { ... } // Additional context for debugging
  }
  ```
- HTTP status codes:
  - 200: Success
  - 201: Created
  - 400: Validation error
  - 401: Unauthorized
  - 403: Forbidden (e.g., property limit exceeded)
  - 404: Not found
  - 409: Conflict (e.g., duplicate email, sync conflict)
  - 429: Rate limit exceeded
  - 500: Internal server error
- 500 errors logged to CloudWatch with full stack traces
- No sensitive data (passwords, tokens) in logs

**Data Backup:**
- PostgreSQL automated backups: Daily at 03:00 GMT
- Backup retention: 30 days
- S3 photo backups: Versioning enabled, lifecycle policy to Glacier after 90 days
- Recovery Time Objective (RTO): <4 hours
- Recovery Point Objective (RPO): <24 hours

**Monitoring & Alerting:**
- CloudWatch alarms:
  - API error rate >5%: Alert via email
  - Database CPU >80%: Alert
  - API p95 latency >1s: Alert
  - S3 upload failures >10/hour: Alert
- Uptime monitoring: Pingdom or UptimeRobot, check every 1 min
- On-call rotation: Solo developer receives all alerts (set up PagerDuty)

### 7.3 Security Requirements

**Authentication:**
- JWT tokens with HS256 algorithm
- Access token expiry: 1 hour (short-lived)
- Refresh token expiry: 30 days
- Token rotation on refresh
- Passwords hashed with bcrypt, salt rounds: 10
- NEVER store passwords in plaintext or logs

**Data Encryption:**
- In transit: HTTPS/TLS 1.3 for all API requests
- At rest: AWS RDS encryption enabled (AES-256)
- S3 bucket encryption: SSE-S3 or SSE-KMS

**Multi-Tenancy Isolation:**
- CRITICAL: ALL database queries MUST filter by tenant_id
- Integration tests to verify no cross-tenant data leakage
- Database row-level security policies (bonus points if implemented)

**API Security:**
- CORS: Whitelist mobile app and web app origins only
- Helmet.js: Set security headers (CSP, X-Frame-Options, etc.)
- Input validation: Sanitize all user inputs, prevent SQL injection (use Prisma parameterized queries)
- File upload validation: Check magic bytes, not just file extension
- Rate limiting on all endpoints (see 6.6)

**Secrets Management:**
- Environment variables for all secrets (NEVER commit to git)
- Use AWS Secrets Manager or .env files (never commit .env)
- Required secrets:
  - DATABASE_URL
  - JWT_SECRET (256-bit random string)
  - STRIPE_SECRET_KEY
  - TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN
  - AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY
  - GOOGLE_VISION_API_KEY

**GDPR Compliance:**
- Data retention policy: 90 days after account cancellation
- Right to erasure: Implement /api/users/:id/delete endpoint (hard delete all user data)
- Data export: Implement /api/users/:id/export (JSON export of all user data)
- Privacy policy and Terms of Service URLs in app

### 7.4 Scalability

**MVP Capacity Targets:**
- Support 100 concurrent users
- 500 total users (tenants)
- 10,000 properties
- 50,000 work orders
- 200,000 photos (200GB storage)

**Database Scaling:**
- Start with AWS RDS db.t3.micro (2GB RAM, shared CPU)
- Vertical scaling: Upgrade to db.t3.small (2GB), db.t3.medium (4GB) as needed
- Read replicas: Add 1 read replica if read load >70% (post-MVP)

**API Scaling:**
- Start with single EC2 t3.small instance (2 vCPU, 2GB RAM)
- Horizontal scaling: Add load balancer + 2nd instance when CPU >70%
- Auto-scaling group: Min 1, max 3 instances (post-MVP)

**CDN & Caching:**
- CloudFront for photo delivery (reduces S3 egress costs)
- API response caching: Redis for frequently accessed data (post-MVP)
- Mobile app: Cache API responses in WatermelonDB (offline-first design)

### 7.5 Maintainability

**Code Quality:**
- TypeScript for all Node.js code (strict mode)
- ESLint + Prettier for code formatting
- Husky pre-commit hooks: Run linter + tests before commit
- Code coverage target: >70% (Jest unit tests)

**Documentation:**
- API documentation: OpenAPI/Swagger spec (auto-generated from code)
- Code comments for complex business logic only (self-documenting code preferred)
- README.md in each workspace (apps/api, apps/mobile, apps/web)
- Architecture Decision Records (ADRs) for major decisions

**Testing:**
- Unit tests: Jest for business logic (services, utilities)
- Integration tests: Supertest for API endpoints
- E2E tests: Detox for mobile app critical flows (Sprint 6)
- Manual QA checklist for each sprint (see Section 8)

**Deployment:**
- CI/CD: GitHub Actions
- Environments: dev, staging, production
- Database migrations: Prisma migrate (versioned, reversible)
- Blue-green deployment for zero-downtime releases (post-MVP)

**Logging:**
- Structured logging: Winston or Pino (JSON format)
- Log levels: ERROR, WARN, INFO, DEBUG
- CloudWatch Logs retention: 14 days for INFO, 90 days for ERROR
- No PII in logs (mask email, phone, names)

---

## 8. Testing Scenarios & QA Checklist

This section provides comprehensive testing scenarios for critical user flows, edge cases, and multi-tenancy verification. Use this checklist at the end of each sprint for manual QA.

### 8.1 Critical Flow: Offline Work Order Creation & Sync

**Test Scenario:** Verify offline work order creation with photos syncs correctly when online.

**Preconditions:**
- User logged in with at least 1 property
- At least 1 contractor exists
- Mobile device has airplane mode capability

**Test Steps:**
1. Open mobile app while online
2. Navigate to Properties → Select a property
3. Enable airplane mode (device goes offline)
4. Verify yellow "Offline" banner appears at top
5. Tap "Create Work Order" FAB
6. Fill form:
   - Title: "Test offline work order"
   - Priority: HIGH (red button)
   - Description: "Testing offline creation"
7. Tap "Add Photo" → Take Photo → Use photo (repeat 2x for 2 photos)
8. Verify photos show thumbnails with "Pending sync" badge
9. Tap "Assign Contractor" → Select contractor
10. Tap "Create Work Order" button

**Expected Results:**
- SnackBar: "Saved locally. Will sync when online."
- Work order appears in list with "cloud-off" icon
- Work order detail shows all data correctly
- Photos display from local file paths
- App remains responsive (<100ms UI interactions)

**Test Steps (continued):**
11. Close app completely
12. Wait 1 minute
13. Disable airplane mode (device goes online)
14. Reopen app

**Expected Results:**
- App detects online status (no banner)
- Background sync starts automatically
- SnackBar: "Syncing 3 items..." (1 work order + 2 photos)
- After ~5 seconds, SnackBar: "All changes synced successfully"
- Work order "cloud-off" icon removed
- Photos now show S3 URLs instead of local paths
- Photos have AI quality scores (or pending if async job not complete)

**Verification:**
- Open web app, verify work order appears with same data
- Verify photos are accessible from web app
- Check database: work_order record has correct tenant_id, property_id, contractor_id
- Check S3 bucket: 2 photos uploaded to `rightfit-photos-dev/{tenant_id}/`
- Check sync_queue table: All 3 entries removed (synced successfully)

**Edge Cases to Test:**
- Close app before sync completes → Sync resumes on next app open
- Delete work order while still in sync queue → Sync queue entry removed, no API call made
- Edit work order 3 times offline → Only 1 UPDATE operation in sync queue with latest data
- Network drops mid-sync → Failed items stay in queue, retry with exponential backoff

---

### 8.2 Multi-Tenancy Isolation Testing

**Test Scenario:** Verify Tenant A cannot access Tenant B's data.

**Preconditions:**
- 2 test accounts registered:
  - Tenant A: alice@test.com / password123
  - Tenant B: bob@test.com / password123
- Tenant A has 1 property ("Alice's House") with 1 work order
- Tenant B has 1 property ("Bob's Flat") with 1 work order

**Test Steps:**
1. Login as Tenant A (alice@test.com)
2. Navigate to Properties → Verify only "Alice's House" visible
3. Navigate to Work Orders → Verify only Tenant A's work order visible
4. Note the property_id of "Alice's House" from URL or API response
5. Logout

6. Login as Tenant B (bob@test.com)
7. Navigate to Properties → Verify only "Bob's Flat" visible
8. Attempt to access Tenant A's property via direct URL manipulation:
   - Manually craft GET request: `/api/properties/{alice_property_id}`
   - Use browser dev tools or Postman with Tenant B's access_token

**Expected Results:**
- API returns 404 Not Found (NOT 403, to avoid revealing existence)
- Tenant B CANNOT see Tenant A's property data
- NO error messages that reveal Tenant A's data exists

**Test Steps (API Testing):**
9. Using Postman/Insomnia, test these scenarios with Tenant B's token:
   - GET /api/properties?search=Alice → Empty results (Tenant A's property not in results)
   - POST /api/work-orders with property_id={alice_property_id} → 400 Validation error "Property not found"
   - GET /api/work-orders → Only Tenant B's work orders returned
   - POST /api/photos/upload with work_order_id={alice_work_order_id} → 400 "Work order not found"

**Expected Results:**
- ALL API endpoints respect tenant_id filtering
- NO cross-tenant data visible
- NO information leakage via error messages

**Database Verification:**
10. Query database directly:
```sql
-- Verify tenant_id on all records
SELECT tenant_id, COUNT(*) FROM properties GROUP BY tenant_id;
SELECT tenant_id, COUNT(*) FROM work_orders GROUP BY tenant_id;

-- Attempt cross-tenant query (should be prevented by app logic, not DB)
SELECT * FROM properties WHERE tenant_id = '{tenant_b_id}' AND id = '{alice_property_id}';
-- Should return 0 rows
```

**Critical Security Test:**
- Modify JWT token payload (change tenant_id) → API rejects with 401 Invalid token
- Use expired access_token → API returns 401, automatically refreshes with refresh_token
- Use valid token from Tenant A to access Tenant B's endpoints → 404 Not Found

---

### 8.3 Compliance Certificate Expiry Notifications

**Test Scenario:** Verify push notifications sent at correct intervals for expiring certificates.

**Preconditions:**
- User has property with Gas Safe certificate
- User has push notifications enabled on mobile device
- User's device registered for push (Expo push token stored)

**Test Setup:**
1. Create certificate with expiry_date = TODAY + 30 days
2. Manually trigger notification job OR wait for cron job to run

**Test Steps (30 days before expiry):**
1. Run certificate expiry check job (cron or manual trigger)
2. Verify API sends push notification:
   - Title: "Certificate Expiring Soon"
   - Body: "Your Gas Safe certificate for [Property Name] expires in 30 days. Renew now to stay compliant."
   - Data: { type: 'CERTIFICATE_EXPIRY', certificate_id, property_id, deep_link }
3. Verify notification logged to database:
   - Query: SELECT * FROM notifications WHERE type = 'CERTIFICATE_EXPIRY' AND user_id = ?
   - Verify: sent_at is recent, read_at is NULL
4. Mobile device receives push notification
5. Tap notification → App opens to Property Detail → Compliance tab
6. Certificate shows orange "EXPIRING_SOON" badge

**Test Steps (7 days before expiry):**
7. Update certificate expiry_date to TODAY + 7 days (simulate time passage)
8. Trigger notification job again
9. Verify notification sent with updated message: "URGENT: Your Gas Safe certificate expires in 7 days!"
10. Verify notification has priority: 'high'

**Test Steps (On expiry day):**
11. Update expiry_date to TODAY
12. Trigger notification job
13. Verify notification: "Your Gas Safe certificate has EXPIRED. Renew immediately to avoid fines."
14. Open app → Certificate shows red "EXPIRED" badge with red border on card

**Test Steps (7 days overdue):**
15. Update expiry_date to TODAY - 7 days
16. Trigger notification job
17. Verify notification: "Your Gas Safe certificate expired 7 days ago. Take action now."

**Edge Cases:**
- User has notifications disabled → Notification still logged to in-app inbox, no push sent
- User's device unregistered (invalid push token) → Expo API returns error, device marked inactive
- Certificate renewed before expiry → Old certificate marked deleted_at, new certificate created, notifications stop for old one
- User has 10 certificates expiring → 10 separate notifications sent (verify no spam, maybe batch in future)

---

### 8.4 Subscription Plan Limits Enforcement

**Test Scenario:** Verify Starter plan users cannot exceed 10 properties.

**Preconditions:**
- User on Starter plan (£15/month, max 10 properties)
- User has 9 properties already created

**Test Steps:**
1. Login as Starter plan user
2. Navigate to Properties screen → Verify 9 properties displayed
3. Tap "Add Property" FAB
4. Fill form with valid data (Property #10)
5. Tap "Create Property"

**Expected Results:**
- Property created successfully (200 Created)
- SnackBar: "Property created successfully"
- Properties list shows 10 properties

**Test Steps (Exceed Limit):**
6. Tap "Add Property" FAB again
7. Fill form with valid data (Property #11)
8. Tap "Create Property"

**Expected Results:**
- API returns 403 Forbidden
- Error message: "You've reached the 10 property limit for Starter plan. Upgrade to Professional to add more properties."
- SnackBar displays error message
- "Upgrade Plan" button appears in error message (tappable, navigates to Subscription screen)

**Test Steps (Upgrade Plan):**
9. Tap "Upgrade Plan" button
10. Navigate to Subscription screen
11. Tap "Select Professional Plan" (£25/month, max 50 properties)
12. Complete Stripe checkout (test mode with card 4242 4242 4242 4242)
13. Subscription upgraded successfully
14. Navigate back to Properties
15. Tap "Add Property" FAB
16. Fill form (Property #11)
17. Tap "Create Property"

**Expected Results:**
- Property created successfully (user now has 11 properties)
- No error message (Professional plan allows up to 50)

**Verification:**
- Check Subscription table: plan = 'PROFESSIONAL', status = 'ACTIVE'
- Check Stripe dashboard: Subscription upgraded, prorated charge applied

**Edge Cases:**
- User tries to create 11th property via API (not mobile app) → Same 403 error
- User downgrades from Professional to Starter while having 25 properties → Allow (existing properties grandfathered), but prevent creating new ones
- User's subscription expires (TRIAL → no payment) → Properties become read-only, cannot create new

---

### 8.5 Photo AI Quality Check & Retake Flow

**Test Scenario:** Verify poor quality photo triggers notification and user can retake.

**Preconditions:**
- User has work order created
- Google Vision API configured and working

**Test Steps:**
1. Create work order
2. Add photo that is intentionally dark (low brightness):
   - Take photo in dark room OR upload pre-prepared dark image
3. Photo uploads to S3 successfully
4. API triggers Google Vision API job (async)
5. Wait ~10 seconds for Vision API to process

**Expected Results:**
- Google Vision API returns IMAGE_PROPERTIES with low luminance
- API calculates brightness_score = 18 (< 40 threshold)
- overall_quality_score = 27 (< 50 threshold)
- API updates photo record with scores
- API sends push notification:
  - Title: "Photo Quality Alert"
  - Body: "One of your photos may be too dark. Tap to retake."

**Test Steps (continued):**
6. Receive push notification → Tap it
7. App opens to Work Order Detail → Photo gallery
8. Photo thumbnail shows red "Poor quality" badge
9. Tap photo → Full-screen viewer opens
10. Quality score displayed: 27/100 with red warning icon
11. Tap "Delete Photo" button
12. Confirm deletion
13. Photo removed from gallery
14. Tap "Add Photo" again
15. Take new photo with flashlight/better lighting
16. New photo uploads

**Expected Results:**
- New photo analyzed by Vision API
- brightness_score = 62 (acceptable)
- overall_quality_score = 78 (acceptable)
- Photo shows orange "Acceptable quality" badge
- No push notification sent (score >= 50)

**Edge Cases:**
- User ignores notification, keeps poor quality photo → Work order still valid (photos not mandatory for completion)
- Vision API fails (timeout, API key issue) → Photo still saved with ai_quality_score = NULL, no notification
- User uploads photo while offline → Photo queued, Vision API runs after sync completes
- User uploads 10 photos, 3 are poor quality → 3 separate notifications sent (verify not too spammy)

---

### 8.6 Sprint-End QA Checklist

**Use this checklist for manual testing at the end of each sprint before deployment.**

#### Sprint 1: Foundation (Auth, Properties)
- [ ] User registration works with valid email/password
- [ ] Password validation enforces complexity rules (8 chars, 1 upper, 1 lower, 1 number, 1 special)
- [ ] Login works with correct credentials
- [ ] Login fails with incorrect credentials (401 error)
- [ ] Token refresh works when access_token expires
- [ ] Logout clears all tokens and navigates to login screen
- [ ] Create property with valid UK postcode
- [ ] Create property fails with invalid postcode (validation error)
- [ ] List properties shows only current tenant's properties
- [ ] Edit property updates data correctly
- [ ] Delete property soft-deletes (sets deleted_at, doesn't hard delete)
- [ ] Deleted properties don't appear in list
- [ ] Multi-tenancy: Tenant A cannot access Tenant B's properties

#### Sprint 2: Work Orders, Contractors, SMS
- [ ] Create work order with all priority levels (LOW, MEDIUM, HIGH)
- [ ] Work order card displays correct left border color based on priority
- [ ] Assign contractor to work order
- [ ] Update work order status to IN_PROGRESS, COMPLETED, CANCELLED
- [ ] Completing work order sets completed_at timestamp
- [ ] Cancelling work order requires cancellation_reason
- [ ] Filter work orders by status, priority, property, contractor
- [ ] Create contractor with UK phone number
- [ ] Send SMS to contractor via Twilio (verify SMS received in test environment)
- [ ] SMS rate limiting enforced (max 10 per hour)
- [ ] Contractor opt-out prevents SMS sending

#### Sprint 3: Mobile App Foundation
- [ ] Mobile app builds successfully (iOS and Android)
- [ ] Login screen matches UI spec (React Native Paper components)
- [ ] Properties list displays correctly on mobile
- [ ] Work orders list displays correctly
- [ ] Navigation between screens works smoothly (<100ms transitions)
- [ ] Bottom tab navigator works (5 tabs: Dashboard, Properties, Work Orders, Contractors, Settings)
- [ ] FABs positioned correctly (bottom-right, 16px margin)
- [ ] Form inputs have correct styling (16pt font to prevent iOS zoom)
- [ ] Pull-to-refresh works on all list screens

#### Sprint 4: Offline Mode (CRITICAL SPRINT)
- [ ] WatermelonDB initialized correctly on first app launch
- [ ] Offline banner appears when device offline
- [ ] Create property while offline → Saves to WatermelonDB, appears in list
- [ ] Create work order while offline → Saves with "cloud-off" icon
- [ ] Add photos while offline → Photos stored in device local storage
- [ ] Offline changes show "Pending sync" badge
- [ ] App transitions to online → Sync starts automatically
- [ ] Sync progress displayed (e.g., "Syncing 3 of 10 items")
- [ ] Sync success: All items synced, badges removed, cloud icons removed
- [ ] Sync failure: Items moved to sync_errors, user can view and retry
- [ ] Edit same work order 5 times offline → Single UPDATE in sync queue
- [ ] Create then delete work order offline → No API calls made
- [ ] Create work order + 3 photos offline → All sync in correct order (work order first, then photos)
- [ ] Offline sync performance: ≥10 operations/second
- [ ] WatermelonDB query performance: <50ms for 1000 records
- [ ] Conflict resolution: Last-write-wins works correctly

#### Sprint 5: AI, Compliance, Push Notifications
- [ ] Photo uploads to S3 successfully
- [ ] Google Vision API analyzes photo brightness
- [ ] Poor quality photo triggers push notification
- [ ] Photo quality badge displays correctly (green/orange/red)
- [ ] Create compliance certificate (Gas Safe, EPC, EICR, etc.)
- [ ] Certificate expiry status calculated correctly (VALID, EXPIRING_SOON, EXPIRED)
- [ ] Certificate expiry notifications sent at 30d, 7d, 0d, 7d overdue
- [ ] Push notification permissions requested on first launch
- [ ] Push notifications received on device
- [ ] Tap notification deep links to correct screen
- [ ] Notification inbox shows all notifications
- [ ] Mark notification as read works
- [ ] Mark all as read clears badge count
- [ ] Notification preferences toggles work

#### Sprint 6: Payments, Launch Prep
- [ ] Free trial starts on registration (14 days)
- [ ] Trial countdown displayed correctly
- [ ] Trial ending notifications sent at 7d, 3d, 0d
- [ ] Subscription screen displays plan comparison
- [ ] Stripe Checkout opens in WebView
- [ ] Payment with test card (4242...) succeeds
- [ ] Subscription activated, Tenant status = ACTIVE
- [ ] Stripe webhook handles checkout.session.completed
- [ ] Stripe webhook handles invoice.payment_failed
- [ ] Property limit enforced (10 for Starter, 50 for Professional)
- [ ] Upgrade plan works (Starter → Professional)
- [ ] Manage subscription opens Stripe Customer Portal
- [ ] App Store build uploaded successfully (iOS)
- [ ] Google Play build uploaded successfully (Android)
- [ ] App metadata complete (screenshots, description, privacy policy)

#### Cross-Cutting Tests (Every Sprint)
- [ ] App crash rate <1% (monitor Crashlytics/Sentry)
- [ ] API p95 latency <500ms for list endpoints
- [ ] API uptime ≥99.5% since last sprint
- [ ] No console.error logs in production
- [ ] No sensitive data (passwords, tokens) in logs
- [ ] All database queries include tenant_id filtering
- [ ] Soft delete working (deleted_at set, not hard delete)
- [ ] Mobile app performance: List scrolls at 60fps
- [ ] Mobile app bundle size <50MB (iOS), <100MB (Android)
- [ ] No accessibility violations (run Lighthouse audit)

---

### 8.7 Performance & Load Testing

**API Load Test (Sprint 6):**
- Use Artillery or k6 to simulate 100 concurrent users
- Test scenarios:
  1. Login (100 req/min)
  2. List properties (500 req/min)
  3. Create work order (200 req/min)
  4. Upload photo (50 req/min)
- Success criteria:
  - p95 latency <500ms for list endpoints
  - p95 latency <300ms for create operations
  - 0% error rate
  - API server CPU <70%
  - Database connections <15 (max pool size: 20)

**Mobile App Performance (Sprint 6):**
- Use React Native Performance Monitor
- Measure:
  - Time to interactive (first launch): <3s
  - Time to interactive (subsequent): <2s
  - List scroll FPS: ≥60 FPS with 100 items
  - Navigation animation FPS: ≥60 FPS
  - Memory usage: <150MB on iOS, <200MB on Android
  - App size: <50MB iOS, <100MB Android

---

### 8.8 Security Testing Checklist

- [ ] SQL injection: Try `'; DROP TABLE properties; --` in search fields → No effect (Prisma prevents)
- [ ] XSS: Try `<script>alert('xss')</script>` in text inputs → Sanitized
- [ ] CSRF: Try API calls without proper token → 401 Unauthorized
- [ ] JWT tampering: Modify token payload → 401 Invalid token
- [ ] Password strength: Try weak password "12345678" → Rejected
- [ ] File upload validation: Try uploading .exe file as photo → 415 Unsupported Media Type
- [ ] File size limit: Try uploading 50MB photo → 413 Payload Too Large
- [ ] Rate limiting: Make 10 login attempts in 1 min → 429 Too Many Requests
- [ ] HTTPS enforcement: Try HTTP request → Redirects to HTTPS
- [ ] S3 bucket permissions: Try accessing photo without signed URL → 403 Forbidden
- [ ] Cross-tenant access: Try accessing other tenant's data with valid token → 404 Not Found
- [ ] Password stored as hash: Check database, verify password_hash is bcrypt (starts with $2b$)
- [ ] Secrets in code: Search codebase for hardcoded API keys → None found

---

**End of Product Requirements Document**

---

## Document Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-10-27 | Sarah Chen (Product Owner) | Initial comprehensive PRD for RightFit Services MVP |

---

## Appendix: Key References

- **Architecture Documents:** `I:\RightFit-Services\docs\architecture\`
- **UI/UX Spec:** `I:\RightFit-Services\docs\architecture\front-end-spec.md`
- **Sprint Plans:** `I:\RightFit-Services\docs\project-plan\sprint-plans.md`
- **Risk Register:** `I:\RightFit-Services\docs\project-plan\risk-register.md`
- **Product Brief:** `I:\RightFit-Services\docs\brief.md`
- **Discovery Insights:** `I:\RightFit-Services\docs\po-discovery.md`
- **PO Handover:** `I:\RightFit-Services\docs\handover-po.md`
- **Prisma Schema:** `packages/database/prisma/schema.prisma` (reference database-schema.md)

---

## Next Steps for Solo Developer

1. **Sprint 1 (Week 1-2):** Focus on authentication, multi-tenancy, and property CRUD. These are the foundation.
2. **Sprint 2 (Week 3-4):** Build work order management and contractor database. Get SMS working early for user delight.
3. **Sprint 3 (Week 5-6):** Port backend features to mobile app. Aim for feature parity with web.
4. **Sprint 4 (Week 7-8):** **CRITICAL SPRINT** - Implement offline mode. This is the MVP's key differentiator. Allocate extra buffer time.
5. **Sprint 5 (Week 9-10):** Add compliance tracking and AI photo checks. These are "wow" features but not blocking.
6. **Sprint 6 (Week 11-12):** Integrate Stripe payments and prepare for launch. Focus on polish and bug fixes.

**Remember:**
- Offline mode (Sprint 4) is HIGH RISK. Test extensively. Have rollback plan.
- Multi-tenancy is CRITICAL for security. Every DB query must filter by tenant_id.
- Start simple, iterate. Don't over-engineer. Ship fast, learn fast.
- Use this PRD as your single source of truth. When in doubt, refer back to acceptance criteria.

**Good luck! You've got this. Build something amazing.**

