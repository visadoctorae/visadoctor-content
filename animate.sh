#!/usr/bin/env bash
# Build 5s 1080x1920 story clips.
#  - If src_NN.txt exists: download that stock clip, fill the frame, overlay the static type layer.
#  - Else if bg_NN.png exists: slow push-in on the still, type locked.
#  - Else: hold the flat frame.
# Always writes p_NN.jpg (a poster frame) so the result can be reviewed.
set -euo pipefail
DIR="$1"
for f in "$DIR"/s_*.png; do
  n=$(basename "$f" .png | sed 's/^s_//')
  ov="$DIR/ov_$n.png"
  bg="$DIR/bg_$n.png"
  src="$DIR/src_$n.txt"
  out="$DIR/v_$n.mp4"
  if [ -f "$src" ] && [ -f "$ov" ]; then
    url=$(cat "$src")
    tmp="$DIR/raw_$n.mp4"
    curl -sSL --max-time 240 -o "$tmp" "$url"
    ffmpeg -y -loglevel error -ss 0 -t 5 -i "$tmp" -i "$ov" -filter_complex \
      "[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30,setsar=1[b];[b][1:v]overlay=0:0,format=yuv420p" \
      -an -c:v libx264 -preset veryfast -crf 21 -movflags +faststart "$out"
    rm -f "$tmp"
  elif [ -f "$bg" ] && [ -f "$ov" ]; then
    ffmpeg -y -loglevel error -loop 1 -i "$bg" -loop 1 -i "$ov" -filter_complex \
      "[0:v]scale=3240:5760,zoompan=z='min(zoom+0.00045,1.12)':d=150:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1080x1920:fps=30[b];[b][1:v]overlay=0:0,format=yuv420p" \
      -t 5 -r 30 -c:v libx264 -preset veryfast -crf 20 -movflags +faststart "$out"
  else
    ffmpeg -y -loglevel error -loop 1 -i "$f" -vf "format=yuv420p" -t 5 -r 30 \
      -c:v libx264 -preset veryfast -crf 20 -movflags +faststart "$out"
  fi
  ffmpeg -y -loglevel error -ss 2 -i "$out" -frames:v 1 -q:v 5 "$DIR/p_$n.jpg"
  echo "  -> $(basename "$out")"
done
