#!/bin/bash
#
# OWASP ZAP Security Scan
#
# Runs OWASP ZAP baseline scan on frontend applications

set -e

echo "================================================"
echo "Running OWASP ZAP Security Scan"
echo "================================================"
echo ""

# Configuration
ZAP_VERSION="stable"
REPORT_DIR="tests/security/reports/zap"
mkdir -p "$REPORT_DIR"

# Applications to scan
declare -A APPS
APPS[web-cleaning]="http://localhost:5174"
APPS[web-maintenance]="http://localhost:5175"
APPS[web-customer]="http://localhost:5176"
APPS[web-landlord]="http://localhost:5177"
APPS[web-worker]="http://localhost:5178"
APPS[guest-tablet]="http://localhost:5179"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "Error: Docker is not running"
  exit 1
fi

# Pull ZAP Docker image
echo "Pulling OWASP ZAP Docker image..."
docker pull "owasp/zap2docker-${ZAP_VERSION}"

FAILED_SCANS=0

# Run ZAP scan for each application
for app in "${!APPS[@]}"; do
  url="${APPS[$app]}"
  echo ""
  echo "Scanning: $app ($url)"
  echo "----------------------------------------"

  # Run ZAP baseline scan
  if docker run --rm \
    -v "$(pwd):/zap/wrk/:rw" \
    "owasp/zap2docker-${ZAP_VERSION}" \
    zap-baseline.py \
    -t "$url" \
    -r "${REPORT_DIR}/${app}-report.html" \
    -J "${REPORT_DIR}/${app}-report.json" \
    -w "${REPORT_DIR}/${app}-report.md" \
    -c zap-config.conf; then
    echo "✓ Scan completed for $app"
  else
    echo "✗ Security issues found in $app"
    FAILED_SCANS=$((FAILED_SCANS + 1))
  fi
done

echo ""
echo "================================================"
echo "OWASP ZAP Scan Summary"
echo "================================================"
if [ $FAILED_SCANS -eq 0 ]; then
  echo "✓ All scans passed!"
  exit 0
else
  echo "✗ $FAILED_SCANS application(s) have security issues"
  echo ""
  echo "Review reports in: $REPORT_DIR/"
  exit 1
fi
