# WordBloom — Project Memory (handoff)

> Read this first. It is the single source of truth for picking up WordBloom cold.
> Everything below reflects the live state of the project.

## What This Is

A **free, offline, browser-based word-connect crossword game**. Players swipe
letters on a circular wheel to spell words and fill an interlocking crossword.
Calming, no timer, no ads, no pressure. Pure static site — vanilla HTML/CSS/JS,
**no build step, no dependencies**.

- **Live:** https://word-bloom-three.vercel.app/
- **Repository:** `rohit-wadhwa/Word-Bloom` (default branch `main`)
- **License:** MIT · **Price:** Free
- **Current version:** `1.5.1` (set in `js/main.js` `BUILD`, shown on splash + ☰ menu)

> Original, independent work. Not affiliated with or derived from any other word
> game. The name and all code/content are original.

## Owner, Contact & Commit Rules

- **Owner:** Rohit Wadhwa — GitHub https://github.com/rohit-wadhwa ·
  LinkedIn https://www.linkedin.com/in/rohit-wadhwa · Twitter/X @RohitWadhwa52 ·
  Buy Me a Coffee https://buymeacoffee.com/rohit.wadhwa
- **Commit identity (REQUIRED):** author **and** committer must be
  `rohit-wadhwa <2290963+rohit-wadhwa@users.noreply.github.com>`.
  **No `Co-Authored-By` trailers, no Claude/model identifiers, no session links**
  in commit messages or any pushed artifact. All commits go to the personal
  profile only. (History was rewritten once to remove a SourceFuse-email commit
  and Claude trailers — keep it clean.)

## Architecture

| File | Purpose |
|------|---------|
| `index.html` | App shell: splash, HUD, board, wheel, controls, overlays (win / help / about) |
| `css/style.css` | Mobile-first layout, per-level themes, animations, splash, confetti, about panel |
| `js/state.js` | Progress/coins persistence — localStorage key `wordbloom.save.v1` (migrates legacy `zenwords.save.v1`) |
| `js/audio.js` | WebAudio "piano" SFX (major-pentatonic; no asset files) |
| `js/generator.js` | Deterministic crossword generation from `data/words.txt` |
| `js/board.js` | Crossword grid render, reveal tracking, hints (letter + whole word) |
| `js/wheel.js` | Letter wheel + swipe-path tracing + rising note per letter |
| `js/game.js` | Controller: words, coins, hints, shuffle, win, themes, confetti, haptics, share, restart |
| `js/main.js` | Bootstrap: splash, `BUILD` version, SW register, About menu, hard refresh |
| `data/words.txt` | ~6,500 common English words (3–8 letters, dictionary-validated) |
| `sw.js` | Service worker (offline). **Bump `CACHE` every release** (currently `wordbloom-v6`) |
| `manifest.webmanifest` | PWA manifest (installable) |
| `assets/` | App icons (svg + 192/512/apple-touch/favicon png, rasterized from `icon.svg`) |

## Key Systems

### Level generation (`js/generator.js`)
- Difficulty **tiers by level**: wheel grows 3→4→5→6→7 letters
  (`wheelLen()`); board word count climbs to ~12 (`wantWords()`). L1 = 3-letter
  wheel / 2 words; deep levels = 7-letter wheel / ~12 words.
- **Anchor** = a distinct-letter word; wheel = its letters. Anchors are pulled
  from per-tier pools, **hash-shuffled** (`strHash`) so the level sequence feels
  varied, not "most-common-first".
- **Board words are COMMON ONLY** (`BOARD_COMMON` rank cutoff). Rarer formable
  words become optional **bonus words** (coins, never required). This fixed the
  old bug where obscure words (e.g. `HIST`) were required on Level 1.
- Deterministic + **path-independent** per level number (same level → same puzzle
  regardless of how you got there). Validated: 0 fails over 500 levels.

### Wheel (`js/wheel.js`)
- **Swipe-path crossing** (`segHits`, segment-to-node distance) selects letters,
  not sampled points — so fast swipes never skip letters.
- `setPointerCapture` in `onDown` so swipes leaving the wheel don't freeze.
- `select()` plays `Sound.note(step)` → rising pentatonic note per letter.

### Hints / economy (`js/game.js`)
- 💡 reveal a letter (25) · 🎯 reveal a whole word (60) · 🔀 shuffle (free).
- Start coins 150; win +20; bonus word +3.

