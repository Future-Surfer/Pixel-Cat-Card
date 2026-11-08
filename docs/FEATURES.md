# Feature index

Implemented baseline; updated 23 October 2026. **Read by topic.** [FEATURE_DETAILS](FEATURE_DETAILS.md) holds full rules/config/source references; [ROADMAP](../ROADMAP.md) owns future work. [CURRENT_STATE](CURRENT_STATE.md) gives the deployment handoff. Native cells scale with the actor/prop; CSS pixels differ.

## 1. Companion principles and decision rules

- Independent clocks, moods, optional peaceful interactions, substantial rest and physical misses. After five active visible minutes, new sleep/loaf bouts hold 5–10 minutes while ordinary decisions wait for the timer or a startle. [Settling contract](design/LIFE_STAGES_AND_SETTLING.md#extended-rest-after-settling).
- No visit penalties, guaranteed play/catches or forced reciprocal scripts.
- [Decision contracts](FEATURE_DETAILS.md#1-companion-principles-and-decision-rules).

## 2. Card setup, identity and appearance

- One public picker: companion or actor-free performance monitor. Existing YAML types remain compatible.
- Opt-in [world authority and reversible migration](guides/WORLD_AUTHORITY.md); explicit owners, waiting/conflicts and unchanged legacy scales.
- One-time random names/colours; explicit settings win. Base pixel scale 1–6; half-size kitten and unchanged adult/senior life stages with fixed furniture/toy sizes; one-time random igloo/simple bed defaults; separate home/control visibility.
- Picker defaults enable core behaviours/arrival/props, hide diagnostics. Minimal YAML retains older opt-in behaviour defaults.
- Visible on-card controls include **Startle all** (wake this view) and **Wall jump** (this cat's checked nearest-wall invitation). [Controls and limits](guides/CAT_DEBUG.md).
- [Setup contracts](FEATURE_DETAILS.md#2-card-setup-identity-and-appearance) · [configuration](guides/ROAMING_CONFIGURATION.md).

## 3. World geometry, surfaces and navigation

- Shared discovery/rectangles, cached directed routes and uncapped support retention; bounded destination-point search.
- Short crossing plus walking for distant POIs; safe return routes/fallback. Pass-through horizontal/vertical surfaces.
- Experimental climbing: physically fitting posts offer independent grip decisions, rotation and checked exits. Kittens may use a background/card plane only after ordinary routing fails. Full climbing silhouettes/flights stay inside the scrollable dashboard; stale/out-of-world landings are rejected. Real landings remain required; descent reuses existing poses with varied long slides and checked release above the floor. Faster climbing and visible recovery preserve scroll attachment. Partial hops aim at an actually reachable release band; contact marks use surface colour, actor-scaled centred claws, short catch marks and actual slide trails continued across material boundaries, including slotless HA background/view shadow trees beneath surface children; 960/cat and 3,840/view retention, with oldest-mark path reuse and 64 recyclable material layers. [Climbing contract](design/CLIMBING_WORKSHOP.md).
- [Kitten climbing stress lab](http://127.0.0.1:8769/prototype/kitten-climb-stress-lab.html) records native/replay clocks, grip dwell, landing/recovery outcomes, decal eviction and contact guides; measured refinements (development reference retained privately) cover retention/scale, shared climb time, clearance diagnostics and alternative-support recovery.
- Opt-in [finite-card transfer pilot](design/VERTICAL_SURFACE_TRANSFERS.md): checked wall jumps/climbs to real tops/ledges, cached geometry and visible recovery. Cyan measured card boundaries (dashed with reasons for excluded homes), purple grip areas and green clear tops make discovery inspectable in HA; automatic routes still prefer ordinary travel.
- Card reflow/resize enters shared settling; launch/airborne endpoint checks reject stale geometry without full per-frame search.
- [Geometry contracts](FEATURE_DETAILS.md#3-world-geometry-surfaces-and-navigation).

## 4. Walking, jumping and animation continuity

- Planted-paw walk clocks; casual/stroll/trot/gallop/sneak variants where eligible. Shorter voluntary kitten rest, numeric ordinary-speed preference, quicker steps and shared social-play/startle biases; deliberate sneaks retain their gait; [shared age/tag policy](design/LIFE_STAGES_AND_SETTLING.md#shared-sequence-policy-contract).
- Safe shallow changes usually walk gradually; optional real hops remain. Reviewed bridges/contact rebasing preserve loaf and other handoffs; loaf → alert uses its authored exit without a sitting detour.
- Broader pose-pair/mobile audit remains open; dedicated vertical candidates are not installed.
- [Motion contracts](FEATURE_DETAILS.md#4-walking-jumping-and-animation-continuity).

## 5. Rest, grooming and gentle transitions

- Varied idles, quick complete ear-scritch cycles, modestly reduced selection, gentle independent post-rest recovery.
- Reviewed back-roll on broad supports; authored rest/groom departures and masked igloo exits. Voluntary jump/play effort softly favours quieter choices, with individual recovery.
- Optional post-meal settling; alert lying uses independent head/tail playback, remembered-neighbour interest and physical head withdrawal.
- [Rest contracts](FEATURE_DETAILS.md#5-rest-grooming-and-gentle-transitions).

## 6. Gaze, notice and remembered evidence

- Exact-frame gaze, mirroring, blind/unknown distinctions, bounded notice/memory and observable evidence.
- Blind markers can still supply physical mouth anchors; private intentions are not shared knowledge.
- [Perception contracts](FEATURE_DETAILS.md#6-gaze-notice-and-remembered-evidence).

## 7. Mood and temperament

- Blended playfulness/sleepiness/alertness softly weight choices; summaries are not exclusive modes.
- Independent recency, cooldowns and recovery; current state remains session-local.
- [Mood contracts](FEATURE_DETAILS.md#7-mood-and-temperament).

## 8. Cat-to-cat interaction

- Optional company/pats/stalk-pounces and bounded chase with clearance, reservations and independent responses/quiet exits.
- General third-party group participation remains planned.
- Quiet third-party watching reuses recent observed movement/play; most opportunities can be ignored. Group participation remains planned.
- [Social contracts](FEATURE_DETAILS.md#8-cat-to-cat-interaction).

## 9. Shared props and toy play

- One shared scene/clock; independently moving mouse, ball physics and optional pats/bats/hunts with real contact/misses.
- Enabled visible home seeds a normal mouse near its post, or on its floor when the post cannot fit; explicit Clear stays clear until recreation/re-enable.
- One home mouse/home plus bounded loose props; toys retain spawning scale.
- [Prop contracts](FEATURE_DETAILS.md#9-shared-props-and-toy-play).

## 10. Carrying, possession and food

- One attached toy, physical pickup/release/startle drop, bounded possessiveness and observed following.
- Exact raw gaze/track metadata anchors carrying without social sensing; early loaf/emergence handoffs refresh placement. Clear releases carrying state.
- Actual bowl contact, optional whole-cycle meals and light session-local appetite; no chores.
- [Mouth contracts](FEATURE_DETAILS.md#10-carrying-possession-and-food) · [carrying lab](../prototype/carry-lab.html).

## 11. Startles and interruption

- Contact/nearby visible motion/landing cues can interrupt eligible grounded activity; airborne responses wait for safe contact.
- Directional escape and optional varied recovery; bounded cooldowns/deduplication. General hearing is not implemented.
- [Reaction contracts](FEATURE_DETAILS.md#11-startles-and-interruption).

## 12. Beds, resting visits and scratching

- Own/optional guest beds; igloo sneak entry, mostly walking simple-bed entry with occasional sneaking, shared canvas-aligned aperture for entry/rest/emergence and gentle reclaim contacts.
- Home/loose posts: autonomous optional interest or click invitation, directed faces, grounded stance and real paw strokes.
- Rare own-igloo roof perch/shell scratch with shared lateral wiggle and inside-guest disruption. Tiny roof restricts poses; simple beds/opt-outs excluded.
- Native structural-edge scratching is opt-in; arbitrary vertical faces remain planned.
- [Bed/scratch contracts](FEATURE_DETAILS.md#12-beds-resting-visits-and-scratching).

## 13. Picking up and dragging cats

- Painted-pixel pointer capture, reviewed hanging grip/shadow, fresh supported drop and safe cancellation; preserved identity/manual Pause.
- Pointer Events are implemented; physical touch/keyboard refinement remains open.
- [Handling contracts](FEATURE_DETAILS.md#13-picking-up-and-dragging-cats).

## 14. Diagnostics, performance and lifecycle

- [Grouped session controls](guides/CAT_DEBUG.md), integrated climbing/overlay options, name/action labels with independent glow/extra names, and a shared monitor with millisecond axis and 16.7/33.3 ms reference bands.
- Shared geometry/scene updates, bounded histories/effects and layout settling; twenty-default-card stress fixture.
- One foreground particle pool/canvas: slightly larger post-material rope and sparse actor-colour fur, with unchanged budgets/colour ownership. Other emitters/depth planes remain planned.
- Desktop tests are not Pi/phone FPS proof. [Detailed limits](FEATURE_DETAILS.md#14-diagnostics-performance-and-lifecycle) · performance evidence (development reference retained privately).

## 15. Frame Studio: sequence authoring

- Pixels, timing/roles, gaze/blindness/POI, transforms/ranges/locks/undo and preserved provenance.
- Selection-derived independent track masks/clocks, event/gaze ownership and flat boundaries; reviewed post pilot installed.
- Exact reviewed alert/head/tail snapshots installed; original grids/provenance retained. Unrelated/newer saves remain pending.
- [Sequence contracts](FEATURE_DETAILS.md#15-frame-studio-sequence-authoring).

- Climb lab: shared side/centred/rotation workbench, flexible grip routes, material debris/fading plane scratches, separate behaviour/setup controls and versioned baseline proposals. [Workshop contract](design/CLIMBING_WORKSHOP.md).

## 16. Frame Studio: props, review and integration

- Lab-only [cat-tree workshop](design/CAT_TREE_GENERATOR.md): fifteen draft components, seeded/named-code fit-bounded assembly with exact multi-support joins, shared pixel tools, contact/depth metadata, independent autosave/history and exact exports. Default HA cards retain their existing props.

- Separate prop canvas/catalogue/variants, family/state metadata and notes; dirty placement drafts stay WIP.
- Conditional saves, immutable change snapshots, recovery variants and exact-version receipts; local/browser/hosted stores stay distinct.
- [Prop/review contracts](FEATURE_DETAILS.md#16-frame-studio-props-review-and-integration) · [Studio agent contract](../frame-studio/AGENTS.md).

## 17. Planned concepts that must not be mistaken for live features

- Full resident rosters/persistence, world-scale authority, exertion/life stages, general group participation, broader vertical surfaces and runtime prop palette themes remain planned.
- Purpose-built entrance/vertical/toy-shake art and additional effects require review. No runtime AI generation.
- [Roadmap](../ROADMAP.md) owns priority/dependencies; [boundary detail](FEATURE_DETAILS.md#17-planned-concepts-that-must-not-be-mistaken-for-live-features).
