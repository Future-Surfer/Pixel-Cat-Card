# Pixel Pet Card: asset pipeline

`pixel-pet-card.js` is a clean, independent custom card. It does not import or call the original Stick Pet Card.

The only art format is a 24 x 24 array of characters:

- `#` is a filled black sprite pixel.
- `.` is transparent.
- `R` is a filled pixel that becomes red only when paw debugging is enabled.
- `F` and `B` are filled front- and rear-paw markers used by the turning clip.
  They render as normal cat pixels unless paw debugging is enabled; then `F`
  is red and `B` is amber.

## Adding a new supplied pose

When Lewis supplies an image called, for example, **sitting**:

1. Confirm it is a square 24 x 24 grid, with one intended sprite cell per grid square.
2. Read the centre of each cell, rather than tracing anti-aliased edges.
3. Transcribe black cells as `#`, empty cells as `.`, and temporary red paw cells as `R`.
4. Check that there are exactly 24 rows and exactly 24 characters in every row.
5. Add the rows to `PixelPetCard.POSES` under the stable name `sit`.
6. Add `sit` to the editor pose dropdown.
7. Create a named HA Card Lab session with `pose: sit`, capture it, and compare it directly with the supplied image.

For a multi-frame action, add a named frame list rather than changing the renderer. Each frame is the same 24-row format. The patrol renderer is only allowed to select frames and translate the sprite by whole cells; it must not deform the supplied artwork.

## Transitions and independent idle tracks

The card has two more asset shapes, both still made only of complete 24 x 24 arrays:

- `TRANSITIONS.walk_to_sit` is an ordered list of authored bridge frames. Each frame is held for one normal walk-frame beat. Add further supplied bridge frames to the list; do not interpolate them.
- `SIT_IDLE_FRAMES[breath][tail]` is a 2 x 2 matrix of complete sitting frames. The first index is the body-breath state and the second is the tail state.

The sit player uses one fixed `idle_frame_ms` clock. `sit_breath_steps` and `sit_tail_steps` count its ticks independently, so body and tail remain frame-aligned while their cycles drift through all four authored combinations. The renderer does not bend, rotate, or procedurally animate a tail.

### Standing pause

`STAND_PAUSE_FRAMES[head_body][tail]` is another supplied 2 x 2 frame matrix. It is deliberately a **pause** rather than a long-lived idle: the default patrol uses it only during its short rests before walking back, and `walk_to_sit` now uses it between the walk and the supplied sit transition. This gives the intended patterns:

- walk → standing pause → walk back
- walk → standing pause → sit

Preview the pause directly when checking new art:

```yaml
type: custom:pixel-pet-card
title: Pixel Pet standing pause
pose: stand_pause
idle_frame_ms: 250
stand_pause_breath_steps: 4
stand_pause_tail_steps: 3
```

The four provided frames are literal arrays. The independent timing only selects among them; it does not generate unapproved tail or head geometry.

### Looking up

`LOOK_UP_FRAMES` contains two literal standing frames: the supplied tilted-head
silhouette with loose and hooked tail variants. It is available as `pose:
look_up` and as the temporary **Look up** control. The pose is deliberately a
short finite action, so a future elevated-interest POI can request a look
without implying that the cat must jump.

An elevation route uses the same look-up action after it reaches its lead-paw
launch anchor and before its crouch. Both 250 ms variants are shown in order;
the crouch and airborne frames still use their existing explicit leap anchors.
This keeps the new anticipation beat from moving the take-off paw or changing
the proven landing placement.

### A lightweight breathing convention

Use a shared **250 ms frame grid** for idle art unless a supplied asset needs another cadence. An idle pose can then choose its own held duration in whole grid ticks:

- `sit_breath_steps: 4` holds each sit breath frame for one second.
- `sit_tail_steps: 3` changes the sit tail every 750 ms, independently.
- `loaf_low_head_steps: 12` keeps the loaf's low catnap head for three seconds.
- `loaf_alert_steps: 1` then shows the supplied lifted-head alert frame for one 250 ms tick.

This is a coordination convention, not a realism rule. A sleepy pose can hold longer, an alert head-bob can use fewer ticks, and a supplied sequence always takes priority over a generated rhythm.

Use the supplied test routine to review the full sequence:

```yaml
type: custom:pixel-pet-card
title: Pixel Pet walk to sit
routine: walk_to_sit
pose: auto
show_paw_debug: true
```

