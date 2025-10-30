# Product Owner Decision: Pre-Sprint 6 Feature Implementation

**Date**: October 29, 2025
**Decision**: APPROVED - Implement 2 Critical Features Before Sprint 6
**Impact**: +1 week to launch timeline

---

## Executive Summary

After reviewing the [FEATURE_PROPOSAL_PRE_PRODUCTION.md](docs/FEATURE_PROPOSAL_PRE_PRODUCTION.md) document, I've approved **2 critical features** to be implemented before Sprint 6 (Payment Processing).

**Rationale**: Given your timeline flexibility (no marketing plans arranged), addressing these fundamental platform gaps now will result in a stronger MVP and better beta feedback.

---

## Approved Features

### Feature 6: Tenant Management System
**Effort**: 15 hours
**Priority**: CRITICAL

**Why Critical**: A property management platform without tenant tracking is incomplete. Landlords need to:
- Know who lives in each property
- Track tenancy dates (move-in, move-out, lease expiry)
- Record rent amounts and payment schedules
- Link work orders to specific tenants
- Receive alerts when leases are expiring

**Without this, RightFit is essentially a work order tracker, not a property management platform.**

---

### Feature 5: Financial Dashboard
**Effort**: 15 hours
**Priority**: HIGH IMPACT

**Why Critical**: UK landlords have legal obligations for tax returns. They need:
- Income/expense tracking
- Profit & loss per property
- CSV export for accountants
- Budget management with alerts

**Without this, landlords must maintain separate spreadsheets, reducing RightFit's value proposition.**

---

## Timeline Impact

### Previous Timeline (Sprint 6 Only)
- Sprint 6: 3 weeks (Nov 4-22)
- Launch: November 22, 2025

### New Timeline (With Pre-Production Features)
- **Week 1** (Nov 4-8): Financial + Tenant Features - 30 hours
- **Week 2** (Nov 11-15): Payment Processing - 50 hours
- **Week 3** (Nov 18-22): Production Infrastructure - 36 hours
- **Week 4** (Nov 25-Dec 6): Launch Preparation - 28 hours
- **Launch**: Early December 2025

**Impact**: +2 weeks to launch, but with significantly stronger MVP

---

## What Was Deferred

I've deferred these features to **Phase 2 (Post-Launch)**:

1. **Tenant Portal** (20h) - Nice to have, validate demand first
2. **Work Order Templates** (8h) - Efficiency feature, not blocking
3. **Emergency Contacts** (5h) - Important but not launch-critical

All Phase 2 and Phase 3 features (enterprise features, letting agent tools) were rejected for MVP.

**Reasoning**: Launch with strong core functionality, iterate based on real user feedback.

---

## Deliverables Created

### 1. [PRE_SPRINT_6_FEATURES.md](docs/stories/PRE_SPRINT_6_FEATURES.md)
Detailed implementation plan for Week 1:
- 9 user stories with acceptance criteria
- Complete database schemas (Prisma)
- API endpoint specifications
- Web + Mobile UI designs
- WatermelonDB offline sync
- Testing checklists
- Day-by-day implementation plan

### 2. [REVISED_SPRINT_6_PLAN.md](docs/stories/REVISED_SPRINT_6_PLAN.md)
Complete 4-week execution plan:
- 26 user stories (144 hours total)
- Week-by-week breakdown
- Technical implementation details
- Risk management plan
- Go/No-Go decision criteria
- Post-launch plan

---

## Technical Highlights

### New Database Models

```prisma
// Financial tracking
model FinancialTransaction {
  id          String          @id @default(uuid())
  tenantId    String
  propertyId  String
  type        TransactionType // INCOME | EXPENSE
  category    ExpenseCategory?
  amount      Float
  date        DateTime
  description String
  receiptUrl  String?         // S3 URL
}

// Tenant management
model PropertyTenant {
  id              String        @id @default(uuid())
  tenantId        String        // Your organization
  propertyId      String
  name            String
  email           String?
  phone           String?
  moveInDate      DateTime
  leaseExpiryDate DateTime?
  rentAmount      Float
  rentFrequency   RentFrequency // WEEKLY | MONTHLY | QUARTERLY
  status          TenantStatus  // ACTIVE | INACTIVE | NOTICE_GIVEN
}

// Rent payment tracking
model RentPayment {
  id               String   @id @default(uuid())
  propertyTenantId String
  amount           Float
  paymentDate      DateTime
  expectedDate     DateTime?
  method           PaymentMethod?
}

// Budget management
model PropertyBudget {
  id            String  @id @default(uuid())
  propertyId    String  @unique
  monthlyBudget Float
  alertThreshold Float  @default(0.8)
}
```

