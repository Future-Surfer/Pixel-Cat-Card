# Studio integration contract

## Retrieve exact saved work

- Discover read-only Studio MCP tools: list saved projects, then retrieve the named project/output; use `get_saved_cat_props` for props and `list_cat_asset_changes` → `get_cat_asset_change` for pending versions.
- Local Studio 8767 and hosted MCP storage can differ. Compare the user's current saved store with the requested immutable snapshot before editing. Loaded WebMCP outputs may represent a different draft. Never silently replace newer work.
- Hosted Studio deployment is optional and separately configured. Preserve its access controls; keep service tokens out of URLs, source, browser code and output.
- Ready means handed off, not automatically approved/installed. Check 24×24 pixels, facing, enter/cycle/exit, holds, anchors/gaze/POI/tracks and notes. Inherited descriptions may be stale.

- Climb workbench saves are `kind: climb` in local 8767 `/api/changes`, not ordinary sequence projects. Read the exact journal snapshot or 8769 `/api/climb-drafts/climb-main`; history and exact versions are under `/history` and `/versions/<hash>`. Hosted storage may not contain them. Preserve contact/gain/config metadata and browser-only WIP; QA draft journals are separate.

- Climb snapshots may include `rotations.front/back` and `centred.front/back` clips and a pending `defaultProposal`. Review every clip and exact proposal values/system baseline/units/source version; proposals are not automatically adopted defaults or completed receipts. QA submissions remain separate.

## Preserve work and provenance

- Preserve human/AI/mixed origin, stable IDs, saved hashes and immutable history.
- Props: preserve revision/source lineage, dimensions, RGB colours, notes/tags and originals/variants. Dirty canvas placements are WIP; never bake reference-cat placement into props.
- `preferredNeighbours.before/after` contains advisory project IDs. Resolve display names, retain missing links and optional alternatives; never turn it into an allowed-next whitelist or forced script.

## Receipts

- Complete only the exact version actually integrated, tested and verified, with implementation/build reference and notes. A receipt never covers a later hash.
- Defer future/WIP variants. Preserve completed history and older pending versions hidden by the UI's latest-per-asset filter.
- API receipt: `/api/changes/<id>` requires `versionHash`, `status`, `notes`, `reference`.
