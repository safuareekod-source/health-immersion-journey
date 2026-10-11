/* ============================================================
   s2-objectives.js — S2 OBJECTIVES: the path leaves Kerala,
   signposts pop along it, the FULL objectives list shows at once.
   ============================================================ */
const S2 = (() => {
  const W = window.World, C = window.JOURNEY_CONTENT;
  let built = false, signs = [], aam;

  function build() {
    if (built || W.fallback) return;
    built = true;
    W.tree(-8.0, -30.0, 1.0, true); W.tree(8.5, -36.0, 0.9, true);
    W.palm(-7.0, -27.0, 1.0); W.palm(7.4, -42.0, 0.9);
    W.hill(-28, -75, 8, 0x14281E); W.hill(30, -88, 9, 0x102018);
    W.rock(-4.5, -38.0, 0.22); W.rock(5.2, -50.0, 0.25);
    /* world depth tied to content: AAM centre + anganwadi on the route */
    aam = W.blockOffice(9.5, -55, -0.5);
    W.label(9.5, -55, 4.6, "AAM Centre", 0.8);
    W.hut(-8.5, -58, 0.7, 0x2E5E46);
    W.label(-8.5, -58, 2.4, "Anganwadi", 0.65);
    const zs = [-16, -25, -34, -43, -52, -61];
    C.objectives.forEach((o, i) => {
      const side = (i % 2 ? 1 : -1);
      const tex = W.textTexture([o.title.split(" ").slice(0, 3).join(" ")], { w: 512, h: 160, bigSize: 64 });
      signs.push(W.signpost(side * 4.6, zs[i], tex, side * -0.5, 0.9));
    });
  }

  function beats() {
    return [
      /* B1 — the complete objectives panel; signposts pop in sequence */
      {
        id: "objectives",
        title: "Objectives",
        run: () => {
          const tl = gsap.timeline();
          build();
          if (W.ready) {
            Sfx.whoosh();
            W.setMood("travel");
            W.drawPathToZ(-70, 3.2);
            Fellow.pose("walk");
            Fellow.place(1.5, 0, -8.0, 0.2, false);
            W.fly(tl, [4.5, 5.2, -8.0], [0, 1.0, -26], 3.2, "power1.inOut");
            signs.forEach((sgn, i) => {
              tl.to(sgn.scale, { x: 1, y: 1, z: 1, duration: 0.7, ease: "back.out(2)" }, 1.0 + i * 0.3);
            });
          }
          tl.add(() => {
            Overlay.show(Overlay.T.objectives(C), { pos: "pos-wide" });
            Sfx.paper();
            Sfx.chime();
          }, W.fallback ? 0.2 : 1.4);
          return tl;
        }
      },
      /* B2 — settle + hand over to S3 */
      {
        id: "s2-settle",
        title: "Settle",
        run: () => {
          const tl = gsap.timeline();
          if (W.ready) {
            Fellow.place(1.0, 0, -56.0, 0.1, false);
            W.fly(tl, [3.0, 6.0, -52.0], [0, 0.8, -72.0], 2.6);
            Sfx.whoosh();
          }
          return tl;
        }
      }
    ];
  }

  return { beats, build };
})();
window.BEATS.push({ scene: "s2", beats: S2.beats() });
