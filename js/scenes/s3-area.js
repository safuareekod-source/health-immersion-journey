/* ============================================================
   s3-area.js — S3 AREA PROFILE: paper map unfolds, chip intro,
   then the complete panel: 52% highlight strip + all numbers.
   ============================================================ */
const S3 = (() => {
  const W = window.World, C = window.JOURNEY_CONTENT;
  let built = false, map, pins = [], village = [], chc;

  function build() {
    if (built || W.fallback) return;
    built = true;
    map = W.paperMap(0, -104);
    W.hill(-24, -112, 7, 0x16244A); W.hill(26, -116, 8, 0x16244A);
    W.hill(-30, -128, 9, 0x121E40); W.hill(31, -132, 7, 0x121E40);
    W.hill(0, -142, 10, 0x182A52);
    [[-5, -98], [4.5, -100], [-6.5, -108], [5.5, -109], [-3, -114], [3.2, -117]].forEach(([px, pz]) => {
      pins.push(W.pin(px, pz, 2.4, 0xA85C3A));
    });
    /* dense rural village around the map — many houses, lanes, trees */
    const huts = [
      [-10, -96, 0.9], [-12, -102, 0.8], [-9, -110, 1.0], [-13, -116, 0.85],
      [-10, -124, 0.9], [-14, -130, 0.8], [10, -97, 0.9], [13, -103, 0.8],
      [9.5, -111, 1.0], [13.5, -118, 0.85], [10, -125, 0.9], [14, -131, 0.8],
      [7, -134, 0.75], [-7, -135, 0.75]
    ];
    huts.forEach(([hx, hz, hs], i) => {
      village.push(W.hut(hx, hz, hs, i % 2 ? 0x8A4A30 : 0xA85C38));
    });
    /* the CHC Ramgarh stands in the village */
    chc = W.healthCenter(-17, -122, 0.5);
    W.label(-17, -122, 4.4, "CHC Ramgarh", 1.0);
    W.label(10, -111, 2.2, "Village", 0.6);
    W.tree(-11, -93, 1.0, true); W.tree(11, -92, 0.9, true);
    W.tree(-15, -134, 1.0, false); W.tree(15, -136, 0.9, true);
    W.rock(-6, -122, 0.3); W.rock(6.8, -97, 0.25);
    W.grass(-9, -100, 1, 5); W.grass(12, -112, 1, 5);
  }

  function beats() {
    return [
      /* B1 — map unfolds + short intro chip (projected center) */
      {
        id: "area-map",
        title: "Arrival — the map",
        run: () => {
          const tl = gsap.timeline();
          build();
          if (W.ready) {
            Sfx.whoosh();
            W.setMood("dust");
            W.drawPathToZ(-98, 2.0);
            W.fly(tl, [10, 9, -88], [0, 0, -106], 3.2);
            gsap.to(map.scale, { x: 1, y: 1, z: 1, duration: 1.8, ease: "power2.inOut", delay: 1.2 });
            /* the village rises around the map */
            gsap.set([...village, chc].map(o => o.scale), { x: 0.01, y: 0.01, z: 0.01 });
            [...village, chc].forEach((o, i) => {
              gsap.to(o.scale, { x: 1, y: 1, z: 1, duration: 0.55, ease: "back.out(1.8)", delay: 1.0 + i * 0.07 });
              if (i % 3 === 0) tl.add(() => Sfx.pop(520 + (i % 5) * 60), 1.0 + i * 0.07);
            });
          }
          tl.add(() => {
            Overlay.chip(C.areaProfile.place, C.areaProfile.intro);
            Sfx.paper();
          }, W.fallback ? 0.2 : 2.4);
          return tl;
        }
      },
      /* B2 — complete panel: highlight + every number */
      {
        id: "area-complete",
        title: "The block in numbers",
        run: () => {
          const tl = gsap.timeline();
          if (W.ready) {
            W.fly(tl, [6.5, 7.0, -90], [0, 0.5, -108], 2.6);
            Sfx.chime();
          }
          tl.add(() => {
            const el = Overlay.show(Overlay.T.areaComplete(C), { pos: "pos-right" });
            Overlay.countUp(el);
            Sfx.paper();
          }, W.fallback ? 0.3 : 1.6);
          if (W.ready) {
            pins.forEach((pin, i) => {
              gsap.to(pin.scale, { x: 1, y: 1, z: 1, duration: 0.5, ease: "back.out(2.4)", delay: 1.8 + i * 0.25 });
              tl.add(() => Sfx.pop(640 + i * 40), 1.8 + i * 0.25);
            });
          }
          return tl;
        }
      },
      /* B3 — settle: the Fellow overlooks the block */
      {
        id: "area-settle",
        title: "Settle",
        run: () => {
          const tl = gsap.timeline();
          if (W.ready) {
            Fellow.place(-2.5, 0, -96, 0.4, false);
            Fellow.pose("stand");
            W.fly(tl, [-6.5, 4.5, -90], [-2.0, 1.5, -100], 2.8);
            W.drawPathToZ(-118, 1.6);
            Sfx.whoosh();
          }
          return tl;
        }
      }
    ];
  }

  return { beats, build };
})();
window.BEATS.push({ scene: "s3", beats: S3.beats() });
