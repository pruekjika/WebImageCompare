# Design System: WebImageCompare

## Overview

**North star: The Darkroom.** The lights are down and only the photos glow.
The page is near-black and the chrome is grey and quiet. Loupe Cyan is the one
colour, and it marks the two photos in the comparison, A and B.

**The comparison is the page.** The first viewport is the compare screen:
a bar with the A/B pair, the slider stage filling most of the height, and a
thumbnail timeline at the bottom. The 360 panoramas come after it, below the
fold (PRODUCT.md principles 1 and 2).

Tokens live on `:root` in [src/index.css](../src/index.css). Component styles are in
[src/Components/ImageGallery.css](../src/Components/ImageGallery.css) (compare screen) and
[src/Components/Image360.css](../src/Components/Image360.css) (panoramas).

## Colors

| Token | Value | Role |
| --- | --- | --- |
| `--c-loupe` | `#00b7fa` | **Loupe Cyan.** The A/B tags and the border of a timeline frame that is in the comparison. Nothing else. |
| `--c-on-loupe` | `#04131a` | Text on a cyan tag. |
| `--c-bg` | `#101010` | **Darkroom Black.** The page and fullscreen stage. `theme-color` is `#171717`. |
| `--c-tray` | `#202020` | **Tray Grey.** The active slot, thumbnail backing and 360 tile backing. |
| `--c-tray-glass` | `rgba(32,32,32,.7)` | Buttons. |
| `--c-safelight` | `#525252` | Button hover and the timeline scrollbar thumb. |
| `--c-scrim` | `rgba(16,16,16,.72)` | Labels and controls that sit on a photo. |
| `--c-ink-strong` | white .95 | Numbers, button labels, focus ring. |
| `--c-ink` | white .87 | Body text. |
| `--c-ink-muted` | white .66 | Dates, the bar title, hints. |
| `--c-ink-faint` | white .50 | Resting frame dates, year marks, counts (≥4.5:1 on the bg). |
| `--c-line` / `--c-line-strong` | white .14 / .32 | Hairlines and borders; strong marks the active slot and edge chips. |

The stage backing is `#0b0b0b`, a step darker than the page, so the letterbox reads as the frame.

### Rules

- **The One Light Rule:** Loupe Cyan means "in the comparison" (A or B) and nothing else.
  A second accent needs a DESIGN.md change first.
- **Photos are the only full colour.** Chrome stays in the black/grey/white-alpha ramp.
- **Hierarchy comes from alpha, not hue.** Step the ink tokens to add emphasis.
- **The active slot** (where the next tap goes) is shown in grey: Tray background plus
  the strong line. It is never cyan, because it isn't a selection yet.

## Typography

- **Family:** `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`. This is an operate
  surface, and the platform UI face is the right voice. No webfont.
- **Numerals:** `font-variant-numeric: tabular-nums` on the slots, labels and frames.
- **Dates:** `yy.mm.dd` everywhere (from EXIF `YYYY:MM:DD`). Photos are named by number.

| Role | Where | Size / weight |
| --- | --- | --- |
| Slot number | `.slot-num` | 1.35rem / 750, -0.02em (1.15rem on phone) |
| Section title | `.panoramas-title` | 1.25rem / 750 |
| Bar title | `.compare-title` ("Image compare") | 1rem / 700, ink-muted |
| Stage label | `.stage-label` | 0.95rem / 700, date 500 muted |
| Button | `.btn` | 0.9rem / 650 |
| Frame number / date | `.frame-num` / `.frame-date` | 0.85rem / 700, 0.68rem |
| Hint, counts, year | `.timeline-hint`, `.timeline-year` | 0.75–0.85rem |

## Layout

- **Compare screen** (`.compare`): a grid of `auto / minmax(0,1fr) / auto` (bar, stage,
  timeline) at `height: 100dvh` (min 34rem), so the whole compare screen is the first viewport.
- **Bar** (`.compare-bar`): title on the left, the pair centred (A slot, swap, B slot,
  "N months apart"), and the actions (Play timelapse, Fullscreen) on the right.
- **Stage** (`.stage` > `.stage-frame`): fills the remaining height, and the frame takes the photos'
  shape (`--photo-ratio`, 4:3) and centres, so the A/B labels sit on the photo's corners instead of
  out in the letterbox. Fullscreen drops the ratio and gives the whole screen to the photos. They use
  `object-fit: contain`, so both letterbox identically and the handle compares the same ground.
  Zoom starts at 1 (fit) and goes up to 20.
- **Timeline** (`.timeline`): one horizontal row of frames in archive order, with a year mark
  where the year changes. A vertical wheel scrolls it sideways, and the frame that just moved
  is centred.
- **Panoramas** (`.panoramas`): `auto-fill, minmax(13rem,1fr)` grid, 5rem tiles.
- **Gutter:** `--gutter` is 1.25rem (0.75rem on phone).

### Breakpoints

