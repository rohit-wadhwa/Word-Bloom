# Changelog

All notable changes to WordBloom will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/), and this project adheres to [Semantic Versioning](https://semver.org/).

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
