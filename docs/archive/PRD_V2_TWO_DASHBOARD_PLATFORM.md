# Product Requirements Document: RightFit Services Platform V2
## Two-Dashboard Service Provider Platform

**Version:** 2.0
**Date:** 2025-10-31
**Project:** RightFit Services - Dual-Service Platform for Property Service Providers
**Timeline:** Aligned with QUALITY_ROADMAP.md (16-20 weeks to launch)
**Business Model:** Service Provider Platform (B2B2C)

---

## 1. Executive Summary

### 1.1 Vision Statement

**Build the definitive platform for service providers running multiple property service businesses in rural UK markets.**

RightFit Services Platform V2 transforms from a landlord-focused tool into a comprehensive service provider platform enabling operators like Alex Robertson to run two complementary businesses (RightFit Cleaning Services + RightFit Maintenance Services) from a single unified system.

### 1.2 Business Model

**Platform Owner:** Alex Robertson (You)
**Operating Businesses:**
1. **RightFit Cleaning Services** - Short-term let cleaning and turnover services
2. **RightFit Maintenance Services** - Property maintenance, repairs, and emergency callouts

**Revenue Streams:**
- Cleaning contracts (per-turnover or monthly retainer)
- Maintenance contracts (hourly rate, project quotes, or retainer)
- **Cross-sell premium:** 10% discount for customers contracting both services

**Target Market:** Short-term let operators in rural Scotland and Northern England
- Lodge managers
- Holiday home owners
- Cabin rental operators
- Estate managers
- B&B/Guest house owners

### 1.3 Competitive Advantage

**vs. Traditional Cleaning Companies:**
- Integrated maintenance upsell pathway
- Technology-enabled scheduling and tracking
- Photo evidence and quality assurance
- Emergency response capability

**vs. Traditional Maintenance Contractors:**
- Cleaning service as entry point (lower sales friction)
- Bundled service discount (10% off when combining)
- Unified customer dashboard
- Preventive maintenance from cleaner observations

**vs. Software Competitors:**
- Not a SaaS tool—this is YOUR operational platform
- Purpose-built for dual-service provider workflow
- Offline-first for rural UK markets
- AI-powered guest self-service (reduces support calls)

### 1.4 Success Metrics (Business)

**6-Month Targets:**
- 10-15 cleaning contracts signed
- 5-8 maintenance contracts signed
- 40%+ cross-sell rate (customers using both services)
- £8,000-15,000 monthly recurring revenue
- <2% customer churn

**12-Month Targets:**
- 25-35 cleaning contracts
- 15-25 maintenance contracts
- 60%+ cross-sell rate
- £25,000-40,000 monthly recurring revenue
- 8+ employees (4 cleaners, 3 maintenance workers, 1 admin)

---

## 2. User Personas (6 Detailed Personas)

### 2.1 Alex Robertson (You) - Service Provider Owner

**Role:** Owner/Operator of RightFit Cleaning + RightFit Maintenance
**Age:** 35
**Location:** Scottish Highlands
**Tech Savviness:** High

**Daily Activities:**
- Managing 2-4 cleaners and 2-3 maintenance workers
- Quoting new jobs (cleaning contracts, maintenance projects)
- Scheduling employee assignments
- Quality control (reviewing cleaner photos, maintenance completion)
- Customer relationship management
- Invoicing and financial tracking
- Emergency response coordination

**Pain Points:**
- **Context switching** between cleaning and maintenance workflows
- **Cross-sell coordination** - cleaner finds issue, needs to create maintenance quote
- **Resource allocation** - which worker for which job?
- **Quality assurance** - ensuring standards met without on-site presence
- **Emergency triage** - determining if call is urgent or can wait

**Jobs to Be Done:**
1. "When a cleaner reports a maintenance issue during turnover, I need to immediately create a quote and notify the lodge manager, so I don't lose the upsell opportunity."
2. "When scheduling weekly jobs, I need to see both cleaning and maintenance calendars together, so I can optimize routes and resource allocation."
3. "When a guest reports an emergency (heating failure), I need to triage severity and dispatch appropriate worker within 30 minutes, even if I'm on another job site."

**Dashboard Needs:**
- Unified calendar (cleaning + maintenance jobs)
- Real-time job status updates
- Photo review and approval workflow
- Quote generation and approval tracking
- Employee performance metrics
- Customer health scores (payment, satisfaction, cross-sell potential)

---

### 2.2 Sarah Morrison - Cleaner (Employee)

**Role:** RightFit Cleaning Services Employee
**Age:** 28
**Location:** Fort William
**Tech Savviness:** Medium
**Employment:** Part-time, 20-25 hours/week

**Daily Activities:**
- Turnover cleaning for 3-5 properties per day
- Photo documentation (before/after, issues found)
- Checklist completion (beds made, supplies stocked, etc.)
- Reporting maintenance issues
- Time tracking (arrival, departure)

**Pain Points:**
- **Unreliable signal** in rural properties (needs offline mode)
- **Checklist fatigue** - different requirements for each property
- **Issue reporting** - how to communicate non-urgent problems?
- **Photo management** - taking 20+ photos per property, slow uploads
- **Schedule changes** - last-minute guest booking extensions

**Jobs to Be Done:**
1. "When I start a cleaning job, I need to access the property-specific checklist offline, so I don't miss any owner requirements even in zero-signal areas."
2. "When I find a maintenance issue (broken shower head, chipped tile), I need to quickly report it with a photo, so Alex can quote the repair to the owner."
3. "When I finish a turnover, I need to upload before/after photos as proof of completion, so the owner knows the property is ready for the next guest."

**Mobile App Needs:**
- **Offline-first checklist access**
- **Quick photo capture** (batch upload when signal available)
- **Simple issue reporting** (pre-defined categories + photo)
- **Today's schedule** (properties, times, access codes)
- **Minimal data entry** (swipe to complete, voice notes)

---

### 2.3 Mike Thompson - Maintenance Worker (Employee)

**Role:** RightFit Maintenance Services Employee
**Age:** 42
**Location:** Inverness
**Tech Savviness:** Low
**Employment:** Full-time, 40 hours/week

**Daily Activities:**
- Scheduled maintenance visits (boiler servicing, gutter cleaning)
- Emergency callouts (heating failures, plumbing leaks)
- Property inspections (pre-winter checks)
- Parts ordering and inventory management
- Photo documentation of work completed
- Time tracking for invoicing

**Pain Points:**
- **Not tech-savvy** - needs dead-simple interface
- **Paper-based habits** - used to written work orders
- **Parts tracking** - what parts are in the van vs. need to order?
- **Emergency interruptions** - scheduled job interrupted by emergency
- **Customer communication** - owners want updates, Mike isn't chatty

**Jobs to Be Done:**
1. "When I arrive at a job site, I need to see exactly what the issue is with photos from the cleaner, so I bring the right tools and parts."
2. "When I complete a repair, I need to take a quick photo and mark the job done, so Alex can invoice immediately and I don't have end-of-day admin."
3. "When I can't fix an issue (requires specialist), I need to flag it for Alex to call an external contractor, so I can move to the next job."

**Mobile App Needs:**
- **Large buttons, minimal text**
- **Photo-first work orders** (see issue before reading description)
- **One-tap status updates** ("Started", "Completed", "Need Help")
- **Voice notes** (easier than typing)
- **Offline job queue** (view next 3 jobs without signal)

---

### 2.4 Highland Heating Ltd - External Contractor (Partner)

**Role:** Specialist contractor for jobs outside RightFit's capabilities
**Age:** 52 (Owner: John MacLeod)
**Location:** Ullapool
**Services:** Gas Safe boiler installs, HVAC, commercial heating

**Business Relationship:**
- **Referred jobs** from RightFit when customer needs specialist work
- **Commission model** (10% referral fee to RightFit) OR **fixed partnership rate**
- **Emergency callout partner** for out-of-hours Gas Safe emergencies

**Pain Points:**
- **Quote requests** come via phone call or text (no paper trail)
- **Job details unclear** - arrives on-site to find different issue
- **Payment delays** - invoices RightFit, waits for customer payment
- **Last-minute cancellations** - wastes drive time to remote locations

**Jobs to Be Done:**
1. "When RightFit refers a job, I need detailed scope and photos upfront, so I can quote accurately without a site visit."
2. "When a job is approved, I need confirmation and customer details, so I can schedule and order parts in advance."
3. "When I complete work, I need to submit photos and invoice to RightFit in one place, so I get paid faster."

