# Roaming installation and configuration

Current setup reference. [README](../../README.md) is the short entry point; [FEATURE_DETAILS](../FEATURE_DETAILS.md) owns behaviour rules; [release guide](ROAMING_RELEASE.md) owns packaging/rollback. Older narrative/examples remain in the dated README snapshot (development reference retained privately).

## Install the roaming cat

For the consumer candidate, use the single-file [Pixel Cat installation guide](PIXEL_CAT_INSTALL.md). Public Marketplace distribution is pending. The following six-module route remains a developer/rollback option; do not load it alongside the bundle:

```yaml
- url: /local/pixel-cat-roaming-art.js?v=1
  type: module
- url: /local/pixel-cat-roaming-extras.js?v=1
  type: module
- url: /local/pixel-cat-affordances.js?v=1
  type: module
- url: /local/pixel-cat-behaviours.js?v=1
  type: module
- url: /local/pixel-cat-roaming.js?v=1
  type: module
- url: /local/pixel-cat-climbing.js?v=1
  type: module
```


Bump URL versions and reload clients after updates. Node/Studio are development tools, not HA runtime requirements. The candidate manifest now targets the single Pixel Cat bundle.

Picker-created companions choose a random name, colour and igloo/simple bed once. Explicit saved settings win. Enabled visible default homes include a mouse even when the post cannot fit.

Minimal YAML (older opt-in behaviour defaults):

```yaml
type: custom:pixel-cat-home
cat_id: dashboard-cat
```


HA picker: **Pixel Cat → Cat companion / Performance monitor**. The guided editor preserves advanced YAML; previews create no actor. Save through HA, not runtime controls. Another companion card adds another independent cat; use stable distinct IDs.

## Appearance and defaults

| Setting | Rule |
| --- | --- |
| `name`, `color` | Picker saves random choices once; explicit values win. Omitted manual colour can change on a fresh mount. |
| `cell_size` | Integer 1–6 for furniture/toys and adult-sized bodies. Legacy mixed home scales remain supported. Shared toys retain spawning scale. |
| `life_stage` | `kitten`, `adult` (default) or `senior`. Kitten body cells are half `cell_size`; adult/senior retain current size and behaviour. No ageing or behaviour modifiers in V1. |
| `bed_style` | `igloo` or `simple`; open beds skip doorway emergence. |
| `bed_primary_color`, `bed_secondary_color` | Shell/lining colours; derived shading retained. `igloo_color` remains primary fallback. |
| `show_home`, `show_controls` | Independent. Picker hides controls; enable them under Advanced settings. |
| `arrival: igloo` | Once per mounted resident; hidden/unsafe narrow homes skip. Existing omitted-arrival configs retain startup behaviour. |
| `primary_home` | Picker marks the first home; old cards use fallback, conflicting primaries show edit-mode warning. Not global scale authority yet. |
| `show_scratching_post: false` | Hide home post; legacy `scratching_posts: false` respected. Below 59 native cells of home width, omit it rather than overlap furniture. |
| `home_mouse: false` | Disable the mouse for an enabled visible home; spawns beside its post or on the home floor without a post. Requires shared dashboard props. |
| `igloo_interactions: false` | Disable rare roof perch/shell scratch. |


```yaml
bed_style: simple # or igloo
bed_primary_color: "#aa6627"
bed_secondary_color: "#964252"
```


## Enable moods, social play and toys

Picker enables the seven core switches below. Existing explicit settings are preserved; minimal YAML needs opt-ins:

```yaml
type: custom:pixel-cat-home
cat_id: living-room-cat
name: Miso
color: '#ad6c2d'
mood_behaviour: true
social_behaviour: true
interaction_behaviour: true
dashboard_props: true
prop_reactions: true
landing_reactions: true
startle_followups: true
```


Other optional switches: `toy_carrying`, `bowl_eating`, `post_rest_behaviour`, `post_meal_behaviour`, `draggable`, `horizontal_apex`. Set false to opt out. These controls do not imply care obligations or guaranteed interactions. Use [detailed contracts](../FEATURE_DETAILS.md) for eligibility/contact/interruption rules.

## Hide the home card

```yaml
type: custom:pixel-cat-home
cat_id: dashboard-cat
show_home: false
show_controls: false
```


Hidden residents use a suitable visible foreign support; wait invisibly if none exists. No phantom hidden home support. Sections/masonry gap and physical-mobile behaviour remain audit targets.

## More YAML examples

### A quiet companion

```yaml
type: custom:pixel-cat-home
cat_id: quiet-companion
name: Nori
color: '#414b55'
cell_size: 2
show_home: true
debug_labels: false
debug_names: false
debug_mood: false
casual_speed: 6
relaxed_speed: 9
```


### Two cats sharing the dashboard

```yaml
type: grid
columns: 2
square: false
cards:
  - type: custom:pixel-cat-home
    cat_id: miso
    name: Miso
    color: '#ad6c2d'
    mood_behaviour: true
    social_behaviour: true
    interaction_behaviour: true
    shared_home_surfaces: true
    debug_labels: false
  - type: custom:pixel-cat-home
    cat_id: nori
    name: Nori
    color: '#414b55'
    mood_behaviour: true
    social_behaviour: true
    interaction_behaviour: true
    shared_home_surfaces: true
    debug_labels: false
```


## Debug and performance

Enable `debug_labels: true` for name/action below the cat; mood uses tint/text colour. `debug_names` is a separate above-cat name; `debug_mood` controls glow. Picker diagnostics default off. Shared actor-free monitor:

```yaml
type: custom:pixel-cat-home
mode: monitor
```


The legacy `custom:pixel-cat-monitor` type also remains usable. Monitor measures foreground browser scheduling, not CPU/GPU or guaranteed physical-device FPS. [Diagnostic guide](CAT_DEBUG.md) owns controls/reports and interpretation.

## Install the original card

Separate self-contained implementation; it does not roam across the dashboard:

```yaml
url: /local/pixel-pet-card.js?v=1
type: module
```

```yaml
type: custom:pixel-pet-card
title: Pixel Pet
height: 420
view_mode: cat_focus
show_controls: false
```


[Original configuration guide](PIXEL_PET_CARD.md). Preserve existing original/stick custom-element compatibility when updating roaming modules.
