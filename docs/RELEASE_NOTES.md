# Pixel Cat Card release notes

## Pixel Cat Card 1.1.0

Give your cat a cardboard box, a taller tree, or a quieter corner of the dashboard. This release adds more ways to set up their home and more ways to see them play.

### A home of their own

- **Cardboard box beds.** Adults can peek over the rim and kittens can tuck themselves inside. You can pick up a cat and drop them into an empty box.
- Choose which furniture to include. Pick a plain scratching post or a one- or two-level cat tree, with a preview of the furniture in the editor.
- Adjust the background transparency, border, corners, and scratching debris. The fur palette adds **Light grey**, and field dividers sit below the colour swatches.

### Play at their own pace

- Choose a mood and adjust boldness, sociability, curiosity, and patience separately. Quiet company and short chases have their own switches.
- **Optional cross-card chases.** A cat can follow a playmate it sees reach another card when there’s a clear route and room to land. Either cat can decline, and the chase can end when they lose sight. Enable the pilot on both cats using the [configuration guide](https://github.com/Future-Surfer/Pixel-Cat-Card/blob/main/docs/guides/ROAMING_CONFIGURATION.md#chasing-across-cards).
- Cats can grip exposed card edges, climb and leap to a reachable card, or rebound to the same side on a short wall jump. Descents have their own grip poses, and cats transition more smoothly from rest to walking.

### Controls and Behaviour Lab

- The optional on-card controls focus on **Pause / Resume**, **Spawn toy**, and **Come home**. Choose how many mice and balls to share and where name and activity labels appear.
- In **Behaviour Lab**, you can favour climbing, wall jumps, yawning, or chase reactions on the current view. Choose **Natural behaviour** when you’re done.
- [Watch the demo](https://github.com/Future-Surfer/Pixel-Cat-Card/blob/main/docs/images/pixel-cat-routine.mp4).

### Before updating

Existing `custom:pixel-cat-home` cards keep their settings and cat IDs. This release removes the older Stick Pet and Pixel Pet renderers and the Pixel Pet editor. If you still use those card types, replace them and remove any separately registered legacy resources. Follow the [installation and migration guide](https://github.com/Future-Surfer/Pixel-Cat-Card/blob/main/docs/guides/PIXEL_CAT_INSTALL.md), then reload the dashboard.

## Pixel Cat Card 1.0.0

First stable release for Home Assistant 2026.11 and later. Pixel Cat Card gives your dashboard a cat that can roam between cards, nap, scratch and play.

### Before updating

- Add the repository through the Marketplace link in the README.
- If you installed manually, follow the [migration guide](https://github.com/Future-Surfer/Pixel-Cat-Card/blob/main/docs/guides/PIXEL_CAT_INSTALL.md) before installing the Marketplace copy. Keep your card YAML and cat IDs.

### Included

- One JavaScript bundle with the cat, props and editor.
- Longer head-down holds and brief lifts when eating.
- A corrected tail mask for the scratching-post animation.
- Clearer keyboard focus and larger touch controls.
- Tap a mouse or ball to invite a nearby cat to investigate.
- Exact landing height when a differently sized cat steps on or off a simple bed.
- A brief sit turn when a cat reverses during an unhurried walk.
- Random fur colours are independent of theme. Automatic outlines add a thin white edge to near-black fur and a black edge to near-white fur on light themes.
- The editor cat rests briefly between yawns, ear scratches, and grooming. An optional black or white fur outline helps cats stand out on the dashboard.
- Cats cast a compact shadow beneath their paws. During a jump, it can land on more than one dashboard surface. Turn it off under **Your cat → Floor shadow**.

- Optional two-level cat tree with side climbing and a hanging ball you can tap.
- Kittens can curl up beside a sleeping cat or try a playful pounce.

### Verification

The release assets include SHA-256 checksums. The release candidate was installed through Marketplace and verified with existing dashboards and the card editor. The Marketplace submission records an upgrade from v1.0.0-rc.3 to v1.0.0 with one registered module and the existing dashboard cards working after reload.
