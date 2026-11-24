# v0.5 hierarchy evaluation

Does the hierarchy layer change what a model generates from the same brief
and catalog? Two fixed tasks: the night on-call handoff screen (the screen the
owner said had the wrong hierarchy) and the Cataly landing "Get started"
section (the R3 section that read as empty boxes).

| Condition | What the generator gets | Checks |
| --- | --- | --- |
| before | Brief + catalog (the v0.4 A2UI flow) | `a2ui-validate` repair loop; render; `hierarchy-check` without a table (one P1, P1 dominant, one primary action in view) |
| after | Brief + catalog + approved `hierarchy.json` + the generate stage | `a2ui-validate --hierarchy` repair loop; render; `hierarchy-check --hierarchy`; repair from its findings |

Both use the same model, thinking level and repair budget, through the local
`omp` CLI with tools, skills, rules and context files off.

## Run

The renderer is the project under test: an A2UI renderer that serves
`/?screen=<name>` from `public/screens/<name>.json`, follows the DOM contract
in [the catalog guide](../../skills/ultradesign/references/a2ui.md), and has
`catalogs/cataly-ops.json` and `catalogs/cataly-landing.json`. Start it first.

```sh
# 1. Draft the tables, then stop at the gate.
node evals/v05/run.mjs --renderer ../app --url http://127.0.0.1:4391 --out out/map
# 2. A person reviews out/map/<task>/hierarchy.json, edits if needed, and copies the approved
#    tables to approved/<task>.json. Record who approved them.
# 3. Generate both conditions.
node evals/v05/run.mjs --phase generate --approved approved --renderer ../app \
  --url http://127.0.0.1:4391 --out out/run
```

`out/run/results.json` records validator rounds, hierarchy-check results per
width and screenshot paths. One run per condition is anecdotal; repeat before
drawing rates. The checks measure type size and position, not whether the P1
wording is right or the screen looks good.
