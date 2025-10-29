# Revised Sprint 6 Execution Plan - With Pre-Production Features

**Status**: Ready for Implementation
**Total Duration**: 4 weeks
**Target Launch**: December 6, 2025

---

## Overview

This revised plan incorporates the 2 critical features identified in the pre-production review:
1. **Week 1**: Financial Dashboard + Tenant Management (30 hours)
2. **Week 2**: Payment Processing (50 hours)
3. **Week 3**: Production Infrastructure (36 hours)
4. **Week 4**: Launch Preparation (28 hours)

**Total Effort**: 144 hours (18 days at 8 hours/day)

---

## Week 1: November 4-8, 2025 (Pre-Production Features)

### Objective
Implement critical platform gaps before payment processing

**Total Hours**: 30
**Stories**: 9 (Financial: 4, Tenant: 5)
**Story Points**: 30

### User Stories

#### US-FIN-1: Income/Expense Tracking (6h)
- Database schema: FinancialTransaction model
- API: CRUD endpoints for transactions
- Web: Transaction management page
- Mobile: Financial tab with transaction list
- Receipt upload to S3

**API Endpoints:**
```bash
POST   /api/financial/transactions
GET    /api/financial/transactions
PATCH  /api/financial/transactions/:id
DELETE /api/financial/transactions/:id
```

**Acceptance:**
✅ Can record income (rent received)
✅ Can record expenses with receipts
✅ Transactions filtered by property
✅ Offline support on mobile

---

#### US-FIN-2: Property P&L Report (5h)
- P&L calculation logic
- API endpoint for reports
- Web: Dashboard with charts
- Mobile: Summary cards + charts

**API Endpoints:**
```bash
GET /api/financial/reports/property/:id?startDate=xxx&endDate=xxx
GET /api/financial/reports/overview
```

**Acceptance:**
✅ Shows income/expenses/profit per property
✅ Visual charts (bar + pie)
✅ Date range filter
✅ Multi-property comparison

---

#### US-FIN-3: Tax Export (2h)
- CSV export endpoint
- Web: Export button
- Mobile: Share sheet export

**API Endpoints:**
```bash
GET /api/financial/export?propertyId=xxx&startDate=xxx&endDate=xxx
```

**Acceptance:**
✅ Exports filtered transactions to CSV
✅ UK tax return format
✅ Includes receipts URLs

---

#### US-FIN-4: Budget & Alerts (2h)
- PropertyBudget model
- Budget check cron job
- Alert service integration
- Dashboard budget widget

**Acceptance:**
✅ Set monthly budget per property
✅ Alert at 80% threshold
✅ Alert when exceeded
✅ Dashboard shows budget status

---

#### US-TEN-1: Tenant CRUD (5h)
- Database schema: PropertyTenant model
- API: CRUD endpoints
- Web: Tenant management page
- Mobile: Tenants tab

**API Endpoints:**
```bash
POST   /api/tenants
GET    /api/tenants
GET    /api/tenants/:id
PATCH  /api/tenants/:id
DELETE /api/tenants/:id
```

**Acceptance:**
✅ Can add tenant with name, contact, dates, rent
✅ Can assign to property
✅ Can mark as active/inactive
✅ View tenant list and details
✅ Offline support on mobile

---

#### US-TEN-2: Lease Expiry Alerts (3h)
- Lease expiry cron job
- Alert at 60/30/0 days before expiry
- Dashboard widget for upcoming expirations

**Acceptance:**
✅ Daily check for expiring leases
✅ Push + email notifications
✅ Dashboard shows upcoming expirations
✅ Can mark lease as renewed

---

#### US-TEN-3: Tenant Work Order Association (2h)
- Add propertyTenantId to WorkOrder model
- Update work order forms
- Filter work orders by tenant

**Acceptance:**
✅ Work order can be linked to tenant
✅ Tenant detail shows their work orders
✅ Work order list shows tenant name

---

#### US-TEN-4: Rent Payment Tracking (3h)
- RentPayment model
- Payment recording API
- Overdue rent detection
- Dashboard overdue widget

