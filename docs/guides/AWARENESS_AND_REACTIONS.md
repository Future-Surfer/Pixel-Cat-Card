# Awareness, moods and reactions: implementation reference

Updated 16 October 2026. **Remaining work and delivery order live only in [ROADMAP.md](../../ROADMAP.md).** The original decision proposal (development reference retained privately) is archived; its staged delivery order and proposed configuration keys are not current instructions.

This reference keeps the reaction inventory and knowledge/choice rules. [INTERACTION_SYSTEM.md](INTERACTION_SYSTEM.md) describes the implemented same-surface systems, [CAT_DEBUG.md](CAT_DEBUG.md) the controls, and INTERACTION_VALIDATION.md (development reference retained privately) dated evidence. Moods, awareness, quiet company, social pats/ambushes, bounded chase choices and shared same-support ball interception are implemented pilots, not unbuilt milestones.

## Current startle trigger inventory

These are opt-in automatic paths unless labelled manual. Every cue still needs recipient availability, deduplication/cooldowns and safe escape geometry. Visibility is required for visual discovery, not for a real physical contact/impact.

| Cause / control | Status | Actual behaviour |
| --- | --- | --- |
| Another cat completes a nearby downward jump | Automatic with `landing_reactions` | A real jump drops at least 16 source cells. Recipients may be on adjacent elements: support-height difference is at most 12 cells at the larger scale, with distance at most 28 cells. Intensity grows with drop height. Gaze does not gate this local impact. Source view and availability checks still apply. |
| Moving mouse/ball brushes a grounded cat | Automatic with `prop_reactions` | Swept opaque contact against the displayed resting or walking cat on the same measured support. Spawn/reflow are silent; continuous overlap is deduplicated, and the acting cat's own claimed toy is excluded. Mouse motion remains independent. |
| A stationary prop suddenly moves | Automatic with `interaction_behaviour` | A real motion onset after stillness, current exact-frame gaze/range and notice dwell. Local surprise can yield ignore/watch/hop; distant motion can invite watching or play. No unseen target knowledge from the registry. |
| Social pat or nearby play landing | Automatic with `interaction_behaviour` | Pat requires actual authored paw/body contact. Ambush/catch disturbance follows a real nearby landing; intention, stalking or chasing alone is not physical contact. Recipients choose independently; startle hops do not generate reciprocal landing chains. |
| HA Preview action: Startle from in front / behind | Manual forced animation preview | Interrupts activity, resumes pause and bypasses repeat cooldown; may explicitly reposition to inspect a safe hop. This does not prove sensing or response probabilities. |
| HA/lab Test nearby high landing | Manual cue injection | Exercises weighted recipient responses; bypasses the feature flag but retains ordinary eligibility/safety checks. Does not simulate a source actor's actual landing. |
| Gaze lab Startle away from target | Manual direct request | Uses target position as a disturbance, respecting ordinary availability/cooldown/geometry. Deliberately bypasses sensing; a target behind a blind cat was not thereby seen. |
| General noise/hearing | Not implemented | Local impact/contact cues are not a general sound model. See SENSE-01 in the roadmap. |

Actual high-landing and natural encounter observations are recorded in the validation history (development reference retained privately). Those records establish examples, not universal encounter frequencies or that every rare response was seen live.

## Response and interruption contract

A valid disturbance produces one weighted recipient choice. Ignore/watch can leave ongoing movement intact. A chosen safe directional hop immediately interrupts grounded walking, sitting, loafing, sleeping, grooming, scratching, previews and committed routes/play; clear commands/claims/episodes only after the escape is validated. A real jump or airborne gallop beat preserves its flight and queues the already-chosen hop until contact, with bounded expiry and scroll-relative source position.

Pause, hidden browser tabs, suspended/unavailable dashboards, cooldowns, narrow/unsafe geometry and corridor/headroom checks remain guards. Hiding only the home card with `show_home: false` does not make its roaming actor unavailable. Autonomous safety failure never invokes the debug preview's relocation shortcut.

The hop preserves facing and moves away from the disturbance: a source in front can produce a backwards hop; a rear source a forwards hop. The approved seven-frame `proposal-startle-hop` uses borrowed exact human frames and retained assembly/source metadata. Translation comes from the ballistic runtime, not painted motion. Its saved recipe and runtime flight timing differ intentionally.

With `startle_followups: true`, automatic recovery can settle, retreat briefly or make a bounded counter-pounce toward the recorded disturbance position. Mood weights alternatives; space, support, headroom and ownership still constrain them. It cannot home on an unseen moving source. Explicit Home/preview/reset cancel pending recovery; manual hop previews remain separate from automatic branching.

## Knowledge and weighted choice

1. Read the gaze of the exact displayed frame, transformed by actual placement, mirroring and scale. Blind means no new visual discovery; missing/conflicting markers remain unknown. All-around vision still has finite range.
2. Notice evidence over time and retain short uncertain observations. Looking away does not erase knowledge instantly; the registry's safety geometry is not sensory knowledge.
3. Filter opportunities through availability, compatible support/route, contact/landing space, ownership and cooldowns before applying weights.
4. Sample alternatives using the actor's own mood, temperament, novelty and episode history. Keep ignore/continue and calm exits. The recipient's response is a separate decision, not an instruction from the initiator.
5. Execute real entry/cycle/exit, contact and route phases. Reassess voluntary activity at safe boundaries. Physical startles use the immediate-grounded exception described above; no arbitrary foot sliding, airborne retargeting or forced catch.

Playfulness, sleepiness and alertness are blended session-local values, not health diagnoses or exclusive modes. Stable temperament is separate. Drift/events and seeded choices are per actor; pause/hidden/suspension clocks do not accumulate catch-up chases. Mood does not grant vision to blind frames or permission to bypass geometry. Soft Studio neighbours remain advisory.

## Controls, tests and source

Use **Cat controls & diagnostics → Behaviour & mood** for values, hold/drift/reset, feature switches and encounter summaries. Labels and the opt-in glow are separate; a sleeping animation is not itself a mood label. See [CAT_DEBUG.md](CAT_DEBUG.md) for current presentation/defaults.

Sources: `prototype/cat-mood.js`, `gaze-perception.js`, `cat-decisions.js`, `cat-interactions.js`, `cat-reactions.js` and `roaming-controller.js`. Tests cover exact-frame vision/blindness, bounded independent moods, seeded outcomes, actual contacts/landings, immediate versus deferred interruption, reservations, misses, clocks and cleanup. Forced opportunity/preview tests and natural HA observations must remain distinguishable.

All future hearing, cross-surface pursuit, extra pose, roster, tuning and optimisation tasks are in [the consolidated roadmap](../../ROADMAP.md); do not append another implementation order here.
