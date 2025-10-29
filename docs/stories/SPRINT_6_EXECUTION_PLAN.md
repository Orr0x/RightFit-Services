# Sprint 6: Payments, Infrastructure & Launch - Execution Plan

**Sprint Duration:** 2-3 weeks (November 4 - November 25, 2025)
**Sprint Goal:** "MVP is production-ready with payment processing, deployed infrastructure, and ready for beta launch"
**Total Story Points:** 90 points (53 original + 37 infrastructure)
**Recommended Timeline:** 3 weeks @ 30 hours/week = 90 hours

---

## Executive Summary

This is the **FINAL SPRINT** before MVP launch. Sprint 6 focuses on:
1. **Payments** - Stripe integration for monetization
2. **Infrastructure** - Production deployment configuration
3. **Security** - Hardening for production traffic
4. **Monitoring** - Error tracking and uptime monitoring
5. **Mobile Deployment** - App store submissions
6. **Launch Preparation** - Beta testing and go-live

**Critical Success Factors:**
- Payment processing must work flawlessly (no revenue without this)
- Production infrastructure must be stable (99.5%+ uptime target)
- Monitoring must be operational before launch (cannot operate blind)

---

## Sprint 6 Timeline (3-Week Plan)

```
┌─────────────────────────────────────────────────────────────────┐
│ Week 1: Payments (Nov 4-8)          │ 40-60 hours              │
│ ├─ US-PAY-1: Stripe Integration     │ 12 hours                 │
│ ├─ US-PAY-2: Subscription Plans     │ 8 hours                  │
│ ├─ US-PAY-3: Billing Dashboard      │ 10 hours                 │
│ ├─ US-PAY-4: Webhook Handler        │ 8 hours                  │
│ ├─ US-PAY-5: Payment Testing        │ 6 hours                  │
│ └─ US-PAY-6: Usage Limits           │ 6 hours                  │
├─────────────────────────────────────────────────────────────────┤
│ Week 2: Infrastructure (Nov 11-15)  │ 30-40 hours              │
│ ├─ US-INFRA-1: Hosting Setup        │ 8 hours                  │
│ ├─ US-INFRA-2: Database Production  │ 6 hours                  │
│ ├─ US-INFRA-3: Security Hardening   │ 8 hours                  │
│ ├─ US-INFRA-4: CI/CD Pipeline       │ 8 hours                  │
│ ├─ US-MONITOR-1: Sentry Setup       │ 4 hours                  │
│ └─ US-MONITOR-2: UptimeRobot        │ 2 hours                  │
├─────────────────────────────────────────────────────────────────┤
│ Week 3: Launch Prep (Nov 18-22)     │ 20-30 hours              │
│ ├─ US-MOBILE-1: EAS Builds          │ 8 hours                  │
│ ├─ US-MOBILE-2: App Store Submit    │ 6 hours                  │
│ ├─ US-LEGAL-1: Legal Documents      │ 4 hours                  │
│ ├─ US-TEST-1: Production Testing    │ 6 hours                  │
│ └─ US-LAUNCH-1: Beta Launch         │ 4 hours                  │
└─────────────────────────────────────────────────────────────────┘

Total Effort: 90-130 hours (Realistic: 3 weeks @ 30 hrs/week)
```

---

## Week 1: Payment Processing (November 4-8)

### 🎯 Week 1 Goal
**"Users can subscribe to paid plans and manage their subscriptions"**

By end of Week 1, Stripe checkout works, webhooks process payments, and billing dashboard shows subscription status.

---

### US-PAY-1: Stripe Integration

**Story ID:** US-PAY-1
**Priority:** 🔴 CRITICAL
**Story Points:** 12
**Estimated Time:** 12 hours
**Dependencies:** None
**Blocked By:** None

#### User Story
**As a** founder
**I want** Stripe integrated for subscription payments
**So that** I can monetize the platform

#### Acceptance Criteria

