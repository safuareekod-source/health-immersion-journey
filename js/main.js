/* ============================================================
   main.js — boot: preloader → world init → beat engine start.
   Also drives the render loop and progress bar updates.
   ============================================================ */
(function () {
  const total = () => BeatEngine.flat.length;

  /* ---------- preloader ---------- */
  let fakeP = 0, realDone = false;
  const fill = document.getElementById("pre-fill");
  const pencil = document.querySelector(".pre-pencil");
  const pct = document.getElementById("pre-pct");

  function preloadTick() {
    fakeP += realDone ? 9 : 2.2 + Math.random() * 2.4;
    if (fakeP >= 100) fakeP = 100;
    fill.style.width = fakeP + "%";
    pencil.style.left = fakeP + "%";
    pct.textContent = Math.round(fakeP) + "%";
    if (fakeP >= 100) {
      setTimeout(begin, 500);
      return;
    }
    requestAnimationFrame(preloadTick);
  }

  function countAssets(cb) {
    /* preload images referenced in content (imgdata.js data URIs if present) */
    const imgs = [];
    const A = window.JOURNEY_CONTENT.annexure;
    try {
      A.notes.forEach(n => imgs.push((window.FIELD_IMG && window.FIELD_IMG[n.img]) || n.img));
      (A.gallery1 ? A.gallery1.photos : []).concat(A.gallery2 ? A.gallery2.photos : [])
        .forEach(p => imgs.push((window.FIELD_IMG && window.FIELD_IMG[p.img]) || p.img));
    } catch (e) {}
    let left = imgs.length + 1;
    function one() { left--; if (left <= 0) cb(); }
    if (!imgs.length) { cb(); return; }
    imgs.forEach(src => { const im = new Image(); im.onload = one; im.onerror = one; im.src = src; });
    setTimeout(one, 2500);   /* never hang the loader */
  }

  /* ---------- progress bar sync ---------- */
  function onBeat(idx, entry, dir) {
    const f = BeatEngine.flat;
    const secIdx = entry.sceneIdx;
    const secName = Progress.SECTIONS[secIdx] ? Progress.SECTIONS[secIdx].label : "";
    const p = f.length ? (idx + 1) / f.length : 0;
    const beatTitle = entry.beat.title && entry.beat.title !== secName ? " — " + entry.beat.title : "";
    Progress.setProgress(p, secIdx, secName + beatTitle);
    document.body.dataset.scene = "s" + (secIdx + 1);
    const dbg = document.getElementById("beat-debug");
    if (!dbg.classList.contains("hidden")) {
      dbg.textContent = "S" + (secIdx + 1) + " · beat " + (entry.beatIdx + 1) + "/" + f.filter(x => x.sceneIdx === secIdx).length + " — " + (entry.beat.title || entry.beat.id);
    }
    /* hint removed — nothing to toggle */
    const hint = document.getElementById("hint");
    if (hint) { if (idx <= 1) hint.classList.remove("hidden"); else hint.classList.add("hidden"); }
  }

  /* ---------- boot ---------- */
  function begin() {
    const pre = document.getElementById("preloader");
    pre.style.opacity = "0";
    pre.style.pointerEvents = "none";
    setTimeout(() => pre.remove(), 950);
    BeatEngine.init({ onBeat });
    /* refresh always restarts the journey from the top */
    if (location.hash) history.replaceState(null, "", location.pathname);
    BeatEngine.start(0);
  }

  window.addEventListener("DOMContentLoaded", () => {
    Progress.init();
    World.init();
    /* Piramal watermark from embedded assets */
    const wm = document.getElementById("watermark");
    if (wm && window.FIELD_IMG && window.FIELD_IMG.logo) wm.src = window.FIELD_IMG.logo;
    /* music on/off icon (top-left) — reflects + controls the intro music */
    const mt = document.getElementById("music-toggle");
    if (mt) {
      mt.addEventListener("click", () => {
        Sfx.unlock();
        if (Sfx.musicPlaying) { Sfx.musicStop(0.4, true); }
        else { Sfx.setMusicWanted(true); Sfx.musicStart(); }
      });
      setInterval(() => mt.classList.toggle("playing", Sfx.musicPlaying), 350);
    }

    if (!World.fallback) {
      /* images for textures load async inside scenes; start loop now */
    }
    countAssets(() => { realDone = true; });
    requestAnimationFrame(preloadTick);

    /* render loop */
    let last = performance.now();
    function loop(now) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      World.update(dt);
      Fellow.update(dt);
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  });
})();
