# Expanded roaming playground

> Planning authority: [../ROADMAP.md](../ROADMAP.md) is the only active vision/task backlog. This document is an operational reference or dated engineering record; earlier proposed steps are not a separate delivery order.


The default-card and jump-physics refinement is documented in [DEFAULT_CARDS_AND_PHYSICS.md](DEFAULT_CARDS_AND_PHYSICS.md). Native divider detection and amber candidate perches extend the explicit interior definitions below; ballistic flight now replaces the previous fixed flight beats.

HA: Testing → Cat playground (`dashboard-testing/cat-playground`), beside Cat roaming. Local fixture: `http://127.0.0.1:8766/prototype/playground.html`.

Default rest stops last 10 seconds, both away and at home. During a stop the cat cycles through authored sit, loaf/catnap, cleaning, look, stretch and standing clips. Hanging-tail perches are reserved for card tops. Pixel grids remain human-authored.

Casual movement uses the amble profile (9 cells/s), interesting POIs use 24 cells/s plus a distance bias, and Home/Explore prompts use 32 cells/s with acceleration and braking. `relaxed_speed`, `interested_speed`, `prompted_speed`, `rest_ms`, `home_rest_ms` and `motion_profiles` are configurable. Gait and displacement advance on the same cumulative per-cell clock. Existing `walk_speed` remains a fallback override.

Layout measurement preserves the current support, route, contact and motion progress. Dialog/edit suspension freezes clocks. IDs belong to the owning card, so replacing its inner `ha-card` does not erase a route. No reachable route means the cat stays put and reports the problem. A missing support or active landing target hides/freezes the cat until layout recovery or the explicit Reset home action. Home is a normal route request; Reset home deliberately resets the scene.

## Interior surfaces

YAML/config identifies a card and its useful features; it cannot by itself supply rendered coordinates. Interior surfaces are explicitly declared and measured relative to the card's current rectangle. This version does not infer arbitrary chart traces, text, icons or controls as physical geometry.

Declare `cat_surfaces` on a cooperating custom card, or add sidecar `surface_rules` to the home card to avoid changing a foreign card's schema:

```yaml
surface_rules:
  - match:
      type: custom:simple-band-graph-card
      name: Playground climate chart
    surfaces:
      - id: chart-floor
        label: Declared chart floor
        units: percent
        x1: 12
        x2: 88
        y: 86
        poses: [loaf, sit, clean, stretch]
        interest: true
```

`match` requires exact config-field equality. Units are percent (default, 0–100) or pixels. IDs are unique per owning card. Coordinates specify a horizontal bearing line. Too-narrow, out-of-bounds, obstructed or insufficient-headroom definitions are rejected; offscreen surfaces are omitted. Authored jump-up/down clips permit top → internal shelf → lower floor travel. Routing compares distance rather than hop count, avoiding unnecessary Home detours.

The HA chart's interior lines are declared test perches, not automatic detection of its dynamic data bands. Shelves in `pixel-cat-playground` are actual rendered lines with matching `cat_surfaces`. Change height tests remeasurement and surface identity. The local fixture includes dialog, visibility, scroll and click-through controls.

## Debug and validation

Open Playground & debug on the home card. Surfaces shows green card tops, purple interior lines and red dashed rejected definitions. Paths shows the candidate graph and orange active route. POIs shows visitable targets; Visit uses the interested profile. The diagnostic text reports accepted/rejected counts and matched rules. The overlay remains pointer-transparent.

Run `scripts/test-roaming-routing.mjs`, `scripts/test-roaming-motion.mjs` and `scripts/test-roaming-idle.mjs`. Tests cover route-preserving remeasurement, stable card IDs, unreachable Home, frozen clocks, dwell durations, speed profiles, contact throughout acceleration, source-grid equality and interior geometry validation.

The controller and fixture were installed via HA resource APIs. Dashboard readback matches the scoped edit: new view plus auto-height on the original roaming home. `playground-change-record.json` and `resource-backup-routing-*.js` document rollback. Reload HA to load the new custom-element implementation. Live HA visual review and Companion/mobile tests remain separate from local fixture verification.

Local browser verification traced chart top → band → plot floor, observed grooming on the floor, and then Home initiating a physical jump with a remaining home settle walk. Shelf height changes retained the original intended route after its shadow DOM was replaced. Debug toggles rendered correctly; browser error logs were empty. `playground-proof.png` shows the overlays and a paused return journey. The local tab is intentionally paused for inspection; Resume continues it.
