# Technical details

## Runtime

The installed card is one file: `dist/pixel-cat-card.js`. It runs in the browser without an AI service, cloud connection, Node server or Frame Studio. Cats do not operate Home Assistant entities. Reduced-motion preferences suspend roaming animation.

The bundle preserves the existing `custom:pixel-cat-home` configuration and optional controls. [Full configuration](guides/ROAMING_CONFIGURATION.md) · [Behaviour reference](../docs/FEATURE_DETAILS.md).

## Installation and releases

The repository is public. The first HACS/Marketplace prerelease and its installation acceptance checks are still being prepared. Catalog inclusion is separate from adding a custom repository.

The HACS manifest selects `pixel-cat-card.js` from `dist/` or a release asset. The download contains its own artwork and has no additional runtime files. The manifest and `SHA256SUMS` identify its exact bytes. See [installation, resource migration and rollback](guides/PIXEL_CAT_INSTALL.md).

## Repository layout

| Path | Purpose |
| --- | --- |
| `dist/` | The installable card, manifest and checksums |
| `prototype/` | Runtime source, diagnostic fixtures and media routine |
| `src/legacy/` | Older card sources retained inside the bundle for compatibility |
| `scripts/` | Build, tests and development servers |
| `frame-studio/` | Optional artwork editor and curated source snapshots |
| `docs/` | Configuration, implementation contracts and media |

The six separate runtime modules and two root compatibility copies are ignored build intermediates. They are regenerated locally for existing test/lab tools; users install only the bundle. Generated outputs are checked through reproducible builds and bundle drift validation.

## Development

Node.js 22.20+, with no npm dependencies:

```text
npm run build
npm test
npm run verify:build
```

Run the build before tests on a fresh checkout. Edit source and rebuild the package. The [development guide](../DEVELOPMENT.md) owns source mapping, detailed checks and deployment procedures. [Frame Studio](../frame-studio/README.md) is optional authoring software and is not installed with the card. Live stores and personal backups stay outside Git.

## README animation

The GIF is a staged media routine: emerge → approach post → scratch → approach bowl → eat → ear scratch → return to bed. Destinations are scripted; gait displacement, frame timing, idle holds/loops, independent tracks and contact placement come from the release helpers. Installed cats retain their own choices and clocks.

`scripts/readme-playback.mjs` defines the queue using a DOM-free release harness. Walking advances one native cell per release gait step. Ear scratching keeps the release's 75 ms cycle holds and repeated cycles; eating uses its mouth planner and authored gaze anchor. `prototype/readme-routine.mjs` draws the sampled frames. The browser preview and GIF encoder consume the same playback samples and drawing commands. No artwork, saved versions or integration receipts are modified.

To preview: `npm run demo`, then open `http://127.0.0.1:8770/routine`. To export: install Python 3 with Pillow, then run `npm run media:gif`. Pillow is needed only for GIF authoring, not builds, tests or installation. The GIF is 800×200, sampled at 50 fps for 21.24 seconds, and loops continuously. Use the [still image](images/pixel-cat-habitat-light.jpg) if animation is unsuitable.

[Contributing](../CONTRIBUTING.md) · [Security reporting](../SECURITY.md) · [Documentation index](README.md).