##### AC1: Stripe Account Setup
- [ ] Create Stripe account (use founder's business info)
- [ ] Complete business verification (1-2 business days)
- [ ] Enable production mode
- [ ] Generate test API keys (for development)
- [ ] Generate production API keys (keep secure!)

##### AC2: Install Stripe SDK
```bash
cd apps/api
pnpm add stripe
```

##### AC3: Create Stripe Service
File: `apps/api/src/services/StripeService.ts`

```typescript
import Stripe from 'stripe';

export class StripeService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2023-10-16',
    });
  }

  async createCustomer(email: string, name: string): Promise<string> {
    const customer = await this.stripe.customers.create({
      email,
      name,
      metadata: {
        source: 'rightfit-services',
      },
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
      metadata: {
        customerId,
      },
    });
    return session.url!;
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    await this.stripe.subscriptions.cancel(subscriptionId);
  }
}
```

##### AC4: Update Database Schema
Add Stripe fields to `Tenant` model:

```prisma
model Tenant {
  // ... existing fields
  stripeCustomerId     String?   @unique
  stripeSubscriptionId String?   @unique
  stripePriceId        String?
  subscriptionStatus   SubscriptionStatus @default(TRIAL)
  trialEndsAt          DateTime?
  subscriptionEndsAt   DateTime?
}

enum SubscriptionStatus {
  TRIAL
  ACTIVE
  CANCELED
  PAST_DUE
  EXPIRED
}
```

Run migration:
```bash
npx prisma migrate dev --name add_stripe_fields
```

##### AC5: Create Stripe Customer on Registration
Update `AuthService.register()`:

```typescript
// After creating tenant
const stripeCustomerId = await stripeService.createCustomer(
  user.email,
  tenant.name
);

await prisma.tenant.update({
  where: { id: tenant.id },
  data: { stripeCustomerId },
});
```

##### AC6: Environment Variables
Add to `.env`:
```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

#### Edge Cases
1. **Stripe API down:** Return 503 Service Unavailable, retry with exponential backoff
2. **Customer already exists:** Check if customer exists before creating new one
3. **Network timeout:** Set 30 second timeout, show user-friendly error

#### Testing Checklist
- [ ] Create Stripe customer successfully
- [ ] Customer ID stored in database
- [ ] Test with Stripe test card: `4242 4242 4242 4242`
- [ ] Error handling: Invalid API key shows clear error
- [ ] Stripe dashboard shows customer created

#### Definition of Done
- [ ] Stripe SDK installed and configured
- [ ] StripeService created with customer management
- [ ] Database schema updated with Stripe fields
- [ ] Customers created automatically on registration
- [ ] Tests pass
- [ ] Code reviewed
- [ ] Environment variables documented

---

### US-PAY-2: Subscription Plans

**Story ID:** US-PAY-2
**Priority:** 🔴 CRITICAL
**Story Points:** 8
**Estimated Time:** 8 hours
**Dependencies:** US-PAY-1
**Blocked By:** US-PAY-1

#### User Story
**As a** landlord
**I want** to choose between subscription plans (Basic, Pro, Enterprise)
**So that** I can select the plan that fits my needs

#### Acceptance Criteria

##### AC1: Create Products in Stripe Dashboard
Navigate to Stripe Dashboard → Products:

**Product 1: Basic Plan**
- Name: "Basic"
- Description: "For landlords managing up to 5 properties"
- Pricing: £15/month (recurring)
- Features metadata:
  - `max_properties`: 5
  - `max_users`: 1
  - `max_work_orders`: 50
  - `support`: "Email"

**Product 2: Pro Plan**
- Name: "Pro"
- Description: "For landlords managing up to 25 properties"
- Pricing: £25/month (recurring)
- Features metadata:
  - `max_properties`: 25
  - `max_users`: 5
  - `max_work_orders`: 250
  - `support`: "Priority Email + Phone"

**Product 3: Enterprise Plan**
- Name: "Enterprise"
- Description: "For property management companies"
- Pricing: £50/month (recurring)
- Features metadata:
  - `max_properties`: 100
  - `max_users`: 20
  - `max_work_orders`: 1000
  - `support`: "Dedicated Account Manager"

##### AC2: Store Price IDs
After creating products, copy Price IDs:
```env
STRIPE_PRICE_BASIC=price_1ABC...
STRIPE_PRICE_PRO=price_2DEF...
STRIPE_PRICE_ENTERPRISE=price_3GHI...
```

##### AC3: Create Pricing API Endpoint
File: `apps/api/src/routes/billing.ts`

```typescript
import { Router } from 'express';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.get('/pricing', (req, res) => {
  res.json({
    plans: [
      {
        id: 'basic',
        name: 'Basic',
        price: 15,
        currency: 'GBP',
        interval: 'month',
        stripePriceId: process.env.STRIPE_PRICE_BASIC,
        features: {
          maxProperties: 5,
          maxUsers: 1,
          maxWorkOrders: 50,
          support: 'Email',
        },
      },
      {
        id: 'pro',
        name: 'Pro',
        price: 25,
        currency: 'GBP',
        interval: 'month',
        stripePriceId: process.env.STRIPE_PRICE_PRO,
        features: {
          maxProperties: 25,
          maxUsers: 5,
          maxWorkOrders: 250,
          support: 'Priority Email + Phone',
        },
        popular: true,
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        price: 50,
        currency: 'GBP',
        interval: 'month',
        stripePriceId: process.env.STRIPE_PRICE_ENTERPRISE,
        features: {
          maxProperties: 100,
          maxUsers: 20,
          maxWorkOrders: 1000,
          support: 'Dedicated Account Manager',
        },
      },
    ],
  });
});

export default router;
```

##### AC4: Mount Billing Routes
In `apps/api/src/index.ts`:
```typescript
import billingRoutes from './routes/billing';
app.use('/api/billing', billingRoutes);
```

#### Testing Checklist
- [ ] GET /api/billing/pricing returns all 3 plans
- [ ] Price IDs match Stripe dashboard
- [ ] Features correctly reflect plan limits
- [ ] Response format is valid JSON

#### Definition of Done
- [ ] 3 products created in Stripe
- [ ] Price IDs stored in environment variables
- [ ] Pricing endpoint returns plan details
- [ ] Tests pass
- [ ] Code reviewed

---

### US-PAY-3: Billing Dashboard

**Story ID:** US-PAY-3
**Priority:** 🔴 CRITICAL
**Story Points:** 10
**Estimated Time:** 10 hours
**Dependencies:** US-PAY-2
**Blocked By:** US-PAY-2

#### User Story
**As a** landlord
**I want** to view my subscription status and billing information
**So that** I can manage my account

#### Acceptance Criteria

##### AC1: Create Checkout Session Endpoint
File: `apps/api/src/routes/billing.ts`

```typescript
router.post('/create-checkout', authenticateJWT, async (req, res) => {
  try {
    const { priceId } = req.body;
    const userId = req.user!.id;

    // Get user's tenant and Stripe customer ID
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { tenant: true },
    });

    if (!user?.tenant?.stripeCustomerId) {
      return res.status(400).json({ error: 'No Stripe customer found' });
    }

    // Create checkout session
    const stripeService = new StripeService();
    const sessionUrl = await stripeService.createCheckoutSession(
      user.tenant.stripeCustomerId,
      priceId,
      `${process.env.WEB_URL}/billing/success`,
      `${process.env.WEB_URL}/billing/cancel`
    );

    res.json({ url: sessionUrl });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});
```

##### AC2: Get Current Subscription Endpoint
```typescript
router.get('/subscription', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user!.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { tenant: true },
    });

    const tenant = user?.tenant;

    res.json({
      status: tenant?.subscriptionStatus || 'TRIAL',
      plan: tenant?.stripePriceId,
      trialEndsAt: tenant?.trialEndsAt,
      subscriptionEndsAt: tenant?.subscriptionEndsAt,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch subscription' });
  }
});
```

##### AC3: Create Billing Dashboard (Web App)
File: `apps/web/src/pages/BillingPage.tsx`

```typescript
import { useEffect, useState } from 'react';
import { api } from '../services/api';

