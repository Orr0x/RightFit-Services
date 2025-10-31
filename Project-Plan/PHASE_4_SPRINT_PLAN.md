# Phase 4 Sprint Plan: Competitive Differentiation
## RightFit Services - Features Competitors Don't Have

**Sprint Duration:** 3 weeks (21 days)
**Dates:** Weeks 11-13 of Quality Roadmap
**Sprint Goal:** Build unique features that define the category
**Total Story Points:** 88 points (~29 points/week)
**Team Capacity:** 1 developer, 30-40 hours/week

**Created:** 2025-10-30
**Product Owner:** Sarah (PO Agent)
**Status:** ✅ READY (Pending Phase 3 Completion)

---

## 🎯 Sprint Goal

**Create defensible competitive advantages:**
- AI Insights: Reactive → Predictive maintenance
- Tenant Portal: Manual logging → Automated request flow (GAME-CHANGER)
- WhatsApp: SMS-only → UK contractor preference
- OCR: Manual data entry → Automatic certificate extraction
- Smart Matching: Manual → AI-powered contractor recommendations

**Why This Matters:**
Competitors are established with feature parity. This phase builds the moat - features so valuable that switching away becomes painful for users.

---

## 📊 Current State Assessment

### What We Have (From Phase 3) ✅
- 70%+ test coverage (bulletproof foundation)
- Polished UX with design system
- Dark mode and accessibility compliant
- Search and advanced filtering
- Batch operations and reporting
- Notification center
- Professional mobile photo workflow

### Competitive Gaps ⚠️
- **AI Insights:** No predictive maintenance
- **Tenant Portal:** Landlords manually log tenant requests (time-consuming)
- **WhatsApp:** UK contractors prefer WhatsApp, we only have SMS/Email
- **OCR:** Manual certificate data entry
- **Smart Matching:** Manual contractor selection
- **Scheduling:** No calendar or contractor availability

---

## 🗓️ Sprint Breakdown

### Week 11: AI-Powered Insights (28 points)
**Focus:** Predictive, not reactive

| Story ID | Story | Points | Priority |
|----------|-------|--------|----------|
| US-AI-1 | Predictive Maintenance Analysis | 8 | P0 🔴 |
| US-AI-2 | Work Order Auto-Categorization | 5 | P0 🔴 |
| US-AI-3 | Priority Suggestion Engine | 5 | P1 🟠 |
| US-AI-4 | Smart Contractor Recommendations | 6 | P0 🔴 |
| US-AI-5 | OCR Certificate Data Extraction | 4 | P1 🟠 |

**Week 11 Deliverable:** AI features providing actionable insights

---

### Week 12: Tenant Portal (GAME-CHANGER) (32 points)
**Focus:** Unique differentiator no competitor has

| Story ID | Story | Points | Priority |
|----------|-------|--------|----------|
| US-TENANT-1 | Tenant User Type & Authentication | 8 | P0 🔴 |
| US-TENANT-2 | Tenant Dashboard & Request Submission | 10 | P0 🔴 |
| US-TENANT-3 | Landlord Request Review Workflow | 8 | P0 🔴 |
| US-TENANT-4 | Tenant Status Updates & Notifications | 4 | P0 🔴 |
| US-TENANT-5 | Tenant Feedback & Ratings | 2 | P1 🟠 |

**Week 12 Deliverable:** Tenant portal reducing landlord workload by 50%+

---

### Week 13: WhatsApp Integration (UK Market Fit) (28 points)
**Focus:** UK contractors prefer WhatsApp to SMS

| Story ID | Story | Points | Priority |
|----------|-------|--------|----------|
| US-WHATSAPP-1 | WhatsApp Business API Setup | 8 | P0 🔴 |
| US-WHATSAPP-2 | Send Work Orders via WhatsApp | 8 | P0 🔴 |
| US-WHATSAPP-3 | WhatsApp Photo Sharing | 5 | P0 🔴 |
| US-WHATSAPP-4 | Two-Way WhatsApp Communication (Optional) | 5 | P1 🟠 |
| US-WHATSAPP-5 | WhatsApp Notification Preferences | 2 | P1 🟠 |

