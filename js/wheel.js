/* wheel.js — circular letter wheel with swipe-to-connect tracing. */
const Wheel = (() => {
  let wheelEl, svgEl, previewEl;
  let nodes = [];            // {letter, x, y, el}
  let selected = [];         // indices into nodes
  let pointer = null;        // {x,y} current pointer in local coords
  let lastP = null;          // previous pointer position (for swipe-path detection)
  let dragging = false;
  let onSubmit = () => {};
  let nodeR = 28;

  function init(opts) {
    wheelEl = document.getElementById('wheel');
    svgEl = document.getElementById('wheelLines');
    previewEl = document.getElementById('preview');
    onSubmit = opts.onSubmit || onSubmit;

    wheelEl.addEventListener('pointerdown', onDown);
    wheelEl.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    window.addEventListener('resize', layout);
  }

  function setLetters(letters) {
    selected = []; dragging = false; pointer = null;
    nodes = letters.map(l => ({ letter: l.toUpperCase(), x: 0, y: 0, el: null }));
    wheelEl.querySelectorAll('.node').forEach(n => n.remove());
    nodes.forEach(n => {
      const b = document.createElement('div');
      b.className = 'node';
      b.textContent = n.letter;
      wheelEl.appendChild(b);
      n.el = b;
    });
    layout();
    redraw();
    updatePreview();
  }

  function shuffle() {
    for (let i = nodes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [nodes[i].letter, nodes[j].letter] = [nodes[j].letter, nodes[i].letter];
    }
    nodes.forEach(n => { n.el.textContent = n.letter; });
  }

  function layout() {
    if (!wheelEl) return;
    const size = wheelEl.clientWidth;
    svgEl.setAttribute('viewBox', `0 0 ${size} ${size}`);
    svgEl.setAttribute('width', size);
    svgEl.setAttribute('height', size);
    nodeR = Math.max(20, Math.min(34, size * 0.11));
    const cx = size / 2, cy = size / 2;
    const radius = size / 2 - nodeR - 6;
    const n = nodes.length;
    nodes.forEach((node, i) => {
      const ang = -Math.PI / 2 + (i * 2 * Math.PI) / n;
      node.x = cx + radius * Math.cos(ang);
      node.y = cy + radius * Math.sin(ang);
      node.el.style.width = node.el.style.height = (nodeR * 2) + 'px';
      node.el.style.left = (node.x - nodeR) + 'px';
      node.el.style.top = (node.y - nodeR) + 'px';
    });
    redraw();
  }

  function local(e) {
    const r = wheelEl.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }
  function hitNode(p) {
    for (let i = 0; i < nodes.length; i++) {
      const dx = p.x - nodes[i].x, dy = p.y - nodes[i].y;
      if (dx * dx + dy * dy <= (nodeR * 1.05) ** 2) return i;
    }
    return -1;
  }

  // Nodes whose circle the swipe segment a→b crosses, ordered along the segment.
  // This makes fast swipes reliable — sampled endpoints alone can skip a node.
  function segHits(a, b) {
    const dx = b.x - a.x, dy = b.y - a.y;
    const L2 = dx * dx + dy * dy || 1;
    const hits = [];
    for (let i = 0; i < nodes.length; i++) {
      let t = ((nodes[i].x - a.x) * dx + (nodes[i].y - a.y) * dy) / L2;
      t = Math.max(0, Math.min(1, t));
      const px = a.x + t * dx, py = a.y + t * dy;
      const d2 = (nodes[i].x - px) ** 2 + (nodes[i].y - py) ** 2;
      if (d2 <= (nodeR * 0.95) ** 2) hits.push({ i, t });
    }
    hits.sort((p, q) => p.t - q.t);
    return hits;
  }

  function consider(i) {
    if (selected.length >= 2 && i === selected[selected.length - 2]) selected.pop();
    else if (!selected.includes(i)) select(i);
  }

  function onDown(e) {
    e.preventDefault();
    dragging = true;
    selected = [];
    pointer = local(e);
    lastP = pointer;
    const i = hitNode(pointer);
    if (i >= 0) select(i);
    redraw(); updatePreview();
  }
  function onMove(e) {
    if (!dragging) return;
    pointer = local(e);
    const from = lastP || pointer;
    for (const h of segHits(from, pointer)) consider(h.i);
    lastP = pointer;
    redraw(); updatePreview();
  }
  function onUp() {
    if (!dragging) return;
    dragging = false;
    const word = selected.map(i => nodes[i].letter).join('');
    selected = []; pointer = null; lastP = null;
    redraw(); updatePreview();
    if (word.length >= 3) onSubmit(word);
  }

  function select(i) {
    selected.push(i);
    nodes[i].el.classList.add('sel');
    nodes[i].el.classList.remove('pulse'); void nodes[i].el.offsetWidth; nodes[i].el.classList.add('pulse');
  }

  function redraw() {
    nodes.forEach((n, i) => n.el.classList.toggle('sel', selected.includes(i)));
    if (!svgEl) return;
    const pts = selected.map(i => `${nodes[i].x},${nodes[i].y}`);
    let path = '';
    if (selected.length) {
      let d = pts.join(' ');
      if (dragging && pointer) d += ` ${pointer.x},${pointer.y}`;
      path = `<polyline points="${d}" />`;
      // joints
      path += selected.map(i =>
        `<circle cx="${nodes[i].x}" cy="${nodes[i].y}" r="6" class="joint"/>`).join('');
    }
    svgEl.innerHTML = path;
  }

  function updatePreview() {
    const word = selected.map(i => nodes[i].letter).join('');
    if (word) { previewEl.textContent = word; previewEl.classList.add('show'); }
    else previewEl.classList.remove('show');
  }

  return { init, setLetters, shuffle, layout };
})();
