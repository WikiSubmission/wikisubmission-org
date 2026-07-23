android_home := env_var_or_default("ANDROID_HOME", env_var("HOME") + "/Android/Sdk")
java_home := "/usr/lib/jvm/java-21-openjdk-amd64"

export ANDROID_HOME := android_home
export ANDROID_SDK_ROOT := android_home
export JAVA_HOME := java_home
export PATH := java_home + "/bin:" + android_home + "/platform-tools:" + android_home + "/emulator:" + env_var("PATH")

gradle_file := "apps/mobile/android/app/build.gradle"

# Installed package name (applicationId) and the fully-qualified launch
# component. The Java namespace (org.wikisubmission.app) differs from the
# applicationId (com.wikisubmission.app), so the activity must be spelled out
# in full — the `.MainActivity` shorthand would resolve against the wrong package.
app_id := "com.wikisubmission.app"
launch_activity := app_id + "/org.wikisubmission.app.MainActivity"

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

# Compile the web export, sync it into the native project, build a debug APK, then install + launch it on the phone connected over adb. Inspect the WebView live at chrome://inspect.
android-debug:
    #!/usr/bin/env bash
    set -euo pipefail
    # Pick the first authorized device; pin every adb call to it so a phone
    # reachable over both USB/TCP and wireless-debugging doesn't trip
    # "more than one device/emulator".
    serial="$(adb devices | awk 'NR>1 && $2=="device"{print $1; exit}')"
    if [ -z "$serial" ]; then
      echo "No authorized device over adb. Connect your phone first:" >&2
      echo "  1. Phone: Settings > Developer options > enable USB debugging." >&2
      echo "  2. Plug in over USB and accept the 'Allow USB debugging?' prompt." >&2
      echo "  3. Verify with:  just android-devices" >&2
      echo "     (wireless instead:  just android-connect <ip>:<port>)" >&2
      exit 1
    fi
    # 1. Next static export -> apps/mobile/out
    pnpm --filter mobile build
    # 2. Copy the export + plugins into the native Android project
    (cd apps/mobile && npx cap sync android)
    # 3. Build the debug APK (Android Studio uses this same Gradle task under the hood)
    (cd apps/mobile/android && ./gradlew assembleDebug --no-daemon)
    # 4. Install + launch over the debug bridge
    adb -s "$serial" install -r apps/mobile/android/app/build/outputs/apk/debug/app-debug.apk
    adb -s "$serial" shell am start -n {{launch_activity}}
    echo ""
    echo "Launched {{app_id}} on device. Next:"
    echo "  - Debug the WebView (JS console, DOM, network) at chrome://inspect in Chrome."
    echo "  - Tail native + JS logs with:  just android-logcat"

# List devices/emulators adb can see. A phone shown as 'unauthorized' just needs the USB-debugging prompt accepted on-device.
android-devices:
    adb start-server
    adb devices -l

# Connect a phone over Wi-Fi using an explicit <ip>:<port> read from the phone's Wireless debugging screen (run `adb pair <ip>:<pairport>` first if it asks to pair).
android-connect addr:
    adb connect {{addr}}

# Switch a USB-connected phone to wireless adb automatically: reads the phone's Wi-Fi IP, restarts adb on port 5555, and connects — no need to read the IP/port off the phone. Plug in over USB first; afterwards you can unplug.
android-wifi:
    #!/usr/bin/env bash
    set -euo pipefail
    if [ "$(adb devices | awk 'NR>1 && $2=="device"' | wc -l)" -eq 0 ]; then
      echo "Plug the phone in over USB first (and accept the USB-debugging prompt)." >&2
      exit 1
    fi
    ip="$(adb shell ip route get 1.1.1.1 2>/dev/null | grep -oE 'src [0-9.]+' | awk '{print $2}')"
    if [ -z "$ip" ]; then
      echo "Could not read the phone's Wi-Fi IP — make sure it is on Wi-Fi (same network as this machine)." >&2
      exit 1
    fi
    adb tcpip 5555
    sleep 1
    adb connect "$ip:5555"
    echo "Connected to $ip:5555 — you can unplug USB now. Deploy with: just android-debug"

# Stream the running app's logs (JS console + native) from the phone.
android-logcat:
    #!/usr/bin/env bash
    set -euo pipefail
    pid="$(adb shell pidof -s {{app_id}} || true)"
    if [ -z "$pid" ]; then
      echo "{{app_id}} is not running — launch it first (just android-debug)." >&2
      exit 1
    fi
    adb logcat --pid="$pid"

# Open the native Android project in Android Studio (for GUI build/run, signing, or the device manager). Not required for `android-debug`.
android-studio:
    cd apps/mobile && npx cap open android
