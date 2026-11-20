# Isolated release acceptance

This is an execution checklist, not completed evidence. [Release gates](../design/PIXEL_CAT_RELEASE.md) own the publication sequence. The live v1.1.0 upgrade is already verified; clean installation, removal/reinstall and full backup restore remain open.

## Environment and evidence

- Use a disposable Home Assistant 2026.11+ instance with its own configuration, storage and browser profile. Record its actual version and installation type. Do not clone live credentials, device integrations or automations into it.
- Confirm the target identity before any write or restore. The existing live MCP connection is not an isolated test environment merely because a test dashboard is open.
- Keep instance URLs, dashboard exports, resource inventories, browser diagnostics and backup archives in ignored local storage under `.release/isolated-acceptance-<date>/`. Keep encryption keys separately. Publish only a sanitised result summary and artifact hashes.
- Use published release assets and their matching manifest/checksums. A build from main is not the published v1.1.0 asset. No existing tag or asset needs replacement for this test.
- Before each write, fetch fresh state, capture exact affected configuration/resources and compare again. Use supported UI/API operations; never edit internal `.storage` files.

## Checkpoints

| Step | Action | Evidence required |
| --- | --- | --- |
| Baseline | Confirm Marketplace is available and Pixel Cat Card is absent. Create a separate test dashboard and an unrelated built-in card as a preservation sentinel. | Instance identity/version/type; resource inventory; exact dashboard export/hash; absence of an installed Pixel Cat bundle. |
| Clean stable install | Add `Future-Surfer/Pixel-Cat-Card` as a Dashboard repository if search is unavailable. Install published v1.1.0 and reload. | Version; served bundle SHA-256 equals its release checksum; exactly one Pixel Cat module; unrelated resources unchanged. |
| Real frontend | Find the card in the picker, create/save a named companion, reload and reopen its editor. Observe motion, Pause/Resume, navigation away/back and a narrow viewport. | Saved configuration preserved; one visible actor per companion; controls work; no relevant console errors. |
| Older baseline | Use Marketplace's version selection to install an available older release, such as v1.1.0-rc.1. Keep the test configuration compatible with both versions. | Exact selected release asset/hash, registration URL and saved configuration; working frontend. |
| Pre-upgrade backup | Create the isolated instance's native HA backup before upgrading. Verify completion, selected contents and availability of the emergency-kit key when encrypted. Keep this recovery point. | Backup identifier/time/contents; completed status; private storage location. Do not publish the archive or key. |
| Upgrade and cache | Upgrade through Marketplace to published v1.1.0, retaining an existing browser session as well as checking a fresh session after reload. | Served bytes match the target checksum; versioned URL changes appropriately; no duplicate module; saved YAML and unrelated resources remain unchanged; refreshed clients render. |
| Removal | Remove only Pixel Cat Card through Marketplace. Retain its dashboard YAML and the unrelated sentinel. Check a fresh browser session. | Target install/registration removed as expected; unrelated resources/dashboard data unchanged; missing-card behaviour recorded. An already loaded JavaScript class can persist until reload. |
| Reinstall | Reinstall the same published release, reload and revisit the existing companion. | Correct bytes and exactly one module; retained YAML works without recreation; picker/editor, motion, Pause/Resume and view return pass. |
| Restore preparation | Export the current test state and take a second completed backup as a recovery point. Identify the exact pre-upgrade archive and included parts. | Concrete before/after comparison and the changes that the restore will discard. Ask for explicit confirmation of this restore before executing it. |
| Restore and verify | Restore that archive using the supported native restore flow for the installation type; wait for HA to return. | Restored release bytes/version and module URL match the pre-upgrade checkpoint; dashboard YAML and sentinel match; Marketplace state is consistent; no relevant startup errors; frontend controls/navigation pass. |

A manual file copy or resource-URL rollback does not close the native backup-restore gate. If the installation type lacks a supported in-place restore flow, record the limitation and choose the appropriate onboarding/restore environment before proceeding. Do not substitute a live restore.

## Result record

Record each checkpoint as **pass**, **fail** or **not run**, with date, tested release/asset hashes, observations and private evidence filenames. Investigate any failed checksum, duplicate registration, lost setting or frontend error before continuing. Do not infer a pass from automated synthetic browser tests.

After execution, add a short sanitised dated report under `docs/history/` and update current state and the open release gates. Keep raw diagnostics and backups private. Retain the isolated environment and recovery points until the owner decides how to dispose of them.
