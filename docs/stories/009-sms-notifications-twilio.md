# Story 009: SMS Notifications (Twilio)

**Epic:** Communication & Notifications
**Priority:** MEDIUM
**Sprint:** Sprint 2 (Week 3-4)
**Story Points:** 8
**Status:** To Do

---

## User Story

**As a** landlord
**I want to** send SMS notifications to contractors when I assign them work orders
**So that** they receive immediate alerts even if they don't have the app installed

---

## Acceptance Criteria

### AC-9.1: SMS Notification Trigger
- **SMS sent when:**
  1. User manually taps "Send SMS" when assigning contractor to work order
  2. User taps "Send SMS" button on Contractor Detail screen
- **System does NOT** automatically send SMS without user confirmation (avoid spam, SMS costs money)

### AC-9.2: Send SMS (API)
- **Given** user confirmed SMS send
- **When** app submits to `POST /api/notifications/sms`:
  ```javascript
  {
    to_phone: '+447123456789',
    message: 'Hi John, I've assigned you to: Fix leaking tap. Property: 123 Main St. Priority: HIGH. Check the app for details.',
    work_order_id: 'uuid', // optional
    contractor_id: 'uuid'
  }
  ```
- **Then** API:
  1. Validates UK phone format (E.164: +44...)
  2. Validates message ≤160 chars (1 SMS segment, or auto-split)
  3. Calls Twilio API:
     ```javascript
     const twilio = require('twilio')(ACCOUNT_SID, AUTH_TOKEN)
     await twilio.messages.create({
       body: message,
       from: TWILIO_PHONE_NUMBER, // e.g., +441234567890
       to: to_phone
     })
     ```
  4. Logs to database:
     ```prisma
     {
       tenant_id,
       to_phone,
       message_body,
       twilio_message_sid,
       status: QUEUED,
       sent_at
     }
     ```
  5. Returns 200: {success: true, message_sid}
- **And** app displays SnackBar: "SMS sent to [contractor name]"

### AC-9.3: SMS Status Webhooks
- **API listens** at `POST /api/webhooks/twilio`
- **API handles** status updates:
  - `sent`: SMS left Twilio → Update status = SENT
  - `delivered`: SMS delivered to phone → Update status = DELIVERED, set delivered_at
  - `failed`: SMS failed → Update status = FAILED, log error
- **User can** view SMS history in Settings → SMS History (optional for MVP)

### AC-9.4: SMS Message Templates
- **App provides** templates:
  1. **Work order assignment:**
     "Hi [contractor_name], I've assigned you to: [work_order_title]. Property: [property_name]. Priority: [priority]. Check app for details."
  2. **Work order status update:**
     "Hi [contractor_name], work order '[work_order_title]' status changed to [status]. Property: [property_name]."
  3. **Custom message:**
     User types freely
- **User can** select template and customize before sending

### AC-9.5: SMS Cost Tracking (Post-MVP Feature)
- **API logs** costs for future billing:
  - Twilio UK SMS cost: ~£0.04 per message
  - Store in sms_logs: `sms_cost_gbp` (decimal)
  - Settings screen shows: "SMS credits used this month: [N] messages (£X.XX)"
- **For MVP:** Landlord pays for all SMS (no pass-through)

### AC-9.6: SMS Opt-Out
- **Contractors can** opt out:
  - SMS footer includes: "Reply STOP to opt out"
  - Twilio handles STOP requests automatically
  - API stores opt_out in contractors.sms_opt_out = true
  - App shows "(Opted out of SMS)" badge on ContractorCard
  - Prevent sending to opted-out contractors (show warning)

### AC-9.7: Rate Limiting
- **Enforce limits:**
  - Max 10 SMS per user per hour
  - Max 100 SMS per tenant per day
- **If exceeded:**
  - Return 429: "SMS rate limit exceeded. Try again later."
  - Display error SnackBar

---

## Edge Cases

- **User sends SMS to landline number**
  - Expected: Twilio returns error, API logs failure, show error: "Unable to send SMS. This may be a landline."

- **SMS fails to deliver (phone off, invalid number)**
  - Expected: Twilio webhook updates status=FAILED, user sees in SMS history

- **User sends 200-char message**
  - Expected: Twilio auto-splits to 2 messages, user charged 2x, both logged

