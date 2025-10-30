# RightFit Services - Deployment Guide

## Overview

This guide covers deployment of the RightFit Services API to development and production environments using PM2 process manager.

## Prerequisites

- Node.js 20 LTS installed
- pnpm package manager
- PM2 globally installed (`npm install -g pm2`)
- PostgreSQL database running (Docker or standalone)
- Environment variables configured
- For WSL2 setup, see [DATABASE_SETUP.md](DATABASE_SETUP.md)

## Quick Start - Dev Deployment

The API is currently **DEPLOYED TO DEV** environment and running with PM2!

### Check Current Status

```bash
pm2 status
pm2 logs rightfit-api-dev
```

### Test the Deployment

```bash
# Health check
curl http://localhost:3001/health

# Should return:
# {"status":"ok","timestamp":"...","environment":"development"}
```

## Deployment Steps

### 1. Build the Application

```bash
cd apps/api
pnpm build
```

This compiles TypeScript to JavaScript in the `dist/` folder.

### 2. Configure Environment

Ensure `.env` file exists in `apps/api/` with required variables:

```env
NODE_ENV=development
PORT=3001
DATABASE_URL="postgresql://..."
JWT_SECRET="..."
JWT_REFRESH_SECRET="..."
JWT_ACCESS_EXPIRY="1h"
JWT_REFRESH_EXPIRY="30d"
```

### 3. Deploy with PM2

#### Dev Environment (Single Instance)

```bash
cd apps/api
pm2 start ecosystem.config.js --only rightfit-api-dev
```

#### Production Environment (Cluster Mode)

```bash
cd apps/api
pm2 start ecosystem.config.js --only rightfit-api-prod
```

## PM2 Management Commands

### Start/Stop/Restart

```bash
# Start
pm2 start rightfit-api-dev

# Stop
pm2 stop rightfit-api-dev

# Restart
pm2 restart rightfit-api-dev

# Delete from PM2
pm2 delete rightfit-api-dev
```

### Monitoring

```bash
# View status
pm2 status

# View logs (live)
pm2 logs rightfit-api-dev

# View logs (last 100 lines)
pm2 logs rightfit-api-dev --lines 100

# Monitor CPU/Memory
pm2 monit
```

### Process Information

```bash
# Detailed info
pm2 show rightfit-api-dev

# List all processes
pm2 list
```

## Auto-Start on System Boot

To make PM2 start automatically on server restart:

```bash
# Generate startup script
pm2 startup

# Save current PM2 configuration
pm2 save
```

## Deployment Checklist

- [x] Database schema pushed (`pnpm db:push`)
- [x] Environment variables configured
- [x] Application built (`pnpm build`)
- [x] PM2 ecosystem file created
- [x] PM2 process started
- [x] Health endpoint responding
- [x] Logs directory created
- [ ] SSL/TLS configured (for production)
- [ ] Firewall rules configured
- [ ] Domain/DNS configured
- [ ] Monitoring/alerts set up

## Current Deployment Status

**Environment**: Development
**Status**: ✅ DEPLOYED
**Process Manager**: PM2
**Port**: 3001
**Health Check**: http://localhost:3001/health
**Logs**: `apps/api/logs/pm2-*.log`

### Test Credentials

From previous testing session:
- Email: test@rightfit.com
- Password: Test123!@#
- Tenant: Test Company

### API Endpoints Available

- `GET /health` - Health check
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh token
- `GET /api/properties` - List properties (auth required)
- `POST /api/properties` - Create property (auth required)
- `PATCH /api/properties/:id` - Update property (auth required)
- `DELETE /api/properties/:id` - Delete property (auth required)

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 3001 (Linux/WSL2)
lsof -i :3001

# Or use ss
ss -tlnp | grep :3001

# Kill process
kill -9 <PID>

# Or use npx kill-port
npx kill-port 3001

# Restart PM2
pm2 restart rightfit-api-dev
```

### Application Not Starting

```bash
# Check PM2 logs
pm2 logs rightfit-api-dev --lines 50

# Check if database is running
docker ps | grep postgres

# Verify environment variables
cat apps/api/.env
```

### Database Connection Issues

```bash
# Test database connection (standard PostgreSQL port)
psql -h localhost -p 5432 -U rightfit_user -d rightfit_dev

# Or if using Docker on different port
psql -h localhost -p 5433 -U rightfit_user -d rightfit_dev

# Check Docker container
docker logs rightfit-postgres

# Check PostgreSQL service (WSL2/Linux)
sudo systemctl status postgresql
```

## Production Deployment Notes

For production deployment, additional steps required:

1. Use production environment variables
2. Enable SSL/TLS
3. Configure reverse proxy (nginx/caddy)
4. Set up monitoring and logging aggregation
5. Configure automated backups
6. Enable PM2 cluster mode (already configured in ecosystem.config.js)
7. Set up CI/CD pipeline
8. Configure rate limiting and security headers

## Rollback Procedure

If deployment fails:

```bash
# Stop current deployment
pm2 stop rightfit-api-dev

# Checkout previous version
git checkout <previous-commit>

# Rebuild
pnpm build

# Restart
pm2 restart rightfit-api-dev
```

## Support

For issues or questions, check:
- PM2 logs: `pm2 logs rightfit-api-dev`
- Application logs: `apps/api/logs/`
- Database logs: `docker logs rightfit-postgres`
