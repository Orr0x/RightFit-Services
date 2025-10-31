# Customer Portal Wireframes

**Target User:** Jane (Lodge Manager) - Property Manager/Owner
**Primary Use Case:** Monitor service activities, approve quotes, view history, communicate with Alex
**Key Objective:** Self-service portal for quote approvals, job tracking, and service history

---

## Dashboard Overview

### 1. Homepage - Property Portfolio Overview

```
╔═══════════════════════════════════════════════════════════════════════════╗
║ Mountain Lodge Rentals Portal                  [Jane Smith] [⚙️] [🔔 3]  ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  Welcome back, Jane! Here's what's happening with your properties.       ║
║                                                                           ║
║  ┌─────────────────────────────────────────────────────────────────────┐ ║
║  │ 🚨 NEEDS YOUR ATTENTION (3)                                          │ ║
║  ├─────────────────────────────────────────────────────────────────────┤ ║
║  │                                                                      │ ║
║  │  💰 QUOTE AWAITING APPROVAL - Bear Cabin Water Heater              │ ║
║  │     Emergency repair completed today | Total: $306.60               │ ║
║  │     Auto-billed per contract (emergency < $500)                     │ ║
║  │     [VIEW INVOICE] [VIEW PHOTOS] [CONTACT ALEX]                     │ ║
║  │                                                                      │ ║
║  │  🔧 ACTIVE JOB - Pine Lodge Toilet Handle                           │ ║
║  │     Worker en route (Tom L.) | ETA: 15 minutes                      │ ║
║  │     Guest check-in: 3:00 PM (90 min from now)                       │ ║
║  │     [TRACK WORKER] [VIEW DETAILS] [CONTACT]                         │ ║
║  │                                                                      │ ║
║  │  ⏰ CLEANING SCHEDULED - Elk View Lodge                             │ ║
║  │     Tomorrow 8:00 AM | Cleaner: Sarah M. | $180                     │ ║
║  │     [VIEW DETAILS] [RESCHEDULE] [CONTACT]                           │ ║
║  │                                                                      │ ║
║  └─────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
║  ┌──────────────────────┬────────────────────────┬────────────────────┐  ║
║  │ YOUR PROPERTIES (8)  │ ACTIVE SERVICES        │ THIS MONTH         │  ║
║  ├──────────────────────┼────────────────────────┼────────────────────┤  ║
║  │                      │                        │                    │  ║
║  │  ✅ All Ready: 6     │  🧹 Cleaning: Active  │  Cleaning: $1,760  │  ║
║  │  🔧 In Service: 2    │     64 cleans YTD     │  Maintenance: $612 │  ║
║  │  📅 Next Clean: 12h  │                        │  Total: $2,372     │  ║
║  │                      │  🔧 Maintenance: ✅   │                    │  ║
║  │  [VIEW ALL →]       │     12 jobs YTD        │  [VIEW INVOICE →] │  ║
║  │                      │                        │                    │  ║
║  │                      │  [MANAGE SERVICES →]  │  [PAY NOW]         │  ║
║  └──────────────────────┴────────────────────────┴────────────────────┘  ║
║                                                                           ║
║  ┌─────────────────────────────────────────────────────────────────────┐ ║
║  │ 🏠 YOUR PROPERTIES - QUICK STATUS                                   │ ║
║  ├─────────────────────────────────────────────────────────────────────┤ ║
║  │                                                                      │ ║
║  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐    │ ║
║  │  │ 🏠 Bear Cabin   │  │ 🏠 Pine Lodge   │  │ 🏠 Elk View     │    │ ║
║  │  │ 2BR | 2BA       │  │ 3BR | 2BA       │  │ 2BR | 2.5BA     │    │ ║
║  │  ├─────────────────┤  ├─────────────────┤  ├─────────────────┤    │ ║
║  │  │ Status: 🔧 Maint│  │ Status: 🔧 Maint│  │ Status: ✅ Ready│    │ ║
║  │  │                 │  │                 │  │                 │    │ ║
║  │  │ 🚨 Water heater │  │ 🟠 Toilet repair│  │ 🧹 Last clean:  │    │ ║
║  │  │    Completed    │  │    In progress  │  │    Today 10:30AM│    │ ║
║  │  │    today 1:30PM │  │    ETA: 15 min  │  │    ⭐⭐⭐⭐⭐    │    │ ║
║  │  │                 │  │                 │  │                 │    │ ║
║  │  │ Next: Clean Sat │  │ Next: Clean Sun │  │ Next: Clean Mon │    │ ║
║  │  │                 │  │                 │  │                 │    │ ║
║  │  │ [VIEW DETAILS]  │  │ [TRACK WORKER]  │  │ [VIEW DETAILS]  │    │ ║
║  │  └─────────────────┘  └─────────────────┘  └─────────────────┘    │ ║
║  │                                                                      │ ║
║  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐    │ ║
║  │  │ 🏠 Deer Cabin   │  │ 🏠 Sunset Rtreat│  │ 🏠 Mtn View     │    │ ║
║  │  │ 1BR | 1BA       │  │ 2BR | 2BA       │  │ 4BR | 3BA       │    │ ║
║  │  ├─────────────────┤  ├─────────────────┤  ├─────────────────┤    │ ║
║  │  │ Status: ✅ Ready│  │ Status: ✅ Ready│  │ Status: ✅ Ready│    │ ║
║  │  │                 │  │                 │  │                 │    │ ║
║  │  │ Last clean:     │  │ Last clean:     │  │ Last clean:     │    │ ║
║  │  │ Yesterday       │  │ Yesterday       │  │ In progress     │    │ ║
║  │  │ ⭐⭐⭐⭐         │  │ ⭐⭐⭐⭐⭐        │  │ 🚨 Carpet stain │    │ ║
║  │  │                 │  │                 │  │    reported     │    │ ║
║  │  │ [VIEW DETAILS]  │  │ [VIEW DETAILS]  │  │ [VIEW DETAILS]  │    │ ║
║  │  └─────────────────┘  └─────────────────┘  └─────────────────┘    │ ║
║  │                                                                      │ ║
║  │  ┌─────────────────┐  ┌─────────────────┐                          │ ║
║  │  │ 🏠 Ridge View   │  │ 🏠 Creek Lodge  │                          │ ║
║  │  │ 3BR | 2BA       │  │ 2BR | 2BA       │                          │ ║
║  │  ├─────────────────┤  ├─────────────────┤                          │ ║
║  │  │ Status: ✅ Ready│  │ Status: ✅ Ready│                          │ ║
║  │  │                 │  │                 │                          │ ║
║  │  │ Last clean:     │  │ Last clean:     │                          │ ║
║  │  │ 2 days ago      │  │ 3 days ago      │                          │ ║
║  │  │ ⭐⭐⭐⭐⭐        │  │ ⭐⭐⭐⭐         │                          │ ║
║  │  │                 │  │                 │                          │ ║
║  │  │ [VIEW DETAILS]  │  │ [VIEW DETAILS]  │                          │ ║
║  │  └─────────────────┘  └─────────────────┘                          │ ║
║  │                                                                      │ ║
║  │  [+ ADD PROPERTY] [SCHEDULE CLEANING] [REQUEST MAINTENANCE]         │ ║
║  └─────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
║  ┌─────────────────────────────────────────────────────────────────────┐ ║
║  │ 💡 RECOMMENDATIONS FOR YOU                                          │ ║
║  ├─────────────────────────────────────────────────────────────────────┤ ║
║  │  🔧 3 properties haven't had HVAC service in 6+ months              │ ║
║  │     Winter is coming - consider seasonal tune-ups ($180 each)       │ ║
║  │     [GET QUOTE] [SCHEDULE NOW] [REMIND ME LATER]                    │ ║
║  │                                                                      │ ║
║  │  📊 Your cleaning satisfaction avg: 4.8/5 (Excellent!)              │ ║
║  │     Consider adding deep clean service quarterly ($450 per property)│ ║
║  │     [LEARN MORE] [GET QUOTE]                                        │ ║
║  └─────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
║  ┌─────────────────────────────────────────────────────────────────────┐ ║
║  │ 📅 UPCOMING SERVICES (Next 7 Days)                                  │ ║
║  ├─────────────────────────────────────────────────────────────────────┤ ║
║  │  Tomorrow 8:00 AM - Elk View Lodge - Cleaning ($180)                │ ║
║  │  Tomorrow 10:00 AM - Deer Cabin - Cleaning ($160)                   │ ║
║  │  Sunday 9:00 AM - Pine Lodge - Cleaning ($220)                      │ ║
║  │  Monday 2:00 PM - Bear Cabin - HVAC Filter ($120)                   │ ║
║  │  Tuesday 10:00 AM - Mountain View - Deck Staining ($1,200)          │ ║
║  │                                                                      │ ║
║  │  [VIEW FULL CALENDAR] [EXPORT TO ICAL] [MANAGE SCHEDULE]            │ ║
║  └─────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

**Key Features:**
- **Property Portfolio View**: At-a-glance status of all properties
- **Action Items First**: Urgent approvals and active jobs at the top
- **Mobile-Optimized Cards**: Property cards with quick status indicators
- **Proactive Recommendations**: AI suggests preventive maintenance based on service history
- **Unified Service View**: Both cleaning and maintenance in one portal

**Integration Points:**
- Cleaning Dashboard (cleaning schedules, cleaner status)
- Maintenance Dashboard (job status, worker locations)
- Payment gateway (pay invoices, manage payment methods)
- Calendar sync (export to Google/iCal)

**Data Model Extensions:**
- Customer portal uses existing data from cleaning/maintenance systems
- `customer_preferences` table: notification_settings, default_payment_method, portal_theme

**Success Metrics:**
- Portal usage: > 70% of customers log in at least weekly
- Quote approval speed: < 24 hours average (vs. 3 days via email)
- Self-service rate: > 80% of actions completed without calling Alex
- Customer satisfaction: > 4.5/5 with portal experience

---

## 2. Property Details View - Complete Service History

```
╔═══════════════════════════════════════════════════════════════════════════╗
║ Property Details: Bear Cabin                    [Edit] [⚙️] [← Back]     ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  ┌─────────────────────────────────────────────────────────────────────┐ ║
║  │ 🏠 PROPERTY INFORMATION                                              │ ║
║  ├─────────────────────────────────────────────────────────────────────┤ ║
║  │  Property Name: Bear Cabin                                          │ ║
║  │  Address: 123 Bear Trail, Gatlinburg, TN 37738                      │ ║
║  │  Type: 2 Bedroom | 2 Bathroom | ~1,200 sq ft                        │ ║
║  │  Year Built: 2015 | Rental Status: Active (Short-term)              │ ║
║  │                                                                      │ ║
║  │  Services:                                                           │ ║
║  │  🧹 Cleaning: Premium Clean Package ($220/clean)                    │ ║
║  │  🔧 Maintenance: Basic Service Contract (emergency + routine)       │ ║
║  │                                                                      │ ║
║  │  Access Info: Lockbox code 4782# | Gate code: 9876                  │ ║
║  │  Special Notes: Guest allergic to strong scents - use mild products │ ║
║  │                                                                      │ ║
║  │  [EDIT PROPERTY] [MANAGE ACCESS CODES] [UPDATE SPECIAL NOTES]       │ ║
║  └─────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
║  ┌─────────────────────────────────────────────────────────────────────┐ ║
║  │ 📊 CURRENT STATUS                                                   │ ║
║  ├─────────────────────────────────────────────────────────────────────┤ ║
║  │  Status: 🟡 IN SERVICE (Maintenance job completed today)            │ ║
║  │  Ready for Guests: ✅ YES (Property is clean and functional)        │ ║
║  │  Next Scheduled Service: Tomorrow 8:00 AM (Cleaning)                │ ║
║  │                                                                      │ ║
║  │  Last Cleaning: Oct 30, 2025 (2 days ago) | Quality: ⭐⭐⭐⭐       │ ║
║  │  Last Maintenance: Today, Oct 31 (Water heater repair)              │ ║
║  └─────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
║  ┌─────────────────────────────────────────────────────────────────────┐ ║
║  │ 📅 SERVICE HISTORY - CHRONOLOGICAL TIMELINE                         │ ║
║  ├─────────────────────────────────────────────────────────────────────┤ ║
║  │  [All Services ▼] [Last 30 Days ▼] [Export CSV] [Print]            │ ║
║  │                                                                      │ ║
║  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │ ║
║  │                                                                      │ ║
║  │  📅 TODAY - FRIDAY, OCT 31, 2025                                    │ ║
║  │                                                                      │ ║
║  │  ┌────────────────────────────────────────────────────────────────┐ │ ║
║  │  │ 🔧 MAINTENANCE - Water Heater Repair                           │ │ ║
║  │  │ Status: ✅ COMPLETED at 1:30 PM                                │ │ ║
║  │  ├────────────────────────────────────────────────────────────────┤ │ ║
║  │  │ Worker: Jim Rodriguez (Plumber)                                │ │ ║
║  │  │ Issue: No hot water (pilot light wouldn't stay lit)            │ ║
║  │  │ Resolution: Replaced faulty thermocouple                       │ │ ║
║  │  │ Time: 10:45 AM reported → 1:30 PM completed (2h 45m)           │ ║
║  │  │                                                                 │ │ ║
║  │  │ Priority: 🚨 EMERGENCY (Guest-impacting)                       │ ║
║  │  │ Guest notified: Yes (SMS + portal notification)                │ ║
║  │  │                                                                 │ │ ║
║  │  │ 📸 Photos (5): [Before] [Diagnosis] [Repair] [After] [Testing]│ │ ║
║  │  │ 📄 Invoice: $306.60 (Auto-billed per contract)                 │ │ ║
║  │  │                                                                 │ │ ║
║  │  │ Your rating: [Rate this service: ⭐⭐⭐⭐⭐]                     │ │ ║
║  │  │                                                                 │ │ ║
║  │  │ [VIEW PHOTOS] [VIEW INVOICE] [DOWNLOAD RECEIPT] [CONTACT ALEX] │ │ ║
║  │  └────────────────────────────────────────────────────────────────┘ │ ║
║  │                                                                      │ ║
║  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │ ║
║  │                                                                      │ ║
║  │  📅 THURSDAY, OCT 30, 2025                                          │ ║
║  │                                                                      │ ║
║  │  ┌────────────────────────────────────────────────────────────────┐ │ ║
║  │  │ 🧹 CLEANING - Premium Clean                                    │ │ ║
║  │  │ Status: ✅ COMPLETED at 2:15 PM                                │ │ ║
║  │  ├────────────────────────────────────────────────────────────────┤ │ ║
║  │  │ Cleaner: Sarah Martinez                                        │ │ ║
║  │  │ Time: 12:00 PM - 2:15 PM (2h 15m)                              │ │ ║
║  │  │ Checklist: 27/27 tasks completed ✅                            │ │ ║
║  │  │                                                                 │ │ ║
║  │  │ 🚨 ISSUE REPORTED: Broken toilet handle (master bath)          │ ║
║  │  │    → Created maintenance job (completed today ↑)               │ │ ║
║  │  │                                                                 │ │ ║
║  │  │ 📸 Photos (12): Before (4) | During (3) | After (4) | Issue (1)│ │ ║
║  │  │ 💰 Cost: $220.00 (Included in monthly contract)                │ │ ║
║  │  │                                                                 │ │ ║
║  │  │ Your rating: ⭐⭐⭐⭐ (4/5)                                      │ │ ║
║  │  │ Your feedback: "Great job, but toilet issue delayed guests."   │ │ ║
║  │  │                                                                 │ │ ║
║  │  │ [VIEW PHOTOS] [VIEW CHECKLIST] [DOWNLOAD REPORT]               │ │ ║
║  │  └────────────────────────────────────────────────────────────────┘ │ ║
║  │                                                                      │ ║
║  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │ ║
║  │                                                                      │ ║
║  │  📅 SUNDAY, OCT 27, 2025                                            │ ║
║  │                                                                      │ ║
║  │  ┌────────────────────────────────────────────────────────────────┐ │ ║
║  │  │ 🧹 CLEANING - Premium Clean                                    │ │ ║
║  │  │ Status: ✅ COMPLETED at 10:45 AM                               │ │ ║
║  │  ├────────────────────────────────────────────────────────────────┤ │ ║
║  │  │ Cleaner: Sarah Martinez                                        │ │ ║
║  │  │ Time: 8:30 AM - 10:45 AM (2h 15m)                              │ │ ║
║  │  │ Checklist: 27/27 tasks completed ✅                            │ │ ║
║  │  │                                                                 │ │ ║
║  │  │ 📸 Photos (10): Before (3) | After (7)                         │ │ ║
║  │  │ 💰 Cost: $220.00                                               │ │ ║
║  │  │                                                                 │ │ ║
║  │  │ Your rating: ⭐⭐⭐⭐⭐ (5/5)                                    │ │ ║
║  │  │ Your feedback: "Perfect as always! Very thorough."             │ │ ║
║  │  │                                                                 │ │ ║
║  │  │ [VIEW PHOTOS] [VIEW CHECKLIST]                                 │ │ ║
║  │  └────────────────────────────────────────────────────────────────┘ │ ║
║  │                                                                      │ ║
║  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │ ║
║  │                                                                      │ ║
║  │  📅 FRIDAY, OCT 25, 2025                                            │ ║
║  │                                                                      │ ║
║  │  ┌────────────────────────────────────────────────────────────────┐ │ ║
║  │  │ 🔧 MAINTENANCE - HVAC Filter Replacement                       │ │ ║
║  │  │ Status: ✅ COMPLETED at 9:30 AM                                │ │ ║
║  │  ├────────────────────────────────────────────────────────────────┤ │ ║
║  │  │ Worker: Mike Davis (HVAC Specialist)                           │ │ ║
║  │  │ Service: Routine filter replacement + system check             │ │ ║
║  │  │ Time: 8:45 AM - 9:30 AM (45 min)                               │ │ ║
║  │  │                                                                 │ │ ║
║  │  │ Notes: "System running perfectly. Recommend seasonal tune-up   │ │ ║
║  │  │         before winter (November). I can send a quote."         │ │ ║
║  │  │                                                                 │ │ ║
║  │  │ 📸 Photos (3): Old filter | New filter | System check          │ │ ║
║  │  │ 💰 Cost: $120.00                                               │ │ ║
║  │  │                                                                 │ │ ║
║  │  │ Your rating: ⭐⭐⭐⭐⭐ (5/5)                                    │ │ ║
║  │  │                                                                 │ │ ║
║  │  │ [VIEW PHOTOS] [GET TUNE-UP QUOTE] [SCHEDULE]                   │ │ ║
║  │  └────────────────────────────────────────────────────────────────┘ │ ║
║  │                                                                      │ ║
║  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │ ║
║  │                                                                      │ ║
║  │  [LOAD OLDER HISTORY →] (48 more service records)                  │ ║
║  │                                                                      │ ║
║  └─────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
║  ┌─────────────────────────────────────────────────────────────────────┐ ║
║  │ 📊 SERVICE STATISTICS (Last 12 Months)                              │ ║
║  ├─────────────────────────────────────────────────────────────────────┤ ║
║  │  🧹 Cleanings: 52 total | Avg quality: 4.8/5 | On-time: 98%        │ ║
║  │  🔧 Maintenance: 8 jobs | Avg rating: 4.9/5 | Emergency: 2          │ ║
║  │  💰 Total Spend: $13,420 ($11,440 clean + $1,980 maint)             │ ║
║  │                                                                      │ ║
║  │  Most Common Issues:                                                 │ ║
║  │  • Plumbing (3 jobs): Leaks, toilet repairs                         │ ║
║  │  • HVAC (3 jobs): Filter changes, seasonal tune-ups                 │ ║
║  │  • General (2 jobs): Light fixtures, door handles                   │ ║
║  │                                                                      │ ║
║  │  💡 Recommendation: Consider preventive maintenance plan ($450/yr)  │ ║
║  │     to reduce emergency repairs.                                    │ ║
║  │                                                                      │ ║
║  │  [VIEW DETAILED ANALYTICS] [DOWNLOAD REPORT] [GET QUOTE]            │ ║
║  └─────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
║  ┌─────────────────────────────────────────────────────────────────────┐ ║
║  │ 🔧 EQUIPMENT TRACKING                                               │ ║
║  ├─────────────────────────────────────────────────────────────────────┤ ║
║  │  Water Heater: Rheem 50gal | Installed: 2019 | Last service: Today │ ║
║  │  HVAC System: Carrier 3-ton | Installed: 2020 | Last service: 6d ago│ ║
║  │  Appliances: All original (2015) | No recent service                │ ║
║  │                                                                      │ ║
║  │  ⚠️  Water heater is 6 years old - consider inspection annually    │ ║
║  │                                                                      │ ║
║  │  [ADD EQUIPMENT] [EDIT] [REQUEST INSPECTION]                        │ ║
║  └─────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
║  [SCHEDULE CLEANING] [REQUEST MAINTENANCE] [DOWNLOAD FULL HISTORY]       ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

**Key Features:**
- **Chronological Timeline**: Every service event in date order with full details
- **Photo Documentation**: Access all before/after photos and issue reports
- **Rating & Feedback**: Rate services and provide feedback directly
- **Equipment Tracking**: Track major systems and maintenance history
- **Service Statistics**: Year-over-year analytics and spending patterns
- **Proactive Recommendations**: AI suggests preventive maintenance based on equipment age

**Integration Points:**
- Cleaning Dashboard (cleaning records, photos, checklists)
- Maintenance Dashboard (maintenance jobs, worker notes, equipment data)
- Accounting system (invoices, payments)
- Photo storage (cloud-hosted images with thumbnails)

**Data Model Extensions:**
- Portal aggregates data from existing `cleaning_jobs` and `maintenance_jobs` tables
- `customer_ratings` table: job_id, rating, feedback, created_at
- `equipment_tracking` table: property_id, equipment_type, model, install_date, warranty_expiration

**Success Metrics:**
- History access rate: > 50% of customers view service history monthly
- Photo view rate: > 70% of jobs (customers appreciate transparency)
- Rating completion rate: > 60% of services rated
- Average rating: > 4.5/5 (indicates quality satisfaction)

---

## 3. Quote Approval Screen - Mobile-Optimized

```
╔═══════════════════════════════════════════════════════════════════════════╗
║ Quote Approval: HVAC Seasonal Tune-Up              [← Back to Dashboard] ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  ┌─────────────────────────────────────────────────────────────────────┐ ║
║  │ 💰 QUOTE #MNT-2025-1047                         Sent: Oct 31, 2025  │ ║
║  ├─────────────────────────────────────────────────────────────────────┤ ║
║  │  Property: Bear Cabin - 123 Bear Trail, Gatlinburg, TN              │ ║
║  │  Service: HVAC Seasonal Tune-Up                                     │ ║
║  │  Valid Until: November 30, 2025 (30 days)                           │ ║
║  └─────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
║  ┌─────────────────────────────────────────────────────────────────────┐ ║
║  │ 📋 SERVICE DESCRIPTION                                              │ ║
║  ├─────────────────────────────────────────────────────────────────────┤ ║
║  │                                                                      │ ║
║  │  Seasonal HVAC tune-up includes complete system inspection,         │ ║
║  │  cleaning, and optimization. Recommended twice per year (spring     │ ║
║  │  and fall) to maintain efficiency and prevent breakdowns.           │ ║
║  │                                                                      │ ║
║  │  This service includes:                                             │ ║
║  │  • Full system diagnostic                                           │ ║
║  │  • Cleaning of all accessible components                            │ ║
║  │  • Performance optimization                                         │ ║
║  │  • 30-day warranty on service                                       │ ║
║  │                                                                      │ ║
║  └─────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
║  ┌─────────────────────────────────────────────────────────────────────┐ ║
║  │ 💵 PRICING BREAKDOWN                                                │ ║
║  ├─────────────────────────────────────────────────────────────────────┤ ║
║  │                                                                      │ ║
║  │  HVAC System Inspection ............................ $85.00          │ ║
║  │  Clean condenser coils ............................. $45.00          │ ║
║  │  Replace air filter ................................ $25.00          │ ║
║  │  Check refrigerant levels .......................... $25.00          │ ║
║  │  Test thermostat ................................... included         │ ║
║  │                                                                      │ ║
║  │  ─────────────────────────────────────────────────────────           │ ║
║  │  Subtotal: ......................................... $180.00         │ ║
║  │  Tax (9.5%): ....................................... $17.10          │ ║
║  │  ══════════════════════════════════════════════════════             │ ║
║  │  TOTAL: ............................................ $197.10         │ ║
║  │                                                                      │ ║
║  │  Estimated Time: 1.5 hours                                          │ ║
║  │                                                                      │ ║
║  └─────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
║  ┌─────────────────────────────────────────────────────────────────────┐ ║
║  │ 👨‍🔧 TECHNICIAN INFO                                                  │ ║
║  ├─────────────────────────────────────────────────────────────────────┤ ║
║  │  Assigned: Mike Davis (HVAC Specialist)                             │ ║
║  │  Credentials: EPA 608 Universal Certified, TN Licensed              │ ║
║  │  Performance: 4.9/5 rating | 127 jobs completed                     │ ║
║  │  Availability: Can schedule within 3-5 business days                │ ║
║  └─────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
║  ┌─────────────────────────────────────────────────────────────────────┐ ║
║  │ 📅 SUGGESTED SCHEDULE                                               │ ║
║  ├─────────────────────────────────────────────────────────────────────┤ ║
║  │                                                                      │ ║
║  │  ⦿ Monday, Nov 3 - 2:00 PM (3 days from now)                        │ ║
║  │  ○ Tuesday, Nov 4 - 10:00 AM                                        │ ║
║  │  ○ Wednesday, Nov 5 - 9:00 AM                                       │ ║
║  │  ○ Thursday, Nov 6 - 1:00 PM                                        │ ║
║  │  ○ Let Alex suggest a time                                          │ ║
║  │                                                                      │ ║
║  │  Note: We'll coordinate with your guest schedule to avoid conflicts │ ║
║  │                                                                      │ ║
║  └─────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
║  ┌─────────────────────────────────────────────────────────────────────┐ ║
║  │ 💳 PAYMENT                                                          │ ║
║  ├─────────────────────────────────────────────────────────────────────┤ ║
║  │  Payment Method: Visa ending in 4242 ✅ (On file)                  │ ║
║  │  Billing: Charge on completion                                      │ ║
║  │  Invoice: Sent via email within 24 hours                            │ ║
║  │                                                                      │ ║
║  │  [CHANGE PAYMENT METHOD] [UPDATE BILLING INFO]                      │ ║
║  └─────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
║  ┌─────────────────────────────────────────────────────────────────────┐ ║
║  │ 📝 QUESTIONS OR CONCERNS?                                           │ ║
║  ├─────────────────────────────────────────────────────────────────────┤ ║
║  │  Have questions about this quote? Alex is here to help!             │ ║
║  │                                                                      │ ║
║  │  📞 Call: (865) 555-0100                                            │ ║
║  │  ✉️ Email: alex@rightfit.com                                        │ ║
║  │  💬 Chat: [Start Live Chat]                                         │ ║
║  │                                                                      │ ║
║  │  [ASK A QUESTION] [REQUEST MODIFICATION]                            │ ║
║  └─────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
║  ┌─────────────────────────────────────────────────────────────────────┐ ║
║  │                                                                      │ ║
║  │               🟢 MOBILE-OPTIMIZED ACTION BUTTONS                    │ ║
║  │                                                                      │ ║
║  │   ┌───────────────────────────────────────────────────────────┐    │ ║
║  │   │                                                            │    │ ║
║  │   │           ✅  APPROVE & SCHEDULE ($197.10)                │    │ ║
║  │   │                                                            │    │ ║
║  │   │         Tap to approve quote and book appointment          │    │ ║
║  │   │                                                            │    │ ║
║  │   └───────────────────────────────────────────────────────────┘    │ ║
║  │                                                                      │ ║
║  │   ┌───────────────────────────────────────────────────────────┐    │ ║
║  │   │                                                            │    │ ║
║  │   │              💬  ASK A QUESTION FIRST                      │    │ ║
║  │   │                                                            │    │ ║
║  │   └───────────────────────────────────────────────────────────┘    │ ║
║  │                                                                      │ ║
║  │   ┌───────────────────────────────────────────────────────────┐    │ ║
║  │   │                                                            │    │ ║
║  │   │              ❌  DECLINE QUOTE                             │    │ ║
║  │   │                                                            │    │ ║
║  │   └───────────────────────────────────────────────────────────┘    │ ║
║  │                                                                      │ ║
║  │   Large buttons optimized for mobile (thumb-friendly!)              │ ║
║  │                                                                      │ ║
║  └─────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
║  [DOWNLOAD PDF] [SHARE QUOTE] [SAVE FOR LATER]                          ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

**Key Features:**
- **Large Touch-Friendly Buttons**: Optimized for mobile approval (60%+ of quote views are mobile)
- **Transparent Pricing**: Line-by-line breakdown with no hidden fees
- **Suggested Schedule**: Pre-select available time slots (reduces back-and-forth)
- **One-Tap Approval**: Approve + schedule + payment authorization in single action
- **Easy Communication**: Quick access to call, email, or chat with Alex
- **PDF Export**: Download quote for records or budget approval

**Integration Points:**
- Maintenance Dashboard (quote status updates, scheduling)
- Payment gateway (Stripe/Square for payment authorization)
- SMS/Email notifications (approval confirmations)
- Calendar sync (add scheduled appointment to customer's calendar)

**Data Model Extensions:**
- Uses existing `quotes` table with approval workflow
- `quote_views` table: quote_id, viewed_at, device_type, ip_address (track engagement)
- `quote_communications` table: quote_id, message, sender, timestamp (question thread)

**Success Metrics:**
- Quote approval rate: > 70% (vs. 50% industry average)
- Time to decision: < 24 hours average (mobile optimization speeds decisions)
- Question rate: < 20% (clear pricing reduces confusion)
- Mobile usage: Track % of approvals from mobile devices

---

## 4. Cleaning-Only Customer View - Upsell Messaging

```
╔═══════════════════════════════════════════════════════════════════════════╗
║ River's Edge Getaway Portal                    [Susan Lee] [⚙️] [🔔 2]  ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  Welcome back, Susan! Here's what's happening with your properties.      ║
║                                                                           ║
║  ┌─────────────────────────────────────────────────────────────────────┐ ║
║  │ 🚨 NEEDS YOUR ATTENTION (1)                                          │ ║
║  ├─────────────────────────────────────────────────────────────────────┤ ║
║  │  🧹 CLEANING SCHEDULED - River Lodge                                │ ║
║  │     Tomorrow 10:00 AM | Cleaner: Sarah M. | $220                    │ ║
║  │     [VIEW DETAILS] [RESCHEDULE] [CONTACT]                           │ ║
║  └─────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
║  ┌──────────────────────┬────────────────────────┬────────────────────┐  ║
║  │ YOUR PROPERTIES (2)  │ ACTIVE SERVICES        │ THIS MONTH         │  ║
║  ├──────────────────────┼────────────────────────┼────────────────────┤  ║
║  │                      │                        │                    │  ║
║  │  ✅ All Ready: 2     │  🧹 Cleaning: Active  │  Cleaning: $440    │  ║
║  │  📅 Next Clean: 14h  │     16 cleans YTD     │  Maintenance: $0   │  ║
║  │                      │                        │                    │  ║
║  │  [VIEW ALL →]       │  🔧 Maintenance: ❌   │  [VIEW INVOICE →] │  ║
║  │                      │     Not subscribed     │                    │  ║
║  │                      │                        │                    │  ║
║  │                      │  💡 [LEARN MORE →]    │  [PAY NOW]         │  ║
║  └──────────────────────┴────────────────────────┴────────────────────┘  ║
║                                                                           ║
║  ┌─────────────────────────────────────────────────────────────────────┐ ║
║  │ 💡 EXCLUSIVE OFFER FOR YOU!                                         │ ║
║  ├─────────────────────────────────────────────────────────────────────┤ ║
║  │                                                                      │ ║
║  │  🔧 ADD MAINTENANCE SERVICE - LIMITED TIME OFFER                    │ ║
║  │                                                                      │ ║
║  │  As a valued cleaning customer, you're eligible for:                │ ║
║  │                                                                      │ ║
║  │  ✅ 20% OFF your first maintenance job                              │ ║
║  │  ✅ Priority emergency response (2-hour guarantee)                  │ ║
║  │  ✅ Bundled billing (one invoice for all services)                  │ ║
║  │  ✅ Same trusted team you already work with                         │ ║
║  │                                                                      │ ║
║  │  WHY YOU NEED THIS:                                                  │ ║
║  │  • Your cleaners reported 1 maintenance issue in the last 30 days   │ ║
║  │  • Average lodge owner spends $2,400/year on repairs                │ ║
║  │  • Emergency contractors charge 2-3x our regular rates               │ ║
║  │  • We already know your properties (faster, better service)         │ ║
║  │                                                                      │ ║
║  │  WHAT'S INCLUDED:                                                    │ ║
║  │  🔧 Basic Plan ($99/mo per property):                               │ ║
║  │     • Emergency response (plumbing, electrical, HVAC)               │ ║
║  │     • Routine maintenance (filters, batteries, minor repairs)       │ ║
║  │     • Discounted rates (20% off all labor)                          │ ║
║  │     • Guest-impacting issues prioritized                            │ ║
║  │                                                                      │ ║
║  │  ⭐ Premium Plan ($199/mo per property):                            │ ║
║  │     • Everything in Basic, plus:                                    │ ║
║  │     • Preventive maintenance (seasonal inspections)                 │ ║
║  │     • Priority scheduling (next-day service guarantee)              │ ║
║  │     • Discounted parts (10% off all materials)                      │ ║
║  │     • Quarterly property health reports                             │ ║
║  │                                                                      │ ║
║  │  💬 "I wish I'd signed up sooner! Saved me $800 on emergency       │ ║
║  │      plumbing last month." - Jane S., Mountain Lodge Rentals        │ ║
║  │                                                                      │ ║
║  │  ┌────────────────────────────────────────────────────────────────┐ │ ║
║  │  │                                                                 │ │ ║
║  │  │            📞  CALL ALEX TO LEARN MORE                          │ │ ║
║  │  │               (865) 555-0100                                    │ │ ║
║  │  │                                                                 │ │ ║
║  │  └────────────────────────────────────────────────────────────────┘ │ ║
║  │                                                                      │ ║
║  │  ┌────────────────────────────────────────────────────────────────┐ │ ║
║  │  │                                                                 │ │ ║
║  │  │         💰  GET CUSTOM QUOTE (2 Properties)                     │ │ ║
║  │  │                                                                 │ │ ║
║  │  └────────────────────────────────────────────────────────────────┘ │ ║
║  │                                                                      │ ║
║  │  [NO THANKS, HIDE THIS] [REMIND ME NEXT MONTH]                      │ ║
║  │                                                                      │ ║
║  └─────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
║  ┌─────────────────────────────────────────────────────────────────────┐ ║
║  │ 🏠 YOUR PROPERTIES - QUICK STATUS                                   │ ║
║  ├─────────────────────────────────────────────────────────────────────┤ ║
║  │                                                                      │ ║
║  │  ┌─────────────────────────────┐  ┌─────────────────────────────┐  │ ║
║  │  │ 🏠 River Lodge              │  │ 🏠 Creek Cabin              │  │ ║
║  │  │ 3BR | 2BA                   │  │ 2BR | 1.5BA                 │  │ ║
║  │  ├─────────────────────────────┤  ├─────────────────────────────┤  │ ║
║  │  │ Status: ✅ Ready            │  │ Status: ✅ Ready            │  │ ║
║  │  │                             │  │                             │  │ ║
║  │  │ Last clean: Yesterday       │  │ Last clean: 2 days ago      │  │ ║
║  │  │ Quality: ⭐⭐⭐⭐⭐          │  │ Quality: ⭐⭐⭐⭐            │  │ ║
║  │  │                             │  │                             │  │ ║
║  │  │ ⚠️  Deck railing loose      │  │ Next: Clean tomorrow 10AM   │  │ ║
║  │  │    (Reported by cleaner)    │  │                             │  │ ║
║  │  │    💡 [GET REPAIR QUOTE →] │  │ [VIEW DETAILS]              │  │ ║
║  │  │                             │  │                             │  │ ║
║  │  │ [VIEW DETAILS]              │  │                             │  │ ║
║  │  └─────────────────────────────┘  └─────────────────────────────┘  │ ║
║  │                                                                      │ ║
║  └─────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
║  ┌─────────────────────────────────────────────────────────────────────┐ ║
║  │ 📅 UPCOMING SERVICES (Next 7 Days)                                  │ ║
║  ├─────────────────────────────────────────────────────────────────────┤ ║
║  │  Tomorrow 10:00 AM - Creek Cabin - Cleaning ($220)                  │ ║
║  │  Sunday 9:00 AM - River Lodge - Cleaning ($220)                     │ ║
║  │                                                                      │ ║
║  │  [VIEW FULL CALENDAR] [SCHEDULE CLEANING]                           │ ║
║  └─────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

**Key Features:**
- **Contextual Upsell Messaging**: Maintenance service promotion prominently displayed
- **Social Proof**: Testimonials from other customers who added maintenance
- **Clear Value Proposition**: Explain benefits (20% off, priority service, bundled billing)
- **Urgency Indicators**: Show recent maintenance issues reported by cleaners
- **Easy Action**: One-click quote request or call to discuss
- **Non-Intrusive**: "Hide this" and "Remind me later" options (customer control)

**Integration Points:**
- Cleaning Dashboard (cleaning schedules, issue reports)
- Maintenance Dashboard (quote generation for upsell conversions)
- CRM system (track upsell engagement, conversion rates)

**Data Model Extensions:**
- `upsell_campaigns` table: customer_id, campaign_type, shown_at, action_taken, converted
- `customer_segments` table: cleaning_only, cleaning_and_maintenance, maintenance_only

**Success Metrics:**
- Upsell conversion rate: > 25% of cleaning-only customers within 6 months
- Quote request rate: > 15% click "Get Quote" button
- Dismissal rate: < 50% (if too high, messaging is too aggressive)
- Customer satisfaction: Ensure upsell messaging doesn't hurt overall experience (>4.5/5 rating)

---

## 5. Service History & Invoices - Financial Tracking

```
╔═══════════════════════════════════════════════════════════════════════════╗
║ Invoices & Service History                         [← Back to Dashboard] ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  ┌─────────────────────────────────────────────────────────────────────┐ ║
║  │ 💰 BILLING OVERVIEW                                                 │ ║
║  ├─────────────────────────────────────────────────────────────────────┤ ║
║  │  Account: Mountain Lodge Rentals (8 properties)                     │ ║
║  │  Payment Method: Visa ending in 4242 ✅ [Change]                   │ ║
║  │  Auto-Pay: Enabled (bills paid automatically on due date)           │ ║
║  │                                                                      │ ║
║  │  ┌──────────────────┬──────────────────┬──────────────────────────┐ │ ║
║  │  │ CURRENT BALANCE  │ THIS MONTH       │ YEAR TO DATE            │ │ ║
║  │  ├──────────────────┼──────────────────┼──────────────────────────┤ │ ║
║  │  │                  │                  │                          │ │ ║
║  │  │  $306.60         │  Cleaning: $1,760│  Cleaning: $11,440      │ │ ║
║  │  │  Due: Nov 5      │  Maint: $612     │  Maintenance: $1,980    │ │ ║
║  │  │                  │  Total: $2,372   │  Total: $13,420         │ │ ║
║  │  │  [PAY NOW]       │                  │                          │ │ ║
║  │  │                  │  [VIEW DETAILS]  │  [EXPORT REPORT]         │ │ ║
║  │  └──────────────────┴──────────────────┴──────────────────────────┘ │ ║
║  │                                                                      │ ║
║  └─────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
║  ┌─────────────────────────────────────────────────────────────────────┐ ║
║  │ 📊 FILTERS & SEARCH                                                 │ ║
║  ├─────────────────────────────────────────────────────────────────────┤ ║
║  │  [🔍 Search invoices...]  [All Properties ▼]  [Last 3 Months ▼]    │ ║
║  │  [All Services ▼]  [All Statuses ▼]  [Export CSV]  [Print]         │ ║
║  └─────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
║  ┌─────────────────────────────────────────────────────────────────────┐ ║
║  │ 📄 INVOICES & SERVICE RECORDS                                       │ ║
║  ├─────────────────────────────────────────────────────────────────────┤ ║
║  │                                                                      │ ║
║  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │ ║
║  │                                                                      │ ║
║  │  📅 OCTOBER 2025                                Total: $2,372.00    │ ║
║  │                                                                      │ ║
║  │  ┌────────────────────────────────────────────────────────────────┐ │ ║
║  │  │ 🔧 Invoice #MNT-2025-1089 - PAID ✅                            │ │ ║
║  │  │ Date: Oct 31, 2025 | Paid: Oct 31, 2025 (Auto-pay)            │ │ ║
║  │  ├────────────────────────────────────────────────────────────────┤ │ ║
║  │  │ Property: Bear Cabin                                           │ │ ║
║  │  │ Service: Emergency Water Heater Repair                         │ │ ║
║  │  │ Worker: Jim Rodriguez (Plumber)                                │ │ ║
║  │  │                                                                 │ │ ║
║  │  │ Line Items:                                                     │ │ ║
║  │  │ • Emergency call-out fee ..................... $75.00          │ │ ║
║  │  │ • Labor (1 hour @ $85/hr, 2x emergency) ...... $170.00         │ │ ║
║  │  │ • Thermocouple part ....................... $35.00             │ │ ║
║  │  │ • Tax (9.5%) .............................. $26.60              │ │ ║
║  │  │                                                                 │ │ ║
║  │  │ TOTAL: $306.60                                                 │ │ ║
║  │  │                                                                 │ │ ║
║  │  │ Payment: Visa 4242 (Auto-billed per emergency contract)        │ │ ║
║  │  │                                                                 │ │ ║
║  │  │ [VIEW DETAILS] [DOWNLOAD PDF] [VIEW PHOTOS] [EMAIL RECEIPT]    │ │ ║
║  │  └────────────────────────────────────────────────────────────────┘ │ ║
║  │                                                                      │ ║
║  │  ┌────────────────────────────────────────────────────────────────┐ │ ║
║  │  │ 🧹 Invoice #CLN-2025-0847 - PAID ✅                            │ │ ║
║  │  │ Date: Oct 31, 2025 | Paid: Oct 31, 2025 (Monthly contract)    │ │ ║
║  │  ├────────────────────────────────────────────────────────────────┤ │ ║
║  │  │ October Cleaning Services - All Properties                     │ │ ║
║  │  │                                                                 │ │ ║
║  │  │ • Bear Cabin (3 cleans @ $220) ............... $660.00         │ │ ║
║  │  │ • Pine Lodge (3 cleans @ $220) ............... $660.00         │ │ ║
║  │  │ • Elk View Lodge (2 cleans @ $180) ........... $360.00         │ │ ║
║  │  │ • Deer Cabin (2 cleans @ $160) ............... $320.00         │ │ ║
║  │  │ • Sunset Retreat (2 cleans @ $200) ........... $400.00         │ │ ║
║  │  │ • Mountain View (1 clean @ $280) ............. $280.00         │ ║
║  │  │ • Ridge View (1 clean @ $200) ................ $200.00         │ │ ║
║  │  │ • Creek Lodge (1 clean @ $220) ............... $220.00         │ │ ║
║  │  │                                                                 │ │ ║
║  │  │ Subtotal: $3,100.00                                            │ │ ║
║  │  │ Monthly contract discount (15%): -$465.00                      │ │ ║
║  │  │ Tax (9.5%): $250.33                                            │ │ ║
║  │  │                                                                 │ │ ║
║  │  │ TOTAL: $2,885.33                                               │ │ ║
║  │  │                                                                 │ │ ║
║  │  │ Payment: Visa 4242 (Monthly contract - auto-pay)               │ │ ║
║  │  │                                                                 │ │ ║
║  │  │ [VIEW DETAILS] [DOWNLOAD PDF] [VIEW ALL CLEANS] [RECEIPT]      │ │ ║
║  │  └────────────────────────────────────────────────────────────────┘ │ ║
║  │                                                                      │ ║
║  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │ ║
║  │                                                                      │ ║
║  │  📅 SEPTEMBER 2025                              Total: $2,145.33    │ ║
║  │                                                                      │ ║
║  │  ┌────────────────────────────────────────────────────────────────┐ │ ║
║  │  │ 🧹 Invoice #CLN-2025-0782 - PAID ✅                            │ │ ║
║  │  │ Date: Sep 30, 2025 | Paid: Oct 1, 2025 (Auto-pay)             │ │ ║
║  │  ├────────────────────────────────────────────────────────────────┤ │ ║
║  │  │ September Cleaning Services - All Properties                   │ │ ║
║  │  │ 14 total cleans across 8 properties                            │ │ ║
║  │  │                                                                 │ │ ║
║  │  │ TOTAL: $2,145.33                                               │ │ ║
║  │  │ Payment: Visa 4242 (Monthly contract - auto-pay)               │ │ ║
║  │  │                                                                 │ │ ║
║  │  │ [VIEW DETAILS] [DOWNLOAD PDF] [VIEW ALL CLEANS]                │ │ ║
║  │  └────────────────────────────────────────────────────────────────┘ │ ║
║  │                                                                      │ ║
║  │  ┌────────────────────────────────────────────────────────────────┐ │ ║
║  │  │ 🔧 Invoice #MNT-2025-0892 - PAID ✅                            │ │ ║
║  │  │ Date: Sep 20, 2025 | Paid: Sep 20, 2025                       │ │ ║
║  │  ├────────────────────────────────────────────────────────────────┤ │ ║
║  │  │ Property: Pine Lodge                                           │ │ ║
║  │  │ Service: Deck Staining (2-day project)                         │ │ ║
║  │  │ Worker: David Johnson (Painter)                                │ │ ║
║  │  │                                                                 │ │ ║
║  │  │ TOTAL: $1,200.00                                               │ │ ║
║  │  │ Payment: Visa 4242                                             │ │ ║
║  │  │                                                                 │ │ ║
║  │  │ [VIEW DETAILS] [DOWNLOAD PDF] [VIEW PHOTOS]                    │ │ ║
║  │  └────────────────────────────────────────────────────────────────┘ │ ║
║  │                                                                      │ ║
║  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │ ║
║  │                                                                      │ ║
║  │  📅 AUGUST 2025                                 Total: $2,018.50    │ ║
║  │                                                                      │ ║
║  │  [EXPAND TO VIEW 3 INVOICES →]                                     │ ║
║  │                                                                      │ ║
║  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │ ║
║  │                                                                      │ ║
║  │  [LOAD OLDER INVOICES →] (48 more invoices in 2025)                │ ║
║  │                                                                      │ ║
║  └─────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
║  ┌─────────────────────────────────────────────────────────────────────┐ ║
║  │ 📊 SPENDING ANALYSIS                            [View Full Report]  │ ║
║  ├─────────────────────────────────────────────────────────────────────┤ ║
║  │                                                                      │ ║
║  │  YEAR TO DATE (Jan - Oct 2025)                                      │ ║
║  │                                                                      │ ║
║  │  🧹 Cleaning: $11,440.00 (85% of total)                             │ ║
║  │     64 cleans | $178.75 average per clean                           │ ║
║  │     Most active property: Bear Cabin (8 cleans)                     │ ║
║  │                                                                      │ ║
║  │  🔧 Maintenance: $1,980.00 (15% of total)                           │ ║
║  │     12 jobs | $165 average per job                                  │ ║
║  │     Emergency: 2 jobs ($486 total)                                  │ ║
║  │     Routine: 10 jobs ($1,494 total)                                 │ ║
║  │                                                                      │ ║
║  │  💰 TOTAL: $13,420.00                                               │ ║
║  │                                                                      │ ║
║  │  📈 vs. Last Year: +12% (+$1,440)                                   │ ║
║  │     Cleaning: +8% (more frequent cleans)                            │ ║
║  │     Maintenance: +35% (new service added in March)                  │ ║
║  │                                                                      │ ║
║  │  💡 INSIGHTS:                                                        │ ║
║  │  • Peak spending: July-August (summer rental season)                │ ║
║  │  • Avg cost per property per month: $167.75                         │ ║
║  │  • Emergency repairs: Only 2 (preventive maintenance working!)      │ ║
║  │  • You saved $2,150 this year vs. using external contractors        │ ║
║  │                                                                      │ ║
║  │  [DOWNLOAD TAX REPORT] [EXPORT TO EXCEL] [SCHEDULE BUDGET REVIEW]   │ ║
║  └─────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

**Key Features:**
- **Chronological Invoice List**: All invoices in date order with expand/collapse
- **Detailed Line Items**: Complete breakdown of every charge (transparency)
- **Payment Status Indicators**: Clear visual cues (paid, pending, overdue)
- **Auto-Pay Confirmation**: Show which invoices were auto-paid (peace of mind)
- **Spending Analytics**: Year-over-year comparisons, category breakdowns
- **Tax Reports**: Export-ready reports for accounting and tax purposes
- **One-Click Actions**: Download PDF, email receipt, view service details

**Integration Points:**
- Accounting system (Stripe/Square for payment processing)
- Cleaning/Maintenance Dashboards (link invoices to service records)
- Tax reporting tools (export in formats compatible with QuickBooks, etc.)

**Data Model Extensions:**
- Uses existing `invoices` table from cleaning/maintenance systems
- `payment_transactions` table: invoice_id, amount, payment_method, transaction_id, status
- `spending_analytics` table: customer_id, period, category, amount (cached for performance)

**Success Metrics:**
- Invoice viewing rate: > 40% of customers view invoices monthly
- Auto-pay enrollment: > 80% of customers (reduces billing friction)
- Payment speed: < 3 days average for non-auto-pay invoices
- Dispute rate: < 2% (transparent pricing reduces confusion)

---

## Data Model Summary

### Customer Portal Data Sources:

**Primary Tables (reads from existing systems):**
- `cleaning_jobs` - Cleaning schedules and history
- `maintenance_jobs` - Maintenance jobs and quotes
- `quotes` - Quote approvals and status
- `invoices` - Billing and payment records
- `customer_properties` - Property details and access codes
- `job_photos` - Photo documentation

**New Portal-Specific Tables:**

1. **customer_portal_users**
   - id, customer_id, email, password_hash, last_login
   - notification_preferences (JSON), theme_preference
   - created_at, updated_at

2. **customer_preferences**
   - id, customer_id, auto_pay_enabled, default_payment_method_id
   - notification_email, notification_sms, notification_push
   - calendar_sync_enabled, calendar_provider

3. **customer_ratings**
   - id, job_id, job_type (cleaning/maintenance), rating (1-5)
   - feedback, created_at

4. **upsell_campaigns**
   - id, customer_id, campaign_type, shown_at, action_taken
   - converted (boolean), conversion_date

5. **quote_views**
   - id, quote_id, viewed_at, device_type, ip_address
   - time_spent_seconds

6. **portal_activity_log**
   - id, customer_id, action_type, resource_id, timestamp
   - (Track engagement: logins, quote views, invoice downloads)

---

## Technical Architecture Notes

### Authentication & Security:
- **OAuth 2.0**: Secure login with optional SSO (Google, Apple)
- **2FA Option**: SMS or authenticator app for high-security customers
- **Role-Based Access**: Multi-user accounts (property manager + assistant manager)
- **Session Management**: Auto-logout after 30 min inactivity

### Mobile-First Design:
- **Responsive Layout**: Works seamlessly on phone, tablet, desktop
- **Touch-Optimized**: Large buttons (minimum 44x44 pixels for touch targets)
- **Fast Loading**: Lazy load images, paginated history (< 2 seconds page load)
- **PWA Support**: Install as app on mobile home screen

### Real-Time Updates:
- **WebSocket Connection**: Live job status updates (cleaner en route, job completed)
- **Push Notifications**: Browser push + SMS for urgent updates (quotes, emergencies)
- **Calendar Sync**: Two-way sync with Google/Apple/Outlook calendars

### Payment Integration:
- **Stripe/Square**: Tokenized payments (PCI compliance)
- **Auto-Pay**: Recurring billing with retry logic for failed payments
- **Multiple Payment Methods**: Credit card, ACH, invoice (for large customers)

---

## Implementation Priority - Phase 1

**Week 1-2: Core Portal & Authentication**
1. User login and authentication
2. Dashboard homepage with property overview
3. Service history list (basic view)
4. Invoice list with payment status

**Week 3-4: Quote Approval & Actions**
5. Quote approval workflow (mobile-optimized)
6. Property details view with timeline
7. Photo gallery integration
8. Rating and feedback system

**Week 5-6: Advanced Features**
9. Spending analytics and reports
10. Upsell messaging for cleaning-only customers
11. Calendar sync (Google/iCal)
12. Push notifications

---

## Design Principles

1. **Self-Service First**: Customers should be able to complete 80%+ of actions without calling
2. **Mobile-Optimized**: 60% of traffic is mobile - design for thumbs, not mouse
3. **Transparency**: Full visibility into pricing, schedules, and service history
4. **Speed**: Every page loads in < 2 seconds (critical for mobile)
5. **Trust**: Photo documentation, real-time updates, and clear communication build confidence
6. **Proactive**: Surface recommendations before customers ask (preventive maintenance, upsells)

---

## Success Metrics

### Portal Adoption:
- User registration: > 80% of customers create portal account
- Active usage: > 70% log in at least weekly
- Mobile usage: > 60% of logins from mobile devices

### Self-Service Efficiency:
- Quote approval speed: < 24 hours average (vs. 3 days via email)
- Self-service rate: > 80% of actions completed without calling Alex
- Customer support calls: Reduce by 40% after portal launch

### Business Impact:
- Upsell conversion: > 25% of cleaning-only customers add maintenance within 6 months
- Auto-pay enrollment: > 80% of customers (reduces billing friction)
- Customer satisfaction: > 4.5/5 with portal experience
- Customer retention: > 90% annually (portal increases stickiness)

---

**Version:** 1.0
**Last Updated:** October 31, 2025
**Owner:** Jane (Lodge Manager) & Susan (Customer)
