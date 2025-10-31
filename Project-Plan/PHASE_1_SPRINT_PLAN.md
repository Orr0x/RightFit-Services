# Phase 1 Sprint Plan: Foundation Hardening
## RightFit Services - Quality-First Approach

**Sprint Duration:** 3 weeks (21 days)
**Dates:** Week 1-3 of Quality Roadmap
**Sprint Goal:** Bulletproof the codebase before adding new features
**Total Story Points:** 89 points (~30 points/week)
**Team Capacity:** 1 developer, 30-40 hours/week

**Created:** 2025-10-30
**Product Owner:** Sarah (PO Agent)
**Status:** ✅ READY FOR DEVELOPMENT

---

## 🎯 Sprint Goal

**Transform the 82% complete MVP foundation into production-grade infrastructure:**
- Test coverage: 14.94% → 70%+
- Security: Basic → OWASP-compliant
- Performance: Unmeasured → <500ms API responses
- CI/CD: Manual → Automated

**Why This Matters:**
This sprint eliminates the technical debt that would slow down all future development. We're building the foundation for 16 weeks of feature work.

---

## 📊 Current State Assessment

### What We Have ✅
- 82% feature complete (251/304 story points from old sprints)
- Stable tech stack (React 18.3.1 + Node 20 LTS)
- Core features working: Auth, Properties, Work Orders, Offline Mode
- Test coverage: 14.94% (38 passing tests)
- WorkOrdersService: 89.65% coverage (good baseline)

### Critical Gaps ⚠️
- **Testing:** Only 1 of 6 services has tests
- **Security:** No rate limiting (except auth), no penetration testing
- **Performance:** No benchmarking, not optimized
- **CI/CD:** No automated testing, manual deployments
- **Code Quality:** 34 technical debt items (8 critical, 12 high priority)

---

## 🗓️ Sprint Breakdown

### Week 1: Testing Infrastructure (28 points)
**Focus:** Test Coverage 14.94% → 50%

| Story ID | Story | Points | Priority |
|----------|-------|--------|----------|
| US-TEST-1 | PropertiesService Test Suite | 8 | P0 🔴 |
| US-TEST-2 | ContractorsService Test Suite | 6 | P0 🔴 |
| US-TEST-3 | CertificatesService Test Suite | 6 | P0 🔴 |
| US-TEST-4 | AuthService Test Suite | 5 | P0 🔴 |
| US-TEST-5 | PhotosService Test Suite | 3 | P1 🟠 |

**Week 1 Deliverable:** 5 services with 80%+ test coverage each

---

### Week 2: Security Hardening (32 points)
**Focus:** OWASP Top 10 Compliance

| Story ID | Story | Points | Priority |
|----------|-------|--------|----------|
| US-SEC-1 | Rate Limiting on All Endpoints | 5 | P0 🔴 |
| US-SEC-2 | Input Sanitization (XSS Prevention) | 5 | P0 🔴 |
| US-SEC-3 | Security Penetration Testing | 8 | P0 🔴 |
| US-SEC-4 | Multi-Tenancy Security Audit | 6 | P0 🔴 |
| US-TEST-6 | Integration Tests (API Endpoints) | 8 | P0 🔴 |

**Week 2 Deliverable:** Zero critical security vulnerabilities, all endpoints protected

---

### Week 3: Performance & CI/CD (29 points)
**Focus:** Production Readiness

| Story ID | Story | Points | Priority |
|----------|-------|--------|----------|
| US-PERF-1 | API Performance Benchmarking | 5 | P0 🔴 |
| US-PERF-2 | Database Query Optimization | 8 | P1 🟠 |
| US-PERF-3 | Error Handling & Logging Improvements | 6 | P1 🟠 |
| US-CI-1 | GitHub Actions CI/CD Pipeline | 5 | P0 🔴 |
| US-CI-2 | Automated Test Runs on PRs | 3 | P0 🔴 |
| US-DOCS-1 | API Documentation (OpenAPI/Swagger) | 2 | P2 🟡 |

