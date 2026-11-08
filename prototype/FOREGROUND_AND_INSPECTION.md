# Foreground movement and inspection POIs

> Planning authority: [../ROADMAP.md](../ROADMAP.md) is the only active vision/task backlog. This document is an operational reference or dated engineering record; earlier proposed steps are not a separate delivery order.


Other cards and their content are scenery behind the cat. An overlapping card
rectangle, nested container, heading or icon does not obstruct a walking surface
or the cat's body above it. Discovery no longer rejects those overlaps, including
surfaces close to the card's own header. Bounds, minimum bearing width, validated
coordinates and ballistic jump limits still apply. Dashboard dialogs/edit mode
still pause the cat. These changes do not click or alter foreign card content.

Known native cards offer an unverified foreground floor, including tile, button
and gauge cards. The **Try interior candidates** toggle is enabled by default (`use_surface_candidates: false` opts out);
they remain labelled layout candidates rather than measured ledges. Card tops,
rendered dividers and explicitly declared surfaces work independently of that
toggle. Relaxing occlusion does not automatically turn every line of text into a
walking surface.

## Inspecting interesting content

Content targets are separate from support surfaces. The adapter measures headings,
icons and named value elements when available through open DOM/shadow roots.
Known graph/gauge cards also offer a semantic display-area target, labelled
`layout-interest`; it is a layout estimate, not an interpretation of graph data.
Closed shadow roots and unfamiliar custom-card markup may need explicit targets.

An inspection stop attaches only to a sufficiently close, wide supporting surface
**below** the target. The cat approaches that stop, faces toward the detail and
plays the existing human-authored look-up clip before resuming ordinary idle
behaviour. Narrow hanging-tail perches keep their fitting perch pose. Objects
below the current surface are excluded until a reviewed look-down pose exists.
The Visit menu lists inspection stops explicitly. Automatic exploration can choose
them too; the same resting-point visit history lowers repeated selections.

Enable **POIs** to show teal inspection stops, dotted sight lines and hollow
target rings. **Surface report** identifies each target's source as declared,
rendered content or layout interest. Blue/orange resting dots retain their
previous meaning, and grey marks visited points.

A cooperating card can declare a semantic target separately from `cat_surfaces`:

```yaml
cat_pois:
  - id: chart-reading
    label: Chart reading
    units: percent
    x: 55
    y: 45
```

Coordinates are local to the owning card's rendered `ha-card`. `pixels` is also
supported. This declares an object of interest, not a physical ledge. An enabled
surface beneath the target is still required. The candidate toggle is useful for
testing likely foreground stops without asserting that a card contains a real
ledge. Live updates to content do not request any HA service calls.

## Verification

`node scripts/test-roaming-inspection.mjs` exercises a nested card completely
overlapped by a larger container, interior surface acceptance, rendered and
declared targets, target-above-surface filtering, Visit selection and actual idle
look-up playback. Existing motion, routing, idle, physics and autonomy suites
remain relevant. Local compatibility fixtures do not prove HA frontend parity.

The standard-card fixture's **Pause at inspection** checkbox holds the next actual
look-up stop for screenshot review. It is a local test control, with no change to
the live cat's rest duration or automatic behaviour.

Browser verification enabled foreground candidates, discovered 21 surfaces with
zero rejected surfaces, selected the gauge inspection through Visit and held the
cat at `idle-look-1` on the gauge's foreground floor. No runtime errors were
reported. Proof: `foreground-inspection-proof.png`. The installed HA controller
resource was read back equal to the tested 48,035-byte source; authenticated live
HA visual verification remains pending.

See `../MISSING_POSES.md` for look-down and the remaining artwork backlog.
