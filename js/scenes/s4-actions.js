/* ============================================================
   s4-actions.js — S4 COVERED ACTIONS & STAKEHOLDERS: village
   assembles, then the actions panel, then the stakeholders panel.
   ============================================================ */
const S4 = (() => {
  const W = window.World, C = window.JOURNEY_CONTENT;
  let built = false, chc, office, meet, huts = [], awcs = [], people = [];

  function build() {
    if (built || W.fallback) return;
    built = true;
    chc = W.healthCenter(6.5, -148, -0.5);
    W.label(6.5, -148, 4.4, "CHC Hospital", 1.0);
    [[-6.5, -144], [-8.5, -150], [-4.5, -154], [3.5, -156], [-7.0, -160], [5.0, -162]].forEach(([hx, hz], i) => {
      huts.push(W.hut(hx, hz, 0.8 + (i % 3) * 0.12, i % 2 ? 0x8A4A30 : 0x8A4A30));
    });
    [[-3.0, -146], [4.0, -151], [-5.5, -166]].forEach(([ax, az]) => {
      awcs.push(W.hut(ax, az, 0.55, 0x2E5E46));
    });
    W.label(-5.5, -166, 2.2, "Anganwadi Centre", 0.7);
    office = W.blockOffice(-11.5, -156, 0.55);
    meet = W.pandal(10.5, -166, -0.4, "Sahiya Meeting");
    /* the stakeholders themselves — people standing by their places */
    const roster = [
      [-2.2, -143, 0xC97B4A, "Sahiya"],
      [-6.2, -147, 0x3E6E5C, "ANM"],
      [2.6, -149, 0xB05F35, "AWW / Sevika"],
      [-9.6, -152, 0x55684A, "Mukhiya"],
      [8.2, -163, 0xC97B4A, "Sahiya Sathi"],
      [-3.2, -161, 0x3E6E5C, "CHO"],
      [12.0, -160, 0x55684A, "BPM"],
      [-8.0, -164, 0xB05F35, "BDM"]
    ];
    roster.forEach(([px, pz, col, name], i) => {
      people.push({ g: W.person(px, pz, col, Math.PI + (i % 3) * 0.5), name, px, pz });
    });
    people.forEach(p => W.label(p.px, p.pz - 0.4, 1.85, p.name, 0.52));
    W.tree(-10, -152, 1.1, false); W.tree(10.5, -158, 0.95, true);
    W.tree(-9, -168, 0.9, true);
    W.hill(-30, -176, 8, 0x162E22); W.hill(28, -184, 9, 0x14281E);
  }

  function popVillage(tl) {
    if (!W.ready) return;
    gsap.set([chc, ...huts, ...awcs].map(o => o.scale), { x: 0.01, y: 0.01, z: 0.01 });
    [chc, ...huts, ...awcs].forEach((o, i) => {
      gsap.to(o.scale, { x: 1, y: 1, z: 1, duration: 0.65, ease: "back.out(1.8)", delay: 0.3 + i * 0.14 });
    });
    [office, meet].forEach((o, i) => {
      gsap.fromTo(o.scale, { x: 0.01, y: 0.01, z: 0.01 },
        { x: 1, y: 1, z: 1, duration: 0.7, ease: "back.out(1.6)", delay: 1.6 + i * 0.25 });
    });
  }

  function beats() {
    return [
      /* B1 — village assembles + the actions panel */
      {
        id: "actions",
        title: "Covered actions",
        run: () => {
          const tl = gsap.timeline();
          build();
          if (W.ready) {
            Sfx.whoosh();
            W.setMood("village");
            W.drawPathToZ(-140, 2.2);
            popVillage(tl);
            W.fly(tl, [2.5, 6.5, -136], [0, 1.2, -154], 3.4);
            Fellow.pose("walk");
            Fellow.place(-1.5, 0, -142, 0.35, false);
          }
          tl.add(() => {
            Overlay.show(Overlay.T.actionsAll(C), { pos: "pos-wide" });
            Sfx.paper();
          }, W.fallback ? 0.3 : 2.0);
          return tl;
        }
      },
      /* B2 — stakeholders, their own stop: the people appear with labels */
      {
        id: "stakeholders",
        title: "Stakeholders met",
        run: () => {
          const tl = gsap.timeline();
          if (W.ready) {
            Sfx.chime();
            Fellow.pose("stand");
            Fellow.place(-1.0, 0, -158, 0.2, false);
            W.fly(tl, [0, 7.5, -150], [0, 1.0, -162], 2.8);
            people.forEach((p, i) => {
              gsap.to(p.g.scale, { x: 1, y: 1, z: 1, duration: 0.6, ease: "back.out(2)", delay: 1.2 + i * 0.18 });
              tl.add(() => Sfx.pop(560 + i * 45), 1.2 + i * 0.18);
            });
          }
          tl.add(() => {
            Overlay.show(Overlay.T.stakeholders(C), { pos: "pos-wide" });
            Sfx.paper();
          }, W.fallback ? 0.3 : 1.8);
          return tl;
        }
      },
      /* B3 — settle */
      {
        id: "s4-settle",
        title: "Settle",
        run: () => {
          const tl = gsap.timeline();
          if (W.ready) {
            W.fly(tl, [3.0, 6.5, -168], [0, 0.8, -186], 2.6);
            W.drawPathToZ(-186, 1.6);
            Sfx.whoosh();
          }
          return tl;
        }
      }
    ];
  }

  return { beats, build };
})();
window.BEATS.push({ scene: "s4", beats: S4.beats() });