**API Endpoints:**
```bash
POST /api/tenants/:id/payments
GET  /api/tenants/:id/payments
GET  /api/tenants/overdue-rent
```

**Acceptance:**
✅ Record rent payments
✅ View payment history
✅ Alert on overdue rent
✅ Dashboard shows overdue list

---

#### US-TEN-5: Mobile Tenant Management (2h)
- WatermelonDB schema for tenants
- Offline CRUD operations
- Sync queue integration

**Acceptance:**
✅ Create/edit tenants offline
✅ Sync to server when online
✅ Conflict resolution

---

### Week 1 Deliverables

**Backend:**
- ✅ 2 new Prisma models (FinancialTransaction, PropertyTenant, RentPayment, PropertyBudget)
- ✅ 15 new API endpoints
- ✅ 2 cron jobs (lease expiry, budget checks)
- ✅ CSV export functionality
- ✅ Receipt upload to S3

**Web:**
- ✅ Financial Dashboard page
- ✅ Tenant Management page
- ✅ Budget widgets on dashboard
- ✅ Lease expiry widgets

**Mobile:**
- ✅ Finances tab (new 5th tab)
- ✅ Tenants tab (new 6th tab)
- ✅ WatermelonDB sync for new models
- ✅ Offline CRUD

**Testing:**
- ✅ 30+ unit tests
- ✅ Integration tests for new endpoints
- ✅ E2E tests for critical flows

---

## Week 2: November 11-15, 2025 (Payment Processing)

### Objective
Implement Stripe subscription payment system

**Total Hours**: 50
**Stories**: 6
**Story Points**: 50

### User Stories

#### US-PAY-1: Stripe Integration (12h)
- Install Stripe SDK
- Create StripeService class
- Implement customer creation
- Implement checkout session creation
- Webhook endpoint for events
- Database schema updates (stripeCustomerId, etc.)

**Acceptance:**
✅ Can create Stripe customer for tenant
✅ Can create checkout session
✅ Webhook receives payment events
✅ Events stored in database

**Code:**
```typescript
// apps/api/src/services/StripeService.ts
import Stripe from 'stripe';

export class StripeService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2024-11-20.acacia',
    });
  }

  async createCustomer(email: string, name: string, tenantId: string): Promise<string> {
    const customer = await this.stripe.customers.create({
      email,
      name,
      metadata: { tenantId },
    });
    return customer.id;
  }

  async createCheckoutSession(
    customerId: string,
    priceId: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<string> {
    const session = await this.stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
    });
    return session.url!;
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    await this.stripe.subscriptions.cancel(subscriptionId);
  }
}
```

**Database Schema:**
```prisma
model Tenant {
  // ... existing fields
  stripeCustomerId     String?   @unique
  stripeSubscriptionId String?   @unique
  stripePriceId        String?
  subscriptionStatus   SubscriptionStatus @default(TRIAL)
  trialEndsAt          DateTime?
  subscriptionEndsAt   DateTime?
  subscriptionStartedAt DateTime?
}

enum SubscriptionStatus {
  TRIAL
  ACTIVE
  CANCELED
  PAST_DUE
  EXPIRED
}
```

**API Endpoints:**
```bash
POST /api/payments/create-checkout-session
POST /api/webhooks/stripe
GET  /api/payments/subscription-status
POST /api/payments/cancel-subscription
POST /api/payments/reactivate-subscription
```

---

#### US-PAY-2: Subscription Plans (8h)
- Define 3 subscription tiers
- Create Stripe products & prices
- Plan comparison page
- Usage limit enforcement

**Plans:**
```typescript
export const SUBSCRIPTION_PLANS = {
  STARTER: {
    name: 'Starter',
    price: '£9.99/month',
    stripePriceId: process.env.STRIPE_PRICE_STARTER,
    limits: {
      properties: 5,
      workOrders: 50,
      storage: '1 GB',
    },
  },
  PROFESSIONAL: {
    name: 'Professional',
    price: '£19.99/month',
    stripePriceId: process.env.STRIPE_PRICE_PROFESSIONAL,
    limits: {
      properties: 20,
      workOrders: 200,
      storage: '5 GB',
    },
  },
  ENTERPRISE: {
    name: 'Enterprise',
    price: '£49.99/month',
    stripePriceId: process.env.STRIPE_PRICE_ENTERPRISE,
    limits: {
      properties: -1, // unlimited
      workOrders: -1,
      storage: '50 GB',
    },
  },
};
```

