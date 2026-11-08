# Default-card surfaces and ballistic jumps

> Planning authority: [../ROADMAP.md](../ROADMAP.md) is the only active vision/task backlog. This document is an operational reference or dated engineering record; earlier proposed steps are not a separate delivery order.


Testing → Cat playground now includes native Entities (with divider rows), Markdown (with horizontal rules), Glance, Gauge, Sensor, History Graph, Tile and Button cards, using the existing temperature/CO₂ entities. Structural cards are near Home so they can be tested in the first viewport. The previous custom chart and shelf scenarios remain in later sections. Only the Cat playground view was changed in this pass.

## Surface policy

Predetermine what counts as a usable perch, then measure its actual rendered position. Do not treat a card's design or YAML as proof that every icon, text baseline, graph trace or control is a ledge.

| Feature | Policy |
| --- | --- |
| Exposed card top | Existing measured top-edge discovery |
| Entities `hui-divider-row` | Measure the rendered shadow-root divider `div` |
| Markdown `hr` | Measure the actual rendered rule through open shadow roots |
| Entities/Markdown/Glance/Sensor/History Graph content floor | Amber layout candidate, enabled by default; disable with Try interior candidates or `use_surface_candidates: false` |
| Tile/Button/Gauge interior | Foreground-floor candidate enabled by default; no inferred physical ledge |
| Card-specific features | Explicit `cat_surfaces` or home `surface_rules` remain available |

The content-floor candidate uses an inset from the card rectangle; it is not detection of a chart axis, plot trace or empty space. Graph canvas scales and layout differences need card-specific adapters or explicit definitions if those positions are desired. Width, coordinate validity and jump limits still apply. Overlapping cards and content no longer obstruct the foreground cat. Surface report lists card type, measured dividers, candidates, accepted internal targets and inspection POIs. Candidate status remains visible even when opted in. See `FOREGROUND_AND_INSPECTION.md` for the newer foreground and look-up behaviour.

References inspected: [Entities card](https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/cards/hui-entities-card.ts), [divider row](https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/special-rows/hui-divider-row.ts), [Markdown card](https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/cards/hui-markdown-card.ts). These private frontend structures can change; missing selectors should yield no detected divider rather than invented geometry.

## Jump motion

Sideways pose selection allows a shallow rise/drop of up to **12 native sprite cells** (24 screen pixels at the normal 2× scale), provided horizontal travel is at least twice the height difference. The existing four-cell near-level tolerance remains. Larger height changes and steeper/near-vertical hops retain ascent/descent poses. Selection is made once from the intended movement before pose-anchor alignment, then reused for take-off, narrow-perch landing and playback; reachability uses the same classifier. This changes the pose family, not the destination height or gravity model.

Authored take-off and landing holds are separate from flight duration. Flight follows `x=x₀+vₓt`, `y=y₀+vᵧt+½gt²` in screen coordinates. Longer gaps require longer flights within the horizontal-speed limit. Short downward hops can start with zero upward velocity and accelerate downward. The renderer follows the silhouette's body centre during flight so the existing diagonal airborne drawing does not introduce a body-position pop when it replaces the crouch. Planted poses still use the original authored contacts.

Default gravity is 400 cells/s², horizontal speed limit 140 cells/s and maximum rise 90 cells. The viewport/headroom, jump-height and flight-time limits reject infeasible routes rather than flattening their arcs against the header. `jump_gravity`, `jump_speed`, `jump_max_rise` and `jump_frame_ms` can tune these bounds. Paths debug draws the active ballistic arc in cyan, with airtime and horizontal velocity. Autonomous stops require a return route home; explicit Visit remains useful for one-way scenario tests.

This is a decorative point-mass flight model, not full collision/rigid-body simulation. It does not solve mid-flight collisions with all card content. Existing authored airborne poses remain; a reviewed horizontal-flight sprite can improve the silhouette of across jumps separately.

## Verification and limits

- `scripts/test-roaming-physics.mjs`: endpoints, constant gravity and horizontal velocity, distance-dependent airtime, accelerating drops, speed/rise bounds, body-centre continuity, planted landings, vertical facing, one-way trap avoidance and native-card surface policy.
- Existing routing, gait, idle and studio model/workflow checks pass.
- Local browser testing detected rendered divider contracts, showed amber candidates, enabled/disabled candidate visits through the home control and observed grooming on an Entities divider.
- `standard-cards.html` uses copied HA Card Lab compatibility assets (`card-lab-builtins.js`, `card-lab-preview.css`) and small structural-divider fixtures. It is explicitly not the real HA frontend and does not establish native/mobile rendering parity. Original Card Lab files were not changed.
- Real native cards are configured in HA; the updated controller and view are read back through MCP. Actual HA browser rendering remains pending an authenticated, reachable frontend browser session. MCP currently reports the container-local `http://supervisor/core` URL, and the available browser history did not contain a usable external dashboard origin.

Rollback only this pass: use a fresh dashboard hash to restore the Cat playground view from `native-cards-before-view.json`, and restore controller resource `519d58d52bbc41f4b0aa6aa2b4124ab5` from `resource-backup-native-physics-519d58d52bbc41f4b0aa6aa2b4124ab5.js`. Leave unrelated views, resources and entities unchanged.
