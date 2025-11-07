# RightFit Services

**Multi-tenant B2B2C SaaS platform** connecting service providers (cleaning and maintenance companies), customers (short-let businesses and landlords), workers (cleaners and maintenance technicians), and property guests.

---

## 🎯 Development Philosophy: RightFit, not QuickFix

**We are building a best-in-class service management SaaS platform.**

This means:
- ✅ **Quality over speed** - No arbitrary deadlines, no corner-cutting
- ✅ **Build it right the first time** - No "we'll fix it later" technical debt
- ✅ **Production-ready standards** - Every feature, every time
- ✅ **Best-in-class quality** - Compare to Stripe, Airbnb, Linear, Notion
- ✅ **User experience excellence** - Intuitive, accessible, delightful
- ✅ **Sustainable development** - Maintainable code that lasts years

**Read [PHILOSOPHY.md](PHILOSOPHY.md) for our complete development philosophy and quality standards.**

---

## Quick Links

- **[PHILOSOPHY.md](PHILOSOPHY.md)** - Development philosophy and quality standards (READ FIRST)
- **[README.md](README.md)** - You are here - Setup and quick start
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Complete system architecture (15,000+ words)
- **[CURRENT-STATE.md](CURRENT-STATE.md)** - Current development status and priorities
- **[PROJECT-PLAN.md](PROJECT-PLAN.md)** - Development roadmap and sprint plans
- **[PROJECT-MAP.md](PROJECT-MAP.md)** - Project navigation guide
- **[CLAUDE-RULES.md](CLAUDE-RULES.md)** - AI assistant guidelines
- **[REVIEW-GUIDE.md](REVIEW-GUIDE.md)** - Review checklist for team validation

---

## Table of Contents

