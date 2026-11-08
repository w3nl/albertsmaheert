# AGENTS.md

- The site is a static Eleventy build; see `.github/copilot-instructions.md` and the README.
- The escape room game lives in `src/escaperoom/` and is copied unchanged to `_site/escaperoom/`. Before changing the game, read [docs/escaperoom.md](docs/escaperoom.md) (Dutch: structure, puzzle solutions, pitfalls) and the general recipe in [docs/escape-room-blueprint.md](docs/escape-room-blueprint.md). Keep `docs/escaperoom.md` up to date when you change how the game works.
- Run `npm run validate` for the site and `npm run test:escaperoom` for the game.
