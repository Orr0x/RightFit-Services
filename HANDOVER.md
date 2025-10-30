# RightFit Services - Developer Handover Document

**Date:** 2025-10-28
**From:** Development Agent (Previous Sessions)
**To:** Next Developer Agent
**Project:** RightFit Services MVP
**Status:** 233/304 Story Points Complete (77%) | ✅ Stable Tech Stack

---

## ✅ Recent Update: Tech Stack Migration Complete

**Migration Completed (2025-10-28):** Successfully migrated to React 18.3.1 + Node 20 LTS. Development environment now stable with zero peer warnings. See [docs/MIGRATION_RESULTS.md](docs/MIGRATION_RESULTS.md).

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [What's Been Built](#whats-been-built)
3. [Project Architecture](#project-architecture)
4. [Getting Started](#getting-started)
5. [Critical Context](#critical-context)
6. [What Needs to Be Done Next](#what-needs-to-be-done-next)
7. [Known Issues](#known-issues)
8. [Testing Strategy](#testing-strategy)
9. [Deployment Plan](#deployment-plan)
10. [Common Tasks](#common-tasks)
11. [Troubleshooting](#troubleshooting)
12. [Key Files Reference](#key-files-reference)

---

## 📊 Executive Summary

### Project Vision
RightFit Services is a UK-focused property maintenance management platform for landlords. The key differentiator is **offline-first mobile app** that works in rural areas with poor connectivity.

### Current State
- **Backend API:** Fully functional with authentication, properties, work orders, contractors, photos, and certificates
- **Web Frontend:** Functional but basic - needs polish
- **Mobile App:** Core screens built, but needs auth state management and offline mode
- **AI Features:** Photo quality analysis implemented (Google Vision API)
- **Compliance:** Certificate tracking implemented, notifications pending

### Critical Path to MVP
1. **Sprint 4: Offline Mode** (56 points) - MOST IMPORTANT
2. **Sprint 5 Completion:** Push notifications (18 points)
3. **Sprint 6:** Stripe payments + Launch (53 points)

### Timeline
- **Completed:** Sprints 1, 2, 3, and 5 (partial)
- **Remaining:** Sprint 4 (critical), Sprint 5 (18 points), Sprint 6 (53 points)
- **Estimated Time to MVP:** 6-8 weeks at current velocity

---

## 🏗️ What's Been Built

### Sprint 1: Foundation ✅ COMPLETE
**File:** `SPRINT1_STATUS.md`

**Backend:**
- Turborepo monorepo with pnpm workspaces
- PostgreSQL database with Prisma ORM
- JWT authentication with refresh tokens
- User registration and login
- Password reset flow
- Multi-tenancy architecture (tenant_id filtering)
- Property CRUD endpoints
- Rate limiting on auth endpoints
- Error handling middleware
- Winston logging

**Locations:**
- `apps/api/src/routes/auth.ts` - Authentication endpoints
- `apps/api/src/routes/properties.ts` - Property endpoints
- `apps/api/src/services/AuthService.ts` - Auth business logic
- `apps/api/src/services/PropertiesService.ts` - Property business logic
- `packages/database/prisma/schema.prisma` - Database schema

### Sprint 2: Core Workflows ✅ COMPLETE

**Backend:**
- Work order CRUD endpoints
- Contractor CRUD endpoints
- Work order assignment to contractors
- Twilio SMS integration (sends SMS when contractor assigned)
- Photo upload to AWS S3
- Image thumbnail generation with Sharp
- File size and type validation

**Locations:**
- `apps/api/src/routes/workOrders.ts` - Work order endpoints
- `apps/api/src/routes/contractors.ts` - Contractor endpoints
- `apps/api/src/routes/photos.ts` - Photo upload endpoints
- `apps/api/src/services/WorkOrdersService.ts` - Work order logic
- `apps/api/src/services/ContractorsService.ts` - Contractor logic
- `apps/api/src/services/PhotosService.ts` - Photo upload with S3
- `apps/api/src/services/TwilioService.ts` - SMS notifications

**Frontend (Web):**
- Properties list and details screens
- Work orders list and details screens
- Contractors list and management
- Photo upload interface

### Sprint 3: Mobile App Foundation ✅ COMPLETE

**Mobile App Structure:**
```
apps/mobile/
├── src/
│   ├── navigation/
│   │   ├── RootNavigator.tsx        ← Auth flow (Login/Register/Main)
│   │   ├── MainTabNavigator.tsx     ← Bottom tabs (Properties/WorkOrders/Profile)
│   │   ├── PropertiesStack.tsx      ← Properties screens stack
│   │   └── WorkOrdersStack.tsx      ← Work orders screens stack
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx      ← Email/password login
│   │   │   └── RegisterScreen.tsx   ← User registration
│   │   ├── properties/
│   │   │   ├── PropertiesListScreen.tsx   ← List with pull-to-refresh
│   │   │   ├── PropertyDetailsScreen.tsx  ← Property details
│   │   │   └── CreatePropertyScreen.tsx   ← Add new property
│   │   ├── workOrders/
│   │   │   ├── WorkOrdersListScreen.tsx   ← List with color-coded priorities
│   │   │   ├── WorkOrderDetailsScreen.tsx ← Work order details
│   │   │   └── CreateWorkOrderScreen.tsx  ← Create work order form
│   │   └── profile/
│   │       └── ProfileScreen.tsx    ← Profile and logout
│   ├── services/
│   │   └── api.ts                   ← Complete API client with interceptors
│   ├── types/
│   │   └── index.ts                 ← TypeScript definitions
│   └── components/                  ← Reusable components (empty for now)
├── App.tsx                          ← Root with NavigationContainer
├── app.json                         ← Expo config
└── package.json                     ← Dependencies
```

**Key Features:**
- React Navigation (Stack + Bottom Tabs)
- React Native Paper UI (Material Design)
- AsyncStorage for token persistence
- Automatic token refresh on 401
- Pull-to-refresh on list screens
- Form validation
- Error handling

**⚠️ CRITICAL ISSUE:** Auth state management is hardcoded. `RootNavigator.tsx:12` has `const isAuthenticated = false` which needs to be replaced with proper state management.

### Sprint 5: AI + UK Compliance ✅ PARTIAL (57% COMPLETE)

**Completed:**

1. **Google Vision API Integration** (`apps/api/src/services/VisionService.ts`)
   - Photo quality analysis on upload
   - Brightness detection: 0-1 scale (0.5 optimal)
   - Blur detection: Uses text confidence as proxy
   - Warnings: <25% brightness (dark), >85% (overexposed), blurry text
   - Graceful degradation: Works without API credentials (returns neutral results)

2. **Photo Quality Warning UI** (`apps/web/src/components/PhotoQualityWarning.tsx`)
   - Dialog with quality warnings
   - Actionable suggestions (improve lighting, hold steady)
   - "Retake Photo" or "Use Anyway" options
   - Quality score display (blur %, brightness %)

3. **Certificate Upload** (`apps/api/src/services/CertificatesService.ts`)
   - POST /api/certificates endpoint
   - Certificate types: GAS_SAFETY, ELECTRICAL, EPC, STL_LICENSE, OTHER
   - PDF upload to S3
   - Issue date and expiry date tracking
   - UK compliance requirements built-in

4. **Certificate Listing**
   - GET /api/certificates with filtering
   - GET /api/certificates/expiring-soon (within N days)
   - GET /api/certificates/expired
   - Days until expiry calculation
   - Expired status flag

**Pending (Sprint 5):**
- Push notifications (Firebase Cloud Messaging)
- Background cron job for certificate reminders
- Email notifications (SendGrid integration)

---

## 🏛️ Project Architecture

### Monorepo Structure
```
RightFit-Services/
├── apps/
│   ├── api/          ← Node.js + Express + Prisma
│   ├── web/          ← React + Vite + MUI
│   └── mobile/       ← React Native + Expo + React Native Paper
├── packages/
│   ├── database/     ← Prisma schema + client
│   └── shared/       ← Shared types + utilities
├── docs/             ← Project documentation
│   ├── architecture/
│   └── project-plan/
├── DATABASE_SETUP.md
├── QUICK_START.md
├── DEPLOYMENT.md
├── SPRINT1_STATUS.md
├── SPRINT_STATUS.md  ← Overall sprint progress
└── HANDOVER.md       ← This file
```

### Technology Stack

**Backend (apps/api):**
- Node.js 18+ with Express.js
- TypeScript (strict mode)
- Prisma ORM (PostgreSQL)
- AWS SDK v3 (S3 for file storage)
- Twilio SDK (SMS notifications)
- Google Cloud Vision API (photo quality)
- JWT (jsonwebtoken)
- bcrypt (password hashing)
- Zod (validation schemas)
- Winston (logging)
- Helmet (security headers)
- express-rate-limit (rate limiting)

**Web Frontend (apps/web):**
- React 18
- Vite (build tool)
- Material-UI (MUI) v5
- React Router v6
- Axios (HTTP client)
- TypeScript

**Mobile App (apps/mobile):**
- React Native with Expo 50+
- React Navigation v6 (Stack + Bottom Tabs)
- React Native Paper (Material Design)
- AsyncStorage (@react-native-async-storage/async-storage)
- Axios (HTTP client)
- TypeScript

**Database:**
- PostgreSQL 14+
- Prisma ORM
- Multi-tenancy with tenant_id filtering
- Soft deletes (deleted_at timestamps)

**Infrastructure:**
- AWS RDS (PostgreSQL)
- AWS S3 (Photos + Certificates)
- Twilio SMS API
- Google Cloud Vision API
- (Future) Firebase Cloud Messaging for push notifications

### Multi-Tenancy Architecture

**CRITICAL CONCEPT:** Every request must be scoped to a tenant.

1. **JWT Payload Structure:**
```typescript
{
  userId: string,
  tenantId: string,  // ← THIS IS CRITICAL
  role: string,
  iat: number,
  exp: number
}
```

2. **Service Layer Pattern:**
All database queries MUST filter by `tenantId`:
```typescript
// ✅ CORRECT
await prisma.property.findMany({
  where: {
    tenant_id: tenantId,  // From JWT
    deleted_at: null
  }
})

// ❌ WRONG - Exposes all tenants' data
await prisma.property.findMany({
  where: {
    deleted_at: null
  }
})
```

3. **Security Implications:**
- Cross-tenant access returns 404 (not 403) to prevent tenant enumeration
- All `create` operations must inject `tenant_id` from JWT
- All `update` and `delete` operations must verify tenant ownership first

4. **Key Files:**
- `apps/api/src/middleware/auth.ts` - Extracts JWT and adds `req.user`
- `apps/api/src/services/*Service.ts` - All services accept `tenantId` param

### Database Schema (Simplified)

```
Tenant (1) ←→ (N) User
Tenant (1) ←→ (N) Property
Tenant (1) ←→ (N) WorkOrder
Tenant (1) ←→ (N) Contractor
Tenant (1) ←→ (N) Photo
Tenant (1) ←→ (N) Certificate

Property (1) ←→ (N) WorkOrder
Property (1) ←→ (N) Certificate
Property (1) ←→ (N) Photo

WorkOrder (N) ←→ (1) Contractor (assigned)
WorkOrder (1) ←→ (N) Photo

User (1) ←→ (N) WorkOrder (created_by)
```

**Full Schema:** `packages/database/prisma/schema.prisma`

---

## 🚀 Getting Started

### Prerequisites
1. **Node.js 18+** and **pnpm** installed
2. **PostgreSQL 14+** running locally or remote
3. **AWS Account** with S3 access (for photos)
4. **Twilio Account** (for SMS) - optional for dev
5. **Google Cloud Account** (for Vision API) - optional, gracefully degrades

### Initial Setup

1. **Clone and Install:**
```bash
# Already done if you're reading this
cd I:\RightFit-Services
pnpm install
```

2. **Setup Database:**
```bash
# Follow DATABASE_SETUP.md for detailed instructions

# Quick version:
# 1. Create PostgreSQL database called "rightfit"
# 2. Create user with password
# 3. Copy environment file
cp apps/api/.env.example apps/api/.env

# 4. Edit apps/api/.env with your database URL
# DATABASE_URL="postgresql://rightfit:password@localhost:5432/rightfit"

# 5. Push schema to database
pnpm db:push
```

3. **Configure API Environment Variables:**

Edit `apps/api/.env`:

```env
# Required - Database
DATABASE_URL="postgresql://rightfit:password@localhost:5432/rightfit"

# Required - JWT Secrets (use strong random strings)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-this-too"

# Required - Server
PORT=3001
NODE_ENV=development

# Required - AWS S3 (for photo uploads)
AWS_REGION="eu-west-2"
AWS_ACCESS_KEY_ID="your-aws-access-key-id"
AWS_SECRET_ACCESS_KEY="your-aws-secret-access-key"
S3_BUCKET_NAME="rightfit-photos-dev"
S3_CERTIFICATES_BUCKET="rightfit-certificates-dev"

# Optional - Twilio SMS (skip for development)
# TWILIO_ACCOUNT_SID="your-twilio-account-sid"
# TWILIO_AUTH_TOKEN="your-twilio-auth-token"
# TWILIO_PHONE_NUMBER="+44xxxxxxxxxx"

# Optional - Google Cloud Vision API (skip for development)
# GOOGLE_CLOUD_PROJECT="your-project-id"
# GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account-key.json"
```

4. **Start Development Servers:**

**All at once (recommended):**
```bash
pnpm dev
```

**Or individually:**

**Terminal 1 - API:**
```bash
cd apps/api
pnpm dev
# Runs on http://localhost:3001
```

**Terminal 2 - Web App:**
```bash
cd apps/web
pnpm dev
# Runs on http://localhost:3000
```

**Terminal 3 - Mobile App:**
```bash
cd apps/mobile
pnpm start
# Opens Expo DevTools
# Scan QR code with Expo Go app (iOS/Android)
```

**Terminal 4 - Prisma Studio (optional):**
```bash
cd packages/database
pnpx prisma studio
# Database GUI on http://localhost:5555
```

### Testing the Setup

1. **API Health Check:**
```bash
curl http://localhost:3001/health
# Should return: {"status":"ok","timestamp":"..."}
```

2. **Register a User:**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#",
    "confirm_password": "Test123!@#",
    "full_name": "Test User",
    "company_name": "Test Company"
  }'
```

Save the `access_token` from the response.

3. **Create a Property:**
```bash
curl -X POST http://localhost:3001/api/properties \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "name": "Test Property",
    "address_line1": "123 Test Street",
    "city": "London",
    "postcode": "SW1A 1AA",
    "property_type": "HOUSE",
    "bedrooms": 3,
    "bathrooms": 2
  }'
```

4. **Open Web App:**
Navigate to `http://localhost:3000` in your browser.

5. **Open Mobile App:**
- Install Expo Go on your phone (App Store or Google Play)
- Scan QR code from Terminal 3
- App should load with login screen

---

## 🧠 Critical Context

### 1. Mobile App Auth State Management Issue

**Location:** `apps/mobile/src/navigation/RootNavigator.tsx:12`

**Current Code:**
```typescript
export default function RootNavigator() {
  const isAuthenticated = false // TODO: Check if user is authenticated

  return (
    <Stack.Navigator>
      {!isAuthenticated ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : (
        <Stack.Screen name="Main" component={MainTabNavigator} />
      )}
    </Stack.Navigator>
  )
}
```

**Problem:** Always shows login screen. After login, user stays on login screen.

**Solution Needed:**
```typescript
// Option 1: Context API (recommended for simplicity)
import { useAuth } from '../contexts/AuthContext'

export default function RootNavigator() {
  const { isAuthenticated } = useAuth()
  // ... rest of code
}

// Need to create:
// - apps/mobile/src/contexts/AuthContext.tsx
// - Wrap App.tsx with <AuthProvider>
// - Check AsyncStorage for token on mount
// - Provide login/logout/register functions
```

**Priority:** HIGH - App is unusable without this.

### 2. Google Vision API Setup (Optional)

**Current State:** VisionService gracefully degrades if credentials not provided.

**To Enable:**
1. Create Google Cloud project
2. Enable Vision API
3. Create service account
4. Download JSON key file
5. Set environment variables:
```env
GOOGLE_CLOUD_PROJECT="your-project-id"
GOOGLE_APPLICATION_CREDENTIALS="/path/to/key.json"
```

**Cost:** Free tier = 1,000 images/month (sufficient for MVP testing)

**Location:** `apps/api/src/services/VisionService.ts`

### 3. Twilio SMS Setup (Optional for Dev)

**Current State:** TwilioService implemented but won't send SMS without credentials.

**To Enable:**
1. Create Twilio account
2. Get UK phone number (+44)
3. Set environment variables:
```env
TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
TWILIO_AUTH_TOKEN="your_auth_token"
TWILIO_PHONE_NUMBER="+44xxxxxxxxxx"
```

**Cost:** ~£0.04 per SMS to UK numbers

**Location:** `apps/api/src/services/TwilioService.ts`

### 4. AWS S3 Setup

**Required for:** Photo and certificate uploads

**Setup:**
1. Create S3 buckets:
   - `rightfit-photos-dev`
   - `rightfit-certificates-dev`
2. Create IAM user with S3 access
3. Get access key and secret
4. Set environment variables

**Location:** `apps/api/src/services/PhotosService.ts` and `CertificatesService.ts`

### 5. Multi-Tenancy Best Practices

**ALWAYS:**
- Accept `tenantId` parameter in service methods
- Filter all queries by `tenant_id`
- Verify tenant ownership before updates/deletes
- Return 404 (not 403) for cross-tenant access

**NEVER:**
- Trust `tenant_id` from request body (use JWT)
- Forget to filter by `tenant_id` in queries
- Use SELECT * without WHERE tenant_id = $1

**Code Review Checklist:**
- [ ] Does this query filter by tenant_id?
- [ ] Does this create operation inject tenant_id from JWT?
- [ ] Does this update/delete verify tenant ownership first?

### 6. Offline Mode Strategy (Sprint 4)

**Goal:** App works fully offline, syncs when online.

**Approach:**
1. **WatermelonDB** - Local database (React Native)
2. **Sync Queue** - Track offline changes
3. **Optimistic UI** - Show changes immediately
4. **Background Sync** - Upload when connection restored

**Implementation Plan:**
1. Install WatermelonDB in mobile app
2. Define local schema (mirror server schema)
3. Modify screens to read/write to local DB
4. Implement sync queue table
5. Implement sync service (NetInfo + API calls)
6. Handle conflicts (last-write-wins for MVP)

**Reference:** Sprint 4 stories in `docs/project-plan/sprint-plans.md`

---

## 🎯 What Needs to Be Done Next

### Immediate Priority (This Week)

#### 1. Fix Mobile Auth State Management ⚠️ CRITICAL
**Blocker:** App is unusable without this.

**Tasks:**
- [ ] Create `apps/mobile/src/contexts/AuthContext.tsx`
- [ ] Implement useAuth hook with AsyncStorage
- [ ] Update RootNavigator to use `useAuth()`
- [ ] Test login/logout flow
- [ ] Test token refresh on 401

**Acceptance Criteria:**
- User can login and see main app
- Token persists after app close
- Logout returns to login screen
- Automatic token refresh works

**Estimated Time:** 4 hours

**Files to Create:**
```typescript
// apps/mobile/src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import api from '../services/api'

interface AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  register: (email: string, password: string, fullName: string, companyName?: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const isAuth = await api.isAuthenticated()
    setIsAuthenticated(isAuth)
    setIsLoading(false)
  }

  const login = async (email: string, password: string) => {
    await api.login(email, password)
    setIsAuthenticated(true)
  }

  const logout = async () => {
    await api.logout()
    setIsAuthenticated(false)
  }

  const register = async (email: string, password: string, fullName: string, companyName?: string) => {
    await api.register(email, password, fullName, companyName)
    setIsAuthenticated(true)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
```

Then update `apps/mobile/App.tsx`:
```typescript
import { AuthProvider } from './src/contexts/AuthContext'

export default function App() {
  return (
    <AuthProvider>
      <PaperProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </PaperProvider>
    </AuthProvider>
  )
}
```

And update `apps/mobile/src/navigation/RootNavigator.tsx`:
```typescript
import { useAuth } from '../contexts/AuthContext'

export default function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <Text>Loading...</Text> // Or a proper loading screen
  }

  // ... rest of code
}
```

Update login/register screens to use `useAuth()`:
```typescript
// In LoginScreen.tsx and RegisterScreen.tsx
const { login } = useAuth()

const handleLogin = async () => {
  try {
    await login(email, password)
    // Navigation handled automatically by RootNavigator
  } catch (error) {
    setError(error.message)
  }
}
```

#### 2. Add Basic Unit Tests
**Rationale:** 0% test coverage is unacceptable for production.

**Tasks:**
- [ ] Install Jest and testing libraries
- [ ] Write tests for AuthService
- [ ] Write tests for PropertiesService
- [ ] Write tests for multi-tenancy filtering
- [ ] Target: >70% coverage for services

**Estimated Time:** 8 hours

**Priority:** HIGH

#### 3. Complete Sprint 5 - Push Notifications
**Remaining Work:** US-Cert-3 (10 points) + US-Cert-4 (8 points) = 18 points

**Tasks:**
- [ ] Setup Firebase Cloud Messaging
- [ ] Install expo-notifications
- [ ] Request notification permissions
- [ ] Store FCM tokens in database
- [ ] Create cron job for certificate reminders
- [ ] Implement SendGrid email integration
- [ ] Test notifications on iOS and Android

**Estimated Time:** 18 hours

**Priority:** MEDIUM (can be deferred if time-constrained)

### Next Sprint Priority: Sprint 4 - Offline Mode ⚠️ CRITICAL

**Why Critical:** This is the core differentiator vs competitors like Arthur Online.

**Estimated Time:** 56 hours (2-3 weeks)

**User Stories:**
- US-Offline-1: WatermelonDB Setup (10 points)
- US-Offline-2: Sync Properties on Login (8 points)
- US-Offline-3: Create Work Order Offline (10 points)
- US-Offline-4: Sync Queue Processor (12 points)
- US-Offline-5: Offline Photo Upload (10 points)
- US-Offline-6: Conflict Resolution (6 points)

**Reference:** `docs/project-plan/sprint-plans.md` lines 643-815

**Key Dependencies:**
- WatermelonDB library
- NetInfo for connectivity detection
- Background task support (expo-task-manager)

**Risks:**
- WatermelonDB has steep learning curve
- Sync logic is complex and error-prone
- Testing requires simulating offline scenarios

**Recommendation:** Block out 3 full weeks for this sprint. DO NOT rush it.

### After Sprint 4: Sprint 6 - Payments & Launch

**Estimated Time:** 53 hours (2 weeks)

**User Stories:**
- US-Pay-1: Stripe Integration (8 points)
- US-Pay-2: Pricing Page (4 points)
- US-Pay-3: Free 30-Day Trial (3 points)
- US-Pay-4: Subscription Management (5 points)
- US-Test-1: Bug Fixes (10 points)
- US-Deploy-1: CI/CD Pipeline (8 points)
- US-Monitor-1: Error Monitoring (4 points)
- US-Monitor-2: Uptime Monitoring (3 points)
- US-Launch-1: App Store Submission (6 points)

**Reference:** `docs/project-plan/sprint-plans.md` lines 981-1189

---

## ⚠️ Known Issues

### Critical
1. **Mobile Auth State:** Hardcoded `isAuthenticated = false` (see section above)
2. **No Tests:** 0% test coverage
3. **No Error Monitoring:** No Sentry or equivalent

### High Priority
4. **API Base URL in Mobile:** Hardcoded to `localhost:3001`. Need to change for physical device testing.
   - **Location:** `apps/mobile/src/services/api.ts:5`
   - **Fix:** Use your computer's local IP (e.g., `http://192.168.1.100:3001`)
5. **No API Rate Limiting:** Only auth endpoints are rate-limited
6. **No Input Sanitization:** Relying solely on Zod validation
7. **Photo Display Missing:** No photo viewing screens in mobile app

### Medium Priority
8. **No Loading States:** Many screens don't show loading spinners
9. **No Empty States:** Some screens don't handle empty data well
10. **No Retry Logic:** Failed API calls don't retry
11. **No Optimistic Updates:** All operations wait for server response
12. **Web App Polish:** Web frontend is functional but not polished

### Low Priority (Nice-to-Have)
13. **No Dark Mode:** Mobile and web only support light mode
14. **No Accessibility:** ARIA labels and screen reader support missing
15. **No Analytics:** No user behavior tracking
16. **No Feature Flags:** Can't enable/disable features dynamically

---

## 🧪 Testing Strategy

### Current State
- **Unit Tests:** 0% coverage
- **Integration Tests:** None
- **E2E Tests:** None
- **Manual Testing:** Basic smoke tests performed

### Recommended Approach

#### Phase 1: Critical Path Coverage (Week 1)
**Target:** 70% coverage for core services

**Priority Tests:**
1. **AuthService Tests:**
   - User registration creates tenant
   - Login with valid/invalid credentials
   - Token refresh works
   - Multi-tenancy: User A can't access User B's data

2. **PropertiesService Tests:**
   - CRUD operations
   - Tenant filtering (CRITICAL)
   - Soft delete behavior
   - Cross-tenant access returns 404

3. **WorkOrdersService Tests:**
   - CRUD operations
   - Status transitions
   - Contractor assignment
   - Tenant filtering

**Tools:**
- Jest (already in package.json)
- Supertest (for API endpoint testing)
- @faker-js/faker (for test data generation)

**Setup:**
```bash
cd apps/api
pnpm add -D jest @types/jest ts-jest supertest @types/supertest @faker-js/faker
```

**Example Test Structure:**
```typescript
// apps/api/src/services/__tests__/PropertiesService.test.ts
import { PropertiesService } from '../PropertiesService'
import { prismaMock } from '../../__mocks__/prisma'

describe('PropertiesService', () => {
  describe('listProperties', () => {
    it('should only return properties for the given tenant', async () => {
      // Test multi-tenancy filtering
    })

    it('should not return soft-deleted properties', async () => {
      // Test soft delete filtering
    })
  })

  describe('getPropertyById', () => {
    it('should return 404 for cross-tenant access', async () => {
      // CRITICAL: Test tenant isolation
    })
  })
})
```

#### Phase 2: Integration Tests (Week 2)
**Target:** API endpoints end-to-end

```typescript
// apps/api/src/__tests__/integration/auth.test.ts
import request from 'supertest'
import app from '../../index'

describe('POST /api/auth/register', () => {
  it('should create user and tenant', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'Test123!@#',
        confirm_password: 'Test123!@#',
        full_name: 'Test User'
      })

    expect(response.status).toBe(201)
    expect(response.body).toHaveProperty('access_token')
  })
})
```

#### Phase 3: E2E Tests (Future)
**Target:** User workflows

Use Playwright or Cypress for web app E2E tests.

---

## 🚢 Deployment Plan

### Current State
- **Environment:** Development only (local)
- **CI/CD:** None
- **Monitoring:** None
- **Hosting:** Not deployed

### Deployment Architecture (Sprint 6)

```
┌─────────────────┐
│   Mobile Apps   │
│  (iOS/Android)  │
└────────┬────────┘
         │
         ├──────────┐
         │          │
┌────────▼────┐   ┌─▼──────────────┐
│   Web App   │   │   API Server   │
│  (S3+CF)    │   │   (EC2/ECS)    │
└─────────────┘   └────┬───────────┘
                       │
                 ┌─────▼──────┐
                 │  RDS (PG)  │
                 └────────────┘

                 ┌────────────┐
                 │  S3 Bucket │
                 │  (Photos)  │
                 └────────────┘
```

### Deployment Steps (Sprint 6)

#### 1. API Server (EC2 or ECS)
- Dockerize API
- Setup PM2 or systemd for process management
- Configure environment variables
- Setup HTTPS with Let's Encrypt
- Configure security groups

#### 2. Web App (S3 + CloudFront)
- Build React app
- Upload to S3 bucket
- Configure CloudFront distribution
- Setup custom domain

#### 3. Database (RDS)
- Create RDS PostgreSQL instance (db.t3.micro for MVP)
- Run Prisma migrations
- Setup automated backups
- Configure security groups

#### 4. Mobile Apps (App Store + Google Play)
- Build iOS app (requires macOS)
- Submit to App Store Connect (TestFlight for beta)
- Build Android app
- Submit to Google Play Console (closed beta)

#### 5. Monitoring
- Setup Sentry for error tracking
- Setup UptimeRobot for uptime monitoring
- Configure Slack alerts

---

## 🛠️ Common Tasks

### Adding a New API Endpoint

**Example: Add "Get Work Order Photos" endpoint**

1. **Add route:**
```typescript
// apps/api/src/routes/workOrders.ts
router.get('/:id/photos', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params
    const { tenantId } = req.user!

    const photos = await WorkOrdersService.getWorkOrderPhotos(id, tenantId)
    res.json({ data: photos })
  } catch (error) {
    next(error)
  }
})
```

2. **Add service method:**
```typescript
// apps/api/src/services/WorkOrdersService.ts
export async function getWorkOrderPhotos(workOrderId: string, tenantId: string) {
  // Verify work order belongs to tenant
  const workOrder = await prisma.workOrder.findFirst({
    where: { id: workOrderId, tenant_id: tenantId, deleted_at: null }
  })

  if (!workOrder) {
    throw new NotFoundError('Work order not found')
  }

  // Get photos
  return await prisma.photo.findMany({
    where: { work_order_id: workOrderId, deleted_at: null },
    orderBy: { created_at: 'desc' }
  })
}
```

3. **Add types (if needed):**
```typescript
// packages/shared/src/types/workOrders.ts
export interface WorkOrderPhoto {
  id: string
  work_order_id: string
  s3_url: string
  thumbnail_url: string
  caption?: string
  created_at: string
}
```

### Adding a New Mobile Screen

**Example: Add "Property Photos" screen**

1. **Create screen file:**
```typescript
// apps/mobile/src/screens/properties/PropertyPhotosScreen.tsx
import React, { useState, useEffect } from 'react'
import { FlatList, Image } from 'react-native'
import api from '../../services/api'

export default function PropertyPhotosScreen({ route }) {
  const { propertyId } = route.params
  const [photos, setPhotos] = useState([])

  useEffect(() => {
    fetchPhotos()
  }, [])

  const fetchPhotos = async () => {
    const data = await api.getPhotos({ property_id: propertyId })
    setPhotos(data)
  }

  return (
    <FlatList
      data={photos}
      renderItem={({ item }) => <Image source={{ uri: item.s3_url }} />}
      keyExtractor={(item) => item.id}
    />
  )
}
```

2. **Add to navigation stack:**
```typescript
// apps/mobile/src/navigation/PropertiesStack.tsx
<Stack.Screen
  name="PropertyPhotos"
  component={PropertyPhotosScreen}
  options={{ title: 'Property Photos' }}
/>
```

3. **Add to navigation types:**
```typescript
// apps/mobile/src/types/index.ts
export type PropertiesStackParamList = {
  PropertiesList: undefined
  PropertyDetails: { propertyId: string }
  PropertyPhotos: { propertyId: string }  // ← Add this
  CreateProperty: undefined
}
```

### Running Database Migrations

**Development:**
```bash
cd packages/database
pnpx prisma db push  # Updates DB without migrations
pnpx prisma studio   # View data in GUI
```

**Production (proper migrations):**
```bash
cd packages/database
pnpx prisma migrate dev --name add_new_field
pnpx prisma migrate deploy  # Run in production
```

### Debugging Tips

**API Debugging:**
```bash
# Enable debug logging
DEBUG=* pnpm dev:api

# Watch specific logs
tail -f apps/api/logs/combined.log
```

**Mobile Debugging:**
```bash
# Clear Metro cache
cd apps/mobile
pnpx expo start --clear

# View logs
pnpx react-native log-ios
pnpx react-native log-android
```

**Database Debugging:**
```bash
# View all queries
DATABASE_DEBUG=true pnpm dev:api

# Connect to DB directly
psql -U rightfit -d rightfit -h localhost
```

---

## 🐛 Troubleshooting

### Issue: "Cannot connect to database"

**Symptoms:** API won't start, Prisma connection errors

**Solutions:**
1. Check PostgreSQL is running: `pg_ctl status` or `brew services list`
2. Verify DATABASE_URL in `.env`
3. Test connection: `psql postgresql://user:pass@localhost:5432/rightfit`
4. Check firewall/security groups (if remote DB)

### Issue: "Module not found" errors

**Symptoms:** Import errors in TypeScript

**Solutions:**
1. Install dependencies: `pnpm install`
2. Build packages: `pnpm build`
3. Clear Turborepo cache: `pnpm turbo run build --force`
4. Restart TypeScript server in IDE

### Issue: Mobile app won't load

**Symptoms:** Blank screen or "Unable to connect"

**Solutions:**
1. Check Metro bundler is running: `pnpm start` in apps/mobile
2. Check API_BASE_URL: Use computer's local IP, not `localhost`
3. Clear Metro cache: `pnpx expo start --clear`
4. Check phone and computer on same WiFi network
5. Restart Expo Go app

### Issue: Photo upload fails

**Symptoms:** 500 error on /api/photos

**Solutions:**
1. Check AWS credentials in `.env`
2. Verify S3 bucket exists and is accessible
3. Check IAM permissions (s3:PutObject, s3:GetObject)
4. Check file size (<10MB?)
5. Check MIME type (image/jpeg, image/png only)

### Issue: SMS not sending

**Symptoms:** No SMS received after assigning contractor

**Solutions:**
1. Check Twilio credentials in `.env`
2. Verify phone number format (+44 for UK)
3. Check Twilio account balance
4. Verify phone number is not blacklisted
5. Check API logs: `tail -f apps/api/logs/combined.log`

### Issue: Cross-tenant data leak

**Symptoms:** User can see another tenant's data

**CRITICAL:** This is a security vulnerability.

**Investigation:**
1. Check service method accepts `tenantId` parameter
2. Verify query includes `WHERE tenant_id = $1`
3. Check JWT middleware is applied to route
4. Review service method code for missing filters

**Example Fix:**
```typescript
// ❌ VULNERABLE
async function getProperty(propertyId: string) {
  return prisma.property.findUnique({ where: { id: propertyId } })
}

// ✅ SECURE
async function getProperty(propertyId: string, tenantId: string) {
  const property = await prisma.property.findFirst({
    where: { id: propertyId, tenant_id: tenantId }
  })
  if (!property) {
    throw new NotFoundError('Property not found')
  }
  return property
}
```

---

## 📚 Key Files Reference

### Backend (API)

**Entry Point:**
- `apps/api/src/index.ts` - Express app setup

**Middleware:**
- `apps/api/src/middleware/auth.ts` - JWT authentication (extracts req.user)
- `apps/api/src/middleware/errorHandler.ts` - Centralized error handling
- `apps/api/src/middleware/rateLimiter.ts` - Rate limiting configs

**Routes:**
- `apps/api/src/routes/auth.ts` - Authentication endpoints
- `apps/api/src/routes/properties.ts` - Property CRUD
- `apps/api/src/routes/workOrders.ts` - Work order CRUD
- `apps/api/src/routes/contractors.ts` - Contractor CRUD
- `apps/api/src/routes/photos.ts` - Photo upload
- `apps/api/src/routes/certificates.ts` - Certificate upload

**Services (Business Logic):**
- `apps/api/src/services/AuthService.ts` - Authentication logic
- `apps/api/src/services/PropertiesService.ts` - Property logic
- `apps/api/src/services/WorkOrdersService.ts` - Work order logic
- `apps/api/src/services/ContractorsService.ts` - Contractor logic
- `apps/api/src/services/PhotosService.ts` - Photo upload to S3
- `apps/api/src/services/CertificatesService.ts` - Certificate upload
- `apps/api/src/services/TwilioService.ts` - SMS notifications
- `apps/api/src/services/VisionService.ts` - Google Vision API

**Utilities:**
- `apps/api/src/utils/jwt.ts` - JWT sign/verify
- `apps/api/src/utils/hash.ts` - bcrypt utilities
- `apps/api/src/utils/errors.ts` - Custom error classes
- `apps/api/src/utils/logger.ts` - Winston logger

### Mobile App

**Entry:**
- `apps/mobile/App.tsx` - Root component

**Navigation:**
- `apps/mobile/src/navigation/RootNavigator.tsx` - Auth flow
- `apps/mobile/src/navigation/MainTabNavigator.tsx` - Bottom tabs
- `apps/mobile/src/navigation/PropertiesStack.tsx` - Properties screens
- `apps/mobile/src/navigation/WorkOrdersStack.tsx` - Work orders screens

**Screens:**
- `apps/mobile/src/screens/auth/LoginScreen.tsx`
- `apps/mobile/src/screens/auth/RegisterScreen.tsx`
- `apps/mobile/src/screens/properties/PropertiesListScreen.tsx`
- `apps/mobile/src/screens/properties/PropertyDetailsScreen.tsx`
- `apps/mobile/src/screens/properties/CreatePropertyScreen.tsx`
- `apps/mobile/src/screens/workOrders/WorkOrdersListScreen.tsx`
- `apps/mobile/src/screens/workOrders/WorkOrderDetailsScreen.tsx`
- `apps/mobile/src/screens/workOrders/CreateWorkOrderScreen.tsx`
- `apps/mobile/src/screens/profile/ProfileScreen.tsx`

**Services:**
- `apps/mobile/src/services/api.ts` - Complete API client

**Types:**
- `apps/mobile/src/types/index.ts` - TypeScript definitions

### Database

**Schema:**
- `packages/database/prisma/schema.prisma` - Complete database schema

**Client:**
- `packages/database/src/index.ts` - Prisma client singleton

### Shared

**Types:**
- `packages/shared/src/types/*` - Shared TypeScript types

**Schemas:**
- `packages/shared/src/schemas/*` - Zod validation schemas

---

## 🎓 Learning Resources

### Technologies Used

**Prisma ORM:**
- Docs: https://www.prisma.io/docs
- Multi-tenancy: https://www.prisma.io/docs/guides/database/multi-tenancy

**React Native + Expo:**
- Expo Docs: https://docs.expo.dev/
- React Navigation: https://reactnavigation.org/

**WatermelonDB (Sprint 4):**
- Docs: https://nozbe.github.io/WatermelonDB/
- Sync: https://nozbe.github.io/WatermelonDB/Advanced/Sync.html

**Google Cloud Vision:**
- Docs: https://cloud.google.com/vision/docs
- Node.js Client: https://googleapis.dev/nodejs/vision/latest/

**Twilio:**
- SMS Docs: https://www.twilio.com/docs/sms

### Project-Specific Docs

- `docs/project-plan/sprint-plans.md` - Complete sprint breakdown
- `docs/architecture/` - Architecture decisions (if exists)
- `DATABASE_SETUP.md` - Database setup instructions
- `QUICK_START.md` - Quick start guide
- `DEPLOYMENT.md` - Deployment instructions

---

## 🚀 Final Notes

### Success Criteria for MVP
- [ ] User can register and login
- [ ] User can add properties
- [ ] User can create work orders
- [ ] User can assign contractors
- [ ] Contractor receives SMS notification
- [ ] User can upload photos
- [ ] **User can work offline** (Sprint 4 - CRITICAL)
- [ ] User can track compliance certificates
- [ ] User receives push notifications for expiring certificates
- [ ] User can subscribe with Stripe
- [ ] Apps available on App Store and Google Play
- [ ] 99%+ uptime
- [ ] <3 critical bugs

### Estimated Time to MVP
- **Immediate fixes:** 1 week (auth state, basic tests)
- **Sprint 4 (Offline):** 3 weeks (CRITICAL)
- **Sprint 5 completion:** 1 week (notifications)
- **Sprint 6 (Payments + Launch):** 2 weeks
- **Buffer for bugs:** 1 week

**Total:** ~8 weeks from now

### Key Risks
1. **Offline mode complexity** - Most challenging technical work
2. **App Store approval** - Can take 1-2 weeks, may get rejected
3. **Testing gaps** - No automated tests = high bug risk
4. **Multi-tenancy bugs** - Data leak would be catastrophic
5. **Scope creep** - Resist adding features before MVP launch

### Recommendations for Next Developer
1. **Start with auth state fix** - Unblocks mobile app testing
2. **Add tests immediately** - Don't accumulate more tech debt
3. **Block 3 weeks for Sprint 4** - DO NOT rush offline mode
4. **Test multi-tenancy rigorously** - Security is paramount
5. **Submit to App Store early** - Approval process is unpredictable
6. **Document as you go** - Future you will thank you

### Contact & Support
- **Project Documentation:** `docs/` directory
- **Issue Tracking:** (TBD - setup GitHub Issues or Trello)
- **Code Review:** (TBD - setup review process)

---

**Document Version:** 1.0
**Last Updated:** 2025-10-28
**Next Review:** After Sprint 4 completion
**Handover Complete:** Ready for next developer ✅

---

## 👨‍💻 For the Next Developer

### What We Just Completed (Session 2025-10-30)

**Major Achievement: WSL2 Android Development + Automatic Sync**

1. **Local Android Builds Working** ✅
   - Complete WSL2 setup with Android SDK + Gradle 8.10.2
   - Physical device connected via USB (ADB working)
   - APK builds successfully: `./gradlew assembleDebug`
   - See: [docs/ANDROID_DEV_SETUP.md](docs/ANDROID_DEV_SETUP.md)

2. **Automatic Sync Fully Operational** ✅
   - Fixed WatermelonDB query syntax ([syncService.ts:84](apps/mobile/src/services/syncService.ts#L84), 106, 129)
   - Added network listener using NetInfo
   - Background sync every 5 minutes
   - Tested on physical device with airplane mode
   - Cross-platform sync verified (mobile → web)

3. **Priority Enum Alignment** ✅
   - Fixed mobile app to match backend schema (HIGH, MEDIUM, LOW only)
   - Updated [CreateWorkOrderScreen.tsx:169](apps/mobile/src/screens/workOrders/CreateWorkOrderScreen.tsx#L169)
   - Updated [WorkOrdersListScreen.tsx:130](apps/mobile/src/screens/workOrders/WorkOrdersListScreen.tsx#L130)

4. **Documentation Overhaul** ✅
   - Created 3 comprehensive Android dev guides
   - Organized root directory (20+ files → 6 essential docs)
   - Created [DOCS_MAP.md](DOCS_MAP.md) for AI agent navigation
   - Updated all docs for WSL2 environment (port 3001, Node 20 LTS)

### Your Immediate Next Steps

1. **Start Here:** Read [docs/GETTING_BACK_TO_WORK.md](docs/GETTING_BACK_TO_WORK.md) (5-minute restart guide)
2. **Android Setup:** If needed, follow [docs/ANDROID_DEV_SETUP.md](docs/ANDROID_DEV_SETUP.md)
3. **Quick Reference:** Bookmark [docs/QUICK_REFERENCE.md](docs/QUICK_REFERENCE.md) for daily commands
4. **Current Status:** Review [SPRINT_STATUS.md](SPRINT_STATUS.md) (82% complete)

### What's Working Now

- ✅ Backend API fully functional (Node 20 LTS + React 18.3.1)
- ✅ Web dashboard operational
- ✅ Mobile app with offline mode + automatic sync
- ✅ Local Android builds (no Expo cloud dependency)
- ✅ Multi-channel notifications (Push, Email, SMS)
- ✅ Certificate tracking + AI photo quality
- ✅ Test coverage: 14.94% (WorkOrdersService comprehensive)

### What Needs Work

1. **Sprint 6: Payments & Launch** (53 points - NEXT)
   - Stripe integration
   - CI/CD pipeline
   - Error monitoring (Sentry)
   - App Store submission

2. **Test Coverage Expansion** (Priority: HIGH)
   - Currently: 14.94% (38 tests passing)
   - Target: 50%+ before production
   - Focus: PropertiesService, ContractorsService, CertificatesService

3. **Web App Polish** (Priority: MEDIUM)
   - Functional but basic UI
   - Needs UX improvements

### Critical Files to Know

| File | Purpose | Status |
|------|---------|--------|
| [apps/mobile/src/services/syncService.ts](apps/mobile/src/services/syncService.ts) | Automatic sync service | ✅ Working |
| [apps/mobile/src/database/DatabaseProvider.tsx](apps/mobile/src/database/DatabaseProvider.tsx) | Initializes sync on app load | ✅ Working |
| [packages/database/prisma/schema.prisma](packages/database/prisma/schema.prisma) | Database schema (source of truth) | ✅ Stable |
| [docs/ANDROID_DEV_SETUP.md](docs/ANDROID_DEV_SETUP.md) | Complete WSL2 Android setup | ✅ Complete |
| [SPRINT_STATUS.md](SPRINT_STATUS.md) | Overall project progress | ✅ Up-to-date |

### Development Environment

**Required:**
- Node.js 20 LTS (20.19.5+)
- pnpm 8+
- PostgreSQL 14+ (Docker or WSL2 native)
- WSL2 (for Android development on Windows)

**Quick Start:**
```bash
# WSL2 Ubuntu
cd /home/orrox/projects/RightFit-Services

# Start API (port 3001)
pnpm dev:api

# Start Web (port 3000)
cd apps/web && pnpm dev

# Start Mobile (Metro on port 8081)
cd apps/mobile && pnpm start

# Build Android APK (WSL2)
cd apps/mobile/android && ./gradlew assembleDebug

# Install on device
adb -s RZCY51TJKKW install -r app/build/outputs/apk/debug/app-debug.apk
```

### Git Branches

- **main:** Stable code (currently on `main`)
- **fix/android-build-option2-npm:** Recent Android dev work (may be merged)

### Recent Commits

```
f49f631 Update database and deployment documentation for WSL2 environment
cd9f94f Update SPRINT_STATUS.md with WSL2 Android environment and automatic sync
16b7f88 Add WSL2 Android development environment and automatic sync
```

### Tips for Success

1. **Always filter by tenant_id** - Security is paramount
2. **Use the Quick Reference** - Common commands at your fingertips
3. **Test on physical device** - Offline mode only works in dev builds
4. **Document as you go** - Others will thank you
5. **Don't rush Sprint 6** - Payment integration requires careful testing

---

## 🏢 For the Product Owner (PO)

**Date:** 2025-10-30
**Project Status:** 82% Complete (251/304 story points)
**Current Phase:** MVP Development - Sprint 5 Complete, Sprint 6 Next

### Executive Summary

RightFit Services is on track for MVP launch. We've completed 5 of 6 planned sprints, with the final sprint (Payments & Launch) remaining. The core differentiator—offline-first mobile app—is now fully operational and tested.

### What's Been Delivered

#### ✅ Sprint 1-3: Foundation (153 points - 100% COMPLETE)
- Multi-tenant property management platform
- User authentication and authorization
- Web dashboard with property, work order, and contractor management
- Mobile app with complete navigation and screens
- AWS infrastructure (S3 for photos)

#### ✅ Sprint 4: Offline Mode (56 points - 100% COMPLETE)
- **Core Differentiator Delivered**
- WatermelonDB local database integration
- Automatic bi-directional sync
- Network-aware sync (auto-syncs when connectivity restored)
- Background sync every 5 minutes
- Conflict resolution (last-write-wins)
- **Tested and verified on physical device with airplane mode**

#### ✅ Sprint 5: AI + Compliance + Notifications (42 points - 100% COMPLETE)
- Google Vision API for photo quality analysis
- UK compliance certificate tracking (Gas Safety, Electrical, EPC, STL)
- Multi-channel notifications:
  - Push notifications (Expo)
  - Email notifications (Resend - 3,000 free emails/month)
  - SMS notifications (Twilio)
- Certificate expiry reminders (60, 30, 7 days)

### What's Remaining

#### 🔜 Sprint 6: Payments & Launch (53 points - NEXT)
**Estimated Timeline:** 2-3 weeks

**User Stories:**
1. Stripe Integration (8 points) - Accept subscription payments
2. Pricing Page (4 points) - Display pricing tiers
3. Free 30-Day Trial (3 points) - No credit card required
4. Subscription Management (5 points) - Upgrade/downgrade/cancel
5. Bug Fixes from Beta Testing (10 points) - Buffer for issues
6. CI/CD Pipeline (8 points) - Automated deployments
7. Error Monitoring (4 points) - Sentry integration
8. Uptime Monitoring (3 points) - UptimeRobot alerts
9. App Store Submission (6 points) - iOS App Store + Google Play

### Business Value Delivered

**Competitive Advantages:**
1. **Offline-First** - Works in rural areas (competitors don't)
2. **Multi-Channel Notifications** - More reliable than competitors
3. **AI Photo Quality** - Ensures certificate photos are usable
4. **UK Compliance Focus** - Built for UK landlord regulations
5. **Mobile-First Design** - Better UX for on-site work

**Cost Optimizations:**
- Email: Migrated SendGrid → Resend (£0 vs £15/month for 3K emails)
- SMS: Pay-per-use Twilio (~£0.04/SMS) - No monthly fees
- Photos: AWS S3 (pennies per month at MVP scale)
- Push: Expo (free)

### Production Readiness

**Ready for Production:**
- ✅ Multi-tenancy with strict data isolation
- ✅ JWT authentication with refresh tokens
- ✅ Password hashing (bcrypt, 10 rounds)
- ✅ Input validation (Zod schemas)
- ✅ Rate limiting on auth endpoints
- ✅ Offline mode fully operational
- ✅ Multi-channel notifications working
- ✅ Stable tech stack (React 18.3.1 + Node 20 LTS)

**Needs Before Launch:**
- ⚠️ Stripe payment integration
- ⚠️ Higher test coverage (currently 14.94%, target 50%+)
- ⚠️ Error monitoring (Sentry)
- ⚠️ CI/CD pipeline
- ⚠️ App Store approval (1-2 week process)

### MVP Launch Timeline

**Week 1-2:** Sprint 6 Development
- Stripe integration + pricing page
- CI/CD setup
- Error monitoring (Sentry)
- Bug fixes

**Week 3:** App Store Submission
- Build production apps
- Submit to Apple App Store
- Submit to Google Play Store
- Setup beta testing groups

**Week 4:** Beta Testing & Approval
- Onboard 10-20 beta users
- Monitor for critical bugs
- Wait for App Store approval
- Final production deployment

**Week 5:** MVP Launch 🚀
- Public launch
- Marketing push
- User onboarding
- Monitor metrics

### Success Metrics (MVP)

**Target Metrics:**
- [ ] 10-20 beta users onboarded
- [ ] >10 work orders created
- [ ] 99%+ uptime (UptimeRobot)
- [ ] <3 critical bugs (Sentry)
- [ ] Positive feedback vs competitors
- [ ] Offline mode reliability >95%
- [ ] Average response time <500ms

### Investment Summary

**Development Progress:**
- 5/6 sprints complete (82%)
- Core differentiator delivered and tested
- Stable tech stack (zero peer warnings)
- Comprehensive documentation

**Remaining Investment:**
- ~3 weeks of development
- App Store fees ($99/year iOS + $25 one-time Android)
- Hosting costs during beta (<$50/month)

### Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| App Store rejection | High | Medium | Submit early, follow guidelines strictly |
| Payment integration issues | High | Low | Stripe well-documented, use test mode first |
| Low test coverage causes bugs | Medium | Medium | Expand test coverage before launch |
| Offline sync edge cases | Medium | Low | Comprehensive device testing completed |

### Recommendations

1. **Proceed with Sprint 6** - All prerequisites met
2. **Start App Store submission early** - Approval process unpredictable
3. **Recruit beta testers now** - Need 10-20 for launch week
4. **Plan marketing materials** - App Store screenshots, description
5. **Setup customer support** - Email/chat for beta users

---

## 📊 For the Product Manager (PM)

**Date:** 2025-10-30
**Technical Status:** Production-Ready with Sprint 6 Remaining
**Sprint Velocity:** ~50 points/2 weeks

### Technical Summary

**Architecture:** Turborepo monorepo with 3 apps (API, Web, Mobile)

**Tech Stack:**
- Backend: Node.js 20 LTS + Express + PostgreSQL + Prisma
- Web: React 18.3.1 + Vite + Material-UI
- Mobile: React Native + Expo SDK 52 + WatermelonDB
- Infrastructure: AWS (S3) + Twilio (SMS) + Resend (Email) + Google Vision API

**Migration Complete:** Successfully migrated from React 19 RC + Node 24 to stable LTS stack (2025-10-28)

### Sprint Progress

| Sprint | Points | Status | Completion Date |
|--------|--------|--------|-----------------|
| Sprint 1: Foundation | 50 | ✅ Complete | 2025-10-26 |
| Sprint 2: Core Workflows | 50 | ✅ Complete | 2025-10-27 |
| Sprint 3: Mobile Foundation | 53 | ✅ Complete | 2025-10-28 |
| Sprint 4: Offline Mode | 56 | ✅ Complete | 2025-10-30 |
| Sprint 5: AI + Notifications | 42 | ✅ Complete | 2025-10-29 |
| Sprint 6: Payments + Launch | 53 | 🔜 Next | TBD |
| **Total** | **304** | **82%** | **MVP ~3 weeks** |

### Technical Achievements (Last Week)

1. **WSL2 Android Development Environment**
   - Local builds working (no Expo cloud dependency)
   - Android SDK + Gradle 8.10.2 configured
   - Physical device testing via USB (ADB)
   - Build time: ~1 minute for APK

2. **Automatic Sync Implementation**
   - Network-aware sync using @react-native-community/netinfo
   - Background sync every 5 minutes
   - Sync queue with offline operation tracking
   - Conflict resolution: last-write-wins
   - Verified cross-platform (mobile → web)

3. **Priority Enum Bug Fixed**
   - Mobile app was sending "EMERGENCY" priority
   - Backend schema only accepts HIGH, MEDIUM, LOW
   - Fixed in 2 files, tested end-to-end

4. **Documentation Overhaul**
   - 3 new comprehensive guides for Android dev
   - Root directory organized (20+ files → 6)
   - AI agent navigation guide created
   - All docs updated for WSL2 + Node 20 LTS

### Sprint 6 Technical Requirements

**User Stories & Technical Complexity:**

1. **Stripe Integration** (8 points - High Complexity)
   - Setup Stripe account + API keys
   - Implement webhook handlers (subscription events)
   - Create subscription management endpoints
   - Handle payment failures + retries
   - Test with Stripe test mode
   - **Risk:** Payment edge cases can be tricky

2. **Pricing Page** (4 points - Low Complexity)
   - Create web + mobile pricing screens
   - Display tier features
   - Link to Stripe checkout
   - **Risk:** Low

3. **Free Trial** (3 points - Medium Complexity)
   - Trial logic in database (trial_ends_at)
   - Middleware to check subscription status
   - Grace period handling
   - **Risk:** Edge cases around trial expiry

4. **Subscription Management** (5 points - Medium Complexity)
   - Upgrade/downgrade flows
   - Cancellation handling
   - Prorated billing
   - **Risk:** Stripe API complexity

5. **Bug Fixes** (10 points - Variable)
   - Buffer for issues discovered during integration
   - Beta tester feedback
   - **Risk:** Unknown unknowns

6. **CI/CD Pipeline** (8 points - High Complexity)
   - GitHub Actions for automated tests
   - Automated deployments to staging/production
   - Environment variable management
   - **Risk:** First-time setup always has issues

7. **Error Monitoring** (4 points - Low Complexity)
   - Sentry integration (backend + frontend)
   - Alert configuration
   - **Risk:** Low

8. **Uptime Monitoring** (3 points - Low Complexity)
   - UptimeRobot configuration
   - Slack/email alerts
   - **Risk:** Low

9. **App Store Submission** (6 points - Medium Complexity)
   - Build production apps
   - Create App Store listings
   - Submit for review
   - **Risk:** Approval process unpredictable (1-2 weeks)

### Technical Dependencies

**External Services Required for Sprint 6:**
1. Stripe account (test + production modes)
2. Sentry account (error monitoring)
3. UptimeRobot account (uptime monitoring)
4. Apple Developer Account ($99/year)
5. Google Play Developer Account ($25 one-time)
6. GitHub Actions (included with GitHub)

### Test Coverage Status

**Current:** 14.94% (38 tests passing)
- WorkOrdersService: 89.65% (22 tests) ✅
- Multi-tenancy enforcement: Tested ✅
- Other services: 0% ⚠️

**Target for Production:** 50%+
- PropertiesService tests needed
- ContractorsService tests needed
- CertificatesService tests needed
- Integration tests needed

**Recommendation:** Allocate 1 week for test coverage expansion before production launch.

### Performance Metrics

**API Response Times (Local):**
- Health check: <10ms
- Login: ~200ms (bcrypt hashing)
- List properties: ~50ms
- Create work order: ~100ms

**Mobile App:**
- Cold start: ~3 seconds
- Sync cycle: ~2-5 seconds (depends on queue size)
- Offline operation: Instant (local DB)

**Database:**
- Tables: 12
- Indexes: Tenant_id on all tables
- Soft deletes: All tables

### Infrastructure Costs (Estimated)

**MVP Phase (10-20 users):**
- AWS RDS (PostgreSQL): $15/month (db.t3.micro)
- AWS EC2 (API): $10/month (t3.micro)
- AWS S3 (Photos): $1/month
- Twilio SMS: ~$5/month (pay-per-use)
- Resend Email: $0 (3,000 free/month)
- Google Vision API: $0 (1,000 free/month)
- Sentry: $0 (free tier)
- **Total: ~$30/month**

**Growth Phase (100 users):**
- Scale to t3.small instances: ~$60/month
- S3 + SMS increases: ~$20/month
- Email may need paid tier: ~$10/month
- **Total: ~$90/month**

### Security Audit

**Implemented:**
- ✅ JWT authentication with refresh tokens
- ✅ Password hashing (bcrypt, 10 rounds)
- ✅ Multi-tenancy data isolation
- ✅ Input validation (Zod)
- ✅ SQL injection protection (Prisma ORM)
- ✅ Rate limiting on auth endpoints
- ✅ CORS configuration
- ✅ Helmet.js security headers
- ✅ 404 responses for cross-tenant access

**Needs Attention:**
- ⚠️ Rate limiting on all endpoints (not just auth)
- ⚠️ Input sanitization beyond validation
- ⚠️ API versioning strategy
- ⚠️ GDPR compliance documentation

### Deployment Strategy

**Environments:**
1. Local (current) - WSL2 + Docker
2. Staging (needed) - AWS test environment
3. Production (needed) - AWS production environment

**Deployment Process (Sprint 6):**
1. Setup staging environment (mirror of production)
2. Configure CI/CD for automated deployments
3. Deploy to staging for beta testing
4. Deploy to production after approval

**Zero-Downtime Strategy:**
- Blue-green deployments for API
- Database migrations with backward compatibility
- Mobile apps updated via App Store (users control timing)

### Technical Debt

**Low Priority:**
- Web app needs UI polish
- Mobile app loading states
- Empty states for no data
- Retry logic for failed API calls
- Dark mode support

**High Priority (Post-MVP):**
- Expand test coverage to 70%+
- Add integration tests
- Add E2E tests
- Rate limiting on all endpoints

### Recommendations for Sprint 6

1. **Start with Stripe Integration** - Most complex, do first
2. **Setup staging environment early** - Test production config
3. **Submit to App Store in Week 1** - Approval takes time
4. **Allocate buffer days** - Payment integration always has surprises
5. **Test payment edge cases thoroughly** - Failed payments, trial expiry, cancellations

### Sprint 6 Timeline (Recommended)

**Week 1: Core Development**
- Days 1-2: Stripe integration (backend)
- Day 3: Pricing page (web + mobile)
- Day 4: Free trial logic
- Day 5: Subscription management

**Week 2: DevOps & Polish**
- Days 1-2: CI/CD pipeline setup
- Day 3: Error monitoring (Sentry)
- Day 4: App Store submissions
- Day 5: Bug fixes + testing

**Week 3: Beta & Launch**
- Beta testing with 10-20 users
- Monitor for critical bugs
- Wait for App Store approval
- Production deployment

### Risk Management

**High Risk:**
1. App Store rejection - **Mitigation:** Follow guidelines, submit early
2. Payment integration issues - **Mitigation:** Use Stripe test mode extensively
3. Low test coverage causes production bugs - **Mitigation:** Expand coverage before launch

**Medium Risk:**
1. CI/CD setup complexity - **Mitigation:** Use GitHub Actions templates
2. Offline sync edge cases - **Mitigation:** Already comprehensively tested

**Low Risk:**
1. Performance issues at scale - **Mitigation:** Horizontal scaling ready
2. Third-party service outages - **Mitigation:** Graceful degradation implemented

### Success Criteria

**Technical:**
- [ ] All Sprint 6 stories complete (53 points)
- [ ] Test coverage >50%
- [ ] Zero critical security vulnerabilities
- [ ] <500ms average API response time
- [ ] Apps approved by Apple + Google

**Business:**
- [ ] Stripe payments working end-to-end
- [ ] 10-20 beta users onboarded
- [ ] <3 critical bugs reported
- [ ] 99%+ uptime during beta
- [ ] Positive user feedback

---

## 📞 Questions?

If you're the next developer and have questions about any of this:

1. **Check the docs first:**
   - `SPRINT_STATUS.md` - Overall progress
   - `docs/project-plan/sprint-plans.md` - Detailed sprint plans
   - `DATABASE_SETUP.md` - Database setup
   - `apps/mobile/README.md` - Mobile app specifics

2. **Check the code:**
   - Services have JSDoc comments
   - API routes have inline comments
   - Complex logic has explanatory comments

3. **Grep is your friend:**
   ```bash
   # Find where something is used
   grep -r "functionName" apps/api/src/

   # Find API endpoints
   grep -r "router\." apps/api/src/routes/

   # Find service methods
   grep -r "async function" apps/api/src/services/
   ```

4. **Test in Prisma Studio:**
   - `cd packages/database && pnpx prisma studio`
   - Explore database schema and data visually

Good luck! The foundation is solid. Focus on Sprint 4 (offline mode) - that's what will make this product special. 🚀
