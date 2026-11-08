# Refined front-centred climb baseline

- Owner-approved for the **climb lab baseline**, 20 October 2026. Runtime climbing remains gated on the broader route/lifecycle review.
- [front.json](front.json) captures the exact seven-frame clip from local saved version `38396990481a167e20c75b3f311b9ed750924d0c50345ef1bf01c59b35537881`. Its clip digest covers pixels, depth, timing, contacts, anchors, provenance and notes; no cells or metadata were repaired automatically.
- New centred drafts clone this baseline. Existing saved clips are preserved. The workbench recognises exact baked frames; later edits do not inherit that status.
- At the owner's explicit request, the behind version copies the same cells, timing, contacts and registration, reversing near/far depth. Earlier behind experiments remain in immutable local history rather than being merged into the new basis. Stable behind IDs and source lineage are retained.
- Live update `04f30ff3ec2ae5f5767e46773d34b079cbf398b2604d487edf87f7a9ca2329e9` changes only the behind clip. The front, other clips, notes and saved tuning remain exact.
- Whole-workbench journal receipts remain pending because this is a scoped front-baseline adoption, not approval or HA integration of all artwork in that snapshot. The new behind clip remains a review draft.
- Verification: exact clip digest; all seven front frames/contact guides pass strict validation; behind cells/anchors/paws/timing/gain/provenance match front exactly. Chrome recognises the baked front, plays both variants with no contact warnings/errors, and saves the exact behind update. Local 101/101 suites and reproducible builds pass; release remains `snapshot-82871fe68cfe0a88`.
