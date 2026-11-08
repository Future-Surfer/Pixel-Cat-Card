# Dashboard roaming prototype

> Planning authority: [../ROADMAP.md](../ROADMAP.md) is the only active vision/task backlog. This document is an operational reference or dated engineering record; earlier proposed steps are not a separate delivery order.


This adapter registers `custom:pixel-cat-home`; the original `custom:pixel-pet-card` remains separate. It renders a small home in normal dashboard layout and the cat in a pointer-transparent overlay across neighbouring cards.

## Current behaviour

The common **More labs** menu includes Bed visits, Scratching & action refinements, Independent waking, and Local exploring & gaits. They are served by `npm run gaze:lab` on 8769, alongside the existing fixtures; Frame Studio stays on 8767. Controlled-request buttons isolate mechanics and do not save HA configuration. Natural behaviour still requires ordinary opportunity, perception and probability gates.

`/prototype/leisure-lab.html` runs three independently seeded residents with visible leisure-intent counts and a shared monitor. Reset explicitly places them on a broad shelf; subsequent stay/local/leave choices are autonomous. Optional local-preference comparison, forced 24-cell gallop and look-down-to-walk previews isolate the new mechanics without pretending to test natural social frequency. `data-exploration` records the latest intention, support, residence time and fading preference; the existing decision trace also records it. Residence is reset by meaningful support changes, not local POIs or scroll/near-coincident surface aliases. No exertion meter or position-aware route planner is included.

- Multiple home cards with independent cat ownership and nearest-cat click attention. `show_home: false` hides a dock while its actor starts/returns on an ordinary dashboard surface; no candidate means a bounded invisible wait.
- Card tops, measured structural dividers and declared surfaces, with diagnostic overlays and optional unverified candidates.
- Small perches, edge-biased idle points, visit recency, longer rests and routed recall home.
- Relaxed/interested/prompted movement with a distance-driven gait and independent head cadence.
- Bounded ballistic ascent/across/descent, body-centre continuity, retained facing for near-vertical drops and fixed landing contacts.
- Phase-aware authored idles, ground head/tail and elevated tail variants, look-down rear support, and three across-jump flight poses.
- Human-authored igloo/simple beds, with raised supports and igloo rest masking. Mood-driven own-bed naps and occasional guest-bed visits use actual routes. A noticed owner can optionally approach and pat; contact may invite yielding or be ignored. `/prototype/bed-visits.html` isolates these opportunities; full doorway entry remains future work.
- Long-drop freefall with an off toggle, including lateral descents; dedicated vertical jump drafts remain outside normal locomotion; reviewed faster/gallop cycles are integrated.
- Occasional playful sneak/pounce/groom episodes using the three saved sneaky head heights and their own contact clock. Debug controls can request a pounce or a safe long drop.

Neighbour metadata remains advisory. It does not force the runtime into a particular animation chain.

## Build and preview

From the repository root, run `npm run build:roaming` or `npm run build`. Five modules are required: `pixel-cat-roaming-art.js`, `pixel-cat-roaming-extras.js`, `pixel-cat-affordances.js`, `pixel-cat-behaviours.js` and `pixel-cat-roaming.js`, with the controller last. Sources remain in `prototype/`; the affordances module now also packages the leisure/motion-option helpers to respect HA inline-resource limits. Extras contains refined actions and faster walking artwork.

Serve the repository locally, for example `python -m http.server 8766 --bind 127.0.0.1`, and open one of these fixtures:

| Page | Purpose |
| --- | --- |
| `index.html` | Basic clipped-card/overlay lifecycle proof |
| `playground.html` | Shelves, interior surfaces and changing layouts |
| `standard-cards.html` | Compatibility fixtures for structural/default-card layouts |
| `multi-cat.html` | Multiple-cat ownership and attention |
| `editor.html` | Actual visual editor and home-card preview, with local configuration-event display |
| `showcase.html` | Clean two-cat demo with illustrative readings, shared toys and unified monitor |

`prototype/cat-home-editor.js` supplies the roaming card's native HA visual configuration form, bundled in `pixel-cat-behaviours.js`. The controller exposes `getConfigElement`/`getStubConfig`; advanced YAML survives visual changes. HA's Save button persists the edited configuration; session debug switches remain separate. Editor previews never register a roaming actor.

These are isolated browser fixtures, not an HA emulator. The standard-card fixture includes compatibility assets copied from Card Lab; unrelated Card Lab work remains in its own repository.

## Configuration and design references

- [PLAYGROUND.md](PLAYGROUND.md)
- [DEFAULT_CARDS_AND_PHYSICS.md](DEFAULT_CARDS_AND_PHYSICS.md)
- [FOREGROUND_AND_INSPECTION.md](FOREGROUND_AND_INSPECTION.md)
- [SCROLL_AND_AUTONOMY.md](SCROLL_AND_AUTONOMY.md)
- [MOTION_AND_ATTENTION.md](MOTION_AND_ATTENTION.md)
- [MULTIPLE_CATS.md](MULTIPLE_CATS.md)

These notes describe individual development passes. Where their older verification statements differ, use this current summary and PROJECT_STATUS. Machine-specific dashboard exports, screenshots and rollback captures remain local and are not repository fixtures.

## Verification and remaining limits

The 14 October development build was rendered in the real HA testing playground. Both existing artwork/controller resources were updated through the resource API, read back equal to the generated files, and the two home cards were checked for the igloo prop. Unit tests cover movement/contact at multiple scales/facings, jump physics, route and surface constraints, scroll reconciliation, lifecycle ownership and the current authored assets.

Actual phone/Companion testing remains outstanding. Generic surface inference is approximate: decorative foreground traversal is not collision simulation, and unsupported layouts can require declared surfaces or an in-card fallback. There is no runtime image generator, care backend, scratching interaction or bed-entry animation.

For deployment and targeted rollback, see [DEVELOPMENT.md](../DEVELOPMENT.md). Use normal versioned module files for a portable installation; development-instance inline resource IDs and personal dashboard snapshots are not required by a fresh checkout.
