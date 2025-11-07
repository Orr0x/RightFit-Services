# Maintenance Dashboard Wireframes

**Target User:** Alex (Service Provider) - Maintenance Business Owner
**Primary Use Case:** Manage maintenance operations for short-term rental properties
**Key Objective:** Emergency triage, rapid quotes, worker dispatch, and cross-selling cleaning services

---

## Dashboard Overview

### 1. Homepage - Emergency Command Center

```
╔═══════════════════════════════════════════════════════════════════════════╗
║ RightFit Maintenance                                 [Alex] [⚙️] [🔔 5]  ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  📅 TODAY: Friday, Oct 31, 2025                      🌡️ 68°F, Sunny     ║
║                                                                           ║
║  ┌─────────────────────────────────────────────────────────────────────┐ ║
║  │ 🚨 GUEST-IMPACTING EMERGENCIES (2) - IMMEDIATE ACTION REQUIRED!     │ ║
║  ├─────────────────────────────────────────────────────────────────────┤ ║
║  │ 🔴 CRITICAL: Bear Cabin - No Hot Water                              │ ║
║  │    Guest arrived 2 hours ago | Checked in until Sunday              │ ║
║  │    Reported: 45 min ago via Guest AI Tablet                         │ ║
║  │    AI Assessment: Water heater pilot light out (DIY attempted)      │ ║
║  │    📍 123 Bear Trail, Gatlinburg | 📞 Customer: (865) 555-0123      │ ║
║  │                                                                      │ ║
║  │    SUGGESTED ACTION: Send Jim (plumber, 8 min away, available now)  │ ║
║  │    [AUTO-DISPATCH JIM] [MANUAL ASSIGN] [CALL CUSTOMER] [VIEW AI]    │ ║
║  │                                                                      │ ║
║  │ 🟠 HIGH: Pine Lodge - Broken Toilet Handle                          │ ║
║  │    Guest arriving in 90 minutes (3:00 PM check-in)                  │ ║
║  │    Reported: 15 min ago by cleaner (Sarah M.) with photo            │ ║
║  │    AI Assessment: Simple replacement - 15 min job                   │ ║
║  │    📍 123 Mountain Rd | 📞 Customer: (865) 555-0145                 │ ║
║  │                                                                      │ ║
║  │    SUGGESTED ACTION: Send Tom (handyman, finishing job nearby)      │ ║
║  │    [AUTO-DISPATCH TOM] [MANUAL ASSIGN] [VIEW PHOTOS] [QUOTE]        │ ║
║  └─────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
║  ┌──────────────────────┬────────────────────────┬────────────────────┐  ║
║  │ TODAY'S JOBS         │ WORKER STATUS          │ REVENUE            │  ║
║  ├──────────────────────┼────────────────────────┼────────────────────┤  ║
║  │                      │                        │                    │  ║
║  │  ✅ Completed: 6     │  🟢 Active: 4/7       │  Today: $2,840     │  ║
║  │  🔄 In Progress: 4   │  🚗 En Route: 2/7     │  Week: $12,450     │  ║
║  │  ⏰ Scheduled: 5     │  🟡 Available: 1/7    │  Month: $48,200    │  ║
║  │  🔴 Emergency: 2     │  ⚪ Off Duty: 0/7     │                    │  ║
║  │  📋 Quotes Pending:8 │                        │  Target: $50,000   │  ║
║  │                      │                        │  📊 96% to goal    │  ║
║  │  [VIEW ALL →]       │  [MANAGE TEAM →]      │  [INVOICES →]      │  ║
║  └──────────────────────┴────────────────────────┴────────────────────┘  ║
║                                                                           ║
║  ┌─────────────────────────────────────────────────────────────────────┐ ║
║  │ 📋 TODAY'S SCHEDULE                          [Calendar View 📅]     │ ║
║  ├─────────────────────────────────────────────────────────────────────┤ ║
║  │                                                                      │ ║
║  │  8:00 AM  ✅ Elk View - HVAC Filter           Jim R.    [DONE]     │ ║
║  │           $120 | Routine | 1hr                Photos uploaded ✓     │ ║
║  │           Customer satisfaction: ⭐⭐⭐⭐⭐                           │ ║
║  │                                                                      │ ║
║  │  9:30 AM  🔄 Deer Cabin - Deck Repair         Tom L.    [WORKING]  │ ║
║  │           $450 | Quote approved | 3hrs        2.5hrs elapsed        │ ║
║  │           📍 GPS: On site | Last update: 5 min ago                  │ ║
║  │           [TRACK] [CALL] [VIEW QUOTE]                               │ ║
║  │                                                                      │ ║
║  │  10:00 AM 🔄 Mountain View - Dripping Faucet  Sarah K.  [WORKING]  │ ║
║  │           $85 | Emergency | 1hr               Started on time ✓     │ ║
║  │           📍 GPS: On site | [TRACK]                                 │ ║
║  │                                                                      │ ║
║  │  11:00 AM ✅ Sunset - Replace Lightbulbs      Mike D.   [DONE]     │ ║
║  │           $60 | Quick fix | 0.5hr             Quality: ⭐⭐⭐⭐      │ ║
║  │                                                                      │ ║
║  │  12:30 PM 🚗 Bear Cabin - Water Heater        Jim R.    [EN ROUTE] │ ║
║  │           🔴 GUEST-IMPACTING | Emergency       ETA: 8 minutes       │ ║
║  │           Quote: TBD (on-site assessment)     [TRACK GPS] [CALL]    │ ║
║  │                                                                      │ ║
║  │  1:30 PM  ⏰ Creek Lodge - Window Seal         Tom L.    [SCHEDULED]│ ║
║  │           $280 | Quote approved | 2hrs        After deck job ↑      │ ║
║  │           [NOTIFY] [RESCHEDULE]                                     │ ║
║  │                                                                      │ ║
║  │  2:45 PM  🚗 Pine Lodge - Toilet Handle       Tom L.    [DISPATCH] │ ║
║  │           🟠 GUEST ARRIVING SOON | Emergency   ETA: 15 min          │ ║
║  │           $45 | Quick fix | 0.25hr            [TRACK] [CALL]        │ ║
║  │                                                                      │ ║
║  │  3:00 PM  🔄 Ridge View - Gutter Cleaning     Carlos M. [WORKING]  │ ║
║  │           $220 | Routine | 2hrs               1hr elapsed           │ ║
║  │           📍 GPS: On site | [TRACK]                                 │ ║
║  │                                                                      │ ║
║  │  [+ADD JOB] [EMERGENCY DISPATCH] [EXPORT] [WORKER MAP]              │ ║
║  └─────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
║  ┌─────────────────────────────────────────────────────────────────────┐ ║
║  │ 📊 QUOTES AWAITING APPROVAL (8)                      [View All →]   │ ║
║  ├─────────────────────────────────────────────────────────────────────┤ ║
║  │  Mountain Lodge - Roof Repair | $2,850 | Sent 2 days ago           │ ║
║  │  Valley View - Deck Staining | $1,200 | Sent yesterday              │ ║
║  │  Highland - HVAC Service Contract | $450/yr | Sent 3 days ago       │ ║
║  │  [+6 more] → Average response time: 2.3 days (target: < 3 days)    │ ║
║  └─────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
║  ┌─────────────────────────────────────────────────────────────────────┐ ║
║  │ 💡 QUICK ACTIONS                                                    │ ║
║  ├─────────────────────────────────────────────────────────────────────┤ ║
║  │  [🚨 Emergency Dispatch]  [📋 Create Quote]    [👥 View Workers]   │ ║
║  │  [📊 Reports]             [🏠 Customers]       [🧹 Cleaning Dash →]│ ║
║  └─────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
║  ┌─────────────────────────────────────────────────────────────────────┐ ║
║  │ 🎯 CROSS-SELL OPPORTUNITIES (2 WARM LEADS)                          │ ║
║  ├─────────────────────────────────────────────────────────────────────┤ ║
║  │  River's Edge Getaway - Maintenance-only customer                   │ ║
║  │  ⚡ Has 2 properties, no cleaning service contract                  │ ║
║  │  💡 "They need regular cleanings - pitch your cleaning service!"    │ ║
║  │  [GENERATE CLEANING PROPOSAL] [VIEW HISTORY] [DISMISS]              │ ║
║  └─────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

**Key Features:**
- **Emergency Triage**: Guest-impacting issues always at top (color-coded red/orange)
- **AI-Powered Assessment**: Guest AI Tablet provides preliminary diagnosis
- **Auto-Dispatch Suggestions**: System recommends best worker based on skills, location, availability
- **Real-Time GPS Tracking**: See where all workers are right now
- **Quote Pipeline**: Track quotes from creation → approval → completion
- **Cross-Sell Intelligence**: Identify maintenance-only customers for cleaning upsell

**Integration Points:**
- Guest AI Dashboard (emergency reports flow directly here)
- Cleaning Dashboard (cross-sell opportunities, issue escalation)
- Customer Portal (quote approvals, job notifications)
- Worker mobile app (job assignments, GPS tracking)
- SMS/Push notifications for emergencies

**Data Model Extensions:**
- `maintenance_jobs` table: property_id, job_type, priority (emergency/routine), guest_impact (boolean)
- `job_priority_queue` table: Auto-calculated priority score based on guest impact, time sensitivity
- `worker_locations` table: Real-time GPS tracking, current_job_id, status
- `ai_assessments` table: job_id, diagnosis, confidence_score, recommended_action, diy_attempted

**Success Metrics:**
- Emergency response time: < 15 minutes (assignment to worker en route)
- Guest-impacting issue resolution: < 2 hours average
- Quote generation speed: < 2 minutes (using templates)
- Quote approval rate: > 70%
- Worker utilization: 85-95%

---

## 2. Job Details Modal - AI-Powered Assessment

```
╔═══════════════════════════════════════════════════════════════════════════╗
║ Job Details: Bear Cabin - No Hot Water                         [✕ Close] ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  ┌─────────────────────────────────────────────────────────────────────┐ ║
║  │ 🚨 PRIORITY: CRITICAL - GUEST-IMPACTING EMERGENCY                    │ ║
║  ├─────────────────────────────────────────────────────────────────────┤ ║
║  │  Guest Impact: YES - Family of 4 checked in 2 hours ago             │ ║
║  │  Guest Stay: Oct 31 - Nov 2 (2 nights remaining)                    │ ║
║  │  Urgency: IMMEDIATE (no hot water for showers/dishes)               │ ║
║  │  SLA Target: Resolve within 2 hours (45 min remaining)              │ ║
║  └─────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
║  ┌─────────────────────────────────────────────────────────────────────┐ ║
║  │ 🏠 PROPERTY INFO                                    [Edit] [History] │ ║
║  ├─────────────────────────────────────────────────────────────────────┤ ║
║  │  Property: Bear Cabin                                               │ ║
║  │  Address: 123 Bear Trail, Gatlinburg, TN 37738                      │ ║
║  │  Customer: Mountain Lodge Rentals (Jane Smith)                      │ ║
║  │  📞 (865) 555-0123 | ✉️ jane@mountainlodge.com                      │ ║
║  │  Service Contract: Cleaning + Basic Maintenance                     │ ║
║  │                                                                      │ ║
║  │  Access: Lockbox code 4782# | Guest is on-site (notify before entry)│ ║
║  │  Equipment Notes: Water heater - Rheem 50gal, installed 2019        │ ║
║  │  Service History: Last plumbing work: 6 months ago (leak repair)    │ ║
║  └─────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
║  ┌─────────────────────────────────────────────────────────────────────┐ ║
║  │ 🤖 AI ASSESSMENT (Guest AI Tablet Analysis)      Confidence: 85%    │ ║
║  ├─────────────────────────────────────────────────────────────────────┤ ║
║  │  Reported Issue: "No hot water coming out of any faucets"           │ ║
║  │  Photos Analyzed: 3 (water heater panel, pilot light, control dial) │ ║
║  │                                                                      │ ║
║  │  AI DIAGNOSIS:                                                       │ ║
║  │  ✓ Water heater pilot light is OUT (photo confirmed)                │ ║
║  │  ✓ Gas supply appears normal (no smell, other gas appliances work)  │ ║
║  │  ✓ Most likely cause: Pilot light extinguished (wind, draft)        │ ║
║  │  ✓ Less likely: Thermocouple failure, gas valve issue               │ ║
║  │                                                                      │ ║
║  │  DIY ATTEMPT BY GUEST:                                              │ ║
║  │  ✅ Guest followed AI instructions to relight pilot                 │ ║
║  │  ❌ Pilot light won't stay lit after releasing button               │ ║
║  │  → Indicates: Likely thermocouple failure (needs replacement)       │ ║
║  │                                                                      │ ║
║  │  RECOMMENDED ACTION:                                                 │ ║
║  │  1. Send plumber with thermocouple part                             │ ║
║  │  2. Estimated time: 30-45 min repair                                │ ║
║  │  3. Estimated cost: $120-180 (part + labor)                         │ ║
║  │                                                                      │ ║
║  │  [VIEW AI CHAT TRANSCRIPT] [VIEW PHOTOS] [OVERRIDE DIAGNOSIS]       │ ║
║  └─────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
║  ┌─────────────────────────────────────────────────────────────────────┐ ║
║  │ 👨‍🔧 WORKER ASSIGNMENT                                                │ ║
║  ├─────────────────────────────────────────────────────────────────────┤ ║
║  │  🟢 RECOMMENDED: Jim Rodriguez (Plumber) - AVAILABLE NOW            │ ║
║  │     Skills: Plumbing ⭐⭐⭐⭐⭐ | Water heater specialist             │ ║
║  │     📍 Current Location: 456 Summit Dr (8 minutes away)             │ ║
║  │     Status: Finishing HVAC job (10 min) → Available 12:30 PM        │ ║
║  │     Performance: 4.9/5 rating | 98% on-time | 127 jobs completed    │ ║
║  │     Has thermocouple parts in truck: ✅ YES (confirmed in inventory)│ ║
║  │     Estimated arrival: 12:45 PM (15 min from now)                   │ ║
║  │                                                                      │ ║
║  │     [🚨 AUTO-DISPATCH JIM] [📞 CALL JIM] [📍 TRACK GPS]            │ ║
║  │                                                                      │ ║
║  │  🟡 BACKUP: Sarah Kim (Multi-trade) - WORKING (finishing 2:00 PM)  │ ║
║  │     Skills: Plumbing ⭐⭐⭐ | Basic water heater repair              │ ║
║  │     📍 15 min away | May not have part (would need to pickup)       │ ║
║  │     [ASSIGN SARAH] [CALL]                                           │ ║
║  │                                                                      │ ║
║  │  🔴 EXTERNAL: Gatlinburg Plumbing (Contractor Network)             │ ║
║  │     Emergency service: $200+ | Availability: Unknown                │ ║
║  │     [CALL EXTERNAL] (Use only if Jim/Sarah unavailable)             │ ║
║  └─────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
║  ┌─────────────────────────────────────────────────────────────────────┐ ║
║  │ 💰 QUOTE / BILLING                                [Generate Quote]  │ ║
║  ├─────────────────────────────────────────────────────────────────────┤ ║
║  │  Service Type: Emergency Plumbing Repair                            │ ║
║  │  Priority: Emergency (2x rate applies per contract)                 │ ║
║  │                                                                      │ ║
║  │  ESTIMATED COSTS:                                                    │ ║
║  │  • Emergency Call-Out Fee: $75                                      │ ║
║  │  • Labor (1 hour): $85                                              │ ║
║  │  • Thermocouple Part: $35                                           │ ║
║  │  • Emergency Multiplier (2x): Applied to labor only                 │ ║
║  │                                                                      │ ║
║  │  Subtotal: $280                                                     │ ║
║  │  Tax (9.5%): $26.60                                                 │ ║
║  │  TOTAL: $306.60                                                     │ ║
║  │                                                                      │ ║
║  │  Contract Terms: Emergency repairs auto-approved up to $500         │ ║
║  │  Customer Notification: Auto-sent when job starts                   │ ║
║  │  Payment: Auto-bill on completion (Card on file)                    │ ║
║  │                                                                      │ ║
║  │  [SEND QUOTE TO CUSTOMER] [ADJUST PRICING] [VIEW CONTRACT]          │ ║
║  └─────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
║  ┌─────────────────────────────────────────────────────────────────────┐ ║
║  │ 📸 PHOTOS & DOCUMENTATION (3 photos from Guest AI)                  │ ║
║  ├─────────────────────────────────────────────────────────────────────┤ ║
║  │  ┌──────────┐  ┌──────────┐  ┌──────────┐                          │ ║
║  │  │ 🔥 ❌    │  │ 🌡️       │  │ 🔧       │                          │ ║
║  │  │ Pilot    │  │ Control  │  │ Water    │                          │ ║
║  │  │ Light    │  │ Panel    │  │ Heater   │                          │ ║
║  │  │ OUT      │  │          │  │ Full     │                          │ ║
║  │  └──────────┘  └──────────┘  └──────────┘                          │ ║
║  │  10:45 AM      10:46 AM      10:47 AM                               │ ║
║  │  Guest upload  Guest upload  Guest upload                           │ ║
║  │                                                                      │ ║
║  │  [VIEW FULL GALLERY] [DOWNLOAD ALL] [ADD WORKER PHOTOS]             │ ║
║  └─────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
║  ┌─────────────────────────────────────────────────────────────────────┐ ║
║  │ 📞 COMMUNICATION LOG                                                │ ║
║  ├─────────────────────────────────────────────────────────────────────┤ ║
║  │  12:35 PM - System: Jim dispatched, ETA 12:45 PM (SMS sent to Jim) │ ║
║  │  12:32 PM - Alex: Called customer to confirm emergency response     │ ║
║  │  12:30 PM - System: Auto-quote sent to customer ($306.60)           │ ║
║  │  11:15 AM - System: Guest completed DIY attempt (unsuccessful)      │ ║
║  │  10:50 AM - System: AI assessment completed (85% confidence)        │ ║
║  │  10:45 AM - Guest: Issue reported via AI Tablet                     │ ║
║  │                                                                      │ ║
║  │  [ADD NOTE] [CALL CUSTOMER] [CALL WORKER] [SMS GUEST]               │ ║
║  └─────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
║  ┌─────────────────────────────────────────────────────────────────────┐ ║
║  │ 📋 JOB TIMELINE                                                     │ ║
║  ├─────────────────────────────────────────────────────────────────────┤ ║
║  │  ✅ 10:45 AM - Issue reported by guest                              │ ║
║  │  ✅ 10:50 AM - AI assessment completed                              │ ║
║  │  ✅ 11:15 AM - Guest attempted DIY fix (unsuccessful)               │ ║
║  │  ✅ 12:30 PM - Quote auto-generated                                 │ ║
║  │  ✅ 12:35 PM - Worker dispatched (Jim R.)                           │ ║
║  │  🔄 12:45 PM - Worker arrival (estimated)                           │ ║
║  │  ⏰ 1:30 PM  - Repair completion (estimated)                        │ ║
║  │  ⏰ 1:45 PM  - Invoice sent & payment processed                     │ ║
║  │                                                                      │ ║
║  │  Total Response Time: 1h 50min (Target: < 2 hours) ✅              │ ║
║  └─────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
║  ┌─────────────────────────────────────────────────────────────────────┐ ║
║  │ 💡 SMART ACTIONS                                                    │ ║
║  ├─────────────────────────────────────────────────────────────────────┤ ║
║  │  🎯 PREVENTIVE MAINTENANCE UPSELL                                   │ ║
║  │     Water heater is 6 years old (avg lifespan: 10-12 years)         │ ║
║  │     Recommend: Annual inspection service ($120/year)                │ ║
║  │     [SEND PROPOSAL TO CUSTOMER]                                     │ ║
║  │                                                                      │ ║
║  │  📊 PROPERTY INSIGHTS                                               │ ║
║  │     This property has had 3 plumbing issues in 12 months            │ ║
║  │     Consider comprehensive plumbing inspection ($250)               │ ║
║  │     [RECOMMEND INSPECTION]                                          │ ║
║  └─────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
║  [COMPLETE JOB] [CANCEL] [ESCALATE] [ASSIGN BACKUP] [NOTIFY CUSTOMER]   ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

