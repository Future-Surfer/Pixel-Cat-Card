# Current state

Updated 8 November 2026.

Pixel Cat Card is public at `Future-Surfer/Pixel-Cat-Card`. The clean repository has no original private Git history. Main requires pull requests and passing build/test and Marketplace validation; force pushes and branch deletion are blocked.

The single-file package is `dist/pixel-cat-card.js`. Manual Home Assistant deployment has been verified separately from Marketplace acceptance. The current release target is `v1.0.0-rc.2`, including the scratching tail and eating timing refinements. See the [release plan](design/PIXEL_CAT_RELEASE.md) for isolated Marketplace acceptance and the catalog handoff.

Release presentation work shortens the consumer README, adds a staged GIF and repeatable media queue, and removes generated runtime files from the tracked root. Source artwork and runtime behaviour are unchanged. Use [technical details](TECHNICAL_DETAILS.md) for layout and tooling, [development](../DEVELOPMENT.md) for operating procedures and [roadmap](../ROADMAP.md) for priorities.

Live stores, personal dashboards/backups, deployment identities, historical attachments and uncleared reference images remain outside this repository. Never infer an artwork receipt for a different saved version.
