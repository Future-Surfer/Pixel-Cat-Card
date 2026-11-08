# Life stages and settling

Owner direction: 19 October 2026. ROADMAP owns priority. **V1 delivered:** `life_stage` in the editor/YAML; half-size kittens with unchanged furniture/toys and adult/senior behaviour. The movement/activity/tag pilot and configurable settling below are delivered locally; broader adult/senior profiles remain planned.

## V1: appearance first

- Kitten: existing reviewed 24-cell artwork at **0.5 body scale**.
- Adult: current body size and behaviour, unchanged.
- Senior: adult body size and behaviour in V1; no invented visual or mobility restrictions.
- Default/omitted stage remains adult. Preserve existing names, colours, IDs, `cell_size` and advanced configuration.
- No automatic ageing, care obligations or sequence-specific age tables.
- Props keep their physical size. Reducing `cell_size` alone is not the feature: that currently reduces the cat, home and toys together.
- Use the [visual preview](../../prototype/life-stage-preview-lab.html) first. It compares unchanged source frames in eight pose families, both facings, six world scales and two bed styles. It is not navigation/contact acceptance evidence.
- Owner accepted the unchanged half-size silhouette for V1 on 19 October. New head/ear/paw proportions remain optional later artwork; originals/provenance are preserved.
- Odd world scales produce fractional kitten cells (scale 3 gives 1.5 CSS pixels). Review crisp-edge quantisation and contacts; do not round the kitten back to adult size or silently shrink furniture.

## Runtime integration and acceptance

1. Separate the effective actor cell size from each home/prop's physical scale. Keep legacy mixed `cell_size` behaviour unless the user explicitly chooses an age/size change; no mandatory world-authority migration or roster prerequisite.
2. Apply effective actor size to paws, mouth/gaze, grip, body clearance, locomotion and particles. Use owner/prop scale for furniture, scratch faces, bed apertures and carried-toy dimensions. Evaluate eligibility from physical reach/fit, not age-specific exclusions.
3. Test six scales/both facings: planted walking/jump landings, post reach/exit, roof fit, bed entry/mask/departure, carrying through rest/groom/turns, drag/drop, mixed-size neighbours, hidden homes, initial load and cached dashboard return. Preserve existing active clocks and work caps.
4. Add one stage choice to the editor and verify omitted/invalid values, saves/reload and existing advanced YAML. Do not rerandomise identity or colours on hydration.
5. After controlled/HA acceptance, rebuild the **20-card** stress view with a reviewed mixture of ages, retaining names/IDs/configuration where possible and scoped exact backups/readback. Delivered age-only stress configuration: 5 kittens, 12 adults and 3 seniors; names/IDs/other settings preserved.

## V2: broad modifiers, independent cats

- Delivered movement pilot: kitten locomotion cadence 1.35x, capped at 60 timeline frames/s (30 for gallop; default 25 becomes 30). Rescale the shared stride/displacement timeline once per bout. Ballistic jumps, startles, rest/grooming and departure preludes retain their clocks; no new render loop.

- Use semantic action categories/capabilities, not an expanding list of pose IDs: sustained rest, travel/exploration, play, grooming and observation/social attention are candidate groups.
- Keep **choice weight**, **bout duration**, **movement pace** and **source-frame timing** separate. Do not use one global multiplier that accidentally stretches transitions or locomotion frames.
- At decision/bout boundaries, combine bounded category defaults with age, individual temperament and current mood/effort. Cap the result once. Preserve quiet alternatives, individual overlap, safe interruptions and optional participation.
- Current lively behaviour is the kitten reference. Later adults favour longer/quieter periods, seniors more again; neither loses the ability to play. Calibrate observed activity/rest distributions rather than requiring particular sequences.
- Missing/ambiguous metadata gives normal timing and neutral weights. New reviewed clips inherit category policy through metadata without another runtime ID-list edit. The Studio catalogue has broad categories today; runtime clips now carry reviewed category/tag metadata, but sustained-rest classification is still unreviewed. Add a minimal reviewed metadata path instead of guessing from names or treating all idles as rest.

## Extended rest after settling

- Default: after five minutes of each actor's active visible time, newly chosen sleep/loaf bouts (semantic `rest` tag) last an independently sampled **5–10 minutes**. Ordinary choices and source frame timing stay unchanged; cats are not sent to bed together.
- During that bout, usual sensing/decision, play and toy-hunt work pauses. Existing cycle animation/breathing, shared props, geometry/lifecycle safety and event-driven startles continue. Timer expiry returns to ordinary decisions; a successful startle or explicit command interrupts immediately.
- Hidden, manually paused, layout-blocked and suspended time does not count. Existing clock freezing preserves the remaining rest duration; no catch-up decisions or new actor timers. Eligibility belongs to the current actor instance and resets on a fresh creation.
- A completed bed/company rest episode can hand over to the individual long hold, releasing its visit reservation. Approaches and active interactions still finish normally.
- All ages share this rule. The first open editor section, **Your cat**, exposes **Activity & settling** with the default and its explanation. `settling_mode` accepts `default` (5-minute eligibility, 5–10-minute rests), `active` (Always active: disables prolonged holds, retaining ordinary brief rests), `extended` (5-minute eligibility, 15–30-minute rests), or `custom`. Omitted/unknown modes retain the default; opening the editor does not save implicit defaults.
- Custom uses integer minutes: `settle_after_minutes` (default 5, range 0–1440), `settled_rest_min_minutes` (default 5, range 1–1440), `settled_rest_max_minutes` (default 10, range 1–1440). Zero eligibility permits longer rests immediately without forcing sleep. The editor rejects inverted ranges; runtime normalises inverted YAML ranges and uses field defaults for invalid values. Presets retain custom overrides for a later return. No entity subscription, sensor wake adapter or global activity reduction.
- Controlled lab: `prototype/settling-lab.html`; eligibility/timer buttons are explicit test actions, not altered production defaults.

