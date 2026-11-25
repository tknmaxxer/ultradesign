# Hierarchy table

A screen reads well when one thing is clearly first, a few things support it,
the rest is quiet, and the one thing to do next is obvious. Write that down per
screen (or per landing section) as `hierarchy.json`, get the owner's approval,
then generate. Valid A2UI with the right components can still put the wrong
thing first; the table is where the order is decided.

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
  "reference": { "url": "https://…", "crop": "crops/03-1440.png" },
  "visual": "Lane list with a report panel beside it",
  "motion": "None on load; panel content cross-fades on selection"
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
- `frame` is one of the catalog's layout frames. Frames come from approved
  screens and picked references, so the arrangement has been seen before.
- For a landing page, write one table per section and add `order`,
  `reference.crop` (the crop whose layout the section takes), `visual` and
  `motion`. Together they are the section map.

Propose the table with the reasoning for P1 and the primary action. Render the
board with the [screen-map tool](../../skills/ultradesign/scripts/screen-map) and let the owner
approve, reorder, drop sections or change priorities by number.

```sh
uv run --script scripts/screen-map hierarchy/*.json --out /path/to/private/map/index.html
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
