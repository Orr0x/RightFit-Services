# Quick Start Guide - Testing the API

This guide will help you quickly set up and test the RightFit Services API.

## Prerequisites

✅ Node.js 20+ (installed)
✅ pnpm 8+ (installed)
✅ Docker Desktop (installed but not running)

## Step 1: Start Docker Desktop

**Windows:**
1. Press `Win` key and search for "Docker Desktop"
2. Click to open Docker Desktop
3. Wait for Docker to start (you'll see "Docker Desktop is running" in the system tray)

**Or use Command Line:**
```bash
# Start Docker Desktop (Windows)
start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
```

**Verify Docker is running:**
```bash
docker ps
# Should show empty list of containers (not an error)
```

## Step 2: Start PostgreSQL Database

Once Docker Desktop is running:

```bash
# Navigate to project root
cd I:\RightFit-Services

# Start PostgreSQL container
docker-compose up -d

# Verify PostgreSQL is running
docker ps
# You should see 'rightfit-postgres' container running

# Check PostgreSQL logs (optional)
docker-compose logs postgres
```

## Step 3: Install Dependencies & Build

```bash
# Install all dependencies
pnpm install

# Build shared packages
pnpm build

# Generate Prisma Client
pnpm db:generate
```

## Step 4: Push Database Schema

```bash
# Push Prisma schema to PostgreSQL
pnpm db:push

# You should see output confirming tables were created
```

## Step 5: Start API Server

```bash
# Start the API server in development mode
pnpm dev:api

# You should see:
# 🚀 API server running on port 3000
# Environment: development
```

The API is now running at `http://localhost:3000`

## Step 6: Test the API

Open a new terminal window and run these tests:

### Test 1: Health Check
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-10-27T20:00:00.000Z",
  "environment": "development"
}
```

### Test 2: Register a User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"Test123!@#\",\"confirm_password\":\"Test123!@#\",\"full_name\":\"Test User\",\"company_name\":\"Test Company\"}"
```

Expected response:
```json
{
  "data": {
    "user": { ... },
    "tenant": { ... },
    "access_token": "eyJhbGc...",
    "refresh_token": "eyJhbGc..."
  }
}
```

**Save the `access_token` for next steps!**

### Test 3: Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"Test123!@#\"}"
```

### Test 4: Create a Property

Replace `YOUR_TOKEN_HERE` with the access_token from register/login:

```bash
curl -X POST http://localhost:3000/api/properties \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d "{\"name\":\"Highland Cabin #2\",\"address_line1\":\"123 Highland Road\",\"city\":\"Edinburgh\",\"postcode\":\"EH1 2AB\",\"property_type\":\"COTTAGE\",\"bedrooms\":3,\"bathrooms\":2}"
```

### Test 5: List Properties
```bash
curl -X GET http://localhost:3000/api/properties \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Test 6: Get Property Details

Replace `PROPERTY_ID` with the ID from the create response:

```bash
curl -X GET http://localhost:3000/api/properties/PROPERTY_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Test 7: Update Property
```bash
curl -X PATCH http://localhost:3000/api/properties/PROPERTY_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d "{\"name\":\"Updated Property Name\"}"
```

### Test 8: Delete Property
```bash
curl -X DELETE http://localhost:3000/api/properties/PROPERTY_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Troubleshooting

### Docker Desktop Won't Start
- Ensure Windows Subsystem for Linux (WSL 2) is installed
- Check Windows Services for Docker Engine
- Restart your computer

### PostgreSQL Connection Error
```bash
# Check if PostgreSQL container is running
docker ps

# If not running, start it
docker-compose up -d

# Check logs for errors
docker-compose logs postgres
```

### Port 3000 Already in Use
```bash
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

### "Cannot find module" Errors
```bash
# Rebuild everything
pnpm clean
pnpm install
pnpm build
pnpm db:generate
```

## Useful Commands

### Database Management
```bash
# Open Prisma Studio (database GUI)
pnpm db:studio

# View database tables
docker exec -it rightfit-postgres psql -U rightfit_user -d rightfit_dev -c "\dt"

# Reset database (DANGER: deletes all data)
pnpm db:push --force-reset
```

### Docker Management
```bash
# Stop PostgreSQL
docker-compose down

# Stop and remove volumes (deletes all data)
docker-compose down -v

# View logs
docker-compose logs -f postgres

# Restart PostgreSQL
docker-compose restart postgres
```

### API Development
```bash
# Start API with auto-reload
pnpm dev:api

# Build API for production
cd apps/api && pnpm build

# Run built API
cd apps/api && pnpm start

# Run linter
pnpm lint
```

## Next Steps

After successfully testing the API:

1. **Write Integration Tests** - Test multi-tenancy isolation
2. **Implement Mobile App** - React Native UI for Story 007 & 001
3. **Deploy to Dev Environment** - Set up CI/CD pipeline
4. **Continue Sprint 2** - Work Orders, Contractors, Photos

## Support

If you encounter issues:
1. Check the logs: API server console + Docker logs
2. Verify all environment variables in `apps/api/.env`
3. Ensure PostgreSQL is running: `docker ps`
4. Check `DATABASE_SETUP.md` for detailed database instructions

---

**Happy Testing! 🚀**