**Key Features:**
- **AI-Powered Diagnosis**: Guest AI provides preliminary assessment with confidence score
- **Smart Worker Matching**: Auto-suggests best worker based on skills, location, parts inventory
- **Auto-Quote Generation**: Template-based quotes generated in seconds
- **Emergency Auto-Approval**: Contract terms allow emergency jobs up to threshold without waiting
- **Complete Timeline**: Full audit trail from report → dispatch → completion
- **Preventive Maintenance Upsells**: AI suggests recurring services based on age/history

**Integration Points:**
- Guest AI Dashboard (receives reports, photos, DIY attempt results)
- Worker mobile app (dispatch notifications, job details, parts needed)
- Customer Portal (quote notifications, job status updates)
- Parts inventory system (check if worker has needed parts)
- Accounting system (auto-billing on completion)

**Data Model Extensions:**
- `ai_assessments` table: job_id, diagnosis, confidence, recommended_parts, diy_attempted
- `worker_skills` table: worker_id, skill_type, proficiency_level, certifications
- `worker_inventory` table: worker_id, part_name, quantity, last_restocked
- `emergency_contracts` table: customer_id, auto_approve_threshold, priority_level

**Success Metrics:**
- AI assessment accuracy: > 80% (compare diagnosis to actual fix)
- Worker dispatch time: < 5 minutes from report
- Emergency resolution time: < 2 hours average
- Auto-approval usage: > 60% of emergency jobs (faster response)
- Preventive maintenance conversion: > 30% of emergency customers

