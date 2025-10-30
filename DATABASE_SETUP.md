# Database Setup Instructions

## Prerequisites
- PostgreSQL 14+ installed locally or access to AWS RDS
- Node.js 20 LTS (required for Prisma)
- pnpm package manager installed globally
- psql command-line tool (comes with PostgreSQL)

## Local Development Setup

### 1. Install PostgreSQL (if not already installed)

**Windows (WSL2 - Recommended for Android Development):**

If doing mobile development, use WSL2 (see [docs/ANDROID_DEV_SETUP.md](docs/ANDROID_DEV_SETUP.md)):
```bash
# In WSL2 (Ubuntu)
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows (Native - Alternative):**
Download from https://www.postgresql.org/download/windows/

**Mac (Homebrew):**
```bash
brew install postgresql@16
brew services start postgresql@16
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Docker (Easiest - All Platforms):**
```bash
docker run --name rightfit-postgres \
  -e POSTGRES_USER=rightfit_user \
  -e POSTGRES_PASSWORD=rightfit_dev_password \
  -e POSTGRES_DB=rightfit_dev \
  -p 5432:5432 \
  -d postgres:16
```

### 2. Create Database and User

```bash
# Connect to PostgreSQL as superuser
psql -U postgres

# In psql shell, run:
CREATE DATABASE rightfit_dev;
CREATE USER rightfit_user WITH ENCRYPTED PASSWORD 'rightfit_dev_password';
GRANT ALL PRIVILEGES ON DATABASE rightfit_dev TO rightfit_user;

# Exit psql
\q
```

### 3. Configure Environment Variables

Copy the example env file and update with your database credentials:

```bash
cd apps/api
cp .env.example .env
```

Edit `.env` and update the `DATABASE_URL`:

```env
DATABASE_URL="postgresql://rightfit_user:rightfit_dev_password@localhost:5432/rightfit_dev?schema=public"
```

### 4. Run Prisma Migrations

From the root of the project:

```bash
# Generate Prisma Client
pnpm db:generate

# Push schema to database (for development)
pnpm db:push

# OR create and run migration (for production-like workflow)
pnpm db:migrate

# (Optional) Seed database with test data
pnpm db:seed
```

### 5. Verify Database Setup

```bash
# Open Prisma Studio to browse your database
pnpm db:studio
```

This will open a browser at `http://localhost:5555` where you can view your tables.

## Troubleshooting

### Connection Refused
- Ensure PostgreSQL is running: `sudo systemctl status postgresql` (Linux) or check Services (Windows)
- Check PostgreSQL is listening on port 5432: `sudo lsof -i :5432` (Mac/Linux)

### Authentication Failed
- Verify your `DATABASE_URL` credentials match what you created
- Check pg_hba.conf allows password authentication (md5 or scram-sha-256)

### Permission Denied
- Ensure the user has proper privileges: `GRANT ALL PRIVILEGES ON DATABASE rightfit_dev TO rightfit_user;`
- For schema permissions: `GRANT ALL ON SCHEMA public TO rightfit_user;`

## Production Database (AWS RDS)

For production deployment, update `DATABASE_URL` in your AWS environment:

```env
DATABASE_URL="postgresql://admin:<password>@rightfit-db.xxxxx.eu-west-2.rds.amazonaws.com:5432/rightfit_prod?schema=public"
```

**Important:** Never commit `.env` files with production credentials to version control!

## Migration Workflow

### Development
```bash
# Make changes to schema.prisma
# Push to database immediately (no migration files)
pnpm db:push
```

### Production
```bash
# Create a migration file
pnpm db:migrate

# This creates a new migration in packages/database/prisma/migrations/
# Commit this migration file to version control
# Deploy: migrations run automatically on production deploy
```

## Next Steps

After database setup is complete:
1. Start the API server: `pnpm dev:api` (runs on port 3001)
2. Test the /health endpoint: `curl http://localhost:3001/api/health`
3. For mobile development, see [Android Dev Setup](docs/ANDROID_DEV_SETUP.md)
4. Begin implementing authentication endpoints (Story 007)
