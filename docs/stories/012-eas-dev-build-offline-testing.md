# Story 012: EAS Development Build for Offline Mode Testing

**Epic:** Mobile Development & Offline Functionality
**Priority:** 🔴 CRITICAL - BLOCKS OFFLINE MODE VERIFICATION
**Sprint:** Between Sprint 5 & 6
**Story Points:** 5 (Low complexity, high impact)
**Status:** To Do

---

## User Story

**As a** solo developer building RightFit Services
**I want to** create an EAS development build of the mobile app
**So that** I can test offline mode functionality with WatermelonDB on a physical device

---

## 🚨 CRITICAL SUCCESS FACTORS

**Why This Matters:**
- Offline mode is the **KEY DIFFERENTIATOR** for RightFit Services
- WatermelonDB requires native SQLite modules that don't work in Expo Go
- Current offline code is **UNTESTED** - high risk if it doesn't work
- Cannot claim offline functionality as complete until verified on device

**Risk Level:** LOW
- Well-documented process (Expo EAS)
- No code changes required (configuration only)
- Can roll back to Expo Go if needed
- Build happens on Expo's servers (no local environment issues)

**Impact:**
- ✅ Verifies offline mode works as designed
- ✅ Identifies any bugs before production
- ✅ Gives confidence in key differentiator
- ✅ Enables full offline testing workflow

---

## Acceptance Criteria

### AC-12.1: EAS CLI Setup
- **Given** development machine with Node.js installed
- **When** setting up EAS CLI
- **Then**:
  - Install EAS CLI globally: `npm install -g eas-cli`
  - Verify installation: `eas --version` shows v5.0.0+
  - Login to Expo account: `eas login`
  - Create Expo account if needed (free tier sufficient)
  - Verify login successful

### AC-12.2: Project Configuration
- **Given** Expo account is configured
- **When** initializing EAS build
- **Then**:
  - Run `eas init` from `apps/mobile/` directory
  - Project ID assigned and saved to `app.json`
  - Create `eas.json` with build profiles
  - Add WatermelonDB plugin to `app.json`
  - Add expo-dev-client plugin to `app.json`
  - Commit configuration files to git

### AC-12.3: Install Development Client Dependencies
- **Given** project configuration complete
- **When** adding required dependencies
- **Then**:
  - Install expo-dev-client: `pnpm add expo-dev-client`
  - Verify package.json updated
  - Run `pnpm install` to update lockfile
  - No dependency conflicts
  - TypeScript types resolve correctly

