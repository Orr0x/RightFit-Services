# EAS Development Build - Detailed Implementation Plan

**Story:** 012 - EAS Development Build for Offline Mode Testing
**Estimated Time:** 2-2.5 hours (hands-on: 1.5 hours, waiting: 0.5-1 hour)
**Priority:** 🔴 CRITICAL
**Prerequisites:** Android device (Android 6.0+), Node.js 20, pnpm
**Project Root:** `I:\RightFit-Services`

---

## Quick Start (TL;DR)

```bash
# 1. Install EAS CLI (GLOBAL - run from anywhere)
npm install -g eas-cli
eas login

# 2. Initialize project (run from mobile app directory)
cd I:\RightFit-Services\apps\mobile
eas init

# 3. Add dependencies (run from mobile app directory)
# Current directory: I:\RightFit-Services\apps\mobile
pnpm add expo-dev-client

# 4. Create eas.json and update app.json (see below)

# 5. Build (run from mobile app directory)
# Current directory: I:\RightFit-Services\apps\mobile
eas build --profile development --platform android

# 6. Install APK on device and test
```

**Expected time:** 2-2.5 hours total

**📁 Note:** Most commands run from `I:\RightFit-Services\apps\mobile` unless marked as GLOBAL

---

## Pre-Flight Checklist

**Before you start, understand what needs to be running:**

### ❌ **DO NOT NEED TO BE RUNNING** (Build happens on Expo servers)
- ❌ API server (`pnpm dev` in `apps/api`) - **Can be stopped or running, doesn't matter**
- ❌ Metro bundler (`pnpm start` in `apps/mobile`) - **Should NOT be running yet**
- ❌ Web app dev server - Doesn't affect mobile build
- ❌ Database - Doesn't affect build process
- ❌ Any Expo Go app - Close if open

### ✅ **SHOULD BE AVAILABLE**
- ✅ Internet connection (EAS uploads code to Expo servers)
- ✅ Node.js 20 installed
- ✅ pnpm installed
- ✅ Android device available (for testing later)

### 📱 **WHEN WILL YOU NEED SERVERS?**
- **Phase 4 & 5 (Testing):** You'll need API server running to test app functionality
- **Phase 3 (Connect to dev server):** Metro bundler will be started then
- **Build Phase (Phase 2):** Nothing needs to run locally - build happens on Expo's servers

### 💡 **Quick Summary:**
```
Phase 1 (Setup):       Servers not needed
Phase 2 (Build):       Servers not needed (build is remote)
Phase 3 (Install):     Servers not needed yet
Phase 4 (Testing):     Start Metro bundler: pnpm start
Phase 5 (Full test):   Start API server: cd apps/api && pnpm dev
```

**You can start the build process right now without stopping anything!**

---

## Phase 1: Setup (30 minutes)

### Task 1.1: Install EAS CLI (5 minutes)

**📁 Working Directory:** ANY (global commands)

```bash
# GLOBAL - Can run from anywhere (e.g., I:\RightFit-Services)
npm install -g eas-cli

# GLOBAL - Verify installation
eas --version
# Expected output: eas-cli/5.x.x

# GLOBAL - Login (create account if needed)
eas login
# Follow prompts to login or sign up (free account)

# GLOBAL - Verify login
eas whoami
# Expected: your-expo-username
```

**Verification:**
- [ ] `eas --version` shows 5.x.x
- [ ] `eas whoami` shows your username
- [ ] No errors

---

### Task 1.2: Initialize EAS Project (10 minutes)

**📁 Working Directory:** `I:\RightFit-Services\apps\mobile`

```bash
# Navigate to mobile app directory
cd I:\RightFit-Services\apps\mobile

# Initialize EAS (must be in apps/mobile directory)
eas init

# Follow prompts:
# - Account: Choose your account
# - Project name: RightFit Services
# - Slug: rightfit-services
```

**What happens:**
- Creates project in Expo dashboard
- Generates project ID
- Updates `app.json` with project ID

**Verification:**
- [ ] Message: "Project created successfully"
- [ ] `app.json` has `extra.eas.projectId`
- [ ] Can see project at https://expo.dev/

---

### Task 1.3: Create eas.json (10 minutes)

