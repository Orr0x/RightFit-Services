# Project Source Tree

## Monorepo Structure (Turborepo)

```
rightfit-services/
├── .github/
│   └── workflows/
│       ├── ci.yml                 # Run tests on PR
│       ├── deploy-api.yml         # Deploy API to AWS
│       ├── deploy-web.yml         # Deploy web to S3+CloudFront
│       └── mobile-build.yml       # Build mobile apps (EAS)
│
├── apps/
│   ├── mobile/                    # React Native mobile app
│   │   ├── src/
│   │   │   ├── components/        # UI components
│   │   │   │   ├── properties/
│   │   │   │   ├── workOrders/
│   │   │   │   ├── contractors/
│   │   │   │   └── common/
│   │   │   ├── screens/           # Screen components
│   │   │   │   ├── auth/
│   │   │   │   │   ├── LoginScreen.tsx
│   │   │   │   │   └── RegisterScreen.tsx
│   │   │   │   ├── properties/
│   │   │   │   │   ├── PropertyListScreen.tsx
│   │   │   │   │   ├── PropertyDetailsScreen.tsx
│   │   │   │   │   └── CreatePropertyScreen.tsx
│   │   │   │   ├── workOrders/
│   │   │   │   │   ├── WorkOrderListScreen.tsx
│   │   │   │   │   ├── WorkOrderDetailsScreen.tsx
│   │   │   │   │   └── CreateWorkOrderScreen.tsx
│   │   │   │   ├── contractors/
│   │   │   │   └── calendar/
│   │   │   ├── navigation/        # React Navigation config
│   │   │   │   ├── RootNavigator.tsx
│   │   │   │   ├── AuthNavigator.tsx
│   │   │   │   └── MainNavigator.tsx
│   │   │   ├── database/          # WatermelonDB setup
│   │   │   │   ├── schema.ts
│   │   │   │   ├── models/
│   │   │   │   │   ├── Property.ts
│   │   │   │   │   ├── WorkOrder.ts
│   │   │   │   │   └── SyncQueue.ts
│   │   │   │   └── sync/
│   │   │   │       ├── SyncService.ts
│   │   │   │       └── SyncAdapter.ts
│   │   │   ├── store/             # Redux Toolkit
│   │   │   │   ├── index.ts
│   │   │   │   ├── slices/
│   │   │   │   │   ├── authSlice.ts
│   │   │   │   │   ├── propertiesSlice.ts
│   │   │   │   │   └── syncSlice.ts
│   │   │   │   └── middleware/
│   │   │   ├── services/          # API clients
│   │   │   │   ├── api.ts         # Axios instance
│   │   │   │   ├── authService.ts
│   │   │   │   ├── propertiesService.ts
│   │   │   │   └── workOrdersService.ts
│   │   │   ├── hooks/             # Custom React hooks
│   │   │   │   ├── useOfflineSync.ts
│   │   │   │   ├── useCamera.ts
│   │   │   │   └── useNotifications.ts
│   │   │   ├── utils/
│   │   │   │   ├── validation.ts
│   │   │   │   ├── formatters.ts
│   │   │   │   └── constants.ts
│   │   │   └── App.tsx
│   │   ├── assets/
│   │   │   ├── images/
│   │   │   └── fonts/
│   │   ├── __tests__/
│   │   ├── app.json               # Expo config
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── web/                       # React web app
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── layout/
│   │   │   │   │   ├── Navbar.tsx
│   │   │   │   │   ├── Sidebar.tsx
│   │   │   │   │   └── Footer.tsx
│   │   │   │   ├── properties/
│   │   │   │   ├── workOrders/
│   │   │   │   ├── contractors/
│   │   │   │   └── common/
│   │   │   ├── pages/             # Page components (React Router)
│   │   │   │   ├── auth/
│   │   │   │   │   ├── LoginPage.tsx
│   │   │   │   │   └── RegisterPage.tsx
│   │   │   │   ├── dashboard/
│   │   │   │   │   └── DashboardPage.tsx
│   │   │   │   ├── properties/
│   │   │   │   │   ├── PropertiesListPage.tsx
│   │   │   │   │   ├── PropertyDetailsPage.tsx
│   │   │   │   │   └── CreatePropertyPage.tsx
│   │   │   │   ├── workOrders/
│   │   │   │   ├── contractors/
│   │   │   │   └── calendar/
│   │   │   ├── store/             # Redux Toolkit (shared with mobile)
│   │   │   ├── services/          # API clients (shared with mobile)
│   │   │   ├── hooks/
│   │   │   ├── utils/
│   │   │   ├── styles/
│   │   │   │   ├── theme.ts       # MUI theme
│   │   │   │   └── index.css      # Tailwind CSS
│   │   │   ├── App.tsx
│   │   │   └── main.tsx
│   │   ├── public/
│   │   │   ├── favicon.ico
│   │   │   └── robots.txt
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   ├── tailwind.config.js
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── api/                       # Node.js + Express backend
│       ├── src/
│       │   ├── middleware/
│       │   │   ├── auth.ts        # JWT verification
│       │   │   ├── tenant.ts      # tenant_id injection
│       │   │   ├── errorHandler.ts
│       │   │   ├── validation.ts
│       │   │   ├── rateLimiter.ts
│       │   │   └── logger.ts
│       │   ├── routes/
│       │   │   ├── index.ts       # Route aggregator
│       │   │   ├── auth.ts        # /api/v1/auth/*
│       │   │   ├── properties.ts  # /api/v1/properties/*
│       │   │   ├── workOrders.ts  # /api/v1/work-orders/*
│       │   │   ├── contractors.ts # /api/v1/contractors/*
│       │   │   ├── certificates.ts
│       │   │   ├── photos.ts
│       │   │   └── sync.ts        # /api/v1/sync/*
│       │   ├── services/          # Business logic
│       │   │   ├── AuthService.ts
│       │   │   ├── PropertiesService.ts
│       │   │   ├── WorkOrdersService.ts
│       │   │   ├── ContractorsService.ts
│       │   │   ├── PhotoService.ts
│       │   │   ├── NotificationService.ts
│       │   │   ├── SyncService.ts
│       │   │   └── StripeService.ts
│       │   ├── repositories/      # Data access layer
│       │   │   ├── PropertiesRepository.ts
│       │   │   ├── WorkOrdersRepository.ts
│       │   │   └── ContractorsRepository.ts
│       │   ├── utils/
│       │   │   ├── jwt.ts
│       │   │   ├── hash.ts
│       │   │   ├── s3.ts
│       │   │   ├── validation.ts
│       │   │   └── logger.ts
│       │   ├── integrations/      # External API clients
│       │   │   ├── stripe.ts
│       │   │   ├── twilio.ts
│       │   │   ├── sendgrid.ts
│       │   │   └── googleVision.ts
│       │   ├── types/
│       │   │   ├── express.d.ts   # Extend Express types
│       │   │   └── index.ts
│       │   ├── config/
│       │   │   ├── database.ts
│       │   │   ├── aws.ts
│       │   │   └── index.ts
│       │   └── index.ts           # Express app entry
│       ├── __tests__/
│       │   ├── integration/
│       │   │   ├── auth.test.ts
│       │   │   ├── properties.test.ts
│       │   │   └── workOrders.test.ts
│       │   └── unit/
│       │       ├── services/
│       │       └── utils/
│       ├── Dockerfile
│       ├── package.json
│       └── tsconfig.json
│
├── packages/
│   ├── shared/                    # Shared types, utils, schemas
│   │   ├── src/
│   │   │   ├── types/
│   │   │   │   ├── User.ts
│   │   │   │   ├── Property.ts
│   │   │   │   ├── WorkOrder.ts
│   │   │   │   ├── Contractor.ts
│   │   │   │   ├── Certificate.ts
│   │   │   │   └── Photo.ts
│   │   │   ├── schemas/           # Zod validation schemas
│   │   │   │   ├── auth.schema.ts
│   │   │   │   ├── property.schema.ts
│   │   │   │   └── workOrder.schema.ts
│   │   │   ├── constants/
│   │   │   │   ├── enums.ts
│   │   │   │   └── config.ts
│   │   │   ├── utils/
│   │   │   │   ├── formatters.ts
│   │   │   │   ├── validators.ts
│   │   │   │   └── dateHelpers.ts
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── ui/                        # Shared UI components (limited cross-platform)
│   │   ├── src/
│   │   │   ├── icons/
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── database/                  # Prisma schema + migrations
│       ├── prisma/
│       │   ├── schema.prisma
│       │   ├── migrations/
│       │   │   ├── 20250101000000_init/
│       │   │   │   └── migration.sql
│       │   │   ├── 20250115000000_add_certificates/
│       │   │   │   └── migration.sql
│       │   │   └── migration_lock.toml
│       │   └── seed.ts            # Dev seed data
│       ├── src/
│       │   └── client.ts          # Prisma Client singleton
│       ├── package.json
│       └── tsconfig.json
│
├── infrastructure/                # IaC (Phase 2 - Terraform)
│   ├── terraform/
│   │   ├── modules/
│   │   │   ├── ec2/
│   │   │   ├── rds/
│   │   │   ├── s3/
│   │   │   └── cloudfront/
│   │   ├── environments/
│   │   │   ├── dev/
│   │   │   ├── staging/
│   │   │   └── production/
│   │   └── main.tf
│   └── docker/
│       ├── api.Dockerfile
│       └── docker-compose.yml     # Local dev environment
│
├── scripts/
│   ├── setup.sh                   # Initial project setup
│   ├── deploy-api.sh              # Deploy API to EC2
│   ├── deploy-web.sh              # Deploy web to S3
│   ├── db-migrate.sh              # Run Prisma migrations
│   └── seed-dev-data.sh           # Seed development database
│
├── docs/
│   ├── prd.md
│   ├── architecture.md            # This file
│   ├── architecture/              # Detailed architecture docs
│   │   ├── core-workflows.md
│   │   ├── database-schema.md
│   │   ├── tech-stack.md
│   │   └── source-tree.md
│   ├── api/
│   │   └── openapi.yml            # OpenAPI 3.0 spec
│   └── guides/
│       ├── local-development.md
│       ├── deployment.md
│       └── troubleshooting.md
│
├── .env.example                   # Environment variables template
├── .gitignore
├── .prettierrc
├── .eslintrc.js
├── turbo.json                     # Turborepo config
├── package.json                   # Root package.json
├── pnpm-workspace.yaml            # pnpm workspaces
└── README.md
```