## Parked performance investigations

These remain ideas pending measurement, rather than commitments for this batch:

- Shared deadline scheduling and low-work breathing holds; offscreen/hidden work suppression beyond current lifecycle gates.
- Reuse SVG shapes; skip identical DOM/style/debug writes; separate animation/render cadence from decision cadence without reducing visible movement quality.
- Coalesce geometry reads/invalidation; avoid repeated route/nearby-peer searches and unnecessary dashboard state work. Profile first; retain scroll attachment, safe placement and independent behaviour.
- Optional read-only nearby entity awareness and a small meaningful wake allowlist. Exclude noisy telemetry; avoid scanning every dashboard card/state update.
- Broader category/profile calibration remains parked. Longer settled holds are now available through the optional extended/custom choices above; the default remains 5–10 minutes.
- PiDisplay acceptance: compare the same three cats/layout before and after, using actual CPU busy time and visible frame timing. The handover's TouchKio processor usage is a load-average measure; do not treat it as CPU busy percentage. Preserve the supplied handover/design briefs in the private notes folder.

Related: [world/body scale design](WORLD_AND_RESIDENTS.md), [idea intake](IDEA_INTAKE_2026-10-19.md), [roadmap](../../ROADMAP.md).

## Shared sequence policy contract

- Source: optional `behaviourPolicy: {tags: ["energetic"], lifeStages: ["kitten", "adult", "senior"]}` on a sequence. Category comes from the existing sequence category; walking/leaping map to locomotion. Tags are unique lower-case slugs (maximum 20); unknown tags are neutral. Missing age metadata allows all three; an empty list disables optional selection for all ages.
- Studio: Notes & sequence settings has three age checkboxes (all selected by default) and autosaving comma-separated tags. Opening legacy work does not materialise defaults or alter pixels, timing, gaze, POI, tracks or provenance. Save/export/import retain metadata. Only an explicitly reviewed immutable version changes runtime policy; live drafts are never build inputs.
- Runtime: profiles live in `prototype/cat-behaviour-policy.js`. Choice weight and locomotion cadence are separate category/tag lookups, sampled at choices/bout creation. Choice weights cap at 4. Ordinary kitten locomotion now uses the numeric pace chooser below, rather than the earlier energetic-gallop probability bias. Adult/senior profiles remain neutral. No per-age sequence-ID tables.
- Ordinary travel: `art.travelChoices` registers reviewed playback adapters (`walk`, one-cell `step`, stance/flight `bound`), asset keys, minimum distance and optional prior. Natural speed comes from the current walk clock or clip FPS/stride plus any grounded finish. Profiles contain a numeric target/spread, never preferred gait names. New compatible registered clips compete automatically; their ordinary playback/contact integration remains required.
- Kitten pace target starts at 26 native cells/second before the existing bounded cadence multiplier, with playfulness, sleepiness and exertion shifting it. A log-speed similarity weight has a nonzero floor; quiet walking and occasional bounds remain. No per-frame selection or route search. Adult/senior neutral profiles preserve legacy pacing/choice gates. Explicit stalking/bed-entry sneaks and other deliberate gait intents bypass ordinary pace competition. Existing opt-outs, age eligibility, planted stride/flight rules, narrow-support exclusions and full-bound distance gates remain.
- Eligibility filters optional idle/gait choices and action requests, with a terminating stand fallback for unavailable optional poses. Core motion cannot simply disappear: build rejects restricted active core clips until a compatible fallback/variant is integrated. New action families still need their ordinary affordance/contact integration; tags never invent a safe route or override claims.
- Social/reactivity pilot: kitten `play` weight is 1.7 plus up to 0.4 with playfulness; `startle` weight is 1.9. Shared intent tags cover chase invitations, recipient running/catching/reversal, playful ambushes and gentle pats; hop responses use startle. The common chooser applies these once to fresh local options, exposing effective weights in encounter traces. No new sequence-ID age lists, alarm sources, timers, forced participation or changes to perception, physical contact, cooldowns, safe landings or bout horizons. Disabled social interaction still uses the generic physical-reaction bias when reactions are enabled.
- Activity: shared `travel`/`rest` intent tags favour kitten exploration (1.35) over passive stay/settle (0.5). Voluntary rest windows start at 0.5 duration, softened towards baseline by sleepiness/exertion. Preview, play, toy hunting, commands and non-company episodes are protected. Source frame holds, transitions, grooming and social reaction clocks are unchanged.
- Reviewed loaf/sleep clips carry the generic `rest` tag once at integration. New tagged resting clips inherit duration policy; full enter/cycle/exit holds bound the shortening. Loaf holds now share the existing playback helper, so the policy and renderer agree on that minimum. Arrival windows and discretionary stay/settle waits use the same policy; ordinary per-pose action durations retain their original base budget.
- Next: review observation capabilities, broader adult/senior differences separately; five-minute settling is delivered. No mandatory ageing or care obligations.