**📁 Working Directory:** `I:\RightFit-Services\apps\mobile`
**📁 File Location:** Create `I:\RightFit-Services\apps\mobile\eas.json`

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "buildType": "apk",
        "gradleCommand": ":app:assembleDebug"
      },
      "ios": {
        "simulator": true,
        "buildConfiguration": "Debug"
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "distribution": "store"
    }
  },
  "submit": {
    "production": {}
  }
}
```

**Verification:**
- [ ] File created at `apps/mobile/eas.json`
- [ ] Valid JSON (no syntax errors)
- [ ] Three build profiles: development, preview, production

---

### Task 1.4: Update app.json (5 minutes)

**📁 Working Directory:** `I:\RightFit-Services\apps\mobile`
**📁 File Location:** Edit `I:\RightFit-Services\apps\mobile\app.json`

Update `app.json` - add these fields:

```json
{
  "expo": {
    "name": "RightFit Services",
    "slug": "rightfit-services",
    "owner": "your-expo-username",  // ← ADD THIS (from eas whoami)
    "extra": {
      "eas": {
        "projectId": "your-project-id"  // ← Should already be here from eas init
      }
    },
    "plugins": [
      "expo-dev-client",  // ← ADD THIS
      "@nozbe/watermelondb/expo-plugin",  // ← ADD THIS
      [
        "expo-image-picker",
        {
          "photosPermission": "The app needs access to your photos.",
          "cameraPermission": "The app needs access to your camera."
        }
      ]
    ],
    "android": {
      "package": "com.rightfitservices.app",  // ← ADD THIS
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "permissions": [  // ← ADD THIS ARRAY
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE"
      ]
    },
    "ios": {
      "bundleIdentifier": "com.rightfitservices.app"  // ← ADD THIS
    }
  }
}
```

**Key changes:**
1. Add `owner` (your Expo username)
2. Add `expo-dev-client` to plugins
3. Add `@nozbe/watermelondb/expo-plugin` to plugins
4. Add Android `package` name
5. Add Android permissions
6. Add iOS `bundleIdentifier`

**Verification:**
- [ ] Valid JSON (no syntax errors)
- [ ] Owner matches `eas whoami`
- [ ] Project ID present
- [ ] Both plugins listed
- [ ] Package names set

---

### Task 1.5: Install Dependencies (5 minutes)

**📁 Working Directory:** `I:\RightFit-Services\apps\mobile`

```bash
# Ensure you're in the mobile app directory
cd I:\RightFit-Services\apps\mobile

# Add expo-dev-client
pnpm add expo-dev-client

# Verify installation
pnpm list expo-dev-client
# Expected: expo-dev-client 5.x.x

# Verify WatermelonDB already there
pnpm list @nozbe/watermelondb
# Expected: @nozbe/watermelondb 0.27.1

# Update lockfile
pnpm install
```

**Verification:**
- [ ] `expo-dev-client` in `package.json`
- [ ] `@nozbe/watermelondb` already present
- [ ] `pnpm-lock.yaml` updated
- [ ] No dependency errors

---

### Task 1.6: Commit Configuration (5 minutes)

**📁 Working Directory:** `I:\RightFit-Services` (project root)

```bash
# Navigate to project root
cd I:\RightFit-Services

# Stage configuration files
git add apps/mobile/eas.json
git add apps/mobile/app.json
git add apps/mobile/package.json
git add pnpm-lock.yaml

# Commit changes
git commit -m "Configure EAS build for development client

- Add eas.json with build profiles
- Add expo-dev-client and WatermelonDB plugins
- Configure Android and iOS bundle identifiers
- Install expo-dev-client dependency

Enables native module testing (WatermelonDB offline mode)

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
```

**Verification:**
- [ ] All config files committed
- [ ] Clean working directory
- [ ] Can revert if needed

---

## Phase 2: Build (20-25 minutes)

### Task 2.1: Start Build (2 minutes)

**📁 Working Directory:** `I:\RightFit-Services\apps\mobile`

```bash
# Navigate to mobile app directory (if not already there)
cd I:\RightFit-Services\apps\mobile

# Build Android development client
eas build --profile development --platform android
```

**What happens:**
1. EAS uploads your app code to Expo servers
2. Runs build on Expo infrastructure (Linux VM)
3. Installs dependencies
4. Applies plugins (WatermelonDB, dev client)
5. Compiles native Android code
6. Generates APK
7. Uploads APK to Expo CDN

**Estimated time:** 15-20 minutes (first build)

**You can:**
- Continue working on other tasks
- Take a break
- Monitor build at: https://expo.dev/accounts/[username]/projects/rightfit-services/builds

**Verification:**
- [ ] Message: "Build queued"
- [ ] Build URL displayed
- [ ] Can see build in dashboard

---

### Task 2.2: Monitor Build (0 minutes - passive)

**Watch progress at:**
https://expo.dev/accounts/[your-username]/projects/rightfit-services/builds

**Build phases (typical):**
1. ⏳ Queued (0-2 minutes)
2. 🏗️ Installing dependencies (3-5 minutes)
3. 🔧 Applying plugins (2-3 minutes)
4. 📦 Building Android app (8-12 minutes)
5. ✅ Upload APK (1-2 minutes)

**Total: 15-20 minutes**

**Troubleshooting:**
- If fails: Check error logs in dashboard
- Common issues:
  - Invalid app.json syntax → Fix and rebuild
  - Plugin error → Verify plugin names exact
  - Dependency conflict → Check package versions

---

### Task 2.3: Download APK (2 minutes)

**When build completes:**

```bash
# CLI shows download link
# Example: https://expo.dev/artifacts/eas/[long-hash].apk

