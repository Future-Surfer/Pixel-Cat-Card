# Current state

Updated 8 November 2026.

Pixel Cat Card `1.0.0-rc.1` is public at `Future-Surfer/Pixel-Cat-Card`. The clean repository has no original private Git history. Main requires pull requests and passing build/test CI; force pushes and branch deletion are blocked.

The single-file package is `dist/pixel-cat-card.js`. It has been manually deployed to HA 2026.11 with exact HTTP readback, one registered bundle, unchanged dashboard configuration, functional modern/legacy cards, Pause/Resume and view return. Other clients must reload. Tag `v1.0.0-rc.1` has a verified draft release with three matching assets. Publishing that opt-in prerelease precedes isolated HACS/Marketplace install/update/removal/rollback acceptance; catalog inclusion is separate.

Release presentation work shortens the consumer README, adds a staged GIF and repeatable media queue, and removes generated runtime files from the tracked root. Source artwork and runtime behaviour are unchanged. Use [technical details](TECHNICAL_DETAILS.md) for layout and tooling, [development](../DEVELOPMENT.md) for operating procedures and [roadmap](../ROADMAP.md) for priorities.

Live stores, personal dashboards/backups, deployment identities, historical attachments and uncleared reference images remain outside this repository. Never infer an artwork receipt for a different saved version.
