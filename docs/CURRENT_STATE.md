# Current state

Updated 20 November 2026.

Pixel Cat Card is public at `Future-Surfer/Pixel-Cat-Card`. The clean repository has no original private Git history. Main requires pull requests and passing build/test and Marketplace validation; force pushes and branch deletion are blocked.

The v1.1.0 release combines the newer editor, furniture, independent chasing and Behaviour Lab features. Both executable legacy cards and the Pixel Pet editor are removed. Original artwork is preserved as data. Source and generated bundle live on public main.

Stable [v1.1.0](https://github.com/Future-Surfer/Pixel-Cat-Card/releases/tag/v1.1.0) is published. All 124 suites, reproducible packaging and Marketplace validation passed. The final Marketplace upgrade matched the published checksum, preserved dashboard configuration and unrelated resources, and passed browser control/navigation checks. The [catalog submission](https://github.com/hacs/default/pull/13826) is ready for review with a follow-up to Frenck; formal reviewer assignment requires upstream permissions. Isolated clean install, uninstall/reinstall and backup restore remain open. See [release verification](history/RELEASE_1_1_0_2026-11-18.md).

Release presentation work shortens the consumer README, adds a staged GIF and repeatable media queue, and removes generated runtime files from the tracked root. Source artwork and runtime behaviour are unchanged. Use [technical details](TECHNICAL_DETAILS.md) for layout and tooling, [development](DEVELOPMENT.md) for operating procedures and [roadmap](ROADMAP.md) for priorities.

Active [PR #39](https://github.com/Future-Surfer/Pixel-Cat-Card/pull/39) adds the two approved README GIFs and a test-hardening follow-up: safe social-pause endpoints and preserved manual Pause on cached reconnect. Local checks pass: 130 Node suites, 12 Chromium journeys at desktop/narrow widths, five interaction seeds, reproducible builds and release integrity. [Coverage, replay commands and explicit gaps](DEVELOPMENT.md#test-coverage-and-failure-replay). Verify GitHub checks for the latest head before merging; no new Home Assistant deployment is implied.

Live stores, personal dashboards/backups, deployment identities, historical attachments and uncleared reference images remain outside this repository. Never infer an artwork receipt for a different saved version.
