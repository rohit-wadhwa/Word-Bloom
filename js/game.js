/* game.js — ties the wheel, board, audio and state together. */
const Game = (() => {
  const HINT_COST = 25;          // reveal a single letter
  const REVEAL_WORD_COST = 60;   // reveal a whole word
  const WIN_REWARD = 20;
  const BONUS_COINS = 3;

  // Per-level palette (accent + calming background), cycled by level.
  const THEMES = [
    { accent: '#3f6fd1', bg: 'linear-gradient(180deg,#8fc0ff 0%,#cfe6ff 55%,#a7d9a0 100%)' },     // lake/blue
    { accent: '#e08a2e', bg: 'linear-gradient(180deg,#b9c3b0 0%,#d9d2bf 50%,#9bb089 100%)' },     // misty green
    { accent: '#d6249f', bg: 'linear-gradient(180deg,#ffb38a 0%,#ff8fb0 50%,#c66a9c 100%)' },     // sunset pink
    { accent: '#1f4e79', bg: 'linear-gradient(180deg,#bcd0e8 0%,#e8d6e0 45%,#a9c08f 100%)' },     // dawn navy
    { accent: '#dd4b2a', bg: 'linear-gradient(180deg,#c9b6b0 0%,#e6c3b0 45%,#b9c2cc 100%)' },     // alpine red
    { accent: '#2f8f7f', bg: 'linear-gradient(180deg,#a8e0d4 0%,#cdeee2 50%,#bfe0a8 100%)' },     // teal calm
  ];

  let puzzle = null;
  let foundBonus = new Set();
  let won = false;
  let els = {};

  function init() {
    els = {
      bg: document.getElementById('bg'),
      board: document.getElementById('board'),
      levelNum: document.getElementById('levelNum'),
      coinCount: document.getElementById('coinCount'),
      hintCost: document.getElementById('hintCost'),
      toast: document.getElementById('toast'),
      winOverlay: document.getElementById('winOverlay'),
      winReward: document.getElementById('winReward'),
      muteBtn: document.getElementById('muteBtn'),
    };
    Wheel.init({ onSubmit });
    els.hintCost.textContent = HINT_COST;
    const revealCost = document.getElementById('revealCost');
    if (revealCost) revealCost.textContent = REVEAL_WORD_COST;
    document.getElementById('hintBtn').addEventListener('click', onHint);
    document.getElementById('revealBtn').addEventListener('click', onRevealWord);
    document.getElementById('shuffleBtn').addEventListener('click', () => { Sound.tap(); Wheel.shuffle(); });
    document.getElementById('nextBtn').addEventListener('click', nextLevel);
    document.getElementById('shareBtn').addEventListener('click', shareWin);
    document.getElementById('shareScreenBtn').addEventListener('click', shareHelp);
    const aboutOverlay = document.getElementById('aboutOverlay');
    document.getElementById('restartBtn').addEventListener('click', () => { aboutOverlay.classList.add('hidden'); restartLevel(); });
    document.getElementById('helpShareBtn').addEventListener('click', () => { aboutOverlay.classList.add('hidden'); shareHelp(); });
    els.muteBtn.addEventListener('click', toggleMute);
    refreshMute();
    window.addEventListener('resize', () => Board.fitTiles());
    loadLevel(State.level);
  }

  function loadLevel(level) {
    puzzle = Generator.generate(level);
    if (!puzzle) { level = 1; puzzle = Generator.generate(1); }
    foundBonus = new Set();
    won = false;
    State.level = level;
    const theme = THEMES[(level - 1) % THEMES.length];
    document.documentElement.style.setProperty('--accent', theme.accent);
    els.bg.style.background = theme.bg;
    document.querySelector('meta[name=theme-color]').setAttribute('content', theme.accent);
    els.levelNum.textContent = level;
    Board.render(puzzle, els.board);
    Wheel.setLetters(puzzle.letters);
    updateHud();
    els.winOverlay.classList.add('hidden');
  }

  function onSubmit(raw) {
    const word = raw.toUpperCase();
    const res = Board.submitWord(word);
    if (res === 'found') {
      Sound.found(); haptic(15);
      if (Board.isComplete()) return win();
      return;
    }
    if (res === 'already') { Sound.tap(); return; }

    // not a board word — maybe a bonus word
    if (puzzle.bonusWords.has(word)) {
      if (foundBonus.has(word)) { toast('Already found'); Sound.tap(); return; }
      foundBonus.add(word);
      State.addCoins(BONUS_COINS);
      updateHud();
      Sound.bonus(); haptic(20);
      toast('Bonus +' + BONUS_COINS + ' ◉');
      return;
    }
    Sound.wrong(); haptic([0, 25, 40, 25]);
    shakePreview();
  }

  function onHint() {
    if (Board.isComplete()) return;
    if (State.coins < HINT_COST) { toast('Not enough coins'); Sound.wrong(); return; }
    if (Board.useHint()) {
      State.addCoins(-HINT_COST);
      updateHud();
      Sound.coin();
      if (Board.isComplete()) win();
    }
  }

  function onRevealWord() {
    if (Board.isComplete() || !Board.hasUnfound()) return;
    if (State.coins < REVEAL_WORD_COST) { toast('Not enough coins'); Sound.wrong(); return; }
    if (Board.revealWordHint()) {
      State.addCoins(-REVEAL_WORD_COST);
      updateHud();
      Sound.found(); haptic(15);
      if (Board.isComplete()) win();
    }
  }

  function win() {
    if (won) return;          // idempotent per level
    won = true;
    Sound.win(); haptic([0, 40, 30, 60]);
    confetti();
    State.addCoins(WIN_REWARD);
    updateHud();
    els.winReward.textContent = WIN_REWARD;
    setTimeout(() => els.winOverlay.classList.remove('hidden'), 550);
  }

  function haptic(pattern) {
    if (navigator.vibrate) { try { navigator.vibrate(pattern); } catch (e) { /* ignore */ } }
  }

  function confetti() {
    const colors = ['#ffd34d', '#46c178', '#ff7eb6', '#6c63ff', '#ff9f43', '#4dd0e1'];
    const layer = document.createElement('div');
    layer.className = 'confetti';
    for (let i = 0; i < 44; i++) {
      const p = document.createElement('i');
      p.style.left = (Math.random() * 100) + 'vw';
      p.style.background = colors[i % colors.length];
      p.style.animationDuration = (1.6 + Math.random() * 1.4) + 's';
      p.style.animationDelay = (Math.random() * 0.3) + 's';
      layer.appendChild(p);
    }
    document.body.appendChild(layer);
    setTimeout(() => layer.remove(), 3600);
  }

  function nextLevel() { loadLevel(State.level + 1); }
  function restartLevel() { loadLevel(State.level); }

  /* ---- sharing (native share sheet → one friend/app at a time) ---- */
  function roundRect(x, rx, ry, w, h, r) {
    x.beginPath();
    x.moveTo(rx + r, ry);
    x.arcTo(rx + w, ry, rx + w, ry + h, r);
    x.arcTo(rx + w, ry + h, rx, ry + h, r);
    x.arcTo(rx, ry + h, rx, ry, r);
    x.arcTo(rx, ry, rx + w, ry, r);
    x.closePath();
  }

  // Render a shareable PNG card. mode 'win' shows the solved crossword; mode 'help'
  // shows the current progress (blanks for unfound cells) + the wheel letters so a
  // friend can actually help.
  function makeCard(mode) {
    return new Promise((resolve) => {
      try {
        const pad = 36, W = 640, gap = 5;
        const cols = puzzle.cols, rows = puzzle.rows;
        // size tiles by width AND height so big boards never produce a huge canvas
        const tile = Math.max(24, Math.min(58, Math.floor((W - pad * 2) / cols), Math.floor(760 / rows)));
        const gridW = tile * cols, gridH = tile * rows;
        const headerH = 158, wheelH = mode === 'help' ? 110 : 0, footerH = 64;
        const H = headerH + gridH + wheelH + footerH;
        const s = 2;
        const cv = document.createElement('canvas'); cv.width = W * s; cv.height = H * s;
        const x = cv.getContext('2d'); x.scale(s, s);
        const theme = THEMES[(State.level - 1) % THEMES.length];
        const bg = x.createLinearGradient(0, 0, 0, H);
        bg.addColorStop(0, '#ffffff'); bg.addColorStop(1, '#eaf0fb');
        x.fillStyle = bg; x.fillRect(0, 0, W, H);
        x.textAlign = 'center';
        x.fillStyle = theme.accent; x.font = '800 42px -apple-system, Arial';
        x.fillText('WordBloom 🌿', W / 2, 60);
        x.fillStyle = '#2a2f45'; x.font = '800 28px -apple-system, Arial';
        x.fillText(mode === 'win' ? 'Level ' + State.level + ' Complete!' : 'Help me solve Level ' + State.level + '!', W / 2, 104);

        // current revealed state (help mode) from the live board
        const revealed = {};
        if (mode === 'help') {
          document.querySelectorAll('#board .cell').forEach((n) => {
            const r = (+n.style.gridRow) - 1, c = (+n.style.gridColumn) - 1;
            revealed[r + ',' + c] = n.classList.contains('filled');
          });
        }
        const ox = (W - gridW) / 2, oy = headerH;
        x.textBaseline = 'middle';
        for (const p of puzzle.placed) for (const c of p.cells) {
          const cx = ox + c.c * tile, cy = oy + c.r * tile;
          const filled = mode === 'win' || revealed[c.r + ',' + c.c];
          roundRect(x, cx + gap / 2, cy + gap / 2, tile - gap, tile - gap, 8);
          x.fillStyle = filled ? theme.accent : 'rgba(150,160,180,.28)'; x.fill();
          if (filled) {
            x.fillStyle = '#fff'; x.font = '800 ' + Math.floor(tile * 0.5) + 'px -apple-system, Arial';
            x.fillText(c.ch, cx + tile / 2, cy + tile / 2 + 1);
          }
        }

        // wheel letters (help mode) so a friend knows the available letters
        if (mode === 'help') {
          const r = 25, cy = headerH + gridH + 54;
          const letters = puzzle.letters;
          const totalW = letters.length * (r * 2 + 10) - 10;
          let lx = (W - totalW) / 2 + r;
          x.font = '800 24px -apple-system, Arial';
          for (const L of letters) {
            x.beginPath(); x.arc(lx, cy, r, 0, Math.PI * 2); x.fillStyle = theme.accent; x.fill();
            x.fillStyle = '#fff'; x.fillText(L, lx, cy + 1);
            lx += r * 2 + 10;
          }
        }
        x.textBaseline = 'alphabetic';
        x.fillStyle = '#8a90a2'; x.font = '600 20px -apple-system, Arial';
        x.fillText('Play at ' + location.host, W / 2, H - 24);
        cv.toBlob((b) => resolve(b), 'image/png');
      } catch (e) { resolve(null); }
    });
  }

  async function shareCard(mode, text) {
    const url = location.origin + location.pathname;
    const withLink = text + '\n' + url;   // link must live in the text: many apps drop the url field when a file is attached
    try {
      const blob = await makeCard(mode);
      if (blob && navigator.canShare) {
        const file = new File([blob], 'wordbloom-' + mode + '-' + State.level + '.png', { type: 'image/png' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], text: withLink, title: 'WordBloom' });
          return;
        }
      }
      if (navigator.share) { await navigator.share({ title: 'WordBloom', text: withLink, url }); return; }
      fallbackShare(withLink);
    } catch (e) { /* cancelled */ }
  }

  function shareWin() {
    shareCard('win', 'I solved Level ' + State.level + ' on WordBloom! 🌿 Can you?');
  }
  function shareHelp() {
    shareCard('help', 'Stuck on Level ' + State.level + ' of WordBloom! Letters: '
      + puzzle.letters.join('') + '. Can you help me solve it? 🌿');
  }

  function fallbackShare(s) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(s).then(() => toast('Copied to clipboard')).catch(() => toast('Sharing not supported'));
    } else { toast('Sharing not supported'); }
  }

  function updateHud() { els.coinCount.textContent = State.coins; }

  function toggleMute() { State.muted = !State.muted; refreshMute(); if (!State.muted) Sound.unlock(); }
  function refreshMute() { els.muteBtn.textContent = State.muted ? '🔇' : '🔊'; }

  let toastTimer = null;
  function toast(msg) {
    els.toast.textContent = msg;
    els.toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => els.toast.classList.remove('show'), 1100);
  }

  function shakePreview() {
    const p = document.getElementById('preview');
    p.classList.add('show', 'shake');
    setTimeout(() => { p.classList.remove('shake'); p.classList.remove('show'); }, 360);
  }

  return { init, loadLevel };
})();
