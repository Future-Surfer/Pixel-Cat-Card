# Pixel Cat detailed feature contracts

Audited **18 October 2026** against current source, exact-asset integration records and guides. This is the grouped reference for **what exists and the rules it follows**, not a second task list. [ROADMAP](ROADMAP.md) remains the only forward plan; project checkpoints (development reference retained privately) record validation and deployment evidence.

Scope: the current roaming Pixel Cat card, shared monitor, labs and Frame Studio. The separately usable original in-card world has its own [configuration and feature reference](guides/PIXEL_PET_CARD.md).

Exact local hanging and 13-frame post-scratch refinements are also selected; [source versions and receipts](../frame-studio/user-sequences/refinement-batch-2026-10-17/README.md) retain mixed provenance and defer the independent bat variant.

Artwork checkpoint: home and loose scratching posts use the user's exact saved revision-3 cap refinement, [version and integration evidence](../frame-studio/user-sequences/pending-2026-10-17/README.md). Four removed pixels narrow the cap to the rope width; mixed origin, palette metadata, dimensions and scratch geometry are retained.

**Implemented** means present in the current build, including experimental pilots. It does not mean enabled in every saved card, every Studio asset is installed, or every outcome has been observed on a phone. Numbers below are current tuning, not permanent configuration contracts. Native pixels/cells scale with the actor or prop; they are not screen CSS pixels.

## Contents

