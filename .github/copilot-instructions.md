# Repository guidance

- This is a static site deployed to GitHub Pages. Do not add a client-side framework or a runtime server.
- Use the Node.js version in `.nvmrc`. Validate with `npm run validate`; the deploy workflow publishes `_site/`.
- The Dutch homepage text is managed in `src/_data/homepage.json`. For homepage copy updates, edit that data file rather than generated output or the HTML structure.
- Preserve existing page URLs, relative asset paths, and the current visual design unless the request explicitly asks to change them.
- Run `npm run validate` after site or content changes and check that the relevant route exists in `_site/`.
- The escape room in `src/escaperoom/` is a self-contained static game (passthrough copy, not a template). Follow `docs/escaperoom.md`, bump `CACHE` in its `sw.js` together with `GAME_VERSION` in `js/boot.js`, and run `npm run test:escaperoom`.
