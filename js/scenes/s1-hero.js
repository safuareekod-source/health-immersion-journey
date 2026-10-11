/* ============================================================
   s1-hero.js — S1 ORIGIN: Kerala riverbank at night, bench,
   ONE hero glass card (name + details + Begin Journey button).
   Gentle pad music plays on the hero page (starts on first
   gesture — browser autoplay policy) and stops when the
   journey begins, with a cinematic reveal + swell SFX.
   ============================================================ */
const S1 = (() => {
  const W = window.World, C = window.JOURNEY_CONTENT;
  let built = false, started = false, startBtnEl = null;
  let bench, sign;
  let musicArmed = false;

  function build() {
    if (built || W.fallback) return;
    built = true;
    /* Kerala props — night garden */
    W.palm(4.4, -5.5, 1.25); W.palm(-7.8, -9.5, 1.5); W.palm(6.8, -16.5, 1.1);
    W.palm(-6.4, -19.0, 1.3); W.palm(9.5, -23.0, 1.0);
    W.tree(-10.5, -2.5, 1.1, false); W.tree(9.8, -11.5, 0.9, false);
    W.hill(-30, -35, 7, 0x14281E); W.hill(-38, -50, 9, 0x102018);
    W.hill(32, -40, 8, 0x14281E); W.hill(36, -58, 10, 0x102018);
    W.rock(3.6, -3.4, 0.25); W.rock(-2.8, -4.6, 0.2); W.rock(5.0, -7.8, 0.22);
    W.grass(-4.5, -3.0, 1, 6); W.grass(3.2, -6.5, 1.2, 7); W.grass(-6.5, -13.0, 1, 5);
    W.pond(-14.5, -8.0, 3.2);
    bench = W.bench(1.25, -2.35, 0.55);
    sign = W.signpost(-3.2, -5.6, W.textTexture(["Kerala", "→ Ramgarh, Dumka"], { w: 512, h: 256, bigSize: 88 }), 0.72, 1.0);
    sign.scale.setScalar(1);   /* static prop — survives forward/back navigation */
  }

  /* music can only start on a user gesture (autoplay policy):
     arm it on the first pointer/key interaction of the session */
  function armMusic() {
    if (musicArmed) return;
    musicArmed = true;
    const go = () => {
      Sfx.unlock();
      if (!started) Sfx.musicStart();
      window.removeEventListener("pointerdown", go);
      window.removeEventListener("keydown", go);
    };
    window.addEventListener("pointerdown", go);
    window.addEventListener("keydown", go);
  }

  function beats() {
    return [
      /* B1 — drift-in + the ONE hero card (name, details, Begin) */
      {
        id: "hero-in",
        title: "Welcome",
        run: () => {
          const tl = gsap.timeline();
          if (W.ready) {
            build();
            Fellow.build();
            Fellow.place(1.25, 0.58, -2.35, 0.55, true);
            Fellow.pose("sit");
            W.fly(tl, [7.5, 4.2, 6.5], [0.8, 1.2, -2.5], 3.2);
          }
          armMusic();
          tl.add(() => {
            const el = Overlay.show(Overlay.T.hero(C), { pos: "pos-hero" });
            startBtnEl = el.querySelector("#start-btn");
            if (startBtnEl) startBtnEl.addEventListener("click", onStart);
          }, W.fallback ? 0.1 : 1.6);
          return tl;
        }
      },
      /* B2 — agenda card */
      {
        id: "agenda",
        title: "The road ahead",
        run: () => {
          const tl = gsap.timeline();
          tl.add(() => {
            if (startBtnEl) { startBtnEl.disabled = true; }
            Overlay.show(Overlay.T.agenda(C), { pos: "pos-hero" });
            Sfx.paper();
          });
          return tl;
        }
      },
      /* B3 — first flight into S2 (transition beat) */
      {
        id: "to-s2",
        title: "Setting off",
        run: () => {
          const tl = gsap.timeline();
          Overlay.clear();
          if (W.ready) {
            Sfx.whoosh();
            Fellow.pose("stand");
            Fellow.place(2.2, 0, -6.0, Math.PI, false);
            W.fly(tl, [3.5, 5.5, 4.5], [0, 0.6, -22], 3.0, "power2.inOut");
            W.setMood("travel");
          }
          W.drawPathToZ(-30, 2.4);
          return tl;
        }
      }
    ];
  }

  /* the reveal: music stops, world blooms, camera soars, path ignites */
  function onStart() {
    if (started) return;
    started = true;
    Sfx.unlock();
    Sfx.musicStop(1.2);
    Sfx.begin();
    if (!W.fallback) {
      const tl = gsap.timeline();
      /* pull the camera up & back to reveal the whole night world */
      W.fly(tl, [8.5, 9.5, 12.5], [0, 1.0, -60], 2.6, "power2.inOut");
      tl.to(W.rig.look, { z: -90, duration: 1.6, ease: "power1.inOut" }, 1.4);
      /* the path ignites far ahead */
      tl.add(() => W.drawPathToZ(-120, 2.2), 0.5);
      /* gentle bloom: hemi lifts briefly */
      tl.add(() => {
        const d = document.getElementById("vignette");
        gsap.fromTo(d, { opacity: 1 },
          { opacity: 1, duration: 0.1, onComplete: () => {} });
      }, 0);
      /* settle back to the Fellow */
      W.fly(tl, [5.2, 3.4, 4.6], [0.6, 1.3, -4.0], 1.6, "power1.inOut");
      tl.to({}, { duration: 0.2 });
    }
    if (startBtnEl) {
      startBtnEl.disabled = true;
      gsap.to(startBtnEl, { opacity: 0.3, duration: 0.5 });
    }
    /* agenda appears as the reveal settles */
    setTimeout(() => BeatEngine.next(), W.fallback ? 400 : 2500);
  }

  return { beats, build, get started() { return started; } };
})();
window.BEATS.push({ scene: "s1", beats: S1.beats() });
