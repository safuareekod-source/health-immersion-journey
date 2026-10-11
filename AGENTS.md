# AGENTS.md — how AI agents edit this project

Read this before changing anything. The site is a presentation instrument:
offline, single-page, beat-driven. Simplicity and robustness outrank features.

## Golden rules

1. **Run = double-click `index.html`.** No server, no build step. Everything must
   work on the `file://` protocol — that means **no ES module imports, no fetch()
   of local files**. Data files are classic scripts that assign globals
   (`window.JOURNEY_CONTENT`, `window.THEME`).
2. **All text lives in `data/content.js`.** Never hardcode presentation strings
   inside scene files. To change what the audience reads, edit content.js only.
3. **All look & feel lives in `data/theme.js` + `css/style.css`.** The palette is
   duplicated in both on purpose (CSS vars for DOM, JS hexes for 3D). Keep them
   in sync when changing colors.
4. **`lib/` and `js/beat-engine.js` are stable core.** Don't touch unless the task
   explicitly requires it. The beat engine is small and load-bearing: one input =
   one beat, beats hold, extra input queues (max 1).

## Architecture (30 seconds)

- `js/world.js` — Three.js scene, camera rig (`World.rig.pos/look`), toon material
  helpers (`World.toon(color)`), prop builders (palm/tree/hill/bench/hut/…), the
  green journey path (`World.drawPathToZ(z, dur)`), moods (`World.setMood(name)`),
  particles (dust/rain/fireflies). One continuous world along −Z; sections live at
  increasing negative z (S1 ≈ 0…−25, S2 ≈ −25…−90, S3 ≈ −90…−140, S4 ≈ −140…−190,
  S5 ≈ −190…−250, S6 ≈ −250…−362, S7 ≈ −362…−440).
- `js/scenes/s1…s7.js` — each scene file returns `{beats, build}` and registers
  `window.BEATS.push({scene, beats})`. A **beat** = `{id, title, run() → gsap
  timeline}`. `run()` may create DOM via `Overlay.show(Overlay.T.xxx(...))` and
  animate the camera via `World.fly(tl, [px,py,pz], [lx,ly,lz], dur)`.
- `js/overlay.js` — torn-paper DOM panels + all HTML templates (`Overlay.T.*`).
  Templates read content.js. `.ir` class = ink-reveal line (animates a clip sweep).
- `js/beat-engine.js` — input normalization (wheel/keys/clicker/touch/click),
  beat queue, hash recovery (`#s3b2`), `1–7` jumps, `M` mute, `R` debug.
- `js/audio-engine.js` — WebAudio-synthesized SFX only (no files, no music by
  design). Calls: Sfx.paper/ink/whoosh/thud/pop/chime/birds/rainStart/rainStop/slap.
- `js/main.js` — preloader, render loop, progress-bar sync.

## Common tasks

**Change a statistic / caption / typo** → edit `data/content.js`. Done.

**Reorder or remove a gap / challenge / objective** → edit the arrays in
`data/content.js`. Beats for those items are generated from the arrays
(`S5.beats()` maps over `gaps`, etc.), so counts adjust automatically. Signposts
in S2 are generated from `objectives` too.

**Change a panel's wording but keep structure** → edit the template in
`js/overlay.js` (they're small string builders) or the content it reads.

**Add a whole new beat to a scene** → open the scene file, add an entry to the
array returned by `beats()`:
```js
{ id: "my-beat", title: "My beat", run: () => {
    const tl = gsap.timeline();
    tl.add(() => { Overlay.show("<h2>Hello</h2>", { pos: "pos-left" }); });
    World.fly(tl, [2, 4, -100], [0, 1, -110], 2.5);
    return tl; } }
```

**Recolor the site** → update `:root` in `css/style.css` AND `THEME.colors` +
`THEME.moods` in `data/theme.js`. Keep `--green`/`colors.green` = the journey
green; it is reserved for the path, waypoints, and positive moments.

**Replace field photos/notes** → drop new files in `assets/img/`, update the
`img:` paths in `content.js → annexure.photos/notes`. Images are plain `<img>`-fed
textures; ~1200px long edge, JPEG q80 is plenty.

**Swap the meme** → edit `content.js → annexure.meme` (top/bottom/cap lines).

## Testing checklist (run after every edit session)

1. Open `index.html` by double-click (file://) in Chrome and Edge — console clean.
2. Full walkthrough with only the keyboard: Space through all beats 1→end.
3. Wheel scroll: one notch = one beat, rapid notches never skip content.
4. Keys 1–7 jump; M mutes; R shows debug; waypoints clickable.
5. Close mid-journey, reopen — should resume via `#sNbM` hash.
6. `index.html?fallback=1` — 2D fallback must play the same story end-to-end.
7. 1920×1080: text readable, no panel overlapping the progress bar.

## Do NOT

- Do not add nav bars, footers, menus, analytics, fonts/CDN links, or any external
  network reference. This site must run with the network cable unplugged.
- Do not introduce frameworks, bundlers, or module syntax.
- Do not make beats skippable mid-animation (the queueing behavior is intentional:
  the presenter talks over each beat; nothing may run away from him).
- Do not use the journey green for decoration.
