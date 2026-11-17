# Security

Pixel Cat Card runs as frontend JavaScript inside Home Assistant. It is decorative and does not call HA services or operate entities. Only install release files from this repository or the linked Marketplace entry.

For a suspected vulnerability, use this repository's **Security → Report a vulnerability** when available. If private reporting is unavailable, open an issue requesting a private reporting channel without posting exploit details, credentials or personal dashboard data. The maintainer will arrange a private channel before requesting details. Do not send tokens or complete HA backups.

The v1.0.0 bundle includes two legacy card renderers that can interpret dashboard configuration as markup. Upgrade to v1.1.0-rc.1 or later and remove any separately registered Stick Pet or Pixel Pet resources. Follow the [installation and migration guide](guides/PIXEL_CAT_INSTALL.md) to enable prereleases and update.

Report ordinary animation or configuration problems through the bug template.
