# Behaviour Lab edge scratching

20 November 2026. Local implementation; no HA deployment or new published release.

- Added **Scratch card edges** using the existing vertical-scratch reservation, route, animation and contact events. Climbing can remain off. Attempts, declines, completion and interruption are distinct; completion needs authored paw contact and a finished bout.
- Cached panel checks reject unavailable material, clipping, covered controls, excluded homes and unsupported transforms. Rounded-corner fit uses the authored claw-event heights. Active clocks preserve Pause/hidden/layout suspension; focus change or last-lab removal releases even paused actors. Cleanup preserves newer routes and normal in-flight landing.
- Moved clock freezing into the existing playback-policy helper and packaged the lab approach beside the new lab focus. All resource modules remain below 128000 bytes. Decoded artwork and extras data hashes match the preceding build; source artwork, receipts and approved README GIFs are unchanged.
- Validation: 131 Node suites; eight packaged Chromium journeys at desktop/narrow widths (16 checks); two reproducible full builds; release-integrity snapshot `snapshot-2756eb22c9f3fad9`; local documentation links and diff whitespace. New focused checks include eight body scales/both facings, actual paw contact, return-route and reservation guards, declines, rounded corners, interruption, view isolation and paused cleanup.
- Raw local reports and browser screenshots/traces remain in ignored `.release/diagnostics/edge-final-*` and `.test-artifacts/` paths. Real HA layouts and physical devices remain separate acceptance. Isolated installation/restore checks remain deferred by owner decision.

[Runtime contract](../design/VERTICAL_SURFACE_TRANSFERS.md#behaviour-lab-edge-scratching) · [Four proposed scratch variants](../design/SEQUENCE_VARIETY_IDEAS.md). Future feature work should continue that concrete sequence intake without treating ideas as approved assets.