**Acceptance:**
✅ Plans display on pricing page
✅ Can select plan during checkout
✅ Plan limits enforced in API
✅ Can upgrade/downgrade plan

---

#### US-PAY-3: Billing Dashboard (10h)
- Web: Billing settings page
- Mobile: Billing screen
- Display current plan
- Display payment history
- Upgrade/downgrade buttons
- Cancel subscription flow

**Acceptance:**
✅ Shows current subscription status
✅ Shows next billing date
✅ Shows payment history (from Stripe)
✅ Can upgrade plan
✅ Can cancel subscription (confirm dialog)

---

#### US-PAY-4: Webhook Handler (8h)
- Stripe webhook endpoint
- Event verification (signature)
- Handle events:
  - checkout.session.completed
  - customer.subscription.updated
  - customer.subscription.deleted
  - invoice.payment_succeeded
  - invoice.payment_failed
- Update database on events
- Send notifications

**Code:**
```typescript
// apps/api/src/controllers/webhookController.ts
import Stripe from 'stripe';

export async function handleStripeWebhook(req: Request, res: Response) {
  const sig = req.headers['stripe-signature'];
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data.object);
      break;
    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object);
      break;
    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object);
      break;
    case 'invoice.payment_failed':
      await handlePaymentFailed(event.data.object);
      break;
  }

  res.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;

  await prisma.tenant.update({
    where: { stripeCustomerId: customerId },
    data: {
      stripeSubscriptionId: subscriptionId,
      subscriptionStatus: 'ACTIVE',
      subscriptionStartedAt: new Date(),
    },
  });

  // Send welcome email
  await emailService.sendSubscriptionConfirmation(customerId);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  await prisma.tenant.update({
    where: { stripeCustomerId: customerId },
    data: { subscriptionStatus: 'PAST_DUE' },
  });

  // Send payment failed email
  await emailService.sendPaymentFailedAlert(customerId);
}
```

**Acceptance:**
✅ Webhook signature verified
✅ All events handled correctly
✅ Database updated on subscription changes
✅ Notifications sent on payment events

---

#### US-PAY-5: Payment Testing (6h)
- Stripe test mode setup
- Test card numbers
- Test all flows:
  - Successful subscription
  - Failed payment
  - Cancellation
  - Upgrade/downgrade
- Write automated tests

**Test Cases:**
```typescript
describe('Stripe Integration', () => {
  it('should create checkout session', async () => {
    const session = await stripeService.createCheckoutSession(
      'cus_test123',
      'price_test123',
      'https://app.rightfit.com/success',
      'https://app.rightfit.com/cancel'
    );

    expect(session).toContain('checkout.stripe.com');
  });

  it('should handle successful payment webhook', async () => {
    const event = {
      type: 'checkout.session.completed',
      data: { object: mockCheckoutSession },
    };

    await handleStripeWebhook(event);

    const tenant = await prisma.tenant.findUnique({
      where: { stripeCustomerId: 'cus_test123' },
    });

    expect(tenant.subscriptionStatus).toBe('ACTIVE');
  });

  it('should enforce usage limits', async () => {
    // Create tenant with STARTER plan (5 properties max)
    const tenant = await createTenant({ plan: 'STARTER' });

    // Create 5 properties
    for (let i = 0; i < 5; i++) {
      await createProperty(tenant.id);
    }

    // Try to create 6th property - should fail
    await expect(createProperty(tenant.id)).rejects.toThrow(
      'Property limit reached'
    );
  });
});
```

**Acceptance:**
✅ All payment flows tested
✅ Test mode works correctly
✅ Automated tests pass
✅ Error handling verified

---

#### US-PAY-6: Usage Limits Enforcement (6h)
- Middleware to check limits
- Property creation limit check
- Work order creation limit check
- Storage limit check
- Upgrade prompt when limit reached

