/* ============================================================
   character.js — "The Fellow": a cartoonish 3D character built
   from the field-fellow reference — navy formal shirt, khaki
   MNCH vest, FIELD FELLOW lanyard, backpack + bottle, folder
   with sticky tabs, watch, curly hair + beard. Poses:
   sit / stand / walk / huddle. (Rebuilt from scratch.)
   ============================================================ */
const Fellow = (() => {
  const W = window.World;
  let g, parts = {}, inWorld = false;
  let mode = "stand";      /* sit | stand | walk | huddle */
  let t = 0;

  /* palette from the reference */
  const SKIN = 0xB07A4E, HAIR = 0x14100C, HAIR2 = 0x241C14;
  const NAVY = 0x2E4A78, NAVY_D = 0x24406B;
  const VEST = 0xC9B98A, VEST_D = 0xB2A474;
  const OLIVE = 0x6E6A4E, OLIVE_D = 0x5C5840;
  const BLACK = 0x232320, STEEL = 0x3E6E8C, PAPER = 0xF2EFE2;
  const LANYARD = 0x2E6BC4;

  function outline(mesh, scale) {
    const o = new THREE.Mesh(mesh.geometry, new THREE.MeshBasicMaterial({ color: 0x05070F, side: THREE.BackSide }));
    o.scale.setScalar(Math.min(scale || 1.045, 1.08));
    mesh.add(o);
    return mesh;
  }

  function build() {
    if (inWorld || W.fallback) return;
    g = new THREE.Group();

    /* ---------------- legs: olive cargo trousers + boots ---------------- */
    parts.legs = [];
    [-0.135, 0.135].forEach((lx) => {
      const hip = new THREE.Group();
      hip.position.set(lx, 0.88, 0);
      const thigh = outline(new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.085, 0.44, 7), W.toon(OLIVE)));
      thigh.position.y = -0.22; hip.add(thigh);
      /* cargo pocket */
      const cargo = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.16, 0.14), W.toon(OLIVE_D));
      cargo.position.set(lx < 0 ? -0.10 : 0.10, -0.20, 0.02); hip.add(cargo);
      const shin = outline(new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.072, 0.28, 7), W.toon(OLIVE)));
      shin.position.y = -0.58; hip.add(shin);
      /* boots */
      const boot = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.068, 0.24, 7), W.toon(0x2A2622));
      boot.position.y = -0.84; hip.add(boot);
      const foot = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.09, 0.34), W.toon(0x2A2622));
      foot.position.set(0, -0.98, 0.07); hip.add(foot);
      g.add(hip);
      parts.legs.push(hip);
    });

    /* ---------------- torso: navy formal shirt ---------------- */
    const shirt = outline(new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.27, 0.80, 9), W.toon(NAVY)));
    shirt.position.y = 1.28; g.add(shirt);
    const hem = new THREE.Mesh(new THREE.CylinderGeometry(0.275, 0.26, 0.09, 9), W.toon(NAVY_D));
    hem.position.y = 0.90; g.add(hem);
    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.10, 0.03, 6, 14), W.toon(NAVY_D));
    collar.position.y = 1.66; collar.rotation.x = Math.PI / 2; g.add(collar);
    /* button placket + buttons */
    const placket = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.66, 0.015), W.toon(NAVY_D));
    placket.position.set(0, 1.30, 0.245); g.add(placket);
    [1.52, 1.34, 1.16, 0.98].forEach(by => {
      const btn = new THREE.Mesh(new THREE.SphereGeometry(0.015, 6, 6), new THREE.MeshBasicMaterial({ color: 0xCBD8E8 }));
      btn.position.set(0, by, 0.26); g.add(btn);
    });

    /* ---------------- khaki field vest (sleeveless, over shirt) ---------------- */
    const vestBack = outline(new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.56, 0.06), W.toon(VEST)));
    vestBack.position.set(0, 1.32, -0.225); g.add(vestBack);
    [-0.155, 0.155].forEach(vx => {
      const panel = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.56, 0.05), W.toon(VEST));
      panel.position.set(vx, 1.32, 0.20);
      panel.rotation.y = vx < 0 ? 0.16 : -0.16;   /* hug the torso curve */
      g.add(panel);
      const pocket = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.13, 0.03), W.toon(VEST_D));
      pocket.position.set(vx * 0.92, 1.14, 0.245);
      pocket.rotation.y = vx < 0 ? 0.16 : -0.16;
      g.add(pocket);
      const flap = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.035, 0.04), W.toon(0xA2945F));
      flap.position.set(vx * 0.92, 1.215, 0.25);
      flap.rotation.y = vx < 0 ? 0.16 : -0.16;
      g.add(flap);
    });
    /* shoulder yokes joining the panels */
    [-0.10, 0.10].forEach(vx => {
      const yoke = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.10, 0.05), W.toon(VEST));
      yoke.position.set(vx, 1.58, 0); g.add(yoke);
    });
    /* MNCH patch — navy rectangle with white text (canvas) */
    const patchTex = W.textTexture(["MNCH"], { w: 128, h: 96, bigSize: 42, bg: "#1C2C4E", color: "#EAF2FF" });
    const patch = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 0.11),
      new THREE.MeshBasicMaterial({ map: patchTex }));
    patch.position.set(0.148, 1.40, 0.252);
    patch.rotation.y = -0.16; g.add(patch);

    /* ---------------- blue lanyard + FIELD FELLOW ID card ---------------- */
    [-0.07, 0.07].forEach(lx => {
      const strap = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.34, 0.012), W.toon(LANYARD));
      strap.position.set(lx * 0.6, 1.46, 0.26);
      strap.rotation.z = lx < 0 ? 0.16 : -0.16;
      g.add(strap);
    });
    const cardTex = W.textTexture(["FIELD", "FELLOW"], { w: 128, h: 160, bigSize: 30, smallSize: 26, bg: "#F4F7FB", color: "#1C2C4E" });
    const card = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.22, 0.015), W.toon(PAPER));
    card.position.set(0, 1.20, 0.28); g.add(card);
    const cardFace = new THREE.Mesh(new THREE.PlaneGeometry(0.165, 0.215),
      new THREE.MeshBasicMaterial({ map: cardTex }));
    cardFace.position.set(0, 1.20, 0.289); g.add(cardFace);
    const clip = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.03, 0.02), W.toon(0x4A4A48));
    clip.position.set(0, 1.325, 0.275); g.add(clip);

    /* ---------------- arms: navy sleeves, skin forearms ---------------- */
    parts.arms = [];
    [-1, 1].forEach(side => {
      const sh = new THREE.Group();
      sh.position.set(side * 0.26, 1.60, 0);
      const upper = outline(new THREE.Mesh(new THREE.CylinderGeometry(0.064, 0.058, 0.34, 7), W.toon(NAVY)));
      upper.position.y = -0.17; sh.add(upper);
      const fore = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.046, 0.30, 7), W.toon(SKIN));
      fore.position.y = -0.51; sh.add(fore);
      const hand = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), W.toon(SKIN));
      hand.position.y = -0.68; sh.add(hand);
      /* wristwatch on the left wrist */
      if (side < 0) {
        const watch = new THREE.Mesh(new THREE.TorusGeometry(0.052, 0.014, 6, 14), W.toon(0x1A1A18));
        watch.rotation.x = Math.PI / 2;
        watch.position.y = -0.44; sh.add(watch);
      }
      g.add(sh);
      parts.arms.push(sh);
    });

    /* ---------------- head: curly hair, beard, ears ---------------- */
    const headG = new THREE.Group();
    headG.position.y = 2.0;
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 14, 12), W.toon(SKIN));
    head.scale.set(0.94, 1.04, 0.98);
    headG.add(head); outline(head, 1.05);
    [-0.062, 0.062].forEach(ex => {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.021, 6, 6), new THREE.MeshBasicMaterial({ color: 0x14100C }));
      eye.position.set(ex, 0.02, 0.155); headG.add(eye);
      const b = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.012, 0.012), new THREE.MeshBasicMaterial({ color: HAIR }));
      b.position.set(ex, 0.07, 0.163); headG.add(b);
    });
    /* short beard — flattened jaw patch (reads as stubble, not a floating band) */
    const beard = new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 10), W.toon(HAIR2));
    beard.position.set(0, -0.075, 0.045);
    beard.scale.set(0.82, 0.52, 0.62);
    headG.add(beard);
    /* ears */
    [-0.175, 0.175].forEach(ex => {
      const ear = new THREE.Mesh(new THREE.SphereGeometry(0.034, 6, 6), W.toon(SKIN));
      ear.position.set(ex, 0, 0); ear.scale.set(0.5, 1, 0.8);
      headG.add(ear);
    });
    /* curly black hair — clustered puffs */
    const curls = [[0, 0.15, 0.03], [0.09, 0.13, 0.01], [-0.09, 0.14, 0.01], [0.13, 0.09, -0.02],
      [-0.13, 0.10, -0.02], [0.05, 0.17, -0.08], [-0.05, 0.17, -0.08], [0, 0.12, -0.13],
      [0.11, 0.05, -0.10], [-0.11, 0.05, -0.10], [0.02, 0.09, 0.13], [0.15, 0.03, 0.05], [-0.15, 0.03, 0.05]];
    curls.forEach(hp => {
      const h = new THREE.Mesh(new THREE.SphereGeometry(0.055 + Math.random() * 0.025, 8, 6), W.toon(HAIR));
      h.position.set(hp[0], hp[1], hp[2]);
      headG.add(h);
    });
    /* glasses (appear in S6 — the "two lenses" moment) */
    const glasses = new THREE.Group();
    [-0.07, 0.07].forEach(gx => {
      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.008, 6, 18), new THREE.MeshBasicMaterial({ color: 0x2E3B35 }));
      rim.position.set(gx, 0.02, 0.17);
      glasses.add(rim);
    });
    const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.008, 0.008), new THREE.MeshBasicMaterial({ color: 0x2E3B35 }));
    bridge.position.set(0, 0.028, 0.172);
    glasses.add(bridge);
    glasses.visible = false;
    headG.add(glasses);
    parts.glasses = glasses;
    parts.head = headG;
    g.add(headG);

    /* ---------------- black backpack + bottle ---------------- */
    const pack = outline(new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.48, 0.20), W.toon(BLACK)));
    pack.position.set(0, 1.30, -0.33); g.add(pack);
    const packLid = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.16, 0.05), W.toon(0x2E2E2A));
    packLid.position.set(0, 1.46, -0.42); g.add(packLid);
    const handle = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.014, 5, 12, Math.PI), W.toon(0x2E2E2A));
    handle.position.set(0, 1.56, -0.36); handle.rotation.y = Math.PI / 2; g.add(handle);
    /* bottle in the side pocket */
    const bottle = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.20, 8), W.toon(STEEL));
    bottle.position.set(0.22, 1.22, -0.30); g.add(bottle);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.05, 8), W.toon(0x1E3A50));
    cap.position.set(0.22, 1.345, -0.30); g.add(cap);
    /* both shoulder straps */
    [-0.115, 0.115].forEach(sx => {
      const st = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.40, 0.03), W.toon(0x1C1C1A));
      st.position.set(sx, 1.36, 0.25);
      st.rotation.x = -0.05;
      g.add(st);
    });

    /* ---------------- folder under the right arm + sticky tabs ---------------- */
    const folder = new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.40, 0.05), W.toon(0x35383C));
    folder.position.set(0.33, 1.06, 0.14);
    folder.rotation.z = 0.12;
    g.add(folder); outline(folder, 1.04);
    ["#FF9FBE", "#9FE8A8", "#FFE28A"].forEach((c, i) => {
      const tab = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.045, 0.055), new THREE.MeshBasicMaterial({ color: c }));
      tab.position.set(0.24 + i * 0.045, 1.27 - i * 0.02, 0.15);
      g.add(tab);
    });

    g.position.set(1.25, 0.58, -2.35);   /* seated on the bench by default */
    g.rotation.y = 0.55;
    W.scene.add(g);
    inWorld = true;
    pose("sit");
  }

  function pose(m) {
    mode = m;
    if (!inWorld) return;
    if (m === "sit") {
      parts.legs.forEach(l => gsap.to(l.rotation, { x: -1.45, duration: 0.6 }));
      parts.arms.forEach((a, i) => gsap.to(a.rotation, { x: 0.75, z: i ? -0.25 : 0.25, duration: 0.6 }));
    } else if (m === "stand") {
      parts.legs.forEach(l => gsap.to(l.rotation, { x: 0, duration: 0.6 }));
      parts.arms.forEach((a, i) => gsap.to(a.rotation, { x: 0, z: i ? -0.12 : 0.12, duration: 0.6 }));
    } else if (m === "walk") {
      parts.legs.forEach(l => gsap.to(l.rotation, { x: 0, duration: 0.3 }));
      parts.arms.forEach((a, i) => gsap.to(a.rotation, { x: 0, z: i ? -0.12 : 0.12, duration: 0.3 }));
    } else if (m === "huddle") {
      parts.legs.forEach(l => gsap.to(l.rotation, { x: -0.25, duration: 0.6 }));
      parts.arms.forEach((a, i) => gsap.to(a.rotation, { x: 1.15, z: i ? -0.55 : 0.55, duration: 0.6 }));
    }
  }

  function showGlasses(on) {
    if (!inWorld || !parts.glasses) return;
    parts.glasses.visible = true;
    parts.glasses.scale.setScalar(on ? 1 : 0.01);
    if (on) gsap.to(parts.glasses.scale, { x: 1, y: 1, z: 1, duration: 0.7, ease: "back.out(2)" });
  }

  function place(x, y, z, ry, instant) {
    if (!inWorld) return;
    if (instant) { g.position.set(x, y, z); g.rotation.y = ry; }
    else {
      gsap.to(g.position, { x, y, z, duration: 1.2, ease: "power2.inOut" });
      gsap.to(g.rotation, { y: ry, duration: 1.2 });
    }
  }

  function update(dt) {
    if (!inWorld || W.fallback) return;
    t += dt;
    /* gentle idle for all modes */
    parts.head.rotation.z = Math.sin(t * 0.8) * 0.03;
    if (mode === "walk") {
      const s = Math.sin(t * 7);
      parts.legs[0].rotation.x = s * 0.55;
      parts.legs[1].rotation.x = -s * 0.55;
      parts.arms[0].rotation.x = -s * 0.4;
      parts.arms[1].rotation.x = s * 0.4;
      g.position.y = 0.02 * Math.abs(Math.cos(t * 7));
    } else if (mode === "sit") {
      /* writing hand flicker */
      parts.arms[0].rotation.x = 0.75 + Math.sin(t * 2.4) * 0.06;
    } else if (mode === "stand") {
      g.position.y = Math.sin(t * 1.6) * 0.008;
    }
  }

  return { build, pose, place, update, showGlasses, get obj() { return g; }, get mode() { return mode; } };
})();
window.Fellow = Fellow;