---

## 3. Quote Builder - 2-Minute Quotes

```
╔═══════════════════════════════════════════════════════════════════════════╗
║ Quote Builder                                               [✕ Close]    ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  ┌─────────────────────────────────────────────────────────────────────┐ ║
║  │ STEP 1: SELECT PROPERTY                                      1 of 4  │ ║
║  ├─────────────────────────────────────────────────────────────────────┤ ║
║  │                                                                      │ ║
║  │  Customer: [Mountain Lodge Rentals ▼]                               │ ║
║  │                                                                      │ ║
║  │  Select Property:                                                    │ ║
║  │  ⦿ Bear Cabin - 123 Bear Trail                                      │ ║
║  │  ○ Pine Lodge - 123 Mountain Rd                                     │ ║
║  │  ○ Elk View Lodge - 456 Elk View Dr                                 │ ║
║  │  ○ Deer Cabin - 789 Deer Trail                                      │ ║
║  │  ... (+4 more properties)                                            │ ║
║  │                                                                      │ ║
║  │  Quick Access Info (Bear Cabin):                                    │ ║
║  │  • Last service: 6 months ago (leak repair - $280)                  │ ║
║  │  • Open issues: Hot water heater emergency (today)                  │ ║
║  │  • Equipment: Water heater (2019), HVAC (2020), Roof (2018)         │ ║
║  │                                                                      │ ║
║  │  [NEXT: Select Service →]                                           │ ║
║  └─────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
║  ┌─────────────────────────────────────────────────────────────────────┐ ║
║  │ STEP 2: SELECT SERVICE TYPE                              2 of 4      │ ║
║  ├─────────────────────────────────────────────────────────────────────┤ ║
║  │                                                                      │ ║
║  │  🔧 COMMON SERVICES (Quick Templates)                               │ ║
║  │                                                                      │ ║
║  │  ⦿ HVAC Service                                                     │ ║
║  │    ├─ Filter Replacement ($120 | 1hr)                               │ ║
║  │    ├─ Seasonal Tune-Up ($180 | 1.5hrs)                              │ ║
║  │    ├─ Emergency Repair (Quote TBD)                                  │ ║
║  │    └─ Annual Service Contract ($450/year)                           │ ║
║  │                                                                      │ ║
║  │  ○ Plumbing                                                         │ ║
║  │    ├─ Leak Repair ($150-300)                                        │ ║
║  │    ├─ Drain Cleaning ($120)                                         │ ║
║  │    ├─ Water Heater Service ($180)                                   │ ║
║  │    └─ Emergency Plumbing (Quote TBD)                                │ ║
║  │                                                                      │ ║
║  │  ○ Electrical                                                       │ ║
║  │    ├─ Light Fixture Install ($85)                                   │ ║
║  │    ├─ Outlet Repair ($60)                                           │ ║
║  │    ├─ Breaker Replacement ($120)                                    │ ║
║  │    └─ Emergency Electrical (Quote TBD)                              │ ║
║  │                                                                      │ ║
║  │  ○ Carpentry/Handyman                                               │ ║
║  │  ○ Roofing                                                          │ ║
║  │  ○ Painting                                                         │ ║
║  │  ○ Landscaping                                                      │ ║
║  │  ○ Pest Control                                                     │ ║
║  │  ○ Appliance Repair                                                 │ ║
║  │  ○ Custom Service (Build from scratch)                              │ ║
║  │                                                                      │ ║
║  │  [← BACK]  [NEXT: Build Quote →]                                   │ ║
║  └─────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
║  ┌─────────────────────────────────────────────────────────────────────┐ ║
║  │ STEP 3: BUILD QUOTE                                      3 of 4      │ ║
║  ├─────────────────────────────────────────────────────────────────────┤ ║
║  │                                                                      │ ║
║  │  Service: HVAC - Seasonal Tune-Up (TEMPLATE LOADED)                 │ ║
║  │                                                                      │ ║
║  │  LINE ITEMS:                                                         │ ║
║  │  ┌────────────────────────────────────────────────────────────────┐ │ ║
║  │  │ Description              Qty    Rate      Total      [Actions]  │ │ ║
║  │  ├────────────────────────────────────────────────────────────────┤ │ ║
║  │  │ HVAC System Inspection    1    $85.00    $85.00     [Edit][X]  │ │ ║
║  │  │ Clean condenser coils     1    $45.00    $45.00     [Edit][X]  │ │ ║
║  │  │ Replace air filter        1    $25.00    $25.00     [Edit][X]  │ │ ║
║  │  │ Check refrigerant levels  1    $25.00    $25.00     [Edit][X]  │ │ ║
║  │  │ Test thermostat           1    included  $0.00      [Edit][X]  │ │ ║
║  │  └────────────────────────────────────────────────────────────────┘ │ ║
║  │                                                                      │ ║
║  │  [+ ADD LINE ITEM] [+ ADD FROM TEMPLATE] [SAVE AS NEW TEMPLATE]     │ ║
║  │                                                                      │ ║
║  │  PRICING:                                                            │ ║
║  │  Subtotal:              $180.00                                     │ ║
║  │  Discount: [0%     ▼]   $0.00                                       │ ║
║  │  Tax (9.5%):            $17.10                                      │ ║
║  │  ═══════════════════════════════                                    │ ║
║  │  TOTAL:                 $197.10                                     │ ║
║  │                                                                      │ ║
║  │  ESTIMATED TIME: 1.5 hours                                          │ ║
║  │  PRIORITY: [Routine ▼] (Normal pricing)                             │ ║
║  │  VALID UNTIL: [30 days ▼]                                           │ ║
║  │                                                                      │ ║
║  │  NOTES TO CUSTOMER:                                                  │ ║
║  │  ┌────────────────────────────────────────────────────────────────┐ │ ║
║  │  │ Seasonal HVAC tune-up includes complete system inspection,     │ │ ║
║  │  │ cleaning, and optimization. Recommended twice per year (spring │ │ ║
║  │  │ and fall) to maintain efficiency and prevent breakdowns.       │ │ ║
║  │  │                                                                 │ │ ║
║  │  │ This service includes:                                          │ │ ║
║  │  │ • Full system diagnostic                                        │ │ ║
║  │  │ • Cleaning of all accessible components                         │ │ ║
║  │  │ • Performance optimization                                      │ │ ║
║  │  │ • 30-day warranty on service                                    │ │ ║
║  │  └────────────────────────────────────────────────────────────────┘ │ ║
║  │                                                                      │ ║
║  │  INTERNAL NOTES (Not visible to customer):                          │ ║
║  │  ┌────────────────────────────────────────────────────────────────┐ │ ║
║  │  │ System installed 2020 - still under manufacturer warranty.      │ │ ║
║  │  │ Last service: 6 months ago. Customer prefers morning appts.     │ │ ║
║  │  └────────────────────────────────────────────────────────────────┘ │ ║
║  │                                                                      │ ║
║  │  [← BACK]  [PREVIEW QUOTE] [NEXT: Review & Send →]                 │ ║
║  └─────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
║  ┌─────────────────────────────────────────────────────────────────────┐ ║
║  │ STEP 4: REVIEW & SEND                                    4 of 4      │ ║
║  ├─────────────────────────────────────────────────────────────────────┤ ║
║  │                                                                      │ ║
║  │  📄 QUOTE PREVIEW                                                   │ ║
║  │  ┌────────────────────────────────────────────────────────────────┐ │ ║
║  │  │                                                                 │ │ ║
║  │  │  RIGHTFIT MAINTENANCE SERVICES                                  │ │ ║
║  │  │  Quote #MNT-2025-1047                                           │ ║
║  │  │                                                                 │ │ ║
║  │  │  TO: Mountain Lodge Rentals                                     │ ║
║  │  │      Jane Smith                                                 │ ║
║  │  │      jane@mountainlodge.com                                     │ ║
║  │  │                                                                 │ │ ║
║  │  │  PROPERTY: Bear Cabin                                           │ ║
║  │  │            123 Bear Trail, Gatlinburg, TN 37738                 │ │ ║
║  │  │                                                                 │ │ ║
║  │  │  SERVICE: HVAC Seasonal Tune-Up                                 │ ║
║  │  │  DATE: October 31, 2025                                         │ ║
║  │  │  VALID UNTIL: November 30, 2025                                 │ │ ║
║  │  │                                                                 │ │ ║
║  │  │  [Full quote details displayed...]                              │ │ ║
║  │  │                                                                 │ │ ║
║  │  │  TOTAL: $197.10                                                 │ │ ║
║  │  │                                                                 │ │ ║
║  │  │  [APPROVE ONLINE] button will be included                       │ │ ║
║  │  │                                                                 │ │ ║
║  │  └────────────────────────────────────────────────────────────────┘ │ ║
║  │                                                                      │ ║
║  │  DELIVERY OPTIONS:                                                   │ ║
║  │  ☑ Email to customer (jane@mountainlodge.com)                       │ ║
║  │  ☑ Show in Customer Portal (with mobile notification)               │ ║
║  │  ☐ SMS notification (optional: 865-555-0123)                        │ ║
║  │  ☐ Print and mail (for high-value quotes > $1,000)                  │ ║
║  │                                                                      │ ║
║  │  FOLLOW-UP:                                                          │ ║
║  │  ☑ Auto-reminder after 7 days if not approved                       │ ║
║  │  ☑ Notify me when customer views quote                              │ ║
║  │  ☐ Schedule follow-up call (Date: ________)                         │ ║
║  │                                                                      │ ║
║  │  QUOTE CREATION TIME: 1 min 45 sec (Target: < 2 min) ✅            │ ║
║  │                                                                      │ ║
║  │  [← BACK TO EDIT]  [SAVE DRAFT]  [📤 SEND QUOTE NOW]              │ ║
║  └─────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

**Key Features:**
- **Template Library**: 50+ pre-built quote templates for common services
- **4-Step Wizard**: Property → Service → Build → Send (< 2 minutes)
- **Smart Defaults**: Auto-populated line items based on service type
- **One-Click Approval**: Customer receives quote with "Approve" button
- **Auto-Follow-Up**: Reminders sent automatically if no response
- **Quick Customization**: Edit templates on-the-fly without starting from scratch

**Integration Points:**
- Customer Portal (quote delivery, approval workflow)
- Accounting system (convert approved quote to invoice)
- Email/SMS gateway (delivery and notifications)
- Template library (save custom templates for reuse)

**Data Model Extensions:**
- `quote_templates` table: template_name, service_category, line_items (JSON), default_pricing
- `quotes` table: quote_number, customer_id, property_id, line_items (JSON), total, status, valid_until
- `quote_approvals` table: quote_id, approved_at, approved_by, payment_method
- `quote_delivery_log` table: quote_id, delivery_method, sent_at, viewed_at, approved_at

**Success Metrics:**
- Quote generation time: < 2 minutes average
- Quote approval rate: > 70%
- Quote response time: < 3 days average (from send to customer decision)
- Template usage: > 80% of quotes use templates (vs. building from scratch)

---

## 4. Worker Management - Skills & GPS Tracking

```
╔═══════════════════════════════════════════════════════════════════════════╗
║ Worker Management                                [+ Add Worker] [⚙️]     ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  ┌─────────────────────────────────────────────────────────────────────┐ ║
║  │ 👥 TEAM OVERVIEW                                Active: 6/7 workers  │ ║
║  ├─────────────────────────────────────────────────────────────────────┤ ║
║  │  This Week: 52 jobs completed | 245 hours billed | $12,450 revenue  │ ║
║  │  Performance: 94% on-time | 4.6/5 avg rating | 3 issues reported    │ ║
║  │  🚗 LIVE MAP: [View all workers on map →]                           │ ║
║  └─────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
║  ┌─────────────────────────────────────────────────────────────────────┐ ║
║  │ WORKER: Jim Rodriguez ⭐ EXPERT PLUMBER          [View Profile]      │ ║
║  ├─────────────────────────────────────────────────────────────────────┤ ║
║  │  Status: 🚗 EN ROUTE to Bear Cabin (Water heater emergency)         │ ║
║  │  📍 Location: Highway 441 S (updated 1 min ago) | ETA: 7 minutes    │ ║
║  │  📞 (865) 555-0301 | ✉️ jim.rodriguez@rightfit.com                  │ ║
║  │                                                                      │ ║
║  │  🗺️ LIVE GPS TRACKING                                               │ ║
║  │  ┌────────────────────────────────────────────────────────────────┐ │ ║
║  │  │                                                                 │ │ ║
║  │  │      [Map showing route from current location to Bear Cabin]    │ │ ║
║  │  │                                                                 │ │ ║
║  │  │      🚗 Jim (moving south on 441)                               │ │ ║
║  │  │       ↓                                                          │ │ ║
║  │  │       ↓ 2.3 miles                                                │ │ ║
║  │  │       ↓                                                          │ │ ║
║  │  │      🏠 Bear Cabin (destination)                                │ │ ║
║  │  │                                                                 │ │ ║
║  │  │  Traffic: Light | ETA: 12:45 PM (7 min)                         │ │ ║
║  │  │                                                                 │ │ ║
║  │  └────────────────────────────────────────────────────────────────┘ │ ║
║  │                                                                      │ ║
║  │  TODAY'S SCHEDULE (3 jobs - 6.5 hours - $565 revenue)               │ ║
║  │  ✅ 8:00 AM - Elk View HVAC Filter (1h) - $120 - Quality: ⭐⭐⭐⭐⭐│ ║
║  │  🚗 12:30 PM - Bear Cabin Water Heater (1.5h) - $306 - En Route    │ ║
║  │  ⏰ 3:00 PM - Sunset Retreat Leak Repair (2h) - $180 - Scheduled   │ ║
║  │                                                                      │ ║
║  │  SKILLS & CERTIFICATIONS                                            │ ║
║  │  🔧 Plumbing: ⭐⭐⭐⭐⭐ Expert (Licensed Master Plumber)            │ ║
║  │     • Water heaters: Specialist                                     │ ║
║  │     • Drain/sewer: Advanced                                         │ ║
║  │     • Gas lines: Certified                                          │ ║
║  │  🌡️ HVAC: ⭐⭐⭐ Intermediate (EPA 608 Certified)                   │ ║
║  │     • Filter replacement, basic repairs                             │ ║
║  │  ⚡ Electrical: ⭐ Basic (Minor repairs only)                       │ ║
║  │                                                                      │ ║
║  │  Licenses: TN Master Plumber #MP-47829 (exp: 2027)                  │ ║
║  │            EPA 608 Universal (exp: lifetime)                        │ ║
║  │                                                                      │ ║
║  │  TRUCK INVENTORY (Last updated: Today 8:00 AM)                      │ ║
║  │  ✅ Thermocouples (3 units)     ✅ PVC fittings (assorted)          │ ║
║  │  ✅ Pipe wrenches (set)         ✅ HVAC filters (common sizes)      │ ║
║  │  ⚠️  Water heater elements (1 - restock needed)                    │ ║
║  │  ❌ Garbage disposal units (0 - out of stock)                       │ ║
║  │  [VIEW FULL INVENTORY] [RESTOCK ALERT]                              │ ║
║  │                                                                      │ ║
║  │  PERFORMANCE METRICS (Last 30 days)                                 │ ║
║  │  • Jobs Completed: 48 | Hours Billed: 138 | Revenue: $7,920        │ ║
║  │  • On-Time Rate: 98% (47/48) | Avg Rating: 4.9/5 (42 ratings)      │ ║
║  │  • Issue Rate: 2% (1 callback - fixed under warranty)               │ ║
║  │  • Utilization: 92% (optimal range: 85-95%)                         │ ║
║  │                                                                      │ ║
║  │  AVAILABILITY                                                        │ ║
║  │  Mon-Fri: 8:00 AM - 5:00 PM | Sat: 9:00 AM - 1:00 PM | Sun: Off    │ ║
║  │  On-Call Rotation: This week (emergency calls to personal phone)    │ ║
║  │  Next Time Off: Nov 22-24 (Thanksgiving - approved)                 │ ║
║  │                                                                      │ ║
║  │  [📍 TRACK LIVE] [📞 CALL] [💬 SMS] [📧 EMAIL] [EDIT] [HISTORY]   │ ║
║  └─────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
║  ┌─────────────────────────────────────────────────────────────────────┐ ║
║  │ WORKER: Tom Lewis - HANDYMAN/MULTI-TRADE         [View Profile]      │ ║
║  ├─────────────────────────────────────────────────────────────────────┤ ║
║  │  Status: 🔄 WORKING at Deer Cabin (Deck repair - 2.5hrs elapsed)    │ ║
║  │  📍 Location: 789 Deer Trail (updated 3 min ago)                    │ ║
║  │  📞 (865) 555-0303 | ✉️ tom.lewis@rightfit.com                      │ ║
║  │                                                                      │ ║
║  │  TODAY'S SCHEDULE (3 jobs - 7.5 hours - $775 revenue)               │ ║
║  │  🔄 9:30 AM - Deer Cabin Deck Repair (3h) - $450 - In Progress     │ ║
║  │  ⏰ 1:30 PM - Creek Lodge Window Seal (2h) - $280 - Scheduled       │ ║
║  │  🚨 2:45 PM - Pine Lodge Toilet (0.25h) - $45 - EMERGENCY INSERT   │ ║
║  │                                                                      │ ║
║  │  SKILLS & CERTIFICATIONS                                            │ ║
║  │  🔨 Carpentry: ⭐⭐⭐⭐ Advanced                                      │ ║
║  │  🎨 Painting: ⭐⭐⭐⭐ Advanced                                       │ ║
║  │  🔧 Plumbing: ⭐⭐⭐ Intermediate (Basic repairs, no licensing)      │ ║
║  │  ⚡ Electrical: ⭐⭐ Novice (Simple tasks only)                      │ ║
║  │  🏗️ General Handyman: ⭐⭐⭐⭐⭐ Expert                              │ ║
║  │                                                                      │ ║
║  │  PERFORMANCE METRICS (Last 30 days)                                 │ ║
║  │  • Jobs Completed: 42 | Hours Billed: 126 | Revenue: $5,670        │ ║
║  │  • On-Time Rate: 95% (40/42) | Avg Rating: 4.7/5                   │ ║
║  │                                                                      │ ║
║  │  [📍 TRACK] [📞 CALL] [EDIT] [HISTORY]                             │ ║
║  └─────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
║  ┌─────────────────────────────────────────────────────────────────────┐ ║
║  │ WORKER: Sarah Kim - ELECTRICIAN/MULTI-TRADE      [View Profile]      │ ║
║  ├─────────────────────────────────────────────────────────────────────┤ ║
║  │  Status: 🔄 WORKING at Mountain View (Dripping faucet)              │ ║
║  │  📍 Location: 456 Mountain View Dr (updated 2 min ago)              │ ║
║  │  📞 (865) 555-0305                                                  │ ║
║  │                                                                      │ ║
║  │  TODAY'S SCHEDULE (2 jobs - 4 hours - $365 revenue)                 │ ║
║  │  🔄 10:00 AM - Mountain View Faucet (1h) - $85 - In Progress       │ ║
║  │  ⏰ 2:00 PM - Valley View Outlet Repair (1.5h) - $120 - Scheduled  │ ║
║  │                                                                      │ ║
║  │  SKILLS: ⚡ Electrical ⭐⭐⭐⭐⭐ | 🔧 Plumbing ⭐⭐⭐                  │ ║
║  │  Licenses: TN Licensed Electrician #E-92847                         │ ║
║  │                                                                      │ ║
║  │  PERFORMANCE: 46 jobs | 96% on-time | 4.8/5 rating                  │ ║
║  │                                                                      │ ║
║  │  [📍 TRACK] [📞 CALL] [EDIT] [HISTORY]                             │ ║
║  └─────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
║  ┌─────────────────────────────────────────────────────────────────────┐ ║
║  │ WORKER: Mike Davis - HVAC SPECIALIST              [View Profile]     │ ║
║  ├─────────────────────────────────────────────────────────────────────┤ ║
║  │  Status: 🟡 AVAILABLE (Last job completed 30 min ago)               │ ║
║  │  📍 Location: 789 Summit Dr (last job site)                         │ ║
║  │  📞 (865) 555-0307 | Available for dispatch                         │ ║
║  │                                                                      │ ║
║  │  TODAY'S SCHEDULE (3 jobs - 4.5 hours - $420 revenue)               │ ║
║  │  ✅ 8:30 AM - Summit HVAC Tune-Up (1.5h) - $180 - Completed        │ ║
║  │  ✅ 11:00 AM - Ridge Lightbulbs (0.5h) - $60 - Completed            │ ║
║  │  ⏰ 4:00 PM - Highland Filter Change (1h) - $120 - Scheduled        │ ║
║  │                                                                      │ ║
║  │  SKILLS: 🌡️ HVAC ⭐⭐⭐⭐⭐ | ⚡ Electrical ⭐⭐⭐                    │ ║
║  │  Licenses: EPA 608 Universal, TN HVAC License #H-58392              │ ║
║  │                                                                      │ ║
║  │  💡 AVAILABLE FOR EMERGENCY DISPATCH (Next 2.5 hours free)          │ ║
║  │  [ASSIGN EMERGENCY JOB] [CALL] [EDIT]                               │ ║
║  └─────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
║  ┌─────────────────────────────────────────────────────────────────────┐ ║
║  │ WORKER: Carlos Martinez - LANDSCAPING/EXTERIOR   [View Profile]      │ ║
║  ├─────────────────────────────────────────────────────────────────────┤ ║
║  │  Status: 🔄 WORKING at Ridge View (Gutter cleaning)                 │ ║
║  │  📍 Location: 321 Ridge View Pkwy (updated 4 min ago)               │ ║
║  │                                                                      │ ║
║  │  TODAY: 2 jobs - 5 hours - $440 revenue                             │ ║
║  │  SKILLS: 🌳 Landscaping ⭐⭐⭐⭐ | 🏠 Exterior ⭐⭐⭐⭐                │ ║
║  │                                                                      │ ║
║  │  [📍 TRACK] [📞 CALL] [EDIT]                                       │ ║
║  └─────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
║  ┌─────────────────────────────────────────────────────────────────────┐ ║
║  │ WORKER: Lisa Anderson - CLEANER/INSPECTOR        [View Profile]      │ ║
║  ├─────────────────────────────────────────────────────────────────────┤ ║
║  │  Status: 🟡 AVAILABLE (Light maintenance day)                       │ ║
║  │  📍 Location: Office (available for dispatch)                       │ ║
║  │                                                                      │ ║
║  │  TODAY: 1 job - 2 hours - $150 revenue                              │ ║
║  │  SKILLS: 🧹 Inspection ⭐⭐⭐⭐ | 🔧 Minor Repairs ⭐⭐⭐             │ ║
║  │  Note: Primarily cleaning staff, does light maintenance              │ ║
║  │                                                                      │ ║
║  │  [CALL] [EDIT]                                                      │ ║
║  └─────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
║  ┌─────────────────────────────────────────────────────────────────────┐ ║
║  │ WORKER: David Johnson - PAINTER                  [View Profile]      │ ║
║  ├─────────────────────────────────────────────────────────────────────┤ ║
║  │  Status: ⚪ OFF DUTY (Scheduled off - weekend project)              │ ║
║  │  Next Shift: Monday, Nov 3                                          │ ║
║  │                                                                      │ ║
║  │  SKILLS: 🎨 Painting ⭐⭐⭐⭐⭐ | 🔨 Drywall ⭐⭐⭐⭐                 │ ║
║  │                                                                      │ ║
║  │  [EDIT] [HISTORY]                                                   │ ║
║  └─────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
║  ┌─────────────────────────────────────────────────────────────────────┐ ║
║  │ 📊 TEAM ANALYTICS & DISPATCH INTELLIGENCE                           │ ║
║  ├─────────────────────────────────────────────────────────────────────┤ ║
║  │  SKILL COVERAGE TODAY:                                              │ ║
║  │  Plumbing: 2 workers available (Jim ⭐⭐⭐⭐⭐, Sarah ⭐⭐⭐)          │ ║
║  │  HVAC: 2 workers (Mike ⭐⭐⭐⭐⭐, Jim ⭐⭐⭐)                         │ ║
║  │  Electrical: 1 worker (Sarah ⭐⭐⭐⭐⭐) ⚠️ Limited coverage         │ ║
║  │  Handyman: 2 workers (Tom ⭐⭐⭐⭐⭐, Lisa ⭐⭐⭐)                     │ ║
║  │                                                                      │ ║
║  │  CAPACITY:                                                           │ ║
║  │  Current utilization: 87% (healthy)                                 │ ║
║  │  Available capacity: 6.5 hours (Mike 2.5h, Lisa 4h)                 │ ║
║  │  Emergency capacity: Mike available immediately                     │ ║
║  │                                                                      │ ║
║  │  ALERTS:                                                             │ ║
║  │  ⚠️  Jim's truck inventory low on water heater elements            │ ║
║  │  💡 Mike has 2.5 hours free - assign routine jobs?                  │ ║
║  │                                                                      │ ║
║  │  [VIEW SKILLS MATRIX] [CAPACITY PLANNER] [DISPATCH OPTIMIZER]       │ ║
║  └─────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

