# RightFit Services - Complete System Architecture

**Version**: 1.2
**Date**: November 7, 2025
**Document Type**: Brownfield Architecture (Verified from Code)
**Status**: Living Document

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Existing Project Analysis](#2-existing-project-analysis)
3. [Technology Stack](#3-technology-stack)
4. [Data Models & Schema](#4-data-models--schema)
5. [Component Architecture](#5-component-architecture)
6. [API Design](#6-api-design)
7. [Cross-App Workflow Integrations](#7-cross-app-workflow-integrations)
8. [Security Architecture](#8-security-architecture)
9. [Deployment & Infrastructure](#9-deployment--infrastructure)
10. [Next Steps & Recommendations](#10-next-steps--recommendations)

---

## 1. Introduction

### 1.1 Document Overview

This document provides comprehensive architectural documentation for **RightFit Services** - a multi-sided B2B2C SaaS platform connecting service providers (cleaning and maintenance companies), customers (short-let businesses and landlords), workers (cleaners and maintenance technicians), and end-users (property guests).

**Primary Purpose**: Serve as the definitive architectural reference for the complete RightFit Services ecosystem, enabling AI-driven development, onboarding, and system evolution while maintaining architectural consistency across all applications.

**Relationship to Existing Documentation**:
- Supersedes partial documentation in `docs/architecture/` folder
- Complements `docs/architecture/APP-SEPARATION.md` with full system context
- Provides technical foundation for story implementation in `stories/phase-4/`

### 1.2 System Overview

RightFit Services is a **multi-tenant property management and service coordination platform** consisting of **8 interconnected applications** serving four distinct user groups across a B2B2C marketplace model:

1. **Service Provider Applications** (B2B) - Cleaning and maintenance companies managing operations
2. **Customer Applications** (B2B) - Short-let businesses and landlords requesting services
3. **Worker Applications** (B2C) - Cleaners and maintenance workers completing jobs
4. **Guest Applications** (B2C) - Anonymous property guests reporting issues

**Platform Architecture Style**: Multi-tenant microservices with shared database, workflow orchestration via cross-tenant models, and offline-first mobile support.

### 1.3 Product Architecture & Deployment Model

**Deployment Strategy**: **Unified System with Branded Domains**

RightFit Services operates as a **single unified platform** deployed with branded subdomains to provide product-specific experiences. While appearing as separate products to end-users, all apps share a common backend API and database for seamless cross-product workflows.

#### Product Groupings

**Product 1: Cleaning SaaS**
```
Cleaning System (cleaning.rightfit.com)
├── web-cleaning         (Service Provider Portal - cleaning companies)
├── web-customer         (Customer Portal - short-let businesses)
├── guest-tablet         (End User - guests at properties)
└── web-worker          (Worker App - cleaners)

Revenue: Cleaning companies pay subscription
Shared Components: ✅ All 4 apps use ui-cleaning package
```

**Product 2: Maintenance SaaS**
```
Maintenance System (maintenance.rightfit.com)
├── web-maintenance      (Service Provider Portal - maintenance companies)
├── web-landlord         (Customer Portal - traditional landlords)
└── web-worker          (Worker App - maintenance workers)

Revenue: Maintenance companies pay subscription
Shared Components: ✅ All 3 apps use ui-maintenance package
```

#### Cross-Product Integration

```
┌─────────────────────────────────────────────────────────────────────┐
│                    SERVICE PROVIDER TENANTS (B2B)                    │
├─────────────────────────────────────────────────────────────────────┤
│  web-cleaning (Cleaning SaaS)  │  web-maintenance (Maintenance SaaS)│
│  • Cleaning companies           │  • Maintenance companies           │
│  • Manage cleaners              │  • Manage maintenance workers      │
│  • Generate maintenance issues  │  • Receive maintenance requests    │
│  • Require customer approval    │  • Submit quotes                   │
└─────────────────────────────────────────────────────────────────────┘
                            │
                            │ Workflow Integration
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      CUSTOMER PORTALS (B2B)                          │
├─────────────────────────────────────────────────────────────────────┤
│  web-customer (Cleaning SaaS)   │  web-landlord (Maintenance SaaS)  │
│  • Short-let businesses          │  • Traditional landlords          │
│  • Approve maintenance issues    │  • Request maintenance services   │
│  • Review cleaning jobs          │  • Approve quotes                 │
└─────────────────────────────────────────────────────────────────────┘
                            │
                            │ Services delivered at
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        END-USER APPS (B2C)                           │
├─────────────────────────────────────────────────────────────────────┤
│  web-worker (SHARED)            │  guest-tablet (Cleaning Only)     │
│  • Cleaners (cleaning SaaS)     │  • Short-stay guests              │
│  • Maintenance workers (maint)  │  • At customer properties         │
│  • Can do BOTH (worker_type)    │  • Report issues                  │
│  • Reports maintenance issues   │  • AI-assisted triage             │
└─────────────────────────────────────────────────────────────────────┘
```

**Key Integration Point**: web-worker is **shared between both products** and can:
- Show cleaning jobs when `worker_type = CLEANER`
- Show maintenance jobs when `worker_type = MAINTENANCE`
- Show both when `worker_type = BOTH`
- Report maintenance issues during cleaning (cross-product workflow)

### 1.4 Key Architectural Decisions

**Trade-offs and Choices Made:**

1. **Multi-App Architecture vs. Single App with Routing**
   - **Chosen**: 8 separate applications
   - **Why**: Different user roles have completely different workflows, permissions, and UX needs
   - **Trade-off**: Higher deployment complexity vs. cleaner separation of concerns and independent deployment
   - **Evidence**: Cleanup Sprint 1 (APP-SEPARATION.md) showed issues when apps weren't properly separated

2. **Shared Database vs. Database-per-Tenant**
   - **Chosen**: Single PostgreSQL database with tenant-scoped queries
   - **Why**: Simpler deployment, cross-tenant workflows (PropertyShare, WorkerIssueReport routing)
   - **Trade-off**: Careful query isolation required vs. no risk of data leakage
   - **Evidence**: All Prisma queries include `tenant_id` or `service_provider_id` filters

3. **JWT Authentication vs. Session-Based**
   - **Chosen**: JWT with access_token + refresh_token
   - **Why**: Stateless API, supports mobile apps, enables multi-app SSO
   - **Trade-off**: Token refresh complexity vs. scalability
   - **Evidence**: All web apps use identical auth pattern (apps/*/src/lib/api.ts)

4. **Monorepo vs. Polyrepo**
   - **Chosen**: pnpm workspace monorepo with Turborepo
   - **Why**: Shared packages (@rightfit/database, @rightfit/shared), unified build
   - **Trade-off**: Larger repo size vs. easier dependency management
   - **Evidence**: `packages/database` and `packages/shared` used across all apps

5. **REST API vs. GraphQL**
   - **Chosen**: RESTful API with Express.js
   - **Why**: Simpler for team, well-understood patterns, easier debugging
   - **Trade-off**: Over-fetching/under-fetching vs. flexibility
   - **Evidence**: 34 route files in `apps/api/src/routes/`

6. **Unified System vs. Separate Microservices**
   - **Chosen**: Unified system with branded subdomains
   - **Why**: Cross-product workflows (cleaning → maintenance), faster development, shared database enables immediate consistency, lower infrastructure costs
   - **Trade-off**: Must scale entire system together vs. independent scaling per product
   - **Evidence**: WorkerIssueReport workflow requires data sharing across cleaning/maintenance/customer apps
   - **Future Path**: Can split into microservices when scale demands (100K+ users)

### 1.5 Development Strategy: Template-Based Approach

**Strategic Decision**: Use the **Cleaning SaaS** as the primary development template for the **Maintenance SaaS**.

**Rationale**:
The Cleaning SaaS (web-cleaning, web-customer, guest-tablet, web-worker for cleaners) is approximately 80% complete with proven workflows, polished UI/UX, and stable architecture. Rather than developing the Maintenance SaaS independently, we will:

1. **Complete Cleaning Portal First** (Phase 4A)
   - Polish web-cleaning to production-ready state
   - Complete web-worker for cleaning workers
   - Establish consistent UI/UX patterns (gradient cards, layouts, navigation)
   - Create shared component libraries (ui-core, ui-cleaning, ui-maintenance)

2. **Replicate to Maintenance Portal** (Phase 4B)
   - Use web-cleaning as design template for web-maintenance
   - Adapt UI patterns to maintenance-specific workflows
   - Replicate worker app patterns to maintenance worker functionality
   - Build out web-landlord using established patterns

3. **Customer, Landlord, and Guest Portals**
   - Maintain basic functionality for workflow connections
   - Defer detailed feature development to future phases
   - Focus on cross-portal integrations and data flows

**Benefits**:
- **Faster Development**: Proven patterns eliminate design decisions
- **Consistency**: Both products share visual language and UX patterns
- **Efficiency**: Component libraries enable rapid feature replication
- **Quality**: Template approach ensures consistent quality across products
- **Scalability**: Shared patterns make future maintenance easier

**Implementation Phases**:
- **Phase 4A** (6 weeks): Cleaning portal completion - establish template
- **Phase 4B** (6 weeks): Maintenance portal build - replicate from template
- **Phase 4C** (2-4 weeks): Production readiness - deployment and optimization

See [PROJECT-PLAN.md](PROJECT-PLAN.md) for detailed sprint plans (Sprints 1-7).

---

## 2. Existing Project Analysis

### 2.1 Application Overview Matrix

Based on actual code inspection and running applications:

| App | Port | Framework | Bundle Size | Auth | Status | Primary Users |
|-----|------|-----------|-------------|------|--------|---------------|
| **api** | 3001 | Express.js + Prisma | N/A (backend) | JWT middleware | ✅ Production-ready | All apps |
| **web-landlord** | 5173 | React 18.2 + Vite | ~850 KB | JWT | ✅ Complete | Traditional landlords |
| **web-cleaning** | 5174 | React 18.2 + Vite | ~920 KB | JWT | ✅ Complete | Cleaning companies |
| **web-maintenance** | 5175 | React 18.2 + Vite | ~900 KB | JWT | ✅ Complete | Maintenance companies |
| **web-customer** | 5176 | React 18.2 + Vite | ~880 KB | JWT | ✅ Complete | Short-let businesses |
| **guest-tablet** | 5177 | React 18.2 + Vite + MUI | 735 KB | None (QR code) | ✅ Complete | Anonymous guests |
| **web-worker** | 5178 | React 18.2 + Vite | ~400 KB | JWT | ⚠️ **Partial** | Cleaners/maintenance workers |
| **mobile** | N/A | Expo 52 + RN 0.76 | N/A | JWT | ✅ Complete | Landlords (mobile) |

### 2.2 App 1: API Server (Port 3001)

**Purpose**: Multi-tenant backend API serving all frontend applications

**Technology Stack**:
- Runtime: Node.js 20+
- Framework: Express.js
- ORM: Prisma
- Database: PostgreSQL
- Validation: Zod (@rightfit/shared schemas)
- Auth: JWT (jsonwebtoken)
- File Upload: Multer + Sharp (image processing)
- Email: Nodemailer
- Cron: node-cron (CronService)

**Architecture Patterns**:
```typescript
// Middleware Stack (apps/api/src/index.ts)
1. helmet() - Security headers
2. cors() - Cross-origin (allows all localhost in dev)
3. compression() - Gzip responses
4. express.json({ limit: '10mb' }) - Body parsing
5. Rate limiting (per-route)
6. JWT authentication (authMiddleware)
7. Error handler (centralized)
```

**Multi-Tenant Isolation Pattern**:
```typescript
// Every endpoint follows this pattern:
router.get('/api/cleaning-jobs', authMiddleware, async (req, res) => {
  const serviceProviderId = req.query.service_provider_id; // REQUIRED

  // Prisma query ALWAYS filters by tenant
  const jobs = await prisma.cleaningJob.findMany({
    where: {
      service: {
        service_provider_id: serviceProviderId // Tenant scope
      }
    }
  });
});
```

**Current Endpoints Count**: 34 route files × average 6 endpoints = ~200 API endpoints

### 2.3 App 2: web-landlord (Port 5173)

**Purpose**: Legacy property management for traditional landlords who self-manage

**Pages** (9 pages):
- Login.tsx / Register.tsx - Authentication
- Properties.tsx - Landlord's own properties (via propertiesAPI)
- Tenants.tsx - Property tenant management
- WorkOrders.tsx - Work order tracking
- Contractors.tsx - Contractor directory
- Certificates.tsx - Property certifications (gas, electrical, EPC)
- Financial.tsx - Rent collection, expenses

**API Usage Pattern**:
```typescript
// Uses propertiesAPI (NOT customerPropertiesAPI)
export const propertiesAPI = {
  list: () => api.get('/api/properties'),           // Landlord's OWN properties
  get: (id) => api.get(`/api/properties/${id}`),
  create: (data) => api.post('/api/properties', data)
}
```

**Key Characteristics**:
- ✅ Full CRUD for landlord-owned properties
- ✅ Direct contractor management
- ✅ No service provider integration
- ✅ Self-service work order management

### 2.4 App 3: web-cleaning (Port 5174)

**Purpose**: Cleaning company operations management

**Pages** (15+ pages):
- Customers.tsx / AddCustomer.tsx / CustomerDetails.tsx / EditCustomer.tsx
- Properties.tsx / AddProperty.tsx / EditProperty.tsx (Customer properties)
- Workers.tsx / WorkerDetails.tsx
- CleaningContracts.tsx / CreateContract.tsx / ContractDetails.tsx
- ChecklistTemplates.tsx
- CleaningDashboard.tsx
- CleaningJobDetails.tsx / CreateCleaningJob.tsx

**API Usage Pattern**:
```typescript
// CRITICAL: Uses customerPropertiesAPI (NOT propertiesAPI)
export const customerPropertiesAPI = {
  list: (serviceProviderId) =>
    api.get(`/api/customer-properties?service_provider_id=${serviceProviderId}`),
  get: (id, serviceProviderId) =>
    api.get(`/api/customer-properties/${id}?service_provider_id=${serviceProviderId}`)
}

export const cleaningJobsAPI = {
  list: (serviceProviderId, filters) =>
    api.get(`/api/cleaning-jobs?service_provider_id=${serviceProviderId}`, { params: filters }),
  create: (data) => api.post('/api/cleaning-jobs', data),
  assignWorker: (id, workerId) =>
    api.put(`/api/cleaning-jobs/${id}/assign`, { assigned_worker_id: workerId })
}
```

**Key Features**:
- ✅ Contract-based recurring cleaning
- ✅ Customer relationship management
- ✅ Worker assignment and scheduling
- ✅ Checklist template system
- ✅ Timesheet tracking (CleaningJobTimesheet)
- ✅ Invoice generation (CleaningInvoice)
- ✅ Property calendar sync (guest checkout → cleaning window)

### 2.5 App 4: web-maintenance (Port 5175)

**Purpose**: Maintenance company operations management

**Pages** (10+ pages):
- Properties.tsx (Customer properties)
- Workers.tsx
- Contractors.tsx (External contractors for overflow work)
- MaintenanceDashboard.tsx
- MaintenanceJobDetails.tsx / CreateMaintenanceJob.tsx

**Key Features**:
- ✅ Quote-based workflow (QUOTE_PENDING → QUOTE_SENT → APPROVED → SCHEDULED → COMPLETED)
- ✅ External contractor management for overflow
- ✅ Issue routing from guests and workers
- ✅ Photo documentation (issue → work-in-progress → completion)
- ✅ Customer approval required before starting work

**Unique Workflow**:
1. Issue reported (guest OR worker) → MaintenanceJob (QUOTE_PENDING)
2. Maintenance company → Submit quote
3. Customer reviews in web-customer → Approves/Declines
4. If approved → Assign to worker OR external contractor
5. Complete job → Upload completion photos
6. Invoice customer

### 2.6 App 5: web-customer (Port 5176)

**Purpose**: Customer portal for short-let businesses to request and manage services

**Pages** (13+ pages):
- Properties.tsx / PropertyDetails.tsx (VIEW customer's properties)
- QuoteApproval.tsx (Approve/decline maintenance quotes)
- Invoices.tsx / InvoiceDetails.tsx (Payment history)
- Financial.tsx (Spending overview)
- Settings.tsx (Auto-pay, notifications)
- GuestIssues.tsx / GuestIssueDetails.tsx (Issues reported by guests)
- Maintenance.tsx (New maintenance feature)
- CustomerDashboard.tsx (Overview, pending quotes, recent jobs)
- CleaningJobHistory.tsx (Read-only view)

**Key Characteristics**:
- ✅ Read-only access to properties (managed by service providers)
- ✅ Quote approval workflow (approve within auto-approval limit)
- ✅ Guest issue triage
- ✅ Invoice payment
- ❌ Cannot create jobs directly (requests go through service providers)
- ❌ Cannot assign workers (service providers handle staffing)

**Customer Preferences** (CustomerPreferences model):
```typescript
{
  auto_pay_enabled: boolean,
  notification_email: boolean,
  notification_sms: boolean,
  calendar_sync_enabled: boolean,
  quote_auto_approve_limit: number  // Auto-approve quotes under £X
}
```

### 2.7 App 6: guest-tablet (Port 5177)

**Purpose**: Anonymous guest access via QR code at short-let properties

**Pages** (5 pages):
- GuestWelcome.tsx - Property info, WiFi, check-out instructions
- AIChat.tsx - Q&A with AI assistant
- ReportIssue.tsx - 3-step wizard (category → description+photos → AI assessment)
- DIYGuide.tsx - Step-by-step repair instructions
- KnowledgeBase.tsx - FAQs, house rules, local recommendations

**API Usage** (Anonymous - No Auth):
```typescript
export const guestAPI = {
  createSession: (propertyId) =>
    api.post('/api/guest/sessions', { property_id: propertyId }),

  askQuestion: (sessionId, question) =>
    api.post('/api/guest/questions', { session_id: sessionId, question }),

  reportIssue: (sessionId, issueData) =>
    api.post('/api/guest/issues', { session_id: sessionId, ...issueData }),

  getDIYGuide: (issueType) =>
    api.get(`/api/guest/diy-guides/${issueType}`),

  getKnowledgeBase: (propertyId) =>
    api.get(`/api/guest/knowledge/${propertyId}`)
}
```

**Key Characteristics**:
- ✅ **No authentication** - Session created via QR code scan
- ✅ **Fullscreen UI** - No navigation sidebar, touch-optimized
- ✅ **Material-UI** - Uses MUI components (different from other web apps)
- ✅ **AI-powered** - Issue triage, Q&A, DIY suggestions
- ✅ **Guest analytics** - Tracks questions asked, issues reported, DIY attempts

**Bundle Size**: 735 KB (gzipped: 215 KB) ✅ Smallest web app

**AI Features**:
```typescript
// AI Assessment on issue report
{
  ai_severity: "MEDIUM",           // AI-determined priority
  ai_category: "PLUMBING",         // AI categorization
  ai_confidence: 0.85,             // Confidence score
  recommended_action: "SEND_TECH"  // "DIY" | "SEND_TECH" | "ASSIGN_TO_NEXT_CLEANING"
}
```

### 2.8 App 7: web-worker (Port 5178) ⚠️

**Purpose**: Worker-facing app for cleaners and maintenance technicians

**Current Status**: **PARTIALLY IMPLEMENTED**

**Implemented Pages**:
- auth/Login.tsx - ✅ Complete
- auth/ForgotPassword.tsx - ✅ Complete
- dashboard/WorkerDashboard.tsx - ✅ Implemented (stats, today's jobs)
- jobs/JobDetails.tsx - ✅ Implemented (view job, checklist)
- schedule/MySchedule.tsx - ✅ Calendar view
- availability/ManageAvailability.tsx - ✅ Block time off
- profile/WorkerProfile.tsx - ✅ View/edit profile
- history/WorkHistory.tsx - ✅ Completed jobs list

**Missing/Incomplete Features**:
- ⚠️ Job completion workflow (checklist marking, photo upload)
- ⚠️ Start/end job timing (CleaningJobTimesheet creation)
- ⚠️ Issue reporting during job (WorkerIssueReport)
- ⚠️ Offline support (web app is online-only)
- ⚠️ Push notifications

**Authentication** (Two-step):
```typescript
1. POST /api/auth/login (email + password) → JWT token
2. GET /api/workers/me (with token) → Worker profile by email

// LocalStorage:
- worker_token (JWT)
- worker_id
- service_provider_id
```

**⚠️ ARCHITECTURAL ISSUE FOUND**:
- Duplicate folder: `apps/web-worker/apps/web-worker/src/` (28KB of empty scaffolding)
- **Recommendation**: Delete `apps/web-worker/apps/` entirely

### 2.9 App 8: mobile (Expo + React Native)

**Purpose**: Mobile app for landlords (not workers - currently)

**Technology Stack**:
- Expo: ~52.0.0
- React Native: 0.76.9
- Database: @nozbe/watermelondb 0.28.0 (Offline-first local SQLite)
- Navigation: @react-navigation/native 6.1.9
- State: Context API (Auth, Network, Theme, Database)
- Offline: Full offline support with sync queue

**Architecture Pattern - Offline-First**:
```typescript
// apps/mobile/App.tsx - Provider stack
<DatabaseProvider>          ← WatermelonDB local SQLite
  <NetworkProvider>         ← Online/offline detection
    <ThemeProvider>         ← Dark/light mode
      <AuthProvider>        ← JWT authentication
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </AuthProvider>
    </ThemeProvider>
  </NetworkProvider>
</DatabaseProvider>
```

**Screens**:
- auth/ - Login, Register
- properties/ - List, Details, Add
- workOrders/ - List, Details, Create
- contractors/ - List, Details
- certificates/ - Certificates
- profile/ - Profile

**Key Features**:
- ✅ Offline-first with WatermelonDB (local SQLite)
- ✅ Background sync queue
- ✅ Photo capture with compression
- ✅ Push notifications (Expo Notifications)
- ✅ Haptic feedback
- ❌ Currently landlord-focused (NOT worker app)

---

## 3. Technology Stack

### 3.1 Backend Stack

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Runtime** | Node.js | 20+ | JavaScript runtime |
| **Framework** | Express.js | Latest | RESTful API server |
| **Database** | PostgreSQL | Latest | Primary data store |
| **ORM** | Prisma | Latest | Type-safe database client |
| **Validation** | Zod | Latest | Runtime type validation |
| **Authentication** | jsonwebtoken | Latest | JWT token generation/verification |
| **Password Hashing** | bcryptjs | Latest | Secure password storage |
| **File Upload** | Multer | Latest | Multipart form handling |
| **Image Processing** | Sharp | Latest | Thumbnail generation |
| **Email** | Nodemailer | Latest | Transactional emails |
| **Scheduling** | node-cron | Latest | Background jobs |
| **Logging** | Winston | Latest | Application logging |

### 3.2 Frontend Stack (Web Apps)

| Category | Technology | Version | Usage |
|----------|-----------|---------|-------|
| **Framework** | React | 18.2.0 | All 6 web apps |
| **Build Tool** | Vite | 4.4.0+ | Fast dev server, optimized builds |
| **Language** | TypeScript | 5.3.3 | Type safety |
| **Styling** | TailwindCSS | 3.3.6 | Utility-first CSS |
| **Routing** | React Router | 6.16.0+ | Client-side routing |
| **HTTP Client** | Axios | Latest | API requests with interceptors |
| **Date Handling** | date-fns | 2.30.0 | Date formatting/manipulation |
| **Icons** | Lucide React | 0.294.0 | web-worker icons |
| **Icons (Guest)** | Material-UI | 5.14.0 | guest-tablet only |
| **Image Compression** | browser-image-compression | 2.0.2 | Client-side photo compression |
| **Calendar** | react-calendar | 4.6.1 | web-worker schedule view |

### 3.3 Mobile Stack

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Framework** | React Native | 0.76.9 | Native mobile UI |
| **Platform** | Expo | 52.0.0 | Development/build platform |
| **Navigation** | React Navigation | 6.1.9 | Native navigation |
| **Local Database** | WatermelonDB | 0.28.0 | Offline-first SQLite |
| **State Management** | Context API | Built-in | Global state |
| **Network Detection** | NetInfo | 11.4.1 | Online/offline status |
| **Image Picker** | expo-image-picker | 16.0.6 | Photo capture |
| **Push Notifications** | expo-notifications | 0.29.13 | Notifications |
| **Haptics** | expo-haptics | 14.0.1 | Touch feedback |

### 3.4 Shared Packages

| Package | Location | Purpose | Used By |
|---------|----------|---------|---------|
| **@rightfit/database** | packages/database | Prisma client, schema | API, all web apps |
| **@rightfit/shared** | packages/shared | Zod schemas, types, constants | API, all apps |

### 3.5 Development Tools

| Tool | Purpose | Configuration |
|------|---------|---------------|
| **pnpm** | Package manager | Workspace monorepo |
| **Turborepo** | Build orchestration | turbo.json |
| **ESLint** | Code linting | .eslintrc |
| **Prettier** | Code formatting | .prettierrc |
| **TypeScript** | Type checking | tsconfig.json per app |

---

## 4. Data Models & Schema

### 4.1 Core Multi-Tenancy Models

#### Tenant Model
```prisma
model Tenant {
  id                     String                 @id @default(uuid())
  tenant_name            String                 @db.VarChar(100)
  subscription_status    SubscriptionStatus     @default(TRIAL)
  trial_ends_at          DateTime?

  // Relations - All data scoped to tenant
  service_provider       ServiceProvider?       // If tenant is service provider
  users                  User[]                 // Admin/member users
  properties             Property[]             // Landlord properties
  work_orders            WorkOrder[]            // Landlord work orders
  contractors            Contractor[]           // Landlord contractors
  certificates           Certificate[]
  photos                 Photo[]

  // Property sharing (cross-tenant)
  shared_properties      PropertyShare[]        @relation("SharedProperties")
  received_properties    PropertyShare[]        @relation("ReceivedProperties")
}
```

**Purpose**: Root multi-tenant isolation boundary. Every record belongs to a tenant.

---

#### ServiceProvider Model
```prisma
model ServiceProvider {
  id                   String               @id @default(uuid())
  business_name        String               @db.VarChar(100)
  owner_name           String               @db.VarChar(100)
  email                String               @db.VarChar(255)
  phone                String               @db.VarChar(20)
  tenant_id            String               @unique

  // Relations
  tenant               Tenant               @relation(...)
  workers              Worker[]             // Employees
  customers            Customer[]           // Business customers
  services             Service[]            // Cleaning/Maintenance services
  external_contractors ExternalContractor[]
  checklist_templates  ChecklistTemplate[]
}
```

**Purpose**: Represents cleaning/maintenance companies (Service Provider Tenants)

---

#### Customer Model
```prisma
model Customer {
  id                          String               @id @default(uuid())
  customer_number             String?              @unique
  service_provider_id         String               // ← Works WITH this provider
  business_name               String
  contact_name                String
  email                       String
  phone                       String
  customer_type               CustomerType         // SHORT_LET_MANAGEMENT, LANDLORD, etc.

  // Contract status
  has_cleaning_contract       Boolean              @default(false)
  has_maintenance_contract    Boolean              @default(false)
  bundled_discount_percentage Decimal              @default(0)
  payment_terms               PaymentTerms         @default(NET_14)

  // Relations
  service_provider            ServiceProvider      @relation(...)
  customer_properties         CustomerProperty[]   // Properties they manage
  cleaning_jobs               CleaningJob[]
  maintenance_jobs            MaintenanceJob[]
  cleaning_contracts          CleaningContract[]
  portal_user                 CustomerPortalUser?  // Login for web-customer
  preferences                 CustomerPreferences?
}
```

**Purpose**: Short-let businesses, landlords who are CLIENTS of service providers

---

#### Worker Model
```prisma
model Worker {
  id                       String                 @id @default(uuid())
  service_provider_id      String                 // ← Works FOR this provider
  user_id                  String?                // Link to User for authentication
  first_name               String
  last_name                String
  email                    String                 // Used for login matching
  phone                    String

  // Employment
  worker_type              WorkerType             // CLEANER | MAINTENANCE | BOTH
  employment_type          EmploymentType         // FULL_TIME | PART_TIME | CONTRACTOR
  hourly_rate              Decimal
  is_active                Boolean                @default(true)
  max_weekly_hours         Int?

  // Skills & Performance
  skills                   String[]               @db.VarChar(100)
  experience_years         Int?
  jobs_completed           Int                    @default(0)
  average_rating           Decimal?

  // Relations
  service_provider         ServiceProvider        @relation(...)
  cleaning_jobs            CleaningJob[]          // Assigned jobs
  maintenance_jobs         MaintenanceJob[]
  cleaning_timesheets      CleaningJobTimesheet[]
  availability             WorkerAvailability[]
  certificates             WorkerCertificate[]
  history                  WorkerHistory[]
  issue_reports            WorkerIssueReport[]
}
```

**Purpose**: Cleaners and maintenance workers employed by service providers

---

### 4.2 Property Models

#### Property (Landlord-Owned)
```prisma
model Property {
  id                     String                 @id @default(uuid())
  tenant_id              String                 // Landlord tenant
  owner_user_id          String
  name                   String
  address_line1          String
  city                   String
  postcode               String
  property_type          PropertyType
  bedrooms               Int
  bathrooms              Int
  access_instructions    String?
  status                 PropertyStatus

  // Relations
  tenant                 Tenant                 @relation(...)
  owner                  User                   @relation(...)
  work_orders            WorkOrder[]            // Landlord work orders
  shares                 PropertyShare[]        // Shared with service providers
  certificates           Certificate[]
  property_tenants       PropertyTenant[]       // Renters
}
```

#### CustomerProperty (Service Provider's Customer Properties)
```prisma
model CustomerProperty {
  id                             String                 @id @default(uuid())
  customer_id                    String                 // Customer who owns this
  property_name                  String
  address                        String
  postcode                       String
  property_type                  String
  bedrooms                       Int
  bathrooms                      Int
  access_instructions            String?
  access_code                    String?

  // Guest portal (for short-let properties)
  guest_portal_enabled           Boolean                @default(false)
  guest_portal_qr_code_url       String?

  // Enhanced details for workers
  photo_urls                     Json?                  // [{url, caption, type}]
  utility_locations              Json?                  // {stopTap, waterMeter, fuseBox}
  emergency_contacts             Json?                  // [{name, phone, relation}]
  cleaner_notes                  String?
  wifi_ssid                      String?
  wifi_password                  String?
  parking_info                   String?
  pet_info                       String?

  // Relations
  customer                       Customer               @relation(...)
  cleaning_jobs                  CleaningJob[]
  maintenance_jobs               MaintenanceJob[]
  guest_sessions                 GuestSession[]         // Guest tablet sessions
  guest_issue_reports            GuestIssueReport[]
  worker_issue_reports           WorkerIssueReport[]
  knowledge_base                 PropertyKnowledgeBase[]
  property_calendars             PropertyCalendar[]     // Guest checkout/checkin
}
```

**Key Difference**:
- `Property` = Landlord's own properties
- `CustomerProperty` = Service provider's customer properties

---

### 4.3 Job Models

#### CleaningJob
```prisma
model CleaningJob {
  id                           String                 @id @default(uuid())
  service_id                   String?
  property_id                  String                 // CustomerProperty
  customer_id                  String                 // Customer who requested
  contract_id                  String?                // CleaningContract (recurring)
  assigned_worker_id           String?                // Worker assigned

  // Scheduling
  scheduled_date               DateTime?              @db.Date
  scheduled_start_time         String?                // "09:00"
  scheduled_end_time           String?                // "11:00"
  actual_start_time            DateTime?
  actual_end_time              DateTime?

  // Checklist
  checklist_template_id        String?
  checklist_items              Json?                  // Dynamic checklist
  checklist_completed_items    Int                    @default(0)
  checklist_total_items        Int                    @default(0)

  // Status & Photos
  status                       JobStatus              // PENDING | SCHEDULED | IN_PROGRESS | COMPLETED
  before_photos                String[]
  after_photos                 String[]
  issue_photos                 String[]               // Issues found during clean
  completion_notes             String?

  // Pricing
  pricing_type                 String                 // "PER_JOB" | "HOURLY"
  quoted_price                 Decimal
  actual_price                 Decimal?

  // Maintenance tracking
  maintenance_issues_found     Int                    @default(0)
  maintenance_quotes_generated Int                    @default(0)

  // Relations
  property                     CustomerProperty       @relation(...)
  customer                     Customer               @relation(...)
  assigned_worker              Worker?                @relation(...)
  contract                     CleaningContract?      @relation(...)
  timesheets                   CleaningJobTimesheet[] // Time tracking
  history                      CleaningJobHistory[]   // Audit trail
  worker_issue_reports         WorkerIssueReport[]    // Issues found
}
```

#### MaintenanceJob
```prisma
model MaintenanceJob {
  id                           String              @id @default(uuid())
  service_id                   String
  property_id                  String              // CustomerProperty
  customer_id                  String              // Customer who requested
  assigned_worker_id           String?             // Internal worker
  assigned_contractor_id       String?             // External contractor

  // Source tracking
  source                       MaintenanceSource   // CUSTOMER_REQUEST | CLEANER_REPORT | GUEST_REPORT
  source_cleaning_job_id       String?             // If reported during cleaning
  source_guest_report_id       String?             // If reported by guest

  // Details
  category                     String              // PLUMBING, ELECTRICAL, etc.
  priority                     MaintenancePriority // URGENT | HIGH | MEDIUM | LOW
  title                        String
  description                  String?

  // Scheduling
  requested_date               DateTime?           @db.Date
  scheduled_date               DateTime?           @db.Date
  scheduled_start_time         String?
  scheduled_end_time           String?
  completed_date               DateTime?

  // Quote workflow
  status                       MaintenanceStatus   // QUOTE_PENDING → QUOTE_SENT → APPROVED → SCHEDULED → COMPLETED
  quote_id                     String?
  estimated_hours              Decimal?
  estimated_parts_cost         Decimal?
  estimated_labor_cost         Decimal?
  estimated_total              Decimal?
  actual_total                 Decimal?

  // Photos
  issue_photos                 String[]            // Before
  work_in_progress_photos      String[]            // During
  completion_photos            String[]            // After

  // AI assessment (if from guest report)
  ai_severity_score            Int?
  ai_category_confidence       Decimal?

  completion_notes             String?
  customer_satisfaction_rating Int?

  // Relations
  property                     CustomerProperty    @relation(...)
  customer                     Customer            @relation(...)
  assigned_worker              Worker?             @relation(...)
  assigned_contractor          ExternalContractor? @relation(...)
  quote                        Quote?              @relation(...)
  source_cleaning_job          CleaningJob?        @relation(...)
  source_guest_report          GuestIssueReport?   @relation(...)
}
```

---

### 4.4 Guest Tablet Models

#### GuestSession
```prisma
model GuestSession {
  id                 String           @id @default(uuid())
  property_id        String           // CustomerProperty
  device_id          String?          // Tablet identifier
  session_start      DateTime         @default(now())
  session_end        DateTime?
  interactions_count Int              @default(0)

  // Relations
  property           CustomerProperty @relation(...)
  questions          GuestQuestion[]  // AI chat history
  issues             GuestIssue[]     // Issues reported
}
```

#### GuestIssueReport
```prisma
model GuestIssueReport {
  id                         String           @id @default(uuid())
  property_id                String
  guest_name                 String?
  guest_phone                String?
  guest_email                String?
  issue_type                 String           // PLUMBING, ELECTRICAL, etc.
  issue_description          String
  photos                     String[]

  // AI Assessment
  ai_severity                String?          // CRITICAL | HIGH | MEDIUM | LOW
  ai_category                String?
  ai_confidence              Decimal?
  ai_analysis_notes          String?

  // Routing
  status                     GuestIssueStatus // SUBMITTED → TRIAGED → WORK_ORDER_CREATED → RESOLVED
  created_maintenance_job_id String?          // If escalated to maintenance
  assigned_to_next_cleaning  Boolean          @default(false) // If can wait for cleaner
  guest_notified             Boolean          @default(false)
  guest_notification_message String?

  reported_at                DateTime         @default(now())
  triaged_at                 DateTime?
  resolved_at                DateTime?

  // Relations
  property                   CustomerProperty @relation(...)
  maintenance_jobs           MaintenanceJob[]
}
```

---

### 4.5 Workflow Integration Models

#### WorkerIssueReport
```prisma
model WorkerIssueReport {
  id                         String              @id @default(uuid())
  property_id                String              // Where issue found
  customer_id                String              // Customer to notify
  worker_id                  String              // Worker who found it
  cleaning_job_id            String?             // During which job

  issue_type                 String              // "MAINTENANCE" | "DAMAGE" | "SAFETY"
  title                      String
  issue_description          String
  category                   String              // PLUMBING, ELECTRICAL, etc.
  priority                   String              // URGENT | HIGH | MEDIUM | LOW
  photos                     String[]

  // Customer approval workflow
  status                     WorkerIssueStatus   // SUBMITTED → CUSTOMER_REVIEWING → APPROVED → WORK_ORDER_CREATED
  customer_response          String?
  customer_approved_at       DateTime?
  customer_rejected_at       DateTime?
  rejection_reason           String?

  created_maintenance_job_id String?

  reported_at                DateTime            @default(now())
  triaged_at                 DateTime?
  resolved_at                DateTime?

  // Relations
  property                   CustomerProperty    @relation(...)
  customer                   Customer            @relation(...)
  worker                     Worker              @relation(...)
  cleaning_job               CleaningJob?        @relation(...)
  created_maintenance_job    MaintenanceJob?     @relation(...)
}
```

**Workflow**: Worker finds issue → Reports → Customer reviews in web-customer → Approves → Creates MaintenanceJob

---

### 4.6 Key Enums

```prisma
enum WorkerType {
  CLEANER
  MAINTENANCE
  BOTH
}

enum JobStatus {
  PENDING       // Created but not scheduled
  SCHEDULED     // Date/time assigned
  IN_PROGRESS   // Worker started
  COMPLETED     // Finished
  CANCELLED
}

enum MaintenanceStatus {
  QUOTE_PENDING
  QUOTE_SENT
  APPROVED
  SCHEDULED
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

enum MaintenanceSource {
  CUSTOMER_REQUEST
  CLEANER_REPORT
  GUEST_REPORT
  PREVENTIVE_MAINTENANCE
  EMERGENCY
}

enum CustomerType {
  LANDLORD
  LETTING_AGENT
  PROPERTY_MANAGEMENT
  SHORT_LET_MANAGEMENT  // ← Primary use case
  HOLIDAY_LETS
  COMMERCIAL
}
```

---

## 5. Component Architecture

### 5.1 Frontend Architecture Pattern (All Web Apps)

```
apps/web-*/
├── src/
│   ├── App.tsx                    # Root component, routing
│   ├── main.tsx                   # React entry point
│   ├── index.css                  # Global styles (TailwindCSS)
│   │
│   ├── components/
│   │   ├── ui/                    # ⚠️ DUPLICATED across apps
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Toast.tsx
│   │   │   ├── Spinner.tsx
│   │   │   ├── Badge.tsx
│   │   │   └── EmptyState.tsx
│   │   │
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx      # Sidebar + header
│   │   │   └── Header.tsx
│   │   │
│   │   └── [domain-specific]/     # App-specific components
│   │       ├── jobs/
│   │       ├── workers/
│   │       └── properties/
│   │
│   ├── pages/                     # Route components
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   └── [feature-pages]/
│   │
│   ├── contexts/                  # React Context providers
│   │   ├── AuthContext.tsx        # Authentication state
│   │   └── ThemeContext.tsx       # Dark/light mode
│   │
│   ├── lib/
│   │   └── api.ts                 # Axios instance + API methods
│   │
│   ├── types/                     # TypeScript interfaces
│   │   └── index.ts
│   │
│   └── utils/                     # Helper functions
│       ├── formatters.ts
│       └── validators.ts
│
├── public/                        # Static assets
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

### 5.2 Shared Component Library Strategy

**Current State**: UI components are **duplicated** across all 6 web apps

**Impact**:
- 🔴 5-6x maintenance burden (bug fixes must be applied to all apps)
- 🔴 Inconsistent UX (components can drift out of sync)
- 🔴 Larger codebase (~500 KB of duplicate code)

**Example - Button Component Duplication**:
```
apps/web-landlord/src/components/ui/Button.tsx     (identical)
apps/web-cleaning/src/components/ui/Button.tsx     (identical)
apps/web-maintenance/src/components/ui/Button.tsx  (identical)
apps/web-customer/src/components/ui/Button.tsx     (identical)
apps/web-worker/src/components/ui/Button.tsx       (identical)
apps/guest-tablet/                                  (uses MUI instead)
```

**Recommendation**: **Product-Based Package Strategy** (aligned with unified deployment)

Given the two-product architecture (Cleaning SaaS + Maintenance SaaS), create three shared packages:

```
packages/
├── ui-core/                    # Shared by ALL apps
│   ├── src/
│   │   ├── Button.tsx          # Core interactive components
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── Toast.tsx
│   │   ├── Spinner.tsx
│   │   ├── Badge.tsx
│   │   ├── EmptyState.tsx
│   │   └── index.ts
│   └── package.json
│
├── ui-cleaning/                # Cleaning Product apps
│   ├── src/
│   │   ├── PropertyCard.tsx    # Short-let property components
│   │   ├── CleaningJobCard.tsx
│   │   ├── CleaningChecklist.tsx
│   │   ├── GuestIssueCard.tsx
│   │   ├── TimesheetCard.tsx
│   │   └── index.ts
│   └── package.json
│
│   Used by: web-cleaning, web-customer, guest-tablet, web-worker
│
└── ui-maintenance/             # Maintenance Product apps
    ├── src/
    │   ├── LandlordPropertyCard.tsx  # Traditional property components
    │   ├── MaintenanceJobCard.tsx
    │   ├── QuoteCard.tsx
    │   ├── WorkOrderCard.tsx
    │   ├── ContractorCard.tsx
    │   └── index.ts
    └── package.json

    Used by: web-maintenance, web-landlord, web-worker
```

**Usage Examples**:

```typescript
// In web-cleaning (Cleaning SaaS)
import { Button, Card, Modal } from '@rightfit/ui-core'
import { PropertyCard, CleaningJobCard } from '@rightfit/ui-cleaning'

// In web-maintenance (Maintenance SaaS)
import { Button, Card, Modal } from '@rightfit/ui-core'
import { QuoteCard, WorkOrderCard } from '@rightfit/ui-maintenance'

// In web-worker (SHARED - supports both products!)
import { Button, Card, Modal } from '@rightfit/ui-core'
import { CleaningJobCard, CleaningChecklist } from '@rightfit/ui-cleaning'
import { MaintenanceJobCard, QuoteCard } from '@rightfit/ui-maintenance'

// Conditional rendering based on worker type
{worker.worker_type === 'CLEANER' && <CleaningJobCard job={job} />}
{worker.worker_type === 'MAINTENANCE' && <MaintenanceJobCard job={job} />}
```

**Migration Plan**:
1. **Phase 1**: Create `packages/ui-core` with core components (Button, Input, Card, Modal, Toast)
2. **Phase 2**: Create `packages/ui-cleaning` with cleaning-specific components
3. **Phase 3**: Create `packages/ui-maintenance` with maintenance-specific components
4. **Phase 4**: Migrate apps one by one (web-cleaning → web-customer → web-maintenance → web-landlord → web-worker)

**Note on Mobile Apps**: Future mobile apps (React Native) for each product will use React Native Paper or similar, not web components. Consider creating `packages/ui-mobile-core`, `packages/ui-mobile-cleaning`, `packages/ui-mobile-maintenance` when needed.

---

### 5.3 API Client Pattern (All Web Apps)

**Pattern Used**: Axios instance with interceptors

```typescript
// Example: apps/web-cleaning/src/lib/api.ts

import axios from 'axios'

const API_BASE_URL = 'http://localhost:3001'

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
})

// Request interceptor - Add JWT token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor - Auto-refresh on 401
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      const refreshToken = localStorage.getItem('refresh_token')
      if (refreshToken) {
        const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
          refresh_token: refreshToken
        })

        const { access_token } = response.data
        localStorage.setItem('access_token', access_token)

        originalRequest.headers.Authorization = `Bearer ${access_token}`
        return api(originalRequest)
      }
    }

    return Promise.reject(error)
  }
)

// API methods
export const cleaningJobsAPI = {
  list: (serviceProviderId: string, filters: any) =>
    api.get('/api/cleaning-jobs', {
      params: { service_provider_id: serviceProviderId, ...filters }
    }),

  get: (id: string, serviceProviderId: string) =>
    api.get(`/api/cleaning-jobs/${id}`, {
      params: { service_provider_id: serviceProviderId }
    }),

  create: (data: any) =>
    api.post('/api/cleaning-jobs', data),

  update: (id: string, data: any) =>
    api.put(`/api/cleaning-jobs/${id}`, data)
}
```

**Consistency**: This pattern is identical across all web apps (landlord, cleaning, maintenance, customer, worker)

---

## 6. API Design

### 6.1 API Endpoint Categories

From code review of `apps/api/src/routes/*.ts` (34 route files):

```typescript
// Authentication (auth.ts)
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
POST   /api/auth/change-password

// Properties - Landlord (properties.ts)
GET    /api/properties                    ?tenant_id (from JWT)
POST   /api/properties
GET    /api/properties/:id
PUT    /api/properties/:id
DELETE /api/properties/:id

// Customer Properties - Service Provider (customer-properties.ts)
GET    /api/customer-properties           ?service_provider_id (required)
POST   /api/customer-properties
GET    /api/customer-properties/:id       ?service_provider_id
PUT    /api/customer-properties/:id
DELETE /api/customer-properties/:id

// Workers (workers.ts)
GET    /api/workers/me                    ← Get worker by JWT email
GET    /api/workers                       ?service_provider_id
POST   /api/workers
GET    /api/workers/:id                   ?service_provider_id
PUT    /api/workers/:id
DELETE /api/workers/:id
GET    /api/workers/:id/stats             ← Dashboard stats
POST   /api/workers/:id/photo
GET    /api/workers/:id/certificates
POST   /api/workers/:id/certificates

// Worker Availability (worker-availability.ts)
GET    /api/worker-availability           ?worker_id
POST   /api/worker-availability
PUT    /api/worker-availability/:id
DELETE /api/worker-availability/:id

// Cleaning Jobs (cleaning-jobs.ts)
GET    /api/cleaning-jobs                 ?service_provider_id&worker_id&scheduled_date
POST   /api/cleaning-jobs
GET    /api/cleaning-jobs/:id
PUT    /api/cleaning-jobs/:id
DELETE /api/cleaning-jobs/:id
GET    /api/cleaning-jobs/:id/history
PUT    /api/cleaning-jobs/:id/assign
PUT    /api/cleaning-jobs/:id/complete

// Cleaning Timesheets (cleaning-timesheets.ts)
GET    /api/cleaning-timesheets           ?cleaning_job_id
POST   /api/cleaning-timesheets
GET    /api/cleaning-timesheets/:id
PUT    /api/cleaning-timesheets/:id

// Maintenance Jobs (maintenance-jobs.ts)
GET    /api/maintenance-jobs              ?service_provider_id&status
POST   /api/maintenance-jobs
GET    /api/maintenance-jobs/:id
PUT    /api/maintenance-jobs/:id
DELETE /api/maintenance-jobs/:id
POST   /api/maintenance-jobs/:id/submit-quote
POST   /api/maintenance-jobs/:id/decline
PUT    /api/maintenance-jobs/:id/assign

// Worker Issues (worker-issues.ts)
GET    /api/worker-issues                 ?service_provider_id
POST   /api/worker-issues
GET    /api/worker-issues/:id
PUT    /api/worker-issues/:id/approve
PUT    /api/worker-issues/:id/reject

// Guest (guest.ts) - NO AUTH REQUIRED
POST   /api/guest/sessions
POST   /api/guest/questions
POST   /api/guest/issues
GET    /api/guest/diy-guides/:type
GET    /api/guest/knowledge/:propertyId

// Guest Issues (guest-issues.ts) - WITH AUTH (service provider views)
GET    /api/guest-issues                  ?service_provider_id
GET    /api/guest-issues/:id

// Customer Portal (customer-portal.ts)
POST   /api/customer-portal/auth/login
POST   /api/customer-portal/auth/register
GET    /api/customer-portal/dashboard
GET    /api/customer-portal/properties/:id/history
PUT    /api/customer-portal/quotes/:id/approve
PUT    /api/customer-portal/quotes/:id/decline
GET    /api/customer-portal/preferences
PUT    /api/customer-portal/preferences

// File Uploads (uploads.ts)
POST   /api/uploads/photo                 ← Photo upload with tenant folder
GET    /uploads/tenants/:tenant_id/photos/:filename
GET    /uploads/tenants/:tenant_id/photos/thumbnails/:filename

// Checklist Templates (checklist-templates.ts)
GET    /api/checklist-templates           ?service_provider_id
POST   /api/checklist-templates
GET    /api/checklist-templates/:id
PUT    /api/checklist-templates/:id

// ... 20+ more route files for contracts, calendars, certificates, etc.
```

### 6.2 Multi-Tenant Isolation Enforcement

**Every authenticated endpoint follows this pattern**:

```typescript
// apps/api/src/routes/cleaning-jobs.ts
router.get('/', authMiddleware, async (req, res) => {
  const serviceProviderId = req.query.service_provider_id as string

  if (!serviceProviderId) {
    return res.status(400).json({ error: 'service_provider_id is required' })
  }

  // Service layer ALWAYS filters by service provider
  const jobs = await cleaningJobsService.list(serviceProviderId, filters)
  res.json({ data: jobs })
})
```

**Database Query Pattern**:

```typescript
// Service layer enforces tenant isolation
class CleaningJobsService {
  async list(serviceProviderId: string, filters: any) {
    return prisma.cleaningJob.findMany({
      where: {
        service: {
          service_provider_id: serviceProviderId  // ← Tenant filter
        },
        ...filters
      },
      include: {
        property: true,
        assigned_worker: true,
        customer: true
      }
    })
  }
}
```

---

## 7. Cross-App Workflow Integrations

### 7.1 Workflow: Guest Reports Issue → Maintenance Job

**Sequence**:
1. Guest (at property) → Scans QR code → Opens guest-tablet app
2. Guest → Reports issue (category, description, photos)
3. API → AI assessment (severity, recommended_action)
4. API → Creates GuestIssueReport (status: SUBMITTED)

**If severity is HIGH or URGENT**:
5. API → Creates MaintenanceJob (status: QUOTE_PENDING)
6. API → Notifies customer in web-customer
7. Customer → Reviews issue
8. Customer → Forwards to maintenance provider
9. Maintenance provider (web-maintenance) → Submits quote
10. Customer (web-customer) → Approves quote
11. Maintenance manager → Assigns worker
12. Worker (web-worker) → Sees job, completes work, uploads photos
13. API → Updates GuestIssueReport (status: RESOLVED)
14. Guest → Receives notification

**If severity is LOW**:
5. API → Assigns to next CleaningJob
6. Worker → Sees issue in checklist during next clean
7. Worker → Resolves issue, marks complete
8. API → Updates GuestIssueReport (status: RESOLVED)

---

### 7.2 Workflow: Worker Finds Issue During Cleaning

**Sequence**:
1. Worker (web-worker) → Cleaning property
2. Worker → Discovers issue (broken fixture, damage, etc.)
3. Worker → Creates WorkerIssueReport (photos, description, category, priority)
4. API → Creates WorkerIssueReport (status: SUBMITTED)
5. API → Updates CleaningJob (maintenance_issues_found++)
6. API → Notifies customer in web-customer

**Customer approval workflow**:
7. Customer (web-customer) → Reviews worker's report with photos
8. Customer → Approves OR Rejects

**If approved**:
9. API → Creates MaintenanceJob (source: CLEANER_REPORT)
10. API → Updates WorkerIssueReport (status: APPROVED)
11. Maintenance provider (web-maintenance) → Submits quote
12. Customer → Approves quote
13. Maintenance provider → Assigns worker or external contractor
14. Work completed → Invoice sent

**If rejected**:
9. API → Updates WorkerIssueReport (status: REJECTED, rejection_reason)
10. Worker → Notified of rejection

---

### 7.3 Workflow: Cleaning Contract → Recurring Jobs

**Automated Job Creation** (CronService):

```typescript
// Runs daily at 2 AM
cron.schedule('0 2 * * *', async () => {
  // Get all active cleaning contracts
  const activeContracts = await prisma.cleaningContract.findMany({
    where: { status: 'ACTIVE' },
    include: {
      customer: true,
      property_contracts: {
        include: { property: true }
      }
    }
  })

  for (const contract of activeContracts) {
    // For each property in contract
    for (const propContract of contract.property_contracts) {
      // Check property calendar for next guest checkout
      const nextCheckout = await prisma.propertyCalendar.findFirst({
        where: {
          property_id: propContract.property_id,
          guest_checkout_datetime: { gte: new Date() }
        },
        orderBy: { guest_checkout_datetime: 'asc' }
      })

      if (nextCheckout) {
        // Create cleaning job in cleaning window
        await cleaningJobsService.create({
          contract_id: contract.id,
          property_id: propContract.property_id,
          customer_id: contract.customer_id,
          scheduled_date: nextCheckout.clean_window_start,
          status: 'SCHEDULED',
          pricing_type: 'PER_JOB',
          quoted_price: propContract.property_monthly_fee
        })
      }
    }
  }
})
```

**Sequence**:
1. Customer (web-customer) → Has active CleaningContract
2. Customer → Syncs property calendar (guest checkout/checkin times)
3. Cron job (daily) → Checks for upcoming guest checkouts
4. Cron job → Creates CleaningJob in cleaning window (checkout → checkin)
5. Cleaning company (web-cleaning) → Sees new scheduled job
6. Cleaning manager → Assigns worker
7. Worker (web-worker) → Sees job in dashboard
8. Worker → Completes job → Uploads photos
9. Invoice generated at end of month (based on completed jobs)

---

### 7.4 Cross-App Integration Summary

| Integration | Apps Involved | Mechanism |
|-------------|---------------|-----------|
| **Worker → Customer Issue Reporting** | web-worker → web-customer | WorkerIssueReport model |
| **Guest → Maintenance Routing** | guest-tablet → web-maintenance | GuestIssueReport → MaintenanceJob |
| **Service Provider → Customer Jobs** | web-cleaning/web-maintenance → web-customer | CleaningJob/MaintenanceJob with customer_id |
| **Property Sharing** | web-landlord → web-cleaning/web-maintenance | PropertyShare model |
| **Quote Approval** | web-maintenance → web-customer → web-maintenance | Quote model with approval workflow |

---

## 8. Security Architecture

### 8.1 Authentication Flow

```typescript
// JWT Token Structure
interface JWTPayload {
  user_id: string       // User.id from database
  tenant_id: string     // Multi-tenant isolation
  email: string         // For worker lookup
  role: 'ADMIN' | 'MEMBER' | 'CONTRACTOR'
}

// Token expiry
access_token: 15 minutes
refresh_token: 7 days
```

### 8.2 Authorization Patterns

**1. Tenant-Scoped Queries**
```typescript
// EVERY Prisma query includes tenant filter
const jobs = await prisma.cleaningJob.findMany({
  where: {
    service: {
      service_provider_id: req.user.tenant_id  // From JWT
    }
  }
})
```

**2. Role-Based Access Control (RBAC)**
```typescript
// Middleware checks role
export function requireAdmin(req, res, next) {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' })
  }
  next()
}

// Usage
router.delete('/api/workers/:id', authMiddleware, requireAdmin, deleteWorker)
```

**3. Resource Ownership Validation**
```typescript
// Verify user can access resource
const worker = await prisma.worker.findUnique({
  where: { id: req.params.id }
})

if (worker.service_provider_id !== req.query.service_provider_id) {
  return res.status(403).json({ error: 'Access denied' })
}
```

### 8.3 Data Protection

- **Passwords**: bcrypt with salt rounds 10
- **Sensitive Data**: PII encrypted at rest (future enhancement)
- **File Uploads**: Tenant-scoped folders, size limits (10MB), MIME type validation
- **SQL Injection**: Prevented by Prisma parameterized queries
- **XSS**: React auto-escaping, CSP headers via Helmet
- **CSRF**: Not needed (JWT tokens in headers, not cookies)

### 8.4 Security Headers (Helmet)

```typescript
// apps/api/src/index.ts
app.use(helmet())  // Enables:
// - Content-Security-Policy
// - X-DNS-Prefetch-Control
// - X-Frame-Options: DENY
// - Strict-Transport-Security
// - X-Download-Options
// - X-Content-Type-Options: nosniff
// - X-XSS-Protection
```

---

## 9. Deployment & Infrastructure

### 9.1 Current Development Setup

```bash
# All apps run on localhost
API:             http://localhost:3001
web-landlord:    http://localhost:5173
web-cleaning:    http://localhost:5174
web-maintenance: http://localhost:5175
web-customer:    http://localhost:5176
guest-tablet:    http://localhost:5177
web-worker:      http://localhost:5178

# Mobile app uses Expo
mobile: expo start (port 8081)

# Database
PostgreSQL: localhost:5432
```

### 9.2 Unified Deployment Strategy (Recommended)

**Approach**: Single unified platform with **branded subdomains** for product-specific experiences.

#### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         LOAD BALANCER / NGINX                        │
│                     (Subdomain-based routing)                        │
└─────────────────────────────────────────────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
        ▼                       ▼                       ▼
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│ Frontend     │       │ Frontend     │       │ Frontend     │
│ Containers   │       │ Containers   │       │ Containers   │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ cleaning.*   │       │ maintenance.*│       │ customer.*   │
│ worker.*     │       │ landlord.*   │       │ guest.*      │
└──────────────┘       └──────────────┘       └──────────────┘
        │                       │                       │
        └───────────────────────┼───────────────────────┘
                                ▼
                    ┌──────────────────────┐
                    │   API Server (3001)  │
                    │  apps/api (Express)  │
                    └──────────────────────┘
                                │
                                ▼
                    ┌──────────────────────┐
                    │   PostgreSQL (5432)  │
                    │   Shared Database    │
                    └──────────────────────┘
```

#### Subdomain Routing Configuration

**Nginx Configuration**:
```nginx
# Cleaning Product
server {
    server_name cleaning.rightfit.com;
    location / {
        proxy_pass http://web-cleaning:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# Maintenance Product
server {
    server_name maintenance.rightfit.com;
    location / {
        proxy_pass http://web-maintenance:80;
    }
}

# Customer Portal (Cleaning)
server {
    server_name customer.rightfit.com;
    location / {
        proxy_pass http://web-customer:80;
    }
}

# Landlord Portal (Maintenance)
server {
    server_name landlord.rightfit.com;
    location / {
        proxy_pass http://web-landlord:80;
    }
}

# Worker App (Shared)
server {
    server_name worker.rightfit.com;
    location / {
        proxy_pass http://web-worker:80;
    }
}

# Guest Tablet (Cleaning)
server {
    server_name guest.rightfit.com;
    location / {
        proxy_pass http://guest-tablet:80;
    }
}

# API Server (shared by all)
server {
    server_name api.rightfit.com;
    location / {
        proxy_pass http://api:3001;
    }
}
```

#### Benefits of Unified Deployment

✅ **Simplified Infrastructure**
- Single backend API deployment
- Single database instance
- Shared authentication/session management
- Lower hosting costs

✅ **Seamless Cross-Product Workflows**
- Cleaning → Maintenance issue routing (immediate consistency)
- Worker reports issue → Customer approves → Maintenance receives (no API calls)
- Shared data models enable real-time workflows

✅ **Faster Development Velocity**
- No API contract negotiations between services
- Changes deploy atomically (no version mismatches)
- Easier debugging (single codebase)

✅ **Product Flexibility**
- Can charge per-module (feature flags)
- Bundle products together
- Future: Extract to microservices when scale demands

#### Feature Flags for Module-Based Revenue

```typescript
// Tenant features control access to products
interface TenantFeatures {
  has_cleaning_module: boolean      // Access to cleaning.rightfit.com
  has_maintenance_module: boolean   // Access to maintenance.rightfit.com
  has_customer_portal: boolean      // Access to customer.rightfit.com
  has_guest_portal: boolean         // Enable QR codes at properties
}

// Example: Tenant subscribes to "Cleaning SaaS only"
{
  has_cleaning_module: true,
  has_maintenance_module: false,
  has_customer_portal: true,
  has_guest_portal: true
}
```

#### Migration Path to Microservices (Future)

When to split (typically at 100K+ users):
1. Independent scaling needs (cleaning vs maintenance)
2. Separate teams per product
3. White-labeling individual products
4. Strict data isolation requirements

**Recommended Migration Sequence**:
```
Step 1: Extract to API Gateway pattern (single entry point)
Step 2: Split Maintenance service (smallest, least coupled)
Step 3: Keep shared Customer service (cross-product data)
Step 4: Split Cleaning service
Step 5: Split Landlord service (if needed)
```

---

### 9.3 Production Deployment Options

#### Option 1: Docker + Docker Compose (Recommended for Unified System)

```yaml
# docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: rightfit
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data

  api:
    build: ./apps/api
    ports:
      - "3001:3001"
    environment:
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/rightfit
      JWT_SECRET: ${JWT_SECRET}
    depends_on:
      - postgres

  web-cleaning:
    build: ./apps/web-cleaning
    ports:
      - "5174:80"
    environment:
      VITE_API_URL: https://api.rightfit.com

  # ... repeat for other web apps
```

#### Option 2: Kubernetes (Scalable)

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api
  template:
    metadata:
      labels:
        app: api
    spec:
      containers:
      - name: api
        image: rightfit/api:latest
        ports:
        - containerPort: 3001
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: url
```

#### Option 3: Serverless (AWS/Vercel)

```bash
# Deploy each web app to Vercel
vercel deploy apps/web-cleaning --prod
vercel deploy apps/web-maintenance --prod
vercel deploy apps/web-customer --prod
vercel deploy apps/web-worker --prod
vercel deploy apps/guest-tablet --prod

# API to AWS Lambda + API Gateway (requires refactoring for serverless)
```

### 9.3 Recommended Production Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Hosting** | AWS EC2 / DigitalOcean Droplets | App servers |
| **Database** | AWS RDS PostgreSQL | Managed database |
| **File Storage** | AWS S3 | Photos, documents |
| **CDN** | CloudFront / Cloudflare | Static assets |
| **Load Balancer** | AWS ALB / Nginx | Traffic distribution |
| **Monitoring** | Datadog / New Relic | Logs, metrics, APM |
| **Error Tracking** | Sentry | Error alerts |
| **Secrets** | AWS Secrets Manager | Environment variables |
| **CI/CD** | GitHub Actions | Automated deployment |
| **SSL** | Let's Encrypt / AWS ACM | HTTPS certificates |

---

## 10. Next Steps & Recommendations

### 10.1 Critical Issues to Address

1. **Component Duplication** (Priority: HIGH)
   - Create product-based shared packages:
     - `packages/ui-core` - Shared by ALL apps (Button, Card, Input, Modal, etc.)
     - `packages/ui-cleaning` - Cleaning Product components (PropertyCard, CleaningJobCard, etc.)
     - `packages/ui-maintenance` - Maintenance Product components (MaintenanceJobCard, QuoteCard, etc.)
   - Migrate all web apps to use `@rightfit/ui-core`, `@rightfit/ui-cleaning`, `@rightfit/ui-maintenance`
   - Delete duplicated `apps/*/src/components/ui/` folders
   - **Rationale**: Aligns with product-based deployment strategy while enabling component reuse
   - **Estimated Effort**: 3-5 days

2. **web-worker Feature Completion** (Priority: MEDIUM)
   - ✅ Empty `apps/web-worker/apps/` folder deleted (completed)
   - Complete missing features (job completion, photo upload, issue reporting)
   - Implement worker_type-based UI rendering (CLEANER vs MAINTENANCE vs BOTH)
   - **Estimated Effort**: 5 days feature completion

3. **API Documentation** (Priority: HIGH)
   - Generate OpenAPI/Swagger docs
   - Document all 200+ endpoints
   - **Tool**: Use `swagger-jsdoc` or `tsoa`
   - **Estimated Effort**: 2-3 days

4. **Production Deployment** (Priority: HIGH)
   - ✅ Deployment strategy chosen: Unified system with branded subdomains (see Section 9.2)
   - Implement nginx configuration for subdomain routing
   - Configure CI/CD pipeline (GitHub Actions → Docker → DigitalOcean/AWS)
   - Set up SSL certificates (Let's Encrypt)
   - Set up monitoring and alerting (Prometheus/Grafana or cloud-native)
   - Implement feature flags for module-based revenue
   - **Estimated Effort**: 5-10 days

5. **Photo Storage Migration** (Priority: MEDIUM)
   - Migrate from local filesystem to S3
   - Update all upload/download endpoints
   - **Estimated Effort**: 2-3 days

### 10.2 Architecture Improvements

1. **API Versioning**
   ```typescript
   // Add versioning to support backward compatibility
   /api/v1/cleaning-jobs
   /api/v2/cleaning-jobs  // New features without breaking v1
   ```

2. **Caching Layer**
   ```typescript
   // Add Redis for frequently accessed data
   - Worker profiles
   - Property details
   - Checklist templates
   ```

3. **Event-Driven Architecture**
   ```typescript
   // Use event bus for decoupling
   EventBus.emit('job.completed', { jobId, workerId })

   // Listeners in different services
   NotificationService.on('job.completed', sendCustomerNotification)
   AnalyticsService.on('job.completed', trackMetrics)
   ```

4. **Rate Limiting Expansion**
   ```typescript
   // Already implemented per-route, expand coverage
   - Guest endpoints (prevent abuse)
   - API endpoints (DDoS protection)
   ```

### 10.3 Future Enhancements

- **Mobile App Expansion**: Create mobile versions of all web apps (cleaning, maintenance, customer, landlord, worker portals) with offline-first support using WatermelonDB
- **Real-time Updates**: WebSocket integration for live job status updates
- **Analytics Dashboard**: Business intelligence for service providers
- **Automated Testing**: E2E tests with Playwright/Cypress
- **Performance Monitoring**: APM integration (New Relic/Datadog)

---

## Appendix A: Identified Constraints

From actual code analysis:

1. **Multi-Tenant Isolation**: All API endpoints require `service_provider_id` for tenant scoping
2. **Authentication**: Workers must have linked `User` account (`Worker.user_id`) to authenticate via JWT
3. **Photo Storage**: Local filesystem (`apps/api/uploads/`) with tenant-specific folders; S3 support exists but not actively used
4. **Database**: Single PostgreSQL instance with tenant-scoped queries (no physical database separation)
5. **Component Duplication**: Each web app has duplicate `components/ui/` folder (known technical debt - 5x maintenance)
6. **Port Allocation**: Fixed ports for each app (5173-5178, 3001) - potential conflicts in development
7. **Offline Support**: Mobile app only; web apps are online-only
8. **Worker App Status**: Partially implemented with placeholder pages

---

## Appendix B: Document Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Nov 2025 | Winston (Architect Agent) | Initial comprehensive architecture documentation |
| 1.1 | Nov 2025 | Winston (Architect Agent) | Updated deployment strategy to unified system with branded subdomains; clarified two-product model (Cleaning SaaS + Maintenance SaaS); added product-based component package strategy (ui-core, ui-cleaning, ui-maintenance); updated Section 9.2 with complete nginx configuration |
| 1.2 | Nov 7, 2025 | Winston (Architect Agent) | Added Section 1.5 Development Strategy - template-based approach using Cleaning SaaS as template for Maintenance SaaS; documented Phase 4A/4B/4C implementation strategy; clarified that customer/landlord/guest portals will receive detailed plans later |

---

**Document Status**: ✅ Complete
**Last Updated**: November 2025
**Next Review**: Before major system changes or quarterly
