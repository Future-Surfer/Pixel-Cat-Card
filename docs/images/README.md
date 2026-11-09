# README screenshots

These deliberately checked-in images illustrate the project without publishing personal Home Assistant dashboard/entity data. Local diagnostic/rollback captures remain under ignored `.studio-data/`.

- `pixel-cat-habitat-light.jpg` / `pixel-cat-habitat-dark.jpg`: 8 November 2026 browser captures of `prototype/release-showcase.html` using the complete single-file candidate. Only the real cats, beds, posts, toys and pass-through ledges are shown. Adult colour `#cd813c`; grey igloo shell `#52616c`, doorway `#22323e`; kitten `#718b9b`. These are independent configuration colours, not altered artwork. A fixed capture frame avoids capturing the normal resize-recovery fade. No entity data or performance figures are included.
- `pixel-cat-habitat-mobile.jpg`: the same habitat at a 390-pixel browser viewport. Responsive-layout evidence only, not a physical-device performance measurement.
- `dashboard-demo.jpg`: browser capture of `prototype/showcase.html` on 16 October 2026. Uses the real four-module runtime with two independent cats and a shared monitor; readings on the sample dashboard are illustrative. Timing figures are observations of that session, not a benchmark or performance promise.
- `card-editor-guided.png`: refreshed guided-editor capture of `prototype/editor.html` on 16 October 2026, including companion/monitor purpose, name/colour swatches and optional settings. No HA entity data; native HA picker/editor also checked separately.
- `card-editor.jpg` (retained earlier layout): browser capture of `prototype/editor.html` on 16 October 2026. Uses the real `pixel-cat-home-editor` and the actual home-card preview. The surrounding fixture displays JSON configuration events; it does not persist to HA. The same editor was separately verified in HA's native card dialog, including text updates, Save enabling and cancellation without a dashboard change.
- `frame-studio.png`: retained v8 Studio screenshot copied from `frame-studio/ui-v8-editor-proof.png`. Shows sequence browsing, painting, gaze markers and playback; later catalogue/metadata refinements can differ.

To refresh the first two images, build the roaming modules, serve the repository on loopback and use the named fixtures. Capture the real browser page; do not substitute generated interface artwork. Keep source/reference frame provenance unchanged. Dashboard and earlier editor captures are JPEG; the refreshed guided editor and Studio captures are PNG.

## Scripted routine GIF

`pixel-cat-routine.gif` uses scripted destinations with the release's gait, action timing, contact placement and mouth planner. The open bed uses the release's height transition and the loop joins during sleep. The queue lives in `scripts/readme-playback.mjs` and the renderer in `prototype/readme-routine.mjs`. `pixel-cat-routine.json` records dimensions and timing. See [media export instructions](../TECHNICAL_DETAILS.md#readme-animation).
