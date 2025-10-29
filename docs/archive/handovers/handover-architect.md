# Technical Architecture Handover Document
## RightFit Services - MVP System Design

**Document Version:** 1.0
**Date:** 2025-10-27
**From:** Business Analyst (Mary)
**To:** Technical Architect
**Project:** RightFit Services - Property Maintenance SaaS Platform

---

## 🎯 Your Mission

Design the **complete technical architecture** for RightFit Services MVP - a mobile-first, offline-capable property maintenance platform for UK landlords. This is a **solo developer bootstrap project** with a **3-month timeline** and **minimal budget (£2k-5k)**.

Your architecture must be:
- ✅ **Simple enough** for one full-stack developer to build in 12 weeks
- ✅ **Scalable enough** to support 500-1,000 users without major rewrites
- ✅ **Cost-optimized** for minimal AWS spending (<£200/month at 100 users)
- ✅ **Reliable** (99.5%+ uptime target - this is our competitive differentiator vs. Arthur Online)
- ✅ **Offline-first** for mobile (critical differentiator for rural properties)

---

## 📋 Project Context (Read This First)

### What is RightFit Services?

A **reliable, mobile-native property maintenance platform** targeting UK landlords managing 1-50 long-term let properties.

**Core Problem We're Solving:**
- Current market leader (Arthur Online) has chronic reliability issues (multi-day outages, 3.8/5 rating, £62.50-126/month)
- Alternative platforms either lack mobile-first design (Landlord Vision desktop-only) or have limited features (Landlord Studio £9/month but basic)
- Landlords waste 10-20 hours/week on manual maintenance coordination (phone calls, texts, scattered documentation)

**Our Solution:**
"Arthur Online's features without the outages, at half the price (£15-25/month)"

