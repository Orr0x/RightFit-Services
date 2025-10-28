# RightFit Services - Risk Register

**Document Version:** 1.0
**Date:** 2025-10-27
**Project Manager:** John (PM Agent)
**Review Frequency:** Weekly (every Friday during sprint retrospective)

---

## Risk Matrix

**Impact Scale:**
- **High:** Could cause project failure or >2 week delay
- **Medium:** Could cause 1-2 week delay or significant scope reduction
- **Low:** Minor inconvenience, <1 week delay

**Probability Scale:**
- **High:** >40% chance of occurring
- **Medium:** 20-40% chance
- **Low:** <20% chance

**Risk Score:** Impact × Probability
- **Critical (Red):** High Impact + High/Medium Probability
- **Significant (Orange):** High Impact + Low Probability OR Medium Impact + High Probability
- **Moderate (Yellow):** Medium Impact + Medium Probability OR Low Impact + High Probability
- **Low (Green):** Low Impact + Low Probability

---

## Critical Risks (Red) 🚨

### R01: Solo Developer Single Point of Failure

**Category:** Resource
**Impact:** High (project stops if developer unavailable)
**Probability:** Medium (20-30% over 3 months)
**Risk Score:** CRITICAL

**Description:**
The project has one developer working part-time. If developer becomes sick, injured, or unavailable, project stops entirely. No backup resources available.

**Indicators:**
- Developer misses >2 days of work unexpectedly
- Developer communication stops for >24 hours
- Developer reports illness or personal emergency

**Mitigation Strategies:**
1. **Documentation:** Maintain detailed README, architecture diagrams, setup guides (recoverable by another dev if needed)
2. **Version Control:** All code in GitHub (no local-only work)
3. **Backup Developer:** Identify friend or contractor who could step in for emergencies (even if not ideal)
4. **Timeline Buffer:** Build 1-week buffer (Week 13) for unexpected delays
5. **Insurance:** Developer should have income protection insurance if possible

**Contingency Plan:**
- If developer unavailable <1 week: Pause project, push launch by 1 week
- If developer unavailable >1 week: Hire emergency contractor (£50-100/hour, budget impact £2k-4k)
- If developer unavailable permanently: Pivot or shut down project

**Owner:** PM
**Status:** Open
**Last Reviewed:** 2025-10-27
**Next Review:** Weekly

---

### R02: Offline Mode Technical Complexity

**Category:** Technical
**Impact:** High (core differentiator, project fails without it)
**Probability:** High (40-50% chance of significant challenges)
**Risk Score:** CRITICAL

**Description:**
Offline mode with WatermelonDB sync is highly complex. Developer may struggle with:
- WatermelonDB learning curve (first-time use)
- Sync queue logic (handling network flakiness, partial uploads)
- Conflict resolution (merging offline/online changes)
- Edge cases (app crashes mid-sync, corrupted local DB)

If offline mode doesn't work by Week 8, MVP is not competitive vs. Arthur Online.

**Indicators:**
- Week 6: Developer expresses concerns about offline complexity
- Week 7: Offline mode not working in basic tests
- Week 8: Multiple critical bugs in sync queue

**Mitigation Strategies:**
1. **Research Phase:** Developer reviews WatermelonDB docs during Week 6 (before Sprint 4 starts)
2. **Early Start:** Sprint 4 dedicated entirely to offline mode (Week 7-8)
3. **Extended Sprint:** If not working by Week 8, extend Sprint 4 by 1 week (delay Sprint 5-6)
4. **Simplified Approach:** If full offline fails, pivot to "cache-only" mode (read-only offline, no creates)
5. **Expert Help:** Budget £500 for 5-hour consultation with WatermelonDB expert (if needed)

**Contingency Plan:**
- **Week 8 - Not Working:** Extend Sprint 4 by 1 week, push launch to Week 13
- **Week 9 - Still Not Working:** Pivot to simplified offline mode:
  - Cache properties/work orders for viewing offline
  - Block creating work orders offline
  - Update product positioning ("view data offline, create online")
- **Week 10 - Still Not Working:** Cut offline mode entirely, focus on "fast mobile app" positioning (risky, major differentiator lost)

**Owner:** PM + Developer
**Status:** Open
**Last Reviewed:** 2025-10-27
**Next Review:** Weekly (critical during Sprint 4)

---

### R07: Developer Burnout

