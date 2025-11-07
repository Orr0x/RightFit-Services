# Agent Handoff - Business Management Sprint

**Date**: 2025-11-04
**Session Status**: Code Review Complete, Ready for Implementation
**Current Phase**: Phase 1 - Property Forms (Day 1 of 10-11)

---

## Quick Start - What You Need to Know

### 1. Where We Are
We just completed a comprehensive code review and discovered that significant portions of the originally planned "Business Management Sprint" were already implemented. The sprint has been revised from **45 points to 42 points** and is now ready for implementation.

**✅ Completed Today**:
- Code review of entire codebase against sprint plan
- Created comprehensive gap analysis (500+ line document)
- Reorganized all documentation into clear structure
- Updated PROJECT-MAP.md and CURRENT_STATUS.md
- Committed and pushed all changes to GitHub
- Ran database migration for CleaningQuote table

**🎯 Next Task**: Implement PM-001 (Add Property Form) - 5 points

---

## 2. Essential Files to Read (In Order)

### Start Here (5 minutes)
1. **[PROJECT-MAP.md](PROJECT-MAP.md)** - Single source of truth for project navigation
2. **[CURRENT_STATUS.md](CURRENT_STATUS.md)** - Detailed current status with sprint breakdown

### Understanding the Sprint (10 minutes)
3. **[START-HERE/CODE-REVIEW-FINDINGS.md](START-HERE/CODE-REVIEW-FINDINGS.md)** - CRITICAL: 500+ line analysis of what exists vs what needs building
   - Shows what's already done (Property Calendar, Property Details, Contracts)
   - Shows what needs implementation (Property Forms, Customer pages, Invoice/Quote pages)
   - Shows missing backend services (CleaningInvoice, CleaningQuote)
   - Contains detailed API specifications and implementation guidance

4. **[START-HERE/BUSINESS-MANAGEMENT-SPRINT-PLAN.md](START-HERE/BUSINESS-MANAGEMENT-SPRINT-PLAN.md)** - Complete sprint plan with acceptance criteria

### Technical Context (5 minutes)
5. **[START-HERE/TECHNICAL-PATTERNS.md](START-HERE/TECHNICAL-PATTERNS.md)** - Code patterns and best practices
6. **[START-HERE/COMPLETE-WORKFLOW-GUIDE.md](START-HERE/COMPLETE-WORKFLOW-GUIDE.md)** - End-to-end workflows

### Current Task Context (5 minutes)
7. **[stories/phase-3/STORY-PM-001-property-management.md](stories/phase-3/STORY-PM-001-property-management.md)** - Detailed story for PM-001 and PM-002
8. **[apps/web-cleaning/src/pages/AddProperty.tsx](apps/web-cleaning/src/pages/AddProperty.tsx)** - Current placeholder that needs implementation
9. **[apps/web-cleaning/src/pages/PropertyDetails.tsx](apps/web-cleaning/src/pages/PropertyDetails.tsx)** - Reference for what property data looks like when displayed

**Total Reading Time**: ~25 minutes for full context

---

## 3. Current Sprint Overview

### Revised Sprint Plan (42 points, 10-11 days, 14 stories)

#### Phase 1: Property Forms (Days 1-2, 9 pts) 🎯 **YOU ARE HERE**
- [ ] **PM-001: Add Property Form (5 pts)** ← START HERE
  - File: [apps/web-cleaning/src/pages/AddProperty.tsx](apps/web-cleaning/src/pages/AddProperty.tsx) (currently placeholder)
  - Backend API: ✅ EXISTS at [apps/api/src/routes/customer-properties.ts](apps/api/src/routes/customer-properties.ts)
  - Needs: Multi-section form, UK validation, photo upload, utility locations editor

- [ ] **PM-002: Edit Property Form (4 pts)**
  - File: [apps/web-cleaning/src/pages/EditProperty.tsx](apps/web-cleaning/src/pages/EditProperty.tsx) (currently placeholder)
  - Same as PM-001 but pre-filled with existing data

