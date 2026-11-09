# Scrolling, pose transitions and roaming variety

> Planning authority: [../ROADMAP.md](../docs/ROADMAP.md) is the only active vision/task backlog. This document is an operational reference or dated engineering record; earlier proposed steps are not a separate delivery order.


The controller measures scrolling on the next animation frame, without hiding the
overlay or waiting for a scroll debounce. Offscreen card geometry stays in the
surface graph; scrolling the home card away no longer suspends a visible roaming
cat. Uniform camera translations move an active ballistic trajectory without
restarting its clock. Reflow still replans the trajectory and retains progress.

Loaf entry uses the original human-authored walk-to-sit frame, sitting frame and
sit-to-loaf frame. Leaving loaf uses the reversed sit-to-loaf bridge. Pixel rows
are extracted unchanged; the bridge's bearing paw remains at the resting contact.

Leisure destinations use weighted random selection. A visit starts at actual
arrival at the final resting point, not at intermediate route nodes. Recent
surface and resting-point weights recover over about a minute; history is capped
at 128 entries. Manual visits and Home routing ignore those penalties. Existing
10-second rest defaults and cell-driven gait clocks remain in place.

Wide surfaces offer left, right and middle resting points, weighted 2:2:1 before
recency penalties. POI debug dots show those locations; grey dots mark visited
points. Surfaces as narrow as half the 24-cell canvas are permitted. These use the
authored hanging-tail perch pose, clamp its planted paws onto the ledge, and skip
a settling walk on the narrow ledge. Bodies and tails may overhang. Declared
surfaces are still deliberate physical annotations; a visual divider is not proof
of a real object or affordance. The Bookshelf fixture includes a small perch.

## Horizontal airborne candidate

`horizontal-leap-candidate.json` is a single new 24x24 AI-authored frame, with a
level back, trailing tail, forward head and gathered legs. It was inserted using
Frame Studio's `insert_ai_candidate` WebMCP pixel tool and was subsequently
approved by the user for current use. It retains AI origin and the source reference.
It has no planted contact anchor because it is airborne.
The importable `horizontal-leap-studio-project.json` preserves neighbouring human
keyframes and the candidate audit operation. The blank human drawing slot is kept.

The approved draft is now included in the live across-jump artwork and reference
library. Ascent and descent retain their own authored airborne frames. The user
plans to refine the draft later; acceptance preserves its AI origin.
`scripts/render-leap-candidate.py` renders the exact saved cells at
24px and enlarged scales for review; it does not create alternative artwork.

## Verification

Run build-roaming, then the motion, routing, idle, physics and autonomy scripts.
The autonomy regression exercises immediate remeasurement without hiding,
authored loaf bridge playback, visit weight recovery, edge selection, small
perches and scroll translation of an in-progress flight. Browser checks use the
local playground, including scrolling the home card completely out of view.
Live HA resource contents are read back after publishing. Authenticated HA visual
verification remains unavailable in the current browser session.
