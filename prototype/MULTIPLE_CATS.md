# Multiple roaming cat homes

> Planning authority: [../ROADMAP.md](../ROADMAP.md) is the only active vision/task backlog. This document is an operational reference or dated engineering record; earlier proposed steps are not a separate delivery order.


Place more than one `custom:pixel-cat-home` card on the same dashboard view. Each
gets an independent overlay, route, rest clock, visit history and home controls.
Copied configurations work even when `cat_id` is duplicated: the second instance
receives a suffix rather than being refused as another owner. An ID stays stable
for that card instance across reconnects. Explicit distinct IDs remain preferable
for readable diagnostics. Automatic IDs are runtime identities, not persisted pet
profiles.

```yaml
type: custom:pixel-cat-home
cat_id: cat-one
name: Cat one
color: '#253849'
```

```yaml
type: custom:pixel-cat-home
cat_id: cat-two
name: Cat two
color: '#ad6c2d'
```

Home returns each cat to its own dock. Home cards are excluded from shared surface
discovery, so a cat does not perch on another cat's control panel. Edit previews
do not claim an owner or create a roaming overlay. Disconnecting one home removes
only its overlay/listeners; other cats continue.

Click attention chooses the nearest eligible, unpaused cat in the same view that
can reach the clicked card and return home. It avoids sending all cats to the same
click. Ordinary autonomous movement is independent; collision avoidance, social
interactions and exclusive perch reservations are future features.

Verification: `scripts/test-roaming-multiple-cats.mjs` plus the existing roaming
suites pass. The local `multi-cat.html` fixture verifies duplicate IDs, independent
pause/explore and remove/restore with exactly one/two overlays as appropriate.
The actual HA Testing → Cat playground already contained two copied homes with
the same `cat_id`; both now run after the resource update. Browser inspection
confirmed two distinct IDs/overlays and one paused cat while the other walked.
The dashboard YAML was preserved. Proof: `ha-multiple-cats-proof.png`.
