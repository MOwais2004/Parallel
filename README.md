# Parallel

A one-page site for a fictional venture studio that builds and funds companies across fintech, robotics, AI, health, energy and logistics.

**The pitch:** other studios build one company at a time. Parallel runs everything at once, taking an idea to a launched company in 12 weeks.

> **Demo only.** The brand, portfolio companies and numbers are invented, and the footer says so.

## Quick start

No build step, no dependencies. Open `index.html` directly, or serve the folder:

```bash
npx http-server parallel -p 8124 -c-1
```

Edit a file, refresh. That's the workflow.

## Project structure

```
parallel/
├── index.html          # markup only
├── style.css           # all styling
├── script.js           # all behaviour (vanilla JS, no libraries)
└── assets/
    └── hero-static.webp  # dot-matrix image (130 KB), pitch card + mobile background
```

## Design

| Token | Value |
|---|---|
| Background | `#04070f` near-black navy |
| Text | `#e8eef8`, muted `#93a1b8` |
| Accent | `#a9d0ff` pale blue |
| Buttons | `#f4efe6` warm white |
| Display + body | Geist 400/500 |
| Labels | Geist Mono, uppercase, wide tracking |
| Accent italics | Instrument Serif italic, inside headlines |

The look combines a dark page, a glowing horizon, an arrow-glyph background, mono pill labels, dark app-icon tiles and square-ish buttons.

All colours, fonts, spacing and easing are CSS variables at the top of `style.css`.

## Sections

| # | Section | What it does |
|---|---|---|
| 1 | **Hero** | Four scroll-driven stages over a cursor-following arrow field |
| 2 | **Intro** | Centred line plus a glowing tile with a beam running into the page |
| 3 | **What we do** | Split panel: the offer on the left, a diagram of the studio core linked to six industries on the right |
| 4 | **Industries** | Six cards with an icon, a one-line case and two portfolio names; each card lights up under the cursor |
| 5 | **Compare** | Press and hold to race "the usual way" (sequential, 18 months) against Parallel (parallel, 12 weeks) |
| 6 | **How we build** | Four stages across 12 weeks, with lines that draw in |
| 7 | **Portfolio** | Four counting stats and a table of six companies |
| 8 | **FAQ** | Five founder questions: equity, own idea, cofounder, industry fit, relocation |
| 9 | **Pitch us** | The single CTA; every section funnels here |
| 10 | **Footer** | Links and the fictional-brand disclosure |

## Hero

The hero is a `440vh` container with a sticky stage inside it. Scroll position only picks which stage is active, which keeps scrolling smooth.

| Stage | Entrance |
|---|---|
| 1 | Pill opens from its centre; headline words rise through masks |
| 2 | Six industry pills start stacked and fan out into a row |
| 3 | Two lines slide in from opposite sides and a line draws under them |
| 4 | Words rise and a glowing horizon line opens |

- Scrolling up reverses each entrance.
- Inactive stages get `inert` and `aria-hidden`.

### Arrow field

- A single canvas grid in which every arrow turns to face the cursor.
- The nearest arrows turn fastest and glow brightest, so the movement ripples outward.
- With no cursor, the arrows settle pointing up-right.
- The loop stops once everything has settled, so an idle page costs nothing.

**Cutout:** arrows fade within about 20 px of the active stage's text and buttons. These are re-measured on stage change, on resize and after fonts load.

## Behaviour (`script.js`)

| Part | Function |
|---|---|
| Split text | Wraps headline words in masks so they can rise line by line |
| Arrow field | Canvas grid, cursor tracking, content cutout |
| Hero beats | Picks the stage from scroll; updates the 01/04 marker and the week readout |
| Reveals | One `IntersectionObserver` fades sections in and counts stats up |
| Card spotlight | Cursor-follow glow inside industry cards |
| Compare | Press and hold; releasing early eases back, finishing locks the result |
| FAQ | Opens and closes rows |
| Form | Validates required fields, then shows a success state |

> **The form sends nothing.** To receive pitches, point it at a form endpoint (e.g. Formspree) or swap the button for a `mailto:` link.

## Accessibility

- Skip link, semantic `nav`/`main`/`footer` and correct heading order.
- Hidden hero stages are `inert`, so they are never reachable by Tab.
- Decorative elements are `aria-hidden`, and the compare graphic has a text description of its result.
- Touch targets are at least 44 px, with visible focus rings.
- Under `prefers-reduced-motion`:
  - Animations are turned off.
  - The hero shows a static stage.
  - Stats show their final numbers.
  - The compare graphic shows its finished state.

## Performance

Measured locally at 1440×900:

| Metric | Value |
|---|---|
| Page load | 123 ms |
| First paint | 204 ms |
| Total weight | 191 KB |
| Scroll | ~60 fps |

Why it's fast:

- No framework and only one image.
- Fonts load without blocking first paint.
- Scrolling only selects a stage.
- The canvas loop rests when nothing is moving.

## Deploying

1. Set `og:image` and `og:url` in `index.html`; look for the `DEPLOY STEP` comment.
2. Zip the **contents** of the folder, so `index.html` sits at the zip root.
3. Upload the zip to any static host.

With gzip, the three text files come to under 30 KB combined.

## Customising

| To change | Edit |
|---|---|
| Copy | Plain text in `index.html` |
| Colours / type | Variables at the top of `style.css` |
| Arrow spacing | `step` in `buildArrows()` |
| Arrow feel | `arrowTick()`: `.22` turn rate, `.2` cursor smoothing |
| Pitch card image | Replace `assets/hero-static.webp` (same aspect ratio) |

### Adding a hero stage

1. Copy a `.beat` block in `index.html` and give it a `data-wk` value. The script counts stages automatically.
2. Increase `--hero` in `style.css` (currently `440vh`) so each stage gets a full screen of scroll.

## Origin

- The hero image was generated with Higgsfield (abstract light ribbons) and converted to a two-tone dot-matrix still.
- An earlier version used a dot-matrix video in the hero; the arrow field replaced it as lighter and more readable behind text.
