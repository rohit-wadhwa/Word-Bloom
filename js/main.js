/* main.js — bootstrap: splash, load words, register SW, wire overlays, start. */
(async function () {
  const splash = document.getElementById('splash');
  const splashStart = performance.now();

  // register service worker (PWA / offline) — non-blocking
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  }

  // unlock audio on first interaction (autoplay policy)
  const unlock = () => { Sound.unlock(); window.removeEventListener('pointerdown', unlock); };
  window.addEventListener('pointerdown', unlock);

  const helpOverlay = document.getElementById('helpOverlay');
  const startBtn = document.getElementById('startBtn');
  startBtn.addEventListener('click', () => {
    State.seenHelp = true;
    helpOverlay.classList.add('hidden');
    Sound.unlock();
  });

  function hideSplash() {
    splash.classList.add('hide');
    setTimeout(() => splash.remove(), 500);
    if (!State.seenHelp) helpOverlay.classList.remove('hidden');
  }

  try {
    await Generator.load('data/words.txt');
  } catch (e) {
    splash.innerHTML = '<p style="color:#fff;text-align:center;padding:0 24px">Could not load word list.<br>Check your connection and reload.</p>';
    return;
  }

  Game.init();

  // keep the splash up briefly so it doesn't flash on fast loads
  const elapsed = performance.now() - splashStart;
  setTimeout(hideSplash, Math.max(0, 900 - elapsed));
})();
