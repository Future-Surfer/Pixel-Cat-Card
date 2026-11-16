# Editor Workbench

Open **Create → Editor Workbench** in [Frame Studio](http://127.0.0.1:8767/) or go to the [local workbench](http://127.0.0.1:8769/prototype/editor-workbench.html).

- Drag a handle onto another handle to reorder. Drop a field on a section heading to move it there. The inspector also offers **Before**, **After** and **Into section** buttons.
- Click an item’s handle or use **Jump to item**. Labels and descriptions preview in the live editor. Use **Notes or feature ideas** for changes such as a different control, different animation, or new behaviour.
- **Whole editor**, **Welcome block**, **Welcome message**, **Animated cat preview**, the colour swatches and the save message have their own note targets. Switch card purpose for the utility editors. **Preview** hides the handles and **Narrow** checks a smaller editor width.
- Working changes autosave in the browser. **Save for review** records the draft in the same local journal as Frame Studio. Share **Open saved review** or the version from **Asset changes**. That link shows the exact moves, wording and notes even after later edits. **Export draft** downloads a recoverable copy.

The workbench uses a local copy of the real editor. Editing a sample setting changes the preview session. Layout, copy and notes become a proposal, with the original labels and build hash retained for review. Implementing a proposal uses the reviewed editor source and its normal validation and tests. Use `?draft=qa-<name>` for isolated testing.