**Key Differentiators:**
1. **Rock-solid reliability** (99.5%+ uptime vs. Arthur Online's failures)
2. **True mobile-first** (native iOS/Android apps with offline mode)
3. **Basic AI photo quality checks** (unique at this price point - Google Vision API)
4. **UK compliance tracking** (Gas Safety, Electrical, EPC certificate reminders)
5. **Competitive pricing** (£15-25/month vs. £60-120 competitors)

### Target Users

**Primary:** Independent long-term landlords
- Managing 1-20 properties (flats, houses, HMOs)
- Age 30-55, moderate tech comfort
- Currently use Arthur Online, Landlord Vision, or spreadsheets
- Need mobile app for property inspections (create work orders on-site, take photos)

**Secondary:** Contractors
- Plumbers, electricians, handymen who do work for landlords
- Receive SMS notifications when work orders assigned
- Use simple mobile app to update status, upload "after" photos

### Business Model

- **UK-wide SaaS** (multi-tenant from day 1)
- **Subscription pricing:** £15-25/month per landlord account (unlimited properties)
- **Free 30-day trial** (no credit card required)
- **Target revenue:** £750-2,000 MRR by Month 6, £4k-12.5k MRR by Month 12

---

## 🚨 Critical Constraints (Non-Negotiable)

### Budget Constraint: MINIMAL

- **£2k-5k total for MVP** (AWS costs, domain, API costs, tools)
- **No external funding** - founder self-funded
- **Monthly AWS budget target:** <£50/month at 10-20 users, <£200/month at 100 users

**Architectural Implications:**
- Use cost-effective AWS services (t3.micro RDS, S3 standard storage, CloudFront free tier)
- Avoid expensive managed services (no Kubernetes, no Lambda at scale, no Elasticsearch initially)
- Optimize database queries from day 1 (no "we'll optimize later" - can't afford performance issues)

### Timeline Constraint: 3 MONTHS (12 Weeks)

- **Solo full-stack developer** (React Native, Node.js, TypeScript, PostgreSQL experience)
- **Part-time development** (assume 20-30 hours/week alongside day job)
- **No team** to delegate to

**Architectural Implications:**
- **Proven technology stack ONLY** (no experimentation, no learning curves)
- **Modular monolith** (not microservices - too much operational overhead for solo dev)
- **Off-the-shelf services** where possible (Stripe, Google Vision, Twilio, SendGrid)
- **Simple deployment** (Docker + EC2 or ECS Fargate, not Kubernetes)
- **Minimal custom infrastructure** (use AWS managed services where cost-effective)

### Technical Constraint: Offline-First Mobile (CRITICAL)

**This is our core differentiator vs. competitors.**

- Mobile app MUST work without internet connection (rural properties have poor signal)
- User can create work orders, take photos, add notes while offline
- Changes queue locally, auto-sync when connection restored
- No data loss if app crashes or user force-quits during offline session

**Architectural Implications:**
- Local data persistence on mobile (SQLite or AsyncStorage + IndexedDB pattern)
- Sync queue with retry logic and conflict resolution
- Optimistic UI updates (show changes immediately, sync in background)
- Server-side conflict resolution strategy (last-write-wins acceptable for MVP)

### Compliance Constraint: UK Data Residency (GDPR)

- All user data MUST be stored in AWS UK regions (eu-west-2 London)
- Standard GDPR compliance: data export, data deletion, consent tracking
- No complex requirements, just standard SaaS best practices

**Architectural Implications:**
- AWS resources in eu-west-2 (London) region
- User data export API endpoint
- User account deletion with cascade
- Audit log for data access (basic)

---

## 📦 MVP Feature Scope (What to Architect For)

### Core Features - Week-by-Week Development Plan

You need to design architecture supporting these 10 core features:

**Week 1-2: Property Management**
- Create/edit properties (name, address, type, bedrooms/bathrooms)
- Upload property photos (10 max per property, stored in S3)
- Property list view with search/filter

**Week 2-4: Work Order Management**
- Create work orders (title, description, priority, due date)
- Assign to contractor from database
- Status workflow: Open → Assigned → In Progress → Completed
- Attach photos (5 max per work order)
- Cost tracking (manual entry after completion)
- Work order list with filters (status, property, priority)

**Week 5-8: Mobile Apps (iOS + Android)**
- React Native app with core features (properties, work orders, contractors)
- Photo upload from camera (one-tap capture)
- **Offline mode:** Queue work orders and photos, auto-sync when online
- Push notifications (work order assignments, status changes)

**Week 6-7: Photo Upload + Basic AI Quality Check**
- Mobile camera integration
- **Google Vision API integration:** Detect too dark/blurry photos, warn user
- Photos stored in S3 with timestamp metadata
- Simple before/after photo labeling

**Week 3-4: Contractor Database**
- Create/edit contractors (name, phone, email, specialties, hourly rate)
- Assign contractors to work orders
- **SMS notification when work order assigned** (Twilio)
- Contractor work history (list of past work orders)
- Internal notes and rating (1-5 stars, private)

**Week 8-9: UK Compliance Certificate Tracking**
- Upload certificates (PDF or image) per property
- Certificate types: Gas Safety, Electrical, EPC, Scottish STL (optional)
- Expiration date tracking with status indicators (valid/expiring/expired)
- **Push notifications:** 60 days, 30 days, 7 days before expiration

**Week 9-10: Basic Web App**
- React web app with core features (property list, work orders, contractors)
- Mobile-responsive design (works on tablet/desktop)
- Feature parity with mobile for landlord workflows (contractor views mobile-only)

**Week 1: Authentication & Multi-Tenancy**
- User registration/login (email + password, JWT tokens)
- Multi-tenant SaaS architecture (each landlord account isolated)
- Basic roles: Landlord (full access), Contractor (limited to assigned work orders)

**Week 10-11: Payment & Subscription (Stripe)**
- Stripe integration for subscription payments (£15-25/month plans)
- Free 30-day trial (no credit card for signup)
- Simple pricing page and checkout flow
- Admin panel to view subscriptions (manual refunds/cancellations)

**Week 11-12: Deployment & Monitoring**
- AWS infrastructure setup (EC2/ECS, RDS PostgreSQL, S3, CloudFront CDN)
- CI/CD pipeline (GitHub Actions)
- Error monitoring (Sentry or similar)
- Uptime monitoring (UptimeRobot with status page)

### Features EXPLICITLY CUT from MVP (Do NOT architect for these)

❌ Tenant portal (Phase 2)
❌ Payment processing for rent (Phase 2)
❌ Cleaning coordination / photo checklists (STR-specific, Phase 2)
❌ Calendar/booking management (Phase 2)
❌ Contractor marketplace (Phase 2)
❌ Advanced reporting/analytics (Phase 2)
❌ Document storage beyond certificates (Phase 2)
❌ In-app messaging (use SMS/email for MVP)
❌ Advanced AI (custom models, damage estimation - Phase 2)
❌ Channel manager integrations (Airbnb APIs - Phase 3)
❌ MTD HMRC integration (Phase 3)

---

## 🛠️ Technology Stack (Recommended)

### Frontend

**Mobile: React Native (iOS + Android)**
- **Why:** Code sharing (70-80% between iOS/Android), proven for offline apps, solo developer can maintain
- **UI Library:** React Native Paper or NativeBase (Material Design out-of-the-box, no custom design needed)
- **State Management:** Redux Toolkit + Redux Persist (for offline sync) OR Zustand + AsyncStorage
- **Offline Storage:** @react-native-async-storage/async-storage + IndexedDB pattern OR WatermelonDB (if complex sync)
- **Navigation:** React Navigation (standard)
- **Camera:** react-native-camera or expo-camera
- **Push Notifications:** @react-native-firebase/messaging (FCM for Android, APNs for iOS)

**Web: React + TypeScript**
- **Why:** Code sharing with mobile (shared business logic), strong ecosystem
- **UI Library:** Material-UI (MUI) - similar to React Native Paper for consistency
- **State Management:** Redux Toolkit (shared with mobile)
- **Routing:** React Router v6

### Backend

**API: Node.js + Express + TypeScript**
- **Why:** JavaScript full-stack (solo developer efficiency), proven for SaaS, good async performance
- **Alternative:** Python + FastAPI (if developer prefers Python, but Node.js recommended for JS consistency)
- **Validation:** Zod or Joi (TypeScript schema validation)
- **ORM:** Prisma (TypeScript-native, great DX) OR TypeORM (more mature, better for complex queries)

### Database

**Primary: PostgreSQL 14+ (AWS RDS)**
- **Why:** ACID compliance (financial transactions), JSON support (flexible schemas), mature, cost-effective
- **Size:** db.t3.micro (2 vCPU, 1GB RAM) sufficient for <100 users (~£15/month)
- **Schema:** Design for multi-tenancy from day 1 (tenant_id on all tables, row-level security OR query filters)

**Caching: Redis (AWS ElastiCache)**
- **Why:** Session storage, rate limiting, pub/sub for real-time features (future)
- **Size:** cache.t3.micro (1GB) sufficient for MVP (~£12/month)
- **Alternative:** Skip Redis for MVP, use in-memory cache in Node.js (save costs)

**File Storage: AWS S3 (Standard)**
- **Why:** Durable, cheap, integrates with CloudFront CDN
- **Buckets:**
  - `rightfit-services-photos-prod` (work order photos, property photos)
  - `rightfit-services-certificates-prod` (compliance documents)
- **Cost:** ~£0.023/GB/month + transfer costs (estimate £10-30/month at scale)

### Infrastructure

**Hosting: AWS (eu-west-2 London Region)**

**Compute Options (Choose One):**

1. **EC2 (Recommended for Solo Dev):**
   - t3.small (2 vCPU, 2GB RAM) - ~£15/month
   - Docker Compose for API + background workers
   - Pros: Simple, full control, easy debugging
   - Cons: Manual scaling (acceptable for MVP)

2. **ECS Fargate (Recommended for Production-Ready):**
   - 0.5 vCPU, 1GB RAM task - ~£25/month
   - Docker containers, auto-scaling ready
   - Pros: Better scaling, less maintenance
   - Cons: Slightly more complex setup

3. **Elastic Beanstalk (Easiest):**
   - Managed platform for Node.js apps
   - Pros: Simplest deployment
   - Cons: Less control, slightly higher cost

**Recommendation:** Start with **EC2 + Docker Compose** for MVP (cheapest, simplest), migrate to ECS Fargate when scaling (Month 6+).

**CDN: CloudFront (Free Tier - 1TB/month, 10M requests)**
- Serve photos and static assets (web app)
- Reduces S3 transfer costs
- Improves load times for UK users

**DNS: Route 53**
- ~£0.50/month per hosted zone
- ~£0.40/million queries (negligible)

### External Services

**Payment Processing: Stripe**
- Subscription billing (£15-25/month plans)
- Free 30-day trial support (no card required)
- UK payment methods (card, bank transfer via Stripe)
- Pricing: 1.5% + 20p per transaction (£20/month plan = £0.50 fee)

**SMS Notifications: Twilio**
- UK mobile SMS: £0.04/message
- Estimate: 10 SMS/user/month = £0.40/user/month (£40 for 100 users)
- Alternative: Use email-to-SMS gateway (cheaper but less reliable)

**Email: SendGrid (Free Tier - 100/day)**
- Transactional emails (password reset, notifications, invoices)
- Upgrade to Essentials ($19.95/month) when exceeding free tier

**AI Photo Quality: Google Vision API**
- Label Detection API: $1.50 per 1,000 images (first 1,000/month free)
- Estimate: 5 photos/work order, 100 work orders/month = 500 photos/month (FREE)
- Alternative: AWS Rekognition (similar pricing)

**Push Notifications: Firebase Cloud Messaging (FREE)**
- iOS + Android push notifications
- Unlimited notifications

### CI/CD & Monitoring

**Version Control: GitHub**
- Private repository (free)

**CI/CD: GitHub Actions (Free for public repos, 2,000 minutes/month for private)**
- Automated testing on PR
- Automated deployment to AWS on merge to main
- Docker image build and push to ECR (AWS)

**Error Monitoring: Sentry (Free - 5k events/month)**
- Real-time error tracking
- Source maps for React/React Native

**Uptime Monitoring: UptimeRobot (Free - 50 monitors, 5-min interval)**
- Monitor API health
- Public status page (transparency differentiator vs. Arthur Online)

**Logging: CloudWatch Logs (AWS)**
- Application logs from EC2/ECS
- ~£5-10/month at MVP scale

---

## 🏗️ Your Deliverables

Please provide the following architecture documentation:

### 1. System Architecture Diagram (HIGH PRIORITY)

**Visual diagram showing:**
- Client layer: React Native mobile (iOS/Android), React web app
- API Gateway layer: Node.js/Express REST API
- Business logic layer: Services (Work Orders, Properties, Contractors, Auth, Notifications)
- Data layer: PostgreSQL, Redis (optional), S3
- External services: Stripe, Google Vision API, Twilio, SendGrid, FCM
- Infrastructure: EC2/ECS, RDS, S3, CloudFront, Route 53

**Tools:** Use draw.io, Lucidchart, Excalidraw, or Mermaid (text-based)

### 2. Database Schema / Entity Relationship Diagram (HIGH PRIORITY)

**Core entities (minimum):**
- `users` (landlords, contractors)
- `properties` (landlord's properties)
- `work_orders` (maintenance tasks)
- `contractors` (landlord's contractor database)
- `certificates` (compliance documents)
- `photos` (work order photos, property photos)
- `subscriptions` (Stripe subscription data)

**Key considerations:**
- Multi-tenancy strategy (tenant_id on all tables? Row-level security? Database-per-tenant?)
- Soft deletes (deleted_at timestamp) or hard deletes?
- Audit logging (created_at, updated_at, created_by, updated_by on all tables)
- JSON columns for flexible data (e.g., work order metadata)

**Relationships:**
- 1-to-many: landlord → properties, property → work_orders, landlord → contractors
- Many-to-many: work_orders ↔ photos (join table)
- Nullable foreign keys: work_order → contractor (nullable until assigned)

### 3. API Design Document (MEDIUM PRIORITY)

**RESTful API endpoints (minimum):**

**Authentication:**
- `POST /api/v1/auth/register` - User signup
- `POST /api/v1/auth/login` - User login (returns JWT)
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password with token

**Properties:**
- `GET /api/v1/properties` - List landlord's properties
- `POST /api/v1/properties` - Create property
- `GET /api/v1/properties/:id` - Get property details
- `PUT /api/v1/properties/:id` - Update property
- `DELETE /api/v1/properties/:id` - Delete property (soft delete)

**Work Orders:**
- `GET /api/v1/work-orders` - List work orders (with filters: status, property, priority)
- `POST /api/v1/work-orders` - Create work order
- `GET /api/v1/work-orders/:id` - Get work order details
- `PUT /api/v1/work-orders/:id` - Update work order (status, notes, cost)
- `DELETE /api/v1/work-orders/:id` - Delete work order
- `POST /api/v1/work-orders/:id/assign` - Assign contractor (sends SMS)
- `POST /api/v1/work-orders/:id/photos` - Upload photo to work order

**Contractors:**
- `GET /api/v1/contractors` - List landlord's contractors
- `POST /api/v1/contractors` - Create contractor
- `GET /api/v1/contractors/:id` - Get contractor details (+ work history)
- `PUT /api/v1/contractors/:id` - Update contractor
- `DELETE /api/v1/contractors/:id` - Delete contractor

**Certificates:**
- `GET /api/v1/properties/:id/certificates` - List property's certificates
- `POST /api/v1/properties/:id/certificates` - Upload certificate
- `PUT /api/v1/certificates/:id` - Update certificate expiration
- `DELETE /api/v1/certificates/:id` - Delete certificate

**Photos:**
- `POST /api/v1/photos/upload` - Upload photo (returns S3 URL)
- `POST /api/v1/photos/analyze` - Analyze photo with Google Vision API (returns quality issues)

**Sync (for offline mobile):**
- `POST /api/v1/sync/work-orders` - Batch create/update work orders from offline queue
- `GET /api/v1/sync/delta?since=<timestamp>` - Get all changes since timestamp (pull changes from server)

**Subscriptions (admin only):**
- `GET /api/v1/subscriptions` - List all subscriptions
- `POST /api/v1/subscriptions/:id/cancel` - Cancel subscription

**Request/response format:**
- JSON only
- Standard HTTP status codes (200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 404 Not Found, 500 Server Error)
- Error responses: `{ "error": { "code": "INVALID_INPUT", "message": "Property name is required" } }`
- Success responses: `{ "data": { ... }, "meta": { "total": 100, "page": 1 } }`

### 4. Offline Sync Strategy (HIGH PRIORITY - This is Critical)

**Please design:**

**Client-side (Mobile):**
- Local data storage approach (SQLite, AsyncStorage, WatermelonDB, or other)
- Sync queue data structure (store pending actions: create, update, delete)
- Retry logic (exponential backoff, max retries)
- Conflict detection (detect server changes while offline)

**Server-side:**
- Conflict resolution strategy (last-write-wins acceptable for MVP)
- Delta sync endpoint (return only changes since timestamp)
- Versioning or timestamp-based optimistic locking

**Sync Flow:**
1. User goes offline → app switches to "offline mode"
2. User creates work order → saved to local DB + added to sync queue
3. User takes photo → saved locally + added to sync queue
4. User comes online → app detects connection restored
5. Sync queue processes:
   a. Upload photos to S3
   b. POST work order to API (includes S3 photo URLs)
   c. On success: remove from queue, update local DB with server IDs
   d. On failure: retry with exponential backoff
6. Pull server changes (delta sync) to update local DB

**Edge cases to handle:**
- App crashes before sync completes → queue persists, resume on next launch
- User edits same work order on web while mobile offline → last-write-wins (server timestamp)
- User deletes work order on web while mobile has pending edit → 404 on sync, remove from local queue

### 5. Multi-Tenancy Architecture (HIGH PRIORITY)

**Design decision needed:**

**Option A: Shared Database with tenant_id (Recommended)**
- Single database, all tables have `tenant_id` (landlord account ID)
- All queries filter by `tenant_id` (enforced in ORM/repository layer)
- Pros: Simplest, most cost-effective, easy backups
- Cons: Requires disciplined query filtering (accidental cross-tenant data leaks if bug)

**Option B: Database Per Tenant**
- Each landlord gets their own PostgreSQL schema or database
- Pros: Complete data isolation, easier compliance
- Cons: Expensive (£15/month per tenant minimum), complex migrations

**Option C: Hybrid (Shared DB + Row-Level Security)**
- PostgreSQL row-level security policies enforce tenant isolation
- Pros: Database-enforced security (safer than app-level)
- Cons: Complex setup, harder debugging

**Recommendation:** **Option A (Shared DB with tenant_id)** for MVP. Migrate to Option C (RLS) if security audit required for enterprise customers.

**Design requirements:**
- User belongs to exactly one tenant (landlord account)
- Contractors can be invited to multiple tenant accounts (shared contractors? Or duplicate per tenant?)
- API middleware extracts `tenant_id` from JWT token, injects into all queries
- Admin panel can impersonate tenant (for support)

### 6. Authentication & Authorization (MEDIUM PRIORITY)

**Design:**

**Authentication:**
- Email + password (bcrypt hashing, cost factor 12)
- JWT tokens (access token: 15 min expiry, refresh token: 30 days)
- Refresh token rotation (new refresh token issued on refresh)
- Password reset flow (email token, 1-hour expiry)

**Authorization:**
- Roles: `LANDLORD`, `CONTRACTOR`, `ADMIN`
- Landlord: Full access to their tenant's data
- Contractor: Read-only access to assigned work orders only
- Admin: Full access to all tenants (for support, analytics)

**Middleware:**
- `requireAuth` - Validates JWT token, extracts user + tenant_id
- `requireRole(['LANDLORD', 'ADMIN'])` - Checks user role
- `requireOwnership` - Validates user owns the resource (e.g., work order belongs to user's tenant)

### 7. AWS Infrastructure Setup Guide (MEDIUM PRIORITY)

**Please provide:**

**Infrastructure as Code (Optional but Recommended):**
- Terraform or AWS CloudFormation template for MVP infrastructure
- OR step-by-step manual setup guide

**Resources to provision:**
- VPC with public/private subnets (or use default VPC for simplicity)
- RDS PostgreSQL (db.t3.micro, eu-west-2, Multi-AZ for production or single-AZ for MVP cost savings)
- ElastiCache Redis (cache.t3.micro, eu-west-2) - Optional for MVP
- EC2 instance (t3.small, eu-west-2, Amazon Linux 2 or Ubuntu)
- S3 buckets (photos, certificates) with CloudFront distribution
- Route 53 hosted zone (rightfitservices.co.uk or similar)
- Security groups (API: allow 443, 80; RDS: allow 5432 from API only)
- IAM roles (EC2 instance role with S3 access, RDS access)

**Estimated monthly costs (MVP - <100 users):**
- EC2 t3.small: £15/month
- RDS db.t3.micro (single-AZ): £15/month
- S3 + CloudFront: £10-20/month
- Route 53: £1/month
- **Total: ~£41-51/month** (within budget)

**Cost optimization tips:**
- Use RDS Single-AZ for dev/staging (switch to Multi-AZ for production)
- Use S3 Intelligent-Tiering for older photos (auto-archive)
- Set up billing alerts (£50, £100, £150)
- Review AWS Trusted Advisor cost optimization recommendations monthly

### 8. Security & Compliance Checklist (MEDIUM PRIORITY)

**Please document:**

**Application Security:**
- [ ] HTTPS everywhere (TLS 1.2+, SSL certificate via AWS Certificate Manager - free)
- [ ] Password hashing (bcrypt cost factor 12)
- [ ] SQL injection prevention (parameterized queries via ORM)
- [ ] XSS prevention (React escapes by default, validate on backend)
- [ ] CSRF protection (not needed for JWT API, but add for session-based web if used)
- [ ] Rate limiting (prevent brute force: 5 failed logins = 15 min lockout, 100 API requests/min per user)
- [ ] Input validation (Zod schemas on all API endpoints)
- [ ] Secrets management (AWS Secrets Manager or Parameter Store for DB credentials, API keys)

**Data Protection (GDPR):**
- [ ] Data at rest encryption (RDS encryption enabled, S3 bucket encryption)
- [ ] Data in transit encryption (HTTPS, RDS TLS connection)
- [ ] UK data residency (all resources in eu-west-2 London)
- [ ] User data export API (GDPR right to data portability)
- [ ] User account deletion (GDPR right to erasure - cascade delete all user data)
- [ ] Audit logging (log who accessed what, when - basic for MVP)

**Infrastructure Security:**
- [ ] VPC with private subnets for RDS (no public internet access to database)
- [ ] Security groups (least privilege - only necessary ports open)
- [ ] IAM roles (not access keys - EC2 instance role for AWS service access)
- [ ] CloudWatch alarms (CPU > 80%, disk space < 20%, API error rate > 5%)
- [ ] Automated backups (RDS daily backups, 7-day retention)

### 9. Deployment & CI/CD Pipeline (LOW PRIORITY - Can do manually initially)

**Please outline:**

**GitHub Actions workflow (`.github/workflows/deploy.yml`):**

```yaml
# Example structure (you design the details)
name: Deploy to Production
on:
  push:
    branches: [main]
jobs:
  test:
    - Run unit tests
    - Run integration tests
  build:
    - Build Docker image (Node.js API)
    - Push to AWS ECR or Docker Hub
  deploy:
    - SSH to EC2 instance
    - Pull latest Docker image
    - Run database migrations (Prisma migrate or TypeORM migrations)
    - Restart Docker containers (docker-compose down && docker-compose up -d)
    - Run smoke tests (health check endpoint)
```

**Database Migrations:**
- Prisma Migrate or TypeORM migrations
- Version-controlled SQL migration files
- Automated on deployment (after backup!)

**Rollback strategy:**
- Keep previous Docker image tagged (image:v1.2.3)
- Rollback = deploy previous version
- Database rollback = restore from RDS automated backup (last resort)

### 10. Performance & Scalability Considerations (LOW PRIORITY for MVP)

**Please document scaling path:**

**MVP (0-100 users):**
- Single EC2 instance (t3.small)
- Single RDS instance (db.t3.micro)
- No caching (acceptable)

**Growth Phase (100-500 users):**
- Upgrade EC2 to t3.medium (4 vCPU, 4GB RAM)
- Upgrade RDS to db.t3.small (2 vCPU, 2GB RAM)
- Add Redis caching (session data, frequently accessed properties)
- Add database connection pooling (pg-pool, 10-20 connections)

**Scale Phase (500-1,000 users):**
- Migrate to ECS Fargate with auto-scaling (2-4 tasks)
- Application Load Balancer (distribute traffic)
- Upgrade RDS to db.t3.medium, enable read replicas if needed
- Add database indexes (on foreign keys, frequently queried columns)

**When to scale:**
- Monitor: API response time >500ms for 95th percentile = time to scale
- Monitor: CPU >80% sustained = time to scale
- Monitor: Database connections >80% of max = add pooling or scale RDS

---

## 📚 Reference Documents

For full project context, please read:

1. **`docs/brief.md`** - Complete project brief (target market, business model, MVP scope, constraints)
2. **`docs/po-discovery.md`** - Product requirements discovery (user personas, workflows, functional requirements)

---

## ❓ Questions to Clarify Before Architecting

If you need clarification on any of the following, please ask:

1. **Offline sync complexity:** How sophisticated should conflict resolution be? (Last-write-wins acceptable for MVP?)
2. **Multi-tenancy:** Shared DB with tenant_id OK, or need stricter isolation? (Shared recommended)
3. **Redis caching:** Include in MVP or skip to save costs? (Skip recommended, add Month 6+)
4. **Database ORM:** Prisma (better DX) or TypeORM (more mature)? (Prisma recommended)
5. **Deployment:** EC2 + Docker Compose (simpler) or ECS Fargate (more scalable)? (EC2 recommended for MVP)
6. **Mobile state management:** Redux + Redux Persist or Zustand + AsyncStorage? (Redux recommended for complex sync)
7. **Background jobs:** Needed for MVP? (Certificate expiration reminders could be cron job on EC2)

---

## 🎯 Success Criteria for Your Architecture

Your architecture is successful if:

✅ **Solo developer can build it in 12 weeks** (no unknowns, proven stack)
✅ **Costs <£200/month at 100 users** (budget constraint met)
✅ **99.5%+ uptime achievable** (simple, reliable infrastructure)
✅ **Offline mobile works flawlessly** (core differentiator delivered)
✅ **Scales to 500-1,000 users without major rewrites** (future-proof)
✅ **Security & GDPR compliant** (no shortcuts on data protection)
✅ **Deployment is simple** (solo dev can deploy in <30 minutes)

---

## 🚀 Next Steps After You Deliver Architecture

1. **PM agent** will create detailed sprint plan based on your architecture
2. **PO agent** will write user stories referencing your API endpoints and data models
3. **Developer (founder)** will review your architecture and start building Week 1

---

**Questions? Need clarification? Please document your assumptions and proceed with your best judgment. Looking forward to your architecture design!**

**Good luck! 🏗️**