**Portal Needs (Future Phase):**
- **Job referral notifications** (SMS or WhatsApp)
- **Job details + photos** (view in browser, no app required)
- **Quote submission form**
- **Invoice upload + tracking**
- **Payment status visibility**

---

### 2.5 Emma Henderson - Lodge Manager (Customer)

**Role:** Property Manager for Highland Haven Lodges (12 cabins)
**Age:** 47
**Location:** Cairngorms
**Properties:** 12 luxury lodges (4-6 bed each)
**Booking Platform:** Airbnb, Booking.com, direct bookings

**Current Contracts:**
- **Cleaning:** RightFit (£45/turnover, 8-12 turnovers/week)
- **Maintenance:** Not contracted—ad-hoc callouts to various tradespeople

**Pain Points:**
- **Coordination overhead** - managing 5 different tradespeople's phone numbers
- **Emergency response** - who do I call at 10pm when heating fails?
- **Quality inconsistency** - cleaning standards vary between cleaners
- **Cost unpredictability** - maintenance bills vary wildly month-to-month
- **Lack of visibility** - is the property actually ready for guest check-in?

**Jobs to Be Done:**
1. "When a guest is checking in at 4pm, I need confirmation the cleaning is done by 2pm, so I don't have angry guests arriving to an uncleaned property."
2. "When I get a maintenance quote from Alex, I need to see photos of the issue and compare to alternative quotes, so I can approve or negotiate confidently."
3. "When I have multiple lodges needing work, I need to prioritize which are urgent vs. can wait, so I don't overspend in slow season."

**Dashboard Needs:**
- **Property status overview** (cleaned, maintenance due, issues pending)
- **Quote approval workflow** (see photo, approve/decline, suggest changes)
- **Scheduled maintenance calendar** (when is each lodge getting serviced?)
- **Invoice history** (total spend per property per month)
- **Emergency contact** (one-click call Alex for urgent issues)

**Cross-Sell Opportunity:**
- **Current state:** Pays £45/turnover * 50 turnovers/month = £2,250/month cleaning only
- **Cross-sell pitch:** Add £500/month maintenance retainer (preventive maintenance + 10% discount on repairs) = £2,750/month total
- **Value proposition:** Single point of contact, faster emergency response, bundled discount

---

### 2.6 Guest (End User) - Staying at Property

**Role:** Short-term rental guest staying at Highland Haven Lodge
**Age:** 25-65 (wide range)
**Tech Savviness:** Medium
**Stay Duration:** 3-7 nights

**Interaction Points:**
- **Check-in:** Find QR code on kitchen counter with "Report Issues" link
- **During stay:** Notice minor issue (dim lightbulb, low dishwasher tablets)
- **Emergency:** Major issue (heating failure, water leak)

**Pain Points:**
- **Host unavailable** - Emma doesn't answer phone (9pm on Saturday)
- **WhatsApp overwhelm** - sending photos/messages to host feels intrusive
- **Issue severity unclear** - is a dripping tap an emergency?
- **No feedback loop** - reported issue, no idea if/when it's being fixed

**Jobs to Be Done:**
1. "When I notice a minor issue (lightbulb out), I need a simple way to report it without calling the host, so I'm being helpful without being demanding."
2. "When I have an emergency (no hot water), I need to know if help is coming and when, so I can decide whether to stay or find alternative accommodation."
3. "When I have a question (how to work the wood stove), I need instant answers without bothering the host, so I can enjoy my stay without stress."

**Guest Tablet/Portal Needs:**
- **AI-powered Q&A** (RAG system with property-specific guide)
  - "How do I work the heating?"
  - "Where is the spare toilet paper?"
  - "What time is checkout?"
- **Issue reporting form** (photo upload + severity selection)
  - "Urgent" → Immediate SMS to Alex + Emma
  - "Minor" → Logged for next cleaning visit
- **Issue status tracking** ("Maintenance scheduled for today at 2pm")
- **Local recommendations** (restaurants, activities—upsell for Emma)

**AI Vision Integration:**
- **Photo triage:** Guest uploads photo → AI classifies severity
  - Leak/water damage → URGENT
  - Broken furniture → HIGH priority
  - Burned-out lightbulb → LOW priority
- **Auto-routing:** Urgent issues create immediate work order for Mike

---

## 3. Core Workflows (4 Complete Workflows)

### 3.1 Cleaning Turnover Workflow

**Trigger:** Guest checks out, next guest checking in same day or next day

**Actors:** Emma (Lodge Manager), Sarah (Cleaner), Alex (Owner)

**Steps:**