- **Contractor replies to SMS**
  - Expected: Twilio forwards to webhook, API logs (optional: don't implement reply handling for MVP)

---

## Technical Implementation Notes

### API Endpoint
```javascript
POST /api/notifications/sms

// Request
{
  to_phone: '+447123456789',
  message: 'Hi John, I've assigned you to...',
  contractor_id: 'uuid'
}

// Response (200 OK)
{
  success: true,
  message_sid: 'SM...',
  status: 'QUEUED'
}

// Response (400 Bad Request)
{
  error: 'Invalid phone number format',
  code: 'INVALID_PHONE'
}

// Response (429 Too Many Requests)
{
  error: 'SMS rate limit exceeded. Try again in 45 minutes.',
  code: 'RATE_LIMIT_EXCEEDED'
}
```

### Database Model
```prisma
model SmsLog {
  id                String    @id @default(uuid())
  tenant_id         String
  to_phone          String    @db.VarChar(20)
  message_body      String    @db.Text
  twilio_message_sid String?  @db.VarChar(255)
  status            SmsStatus @default(QUEUED)
  sent_at           DateTime  @default(now())
  delivered_at      DateTime?
  error_message     String?   @db.Text

  @@index([tenant_id])
  @@index([twilio_message_sid])
}

enum SmsStatus {
  QUEUED
  SENT
  DELIVERED
  FAILED
}
```

### Twilio Integration
```javascript
// apps/api/src/services/smsService.js
const twilio = require('twilio')(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

async function sendSMS(toPhone, message, contractorId, tenantId) {
  // Validate phone format
  if (!toPhone.match(/^\+44\d{10}$/)) {
    throw new Error('Invalid UK phone number format')
  }

  // Check opt-out status
  const contractor = await prisma.contractor.findUnique({
    where: { id: contractorId }
  })
  if (contractor.sms_opt_out) {
    throw new Error('Contractor has opted out of SMS notifications')
  }

  // Check rate limit
  await checkRateLimit(tenantId)

  // Send via Twilio
  const twilioMessage = await twilio.messages.create({
    body: message,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: toPhone
  })

  // Log to database
  await prisma.smsLog.create({
    data: {
      tenant_id: tenantId,
      to_phone: toPhone,
      message_body: message,
      twilio_message_sid: twilioMessage.sid,
      status: 'QUEUED'
    }
  })

  return { success: true, message_sid: twilioMessage.sid }
}
```

### Webhook Handler
```javascript
// apps/api/src/routes/webhooks/twilio.js
app.post('/api/webhooks/twilio', async (req, res) => {
  const { MessageSid, MessageStatus } = req.body

  await prisma.smsLog.update({
    where: { twilio_message_sid: MessageSid },
    data: {
      status: MessageStatus.toUpperCase(),
      delivered_at: MessageStatus === 'delivered' ? new Date() : undefined
    }
  })

  res.sendStatus(200)
})
```

### Rate Limiting
```javascript
// apps/api/src/middleware/smsRateLimiter.js
async function checkRateLimit(tenantId) {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

  // Check hourly limit (per tenant)
  const hourlyCount = await prisma.smsLog.count({
    where: {
      tenant_id: tenantId,
      sent_at: { gte: oneHourAgo }
    }
  })
  if (hourlyCount >= 10) {
    throw new Error('RATE_LIMIT_HOUR')
  }

  // Check daily limit
  const dailyCount = await prisma.smsLog.count({
    where: {
      tenant_id: tenantId,
      sent_at: { gte: oneDayAgo }
    }
  })
  if (dailyCount >= 100) {
    throw new Error('RATE_LIMIT_DAY')
  }
}
```

### Message Template UI
```jsx
// apps/mobile/src/components/SMSTemplateSelector.tsx
export function SMSTemplateSelector({ contractor, workOrder, onSelect }) {
  const templates = [
    {
      label: 'Work Order Assignment',
      message: `Hi ${contractor.name}, I've assigned you to: ${workOrder.title}. Property: ${workOrder.property.name}. Priority: ${workOrder.priority}. Check app for details.`
    },
    {
      label: 'Status Update',
      message: `Hi ${contractor.name}, work order '${workOrder.title}' status changed to ${workOrder.status}. Property: ${workOrder.property.name}.`
    },
    {
      label: 'Custom Message',
      message: ''
    }
  ]

  return (
    <BottomSheet>
      {templates.map(template => (
        <Button onPress={() => onSelect(template.message)}>
          {template.label}
        </Button>
      ))}
    </BottomSheet>
  )
}
```

---

## Testing Checklist

- [ ] Send SMS to contractor with valid UK phone → SMS received
- [ ] Send SMS with 160 chars → 1 SMS sent
- [ ] Send SMS with 200 chars → 2 SMS sent, both logged
- [ ] SMS status updates via webhook (SENT, DELIVERED, FAILED)
- [ ] Send to invalid phone number → Error message shown
- [ ] Send to landline → Error: "This may be a landline"
- [ ] Send 11 SMS in 1 hour → 11th returns 429 rate limit error
- [ ] Send to opted-out contractor → Error: "Contractor opted out"
- [ ] Message template pre-fills with work order details
- [ ] Custom message allows free typing
- [ ] SMS log stored in database with correct tenant_id
- [ ] Webhook updates SMS status correctly

---

## Dependencies

- **Related:** Contractor Database (Story 005) - for contractor data
- **Related:** Work Order Management (Story 002) - for work order context
- **Requires:**
  - Twilio account (test credentials for dev)
  - `twilio` npm package
  - UK phone number from Twilio

---

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Twilio integration complete
- [ ] SMS sending working (tested with real phone)
- [ ] Webhook handler for status updates
- [ ] Rate limiting enforced (10/hour, 100/day)
- [ ] SMS opt-out functionality
- [ ] Message templates implemented
- [ ] SMS logs stored in database
- [ ] Unit tests for SMS service
- [ ] Integration tests with Twilio test credentials
- [ ] Manual testing with test phone number
- [ ] Code reviewed
- [ ] Deployed to dev environment
- [ ] Twilio webhook configured