**Week 13 Deliverable:** WhatsApp integration for UK contractor communication

---

## 📋 User Stories (High-Level Summaries)

### 🤖 WEEK 11: AI-Powered Insights

---

#### US-AI-1: Predictive Maintenance Analysis
**Priority:** P0 🔴 | **Points:** 8 | **Effort:** ~8 hours

**As a** landlord
**I want** predictive maintenance recommendations
**So that** I can prevent issues before they become emergencies

**Acceptance Criteria:**
- [ ] Analyze historical work order patterns
- [ ] Identify recurring issues by property
- [ ] Detect seasonal maintenance patterns
- [ ] Calculate average time between failures (MTBF)
- [ ] Prediction models for common maintenance:
  - Boiler service intervals
  - Appliance replacement based on age
  - Seasonal maintenance (gutter cleaning, etc.)
- [ ] Confidence scores for predictions (0-100%)
- [ ] Proactive recommendations displayed on dashboard
- [ ] Schedule recommendations in calendar

**Technical Implementation:**
- Historical data analysis (6+ months of work orders)
- Simple statistical models (moving averages, frequency analysis)
- Rule-based predictions (e.g., gas safety annual requirement)
- Age-based predictions for appliances
- Dashboard widget for recommendations

---

#### US-AI-2: Work Order Auto-Categorization
**Priority:** P0 🔴 | **Points:** 5 | **Effort:** ~5 hours

**As a** user
**I want** work orders automatically categorized
**So that** I save time on manual categorization

**Acceptance Criteria:**
- [ ] AI categorizes work orders based on description text
- [ ] Categories: PLUMBING, ELECTRICAL, HEATING, ROOFING, etc.
- [ ] Keyword-based classification (simple NLP)
- [ ] Confidence score shown (Low/Medium/High)
- [ ] Manual override option (user can change category)
- [ ] Learn from manual corrections (store patterns)
- [ ] Batch re-categorize existing work orders

**Technical Implementation:**
- Keyword matching (e.g., "leak" → PLUMBING)
- TF-IDF scoring for category relevance
- Simple machine learning (optional: naive Bayes)
- Fallback to UNCATEGORIZED if confidence <50%

---

#### US-AI-3: Priority Suggestion Engine
**Priority:** P1 🟠 | **Points:** 5 | **Effort:** ~5 hours

**As a** user
**I want** AI to suggest work order priority
**So that** urgent issues are flagged automatically

**Acceptance Criteria:**
- [ ] Analyze description for urgency keywords
- [ ] Urgency keywords: "emergency", "urgent", "leak", "fire", "flooding"
- [ ] Suggest priority level (HIGH, MEDIUM, LOW)
- [ ] Show suggestion with confidence score
- [ ] User can accept or override suggestion
- [ ] Learn from user corrections
- [ ] Flag emergencies automatically (e.g., "gas leak")

**Technical Implementation:**
- Keyword matching with weighted scores
- Emergency keyword detection (auto-flag)
- Historical priority patterns by category
- User feedback loop for learning

---

#### US-AI-4: Smart Contractor Recommendations
**Priority:** P0 🔴 | **Points:** 6 | **Effort:** ~6 hours

**As a** landlord
**I want** contractor recommendations for work orders
**So that** I assign the right contractor quickly

**Acceptance Criteria:**
- [ ] Match work order category to contractor specialty
- [ ] Consider contractor past performance:
  - Average completion time
  - Work order count (experience)
  - Preferred contractor flag
- [ ] Future-ready: Proximity to property (geo-distance)
- [ ] Future-ready: Contractor availability
- [ ] Show top 3 recommended contractors
- [ ] Display recommendation reasoning ("Best match for PLUMBING")
- [ ] Quick assign button from recommendations

