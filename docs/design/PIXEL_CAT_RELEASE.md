# Pixel Cat Card release plan

Updated 8 November 2026. [ROADMAP](../../ROADMAP.md#release-and-maintenance) owns priority and SHIP IDs; this document owns release gates.

## Settled decisions

- Product: Pixel Cat Card. Public repository: `Future-Surfer/Pixel-Cat-Card`, created from reviewed current files with a fresh root. The original repository/history remains private and unrenamed.
- One installable file: `dist/pixel-cat-card.js`. Existing `custom:pixel-cat-home` YAML and options stay valid. Older card types remain internal compatibility code, without separate resource registrations.
- HA 2026.11+ candidate target. The single-file package has exact readback and browser evidence on HA; this is separate from Marketplace installation acceptance.
- Public main requires PRs, successful build/tests and Marketplace validation, resolved conversations and linear history. Force pushes/deletion are blocked. Public plugin validation and discovery topics are in place.
- Consumer README stays short with a scripted cat/environment GIF. Configuration, development and optional Studio tools have separate documentation. Media choreography does not change autonomous cat behaviour or artwork provenance.

## Remaining release sequence

1. Review the immutable `v1.0.0-rc.1` draft: built file, manifest and checksum assets must match the tested commit. The prepared assets already match the tested local hashes.
2. Publish an explicitly opt-in prerelease. Draft releases are not discoverable by Marketplace; do not claim they can be installed there. Keep the RC label and known limits clear.
3. On an isolated instance, test fresh Marketplace installation, upgrade/versioned caching, removal/reinstall and rollback. Keep exact resource/configuration backups; verify unrelated configuration and real browser behaviour after each step. Do not use the owner's live dashboard as the installation experiment.
4. Address acceptance failures through tested PRs and a new candidate version. Never replace an existing version's assets or move its tag.
5. Promote a stable release only after acceptance. Catalog submission to `hacs/default` is a separate step; custom-repository support does not imply catalog inclusion.

## Preservation and rollback

Keep the original Git repository, old HA files and targeted rollback copies private and intact. Exclude personal dashboards/stores, historical attachments, deployment identity and uncleared reference images from public contents. No history rewrite or original-repository publication is part of this plan.

For resource rollback, re-read current state and restore only affected backed-up bodies/URLs through the resource API; verify hashes and reload clients. Deleting a registration assigns a new ID when recreated, so record the mapping. A full HA archive restore is a separate, explicitly confirmed operation.

[Installation and migration](../guides/PIXEL_CAT_INSTALL.md) · [Technical details](../TECHNICAL_DETAILS.md).