# Option 1: Download from terminal link
# Option 2: Download from EAS dashboard
# Option 3: Get QR code (scan with device to download directly)
```

**File details:**
- Name: `rightfit-services-dev-[date].apk`
- Size: ~30-50 MB (typical)
- Location: Downloads folder

**Verification:**
- [ ] APK downloaded successfully
- [ ] File size reasonable (30-50 MB)
- [ ] No corruption (can extract with 7-Zip)

---

## Phase 3: Install on Device (25 minutes)

### Task 3.1: Prepare Android Device (5 minutes)

**Enable Developer Mode:**
1. Go to Settings → About Phone
2. Tap "Build Number" 7 times
3. Message: "You are now a developer"

**Enable USB Debugging:**
1. Settings → System → Developer Options
2. Enable "USB Debugging"
3. Enable "Install via USB" (some devices)

**Enable Unknown Sources:**
1. Settings → Security
2. Enable "Unknown Sources" or "Install Unknown Apps"

**Verification:**
- [ ] Developer mode enabled
- [ ] USB debugging on
- [ ] Unknown sources allowed

---

### Task 3.2: Transfer APK to Device (5 minutes)

**Method 1: Direct Download on Device (Easiest)**
1. On device browser, open EAS build URL
2. Tap "Download APK"
3. Wait for download
4. Skip to Task 3.3

**Method 2: USB Transfer**

**📁 Working Directory:** Directory where APK was downloaded (usually `I:\RightFit-Services` or `Downloads`)

```bash
# Connect device via USB
# Navigate to where you downloaded the APK
cd I:\RightFit-Services  # or wherever you saved the APK

# Copy APK to device (REQUIRES ADB installed)
adb push rightfit-services-dev.apk /sdcard/Download/

# Verify
adb shell ls /sdcard/Download/rightfit-services-dev.apk
```

**Method 3: Email/Cloud**
1. Email APK to yourself
2. Open on device
3. Download attachment

**Verification:**
- [ ] APK on device
- [ ] Can locate in Downloads or Files app

---

### Task 3.3: Install APK (5 minutes)

**Install via ADB (if USB connected):**

**📁 Working Directory:** Directory where APK is located

```bash
# Navigate to APK location
cd I:\RightFit-Services  # or wherever APK is downloaded

# Install APK via ADB (REQUIRES ADB installed)
adb install rightfit-services-dev.apk

# Expected: Success
# If fails: adb install -r rightfit-services-dev.apk (reinstall)
```

**Install via Device:**
1. Open Files app or Downloads
2. Find APK file
3. Tap to open
4. Tap "Install"
5. Confirm security warning
6. Wait for installation
7. Tap "Open" or find app icon

**Verification:**
- [ ] Installation successful
- [ ] App icon on home screen
- [ ] Icon shows dev client (blue "D")

---

### Task 3.4: Launch App (5 minutes)

**First launch:**
1. Tap app icon
2. See Expo Dev Client splash screen
3. See "Connect to Metro" screen

**Expected screens:**
- Expo Dev Client branding
- "Enter URL manually" button
- QR code scanner
- List of recent builds (empty first time)

**Verification:**
- [ ] App launches without crash
- [ ] Dev client welcome screen appears
- [ ] No immediate errors

---

### Task 3.5: Connect to Development Server (5 minutes)

**On computer:**

**📁 Working Directory:** `I:\RightFit-Services\apps\mobile`

```bash
# Navigate to mobile app directory
cd I:\RightFit-Services\apps\mobile

# Start Metro bundler with dev client support
pnpm start --dev-client

