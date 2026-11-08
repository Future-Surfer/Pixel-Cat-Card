# Gaze and awareness test lab

> Planning authority: [ROADMAP.md](../../ROADMAP.md) is the only active vision/task backlog. This document is an operational reference or dated engineering record; earlier proposed steps are not a separate delivery order. The one-target fixture below has a narrower scope than the current full roaming/social runtime; see INTERACTION_SYSTEM.md.


Run `npm run gaze:lab`, then open <http://127.0.0.1:8769/>. Keep the foreground browser window visible for performance comparisons. The loopback server exposes only the lab files and a read-only asset endpoint. It does not deploy to HA, write Studio projects, complete change receipts or alter production roaming scripts.

The lab reads saved local Studio projects from `.studio-data/projects/`, overlaid on the curated repository snapshots for sequences without a local save. It validates them, retains exact frame IDs, rows, gaze, origin and content hashes, and excludes deleted/archived/WIP sequences from the selectable catalogue. **Reload saved gazes** refreshes the snapshot; unsaved browser drafts are never read. On initial verification, all 36 non-WIP sequences had gaze on every frame: 215 markers in total.

## Two modes

Mood instrumentation is now available in the lab sidebar: glow, three value sliders, resume/reset and a nearby-high-landing cue injection. Amber/violet/cyan blend playfulness/sleepiness/alertness; the text readout includes exact values, seed and held/drifting state. It uses the same session-local model as HA. Ordinary exploration is not yet weighted by mood. The cue test can produce ignore/watch/hop; it does not simulate an actual second actor landing or force a particular result. In controlled mode mood/debug work is included with overlay timing; in exploration it is included in controller timing. No reliable enabled/disabled foreground performance comparison has been completed yet.

**Directional startle test:** put the target In front or Behind, then click **Startle away from target**. It switches a controlled pose into real movement and preserves the cat's facing: front sources cause backward hops, rear sources forward hops. The controller checks same-surface landing room and headroom, rejects busy/cooling-down requests and uses the approved seven frames on a ballistic arc. This explicit disturbance injection bypasses sensing intentionally; it does not treat a target behind a blind cat as visually detected. Automatic nearby-high-landing reactions are a separate opt-in pilot; other causes and retreat/counter-play remain planned. See the [trigger inventory](AWARENESS_AND_REACTIONS.md#current-startle-trigger-inventory).

- **Controlled sequence** plays the exact saved sequence on a chosen surface, with frame stepping, animation and facing controls. Reactions are reported as “would watch/investigate”; they do not replace the pose under examination. Walking sequences in this mode are stationary asset inspections, not gait travel tests.
- **Free exploration** uses the existing roaming controller, routes, animation clocks and paw-placement gait. The lab attaches gaze to the frame actually drawn, without copying marker data on each tick. The lab's instance wrapper is confined to this page. It does not change controller source or replace the cat's pixels. Watch/orient uses the existing glance/look sequence; optional investigation routes to a last-noticed point on the same surface. Busy routes are not interrupted. Pouncing, contact physics, actual two-cat encounters and ball interception remain future work.

The ball, mouse or second-cat target is a single scripted visual stimulus. Drag it (or focus it and use arrow keys), position it ahead/behind, roll it across the cat's support or enable back-and-forth movement. The second cat is explicitly a visual target, not a second autonomous controller. Scripted target motion is not the production ball physics or a real bat interaction.

**Place cat on a surface** is an explicit test reset: click a shelf/floor to reposition it. Natural exploration and investigation still use the real routes. The page has one observer, three shelf/floor fixtures and the home card; stock-card geometry is outside this experiment.

## Checks to try

1. Select Standing, disable Animate and put the target In front: it should become noticed after a short dwell. Behind should remain outside the field. The two positioning buttons clear awareness to isolate each trial.
2. Flip Facing and repeat: the eye origin and field must mirror together. “In front” refers to body direction, so a backward-looking frame may correctly reject it.
3. Select ground sitting (360 degrees) and place the target behind. It should be detectable within range. Move beyond the range: 360 degrees does not imply unlimited distance.
4. Select Loafing, step to a frame authored with Can see off (currently frames 2 and 3). The purple crossed marker should replace the field; an unseen target cannot be newly noticed. Returning to an open-eye frame restores the authored cone.
5. Drag a noticed target out of the field without pressing a positioning button. It should remain remembered for 2.5 seconds, then be forgotten. Closed eyes do not instantly erase memory.
6. Compare a stationary ball with a rolling one. Moving targets use a 100 ms notice dwell; stationary targets use 220 ms. Continuous visibility does not generate endless new notice events. Movement onset may attract renewed attention after the five-second cooldown.
7. Switch to Free exploration, use Watch / orient, and move a target into the current field. The trace should report notice and the actual authored watch reaction. Select Investigate and keep it on the same surface to test normal walking toward the last noticed position, without tracking through a blind spot.

