# World scale and resident persistence decision

Decision dated 18 October 2026; implementation boundary updated 19 October. **Explicit authority/linkage and reversible legacy migration are implemented** in [version 1](../guides/WORLD_AUTHORITY.md). Per-home independent life-stage body sizing is delivered; a common physical scale across linked homes, resident rosters and Spawn UI remain designs below. Existing single-cat cards remain supported.

## One world, explicit authority

- A world belongs to one dashboard view, identified by a stable explicit `world_id`, independent of the view title or card order. Moving to another view disposes the old runtime; it does not continue an invisible simulation.
- Exactly one explicitly designated primary home owns that world's saved settings and permanent resident definitions. Other home cards reference the world and resident IDs; they do not own competing copies of the roster.
- The primary flag currently used for editor presentation does **not** silently become data authority. Migration requires an explicit choice and a normal HA configuration save. No first-mounted or last-rendered card wins.
- Multiple primary owners are a visible configuration conflict. Refuse new roster/scale changes until resolved; keep the last unambiguous in-session world, or the existing legacy single-card behaviour on a fresh load. Never merge/delete residents automatically. A temporarily hidden primary still owns its saved definitions; a permanently removed primary requires explicit reassignment.
- New world references wait for their explicit authority before spawning; they do not infer a roster from mounted cards. Keep the primary outside conditional containers, using hidden home UI if desired. If a conditional primary is absent on first load, show an authority-waiting state rather than inventing defaults.

## Prop scale and body size

- New worlds use one saved world-cell scale, initially **3 CSS pixels**. Furniture and loose toys use world cells; choosing a smaller cat does not shrink the furniture or its carried toy.
- Resident body size is a separate factor applied to the 24-cell cat artwork. Gait displacement, paws, gaze, mouth, grip and collision/clearance use that resident's effective physical scale; supports and props retain their own physical bounds. Visual pixel alignment must remain deliberate at each supported factor.
- Updated owner priority, 19 October: size-only life-stage V1 starts with kitten body factor 0.5; adult/senior remain factor 1. The earlier integral 2/3/4-cell suggestion is deferred. Fractional kitten cells at odd world scales require visual/contact review, not silent rounding. [V1 gates and future modifiers](LIFE_STAGES_AND_SETTLING.md).
- V1 maps stage to the simple size preset above, with no behaviour changes. Future behaviour profiles and optional body-size overrides remain separate concepts. Age must not imply compulsory ageing, death, care obligations or inability to play.
- Existing mixed `cell_size` cards keep their current actor/home/prop scaling in legacy mode. Do not resize already spawned or carried toys. A migration preview must show old/new sizes and contact conflicts; apply changes only after saving. Recreate affected loose props at a safe settled boundary rather than morphing them in a cat's mouth.

## Permanent residents versus temporary spawns

| Data | Permanent resident | Temporary spawn |
| --- | --- | --- |
| Identity | Stable generated resident UUID; legacy `cat_id` retained as an alias during migration | New session ID, distinct from permanent IDs |
| Saved fields | Name, palette, body-size/life-stage settings, temperament seed and home association | None unless explicitly converted and saved as a resident |
| Reload/view return | Recreate from saved definition at its home or a safe visible support | Removed; does not reappear automatically |
| Position, route, animation, temporary effort/moods | Client-local session state; restart calmly without offline accumulation | Client-local and discarded |
| Rename/reorder/count change | Preserve IDs, names, seeds and surviving residents; removal is explicit | Does not renumber or replace permanent residents |

Random names/colours/seeds are picked once when a definition is created and persisted by the normal editor save. Rendering and hydration must not reroll them. Duplicate cards referring to one resident mount one actor per world/client, with a visible home-authority conflict if their definitions disagree. Temporary residents share the normal collision, prop-claim and cleanup rules; reaching a cap is a clear UI result, not silent replacement of another cat.

## Persistence and migration contract

- Store permanent definitions in ordinary HA dashboard configuration first. No new backend, entity helpers or shared cross-client playback state is required. Two clients read the same identities but run independent decorative sessions; neither advances another client's needs or writes device state.
- Migration is explicit and reversible: back up affected card configurations, choose the primary/world scale, map each existing `cat_id` to a stable resident, preview names/colours/sizes/home conflicts, then save only scoped paths. Preserve advanced fields and a rollback mapping. Never infer missing residents from whichever cards happen to be mounted.
- Hiding home UI does not delete a resident or create a zero-size physical ledge. If no safe visible support exists, suspend until one appears. Removing the last home/world unloads actors, toys, reservations, timers and overlays; saved definitions persist only where still configured.
- Before implementing rosters, test legacy 2/3/4 scales, smaller/larger carriers, primary removal/conflicts, reordered/nested/conditional cards, hidden homes, reconnect/view changes, duplicate references, clean reload and two clients. Contact, mask and route correctness gate new body-size options.
- Initial resident/temporary limits must follow measured target-device cost. The existing 20-cat fixture is evidence for testing, not a promise of an arbitrary production capacity.

This settles authority and persistence semantics. Rooms/doorways, themes and entity-aware decoration build on this model later; they do not require implementing a backend or rosters in the current reliability batch.
