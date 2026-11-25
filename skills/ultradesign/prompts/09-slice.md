# 9 · Thin end-to-end slice

Output: one core task built end to end with all its states, in the browser; the gate `slice`. Role: Implementation. Needs the approved system and the motion spec, map and assets for included stages. For short depth, use the existing-system and structure evidence under [scope applicability](../SKILL.md#applying-scope-downstream). Build the thin slice before the screen count grows.

1. **Pick the core task** from the brief (the task whose failure would make the site pointless) and build it completely: normal, loading, empty, failure and permission states where the task can reach them, real content, responsive layout and its motion beat integrated. Look up and reuse the actual components via [Storybook](../assets/templates/storybook/README.md#agent-component-lookup) first. Connect the real data/API and routing contracts; isolated story fixtures are not a finished task. Reassess prototype code against production requirements rather than promoting its demo behavior unchanged.
2. **Product UI and content sections via A2UI.** Generate one A2UI v1.0 `createSurface` per screen from the real content, the catalog (including its `instructions`) and the approved table, with the table's component IDs and emphasis exactly. Follow the [A2UI guide](../references/a2ui.md).

   ```sh
   uv run --script scripts/a2ui-validate --catalog catalog.json --screen screens/slice.json --hierarchy hierarchy/slice.json
   ```

   Give findings back to the generator verbatim and regenerate. A finding that needs a new component goes to the Lead and, at stage 10, the build-out gate. Hero scenes and motion set pieces are catalog `media` / `scene` components with approved assets, not free composition.
3. **Guarded build.** The guard runs first (`node guard/check.mjs .`); scene and motion files are listed in `motionEntries` / `sceneEntries`. Start the app and run the hierarchy check at 390, 768 and 1440:

   ```sh
   uv run --script scripts/hierarchy-check --url http://127.0.0.1:5173/ \
     --hierarchy hierarchy/slice.json --out out/slice/hierarchy
   ```

   When a check fails, decide where the fault lives: the screen JSON (regenerate), the renderer's emphasis mapping or a frame (fix and show at the next gate), or the table (back to the owner).
4. **Task stories** import the same components as the app and link each reachable slice state to the matrix. Add `play` assertions for the outcome, failure and recovery, not only a click. Follow the [coverage and visual regression contract](../assets/templates/storybook/README.md#coverage-contract); run the affected Storybook tests after the changes are ready.
5. **Walk it yourself** in the app at 390, 768, 1440 and between, in every reachable state, with keyboard and touch input. Check direct links, refresh, back navigation and expired permission when applicable; verify actual submission and recovery at the system boundary. Use long Korean/mixed-language copy, empty data, missing imagery, enlarged text and pre/post-font-load layout. Check no-hover input, landscape and virtual-keyboard behavior on a capable device, or mark those checks unverified. Open the first-view and full-page PNGs. Note anything that reads as filler, empty or repeated. Publish on the share.
6. **Gate `slice`.**
   - Artifact: the app link and reachable states to try, with excluded states explained.
   - Reason: which core task it completes.
   - Look at: the task from start to finish; what the page says in each state; the phone; the motion beat; what happens on a wrong input.
   - Ask: "Do the task and break it on purpose. What did the page say or do at each point, and what did you expect instead?"

Done when the task completes in every state at 390 / 768 / 1440 and between.
