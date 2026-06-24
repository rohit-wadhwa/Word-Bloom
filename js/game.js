/* game.js — ties the wheel, board, audio and state together. */
const Game = (() => {
  const HINT_COST = 25;
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
    document.getElementById('hintBtn').addEventListener('click', onHint);
    document.getElementById('shuffleBtn').addEventListener('click', () => { Sound.tap(); Wheel.shuffle(); });
    document.getElementById('nextBtn').addEventListener('click', nextLevel);
    els.muteBtn.addEventListener('click', toggleMute);
    refreshMute();
    window.addEventListener('resize', () => Board.fitTiles());
    loadLevel(State.level);
  }

  function loadLevel(level) {
    puzzle = Generator.generate(level);
    if (!puzzle) { level = 1; puzzle = Generator.generate(1); }
    foundBonus = new Set();
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
      Sound.found();
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
      Sound.bonus();
      toast('Bonus +' + BONUS_COINS + ' ◉');
      return;
    }
    Sound.wrong();
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

  function win() {
    Sound.win();
    State.addCoins(WIN_REWARD);
    updateHud();
    els.winReward.textContent = WIN_REWARD;
    setTimeout(() => els.winOverlay.classList.remove('hidden'), 550);
  }

  function nextLevel() { loadLevel(State.level + 1); }

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
