# Design System: WebImageCompare

## Overview

**North star: The Darkroom.** The lights are down and only the photos glow.
The page is near-black and the chrome is grey and low-contrast. Loupe Cyan is
the one colour, and it marks the two frames you picked. Everything else exists
to get you to a comparison and then gets out of the way (see PRODUCT.md
principle 1).

There are no design tokens. Every value below is a literal in
[src/index.css](../src/index.css),
[src/Components/ImageGallery.css](../src/Components/ImageGallery.css) and
[src/Components/Image360.css](../src/Components/Image360.css). The only custom
properties are the gallery's layout variables `--cols` and `--gap`.

## Colors

All values are literals; no `--color-*` tokens exist.

### Primary

- **Loupe Cyan** (`#00b7fa`): the 5px border on a selected gallery tile. It's
  the only hue in the UI. Nothing else uses it.

### Neutral

- **Darkroom Black** (`#101010`): the page background (`:root`) and the fullscreen
  compare stage. The meta `theme-color` is a step lighter at `#171717`.
- **Tray Grey** (`rgb(32, 32, 32)` / `#202020`): the resting gallery tile, and the
  fullscreen button at 70% alpha (`rgba(32, 32, 32, 0.7)`).
- **Safelight Grey** (`#525252`): a gallery tile on hover.
- **Print White**, used at stepped alphas:
  - `rgba(255,255,255,0.87)`: body text (`:root`).
  - `0.92`: button label.
  - `0.808`: the big compare-pair numbers.
  - `1.0`: compare dates, and tile number/date on hover.
  - `0.458`: resting tile number.
  - `0.251`: resting tile date (on hover `0.658`).
  - `0.2`: button border.
- **Shade** (`rgba(0,0,0,0.8)`): the text shadow on the compare caption (`2px 2px 4px`), so it reads over a photo.
- **Dimmed photo**: 360 thumbnails rest at `filter: brightness(30%)` and come up to 100% on hover.

### Semantic

None. There are no success/warning/error colours and no error or empty states.

### Rules

- **The One Light Rule:** Loupe Cyan means "selected for comparison" and nothing
  else. A second accent needs a DESIGN.md change first.
- **Photos are the only full colour.** Chrome stays in the black/grey/white-alpha ramp.
- **Hierarchy comes from alpha, not hue.** Raise white opacity to emphasise; don't add colour.

## Typography

Family: `Inter, system-ui, Avenir, Helvetica, Arial, sans-serif` on `:root`. Inter
is **not loaded** (no font import), so in practice it renders in the system UI
font unless Inter is installed locally. `font-synthesis: none`, antialiased.
No type scale is defined; the sizes are browser keywords and one-off rems.

- **Display: compare pair** (`.text-compare-number`, an `h1`): `4rem` (`2.25rem` ≤664px),
  weight is the h1 default (bold), white 0.808 with a text shadow. Shows e.g. `2 - 71`.
- **Headline: section titles** (`h1.center`, "360 Image view" / "Image compare"):
  browser h1 default (2em, bold), `1.75rem` ≤664px; margin `0.75rem 0 0.5rem` on the gallery title.
- **Title: compare dates** (`.text-compare-date`, an `h3`): browser h3 default, pure white, e.g. `22.09.08 - 23.01.14`.
- **Label: tile number** (`.text-img-name`): `font-size: large`, `font-weight: bolder`.
- **Label: tile date** (`.text-img-date`): `0.7rem`.
- **Button** (`.fullscreen-btn`): inherited size, weight 700.
- **Data / numerals:** no `tabular-nums`. The dates are `yy.mm.dd` (from EXIF
  `YYYY:MM:DD`) and photos are named by number with the `.webp`/`.jpg` stripped.

## Layout

- **Page:** `body` is `display:flex; place-items:center; min-width:320px; min-height:100dvh`.
  Order: the 360 gallery, the photo gallery, the compare caption, the fullscreen
  button, then the compare stage.
- **Photo gallery** (`.image-gallery`): flex-wrap. Tile width is
  `calc((100% - (var(--cols) - 1) * var(--gap)) / var(--cols))`, tile height `2.5rem`.
- **360 gallery** (`.image-gallery-360`): a CSS grid with `0.5rem` gap. Padding is
  `0 2rem` on desktop, `1rem` below 1124px. Tile height `4rem`.
- **Compare stage** (`.container`): `min(1100px, 100dvw)` × `min(72dvh, 720px)`,
  inside `.full-container` with `1rem` padding. In fullscreen it fills
  `100dvw × 100dvh` with no padding or radius. The zoom wrapper starts at scale
  `0.58` (also its minimum) and goes up to `20`.
- **Compare caption** (`.current-select-footer`): `position: fixed; bottom: 3rem`,
  centred, `z-index: 9999` on desktop. At 1124px and below it becomes `static`, in
  flow above the button. In fullscreen it's an absolute overlay at `bottom: 2rem`
  with `pointer-events: none`.

### Breakpoints

| Max width | Gallery `--cols` / `--gap` / padding | 360 columns | Stage height / radius |
| --- | --- | --- | --- |
| desktop | 30 / 0.5rem / `clamp(0.4rem, 2vw, 1.25rem)` | 5 | `min(72dvh, 720px)` / 2rem |
| 1124px (tablet) | 8 / 0.5rem / `clamp(0.4rem, 2vw, 1rem)` | 3 | 64dvh / 1.25rem |
| 664px (phone) | 6 / 0.6rem / `clamp(0.4rem, 2.5vw, 1rem)` | 2 | 70dvh / 1rem |
| 300px | 4 / 0.5rem / 0.4rem | 1 | 70dvh / 1rem |

