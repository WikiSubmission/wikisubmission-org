# Running the mobile app on Android

Quick runbook for building the static export, putting it in the Capacitor
Android project, and launching it on the emulator.

## One-time per shell: environment

The system `java` (Java 17) is JRE-only on this machine (no `javac`), so Gradle
must use JDK 21. Export these before any `gradlew`/`cap` command:

```bash
export ANDROID_HOME="$HOME/Android/Sdk"
export ANDROID_SDK_ROOT="$HOME/Android/Sdk"
export JAVA_HOME="/usr/lib/jvm/java-21-openjdk-amd64"
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH"
```

(Add them to `~/.bashrc` to skip this each time.)

## 1. Boot the emulator

```bash
# List available AVDs
emulator -list-avds

# Boot with hardware GPU (NOT swiftshader — software GPU causes system ANRs).
# Runs detached; setsid keeps it alive after the shell returns.
setsid emulator -avd Medium_Phone_API_36.0 -gpu auto -no-snapshot-load >/tmp/emulator.log 2>&1 < /dev/null &

# Wait until it finishes booting
adb wait-for-device
until [ "$(adb shell getprop sys.boot_completed 2>/dev/null | tr -d '\r')" = "1" ]; do sleep 2; done
adb devices
```

Or just launch the AVD from Android Studio's Device Manager (handles GPU, often
smoother).

## 2. Build the web export and sync into the native project

```bash
# From the repo root
pnpm --filter mobile build          # Next static export -> apps/mobile/out/

cd apps/mobile
npx cap sync android                 # copy out/ into android/ + update plugins
```

## 3. Build the APK and install it

```bash
cd apps/mobile/android
./gradlew assembleDebug --no-daemon  # -> app/build/outputs/apk/debug/app-debug.apk

adb install -r app/build/outputs/apk/debug/app-debug.apk
adb shell am start -n com.wikisubmission.app/.MainActivity
```

## One-liner (after the env is exported and the emulator is up)

```bash
pnpm --filter mobile build \
  && (cd apps/mobile && npx cap sync android) \
  && (cd apps/mobile/android && ./gradlew assembleDebug --no-daemon) \
  && adb install -r apps/mobile/android/app/build/outputs/apk/debug/app-debug.apk \
  && adb shell am start -n com.wikisubmission.app/.MainActivity
```

## Useful checks

```bash
adb exec-out screencap -p > /tmp/shot.png   # screenshot the device
adb logcat -d | grep -iE "Capacitor|chromium.*ERROR"   # webview errors
adb shell am force-stop com.wikisubmission.app          # kill the app
```

## Notes

- `appId` is `com.wikisubmission.app` (set in `capacitor.config.ts`).
- A one-off "Waited 5000ms for FocusEvent" ANR on cold start is an emulator
  webview focus-timeout artifact, not an app bug. Dismiss with Wait.
- iOS builds need macOS + Xcode and cannot be done on this Linux machine.
- `apps/mobile/android/local.properties` (the `sdk.dir` pointer) is gitignored;
  `cap add android` or Android Studio regenerates it. If missing:
  `echo "sdk.dir=$HOME/Android/Sdk" > apps/mobile/android/local.properties`