**Category:** Resource
**Impact:** High (quality drops, timeline slips, potential abandonment)
**Probability:** High (40-50% for solo devs with day job)
**Risk Score:** CRITICAL

**Description:**
Developer is working part-time (20-30 hrs/week) while keeping day job. Risk of burnout due to:
- 12-week sprint with no breaks
- Context switching between day job and side project
- Solo work (no team support, lonely)
- High expectations (MVP launch pressure)

Signs of burnout: working >35 hours/week consistently, quality drops, missed deadlines, communication becomes terse.

**Indicators:**
- Developer consistently works >35 hours/week for 2+ weeks
- Developer misses sprint commitments without explanation
- Developer reports fatigue, stress, or frustration
- Code quality drops (more bugs, skipped tests)
- Response time to PM questions increases (>24 hours)

**Mitigation Strategies:**
1. **Monitor Hours:** PM tracks hours worked weekly (flag if >35 hrs/week)
2. **Enforce Breaks:** Developer must take 1 full day off per week minimum (no coding Saturdays AND Sundays)
3. **Celebrate Wins:** PM acknowledges progress after each sprint (not just "what's next?")
4. **Cut Scope Proactively:** If developer overwhelmed, cut features EARLY (better to ship 8 solid features than 12 rushed ones)
5. **Psychological Safety:** Developer can say "I'm behind" without judgment, PM helps find solutions

**Contingency Plan:**
- **Early Signs (Week 3-5):** PM schedules 1:1 check-in, reviews workload, cuts 1-2 non-critical features
- **Moderate Burnout (Week 6-8):** Mandate 3-day break, extend sprint by 3 days
- **Severe Burnout (Week 9+):** Pause project for 1 week, consider extending MVP timeline to Week 13-14

**Owner:** PM
**Status:** Open
**Last Reviewed:** 2025-10-27
**Next Review:** Weekly (check hours worked)

---

## Significant Risks (Orange) ⚠️

### R03: Scope Creep

**Category:** Planning
**Impact:** Medium (delays MVP launch by 1-2 weeks)
**Probability:** High (30-40% for solo founders)
**Risk Score:** SIGNIFICANT

**Description:**
Developer (who is also founder) adds "nice-to-have" features during development:
- "Since I'm building X, might as well add Y"
- "This feature would be cool for users"
- "Just 2 more hours to add Z"

Scope creep delays MVP, risks missing Month 3 launch deadline.

**Indicators:**
- Developer mentions features not in MVP scope doc during sprint planning
- Sprint velocity drops below 80% (too many tasks in progress)
- Developer spends time on "polish" instead of core features

