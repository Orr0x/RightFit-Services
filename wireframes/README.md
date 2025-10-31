# RightFit Services - Wireframes Documentation

**Last Updated:** October 31, 2025
**Status:** Phase 1 - Design & Planning
**Version:** 1.0

---

## Overview

This directory contains comprehensive wireframes for the RightFit Services platform - a dual-service ecosystem (Cleaning + Maintenance) designed for short-term rental property management in the Smoky Mountains region.

### Platform Vision

**Four Interconnected Dashboards:**
1. **Cleaning Dashboard** - Alex's cleaning business operations
2. **Maintenance Dashboard** - Alex's maintenance business operations
3. **Customer Portal** - Lodge managers (like Jane) manage properties and approve quotes
4. **Guest AI Dashboard** - Tablet interface for guests to self-service Q&A and report issues

**Core Strategy:** Cross-sell between services while maintaining operational excellence in both verticals.

---

## Wireframe Documents

### 1. [Cleaning Dashboard Wireframes](./CLEANING_DASHBOARD_WIREFRAMES.md)
**Target User:** Alex (Service Provider)
**Pages:** 5 major screens (200+ lines)

- **Dashboard Homepage** - Today's schedule, cleaner status, issue flags
- **Schedule Calendar** - Drag-and-drop scheduling with route optimization
- **Job Details Modal** - Checklist, photos, cross-sell buttons
- **Cleaners Management** - Performance metrics, GPS tracking
- **Customers List** - Contract status, upsell opportunities

**Key Features:**
- Real-time GPS tracking of cleaners
- Photo documentation (before/after)
- One-click maintenance job creation for issues
- Cross-sell intelligence (identify customers needing maintenance)

**Success Metrics:**
- On-time completion: > 95%
- Cross-sell conversion: > 25% of cleaning-only customers
- Average quality score: > 4.5/5

---

### 2. [Maintenance Dashboard Wireframes](./MAINTENANCE_DASHBOARD_WIREFRAMES.md)
**Target User:** Alex (Service Provider)
**Pages:** 6 major screens (200+ lines)

- **Dashboard Homepage** - Emergency triage (guest-impacting issues first)
- **Job Details Modal** - AI assessment, worker assignment, auto-dispatch
- **Quote Builder** - 2-minute quotes using templates
- **Worker Management** - Skills matrix, GPS tracking, inventory
- **External Contractor Network** - Specialty directory
- **Schedule Calendar** - Week view by worker

**Key Features:**
- AI-powered emergency triage (guest-impacting issues prioritized)
- Smart worker dispatch (skills, location, parts inventory)
- Template-based quote generation (< 2 minutes)
- Live GPS tracking with ETA calculations
- External contractor network for specialty work

**Success Metrics:**
- Emergency response: < 15 minutes (report → worker en route)
- Quote generation: < 2 minutes average
- Quote approval rate: > 70%
- Cross-sell conversion (maint → clean): > 20%

---

### 3. [Customer Portal Wireframes](./CUSTOMER_PORTAL_WIREFRAMES.md)
**Target User:** Jane & Susan (Lodge Managers/Owners)
**Pages:** 5 major screens (200+ lines)

- **Dashboard Homepage** - Property portfolio, urgent actions, upcoming services
- **Property Details** - Complete service history (chronological timeline)
- **Quote Approval** - Mobile-optimized, large buttons, one-tap approval
- **Cleaning-Only View** - Prominent upsell messaging for maintenance
- **Invoices & History** - Financial tracking, spending analytics

**Key Features:**
- Mobile-first design (60%+ of traffic is mobile)
- One-tap quote approval (no login required for small quotes)
- Photo documentation access (all before/after photos)
- Spending analytics and tax reports
- Upsell messaging for cleaning-only customers

**Success Metrics:**
- Portal adoption: > 80% of customers register
- Quote approval speed: < 24 hours (vs. 3 days via email)
- Self-service rate: > 80% of actions (no calls to Alex)
- Upsell conversion: > 25% add 2nd service within 6 months

---

### 4. [Guest AI Dashboard Wireframes](./GUEST_AI_DASHBOARD_WIREFRAMES.md)
**Target User:** Lodge Guests (vacationers staying at properties)
**Device:** Wall-mounted tablet (iPad/Android)
**Pages:** 6 major screens (200+ lines)

- **Home Screen** - Welcome, "Ask Anything" and "Report Issue" buttons
- **AI Chat Interface** - RAG-powered Q&A (WiFi, check-out, restaurants)
- **Issue Triage** - Photo analysis, severity scoring, recommended actions
- **DIY Guide** - Step-by-step instructions with video tutorials
- **Auto-Dispatch** - Create maintenance job, track technician arrival
- **Knowledge Base** - Appliance manuals, local recommendations

