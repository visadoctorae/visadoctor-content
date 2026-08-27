#!/usr/bin/env bash
# Turn rendered story frames into 5s 1080x1920 clips.
# Photo frames: the photograph drifts, the type and footer stay locked.
# Flat frames: held still.
set -euo pipefail
DIR="$1"
for f in "$DIR"/s_*.png; do
  n=$(basename "$f" .png | sed 's/^s_//')
  bg="$DIR/bg_$n.png"
  ov="$DIR/ov_$n.png"
  out="$DIR/v_$n.mp4"
  if [ -f "$bg" ] && [ -f "$ov" ]; then
    ffmpeg -y -loglevel error -loop 1 -i "$bg" -loop 1 -i "$ov" -filter_complex \
      "[0:v]scale=3240:5760,zoompan=z='min(zoom+0.00045,1.12)':d=150:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1080x1920:fps=30[b];[b][1:v]overlay=0:0,format=yuv420p" \
      -t 5 -r 30 -c:v libx264 -preset veryfast -crf 20 -movflags +faststart "$out"
  else
    ffmpeg -y -loglevel error -loop 1 -i "$f" -vf "format=yuv420p" -t 5 -r 30 \
      -c:v libx264 -preset veryfast -crf 20 -movflags +faststart "$out"
  fi
  echo "  -> $(basename "$out")"
done