Or hold and animate the sitting idle directly:

```yaml
type: custom:pixel-pet-card
title: Pixel Pet sitting
pose: sit
idle_frame_ms: 250
sit_breath_steps: 4
sit_tail_steps: 3
```

The same pattern supports the supplied sit-to-loaf bridge and two-frame loaf idle:

```yaml
type: custom:pixel-pet-card
title: Pixel Pet sit to loaf
pose: auto
routine: sit_to_loaf
idle_frame_ms: 250
loaf_low_head_steps: 12
loaf_alert_steps: 1
```

The supplied three-frame stretch is a `loaf_to_walk` bridge. It uses the same 250 ms frame grid, then returns control to the normal whole-cell patrol:

```yaml
type: custom:pixel-pet-card
title: Pixel Pet stretch
pose: auto
routine: loaf_to_walk
idle_frame_ms: 250
```

An authored bridge can also declare per-frame hold ticks in `TRANSITION_HOLD_TICKS`. The current stretch holds its peak frame for two ticks (500 ms) and its remaining frames for one tick each. This is a pose-specific timing choice, not a global slow-motion rule.

## Current behaviour

With `pose: auto`, the cat chooses from available natural, prop, and user-created POIs, walks or routes to the chosen destination, performs an appropriate finite activity, and returns to the available pool. Surface types contribute pose preferences (for example, sofa seats favour longer loafing; narrow arms favour sitting). Explicit actions take priority for one action, then return to Auto unless it is disabled.

### Focus and World views

`view_mode: cat_focus` is the default. It uses the same world-coordinate simulation as World view, but follows the cat with a modest crop so the pixel art remains useful in a compact dashboard card. `view_mode: world` shows the complete scene.

The small **World view / Cat focus** control changes the view only for the live card instance. It is always available; the wider developer controls are opt-in:

```yaml
view_mode: cat_focus # default; use world for the uncropped scene
show_controls: false # default; set true for grouped developer controls
```

### Temporary in-card pose tests

While the pose library is being reviewed, the card shows a grouped live test
bar. **Auto** appears first because it is the world planner and is enabled by
default (`auto_enabled: true`). It is intentionally distinct from the pose
buttons: Walk, Stand, Sit, Loaf, Stretch, and Clean are finite pose triggers
layered over Auto. Once a trigger finishes, the planner resumes only if Auto is
still enabled. Turn Auto off to isolate a pose or world action; the explicit
trigger will finish, then the cat remains where it stopped rather than choosing
another activity.

**Feed**, **Elevate**, **Sofa top**, and **Descend** are separate world-action controls;
they remain available with Auto off. Frame name, Pause/Play, stepping, platform,
paw, POI, path, surface, activity-log, and **Hide cat** controls are grouped as debug tools. These buttons change
only the live preview; they do not write dashboard configuration. **Frame name**
adds a small current-frame label below the cat. **Pause/Play** freezes the
shared world clock, including cat motion and entity-carousel timing. Where an
elevation is being debugged, **Height − / Height +** adjust the green platform
in whole cat cells and show its live height. The debug platform has no maximum
height (it retains a four-cell minimum), so a tall ledge can be tested without
changing YAML. **Hide cat** suppresses only the cat sprite and its frame label,
leaving props, the floor, surfaces, POIs, and other debug overlays visible for
cell-level sprite inspection. The same view can be made declarative with
`show_cat: false`.

**Activity log** writes a compact, timestamped trace onto the left wall of the
world: frame changes, POI reservations/consumption, food route choices, and
body-continuity flags. A flag is intentionally raised whenever the sprite's
world anchor moves by more than one cell between renders, including authored
leaps and descents; it is a review signal rather than an automatic error. Set
`show_activity_log: true` in YAML to have the overlay enabled on load, or use
the on-card toggle to enable it only for the current preview.
When an authored bridge exists, the preview uses it: stand/walk to sit uses
`walk_to_sit`; leaving a sit for a walk reuses that same authored frame as its
single-beat reverse bridge. Sit to loaf uses `sit_to_loaf`, and loaf to
walk/stand uses the stretch bridge. A loaf-to-sit request chains the stretch
and walk-to-sit clips instead of inventing in-between pixels.

`show_controls: false` hides the developer bar. `show_pose_test_controls` remains accepted as a legacy alias.

### Box hop and in-box idle