**Code:**
```typescript
// apps/api/src/middleware/usageLimits.ts
export async function checkPropertyLimit(req: Request, res: Response, next: NextFunction) {
  const tenantId = req.user.tenantId;

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: { _count: { select: { properties: true } } },
  });

  const plan = SUBSCRIPTION_PLANS[tenant.subscriptionStatus];
  const limit = plan.limits.properties;

  if (limit !== -1 && tenant._count.properties >= limit) {
    return res.status(403).json({
      error: 'Property limit reached',
      message: `Your ${plan.name} plan allows ${limit} properties. Please upgrade to add more.`,
      upgradeUrl: '/billing/upgrade',
    });
  }

  next();
}

// Apply to routes
app.post('/api/properties', checkPropertyLimit, createProperty);
```

**Acceptance:**
✅ Property creation blocked when limit reached
✅ Work order creation blocked when limit reached
✅ File upload blocked when storage full
✅ User shown upgrade prompt

---

### Week 2 Deliverables

**Backend:**
- ✅ Stripe integration complete
- ✅ Webhook handler deployed
- ✅ Subscription management API
- ✅ Usage limit middleware

**Web:**
- ✅ Pricing page
- ✅ Billing dashboard
- ✅ Checkout flow
- ✅ Upgrade/cancel flows

**Mobile:**
- ✅ Billing screen
- ✅ Plan selection
- ✅ Subscription status display

**Testing:**
- ✅ 20+ payment flow tests
- ✅ Webhook integration tests
- ✅ Usage limit tests

---

## Week 3: November 18-22, 2025 (Production Infrastructure)

### Objective
Set up production hosting, monitoring, and security

**Total Hours**: 36
**Stories**: 6
**Story Points**: 36

### User Stories

#### US-INFRA-1: Hosting Setup (8h)
- Domain registration (rightfit.services)
- DNS configuration
- Deploy API to Railway
- Deploy web to Vercel
- SSL certificates
- Environment variables

**Checklist:**
- [ ] Register domain
- [ ] Configure DNS: api.rightfit.services, app.rightfit.services
- [ ] Deploy API to Railway
- [ ] Deploy web to Vercel
- [ ] Verify SSL/TLS
- [ ] Test HTTPS

---

#### US-INFRA-2: Production Database (6h)
- Provision PostgreSQL on Railway
- Run production migrations
- Set up automated backups
- Connection pooling (PgBouncer)

**Checklist:**
- [ ] Provision 2GB PostgreSQL instance
- [ ] Run migrations: `npx prisma migrate deploy`
- [ ] Configure daily backups
- [ ] Set up connection pooling
- [ ] Test database connection

---

#### US-INFRA-3: Security Hardening (8h)
- Install Helmet.js
- Configure CORS
- Rate limiting (express-rate-limit)
- Input validation (Joi)
- Security headers

**Code:**
```typescript
// apps/api/src/middleware/security.ts
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';

// Helmet for security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));

// CORS
app.use(cors({
  origin: [
    'https://app.rightfit.services',
    'https://www.rightfit.services',
  ],
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per IP
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 login attempts per 15 minutes
  skipSuccessfulRequests: true,
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
```

**Acceptance:**
✅ Security headers configured
✅ Rate limiting active
✅ CORS restricted to production domains
✅ Input validation on all endpoints

---

#### US-INFRA-4: CI/CD Pipeline (8h)
- GitHub Actions workflow
- Automated testing on PR
- Deploy to staging on merge to `develop`
- Deploy to production on merge to `main`

**GitHub Actions:**
```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Run tests
        run: pnpm test

      - name: Build
        run: pnpm build

  deploy-staging:
    needs: test
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Railway (Staging)
        run: |
          curl -X POST ${{ secrets.RAILWAY_STAGING_WEBHOOK }}

  deploy-production:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Railway (Production)
        run: |
          curl -X POST ${{ secrets.RAILWAY_PROD_WEBHOOK }}

      - name: Deploy to Vercel (Production)
        run: |
          npx vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

**Acceptance:**
✅ Tests run on every PR
✅ Auto-deploy to staging on develop merge
✅ Auto-deploy to production on main merge
✅ Deployment notifications in Slack

---

#### US-MONITOR-1: Error Tracking (4h)
- Install Sentry SDK
- Configure error reporting
- Set up source maps
- Configure alerts

**Code:**
```typescript
// apps/api/src/index.ts
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Express({ app }),
  ],
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());

