# WordBloom 🌿

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Vanilla JS](https://img.shields.io/badge/vanilla-JS-f7df1e.svg)](#tech)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](#contributing)

A calming **word-connect crossword** puzzle game for the web. Swipe letters on the
wheel to spell words and fill the interlocking crossword. No timer, no pressure.

> An original, independent project. Not affiliated with, endorsed by, or derived
> from any other word game. All code and content here are original work.

**Play:** swipe across the wheel to connect letters -> fill every word in the
crossword to clear the level. Words cross, so shared letters fill together. Find
extra valid words for bonus coins. Use 💡 hints (25 coins) or 🔀 shuffle anytime.

## Tech

Pure static site - vanilla HTML/CSS/JS, no build step, fully offline, deploys to
Vercel (or any static host) as-is.

| File | Purpose |
|------|---------|
| `index.html` | App shell (board, wheel, HUD, overlays) |
| `css/style.css` | Mobile-first responsive layout, per-level themes, animations |
| `js/generator.js` | Deterministic crossword generation from a common-word list |
| `js/board.js` | Crossword grid render + reveal tracking |
| `js/wheel.js` | Letter wheel + swipe-path letter tracing |
| `js/game.js` | Round controller: words, coins, hints, shuffle, win, themes |
| `js/state.js` | Progress/coins persistence (localStorage) |
| `js/audio.js` | WebAudio sound effects (no asset files) |
| `data/words.txt` | ~6,500 common English words (3-8 letters) |

Levels are generated deterministically per level number: the wheel is the distinct
letters of an "anchor" word; the most common words formable from those letters are
laid out as an interlocking crossword; the rest become bonus words. Difficulty
ramps the wheel size from 4 to 7 letters.

## Run locally

```bash
python3 -m http.server 8099   # then open http://localhost:8099
```

## Deploy

Static - deploy the repo root. **Vercel:** import the repo (zero-config, `vercel.json`
is included) or push a `v*` tag to run `.github/workflows/deploy.yml`. **GitHub Pages:**
serve the repo root.

## Contributing

Issues and PRs are welcome - please use the bug report and feature request
templates. See [SUPPORT.md](SUPPORT.md) for help and [CHANGELOG.md](CHANGELOG.md)
for release notes.

## Support

If you enjoy WordBloom, you can support development:

<a href="https://www.buymeacoffee.com/rohit.wadhwa"><img src="https://img.shields.io/badge/Buy%20Me%20a%20Coffee-ffdd00?style=flat&logo=buymeacoffee&logoColor=black" alt="Buy Me a Coffee" /></a>

## Connect

- GitHub: https://github.com/rohit-wadhwa
- LinkedIn: https://www.linkedin.com/in/rohit-wadhwa
- Twitter/X: https://twitter.com/RohitWadhwa52

## License

MIT © 2026 Rohit Wadhwa - see [LICENSE](LICENSE).
