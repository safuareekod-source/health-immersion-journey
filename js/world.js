/* ============================================================
   world.js — the night-garden 3D world (Three.js r128)
   One continuous world along -Z; the journey is a glowing
   cyan-green light path. Dark indigo world, warm window glows,
   outlined cartoon props — alive, not boxes.
   ============================================================ */
const World = (() => {
  const T = window.THEME;
  let renderer, scene, camera, hemi, sun, hemiI = 0.55;
  const rig = { pos: null, look: null };
  let ready = false, fallback = false;
  let pathCurve, pathMesh, pathTotal = 0, pathLens = [];
  const sway = [];            /* objects with gentle idle motion */
  const anim = { t: 0 };
  let dust, fireflies;
  let sunDisc, sunLight2;
  const birds = [];           /* flying birds with circular paths */

  /* ---------- material helpers ---------- */
  function toon(color, opts) {
    /* MeshLambert gives the flat, papery look we want; MeshToonMaterial
       renders black on some WebGL2 drivers (verified live), so avoid it.
       Every material carries a small self-glow so props never sink into
       black — kept low: the world stays backstage, content projects. */
    const o = Object.assign({}, opts || {});
    if (o.emissive === undefined) {
      const c = new THREE.Color(color);
      c.multiplyScalar(0.15);
      o.emissive = c;
    }
    return new THREE.MeshLambertMaterial(Object.assign({ color }, o));
  }

  /* ink outline: a slightly larger back-face copy in deep ink —
     gives props the hand-drawn illustrated edge */
  function outline(mesh, scale, col) {
    const m = new THREE.Mesh(mesh.geometry, new THREE.MeshBasicMaterial({
      color: col === undefined ? 0x05070F : col, side: THREE.BackSide }));
    m.scale.setScalar(scale || 1.06);
    mesh.add(m);
    return mesh;
  }

  /* ---------- dusk ground texture ---------- */
  function paperTexture() {
    const c = document.createElement("canvas"); c.width = c.height = 512;
    const x = c.getContext("2d");
    const g = x.createLinearGradient(0, 0, 512, 512);
    g.addColorStop(0, "#132B1E"); g.addColorStop(1, "#0C1D13");
    x.fillStyle = g; x.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 900; i++) {                       /* faint grain */
      x.fillStyle = "rgba(150,220,180," + (Math.random() * 0.05) + ")";
      const s = Math.random() * 2 + 0.5;
      x.fillRect(Math.random() * 512, Math.random() * 512, s, s);
    }
    for (let i = 0; i < 90; i++) {                        /* glow moss */
      x.fillStyle = "rgba(61,255,168," + (Math.random() * 0.05 + 0.01) + ")";
      x.beginPath();
      x.arc(Math.random() * 512, Math.random() * 512, Math.random() * 1.6 + 0.4, 0, 7);
      x.fill();
    }
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(26, 60);
    return t;
  }

  /* ---------- canvas text texture (signposts, signs) ---------- */
  function textTexture(lines, opts) {
    opts = opts || {};
    const w = opts.w || 512, h = opts.h || 256;
    const c = document.createElement("canvas"); c.width = w; c.height = h;
    const x = c.getContext("2d");
    x.fillStyle = opts.bg || "#12241C"; x.fillRect(0, 0, w, h);
    x.strokeStyle = "rgba(61,255,168,0.55)"; x.lineWidth = 5; x.strokeRect(6, 6, w - 12, h - 12);
    x.fillStyle = opts.color || "#EFFBF4";
    x.textAlign = "center"; x.textBaseline = "middle";
    const n = lines.length;
    lines.forEach((ln, i) => {
      const big = i === 0 && opts.firstBig !== false;
      x.font = "800 " + (big ? (opts.bigSize || 84) : (opts.smallSize || 38)) + "px Outfit, sans-serif";
      x.fillText(ln, w / 2, h * (i + 1) / (n + 1));
    });
    return new THREE.CanvasTexture(c);
  }

  /* ---------- the journey path (glowing light ribbon) ---------- */
  function buildPath() {
    const pts = [
      [0, 6], [3, -14], [-4, -34], [2, -54], [-2, -74], [4, -96], [0, -118],
      [-5, -136], [0, -158], [3, -180], [-3, -204], [2, -232], [-2, -258],
      [4, -284], [0, -310], [-4, -336], [0, -362], [3, -388], [-2, -412], [0, -440]
    ].map(p => new THREE.Vector3(p[0], 0.06, p[1]));
    pathCurve = new THREE.CatmullRomCurve3(pts);
    const geo = new THREE.TubeGeometry(pathCurve, 420, 0.30, 6, false);
    pathLens = [0];
    for (let i = 1; i <= 200; i++) pathLens.push(pathCurve.getLength() * i / 200);
    pathTotal = geo.index.count;
    pathMesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
      color: 0x3DFFA8, transparent: true, opacity: 0.95 }));
    pathMesh.scale.y = 0.22;
    scene.add(pathMesh);
    pathMesh.geometry.setDrawRange(0, 0);
  }
  function drawPathToZ(z, dur) {
    let t = 1;
    for (let i = 1; i <= 200; i++) {
      const p = pathCurve.getPointAt(i / 200);
      if (p.z > z) { t = (i - 1) / 200; break; }
    }
    const target = Math.floor(pathTotal * t);
    const cur2 = { n: pathMesh.geometry.drawRange.count };
    gsap.to(cur2, {
      n: target, duration: dur || 1.2, ease: "power1.inOut",
      onUpdate: () => pathMesh.geometry.setDrawRange(0, Math.floor(cur2.n))
    });
  }

  /* ---------- vegetation & terrain dressing ---------- */
  function palm(x, z, s) {
    const g = new THREE.Group();
    let ty = 0;
    for (let i = 0; i < 4; i++) {
      const seg = new THREE.Mesh(new THREE.CylinderGeometry(0.10 * s, 0.14 * s, 1.1 * s, 6), toon(0x4A4030));
      seg.position.set(i * 0.08 * s, ty + 0.55 * s, 0);
      seg.rotation.z = -0.08; g.add(seg); ty += 1.02 * s;
    }
    for (let i = 0; i < 8; i++) {
      const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.13 * s, 1.9 * s, 5), toon(0x2E7D5B));
      leaf.scale.z = 0.16;
      const a = (i / 8) * Math.PI * 2;
      leaf.position.set(Math.cos(a) * 0.72 * s + 0.26 * s, ty + 0.34 * s, Math.sin(a) * 0.72 * s);
      leaf.rotation.z = Math.cos(a) * 1.5 + 0.18;
      leaf.rotation.x = -Math.sin(a) * 1.3;
      g.add(leaf);
    }
    for (let i = 0; i < 2; i++) {
      const nut = new THREE.Mesh(new THREE.SphereGeometry(0.07 * s, 8, 6), toon(0x6A4A30));
      nut.position.set((i ? 0.1 : -0.08) * s, ty + 0.1 * s, 0.1 * s);
      g.add(nut);
    }
    g.position.set(x, 0, z);
    g.rotation.y = Math.random() * Math.PI;
    scene.add(g);
    sway.push({ o: g, r: 0.035, sp: 0.8 + Math.random() * 0.5 });
    return g;
  }

  function tree(x, z, s, cool) {
    const g = new THREE.Group();
    const trunk = outline(new THREE.Mesh(new THREE.CylinderGeometry(0.09 * s, 0.14 * s, 1.0 * s, 6), toon(0x5A4030)));
    trunk.position.y = 0.5 * s; g.add(trunk);
    const leafC = cool ? 0x3E6E8C : 0x3E8E5E;
    const c1 = outline(new THREE.Mesh(new THREE.IcosahedronGeometry(0.62 * s, 0), toon(leafC)));
    c1.position.y = 1.25 * s; c1.scale.y = 0.85; g.add(c1);
    const c2 = outline(new THREE.Mesh(new THREE.IcosahedronGeometry(0.44 * s, 0), toon(leafC + 0x081408)));
    c2.position.set(0.3 * s, 1.6 * s, 0.15 * s); g.add(c2);
    const c3 = outline(new THREE.Mesh(new THREE.IcosahedronGeometry(0.36 * s, 0), toon(leafC + 0x101810)));
    c3.position.set(-0.26 * s, 1.5 * s, -0.12 * s); g.add(c3);
    g.position.set(x, 0, z); g.rotation.y = Math.random() * Math.PI;
    scene.add(g);
    sway.push({ o: g, r: 0.02, sp: 0.7 + Math.random() * 0.4 });
    return g;
  }

  /* grass tufts — scatter so the ground never looks empty */
  function grass(x, z, s, n) {
    const g = new THREE.Group();
    n = n || 7;
    for (let i = 0; i < n; i++) {
      const blade = new THREE.Mesh(new THREE.ConeGeometry(0.045 * s, 0.5 * s, 3), toon(0x2E8E5E));
      blade.position.set((Math.random() - 0.5) * 1.2 * s, 0.24 * s, (Math.random() - 0.5) * 1.2 * s);
      blade.rotation.z = (Math.random() - 0.5) * 0.5;
      g.add(blade);
    }
    g.position.set(x, 0, z);
    scene.add(g);
    sway.push({ o: g, r: 0.05, sp: 1.2 + Math.random() * 0.8 });
    return g;
  }

  function hill(x, z, s, col) {
    const m = outline(new THREE.Mesh(new THREE.IcosahedronGeometry(s, 1),
      toon(col === undefined ? 0x1A2A4E : col)), 1.03);
    m.scale.y = 0.55;
    m.position.set(x, -s * 0.15, z);
    m.rotation.y = Math.random() * Math.PI;
    scene.add(m);
    return m;
  }

  function rock(x, z, s) {
    const m = outline(new THREE.Mesh(new THREE.DodecahedronGeometry(s, 0), toon(0x3A4666)));
    m.position.set(x, s * 0.4, z);
    m.rotation.set(Math.random(), Math.random(), Math.random());
    scene.add(m);
    return m;
  }

  /* a glowing pond — mirrors the sky */
  function pond(x, z, r) {
    const m = new THREE.Mesh(new THREE.CircleGeometry(r || 5, 26),
      new THREE.MeshBasicMaterial({ color: 0x14432E, transparent: true, opacity: 0.85 }));
    m.rotation.x = -Math.PI / 2;
    m.position.set(x, 0.05, z);
    scene.add(m);
    const rim = new THREE.Mesh(new THREE.RingGeometry(r || 5, (r || 5) + 0.25, 26),
      new THREE.MeshBasicMaterial({ color: 0x3DFFA8, transparent: true, opacity: 0.35, side: THREE.DoubleSide }));
    rim.rotation.x = -Math.PI / 2;
    rim.position.set(x, 0.06, z);
    scene.add(rim);
    return m;
  }

  /* birds — little V-pairs circling overhead */
  function addBirds(cx, cz, r, h, n) {
    for (let i = 0; i < (n || 3); i++) {
      const g = new THREE.Group();
      const mat = new THREE.MeshBasicMaterial({ color: 0xBFDCC8 });
      const b1 = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.5, 3), mat);
      b1.rotation.z = Math.PI / 2.4;
      const b2 = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.5, 3), mat);
      b2.rotation.z = -Math.PI / 2.4;
      g.add(b1, b2);
      scene.add(g);
      birds.push({ o: g, cx, cz, r: r + i * 1.4, h: h + i * 0.8, sp: 0.22 + Math.random() * 0.12, ph: Math.random() * 6.28 });
    }
  }

  /* ---------- built pieces ---------- */
  function bench(x, z, ry) {
    const g = new THREE.Group();
    const wood = toon(0x6A4530);
    const seat = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.14, 0.8), wood); seat.position.y = 0.62; g.add(seat);
    const back = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.5, 0.1), wood); back.position.set(0, 0.95, -0.36); back.rotation.x = -0.12; g.add(back);
    [[-1.1], [1.1]].forEach(([lx]) => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.62, 0.7), toon(0x503522));
      leg.position.set(lx, 0.31, 0); g.add(leg);
    });
    g.position.set(x, 0, z); g.rotation.y = ry;
    scene.add(g);
    return g;
  }

  function signpost(x, z, tex, ry, s) {
    s = s || 1;
    const g = new THREE.Group();
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.07 * s, 0.09 * s, 2.6 * s, 6), toon(0x503522));
    pole.position.y = 1.3 * s; g.add(pole);
    const aspect = tex.image.height / tex.image.width;
    const w = 2.1 * s, h = w * aspect;
    const board = new THREE.Mesh(new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ map: tex, transparent: false }));
    board.position.set(0, 2.15 * s, 0.055 * s); g.add(board);
    const boardB = new THREE.Mesh(new THREE.PlaneGeometry(w, h), toon(0x0E1830));
    boardB.rotation.y = Math.PI; boardB.position.set(0, 2.15 * s, -0.055 * s); g.add(boardB);
    g.position.set(x, 0, z); g.rotation.y = ry;
    g.scale.setScalar(0.01);
    scene.add(g);
    return g;
  }

  /* village hut with warm glowing window */
  function hut(x, z, s, roofCol) {
    const g = new THREE.Group();
    const walls = new THREE.Mesh(new THREE.BoxGeometry(2.4 * s, 1.5 * s, 2.0 * s), toon(0x2E4438));
    walls.position.y = 0.75 * s; g.add(walls);
    outline(walls, 1.04);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(2.05 * s, 1.15 * s, 4), toon(roofCol || 0x8A4A30));
    roof.position.y = 2.05 * s; roof.rotation.y = Math.PI / 4; g.add(roof);
    const door = new THREE.Mesh(new THREE.BoxGeometry(0.62 * s, 1.05 * s, 0.06 * s), toon(0x503522));
    door.position.set(0, 0.52 * s, 1.01 * s); g.add(door);
    const win = new THREE.Mesh(new THREE.PlaneGeometry(0.44 * s, 0.4 * s),
      new THREE.MeshBasicMaterial({ color: 0xFFD98A }));
    win.position.set(-0.72 * s, 0.9 * s, 1.005 * s); g.add(win);
    const wl = new THREE.PointLight(0xFFD98A, 0.45, 7, 2);
    wl.position.set(-0.72 * s, 0.9 * s, 1.3 * s); g.add(wl);
    g.position.set(x, 0, z); g.rotation.y = (Math.random() - 0.5) * 0.5;
    scene.add(g);
    return g;
  }

  function healthCenter(x, z, ry) {
    const g = new THREE.Group();
    const base = new THREE.Mesh(new THREE.BoxGeometry(6.4, 2.2, 3.6), toon(0x35503E));
    base.position.y = 1.1; g.add(base);
    outline(base, 1.03);
    const roof = new THREE.Mesh(new THREE.BoxGeometry(6.8, 0.32, 4.0), toon(0x8A4A30));
    roof.position.y = 2.35; g.add(roof);
    const board = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 0.75), new THREE.MeshBasicMaterial({ map: textTexture(["CHC Ramgarh"], { w: 512, h: 128 }) }));
    board.position.set(0, 1.9, 1.83); g.add(board);
    /* glowing windows */
    [-2.2, 2.2].forEach(wx => {
      const win = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.7),
        new THREE.MeshBasicMaterial({ color: 0xBFE8FF }));
      win.position.set(wx, 1.2, 1.83); g.add(win);
    });
    const cr1 = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.26, 0.1), toon(0xE05A4E));
    cr1.position.set(1.9, 2.85, 0); g.add(cr1);
    const cr2 = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.9, 0.1), toon(0xE05A4E));
    cr2.position.set(1.9, 2.85, 0); g.add(cr2);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.2, 6), toon(0x503522));
    pole.position.set(1.9, 2.5, 0); g.add(pole);
    g.position.set(x, 0, z); g.rotation.y = ry;
    scene.add(g);
    return g;
  }

  /* S3: the unfolding glowing map */
  function paperMap(x, z) {
    const g = new THREE.Group();
    const geo = new THREE.PlaneGeometry(26, 26, 10, 10);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const xx = pos.getX(i), yy = pos.getY(i);
      if (Math.abs(xx) > 10 || Math.abs(yy) > 10) pos.setZ(i, -0.4);
    }
    const m = new THREE.Mesh(geo, toon(0x1C3A2C, { side: THREE.DoubleSide }));
    m.rotation.x = -Math.PI / 2; m.position.y = 0.05;
    g.add(m);
    [[0, 1], [0, -1]].forEach(([dx, dy]) => {
      const crease = new THREE.Mesh(new THREE.BoxGeometry(26, 0.02, 0.14),
        new THREE.MeshBasicMaterial({ color: 0x3DFFA8, transparent: true, opacity: 0.4 }));
      crease.rotation.z = 0; crease.position.set(0, 0.07, dy * 6.5);
      g.add(crease);
    });
    g.position.set(x, 0, z);
    g.scale.set(0.01, 0.01, 0.01);
    scene.add(g);
    return g;
  }

  function pin(x, z, h, col, z0) {
    const g = new THREE.Group();
    const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, h, 5), toon(col || 0xE08A3E));
    stick.position.y = h / 2; g.add(stick);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 8),
      new THREE.MeshBasicMaterial({ color: col || 0xFFB35C }));
    head.position.y = h; g.add(head);
    g.position.set(x, z0 || 0, z);
    g.scale.setScalar(0.01);
    scene.add(g);
    return g;
  }

  /* S5: cracks + repair planks */
  function crack(x, z) {
    const g = new THREE.Group();
    for (let i = 0; i < 4; i++) {
      const c = new THREE.Mesh(new THREE.BoxGeometry(0.5 + Math.random() * 0.5, 0.05, 0.28), toon(0xB05F35));
      c.position.set((Math.random() - 0.5) * 0.8, 0.03, (Math.random() - 0.5) * 0.6);
      c.rotation.y = Math.random() * Math.PI;
      g.add(c);
    }
    g.position.set(x, 0, z);
    scene.add(g);
    return g;
  }
  function planks(x, z) {
    const g = new THREE.Group();
    for (let i = 0; i < 5; i++) {
      const p = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.07, 1.15),
        new THREE.MeshBasicMaterial({ color: 0x36C46E }));
      p.position.set(-1.2 + i * 0.13, 3 + i * 0.4, (i % 2 ? 0.14 : -0.12));
      p.rotation.set(0.3, i * 0.2, 0.5);
      g.add(p);
    }
    g.position.set(x, 0, z);
    scene.add(g);
    return g;
  }

  /* S6: the sun + sprouts */
  function buildSun() {
    sunDisc = new THREE.Mesh(new THREE.CircleGeometry(4.6, 40),
      new THREE.MeshBasicMaterial({ color: 0xFFC98A, transparent: true, opacity: 0 }));
    sunDisc.position.set(-26, -2, -415);
    scene.add(sunDisc);
  }

  /* the always-there dusk sun — warm cream-yellow disc riding the horizon */
  let skySun;
  function buildSkySun() {
    skySun = new THREE.Mesh(new THREE.CircleGeometry(9, 40),
      new THREE.MeshBasicMaterial({ color: 0xFFE2A0, transparent: true, opacity: 0.85, fog: false }));
    skySun.position.set(42, 26, -240);
    const halo = new THREE.Mesh(new THREE.CircleGeometry(14, 40),
      new THREE.MeshBasicMaterial({ color: 0xFFD97A, transparent: true, opacity: 0.16, fog: false }));
    halo.position.z = -0.5;
    skySun.add(halo);
    scene.add(skySun);
  }

  /* drifting clouds — soft warm puffs sliding slowly, wrap around */
  const clouds = [];
  function buildClouds() {
    const mat = new THREE.MeshLambertMaterial({
      color: 0xF2E3C0, transparent: true, opacity: 0.8,
      emissive: new THREE.Color(0x8A7A50), fog: false });
    for (let i = 0; i < 9; i++) {
      const g = new THREE.Group();
      const n = 3 + Math.floor(Math.random() * 2);
      for (let k = 0; k < n; k++) {
        const puff = new THREE.Mesh(new THREE.SphereGeometry(1.6 + Math.random() * 1.6, 8, 6), mat);
        puff.scale.y = 0.5;
        puff.position.set(k * 2.4 - n, Math.random() * 0.5, Math.random() * 1.2);
        g.add(puff);
      }
      g.position.set((Math.random() - 0.5) * 160, 24 + Math.random() * 12, -20 - Math.random() * 430);
      g.scale.setScalar(1 + Math.random());
      scene.add(g);
      clouds.push({ o: g, sp: 0.25 + Math.random() * 0.3 });
    }
  }
  function sprouts(zFrom, zTo) {
    const arr = [];
    for (let z = zFrom; z > zTo; z -= 4.5) {
      const p = pathCurve.getPointAt(Math.min(0.999, Math.max(0.001, zToT(z))));
      const s = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.7, 5),
        new THREE.MeshBasicMaterial({ color: 0x5BD98C }));
      s.position.set(p.x + (Math.random() - 0.5) * 3.4, 0.35, p.z + (Math.random() - 0.5) * 3.4);
      s.scale.setScalar(0.001);
      scene.add(s); arr.push(s);
    }
    return arr;
  }
  function zToT(z) {
    for (let i = 1; i <= 200; i++) {
      if (pathCurve.getPointAt(i / 200).z > z) return (i - 1) / 200;
    }
    return 1;
  }

  /* a single person figure — for stakeholders standing in the world */
  function person(x, z, col, ry) {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.85, 6), toon(col || 0xC97B4A));
    body.position.y = 0.42; g.add(body);
    outline(body, 1.06);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.145, 8, 6), toon(0xB07A4E));
    head.position.y = 1.02; g.add(head);
    outline(head, 1.07);
    g.position.set(x, 0, z);
    g.rotation.y = ry || Math.PI;
    g.scale.setScalar(0.01);
    scene.add(g);
    sway.push({ o: g, r: 0.02, sp: 0.9 + Math.random() * 0.4 });
    return g;
  }

  /* a stack of books — the study/tutorial grind */
  function bookStack(x, z) {
    const g = new THREE.Group();
    const cols = [0xB05F35, 0x2E7D5B, 0xC97B4A, 0x8A7A50];
    cols.forEach((c, i) => {
      const b = new THREE.Mesh(new THREE.BoxGeometry(0.85 - i * 0.06, 0.14, 0.6 - i * 0.04), toon(c));
      b.position.set((Math.random() - 0.5) * 0.12, 0.08 + i * 0.15, (Math.random() - 0.5) * 0.1);
      b.rotation.y = (Math.random() - 0.5) * 0.5;
      g.add(b);
    });
    g.position.set(x, 0, z);
    scene.add(g);
    return g;
  }

  /* S7: lamppost + photo string */
  function lamppost(x, z) {
    const g = new THREE.Group();
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, 5.2, 6), toon(0x2A3E30));
    pole.position.y = 2.6; g.add(pole);
    const cap = new THREE.Mesh(new THREE.ConeGeometry(0.55, 0.5, 6), toon(0x2A3E30));
    cap.position.y = 5.4; g.add(cap);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.3, 10, 8),
      new THREE.MeshBasicMaterial({ color: 0xFFE2A0, transparent: true, opacity: 0 }));
    bulb.position.y = 5.0; g.add(bulb);
    const lt = new THREE.PointLight(0xFFD98A, 0, 26, 2);
    lt.position.y = 5.0; g.add(lt);
    g.position.set(x, 0, z);
    scene.add(g);
    return { g, bulb, lt };
  }

  /* floating label board above a building — content-connected world */
  function label(x, z, y, text, s) {
    s = s || 1;
    const tex = textTexture([text], { w: 512, h: 128, bigSize: 54, bg: "#20301F", color: "#FFE9B8" });
    const aspect = tex.image.height / tex.image.width;
    const w = 3.4 * s, h = w * aspect;
    const g = new THREE.Group();
    const board = new THREE.Mesh(new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ map: tex }));
    g.add(board);
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.9 * s, 5), toon(0x503522));
    post.position.y = -h / 2 - 0.45 * s;
    g.add(post);
    g.position.set(x, y, z);
    scene.add(g);
    return g;
  }

  /* block office — a two-storey building with signboard */
  function blockOffice(x, z, ry) {
    const g = new THREE.Group();
    const base = new THREE.Mesh(new THREE.BoxGeometry(5.2, 3.4, 3.4), toon(0x3E4A38));
    base.position.y = 1.7; g.add(base);
    outline(base, 1.03);
    const band = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.16, 3.6), toon(0x8A7A50));
    band.position.y = 1.85; g.add(band);
    /* windows both floors */
    [-1.6, 0, 1.6].forEach(wx => [1.0, 2.4].forEach(wy => {
      const win = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.55),
        new THREE.MeshBasicMaterial({ color: 0xFFD98A }));
      win.position.set(wx, wy, 1.72); g.add(win);
    }));
    const roof = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.3, 3.8), toon(0x6A4A30));
    roof.position.y = 3.55; g.add(roof);
    g.position.set(x, 0, z); g.rotation.y = ry;
    scene.add(g);
    label(x, z, 4.6, "Block Office", 0.9);
    return g;
  }

  /* meeting pandal — canopy on poles, mat, seated villagers */
  function pandal(x, z, ry, label_text) {
    const g = new THREE.Group();
    const mat = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.1, 4.2), toon(0xB08A58));
    mat.position.y = 0.06; g.add(mat);
    [[-2.5, -1.8], [2.5, -1.8], [-2.5, 1.8], [2.5, 1.8]].forEach(([px, pz]) => {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.6, 5), toon(0x6A4A30));
      pole.position.set(px, 1.3, pz); g.add(pole);
    });
    const canopy = new THREE.Mesh(new THREE.BoxGeometry(6.0, 0.14, 4.6), toon(0xA85C38));
    canopy.position.y = 2.7; g.add(canopy);
    const trim = new THREE.Mesh(new THREE.BoxGeometry(6.2, 0.1, 4.8), toon(0xFFD97A));
    trim.position.y = 2.58; g.add(trim);
    /* seated villagers: simple cone bodies + heads */
    for (let i = 0; i < 7; i++) {
      const p = new THREE.Group();
      const body = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.62, 6),
        toon([0xC97B4A, 0x3E6E5C, 0xB05F35, 0x55684A][i % 4]));
      body.position.y = 0.31; p.add(body);
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 6), toon(0xB07A4E));
      head.position.y = 0.74; p.add(head);
      p.position.set(-1.9 + (i % 4) * 1.25, 0.1, (i < 4 ? 0.9 : -0.5));
      p.rotation.y = Math.PI;   /* face the (imaginary) speakers */
      g.add(p);
    }
    g.position.set(x, 0, z); g.rotation.y = ry || 0;
    scene.add(g);
    if (label_text) label(x, z, 4.0, label_text, 0.85);
    return g;
  }

  function loadTex(src) {
    /* file:// safe: use embedded data URIs (data/imgdata.js) when available */
    let url = src;
    if (window.FIELD_IMG) {
      const key = String(src).replace(/^.*[\\/]/, "").replace(/\.[a-z]+$/i, "");
      if (window.FIELD_IMG[key]) url = window.FIELD_IMG[key];
    }
    const t = new THREE.TextureLoader().load(url);
    t.encoding = THREE.sRGBEncoding;
    return t;
  }

  function polaroid(src, w) {
    const g = new THREE.Group();
    const frame = new THREE.Mesh(new THREE.PlaneGeometry(w, w * 1.18), toon(0xE8EEDC, { side: THREE.DoubleSide }));
    g.add(frame);
    const tex = loadTex(src);
    const im = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.88, w * 0.72),
      new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide }));
    im.position.z = 0.02; im.position.y = w * 0.07;
    g.add(im);
    return g;
  }

  function notePlane(src, w) {
    const tex = loadTex(src);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, w * 1.5),
      new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide }));
    return m;
  }

  /* ---------- particles ---------- */
  function makePoints(n, spread, col, size, zoneZ) {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      pos[i * 3] = (Math.random() - 0.5) * spread.x;
      pos[i * 3 + 1] = Math.random() * spread.y + 0.3;
      pos[i * 3 + 2] = zoneZ[0] - Math.random() * (zoneZ[1] - zoneZ[0]);
    }
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({ color: col, size, transparent: true, opacity: 0.55, depthWrite: false });
    const p = new THREE.Points(geo, mat);
    scene.add(p);
    return p;
  }

  /* ---------- moods ---------- */
  const cur = { bg: new THREE.Color(), fog: new THREE.Color(), sunC: new THREE.Color(), sunI: 1, hemiI: 0.55, fogN: 40, fogF: 150 };
  function setMood(name, dur) {
    const m = T.moods[name]; if (!m) return;
    const d = (dur === undefined ? 2.2 : dur);
    gsap.to(cur.bg,   { r: ((m.bg >> 16) & 255) / 255, g: ((m.bg >> 8) & 255) / 255, b: (m.bg & 255) / 255, duration: d });
    gsap.to(cur.fog,  { r: ((m.fog >> 16) & 255) / 255, g: ((m.fog >> 8) & 255) / 255, b: (m.fog & 255) / 255, duration: d });
    gsap.to(cur.sunC, { r: ((m.sun >> 16) & 255) / 255, g: ((m.sun >> 8) & 255) / 255, b: (m.sun & 255) / 255, duration: d });
    /* only tween defined values — a NaN in any light uniform blacks out
       every lit material in the scene (verified live) */
    const kv = {};
    if (isFinite(m.sunI)) kv.sunI = m.sunI;
    if (isFinite(m.hemiI)) kv.hemiI = m.hemiI;
    if (isFinite(m.fogNear)) kv.fogN = m.fogNear;
    if (isFinite(m.fogFar)) kv.fogF = m.fogFar;
    gsap.to(cur, Object.assign({ duration: d }, kv));
    if (fallback) document.body.dataset.scene = m.domScene || document.body.dataset.scene;
  }

  /* ---------- init ---------- */
  function init() {
    if (T.debug.fallback) { fallback = true; }
    try {
      if (!fallback) {
        renderer = new THREE.WebGLRenderer({ antialias: true });
        if (!renderer.getContext()) throw new Error("no gl");
      }
    } catch (e) { fallback = true; }
    if (fallback) {
      document.body.classList.add("fallback");
      document.body.dataset.scene = "s1";
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;
    document.getElementById("stage").appendChild(renderer.domElement);

    scene = new THREE.Scene();
    scene.background = cur.bg;
    scene.fog = new THREE.Fog(0x42381F, 42, 150);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 400);
    rig.pos = new THREE.Vector3(10, 6, 18);
    rig.look = new THREE.Vector3(0, 1.4, -2);

    hemi = new THREE.HemisphereLight(0xFFE9C4, 0x14281E, 0.52);
    scene.add(hemi);
    sun = new THREE.DirectionalLight(0xFFE3A0, 0.8);
    sun.position.set(14, 22, 8);
    scene.add(sun);

    /* dusk ground — no emissive: the texture is already the right depth */
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(340, 760),
      toon(0x8FA0C8, { map: paperTexture(), emissive: 0x000000 }));
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0, 0, -210);
    scene.add(ground);

    buildPath();
    buildSun();
    buildSkySun();
    buildClouds();

    /* river in Kerala (glowing teal) */
    const river = new THREE.Mesh(new THREE.PlaneGeometry(9, 46, 1, 8),
      new THREE.MeshBasicMaterial({ color: 0x14503C, transparent: true, opacity: 0.9 }));
    river.rotation.x = -Math.PI / 2; river.rotation.z = 0.12;
    river.position.set(-17, 0.04, -12);
    scene.add(river);

    dust = makePoints(160, { x: 70, y: 12 }, 0xF2E3C0, 0.14, [10, -460]);
    fireflies = makePoints(70, { x: 40, y: 6 }, 0x8FF0B8, 0.26, [-414, -462]);
    fireflies.material.opacity = 0; fireflies.visible = false;

    /* bird flocks along the ENTIRE journey — always something alive overhead */
    addBirds(-6, -30, 14, 12, 3);
    addBirds(9, -80, 13, 13, 2);
    addBirds(-8, -130, 15, 12, 2);
    addBirds(7, -180, 14, 13, 3);
    addBirds(-5, -230, 13, 12, 2);
    addBirds(8, -280, 15, 13, 2);
    addBirds(-7, -330, 14, 12, 2);
    addBirds(6, -380, 13, 13, 3);
    addBirds(-3, -425, 14, 12, 2);

    setMood("kerala", 0.01);
    window.addEventListener("resize", onResize);
    ready = true;
  }

  function onResize() {
    if (fallback) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  /* ---------- per-frame update ---------- */
  function update(dt) {
    if (!ready || fallback) return;
    anim.t += dt;
    const t = anim.t;

    camera.position.copy(rig.pos);
    camera.lookAt(rig.look);

    scene.background.copy(cur.bg);
    scene.fog.color.copy(cur.fog);
    sun.color.copy(cur.sunC); sun.intensity = cur.sunI;
    hemi.intensity = cur.hemiI;
    scene.fog.near = cur.fogN; scene.fog.far = cur.fogF;

    sway.forEach(s => { s.o.rotation.z = Math.sin(t * s.sp) * s.r; });
    clouds.forEach(c => {
      c.o.position.x += c.sp * dt;
      if (c.o.position.x > 110) c.o.position.x = -110;
    });
    birds.forEach(b => {
      const a = t * b.sp + b.ph;
      b.o.position.set(b.cx + Math.cos(a) * b.r, b.h + Math.sin(t * 2 + b.ph) * 0.4, b.cz + Math.sin(a) * b.r * 0.5);
      b.o.rotation.y = -a + Math.PI / 2;
      b.o.rotation.z = Math.sin(t * 6 + b.ph) * 0.25;
    });

    if (dust) { dust.rotation.y = Math.sin(t * 0.05) * 0.02; dust.position.y = Math.sin(t * 0.3) * 0.4; }
    if (fireflies && fireflies.visible) {
      fireflies.material.opacity = 0.5 + Math.sin(t * 2.2) * 0.3;
      fireflies.position.y = Math.sin(t * 0.7) * 0.5;
    }
    if (sunDisc && sunDisc.material.opacity > 0.01) {
      sunDisc.lookAt(camera.position);
    }
    if (skySun) {
      skySun.lookAt(camera.position);
    }
    renderer.render(scene, camera);
  }

  /* camera flight helper for timelines */
  function fly(tl, pos, look, dur, ease, at) {
    tl.to(rig.pos, { x: pos[0], y: pos[1], z: pos[2], duration: dur || 3, ease: ease || "power2.inOut" }, at || 0);
    tl.to(rig.look, { x: look[0], y: look[1], z: look[2], duration: dur || 3, ease: ease || "power2.inOut" }, at || 0);
    return tl;
  }

  return {
    init, update, fly, toon, textTexture, sway, outline,
    get scene() { return scene; }, get camera() { return camera; },
    get rig() { return rig; }, get fallback() { return fallback; }, get ready() { return ready; },
    drawPathToZ, setMood,
    palm, tree, grass, hill, rock, pond, bench, signpost, hut, healthCenter, paperMap, pin, crack, planks, sprouts, lamppost, polaroid, notePlane,
    label, blockOffice, pandal, person, bookStack,
    get dust() { return dust; }, get fireflies() { return fireflies; },
    get sunDisc() { return sunDisc; },
    get pathCurve() { return pathCurve; },
  };
})();
window.World = World;