// ... routes

app.use(Sentry.Handlers.errorHandler());
```

```typescript
// apps/web/src/main.tsx
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  environment: process.env.VITE_ENV,
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay(),
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

**Acceptance:**
✅ Errors reported to Sentry
✅ Source maps uploaded
✅ Alerts configured (email + Slack)
✅ Error grouping working

---

#### US-MONITOR-2: Uptime Monitoring (2h)
- Configure UptimeRobot
- Monitor API health endpoint
- Monitor web app
- Set up alerts

**Endpoints to Monitor:**
- https://api.rightfit.services/health (every 5 min)
- https://app.rightfit.services (every 5 min)

**Alerts:**
- Email + SMS when down
- Alert after 2 consecutive failures

**Acceptance:**
✅ Uptime checks configured
✅ Alerts working
✅ Status page available (optional)

---

### Week 3 Deliverables

**Infrastructure:**
- ✅ Production API deployed (Railway)
- ✅ Production web deployed (Vercel)
- ✅ Production database (Railway PostgreSQL)
- ✅ SSL/TLS configured
- ✅ DNS configured

**Security:**
- ✅ Helmet.js security headers
- ✅ Rate limiting active
- ✅ CORS restricted
- ✅ Input validation

**CI/CD:**
- ✅ GitHub Actions pipeline
- ✅ Automated testing
- ✅ Automated deployments

**Monitoring:**
- ✅ Sentry error tracking
- ✅ UptimeRobot monitoring
- ✅ Alerts configured

---

## Week 4: November 25 - December 6, 2025 (Launch Preparation)

### Objective
Final testing, mobile app deployment, legal compliance, beta launch

**Total Hours**: 28
**Stories**: 5
**Story Points**: 28

### User Stories

#### US-MOBILE-1: EAS Production Builds (8h)
- Configure EAS production profile
- Build iOS (App Store)
- Build Android (Play Store)
- Test builds on physical devices

**EAS Configuration:**
```json
// eas.json
{
  "build": {
    "production": {
      "android": {
        "buildType": "app-bundle",
        "gradleCommand": ":app:bundleRelease"
      },
      "ios": {
        "buildConfiguration": "Release",
        "scheme": "RightFitServices"
      },
      "env": {
        "NODE_ENV": "production"
      }
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json",
        "track": "internal"
      },
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "1234567890"
      }
    }
  }
}
```

**Acceptance:**
✅ Production build successful
✅ No build errors
✅ App launches on physical devices
✅ All features functional

---

#### US-MOBILE-2: App Store Submissions (6h)
- Create App Store listing (iOS)
- Create Play Store listing (Android)
- Prepare screenshots (5.5", 6.5", iPad, Android)
- Write app descriptions
- Submit for review

**App Store Checklist:**
- [ ] App name: RightFit Services
- [ ] App icon (1024x1024)
- [ ] Screenshots (5 per size)
- [ ] App description (4000 chars max)
- [ ] Keywords
- [ ] Privacy policy URL
- [ ] Support URL
- [ ] Submit for review

**Play Store Checklist:**
- [ ] App name: RightFit Services
- [ ] Short description (80 chars)
- [ ] Full description (4000 chars)
- [ ] Screenshots (2-8 per device type)
- [ ] Feature graphic (1024x500)
- [ ] App icon (512x512)
- [ ] Privacy policy URL
- [ ] Submit for review

**Acceptance:**
✅ iOS app submitted to App Store
✅ Android app submitted to Play Store
✅ No rejection on initial review

---

#### US-LEGAL-1: Legal Documents (4h)
- Write Privacy Policy
- Write Terms of Service
- Write Cookie Policy
- GDPR compliance review
- Add legal pages to web app

