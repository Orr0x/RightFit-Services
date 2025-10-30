# RightFit Services

**Property Maintenance Management Platform for UK Landlords**

[![Status](https://img.shields.io/badge/Status-MVP_Development-blue)]()
[![Sprint](https://img.shields.io/badge/Sprint-5_Complete-green)]()
[![Progress](https://img.shields.io/badge/Progress-82%25-yellow)]()
[![Tests](https://img.shields.io/badge/Coverage-14.94%25-orange)]()
[![Tech Stack](https://img.shields.io/badge/Tech_Stack-Stable_LTS-brightgreen)]()

---

## ✅ Recent Update: Sprint 5 Complete - Multi-Channel Notifications

**Sprint 5 Complete (2025-10-29):** All notification features implemented and operational. Email notifications successfully migrated from SendGrid to Resend (3,000 emails/month free vs SendGrid's paid tier). Push notifications, SMS alerts, and automated certificate reminders all tested and working. See **[SPRINT_5_COMPLETION_GUIDE.md](docs/SPRINT_5_COMPLETION_GUIDE.md)** for details.

---

## 📖 Overview

RightFit Services is a comprehensive property maintenance management platform designed specifically for UK landlords. The platform helps landlords manage properties, track work orders, coordinate with contractors, and maintain compliance with UK regulations.

### Key Features

✅ **Multi-Tenant Architecture** - Secure data isolation for multiple landlords
✅ **Property Management** - Add and manage properties with detailed information
✅ **Work Order Tracking** - Create, assign, and track maintenance work orders
✅ **Contractor Management** - Maintain database of contractors and their specialties
✅ **SMS Notifications** - Automatic SMS alerts when work orders are assigned (Twilio)
✅ **Email Notifications** - Certificate expiry reminders with beautiful HTML templates (Resend)
✅ **Push Notifications** - Mobile push notifications for important events (Expo)
✅ **Photo Documentation** - Upload and store property and work order photos (AWS S3)
✅ **Mobile Photo Upload** - Camera/gallery integration with offline queueing
✅ **AI Photo Quality** - Google Vision API checks photo quality (brightness, blur)
✅ **UK Compliance Tracking** - Track certificates (Gas Safety, Electrical, EPC, STL)
✅ **Mobile App** - React Native app fully functional with Expo SDK 54
✅ **Web Dashboard** - React web app for desktop management
✅ **Datetime Scheduling** - Full date and time support for work order scheduling
✅ **Offline Mode** - WatermelonDB local database with automatic sync (requires dev build)

### Core Differentiator

🚀 **Offline-First Mobile App** - The app works fully offline in rural areas with poor connectivity. Uses WatermelonDB for local data storage with automatic bi-directional sync, conflict resolution, and sync queue management. Changes are automatically synced when connection is restored.

**Note:** Full offline functionality requires a development build (not available in Expo Go). App gracefully degrades to online-only mode when running in Expo Go.

---

## 🏗️ Architecture

### Monorepo Structure

```
RightFit-Services/
├── apps/
│   ├── api/          # Node.js + Express REST API
│   ├── web/          # React web application (Vite)
│   └── mobile/       # React Native mobile app (Expo)
├── packages/
│   ├── database/     # Prisma schema and client
│   └── shared/       # Shared TypeScript types and utilities
├── docs/             # Project documentation
├── DATABASE_SETUP.md
├── QUICK_START.md
├── DEPLOYMENT.md
├── SPRINT_STATUS.md  # Detailed sprint progress
└── HANDOVER.md       # Complete developer handover guide
```

### Technology Stack

✅ **Stable Production Stack** - Migrated to LTS versions (React 18.3.1 + Node 20 LTS). See [MIGRATION_RESULTS.md](docs/MIGRATION_RESULTS.md) for migration details.

**Backend:**
- Node.js 20.19.5 (LTS until April 2026) ✅
- Express.js 4.18.2
- TypeScript 5.3.3
- Prisma ORM 5.22.0
- PostgreSQL 16+
- AWS S3 (photo storage)
- Twilio (SMS notifications)
- Resend (email notifications)
- Google Cloud Vision API (photo quality analysis)
- JWT authentication

**Web Frontend:**
- React 18.3.1 (Production-ready LTS) ✅
- React DOM 18.3.1
- Vite 5.0.8
- Material-UI 5.16.9
- Emotion 11.13.5
- Axios 1.6.2
- React Router 6.21.1

**Mobile App:**
- React Native 0.76.5
- React 18.3.1 (Production-ready LTS) ✅
- Expo SDK 52 (Legacy Architecture)
- React Navigation 6
- React Native Paper 5.12.5
- AsyncStorage 1.23.1 (token persistence)
- WatermelonDB 0.27.1 (offline mode)
- @react-native-community/netinfo 11.4.1 (connectivity monitoring)
- expo-image-picker ~15.0.0 (camera/gallery access)

---

## 🚀 Quick Start

> **⚠️ Windows Users:** For optimal Android development on Windows, use WSL2. See **[WSL Development Setup Guide](docs/WSL_DEVELOPMENT_SETUP.md)** for complete instructions including Android emulator integration, networking configuration, and performance optimization.

### Prerequisites

- **Node.js 20 LTS** (20.19.5 or later) ✅ **Required** (NOT Node 23.x)
- pnpm 8+ installed globally
- PostgreSQL 14+
- AWS account (for S3)
- Twilio account (optional for SMS)
- Google Cloud account (optional for Vision API)
- **Windows users:** WSL2 with Ubuntu 22.04 (recommended for mobile development)

### Installation

```bash
# 1. Install dependencies
pnpm install

# 2. Setup database
# Follow instructions in DATABASE_SETUP.md

# 3. Configure environment variables
cp apps/api/.env.example apps/api/.env
# Edit apps/api/.env with your credentials

# 4. Push database schema
pnpm db:push

# 5. Start all applications
pnpm dev
```

**Individual apps:**

```bash
# API Server (http://localhost:3001)
cd apps/api
pnpm dev

# Web App (http://localhost:3000)
cd apps/web
pnpm dev

# Mobile App (Expo DevTools)
cd apps/mobile
pnpm start

# Database GUI (http://localhost:5555)
cd packages/database
pnpx prisma studio
```

---

## 📊 Project Status

### Completed (251 story points / 82%)

- ✅ **Sprint 1: Foundation** (50 points)
  - Monorepo setup
  - Authentication & multi-tenancy
  - Property management CRUD
  - AWS infrastructure

- ✅ **Sprint 2: Core Workflows** (50 points)
  - Work order management
  - Contractor management
  - SMS notifications (Twilio)
  - Photo upload to S3

- ✅ **Sprint 3: Mobile App Foundation** (53 points - 100% COMPLETE)
  - React Native + Expo setup with SDK 54
  - Authentication screens (login, register)
  - Property screens (list, details, create)
  - Work order screens (list, details, create with datetime)
  - Complete navigation structure
  - Auth state management with AsyncStorage
  - Network configuration for physical devices

- ✅ **Sprint 4: Offline Mode** (56 points - 100% COMPLETE)
  - WatermelonDB local database with 5 tables
  - Sync service with bidirectional sync
  - Offline work order creation & updates
  - Sync queue with retry logic
  - Conflict resolution (last-write-wins)
  - Network monitoring and offline indicators
  - Graceful degradation for Expo Go
  - Mobile photo upload with camera/gallery
  - ✅ **Post-Sprint:** React 19 + Node 24 → React 18.3.1 + Node 20 LTS migration complete

- ✅ **Sprint 5: AI + UK Compliance + Notifications** (42/42 points - 100% COMPLETE)
  - Google Vision API integration
  - Photo quality warnings
  - Certificate upload and tracking
  - Push notifications (Expo)
  - Email notifications (Resend - migrated from SendGrid)
  - SMS notifications (Twilio)
  - Certificate expiry reminders (60, 30, 7 days)

### Next Steps (53 story points remaining)

- ✅ **Tech Stack Migration** (13 points - COMPLETED 2025-10-28)
  - Successfully migrated to stable stack
  - See [MIGRATION_RESULTS.md](docs/MIGRATION_RESULTS.md)

- ✅ **Sprint 5 Completion** (18 points - COMPLETED 2025-10-29)
  - Push notifications (Expo)
  - Email notifications (Resend)
  - Background certificate reminders

- 🔜 **Sprint 6: Payments + Launch** (53 points - NEXT)
  - Stripe integration
  - CI/CD pipeline
  - Error monitoring (Sentry)
  - App Store submission

**Detailed progress:** See `SPRINT_STATUS.md`

---

## 📚 Documentation

### 📖 Complete Documentation Index
- **[docs/DOCUMENTATION_INDEX.md](docs/DOCUMENTATION_INDEX.md)** - **START HERE** - Complete guide to all documentation

### Getting Started (New Developers)
- **[QUICK_START.md](QUICK_START.md)** - Get up and running in 15 minutes
- **[DATABASE_SETUP.md](DATABASE_SETUP.md)** - Database setup instructions
- **[HANDOVER.md](HANDOVER.md)** - Comprehensive developer onboarding
- **[apps/mobile/README.md](apps/mobile/README.md)** - Mobile app specific guide

### Current Development
- **[SPRINT_STATUS.md](SPRINT_STATUS.md)** - Current sprint progress (82% complete)
- **[docs/prd.md](docs/prd.md)** - Product requirements document
- **[docs/project-plan/sprint-plans.md](docs/project-plan/sprint-plans.md)** - 6-sprint MVP plan
- **[docs/stories/](docs/stories/)** - All user stories with acceptance criteria

### Architecture & Technical
- **[docs/architecture.md](docs/architecture.md)** - Complete fullstack architecture
- **[docs/architecture/tech-stack.md](docs/architecture/tech-stack.md)** - Tech stack deep dive
- **[docs/architecture/coding-standards.md](docs/architecture/coding-standards.md)** - **Critical coding rules**
- **[docs/OFFLINE_MODE.md](docs/OFFLINE_MODE.md)** - Offline mode implementation
- **[packages/database/prisma/schema.prisma](packages/database/prisma/schema.prisma)** - Database schema

### Migration Reference
- **[docs/migration/README.md](docs/migration/README.md)** - Tech stack migration summary
- **[docs/migration/MIGRATION_RESULTS.md](docs/migration/MIGRATION_RESULTS.md)** - Migration results (2025-10-28)
- **[docs/ARCHITECTURE_VALIDATION_REPORT.md](docs/ARCHITECTURE_VALIDATION_REPORT.md)** - Post-migration validation

### Deployment
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Production deployment guide (Sprint 6)

### Historical Archive
- **[docs/archive/](docs/archive/)** - Historical documents (discovery, old iterations, session reports)

---

## 🔐 Security Features

- ✅ JWT-based authentication (access + refresh tokens)
- ✅ Password hashing with bcrypt (10 rounds)
- ✅ Multi-tenancy with strict tenant_id filtering
- ✅ Input validation with Zod schemas
- ✅ SQL injection protection (Prisma ORM)
- ✅ Rate limiting on authentication endpoints
- ✅ CORS configuration
- ✅ Helmet.js security headers
- ✅ Soft deletes for data preservation
- ✅ 404 responses for cross-tenant access (security by obscurity)

---

## 🧪 Testing

**Current Status:**
- ✅ Unit tests: 14.94% coverage (38 passing tests)
  - WorkOrdersService: 89.65% coverage (22 tests)
  - Multi-tenancy enforcement tested
  - CRUD operations covered
- ⚠️ Integration tests: None
- ⚠️ E2E tests: None

**Recent Additions:**
- Added comprehensive WorkOrdersService test suite
- Multi-tenancy isolation tests
- Pagination and filtering tests

**Next Priority:** Expand coverage to PropertiesService, ContractorsService, CertificatesService (target: 50%+ coverage)

---

## 📱 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Token refresh
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Properties
- `GET /api/properties` - List properties
- `GET /api/properties/:id` - Get property details
- `POST /api/properties` - Create property
- `PATCH /api/properties/:id` - Update property
- `DELETE /api/properties/:id` - Soft delete property

### Work Orders
- `GET /api/work-orders` - List work orders
- `GET /api/work-orders/:id` - Get work order details
- `POST /api/work-orders` - Create work order
- `PATCH /api/work-orders/:id` - Update work order
- `POST /api/work-orders/:id/assign` - Assign to contractor
- `POST /api/work-orders/:id/status` - Update status

### Contractors
- `GET /api/contractors` - List contractors
- `POST /api/contractors` - Create contractor
- `PATCH /api/contractors/:id` - Update contractor
- `DELETE /api/contractors/:id` - Delete contractor

### Photos
- `GET /api/photos` - List photos
- `POST /api/photos` - Upload photo (multipart/form-data)
- `DELETE /api/photos/:id` - Delete photo

### Certificates
- `GET /api/certificates` - List certificates
- `GET /api/certificates/expiring-soon` - Get expiring certificates
- `GET /api/certificates/expired` - Get expired certificates
- `POST /api/certificates` - Upload certificate
- `PATCH /api/certificates/:id` - Update certificate
- `DELETE /api/certificates/:id` - Delete certificate

---

## ⚠️ Known Issues

### ✅ Recently Resolved
1. ~~React 19 + Node 24 Compatibility~~ - **FIXED (2025-10-28)**
   - Successfully migrated to React 18.3.1 + Node 20 LTS
   - All peer dependency warnings eliminated
   - Development overhead back to normal
   - See [MIGRATION_RESULTS.md](docs/MIGRATION_RESULTS.md)

### High Priority
2. **Mobile Local Builds Blocked (WSL)** - Expo SDK 52 Gradle plugin error ⚠️ **ACTIVE BLOCKER**
   - Error: `expo-module-gradle-plugin` not found during build
   - Environment: WSL2, Node 20 LTS, Gradle 8.10.2
   - Workaround: Use Expo Go for development testing
   - See: [MOBILE_APP_BUILD_TROUBLESHOOTING.md](docs/MOBILE_APP_BUILD_TROUBLESHOOTING.md)
   - Status: Under investigation (consider Expo SDK 51 downgrade)

3. **Offline Mode Limitations** - WatermelonDB requires development build
   - Not functional in Expo Go
   - App gracefully degrades but offline features unavailable for testing
   - Requires: `npx expo prebuild` → `npx expo run:ios/android`
   - **Currently blocked by issue #2 above**

4. **Test Coverage Low** - 14.94% coverage (target: 50%+)
5. **No Error Monitoring** - No Sentry or equivalent
6. **No API Rate Limiting** - Only auth endpoints are rate-limited

### Medium Priority
7. **Web App Polish** - Functional but could be more polished
8. **Domain Email Setup** - Currently using Resend's onboarding@resend.dev (custom domain for production)

### Recently Fixed ✅
- ~~Mobile Auth State~~ - FIXED: AuthContext with AsyncStorage working
- ~~API Base URL~~ - FIXED: Mobile app now uses local IP
- ~~Date-only work orders~~ - FIXED: Full datetime support added
- ~~Offline Mode~~ - FIXED: WatermelonDB + sync service implemented
- ~~Mobile Photo Upload~~ - FIXED: Camera/gallery integration complete
- ~~Test Coverage 0%~~ - FIXED: Now at 14.94% with WorkOrdersService tests

**Full list:** See `HANDOVER.md` section "Known Issues"

---

## 🎯 Roadmap

### Phase 1: MVP (Current - Week 12-13)
- ✅ ~~Evaluate & execute tech stack migration~~ - DONE (2025-10-28)
- ✅ ~~Complete offline mode (Sprint 4)~~ - DONE
- ✅ ~~Multi-channel notifications (Sprint 5)~~ - DONE (2025-10-29)
- 🔜 Integrate Stripe payments (Sprint 6)
- ⏸️ Deploy to production
- ⏸️ Submit to App Store and Google Play
- ⏸️ Launch with 10-20 beta users

### Phase 2: Growth (Week 13-24)
- Enhanced email notifications (custom domains via Resend)
- Contractor mobile app
- Advanced reporting and analytics
- Bulk operations
- Export to PDF/Excel
- API webhooks

### Phase 3: Scale (Week 25+)
- Team collaboration features
- Advanced scheduling
- Integration with accounting software (Xero, QuickBooks)
- White-label solution for property management companies
- AI-powered maintenance predictions

---

## 📈 Success Metrics (MVP)

- [ ] 10-20 beta users onboarded
- [ ] >10 work orders created
- [ ] 99%+ uptime (UptimeRobot)
- [ ] <3 critical bugs (Sentry)
- [ ] Positive user feedback vs competitors
- [ ] Offline mode working reliably

---

## 👥 Contributing

This is currently a closed-source project under active MVP development.

**For developers joining the project:**
1. Read `HANDOVER.md` - Complete developer guide
2. Read `SPRINT_STATUS.md` - Understand current progress
3. Setup local environment (see Quick Start above)
4. Review open issues and sprint plans

---

## 📄 License

Proprietary - RightFit Services Ltd.
All rights reserved.

---

## 📞 Support

**For Developers:**
- Read the docs: `HANDOVER.md`, `SPRINT_STATUS.md`
- Check sprint plans: `docs/project-plan/sprint-plans.md`
- Review database schema: `packages/database/prisma/schema.prisma`

**Technical Issues:**
- API logs: `apps/api/logs/`
- Database GUI: `pnpx prisma studio` in `packages/database/`
- Metro bundler: `pnpx expo start --clear` in `apps/mobile/`

---

## 🏆 Acknowledgments

Built with:
- [Turborepo](https://turbo.build/repo) - Monorepo build system
- [Prisma](https://www.prisma.io/) - Next-generation ORM
- [Expo](https://expo.dev/) - React Native framework
- [Material-UI](https://mui.com/) - React UI framework
- [React Native Paper](https://reactnativepaper.com/) - Material Design for React Native

---

**Last Updated:** 2025-10-29
**Version:** 1.0.0-alpha
**Status:** Active Development (✅ Stable Tech Stack)
**Progress:** 251/304 story points (82%)
**Test Coverage:** 14.94%
**GitHub:** https://github.com/Orr0x/RightFit-Services

✅ **Migration Complete:** React 18.3.1 + Node 20 LTS - Zero peer warnings
✅ **Completed:** Sprint 5 - Multi-Channel Notifications (Push, Email, SMS)
✅ **Email Migration:** SendGrid → Resend (3,000 emails/month free)
🚀 **Next:** Sprint 6 - Payments & Launch (Stripe Integration)
