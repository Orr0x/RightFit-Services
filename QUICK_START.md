# Quick Start Guide - Testing the API

This guide will help you quickly set up and test the RightFit Services API.

> **Note:** This guide assumes you're using WSL2 on Windows. For Android development setup, see [docs/ANDROID_DEV_SETUP.md](docs/ANDROID_DEV_SETUP.md).

## Prerequisites

✅ Node.js 20 LTS (installed)
✅ pnpm 8+ (installed)
✅ PostgreSQL 14+ (Docker or WSL2 native)
✅ WSL2 (recommended for Windows users)

## Step 1: Start PostgreSQL Database

You have two options:

### Option A: Docker (Easiest)

```bash
# Start PostgreSQL container
docker run --name rightfit-postgres \
  -e POSTGRES_USER=rightfit_user \
  -e POSTGRES_PASSWORD=rightfit_dev_password \
  -e POSTGRES_DB=rightfit_dev \
  -p 5432:5432 \
  -d postgres:16

# Verify PostgreSQL is running
docker ps

# Check PostgreSQL logs (optional)
docker logs rightfit-postgres
```

### Option B: WSL2 Native PostgreSQL

```bash
# In WSL2 (Ubuntu)
sudo systemctl start postgresql

# Verify PostgreSQL is running
sudo systemctl status postgresql
```

## Step 2: Install Dependencies & Build

```bash
# Install all dependencies
pnpm install

# Build shared packages
pnpm build

# Generate Prisma Client
pnpm db:generate
```

## Step 3: Push Database Schema

```bash
# Push Prisma schema to PostgreSQL
pnpm db:push

# You should see output confirming tables were created
```

## Step 4: Start API Server

```bash
# Start the API server in development mode
pnpm dev:api

# You should see:
# 🚀 API server running on port 3001
# Environment: development
```

The API is now running at `http://localhost:3001`

## Step 5: Test the API

Open a new terminal window and run these tests:

### Test 1: Health Check
```bash
curl http://localhost:3001/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-10-30T20:00:00.000Z",
  "environment": "development"
}
```

### Test 2: Register a User
```bash
curl -X POST http://localhost:3001/api/auth/register \
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
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"Test123!@#\"}"
```

### Test 4: Create a Property

Replace `YOUR_TOKEN_HERE` with the access_token from register/login:

```bash
curl -X POST http://localhost:3001/api/properties \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d "{\"name\":\"Highland Cabin #2\",\"address_line1\":\"123 Highland Road\",\"city\":\"Edinburgh\",\"postcode\":\"EH1 2AB\",\"property_type\":\"COTTAGE\",\"bedrooms\":3,\"bathrooms\":2}"
```

### Test 5: List Properties
```bash
curl -X GET http://localhost:3001/api/properties \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Test 6: Get Property Details

Replace `PROPERTY_ID` with the ID from the create response:

```bash
curl -X GET http://localhost:3001/api/properties/PROPERTY_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Test 7: Update Property
```bash
curl -X PATCH http://localhost:3001/api/properties/PROPERTY_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d "{\"name\":\"Updated Property Name\"}"
```

### Test 8: Delete Property
```bash
curl -X DELETE http://localhost:3001/api/properties/PROPERTY_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Troubleshooting

### PostgreSQL Connection Error
```bash
# Check if PostgreSQL container is running (if using Docker)
docker ps

# If not running, start it
docker start rightfit-postgres

# Check logs for errors
docker logs rightfit-postgres

# Or check WSL2 PostgreSQL service
sudo systemctl status postgresql
sudo systemctl start postgresql
```

### Port 3001 Already in Use
```bash
# Find process using port 3001 (Linux/WSL2)
lsof -i :3001

# Or use ss
ss -tlnp | grep :3001

# Kill the process
kill -9 <PID>

# Or use npx kill-port
npx kill-port 3001
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

1. **Mobile Development** - See [docs/ANDROID_DEV_SETUP.md](docs/ANDROID_DEV_SETUP.md) for local Android builds
2. **Automatic Sync** - Offline-first mobile app with WatermelonDB (fully operational)
3. **Write Integration Tests** - Test multi-tenancy isolation
4. **Deploy to Production** - Continue Sprint 6 (Stripe + Launch)

## Support

If you encounter issues:
1. Check the logs: API server console + Docker logs
2. Verify all environment variables in `apps/api/.env`
3. Ensure PostgreSQL is running: `docker ps`
4. Check `DATABASE_SETUP.md` for detailed database instructions

---

**Happy Testing! 🚀**
