# What's Next: Phase 3 Roadmap

**Status:** Phase 2 Complete ✅ | Phase 2.5 Complete ✅ | Phase 3 Quote Workflow Complete ✅ | Cleanup Sprint Complete ✅
**Last Updated:** 2025-11-02 (After Cleanup Sprint 1)

---

## 🎉 Phase 2 Complete!

You've successfully built:

✅ **Customer Property Management**
- Multi-tenant architecture (ServiceProvider, Customer, CustomerProperty)
- Full CRUD API with tenant isolation
- Three-tab property interface (Our Properties | Customer Properties | Shared Properties)
- Integrated into cleaning and maintenance web apps

✅ **Component Library**
- 15+ reusable components (Tabs, Skeleton, ThemeToggle, Badge, etc.)
- TypeScript types throughout
- Dark mode support
- Cross-platform (web + mobile)

---

## 🚨 IMPORTANT: Phase 2.5 Foundations

Before building the full cleaning/maintenance dashboards, we need to implement **two critical wireframes** that serve as the foundation for the customer-facing and guest-facing experiences:

### Phase 2.5A: Customer Portal (Property Manager View)
**Who:** Property managers (like Jane) who use cleaning/maintenance services
**What:** Self-service portal to monitor services, approve quotes, track history
**Why:** This is how customers interact with your platform - essential before building worker dashboards

### Phase 2.5B: Guest AI Dashboard (Guest View)
**Who:** Guests staying at short-term rental properties
**What:** Tablet-based AI assistant for Q&A and issue reporting
**Why:** Reduces calls to property managers, auto-creates maintenance jobs

These two wireframes are **already designed** and documented:
- [wireframes/CUSTOMER_PORTAL_WIREFRAMES.md](wireframes/CUSTOMER_PORTAL_WIREFRAMES.md)
- [wireframes/GUEST_AI_DASHBOARD_WIREFRAMES.md](wireframes/GUEST_AI_DASHBOARD_WIREFRAMES.md)

---

## 🎯 Immediate Next Steps: Phase 2.5A - Customer Portal

**Estimated Duration:** 4-5 days
**Story Points:** 12 points

### What You'll Build:

#### 1. Customer Portal Homepage
**File:** `apps/web-customer/src/pages/CustomerDashboard.tsx`

