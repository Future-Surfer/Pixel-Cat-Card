# Current state

Updated 20 November 2026.

Pixel Cat Card is public at `Future-Surfer/Pixel-Cat-Card`. The clean repository has no original private Git history. Main requires pull requests and passing build/test and Marketplace validation; force pushes and branch deletion are blocked.

The v1.1.0 release combines the newer editor, furniture, independent chasing and Behaviour Lab features. Both executable legacy cards and the Pixel Pet editor are removed. Original artwork is preserved as data. Source and generated bundle live on public main.

Stable [v1.1.0](https://github.com/Future-Surfer/Pixel-Cat-Card/releases/tag/v1.1.0) is published. All 124 suites, reproducible packaging and Marketplace validation passed. The final Marketplace upgrade matched the published checksum, preserved dashboard configuration and unrelated resources, and passed browser control/navigation checks. The [catalog submission](https://github.com/hacs/default/pull/13826) is ready for review with a follow-up to Frenck; formal reviewer assignment requires upstream permissions. Isolated clean install, uninstall/reinstall and backup restore remain open. See [release verification](history/RELEASE_1_1_0_2026-11-18.md).

Release presentation work shortens the consumer README, adds a staged GIF and repeatable media queue, and removes generated runtime files from the tracked root. Source artwork and runtime behaviour are unchanged. Use [technical details](TECHNICAL_DETAILS.md) for layout and tooling, [development](DEVELOPMENT.md) for operating procedures and [roadmap](ROADMAP.md) for priorities.

[PR #39](https://github.com/Future-Surfer/Pixel-Cat-Card/pull/39) merged as `acbdc1f` after green Marketplace validation, build/test, Linux browser and Windows replay checks. It adds the two approved README GIFs, safe social-pause endpoints and preserved manual Pause on cached reconnect. Local checks passed: 130 Node suites, 12 Chromium journeys at desktop/narrow widths, five interaction seeds, reproducible builds and release integrity. [Coverage, replay commands and explicit gaps](DEVELOPMENT.md#test-coverage-and-failure-replay). These changes are not a new published release or Home Assistant deployment.

Next release acceptance uses the [isolated execution checklist](guides/ISOLATED_RELEASE_ACCEPTANCE.md). A separate instance is not yet identified; clean install, removal/reinstall and native backup restore remain untested. The environment choice is pending with the owner. The connected live instance has not been changed for these checks.

Live stores, personal dashboards/backups, deployment identities, historical attachments and uncleared reference images remain outside this repository. Never infer an artwork receipt for a different saved version.
