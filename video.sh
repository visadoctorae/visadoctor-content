#!/usr/bin/env bash
# Visa Doctor — story video pipeline.
#
#   bash video.sh scout <story>   → contact-sheet every candidate clip so we can judge
#                                   camera movement and composition before committing to one
#   bash video.sh build <story>   → composite chosen clips under the locked type overlay
#
# Footage: Pexels, free for commercial use, no attribution required, no API key.
# https://www.pexels.com/license/
set -euo pipefail

MODE="${1:-scout}"
STORY="${2:-schengen}"

have_ffmpeg() { command -v ffmpeg >/dev/null 2>&1; }
have_ffmpeg || { sudo apt-get update -qq && sudo apt-get install -y -qq ffmpeg; }

# Pexels serves the best available file from this endpoint with no key and no auth.
fetch() {
  local id="$1" out="$2"
  curl -sL --fail --max-time 180 -o "$out" "https://www.pexels.com/download/video/${id}/" || return 1
  # Reject anything that came back as HTML rather than video
  case "$(file -b --mime-type "$out")" in
    video/*) return 0 ;;
    *) echo "    not a video: $id"; rm -f "$out"; return 1 ;;
  esac
}

# ── scout ──────────────────────────────
# Reads candidates/<story>.txt — one Pexels video id per line, "# " comments ok.
# Emits a 5-panel contact sheet per clip.
if [ "$MODE" = "scout" ]; then
  list="candidates/${STORY}.txt"
  [ -f "$list" ] || { echo "missing $list"; exit 1; }
  outdir="scout/${STORY}"
  mkdir -p "$outdir"

  while IFS= read -r line || [ -n "$line" ]; do
    id="$(echo "$line" | sed 's/#.*//' | tr -d '[:space:]')"
    [ -z "$id" ] && continue
    tmp="$(mktemp /tmp/px_XXXXXX.mp4)"
    echo "  scouting $id"
    if ! fetch "$id" "$tmp"; then rm -f "$tmp"; continue; fi

    ffmpeg -nostdin -y -loglevel error -i "$tmp" \
      -vf "fps=1/2,scale=270:480:force_original_aspect_ratio=increase,crop=270:480,tile=5x1" \
      -frames:v 1 "$outdir/${id}.jpg" 2>/dev/null || echo "    sheet failed $id"
    rm -f "$tmp"
  done < "$list"

  echo "contact sheets → $outdir"
  exit 0
fi

# ── build ──────────────────────────────
# Renders the story frames, then for every frame that names a clip, lays that
# footage under the type overlay. Frames without a clip are held still.
if [ "$MODE" = "build" ]; then
  src="stories/${STORY}.json"
  [ -f "$src" ] || { echo "missing $src"; exit 1; }
  work="out_video/${STORY}"
  rm -rf "$work"; mkdir -p "$work"

  node story.mjs "$src" "$work"

  mapfile -t clips < <(node -e '
    const d=JSON.parse(require("fs").readFileSync(process.argv[1],"utf8"));
    d.frames.forEach(f=>console.log(f.clip||""));
  ' "$src")

  i=0
  for f in "$work"/s_*.png; do
    i=$((i+1))
    n=$(printf '%02d' "$i")
    ov="$work/ov_${n}.png"
    out="$work/v_${n}.mp4"
    id="${clips[$((i-1))]:-}"

    if [ -n "$id" ] && [ -f "$ov" ]; then
      tmp="$(mktemp /tmp/px_XXXXXX.mp4)"
      echo "  frame $n ← clip $id"
      if fetch "$id" "$tmp"; then
        ffmpeg -nostdin -y -loglevel error -i "$tmp" -loop 1 -i "$ov" -filter_complex \
          "[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30,trim=0:5,setpts=PTS-STARTPTS[b];\
           [b][1:v]overlay=0:0:format=auto,format=yuv420p[v]" \
          -map "[v]" -an -t 5 -r 30 -c:v libx264 -preset veryfast -crf 20 \
          -movflags +faststart "$out"
        rm -f "$tmp"
        echo "    → $(basename "$out")"
        continue
      fi
      rm -f "$tmp"
      echo "    fetch failed, holding still"
    fi

    echo "  frame $n — still"
    ffmpeg -nostdin -y -loglevel error -loop 1 -i "$f" -vf "format=yuv420p" -t 5 -r 30 \
      -c:v libx264 -preset veryfast -crf 20 -movflags +faststart "$out"
  done

  # Proof sheets: 5 frames across each finished clip.
  for m in "$work"/v_*.mp4; do
    b=$(basename "$m" .mp4)
    ffmpeg -nostdin -y -loglevel error -i "$m" \
      -vf "fps=1,scale=216:384:force_original_aspect_ratio=increase,crop=216:384,tile=5x1" \
      -frames:v 1 "$work/proof_${b}.jpg" 2>/dev/null || echo "  proof failed $b"
  done

  # One file to review: every frame back to back, 30s. Stream copy, no re-encode.
  list="$(mktemp /tmp/concat_XXXXXX.txt)"
  : > "$list"
  for m in "$work"/v_*.mp4; do printf "file '%s'\n" "$(readlink -f "$m")" >> "$list"; done
  ffmpeg -nostdin -y -loglevel error -f concat -safe 0 -i "$list" -c copy \
    "$work/${STORY}_FULL.mp4" || echo "  concat failed"
  rm -f "$list"

  echo "clips → $work"
  exit 0
fi

echo "usage: bash video.sh {scout|build} <story>"; exit 1