#### Phase 2: Cleaning Business Backend (Days 3-4, 8 pts)
- [ ] Create CleaningInvoiceService.ts (2 pts)
- [ ] Create cleaning-invoices routes (2 pts)
- [ ] Create CleaningQuoteService.ts (2 pts)
- [ ] Create cleaning-quotes routes (2 pts)

#### Phase 3: Customer Management (Days 5-6, 9 pts)
- [ ] CM-001: Customers Page (3 pts)
- [ ] CM-002: Customer Details Page (4 pts)
- [ ] CM-003: Add/Edit Customer Forms (2 pts)

#### Phase 4: Invoices & Quotes (Days 7-9, 14 pts)
- [ ] INV-001: Invoices Page (5 pts)
- [ ] INV-002: Invoice Details Page (3 pts)
- [ ] QT-001: Quotes Page (5 pts)
- [ ] QT-002: Quote Details Page (3 pts)
- [ ] QT-003: Create Quote Wizard (3 pts)

#### Phase 5: Polish & Integration (Days 10-11, 2 pts)
- [ ] CON-001: Contract UX Polish (1 pt)
- [ ] INT-003: Documentation & Testing (1 pt)

---

## 4. Key Discoveries from Code Review

### ✅ Already Implemented (DO NOT REBUILD)
1. **Property Guest Calendar** - [apps/web-cleaning/src/components/PropertyGuestCalendar.tsx](apps/web-cleaning/src/components/PropertyGuestCalendar.tsx) - FULLY FUNCTIONAL
2. **Property Details Page** - [apps/web-cleaning/src/pages/PropertyDetails.tsx](apps/web-cleaning/src/pages/PropertyDetails.tsx) - 380 lines, comprehensive
3. **Cleaning Contracts Page** - [apps/web-cleaning/src/pages/CleaningContracts.tsx](apps/web-cleaning/src/pages/CleaningContracts.tsx) - 90% done, needs minor polish

### ❌ Needs Implementation (YOUR WORK)
1. **Property Forms** - Currently show "Coming Soon" placeholders
2. **Customer Pages** - Do not exist at all
3. **Invoice Pages** - Do not exist at all
4. **Quote Pages** - Do not exist at all
5. **CleaningInvoice Backend** - Service and routes missing
6. **CleaningQuote Backend** - Service and routes missing

---

## 5. PM-001: Add Property Form - Implementation Guide

### What to Build
A comprehensive multi-section property form with:
- Basic Information (name, address, postcode, type, beds, baths)
- Customer Selection (dropdown with search)
- Access Information (instructions, code)
- Utility Locations (stop tap, meters, fuse box, boiler)
- Emergency Contacts (array of contacts)
- Additional Details (WiFi, parking, pets, special requirements)
- Photo Upload (multiple photos with captions)

### Form Structure (TypeScript Interface)
```typescript
interface PropertyFormData {
  // Basic Info
  property_name: string           // Required
  address: string                 // Required
  postcode: string               // Required, UK validation
  customer_id: string            // Required, dropdown
  property_type?: string         // Optional
  bedrooms?: number              // Optional
  bathrooms?: number             // Optional

  // Access Info
  access_instructions?: string
  access_code?: string

  // Utility Locations (JSON)
  utility_locations?: {
    stopTap?: string
    waterMeter?: string
    gasMeter?: string
    fuseBox?: string
    boiler?: string
  }

  // Emergency Contacts (JSON array)
  emergency_contacts?: Array<{
    name: string
    phone: string
    relation?: string
  }>

  // Additional
  wifi_ssid?: string
  wifi_password?: string
  parking_info?: string
  pet_info?: string
  cleaner_notes?: string
  special_requirements?: string

  // Photos (JSON array)
  photo_urls?: Array<{
    url: string
    caption?: string
    type?: 'exterior' | 'interior' | 'utility' | 'other'
  }>
}
```

