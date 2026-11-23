# Interview one design decision at a time

Start with `brief.md`, the picked images, and the existing product constraints. Copy the [interview log](../assets/templates/interview-log.md) into the private run folder as `interview.md`.

Ask in this order, one gate per turn:

| Gate ID | Decision | Evidence to prepare |
| --- | --- | --- |
| `direction` | Character and first-glance hierarchy | Contrasting composition or hierarchy crops from the chosen references and adjacent real products. |
| `typography` | Typeface and type roles | Real font specimens using identical product copy, including supported languages, numerals, and dense labels. |
| `palette` | Palette and role mapping | Compare sourced palettes from [Color Hunt](https://colorhunt.co/), [Coolors](https://coolors.co/palettes/trending), [Adobe Color](https://color.adobe.com/explore), or [Happy Hues](https://www.happyhues.co/). Record permitted visible swatches and provenance, then render them with the [palette-board tool](../scripts/palette-board). Show brand, surface, text and interaction roles in context. |
| `status` | Status and emphasis | Captures of real products showing the pertinent states in context; compare shape, labels, color, selected and focus treatments. For a landing, use relevant CTA, feature or demo states. |
| `density` | Spacing, grouping and responsive density | Side-by-side examples with comparable content; name the gutter, row or section height, line length and device transition each implies. |

For each, show 2–5 numbered options with evidence for every option and say **my pick is N, because…**. Wait for an explicit answer or feedback. Log the recommendation and the actual answer separately, including rationale and downstream use. For settled constraints offer ways to apply them rather than proposing unrelated migrations. Record additional routine details as proposals for the system-page review.

For palette input, use a JSON array of `{ "src": "Source label", "title": "Palette title", "url": "https://…", "observedAt": "YYYY-MM-DD", "colors": ["#111111", "#EEEEEE"] }` records based on the source's actual palette. Run `uv run --script scripts/palette-board --input /path/to/palettes.json --out /path/to/board.html` from the skill root. Keep captures and samples in the private artifact folder.