**Spacing in use:** `0.4`, `0.5`, `0.6`, `0.75`, `1`, `2`, `3rem`. It's a rough
half-rem rhythm, not a declared scale. **Density:** tight; at desktop the whole
archive fits in a strip of small number tiles.

## Elevation & Depth

Flat, with tonal layering: black page, then grey tiles, then lighter grey on hover.
There are no `box-shadow`s. The only depth effects are the caption's text shadow
(`2px 2px 4px rgba(0,0,0,0.8)`) and the 360 thumbnails' brightness filter.

## Shapes

- **Radius:** `0.4rem` on tiles, 360 tiles and the button. A 360 tile goes to
  `1rem` on hover. The compare stage is `2rem` / `1.25rem` / `1rem` by
  breakpoint, and `0` in fullscreen.
- **Borders:** tiles always carry a 5px border, transparent at rest and Loupe
  Cyan when selected, so selecting one doesn't shift the layout. The button has
  a 1px white border at 0.2 alpha.
- **Clipping:** 360 tiles use `overflow: hidden` and the photo gallery `overflow: hidden`.

## Components

### Gallery tile (`ImageObject`, `.image-container`)

- A `<button aria-pressed>` showing the photo's number and date centred
  (absolute, `translate(-50%,-50%)`), with a `title` carrying the full name and
  date. There's no thumbnail image. Overflowing names are clipped.
- Rest: Tray Grey, number at white 0.458, date at 0.251.
- Hover: Safelight Grey, number white, date 0.658. `transition: all 100ms ease-in-out`.
- Selected: a Loupe Cyan 5px border.
- Selection logic: the first two taps fill A and B. After that, tapping A drops
  it; tapping anything else becomes A and the old A becomes B.
- Focus: a 2px Print White (0.92) outline offset 2px. Forced colours: the selected border becomes `Highlight`.
- Loading: 30 placeholder tiles at Tray Grey 60%, plus a visually hidden "Loading photos…" status.

### 360 tile (`ImageObject360`, `.image-container-360`)

- The photo at 30% brightness with the number on top in white bold large.
- Hover: brightness 100%, the number fades out (alpha 0), `scale: 1.01`, radius
  1rem, `150ms ease-in-out`.
- An `<a target="_blank">` to the external renderstuff.com panorama viewer. Focus
  shows the hover look plus the white focus outline. Loading: 5 placeholder tiles.

### Compare stage (`CompareZoomPanPinch` + `CompareImageSlider`)

- react-compare-slider inside react-zoom-pan-pinch. Only the handle drags
  (`onlyHandleDraggable`). The handle is the library default with the button's
  border, backdrop blur and shadow removed. The keyboard step is 5%, and it
  starts at 50%.
- The default pair is photos 2 and 71.
- A photo that fails to load shows a Tray Grey 85% pill at the top of the stage:
  "Photo 71 didn't load. Pick another photo."
- Fullscreen uses the Fullscreen API, or `.is-pseudo-fullscreen` (fixed, inset 0)
  where the API is missing, e.g. on iPhone. Either way an "Exit fullscreen" button
  sits top-right in the stage, and Esc exits.

### Button (`.btn`, in `src/index.css`)

- Used for Fullscreen / Exit fullscreen, Try again and Reload page. Tray Grey at
  70% with a 1px white-0.2 border, radius 0.4rem, padding `0.55rem 0.9rem`, weight 700.
- Hover: Safelight Grey at 85%. Focus: the 2px white outline. Active: `translateY(1px)`.
  No disabled style.

### Load status (`LoadStatus`, `.load-status`)

- A centred line under a section title, white 0.87, max 60ch, with an optional Try
  again button below. Copy names what failed and what to do next ("GitHub's hourly
  limit for this network is used up. Try again in about 25 min.").
- Used for errors (`role=alert`) and empty galleries (`role=status`). The error
  boundary uses the same look with a Reload page button.

### Compare caption (`.current-select-footer`)

- Two lines: the pair numbers (`2 - 71`) in Display and their dates in Title,
  both with the text shadow.
- It's hidden in normal flow while in fullscreen and overlaid on the stage instead.

## Motion

- Tiles: `all 100ms ease-in-out`. 360 tiles: `all 150ms ease-in-out`. Button press: a 1px drop.
- No authored moment. No `prefers-reduced-motion` handling (the motion is small hover feedback).

## Do's and Don'ts

- Do keep the page dark and let the photos carry all the colour.
- Do use Loupe Cyan only for "selected for comparison".
- Do build hierarchy by stepping white alpha (0.25, 0.46, 0.81, 0.87, 1.0).
- Do keep the 0.4rem radius on small controls and a large radius on the stage, dropping to 0 in fullscreen.
- Do keep borders the same width across states so selecting never shifts the layout.
- Do check the 664px phone layout: phones are a primary target (PRODUCT.md).
- Don't add a second accent, coloured chrome or box shadows.
- Don't put chrome over the photos except the shadowed caption in fullscreen.

## Known drift

Recorded as found, not fixed:

- `.text-img-name` is defined in both CSS files with different colours (0.458 vs
  white), and `.center-text` and `.container` are each defined twice. Which one
  wins depends on CSS load order.
- Inter is named but never loaded.
- `color-scheme: light dark`, but the page is always dark, so form controls may render light in light mode.
- `--cols`/`--gap` are the only custom properties. There are no colour, space or radius tokens.
