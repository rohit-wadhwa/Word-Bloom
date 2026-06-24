# WordBloom 🌿

A calming **word-connect crossword** puzzle game for the web. Swipe letters on the
wheel to spell words and fill the interlocking crossword. No timer, no pressure.

> An original, independent project. Not affiliated with, endorsed by, or derived
> from any other word game. All code and content here are original work.

**Play:** swipe across the wheel to connect letters → fill every word in the
crossword to clear the level. Words cross, so shared letters fill together. Find
extra valid words for bonus coins. Use 💡 hints (25 coins) or 🔀 shuffle anytime.

## Tech

Pure static site — vanilla HTML/CSS/JS, no build step, fully offline, deploys to
Vercel as-is.

| File | Purpose |
|------|---------|
| `index.html` | App shell (board, wheel, HUD, overlays) |
| `css/style.css` | Mobile-first responsive layout, per-level zen themes, animations |
| `js/generator.js` | Deterministic crossword generation from a common-word list |
| `js/board.js` | Crossword grid render + reveal tracking |
| `js/wheel.js` | Letter wheel + swipe-path letter tracing |
| `js/game.js` | Round controller: words, coins, hints, shuffle, win, themes |
| `js/state.js` | Progress/coins persistence (localStorage) |
| `js/audio.js` | WebAudio sound effects (no asset files) |
| `data/words.txt` | ~6,500 common English words (3–8 letters) |

Levels are generated deterministically per level number: a letter wheel is the
distinct letters of an "anchor" word; the most common words formable from those
letters are laid out as an interlocking crossword; the rest become bonus words.
Difficulty ramps the wheel size from 4 → 7 letters.

## Run locally

```bash
python3 -m http.server 8099   # then open http://localhost:8099
```

## Deploy

Static — deploy the repo root to Vercel (config in `vercel.json`).
