# Dashboard props and toy hunting

> Planning authority: [ROADMAP.md](../ROADMAP.md) is the only active vision/task backlog. This document is an operational reference or dated engineering record; earlier proposed steps are not a separate delivery order.


15 October 2026. First working version, using the original human-authored mouse and ball grids. Studio AI prop drafts remain review candidates and are not implicitly installed.

Current extension note (17 October): mouse/ball carrying, temporary toy interest, bowl meals and the explicitly reviewed rope scratching post/action are now integrated. The post review section below preserves the earlier draft workflow, not its current approval status. See the [current grouped inventory](../FEATURES.md) and latest checkpoint (development reference retained privately) for these later contracts; other AI prop proposals remain review-only.

Enable automatic spawning on one home card:

```yaml
type: custom:pixel-cat-home
dashboard_props: true
```

This seeds one mouse and one ball on suitable reachable surfaces in the viewport. Cats belonging to the same dashboard view share the props, including cats from other home cards. Other dashboards remain opt-in. Up to eight props may be placed. They are temporary client-side scenery, recreated on reload rather than saved as HA entities or permanent placements.

Under **Playground & debug**:

- **Dashboard props** enables/disables the shared scene.
- **Spawn mouse / Spawn ball** adds another prop at a varied point on a reachable surface, favouring surfaces with fewer props.
- **Moving mice** switches between stationary and intermittent back-and-forth motion along a bounded surface span.
- **Hunt a toy** asks this cat to pursue an available toy after its current route/activity: stalk/pounce for mice, inspect/bat for balls. Normal idle behaviour also occasionally chooses toy hunting; `toy_hunting: false` disables autonomous hunts for a cat while keeping the manual action available.
- **Bat a ball** specifically requests the inspect-and-bat interaction, spawning a ball if none exists. Manual requests can bypass resting cooldowns, but cannot take a reserved or rolling ball.
- **Clear props** removes the temporary props and releases their targets. It does not immediately reseed them; toggle props off/on or spawn another explicitly.
- **POIs** draws toy targets and wander points. The visit selector includes both. **Surface report** lists asset IDs, origins, motion and reservations.

## Positioning and movement

Each eligible surface retains three varied, grid-aligned resting points in addition to the original edge/centre choices and content-inspection points. Their fractions are stable across scroll/remeasure; they rescale with the supporting surface. Props have independent continuous positions, not just these resting slots, and contribute dynamic POIs of their own.

Props are shared by actual surface element and surface suffix, not per-cat surface numbering. Their position is relative to that surface. Scroll/reflow updates the rendering; removing the supporting card removes its props. Tiny/narrow surfaces, home docks, unreachable routes and unsafe returns are excluded from spawning or hunting as appropriate. Props are pointer-transparent and do not affect the cards' input or DOM content.

Moving mice travel at five native pixels per second over a bounded span. They move for roughly 0.9–3.3 seconds, pause for 1.8–6 seconds, and sometimes change direction before their next move. At span ends they pause before turning. Each mouse has its own random stream and clock; cat reservations never influence this schedule. They remain on their support. The original mouse faces left; rendering mirrors it when moving right, so its tail stays behind it. When all cats are paused, props stay visible and stop moving; hidden views stop their clocks. A scene advances once per animation timestamp even with multiple cats, so adding a cat does not double toy speed. Removing the last cat cleans up the shared overlay.

## Stalk and pounce

An available cat reserves a toy exclusively, finds a sufficiently wide support with a safe route home, and approaches a position about 33 native pixels from its planned landing origin. It can pause/notice, sneak through the existing slowing head-height cycle, pounce, settle and groom. Normal autonomous interest can fade before the pounce; the manual hunt completes the episode when geometry allows.

Reservations prevent two cats choosing the same target; they never stop a mouse. Once at its lookout, the cat watches until the mouse is naturally paused and facing away from the cat. Only then does it notice, sneak and attempt a pounce. If the mouse moves or faces the cat during that preparation, the cat stops at its next authored planted sneak beat and watches again. It can accumulate progress across several openings. Manual hunts follow the same opportunity rules and may time out after 45 seconds.

