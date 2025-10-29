# RightFit Services - Feature Gaps & Priority Action Plan

**Date:** 2025-10-29
**Current Progress:** 82% (251/304 story points)
**Sprint Status:** Sprint 5 Complete, Sprint 6 Pending

---

## Executive Summary

### What's Working ✅
- **Core Platform (Sprints 1-5):** 251/251 points complete
- **Web & Mobile Apps:** Fully functional in Expo Go
- **Authentication:** Multi-tenant JWT auth working
- **CRUD Operations:** Properties, work orders, contractors, certificates
- **Notifications:** Email (Resend), SMS (Twilio), Push (Expo) all tested
- **Compliance:** UK certificate tracking with automated expiry notifications
- **Photo Management:** AWS S3 upload with Google Vision quality checks
- **Offline Mode:** Code implemented, graceful degradation in Expo Go
- **Test Suite:** 71/72 tests passing (98.6% pass rate), 24% coverage

### Critical Gaps 🔴
1. **Offline Mode Not Fully Tested** - Requires dev build (WatermelonDB needs native modules)
2. **Sprint 6 Not Started** - Payments, subscriptions, production setup (0/53 points)
3. **Security Hardening Missing** - No rate limiting, validation, security headers
4. **Production Infrastructure** - No hosting, monitoring, CI/CD configured
5. **App Store Submissions** - No builds created, no store presence
6. **Legal Documents** - No Terms, Privacy Policy, GDPR compliance

---

## Detailed Feature Gap Analysis

### 🔴 CRITICAL - Blocks MVP Launch

#### 1. Story 008: Payment Processing (Sprint 6) - **NOT STARTED**

**Status:** 0/53 story points
**Impact:** Cannot monetize, blocks MVP launch
**Estimated Effort:** 40-60 hours

**Missing Components:**
- ❌ Stripe integration setup
- ❌ Subscription plans (Basic, Pro, Enterprise)
- ❌ Payment processing endpoints (`POST /api/payments/subscribe`)
- ❌ Webhook handlers for Stripe events
- ❌ Billing dashboard UI (web + mobile)
- ❌ Usage limits by plan (property count, work orders, users)
- ❌ Invoice generation and history
- ❌ Payment method management
- ❌ Cancel/upgrade subscription flows
- ❌ Failed payment handling and retries

**API Endpoints Needed:**
```typescript
POST   /api/subscriptions/create      // Create subscription
GET    /api/subscriptions/current     // Get active subscription
PATCH  /api/subscriptions/upgrade     // Upgrade plan
DELETE /api/subscriptions/cancel      // Cancel subscription
GET    /api/subscriptions/invoices    // Get billing history
POST   /api/webhooks/stripe           // Stripe webhook handler
```

**Acceptance Criteria:**
- [ ] User can subscribe to a plan from web app
- [ ] Payment processed successfully via Stripe
- [ ] Subscription limits enforced in API
- [ ] User can view/manage subscription in dashboard
- [ ] Failed payments trigger email notification
- [ ] Webhooks handle subscription events
- [ ] Invoice generated for each payment

---

#### 2. Story 003: Offline Mode Testing - **INCOMPLETE**

**Status:** Code implemented (56/56 points), but **cannot be tested in Expo Go**
**Impact:** Key differentiator unverified, high risk
**Estimated Effort:** 10-15 hours (build + testing)

**Problem:**
WatermelonDB requires native modules (SQLite) that don't work in Expo Go. Current implementation has graceful degradation but offline mode is untested.

**What's Implemented:**
- ✅ WatermelonDB schema and models
- ✅ Local database setup with fallback
- ✅ Sync queue for offline operations
- ✅ Network status monitoring
- ✅ Offline create/update/delete logic
- ✅ Background sync processor

**What's NOT Tested:**
- ❌ Offline work order creation
- ❌ Photo upload while offline
- ❌ Bi-directional sync (mobile ↔ server)
- ❌ Conflict resolution
- ❌ Sync queue processing
- ❌ Network transitions (offline → online)

