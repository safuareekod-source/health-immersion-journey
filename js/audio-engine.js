/* ============================================================
   audio-engine.js — all SFX are synthesized with WebAudio.
   No audio files. Ambient SFX are deliberately soft; the hero
   page carries a gentle synth-pad music loop that stops when
   the journey begins, and begin() plays a cinematic reveal.
   Unlocked on first user gesture (browser autoplay policy).
   ============================================================ */
const Sfx = (() => {
  let ctx = null, master = null, sfxBus = null, muted = false;
  let musicBus = null, musicTimer = null;

  function ensure() {
    if (ctx) return true;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = (window.THEME.audio.master) || 0.5;
      master.connect(ctx.destination);
      /* ambient SFX run quieter than the reveal moment */
      sfxBus = ctx.createGain(); sfxBus.gain.value = 0.4; sfxBus.connect(master);
      musicBus = ctx.createGain(); musicBus.gain.value = 0; musicBus.connect(master);
    } catch (e) { return false; }
    return true;
  }

  function unlock() {
    if (!ensure()) return;
    if (ctx.state === "suspended") ctx.resume();
  }

  function noiseBuffer(dur) {
    const len = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  }

  function env(g, t0, a, peak, d) {
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(peak, t0 + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + d);
  }

  /* ---------- hero music: slow warm low pad + sparse soft bells ---------- */
  /* low, slow, warm — a quiet evening hum, not a jingle */
  const PAD = [98.00, 146.83, 196.00, 293.66];    /* G2 D3 G3 D4 — low & warm */
  const BELLS = [392.00, 493.88, 587.33];         /* G4 B4 D5 — sparse, soft */

  function padVoice(freq, t0, dur) {
    const o = ctx.createOscillator(); o.type = "sine"; o.frequency.value = freq;
    const o2 = ctx.createOscillator(); o2.type = "triangle"; o2.frequency.value = freq * 1.003;  /* slow warmth */
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(0.045, t0 + dur * 0.45);
    g.gain.linearRampToValueAtTime(0.0001, t0 + dur);
    const g2 = ctx.createGain(); g2.gain.value = 0.16;
    o.connect(g); o2.connect(g2).connect(g);
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 900;
    g.connect(lp).connect(musicBus);
    o.start(t0); o2.start(t0);
    o.stop(t0 + dur + 0.1); o2.stop(t0 + dur + 0.1);
  }

  function bellNote(freq, t0) {
    const o = ctx.createOscillator(); o.type = "sine"; o.frequency.value = freq;
    const g = ctx.createGain(); env(g, t0, 0.03, 0.02, 2.2);
    o.connect(g).connect(musicBus);
    o.start(t0); o.stop(t0 + 2.3);
  }

  function musicStart() {
    if (!ensure() || muted || musicTimer) return;
    if (ctx.state === "suspended") ctx.resume();
    musicBus.gain.cancelScheduledValues(ctx.currentTime);
    musicBus.gain.setValueAtTime(0.0001, ctx.currentTime);
    musicBus.gain.linearRampToValueAtTime(window.THEME.audio.music || 0.22, ctx.currentTime + 3.0);
    const step = 5.2;   /* one slow warm chord breathing every 5.2s */
    const tick = () => {
      const t0 = ctx.currentTime + 0.05;
      PAD.forEach((f, i) => padVoice(f, t0 + i * 0.12, step * 1.2));
      if (Math.random() > 0.35) bellNote(BELLS[Math.floor(Math.random() * BELLS.length)], t0 + 1.4 + Math.random() * 2.2);
    };
    tick();
    musicTimer = setInterval(tick, step * 1000);
  }

  function musicStop(fade) {
    if (musicTimer) { clearInterval(musicTimer); musicTimer = null; }
    if (!musicBus) return;
    const t0 = ctx.currentTime;
    const d = fade === undefined ? 1.4 : fade;
    musicBus.gain.cancelScheduledValues(t0);
    musicBus.gain.setValueAtTime(musicBus.gain.value, t0);
    musicBus.gain.linearRampToValueAtTime(0.0001, t0 + d);
  }

  /* ---------- the Begin reveal: deep swell + rising arp + shimmer ---------- */
  function begin() {
    if (!ensure() || muted) return;
    const t0 = ctx.currentTime;
    /* 1. deep swelling drone */
    [65.41, 98.00].forEach((f, i) => {
      const o = ctx.createOscillator(); o.type = "sine"; o.frequency.value = f;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.linearRampToValueAtTime(0.22, t0 + 1.1);
      g.gain.linearRampToValueAtTime(0.0001, t0 + 3.2);
      o.connect(g).connect(master);
      o.start(t0); o.stop(t0 + 3.3);
    });
    /* 2. rising arpeggio */
    [261.63, 329.63, 392.00, 523.25, 659.25].forEach((f, i) => {
      const dt = 0.55 + i * 0.16;
      const o = ctx.createOscillator(); o.type = "triangle"; o.frequency.value = f;
      const g = ctx.createGain(); env(g, t0 + dt, 0.015, 0.11, 1.1);
      o.connect(g).connect(master);
      o.start(t0 + dt); o.stop(t0 + dt + 1.2);
    });
    /* 3. airy shimmer sweep */
    const src = ctx.createBufferSource(); src.buffer = noiseBuffer(2.6);
    const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.Q.value = 0.8;
    bp.frequency.setValueAtTime(300, t0);
    bp.frequency.exponentialRampToValueAtTime(5200, t0 + 2.2);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(0.10, t0 + 1.4);
    g.gain.linearRampToValueAtTime(0.0001, t0 + 2.6);
    src.connect(bp).connect(g).connect(master);
    src.start(t0); src.stop(t0 + 2.7);
    /* 4. resolving chime */
    [[523.25, 2.1], [783.99, 2.24]].forEach(([f, dt]) => {
      const o = ctx.createOscillator(); o.type = "sine"; o.frequency.value = f;
      const g = ctx.createGain(); env(g, t0 + dt, 0.01, 0.09, 1.4);
      o.connect(g).connect(master);
      o.start(t0 + dt); o.stop(t0 + dt + 1.5);
    });
  }

  /* ---------- celebration: rising arps + sparkles + happy resolve ---------- */
  function celebrate() {
    if (!ensure() || muted) return;
    const t0 = ctx.currentTime;
    /* warm major chord bed */
    [261.63, 329.63, 392.0].forEach((f, i) => {
      const o = ctx.createOscillator(); o.type = "triangle"; o.frequency.value = f;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.linearRampToValueAtTime(0.09, t0 + 0.4 + i * 0.05);
      g.gain.linearRampToValueAtTime(0.0001, t0 + 3.4);
      o.connect(g).connect(master);
      o.start(t0); o.stop(t0 + 3.5);
    });
    /* joyful ascending runs (two octaves) */
    const run = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.7, 1318.5];
    for (let r = 0; r < 2; r++) {
      run.forEach((f, i) => {
        const dt = 0.3 + r * 1.15 + i * 0.09;
        const o = ctx.createOscillator(); o.type = "sine"; o.frequency.value = f;
        const g = ctx.createGain(); env(g, t0 + dt, 0.012, 0.085, 0.55);
        o.connect(g).connect(master);
        o.start(t0 + dt); o.stop(t0 + dt + 0.6);
      });
    }
    /* sparkle shimmer */
    const src = ctx.createBufferSource(); src.buffer = noiseBuffer(3.2);
    const hp = ctx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 4200;
    const g2 = ctx.createGain();
    g2.gain.setValueAtTime(0.0001, t0);
    g2.gain.linearRampToValueAtTime(0.05, t0 + 1.0);
    g2.gain.linearRampToValueAtTime(0.0001, t0 + 3.2);
    src.connect(hp).connect(g2).connect(master);
    src.start(t0); src.stop(t0 + 3.3);
    /* happy resolve chime */
    [[1046.5, 2.9], [1318.5, 3.05]].forEach(([f, dt]) => {
      const o = ctx.createOscillator(); o.type = "sine"; o.frequency.value = f;
      const g = ctx.createGain(); env(g, t0 + dt, 0.01, 0.09, 1.2);
      o.connect(g).connect(master);
      o.start(t0 + dt); o.stop(t0 + dt + 1.3);
    });
  }

  /* ---------- ambient SFX (soft, on sfxBus) ---------- */

  /* filtered noise sweep — camera flights, transitions */
  function whoosh(dur = 0.9) {
    if (!ctx || muted) return;
    const t0 = ctx.currentTime;
    const src = ctx.createBufferSource(); src.buffer = noiseBuffer(dur);
    const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.Q.value = 1.1;
    bp.frequency.setValueAtTime(220, t0);
    bp.frequency.exponentialRampToValueAtTime(1900, t0 + dur * 0.55);
    bp.frequency.exponentialRampToValueAtTime(320, t0 + dur);
    const g = ctx.createGain(); env(g, t0, dur * 0.4, 0.16, dur * 0.6);
    src.connect(bp).connect(g).connect(sfxBus);
    src.start(t0); src.stop(t0 + dur + 0.05);
  }

  /* glass tap — panels appearing */
  function paper() {
    if (!ctx || muted) return;
    const t0 = ctx.currentTime;
    [[1800, 0], [2400, 0.06]].forEach(([f, dt]) => {
      const o = ctx.createOscillator(); o.type = "sine"; o.frequency.value = f;
      const g = ctx.createGain(); env(g, t0 + dt, 0.004, 0.05, 0.25);
      o.connect(g).connect(sfxBus);
      o.start(t0 + dt); o.stop(t0 + dt + 0.3);
    });
  }

  /* soft nib — counters writing */
  function ink() {
    if (!ctx || muted) return;
    pop(880);
  }

  /* soft thud — pins dropping */
  function thud() {
    if (!ctx || muted) return;
    const t0 = ctx.currentTime;
    const o = ctx.createOscillator(); o.type = "sine";
    o.frequency.setValueAtTime(130, t0);
    o.frequency.exponentialRampToValueAtTime(42, t0 + 0.16);
    const g = ctx.createGain(); env(g, t0, 0.008, 0.4, 0.18);
    o.connect(g).connect(sfxBus);
    o.start(t0); o.stop(t0 + 0.2);
  }

  /* kept for compatibility */
  function stamp() { thud(); paper(); }

  /* small pop — counters, waypoints */
  function pop(f = 640) {
    if (!ctx || muted) return;
    const t0 = ctx.currentTime;
    const o = ctx.createOscillator(); o.type = "sine";
    o.frequency.setValueAtTime(f, t0);
    o.frequency.exponentialRampToValueAtTime(f * 1.5, t0 + 0.05);
    const g = ctx.createGain(); env(g, t0, 0.005, 0.08, 0.09);
    o.connect(g).connect(sfxBus);
    o.start(t0); o.stop(t0 + 0.1);
  }

  /* two-note chime — new section reached */
  function chime() {
    if (!ctx || muted) return;
    const t0 = ctx.currentTime;
    [[660, 0], [990, 0.13]].forEach(([f, dt]) => {
      const o = ctx.createOscillator(); o.type = "triangle"; o.frequency.value = f;
      const g = ctx.createGain(); env(g, t0 + dt, 0.01, 0.07, 0.5);
      o.connect(g).connect(sfxBus);
      o.start(t0 + dt); o.stop(t0 + dt + 0.55);
    });
  }

  /* night crickets — S7 annexure */
  function birds() {
    if (!ctx || muted) return;
    const t0 = ctx.currentTime;
    [[3400, 0], [3800, 0.22], [3100, 0.5]].forEach(([f, dt]) => {
      const o = ctx.createOscillator(); o.type = "sine";
      o.frequency.setValueAtTime(f, t0 + dt);
      o.frequency.exponentialRampToValueAtTime(f * 0.72, t0 + dt + 0.07);
      const g = ctx.createGain(); env(g, t0 + dt, 0.01, 0.03, 0.09);
      o.connect(g).connect(sfxBus);
      o.start(t0 + dt); o.stop(t0 + dt + 0.12);
    });
  }

  /* kept for compatibility (rain removed) */
  function rainStart() {}
  function rainStop() {}

  function toggleMute() {
    muted = !muted;
    if (master) master.gain.value = muted ? 0 : (window.THEME.audio.master || 0.5);
    if (muted) musicStop(0.2);
    return muted;
  }
  function isMuted() { return muted; }

  return { unlock, whoosh, paper, ink, thud, stamp, pop, chime, birds, rainStart, rainStop, slap: paper, toggleMute, isMuted, musicStart, musicStop, begin, celebrate,
    get musicPlaying() { return !!musicTimer && !!ctx && ctx.state === "running"; } };
})();
window.Sfx = Sfx;
