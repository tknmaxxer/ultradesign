# 6 · Design-system contract and Storybook

Output: `DESIGN.md` → generated tokens → Storybook build; the gate `system`. Role: UI and system (the Lead owns `DESIGN.md`). Plan mode writes the contract, component inventory and verification plan only; do not install, generate, build or open a system gate.

1. **Inspect and reuse.** Keep the established stack and component library. Inventory the components and patterns needed by the representative screen, not every component a future product might need. Before adding one, follow [Storybook component lookup](../assets/templates/storybook/README.md#agent-component-lookup); record the existing implementation to reuse or the concrete missing behavior. An installed UI kit is a starting point, not the site's design system.
2. **Write `DESIGN.md`** in the [Google Labs DESIGN.md](https://github.com/google-labs-code/design.md) format, using the [contract template](../assets/templates/design-contract.md): alpha YAML token values plus Markdown intent and usage rules. Derive recurring decisions from the approved representative screen. Start with base values, semantic roles and only the component tokens actually needed. Cover typography, containers, spacing, elevation, shape, imagery, motion and scene budgets. Use [SEED and Horon](../references/catalog.md#design-systems) as structural examples, not as a brand to copy. New system: 4px space grid, with justified exceptions recorded.
   - The state matrix covers only reachable states: normal, hover, focus, active, disabled, loading, empty, error/recovery, success and permission. Link each to an actual story ID; explain exclusions instead of inventing states.
   - Record component purpose, when to use or avoid it, composition patterns, content bounds, keyboard/focus policy and supported extension points. Link to source types and stories for APIs; do not transcribe props or token values into parallel tables.
   - The Lead owns shared changes. Record affected components/routes, review evidence and migration/removal of obsolete uses before changing a shared API or semantic token. Keep product-specific composition local unless reuse justifies sharing it.
   - Use the template's motion scale, productive/expressive easings, choreography rules, named brand behaviours and reduced-motion substitutes. Direction sketches establish the initial contract; stage 7 refines it and updates the same tokens and stories before implementation.
3. **Generate and lint.** Use the installed skill's absolute script paths:

   ```sh
   uv run --script /path/to/skill/scripts/design-tokens DESIGN.md \
     --out generated/tokens.css --ts generated/tokens.ts --catalog generated/catalog.generated.json
   uv run --script /path/to/skill/scripts/design-tokens DESIGN.md \
     --out generated/tokens.css --ts generated/tokens.ts --catalog generated/catalog.generated.json --check
   uv run --script /path/to/skill/scripts/design-lint DESIGN.md
   ```

   Replace the skill path with its resolved location. `tokens.ts` supplies scene values; CSS and Storybook read the same generated output. After a contract change regenerate, then check freshness and lint. Do not hand-edit generated values.
4. **Work in Storybook.** Use the app's lockfile-selected package manager; ask if none is established. Keep an existing Storybook and framework. For a new React + Vite project use the [Storybook template](../assets/templates/storybook/README.md); its React configuration is not a reason to replace another app stack.
   - Stories import the production components with the app's styles, providers and fonts. No parallel demo implementation. Replace starter specimens with the real system before calling the system gate complete.
   - Build foundations, reachable component states and at least one task pattern using the approved copy. Add realistic stress fixtures and `play` assertions per the template's [coverage contract](../assets/templates/storybook/README.md#coverage-contract). Isolated stories do not prove routing, APIs or task completion in the app.
   - Install the [guard](../assets/templates/guard/README.md) in its supported stack, with sanctioned motion and scene entries. Run Storybook Test once the changes are ready (`vitest run --project=storybook`: render, interactions and a11y). Open the rendered stories at phone and desktop widths; passing assertions alone do not establish design quality.
   - Build the static Storybook, serve it at `/system/` and verify the published story and iframe assets. Include the source/build revision and state-to-story coverage with the gate. After owner approval, retain reviewed visual baselines using the template's [visual regression procedure](../assets/templates/storybook/README.md#visual-regression).
5. **Gate `system`.**
   - Artifact: the verified Storybook link, representative pattern and state coverage.
   - Reason: how the system carries the approved direction, one line.
   - Look at: headings and type roles; body text at length; controls and recovery states; colours on images; the pattern on a phone.
   - Ask: "Look at the five things on your phone. Which one looks out of place next to the others, and what makes it stand out?"
   - Apply the owner's reply at its source (contract, component or story), regenerate affected output, recheck and reopen the gate.

Done when the in-scope production components and patterns are represented in Storybook, reachable states have linked stories, render/interaction/a11y checks pass, and the owner has approved the rendered system. Missing coverage stays explicit, not hidden behind the starter's passing tests.
