/* ============================================================
   overlay.js — glass-card DOM panels (dark iOS theme).
   Each section = a small constellation of floating glass cards
   (.cards > .gcard), alive with a gentle CSS float, revealed
   through an inner .pin wrapper (GSAP never touches the
   positioned panel itself, so centering is never clobbered).
   ============================================================ */
const Overlay = (() => {
  const ui = () => document.getElementById("ui");
  let current = [];

  function baseEl(cls, pos) {
    const el = document.createElement("div");
    el.className = cls + " " + pos;
    el.style.visibility = "hidden";
    el.style.opacity = "0";
    ui().appendChild(el);
    current.push(el);
    return el;
  }

  function reveal(el, instant) {
    const pin = el.firstElementChild;
    if (instant) {
      gsap.set(el, { opacity: 1, visibility: "visible" });
      gsap.set(pin, { y: 0, opacity: 1, rotate: 0 });
      el.querySelectorAll(".ir").forEach(n => gsap.set(n, { clipPath: "inset(0 0% 0 0)" }));
    } else {
      gsap.set(el, { opacity: 1, visibility: "visible" });
      gsap.fromTo(pin,
        { y: 44, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: "power3.out" });
      /* stagger the glass cards in — each pops like an iOS sheet */
      const cards = el.querySelectorAll(".gcard");
      if (cards.length) {
        gsap.fromTo(cards,
          { y: 26, opacity: 0, scale: 0.96 },
          { y: 0, opacity: 1, scale: 1, duration: 0.65, ease: "power3.out", stagger: 0.09, delay: 0.12 });
      }
      inkLines(el, 0.3);
    }
  }

  function inkLines(el, delay) {
    const lines = el.querySelectorAll(".ir");
    if (!lines.length) return;
    gsap.to(lines, {
      clipPath: "inset(0 0% 0 0)", duration: 0.8, ease: "power2.out",
      stagger: 0.1, delay
    });
  }

  function show(html, opts) {
    opts = opts || {};
    if (!opts.keep) clear();
    const el = baseEl("panel", opts.pos || "pos-left");
    el.innerHTML = '<div class="pin">' + html + "</div>";
    reveal(el, !!opts.instant);
    return el;
  }

  function chip(text, sub, opts) {
    opts = opts || {};
    if (!opts.keep) clear();
    /* chips project dead-center — bottom edge fought the progress bar */
    const el = baseEl("chip", opts.pos || "pos-center");
    el.innerHTML = '<div class="pin">' + text + (sub ? '<div class="sub">' + sub + "</div>" : "") + "</div>";
    reveal(el, !!opts.instant);
    return el;
  }

  function clear(instant) {
    current.forEach(el => {
      const pin = el.firstElementChild;
      if (instant) { el.remove(); return; }
      gsap.to(pin, { opacity: 0, y: -18, duration: 0.28, ease: "power1.in", onComplete: () => el.remove() });
    });
    current = [];
  }

  function countUp(el) {
    el.querySelectorAll(".num[data-v]").forEach((n, idx) => {
      const target = parseFloat(n.dataset.v);
      const dec = parseInt(n.dataset.d || "0", 10);
      const suf = n.dataset.s || "";
      const o = { v: 0 };
      gsap.to(o, {
        v: target, duration: 1.1, delay: 0.3 + idx * 0.06, ease: "power2.out",
        onUpdate: () => { n.textContent = o.v.toFixed(dec) + suf; }
      });
    });
  }

  /* ============================================================
     templates — sections as constellations of glass cards;
     itemized content = one box per item filling the screen width
     ============================================================ */
  const T = {};

  /* hero: his portrait + name + details + Begin Journey, projected center */
  T.hero = (c) => {
    const m = c.meta;
    const pic = window.FIELD_IMG && window.FIELD_IMG.portrait;
    return '<div class="gcard featured hero-card"><div class="hero-wrap">' +
      (pic ? '<div class="hero-photo ir"><img src="' + pic + '" alt="' + m.presenterName + '"></div>' : "") +
      '<div class="hero-main">' +
        '<div class="kicker ir">' + m.deckTitle + " · " + m.fellowship + '</div>' +
        '<h1 class="hero-name ir"><span class="grad">' + m.presenterName + "</span></h1>" +
        '<div class="rule"></div>' +
        '<div class="hero-meta">' +
          '<div class="row ir"><span class="lab">Project</span><span>' + m.project + "</span></div>" +
          '<div class="row ir"><span class="lab">Posted to</span><span>' + m.postedTo + "</span></div>" +
          '<div class="row ir"><span class="lab">From</span><span>' + m.presenterFrom + "</span></div>" +
        "</div>" +
        '<div class="from-note ir">a journey from Kerala to the Santhal Pargana hills</div>' +
        '<button class="start-btn" id="start-btn">' + (m.beginLabel || "Begin the Journey") + ' →</button>' +
      "</div></div></div>";
  };

  T.agenda = (c) => {
    const items = c.agenda.map((a, i) =>
      '<div class="ag ir"><span class="n">' + (i + 1) + '</span><span class="t">' + a + "</span></div>").join("");
    return '<div class="cards">' +
      '<div class="gcard featured"><div class="kicker ir">The road ahead</div><h2 class="ir">Six stopages on this journey</h2></div>' +
      '<div class="gcard"><div class="agenda">' + items + "</div></div></div>";
  };

  /* objectives: six individual boxes across the screen — no scrolling */
  T.objectives = (c) => {
    const cards = c.objectives.map((o, i) =>
      '<div class="gcard item ir"><div class="item-n">' + (i + 1) + '</div>' +
      '<div class="item-t">' + o.title + '</div><div class="item-d">' + o.detail + "</div></div>").join("");
    return '<div class="cards head-row"><div class="gcard featured"><div class="kicker ir">Stop 1 · Objectives</div><h2 class="ir">What I set out to do</h2></div></div>' +
      '<div class="items c3">' + cards + "</div>";
  };

  T.areaComplete = (c) => {
    const a = c.areaProfile;
    const cells = a.stats.map(s =>
      '<div class="stat"><div class="num" data-v="' + s.value + '" data-s="' + (s.suffix || "") + '" data-d="' + (s.decimals || 0) + '">0</div><div class="lbl">' + s.label + "</div></div>").join("");
    /* donut pie of the community mix — its own box on the LEFT;
       all the block numbers — their own card on the RIGHT */
    let acc = 0;
    const segs = a.highlight.pie.map(s => {
      const from = acc; acc += s.pct;
      return s.color + " " + from + "% " + acc + "%";
    }).join(", ");
    const legend = a.highlight.pie.map(s =>
      '<div class="pie-leg ir"><span class="dot" style="background:' + s.color + '"></span>' +
      '<span class="pl">' + s.label + '</span><span class="pv">' + s.pct.toFixed(1) + "%</span></div>").join("");
    return '<div class="cards">' +
      '<div class="gcard featured"><div class="kicker ir">Stop 2 · Area Profile</div><h2 class="ir">' + a.place + "</h2>" +
        '<div class="muted ir">' + a.intro + "</div></div>" +
      '<div class="cards split">' +
        '<div class="gcard"><div class="pie-cap ir">Who lives here</div>' +
          '<div class="pie ir" style="background:conic-gradient(' + segs + ')"><div class="pie-hole"><span class="pie-big">' + a.highlight.big + '</span><span class="pie-sub">SC / ST</span></div></div>' +
          '<div class="pie-legend">' + legend + "</div>" +
          '<div class="pie-note ir">' + a.highlight.note + "</div>" +
        "</div>" +
        '<div class="gcard featured"><div class="stats stats4 right">' + cells + "</div></div>" +
      "</div></div>";
  };

  T.actionsAll = (c) => {
    const A = c.actions;
    const col = (b) => '<div class="gcard item ir"><div class="col-h">' + b.title + "</div>" +
      b.items.map(i => '<div class="col-i">' + i + "</div>").join("") + "</div>";
    return '<div class="cards head-row"><div class="gcard featured"><div class="kicker ir">Stop 3 · Covered Actions</div><h2 class="ir">Where I went, what I did</h2></div></div>' +
      '<div class="items c3">' + col(A.facilities) + col(A.programs) + col(A.forums) + "</div>";
  };

  T.stakeholders = (c) => {
    const cols = c.stakeholders.map(s =>
      '<div class="gcard item ir"><div class="col-h">' + s.head + "</div>" +
      s.items.map(i => '<div class="col-i">' + i + "</div>").join("") + "</div>").join("");
    return '<div class="cards head-row"><div class="gcard featured"><div class="kicker ir">Stop 3 · People I met</div><h2 class="ir">The stakeholders around me</h2></div></div>' +
      '<div class="items c3">' + cols + "</div>";
  };

  T.gapsAll = (c) => {
    const cards = c.gaps.map((g, i) =>
      '<div class="gcard item ir' + (g.highlight ? " hl-gap" : "") + '">' +
      '<div class="gap-top"><span class="gnum' + (g.highlight ? " gold" : "") + '">' + (i + 1) + '</span>' +
      '<span class="gobs">' + g.observed + '</span></div>' +
      '<div class="gact">→ ' + g.action + "</div>" +
      (g.footer ? '<div class="gap-foot ir">(' + g.footer + ")</div>" : "") +
      "</div>").join("");
    return '<div class="cards head-row"><div class="gcard featured"><div class="kicker ir">Stop 4 · Gaps & Actions</div><h2 class="ir">' + c.gapsIntro + "</h2>" +
      '<div class="muted ir">' + (c.gapsSub || "") + "</div></div></div>" +
      '<div class="items c3">' + cards + "</div>" +
      '<div class="gcard wayf-card"><div class="wayf ir"><div class="wlab">Planned next</div>' +
        c.wayForward.map(w => '<div class="wi">' + w + "</div>").join("") + "</div></div>";
  };

  T.challengesAll = (c) => {
    const cards = c.challenges.map((ch, i) =>
      '<div class="gcard item ir"><div class="item-n gold">' + (i + 1) + '</div>' +
      '<div class="item-t">' + ch.title + '</div><div class="item-d">' + ch.detail + "</div></div>").join("");
    return '<div class="cards head-row"><div class="gcard featured"><div class="kicker ir">Stop 5 · Challenges</div><h2 class="ir">Not every stretch was easy</h2></div></div>' +
      '<div class="items c4">' + cards + "</div>";
  };

  T.lens = (c) => {
    const l = c.changes;
    return '<div class="cards">' +
      '<div class="gcard featured"><div class="kicker ir">Stop 5 · What changed me</div><h2 class="ir" style="text-align:center;">A new pair of eyes</h2>' +
        '<div class="lenses">' +
          '<div class="lens ir"><div class="ring"></div><div class="lt">' + l.lensLeft.t + '</div><div class="ld">' + l.lensLeft.d + "</div></div>" +
          '<div class="lens ir"><div class="ring"></div><div class="lt">' + l.lensRight.t + '</div><div class="ld">' + l.lensRight.d + "</div></div>" +
        "</div>" +
        '<div class="bridge ir">' + l.bridge + "</div></div></div>";
  };

  T.noteCaption = (n, i, total) => {
    return '<div class="cards"><div class="gcard">' +
      '<div class="kicker ir">Field note ' + (i + 1) + " of " + total + "</div>" +
      '<h2 class="ir">' + n.caption + "</h2>" +
      '<div class="muted ir">from my field diary — as written on the day</div>' +
      "</div></div>";
  };

  /* photo galleries — full-width, big glass-framed images (DOM, crisp) */
  T.gallery = (c, group, idxLabel) => {
    const G = c.annexure[group];
    const ph = (p, cls) =>
      '<div class="ph ' + (cls || "") + '"><img src="' + (window.FIELD_IMG[p.img] || p.img) + '" alt="' + p.caption + '"><div class="cap">' + p.caption + "</div></div>";
    const P = G.photos;
    return '<div class="gcard featured">' +
      '<div class="kicker ir">Stop 6 · Annexure — ' + idxLabel + "</div><h2 class=\"ir\">" + G.title + "</h2>" +
      '<div class="gallery">' +
        ph(P[0]) + ph(P[1]) + ph(P[2]) + ph(P[3]) + ph(P[4]) + ph(P[5]) +
      "</div>" +
      '<div class="gal-hint ir">' + G.hint + "</div>" +
      "</div>";
  };

  T.thank = (c) => {
    const a = c.annexure;
    return '<div class="cards"><div class="gcard featured">' +
      '<div class="thank-big ir">Thank You</div>' +
      '<div class="thank-quote ir">' + a.closing + "</div>" +
      '<div class="thank-sign ir">' + a.signature + "</div>" +
      "</div></div>";
  };

  /* celebration confetti — a happy burst of falling glass tiles */
  function celebrate() {
    const host = ui();
    const COLORS = ["#3DFFA8", "#FFD97A", "#64D2FF", "#FF9F9F", "#B8FFDD"];
    const N = 90;
    for (let i = 0; i < N; i++) {
      const p = document.createElement("div");
      const size = 7 + Math.random() * 9;
      p.style.cssText = "position:absolute;top:-30px;left:" + (Math.random() * 100) + "vw;" +
        "width:" + size + "px;height:" + (size * (Math.random() > 0.5 ? 0.45 : 1)) + "px;" +
        "background:" + COLORS[i % COLORS.length] + ";" +
        "border-radius:" + (Math.random() > 0.6 ? "50%" : "3px") + ";" +
        "opacity:0.95;pointer-events:none;z-index:9;" +
        "box-shadow:0 0 8px rgba(255,255,255,0.25);";
      host.appendChild(p);
      const drift = (Math.random() - 0.5) * 220;
      const fall = 2.6 + Math.random() * 2.6;
      gsap.to(p, {
        y: window.innerHeight + 60, x: "+=" + drift,
        rotation: (Math.random() - 0.5) * 720,
        duration: fall, delay: Math.random() * 1.6,
        ease: Math.random() > 0.5 ? "power1.in" : "none",
        onComplete: () => p.remove()
      });
      gsap.to(p, { opacity: 0.4, duration: fall * 0.9, delay: fall * 0.5 });
    }
  }

  return { show, chip, clear, countUp, celebrate, T, get live() { return current; } };
})();
window.Overlay = Overlay;
