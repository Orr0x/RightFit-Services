#!/bin/bash

# Fix Gradle plugin resolution for PNPM monorepo
# Run this after: npx expo prebuild --platform android

set -e

ANDROID_DIR="$(dirname "$0")/../android"

echo "🔧 Fixing Gradle PNPM monorepo plugin resolution..."

# Fix settings.gradle
echo "📝 Patching settings.gradle..."
SETTINGS_FILE="$ANDROID_DIR/settings.gradle"

# Check if already patched
if grep -q "expo-module-gradle-plugin resolution (PNPM monorepo fix)" "$SETTINGS_FILE"; then
    echo "✓ settings.gradle already patched"
else
    # Replace pluginManagement block
    sed -i.bak '/^pluginManagement {/,/^}/c\
pluginManagement {\
    def reactNativeGradlePlugin = new File(["node", "--print", "require.resolve('\''@react-native/gradle-plugin/package.json'\'', { paths: [require.resolve('\''react-native/package.json'\'')] })"].execute(null, rootDir).text.trim()).getParentFile()\
    includeBuild(reactNativeGradlePlugin.toString())\
\
    // Add expo-modules-core for expo-module-gradle-plugin resolution (PNPM monorepo fix)\
    def expoModulesCoreAndroid = new File(["node", "--print", "require.resolve('\''expo-modules-core/package.json'\'')"].execute(null, rootDir).text.trim(), "../android")\
\
    repositories {\
        gradlePluginPortal()\
        google()\
        mavenCentral()\
        maven { url(expoModulesCoreAndroid) }\
    }\
\
    resolutionStrategy {\
        eachPlugin {\
            if (requested.id.id == '\''expo-module-gradle-plugin'\'') {\
                useModule('\''expo.modules:expo-modules-core'\'')\
            }\
        }\
    }\
}' "$SETTINGS_FILE"
    echo "✓ settings.gradle patched"
fi

# Fix build.gradle
echo "📝 Patching build.gradle..."
BUILD_FILE="$ANDROID_DIR/build.gradle"

# Check if already patched
if grep -q "expo-modules-core for PNPM monorepo plugin resolution" "$BUILD_FILE"; then
    echo "✓ build.gradle already patched"
else
    # Add expo-modules-core to buildscript repositories (after mavenCentral())
    sed -i.bak '/buildscript {/,/}/ {
        /mavenCentral()/a\        // Add expo-modules-core for PNPM monorepo plugin resolution\n        maven {\n            url(new File(['\''node'\'', '\''--print'\'', "require.resolve('\''expo-modules-core/package.json'\'')"].execute(null, rootDir).text.trim(), '\''../android'\''))\n        }
    }' "$BUILD_FILE"

    # Add expo-modules-core to allprojects repositories (after jsc-android maven block)
    sed -i.bak '/allprojects {/,/^}/ {
        /jsc-android.*dist/,/}/ {
            /}/a\        maven {\n            // Expo modules core for PNPM monorepo (plugin resolution)\n            url(new File(['\''node'\'', '\''--print'\'', "require.resolve('\''expo-modules-core/package.json'\'')"].execute(null, rootDir).text.trim(), '\''../android'\''))\n        }
        }
    }' "$BUILD_FILE"

    echo "✓ build.gradle patched"
fi

echo "✅ Gradle PNPM fixes applied successfully!"
echo ""
echo "Now run: cd android && ./gradlew assembleDebug"
