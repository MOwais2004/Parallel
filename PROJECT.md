# Parallel

A one-page site for **Parallel**, a fictional venture studio that builds and funds companies across fintech, robotics, AI, health, energy and logistics. Made as a design demo. The brand, the portfolio companies and the numbers are invented, and the footer says so.

**One idea the whole page sells:** other studios build one company at a time. Parallel runs everything at once, so an idea becomes a launched company in 12 weeks.

---

## Files

```
parallel/
  index.html          markup only
  style.css           all styling
  script.js           all behaviour (no libraries, no build step)
  PROJECT.md          this file
  assets/
    hero-static.webp  dot-matrix image, 130 KB, used by the pitch card and as the phone background
```

Open `index.html` by double-clicking it, or serve the folder:

```bash
npx http-server parallel -p 8124 -c-1
```

There is no build step and no dependency. Editing a file and refreshing is the whole workflow.

---

## Design

| | |
|---|---|
| Background | `#04070f` near-black navy |
| Text | `#e8eef8`, muted `#93a1b8` |
| Accent | `#a9d0ff` pale blue, `#f4efe6` warm white for buttons |
| Display + body font | Geist 400/500 |
| Small labels | Geist Mono, uppercase, wide letter spacing |
| Accent italics | Instrument Serif italic, used inside headlines ("*every industry*") |

Reference look: dark page, glowing horizon, arrow-glyph background, mono pill labels, dark app-icon tiles, square-ish buttons.

All colors, fonts, spacing and easing live as CSS variables at the top of `style.css`. Changing the brand is mostly changing those.

---

## Page structure

1. **Hero** — four stages that swap as you scroll, over a field of arrows that follow your cursor.
2. **Intro** — one centered line and a glowing tile with a beam running down into the page.
3. **What we do** — a split panel: the offer on the left, a diagram of the studio core linked to six industries on the right.
4. **Industries** — six cards, each with an icon tile, a one-line case and two portfolio names. Cards light up under the cursor.
5. **Compare** — the interactive moment. Press and hold to race "the usual way" (five steps in sequence, 18 months) against Parallel (all five at once, 12 weeks).
6. **How we build** — four stages across 12 weeks, with lines that draw in.
7. **Portfolio** — four counting stats and a table of six companies.
8. **FAQ** — five questions founders actually ask (equity, own idea, cofounder, industry fit, relocation).
9. **Pitch us** — the single call to action. Every section funnels here.
10. **Footer** — links and the fictional-brand disclosure.

---

## How the hero works

The hero is 440vh tall with a sticky stage inside it. Scroll position picks one of four stages; that is the only thing scrolling does, which is why it stays smooth.

- **Stage 1** the pill opens from its center, headline words rise through masks.
- **Stage 2** six industry pills start stacked in one spot and fan out into a row.
- **Stage 3** two lines slide in from opposite sides and a line draws under them.
- **Stage 4** words rise and a glowing horizon line opens.

Scrolling back up reverses each entrance. Off-screen stages get `inert` and `aria-hidden`, so keyboard and screen readers only ever reach the visible one.

**The arrow field** (`script.js`, "arrow field" section) is one canvas. Every arrow turns to point at the cursor; the closest ones turn fastest, glow brighter and scale up, so the movement ripples outward. With no cursor they settle pointing up-right. The loop stops the moment everything has settled, so an idle page costs nothing.

**The cutout**: arrows never draw behind text. The script measures the pill, each headline word, the subtext and the buttons of the active stage, and fades arrows within about 20 px of them. It re-measures when the stage changes, on resize and after fonts load.

---

## Behaviour in `script.js`

| Part | What it does |
|---|---|
| Split text | Wraps headline words in masks so they can rise line by line |
| Arrow field | Canvas grid, cursor following, content cutout |
| Hero beats | Picks the stage from scroll position, updates the 01/04 marker and the week readout |
| Reveals | One `IntersectionObserver` fades sections in and counts the stats up |
| Card spotlight | Follows the cursor inside industry cards |
| Compare | Press and hold; releasing early eases back, finishing locks the result |
| FAQ | Opens and closes rows |
| Form | Checks required fields, then shows the success state |

**The form sends nothing.** It's a demo, so it shows a thank-you message and stops there. To take real pitches, point it at a form service (Formspree and similar give you an endpoint) or change the button to a `mailto:` link.

---

## Accessibility

- Skip link, semantic `nav`/`main`/`footer`, real heading order.
- Hidden hero stages are `inert`, so tab order never lands on invisible buttons.
- Every decorative element is `aria-hidden`; the compare graphic carries a text description of the result.
- Tap targets are at least 44 px on touch screens; focus rings are visible.
- With reduced motion turned on, animations are off, the hero shows a stage without transitions, stats show their final numbers and the compare graphic shows its finished state.

---

## Performance

Measured locally at 1440x900 after optimization:

| | |
|---|---|
| Page load | 123 ms |
| First paint | 204 ms |
| Total weight | 191 KB |
| Scroll frame rate | ~60 fps |

What keeps it fast: no framework and no build output, one image, fonts loaded without blocking the first paint, scroll work limited to picking a stage, and the canvas loop resting when nothing moves.

---

## Deploying

1. Patch `og:image` and `og:url` in `index.html` with the live URL (there's a `DEPLOY STEP` comment marking the spot).
2. Zip the **contents** of this folder, so `index.html` sits at the top of the zip with `style.css`, `script.js` and `assets/` beside it.
3. Upload to any static host.

Gzip on the host takes the three text files well under 30 KB combined.

---

## Editing notes

- **Change copy**: it's all plain text in `index.html`.
- **Change colors or type**: the variables at the top of `style.css`.
- **Change arrow density or feel**: `buildArrows()` in `script.js` (`step` sets spacing) and `arrowTick()` (the `.22` turn rate and `.2` cursor smoothing).
- **Add a hero stage**: copy a `.beat` block in `index.html` and give it a `data-wk` value. The script counts stages by itself; make the hero taller (`--hero` height in `style.css`, currently `440vh`) so each stage keeps a full screen of scroll.
- **Swap the pitch card image**: replace `assets/hero-static.webp`, same aspect ratio.

---

## Origin

The hero image was generated with Higgsfield (abstract light ribbons), then converted to a two-tone dot-matrix still. An earlier version of this page played a dot-matrix video in the hero; it was removed in favour of the arrow field, which is lighter and reads better behind text.