---

## Key Files

### Turborepo Configuration

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", "build/**", ".next/**"]
    },
    "lint": {},
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

### Root Package.json

```json
{
  "name": "rightfit-services",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "turbo run dev",
    "dev:api": "turbo run dev --filter=api",
    "dev:web": "turbo run dev --filter=web",
    "dev:mobile": "turbo run dev --filter=mobile",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "db:migrate": "cd packages/database && prisma migrate dev",
    "db:generate": "cd packages/database && prisma generate",
    "db:seed": "cd packages/database && ts-node prisma/seed.ts",
    "clean": "turbo run clean && rm -rf node_modules"
  },
  "devDependencies": {
    "@typescript-eslint/eslint-plugin": "^6.15.0",
    "@typescript-eslint/parser": "^6.15.0",
    "eslint": "^8.56.0",
    "eslint-config-prettier": "^9.1.0",
    "prettier": "^3.1.1",
    "turbo": "^1.11.2",
    "typescript": "^5.3.3"
  },
  "packageManager": "pnpm@8.14.0",
  "engines": {
    "node": ">=20.0.0",
    "pnpm": ">=8.0.0"
  }
}
```

---

## Environment Variables

### apps/api/.env

```bash
# Server
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/rightfit_dev?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-in-production"
JWT_ACCESS_EXPIRY="15m"
JWT_REFRESH_EXPIRY="30d"

# AWS
AWS_REGION="eu-west-2"
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
S3_BUCKET_PHOTOS="rightfit-services-photos-dev"
S3_BUCKET_CERTIFICATES="rightfit-services-certificates-dev"
CLOUDFRONT_DOMAIN="d1234567890.cloudfront.net"

# External APIs
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
TWILIO_ACCOUNT_SID="ACxxxxx"
TWILIO_AUTH_TOKEN="your-auth-token"
TWILIO_PHONE_NUMBER="+441234567890"
SENDGRID_API_KEY="SG.xxxxx"
SENDGRID_FROM_EMAIL="noreply@rightfitservices.co.uk"
GOOGLE_VISION_API_KEY="AIzaSyxxxx"

# Firebase (Push Notifications)
FIREBASE_PROJECT_ID="rightfit-services"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@rightfit-services.iam.gserviceaccount.com"

# CORS
ALLOWED_ORIGINS="http://localhost:3001,https://app.rightfitservices.co.uk"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100
```

### apps/mobile/.env

```bash
# API
API_BASE_URL=http://localhost:3000/api/v1

# Expo
EAS_PROJECT_ID="your-expo-project-id"

# Google Maps (for navigation)
GOOGLE_MAPS_API_KEY="AIzaSyxxxx"
```

### apps/web/.env

```bash
# API
VITE_API_BASE_URL=http://localhost:3000/api/v1

# Stripe (Public Key)
VITE_STRIPE_PUBLIC_KEY="pk_test_..."

# Google Maps
VITE_GOOGLE_MAPS_API_KEY="AIzaSyxxxx"
```

---

