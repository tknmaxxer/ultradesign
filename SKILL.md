---
name: ultradesign
description: Design, redesign, or visually review websites, landing pages, dashboards, and app interfaces by extracting useful patterns from references, defining design tokens and component variants, implementing in the existing stack, and verifying responsive behavior, accessibility, and motion on rendered screens. Use when asked for frontend design direction, a design system, a less generic UI, or visual QA after implementation.
---

# Ultradesign

Turn references into decisions, decisions into reusable UI, and rendered UI into evidence. A reference is not a spec: borrow the pattern that solves a problem, not the other product's identity.

## 1. Frame the job

- Identify the audience, the primary task, and the most important screen or route. For existing products, inspect that route, its actual content, the current tokens and components, and adjacent screens that must stay consistent.
- Respect the requested scope. A review produces findings, not edits. A plan states what to build and verify, without claiming implementation. An implementation includes the rendered result and QA.
- Follow explicit brand or visual direction. If none is given, pick a direction tied to the product and say what should stand out and what should stay quiet.

## 2. Extract patterns from references

- Start with a few references for the same task, content density, or interaction. For each, record **pattern → user benefit → adaptation**. For example: a sticky action row keeps completion within reach on small screens; adapt it with the product's own button language and safe-area spacing.
- Combine patterns where useful. Do not copy a full page, distinctive artwork, typography files, or third-party code without permission or a suitable license. Use original or licensed assets.
- If references are unavailable, use the existing product or a task-specific wireframe, and say what informed the direction. For sources and examples, see [reference selection](references/pattern-library.md).

## 3. Write the smallest useful design contract

- Reuse the project's tokens and component inventory. For new work, start with semantic colors (surface, text, accent, status), type roles, spacing, and radii. A 4px spacing base is a useful starting point, not a reason to override an existing grid or force text metrics onto it.
- Define layout hierarchy and responsive changes before styling: what takes priority, what stacks, and what moves or collapses. Use real copy and realistic data where available.
- Specify reusable variants and relevant states: focus, loading, empty, error, disabled, and success where the flow needs them. Use a component catalog such as Storybook if one exists or is justified by the number of shared variants; do not add it for a one-off screen.

## 4. Build where the interface runs

- Implement in the current stack and follow its conventions. Prefer existing accessible primitives; where custom styling is needed, use unstyled or headless primitives that preserve keyboard and focus behavior. In a small project, iterate in the real screen unless an off-code prototype would resolve a question more cheaply.
- Use layout, typography, spacing, and dividers before adding another surface. Remove nested cards, redundant borders, and stacked shadows that don't express grouping or elevation. Keep cards or shadows that serve a clear purpose.
- Design motion separately: name the trigger, what changes, and what the motion explains. Prioritize state feedback and continuity over repeated entry effects; keep the interaction usable with reduced motion.
- For landing pages, lead with the clearest evidence of what the product does. Add sections only when they answer a visitor's question. For stack examples, see [reference selection](references/pattern-library.md).

## 5. Verify the real flow

- Render the changed routes at mobile, tablet, and desktop widths, including a width near a layout transition. Exercise the primary task, not only the first viewport. Use [visual and interaction QA](references/visual-qa.md) for the detailed pass.
- Fix findings within scope and rerun the affected checks. Report the route, viewport or input method, and result. If rendering, device checks, or assistive-technology checks are unavailable, name the gap. A source inspection does not count as a rendered check.
