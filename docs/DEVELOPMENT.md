# Development workflow

Read [CURRENT_STATE](CURRENT_STATE.md) for the handoff; use [ROADMAP](ROADMAP.md) for priorities.

## Build and validate

Node.js 22.20+. Runtime builds and Node assertions have no npm dependencies. The optional real-browser suite uses pinned Playwright development dependencies (`npm ci --ignore-scripts`); these do not ship in the Home Assistant bundle.

| Command | Purpose |
| --- | --- |
| `npm run build` | Regenerate catalogue, frozen refinement overlays, runtime modules and embedded Studio bundle |
| `npm test` | Discover/run `scripts/test-*.mjs`; nonzero exit on failure |
| `npm run test:browser` | Packaged-bundle Chromium smoke checks at desktop/narrow widths; install the browser with `npx playwright install chromium` |
| `npm run test:soak` | Five replayable interaction seeds; also runs nightly in CI |
| `npm run verify:build` | Two full builds; reject non-reproducible generated outputs |
| `npm run release:build` | Versioned normal-file loader, source digests and integrity manifest |
| `node scripts/build-dev-card.mjs` | Build the separately namespaced HA dev bundle after building the runtime |
| `npm run studio:review` | Read-only local change-journal review; distinguish stores and exact versions |
| `npm run studio` | Studio at loopback 8767; local data in `.studio-data/` |
| `npm run gaze:lab` | Runtime labs at loopback 8769; scoped durable climb/tree saves only |

- Iterate with relevant focused checks. Before a runtime checkpoint: reproducible build, full suites and release integrity; inspect relevant browser/lab behaviour.
- Avoid repeating unchanged full-suite/build passes. Documentation-only edits: validate links, retained contracts and whitespace; no HA write/rebuild required.
- CI repeats runtime/package checks and rejects generated-file drift. Verify the actual remote result before calling it green.
- Studio reads generated assets at startup. Restart deliberately after a rebuild only when safe for user work; never restart it merely to edit docs.
- [Release guide](guides/ROAMING_RELEASE.md) owns install/upgrade/rollback instructions. Keep the 128000-byte inline guard.

For a dev install alongside Marketplace, serve the dev bundle from a versioned path under Home Assistant's `www` folder and register it as a module. Use `custom:pixel-cat-dev-home` and `custom:pixel-cat-dev-monitor` on development views. Keep a separate view using `custom:pixel-cat-home` to test the Marketplace version. For each dev update, point the existing dev resource to the new hash directory and reload the frontend. To roll back a dev update, point the dev resource back to its previous URL.

## Test coverage and failure replay

[Coverage map](../scripts/testing/coverage-map.json) owns feature-to-suite/browser evidence and explicit open checks. Its validation test rejects orphaned test families and stale browser references. This is an evidence inventory, not a percentage or a claim that all combinations are covered. Existing feature documentation can lag the current bundle; reconcile source/configuration, released behaviour and experimental labs before adding a coverage claim.

| Layer | Current evidence | Remaining boundary |
| --- | --- | --- |
| Node contracts | Packaging/artwork, motion/contact, perception/behaviour, props, persistence, lifecycle and media; 192 walking-edge cases include half-size kitten scales | Broader composed feature journeys and statistical calibration |
| Browser | Actual `dist/pixel-cat-card.js`; editor save/reload, adult/kitten paint, cached navigation/Pause, theme/reflow, reduced motion, pointer/Escape cancellation and edge-scratch contact/completion/removal | Synthetic local host, Chromium only; not real HA or a physical phone |
| Seeded simulation | Explicit VM randomness/virtual clocks in the interaction fixture; fixed PR seed and five nightly/release seeds | More scenario families must adopt the shared seed helper |
| Manual release/device | Current release history records actual evidence | Isolated clean install/update/reinstall/restore, physical touch/inertia, PiDisplay FPS and wider accessibility remain open |

`PIXEL_CAT_TEST_SEED` defaults to `20261120`. Replay one failure with `node scripts/test-all.mjs --suite test-cat-interactions.mjs --seeds 43`; selectors accept only known suites and bounded uint32 seeds. The runner writes `.test-artifacts/node/results.json`, failure stdout/stderr, seed and replay command, including subprocess timeouts. Crowd failures include actor/frame/time, origin/destination, bounds and bounded recent events. Node runtime contexts must inject `scripts/testing/random.mjs` explicitly; a suite count does not imply every older test is fully seeded.

Browser setup starts and closes its own loopback-only, read-only synthetic fixture in the runner process. It has no Studio/store endpoints and uses isolated browser contexts. Playwright retains failure screenshots/traces and per-test synthetic actor/console diagnostics under `.test-artifacts/browser/`; no automatic retries hide an unstable result. For a workspace-only browser install, set `PLAYWRIGHT_BROWSERS_PATH` to an ignored local directory before installation and test execution. `PIXEL_CAT_BROWSER_PORT` overrides the default `8774`.

