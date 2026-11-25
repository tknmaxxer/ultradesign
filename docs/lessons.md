# Ultradesign lessons (v0.1 → v0.6)

What the experiments from 2026-11-21 to 2026-11-25 established. Evidence lives
outside this repo, in the private research folder next to it; paths below are
relative notes from the repo root (`../ultradesign-research/…`), not links.
Owner quotes are verbatim from the Ultradesign Discord thread.

## Decisions that stand

| Decision | Why | Evidence |
| --- | --- | --- |
| Every taste choice is a human gate: references, each interview axis, `/system`, catalog, hierarchy/section map, final screen. | Model-picked references, palettes and statuses came out generic. v0.3 `/ud` scored 20/25, the same as the plain brief, on both tasks. Owner on v0.1/v0.2: "솔직히 둘 다 별로야." Screens improved once the owner picked. | `v03/report.md`, `exp1/report.md`, `ds/interview.md` |
| References are real shipped sites and galleries, gathered on a numbered board; the owner picks 1–3. | "Mobbin 말고도 레퍼런스 찾는 곳 여러군데 언급했잖아." The picked ref 35 and Raycast set the hero and page structure. | `refs/report2.md`, `v04/cataly/decisions.md` |
| Palettes come from palette sites, not invented. | Warm stone + red was rejected: "너무 클로드 느낌나는 색조합이야… 색조합 하는 사이트에서 레퍼런스 얻어서 해". Color Hunt #6 was picked from a board. | `ds/report-v2.md`, `ds/palettes/` |
| `DESIGN.md` in the Google Labs design.md format is the single source; `tokens.css` and the catalog are generated. | The owner asked whether the system was really designed ("디자인 시스템이 제대로 짜진게 맞는가") after SEED tokens were pasted without decisions. | `ds/interview.md`, `ds/DESIGN.md` |
| Vite + React + Base UI + CSS Modules, no Tailwind, unless the project already has a stack. | Owner direction; Base UI keeps behavior headless so the system owns every visual. | `analysis/research-tools.md` |
| Status and emphasis come from position and type, not colored boxes. No pill badges, tinted chips or tinted rows; one small status glyph at the row start. | "상태 기호나 강조 하는 것 자체가 ai 느낌이 나네." The rebuilt lane screen on that rule was approved: "좋아". | `ds/interview.md` (DS-Q6), `exp2/report.md` |
| Motion is its own pass after the static screen works. | Agents do not add motion unless asked; the Cataly hero had none ("모션이 전혀 없고… 얕아서 AI 같아"). | `v04/cataly/report-full.md` |
| A numbered section map with reference crops, copy limits and the DS header is approved before building. | It was the first landing round the owner accepted without changes ("일단 진행"). | `v04/cataly/map-report.md`, `v04/dry-run/refs/map/` |
| A2UI v1.0 JSON is the generation target; the model composes only catalog components. | "우리 UI는 A2UI 쓰자." Tokens live inside components, so hardcoded colors and fonts are structurally impossible. The approved exp2 screen re-rendered from A2UI with 0 differing pixels at 1440 and 390. | `a2ui/report.md` |

## Failures and what each one taught