### New API Endpoints (15 total)

**Financial APIs:**
- `POST /api/financial/transactions` - Record income/expense
- `GET /api/financial/transactions` - List transactions
- `GET /api/financial/reports/property/:id` - P&L report
- `GET /api/financial/export` - CSV export
- `POST /api/financial/budgets` - Set budget

**Tenant APIs:**
- `POST /api/tenants` - Create tenant
- `GET /api/tenants` - List tenants
- `PATCH /api/tenants/:id` - Update tenant
- `DELETE /api/tenants/:id` - Remove tenant
- `POST /api/tenants/:id/payments` - Record rent payment
- `GET /api/tenants/overdue-rent` - Get overdue list
- `GET /api/tenants/expiring` - Get expiring leases

### New Features

**Financial Dashboard:**
- Income/expense tracking with receipts
- P&L reports with charts
- Budget management with alerts
- CSV export for accountants

**Tenant Management:**
- Full CRUD for tenants
- Lease expiry alerts (60/30/0 days)
- Rent payment tracking
- Overdue rent alerts
- Work order association

**Mobile Support:**
- New "Finances" tab
- New "Tenants" tab
- Offline-first with WatermelonDB
- Push notifications

---

## Implementation Approach

### Day-by-Day Breakdown (Week 1)

**Monday (4h)**: Database setup
- Prisma schema changes
- Migration: `add-financial-tenant-tracking`
- WatermelonDB schema updates

**Tuesday (8h)**: Financial backend
- FinancialService implementation
- S3 receipt upload
- P&L calculation logic
- Budget alerts
- CSV export

**Wednesday (8h)**: Financial frontend
- Web dashboard with charts
- Mobile Finances tab
- Transaction forms
- Offline sync

**Thursday (6h)**: Tenant backend
- TenantService implementation
- Lease expiry cron job
- Rent payment tracking
- Work order linking

**Friday (4h)**: Tenant frontend + testing
- Web tenant management
- Mobile Tenants tab
- E2E testing
- Bug fixes

---

## Success Metrics

### Week 1 Completion Criteria
- [ ] All 9 user stories completed
- [ ] 100% test coverage for new features
- [ ] Zero critical bugs
- [ ] Manual testing passed
- [ ] Offline sync working (mobile)
- [ ] Tenant isolation verified

### Launch Success (December)
- [ ] 10 beta users signed up
- [ ] 80%+ add tenants within first week
- [ ] 50%+ record at least one transaction
- [ ] < 5 critical bugs reported
- [ ] Positive qualitative feedback

---

## Risk Assessment

### Low Risk ✅
- Database schema changes (straightforward)
- Financial CRUD operations (standard patterns)
- Tenant CRUD operations (standard patterns)

### Medium Risk ⚠️
- Lease expiry cron job (timing logic complex)
- Rent payment tracking (overdue calculation)
- Offline sync for new models (WatermelonDB)

### Mitigation Strategies
1. **Cron Jobs**: Use `date-fns` library, write comprehensive tests for edge cases
2. **Payment Tracking**: Start simple (manual recording), add automation later
3. **Offline Sync**: Follow existing patterns from properties/work orders

---

## Go/No-Go Decision Points

### End of Week 1 (Nov 8)
**Criteria to proceed to Week 2:**
- [ ] All features working in dev environment
- [ ] Tests passing (unit + integration)
- [ ] Manual testing successful
- [ ] No blocking bugs

**If criteria not met**: Extend Week 1 by 2-3 days, delay Week 2 start

---

## Alternative Scenarios

### Scenario A: Everything Goes Smoothly ✅
- Complete Week 1 on time (Nov 8)
- Proceed to Week 2 (Payments) on Nov 11
- Launch early December as planned

### Scenario B: Minor Delays ⚠️
- Week 1 takes 6-7 days instead of 5
- Start Week 2 on Nov 13-14
- Launch mid-December (still acceptable)

### Scenario C: Major Blocker 🚫
- Week 1 blocked for > 2 days
- **Decision Point**: Skip one feature (likely Budget Alerts or Rent Payments)
- Proceed with core functionality only
- Add skipped feature post-launch