## Frame identity and unknowns

Runtime clips bind saved metadata by stable sequence ID, source-frame recipe index and exact pixel equality. Original gait/head variants and jump phases have explicit bindings. A legacy bridge can use an exact-row fallback only when all matching saved frames agree on gaze. Ambiguous, changed or unmarked frames are shown as unknown and cannot produce visual detections in this controlled lab. The raw authored values are not averaged or replaced by a sequence-level approximation.

Explicit `gaze.canSee: false` blocks visual detection. Existing markers default to enabled. Authored sleep entry/exit markers are respected; sleeping without a known marker cannot see. Icons/text are not occluders. Partial target visibility checks the centre, corners and nearest bounding-box point; it is an approximate attention model, not pixel-perfect vision. Occlusion and swept detection for extremely fast stimuli are not implemented here.

## Performance comparison

The dashboard shows a rolling window of up to 600 visible, unpaused browser frames:

- Browser FPS and p95 frame interval, with focused/unfocused window status.
- Mean and p95 controller CPU duration.
- Mean and p95 perception CPU duration **per check**, sampled at approximately 10 Hz independently of animation FPS.
- Mean target/overlay update CPU duration and count of frame intervals over 33.34 ms.

Use the same controlled sequence and target motion for comparison. Disable reactions and overlays, turn perception off, Reset sample, and let it run. Then enable perception, reset and repeat for a similar duration. Compare both FPS/frame intervals and perception CPU cost. Toggle the overlay separately to measure debug drawing overhead. A refresh-rate cap, other tabs, background throttling, window focus, browser automation or screen capture can affect browser FPS; low FPS alone does not prove the gaze checks caused it. This is browser-side timing, not a GPU profiler or a benchmark of HA's full dashboard.

**Export results JSON** downloads the measured configuration, bounded event trace, current frame identity/gaze, asset hashes and timings. Pause suspends scene/notice clocks; hidden tabs do not build up simulation time. Layout reads occur during geometry invalidation, not in the perception algorithm. The raw-data approach stays the default until measurements justify optimisation.

## Initial verification

Browser trials confirmed Standing notices a front target and rejects a rear target, mirrored Standing notices in its reflected field, 360-degree ground sitting notices behind, and the second Loafing frame reports blind. In real exploration the trace recorded notice, an authored orient/glance, then an investigation using the phase-offset walking gait toward the last observed point. No browser console errors were reported. All 36 regression suites pass. The read-only endpoint and static-file allowlist were checked (writes return 405; private workspace paths return 404).

A short controlled one-target sample with overlays/reactions off recorded perception CPU mean/p95 of approximately 0.040/0.100 ms per check. The disabled/enabled samples had only 20/28 browser frames; both showed roughly 1007 ms p95 scheduling intervals (about 1.8/1.5 FPS averages). These automated/occluded-window samples are **not a reliable foreground FPS benchmark** and cannot establish a slowdown attributable to perception. Repeat the built-in comparison with the browser visibly running before making optimisation decisions.

## Shared workshop menu

Frame Studio and all five local cat lab pages use the same top menu (`frame-studio/dist/lab-nav.js`). Direct links open Frame Studio, Props lab and Gaze & awareness; More labs contains the roaming playground, multiple-cat fixture, standard-card surfaces, movement/jump fixture, behaviour map and asset changes. The gaze-lab server also serves the four older fixtures and their explicitly allowlisted dependencies, so a separate 8766 static server is unnecessary for these menu links. Both Studio (8767) and the lab server (8769) must be running. Studio panel heights account for the menu height. Hash navigation within Studio keeps the current workspace, and active-page highlighting follows page changes.

## Two-cat mood and social lab

Open [Mood & social](http://127.0.0.1:8769/prototype/social-lab.html) from the shared menu for two real independent actors, seeded quiet-company/chase scenarios, observed memories, independent recipient replies and performance comparisons. See [SOCIAL_PILOT.md](SOCIAL_PILOT.md). The original draggable second-cat target on this gaze page remains a controlled visual stimulus, not a social actor.
