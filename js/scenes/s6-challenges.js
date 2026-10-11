/* ============================================================
   s6-challenges.js — S6 CHALLENGES & CHANGES: a mild overcast
   (presentation-safe — no storm, no rain), the complete
   challenges panel, then the sunrise + lenses + quotes.
   ============================================================ */
const S6 = (() => {
  const W = window.World, C = window.JOURNEY_CONTENT;
  let built = false, lamp1, lamp2, sproutArr = [], hindiBoards = [], books = [];

  function build() {
    if (built || W.fallback) return;
    built = true;
    W.tree(-8.0, -262, 1.1, false); W.tree(8.4, -270, 1.0, true);
    W.palm(7.0, -282, 1.1); W.palm(-7.6, -290, 1.2);
    W.hill(-30, -300, 9, 0x121E40); W.hill(30, -308, 10, 0x0C1A14);
    W.rock(4.8, -266, 0.3); W.rock(-5.4, -278, 0.26); W.rock(6.2, -296, 0.32);
    lamp1 = W.lamppost(-4.2, -318);
    lamp2 = W.lamppost(4.4, -330);
    W.tree(-8.5, -324, 1.0, false); W.tree(8.2, -336, 0.95, true);
    W.hill(-28, -348, 9, 0x162E22); W.hill(30, -356, 8, 0x14281E);
    sproutArr = W.sprouts(-312, -344);
    /* the language barrier: Hindi letter boards he could not read */
    [["स्वास्थ्य", -6.8, -266], ["समझ नहीं आया", 6.8, -276], ["रिपोर्ट", -6.4, -292]].forEach(([txt, bx, bz]) => {
      const tex = W.textTexture([txt], { w: 512, h: 160, bigSize: 78, bg: "#3A3120", color: "#FFE9B8" });
      const aspect = tex.image.height / tex.image.width;
      const w = 2.6, h = w * aspect;
      const board = new THREE.Mesh(new THREE.PlaneGeometry(w, h),
        new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide }));
      board.position.set(bx, 1.9, bz);
      board.rotation.y = bx < 0 ? 0.4 : -0.4;
      board.scale.setScalar(0.01);
      W.scene.add(board);
      hindiBoards.push(board);
    });
    /* the new world of books and notes to study */
    books.push(W.bookStack(-5.6, -270));
    books.push(W.bookStack(6.4, -284));
    books.push(W.bookStack(-5.0, -300));
  }

  function beats() {
    return [
      /* B1 — overcast + complete challenges panel */
      {
        id: "challenges",
        title: "Challenges",
        run: () => {
          const tl = gsap.timeline();
          build();
          if (W.ready) {
            Sfx.whoosh();
            W.setMood("cool", 2.4);
            Fellow.pose("walk");
            Fellow.place(-0.8, 0, -256, 0.25, false);
            W.fly(tl, [2.5, 5.0, -252], [0, 1.0, -270], 3.2);
            W.drawPathToZ(-296, 2.8);
          }
          tl.add(() => {
            Overlay.show(Overlay.T.challengesAll(C), { pos: "pos-wide" });
            Sfx.paper();
            if (W.ready) {
              hindiBoards.forEach((b, i) => {
                gsap.to(b.scale, { x: 1, y: 1, z: 1, duration: 0.7, ease: "back.out(1.8)", delay: 0.6 + i * 0.3 });
                tl.add(() => Sfx.pop(480 + i * 70), 0.6 + i * 0.3);
              });
              books.forEach((b, i) => {
                gsap.fromTo(b.scale, { x: 0.01, y: 0.01, z: 0.01 },
                  { x: 1, y: 1, z: 1, duration: 0.5, ease: "back.out(2)", delay: 1.2 + i * 0.25 });
              });
            }
          }, W.fallback ? 0.3 : 2.0);
          return tl;
        }
      },
      /* B2 — THE SUNRISE + the two lenses */
      {
        id: "sunrise",
        title: "☀ The sunrise",
        run: () => {
          const tl = gsap.timeline();
          if (W.ready) {
            Sfx.whoosh();
            Sfx.chime();
            W.setMood("dawn", 4.0);
            Fellow.pose("stand");
            Fellow.place(0.6, 0, -314, -0.4, false);
            gsap.to(W.sunDisc.material, { opacity: 0.95, duration: 3.0, delay: 0.8 });
            gsap.to(W.sunDisc.position, { y: 7.5, duration: 4.5, ease: "power1.out", delay: 0.6 });
            sproutArr.forEach((s, i) => {
              gsap.to(s.scale, { x: 1, y: 1, z: 1, duration: 0.8, ease: "back.out(2.2)", delay: 2.2 + i * 0.09 });
            });
            W.drawPathToZ(-340, 2.6);
            W.fly(tl, [4.5, 4.0, -306], [0, 2.0, -320], 5.0, "power1.inOut");
          }
          tl.add(() => {
            Overlay.show(Overlay.T.lens(C), { pos: "pos-hero" });
            if (W.ready) Fellow.showGlasses(true);
          }, W.fallback ? 0.3 : 3.4);
          return tl;
        }
      },
      /* B3 — settle */
      {
        id: "s6-settle",
        title: "Settle",
        run: () => {
          const tl = gsap.timeline();
          if (W.ready) {
            W.drawPathToZ(-362, 1.6);
            W.fly(tl, [3.0, 5.5, -336], [0, 1.0, -356], 2.6);
            Sfx.whoosh();
          }
          return tl;
        }
      }
    ];
  }

  return { beats, build };
})();
window.BEATS.push({ scene: "s6", beats: S6.beats() });
