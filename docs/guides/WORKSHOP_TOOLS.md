# Workshop navigation

The Studio and local labs share one inventory and navigation component. Use **All tools** to search names, descriptions and capabilities (for example `climbing`, `particles`, `startup` or `sprite sheet`).

| Group | Existing tools |
| --- | --- |
| Create | Sequences, Props, Climb workshop |
| Behaviours | Behaviour map, Gaze & awareness, Mood & social, Independent waking, Exploring & gaits |
| Simulate | Live climbing, Movement & jumps, Route quality, Carrying & handoffs, Props & refinements, Scratching & actions, Bed visits, Life-stage preview, Roaming playground, Standard card surfaces, Multiple cats |
| Diagnose | Kitten climbing stress, Endurance & stress, Initial load, Layout & lifecycle, World authority |
| Review | Asset changes |

- The active group/tool appears in the header and links. On narrow screens, All tools provides the complete directory without a crowded menu row.
- Six newer diagnostic/preview labs use a fixed bottom-right launcher. It does not change document height, surface positions or the menu-height variable. Their fixture implementation stays independent.
- Studio links preserve the workshop you are using: 8767 is the saved workshop; 8768 remains clearly labelled isolated storage. Labs run on 8769. Navigation does not transfer, save, approve or integrate artwork.
- Studio's old internal tabs are hidden only after the shared component loads; they remain a fallback if it fails. Existing hashes, direct links and authoring controls remain intact.
- Search keeps focus inside a native dialog; Escape closes and returns focus. Keyboard and paste events in navigation cannot trigger Studio canvas shortcuts. No global shortcut was added.
- Existing JSON/PNG/sprite-sheet controls stay in their editors. Animated GIF export and broader consolidation are proposals, not available destinations. The October Studio/lab proposal informed the grouping; no labs were merged or removed.

## Implementation and evidence

- Inventory/resolution/search: `frame-studio/dist/workshop-tools.js`; presentation: `frame-studio/dist/lab-nav.js`. The same definitions power menus and search. Static lab allowlisting includes the inventory module.
- Source checks cover 25 unique entries, existing served files/return navigation, five groups, capability search, active aliases and isolated Studio URL/query preservation.
- Browser checks: same-workshop Props routing, search and unchanged selected Studio frame, Escape/focus return, fixed positioning, climbing search and a 400px-wide directory. This is responsive browser evidence, not physical-device performance acceptance.
- Reproducible builds, full 95-suite check and unchanged production release integrity passed. No HA resource/dashboard changes. Private saved-store backup/hash manifest retained before the live navigation reload; all 1316 saved files stayed byte-identical after restart/live browser checks. Journal remains 1107 entries / 99 latest / 38 pending; artwork and receipts remain outside this change.