| Round | What happened | Lesson encoded in v0.5 |
| --- | --- | --- |
| v0.1–v0.3 one-shot A/B | Same score as the plain brief; generic SaaS layout (left nav, four KPI cards, charts, table). | Remove the model from taste decisions; evaluate with real screens and owner picks. |
| exp1 (SEED pasted, two arms) | "그나마 a? 인데 UX적으로 문제가 있는듯." Pasted tokens without product decisions. | Interview → `DESIGN.md` before any screen; Remorsearch UX QA loop. |
| Cataly R2 | "너무 텍스트가 많아… 더 AI스러워졌어… 디자인 시스템 전혀 반영이 안되어 있는 거 같은데". Cause: a 360-line stylesheet with hardcoded hex colors, bold sans display headlines outside the DS fonts, copy inflated to fill page length. | A guard that fails the build on hex/rgb literals, raw px font sizes, non-token fonts and components from outside the system; copy budgets per item. |
| Cataly R3 | Built exactly to the approved map, guard passed. The lead's own review (no owner verdict): too empty, wireframe-like — icon-plus-two-words boxes, the same centered title → big box rhythm in every section. | Each section's layout frame comes from an approved screen or reference; a component that renders an empty box is a catalog defect. A hierarchy table states what each region must say. |
| A2UI night-oncall screen | Valid JSON, correct data, but the page title was the largest thing, the item needing action was a small row, and the confirm button sat at the bottom as a quiet outline. Owner: "나쁘지는 않은데 이게 위계가 안맞으면 A2UI 해도 의미가 없어". The model also used hyphenated component IDs that the official schema accepts but the React renderer rejects. | Hierarchy layer: a per-screen table with one P1, P2/P3 items and one primary action, approved before generation; catalog components take emphasis roles, not sizes; a render check that P1 dominates and the primary action is in the first viewport. The validator applies the renderer's UAX #31 rule, not only the JSON schema. |

## What worked

- One question per turn with numbered evidence and a stated pick; the owner answers with a number.
- Owner-supplied Chrome over CDP for galleries a logged-out crawler cannot see; public adapters otherwise; access gaps recorded rather than bypassed.
- `/system` rendered with real data as the system gate; the owner reviews renders, not token tables.
- Remorsearch baseline → scoped fixes → same-scenario replay. Every round found real issues (focus loss, offscreen result, small targets).
- A board on the Tailscale share for every gate.

## What the v0.5 eval exposed (fixed)

Wiring the eval renderer and its first round (`evals/v05`, night on-call +
landing "Get started", before/after) surfaced four problems the validator did
not catch at the time:

- The renderer's catalogs typed child lists as plain string arrays, so the
  validator could not see the tree. Frames must type children with the spec's
  `ChildList`; the catalog check now says so.
- The renderer refused a `20:42 KST` timestamp the validator had accepted.
  Rules the renderer enforces now live in the catalog schema (`format:
  date-time`) and the validator asserts formats, including on bound values.
- Asked to fix `{"path": …}` bindings, the model wrote `"@/title"` as plain
  text, which rendered literally. The validator now rejects data paths
  written as text and names the `{"@path": …}` form.
- Schema errors cascaded (`unevaluatedProperties` listed every valid prop
  once one branch failed). The validator now names unknown props directly.

## v0.5 workflow in one line

Frame → reference board (pick) → interview (answer ×5) → `DESIGN.md` + `/system`
(approve) → A2UI catalog with layout frames from approved screens (approve) →
hierarchy table / section map (approve) → generate A2UI → validate → render →
guard + hierarchy check → UX QA → final (approve); motion on request.

## Open questions

- The hierarchy check measures type size and position. It cannot tell whether
  the P1 wording is right; that stays with the owner at the map gate.
- Edge alignment and spacing rhythm inside frames are not machine-checked.
  Eval round 1 found indented secondary links, a misaligned split column and
  a button touching the next row; review of the PNGs caught them and the
  frames were fixed in the renderer.
- One generation per condition per task is anecdotal. More runs are needed
  before claiming a success rate.
- A2UI landing pages need richer frames (media, demos) than the ops catalog;
  how many frames a catalog needs before pages stop looking alike is untested.
- The guard is a template the agent installs into the renderer project; it
  covers CSS Modules and JS/TS, not other styling systems.
- The 7 uncommitted v0.3 eval-runner files on `feat/workflow-v0` (catalog
  capture types, `variants.html`) predate v0.4 and are still uncommitted; they
  belong to the historical A/B runner, not to v0.5.

## v0.6: what changed and why

The owner's direction of 2026-11-24/25 (Discord #일반) replaced the v0.5 order: references stay references, motion and the design-system contract are required stages, text-only output is a defect to measure, and the skill prescribes instead of offering choices. The plan is `docs/v06-plan.md`; the stage-by-stage recipes are in `skills/ultradesign/prompts/`. Owner quotes: "각 단계에 선택지를 제공하지 말고 이런이런식으로 하세요를 제공하도록 하자" and "뭔가를 물을 때 단답으로 객관식이 아니라 주관식의 답을 유도하고 주관식의 답을 얻어야 해."