1. [Companion principles and decision rules](#1-companion-principles-and-decision-rules)
2. [Card setup, identity and appearance](#2-card-setup-identity-and-appearance)
3. [World geometry, surfaces and navigation](#3-world-geometry-surfaces-and-navigation)
4. [Walking, jumping and animation continuity](#4-walking-jumping-and-animation-continuity)
5. [Rest, grooming and gentle transitions](#5-rest-grooming-and-gentle-transitions)
6. [Gaze, notice and remembered evidence](#6-gaze-notice-and-remembered-evidence)
7. [Mood and temperament](#7-mood-and-temperament)
8. [Cat-to-cat interaction](#8-cat-to-cat-interaction)
9. [Shared props and toy play](#9-shared-props-and-toy-play)
10. [Carrying, possession and food](#10-carrying-possession-and-food)
11. [Startles and interruption](#11-startles-and-interruption)
12. [Beds, resting visits and scratching](#12-beds-resting-visits-and-scratching)
13. [Picking up and dragging cats](#13-picking-up-and-dragging-cats)
14. [Diagnostics, performance and lifecycle](#14-diagnostics-performance-and-lifecycle)
15. [Frame Studio: sequence authoring](#15-frame-studio-sequence-authoring)
16. [Frame Studio: props, review and integration](#16-frame-studio-props-review-and-integration)
17. [Planned concepts that must not be mistaken for live features](#17-planned-concepts-that-must-not-be-mistaken-for-live-features)

## 1. Companion principles and decision rules

| Feature | Implemented rule / nuance | Boundary |
| --- | --- | --- |
| Autonomous companion | Cats explore, rest and choose activities without user care. | Full needs simulation is not implemented; missed visits incur no penalties. |
| Optional outcomes | Ignore, continue, watch, abandon, miss and disengage are valid outcomes. | An invitation or preview of an opportunity does not guarantee a response or contact. |
| Weighted decisions | Mood, temperament, observed opportunities and recent history influence alternatives. | No mandatory animation graph or universal fixed script. |
| Evidence before action | Sight, noticed evidence, short memory, intent and physical contact are distinct. | Geometry registries provide safety information, not secret sensory knowledge. |
| Physical execution | Routes, supports, clearance, ownership and contact gates constrain chosen actions. | Desire to act does not permit teleporting, taking a claimed toy or guaranteeing a hit. |
| Independent actors | Cats keep their own choices, clocks, mood and episode participation. | Shared events never directly command every cat to react. |
| Dashboard respect | Foreground scenery leaves underlying dashboard content unchanged. | Cats do not activate HA services or edit entities, text or YAML through play. |

Sources: [awareness contract](guides/AWARENESS_AND_REACTIONS.md), [interaction contract](guides/INTERACTION_SYSTEM.md).

## 2. Card setup, identity and appearance

| Feature | Implemented rule / nuance | Control / limitation |
| --- | --- | --- |
| Unified picker | One public Pixel Cat entry offers companion or performance-monitor purpose. | Existing legacy/development YAML types remain usable; their runtimes are not all merged. |
| Guided editor | Name, cat colour, bed style/colours, visibility and behaviour options; advanced settings remain available. | Actor-free editor previews; HA Save persists configuration. Runtime buttons do not write dashboard YAML. |
| New-card defaults | Picker-created cats enable the seven core behaviour/toy switches and bed arrival; bed style is chosen once between igloo/simple. Controls and labels are hidden. | Minimal manual YAML preserves older opt-in defaults; existing explicit settings are retained. |
| One-time names | New companion cards choose from 200 unique names into saved `config.name`; active-view duplicates are avoided when possible. | Existing/blank names and later edits are preserved; names are not actor identity. |
| Multiple cats | Each home card owns one independent resident; explicit or automatic actor identities handle duplicates. | Persistent multi-resident rosters and a Spawn button are planned, not a `cat_count` API. |
| Primary home | First new companion defaults primary; later ones default non-primary. Legacy homes have an automatic fallback. | Edit-mode-only flag; duplicate explicit primaries show conflict. It does not currently control world scale. |
| Explicit world authority | Saved `world_id`/`world_owner` with one owner’s version-1 legacy settings; followers wait, conflicts are visible, existing actors retain last-valid settings. | Opt-in; separate from `primary_home`. No roster or physical scale migration. [Guide](guides/WORLD_AUTHORITY.md). |
| Reversible linkage migration | Exact per-card before/after/path preview and rollback, stable ID/name/colour materialisation, stale-baseline rejection. | Local lab/export and normal explicit HA save; preserves advanced fields and legacy sizes. No automatic dashboard write. |
| Colour and pixel scale | Cat colour and integer `cell_size` 1–6; cat, home and spawned props use native pixel units. | Scale is per card. Shared toys retain their spawning size, so cards at different scales can coexist. |
| One-time colour choice | A missing colour selects from twelve curated cat colours; picker defaults persist the choice alongside the random name. | Explicit colours win; config echoes retain the mounted resident's choice. Manual YAML without a saved colour can choose again on a fresh mount. |
| Bed palette | Igloo/simple styles have primary and secondary channels with derived darker tones. | Authored palette is preserved; legacy `igloo_color` remains a primary fallback. General prop themes are not live yet. |
| Home versus controls | Bed/home visibility and on-card controls are independent. | `show_home`, `show_controls`; control toggle is under Advanced settings. HA may retain layout gaps. |
| Hidden resident | Starts on a suitable visible foreign surface and uses it as its return anchor. | With no suitable surface it waits invisibly and retries; hidden docks are not phantom supports. |
| First arrival | Visible igloo residents sneak out low, rise and stand, once per mounted resident. | `arrival: igloo`; simple/hidden beds skip this. Unsafe/narrow exits use normal placement. Full authored bed entry remains future work. |
| Earlier in-card world | Original pixel-pet card remains separately usable with furniture/robot/box interactions. | Its full prop catalogue and mechanics are not automatically roaming behaviours. |

Sources: [installation/configuration](../README.md), [editor](../prototype/cat-home-editor.js), [primary homes](../prototype/cat-primary-home.js), [setup](../prototype/cat-setup.js), [hidden homes](../prototype/cat-hidden-home.js).

Life-stage V1: `life_stage` is `kitten`, `adult` (default/unknown fallback) or `senior`. Kitten actor cells are half the home's `cell_size`; furniture, bed apertures and loose/carried toys retain their physical scale. Adult/senior size and behaviour are unchanged. Fractional kitten cells use the existing crisp SVG renderer; no artwork rewrite or new activity loop. Kittens now have bounded quicker cadence, numeric ordinary-speed preference, shorter voluntary rest and semantic social-play/startle biases; adult/senior behaviour remains neutral. [Policy contract](design/LIFE_STAGES_AND_SETTLING.md#shared-sequence-policy-contract).

## 3. World geometry, surfaces and navigation

| Feature | Implemented rule / nuance | Control / limitation |
| --- | --- | --- |
| Measured supports | Card tops, inset bottom-border candidates and eligible interior/layout surfaces can support cats. | Decorative inferred shelves, not a semantic understanding of every HA card. Candidates can be rejected. |
| Interior candidates | Tried by default; foreground content is not automatically a solid obstruction. | `use_surface_candidates: false` opts out. Support, width, clearance and return-route checks still apply. |
| Shared home roofs | Participating home cards can expose outer roofs to other cats. | `shared_home_surfaces` must be enabled on both observer and home; previews/disconnected homes are excluded. |
| Rare igloo perch | Own igloo has a seven-cell authored roof span, restricted to compatible perch frames with fitted rear paws. Outbound and return routes and existing occupants are checked. | Independent optional choice; simple beds excluded. `igloo_interactions: false` opts out; ordinary random destination selection excludes this tiny roof. |
| Changed geometry | Card size changes join shared layout settling; jump launch compares current endpoint geometry and airborne travel checks the two endpoints at most every 200 ms. | Uniform scrolling is allowed. No full route search per airborne frame; stale jumps recover through the existing coordinator. |
| Small perches | Supports need not span an entire card; narrow perches have dedicated eligibility restrictions. | Not every gait, toy action or drop can use a narrow support. |
| Varied destinations | Edge-biased rest positions, stable varied points, inspection points and dynamic prop POIs. | Not restricted to left/centre/right; recent visits reduce attraction. |
| Local leisure / residence | Choose stay, local walk or leave before sampling a remote surface. New arrivals softly prefer local activity for a fading 14–24-second window. | No mandatory dwell. Local points do not reset residence; near-coincident aliases/scroll preserve it. `local_exploration: false` is a comparison opt-out; chosen social/toy activities and commands retain priority. |
| Content inspection | Measured nearby icons/headings can supply look-up inspection points. | Decorative attention, not guessed device meaning or entity control. |
| Click interest | Clicking dashboard content can select a nearby reachable POI/support for the cat. | Normal dashboard controls remain usable; reachability still governs travel. |
| Home routing | Return uses discovered routes and walking/jumping segments. | Safety recovery after removed/invalid geometry is distinct from normal return travel. |
| Surface capacity/cache | Complete eligible catalogue; shared frame discovery/rectangles, spatial directed-edge queries, cached origin trees and heap search. | No 64-support cutoff. Large destination menus populate on focus; device/layout cost still limits practical capacity. |
| Support depth | Lower support baseline renders closer for cats, loose props and home posts; flight depth interpolates between supports. | Stable ties; carried props follow the carrier, held cats stay above the scene. Unsupported containing blocks retain fallback limitations. |
| Position-aware routes | Actual destination POIs, bounded neighbouring-entry takeoffs and combined walking/jump costs favour shorter safe leaps. The route-speed lower bound and modest horizontal-flight cost retain existing work caps; goal-only small walking corrections avoid unnecessary hops. Chosen endpoints are physically rechecked at execution. | Up to 128 expanded states, 96 physical checks, 16 neighbours and seven candidate points per visited support. Cache includes geometry, scale, facing and config. Beds/narrow supports and exhausted searches retain legacy routing; `point_routes: false` compares it. No global optimality promise. |
| Scroll/reflow | Independent layer anchors let native scrolling carry deferred cats with content. Shared moving props use their geometry owner's anchor, even when another cat updated first. Uniform translations reuse source-node geometry and preserve approved startles/flight clocks; prop wiggle composes with anchoring. | One shared portal read per view/frame; matching a prop to its geometry source adds no layout reads. Sticky/nested/non-uniform changes require broader measurement; physical mobile inertia remains unverified. |

Sources: [controller](../prototype/roaming-controller.js), [home surfaces](../prototype/cat-home-surfaces.js), [surface diagnostics](../prototype/cat-surface-debug.js), [geometry notes](../prototype/DEFAULT_CARDS_AND_PHYSICS.md).

## 4. Walking, jumping and animation continuity

| Feature | Implemented rule / nuance | Control / limitation |
| --- | --- | --- |
| Planted-paw travel | Displacement and animation share a native-cell contact clock; pace changes affect both. | Increasing lateral speed alone is not the locomotion model. |
| Pace choices | Casual meander, relaxed stroll, interested and prompted motion have separate rates/profiles. | Defaults 6/9/24/32 cell-clock beats per second, with acceleration/braking; not constant rendered FPS. |
| Head variation | Original bob, fixed high/low, full-cycle, half-time and natural variation use existing authored frames. | Head selection is decoupled from gait contact; faster movement need not bob every step. |
| Faster trot | Reviewed front/back phase-offset cycle supplies quicker locomotion. | Synced fast walk remains an asset for later integration, not a normal per-bout alternative today. |
| Sneaking | High/mid/low-head variants and slowing segments support stalking. | Short-range approach is clamped at the stopping gap; compatible consecutive bouts preserve phase. Broader pose audits remain. |
| Gallop | Improved eight-frame gallop uses stance/flight-aware travel, normally 25 FPS. | Occasional chase segments need one full 18-cell stride; ordinary prompted travel needs two (36 cells), after departure alignment. Broad supports, independent chance and `gallop: false` remain gates. Kittens compare eligible ordinary clips by natural speed; deliberate sneaks bypass this chooser. Full strides, distance/safety gates and opt-outs remain. |
| Gallop remainder | Whole strides finish with ordinary walking for the remaining distance. | Does not compress planted beats or overshoot a destination to complete a stride. |
| Ballistic jumps | Up/across/down art follows one physically planned trajectory with a real target height. | Committed flights do not home on moving targets. |
| Shallow sideways leaps | Across poses allow rises up to 12 native cells and drops up to 16 (including the 14-cell igloo roof), when lateral distance is at least twice the rise/drop. | Steeper/larger changes retain up/down presentation. |
| Downward hesitation | Mostly vertical drops can hold the second preparation frame briefly. | About 45% chance for qualifying drops, 250–600 ms; actual flight is unchanged. |
| Upward horizontal pose | Most up jumps can switch to horizontal flight artwork around the apex. | About 75% selection; `horizontal_apex: false` opts out. This changes art, not trajectory. |
| Long-drop freefall | Existing freefall poses can appear during longer descents. | Dedicated straight-up/down Studio drafts are not automatically installed. |
| Pose bearings | Sequence/bridge entry and exit rebase contact anchors, including seated look-down and loaf transitions. | Some silhouettes still need authored transition polish; not all snapping is solved. |
| Loaf departure | Reverse reviewed sit-to-loaf and walk-to-sit frames before ordinary walking, with planted per-frame bearings. | Cancellable; requested endpoint/route remains. Pickup, safe startles and explicit overrides retain priority. |
| Idle-to-walk bearing | Convert the actual displayed front bearing from rear/custom-anchored poses before starting the walk. | Covers look-down/bat and other reviewed idles without changing pixels; legacy states without displayed rows retain their fallback. |

Sources: [controller clocks](../prototype/roaming-controller.js), [motion options](../prototype/cat-motion-options.js), [apex/wiggle options](../prototype/cat-behaviour-refinements.js).

Grounded shallow transitions are eligible for safe overlapping/adjacent supports within four native cells of height and two of gap, with enough lateral travel. Ordinary choices favour walking (88%); explicit destinations walk when eligible and occasional hops remain. Consecutive compatible stalking bouts retain gait/head phase; travel allowance is clamped at the stopping gap rather than reversing toward a nearby target. Ear-scratch base selection weight is now 0.85, retaining the 75 ms cycle and recency/mood variation.

## 5. Rest, grooming and gentle transitions

| Feature | Implemented rule / nuance | Control / limitation |
| --- | --- | --- |
| Idle repertoire | Standing/sitting variants, look up/down, loaf, alert lying, curl/sleep, grooming, sniffing, ear scratch, stretch and seated voice poses. | Actual selection depends on supports/context, availability and weights. Alert lying is also eligible on simple-bed supports; loaf → alert uses the authored loaf exit directly. A Studio sequence is not automatically a runtime idle. |
| Alert lying | Exact saved base plus independently timed derived head/tail masks; calm tail holds, more activity with alertness, remembered moving neighbours can favour selection. Physical nearby pats can withdraw the head. | Authored holds/gaze/provenance and planted paws retained; authored remaining exit holds (150/250 ms at default rate), direct return to loaf, seated/standing bridges and gait-specific planted movement bearing. Completed exits are not replayed. Tiny perches exclude this pose. No extra peer search or guaranteed social response. |
| Recent-pose variety | Last three idle choices are discounted by recency. | Weights 0.05 / 0.35 / 0.65 versus 1 for fresh options; repetition remains possible. |
| Look-down context | Suitable elevated/edge geometry enables looking down; authored rear bearing stays aligned. | Not a universally eligible idle on every support. |
| Quieter loaf | Low-head loaf is held much longer than the raised-head frame. | Avoids constant head bob; entry/exit and other animations keep their own timing. |
| Longer rest | Baseline loaf/sleep bouts can last roughly 15–25 / 25–45 seconds; kitten rest-tagged bouts shorten within complete authored-cycle limits, softened by sleepiness/exertion. | Commands and chosen safe startles can interrupt; special episodes may use different horizons. |
| Repeated ear scratch | Uses 3–7 complete cycles at 75 ms per cycle frame, entry/exit once; about 2.385–3.885 seconds at default rate. | Source pixels and post-scratch holds retained; physical interruptions remain eligible. |
| Alertness and sleep | High alertness strongly suppresses sleep selection, more gently suppressing loaf/yawn. | Still weighted, not an absolute prohibition or automatic mood relabel. |
| Post-rest grogginess | Sustained sleep/loaf leaves a brief fading preference for gentle idles and casual first travel. | Duration/strength vary independently. No compulsory yawn/stretch chain or synchronised wake-up script. |
| Activity & settling | Early editor choice: Always active, default 5–10-minute settled rests after 5 active visible minutes, extended 15–30-minute rests, or custom eligibility/minimum/maximum minutes. | Always active disables prolonged holds while retaining ordinary brief rests. Commands/startles and lifecycle safety remain authoritative. [Settings contract](design/LIFE_STAGES_AND_SETTLING.md#extended-rest-after-settling). |
| Post-meal settling | Actual meal contact starts a 6–12-second grooming/settling preference with reduced rushing/play. | `post_meal_behaviour`; commands/startles still win. This is not exertion/fatigue. |
| Playful back-roll | Exact 14-frame saved sequence, including authored holds, gaze, anchors and mixed provenance; broad ordinary supports, with optional loaf/alert entry. | Low selection weight; excludes tiny roofs/igloo interiors. Authored exits preserve a virtual front bearing before walking. |
| Gentle exertion | Completed voluntary jumps/play accumulate bounded session-local effort; independent thresholds and 30–70-second active-time recovery softly favour rest/gentle travel. | `exertion_behaviour: false` disables it. Commands/reflexes keep priority; inactive time is excluded. No forced rest or care obligations. |
| Voice reuse | Seated mouth frames support held yawn or repeated meow/chatter recipes. | Walking/loafing meow artwork remains planned. |
| Rare imaginary play | Unprompted sneak/pounce episodes remain possible but deliberately infrequent. | Long 60–120-second opportunity spacing plus mood probability; observed stimuli use separate rules. |

Simple-bed settling usually uses a casual walk, with 12% optional sneaking when authored clips are available; igloo entry retains sneaking. Approach endpoints account for the final planted walking frame. Six-scale/two-sided checks allow a residual correction of one cell plus at most one CSS pixel from different grid origins.

Sources: [idle selection/playback](../prototype/roaming-controller.js), [post-rest/meal bias](../prototype/cat-post-rest.js), [rest contract](guides/INTERACTION_SYSTEM.md).

## 6. Gaze, notice and remembered evidence

| Feature | Implemented rule / nuance | Boundary |
| --- | --- | --- |
| Exact-frame vision | Raw gaze origin, direction, field width and visibility state follow the displayed pose, facing and scale. | Per-frame metadata is deliberately retained until profiling justifies optimisation. |
| Blind versus unknown | Explicit `canSee: false` blocks new visual discovery; missing/conflicting data is unknown. | Blindness does not erase physical contact sensing or the usefulness of a mouth anchor. |
| All-around field | A 360-degree field supports camera-facing poses. | Range remains finite; it is not dashboard-wide omniscience. |
| Notice dwell | Visible movement needs a short notice interval before becoming actionable evidence. | Sudden prop motion uses roughly 120 ms notice; merely intersecting a cone need not trigger action. |
| Short memory | Last-seen snapshots retain uncertain position/pose information briefly after looking away. | Unseen targets are not refreshed from live registry positions. |
| Distinct physical evidence | Real contact and nearby impacts can be noticed without sight. | Does not constitute a general hearing/noise model. |
| Prop movement onset | Movement after at least 900 active ms stationary can publish a short-lived visual event. | Spawn, layout changes and jitter establish silent baselines. |
| Safe prediction | Observed ball motion can support a bounded interception prediction before launch. | No live airborne tracking or guaranteed interception. |

Sources: [gaze perception](../prototype/gaze-perception.js), [decisions](../prototype/cat-decisions.js), [awareness reference](guides/AWARENESS_AND_REACTIONS.md).

## 7. Mood and temperament

| Feature | Implemented rule / nuance | Boundary |
| --- | --- | --- |
| Blended mood | Playfulness, sleepiness and alertness coexist and weight exploration, rest and interactions. | Labels such as balanced/playful/alert are summaries, not exclusive behaviour modes. |
| Natural variation | Independent seeded baselines and slow rhythms vary cats; events/rest also shift values. | Session-local animation weights, not biological state or persistent health. |
| Rest/event influence | Rest reduces sleepiness/restores interest; noticed neighbours and play can influence alertness/curiosity. | Event influence is bounded; no automatic colony-wide excitement broadcast. |
| Stable temperament | Boldness, sociability, curiosity and patience influence choices and horizons. | Derived from identity unless explicitly supplied; separate from drifting mood. |
| Mood debug | Inspect values, hold/drift/reset and temporarily edit temperament. | Debug changes are client-local, not saved HA configuration or shared personality. |
| Priority/safety | Mood changes probability but cannot override blindness, claims, safe routes or contact. | Post-rest/meal/exertion are transient biases; broader life-stage activity profiles remain planned. |

Sources: [mood](../prototype/cat-mood.js), [decisions](../prototype/cat-decisions.js), [interactions](../prototype/cat-interactions.js).

## 8. Cat-to-cat interaction

| Feature | Implemented rule / nuance | Boundary |
| --- | --- | --- |
| Quiet company | Recently observed idle cats can make nearby resting/exploration attractive. | Arrival, resting and non-participation remain independent; not persistent friendship. |
| Passing acknowledgement | Briefly look toward an observed nearby cat without stopping the recipient. | Separate personal greeting cooldown from pair play cooldown. |
| Ordinary encounter opportunities | Periodic checks while idle or at safe walk boundaries; a normal walk may end at a planted cell after noticing company. | Does not truncate jumps, gallop, sneak, commands or previews arbitrarily. |
| Gentle social pat | Relaxed approach aligns an authored paw with observed recipient pixels. | Real contact frame determines hit/miss; recipient need not sit or cooperate. |
| Stalk and ambush | Observed companions, including sleepers, can invite a sneak and pounce. Apparent unawareness increases opportunity weight. | Uses observed gaze, not private target thoughts. Losing interest or being apparently noticed can end it. |
| Optional butt wiggle | Reviewed two-frame wiggle often precedes toy, social and imaginary pounces. | Roughly 72% when eligible; not mandatory on every launch. |
| Near-level cross-surface ambush | Fresh observed cats/toys on distinct supports can be stalked/pounced toward at equal height, up to 4 native cells higher or 8 lower. | Physical reach, clear launch/landing/return geometry and independent probability remain required. Same-support play has its existing paths; no general cross-surface chase or airborne homing. |
| Chase invitations | Independent ignore/watch/run choices can start bounded play. | Same-surface compatibility and availability constrain physical encounters. |
| Chase endings | Disengage, catch attempt, observed-prop distraction or at most one role reversal. | About ten-second shared ceiling; reversal needs noticed chaser. No compulsory catch or endless retaliation. |
| Landing evidence | Close real pounce/catch landings can produce local disturbances. | Intent alone is not contact; distant landings miss; response is independently sampled. |
| Spatial ownership | Reserve approach/landing corridors and active episode roles; revalidate recipients and release on cancellation. | Reservations do not freeze an unaware recipient; leaving/busy targets can end attempts. |
| Cooldowns | Bounded pair history, greeting timers, recipient reactions and episode horizons limit repeated encounters. | Suppression and misses are valid, not broken animations. General crowd navigation remains future work. |

Sources: [social decisions](../prototype/cat-decisions.js), [interaction layer](../prototype/cat-interactions.js), [local cross-surface opportunities](../prototype/cat-shelf-ambush.js).

## 9. Shared props and toy play

| Feature | Implemented rule / nuance | Boundary |
| --- | --- | --- |
| Shared scene | Participating cats in a view share temporary surface-relative props and exclusive claims. | Not persistent HA entities; runtime selection is smaller than the Studio catalogue. |
| Spawn locations | Varied continuous surface positions favour usable/reachable supports rather than fixed three-slot placement. | Width, valid return routes and occupancy constrain spawning. |
| Independent mouse | Moves, pauses and sometimes turns on its own clock; tail stays behind travel direction. | Roughly 0.9–3.3 s travel / 1.8–6 s pauses. A reservation never stops its schedule. |
| Mouse stalking windows | Cat waits for a naturally paused mouse facing away, then sneaks; closed opportunities cause safe-boundary waiting. | Launch targets the observed position; the mouse may move during flight and escape. |
| Seated reactive bat | A passing mouse within paw reach can invite inspect/bat from an existing seated pose. | Excludes busy/non-seated/unsuitable supports; real contact can miss. Does not shove or freeze the mouse. |
| Variable strokes | One/two gentle pats, firm bat, or pats then bat with varied pauses. | Subsequent strokes need retained claim, support and reach; target is never moved back to make the action work. |
| Ball impulses | Authored contact frame gives the ball one impulse; gentle pats use 14% of firm strength. | Merely starting the clip does not move the ball. |
| Ball physics | Friction, quarter-turn sprite rotation and safe lower-surface falls; unsafe edges can rebound. | Falling/rolling balls are not ordinary stationary hunt targets. |
| Shared interception | Another cat may notice a rolling ball and claim a predicted same-support interception. | Prediction refines once before commitment; space, ownership and actual paw contact still determine success. |
| Handoff | Finished strokes can release the toy during settle/groom for another cat. | Quiet handoff and personal cooldowns; one actor finishing must not cancel another's claim. |
| Scene clocks | Shared scene advances once per timestamp; pause/hidden states stop relevant motion. Diagnostic controls refresh at most every 250 ms, separately from animation/contact clocks. | Adding cats does not multiply mouse speed. Removing the last actor cleans up the overlay. |
| Home mouse | Each enabled visible home seeds a normal shared mouse beside its post, or on its floor when the post is unavailable. It then uses ordinary motion, claims, carrying and reactions. | `home_mouse: false` opts out; requires dashboard props and a visible enabled home. One mouse per home plus the existing loose-prop budget; explicit Clear stays cleared until scene re-enable/recreation. |

Sources: [prop guide](guides/DASHBOARD_PROPS.md), [controller interactions](../prototype/roaming-controller.js), [rich interactions](../prototype/cat-interactions.js).

## 10. Carrying, possession and food

| Feature | Implemented rule / nuance | Control / limitation |
| --- | --- | --- |
| Carryable assets | Small shipped balls and mice allow mouth pickup; per-asset opt-out is respected. | Studio `mouthCarryable` requires reviewed integration, not live fetching of edits. |
| Nibble pickup | Approach and eating animation can acquire an available toy at actual mouth contact. | Failed contact, removed targets and claims cancel safely. |
| Pounce pickup | A successful physical toy pounce can optionally attach the toy. | About 45% carry choice; missed pounces cannot acquire it. |
| Mouth estimate | Prefers exact sequence/frame gaze and composed-track ownership, with pixel-hash verification, then existing sensing/row metadata and silhouette fallback. Works when social sensing is disabled. | Closed-eye origins still anchor carrying; entry/exit and loaf/emergence paths refresh placement. Dedicated mouth markers remain a possible refinement. Clear props releases carrying state; the 37-clip carrying lab exposes remaining visual review marks. |
| Carry continuity | One exclusive attached prop follows walking, jumping and ordinary poses. | Mouse motion suspends only while physically carried, then resumes after release. |
| Voluntary drop | After a variable carry period, look-down can release onto/fall toward a valid support. Falls follow source-matched scroll geometry without resetting progress; manual Pause freezes progress and removed landing supports clean up the toy. | Optional follow-up pat/bat or walk away; same-cat immediate pickup discouraged. |
| Temporary possessiveness | Successful pickup remembers that toy for 45–75 active seconds, increasing optional reclaim/follow/play interest. | No ownership right, persistent relationship, hidden tracking or guaranteed theft chain. |
| Interesting carrier | Recently noticed carried toys can attract another cat to follow the last observed location. | Observation, mood, spacing, routes and cooldowns apply; no compulsory pursuit. |
| Startled carrier | Valid chosen startle drops the toy before hopping. | Unsafe/failed startle does not drop it; other cats may notice and compete for the released prop. |
| Bowl invitation | Clicking/keyboard-activating a visible bowl offers a meal to eligible reachable cats. | Cats may ignore or finish movement first; offers expire. Hidden bowls provide no target. |
| Autonomous eating | Cats can occasionally eat without a click, including at known visiting bowl floors. | `bowl_eating`; actual mouth-to-bowl contact records the meal, normally 3–5 cycles. |
| Appetite | Recently fed cats decline; at least 90 active seconds before reconsideration, then gradual interest recovery. | Session-local light care, no starvation/absence penalty or saved food stock. |

Sources: [mouth actions](../prototype/cat-mouth.js), [carry/interest](../prototype/cat-mouth-carry.js), [meal recovery](../prototype/cat-post-rest.js), implementation evidence (development reference retained privately).

## 11. Startles and interruption

| Feature | Implemented rule / nuance | Boundary |
| --- | --- | --- |
| High landing cue | A real downward jump of at least 16 source cells can disturb nearby cats, including from behind. | Range up to 28 cells and support-height difference up to 12 at larger scale; proximity/impact, not gaze. |
| Moving-prop brush | Swept opaque contact with grounded displayed cat can cause a reaction. | Same measured support; spawn/reflow/continuous overlap and own claimed toy are filtered. |
| Sudden visible motion | A noticed nearby movement onset can cause surprise; farther movement invites attention/play. | Requires visual evidence/dwell; blind/unknown frames cannot newly see it. |
| Social cues | Actual pat contact or close play landing may yield ignore/watch/hop. | Gentle pats strongly favour calm responses; no guaranteed startle. |
| Directional hop | Preserves facing while translating away from the disturbance. | Front stimulus can produce backward hop; rear stimulus forward hop. Safe width/headroom/corridor required. |
| Immediate grounded response | A chosen safe hop interrupts walking, resting, grooming, scratching, previews and committed grounded activity. | Claims/commands/episodes clear after a safe escape exists; pause/unavailability/cooldowns still guard. |
| Airborne exception | Genuine flight continues, then a queued chosen reaction can execute at contact. | Bounded expiry and cancellation; no midair teleport or arbitrary retarget. |
| Recovery variety | Settle, short retreat or bounded counter-pounce toward remembered stimulus location. | `startle_followups`; no homing on an unseen moving source. |
| No startle feedback loop | Recovery hops/counter-play do not endlessly republish reciprocal play-landing surprises. | Event identity and shared recipient cooldown suppress repeated rolls. |
| Forced previews | Debug startle previews intentionally bypass sensing/cooldown and may reposition for inspection. | Must not be counted as evidence that normal perception or natural startle frequency works. |

Source: [complete trigger inventory and interruption contract](guides/AWARENESS_AND_REACTIONS.md), [reaction code](../prototype/cat-reactions.js).

## 12. Beds, resting visits and scratching

| Feature | Implemented rule / nuance | Boundary |
| --- | --- | --- |
| Simple-bed support | Small explicit bed surface raises sitting/resting by three native cells; lining remains visible. Rest silhouettes centre on the measured bed and retain a corrected logical bearing across frames/pose changes. | Stepping to/from nearby floor uses walking height increments rather than a full leap. |
| Igloo resting | Loaf/sleep inside doorway uses one-cell lift and exact entrance masking behind shell. | Ordinary loaf/sleep entry now approaches through reviewed sneak frames with a moving outside/doorway mask; moving clears the rest mask. Dedicated new entry/emergence artwork remains future polish. |
| Bed entry continuity | Route to the measured resting bearing before centring/masking; simple-bed height changes follow native stride displacement. | Automatic floor-to-lining adoption near the bed centre is disabled for managed actors, removing the right-edge promotion hop. Final centring is at most one native cell in the six-scale regression. |
| Independent post motion | Contact driver retains exact arms/rear bearings; a 49-cell tail mask uses independently seeded phase and 0.8–1.2 playback rates. | Exact source frames and mixed origins are retained; enter/exit remain flat. |
| Scratch decoration | Two authored downstroke events drive damped lateral post translation (amplitude 0.28 post cells) and optional rope fibres. | Logical faces stay fixed; native edges emit neither wiggle nor fibres. Reset on interruption/resize; reduced motion and `effects: false` disable both, with `post_wiggle: false` / `particles: false` independent switches. |
| Rare igloo scratch | Uses the shared directed scratch-face/stance/contact system and prop wiggle. Actual first paw contact disturbs a resting occupant; other outside cats still block unsafe stances. | Sparse own-home choice (20–32 active-second checks, 3.5% gate, then perch/scratch choice; successful choices cool down 180–300 active seconds). No rope fibres from the shell; manual Pause, sleeping/held actor eligibility and independent alternatives remain. |
| Own-bed return | Sleepiness can make a safe route to the cat's bed attractive. | Infrequent weighted choice; not every rest must occur at home. |
| Guest-bed naps | Occasionally borrow another visible empty reachable bed. | Social option, occupancy/booking checks and valid return route; no forced guest slot. |
| Owner response | Owner who notices a resting guest may tolerate them or approach for a gentle pat. | Actual reachable paw contact needed; guest independently stays or yields. No automatic eviction. |
| Default home scratch post | Visible stock homes include a stationary rope post beside the bed/bowl. It shares the refined 13-frame action, observed opportunities, two directed faces and exclusive claims with loose posts. | Independent of `dashboard_props`; `show_scratching_post: false` hides it (legacy `scratching_posts: false` also respected). Requires 59 native cells of home width; narrower homes omit it rather than overlap furniture. Explicit diagnostic Spawn post remains available. |
| Scratch approach/contact | Independent checks every 8–15 active seconds, 22% optional interest, 1.8-second noticed memory; clear routes, exclusive claim, planted rear bearings and authored forepaw contact. | Sleep/busy guards, 60–120-second post and 45-second personal cooldowns remain; no guaranteed activity or unseen-target knowledge. |
| Native vertical pilot | Opt-in `native_vertical_surfaces` pairs structural card borders with supported stances and the same scratch episode. | Default off; faces are pass-through affordances, not added solid walls. Short/floating/unsafe stances rejected; arbitrary interior edges and decals remain future work. |
| Click a scratching post | Clicking a home or loose post invites the closest available, willing nearby cat to use a safe authored scratch face. Enter/Space also activate the post. | Requires social and interaction behaviour. Cats may decline; sleepers and busy cats are left alone. Range is 96 native cat cells, repeated offers wait four seconds, and post cooldown/claims/routes still apply. No forced movement, queued interruption or guaranteed response. |

Sources: [home supports](../prototype/cat-home-surfaces.js), [bed visits](../prototype/cat-bed-visits.js), [vertical post affordances](../prototype/cat-vertical-scratch.js), [approved snapshots](../frame-studio/user-sequences/review-2026-10-17/).

## 13. Picking up and dragging cats

| Feature | Implemented rule / nuance | Boundary |
| --- | --- | --- |
| Mouse/touch pickup | Painted sprite pixels capture one pointer; approved refined scruff pose hangs with soft shadow. | `draggable: false` restores pointer transparency. Transparent cells/labels do not steal input. |
| Direction while held | Horizontal drag direction changes facing with a small jitter deadband and retains it after release. | Reviewed hanging pose uses POI (11,3) at cell centre, mirrored with facing; missing POIs retain fallback grip. |
| Held isolation | Release carried toy first, end social/play ownership and temporarily exclude held/releasing actor from ordinary encounters. | Other cats continue independently; original pause state retained. |
| Drop target | Dashed marker chooses a clear known support below; release remeasures and falls with existing landing/freefall art. | Narrow/occupied/invalid supports are rejected; real high drops can publish landing cues. |
| Cancellation | Escape, lost/cancelled pointer, blur/hidden/edit/navigation and removed supports clean up safely. | Fall back to supported placement; physical-device touch/scroll validation remains open. |

Source: [drag implementation](../prototype/cat-drag.js).

## 14. Diagnostics, performance and lifecycle

| Feature | Implemented rule / nuance | Boundary |
| --- | --- | --- |
| Grouped diagnostics | Six task-based accordion sections, one visible action per location, integrated native-climb controls and a sticky panel title. [Menu map](guides/CAT_DEBUG.md). | Session-only; whole-dashboard tests have a separate disclosure. Original action handlers and card height are preserved. |
| Forced action preview | Interrupts/cancels current activity and explicitly plays chosen action. | Tests animation wiring, not autonomous decision probabilities; safety/asset availability still matters. |
| Surface overlays | Independent Walking supports and Card outlines & grip areas; measured borders, exposed grips, clear tops, explicit post contacts and rejected reasons. | Display toggles do not enable behaviour; native candidate discovery runs only when opted in or inspected. |
| Stable status layout | Action and surface count occupy separate fixed single lines with ellipsis. | Sequence-name length cannot add a wrapped line and move lower cards. |
| Light actor labels | Optional labels show resident name then current action, with mood tint/text colours. Separate above-cat names and glows default off. | New picker cards hide labels; the stress fixture enables them. Existing/manual defaults may differ. |
| One shared monitor | Actor-free card shows foreground FPS, mean/p95 intervals, long frames, counts and minute history. | Browser scheduling, not CPU/GPU utilisation. Multiple monitors share the sampler. |
| Readiness warm-up | At least eight seconds, dashboard/font/cat-support readiness, stable actor membership and two seconds quiet after startup gaps. | Startup plotting is delayed; after collection begins, real stalls remain visible. Reset history restarts warm-up. |
| Local evidence | Bounded diagnostic activity/slow-operation/gap capture, retained locally and exportable as JSON. | Correlation is not proof of cause; Reset chart differs from Clear log. No telemetry backend. |
| Optional actor profiling | Controller/decision timing only when enabled, with bounded samples and visible-panel formatting. | Summed actor means are not whole-page p95; mounting paused cats still has some overhead. |
| Stress controls | Twenty default home cards with saved random names/colours, name/action labels and one monitor; adjust running count without editing saved count. | Default igloo style and behaviour switches are retained. Synthetic/short desktop tests do not establish phone performance. |
| Scrolling plane | Cats, labels and props attach to positioned dashboard content so browser scrolling carries them with cards. | Shared fractional camera/rectangle reuse; unsupported containing blocks use fixed fallback. Mobile inertia still needs evidence. |
| Startup placement | The card owns scaled dock height, visibility and diagnostics space before helpers load. New actor/toy layers stay hidden until placed; zero-size docks retry without creating a support. | First placement skips resize repair. Start-paused cats render; optional helpers cannot add card height. |
| Resize settling | Separate layout suspension gates measurement, decisions, scenes and effects; 260 ms quiet plus two stable probes, shared final discovery, a shared 4ms rebuild budget per animation frame and staggered restart. | One rebuild may exceed the budget; queue progress does not require each actor’s callback. Manual Pause survives. Stale air motion and active pickup/drop recover safely; ordinary scrolling does not trigger suspension. Physical phone validation remains open. |
| Shared particles | One pool/canvas per view, 32 particles maximum, six per owner and 12 spawns per active second. Rope fibres fall to the known support and dissolve for 260 ms; hard lifetime is at most 2.5 seconds. | Sub-cell pixels; hidden/reduced-motion/resize/removal cleanup, no particle DOM nodes or independent animation loops. Rope samples the contacted post pixel; ear-scritch fur uses cat colour; crumbs retain recipe colour unless explicitly overridden. Contact effects use a shared foreground plane with crisp device-pixel drawing and lifetime fade. Ear fur is a sparse frame-entry event beside the raised paw, outside the current silhouette with mirrored outward drift; crumbs remain unwired. |
| Bounded work | Bounded event/memory/cooldown history, shared prop update, cached immutable mouth anchors, sampled carry observations and staggered discovery. | No claim that all route/DOM work is cached. Further optimisation is measurement-driven. |
| Lifecycle | View isolation, pause/hidden/suspension clocks and disconnection cleanup prevent catch-up chains and orphan claims/layers. Cached cards bind navigation identity at their first paint, after HA commits the route. | Resume/reflow/removal and unusual layouts remain ongoing validation targets. |
| Deployment | Five generated roaming modules, no model/backend needed for playback; build checks resource size. | Current HACS manifest still targets older card. Latest checkpoint: 79 suites, not a universal runtime performance guarantee. |

Sources: [monitor](../prototype/cat-monitor.js), [diagnostic capture](../prototype/cat-monitor-diagnostics.js), [scroll plane](../prototype/cat-scroll-overlay.js), [scroll reconciliation](../prototype/cat-scroll.js), [debug guide](guides/CAT_DEBUG.md).

Monitor graph: labelled milliseconds and shared 16.7/33.3 ms green/amber/red reference bands, rescaled with the same history axis. These indicate approximate 60/30 FPS frame budgets, not universal device pass/fail. Existing one-second graph updates and shared sampler remain. Particle recipe sizes increased modestly, with upward raster rounding; material/actor colours, spawn/lifetime/pool caps and reduced-motion rules remain.

## 15. Frame Studio: sequence authoring

| Feature | Implemented rule / nuance | Boundary |
| --- | --- | --- |
| Three-pane workshop | Category sequence browser/full filmstrips, central pixel editor, right playback/export panel. | Standing/sitting/loafing browsing is separate; deeper taxonomy is planned. |
| Native art | Fixed 24×24 cells; draw/erase/fill/line/box/pick, onion skins, grid and contact guides. | Left paints, right erases; raw imported art is not silently labelled human. |
| Selection/move | Box-select pixels, drag selection, optionally apply across sequence; undo/redo. | Contacts/gaze/POI transform with applicable edits; protected frames reject invalid edits. |
| Clipboard | Copy/paste frame across sequences with source lineage. | New frame identity; origin retained, not converted by paste. |
| Stable sequence identity | Rename without changing project ID; duplicate creates new ID and variant ancestry. | Runtime integrations resolve exact identities/versions, not mutable titles. |
| Archive/delete workflow | Reversible deleted/archive states and filters retain originals/history. | Delete-labelled sequences were audited and archived; not destructive history erasure. |
| Phase roles | Enter/cycle/exit shown in timeline and strips. | Playback can independently exclude enter/exit; cycle frames remain. |
| Timing | Saved holds, fine preview FPS, multiplier, stepping and scrubbing; contiguous range holds with one undoable transaction. | Preview speed alone does not rewrite saved timings. Locked ranges reject atomically. |
| Masked animation tracks | Box selection creates named independent masks; add/subtract mask painting, source membership, holds/rates, seed, solo/mute preview and whole-sequence mirror. One driver owns support/contact; gaze ownership is explicit. | Up to six tracks, no overlapping masks or independently moved paw/support markers. Atomic locks/undo; duplication, movement and JSON export/import preserve track metadata/lineage. Runtime cache is bounded to 128 compositions; flat entry/exit and metadata-free clips stay compatible. |
| Context neighbours | Optional before/after IDs; playback supports preferred or other clips/None. | One-level context avoids recursion; preferences do not constrain runtime transitions. |
| Cat volume | Count nontransparent cells per frame with comparison information. | A proportion aid, not a biological volume/weight calculation; guide tokens count. |
| Gaze tools | Palette marker, origin/direction/field handles, 360 field, blind toggle, apply-all and per-frame fine adjustment. | Seeding/apply-all respects locks; metadata does not repaint cat pixels. |
| Gaze quality badges | Green complete, amber partial, red empty; explicit blindness counts as configured. | Separate ! warns origins on transparent cells; does not prove semantic correctness or HA integration. |
| Red POI | One semantic point per frame, initial seeding, apply-all and per-frame adjustment. | Explain purpose in notes. No automatic prose execution or implicit runtime grip/contact change. |
| Prop reference layer | Choose prop, placement, mirror, foreground and opacity in editor/context playback. | Excluded from cat pixels, volume and exported cat artwork; metadata retained. |
| Behaviour map | Category zones, animated previews, zoom/find/fit; runtime links distinguished from optional neighbour links. | Blank click/Escape deselect. Map documents capabilities, not a mandatory animation whitelist. |

Sources: [Studio guide](../frame-studio/README.md), [current editor modules](../frame-studio/dist/), [asset review](../frame-studio/LATEST_ASSET_REVIEW.md).

## 16. Frame Studio: props, review and integration

| Feature | Implemented rule / nuance | Boundary |
| --- | --- | --- |
| Dedicated props page | Shared canvas for loose drawing, capture boxes, label/tag/notes and Done to catalogue. | Reference cat is separate; canvas draft autosave and confirmed catalogue asset are distinct. |
| Editable placements | Add catalogue prop to canvas, move/hide/remove placement, edit or save a variant. | Removing placement does not delete catalogue asset; originals create variants. |
| Families and states | Related angles/fill/condition states can group under one family, including vacuum angles. | Authoring structure/notes are not an automatic runtime animation or damage system. |
| Behaviour notes | Plain text describes motion, interactions and family/state meaning for later integration. | Notes can become stale; inspect actual pixels/metadata and exact revisions. |
| Carryable flag | Per-asset mouth-pickup checkbox; small balls/mice have defaults. | Explicit false survives variants/catalogue refresh. |
| Colour draft previews | Two AI palette proposals per style across six styles for all 43 props at this checkpoint. | Review previews under existing assets, not new catalogue duplicates or live runtime recolouring. HA/system theme option is planned. |
| Authorship | Human/AI/mixed/unknown origin, frame lineage and candidate/review state remain explicit. | Approval does not turn AI pixels human; geometric operations preserve lineage subject to clipping rules. |
| Autosave/recovery | Debounced per-ID saves, local drafts/outbox, conditional shared writes and conflict backups. | Local/hosted stores differ; a dirty browser drawing is not necessarily a confirmed saved asset. |
| Immutable change log | Successful saves/confirmed props create content-addressed versions; Pending/Completed/Deferred retain exact history. | Completion applies only to reviewed/integrated hash. Later edits become pending again. |
| Exports | JSON carries pixels, phases, holds, anchors, notes and provenance; PNG/sheets useful visually. | Image alone loses semantic/version metadata. |
| Exact review diffs | Stable frame IDs expose pixel changes, additions/removals/order and all per-frame/project metadata, including timing, gaze, anchors and tracks. | Actual browser JSON download/reimport, stale conflict preservation and offline retry verified on a labelled isolated store; live artwork is separate. |
| Agent access | Read-only saved asset/change tools and constrained proposal/edit tools support exact handoffs. | AI proposals need human review; model generation is not required for playback. |
| Shared lab menu | Studio and local fixtures have common workshop navigation. | Local servers remain required; portable standalone HTML is not yet built. |

Sources: [Studio guide](../frame-studio/README.md), [palette proposals](../frame-studio/dist/prop-colour-themes.js), [review snapshots](../frame-studio/user-sequences/review-2026-10-17/), [development workflow](DEVELOPMENT.md).

## 17. Planned concepts that must not be mistaken for live features

The delivered 17–18 October refinements include resize settling, stalking/bed continuity, shallow travel, marginal ear-frequency tuning, post deflection, independent tracks and shared contact particles. Broader track adoption and reviewed toy-shake art remain on ROADMAP. The post-track runtime extraction includes the top tail-tip row; saved source frames/masks are preserved.

This is a boundary index, not a duplicate backlog. Follow the roadmap IDs for scope, priority and completion evidence.

| Concept | Current boundary | Roadmap |
| --- | --- | --- |
| Persistent residents / Spawn / several cats per home | One actor per home today; initial arrival exists. | HOME-01/02/03 |
| Global world scale and separate cat size | Per-card scale plus fixed spawn-scale props today; primary flag has no scale authority yet. | WORLD-01 |
| Kittens/adults/seniors | Working age selector/half-size kittens plus movement/tag pilot; broader activity/rest profiles remain planned. | COMP-04 |
| Broader activity calibration | Local residence, fading preferences and bounded voluntary jump/play exertion are implemented. Life-stage calibration and physical-device measurements remain. | MOTION-04 |
| Better whole-route choices | Bounded point routes, short-takeoff projections and measured cost refinements are implemented. Dense-budget fallback and broader/device route-quality calibration remain. | MOTION-05 |
| Wider group emergence | Quiet third-party observation is implemented from recent visible evidence, with 12–35-second independent cooldowns, optional 1.5–4-second watches and no forced joining. Shared curiosity, propagation and clustering remain extensions. | INT-05 |
| Richer cross-surface play | Near-level/local-drop ambush is a bounded exception; general cross-card chases are unbuilt. | INT-04 |
| Greetings and broader contact art | Passing acknowledgement/pat exist; cheek-rub social greetings and additional contact poses need integration/refinement. | INT-02, ART |
| Wider vertical scratching / decals | Explicit posts and an opt-in structural-edge pilot exist. Arbitrary interior-edge inference, broad mobile calibration and scratch decals remain. | VERT-01, PROP-04 |
| General prop colour styles | Six draft style previews exist. Runtime random approved variants, shared palette policy and Follow dashboard theme remain plans. | PROP-06, WORLD-01 |
| Broader props and states | Family metadata exists; arbitrary furniture/toy state machines or every AI draft are not automatically installed. | PROP-01/02, SCENE |
| Authoring growth | Subcategories/intent facets, richer social/prop map regions and portable HTML remain extensions. | STUDIO-04/05/08 |
| General hearing / persistent relationships / AI generation | Local impact sensing, short toy interest and review tools exist; these broader systems do not. | SENSE-01, COMP-03, AI-01/02 |

Maintain this inventory when behaviour ships or its contract changes; record evidence in checkpoints and keep future work in [ROADMAP](ROADMAP.md). When a dated guide conflicts with current source and a later integration checkpoint, reconcile the guide rather than treating an old proposal as the supported API.

## Reproducible release and observation tools

The normal-file package contains a single ordered loader, all five runtime modules, immutable content-version directory, source/provenance digests and a byte/SHA-256 manifest. Two full builds reproduce generated assets; CI runs build, integrity and regression checks. The original HACS card remains separately packaged. [Release guide](guides/ROAMING_RELEASE.md).

Ordinary endurance comparisons report visible/hidden duration, frame distributions, long gaps, nested operation costs, activity occupancy, scratch/contact events and stranded actors. Bounded storage avoids unbounded observation overhead. Quiet outcomes and independent optional participation remain unchanged. Evidence and limitations (development reference retained privately).
