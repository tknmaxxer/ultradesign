# Hierarchy table

A screen reads well when one thing is clearly first, a few things support it,
the rest is quiet, and the one thing to do next is obvious. Write that down per
screen (or per page section) as `hierarchy.json`, show it in the composition
map ([stage 8](../prompts/08-map.md)), get the owner's approval, then generate.
Valid A2UI with the right components can still put the wrong thing first; the
table is where the order is decided.

```json
{
  "screen": "night_oncall_handoff",
  "order": 1,
  "title": "Night on-call handoff",
  "task": "The incoming on-call sees what needs action within 30 s and confirms the handoff.",
  "frame": "lead_aside",
  "items": [
    { "id": "queue_replay", "priority": 1, "says": "queue-replay: recheck the 2 retries at 22:00 KST", "words": 14 },
    { "id": "latest_report", "priority": 2, "says": "Latest report, 20:42 KST", "words": 40 },
    { "id": "api_proxy", "priority": 3, "says": "api-proxy recovered", "words": 6 },
    { "id": "header", "priority": 3, "says": "Screen name and snapshot time", "words": 12 },
    { "id": "confirm", "priority": "action", "says": "Confirm handoff", "words": 3 }
  ],
  "primaryAction": "confirm",
  "visualRole": "product-ui",
  "asset": "Lane list with a report panel beside it",
  "motion": "None on load; panel content cross-fades on selection",
  "states": ["normal", "loading", "empty", "failure"],
  "responsive": "Panel moves below the list under 700 px",
  "principles": ["one dominant row", "status by position and type"]
}
```

## How to fill it

- **P1, exactly one.** The fact or message the person must take away even if
  they read nothing else. Usually what needs action, not the page title.
- **P2.** What supports the decision: the evidence, the record, the main list.
- **P3.** Orientation and metadata: screen name, timestamps, healthy items.
- **One primary action.** The next step for the task. Other actions are
  secondary.
- `id` is the component ID the generated screen will use (UAX #31: letters,
  digits and `_`, no hyphens). `words` is the copy budget for everything that
  component renders from its own props; keep landing headings to about six
  words and descriptions to one sentence.
- `frame` is one of the catalog's layout frames. Frames come from the chosen
  direction's key frames and the approved system, never from a picked
  reference's layout.

## Composition map fields

A page with several sections adds these fields to each section's table.
Together the entries are the composition map (`composition.json`, below).

| Field | Meaning |
| --- | --- |
| `order`, `title` | Position on the page and a short name. |
| `visualRole` | What carries the section visually: `image`, `scene`, `product-ui`, `illustration`, `data` or `typographic`. Every section declares one. |
| `asset` | The approved asset or component that fills it: an `assets.json` id, a Storybook component, a scene. |
| `motion` | The section's motion beat from the approved motion spec: a signature sequence (at most one or two on the page), a productive transition, or `None`. |
| `states` | The states the section can reach, from the state matrix in `DESIGN.md`. |
| `responsive` | How it changes at 390 / 768 / 1440 and between, written as a rule, not a screenshot. |
| `principles` | The deconstruction-card principles this section applies. Principles, not a reference's layout. |
| `ownerException` | Present only when the owner approved a text-only section on an expressive page, in the owner's words. |

```json
{
  "page": "expressive",
  "sections": [
    {
      "id": "services", "order": 3, "title": "Business areas",
      "visualRole": "illustration",
      "asset": "assets.json#service-scenes",
      "motion": "Cards wipe in on the grid, 240 ms, once",
      "states": ["normal"],
      "responsive": "Four columns at 1440, two at 768, one at 390",
      "principles": ["one scene per service", "type contrast carries the order"],
      "items": [ { "id": "title", "priority": 1, "says": "Four things we build", "words": 4 } ],
      "primaryAction": "contact"
    }
  ]
}
```

`page` is `expressive` (brand, portfolio, landing, scroll story), `reading` or
`product`. `text-only-lint` reads this file: a section whose `visualRole` is not
`typographic` must cover at least the minimum share of its area with
image / video / canvas / SVG / result fragments, and a `typographic` section on
an `expressive` page fails unless it carries `ownerException`.

Propose the map with the reasoning for each P1 and primary action. Render the
board with the [screen-map tool](../scripts/screen-map) and show it; the owner
describes where the page's order differs from how they would tell it.

```sh
uv run --script scripts/screen-map composition.json --out /path/to/private/map/index.html
```

## What the checks enforce

`scripts/a2ui-validate --hierarchy` (before rendering): every visible content
or action component appears in the table with the approved emphasis, one P1,
the approved primary action, the approved root layout, and the copy budgets.

`scripts/hierarchy-check` (on the render, 390/768/1440 by default): P1 shows
in the first viewport and its type is strictly the largest in the generated
area; P2 type is never smaller than P3 type; exactly one primary action, fully
in the first viewport; no horizontal overflow; each item renders with its
approved emphasis.

These checks measure size and position. They do not judge whether P1 says the
right thing or whether the screen looks good; those stay with the owner at the
map gate and the final gate.
