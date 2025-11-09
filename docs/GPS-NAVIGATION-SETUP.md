# GPS Navigation Setup Guide

**Sprint 8 - GPS Navigation & Location Services**

This guide explains how to set up the GPS navigation feature for the RightFit Services Worker App.

---

## Overview

The GPS navigation system enables workers to:
- View all their job locations in one place (My Locations page)
- Navigate to properties with turn-by-turn directions
- Check weather and traffic conditions before traveling
- Get ETAs and distance calculations
- Handle remote properties using what3words

**Monthly Cost**: $0 (all free API tiers)

---

## Required API Keys

### 1. WeatherAPI.com (REQUIRED)

**Free Tier**: 1,000,000 calls/month
**Cost**: $0
**Use**: Current weather, forecasts, and weather alerts

#### Registration Steps:

1. Go to https://www.weatherapi.com/signup.aspx
2. Sign up with your email (no credit card required)
3. Verify your email address
4. Log in to your dashboard
5. Copy your API key from the dashboard
6. Add to `.env`:
   ```
   WEATHER_API_KEY=your_actual_key_here
   ```

#### Features Used:
- Current weather conditions
- Temperature, humidity, wind speed
- Weather alerts (storms, severe weather)
- UV index and visibility
- Worker safety recommendations

---

### 2. TomTom Traffic API (OPTIONAL)

**Free Tier**: 2,500 requests/day
**Cost**: $0
**Use**: Real-time traffic conditions and incidents

#### Registration Steps:

1. Go to https://developer.tomtom.com/
2. Create a free account
3. Go to "My Dashboard" → "My APIs"
4. Click "Create API Key"
5. Enable "Traffic API" for your key
6. Copy the API key
7. Add to `.env`:
   ```
   TOMTOM_API_KEY=your_actual_key_here
   ```

#### Features Used:
- Traffic flow data
- Incident reports (accidents, road work, closures)
- Delay estimates
- Route optimization based on traffic

**Note**: If not configured, the app will gracefully degrade to showing route without live traffic data.

---

### 3. what3words API (OPTIONAL)

**Free Tier**: 25,000 requests/month
**Cost**: $0
**Use**: Remote/rural property addressing

#### Registration Steps:

1. Go to https://developer.what3words.com/
2. Sign up for a free account (no credit card required)
3. Create a new project
4. Generate an API key
5. Copy the API key
6. Add to `.env`:
   ```
   WHAT3WORDS_API_KEY=your_actual_key_here
   ```

#### Features Used:
- Convert lat/lon to 3-word addresses for remote properties
- Precise location sharing for hard-to-find properties
- Fallback addressing for rural areas

