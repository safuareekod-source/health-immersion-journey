/* ============================================================
   character.js — "The Fellow": toon primitives, ink outline,
   poses (sit / stand / walk / huddle), journal + umbrella + glasses.
   ============================================================ */
const Fellow = (() => {
  const W = window.World;
  const C = window.THEME.colors;
  let g, parts = {}, inWorld = false;
  let mode = "stand";      /* sit | stand | walk | huddle */
  let t = 0;

  function outline(mesh, scale) {
    /* soft ink outline — tight so it reads as a pen line, not a heavy border */
    const o = new THREE.Mesh(mesh.geometry, new THREE.MeshBasicMaterial({ color: 0x05070F, side: THREE.BackSide }));
    o.scale.setScalar(Math.min(scale || 1.045, 1.08));
    mesh.add(o);
  }

  function build() {
    if (inWorld || W.fallback) return;
    g = new THREE.Group();

    const KHAKI = 0xC4B896, KHAKI_D = 0xB0A480, TROUSER = 0x3E3E3A, BOOT = 0x201E1A, SKIN = 0xB07A4E;

    /* legs — field trousers tucked into rubber boots */
    parts.legs = [];
    [-0.135, 0.135].forEach((lx, i) => {
      const hip = new THREE.Group();
      hip.position.set(lx, 0.88, 0);
      const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.46, 7), W.toon(TROUSER));
      thigh.position.y = -0.23; hip.add(thigh); outline(thigh, 1.1);
      const shin = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.07, 0.30, 7), W.toon(TROUSER));
      shin.position.y = -0.60; hip.add(shin); outline(shin, 1.1);
      const boot = new THREE.Mesh(new THREE.CylinderGeometry(0.072, 0.065, 0.26, 7), W.toon(BOOT));
      boot.position.y = -0.87; hip.add(boot);
      const foot = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.09, 0.34), W.toon(BOOT));
      foot.position.set(0, -1.02, 0.07); hip.add(foot);
      g.add(hip);
      parts.legs.push(hip);
    });

    /* khaki field shirt — looser torso, chest pockets, rolled sleeves */
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.29, 0.80, 9), W.toon(KHAKI));
    torso.position.y = 1.28; g.add(torso); outline(torso, 1.06);
    const hem = new THREE.Mesh(new THREE.CylinderGeometry(0.29, 0.27, 0.10, 9), W.toon(KHAKI_D));
    hem.position.y = 0.88; g.add(hem);
    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.10, 0.028, 6, 14), W.toon(KHAKI_D));
    collar.position.y = 1.66; collar.rotation.x = Math.PI / 2;
    g.add(collar);
    /* chest pockets with flaps */
    [-0.12, 0.12].forEach(px => {
      const pocket = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.14, 0.02), W.toon(KHAKI_D));
      pocket.position.set(px, 1.42, 0.245); g.add(pocket);
      const flap = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.035, 0.03), W.toon(0x9C9070));
      flap.position.set(px, 1.49, 0.25); g.add(flap);
    });
    [1.30, 1.12].forEach(by => {
      const btn = new THREE.Mesh(new THREE.SphereGeometry(0.015, 6, 6), new THREE.MeshBasicMaterial({ color: 0x8A7E5E }));
      btn.position.set(0, by, 0.25);
      g.add(btn);
    });

    /* arms — khaki sleeves rolled to elbow, skin forearms */
    parts.arms = [];
    [-1, 1].forEach(side => {
      const sh = new THREE.Group();
      sh.position.set(side * 0.25, 1.58, 0);
      const upper = new THREE.Mesh(new THREE.CylinderGeometry(0.064, 0.058, 0.34, 7), W.toon(KHAKI));
      upper.position.y = -0.17; sh.add(upper); outline(upper, 1.07);
      const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.058, 0.07, 7), W.toon(0x9C9070));
      cuff.position.y = -0.36; sh.add(cuff);
      const fore = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.046, 0.32, 7), W.toon(SKIN));
      fore.position.y = -0.55; sh.add(fore);
      const hand = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), W.toon(SKIN));
      hand.position.y = -0.72; sh.add(hand);
      g.add(sh);
      parts.arms.push(sh);
    });

    /* head */
    const headG = new THREE.Group();
    headG.position.y = 2.0;
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 14, 12), W.toon(SKIN));
    head.scale.set(0.92, 1.02, 0.96);
    headG.add(head); outline(head, 1.05);
    /* eyes + brows */
    [-0.062, 0.062].forEach(ex => {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.017, 6, 6), new THREE.MeshBasicMaterial({ color: 0x14100C }));
      eye.position.set(ex, 0.02, 0.16);
      headG.add(eye);
      const b = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.012, 0.012), new THREE.MeshBasicMaterial({ color: 0x241C14 }));
      b.position.set(ex, 0.07, 0.166);
      headG.add(b);
    });
    /* short stubble beard */
    const beard = new THREE.Mesh(new THREE.TorusGeometry(0.125, 0.04, 8, 20, Math.PI * 1.2), W.toon(0x241C14));
    beard.position.set(0, -0.05, 0.02);
    beard.rotation.x = Math.PI / 2 + 0.25; beard.rotation.z = Math.PI * 0.4;
    headG.add(beard);
    /* ears */
    [-0.18, 0.18].forEach(ex => {
      const ear = new THREE.Mesh(new THREE.SphereGeometry(0.035, 6, 6), W.toon(SKIN));
      ear.position.set(ex, 0.0, 0); ear.scale.set(0.5, 1, 0.8);
      headG.add(ear);
    });
    /* SAFARI HAT — wide brim + crown + band + chin strap (the reference look) */
    const hat = new THREE.Group();
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.36, 0.025, 18), W.toon(0x8A8062));
    brim.position.y = 0.10; hat.add(brim);
    outline(brim, 1.05);
    const brimDrop = new THREE.Mesh(new THREE.TorusGeometry(0.345, 0.022, 6, 20), W.toon(0x7A7258));
    brimDrop.position.y = 0.09; brimDrop.rotation.x = Math.PI / 2; hat.add(brimDrop);
    const crown = new THREE.Mesh(new THREE.SphereGeometry(0.19, 12, 10, 0, Math.PI * 2, 0, Math.PI / 2), W.toon(0x948A6A));
    crown.position.y = 0.10; crown.scale.set(1, 0.85, 1.05); hat.add(crown);
    const band = new THREE.Mesh(new THREE.CylinderGeometry(0.185, 0.19, 0.055, 14), W.toon(0x5A5340));
    band.position.y = 0.135; hat.add(band);
    /* chin strap */
    const strapL = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.24, 4), W.toon(0x5A5340));
    strapL.position.set(-0.13, -0.06, 0.02); strapL.rotation.z = 0.5; hat.add(strapL);
    const strapR = strapL.clone(); strapR.position.x = 0.13; strapR.rotation.z = -0.5; hat.add(strapR);
    hat.position.y = 0.16;
    hat.rotation.z = 0.02;
    headG.add(hat);
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

    /* clipboard + pen in the left hand (he writes in the field) */
    const clip = new THREE.Group();
    const board = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.36, 0.02), W.toon(0x8A6A4A));
    clip.add(board); outline(board, 1.05);
    const paper = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.30, 0.005), new THREE.MeshBasicMaterial({ color: 0xF2EFE2 }));
    paper.position.set(0, -0.02, 0.014); clip.add(paper);
    const clipTop = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.035, 0.03), W.toon(0x4A4A48));
    clipTop.position.set(0, 0.165, 0.02); clip.add(clipTop);
    const pen = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.16, 5), W.toon(0x24406B));
    pen.position.set(0.10, 0.05, 0.03); pen.rotation.z = 0.9; clip.add(pen);
    clip.position.set(-0.34, 1.10, 0.22);
    clip.rotation.set(0.9, -0.15, 0.15);
    g.add(clip);
    parts.journal = clip;

    /* black field backpack on the back */
    const bag = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.44, 0.18), W.toon(0x232320));
    bag.position.set(0, 1.28, -0.30);
    g.add(bag); outline(bag, 1.05);
    const bagFlap = new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.16, 0.04), W.toon(0x2E2E2A));
    bagFlap.position.set(0, 1.40, -0.40); g.add(bagFlap);
    /* backpack shoulder straps over the shirt */
    [-0.11, 0.11].forEach(sx => {
      const st = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.34, 0.03), W.toon(0x1C1C1A));
      st.position.set(sx, 1.34, 0.245);
      st.rotation.x = -0.06;
      g.add(st);
    });

    /* umbrella (storm) — kept hidden */
    const umb = new THREE.Group();
    const canopy = new THREE.Mesh(new THREE.ConeGeometry(0.8, 0.42, 8), W.toon(0xA85C3A));
    canopy.position.y = 2.75;
    umb.add(canopy);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.05, 6), W.toon(0x3A4A42));
    pole.position.y = 2.25;
    umb.add(pole);
    umb.visible = false;
    g.add(umb);
    parts.umbrella = umb;

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
      if (parts.umbrella) parts.umbrella.visible = false;
    } else if (m === "stand") {
      parts.legs.forEach(l => gsap.to(l.rotation, { x: 0, duration: 0.6 }));
      parts.arms.forEach((a, i) => gsap.to(a.rotation, { x: 0, z: i ? -0.12 : 0.12, duration: 0.6 }));
      hideUmbrella();
    } else if (m === "walk") {
      parts.legs.forEach(l => gsap.to(l.rotation, { x: 0, duration: 0.3 }));
      parts.arms.forEach((a, i) => gsap.to(a.rotation, { x: 0, z: i ? -0.12 : 0.12, duration: 0.3 }));
      hideUmbrella();
    } else if (m === "huddle") {
      parts.legs.forEach(l => gsap.to(l.rotation, { x: -0.25, duration: 0.6 }));
      parts.arms.forEach((a, i) => gsap.to(a.rotation, { x: 1.15, z: i ? -0.55 : 0.55, duration: 0.6 }));
      if (parts.umbrella) parts.umbrella.visible = true;
    }
  }
  function hideUmbrella() {
    if (parts.umbrella) parts.umbrella.visible = false;
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
    g.position.y += 0; /* keep */
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
    if (parts.umbrella && parts.umbrella.visible) {
      parts.umbrella.rotation.z = Math.sin(t * 3) * 0.06;
    }
  }

  return { build, pose, place, update, showGlasses, get obj() { return g; }, get mode() { return mode; } };
})();
window.Fellow = Fellow;
