# Pixel Cat Card installation and migration

Candidate `1.0.0-rc.1` targets HA 2026.11+. Public Marketplace availability is pending: the repository is private while public-source/history review is completed. Do not describe a skipped private Marketplace validation run as an accepted installation.

## Package

`dist/pixel-cat-card.js` is the sole entrypoint. `dist/SHA256SUMS` and `dist/pixel-cat-card.manifest.json` identify its exact bytes, version and source modules. Its strict module scopes preserve the existing runtime order; transitional Stick Pet/Pixel Pet elements are included without changing their sources. Node/Studio are build/authoring tools, not runtime requirements.

For manual testing, copy the verified file into HA `/config/www/` and register `/local/pixel-cat-card.js?v=1.0.0-rc.1` as a module. A future public release should be installed through Marketplace, which manages the resource version. Keep the previous release file for rollback; do not overwrite its bytes in place.

## Existing six-module or inline installation

1. Read the current six resource registrations. Save exact bodies/URLs, IDs and hashes locally; record every affected dashboard configuration before any card change. Preserve unrelated resources and configuration.
2. Put the verified bundle at a new versioned file path. Compare its complete readback/hash with the release asset.
3. Re-read the affected resources and compare against the backups. Replace their six registrations with one bundle entry using the resource API; preserve ordering/IDs in the rollback record. Never edit HA `.storage` files.
4. Hard reload a real browser and verify the picker/editor, ordinary motion, home, Pause/Resume, optional play, view return and console errors. Cat IDs/options remain unchanged. Refresh all other clients too.
5. If verification fails, re-read current state, restore only the exact affected resource registrations/bodies, then hard reload and verify. Keep the candidate file for diagnosis; do not restore unrelated dashboard configuration.

Registering both the bundle and a separate roaming runtime is unsupported. The bundle warns and refuses to replace an already registered roaming element. This is a diagnostic guard, not a substitute for a clean resource migration.

## Legacy cards

The candidate still registers `custom:stick-pet-card`, `custom:pixel-pet-card` and the latter's editor. They remain usable by existing YAML, while the picker promotes Pixel Cat Card. Unit checks verify legacy class identity when the old Pixel Pet resource loaded first. Test the store's real update/resource-path behaviour before changing an existing installed repository. Files merely retained in Git do not prove an installed upgrade is safe.

## Marketplace release gates

Before claiming Marketplace support: make the vetted repository public with the owner's explicit approval, pass plugin validation without ignored checks, publish an opt-in candidate and test fresh installation, upgrade, versioned caching, uninstall/reinstall and rollback on an isolated instance. Preserve previous assets/releases. Catalog inclusion is a later submission to `hacs/default`; custom-repository availability does not mean catalog acceptance.