CI retains the existing required `build-and-test` job, adds browser smoke and Windows replay jobs, and uploads scoped diagnostics with `always()` even after failure. The nightly soak runs the declared seeds independently. New jobs report on PRs; branch-protection requirements are unchanged. New features should declare released/experimental scope and cover success, voluntary non-participation, interruption, cleanup, affected scale/age/direction/geometry combinations and browser evidence where layout/input matters. Keep unverified device and release gates explicit.

## Source map

| Location | Edit/read for |
| --- | --- |
| `prototype/roaming-controller.js` | Actor lifecycle, geometry reconciliation, movement and playback |
| `prototype/cat-world-authority.js` | Explicit world ownership, membership-driven readiness/conflicts and pure migration planning; ships in art module |
| `prototype/cat-surface-world.js`, `cat-point-routes.js`, `cat-layout-pause.js` | Shared discovery, routes and layout settling |
| `prototype/cat-home-life.js`, `cat-home-surfaces.js`, `cat-home-posts.js` | Home/igloo/toy affordances |
| `prototype/cat-mouth*.js`, `prop-scene.js` | Carrying, ownership and shared props |
| `prototype/cat-behaviour-policy.js` | Shared category/tag profiles, protected rest-duration modifiers, numeric pace preference, eligibility and bounded movement cadence; [contract](design/LIFE_STAGES_AND_SETTLING.md#shared-sequence-policy-contract) |
| `prototype/cat-decisions.js`, `cat-interactions.js`, `cat-debug.js` | Social choices, contacts and labels |
| `scripts/build-roaming.mjs` | Authoritative source-to-module mapping; do not duplicate its file lists |
| `scripts/apply-latest-studio-art.mjs`, `latest-studio-assets.mjs` | Selected exact artwork versions and overlays |
| `frame-studio/dist/frame-canvas.js` | Shared sequence/climb canvas strokes and onion layers; adapters own metadata, undo/provenance and persistence. Extend this core rather than adding editor-specific painting loops. |
| `frame-studio/` | Editor, catalogue sources, curated snapshots and receipt evidence |
| Root `pixel-cat-*.js` (ignored) | Generated intermediates for tests/labs; install `dist/pixel-cat-card.js` |
| `src/artwork/` | Original Pixel Pet artwork preserved as data for roaming and Studio builds |

Runtime loading order: art → extras → affordances → behaviours → controller → climbing → box → dashboard chase. The optional editor and self-contained world-authority/layout/depth/debug hooks ship in the spacious art module; editor registration is guarded for DOM-free consumers; effects/home-life helpers ship in extras and other affordances load afterward. Hooks defer DOM/cross-module work until called. Packing must preserve decoded grids and provenance exactly.

## Browser evidence

Use the shared **All tools** directory to search all editors/labs by capability. Grouped navigation is defined by `frame-studio/dist/workshop-tools.js` and rendered by `lab-nav.js`; timing/layout fixtures use a fixed launcher that adds no document height. [Guide](guides/WORKSHOP_TOOLS.md).

Use task-relevant labs on 8769:

- `prototype/tree-lab.html`: seeded component assembly, rectangular shared drawing tools, socket/support/grip/depth metadata and exact versioned tree workspaces. `?draft=qa-<name>` isolates test saves. Tree geometry is not yet wired into HA cat traversal or default cards; [contract](design/CAT_TREE_GENERATOR.md).

- `prototype/settling-lab.html`: three ages, before/after-five-minute eligibility, real prolonged sleep/loaf, startle and timer expiry; eligibility advancement is diagnostic only.
- `prototype/command-controls-lab.html`: real Startle all / Wall jump handlers, three settled residents, finite walls and explicit route replay with autonomous/social behaviour disabled.
- `prototype/refinement-lab.html`: beds, depth, surface counts, scratching, tracks/particles and controlled mixed-age movement cadence/preferred-pace comparisons.
- `prototype/route-quality-lab.html`: chosen endpoints, point/legacy routes and changed geometry. `node scripts/audit-route-quality.mjs [release-directory]` emits a controlled seven-layout/six-scale JSON audit without changing runtime files.
- `prototype/kitten-climb-stress-lab.html`: six-kitten native/replay observations, active versus wall grip dwell, landing/recovery traces, early decal eviction and actual paw guides. Optional temporary landing blockade is an explicit diagnostic; scoped clock substitution is restored after each replay chunk.
- `prototype/climb-runtime-lab.html`: actual default-post fit, kitten last-resort background routes, half-hop/slip contact previews, material marks, pause, landing removal and reflow. The explicit simulated-clock button supports throttled browser inspection; it is not a performance measurement.
- `prototype/climb-lab.html`: isolated AI climb workbench; editable grids, gripped support decisions, ten entry neighbours, per-frame holds/gain, destination/leap-budget controls and real runtime trajectories. Use `?draft=qa-<name>` for separate browser test storage; export the owner draft before work. [Contract](design/CLIMBING_WORKSHOP.md). Durable climb drafts share the local Studio Asset changes journal; ordinary projects/props and HA artwork remain untouched. Wait for the saved hash before relying on a durable handoff.
- `prototype/carry-lab.html`: all runtime clips, facings/scales, live handoffs and igloo checks. Alert exit selector covers four gaits and five successor poses; bounded frame/carrier traces expose skipped or replayed exits.
- Its **Igloo doorway mask inspection** close-up uses the shared mask and actual sneak art; choose Enter/Exit and the outside side, then scrub journey progress at adult/kitten scales. Exit reverses travel and facing; the outside side remains visible.
- `prototype/life-stage-preview-lab.html`: size-only art comparison (half-size kitten, unchanged adult/senior and furniture). Appearance review only; not runtime contact/behaviour acceptance.
- `prototype/world-authority-lab.html`: authority arrival/conflict/removal, mixed legacy scales, editor events and exact migration export/apply/rollback. Local-only; no dashboard writes.
- `prototype/initial-load-lab.html`: first/all placement, page reload, delayed homes/helpers and real reflow; native or limited actor callbacks. Compare immutable releases and inspect startup work/latency, not just missing origin pixels.
- `prototype/endurance-lab.html`: ordinary 1/5/20-cat comparisons and fresh default homes.
- The endurance lab’s **Startup: hide homes for 900ms** control exercises zero-size initial homes; reports count visible unpositioned actors/toys and pixels drawn before their home is exposed.
- Add `?release=snapshot-<16-hex-digits>` to run a saved immutable package with the same endurance fixture; omit it for current source. Compare sequentially on the same device/viewport, and record startup/layout suspension as well as steady-state frame timing.
- `prototype/lifecycle-lab.html`: removed targets, animated layout, carrying/scratching, dialogs, remounts and authored departures; real drop-during-scroll control and contact-error sampling.

Use real HA playground/stress views as well as controlled fixtures. Keep timed tabs visible; export compact reports before navigation. Separate hidden/capture/scheduling overhead from runtime cost. Never treat desktop narrow-layout screenshots as physical-phone/PiDisplay FPS evidence. See performance record (development reference retained privately).

## Studio and data preservation

- Read [Studio agent contract](../frame-studio/AGENTS.md) before authoring/integration work.
- Compare current saved local/hosted version with the intended immutable snapshot; preserve newer drafts and mixed provenance.
- Only curated source snapshots belong in Git. `.studio-data/`, browser outboxes and hosted databases are separate stores.
- Disposable Studio: `node frame-studio/scripts/preview.mjs --port=8768 --data=.studio-data/qa-tasks4-9`. Its banner identifies the test store; keep the normal Studio store separate. Verify actual downloaded JSON, stale-tab conflicts and offline outbox recovery there before changing the live workshop.
- Review the change journal during runtime checkpoints. Complete only the exact integrated version's receipt after testing/deployment verification; leave unrelated/newer work pending.
- Never include credentials, personal dashboard exports or generated Worker bundles in commits. Hosted deployment requires its own explicitly configured identity and access controls; no deployment identity is distributed here.

Studio and lab HTTP adapters accept only their configured loopback hostname/port. Shared bounded readers enforce UTF-8 byte limits before full buffering. Saves retain an immutable journal candidate before publishing current artwork, with conditional-write protection; a candidate alone does not prove publication or integration. Asset changes refresh is read-only; use **Repair missing journal entries** explicitly when repairing older stores. Shared persistence mechanics live in `scripts/workspace-storage.mjs`.

## Home Assistant changes

1. Discover MCP capabilities and read required matching skill/references.
2. Retrieve fresh affected resources/config; save exact targeted backups, including line endings.
3. Compare again before writing; preserve newer changes. Update scoped resources or JSON Patch paths with fresh config hash.
4. Read back exact deployed bodies/config; inspect the real browser and relevant labs.
5. Roll back only affected resources/paths using fresh state. Never write internal `.storage` or replace unrelated dashboard configuration.

## Documentation maintenance

For each new feature, note concrete opportunities for animation variety in [sequence ideas](design/SEQUENCE_VARIETY_IDEAS.md), including variants of existing clips. Keep proposals separate from approved artwork and runtime commitments; check the existing catalogue before drafting.

- `CURRENT_STATE`: compact current facts/limits. `ROADMAP`: open work. `FEATURE_DETAILS`: detailed implemented contracts.
- README and FEATURES are entry summaries; update only affected summaries/contracts.
- Add short dated checkpoint evidence with links to deeper reports; archive older entries rather than repeatedly loading them.
- Immutable artwork snapshots/receipts and historical evidence remain inspectable. History may describe older behaviour; it does not override current code or user instructions.