| v0.5 | v0.6 | Why |
| --- | --- | --- |
| Reference picks carried layouts into frames and the map. | Picks become deconstruction cards (principles and a "not carried" line); frames come from the chosen direction. | Transplanting a reference's layout is copying. |
| Five-axis numbered interview, numbered picks. | At most three open questions at frame, then a recommended direction the owner approves or redirects; vague words go down a three-step ladder; raw answer and extraction are logged side by side. | Users are not designers; short multiple-choice answers carried no specifics. |
| Motion on request. | Motion is stage 7 with an animatic and reduced-motion substitutes; the guard has `motionEntries` and `sceneEntries`. | Motion was an appendix, and the guard made GSAP and Three.js impossible. |
| No stage for imagery, 3D or scenes; no IA or copy stage. | Structure and copy (stage 2) and assets and a risk spike (stage 5); Storybook replaces the hand-built `/system`. | Output was type plus boxes plus copy. |
| One QA record. | Independent reviewer; evidence ledger with four rows kept apart; the real-user row is owner-run only. | Agent success is not user validation. |

### ITSACHAR dry run (2026-11-24, stages 1–4)

The manual dry run on the owner's own site (a Korean corporate homepage for a one-person company) was stopped after stage 2 once it had produced its lessons. Evidence is in the private dry-run folder (`../itsachar-dryrun/decisions.md`, `timing.log`), not in this repo. Stage 1 took 25 minutes of wall time from the first question to the approved gate.

1. **Few questions.** Three open questions plus the ladder gave a complete brief. The owner's own answer asked for "최대한 적은 횟수의 … 쉬운 인터뷰". Frame asks at most three questions, only about facts tools cannot find. Liked and disliked sites are not asked; they come from the owner's reaction at the references gate. Existing material is read, not asked about. Missing facts (price, lead time) go into the brief as marked hypotheses for the owner to correct at the gate, never invented.
2. **Genre convention is a brief item.** At the gate the owner changed the site type ("배너가 있고 하는 전형적인 기업 홈페이지") and the motion register ("모션 강도는 높지만 딱딱하게"). The brief states the genre, the conventions its visitors expect, and motion intensity and register as explicit lines the owner can correct.
3. **Do not build past an open gate the work depends on.** Stage 3 cards and stage 4 directions drafted before the brief gate had to be rebuilt: a hand-drawn reference was swapped out and all three directions were rebuilt for a corporate banner with rigid motion. Work that does not depend on the pending answer (capturing a reference pool, tooling, unrelated assets) may run while waiting.
4. **Unknown facts stay empty.** The price and lead-time lines were left out of the copy until the owner supplied them, and the gate said so.
5. **Text-only lint is a measurement.** Per section, the share of area covered by image, video, canvas, SVG and result fragments; 0.00 means text only. It caught two directions with a text-only services section; adding result fragments fixed one of them (0.21).
6. **The animatic recorder works when the page owns its timeline** (`tl.duration()`, a completion event, no fixed sleeps): three directions recorded at 5.6–5.8 s with no console errors. WebGL was verified only on SwiftShader and is labelled lab, not device.

Raw owner answers and their extractions side by side (the pattern in `assets/templates/decisions.md`) made it easy to see which requirement came from which words; "일 잘하더라" decomposed into four visible behaviours through one ladder step.

### Open after v0.6

- Gate count and wall time for a full 12-stage run are unmeasured; the dry run covered stages 1–4 only.
- The second dry run on the owner's site, with the rewritten skill, gate by gate on the share, is the next check.
- The originality check scores block structure at one width; shared genre conventions can flag, and a different DOM grouping can miss a similar layout. It is for owner review, not proof.
- Device performance needs a real device; lab numbers do not stand in for field Core Web Vitals.
