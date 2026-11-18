# Pixel Cat Card installation and migration

Pixel Cat Card targets Home Assistant 2026.11 and later.

## Marketplace

In **Settings → Marketplace**, search for **Pixel Cat Card**. If it doesn’t appear in search, use the [Marketplace link](https://my.home-assistant.io/redirect/marketplace_repository/?owner=Future-Surfer&repository=Pixel-Cat-Card&category=plugin) or enter `Future-Surfer/Pixel-Cat-Card` under **Settings → Marketplace → Add from link**. Connect GitHub if prompted, and choose **Dashboard** if asked for a type. Install it and refresh the dashboard.

The legacy renderers were removed in v1.1.0-rc.1. If you are on v1.0.0, upgrade to v1.1.0 or later. To see release candidates, open the repository's device page under **Settings → Devices & services → Marketplace**. Enable the **Pre-release** entity and turn it on, then return to Marketplace. [Home Assistant's Marketplace instructions](https://www.home-assistant.io/integrations/marketplace/#keeping-installations-up-to-date).

For dashboards with storage-mode resources, Marketplace registers the JavaScript module automatically. In YAML resource mode, add the exact URL shown in the install dialog as a module in the Lovelace resources configuration and version its URL when updating. If you already have a manually registered copy, back it up and remove its registration when switching to Marketplace so only one bundle loads.

## Package

`dist/pixel-cat-card.js` is the sole entrypoint. `dist/SHA256SUMS` and `dist/pixel-cat-card.manifest.json` identify its exact bytes, version and source modules. The v1.1 package registers the Pixel Cat home, editor, performance monitor and Behaviour Lab. Original artwork is built in. Node.js and Frame Studio are only needed for building and authoring.

For manual installation, download `pixel-cat-card.js` from [GitHub Releases](https://github.com/Future-Surfer/Pixel-Cat-Card/releases). Copy it into HA `/config/www/` and register `/local/pixel-cat-card.js` as a JavaScript module. Change the URL or its version query parameter on each update to avoid a stale browser cache. Keep the previous release file for rollback.

## Existing six-module or inline installation

1. Read the current six resource registrations. Save exact bodies/URLs, IDs and hashes locally; record every affected dashboard configuration before any card change. Preserve unrelated resources and configuration.
2. Put the verified bundle at a new versioned file path. Compare its complete readback/hash with the release asset.
3. Re-read the affected resources and compare against the backups. Replace their six registrations with one bundle entry using the resource API; preserve ordering/IDs in the rollback record. Never edit HA `.storage` files.
4. Hard reload a real browser and verify the picker/editor, ordinary motion, home, Pause/Resume, optional play, view return and console errors. Cat IDs/options remain unchanged. Refresh all other clients too.
5. If verification fails, re-read current state, restore only the exact affected resource registrations/bodies, then hard reload and verify. Keep the candidate file for diagnosis; do not restore unrelated dashboard configuration.

Registering both the bundle and a separate roaming runtime is unsupported. The bundle warns and refuses to replace an already registered roaming element. This is a diagnostic guard, not a substitute for a clean resource migration.

## Legacy cards

The v1.1 package supports `custom:pixel-cat-home` and preserves its saved YAML and cat IDs. The older `custom:stick-pet-card` and `custom:pixel-pet-card` types and the Pixel Pet editor have been removed. If a dashboard still uses an old type, replace that card with a Pixel Cat Card companion. Remove any separately registered legacy JavaScript resources and reload the frontend.
