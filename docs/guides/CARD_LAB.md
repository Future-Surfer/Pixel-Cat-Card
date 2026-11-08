# Pixel Pet Card Lab guide

HA Card Lab is a separate, local-only emulator. It reads `pixel-pet-card.js`, supplies mock Home Assistant state (including a configured time zone), captures screenshots and diagnostics, and never connects to or writes to a live Home Assistant instance.

## Recommended sessions

The maintained sessions live in the Lab repository under `sessions/`:

- `pixel-pet-card-focus-default`: default Cat Focus composition, autonomous cat, no developer controls.
- `pixel-pet-card-world-controls`: full World composition with grouped controls and selected debug layers.
- `pixel-pet-robot-boarding-audit`: robot-vacuum/moving-surface inspection.
- `pixel-pet-card-box-hop`: independent box artwork and cat/box placement inspection.

Capture one with:

```text
capture-session.bat <session-name>
```

Review each capture's `manifest.json`, `diagnostics.md`, and numbered frames. A one-off module-load long task can be normal; runtime errors, warnings, repeated long tasks, or visual discontinuities need investigation.

## Review sequence

1. Start in Cat Focus to judge the normal dashboard composition.
2. Use World view for props, POIs, surfaces, routes, and camera-independent placement.
3. Enable only the one debug layer needed: paws, POIs, paths, surfaces, activity log, or hidden-cat sprite inspection.
4. Compare a captured animation frame against its supplied reference before changing an array or anchor.
5. Re-capture the same named session after a card-side change.

## Guardrails

- The Lab is an emulator, not a Home Assistant deployment target.
- Keep the read-only relationship from Lab to this card.
- Do not copy Lab captures or generated diagnostics into the card repository unless they are deliberate reference assets.
- Test live Home Assistant separately after a Lab capture is clean.
