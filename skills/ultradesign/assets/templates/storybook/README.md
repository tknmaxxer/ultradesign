# Storybook system gate

Copy this directory's contents, including `.storybook/`, into the React + Vite
app. Merge existing Storybook and Vitest configuration rather than overwriting
it. Keep `stories/` and `generated/` outside the guard's application `sources`.
The example component is a local selection action; adopt existing system
components and replace its stories with the reachable states in `DESIGN.md`.

## Install and generate

Use the package manager selected by the app's lockfile (Bun, pnpm, npm or Yarn).
If there is no lockfile, establish the project's package manager first. Add
development dependencies using that manager's `add -D` / `install --save-dev`:

- `storybook@~10.6.0`, `@storybook/react-vite@~10.6.0`,
  `@storybook/addon-docs@~10.6.0`, `@storybook/addon-vitest@~10.6.0`,
  `@storybook/addon-a11y@~10.6.0`, `@storybook/addon-mcp@~10.6.0`
- `vitest@^4`, `@vitest/browser-playwright@^4`, `playwright`, `typescript@~6.0.3`,
  `@types/react`, `@types/react-dom`; retain the app's compatible React and Vite.

The official docs served version **10.6** when this template was checked.
`features.componentsManifest: true` is the current key, not the old experimental
flag. Keep the six Storybook packages on the same patch release in the lockfile.
Storybook 10 is ESM; the app package must use `"type": "module"` and a supported
Node version (20.19+ or 22.12+). Install Chromium with the package manager's local
`playwright install chromium` command.
TypeScript 6 is pinned here because the guard's typescript-eslint 8 parser
does not support the TypeScript 7 API.

From the app root, run the skill's `design-tokens` executable with:

```sh
design-tokens DESIGN.md --out generated/tokens.css --catalog generated/catalog.generated.json --ts generated/tokens.ts
design-tokens DESIGN.md --out generated/tokens.css --catalog generated/catalog.generated.json --ts generated/tokens.ts --check
```

The sibling `design-contract.md` template supplies the exact semantic names used
by the working specimens. Derive them from the approved direction. The MDX token
table reads the generated catalog directly; do not maintain a separate value
table. The compiler emits `export const tokens = { colors, motion: { duration,
easing } } as const` plus `Tokens`, `MotionDuration` and `ColorToken` types.
Colors retain their nested semantic paths and resolved CSS values. Duration
numbers are milliseconds; easing values are CSS strings under `productive` and
`expressive`. Convert ms to seconds for GSAP/Motion and convert CSS color formats
at the renderer boundary if the scene library does not support that format.

## Build, review and test

Add app scripts `storybook: "storybook dev -p 6006"`,
`build-storybook: "storybook build"` and
`test-storybook: "vitest --project=storybook"`. Use the lockfile manager to run
them. For CI run `vitest run --project=storybook`; the included Vitest 4 project
uses Playwright Chromium. It checks rendering, `play` interactions and a11y
(`parameters.a11y.test: 'error'`). Preserve any existing Vitest projects.
Storybook 10.6's Vitest plugin supplies preview annotations automatically;
no duplicate `setProjectAnnotations` setup file is needed.

Serve the **contents of `storybook-static/`** on the share under `/system/`;
redirect `/system` to `/system/` so relative assets resolve. That static build
is the owner gate. Review headings, body text, every reachable component state,
colors on imagery, and mobile widths. Do not build another hand-maintained
system page. Check the published path and its iframe assets before presenting
the gate; a successful local build alone is not share evidence.

The seven TaskAction stories cover normal, hover, focus, disabled, loading, empty
and error. Hover/focus use real pointer/keyboard events in `play`. Loading is an
explicit pending fixture, not a timed fake request. Normal and error assert the
local action result. Extend this matrix with permission and recovery states when
the task reaches them. The motion story checks reduced motion; the toolbar uses
the device preference by default, and its reduced option forces the substitute.
Imagery shows actual wide/narrow vector crops, explicitly labelled as a template
study; replace these with approved assets and provenance.

## Agent component lookup

Run the dev server and connect the agent to `http://localhost:6006/mcp` through
its MCP configuration. The addon supplies the endpoint; the static share does
not run an MCP server. Before creating UI, use `docs-list` to find existing
components and unattached docs, then `docs-show` to inspect their actual props
and stories. Use `docs-show-story` when further examples are needed and `test-run`
after changes. The manifest is enabled for this React framework. Do not invent
props or treat a story name as a component API.

## Official sources

- [React + Vite framework and build output](https://storybook.js.org/docs/10/get-started/frameworks/react-vite)
- [Storybook 10 requirements](https://storybook.js.org/docs/10/get-started/install)
- [MDX and addon-docs](https://storybook.js.org/docs/10/writing-docs/mdx)
- [Vitest addon and Vitest 4 project configuration](https://storybook.js.org/docs/10/writing-tests/integrations/vitest-addon)
- [Accessibility checks and test behavior](https://storybook.js.org/docs/10/writing-tests/accessibility-testing)
- [Components manifest configuration](https://storybook.js.org/docs/10/api/main-config/main-config-features#componentsmanifest)
- [Official MCP addon, docs-list and docs-show](https://storybook.js.org/docs/10/ai/mcp/overview)