---

## Why This Decision Makes Sense

### 1. Timeline Flexibility
You stated: "im happy to defer launch as no marketing or plans have been arranged"

**This changes the equation.** Without marketing deadline pressure, spending 1 extra week to address fundamental gaps is the right Product Owner decision.

### 2. Platform Completeness
These aren't "nice to have" features - they're **table stakes** for a property management platform:
- Without tenant tracking, it's a work order app
- Without financial tracking, landlords need separate spreadsheets

### 3. Better Beta Feedback
Launching with these features means:
- More realistic user testing
- Feedback on actual value proposition
- Validation of financial features before investing more

### 4. Competitive Positioning
Competitors (Landlord Studio, Property118) all have tenant + financial management. Launching without them puts RightFit at a disadvantage.

### 5. Manageable Scope
30 hours = 1 week of focused work. Not a massive delay, and significantly more impactful than launching incomplete.

---

## Comparison: With vs Without Features

### Launch WITHOUT Features (Nov 22)
**What users can do:**
✅ Manage properties
✅ Create/track work orders
✅ Upload certificates
✅ Assign contractors
❌ Track who lives where
❌ Know when leases expire
❌ Record rent payments
❌ Track income/expenses
❌ Generate P&L reports
❌ Export for tax returns

**Result**: "Nice work order tracker, but I still need my spreadsheet"

### Launch WITH Features (Dec 6)
**What users can do:**
✅ Manage properties
✅ Create/track work orders
✅ Upload certificates
✅ Assign contractors
✅ Track tenants and tenancies
✅ Get lease expiry alerts
✅ Record rent payments
✅ Track income/expenses
✅ Generate P&L reports
✅ Export for tax returns

**Result**: "This replaces my spreadsheet AND my work order system!"

---

## Recommendation Summary

**Implement the 2 features before Sprint 6.**

**Reasoning:**
1. No marketing deadline = timeline flexibility available
2. Features address fundamental platform gaps
3. 1-week delay is acceptable for significantly stronger MVP
4. Better beta feedback with more complete product
5. Stronger competitive positioning

**Alternative**: If you disagree, we can proceed directly to Sprint 6 and defer these features to post-launch. However, I believe this would result in a weaker MVP and less valuable beta feedback.

---

## Next Steps

### Immediate (Today)
1. ✅ Review this decision document
2. ✅ Review [PRE_SPRINT_6_FEATURES.md](docs/stories/PRE_SPRINT_6_FEATURES.md)
3. ✅ Review [REVISED_SPRINT_6_PLAN.md](docs/stories/REVISED_SPRINT_6_PLAN.md)
4. 🔲 Confirm approval to proceed

### Week 1 Kickoff (Nov 4)
1. Create feature branch: `feature/pre-sprint-6-financial-tenant`
2. Start with database schema (Prisma migration)
3. Follow day-by-day plan in PRE_SPRINT_6_FEATURES.md
4. Daily standup to track progress

### Week 2 Onward
1. Follow REVISED_SPRINT_6_PLAN.md
2. Week 2: Payment Processing
3. Week 3: Production Infrastructure
4. Week 4: Launch Preparation

---

## Questions?

**Q: Can we skip Rent Payment Tracking to save time?**
A: Yes, if needed. That's US-TEN-4 (3 hours). Would save ~1 day.

**Q: Can we skip Budget Alerts?**
A: Yes, if needed. That's US-FIN-4 (2 hours). Less impactful than core financial tracking.

**Q: What if Week 1 takes longer than expected?**
A: We have buffer built into Week 2 (50 hours budgeted, likely need 40-45). Can absorb 1-2 day delay.

**Q: Can we do these features AFTER Sprint 6?**
A: Yes, but then you're launching without tenant tracking and financial management. Less compelling MVP, weaker beta feedback, harder to validate value proposition.

---

## Final Recommendation

**GO AHEAD with the 2 features in Week 1.**

The additional week is worth it for a significantly more complete and competitive MVP. You have timeline flexibility, and these features are fundamental to the platform's value proposition.

**Target Launch: Early December 2025**

Ready to start Week 1 on November 4, 2025.

---

**Approved by**: Claude (Product Owner)
**Date**: October 29, 2025
**Status**: READY FOR IMPLEMENTATION
