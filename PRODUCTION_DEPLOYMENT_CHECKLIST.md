# Production Deployment Checklist - RightFit Services

**Last Updated:** October 29, 2025
**Sprint 6 Requirement:** CRITICAL
**Estimated Completion Time:** 20-30 hours

---

## 📋 Overview

This checklist ensures all production infrastructure, monitoring, security, and deployment requirements are met before launching RightFit Services MVP.

**Status:** 🔴 **NOT READY** - Sprint 6 Required
**Completion:** 15% (12/80 items)

---

## Pre-Deployment Phase (Complete BEFORE Sprint 6 Week 2)

### 1. Hosting Provider Selection ⚠️ DECISION REQUIRED

**Status:** ❌ Not Started
**Deadline:** November 4, 2025 (Week 1)
**Owner:** Developer + Founder

#### Option A: Vercel + Railway (RECOMMENDED FOR MVP)
- [ ] Create Vercel account
- [ ] Create Railway account
- [ ] Estimated cost: $40-60/month
- [ ] **Pros:** Easiest deployment, automatic SSL, CDN included
- [ ] **Cons:** Limited control, scaling costs increase

#### Option B: DigitalOcean App Platform
- [ ] Create DigitalOcean account
- [ ] Estimated cost: $60/month
- [ ] **Pros:** Good balance, affordable, managed PostgreSQL
- [ ] **Cons:** Less features than AWS

#### Option C: AWS (Full Control)
- [ ] AWS account already exists ✅
- [ ] Estimated cost: $80-120/month
- [ ] **Pros:** Full control, scales infinitely
- [ ] **Cons:** More complex setup, requires DevOps knowledge

**DECISION:** _________________________
**Date Decided:** _________________________

---

### 2. Domain & DNS Configuration

**Status:** ❌ Not Started
**Deadline:** November 4, 2025
**Priority:** 🔴 CRITICAL

#### Domain Registration
- [ ] Register `rightfitservices.co.uk` (£10-12/year)
  - Registrar options: Namecheap, Google Domains, Cloudflare
- [ ] Register `rightfitservices.com` (optional, £12/year)
- [ ] Enable domain privacy protection
- [ ] Set auto-renewal to ON

#### DNS Configuration
- [ ] Configure DNS nameservers (point to hosting provider)
- [ ] Create A record: `@` → API server IP
- [ ] Create CNAME record: `www` → `rightfitservices.co.uk`
- [ ] Create CNAME record: `api` → API server URL
- [ ] Create CNAME record: `app` → Web app URL
- [ ] Configure SPF record for email (prevent spam)
  ```
  v=spf1 include:resend.com ~all
  ```
- [ ] Configure DMARC record for email security
- [ ] Verify DNS propagation (use `dig` or dnschecker.org)
- [ ] Estimated propagation time: 24-48 hours

**DNS Records Checklist:**
```
rightfitservices.co.uk           A       <API_SERVER_IP>
www.rightfitservices.co.uk       CNAME   rightfitservices.co.uk
api.rightfitservices.co.uk       CNAME   <HOSTING_PROVIDER_URL>
app.rightfitservices.co.uk       CNAME   <WEB_APP_URL>
```

---

### 3. SSL/TLS Certificates

**Status:** ❌ Not Started
**Deadline:** November 11, 2025
**Priority:** 🔴 CRITICAL

#### Certificate Provisioning
- [ ] **If using Vercel/DigitalOcean:** SSL auto-provisioned ✅
- [ ] **If using AWS:**
  - [ ] Request certificate via AWS Certificate Manager (ACM)
  - [ ] Validate domain ownership (DNS or email validation)
  - [ ] Attach certificate to Load Balancer
- [ ] Verify HTTPS working on all domains
- [ ] Test SSL Labs rating (aim for A+): https://www.ssllabs.com/ssltest/

#### Force HTTPS
- [ ] Configure server to redirect HTTP → HTTPS
- [ ] Add HSTS header (Strict-Transport-Security)
- [ ] Update all API calls to use `https://` URLs

---

## Infrastructure Setup (Sprint 6 Week 1-2)

### 4. Database (Production)

**Status:** ❌ Not Started
**Deadline:** November 11, 2025
**Priority:** 🔴 CRITICAL

