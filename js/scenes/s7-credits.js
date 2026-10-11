/* ============================================================
   s7-credits.js — S7 ANNEXURE / CREDITS: field notes floating
   as lit journal pages (one beat each), then the photo galleries
   (big DOM glass-framed images, crisp), thank-you, finale.
   Meme + thankYou text removed per request.
   ============================================================ */
const S7 = (() => {
  const W = window.World, C = window.JOURNEY_CONTENT;
  let built = false, noteMeshes = [], lamp;

  function build() {
    if (built || W.fallback) return;
    built = true;
    lamp = W.lamppost(-3.8, -392);
    /* dusk dressing */
    W.tree(-8.0, -386, 1.0, true); W.tree(8.2, -396, 0.9, true);
    W.hill(-30, -412, 9, 0x14281E); W.hill(30, -420, 10, 0x102018);
    W.rock(5.0, -388, 0.26);
    W.grass(-6.0, -392, 1.1, 6); W.grass(5.5, -398, 1.0, 5);
    /* notes floating at an angle, softly lit */
    C.annexure.notes.forEach((n, i) => {
      const m = W.notePlane(n.img, 2.1);
      m.position.set(-4.5 + i * 4.5, 3.1, -404 - (i % 2));
      m.rotation.set(-0.06, (i - 1) * -0.22, 0.03 * (i % 2 ? 1 : -1));
      m.scale.setScalar(0.01);
      W.scene.add(m);
      noteMeshes.push(m);
    });
  }

  function beats() {
    const A = C.annexure;
    const noteBeats = A.notes.map((n, i) => ({
      id: "note-" + i,
      title: "Field note " + (i + 1),
      run: () => {
        const tl = gsap.timeline();
        tl.add(() => {
          Overlay.show(Overlay.T.noteCaption(n, i, A.notes.length), { pos: i % 2 ? "pos-right" : "pos-left" });
          Sfx.paper();
          const m = noteMeshes[i];
          if (m && W.ready) {
            gsap.to(m.scale, { x: 1, y: 1, z: 1, duration: 0.8, ease: "back.out(1.7)" });
            gsap.fromTo(m.rotation, { y: m.rotation.y - 0.5 }, { y: m.rotation.y, duration: 0.8, ease: "power2.out" });
          }
        });
        if (W.ready) {
          W.fly(tl, [noteMeshes[i] ? noteMeshes[i].position.x + 1.5 : 0, 3.2, -398 - i], noteMeshes[i] ? [noteMeshes[i].position.x, 2.8, noteMeshes[i].position.z] : [0, 2, -404], 2.2, "power1.inOut");
        }
        return tl;
      }
    }));

    return [
      /* B1 — dusk settles, journal opens */
      {
        id: "s7-in",
        title: "Annexure",
        run: () => {
          const tl = gsap.timeline();
          build();
          if (W.ready) {
            Sfx.whoosh();
            W.setMood("night", 3.0);
            W.drawPathToZ(-388, 2.4);
            [lamp].forEach(l => {
              gsap.to([l.lt], { intensity: 1.6, duration: 1.8, delay: 1.2 });
              gsap.to([l.bulb.material], { opacity: 0.95, duration: 1.8, delay: 1.2 });
            });
            gsap.to(W.fireflies.material, { opacity: 0.5, duration: 2.0, delay: 1.6 });
            W.fireflies.visible = true;
            Fellow.pose("stand");
            Fellow.place(-1.2, 0, -388, 0.3, false);
            W.fly(tl, [2.0, 4.0, -382], [0, 2.0, -396], 3.4);
          }
          tl.add(() => {
            Overlay.chip(C.annexure.kicker, "field notes & photographs from the journey");
          }, W.fallback ? 0.3 : 2.2);
          return tl;
        }
      },
      ...noteBeats,
      /* the photo galleries — full width, two stops */
      {
        id: "gallery-1",
        title: "Meetings & community",
        run: () => {
          const tl = gsap.timeline();
          if (W.ready) {
            Sfx.chime();
            W.fly(tl, [0, 5.2, -378], [0, 3.0, -402], 3.0, "power1.inOut");
          }
          tl.add(() => {
            Overlay.show(Overlay.T.gallery(C, "gallery1", "1 of 2"), { pos: "pos-gallery" });
            Sfx.paper();
          }, W.fallback ? 0.3 : 1.8);
          return tl;
        }
      },
      {
        id: "gallery-2",
        title: "Facilities & fieldwork",
        run: () => {
          const tl = gsap.timeline();
          if (W.ready) {
            Sfx.chime();
            W.fly(tl, [-2, 5.0, -376], [0, 3.0, -404], 2.8, "power1.inOut");
          }
          tl.add(() => {
            Overlay.show(Overlay.T.gallery(C, "gallery2", "2 of 2"), { pos: "pos-gallery" });
            Sfx.paper();
          }, W.fallback ? 0.3 : 1.6);
          return tl;
        }
      },
      /* thank you — with celebration */
      {
        id: "thank",
        title: "Thank you",
        run: () => {
          const tl = gsap.timeline();
          if (W.ready) {
            Fellow.showGlasses(true);
            W.fly(tl, [2.2, 3.8, -382], [-1.4, 2.2, -392], 2.6);
          }
          tl.add(() => {
            Overlay.show(Overlay.T.thank(C), { pos: "pos-center" });
            Sfx.celebrate();
            Overlay.celebrate();
          }, W.fallback ? 0.3 : 1.8);
          return tl;
        }
      },
      /* finale */
      {
        id: "finale",
        title: "The end",
        run: () => {
          const tl = gsap.timeline();
          if (W.ready) {
            Fellow.showGlasses(true);
            W.drawPathToZ(-440, 3.0);
            W.fly(tl, [0, 8.5, -376], [0, 2.0, -420], 4.5, "power1.inOut");
            tl.add(() => Sfx.chime(), 2.2);
            tl.add(() => Sfx.birds(), 3.2);
          }
          tl.add(() => {
            Overlay.chip("The journey continues…", "thank you for walking it with me");
          }, W.fallback ? 0.3 : 3.0);
          return tl;
        }
      }
    ];
  }

  return { beats, build };
})();
window.BEATS.push({ scene: "s7", beats: S7.beats() });
