/* ============================================================
   beat-engine.js — presenter-first navigation.  [STABLE CORE]
   One input = one beat. Beats play once and hold.
   → / ↓ / Space / PageDown : next (queued while playing)
   ← / ↑ / PageUp           : previous — works instantly, even
                              mid-animation (current beat is cut)
   1-7 : jump to scene · M : mute · R : rehearsal debug
   Clicking a waypoint on the progress bar jumps too.
   Deliberately NO click-to-advance: stray clicks must never skip
   a beat during a live presentation.
   ============================================================ */
const BeatEngine = (() => {
  let registry = [];            /* [{scene, beats:[{id,title,run}]}] */
  let flat = [];                /* [{sceneIdx, beatIdx, beat, sceneId}] */
  let idx = -1;
  let playing = false, queued = false, activeTl = null;
  let onBeat = null;

  function compile() {
    flat = [];
    registry.forEach((r, si) => {
      r.beats.forEach((b, bi) => flat.push({ sceneIdx: si, beatIdx: bi, beat: b, sceneId: r.scene }));
    });
  }

  function stopCurrent() {
    if (activeTl) { try { activeTl.kill(); } catch (e) {} activeTl = null; }
    gsap.killTweensOf("*");
    Overlay.clear(true);
    playing = false;
  }

  function play(entry) {
    playing = true;
    const tl = entry.beat.run();
    /* a GSAP timeline is promise-like (has .then) but also has .kill —
       only real timelines may hold the beat open */
    activeTl = (tl && typeof tl.kill === "function" && typeof tl.duration === "function") ? tl : null;
    if (activeTl) {
      activeTl.eventCallback("onComplete", () => done());
      if (activeTl.duration() === 0) done();
    } else {
      done();
    }
    if (onBeat) onBeat(idx, entry);
    hash();
  }

  function done() {
    playing = false;
    activeTl = null;
    if (queued) { queued = false; next(); }
  }

  function next() {
    if (idx >= flat.length - 1) return;
    if (playing) { queued = true; return; }
    idx++;
    play(flat[idx]);
  }

  function prev() {
    if (idx <= 0) return;
    stopCurrent();          /* cut the current beat instantly */
    queued = false;
    idx--;
    play(flat[idx]);
  }

  function jumpScene(n) {   /* n = 1..7 */
    const target = flat.findIndex(f => f.sceneIdx === n - 1);
    if (target < 0) return;
    stopCurrent();
    queued = false;
    idx = target;
    play(flat[idx]);
  }

  function go(i) {          /* absolute jump, clamped — testing / deep-links */
    const t = Math.max(0, Math.min(flat.length - 1, i));
    if (t === idx && !playing) return;
    stopCurrent();
    queued = false;
    idx = t;
    play(flat[idx]);
  }

  function hash() {
    const e = flat[idx];
    if (e) history.replaceState(null, "", "#s" + (e.sceneIdx + 1) + "b" + (e.beatIdx + 1));
  }

  /* ---------- input ----------
     wheel removed (his request). Arrows / Space / PageUp-Down / 1-7 keys,
     touch swipe, and a plain TAP anywhere = next (mobile). */
  let touchY = null, touchT = 0, touchTarget = null;
  function onTouchStart(e) {
    touchY = e.touches[0].clientY;
    touchT = Date.now();
    touchTarget = e.target;
  }
  function onTouchEnd(e) {
    if (touchY === null) return;
    const dy = touchY - e.changedTouches[0].clientY;
    const dt = Date.now() - touchT;
    /* never hijack taps on real controls */
    const onControl = touchTarget && touchTarget.closest &&
      touchTarget.closest("button, a, #progress-svg, #music-pill");
    if (!onControl) {
      if (Math.abs(dy) > 46) { dy > 0 ? next() : prev(); }
      else if (dt < 350 && Math.abs(dy) < 24) {
        /* tap zones: right half = forward, left half = backward */
        const tx = e.changedTouches[0].clientX;
        tx > window.innerWidth / 2 ? next() : prev();
      }
    }
    touchY = null;
  }

  function onKey(e) {
    if (e.repeat) return;
    const k = e.key;
    if (k === "ArrowRight" || k === "ArrowDown" || k === " " || k === "PageDown") { e.preventDefault(); next(); }
    else if (k === "ArrowLeft" || k === "ArrowUp" || k === "PageUp" || k === "Backspace") { e.preventDefault(); prev(); }
    else if (k === "m" || k === "M") { toggleMuteUI(); }
    else if (k === "r" || k === "R") { toggleDebug(); }
    else if (k >= "1" && k <= "7") { jumpScene(parseInt(k, 10)); }
  }

  function toggleMuteUI() {
    const off = Sfx.toggleMute();
    const m = document.getElementById("mute");
    if (m) m.classList.toggle("off", off);
  }
  function toggleDebug() {
    document.getElementById("beat-debug").classList.toggle("hidden");
  }

  function bindInputs() {
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("keydown", onKey);
    const m = document.getElementById("mute");
    if (m) m.addEventListener("click", toggleMuteUI);
  }

  function init(opts) {
    registry = window.BEATS.slice();
    compile();
    onBeat = opts && opts.onBeat;
    bindInputs();
    Progress.jumpFn = (i) => jumpScene(i + 1);
    if (opts && opts.debug) document.getElementById("beat-debug").classList.remove("hidden");
  }

  function start(at) {
    idx = (at === undefined || at < 0) ? -1 : at - 1;
    next();
  }

  return { init, start, next, prev, jumpScene, go, get index() { return idx; }, get flat() { return flat; }, get playing() { return playing; } };
})();
window.BeatEngine = BeatEngine;
