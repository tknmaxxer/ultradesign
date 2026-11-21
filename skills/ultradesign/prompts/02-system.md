# 2 · Write the design system before the screen

## Input

Selected pattern notes, representative content and long or missing values, target devices, current tokens and primitives, and the allowed migration scope.

## Work

1. Specify the first-glance priority and shortest path to the primary action. Translate the observed reading order to the real data. Draw the alignment grid: content bounds, column widths, shared left edges or baselines, gutter and column spans. At 390/768/1440px state where the key action lands, which detail remains visible, and what wraps, moves or collapses. Decide density by job: choose an actual row height, line length or items visible before scroll, then show how the narrow viewport still supports comparison or action.
2. Derive named surface, ink, line, action and status colors from existing tokens or the product and the reference's observed contrast relationships. Name where the accent earns attention and where a neutral carries the work. Derive an explicit type scale: for each title, heading, body, label and numeric role specify family or stack, **size / weight / line-height** and the width at which it changes, if any. Use a 4px spacing rhythm for new systems; map padding, gutters, field gaps and section gaps to actual token values. Honor the existing system and scope any migration, type metrics or optical exceptions explicitly.
3. Combine related information on a shared surface. Use alignment, type and spacing for groups, with a quiet hairline where two items would otherwise merge. Assign at most one elevation treatment to an overlay when height communicates a distinct layer. Use variants of the same anatomy for density, emphasis or state; define what changes and what always aligns.
   - For an operating dashboard, commit to this region order in the layout table: reporting controls → aligned KPI band attached to the dominant trend → compact inline breakdown → searchable records. A KPI card is a stat slot: use label, tabular value, delta and an internal rule on the band's shared surface. Keep the band compact (one row on wide screens and two short rows when narrow), then let the trend take the depth. Continue those content edges into the records. Give an app rail the role of a quiet table of contents on the same neutral surface. When the brief provides no brand palette, preserve the lead study's ink-to-surface contrast and choose a task-specific accent for the one plot mark or action that needs it.
4. Fill the [design contract](../assets/templates/design-contract.md), repeating the component section for each reused, changed, or new component. Map real props/data and content limits to anatomy, tokens, variants, states, keyboard and focus behavior, responsive rules, and observable checks. Assign ownership of each state (component, route, or service). Mark checks at the width or interaction where a failure would appear.

## Output

A written design contract that a builder can use without guessing visual roles or data behavior. Include the selected patterns, hierarchy and layout changes, token table, component contracts, and a direct way to verify each material decision. Record it and finish this stage before writing layout, styles or component code, including for the private recreation.
