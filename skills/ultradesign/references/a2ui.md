# A2UI catalog and renderer

Screens are generated as [A2UI v1.0](https://github.com/a2ui-project/a2ui/tree/c26be2dd087b541c46e0296c164ae13bf35f7836/specification/v1_0)
JSON and drawn only with the project's design-system components. The model
picks components, content and emphasis; colors, type, spacing and layout live
inside the components. A screen that names an unknown component or a style
property fails validation before anything renders.

## Catalog

A catalog is a JSON file following the A2UI catalog definition
([vendored schemas](../assets/a2ui/README.md)). Build it from the approved
`/system` components:

- **Roles.** Declare each component's role as
  `"metadata": {"extensions": {"ud_role": "frame" | "content" | "action"}}`.
- **Frames** are layout containers with a `layout` enum. Each value is an
  arrangement taken from an approved screen or a picked reference (for example
  `lead_aside` from an approved list + panel screen, `split` from the picked
  hero). Add a frame by recreating that arrangement with the system's
  components, rendering it beside the source at matching widths, and getting it
  approved with the catalog.
- **Content** components take a required `emphasis` of `p1`, `p2` or `p3`.
  **Action** components take `primary` or `secondary`. The renderer maps these
  to the system's type and button roles; the catalog has no size, color, font,
  spacing, class or HTML properties.
- **Child references** use the spec's `ChildList` (or `ComponentId` for one
  child) so renderers and the validator can walk the tree; a plain string
  array is invisible to them.
- **Links, media and events** are enums of approved targets, assets and event
  names. Free text is for copy only.
- **Content-bearing.** A component draws its content as text, data or an
  approved asset. A box with an icon and two words is a sign the component is
  missing its content, not a design.
- **Names.** Component names, property names, component IDs and extension
  keys follow UAX #31 (letters, digits, `_`; no hyphens). The official
  renderers reject hyphenated IDs even though the JSON schema allows them;
  `catalog.instructions` should say so.
- **Renderer rules live in the schema.** Anything the renderer refuses —
  timestamp formats, patterns, enums, list lengths — is declared in the
  catalog (`"format": "date-time"`, `pattern`, `enum`, `maxItems`) so
  `a2ui-validate` catches it before render instead of the renderer failing.
- `instructions` tells the generating model the composition rules in plain
  sentences (root component, which components appear once, how bindings work).

## Renderer

Use the official renderer's custom-catalog path for the stack (for React,
`@a2ui/react` + `@a2ui/web_core` with CSS Modules and Base UI components). The
renderer:

- validates the message before rendering and shows a visible error otherwise;
- marks the generated area `data-ud-surface="<surfaceId>"` and each component
  root `data-ud-id`, `data-ud-component` and, when present,
  `data-ud-emphasis`, so the hierarchy check can measure it;
- exposes a `/system` page that shows every catalog component at every
  emphasis value, for the catalog gate;
- keeps product chrome (wordmark, footer) outside the generated area.

Install the [guard](../assets/templates/guard/README.md) in the renderer
project and run it before every build. It fails the build on color literals,
raw font sizes, font families outside the tokens, inline styles and UI imported
from outside the system.

## Validate

```sh
uv run --script scripts/a2ui-validate --catalog catalog.json            # catalog alone
uv run --script scripts/a2ui-validate --catalog catalog.json \
  --screen screens/handoff.json --hierarchy hierarchy/handoff.json     # before rendering
```

The validator checks the catalog against the A2UI catalog definition and the
role conventions; the screen against the A2UI envelope and each component's
catalog definition; renderer identifier rules; a single `root`, known children,
allowed parents/children, no reuse, no cycles, nothing unreachable; data
bindings resolve to the declared type; and, with `--hierarchy`, the approved
table. Exit 0 valid, 1 findings, 2 unreadable input.

Pass the findings back to the generating model verbatim and regenerate. Change
the catalog only through the catalog gate.
