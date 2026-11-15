# Card-edge climbing and transfers

The live card and the [Climb workshop](http://127.0.0.1:8769/prototype/climb-lab.html) share the climb planner, authored side grip and catch frames, and runtime jump probes. Dashboard geometry supplies the exposed edge, reachable starting support, available grip height and landing. The cat can approach, leap to the edge, climb using planted paw contacts and release from the first checked height in that climb. The takeoff side sets which way the cat faces at contact, so the same border can be gripped from the inside or outside. Entry artwork depends on the grip height relative to takeoff. The later climb direction independently selects its cycle. A quick **Wall jump** uses the same edge and flight checks with a brief grip and no ascent. Cat-tree routes use the same planner with their authored post edge.

## Surface discovery and safety

- Discovery measures painted cards and declared surfaces. It excludes transparent wrappers, hidden or detached elements, covered regions and explicitly disabled surfaces. A usable edge must meet the original panel boundary; an interior patch created by an obstruction cannot become a new card edge.
- An exposed edge and a standing top are separate. Top landings need actual clearance and enough width for the cat. Visible cat-home roofs are shared by default. Either home can turn off **Share visible home-card roofs**. Excluded homes still appear in diagnostics as outlines with a reason.
- The adapter checks the walking approach, grip footprint, both flights and landing occupancy. It rechecks the route at entry and the landing before release. If the geometry changes, the existing climb lifecycle checks recovery. Ordinary travel and safe return routes remain available.
- Cats choose whether to leave a familiar perch before scoring destinations. Upward destinations more than 16 body cells away vertically get 55% of their ordinary weight. Beyond 48 cells they get 25%.
- For a selected destination, small hops use ordinary routing. For rises of at least 24 cells, cats usually consider a wall route first. A quick push-off gets the first try on 15% of checks; 75% of checks can try a sustained climb if needed. A direct leap remains available when the wall route fails or the cat chooses the ordinary route.
- Drops of at least 32 cells get a 65% chance to check for an intermediate wall grip. Both legs must pass the existing flight checks, with the grip between the takeoff and landing heights. Smaller drops use ordinary routing. Wall preferences have a 12-second cooldown and preserve a checked way home.
- A quick wall jump uses a 24 ms contact beat between the checked attach and release flights. A sustained climb retains its brief grip pauses.
- Behaviour Lab offers **Climb and leap** and **Wall jump**. Cats can reposition on a checked approach when the current spot fails. **Completed** counts actual landings. Diagnostics also expose exclusions and missing return routes.

## Testing and rollback

Use the Climb workshop to tune pose contacts, cadence, post height and destination elevation. Use [Live climbing](http://127.0.0.1:8769/prototype/climb-runtime-lab.html) or the HA Testing dashboard for card runtime integration. Set `debug_vertical_surfaces: true` to inspect measured boundaries, exposed patches and clear landing tops.

The previous centred-face planner and its comparison lab are retired. The retained geometry tests cover exposure and standing tops. Production route tests cover actual side poses, live support IDs, occupied and removed landings, and scrolling.

Relevant sources are [climb-model.mjs](../../prototype/climb-model.mjs), [cat-card-climb.js](../../prototype/cat-card-climb.js) and [vertical-surface-model.mjs](../../prototype/vertical-surface-model.mjs).
