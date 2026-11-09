# Cat-tree generator references

User-supplied concept references, 24 October 2026. Neither image is an approved final design. Priority and delivery stages remain in [ROADMAP — PROP-09](../ROADMAP.md); the references inform the lab foundation described below, not a final artwork specification.

- Stacked tree concept (development reference retained privately): varied post lengths, offset platforms, a connecting shelf, enclosed house, upper resting bed and optional hanging toy.
- Pixel tree concept (development reference retained privately): a simpler silhouette and limited warm palette, with recognisable rope posts, distinct platform edges and an inset house opening. Pixel treatment is a reference, not approved runtime artwork.

## Proposed interpretation for the lab

- Assemble reusable components into varied coherent trees: base, rope post segments, platforms, house/bed sections and optional toy attachments. Vary their arrangement, not just colours or total height.
- Keep the existing cat's side-view pixel/cell language. The first image's perspective and texture need translating; the second image's exact proportions and shading remain open for refinement.
- Platforms and house roofs expose real standing spans; posts expose continuous climbable spans and available sides. The house opening needs an explicit entrance mask, interior support and foreground rim rather than a single decorative dark shape.
- Size components against actual kitten/adult/senior silhouettes and pose footprints. A narrow perch may fit a kitten but not a resting adult; large beds should allow the intended rest poses. Settle shared prop scale through WORLD-01 rather than scaling a whole tree to each visitor.
- Connection rules should produce visibly supported structures, adequate headroom and optional routes between levels. Preview ascent, rotation, descent, leap-off and return paths using existing planners. Leave room for independent cats to rest or pass without forcing participation.
- Validate front/far masks around posts, platform undersides and house entrances. Rope debris and scratches use material colour and actual paw contact; generated artwork alone must not invent extra supports.
- Start with a small component library and seeded lab generation. Component editing should reuse the shared frame/prop editor core. Hanging-toy motion and other embellishments can follow after the basic structure and traversal work.

The lab should show the generated tree beside actual cats, with optional sockets, standing spans, grips and route overlays. Keep the seed/configuration reproducible so a visually awkward or unreachable tree can be revisited exactly.

## Delivered lab foundation — 29 October 2026

