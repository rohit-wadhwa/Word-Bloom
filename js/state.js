/* state.js — persistent game state (localStorage) */
const State = (() => {
  const KEY = 'zenwords.save.v1';
  const DEFAULTS = { level: 1, coins: 100, muted: false, seenHelp: false };

  let data = load();

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return Object.assign({}, DEFAULTS, JSON.parse(raw));
    } catch (e) { /* ignore */ }
    return Object.assign({}, DEFAULTS);
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { /* ignore */ }
  }

  return {
    get level() { return data.level; },
    set level(v) { data.level = v; save(); },
    get coins() { return data.coins; },
    set coins(v) { data.coins = Math.max(0, v); save(); },
    get muted() { return data.muted; },
    set muted(v) { data.muted = v; save(); },
    get seenHelp() { return data.seenHelp; },
    set seenHelp(v) { data.seenHelp = v; save(); },
    addCoins(n) { this.coins = data.coins + n; return data.coins; },
  };
})();
