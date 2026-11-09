# Cat Frame Studio

Use **Create**, **Behaviours**, **Simulate**, **Diagnose**, **Review** or searchable **All tools** to find the editors and 8769 fixtures. [Navigation guide](../docs/guides/WORKSHOP_TOOLS.md).

> Planning authority: [../ROADMAP.md](../docs/ROADMAP.md) is the only active vision/task backlog. This document is an operational reference or dated engineering record; earlier proposed steps are not a separate delivery order. Feature-history sections and saved review records are not current runtime integration queues.


Current version: **Asset workshop v8**. From the repository root, use `npm run build` then `npm run studio`; open `http://127.0.0.1:8767/`. Restart the preview after rebuilding its embedded assets. No npm dependencies are required.

The current app has separate Sequences, Props lab, Behaviour map and Changes pages. Sequences autosave; stable IDs survive renaming. Neighbours are advisory and context playback can select non-preferred clips. Idle browsing is split into Standing, Sitting and Loafing. Prop Done confirms catalogue changes while the workspace draft autosaves independently. Changes tracks exact versions and reversible completion/defer receipts.

**Gaze coverage:** sequence tiles show an eye with a green check (every frame configured), amber question mark (some configured), or red cross (none configured). Hover for exact counts. Enter/exit frames count too; an explicitly blind frame is configured, not missing. These badges describe saved authoring metadata, not whether that asset version has been integrated into HA.

An additional **!** warns when a gaze origin is on a transparent cell. Hover for the affected-frame count; completeness remains a separate indicator. This is a useful continuity check, not proof that a gaze is semantically correct, and never changes pixels or markers automatically.

**Red POI marker:** choose **● POI** in the palette, then click/drag a point. First placement seeds unlocked frames; **Apply to all frames** copies your refined position, and each frame can then vary. Right-click or Remove POI clears the selected frame. Explain the point in ordinary Sequence notes (for example, “red POI marks the scruff grip”). POIs survive copy/paste, mirroring, selection moves, JSON export and shared saves without changing pixel authorship. They are authoring hints, not automatic runtime commands. One point per frame belongs to the sequence's shared semantic meaning.

**Prop colour proposals:** select a placed prop, then expand **Colour themes · AI proposals** below its editing controls. Every saved prop, including AI drafts, has two review previews for each of six proposed world styles: Quiet neutrals, Colourful, Soft pastels, Greyscale, All pink and Natural materials. These are palette maps inside the same asset, not more catalogue rows. They retain source pixels and provenance and do not recolour live HA props. Material/functional colour review and runtime world-style ownership remain PROP-06 work.

**Frame range timing:** expand the panel below the timeline, set From/Through frame and Hold (ms), then Apply. All frames and Current frame are shortcuts; Shift-click a thumbnail extends from the active frame. A range containing a locked frame is rejected in full. The change uses one undo/autosave and preserves pixels, stable IDs, gaze, anchors and artwork origin. Other range operations remain roadmap work.

Curated snapshots under `user-sequences/` are checked into Git. Live `.studio-data/`, browser drafts and hosted storage are separate and are not restored by checkout. The optional private deployment's identity is configuration, not a credential. See [DEVELOPMENT.md](../docs/DEVELOPMENT.md) for source layout, build, integration and deployment, and [ROADMAP.md](../docs/ROADMAP.md) for future options.

The sections below retain feature history and earlier workflow descriptions. The v8 summary above supersedes earlier save-button, read-only-props and catalogue-count statements.


Touch-friendly 24 × 24 frame editor for Pixel Pet. Serve `dist/` using a static HTTP server. The private hosted Site identity is in `.openai/hosting.json`.

Features: pixel drawing, erase/fill/line/rectangle, onion skins, change overlay, grid and paw/contact guides, separate contact anchor, frame holds, native/3× preview, animation playback, frame stepping/duplication/insertion/deletion/reordering, mirrored/shifted art, undo/redo, locked keyframes, per-frame provenance and review, original reference library, browser-local autosave, JSON project interchange, grid copying, transparent PNG and sprite-sheet exports.

Original reference grids are exact human-authored frames. The library now also includes the user-approved AI horizontal leap and explicitly labelled mixed-origin development head variants. `scripts/build-studio-library.mjs` rebuilds the library. It reports source grids that violate 24 × 24 instead of silently fixing them. Editing library copies never writes the original card or reference files. Project edits do not automatically install anything in HA.

## UI refinement v8

The wider sequence browser has one navigation path, a scrollable catalogue and Archived/Deleted filters under Hidden sequences at its foot. Notes, category, stable ID and neighbour preferences are in Notes & sequence settings. Duplicate/import/reference actions are in Sequence actions. Selection options appear only with Select / move.

