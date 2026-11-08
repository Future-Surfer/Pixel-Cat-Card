# Versioned roaming release

Use Node.js 22.20 or later in the repository root. No dependency install is needed.

```text
npm run verify:build
npm test
npm run release:build
```

The final command prints `.release/snapshot-<content-hash>/`. This ignored output contains `pixel-cat.js`, six modules, `sources.json`, `manifest.json` and `preview.html`. The loader imports art, extras, affordances, behaviours, controller and climbing in that order. Preserve the whole directory. Versions are immutable; changing runtime content creates a new directory. The manifest records exact bytes and SHA-256 for every payload file. `sources.json` retains selected asset versions/provenance and decoded artwork digests. Dictionary packing is synchronous and lossless.

Verify a copied directory before use:

```text
node scripts/build-release.mjs --verify .release/snapshot-<content-hash>
```

## Clean install

1. Copy the complete version directory to `/config/www/pixel-cat/<version>/` on HA using your normal file-management method.
2. Add one dashboard resource of type **JavaScript Module**, URL `/local/pixel-cat/<version>/pixel-cat.js`.
3. Hard reload the browser, then add **Pixel Cat** through the card picker (or retain existing `custom:pixel-cat-home` YAML).

Register either the ordered loader or the six corresponding inline resources for a given runtime. Loading both can mix versions of global data and already-registered custom elements. Back up current resource registrations before migration. This release does not modify dashboard cards, live Studio storage or artwork. The older `pixel-pet-card` HACS installation remains separately usable; roaming HACS migration is still roadmap work.

## Upgrade and rollback

Copy a new verified version alongside the old one, update only the loader resource URL to the new version and hard reload every client. A full reload is required because custom elements cannot be replaced in an already-running document. Keep the previous directory and recorded resource URL. Roll back by restoring that URL and hard reloading. For an inline-to-file migration, retain the backed-up inline bodies/registration order and restore those if necessary; do not leave both sets registered.

## Local verification and CI

Run `npm run gaze:lab`, then open `http://127.0.0.1:8769/releases/<version>/preview.html`. A clean document must report all six modules loaded and mount two independent residents. Navigate to another version for upgrade testing, and back for rollback. This tests normal-file loading; it does not prove a particular HA file-copy setup or reverse-proxy policy.

The GitHub workflow repeats both builds, all suites, packaging and generated-file drift checks, then uploads the version directory as an artifact. Local integrity tests also reject corrupt files, path escapes and conflicting reuse of a version name. Existing inline deployment retains the 128,000-byte per-module guard. Current module sizes and browser evidence are in the project checkpoint.
