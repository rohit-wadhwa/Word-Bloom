/* generator.js — builds a deterministic crossword puzzle per level.
 *
 * Pipeline for level N:
 *   1. Pick an "anchor" word; the letter wheel = the anchor's letters.
 *   2. Collect every common dictionary word formable from those letters (subset).
 *   3. Lay the most useful of those words onto an interlocking crossword grid.
 *   4. Remaining formable words become optional "bonus" words.
 */
const Generator = (() => {
  const A = 'a'.charCodeAt(0);
  let WORDS = [];                 // all dictionary words (common, 3..8)
  const RANK = new Map();         // word -> commonness rank (lower = more common)
  const COUNT = new Map();        // word -> Int8Array(26) letter counts
  const WORDSET = new Set();      // fast membership
  let anchors = [];               // ordered candidate anchor words

  /* ---- seeded RNG (mulberry32) so each level is reproducible ---- */
  function rng(seed) {
    let t = seed >>> 0;
    return () => {
      t += 0x6D2B79F5;
      let x = Math.imul(t ^ (t >>> 15), 1 | t);
      x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
      return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
    };
  }

  function letterCount(w) {
    const c = new Int8Array(26);
    for (let i = 0; i < w.length; i++) c[w.charCodeAt(i) - A]++;
    return c;
  }
  function isSubset(small, big) {
    for (let i = 0; i < 26; i++) if (small[i] > big[i]) return false;
    return true;
  }

  async function load(url) {
    const txt = await (await fetch(url)).text();
    WORDS = txt.split(/\s+/).map(s => s.trim().toLowerCase()).filter(Boolean);
    WORDS.forEach((w, i) => { RANK.set(w, i); COUNT.set(w, letterCount(w)); WORDSET.add(w); });
    // Candidate anchors: distinct-letter words, ordered by difficulty (length, then commonness),
    // deduped by letter-signature so anagram puzzles never repeat across levels.
    const bySig = new Map();
    WORDS
      .filter(w => w.length >= 3 && w.length <= 7 && new Set(w).size === w.length)
      .sort((a, b) => a.length - b.length || RANK.get(a) - RANK.get(b))
      .forEach(w => {
        const sig = w.length + ':' + [...w].sort().join('');
        if (!bySig.has(sig)) bySig.set(sig, w);   // keep most-common representative
      });
    anchors = [...bySig.values()].sort((a, b) => a.length - b.length || RANK.get(a) - RANK.get(b));
  }

  function isWord(w) { return WORDSET.has(w); }

  /* All formable words (>=3 letters) from a letter multiset, most-common first. */
  function formableFrom(letterStr) {
    const cap = letterCount(letterStr);
    const out = [];
    for (const w of WORDS) {
      if (w.length < 3 || w.length > letterStr.length) continue;
      if (isSubset(COUNT.get(w), cap)) out.push(w);
    }
    out.sort((a, b) => RANK.get(a) - RANK.get(b));
    return out;
  }

  /* ---- crossword placement ---- */
  // A placement: {word, r, c, dir} where dir 'H' or 'V'. Returns null if unplaceable.
  function buildCrossword(words, rand) {
    const grid = new Map();              // "r,c" -> letter
    const key = (r, c) => r + ',' + c;
    const placed = [];

    function canPlace(word, r, c, dir) {
      const dr = dir === 'V' ? 1 : 0, dc = dir === 'H' ? 1 : 0;
      let crossings = 0;
      // cell immediately before the word and after must be empty (no run-on)
      if (grid.has(key(r - dr, c - dc))) return -1;
      if (grid.has(key(r + dr * word.length, c + dc * word.length))) return -1;
      for (let i = 0; i < word.length; i++) {
        const rr = r + dr * i, cc = c + dc * i, ch = word[i];
        const cur = grid.get(key(rr, cc));
        if (cur !== undefined) {
          if (cur !== ch) return -1;       // conflict
          crossings++;
        } else {
          // perpendicular neighbours must be empty (avoid accidental adjacency)
          if (dir === 'H') {
            if (grid.has(key(rr - 1, cc)) || grid.has(key(rr + 1, cc))) return -1;
          } else {
            if (grid.has(key(rr, cc - 1)) || grid.has(key(rr, cc + 1))) return -1;
          }
        }
      }
      return crossings;
    }

    function put(word, r, c, dir) {
      const dr = dir === 'V' ? 1 : 0, dc = dir === 'H' ? 1 : 0;
      const cells = [];
      for (let i = 0; i < word.length; i++) {
        const rr = r + dr * i, cc = c + dc * i;
        grid.set(key(rr, cc), word[i]);
        cells.push({ r: rr, c: cc, ch: word[i] });
      }
      placed.push({ word, r, c, dir, cells });
    }

    // place the first (longest) word horizontally at origin
    put(words[0], 0, 0, 'H');

    for (let w = 1; w < words.length; w++) {
      const word = words[w];
      const options = [];
      for (const p of placed) {
        for (let i = 0; i < p.word.length; i++) {
          for (let j = 0; j < word.length; j++) {
            if (p.word[i] !== word[j]) continue;
            const dir = p.dir === 'H' ? 'V' : 'H';
            let r, c;
            if (dir === 'V') { r = p.r - j; c = p.c + i; }
            else { r = p.r + i; c = p.c - j; }
            const cr = canPlace(word, r, c, dir);
            if (cr >= 1) options.push({ r, c, dir, cr });
          }
        }
      }
      if (options.length) {
        options.sort((a, b) => b.cr - a.cr);     // prefer more crossings
        // light randomisation among equally-good options
        const best = options.filter(o => o.cr === options[0].cr);
        const pick = best[Math.floor(rand() * best.length)];
        put(word, pick.r, pick.c, pick.dir);
      }
    }

    if (placed.length < 2) return null;

    // normalise to non-negative coords
    let minR = Infinity, minC = Infinity, maxR = -Infinity, maxC = -Infinity;
    for (const [k] of grid) {
      const [r, c] = k.split(',').map(Number);
      minR = Math.min(minR, r); minC = Math.min(minC, c);
      maxR = Math.max(maxR, r); maxC = Math.max(maxC, c);
    }
    const rows = maxR - minR + 1, cols = maxC - minC + 1;
    placed.forEach(p => {
      p.r -= minR; p.c -= minC;
      p.cells.forEach(cell => { cell.r -= minR; cell.c -= minC; });
    });
    return { rows, cols, placed };
  }

  /* ---- difficulty shaping ----
   * Wheel grows slowly (3→7 letters) over many levels, and the number of board
   * words climbs, so the game ramps from trivially easy to genuinely big.
   */
  function wheelLen(level) {
    if (level <= 3) return 3;
    if (level <= 8) return 4;
    if (level <= 15) return 5;
    if (level <= 25) return 6;
    return 7;
  }
  function tierStart(len) {
    return len === 3 ? 1 : len === 4 ? 4 : len === 5 ? 9 : len === 6 ? 16 : 26;
  }
  function wantWords(level) { return Math.min(12, 2 + Math.floor(level / 3)); }

  // Anchor (wheel) familiarity cutoff by length: short wheels stay very familiar;
  // long wheels allow a wider vocabulary so deep levels stay fresh (board words are
  // always filtered to BOARD_COMMON, so the words you must find stay common regardless).
  function anchorCutoff(len) { return len <= 4 ? 3000 : len <= 6 ? 5500 : 9000; }
  const BOARD_COMMON = 4200;    // ONLY common words go on the board; rarer ones become bonus

  function strHash(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function commonFormable(anchor) {
    return formableFrom(anchor).filter(w => RANK.get(w) < BOARD_COMMON);
  }
  // Per-tier anchor pools: common wheels with enough common sub-words, ordered by a
  // stable hash so the level sequence feels varied instead of "most-common-first".
  const tierPools = {};
  function poolFor(len) {
    if (!tierPools[len]) {
      tierPools[len] = anchors
        .filter(a => a.length === len
          && RANK.get(a) < anchorCutoff(len)
          && commonFormable(a).length >= (len === 3 ? 2 : 3))
        .sort((a, b) => strHash(a) - strHash(b));
    }
    return tierPools[len];
  }

  /* Generate (and cache) the puzzle for a given level number (1-based). */
  const cache = new Map();
  function generate(level) {
    if (cache.has(level)) return cache.get(level);
    const rand = rng(level * 2654435761);

    const len = wheelLen(level);
    const pool = poolFor(len);
    if (!pool.length) return null;
    // deterministic, path-independent index within the tier → distinct consecutive puzzles
    const within = level - tierStart(len);
    const baseIdx = ((within % pool.length) + pool.length) % pool.length;
    const want = wantWords(level);

    for (let attempt = 0; attempt < pool.length; attempt++) {
      const anchor = pool[(baseIdx + attempt) % pool.length];
      const common = commonFormable(anchor);
      if (common.length < 2) continue;

      // board words: the showcase anchor + the most common formable words, capped to `want`
      let cand = common.filter(w => w !== anchor).slice(0, want);
      cand.push(anchor);
      cand = [...new Set(cand)].sort((a, b) => b.length - a.length || RANK.get(a) - RANK.get(b));

      const cross = buildCrossword(cand, rand);
      if (!cross || cross.placed.length < 2) continue;

      const boardWords = new Set(cross.placed.map(p => p.word));
      // bonus = every other formable word (extra common ones + rarer words) — never required
      const bonusWords = new Set(formableFrom(anchor).filter(w => !boardWords.has(w)));

      const puzzle = {
        level,
        letters: anchor.toUpperCase().split(''),
        rows: cross.rows,
        cols: cross.cols,
        placed: cross.placed.map(p => ({
          word: p.word.toUpperCase(), r: p.r, c: p.c, dir: p.dir,
          cells: p.cells.map(c => ({ r: c.r, c: c.c, ch: c.ch.toUpperCase() })),
        })),
        boardWords: new Set([...boardWords].map(w => w.toUpperCase())),
        bonusWords: new Set([...bonusWords].map(w => w.toUpperCase())),
      };
      cache.set(level, puzzle);
      return puzzle;
    }
    return null; // should not happen with a healthy word list
  }

  return { load, generate, isWord };
})();
