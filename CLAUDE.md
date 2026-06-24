# WordBloom - Project Memory

## What This Is

A **free, offline, browser-based word puzzle game**. Players swipe letters on a
circular wheel to spell words and fill an interlocking crossword. Calming, no
timer, no pressure. Pure static site - vanilla HTML/CSS/JS, no build step.

**Repository**: `rohit-wadhwa/Word-Bloom`
**Type**: Static web game (vanilla JS)
**License**: MIT
**Price**: Free

> Original, independent work. Not affiliated with or derived from any other word
> game. The name and all code/content are original.

## Owner & Contact

- **Owner**: Rohit Wadhwa
- **GitHub**: https://github.com/rohit-wadhwa
- **LinkedIn**: https://www.linkedin.com/in/rohit-wadhwa
- **Twitter**: https://twitter.com/RohitWadhwa52
- **Buy Me a Coffee**: https://www.buymeacoffee.com/rohit.wadhwa
- **Commit identity**: `rohit-wadhwa <2290963+rohit-wadhwa@users.noreply.github.com>`
  (commits should be attributed to the personal GitHub profile; no co-author trailers)

## Architecture

| File | Purpose |
|------|---------|
| `index.html` | App shell: HUD, board, wheel, overlays |
| `css/style.css` | Mobile-first layout, per-level themes, animations |
| `js/generator.js` | Deterministic crossword generation from `data/words.txt` |
| `js/board.js` | Crossword grid render + reveal tracking |
| `js/wheel.js` | Letter wheel + swipe-path letter tracing |
| `js/game.js` | Round controller: words, coins, hints, shuffle, win, themes |
| `js/state.js` | Progress/coins persistence (localStorage) |
| `js/audio.js` | WebAudio sound effects (no asset files) |
| `data/words.txt` | ~6,500 common English words (3-8 letters) |

### Level generation (js/generator.js)
- Per level N, pick an "anchor" word (distinct letters); the wheel = its letters.
- Find every common word formable from those letters; lay the most common ones
  into an interlocking crossword (greedy placement maximizing crossings); the
  rest become optional bonus words.
- Difficulty ramps the wheel from 4 to 7 letters. Generation is deterministic
  per level number and path-independent (a saved game at level 50 always shows
  the same puzzle).

### Key gameplay detail
The word-preview bubble is an absolute overlay - it must NOT be in normal flow,
or it reflows and shifts the wheel mid-swipe (caused dropped letters). Letter
selection uses swipe-path crossing (segment-to-node distance), not sampled
points, so fast swipes do not miss letters.

## Community & Support Files

- `.github/FUNDING.yml` - GitHub Sponsors (`rohit-wadhwa`) + Buy Me a Coffee (enables the repo Sponsor button)
- `.github/ISSUE_TEMPLATE/bug_report.md` and `feature_request.md`
- `.github/workflows/deploy.yml` - deploy to Vercel on a `v*` tag or manual run
  (needs secrets `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`)
- `SUPPORT.md`, `CHANGELOG.md`, `PRIVACY-POLICY.md`, `README.md`

## Testing

- Generator validated with a Node harness (no duplicate/failed puzzles across
  hundreds of levels; all words real).
- End-to-end with Playwright: solve a level via synthetic pointer events, assert
  win overlay, coins, hint deduction, and level advance, with zero console errors.

## Deploy

Static - deploy the repo root. Vercel: import the repo (zero-config, `vercel.json`
present) or use the deploy workflow. GitHub Pages also works (serve repo root).
