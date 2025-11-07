# Android Development Environment Setup (WSL2)

## Overview

This guide covers setting up a complete Android development environment for RightFit Services mobile app using Windows Subsystem for Linux 2 (WSL2). This setup allows you to build and test Android apps locally without relying on Expo's cloud build service.

**Note:** iOS builds still require Expo Application Services (EAS) cloud builds. This guide is specifically for Android development.

## Prerequisites

- Windows 10/11 with WSL2 enabled
- Physical Android device with USB debugging enabled (or Android emulator)
- At least 20GB free disk space

## 1. WSL2 Setup

### Install WSL2 with Ubuntu

```bash
# In Windows PowerShell (Admin)
wsl --install -d Ubuntu
```

### Configure WSL2

1. Open Ubuntu terminal
2. Update package lists:
```bash
sudo apt update && sudo apt upgrade -y
```

## 2. Install Development Tools

### Install Node.js and npm

```bash
# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version
```

### Install pnpm (Project Package Manager)

```bash
npm install -g pnpm
pnpm --version
```

### Install Java Development Kit (JDK 17)

```bash
sudo apt install -y openjdk-17-jdk

# Verify installation
java -version  # Should show openjdk version "17.x.x"
```

### Set JAVA_HOME Environment Variable

Add to `~/.bashrc`:

```bash
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export PATH=$JAVA_HOME/bin:$PATH
```

Apply changes:
```bash
source ~/.bashrc
```

## 3. Install Android SDK

### Download Android Command Line Tools

```bash
# Create Android SDK directory
mkdir -p ~/Android/Sdk
cd ~/Android/Sdk

# Download command line tools (check for latest version at developer.android.com)
wget https://dl.google.com/android/repository/commandlinetools-linux-9477386_latest.zip

# Extract to cmdline-tools directory
unzip commandlinetools-linux-9477386_latest.zip
mkdir -p cmdline-tools/latest
mv cmdline-tools/* cmdline-tools/latest/ 2>/dev/null || true
```

### Set Android Environment Variables

Add to `~/.bashrc`:

```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$ANDROID_HOME/cmdline-tools/latest/bin:$PATH
export PATH=$ANDROID_HOME/platform-tools:$PATH
export PATH=$ANDROID_HOME/emulator:$PATH
```

Apply changes:
```bash
source ~/.bashrc
```

### Install Required Android SDK Packages

```bash
# Accept licenses
sdkmanager --licenses

# Install required packages
sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0"
sdkmanager "ndk;25.1.8937393"
```

### Install ADB (Android Debug Bridge)

```bash
sudo apt install -y android-tools-adb android-tools-fastboot

# Verify installation
adb --version
```

## 4. Connect Physical Android Device

### Enable USB Debugging on Android Device

1. Go to **Settings** > **About Phone**
2. Tap **Build Number** 7 times to enable Developer Options
3. Go to **Settings** > **Developer Options**
4. Enable **USB Debugging**
5. Enable **Install via USB** (if available)

### Configure USB Device Access in WSL2

WSL2 doesn't have direct USB access. Use **usbipd** to bridge USB devices:

#### On Windows (PowerShell as Admin):

```powershell
# Install usbipd-win
winget install usbipd

# List USB devices
usbipd list

# Find your Android device (e.g., Bus ID 1-4)
# Bind the device
usbipd bind --busid 1-4

# Attach to WSL
usbipd attach --wsl --busid 1-4
```

#### In WSL2:

```bash
# Verify device is connected
lsusb

# Start adb server
adb kill-server
adb start-server

# List connected devices
adb devices
# Should show: RZCY51TJKKW	device (or your device serial)
```

### Troubleshooting Device Connection

If device shows as "unauthorized":
1. Disconnect and reconnect USB cable
2. Accept "Allow USB Debugging" prompt on phone
3. Run `adb devices` again

## 5. Project Setup

### Clone Repository

```bash
cd ~/projects
git clone <repository-url>
cd RightFit-Services
```

### Install Dependencies

```bash
# Install root dependencies
pnpm install

# Install mobile app dependencies
cd apps/mobile
pnpm install
```

### Configure Network Access

WSL2 uses a virtual network adapter. Get your WSL IP:

```bash
ip addr show eth0 | grep "inet " | awk '{print $2}' | cut -d/ -f1
# Example output: 192.168.0.17
```

Update API base URL in mobile app to use WSL IP:

**File:** `apps/mobile/src/services/api/client.ts`
```typescript
const API_BASE_URL = 'http://192.168.0.17:3001'
```

## 6. Building Android APK Locally

### Development Build

```bash
cd ~/projects/RightFit-Services/apps/mobile

# Clean build (if needed)
cd android && ./gradlew clean && cd ..

# Build debug APK
cd android && ./gradlew assembleDebug
```

