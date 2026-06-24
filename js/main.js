/* main.js — bootstrap: splash, version, load words, register SW, wire overlays. */
(async function () {
  const BUILD = { version: '1.3.0', date: '2026-06-24' };

  const splash = document.getElementById('splash');
  const splashStart = performance.now();

  // show build version (splash + about panel)
  const vText = 'v' + BUILD.version;
  const splashVersion = document.getElementById('splashVersion');
  const aboutVersion = document.getElementById('aboutVersion');
  if (splashVersion) splashVersion.textContent = vText;
  if (aboutVersion) aboutVersion.textContent = vText + ' · ' + BUILD.date;

  // register service worker (PWA / offline) — non-blocking
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  }

  // unlock audio on first interaction (autoplay policy)
  const unlock = () => { Sound.unlock(); window.removeEventListener('pointerdown', unlock); };
  window.addEventListener('pointerdown', unlock);

  const helpOverlay = document.getElementById('helpOverlay');
  document.getElementById('startBtn').addEventListener('click', () => {
    State.seenHelp = true;
    helpOverlay.classList.add('hidden');
    Sound.unlock();
  });

  // About / menu panel
  const aboutOverlay = document.getElementById('aboutOverlay');
  document.getElementById('infoBtn').addEventListener('click', () => aboutOverlay.classList.remove('hidden'));
  document.getElementById('aboutCloseBtn').addEventListener('click', () => aboutOverlay.classList.add('hidden'));
  aboutOverlay.addEventListener('click', (e) => { if (e.target === aboutOverlay) aboutOverlay.classList.add('hidden'); });
  document.getElementById('hardRefreshBtn').addEventListener('click', hardRefresh);

  // Hard refresh: drop the service worker + caches and reload from network.
  async function hardRefresh() {
    const btn = document.getElementById('hardRefreshBtn');
    btn.textContent = 'Updating…'; btn.disabled = true;
    try {
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister()));
      }
      if (window.caches) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
    } catch (e) { /* ignore */ }
    location.reload();
  }

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

  const elapsed = performance.now() - splashStart;
  setTimeout(hideSplash, Math.max(0, 900 - elapsed));
})();
