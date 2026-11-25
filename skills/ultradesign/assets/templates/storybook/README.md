# Storybook system gate

Copy this directory's contents, including `.storybook/`, into the React + Vite
app. Merge existing Storybook and Vitest configuration rather than overwriting
it. Keep `stories/` and `generated/` outside the guard's application `sources`.
The example component is a local selection action, not a product component.
Replace its stories with imports of the actual app components and the reachable
states in `DESIGN.md`; never keep a separate Storybook implementation of the UI.
Preserve the app's story locations and merge their discovery globs into `main.ts`,
except where stories or MDX sit inside the guard's `sources` (the guard rejects
`.mdx` there and lints story fixtures as app code). Move only those story and MDX
files outside `sources`, update their imports and the discovery globs, and record
the move. Production components remain inside the guard's application sources;
excluding story fixtures must not exclude the components they exercise.

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

## Coverage contract

Storybook is the component workbench throughout system, slice and build-out,
not a gallery made after implementation. Develop a component's behavior in its
stories, then use that same export in the application. Keep these surfaces:

- Foundations: generated tokens plus real typography, containers, imagery and
  motion specimens. Import values; document purpose and usage, not a second
  manually maintained token or prop catalog.
- Components: a story for each reachable state in `DESIGN.md`, using source
  props and actual styles. Document when to use/avoid it, accessible naming,
  focus behavior and extension points alongside its stories.
- Patterns: at least one composition from the core task, with the same providers,
  fonts and component exports as the app. Add page/task stories in the slice.
  Fixtures may isolate data and network states here; they are not proof that
  production APIs, authentication or routing work.

Map requirements to stable story IDs in the contract's state matrix. Include
long Korean/mixed-language copy, empty data, missing imagery and supported themes
where relevant. Do not multiply every component by impossible states. Use real
keyboard/pointer events in `play`, assert observable outcomes and recovery, and
check focus return for overlays. Do not style a fake focus state to pass a test.

At the gate, inspect the rendered stories at phone and desktop widths, enlarge
text and inspect intermediate widths on the representative pattern. Report
missing coverage and the source/build revision alongside render, interaction
and a11y results. Passing the starter stories is not product-system coverage.

## Visual regression

After the owner approves the rendered system, use the project's visual regression
runner against the same stories. If none exists, add focused Playwright screenshot
tests against the static Storybook's `iframe.html?id=<actual-story-id>&viewMode=story`
using `expect(page).toHaveScreenshot()`. Obtain IDs from the built story index;
select the in-scope component and pattern states, not every page in the product.

Keep the browser version, OS, fonts, viewport, theme, fixtures and motion preference
fixed. Wait for fonts, images and the state under test to settle, not a sleep.
An iframe screenshot does not prove that a `play` assertion ran; verify any
interaction-produced state before capturing it. Interaction tests remain separate.
Keep reference/actual/diff images on failure. Review differences against intent;
update a baseline only after the intentional change is approved, never to erase
a failure. A pixel match proves consistency with the baseline, not good design.
Record unrun visual comparisons as unverified, not as a passing Storybook test.

## Agent component lookup

Run the dev server and connect the agent to `http://localhost:6006/mcp` through
its MCP configuration. The addon supplies the endpoint; the static share does
not run an MCP server. Before creating UI, use `docs-list` to find existing
components and unattached docs, then `docs-show` to inspect their actual props
and stories. Use `docs-show-story` when further examples are needed and `test-run`
after changes. The manifest is enabled for this React framework. Do not invent
props or treat a story name as a component API.

Use this lookup before each new component in system, slice and build-out. Record
the source and story reused, or the missing behavior that needs an extension.
If MCP is unavailable, read the component source, types, MDX and stories directly;
the built story index helps locate the rendered examples. Do not claim an MCP
call ran when it did not. Shared changes go through the Lead with affected
consumers, updated stories and migration evidence; the static build and live
MCP docs must describe the same source revision at handoff.

## Official sources

- [Playwright visual comparisons and baseline review](https://playwright.dev/docs/test-snapshots)
- [React + Vite framework and build output](https://storybook.js.org/docs/10/get-started/frameworks/react-vite)
- [Storybook 10 requirements](https://storybook.js.org/docs/10/get-started/install)
- [MDX and addon-docs](https://storybook.js.org/docs/10/writing-docs/mdx)
- [Vitest addon and Vitest 4 project configuration](https://storybook.js.org/docs/10/writing-tests/integrations/vitest-addon)
- [Accessibility checks and test behavior](https://storybook.js.org/docs/10/writing-tests/accessibility-testing)
- [Components manifest configuration](https://storybook.js.org/docs/10/api/main-config/main-config-features#componentsmanifest)
- [Official MCP addon, docs-list and docs-show](https://storybook.js.org/docs/10/ai/mcp/overview)
