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

# ── scout ────────────────────────────────────────────────────────────────────
# Reads candidates/<story>.txt — one Pexels video id per line, "# " comments ok.
# Emits a 5-panel contact sheet per clip. Panels sampled 2s apart, so if the
# framing shifts across panels the camera is moving and the clip is out.
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

    read -r w h dur < <(ffprobe -v error -select_streams v:0 \
      -show_entries stream=width,height -show_entries format=duration \
      -of csv=p=0:s=x "$tmp" | tr 'x' ' ' | tr '\n' ' ')

    ffmpeg -y -loglevel error -i "$tmp" \
      -vf "fps=1/2,scale=270:480:force_original_aspect_ratio=increase,crop=270:480,tile=5x1" \
      -frames:v 1 "$outdir/${id}.jpg" 2>/dev/null || echo "    sheet failed $id"

    printf '%s\t%sx%s\t%ss\n' "$id" "$w" "$h" "${dur%%.*}" >> "$outdir/_index.tsv"
    rm -f "$tmp"
  done < "$list"

  echo "contact sheets → $outdir"
  exit 0
fi

# ── build ────────────────────────────────────────────────────────────────────
# Renders the story frames, then for every frame that names a clip, lays that
# footage under the type overlay. Frames without a clip are held still.
if [ "$MODE" = "build" ]; then
  src="stories/${STORY}.json"
  [ -f "$src" ] || { echo "missing $src"; exit 1; }
  work="out_video/${STORY}"
  rm -rf "$work"; mkdir -p "$work"

  node story.mjs "$src" "$work"

  # clip ids, in frame order, blank line where a frame has no clip
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
        # Cover-crop the footage to 1080x1920, hold 5s, lay the type over it.
        # The overlay already carries the scrim, so text stays legible on any clip.
        ffmpeg -y -loglevel error -i "$tmp" -loop 1 -i "$ov" -filter_complex \
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

    # No clip, or fetch failed: hold the flattened frame.
    echo "  frame $n — still"
    ffmpeg -y -loglevel error -loop 1 -i "$f" -vf "format=yuv420p" -t 5 -r 30 \
      -c:v libx264 -preset veryfast -crf 20 -movflags +faststart "$out"
  done

  echo "clips → $work"
  exit 0
fi

echo "usage: bash video.sh {scout|build} <story>"; exit 1