#### PostgreSQL Provisioning
- [ ] Choose database hosting:
  - [ ] **Railway Postgres:** $5-20/month (recommended for MVP)
  - [ ] **DigitalOcean Managed DB:** $25/month (2 GB RAM)
  - [ ] **AWS RDS:** db.t3.micro $15/month (+ storage)
- [ ] Create production database instance
- [ ] Configure database:
  - [ ] PostgreSQL version: 14+
  - [ ] Storage: 20 GB minimum
  - [ ] Backups: Daily automated backups enabled
  - [ ] Retention: 7 days minimum
- [ ] Restrict access:
  - [ ] Enable SSL/TLS connections
  - [ ] Whitelist only API server IP
  - [ ] Disable public access
- [ ] Record connection string securely

#### Database Migration
- [ ] Run Prisma migrations on production DB:
  ```bash
  DATABASE_URL="postgresql://..." npx prisma migrate deploy
  ```
- [ ] Verify all tables created:
  ```bash
  npx prisma db pull
  ```
- [ ] Run seed data (if needed):
  ```bash
  npx prisma db seed
  ```
- [ ] Test database connectivity from API server

#### Backup Strategy
- [ ] Configure automated daily backups
- [ ] Test backup restoration process
- [ ] Document backup restoration steps
- [ ] Set up backup monitoring/alerts
- [ ] Store backup credentials in password manager

**Connection String Format:**
```
postgresql://username:password@host:5432/database?sslmode=require
```

---

### 5. API Server Deployment

**Status:** ⚠️ Partial (Dev only)
**Deadline:** November 11, 2025
**Priority:** 🔴 CRITICAL

#### Build & Deploy
- [ ] Build production bundle:
  ```bash
  cd apps/api
  pnpm build
  ```
- [ ] Deploy to hosting provider:
  - [ ] **If Vercel:** Connect GitHub repo, configure build settings
  - [ ] **If Railway:** Deploy via CLI or GitHub integration
  - [ ] **If AWS:** Build Docker image, push to ECR, deploy to ECS
- [ ] Configure production environment variables (see Section 6)
- [ ] Start API server
- [ ] Verify health endpoint: `GET https://api.rightfitservices.co.uk/health`

#### Server Configuration
- [ ] Set `NODE_ENV=production`
- [ ] Configure port (3000 or provider default)
- [ ] Enable PM2 cluster mode (if self-hosted):
  ```bash
  pm2 start ecosystem.config.js --only rightfit-api-prod
  ```
- [ ] Configure auto-restart on crash
- [ ] Set up log rotation (daily, keep 7 days)

---

### 6. Environment Variables (Production)

**Status:** ❌ Not Started
**Deadline:** November 11, 2025
**Priority:** 🔴 CRITICAL

#### Core Variables
```env
# Environment
NODE_ENV=production
PORT=3000
API_URL=https://api.rightfitservices.co.uk
WEB_URL=https://app.rightfitservices.co.uk

# Database
DATABASE_URL=postgresql://user:pass@host:5432/rightfit_prod?sslmode=require

# JWT Secrets (GENERATE NEW FOR PRODUCTION!)
JWT_SECRET=<GENERATE_WITH_openssl_rand_base64_64>
JWT_REFRESH_SECRET=<GENERATE_WITH_openssl_rand_base64_64>
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=30d

# AWS S3
AWS_REGION=eu-west-2
AWS_ACCESS_KEY_ID=<PRODUCTION_KEY>
AWS_SECRET_ACCESS_KEY=<PRODUCTION_SECRET>
AWS_S3_BUCKET=rightfit-photos-prod
AWS_S3_CERTIFICATES_BUCKET=rightfit-certificates-prod

# Email (Resend - Production)
RESEND_API_KEY=<PRODUCTION_KEY>
RESEND_FROM_EMAIL=noreply@rightfitservices.co.uk

# SMS (Twilio - Production)
TWILIO_ACCOUNT_SID=<PRODUCTION_SID>
TWILIO_AUTH_TOKEN=<PRODUCTION_TOKEN>
TWILIO_PHONE_NUMBER=<UK_PHONE_NUMBER>

# Push Notifications (Expo)
EXPO_ACCESS_TOKEN=<PRODUCTION_TOKEN>

# AI (Google Vision - Production)
GOOGLE_CLOUD_PROJECT_ID=<PROJECT_ID>
GOOGLE_CLOUD_VISION_KEY=<PRODUCTION_KEY>

# Stripe (Production)
STRIPE_SECRET_KEY=<PRODUCTION_SECRET_KEY>
STRIPE_WEBHOOK_SECRET=<WEBHOOK_SECRET>
STRIPE_PUBLISHABLE_KEY=<PRODUCTION_PUBLISHABLE_KEY>

# Monitoring
SENTRY_DSN=<PRODUCTION_DSN>
```

