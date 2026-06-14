# Cédric Gautier — personal site

A React + Vite single-page portfolio. A real 3D vinyl record (react-three-fiber /
three.js) anchors the hero, motion is handled by Framer Motion, and the page is
structured like a record sleeve — **Side A: The Craft**, **Side B: The Human**.

- **Intro** — an auto-playing title sequence (no button): the wordmark reveals,
  then a green burst blooms from centre and dissolves into the page.
- **Music** — does _not_ autoplay (browser policy + by choice). A Spotify embed
  plays "done with you" by Phil Odd when you hit play, plus playlist embeds and a
  follow link.
- **Live now-playing + top artists** — pulled straight from the public
  [stats.fm](https://stats.fm/cedric.gautier) API in the browser. **No backend,
  no secrets, no server to run** (override the handle with `VITE_STATSFM_USER`).

## Run it

```bash
npm install
npm run dev      # local dev server (Vite prints the URL)
```

## Build for production

```bash
npm run build    # outputs to /dist
npm run preview  # preview the production build
```

## Stack

React 18 · Vite 5 · three.js + @react-three/fiber · Framer Motion · Spotify
embeds · stats.fm (read-only, public).

## Accessibility

Honors `prefers-reduced-motion` (the intro is skipped and the 3D record falls
back to a static label).
