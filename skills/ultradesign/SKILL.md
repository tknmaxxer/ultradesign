---
name: ultradesign
description: Design and build a real frontend the way a design studio works. The skill prescribes each step and the owner approves in their own words. Stages are a brief with observable requirements, structure and real copy in a grey prototype, references read as principles, three directions with one recommended, assets and a risk spike, a DESIGN.md system in Storybook, a required motion stage with an animatic, a composition map with a visual role per section, a thin end-to-end slice, independent review, and a final gate with an evidence ledger. Use for frontend design, implementation, or review.
---

# Ultradesign

<!-- omp-policy:start -->
Prescribe, never offer menus: no lists of choices, no multiple choice, no yes/no. Work the stages in order (frame, structure, references, directions, assets, system, motion, map, slice, build-out, review, final); short depth skips only stages the brief does not need. Ask open questions one at a time, only about facts tools cannot find; run vague words down the ladder (situation, example, what would be visible). At a gate show the artifact, a one-line reason and what to look at, ask one open question, end the turn. Approval counts only as the owner's own words saying to go ahead. Never build past an open gate the work depends on. Every section has a visual role; text-only sections on expressive pages fail without an owner exception. References give principles, never layouts; run the originality check. Motion is required at full depth and when included at short depth: approved animatic, reduced-motion version.
<!-- omp-policy:end -->

## Choose the requested outcome

- **Implement** (default): all stages for the chosen depth.
- **Plan:** frame, structure, references, directions, system. The system stage ends as a written proposal (`DESIGN.md` draft and verification plan) with no app changes and no system gate. Keep the application unchanged.
- **Review:** establish the real task and existing system, then run only the [review stage](prompts/11-review.md) as a read-only baseline and report findings. Keep the application unchanged.

## Depth

The skill states the depth from the site type at frame; it does not ask.

- **Full (all 12 stages):** brand, portfolio, landing, scroll story, immersive 3D.
- **Short:** a small page or product screens on an existing system. Runs frame, structure, directions (one direction applied to the existing system), system, slice, review, final, plus any of references, assets, motion, map and build-out that the brief needs (`include`).

### Applying scope downstream

In short depth, an omitted optional stage does not create a hidden prerequisite. The brief records why it is unnecessary. Reuse the existing system's assets, component examples and motion behavior; record the slice's hierarchy and responsive rules with the structure/system artifacts. A separate composition-map board, new assets or animatic is required only when that stage is included. If the work reveals a need for one, stop dependent work and rescope before building it. OMP only permits depth/include changes during frame; after that, preserve the evidence and start a newly scoped run rather than rewriting completed checkpoints or fabricating approvals.

Later stages run only checks applicable to the agreed page type and available artifacts. Omitted motion/map/assets do not waive keyboard, reduced-motion, responsive or real-task checks of the actual UI. Report optional checks as not applicable with the scope reason; a required check without evidence is not done.

## Stages

Each stage makes an artifact, shows it to the owner at a gate, and is done when the condition holds. Stages 2 and 3 can run in parallel. A simple site may combine stages; the gates still happen.

| # | Stage | Artifact | Gate | Done when |
| --- | --- | --- | --- | --- |
| 1 | [Frame](prompts/01-frame.md) | `brief.md`: users, core tasks, real content, constraints, success criteria, 3–5 brand words as observable requirements, genre convention, motion intensity and register, facts versus hypotheses | `frame` | Can say whose problem, which tasks, what success is |
| 2 | [Structure and copy](prompts/02-structure.md) | `structure.md`: sitemap, flows with error and recovery paths, real copy; grey browser prototype | `structure` | Core task completes in the grey prototype with real copy |
| 3 | [References to principles](prompts/03-references.md) | Reference board; three deconstruction cards (principles and "not carried") | `references` | Each pick maps to principles, none to a layout |
| 4 | [Directions](prompts/04-directions.md) | Three directions on the same content, one recommended: stylescape, representative screen, 5–8 s motion sketch | `directions` | Directions differ in type, density, composition and imagery; text-only and originality checks pass |
| 5 | [Assets and risk spike](prompts/05-assets.md) | Key visuals, imagery rules, `assets.json`, the hardest scene working with measured cost | `assets` | Core experience feasible in the target environment; fallbacks defined |
| 6 | [System](prompts/06-system.md) | `DESIGN.md` with state matrix, imagery rules, motion tokens, scene budget → tokens → Storybook | `system` | Every component in use has stories for its reachable states; render and a11y tests pass |
| 7 | [Motion](prompts/07-motion.md) | Role of motion, principles, storyboard, recorded animatic, behavioural spec | `motion` | 1–2 signature sequences timed; every motion has a reduced-motion substitute |
| 8 | [Composition map](prompts/08-map.md) | Per section: hierarchy table, asset, motion beat, visual role, states, responsive rule | `map` | No section without a visual role; breakpoints written as rules |
| 9 | [Slice](prompts/09-slice.md) | One core task built with all its states, real content, motion | `slice` | Task completes in every state at 390 / 768 / 1440 and between |
| 10 | [Build-out](prompts/10-buildout.md) | Remaining screens from the catalog | `buildout`, only when a new component appears | Shared tokens and components changed only by their owner |
| 11 | [Review](prompts/11-review.md) | Seven review types kept apart; findings as element → user effect → expected state; rounds recorded | none | Agreed findings resolved or recorded as open |
| 12 | [Final](prompts/12-final.md) | Renders at 390 and 1440, recording of the shipped page, evidence ledger, completion checklist | `final` | Completion criteria met or their gaps named |
| — | [Sharing](prompts/13-sharing.md) | Site and package for a shared system | none | Only with `--shared`, after the final gate |

