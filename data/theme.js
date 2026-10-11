/* ============ theme.js — look & feel knobs ============ */
/* Emerald Studio on warm dusk: dark cream-brown-yellow upper sky,
   dark moss terrain below. Palette stays in sync with css/style.css. */
window.BEATS = [];   /* scene files register their beats here at load time */
window.THEME = {
  colors: {
    ink: 0x0A1410, inkSoft: 0x15251D, inkTeal: 0x1C3328,
    paper1: 0x14281E, paper2: 0x102018, paper3: 0x0C1A14,
    olive: 0x2E4A3A, olive2: 0x24392D,
    rust: 0xC97B4A, rust2: 0xA85C38,
    green: 0x3DFFA8, green2: 0x2BD489,
    accent: 0x3DFFA8, accent2: 0xFFD97A, warm: 0xFFD97A,
    ground: 0x14281E,
    skin: 0xB07A4E, hair: 0x14100C, kurta: 0x24406B, journal: 0x8A5A3A
  },
  /* evening moods — dark CREAMY upper sky (amber-cream, never night-blue),
     dark moss terrain below gives the sunset contrast */  moods: {
    kerala:  { bg: 0x8A6E3E, fog: 0x96794A, sun: 0xFFE9B0, sunI: 0.9,  hemiI: 0.55, fogNear: 42, fogFar: 150 },
    travel:  { bg: 0x7E653A, fog: 0x8A7044, sun: 0xFFE2A0, sunI: 0.82, hemiI: 0.52, fogNear: 42, fogFar: 150 },
    dust:    { bg: 0x8A7244, fog: 0x967C4C, sun: 0xFFD98C, sunI: 0.75, hemiI: 0.5,  fogNear: 36, fogFar: 140 },
    village: { bg: 0x856C3E, fog: 0x91784A, sun: 0xFFDD96, sunI: 0.85, hemiI: 0.54, fogNear: 36, fogFar: 140 },
    cool:    { bg: 0x6E5A38, fog: 0x7A6440, sun: 0xF2D89A, sunI: 0.62, hemiI: 0.48, fogNear: 32, fogFar: 130 },
    dawn:    { bg: 0x9A7C42, fog: 0xA6854C, sun: 0xFFD97A, sunI: 1.2,  hemiI: 0.62, fogNear: 44, fogFar: 165 },
    night:   { bg: 0x54452A, fog: 0x5E4E30, sun: 0xE8CE96, sunI: 0.5,  hemiI: 0.48, fogNear: 28, fogFar: 115 }
  },
  speed: { flight: 3.0, panel: 0.9 },   /* seconds */
  audio: { master: 0.9, music: 0.22 },  /* gentle hero music */
  debug: { fallback: /fallback=1/.test(location.search) }
};