`cardboard_box` is an independent 22 × 10 prop, with its orange box artwork
kept entirely outside the `BOX_ENTRY_FRAMES` and `BOX_EXIT_FRAMES` cat clips.
The **Box hop** world action (or clicking the box) walks to the authored crouch
point, holds the familiar crouch, then plays the supplied launch, flight and
entry beats.
Once inside, independently composable head/ear and tail layers provide a slow
peek, rise, settle and sideways shuffle without baking the box into cat art.
Clicking the box again (or **Leave box**) plays the separate exit action:
gather inside the foreground box, clear its rim, leap away, use the existing
floor crouch to absorb the landing, then return to normal auto behaviour.
The reference sheets and extraction notes are kept in
`reference/box-hop` (development reference retained privately) and
`reference/box-idle` (development reference retained privately), and
`reference/box-exit` (development reference retained privately).

The walk playback order is deliberately rotated: the previously supplied frames
2, 3, 4, 1 now play as frames 1, 2, 3, 4. This makes the first step agree with
the standing silhouette at take-off.

### Debug 360 turn

`TURN_FRAMES` is a literal five-frame right-to-left pivot supplied by Lewis.
It is deliberately **not** used for ordinary walking reversals: a normal cat
snaps to the new facing before the next walk step. The frames remain as a
debug-only full spin. Each five-frame half-turn keeps its declared rear bearing
point on the same floor cell; the second half uses the reverse/mirrored clip to
return to the original facing.

Use `pose: turn` or the temporary **Turn 360** debug button to review the full
clip with `show_paw_debug: true`. The on-card control plays one finite spin,
then restores the original facing. This does not make ordinary walking
direction change look busy.

## World props and POIs

### Prop inventory

Props are now data-driven inventory entries rather than special renderer cases.
The starter scene includes a toy mouse, ball, mug, water glass, potted plant,
floor lamp and Home Assistant-aware analogue clock alongside the food bowl and half sofa. Their source
references live in `reference/props/`. Each entry is a native-grid palette
array and is registered with a stable ID, label, category, placement and a
capability map. This preserves room for interactions without making the art
layer responsible for simulation:

```yaml
props:
  - id: ball-1
    type: ball
    x_ratio: 0.22
    capabilities:
      movable: true
      pushable: true
      boppable: true
      rollable: true
```

`capabilities` may override the defaults per instance; `state` is reserved for
future persisted values such as position, velocity, rotation or spills. The
current pass is intentionally visual-only for the new objects. Only props with
`capabilities.food: true` create food POIs, so decorative and toy inventory
cannot accidentally invite the cat to eat.

The on-card **Props** menu is a reversible development inventory. It can add a
fresh runtime instance of any registered prop or remove either a runtime or
configured instance for the current browser session; it never changes YAML.
The registry optionally declares `poi` metadata separately from its pixels and
capabilities. A newly added box creates a high-priority, one-shot `box`
invitation, so Auto routes the cat normally to the box before the authored
entry clip starts. A newly added mouse or ball creates a lower-priority
one-shot `inspect` invitation. Removing a prop also clears its outstanding
invitations. This is the intended pattern for later props: artwork,
capabilities, and optional behaviour/invitation data remain distinct.

The clock face remains a native 16 x 15 palette array, while its hour and
minute hands are rasterised on that same grid from the current instant. It uses
`this.hass?.config?.time_zone` with `Intl.DateTimeFormat().formatToParts()`,
so the home time zone and daylight-saving rules take precedence over the
browser locale. It refreshes once per second only when the hand-cell signature
changes; no `sensor.time`, helper, automation or external request is needed.
If HA's time zone is briefly unavailable or invalid, the browser time zone is a
non-throwing temporary fallback.

The first world prop is a 4 x 2 **food bowl**. Its dark and light terracotta
rows are rendered separately from the cat art, on the cat's native pixel grid.
By default it sits at the right end of the ground line. The bowl is clickable;
clicking it (or the temporary **Feed** test button) sends the cat to eat.

```yaml
type: custom:pixel-pet-card
title: Pixel Pet bowl visit
world_id: default
cat_id: cat-1
food_visit_ms: 8000
props:
  - id: food-bowl-1
    type: food_bowl
    side: right # or left
```

Each bowl exposes stable POI markers named `food-bowl-1:left` and
`food-bowl-1:right`. The current card filters out markers that would place the
24-cell cat outside the visible floor, then reserves the nearest free marker
for `cat_id`. A visit follows whole-cell `travel → sit → eat → sit → depart`
states and releases the reservation once complete. The two eating frames contain
only cat pixels; the bowl remains a prop.

