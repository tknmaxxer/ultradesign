# Dashboard calibration ledger

Before the four-task A/B, run the dashboard treatment alone, inspect it beside the
actual lead reference at 390/768/1440px, and revise the prompts only if the
result still defaults to a generic dashboard. At most four prompt iterations.
Evaluation screenshots and reference material stay in the private run directory;
paths in this ledger are relative to `ultradesign-research/v02/` unless noted.

## Starting point: v0.0.10

Both dashboard arms use an indigo accent, repeated boxed KPI/chart sections
and similar desktop hierarchy. At 390px the treatment wraps its range control
to three lines per option, and the baseline extends right of the viewport.
Observed in all six `ultradesign-research/eval-smoke-html/blind/dashboard/*.png`
captures; these are historical renders, not v0.0.20 evaluation samples.

## Pass criteria

- A clear first glance and readable operating hierarchy, not an equal-weight matrix.
- Reference-derived choices visible in real edges, rows, type and density at each width.
- Surfaces and color carry separate, intelligible roles rather than styling every module alike.
- The 390px layout preserves searchable invoices and their useful data without document overflow.

## Iteration 1 — recreation without retention

The builder captured Tabler, the shadcn dashboard example, and TailAdmin. The
TailAdmin desktop capture showed a loader; the selected shadcn page at 390px
showed a scaled preview, not a reflowing live dashboard. The monochrome study
had the demo's shared content edges and light frame. The adapted route discarded
that surface for a dark sidebar, indigo controls and trend, four filled KPI
tiles, and boxed trend and breakdown. At 768px the equal-weight KPI grid still
dominated the first scan. At 390px the four KPI boxes pushed the trend down.
The treatment is still recognizably the v0.0.10 dashboard pattern.
One adaptation worth retaining: at 390px the invoice row puts amount and status
on the right and preserves the searchable identity and date on the left.
Unlike the recreation, it exposes all five fields at once.

- Captures: `dashboard-pilot-01/private/dashboard/treatment/attempt-1/reference-3/page-{390,768,1440}.png`
- Recreation: `dashboard-pilot-01/private/dashboard/treatment/attempt-1/study-2/{390,768,1440}.png`
- Final adapted render: `dashboard-pilot-01/private/dashboard/treatment/{390,768,1440}.png`
- Runtime: 0px document overflow at each width and mobile invoice search/clear passed. The visual gate is separate from functional success.
- Decision: fail the visual gate. Require a direct lead screen, a retained-case
  map before changes, and adaptation on top of the recreated layout.
- The pilot also built the recreation before a written system contract. The
  corrected sequence is reference observation → written contract → private
  recreation → adaptation. The evaluation records a contract snapshot before
  permitting local renders; the untouched settings seed is allowed.

## Iteration 2 — contract first, same massing

The builder selected the direct shadcn dashboard and preserved a contract
snapshot before the recreation. At 1440px the study matches its aligned KPI
panels, full trend, and records sequence. At 768px the adapted version yields
space to the data by replacing the persistent rail; at 390px the two-up KPI
row and invoice reflow improve the lead demo's stacked cards and cropped
table. But across all three widths, the final pine version retains the familiar
equal KPI tile grid, twin boxed charts, then a second large box for records.
The change in color does more to distinguish it than the information structure.
Search/clear passed and no document overflow was measured. Gate not passed.

- Lead: `dashboard-pilot-02/private/dashboard/treatment/attempt-1/reference-3/page-{390,768,1440}.png`
- Contract: `dashboard-pilot-02/private/dashboard/treatment/attempt-1/design-contract-before-ui.md`
- Recreation: `dashboard-pilot-02/private/dashboard/treatment/attempt-1/study-2/{390,768,1440}.png`
- Final: `dashboard-pilot-02/private/dashboard/treatment/{390,768,1440}.png`
- Next correction: choose a reference that actually groups metrics and trend;
  put the aligned stat anatomy on one surface, and compare massing independently
  of color.

## Iteration 3 — stronger grouping, missing direct capture

The contract and the 390/768/1440 recreation put compact stat slots above one
dominant chart. The final retained the grouped frame, but the plum rail and
lavender controls place it back in the visual language of iteration 1. The
Plausible lead stayed on a loader for live captures. The builder used an
official desktop screenshot to study it, not real matched-width captures.
The evaluation correctly rejected the run, without an independent final
renderer or primary-action result. The internal rerenders remain inspectable.

- Contract: `dashboard-pilot-03/private/dashboard/treatment/attempt-1/design-contract-before-ui.md`
- Recreation: `dashboard-pilot-03/private/dashboard/treatment/attempt-1/study-1/{390,768,1440}.png`
- Adapted rerender: `dashboard-pilot-03/private/dashboard/treatment/attempt-1/route-3/{390,768,1440}.png`
- Verified alternative sources: `reference-coverage-8tm3gO/report/trend-{390,768,1440}.png` and `reference-coverage-8tm3gO/records/records-{390,768,1440}.png`. These diagnostic captures are not pilot inputs or judge evidence.
- Next correction: route builders to the catalog's stable public starting
  points on failed loading, require a completed capture before recording the
  design contract, and carry neutral navigation around the data-first surface.

## Iteration 4 — populated reference, chart-led reading

The builder captured Our World in Data's real chart and shadcn's direct
dashboard before recording the system contract. The study retained the lead
chart's axis gutter, dashed guides and small captions with Northstar values.
At 1440px the final aligns a shared four-stat band, wide trend, proportional
inline acquisition bar, and invoice ledger. At 768px the light top navigation
returns the space to the same reading order. At 390px internal rules, not
separate tile shells, divide the compact stats; the plot and three channels
stay readable, and invoice rows show all five fields. The chart still reads
first when the accent is disregarded. The familiar violet accent and some
rounded surfaces remain weaknesses; the structure, not its palette, is the
reason this passed calibration.

- Lead chart: `dashboard-pilot-04/private/dashboard/treatment/attempt-1/reference-1/trend-{390,768,1440}.png`
- Supporting dashboard: `dashboard-pilot-04/private/dashboard/treatment/attempt-1/reference-2/page-{390,768,1440}.png`
- Contract: `dashboard-pilot-04/private/dashboard/treatment/attempt-1/design-contract-before-ui.md`
- Recreation: `dashboard-pilot-04/private/dashboard/treatment/attempt-1/study-2/{390,768,1440}.png`
- First adapted render and correction: `dashboard-pilot-04/private/dashboard/treatment/attempt-1/{route-3,route-4}/{390,768,1440}.png`
- Final: `dashboard-pilot-04/private/dashboard/treatment/{390,768,1440}.png`
- Runtime: primary invoice search/clear passed at 390px. All three final
  captures showed 0px document overflow and zero page errors.
- Decision: freeze the prompts and start the independent four-task run. The
  calibrated sample is not reused or scored in the blind evaluation.
