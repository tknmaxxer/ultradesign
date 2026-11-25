# Renderer guard

Copy `check.mjs`, `stylelint.config.mjs`, `eslint.config.mjs`, and this README into the app as `guard/`. Add `ud-guard.config.json` at the app root. `tokens`, `sources`, `systemEntries` and `fontFaces` are required; `motionEntries` and `sceneEntries` are optional arrays, defaulting to empty:

```json
{
  "tokens": "generated/tokens.css",
  "sources": "src",
  "systemEntries": ["src/catalog", "src/system/index.tsx"],
  "motionEntries": ["src/motion"],
  "sceneEntries": ["src/scenes"],
  "fontFaces": ["Instrument Sans"]
}
```

Paths resolve from the app argument, not the guard directory. Configured paths and source files must exist without symlinks; dependency symlinks are allowed. `sources` is one directory. System entries must be inside it: a directory permits its descendants to implement UI and product code to import their components; a file grants those permissions only to that file. Sources outside system, motion and scene entries are product code. Use relative component imports, including extensionless files and directory indexes; TypeScript `.js` imports may resolve to `.ts`. Component imports through unresolved aliases are rejected.

Install app development dependencies with its existing package manager: `eslint` (9), `stylelint` (16), and `postcss-value-parser` (4). Apps containing `.ts`, `.tsx`, `.mts`, or `.cts` also need `@typescript-eslint/parser` (8) and a TypeScript version supported by that parser. No `tsconfig` or type-aware lint setup is required. Dependencies resolve from the app, even when the guard lives elsewhere.

Run `node guard/check.mjs .` from the app, or `node /path/to/guard/check.mjs /path/to/app`. Set the app's `prebuild` script to `node guard/check.mjs .` (chain an existing prebuild rather than replacing it).

Only the exact `tokens` file is exempt from linting; its custom properties supply the token allowlist. Regenerate it from `DESIGN.md` and check freshness with `design-tokens --check` separately. Other source CSS rejects hex, rgb/rgba/hsl/hsla colors, px font sizes, font shorthands, and generated namespace redeclarations or `@property` registrations. Font families require exactly one generated `var(--*-font-family)` without fallbacks; font-size variables must be generated `--*-font-size` tokens. Any generated namespace is allowed, including component typography tokens. Other font-size units and CSS-wide reset keywords remain valid. `fontFaces` allows the listed literal family names only inside `@font-face`.

JS/TS rejects `<style>`, font-size/family attributes, and untokenized JSX paint. Outside motion and scene entries it also rejects JSX `style`, `.style` access, animation scheduling and motion/scene library imports. Paint accepts declared `var(--color-*)` tokens, `none`, `currentColor`, `transparent`, `inherit`, or `url(#id)`. Motion and scene entries may pass computed token values to paint props. Product JSX must import components through system entries; native `button`, `input`, `select`, `textarea`, and `summary` controls belong inside the system. Locally defined components may compose native layout. React `Fragment`, `StrictMode`, `Suspense`, `Profiler`, `Activity`, and `ViewTransition`, plus the official named `@a2ui/react` `A2uiSurface`, are infrastructure exceptions. System code may import Base UI or other libraries while obeying styling rules. Product prop spreads and all `createElement` calls are rejected; system and visual code may forward props.

Source CSS and JS/TS are checked recursively without app lint configuration or inline disable comments. `node_modules` and `.git` directories are skipped. SCSS/Sass/Less/Stylus and Vue/Svelte/Astro/MDX source files fail instead of escaping coverage. Copy budgets belong to hierarchy validation, not this guard.

Exit codes: `0` passed; `1` CSS/JS/TS lint violations or warnings; `2` invalid usage/configuration, missing dependencies, unsupported source files, or guard execution failure. The guard never rewrites files.

Motion and scene entries follow the same path rules as system entries. They may use JSX `style`, `.style`, `requestAnimationFrame`, and imports of `gsap`, `motion`, `three` and `@react-three/*`. They implement visual components; product code still imports only system components. Expose each scene or motion component through a system wrapper, rather than importing the implementation into product code. Ordinary system entries do not grant animation permissions.

No JS/TS source may contain hex or rgb/rgba/hsl/hsla color literals, including motion and scene entries. Read colors through generated `tokens.colors` or `getComputedStyle` with a generated property name. Emit `tokens.ts` into `generated/` outside `sources`, import it from visual code, and include it in the `design-tokens --ts generated/tokens.ts --check` freshness command. Generated values remain owned by `DESIGN.md`; do not hand-edit or use that directory for application logic. Keep Storybook MDX and stories outside `sources` too; Storybook tests check them independently. The guard is a source policy check, not a runtime data-flow verifier.