**Technical Implementation:**
- Specialty matching (exact or related)
- Performance scoring algorithm
- Sort by: specialty match → preferred → performance
- Display as autocomplete suggestions in assign field

---

#### US-AI-5: OCR Certificate Data Extraction
**Priority:** P1 🟠 | **Points:** 4 | **Effort:** ~4 hours

**As a** landlord
**I want** certificate data extracted automatically
**So that** I don't manually type dates and numbers

**Acceptance Criteria:**
- [ ] OCR scan uploaded certificate PDFs/images
- [ ] Extract issue date
- [ ] Extract expiry date
- [ ] Extract certificate number
- [ ] Extract issuer name
- [ ] Auto-fill form fields with extracted data
- [ ] Show confidence scores for each field
- [ ] Manual override option (user can edit)
- [ ] Flag low-confidence extractions for review

**Technical Implementation:**
- Google Vision API (already integrated for photos)
- Text extraction from PDF/images
- Regex patterns for date detection (DD/MM/YYYY, MM/DD/YYYY)
- Pattern matching for certificate numbers
- Validation: expiry date > issue date

---

### 🏠 WEEK 12: Tenant Portal (GAME-CHANGER)

---

#### US-TENANT-1: Tenant User Type & Authentication
**Priority:** P0 🔴 | **Points:** 8 | **Effort:** ~8 hours

**As a** landlord
**I want** to invite tenants to the platform
**So that** tenants can submit maintenance requests directly

**Acceptance Criteria:**
- [ ] Add `TENANT` role to User model (existing: LANDLORD, CONTRACTOR)
- [ ] Tenant belongs to a property (1-to-1 relationship)
- [ ] Landlord invites tenant via email
- [ ] Tenant registration flow (email link + password setup)
- [ ] Tenant authentication (email + password)
- [ ] Tenant cannot access landlord features
- [ ] Tenant sees only their property's data
- [ ] Multi-tenancy enforcement (tenant scoped to property)

**Technical Implementation:**
- Update User schema with `role` enum (LANDLORD, CONTRACTOR, TENANT)
- Add `property_id` to User for tenant association
- Invite email template (Resend)
- Tenant registration endpoint
- Role-based access control (RBAC) middleware
- Tenant-scoped queries (filter by property_id)

---

#### US-TENANT-2: Tenant Dashboard & Request Submission
**Priority:** P0 🔴 | **Points:** 10 | **Effort:** ~10 hours

**As a** tenant
**I want** to submit maintenance requests
**So that** I can report issues directly to my landlord

**Acceptance Criteria:**
- [ ] Tenant dashboard (simple, clean UI)
- [ ] View my maintenance requests (status tracking)
- [ ] Submit new maintenance request form:
  - Category dropdown (PLUMBING, ELECTRICAL, etc.)
  - Urgency level (Not urgent, Soon, Urgent)
  - Description text area
  - Photo upload (1-10 photos)
  - Preferred contact method (Email, Phone, SMS)
- [ ] Request confirmation (email sent)
- [ ] Request appears in landlord's work order queue
- [ ] Mobile-friendly UI (tenants use phones)

**Technical Implementation:**
- TenantRequest model (or extend WorkOrder with source flag)
- API endpoint: `POST /api/tenant/requests`
- Form validation (Zod schema)
- Photo upload to S3 (tenant-scoped)
- Email notification to landlord (Resend)
- Mobile-first UI design

---

#### US-TENANT-3: Landlord Request Review Workflow
**Priority:** P0 🔴 | **Points:** 8 | **Effort:** ~8 hours

**As a** landlord
**I want** to review tenant requests
**So that** I can quickly convert them to work orders