#### Environment Variable Management
- [ ] Generate new JWT secrets (NEVER reuse dev secrets):
  ```bash
  openssl rand -base64 64
  ```
- [ ] Store all secrets in password manager (1Password, LastPass)
- [ ] Configure secrets in hosting provider dashboard
- [ ] **NEVER commit production secrets to Git**
- [ ] Create `.env.production.template` with placeholder values
- [ ] Document how to rotate secrets

---

### 7. Web App Deployment

**Status:** ❌ Not Started
**Deadline:** November 11, 2025
**Priority:** 🔴 CRITICAL

#### Build & Deploy
- [ ] Build production bundle:
  ```bash
  cd apps/web
  pnpm build
  ```
- [ ] Deploy to hosting:
  - [ ] **If Vercel:** Connect GitHub repo, auto-deploy on push
  - [ ] **If AWS S3 + CloudFront:** Upload to S3, invalidate cache
- [ ] Configure environment variables:
  ```env
  VITE_API_URL=https://api.rightfitservices.co.uk
  VITE_STRIPE_PUBLISHABLE_KEY=<PRODUCTION_KEY>
  ```
- [ ] Verify web app loads: `https://app.rightfitservices.co.uk`
- [ ] Test authentication flow end-to-end

#### CDN Configuration
- [ ] Configure CDN (CloudFront or Vercel Edge):
  - [ ] Cache static assets (max-age: 1 year)
  - [ ] Gzip/Brotli compression enabled
  - [ ] Cache invalidation on deploy
- [ ] Test global CDN performance (use webpagetest.org)

---

## Security Hardening (Sprint 6 Week 2)

### 8. API Security

**Status:** ⚠️ Partial
**Deadline:** November 11, 2025
**Priority:** 🔴 CRITICAL

#### Install Security Packages
```bash
cd apps/api
pnpm add helmet express-rate-limit class-validator class-transformer
```

#### Implement Security Headers (Helmet.js)
- [ ] Add Helmet middleware to Express app:
  ```typescript
  import helmet from 'helmet';
  app.use(helmet());
  ```
- [ ] Configure Content-Security-Policy
- [ ] Enable XSS protection
- [ ] Disable X-Powered-By header
- [ ] Verify headers: https://securityheaders.com

#### Rate Limiting
- [ ] Add rate limiting to ALL endpoints:
  ```typescript
  import rateLimit from 'express-rate-limit';

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per IP
  });

  app.use('/api/', limiter);
  ```
- [ ] Stricter limits on auth endpoints:
  - Login: 5 attempts per 15 min
  - Register: 3 attempts per hour
  - Password reset: 3 attempts per hour

#### Request Validation
- [ ] Add validation middleware:
  ```typescript
  import { validate } from 'class-validator';
  ```
- [ ] Validate all request bodies against schemas
- [ ] Sanitize user inputs (prevent XSS, SQL injection)
- [ ] Limit request body size (10 MB max)

#### CORS Configuration
- [ ] Restrict CORS to production domains only:
  ```typescript
  app.use(cors({
    origin: [
      'https://app.rightfitservices.co.uk',
      'https://rightfitservices.co.uk'
    ],
    credentials: true
  }));
  ```

---

### 9. Database Security

**Status:** ❌ Not Started
**Deadline:** November 11, 2025
**Priority:** 🟡 HIGH

- [ ] Enable SSL/TLS for database connections
- [ ] Use connection pooling (PgBouncer if self-hosted)
- [ ] Limit database user permissions (no DROP/CREATE)
- [ ] Enable query logging for audit trail
- [ ] Configure max connection limit
- [ ] Set up read replicas (optional for MVP, Phase 2)

---

### 10. Third-Party Service API Keys (Production)

**Status:** ⚠️ Some Dev Keys Active
**Deadline:** November 8, 2025
**Priority:** 🔴 CRITICAL

