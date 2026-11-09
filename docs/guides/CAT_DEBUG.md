# Cat controls, diagnostics and stress testing

> Planning authority: [ROADMAP.md](../ROADMAP.md) is the only active vision/task backlog. This document is an operational reference or dated engineering record; earlier proposed steps are not a separate delivery order.


Updated 23 October 2026. **Cat controls & diagnostics** has six task-based sections; one opens at a time. Controls retain their original handlers. Changes here apply to this browser session; use HA **Edit card** to save defaults.

The main buttons are **Explore**, **Home**, **Pause**, **Startle all** and **Wall jump**:

- **Startle all** wakes every active cat in this view and resets its five-minute settling clock. Each cat attempts its own safe hop. Flights/climbs finish before a queued reaction; manual Pause stays in force. A blocked hop still wakes the cat. Other views are unaffected.
- **Wall jump** invites only this card's cat to approach the nearest checked finite wall, grip it and leap off onto another support or back onto the same one. It waits for current movement/handling, checks the route again on arrival and respects home-sharing permissions. It works without enabling autonomous card climbing. If no safe route exists, the status explains this; carrying cats must put their toy down first.

Both buttons follow `show_controls` and are present before initial layout measurement. The [on-card command lab](http://127.0.0.1:8769/prototype/command-controls-lab.html) provides settled residents, a finite wall, real button handlers and explicit replay controls.

**Name & action labels** (`debug_labels: true`) show the resident name on line one and current action on line two, below the cat. Mood remains in the tint/text colour; it is no longer repeated as a word. New picker cards hide diagnostics; the twenty-cat stress fixture explicitly enables these labels. The glow defaults off (`debug_mood: false`); a separate above-cat name remains optional. Social actions include the partner's name; toy actions distinguish pats, bats, stalking and pounces. Labels use current state rather than historical trace entries. Position follows cached artwork bounds each frame; text refreshes up to five times per second. Labels are pointer-transparent and can overlap in crowds.

In **Display & overlays**, **Name & action below cat** controls the two-line label; **Extra name above cat** is a separate optional duplicate name, off by default. **Mood glow** is independent. Text/tint colours remain alert red, balanced black, playful green and sleepy purple.

| Section | Contents |
| --- | --- |
| Display & overlays | Name/action, extra name, glow, walking supports, measured card outlines/grip areas, route arcs and destination points |
| Travel & climbing | Destination picker/Visit, experimental card-climb and border-scratch switches, one wall-transfer preview, long-drop test, candidate/freefall options |
| Play & props | One play-invitation picker, shared-scene/mouse-motion switches, one spawn picker and shared-prop clearing |
| Animation preview | Authored action preview and walking head-bob playback |
| Behaviour & mood | Behaviour switches, mood sliders/hold/drift/reset, landing cue test and temperament |
| Diagnostics | Live performance, surface summary/report, recent decisions, reset this cat home and a separate whole-dashboard test disclosure |

The floating, bounded panel preserves the home card's height and walking surfaces. Its title stays visible during menu scrolling. Opening a section never enables a feature or forces an action. Normal play invitations retain existing eligibility/queueing; **Preview action** is the separate animation override.

In **Travel & climbing**, enable **Climb visible cards (experimental)** before **Try visible wall transfer** becomes available. Ordinary routes remain preferred automatically; this explicit preview can use a checked wall transfer even when another route exists. Try it when the cat is resting. **Scratch card borders** controls the separate supported-edge scratching pilot. [Finite-face contract and limits](../design/VERTICAL_SURFACE_TRANSFERS.md).

Shared prop controls affect this dashboard. Running-count and all-cat sampling controls are behind **Diagnostics → Whole-dashboard test controls**, away from ordinary single-cat actions.

## Slow wandering and complete ear scratches

Uncommitted relaxed exploration can choose a casual meander at 6 cells/second (about 6 authored walk frames/second), alongside the normal 9-cell/second stroll. The same cell clock slows both animation and displacement, using existing artwork. Sleepiness favours this choice; alertness/playfulness reduce it without making the decision rigid. `casual_speed` changes its speed and `casual_wander: false` disables this extra variant. Commands and purposeful social/toy movement retain their normal pace. The current action label calls it **Meandering**.

An ear scratch chooses 3–7 complete cycles once per bout, keeping the authored entry and exit single-use. At normal idle timing this is about 2.385–3.885 seconds (75 ms cycle frames). The idle/exploration deadline and optional preview duration cover the full bout. Physical startles and explicit commands can still interrupt it. No new pixels or asset provenance changes are involved.

## Shared page monitor

Add a monitor without spawning another cat:

```yaml
type: custom:pixel-cat-monitor
title: Cat performance
grid_options:
  columns: full
  rows: auto
```

This variant ships inside the existing `pixel-cat-behaviours.js` module; no extra resource, library, entity or backend is needed. All mounted monitor cards in a browser page share **one** requestAnimationFrame sampler. The display refreshes once per second: rolling browser FPS, mean/p95 frame interval, intervals over 50 ms, running/mounted cats in this view, and the number with individual profiling enabled. Mean/p95 sparklines retain up to 60 foreground updates (about a minute). The statistics window holds the latest 600 frame intervals; FPS is 1000 divided by their mean, so its time span depends on frame rate. Reset history clears the shared window and chart for every monitor.

These are foreground browser scheduling measurements across the page workload, **not CPU/GPU usage, controller CPU timings, or proof that frames were actually painted**. Display refresh rate and other dashboard cards also affect them. Hidden-tab gaps are excluded, sampling stops while hidden, and the last monitor disconnect releases its callback, visibility listener and buffers. Editor card previews do not start a sampler. The monitor registers no cat, furniture or walking surfaces.

The stress view uses one monitor and `debug_performance: false` on all twenty actors. Individual profiling below remains opt-in when investigating controller or decision costs; those costs cannot be attributed by the shared RAF sampler. The monitor warns through its individually-profiled count if actor profiling has been enabled. Running-count controls remain under an actor’s Reports & performance section. Reset after a change to start a fresh window. Collection waits at least eight seconds, document/font loading and initial cat-art/surface readiness, plus two seconds without a frame gap above 100 ms or a change in the mounted cats. Slow startup extends this wait. The chart remains empty at its 0–50 ms scale while waiting. Once collection begins, genuine slow frames remain visible; there is no ongoing outlier removal. Startup browser tasks can still be inspected in diagnostic evidence.

## Diagnostic evidence and scroll handling

The shared monitor's **Diagnostics & report** panel has a capture switch, **Show / refresh report**, **Download JSON** and **Clear log**. Capture defaults on while a monitor is mounted. Codex can inspect the read-only report textbox through the dashboard browser; an exported JSON file is the handoff when the problem occurred in a different browser or on a phone. This is browser-local storage, not an HA entity, server log or automatic upload. Different browsers/devices do not share reports. Opening/refreshing the report produces a static snapshot; the large JSON textbox is not regenerated every second.

Evidence is bounded: up to 120 one-second summaries, 20 coalesced frame-gap incidents (at least 100 ms, at most one per second), 80 browser long frames/tasks and 80 slow operations (at least 12 ms). Summaries include actor/prop/episode counts, motion/pose/mood counts, maximum surface count, scroll events/translations and shared overlay scan counts. Incidents include states for up to 24 actors, without artwork or DOM snapshots. Timing wraps only surface measurement, routing (`plan`/`pathTo`) and overlay checks while capture and a monitor are active; there is no per-actor frame-history buffer. Timings overlap: `plan` includes calls to `pathTo`, so never add their totals together as CPU usage.

Where supported, PerformanceObserver adds long-animation-frame records with blocking/script/forced-layout durations and up to five script hints. Other browsers fall back to longtask records or just RAF gaps and measured operations. Inline source URLs are replaced with a label; raw data-URI code, query strings, credentials and dashboard HTML are not logged. Browser records and post-stall actor context are clues, not causal stacks or proof of which operation froze the page.

Every roughly 30 seconds, on pagehide and on final monitor removal, a compact snapshot is saved under a versioned localStorage key for this dashboard path. Storage is capped at 160,000 characters, trimming older evidence when necessary. Storage denial/quota errors leave in-memory capture running and are reported in the panel. A reload exposes the last saved trace as `previousSession`; the newest unsaved seconds can be lost on a crash. Clear log removes the retained previous session and persists an empty trace. Reset history only resets FPS/chart history. Neither option changes cats or dashboard configuration.

Ordinary ancestor scrolling now validates existing card rectangles and translates surfaces, POIs, resting placements and flight geometry instead of rediscovering every card and rebuilding destination selectors each event. Rectangle reads are shared across cats for the same scroll observation. A per-frame camera sample also catches smooth/inertial scrolling between delivered scroll events. A full check follows 160 ms of quiet, staggered at one cat per frame per view. Nested card-content scrolling, sticky cards, resizing or non-uniform movement retain full discovery. `scroll_reuse: false` on a cat disables the translation path for comparison. Dialog discovery is also shared once per view/RAF; local visibility/navigation/disconnection/editor guards still run separately, and calls outside a RAF never reuse the cached dialog result.

Cats, labels and shared props now render in one owned, pointer-transparent scrolling plane inside the dashboard’s positioned content ancestor. The browser carries that subtree with the cards during compositor scrolling, even between JavaScript callbacks. A shared camera translates the existing viewport-coordinate simulation into this local plane once per frame. Fractional scrolling is retained rather than rounded back to whole viewport pixels; walking still advances in native-cell steps. The plane clips to the content area so it cannot grow the page’s scroll height, and is removed with its last layer. No HA host styles or card configuration are changed. Unsupported transformed/unsafe containing-block layouts retain the old fixed-overlay fallback. Sticky/non-uniform content still needs geometry reconciliation and device validation. The monitor's diagnostic controls float above the dashboard to preserve card height; opening its report no longer forces a full page remeasurement. Other layout-changing interactions can legitimately cause full discovery; distinguish those from spontaneous freezes in reports.

## Individual controller profiling (optional)

`debug_performance: true` enables a rolling window of up to 600 foreground samples for that actor. A live checkbox can enable it temporarily. Sampling continues while the panel is closed; statistics are calculated and the readout refreshed once per second only while Reports & performance is visible. Hidden mood/surface reports also stop formatting until opened. The readout shows:

- Browser frame interval mean/p95 and corresponding FPS.
- This cat's controller elapsed CPU time mean/p95.
- Its decision/perception step elapsed time mean/p95, included in controller time.
- Running versus mounted cats, number sampled and sum of sampled controller means.

The sum of means is **not** a measured whole-frame p95. GPU work, browser layout/painting outside the controller, other cards, background tabs and metrics-rendering overhead are not attributed to the controller measurement. FPS reflects browser scheduling. Paused/hidden/suspended actor frames are excluded from its sample; paused cats remain mounted and their existing idle callbacks can still contribute to page overhead. Samples are bounded, session-local and collected only when enabled. Reset after changing feature flags or actor count before comparing a full fresh window.

**Sample all cats in view** turns sampling on and resets all local windows. **Set running count** resumes the first requested number of registered actors and pauses the remainder, releasing social episodes first. These controls explicitly affect every cat in the current view; they do not persist a dashboard edit. Individual Home/Pause controls remain available.

## Twenty-card HA stress view

Open [Cat stress test](http://YOUR_HA_HOST:8123/dashboard-testing/cat-stress-test). The sections layout places two half-width cat cards per section, including on mobile. It contains exactly twenty cat cards, with unique IDs/colours, mood/social/landing pilots and one separate shared performance monitor. Individual actor profiling is off. All twenty start running (`start_paused: false`). Use Reports & performance on any cat to select 1, 2, 5, 10 or 20 running cats, then compare the shared monitor. A fresh page reload restores the saved twenty-running baseline.

All twenty opt into `shared_home_surfaces: true`. Normally home cards are excluded from roaming surface discovery. This flag allows the outer roofs of participating, active cat cards to be measured as shared perches, so a cat-only view can actually exercise travel and social opportunities. Both observer and home must opt in. It does not expose nested furniture, editor previews or disconnected homes. Normal dashboards retain their previous exclusion. Tight header clearance or changing card geometry can still reject a jump; the flag does not bypass physics.

The reproducible view configuration is `prototype/cat-stress-dashboard.json`. It has no sensor/device dependencies. The current twenty default homes enable props, include home mice and posts when space permits, vary bed styles and show name/action labels. For an actor-only comparison, disable props explicitly and record that difference.

Suggested trial order: collect a full one-running window; repeat at two, five, ten and twenty; compare glow off/on and mood/social off/on at the same count; then compare props off/on. Keep the viewport, debug panel state and foreground browser stable between samples. Explicitly distinguish twenty mounted/two running from a page with only two mounted cards. Longer trials should inspect repeated-pair penalties, route failures, spacing, pause/resume, scrolling, navigation and cleanup, not just FPS.

The first short browser trials verify controls, shared roofs, metrics and actor-count changes; they do not establish a device-independent budget or prove crowd interactions are all natural. See PROJECT_STATUS.md for observed sample values and remaining limits.

## Rich interaction pilot

With `interaction_behaviour: true`, Behaviour & mood exposes **Gaze, invitations & shared play** and four stable temperament sliders (boldness, sociability, curiosity, patience). These are client-local debug edits. The decision readout records eligibility, notice evidence, attempted/actual contact, independent recipient replies, predictions, ownership and ending reasons. Both mood and social flags should be enabled for the full pilot. Install the new `pixel-cat-behaviours.js` resource alongside the existing controller/art/extras. See `INTERACTION_SYSTEM.md`.

## Surface capacity and vertical pilot

Eligible supports are retained without a 64-entry cutoff. Discovery/rectangles share a frame cache; routing uses actor-local geometry/config caches and spatial reach candidates. Above 128 supports, destination options populate on focus rather than filling closed menus. Counts describe retained geometry, not guaranteed reachability or an unlimited device budget.

Card outlines & grip areas show measured cyan boundaries, purple actor-fit grip areas, green standing tops, explicit post contacts and rejection reasons. Excluded cat-home cards have dashed cyan boundaries and a permission reason; they are recognised without becoming usable grips or roofs. Both homes still need `shared_home_surfaces` for shared use. Walking supports remain a separate overlay. The overlay is independent of behaviour. Enable experimental native-edge use with `native_vertical_surfaces: true` or the editor option; ordinary homes keep it off. Inference runs only when enabled or inspected. The refinement lab on 8769 compares depth, loaf departures, ear timing, saved lift grip and large catalogues. Forced contact previews and ordinary observation are separate controls.

## Resize/contact refinement lab — 18 October 2026

`http://127.0.0.1:8769/prototype/refinement-lab.html` exposes bed approaches from either side, igloo/simple style, scales 1–6, grounded shallow crossing, native/home-post contacts and local rope recipe controls. Its DOM report shows layout phase/generation/shared scan count, active/capped effects, semantic stroke count and composition cache size. Controlled post tests reset their own previous test cooldown; this is lab-only and not natural-frequency evidence.

For resize tests use actual browser viewport changes and follow settling → reconciliation → running/idle. Reconciliation is one actor per frame. Verify manual Pause separately; it must survive. A short automation capture adds scheduling/render overhead, so use monitor traces from ordinary sessions for performance claims. Keep the moving cat visible and sample continuously; inactive/background long-gap freezing can otherwise make a sequence look stationary. Reusable particles are decorative: hidden/reduced-motion/resize clears them without generating behaviour or contact.

## Inspecting contact particles

On the port-8769 refinement lab, use the contrasting blue test-cat colour and controlled home-post preview. The bounded report shows each live particle recipe, resolved colour/source, current position and foreground depth; `lastEmission` retains the most recent spawn point after it expires. The recipe controls affect this lab only. Disable effects while holding the same pose to distinguish animation pixels from actual particles. Ear-scritch preview uses ordinary sparse emission probability, so a bout may emit no fur. Production probabilities and pool limits are unchanged by the material correction.
