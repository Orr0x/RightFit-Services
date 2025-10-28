# Story 008: Payment Processing (Stripe)

**Epic:** Monetization & Subscriptions
**Priority:** MEDIUM
**Sprint:** Sprint 6 (Week 11-12) - Launch Requirement
**Story Points:** 13
**Status:** To Do

---

## User Story

**As a** landlord
**I want to** subscribe to a monthly plan using my credit/debit card via Stripe
**So that** I can access the platform and pay securely without manual invoicing

---

## Acceptance Criteria

### AC-8.1: Subscription Plans
- **System defines** 2 plans in Stripe:
  - **Starter Plan:** £15/month
    - Up to 10 properties
    - Unlimited work orders
    - Unlimited contractors
    - Mobile + Web access
    - Email support
  - **Professional Plan:** £25/month
    - Up to 50 properties
    - Unlimited work orders
    - Unlimited contractors
    - Mobile + Web access
    - Priority email support
    - Advanced reporting (post-MVP)
- **Plans configured** in Stripe Dashboard as Products with recurring Prices

### AC-8.2: Free Trial
- **All new users** get 14-day free trial (no credit card required)
- **During trial:**
  - User has full Professional Plan features
  - Display "Trial: X days remaining" badge in app header
  - Send push notifications:
    - 7 days before end: "Your trial ends in 7 days. Subscribe to keep your data."
    - 3 days before end: "Your trial ends in 3 days. Subscribe now."
    - On end day: "Your trial has ended. Subscribe to regain access."
- **After trial ends:**
  - User can view data (read-only mode)
  - Cannot create/edit/delete
  - Display "Subscribe Now" banner on all screens

### AC-8.3: Subscription Flow (Mobile)
- **Given** trial ending OR user taps "Subscribe"
- **When** user views Subscription screen
- **Then** display plan comparison table (Starter vs Professional)
- **And** "Select Plan" buttons
- **When** user taps "Select Plan"
- **Then** submit to `POST /api/payments/create-checkout-session` with {price_id}
- **And** API creates Stripe Checkout Session:
  ```javascript
  {
    customer_email: user.email,
    mode: 'subscription',
    line_items: [{ price: price_id, quantity: 1 }],
    success_url: 'rightfit://subscription-success',
    cancel_url: 'rightfit://subscription-cancelled',
    metadata: { tenant_id }
  }
  ```
- **And** returns {checkout_url}
- **And** app opens checkout_url in WebView OR external browser
- **When** user completes payment on Stripe
- **Then** Stripe redirects to success_url
- **And** app handles deep link:
  - Show success screen: "Subscription activated!"
  - Refresh user data
  - Navigate to Dashboard

### AC-8.4: Stripe Webhooks
- **API listens** at `POST /api/webhooks/stripe`
- **API verifies** Stripe signature using webhook secret
- **API handles** events:

**Event: checkout.session.completed**
- Extract customer, subscription, tenant_id
- Create Subscription record:
  ```prisma
  {
    tenant_id,
    stripe_customer_id,
    stripe_subscription_id,
    plan: STARTER | PROFESSIONAL,
    status: ACTIVE,
    current_period_start,
    current_period_end
  }
  ```
- Update Tenant.subscription_status = ACTIVE

**Event: invoice.payment_succeeded**
- Update Subscription: current_period_end += 1 month
- Send confirmation email (optional for MVP)

**Event: invoice.payment_failed**
- Update Subscription.status = PAST_DUE
- Send push notification: "Payment failed. Update your payment method."
- After 3 failed attempts: Set status = CANCELLED

**Event: customer.subscription.deleted**
- Update Subscription.status = CANCELLED
- User retains read-only access for 30 days
- After 30 days: Archive data

### AC-8.5: Manage Subscription (Mobile)
- **Given** user has active subscription
- **When** user taps "Manage Subscription" in Settings
- **Then** submit to `POST /api/payments/create-portal-session`
- **And** API creates Stripe Customer Portal Session:
  ```javascript
  {
    customer: stripe_customer_id,
    return_url: 'rightfit://settings'
  }
  ```
- **And** app opens portal_url in WebView
- **User can:**
  - Update payment method
  - View invoice history
  - Cancel subscription
  - Upgrade/downgrade plan (immediate proration)

### AC-8.6: Subscription Status Display
- **App header** displays status:
  - TRIAL: "Trial: X days left" (orange badge, only visible in Settings)
  - ACTIVE: "Subscribed" (green badge, Settings only)
  - PAST_DUE: "Payment failed - Update payment" (red badge, tappable)
  - CANCELLED: "Subscription cancelled - Read-only mode" (grey badge)
- **Settings screen** shows:
  - Current plan name
  - Next billing date
  - Monthly cost
  - "Manage Subscription" button
  - "Upgrade Plan" button (if Starter)

### AC-8.7: Enforce Subscription Limits
- **API enforces** property limits:
  - Starter: Max 10 properties
  - Professional: Max 50 properties
- **When** user exceeds limit:
  - API returns 403: "You've reached the [N] property limit for [Plan]. Upgrade to add more properties."
  - App displays error with "Upgrade Plan" button