## Gates and recording

Every taste decision is the owner's. At a gate show the artifact on the share, one line of why it fits the brief, a short plain-language list of what to look at (one to five items), and one open question, then end the turn. The skill decides the design with the stage recipe and the owner approves or redirects; never present options for them to choose.

Questions and replies follow [open questions](references/questions.md): open only, one at a time, vague words down the ladder, restate as element → user effect → expected state, raw answer and extraction side by side. Approval is the owner's own words saying to go ahead. A recommendation from you, a resume command and silence leave the gate open. A revision keeps the old evidence, updates the artifact and presents the gate again. Do not build past an open gate whose answer the work depends on; work that does not depend on it (capturing a reference pool, tooling, unrelated assets) may run while waiting.

**OMP:** use `ultradesign_checkpoint`.

- `status` reads state. `scope` sets `mode` (before the first checkpoint) and, during frame, `depth` (`full` or `short`) and `include`.
- `ask` puts one open question to the owner (a stage-1 fact or a ladder step) and ends the turn; nothing else may be pending.
- `gate` opens the stage's gate with `id`, `artifact` (links or paths), `reason`, `lookAt` and `question`. Numbered choices and yes/no openings are rejected.
- The extension captures the owner's typed reply itself. `resolve` then records `answered` with the extraction, `follow_up` with the next ladder question, or for a gate `approved` with a `quote` copied verbatim from the owner's reply, or `revise` with the extraction as element → user effect → expected state.
- `qa_round` records each review round; `complete` closes a stage with evidence, only after its gate is approved (build-out: no open gate).
- Owner commands: `/ud approve <gate> [words]`, `/ud revise <gate> <feedback>`, `/ud real-user <note>` (the only way to fill the real-user row), `/ud resume`, `/ud status`, `/ud off`. Start with `/ud [plan|review|implement] [--full|--short] [--shared] <brief>`.

**Other hosts:** keep a private `progress.md` beside the run artifacts (current stage, pending question or gate, completed evidence, the owner's exact words) and read it on resume. Keep the brief, the questions, the gate log and the evidence ledger in `decisions.md` ([template](assets/templates/decisions.md)).

`DESIGN.md` is the source of system values and the catalog the source of what a screen can contain; `decisions.md` records how decisions were made.

## Script paths

Run app commands from the app root. In these recipes, `scripts/<tool>` denotes the installed skill's script, not an app file: resolve the skill directory and invoke the absolute script path. Resolve artifact arguments to the private run folder or app location where they were actually written. Do not copy the skill scripts into the app or run example paths unchanged.

## Supporting skills

At the start of a stage, discover installed skills and read the one or two that address its actual work. Apply their guidance to the stage artifact or check, and record the skill path/revision, what it changed and the evidence in `decisions.md`. This limits optional design helpers, not skills required by the host.

- Directions: use `frontend-design` for subject-specific typography, imagery and composition, grounded in the approved brief.
- Review: use `remorsearch-ux-qa` for browser task review as described in [stage 11](prompts/11-review.md). Add `web-design-guidelines` when interface-code and accessibility review is needed; it complements, not replaces, browser evidence.
- Other stages: choose a matching installed specialist only when the task needs it; carry over already-read guidance rather than loading unrelated skills. Do not substitute video-composition guidance for web interaction design.

Keep Ultradesign's scope, approved direction and gates intact. A helper does not authorize new work, another owner interview, a different stack or skipped checks. If a relevant skill is absent, record the gap and use the stage's local guidance; do not claim the skill ran or install it without authorization.

## Roles

A logical division, not one model per role; a small job runs them in sequence in one session. The Lead owns scope, gates, `brief.md`, `DESIGN.md` and shared component APIs. UX and content, UI and system, Motion and 3D, Implementation and Independent review take the stages listed in [role briefs](references/roles.md); in OMP they are subagents and the reviewer is one that did not build the page.

## Completion criteria

The final gate reports each as met, not met or not done, with evidence. A scope-excluded item is not applicable with its reason, never counted as a passing check.

1. Users can complete the core tasks.
2. The normal path and realistic exception paths are implemented.
3. The layout holds with real, long and empty content.
4. Type, spacing, colour and component use are consistent.
5. Readable and operable on representative devices and at intermediate widths.
6. Keyboard, focus, labels and reduced motion reviewed.
7. Media, 3D and motion do not block the main actions or performance.
8. Preview versus deployment differences checked.
9. Content updates, error response and rollback exist.
10. AI evaluations and real-user evidence recorded separately; an empty real-user row is stated, not implied.
11. Every section has its declared visual role; text-only sections on expressive pages carry an owner exception.
12. The originality check shows no layout match to a picked reference.
13. The shipped motion matches the approved animatic and spec, with the reduced-motion version recorded.

## Guides

[Open questions](references/questions.md), [role briefs](references/roles.md), [reference catalog](references/catalog.md), [A2UI catalog and renderer](references/a2ui.md), [hierarchy table and composition map](references/hierarchy.md), [visual QA](references/visual-qa.md), [build guard](assets/templates/guard/README.md), [Storybook template](assets/templates/storybook/README.md). Templates: [brief](assets/templates/brief.md), [structure](assets/templates/structure.md), [decisions](assets/templates/decisions.md), [deconstruction card](assets/templates/deconstruction-card.md), [assets.json](assets/templates/assets.json).