**Key Features:**
- RAG-powered AI (retrieves property-specific info)
- Computer vision photo analysis (identify issues, assess severity)
- DIY fix guidance (reduce tech dispatch by 50%)
- Auto-dispatch maintenance (emergency → worker en route in < 20 min)
- No login required (anonymous sessions, auto-reset)

**Success Metrics:**
- Guest usage: > 60% of guests interact during stay
- AI resolution: > 70% of questions answered without human
- DIY success: > 50% of guided fixes work
- Calls to manager: Reduce by 40-50%

---

## Design Principles (Universal)

### 1. Speed First
- Every action completes in < 500ms (perceived speed)
- AI responses in < 2 seconds
- Page loads in < 2 seconds (mobile critical)

### 2. Mobile-Optimized
- 60-70% of traffic is mobile (design for thumbs, not mouse)
- Large touch targets (minimum 44x44px, ideally 60x60px)
- One-handed operation where possible

### 3. Visual Hierarchy
- **Red** = Urgent/Emergency (immediate action required)
- **Orange** = High Priority (act soon, guest-impacting)
- **Yellow** = Monitor (pay attention, not critical)
- **Green** = Good/On Track (all clear)
- **Gray** = Neutral/Informational

### 4. Cross-Sell Integration
- Cleaning Dashboard: Identify maintenance opportunities (issues reported)
- Maintenance Dashboard: Identify cleaning opportunities (no service contract)
- Customer Portal: Contextual upsell messaging (based on service usage)
- Guest AI: Report issues → auto-create maintenance job → upsell opportunity

### 5. Transparency
- Full pricing breakdown (no hidden fees)
- Photo documentation (before/after for all jobs)
- Real-time status updates (GPS tracking, timeline events)
- Complete service history (chronological, searchable)

### 6. Proactive Intelligence
- Surface issues before they become problems
- AI-powered recommendations (preventive maintenance, upsells)
- Risk detection (at-risk customers, underperforming workers)
- Predictive analytics (equipment age, failure patterns)

---

## Technical Architecture

### Core Technologies

**Frontend:**
- React + TypeScript (web dashboards)
- React Native (worker mobile apps)
- Next.js (customer portal, SEO-friendly)
- Tailwind CSS (responsive design system)

**Backend:**
- Node.js + Express (API server)
- PostgreSQL (relational data - jobs, customers, workers)
- Redis (caching, real-time features)
- WebSockets (live updates, GPS tracking)

**AI/ML:**
- OpenAI GPT-4 (conversational AI for guest chat)
- OpenAI Vision API (photo analysis for issue triage)
- Pinecone or Weaviate (vector database for RAG)
- Custom ML models (severity scoring, cross-sell prediction)

**Integrations:**
- Stripe/Square (payment processing)
- Twilio (SMS notifications)
- Google Maps API (GPS tracking, directions, route optimization)
- SendGrid (email notifications)

**Infrastructure:**
- AWS/Vercel (hosting, scalability)
- Cloudflare (CDN, DDoS protection)
- S3 (photo/video storage)
- CloudWatch (monitoring, logging)

---

## Data Model Summary

### Core Tables

1. **customers** - Property managers (Jane, Susan)
2. **properties** - Individual lodges/cabins
3. **cleaning_jobs** - Cleaning service records
4. **maintenance_jobs** - Maintenance service records
5. **workers** - Cleaners and maintenance technicians
6. **quotes** - Maintenance quotes (pending/approved/rejected)
7. **invoices** - Billing and payment records

### Cross-Sell Intelligence Tables

8. **cross_sell_opportunities** - ML-generated upsell leads
9. **customer_segments** - Cleaning-only, maintenance-only, both
10. **upsell_campaigns** - Track campaign engagement and conversions

### Real-Time Tracking Tables

11. **worker_locations** - GPS tracking (updated every 5 min)
12. **job_status_updates** - Timeline events (dispatched, en route, completed)
13. **notifications** - Push, SMS, email notification queue

### AI/Guest Tables

14. **guest_sessions** - Guest tablet interactions
15. **guest_questions** - AI chat Q&A (RAG-powered)
16. **guest_issues** - Issue reports from tablets
17. **ai_assessments** - Computer vision analysis, severity scoring
18. **diy_guides** - Step-by-step repair instructions
19. **property_knowledge_base** - RAG content (appliances, local info)

### Performance Tracking Tables

20. **worker_performance** - Ratings, on-time rate, utilization
21. **customer_ratings** - Job ratings and feedback
22. **analytics_dashboard** - Cached metrics for reporting