**Note**: If not configured, the app will use Plus Codes (Google's open-source alternative) as fallback.

---

## Free Services (No API Key Required)

### OpenStreetMap Nominatim (Geocoding)

**Free Tier**: Unlimited
**Cost**: $0
**Rate Limit**: 1 request/second (enforced by application)

#### Usage:
- Convert addresses to GPS coordinates
- Reverse geocoding (coordinates to addresses)
- No API key needed
- Must include User-Agent header (automatically set)

### OSRM (Routing)

**Free Tier**: Unlimited
**Cost**: $0
**Public Server**: http://router.project-osrm.org/

#### Usage:
- Calculate routes between two points
- Turn-by-turn directions
- Distance and ETA calculations
- No API key needed
- Can self-host if needed

### Plus Codes (Open Location Code)

**Free**: Open-source library
**Cost**: $0

#### Usage:
- Generate short codes for any location
- Free alternative to what3words
- Works offline
- Included in application

---

## Environment Configuration

### Development Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Add your API keys to `.env`:
   ```env
   # Required
   WEATHER_API_KEY=your_weatherapi_key_here

   # Optional
   TOMTOM_API_KEY=your_tomtom_api_key_here
   WHAT3WORDS_API_KEY=your_what3words_api_key_here
   ```

3. Restart your development servers:
   ```bash
   # API server
   npm run dev:api

   # Worker app
   npm run dev:worker
   ```

### Production Setup

1. Set environment variables in your hosting platform:
   - **Required**: `WEATHER_API_KEY`
   - **Optional**: `TOMTOM_API_KEY`, `WHAT3WORDS_API_KEY`

2. Verify configuration:
   ```bash
   node apps/api/src/scripts/verify-navigation-config.js
   ```

---

## Testing the Setup

### 1. Test Weather API

```bash
curl "https://api.weatherapi.com/v1/current.json?key=YOUR_KEY&q=London&aqi=no"
```

Expected response: JSON with current weather data

### 2. Test TomTom Traffic API (if configured)

```bash
curl "https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?key=YOUR_KEY&point=51.5074,-0.1278"
```

Expected response: JSON with traffic flow data

### 3. Test what3words API (if configured)

```bash
curl "https://api.what3words.com/v3/convert-to-3wa?coordinates=51.5074,-0.1278&key=YOUR_KEY"
```

Expected response: JSON with 3-word address

### 4. Test Nominatim (no key needed)

```bash
curl "https://nominatim.openstreetmap.org/search?q=10+Downing+Street,+London&format=json" \
  -H "User-Agent: RightFit-Services/1.0"
```

Expected response: JSON array with geocoding results

### 5. Test OSRM (no key needed)

```bash
curl "http://router.project-osrm.org/route/v1/driving/-0.1278,51.5074;-0.0880,51.5158?overview=false&steps=true"
```

Expected response: JSON with route and turn-by-turn directions

---

## Rate Limits & Caching

To stay within free tier limits, the application implements:

### Geocoding Cache
- **Strategy**: Cache coordinates in database
- **Duration**: 30 days
- **Impact**: Addresses geocoded once per month maximum
- **Savings**: ~95% reduction in Nominatim requests

### Weather Cache
- **Strategy**: In-memory cache
- **Duration**: 1 hour
- **Impact**: Same location weather cached for workers
- **Savings**: ~90% reduction in WeatherAPI requests

### Route Cache
- **Strategy**: Session-based cache
- **Duration**: 10 minutes
- **Impact**: Route recalculated only on significant location change
- **Savings**: ~80% reduction in OSRM requests

### Rate Limiting
- **Nominatim**: 1 request/second (required by OSM usage policy)
- **All APIs**: Exponential backoff on errors
- **Queueing**: Requests queued to respect limits

---

## Troubleshooting

### "Invalid API key" Error

**Cause**: API key not set or incorrect

**Solution**:
1. Verify `.env` file has correct key
2. Restart application servers
3. Check for typos in API key
4. Verify API key is active in provider dashboard

### "Rate limit exceeded" Error

**Cause**: Too many requests in short period

**Solution**:
1. Check cache is working (see logs)
2. Verify rate limiting is enabled
3. Consider upgrading to paid tier if needed
4. Review application logs for excessive requests

### "Geocoding failed" Error

**Cause**: Address not found or Nominatim unavailable

**Solution**:
1. Verify address is complete and correct
2. Try simplifying address (e.g., remove apartment number)
3. Check OpenStreetMap status: https://status.openstreetmap.org/
4. Fall back to manual coordinate entry

### Weather Data Not Loading

**Cause**: WeatherAPI key missing or invalid

**Solution**:
1. Verify `WEATHER_API_KEY` in `.env`
2. Test API key manually (see Testing section)
3. Check WeatherAPI dashboard for usage/limits
4. Review application logs for API errors

---

## Security Best Practices

### ✅ DO:
- Store API keys in `.env` file (never in code)
- Add `.env` to `.gitignore`
- Use environment variables in production
- Rotate API keys periodically
- Monitor API usage in provider dashboards
- Enable API key restrictions (IP allowlists, HTTP referrers)

### ❌ DON'T:
- Commit API keys to Git
- Share API keys in Slack/email
- Use production keys in development
- Expose API keys in client-side code
- Log API keys in application logs
- Share `.env` file

---

## Cost Monitoring

All APIs are free tier, but monitor usage to avoid surprises:

### WeatherAPI.com
- **Dashboard**: https://www.weatherapi.com/my/
- **Limit**: 1,000,000 calls/month
- **Expected Usage**: ~10,000 calls/month (100 workers, 5 checks/day)
- **Alert At**: 750,000 calls (75%)

### TomTom Traffic API (optional)
- **Dashboard**: https://developer.tomtom.com/user/me/apps
- **Limit**: 2,500 calls/day
- **Expected Usage**: ~500 calls/day (100 workers, 5 checks/day with caching)
- **Alert At**: 2,000 calls (80%)

### what3words API (optional)
- **Dashboard**: https://accounts.what3words.com/
- **Limit**: 25,000 calls/month
- **Expected Usage**: ~5,000 calls/month (remote properties only)
- **Alert At**: 20,000 calls (80%)

---

## Support

### API Provider Support:
- **WeatherAPI.com**: https://www.weatherapi.com/contact.aspx
- **TomTom**: https://developer.tomtom.com/support
- **what3words**: https://developer.what3words.com/support

### RightFit Navigation Support:
- Review logs: `logs/navigation-api.log`
- Check health endpoint: `GET /api/health/navigation`
- Run diagnostics: `npm run diagnose:navigation`

---

**Last Updated**: November 9, 2025
**Feature**: Sprint 8 - GPS Navigation
**Status**: Production-ready