**Acceptance Criteria:**
- [ ] Notification when tenant submits request
- [ ] Tenant requests appear in dedicated queue
- [ ] Review tenant request screen:
  - View request details
  - View uploaded photos
  - Tenant contact info
  - Property details
- [ ] Convert to work order (1-click action):
  - Pre-fills title, description, category, priority
  - Pre-attaches tenant photos
  - Assigns to property
- [ ] Assign contractor immediately (optional)
- [ ] Tenant auto-notified when converted
- [ ] Reject/close request (with reason - optional)

**Technical Implementation:**
- API endpoint: `POST /api/tenant/requests/:id/convert`
- Create WorkOrder with tenant request data
- Link photos from request to work order
- Send email notification to tenant
- Update request status to CONVERTED or CLOSED

---

#### US-TENANT-4: Tenant Status Updates & Notifications
**Priority:** P0 🔴 | **Points:** 4 | **Effort:** ~4 hours

**As a** tenant
**I want** status updates on my requests
**So that** I know when maintenance is scheduled and completed

**Acceptance Criteria:**
- [ ] Email when request received (confirmation)
- [ ] Email when request converted to work order
- [ ] Email when contractor assigned
- [ ] Email when work in progress
- [ ] Email when work completed
- [ ] Optional SMS notifications
- [ ] In-app notification center (future)
- [ ] Status visible in tenant dashboard

**Technical Implementation:**
- Event-driven notifications (work order status changes)
- Email templates for each status
- SMS integration (Twilio - optional)
- Tenant notification preferences

---

#### US-TENANT-5: Tenant Feedback & Ratings
**Priority:** P1 🟠 | **Points:** 2 | **Effort:** ~2 hours

**As a** tenant
**I want** to rate completed work
**So that** my landlord knows about service quality

**Acceptance Criteria:**
- [ ] Rate completed work (1-5 stars)
- [ ] Leave feedback comment (optional)
- [ ] Feedback visible to landlord
- [ ] Contractor performance tracking (aggregate ratings)
- [ ] Feedback email sent after work completion

**Technical Implementation:**
- WorkOrderFeedback model (rating, comment, work_order_id)
- API endpoint: `POST /api/tenant/feedback`
- Feedback request email (1 day after completion)
- Contractor rating aggregation on profile

**Why This is a Game-Changer:**
- Competitors: Landlords manually log tenant requests (phone calls, texts, WhatsApp)
- RightFit: Automated flow reduces landlord workload by 50%+
- Creates audit trail for disputes
- Tenants feel heard and valued
- Unique differentiator in market

---

### 💬 WEEK 13: WhatsApp Integration (UK Market Fit)

---

#### US-WHATSAPP-1: WhatsApp Business API Setup
**Priority:** P0 🔴 | **Points:** 8 | **Effort:** ~8 hours

**As a** developer
**I want** WhatsApp Business API integrated
**So that** we can send messages via WhatsApp

**Acceptance Criteria:**
- [ ] WhatsApp Business account created
- [ ] API access setup (Twilio or Meta official API)
- [ ] UK phone number verified (+44)
- [ ] Message templates approved by WhatsApp:
  - Work order assignment
  - Work order status update
  - Certificate expiry reminder
- [ ] WhatsApp service class (similar to TwilioService)
- [ ] Test message sent successfully
- [ ] Error handling for failed messages
- [ ] Message delivery status tracking

**Technical Implementation:**
- Choose provider: Twilio WhatsApp API or Meta Business API
- Create WhatsAppService class
- Environment variables for API keys
- Message template submission and approval
- Webhook for delivery status (optional)

**UK Context:**
- WhatsApp penetration: 95%+ in UK
- Contractors prefer WhatsApp to SMS
- Rich media sharing (photos, PDFs)
- Read receipts built-in

---

#### US-WHATSAPP-2: Send Work Orders via WhatsApp
**Priority:** P0 🔴 | **Points:** 8 | **Effort:** ~8 hours

