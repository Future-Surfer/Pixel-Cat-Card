# Studio refinement — scratching-post cap

Integrated and verified **17 October 2026**. The local Studio catalogue and journal matched this exact revision-3 snapshot; hosted MCP storage had no matching props/change. Home and loose posts now use it. See the [exact-version completed receipt](integration-receipt.json) and newest project checkpoint (development reference retained privately).

The historical folder name and original read-only journal export remain unchanged. That export records the earlier pending state; the separate receipt records completion. All 907 other journal entries/receipts, including earlier pending versions, and the complete saved props workspace were verified unchanged. No newer saved cap revision existed at integration.

- Asset: proposal-scratching-post-rope, “Scratching post · rope”, revision 3, 12×23, mixed origin.
- Saved: 2026-10-17T14:49:29.095Z.
- Change ID: 631b1ac1b9d0de7d190a00b4e6079d47a2c0b6bec37a595ffa4d8134abc50f53.
- Version hash: 99334bf77e523fcc7fe20897f36a299caab6e7815cdf511fcb1816c2310b0f88.
- Exact read-only journal response: [scratching-post-change.json](scratching-post-change.json).
- Runtime baseline: [approved-scratching-post.json](../review-2026-10-17/approved-scratching-post.json).

Pixel comparison confirms four removals at zero-based (3,1), (8,1), (3,2), (8,2). This narrows the wooden cap to the rope width. Other pixel cells are unchanged. The title was also changed; inherited AI-draft notes/tags may be stale. Preserve mixed origin and stable asset identity.

## Original retrieval and integration handoff

Read frame-studio/AGENTS.md and the artwork workflow in DEVELOPMENT.md. Retrieve the current saved catalogue and exact change through read-only MCP first, checking the storage instance. In this session the hosted connector returned no props/changes while the local Studio contained the user's edits. Local Studio at http://127.0.0.1:8767/ is authoritative for this refinement: GET /api/props-workspace and GET /api/changes/<change ID>. Live data in ignored .studio-data is separate from hosted storage and Git. Do not overwrite canvas drafts, rerun proposal generators or assume an empty hosted result means there is no work.

Compare the current local revision/hash to this snapshot, inspect the four cap pixels and briefly report what changed. If a newer revision exists, inspect it separately rather than replacing it with this export. Integrate the deliberate reviewed version through curated source snapshots/build selectors; preserve dimensions, scratch-face geometry, palette metadata and provenance. Do not mark the journal completed merely because this export is in Git. After build/tests, visual verification and scoped HA readback, complete only the exact integrated hash with an implementation/build reference. Leave newer revisions pending.

## MCP and browser testing handoff

Discover available Home Assistant MCP tools and read the server's matching SKILL.md and referenced dashboard/resource guidance before performing matching HA operations. Use MCP to freshly retrieve dashboard-testing and list/get resources; never rely solely on historical resource IDs. Back up only resources being changed, deploy only generated changed modules, read them back and compare exact content. Keep inline modules below 128,000 bytes. Do not replace the dashboard from an old export or touch internal .storage files. Preserve unrelated YAML and credentials; never print tokens.

Use the browser-control tool to claim the existing HA tab by its observed URL and inspect the real dashboard. Current test views are http://YOUR_HA_HOST:8123/dashboard-testing/cat-playground and /dashboard-testing/cat-stress-test. Read browser API documentation before interaction. Verify the cap at both home and loose posts, both facings, scale and planted scratching contacts. Controlled fixtures are served by npm run gaze:lab on http://127.0.0.1:8769/; the common menu includes Bed visits and Local exploring & gaits. They exercise real modules but are not complete HA emulation. Studio runs with npm run studio on port 8767; restart after rebuilding embedded assets. Do not alter user artwork to test it.

Run npm run build:roaming and relevant regression suites, then npm test for runtime changes (checkpoint: 72/72). Use the shared monitor/diagnostic traces for performance, distinguishing startup, background tabs and steady foreground samples. Browser checks cannot establish physical mobile smoothness; report that limitation. Record exact evidence in docs/history/PROJECT_STATUS.md, update docs/FEATURES.md for changed behavior and ROADMAP.md only for remaining tasks.
