/* board.js — renders the interlocking crossword grid and tracks reveals. */
const Board = (() => {
  let el = null;
  let puzzle = null;
  let cells = new Map();   // "r,c" -> {r,c,ch,revealed,node}
  let words = [];          // {word, cells:[cellRef...], found}

  const key = (r, c) => r + ',' + c;

  function render(p, container) {
    el = container;
    puzzle = p;
    cells = new Map();
    words = [];
    el.innerHTML = '';
    el.style.setProperty('--rows', p.rows);
    el.style.setProperty('--cols', p.cols);

    // build cell refs
    for (const placed of p.placed) {
      const wordCells = [];
      for (const cell of placed.cells) {
        const k = key(cell.r, cell.c);
        let ref = cells.get(k);
        if (!ref) {
          const node = document.createElement('div');
          node.className = 'cell';
          node.style.gridRow = (cell.r + 1);
          node.style.gridColumn = (cell.c + 1);
          el.appendChild(node);
          ref = { r: cell.r, c: cell.c, ch: cell.ch, revealed: false, node };
          cells.set(k, ref);
        }
        wordCells.push(ref);
      }
      words.push({ word: placed.word, cells: wordCells, found: false });
    }
    fitTiles();
  }

  function fitTiles() {
    if (!puzzle) return;
    const maxW = el.clientWidth || window.innerWidth;
    const maxH = el.clientHeight || (window.innerHeight * 0.42);
    const gap = 4;
    let size = Math.floor(Math.min(
      (maxW - gap * (puzzle.cols + 1)) / puzzle.cols,
      (maxH - gap * (puzzle.rows + 1)) / puzzle.rows
    ));
    size = Math.max(22, Math.min(size, 64));
    el.style.setProperty('--tile', size + 'px');
    el.style.setProperty('--gap', gap + 'px');
  }

  function revealCell(ref, cls) {
    if (ref.revealed) return false;
    ref.revealed = true;
    ref.node.textContent = ref.ch;
    ref.node.classList.add('filled');
    if (cls) ref.node.classList.add(cls);
    // retrigger pop animation
    ref.node.classList.remove('pop'); void ref.node.offsetWidth; ref.node.classList.add('pop');
    return true;
  }

  function checkCompleted() {
    for (const w of words) {
      if (!w.found && w.cells.every(c => c.revealed)) w.found = true;
    }
  }

  // Try to mark a guessed word as found. Returns 'found' | 'already' | null.
  function submitWord(guess) {
    const w = words.find(x => x.word === guess);
    if (!w) return null;
    if (w.found) { flash(w); return 'already'; }
    w.cells.forEach(c => revealCell(c, null));
    w.found = true;
    return 'found';
  }

  function flash(w) {
    w.cells.forEach(c => {
      c.node.classList.remove('flash'); void c.node.offsetWidth; c.node.classList.add('flash');
    });
  }

  // Hint: reveal one hidden cell of an as-yet-unfound word. Returns true if used.
  function useHint() {
    const candidates = words.filter(w => !w.found);
    if (!candidates.length) return false;
    // prefer the word closest to completion for a satisfying assist
    candidates.sort((a, b) =>
      a.cells.filter(c => !c.revealed).length - b.cells.filter(c => !c.revealed).length);
    for (const w of candidates) {
      const hidden = w.cells.find(c => !c.revealed);
      if (hidden) { revealCell(hidden, 'hint'); checkCompleted(); return true; }
    }
    return false;
  }

  function isComplete() { return words.length > 0 && words.every(w => w.found); }

  return { render, submitWord, useHint, isComplete, fitTiles };
})();