# Or shortcut (also works):
pnpm start
```

**Metro bundler starts:**
- Shows QR code
- Shows local URL (e.g., exp://192.168.1.100:8081)
- Press 'r' to reload
- Press 'd' to open dev tools

**⚠️ Note:** If you get an error about port 8081 already in use:
- Another Metro bundler or dev server is running
- Kill it: `npx kill-port 8081` (GLOBAL - run from anywhere)
- Or restart computer to clear all processes

**On device:**
1. In dev client app, tap "Scan QR Code"
2. Scan QR code from computer terminal
3. App connects to Metro
4. See "Downloading JavaScript bundle..."
5. App loads with your code

**Troubleshooting:**
- Can't scan QR? Enter URL manually: `exp://YOUR-IP:8081`
- Get your IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
- Ensure device and computer on SAME WiFi network

**Verification:**
- [ ] Metro bundler running
- [ ] Device connected
- [ ] App loads with your code
- [ ] Can see login screen

---

## Phase 4: Verification (30 minutes)

### Task 4.1: Verify WatermelonDB Loads (10 minutes)

**Check console logs (on computer in Metro terminal):**

**Expected logs:**
```
✅ Database initialized successfully
✅ SQLite adapter ready
✅ WatermelonDB models loaded: Property, WorkOrder, Contractor, Photo, SyncQueue
```

**NOT expected (these are BAD):**
```
❌ WatermelonDB not available (Expo Go). Running in online-only mode.
❌ Could not load SQLite native module
```

**Verification:**
- [ ] No "Expo Go" warnings
- [ ] Database initializes successfully
- [ ] No errors about native modules
- [ ] App doesn't crash on launch

**If you see errors:**
- Verify you're using dev build (not Expo Go)
- Check build profile was "development"
- Verify WatermelonDB plugin in app.json
- Try rebuilding with `--clear-cache`

---

### Task 4.2: Test Navigation (10 minutes)

**Test all screens:**
1. Login screen → Enter test credentials
2. Properties screen → Should load
3. Properties → Create Property
4. Work Orders screen → Should load
5. Work Orders → Create Work Order
6. Profile screen → Should load

**Verification:**
- [ ] All screens accessible
- [ ] No crashes
- [ ] Navigation smooth
- [ ] No console errors

---

### Task 4.3: Test Hot Reload (5 minutes)

**Test hot reload works:**

**📁 File to Edit:** `I:\RightFit-Services\apps\mobile\src\screens\properties\PropertiesListScreen.tsx`

1. Open `I:\RightFit-Services\apps\mobile\src\screens\properties\PropertiesListScreen.tsx`
2. Change title text: `<Text>Properties TEST</Text>`
3. Save file
4. Watch device

**Expected:**
- App updates within 2-3 seconds
- See "TEST" in title
- No app restart needed

**Verification:**
- [ ] Hot reload works
- [ ] Changes appear instantly
- [ ] No manual refresh needed

---

### Task 4.4: Test Database Operations (5 minutes)

**⚠️ For full testing, you'll need the API server running:**

**📁 Working Directory for API:** `I:\RightFit-Services\apps\api`

```bash
# Open a NEW terminal window
cd I:\RightFit-Services\apps\api

# Start API server (keep Metro bundler running in other terminal)
pnpm dev

# API should start on http://localhost:3001
```

**Now test on device:**

**Create a property:**
1. Navigate to Properties → Create Property
2. Fill in form:
   - Name: Test Property
   - Address: 123 Test St
   - Postcode: TE5T 1NG
   - Type: House
   - Bedrooms: 3
   - Bathrooms: 2
3. Submit

**Expected:**
- Form submits successfully
- Property appears in list
- No errors in console
- **Data saved to local SQLite database**

**Verify in console logs:**
```
✅ Property created: { id: '...', name: 'Test Property', ... }
✅ Saved to WatermelonDB
```

**Verification:**
- [ ] Property created successfully
- [ ] Appears in list
- [ ] Saved locally (check logs)
- [ ] No errors

---

## Phase 5: Final Checks (10 minutes)

### Task 5.1: Smoke Test All Features (5 minutes)

**Quick test:**
- [ ] Login works
- [ ] Can view properties
- [ ] Can create property
- [ ] Can view work orders
- [ ] Can create work order
- [ ] Can upload photo
- [ ] Profile screen loads
- [ ] Logout works

---

### Task 5.2: Check Error Console (5 minutes)

**Review console logs:**
- [ ] No red errors
- [ ] No "Expo Go" warnings
- [ ] No missing native module errors
- [ ] Database initialized successfully

**Common warnings (OK to ignore):**
- Yellow warnings about deprecated APIs
- Performance warnings
- React Navigation warnings

