# Mobile Development Setup - Quick Index

**Last Updated:** 2025-10-31

This folder contains all documentation and scripts for mobile app development after STORY-003 migration.

---

## 📚 Documentation Index

### Getting Started
1. **[GETTING_BACK_TO_WORK.md](./GETTING_BACK_TO_WORK.md)** - Start here!
   - Quick restart guide
   - Device setup (USB → WSL2)
   - Start servers
   - Build and deploy to device
   - Common "I forgot" scenarios

2. **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - Daily commands
   - Daily workflow commands
   - Device management
   - Network configuration
   - Port management
   - File locations

### Testing & Development
3. **[API_TESTING_GUIDE.md](./API_TESTING_GUIDE.md)** - NEW! ⭐
   - API health checks
   - Test all endpoints (Properties, Work Orders, Auth)
   - Mobile screen testing scenarios
   - Troubleshooting guide
   - API monitoring

4. **[SEED_TEST_DATA.md](./SEED_TEST_DATA.md)** - NEW! ⭐
   - Seed 5 properties automatically
   - Seed 10 work orders (all statuses/priorities)
   - One-command seeding
   - Cleanup scripts

5. **[OFFLINE_MODE_TESTING_CHECKLIST.md](./OFFLINE_MODE_TESTING_CHECKLIST.md)**
   - Comprehensive offline testing
   - WatermelonDB sync verification
   - Create/update/delete operations offline

### Setup Guides
6. **[ANDROID_DEV_SETUP.md](./ANDROID_DEV_SETUP.md)**
   - Complete Android development setup
   - WSL2 configuration
   - Android SDK installation
   - USB device setup

7. **[ANDROID_BUILD_FIX_SUMMARY.md](./ANDROID_BUILD_FIX_SUMMARY.md)**
   - Common build issues and solutions
   - Gradle troubleshooting
   - Dependency conflicts

---

## 🚀 Quick Start (5 Minutes)

### 1. Start Servers
```bash
# Terminal 1: API
cd ~/projects/RightFit-Services/apps/api
npm run dev

# Terminal 2: Metro
cd ~/projects/RightFit-Services/apps/mobile
npx expo start --port 8082
```

### 2. Seed Test Data (New!)
```bash
cd ~/projects/RightFit-Services/Mobile-DEV-Settup
./seed-all-data.sh

# This creates:
# - 5 Properties (House, Apartment, Studio, Townhouse, Bungalow)
# - 10 Work Orders (all statuses and priorities)
```

### 3. Build & Install
```bash
cd ~/projects/RightFit-Services/apps/mobile/android
./gradlew assembleDebug
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

### 4. Test!
- Open app on device
- Login: `jamesrobins9@gmail.com` / `Password123!`
- View seeded properties and work orders
- Test new UI components (STORY-003 migration)

---

## 📜 Executable Scripts

### Seeding Scripts
```bash
# Seed everything at once
./seed-all-data.sh

# Or seed step by step:
export TOKEN="your_jwt_token"
./seed-properties.sh "$TOKEN"
./seed-work-orders.sh "$TOKEN"
```

All scripts are in this folder and executable (`chmod +x` already applied).

---

## 🔗 Related Documentation

- **Stories:** `~/projects/RightFit-Services/stories/`
- **Project Plan:** `~/projects/RightFit-Services/Project-Plan/`
- **STORY-003 (Mobile Migration):** `~/projects/RightFit-Services/stories/phase-2/STORY-003-mobile-screen-migration.md`

---

## 🎯 What's New (STORY-003 Complete)

### Mobile Screens Migrated ✅
All 10 mobile screens now use custom design system:
- ✅ PropertiesListScreen
- ✅ WorkOrdersListScreen
- ✅ PropertyDetailsScreen
- ✅ CreatePropertyScreen
- ✅ WorkOrderDetailsScreen
- ✅ CreateWorkOrderScreen
- ✅ LoginScreen
- ✅ RegisterScreen
- ✅ ProfileScreen
- ✅ React Native Paper removed

### Design Tokens Applied ✅
- All colors use design tokens (no hardcoded hex colors)
- Consistent spacing from `spacing` tokens
- Typography uses `typography` tokens
- Border radius from `borderRadius` tokens

### API Testing Setup ✅
- Complete API testing guide
- Test data seeding scripts
- Endpoint documentation
- Troubleshooting guide

---

## 📞 Support

**Issue?** Check these in order:
1. [GETTING_BACK_TO_WORK.md](./GETTING_BACK_TO_WORK.md) - Common scenarios
2. [API_TESTING_GUIDE.md](./API_TESTING_GUIDE.md) - API issues
3. [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Daily commands
4. [ANDROID_BUILD_FIX_SUMMARY.md](./ANDROID_BUILD_FIX_SUMMARY.md) - Build issues

---

## 📊 API Status

**Health Check:**
```bash
curl http://localhost:3001/health
# Expected: {"status":"ok","timestamp":"...","environment":"development"}
```

**Test Credentials:**
```
Email: jamesrobins9@gmail.com
Password: Password123!
```

**API Base URL:**
- Local: `http://localhost:3001`
- From Device: `http://192.168.0.17:3001`

---

## 🎉 Ready to Test!

Your environment is now fully set up for testing the migrated mobile app:

1. ✅ Servers running
2. ✅ Test data available
3. ✅ Mobile screens migrated
4. ✅ Design system applied
5. ✅ Offline sync intact

**Next:** Build the app, install on device, and test the new UI!

---

**Created:** 2025-10-31
**Last Updated:** 2025-10-31 (After STORY-003 completion)
