# Cat gait research and animation direction

> Research/reference, not an active task list. Remaining gait work is **MOTION-02/03** in [ROADMAP.md](../../ROADMAP.md#near-term). The phase-offset trot and refined 25 FPS travelling gallop are already integrated; the synced faster walk remains an authoring asset pending its own travel/contact validation. Earlier authoring recommendations below are retained as research history.

15 October 2026. Research and authoring notes, with current runtime checkpoints explicitly identified below.

## Keep the existing options

Retain the user's synchronised faster cycle and the mixed-origin front-leg phase-offset proposal as separate assets. Neither replaces the normal walk or its head-high/head-low variants. Keep the sneaky cycles for future contextual behaviour too. Existing provenance and review status remain unchanged.

The offset proposal is a useful trot experiment, not a validated four-leg gait: shifting a rectangular front-leg region by half a cycle cannot establish correct near/far limb identity, support timing or foot trajectories by itself.

## What the evidence suggests

| Gait | Coordination / silhouette | Implication for our sprites |
| --- | --- | --- |
| Walk | Four separate footfalls; a relatively steady trunk | Keep the established relaxed walk and independent head variants. |
| Trot | Alternating diagonal pairs: left front with right hind, then right front with left hind | The same-side front and hind legs should alternate. Identify near/far legs before judging the phase-offset proposal. |
| Gallop / half-bound | Several footfall patterns occur; hind and fore support have different timing, with flight between contacts | A synchronised-looking clip can remain a stylised scamper. It need not be discarded, but its silhouette alone does not establish a particular biological gait. |

The observational [Ethogram of the Domestic Cat](https://www.mdpi.com/2813-9372/1/3/21) describes walk and diagonal trot. Its simplified run description should not be treated as a universal footfall chart.

A primary [treadmill galloping study](https://doi.org/10.1016/S0091-6773(77)92279-9) observed rotary gallop, transverse gallop and half-bound in nine cats. In those trials, forefoot touchdowns were separated by roughly a quarter stride; hind contacts were closer together in the gallops and simultaneous in the half-bound. There was one flight phase per stride. These are study observations, not mandatory timing constants for every cat or a reason to import a cheetah's double-suspension cycle.

Crucially, [English's spine study](https://pubmed.ncbi.nlm.nih.gov/30184992/) found small lumbar movements during walking/trotting, whereas spinal movement contributed substantially to stride length and limb speed during galloping/half-bounding. This makes a separate running body animation a better next step than only speeding up or rephasing walk legs.

## Integrated gallop and original authoring brief

The user-refined eight-frame `proposal-gallop-24` is now the travelling gallop. Exact saved artwork and its separate pre-fix backup are retained in [saved-projects.json](../../frame-studio/user-sequences/gallop-refined-2026-10-15/saved-projects.json). The backup is not selected for movement. Pixel grids and provenance are unchanged; runtime playback uses 25 FPS rather than rewriting the user's saved holds.

Long prompted walks on broad surfaces (at least 54 source cells) select this gait. Relaxed walking and shorter interested trips retain their existing walk/trot choices. `gallop: false` disables it; `gallop_fps` defaults to 25 and is clamped to 15–30. Each eight-frame stride advances 18 source cells using contact-aware increments `[0,2,2,5,3,3,3,0]`. The sprite origin stays fixed vertically, preserving its two airborne frames. Whole strides are followed by a head-high walking remainder to arrive exactly at the destination. Recall waits for a grounded beat. Regression checks cover stance contacts, direction, scale, endpoints and fallback selection; visual dashboard review is still needed.

Author a separate **Gallop / short sprint** draft, initially around eight frames (an animation starting point, not a research-derived requirement). Choose one consistent reference stride first and mark all four feet's contact order. Then draw its hind-leg loading and push, extended/reaching silhouette, foreleg catch, and gathered recovery, including the appropriate airborne interval. Do not assemble a supposedly universal cycle from incompatible reference gaits.

At 24×24, prioritise a readable gathered-versus-extended body, a clear push/catch rhythm and distinguishable near/far legs over extra tiny details. Keep head stabilisation separate from deliberate body compression. Human refinement remains the acceptance step for any AI proposal.

Before runtime integration, annotate stance/swing and paw contacts. Give each gait its own distance per stride and phase timing: during stance, body travel must cancel the planted paw's local backward sweep at the selected scale. Airborne phases have no planted-foot constraint. A longer stride must not inherit the normal walk's travel rule without checking it.

Compare the normal walk, synced faster clip, offset trot candidate and new sprint side by side at matched travel speeds, with support markers visible. Select by context and urgency once validated; do not force them into a single speed-scaled animation.

## Follow-up: when to use the synced faster cycle

The retained user sequence is `6cfeeb8e-959a-4d04-b3cf-173d8093f0dc` (Walking · faster - synced feet). Its front/rear contact-marker trajectories move together, whereas `proposal-fast-walk-front-offset` deliberately shifts the front legs in time. The synced clip is currently retained for authoring, not selected by normal runtime travel.

Synchrony needs an anatomical qualifier. A **pace** couples front and hind feet on the same side; a **trot** couples diagonal feet; a **bound/half-bound** describes a different coordination of left/right fore and hind pairs. Matching front/rear silhouettes alone does not establish bounding. Our 24×24 silhouettes lack explicit near/far foot identity, so use a descriptive “synced faster walk / pace-like variant” label until foot identities are audited.

Primary evidence: [Blaszczyk & Loeb, 1993, Why cats pace on the treadmill](https://pubmed.ncbi.nlm.nih.gov/8451315/) observed same-side coupling at walking/trotting speeds, especially near the treadmill enclosure's front. It accompanied longer strides and greater ground support; the authors proposed a mechanical explanation involving anticipated belt stops and same-side foot interference. This is evidence that pace-like coordination is possible, not evidence that happy, sleepy or frightened cats have a particular gait. The authors contrast that treadmill tendency with typical diagonal coupling overground, so do not use it to make pacing the universal default.

[Thibaudier et al., 2013](https://pubmed.ncbi.nlm.nih.gov/23485807/) also demonstrates flexible fore/hind coordination under split-belt speed changes. These are constrained experimental conditions, not a mood study or a direct dashboard animation speed prescription.

Proposed animation policy (design inference, not a research-derived mood mapping):

| Context / pace | Preferred options |
| --- | --- |
| Quiet wandering and approaching a nap companion | Existing relaxed walk and head variants |
| Purposeful medium-speed travel / curious approach | Mostly the phase-offset trot, with occasional synced faster-walk bouts for variety |
| A deliberate longer-stride amble | Trial the synced clip at roughly 17–20 FPS, then judge it at actual travelling speed; this range is an animation tuning proposal |
| Playful burst, chase or retreat | Trot or gallop based on distance, stopping room and urgency; synchrony alone does not mean playful or scared |
| Stalking and pounce preparation | Existing sneak clips and their speed-linked head heights |

Mood should bias the goal, urgency and probability of choosing a variant, not override contact/geometry constraints. Sleepiness favours fewer quick trips; curiosity can favour a deliberate approach; playfulness can favour bursts. Neither a sleepy mood nor a playful mood forces the synced clip. A small actor-specific gait preference could add individuality later without requiring another mood stat.

Choose once per travel bout and retain the clip until a planted transition boundary, rather than randomly switching frames or toggling gait on each tick. Compare both clips at matched world speeds, preserving head stability, authored pixels and provenance. Audit the synced clip's complete stance/wrap contacts at scales 1–3 in both directions before enabling it; derive travel from its actual paw trajectories rather than copying the trot clock blindly. A measured variant-specific stride/phase clock may be needed. No pixels or runtime selection are changed by this research follow-up.
