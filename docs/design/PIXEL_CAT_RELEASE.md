# Pixel Cat Card release plan

Updated 20 November 2026. [ROADMAP](../ROADMAP.md#release-and-maintenance) owns priority and SHIP IDs; this document owns release gates.

## Settled decisions

- Product: Pixel Cat Card. Public repository: `Future-Surfer/Pixel-Cat-Card`, created from reviewed current files with a fresh root. The original repository/history remains private and unrenamed.
- One installable file: `dist/pixel-cat-card.js`. Existing `custom:pixel-cat-home` YAML and options stay valid. Since v1.1.0-rc.1 the package excludes both older card types and the Pixel Pet editor. The build retains the original artwork as data.
- Target Home Assistant 2026.11 or later. See [current state](../CURRENT_STATE.md) for the completed live upgrade and remaining isolated acceptance.
- Public main requires PRs, successful build/tests and Marketplace validation, resolved conversations and linear history. Force pushes/deletion are blocked. Public plugin validation and discovery topics are in place.
- Consumer README stays short with a scripted cat/environment GIF. Configuration, development and optional Studio tools have separate documentation. Media choreography does not change autonomous cat behaviour or artwork provenance.

## Remaining release sequence

Stable v1.1.0 is published and its live Marketplace upgrade is verified. [Publication evidence](../history/RELEASE_1_1_0_2026-11-18.md) records the exact asset hash and completed checks. This does not close isolated installation or restore acceptance.

**Deferred by owner decision, 20 November 2026:** do not create a second Home Assistant instance for now. Steps 1–2 below are retained for a future revisit, with no scheduled date; they do not block feature development. Record these checks as untested in release evidence until performed. Reassess the remaining acceptance gaps when preparing the next release.

1. When this work is resumed, identify a disposable Home Assistant 2026.11+ instance with separate configuration/storage and no live device credentials or automations. Follow the [isolated acceptance checklist](../guides/ISOLATED_RELEASE_ACCEPTANCE.md). No suitable instance is recorded yet.
2. Verify a clean Marketplace install of the published stable release, then an upgrade between two existing installable versions. Capture installed bytes, versioned registration and saved YAML at each checkpoint. Test removal/reinstall and an explicitly confirmed restore of the isolated instance's pre-upgrade backup. Keep the live dashboard out of this test.
3. Address failures through tested PRs and fresh versions. For the next release, tag a tested, unused `package.json` version after protected-main checks pass and run **Prepare release**. Verify the draft's bundle, manifest and checksum against the tagged build before publishing an opt-in prerelease. Repeat relevant acceptance before stable publication; preserve existing release assets and tags.

## Catalog submission

The default catalog lives in [hacs/default](https://github.com/hacs/default) on `master`. [Pixel Cat Card’s catalog PR](https://github.com/hacs/default/pull/13826) was marked ready and followed up on 18 November; formal reviewer assignment requires upstream permissions. [The dated record](../history/RELEASE_1_1_0_2026-11-18.md) owns that evidence. Check its fresh status before further action, and add isolated acceptance evidence when available.

1. Recheck [catalog guidance](https://contributors.home-assistant.io/marketplace/guides/catalog/) and the [current PR template](https://github.com/hacs/default/blob/master/.github/PULL_REQUEST_TEMPLATE.md). Confirm whether a listing or submission already exists.
2. Confirm the public repo is active with a description, topics, issues, MIT license, an illustrated README, and a working custom-repository install. Keep the link to the full release and the exact green [Marketplace validation](https://github.com/Future-Surfer/Pixel-Cat-Card/actions/workflows/marketplace.yml) run with zero ignored checks. Hassfest and integration branding are for integrations.
3. From the owner's or major contributor's personal GitHub account, fork `hacs/default` and branch from its current `master`. Add only `Future-Surfer/Pixel-Cat-Card` to [`plugin`](https://github.com/hacs/default/blob/master/plugin), in alphabetical order. Validate the JSON and keep the diff to one entry.
4. Open the PR against `hacs/default:master`, allow maintainer edits and complete the template with the release and workflow-run links. Mark the integration-only items as inapplicable and leave reviewer assignment to the maintainers.
5. Follow the automated checks and maintainer feedback. After merge and the next catalog refresh, verify the card appears in Marketplace search. Keep **Add from link** available in the README until catalog search is verified.

## Preservation and rollback

Keep the original Git repository, old HA files and targeted rollback copies private and intact. Exclude personal dashboards/stores, historical attachments, deployment identity and uncleared reference images from public contents. No history rewrite or original-repository publication is part of this plan.

For resource rollback, re-read current state and restore only affected backed-up bodies/URLs through the resource API; verify hashes and reload clients. Deleting a registration assigns a new ID when recreated, so record the mapping. A full HA archive restore is a separate, explicitly confirmed operation.

[Installation and migration](../guides/PIXEL_CAT_INSTALL.md) · [Technical details](../TECHNICAL_DETAILS.md).
