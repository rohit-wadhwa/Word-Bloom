/* audio.js — lightweight WebAudio sound effects (no asset files needed). */
const Sound = (() => {
  let ctx = null;
  function ac() {
    if (!ctx) { try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} }
    if (ctx && ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(freq, dur, type = 'sine', gain = 0.12, when = 0) {
    if (State.muted) return;
    const a = ac(); if (!a) return;
    const t0 = a.currentTime + when;
    const osc = a.createOscillator();
    const g = a.createGain();
    osc.type = type; osc.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain, t0 + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g).connect(a.destination);
    osc.start(t0); osc.stop(t0 + dur + 0.02);
  }

  return {
    unlock() { ac(); },
    tap() { tone(420, 0.08, 'sine', 0.05); },
    found() { tone(523.25, 0.12, 'sine', 0.12); tone(783.99, 0.16, 'sine', 0.1, 0.06); },
    bonus() { tone(659.25, 0.1, 'triangle', 0.1); tone(987.77, 0.18, 'triangle', 0.09, 0.07); },
    wrong() { tone(196, 0.16, 'sawtooth', 0.06); },
    coin() { tone(880, 0.06, 'square', 0.05); tone(1318.5, 0.08, 'square', 0.05, 0.05); },
    win() {
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, 0.3, 'sine', 0.12, i * 0.11));
    },
  };
})();
