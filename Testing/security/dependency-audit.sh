#!/bin/bash
#
# Dependency Security Audit Script
#
# Runs security audits on all dependencies across the monorepo

set -e

echo "================================================"
echo "Running Security Audit for RightFit Services"
echo "================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

FAILED_AUDITS=0

# Function to run npm audit
run_npm_audit() {
  local app=$1
  local path=$2

  echo "Auditing: $app"
  echo "----------------------------------------"

  cd "$path"

  # Run npm audit and capture output
  if npm audit --audit-level=moderate; then
    echo -e "${GREEN}✓ No vulnerabilities found in $app${NC}"
  else
    echo -e "${RED}✗ Vulnerabilities found in $app${NC}"
    FAILED_AUDITS=$((FAILED_AUDITS + 1))

    # Generate detailed report
    npm audit --json > "../../tests/security/reports/${app}-audit.json"
  fi

  cd - > /dev/null
  echo ""
}

# Create reports directory
mkdir -p tests/security/reports

echo "1. Auditing Root Dependencies"
echo "==============================="
run_npm_audit "root" "."

echo "2. Auditing Backend API"
echo "==============================="
run_npm_audit "api" "apps/api"

echo "3. Auditing Web Applications"
echo "==============================="
run_npm_audit "web-cleaning" "apps/web-cleaning"
run_npm_audit "web-maintenance" "apps/web-maintenance"
run_npm_audit "web-customer" "apps/web-customer"
run_npm_audit "web-landlord" "apps/web-landlord"
run_npm_audit "web-worker" "apps/web-worker"
run_npm_audit "guest-tablet" "apps/guest-tablet"

echo "4. Auditing Mobile App"
echo "==============================="
run_npm_audit "mobile" "apps/mobile"

echo "5. Auditing Shared Packages"
echo "==============================="
if [ -d "packages/database" ]; then
  run_npm_audit "database" "packages/database"
fi

if [ -d "packages/shared" ]; then
  run_npm_audit "shared" "packages/shared"
fi

echo ""
echo "================================================"
echo "Security Audit Summary"
echo "================================================"
if [ $FAILED_AUDITS -eq 0 ]; then
  echo -e "${GREEN}✓ All audits passed! No vulnerabilities found.${NC}"
  exit 0
else
  echo -e "${RED}✗ $FAILED_AUDITS application(s) have vulnerabilities${NC}"
  echo ""
  echo "Review detailed reports in: tests/security/reports/"
  echo ""
  echo "To fix vulnerabilities, run:"
  echo "  npm audit fix"
  echo ""
  exit 1
fi