**As a** landlord
**I want** to send work orders to contractors via WhatsApp
**So that** contractors receive notifications on their preferred channel

**Acceptance Criteria:**
- [ ] Send work order details to contractor WhatsApp
- [ ] Message includes:
  - Work order title
  - Property address
  - Issue description
  - Priority level
  - Due date (if set)
  - Photos (if available)
  - Landlord contact info
- [ ] Link to work order in mobile app (deep link)
- [ ] Message sent when work order assigned
- [ ] Retry logic for failed messages
- [ ] Delivery confirmation logged

**Technical Implementation:**
- WhatsApp message template with variables
- Send on work order assignment event
- Deep link to mobile app: `rightfit://work-orders/:id`
- Message delivery tracking
- Fallback to SMS if WhatsApp fails

---

#### US-WHATSAPP-3: WhatsApp Photo Sharing
**Priority:** P0 🔴 | **Points:** 5 | **Effort:** ~5 hours

**As a** landlord
**I want** to send work order photos via WhatsApp
**So that** contractors see issues before arriving

**Acceptance Criteria:**
- [ ] Send photos attached to work order via WhatsApp
- [ ] Support multiple photos (up to 5 per message)
- [ ] Photos compressed for WhatsApp (max 5MB per image)
- [ ] Photo URLs public (temporary signed URLs from S3)
- [ ] Photos sent with work order assignment message
- [ ] Option to send photos later (manual send)

**Technical Implementation:**
- Generate S3 signed URLs (24-hour expiry)
- WhatsApp media message API
- Image compression (Sharp library)
- Batch photo sending (multiple messages if >5 photos)

---

#### US-WHATSAPP-4: Two-Way WhatsApp Communication (Optional)
**Priority:** P1 🟠 | **Points:** 5 | **Effort:** ~5 hours

**As a** contractor
**I want** to reply to work orders via WhatsApp
**So that** I can update status without opening the app

**Acceptance Criteria:**
- [ ] Contractor replies to WhatsApp message
- [ ] Webhook receives contractor message
- [ ] Update work order status based on keywords:
  - "Accepted" → ASSIGNED to IN_PROGRESS
  - "Completed" → IN_PROGRESS to COMPLETED
  - "Can't do it" → ASSIGNED to PENDING
- [ ] Landlord sees contractor reply in app (notes field)
- [ ] Reply confirmation sent to contractor

**Technical Implementation:**
- WhatsApp webhook for incoming messages
- Keyword parsing (simple NLP)
- Update WorkOrder status via API
- Store message in work order notes
- Reply with confirmation message

**Note:** This is optional/future enhancement - requires webhook setup and message parsing complexity.

---

#### US-WHATSAPP-5: WhatsApp Notification Preferences
**Priority:** P1 🟠 | **Points:** 2 | **Effort:** ~2 hours

**As a** contractor
**I want** to choose WhatsApp as my notification method
**So that** I receive work orders on WhatsApp instead of SMS

**Acceptance Criteria:**
- [ ] Contractor profile: Add WhatsApp phone number field
- [ ] Notification preferences: Toggle WhatsApp on/off
- [ ] Verify WhatsApp number (send test message)
- [ ] Landlord can see contractor's preferred notification method
- [ ] Respect contractor preferences when sending notifications
- [ ] Support multiple notification methods simultaneously

**Technical Implementation:**
- Add `whatsapp_phone` to Contractor model
- Add `notification_preferences` JSONB field
- Verification flow (send code, confirm)
- Update notification service to check preferences

---

## 📈 Success Metrics

### Phase 4 Goals
| Metric | Start | Target | How We'll Measure |
|--------|-------|--------|-------------------|
| **Predictive Maintenance** | None | 80%+ | Prediction accuracy vs. historical data |
| **Auto-Categorization** | None | 85%+ | Correct category predictions |
| **Tenant Portal Adoption** | 0% | 60%+ | % of landlords inviting tenants |
| **Landlord Time Savings** | 0% | 50%+ | Time to convert tenant request → work order |
| **WhatsApp Delivery Rate** | None | 95%+ | WhatsApp message delivery success |
| **Contractor Response Rate** | Unknown | +30% | WhatsApp vs. SMS response rate comparison |