**Key Features:**
- **Real-Time GPS Tracking**: See exact location of all workers with ETA calculations
- **Skills Matrix**: Detailed proficiency ratings for multi-trade workers
- **Truck Inventory Tracking**: Know what parts each worker has before dispatch
- **Smart Dispatch Suggestions**: System recommends best worker based on skills, location, availability, parts
- **Capacity Planning**: Visual overview of team utilization and available hours
- **License/Certification Tracking**: Ensure compliance and match jobs to qualified workers

**Integration Points:**
- Worker mobile app (GPS tracking, inventory updates, job status)
- Parts inventory system (track truck stock levels)
- License verification services (auto-renew reminders)
- Dispatch algorithm (skill matching, route optimization)

**Data Model Extensions:**
- `workers` table: name, phone, email, status, availability_pattern
- `worker_skills` table: worker_id, skill_type, proficiency_level, certifications, license_number, expiration_date
- `worker_locations` table: worker_id, latitude, longitude, timestamp, accuracy, current_job_id
- `worker_inventory` table: worker_id, part_name, quantity, last_restocked, restock_threshold
- `worker_licenses` table: worker_id, license_type, license_number, issuing_authority, expiration_date

**Success Metrics:**
- Worker utilization: 85-95% (not overbooked, not underutilized)
- Dispatch accuracy: > 95% (right worker for the job, first time)
- GPS tracking uptime: > 98% (workers keep app running)
- License compliance: 100% (no expired licenses)
- Emergency response time: < 15 minutes (worker en route)

