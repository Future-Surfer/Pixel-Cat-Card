# Current state

Updated 17 November 2026.

Pixel Cat Card is public at `Future-Surfer/Pixel-Cat-Card`. The clean repository has no original private Git history. Main requires pull requests and passing build/test and Marketplace validation; force pushes and branch deletion are blocked.

The current stable release is v1.0.0. [v1.1.0-rc.1](https://github.com/Future-Surfer/Pixel-Cat-Card/releases/tag/v1.1.0-rc.1) includes the newer editor, furniture, traversal and Behaviour Lab features. It removes both executable legacy cards and the Pixel Pet editor. The original artwork used by the modern card and Studio now builds from data-only source. Continue feature work from public main, which includes the [release candidate source](https://github.com/Future-Surfer/Pixel-Cat-Card/pull/31).

The candidate passed 124 suites, reproducible builds and Marketplace validation. A real Marketplace upgrade from v1.0.0 installed the exact release asset, retained one Marketplace resource alongside the existing dev resource, and preserved the tested dashboard configuration. Browser checks covered both existing release cats, Pause/Resume and view return. Isolated clean install, uninstall/reinstall and backup restore are open. The v1.1.0 source and release notes include the Dev-previewed editor layout and Light grey preset, plus reservation cleanup when a cat leaves Chase focus. Cross-card pursuit uses each cat’s Chasing setting and observed crossings. The other cat can carry on independently. Verify and publish v1.1.0 before updating the [catalog review](https://github.com/hacs/default/pull/13826). See the [release plan](design/PIXEL_CAT_RELEASE.md).

Release presentation work shortens the consumer README, adds a staged GIF and repeatable media queue, and removes generated runtime files from the tracked root. Source artwork and runtime behaviour are unchanged. Use [technical details](TECHNICAL_DETAILS.md) for layout and tooling, [development](DEVELOPMENT.md) for operating procedures and [roadmap](ROADMAP.md) for priorities.

Live stores, personal dashboards/backups, deployment identities, historical attachments and uncleared reference images remain outside this repository. Never infer an artwork receipt for a different saved version.