export default function BillingPage() {
  const [subscription, setSubscription] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [subRes, plansRes] = await Promise.all([
      api.get('/billing/subscription'),
      api.get('/billing/pricing'),
    ]);
    setSubscription(subRes.data);
    setPlans(plansRes.data.plans);
  };

  const handleSubscribe = async (priceId: string) => {
    const res = await api.post('/billing/create-checkout', { priceId });
    window.location.href = res.data.url; // Redirect to Stripe Checkout
  };

  return (
    <div>
      <h1>Billing & Subscription</h1>

      {subscription?.status === 'TRIAL' && (
        <div>
          <p>Trial ends: {new Date(subscription.trialEndsAt).toLocaleDateString()}</p>
          <p>Choose a plan to continue using RightFit Services</p>
        </div>
      )}

      {subscription?.status === 'ACTIVE' && (
        <div>
          <p>Current Plan: {subscription.plan}</p>
          <p>Next billing date: {new Date(subscription.subscriptionEndsAt).toLocaleDateString()}</p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
        {plans.map((plan) => (
          <div key={plan.id} style={{ border: '1px solid #ccc', padding: '20px' }}>
            <h2>{plan.name}</h2>
            <p style={{ fontSize: '32px', fontWeight: 'bold' }}>
              £{plan.price}/month
            </p>
            <ul>
              <li>Up to {plan.features.maxProperties} properties</li>
              <li>{plan.features.maxUsers} user{plan.features.maxUsers > 1 ? 's' : ''}</li>
              <li>{plan.features.maxWorkOrders} work orders</li>
              <li>{plan.features.support} support</li>
            </ul>
            <button onClick={() => handleSubscribe(plan.stripePriceId)}>
              Subscribe
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

##### AC4: Add Billing Route
In `apps/web/src/App.tsx`:
```typescript
<Route path="/billing" element={<BillingPage />} />
```

#### Testing Checklist
- [ ] Billing page displays 3 plans correctly
- [ ] Click "Subscribe" redirects to Stripe Checkout
- [ ] Subscription status shows correctly
- [ ] Trial countdown displays correctly

#### Definition of Done
- [ ] Checkout session endpoint working
- [ ] Subscription status endpoint working
- [ ] Billing dashboard UI complete
- [ ] Stripe Checkout flow tested
- [ ] Code reviewed

---

### US-PAY-4: Stripe Webhook Handler

**Story ID:** US-PAY-4
**Priority:** 🔴 CRITICAL
**Story Points:** 8
**Estimated Time:** 8 hours
**Dependencies:** US-PAY-3
**Blocked By:** US-PAY-3

#### User Story
**As a** system
**I want** to receive webhook events from Stripe
**So that** subscription status is automatically updated

#### Acceptance Criteria

##### AC1: Create Webhook Endpoint
File: `apps/api/src/routes/webhooks.ts`

```typescript
import { Router, raw } from 'express';
import Stripe from 'stripe';
import { prisma } from '../utils/prisma';

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// IMPORTANT: Use raw body parser for Stripe webhooks
router.post(
  '/stripe',
  raw({ type: 'application/json' }),
  async (req, res) => {
    const sig = req.headers['stripe-signature']!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutComplete(event.data.object);
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

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  }
);

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;

  // Update tenant subscription status
  await prisma.tenant.update({
    where: { stripeCustomerId: customerId },
    data: {
      stripeSubscriptionId: subscriptionId,
      subscriptionStatus: 'ACTIVE',
      trialEndsAt: null,
    },
  });

  console.log(`Subscription activated for customer: ${customerId}`);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  await prisma.tenant.update({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      subscriptionStatus: subscription.status === 'active' ? 'ACTIVE' : 'PAST_DUE',
      stripePriceId: subscription.items.data[0].price.id,
      subscriptionEndsAt: new Date(subscription.current_period_end * 1000),
    },
  });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  await prisma.tenant.update({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      subscriptionStatus: 'CANCELED',
    },
  });
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  // Send email notification to user
  console.log(`Payment failed for invoice: ${invoice.id}`);
}

export default router;
```

##### AC2: Mount Webhook Route
In `apps/api/src/index.ts`:
```typescript
import webhookRoutes from './routes/webhooks';

// IMPORTANT: Mount webhook route BEFORE bodyParser.json()
app.use('/api/webhooks', webhookRoutes);

app.use(express.json()); // Mount after webhooks
```

##### AC3: Configure Webhook in Stripe Dashboard
1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://api.rightfitservices.co.uk/api/webhooks/stripe`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
4. Copy webhook signing secret → `STRIPE_WEBHOOK_SECRET`

##### AC4: Test Webhook Locally
Install Stripe CLI:
```bash
stripe login
stripe listen --forward-to localhost:3001/api/webhooks/stripe
```

Trigger test events:
```bash
stripe trigger checkout.session.completed
```

#### Testing Checklist
- [ ] Webhook signature verification works
- [ ] Checkout complete updates subscription status
- [ ] Subscription updated event handled
- [ ] Payment failed event logged
- [ ] Stripe CLI test events processed

#### Definition of Done
- [ ] Webhook endpoint created
- [ ] All 4 event types handled
- [ ] Signature verification working
- [ ] Webhook configured in Stripe dashboard
- [ ] Tested with Stripe CLI
- [ ] Code reviewed

---

### US-PAY-5: Payment Testing

**Story ID:** US-PAY-5
**Priority:** 🔴 CRITICAL
**Story Points:** 6
**Estimated Time:** 6 hours
**Dependencies:** US-PAY-4

#### User Story
**As a** developer
**I want** to thoroughly test payment flows
**So that** no payment bugs reach production

#### Acceptance Criteria

##### AC1: Test Successful Payment Flow
1. [ ] Register new account (creates Stripe customer)
2. [ ] Navigate to billing page
3. [ ] Click "Subscribe" on Pro plan (£25/month)
4. [ ] Redirected to Stripe Checkout
5. [ ] Enter test card: `4242 4242 4242 4242`, 12/34, 123
6. [ ] Submit payment
7. [ ] Redirected to success page
8. [ ] Verify subscription status = ACTIVE in database
9. [ ] Verify webhook received and processed

##### AC2: Test Failed Payment
- [ ] Use declined card: `4000 0000 0000 0002`
- [ ] Verify error message shown
- [ ] Verify subscription status unchanged
- [ ] Verify no webhook processed

##### AC3: Test 3D Secure Card
- [ ] Use 3DS card: `4000 0025 0000 3155`
- [ ] Complete 3DS authentication
- [ ] Verify payment succeeds after auth

##### AC4: Test Subscription Cancellation
- [ ] Create active subscription
- [ ] Call Stripe API to cancel:
  ```typescript
  await stripeService.cancelSubscription(subscriptionId);
  ```
- [ ] Verify webhook updates status to CANCELED
- [ ] Verify user retains access until period end

##### AC5: Test Insufficient Funds
- [ ] Use card: `4000 0000 0000 9995`
- [ ] Verify declined message
- [ ] Verify fallback to email notification

##### AC6: Load Test Checkout
- [ ] Simulate 50 concurrent checkout sessions
- [ ] Verify all sessions created successfully
- [ ] Check Stripe API rate limits not hit

#### Testing Checklist
- [ ] All test cards work as expected
- [ ] Webhooks process within 5 seconds
- [ ] Database updates reflect payment status
- [ ] Error messages user-friendly
- [ ] No sensitive data logged

#### Definition of Done
- [ ] All 6 test scenarios pass
- [ ] Test results documented
- [ ] Edge cases identified and handled
- [ ] Stripe test mode fully validated

---

### US-PAY-6: Usage Limits Enforcement

**Story ID:** US-PAY-6
**Priority:** 🟡 HIGH
**Story Points:** 6
**Estimated Time:** 6 hours
**Dependencies:** US-PAY-2

#### User Story
**As a** system
**I want** to enforce subscription plan limits
**So that** users cannot exceed their plan's features

#### Acceptance Criteria

##### AC1: Create Limit Check Middleware
File: `apps/api/src/middleware/checkLimits.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';

export async function checkPropertyLimit(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const tenantId = req.user!.tenantId;

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: { _count: { select: { properties: true } } },
  });

  const limits = getPlanLimits(tenant?.stripePriceId);
  const currentCount = tenant?._count.properties || 0;

  if (currentCount >= limits.maxProperties) {
    return res.status(403).json({
      error: 'Property limit reached',
      message: `Your ${limits.planName} plan allows ${limits.maxProperties} properties. Upgrade to add more.`,
      upgradeUrl: '/billing',
    });
  }

  next();
}

function getPlanLimits(priceId?: string) {
  if (priceId === process.env.STRIPE_PRICE_BASIC) {
    return { planName: 'Basic', maxProperties: 5, maxUsers: 1, maxWorkOrders: 50 };
  } else if (priceId === process.env.STRIPE_PRICE_PRO) {
    return { planName: 'Pro', maxProperties: 25, maxUsers: 5, maxWorkOrders: 250 };
  } else if (priceId === process.env.STRIPE_PRICE_ENTERPRISE) {
    return { planName: 'Enterprise', maxProperties: 100, maxUsers: 20, maxWorkOrders: 1000 };
  } else {
    // Trial or free tier
    return { planName: 'Trial', maxProperties: 3, maxUsers: 1, maxWorkOrders: 10 };
  }
}
```

##### AC2: Apply Middleware to Property Routes
In `apps/api/src/routes/properties.ts`:
```typescript
import { checkPropertyLimit } from '../middleware/checkLimits';

router.post('/', authenticateJWT, checkPropertyLimit, async (req, res) => {
  // Create property logic
});
```

##### AC3: Display Limits in UI
In billing dashboard, show current usage:
```typescript
<div>
  <h3>Current Usage</h3>
  <p>Properties: {currentProperties} / {maxProperties}</p>
  <p>Users: {currentUsers} / {maxUsers}</p>
  <p>Work Orders: {currentWorkOrders} / {maxWorkOrders}</p>

  {currentProperties >= maxProperties && (
    <div style={{ color: 'red' }}>
      ⚠️ Property limit reached. <a href="/billing">Upgrade plan</a>
    </div>
  )}
</div>
```

#### Testing Checklist
- [ ] Creating property when at limit returns 403
- [ ] Error message clear and actionable
- [ ] Upgrade link works
- [ ] Limits enforced for all subscription tiers
- [ ] Trial limits work correctly

#### Definition of Done
- [ ] Limit check middleware created
- [ ] Applied to create property endpoint
- [ ] UI displays current usage
- [ ] Upgrade prompts shown when at limit
- [ ] Tests pass

---

## Week 2: Infrastructure & Monitoring (November 11-15)

### 🎯 Week 2 Goal
**"Production infrastructure is deployed, secured, and monitored"**

By end of Week 2, API and web app are deployed to production hosting, monitoring is operational, and security hardening is complete.

---

### US-INFRA-1: Production Hosting Setup

**Story ID:** US-INFRA-1
**Priority:** 🔴 CRITICAL
**Story Points:** 8
**Estimated Time:** 8 hours
**Dependencies:** Domain registered, hosting provider chosen

#### User Story
**As a** developer
**I want** production hosting configured
**So that** the application can be deployed

#### Acceptance Criteria

##### AC1: Choose Hosting Provider
Decision matrix completed (see PRODUCTION_DEPLOYMENT_CHECKLIST.md Section 1)

**Recommended: Vercel + Railway**
- Vercel: Web + API ($20/month)
- Railway: PostgreSQL ($20/month)
- Total: $40/month
- Pros: Easiest, automatic SSL, CDN included

##### AC2: Set Up Vercel (Web + API)
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Link project
cd apps/web
vercel link

cd apps/api
vercel link

# Deploy (will auto-deploy on git push to main)
vercel --prod
```

Configure `vercel.json`:
```json
{
  "version": 2,
  "builds": [
    { "src": "apps/web/package.json", "use": "@vercel/static-build" },
    { "src": "apps/api/package.json", "use": "@vercel/node" }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "apps/api/$1" },
    { "src": "/(.*)", "dest": "apps/web/$1" }
  ]
}
```

##### AC3: Set Up Railway (Database)
1. Go to railway.app → New Project
2. Provision PostgreSQL database
3. Copy `DATABASE_URL` connection string
4. Add to Vercel environment variables

##### AC4: Configure Environment Variables
In Vercel dashboard, add all production environment variables from PRODUCTION_DEPLOYMENT_CHECKLIST.md Section 6.

##### AC5: Test Deployment
- [ ] Access `https://app.rightfitservices.co.uk`
- [ ] Verify web app loads
- [ ] Test API health: `https://api.rightfitservices.co.uk/health`
- [ ] Verify returns `{"status":"ok"}`

#### Testing Checklist
- [ ] Web app accessible via HTTPS
- [ ] API health endpoint responds
- [ ] Database connection works
- [ ] Environment variables loaded correctly
- [ ] SSL certificate valid (A+ rating)

#### Definition of Done
- [ ] Hosting provider account created
- [ ] Web app deployed
- [ ] API deployed
- [ ] Database provisioned
- [ ] All services accessible via HTTPS
- [ ] Documentation updated with deployment URLs

---

### US-INFRA-2: Database Production Setup

**Story ID:** US-INFRA-2
**Priority:** 🔴 CRITICAL
**Story Points:** 6
**Estimated Time:** 6 hours
**Dependencies:** US-INFRA-1

#### User Story
**As a** developer
**I want** production database configured with backups
**So that** data is safe and recoverable

#### Acceptance Criteria

##### AC1: Run Production Migrations
```bash
# Set production DATABASE_URL
export DATABASE_URL="postgresql://user:pass@railway.app:5432/rightfit_prod"

# Run migrations
npx prisma migrate deploy

# Verify schema
npx prisma db pull
```

##### AC2: Configure Automated Backups
In Railway dashboard:
- [ ] Enable daily automated backups
- [ ] Retention: 7 days
- [ ] Backup time: 3 AM UTC (4 AM UK)

##### AC3: Test Backup Restoration
1. [ ] Create test backup manually
2. [ ] Restore to separate database
3. [ ] Verify data integrity
4. [ ] Document restoration steps

##### AC4: Configure Connection Pooling
Add to `DATABASE_URL`:
```
?connection_limit=10&pool_timeout=30
```

##### AC5: Set Up Monitoring
- [ ] Enable slow query logging (>1 second)
- [ ] Monitor connection count
- [ ] Alert if connections >80% of max

#### Testing Checklist
- [ ] Migrations applied successfully
- [ ] Backup created and restorable
- [ ] Connection pooling working
- [ ] Database accessible from API

#### Definition of Done
- [ ] Production database initialized
- [ ] Automated backups configured
- [ ] Backup restoration tested and documented
- [ ] Connection pooling enabled
- [ ] Monitoring configured

---

### US-INFRA-3: Security Hardening

**Story ID:** US-INFRA-3
**Priority:** 🔴 CRITICAL
**Story Points:** 8
**Estimated Time:** 8 hours
**Dependencies:** US-INFRA-1

#### User Story
**As a** developer
**I want** API secured for production traffic
**So that** the platform is protected from attacks

#### Acceptance Criteria

##### AC1: Install Security Packages
```bash
cd apps/api
pnpm add helmet express-rate-limit class-validator class-transformer
```

##### AC2: Add Helmet.js Security Headers
In `apps/api/src/index.ts`:
```typescript
import helmet from 'helmet';

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
```

##### AC3: Add Global Rate Limiting
```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per IP
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);
```

##### AC4: Stricter Limits on Auth Endpoints
```typescript
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 attempts per 15 min
  skipSuccessfulRequests: true,
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
```

##### AC5: Update CORS Configuration
```typescript
import cors from 'cors';

app.use(cors({
  origin: [
    'https://app.rightfitservices.co.uk',
    'https://rightfitservices.co.uk',
    process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : '',
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

##### AC6: Add Request Size Limits
```typescript
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
```

##### AC7: Verify Security Headers
Test with: https://securityheaders.com
Target score: A+

#### Testing Checklist
- [ ] Helmet headers present in response
- [ ] Rate limiting works (test with 101 requests)
- [ ] Auth endpoints rate limited correctly
- [ ] CORS blocks unauthorized origins
- [ ] Request size limit enforced
- [ ] Security score A+ on securityheaders.com

#### Definition of Done
- [ ] All security packages installed
- [ ] Helmet configured
- [ ] Rate limiting active on all endpoints
- [ ] CORS restricted to production domains
- [ ] Security audit passed
- [ ] Tests pass

---

### US-INFRA-4: CI/CD Pipeline

**Story ID:** US-INFRA-4
**Priority:** 🟡 HIGH
**Story Points:** 8
**Estimated Time:** 8 hours
**Dependencies:** US-INFRA-1

#### User Story
**As a** developer
**I want** automated deployment pipeline
**So that** deploys are fast, consistent, and safe

#### Acceptance Criteria

##### AC1: Create GitHub Actions Workflow (API)
File: `.github/workflows/deploy-api.yml`

```yaml
name: Deploy API to Production

on:
  push:
    branches: [main]
    paths:
      - 'apps/api/**'
      - 'packages/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install pnpm
        run: npm install -g pnpm

      - name: Install dependencies
        run: pnpm install

      - name: Run tests
        run: pnpm --filter api test

      - name: Build API
        run: pnpm --filter api build

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_API_PROJECT_ID }}
          vercel-args: '--prod'
```

##### AC2: Create GitHub Actions Workflow (Web)
File: `.github/workflows/deploy-web.yml`

Similar structure for web app deployment.

##### AC3: Configure GitHub Secrets
In GitHub repository settings → Secrets:
- [ ] `VERCEL_TOKEN`
- [ ] `VERCEL_ORG_ID`
- [ ] `VERCEL_API_PROJECT_ID`
- [ ] `VERCEL_WEB_PROJECT_ID`

##### AC4: Add PR Testing Workflow
File: `.github/workflows/test.yml`

```yaml
name: Run Tests

on: [pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm install -g pnpm
      - run: pnpm install
      - run: pnpm test
      - run: pnpm lint
```

##### AC5: Configure Branch Protection
In GitHub settings → Branches → Add rule for `main`:
- [ ] Require pull request reviews
- [ ] Require status checks to pass (tests, linting)
- [ ] Require branches to be up to date

#### Testing Checklist
- [ ] Push to main triggers deployment
- [ ] Tests run before deploy
- [ ] Failed tests block deployment
- [ ] PR checks run on every pull request
- [ ] Deployments visible in Vercel dashboard

#### Definition of Done
- [ ] CI/CD workflows created
- [ ] GitHub secrets configured
- [ ] Branch protection enabled
- [ ] Test deployment successful
- [ ] Documentation updated

---

### US-MONITOR-1: Sentry Error Tracking

**Story ID:** US-MONITOR-1
**Priority:** 🔴 CRITICAL
**Story Points:** 4
**Estimated Time:** 4 hours
**Dependencies:** US-INFRA-1

#### User Story
**As a** developer
**I want** real-time error tracking
**So that** I can fix production bugs quickly

#### Acceptance Criteria

##### AC1: Create Sentry Account
- [ ] Sign up at sentry.io
- [ ] Choose free tier (5k errors/month)
- [ ] Create 3 projects:
  - `rightfit-api-prod`
  - `rightfit-web-prod`
  - `rightfit-mobile-prod`

##### AC2: Install Sentry SDKs
```bash
# API
cd apps/api
pnpm add @sentry/node @sentry/profiling-node

# Web
cd apps/web
pnpm add @sentry/react

# Mobile
cd apps/mobile
pnpm add @sentry/react-native
```

##### AC3: Initialize Sentry (API)
In `apps/api/src/index.ts`:
```typescript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1, // 10% performance monitoring
  profilesSampleRate: 0.1,
});

// Must be AFTER all routes
app.use(Sentry.Handlers.errorHandler());
```

##### AC4: Initialize Sentry (Web)
In `apps/web/src/main.tsx`:
```typescript
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay(),
  ],
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

##### AC5: Initialize Sentry (Mobile)
In `apps/mobile/App.tsx`:
```typescript
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  enableNative: true,
  environment: 'production',
});
```

##### AC6: Configure Alerts
In Sentry dashboard:
- [ ] Alert rule: New error types → Email notification
- [ ] Alert rule: Error spike (10x) → Email + Slack
- [ ] Alert rule: Critical errors → Immediate email

##### AC7: Test Error Tracking
```typescript
// Throw test error
throw new Error('Sentry test error');
```

Verify error appears in Sentry dashboard within 30 seconds.

#### Testing Checklist
- [ ] Test error appears in Sentry
- [ ] Source maps working (shows original code)
- [ ] User context captured (user ID, email)
- [ ] Alert email received
- [ ] Performance monitoring working

#### Definition of Done
- [ ] Sentry configured for all 3 apps
- [ ] Errors captured successfully
- [ ] Alerts configured
- [ ] Test errors verified
- [ ] Documentation updated

---

### US-MONITOR-2: Uptime Monitoring

**Story ID:** US-MONITOR-2
**Priority:** 🔴 CRITICAL
**Story Points:** 2
**Estimated Time:** 2 hours
**Dependencies:** US-INFRA-1

#### User Story
**As a** developer
**I want** uptime monitoring
**So that** I know immediately if the API goes down

#### Acceptance Criteria

##### AC1: Create UptimeRobot Account
- [ ] Sign up at uptimerobot.com
- [ ] Free tier: 50 monitors, 5-min intervals

##### AC2: Create HTTP Monitors
Monitor 1: API Health
- URL: `https://api.rightfitservices.co.uk/health`
- Type: HTTP(s)
- Interval: 5 minutes
- Alert threshold: Down for 2 minutes

Monitor 2: Web App
- URL: `https://app.rightfitservices.co.uk`
- Type: HTTP(s)
- Interval: 5 minutes
- Keyword check: "RightFit Services"

Monitor 3: API Auth
- URL: `https://api.rightfitservices.co.uk/api/auth/health`
- Type: HTTP(s)
- Interval: 5 minutes

##### AC3: Configure Alert Contacts
- [ ] Add primary email
- [ ] Add Slack webhook (optional)
- [ ] Configure alert delays (down for 2+ minutes)

##### AC4: Create Public Status Page
- [ ] Enable public status page
- [ ] Customize URL: `status.rightfitservices.co.uk` (CNAME)
- [ ] Add all monitors to status page
- [ ] Customize branding (logo, colors)

##### AC5: Test Alerts
- [ ] Temporarily stop API
- [ ] Verify alert email received within 5 minutes
- [ ] Verify status page shows "Down"
- [ ] Restart API
- [ ] Verify "Up" alert received

#### Testing Checklist
- [ ] All 3 monitors created
- [ ] Alert email received on downtime
- [ ] Status page accessible publicly
- [ ] Status page updates correctly

#### Definition of Done
- [ ] UptimeRobot monitors configured
- [ ] Alerts working
- [ ] Public status page live
- [ ] Test alerts verified
- [ ] Status page URL shared in docs

---

## Week 3: Mobile Deployment & Launch (November 18-22)

### 🎯 Week 3 Goal
**"Mobile apps submitted, beta testing live, ready for launch"**

By end of Week 3, iOS and Android apps are submitted to stores, legal documents published, and beta testing underway.

---

### US-MOBILE-1: EAS Production Builds

**Story ID:** US-MOBILE-1
**Priority:** 🔴 CRITICAL
**Story Points:** 8
**Estimated Time:** 8 hours
**Dependencies:** None

#### User Story
**As a** developer
**I want** production mobile builds
**So that** apps can be submitted to stores

#### Acceptance Criteria

##### AC1: Install EAS CLI
```bash
npm install -g eas-cli
eas login
```

##### AC2: Configure EAS Build
```bash
cd apps/mobile
eas build:configure
```

This creates `eas.json`:
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

##### AC3: Update app.json
```json
{
  "expo": {
    "name": "RightFit Services",
    "slug": "rightfit-services",
    "version": "1.0.0",
    "ios": {
      "bundleIdentifier": "com.rightfitservices.app",
      "buildNumber": "1"
    },
    "android": {
      "package": "com.rightfitservices.app",
      "versionCode": 1
    }
  }
}
```

##### AC4: Create iOS Production Build
```bash
eas build --platform ios --profile production
```

This will:
- Upload code to EAS servers
- Build IPA file
- Take ~20-30 minutes

##### AC5: Create Android Production Build
```bash
eas build --platform android --profile production
```

This will:
- Upload code to EAS servers
- Build APK/AAB file
- Take ~15-20 minutes

##### AC6: Download and Test Builds
- [ ] Download iOS IPA from EAS dashboard
- [ ] Install on physical iPhone using Apple Configurator
- [ ] Test all critical flows
- [ ] Download Android APK/AAB
- [ ] Install on physical Android device
- [ ] Test all critical flows

#### Testing Checklist
- [ ] iOS build completes successfully
- [ ] Android build completes successfully
- [ ] Apps install on physical devices
- [ ] Offline mode works on builds
- [ ] Push notifications work
- [ ] API calls work (production endpoints)

#### Definition of Done
- [ ] iOS production build created
- [ ] Android production build created
- [ ] Both builds tested on physical devices
- [ ] No critical bugs found
- [ ] Build artifacts stored securely

---

### US-MOBILE-2: App Store Submissions

**Story ID:** US-MOBILE-2
**Priority:** 🔴 CRITICAL
**Story Points:** 6
**Estimated Time:** 6 hours
**Dependencies:** US-MOBILE-1, US-LEGAL-1 (privacy policy)

#### User Story
**As a** developer
**I want** apps submitted to App Store and Google Play
**So that** users can download from stores

#### Acceptance Criteria

##### AC1: Prepare App Assets
**App Icon:**
- [ ] 1024x1024 PNG (no transparency)
- [ ] Use design tool or Figma

**Screenshots:**
- [ ] iPhone 6.7" (3 minimum, 5 recommended)
- [ ] iPad Pro 12.9" (optional)
- [ ] Android phone + tablet

**Feature Graphic (Android):**
- [ ] 1024x500 PNG

##### AC2: Create App Store Connect Listing
1. [ ] Log in to App Store Connect
2. [ ] Create new app
3. [ ] Fill in information:
   - Name: RightFit Services
   - Subtitle: Property Maintenance Made Easy
   - Category: Productivity
   - Description: (300-400 words)
   - Keywords: property, maintenance, landlord, compliance, work orders, offline
4. [ ] Upload screenshots
5. [ ] Add privacy policy URL: `https://rightfitservices.co.uk/privacy`
6. [ ] Add support URL: `https://rightfitservices.co.uk/support`

##### AC3: Submit iOS App
- [ ] Upload IPA via Xcode or Transporter
- [ ] Fill in app review information
- [ ] Provide test account:
  - Email: `test@rightfitservices.co.uk`
  - Password: `TestAccount123!`
- [ ] Submit for review
- [ ] Estimated review time: 2-5 days

##### AC4: Create Google Play Console Listing
1. [ ] Log in to Google Play Console
2. [ ] Create new app
3. [ ] Fill in store listing:
   - App name: RightFit Services
   - Short description: Manage property maintenance offline
   - Full description: (4000 chars)
   - Category: Productivity
4. [ ] Upload screenshots + feature graphic
5. [ ] Content rating questionnaire (18+, business app)
6. [ ] Privacy policy URL

##### AC5: Submit Android App
- [ ] Upload APK/AAB
- [ ] Create release notes
- [ ] Submit to closed testing track first (5-10 beta testers)
- [ ] After testing, promote to production
- [ ] Estimated review time: 1-2 days

#### Testing Checklist
- [ ] All app information complete
- [ ] Screenshots display correctly
- [ ] Privacy policy accessible
- [ ] Test account works
- [ ] App review info complete

#### Definition of Done
- [ ] iOS app submitted to App Store
- [ ] Android app submitted to Google Play
- [ ] Both listings complete with all assets
- [ ] Test accounts provided
- [ ] Submission confirmation emails received

---

### US-LEGAL-1: Legal Documents

**Story ID:** US-LEGAL-1
**Priority:** 🔴 CRITICAL
**Story Points:** 4
**Estimated Time:** 4 hours
**Dependencies:** None

#### User Story
**As a** founder
**I want** legal documents published
**So that** the platform is compliant with laws

#### Acceptance Criteria

##### AC1: Generate Privacy Policy
- [ ] Use generator: https://www.termsfeed.com/privacy-policy-generator/
- [ ] Include:
  - Data collected (email, name, property data, photos)
  - Purpose of data collection
  - Data retention (7 years for compliance)
  - User rights (access, deletion, export)
  - Third-party services (Stripe, AWS, Twilio, SendGrid)
  - Cookies used
  - Contact for data requests
- [ ] Review and customize
- [ ] Save as HTML file

##### AC2: Generate Terms of Service
- [ ] Use generator: https://www.termsofservicegenerator.net/
- [ ] Include:
  - Service description
  - User responsibilities
  - Payment terms (subscriptions, refunds)
  - Cancellation policy
  - Liability limitations
  - Dispute resolution
  - Governing law (UK)
- [ ] Review with lawyer (recommended but optional for MVP)

##### AC3: Create Cookie Policy
- [ ] List all cookies:
  - Session cookies (auth token)
  - Analytics cookies (if using GA)
  - Preference cookies
- [ ] Explain purpose of each
- [ ] Provide opt-out instructions

##### AC4: Create Simple Marketing Website
File structure:
```
rightfit-marketing/
├── index.html           (Home page)
├── privacy.html         (Privacy policy)
├── terms.html           (Terms of service)
├── cookies.html         (Cookie policy)
└── support.html         (Support/contact)
```

Deploy to: `https://rightfitservices.co.uk`

##### AC5: Add Cookie Consent Banner
Add to web app:
```typescript
import CookieConsent from 'react-cookie-consent';

<CookieConsent
  location="bottom"
  buttonText="Accept"
  declineButtonText="Decline"
  enableDeclineButton
>
  We use cookies to improve your experience.
  <a href="https://rightfitservices.co.uk/cookies">Learn more</a>
</CookieConsent>
```

#### Testing Checklist
- [ ] Privacy policy accessible at correct URL
- [ ] Terms of service accessible
- [ ] Cookie policy accessible
- [ ] All links work
- [ ] Documents are readable and clear

#### Definition of Done
- [ ] Privacy policy published
- [ ] Terms of service published
- [ ] Cookie policy published
- [ ] Marketing website live
- [ ] Cookie consent banner added
- [ ] URLs added to app store listings

---

### US-TEST-1: Production Testing

**Story ID:** US-TEST-1
**Priority:** 🔴 CRITICAL
**Story Points:** 6
**Estimated Time:** 6 hours
**Dependencies:** US-INFRA-1, US-PAY-4

#### User Story
**As a** developer
**I want** thorough production testing
**So that** launch is smooth and bug-free

#### Acceptance Criteria

##### AC1: End-to-End User Flow Testing
Complete these flows in production environment:

**Flow 1: New User Registration → Subscription**
1. [ ] Visit `https://app.rightfitservices.co.uk`
2. [ ] Register new account
3. [ ] Verify email (if implemented)
4. [ ] Login
5. [ ] Navigate to billing
6. [ ] Subscribe to Pro plan (£25/month)
7. [ ] Complete payment with test card
8. [ ] Verify subscription active
9. [ ] Check webhook processed

**Flow 2: Property → Work Order → Photo**
1. [ ] Create new property
2. [ ] Create work order for property
3. [ ] Upload photo to work order
4. [ ] Verify photo appears in S3
5. [ ] AI quality check runs (if applicable)
6. [ ] View work order details
7. [ ] Update work order status

**Flow 3: Mobile Offline Mode**
1. [ ] Open mobile app
2. [ ] Login
3. [ ] Enable Airplane Mode
4. [ ] Create work order offline
5. [ ] Take photo offline
6. [ ] Disable Airplane Mode
7. [ ] Verify auto-sync
8. [ ] Check data in web app

##### AC2: Load Testing
Use Artillery or k6:
```yaml
config:
  target: 'https://api.rightfitservices.co.uk'
  phases:
    - duration: 60
      arrivalRate: 10  # 10 requests per second
scenarios:
  - name: 'API Load Test'
    flow:
      - get:
          url: '/health'
      - post:
          url: '/api/auth/login'
          json:
            email: 'test@example.com'
            password: 'password'
```

Run test:
```bash
npx artillery run load-test.yml
```

Target metrics:
- [ ] 95th percentile response time < 500ms
- [ ] Error rate < 1%
- [ ] No 500 errors

##### AC3: Security Testing
- [ ] Run OWASP ZAP scan: `https://api.rightfitservices.co.uk`
- [ ] Test SQL injection on form inputs
- [ ] Test XSS in property descriptions
- [ ] Test rate limiting (101 requests in 15 min)
- [ ] Verify CORS blocks unauthorized origins
- [ ] Test authentication bypass attempts

##### AC4: Browser Compatibility Testing
Test web app in:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

##### AC5: Accessibility Testing
- [ ] Run Lighthouse audit (aim for 90+ accessibility score)
- [ ] Test keyboard navigation
- [ ] Test screen reader (NVDA or VoiceOver)
- [ ] Verify color contrast ratios

#### Testing Checklist
- [ ] All 3 user flows complete successfully
- [ ] Load test passes (< 500ms, < 1% errors)
- [ ] Security scan shows no critical vulnerabilities
- [ ] Works in all major browsers
- [ ] Accessibility score > 90

#### Definition of Done
- [ ] All test scenarios pass
- [ ] Test results documented
- [ ] Critical bugs fixed
- [ ] Performance benchmarks met
- [ ] Security audit passed

---

### US-LAUNCH-1: Beta Launch

**Story ID:** US-LAUNCH-1
**Priority:** 🔴 CRITICAL
**Story Points:** 4
**Estimated Time:** 4 hours
**Dependencies:** All previous stories

#### User Story
**As a** founder
**I want** to launch beta to 10-20 users
**So that** I can validate product-market fit

#### Acceptance Criteria

##### AC1: Recruit Beta Users
Target: 10-20 UK landlords managing 3-20 properties

Channels:
- [ ] UK landlord Facebook groups (post with signup form)
- [ ] Reddit r/UKLandlords (post beta announcement)
- [ ] Local property investor meetups (Birmingham)
- [ ] Friends/family who are landlords

Beta offer:
- **Free for 6 months** (no credit card required)
- **Direct support** via WhatsApp group
- **Early access** to new features
- **Influence roadmap** with feedback

##### AC2: Create Beta Onboarding Process
- [ ] Create Google Form for beta signups:
  - Name
  - Email
  - Number of properties managed
  - Location (UK region)
  - Current tools used (Arthur Online, spreadsheets, etc.)
- [ ] Auto-invite to WhatsApp group
- [ ] Send welcome email with:
  - Login instructions
  - Quick start guide (PDF)
  - Video tutorial (screen recording)
  - Support contact

##### AC3: Conduct 1:1 Onboarding Calls
Schedule 30-minute calls with each beta user:
- [ ] Walk through app features
- [ ] Help import first property
- [ ] Create first work order together
- [ ] Answer questions
- [ ] Collect initial feedback

##### AC4: Create Beta Testing Guide
Document: `BETA_TESTING_GUIDE.md`

Include:
- Getting started
- Key features to test
- Known issues/limitations
- How to report bugs (GitHub Issues or Sentry)
- How to provide feedback (Google Form survey)

##### AC5: Set Up Feedback Collection
- [ ] Weekly feedback survey (Google Forms)
- [ ] Bug report template (GitHub Issues)
- [ ] Feature request form (Canny or Google Forms)
- [ ] Weekly check-in messages in WhatsApp group

##### AC6: Launch Communication
Email to beta users:
```
Subject: Welcome to RightFit Services Beta! 🎉

Hi [Name],

Congratulations! You've been accepted into the RightFit Services beta program.

What you get:
✅ Free access for 6 months
✅ Direct support from our team
✅ Influence on new features
✅ Early access to updates

Getting started:
1. Download the app: [iOS] [Android]
2. Login with: [Email]
3. Watch 5-min tutorial: [Video Link]
4. Join our WhatsApp group: [Link]

Let's schedule a 30-minute onboarding call to help you get set up:
[Calendly Link]

Questions? Reply to this email or message us on WhatsApp.

Looking forward to your feedback!
James
Founder, RightFit Services
```

#### Success Metrics
Target by end of Week 4:
- [ ] 15+ beta users signed up
- [ ] 10+ beta users completed onboarding
- [ ] 8+ beta users created at least 1 property
- [ ] 5+ beta users created at least 1 work order
- [ ] <5 critical bugs reported
- [ ] Positive feedback ("easier than Arthur Online")

#### Testing Checklist
- [ ] Beta signup form works
- [ ] Welcome email sends automatically
- [ ] WhatsApp group created
- [ ] Onboarding calls scheduled
- [ ] Feedback surveys created

#### Definition of Done
- [ ] 10+ beta users onboarded
- [ ] All users completed 1:1 onboarding call
- [ ] Feedback collection process active
- [ ] First week of beta testing complete
- [ ] Initial feedback collected
- [ ] Critical bugs identified and prioritized

---

## Sprint 6 Checklist Summary

### Week 1: Payments (Must Complete)
- [ ] US-PAY-1: Stripe Integration (12h)
- [ ] US-PAY-2: Subscription Plans (8h)
- [ ] US-PAY-3: Billing Dashboard (10h)
- [ ] US-PAY-4: Stripe Webhooks (8h)
- [ ] US-PAY-5: Payment Testing (6h)
- [ ] US-PAY-6: Usage Limits (6h)

### Week 2: Infrastructure (Must Complete)
- [ ] US-INFRA-1: Hosting Setup (8h)
- [ ] US-INFRA-2: Database Production (6h)
- [ ] US-INFRA-3: Security Hardening (8h)
- [ ] US-INFRA-4: CI/CD Pipeline (8h)
- [ ] US-MONITOR-1: Sentry (4h)
- [ ] US-MONITOR-2: UptimeRobot (2h)

### Week 3: Launch (Must Complete)
- [ ] US-MOBILE-1: EAS Builds (8h)
- [ ] US-MOBILE-2: App Submissions (6h)
- [ ] US-LEGAL-1: Legal Docs (4h)
- [ ] US-TEST-1: Production Testing (6h)
- [ ] US-LAUNCH-1: Beta Launch (4h)

**Total: 90 hours across 3 weeks**

---

## Sprint 6 Success Criteria

### Minimum Requirements (GO Decision)
- [x] ✅ Payment processing working (Stripe checkout functional)
- [x] ✅ Production infrastructure deployed (API + Web + DB)
- [x] ✅ Monitoring operational (Sentry + UptimeRobot green)
- [x] ✅ SSL/HTTPS configured (all domains secure)
- [x] ✅ Security hardened (Helmet + rate limiting active)
- [x] ✅ Mobile apps submitted (iOS + Android in review)
- [x] ✅ Legal documents published (Privacy + Terms live)
- [x] ✅ 10+ beta users onboarded
- [x] ✅ <5 critical bugs open
- [x] ✅ Uptime >99% during beta testing

**If 8/10 criteria met:** GO for public launch ✅
**If 6-7/10 criteria met:** CONDITIONAL GO ⚠️
**If <6/10 criteria met:** NO-GO, extend Sprint 6 ❌

---

## Post-Sprint 6: Week 4 Launch (November 25-29)

### Launch Week Activities
- [ ] Monitor Sentry for errors (check every 4 hours)
- [ ] Monitor UptimeRobot (check daily)
- [ ] Respond to all beta user messages (<2 hour response time)
- [ ] Fix critical bugs within 24 hours
- [ ] Collect daily feedback
- [ ] Track key metrics:
  - Sign-ups per day
  - Active users per day
  - Work orders created
  - Properties added
  - Subscription conversions

### Public Launch (If beta successful)
- [ ] Email beta users (offer 20% lifetime discount for early support)
- [ ] Post in UK landlord Facebook groups
- [ ] Reddit r/UKLandlords announcement
- [ ] LinkedIn announcement
- [ ] Twitter/X announcement
- [ ] Local PR (Birmingham Post, property newsletters)

---

**Sprint 6 Status:** ❌ Not Started (Ready to Begin)
**Target Completion:** November 25, 2025
**Next Review:** November 8, 2025 (End of Week 1)

---

**Product Owner:** Sarah
**Document Version:** 1.0
**Last Updated:** October 29, 2025
