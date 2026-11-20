# Technical details

## Runtime

The installed card is one file: `dist/pixel-cat-card.js`. It runs in the browser without an AI service, cloud connection, Node server or Frame Studio. Cats do not operate Home Assistant entities. Reduced-motion preferences suspend roaming animation.

The bundle preserves the existing `custom:pixel-cat-home` configuration and optional controls. [Full configuration](guides/ROAMING_CONFIGURATION.md) · [Behaviour reference](../docs/FEATURE_DETAILS.md).

## Installation and releases

The repository is public. The card can be installed as a custom repository while catalog review is pending. Catalog inclusion is separate from adding a custom repository.

The HACS manifest selects `pixel-cat-card.js` from `dist/` or a release asset. The download contains its own artwork and has no additional runtime files. The manifest and `SHA256SUMS` identify its exact bytes. See [installation, resource migration and rollback](guides/PIXEL_CAT_INSTALL.md).

## Repository layout

| Path | Purpose |
| --- | --- |
| `dist/` | The installable card, manifest and checksums |
| `prototype/` | Runtime source, diagnostic fixtures and media routine |
| `src/artwork/` | Original artwork data with historical source identifiers |
| `scripts/` | Build, tests and development servers |
| `frame-studio/` | Optional artwork editor and curated source snapshots |
| `docs/` | Configuration, implementation contracts and media |

The six separate runtime modules are ignored build intermediates. They are regenerated locally for existing test/lab tools; users install only the bundle. Generated outputs are checked through reproducible builds and bundle drift validation.

## Development

Node.js 22.20+, with no npm dependencies:

```text
npm run build
npm test
npm run verify:build
```

Run the build before tests on a fresh checkout. Edit source and rebuild the package. The [development guide](DEVELOPMENT.md) owns source mapping, detailed checks and deployment procedures. [Frame Studio](../frame-studio/README.md) is optional authoring software and is not installed with the card. Live stores and personal backups stay outside Git.

## README animation

The GIF is a staged media routine: emerge → approach post → scratch → approach bowl → eat → ear scratch → return to bed. Destinations are scripted; gait displacement, frame timing, idle holds/loops, independent tracks and contact placement come from the release helpers. Installed cats retain their own choices and clocks.

`scripts/readme-playback.mjs` defines the queue using a DOM-free release harness. Walking advances one native cell per release gait step. Ear scratching keeps the release's 75 ms cycle holds and repeated cycles; eating uses its mouth planner and authored gaze anchor. `prototype/readme-routine.mjs` draws the sampled frames. The browser preview and GIF encoder consume the same playback samples and drawing commands. No artwork, saved versions or integration receipts are modified.

The 480 × 270 scene uses the relaxed walk pace and the open bed's release height transition. The first and last frames meet during the authored sleep cycle.

Run `npm run demo` and open `http://127.0.0.1:8770/routine` to preview. Run `npm run media:gif` with Python 3 and Pillow to export the looping GIF. With FFmpeg on PATH or the Python `imageio-ffmpeg` package installed, `npm run media:video` also writes a silent 1080p H.264 MP4 to `.release/pixel-cat-routine.mp4`. Both exports use the same 50 fps samples. A [ready-to-share MP4](images/pixel-cat-routine.mp4) and a [still image](images/pixel-cat-habitat-light.jpg) are available.

### Scene recipes · mouse draft

`scripts/media-recipes/mouse-chase.mjs` holds the approved mouse scene (draft 3), copied exactly to `docs/images/pixel-cat-mouse-chase.gif` below Install. Its adjacent JSON records the approved output hash. `scripts/media-scene.mjs` compiles release walk/run/sneak clocks, authored bridges/turns, jump planning and mouse actions into deterministic 20 ms samples. Explicit media `beatMs` scales the walk clock and displacement together; it does not change installed-cat speed. Pose registration follows each clip’s initial contact. Turn frames retain pose/sequence/frame context and use the real decision layer’s gaze capture before the mouth resolver. White fill and black exposed-edge outline reuse the release outline path without editing artwork.

`scripts/media-recipes/box-and-tree.mjs` is the next draft: a 40-second box outing → lower-post scratch → neighbour stirs/rolls → both settle sequence. It uses native box sampling/masking, a fixed scratch bearing and the reviewed back-roll. Draft 3 gives the tree 2-pixel furniture cells while cats and box retain 3-pixel cells (140-pixel tree height, previously 210); optional furniture `scale` preserves whole source pixels. Slate-blue and muted-plum actors retain their original body size. Support height, scratch bearing and waking-pose placement follow the compact tree; every visible rest frame must fit its narrower perch. `scripts/media-runtime.mjs` captures the actual tree paint commands and support/rope metadata in memory; it does not copy furniture art or read live stores. Each actor track has a stable ID, its own clock, colour and support height; its duration must divide the scene duration exactly. An `until: {track, stage, offsetMs}` cue resolves against an earlier track’s compiled stage, so a reaction follows a retimed approach; `until: {sceneEndOffsetMs}` fills quiet time before the loop boundary. These are media choreography cues, not forced autonomous responses. Preview and export use the same samples and `prototype/media-scene.mjs` renderer. A graphical recipe editor remains future work.

With `npm run demo`, open `/media` for scene selection, pause, scrub, action selection and frame stepping; `/media?scene=box-and-tree` opens the new draft. `npm run media:scene` exports the mouse scene; append `-- --scene box-and-tree` to export the two-cat scene. Recipes are registered in `scripts/media-recipes/index.mjs`. Exports and recipe/artwork/output hash manifests go under ignored `.release/media/images/`; export never replaces approved README media automatically. The encoder decodes and checks every exported frame. `test-media-scene.mjs` and `test-media-tracks.mjs` cover contacts, gait, independent clocks, box occlusion, platform fit, arbitrary seeking and loop pixels. The original routine and source artwork remain unchanged.

The carrying lab’s **Audit carry transitions and turns** runs real controller eating, sitting, walking right/left and jumping with one shared mouse; it reports ownership and painted-mouth offset. `scripts/test-mouth-affordances.mjs` independently checks 3,204 saved gaze anchors through pose changes and repeated facing reversals at six scales. The staged GIF turn issue was missing media metadata; production attachment code is unchanged. These local checks do not constitute a new Home Assistant deployment.

[Contributing](CONTRIBUTING.md) · [Security reporting](SECURITY.md) · [Documentation index](README.md).