**Week 3 Deliverable:** <500ms API responses, automated testing, production-ready infrastructure

---

## 📋 User Stories (Detailed)

### 🧪 WEEK 1: Testing Infrastructure

---

#### US-TEST-1: PropertiesService Test Suite
**As a** developer
**I want** comprehensive tests for PropertiesService
**So that** property CRUD operations are guaranteed to work and maintain multi-tenancy isolation

**Priority:** P0 🔴 Critical
**Story Points:** 8
**Effort:** ~8 hours
**Assignee:** Developer
**Sprint:** Phase 1, Week 1

**Acceptance Criteria:**
- [ ] ✅ Test coverage for PropertiesService ≥80%
- [ ] ✅ All CRUD operations tested (create, read, update, delete)
- [ ] ✅ Multi-tenancy filtering validated (tenant A cannot see tenant B's properties)
- [ ] ✅ Soft delete behavior tested (deleted_at timestamp)
- [ ] ✅ Pagination and sorting tested
- [ ] ✅ UK postcode validation tested
- [ ] ✅ Cross-tenant access returns 404 (not 403)
- [ ] ✅ All tests passing in CI

**Technical Tasks:**
1. Create `apps/api/src/services/__tests__/PropertiesService.test.ts`
2. Mock Prisma client for unit tests
3. Test `listProperties()` - multi-tenancy, pagination, filters
4. Test `getPropertyById()` - found, not found, cross-tenant
5. Test `createProperty()` - valid data, validation errors, tenant_id injection
6. Test `updateProperty()` - partial updates, tenant ownership verification
7. Test `deleteProperty()` - soft delete, active work order validation
8. Test `restoreProperty()` - soft delete restoration
9. Run `pnpm test --coverage` to verify ≥80%

**Dependencies:**
- Jest + ts-jest configured (already present)
- Prisma mock setup pattern (reference WorkOrdersService tests)

**Definition of Done:**
- All tests passing (`pnpm test`)
- Coverage ≥80% for PropertiesService
- No console errors or warnings
- Tests run in <10 seconds
- Code reviewed (self-review for solo dev)

**Related Technical Debt:** TD-001 (Low Test Coverage)

---

#### US-TEST-2: ContractorsService Test Suite
**As a** developer
**I want** comprehensive tests for ContractorsService
**So that** contractor management is reliable and specialty filtering works correctly

**Priority:** P0 🔴 Critical
**Story Points:** 6
**Effort:** ~6 hours

**Acceptance Criteria:**
- [ ] ✅ Test coverage for ContractorsService ≥80%
- [ ] ✅ CRUD operations tested
- [ ] ✅ Specialty filtering tested (PLUMBING, ELECTRICAL, etc.)
- [ ] ✅ Preferred contractor logic tested
- [ ] ✅ UK phone number validation tested (+44 format)
- [ ] ✅ Multi-tenancy enforcement tested

**Technical Tasks:**
1. Create `apps/api/src/services/__tests__/ContractorsService.test.ts`
2. Test `listContractors()` - filters, specialty, preferred sorting
3. Test `getContractorById()` - found, not found, cross-tenant
4. Test `createContractor()` - phone validation, specialty enum
5. Test `updateContractor()` - partial updates, tenant verification
6. Test `deleteContractor()` - soft delete, active work orders check
7. Test `searchBySpecialty()` - case-insensitive, multiple specialties

**Definition of Done:**
- All tests passing
- Coverage ≥80%
- Phone validation edge cases covered
- Multi-tenancy isolation verified

**Related Technical Debt:** TD-001 (Low Test Coverage)

---

#### US-TEST-3: CertificatesService Test Suite
**As a** developer
**I want** comprehensive tests for CertificatesService
**So that** UK compliance tracking is bulletproof and expiry logic is accurate

**Priority:** P0 🔴 Critical
**Story Points:** 6
**Effort:** ~6 hours

**Acceptance Criteria:**
- [ ] ✅ Test coverage for CertificatesService ≥80%
- [ ] ✅ Certificate upload flow tested (PDF to S3)
- [ ] ✅ Expiry date calculations tested (days until expiry)
- [ ] ✅ Expiring-soon logic tested (60, 30, 7 days)
- [ ] ✅ Certificate types validated (GAS_SAFETY, ELECTRICAL, EPC, STL_LICENSE)
- [ ] ✅ Multi-tenancy enforcement tested
- [ ] ✅ S3 upload mocked properly

**Technical Tasks:**
1. Create `apps/api/src/services/__tests__/CertificatesService.test.ts`
2. Mock AWS S3 client
3. Test `uploadCertificate()` - PDF validation, S3 upload
4. Test `listCertificates()` - filters by type, property
5. Test `getExpiringCertificates()` - 60/30/7 day thresholds
6. Test `getExpiredCertificates()` - past expiry date
7. Test `calculateDaysUntilExpiry()` - edge cases (today, past)
8. Test `deleteCertificate()` - S3 deletion + DB soft delete

**Definition of Done:**
- All tests passing
- Coverage ≥80%
- S3 mocks reliable
- Expiry calculations validated with edge cases

**Related Technical Debt:** TD-001 (Low Test Coverage)

---

#### US-TEST-4: AuthService Test Suite
**As a** developer
**I want** comprehensive tests for AuthService
**So that** authentication is secure and JWT token handling is correct

**Priority:** P0 🔴 Critical
**Story Points:** 5
**Effort:** ~5 hours

**Acceptance Criteria:**
- [ ] ✅ Test coverage for AuthService ≥90% (auth is critical)
- [ ] ✅ User registration tested (creates user + tenant)
- [ ] ✅ Login tested (valid/invalid credentials)
- [ ] ✅ Token generation tested (access + refresh tokens)
- [ ] ✅ Token refresh tested (valid/expired refresh tokens)
- [ ] ✅ Password hashing tested (bcrypt, 10 rounds)
- [ ] ✅ Password reset flow tested
- [ ] ✅ Multi-tenancy tenant creation tested

**Technical Tasks:**
1. Create `apps/api/src/services/__tests__/AuthService.test.ts`
2. Test `register()` - creates user + tenant, returns tokens
3. Test `login()` - valid credentials, invalid credentials, account locked
4. Test `refreshToken()` - valid refresh, expired refresh, revoked token
5. Test `hashPassword()` - bcrypt rounds, salt uniqueness
6. Test `verifyPassword()` - correct password, wrong password
7. Test `generateTokens()` - JWT payload structure, expiry times
8. Test `forgotPassword()` - token generation, email sending (mocked)
9. Test `resetPassword()` - valid token, expired token, password update

**Definition of Done:**
- All tests passing
- Coverage ≥90%
- JWT edge cases covered
- Password security validated

**Related Technical Debt:** TD-001 (Low Test Coverage)

---

#### US-TEST-5: PhotosService Test Suite
**As a** developer
**I want** comprehensive tests for PhotosService
**So that** photo uploads and AI quality checks work reliably

**Priority:** P1 🟠 High
**Story Points:** 3
**Effort:** ~3 hours

**Acceptance Criteria:**
- [ ] ✅ Test coverage for PhotosService ≥70%
- [ ] ✅ Photo upload flow tested (multipart/form-data → S3)
- [ ] ✅ Thumbnail generation tested (Sharp library)
- [ ] ✅ File size validation tested (<10MB)
- [ ] ✅ MIME type validation tested (image/jpeg, image/png only)
- [ ] ✅ Google Vision API integration tested (mocked)
- [ ] ✅ Multi-tenancy enforcement tested

**Technical Tasks:**
1. Create `apps/api/src/services/__tests__/PhotosService.test.ts`
2. Mock AWS S3 upload
3. Mock Sharp thumbnail generation
4. Mock Google Vision API calls
5. Test `uploadPhoto()` - success, file too large, invalid type
6. Test `generateThumbnail()` - resize to 200x200
7. Test `analyzePhotoQuality()` - brightness, blur detection
8. Test `deletePhoto()` - S3 deletion + DB soft delete
9. Test `getPhotosByProperty()` - filters, multi-tenancy

**Definition of Done:**
- All tests passing
- Coverage ≥70%
- S3 and Vision API mocks working
- File validation edge cases covered

**Related Technical Debt:** TD-001 (Low Test Coverage)

---

### 🔒 WEEK 2: Security Hardening

---

#### US-SEC-1: Rate Limiting on All Endpoints
**As a** system administrator
**I want** rate limiting on all API endpoints
**So that** the API is protected from DoS attacks and abuse

**Priority:** P0 🔴 Critical
**Story Points:** 5
**Effort:** ~5 hours

**Acceptance Criteria:**
- [ ] ✅ All endpoints have rate limiting (currently only auth endpoints)
- [ ] ✅ Properties endpoints: 100 req/15min/IP
- [ ] ✅ Work orders endpoints: 100 req/15min/IP
- [ ] ✅ Photos upload: 10 req/15min/IP (strict limit due to cost)
- [ ] ✅ Certificates upload: 5 req/15min/IP
- [ ] ✅ Rate limit headers included (X-RateLimit-Limit, X-RateLimit-Remaining)
- [ ] ✅ 429 Too Many Requests response with Retry-After header
- [ ] ✅ Rate limits configurable via environment variables

**Technical Tasks:**
1. Install `express-rate-limit` if not present
2. Create `apps/api/src/middleware/rateLimiter.ts` with multiple configs
3. Apply rate limiters to route groups:
   - Properties routes (`/api/properties/*`)
   - Work orders routes (`/api/work-orders/*`)
   - Contractors routes (`/api/contractors/*`)
   - Photos routes (`/api/photos/*`)
   - Certificates routes (`/api/certificates/*`)
4. Add environment variables for rate limit configuration
5. Test rate limiting with integration tests
6. Document rate limits in API documentation

**Definition of Done:**
- All endpoints protected
- Rate limits tested (integration tests)
- 429 responses correctly formatted
- Environment variables documented

**Related Technical Debt:** TD-005 (Limited Rate Limiting)

---

#### US-SEC-2: Input Sanitization (XSS Prevention)
**As a** security engineer
**I want** HTML sanitization on all text inputs
**So that** XSS attacks are prevented

**Priority:** P0 🔴 Critical
**Story Points:** 5
**Effort:** ~5 hours

**Acceptance Criteria:**
- [ ] ✅ All text inputs sanitized (HTML tags stripped or encoded)
- [ ] ✅ Script tags blocked
- [ ] ✅ Dangerous attributes removed (onclick, onerror, etc.)
- [ ] ✅ Property names, descriptions, addresses sanitized
- [ ] ✅ Work order titles, descriptions sanitized
- [ ] ✅ Contractor notes sanitized
- [ ] ✅ Certificate notes sanitized
- [ ] ✅ Sanitization happens before database write

**Technical Tasks:**
1. Install `dompurify` (or `xss` for Node.js)
2. Create `apps/api/src/utils/sanitize.ts` helper
3. Add sanitization middleware or use in Zod schemas
4. Apply to all text fields in services:
   - PropertiesService: name, address fields, notes
   - WorkOrdersService: title, description, notes
   - ContractorsService: name, company, notes
   - CertificatesService: notes, issuer_name
5. Write tests for sanitization (script injection, HTML injection)
6. Document sanitization strategy

**Definition of Done:**
- All text inputs sanitized
- XSS injection tests passing
- No breaking changes to existing functionality
- Documentation updated

**Related Technical Debt:** TD-006 (No Input Sanitization Beyond Validation)

---

#### US-SEC-3: Security Penetration Testing
**As a** security engineer
**I want** a comprehensive security audit
**So that** OWASP Top 10 vulnerabilities are identified and fixed

**Priority:** P0 🔴 Critical
**Story Points:** 8
**Effort:** ~8 hours

**Acceptance Criteria:**
- [ ] ✅ OWASP Top 10 checklist completed
- [ ] ✅ SQL injection testing (Prisma ORM protects, but validate)
- [ ] ✅ XSS testing (manual + automated with OWASP ZAP)
- [ ] ✅ CSRF testing (API is stateless, but validate)
- [ ] ✅ Authentication bypass attempts
- [ ] ✅ Authorization bypass attempts (cross-tenant access)
- [ ] ✅ Broken access control testing
- [ ] ✅ Security misconfiguration review
- [ ] ✅ All critical/high vulnerabilities fixed
- [ ] ✅ Security audit report documented

**Technical Tasks:**
1. Manual penetration testing:
   - Try SQL injection on all endpoints
   - Try XSS on all text inputs
   - Try cross-tenant access (tenant A → tenant B data)
   - Try authentication bypass (tampered JWT, expired JWT)
   - Try privilege escalation (regular user → admin)
2. Automated scan with OWASP ZAP:
   - Run ZAP against localhost:3001
   - Review and triage findings
3. Fix critical and high vulnerabilities
4. Document findings in `docs/SECURITY_AUDIT_REPORT.md`
5. Create security test suite for ongoing validation

**Definition of Done:**
- Zero critical vulnerabilities
- All high vulnerabilities fixed or risk-accepted
- Security report documented
- Security tests added to CI

**Related Technical Debt:** TD-007 (No Security Penetration Testing)

---

#### US-SEC-4: Multi-Tenancy Security Audit
**As a** security engineer
**I want** rigorous multi-tenancy isolation testing
**So that** no tenant can access another tenant's data

**Priority:** P0 🔴 Critical
**Story Points:** 6
**Effort:** ~6 hours

**Acceptance Criteria:**
- [ ] ✅ All database queries filter by tenant_id (audit complete)
- [ ] ✅ Cross-tenant access attempts return 404 (not 403)
- [ ] ✅ JWT tenant_id cannot be tampered (signature validation)
- [ ] ✅ No raw tenant_id accepted from request body (only from JWT)
- [ ] ✅ All services enforce tenant isolation
- [ ] ✅ Multi-tenancy test suite created
- [ ] ✅ Audit report documented

**Technical Tasks:**
1. Audit all service methods for tenant_id filtering:
   - PropertiesService ✅ (verify all methods)
   - WorkOrdersService ✅ (already tested)
   - ContractorsService ❓ (audit)
   - CertificatesService ❓ (audit)
   - PhotosService ❓ (audit)
2. Write integration tests for cross-tenant access:
   - User A tries to access User B's property
   - User A tries to update User B's work order
   - User A tries to delete User B's contractor
3. Verify JWT signature validation prevents tenant_id tampering
4. Ensure no endpoints accept tenant_id from request body
5. Document multi-tenancy security guarantees

**Definition of Done:**
- All services audited
- All cross-tenant tests passing (404 responses)
- No tenant_id leakage
- Documentation updated

**Related Technical Debt:** TD-007 (Security Penetration Testing - Multi-Tenancy)

---

#### US-TEST-6: Integration Tests (API Endpoints)
**As a** developer
**I want** integration tests for all API endpoints
**So that** API contracts are validated end-to-end

**Priority:** P0 🔴 Critical
**Story Points:** 8
**Effort:** ~8 hours

**Acceptance Criteria:**
- [ ] ✅ All authentication endpoints tested (register, login, refresh)
- [ ] ✅ All properties endpoints tested (CRUD)
- [ ] ✅ All work orders endpoints tested (CRUD, assign, status)
- [ ] ✅ All contractors endpoints tested (CRUD)
- [ ] ✅ All photos endpoints tested (upload, delete)
- [ ] ✅ All certificates endpoints tested (upload, list, expiring)
- [ ] ✅ Integration tests run in CI
- [ ] ✅ Test database seeded/cleared between tests

**Technical Tasks:**
1. Install `supertest` if not present
2. Create `apps/api/src/__tests__/integration/` directory
3. Create test database setup/teardown helpers
4. Write integration tests:
   - `auth.test.ts` - Register → Login → Refresh flow
   - `properties.test.ts` - CRUD + multi-tenancy
   - `workOrders.test.ts` - CRUD + assign + status updates
   - `contractors.test.ts` - CRUD + specialty filtering
   - `photos.test.ts` - Upload + quality analysis (mocked)
   - `certificates.test.ts` - Upload + expiry logic
5. Configure test database (separate from dev DB)
6. Add integration tests to CI pipeline

**Definition of Done:**
- All endpoints tested
- Tests passing in CI
- Test coverage for integration layer ≥80%
- Database properly cleaned between tests

**Related Technical Debt:** TD-002 (No Integration Tests)

---

### ⚡ WEEK 3: Performance & CI/CD

---

#### US-PERF-1: API Performance Benchmarking
**As a** developer
**I want** performance benchmarks for all API endpoints
**So that** we can measure and improve response times

**Priority:** P0 🔴 Critical
**Story Points:** 5
**Effort:** ~5 hours

**Acceptance Criteria:**
- [ ] ✅ All endpoints benchmarked (p50, p95, p99 response times)
- [ ] ✅ Target: <500ms p95 response time
- [ ] ✅ Slow endpoints identified and logged
- [ ] ✅ Performance monitoring dashboard (optional: Grafana)
- [ ] ✅ Performance tests in CI (fail if regressions)
- [ ] ✅ Baseline metrics documented

**Technical Tasks:**
1. Install `autocannon` or `artillery` for load testing
2. Create performance test scripts:
   - `GET /api/properties` (list endpoint)
   - `POST /api/work-orders` (create endpoint)
   - `GET /api/work-orders/:id` (detail endpoint)
3. Run benchmarks with 50 concurrent users
4. Document baseline metrics
5. Add performance tests to CI (run weekly, not on every commit)
6. Create alerts for p95 > 500ms

**Definition of Done:**
- All endpoints benchmarked
- Baseline metrics documented
- Performance tests automated
- No endpoints >500ms p95

**Related Technical Debt:** None (new requirement)

---

#### US-PERF-2: Database Query Optimization
**As a** developer
**I want** optimized database queries
**So that** API responses are fast even with large datasets

**Priority:** P1 🟠 High
**Story Points:** 8
**Effort:** ~8 hours

**Acceptance Criteria:**
- [ ] ✅ All Prisma queries analyzed with EXPLAIN
- [ ] ✅ Missing indexes identified and added
- [ ] ✅ N+1 query problems fixed
- [ ] ✅ Pagination implemented correctly (cursor-based)
- [ ] ✅ Database connection pooling optimized
- [ ] ✅ Query performance improved by ≥30%

**Technical Tasks:**
1. Enable Prisma query logging
2. Analyze slow queries:
   - `listProperties()` with filters
   - `listWorkOrders()` with includes (property, contractor)
   - `listCertificates()` with expiry calculations
3. Add missing indexes:
   - `tenant_id` (already indexed, verify all tables)
   - `created_at` (for sorting)
   - `status` on WorkOrder (for filtering)
   - `expiry_date` on Certificate (for expiring-soon)
4. Fix N+1 problems with Prisma `include` and `select`
5. Implement cursor-based pagination for large lists
6. Test with 10,000+ records

**Definition of Done:**
- All queries <100ms
- No N+1 queries
- Indexes on all filter/sort columns
- Performance tests passing

**Related Technical Debt:** None (proactive optimization)

---

#### US-PERF-3: Error Handling & Logging Improvements
**As a** developer
**I want** comprehensive error handling and logging
**So that** production issues can be debugged quickly

**Priority:** P1 🟠 High
**Story Points:** 6
**Effort:** ~6 hours

**Acceptance Criteria:**
- [ ] ✅ All errors caught and logged with context
- [ ] ✅ Error logs include request ID for tracing
- [ ] ✅ Sensitive data redacted from logs (passwords, tokens)
- [ ] ✅ Winston logging configured for production
- [ ] ✅ Log rotation configured
- [ ] ✅ Error monitoring (optional: Sentry integration)

**Technical Tasks:**
1. Review all try-catch blocks for proper error handling
2. Add request ID middleware (uuid for each request)
3. Update logger to include request ID in all logs
4. Audit logs for sensitive data leakage:
   - Passwords (should never be logged)
   - JWT tokens (redact in logs)
   - API keys (redact in logs)
5. Configure Winston for production:
   - Log level: error, warn, info
   - Log rotation: daily, max 14 days
   - Separate error log file
6. (Optional) Add Sentry for error tracking

**Definition of Done:**
- All errors logged with context
- No sensitive data in logs
- Production logging configured
- Log rotation working

**Related Technical Debt:** None (general improvement)

---

#### US-CI-1: GitHub Actions CI/CD Pipeline
**As a** developer
**I want** automated CI/CD pipeline
**So that** tests run automatically and deployments are consistent

**Priority:** P0 🔴 Critical
**Story Points:** 5
**Effort:** ~5 hours

**Acceptance Criteria:**
- [ ] ✅ GitHub Actions workflow created
- [ ] ✅ Tests run on every push to main
- [ ] ✅ Tests run on every pull request
- [ ] ✅ Linting enforced (ESLint, Prettier)
- [ ] ✅ Build validation (TypeScript compilation)
- [ ] ✅ Test coverage reported in PR comments
- [ ] ✅ Failed tests block PR merges

**Technical Tasks:**
1. Create `.github/workflows/ci.yml`
2. Configure workflow:
   - Node.js 20 LTS
   - pnpm setup
   - Install dependencies
   - Run linters
   - Run type check
   - Run unit tests
   - Run integration tests
   - Upload coverage report
3. Configure branch protection rules (require CI to pass)
4. Add status badge to README.md

**Definition of Done:**
- CI runs on all pushes
- Failed tests block merges
- Coverage reports visible
- Badge in README

**Related Technical Debt:** TD-004 (Manual Testing Only)

---

#### US-CI-2: Automated Test Runs on PRs
**As a** developer
**I want** tests to run automatically on pull requests
**So that** code quality is enforced before merge

**Priority:** P0 🔴 Critical
**Story Points:** 3
**Effort:** ~3 hours

**Acceptance Criteria:**
- [ ] ✅ All tests run on PR creation
- [ ] ✅ Test results visible in PR UI
- [ ] ✅ Coverage diff shown (% change from base branch)
- [ ] ✅ Failed tests prevent merge
- [ ] ✅ Status checks required before merge

**Technical Tasks:**
1. Configure GitHub branch protection:
   - Require status checks to pass before merging
   - Require branches to be up to date before merging
2. Configure PR comments with test results
3. Add coverage diff reporting
4. Test workflow with sample PR

**Definition of Done:**
- PRs show test results
- Coverage diff visible
- Failed tests block merge
- Workflow tested

**Related Technical Debt:** TD-004 (Manual Testing Only)

---

#### US-DOCS-1: API Documentation (OpenAPI/Swagger)
**As a** API consumer
**I want** comprehensive API documentation
**So that** I can integrate with the API easily

**Priority:** P2 🟡 Medium
**Story Points:** 2
**Effort:** ~2 hours

**Acceptance Criteria:**
- [ ] ✅ Swagger/OpenAPI spec generated
- [ ] ✅ All endpoints documented
- [ ] ✅ Request/response schemas defined
- [ ] ✅ Authentication requirements documented
- [ ] ✅ Example requests included
- [ ] ✅ Swagger UI accessible at `/api-docs`

**Technical Tasks:**
1. Install `swagger-jsdoc` and `swagger-ui-express`
2. Add JSDoc comments to all routes
3. Generate OpenAPI spec
4. Serve Swagger UI at `/api-docs`
5. Add authentication button to Swagger UI
6. Test all endpoints from Swagger UI

**Definition of Done:**
- Swagger UI accessible
- All endpoints documented
- Authentication working in UI
- Examples accurate

**Related Technical Debt:** None (documentation improvement)

---

## 📈 Success Metrics

### Phase 1 Goals
| Metric | Start | Target | How We'll Measure |
|--------|-------|--------|-------------------|
| **Test Coverage** | 14.94% | 70% | `pnpm test --coverage` |
| **Critical Vulnerabilities** | Unknown | 0 | OWASP ZAP scan + manual testing |
| **API Response Time (p95)** | Unknown | <500ms | Autocannon benchmarks |
| **Rate Limited Endpoints** | 3/35 | 35/35 | Route audit |
| **CI/CD Automation** | Manual | Automated | GitHub Actions workflow |

### Week-by-Week Targets
- **Week 1 End:** Test coverage 50%, 5 services with tests
- **Week 2 End:** Zero critical vulnerabilities, all endpoints rate-limited, integration tests complete
- **Week 3 End:** Performance benchmarked, CI/CD automated, <500ms p95

---

## 🚧 Risks & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Test writing takes longer than estimated | Medium | High | Prioritize critical services first (Properties, Auth) |
| Security audit reveals major issues | Medium | High | Allocate buffer in Week 2, defer non-critical items |
| Performance optimization requires architecture changes | Low | High | Start with low-hanging fruit (indexes, caching) |
| CI/CD setup issues with GitHub Actions | Low | Medium | Use existing templates, test locally first |

---

## 📝 Definition of Done (Phase 1)

Phase 1 is complete when:
- [ ] ✅ Test coverage ≥70% across all services
- [ ] ✅ Zero critical security vulnerabilities
- [ ] ✅ All API endpoints rate-limited
- [ ] ✅ Multi-tenancy isolation validated
- [ ] ✅ API response time <500ms (p95)
- [ ] ✅ GitHub Actions CI/CD pipeline operational
- [ ] ✅ All tests passing in CI
- [ ] ✅ Technical debt register updated (8 critical items resolved)

---

## 📦 Dependencies & Prerequisites

**Before Starting Week 1:**
- [ ] Development environment set up (Node.js 20 LTS, pnpm, PostgreSQL)
- [ ] All Sprints 1-5 code reviewed and understood
- [ ] Test framework configured (Jest already present)
- [ ] Codebase compiles with no errors

**Before Starting Week 2:**
- [ ] Week 1 tests passing
- [ ] Test coverage ≥50%
- [ ] OWASP ZAP installed for security scanning

**Before Starting Week 3:**
- [ ] Week 2 security fixes complete
- [ ] Integration tests passing
- [ ] GitHub Actions access configured

---

## 🎯 Next Steps (After Phase 1)

Once Phase 1 is complete, proceed to:
- **Phase 2:** UX Excellence (Weeks 4-7) - Polish web and mobile UX
- **Phase 3:** Feature Completeness (Weeks 8-10) - Add search, batch ops, reporting
- **Phase 4:** Competitive Differentiation (Weeks 11-13) - AI features, tenant portal, WhatsApp
- **Phase 5:** Beta Testing (Weeks 14-16) - Real-world validation

---

## 📞 Questions & Support

**Product Owner:** Sarah (PO Agent)
**Documentation:** See [QUALITY_ROADMAP.md](QUALITY_ROADMAP.md) for overall plan
**Technical Debt:** See [TECHNICAL_DEBT_REGISTER.md](TECHNICAL_DEBT_REGISTER.md) for full list
**Architecture:** See [../HANDOVER.md](../HANDOVER.md) for codebase overview

---

**Status:** ✅ APPROVED - Ready for Development
**Created:** 2025-10-30
**Last Updated:** 2025-10-30
**Sprint Starts:** When developer is ready

---

**Let's build a bulletproof foundation! 🚀**