**Mitigation Strategies:**
1. **Weekly Scope Review:** Every sprint planning, PM asks "Is this feature in MVP scope doc?"
2. **Phase 2 Backlog:** Document cut features in "Phase 2 Backlog" (developer knows they're not forgotten)
3. **Acceptance Criteria:** User stories have clear "Definition of Done" (developer knows when to stop)
4. **Go/No-Go Enforcement:** Week 4 and Week 8 checkpoints force scope cuts if behind

**Contingency Plan:**
- **Week 4:** If >1 week behind, cut 1-2 features (e.g., delay AI photo quality to Phase 2)
- **Week 8:** If >1 week behind, cut UK compliance or payments (launch without monetization)
- **Week 10:** If still behind, accept Week 13 launch date

**Owner:** PM
**Status:** Open
**Last Reviewed:** 2025-10-27
**Next Review:** Every sprint planning

---

### R06: Low Beta User Adoption

**Category:** Market
**Impact:** Medium (can't validate product-market fit, poor feedback quality)
**Probability:** Medium (25-35% if recruitment poor)
**Risk Score:** SIGNIFICANT

**Description:**
Launch MVP to 10-20 beta users, but only 2-3 actively use the app. Reasons:
- Poor targeting (recruited wrong audience)
- Lack of incentives (beta users don't see value)
- Poor onboarding (users don't know how to use app)
- Competition (users prefer Arthur Online despite issues)

Without active beta users, can't collect feedback or validate product-market fit.

**Indicators:**
- Week 12: <10 beta users signed up
- Week 13: Beta users sign up but don't create properties/work orders
- Week 14: Beta users stop using app after 1-2 days

**Mitigation Strategies:**
1. **Recruit Early:** Start recruitment Week 10-11 (parallel with Sprint 5-6)
2. **Over-Recruit:** Aim for 30 beta signups to get 15-20 active users (50% activation rate)
3. **Targeted Recruitment:** Focus on landlords managing 3-20 properties (ideal customer profile)
4. **Strong Offer:** Free for 6 months + personal onboarding + direct line to founder
5. **1:1 Onboarding:** 30-minute video call with each beta user to help import properties

**Contingency Plan:**
- **Week 12 (<10 signups):** Double-down on recruitment (post in more groups, attend local meetups)
- **Week 13 (low activation):** Call each beta user personally, offer live demo and setup help
- **Week 14 (users churning):** Conduct user interviews to understand why they stopped using

**Owner:** PM
**Status:** Open
**Last Reviewed:** 2025-10-27
**Next Review:** Weekly (starting Week 10)

---

### R05: App Store Rejection (iOS)

**Category:** Technical / Process
**Impact:** Medium (delays launch by 1-2 weeks)
**Probability:** Medium (20-30% initial rejection rate)
**Risk Score:** SIGNIFICANT

**Description:**
Apple App Store has strict review guidelines. Common rejection reasons:
- Missing privacy policy
- Incomplete app (appears buggy in review)
- Insufficient app description/screenshots
- Using private APIs (rare with Expo)
- Subscription not implemented via Apple In-App Purchase (if required)

Android Play Store is more lenient (rarely rejects).

**Indicators:**
- Week 11: App submitted to App Store
- Week 12: Received rejection email from Apple

**Mitigation Strategies:**
1. **Review Guidelines Early:** Developer reviews Apple App Store Guidelines during Week 9-10
2. **Prepare Documents:** Privacy policy, terms of service written and uploaded by Week 10
3. **Submit Early:** Submit to TestFlight beta by Week 10-11 (allows 1-2 week buffer)
4. **Clean Build:** Ensure no debug code, console.logs, or placeholder content in submission
5. **Detailed Description:** App Store listing has screenshots, clear description, app preview video

**Contingency Plan:**
- **Rejection Week 12:** Fix issues and resubmit (typically 2-5 days for re-review)
- **Rejection Week 13:** Launch via TestFlight (iOS) and APK direct download (Android) for beta users
- **Multiple Rejections:** Consider hiring App Store expert ($500-1000 consultation)

**Owner:** Developer
**Status:** Open
**Last Reviewed:** 2025-10-27
**Next Review:** Week 10 (before submission)

---

## Moderate Risks (Yellow) ⚠️

### R04: AWS Cost Overrun

**Category:** Financial
**Impact:** Medium (budget blown, can't afford hosting)
**Probability:** Low-Medium (15-25% if not monitored)
**Risk Score:** MODERATE

**Description:**
AWS costs exceed budget due to:
- Using too large instances (t3.medium instead of t3.micro)
- RDS Multi-AZ when Single-AZ acceptable
- S3 storage explodes (test data not cleaned up)
- Data transfer costs (large photo uploads without optimization)

Architect estimated £48.50/month for MVP. Budget allows up to £150/month. Risk if >£150/month.

**Indicators:**
- AWS billing alert triggered (£50, £100, £150 thresholds)
- Month 1 costs >£100 (should be ~£50)
- S3 storage growing >5GB/week during MVP development

**Mitigation Strategies:**
1. **Billing Alerts:** Set up AWS billing alerts at £50, £100, £150
2. **Weekly Review:** PM checks AWS Trusted Advisor weekly for cost optimization recommendations
3. **Right-Sizing:** Use smallest acceptable instances:
   - EC2: t3.small (not t3.medium)
   - RDS: db.t3.micro (not db.t3.small)
   - Single-AZ RDS for MVP (not Multi-AZ)
4. **S3 Lifecycle:** Set S3 lifecycle policy to archive old photos >90 days
5. **Monitor Usage:** Check CloudWatch metrics weekly (CPU, storage, data transfer)

**Contingency Plan:**
- **Costs >£100/month:** Review AWS Trusted Advisor, downsize instances immediately
- **Costs >£150/month:** Emergency cost optimization:
  - Downsize EC2 to t3.micro (if CPU allows)
  - Delete test data from S3
  - Reduce RDS backup retention from 7 days to 1 day
- **Costs >£200/month:** Consider migrating to cheaper hosting (DigitalOcean, Hetzner)

**Owner:** PM
**Status:** Open
**Last Reviewed:** 2025-10-27
**Next Review:** Weekly (check AWS billing dashboard)

---

### R08: Monorepo Setup Complexity

**Category:** Technical
**Impact:** Low-Medium (delays Sprint 1 by 2-4 hours)
**Probability:** Medium (30% for first-time Turborepo users)
**Risk Score:** MODERATE

**Description:**
Turborepo monorepo with 3 apps (mobile, web, api) and 2 packages (shared, database) can be complex to configure:
- TypeScript path aliases (`@shared/*`, `@database/*`)
- Prisma client generation in `packages/database` not working
- Expo can't import from shared packages
- Build caching issues

**Indicators:**
- Day 1-2: Developer struggling with import errors
- TypeScript complaining about unresolved modules
- Turborepo cache not working

**Mitigation Strategies:**
1. **Follow Template:** Use existing Turborepo template (turborepo.org/docs/handbook/sharing-code)
2. **Architect Reference:** Follow exact structure from `docs/architecture/source-tree.md`
3. **Early Testing:** Test shared imports on Day 1 (don't wait until Sprint 2)
4. **Community Help:** Ask in Turborepo Discord if stuck >2 hours

**Contingency Plan:**
- **If >4 hours spent:** Simplify setup (skip shared packages for Sprint 1, add later)
- **If >8 hours spent:** Abandon monorepo, use separate repos (acceptable trade-off for MVP)

**Owner:** Developer
**Status:** Open
**Last Reviewed:** 2025-10-27
**Next Review:** Week 1 (Sprint 1)

---

### R09: Database Migration Issues

**Category:** Technical
**Impact:** Low-Medium (delays sprints by 2-6 hours per migration failure)
**Probability:** Medium (25% during MVP development)
**Risk Score:** MODERATE

**Description:**
Prisma migrations can fail due to:
- Schema changes conflict with existing data
- PostgreSQL constraints violated
- Migration runs locally but fails on RDS (permission issues)
- Developer forgets to run migration after pulling changes

**Indicators:**
- Prisma migrate command fails with error
- API crashes with "relation does not exist" error
- Data loss after migration (no rollback)

**Mitigation Strategies:**
1. **Test Migrations Locally:** Always test migrations on local database before production
2. **Backup Before Migration:** RDS automated backups enabled (7-day retention)
3. **Migration Naming:** Use descriptive migration names (e.g., `add_contractor_phone_validation`)
4. **Schema Validation:** Run `prisma validate` before creating migration
5. **Rollback Plan:** Document how to rollback migration if fails (restore from backup)

**Contingency Plan:**
- **Migration Fails:** Rollback database from RDS automated backup (point-in-time recovery)
- **Data Loss:** Restore from backup, re-run migration with fixes
- **Repeated Failures:** Add migration review step to sprint planning (PM reviews schema changes)

**Owner:** Developer
**Status:** Open
**Last Reviewed:** 2025-10-27
**Next Review:** Every sprint

---

### R10: Mobile Photo Upload on Slow Networks

**Category:** Technical / UX
**Impact:** Low-Medium (poor user experience, timeouts)
**Probability:** Medium (30% in rural areas)
**Risk Score:** MODERATE

**Description:**
Landlords visit rural properties with poor mobile signal (2G, 3G). Photo uploads (5-10MB per photo) time out or fail on slow networks. Users frustrated, abandon app.

**Indicators:**
- Beta users report "photo upload stuck"
- Sentry errors: Network timeout, axios request failed
- Upload takes >60 seconds on 3G

**Mitigation Strategies:**
1. **Image Compression:** Compress photos before upload (max 1920x1920, 85% quality) using Expo Image Manipulator
2. **Thumbnail Upload First:** Upload thumbnail (400x400, 80% quality) immediately, full-size in background
3. **Retry Logic:** Automatically retry failed uploads with exponential backoff
4. **Offline Queue:** If upload fails, queue for later (handled by offline sync)
5. **Progress Indicator:** Show upload progress (bytes uploaded / total bytes)

**Contingency Plan:**
- **Week 12 (beta complaints):** Add "Upload on WiFi only" setting
- **Month 4 (continued issues):** Implement chunked uploads (split large photos into 1MB chunks)

**Owner:** Developer
**Status:** Open
**Last Reviewed:** 2025-10-27
**Next Review:** Sprint 3 (photo upload feature)

---

## Low Risks (Green) ✅

### R11: Stripe Production Account Verification Delay

**Category:** Process
**Impact:** Low (delays payments by 1-2 days, not critical for MVP)
**Probability:** Low (20%)
**Risk Score:** LOW

**Description:**
Stripe may require business verification before activating production mode (providing tax ID, business address). Verification takes 1-2 business days.

**Mitigation:**
- Apply for Stripe account during Sprint 5 (Week 9) to allow buffer time
- If delayed, launch MVP with Stripe test mode (fake payments for beta users)

**Owner:** Developer
**Status:** Open

---

### R12: SendGrid Email Deliverability

**Category:** Technical
**Impact:** Low (notifications work via SMS and push, email secondary)
**Probability:** Low (15%)
**Risk Score:** LOW

**Description:**
SendGrid emails land in spam folder if domain not properly configured (SPF, DKIM, DMARC records).

**Mitigation:**
- Configure SendGrid domain authentication during Sprint 5
- Test email deliverability to Gmail, Outlook, Yahoo before launch
- Fallback: Use transactional emails from AWS SES if SendGrid fails

**Owner:** Developer
**Status:** Open

---

### R13: Firebase Push Notification iOS Certificate Issues

**Category:** Technical
**Impact:** Low (can use SMS notifications as fallback)
**Probability:** Low (20%)
**Risk Score:** LOW

**Description:**
iOS push notifications require APNs certificate configuration in Firebase. Certificate setup can be confusing for first-time users.

**Mitigation:**
- Follow Firebase iOS setup guide carefully during Sprint 5
- Test push notifications on physical iOS device (not simulator)
- Fallback: Use SMS notifications if push notifications fail

**Owner:** Developer
**Status:** Open

---

## Risk Summary Dashboard

| Risk ID | Risk Name | Impact | Probability | Score | Status | Owner |
|---------|-----------|--------|-------------|-------|--------|-------|
| R01 | Solo Dev Single Point of Failure | High | Medium | 🚨 Critical | Open | PM |
| R02 | Offline Mode Complexity | High | High | 🚨 Critical | Open | PM + Dev |
| R07 | Developer Burnout | High | High | 🚨 Critical | Open | PM |
| R03 | Scope Creep | Medium | High | ⚠️ Significant | Open | PM |
| R06 | Low Beta Adoption | Medium | Medium | ⚠️ Significant | Open | PM |
| R05 | App Store Rejection | Medium | Medium | ⚠️ Significant | Open | Dev |
| R04 | AWS Cost Overrun | Medium | Low-Med | ⚠️ Moderate | Open | PM |
| R08 | Monorepo Setup | Low-Med | Medium | ⚠️ Moderate | Open | Dev |
| R09 | Database Migrations | Low-Med | Medium | ⚠️ Moderate | Open | Dev |
| R10 | Photo Upload Slow Networks | Low-Med | Medium | ⚠️ Moderate | Open | Dev |
| R11 | Stripe Verification | Low | Low | ✅ Low | Open | Dev |
| R12 | Email Deliverability | Low | Low | ✅ Low | Open | Dev |
| R13 | Push Notification iOS | Low | Low | ✅ Low | Open | Dev |

---

## Risk Review Process

### Weekly Risk Review (Every Friday)

During sprint retrospective, PM reviews risk register:

1. **Update Status:** Mark risks as Mitigated, Occurred, or Closed
2. **Review Indicators:** Check if any risk indicators triggered this week
3. **New Risks:** Identify new risks discovered during sprint
4. **Action Items:** Assign mitigation actions for next sprint

### Risk Escalation

**If any Critical risk occurs:**
1. PM immediately notifies developer (within 24 hours)
2. Schedule emergency meeting to discuss contingency plan
3. Update sprint plan and roadmap accordingly
4. Document lessons learned in retrospective

---

## Lessons Learned (Updated After Each Sprint)

### Sprint 1:
- TBD

### Sprint 2:
- TBD

### Sprint 3:
- TBD

### Sprint 4:
- TBD

### Sprint 5:
- TBD

### Sprint 6:
- TBD

---

**Last Updated:** 2025-10-27
**Next Review:** 2025-11-03 (after Sprint 1)
**Document Owner:** John (PM)