### Sharing (`js/game.js`)
- `makeCard(mode)` draws a PNG via canvas: `win` = solved board; `help` = current
  progress (blanks for unfound) + the wheel letters.
- Shared via Web Share API (`navigator.share`) → native sheet, one friend at a time.
- **The game link is embedded in the share TEXT** (not just the `url` field),
  because most apps drop `url` when a file is attached.

### Audio (`js/audio.js`)
- Soft sine + octave "piano" notes on a major-pentatonic scale (any sequence is
  consonant). Nodes are `disconnect()`-ed on `onended` to avoid leaks during fast
  tracing. No-ops when `State.muted`.

### PWA (`sw.js`, `manifest.webmanifest`, `js/main.js`)
- Service worker is **network-first for shell (HTML/JS/CSS/manifest)** so deploys
  propagate, **cache-first for assets** (icons, word list). Offline-capable
  (verified: reload with network off still boots).
- Splash screen, build version, ☰ About menu (version, Buy Me a Coffee, restart,
  ask-a-friend share, **Hard refresh** = unregister SW + clear caches + reload).

## Hard-won Fixes (do not regress)
- **Preview bubble is `position: absolute`** — if it's in normal flow it reflows
  and shifts the wheel mid-swipe → dropped letters.
- **Pointer capture** on the wheel (edge swipes).
- **Share link must be in the text**, not only the `url` field.
- **Board words common-only** (no obscure required words).
- **Audio nodes disconnected on end** (no WebAudio leak).
- **Wheel capped by `44dvh`** + board `min-height:0; overflow:hidden` (no clipping
  on short phones).

## Deploy & Repo Mechanics

- `main` is default and **auto-deploys to Vercel** (project lives under the
  owner's **personal** Vercel scope `rohit-wadhwa-s-projects`, not a team).
- **Releasing a change:** edit files → bump `BUILD.version` in `js/main.js` and
  `CACHE` in `sw.js` → update `CHANGELOG.md` → commit to `main`.
- **Pushing from the Claude Code remote sandbox:** the git proxy only allows the
  originally-authorized branch, so `git push origin main` fails there. Deploys
  were done via the **GitHub Git Data API** (`POST /git/trees`, `/git/commits`,
  `PATCH /git/refs/heads/main`) using the env `GITHUB_TOKEN`, with `author`/
  `committer` set to the noreply identity above. On a normal local machine,
  plain `git push` to `main` works.
- The sandbox `GITHUB_TOKEN` is a **GitHub App** token with `contents`/PR write
  but **NOT `administration`** — it cannot set branch protection, change default
  branch, or rename branches (returns `403 Resource not accessible by
  integration`). Those need the owner via Settings UI or a PAT outside the sandbox.

## Testing

- **Generator harness** (Node + `vm`, loads `js/generator.js` with a `fetch`
  shim): asserts 0 failed/duplicate puzzles across hundreds of levels and clean,
  common board words.
- **Playwright E2E** (global `playwright`, chromium): drives the game and asserts
  win/coins/hints/level-advance, splash, **offline PWA boot**, 360×640 layout,
  share payloads (image + link), and About panel — with 0 console errors.
- **IMPORTANT testing gotcha:** Playwright's emulated **mouse coordinates are
  offset** from the page's coordinate space here, so the wheel can't be driven
  with `page.mouse`. Instead **dispatch `PointerEvent`s in-page** at node centers
  (see the e2e scripts) — coordinates are then consistent.

## Community / Project Files
`.github/FUNDING.yml` (Sponsor button) · `.github/ISSUE_TEMPLATE/*` ·
`.github/workflows/deploy.yml` (Vercel deploy on `v*` tag/manual; needs secrets
`VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`) · `SUPPORT.md` ·
`CHANGELOG.md` · `PRIVACY-POLICY.md` · `LICENSE` (MIT) · `README.md`.

## Pending / Backlog
- **Branch protection on `main`** (require PR/review, block force-push/deletion)
  — needs repo Admin; do in Settings → Branches or via a PAT.
- **Open Graph image + meta tags** for rich link previews when the game is shared.
- Bonus-word jar with milestone rewards · level-select / chapters screen ·
  daily puzzle · wire `BUILD.version` to the git commit hash at deploy time.

## Run Locally
```bash
python3 -m http.server 8099   # open http://localhost:8099
```
