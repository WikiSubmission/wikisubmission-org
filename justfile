android_home := env_var_or_default("ANDROID_HOME", env_var("HOME") + "/Android/Sdk")
java_home := "/usr/lib/jvm/java-21-openjdk-amd64"

export ANDROID_HOME := android_home
export ANDROID_SDK_ROOT := android_home
export JAVA_HOME := java_home
export PATH := java_home + "/bin:" + android_home + "/platform-tools:" + android_home + "/emulator:" + env_var("PATH")

default:
    @just --list

# Build the Play Store release bundle (Next export -> cap sync -> gradlew bundleRelease)
android-release:
    pnpm --filter mobile build
    cd apps/mobile && npx cap sync android
    cd apps/mobile/android && ./gradlew bundleRelease --no-daemon
    @echo "AAB: apps/mobile/android/app/build/outputs/bundle/release/app-release.aab"

# Build a signed release APK for sideloading/testing outside the Play Store
android-release-apk:
    pnpm --filter mobile build
    cd apps/mobile && npx cap sync android
    cd apps/mobile/android && ./gradlew assembleRelease --no-daemon
    @echo "APK: apps/mobile/android/app/build/outputs/apk/release/app-release.apk"

# Build a debug APK and install + launch it on the connected device/emulator
android-debug:
    pnpm --filter mobile build
    cd apps/mobile && npx cap sync android
    cd apps/mobile/android && ./gradlew assembleDebug --no-daemon
    adb install -r apps/mobile/android/app/build/outputs/apk/debug/app-debug.apk
    adb shell am start -n com.wikisubmission.app/.MainActivity
