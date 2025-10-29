# Product Owner Discovery Document
## RightFit Services - MVP Requirements Foundation

**Document Version:** 2.0 (REVISED FOR SOLO DEVELOPER)
**Date:** 2025-10-27
**Prepared by:** Business Analyst (Mary)
**For:** Product Owner (PO)
**Status:** Updated for Solo Developer Bootstrap - Ready for PRD Development

---

## **🚨 CRITICAL CONTEXT FOR PO**

**REVISED STRATEGY (Solo Developer Bootstrap):**
- **Primary Target:** Long-term landlords (1-20 properties), NOT cabin owners
- **Pricing:** £15-25/month competitive pricing (NOT £50-75 premium)
- **Timeline:** 3-month MVP development by solo developer
- **Budget:** MINIMAL (£2k-5k for MVP)
- **Positioning:** "Arthur Online reliability without the outages, at half the price"
- **Scope:** RUTHLESSLY CUT features - see updated MVP scope below

**What Changed:**
- Broader market (long-term landlords = 4.6M households vs. 5-10k cabins)
- Competitive pricing strategy (undercut Arthur Online, compete with Landlord Studio/PaTMa)
- Solo developer constraints (no team, minimal budget, 3-month timeline)
- UK-wide SaaS from day 1 (not Scotland-first)

**What Stays:**
- Mobile-first with offline functionality (core differentiator)
- Work order management + contractor database (core features)
- Basic AI photo quality checks (unique at this price point)
- UK compliance tracking (Gas Safety, Electrical, EPC reminders)

---

---

## Purpose of This Document

This document translates the strategic vision from the **Project Brief** into actionable product requirements for the Product Owner. It includes:

- **User personas** with specific jobs-to-be-done
- **Core user workflows** with step-by-step journeys
- **Functional requirements** organized by feature area
- **Initial user stories** to seed the backlog
- **Questions requiring PO decision** before development begins

Use this document to:
1. Create detailed Product Requirements Document (PRD)
2. Write comprehensive user stories with acceptance criteria
3. Prioritize backlog for MVP sprints
4. Guide wireframe and design work

---

## User Personas & Jobs-to-Be-Done

### Persona 1: Jamie - Cabin Owner in Scottish Highlands

**Demographics:**
- Age: 42
- Location: Scottish Highlands (manages 3 cabins remotely from Edinburgh)
- Tech Comfort: High (uses Airbnb, online banking, but frustrated by complex software)
- Annual Revenue: £75k from cabin rentals

**Current Tools:**
- Airbnb for bookings
- Spreadsheets for cleaning schedules
- Phone/email for contractor coordination
- Paper files for compliance certificates

**Pain Points:**
- Drives 2 hours to properties for inspections (no reliable remote verification)
- Missed gas certificate renewal (nearly fined £2,500 under Scottish STL licensing)
- Cleaner reported broken window lock but didn't notify maintenance until Jamie's next visit
- No mobile signal at cabins makes real-time coordination impossible
- Struggles to find contractors willing to travel to remote properties

**Jobs-to-Be-Done:**
1. **When** I receive a booking, **I want to** automatically schedule cleaning and pre-arrival inspection, **so that** the cabin is guest-ready without manual coordination
2. **When** I'm at the property doing maintenance, **I want to** create work orders and take photos even without mobile signal, **so that** I don't have to remember tasks when I get back to civilization
3. **When** a compliance certificate is expiring, **I want to** receive reminders 60 days and 30 days in advance, **so that** I never risk a £2,500 fine again
4. **When** a cleaner finds an issue during turnover, **I want to** be immediately alerted and able to dispatch a contractor, **so that** problems are fixed before guest check-in
5. **When** winter arrives, **I want to** follow a seasonal winterization checklist, **so that** I don't forget critical tasks like draining pipes and stocking firewood

**Success Metrics:**
- Reduce property visits from 12/year to 4/year (save £1,600 in travel costs)
- Zero missed compliance deadlines
- Fix 90% of cleaner-reported issues before guest arrival (vs. 40% currently)

---

### Persona 2: Sarah - Professional Cleaning Company Owner

**Demographics:**
- Age: 35
- Location: Edinburgh
- Company: CleanStay Scotland (8 employees, serving 45 STR properties)
- Tech Comfort: Moderate (uses WhatsApp, Google Sheets, email)
- Annual Revenue: £120k

**Current Tools:**
- Google Sheets for scheduling
- WhatsApp for team coordination
- Manual invoices via Word + email
- Separate spreadsheet for payment tracking per client

**Pain Points:**
- Spends 15 hours/week on admin (invoicing, scheduling, payment follow-ups)
- Creates 50-60 individual invoices per month (one per clean per property)
- Can't demonstrate SLA performance to win larger contracts
- Manual WhatsApp coordination means double-bookings and missed jobs
- Property managers demand accountability but no system to show proof of quality

**Jobs-to-Be-Done:**
1. **When** I receive cleaning requests from multiple properties, **I want to** batch schedule my team across the week with automatic assignments, **so that** I don't spend hours manually coordinating via WhatsApp
2. **When** a clean is completed, **I want to** my cleaner to upload verification photos automatically, **so that** I can prove quality to property managers without manual follow-up
3. **When** invoicing time comes, **I want to** generate batch invoices for all cleans per client for the month, **so that** I save 10+ hours on individual invoicing
4. **When** a property manager asks about my SLA performance, **I want to** show transparent metrics (on-time rate, quality scores, response time), **so that** I can win premium contracts
5. **When** a team member calls in sick, **I want to** quickly reassign jobs to available cleaners, **so that** I meet my 24-hour backup guarantee

**Success Metrics:**
- Reduce admin time from 15 hours/week to 5 hours/week (10 hours saved = £5k/year value)
- Win 2-3 larger contracts (20+ properties) due to SLA performance transparency
- Increase team utilization from 70% to 85% through better scheduling

---

### Persona 3: Mark - First-Time STR Landlord (Secondary Persona)

**Demographics:**
- Age: 38
- Location: Lake District (manages 1 cottage, considering buying 2nd)
- Tech Comfort: Moderate (comfortable with apps, but not technical)
- Annual Revenue: £18k from cottage rental (side income, keeps day job)

**Current Tools:**
- Booking.com for listings
- Paper notebook for maintenance tracking
- Local handyman on speed dial
- Individual cleaner booked via text message

**Pain Points:**
- Forgets maintenance tasks (last EPC expired, only realized when guest complained about heating efficiency rating)
- Can't tell if cleaner did thorough job unless he drives 45 minutes to check in person
- Tracks expenses in notebook, creates tax return stress every April
- Unsure which maintenance tasks are legally required vs. optional

**Jobs-to-Be-Done:**
1. **When** I list my cottage on multiple platforms, **I want to** see all bookings in one calendar, **so that** I don't double-book or miss cleanings
2. **When** a guest reports an issue during their stay, **I want to** quickly create a work order and assign to my handyman from my phone, **so that** I can fix problems without disrupting my day job
3. **When** my cleaner finishes a turnover, **I want to** see photos of the cottage so I know it's guest-ready, **so that** I don't have to drive 45 minutes to check
4. **When** tax time approaches, **I want to** see all income and expenses automatically categorized, **so that** I can file my tax return without stress
5. **When** starting out, **I want to** guidance on what compliance certificates I legally need, **so that** I don't accidentally break the law

**Success Metrics:**
- Reduce stress and time spent on property management (enable scaling to 2nd property)
- Zero guest complaints about cleanliness or maintenance issues
- Cut tax prep time from 8 hours to 2 hours

---

## Core User Workflows

### Workflow 1: Emergency Maintenance During Guest Stay

**Actors:** Property Manager (Jamie), Tenant/Guest, Contractor

**Trigger:** Guest messages property manager about broken heating at 8pm on Saturday night in December