**Features:**
- Property portfolio overview (grid of customer's properties)
- Action items (quotes awaiting approval, active jobs)
- Service statistics (this month, year-to-date)
- Upcoming services calendar
- Proactive recommendations (preventive maintenance suggestions)

**Database Needed:**
- Uses existing Customer and CustomerProperty tables
- Reads from CleaningJob and MaintenanceJob tables (to be created)
- New: `customer_portal_users` table for authentication
- New: `customer_preferences` table for settings

#### 2. Property Details & Service History
**File:** `apps/web-customer/src/pages/PropertyDetails.tsx`

**Features:**
- Complete service timeline (chronological)
- Cleaning records with photos and checklists
- Maintenance jobs with before/after photos
- Equipment tracking (water heater, HVAC, appliances)
- Service statistics (spending, frequency, ratings)

**Integration:**
- Pulls data from CleaningJob and MaintenanceJob tables
- Links to photo storage
- Shows invoice history

#### 3. Quote Approval Workflow
**File:** `apps/web-customer/src/pages/QuoteApproval.tsx`

**Features:**
- Mobile-optimized quote approval screen
- Transparent pricing breakdown
- One-tap approve + schedule
- Technician info and availability
- Easy communication (call, email, chat)

**Integration:**
- Uses Quote table (to be created in Phase 3)
- Payment gateway integration (Stripe)
- SMS/email notifications

#### 4. Invoices & Financial Tracking
**File:** `apps/web-customer/src/pages/Invoices.tsx`

**Features:**
- Invoice list (filterable, searchable)
- Detailed line items
- Payment status tracking
- Spending analytics
- Tax reports (export CSV/Excel)

**Integration:**
- Invoice table
- Payment transactions
- Auto-pay management

---

## 🤖 Phase 2.5B: Guest AI Dashboard

**Estimated Duration:** 5-6 days
**Story Points:** 15 points

### What You'll Build:

#### 1. Guest Tablet Home Screen
**File:** `apps/guest-tablet/src/pages/GuestHome.tsx`

**Features:**
- Welcome screen with property name
- Two main actions: "Ask a Question" | "Report an Issue"
- Quick help tiles (WiFi, check-out, parking, etc.)
- Emergency contact info always visible

**Technical:**
- Standalone tablet app (React web app optimized for iPad/Android tablets)
- No login required (anonymous sessions)
- Auto-sleep and wake on tap

#### 2. AI Chat Interface (RAG-Powered)
**File:** `apps/guest-tablet/src/pages/AIChat.tsx`

**Features:**
- Conversational AI chat
- RAG knowledge base (property-specific Q&A)
- Suggested quick questions
- Video tutorials for complex topics
- Local recommendations (restaurants, attractions)

**Integration:**
- OpenAI/Claude API for conversational AI
- Vector database (Pinecone/Weaviate) for RAG
- Video hosting (YouTube/Vimeo)
- Google Maps API for directions

**Database:**
- `guest_sessions` table
- `guest_questions` table
- `rag_knowledge_base` table

#### 3. Issue Reporting & AI Triage
**File:** `apps/guest-tablet/src/pages/ReportIssue.tsx`

**Features:**
- 3-step wizard: Category → Description → Photo
- Computer Vision photo analysis
- AI severity scoring (Critical > High > Medium > Low)
- Smart recommendations (DIY vs. send tech)
- Multiple resolution options

**Integration:**
- OpenAI Vision API for photo analysis
- Maintenance Dashboard (auto-create jobs)
- Photo storage

**Database:**
- `guest_issues` table
- `issue_photos` table
- `ai_assessments` table

#### 4. DIY Fix Guides
**File:** `apps/guest-tablet/src/pages/DIYGuide.tsx`

**Features:**
- Step-by-step instructions with photos
- Video tutorials
- Success confirmation feedback
- Easy escalation if DIY doesn't work

**Database:**
- `diy_guides` table
- `diy_attempts` table

#### 5. Live Technician Tracking
**File:** `apps/guest-tablet/src/pages/TechnicianTracking.tsx`

**Features:**
- Auto-dispatch maintenance worker
- Real-time GPS tracking
- Timeline of events
- ETA updates
- Post-service rating

**Integration:**
- Maintenance Dashboard (job creation)
- Worker mobile app (GPS tracking)
- SMS notifications

---

## 📋 Phase 2.5 Implementation Plan

### Part A: Customer Portal (Week 1-2)

**Day 1-2: Database & Auth**
- [ ] Create `customer_portal_users` table
- [ ] Create `customer_preferences` table
- [ ] Implement authentication (OAuth 2.0)
- [ ] Add customer portal routes to API

**Day 3-4: Dashboard Pages**
- [ ] Create `apps/web-customer` (new app)
- [ ] CustomerDashboard.tsx (homepage)
- [ ] PropertyDetails.tsx (service history)
- [ ] Reuse existing components from web-cleaning/web-maintenance

**Day 5: Quote & Invoice Pages**
- [ ] QuoteApproval.tsx
- [ ] Invoices.tsx
- [ ] Financial analytics

**Day 6: Polish & Testing**
- [ ] Mobile responsiveness
- [ ] Loading states
- [ ] Error handling
- [ ] Test with existing customer data

### Part B: Guest AI Dashboard (Week 2-3)

**Day 1-2: Guest Tablet App Setup**
- [ ] Create `apps/guest-tablet` (new standalone app)
- [ ] GuestHome.tsx (welcome screen)
- [ ] Basic navigation
- [ ] Session management (anonymous, auto-reset)

**Day 3-4: AI Chat (RAG)**
- [ ] AIChat.tsx
- [ ] Set up vector database (Pinecone or Weaviate)
- [ ] Populate knowledge base with property data
- [ ] Integrate OpenAI/Claude API
- [ ] Video tutorial embedding

**Day 5-6: Issue Reporting**
- [ ] ReportIssue.tsx (3-step wizard)
- [ ] Photo upload and Computer Vision integration
- [ ] AI triage logic (severity scoring)
- [ ] Create `guest_issues`, `ai_assessments` tables

**Day 7-8: DIY Guides & Dispatch**
- [ ] DIYGuide.tsx
- [ ] TechnicianTracking.tsx
- [ ] Auto-dispatch integration with Maintenance Dashboard
- [ ] Live GPS tracking (prepare for worker mobile app)

**Day 9-10: Knowledge Base & Polish**
- [ ] Property knowledge base (appliances, local recommendations)
- [ ] Testing on actual tablets (iPad/Android)
- [ ] Performance optimization
- [ ] Auto-sleep/wake functionality

---

## 🎯 After Phase 2.5: Full Phase 3

Once Customer Portal and Guest AI Dashboard are complete, you'll move to **STORY-006 Part 2-4**:

### Part 2: Cleaning Services Dashboard (Web)
- CleaningDashboard.tsx
- CleaningJobs CRUD pages
- Worker assignment
- Checklist templates

### Part 3: Maintenance Services Dashboard (Web)
- MaintenanceDashboard.tsx
- MaintenanceJobs CRUD pages
- Quote generation
- Cross-sell workflow

### Part 4: Mobile Worker Apps
- Cleaning worker screens
- Maintenance worker screens
- Offline-first functionality

---

## 🔧 Technical Setup for Phase 2.5

### New Apps to Create:

```bash
# Customer portal web app
mkdir -p apps/web-customer
cd apps/web-customer
# Copy structure from web-cleaning as template

# Guest tablet app
mkdir -p apps/guest-tablet
cd apps/guest-tablet
# Optimized for tablet viewport (1024x768 or 1280x800)
```

### New Database Tables:

```prisma
// Customer Portal
model CustomerPortalUser {
  id             String   @id @default(uuid())
  customer_id    String   @unique
  email          String   @unique
  password_hash  String
  last_login     DateTime?
  theme_preference String @default("light")
  created_at     DateTime @default(now())
  updated_at     DateTime @updatedAt

  customer       Customer @relation(fields: [customer_id], references: [id])
}

model CustomerPreferences {
  id                     String   @id @default(uuid())
  customer_id            String   @unique
  auto_pay_enabled       Boolean  @default(false)
  notification_email     Boolean  @default(true)
  notification_sms       Boolean  @default(false)
  calendar_sync_enabled  Boolean  @default(false)

  customer               Customer @relation(fields: [customer_id], references: [id])
}

// Guest AI Dashboard
model GuestSession {
  id                 String   @id @default(uuid())
  property_id        String
  session_start      DateTime @default(now())
  session_end        DateTime?
  interactions_count Int      @default(0)

  property           CustomerProperty @relation(fields: [property_id], references: [id])
  questions          GuestQuestion[]
  issues             GuestIssue[]
}

model GuestQuestion {
  id              String   @id @default(uuid())
  session_id      String
  question        String
  answer          String
  answered_by     String   // 'AI' or 'human'
  confidence      Float?
  helpful_rating  Int?     // 1-5
  created_at      DateTime @default(now())

  session         GuestSession @relation(fields: [session_id], references: [id])
}

model GuestIssue {
  id                     String   @id @default(uuid())
  session_id             String
  category               String   // 'plumbing', 'electrical', 'hvac', etc.
  description            String
  severity               String   // 'critical', 'high', 'medium', 'low'
  ai_confidence          Float
  photos                 Json?    // Array of photo URLs
  recommended_action     String   // 'diy', 'send_tech', 'notify_manager'
  guest_selected_action  String?
  maintenance_job_id     String?
  resolved_at            DateTime?
  created_at             DateTime @default(now())

  session                GuestSession @relation(fields: [session_id], references: [id])
  assessment             AIAssessment?
  diy_attempts           DIYAttempt[]
}

model AIAssessment {
  id              String   @id @default(uuid())
  issue_id        String   @unique
  diagnosis       String
  confidence      Float
  severity        String
  estimated_cost  Float?
  estimated_time  Int?     // minutes
  created_at      DateTime @default(now())

  issue           GuestIssue @relation(fields: [issue_id], references: [id])
}

model DIYGuide {
  id              String   @id @default(uuid())
  issue_type      String
  title           String
  steps           Json     // Array of step objects
  video_url       String?
  difficulty      String   // 'easy', 'medium', 'hard'
  estimated_time  Int      // minutes
  success_rate    Float?

  attempts        DIYAttempt[]
}

model DIYAttempt {
  id             String   @id @default(uuid())
  issue_id       String
  guide_id       String
  successful     Boolean
  time_spent     Int?     // seconds
  escalated      Boolean  @default(false)
  created_at     DateTime @default(now())

  issue          GuestIssue @relation(fields: [issue_id], references: [id])
  guide          DIYGuide   @relation(fields: [guide_id], references: [id])
}

model PropertyKnowledgeBase {
  id              String   @id @default(uuid())
  property_id     String
  category        String   // 'wifi', 'appliances', 'local_recs', etc.
  title           String
  content         String   @db.Text
  video_url       String?
  embedding       Json?    // Vector for RAG
  view_count      Int      @default(0)
  created_at      DateTime @default(now())
  updated_at      DateTime @updatedAt

  property        CustomerProperty @relation(fields: [property_id], references: [id])
}
```

### API Endpoints to Create:

```typescript
// Customer Portal
POST   /api/customer-portal/auth/login
POST   /api/customer-portal/auth/register
GET    /api/customer-portal/dashboard
GET    /api/customer-portal/properties/:id/history
GET    /api/customer-portal/quotes
PUT    /api/customer-portal/quotes/:id/approve
GET    /api/customer-portal/invoices
GET    /api/customer-portal/spending-analytics

// Guest AI Dashboard
POST   /api/guest/sessions
POST   /api/guest/chat
POST   /api/guest/issues
POST   /api/guest/issues/:id/photos
GET    /api/guest/diy-guides/:issueType
POST   /api/guest/diy-attempts
GET    /api/guest/knowledge-base/:propertyId
POST   /api/guest/dispatch-technician
```

---

## 💡 Key Patterns to Follow

### 1. Tenant Isolation (Still Critical!)
```typescript
// In CustomerPortalService.ts
async getDashboard(customerId: string) {
  // Verify customer belongs to this service provider
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    include: { service_provider: true }
  });

  // Filter all queries by customer's service_provider_id
}
```

### 2. Anonymous Guest Sessions
```typescript
// No authentication for guests
// Session auto-expires after 30 minutes
// All data tied to session_id, not user_id
```

### 3. AI Integration
```typescript
// RAG for Q&A
const embedding = await openai.embeddings.create({
  model: 'text-embedding-ada-002',
  input: question
});

const results = await vectorDB.query({
  vector: embedding,
  topK: 3,
  filter: { property_id: propertyId }
});

// Vision API for photo analysis
const analysis = await openai.chat.completions.create({
  model: 'gpt-4-vision-preview',
  messages: [{
    role: 'user',
    content: [
      { type: 'text', text: 'Analyze this maintenance issue' },
      { type: 'image_url', image_url: photoUrl }
    ]
  }]
});
```

---

## 📚 Reference Documents

**Wireframes:**
- [CUSTOMER_PORTAL_WIREFRAMES.md](wireframes/CUSTOMER_PORTAL_WIREFRAMES.md) - Complete customer portal design
- [GUEST_AI_DASHBOARD_WIREFRAMES.md](wireframes/GUEST_AI_DASHBOARD_WIREFRAMES.md) - Complete guest tablet design

**Code References:**
- Use existing customer/property management patterns
- Reuse all components from web-cleaning/web-maintenance
- Follow authentication patterns from landlord app

**External Services Needed:**
- OpenAI API (for chat and vision)
- Vector database (Pinecone or Weaviate for RAG)
- Payment gateway (Stripe for quote approvals)
- SMS gateway (Twilio for notifications)

---

## ✅ Success Criteria for Phase 2.5

### Customer Portal:
- [ ] Property managers can log in and view their properties
- [ ] Service history displays cleaning and maintenance records
- [ ] Quotes can be approved with one tap (mobile-optimized)
- [ ] Invoices are accessible with spending analytics
- [ ] Works on mobile (60%+ of traffic)

### Guest AI Dashboard:
- [ ] AI chat answers > 70% of questions correctly
- [ ] Issue reporting with photo upload works
- [ ] AI triage recommends appropriate action (DIY vs. tech)
- [ ] DIY guides display with video tutorials
- [ ] Tech dispatch auto-creates maintenance jobs
- [ ] Works perfectly on iPad and Android tablets

---

## 🎉 Phase 2.5 Complete! Phase 3 Quote Workflow Complete! Cleanup Sprint Complete!

**Completed Features:**
- ✅ Customer Portal (all pages built and working)
- ✅ Guest AI Dashboard (all pages built and working)
- ✅ Maintenance quote submission workflow
- ✅ Customer quote approval/decline workflow
- ✅ End-to-end tested: Guest issue → Customer submit → Maintenance quote → Customer approve
- ✅ Cleanup Sprint 1 (17/18 stories = 94%)
- ✅ APP-SEPARATION.md comprehensive documentation
- ✅ All 401 errors eliminated from guest-tablet
- ✅ 27 files deleted from wrong apps

**What This Means:**
The complete quote workflow is now production-ready and tested:
1. Guests can report issues via tablet
2. Customers can submit issues to maintenance providers
3. Maintenance providers can submit quotes with parts/labor breakdown
4. Customers can approve or decline quotes from their portal
5. Jobs automatically update status and move between tabs
6. All multi-tenant data isolation working correctly
7. All apps have proper separation of concerns
8. Build sizes optimized, no dead code

**Phase 3 Status: 62% Complete**

**Immediate Next Priorities (2-3 weeks remaining):**

**Priority 1: Cleaning Job Details & Management (2-3 days)**
- CleaningJobDetails.tsx - View job details page
- CleaningJobForm.tsx - Create/edit cleaning jobs
- Job checklist management
- Basic photo upload

**Priority 2: Worker Assignment System (3-4 days)**
- WorkerAssignment.tsx component
- Worker availability calendar
- Conflict detection
- API endpoints for both cleaning and maintenance

**Priority 3: Job Completion Workflow (2-3 days)**
- Mark jobs complete with photos
- Before/after photo upload to S3
- Customer rating/feedback
- Automatic invoice generation

**Priority 4: Cross-sell & Advanced Features (2-3 days)**
- CrossSellWorkflow.tsx - Suggest maintenance during cleaning
- Invoice generation after job completion
- Calendar view of scheduled jobs

---

## 🚀 Phase 2.5 Was Already Complete!

**Recommended First Steps:**

```bash
# 1. Review the wireframes
code wireframes/CUSTOMER_PORTAL_WIREFRAMES.md
code wireframes/GUEST_AI_DASHBOARD_WIREFRAMES.md

# 2. Create database migration for new tables
cd packages/database
code prisma/schema.prisma
# Add tables from above

npx prisma migrate dev --name add-customer-portal-and-guest-tables
npx prisma generate

# 3. Set up customer portal app
mkdir -p apps/web-customer/src/{pages,components,lib}
cp -r apps/web-cleaning/src/components apps/web-customer/src/
# Reuse existing components!

# 4. Set up guest tablet app
mkdir -p apps/guest-tablet/src/{pages,components,lib}
```

**Questions to Answer Before Starting:**
1. Which AI provider? (OpenAI vs. Claude vs. both)
2. Which vector database? (Pinecone vs. Weaviate vs. self-hosted)
3. Payment gateway preference? (Stripe vs. Square)
4. Which tablets to support? (iPad only vs. iPad + Android)

---

**Good luck building Phase 2.5 - the customer and guest foundations! 🏗️✨**

---

*Last Updated: 2025-11-02*
*Current Phase: Phase 2.5 - Customer Portal & Guest AI Dashboard*
*Project: RightFit Services - Multi-Tenant Service Provider Platform*
