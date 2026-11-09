# Contributing

Use Node.js 22.20 or newer. Read [DEVELOPMENT](DEVELOPMENT.md) for source ownership and [current state](CURRENT_STATE.md) for the checkpoint.

Edit source, then run `npm run build`. Use focused checks while iterating. Before a runtime PR, run `npm run verify:build`, `npm test` and `npm run release:build`; inspect relevant browser behaviour and the installed bundle. Documentation-only changes need link/content checks.

Open a short-lived branch and PR against `main`; preserve history and include compatibility, validation and rollback details. Do not replace user artwork, infer provenance or complete a different saved version's receipt. Follow `frame-studio/AGENTS.md` for authoring work.

Private stores, attachments, browser drafts and personal HA exports do not belong in Git. Use synthetic demonstration data for screenshots. Public release assets contain the card, checksums and build metadata; Studio and Node tooling are not runtime dependencies.
