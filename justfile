android_home := env_var_or_default("ANDROID_HOME", env_var("HOME") + "/Android/Sdk")
java_home := "/usr/lib/jvm/java-21-openjdk-amd64"

export ANDROID_HOME := android_home
export ANDROID_SDK_ROOT := android_home
export JAVA_HOME := java_home
export PATH := java_home + "/bin:" + android_home + "/platform-tools:" + android_home + "/emulator:" + env_var("PATH")

gradle_file := "apps/mobile/android/app/build.gradle"

default:
    @just --list

# Increment versionCode by 1 and versionName's minor by 0.1 (e.g. 2/"1.1" -> 3/"1.2")
_bump-version:
    #!/usr/bin/env bash
    set -euo pipefail
    code=$(grep -oP 'versionCode \K\d+' {{gradle_file}})
    name=$(grep -oP 'versionName "\K[^"]+' {{gradle_file}})
    new_code=$((code + 1))
    major="${name%.*}"
    minor="${name#*.}"
    new_name="$major.$((minor + 1))"
    sed -i "s/versionCode $code/versionCode $new_code/" {{gradle_file}}
    sed -i "s/versionName \"$name\"/versionName \"$new_name\"/" {{gradle_file}}
    echo "Bumped versionCode $code -> $new_code, versionName $name -> $new_name"

# Build the Play Store release bundle (Next export -> cap sync -> gradlew bundleRelease). Pass --bump to increment versionCode/versionName first.
android-release bump="":
    #!/usr/bin/env bash
    set -euo pipefail
    if [ -n "{{bump}}" ]; then just _bump-version; fi
    pnpm --filter mobile build
    (cd apps/mobile && npx cap sync android)
    (cd apps/mobile/android && ./gradlew bundleRelease --no-daemon)
    echo "AAB: apps/mobile/android/app/build/outputs/bundle/release/app-release.aab"

# Build a signed release APK for sideloading/testing outside the Play Store. Pass --bump to increment versionCode/versionName first.
android-release-apk bump="":
    #!/usr/bin/env bash
    set -euo pipefail
    if [ -n "{{bump}}" ]; then just _bump-version; fi
    pnpm --filter mobile build
    (cd apps/mobile && npx cap sync android)
    (cd apps/mobile/android && ./gradlew assembleRelease --no-daemon)
    echo "APK: apps/mobile/android/app/build/outputs/apk/release/app-release.apk"

# Build a debug APK and install + launch it on the connected device/emulator
android-debug:
    pnpm --filter mobile build
    cd apps/mobile && npx cap sync android
    cd apps/mobile/android && ./gradlew assembleDebug --no-daemon
    adb install -r apps/mobile/android/app/build/outputs/apk/debug/app-debug.apk
    adb shell am start -n com.wikisubmission.app/.MainActivity