The pounce landing uses the authored landing-paw anchor and the mouse position at launch, snapped to the native grid. The mouse continues its own schedule during flight; the cat finishes its ballistic jump and may miss. `data-last-toy-pounce-result` reports contact versus miss geometrically; this is not a catch or a forced toy stop. Successful episodes get a 45-second shared interest cooldown, abandoned reservations a shorter cooldown. Neither cooldown changes mouse motion. Balls use the targeted inspect-and-bat interaction described below. Damage simulation is not implemented.

Home/Explore/card-click commands interrupt the encounter through existing route/stride handling. Losing the prop/support, disabling props or exceeding the encounter time limit releases the reservation. An airborne cat finishes its current physical motion rather than teleporting. Targeted hunts never jump onto another surface's toy from an unvalidated interception route; they first approach on its support.

## Validation and next steps

The props suite checks shared update cadence, human asset provenance, arbitrary placement, exclusive reservations, independent move/pause/turn schedules, paused-away opportunities, planted interruption, actual sneak/pounce/groom, landing-paw contact at 1×/2×/3×, cooldown independence, reflow, independent surface numbering, pause/visibility and removal cleanup. Live HA verification recorded a ball pounce from one cat and a mouse pounce from the other. Scrolling shifted both props by the same 262 pixels as the underlying cards. Actual phone/Companion behaviour remains unverified.

