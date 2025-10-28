# Story 006: UK Compliance Tracking

**Epic:** Compliance & Certificates
**Priority:** MEDIUM
**Sprint:** Sprint 5 (Week 9-10)
**Story Points:** 13
**Status:** To Do

---

## User Story

**As a** UK landlord
**I want to** track compliance certificates (Gas Safe, EPC, EICR, etc.) with expiry dates and reminders
**So that** I stay legally compliant, avoid fines, and prevent booking cancellations due to expired certificates

---

## Acceptance Criteria

### AC-6.1: Certificate Types & Validity Periods
- **System supports** these UK certificate types (enum):
  - GAS_SAFE (Gas Safety Certificate) - 12 months validity
  - EPC (Energy Performance Certificate) - 10 years validity
  - EICR (Electrical Installation Condition Report) - 5 years validity
  - PAT (Portable Appliance Testing) - 12 months validity
  - FIRE_ALARM - 12 months validity
  - CARBON_MONOXIDE - 12 months validity
  - LEGIONELLA (Risk Assessment) - 12 months validity
  - HMO_LICENSE (House in Multiple Occupation) - 12 months validity

### AC-6.2: Create Certificate
- **Given** user is on Property Detail → Compliance tab
- **When** user taps "Add Certificate" FAB
- **Then** display form:
  - `certificate_type` (Dropdown with types above)
  - `issue_date` (DatePicker, required, maxDate: today)
  - `expiry_date` (DatePicker, required, auto-calculate from issue_date + validity period, user can override)
  - `issuer_name` (TextInput, required, max 100 chars, placeholder: "e.g., ABC Gas Services Ltd")
  - `certificate_number` (TextInput, optional, max 50 chars)
  - `notes` (TextInput, multiline: 3 rows, optional, max 500 chars)
  - `document_url` (File upload: PDF or image, optional, max 10MB)
- **And** submit to `POST /api/certificates` with property_id
- **If** document uploaded: Upload to S3 `rightfit-certificates-{env}/{tenant_id}/{uuid}.pdf`
- **And** display SnackBar: "Certificate added successfully"

### AC-6.3: List Certificates (Property View)
- **Given** user on Property Detail → Compliance tab
- **Then** display FlatList of CertificateCard:
  - Type badge (Chip with icon and color-coded)
  - Expiry status badge:
    - VALID (green): expiry_date > today + 30 days
    - EXPIRING_SOON (orange): expiry_date between today and today + 30 days
    - EXPIRED (red): expiry_date < today
  - issuer_name, issue_date, expiry_date
  - "View Document" button (if document_url exists)
  - Sort by expiry_date ASC (soonest expiry first)
- **And** highlight expired certificates with red border
- **And** show "Add Certificate" FAB

### AC-6.4: Dashboard Compliance Overview
- **Given** user on Dashboard screen
- **Then** display "Compliance Overview" section:
  - Counts: X expired, Y expiring soon (next 30 days), Z valid
  - List of expired/expiring certificates (max 5, sorted by expiry_date ASC)
  - Each item tappable → navigates to Property Detail → Compliance
  - "View All Certificates" button

### AC-6.5: Certificate Expiry Notifications
- **System sends** push notifications:
  - **30 days before expiry:** "Your [type] for [property] expires in 30 days. Renew now to stay compliant."
  - **7 days before expiry:** "URGENT: Your [type] for [property] expires in 7 days!"
  - **On expiry day:** "Your [type] for [property] has EXPIRED. Renew immediately to avoid fines."
  - **7 days after expiry:** "Your [type] for [property] expired 7 days ago. Take action now."
- **Notifications** sent via push notification service (Story 010)
- **User can** configure notification preferences in Settings

### AC-6.6: View Certificate Details
- **Given** user taps CertificateCard
- **Then** display:
  - certificate_type badge (large)
  - Expiry status badge
  - property_name (tappable)
  - issuer_name, certificate_number
  - issue_date, expiry_date (highlight red if expired)
  - Days until/since expiry
  - notes (full content)
  - Document viewer (PDF via react-native-pdf OR Image)
  - "Download Document" button
- **And** show Edit/Delete IconButtons
- **And** show "Renew Certificate" button

### AC-6.7: Renew Certificate
- **Given** user taps "Renew Certificate"
- **Then** pre-fill form with:
  - Same certificate_type, property_id, issuer_name
  - issue_date = today (user can change)
  - expiry_date = auto-calc from issue_date + validity
  - certificate_number, notes = blank
  - document_url = blank (user must upload new)
- **And** submit to `POST /api/certificates` (creates NEW certificate)
- **And** optionally "Mark old certificate as superseded" checkbox → sets old cert deleted_at
- **And** display SnackBar: "Certificate renewed successfully"

---

## Edge Cases

