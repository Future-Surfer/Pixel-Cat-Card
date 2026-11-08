# Leap polish, head clocks and click attention

> Planning authority: [../ROADMAP.md](../ROADMAP.md) is the only active vision/task backlog. This document is an operational reference or dated engineering record; earlier proposed steps are not a separate delivery order.


## Jump direction and clearance

Jump intent within six sprite cells horizontally preserves the current facing.
Small differences between pose origins no longer flip a nearly vertical drop.
For a wide landing surface, a near-vertical descent also aligns the flight's body
centre horizontally where the surface allows it, instead of drifting backwards
because takeoff and landing canvases have different internal offsets. Clearly
lateral jumps face their direction of travel. Narrow surfaces retain their final
landing-paw constraints.

Ascending jumps use eight cells of clearance above the higher body-centre endpoint,
up from six. `jump_up_clearance` can override this. Gravity, horizontal velocity
limits and the authored grounded pose holds remain independent of clearance.
Across jumps use the user-approved `horizontal-leap-candidate.json` frame during
flight. Its AI origin and chat approval are recorded; ascent/descent art is unchanged.

## Head movement and paw contact

The leg frame still advances once per whole sprite cell travelled, including
acceleration and braking. Nothing slows the feet or slides a held stance frame.
The head has its own accumulated phase, preserved across walks and retargeting.
`walk_head_bob` supports:

- `auto` (default): original cadence below 18 cells/s, half-time above it.
- `step`: exact original human-authored walk frames, every gait step.
- `half`: head phase advances once per two leg frames at every speed.

`head_bob_half_speed` adjusts the Auto threshold. Auto uses each cell's actual
duration, including interest distance bias and acceleration, rather than only the
configured cruise speed. The home debug panel exposes all three modes. Changing
modes affects future head phases during the current walk without changing its
position clock. Switching explicitly to Original uses exact source frames.

The development head variants copy the original high or low head patch at
x14..23/y0..13 onto each of the four source gait frames. The remaining pixels,
including **all paw markers**, are untouched. Four resulting frames are identical
human references; four new combinations are **mixed-origin development candidates**,
not silently approved human artwork. These are used in the experimental roaming
player and available in Frame Studio's development group for review/refinement.
The normal every-step mode is available throughout. The original `pixel-pet-card.js`
is not changed. `walk-head-development-project.json` is importable, and
`walk-head-comparison.gif` compares both clocks at the same gait rate.

## Click attention

A primary click on a foreign card attracts the cat toward a nearby reachable
point on that card. Clicking near a teal inspection target can choose that
look-up stop; otherwise the closest enabled surface receives a stop projected
near the click's horizontal position. A return route is required. Disabled
interior candidates are not implicitly enabled by a click.

The capture listener never prevents the event or stops propagation. Card buttons
continue their own actions; a card-height change was tested with attention routing
at the same time. Modified clicks, form-field editing, the home card itself and
blocked dialog/edit contexts do not attract him. `click_attention: false` disables
this behaviour. If walking, he finishes the current distance-clocked footstep
before rerouting. An active jump finishes before a new destination is planned.

## Verification

`test-roaming-attention-and-head.mjs` checks near-vertical drops at multiple scales
and both facings, body-centre drift, two-cell ascent clearance, approved AI frame
installation, independent head timing with identical paw rows, original-frame
fallback, closest-click selection, modified/home click exclusion and safe walk
retargeting. Existing six roaming suites and both Studio suites also pass.

Browser verification uses the local shadow-DOM playground; live HA resource bytes
are read back after deployment. Local fixtures are not live HA frontend parity.

Observed browser result: the Bookshelf Change height action changed its height
from 260 to 320 pixels while the same click selected its inspection POI. The live
walk reported a mixed-origin head combination, and the Half/Auto selectors worked.
`click-attention-head-controls-proof.png` records the local debug controls.
HA readback matched the 53,021-byte controller and 38,057-byte artwork resource.
