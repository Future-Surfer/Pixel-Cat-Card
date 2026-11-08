# Pixel Cat Card 1.0.0-rc.1

Release candidate for the independent roaming Pixel Cat companion. This is not the first stable release.

## Before updating

- The consumer package is now one `pixel-cat-card.js` file. Do not load it alongside the six separate roaming modules; follow the migration guide and retain exact resource backups.
- Keep existing `custom:pixel-cat-home` YAML and cat IDs. Legacy Stick Pet/Pixel Pet elements remain in this transitional bundle.
- Hard reload each browser/Companion client after changing resources.
- HA 2026.11+ is the candidate target. Older HACS/HA versions are not yet validated.

## Included

Independent cats, quiet rest, optional social/toy play, carrying, igloo/open beds, posts, life stages, configurable settling and the existing editor/diagnostics. Artwork and provenance are unchanged by packaging. The concise README includes a staged orange-cat routine GIF; technical details and authoring tools have their own guide. Intermediate runtime files are no longer tracked at the repository root.

## Validation and limits

The release workflow rebuilds twice, runs all suites and checks generated-file drift. Browser and Marketplace installation evidence must be recorded before promoting the candidate. Physical-device performance and catalog acceptance are not implied by a successful package build. Procedural cat trees remain lab-only.

The clean repository is public and Marketplace plugin validation passes. The original repository/history, private stores, attachments and uncleared reference images remain private. Manual HA migration to the single bundle is verified; Marketplace installation/update/removal/rollback acceptance remains a prerelease gate.
