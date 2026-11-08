# Pixel Cat Card release preparation

Plan approved for implementation, 8 November 2026. Packaging, private-folder exclusions, support/CI scaffolding and real habitat media are prepared; public installation and publication gates remain open. Checkpoint and privacy blocker (development reference retained privately). [ROADMAP](../../ROADMAP.md#release-and-maintenance) owns priority and SHIP IDs; this document owns the release sequence and acceptance gates.

## Intended release

| Item | Proposed decision |
| --- | --- |
| Product | Pixel Cat Card |
| Repository | Rename the existing repository to `Future-Surfer/Pixel-Cat-Card`, retaining history, issues and identity |
| Public card type | Keep `custom:pixel-cat-home`; branding does not require YAML migration |
| Installable file | `pixel-cat-card.js`, built to a dedicated `dist/` directory and attached to each release |
| Distribution | Home Assistant Marketplace Dashboard/plugin; retain older HACS compatibility only where tested |
| First candidate | `v1.0.0-rc.1` GitHub pre-release; stable `v1.0.0` only after the release gates pass |
| Runtime dependencies | No Node server, Studio, model/API connection or source build required by users |

New cat-tree behaviour, resident rosters, further artwork and broad runtime redesign are outside this release preparation. Existing experiments can remain opt-in and clearly labelled. Frame Studio remains an authoring tool, outside the installed card artifact.

## Observed blockers

- Remote default branch `main` is at `9431a2e`, with the old Stick Pet README and a manifest installing `stick-pet-card.js`. Current development is `7769ce9` on `codex/dashboard-roaming`. Local `main` is an ancestor of development; remote reconciliation must still use fresh refs.
- Development's `hacs.json` names Pixel Pet Card and installs `pixel-pet-card.js`, which also does not deliver the roaming Pixel Cat runtime.
- The current README screenshot is present in Git, but is a 16 October showcase capture with prominent diagnostics. New documentation/screenshots are not on the default branch.
- No remote version tags were returned by the branch/tag inventory. Current CI verifies builds/tests and uploads a workflow artifact; it does not publish a consumer release or validate Marketplace packaging.
- The existing immutable package is a loader plus six modules. It is useful for development, inline compatibility and rollback, but is not yet the intended single-file consumer package.
- Private attachment and personal-notes directories remain untracked. They need explicit exclusion before broader staging operations; their contents must be preserved.

## Sequence and gates

### 1. Establish the Git baseline (SHIP-03/04)

Fetch fresh refs, reconcile the development work onto a release-preparation branch based on the intended `main`, and retain a named pre-release backup ref plus the exact currently deployed package. Preserve commit history and the earlier local-main change; use a reviewed PR rather than a force push or history rewrite. Confirm the clean checkout reproduces all generated files.

Add scoped ignore rules for private attachments/personal notes. Review the tracked file inventory for accidental data, credentials, large diagnostics and reference-art redistribution rights. Do not purge history or delete reference material as routine cleanup; handle any actual exposure separately. Keep legacy source and provenance evidence intact.

Use `main` as the stable default, short-lived feature branches and tagged versions for releases. Add PR/issue templates, contribution and security-reporting guidance, and ownership rules with the actual maintainer. Review branch protection and required checks against the repository's available GitHub features.

**Gate:** all intended source is preserved, private material is excluded, and a clean checkout builds/tests without generated drift. No release or install behaviour changes yet.

### 2. Fix distribution before switching the manifest (SHIP-01/02)

Produce one self-contained `dist/pixel-cat-card.js` from the authoritative module mapping. Preserve module scopes, execution order, public registrations and late-loading behaviour; do not concatenate unrelated module scopes blindly. Retain the existing six-module artifacts and inline guards as a separate supported developer/rollback path.

Make bundling reproducible; compare decoded artwork, extras and provenance against the current package. Include a visible version/build identifier and a useful configuration documentation link. Pin and document any build-only tooling; it must not become a user runtime dependency.

After the artifact passes tests, set the manifest's name to Pixel Cat Card and filename to `pixel-cat-card.js`, remove the current root-only discovery setting for the proposed `dist`/release-asset layout, and set a minimum HA version based on actual compatibility tests. Do not use dashboard-plugin ZIP installation as the baseline.

**Gate:** a fresh install obtains the exact release artifact, registers one resource and makes Pixel Cat available in the picker without manual six-module setup. Test the installed file, not only the source fixture.

### 3. Prepare the rename and legacy migration (SHIP-04)

Inventory existing `stick-pet-card` and `pixel-pet-card` consumers, resources, old install paths and store identity. Test what an update of this same repository does to their downloaded files. Decide the compatibility behaviour before changing the live manifest: preserve legacy registrations in a transitional build where practical; otherwise document an intentional breaking transition and a usable pinned legacy release. Retaining an old file in Git alone does not prove an installed upgrade will preserve it.

Keep `custom:pixel-cat-home`, cat IDs, YAML options, artwork IDs and Studio storage keys unchanged. Rename the existing GitHub repository only once the new packaging, redirects and migration documentation are reviewable. Update remotes, documentation URLs, badges, metadata, resource-path examples and workflow references together. Check old clone/repository links and new install links. Do not reuse the old repository name.

The local checkout folder can stay at its current path initially. If renamed later, stop relevant local servers first and update launch paths deliberately; never strand `.studio-data/`, ignored backups, attachments or browser outboxes.

**Gate:** clean install, old-card upgrade, current manual/inline migration, and rollback all work without duplicate resource registrations or lost user configuration. Catalog redirect handling is not proof that HA filesystem/resource URLs migrate safely.

### 4. Present the actual product (SHIP-01/04)

Rewrite README for users: concise description, real hero media, a few features, install badge/instructions, picker quick start, minimal YAML, upgrade/rollback and limitations. Link detailed configuration, support and developer/Studio documentation further down. Distinguish shipped features from lab work.

Capture a clean demonstration dashboard with the current release candidate and synthetic readings: desktop light/dark, phone layout, a readable cat/kitten close-up and the actual card editor. Add a short real-browser animation showing roaming, resting and optional play if capture quality/size are acceptable. Remove diagnostics/performance figures from the hero. Keep pixels crisp, add captions/alt text and verify images render on both GitHub and the Marketplace; never substitute generated interface artwork or publish personal dashboard data.

Review GitHub description, topics, issue reporting and license/artwork attribution. Explain that cats are decorative and do not operate entities, and that Studio is optional. Use the modern Marketplace installation route, with an explicitly tested HACS route for older HA versions.

**Gate:** a new user can understand the card visually and install it without reading development history or running Node.

### 5. Automate and rehearse releases (SHIP-01/02/03)

Keep current tests, reproducible builds and artwork checks. Add HACS validation with category `plugin`, with no ignored checks for catalog submission; validate README links/media and the exact manifest/artifact relationship. Update deprecated Actions, prefer pinned revisions with automated dependency updates, and minimise workflow permissions.

Create a versioned release workflow which builds from the reviewed commit, runs checks, and attaches `pixel-cat-card.js`, checksums and a concise build/provenance manifest to a draft GitHub release. Keep private stores, fixtures, Node tooling and authoring servers out of the downloadable artifact. Promoting a tested candidate should retain identical payload bytes; never silently replace an already published version's asset.

On an isolated HA environment test fresh Marketplace installation, prior-version update, versioned-resource caching, browser restart, uninstall/reinstall and rollback. Cover the current inline/manual installation separately. Use the picker, GUI editor and documented YAML; check browser errors and the installed version. Establish the supported HA/browser range through these tests, including actual mobile/Companion and PiDisplay checks where claimed. Retain reduced-motion and teardown checks.

**Gate:** passing clean-checkout CI, passing Marketplace validation, tested install/update/rollback evidence and a complete draft candidate release. No stable publication before these pass.

### 6. Publish a candidate, then stable and catalog submission

Publish `v1.0.0-rc.1` as an opt-in pre-release and test installation through a custom-repository link. After acceptance, publish the stable release with clear migration notes, screenshots, checksum and known limitations. Preserve earlier assets/releases for rollback.

Working custom-repository installation and default catalog inclusion are separate milestones. Submit the stable repository to `hacs/default` under `plugin` once the required checks and release are present; do not promise a catalog-review date. The same catalog serves Marketplace and HACS.

**Gate:** users can install the published release from the documented link; catalog submission is separately tracked through review. Capture final release SHA, version, payload hashes and rollback target in the current handoff.

## Rollback boundaries

Every stage should be a reviewable commit/PR. Packaging and branding changes can be reverted independently of runtime behaviour. Before any live install migration, save exact affected resource bodies/URLs and configurations, compare fresh state immediately before writing, and verify exact readback plus the real browser. Never roll back unrelated HA configuration or overwrite newer Studio/user work.

## Official references checked on 8 November 2026

- [Dashboard packaging and screenshots](https://contributors.home-assistant.io/marketplace/guides/dashboard/): one entry file, built assets, module resources and README imagery.
- [Manifest keys](https://contributors.home-assistant.io/marketplace/reference/hacs-json/): `filename`, root-only discovery and minimum-version behaviour.
- [Repository structure](https://contributors.home-assistant.io/marketplace/reference/repository-structure/): one installable item, root manifest and repository metadata.
- [Validation](https://contributors.home-assistant.io/marketplace/reference/validation/): `hacs/action` category `plugin`; `hassfest` concerns integrations rather than this frontend card.
- [Releases](https://contributors.home-assistant.io/marketplace/guides/releases/): published releases, opt-in pre-releases and retained rollback versions.
- [Catalog and install links](https://contributors.home-assistant.io/marketplace/guides/catalog/): custom repositories versus catalog review, Marketplace/HACS links and rename handling.
- [GitHub repository renaming](https://docs.github.com/en/repositories/creating-and-managing-repositories/renaming-a-repository): redirects, remote updates and the old-name reuse hazard.
