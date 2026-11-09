# Pixel Cat Card installation and migration

Pixel Cat Card targets Home Assistant 2026.11 and later.

## Marketplace

Use the [Marketplace link](https://my.home-assistant.io/redirect/marketplace_repository/?owner=Future-Surfer&repository=Pixel-Cat-Card&category=plugin) or add `Future-Surfer/Pixel-Cat-Card` under **Settings → Marketplace → ⋮ → Custom repositories**, with category **Dashboard**. Connect GitHub if prompted. Enable **Pre-release** on the repository page to try a release candidate, then install it and refresh the dashboard.

For dashboards with storage-mode resources, Marketplace registers the JavaScript module automatically. In YAML resource mode, add `/local/community/pixel-cat-card/pixel-cat-card.js` as a module in the Lovelace resources configuration and version its URL when updating. If you already have a manually registered copy, back it up and remove its registration when switching to Marketplace so only one bundle loads.

## Package

`dist/pixel-cat-card.js` is the sole entrypoint. `dist/SHA256SUMS` and `dist/pixel-cat-card.manifest.json` identify its exact bytes, version and source modules. Its strict module scopes preserve the existing runtime order; transitional Stick Pet/Pixel Pet elements are included without changing their sources. Node/Studio are build/authoring tools, not runtime requirements.

For manual installation, download `pixel-cat-card.js` from [GitHub Releases](https://github.com/Future-Surfer/Pixel-Cat-Card/releases). Copy it into HA `/config/www/` and register `/local/pixel-cat-card.js` as a JavaScript module. Change the URL or its version query parameter on each update to avoid a stale browser cache. Keep the previous release file for rollback.

## Existing six-module or inline installation

1. Read the current six resource registrations. Save exact bodies/URLs, IDs and hashes locally; record every affected dashboard configuration before any card change. Preserve unrelated resources and configuration.
2. Put the verified bundle at a new versioned file path. Compare its complete readback/hash with the release asset.
3. Re-read the affected resources and compare against the backups. Replace their six registrations with one bundle entry using the resource API; preserve ordering/IDs in the rollback record. Never edit HA `.storage` files.
4. Hard reload a real browser and verify the picker/editor, ordinary motion, home, Pause/Resume, optional play, view return and console errors. Cat IDs/options remain unchanged. Refresh all other clients too.
5. If verification fails, re-read current state, restore only the exact affected resource registrations/bodies, then hard reload and verify. Keep the candidate file for diagnosis; do not restore unrelated dashboard configuration.

Registering both the bundle and a separate roaming runtime is unsupported. The bundle warns and refuses to replace an already registered roaming element. This is a diagnostic guard, not a substitute for a clean resource migration.

## Legacy cards

The candidate still registers `custom:stick-pet-card`, `custom:pixel-pet-card` and the latter's editor. They remain usable by existing YAML, while the picker promotes Pixel Cat Card. Unit checks verify legacy class identity when the old Pixel Pet resource loaded first. Test the store's real update/resource-path behaviour before changing an existing installed repository. Files merely retained in Git do not prove an installed upgrade is safe.
