#!/usr/bin/env bash

# Prerequisite: brew install imagemagick

# Round out the corners
convert $1 \
  \( +clone  -alpha extract \
    -draw 'fill black polygon 0,0 0,15 15,0 fill white circle 15,15 15,0' \
    \( +clone -flip \) -compose Multiply -composite \
    \( +clone -flop \) -compose Multiply -composite \
  \) -alpha off -compose CopyOpacity -composite "rounded-$1"

# Add a drop shadow that's barely visible against the brown
# background color of the site
convert "rounded-$1" \
    \( +clone -background black -shadow 80x20+0+15 \) \
    +swap -background transparent -layers merge +repage \
    "prettified-$1"