**Critical errors (NOT OK):**
- Red errors about crashes
- Native module errors
- Database initialization failures

---

## Success Criteria

### ✅ Build Success
- [x] Build completed without errors
- [x] APK generated and downloadable
- [x] Build time < 25 minutes
- [x] File size 30-50 MB

### ✅ Installation Success
- [x] Installed on device without errors
- [x] App icon appears
- [x] App launches successfully
- [x] Dev client screen appears

### ✅ Connection Success
- [x] Connects to Metro bundler
- [x] Loads JavaScript bundle
- [x] Hot reload works
- [x] Console logs visible

### ✅ WatermelonDB Success
- [x] No "Expo Go" warnings
- [x] Database initializes
- [x] SQLite adapter loads
- [x] Can create database records

### ✅ App Functionality
- [x] All screens load
- [x] Navigation works
- [x] Can create properties
- [x] Can create work orders
- [x] No crashes

---

## Next Steps

### Immediate (After Build Complete)

**✅ YOU ARE HERE** → Ready for offline mode testing!

Proceed to:
- **Story 003: Offline Mode Testing** (Full offline workflow)
- Test offline work order creation
- Test offline photo upload
- Test sync when back online
- Verify conflict resolution

### Documentation Updates

Update these files:
- [ ] `apps/mobile/README.md` - Add dev build instructions
- [ ] `QUICK_START.md` - Add EAS build section
- [ ] `.gitignore` - Add `*.apk` (don't commit builds)

### Team Knowledge Sharing

- [ ] Document build process learnings
- [ ] Share any troubleshooting tips
- [ ] Update team wiki/docs

---

## Common Issues & Solutions

### Issue 1: Build fails - "Invalid project ID"

**Solution:**
```bash
eas init --force
# Re-enter project details
```

### Issue 2: Build fails - "Plugin error"

**Check app.json plugins syntax:**
```json
"plugins": [
  "expo-dev-client",  // ← Must be exact
  "@nozbe/watermelondb/expo-plugin"  // ← Must be exact
]
```

### Issue 3: APK won't install - "Parse error"

**Solutions:**
- Android version too old (need 6.0+)
- APK corrupted → Re-download
- Conflicting package name → Uninstall old version first

### Issue 4: Can't connect to Metro bundler

**Solutions:**

**📁 Working Directory for commands:** `I:\RightFit-Services\apps\mobile`

```bash
# 1. Check WiFi - same network?

# 2. Get your IP (GLOBAL - run from anywhere):
ipconfig  # Windows
ifconfig  # Mac/Linux

# 3. Manually enter in dev client app on phone:
exp://192.168.1.100:8081

# 4. Check firewall allows port 8081

# 5. Restart Metro (from mobile directory):
cd I:\RightFit-Services\apps\mobile
pnpm start --dev-client --clear
```

### Issue 5: WatermelonDB not initializing

**Verify:**
1. Using dev build (not Expo Go)
2. WatermelonDB plugin in app.json
3. Build profile is "development"

**Try clean build:**

**📁 Working Directory:** `I:\RightFit-Services\apps\mobile`

```bash
cd I:\RightFit-Services\apps\mobile
eas build --profile development --platform android --clear-cache
```

---

## Time Log Template

Track your actual time:

```
[ ] Phase 1 - Setup: _____ minutes (est: 30)
[ ] Phase 2 - Build: _____ minutes (est: 20-25)
[ ] Phase 3 - Install: _____ minutes (est: 25)
[ ] Phase 4 - Verification: _____ minutes (est: 30)
[ ] Phase 5 - Final Checks: _____ minutes (est: 10)

Total: _____ minutes (est: 115-125 minutes / 2-2.5 hours)
```

---

## Checklist Summary

**Setup (30 min):**
- [ ] Install EAS CLI
- [ ] Initialize EAS project
- [ ] Create eas.json
- [ ] Update app.json
- [ ] Install dependencies
- [ ] Commit changes

**Build (20-25 min):**
- [ ] Start build
- [ ] Monitor progress
- [ ] Download APK

**Install (25 min):**
- [ ] Prepare device
- [ ] Transfer APK
- [ ] Install APK
- [ ] Launch app
- [ ] Connect to dev server

**Verify (30 min):**
- [ ] WatermelonDB loads
- [ ] Test navigation
- [ ] Test hot reload
- [ ] Test database ops

**Final (10 min):**
- [ ] Smoke test
- [ ] Check console

**✅ READY FOR OFFLINE TESTING!**

---

**Last Updated:** 2025-10-29
**Next:** Story 003 - Offline Mode Testing
