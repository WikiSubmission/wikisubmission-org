# Running the mobile app on Android

Quick runbook for building the static export, putting it in the Capacitor
Android project, and launching it on the emulator.

## Which machine

Play Store releases are cut on the **Windows** machine. The Linux box is still
fine for emulator work and debug builds. Gradle needs **JDK 21**: AGP 8.13 with
Gradle 8.14.3 does not support anything newer, so Android Studio's bundled JBR
(currently JDK 25) will not drive a build.

### Windows (release machine)

```powershell
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-21.0.12.101-hotspot"   # not Android Studio's jbr
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:PATH = "$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:PATH"
```

JAVA_HOME, ANDROID_HOME, ANDROID_SDK_ROOT and the four signing variables are
all set as persistent user environment variables here, so a fresh shell already
has them; the export block above is only needed if you clear them. The JDK is
Temurin 21 (`javac 21.0.12.1`), installed via winget. `android/local.properties`
points at `C:/Users/hiche/AppData/Local/Android/Sdk`.

### Linux (emulator / debug)

The system `java` (Java 17) is JRE-only there (no `javac`), so export these
before any `gradlew`/`cap` command:

```bash
export ANDROID_HOME="$HOME/Android/Sdk"
export ANDROID_SDK_ROOT="$HOME/Android/Sdk"
export JAVA_HOME="/usr/lib/jvm/java-21-openjdk-amd64"
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH"
```

(Add them to `~/.bashrc` to skip this each time.) Signing variables there live in
`~/.config/ws-android-signing.env`, sourced from `~/.bashrc`.

## Release signing (only for `assembleRelease` / `bundleRelease`)

The upload key lives outside the repo and is read from the environment, so
nothing secret is committed. Debug builds need none of this.

```bash
export KEYSTORE_PATH="$HOME/ws-upload.keystore"   # Linux box; Windows uses ~/.secrets/
export KEYSTORE_PASSWORD="..."      # store password
export KEY_ALIAS="upload"           # optional, this is the default
export KEY_PASSWORD="..."           # optional, defaults to KEYSTORE_PASSWORD
```

On the Windows release machine these are already set persistently (user scope),
so a fresh shell has them. To check without printing the passwords:

```powershell
[Environment]::GetEnvironmentVariable('KEYSTORE_PATH','User')
```

A release task started without `KEYSTORE_PATH`/`KEYSTORE_PASSWORD`, or pointing
at a missing file, fails immediately rather than producing an unsigned bundle
that Play would reject on upload.

Keystore facts, for identifying the right file:

- Alias `upload`, RSA 2048, valid 2026-07-05 to 2056-06-27
- SHA-256 `0D:D4:0B:84:4B:85:7F:BC:D2:F9:4A:7F:10:4B:BD:01:DC:68:42:CB:CF:A0:6C:86:0A:C5:25:DD:3A:25:4F:8E`

Verify a copy with:

```bash
keytool -list -v -keystore "$KEYSTORE_PATH" -alias upload
```

This is the **upload** key only. Play App Signing holds the actual app signing
key; its (different) SHA-256 is the one that belongs in
`apps/web/public/.well-known/assetlinks.json`. The debug key
(`~/.android/debug.keystore`) is generated per machine and is never used for Play,
so there is nothing to copy between machines except the upload keystore.

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
