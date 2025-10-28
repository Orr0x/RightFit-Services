# Story 007: Authentication & Multi-Tenancy

**Epic:** Security & Foundation
**Priority:** CRITICAL - FOUNDATION
**Sprint:** Sprint 1 (Week 1-2)
**Story Points:** 13
**Status:** To Do

---

## User Story

**As a** system administrator
**I want** secure authentication with email/password and strict multi-tenant data isolation
**So that** each landlord's data is completely private and secure from other tenants

---

## 🔒 SECURITY CRITICAL

This story is **FOUNDATION** for entire application. All other features depend on correct multi-tenancy implementation.

**Security Risks:**
- Cross-tenant data leakage
- Weak password storage
- JWT token vulnerabilities
- Session hijacking

**Mitigation:**
- Comprehensive security testing (see Testing section)
- Code review by senior developer (if available)
- Penetration testing before launch

---

## Acceptance Criteria

### AC-7.1: User Registration
- **Given** user opens app OR taps "Sign Up"
- **Then** display Sign Up form:
  - `email` (TextInput, required, email validation, max 255 chars)
  - `password` (TextInput, required, secureTextEntry: true, min 8 chars)
    - Must contain: 1 uppercase, 1 lowercase, 1 number, 1 special char
  - `confirm_password` (TextInput, required, must match password)
  - `full_name` (TextInput, required, max 100 chars)
  - `company_name` (TextInput, optional, max 100 chars)
  - Password strength indicator (weak/medium/strong)
  - Terms of Service checkbox (required, link opens WebView)
  - Privacy Policy checkbox (required, link opens WebView)
- **When** user submits
- **Then** submit to `POST /api/auth/register`
- **And** API:
  1. Validates email is unique (409 if exists)
  2. Hashes password with bcrypt (salt rounds: 10)
  3. Creates Tenant record (tenant_name = company_name OR full_name)
  4. Creates User record (role = ADMIN, tenant_id)
  5. Sets trial_ends_at = now + 14 days
  6. Generates JWT tokens (access: 1h, refresh: 30d)
  7. Returns user, tenant, tokens
- **And** app stores tokens in expo-secure-store
- **And** navigates to App Home
- **And** displays SnackBar: "Welcome to RightFit Services!"

### AC-7.2: User Login
- **Given** user has registered account
- **Then** display Login form:
  - `email` (TextInput, required, email validation)
  - `password` (TextInput, required, secureTextEntry: true)
  - "Remember me" checkbox (stores email in AsyncStorage)
  - "Forgot Password?" link
- **When** user submits
- **Then** submit to `POST /api/auth/login`
- **On** success (200):
  - API validates credentials (bcrypt compare)
  - Returns user, tenant, tokens
  - App stores tokens
  - Navigates to App Home
- **On** failure (401):
  - Display error: "Invalid email or password"
  - Increment failed login counter
  - After 5 failed attempts: Show CAPTCHA (or temp 15-min lock)

### AC-7.3: JWT Token Structure
- **access_token contains:**
  - user_id (UUID)
  - tenant_id (UUID)
  - email (string)
  - role (enum: ADMIN, MEMBER)
  - iat (issued at timestamp)
  - exp (expiry: 1 hour from iat)
- **refresh_token contains:**
  - user_id, tenant_id, iat
  - exp (30 days from iat)
- **Tokens signed** with HS256 algorithm
- **JWT_SECRET:** 256-bit random string from env variable

### AC-7.4: Token Refresh
- **Given** access_token is expired OR <5 mins remaining
- **When** app makes API request
- **Then** API middleware returns 401
- **And** app automatically submits refresh_token to `POST /api/auth/refresh`
- **On** success:
  - API validates refresh_token signature and expiry
  - Returns new access_token (refresh_token unchanged unless also expired)
  - App stores new access_token
  - App retries original API request
- **On** failure (refresh_token expired):
  - Clear all tokens and user data
  - Navigate to Login screen
  - Display SnackBar: "Session expired. Please log in again."

### AC-7.5: Logout
- **Given** user is authenticated
- **When** user taps "Logout" in Settings
- **Then** display confirmation: "Are you sure you want to log out?"
- **On** confirm:
  - Clear tokens from expo-secure-store
  - Clear user/tenant data from AsyncStorage
  - Clear WatermelonDB (delete local database)
  - Navigate to Login screen
  - Display SnackBar: "Logged out successfully"

### AC-7.6: Multi-Tenancy Data Isolation
- **ALL API endpoints** MUST implement tenantMiddleware:
  ```javascript
  function tenantMiddleware(req, res, next) {
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) return res.status(401).json({ error: 'Unauthorized' })

    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = {
      user_id: decoded.user_id,
      tenant_id: decoded.tenant_id,
      email: decoded.email,
      role: decoded.role
    }
    next()
  }
  ```
- **ALL Prisma queries** MUST include:
  ```javascript
  where: {
    tenant_id: req.user.tenant_id,
    deleted_at: null
  }
  ```
- **NO user** should see data from another tenant
- **Test** with integration tests (see Testing section)

