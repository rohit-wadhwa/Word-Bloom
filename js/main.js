/* main.js — bootstrap: load words, wire overlays, start the game. */
(async function () {
  // unlock audio + start on first interaction (autoplay policy)
  const unlock = () => { Sound.unlock(); window.removeEventListener('pointerdown', unlock); };
  window.addEventListener('pointerdown', unlock);

  try {
    await Generator.load('data/words.txt');
  } catch (e) {
    document.body.innerHTML = '<p style="color:#fff;text-align:center;margin-top:40vh">Could not load word list.</p>';
    return;
  }

  Game.init();

  const helpOverlay = document.getElementById('helpOverlay');
  const startBtn = document.getElementById('startBtn');
  if (!State.seenHelp) helpOverlay.classList.remove('hidden');
  startBtn.addEventListener('click', () => {
    State.seenHelp = true;
    helpOverlay.classList.add('hidden');
    Sound.unlock();
  });
})();
