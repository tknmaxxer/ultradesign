# Role briefs

Roles are a logical division of the work, not one model per role. A small job runs them in sequence in one session. A host that supports subagents (OMP: `task`) hands a role its brief below plus the stage prompt and the artifacts it needs; the role returns files and a short report to the Lead.

## Rules for every role

- Only the Lead talks to the owner, opens gates and records decisions. A role never asks the owner anything; it returns the open question to the Lead.
- `brief.md`, `DESIGN.md` and shared component APIs have one owner: the Lead. Roles propose changes to them in the report; they do not edit them.
- Read the stage's artifacts first (`brief.md`, `structure.md`, deconstruction cards, the approved direction, `DESIGN.md`). Do not infer a decision that is not recorded.
- Building roles follow [Storybook lookup and coverage](../assets/templates/storybook/README.md#agent-component-lookup) before creating components; stories import the same production exports as the app. Shared API changes include affected consumers and migration evidence for the Lead.
- Apply the stage's [supporting skills](../SKILL.md#supporting-skills), one or two relevant helpers, and report the actual guidance used with its evidence. A skill name in a report is not evidence of use.
- Use the owner's real material. No placeholder text, no invented facts; unknown facts stay marked as hypotheses.
- Report in this shape: files written (paths), what each shows, checks run with results, unverified items, open questions for the owner. State lab numbers as lab.
- Stay inside the assigned files. Do not commit or publish.

## Lead and integration

- **Stages:** all. Runs `/ud`, states scope and depth at frame, owns every gate.
- **Owns:** scope, gates, `brief.md`, `DESIGN.md`, shared component APIs, `decisions.md`, integration and merging, final quality.
- **Does:** writes the brief and the gate framing (artifact, one-line reason tied to the brief, what to look at, one open question); integrates subagent output; resolves each owner reply into an extraction; keeps the evidence ledger honest.
- **Must not:** build past a gate whose answer the work depends on; record approval without the owner's words; fill the real-user row.

## UX and content

- **Stages:** 2 Structure and copy, 8 Composition map.
- **Owns:** `structure.md` (sitemap, flows, error and recovery paths), real copy, sample data, the grey prototype, the composition map's order, messages and actions.
- **Receives:** `brief.md` with its observable requirements, the owner's own material.
- **Produces:** pages only for the core tasks; every line of copy in the owner's language from their material; flows that name the error and the recovery; a grey prototype that completes the core task; per section one main message, one main action, copy budget.
- **Must not:** write placeholder or lorem text; fill a missing price, date or name; add pages the tasks do not need.

## UI and system

- **Stages:** 3 References, 4 Directions, 6 System.
- **Owns:** deconstruction cards, directions, type, tokens, components and their states.
- **Produces:** per reference a card with principles and a "not carried" line; three directions that differ in type, density, composition and imagery (not colour alone), each with stylescape tiles, the representative screen in real copy and reasons tied to the brief; `DESIGN.md` proposals (semantic tokens, type, containers, base components, state matrix, imagery rules, motion tokens, scene budget); one story per reachable state.
- **Must not:** transplant a reference's layout or signature elements; hardcode hex, px font sizes or off-token fonts; edit `DESIGN.md` directly (proposals go through the Lead).

## Motion and 3D

- **Stages:** 5 Assets and spike, 7 Motion.
- **Owns:** key visuals, imagery pipeline, the risk spike, the animatic, motion tokens input, scene budget, fallbacks.
- **Produces:** assets with provenance in `assets.json`; the hardest moment working in the target browser with measured cost; a 5–8 s animatic whose page exposes `window.udAnimatic`; a behavioural spec (interruption, focus, mobile, reduced motion); a reduced-motion substitute for every motion; a fallback image where WebGL is off.
- **Must not:** use real-time 3D where an image or video does the job; call SwiftShader numbers device numbers; use fixed sleeps in recording; hardcode colours in scene code (read `tokens.ts`).

## Implementation

- **Stages:** 9 Slice, 10 Build-out.
- **Owns:** screens, routing, responsive behaviour, states, A2UI screens for product UI and content sections.
- **Works:** per screen, each in its own worktree at stage 10; shared tokens and components change only through their owner.
- **Produces:** the screen built from the approved catalog, direction and system; every state in the matrix that the task can reach; `a2ui-validate`, guard and `hierarchy-check` results; Storybook `play` functions for the slice states.
- **Must not:** create a component when one exists; style outside the system; edit the catalog or `DESIGN.md` without going through the Lead.

## Independent review

- **Stage:** 11 Review. Read-only.
- **Is:** a reviewer that did not build the page. In OMP a fresh subagent with no build context; fallback is a self-pass, labelled **self**.
- **Does:** drives the browser through the real tasks; keeps seven review types apart (visual, functional, responsive, accessibility, motion, performance, operational); runs Remorsearch persona QA, Storybook Test, `hierarchy-check`, `visual-qa.py`, `text-only-lint`, `originality-check`, `scene-qa`.
- **Reports:** each finding as element → user effect → expected state, with reproduction, device and input; separates agent findings from the real-user row (empty unless the owner runs it).
- **Must not:** edit code; fix findings; mark real-user validation.
