# Health System Immersion — The Journey

A cinematic, scroll-driven 3D presentation website for a Gandhi Fellowship
Health System Immersion report (MNCH–GAVB, Ramgarh Block, Dumka, Jharkhand).

**Fully offline static site** — no build step, no dependencies at runtime.
Three.js r128 + GSAP 3.12 are vendored; field photos and notes are embedded
as base64 data URIs so it runs from `file://` as well as any static host.

## Present it

- Open `index.html` (double-click, or host it — Vercel works as-is).
- **Scroll / → / Space** — next beat (one choreographed scene per scroll)
- **← / ↑** — go back instantly
- **1–7** — jump to a section, **M** — mute, **R** — beat debug

## Structure

```
index.html          entry
css/                styles (dark "Emerald Studio" glass theme)
js/                 engine: world, character, overlay, beat-engine, scenes s1–s7
data/               content.js (ALL text — edit here), theme.js, imgdata.js (base64 assets)
fonts/              Outfit woff2
lib/                vendored three.js + gsap
```

Edits: change text in `data/content.js`, palette in `data/theme.js` + `css/style.css :root`.
