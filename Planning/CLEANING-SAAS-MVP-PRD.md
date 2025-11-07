# Cleaning SaaS MVP - Product Requirements Document

**Document Type**: Brownfield PRD (Quality-First)
**Product**: RightFit Services - Cleaning SaaS
**Version**: 1.0
**Date**: November 7, 2025
**Status**: Ready for Development
**Target Launch**: Q1 2026 (Quality-gated, not time-gated)

---

## Executive Summary

### Product Vision

RightFit Cleaning SaaS is a **best-in-class B2B2C platform** connecting cleaning service providers (cleaning companies) with their customers (short-let property businesses), workers (cleaners), and end-users (property guests).

**Market Position**: "The Stripe of Service Management" - enterprise-grade reliability, delightful UX, workflow automation that "just works."

### MVP Scope

This PRD defines the **Cleaning SaaS MVP** - a production-ready subset of the full platform focused on delivering exceptional value to one confirmed test company with additional companies waiting in the pipeline.

**Strategic Approach**: Complete the Cleaning SaaS to best-in-class standards first, then use proven patterns to rapidly build Maintenance SaaS.

**MVP Scope Boundary**:
- ✅ **In Scope**: Sprints 1-4 (Component Library, Worker App Completion, Production Deployment, Cleaning Portal Polish)
- ✅ **In Scope**: Emergency security fixes (CRITICAL-001, 002, 003)
- ❌ **Out of Scope**: Maintenance SaaS build (Sprints 5-7, deferred to Phase 5)
- ❌ **Out of Scope**: Customer/Landlord/Guest portal feature expansion (basic functionality only)

### Business Context