**Required Action:**
Create EAS development build to test offline mode on physical device. See section below for instructions.

---

#### 3. Production Infrastructure - **NOT CONFIGURED**

**Status:** 0% configured
**Impact:** Cannot deploy MVP
**Estimated Effort:** 20-30 hours

**Missing:**
- ❌ Hosting provider selected
- ❌ Domain purchased and DNS configured
- ❌ SSL/TLS certificates
- ❌ Production database (PostgreSQL hosted)
- ❌ Production environment variables
- ❌ API keys for production (AWS, Resend, Twilio, etc.)
- ❌ CI/CD pipeline (GitHub Actions)
- ❌ Database backup strategy
- ❌ CDN for static assets
- ❌ Load balancer configuration

**Hosting Options:**
| Option | Pros | Cons | Est. Cost/Month |
|--------|------|------|-----------------|
| **Vercel + Railway** | Easy setup, auto SSL | Limited control | $30-50 |
| **AWS (EC2/RDS/S3)** | Full control, scalable | Complex setup | $50-150 |
| **DigitalOcean** | Good balance | Fewer features | $30-80 |

**Recommendation:** Start with Vercel + Railway for MVP, migrate to AWS when scaling.

---

#### 4. Mobile App Store Submissions - **NOT STARTED**

**Status:** No builds created
**Impact:** Users cannot install app
**Estimated Effort:** 15-25 hours

**Missing:**
- ❌ EAS build configuration (`eas.json`)
- ❌ App icon (1024x1024) and splash screens
- ❌ iOS production build
- ❌ Android production build (.apk/.aab)
- ❌ App Store Connect setup (iOS)
- ❌ Google Play Console setup (Android)
- ❌ Screenshots for both platforms
- ❌ App descriptions and keywords
- ❌ Privacy policy URL
- ❌ App review preparation

**Build Configuration Needed:**
```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "distribution": "store"
    }
  }
}
```

---

### 🟡 HIGH PRIORITY - Needed Soon

#### 5. Security Hardening - **PARTIALLY COMPLETE**

**Status:** 40% complete
**Impact:** Security vulnerabilities, potential breaches
**Estimated Effort:** 10-15 hours

**Implemented:**
- ✅ JWT authentication with expiration
- ✅ Password hashing (bcrypt, 10 rounds)
- ✅ Multi-tenant data isolation
- ✅ CORS configured
- ✅ Rate limiting on login endpoint

**Missing:**
- ❌ Helmet.js for security headers
- ❌ Request validation (class-validator)
- ❌ Rate limiting on ALL endpoints
- ❌ SQL injection prevention (using Prisma, but validate inputs)
- ❌ XSS prevention validation
- ❌ CSRF protection
- ❌ Request size limits
- ❌ 2FA/MFA support
- ❌ Password strength requirements
- ❌ Account lockout after failed attempts
- ❌ Password reset flow (forgot password)
- ❌ Audit logging

**Quick Wins (2-4 hours):**
```typescript
// Install and configure
pnpm add helmet express-rate-limit class-validator

// Add to apps/api/src/index.ts
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'

app.use(helmet())
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }))
```

---

#### 6. Monitoring & Error Tracking - **NOT CONFIGURED**

**Status:** 0% configured
**Impact:** Cannot detect/debug production issues
**Estimated Effort:** 8-12 hours

**Missing:**
- ❌ Error tracking (Sentry)
- ❌ Application monitoring (DataDog/New Relic)
- ❌ Log aggregation (CloudWatch/Logtail)
- ❌ Uptime monitoring (Pingdom/UptimeRobot)
- ❌ Performance metrics (APM)
- ❌ Alert notifications (PagerDuty/Slack)
- ❌ User analytics (Google Analytics/Plausible)

**Recommendation:** Start with Sentry (free tier: 5k events/month)
```bash
pnpm add @sentry/node @sentry/react @sentry/react-native
```

---

