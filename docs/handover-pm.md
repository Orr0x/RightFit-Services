# Project Manager Handover Document
## RightFit Services - MVP Project Plan

**Document Version:** 1.0
**Date:** 2025-10-27
**From:** Business Analyst (Mary)
**To:** Project Manager (PM)
**Project:** RightFit Services - Property Maintenance SaaS Platform

---

## 🎯 Your Mission

Create a **comprehensive 12-month project plan** for RightFit Services - a mobile-first property maintenance platform for UK landlords. You will manage timeline, resources, risks, and delivery of an MVP built by a **solo developer** with **minimal budget** in **3 months**.

Your project plan must:
- ✅ **Be realistic** for a solo developer working part-time (20-30 hrs/week)
- ✅ **Manage risks proactively** (solo dev = single point of failure)
- ✅ **Track progress weekly** (tight 12-week timeline, no slack)
- ✅ **Deliver MVP on time** (Month 3) or pivot/cut scope early
- ✅ **Plan beyond MVP** (Months 4-12: beta testing, launch, growth)

---

## 📋 Project Context (Read This First)

### What is RightFit Services?

A **reliable, mobile-native property maintenance platform** targeting UK landlords managing 1-50 long-term let properties.

**Core Problem We're Solving:**
- Current market leader (Arthur Online) has chronic reliability issues (3.8/5 rating, multi-day outages, £62.50-126/month)
- Landlords waste 10-20 hours/week on manual maintenance coordination
- Existing platforms lack mobile-first design or have limited features

**Our Solution:**
"Arthur Online's features without the outages, at half the price (£15-25/month)"

**Key Differentiators:**
1. **Rock-solid reliability** (99.5%+ uptime target)
2. **True mobile-first** (native iOS/Android apps with offline mode)
3. **Basic AI photo quality checks** (Google Vision API)
4. **UK compliance tracking** (Gas Safety, Electrical, EPC reminders)
5. **Competitive pricing** (£15-25/month vs. £60-120 competitors)

### Business Objectives

**Month 3 (MVP Launch):**
- 10-20 beta users (friends, family, local landlords)
- Core features working (properties, work orders, mobile app, offline mode)
- 99%+ uptime (no critical bugs)

**Month 6 (Paid Launch):**
- 50-100 paying customers
- £750-2,000 MRR
- 80%+ monthly retention
- Word-of-mouth growth starting

**Month 12 (Product-Market Fit):**
- 200-500 paying customers
- £4k-12.5k MRR (£48k-150k ARR)
- 85%+ retention
- NPS 30+

---

## 🚨 Critical Constraints (Non-Negotiable)

### Solo Developer Bootstrap

**Team:**
- **ONE full-stack developer** (founder) with React Native, Node.js, PostgreSQL experience
- **Part-time availability:** 20-30 hours/week (keeping day job during MVP development)
- **No designers, no QA, no DevOps team** - developer does everything

