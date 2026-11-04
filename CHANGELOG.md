# Changelog

All notable changes to WordBloom will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/), and this project adheres to [Semantic Versioning](https://semver.org/).

## [1.5.1] - 2026-06-24

### Fixed
- Share now puts the game link inside the message text, so the link travels
  with the screenshot — many apps drop the separate URL field when an image
  is attached, which left shares without a link.

## [1.5.0] - 2026-06-24

### Added
- On-screen Share button (↗) in the top bar — share a win or ask a friend for help.
- Help share now attaches an image of your current puzzle (progress + the
  available wheel letters) so anyone can see it and help.

### Changed
- Warm piano-style sound: connecting letters plays gently rising notes
  (calming, Zen-like), with pleasant chords for found words and wins.
- Clearer high-contrast top-bar buttons; the menu is now a ☰ icon.
- Audio nodes are torn down after each note; small-screen HUD tuned.

## [1.4.0] - 2026-06-24

### Added
- Restart option (in the ⓘ menu) to replay the current level from scratch.
- Share your win as a generated image card via the native share sheet —
  sent to one friend/app at a time.
- "Ask a friend for help" share that includes the level's letters so a
  friend can help you solve it.

### Changed
- Service worker cache bumped to v4; build version 1.4.0.

## [1.3.0] - 2026-06-24

### Added
- About / menu panel (ⓘ in the top bar) showing the build version, a
  "Buy me a coffee" button, and a "Hard refresh" action.
- Hard refresh clears the service worker and caches and reloads from the
  network, so players can always pull the latest deployed build.

### Changed
- Service worker cache bumped to v3.

## [1.2.0] - 2026-06-24

### Changed
- Reworked difficulty: a gentle ramp from 3-letter wheels (2 words) up to
  7-letter wheels with ~12 words, spread over many levels.
- The board now uses only common words; rarer formable words are optional
  bonus words (no more obscure required words like an early-level "HIST").
- Varied the puzzle order so consecutive levels feel fresh, not repetitive.

### Added
- "Reveal a whole word" hint alongside the single-letter hint; shuffle stays free.
- Starting coins increased to 150.

## [1.1.0] - 2026-06-24

### Added
- Branded splash / loading screen.
- Progressive Web App support: installable on mobile, works fully offline
  (web manifest + service worker), with app icons and iOS/Android meta tags.
- Haptic feedback on found/incorrect/win, and a confetti burst on level complete.

### Changed
- Save key migrated to `wordbloom.save.v1` (existing progress is preserved).
- Wheel now captures the pointer so fast swipes leaving the wheel don't drop letters.
- Wheel capped by viewport height to avoid clipping on short screens; larger tap targets.

## [1.0.0] - 2026-06-24

### Added
- Initial release of WordBloom, a web word-connect crossword puzzle game.
- Swipe-the-wheel letter tracing with live word preview and connecting lines.
- Interlocking crossword board that reveals shared letters together.
- Deterministic per-level puzzle generator from a ~6,500 common-word list
  (wheel = letters of an anchor word; formable words interlock; rest are bonus).
- Coins, light-bulb hints, shuffle, and bonus-word rewards.
- Per-level calming color themes, WebAudio sound effects, and a mute toggle.
- Progress and coins persisted in localStorage; fully offline; mobile-first.