The food clip faces the selected bowl-side POI throughout approach, eating and
post-meal sitting/cleaning. The POI contact point is calculated from the visible
eating pixels, rather than the transparent 24-cell canvas.

### Responsive sofa: first room-scale prop

The scene now includes Lewis's refined literal 30 x 30 **sofa half** at the
right edge of the world. Its reference is stored as
`reference/sofa-half/sofa-half-30x30-v3.jpg`. Its palette retains source highlights, upholstery
shading, structural shadow and both sofa-foot colours as separate tokens.
Compact cards render that half unchanged; worlds at least 72 cells wide compose
it with a native-grid mirror into a 60-cell full sofa. This is a scene-layout
choice, never an image scale operation, so a future room/door system can select
furniture layouts without altering assets. The stage automatically grows enough
to show both the 30-cell top and the full cat above it.

The sofa exposes its soft **seat** (`sofa-half-1:seat`, 11 cells), sit-only
left/right **arms** (`sofa-half-1:arm-left` and, for a full sofa,
`sofa-half-1:arm-right`, 20 cells), and walk/sit **backrest**
(`sofa-half-1:back-top`, 30 cells). Their spans follow the refined artwork;
full-sofa surfaces expand across both halves. Each
surface declares both accepted and preferred poses, plus an explicit
`activityWeights` list. Auto filters activities to accepted poses, then picks
from the weighted list: the seat strongly favours a long loaf, while the arm
permits only sitting and the backrest strongly favours perching. The route planner treats
all three as graph nodes: it can chain ground → seat → arm → backrest, or use
any cheaper connected route, with the existing leap and descent frames reused
for each vertical hop. The arm is traversable despite not allowing a walking
idle, so it can be a deliberate landing/stepping surface.
The green debug surface is hidden by default and remains available through the
debug toggle. The **Surfaces** debug toggle overlays every active surface with
its bounds, ID, type and supported activities; it is an inspection layer, not
gameplay art.

Later work can tune leap clips by height difference, add more route costs or
surface restrictions, and allow individual room layouts to select sofa halves
or full sofas without replacing the asset or its coordinate system.

Food uses the same route planner as ordinary POIs. If the cat begins on an
elevated surface, a feed request first walks to a safe edge, descends through
the authored landing sequence, then continues along the floor to the bowl; it
does not reset the cat directly to ground level.

The food visit uses the raised head/tail frame only to lower into and rise out
of the bowl. During `food_visit_ms`, the low-head eating frame is the default:
the head stays planted in the bowl while the tail changes between its two
authored positions every eight idle-frame intervals (two seconds by default).
The other two head/tail combinations are
stored as literal pixel frames, which keeps the matrix extensible without
runtime sprite deformation. This is deliberately a subtle eating action, not a
busy repeating or paw-licking animation.

After eating, the cat sits briefly, plays the supplied three-frame paw/face
cleaning clip twice, sits again, then plays it three times before a final short
sit and departure. Each authored cleaning frame lasts one `idle_frame_ms`
beat (250 ms by default). The temporary **Clean** button previews this clip on
its own while the pose library is still being developed.

`show_poi_debug: true` draws the POI markers: green is reachable, red is
reserved, and grey is a logical marker outside the current card bounds. The
IDs and reservations are intentionally present before multi-cat rendering, so
a shared scene can later add cats without changing prop semantics. Natural
markers cool down and are replaced from the active pool; a user-placed marker
is a one-shot invitation and disappears once the cat reaches it. A marker bound
to an elevated surface uses that surface's top and safe walking bounds, rather
than falling back to empty space or the floor.

## Auto behaviour

With `pose: auto`, the card now chooses one complete activity at a time rather
than running a fixed patrol. It starts with a short walk, then randomly selects
compatible next activities: more walking, a standing pause, sitting, a two- or
three-pass paw-cleaning burst, a longer loaf, or a stretch that leads back to
standing. Compatibility is deliberate: cleaning and loafing begin from sitting,
and stretching begins from loafing. This keeps the pixel poses coherent while
leaving room for a more considered needs/POI behaviour system later.

## Motion profiles

