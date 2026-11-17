# Pixel Cat Card release notes

## Pixel Cat Card 1.1.0-rc.1

This release candidate includes changes since v1.0.0.

### Package security

- The bundle removes Stick Pet Card, Pixel Pet Card, and the Pixel Pet editor. Pixel Cat Card keeps its original artwork and existing companion layouts. Remove any separate legacy JavaScript resources before reloading your dashboard.

### A home for your cat

- **Cardboard box bed.** Cats start inside and can hop back in for a break. Adults peek over the rim. Kittens stay tucked inside until they hop out. You can also pick up a cat and drop them into an empty box.
- Choose whether to include a bed, food bowl, and scratching post. Pick a plain post or a one- or two-level tree. The card preview shows the furniture as you change it.
- Set the card background from solid to fully transparent, adjust the border and corners, and choose small scratching debris, full-pixel debris, or none.

### A clearer editor

- Set your cat's **Mood** to Natural, Playful, Relaxed, or Alert. Four **Personality** sliders separately set boldness, sociability, curiosity, and patience.
- Choose quiet company and short chases independently. You can also set how many mice and balls to share and place the name and activity labels above or below your cat.
- The optional on-card controls focus on **Pause / Resume**, **Spawn toy**, and **Come home**.

### Roaming and animation

- Cats can climb exposed card edges and leap onto a reachable card. Short wall jumps usually rebound back toward the side they came from. Descending grips use their own pose, and quiet rest poses transition more smoothly into walking.

### Testing and tools

- The dashboard-wide **Behaviour Lab** can focus cats on climbing and leaping, wall jumps, or yawning. It reports when walls or safe routes are unavailable.
- The [MP4 demo](images/pixel-cat-routine.mp4) is available to share.
- Behaviour Lab can focus cross-card chasing. Each cat still makes its own decision about joining.
- The [Editor Workbench](guides/EDITOR_WORKBENCH.md) and local chase replay fixtures remain available in the development tools.

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