- **Other limits** (work orders, contractors) unlimited for MVP

### AC-8.8: Data Retention After Cancellation
- **When** status = CANCELLED:
  - User has 30-day grace period (read-only access)
  - After 30 days: Data archived (export to S3 JSON backup)
  - After 90 days: Data permanently deleted (GDPR compliance)
- **User receives** email notifications at 30, 60, 90 days

---

## Edge Cases

- **User upgrades Starter → Professional mid-month**
  - Expected: Stripe handles proration, user charged difference immediately

- **User's payment method expires**
  - Expected: Stripe retries for 3 billing cycles, sends notifications, then cancels

- **User subscribes on web, logs in on mobile**
  - Expected: Subscription status syncs (stored in Tenant record)

- **User cancels, then resubscribes within 30 days**
  - Expected: Reactivate existing Subscription record

---

## Technical Implementation Notes

### Database Model
```prisma
model Subscription {
  id                    String    @id @default(uuid())
  tenant_id             String
  stripe_customer_id    String    @unique
  stripe_subscription_id String   @unique
  plan                  SubscriptionPlan
  status                SubscriptionStatus
  current_period_start  DateTime
  current_period_end    DateTime
  created_at            DateTime  @default(now())
  updated_at            DateTime  @updatedAt

  tenant                Tenant    @relation(fields: [tenant_id], references: [id])

  @@index([tenant_id])
  @@index([stripe_customer_id])
}

enum SubscriptionPlan {
  STARTER
  PROFESSIONAL
}

enum SubscriptionStatus {
  TRIAL
  ACTIVE
  PAST_DUE
  CANCELLED
}
```

### Stripe Integration
```javascript
// apps/api/src/services/stripeService.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

async function createCheckoutSession(priceId, tenantId, email) {
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer_email: email,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: 'rightfit://subscription-success',
    cancel_url: 'rightfit://subscription-cancelled',
    metadata: { tenant_id: tenantId }
  })

  return { checkout_url: session.url }
}

async function createPortalSession(customerId) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: 'rightfit://settings'
  })

  return { portal_url: session.url }
}
```

### Webhook Handler
```javascript
// apps/api/src/routes/webhooks/stripe.js
app.post('/api/webhooks/stripe', async (req, res) => {
  const sig = req.headers['stripe-signature']

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    )

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object)
        break
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object)
        break
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object)
        break
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object)
        break
    }

    res.json({ received: true })
  } catch (err) {
    console.error('Webhook error:', err.message)
    res.status(400).send(`Webhook Error: ${err.message}`)
  }
})
```

### Property Limit Enforcement
```javascript
// apps/api/src/middleware/subscriptionLimits.js
async function checkPropertyLimit(req, res, next) {
  const subscription = await prisma.subscription.findFirst({
    where: { tenant_id: req.user.tenant_id }
  })

  const propertyCount = await prisma.property.count({
    where: { tenant_id: req.user.tenant_id, deleted_at: null }
  })

  const limit = subscription.plan === 'STARTER' ? 10 : 50

  if (propertyCount >= limit) {
    return res.status(403).json({
      error: `You've reached the ${limit} property limit for ${subscription.plan} plan. Upgrade to add more.`,
      code: 'PROPERTY_LIMIT_EXCEEDED'
    })
  }

  next()
}

// Apply to POST /api/properties
app.post('/api/properties', tenantMiddleware, checkPropertyLimit, createProperty)
```

---

## Testing Checklist

- [ ] Free trial starts on registration (14 days)
- [ ] Trial countdown displays correctly
- [ ] Trial ending notifications sent (7d, 3d, 0d)
- [ ] Subscription screen shows plan comparison
- [ ] Stripe Checkout opens in WebView
- [ ] Payment with test card (4242 4242 4242 4242) succeeds
- [ ] Subscription activated, Tenant.status = ACTIVE
- [ ] Webhook: checkout.session.completed creates Subscription
- [ ] Webhook: invoice.payment_succeeded extends period
- [ ] Webhook: invoice.payment_failed sets PAST_DUE
- [ ] Property limit enforced (10 for Starter, 50 for Professional)
- [ ] Exceed limit → 403 error with "Upgrade" message
- [ ] Upgrade plan works (Starter → Professional)
- [ ] Stripe Customer Portal opens correctly
- [ ] Cancel subscription → Status CANCELLED, 30-day grace
- [ ] Resubscribe within grace period → Reactivates

---

## Dependencies

- **Blocked By:** Authentication (Story 007)
- **Requires:**
  - Stripe account (test mode for development)
  - `stripe` npm package
  - Webhook endpoint configured in Stripe Dashboard

---

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Stripe integration complete (Checkout + Portal)
- [ ] Webhook handler implemented for 4 events
- [ ] Property limits enforced
- [ ] Free trial functionality working
- [ ] Subscription status displayed correctly
- [ ] Data retention policy implemented
- [ ] Unit tests for webhook handlers
- [ ] Integration tests with Stripe test mode
- [ ] Manual testing with test card
- [ ] Code reviewed
- [ ] Deployed to dev environment
- [ ] Stripe webhook configured for production
