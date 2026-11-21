# 3 · Build components and the real route

## Input

Design contract and pattern notes, live project structure, showcase links, real task content and state fixtures.

## Work

1. Trace the route from entry to completion in the existing stack. Find the reusable primitives, tokens and tests already on that path. Decide where each data source and state plugs in before styling.
2. Recreate each chosen component from the useful part of its reference. From a showcase link, inspect anatomy, state, focus behavior, and the part worth carrying over. Map the study onto the project's headless or accessible primitives, semantic tokens, and component API. In an open React stack, Base UI is one option for behavior such as menu navigation and focus return. Prefer a faithful reconstruction of the pattern with project assets and copy; reuse external code or assets when their terms allow it.
3. Build shared variants in the existing component catalog or Storybook when it helps exercise them. For a small screen, iterate in the running app. Use a canvas when a layout comparison is cheaper there, then reconcile the handoff against rendered code. For a landing page, consider section patterns from 21st.dev, show what the product does near the main action, and use relevant product imagery with usable responsive crops and alternatives.
4. Wire the primary path and its relevant loading, empty, error, disabled, and success states with representative data. Render the actual route once and reconcile visible deviations with the contract. Update the contract where the rendered behavior changes an earlier decision.

## Output

Runnable route and local run instructions, an inventory mapping contract components to implementation and catalog entries, and a list of verifiable states and actions for the motion and QA passes.
