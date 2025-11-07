# Quick Reference - Android Development

## Daily Workflow Commands

### Start Development Environment

```bash
# Terminal 1: Start API server
cd ~/projects/RightFit-Services/apps/api
pnpm dev

# Terminal 2: Start Metro bundler
cd ~/projects/RightFit-Services/apps/mobile
npx expo start --port 8082
```

### Build & Deploy to Device

```bash
# One-liner: Build + Install
cd ~/projects/RightFit-Services/apps/mobile/android && \
./gradlew assembleDebug && \
adb -s RZCY51TJKKW install -r app/build/outputs/apk/debug/app-debug.apk
```

### Device Management

```bash
# Check connected devices
adb devices

# Clear app data (reset app)
adb shell pm clear com.mobile.rightfitservices

# Uninstall app
adb uninstall com.mobile.rightfitservices

# View live logs
adb logcat -s ReactNativeJS:V
```

### Network Configuration

```bash
# Get WSL IP (update in api/client.ts if changed)
ip addr show eth0 | grep "inet " | awk '{print $2}' | cut -d/ -f1
```

### Windows USB Device Attachment

```powershell
# In PowerShell (Admin) - when device disconnects
usbipd list
usbipd detach --busid 1-4
usbipd attach --wsl --busid 1-4
```

### Clean Build

```bash
cd ~/projects/RightFit-Services/apps/mobile

# Nuclear option - clean everything
rm -rf node_modules/.cache
rm -rf android/.gradle
rm -rf android/app/build
cd android && ./gradlew clean && cd ..

# Rebuild
pnpm install
cd android && ./gradlew assembleDebug
```

### Port Management

```bash
# Kill process on specific port
npx kill-port 8082

# Find what's using a port
lsof -i :8082
```

## File Locations

| What | Path |
|------|------|
| APK Output | `apps/mobile/android/app/build/outputs/apk/debug/app-debug.apk` |
| API Client Config | `apps/mobile/src/services/api/client.ts` |
| Gradle Config | `apps/mobile/android/gradle.properties` |
| Android SDK | `~/Android/Sdk` |
| Java Home | `/usr/lib/jvm/java-17-openjdk-amd64` |

## Environment Variables

```bash
# Check if set correctly
echo $ANDROID_HOME  # Should be: /home/<user>/Android/Sdk
echo $JAVA_HOME     # Should be: /usr/lib/jvm/java-17-openjdk-amd64
echo $PATH          # Should include both
```

## Common Issues & Quick Fixes

| Problem | Quick Fix |
|---------|-----------|
| Device not detected | `usbipd detach --busid 1-4 && usbipd attach --wsl --busid 1-4` (Windows PS) |
| Port already in use | `npx kill-port 8082` |
| Build fails | `cd android && ./gradlew clean` |
| API unreachable | Check WSL IP hasn't changed: `ip addr show eth0` |
| Gradle daemon issues | `cd android && ./gradlew --stop` |

## Network Info

- **API URL (WSL):** `http://192.168.0.17:3001`
- **Metro Bundler:** `exp://192.168.0.17:8082`
- **Device Serial:** `RZCY51TJKKW`

## Useful Shortcuts

```bash
# Alias for quick build + install (add to ~/.bashrc)
alias rfbuild='cd ~/projects/RightFit-Services/apps/mobile/android && ./gradlew assembleDebug && adb -s RZCY51TJKKW install -r app/build/outputs/apk/debug/app-debug.apk'

# Alias for quick dev setup
alias rfdev='cd ~/projects/RightFit-Services && tmux new-session -d "cd apps/api && pnpm dev" \; split-window "cd apps/mobile && npx expo start --port 8082" \; attach'
```

## Git Workflow

```bash
# Before making changes
git checkout main
git pull origin main
git checkout -b feature/your-feature-name

# After making changes
git add .
git commit -m "Description of changes"
git push origin feature/your-feature-name
```

## Database Reset

```bash
# Reset mobile app database
adb shell pm clear com.mobile.rightfitservices

# Reset API database (if needed)
cd ~/projects/RightFit-Services/apps/api
pnpm prisma migrate reset
```
