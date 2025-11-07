#!/bin/bash
#
# Testing Suite Setup Script
#
# Installs all necessary dependencies for the comprehensive testing suite

set -e

echo "================================================"
echo "RightFit Services - Testing Suite Setup"
echo "================================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "📦 Installing testing dependencies..."
echo ""

# Root level dependencies
echo "1. Installing root level dependencies..."
npm install --save-dev \
  jest \
  @types/jest \
  ts-jest \
  jest-mock-extended \
  @faker-js/faker \
  supertest \
  @types/supertest \
  playwright \
  @playwright/test \
  msw \
  vitest \
  @testing-library/react \
  @testing-library/jest-dom \
  @testing-library/user-event \
  jest-axe \
  axe-core

echo ""
echo "2. Installing API testing dependencies..."
cd apps/api
npm install --save-dev \
  jest \
  @types/jest \
  ts-jest \
  jest-mock-extended \
  @faker-js/faker \
  supertest \
  @types/supertest

cd ../..

echo ""
echo "3. Installing Frontend testing dependencies..."
for app in web-cleaning web-maintenance web-customer web-landlord web-worker guest-tablet; do
  echo "   Installing for $app..."
  cd "apps/$app"
  npm install --save-dev \
    vitest \
    @vitest/ui \
    @testing-library/react \
    @testing-library/jest-dom \
    @testing-library/user-event \
    jsdom \
    msw \
    jest-axe \
    axe-core \
    @axe-core/playwright
  cd ../..
done

echo ""
echo "4. Installing Playwright browsers..."
npx playwright install --with-deps chromium firefox webkit

echo ""
echo "5. Setting up test database..."
echo "   Creating test database (if it doesn't exist)..."

# Check if PostgreSQL is running
if command -v psql &> /dev/null; then
  # Try to create test database
  createdb rightfit_test 2>/dev/null || echo "   Database already exists or cannot create"
else
  echo -e "${YELLOW}   ⚠️  PostgreSQL not found. Please install PostgreSQL and create test database manually:${NC}"
  echo "      createdb rightfit_test"
fi

echo ""
echo "6. Running database migrations on test database..."
if [ -n "$DATABASE_URL" ]; then
  cd packages/database
  DATABASE_URL="postgresql://test:test@localhost:5433/rightfit_test" npx prisma migrate deploy
  cd ../..
else
  echo -e "${YELLOW}   ⚠️  DATABASE_URL not set. Skipping migrations.${NC}"
  echo "      Set DATABASE_URL and run: cd packages/database && npx prisma migrate deploy"
fi

echo ""
echo "7. Making scripts executable..."
chmod +x tests/security/dependency-audit.sh
chmod +x tests/security/zap-scan.sh
chmod +x scripts/setup-testing.sh

echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}✅ Testing Suite Setup Complete!${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo "Next steps:"
echo ""
echo "1. Install K6 for performance testing:"
echo "   macOS: brew install k6"
echo "   Linux: See https://k6.io/docs/getting-started/installation/"
echo ""
echo "2. Install Docker for OWASP ZAP security scanning (if not already installed):"
echo "   https://docs.docker.com/get-docker/"
echo ""
echo "3. Run your first tests:"
echo "   npm test                          # Run all tests"
echo "   cd apps/api && npm test           # Backend tests"
echo "   cd apps/web-cleaning && npm test  # Frontend tests"
echo "   npx playwright test               # E2E tests"
echo ""
echo "4. View test documentation:"
echo "   cat tests/README.md"
echo "   cat TESTING-SUITE-IMPLEMENTATION.md"
echo ""
echo "Happy testing! 🚀"
echo ""