**PM Implications:**
- Single point of failure (if developer sick, project stops)
- Context switching expensive (developer wears multiple hats)
- Burnout risk HIGH (must monitor workload, enforce breaks)
- No delegation possible (PM can't ask someone else to help)

### Minimal Budget (£2k-5k)

**Budget breakdown:**
- AWS: £50-200/month (£150-600 for 3 months)
- Domain: £10/year
- Tools: GitHub (free), Sentry free tier, UptimeRobot free tier
- APIs: Google Vision API free tier (first 1,000 images/month), Twilio £40-100 for 3 months
- Total: £200-710 for MVP development

**PM Implications:**
- No paid project management tools (use GitHub Projects free tier, Trello, Notion)
- No paid design tools (use Figma free tier, Draw.io)
- No paid user research (beta users volunteer)
- No contractor help (developer must do everything)

### 3-Month MVP Timeline (12 Weeks)

**Non-negotiable deadline:** MVP must launch by end of Month 3

**PM Implications:**
- **ZERO buffer time** built into 12-week plan (every week counts)
- Weekly progress checks mandatory (can't wait for bi-weekly standups)
- Scope cuts must happen EARLY (Week 2-3, not Week 10)
- No "we'll fix it later" technical debt (will delay launch)

---

## 📦 MVP Scope (What to Deliver)

### 10 Core Features - Week-by-Week Plan

**Week 1-2: Foundation**
- Authentication & multi-tenancy setup (JWT, user registration/login)
- Property management (CRUD: create, read, update, delete properties)
- AWS infrastructure setup (EC2, RDS PostgreSQL, S3 buckets)

**Week 3-4: Core Workflows**
- Work order management (create, assign, track status)
- Contractor database (CRUD, assign to work orders, SMS notifications via Twilio)
- Photo upload to S3

**Week 5-6: Mobile App Foundation**
- React Native app setup (iOS + Android)
- Navigation (tab navigation, stack navigation)
- Authentication screens (login, signup)
- Properties list and work orders list (mobile)

**Week 7-8: Offline Mode (CRITICAL - Most Complex)**
- Offline data persistence (AsyncStorage or SQLite)
- Sync queue (queue work orders and photos created offline)
- Auto-sync when connection restored
- Offline indicator UI (banner, sync status)

**Week 9: AI Photo Quality**
- Google Vision API integration
- Photo quality check (detect too dark, too blurry)
- Warning UI (show user quality issues, let them proceed anyway)

**Week 10: UK Compliance**
- Certificate upload and storage
- Certificate expiration tracking (Gas Safety annual, Electrical 5-year, EPC 10-year)
- Push notification setup (Firebase Cloud Messaging)
- Background job for certificate reminders (cron job on EC2)

**Week 11: Payments & Subscription**
- Stripe integration (subscription checkout)
- Pricing page (£15-25/month plans)
- Free 30-day trial setup (no credit card required)
- Subscription management (view active subscriptions, admin panel)

**Week 12: Polish & Deploy**
- Bug fixes from internal testing
- CI/CD pipeline setup (GitHub Actions)
- Error monitoring setup (Sentry)
- Uptime monitoring (UptimeRobot, status page)
- App Store and Google Play submission (if ready, otherwise soft launch via TestFlight/APK)

### Features EXPLICITLY CUT from MVP

❌ Tenant portal (Phase 2 - Month 6+)
❌ Payment processing for rent (Phase 2)
❌ Cleaning coordination (Phase 2 - STR-specific)
❌ Calendar/booking management (Phase 2)
❌ Contractor marketplace (Phase 2)
❌ Advanced reporting (Phase 2)
❌ In-app messaging (Phase 2)
❌ Advanced AI (custom models - Phase 2)
❌ Channel integrations (Airbnb APIs - Phase 3)
❌ MTD HMRC integration (Phase 3)

---

## 📅 Detailed 12-Month Timeline

### Phase 1: MVP Development (Months 1-3)

**Month 1: Foundation & Core Features**

**Week 1 (Days 1-7):**
- [ ] Day 1-2: Project setup (GitHub repo, local dev environment, AWS account setup)
- [ ] Day 3-5: Authentication & multi-tenancy (user registration, login, JWT tokens, tenant isolation)
- [ ] Day 6-7: Property management CRUD (create/read/update/delete properties)
- **Milestone:** Developer can create account, add properties
- **Risk Check:** Is developer comfortable with tech stack? Any blockers?

**Week 2 (Days 8-14):**
- [ ] Day 8-10: Property list UI (React web app - Material-UI components)
- [ ] Day 11-14: Property photos upload to S3, AWS infrastructure setup (EC2, RDS, S3 buckets, CloudFront CDN)
- **Milestone:** Properties list working on web, photos uploading to S3
- **Risk Check:** AWS costs under control? Performance acceptable?

**Week 3 (Days 15-21):**
- [ ] Day 15-17: Work order data model + API (create, read, update work orders)
- [ ] Day 18-21: Work order CRUD UI (web app - form to create work order, list view, detail view)
- **Milestone:** Can create and view work orders on web
- **Risk Check:** Is developer on schedule? Any scope creep?

**Week 4 (Days 22-28):**
- [ ] Day 22-24: Contractor database (CRUD, assign contractors to work orders)
- [ ] Day 25-28: Twilio SMS integration (send SMS when work order assigned)
- **Milestone:** Can assign work orders to contractors, SMS sent successfully
- **Risk Check:** Twilio costs acceptable? SMS delivery rate >95%?
- **Go/No-Go Decision Point:** Are we on track for MVP? If 2+ weeks behind, cut features NOW.

**Month 2: Mobile App & Offline Mode**

**Week 5 (Days 29-35):**
- [ ] Day 29-31: React Native project setup (iOS + Android, navigation setup)
- [ ] Day 32-35: Authentication screens (login, signup) + Properties list (mobile)
- **Milestone:** Mobile app shows properties list after login
- **Risk Check:** React Native build issues? iOS/Android compatibility problems?

**Week 6 (Days 36-42):**
- [ ] Day 36-38: Work orders list (mobile) + Work order detail screen
- [ ] Day 39-42: Create work order form (mobile) with photo upload from camera
- **Milestone:** Can create work orders on mobile, take photos with camera
- **Risk Check:** Camera permissions working? Photo upload performance acceptable?

**Week 7 (Days 43-49):**
- [ ] Day 43-45: Offline data persistence (AsyncStorage or SQLite setup, cache properties and work orders locally)
- [ ] Day 46-49: Offline mode - create work orders offline (save to local DB + sync queue)
- **Milestone:** Can create work orders offline, saved to local queue
- **Risk Check:** Offline storage working reliably? Data persists after app closed?

**Week 8 (Days 50-56):**
- [ ] Day 50-52: Sync queue processing (upload photos to S3, create work orders via API when online)
- [ ] Day 53-56: Auto-sync when connection restored, retry logic with exponential backoff
- **Milestone:** Offline work orders sync automatically when online
- **Risk Check:** Sync reliable? No data loss? Conflict resolution working?
- **Go/No-Go Decision Point:** Offline mode working? This is CRITICAL feature - if broken, delay other features to fix.

**Month 3: Final Features & Launch**

**Week 9 (Days 57-63):**
- [ ] Day 57-59: Google Vision API integration (analyze photos, detect quality issues)
- [ ] Day 60-63: Photo quality check UI (warn user if too dark/blurry, let them proceed)
- **Milestone:** AI photo quality checks working, warns user of issues
- **Risk Check:** Google Vision API costs acceptable? Accuracy >70%?

**Week 10 (Days 64-70):**
- [ ] Day 64-66: Certificate upload and storage (Gas Safety, Electrical, EPC)
- [ ] Day 67-70: Certificate expiration tracking + push notifications setup (Firebase Cloud Messaging)
- **Milestone:** Can upload certificates, receive push notifications before expiration
- **Risk Check:** Push notifications working on iOS + Android? Background job running?

**Week 11 (Days 71-77):**
- [ ] Day 71-73: Stripe integration (subscription checkout, £15-25/month plans)
- [ ] Day 74-77: Free 30-day trial setup, pricing page, subscription management
- **Milestone:** Users can subscribe, Stripe webhooks working
- **Risk Check:** Stripe test mode working? Production mode ready?

**Week 12 (Days 78-84):**
- [ ] Day 78-80: Bug fixes from internal testing (developer tests all features end-to-end)
- [ ] Day 81-83: CI/CD pipeline (GitHub Actions), Sentry error monitoring, UptimeRobot monitoring
- [ ] Day 84: **MVP LAUNCH** - Soft launch to 10-20 beta users (friends, family, local landlords)
- **Milestone:** MVP launched, beta users using app
- **Success Metrics:** 99%+ uptime Week 1, no critical bugs, >10 beta users actively using

---

### Phase 2: Beta Testing & Iteration (Months 4-5)

**Month 4: Beta Testing**

**Week 13-14:**
- Recruit 10-20 beta users (local landlord groups, Facebook groups, friends/family)
- Onboard beta users (1-on-1 video calls, help them import properties)
- Monitor usage (Sentry errors, UptimeRobot uptime, manual check-ins)
- Collect feedback (WhatsApp group, weekly surveys)

**Week 15-16:**
- Fix critical bugs reported by beta users (prioritize: data loss bugs, crash bugs, offline sync issues)
- Small UX improvements (confusing flows, unclear error messages)
- Performance optimizations (slow API endpoints, photo upload speed)

**Milestone (End of Month 4):**
- 20+ beta users actively using app weekly
- <5 critical bugs remaining
- Uptime >99%
- Positive feedback (users say "easier than Arthur Online", "love mobile app")

**Month 5: Iteration & Prepare for Launch**

**Week 17-18:**
- Add "nice-to-have" features cut from MVP (e.g., basic web app improvements, contractor work history view)
- Refine onboarding flow (first-time user experience, tooltips)
- Create help documentation (FAQ, video tutorials for common tasks)

**Week 19-20:**
- Finalize pricing (validate £15-25/month with beta users)
- Prepare marketing website (landing page with features, pricing, signup)
- App Store and Google Play listing (screenshots, description, submit for review)
- Prepare launch plan (email beta users, post in landlord groups, soft PR)

**Milestone (End of Month 5):**
- App Store and Google Play approved (live in stores)
- Marketing website live
- 30+ beta users, ready to convert to paid
- Launch ready for Month 6

---

### Phase 3: Paid Launch & Growth (Months 6-12)

**Month 6: Paid Launch**

- **Launch Event:** Email beta users (convert free → paid, £15-20/month)
- **Marketing:** Post in UK landlord Facebook groups, Reddit r/UKLandlords, landlord forums
- **Goal:** 50-100 paying customers by end of Month 6 (£750-2,000 MRR)

**Months 7-9: Growth Phase 1**

- **Marketing:** Word-of-mouth, content marketing (blog posts on UK compliance, landlord tips)
- **Product:** Fix bugs, minor UX improvements, monitor retention
- **Goal:** 100-200 paying customers by Month 9 (£1.5k-4k MRR)

**Months 10-12: Growth Phase 2 & Phase 2 Features**

- **Phase 2 Features:** Based on user feedback, add 1-2 high-demand features (e.g., tenant portal if requested, cleaning coordination if STR users join)
- **Marketing:** Partnerships with landlord associations, contractors (referral program)
- **Goal:** 200-500 paying customers by Month 12 (£4k-12.5k MRR, product-market fit)

**Success Metrics (End of Year 1):**
- ✅ 200-500 paying customers
- ✅ £4k-12.5k MRR
- ✅ 85%+ retention
- ✅ NPS 30+
- ✅ Positive cash flow (MRR > AWS costs + minimal operating expenses)

---

## 🎯 Sprint Structure (2-Week Sprints)

### Recommended Agile Approach for Solo Developer

**Sprint Length:** 2 weeks (14 days)

**Sprint Ceremonies:**

**Sprint Planning (Every 2 weeks, Monday, 1 hour):**
- Review last sprint (what shipped, what didn't, why)
- Plan next sprint (select user stories from backlog, estimate hours)
- Identify risks (blockers, unknowns, dependencies)
- PM + Developer only (no team to coordinate)

**Daily Check-Ins (Every day, 10 minutes):**
- Developer logs progress (GitHub Projects, Trello, or Notion)
- PM reviews progress asynchronously (no meeting needed)
- Red flags escalated immediately (via WhatsApp/email)

**Sprint Review (Every 2 weeks, Friday, 30 minutes):**
- Demo working features (developer shows PM what was built)
- Check against acceptance criteria (PO's PRD)
- Identify bugs or gaps

**Sprint Retrospective (Every 2 weeks, Friday, 30 minutes):**
- What went well? (keep doing)
- What didn't go well? (stop doing or improve)
- Action items for next sprint

---

### Sprint Breakdown (6 Sprints for MVP)

**Sprint 1 (Week 1-2): Foundation**
- User authentication & multi-tenancy
- Property management (CRUD)
- AWS infrastructure setup
- **Goal:** Developer can create account, add properties

**Sprint 2 (Week 3-4): Core Workflows**
- Work order management (CRUD)
- Contractor database (CRUD)
- SMS notifications (Twilio)
- **Goal:** Can create work orders, assign contractors, SMS sent

**Sprint 3 (Week 5-6): Mobile App Foundation**
- React Native app setup
- Authentication + Properties list (mobile)
- Work orders list + Create work order (mobile)
- Photo upload from camera
- **Goal:** Mobile app functional for core workflows

**Sprint 4 (Week 7-8): Offline Mode (CRITICAL)**
- Offline data persistence
- Sync queue (work orders + photos)
- Auto-sync when online
- **Goal:** Offline mode working reliably (MOST IMPORTANT SPRINT)

**Sprint 5 (Week 9-10): AI + Compliance**
- Google Vision API integration (photo quality)
- Certificate upload and expiration tracking
- Push notifications (Firebase CM)
- **Goal:** AI photo checks + compliance reminders working

**Sprint 6 (Week 11-12): Payments + Polish**
- Stripe integration (subscription checkout)
- Bug fixes from testing
- CI/CD pipeline, monitoring
- **Goal:** MVP launched to beta users

---

## 📊 Progress Tracking & KPIs

### Weekly Progress Metrics (Track Every Week)

**Development Velocity:**
- User stories completed vs. planned (e.g., "8 of 10 stories done")
- Hours worked (target: 20-30 hours/week)
- GitHub commits and pull requests (activity indicator)

**Feature Completion:**
- % of MVP features complete (e.g., "40% complete by end of Week 5")
- Blockers or delays (document reasons: technical complexity, API issues, etc.)

**Quality Indicators:**
- Critical bugs open (target: <5)
- Test coverage (manual testing checklist completion)
- Uptime (target: 99%+ from Day 1)

**Budget Tracking:**
- AWS costs month-to-date (alert if >£100/month during MVP)
- API costs (Twilio SMS, Google Vision API)
- Total spend vs. £5k budget

### Red Flags (Escalate Immediately)

🚨 **Developer 1+ week behind schedule** → Review scope, cut features immediately
🚨 **Critical bug blocking progress** → Stop new features, fix bug first (don't accumulate technical debt)
🚨 **AWS costs >£200/month** → Optimize infrastructure or risk budget overrun
🚨 **Developer working >40 hours/week consistently** → Burnout risk, enforce breaks or extend timeline
🚨 **Offline sync not working by Week 8** → This is CRITICAL feature, delay other features if needed

### Go/No-Go Decision Points

**Week 4 (End of Sprint 2):**
- **Question:** Are we on track for 12-week MVP?
- **Criteria:** Foundation + core workflows complete, <1 week behind schedule
- **If NO:** Cut 1-2 features immediately (e.g., delay UK compliance to Phase 2, simplify contractor database)

**Week 8 (End of Sprint 4):**
- **Question:** Is offline mode working reliably?
- **Criteria:** Can create work orders offline, sync automatically when online, no data loss
- **If NO:** Extend Sprint 4 by 1 week, delay Sprint 5 features (this is non-negotiable differentiator)

**Week 10 (End of Sprint 5):**
- **Question:** Are we ready for final sprint (polish + launch)?
- **Criteria:** All core features working, <10 critical bugs, uptime >99%
- **If NO:** Cut remaining features (AI photo quality, UK compliance), focus on bug fixes and stability

---

## ⚠️ Risk Management

### High-Risk Areas & Mitigation Strategies

**Risk 1: Solo Developer Single Point of Failure**

- **Impact:** If developer sick/injured, project stops entirely
- **Probability:** Medium (10-20% chance over 3 months)
- **Mitigation:**
  - Maintain detailed documentation (README, architecture diagrams, setup guides)
  - Use GitHub for version control (code not lost if developer unavailable)
  - Identify backup developer (friend, contractor) who could step in for emergencies (even if not ideal)
  - Build 1-week buffer into timeline (Week 13 as buffer, not Week 12)

**Risk 2: Offline Mode Technical Complexity**

- **Impact:** Offline mode doesn't work reliably → core differentiator fails → MVP not competitive
- **Probability:** High (40-50% chance of significant challenges)
- **Mitigation:**
  - Allocate 2 full weeks (Sprint 4) to offline mode (not 1 week)
  - Research React Native offline solutions upfront (Week 1-2: review WatermelonDB, Redux Persist, AsyncStorage)
  - Build offline mode early (Week 7-8, not Week 11) so there's time to fix issues
  - If offline mode fails by Week 8, consider pivot: Web-only MVP, add mobile offline in Phase 2

**Risk 3: Scope Creep**

- **Impact:** Developer adds "nice-to-have" features, MVP delayed, timeline blown
- **Probability:** Medium-High (30-40% chance for solo founders)
- **Mitigation:**
  - PM enforces scope ruthlessly (weekly reviews: "Is this feature in MVP scope?")
  - Document cut features in "Phase 2 Backlog" (developer knows they're not forgotten, just delayed)
  - User stories have clear acceptance criteria (developer knows when feature is "done", not gold-plated)
  - Go/No-Go decisions at Week 4 and Week 8 (force scope cuts early if behind)

**Risk 4: AWS Cost Overrun**

- **Impact:** AWS costs exceed £200/month, budget blown, can't afford hosting
- **Probability:** Low-Medium (15-25% chance if not monitored)
- **Mitigation:**
  - Set up AWS billing alerts (£50, £100, £150 thresholds)
  - Review AWS Trusted Advisor weekly (cost optimization recommendations)
  - Use t3.micro/t3.small instances (not larger), Single-AZ RDS for dev (not Multi-AZ)
  - Monitor S3 storage growth (set lifecycle policies to archive old photos after 90 days)

**Risk 5: App Store Rejection (iOS)**

- **Impact:** MVP ready but can't launch on App Store, delay launch 1-2 weeks for fixes
- **Probability:** Medium (20-30% chance of initial rejection)
- **Mitigation:**
  - Review Apple App Store Guidelines early (Week 9-10, before submission)
  - Prepare privacy policy, terms of service (required for submission)
  - Submit early (Week 10-11 for TestFlight beta, not waiting until Week 12)
  - Plan for rejection: 1-week buffer (Week 13) to address issues and resubmit

**Risk 6: Low Beta User Adoption**

- **Impact:** Launch to 10-20 beta users, but only 2-3 actively use app → no feedback, can't validate product-market fit
- **Probability:** Medium (25-35% chance if recruitment poor)
- **Mitigation:**
  - Recruit beta users EARLY (Week 10-11, before MVP complete) via landlord Facebook groups, local property investor meetups
  - Offer incentives (free for 6 months, personal onboarding, early feature access)
  - Onboard beta users 1-on-1 (video call, help them import properties, explain features)
  - Over-recruit (aim for 30 beta signups to get 15-20 active users)

**Risk 7: Developer Burnout**

- **Impact:** Developer exhausted by Week 8-10, quality drops, bugs increase, timeline slips
- **Probability:** High (40-50% chance for solo devs working part-time + day job)
- **Mitigation:**
  - PM monitors hours worked (flag if >35 hours/week consistently)
  - Enforce 1 day off per week minimum (no coding Saturdays AND Sundays)
  - Encourage breaks during sprints (not just sprint boundaries)
  - Cut scope if developer overwhelmed (better to ship 8 solid features than 12 rushed ones)
  - Celebrate milestones (end of each sprint: acknowledge progress, not just "what's next?")

---

## 🛠️ Tools & Resources

### Project Management Tools (Free Tier)

**Recommended Stack:**
- **GitHub Projects** (free) - Kanban board, sprint planning, issue tracking
- **Notion** (free) - Documentation, meeting notes, knowledge base
- **Trello** (free) - Alternative to GitHub Projects if preferred
- **Google Sheets** - Budget tracking, sprint velocity tracking

**Why not paid tools (Jira, Asana)?**
- Cost: £0 vs. £10-20/user/month (unnecessary for solo dev)
- Complexity: Jira overkill for 1 developer, Trello/GitHub Projects sufficient

### Communication Tools

**Developer ↔ PM:**
- **WhatsApp** or **Slack** (free) - Daily check-ins, red flag escalations
- **Weekly video call** (30-60 minutes) - Sprint planning, retrospective

**Beta Users ↔ Founder:**
- **WhatsApp group** or **Discord** (free) - Beta user feedback, support
- **Email** - Announcements, surveys (via Google Forms)

### Monitoring & Tracking

**Uptime Monitoring:**
- **UptimeRobot** (free - 50 monitors, 5-min interval)
- Public status page (transparency differentiator vs. Arthur Online)

**Error Monitoring:**
- **Sentry** (free - 5k errors/month)
- Real-time error alerts via email/Slack

**Analytics:**
- **Google Analytics** (free) - Web traffic (if applicable)
- **Firebase Analytics** (free) - Mobile app usage (optional for MVP, add later if needed)

### Budget Tracking Template

**Google Sheets Template:**

| Category | Budgeted | Actual (Month 1) | Actual (Month 2) | Actual (Month 3) | Total | Notes |
|----------|----------|------------------|------------------|------------------|-------|-------|
| AWS EC2 | £45 | £15 | £15 | £15 | £45 | t3.small |
| AWS RDS | £45 | £15 | £15 | £15 | £45 | db.t3.micro |
| AWS S3 | £60 | £10 | £20 | £30 | £60 | Photo storage |
| Twilio SMS | £90 | £20 | £30 | £40 | £90 | 2,000 SMS total |
| Google Vision | £0 | £0 | £0 | £0 | £0 | Free tier |
| Domain | £10 | £10 | £0 | £0 | £10 | rightfitservices.co.uk |
| **Total** | **£250** | **£70** | **£80** | **£100** | **£250** | Under budget ✓ |

**Alert Rules:**
- If any month >£150 → review and optimize
- If total >£400 by Month 3 → cut costs immediately (downsize instances, reduce SMS)

---

## 📚 Reference Documents

For full project context, please read:

1. **`docs/brief.md`** - Complete project brief (strategy, market, MVP scope, business objectives, constraints)
2. **`docs/po-discovery.md`** - Product requirements (user stories, workflows, functional requirements)
3. **`docs/handover-architect.md`** - Technical architecture (review to understand technical dependencies, risks)

---

## ✅ Your Deliverables

Please create the following project management documents:

### 1. 12-Month Project Roadmap (HIGH PRIORITY)

**Gantt chart or timeline showing:**
- Month 1-3: MVP development (Sprint 1-6 breakdown)
- Month 4-5: Beta testing & iteration
- Month 6: Paid launch
- Month 7-12: Growth & Phase 2 features

**Milestones:**
- End of Month 3: MVP launched to beta users
- End of Month 5: App Store & Google Play approved
- End of Month 6: 50-100 paying customers
- End of Month 12: 200-500 paying customers, product-market fit

**Tool:** Google Sheets, Excel, Notion timeline, or TeamGantt (free tier)

### 2. Sprint Plan (HIGH PRIORITY)

**For each of 6 sprints (2 weeks each), define:**
- Sprint goal (what are we trying to achieve?)
- User stories to complete (from PO's PRD)
- Estimated hours per story (solo dev estimates during sprint planning)
- Definition of done (acceptance criteria met, tested, deployed)
- Risks and dependencies (technical unknowns, API integrations)

**Sprint 1 Example:**

```
**Sprint 1: Foundation (Week 1-2)**

**Goal:** Developer can create account and add properties

**User Stories:**
- US-Auth-1: User registration (8 hours)
- US-Auth-2: User login (4 hours)
- US-Auth-3: JWT token refresh (3 hours)
- US-Prop-1: Create property (6 hours)
- US-Prop-2: List properties (4 hours)
- US-Prop-3: Edit property (4 hours)
- US-Prop-4: Delete property (soft delete) (3 hours)
- AWS-1: Setup EC2, RDS, S3 (8 hours)

**Total Estimated Hours:** 40 hours (fits 20-30 hrs/week over 2 weeks)

**Definition of Done:**
- All acceptance criteria met (from PO's PRD)
- Manually tested (happy path + edge cases)
- Deployed to staging environment
- No critical bugs

**Risks:**
- AWS setup delays (first time using ECS?) → Mitigation: Use EC2 + Docker Compose if ECS too complex

**Dependencies:**
- AWS account approved (can take 24-48 hours) → Action: Create AWS account Day 1
```

**Create sprint plans for Sprint 1-6.**

### 3. Risk Register (MEDIUM PRIORITY)

**For each risk identified above, track:**

| Risk ID | Risk Description | Impact (H/M/L) | Probability (H/M/L) | Mitigation Strategy | Owner | Status |
|---------|------------------|----------------|---------------------|---------------------|-------|--------|
| R01 | Solo developer single point of failure | High | Medium | Maintain docs, GitHub, identify backup dev | PM | Open |
| R02 | Offline mode technical complexity | High | High | Allocate 2 weeks, build early, pivot plan | PM + Dev | Open |
| R03 | Scope creep | Medium | Medium-High | Weekly scope reviews, enforce MVP | PM | Open |
| R04 | AWS cost overrun | Medium | Low-Medium | Billing alerts, weekly Trusted Advisor reviews | PM | Open |
| R05 | App Store rejection | Medium | Medium | Review guidelines Week 9, submit early | Dev | Open |
| R06 | Low beta user adoption | Medium | Medium | Recruit early Week 10, over-recruit 30+ | PM | Open |
| R07 | Developer burnout | High | High | Monitor hours, enforce breaks, cut scope | PM | Open |

**Update risk status weekly:**
- Open → In Progress → Mitigated → Closed

### 4. Weekly Status Report Template (MEDIUM PRIORITY)

**Every Friday, PM creates 1-page status report:**

```
**Week X Status Report**
**Date:** 2025-11-XX

**🎯 Sprint Goal:** [Sprint 2 - Core Workflows]

**✅ Completed This Week:**
- User story US-WO-1: Create work order (DONE)
- User story US-WO-2: List work orders (DONE)
- User story US-Contractor-1: Create contractor (DONE)

**🚧 In Progress:**
- User story US-WO-3: Assign work order to contractor (80% complete, SMS integration remaining)

**🚨 Blockers:**
- Twilio API rate limit hit during testing → Mitigated by using test credentials with higher limit

**📊 Metrics:**
- Hours worked this week: 28 hours (on track)
- User stories completed: 3 of 4 planned (75% velocity)
- Critical bugs open: 2 (one blocking next sprint, prioritize)
- AWS costs MTD: £35 (under budget ✓)

**⚠️ Risks:**
- Developer working 35+ hours/week → Monitor for burnout, may need to cut scope

**🎯 Next Week Plan:**
- Complete SMS integration (US-WO-3)
- Start Sprint 3: Mobile app setup
- Review Sprint 2 retrospective feedback

**🟢 Overall Status:** ON TRACK (green)
[OR 🟡 AT RISK (yellow) if concerns, 🔴 OFF TRACK (red) if critical issues]
```

**Share with:** Developer, stakeholders (founder if separate from developer)

### 5. Beta User Recruitment Plan (LOW PRIORITY - Month 3)

**Plan for recruiting 20-30 beta users:**

**Target Audience:**
- UK landlords managing 3-20 properties
- Frustrated with current tools (Arthur Online, spreadsheets)
- Active in online communities (Facebook groups, Reddit r/UKLandlords)

**Recruitment Channels:**
1. **Personal Network** (friends, family, colleagues who are landlords) - Goal: 5-10 users
2. **Local Landlord Meetups** (Birmingham, Midlands area) - Goal: 5-10 users
3. **Facebook Groups** ("UK Landlords", "Property Investment UK", "Buy to Let UK") - Goal: 5-10 users
4. **Reddit** (r/UKLandlords, r/LandlordUK) - Goal: 3-5 users

**Offer:**
- Free for 6 months (no credit card required)
- Personal 1-on-1 onboarding (30-minute video call)
- Direct line to founder (WhatsApp group for support and feedback)
- Early feature access (Phase 2 features tested with beta users first)

**Timeline:**
- Week 10: Post in Facebook groups, Reddit (soft pre-launch announcement)
- Week 11: Email personal network, attend local meetup
- Week 12: Onboard first 10 beta users
- Month 4: Onboard remaining 10-20 beta users

---

## 🎯 Success Criteria for Your Project Plan

Your project plan is successful if:

✅ **MVP launches on time** (end of Month 3, all 10 core features working)
✅ **Budget stays under £5k** for MVP development (AWS + API costs)
✅ **Developer doesn't burn out** (<35 hours/week average, enforced breaks)
✅ **20+ beta users** recruited by Month 4
✅ **50-100 paying customers** by Month 6 (paid launch successful)
✅ **Risks managed proactively** (weekly risk reviews, mitigation actions taken)
✅ **Clear go-forward plan** for Months 7-12 (Phase 2 features, growth strategy)

---

## ❓ Questions You May Have

**Q: What if developer is 2+ weeks behind schedule by Week 6?**
A: Call emergency Go/No-Go meeting. Options: (1) Cut 2-3 features (e.g., delay AI photo quality, UK compliance to Phase 2), (2) Extend MVP timeline to Month 4 (delay paid launch), (3) Bring in contractor help (if budget allows). DO NOT just hope developer catches up - they won't.

**Q: How do I track progress if developer isn't using GitHub Projects?**
A: PM creates tracking system (Trello, Notion, Google Sheets). Every Friday: PM reviews GitHub commits + sends developer checklist: "What user stories completed this week? What's in progress? Any blockers?" Developer fills out, PM updates tracking.

**Q: What if AWS costs are £300/month by Month 2?**
A: EMERGENCY OPTIMIZATION. Review AWS Trusted Advisor immediately. Likely causes: (1) Using too large instances (downsize t3.medium → t3.small), (2) RDS Multi-AZ when Single-AZ acceptable, (3) S3 storage exploding (check if test data accumulating), (4) Data transfer costs (optimize CloudFront caching). If can't get under £150/month, project at risk.

**Q: What if offline mode doesn't work by Week 8 (end of Sprint 4)?**
A: CRITICAL BLOCKER. Options: (1) Extend Sprint 4 by 1 week (delay Sprint 5 and 6 by 1 week each, launch Week 13 instead of Week 12), (2) Pivot to simpler offline mode (cache read-only data, don't support offline creates - reduces differentiator but better than nothing), (3) Cut offline mode entirely (major pivot - no longer competitive advantage, reconsider product positioning).

**Q: How do I enforce "no scope creep" with a solo founder/developer who's excited about features?**
A: Weekly scope review: "Is this feature in the MVP scope doc? No? Then it goes in Phase 2 backlog." Document cut features so developer knows they're not forgotten. Remind developer: "MVP goal is validation, not perfection. Phase 2 is where we add polish." If developer resists, escalate: "If we add this feature, what do you want to cut to stay on timeline?"

**Q: What if only 5 beta users sign up by Week 12?**
A: Acceptable for soft launch (quality > quantity). Proceed with 5 users, onboard them deeply, collect detailed feedback. Continue recruiting during Month 4 (goal: 15-20 total by end of Month 4). If <10 by end of Month 4, that's a problem - may indicate product positioning issue or poor targeting.

---

## 🚀 Next Steps After You Deliver Project Plan

1. **Review plan with founder/developer** (get buy-in, adjust if needed)
2. **Set up project tracking tools** (GitHub Projects, Notion, WhatsApp)
3. **Create Week 1 sprint plan** (detailed task breakdown for first 2 weeks)
4. **Kick off Sprint 1** (Monday of Week 1, developer starts coding)
5. **Weekly check-ins** (every Friday, status report + risk review)

---

**Questions? Need clarification? Flag your assumptions and proceed. Looking forward to a realistic, actionable project plan!**

**Good luck! 📅**
