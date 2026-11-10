# Visible vertical surfaces and transfers

Finite-face discovery and checked transfers now have an opt-in HA pilot (23 October 2026). Ordinary routes remain preferred for requested destinations. An opted-in cat can occasionally choose to climb an exposed face and leap to a higher support.

## Shared opportunity model

- A finite **visible face**, a **grip region** and a **standing top edge** are distinct capabilities. A face need not have a walkable base: a cat can leap onto a grip. A top need not offer enough front-face space for climbing.
- Discover from the same `ha-card` / declared-surface records as existing horizontal discovery, with stable owner IDs. The read-only DOM adapter snapshots resolved paint, rounded corners, clipping ancestors, visibility, transforms and overlapping panels. Transparent wrappers, hidden/detached elements, controls and unsupported transforms are not automatic material.
- Explicit `data-cat-climb="on"` / `"off"` provides inclusion/exclusion. Painted geometry is a provisional grip hypothesis, not material recognition. Border-only/image-content interpretation and arbitrary CSS stacking require later confidence work.
- Use the complete reviewed centred climb footprint at each actor scale. Subtract covered/control regions into separate exposed patches; never join them into an invented continuous wall. Top landings require a full stance and headroom and are clipped independently by occlusion.
- Descriptors retain panel ID, patch ID, world bounds, pass-through policy, confidence and geometry generation. A stale generation is rejected. The caller must invalidate snapshots at existing geometry/lifecycle boundaries; no new per-frame discovery is introduced.

## Checked transfers

`planVerticalTransfer` reuses the deployed runtime probe and real jump artwork for entry and exit. At most 48 flight probes per face query; repeated heights are deduplicated. Every flight samples full rendered ink against dashboard bounds. Entry stance and real landing must be fresh and clear.

- **Wall jump:** leap into a checked grip and release immediately toward a landing.
- **Climb and leap:** enter a grip, traverse only the finite exposed patch, then release from a checked height. Existing authored hop/catch cycles provide playback; the face cannot grow to reach the destination.
- Optional walk-up uses the existing gait sampler. The preview starts at take-off by default for quick iteration; the walk-up checkbox and time scrubber expose the complete approach.
- Preview supports neighbouring ledges and the climbed panel's own top. The current entry preview uses the reviewed centred/front grip; it does not claim reviewed right-side entry, new climbing art or grip-to-grip completion.

## Review lab and evidence

[Vertical surfaces & transfers](http://127.0.0.1:8769/prototype/vertical-surfaces-lab.html) is in Workshop → Simulate. Seven scenarios cover immediate transfer, sustained climb, insufficient height, transparency, overlap, narrow fit and hidden panels. Kitten/adult, top/adjacent landing, allowed transfer mode, elevation, approach and scrubbing are available. No Studio saves or HA configuration changes.

Verification: **108/108 suites** and two reproducible full builds passed. The runtime modules remain byte-identical to deployed `snapshot-8fa2a2be3f066fe5`; only lab/navigation/source/test/docs changed. The earlier idle-slide scrape regression remains covered.

Focused tests exercise actual compiled jump probes and reviewed climb playback, fresh/occupied/stale landings, finite height, clipped/covered tops, footprint fit, visibility, opaque black versus transparent material and unsupported transforms. Browser checks confirmed both transfer types, top-edge landing and all five rejection scenarios. A read-only HA stress-view paint/rectangle audit found 21 painted `ha-card` rectangles and 16 headroom-valid top candidates at both tested scales; first-row headroom excluded five tops. That audit did not capture every control or full CSS stacking/clipping ancestry, so it is not a complete native exposure audit, autonomous-route acceptance or performance claim.

## HA pilot and diagnostics

- `card_climbing: true` enables bounded ground → finite grip → real landing routes when ordinary routing fails. Default off. A query checks the three nearest exposed patches, at most 32 flight probes each; geometry/route results are cached and invalidated with existing layout discovery. No new global clock or per-frame DOM discovery.
- Detection and permission are separate: excluded outer cat-home cards retain dashed cyan boundaries and explicit sharing/hidden/inactive reasons, but contribute no grips or tops. Existing bilateral `shared_home_surfaces` permission remains authoritative; nested furniture is not an outer card.
- `debug_vertical_surfaces: true` draws cyan measured card boundaries, purple exposed grip areas and green clear standing tops. Horizontal surfaces also show cyan boundaries alongside the existing inset walking lines. A boundary is a measured box, not a promise that its face or top is usable. Transparent, hidden, clipped and undersized regions explain rejection.
- Open **Cat controls & diagnostics → Travel & climbing → Try climbing a card** on an enabled, free cat. The preview looks for a higher landing and requires at least four cells of upward grip movement before the leap. Opted-in cats can also choose this route at a leisure decision, with a cooldown and an ordinary way back home. If the cat is travelling or busy, wait for it to settle. Other cats remain independent.
- Entry is freshly planned; changed/removed faces and occupied release landings trigger existing visible checked recovery. Uniform scrolling translates cached faces and records. Real support identities own final landings. Existing pause/startle/command, marks and particle paths remain in use.
- The runtime fixture adds an adjacent tall painted panel and a **Climb card and leap** control. Simulation stepping exercises the complete walk/attach/climb/release route; it is not a device-performance measurement.

## Remaining implementation gates

The **Wall jump** invitation in diagnostics is separate from the opt-in autonomous pilot and longer transfer preview. It sorts finite exposed faces by distance from the actor, checks ordinary approaches from the current/three nearby supports, and checks up to five nearby alternative landings plus the entry support. A shared 512-flight-probe budget bounds each explicit query. Only zero-distance grip transfers qualify: leap on, brief grip, leap off. The chosen face/landing is rechecked after approaching; existing lifecycle recovery owns later invalidation. This is a bounded nearest-viable search, not an exhaustive route guarantee on arbitrarily complex dashboards. It changes no saved permissions or autonomous defaults, and virtual grips do not require social behaviour to be enabled.

1. Grip → grip graph edges, reviewed right-side entry and distinct descent artwork.
2. Full composed-shadow control/occlusion auditing, arbitrary CSS stacking, border-only material confidence and transformed shapes. Current diagnostics expose provisional painted rectangles; explicit inclusion does not infer physical material.
3. Real 20-cat/Pi route-query cost and frequency calibration before broad opt-in rollout. Default-off and geometry caching protect existing residents; desktop correctness is not a Pi FPS claim.

Current pilot evidence and deployment: HA native surfaces checkpoint (development reference retained privately).

Sources: `prototype/vertical-surface-model.mjs`, `vertical-surface-dom.mjs`, `vertical-transfer-playback.mjs`, `cat-card-climb.js`; tests: `scripts/test-card-climb.mjs`, `scripts/test-vertical-surfaces.mjs`.