Remaining prop selection, metadata/state, carrying, decals and moving-platform work is consolidated in [ROADMAP.md](../ROADMAP.md#next-product-phase), tasks PROP-01/02/03/04 and SCENE-01/02. The later [interaction system](INTERACTION_SYSTEM.md) adds observed same-support rolling-ball interception and cat awareness; these dated prop notes are not a claim that those features are still unbuilt.

## Describing prop behaviour in Studio

Props lab has an optional **Behaviour / animation notes** field beside Visual notes. Describe desired motion, pauses, cat interactions, animation order/timing, and the meaning of related family states in ordinary prose. Click Done with the asset when ready. Notes are saved as behaviourNotes on that exact prop revision, included in JSON exports, the saved-props MCP response and immutable change snapshots, and displayed directly in Changes review. Variants inherit the notes unless replaced. Older props need no migration. Notes guide Codex review and implementation; they do not automatically change the HA runtime.

## Ball batting and drops

The refined inspect-and-bat sequence is now used for resting balls. The approach solves the cat origin from the authored tap pixel, its seated rear support and the ball centre. Cats only select this interaction when the current scale lets the drawing reach the ball. The actual tap is frame 3 at [20,20]; the ball receives one impulse when playback reaches that contact, not during the earlier reach. Pixel artwork and provenance remain unchanged.

A tapped ball rolls at an initial 60 native pixels/second with friction of 60 native pixels/second squared. Its original coloured grid rotates in quarter turns. At an edge, a predicted landing must fit the ball on a lower surface with a valid cat route/return; gravity then carries it there. During flight the scene checks the first crossed supporting plane, transfers to that support, and reduces horizontal speed on landing. Without suitable support, the ball rebounds gently and loses energy on the original surface. Active balls are not reservable targets or visit POIs until they settle. Pausing and scrolling preserve the same physics/relative surface placement rules as other props.

The ball suite checks exact tap timing, one impulse, both facings at three scales, friction, drop/landing/rest and safe-edge fallback. Mouse rendering checks the complete mirrored grid and native facing. Ball-flight coordinates follow the source surface through reflow; full moving-platform collision behaviour remains a later extension.

Live batting validation: HA recorded data-last-ball-bat and data-last-ball-contact with frame 3, and the ball recorded its striking cat. Both deployed resources match local output. Drop and landing behaviour is covered by physics tests; a live fall has not yet been observed.


Live independent-motion validation: the deployed controller matches the local 94,912-byte build. A reserved mouse moved from x=1048 to x=1028 and reversed from right-facing to left-facing during the encounter. The cat recorded watch, notice, sneak, pounce, settle and groom, with a contact result. Schedule independence and missed airborne targets remain covered by deterministic tests.


## Seated reactions to passing mice

A cat already sitting (including seated looking and perching) can reuse inspect-and-bat when an unclaimed mouse on the same support passes near its forward paw. It keeps its facing and seated bearing; no approach route or repositioning is inserted. Sleeping, loafing, grooming, walking, active/queued commands, previews, existing encounters, home docks and narrow supports are excluded. `toy_hunting: false` also disables this autonomous reaction.

The trigger uses the bat clip's actual support and tap anchors. Frame 3 checks the paw cell against the rendered opaque mouse cells, with edge contact allowed at the tiny mouse's ears. Movement during the inspection can turn an attempt into a miss. A hit records contact only: it does not stop, reverse, shove or otherwise alter the mouse's independent clock. Cats settle/groom afterwards. A 12–20-second personal cooldown and existing shared encounter cooldown prevent constant batting. Reservations still exclude other cats without freezing the mouse.

Debug attributes include `data-last-reactive-mouse-bat`, `data-last-mouse-bat-result`, `data-last-mouse-bat` and `data-last-mouse-contact`; mouse canvases record `data-last-bat` on actual touch. Paw-contact markers and the “Preview contact” label now require the POIs debug toggle for both mouse and ball interactions.

The seated-reaction suite covers both facings at three scales, seated support retention, range/surface/claim/busy guards, exact tap timing, opaque-cell contact, moving-target misses, cooldowns and unchanged mouse motion.


## Variable pats and bats

Inspect-and-bat varies between one pat, two pats, a firm bat, pat then bat, and two pats then bat. Pauses between strokes vary from 350 to 1250 ms. Gentle playback reuses the saved reach/contact grids and retracts (0,1,2,3,2,1,0), retaining the frame-3 tap and source origin. A pat applies 14 percent of a firm ball impulse (8.4 versus 60 native pixels/second), then ordinary friction.

Follow-ups require the same support, retained claim and a target within paw reach. A rolling ball or departed mouse ends the attempt instead of being moved back. Independent mouse motion remains unchanged. Set toy_bat_variation: false to retain the former single firm bat. data-bat-recipe and data-bat-stroke describe the chosen variation. Seated rear support is transferred across bat/sit pauses to prevent sideways slides.


## Mouth pickup and short-lived toy interest

`mouthCarryable` is a saved boolean on each Props Studio catalogue asset. Small existing balls and mice default to true; large props default to false. An explicit false survives catalogue refresh and variants. Use **Can be picked up in the mouth**, then Done, to save this metadata. As with pixels and notes, Studio edits are reviewed and integrated into a build; the card does not fetch the live authoring workspace. Both currently shipped toy types have pickup enabled. An opt-out forbids both nibble and pounce pickup, without disabling nosing or batting.

Successful pickup remembers that toy for 45–75 active seconds. After a drop, the former carrier may attempt to reclaim a recently observed, unclaimed toy on the same support. Seeing its toy carried by another cat increases optional following and compatible social-play interest. This is a temporary preference, never an exclusive reservation or ownership right. Existing mood, observation, corridor, reachability, pair cooldown and refusal rules remain authoritative. No hidden target tracking or guaranteed theft chain is added.

A successful startle releases any carried prop **before** cancelling the current action and starting the escape hop. Release keeps the ordinary fall/contact physics. Failed/unsafe startle attempts do not drop a toy. A nearby drop becomes available to other cats through the existing observed prop system; a former carrier can ignore it or later reclaim it. Possessiveness has no persistence or relationship model.

Mouth anchors cache by immutable frame rows, sequence and pose; facing and world placement remain live. Carry observations are sampled at most every 100 ms per prop, rather than broadcasting every render tick. Grounded toy physics retains its existing timing.

## Scratching-post review workflow

The Studio catalogue contains **Scratching post · rope · AI draft** (`proposal-scratching-post-rope`). Its associated **Scratch post · alternating strokes · AI draft** sequence (`proposal-scratching-post-action`) contains human standing bookends and AI/mixed enter, alternating-stroke and exit frames. It is WIP and is not used by dashboard cats.

Open the sequence and expand **Show prop · reference layer**. Choose the saved post; its proposed offset is X14/Y1. Toggle visibility, mirror, foreground and opacity as needed. The native-scale layer appears in the editor and contextual playback, is saved with the sequence and copied when duplicating it. Cat PNGs, sprite sheets, volume and frame pixels exclude this layer. Forepaw markers should touch the rope while the rear support stays planted. Save refinements normally; exact-version review and explicit approval precede runtime use.