### Backend API (Already Exists)
**POST /api/customer-properties**
- File: [apps/api/src/routes/customer-properties.ts:86](apps/api/src/routes/customer-properties.ts#L86)
- Service: [apps/api/src/services/CustomerPropertiesService.ts](apps/api/src/services/CustomerPropertiesService.ts)
- Accepts all fields from PropertyFormData interface
- Returns created property with ID

### UK Validation Patterns
```typescript
// Postcode validation (UK format)
const postcodeRegex = /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i

// UK Phone validation
const phoneRegex = /^(\+44\s?7\d{3}|\(?07\d{3}\)?)\s?\d{3}\s?\d{3}$/
```

### Reference Components
Look at these existing components for patterns:
- [apps/web-cleaning/src/pages/cleaning/CreateCleaningJob.tsx](apps/web-cleaning/src/pages/cleaning/CreateCleaningJob.tsx) - Form structure
- [apps/web-cleaning/src/pages/PropertyDetails.tsx](apps/web-cleaning/src/pages/PropertyDetails.tsx) - Display of property data
- [apps/web-cleaning/src/pages/Workers.tsx](apps/web-cleaning/src/pages/Workers.tsx) - Customer dropdown pattern

### UI Components Available
- Button, Card, Input, Select, Spinner from [apps/web-cleaning/src/components/ui](apps/web-cleaning/src/components/ui)
- useToast for notifications
- useAuth for service provider ID
- Material-UI icons for visual elements

---

## 6. Database Schema Reference

### CustomerProperty Model (Prisma)
```prisma
model CustomerProperty {
  id                             String
  customer_id                    String
  service_provider_id            String
  property_name                  String
  address                        String
  postcode                       String
  property_type                  String?
  bedrooms                       Int @default(0)
  bathrooms                      Int @default(0)
  access_instructions            String?
  access_code                    String?
  photo_urls                     Json?  // Array of {url, caption, type}
  utility_locations              Json?  // {stopTap, waterMeter, etc}
  emergency_contacts             Json?  // Array of {name, phone, relation}
  cleaner_notes                  String?
  wifi_ssid                      String?
  wifi_password                  String?
  parking_info                   String?
  pet_info                       String?
  special_requirements           String?
  is_active                      Boolean @default(true)
  created_at                     DateTime
  updated_at                     DateTime
}
```

**Schema File**: [packages/database/prisma/schema.prisma:415-454](packages/database/prisma/schema.prisma#L415-L454)

---

## 7. Running the Applications

### API Server
```bash
npm run dev:api          # Port 3001
```

### Cleaning Dashboard (Your Frontend)
```bash
npm run dev:cleaning     # Port 5174
```

### Check Running Services
```bash
# Should see 5 background processes running:
# - Multiple API servers (for hot reload)
# - Cleaning dashboard
```

---

## 8. Development Workflow

### Step 1: Read Context (25 minutes)
Read the files listed in Section 2 above

### Step 2: Implement PM-001 (2-3 hours)
1. Open [apps/web-cleaning/src/pages/AddProperty.tsx](apps/web-cleaning/src/pages/AddProperty.tsx)
2. Replace placeholder with full form implementation
3. Follow patterns from CreateCleaningJob.tsx
4. Implement UK validation
5. Add photo upload placeholder (backend ready)
6. Handle form submission to POST /api/customer-properties

### Step 3: Test PM-001 (30 minutes)
1. Visit http://localhost:5174/properties
2. Click "Add Property" button
3. Fill out form with test data
4. Submit and verify property is created
5. Check property appears in list
6. Visit property details page to confirm data

### Step 4: Implement PM-002 (2-3 hours)
1. Open [apps/web-cleaning/src/pages/EditProperty.tsx](apps/web-cleaning/src/pages/EditProperty.tsx)
2. Copy form from PM-001
3. Add useEffect to load existing property data
4. Pre-fill form fields
5. Change submit to PATCH /api/customer-properties/:id

### Step 5: Test PM-002 (30 minutes)
1. Visit a property details page
2. Click "Edit" button
3. Verify form is pre-filled
4. Make changes and submit
5. Verify changes are saved

### Step 6: Commit and Push
```bash
git add -A
git commit -m "feat: implement property add/edit forms (PM-001, PM-002)

- Implemented Add Property form with multi-section layout
- Implemented Edit Property form with data pre-filling
- Added UK postcode and phone validation
- Integrated with existing customer-properties API
- Photo upload placeholder (ready for backend integration)

Completes Phase 1 of Business Management Sprint (9 points)

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"

git push origin main
```

---

## 9. After PM-001 and PM-002 Are Complete

### Next Phase: Backend Services (Phase 2)
Move to Phase 2 (Days 3-4, 8 points):
1. Create [apps/api/src/services/CleaningInvoiceService.ts](apps/api/src/services)
2. Create [apps/api/src/routes/cleaning-invoices.ts](apps/api/src/routes)
3. Create [apps/api/src/services/CleaningQuoteService.ts](apps/api/src/services)
4. Create [apps/api/src/routes/cleaning-quotes.ts](apps/api/src/routes)

**Reference for Backend Patterns**:
- Look at [apps/api/src/services/InvoiceService.ts](apps/api/src/services/InvoiceService.ts) for maintenance invoices
- Look at [apps/api/src/services/QuotesService.ts](apps/api/src/services/QuotesService.ts) for maintenance quotes
- CleaningInvoice and CleaningQuote models already exist in [packages/database/prisma/schema.prisma](packages/database/prisma/schema.prisma)

---

## 10. Important Notes

### Don't Duplicate Work
- Property Calendar is DONE - [PropertyGuestCalendar.tsx](apps/web-cleaning/src/components/PropertyGuestCalendar.tsx)
- Property Details is DONE - [PropertyDetails.tsx](apps/web-cleaning/src/pages/PropertyDetails.tsx)
- Cleaning Contracts is 90% DONE - [CleaningContracts.tsx](apps/web-cleaning/src/pages/CleaningContracts.tsx)

### Follow Existing Patterns
- Look at how other forms are built (CreateCleaningJob, CreateMaintenanceJob)
- Use existing UI components (Button, Card, Input, Select)
- Follow TypeScript patterns from existing code
- Use useToast for success/error messages

### UK Validation Required
- Postcodes must match UK format
- Phone numbers should be UK format
- Use validation patterns from TECHNICAL-PATTERNS.md

### Commit Often
- Commit after completing each story (PM-001, PM-002)
- Use conventional commit format: `feat:`, `fix:`, `docs:`
- Include story points in commit message
- Always include Claude Code signature

---

## 11. Key Context Files

### Documentation Structure
```
/
├── PROJECT-MAP.md                          ← Single source of truth
├── CURRENT_STATUS.md                       ← Current status
├── START-HERE/
│   ├── BUSINESS-MANAGEMENT-SPRINT-PLAN.md  ← Full sprint plan
│   ├── CODE-REVIEW-FINDINGS.md             ← What exists vs what to build
│   ├── TECHNICAL-PATTERNS.md               ← Code patterns
│   ├── COMPLETE-WORKFLOW-GUIDE.md          ← Workflows
│   └── TESTING-CHECKLIST.md                ← QA checklist
├── stories/phase-3/
│   └── STORY-PM-001-property-management.md ← Current story details
└── .docs/
    ├── sessions/        ← Old session summaries
    ├── completed/       ← Completed implementations
    └── archived-plans/  ← Old plans
```

### Code Locations
```
apps/
├── api/
│   ├── src/
│   │   ├── routes/
│   │   │   └── customer-properties.ts      ← Backend API (exists)
│   │   └── services/
│   │       └── CustomerPropertiesService.ts ← Backend logic (exists)
│   └── uploads/                            ← Photo storage
├── web-cleaning/                           ← YOUR FRONTEND
│   └── src/
│       ├── pages/
│       │   ├── AddProperty.tsx             ← PM-001 (placeholder)
│       │   ├── EditProperty.tsx            ← PM-002 (placeholder)
│       │   ├── PropertyDetails.tsx         ← Reference (complete)
│       │   └── Properties.tsx              ← List view
│       └── components/ui/                  ← UI components
└── packages/
    └── database/
        └── prisma/
            └── schema.prisma               ← Database schema
```

---

## 12. Success Criteria

### PM-001 Complete When:
- [ ] Form has all required sections (Basic, Access, Utility, Additional, Photos)
- [ ] UK postcode validation works
- [ ] Customer dropdown shows all customers
- [ ] Form submits to POST /api/customer-properties
- [ ] Success toast shows after creation
- [ ] User is redirected to property details page
- [ ] New property appears in properties list

### PM-002 Complete When:
- [ ] Form loads with existing property data
- [ ] All fields are pre-filled correctly
- [ ] Utility locations JSON is parsed and displayed
- [ ] Emergency contacts array is parsed and displayed
- [ ] Form submits to PATCH /api/customer-properties/:id
- [ ] Success toast shows after update
- [ ] Changes are visible on property details page

### Phase 1 Complete When:
- [ ] Both PM-001 and PM-002 are complete
- [ ] Code is committed and pushed
- [ ] Properties can be added and edited successfully
- [ ] No console errors
- [ ] All validation works correctly

---

## 13. Quick Commands Reference

```bash
# Start development
npm run dev:api          # Start API server (port 3001)
npm run dev:cleaning     # Start cleaning dashboard (port 5174)

# Database
cd packages/database
npx prisma studio        # Open database GUI
npx prisma db push       # Push schema changes (already done)

# Git workflow
git status               # Check changes
git add -A               # Stage all changes
git commit -m "..."      # Commit with message
git push origin main     # Push to GitHub

# Check running services
ps aux | grep node       # See running node processes
```

---

## 14. Contact Information

**Project**: RightFit Services - Multi-tenant property management platform
**Repository**: https://github.com/Orr0x/RightFit-Services
**Current Branch**: main
**Tech Stack**: React, TypeScript, Node.js, Express, Prisma, PostgreSQL

---

## 15. Your First Action

**Read these 3 files first (15 minutes)**:
1. [PROJECT-MAP.md](PROJECT-MAP.md) - 5 minutes
2. [START-HERE/CODE-REVIEW-FINDINGS.md](START-HERE/CODE-REVIEW-FINDINGS.md) - 10 minutes (skim section 2-3 for PM-001 details)
3. [stories/phase-3/STORY-PM-001-property-management.md](stories/phase-3/STORY-PM-001-property-management.md) - 5 minutes

**Then start implementing**:
1. Open [apps/web-cleaning/src/pages/AddProperty.tsx](apps/web-cleaning/src/pages/AddProperty.tsx)
2. Read current placeholder code (23 lines)
3. Look at [apps/web-cleaning/src/pages/cleaning/CreateCleaningJob.tsx](apps/web-cleaning/src/pages/cleaning/CreateCleaningJob.tsx) for form pattern reference
4. Begin implementing the multi-section property form

---

## 16. Important Reminders

### ✅ DO
- Read CODE-REVIEW-FINDINGS.md - it has all the answers
- Follow existing code patterns from CreateCleaningJob.tsx
- Use UK validation for postcodes and phones
- Commit after completing each story
- Test thoroughly before moving to next story
- Update CURRENT_STATUS.md when completing stories

### ❌ DON'T
- Rebuild Property Calendar (it's done!)
- Rebuild Property Details page (it's done!)
- Skip reading the code review findings
- Commit without testing
- Push broken code
- Forget the Claude Code signature in commits

---

**You have everything you need. The code review is done, documentation is organized, database is ready. Now it's time to build!**

**Start with PM-001 (Add Property Form). Good luck! 🚀**