Movement remains cell-perfect: the existing four walk frames and one-cell
positions are unchanged, but each route plans different waits before its next
cell. `amble` preserves the normal casual pace. `food` now launches into a
brief run, reaches its fastest pace early, then eases down on the final
approach to the bowl. `poi` uses the same casual gait but applies a capped
distance bias inside the existing route profile: after roughly three-quarters
of a cat length, farther invitations get progressively quicker (up to 1.65x).
This does not add a second movement system: the normal acceleration, braking,
per-cat traits, and frame timing still determine every step.

Each cat receives a small, stable speed character derived from `world_id` and
`cat_id`; it affects pace, acceleration and braking without changing on each
page refresh. World/UI animation remains on the shared clock, so entity
backdrops, props and future environment effects never speed up with a cat.

Advanced YAML can tune the variation and any profile without changing the
sprite art:

```yaml
motion_variation: 0.06 # 0–0.20, stable per-cat range
motion_profiles:
  food:
    start: 2
    cruise: 4.8
    finish: 0.9
    accelerate_until: 0.18
    brake_from: 0.58
  poi:
    cruise: 1
```

The three speed values are multipliers of the casual walk-frame pace; the two
fractions describe route progress. Omit this block to use the tuned defaults.

## Entity-value backdrop experiment

The card can render a selected Home Assistant entity as pixel art behind the cat. Its value, compact unit mark, and label are built from the same literal bitmap-glyph arrays as the sprite. The friendly name is a smaller pixel caption below the floor line.

```yaml
type: custom:pixel-pet-card
title: Living room climate
height: 340
pose: sit
entity: sensor.living_room_temperature
show_entity_backdrop: true
backdrop_value_format: auto
backdrop_unit_style: auto
backdrop_label: Temperature
backdrop_resolution: double
backdrop_color: '#e1a640'
backdrop_opacity: 0.68
```

`backdrop_value_format: auto` keeps a numeric headline short: temperatures and values of ten or more are rounded to a whole number, while smaller values use two significant figures. Choose `whole`, `significant_2`, or `raw` when an entity needs an explicit override. `backdrop_unit_style: auto` renders a small `°` for temperatures (without `C`/`F`) and `%` at a smaller size; choose `hidden`, `compact`, or `full` to override that treatment.

`backdrop_resolution: double` uses a 48 x 48 field whose cells are half the cat pixel size. This is the recommended default for values, labels, small background details, and other supporting visual information: it stays legible without becoming a second sprite. `same` is retained as a comparison/debug option, but a short value already becomes visually dominant at the cat's native 24 x 24 cell size.

The optional `show_backdrop_grid: true` reveals the field while developing art. It is a debugging aid, not a production treatment. The food bowl is the first native-grid world prop because it aligns to the floor and cat paws. Future supporting/background props may use the double grid; each asset should declare its own resolution rather than inheriting an arbitrary global rule.

### Editor and multi-entity carousel

The visual editor has two expandable sections:

- **Cat appearance** uses Home Assistant's form components with a colour picker for the cat.
- **Entities** uses the core entity picker to add items. Each item can be reordered, removed, and edited for label, value override, numeric format, unit treatment, and value colour.

Selecting the first entity enables the backdrop. Existing single-entity YAML remains supported. For a carousel, use `entities` instead:

```yaml
type: custom:pixel-pet-card
title: Pixel Pet data carousel
show_entity_backdrop: true
entity_display_ms: 3600
entity_slide_ms: 1000
entities:
  - entity: sensor.living_room_temperature
    label: Temperature
    value_format: auto
    unit_style: auto
    color: '#e1a640'
  - entity: sensor.living_room_humidity
    label: Humidity
    value_format: auto
    unit_style: auto
    color: '#3d8fbd'
```

The carousel has a fixed pixel-language handover: after the hold, the outgoing value shifts left by **one cat pixel** and loses **25% opacity** on each of four beats. The next value enters from the right on the matching four beats. `entity_slide_ms: 1000` therefore gives four 250 ms steps by default; no easing or sub-pixel movement is used.

## Minimal Home Assistant configuration

```yaml
type: custom:pixel-pet-card
title: Pixel Pet
height: 260
pose: auto
```

For a static named pose:

```yaml
type: custom:pixel-pet-card
title: Pixel Pet sitting
height: 260
pose: sit
```

## Deliberate guardrails

- No inverse kinematics.
- No body solver.
- No procedural limbs.
- No hidden geometry or interpolation between pixel poses.
- New art must be visible in a direct Lab capture before it becomes a default pose.
