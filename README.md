# Pixel Cat Card

A pixel cat that roams freely around your Home Assistant dashboard. Watch it react to its surroundings, wander from card to card, and find spots to nap, scratch or play. Add multiple cats to see new interactions and emergent behaviours unfold.

![A ginger cat scratches a temperature card, is picked up and moved away by a cursor, then walks back to scratch again](docs/images/pixel-cat-entity-card.gif)

Choose a name, colour, bed and life stage. Add another card for another cat.

## Install

Requires **Home Assistant 2026.11+**.

[![Open Pixel Cat Card in Home Assistant Marketplace](https://my.home-assistant.io/badges/marketplace_repository.svg)](https://my.home-assistant.io/redirect/marketplace_repository/?owner=Future-Surfer&repository=Pixel-Cat-Card&category=plugin)

In **Settings → Marketplace**, search for **Pixel Cat Card**. If it doesn’t appear in search, use the button above or **Add from link** to add `Future-Surfer/Pixel-Cat-Card`, then install it and reload your dashboard.

[v1.1.0](https://github.com/Future-Surfer/Pixel-Cat-Card/releases/tag/v1.1.0) removes the two legacy card types. [Install manually or migrate an existing setup](docs/guides/PIXEL_CAT_INSTALL.md).

![An orange cat wakes in an open bed, scratches a post, eats, grooms and walks back to sleep](docs/images/pixel-cat-routine-v3.gif)

## Add a cat

Choose **Add card → Pixel Cat Card → Cat companion**, pick its appearance and save.

Or use YAML:

```yaml
type: custom:pixel-cat-home
cat_id: miso
name: Miso
color: '#cd813c'
bed_style: igloo
```

Give each cat a different `cat_id`.

![A white cat with a black outline grooms, chases and catches a toy mouse, carries it home and bats it off the edge](docs/images/pixel-cat-mouse-chase.gif)

[Configuration](docs/guides/ROAMING_CONFIGURATION.md) · [Technical details](docs/TECHNICAL_DETAILS.md) · [Project docs](docs/README.md) · [Report a bug](https://github.com/Future-Surfer/Pixel-Cat-Card/issues)

![A slate-blue cat hops out of a cardboard box and scratches a compact cat tree, stirring a plum cat that rolls onto its back before returning to sleep](docs/images/pixel-cat-box-and-tree.gif)

[MIT license](LICENSE)