| Max width | Change |
| --- | --- |
| 1024px | The pair wraps onto its own row under the title and actions; the key hint is hidden. |
| 664px (phone) | The page scrolls (no fixed 100dvh). Actions become icon-only buttons (the label stays for screen readers). Slots stretch to share the row, and the gap goes under them. The stage takes a 4:3 aspect, max 68dvh. Panoramas use 2 columns. |

## Elevation & Depth

Flat and tonal: black page, darker stage, grey trays. Things on a photo sit on
`--c-scrim`, with no shadow. The only shadow is the slider handle's
(`0 1px 6px rgba(0,0,0,.45)`), so it reads on bright ground.

## Shapes

- `--radius-sm` 0.4rem for buttons, slots, frames, labels and 360 tiles. Tags use 0.3rem.
- `--radius-lg` 1rem for the stage, which drops to 0 in fullscreen.
- A timeline frame always carries a 3px border, transparent at rest and cyan in the comparison, so the layout never shifts.

## Components

### Slot (`.slot`, A and B)

- A cyan letter tag, then the number and date. Clicking a slot makes it the target for the next timeline tap
  (`aria-pressed`). After a tap fills a slot, the target flips to the other one, so two taps make a pair.
- A swap button (`.pair-swap`, an icon) sits between the slots. "N days / months / years apart" is computed from the two dates.

### Timeline frame (`ImageObject`, `.frame`)

- A 72px square thumbnail, with the number and date below it. A frame in the comparison gets a cyan border,
  a cyan A/B tag in the corner, and full-opacity image and text. At rest the thumbnail sits at 75% opacity.
- **Edge chip** (`.edge-chip`): when A or B has scrolled out of the strip, a scrim chip on that edge
  (`‹ A 2` / `B 85 ›`, chevron icons) points at it, and a tap centres it. Clicking a slot in the bar
  also centres its frame.
- Thumbnails come from `index.json`'s optional `thumb` field, or from `wsrv.nl` resizing the full photo
  (144px webp, about 5 KB) and lazy-loading it. If a thumbnail fails, the frame falls back to number and date only.
- Loading: 14 placeholder frames plus a visually hidden "Loading photos…".

### Stage (`CompareZoomPanPinch` + `CompareImageSlider`)

- react-compare-slider inside react-zoom-pan-pinch; only the handle drags, and the keyboard step is 5%.
- Corner labels: `A 11 22.09.21` top-left and `B 85 24.08.10` top-right, on scrim, `pointer-events: none`.
  A photo still loading shows a 2px sweep under its label, faded in after 350ms so cached photos
  (the timelapse preloads) never flash it.
- A failed photo shows a pill at the bottom: "Photo 71 didn't load. Pick another photo."
- Fullscreen uses the Fullscreen API, or `.is-pseudo-fullscreen` on iPhone. Play and Exit fullscreen sit
  bottom-centre on scrim, and Esc exits.

### Pair state and shortcuts

- The pair is kept in the URL (`?a=2&b=71`), so a comparison can be shared as a link. An unknown number falls back to 2 / 71.
- ←/→ step B through the timeline, and with Shift they step A. They are ignored while the slider handle has focus.
  S swaps A and B, F toggles fullscreen. All read `event.code`, so they work on any keyboard layout.
- **Play timelapse** walks B forward one photo at a time, loading the next 4 photos ahead.
  It restarts after A when B is at the end, and any manual choice pauses it.
- **Speed** is a button joined to Play (`.play-group`), labelled "1× speed" (the word is screen-reader only on phones), that cycles 0.5× / 1× / 2× / 4×
  (1200 / 600 / 300 / 150ms per photo). It defaults to 1×, and each browser remembers its choice in `localStorage`.

### Button (`.btn`)

- Tray glass, a 1px `--c-line` border, `--radius-sm`, 2.5rem tall, 650 weight. Icons come from `Icons.tsx`
  (24px grid, 1.75 stroke). Hover uses Safelight 85%, focus a 2px ink-strong outline, active a 1px drop,
  and disabled 45% opacity.

### 360 tile (`ImageObject360`)

- The photo at 45% brightness with the name bottom-left. Hover or focus brings it to full brightness and hides the name.
  It opens renderstuff.com in a new tab, and the section note says so.

### Load status (`LoadStatus`)

- A centred line with an optional "Try again". Errors use `role=alert` and empty states `role=status`.

## Motion

State only: 120–180ms ease-out on colour, opacity and borders. The timeline scrolls
smoothly to the frame that moved, and instantly under `prefers-reduced-motion`. The
timelapse is the one authored moment.

## Do's and Don'ts

- Do keep the compare screen as the first viewport at desktop sizes.
- Do use Loupe Cyan only for A/B; show "next tap goes here" in grey.
- Do put anything that sits on a photo on `--c-scrim`, and keep it to corners and the bottom centre.
- Do keep frame borders the same width across states.
- Do check 390px: phones are a primary target (PRODUCT.md).
- Don't add a second accent, coloured chrome or box shadows on chrome.
- Don't load full-size photos as thumbnails (each is about 1.1 MB).
