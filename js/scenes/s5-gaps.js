/* ============================================================
   s5-gaps.js — S5 GAPS & ACTIONS: cracks in the path, then the
   complete panel — every gap with the action taken, plus the
   planned way forward.
   ============================================================ */
const S5 = (() => {
  const W = window.World, C = window.JOURNEY_CONTENT;
  let built = false, cracks = [];

  function build() {
    if (built || W.fallback) return;
    built = true;
    const zs = [-192, -200, -208, -216, -224];
    zs.forEach(z => cracks.push(W.crack(0, z)));
    W.tree(-8.5, -196, 0.9, true); W.tree(8.0, -204, 0.9, true);
    W.tree(-7.5, -220, 1.0, false);
    W.hill(-28, -232, 8, 0x121E40); W.hill(27, -238, 9, 0x121E40);
    W.rock(5.5, -198, 0.28); W.rock(-6.0, -212, 0.24);
  }

  function beats() {
    return [
      /* B1 — arrive + complete gaps panel */
      {
        id: "gaps",
        title: "Gaps & actions",
        run: () => {
          const tl = gsap.timeline();
          build();
          if (W.ready) {
            Sfx.whoosh();
            W.setMood("cool");
            W.fly(tl, [2.0, 5.5, -184], [0, 0.6, -210], 3.2);
            Fellow.pose("walk");
            Fellow.place(-1.8, 0, -188, 0.3, false);
            W.drawPathToZ(-240, 3.4);
          }
          tl.add(() => {
            Overlay.show(Overlay.T.gapsAll(C), { pos: "pos-wide" });
            Sfx.paper();
            Sfx.chime();
          }, W.fallback ? 0.3 : 2.0);
          return tl;
        }
      },
      /* B2 — settle */
      {
        id: "s5-settle",
        title: "Settle",
        run: () => {
          const tl = gsap.timeline();
          if (W.ready) {
            Fellow.place(1.5, 0, -232, 0.0, false);
            W.fly(tl, [3.0, 6.0, -232], [0, 0.8, -252], 2.6);
            Sfx.whoosh();
          }
          return tl;
        }
      }
    ];
  }

  return { beats, build };
})();
window.BEATS.push({ scene: "s5", beats: S5.beats() });