### AC-12.4: Build Configuration (eas.json)
- **Given** dependencies installed
- **When** configuring build profiles
- **Then** `eas.json` contains:
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
        "distribution": "internal"
      },
      "production": {
        "distribution": "store"
      }
    }
  }
  ```

### AC-12.5: App Configuration (app.json)
- **Given** build profiles configured
- **When** updating app.json
- **Then** verify:
  - Project slug set: `"slug": "rightfit-services"`
  - Owner set: `"owner": "your-expo-username"`
  - Project ID in extra.eas.projectId
  - Plugins array includes:
    - `"expo-dev-client"`
    - `"@nozbe/watermelondb/expo-plugin"`
  - Build number incremented
  - Version set correctly

### AC-12.6: Android Development Build
- **Given** configuration complete
- **When** building Android development client
- **Then**:
  - Run: `eas build --profile development --platform android`
  - Build queues successfully on Expo servers
  - Build completes without errors (15-20 minutes)
  - APK file available for download
  - Build appears in EAS dashboard
  - Download link generated

### AC-12.7: iOS Development Build (Optional)
- **Given** Apple Developer account available
- **When** building iOS development client
- **Then**:
  - Run: `eas build --profile development --platform ios`
  - Device UDID registered (if physical device)
  - Provisioning profile created
  - Build completes successfully
  - IPA file available for download
  - Can install via Xcode or TestFlight

**Note:** iOS build optional for MVP - Android sufficient for testing.

### AC-12.8: Install on Physical Device
- **Given** build successfully completed
- **When** installing on Android device
- **Then**:
  - Download APK from EAS dashboard
  - Transfer to device via USB or direct download
  - Enable "Install from Unknown Sources" on device
  - Install APK successfully
  - App icon appears on home screen
  - App launches without crashes
  - Dev client welcome screen appears

### AC-12.9: Connect to Development Server
- **Given** dev build installed on device
- **When** connecting to development server
- **Then**:
  - From computer, run: `cd apps/mobile && pnpm start --dev-client`
  - QR code appears in terminal
  - Scan QR code with dev client app on device
  - Metro bundler loads successfully
  - App loads with latest code
  - Hot reload working (make small change, see update)
  - Console logs visible in terminal

### AC-12.10: Verify WatermelonDB Works
- **Given** dev build connected to dev server
- **When** app initializes
- **Then**:
  - Check logs: No "WatermelonDB not available (Expo Go)" message
  - Database initializes successfully
  - SQLite adapter loads native modules
  - No errors in console
  - App doesn't crash on launch
  - Can navigate to all screens

---

## Edge Cases

### Critical Edge Cases

1. **Build fails with dependency conflicts**
   - **Action:** Check for conflicting native modules
   - **Expected:** Clear error message, fix dependency versions

2. **WatermelonDB plugin fails to apply**
   - **Action:** Verify plugin syntax in app.json
   - **Expected:** Build fails with clear plugin error

3. **APK won't install on device**
   - **Action:** Check Android version (minimum Android 6.0)
   - **Expected:** Error message about compatibility

4. **Dev client can't connect to server**
   - **Action:** Ensure device and computer on same WiFi
   - **Expected:** Shows connection timeout error

5. **Native modules still not loading**
   - **Action:** Verify build profile is "development" not "production"
   - **Expected:** Development build has all native code

6. **Metro bundler connection drops**
   - **Action:** Check firewall settings on development machine
   - **Expected:** Can reconnect by rescanning QR code

---

## Technical Implementation Notes

### Prerequisites

**System Requirements:**
- Node.js 20 LTS
- pnpm 8.x
- Android device running Android 6.0+ (or iOS device with iOS 13+)
- USB cable for device connection (optional - can use WiFi)
- Expo account (free tier)

**No Required:**
- ❌ Android Studio (not needed)
- ❌ Xcode (only for iOS builds)
- ❌ Apple Developer account ($99/year - only for iOS builds)

### Step 1: Install EAS CLI

```bash
# Install globally
npm install -g eas-cli

# Verify installation
eas --version

# Login (creates account if needed)
eas login

# Verify login
eas whoami
```

### Step 2: Initialize EAS Project

```bash
cd apps/mobile

# Initialize EAS
eas init

# Follow prompts:
# - Choose existing Expo account
# - Project name: RightFit Services
# - Slug: rightfit-services
```

### Step 3: Create eas.json

Create `apps/mobile/eas.json`:

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

### Step 4: Update app.json

Update `apps/mobile/app.json`:

```json
{
  "expo": {
    "name": "RightFit Services",
    "slug": "rightfit-services",
    "owner": "your-expo-username",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "newArchEnabled": false,
    "extra": {
      "eas": {
        "projectId": "your-project-id-from-eas-init"
      }
    },
    "plugins": [
      "expo-dev-client",
      "@nozbe/watermelondb/expo-plugin",
      [
        "expo-image-picker",
        {
          "photosPermission": "The app needs access to your photos.",
          "cameraPermission": "The app needs access to your camera."
        }
      ]
    ],
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.rightfitservices.app",
      "infoPlist": {
        "NSPhotoLibraryUsageDescription": "Upload photos of properties.",
        "NSCameraUsageDescription": "Take photos of properties."
      }
    },
    "android": {
      "package": "com.rightfitservices.app",
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "permissions": [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE"
      ]
    }
  }
}
```

### Step 5: Install Dependencies

```bash
# Add expo-dev-client
pnpm add expo-dev-client

# Verify WatermelonDB is already installed
pnpm list @nozbe/watermelondb

# Should show: @nozbe/watermelondb 0.27.1
```

### Step 6: Build Development Client

**For Android (Recommended - fastest, easiest):**

```bash
# Start build
eas build --profile development --platform android

# This will:
# 1. Upload your app code to Expo servers
# 2. Build APK with native modules (15-20 min)
# 3. Provide download link when complete

# Monitor build progress:
# Visit: https://expo.dev/accounts/[your-username]/projects/rightfit-services/builds
```

**For iOS (Optional - requires Apple account):**

```bash
# For simulator only (no Apple account needed)
eas build --profile development --platform ios --simulator

