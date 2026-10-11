/* ============================================================
   progress.js — the journey-line progress indicator (SVG).
   A hand-drawn ink path with 7 clover waypoints; grows per beat,
   clickable for Q&A jumps. Loaded after DOM ready.
   ============================================================ */
const Progress = (() => {
  const SECTIONS = [
    { id: "s1", label: "Origin" }, { id: "s2", label: "Objectives" },
    { id: "s3", label: "Area" }, { id: "s4", label: "Actions" },
    { id: "s5", label: "Gaps" }, { id: "s6", label: "Challenges" },
    { id: "s7", label: "Annexure" }
  ];
  let svg, wrap, label, waypoints = [], fillPath, fillLen, filledTo = 0;
  let jumpFn = null;      /* set by beat-engine */
  let hideTimer = null;

  const PATH = "M 12 44 C 120 20, 210 62, 330 42 C 440 24, 540 58, 640 38 C 700 28, 736 40, 748 42";

  function init() {
    svg = document.getElementById("progress-svg");
    wrap = document.getElementById("progress-wrap");
    label = document.getElementById("progress-label");

    /* faint background stroke */
    const bg = mk("path", { d: PATH, fill: "none", stroke: "rgba(245,235,197,0.22)",
      "stroke-width": 3.4, "stroke-linecap": "round", "stroke-dasharray": "1 7" });
    svg.appendChild(bg);

    /* green ink fill stroke */
    fillPath = mk("path", { d: PATH, fill: "none", stroke: "#7BBE55",
      "stroke-width": 3.6, "stroke-linecap": "round" });
    try { fillLen = fillPath.getTotalLength(); } catch (e) { fillLen = 760; }
    fillPath.style.strokeDasharray = fillLen;
    fillPath.style.strokeDashoffset = fillLen;
    svg.appendChild(fillPath);

    /* waypoints at roughly even spacing */
    const xs = [12, 138, 262, 385, 508, 630, 748];
    SECTIONS.forEach((s, i) => {
      const g = mk("g", { class: "wp future", "data-i": i });
      g.classList.add("future");
      /* clover shape = 4 tiny circles */
      [[-3.4, -3.4], [3.4, -3.4], [-3.4, 3.4], [3.4, 3.4]].forEach(([dx, dy]) => {
        const c = mk("circle", { cx: xs[i] + dx, cy: 42 + dy, r: 3.1 });
        g.appendChild(c);
      });
      const t = mk("text", { x: xs[i], y: 20, "text-anchor": "middle" });
      t.textContent = s.label;
      g.appendChild(t);
      g.addEventListener("click", () => { if (jumpFn) jumpFn(i); });
      svg.appendChild(g);
      waypoints.push(g);
    });
  }

  function mk(tag, attrs) {
    const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
    for (const k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }

  /* p = 0..1 overall journey progress */
  function setProgress(p, sectionIdx, sectionLabel) {
    if (!svg) return;
    fillPath.style.strokeDashoffset = fillLen * (1 - p);
    waypoints.forEach((g, i) => {
      g.classList.toggle("done", i < sectionIdx);
      g.classList.toggle("active", i === sectionIdx);
      g.classList.toggle("future", i > sectionIdx);
    });
    if (sectionLabel !== undefined) label.textContent = sectionLabel;
    peek();
  }

  function peek() {
    wrap.classList.add("show");
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => wrap.classList.remove("show"), 4200);
  }

  return { init, setProgress, peek, SECTIONS, set jumpFn(f) { jumpFn = f; } };
})();
window.Progress = Progress;
