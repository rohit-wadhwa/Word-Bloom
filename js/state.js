/* state.js — persistent game state (localStorage) */
const State = (() => {
  const KEY = 'wordbloom.save.v1';
  const LEGACY_KEY = 'zenwords.save.v1';   // migrate older saves so progress is kept
  const DEFAULTS = { level: 1, coins: 100, muted: false, seenHelp: false };

  let data = load();

  function load() {
    try {
      const cur = localStorage.getItem(KEY);
      if (cur) return Object.assign({}, DEFAULTS, JSON.parse(cur));
      const legacy = localStorage.getItem(LEGACY_KEY);
      if (legacy) {
        const migrated = Object.assign({}, DEFAULTS, JSON.parse(legacy));
        localStorage.setItem(KEY, JSON.stringify(migrated));   // persist under new key now
        return migrated;
      }
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
