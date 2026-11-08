# Eating integration — 16 October 2026

`eating.json` is the exact saved local Studio `sequence-eat` record, including authored human pixels, holds and gaze. It is used as the nibble/food runtime clip with the fixed, existing rear support at (12, 23). The eating gaze is explicitly blind; its origin still provides a geometric mouth estimate. Vision metadata is never changed to enable pickup.

Nosing/drop reuse the already-integrated look-down sequence as a contextual alias, with an existing marked support selected per frame. No new pixel art was generated. Mouth positions currently use gaze origin + 0.5 cells forward / 2.5 down, mirrored with facing; missing markers use a conservative silhouette estimate. Explicit reviewed per-pose mouth anchors remain future refinement, especially on unusual/WIP poses.