- [Platform Overview](#platform-overview)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Application Structure](#application-structure)
- [Running Applications](#running-applications)
- [Database Setup](#database-setup)
- [Environment Configuration](#environment-configuration)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

---

## Platform Overview

RightFit Services operates as a **unified platform** with branded subdomains, consisting of **8 interconnected applications**:

### Product 1: Cleaning SaaS
- **web-cleaning** - Service provider portal for cleaning companies
- **web-customer** - Customer portal for short-let businesses
- **guest-tablet** - Guest app for property issue reporting
- **web-worker** - Worker app for cleaners (shared with Maintenance)

### Product 2: Maintenance SaaS
- **web-maintenance** - Service provider portal for maintenance companies
- **web-landlord** - Customer portal for traditional landlords
- **web-worker** - Worker app for maintenance workers (shared with Cleaning)

### Shared Infrastructure
- **api** - Unified Express.js backend (REST API)
- **mobile** - React Native mobile app (offline-first with WatermelonDB)

**Deployment Model**: Single unified backend with branded frontend subdomains (cleaning.rightfit.com, maintenance.rightfit.com, etc.)

See [ARCHITECTURE.md](ARCHITECTURE.md) for complete technical documentation.

---

## Prerequisites

- **Node.js** v18+ (v20 recommended)
- **pnpm** v8+ (package manager)
- **Docker** & **Docker Compose** (for PostgreSQL)
- **PostgreSQL** 15+ (or use Docker)
- **Android Studio** (for mobile development)
- **ADB** (Android Debug Bridge) for device testing

---

## Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/RightFit-Services.git
cd RightFit-Services

# 2. Install dependencies
pnpm install

# 3. Start PostgreSQL database
docker compose up -d

# 4. Set up environment variables
cp apps/api/.env.example apps/api/.env
# Edit apps/api/.env with your configuration

# 5. Run database migrations
cd packages/database
npx prisma migrate dev
cd ../..

# 6. Seed the database (optional)
npm run db:seed

# 7. Start all applications
npm run dev
```

All apps will be available at:
- API: http://localhost:3001
- Landlord Portal: http://localhost:5173
- Cleaning Portal: http://localhost:5174
- Maintenance Portal: http://localhost:5175
- Customer Portal: http://localhost:5176
- Guest Tablet: http://localhost:5177
- Worker App: http://localhost:5178
- Mobile: http://localhost:8081 (Expo dev server)

---

## Application Structure

```
RightFit-Services/
├── apps/
│   ├── api/                    # Express.js REST API (port 3001)
│   ├── web-landlord/           # Landlord portal (port 5173)
│   ├── web-cleaning/           # Cleaning service provider (port 5174)
│   ├── web-maintenance/        # Maintenance service provider (port 5175)
│   ├── web-customer/           # Customer portal for short-let businesses (port 5176)
│   ├── guest-tablet/           # Guest tablet app (port 5177)
│   ├── web-worker/             # Worker app - shared (port 5178)
│   └── mobile/                 # React Native mobile app (Expo)
│
├── packages/
│   ├── database/               # Prisma schema, migrations, and seeds
│   └── shared/                 # Shared types, constants, and utilities
│
├── docs/                       # Additional documentation
│   ├── archive/                # Historical docs and session summaries
│   ├── architecture/           # Architecture specs
│   ├── sprints/                # Sprint plans and stories
│   └── analysis/               # Code analysis reports
│
└── docker-compose.yml          # PostgreSQL database setup
```

---

## Running Applications

### Start All Apps (Recommended)

```bash
npm run dev
```

This starts all 8 apps + API server concurrently.

### Start Individual Apps

```bash
# API Server (required for all apps)
npm run dev:api              # Port 3001

# Web Applications
npm run dev:landlord         # Port 5173
npm run dev:cleaning         # Port 5174
npm run dev:maintenance      # Port 5175
npm run dev:customer         # Port 5176
npm run dev:guest            # Port 5177
npm run dev:worker           # Port 5178

# Mobile App
npm run dev:mobile           # Port 8081 (Expo)
```

---

## Database Setup

### Using Docker (Recommended)

```bash
# Start PostgreSQL container
docker compose up -d

# Verify database is running
docker ps | grep rightfit-postgres

# View logs
docker compose logs -f postgres

# Stop database
docker compose down

# Stop and remove all data (⚠️ WARNING: Deletes all data)
docker compose down -v
```

### Database Configuration

Default Docker configuration:
- **Host**: localhost
- **Port**: 5432
- **Database**: rightfit_dev
- **User**: rightfit_user
- **Password**: rightfit_dev_password

### Running Migrations

```bash
cd packages/database

# Create and apply migrations
npx prisma migrate dev

# Generate Prisma Client
npx prisma generate

# Open Prisma Studio (database GUI)
npx prisma studio
```

### Seeding the Database

```bash
npm run db:seed
```

**Default Test Credentials**:
- Email: admin@rightfit.com
- Password: Admin123!@#

⚠️ **Change these in production!**

---

## Environment Configuration

### API Server (.env)

Create `apps/api/.env`:

```env
# Server
NODE_ENV=development
PORT=3001

# Database
DATABASE_URL="postgresql://rightfit_user:rightfit_dev_password@localhost:5432/rightfit_dev?schema=public"

# JWT Authentication
JWT_SECRET="your-super-secret-jwt-key-change-in-production-256-bit-minimum"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-in-production-256-bit-minimum"
JWT_ACCESS_EXPIRY="1h"
JWT_REFRESH_EXPIRY="30d"

# CORS (update for production)
ALLOWED_ORIGINS="http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:5176,http://localhost:5177,http://localhost:5178,http://localhost:8081"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Uploads
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
```

### Frontend Apps

Each web app uses Vite and automatically proxies API requests to `http://localhost:3001` in development.

For production, configure the `VITE_API_URL` environment variable in each app.

### Mobile App

For physical device testing, update the API URL:

1. Find your local network IP:
   ```bash
   ip addr show | grep "inet " | grep -v 127.0.0.1
   ```

2. Update `apps/mobile/src/services/api.ts`:
   ```typescript
   const API_URL = 'http://YOUR_LOCAL_IP:3001'
   ```

---

## Development Workflow

### Project Structure

- **Monorepo**: Uses pnpm workspaces
- **Package Manager**: pnpm (required)
- **Build Tool**: Vite for all web apps
- **Mobile**: Expo with React Native
- **Database ORM**: Prisma

### Code Patterns

See [ARCHITECTURE.md](ARCHITECTURE.md) Section 5 for detailed frontend and API patterns.

**Key Patterns**:
- Multi-tenant isolation (all endpoints require `service_provider_id`)
- JWT authentication with refresh tokens
- Axios interceptors for auth and error handling
- Shared component libraries (to be implemented)
- Offline-first mobile architecture (WatermelonDB)

### Adding a New Feature

1. Read [PROJECT-PLAN.md](PROJECT-PLAN.md) to understand priorities
2. Check [CURRENT-STATE.md](CURRENT-STATE.md) for current progress
3. Follow patterns in [ARCHITECTURE.md](ARCHITECTURE.md)
4. Create database migrations if needed
5. Implement backend API endpoints
6. Create frontend components
7. Test end-to-end workflow
8. Update documentation

---

## Testing

### Web Application Tests

```bash
cd apps/web-cleaning  # or any web app

# Run unit tests
pnpm test

# Run tests with UI
pnpm test:ui

# Run with coverage
pnpm test:coverage

# Run E2E tests (if configured)
pnpm test:e2e
```

### API Tests

```bash
cd apps/api

# Run tests
pnpm test

# Run with coverage
pnpm test:coverage
```

### Mobile Tests

```bash
cd apps/mobile

# Run Jest tests
pnpm test
```

---

## Deployment

### Production Deployment Strategy

**Unified Deployment with Branded Subdomains** (Recommended)

See [ARCHITECTURE.md](ARCHITECTURE.md) Section 9.2 for complete deployment architecture including:
- Nginx configuration for subdomain routing
- Docker Compose production setup
- SSL certificate configuration (Let's Encrypt)
- Environment variable management
- CI/CD pipeline recommendations

**Subdomains**:
- cleaning.rightfit.com → web-cleaning
- maintenance.rightfit.com → web-maintenance
- customer.rightfit.com → web-customer
- landlord.rightfit.com → web-landlord
- worker.rightfit.com → web-worker
- guest.rightfit.com → guest-tablet
- api.rightfit.com → api

### Building for Production

```bash
# Build all apps
pnpm build

# Build specific app
cd apps/web-cleaning
pnpm build
```

### Docker Deployment

```bash
# Build Docker images
docker compose -f docker-compose.prod.yml build

# Start production stack
docker compose -f docker-compose.prod.yml up -d

# View logs
docker compose -f docker-compose.prod.yml logs -f
```

---

## Troubleshooting

### Database Connection Errors

```bash
# Check if PostgreSQL is running
docker ps | grep rightfit-postgres

# Restart database
docker compose down && docker compose up -d

# Check logs
docker compose logs postgres

# Verify connection string in apps/api/.env
```

### Port Already in Use

```bash
# Find process using port (Linux/macOS)
lsof -i :3001

# Kill process
kill -9 PID

# Or change port in apps/api/.env
```

### Mobile App Not Connecting

1. **Verify API is running**: `curl http://localhost:3001/health`
2. **For physical devices**: Use local network IP, not localhost
3. **Check firewall**: Ensure port 3001 is accessible
4. **Verify device on same network**

### Build Failures

```bash
# Clear all caches
pnpm clean  # If script exists
rm -rf node_modules
rm -rf apps/*/node_modules
rm -rf packages/*/node_modules

# Reinstall
pnpm install

# Clear Vite cache
rm -rf apps/web-*/node_modules/.vite

# Rebuild
pnpm build
```

### Prisma Issues

```bash
cd packages/database

# Reset database (⚠️ Deletes all data)
npx prisma migrate reset

# Regenerate client
npx prisma generate

# Format schema
npx prisma format
```

---

## Additional Resources

### Documentation

- [ARCHITECTURE.md](ARCHITECTURE.md) - Complete system architecture (15,000+ words)
- [CURRENT-STATE.md](CURRENT-STATE.md) - Current development status
- [PROJECT-PLAN.md](PROJECT-PLAN.md) - Roadmap and sprint plans
- [PROJECT-MAP.md](PROJECT-MAP.md) - Navigation guide
- [CLAUDE-RULES.md](CLAUDE-RULES.md) - AI assistant guidelines

### Archived Documentation

- `docs/archive/` - Session summaries and historical documents
- `docs/sprints/` - Sprint plans and completed stories
- `docs/architecture/` - Additional architecture specifications

### External Resources

- **Prisma**: https://www.prisma.io/docs
- **Expo**: https://docs.expo.dev/
- **WatermelonDB**: https://watermelondb.dev/
- **Vite**: https://vitejs.dev/
- **React**: https://react.dev/

---

## Support & Contributing

For issues, questions, or contributions:

1. Check [CURRENT-STATE.md](CURRENT-STATE.md) for known issues
2. Review [ARCHITECTURE.md](ARCHITECTURE.md) for design decisions
3. Follow patterns in existing code
4. Update documentation with changes

---

## License

[Your License Here]

---

**Last Updated**: November 7, 2025
**Version**: 1.1
**Project Status**: Phase 4 - Active Development

For new developers, start with [ARCHITECTURE.md](ARCHITECTURE.md) to understand the complete system, then review [CURRENT-STATE.md](CURRENT-STATE.md) to see current progress and priorities.
