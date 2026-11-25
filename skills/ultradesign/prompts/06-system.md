# 6 · Design-system contract and Storybook

Output: `DESIGN.md` → generated tokens → Storybook build; the gate `system`. Role: UI and system (the Lead owns `DESIGN.md`). Plan mode ends here as a written proposal: no app changes, no gate.

1. **Inspect** existing foundations and components first. Keep an established stack and component library.
2. **Write `DESIGN.md`** in the [Google Labs DESIGN.md](https://github.com/google-labs-code/design.md) format: alpha YAML token front matter plus Markdown rules. Derive it from the approved direction; do not ask the owner to choose tokens. Sections: purpose, colours (primitives, semantic aliases), typography, layout and containers, elevation, shape, base components with variants, **state matrix** (per component, the states the tasks can reach: normal, hover, focus, active, disabled, loading, empty, error, success, permission), **imagery rules**, **motion tokens**, **scene budget**. Motion tokens: `motion.duration.*` on a 6-step scale (70 / 110 / 150 / 240 / 400 / 700 ms), `motion.easing.productive.*` and `motion.easing.expressive.*`, choreography rules (one focal point, stagger by hierarchy), two to three named brand behaviours from the brief, and a reduced-motion substitute for each. Use [SEED and Horon](../references/catalog.md#design-systems) as structural examples. New system: 4px space grid. Exceptions are logged.
3. **Generate and lint.** Explicit paths:

   ```sh
   uv run --script /path/to/skill/scripts/design-tokens DESIGN.md \
     --out generated/tokens.css --ts generated/tokens.ts --catalog generated/catalog.generated.json
   uv run --script /path/to/skill/scripts/design-tokens DESIGN.md \
     --out generated/tokens.css --ts generated/tokens.ts --catalog generated/catalog.generated.json --check
   uv run --script /path/to/skill/scripts/design-lint DESIGN.md
   ```

   `tokens.ts` carries motion durations, easings and colour values so scene code reads tokens instead of hardcoding hex. Check freshness and lint after every revision.
4. **Storybook.** Use the package manager the app's lockfile selects; with no lockfile, establish the project's package manager first. New project: Vite + React + Base UI + CSS Modules, with the [Storybook template](../assets/templates/storybook/README.md) (Storybook 10, `react-vite`, `addon-vitest`, `addon-a11y`, `addon-mcp`, components manifest on). One story per state in the matrix; MDX pages for tokens, type, imagery and motion specimens, in real copy. Install the [guard](../assets/templates/guard/README.md) as the build's first step, with `motionEntries` and `sceneEntries` for the sanctioned motion and scene files. Run Storybook Test (`vitest --project=storybook`, render and a11y) until it passes. Build the static Storybook and publish it on the share; this is the `/system` gate. Look up existing components with Storybook MCP `docs-list` / `docs-show` before writing a new one.
5. **Gate `system`.**
   - Artifact: the Storybook link.
   - Reason: how the system carries the approved direction, one line.
   - Look at: headings and type roles; body text at length; buttons and inputs in every state; colours on images; the same page on a phone.
   - Ask: "Look at the five things on your phone. Which one looks out of place next to the others, and what makes it stand out?"
   - Apply the owner's reply in `DESIGN.md` and the stories (restate first), regenerate, recheck, reopen the gate.

Done when every component in use has stories for its reachable states and the Storybook render and a11y tests pass.