The playback dock is wider with a larger preview. It plays automatically on page/sequence entry and refreshes after edits while playing; Pause and manual scrub/step retain explicit control. It no longer shows the redundant native-size preview. Export and provenance tools remain available in the dock.

Gaze is a marker beside Ink/Paw/Front/Rear. Select it, choose Location (click the eye area), Type, Degrees and Direction. All around/camera-facing sets a 360-degree field and disables directional input. The first placement in a sequence seeds every unlocked frame in one undoable action. Later clicks and drags affect only the selected frame. Use **Apply to all frames** to copy the current gaze location, direction and field width to every unlocked frame, replacing their previous gaze settings in one undoable action. Then refine individual frames as needed. With Gaze selected and Overlay enabled, drag the origin dot to move it, the arrow to aim it, or a diamond at either field edge to change its width. A 360-degree field has one edge diamond that can be pulled inward to narrow it. Each drag saves once on release; cancelled gestures are discarded. Right-clicking the origin removes its gaze marker without erasing cat pixels. Untick **Can see** for closed-eye/otherwise blind frames: a purple crossed marker replaces the yellow field, and the direction/width controls are disabled. This explicit `gaze.canSee: false` differs from an unmarked frame (unknown). Reticking restores its retained direction/field settings. Apply to all frames also copies this state; initial blind toggling affects only the selected frame. Existing markers without `canSee` remain enabled. Gaze is metadata and preserves artwork origin; it is not yet consumed by HA perception.

A stale props browser draft now reconciles with saved storage after backing up both complete original workspaces. The saved catalogue stays intact; genuinely conflicting browser assets become labelled recovery variants, and changed placements are retained. The browser canvas/reference is kept, and the saved canvas remains in the recovery file. Recovery waits while actively editing a selected prop. Workspace recovery & backups exposes the original copies. This fixes the old conflict path that skipped catalogue refresh and hid AI drafts/families.

## Current catalogue and map

Props use collapsible families, including the nine original vacuum angles. The Catalogue filter selects all props, AI drafts for review, or original/saved artwork. The bundle includes 19 AI candidates across nine families. Loading an older workspace adds missing candidates and family metadata without replacing matching IDs, revisions, dirty placements or scratch artwork.

The map shows teal conditional runtime links separately from gold dashed neighbour preferences. Select a node to trace its links; click blank canvas, the selected node again, or Escape to clear. Previews animate at saved holds at 72px. Animate previews can be disabled and respects reduced-motion preference initially. Runtime links document capabilities; they never modify sequence metadata or impose a transition whitelist.

