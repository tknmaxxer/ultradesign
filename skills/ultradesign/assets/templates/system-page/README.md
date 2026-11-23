# Integrating the /system template

Copy `SystemPage.tsx` and `SystemPage.module.css` into your React application.
Mount `SystemPage` at the application's `/system` route, using the existing
router. This is source, not a standalone application or an installer.
It uses React, CSS Modules and Base UI (`@base-ui-components/react`, the import
namespace used by the research application). Use the project's lockfile-selected
package manager for any explicitly approved dependency changes. If the project
uses the renamed `@base-ui/react` package, update the four import namespaces to
match that installed package; do not install a second Base UI copy.
No Tailwind, external font fetch, icon package or product data is bundled.

## Generate from the design file

From your application/project root, substitute the actual installed skill path:

```sh
uv run --script /path/to/ultradesign/scripts/design-tokens DESIGN.md \
  --out src/system/tokens.css --catalog src/system/catalog.generated.json
uv run --script /path/to/ultradesign/scripts/design-tokens DESIGN.md \
  --out src/system/tokens.css --catalog src/system/catalog.generated.json --check
uv run --script /path/to/ultradesign/scripts/design-lint DESIGN.md \
  --executable ./node_modules/.bin/designmd
```

Import the generated CSS once at the app entry, import the catalog JSON, and
render `<SystemPage catalog={catalog} roles={roles} content={content} />`.
Enable the app's normal JSON and CSS Module TypeScript support. Import the
exported `SystemRoles` and `SystemContent` types to type the two objects.
Load the actual fonts declared in DESIGN.md through the application's existing
font setup. The template does not silently substitute product fonts.

## Public interfaces

`TokenCatalog` has six arrays: `colors`, `typography`, `rounded`, `spacing`,
`motion`, `components`. Each `Token` is
`{path: string, value: string | number, resolved: string | number, css: string}`.
Every record corresponds to a real emitted custom property. Composite aliases
expand to leaves (for example, `components.button.typography.fontSize`).
`value` preserves the scalar source or the expanded leaf reference; `resolved`
is the final primitive. This differs from the research app's catalog, which
kept composite objects as non-emitted catalog entries.

`SystemRoles` explicitly maps the scaffold onto your design, with no private
palette, font, density or radius defaults:

- `colors`: `canvas`, `surface`, `field`, `text`, `muted`, `border`,
  `controlBorder`, `focus`, each a color token path.
- `typography`: `body`, `title`, `label`, `code`, each a typography group path
  (not a CSS custom property). Give each role its actual fontFamily, fontSize,
  fontWeight and lineHeight; letterSpacing and font-feature settings are
  used when present.
- `spacing`: `gap`, `section`, `gutter`, `row`, `phoneRow`, each a dimension
  token path, not a unitless column count.
- `radius`: a rounded token path.

Missing role paths fail visibly rather than falling back to an unrelated
product's design. The 700px scaffold breakpoint and two-column specimen layout
are editable template layout choices, not claims about your product.
Set application body margin to zero if your app has no baseline reset.

`SystemContent` requires `name`, `summary`, `task`, `source`, `typeSample`,
`items`, and `statuses`. Bring a small, approved excerpt of real project
content; explain the task in `task` and the source/date/redaction in `source`.
Do not copy Cataly lane records or invent real-looking production events.
`typeSample` should include the project's actual language and numeric content.

Each item is `{id, title, detail, status, metadata}`; IDs must be unique.
Each status is `{id, label, description, glyph, colorToken}`; status IDs must
be unique, and each item must reference one. `glyph` is a distinct React node
from your approved icon set or a shape, not just another colored circle.
`colorToken` is a color token path. Supply statuses even when the record list
is empty so the state legend remains useful. Text labels and accessible glyph
names preserve meaning without color. Keep actual times/time zones in metadata.

## What to inspect

The contextual list filters, sorts through a keyboard-operable Base UI menu,
and selects real supplied records. Detail text stays on the same surface
hierarchy and moves below the list on mobile. Tabs switch local note/feedback
specimens. The required note field produces an associated validation message;
saving and reset are real in-memory actions, explicitly not owner decisions.
The disabled publish control explains why it cannot act.

Hover and press the controls; use Tab/Shift+Tab, Enter, arrow keys and Escape.
There are no static pretend focus rings. Empty/loading/error previews are
explicitly labeled specimens, not fake requests or a no-op retry. Wire product
loading/errors in the product itself. The foundation ledger is generated data,
including typography, spacing, shape, action-triggered motion and all component
leaves; it does not invent component implementations for arbitrary recipes.

Render at 390px and 1440px. Check that long real strings wrap, selection is
visible, the menu stays in view, and keyboard focus returns after Escape.
Check reduced-motion preference, zoom, loaded fonts, 4.5:1 normal text and
3:1 non-text/control contrast on the actual token combinations. The palette
board and successful token compilation do not certify accessibility.

## Tool policy and boundaries

`design-tokens` uses pinned PyYAML via uv, not a line-based YAML parser. uv may
provision that declared Python dependency; it does not install JS tools.
It accepts Google Labs alpha groups plus nested semantic groups and `motion`.
It preserves chained/composite aliases as CSS variables, detects duplicate
keys, missing/cyclic/deep aliases, invalid keys, unsafe scalar CSS and CSS
name collisions before writing either output. Numeric map keys are normalized
to strings. Arrays, nulls and booleans are not token values. Only DESIGN.md
is read; no application files, palette exports or hidden defaults affect it.
Exit codes: 0 generated/current, 1 stale/missing outputs in `--check`, 2 invalid
input or I/O failure. `--check` never creates output directories or files.
This compiler is not a complete CSS grammar or WCAG validator.

`design-lint` invokes an already-installed Google Labs `designmd`/`design.md`
binary: explicit `--executable`, then `DESIGN_LINT_EXECUTABLE`, then local
ancestor `node_modules/.bin`, then PATH. It never invokes npx or installs
anything. The JSON findings and summary are unfiltered; `ultradesign` metadata
records the policy and upstream exit. Exit 0 means the selected policy passed,
1 means findings failed it, 2 means unavailable/invalid/execution failure.
Default `--fail-on error` matches upstream; `--fail-on warning` also rejects
warnings. Alpha upstream schema support for nested groups/motion is not
guaranteed: an upstream error remains a failure, never an implicit waiver.
Review findings alongside the local compiler and document owner decisions;
do not flatten or edit DESIGN.md just to hide findings.

`palette-board` consumes `[{"src":"Observed source","colors":["#112233"],
"url":"https://example.org/palette","observedAt":"2026-11-23"}]` or
`{"palettes":[...]}`; it also accepts historical research `src/colors` records
without URLs. Use `--input palettes.json --out board.html`. Swatches are
numbered, linked to provenance and assigned stable ordered-color IDs; duplicate
ordered palettes merge all their source records. The `palette-manifest`
application/json block preserves IDs, input indices and provenance for tooling.
No page URL is guessed when missing: the source link goes to the original JSON
record and states that the page URL was not recorded.

Collect palettes only from visible public or explicitly authorized sources
through normal page controls or allowed exports. Record the precise page URL,
observed time, source label and actual colors. Do not automate login, bypass
CAPTCHAs/paywalls/access rules, mutate accounts, extract cookies/profiles or use
existing user tabs. The board performs no network requests.