**Checklist:**
- [ ] Privacy Policy (GDPR compliant)
- [ ] Terms of Service
- [ ] Cookie Policy
- [ ] Data Processing Agreement (for enterprise)
- [ ] Legal pages on website
- [ ] Cookie consent banner

**Acceptance:**
✅ All legal documents published
✅ GDPR compliant
✅ Cookie consent working

---

#### US-TEST-1: Production Testing (6h)
- End-to-end testing in production
- Payment flow testing (real Stripe)
- Mobile app testing (TestFlight/Internal Track)
- Performance testing
- Security audit

**Test Checklist:**
- [ ] User registration flow
- [ ] User login flow
- [ ] Property management (CRUD)
- [ ] Work order management (CRUD)
- [ ] Tenant management (CRUD)
- [ ] Financial tracking (CRUD)
- [ ] Payment subscription flow
- [ ] Mobile offline sync
- [ ] Notifications (push + email)
- [ ] File uploads (certificates, receipts)
- [ ] Multi-tenant isolation
- [ ] Performance (< 2s page load)
- [ ] Security (no vulnerabilities)

**Acceptance:**
✅ All critical flows tested
✅ No critical bugs
✅ Performance acceptable
✅ Security audit passed

---

#### US-LAUNCH-1: Beta Launch (4h)
- Invite 10 beta users
- Send onboarding emails
- Monitor for issues
- Collect feedback
- Create feedback loop (Typeform/Google Forms)

**Beta User Criteria:**
- UK-based landlords
- 2-5 properties
- Willing to provide feedback
- Active property maintenance needs

**Launch Day:**
- [ ] Send beta invites
- [ ] Monitor Sentry for errors
- [ ] Monitor server performance
- [ ] Be available for support
- [ ] Collect feedback

**Acceptance:**
✅ 10 beta users invited
✅ 50%+ sign up
✅ No critical issues during launch
✅ Feedback collection active

---

### Week 4 Deliverables

**Mobile:**
- ✅ Production builds created
- ✅ iOS app in App Store review
- ✅ Android app in Play Store review
- ✅ TestFlight/Internal Track available

**Legal:**
- ✅ Privacy Policy published
- ✅ Terms of Service published
- ✅ Cookie consent banner
- ✅ GDPR compliant

**Testing:**
- ✅ Production testing complete
- ✅ All critical flows working
- ✅ Performance acceptable
- ✅ Security audit passed

**Launch:**
- ✅ Beta users invited
- ✅ Monitoring active
- ✅ Feedback loop established

---

## Summary Timeline

| Week | Dates | Focus | Hours | Stories |
|------|-------|-------|-------|---------|
| 1 | Nov 4-8 | Financial + Tenant Features | 30 | 9 |
| 2 | Nov 11-15 | Payment Processing | 50 | 6 |
| 3 | Nov 18-22 | Production Infrastructure | 36 | 6 |
| 4 | Nov 25-Dec 6 | Launch Preparation | 28 | 5 |
| **Total** | | | **144** | **26** |

---

## Risk Management

### High Priority Risks

**Risk 1: Stripe Integration Complexity**
- **Mitigation**: Start with test mode, thorough webhook testing, use Stripe CLI for local testing
- **Contingency**: If blocked, launch with "Request Demo" instead of self-service signup

**Risk 2: App Store Rejection**
- **Mitigation**: Follow guidelines strictly, test on physical devices, prepare screenshots carefully
- **Contingency**: Respond quickly to feedback, have 2-week buffer for resubmission

**Risk 3: Production Infrastructure Issues**
- **Mitigation**: Deploy to staging first, load testing, monitoring from day 1
- **Contingency**: Have Railway/Vercel support contacts ready, rollback plan prepared

**Risk 4: Time Overrun**
- **Mitigation**: Daily progress tracking, identify blockers early, ask for help
- **Contingency**: Reduce scope (e.g., launch without mobile apps initially, web-only)

---

## Success Metrics

### Week 1 (Financial + Tenant)
- [ ] All 9 user stories completed
- [ ] Zero critical bugs
- [ ] 100% test coverage for new features
- [ ] Manual testing passed

