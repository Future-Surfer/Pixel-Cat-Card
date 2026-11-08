# Explicit world authority and legacy migration

Optional foundation, version 1. Existing unlinked cards require no changes. Linked cards still use their own `cell_size` for cats, homes and spawned props. Shared world-cell/body sizing and resident rosters are later work.

## Saved configuration

Each linked companion saves `world_id`, `world_owner` and a distinct stable `cat_id`. One owner card also saves `world_settings`:

```yaml
type: custom:pixel-cat-home
cat_id: miso
world_id: lounge
world_owner: miso
world_settings:
  version: 1
  scale_mode: legacy
cell_size: 2
```

A follower uses the same `world_id` and `world_owner`, its own `cat_id`, and **no** `world_settings`. Keep all its other saved fields, including its existing scale. The editor's **World authority · opt-in** panel stages an owner, follower or unlink change through HA's normal Save/Cancel flow. Missing identities/names/colours are chosen once when staging; saved values are retained.

- World IDs: 1–64 letters/digits/dots/colons/underscores/hyphens, beginning with a letter or digit. Cat/owner IDs: nonempty strings up to 128 characters without leading/trailing whitespace.
- Exactly one explicit world per dashboard view/client; the same ID on another view/client is independent. Unlinked legacy cards continue unchanged.
- `primary_home` remains an editor presentation flag. It never grants data authority.
- Mount order does not select an owner. Followers wait without roaming overlays until their named owner arrives. A hidden home may own settings; keep its card mounted outside conditional containers.
- Different world/owner IDs, duplicate owner IDs or follower-owned settings produce visible conflicts. Existing actors retain their last valid in-session settings; new actors wait. Removing the owner does not transfer authority. Last-member removal disposes the complete registry.
- Only `{version: 1, scale_mode: legacy}` is supported. Unknown scale modes/settings are refused, rather than silently resizing anything. No new polling, frame clock, backend or cross-client playback state.

## Reversible migration

Use the [world-authority lab](../../prototype/world-authority-lab.html) on port 8769. It never fetches or writes HA configuration.

1. Back up the affected view/card configurations, then paste the view or dashboard JSON into the lab. Choose a world ID and owner index. Prefer an owner outside conditional cards.
2. Preview the exact changes: card paths, identities, names, colours, unchanged sizes and owner choice. Only companion cards in `views`/`sections`/`cards`/`card` containers are included; monitors/unrelated fields remain intact. Duplicate IDs and already-linked cards require explicit resolution first.
3. Export the preview and rollback JSON. `before`/`after` are full configuration snapshots; `changes` contains exact per-card paths and before/after definitions. Previewing unchanged input reuses the same generated identities.
4. Exercise **Apply preview to lab** and **Rollback in lab**. Both transformations reject a changed baseline. These controls change only disposable local actors.
5. Save the reviewed fields on the affected HA cards using the normal editor/config API. Re-fetch/review current configuration before a scoped save. Do not replace a dashboard with an old exported snapshot if unrelated edits have occurred.
6. Roll back affected card definitions from the saved plan only after comparing current values with the plan's `after`; newer edits require a fresh reviewed rollback.

Migration links existing one-cat homes; it does not create a permanent resident roster, move artwork, alter physical scales or morph carried toys. **Remove world linkage** preserves the card's identity and other fields.