**Steps:**

1. **Guest reports issue**
   - Guest sends message via Airbnb/WhatsApp: "Heating not working, cottage is freezing"
   - Jamie receives notification on mobile phone

2. **Property manager creates work order (mobile app)**
   - Opens RightFit Services mobile app
   - Taps "New Work Order" → "Emergency" priority
   - Selects property: "Highland Cabin #2"
   - Category: "Heating/Plumbing"
   - Description: "Guest reports no heat, urgent"
   - Takes photo of guest's message (attach to work order)

3. **System auto-suggests contractor**
   - App shows contractors with:
     - Specialty: Heating/Plumbing
     - Location: Within 30 miles of Highland Cabin #2
     - Availability: On-call (Saturday evening)
     - Past performance rating
   - Jamie selects "Highland Heating & Plumbing" (4.8 stars, worked on this cabin before)

4. **Contractor receives notification**
   - SMS + push notification: "URGENT: Heating failure at Highland Cabin #2, guest on-site, needs immediate dispatch"
   - Contractor opens work order in contractor app
   - Sees property address, GPS directions, access instructions (key lockbox code), guest contact
   - Taps "Accept Job" → "Estimated arrival: 45 minutes"

5. **Property manager and guest receive updates**
   - Jamie gets notification: "Highland Heating accepted job, arriving 9pm"
   - System sends automated message to guest: "We've dispatched a heating specialist, they'll arrive by 9pm. Apologies for the inconvenience."

6. **Contractor arrives and diagnoses**
   - Contractor takes photo of broken heating control (timestamp + GPS auto-attached)
   - Adds note: "Control board failed, needs replacement part. Will return tomorrow 10am with part. Provided space heater from truck as temporary."
   - Updates work order status: "In Progress - Awaiting Parts"
   - Takes photo of space heater in cottage (proof of temporary solution)

7. **Contractor completes repair**
   - Returns Sunday 10am, installs new control board
   - Takes "after" photos: heating control working, thermostat showing 19°C
   - Updates work order status: "Completed"
   - Submits invoice: £180 (callout fee + part + labor)

8. **Property manager approves and pays**
   - Jamie receives notification: "Work order completed, £180 invoice pending"
   - Reviews before/after photos, sees heating restored
   - Approves payment (processed via platform, bank transfer to contractor within 2 business days)
   - Rates contractor: 5 stars, adds note: "Responded immediately on Saturday night, saved my guest's weekend"

**Success Criteria:**
- Work order created in <60 seconds on mobile
- Contractor notified within 30 seconds of work order assignment
- Guest receives automated status updates (no manual messages needed)
- Complete audit trail: timestamps, photos, location data, resolution
- Payment processed in 1-click after approval

---

### Workflow 2: Automated Cleaning Coordination After Booking