- **User adds already-expired certificate (historical)**
  - Expected: Allow, but show warning: "This certificate is already expired"

- **User receives expiry notification but already renewed**
  - Expected: Notification links to Property, new certificate visible

- **User has 3 Gas Safe certificates for same property**
  - Expected: All visible, sorted by expiry_date, only latest non-deleted is active

- **Push notification fails (device offline)**
  - Expected: Queue notification, display in-app on next open

---

## Technical Implementation Notes

### API Endpoints
```javascript
POST /api/certificates
GET /api/certificates?property_id=uuid&expired=true
GET /api/certificates/:id
PATCH /api/certificates/:id
DELETE /api/certificates/:id
```

### Database Model
```prisma
model Certificate {
  id                String    @id @default(uuid())
  tenant_id         String
  property_id       String
  certificate_type  CertificateType
  issue_date        DateTime
  expiry_date       DateTime
  issuer_name       String    @db.VarChar(100)
  certificate_number String?  @db.VarChar(50)
  document_url      String?   @db.VarChar(500)
  notes             String?   @db.VarChar(500)
  created_at        DateTime  @default(now())
  updated_at        DateTime  @updatedAt
  deleted_at        DateTime?

  property          Property  @relation(fields: [property_id], references: [id])

  @@index([tenant_id])
  @@index([property_id])
  @@index([expiry_date])
}

enum CertificateType {
  GAS_SAFE
  EPC
  EICR
  PAT
  FIRE_ALARM
  CARBON_MONOXIDE
  LEGIONELLA
  HMO_LICENSE
}
```

### Notification Cron Job
```javascript
// apps/api/src/jobs/certificateExpiryCheck.js
// Runs daily at 09:00 GMT
async function checkExpiringCertificates() {
  const today = new Date()
  const in30Days = addDays(today, 30)
  const in7Days = addDays(today, 7)
  const ago7Days = subDays(today, 7)

  // 30 days before expiry
  const expiring30 = await prisma.certificate.findMany({
    where: {
      expiry_date: { gte: today, lte: in30Days },
      deleted_at: null,
      // Check if notification already sent
    }
  })
  for (const cert of expiring30) {
    await sendPushNotification(cert, '30 days')
  }

  // 7 days before expiry
  const expiring7 = await prisma.certificate.findMany({
    where: { expiry_date: { gte: today, lte: in7Days } }
  })
  for (const cert of expiring7) {
    await sendPushNotification(cert, '7 days', priority: 'high')
  }

  // Expired today
  const expiredToday = await prisma.certificate.findMany({
    where: { expiry_date: today }
  })
  for (const cert of expiredToday) {
    await sendPushNotification(cert, 'expired')
  }

  // Expired 7 days ago
  const expired7 = await prisma.certificate.findMany({
    where: { expiry_date: ago7Days }
  })
  for (const cert of expired7) {
    await sendPushNotification(cert, '7 days overdue')
  }
}
```

---

## Testing Checklist

- [ ] Create Gas Safe certificate with issue_date=today
- [ ] Expiry date auto-calculates to today + 12 months
- [ ] Create EPC certificate → Expiry = today + 10 years
- [ ] Upload PDF document → File uploaded to S3
- [ ] View document → PDF renders or image displays
- [ ] Certificate shows VALID status (green) when >30 days to expiry
- [ ] Certificate shows EXPIRING_SOON (orange) when <30 days
- [ ] Certificate shows EXPIRED (red) when past expiry_date
- [ ] Dashboard shows compliance overview with counts
- [ ] Push notification sent 30 days before expiry
- [ ] Push notification sent 7 days before expiry (high priority)
- [ ] Push notification sent on expiry day
- [ ] Renew certificate → New certificate created, old marked superseded
- [ ] Edit certificate → Fields updated
- [ ] Delete certificate → Soft-deleted
- [ ] Multiple certificates for same property → All visible, sorted correctly

---

## Dependencies

- **Blocked By:** Property Management (Story 001)
- **Related:** Push Notifications (Story 010) - for expiry alerts
- **Requires:**
  - `react-native-pdf` for PDF viewing
  - Cron job scheduler (node-cron or similar)
  - S3 bucket for certificate documents

---

## Definition of Done

- [ ] All acceptance criteria met
- [ ] All 8 certificate types supported
- [ ] Auto-calculation of expiry dates
- [ ] PDF/image upload to S3
- [ ] Certificate expiry cron job running
- [ ] Push notifications for 4 expiry intervals
- [ ] Dashboard compliance overview
- [ ] Renew certificate workflow
- [ ] Unit tests for expiry calculations
- [ ] Integration tests for notification triggers
- [ ] Manual testing checklist completed
- [ ] Code reviewed and merged
- [ ] Deployed to dev environment
