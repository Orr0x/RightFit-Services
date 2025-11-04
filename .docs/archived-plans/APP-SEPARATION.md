# App Separation Guidelines

**Purpose:** Define clear boundaries between applications to prevent code duplication, avoid unauthorized API calls, and maintain clean architecture.

**Last Updated:** 2025-11-02
**Related:** [Cleanup Sprint 1](../sprints/CLEANUP-SPRINT-1.md) - Documents the consequences of not following these guidelines

---

## 🎯 Why This Matters

**Lesson Learned from Cleanup Sprint 1:**

When apps were initially scaffolded, code was copied from `web-landlord` without removing unnecessary features. This led to:
- ❌ 401 errors from unauthorized API calls (guest-tablet calling `/api/contractors`)
- ❌ ~3,600 lines of dead code across 4 apps
- ❌ 37 files that didn't belong in their apps
- ❌ Increased bundle sizes (guest-tablet had 1048-line landlord API client it didn't need)
- ❌ Confusing search results showing pages that don't exist
- ❌ Maintenance overhead maintaining duplicate code

**Result of cleanup:**
- ✅ All 401 errors eliminated
- ✅ Bundle sizes optimized
- ✅ Clear separation of concerns
- ✅ Faster load times
- ✅ Easier to maintain

**Golden Rule:** Only include code that is actually needed for the app's purpose. When in doubt, leave it out.

---

## 📱 Application Architecture Overview

RightFit Services consists of 6 applications:

```
┌─────────────────────────────────────────────────────────────────┐
│                         API Server (Port 3001)                   │
│                    Multi-tenant backend services                 │
└─────────────────────────────────────────────────────────────────┘
                                  │
                ┌─────────────────┼─────────────────┐
                │                 │                 │
        ┌───────▼────────┐ ┌─────▼─────┐  ┌───────▼────────┐
        │   web-landlord  │ │web-customer│  │  guest-tablet  │
        │   (Port 5173)   │ │(Port 5176) │  │  (Port 5177)   │
        │                 │ │            │  │                │
        │ Legacy property │ │ Customer   │  │ Anonymous      │
        │ management      │ │ portal     │  │ guest access   │
        └─────────────────┘ └────────────┘  └────────────────┘
                │
        ┌───────┴────────┐
        │                │
  ┌─────▼─────┐  ┌──────▼──────┐
  │web-cleaning│  │web-maintenance│
  │(Port 5174) │  │ (Port 5175)  │
  │            │  │              │
  │ Cleaning   │  │ Maintenance  │
  │ provider   │  │ provider     │
  └────────────┘  └──────────────┘
```

---

## 🖥️ Guest Tablet (apps/guest-tablet)

### Purpose
Anonymous guest access to property information at short-term rentals (Airbnb, VRBO). Accessed via QR code on tablet at property.

### User Type
Anonymous guests (no login required)

### Key Characteristics
- ✅ **No authentication** - Session-based via property context from QR code
- ✅ **No navigation sidebar** - Fullscreen pages only, minimal chrome
- ✅ **Touch-optimized** - Large buttons, simple interactions
- ✅ **Material-UI components** - Uses MUI for tablet-friendly UI
- ✅ **Standalone pages** - Each page is self-contained with gradient backgrounds

### Pages (5 total)
1. **GuestWelcome.tsx** - Welcome screen with property info
2. **AIChat.tsx** - Q&A interface with AI assistant
3. **ReportIssue.tsx** - 3-step issue reporting wizard
4. **DIYGuide.tsx** - Step-by-step repair instructions
5. **KnowledgeBase.tsx** - Property documentation, FAQs, local recommendations

### API Endpoints
```typescript
// Only these 4 guest endpoints
POST   /api/guest/sessions              // Create anonymous session
POST   /api/guest/questions             // Ask AI questions
POST   /api/guest/issues                // Report property issues
GET    /api/guest/diy-guides/:type      // Get DIY repair guides
GET    /api/guest/knowledge/:propertyId // Get property info/FAQs
```

### API Client
- **File:** `apps/guest-tablet/src/lib/guestApi.ts` (~50 lines)
- **What it contains:** Only the 4 guest endpoints above
- **What it does NOT contain:** No auth interceptors, no landlord/service provider endpoints

### What Does NOT Belong Here
- ❌ Login/Register pages
- ❌ Authentication (AuthContext, ProtectedRoute)
- ❌ AppLayout/Sidebar navigation
- ❌ Properties, Workers, Contractors, Tenants, WorkOrders, Financial, Certificates pages
- ❌ Service provider dashboards (cleaning/maintenance)
- ❌ Any API calls to landlord/service provider endpoints
- ❌ The 1048-line landlord `api.ts` client

### Bundle Size
- **Target:** < 800 kB (gzipped: < 250 kB)
- **Actual:** 735.71 kB (gzipped: 215.17 kB) ✅

---

## 👤 Customer Portal (apps/web-customer)

### Purpose
Authenticated portal for property managers/customers to view service history, approve quotes, and manage preferences.

### User Type
Property managers/business customers (authenticated with JWT)

### Key Characteristics
- ✅ **JWT authentication** - Login required
- ✅ **Navigation sidebar** - 6 main nav items
- ✅ **Custom UI components** - Reusable Button, Card, Input, etc.
- ✅ **Customer-focused features** - View-only access to service data

### Pages (8 total)
1. **Login.tsx** - Customer login
2. **Register.tsx** - Customer registration
3. **CustomerDashboard.tsx** - Overview of properties, jobs, pending quotes
4. **Properties.tsx** - View customer properties
5. **QuoteApproval.tsx** - Approve/decline maintenance quotes
6. **Invoices.tsx** - Payment history, monthly spending
7. **Financial.tsx** - Financial overview
8. **Settings.tsx** - Customer preferences (auto-pay, notifications)

### Navigation Items
```typescript
const navItems = [
  'Dashboard',
  'Properties',
  'Quotes',
  'Invoices',
  'Financial',
  'Settings'
]
```

### API Endpoints
```typescript
// Customer portal endpoints
POST   /api/customer-portal/auth/login
POST   /api/customer-portal/auth/register
GET    /api/customer-portal/dashboard
GET    /api/customer-portal/properties/:id/history
PUT    /api/customer-portal/quotes/:id/approve
PUT    /api/customer-portal/quotes/:id/decline
GET    /api/customer-portal/preferences
PUT    /api/customer-portal/preferences

// Read-only access to customer data
GET    /api/customers/:id
GET    /api/customer-properties
```

### API Client
- **File:** `apps/web-customer/src/lib/api.ts`
- **What it contains:** Customer portal endpoints + JWT auth interceptors
- **What it does NOT contain:** No landlord property management, no worker/contractor CRUD

### What Does NOT Belong Here
- ❌ Workers.tsx, Contractors.tsx, Tenants.tsx, WorkOrders.tsx, Certificates.tsx
- ❌ Service provider job management (cleaning/maintenance dashboards)
- ❌ Worker assignment or job scheduling features
- ❌ Landlord property CRUD operations
- ❌ Search results for "Work Orders" or "Tenants"

### Search Results Should Include
```typescript
const searchResults = [
  'Properties',
  'Quotes',
  'Invoices',
  'Financial',
  'Settings'
]
```

---

## 🧹 Service Provider Dashboards

### web-cleaning (Port 5174) & web-maintenance (Port 5175)

### Purpose
Authenticated dashboards for service providers (cleaning companies, maintenance contractors) to manage jobs, workers, and customer relationships.

### User Type
Service provider staff (authenticated with JWT)

### Key Characteristics
- ✅ **Full CRUD** for jobs, workers, customers
- ✅ **Customer property management** - Manage properties for customers they serve
- ✅ **Job workflows** - Create, assign, complete, invoice
- ✅ **Quote generation** - For maintenance jobs
- ✅ **Multi-tenant isolation** - Service provider sees only their data

### Common Pages (Both Apps)
1. **Login.tsx** / **Register.tsx** - Service provider authentication
2. **Dashboard** - CleaningDashboard.tsx / MaintenanceDashboard.tsx
3. **Properties.tsx** - **CUSTOMER properties** (via `customerPropertiesAPI`)
4. **Workers.tsx** - Worker/staff management
5. **Financial.tsx** - Revenue, expenses, invoicing
6. **Certificates.tsx** - Property certifications (insurance, inspections)

### Cleaning-Specific Pages
- **CleaningJobs.tsx** - List of cleaning jobs
- **CleaningJobDetails.tsx** - Job details with checklist

### Maintenance-Specific Pages
- **MaintenanceJobs.tsx** - List of maintenance jobs (tabbed: New | Quoted | Accepted)
- **MaintenanceJobDetails.tsx** - Job details with quote submission form

### API Endpoints (Cleaning)
```typescript
GET    /api/cleaning-jobs                // List jobs
POST   /api/cleaning-jobs                // Create job
GET    /api/cleaning-jobs/:id            // Get job details
PUT    /api/cleaning-jobs/:id            // Update job
DELETE /api/cleaning-jobs/:id            // Delete job
PUT    /api/cleaning-jobs/:id/assign     // Assign worker
PUT    /api/cleaning-jobs/:id/complete   // Mark complete
```

### API Endpoints (Maintenance)
```typescript
GET    /api/maintenance-jobs             // List jobs
POST   /api/maintenance-jobs             // Create job
GET    /api/maintenance-jobs/:id         // Get job details
PUT    /api/maintenance-jobs/:id         // Update job
DELETE /api/maintenance-jobs/:id         // Delete job
POST   /api/maintenance-jobs/:id/submit-quote  // Submit quote
POST   /api/maintenance-jobs/:id/decline       // Decline job
PUT    /api/maintenance-jobs/:id/assign        // Assign worker
PUT    /api/maintenance-jobs/:id/complete      // Mark complete
```

### Shared Service Provider Endpoints
```typescript
GET    /api/customer-properties          // ✅ CORRECT - Customer properties
GET    /api/workers
GET    /api/services
GET    /api/external-contractors
```

### CRITICAL: Properties.tsx Must Use Customer Properties
```typescript
// ✅ CORRECT
import { customerPropertiesAPI } from '../lib/api'

// ❌ WRONG - DO NOT USE
import { propertiesAPI } from '../lib/api'  // This is for landlord properties only!
```

**Why?** Service providers manage properties FOR their customers, not their own landlord properties. Using `propertiesAPI` causes 401 errors.

### What Does NOT Belong Here
- ❌ Tenants.tsx, Contractors.tsx, WorkOrders.tsx (landlord features)
- ❌ Guest tablet pages (GuestWelcome, AIChat, etc.)
- ❌ Customer portal pages (QuoteApproval, CustomerDashboard)
- ❌ Search results for "Work Orders" or "Tenants"
- ❌ Tabs for "our-properties" (use customer properties only)

### Search Results Should Include (Cleaning)
```typescript
const searchResults = [
  'Cleaning Jobs',
  'Properties',
  'Workers',
  'Financial',
  'Certificates'
]
```

### Search Results Should Include (Maintenance)
```typescript
const searchResults = [
  'Maintenance Jobs',
  'Properties',
  'Workers',
  'Financial',
  'Certificates'
]
```

---

## 🏢 Landlord Dashboard (apps/web-landlord)

### Purpose
Legacy property management system for landlords who self-manage properties (not using service providers).

### User Type
Landlords, property owners (authenticated with JWT)

### Pages (8 total)
1. **Login.tsx** / **Register.tsx** - Landlord authentication
2. **Properties.tsx** - Landlord's own properties (via `propertiesAPI`)
3. **Tenants.tsx** - Tenant management
4. **WorkOrders.tsx** - Work order tracking
5. **Contractors.tsx** - Contractor management
6. **Certificates.tsx** - Property certifications
7. **Financial.tsx** - Rent collection, expenses
8. **Dashboard** - (To be implemented)

### API Endpoints
```typescript
GET    /api/properties                   // Landlord's own properties
GET    /api/tenants
GET    /api/work-orders
GET    /api/contractors
GET    /api/certificates
```

### Notes
This is the "original" app that other apps were copied from. It contains the full landlord feature set that should NOT be copied to service provider or customer apps.

---

## 🧩 Component Sharing Strategy

### Current State: Duplicated Components ⚠️

**Status:** All web apps currently have **identical copies** of UI components in `apps/[app]/src/components/ui/`.

**Common UI Components (duplicated across apps):**
- **Form Controls:** Button, Input, Textarea, Select, Checkbox, Radio (RadioGroup)
- **Layout:** Card (with CardHeader, CardSection)
- **Modals:** Modal, ConfirmModal
- **Notifications:** Toast (with ToastProvider, useToast hook)
- **Loading States:** Spinner (with LoadingOverlay), Skeleton variants (SkeletonText, SkeletonCard, SkeletonTable)
- **Info Display:** EmptyState, Badge
- **Utilities:** ThemeToggle, KeyboardShortcutsHelp

### Import Pattern
```typescript
// Current: Local imports (duplicated code)
import { Button, Card, Input } from '../components/ui'
```

### Technical Debt Warning

**This is a known technical debt item.** Having 5+ copies of identical components means:
- 🔴 **5x maintenance burden** - Bug fixes must be applied to all apps
- 🔴 **Inconsistent UX** - Components can drift out of sync
- 🔴 **Larger codebase** - Unnecessary duplication inflates repo size

**Future Recommendation:** Refactor into shared package:
```typescript
// Future: Shared package (recommended)
import { Button, Card, Input } from '@rightfit/ui'
```

This would involve:
1. Creating `packages/ui/` with shared components
2. Publishing as local npm package
3. Updating all apps to import from `@rightfit/ui`
4. Deleting duplicated `apps/*/src/components/ui/` directories

**Until then:** When updating a UI component, you MUST update it in ALL apps to maintain consistency.

---

## 📋 Guidelines for Copying Code Between Apps

### Before Copying ANY Code from One App to Another

Follow this checklist to avoid repeating the Cleanup Sprint 1 mistakes:

#### 1. Identify What You Actually Need

**Ask yourself:**
- ✅ Does this new app need this specific page/feature?
- ✅ Does this new app have the same user role as the source app?
- ✅ Will this new app be authorized to call the same API endpoints?

**Example:**
```
❌ BAD: "I need a properties page, so I'll copy Properties.tsx from web-landlord"
✅ GOOD: "I need customer properties, so I'll copy Properties.tsx from web-cleaning and verify it uses customerPropertiesAPI"
```

#### 2. Remove Unnecessary Features

**Common items to remove when copying:**
- ❌ Pages that don't match the new app's purpose
- ❌ Navigation items for pages you're not including
- ❌ API client methods for endpoints you won't call
- ❌ Auth logic if the app doesn't need authentication (e.g., guest-tablet)
- ❌ Layout components if pages are fullscreen (e.g., guest-tablet)

**Example from Cleanup Sprint 1:**

When `guest-tablet` was scaffolded from `web-landlord`, these should have been removed immediately:
```bash
# Should NOT have been copied to guest-tablet:
- src/pages/Login.tsx, Register.tsx          # Guest tablet has no auth
- src/pages/Properties.tsx, WorkOrders.tsx   # Not needed for guests
- src/components/layout/AppLayout.tsx        # Fullscreen pages only
- src/contexts/AuthContext.tsx               # No authentication
- src/lib/api.ts (1048 lines)                # Landlord API client
```

#### 3. Verify API Authorization

**Check API routes in the backend:**

```typescript
// Example: Check if the new app's user role can access this endpoint
// apps/api/src/routes/properties.ts

router.get('/api/properties', authenticateJWT, async (req, res) => {
  // This endpoint requires a landlord JWT token
  // Service provider apps and guest-tablet CANNOT call this
})
```

**Before including an API call in your app, verify:**
1. The endpoint exists in the API
2. The app's user type is authorized to call it
3. The multi-tenant isolation is correct

#### 4. Update Search Results and Navigation

**When removing pages, also remove from:**
- Navigation sidebar items
- Search mock results
- Routing configuration

**Example:**
```typescript
// ❌ WRONG: Search includes pages that don't exist
const searchResults = [
  { title: 'Work Orders', path: '/work-orders' },  // Page doesn't exist!
  { title: 'Properties', path: '/properties' }
]

// ✅ CORRECT: Search only includes existing pages
const searchResults = [
  { title: 'Properties', path: '/properties' },
  { title: 'Quotes', path: '/quotes' }
]
```

#### 5. Delete Files, Don't Comment Them Out

**Anti-pattern:**
```typescript
// ❌ WRONG: Leaving commented-out code
// import { propertiesAPI } from '../lib/api'  // Not using this anymore
import { customerPropertiesAPI } from '../lib/api'
```

**Correct pattern:**
```typescript
// ✅ CORRECT: Just delete it
import { customerPropertiesAPI } from '../lib/api'
```

**Why?** Git preserves history. If you need the code later, check it out from git history. Dead code creates confusion and increases bundle size.

#### 6. Test After Copying

**Required tests:**
1. ✅ App builds without errors (`npm run build`)
2. ✅ No 401 errors in browser console
3. ✅ All intended features work
4. ✅ No 404 errors when navigating
5. ✅ Search only shows pages that exist

---

## 🚨 Red Flags That Indicate Wrong Code in App

Watch for these warning signs:

### 1. 401 Unauthorized Errors in Console
```
GET /api/properties 401 (Unauthorized)
GET /api/contractors 401 (Unauthorized)
```
**Cause:** App is calling endpoints it's not authorized to access
**Fix:** Remove the API calls and the pages that make them

### 2. Pages That Never Load
```
// In guest-tablet/src/App.tsx
<Route path="/properties" element={<Properties />} />  // ❌ Why does guest tablet have this?
```
**Cause:** Routes copied from another app without removing unused ones
**Fix:** Delete the routes and pages for features you don't need

### 3. Imports That Fail
```typescript
import { AuthContext } from '../contexts/AuthContext'  // Module not found
```
**Cause:** Importing code that was correctly deleted, but references weren't updated
**Fix:** Remove the import and the code that uses it

### 4. Search Results for Non-Existent Pages
```typescript
const searchResults = [
  { title: 'Work Orders', path: '/work-orders' }  // ❌ This route doesn't exist
]
```
**Cause:** Search mock data not updated when pages were removed
**Fix:** Update search results to only include existing pages

### 5. Large Bundle Sizes
```
guest-tablet bundle: 1.2 MB (gzipped: 400 kB)  // ❌ Way too large for 5 simple pages
```
**Cause:** Including unnecessary dependencies (like full landlord API client)
**Fix:** Audit imports and remove unused code

---

## 📚 API Endpoint Reference by App

### Guest Tablet
```typescript
✅ /api/guest/sessions
✅ /api/guest/questions
✅ /api/guest/issues
✅ /api/guest/diy-guides/:type
✅ /api/guest/knowledge/:propertyId
❌ All other endpoints
```

### Customer Portal
```typescript
✅ /api/customer-portal/*
✅ /api/customers/:id (read-only)
✅ /api/customer-properties (read-only)
❌ /api/cleaning-jobs/* (read-only via dashboard)
❌ /api/maintenance-jobs/* (read-only via dashboard)
❌ /api/properties/* (landlord properties)
❌ /api/workers/* (no worker management)
```

### Service Provider Dashboards (Cleaning & Maintenance)
```typescript
✅ /api/cleaning-jobs/*
✅ /api/maintenance-jobs/*
✅ /api/customer-properties/* (CRITICAL: Use this, NOT /api/properties)
✅ /api/workers/*
✅ /api/services/*
✅ /api/external-contractors/*
❌ /api/properties/* (landlord properties)
❌ /api/tenants/* (landlord feature)
❌ /api/work-orders/* (landlord feature)
❌ /api/contractors/* (landlord feature)
```

### Landlord Dashboard
```typescript
✅ /api/properties/* (landlord's own properties)
✅ /api/tenants/*
✅ /api/work-orders/*
✅ /api/contractors/*
✅ /api/certificates/*
❌ /api/cleaning-jobs/* (service provider feature)
❌ /api/maintenance-jobs/* (service provider feature)
❌ /api/customer-properties/* (service provider feature)
```

---

## 🎓 Case Study: Cleanup Sprint 1

**Problem:** When `guest-tablet`, `web-customer`, `web-cleaning`, and `web-maintenance` were scaffolded, code was copied from `web-landlord` without proper cleanup.

**Impact:**
- 16 unnecessary files in `guest-tablet` (9 landlord pages + 7 service provider pages)
- 5 unnecessary files in `web-customer`
- 3 unnecessary files each in `web-cleaning` and `web-maintenance`
- 401 errors appearing in guest-tablet console
- Confusing search results showing non-existent pages
- 1048-line API client in guest-tablet when it only needed 4 endpoints

**Resolution:** [Cleanup Sprint 1](../sprints/CLEANUP-SPRINT-1.md)
- Removed 27 files across 4 apps
- Replaced guest-tablet's 1048-line API client with 50-line guestApi.ts
- Fixed all Properties.tsx to use `customerPropertiesAPI` instead of `propertiesAPI`
- Updated all search results to only show existing pages
- Eliminated all 401 errors

**Time to fix:** 1 day
**Time to do it right initially:** ~2 hours

**Lesson:** Spend 2 hours doing cleanup during scaffolding instead of 1 day fixing issues later.

---

## ✅ Checklist for Creating New Apps

Use this checklist when scaffolding a new app:

### Before Copying Code
- [ ] Define the app's purpose in one sentence
- [ ] List the user types who will use this app
- [ ] List the exact pages/features needed
- [ ] List the API endpoints the app will call
- [ ] Verify the app's users are authorized to call those endpoints

### During Scaffolding
- [ ] Copy code from the most similar existing app
- [ ] Delete all pages not in your "needed" list
- [ ] Delete all API client methods not in your "endpoints" list
- [ ] Remove auth logic if app doesn't need authentication
- [ ] Remove navigation/layout if app is fullscreen
- [ ] Update navigation items to match remaining pages
- [ ] Update search results to match remaining pages
- [ ] Update routing to match remaining pages

### After Scaffolding
- [ ] Run `npm run build` - should build without errors
- [ ] Start dev server - should run without console errors
- [ ] Test all pages - should load without 401 errors
- [ ] Test navigation - should only show existing pages
- [ ] Test search - should only return existing pages
- [ ] Check bundle size - should be appropriate for app complexity
- [ ] Document the app's purpose in this file (APP-SEPARATION.md)

### Code Review Questions
- [ ] Are there any pages in this app that users won't access?
- [ ] Are there any API endpoints being called that will return 401?
- [ ] Are there any imports that could be removed?
- [ ] Does the bundle size make sense for this app's complexity?
- [ ] Is the navigation clean and only showing relevant items?

---

## 🔄 Future Improvements

### Short Term
1. **Refactor to shared UI package** - Move `components/ui/` to `packages/ui/`
2. **Create app templates** - Pre-cleaned templates for common app types
3. **Linting rules** - Detect unauthorized API calls at build time

### Long Term
1. **Shared routing config** - Centralize route definitions
2. **Feature flags** - Enable/disable features per app at runtime
3. **Micro-frontends** - Consider module federation for code sharing

---

## 📖 Related Documentation

- [Cleanup Sprint 1](../sprints/CLEANUP-SPRINT-1.md) - Full cleanup sprint documentation
- [Phase 3 Plan](../../PHASE_3_PLAN.md) - Job management implementation
- [Current Status](../../CURRENT_STATUS.md) - Overall project status

---

**Remember:** When in doubt, delete it. Git preserves history, so you can always get it back. Dead code is worse than no code.

---

*Last Updated: 2025-11-02*
*Maintained by: Development Team*
*Version: 1.0*