# For physical device (requires Apple Developer account $99/year)
eas device:create  # Register device UDID
eas build --profile development --platform ios
```

### Step 7: Install APK on Android Device

**Method 1: Direct Download on Device**
1. On Android device, open EAS build URL
2. Tap "Download APK"
3. Enable "Install from Unknown Sources" when prompted
4. Install APK
5. Launch app

**Method 2: Transfer via USB**
1. Download APK to computer
2. Connect device via USB
3. Copy APK to device (e.g., Downloads folder)
4. On device, use file manager to find APK
5. Tap to install
6. Launch app

**Method 3: ADB Install**
```bash
# Download APK from EAS dashboard
cd ~/Downloads

# Install via ADB
adb install rightfit-services-dev.apk

# Launch app
adb shell monkey -p com.rightfitservices.app 1
```

### Step 8: Connect to Development Server

```bash
# On development machine
cd apps/mobile
pnpm start --dev-client

# This opens Metro bundler with QR code
# Scan QR code with dev client app on device
```

### Step 9: Verify Everything Works

**Check 1: WatermelonDB Initialized**
- Look for console logs: "WatermelonDB initialized successfully"
- No errors about missing native modules
- No fallback to online-only mode

**Check 2: App Navigation**
- Navigate to all screens
- No crashes
- Hot reload working

**Check 3: Database Operations**
- Try creating a property
- Check if it saves to local database
- Verify no errors in console

---

## Testing Strategy

### Build Verification Tests

**After build completes:**
- [ ] APK downloads successfully
- [ ] APK file size reasonable (30-50 MB)
- [ ] Build logs show no errors
- [ ] Build time under 25 minutes

### Installation Tests

**After installing on device:**
- [ ] App icon appears on home screen
- [ ] App launches without crash
- [ ] Dev client splash screen appears
- [ ] No immediate errors in logs

### Connection Tests

**After connecting to dev server:**
- [ ] QR code scans successfully
- [ ] Metro bundler connects
- [ ] App loads with latest code
- [ ] Hot reload works (change text, see update)
- [ ] Console logs visible on computer

### WatermelonDB Tests

**After app fully loads:**
- [ ] Check logs: No "Expo Go" warnings
- [ ] Database initializes successfully
- [ ] Can navigate to Properties screen
- [ ] Can navigate to Work Orders screen
- [ ] No errors about missing native modules

### Offline Mode Preparation

**Before full offline testing:**
- [ ] Dev build installed and working
- [ ] Can create work orders
- [ ] Can upload photos
- [ ] All basic functionality works
- [ ] Ready for offline testing (Story 003)

---

## Troubleshooting Guide

### Problem: Build fails with "Unsupported SDK version"

**Solution:**
```bash
# Check Expo SDK compatibility
pnpm list expo

# Ensure it's 52.x
# If not, update:
pnpm add expo@~52.0.0
```

### Problem: "Project ID not found"

**Solution:**
```bash
# Re-run init
eas init --force

# Manually add to app.json:
"extra": {
  "eas": {
    "projectId": "your-project-id"
  }
}
```

### Problem: WatermelonDB plugin error

**Solution:**
```json
// Verify exact plugin name in app.json:
"plugins": [
  "@nozbe/watermelondb/expo-plugin"  // Must be exact
]

// Re-run build
eas build --profile development --platform android --clear-cache
```

### Problem: APK won't install - "Parse Error"

**Solution:**
- Check Android version (need 6.0+)
- Re-download APK (may be corrupted)
- Clear cache and reinstall
- Try installing via ADB

### Problem: Can't connect to Metro bundler

**Solution:**
```bash
# 1. Check devices on same WiFi
# 2. Get computer's local IP
ipconfig  # Windows
ifconfig  # Mac/Linux

# 3. Manually enter URL in dev client:
exp://192.168.1.100:8081

