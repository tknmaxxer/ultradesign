# 2 · Write the design system before the screen

## Input

Selected pattern notes, representative content and long or missing values, target devices, current tokens and primitives, and the allowed migration scope.

## Work

1. Specify the priority at first glance and the shortest path to the primary action. Define the page regions and their order using real content. At each layout transition, state what stays visible, what changes position or density, and where the action moves. Choose transitions where the content needs them.
2. Start from semantic roles: surface, text, accent, border and status colors; display, heading, body and label typography; spacing, radius and elevation. Reuse existing tokens and grid. For a new system, name a spacing scale in 4px increments and map gutters, gaps, margins and padding to it. Keep type metrics and optical corrections distinct from spacing tokens. State the scope and reasons for any existing-grid migration or exceptions.
3. Establish grouping with type, alignment, and whitespace first. Use a faint divider only where adjacent groups need separation. Keep the base surface flat and assign one purposeful elevation to a floating element when depth communicates its function. Express density, emphasis, and state through variants of the same component; use inline sections on a shared surface for related items.
4. Fill the [design contract](../assets/templates/design-contract.md), repeating the component section for each reused, changed, or new component. Map real props/data and content limits to anatomy, tokens, variants, states, keyboard and focus behavior, responsive rules, and observable checks. Assign ownership of each state (component, route, or service). Mark checks at the width or interaction where a failure would appear.

## Output

A design contract that a builder can use without guessing visual roles or data behavior. Include the selected patterns, hierarchy and layout changes, token table, component contracts, and a direct way to verify each material decision.