#### Replace ALL Dev Keys with Production Keys

**Stripe (Payment Processing)**
- [ ] Create Stripe production account
- [ ] Complete business verification (1-2 days)
- [ ] Get production API keys
- [ ] Configure webhook endpoint: `https://api.rightfitservices.co.uk/api/webhooks/stripe`
- [ ] Test webhook with Stripe CLI
- [ ] Create subscription products (Basic, Pro, Enterprise)

**AWS S3 (File Storage)**
- [ ] Create production S3 buckets:
  - `rightfit-photos-prod`
  - `rightfit-certificates-prod`
- [ ] Create production IAM user with S3-only permissions
- [ ] Generate new access keys
- [ ] Configure bucket CORS policy
- [ ] Enable versioning (optional)
- [ ] Set lifecycle policy (archive > 90 days to Glacier)

**Resend (Email)**
- [ ] Upgrade to paid plan: $10/month (10,000 emails)
- [ ] Verify production domain: `rightfitservices.co.uk`
- [ ] Configure DKIM, SPF, DMARC records
- [ ] Get production API key
- [ ] Test email deliverability (Gmail, Outlook, Yahoo)

**Twilio (SMS)**
- [ ] Verify production account
- [ ] Purchase UK phone number (£1/month)
- [ ] Get production credentials
- [ ] Add production callback URL
- [ ] Test SMS delivery to UK numbers

**Google Cloud Vision (AI)**
- [ ] Create production GCP project
- [ ] Enable Vision API
- [ ] Set up billing (pay-as-you-go)
- [ ] Get production API key
- [ ] Set usage quotas (1,000 requests/day)

**Expo (Push Notifications)**
- [ ] Create production Expo account
- [ ] Generate production push credentials
- [ ] Configure APNs (iOS) - requires Apple Developer account
- [ ] Configure FCM (Android) - requires Firebase project
- [ ] Test push on physical devices

---

## Monitoring & Observability (Sprint 6 Week 2)

### 11. Error Tracking (Sentry)

**Status:** ❌ Not Started
**Deadline:** November 11, 2025
**Priority:** 🔴 CRITICAL

#### Setup Sentry
- [ ] Create Sentry account (free tier: 5k errors/month)
- [ ] Create 3 projects:
  - `rightfit-api-prod`
  - `rightfit-web-prod`
  - `rightfit-mobile-prod`
- [ ] Install Sentry SDKs:
  ```bash
  # API
  pnpm add @sentry/node

  # Web
  pnpm add @sentry/react

  # Mobile
  pnpm add @sentry/react-native
  ```

#### Configure Sentry (API)
- [ ] Initialize Sentry in `apps/api/src/index.ts`:
  ```typescript
  import * as Sentry from '@sentry/node';

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: 'production',
    tracesSampleRate: 0.1, // 10% performance monitoring
  });
  ```
- [ ] Add Sentry error handler middleware (LAST middleware)
- [ ] Test by throwing test error

#### Configure Sentry (Web)
- [ ] Initialize in `apps/web/src/main.tsx`
- [ ] Enable React error boundary
- [ ] Configure source maps upload

#### Configure Sentry (Mobile)
- [ ] Initialize in `App.tsx`
- [ ] Enable native crash reporting
- [ ] Test on physical devices

#### Alert Configuration
- [ ] Create alert rule: New error types
- [ ] Create alert rule: Error spike (10x normal)
- [ ] Create alert rule: Critical errors (500 errors)
- [ ] Configure email notifications
- [ ] Configure Slack integration (optional)

---

### 12. Uptime Monitoring (UptimeRobot)

**Status:** ❌ Not Started
**Deadline:** November 11, 2025
**Priority:** 🔴 CRITICAL

#### Setup UptimeRobot
- [ ] Create UptimeRobot account (free tier: 50 monitors)
- [ ] Create HTTP monitor:
  - URL: `https://api.rightfitservices.co.uk/health`
  - Interval: 5 minutes
  - Alert threshold: Down for 2 minutes
- [ ] Create additional monitors:
  - Web app: `https://app.rightfitservices.co.uk`
  - API auth: `https://api.rightfitservices.co.uk/api/auth/health`

#### Alert Configuration
- [ ] Add email alert contact
- [ ] Add SMS alert contact (optional, paid)
- [ ] Configure Slack webhook (optional)