---

## 5. External Contractor Network - Specialty Directory

```
╔═══════════════════════════════════════════════════════════════════════════╗
║ External Contractor Network                            [+ Add] [⚙️]      ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  🔍 [Search contractors...] [Filter: All ▼] [Sort: Rating ▼]             ║
║                                                                           ║
║  ┌─────────────────────────────────────────────────────────────────────┐ ║
║  │ 📊 CONTRACTOR NETWORK OVERVIEW                                       │ ║
║  ├─────────────────────────────────────────────────────────────────────┤ ║
║  │  Total Contractors: 18 | Active This Month: 12 | Avg Rating: 4.6/5  │ ║
║  │  Jobs Referred: 34 (this year) | Total Spend: $28,450               │ ║
║  │  Use Cases: Specialty work, overflow capacity, emergency backup     │ ║
║  └─────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
║  ┌─────────────────────────────────────────────────────────────────────┐ ║
║  │ 🔧 SPECIALTY: Gatlinburg Plumbing (Licensed Plumber)                │ ║
║  ├─────────────────────────────────────────────────────────────────────┤ ║
║  │  Contact: Bill Thompson | 📞 (865) 555-9001                         │ ║
║  │  ✉️ bill@gatlinburgplumbing.com | 🌐 gatlinburgplumbing.com         │ ║
║  │                                                                      │ ║
║  │  SPECIALTIES:                                                        │ ║
║  │  🚿 Emergency plumbing (24/7 available)                             │ ║
║  │  🔥 Gas line installation & repair (licensed)                       │ ║
║  │  💧 Well pump & septic system service                               │ ║
║  │  🏗️ Major remodeling plumbing                                       │ ║
║  │                                                                      │ ║
║  │  USE WHEN:                                                           │ ║
║  │  • Your team is at capacity (all plumbers booked)                   │ ║
║  │  • Gas line work (Jim not certified for this)                       │ ║
║  │  • Septic/well issues (specialty work)                              │ ║
║  │  • Emergency after-hours (your team off-duty)                       │ ║
║  │                                                                      │ ║
║  │  PERFORMANCE:                                                        │ ║
║  │  Jobs Referred: 8 (this year) | Total Spend: $4,250                 │ ║
║  │  Rating: 4.8/5 (6 customer reviews)                                 │ ║
║  │  Response Time: < 30 min for emergencies                            │ ║
║  │  Pricing: $150/hr (premium, but worth it for specialty)             │ ║
║  │                                                                      │ ║
║  │  LAST USED: 2 weeks ago (Well pump repair - $680)                   │ ║
║  │                                                                      │ ║
║  │  [CALL NOW] [EMAIL] [VIEW HISTORY] [REFER JOB] [EDIT]               │ ║
║  └─────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
║  ┌─────────────────────────────────────────────────────────────────────┐ ║
║  │ 🏠 SPECIALTY: Smoky Mountain Roofing (Licensed Roofer)              │ ║
║  ├─────────────────────────────────────────────────────────────────────┤ ║
║  │  Contact: Mike Sanders | 📞 (865) 555-9015                          │ ║
║  │  ✉️ mike@smokymtnroofing.com                                        │ ║
║  │                                                                      │ ║
║  │  SPECIALTIES:                                                        │ ║
║  │  🏚️ Roof repairs & replacement                                      │ ║
║  │  ❄️ Winter ice dam removal                                          │ ║
║  │  💨 Storm damage emergency service                                  │ ║
║  │  🛡️ Warranty work & inspections                                     │ ║
║  │                                                                      │ ║
║  │  USE WHEN:                                                           │ ║
║  │  • Any roof work (not in your skill set)                            │ ║
║  │  • Storm damage (common in Smokies)                                 │ ║
║  │  • Insurance claims (they handle paperwork)                         │ ║
║  │                                                                      │ ║
║  │  PERFORMANCE:                                                        │ ║
║  │  Jobs Referred: 12 | Total Spend: $18,950                           │ ║
║  │  Rating: 4.9/5 (10 reviews) ⭐ HIGHLY RECOMMENDED                   │ ║
║  │  Response Time: Same day for emergencies                            │ ║
║  │                                                                      │ ║
║  │  LAST USED: 1 week ago (Leak repair - $850)                         │ ║
║  │                                                                      │ ║
║  │  [CALL] [EMAIL] [REFER JOB] [HISTORY]                               │ ║
║  └─────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
║  ┌─────────────────────────────────────────────────────────────────────┐ ║
║  │ ⚡ SPECIALTY: Highland Electrical (Master Electrician)              │ ║
║  ├─────────────────────────────────────────────────────────────────────┤ ║
║  │  Contact: Sarah Chen | 📞 (865) 555-9022                            │ ║
║  │  ✉️ sarah@highlandelectrical.com                                    │ ║
║  │                                                                      │ ║
║  │  SPECIALTIES:                                                        │ ║
║  │  🔌 Panel upgrades & service changes                                │ ║
║  │  💡 Generator installation                                          │ ║
║  │  🏡 Whole-home rewiring                                             │ ║
║  │  🔍 Electrical inspections & code compliance                        │ ║
║  │                                                                      │ ║
║  │  USE WHEN:                                                           │ ║
║  │  • Major electrical work (beyond Sarah K's scope)                   │ ║
║  │  • Permit-required work (she handles inspections)                   │ ║
║  │  • Sarah K is at capacity                                           │ ║
║  │                                                                      │ ║
║  │  PERFORMANCE:                                                        │ ║
║  │  Jobs Referred: 5 | Total Spend: $3,200                             │ ║
║  │  Rating: 4.7/5 (4 reviews)                                          │ ║
║  │                                                                      │ ║
║  │  LAST USED: 3 weeks ago (Panel upgrade - $1,200)                    │ ║
║  │                                                                      │ ║
║  │  [CALL] [EMAIL] [REFER JOB]                                         │ ║
║  └─────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
║  ┌─────────────────────────────────────────────────────────────────────┐ ║
║  │ 🌳 SPECIALTY: Green Valley Tree Service (Arborist)                  │ ║
║  ├─────────────────────────────────────────────────────────────────────┤ ║
║  │  Contact: Tom Wilson | 📞 (865) 555-9030                            │ ║
║  │                                                                      │ ║
║  │  SPECIALTIES:                                                        │ ║
║  │  🌲 Tree removal (large/dangerous trees)                            │ ║
║  │  ✂️ Professional trimming & pruning                                 │ ║
║  │  🪓 Storm damage cleanup                                            │ ║
║  │  🪵 Stump grinding                                                  │ ║
║  │                                                                      │ ║
║  │  USE WHEN: Any tree work (not in your scope)                        │ ║
║  │  PERFORMANCE: 4 jobs | $2,050 | 4.6/5 rating                        │ ║
║  │                                                                      │ ║
║  │  [CALL] [REFER JOB]                                                 │ ║
║  └─────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
║  ┌─────────────────────────────────────────────────────────────────────┐ ║
║  │ 📂 OTHER CONTRACTORS (14 more)                   [View All →]       │ ║
║  ├─────────────────────────────────────────────────────────────────────┤ ║
║  │  • Appliance Repair: Mountain Appliance Service                     │ ║
║  │  • Pest Control: Smoky Mountain Pest Solutions                      │ ║
║  │  • Septic: Valley Septic & Pumping                                  │ ║
║  │  • HVAC (overflow): Tennessee Climate Control                       │ ║
║  │  • Concrete: Gatlinburg Concrete & Masonry                          │ ║
║  │  • Window Replacement: Highland Glass & Windows                     │ ║
║  │  • Carpet Cleaning: Fresh Start Carpet Care                         │ ║
║  │  • Locksmith: 24/7 Secure Locksmith                                 │ ║
║  │  • Chimney: Smoky Mountain Chimney Sweep                            │ ║
║  │  • Foundation: Tennessee Foundation Experts                         │ ║
║  │  ... [+4 more]                                                       │ ║
║  └─────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
║  ┌─────────────────────────────────────────────────────────────────────┐ ║
║  │ 💡 SMART REFERRAL WORKFLOW                                          │ ║
║  ├─────────────────────────────────────────────────────────────────────┤ ║
║  │  When you refer a job to an external contractor:                    │ ║
║  │                                                                      │ ║
║  │  1. System creates "Referred Job" record (tracked in your system)   │ ║
║  │  2. Auto-email sent to contractor with job details                  │ ║
║  │  3. Customer notified: "We've referred this to our trusted partner" │ ║
║  │  4. You receive copy of contractor's quote (markup opportunity)     │ ║
║  │  5. Track completion & collect customer feedback                    │ ║
║  │  6. Optional: Add coordination fee (10-15% markup for management)   │ ║
║  │                                                                      │ ║
║  │  This keeps you in the loop and maintains customer relationship!    │ ║
║  └─────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

**Key Features:**
- **Specialty Directory**: Curated list of trusted contractors for work outside your scope
- **Performance Tracking**: Rate contractors and track customer feedback
- **Smart Referral Workflow**: Maintain customer relationship even when referring out
- **Markup Opportunity**: Add coordination fee for managing external contractors
- **Use-Case Guidance**: Clear instructions on when to use each contractor

**Integration Points:**
- Customer Portal (notify customers of referrals)
- Email system (auto-email contractors with job details)
- Feedback collection (rate contractors after job completion)

**Data Model Extensions:**
- `external_contractors` table: name, contact_info, specialties (JSON array), pricing_notes
- `referred_jobs` table: job_id, contractor_id, referral_date, completion_date, customer_rating
- `contractor_ratings` table: contractor_id, job_id, rating, feedback, would_use_again

**Success Metrics:**
- Contractor network size: Maintain 15-20 trusted partners
- Referral volume: Track jobs referred vs. handled internally
- Customer satisfaction: > 4.5/5 for referred jobs (maintain trust)
- Markup revenue: Track coordination fees earned

---

## 6. Schedule View - Week Calendar

```
╔═══════════════════════════════════════════════════════════════════════════╗
║ Maintenance Schedule                     📅 Week View ▼  [Today]          ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  [◄ Previous]  Oct 27 - Nov 2, 2025  [Next ►]    [+ Add Job] [Auto-Fill]║
║                                                                           ║
║  ┌────────┬───────────┬───────────┬───────────┬───────────┬───────────┐  ║
║  │ Worker │ MON 10/27 │ TUE 10/28 │ WED 10/29 │ THU 10/30 │ FRI 10/31 │  ║
║  ├────────┼───────────┼───────────┼───────────┼───────────┼───────────┤  ║
║  │        │           │           │           │           │           │  ║
║  │ Jim R. │ ┌────────┐│ ┌────────┐│ ┌────────┐│ OFF       │ ┌────────┐│  ║
║  │ (Plumb)│ │HVAC Flt││ │Leak Rpr││ │WtrHtr  ││           │ │HVAC Flt││  ║
║  │        │ │$120·1h ││ │$180·2h ││ │$200·2h ││           │ │$120·1h ││  ║
║  │        │ │✅      ││ │✅      ││ │✅      ││           │ │✅      ││  ║
║  │        │ └────────┘│ └────────┘│ └────────┘│           │ ┌────────┐│  ║
║  │        │           │           │           │           │ │🚨WtrHtr││  ║
║  │        │           │           │           │           │ │$306·2h ││  ║
║  │        │           │           │           │           │ │🚗EnRout││  ║
║  │        │           │           │           │           │ └────────┘│  ║
║  │        │           │           │           │           │ ┌────────┐│  ║
║  │        │           │           │           │           │ │Leak Rpr││  ║
║  │        │           │           │           │           │ │$180·2h ││  ║
║  │        │           │           │           │           │ │⏰Sched ││  ║
║  │        │           │           │           │           │ └────────┘│  ║
║  │        │           │           │           │           │           │  ║
║  │ Tom L. │ ┌────────┐│ ┌────────┐│ ┌────────┐│ ┌────────┐│ ┌────────┐│  ║
║  │ (Handym││ │Deck Rpr││ │Paint   ││ │Carp Fix││ │Deck Rpr││ │Deck Rpr││  ║
║  │        │ │$450·3h ││ │$280·4h ││ │$180·2h ││ │$450·3h ││ │$450·3h ││  ║
║  │        │ │✅      ││ │✅      ││ │✅      ││ │✅      ││ │🔄Work  ││  ║
║  │        │ └────────┘│ └────────┘│ └────────┘│ └────────┘│ └────────┘│  ║
║  │        │           │           │           │           │ ┌────────┐│  ║
║  │        │           │           │           │           │ │WndwSeal││  ║
║  │        │           │           │           │           │ │$280·2h ││  ║
║  │        │           │           │           │           │ │⏰Sched ││  ║
║  │        │           │           │           │           │ └────────┘│  ║
║  │        │           │           │           │           │ ┌────────┐│  ║
║  │        │           │           │           │           │ │🚨Toilet││  ║
║  │        │           │           │           │           │ │$45·15m ││  ║
║  │        │           │           │           │           │ │🚗Dispat││  ║
║  │        │           │           │           │           │ └────────┘│  ║
║  │        │           │           │           │           │           │  ║
║  │ Sarah K│ ┌────────┐│ ┌────────┐│ ┌────────┐│ ┌────────┐│ ┌────────┐│  ║
║  │ (Elec) │ │Outlet  ││ │Breaker ││ │Light   ││ │Outlet  ││ │Faucet  ││  ║
║  │        │ │$120·1h ││ │$120·1h ││ │$85·1h  ││ │$120·1h ││ │$85·1h  ││  ║
║  │        │ │✅      ││ │✅      ││ │✅      ││ │✅      ││ │🔄Work  ││  ║
║  │        │ └────────┘│ └────────┘│ └────────┘│ └────────┘│ └────────┘│  ║
║  │        │           │           │           │           │ ┌────────┐│  ║
║  │        │           │           │           │           │ │Outlet  ││  ║
║  │        │           │           │           │           │ │$120·1h ││  ║
║  │        │           │           │           │           │ │⏰Sched ││  ║
║  │        │           │           │           │           │ └────────┘│  ║
║  │        │           │           │           │           │           │  ║
║  │ Mike D.│ ┌────────┐│ ┌────────┐│ ┌────────┐│ ┌────────┐│ ┌────────┐│  ║
║  │ (HVAC) │ │TuneUp  ││ │Filter  ││ │TuneUp  ││ │Filter  ││ │TuneUp  ││  ║
║  │        │ │$180·2h ││ │$120·1h ││ │$180·2h ││ │$120·1h ││ │$180·2h ││  ║
║  │        │ │✅      ││ │✅      ││ │✅      ││ │✅      ││ │✅      ││  ║
║  │        │ └────────┘│ └────────┘│ └────────┘│ └────────┘│ └────────┘│  ║
║  │        │           │           │           │           │ ┌────────┐│  ║
║  │        │           │           │           │           │ │💡AVAIL ││  ║
║  │        │           │           │           │           │ │ 2.5hrs ││  ║
║  │        │           │           │           │           │ │        ││  ║
║  │        │           │           │           │           │ └────────┘│  ║
║  │        │           │           │           │           │ ┌────────┐│  ║
║  │        │           │           │           │           │ │Filter  ││  ║
║  │        │           │           │           │           │ │$120·1h ││  ║
║  │        │           │           │           │           │ │⏰Sched ││  ║
║  │        │           │           │           │           │ └────────┘│  ║
║  │        │           │           │           │           │           │  ║
║  │ Carlos │ ┌────────┐│ ┌────────┐│ ┌────────┐│ ┌────────┐│ ┌────────┐│  ║
║  │ (Land) │ │Gutters ││ │Mowing  ││ │Trim    ││ │Gutters ││ │Gutters ││  ║
║  │        │ │$220·2h ││ │$180·3h ││ │$150·2h ││ │$220·2h ││ │$220·2h ││  ║
║  │        │ │✅      ││ │✅      ││ │✅      ││ │✅      ││ │🔄Work  ││  ║
║  │        │ └────────┘│ └────────┘│ └────────┘│ └────────┘│ └────────┘│  ║
║  └────────┴───────────┴───────────┴───────────┴───────────┴───────────┘  ║
║                                                                           ║
║  Legend: ✅ Done | 🔄 Working | ⏰ Scheduled | 🚨 Emergency | 🚗 En Route║
║          💡 Available for dispatch                                       ║
║                                                                           ║
║  ┌─────────────────────────────────────────────────────────────────────┐ ║
║  │ 📦 UNASSIGNED JOBS (6)                       [Auto-Assign All]       │ ║
║  ├─────────────────────────────────────────────────────────────────────┤ ║
║  │  🚨 EMERGENCY: No hot water - Bear Cabin (DISPATCH NOW!)            │ ║
║  │  🟠 URGENT: Toilet handle - Pine Lodge (Guest in 90 min)            │ ║
║  │  Routine: HVAC filter - Mountain View ($120, 1hr, flexible)         │ ║
║  │  Routine: Gutter cleaning - Elk View ($220, 2hr, this week)         │ ║
║  │  Quote Approved: Deck staining - Valley View ($1,200, 8hr, Mon-Tue) │ ║
║  │  Preventive: Smoke detector batteries - 4 properties ($60 ea, 30min)│ ║
║  └─────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
║  [Drag & Drop to Assign] [Worker Map View] [Export] [Print Schedule]    ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

**Key Features:**
- **Worker-Centric Layout**: Schedule by worker (not property) for dispatch efficiency
- **Color-Coded Status**: Visual urgency indicators (red emergency, orange urgent, green routine)
- **Drag-and-Drop Assignment**: Move unassigned jobs onto worker schedules
- **Capacity Visibility**: See gaps in schedules for opportunistic job assignment
- **Emergency Insertion**: Easily insert urgent jobs into existing schedules

**Integration Points:**
- Worker mobile app (schedule notifications)
- Customer Portal (appointment confirmations)
- GPS tracking (route optimization)

**Data Model Extensions:**
- Schedule stored in `maintenance_jobs` table with worker_id and scheduled_time
- Real-time sync with worker mobile apps

**Success Metrics:**
- Schedule efficiency: > 90% of worker hours utilized
- Emergency insertion time: < 5 minutes (from report to scheduled)
- Worker schedule satisfaction: > 4.5/5 (balanced workload)

---

## Data Model Summary

### New Tables Required:

1. **maintenance_jobs**
   - id, property_id, customer_id, job_type, priority (emergency/urgent/routine)
   - guest_impact (boolean), guest_arrival_time, sla_deadline
   - assigned_worker_id, quote_id, ai_assessment_id
   - scheduled_start, scheduled_end, actual_start, actual_end
   - status (reported, quoted, approved, dispatched, in_progress, completed)
   - total_cost, payment_status, invoice_id
   - created_at, updated_at

2. **workers**
   - id, name, email, phone, worker_type
   - status (available, working, en_route, on_break, off_duty)
   - current_job_id, availability_pattern (JSON)
   - created_at, updated_at

3. **worker_skills**
   - id, worker_id, skill_type, proficiency_level (1-5 stars)
   - certifications (JSON array), license_number, license_expiration
   - specialty_notes

4. **worker_locations**
   - id, worker_id, latitude, longitude, accuracy
   - timestamp, current_job_id, eta_to_next_job

5. **worker_inventory**
   - id, worker_id, part_name, part_sku, quantity
   - restock_threshold, last_restocked_date

6. **ai_assessments**
   - id, job_id, diagnosis, confidence_score
   - recommended_action, recommended_parts (JSON)
   - diy_attempted, diy_successful, chat_transcript (JSON)
   - photos (JSON array), created_at

7. **quote_templates**
   - id, template_name, service_category, line_items (JSON)
   - default_pricing, estimated_time, notes_template

8. **quotes**
   - id, job_id, customer_id, property_id, quote_number
   - line_items (JSON), subtotal, tax, total
   - status (draft, sent, viewed, approved, rejected, expired)
   - valid_until, approved_at, created_at

9. **external_contractors**
   - id, company_name, contact_name, phone, email, website
   - specialties (JSON array), pricing_notes
   - performance_rating, jobs_referred, total_spend

10. **referred_jobs**
    - id, job_id, contractor_id, referral_date, completion_date
    - customer_rating, would_use_again, notes

---

## Technical Architecture Notes

### Emergency Triage System:
- **Priority Queue Algorithm**: Auto-calculates priority score based on guest impact, time sensitivity, SLA
- **Real-Time Alerts**: WebSocket notifications for emergency jobs (push to Alex's phone)
- **Auto-Dispatch Logic**: Suggest best worker based on skills, location, parts inventory, availability

### AI Integration:
- **Guest AI Dashboard Integration**: Receive reports with photos, preliminary diagnosis, DIY attempt results
- **Photo Analysis**: Computer vision to identify equipment, read model numbers, detect issues
- **Confidence Scoring**: ML model predicts diagnosis accuracy (80%+ = high confidence)

### Worker Mobile App:
- **GPS Tracking**: Background location updates every 5 minutes (battery-optimized)
- **Job Assignments**: Push notifications for new jobs with details, directions
- **Inventory Management**: Check off parts used, flag restock needs
- **Photo Upload**: Before/after photos with automatic job association

### Quote System:
- **Template Engine**: 50+ pre-built templates for common services
- **Smart Pricing**: Auto-calculate emergency multipliers, tax, discounts
- **One-Click Approval**: Customer receives email/SMS with "Approve Quote" button (no login required for small jobs)

### Cross-Dashboard Features:
- One-click cleaning service upsell for maintenance-only customers
- Shared customer database with cleaning dashboard
- Unified billing and payment processing

---

## Implementation Priority - Phase 1

**Week 1-2: Emergency Triage & Core Dashboard**
1. Dashboard homepage with emergency priority queue
2. Basic job list (sorted by priority)
3. Worker list with contact info
4. Simple job assignment (manual)

**Week 3-4: Worker Management & GPS**
5. GPS tracking integration
6. Worker skills matrix
7. Smart dispatch suggestions
8. Worker mobile app API

**Week 5-6: Quote System & AI Integration**
9. Quote builder with templates
10. Quote approval workflow
11. AI assessment display
12. Guest AI integration

**Week 7-8: Advanced Features**
13. External contractor network
14. Schedule calendar view
15. Performance analytics
16. Cross-sell automation

---

## Design Principles

1. **Emergency-First Design**: Guest-impacting issues always visible at top
2. **Speed Over Perfection**: Get worker en route in < 5 minutes (refine later)
3. **AI-Assisted, Not AI-Automated**: AI suggests, Alex decides
4. **Mobile-Optimized**: 70% of emergency dispatch happens on phone
5. **Skill-Aware Dispatch**: Never send wrong worker to specialized job
6. **Transparent Pricing**: Customers see costs upfront, approve before work starts

---

## Success Metrics

### Emergency Response:
- Report to dispatch: < 5 minutes
- Worker arrival (emergency): < 30 minutes average
- Guest-impacting resolution: < 2 hours

### Quote Efficiency:
- Quote generation: < 2 minutes (using templates)
- Quote approval rate: > 70%
- Quote response time: < 3 days average

### Worker Management:
- Worker utilization: 85-95%
- GPS tracking uptime: > 98%
- Dispatch accuracy: > 95% (right worker, first time)

### Business Impact:
- Monthly maintenance revenue: Track growth
- Cross-sell conversion (maint → clean): > 20%
- Customer retention: > 90%
- Average job value: Track over time

---

**Version:** 1.0
**Last Updated:** October 31, 2025
**Owner:** Alex (Service Provider)