A portable single-HTML edition is feasible but not yet built. See [PORTABLE_MODE.md](../docs/ROADMAP.md#authoring-and-integration). The current Node server has no npm dependencies.

## Authorship

Human drawing defaults to actor `human`; the author selector supports an explicit AI session. AI browser tools always force actor `ai`. A new AI candidate is AI-authored and requires review. AI changes to human pixels produce mixed origin. Human edits to AI pixels also produce mixed origin. Geometric mirrors/shifts preserve source lineage unless pixels are clipped. Accepting a candidate never changes its origin. Imported row arrays and PNGs are unverified (`unknown`), not silently human-authored.

## Agent interface

## Labels, animation batches and handoffs

The Label & hand off panel provides categories, comma-separated tags with quick presets, descriptions, searchable frame selection and named animation groups. Save labels to selected frames; save or update an animation's ordered selection and metadata. Playback can preview only the saved animation. Metadata changes do not relabel pixel authorship.

Submit an animation to retain an exact snapshot of frames, holds, anchors, provenance and group context. Human sessions can confirm it, request changes or reject it. Any later change makes that submission stale; resubmit before confirming. Confirmation records review and does not install artwork in HA. Browser autosave remains local; Save project online persists the full project privately across devices. Downloaded handoff JSON remains available as a fallback. Open project can reimport that handoff for refinement.

Agent tools now also include `propose_ai_animation` (atomic labelled batches of AI candidates), `label_ai_frames` and `get_animation_handoff`. There is no agent submission/confirmation tool. Human review does not convert AI artwork into human artwork. Read confirmed snapshot data when integrating a batch; do not substitute newer draft pixels.

Workflow tests cover atomic rejection of malformed batches, metadata validation, exact saved snapshots, human confirmation, stale detection and preservation of origin. The new UI controls could not be browser-tested in this run because automatic approval review hit an account usage limit.

When supported, the page registers WebMCP tools: `get_project`, `insert_ai_candidate`, `patch_ai_pixels`, `set_ai_contact`. They use the same validation and undoable model as the visible editor. Locked frames reject edits. There is no tool that marks an AI candidate accepted or changes origin to human. Browser agents should use these tools; if using the canvas UI, select AI session first.

The downloadable contract and plain ES module model provide a foundation for an Ollama adapter. An Ollama connection is not implemented in this version. Save project online and Open saved project transfer work across devices. PNG/sprite sheets alone do not carry timing, anchors or provenance; keep the JSON master.

The canvas is a visual pixel editor, with labelled controls and keyboard frame stepping. It does not provide cell-by-cell screen-reader editing.

## Hosted editor and validation

Private editor: https://pixel-cat-frame-studio-lewis.fuzzybard128.chatgpt.site

Fresh sessions open an across-jump clip with a blank refinement slot and protected first/last keyframes. The library includes 56 grids in 13 groups, including grooming, stretching and head-clock development variants, with per-frame origin/review status and starter descriptions. Existing browser autosaves are preserved; open the updated reference sequence or import a project to see new frames. `BOX_EXIT_FRAMES[2]` is excluded because source row 10 is 23 cells wide; its artwork has not been changed.

Model tests cover fixed-grid validation, atomic edits, keyframe locks, authorship, candidates, transforms and drawing geometry. Queue/storage tests cover exact ready versions, human-session guards, saved outputs, conditional writes and read-only MCP retrieval. Browser checks cover editor operations, queue creation and shared saving. Responsive previews do not replace testing on an actual phone.

## Sequence editor v3

Browse Idle, Walking, Leaping and Interacting categories in the left column. Each sequence has an animated preview plus every frame in a strip. Pick a frame in the middle-column timeline and draw directly. The right column contains playback and Save/Export actions. Frame details are collapsed under Frame tools & provenance. Left-click draws with the chosen tool; right-click temporarily erases, including when Fill or Contact is selected. Onion skins, contact markers, frame holds, transforms and provenance remain available.

Edits autosave independently per sequence in this browser. Switching sequences preserves both drafts and the selected frame. Save sequence writes the current sequence to the local workspace at localhost, or private online storage on the hosted Site. Open saved retrieves those records. Browser drafts and server saves are separate; explicitly save before switching devices.

Export sequence downloads ordinary project JSON containing frames, timing, anchors and provenance. It requires no grouping or review ceremony. Import JSON accepts both these exports and older handoff files. Full backups and the original label/review workflow are under advanced tools. Exact historical task outputs remain under Legacy task outputs.

Future poses are editable blank sequences with drawing briefs in Sequence notes. Both user refinement exports (walk slow head bob and horizontal leap refinement) are included unchanged at frame level; exact original files are retained in user-sequences/. These are drafts, not automatic approval or HA installation.

Private shared storage uses the existing owner-only Site and an R2 binding. Conditional writes prevent a stale device overwriting a newer project. Browser autosave and JSON downloads remain available offline. The Site's read-only MCP tools are list_saved_cat_projects, get_saved_cat_project and get_saved_cat_pose_output; they retrieve project-linked queue outputs while preserving provenance. Ready is a handoff status, not installation or artwork approval.

Build with node scripts/build.mjs. This bundles the editor assets into a Worker and preserves the Site ID and audience. Local preview with node scripts/preview.mjs serves http://127.0.0.1:8767 and uses ignored .studio-data storage; this is separate from hosted data.

The Windows source helper successfully pushes the publication checkout. Local packaging requires Bash, which is absent here; publication uses the supported remote-build fallback from that exact pushed commit. The isolated publication checkout is ignored under `.site-publish/`.


Playback supports saved frame holds or fixed preview FPS (1–60, 0.1 fps increments), a 0.05–4 speed multiplier, scrubbing and frame stepping. These controls do not alter the saved holds until Apply FPS is selected; stored holds currently support up to 20 fps. User notes embedded in old task exports are promoted to normal Sequence notes without dropping their legacy copies.

The library includes exact user-refined Walking · head high (odd source frames), Walking · head low (even source frames), Horizontal leap · refined, and Tall drop · pre-landing candidate. The eight-frame source export is retained in full; do not treat its interleaved order as eight separate gait steps.


## Catalogue audit / v4

The catalogue now separates ground/elevated sitting and exposes exactly the original, head-high and head-low walking references. Jump across uses user export frame 3 exactly. Old managed copies and development sequences are retained under Show archived development; the catalogue is refreshed once per revision. User edits to the current revision are not replaced on reload.

Enter/cycle/exit phases appear in the timeline and preview strips. Untick Include enter frames and Include exit frames to exclude transitional frames. Cat volume counts every nontransparent token, including contact guide cells. Sequence duplication creates new IDs, retains artwork origin/history, records variantOf and parentId, unlocks copies and marks them candidates. Archive/restore is reversible.

Four previously blank pose sequences now contain AI-authored native-grid candidate frames, with human enter/exit references where useful. They are proposals for human refinement and are not installed in the roaming card. AI edits retain actor/origin records; later human pixel edits produce mixed origin.

Props lab starts with all 19 original native-size/palette assets and supports editable placements, new prop capture and cat scale references (see v6 below). BOX_IDLE_SEQUENCE is a compositing recipe, retained in library.json; it is not misrepresented as eight full cat grids. SEQUENCE_AUDIT.md records every current sequence and the malformed 23-cell-wide box-exit exclusion.


## Autosave / stable sequence identity / clipboard · v5

Edits queue automatic, debounced saves to the current local workspace or private hosted Site. Browser copies and a persisted per-ID outbox protect unsent work. Switching sequences flushes pending snapshots without changing their destination IDs. Conditional writes stop stale tabs replacing newer saves; conflicts retain drafts, with earlier copies archived before opening another saved version. Reconnecting retries pending work. Local workspace saves and hosted saves remain separate stores.

Sequence name is explicitly editable. projectId is the immutable storage/lookup key and is shown alongside Copy ID. Renaming does not change it; exports now include it. Clipboard Copy/Paste carries an exact frame between sequences, creates a new frame ID and records source sequence/frame IDs. Rows, timing, anchor, phase and origin are retained; a paste is unlocked and a candidate. Human pixel changes to AI artwork produce mixed origin. The internal clipboard persists across sequences/tabs; standard JSON clipboard copy/paste is also supported outside text inputs.

The 14 October local saved refinements are frozen under user-sequences/refinements-2026-10-14 with a manifest keyed by sequence ID. The updated runtime integrates the eleven-frame ground-sitting variant, ten-frame look-up, refined standing/across/walk-high, look-down and glance clips. The vertical-up/down saved projects remain WIP and are not installed in the jump player. Look-down support uses the shared rear marker at (14,17), while forelegs hang below the ledge. Original snapshots and origin/history are preserved.

Playback has independent Include enter frames and Include exit frames checkboxes. Cycle frames remain included; these preview filters never change saved artwork or frame roles. Both default to enabled. Toggle either during playback to update the selection. An empty selection disables Play.


## Asset workshop · v6

Preferred neighbouring sequences are optional `preferredNeighbours: {before: [projectId], after: [projectId]}` metadata. Pick one or more candidates on either side, or leave both empty. Names remain editable; links use stable IDs and persist through autosave, export/import and sequence duplication. Missing links are retained with a visible warning. They are authoring hints, not runtime rules.

In Playback → Preview with neighbours, enable context and choose a preferred before/after clip (or None). The playlist plays each neighbour once around the selected sequence; Loop repeats the complete playlist. Enter/exit filters apply to every clip. Context is one level deep, so cyclic preferences cannot create recursive playback. Playback status identifies the source clip; editor selection remains on the sequence being authored. Grooming's local workspace preferences demonstrate Sitting → Grooming → Sitting.

Props lab is a 96×64 shared authoring canvas. Left-click paints, right-click erases, with arbitrary RGB colours, fill, pick, zoom, grid and undo/redo. Use New drawing to paint loose artwork, Box new prop to drag a capture rectangle (or Precise capture box for numeric coordinates), label/tag/describe it and click Done. Captures exclude the separate reference-cat layer. Choose any current sequence for that 24×24 scale reference; it can animate, hide, or move via X/Y.

Catalogue items add independent canvas placements. Move/select drags their bounding boxes; arrow keys nudge a selected placement (Shift = 8 pixels). Hide and Remove from canvas leave the catalogue asset available. Painting a selected placement edits its draft; Done confirms catalogue changes, and Save as variant assigns a new stable asset ID with source lineage. Original assets always create variants. Origin is retained across moves, and mixed human/AI pixel edits remain mixed. Saved assets remain candidates for later card integration.

The entire workspace, including loose pixels and unfinished placement edits, autosaves to the browser and to `/api/props-workspace` in the current local/private hosted store. Conditional ETag writes retain conflicting drafts; Load saved workspace exports the current draft before adopting a newer server copy. Workspace JSON and individual saved prop JSON/PNG exports are available. Local and hosted stores remain separate. Read-only MCP `get_saved_cat_props` retrieves the exact saved catalogue and canvas with IDs, revisions, notes, tags, pixels and authorship; `get_saved_cat_project` includes neighbouring-sequence preferences. No card/runtime installation occurs.


## Review and integration workflow · v7

Top navigation now separates Sequences, Props lab (`#props`) and Changes (`#changes`); props is a full application page. Idle browsing and category editing are split into Standing, Sitting and Loafing. `idlePosture` is separate from the existing broad `category: idle`, with stable-ID/variant inheritance for older projects. Sequence descriptions are retained as user notes; they are not trusted as current motion specs after pixel refinements.

Neighbour lists remain soft preferences. Context preview can choose **any** available sequence, with preferred choices labelled, or None. These links do not force a runtime chain or exclude other behaviours.

Every successful shared/local sequence save and confirmed prop catalogue change records an immutable content-addressed snapshot. Changes displays exact pixels, phases, timing, origin and an earlier snapshot when one exists. Pending items default to the latest pending version of each asset, with an option to reveal earlier pending versions. Completed and Deferred are separate; completion requires notes and an implementation reference tied to that version's hash. Subsequent edits create new pending versions. No history is deleted. Initial bootstrap imports existing saved records idempotently; older pre-tracker edits cannot be reconstructed beyond the retained snapshot files. The page refreshes on entry, after saves and every 15 seconds while visible. MCP `list_cat_asset_changes` / `get_cat_asset_change` provide read-only inspection.

The late 14 October audit freezes every local record under `user-sequences/refinements-2026-10-14-late`. The browser's 21×15 human Igloo Bed revision 2 was recovered through an explicit workspace JSON export because its draft had not reached shared storage. The recovered export and prior server workspace are retained. Done now flushes the prop save immediately and its status is visible at the top; Retry save is available. Local/hosted stores remain separate.

The catalogue includes all 22 reviewed saved sequences plus untouched original references and a separate mixed-origin front-leg phase proposal. The two faster user variants have identical pixel grids at this snapshot. The proposal shifts only x≥11, y≥19 front-leg cells by four frames around the eight-frame cycle; it retains the user's original rear legs/body/head and is a candidate, not normal locomotion. Sneaky and longer-stride walks remain future motion candidates; the normal planted four-frame stride clock is unchanged.

The runtime uses the three exact across-jump airborne grids on one continuous ballistic path, the expanded look-down enter/cycle/exit poses with per-frame rear support, additional ground head/elevated tail idles, loaf phases and the four-frame opt-in freefall test. The authored igloo renders on both home docks. Vertical jump drafts remain WIP. `LATEST_ASSET_REVIEW.md` records the reviewed assets. Original art, raw snapshots and provenance remain intact.

Rebuild the catalogue with `node scripts/build-studio-library.mjs` (includes the frozen latest overlays), runtime with `node scripts/build-roaming.mjs`, and Studio Worker with `node frame-studio/scripts/build.mjs`.

The shared Cat Workshop menu at the top links to Props lab, gaze testing and all local roaming fixtures, plus the behaviour map and changes page. The fixtures use the gaze-lab server on port 8769 (`npm run gaze:lab`); Frame Studio remains on 8767. The single menu source is `dist/lab-nav.js`, isolated from page styles with a shadow root and embedded by the Studio build.

## Independent animation tracks

Box-select a tail/head/etc. region, expand Independent animation tracks and choose Make track from selection. Refine the cell mask with left/right painting, choose source frames and independent holds/rates, and use seed/solo/mute to review combinations. Ordinary painting remains the default; solo composition applies during cycle frames, while enter/exit keep their exact original grids. One driver owns paw/support contacts; masks cannot overlap or move those markers. A head mask covering gaze must explicitly own it.

Tracks are additive project metadata: source frames, origin and lineage remain intact. Undo and locked-frame guards apply. Whole-sequence mirror transforms masks/events too; moving a complete mask across all its source frames retains membership, while partial moves fail atomically. Duplicate and sequence JSON export/import retain track IDs/references and ancestry. Runtime consumers without track support can still use the original flat frames. The first derived post-scratch pilot is documented in [its exact source record](user-sequences/animation-tracks-2026-10-17/README.md); broad sequence splitting remains a selective audit, not an artwork migration.

**Age eligibility and behaviour tags:** Notes & sequence settings now provides Kitten/Adult/Senior checkboxes (all active by default) and optional comma-separated tags. Metadata autosaves and survives JSON export/import without altering artwork/provenance. Exact-version review is still required for runtime integration; required core motion needs a compatible fallback before restricting ages. [Shared policy contract](../docs/design/LIFE_STAGES_AND_SETTLING.md#shared-sequence-policy-contract).