# 4. Check firewall allows port 8081
# 5. Restart Metro bundler
pnpm start --dev-client --clear
```

### Problem: Native modules still not loading

**Solution:**
- Verify using development build (not Expo Go)
- Check build profile is "development" not "production"
- Look for build errors in EAS dashboard
- Try clean build:
```bash
eas build --profile development --platform android --clear-cache
```

### Problem: Build takes >30 minutes

**Solution:**
- First build always slower (caching dependencies)
- Check Expo status page: https://status.expo.dev/
- Wait patiently - subsequent builds faster (5-10 min)
- Can continue working while build runs

---

## Dependencies

- **Blocked By:** Sprint 5 (Offline Mode code must be implemented)
- **Blocks:** Story 003 Offline Mode Testing (cannot test without dev build)
- **Requires:**
  - `expo-dev-client` (will install)
  - `@nozbe/watermelondb` ✅ (already installed)
  - `eas-cli` (will install)
  - Expo account (free tier)
  - Android device (Android 6.0+)

---

## Definition of Done

- [ ] EAS CLI installed and authenticated
- [ ] Project initialized with `eas init`
- [ ] `eas.json` created with build profiles
- [ ] `app.json` updated with plugins and project ID
- [ ] `expo-dev-client` dependency added
- [ ] Configuration files committed to git
- [ ] Android development build completed successfully
- [ ] APK downloaded from EAS dashboard
- [ ] APK installed on physical Android device
- [ ] App launches without crashes
- [ ] Dev client connects to Metro bundler
- [ ] Hot reload working
- [ ] WatermelonDB initializes (no "Expo Go" warnings)
- [ ] Can navigate to all screens
- [ ] No errors in console logs
- [ ] All verification tests pass
- [ ] Documentation updated with build instructions
- [ ] Team can reproduce build process
- [ ] **READY FOR STORY 003: OFFLINE MODE TESTING**

---

## Time Estimates

### Configuration (Computer Work)
- Install EAS CLI: 5 minutes
- Create eas.json: 10 minutes
- Update app.json: 10 minutes
- Install dependencies: 5 minutes
- Commit changes: 5 minutes
- **Subtotal: 35 minutes**

### Build Process (EAS Servers)
- Queue build: 2 minutes
- First build: 15-20 minutes (subsequent: 5-10 min)
- Download APK: 2 minutes
- **Subtotal: 20-25 minutes**

### Device Setup
- Transfer APK: 5 minutes
- Install on device: 5 minutes
- Launch and verify: 10 minutes
- Connect to dev server: 5 minutes
- **Subtotal: 25 minutes**

### Testing & Verification
- Verify WatermelonDB: 10 minutes
- Test navigation: 10 minutes
- Test hot reload: 5 minutes
- Check console logs: 5 minutes
- **Subtotal: 30 minutes**

### **Total Time: 2-2.5 hours** (hands-on: 1.5 hours, waiting: 0.5-1 hour)

**Note:** Can do other work while build runs on Expo servers.

---

## Success Metrics

**Build Success:**
- ✅ Build completes without errors
- ✅ APK file size 30-50 MB
- ✅ Build time < 25 minutes (first build)

**Installation Success:**
- ✅ Installs on device without errors
- ✅ App launches successfully
- ✅ No immediate crashes

**Connection Success:**
- ✅ Connects to dev server within 10 seconds
- ✅ Hot reload responds within 2 seconds
- ✅ Console logs visible in terminal

**WatermelonDB Success:**
- ✅ No "Expo Go" warnings in logs
- ✅ Database initializes without errors
- ✅ Native modules load successfully
- ✅ App fully functional

**Ready for Offline Testing:**
- ✅ All success criteria met
- ✅ Can proceed to Story 003 testing
- ✅ Confident offline mode will work

---

## Next Steps After Completion

Once this story is complete:

1. **Proceed to Story 003: Offline Mode Testing**
   - Follow comprehensive offline testing checklist
   - Test all offline scenarios
   - Verify sync works correctly
   - Fix any bugs discovered

2. **Document Any Issues Found**
   - Log bugs in GitHub Issues
   - Update Story 003 with findings
   - Estimate fix effort

3. **Update Team Knowledge**
   - Document build process
   - Share learnings
   - Update README.md

4. **Consider iOS Build (Optional)**
   - If needed for broader testing
   - Requires Apple Developer account
   - Follow same process for iOS

---

## Resources & Documentation

**Expo EAS Documentation:**
- [EAS Build Introduction](https://docs.expo.dev/build/introduction/)
- [Development Builds](https://docs.expo.dev/develop/development-builds/introduction/)
- [EAS CLI](https://docs.expo.dev/eas/)

**WatermelonDB:**
- [Expo Integration](https://nozbe.github.io/WatermelonDB/Installation.html#expo)
- [WatermelonDB Expo Plugin](https://github.com/Nozbe/WatermelonDB/tree/master/native/expo-plugin)

**Troubleshooting:**
- [Common Build Issues](https://docs.expo.dev/build-reference/troubleshooting/)
- [Android Device Setup](https://docs.expo.dev/get-started/set-up-your-environment/?platform=android&device=physical&mode=development-build)

**Community:**
- [Expo Forums](https://forums.expo.dev/)
- [WatermelonDB Discord](https://discord.gg/watermelondb)

---

**Created:** 2025-10-29
**Last Updated:** 2025-10-29
**Status:** Ready for Implementation
**Estimated Completion:** 2-2.5 hours