### AC-7.7: Password Reset
- **Given** user forgot password
- **When** user taps "Forgot Password?"
- **Then** display form: email (TextInput, required)
- **And** submit to `POST /api/auth/forgot-password`
- **And** API:
  1. Generates reset token (UUID, expires 1 hour)
  2. Stores in password_reset_tokens table
  3. Sends email with link: `https://app.rightfitservices.com/reset-password?token={token}`
  4. Returns success (even if email doesn't exist - security)
- **And** display SnackBar: "Password reset link sent to your email"
- **When** user clicks email link
- **Then** open Reset Password form:
  - `new_password` (same validation as registration)
  - `confirm_password` (must match)
- **And** submit to `POST /api/auth/reset-password` with {token, new_password}
- **And** API:
  1. Validates token (checks expires_at > now, not used)
  2. Updates user password (bcrypt hash)
  3. Marks token as used
  4. Returns success
- **And** display SnackBar: "Password reset successfully. Please log in."
- **And** navigate to Login screen

---

## Security Requirements

### Password Security
- **Hashing:** bcrypt with salt rounds: 10
- **Validation:** Min 8 chars, 1 upper, 1 lower, 1 number, 1 special
- **NEVER store** plaintext passwords
- **NEVER log** passwords

### Token Security
- **JWT_SECRET:** 256-bit random string (NEVER in code)
- **HTTPS only:** All API requests over TLS 1.3
- **Token expiry:** Access 1h, Refresh 30d
- **Token rotation:** New access_token on refresh

### API Security
- **Rate limiting:**
  - Login: 5 requests per 15 min per IP
  - Registration: 3 requests per hour per IP
  - Password reset: 3 requests per hour per IP
- **CORS:** Whitelist mobile app and web app origins only
- **Helmet.js:** Security headers (CSP, X-Frame-Options, etc.)

### Multi-Tenancy Security
- **CRITICAL:** ALL queries filter by tenant_id
- **Test:** Integration tests verify no cross-tenant access
- **Return 404** (not 403) for unauthorized access (don't reveal existence)

---

## Edge Cases

- **User registers with existing email**
  - Expected: Return 409 "Account already exists. Please log in."

- **User's refresh_token expires while offline**
  - Expected: On next app open, force re-login

- **User logs in on Device A, then Device B**
  - Expected: Both devices work (allow multiple sessions for MVP)

- **User changes password on Device A**
  - Expected: Device B's tokens remain valid until expiry (acceptable for MVP)

---

## Technical Implementation Notes

### Database Models
```prisma
model Tenant {
  id                    String    @id @default(uuid())
  tenant_name           String    @db.VarChar(100)
  subscription_status   SubscriptionStatus @default(TRIAL)
  trial_ends_at         DateTime?
  created_at            DateTime  @default(now())
  updated_at            DateTime  @updatedAt

  users                 User[]
  properties            Property[]
  work_orders           WorkOrder[]
}

model User {
  id                String    @id @default(uuid())
  tenant_id         String
  email             String    @unique @db.VarChar(255)
  password_hash     String    @db.VarChar(255)
  full_name         String    @db.VarChar(100)
  role              UserRole  @default(ADMIN)
  created_at        DateTime  @default(now())
  updated_at        DateTime  @updatedAt
  deleted_at        DateTime?

  tenant            Tenant    @relation(fields: [tenant_id], references: [id])

  @@index([tenant_id])
  @@index([email])
}

model PasswordResetToken {
  id                String    @id @default(uuid())
  user_id           String
  token             String    @unique
  expires_at        DateTime
  used_at           DateTime?
  created_at        DateTime  @default(now())

  @@index([token])
}
```

### Password Hashing
```javascript
// Registration
const bcrypt = require('bcrypt')
const hashedPassword = await bcrypt.hash(password, 10)

// Login
const isValid = await bcrypt.compare(password, user.password_hash)
```

### JWT Generation
```javascript
const jwt = require('jsonwebtoken')

const access_token = jwt.sign(
  { user_id, tenant_id, email, role },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
)

const refresh_token = jwt.sign(
  { user_id, tenant_id },
  process.env.JWT_SECRET,
  { expiresIn: '30d' }
)
```

---

## Testing Checklist

### Functional Tests
- [ ] Register with valid email/password → Success
- [ ] Register with weak password → Validation error
- [ ] Register with existing email → 409 error
- [ ] Login with correct credentials → Success, tokens stored
- [ ] Login with incorrect password → 401 error
- [ ] After 5 failed logins → CAPTCHA shown or temp lock
- [ ] Token refresh when expired → New access_token
- [ ] Logout → Tokens cleared, navigate to login
- [ ] Password reset flow → Email sent, token works, password updated

### Security Tests
- [ ] SQL injection in login → No effect (Prisma prevents)
- [ ] XSS in registration → Sanitized
- [ ] JWT tampering → 401 Invalid token
- [ ] Access API with expired token → 401, auto-refresh
- [ ] Access API without token → 401
- [ ] Password stored as bcrypt hash → Verified in database

### Multi-Tenancy Tests (CRITICAL)
- [ ] Tenant A creates property → Only visible to Tenant A
- [ ] Tenant B tries to access Tenant A's property → 404 Not Found
- [ ] Tenant B searches for Tenant A's data → No results
- [ ] API queries include tenant_id filter → Verified in logs
- [ ] Modified JWT tenant_id → 401 Invalid token

---

## Dependencies

- **Blocks:** ALL other stories (foundation)
- **Requires:**
  - `bcrypt`
  - `jsonwebtoken`
  - `expo-secure-store`
  - `express-rate-limit`

---

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Registration and login working
- [ ] JWT token generation and refresh
- [ ] Password reset flow complete
- [ ] Multi-tenancy middleware applied to ALL endpoints
- [ ] tenant_id filtering verified in all queries
- [ ] Password hashing with bcrypt
- [ ] Rate limiting on auth endpoints
- [ ] Security testing checklist completed
- [ ] Multi-tenancy isolation verified (integration tests)
- [ ] No cross-tenant data leakage
- [ ] Code reviewed (security focus)
- [ ] Deployed to dev environment