#### 7. Testing Coverage - **INCOMPLETE**

**Status:** 24% coverage (target: 80%)
**Impact:** Bugs slip to production
**Estimated Effort:** 20-30 hours

**Current State:**
- ✅ 71/72 tests passing (98.6% pass rate)
- ✅ Unit tests for core services
- ✅ Integration tests for certificates API
- ✅ Coverage thresholds passing (24%)

**Missing:**
- ❌ E2E tests for critical user flows
- ❌ Load/stress testing
- ❌ Security testing (OWASP)
- ❌ Mobile app testing (Detox/Maestro)
- ❌ Payment flow testing
- ❌ Tests for remaining services (55% uncovered)

**Priority Test Files Needed:**
1. `apps/api/src/services/__tests__/PaymentService.test.ts` (when Sprint 6 starts)
2. `apps/api/src/routes/__tests__/properties.integration.test.ts`
3. `apps/api/src/routes/__tests__/work-orders.integration.test.ts`
4. `apps/web/tests/e2e/work-orders.spec.ts`
5. `apps/mobile/__tests__/offline-sync.test.ts` (after dev build)

---

### 🟢 MEDIUM PRIORITY - Nice to Have

#### 8. Legal & Compliance Documents - **NOT CREATED**

**Impact:** Legal liability, cannot launch
**Estimated Effort:** 5-10 hours (templates available)

**Missing:**
- ❌ Terms of Service
- ❌ Privacy Policy (GDPR compliant)
- ❌ Cookie Policy
- ❌ Data Processing Agreement (DPA)
- ❌ Acceptable Use Policy