Open [Cat-tree workshop](http://127.0.0.1:8769/prototype/tree-lab.html) through Workshop → Create. It is a construction/geometry lab, not a deployed prop or autonomous cat simulation. Reference cats use existing artwork at adult/senior and half-size kitten scales.

- **Fifteen draft components:** foundation, repeatable rope post, two-way T joint, flat and bridge platforms, left/right continuous-post shelves, two-support bridge deck, original house plus round/small-round/small-arch/square-opening boxes with doorway metadata, shallow simple bed and a static hanging toy. Most are code-authored AI drafts; the simple bed is a mixed adaptation of the human-authored default bed, separate from saved Studio props. Components retain stable IDs, origin, review state, revision, notes and material tokens. Human pixel edits change AI origin to mixed; palette provenance is separate.
- **Seeded assembly:** width/height budget, level/branch limits, repeatable post counts and house/bed/toy preferences. Compact/tall/wide examples change only parameters. Socket types and accepted child kinds constrain assembly; every output socket has one occupant. Placement rejects unrelated overlap and out-of-bounds parts, reserves cap space and rolls back incomplete stages. The query has a 256-attempt budget. Generation runs on edits, not an animation clock.
- **Shared component editor:** the existing frame-canvas core now supports rectangular grids while retaining the 24×24 default. Pencil, line, rectangle, fill, colour pickup, left paint/right erase, undo/redo, duplicate, palette editing and safe canvas growth are available. Cropping painted cells is refused. New drawing tools are not a second editor implementation.
- **Affordances:** sockets, standing spans, climb rectangles/material/sides, doorway region/material, always-near and always-far cell annotations. Drawing pixels does not invent supports; deleting artwork does not silently move contact geometry. Direct guide drawing and an advanced geometry form edit the same metadata. Structural overlap rules do not make cat surfaces solid: exported supports/grips remain pass-through.
- **Fit preview/export:** native cells, slot outline, light/dark backgrounds, shared furniture scale, component selection and geometry overlays. A tree export includes its seed/parameters, exact used component definitions, palette/provenance, affordances and a hash of the workspace snapshot. Async export freezes the snapshot before hashing.

### Durable work and exact review

`pixel-cat-tree-workspace/v1` stores the editable library, palette and parameters. `pixel-cat-tree/v2` stores an assembled instance graph with component/socket links and derived supports/grips. Components can be 1–64 cells on either axis; the library allows up to 64 components. A save/import is capped at 500 KB. Missing/non-fitting parts produce an explicit warning or no-fit result, never a hidden scale change.

- Browser outboxes are independent per page instance, including duplicated tabs. Reload inherits a recoverable copy; only an acknowledged clean version updates the shared browser cache.
- Autosave uses `/api/tree-workspaces/tree-main` with ETag preconditions. A stale tab cannot adopt a newer write base. Offline edits stay in the browser; reconnecting to an unrelated newer version requires an explicit recovery decision.
- Disk records live under `.studio-data/tree-workspaces/`; immutable history pointers under `tree-history/` refer to exact `kind: tree` entries in the shared asset journal. The Studio change view supports component previews/diffs and an Open cat-tree workshop link. A running older Studio build may need its normal safe refresh/restart to pick up this UI; the lab has its own history/export controls.
- Load/import/resize keep verified browser recovery copies first. The lab exposes recovery export/restore controls and exact-version history exports. Loading the server during an in-flight save is refused. No receipt is automatically completed.
- `?draft=qa-<name>` uses a separate browser namespace and `.studio-data/tree-qa` bucket. QA edits do not appear in the owner's ordinary Studio journal. No endpoint reads or overwrites ordinary sequence/prop workspaces.

### Remaining gates before replacing default posts

1. Human art/proportion review and visual browser acceptance. The initial automated page test uses DOM/canvas doubles; it is not a visual test. Codex-browser checks now cover recipe preview, invalid-code recovery and exact QA save/reload; final artwork acceptance remains with the owner.
2. Use the exported geometry in a real actor/prop lab: actor-sized headroom/pose fit, ascent/descent, grip rotations, checked flights, beds/doorway masks, carrying, material effects and lifecycle/scroll recovery. Structural validity is not a jump/return-route proof. Named assembly codes now support multiple required inputs and exact shared-support joins. The wide deck remains single-attachment; the separate two-support bridge module exercises real joins. Random generation still selects single-input modules until deliberate support-closing rules are added.
3. Define the actual home-card space allocator and shared prop-scale authority (WORLD-01). Preserve bowl/bed/toy space, use a stable per-home seed and retain a normal-post fallback when a safe tree cannot fit. Reconcile a changed tree through existing layout lifecycle, rather than regenerating every tick.
4. Profile generation/compiled rendering on constrained devices; cache resolved trees by seed/library/configuration. Only then stage the default-card replacement in HA. Other residents remain independent and may ignore the tree.

Sources: `prototype/tree-components.mjs`, `tree-model.mjs`, `tree-workspace-client.mjs`, `tree-lab.*`, `scripts/tree-storage.mjs`. Checkpoint and checks (development reference retained privately).

## Readable construction codes

[Named assembly format `tree 2`](CAT_TREE_CODE.md) is the canonical editable/export syntax: unique part names, explicit socket connections, optional numbered assembly levels, forward references and exact multi-support joins. The lab has central-post and shared-support examples. Short expressions such as `ITOO` remain convenient input shorthand, but complex layouts do not depend on nested brackets.

**Use this code** converts a generated tree into a named document. The library and drawing editor are unchanged. **Add missing draft components** adds absent IDs without replacing edited art. Invalid/incomplete code remains recoverable WIP; no-fit results never silently drop branches.

## Dangling-toy interactions

Planned artwork family ART-12, attached to the tree's `Y` module. The current toy is static; these interactions are not implemented yet. Start with AI-authored drafts for owner refinement, retaining draft provenance until reviewed.

| Draft | Poses and contact | Optional outcomes |
| --- | --- | --- |
| Sitting · bat dangling toy | Seated anticipation, reach, near/far paw swat, retract; stable seated registration and explicit paw contact. | Alternate paws, wait/watch the swing, another swat or lose interest. |
| Sitting · chew dangling toy | Seated reach, draw toy toward mouth, brief nibble, release; mouth contact plus optional paw support. | Let it swing away, return to batting, or leave. |
| Leap · miss dangling toy | Crouch/launch, airborne reach that misses, ordinary checked landing and recovery. | Watch, retry later, or continue independently. |
| Leap · grip dangling toy | Launch/reach, actual paw catch, brief grip/tug, release and checked landing. | Release immediately or briefly hold if the attachment supports it; no indefinite hanging. |

- Reuse existing sitting, anticipation, flight and landing art first. Separate arm/head/tail tracks where useful rather than multiplying whole-sequence variants. Add only the contact poses and transitions that are missing.
- The attachment defines a suspension point, cord length and permitted swing/stretch. A small bounded, damped motion model updates while moving/contacted and rests when still; avoid a general rope simulation. Paw/mouth impulses move the toy, with material-coloured debris only for suitable chewing/tug events.
- Reach is actor-scaled: sitting interactions require the endpoint within reach; airborne attempts require clearance and a real landing. A visually caught toy must remain attached to the contacting paw/mouth until release. Load-bearing hang requires an explicit attachment capability, not every dangling toy.
- Extend the tree lab with an interaction picker, kitten/adult scale, attachment-height/swing controls, slow playback/frame stepping, contact/depth guides and neighbouring-sequence previews. Exercise success, miss, interruption, occupied landing, hidden/removed tree and release cleanup before HA integration.
- Behaviours remain optional and varied: watch, ignore, sniff, pause between attempts or walk away. Existing broad play/energy preferences choose among eligible actions; no forced repeated catch or participation by nearby cats.

## Components, palettes and central-spine references

Additional owner references (29 October 2026), retained unchanged as design evidence, not approved assets:

- Natural tree with scratch pads (development reference retained privately): upright pad/sleeve and inclined board alongside posts.
- Compact grey tree (development reference retained privately): coordinated fabric, rope, enclosure and hanging toy.
- Central spine with side shelves (development reference retained privately): one long column, alternating platforms at different heights.
- Woodland theme (development reference retained privately): material/colour families and themed component silhouettes.
- Tall central spine (development reference retained privately): continuous column with offset shelves and enclosed/resting sections.

**Delivered structural support:** `R`/`L` draft components combine a post segment and a side shelf. Their input and `head` output share a horizontal axis; each preserves full-height painted post cells and a climb span. Ordinary posts extend the spine between shelves. The **Central-post example** builds a named graph equivalent to `I R(head:I L(head:I B))` in a 64×100-cell slot. The random generator can choose these components too. No new routing engine or overlap exemption is needed. The example/add-missing actions append only absent draft IDs, preserving existing drawings and socket edits; incompatible edits still produce a visible fit error. Real actor pose clearance/traversal remains a later gate.

**Next components:** reuse the existing scratch-pad assets and scratching capabilities for flat pads, inclined boards and upright panels/wraps. Preserve exact source versions/provenance when imported; define mount/support/contact regions, surface orientation and scratch material separately from pixels. Do not treat a scratchable face as automatically standable or a soft pad as a rigid post. General prop wiggle applies where appropriate for the mounting, with particles from the contacted material.

**Palette/theme work belongs to PROP-06:** resolve coordinated wood/sisal/fabric/trim/pad material roles once per tree, allowing restrained family variations rather than unrelated random colours per part. Keep source artwork and collision/contact geometry unchanged by recolouring; retain authored fallbacks and check contrast on light/dark dashboards. Natural/neutral variants come first. Woodland/mushroom silhouettes are a later component-art family, not merely a green recolour or an obligation to add a new theme system now. Cache compiled palette results; particles and temporary scratches use the resolved surface material.

## Enclosure variants

Four additive AI/draft variants extend the original house. They participate in house selection during generation and use exact IDs in named codes; `O` continues to address the original house.

| Component ID | Native cells | Opening |
| --- | --- | --- |
| `tree-house-round` | 26×23 | 14-cell round aperture |
| `tree-house-small-round` | 20×18 | 10-cell round aperture |
| `tree-house-small-arch` | 18×17 | Compact arched doorway |
| `tree-house-square` | 24×20 | Square-sided doorway |

Use **Preview an enclosure** to switch the mounted preview and select that component in the shared editor. Existing workspaces use **Add missing draft components**; this adds absent IDs only and preserves every edited component. Each variant has its own roof/input sockets, roof/interior support spans, entrance bounds/shape/cavity material and source-family notes. The painted cavity cells describe the aperture inside its bounds; the interior support lies behind the front shell. These are construction drafts, not verified runtime masks or cat-fit approvals, especially for the small interiors.

### Simple-bed design

The tree bed now follows the default Simple Bed’s exact shallow 21×7 silhouette and inset cushion. Its source is human revision 4, hash `539f371d48beff7e7bbf0f59532113e117b9e1a22acf099a31be98c403356921`; material-role recolouring and lab mounting/support metadata make this a mixed-origin draft. The original runtime/Studio prop is untouched.

**Preview simple bed** mounts/selects the revised draft. If a workspace’s existing `tree-bed` differs, the action adds `tree-bed-simple` instead of replacing it; repeating the action preserves that variant’s edits and does not duplicate it. Fresh libraries use the revised `tree-bed` by default. Native scale, source lineage and the original prop snapshot remain explicit; actual resting pose/foreground-rim integration is still gated.
