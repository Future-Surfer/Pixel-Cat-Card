# Cat-tree assembly code

Current lab format: `tree 2`. This is a small declarative assembly language, not executable JavaScript. It describes named parts and socket connections; the library supplies pixels, dimensions, materials and affordances. The simple compact expressions remain optional shorthand, but exports use this named format.

## Example: two posts supporting one deck

```text
tree 2
level 0
base = F

level 1
leftLow = I on base.left
rightLow = I on base.right

level 2
left = I on leftLow.head
right = I on rightLow.head

level 3
deck = part{tree-bridge} on left.head via foot
join right.head -> deck.brace

level 4
toy = Y on deck.toy
```

The deck has two required inputs: `foot` and `brace`. Its primary connection places it; the extra support must coincide exactly with the other input. Neither connection stretches a part or moves an already placed branch. The lab's **Shared-support example** builds this arrangement.

## Syntax and meaning

| Statement | Meaning |
| --- | --- |
| `tree 2` | Explicit format version; unknown versions fail clearly. |
| `name = TYPE` | The single foundation root. |
| `name = TYPE on parent.output` | Attach a named instance using its sole input. |
| `name = TYPE on parent.output via input` | Choose the exact input; mandatory if the component has several. |
| `join parent.output -> child.input` | Add another required support/attachment to that same instance. |
| `level N` | Optional assembly-stage grouping for subsequent declarations, retained in exports. |
| `# comment` | Ignore the rest of this line, including semicolons. |

- One statement per line; semicolons can also separate statements. Forward references work. Names are unique throughout the document, including across levels.
- **Levels are labels, not height coordinates.** Two platforms can share a stage while sitting at different heights; a hanging toy can be below its mounting stage. Socket positions and component dimensions determine elevation. Referring to `deck` is unambiguous without embedding its level in every reference.
- Built-in aliases: `F` foundation, `I` post, `T` split, `P/W` platforms, `O` pod, `B` bed, `R/L` central-post side shelves, `Y` hanging toy. `part{component-id}` addresses any exact custom component, including future library additions, without allocating another letter. Aliases also resolve exact IDs; no kind-based substitute is guessed.
- Part names start with a letter and contain up to 64 letters/digits/underscores/hyphens. Component/socket IDs follow the library's safe ID rules. Every reference names a specific output or input, not a visual proximity or inferred level.

## Structural guarantees

1. Resolve all component/part/socket references before placement.
2. Require one foundation root and one primary connection per other instance. Every declared input must connect exactly once; each output has at most one occupant.
3. Check socket directions, types and accepted component kinds. Reject self-links, duplicate names, reused inputs/outputs, disconnected parts and all directed support cycles, including cycles introduced by extra supports.
4. Order the complete support graph iteratively, including secondary supports. No recursive bracket depth limits complex named arrangements.
5. Place using primary socket alignment; check every additional support for exact coincidence. Keep collision checks for unrelated parts. Only the existing narrow attachment-seam allowance applies to directly connected parts.
6. Reject non-fitting arrangements as a whole. A single horizontal translation can fit the assembled bounds; no clipping, branch deletion, resizing or hidden geometry repair occurs.
7. Audit the resulting graph independently, then emit a deterministic named code. Extra connections, instance names, level labels and custom component identities survive export/reimport.

Incomplete or invalid code remains saveable working material; it produces a diagnostic and an empty invalid preview, never an incomplete tree disguised as success. Runtime actor clearance, safe routes, stability and artwork acceptance are separate gates.

## Limits and evolution

- Current lab budgets: 20,000 code characters, 128 placed parts, 256 connections, 16 sockets/component and 64 library components. Level labels range from 0–999. These bound editing/validation work; raising them requires measurement, not a syntax redesign.
- Compact expressions still have a 24-level bracket limit and post repetitions up to 16. Use named declarations for larger/deeper structures.
- Exported assemblies use `pixel-cat-tree/v2` and `codeVersion: 2`. Editable workspaces retain `pixel-cat-tree-workspace/v1`; their recipe is text and their library now permits multiple input sockets. The random generator currently selects single-input components; shared-support layouts are authored explicitly until generation rules can deliberately close support constraints.
- Codes depend on library geometry. Exact tree exports also retain the used definitions, palette/provenance, parameters and workspace hash; a bare code cannot guarantee identical artwork against an edited library.
- Future components generally need only stable IDs and socket metadata. New semantics such as transforms, variable-length geometry, optional inputs or free-form rope constraints must be explicit typed extensions/version changes, with validation and round-trip tests. Unknown statements are errors, never silently ignored. No promise of arbitrary future geometry is implied by the format.

See [generator contract](CAT_TREE_GENERATOR.md) for artwork, persistence, lab scope and HA rollout gates.