### Week-by-Week Targets
- **Week 11 End:** AI features providing value, auto-categorization 80%+ accurate
- **Week 12 End:** Tenant portal tested with 2-3 real landlord+tenant pairs
- **Week 13 End:** WhatsApp integration working for UK contractors

---

## 🚧 Risks & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| WhatsApp API approval delays | Medium | High | Start template approval early, have fallback to SMS |
| AI predictions inaccurate | Medium | Medium | Start simple (rule-based), iterate with data |
| Tenant portal adds complexity | Low | Medium | Keep initial version simple, iterate based on feedback |
| OCR accuracy low for UK certificates | Medium | Low | Manual override always available, improve over time |

---

## 📝 Definition of Done (Phase 4)

Phase 4 is complete when:
- [ ] ✅ Predictive maintenance recommendations displayed
- [ ] ✅ Work orders auto-categorized with 80%+ accuracy
- [ ] ✅ Smart contractor recommendations working
- [ ] ✅ OCR extracting certificate data (70%+ accuracy)
- [ ] ✅ Tenant portal functional (invite → submit → convert → notify)
- [ ] ✅ Tenant portal tested with 2+ real users
- [ ] ✅ WhatsApp Business API approved and integrated
- [ ] ✅ Work orders sent via WhatsApp to UK contractors
- [ ] ✅ Photos shared via WhatsApp
- [ ] ✅ WhatsApp delivery rate 95%+
- [ ] ✅ All tests passing (70%+ coverage maintained)
- [ ] ✅ User feedback shows these features are valuable

---

## 📦 Dependencies & Prerequisites

**Before Starting Week 11:**
- [ ] Phase 3 complete (search, batch ops, reporting working)
- [ ] Historical work order data (6+ months for predictions)
- [ ] Google Vision API quota sufficient for OCR
- [ ] AI model testing dataset prepared

**Before Starting Week 12:**
- [ ] Email templates designed for tenant communications
- [ ] Tenant portal UI mockups reviewed
- [ ] RBAC (role-based access control) tested

**Before Starting Week 13:**
- [ ] WhatsApp Business account application submitted
- [ ] UK phone number acquired (+44)
- [ ] Message templates drafted for approval
- [ ] Twilio or Meta API account created

**Tools Needed:**
- [ ] WhatsApp Business API (Twilio or Meta)
- [ ] Google Vision API (already integrated)
- [ ] Simple ML library (optional: TensorFlow.js, Brain.js)
- [ ] UK phone number for WhatsApp verification

---

## 🎯 Next Steps (After Phase 4)

Once Phase 4 is complete, proceed to:
- **Phase 5:** Beta Testing & Refinement (Weeks 14-16) - Real-world validation with UK landlords

---

## 📞 Questions & Support

**Product Owner:** Sarah (PO Agent)
**Documentation:** See [QUALITY_ROADMAP.md](QUALITY_ROADMAP.md) for overall plan
**Previous Phases:**
- [PHASE_1_SPRINT_PLAN.md](PHASE_1_SPRINT_PLAN.md) - Foundation Hardening
- [PHASE_2_SPRINT_PLAN.md](PHASE_2_SPRINT_PLAN.md) - UX Excellence
- [PHASE_3_SPRINT_PLAN.md](PHASE_3_SPRINT_PLAN.md) - Feature Completeness

---

**Status:** ✅ READY (Pending Phase 3 Completion)
**Created:** 2025-10-30
**Last Updated:** 2025-10-30
**Sprint Starts:** After Phase 3 completion

---

**Let's build features competitors can't match! 🚀**
