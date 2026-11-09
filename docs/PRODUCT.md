# Product

## Platform

web: a static single-page app on GitHub Pages (https://pruekjika.github.io/WebImageCompare/), Vite + React + TypeScript.

## Users

The garden's owners and their family. They open it, often on a phone, to look at
their own garden from above: how it has changed between two drone shots, and how
it has grown over the whole timeline. Anyone with the link can view it, but
nothing is designed for outside visitors.

## Product Purpose

Turn the GardenImgDB drone photo archive into something the household can look
through. Two jobs, equally important:

- **Compare two dates:** pick any two photos and drag a slider across them, with
  pinch/zoom/pan for detail and a fullscreen mode, to see what grew, got cut or moved.
- **Watch the garden over time:** browse the numbered, dated photo timeline.

The 360 panorama section (GardenImg360) is a second way to see the garden from
the ground.

Success: the owner can go from "what did it look like back then?" to an answer in
a few taps.

## Positioning

It's the family's own archive. The photos are aligned shots of one garden
(GardenImgDB's `batch_align.py`), so a slider between any two dates shows real
change, not camera drift.

## Operating Context

- Opened casually, mostly on phones; touch matters (pinch-zoom, drag the slider,
  fullscreen).
- New photos arrive when GardenImgDB is updated: `main.py` / `batch_align.py`
  write the `.webp` files and rewrite `ImageDB/index.json`. The site picks them up
  without being rebuilt.
- Pushing to `main` builds into `dist/` and deploys to Pages
  (`.github/workflows/deploy.yaml`).

## Capabilities and Constraints

- **Gallery:** a photo list from `ImageDB/index.json` on raw.githubusercontent.com
  (`name`, `date` as EXIF `YYYY:MM:DD HH:MM:SS`), sorted by the number in the
  filename and shown as `yy.mm.dd`.
- **Fallback:** if the index can't be loaded, the anonymous GitHub contents API
  (60 req/hour per visitor IP), with dates read from EXIF on demand.
- **Compare:** tap two photos to select them (a third tap rotates the pair). The
  default pair is photos 2 and 71. Uses react-compare-slider inside
  react-zoom-pan-pinch.
- **360 gallery:** GardenImg360 through the contents API (1 request per visit);
  a tap opens the photo in the external renderstuff.com panorama viewer. Must
  stay part of the site.
- **No credentials:** no token, `.env` or secret. Anything in `VITE_*` ships in
  the public bundle (that's how earlier tokens leaked). From the README.
- **Phone use is a first-class target.** Don't design for desktop only.
- Terminology: photos are referred to by number (`2`, `71`) and date.

## Brand Commitments

- Name in the UI: "Image compare"; page title `ImageCompare`; og title `PruekJika-ImageDB`.
- Icon: `icon.webp`. Theme colour `#171717`, dark page background.
- Owner/org name: pruekjika.

## Evidence on Hand

- Real photos: GardenImgDB `ImageDB/*.webp` (index.json has dates); 360 photos in GardenImg360.
- og image: `ImageDB/Fixed/__62.webp`.
- No metrics, visitor data or written copy beyond the README. Don't make them up.

## Product Principles

1. The photos come first. The interface helps you find and compare them, then gets out of the way.
2. Any two dates are one or two taps apart, on a phone.
3. Static and credential-free: public data, no backend, no secrets.
4. Adding photos is a data change in GardenImgDB, never a code change here.
