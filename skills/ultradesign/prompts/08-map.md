# 8 · Composition map

Output: `composition.json` (and a hierarchy table per product screen), the numbered map board; the gate `map`. Roles: UX and content, UI and system. Needs the approved direction, system, motion spec and assets. Field meanings: [hierarchy guide](../references/hierarchy.md).

1. **Per section** write one entry in `composition.json`:
   - one P1, P2/P3 items, one primary action, frame and copy budgets (the hierarchy table); say why this P1 and action are right for the task;
   - the **asset** that fills it (`assets.json` id, Storybook component or scene);
   - the **motion beat** from the approved spec (at most one or two signature sequences on the page; productive or none elsewhere);
   - the **visual role**: `image`, `scene`, `product-ui`, `illustration`, `data` or `typographic`. No section without one;
   - the **states** it can reach, from the state matrix;
   - the **responsive** rule at 390 / 768 / 1440 and between, as a rule;
   - the card **principles** it applies.

   Set `page` to `expressive`, `reading` or `product`. A `typographic` section on an expressive page needs an `ownerException` in the owner's words; do not add it yourself.
2. **Short headings, one-sentence descriptions.** The page earns length through content and visuals, not paragraphs.
3. **Render the board** and show it:

   ```sh
   uv run --script scripts/screen-map composition.json --out map/index.html
   ```

4. **Gate `map`.**
   - Artifact: the numbered map board.
   - Reason: the page's story in one line, tied to the brief's core task.
   - Look at: the order of sections; each section's main message and action; where the signature motion sits; how a section changes on the phone.
   - Ask: "Tell the page's story in your own words from top to bottom. Where does the order feel different from how you would tell it?"
   - Reorder, drop or re-prioritise sections from the reply (restate first); generation uses the approved tables exactly.

Done when no section lacks a visual role and the breakpoints are written as rules.