#### Public Status Page
- [ ] Create public status page: `status.rightfitservices.co.uk`
- [ ] Add all monitors to status page
- [ ] Customize branding
- [ ] Share status page URL in docs

---

### 13. Application Monitoring (Optional - Post-MVP)

**Status:** ❌ Not Started
**Priority:** 🟢 LOW (Phase 2)

- [ ] Configure CloudWatch Logs (AWS only)
- [ ] Set up log aggregation (Logtail, Papertrail)
- [ ] Create CloudWatch Dashboards
- [ ] Configure alerts:
  - API CPU > 80% for 10 minutes
  - Database CPU > 80% for 10 minutes
  - Disk space < 20%
  - Memory usage > 90%

---

### 14. Analytics (Optional - Post-MVP)

**Status:** ❌ Not Started
**Priority:** 🟢 LOW (Nice to have)

#### Web Analytics
- [ ] Choose analytics provider:
  - [ ] Google Analytics 4 (free)
  - [ ] Plausible (privacy-focused, $9/month)
- [ ] Add tracking script to web app
- [ ] Configure goals/conversions:
  - User registration
  - Property created
  - Work order created
  - Subscription purchased

#### API Analytics (Optional)
- [ ] Track API usage by tenant
- [ ] Monitor API response times
- [ ] Track most-used endpoints

---

## CI/CD Pipeline (Sprint 6 Week 2)

### 15. GitHub Actions

**Status:** ❌ Not Started
**Deadline:** November 15, 2025
**Priority:** 🟡 HIGH

#### API Deployment Pipeline
- [ ] Create `.github/workflows/deploy-api.yml`:
  ```yaml
  name: Deploy API
  on:
    push:
      branches: [main]
      paths:
        - 'apps/api/**'

  jobs:
    deploy:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v3
        - uses: actions/setup-node@v3
          with:
            node-version: '20'
        - run: npm install -g pnpm
        - run: pnpm install
        - run: pnpm --filter api build
        - run: pnpm --filter api test
        # Deploy step depends on hosting provider
  ```

#### Web Deployment Pipeline
- [ ] Create `.github/workflows/deploy-web.yml`
- [ ] Configure automatic deployment on merge to `main`
- [ ] Add build caching for faster deploys

#### Secrets Configuration
- [ ] Add GitHub Secrets:
  - `DATABASE_URL`
  - `JWT_SECRET`
  - All production API keys
- [ ] Configure deployment secrets per hosting provider

#### Testing in CI
- [ ] Run tests on every PR
- [ ] Block merge if tests fail
- [ ] Run linting checks
- [ ] Check TypeScript compilation

---

## Mobile App Deployment (Sprint 6 Week 3)

### 16. EAS Builds (Expo Application Services)

**Status:** ❌ Not Started
**Deadline:** November 18, 2025
**Priority:** 🔴 CRITICAL

#### EAS Setup
- [ ] Install EAS CLI:
  ```bash
  npm install -g eas-cli
  ```
- [ ] Login to Expo account:
  ```bash
  eas login
  ```
- [ ] Configure EAS build:
  ```bash
  cd apps/mobile
  eas build:configure
  ```

#### iOS Build
- [ ] Enroll in Apple Developer Program ($99/year)
- [ ] Create App ID in Apple Developer portal
- [ ] Generate provisioning profile
- [ ] Create iOS build:
  ```bash
  eas build --platform ios --profile production
  ```
- [ ] Download IPA file
- [ ] Test on physical iPhone device

#### Android Build
- [ ] Create Android build:
  ```bash
  eas build --platform android --profile production
  ```
- [ ] Generate signed APK/AAB
- [ ] Test on physical Android device

---

### 17. App Store Submission (iOS)

**Status:** ❌ Not Started
**Deadline:** November 20, 2025
**Priority:** 🔴 CRITICAL

