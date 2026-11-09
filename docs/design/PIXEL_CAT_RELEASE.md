# Pixel Cat Card release plan

Updated 9 November 2026. [ROADMAP](../../ROADMAP.md#release-and-maintenance) owns priority and SHIP IDs; this document owns release gates.

## Settled decisions

- Product: Pixel Cat Card. Public repository: `Future-Surfer/Pixel-Cat-Card`, created from reviewed current files with a fresh root. The original repository/history remains private and unrenamed.
- One installable file: `dist/pixel-cat-card.js`. Existing `custom:pixel-cat-home` YAML and options stay valid. Older card types remain internal compatibility code, without separate resource registrations.
- HA 2026.11+ candidate target. The single-file package has exact readback and browser evidence on HA; this is separate from Marketplace installation acceptance.
- Public main requires PRs, successful build/tests and Marketplace validation, resolved conversations and linear history. Force pushes/deletion are blocked. Public plugin validation and discovery topics are in place.
- Consumer README stays short with a scripted cat/environment GIF. Configuration, development and optional Studio tools have separate documentation. Media choreography does not change autonomous cat behaviour or artwork provenance.

## Remaining release sequence

1. After protected-main checks pass, tag the tested `package.json` version and run **Prepare release**. Confirm the draft's bundle, manifest and checksum match the tagged build before publishing as an opt-in prerelease. Preserve prior release assets and tags.
2. On an isolated Home Assistant 2026.11+ instance, connect GitHub, add the custom repository as **Dashboard**, enable **Pre-release** and install. Record the version, served file checksum and exactly one registered module. Reload and check the card picker, save a companion, watch it move, and verify Pause/Resume and view return.
3. Test an upgrade and versioned cache with two installable versions. Check removal and reinstall, then restore the isolated instance's pre-upgrade backup and verify rollback. Capture installed bytes, registration and saved YAML at each step. Keep the live dashboard out of this test. [Marketplace version and backup guidance](https://www.home-assistant.io/integrations/marketplace/#installing-another-version).
4. Address failures through tested PRs and fresh versions. Publish the first stable release as a regular GitHub release after acceptance and green validation. Recheck the stable release asset and clean-install path. Preserve old assets and tags for rollback.

## Catalog submission

Home Assistant 2026.11 includes Marketplace. The default catalog still lives in [hacs/default](https://github.com/hacs/default), whose default branch is `master`.

1. Recheck [catalog guidance](https://contributors.home-assistant.io/marketplace/guides/catalog/) and the [current PR template](https://github.com/hacs/default/blob/master/.github/PULL_REQUEST_TEMPLATE.md). Confirm there is no existing listing or open submission.
2. Confirm the public repo is active with a description, topics, issues, MIT license, an illustrated README, and a working custom-repository install. Keep the link to the full release and the exact green [Marketplace validation](https://github.com/Future-Surfer/Pixel-Cat-Card/actions/workflows/marketplace.yml) run with zero ignored checks. Hassfest and integration branding are for integrations.
3. From the owner's or major contributor's personal GitHub account, fork `hacs/default` and branch from its current `master`. Add only `Future-Surfer/Pixel-Cat-Card` to [`plugin`](https://github.com/hacs/default/blob/master/plugin), in alphabetical order. Validate the JSON and keep the diff to one entry.
4. Open the PR against `hacs/default:master`, allow maintainer edits and complete the template with the release and workflow-run links. Mark the integration-only items as inapplicable and leave reviewer assignment to the maintainers.
5. Follow the automated checks and maintainer feedback. After merge and the next catalog refresh, verify the card appears in Marketplace search. In the meantime, the README links to custom-repository installation.

## Preservation and rollback

Keep the original Git repository, old HA files and targeted rollback copies private and intact. Exclude personal dashboards/stores, historical attachments, deployment identity and uncleared reference images from public contents. No history rewrite or original-repository publication is part of this plan.

For resource rollback, re-read current state and restore only affected backed-up bodies/URLs through the resource API; verify hashes and reload clients. Deleting a registration assigns a new ID when recreated, so record the mapping. A full HA archive restore is a separate, explicitly confirmed operation.

[Installation and migration](../guides/PIXEL_CAT_INSTALL.md) · [Technical details](../TECHNICAL_DETAILS.md).