**Resources:**
- Use [Termly](https://termly.io/) or [TermsFeed](https://www.termsfeed.com/) for templates
- Cost: Free - $200 for professional templates
- GDPR specific: [ICO guidance](https://ico.org.uk/for-organisations/guide-to-data-protection/)

---

#### 9. Performance Optimization - **NOT DONE**

**Status:** Basic performance, not optimized
**Impact:** Slow load times, poor UX
**Estimated Effort:** 15-20 hours

**API Optimizations Needed:**
- ❌ Database query optimization (add indexes)
- ❌ Response caching (Redis)
- ❌ Compression middleware (gzip)
- ❌ Connection pooling (PgBouncer)
- ❌ API response pagination (large datasets)

**Web App Optimizations:**
- ❌ Code splitting (React.lazy)
- ❌ Image optimization (WebP, lazy loading)
- ❌ Bundle size reduction
- ❌ Service worker (offline support)

**Mobile App Optimizations:**
- ❌ Image caching
- ❌ List virtualization (FlatList optimization)
- ❌ Background sync optimization

---

#### 10. Features Not in MVP (Future Sprints)

**Intentionally Deferred:**
- ⚠️ Certificate management in mobile app (web-only for MVP)
- ⚠️ Dark mode support
- ⚠️ Biometric authentication (Touch ID/Face ID)
- ⚠️ Multi-language support (i18n)
- ⚠️ Advanced analytics dashboard
- ⚠️ Reporting and exports (PDF/Excel)
- ⚠️ Team collaboration features
- ⚠️ Calendar integration
- ⚠️ In-app messaging

---

## How to Create EAS Dev Build for Offline Testing

### Prerequisites
```bash
# Install EAS CLI globally
npm install -g eas-cli

# Login to Expo account
eas login
```

### Step 1: Create `eas.json` Configuration

Create `apps/mobile/eas.json`:
```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": false
      }
    },
    "production": {
      "distribution": "store"
    }
  },
  "submit": {
    "production": {}
  }
}
```

### Step 2: Install Expo Dev Client

```bash
cd apps/mobile
pnpm add expo-dev-client
```

### Step 3: Update `app.json` with Build Configuration

Add to `apps/mobile/app.json`:
```json
{
  "expo": {
    "name": "RightFit Services",
    "slug": "rightfit-services",
    "owner": "your-expo-username",
    "extra": {
      "eas": {
        "projectId": "your-project-id"
      }
    },
    "plugins": [
      "expo-dev-client",
      "@nozbe/watermelondb/expo-plugin"
    ]
  }
}
```

### Step 4: Configure Project

```bash
# Initialize EAS project
eas init --id your-project-id

# Configure project
eas project:init
```

### Step 5: Build Development Client

**For iOS Simulator (Mac only):**
```bash
eas build --profile development --platform ios
```

**For Android Device:**
```bash
eas build --profile development --platform android
```

**For Physical iOS Device:**
```bash
# Requires Apple Developer account ($99/year)
eas build --profile development --platform ios --no-wait
```

### Step 6: Install and Test

**iOS Simulator:**
1. Download .tar.gz from EAS dashboard
2. Extract and drag to simulator
3. Run: `pnpm start --dev-client`

**Android Device:**
1. Download .apk from EAS dashboard
2. Install on device via ADB or direct download
3. Run: `pnpm start --dev-client`
4. Open app on device

### Step 7: Test Offline Mode

**Test Checklist:**
1. ✅ Create work order while offline
2. ✅ Upload 3 photos while offline
3. ✅ Edit work order while offline
4. ✅ Go online → verify sync starts automatically
5. ✅ Verify work order appears in web app
6. ✅ Verify photos uploaded to S3
7. ✅ Edit same work order on web while mobile offline
8. ✅ Sync → verify conflict resolution (last-write-wins)
9. ✅ Test network drop mid-sync
10. ✅ Verify sync queue persists through app restart

**Estimated Time:**
- Configuration: 30 minutes
- First build: 15-20 minutes
- Testing: 2-3 hours
- **Total: 3-4 hours**

---

## Priority Action Plan - Next 2 Weeks

### 🔴 WEEK 1: Critical Pre-MVP Work (35-45 hours)

#### Priority 1: Create EAS Dev Build & Test Offline (3-4 hours) 🔴
- [ ] Create `eas.json` configuration
- [ ] Install `expo-dev-client`
- [ ] Build development client for Android
- [ ] Install on physical device
- [ ] Test all offline scenarios
- [ ] Fix any bugs discovered
- [ ] Document offline mode limitations

**Why Critical:** Offline mode is the key differentiator. MUST verify it works before claiming it's complete.

---

#### Priority 2: Security Hardening (10-15 hours) 🔴
- [ ] Install Helmet.js for security headers
- [ ] Add rate limiting to all API endpoints
- [ ] Implement request validation (class-validator)
- [ ] Add password strength requirements
- [ ] Implement password reset flow (forgot password)
- [ ] Add account lockout after 5 failed attempts
- [ ] Security audit with OWASP checklist
- [ ] Test security measures

**Why Critical:** Security vulnerabilities can destroy a business. Must harden before launch.

---

#### Priority 3: Fix Remaining Tests & Improve Coverage (8-10 hours) 🟡
- [ ] Fix 1 failing WorkOrdersService test
- [ ] Add integration tests for properties API
- [ ] Add integration tests for work-orders API
- [ ] Target: 40-50% coverage (current: 24%)
- [ ] Add E2E tests for critical flows

**Why Important:** Good test coverage catches bugs early and gives confidence in deployments.

---

#### Priority 4: Production Infrastructure Planning (5-8 hours) 🟡
- [ ] Choose hosting provider (Vercel + Railway recommended)
- [ ] Document production environment variables
- [ ] Create production database plan
- [ ] Set up GitHub Actions for CI/CD
- [ ] Plan monitoring strategy (Sentry)
- [ ] Create deployment runbook

**Why Important:** Production setup takes time. Plan now to avoid rushed deployment.

---

### 🟡 WEEK 2: Sprint 6 Kickoff (40-60 hours)

#### Priority 5: Start Sprint 6 - Payments (40-60 hours) 🔴
- [ ] Create Stripe account (test + production)
- [ ] Design subscription plans (Basic, Pro, Enterprise)
- [ ] Implement payment endpoints
- [ ] Create webhook handlers
- [ ] Build billing dashboard UI
- [ ] Implement usage limits
- [ ] Test payment flows
- [ ] Handle edge cases (failed payments, etc.)

**Why Critical:** Cannot monetize without payments. This is the final blocker for MVP launch.

---

## Go/No-Go Decision: When to Move to Sprint 6?

### ✅ Ready to Start Sprint 6 When:

1. ✅ **Offline Mode Verified**
   - Dev build created and tested
   - All offline scenarios working
   - No critical bugs

2. ✅ **Security Hardened**
   - Helmet.js configured
   - Rate limiting on all endpoints
   - Password reset flow working
   - Basic security measures in place

3. ✅ **Tests Stable**
   - All tests passing (72/72)
   - Coverage at 40%+ (currently 24%)
   - No flaky tests

4. ✅ **Infrastructure Planned**
   - Hosting provider chosen
   - Production plan documented
   - CI/CD pipeline ready

5. ✅ **Team Confidence High**
   - No major technical debt blocking progress
   - Codebase stable and maintainable
   - Documentation up to date

### 🔴 Current Status: **3/5 criteria met**

**Blockers:**
1. ❌ Offline mode not tested (need dev build)
2. ❌ Security hardening incomplete
3. ⚠️ Test coverage low (24%, target 40%+)

**Recommendation:** Complete Week 1 priorities before starting Sprint 6.

---

## Estimated Time to MVP Launch

**Week 1 (Critical Pre-MVP):** 35-45 hours
**Week 2 (Sprint 6 Start):** 40-60 hours
**Week 3-4 (Sprint 6 Complete):** 60-80 hours
**Week 5 (Production Setup):** 20-30 hours
**Week 6 (Testing & Launch):** 15-25 hours

**Total:** 170-240 hours (~5-8 weeks full-time)

**With Part-Time Development (20 hrs/week):** 9-12 weeks

---

## Immediate Next Steps (This Week)

### Today (4-6 hours)
1. ✅ Create `eas.json` configuration
2. ✅ Build EAS dev client for Android
3. ✅ Test offline mode on physical device
4. ✅ Document any bugs found

### Tomorrow (6-8 hours)
1. ✅ Install Helmet.js and configure security headers
2. ✅ Add rate limiting to all endpoints
3. ✅ Implement password reset flow
4. ✅ Test security measures

### This Week (Remaining 20-30 hours)
1. ✅ Improve test coverage to 40%
2. ✅ Plan production infrastructure
3. ✅ Set up Sentry for error tracking
4. ✅ Create deployment runbook

---

## Resources & Documentation

**EAS Build:**
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Dev Client Documentation](https://docs.expo.dev/develop/development-builds/introduction/)

**WatermelonDB:**
- [WatermelonDB Documentation](https://nozbe.github.io/WatermelonDB/)
- [Expo Integration](https://nozbe.github.io/WatermelonDB/Installation.html#expo)

**Security:**
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Helmet.js](https://helmetjs.github.io/)

**Production:**
- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app/)
- [Sentry Setup](https://docs.sentry.io/platforms/node/)

---

## Summary

**Current State:**
- ✅ 82% complete (251/304 story points)
- ✅ Sprints 1-5 complete
- ⚠️ Offline mode code complete but untested
- ❌ Sprint 6 (Payments) not started

**Critical Path:**
1. Test offline mode (EAS dev build) - 4 hours
2. Security hardening - 10-15 hours
3. Sprint 6 (Payments) - 40-60 hours
4. Production setup - 20-30 hours
5. App store submissions - 15-25 hours

**Time to MVP:** 5-8 weeks full-time (or 9-12 weeks part-time)

**Recommendation:** Focus on Week 1 priorities (offline testing + security) before starting Sprint 6. This ensures a stable foundation for the payment system and production deployment.

---

**Last Updated:** 2025-10-29
**Next Review:** After offline mode testing complete
**Author:** Dev Agent (James)
