#!/usr/bin/env bash
# Provenance: converts the adhan source recordings (audio-only ALAC .mov) into
# the mp3 assets committed to the repo. Not part of any build — re-run only if
# the source recordings change.
#
#   res/raw/       → Android notification channel sounds (names must be a-z0-9_)
#   public/audio/  → webview copies used for in-app preview playback
set -euo pipefail

SRC_DIR="${1:-$HOME/Videos}"
APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"
RAW_DIR="$APP_DIR/android/app/src/main/res/raw"
PUBLIC_DIR="$APP_DIR/public/audio"

mkdir -p "$RAW_DIR" "$PUBLIC_DIR"

convert() {
  local src="$1" name="$2"
  ffmpeg -y -i "$src" -vn -c:a libmp3lame -q:a 4 "$RAW_DIR/$name.mp3"
  cp "$RAW_DIR/$name.mp3" "$PUBLIC_DIR/$name.mp3"
}

convert "$SRC_DIR/Adhan_Alafasy.mov" adhan_alafasy
convert "$SRC_DIR/Adhan_Omar_Hisham.mov" adhan_omar_hisham