**Confirmed Test Company**: 1 cleaning company ready to pilot the platform
**Pipeline**: 1 maintenance company waiting (validates full platform strategy)
**Revenue Model**: £49-£149/month subscription (3-tier pricing)
**Go-to-Market**: Pilot → Beta → General Availability

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [User Personas & Jobs-to-be-Done](#2-user-personas--jobs-to-be-done)
3. [MVP Feature Set](#3-mvp-feature-set)
4. [Critical Security Requirements](#4-critical-security-requirements)
5. [Sprint-by-Sprint Breakdown](#5-sprint-by-sprint-breakdown)
6. [User Experience Requirements](#6-user-experience-requirements)
7. [Quality Gates & Acceptance Criteria](#7-quality-gates--acceptance-criteria)
8. [Success Metrics](#8-success-metrics)
9. [Launch Readiness Checklist](#9-launch-readiness-checklist)
10. [Risk Assessment & Mitigation](#10-risk-assessment--mitigation)

---

## 1. Product Overview

### 1.1 Current State Analysis

**Platform Status**: Phase 4 (40% complete)
**Philosophy**: RightFit, not QuickFix - Quality over speed, build it right the first time

**Current Completion by Application**:

| Application | Status | Completion | MVP Role |
|------------|--------|------------|----------|
| **api** (Backend) | 🟢 Active | 85% | Shared foundation |
| **web-cleaning** | 🟡 Template | 80% | Primary template - FOCUS |
| **web-customer** | 🟡 Functional | 75% | Connection-ready |
| **guest-tablet** | 🟡 Functional | 80% | Connection-ready |
| **web-worker** | 🟡 Active Dev | 60% | Template in progress - FOCUS |

**Key Insight**: Platform is 80% complete for Cleaning SaaS, requiring targeted polish and worker app completion rather than ground-up development.

### 1.2 Applications in Cleaning SaaS MVP

**Product 1: Cleaning SaaS** consists of 4 interconnected applications:

1. **web-cleaning** (Port 5174) - Service Provider Portal
   - **Users**: Cleaning company owners, managers, dispatchers
   - **Purpose**: Manage customers, properties, contracts, jobs, workers
   - **Current State**: Core features complete, needs UI/UX polish
   - **MVP Priority**: HIGH - Must be production-ready as template

2. **web-customer** (Port 5176) - Customer Portal
   - **Users**: Short-let business owners/property managers
   - **Purpose**: View properties, approve maintenance quotes, track jobs
   - **Current State**: Basic functionality complete
   - **MVP Priority**: MEDIUM - Connection-ready, detailed features deferred

3. **guest-tablet** (Port 5177) - Guest Issue Reporting
   - **Users**: Anonymous property guests (QR code access)
   - **Purpose**: Report issues, get DIY guides, ask questions
   - **Current State**: AI triage working, needs polish
   - **MVP Priority**: MEDIUM - Workflow validation, not feature expansion

4. **web-worker** (Port 5178) - Worker App
   - **Users**: Cleaners completing jobs
   - **Purpose**: View schedule, complete jobs, upload photos, report issues
   - **Current State**: 60% complete, missing job completion workflow
   - **MVP Priority**: CRITICAL - Must complete for MVP

### 1.3 Brownfield Context

**Existing Codebase**:
- ~50,000+ lines of code
- 40+ database tables (1,701 lines Prisma schema)
- 200+ API endpoints across 34 route files
- 8 applications (7 web + 1 mobile)
- Multi-tenant architecture fully implemented

**Key Code Review Findings** (from CODE-REVIEW-FINDINGS.md):

**CRITICAL Issues (Must Fix Week 1)**:
- 🔴 CRITICAL-001: Authorization bypass vulnerability (tenant data access)
- 🔴 CRITICAL-002: No rate limiting on guest routes
- 🔴 CRITICAL-003: Missing database indexes (10-100x query slowdown)

**HIGH Priority Issues (Address in Sprints 1-4)**:
- 🟡 HIGH-001: Component duplication (6,350 LOC across 4 apps)
- 🟡 HIGH-007: Styling inconsistency (CSS vs Tailwind)
- 🟡 HIGH-008: No code splitting (900KB+ bundles)

**Architecture Grade**: B+ (Good foundation requiring immediate security fixes)

---

## 2. User Personas & Jobs-to-be-Done

### 2.1 Primary Persona: Service Provider (Cleaning Company)

**Representative**: Sarah Chen, Operations Manager at "Sparkle Clean Services"
- **Company Size**: 15 cleaners, 40 short-let properties
- **Pain Points**:
  - Manual scheduling via WhatsApp and spreadsheets
  - No visibility into worker locations or job status
  - Customer calls asking "Is the cleaner coming?"
  - Missed cleaning windows (guest checkout → next check-in)
  - Workers forget tasks, inconsistent quality
  - Invoicing takes 2 hours/week

**Jobs-to-be-Done**:
1. **Scheduling**: "When I have a new booking, I need to automatically schedule cleaning within the checkout-to-checkin window"
2. **Assignment**: "When I schedule a job, I need to assign the right cleaner based on location, availability, and skills"
3. **Visibility**: "When a job is in progress, I need to see real-time status and completion photos"
4. **Quality Control**: "When a cleaner completes a job, I need to verify all checklist items were done"
5. **Billing**: "When month-end comes, I need to automatically invoice customers for completed jobs"

**Willingness to Pay**: £149/month (Professional tier)

### 2.2 Secondary Persona: Customer (Short-Let Business)

**Representative**: David Martinez, Owner of "Coastal Retreats" (8 properties)
- **Pain Points**:
  - No visibility into cleaning status
  - Guests arrive to dirty properties (cleaner didn't show)
  - Maintenance issues discovered during cleaning not communicated
  - Over-invoiced for cleanings that didn't happen

**Jobs-to-be-Done**:
1. **Visibility**: "When I have a guest checking in, I need confirmation the property was cleaned"
2. **Quality Assurance**: "When cleaning is complete, I need before/after photos to verify quality"
3. **Issue Routing**: "When a maintenance issue is found, I need to approve the repair before work starts"
4. **Transparency**: "When I'm invoiced, I need to see proof of work (photos, timestamps)"

**Willingness to Pay**: Included in cleaning company's fee (platform fee passed through)

### 2.3 Tertiary Persona: Worker (Cleaner)

**Representative**: Maria Santos, Cleaner at Sparkle Clean Services
- **Pain Points**:
  - Unclear schedules (paper lists, WhatsApp messages)
  - Can't remember property-specific instructions
  - No way to report maintenance issues found during cleaning
  - Disputes over hours worked

**Jobs-to-be-Done**:
1. **Schedule Clarity**: "When I start my day, I need to see my complete schedule with addresses and times"
2. **Job Details**: "When I arrive at a property, I need to see the checklist and special instructions"
3. **Issue Reporting**: "When I find a broken appliance, I need to quickly report it with photos"
4. **Time Tracking**: "When I complete a job, I need to log my hours accurately"

**Willingness to Pay**: N/A (employer pays)

### 2.4 Quaternary Persona: Guest (Property Visitor)

**Representative**: Anonymous short-stay guest at Coastal Retreats
- **Pain Points**:
  - WiFi password unclear
  - Minor issues (lightbulb out, no toilet paper)
  - Don't know who to contact

**Jobs-to-be-Done**:
1. **Self-Service**: "When I have a minor issue, I want to fix it myself without calling anyone"
2. **Issue Reporting**: "When I find a real problem, I want to report it with photos quickly"
3. **Property Info**: "When I arrive, I want WiFi, check-out instructions, and local recommendations"

**Willingness to Pay**: N/A (service provided by property owner)

---

## 3. MVP Feature Set

### 3.1 Core Features (Must Have - In Scope)

#### 3.1.1 Service Provider Portal (web-cleaning)

**Dashboard**
- [ ] Real-time stats: Today's jobs, active workers, pending quotes
- [ ] Recent activity feed (jobs completed, issues reported)
- [ ] Revenue summary (current month)
- [ ] Quick actions: Schedule job, add property, assign worker

**Customer Management**
- [ ] Customer list with search/filter
- [ ] Customer details: Properties owned, active contracts, billing history
- [ ] Add/edit customer with contact info and preferences
- [ ] Customer communication log

**Property Management**
- [ ] Property list (cards with photos, customer, status)
- [ ] Property details: Address, access instructions, special notes, photo gallery
- [ ] Property calendar: Guest bookings, cleaning windows, maintenance history
- [ ] Add/edit property with customer assignment

**Job Management**
- [ ] Job list: Filter by status (scheduled, in-progress, completed), date, worker, property
- [ ] Job details: Property info, assigned worker, checklist, photos, timeline
- [ ] Schedule job: Select property, date/time, checklist template, assign worker
- [ ] Job status tracking: Real-time updates from worker app
- [ ] Job history: Completed jobs with photos and timestamps

**Worker Management**
- [ ] Worker list: Active/inactive, skills, availability
- [ ] Worker details: Contact info, certifications, completed jobs, performance stats
- [ ] Add/edit worker: Name, email, phone, worker_type (CLEANER), skills
- [ ] Worker schedule: Calendar view of assigned jobs
- [ ] Worker availability: Block time off, set working hours

**Contract Management**
- [ ] Contract list: Active, expired, pending renewal
- [ ] Contract details: Customer, properties, frequency, pricing
- [ ] Create contract: Select customer, properties, set frequency (daily/weekly/monthly)
- [ ] Auto-scheduling: Generate jobs based on contract frequency

**Checklist Templates**
- [ ] Template list: Standard clean, deep clean, checkout clean
- [ ] Template editor: Add/remove/reorder checklist items
- [ ] Assign template to jobs

**Invoicing** (Basic)
- [ ] Invoice list: Generated invoices for completed jobs
- [ ] Invoice details: Line items (jobs), total, payment status
- [ ] Mark as paid manually

#### 3.1.2 Worker App (web-worker)

**Dashboard**
- [ ] Today's jobs: List with time, property, customer
- [ ] Stats: Jobs today, completed this week, earnings (if tracked)
- [ ] Quick actions: Start next job, report issue, view schedule

**Job List & Details**
- [ ] My jobs: Filter by status (upcoming, in-progress, completed)
- [ ] Job card: Property address, time, customer, checklist preview
- [ ] Job details: Full property info, access instructions, special notes

**Job Completion Workflow** (CRITICAL - Missing)
- [ ] Start job: Record start time, trigger geolocation check (future)
- [ ] Checklist: Mark items complete (checkboxes)
- [ ] Photo upload: Before/after photos, upload to S3
- [ ] Issue reporting: Report maintenance issues found during cleaning
- [ ] Complete job: Record end time, submit for manager review
- [ ] CleaningJobTimesheet: Auto-create timesheet record

**Schedule**
- [ ] Calendar view: Week view with jobs
- [ ] Day view: Today's jobs in order

**Availability Management**
- [ ] Block time off: Select dates unavailable
- [ ] Set recurring availability (e.g., "Mondays 9am-5pm")

**Profile**
- [ ] View/edit profile: Name, email, phone, photo
- [ ] Change password

**Work History**
- [ ] Completed jobs list
- [ ] Job details (read-only)

#### 3.1.3 Customer Portal (web-customer)

**Dashboard**
- [ ] Upcoming jobs: Scheduled cleanings for my properties
- [ ] Recent activity: Completed jobs, maintenance issues
- [ ] Pending approvals: Maintenance quotes requiring approval

**Properties** (Read-Only)
- [ ] Property list: My properties (assigned by service provider)
- [ ] Property details: Address, photos, cleaning history

**Maintenance Quote Approval**
- [ ] Quote list: Pending, approved, declined
- [ ] Quote details: Issue description, photos, line items, total
- [ ] Approve/decline: Within auto-approval limit or manual

**Guest Issues**
- [ ] Issue list: Reported by guests at my properties
- [ ] Issue details: Description, photos, AI triage, status
- [ ] Dismiss minor issues, escalate to maintenance

**Invoices**
- [ ] Invoice list: All invoices from service provider
- [ ] Invoice details: Jobs performed, dates, total
- [ ] Mark as paid (integration out of scope)

#### 3.1.4 Guest Tablet (guest-tablet)

**Welcome Screen**
- [ ] Property info: Address, WiFi password, check-out time
- [ ] House rules
- [ ] Emergency contacts

**Issue Reporting** (Core Feature)
- [ ] Category selection: Plumbing, electrical, appliances, other
- [ ] Description + photos: Text input, camera upload
- [ ] AI assessment: Severity, category, recommended action
- [ ] Submit to customer portal

**DIY Guides**
- [ ] Issue-specific guides: "How to reset a tripped breaker"
- [ ] Step-by-step instructions with photos

**Q&A Chat** (Basic)
- [ ] Ask questions: "Where's the nearest grocery store?"
- [ ] AI-powered responses

**Knowledge Base**
- [ ] Local recommendations: Restaurants, attractions
- [ ] Property FAQs

### 3.2 Infrastructure Features (Must Have - In Scope)

#### 3.2.1 Component Library (Sprint 1)

**packages/ui-core** (Shared Across All Apps)
- [ ] Button: Primary, secondary, danger, loading states
- [ ] Card: With gradient styling (established pattern)
- [ ] Input: Text, number, email, phone, with validation
- [ ] Select: Dropdown with search
- [ ] Modal: Centered, full-screen, with backdrop
- [ ] Toast: Success, error, warning, info notifications
- [ ] Spinner: Loading indicator
- [ ] Badge: Status badges (scheduled, completed, cancelled)
- [ ] EmptyState: No data placeholder
- [ ] Checkbox: With label
- [ ] Radio: Radio group
- [ ] Textarea: Multi-line input

**packages/ui-cleaning** (Cleaning-Specific)
- [ ] PropertyCard: Card with photo, address, customer
- [ ] CleaningJobCard: Job details card with status
- [ ] CleaningChecklist: Checklist with checkboxes
- [ ] GuestIssueCard: Issue card with photos and AI triage
- [ ] TimesheetCard: Worker timesheet summary

**packages/ui-maintenance** (Future - Not MVP)
- Deferred to Sprint 5

#### 3.2.2 Production Deployment (Sprint 3)

**Infrastructure**
- [ ] Nginx reverse proxy: Route subdomains to apps
- [ ] SSL certificates: Let's Encrypt auto-renewal
- [ ] Docker Compose: Production orchestration
- [ ] Health checks: All apps with /health endpoints
- [ ] Restart policies: Auto-restart on failure

**CI/CD Pipeline**
- [ ] GitHub Actions: Build on push to main
- [ ] Automated tests: Run before deploy
- [ ] Deploy to staging: Auto-deploy main branch
- [ ] Deploy to production: Manual approval gate

**Monitoring & Logging**
- [ ] Centralized logging: Winston with file output
- [ ] Error tracking: Log errors to file/service
- [ ] Performance monitoring: API response times
- [ ] Uptime monitoring: Ping health endpoints

**Photo Storage**
- [ ] AWS S3 migration: Move from local filesystem
- [ ] S3 bucket: rightfit-production-photos
- [ ] Upload/download: Update API endpoints
- [ ] Image optimization: Sharp for compression

**API Documentation**
- [ ] OpenAPI spec: Generated from code
- [ ] Swagger UI: Hosted at api.rightfit.com/docs
- [ ] Authentication docs: JWT flow explained

#### 3.2.3 Feature Flags (Sprint 3)

**Tenant-Level Module Flags**
- [ ] has_cleaning_module: boolean
- [ ] has_maintenance_module: boolean
- [ ] Module routing: Hide maintenance features if flag disabled

### 3.3 Features Explicitly Out of Scope (Deferred)

**Maintenance SaaS Build** (Sprints 5-7)
- ❌ web-maintenance UI/UX overhaul
- ❌ web-landlord portal build-out
- ❌ Maintenance worker app adaptation
- **Rationale**: Complete Cleaning SaaS to best-in-class standards first, then replicate patterns

**Customer/Landlord/Guest Portal Expansion**
- ❌ Detailed feature development beyond basic workflows
- ❌ Payment integrations (Stripe)
- ❌ Advanced analytics dashboards
- **Rationale**: Focus on core cleaning workflows, expand later based on test company feedback

**Advanced Features**
- ❌ Real-time updates (WebSockets)
- ❌ Push notifications
- ❌ Geolocation tracking
- ❌ Route optimization
- ❌ AI-powered scheduling
- **Rationale**: Nice-to-haves that can be added post-MVP

**Mobile App Features**
- ❌ Mobile worker app (React Native)
- **Rationale**: Web app works on mobile browsers, native app deferred to Phase 5

**Automated Testing**
- ❌ E2E test suite (Playwright)
- ❌ >70% test coverage
- **Rationale**: Manual QA for MVP, automated testing in Q1 2026

---

## 4. Critical Security Requirements

### 4.1 Emergency Fixes (Week 0 - Before Sprints 1-4)

**CRITICAL-001: Authorization Bypass Vulnerability**

**Problem**: Client-provided `service_provider_id` is not verified against authenticated user's tenant, allowing cross-tenant data access.

**Affected Endpoints**: 30+ endpoints across:
- cleaning-jobs.ts (6 endpoints)
- maintenance-jobs.ts (12 endpoints)
- workers.ts (7 endpoints)
- customer-properties.ts (5 endpoints)

**Required Fix**:
```typescript
// Create middleware: requireServiceProvider
// Verify service_provider_id belongs to req.user.tenant_id
// Apply to ALL endpoints that accept service_provider_id query param
```

**Acceptance Criteria**:
- [ ] Middleware created and tested
- [ ] Applied to all 30+ affected endpoints
- [ ] Cannot access other tenant's data with forged service_provider_id
- [ ] Returns 403 Forbidden with clear error message

**Priority**: IMMEDIATE
**Effort**: 1 day
**Owner**: Backend team

---

**CRITICAL-002: Guest Routes Have No Rate Limiting**

**Problem**: Guest endpoints have no authentication and no rate limiting, exposing platform to DoS attacks and spam.

**Affected Endpoints**:
- POST /api/guest/sessions
- POST /api/guest/issues
- POST /api/guest/questions

**Required Fix**:
```typescript
// Add express-rate-limit to guest routes
// Limit: 10 requests per 15 minutes per IP
// Consider CAPTCHA for issue reporting
```

**Acceptance Criteria**:
- [ ] Rate limiting applied to all guest routes
- [ ] 429 Too Many Requests returned when limit exceeded
- [ ] IP-based throttling (not session-based)
- [ ] CAPTCHA integration (optional but recommended)

**Priority**: IMMEDIATE
**Effort**: 4 hours
**Owner**: Backend team

---

**CRITICAL-003: Missing Database Indexes on Status Fields**

**Problem**: Critical query fields lack indexes, causing 10-100x slower queries at scale.

**Missing Indexes**:
- MaintenanceJob.status
- Worker.is_active
- CleaningJob.status + scheduled_date (composite)
- Customer.service_provider_id + customer_type

**Required Fix**:
```prisma
// Add @@index directives to schema
// Run migration: npx prisma migrate dev
```

**Acceptance Criteria**:
- [ ] Indexes added to all critical query fields
- [ ] Migration tested on staging database
- [ ] Query performance benchmarked (before/after)
- [ ] No breaking changes to existing queries

**Priority**: IMMEDIATE
**Effort**: 2 hours
**Owner**: Database team

---

### 4.2 Security Quality Gates (Production Launch)

**Authentication & Authorization**
- [ ] All endpoints require authentication (except guest routes)
- [ ] service_provider_id verified on all tenant-scoped queries
- [ ] JWT tokens expire after 1 hour (access token)
- [ ] Refresh tokens rotate on use
- [ ] No tokens stored in localStorage (httpOnly cookies preferred, but localStorage acceptable for MVP)

**Rate Limiting**
- [ ] Guest routes: 10 req/15min per IP
- [ ] Auth routes: 5 login attempts per hour per IP
- [ ] API routes: 100 req/15min per user

**Input Validation**
- [ ] All user inputs validated (Zod schemas)
- [ ] File uploads restricted to images only
- [ ] File size limit: 10MB per upload
- [ ] No SQL injection vulnerabilities (using Prisma parameterized queries)

**Data Privacy**
- [ ] Passwords hashed with bcrypt (salt rounds: 10)
- [ ] Sensitive data never logged (passwords, tokens)
- [ ] HTTPS enforced in production
- [ ] CORS configured for production domains only

---

## 5. Sprint-by-Sprint Breakdown

### Sprint 0: Emergency Security Fixes (Week 1)

**Duration**: 2 days
**Goal**: Eliminate critical security vulnerabilities before continuing development

**Stories**:
1. Fix authorization bypass (CRITICAL-001) - 1 day
2. Add rate limiting to guest routes (CRITICAL-002) - 4 hours
3. Add missing database indexes (CRITICAL-003) - 2 hours
4. Verify fixes with security testing - 2 hours

**Quality Gate**:
- [ ] All 3 critical issues resolved
- [ ] Security test suite passes
- [ ] No new vulnerabilities introduced

---

### Sprint 1: Component Library Refactor (Week 2)

**Duration**: 5-7 days (flexible for quality)
**Complexity**: 15 story points
**Status**: Ready to start
**Quality Focus**: Production-ready, accessible, well-documented components

**Rationale**: Eliminate 6,350 LOC of component duplication across 4 web apps, reducing maintenance burden by 70% and enabling consistent UX.

**Stories**:

**S1.1: Create packages/ui-core** (3 pts)
- Set up package structure with Vite library mode
- Migrate 12 core components: Button, Card, Input, Select, Modal, Toast, Spinner, Badge, EmptyState, Checkbox, Radio, Textarea
- Configure TypeScript exports and barrel file
- Add Storybook for component documentation

**Acceptance Criteria**:
- [ ] Package builds successfully with `pnpm build`
- [ ] All 12 components exported from index.ts
- [ ] TypeScript strict mode passes
- [ ] Storybook stories for each component
- [ ] README with usage examples

**S1.2: Create packages/ui-cleaning** (3 pts)
- Set up package structure
- Migrate 5 cleaning-specific components: PropertyCard, CleaningJobCard, CleaningChecklist, GuestIssueCard, TimesheetCard
- Apply gradient card styling (established pattern from PropertyDetails)
- Configure exports

**Acceptance Criteria**:
- [ ] Package builds successfully
- [ ] All 5 components exported
- [ ] Gradient card styling consistent across components
- [ ] Storybook stories with cleaning data examples

**S1.3: Create packages/ui-maintenance** (3 pts)
- Set up package structure (empty for now)
- Create 5 placeholder components: LandlordPropertyCard, MaintenanceJobCard, QuoteCard, WorkOrderCard, ContractorCard
- Configure exports
- **Note**: Full implementation deferred to Sprint 5

**Acceptance Criteria**:
- [ ] Package structure exists
- [ ] Placeholder components created (minimal implementation)
- [ ] Ready for Sprint 5 development

**S1.4: Migrate web-cleaning to shared packages** (2 pts)
- Update imports to use @rightfit/ui-core and @rightfit/ui-cleaning
- Remove duplicate component files
- Test all pages for regressions

**Acceptance Criteria**:
- [ ] All pages render correctly
- [ ] No duplicate component folders remain
- [ ] Bundle size reduced by ~15-20%
- [ ] Manual QA on all pages passes

**S1.5: Migrate remaining apps** (4 pts)
- Migrate web-customer to ui-core
- Migrate web-maintenance to ui-core + ui-maintenance
- Migrate web-worker to ui-core + ui-cleaning
- Remove all duplicate component folders

**Acceptance Criteria**:
- [ ] All 4 apps using shared components
- [ ] No duplicate component code remains (verify with grep)
- [ ] All apps start and render correctly
- [ ] Full manual QA passes

**Quality Requirements** (Sprint 1):
- [ ] All components TypeScript strict mode compliant
- [ ] Storybook documentation for each component
- [ ] Accessibility audit passed (axe DevTools)
- [ ] Mobile responsive tested on real devices
- [ ] Design system documented (Figma optional)

**Definition of Done**:
- [ ] All 5 stories completed
- [ ] Quality requirements met
- [ ] No regressions in existing apps
- [ ] Component duplication eliminated (verified)
- [ ] Team trained on shared component usage

---

### Sprint 2: Worker App Completion (Week 3)

**Duration**: 5 days
**Points**: 16 story points
**Status**: Waiting for Sprint 1
**Dependencies**: Sprint 1 (component library must be complete)

**Rationale**: Worker app is 60% complete but missing critical job completion workflow. Without this, cleaners cannot complete jobs, making the platform unusable.

**Stories**:

**S2.1: Job Completion Modal** (3 pts)
- Create CompleteJobModal component with checklist
- Handle completion for CLEANER worker type
- Update job status via PUT /api/cleaning-jobs/:id/complete
- Show success toast on completion

**Acceptance Criteria**:
- [ ] Modal renders with job checklist items
- [ ] All checklist items must be checked to complete
- [ ] Job status updates to COMPLETED
- [ ] Completion timestamp recorded
- [ ] Worker redirected to dashboard after completion

**S2.2: Photo Upload Component** (3 pts)
- Create PhotoUpload component with camera integration
- Compress photos before upload (Sharp on backend)
- Upload to S3 (POST /api/photos/upload)
- Gallery view for uploaded photos (before/after)

**Acceptance Criteria**:
- [ ] Camera captures photo on mobile devices
- [ ] Photo compressed to <2MB before upload
- [ ] S3 URL returned and displayed
- [ ] Before/after photos labeled clearly
- [ ] Works on iOS and Android browsers

**S2.3: Issue Reporting Flow** (4 pts)
- Create ReportIssueModal for maintenance issues during cleaning
- Photo attachment support (reuse PhotoUpload component)
- Submit to POST /api/worker-issue-reports
- Customer notification workflow (email optional for MVP)

**Acceptance Criteria**:
- [ ] Modal renders with issue form (title, description, photos)
- [ ] Worker can attach up to 5 photos
- [ ] Issue submitted and visible in customer portal
- [ ] Issue routes to maintenance provider (if customer has maintenance module enabled)
- [ ] Worker sees confirmation message

**S2.4: Worker Type UI Rendering** (3 pts)
- Conditional rendering based on worker_type (CLEANER | MAINTENANCE | BOTH)
- Show relevant job cards per worker type
- Navigation menu updates (hide maintenance for cleaners)
- Dashboard stats filter by worker type

**Acceptance Criteria**:
- [ ] CLEANER workers see only cleaning jobs
- [ ] MAINTENANCE workers see only maintenance jobs
- [ ] BOTH workers see both job types with clear labels
- [ ] Navigation hides irrelevant sections

**S2.5: Testing & Polish** (3 pts)
- End-to-end workflow testing (schedule → assign → complete job)
- Bug fixes from QA
- UI/UX polish (spacing, loading states, error handling)
- Performance optimization (lazy load components)

**Acceptance Criteria**:
- [ ] Full workflow tested on real devices (iOS Safari, Android Chrome)
- [ ] No critical bugs remain
- [ ] All loading states implemented
- [ ] All error states handled gracefully
- [ ] Page load time <2 seconds

**Quality Requirements** (Sprint 2):
- [ ] Tested on 3+ real mobile devices
- [ ] Offline error handling (show "No internet" message)
- [ ] Photo upload works on slow connections
- [ ] Accessibility: keyboard navigation works
- [ ] All forms validate inputs

**Definition of Done**:
- [ ] All 5 stories completed
- [ ] Worker can complete job end-to-end
- [ ] Photos upload successfully
- [ ] Issues reported and routed correctly
- [ ] Test company validates worker app workflow

---

### Sprint 3: Production Deployment Setup (Week 4-5)

**Duration**: 8 days
**Points**: 24 story points
**Status**: Waiting for Sprint 2
**Dependencies**: Sprint 2 (feature completion for production readiness)

**Rationale**: Platform must be deployed to production environment with enterprise-grade reliability, monitoring, and security before test company pilot.

**Stories**:

**S3.1: Nginx Configuration** (3 pts)
- Create nginx.conf for subdomain routing
- Configure SSL with Let's Encrypt (certbot)
- Test routing for all 7 subdomains:
  - cleaning.rightfit.com → web-cleaning:5174
  - customer.rightfit.com → web-customer:5176
  - worker.rightfit.com → web-worker:5178
  - guest.rightfit.com → guest-tablet:5177
  - api.rightfit.com → api:3001
- Set up auto-renewal for SSL certificates

**Acceptance Criteria**:
- [ ] All subdomains resolve correctly
- [ ] HTTPS enforced (HTTP redirects to HTTPS)
- [ ] SSL certificates valid and auto-renewing
- [ ] Load balancer health checks pass

**S3.2: Docker Production Setup** (4 pts)
- Create docker-compose.prod.yml
- Configure environment variables (secrets management)
- Set up PostgreSQL with persistent volumes
- Configure health checks for all services
- Set restart policies (always restart on failure)

**Acceptance Criteria**:
- [ ] All apps start with `docker-compose up -d`
- [ ] Database data persists across restarts
- [ ] Health checks working (all services healthy)
- [ ] Logs accessible via `docker-compose logs`
- [ ] Resource limits set (CPU, memory)

**S3.3: CI/CD Pipeline** (5 pts)
- Set up GitHub Actions workflow
- Automated builds on push to main
- Run tests before deploy (when tests exist)
- Deploy to staging automatically
- Deploy to production with manual approval gate

**Acceptance Criteria**:
- [ ] Build passes on every commit
- [ ] Staging deploys automatically on main branch
- [ ] Production deploys require manual approval
- [ ] Failed builds block deployment
- [ ] Rollback mechanism available

**S3.4: Feature Flags** (3 pts)
- Implement feature flag system (simple boolean flags)
- Add tenant-level module flags: has_cleaning_module, has_maintenance_module
- Update auth middleware to check flags
- Hide maintenance features if flag disabled

**Acceptance Criteria**:
- [ ] Tenant model includes module flags
- [ ] API checks flags before returning data
- [ ] Frontend hides maintenance features if disabled
- [ ] Flags configurable via admin panel (basic implementation)

**S3.5: Monitoring Setup** (4 pts)
- Configure Winston logging (file output)
- Set up error tracking (log errors to file/service)
- Create monitoring dashboard (optional: Prometheus/Grafana)
- Uptime monitoring (ping /health every 5 min)

**Acceptance Criteria**:
- [ ] All logs centralized in /var/log/rightfit/
- [ ] Errors logged with stack traces
- [ ] API response times logged
- [ ] Uptime monitoring alerts on downtime

**S3.6: Photo Storage Migration** (3 pts)
- Set up AWS S3 bucket: rightfit-production-photos
- Migrate upload/download endpoints to S3
- Update frontend to use S3 URLs
- Migrate existing local photos to S3 (script)

**Acceptance Criteria**:
- [ ] S3 bucket created with correct permissions
- [ ] Photo upload saves to S3
- [ ] Photo URLs resolve correctly
- [ ] Existing photos migrated (verify count)
- [ ] Local storage cleaned up

**S3.7: API Documentation** (2 pts)
- Generate OpenAPI spec with swagger-jsdoc
- Host Swagger UI at api.rightfit.com/docs
- Document authentication flow (JWT)
- Document key endpoints (cleaning-jobs, workers)

**Acceptance Criteria**:
- [ ] Swagger UI accessible
- [ ] All endpoints documented
- [ ] Example requests/responses provided
- [ ] Authentication instructions clear

**Quality Requirements** (Sprint 3):
- [ ] 99.5% uptime target set
- [ ] API response time <200ms (p95)
- [ ] Database backups automated (daily)
- [ ] Disaster recovery plan documented
- [ ] Load testing passed (100 concurrent users)

**Definition of Done**:
- [ ] All 7 stories completed
- [ ] Platform deployed to production
- [ ] SSL certificates valid
- [ ] Monitoring active
- [ ] Test company can access platform

---

### Sprint 4: Cleaning Portal UI/UX Polish (Week 6-7)

**Duration**: 8 days
**Points**: 28 story points
**Status**: Waiting for Sprint 1-2
**Dependencies**: Sprint 1 (component library), Sprint 2 (worker app complete)

**Rationale**: web-cleaning is 80% complete but needs UI/UX polish to production standards. This sprint establishes the design template for Maintenance SaaS (Sprint 5).

**Goal**: Complete the cleaning portal to best-in-class standards, establishing the design template for maintenance portal replication.

**Stories**:

**S4.1: Dashboard Page Redesign** (4 pts)
- Apply gradient card grid styling (like PropertyDetails)
- Stats cards with consistent design (Jobs Today, Active Workers, Revenue)
- Recent activity feed improvements (job completions, issues reported)
- Responsive layout optimization (mobile, tablet, desktop)

**Acceptance Criteria**:
- [ ] Dashboard uses gradient cards
- [ ] Stats cards match PropertyDetails styling
- [ ] Activity feed shows last 10 activities
- [ ] Responsive on mobile (tested on real device)

**S4.2: Job Management Pages** (5 pts)
- CleaningJobs list page: Gradient cards, filter by status/date/worker
- CleaningJobDetails page: Polish (build on existing gradient work)
- Create/Edit job form improvements (better layout, validation)
- Consistent button and action placement

**Acceptance Criteria**:
- [ ] Job list uses gradient cards
- [ ] Filters work correctly
- [ ] Job details page polished
- [ ] Forms validate inputs before submit
- [ ] Mobile responsive

**S4.3: Property Management Pages** (4 pts)
- Properties list page with gradient cards
- PropertyDetails page refinements (already has good styling)
- Add/Edit property form polish
- Property calendar enhancements (guest bookings highlighted)

**Acceptance Criteria**:
- [ ] Property list uses gradient cards
- [ ] PropertyDetails page polished
- [ ] Forms validate inputs
- [ ] Calendar shows guest bookings clearly

**S4.4: Contract & Billing Pages** (4 pts)
- Contracts page improvements (list and details)
- Invoice and quote pages styling
- PDF generation enhancements (optional)
- Payment status indicators (paid, unpaid, overdue)

**Acceptance Criteria**:
- [ ] Contract list uses gradient cards
- [ ] Invoice list styled consistently
- [ ] Payment status badges clear
- [ ] PDF generation works (if implemented)

**S4.5: Worker Management Pages** (4 pts)
- Workers list page with cards
- WorkerDetails page improvements
- Timesheet pages refinements
- Availability management UI

**Acceptance Criteria**:
- [ ] Worker list uses gradient cards
- [ ] WorkerDetails page polished
- [ ] Timesheet list styled
- [ ] Availability calendar works

**S4.6: Customer Management Pages** (4 pts)
- Customers list page (gradient cards)
- CustomerDetails page
- Add/Edit customer forms
- Customer history views (jobs, invoices)

**Acceptance Criteria**:
- [ ] Customer list uses gradient cards
- [ ] CustomerDetails page polished
- [ ] Forms validate inputs
- [ ] History views styled consistently

**S4.7: Navigation & Layout** (3 pts)
- Sidebar navigation consistency
- Header improvements (user menu, notifications)
- Breadcrumbs implementation
- Mobile responsive testing (all pages)

**Acceptance Criteria**:
- [ ] Sidebar consistent across all pages
- [ ] Header styled consistently
- [ ] Breadcrumbs show current page location
- [ ] All pages mobile responsive (tested on real device)

**Quality Requirements** (Sprint 4):
- [ ] All pages have consistent styling (gradient cards, layouts)
- [ ] Mobile responsive across all pages (tested on 3+ devices)
- [ ] Navigation flows smoothly (no broken links)
- [ ] Loading states implemented on all pages
- [ ] Empty states implemented (no data placeholder)
- [ ] Error states handled gracefully
- [ ] Ready to use as template for maintenance portal

**Definition of Done**:
- [ ] All 7 stories completed
- [ ] All pages polished to production standards
- [ ] Test company validates UI/UX
- [ ] Design template established for Sprint 5 replication

---

## 6. User Experience Requirements

### 6.1 Design System

**Visual Language**: Gradient Card Grid
- Established pattern from PropertyDetails page
- Gradient backgrounds for cards
- Consistent spacing and shadows
- Clean, modern aesthetic

**Color Palette**:
- Primary: Existing theme colors
- Success: Green
- Warning: Yellow/Orange
- Error: Red
- Neutral: Gray scale

**Typography**:
- Headings: Sans-serif (existing)
- Body: Sans-serif (existing)
- Monospace: Code snippets only

**Component Patterns**:
- Cards: Gradient backgrounds, rounded corners, shadow
- Buttons: Primary (solid), Secondary (outline), Danger (red)
- Inputs: Border, focus state, validation error state
- Modals: Centered, backdrop, close button
- Toasts: Top-right corner, auto-dismiss after 5 seconds

### 6.2 Responsive Design

**Breakpoints**:
- Mobile: 320px - 767px
- Tablet: 768px - 1023px
- Desktop: 1024px+

**Mobile-First Approach**:
- All pages must work on mobile devices
- Touch targets: Minimum 44x44px
- Font sizes: Minimum 16px (prevent zoom on iOS)
- Navigation: Hamburger menu on mobile

**Device Testing**:
- iOS Safari (iPhone)
- Android Chrome (Samsung Galaxy)
- Tablet (iPad)

### 6.3 Accessibility (WCAG 2.1 AA)

**Requirements**:
- [ ] All interactive elements keyboard accessible
- [ ] Color contrast ratio: 4.5:1 for text
- [ ] Form inputs have labels
- [ ] Error messages clear and descriptive
- [ ] Focus indicators visible
- [ ] Alt text for all images
- [ ] ARIA labels where needed

**Testing**:
- axe DevTools: No critical or serious issues
- Keyboard navigation: Tab through all pages
- Screen reader: Test with VoiceOver or NVDA

### 6.4 Performance

**Targets**:
- Page load time: <2 seconds (3G network)
- Time to Interactive (TTI): <3 seconds
- First Contentful Paint (FCP): <1 second
- Lighthouse score: >90 (Performance)

**Optimizations**:
- Code splitting: Lazy load routes
- Image optimization: Compress photos
- Bundle size: <500KB per app (post-split)
- API response time: <200ms (p95)

### 6.5 Error Handling

**Error States**:
- Network error: "No internet connection. Please check your network."
- 404: "Page not found. Return to dashboard."
- 500: "Something went wrong. Please try again."
- Form validation: Field-level errors with red text

**Loading States**:
- Spinner: Full-page loader for initial load
- Skeleton: Placeholder for content loading
- Button: Loading spinner on submit

**Empty States**:
- No data: "No jobs scheduled. Click 'Schedule Job' to get started."
- No search results: "No results found. Try adjusting your filters."

---

## 7. Quality Gates & Acceptance Criteria

### 7.1 Sprint Completion Criteria

A sprint is **NOT** complete when time runs out.
A sprint is complete when:
- ✅ All stories completed
- ✅ All quality requirements met
- ✅ Code reviewed and meets standards
- ✅ Manual QA passed
- ✅ No critical bugs remain
- ✅ Documentation updated
- ✅ Stakeholder approval received

**If this takes longer than estimated, that's okay. Quality is not negotiable.**

### 7.2 Code Quality Gates

**TypeScript**:
- [ ] Strict mode enabled
- [ ] Zero `any` types
- [ ] All props typed
- [ ] No type errors

**Linting**:
- [ ] ESLint passes (no errors)
- [ ] Prettier formatting applied
- [ ] No console.log in production code

**Testing** (Manual for MVP):
- [ ] All user flows tested manually
- [ ] No regressions in existing features
- [ ] Edge cases tested (empty states, errors)

### 7.3 Security Quality Gates

**Authentication & Authorization**:
- [ ] All endpoints require authentication (except guest routes)
- [ ] service_provider_id verified on tenant-scoped queries
- [ ] JWT tokens expire correctly
- [ ] Refresh tokens rotate on use

**Input Validation**:
- [ ] All user inputs validated
- [ ] File uploads restricted to images
- [ ] File size limit enforced
- [ ] No SQL injection vulnerabilities

**Rate Limiting**:
- [ ] Guest routes: 10 req/15min per IP
- [ ] Auth routes: 5 login attempts per hour
- [ ] API routes: 100 req/15min per user

### 7.4 Performance Quality Gates

**Page Load Time**:
- [ ] <2 seconds on 3G network
- [ ] <1 second on WiFi

**API Response Time**:
- [ ] <200ms (p95)
- [ ] <500ms (p99)

**Bundle Size**:
- [ ] <500KB per app (after code splitting)
- [ ] <200KB for guest-tablet (smallest app)

### 7.5 Accessibility Quality Gates

**Automated Testing**:
- [ ] axe DevTools: No critical or serious issues
- [ ] Lighthouse Accessibility score: >90

**Manual Testing**:
- [ ] Keyboard navigation works on all pages
- [ ] Focus indicators visible
- [ ] Screen reader announces content correctly
- [ ] Color contrast meets WCAG AA

### 7.6 Browser Compatibility

**Supported Browsers**:
- [ ] Chrome 90+ (desktop and mobile)
- [ ] Safari 14+ (desktop and mobile)
- [ ] Firefox 88+ (desktop)
- [ ] Edge 90+ (desktop)

**Not Supported**:
- ❌ Internet Explorer 11 (end of life)
- ❌ Opera Mini (limited JavaScript support)

---

## 8. Success Metrics

### 8.1 Development Metrics (During MVP Build)

**Velocity**:
- Target: 15-20 story points per week
- Measure: Actual points completed vs. estimated

**Sprint Completion Rate**:
- Target: >90% of stories completed per sprint
- Measure: Completed stories / Total stories

**Bug Resolution Time**:
- Target: <48 hours for critical bugs
- Target: <1 week for medium bugs
- Measure: Time from bug report to fix deployed

**Code Quality**:
- Target: Zero TypeScript errors
- Target: ESLint passes with no errors
- Measure: Build output

### 8.2 Product Metrics (Post-Launch)

**User Onboarding**:
- Target: <15 minutes to schedule first job
- Measure: Time from signup to first job scheduled

**System Uptime**:
- Target: 99.5% uptime
- Measure: Uptime monitoring service (Pingdom, UptimeRobot)

**API Performance**:
- Target: <200ms response time (p95)
- Measure: API logs, monitoring dashboard

**User Satisfaction**:
- Target: >4.5/5 rating
- Measure: Post-pilot survey (NPS, CSAT)

**Job Completion Rate**:
- Target: >95% of scheduled jobs completed
- Measure: CleaningJob status (COMPLETED / SCHEDULED)

**Worker App Adoption**:
- Target: >90% of workers use web-worker app
- Measure: Worker logins, job completions via app

### 8.3 Business Metrics (Post-Launch)

**Test Company Pilot**:
- Target: 1 company onboarded in Q1 2026
- Measure: Active subscription

**Beta Customers**:
- Target: 3-5 companies by end of Q1 2026
- Measure: Active subscriptions

**Revenue**:
- Target: £500-£1,000/month by end of Q1 2026
- Measure: Subscription revenue

**Customer Retention**:
- Target: >85% retention after 3 months
- Measure: Churn rate

**Feature Adoption**:
- Target: >80% of customers use worker app
- Target: >60% of customers use guest tablet
- Measure: Feature usage analytics

---

## 9. Launch Readiness Checklist

### 9.1 Pre-Launch Checklist (Before Test Company Pilot)

**Security**:
- [ ] All critical security issues resolved (CRITICAL-001, 002, 003)
- [ ] Rate limiting enabled on all routes
- [ ] HTTPS enforced
- [ ] Database backups automated

**Infrastructure**:
- [ ] Production environment deployed
- [ ] SSL certificates valid
- [ ] Monitoring and alerting active
- [ ] Health checks passing

**Features**:
- [ ] All MVP features complete (Sprints 1-4)
- [ ] Manual QA passed on all features
- [ ] No critical bugs remain

**Documentation**:
- [ ] User guides created (service provider, worker, customer, guest)
- [ ] API documentation live (Swagger)
- [ ] Admin guides created (support team)

**Support**:
- [ ] Support email configured (support@rightfit.com)
- [ ] Support team trained
- [ ] Bug reporting process established

**Legal**:
- [ ] Terms of Service published
- [ ] Privacy Policy published
- [ ] GDPR compliance verified (data export, deletion)

### 9.2 Test Company Onboarding Checklist

**Pre-Onboarding**:
- [ ] Contract signed with test company
- [ ] Access credentials created
- [ ] Data import completed (customers, properties, workers)

**Onboarding Session** (2-3 hours):
- [ ] Demo platform to test company admin
- [ ] Train on scheduling jobs
- [ ] Train on worker assignment
- [ ] Train on customer management
- [ ] Answer questions

**Worker Training** (1 hour):
- [ ] Demo worker app to cleaners
- [ ] Train on job completion workflow
- [ ] Train on photo upload
- [ ] Train on issue reporting

**Post-Onboarding**:
- [ ] Schedule follow-up call (1 week)
- [ ] Collect feedback
- [ ] Address bugs and issues
- [ ] Iterate based on feedback

### 9.3 Beta Launch Checklist (After Test Company Validation)

**Pricing & Billing**:
- [ ] Stripe integration complete (if in scope)
- [ ] Pricing tiers finalized (£49/£149/Custom)
- [ ] Invoice generation tested

**Marketing**:
- [ ] Landing page live (rightfit.com)
- [ ] Beta signup form
- [ ] Case study from test company (optional)

**Scale Readiness**:
- [ ] Load testing completed (100 concurrent users)
- [ ] Database scaling plan
- [ ] Monitoring dashboards configured

**Beta Program**:
- [ ] Beta application form
- [ ] Beta terms and pricing (discounted)
- [ ] Beta feedback loop (weekly calls)

---

## 10. Risk Assessment & Mitigation

### 10.1 High-Priority Risks

**Risk 1: Test Company Churns After Pilot**

**Likelihood**: Medium
**Impact**: High (loses validation, delays beta launch)

**Mitigation**:
- Weekly check-ins during pilot
- Address bugs and feedback immediately
- Offer extended trial period
- Collect feedback early and often

**Contingency**:
- Have 2-3 backup companies in pipeline
- Use pilot feedback to improve product
- Pivot to different customer segment if needed

---

**Risk 2: Worker App Not Used (Cleaners Resist Change)**

**Likelihood**: Medium
**Impact**: High (platform unusable without worker app)

**Mitigation**:
- In-person training sessions with cleaners
- Simplify UX (fewer steps to complete job)
- Incentivize early adopters (bonuses, recognition)
- Make app work offline (deferred to Phase 5)

**Contingency**:
- Manual job completion by managers (workaround)
- Iterate on UX based on cleaner feedback
- Consider native mobile app (Phase 5)

---

**Risk 3: Production Deployment Fails**

**Likelihood**: Low
**Impact**: High (delays test company pilot)

**Mitigation**:
- Thorough testing on staging environment
- Deploy to production 1 week before pilot
- Smoke testing after deployment
- Have rollback plan ready

**Contingency**:
- Rollback to previous version
- Debug in staging environment
- Delay pilot by 1 week if needed

---

### 10.2 Medium-Priority Risks

**Risk 4: Performance Issues at Scale**

**Likelihood**: Medium
**Impact**: Medium (slow queries, timeouts)

**Mitigation**:
- Database indexes added (Sprint 0)
- Load testing before launch
- Redis caching (deferred to Phase 5 if not needed for MVP)

**Contingency**:
- Optimize slow queries
- Add caching layer
- Scale database (vertical scaling)

---

**Risk 5: Security Vulnerability Discovered Post-Launch**

**Likelihood**: Low
**Impact**: High (data breach, legal issues)

**Mitigation**:
- Security audit before launch (manual code review)
- All critical issues resolved (Sprint 0)
- Rate limiting and input validation in place

**Contingency**:
- Emergency patch process
- Notify affected users immediately
- Engage security consultant

---

### 10.3 Low-Priority Risks

**Risk 6: Browser Compatibility Issues**

**Likelihood**: Low
**Impact**: Low (affects small % of users)

**Mitigation**:
- Test on all major browsers
- Use feature detection (not browser detection)
- Provide fallback for unsupported features

**Contingency**:
- Display "Unsupported browser" message
- Recommend Chrome or Safari

---

**Risk 7: Dependency Vulnerabilities**

**Likelihood**: Low
**Impact**: Medium (security risk, forced upgrades)

**Mitigation**:
- Run `npm audit` before deployment
- Keep dependencies up to date
- Subscribe to security advisories

**Contingency**:
- Emergency dependency upgrade
- Temporary mitigation (disable feature)

---

## Appendix A: Glossary

**Service Provider**: Cleaning company (B2B customer) that manages workers and serves customers
**Customer**: Short-let business owner who requests cleaning services from service provider
**Worker**: Cleaner employed by service provider who completes jobs
**Guest**: Anonymous property visitor who reports issues via guest-tablet
**Tenant**: Database record representing a service provider (multi-tenancy)
**Job**: Cleaning or maintenance task assigned to a worker
**Contract**: Recurring cleaning agreement between service provider and customer
**Quote**: Estimate for maintenance work requiring customer approval
**Issue**: Problem reported by guest or worker
**Checklist**: List of tasks to complete during a cleaning job
**Timesheet**: Record of worker hours for a completed job

---

## Appendix B: User Flows

### User Flow 1: Schedule a Cleaning Job (Service Provider)

1. Service provider logs in to web-cleaning
2. Navigate to "Jobs" → "Schedule New Job"
3. Select customer from dropdown
4. Select property from customer's properties
5. Select checklist template (e.g., "Checkout Clean")
6. Choose date and time
7. Assign worker from available cleaners
8. Click "Schedule Job"
9. Job appears in job list with status "SCHEDULED"
10. Worker sees job in web-worker dashboard

### User Flow 2: Complete a Cleaning Job (Worker)

1. Worker logs in to web-worker on mobile device
2. Dashboard shows "Today's Jobs"
3. Tap job card to view details
4. Tap "Start Job" (records start time)
5. Complete checklist items (check boxes)
6. Upload before photos (camera)
7. Complete cleaning
8. Upload after photos (camera)
9. (Optional) Report maintenance issue found
10. Tap "Complete Job"
11. Job status updates to "COMPLETED"
12. Service provider sees completion photos in web-cleaning

### User Flow 3: Report an Issue (Guest)

1. Guest scans QR code at property
2. guest-tablet opens in browser (no login)
3. Welcome screen shows WiFi password
4. Tap "Report an Issue"
5. Select issue category (e.g., "Plumbing")
6. Enter description
7. Upload photos (camera)
8. AI analyzes issue (severity, category, recommended action)
9. Tap "Submit"
10. Issue appears in web-customer for property owner
11. Property owner approves/dismisses issue
12. If approved, maintenance provider receives quote request

### User Flow 4: Approve a Maintenance Quote (Customer)

1. Customer logs in to web-customer
2. Dashboard shows "Pending Quotes" badge (1)
3. Navigate to "Maintenance" → "Quotes"
4. Click quote card to view details
5. See issue description, photos, line items, total
6. If total < auto-approval limit (£200):
   - Quote auto-approved
7. If total > auto-approval limit:
   - Click "Approve" or "Decline"
8. If approved:
   - Maintenance provider receives notification
   - Job scheduled with maintenance worker

---

## Appendix C: API Endpoints Reference

**Base URL**: https://api.rightfit.com

### Authentication

```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh-token
POST /api/auth/logout
POST /api/auth/forgot-password
POST /api/auth/reset-password
```

### Cleaning Jobs

```
GET    /api/cleaning-jobs?service_provider_id={id}
POST   /api/cleaning-jobs
GET    /api/cleaning-jobs/:id
PUT    /api/cleaning-jobs/:id
DELETE /api/cleaning-jobs/:id
PUT    /api/cleaning-jobs/:id/assign
PUT    /api/cleaning-jobs/:id/complete
GET    /api/cleaning-jobs/:id/history
```

### Workers

```
GET    /api/workers?service_provider_id={id}
POST   /api/workers
GET    /api/workers/:id
PUT    /api/workers/:id
DELETE /api/workers/:id
GET    /api/workers/me
GET    /api/workers/:id/schedule
```

### Customer Properties

```
GET    /api/customer-properties?service_provider_id={id}
POST   /api/customer-properties
GET    /api/customer-properties/:id
PUT    /api/customer-properties/:id
DELETE /api/customer-properties/:id
```

### Guest (Anonymous)

```
POST /api/guest/sessions
POST /api/guest/questions
POST /api/guest/issues
GET  /api/guest/diy-guides/:type
GET  /api/guest/knowledge/:propertyId
```

### Photos

```
POST /api/photos/upload
GET  /api/photos/:id
DELETE /api/photos/:id
```

**Full API documentation**: https://api.rightfit.com/docs

---

## Appendix D: Database Schema Summary

**Total Tables**: 40+
**Total Lines**: 1,701 (Prisma schema)

**Key Models**:

```
Tenant
├── ServiceProvider
│   ├── Customer
│   │   └── CustomerProperty
│   │       └── CleaningJob
│   ├── Worker
│   └── Service

User (authentication)

CleaningJob
├── CleaningContract
├── CleaningJobTimesheet
└── Photo

MaintenanceJob (out of scope for MVP)
WorkerIssueReport
GuestIssueReport

Quote
Invoice
```

**See**: packages/database/prisma/schema.prisma for complete schema

---

## Document Control

**Version History**:

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Nov 7, 2025 | Product Manager (AI) | Initial brownfield PRD for Cleaning SaaS MVP |

**Review & Approval**:

- [ ] Product Owner: _________________ Date: _______
- [ ] Technical Lead: _________________ Date: _______
- [ ] UI/UX Lead: ___________________ Date: _______

**Next Review**: After Sprint 2 completion (or earlier if scope changes)

---

**Last Updated**: November 7, 2025
**Document Owner**: Product Management
**Status**: Ready for Development

---

## How to Use This PRD

**For Product Managers**:
- Use this as the single source of truth for MVP scope
- Reference during sprint planning
- Update as scope changes (with approval)

**For Developers**:
- Reference feature requirements and acceptance criteria
- Clarify ambiguity with product owner
- Do not deviate from scope without approval

**For QA**:
- Use acceptance criteria as test cases
- Reference quality gates for testing standards
- Report deviations to product owner

**For Stakeholders**:
- Understand what will be delivered and when
- Provide feedback early (before development starts)
- Use this to align expectations

---

**Philosophy Reminder**: This is a **quality-first** PRD. Sprints complete when quality gates are met, not when time expires. RightFit, not QuickFix.
