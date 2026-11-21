# 3 · Build components and the real route

## Input

Design contract and pattern notes, live project structure, showcase links, real task content and state fixtures.

## Work

1. Read the written design contract before editing. Trace the route from entry to completion in the existing stack. Find the reusable primitives, tokens and tests already on that path. Decide where each data source and state plugs in before styling.
2. **Recreate first.** With project data, copy and assets, build a private study of the lead screen's layout, type roles, spacing, responsive reflow and the treatment of a key component. Render at the same widths as the reference. Compare edges, density and component relationships and correct the biggest mismatch before adapting. Keep required brand and accessibility constraints.
3. **Adapt second.** Carry the recreation's shell, type scale, spacing roles and key component anatomy into the running route. In a blank project, start from the recreated markup and styles; in an existing project, merge the relevant units into the existing primitives and tokens. Keep a map of retained and changed decisions. Apply changes one layer at a time for concrete project needs. A new palette or layout needs a specific reason from the product, not a fresh theme after the study. Use project-owned code, assets and copy.
4. Wire the primary path and its relevant states with representative data. Exercise variants in the existing catalog or on the running route. Render the real route and reconcile visible deviations with the contract. Record contract changes that the comparison justifies.

## Output

Private recreation and same-width comparison, runnable adapted route and local run instructions, and an inventory mapping contract components to the implementation and verifiable states for motion and QA.
