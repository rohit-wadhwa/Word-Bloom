/* state.js — persistent game state (localStorage) */
const State = (() => {
  const KEY = 'wordbloom.save.v1';
  const LEGACY_KEY = 'zenwords.save.v1';   // migrate older saves so progress is kept
  const DEFAULTS = {
    level: 1, coins: 150, muted: false, seenHelp: false,
    streak: 0, bestStreak: 0, lastPlayed: '',
    wordsFound: 0, bonusFound: 0, levelsDone: 0, jar: 0,
  };

  let data = load();

  function load() {
    try {
      const cur = localStorage.getItem(KEY);
      if (cur) return Object.assign({}, DEFAULTS, JSON.parse(cur));
      const legacy = localStorage.getItem(LEGACY_KEY);
      if (legacy) {
        const migrated = Object.assign({}, DEFAULTS, JSON.parse(legacy));
        localStorage.setItem(KEY, JSON.stringify(migrated));
        return migrated;
      }
    } catch (e) { /* ignore */ }
    return Object.assign({}, DEFAULTS);
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { /* ignore */ }
  }

  function today() {
    const d = new Date();
    return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
  }
  function dayDiff(a, b) {
    const pa = a.split('-').map(Number), pb = b.split('-').map(Number);
    return Math.round((Date.UTC(pb[0], pb[1] - 1, pb[2]) - Date.UTC(pa[0], pa[1] - 1, pa[2])) / 86400000);
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
    get streak() { return data.streak; },
    get bestStreak() { return data.bestStreak; },
    get wordsFound() { return data.wordsFound; },
    get bonusFound() { return data.bonusFound; },
    get levelsDone() { return data.levelsDone; },
    get jar() { return data.jar; },

    addCoins(n) { this.coins = data.coins + n; return data.coins; },

    // update the daily streak once per day; returns the current streak
    touchDaily() {
      const t = today();
      if (data.lastPlayed === t) return data.streak;
      const diff = data.lastPlayed ? dayDiff(data.lastPlayed, t) : 999;
      data.streak = (diff === 1) ? data.streak + 1 : 1;
      data.lastPlayed = t;
      if (data.streak > data.bestStreak) data.bestStreak = data.streak;
      save();
      return data.streak;
    },
    recordWord() { data.wordsFound++; save(); },
    recordBonus() { data.bonusFound++; data.jar++; save(); },
    resetJar() { data.jar = 0; save(); },
    recordLevel() { data.levelsDone++; save(); },
  };
})();
