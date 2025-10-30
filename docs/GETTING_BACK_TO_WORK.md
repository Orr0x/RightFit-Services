# Getting Back to Work - Quick Restart Guide

## "I haven't touched this in weeks, help!"

### 1. Device Setup (Windows → WSL2 → Android)

```powershell
# In PowerShell (Admin) - Connect your phone via USB
usbipd list
usbipd attach --wsl --busid 1-4
```

```bash
# In WSL2 - Verify device
adb devices
# Should show: RZCY51TJKKW	device
```

**If device not showing:** Unplug USB, run `usbipd detach --busid 1-4`, plug back in, run attach again.

### 2. Start Everything

```bash
# Terminal 1: API Server
cd ~/projects/RightFit-Services/apps/api
pnpm dev

# Terminal 2: Metro Bundler
cd ~/projects/RightFit-Services/apps/mobile
npx expo start --port 8082
```

**Check network hasn't changed:**
```bash
ip addr show eth0 | grep "inet "
# If IP changed from 192.168.0.17, update apps/mobile/src/services/api/client.ts
```

### 3. Build & Install App

```bash
cd ~/projects/RightFit-Services/apps/mobile/android
./gradlew assembleDebug
adb -s RZCY51TJKKW install -r app/build/outputs/apk/debug/app-debug.apk
```

### 4. You're Ready!

- API: http://localhost:3001
- Web: http://localhost:3000 (if needed: `cd apps/web && pnpm dev`)
- Mobile: Opens automatically on device
- Prisma Studio: `cd packages/database && pnpx prisma studio`

---

## Common "I forgot" Scenarios

### "What's my login?"
```
Email: jamesrobins9@gmail.com
Password: Password123!
```

### "Device disappeared"
```powershell
# Windows PowerShell (Admin)
usbipd detach --busid 1-4
usbipd attach --wsl --busid 1-4
```

```bash
# WSL2
adb kill-server && adb start-server && adb devices
```

### "Metro won't start - port in use"
```bash
npx kill-port 8082
```

### "Build failing randomly"
```bash
cd ~/projects/RightFit-Services/apps/mobile
rm -rf node_modules/.cache android/.gradle android/app/build
cd android && ./gradlew clean && cd ..
./gradlew assembleDebug
```

### "API can't connect from phone"
1. Check WSL IP: `ip addr show eth0 | grep "inet "`
2. Should be: `192.168.0.17`
3. If changed, update: `apps/mobile/src/services/api/client.ts`

### "Where is the APK?"
```
apps/mobile/android/app/build/outputs/apk/debug/app-debug.apk
```

### "How do I view phone logs?"
```bash
adb logcat -s ReactNativeJS:V
```

### "Clear app data (reset)"
```bash
adb shell pm clear com.mobile.rightfitservices
```

---

## Environment Check

Run this to verify everything is set up:

```bash
# Check versions
node --version      # Should be v20.x.x
java -version       # Should be openjdk 17.x.x
adb --version       # Should show Android Debug Bridge

# Check environment variables
echo $ANDROID_HOME  # Should be: /home/<user>/Android/Sdk
echo $JAVA_HOME     # Should be: /usr/lib/jvm/java-17-openjdk-amd64

# Check device
adb devices         # Should show your device serial

# Check IP
ip addr show eth0 | grep "inet "  # Should be 192.168.0.17
```

---

## File Locations Cheat Sheet

| Need to... | Go here |
|------------|---------|
| Change API URL | `apps/mobile/src/services/api/client.ts` |
| View APK | `apps/mobile/android/app/build/outputs/apk/debug/` |
| Edit Prisma schema | `packages/database/prisma/schema.prisma` |
| Check API logs | `apps/api/logs/` |
| View environment vars | `apps/api/.env` |

---

## Full Guides (When You Have Time)

- **Complete setup from scratch:** [ANDROID_DEV_SETUP.md](ANDROID_DEV_SETUP.md)
- **Daily commands:** [QUICK_REFERENCE.md](QUICK_REFERENCE.md)
- **Developer onboarding:** [../HANDOVER.md](../HANDOVER.md)
- **Current sprint status:** [../SPRINT_STATUS.md](../SPRINT_STATUS.md)

---

## One-Liner Aliases (Add to ~/.bashrc)

```bash
# Quick build + install
alias rfbuild='cd ~/projects/RightFit-Services/apps/mobile/android && ./gradlew assembleDebug && adb -s RZCY51TJKKW install -r app/build/outputs/apk/debug/app-debug.apk'

# Connect device
alias rfdevice='adb kill-server && adb start-server && adb devices'

# View logs
alias rflogs='adb logcat -s ReactNativeJS:V'

# Clear app
alias rfclear='adb shell pm clear com.mobile.rightfitservices'
```

Then just type: `rfbuild` 🚀

---

**TL;DR:**
1. Attach USB device (PowerShell: `usbipd attach --wsl --busid 1-4`)
2. Start API (`cd apps/api && pnpm dev`)
3. Start Metro (`cd apps/mobile && npx expo start --port 8082`)
4. Build + Install (`cd android && ./gradlew assembleDebug && adb install ...`)
5. Done ✅