---

## Implementation Priority

### Phase 1: Foundation (Weeks 1-8)
**Goal:** Launch core cleaning operations + basic maintenance

**Week 1-2: Cleaning Dashboard Core**
- Dashboard homepage with today's schedule
- Job list with basic filters
- Cleaner contact list
- Manual job assignment

**Week 3-4: Cleaning Real-Time Features**
- GPS tracking integration
- Photo upload (before/after)
- Checklist mobile app
- SMS notifications

**Week 5-6: Maintenance Dashboard Core**
- Dashboard with job list
- Worker management
- Quote builder (templates)
- Quote approval workflow

**Week 7-8: Customer Portal MVP**
- Login and authentication
- Dashboard homepage
- Service history view
- Quote approval screen

**Launch Criteria:**
- 5 pilot customers (2 cleaning-only, 2 both services, 1 maint-only)
- 3 cleaners + 2 maintenance workers
- 30-day pilot with daily check-ins

---

### Phase 2: Intelligence & Automation (Weeks 9-16)
**Goal:** Add AI, cross-sell, and automation features

**Week 9-10: Guest AI Dashboard (Tablet)**
- Home screen + AI chat Q&A
- RAG knowledge base setup
- Video tutorials for common questions

**Week 11-12: Guest Issue Reporting**
- Issue triage wizard
- Photo upload and analysis
- DIY guide display

**Week 13-14: Auto-Dispatch & GPS**
- Auto-create maintenance jobs from guest issues
- Live GPS tracking with ETA
- Worker mobile app integration

**Week 15-16: Cross-Sell Intelligence**
- Opportunity detection (cleaning → maintenance, vice versa)
- Automated proposal generation
- Upsell messaging in customer portal

**Launch Criteria:**
- 10 properties with guest tablets installed
- 80%+ AI Q&A resolution rate
- 25%+ cross-sell conversion (pilot group)

---

### Phase 3: Scale & Optimization (Weeks 17-24)
**Goal:** Expand to 50+ properties, optimize operations

**Week 17-18: Advanced Analytics**
- Performance dashboards (workers, properties)
- Predictive maintenance (equipment age, failure patterns)
- Customer lifetime value tracking

**Week 19-20: External Contractor Network**
- Contractor directory
- Referral workflow
- Performance tracking

**Week 21-22: Advanced Scheduling**
- Drag-and-drop calendar
- Route optimization algorithm
- Auto-assign based on skills/location

**Week 23-24: Mobile Apps & Offline**
- Worker mobile apps (iOS + Android)
- Offline mode for checklist/photos
- Push notifications

**Launch Criteria:**
- 50+ active properties
- 10+ workers (cleaners + maintenance)
- $50K+ monthly recurring revenue

---

## Success Metrics (Platform-Wide)

### Business Metrics

**Revenue:**
- Monthly Recurring Revenue (MRR): Track growth
- Average Revenue Per Property (ARPP): Target $350+/property/month
- Cross-Sell Rate: > 30% of single-service customers add 2nd service within 12 months
- Customer Lifetime Value (CLV): Track over 24 months

**Customer Acquisition & Retention:**
- Customer Retention Rate: > 90% annually
- Churn Rate: < 10% annually
- Net Promoter Score (NPS): > 50 (promoters - detractors)
- Customer Acquisition Cost (CAC): < $500 per property

**Operational Efficiency:**
- On-Time Rate: > 95% (cleaning), > 90% (maintenance)
- Worker Utilization: 85-95% (balanced workload)
- Emergency Response Time: < 15 minutes (report → worker en route)
- Quote Approval Rate: > 70%

---

### Product Metrics

**Portal Adoption:**
- Registration Rate: > 80% of customers create portal account
- Active Usage: > 70% log in at least weekly
- Mobile Usage: > 60% of logins from mobile devices
- Self-Service Rate: > 80% of actions completed without calling Alex

**AI Performance:**
- Guest Chat Resolution: > 70% of questions answered without human
- AI Triage Accuracy: > 85% (severity matches technician assessment)
- DIY Success Rate: > 50% of guided fixes work on first attempt
- Photo Upload Rate: > 70% of issues include photos

**Worker Performance:**
- Average Quality Score: > 4.5/5
- Worker Retention: > 90% annually
- GPS Tracking Uptime: > 98%
- Cleaner/Technician NPS: > 60 (happy workers = better service)

**Guest Experience:**
- Tablet Usage Rate: > 60% of guests interact during stay
- Guest Satisfaction: > 4.7/5 with overall experience
- Issue Detection Rate: > 80% via tablet (vs. phone calls)
- Calls to Property Manager: Reduce by 40-50%

