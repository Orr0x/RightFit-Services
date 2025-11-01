# RightFit Services

Multi-tenant property and work order management platform for landlords, featuring web and mobile applications with offline-first capabilities.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Database Setup](#database-setup)
- [Environment Configuration](#environment-configuration)
- [Installation](#installation)
- [Running the Applications](#running-the-applications)
- [Mobile App Development](#mobile-app-development)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **Docker** and **Docker Compose**
- **Android Studio** (for mobile development)
- **ADB** (Android Debug Bridge) for device testing

## Project Structure

```
RightFit-Services/
├── apps/
│   ├── api/          # Node.js/Express API server
│   ├── web/          # React web application (Vite)
│   └── mobile/       # React Native mobile app (Expo)
├── packages/
│   ├── database/     # Prisma database schema and migrations
│   └── shared/       # Shared utilities and types
└── docker-compose.yml
```

## Quick Start

```bash
# 1. Start the database
docker compose up -d

# 2. Install dependencies
npm install

# 3. Set up environment variables (see Environment Configuration section)
cp apps/api/.env.example apps/api/.env
# Edit apps/api/.env with your configuration

# 4. Run database migrations
npm run db:migrate

# 5. Start all servers
npm run dev
```

## Database Setup

### Starting the PostgreSQL Database

The project uses PostgreSQL running in Docker. To start the database:

```bash
# Start PostgreSQL container
docker compose up -d

# Verify the database is running
docker ps | grep rightfit-postgres

# View database logs
docker compose logs -f postgres
```

### Database Configuration

The database runs with the following default configuration:
- **Host:** localhost
- **Port:** 5433 (mapped to container port 5432)
- **Database:** rightfit_dev
- **User:** rightfit_user
- **Password:** rightfit_dev_password

### Running Migrations

After starting the database, run migrations to set up the schema:

```bash
# Run Prisma migrations
npm run db:migrate

# Optional: Seed the database with test data
npm run db:seed
```

### Stopping the Database

```bash
# Stop the database container
docker compose down

# Stop and remove all data (⚠️ WARNING: This deletes all data)
docker compose down -v
```

## Environment Configuration

### API Server (.env)

Create `apps/api/.env` from the example file:

```bash
cp apps/api/.env.example apps/api/.env
```

Update the following variables:

```env
# Server
NODE_ENV=development
PORT=3001

# Database (must match docker-compose.yml)
DATABASE_URL="postgresql://rightfit_user:rightfit_dev_password@localhost:5433/rightfit_dev?schema=public"

# JWT Secrets (⚠️ Change in production!)
JWT_SECRET="your-super-secret-jwt-key-change-in-production-256-bit-minimum"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-in-production-256-bit-minimum"
JWT_ACCESS_EXPIRY="1h"
JWT_REFRESH_EXPIRY="30d"

# CORS
ALLOWED_ORIGINS="http://localhost:5173,http://localhost:8081"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Mobile App Configuration

For mobile development on physical devices, update the API URL in your environment:

1. Find your local network IP:
   ```bash
   ip addr show | grep "inet " | grep -v 127.0.0.1
   ```

2. Update the API service in `apps/mobile/src/services/api.ts` to use your IP:
   ```typescript
   const API_URL = 'http://YOUR_LOCAL_IP:3001'
   ```

## Installation

### Install All Dependencies

From the project root:

```bash
# Install all workspace dependencies
npm install
```

This will install dependencies for all apps and packages in the monorepo.

### Install Dependencies for Individual Apps

```bash
# API server
cd apps/api && npm install

# Web app
cd apps/web && npm install

# Mobile app
cd apps/mobile && npm install
```

## Running the Applications

### Start All Servers (Recommended)

Start all three applications at once using Turbo:

```bash
# From project root
npm run dev
```

This starts:
- API server on http://localhost:3001
- Web app on http://localhost:5173
- Mobile Expo dev server on http://localhost:8081

### Start Individual Servers

#### API Server

```bash
# Option 1: From project root
npm run dev:api

# Option 2: From API directory
cd apps/api && npm run dev
```

The API will be available at http://localhost:3001

#### Web Application

```bash
# Option 1: From project root
npm run dev:web

# Option 2: From web directory
cd apps/web && npm run dev
```

The web app will be available at http://localhost:5173

#### Mobile Application

```bash
# Option 1: From project root
npm run dev:mobile

# Option 2: From mobile directory
cd apps/mobile && npx expo start
```

The Expo dev server will start on http://localhost:8081

**Running on Device:**
- Press 'a' to run on Android device/emulator
- Press 'i' to run on iOS simulator (macOS only)
- Scan QR code with Expo Go app

## Mobile App Development

### Building Android APK

To build the Android app for testing:

```bash
# Navigate to Android directory
cd apps/mobile/android

# Build debug APK
./gradlew assembleDebug

# APK location: apps/mobile/android/app/build/outputs/apk/debug/app-debug.apk
```

### Installing on Physical Devices

#### Install on All Connected Devices

```bash
# List connected devices
adb devices

# Install on all devices
cd apps/mobile/android/app/build/outputs/apk/debug
adb -d install app-debug.apk
```

#### Install on Specific Device

```bash
# Install on specific device by serial number
adb -s DEVICE_SERIAL install app-debug.apk

# Example:
adb -s RZCY51TJKKW install app-debug.apk
```

### Taking Screenshots from Devices

```bash
# Take screenshot from specific device
adb -s DEVICE_SERIAL exec-out screencap -p > screenshot.png

# Example:
adb -s RZCY51TJKKW exec-out screencap -p > s25-screenshot.png
```

### Viewing Device Logs

```bash
# View all logs
adb logcat

# Filter for app-specific logs
adb logcat | grep -i "rightfit\|error\|sync"

# View logs from specific device
adb -s DEVICE_SERIAL logcat
```

### Clear App Data

```bash
# Clear app data and cache
adb shell pm clear com.rightfitservices.app
```

## Testing

### Web Application Tests

```bash
cd apps/web

# Run unit tests
npm run test

# Run tests with UI
npm run test:ui

# Run with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui
```

### API Tests

```bash
cd apps/api

# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## Troubleshooting

### Database Not Running

If you see database connection errors:

```bash
# Check if Docker is running
docker ps

# Restart the database
docker compose down
docker compose up -d

# Check database logs for errors
docker compose logs postgres
```

### Port Already in Use

If a port is already in use:

```bash
# Find process using port (Linux/macOS)
lsof -i :3001

# Kill process
kill -9 PID

# Or use a different port by updating .env files
```

### Mobile App Not Connecting to API

1. **Check API is running:**
   ```bash
   curl http://localhost:3001/health
   ```

2. **For physical devices, verify API URL:**
   - Ensure you're using your local network IP, not localhost
   - Check firewall isn't blocking connections
   - Verify device is on the same network

3. **Database must be running:**
   ```bash
   docker ps | grep rightfit-postgres
   ```
   If not running, start it with `docker compose up -d`

### Offline Sync Issues

The mobile app features offline-first architecture with WatermelonDB. If sync isn't working:

1. **Check network connectivity** in the app
2. **Verify authentication** - expired tokens will fail sync
3. **Check sync logs** in device console: `adb logcat | grep -i sync`
4. **Restart the app** to re-initialize sync service
5. **Clear app data** if database is corrupted: `adb shell pm clear com.rightfitservices.app`

### Build Failures

For mobile builds:

```bash
# Clean and rebuild
cd apps/mobile/android
./gradlew clean
./gradlew assembleDebug

# Clear node modules and reinstall
cd apps/mobile
rm -rf node_modules
npm install
```

For web builds:

```bash
# Clear Vite cache
cd apps/web
rm -rf node_modules/.vite
npm run build
```

### Android Rotation Not Working

If the app doesn't rotate on tablets:

1. Check `apps/mobile/app.json` has `"orientation": "default"`
2. Check `apps/mobile/android/app/src/main/AndroidManifest.xml` has:
   ```xml
   android:screenOrientation="fullSensor"
   ```

## Default Credentials

For testing, the seed script creates a default admin user:

- **Email:** admin@rightfit.com
- **Password:** Admin123!@#

**⚠️ WARNING:** Change these credentials in production!

## Additional Resources

- [Handover Document](HANDOVER.md) - Latest development notes and known issues
- API Documentation: http://localhost:3001/api-docs (when API is running)
- Expo Documentation: https://docs.expo.dev/
- WatermelonDB Docs: https://watermelondb.dev/

## Support

For issues and questions, check the handover document or review recent commits for context on changes.

---

**Last Updated:** 2025-11-01
**Project Status:** Phase 2 - Mobile Screen Migration Complete
