Current extension: **16 October 2026**. The five richer interaction milestones are implemented behind `interaction_behaviour: true`; [INTERACTION_SYSTEM.md](INTERACTION_SYSTEM.md) is the current detailed contract. Earlier pilot limitations below describe the base mode, which remains available with the new flag off.

# Mood-driven exploration and two-cat pilot

> Planning authority: [ROADMAP.md](../ROADMAP.md) is the only active vision/task backlog. This document is an operational reference or dated engineering record; earlier proposed steps are not a separate delivery order.


Implementation checkpoint: 15 October 2026. The generated controller and extras support this opt-in pilot; other cards keep their existing exploration when the flags are absent.

The two existing cards in HA `dashboard-testing/cat-playground` have both flags enabled. Their updated resources were read back exactly, the page reloaded, and the enabled toggles/decision trace checked in the browser. Natural social encounters on that HA layout remain to be observed; the recorded company/chase examples were controlled lab trials. All 42 suites pass. Prior resource contents and view settings are retained in the local rollback snapshot.

```yaml
mood_behaviour: true
social_behaviour: true
debug_mood: true
```

`mood_behaviour` weights ordinary decisions: explore versus stay, relaxed versus interested walking, compatible idle poses, toy-hunting interest and imagined playful pounces. Sleepiness favours loaf/sleep/yawn and staying; playfulness favours exploration and play; alertness favours watching poses. Existing novelty, surface restrictions, gait contact clocks and explicit commands still apply. Mood values remain independent, bounded, session-local and optionally held in debug. A debug glow alone does not enable the behaviours.

`social_behaviour` adds real companion perception and two social opportunities. Each cat uses the raw gaze of its displayed frame, with mirrored position/direction, explicit blindness, finite range (default 110 source cells, configurable with `social_sight_cells`, clamped 24–240), a short notice delay and at most 2.5 seconds of last-seen memory. Unknown gaze grants no sight. The registry supplies collision/route safety and actor availability, not hidden positions for decisions. Perception runs at most every 100 active milliseconds. Paused/hidden/suspended time does not advance its local clock.

## Quiet company

On an ordinary decision boundary, a cat that has noticed a loafing/sleeping companion can choose to approach a nearby resting spot, stay alone or explore. Company remains a weighted opportunity. The spot must fit a full cat canvas plus a six-cell gap, avoid other cats/reservations, allow loafing and have a route there and home. It uses ordinary relaxed routing and authored transitions. A same-surface approach cannot walk through another cat.

The approach reservation lasts at most 22 active seconds. On arrival, the cat loafs initially, then can vary compatible idle/sleep poses during a ten-second resting episode. It does not wake the sleeper, synchronize their poses, or follow them if they leave. Reservations release on completion, invalid geometry, cancellation or removal. Intervening route surfaces retain normal routing safety; this is not yet a general multi-cat collision planner for every exploration path.

## Bounded chase invitation

This first chase is an invitation between two available, awake cats that have **both noticed each other**, on one broad shared surface. It is not an unseen ambush. A sleeping/loafing cat is excluded. The initiator's mood weights whether to offer a chase; the recipient independently samples **ignore / brief watch / run** using its own mood. No response is compulsory.

An accepting runner moves away on the same surface, with room checked before starting. The chaser follows short segments toward the runner's last observed position, leaving at least one full canvas plus six cells of spacing. It cannot target an unseen current position, overtake the runner or guarantee a physical catch. The runner may make one further shorter, slower movement or stop. The episode ends after catching up with spacing, losing the observation, an unavailable participant, changed support or at most eight active seconds. The existing stride clocks determine movement speed and frames together.

One shared chase episode owns both participants. After an accepted or declined invitation, involved cats have a 25-second personal social cooldown. A company episode also gives its initiator this cooldown when it ends. The later interaction pilot now also includes role swaps, social pounces, pats and observed chase-catch cues; see INTERACTION_SYSTEM.md. Moving prop brushes now also dispatch physical disturbances, and automatic hops can settle, retreat or counter-pounce with `startle_followups` enabled; see [the authoritative inventory](AWARENESS_AND_REACTIONS.md#current-startle-trigger-inventory).

## Assets and evidence

Saved gaze metadata is snapshotted in `frame-studio/user-sequences/gaze-runtime-2026-10-15/metadata.json`, with stable sequence/frame IDs, saved times, source-project hashes and exact-row SHA-256 hashes. The build adopts markers only for matching IDs and pixels. It does not ingest new artwork, stale notes or arbitrary unsaved drafts. Runtime frame-index lookup preserves differing gazes on identical pixel frames; ambiguous fallback row matches remain unknown. No sequence-level averaging or inferred vision is introduced.

`scripts/test-cat-decisions.mjs` covers blindness/unknown, exact displayed-frame blindness, observed memory without hidden tracking, mood distributions across seeds, resting spaces and reservations, no forced wake/follower tether, chase refusal/watch/run, timeout and safe observed spacing, third-cat crossing rejection, view isolation, disabled flags, removal and Home interruption. The full regression suite also covers motion, authored transitions, previews, paws and layout.

Open [Mood & social lab](http://127.0.0.1:8769/prototype/social-lab.html) from the common menu (`npm run gaze:lab`). It runs two actual independent controllers. Seeded resets explicitly place cats on a reachable shared surface; quiet company pins a sleeper briefly as a scenario fixture. Evaluate opportunity now samples eligible options; it does not force a chase or company outcome. Each home exposes normal controls and mood sliders. The scene shows observed snapshots, decision weights, recipient replies and bounded ending traces. It supports whole-scene pause, feature/glow comparisons, rolling frame/controller mean/p95 and JSON export.

Browser verification observed a weighted quiet approach into nearby loafing and an independently accepted chase ending with safe spacing. These observations and passing tests validate the initial pilot, not broad crowd performance or every dashboard layout. Sustained foreground enabled/disabled comparisons remain follow-up work. The debug-menu cleanup and ten-cat HA stress view are now implemented; see [CAT_DEBUG.md](CAT_DEBUG.md).

The decision implementation lives in `prototype/cat-decisions.js`, packaged with shared gaze helpers in the extras resource to keep all inline HA resources below the existing size limit. Controller hooks preserve Home/Pause/preview priority and release social ownership on interruptions. No services or entity state are changed by these behaviours.

## Physical prop disturbances and hop recovery

`prop_reactions: true` enables moving mouse/ball contact with an idle cat. Contact uses the displayed opaque pixels and a swept prop path, with a cheap bounding check first. Same-support geometry is required; it does not infer vision. Spawn/reflow establish a silent baseline; continuous overlap emits once until separation. The active toy owner is excluded. Toys retain their own schedules. Recipients now use the shared physical reaction policy: a chosen safe hop interrupts grounded actions immediately, while a committed flight defers it until landing. Ignore/watch preserves ongoing movement; six-second personal cooldown and event dedup are shared with landings. Moving props may also brush a walking cat. See INTERACTION_SYSTEM.md for the current interruption rules.

`startle_followups: true` adds mood-weighted settle / retreat / counter-pounce after automatic hops. Recovery runs after the authored landing, with a safe corridor and ordinary contact-driven locomotion; counter-pounces target the fixed event position and do not emit high-drop landing cues. Explicit commands take priority. Defaults remain off; testing views enable these flags. The social lab has a resettable real moving-mouse brush scenario. Automated coverage lives in `scripts/test-prop-disturbances.mjs`; sudden visual motion, social pats/ambushes and chase catches are covered by the later interaction pilot and its tests in INTERACTION_SYSTEM.md.
