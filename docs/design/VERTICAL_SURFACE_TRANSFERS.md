# Card-edge climbing and transfers

The live card and the [Climb workshop](http://127.0.0.1:8769/prototype/climb-lab.html) share the climb planner, authored side grip and catch frames, and runtime jump probes. Dashboard geometry supplies the exposed edge, reachable starting support, available grip height and landing. The cat can approach, leap to the edge, climb using planted paw contacts and release from the first checked height in that climb. A quick **Wall jump** uses the same edge and flight checks with a brief grip and no ascent. Cat-tree routes use the same planner with their authored post edge.

## Surface discovery and safety

- Discovery measures painted cards and declared surfaces. It excludes transparent wrappers, hidden or detached elements, covered regions and explicitly disabled surfaces. A usable edge must meet the original panel boundary; an interior patch created by an obstruction cannot become a new card edge.
- An exposed edge and a standing top are separate. Top landings need actual clearance and enough width for the cat. Neighbouring cat homes require **Share visible home-card roofs** on both cards. Excluded homes still appear in diagnostics as outlines with a reason.
- The adapter checks the walking approach, grip footprint, both flights and landing occupancy. It rechecks the route at entry and the landing before release. If the geometry changes, the existing climb lifecycle checks recovery. Ordinary travel and safe return routes remain available.
- On eligible leisure decisions, cats have a 20% chance per check to consider an edge transfer to a destination already reachable in one ordinary hop, with a 12-second cooldown. The planner can try a sustained climb before a quick transfer. User-requested travel follows ordinary route priority.
- Behaviour Lab offers **Climb and leap** and **Wall jump**. Cats can reposition on a checked approach when the current spot fails. **Completed** counts actual landings. Diagnostics also expose exclusions and missing return routes.

## Testing and rollback

Use the Climb workshop to tune pose contacts, cadence, post height and destination elevation. Use [Live climbing](http://127.0.0.1:8769/prototype/climb-runtime-lab.html) or the HA Testing dashboard for card runtime integration. Set `debug_vertical_surfaces: true` to inspect measured boundaries, exposed patches and clear landing tops.

The old centred-face planner is retained in [Vertical surfaces & transfers](http://127.0.0.1:8769/prototype/vertical-surfaces-lab.html) for comparison. Its planner is excluded from the production bundle. Tests cover actual side poses, outward release to live support IDs, occlusion, occupied/removed landings, scrolling, ordinary route priority, and a climb choice when an ordinary direct hop exists.

Relevant sources are [climb-model.mjs](../../prototype/climb-model.mjs), [cat-card-climb.js](../../prototype/cat-card-climb.js) and [vertical-surface-model.mjs](../../prototype/vertical-surface-model.mjs).