1. **Booking confirmed (Emma's system → RightFit API)**
   - Emma uses Airbnb/Booking.com with calendar sync
   - RightFit API polls Emma's calendar (iCal feed) or receives webhook
   - System auto-creates cleaning job for checkout day
   - Notification sent to Sarah's mobile app ("New cleaning job: Lodge 7, checkout 11am, clean by 2pm")

2. **Sarah arrives on-site (11:30am)**
   - Opens RightFit mobile app (offline mode)
   - Sees checklist for Lodge 7 (Emma's custom requirements)
   - Takes "before" photos (documenting any damage left by guest)
   - Starts checklist: Bedrooms (4), Bathrooms (2), Kitchen, Living Area

3. **Issue found: Broken shower head in Master Bath**
   - Sarah takes photo of broken shower head
   - Taps "Report Maintenance Issue" button
   - Selects category: "Plumbing"
   - Adds note: "Shower head cracked, water spraying sideways"
   - Submits (queued for upload when signal available)

4. **Cleaning completed (1:45pm)**
   - Sarah completes checklist (swipe right on each item)
   - Takes "after" photos (beds made, kitchen spotless, etc.)
   - Marks job as "Completed"
   - Drives to next property (app uploads photos automatically when signal returns)

5. **Alex reviews and quotes maintenance (2:00pm)**
   - Gets notification: "Maintenance issue reported at Lodge 7"
   - Opens dashboard, sees photo of broken shower head
   - Creates quote for Emma:
     - Parts: £25 (replacement shower head)
     - Labor: 1 hour @ £45 = £45
     - **Total: £70**
   - Adds note: "Can fix today, property ready by 5pm"
   - Sends quote to Emma via app

6. **Emma approves quote (2:15pm)**
   - Gets email/SMS notification: "Quote ready for review"
   - Opens customer portal, sees photo + quote breakdown
   - Clicks "Approve"
   - System notifies Alex + creates work order for Mike

7. **Mike completes repair (3:30pm)**
   - Receives work order on mobile app
   - Arrives at Lodge 7, replaces shower head
   - Takes "after" photo showing working shower
   - Marks job "Completed"
   - Alex gets notification, invoices Emma

**Offline Mode Checkpoints:**
- Sarah's checklist loads offline (synced previous night)
- Photos queue for upload (auto-sync when signal available)
- Issue report queued offline (submitted when connected)

**Cross-Sell Success:** Cleaning visit identified £70 maintenance upsell. Over 50 turnovers/month, avg 2 issues/month = £140/month incremental revenue.

---

### 3.2 Emergency Maintenance Workflow

**Trigger:** Guest reports heating failure (January, -5°C outside)

**Actors:** Guest (Mark), Emma (Lodge Manager), Alex (Owner), Mike or External Contractor

**Steps:**

1. **Guest discovers issue (Saturday 9pm)**
   - Mark tries heating—no hot air
   - Scans QR code on kitchen counter → Opens guest portal
   - Taps "Report Issue"
   - AI prompts: "What type of issue?" → "Heating/Hot Water"
   - AI asks: "Is the property cold right now?" → "Yes"
   - AI escalates: "This sounds urgent. We're notifying emergency support."
   - Mark uploads photo of thermostat (showing 12°C)
   - Submits report

2. **AI triages issue (9:01pm)**
   - Vision AI analyzes photo: Thermostat showing low temp ✓
   - Keyword analysis: "heating", "cold", "not working" → HIGH severity
   - Timestamp: Evening + winter + occupied property → URGENT
   - AI decision: Create URGENT work order + notify Alex and Emma immediately

3. **Alex receives alert (9:02pm)**
   - SMS: "🚨 URGENT: Heating failure at Lodge 7, guest on-site, temp 12°C"
   - Opens app, sees guest photo + AI summary
   - Checks Mike's availability → Off duty
   - Checks external contractors → Highland Heating (Gas Safe certified)
   - Calls John MacLeod (Highland Heating): "Can you attend emergency callout?"
   - John: "Can be there in 45 minutes, £120 callout fee"
   - Alex: "Approved, I'll send details"

4. **Alex dispatches contractor (9:10pm)**
   - Creates work order, assigns to Highland Heating
   - Sends job details via WhatsApp to John:
     - Address + access code
     - Guest name + phone (Mark)
     - Photo of thermostat
     - Issue description: "Boiler not firing, guest reporting no heat"
   - Notifies Emma (property owner): "Emergency callout dispatched, contractor ETA 10pm"
   - Notifies guest (Mark): "Help is on the way! Contractor arriving ~10pm. If too cold, we'll arrange alternative accommodation."

5. **Contractor arrives and diagnoses (10pm)**
   - John arrives, meets Mark
   - Diagnoses: Boiler pilot light out (simple fix)
   - Relights pilot, tests heating → working
   - Takes photo of working boiler (flame visible)
   - Texts Alex: "Fixed. Pilot light issue. Heating restored. £120 callout."
   - Alex replies: "Thanks. Invoice RightFit, I'll bill customer."

6. **Issue resolved (10:20pm)**
   - Alex marks work order "Completed"
   - Notifies Mark (guest): "Heating is fixed! If any issues, call this number."
   - Notifies Emma: "Resolved. Boiler pilot light was out. Total cost £120. Invoice sent."
   - Creates invoice for Emma: £120 + £20 coordination fee = **£140 total**

7. **Follow-up (next day)**
   - Alex schedules preventive maintenance: "Lodge 7 boiler needs annual service"
   - Calls Emma: "This could have been prevented with our £500/month maintenance retainer—includes annual boiler servicing for all 12 lodges."
   - **Cross-sell opportunity identified**

**AI Integration Points:**
- **Guest report triaging** (severity classification based on photo + keywords)
- **Auto-escalation** (evening + winter + occupied = URGENT)
- **Contractor matching** (Gas Safe required → Highland Heating)
- **Predictive maintenance** (boiler age + incident history → recommend annual service)

---

### 3.3 Cross-Sell Workflow (Cleaner finds issue → Maintenance upsell)

**Trigger:** Sarah (Cleaner) finds maintenance issue during routine turnover

**Actors:** Sarah (Cleaner), Alex (Owner), Emma (Lodge Manager), Mike (Maintenance Worker)

**Goal:** Convert routine cleaning visit into maintenance contract upsell

**Steps:**

1. **Sarah finds issue during cleaning (Lodge 3)**
   - While cleaning gutters (part of deep clean checklist)
   - Notices: Gutter downpipe disconnected, water pooling near foundation
   - Takes photo of disconnected pipe
   - Reports via app:
     - Category: "Exterior Maintenance"
     - Severity: "Medium" (not emergency, but will cause foundation damage if ignored)
     - Note: "Downpipe disconnected at rear corner, water pooling"
   - Submits and continues cleaning

2. **Alex reviews issue (within 2 hours)**
   - Dashboard notification: "Maintenance issue reported at Lodge 3"
   - Opens photo, assesses severity
   - Recognizes pattern: "Emma has 12 lodges, several are 15+ years old, likely more gutter issues"
   - **Strategic decision:** Instead of quoting one-off repair, pitch preventive maintenance contract

3. **Alex creates comprehensive quote**
   - **Option A: One-off repair** (status quo)
     - Fix Lodge 3 downpipe: £85
   - **Option B: Preventive maintenance contract** (RECOMMENDED)
     - Monthly retainer: £500/month
     - Includes:
       - Bi-annual gutter cleaning (all 12 lodges)
       - Quarterly property inspections (all lodges)
       - Minor repairs included (up to 2 hours labor/month)
       - 10% discount on major repairs
       - Priority emergency response
     - **Fix Lodge 3 downpipe included in first month**
   - Email to Emma with subject: "Lodge 3 Gutter Issue + Preventive Maintenance Proposal"

4. **Emma considers options**
   - Sees photo of pooling water (concerning)
   - Reviews Option A vs B
   - Calculates current ad-hoc maintenance spend: ~£800/month (variable)
   - Recognizes value: £500/month fixed + peace of mind + bundled discount
   - Questions: "What's included in quarterly inspections?"
   - Alex replies via app messaging: "Roof, gutters, boiler check, appliances, plumbing, smoke alarms, outdoor maintenance"

5. **Emma approves Option B (3 days later)**
   - Clicks "Approve Option B" in customer portal
   - System creates monthly recurring service contract
   - Alex gets notification + calendar auto-populates quarterly inspection schedule
   - **Contract value: £500/month × 12 months = £6,000/year**

6. **Mike completes initial inspection (Week 1)**
   - Fixes Lodge 3 downpipe (included)
   - Conducts inspections on all 12 lodges
   - Finds 8 minor issues (loose tiles, worn weatherstripping, etc.)
   - Creates quote for additional repairs: £450
   - Emma approves (pays 10% less due to maintenance contract discount)

7. **Long-term relationship deepens**
   - Month 3: Alex proposes bundling cleaning + maintenance for 15% total discount
   - Emma agrees: **£2,250 cleaning + £500 maintenance = £2,750/month** (was £2,200 previously spending on ad-hoc cleaning + variable maintenance)
   - **Total contract value: £33,000/year**

**Cross-Sell Success Metrics:**
- **Conversion rate:** Maintenance issues found during cleaning → Quote sent (target: 90%)
- **Quote-to-contract conversion:** Quotes sent → Contract signed (target: 30%)
- **Upsell value:** Average contract value increase (target: +40%)

---

### 3.4 Guest Issue Reporting Workflow (AI-Powered Tablet)

**Trigger:** Guest finds issue during stay

**Actors:** Guest, AI System, Alex (Owner), Emma (Lodge Manager)

**Physical Setup:**
- iPad mounted in kitchen with "Report Issues or Ask Questions" home screen
- QR code sticker on fridge linking to same portal (for guests using own phone)

**Steps:**

1. **Guest opens portal**
   - Taps "Report Issue" button
   - OR Taps "Ask a Question" button (AI chatbot)

**Path A: Ask a Question (AI RAG System)**

2. **Guest asks question**
   - Types or speaks: "How do I turn on the hot tub?"
   - AI (RAG system) searches property-specific guide:
     - Emma's uploaded property manual (PDF)
     - Previous guest Q&A history
     - Generic holiday property FAQs
   - AI responds (within 2 seconds):
     ```
     The hot tub controls are located on the deck, inside the wooden panel
     marked "Hot Tub Controls". Here's how to turn it on:

     1. Open the wooden panel
     2. Press the green "Power" button
     3. Set temperature to 38-40°C using +/- buttons
     4. It takes 2-3 hours to heat up

     ⚠️ Safety reminder: Maximum 4 people, no glass containers, children
     must be supervised.

     Enjoy! Is there anything else I can help with?
     ```
   - Guest: "No thanks!" (Issue resolved, no human intervention needed)

**Path B: Report Issue (Vision AI Triage)**

2. **Guest reports issue**
   - Taps "Report Issue"
   - System prompts: "What type of issue?"
     - Heating/Hot Water
     - Plumbing (sink, shower, toilet)
     - Appliances (oven, dishwasher, etc.)
     - Electronics (WiFi, TV)
     - Furniture/Fixtures
     - Outdoor/Deck
     - Other
   - Guest selects: "Plumbing"

3. **Guest uploads photo (optional but encouraged)**
   - System prompts: "A photo helps us fix the issue faster. Can you take a picture?"
   - Guest takes photo of dripping bathroom faucet
   - Uploads photo

4. **AI Vision analyzes photo**
   - Vision AI detects:
     - Water visible ✓
     - Faucet/sink area ✓
     - No flooding ✗
     - No major water damage ✗
   - AI classification:
     - **Severity: LOW** (dripping faucet, annoying but not emergency)
     - **Category: Plumbing**
     - **Recommended action: Log for next visit, not urgent**
   - AI asks guest: "Is this affecting your stay? (e.g., Can you still use the sink?)"
   - Guest responds: "Yes, it's just dripping slowly."
   - AI: "Thanks! We've logged this for repair. It won't affect your stay, but we'll fix it soon. Is there anything else?"
   - Guest: "No, thanks."

5. **System routes issue appropriately**
   - LOW severity + occupied property + guest confirms no impact = **Log for next cleaning visit**
   - Creates task for Sarah (cleaner): "Check bathroom faucet at Lodge 5, guest reported drip"
   - Does NOT wake up Alex at midnight
   - Does NOT send urgent notification to Emma

6. **Sarah addresses on next visit (3 days later)**
   - Sees task in cleaning checklist
   - Tightens faucet handle (5-minute fix, no parts needed)
   - Marks task complete
   - Takes photo: "Faucet tightened, no longer dripping"
   - System notifies Emma: "Guest-reported issue resolved during last cleaning"

**Contrast: URGENT Issue (Vision AI escalation)**

Alternate Step 3: **Guest uploads photo of flooding bathroom**
- Vision AI detects:
  - Large water pool ✓
  - Wet floor ✓
  - Water actively flowing ✓
- AI classification:
  - **Severity: URGENT**
  - **Category: Plumbing Emergency**
  - **Recommended action: Immediate dispatch**
- AI immediately:
  - Sends SMS to Alex: "🚨 URGENT: Flooding at Lodge 5, guest on-site"
  - Sends SMS to Emma: "Emergency plumbing issue at Lodge 5, contractor dispatched"
  - Creates URGENT work order
  - Instructs guest: "Help is on the way! Turn off water if possible (valve under sink). Contractor will call you within 15 minutes."

**AI Benefits:**
- **Reduces support calls:** 60-80% of guest questions answered by AI (no human intervention)
- **Triage accuracy:** 95%+ correct severity classification
- **Response time:** Urgent issues escalated within seconds
- **Guest satisfaction:** Instant answers vs. waiting for host to respond

---

## 4. Database Schema

### 4.1 Core Entities

#### ServiceProvider (Multi-tenancy root)
```
ServiceProvider {
  id: UUID (primary key)
  business_name: String ("RightFit Services")
  owner_name: String ("Alex Robertson")
  email: String
  phone: String
  address: String
  created_at: DateTime
  updated_at: DateTime

  // Relationships
  services: Service[] (one-to-many)
  workers: Worker[] (one-to-many)
  customers: Customer[] (one-to-many)
  external_contractors: ExternalContractor[] (one-to-many)
}
```

#### Service (Cleaning vs. Maintenance)
```
Service {
  id: UUID
  service_provider_id: UUID (foreign key)
  service_type: Enum ("CLEANING", "MAINTENANCE")
  name: String ("RightFit Cleaning Services")
  description: Text
  pricing_model: Enum ("PER_JOB", "HOURLY", "RETAINER", "CUSTOM")
  default_rate: Decimal (£45.00 per turnover, £45/hour, etc.)
  is_active: Boolean
  created_at: DateTime

  // Relationships
  jobs: Job[] (one-to-many - CleaningJob or MaintenanceJob)
}
```

#### Customer (Lodge Manager, Property Owner)
```
Customer {
  id: UUID
  service_provider_id: UUID (foreign key)
  business_name: String ("Highland Haven Lodges")
  contact_name: String ("Emma Henderson")
  email: String
  phone: String
  address: String
  customer_type: Enum ("PROPERTY_MANAGER", "OWNER", "LETTING_AGENCY")

  // Contract details
  has_cleaning_contract: Boolean
  has_maintenance_contract: Boolean
  bundled_discount_percentage: Decimal (10.0 for both services)
  payment_terms: Enum ("NET_7", "NET_14", "NET_30")

  // Health scores
  payment_reliability_score: Integer (1-100)
  satisfaction_score: Integer (1-5)
  cross_sell_potential: Enum ("HIGH", "MEDIUM", "LOW")

  created_at: DateTime
  updated_at: DateTime

  // Relationships
  properties: Property[] (one-to-many)
  invoices: Invoice[] (one-to-many)
  quotes: Quote[] (one-to-many)
}
```

#### Property (Lodge, Cabin, Holiday Home)
```
Property {
  id: UUID
  customer_id: UUID (foreign key)
  property_name: String ("Lodge 7")
  address: String
  postcode: String
  property_type: Enum ("LODGE", "CABIN", "COTTAGE", "APARTMENT", "HOUSE")
  bedrooms: Integer
  bathrooms: Integer

  // Access details
  access_instructions: Text ("Lockbox code: 1234, spare key under mat")
  access_code: String (encrypted)

  // Property-specific settings
  cleaning_checklist_template_id: UUID (foreign key)
  guest_portal_enabled: Boolean
  guest_portal_qr_code_url: String

  // Status
  is_active: Boolean
  created_at: DateTime
  updated_at: DateTime

  // Relationships
  cleaning_jobs: CleaningJob[] (one-to-many)
  maintenance_jobs: MaintenanceJob[] (one-to-many)
  guest_issue_reports: GuestIssueReport[] (one-to-many)
}
```

#### Worker (Cleaner, Maintenance Worker)
```
Worker {
  id: UUID
  service_provider_id: UUID (foreign key)
  user_id: UUID (foreign key to User for auth)

  first_name: String ("Sarah")
  last_name: String ("Morrison")
  email: String
  phone: String

  worker_type: Enum ("CLEANER", "MAINTENANCE", "BOTH")
  employment_type: Enum ("FULL_TIME", "PART_TIME", "CONTRACTOR")
  hourly_rate: Decimal (internal tracking)

  // Availability
  is_active: Boolean
  max_weekly_hours: Integer (25)

  // Performance
  jobs_completed: Integer
  average_rating: Decimal (1.0-5.0)

  created_at: DateTime
  updated_at: DateTime

  // Relationships
  assigned_jobs: Job[] (one-to-many)
}
```

#### ExternalContractor (Highland Heating Ltd)
```
ExternalContractor {
  id: UUID
  service_provider_id: UUID (foreign key)

  company_name: String ("Highland Heating Ltd")
  contact_name: String ("John MacLeod")
  email: String
  phone: String

  specialties: String[] (["GAS_SAFE", "BOILER_INSTALL", "HVAC"])
  certifications: String[] (["Gas Safe Register: 123456"])

  // Partnership terms
  referral_fee_percentage: Decimal (10.0 = 10% referral fee)
  preferred_contractor: Boolean
  emergency_callout_available: Boolean

  // Performance
  jobs_completed: Integer
  average_response_time_hours: Decimal
  average_rating: Decimal (1.0-5.0)

  created_at: DateTime

  // Relationships
  assigned_jobs: MaintenanceJob[] (one-to-many)
}
```

### 4.2 Job Entities

#### CleaningJob
```
CleaningJob {
  id: UUID
  service_id: UUID (foreign key to Service)
  property_id: UUID (foreign key)
  customer_id: UUID (foreign key)
  assigned_worker_id: UUID (foreign key to Worker, nullable)

  // Scheduling
  scheduled_date: Date
  scheduled_start_time: Time (e.g., "11:00")
  scheduled_end_time: Time (e.g., "14:00")

  // Actual times (tracked by worker)
  actual_start_time: DateTime (nullable)
  actual_end_time: DateTime (nullable)

  // Checklist
  checklist_template_id: UUID (foreign key)
  checklist_items: JSON (dynamic based on property)
  checklist_completed_items: Integer
  checklist_total_items: Integer

  // Status
  status: Enum ("SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED")
  completion_notes: Text

  // Photos
  before_photos: String[] (S3 URLs)
  after_photos: String[] (S3 URLs)
  issue_photos: String[] (S3 URLs - if maintenance issues found)

  // Pricing
  pricing_type: Enum ("PER_TURNOVER", "HOURLY", "FIXED")
  quoted_price: Decimal
  actual_price: Decimal (if different from quote)

  // Maintenance upsell tracking
  maintenance_issues_found: Integer
  maintenance_quotes_generated: Integer

  created_at: DateTime
  updated_at: DateTime

  // Relationships
  maintenance_issues: MaintenanceIssue[] (one-to-many)
}
```

#### MaintenanceJob
```
MaintenanceJob {
  id: UUID
  service_id: UUID (foreign key to Service)
  property_id: UUID (foreign key)
  customer_id: UUID (foreign key)
  assigned_worker_id: UUID (foreign key to Worker, nullable)
  assigned_contractor_id: UUID (foreign key to ExternalContractor, nullable)

  // Source tracking
  source: Enum ("CUSTOMER_REQUEST", "CLEANER_REPORT", "GUEST_REPORT", "PREVENTIVE_MAINTENANCE", "EMERGENCY")
  source_cleaning_job_id: UUID (nullable - if originated from cleaning visit)
  source_guest_report_id: UUID (nullable - if guest reported)

  // Issue details
  category: Enum ("PLUMBING", "ELECTRICAL", "HVAC", "APPLIANCE", "STRUCTURAL", "EXTERIOR", "OTHER")
  priority: Enum ("URGENT", "HIGH", "MEDIUM", "LOW")
  title: String ("Fix broken shower head")
  description: Text

  // Scheduling
  requested_date: Date (nullable)
  scheduled_date: Date (nullable)
  completed_date: Date (nullable)

  // Status
  status: Enum ("QUOTE_PENDING", "QUOTE_SENT", "APPROVED", "SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED")

  // Quote/Invoice
  quote_id: UUID (foreign key to Quote, nullable)
  estimated_hours: Decimal
  estimated_parts_cost: Decimal
  estimated_labor_cost: Decimal
  estimated_total: Decimal
  actual_total: Decimal (nullable - after job completion)

  // Photos
  issue_photos: String[] (S3 URLs - before photos)
  work_in_progress_photos: String[] (S3 URLs)
  completion_photos: String[] (S3 URLs - after photos)

  // AI fields
  ai_severity_score: Integer (1-100, from Vision AI)
  ai_category_confidence: Decimal (0.0-1.0)

  // Completion
  completion_notes: Text
  customer_satisfaction_rating: Integer (1-5, nullable)

  created_at: DateTime
  updated_at: DateTime
}
```

#### Quote
```
Quote {
  id: UUID
  customer_id: UUID (foreign key)
  maintenance_job_id: UUID (foreign key, nullable)

  quote_number: String ("Q-2025-001")
  quote_date: Date
  valid_until_date: Date (30 days default)

  // Line items
  line_items: JSON [
    {
      description: "Replace shower head",
      quantity: 1,
      unit_price: 25.00,
      total: 25.00
    },
    {
      description: "Labor (1 hour)",
      quantity: 1,
      unit_price: 45.00,
      total: 45.00
    }
  ]

  subtotal: Decimal (70.00)
  discount_percentage: Decimal (10.0 if bundled customer)
  discount_amount: Decimal (7.00)
  total: Decimal (63.00)

  status: Enum ("DRAFT", "SENT", "APPROVED", "DECLINED", "EXPIRED")

  // Customer response
  customer_response: Text (nullable - if declined, why?)
  approved_at: DateTime (nullable)
  approved_by: String (nullable - "Emma Henderson")

  created_at: DateTime
  updated_at: DateTime

  // Relationships
  invoice: Invoice (one-to-one, nullable - created after job completion)
}
```

#### ChecklistTemplate
```
ChecklistTemplate {
  id: UUID
  service_provider_id: UUID (foreign key)
  customer_id: UUID (foreign key, nullable - if customer-specific)

  template_name: String ("Standard Lodge Turnover")
  property_type: Enum ("LODGE", "CABIN", "COTTAGE", etc.)

  // Checklist structure
  sections: JSON [
    {
      section_name: "Bedrooms",
      items: [
        { item: "Strip beds and wash linens", required: true },
        { item: "Make beds with fresh linens", required: true },
        { item: "Vacuum floors", required: true },
        { item: "Dust surfaces", required: true }
      ]
    },
    {
      section_name: "Kitchen",
      items: [
        { item: "Empty dishwasher", required: true },
        { item: "Wipe countertops", required: true },
        { item: "Restock dishwasher tablets (min 6)", required: true }
      ]
    }
  ]

  estimated_duration_minutes: Integer (120)

  is_active: Boolean
  created_at: DateTime
  updated_at: DateTime
}
```

### 4.3 Guest Interaction Entities

#### GuestIssueReport
```
GuestIssueReport {
  id: UUID
  property_id: UUID (foreign key)

  // Guest details (optional)
  guest_name: String (nullable)
  guest_phone: String (nullable)
  guest_email: String (nullable)

  // Issue details
  issue_type: Enum ("HEATING", "PLUMBING", "APPLIANCE", "ELECTRONICS", "FURNITURE", "OUTDOOR", "OTHER")
  issue_description: Text

  // AI analysis
  photos: String[] (S3 URLs)
  ai_severity: Enum ("URGENT", "HIGH", "MEDIUM", "LOW")
  ai_category: String ("Plumbing")
  ai_confidence: Decimal (0.0-1.0)
  ai_analysis_notes: Text ("Dripping faucet detected, no visible flooding")

  // Routing
  status: Enum ("SUBMITTED", "TRIAGED", "WORK_ORDER_CREATED", "RESOLVED", "DISMISSED")
  created_maintenance_job_id: UUID (foreign key to MaintenanceJob, nullable)
  assigned_to_next_cleaning: Boolean (if LOW severity)

  // Guest communication
  guest_notified: Boolean
  guest_notification_message: Text

  // Timestamps
  reported_at: DateTime
  triaged_at: DateTime (nullable)
  resolved_at: DateTime (nullable)

  created_at: DateTime
  updated_at: DateTime
}
```

#### Photo
```
Photo {
  id: UUID
  uploaded_by_user_id: UUID (foreign key to User)

  // Association (polymorphic)
  associated_entity_type: Enum ("CLEANING_JOB", "MAINTENANCE_JOB", "GUEST_REPORT", "PROPERTY", "QUOTE")
  associated_entity_id: UUID

  // Storage
  s3_url: String
  thumbnail_s3_url: String

  // Metadata
  file_size_bytes: Integer
  mime_type: String ("image/jpeg")
  original_filename: String

  // AI analysis (from Google Vision API)
  ai_quality_score: Decimal (0.0-1.0)
  ai_detected_labels: String[] (["bathroom", "sink", "water", "faucet"])
  ai_detected_objects: JSON
  ai_brightness_score: Decimal (0.0-1.0)
  ai_blur_score: Decimal (0.0-1.0)

  // Photo type classification
  photo_type: Enum ("BEFORE", "AFTER", "ISSUE", "COMPLETION", "GENERAL")

  // Geolocation (from EXIF if available)
  latitude: Decimal (nullable)
  longitude: Decimal (nullable)

  created_at: DateTime
}
```

---

## 5. Technical Architecture

### 5.1 API Endpoints (RESTful)

#### Service Provider Dashboard API

**Authentication:**
```
POST   /api/auth/login
POST   /api/auth/register
POST   /api/auth/refresh-token
POST   /api/auth/logout
```

**Dashboard Overview:**
```
GET    /api/dashboard/overview
       Returns: {
         today_jobs: { cleaning: 8, maintenance: 3 },
         urgent_issues: 2,
         pending_quotes: 5,
         revenue_this_month: 12450.00
       }
```

**Cleaning Jobs:**
```
GET    /api/cleaning-jobs                      # List all (filterable)
GET    /api/cleaning-jobs/:id                  # Single job details
POST   /api/cleaning-jobs                      # Create new job
PUT    /api/cleaning-jobs/:id                  # Update job
DELETE /api/cleaning-jobs/:id                  # Cancel job
POST   /api/cleaning-jobs/:id/assign           # Assign to worker
POST   /api/cleaning-jobs/:id/complete         # Mark complete
POST   /api/cleaning-jobs/:id/upload-photos    # Upload photos
GET    /api/cleaning-jobs/:id/checklist        # Get checklist
PUT    /api/cleaning-jobs/:id/checklist        # Update checklist progress
```

**Maintenance Jobs:**
```
GET    /api/maintenance-jobs
GET    /api/maintenance-jobs/:id
POST   /api/maintenance-jobs                   # Create (from cleaner report, guest report, manual)
PUT    /api/maintenance-jobs/:id
DELETE /api/maintenance-jobs/:id
POST   /api/maintenance-jobs/:id/assign        # Assign to worker or external contractor
POST   /api/maintenance-jobs/:id/complete
POST   /api/maintenance-jobs/:id/upload-photos
```

**Quotes:**
```
GET    /api/quotes
GET    /api/quotes/:id
POST   /api/quotes                             # Generate quote (manual or from maintenance job)
PUT    /api/quotes/:id
DELETE /api/quotes/:id
POST   /api/quotes/:id/send                    # Send to customer
POST   /api/quotes/:id/approve                 # Customer approval (webhook)
POST   /api/quotes/:id/decline
```

**Workers:**
```
GET    /api/workers
GET    /api/workers/:id
POST   /api/workers
PUT    /api/workers/:id
DELETE /api/workers/:id
GET    /api/workers/:id/schedule               # View worker's schedule
GET    /api/workers/:id/performance            # Performance metrics
```

**Customers:**
```
GET    /api/customers
GET    /api/customers/:id
POST   /api/customers
PUT    /api/customers/:id
DELETE /api/customers/:id
GET    /api/customers/:id/health-score         # Payment reliability, satisfaction, cross-sell potential
```

**Properties:**
```
GET    /api/properties
GET    /api/properties/:id
POST   /api/properties
PUT    /api/properties/:id
DELETE /api/properties/:id
GET    /api/properties/:id/history             # Job history (cleaning + maintenance)
```

**External Contractors:**
```
GET    /api/external-contractors
GET    /api/external-contractors/:id
POST   /api/external-contractors
PUT    /api/external-contractors/:id
DELETE /api/external-contractors/:id
POST   /api/external-contractors/:id/assign-job # Assign maintenance job
```

**AI Integration:**
```
POST   /api/ai/analyze-photo                   # Upload photo, get AI analysis (severity, category)
POST   /api/ai/triage-guest-report             # AI triages guest issue report
POST   /api/ai/generate-quote                  # AI suggests quote based on historical data
POST   /api/ai/chatbot                         # Guest Q&A chatbot (RAG system)
```

**Calendar & Scheduling:**
```
GET    /api/calendar/overview                  # Unified calendar (cleaning + maintenance)
GET    /api/calendar/:date                     # Jobs for specific date
POST   /api/calendar/optimize-routes           # AI suggests optimal worker routing
```

---

#### Mobile App API (Worker-Focused)

**Job Management:**
```
GET    /api/mobile/jobs/today                  # Today's jobs for logged-in worker
GET    /api/mobile/jobs/:id                    # Job details (offline-cacheable)
POST   /api/mobile/jobs/:id/start              # Clock in, start job
POST   /api/mobile/jobs/:id/complete           # Clock out, complete job
POST   /api/mobile/jobs/:id/report-issue       # Report maintenance issue (cleaner → maintenance upsell)
```

**Checklist:**
```
GET    /api/mobile/jobs/:id/checklist          # Fetch checklist (offline-first)
PUT    /api/mobile/jobs/:id/checklist          # Update checklist progress (sync when online)
```

**Photos:**
```
POST   /api/mobile/photos/upload               # Upload photo (batch upload supported)
POST   /api/mobile/photos/upload-queue         # Queue photo for later upload (offline mode)
```

**Sync:**
```
POST   /api/mobile/sync                        # Sync offline changes (jobs, photos, checklists)
GET    /api/mobile/sync/status                 # Check sync status
```

---

#### Customer Portal API

**Authentication (Passwordless or simple login):**
```
POST   /api/customer-portal/login              # Email/phone + magic link
GET    /api/customer-portal/verify/:token      # Verify login token
```

**Dashboard:**
```
GET    /api/customer-portal/dashboard          # Overview (properties, upcoming jobs, pending quotes)
```

**Properties:**
```
GET    /api/customer-portal/properties         # Customer's properties
GET    /api/customer-portal/properties/:id     # Property details + job history
```

**Quotes:**
```
GET    /api/customer-portal/quotes             # Pending quotes
GET    /api/customer-portal/quotes/:id         # Quote details (with photos)
POST   /api/customer-portal/quotes/:id/approve
POST   /api/customer-portal/quotes/:id/decline
```

**Invoices:**
```
GET    /api/customer-portal/invoices           # Invoice history
GET    /api/customer-portal/invoices/:id       # Invoice details
POST   /api/customer-portal/invoices/:id/pay   # Payment (future - Stripe integration)
```

---

#### Guest Portal API (Tablet/QR Code)

**No authentication required (property-scoped by unique token)**

**Q&A Chatbot (RAG):**
```
POST   /api/guest-portal/:property_token/ask
       Body: { question: "How do I work the hot tub?" }
       Returns: { answer: "...", confidence: 0.95 }
```

**Issue Reporting:**
```
POST   /api/guest-portal/:property_token/report-issue
       Body: {
         issue_type: "PLUMBING",
         description: "Dripping faucet in bathroom",
         photos: [base64_encoded_image],
         guest_name: "Mark Johnson" (optional),
         guest_phone: "+44..." (optional)
       }
       Returns: {
         report_id: "uuid",
         ai_severity: "LOW",
         estimated_response_time: "Will be fixed within 48 hours",
         message: "Thanks for letting us know! This will be addressed during the next cleaning visit."
       }
```

**Issue Status:**
```
GET    /api/guest-portal/:property_token/issue/:report_id
       Returns: { status: "WORK_ORDER_CREATED", eta: "Today at 3pm" }
```

---

### 5.2 Mobile App Requirements

**Platform:** React Native (Expo)
**Offline Database:** WatermelonDB (already implemented in existing codebase)

**Key Features:**
1. **Offline-First Architecture**
   - All job data synced to local DB overnight
   - Checklist completion tracked offline
   - Photos queued for upload (auto-sync when signal available)
   - Conflict resolution (last-write-wins for simplicity)

2. **Camera Integration**
   - In-app camera (before/after/issue photos)
   - Batch photo capture (take 10 photos, upload when online)
   - Photo compression (reduce upload size)
   - EXIF metadata stripping (privacy)

3. **Checklist UI**
   - Swipe-right to complete items
   - Voice notes for completion notes
   - Offline checklist access
   - Progress indicator (12/20 items completed)

4. **Issue Reporting (Cleaner → Maintenance Upsell)**
   - Quick "Report Issue" button
   - Pre-defined categories (Plumbing, Electrical, etc.)
   - Photo + voice note
   - Auto-notifies Alex for quote generation

5. **Worker Schedule**
   - Today's jobs (chronological order)
   - Job details (address, access code, checklist)
   - Navigation link (Apple Maps/Google Maps)
   - Contact customer button

**UI Design Principles:**
- **Large touch targets** (minimum 44x44pt for iOS, 48x48dp for Android)
- **High contrast text** (outdoor visibility)
- **Minimal data entry** (swipe, tap, voice)
- **Clear offline indicators** (sync status always visible)

---

### 5.3 Offline Mode Strategy

**Problem:** Rural UK properties have unreliable/zero mobile signal

**Solution:** Offline-first architecture with intelligent sync

**Implementation:**

1. **Pre-sync (Night Before)**
   - Mobile app syncs tomorrow's jobs to WatermelonDB at 11pm (when worker is home on WiFi)
   - Downloads:
     - Job details (property address, access code, checklist)
     - Property photos (reference images)
     - Customer contact info
   - Estimated sync size: 5-10 MB per day

2. **Offline Job Execution**
   - Worker arrives on-site (no signal)
   - Opens app → sees cached job details
   - Completes checklist (saved locally)
   - Takes photos (saved to device storage)
   - Marks job complete (queued for sync)

3. **Auto-Sync When Signal Available**
   - App detects internet connection (WiFi or cellular)
   - Background sync starts automatically:
     - Upload checklist progress
     - Upload photos (compressed, batched)
     - Update job status
   - Retry logic for failed uploads (3 retries, exponential backoff)

4. **Conflict Resolution**
   - **Last-write-wins** for job status (simple, predictable)
   - **Server-side merge** for checklist items (preserve all completions)
   - **Manual review** for photos (never auto-delete)

5. **Offline Indicators**
   - Header: "Offline - 3 jobs queued for sync"
   - Job card: "✓ Completed (not synced)"
   - Photo: "Queued for upload (2.5 MB)"

**Testing Offline Mode:**
- Airplane mode testing (iOS/Android)
- Simulate poor signal (throttled 2G)
- Battery drain testing (offline sync polling frequency)

---

### 5.4 AI Integration

#### Vision AI (Photo Analysis)

**Provider:** Google Cloud Vision API (already integrated in existing codebase)

**Use Cases:**

1. **Photo Quality Check (Cleaning)**
   - Analyze before/after photos for:
     - Brightness (too dark → reject, ask for retake)
     - Blur (blurry → reject)
     - Object detection ("bed", "kitchen", "bathroom" → verify photo matches checklist section)
   - Auto-reject poor-quality photos

2. **Issue Severity Triage (Guest Reports)**
   - Analyze guest-uploaded photo:
     - Detect water/flooding → URGENT
     - Detect fire/smoke → CRITICAL (immediate 999 call)
     - Detect broken furniture → MEDIUM
     - Detect burned-out lightbulb → LOW
   - Auto-classify severity (1-100 score)

3. **Maintenance Issue Classification (Cleaner Reports)**
   - Analyze issue photo:
     - Detect "sink", "faucet", "water" → Category: Plumbing
     - Detect "boiler", "heating" → Category: HVAC
     - Detect "light", "switch" → Category: Electrical
   - Suggest category with confidence score

**API Integration:**
```javascript
// Existing implementation (apps/api/src/services/ai/vision.service.ts)
const analysis = await visionService.analyzePhoto(photo_url);

// Example response:
{
  labels: ["bathroom", "sink", "faucet", "water"],
  objects: [{ name: "sink", confidence: 0.95 }],
  brightness: 0.75,  // 0.0-1.0 scale
  blur_score: 0.05,  // 0.0-1.0 (lower = sharper)
  quality_passed: true
}
```

**Cost Optimization:**
- Compress images before sending to Vision API (reduce cost per request)
- Cache analysis results (same photo analyzed once)
- Rate limit: 100 requests/day (£0.0015/image = £4.50/month at 100 images/day)

---

#### RAG System (Guest Q&A Chatbot)

**Provider:** OpenAI GPT-4 + Pinecone (vector database) OR local embeddings

**Use Case:** Guest asks questions via tablet/QR code portal

**Knowledge Base:**
- Property-specific manual (Emma uploads PDF for each lodge)
- Generic holiday property FAQs (how to use appliances, WiFi password, checkout procedures)
- Previous guest Q&A history (learning from past questions)

**Implementation:**

1. **Document Ingestion (One-Time per Property)**
   - Emma uploads property manual (PDF, DOCX, or web link)
   - System extracts text, chunks into 500-word segments
   - Generate embeddings (OpenAI text-embedding-ada-002)
   - Store in vector database (Pinecone or local)

2. **Query Processing (Real-Time)**
   - Guest asks: "How do I turn on the hot tub?"
   - System generates embedding for query
   - Vector search retrieves top 3 relevant chunks
   - GPT-4 generates answer using retrieved context (RAG)
   - Response time: <2 seconds

3. **Fallback Handling:**
   - If confidence <0.7 → "I'm not sure, but here's the owner's number: +44..."
   - If question is emergency ("no hot water") → Escalate to Alex immediately

**Example API Call:**
```javascript
POST /api/guest-portal/:property_token/ask
Body: {
  question: "How do I work the hot tub?"
}

Response: {
  answer: "The hot tub controls are located on the deck...",
  confidence: 0.95,
  sources: ["Property Manual - Page 12", "Hot Tub Safety Guide"]
}
```

**Cost:**
- Embedding generation: $0.0001/1k tokens (~£0.08/property manual)
- GPT-4 query: $0.03/1k tokens (~£0.02/question)
- Target: <£50/month for 25 properties with 200 guest questions/month

---

#### Predictive Maintenance AI (Future Phase 4)

**Use Case:** Analyze historical maintenance data to predict future issues

**Examples:**
- "Lodge 7 boiler is 9 years old, similar boilers failed at 10 years → recommend replacement within 6 months"
- "Property X has had 3 plumbing issues in past 6 months → recommend full plumbing inspection"
- "Gutter cleaning typically needed every 6 months → auto-schedule for October"

**Data Required:**
- Maintenance job history (category, frequency, cost)
- Property age and appliance install dates
- Seasonal patterns (heating issues increase in winter)

**Implementation:** Phase 4 (Week 11 in QUALITY_ROADMAP.md)

---

## 6. Implementation Roadmap

**Aligned with `/docs/QUALITY_ROADMAP.md`**

### Phase 1: Foundation Hardening (Weeks 1-3)
**Scope:** Existing landlord platform → Service provider platform migration

**Week 1-2: Database Schema Migration**
- [ ] Create `ServiceProvider`, `Service`, `Worker`, `ExternalContractor` tables
- [ ] Migrate existing `Property` and `WorkOrder` to new schema
- [ ] Add `CleaningJob` and `MaintenanceJob` entities
- [ ] Create `Quote`, `ChecklistTemplate`, `GuestIssueReport` tables
- [ ] Multi-tenancy migration (tenant_id → service_provider_id)

**Week 3: Testing & Security**
- [ ] Write tests for new schema (service-level tests)
- [ ] Multi-tenancy isolation testing (ensure Alex can't see other service providers' data)
- [ ] Security audit (OWASP Top 10)
- [ ] API endpoint security hardening

**Deliverable:** Database schema complete, existing data migrated, tests passing

---

### Phase 2: UX Excellence (Weeks 4-7)
**Scope:** Two dashboards + mobile app for workers

**Week 4: Service Provider Dashboard (Alex's View)**
- [ ] Unified calendar (cleaning + maintenance jobs)
- [ ] Quote generation workflow
- [ ] Worker assignment UI
- [ ] Customer health score dashboard
- [ ] Photo review and approval

**Week 5: Mobile App (Worker View)**
- [ ] Cleaner workflow (checklist, photos, issue reporting)
- [ ] Maintenance worker workflow (job details, photos, completion)
- [ ] Offline-first sync testing
- [ ] Camera integration and photo compression

**Week 6: Customer Portal (Emma's View)**
- [ ] Property overview (status, upcoming jobs)
- [ ] Quote approval workflow
- [ ] Invoice history
- [ ] Magic link authentication

**Week 7: Cross-Platform Polish**
- [ ] Design consistency audit
- [ ] Dark mode (optional)
- [ ] Responsive design testing
- [ ] Accessibility (WCAG AA)

**Deliverable:** Two dashboards functional, mobile app tested offline, customer portal live

---

### Phase 3: Feature Completeness (Weeks 8-10)
**Scope:** Cross-sell workflow, AI integration, guest portal

**Week 8: Cross-Sell Workflow**
- [ ] Cleaner issue reporting → Alex quote generation → Customer approval → Maintenance job
- [ ] Customer contract management (bundled discount logic)
- [ ] Performance metrics (cross-sell conversion rate, upsell value)

**Week 9: Guest Portal (Basic)**
- [ ] Guest issue reporting form
- [ ] Photo upload and AI triage
- [ ] Status tracking ("Help is on the way")

**Week 10: AI Integration (Vision API)**
- [ ] Photo quality checks (brightness, blur)
- [ ] Issue severity triage (guest reports)
- [ ] Category classification (maintenance jobs)

**Deliverable:** Cross-sell workflow tested, guest portal live, AI triaging working

---

### Phase 4: Competitive Differentiation (Weeks 11-13)
**Scope:** AI chatbot, predictive maintenance, external contractor portal

**Week 11: AI Chatbot (RAG System)**
- [ ] Property manual ingestion (PDF → embeddings)
- [ ] Guest Q&A chatbot (GPT-4 + vector search)
- [ ] Confidence scoring and fallback handling
- [ ] Cost optimization (caching, rate limiting)

**Week 12: Predictive Maintenance (Basic)**
- [ ] Historical data analysis
- [ ] Simple prediction rules (boiler age, seasonal patterns)
- [ ] Proactive maintenance recommendations

**Week 13: External Contractor Portal**
- [ ] Job referral notifications (SMS/WhatsApp)
- [ ] Quote submission form
- [ ] Invoice tracking

**Deliverable:** AI chatbot answering guest questions, predictive maintenance MVP, contractor portal live

---

### Phase 5: Beta Testing & Refinement (Weeks 14-16)
**Scope:** Real-world testing with Alex + 2-3 customers

**Week 14: Beta Deployment**
- [ ] Deploy to production environment
- [ ] Onboard Alex as first service provider
- [ ] Onboard 2-3 customers (Emma + others)
- [ ] Onboard 2-3 workers (Sarah, Mike)

**Week 15: Real-World Testing**
- [ ] Execute 20+ cleaning jobs via platform
- [ ] Execute 5+ maintenance jobs
- [ ] Test cross-sell workflow (cleaner finds issue → quote → approval)
- [ ] Test guest portal (find 5 guests to try chatbot)
- [ ] Collect feedback (surveys, interviews)

**Week 16: Bug Fixes & Polish**
- [ ] Fix critical bugs (crash, data loss, sync failures)
- [ ] UX friction reduction (3+ top pain points addressed)
- [ ] Performance tuning (API <500ms, mobile 60fps)
- [ ] Final security audit

**Deliverable:** Platform running in production, real jobs completed, feedback incorporated

---

### Phase 6: Scale & Optimize (Weeks 17-20, Optional)
**Scope:** WhatsApp integration, analytics, multi-service-provider expansion

**Week 17: WhatsApp Integration**
- [ ] WhatsApp Business API setup (Twilio)
- [ ] Job assignment notifications to workers via WhatsApp
- [ ] Photo sharing via WhatsApp
- [ ] Two-way status updates (optional)

**Week 18: Analytics & Reporting**
- [ ] Revenue dashboard (cleaning vs. maintenance split)
- [ ] Worker performance metrics
- [ ] Customer health scores (churn prediction)
- [ ] Cross-sell funnel analytics

**Week 19: Multi-Service-Provider Expansion (Optional)**
- [ ] If Alex wants to white-label for other service providers
- [ ] Tenant isolation hardening (multi-service-provider support)
- [ ] Billing/subscription logic (Stripe)

**Week 20: Launch Preparation**
- [ ] Marketing materials (landing page, case study)
- [ ] Help documentation (for workers, customers)
- [ ] Support system (ticketing, live chat)
- [ ] App Store submission (iOS/Android)

**Deliverable:** Platform ready for scale, optional white-label capability, public launch

---

## 7. Success Criteria

### 7.1 Technical Metrics
- **API Uptime:** 99.5%+ (measured monthly)
- **Offline sync success rate:** ≥95% (photos, checklists, job status)
- **Mobile app crash rate:** <1% of sessions
- **Photo upload success rate:** ≥98%
- **AI triage accuracy:** ≥90% (guest reports correctly classified)
- **API response time:** <500ms (p95)

### 7.2 Business Metrics
- **Cross-sell conversion rate:** 40%+ (customers using both services)
- **Quote-to-contract conversion:** 30%+ (quotes sent → contract signed)
- **Customer retention:** >95% (annual churn <5%)
- **Worker productivity:** 5+ jobs/day/worker (cleaning), 3+ jobs/day/worker (maintenance)
- **Revenue per customer:** £200-500/month average

### 7.3 User Satisfaction Metrics
- **Alex (Owner) satisfaction:** "Saves 10+ hours/week vs. manual coordination"
- **Worker satisfaction:** "App is easy to use, works offline"
- **Customer satisfaction:** NPS ≥50 (promoters > detractors)
- **Guest satisfaction:** "Issue reporting was easy, got help quickly"

### 7.4 Feature Adoption Metrics
- **Offline mode usage:** 80%+ of workers use offline mode at least once/week
- **Photo upload volume:** 50+ photos/day (cleaning) + 10+ photos/day (maintenance)
- **Guest portal usage:** 20%+ of guests interact with portal during stay
- **AI chatbot deflection rate:** 60%+ of guest questions answered without human intervention
- **Cross-sell originated from cleaner reports:** 30%+ of maintenance quotes from cleaner-found issues

---

## 8. Risks & Mitigations

### 8.1 Technical Risks

**Risk: Offline sync conflicts (worker and Alex edit same job)**
- **Likelihood:** Medium
- **Impact:** Medium (data loss, confusion)
- **Mitigation:** Last-write-wins strategy, conflict log for Alex to review, retry logic

**Risk: Vision AI misclassifies severity (labels emergency as LOW)**
- **Likelihood:** Low (with proper training)
- **Impact:** High (guest safety, property damage)
- **Mitigation:** Human-in-the-loop for URGENT classification, AI confidence threshold (only auto-escalate if >0.9 confidence)

**Risk: Photo uploads fail in rural areas (worker moves out of range before upload completes)**
- **Likelihood:** Medium
- **Impact:** Medium (missing photo evidence)
- **Mitigation:** Queue-based upload with retry, manual retry button, offline indicator showing pending uploads

**Risk: Mobile app performance degrades with large photo library**
- **Likelihood:** Medium
- **Impact:** Medium (slow app, worker frustration)
- **Mitigation:** Photo compression, lazy loading, periodic cache cleanup (delete photos >30 days old from device)

### 8.2 Business Risks

**Risk: Customers don't see value in bundled service (cross-sell fails)**
- **Likelihood:** Medium
- **Impact:** High (core business model assumption)
- **Mitigation:** Beta testing with 3+ customers, iterate on value proposition, flexible pricing

**Risk: Workers resist using mobile app (prefer paper checklists)**
- **Likelihood:** Medium (especially Mike, low tech-savvy)
- **Impact:** High (no data, no photo evidence, no cross-sell)
- **Mitigation:** In-person training, simplified UI, voice notes option, incentivize usage (bonus for photo uploads)

**Risk: AI chatbot gives incorrect/dangerous answers to guests**
- **Likelihood:** Low (with confidence thresholds)
- **Impact:** High (guest safety, legal liability)
- **Mitigation:** Confidence threshold (only answer if >0.7), human fallback ("Contact owner for urgent issues"), legal disclaimer

**Risk: External contractors don't adopt contractor portal (prefer phone calls)**
- **Likelihood:** High (contractors are traditional)
- **Impact:** Medium (manual coordination overhead)
- **Mitigation:** Start with SMS/WhatsApp job notifications (low friction), portal optional, gradual adoption

### 8.3 Market Risks

**Risk: Rural UK market too small to sustain business**
- **Likelihood:** Low (large addressable market)
- **Impact:** High (pivot required)
- **Mitigation:** Beta testing with diverse customers (lodges, cabins, B&Bs), validate demand early

**Risk: Competitors launch similar cross-sell platform**
- **Likelihood:** Low (niche market)
- **Impact:** Medium (commoditization)
- **Mitigation:** Speed to market, deep customer relationships, AI differentiation

---

## 9. Appendices

### 9.1 Glossary

- **Cross-sell:** Selling maintenance services to cleaning-only customers (or vice versa)
- **Turnover:** Cleaning between guest stays (checkout → cleaning → next check-in)
- **Bundled discount:** 10% discount for customers contracting both cleaning and maintenance
- **RAG:** Retrieval-Augmented Generation (AI technique for Q&A chatbots)
- **Vision AI:** Google Cloud Vision API for photo analysis
- **Offline-first:** App design pattern where offline functionality is primary, not fallback
- **WatermelonDB:** React Native offline-first database (already implemented)

### 9.2 References

- **QUALITY_ROADMAP.md** - 6-phase implementation timeline
- **Existing PRD (prd.md)** - Original landlord-focused platform requirements
- **WatermelonDB Docs** - https://watermelondb.dev
- **Google Cloud Vision API** - https://cloud.google.com/vision
- **OpenAI RAG Best Practices** - https://platform.openai.com/docs/guides/retrieval-augmented-generation

### 9.3 Open Questions (For Beta Testing)

1. **Pricing:** What discount percentage resonates with customers for bundled services? (10%, 15%, 20%?)
2. **Worker adoption:** What incentive structure drives photo upload compliance? (Bonus per photo? Gamification?)
3. **Guest engagement:** What % of guests will actually use the tablet/QR code portal vs. calling Emma?
4. **AI accuracy:** What's the real-world accuracy of Vision AI for severity triage? (Test with 100+ guest reports)
5. **Cross-sell timing:** When should Alex pitch maintenance contracts to cleaning-only customers? (After 1 month? 3 months? After first cleaner-found issue?)

---

**Document Status:** ✅ APPROVED for implementation
**Next Steps:** Begin Phase 1 database migration (see QUALITY_ROADMAP.md Week 1-2)
**Owner:** Alex Robertson (Service Provider)
**Maintainer:** Claude Code (Development AI)

---

**End of PRD V2**

*"Build the tool that lets you run two businesses as easily as one."*
