# Mobile App Debugging Setup

## Overview

Your RightFit Services mobile app now has comprehensive debugging and error handling to help you identify and fix issues.

## Features

### 1. **Logger Service** (`src/services/logger.ts`)

Captures all app activity and errors:
- ✅ Saves logs to device storage (AsyncStorage)
- ✅ Keeps last 500 log entries
- ✅ Automatically sanitizes sensitive data (passwords, tokens)
- ✅ Provides detailed network request/response logging
- ✅ Categorizes logs (DEBUG, INFO, WARN, ERROR)

**Usage in code:**
```typescript
import logger from './services/logger'

logger.info('CATEGORY', 'Message', { optional: 'data' })
logger.error('CATEGORY', 'Error message', error, { optional: 'data' })
```

### 2. **Enhanced API Client** (`src/services/api.ts`)

Every API call is now logged with:
- ✅ Request details (method, URL, data, headers)
- ✅ Response details (status, data, duration)
- ✅ Detailed error messages showing exactly what went wrong

**Error messages now tell you:**
- `Network error - cannot reach API server` - API not running or wrong IP
- `Request timeout` - API too slow or connection issue
- `Unauthorized: Invalid credentials` - Wrong email/password
- `Server Error` - Problem on the API side

### 3. **Reactotron** (`src/config/reactotron.ts`)

Live debugging from your PC:
- ✅ See logs in real-time on your computer
- ✅ Inspect network requests
- ✅ View AsyncStorage data
- ✅ Monitor app state

**Setup:**
1. Download Reactotron Desktop: https://github.com/infinitered/reactotron/releases
2. Install and open Reactotron on your PC
3. Make sure the IP in `src/config/reactotron.ts` matches your PC's IP (currently: 192.168.0.17)
4. Run your app - it will automatically connect to Reactotron

### 4. **Debug Screen** (`src/screens/DebugScreen.tsx`)

View logs directly on your device:
- ✅ Filter by log level (Error, Warning, Info, Debug)
- ✅ See full error details and stack traces
- ✅ Export logs via Share (send to email, save to files)
- ✅ Clear old logs

**To access:** Add a button to your app's navigation that navigates to the Debug screen.

## How to Debug Connection Issues

### Step 1: Check Logs on Device

1. Navigate to Debug Screen in your app
2. Filter to "Errors" only
3. Look for API_ERROR logs
4. Read the detailed error message

Common errors you'll see:

**"Network error - cannot reach API server at http://192.168.0.17:3001"**
- API server is not running
- Wrong IP address (your PC's IP changed)
- Firewall blocking connection
- Device and PC on different networks

**"Request timeout - please check your connection"**
- API server too slow
- Network congestion
- Check API server logs

**"Unauthorized: Invalid credentials"**
- Wrong email or password
- Account doesn't exist

### Step 2: Check Reactotron (if running on PC)

1. Open Reactotron Desktop app
2. Look at the Timeline tab
3. See all network requests in real-time
4. Click on a request to see full details

### Step 3: Export Logs

1. Open Debug Screen
2. Tap "Export" button
3. Send logs via email or save to file
4. Review full details on PC

## What Gets Logged

### API Requests
```
[API_REQUEST] POST http://192.168.0.17:3001/api/auth/login
{
  method: "POST",
  url: "/api/auth/login",
  data: {
    email: "user@example.com",
    password: "***REDACTED***"
  }
}
```

### API Responses
```
[API_RESPONSE] POST /api/auth/login - 200
{
  status: 200,
  data: { access_token: "***REDACTED***", ... },
  duration: 245ms
}
```

### API Errors
```
[API_ERROR] POST /api/auth/login failed
{
  message: "Network Error",
  code: "ERR_NETWORK",
  request: {
    message: "Request was made but no response received",
    networkError: true
  },
  config: {
    baseURL: "http://192.168.0.17:3001",
    url: "/api/auth/login",
    method: "POST",
    timeout: 10000
  }
}
```

## Testing the Debugging Setup

### Test 1: API Not Running
1. Stop your API server
2. Try to login on mobile app
3. Check Debug Screen - you should see:
   - "Network error - cannot reach API server"
   - Full request details
   - Network error flag

### Test 2: Wrong Credentials
1. Make sure API is running
2. Try to login with wrong password
3. Check Debug Screen - you should see:
   - "Unauthorized: Invalid credentials"
   - HTTP 401 status
   - Full request/response details

### Test 3: Success Flow
1. Login with correct credentials
2. Check Debug Screen - you should see:
   - API_REQUEST for login
   - API_RESPONSE with 200 status
   - "Login successful" message

## Network Configuration

Current API URL: `http://192.168.0.17:3001`

**To change:**
1. Edit `apps/mobile/src/services/api.ts`
2. Update `API_BASE_URL` constant
3. Rebuild the app

**IP Address tips:**
- Use your PC's local network IP (192.168.x.x)
- Don't use `localhost` - phone can't reach it
- Make sure phone and PC are on same WiFi network
- PC firewall must allow incoming connections on port 3001

## Reactotron Configuration

Current Reactotron host: `192.168.0.17`

**To change:**
1. Edit `apps/mobile/src/config/reactotron.ts`
2. Update `host` property
3. Reload the app (shake device > Reload)

## Production Builds

- Reactotron only runs in development (`if (__DEV__)`)
- Logger still works in production
- Debug Screen available in production (consider hiding it behind a secret gesture)

## Troubleshooting

### "Reactotron won't connect"
- Check Reactotron Desktop is running
- Verify IP address matches your PC
- Reload the app
- Check firewall isn't blocking port 9090

### "Logs not appearing in Debug Screen"
- Logs are saved async - wait a moment and tap "Refresh"
- Check AsyncStorage isn't full (unlikely)
- Try "Clear" then retry the action

### "Too many logs slowing down app"
- Tap "Clear" in Debug Screen to remove old logs
- Logger auto-limits to 500 entries

## Next Steps

1. **Add Debug Screen to Navigation:**
   - Add a button in your app's settings/profile screen
   - Navigate to `<DebugScreen />` component

2. **Download Reactotron:**
   - https://github.com/infinitered/reactotron/releases
   - Install on your PC
   - Connect and see live logs!

3. **Test It:**
   - Try logging in with wrong credentials
   - Stop the API server and try again
   - Check Debug Screen to see detailed errors
   - Open Reactotron to see live network traffic

## Summary

You now have:
- ✅ Detailed error messages showing exactly what failed
- ✅ On-device log viewer (Debug Screen)
- ✅ Live debugging from PC (Reactotron)
- ✅ All network requests/responses logged
- ✅ Automatic sensitive data redaction
- ✅ Export logs capability

**You'll never have to guess "why isn't it working?" again!**
