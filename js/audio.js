/* audio.js — warm, calming piano-style sound effects (WebAudio, no asset files).
 * Notes follow a major-pentatonic scale, so any sequence of letters sounds
 * pleasant and rises in pitch as you connect more — like Zen Word / Wordscapes.
 */
const Sound = (() => {
  let ctx = null, master = null;
  function ac() {
    if (!ctx) {
      try {
        ctx = new (window.AudioContext || window.webkitAudioContext)();
        master = ctx.createGain(); master.gain.value = 0.5; master.connect(ctx.destination);
      } catch (e) { /* ignore */ }
    }
    if (ctx && ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  // A soft, piano/bell-like note: fundamental + a quiet octave, gentle attack & decay.
  function piano(freq, dur, gain, when) {
    if (State.muted) return;
    const a = ac(); if (!a) return;
    dur = dur || 0.55; gain = gain || 0.2; when = when || 0;
    const t0 = a.currentTime + when;
    const g = a.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    g.connect(master);
    const o1 = a.createOscillator(); o1.type = 'sine'; o1.frequency.setValueAtTime(freq, t0);
    const o2 = a.createOscillator(); o2.type = 'sine'; o2.frequency.setValueAtTime(freq * 2, t0);
    const g2 = a.createGain(); g2.gain.value = 0.3; o2.connect(g2).connect(g);
    o1.connect(g);
    // tear the node graph down when the note ends, so fast tracing doesn't pile up nodes
    o1.onended = () => { try { o1.disconnect(); o2.disconnect(); g.disconnect(); g2.disconnect(); } catch (e) { /* ignore */ } };
    o1.start(t0); o2.start(t0); o1.stop(t0 + dur + 0.05); o2.stop(t0 + dur + 0.05);
  }

  // C major pentatonic over two-plus octaves — every combination is consonant.
  const SCALE = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00, 1046.50, 1174.66, 1318.51];

  return {
    unlock() { ac(); },
    // played per letter as you trace — rising pitch with each connected letter
    note(step) { piano(SCALE[Math.max(0, Math.min(step, SCALE.length - 1))], 0.5, 0.2); },
    tap() { piano(SCALE[0], 0.3, 0.12); },
    found() {
      piano(523.25, 0.5, 0.2); piano(659.25, 0.55, 0.18, 0.06); piano(783.99, 0.6, 0.16, 0.12);
    },
    bonus() { piano(659.25, 0.4, 0.16); piano(987.77, 0.5, 0.14, 0.06); piano(1318.51, 0.55, 0.12, 0.12); },
    wrong() { piano(220, 0.3, 0.12); piano(207.65, 0.34, 0.1, 0.04); }, // soft, low — not harsh
    coin() { piano(880, 0.25, 0.12); piano(1318.51, 0.3, 0.1, 0.05); },
    win() { [523.25, 659.25, 783.99, 1046.50, 1318.51].forEach((f, i) => piano(f, 0.7, 0.2, i * 0.1)); },
  };
})();