### Week 2 (Payments)
- [ ] Stripe integration working end-to-end
- [ ] Test payment successful
- [ ] Webhook events processed correctly
- [ ] Usage limits enforced

### Week 3 (Infrastructure)
- [ ] API deployed to production
- [ ] Web app deployed to production
- [ ] Monitoring active (Sentry + UptimeRobot)
- [ ] 99.9% uptime during testing

### Week 4 (Launch)
- [ ] Mobile apps submitted
- [ ] 10 beta users invited
- [ ] 50%+ beta user signups
- [ ] < 5 critical bugs reported
- [ ] Positive feedback from beta users

---

## Go/No-Go Decision Criteria

Before launch, ALL criteria must be met:

**Technical:**
- [x] All automated tests passing
- [x] Manual testing complete
- [x] Production deployment successful
- [x] Monitoring configured
- [x] Backup system working

**Business:**
- [x] Legal documents published
- [x] Payment processing working
- [x] Customer support email set up
- [x] Onboarding email flow ready

**Security:**
- [x] Security audit passed
- [x] HTTPS configured
- [x] Rate limiting active
- [x] Input validation on all endpoints

**Performance:**
- [x] < 2s average page load
- [x] < 500ms API response time (P95)
- [x] Mobile app responsive

**Quality:**
- [x] Zero critical bugs
- [x] < 5 high-priority bugs (documented, acceptable)
- [x] User feedback positive (qualitative)

---

## Post-Launch Plan

### Week 1 After Launch (December 9-13)
- Monitor Sentry errors daily
- Respond to user feedback within 24 hours
- Fix critical bugs immediately
- Collect usage analytics

### Week 2 After Launch (December 16-20)
- Analyze user behavior
- Prioritize feature requests
- Plan Sprint 7 (based on feedback)
- Expand beta to 25 users

### Month 2 (January 2026)
- Public launch (remove beta status)
- Marketing campaign
- App Store optimization
- Iterate based on user data

---

## Resources & Costs

### Development Tools (Free)
- GitHub (free tier)
- Sentry (free tier - 5k errors/month)
- UptimeRobot (free tier - 50 monitors)

### Infrastructure (Monthly)
- Railway API + Database: $20-30
- Vercel Web: $20 (Hobby plan)
- AWS S3: $5-10
- Domain: $12/year = $1/month
- **Total: ~$46-61/month**

### Services (Monthly)
- Resend Email: $20 (10k emails/month)
- Twilio SMS: $10-20 (usage-based)
- Expo Push: Free
- **Total: ~$30-40/month**

### App Stores (One-time + Annual)
- Apple Developer: $99/year
- Google Play: $25 one-time
- **Total: $124 first year, $99/year after**

**Total Operating Cost: $76-101/month + $124 one-time**

---

## Contact & Support

**Questions during implementation?**
- Review this plan first
- Check existing documentation in `/docs`
- Consult [PRODUCTION_DEPLOYMENT_CHECKLIST.md](../../PRODUCTION_DEPLOYMENT_CHECKLIST.md)
- Ask in team chat

**Blockers?**
- Document the blocker
- Identify alternatives
- Escalate if > 4 hours stuck

**Ready to launch?**
- Complete Go/No-Go checklist
- Get team approval
- Execute Week 4 launch plan

---

## Appendix: Package Dependencies

### New Packages Required

```json
{
  "dependencies": {
    "stripe": "^14.0.0",
    "express-rate-limit": "^7.1.0",
    "helmet": "^7.1.0",
    "@sentry/node": "^7.85.0",
    "@sentry/react": "^7.85.0",
    "@sentry/react-native": "^5.15.0",
    "json2csv": "^6.0.0",
    "joi": "^17.11.0",
    "recharts": "^2.10.0"
  },
  "devDependencies": {
    "@types/stripe": "^8.0.417",
    "@types/json2csv": "^5.0.7"
  }
}
```

---

**Next Steps:** Proceed with Week 1 implementation starting November 4, 2025. Create feature branch `feature/pre-sprint-6-financial-tenant`, implement according to [PRE_SPRINT_6_FEATURES.md](./PRE_SPRINT_6_FEATURES.md).