---

## Design System (Coming Soon)

### Color Palette
- **Primary:** Blue (#2563EB) - Trust, professionalism
- **Success:** Green (#10B981) - Completed, on track
- **Warning:** Yellow (#F59E0B) - Monitor, attention needed
- **Danger:** Red (#EF4444) - Urgent, emergency
- **Neutral:** Gray (#6B7280) - Informational

### Typography
- **Headings:** Inter (bold, clean, modern)
- **Body:** Inter (regular, highly readable)
- **Monospace:** JetBrains Mono (code, data)

### Component Library
- Buttons (primary, secondary, danger, ghost)
- Forms (inputs, selects, textareas, checkboxes)
- Cards (job cards, property cards, worker cards)
- Modals (job details, quote approval, confirmations)
- Tables (sortable, filterable, paginated)
- Maps (GPS tracking, property locations)

---

## Competitive Analysis

### Cleaning Software
**Competitors:** ZenMaid, Housecall Pro, Jobber
- **Our Advantage:** Integrated maintenance, cross-sell intelligence, guest AI

### Maintenance Software
**Competitors:** ServiceTitan, Jobber, Housecall Pro
- **Our Advantage:** Short-term rental focus, guest-impacting triage, AI assessment

### Guest Experience
**Competitors:** TouchStay, Hostfully, Enso Connect
- **Our Advantage:** AI-powered triage, auto-dispatch, DIY guidance

### Unique Positioning
**RightFit Services is the only platform that:**
1. Integrates cleaning + maintenance in one ecosystem
2. Uses AI to triage guest issues and auto-dispatch technicians
3. Guides guests through DIY fixes (reducing service calls)
4. Cross-sells intelligently based on service usage patterns

---

## FAQ

### Q: Why separate cleaning and maintenance dashboards?
**A:** Different workflows, skill sets, and operational cadences. Cleaners work on schedules (recurring), maintenance is reactive (emergencies + quotes). Separate dashboards optimize for each workflow while maintaining data sharing for cross-sell.

### Q: Why a guest tablet vs. mobile app?
**A:** Lower friction (no download required), always accessible (wall-mounted), property-specific content (manuals, local info), works for all guests (no app store barriers). Mobile apps are better for workers (need GPS, notifications).

### Q: Why build custom vs. using existing software?
**A:** Existing tools don't integrate cleaning + maintenance, lack AI triage, don't support cross-sell intelligence, and charge per-user fees (expensive at scale). Custom platform = competitive advantage.

### Q: How does the cross-sell intelligence work?
**A:**
1. **Cleaning → Maintenance:** Track issues reported by cleaners (broken items, plumbing leaks) → surface as maintenance opportunities in cleaning dashboard
2. **Maintenance → Cleaning:** Identify maintenance-only customers → show upsell messaging in customer portal
3. **ML Scoring:** Predictive model scores customers based on property count, issue frequency, contract value → prioritize high-value upsells

### Q: What's the ROI timeline?
**A:**
- **Month 1-3:** Build MVP (cleaning + maintenance core)
- **Month 4-6:** Pilot with 10 customers, validate product-market fit
- **Month 7-12:** Scale to 50 customers, $50K MRR, break-even
- **Month 13-24:** Scale to 200 customers, $200K MRR, profitable

---

## Change Log

### Version 1.0 (October 31, 2025)
- Initial wireframes created for all 4 dashboards
- Design principles documented
- Implementation roadmap defined
- Success metrics established

### Upcoming (November 2025)
- High-fidelity mockups (Figma)
- Interactive prototypes (InVision)
- User testing with 5 pilot customers
- Technical architecture deep-dive

---

## Contributing

This is an internal planning document. For questions or suggestions, contact:

**Alex (Product Owner)**
Email: alex@rightfit.com
Phone: (865) 555-0100

---

## Resources

### Documentation
- [STRATEGIC_PIVOT.md](../STRATEGIC_PIVOT.md) - Business strategy and market analysis
- [CURRENT_STATE.md](../CURRENT_STATE.md) - Technical implementation status
- [API Documentation](../../apps/api/README.md) - Backend API reference
- [Frontend Documentation](../../apps/web/README.md) - Web dashboard docs

### External Links
- [Figma Designs](https://figma.com/rightfit) (Coming soon)
- [Product Roadmap](https://trello.com/rightfit) (Internal only)
- [Customer Research](https://docs.google.com/rightfit) (Internal only)

---

**End of README**
*Next Steps: Begin Phase 1 implementation (Week 1-2: Cleaning Dashboard Core)*
