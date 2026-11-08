# Current state

Updated 8 November 2026.

Pixel Cat Card `1.0.0-rc.1` is being prepared for public release. This clean source candidate starts a new Git history. Publication and Marketplace installation acceptance are pending; no stable-release or Marketplace acceptance claim is made.

The single-file package is `dist/pixel-cat-card.js`. It retains the existing companion configuration, legacy card registrations and unchanged runtime artwork. Use [installation and rollback instructions](guides/PIXEL_CAT_INSTALL.md); do not load it alongside the six roaming modules.

Runtime and package tests cover the source behaviour, deterministic packaging and compatibility guards. Actual-device performance, Marketplace install/upgrade/removal and scoped rollback remain release acceptance checks. Lab-only procedural cat trees are outside the default companion.

The repository includes curated Studio snapshots and exact-version provenance. Live Studio stores, deployment identities, personal dashboards, historical attachments and uncleared reference images are excluded. Never infer a new artwork receipt from an older version.

[Documentation router](README.md) · [Development](../DEVELOPMENT.md) · [Roadmap](../ROADMAP.md) · [Features](FEATURES.md).