The APK will be generated at:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

### Install APK on Device

```bash
# Ensure device is connected
adb devices

# Install APK
adb -s <DEVICE_SERIAL> install -r android/app/build/outputs/apk/debug/app-debug.apk

# Example:
# adb -s RZCY51TJKKW install -r android/app/build/outputs/apk/debug/app-debug.apk
```

### Monitor Installation

```bash
# View installation logs
adb logcat -s PackageManager
```

## 7. Running Development Server

### Start Backend API

In one terminal:
```bash
cd ~/projects/RightFit-Services/apps/api
pnpm dev
# API runs on http://localhost:3001
```

### Start Metro Bundler

In another terminal:
```bash
cd ~/projects/RightFit-Services/apps/mobile
npx expo start --port 8082
```

The app will connect to Metro at: `exp://<WSL_IP>:8082`

### Hot Reload

With Metro running, code changes will automatically reload on the device.

## 8. Common Development Workflows

### Build and Install Updated APK

```bash
cd ~/projects/RightFit-Services/apps/mobile/android
./gradlew assembleDebug && adb -s RZCY51TJKKW install -r app/build/outputs/apk/debug/app-debug.apk
```

### View Device Logs

```bash
# All logs
adb logcat

# Filter React Native logs
adb logcat *:S ReactNative:V ReactNativeJS:V

# Filter specific tag
adb logcat -s "[SYNC]"
```

### Clear App Data (Reset)

```bash
adb shell pm clear com.mobile.rightfitservices
```

### Uninstall App

```bash
adb uninstall com.mobile.rightfitservices
```

## 9. Troubleshooting

### Gradle Build Fails

**Error:** `JAVA_HOME is not set`

**Solution:**
```bash
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
```

### Device Not Detected

**Error:** `adb devices` shows empty list

**Solution:**
```bash
# On Windows PowerShell (Admin)
usbipd detach --busid 1-4
usbipd attach --wsl --busid 1-4

# In WSL2
adb kill-server
adb start-server
adb devices
```

### Network Connection Failed

**Error:** App can't connect to API

**Solution:**
1. Get WSL IP: `ip addr show eth0 | grep "inet "`
2. Update API base URL in app
3. Ensure API server is running: `curl http://localhost:3001/api/health`
4. Check Windows Firewall allows WSL connections

### Metro Bundler Won't Start

**Error:** `Port 8082 already in use`

**Solution:**
```bash
# Kill existing Metro process
npx kill-port 8082

# Or find and kill process
lsof -i :8082
kill -9 <PID>
```

### Build Cache Issues

**Error:** Inconsistent build results

**Solution:**
```bash
cd ~/projects/RightFit-Services/apps/mobile

# Clear all caches
rm -rf node_modules/.cache
rm -rf android/.gradle
rm -rf android/app/build

# Clean Gradle
cd android && ./gradlew clean

# Reinstall dependencies
pnpm install

# Rebuild
./gradlew assembleDebug
```

## 10. Performance Optimization

### Speed Up Gradle Builds

**File:** `android/gradle.properties`
```properties
org.gradle.daemon=true
org.gradle.parallel=true
org.gradle.configureondemand=true
org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=512m -XX:+HeapDumpOnOutOfMemoryError
```

### Enable Gradle Build Cache

```bash
mkdir -p ~/.gradle
echo "org.gradle.caching=true" >> ~/.gradle/gradle.properties
```

## 11. iOS Development (Cloud Build Only)

iOS builds **cannot** be done locally on Windows/WSL2. Use Expo Application Services:

```bash
cd ~/projects/RightFit-Services/apps/mobile

# Configure EAS
npx eas-cli login
npx eas build:configure

# Build iOS (cloud)
npx eas build --platform ios --profile development
```

## 12. Environment Variables

Create `.env` file in `apps/mobile/`:

```env
EXPO_PUBLIC_API_URL=http://192.168.0.17:3001
EXPO_PUBLIC_ENV=development
```

## 13. Recommended VS Code Extensions (WSL)

- **WSL** - Microsoft
- **React Native Tools** - Microsoft
- **Expo Tools** - Expo
- **ESLint** - Microsoft
- **Prettier** - Prettier

## 14. Additional Resources

- [React Native Documentation](https://reactnative.dev/docs/environment-setup)
- [Expo Documentation](https://docs.expo.dev/)
- [Android Developer Docs](https://developer.android.com/studio/build/building-cmdline)
- [WSL Documentation](https://learn.microsoft.com/en-us/windows/wsl/)

## Summary

You now have a complete local Android development environment running on WSL2. This setup allows you to:

- Build Android APKs locally without cloud services
- Test on physical devices with hot reload
- Debug with full access to device logs
- Iterate quickly without internet dependency

For iOS development, continue using Expo's cloud build service (EAS).