#### Prepare Assets
- [ ] App icon (1024x1024 PNG, no transparency)
- [ ] Launch screens (use Expo splash screen generator)
- [ ] Screenshots (iPhone 6.7", 6.5", 5.5")
  - Minimum: 3 screenshots
  - Recommended: 5-8 screenshots showing key features
- [ ] App preview video (optional, 15-30 seconds)

#### App Store Connect
- [ ] Create app listing in App Store Connect
- [ ] Fill in app information:
  - Name: "RightFit Services"
  - Subtitle: "Property Maintenance Made Easy"
  - Description: (200-300 words highlighting key features)
  - Keywords: property, maintenance, landlord, compliance, work orders
  - Category: Productivity or Business
- [ ] Upload screenshots
- [ ] Add privacy policy URL: `https://rightfitservices.co.uk/privacy`
- [ ] Add terms of service URL: `https://rightfitservices.co.uk/terms`
- [ ] Submit for review

#### App Review Preparation
- [ ] Create test account credentials (for Apple reviewers)
- [ ] Provide app demo instructions
- [ ] Explain any special features (offline mode)
- [ ] Estimated review time: 2-5 days

---

### 18. Google Play Submission (Android)

**Status:** ❌ Not Started
**Deadline:** November 20, 2025
**Priority:** 🔴 CRITICAL

#### Google Play Console Setup
- [ ] Create Google Play Developer account ($25 one-time fee)
- [ ] Create app listing
- [ ] Fill in app information:
  - Title: "RightFit Services"
  - Short description (80 chars): "Manage property maintenance offline"
  - Full description: (4,000 chars, similar to iOS)
  - Category: Productivity
- [ ] Upload screenshots (phone + tablet)
- [ ] Feature graphic (1024x500)
- [ ] Upload APK/AAB

#### Content Rating
- [ ] Complete content rating questionnaire
- [ ] Target age: 18+ (business app)

#### Privacy & Security
- [ ] Privacy policy URL
- [ ] Data safety form (what data is collected)
- [ ] Declare use of permissions (camera, storage, network)

#### Submit for Review
- [ ] Submit to closed testing track first
- [ ] Test with 5-10 beta users
- [ ] Submit to production after testing
- [ ] Estimated review time: 1-2 days

---

## Legal & Compliance (Sprint 6 Week 2-3)

### 19. Legal Documents

**Status:** ❌ Not Started
**Deadline:** November 15, 2025
**Priority:** 🔴 CRITICAL

#### Privacy Policy
- [ ] Generate privacy policy using template:
  - https://www.termsfeed.com/privacy-policy-generator/
  - https://www.freeprivacypolicy.com/
- [ ] Include sections:
  - Data collected (email, name, property data, photos)
  - How data is used
  - Data retention policy
  - User rights (GDPR)
  - Third-party services (Stripe, Twilio, AWS)
  - Cookies policy
- [ ] Publish at: `https://rightfitservices.co.uk/privacy`
- [ ] Link from app footer and app stores

#### Terms of Service
- [ ] Generate terms using template
- [ ] Include sections:
  - Service description
  - User responsibilities
  - Payment terms
  - Subscription cancellation policy
  - Liability limitations
  - Dispute resolution
- [ ] Publish at: `https://rightfitservices.co.uk/terms`

#### Cookie Policy
- [ ] List all cookies used
- [ ] Explain purpose of each cookie
- [ ] Provide opt-out instructions
- [ ] Publish at: `https://rightfitservices.co.uk/cookies`

#### Acceptable Use Policy (Optional)
- [ ] Define prohibited activities
- [ ] Consequences of violations
- [ ] Publish at: `https://rightfitservices.co.uk/acceptable-use`

---

### 20. GDPR Compliance

**Status:** ❌ Not Started
**Deadline:** November 15, 2025
**Priority:** 🔴 CRITICAL

#### User Rights Implementation
- [ ] Right to access: API endpoint for data export
  ```typescript
  GET /api/user/export-data
  // Returns JSON with all user data
  ```
- [ ] Right to deletion: API endpoint to delete account
  ```typescript
  DELETE /api/user/account
  // Soft delete user + cascade to related data
  ```
- [ ] Right to rectification: Allow users to edit all personal data
- [ ] Right to portability: Export data in JSON format

#### Consent Management
- [ ] Cookie consent banner on web app
- [ ] Explicit consent for marketing emails
- [ ] Opt-in for push notifications (already implemented)

#### Data Processing Agreement
- [ ] Document data processors (AWS, Stripe, Twilio)
- [ ] Ensure all processors are GDPR compliant
- [ ] Maintain list of sub-processors

#### ICO Registration (UK)
- [ ] Determine if ICO registration required (£40-60/year)
  - Required if processing personal data as primary business
- [ ] Register with ICO if needed: https://ico.org.uk/

---

## Testing & QA (Sprint 6 Week 3)

### 21. Pre-Launch Testing

**Status:** ⚠️ Partial (Dev only)
**Deadline:** November 18, 2025
**Priority:** 🔴 CRITICAL

#### API Testing
- [ ] Test all endpoints with production data
- [ ] Load test: 100 concurrent users (use Artillery or k6)
- [ ] Stress test: Find breaking point
- [ ] Test rate limiting works correctly
- [ ] Test error responses (4xx, 5xx)

#### Web App Testing
- [ ] Test in Chrome, Firefox, Safari, Edge
- [ ] Test on mobile browsers (iOS Safari, Chrome Mobile)
- [ ] Test responsive design (320px to 2560px)
- [ ] Lighthouse audit (aim for 90+ score)
- [ ] Accessibility audit (WCAG 2.1 AA)

#### Mobile App Testing
- [ ] Test on physical iPhone (iOS 14+)
- [ ] Test on physical Android (Android 10+)
- [ ] Test offline mode thoroughly:
  - Create work order offline
  - Take photos offline
  - Sync when back online
  - Handle sync conflicts
- [ ] Test push notifications on real devices
- [ ] Test app in low/no signal areas

#### End-to-End User Flows
- [ ] User registration → email verification → login
- [ ] Create property → add work order → assign contractor
- [ ] Upload photo → AI quality check → view in gallery
- [ ] Subscribe to paid plan → payment success → access features
- [ ] Certificate expiry reminder → push notification → view certificate

#### Security Testing
- [ ] SQL injection testing (use SQLMap)
- [ ] XSS testing
- [ ] CSRF testing
- [ ] Authentication bypass attempts
- [ ] Rate limiting bypass attempts
- [ ] Run OWASP ZAP scan

---

### 22. Beta Testing

**Status:** ❌ Not Started
**Deadline:** November 22, 2025
**Priority:** 🟡 HIGH

#### Recruit Beta Users
- [ ] Target: 10-20 beta users
- [ ] Criteria: UK landlords managing 3-20 properties
- [ ] Incentive: Free for 6 months + direct support

#### Beta Testing Channels
- [ ] UK landlord Facebook groups
- [ ] Reddit r/UKLandlords
- [ ] Local property investor meetups (Birmingham)
- [ ] Friends/family who are landlords

#### Beta Testing Process
- [ ] Create beta testing guide document
- [ ] Provide test accounts (or allow self-registration)
- [ ] Create WhatsApp group for beta testers
- [ ] Conduct 1:1 onboarding calls (30 min each)
- [ ] Collect feedback via:
  - Google Forms survey
  - Weekly check-ins
  - Bug reports (GitHub Issues or Sentry)

#### Success Metrics
- [ ] 15+ beta users actively using app weekly
- [ ] <5 critical bugs reported
- [ ] NPS score >20
- [ ] Positive testimonials collected (3-5)

---

## Launch Preparation (Sprint 6 Week 4)

### 23. Launch Day Checklist

**Status:** ❌ Not Started
**Target Date:** November 25, 2025
**Priority:** 🔴 CRITICAL

#### Pre-Launch (1 Week Before)
- [ ] Final code freeze (no new features)
- [ ] Smoke test entire platform
- [ ] Verify all monitoring working
- [ ] Verify all backups working
- [ ] Prepare rollback plan
- [ ] Create launch announcement email
- [ ] Prepare social media posts

#### Launch Day Morning
- [ ] Check all services are running
- [ ] Verify uptime monitors green
- [ ] Check Sentry for any overnight errors
- [ ] Monitor CloudWatch/logs
- [ ] Standby for support requests

#### Launch Announcement
- [ ] Email beta users (convert to paid with discount code)
- [ ] Post in UK landlord Facebook groups
- [ ] Post on Reddit r/UKLandlords
- [ ] LinkedIn announcement
- [ ] Twitter/X announcement
- [ ] Local PR (Birmingham Post, property newsletters)

#### Post-Launch (First 24 Hours)
- [ ] Monitor error rates (Sentry)
- [ ] Monitor uptime (UptimeRobot)
- [ ] Monitor server resources (CPU, memory, disk)
- [ ] Respond to user questions (<2 hour response time)
- [ ] Fix critical bugs immediately
- [ ] Track sign-ups and conversions

---

### 24. Support & Maintenance

**Status:** ❌ Not Started
**Priority:** 🟡 HIGH

#### Support Channels
- [ ] Create support email: support@rightfitservices.co.uk
- [ ] Set up support ticket system (optional: Zendesk, Freshdesk)
- [ ] Create FAQ page on website
- [ ] Add in-app help documentation

#### On-Call Plan
- [ ] Define on-call schedule (founder = 24/7 for first month)
- [ ] Set up phone alerts for critical errors
- [ ] Define SLA: Critical bugs fixed within 24 hours
- [ ] Prepare escalation contacts (hosting provider, database provider)

#### Incident Response Plan
- [ ] Document incident response procedure:
  1. Acknowledge incident (<15 min)
  2. Investigate and diagnose
  3. Implement fix or workaround
  4. Monitor for resolution
  5. Post-mortem (for major incidents)
- [ ] Create incident template
- [ ] Test incident response with simulated outage

---

## Cost Management

### 25. Budget Tracking

**Status:** ⚠️ Estimated Only
**Priority:** 🟡 HIGH

#### Monthly Operating Costs (Estimated)

| Service | Tier | Cost/Month | Purpose |
|---------|------|------------|---------|
| **Hosting** | ||||
| Vercel | Pro | $20 | Web + API |
| Railway | Starter | $20 | PostgreSQL |
| **OR** DigitalOcean | App Platform | $60 | Web + API + DB |
| **Services** | ||||
| Resend | Paid | $10 | 10k emails/month |
| Twilio SMS | PAYG | $5-20 | Pay per SMS |
| AWS S3 | Standard | $5 | 100 GB storage |
| Sentry | Team | $26 | Error tracking |
| Stripe | Free | 2.9%+30¢ | Per transaction |
| Domain | Annual | $1 | Amortized |
| **Total** || **$87-127/month** | Excluding transactions |

#### Budget Alerts
- [ ] Set up billing alerts at $50, $100, $150
- [ ] Review costs weekly for first month
- [ ] Optimize unnecessary spending

#### Break-Even Analysis
- At £25/month per customer: Need **4 customers** to break even
- Target: 50-100 customers by Month 6 = £1,250-2,500 revenue

---

## Final Sign-Off

### 26. Go/No-Go Decision

**Decision Date:** November 22, 2025
**Decision Maker:** Founder + Developer

#### Criteria for GO Decision

- [ ] ✅ Sprint 6 complete (payment processing working)
- [ ] ✅ Production infrastructure deployed and tested
- [ ] ✅ Monitoring operational (Sentry + UptimeRobot)
- [ ] ✅ SSL/TLS configured (all HTTPS)
- [ ] ✅ All production API keys active
- [ ] ✅ Mobile apps submitted to stores (pending approval OK)
- [ ] ✅ Legal documents published (Privacy, Terms)
- [ ] ✅ Beta testing completed (10+ active users)
- [ ] ✅ <5 critical bugs open
- [ ] ✅ Uptime >99% during beta period

**If 8/10 criteria met:** GO for launch ✅
**If 6-7/10 criteria met:** CONDITIONAL GO (accept known risks) ⚠️
**If <6/10 criteria met:** NO-GO (delay launch 1-2 weeks) ❌

---

**DECISION:** _________________________
**SIGNATURE:** _________________________
**DATE:** _________________________

---

## Post-Launch (First 30 Days)

### 27. Week 1 Monitoring

- [ ] Daily health checks (morning + evening)
- [ ] Monitor Sentry errors (<10/day acceptable)
- [ ] Monitor uptime (target: >99.5%)
- [ ] Respond to all support requests (<4 hours)
- [ ] Fix critical bugs within 24 hours

### 28. Week 2-4 Optimization

- [ ] Collect user feedback (surveys, interviews)
- [ ] Analyze usage patterns (most-used features)
- [ ] Identify and fix UX friction points
- [ ] Optimize slow API endpoints
- [ ] Plan Phase 2 features based on feedback

---

**Document Version:** 1.0
**Last Updated:** October 29, 2025
**Next Review:** November 8, 2025 (after Sprint 6 kickoff)
**Owner:** Developer + Founder
