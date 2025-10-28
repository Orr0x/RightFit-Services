# RightFit Services

**Property Maintenance Management Platform for UK Landlords**

[![Status](https://img.shields.io/badge/Status-MVP_Development-blue)]()
[![Sprint](https://img.shields.io/badge/Sprint-3_Complete-green)]()
[![Progress](https://img.shields.io/badge/Progress-58%25-yellow)]()

---

## 📖 Overview

RightFit Services is a comprehensive property maintenance management platform designed specifically for UK landlords. The platform helps landlords manage properties, track work orders, coordinate with contractors, and maintain compliance with UK regulations.

### Key Features

✅ **Multi-Tenant Architecture** - Secure data isolation for multiple landlords
✅ **Property Management** - Add and manage properties with detailed information
✅ **Work Order Tracking** - Create, assign, and track maintenance work orders
✅ **Contractor Management** - Maintain database of contractors and their specialties
✅ **SMS Notifications** - Automatic SMS alerts when work orders are assigned (Twilio)
✅ **Photo Documentation** - Upload and store property and work order photos (AWS S3)
✅ **AI Photo Quality** - Google Vision API checks photo quality (brightness, blur)
✅ **UK Compliance Tracking** - Track certificates (Gas Safety, Electrical, EPC, STL)
✅ **Mobile App** - React Native app with offline capabilities (in progress)
✅ **Web Dashboard** - React web app for desktop management

### Core Differentiator

🚀 **Offline-First Mobile App** - The app works fully offline in rural areas with poor connectivity, automatically syncing changes when connection is restored.

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

**Backend:**
- Node.js + Express.js
- TypeScript
- Prisma ORM
- PostgreSQL
- AWS S3 (photo storage)
- Twilio (SMS notifications)
- Google Cloud Vision API (photo quality analysis)
- JWT authentication

**Web Frontend:**
- React 18
- Vite
- Material-UI (MUI)
- Axios
- React Router

**Mobile App:**
- React Native
- Expo 50+
- React Navigation
- React Native Paper
- AsyncStorage
- (Future) WatermelonDB for offline mode

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm installed globally
- PostgreSQL 14+
- AWS account (for S3)
- Twilio account (optional for SMS)
- Google Cloud account (optional for Vision API)

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

### Completed (177 story points)

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

- ✅ **Sprint 3: Mobile App Foundation** (53 points)
  - React Native + Expo setup
  - Authentication screens
  - Property screens (list, details, create)
  - Work order screens (list, details, create)
  - Complete navigation structure

- ✅ **Sprint 5: AI + UK Compliance** (24/42 points - 57% complete)
  - Google Vision API integration
  - Photo quality warnings
  - Certificate upload and tracking
  - ⏸️ Push notifications (pending)

### Next Steps (127 story points remaining)

- ⏸️ **Sprint 4: Offline Mode** (56 points) - **CRITICAL**
  - WatermelonDB local database
  - Offline work order creation
  - Sync queue processor
  - Conflict resolution

- ⏸️ **Sprint 5 Completion** (18 points)
  - Push notifications (Firebase)
  - Background certificate reminders

- ⏸️ **Sprint 6: Payments + Launch** (53 points)
  - Stripe integration
  - CI/CD pipeline
  - Error monitoring (Sentry)
  - App Store submission

**Detailed progress:** See `SPRINT_STATUS.md`

---

## 📚 Documentation

### Getting Started
- **[QUICK_START.md](QUICK_START.md)** - Quick start guide
- **[DATABASE_SETUP.md](DATABASE_SETUP.md)** - Database setup instructions
- **[apps/mobile/README.md](apps/mobile/README.md)** - Mobile app specific guide

### Development
- **[SPRINT_STATUS.md](SPRINT_STATUS.md)** - Complete sprint status and progress
- **[HANDOVER.md](HANDOVER.md)** - Comprehensive developer handover (START HERE)
- **[SPRINT1_STATUS.md](SPRINT1_STATUS.md)** - Sprint 1 detailed report
- **[docs/project-plan/sprint-plans.md](docs/project-plan/sprint-plans.md)** - Complete sprint plans

### Deployment
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Deployment instructions (Sprint 6)

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
- ⚠️ Unit tests: 0% coverage
- ⚠️ Integration tests: None
- ⚠️ E2E tests: None

**Immediate Priority:** Add unit tests for critical paths (AuthService, PropertiesService, multi-tenancy filtering)

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

### Critical
1. **Mobile Auth State** - Hardcoded `isAuthenticated = false` in `apps/mobile/src/navigation/RootNavigator.tsx:12`
   - **Impact:** App is unusable - always shows login screen
   - **Fix:** Implement AuthContext with AsyncStorage (see HANDOVER.md)

### High Priority
2. **No Tests** - 0% test coverage
3. **API Base URL** - Mobile app hardcoded to `localhost:3001` (need local IP for physical devices)
4. **No Error Monitoring** - No Sentry or equivalent

### Medium Priority
5. **No API Rate Limiting** - Only auth endpoints are rate-limited
6. **Photo Display Missing** - No photo viewing screens in mobile app
7. **Web App Polish** - Functional but not polished

**Full list:** See `HANDOVER.md` section "Known Issues"

---

## 🎯 Roadmap

### Phase 1: MVP (Current - Week 12)
- Complete offline mode (Sprint 4)
- Add push notifications (Sprint 5)
- Integrate Stripe payments (Sprint 6)
- Deploy to production
- Submit to App Store and Google Play
- Launch with 10-20 beta users

### Phase 2: Growth (Week 13-24)
- Email notifications (SendGrid)
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

**Last Updated:** 2025-10-28
**Version:** 1.0.0-alpha
**Status:** Active Development
**Progress:** 177/304 story points (58%)

🚀 **Next Sprint:** Sprint 4 - Offline Mode (CRITICAL)