**Actors:** Property Manager (Mark), Cleaning Company (Sarah's team), Guest

**Trigger:** Guest books cottage on Booking.com for Friday-Sunday stay

**Steps:**

1. **Booking received**
   - Mark receives booking confirmation email from Booking.com
   - Manually enters booking into RightFit Services calendar (MVP: manual entry, Phase 2: API integration)
   - Booking details: Lake Cottage, Check-in Friday 3pm, Check-out Sunday 11am

2. **System auto-schedules cleaning**
   - Based on check-out time (Sunday 11am), system creates cleaning task
   - Scheduled for: Sunday 11:30am (30-minute buffer after check-out)
   - Estimated duration: 2 hours (based on property size settings)
   - Must be completed by: Sunday 2pm (before next check-in if applicable, or standard deadline)

3. **Cleaner receives assignment**
   - Sarah's cleaning company (CleanStay Scotland) receives notification
   - Opens team scheduling dashboard
   - Assigns to available cleaner: "Lisa - available Sunday morning"
   - Lisa receives push notification: "Assigned: Lake Cottage clean, Sunday 11:30am"

4. **Cleaner navigates to property**
   - Lisa opens cleaning task in mobile app
   - Taps "Get Directions" (opens Google Maps with property address)
   - Arrives at property, taps "Start Clean" (records start time: 11:35am)

5. **Cleaner follows photo checklist**
   - App shows custom checklist for Lake Cottage (Mark's preferences):
     - ✅ Kitchen: Surfaces wiped, dishwasher empty, fridge cleaned
     - ✅ Living Room: Furniture straight, fireplace ashes removed, cushions arranged
     - ✅ Bedroom: Bed linens changed, fresh towels in bathroom
     - ✅ Bathroom: Toilet, shower, sink sanitized
     - ✅ General: All windows closed, heating set to 18°C, all lights off
   - For each section, Lisa must take "after" photo before checking off
   - App validates photo quality (not too dark, not blurry) before accepting

6. **Cleaner finds issue**
   - While cleaning bedroom, Lisa notices: "Bathroom sink drain is slow, water pooling"
   - Taps "Report Issue" in app
   - Takes photo of water pooling in sink
   - Selects category: "Plumbing - Non-urgent"
   - Adds note: "Drain needs clearing, not emergency but should be fixed before next guest"

7. **Property manager receives alert + auto-creates work order**
   - Mark receives notification: "Issue reported during Lake Cottage clean: Plumbing - Non-urgent"
   - App auto-creates draft work order from cleaner's report (photo + note attached)
   - Mark reviews, taps "Approve & Assign" → selects local handyman from contractor list
   - Handyman receives work order: "Clear slow bathroom drain, Lake Cottage, can schedule anytime this week"

8. **Cleaner completes and submits**
   - Lisa finishes checklist (all items checked with photos)
   - Taps "Complete Clean" (records end time: 1:40pm, 2hr 5min total)
   - App auto-generates completion report with all photos, timestamps, issue reported
   - Submitted to Sarah (company owner) and Mark (property manager)

9. **Quality review and payment**
   - Mark receives notification: "Lake Cottage clean completed, review photos"
   - Opens completion report, reviews 8 photos (all rooms look good)
   - Sees issue reported and work order already created (appreciates proactive communication)
   - Approves clean (5 stars)
   - **Payment:** For MVP, Mark's platform balance is debited £45 (Sarah's company invoiced monthly for all cleans)

10. **Monthly batch invoicing**
   - End of month, Sarah's company dashboard shows: "Lake Cottage - 4 cleans in October, £180 total"
   - Sarah generates batch invoice for Mark (all October cleans in one PDF)
   - Mark reviews and approves, payment processed via platform

**Success Criteria:**
- Zero manual coordination (no phone calls, texts, emails for standard clean)
- Cleaner can't mark complete without required photos
- Issues automatically escalate to work orders (property manager just approves)
- Property manager has visual proof of clean before next guest arrival
- Monthly batch invoicing saves Sarah 10+ hours of admin

---

### Workflow 3: Offline Work Order Creation During Property Visit

**Actors:** Property Manager (Jamie)

**Trigger:** Jamie drives to Highland Cabin #2 for quarterly inspection, arrives to find no mobile signal

**Steps:**

1. **Property manager arrives at remote property**
   - Opens RightFit Services mobile app
   - App detects no internet connection, displays: "Offline Mode - Changes will sync when reconnected"
   - Jamie can still access property details, past work orders, contractor list (cached data)

2. **Create work order #1 (offline)**
   - Taps "New Work Order"
   - Selects property: "Highland Cabin #2" (from cached list)
   - Title: "Roof gutter cleaning needed"
   - Category: "Exterior Maintenance"
   - Priority: Medium
   - Takes 3 photos of gutters with leaves/debris (photos stored locally on device)
   - Adds note: "North side gutter completely blocked, needs clearing before winter storms"
   - Taps "Save" → App shows: "Work order saved offline (will sync when online)"

3. **Create work order #2 (offline)**
   - Continues inspection, finds: "Window seal in bedroom is cracked"
   - Creates another work order
   - Title: "Replace cracked window seal - bedroom"
   - Category: "Repairs - Non-urgent"
   - Takes 2 photos (close-up of crack)
   - Note: "Letting cold air in, should fix before winter guest bookings"
   - Saves offline

4. **Add photos to existing work order (offline)**
   - Checks last month's work order: "Paint touch-ups - living room"
   - Sees status: "Completed" but wants to document current state
   - Opens work order, taps "Add Photos"
   - Takes 2 "after" photos showing completed paint work looks good
   - Saves (attached to existing work order, pending sync)

5. **Update property notes (offline)**
   - Navigates to "Highland Cabin #2" property page
   - Adds note to property log: "Quarterly inspection complete - overall condition good, 2 new work orders created. Firewood stack is full, no need to restock until spring."
   - Saves offline

6. **Leave property, regain mobile signal**
   - Drives 15 minutes down mountain road
   - App detects internet connection restored
   - Push notification: "Syncing 2 work orders, 4 photos, 1 property note..."
   - Sync completes in 10 seconds
   - Confirmation: "All offline changes synced successfully"

7. **Assign contractors (now online)**
   - Opens newly synced work order: "Roof gutter cleaning"
   - Assigns to contractor: "Highland Property Services"
   - Contractor receives notification immediately (work order now in their app)

**Success Criteria:**
- App fully functional offline (create work orders, take photos, add notes)
- No data loss if app closed during offline session (auto-saves locally)
- Automatic sync when connection restored (no manual "sync now" button needed)
- Visual indicator of offline mode (user understands limitations)
- Sync conflict resolution if data changed on server while offline (unlikely for MVP, but design for it)

---

## MVP Functional Requirements by Feature Area

### 1. Property Management

**FR-1.1: Create Property Profile**
- User can create property with fields:
  - Property name (required, e.g., "Highland Cabin #2")
  - Address (required, with postcode)
  - Property type (dropdown: Cabin, Cottage, Flat, House, HMO, Other)
  - Number of bedrooms, bathrooms
  - Property photos (gallery, up to 20 photos)
  - Access instructions (text field, e.g., "Lockbox code: 1234, key under mat")
  - Amenities checklist (heating type, fireplace, hot tub, etc.)
- User can set property to "Active" or "Inactive" status

**FR-1.2: Property Details Page**
- View property overview dashboard:
  - Upcoming bookings (calendar view)
  - Active work orders (count + list)
  - Certificate status (gas, electrical, EPC - green if valid, red if expiring <30 days)
  - Last cleaning date
  - Property notes/log (chronological list of all updates)
- Quick actions: "New Booking", "New Work Order", "Schedule Cleaning", "Upload Document"

**FR-1.3: Document Storage per Property**
- Upload documents (PDF, DOC, JPG, PNG) to property profile
- Document categories: Certificates, Leases, Inspection Reports, Insurance, Photos, Other
- Each document has:
  - Filename
  - Category
  - Upload date
  - File size
  - Optional expiration date (for certificates)
- Search and filter documents by category or filename
- Download document to device

**FR-1.4: Compliance Certificate Tracking**
- Property profile includes certificate tracking section:
  - Gas Safety Certificate (CP12): Issue date + expiration (annual)
  - Electrical Safety Certificate: Issue date + expiration (5-year)
  - EPC (Energy Performance Certificate): Rating + expiration (10-year)
  - Scottish STL License (if applicable): License number + renewal date
- System displays certificate status:
  - Green (valid, >60 days until expiration)
  - Yellow (expiring in 30-60 days)
  - Red (expired or expiring <30 days)
- User receives notifications at 60 days and 30 days before expiration

**FR-1.5: Property Portfolio Dashboard**
- View all properties in list or grid view
- Sort by: Name, Location, Active Work Orders, Next Booking, Certificate Status
- Filter by: Property Type, Status (Active/Inactive)
- Quick stats at top: Total properties, Active work orders (across all properties), Upcoming certificate expirations (next 60 days)

---

### 2. Work Order Management

**FR-2.1: Create Work Order**
- User can create work order from:
  - Property details page (auto-populates property)
  - Work orders list page (select property from dropdown)
  - Mobile app quick action button
- Required fields:
  - Property (dropdown)
  - Title (text, max 100 characters, e.g., "Fix broken window lock")
  - Priority (dropdown: Emergency, High, Medium, Low)
  - Category (dropdown: Plumbing, Electrical, Heating, Appliances, Exterior, Interior, Other)
- Optional fields:
  - Description (text area, max 1000 characters)
  - Due date (date picker)
  - Assigned contractor (dropdown from contractor database)
  - Estimated cost (currency field)
  - Photos (attach up to 10 photos)

**FR-2.2: Work Order Status Workflow**
- Work order has status: Open → Assigned → In Progress → Completed (or Cancelled)
- Status transitions:
  - **Open** (created, not yet assigned)
  - **Assigned** (contractor assigned, not yet started)
  - **In Progress** (contractor started work)
  - **Completed** (work finished, approved by property manager)
  - **Cancelled** (work order cancelled before completion)
- Status changes logged with timestamp and user who made change

**FR-2.3: Assign Work Order to Contractor**
- From work order details page, click "Assign Contractor"
- Select from dropdown of contractors (filtered by specialty if category set)
- Contractor receives notification (push + SMS for Emergency priority)
- Work order status changes to "Assigned"
- Optional: Add message to contractor (text field, e.g., "Please call guest before arriving")

**FR-2.4: Contractor Views and Updates Work Order (Mobile)**
- Contractor receives push notification with work order details
- Opens work order in contractor mobile app
- Sees: Property address, access instructions, issue description, photos, priority, due date
- Actions available:
  - "Accept Job" (changes status to Assigned, notifies property manager)
  - "Start Work" (changes status to In Progress, logs start time)
  - "Add Photos" (during or after work)
  - "Add Notes" (updates on progress, issues found)
  - "Complete Work" (marks as completed, requires at least 1 "after" photo)
  - "Submit Invoice" (enter cost, optional invoice file upload)

**FR-2.5: Work Order Photo Attachments**
- User (property manager or contractor) can attach photos to work order
- Photo metadata captured: Timestamp, GPS location (if enabled), uploaded by (user)
- Photos displayed in work order with labels: "Before" (uploaded at creation), "During" (in-progress), "After" (at completion)
- User can add caption to each photo (optional)

**FR-2.6: Work Order List & Filters**
- View all work orders across all properties
- Default view: Active work orders (Open, Assigned, In Progress) sorted by due date
- Filters:
  - Status (Open, Assigned, In Progress, Completed, Cancelled)
  - Priority (Emergency, High, Medium, Low)
  - Property (dropdown, multi-select)
  - Contractor (dropdown, multi-select)
  - Date range (created date or due date)
- Search by title or description (text search)

**FR-2.7: Emergency Work Order Notifications**
- If work order priority = Emergency:
  - Assigned contractor receives **SMS + push notification** (not just push)
  - Property manager receives notification when contractor accepts/starts/completes
  - Due date defaults to same day (user can override)
- For all other priorities: Push notification only

**FR-2.8: Work Order Cost Tracking**
- Property manager or contractor can enter cost after completion
- Fields: Labor cost, Materials cost, Total cost
- Contractor can upload invoice (PDF or photo)
- Property manager can approve cost and mark as paid (checkbox + date)
- Work order list shows cost summary: Pending invoices, Total spent (month/year)

---

### 3. Photo Upload & AI Verification (MVP: Basic Quality Checks)

**FR-3.1: Photo Upload from Mobile Camera**
- User taps "Add Photo" in work order or cleaning task
- Options: "Take Photo" (launch camera) or "Choose from Library" (select existing photo)
- Photo captured with metadata: Timestamp (auto), GPS location (optional, user can disable)
- Photo preview before upload (user can retake if needed)
- Upload progress indicator (especially important on slow rural connections)

**FR-3.2: Basic AI Photo Quality Checks (MVP Scope)**
- When photo uploaded, system runs basic quality checks using Google Vision API or Clarifai:
  - **Brightness check:** Detect if photo too dark (underexposed) → warn user: "Photo too dark, please retake in better lighting"
  - **Blur detection:** Detect if photo too blurry (out of focus) → warn user: "Photo is blurry, please hold still and retake"
  - **Content detection:** Detect if photo shows plausible room/property content (not accidental photo of sky, pocket) → warn if fails
- Warnings are **soft alerts** (user can proceed anyway, but encouraged to retake)
- Quality check results logged per photo (for future model training)

**FR-3.3: Photo Organization within Work Orders**
- Work order details page shows photos in timeline:
  - **Before photos** (uploaded when work order created) - labeled "Before"
  - **During photos** (uploaded while status = In Progress) - labeled "During"
  - **After photos** (uploaded when marked complete) - labeled "After"
- User can click photo to view full-size with metadata (timestamp, uploaded by, location if enabled)
- Photos can be downloaded or shared (generate shareable link)

**FR-3.4: Photo Checklists for Cleaning Tasks**
- Cleaning task has custom checklist (property manager defines per property)
- Each checklist item can have "Photo required" checkbox
- Example checklist for cabin:
  - ✅ Kitchen cleaned (photo required)
  - ✅ Living room tidied (photo required)
  - ✅ Bedroom linens changed (photo required)
  - ✅ Bathroom sanitized (photo required)
  - ✅ Fireplace ashes removed (photo optional)
- Cleaner cannot check off item with "photo required" until photo uploaded and passes quality check
- Completion report auto-generates with all checklist photos

**FR-3.5: Photo Storage and Management**
- Photos stored in cloud (AWS S3 or Google Cloud Storage)
- Automatic EXIF data stripping for privacy (remove camera model, lens info, unnecessary metadata - keep only timestamp and GPS if user enabled)
- Photo compression for faster loading (create thumbnail, medium, full-size versions)
- Storage quota per account: 1GB per property (MVP), can upgrade
- Property manager can bulk delete old photos (e.g., delete all photos >1 year old from completed work orders)

---

### 4. Cleaning Coordination

**FR-4.1: Create Cleaning Task**
- User can create cleaning task from:
  - Calendar view (click date → "Schedule Cleaning")
  - Property details page ("Schedule Cleaning" button)
  - Auto-created from booking (Phase 2, manual for MVP)
- Required fields:
  - Property (dropdown)
  - Scheduled date & time (date/time picker)
  - Estimated duration (dropdown: 1hr, 2hr, 3hr, 4hr, custom)
- Optional fields:
  - Assigned cleaner/company (dropdown from cleaner database)
  - Special instructions (text area, e.g., "Extra attention to kitchen after party guests")
  - Photo checklist (select from saved templates or create custom)

**FR-4.2: Cleaner Database**
- Property manager maintains list of cleaners/cleaning companies
- Cleaner profile fields:
  - Name (required)
  - Company name (optional, for companies vs. individuals)
  - Phone number (required)
  - Email (optional)
  - Hourly rate or per-clean rate (currency)
  - Service area (text, e.g., "Scottish Highlands within 30 miles of Inverness")
  - Notes (text area, e.g., "Prefers WhatsApp communication, allergic to lavender cleaning products")
- Can mark cleaner as "Favorite" (appears at top of assignment dropdown)

**FR-4.3: Assign Cleaning Task to Cleaner**
- From cleaning task details, click "Assign Cleaner"
- Select from cleaner database dropdown
- Cleaner receives notification:
  - **If cleaner has RightFit Services account:** Push notification + in-app
  - **If cleaner does not have account:** SMS with details (property address, date/time, access instructions, property manager contact)
- Task status changes to "Assigned"

**FR-4.4: Cleaner Mobile App for Task Completion**
- Cleaner opens cleaning task in mobile app
- Sees: Property address, access instructions, scheduled time, estimated duration, special instructions, photo checklist
- Actions:
  - "Start Clean" (logs start time, status → In Progress)
  - "Follow Checklist" (step through checklist items, upload photos)
  - "Report Issue" (create maintenance issue report with photo, auto-escalates to property manager)
  - "Complete Clean" (logs end time, generates completion report, status → Completed)
- Cannot mark complete until all required checklist items checked off with photos

**FR-4.5: Photo Checklist Templates**
- Property manager can create reusable photo checklist templates
- Template includes:
  - Template name (e.g., "Standard Cabin Clean", "Deep Clean After Party")
  - Checklist items (list):
    - Item description (e.g., "Kitchen surfaces wiped and sanitized")
    - Photo required (checkbox)
    - Order (drag-and-drop reordering)
- Templates can be assigned to specific properties (default checklist for Highland Cabin #2)
- Templates can be cloned and customized per cleaning task

**FR-4.6: Cleaning Completion Report**
- After cleaner marks task complete, system auto-generates completion report
- Report includes:
  - Property name & address
  - Cleaner name
  - Scheduled time vs. actual time (start/end, duration)
  - Checklist status (all items checked, photos attached)
  - Issues reported (if any, with photos)
  - Cleaner notes (optional text field for any additional comments)
- Property manager receives notification: "Cleaning completed, view report"
- Property manager can approve (rate cleaner, optional) or flag issues

**FR-4.7: Cleaning Calendar View**
- Calendar view shows:
  - Bookings (guest check-in/check-out dates)
  - Scheduled cleanings (color-coded: Scheduled, In Progress, Completed)
  - Work orders due dates
- User can filter calendar by: Property (show only Highland Cabin #2), Cleaner (show only Lisa's tasks)
- Click on calendar item to view details or edit
- Drag-and-drop to reschedule cleaning (updates date/time)

---

### 5. Contractor Management

**FR-5.1: Contractor Database**
- Property manager maintains list of trusted contractors
- Contractor profile fields:
  - Name (required)
  - Company name (optional)
  - Phone number (required)
  - Email (optional)
  - Specialty (multi-select checkboxes: Plumbing, Electrical, Heating, Roofing, Landscaping, General Handyman, Other)
  - Service area (text or radius from postcode)
  - Hourly rate or callout fee (currency, optional)
  - Notes (text area, e.g., "Available weekends, 2-day lead time for non-emergencies")
  - License/certification details (text, e.g., "Gas Safe registered #123456")
- Can mark contractor as "Preferred" (appears at top of assignment suggestions)

**FR-5.2: Contractor Work History**
- Contractor profile shows work history:
  - List of all work orders assigned to this contractor
  - For each work order: Property, Date, Title, Status, Cost, Property Manager Rating
  - Summary stats: Total jobs completed, Average response time, Average cost, Average rating
- Work history helps property manager decide whether to use contractor again

**FR-5.3: Contractor Ratings (Internal Only for MVP)**
- After work order completed, property manager can rate contractor
- Rating fields:
  - Star rating (1-5 stars, required)
  - Review text (optional, e.g., "Quick response, fair price, quality work")
- Ratings are **internal only** (visible only to property manager who rated, not shared across users)
- Phase 2: Public marketplace with shared ratings across all users

**FR-5.4: Contractor Notifications (If Contractor Has Account)**
- If contractor creates RightFit Services account (free contractor account type):
  - Receives push notifications for work order assignments
  - Can view work order details, property access instructions, photos
  - Can update work order status, add photos, submit invoices via mobile app
  - Can see their own work history and ratings from property managers they work with
- If contractor does not have account:
  - Receives SMS with basic work order details (property address, issue, property manager contact)
  - No app access (handled via phone calls/texts with property manager)

---

### 6. Payment Processing & Invoicing

**FR-6.1: Payment Methods Setup (Property Manager)**
- Property manager connects payment method in settings:
  - **Stripe integration:** Connect Stripe account to receive rent payments from tenants/guests
  - **Bank account:** Add bank account details for contractor payments (manual transfer for MVP, auto-pay Phase 2)
- Payment methods stored securely (PCI DSS compliance via Stripe tokenization)

**FR-6.2: Generate Invoice for Rent/Services**
- Property manager can create invoice for tenant or guest
- Invoice fields:
  - Recipient (tenant name, email)
  - Property (dropdown)
  - Line items (add multiple):
    - Description (e.g., "Rent for October 2025", "Cleaning fee", "Damage repair")
    - Amount (currency)
  - Total (auto-calculated)
  - Due date (date picker)
  - Notes (optional, e.g., "Payment due by 1st of month")
- Invoice template customizable (add logo, company name, contact details)

**FR-6.3: Send Invoice to Tenant/Guest**
- Property manager clicks "Send Invoice" → email sent to recipient with:
  - Invoice PDF attached
  - Payment link (if paying via Stripe - card or bank transfer)
  - Due date reminder
- Invoice status tracking: Sent → Paid (or Overdue if past due date)

**FR-6.4: Accept Rent Payments via Stripe**
- Tenant/guest receives invoice email, clicks payment link
- Redirected to Stripe-hosted payment page (secure, PCI-compliant)
- Payment methods accepted: Credit/debit card, bank transfer (Stripe supports UK bank transfers)
- After payment, tenant receives confirmation email, property manager receives notification
- Invoice status auto-updates to "Paid"

**FR-6.5: Contractor Invoice Submission**
- After work order completed, contractor can submit invoice:
  - Enter cost breakdown: Labor, Materials, Total
  - Upload invoice file (PDF or photo)
  - Submit to property manager for approval
- Property manager receives notification: "Invoice pending approval: £180 from Highland Heating"

**FR-6.6: Approve and Pay Contractor (Manual for MVP)**
- Property manager reviews invoice and work order completion (photos, details)
- Actions:
  - **Approve & Mark as Paid:** Property manager manually pays contractor (bank transfer), marks invoice as paid in app (date paid, reference number)
  - **Request Changes:** Send message to contractor asking for invoice corrections
  - **Dispute:** Flag issue with work order (quality issue, incomplete work) - invoice remains unpaid
- Invoice status: Pending → Approved & Paid (or Disputed)
- Phase 2: Auto-pay contractors via GoCardless or bank transfer integration

**FR-6.7: Payment History & Reporting**
- Property manager can view payment history:
  - Income: All rent payments received, filterable by property, date range
  - Expenses: All contractor invoices paid, filterable by category (Plumbing, Cleaning, etc.), date range
- Summary dashboard:
  - Total income (month/year)
  - Total expenses (month/year)
  - Net profit per property
  - Pending invoices (awaiting payment)
- Export to CSV or PDF for accounting/tax purposes

---

### 7. Mobile Apps (iOS & Android)

**FR-7.1: Native Mobile Apps**
- Build with React Native (code sharing between iOS and Android)
- Target platforms:
  - iOS 14+ (iPhone 8 and newer)
  - Android 10+ (Samsung, Google Pixel, OnePlus)
- App distributed via Apple App Store and Google Play Store

**FR-7.2: Mobile App Feature Parity**
- Mobile app includes ALL core features (not a simplified subset):
  - Property management (view properties, add photos, update details)
  - Work order management (create, assign, update, complete)
  - Cleaning task management (create, assign, complete with checklist)
  - Contractor management (view contractors, assign to work orders)
  - Photo upload (camera integration, photo library access)
  - Calendar view (bookings, cleanings, work orders)
  - Payment/invoice viewing (cannot process payments in-app for MVP, view only)
- Exception: Complex accounting reports may be web-only (mobile shows summary only)

**FR-7.3: Mobile App Performance**
- Target load time: <2 seconds on 4G connection
- Photo upload: <5 seconds for 5MB image on 4G
- Smooth scrolling and animations (60 FPS target)
- Battery efficiency (minimize background tasks, optimize location services)

**FR-7.4: Push Notifications**
- User receives push notifications for:
  - New work order assigned (if contractor)
  - Work order status change (if property manager)
  - Cleaning task assigned (if cleaner)
  - Invoice received/paid
  - Certificate expiration reminders (60 days, 30 days, 7 days)
  - Emergency work order created (high priority alert)
- User can customize notification preferences in settings (enable/disable per notification type)

**FR-7.5: Mobile Camera Integration**
- One-tap photo capture from work order or cleaning task
- Auto-focus and flash control
- Photo preview before upload (retake option)
- Batch upload (select multiple photos from library, upload all at once)

**FR-7.6: Location Services (Optional)**
- User can enable GPS location tagging for photos (useful for audit trail)
- Contractor app can use GPS for:
  - Navigation to property (tap address → open Google Maps)
  - Auto-detect arrival at property (geofence notification: "You're at Highland Cabin #2, ready to start work order?")
- User can disable location services globally (privacy preference)

---

### 8. Offline Functionality (Critical for Rural Properties)

**FR-8.1: Offline Mode Detection**
- App detects loss of internet connection (no WiFi, no cellular data)
- Visual indicator displayed: Banner at top of screen: "Offline Mode - Changes will sync when reconnected"
- User can still access all cached data (properties, work orders, contractors, photos already loaded)

**FR-8.2: Offline Data Caching**
- App caches critical data for offline access:
  - All properties user has access to (details, photos, documents)
  - Recent work orders (last 30 days)
  - Contractor database
  - Cleaning tasks (next 7 days)
  - User's photo checklist templates
- Cache refreshes automatically when online (fetch latest data every app launch or pull-to-refresh)

**FR-8.3: Offline Actions Supported**
- User can perform these actions offline (queued for sync when online):
  - **Create work order** (all fields, attach photos)
  - **Update work order** (change status, add notes, add photos)
  - **Create cleaning task**
  - **Complete cleaning checklist** (check off items, upload photos)
  - **Add property notes** (update property log)
  - **Take photos** (attach to work orders or properties)
- Actions saved locally on device, queued in sync queue

**FR-8.4: Automatic Sync When Connection Restored**
- App detects internet connection restored
- Automatically syncs queued actions in background (no manual "sync now" button needed)
- Sync order: Critical actions first (complete work orders, cleaning tasks), then photos, then notes
- Sync progress indicator: "Syncing 2 work orders, 5 photos..."
- Sync completion notification: "All offline changes synced successfully" (or error message if sync fails)

**FR-8.5: Offline Photos Storage**
- Photos taken offline stored locally on device (in app's private storage, not user's photo library)
- Photos compressed before sync to reduce upload time on slow connections
- If app closed/crashed before sync, photos persisted in local storage (safe to relaunch app and sync later)
- After successful sync, local photos deleted (server is source of truth)

**FR-8.6: Sync Conflict Resolution (Edge Case)**
- If user edits same work order offline on two devices, potential sync conflict
- Conflict resolution: Last write wins (most recent timestamp)
- User notified if conflict detected: "Work order was updated on another device, some changes may be overwritten"
- Phase 2: More sophisticated conflict resolution (merge changes, manual conflict resolution UI)

---

### 9. Calendar & Scheduling

**FR-9.1: Unified Calendar View**
- Calendar displays:
  - **Bookings:** Guest check-in and check-out dates (color: blue)
  - **Cleaning tasks:** Scheduled cleanings (color: green)
  - **Work orders:** Work orders with due dates (color: orange if in progress, red if overdue)
  - **Certificate expirations:** Upcoming certificate renewals (color: yellow)
- User can toggle layers on/off (show/hide bookings, cleanings, work orders)
- Calendar views: Month, Week, Day

**FR-9.2: Manual Booking Entry (MVP Scope)**
- User clicks date on calendar → "Add Booking"
- Booking fields:
  - Property (dropdown)
  - Guest name (text, optional)
  - Check-in date & time (date/time picker)
  - Check-out date & time (date/time picker)
  - Number of guests (number)
  - Booking source (dropdown: Airbnb, Booking.com, Direct, Other)
  - Booking reference (text, optional)
  - Notes (text area, optional)
- Booking appears on calendar (blocks property availability)

**FR-9.3: Calendar Integration (Phase 2 - Out of Scope for MVP)**
- iCal import/export (sync with Airbnb, Booking.com, Google Calendar)
- Channel manager API integrations (auto-sync bookings from Airbnb, Booking.com, Vrbo)
- **MVP workaround:** User manually enters bookings after receiving confirmation from booking platform

**FR-9.4: Auto-Schedule Cleaning from Booking**
- After user creates booking, system prompts: "Schedule cleaning after check-out?"
- If yes, auto-creates cleaning task:
  - Scheduled time: Check-out time + 30 minutes (configurable buffer)
  - Property: Same as booking
  - Estimated duration: Default for property (e.g., 2 hours)
- User can edit auto-generated cleaning task before saving

**FR-9.5: Certificate Expiration Reminders**
- Compliance certificates (gas, electrical, EPC, STL license) displayed on calendar as events on expiration date
- Color-coded by urgency:
  - Green: >60 days until expiration
  - Yellow: 30-60 days
  - Red: <30 days or expired
- User receives push notification at 60 days, 30 days, 7 days before expiration
- Click calendar event → view certificate details, upload renewed certificate

---

### 10. Tenant/Client Portal (Basic MVP)

**FR-10.1: Tenant Portal Access**
- Property manager can invite tenant to portal via email
- Tenant receives email with secure login link (password setup)
- Tenant logs in to web portal (mobile-responsive, no native app for tenants in MVP)

**FR-10.2: Submit Maintenance Request (Tenant)**
- Tenant clicks "Report Issue" in portal
- Form fields:
  - Issue description (text area, required)
  - Priority (dropdown: Emergency, Urgent, Non-urgent)
  - Location (dropdown: Kitchen, Bathroom, Bedroom, Living Room, Exterior, Other)
  - Photos (optional, upload up to 5 photos)
- Tenant submits → creates work order for property manager to review and assign

**FR-10.3: View Payment History (Tenant)**
- Tenant sees list of all invoices:
  - Date, Description, Amount, Status (Paid/Pending/Overdue)
  - For paid invoices: Payment date, payment method
- Tenant can download invoice PDF
- Tenant can pay pending invoices via Stripe (click "Pay Now" → redirect to payment page)

**FR-10.4: View Tenancy Documents (Tenant)**
- Tenant can access documents property manager shared:
  - Tenancy agreement
  - Gas safety certificate
  - EPC certificate
  - Inventory report
  - Other documents
- Tenant can download documents (view-only, cannot edit or delete)

**FR-10.5: Message Property Manager (Tenant)**
- Tenant can send message to property manager via portal
- Simple messaging interface (not real-time chat, more like email)
- Property manager receives email notification with message content, can reply via email or in-app
- Message history visible in portal (threaded conversation)

---

## Questions Requiring PO Decision Before Development

### 1. Pricing & Business Model

**Question:** What is the pricing structure for MVP?
**Options:**
- **Option A:** Flat monthly fee per property manager (e.g., £25/month for 1-10 properties, £50/month for 11-50 properties)
- **Option B:** Per-property pricing (e.g., £5/property/month, similar to Turno/Breezeway)
- **Option C:** Freemium (free for 1 property, paid for additional properties)
- **Option D:** Free during MVP beta (6 months), then paid

**Recommendation:** Option D (free beta) to maximize feedback and iteration speed, then transition to Option A (flat fee £25-50/month) based on value delivered

---

### 2. Contractor Accounts & Marketplace

**Question:** Should contractors have free accounts in MVP, or is this Phase 2?
**Options:**
- **Option A:** Yes, contractors can create free accounts in MVP (receive notifications, update work orders via mobile app)
- **Option B:** No, contractors are just entries in property manager's database (no login, no app access) - simpler MVP

**Recommendation:** Option A - Contractor accounts add significant value (photo uploads, status updates) and differentiate from competitors. Low development cost with React Native code sharing.

---

### 3. Tenant Portal Priority

**Question:** Is tenant portal truly MVP, or can it be deprioritized to Phase 2?
**Context:** Industry data shows 19% UK tenant portal adoption. Development cost ~2-3 weeks. Value is moderate.
**Options:**
- **Option A:** Include basic tenant portal in MVP (maintenance requests, payment view, document access)
- **Option B:** Deprioritize to Phase 2, focus MVP on property manager + contractor workflows

**Recommendation:** Option B - Deprioritize tenant portal to Phase 2. MVP should nail property manager experience first. Tenants can report issues via phone/email/WhatsApp in MVP.

---

### 4. AI Photo Verification Accuracy Threshold

**Question:** What accuracy level is "good enough" for MVP basic quality checks?
**Context:** Google Vision API can detect basic issues (too dark, too blurry) with ~85-90% accuracy. Custom models (Phase 2) can reach 95%+.
**Options:**
- **Option A:** Target 80%+ accuracy (acceptable for MVP, users understand it's helping, not perfect)
- **Option B:** Target 90%+ accuracy (requires more complex logic, longer development)
- **Option C:** No specific target, just implement basic checks and iterate based on user feedback

**Recommendation:** Option C - Implement basic checks (brightness, blur, content detection), collect user feedback and false positive/negative data, iterate in Phase 2.

---

### 5. Offline Functionality Depth

**Question:** How much offline functionality is truly needed for MVP?
**Options:**
- **Option A:** Full offline mode (create work orders, update status, upload photos, complete cleanings - all queued for sync)
- **Option B:** Read-only offline (view cached data, but cannot create/edit - graceful degradation)
- **Option C:** No offline support in MVP (error message: "No internet connection, please try again later")

**Recommendation:** Option A - Full offline mode is critical differentiator for rural property use case (Jamie persona). React Native supports offline well with libraries like Redux Persist or WatermelonDB. Extra complexity worth it for target market.

---

### 6. Cleaning Company B2B Features

**Question:** Should we include any B2B features for cleaning companies in MVP, or wait for Phase 2?
**Context:** Batch invoicing, team dispatch, SLA tracking identified as major gaps. Development cost ~3-4 weeks.
**Options:**
- **Option A:** Include in MVP as separate module (cleaning companies can sign up, property managers can hire them)
- **Option B:** Phase 2 only, MVP focuses on property manager hiring individual cleaners

**Recommendation:** Option B - Phase 2 only. MVP should validate property manager workflows first. Adding two-sided marketplace prematurely risks chicken-and-egg problem and delays launch.

---

### 7. Scottish STL Compliance Fields

**Question:** What specific fields/features are required for Scottish STL licensing compliance?
**Context:** Research indicates mandatory licensing, but exact platform requirements need legal validation.
**Action Required:** Interview Scottish property lawyer or consult Scottish STL licensing authority to define:
- Required certificate fields (license number, issue date, expiration)
- Renewal reminder timing (60 days before expiration? 90 days?)
- Additional compliance requirements (fire risk assessments, public liability insurance tracking)

**Recommendation:** Conduct legal research before finalizing property profile and compliance tracking fields. Can launch MVP without Scotland-specific features, add in Phase 2 after validation.

---

### 8. Platform Launch Geography

**Question:** Should we launch UK-wide or Scotland-only for MVP?
**Options:**
- **Option A:** Scotland-only (focused marketing, Scottish STL compliance as wedge)
- **Option B:** UK-wide (larger market, but less targeted positioning)
- **Option C:** Scottish Highlands + Lake District (two highest-value cabin markets)

**Recommendation:** Option C - Launch in Scottish Highlands and Lake District simultaneously. Target cabin/lodge owners specifically. Expand to rest of UK in Phase 2 after product-market fit proven.

---

### 9. Multi-Platform Launch Sequence

**Question:** Launch iOS + Android + Web simultaneously, or sequence?
**Context:** React Native allows simultaneous iOS/Android development. Web app is separate React codebase.
**Options:**
- **Option A:** Simultaneous launch (iOS, Android, Web) - maximum reach, but 4-6 weeks extra development
- **Option B:** Mobile first (iOS + Android), web 4-6 weeks later
- **Option C:** iOS first (Scotland has high iOS penetration), Android + Web later

**Recommendation:** Option A - Simultaneous launch. React Native significantly reduces iOS/Android duplication. Web app is necessary for desktop users (property managers doing accounting, reporting). Extra 4-6 weeks worth it to avoid fragmented user base.

---

### 10. Payment Processor

**Question:** Stripe only for MVP, or add GoCardless?
**Context:** Stripe supports UK card payments and bank transfers. GoCardless specializes in UK direct debit (better for recurring rent). GoCardless integration ~2 weeks additional dev.
**Options:**
- **Option A:** Stripe only for MVP (faster launch)
- **Option B:** Stripe + GoCardless in MVP (better UK payment support)
- **Option C:** Stripe for MVP, GoCardless in Phase 2

**Recommendation:** Option C - Stripe only for MVP. GoCardless is valuable for recurring rent collection (direct debit), but can be added in Phase 2 after validating payment workflows. Stripe sufficient for MVP contractor payments and one-off rent payments.

---

## Initial User Stories for Backlog

### Epic 1: Property Management

**US-1.1:** As a property manager, I want to create a property profile with address, photos, and amenities, so that I can manage all property details in one place.
**Acceptance Criteria:**
- User can create property with name, address, property type, bedrooms, bathrooms
- User can upload up to 20 photos to property gallery
- User can add access instructions (lockbox code, key location)
- Property saved and appears in property list

**US-1.2:** As a property manager, I want to upload and organize compliance certificates per property, so that I have easy access to gas safety, electrical, and EPC certificates.
**Acceptance Criteria:**
- User can upload PDF or image file to property
- User assigns category (Gas Safety, Electrical, EPC, Other)
- User can set expiration date for certificate
- Certificate displays with status (valid, expiring soon, expired)

**US-1.3:** As a property manager, I want to receive notifications when compliance certificates are expiring, so that I can renew them on time and avoid fines.
**Acceptance Criteria:**
- System sends push notification 60 days before certificate expiration
- System sends second notification 30 days before expiration
- System sends third notification 7 days before expiration
- Notification links directly to property page to upload renewed certificate

---

### Epic 2: Work Order Management

**US-2.1:** As a property manager, I want to create a work order for maintenance issues at a property, so that I can track and assign repairs.
**Acceptance Criteria:**
- User can create work order with property, title, priority, category, description
- User can attach photos to work order
- User can assign due date
- Work order saved with status "Open"

**US-2.2:** As a property manager, I want to assign a work order to a contractor from my database, so that they are notified and can start work.
**Acceptance Criteria:**
- User selects contractor from dropdown (filtered by specialty)
- Contractor receives SMS + push notification (if has account) with work order details
- Work order status changes to "Assigned"
- Property manager sees confirmation: "Work order assigned to [contractor name]"

**US-2.3:** As a contractor, I want to receive work order notifications on my mobile phone, so that I can respond quickly to property manager requests.
**Acceptance Criteria:**
- Contractor receives push notification when work order assigned
- If priority = Emergency, contractor also receives SMS
- Notification includes: Property address, issue description, priority, due date
- Contractor can tap notification to open work order in mobile app

**US-2.4:** As a contractor, I want to update work order status and add photos as I complete work, so that the property manager has visibility into my progress.
**Acceptance Criteria:**
- Contractor taps "Start Work" → status changes to "In Progress", start time logged
- Contractor can add photos during work (labeled "During")
- Contractor can add notes (updates on progress)
- Contractor taps "Complete Work" → status changes to "Completed", end time logged, must upload at least 1 "after" photo

**US-2.5:** As a property manager, I want to view all work orders filtered by status and property, so that I can prioritize urgent issues.
**Acceptance Criteria:**
- User sees list of all work orders
- User can filter by status (Open, Assigned, In Progress, Completed)
- User can filter by property (multi-select dropdown)
- User can filter by priority
- Default view: Active work orders (Open, Assigned, In Progress) sorted by due date

---

### Epic 3: Photo Upload & AI Quality Checks

**US-3.1:** As a property manager, I want to take photos directly from my mobile camera and attach to work orders, so that I can document issues quickly during property visits.
**Acceptance Criteria:**
- User taps "Add Photo" in work order → options: "Take Photo" or "Choose from Library"
- Camera launches, user takes photo
- Photo preview shown, user can retake or confirm
- Photo uploads to work order with timestamp and GPS (if enabled)
- Photo appears in work order details

**US-3.2:** As a property manager, I want the system to warn me if my photo is too dark or blurry, so that I can retake a clear photo.
**Acceptance Criteria:**
- After photo upload, system runs quality check (Google Vision API)
- If photo too dark: Warning message: "Photo too dark, please retake in better lighting"
- If photo too blurry: Warning message: "Photo is blurry, please hold still and retake"
- User can proceed anyway (soft warning) or retake photo
- Quality check result logged (for analytics and model training)

**US-3.3:** As a property manager, I want to see work order photos organized by "Before", "During", and "After", so that I can track progress visually.
**Acceptance Criteria:**
- Work order details page shows photos in timeline:
  - "Before" photos (uploaded at creation) labeled and grouped
  - "During" photos (uploaded while status = In Progress) labeled and grouped
  - "After" photos (uploaded at completion) labeled and grouped
- Each photo shows timestamp and who uploaded (property manager or contractor name)
- User can click photo to view full-size

---

### Epic 4: Cleaning Coordination

**US-4.1:** As a property manager, I want to create a photo checklist template for cleaning, so that I can reuse it for multiple cleans at the same property.
**Acceptance Criteria:**
- User creates checklist template with name (e.g., "Standard Cabin Clean")
- User adds checklist items (e.g., "Kitchen cleaned", "Bedroom linens changed")
- For each item, user can mark "Photo required" (checkbox)
- User can reorder items (drag-and-drop)
- Template saved and appears in template library

**US-4.2:** As a property manager, I want to schedule a cleaning task with a photo checklist, so that my cleaner knows exactly what to do and document.
**Acceptance Criteria:**
- User creates cleaning task with property, date/time, estimated duration
- User assigns cleaner from database
- User selects photo checklist template (or creates custom checklist)
- Cleaner receives notification with task details and checklist
- Task status: Scheduled

**US-4.3:** As a cleaner, I want to follow a photo checklist in my mobile app, so that I complete all required tasks and upload proof photos.
**Acceptance Criteria:**
- Cleaner opens cleaning task in mobile app
- Checklist displayed as step-by-step list
- For each item with "photo required", cleaner must tap "Take Photo" before checking off
- System validates photo quality (not too dark, not too blurry) before accepting
- Cleaner cannot check off item until photo uploaded and passes quality check
- Progress indicator shows: "3 of 8 items completed"

**US-4.4:** As a cleaner, I want to report a maintenance issue I find during cleaning, so that the property manager can fix it before the next guest.
**Acceptance Criteria:**
- While completing checklist, cleaner taps "Report Issue"
- Form fields: Issue description, category (dropdown: Plumbing, Electrical, etc.), photo (required)
- Cleaner submits issue
- System auto-creates draft work order for property manager
- Property manager receives notification: "Issue reported during cleaning at [property]"
- Property manager can approve and assign contractor, or dismiss if not needed

**US-4.5:** As a property manager, I want to receive a completion report after each clean, so that I can verify quality and approve payment.
**Acceptance Criteria:**
- After cleaner marks task complete, system auto-generates report
- Report includes: Property, cleaner name, scheduled vs. actual time, checklist status (all items checked), all photos, issues reported (if any)
- Property manager receives notification: "Cleaning completed, view report"
- Property manager can view report, rate cleaner (1-5 stars), and approve

---

### Epic 5: Offline Functionality

**US-5.1:** As a property manager visiting remote properties without mobile signal, I want to create work orders offline, so that I don't have to remember tasks until I get back to civilization.
**Acceptance Criteria:**
- User opens mobile app without internet connection
- App displays banner: "Offline Mode - Changes will sync when reconnected"
- User can access cached property data (properties, contractors, past work orders)
- User creates work order with all fields (property, title, description, photos)
- Work order saved locally on device, added to sync queue
- Status indicator shows: "1 work order pending sync"

**US-5.2:** As a property manager, I want my offline changes to automatically sync when I regain internet connection, so that I don't have to manually trigger sync.
**Acceptance Criteria:**
- App detects internet connection restored (WiFi or cellular data)
- Sync starts automatically in background (no manual "Sync Now" button)
- Sync progress indicator: "Syncing 2 work orders, 5 photos..."
- After sync completes: Notification: "All offline changes synced successfully"
- If sync fails (server error): Error notification with retry option

**US-5.3:** As a property manager, I want my offline photos to be stored safely even if the app crashes, so that I don't lose documentation.
**Acceptance Criteria:**
- Photos taken offline stored in app's private storage (not deleted on app close)
- If app crashes or user force-quits, photos persist in local storage
- On app relaunch, sync queue includes unsent photos
- After successful sync, local photos deleted (server is source of truth)

---

### Epic 6: Calendar & Scheduling

**US-6.1:** As a property manager, I want to see all bookings, cleanings, and work orders in a unified calendar, so that I can plan my week.
**Acceptance Criteria:**
- Calendar view displays:
  - Bookings (blue color, shows guest check-in/check-out dates)
  - Cleaning tasks (green color, shows scheduled time)
  - Work orders with due dates (orange color, red if overdue)
- User can toggle layers on/off (show/hide bookings, cleanings, work orders)
- User can switch views: Month, Week, Day

**US-6.2:** As a property manager, I want to manually add bookings to the calendar, so that I can track occupancy and schedule cleanings.
**Acceptance Criteria:**
- User clicks date on calendar → "Add Booking"
- User enters: Property, guest name (optional), check-in date/time, check-out date/time
- Booking saved and appears on calendar (blocks property availability)
- User can edit or delete booking

**US-6.3:** As a property manager, I want the system to prompt me to schedule cleaning after a booking check-out, so that I don't forget to coordinate turnover.
**Acceptance Criteria:**
- After user creates booking, system prompts: "Schedule cleaning after check-out?"
- If user clicks "Yes", system auto-creates cleaning task:
  - Scheduled time = Check-out time + 30 minutes (configurable buffer)
  - Property = Same as booking
  - Estimated duration = Default for property (e.g., 2 hours)
- User can edit cleaning task before saving
- If user clicks "No", prompt dismissed (no cleaning task created)

---

### Epic 7: Contractor Management

**US-7.1:** As a property manager, I want to maintain a database of trusted contractors with their specialties and contact details, so that I can quickly assign work orders.
**Acceptance Criteria:**
- User creates contractor profile with: Name, company name, phone, email, specialties (multi-select), service area, hourly rate, notes
- User can mark contractor as "Preferred" (appears at top of assignment dropdown)
- Contractor saved and appears in contractor list

**US-7.2:** As a property manager, I want to view a contractor's work history, so that I can decide whether to hire them again.
**Acceptance Criteria:**
- User opens contractor profile
- Work history section shows list of all work orders assigned to this contractor
- For each work order: Property, date, title, status, cost, property manager's rating
- Summary stats displayed: Total jobs completed, average response time, average cost, average rating

**US-7.3:** As a property manager, I want to rate a contractor after work order completion, so that I remember their performance for future jobs.
**Acceptance Criteria:**
- After work order status = Completed, property manager can rate contractor
- Rating interface: Star rating (1-5 stars, required), review text (optional)
- Rating saved and visible in contractor profile work history
- Rating is internal only (not shared across users in MVP)

---

### Epic 8: Payment & Invoicing

**US-8.1:** As a property manager, I want to generate and send invoices to tenants for rent and services, so that I can collect payments.
**Acceptance Criteria:**
- User creates invoice with: Recipient (tenant email), property, line items (description + amount), due date
- User can add custom line items (e.g., "Rent for October", "Cleaning fee", "Damage repair")
- Total auto-calculated from line items
- User clicks "Send Invoice" → Email sent to tenant with invoice PDF and payment link (Stripe)

**US-8.2:** As a tenant, I want to pay my rent online via secure payment link, so that I don't have to write checks or do bank transfers.
**Acceptance Criteria:**
- Tenant receives invoice email with "Pay Now" button
- Tenant clicks button → redirected to Stripe-hosted payment page (PCI-compliant)
- Payment methods: Credit/debit card, bank transfer (Stripe supports UK)
- After payment, tenant receives confirmation email
- Invoice status auto-updates to "Paid", property manager receives notification

**US-8.3:** As a contractor, I want to submit an invoice after completing work, so that I can get paid.
**Acceptance Criteria:**
- Contractor opens completed work order in mobile app
- Contractor taps "Submit Invoice"
- Contractor enters: Labor cost, materials cost (total auto-calculated)
- Contractor can upload invoice file (PDF or photo)
- Invoice submitted to property manager for approval
- Property manager receives notification: "Invoice pending approval: £180 from [contractor]"

**US-8.4:** As a property manager, I want to approve contractor invoices and mark them as paid, so that I can track expenses.
**Acceptance Criteria:**
- Property manager reviews invoice and work order completion (photos, details)
- Property manager clicks "Approve & Mark as Paid"
- Property manager enters: Payment date, payment reference (optional)
- Invoice status changes to "Paid"
- Invoice appears in payment history (expenses section)

---

## Next Steps for Product Owner

1. **Review this discovery document** with founder and stakeholders. Validate personas, workflows, and requirements.

2. **Make decisions** on the 10 open questions listed above (pricing, contractor accounts, tenant portal, etc.).

3. **Create comprehensive PRD** using this document as foundation. Work section-by-section with founder to refine requirements.

4. **Prioritize user stories** for Sprint 1-6 (MVP development). Recommend starting with Epic 1 (Property Management) and Epic 2 (Work Orders) as foundation.

5. **Create wireframes** for core workflows:
   - Property manager mobile app: Home screen, property details, work order creation, photo upload
   - Contractor mobile app: Work order list, work order details, photo upload, status updates
   - Cleaner mobile app: Cleaning task checklist, photo upload, issue reporting
   - Web app: Property portfolio dashboard, calendar view, work order list, contractor database

6. **Conduct user research** (10-20 cabin/lodge owner interviews) to validate:
   - Workflow accuracy (does our proposed flow match their real-world process?)
   - Feature prioritization (which MVP features are truly must-haves?)
   - Pricing validation (will they pay £50-75/month for this?)

7. **Define acceptance criteria** in detail for each user story (see examples above, expand for all stories).

8. **Plan MVP beta testing** strategy (10-20 users, 2-month beta period, feedback collection process).

---

**Document Status:** Discovery Complete - Ready for PRD Development

**Prepared by:** Mary (Business Analyst), RightFit Services
**Date:** 2025-10-27
**For:** Product Owner - Begin PRD generation using this as foundation
