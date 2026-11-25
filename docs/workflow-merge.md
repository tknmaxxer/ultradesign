# Merging the owner's workflow research into Ultradesign v0.6

Inputs: the owner's research, [frontend_design_workflow_research_2026-11-24_en.md](owner/frontend_design_workflow_research_2026-11-24_en.md) (cited here as [Owner §N]), and our phase-1 studio research, [designer-workflow.md](designer-workflow.md), with its plan, [v06-plan.md](v06-plan.md). Rule: where the two differ, the owner's doc wins unless a source contradicts it, and then the conflict is flagged below. The merged workflow is written into both files; the board is on the owner's private research share (`/wf/index.html`).

## Summary

The owner's doc is a product-and-delivery workflow: structure and real copy before visuals, states, a thin end-to-end slice, evaluation separated from generation, and completion criteria. Ours is an art-direction workflow: reference principles, divergent visual directions, generated assets, motion tokens and a recorded animatic. They describe different halves of the same job and barely overlap, so the merge is mostly additive. The order changes in one place: structure and copy now come before visual directions.

## What the owner's doc adds that we lacked

| Addition | Owner source | Where it lands in the merged workflow |
| --- | --- | --- |
| Observable requirements instead of mood words ("make it premium" → type contrast, density, role of imagery, motion intensity); hypotheses labelled as hypotheses | [Owner §15 step 1], [Owner §3 stage 2] | Stage 1 Frame: the 3–5 brand words each get an observable translation; `brief.md` separates facts from assumptions |
| UX and structure with real copy before visuals: IA, sitemap, user flows, error paths, a cheap browser prototype that completes the core task | [Owner §3 stage 3], [Owner §4], [Owner §15 step 2] | New stage 2 Structure & copy, with its own gate |
| Directions compared on the same content, from one representative screen plus the key interaction | [Owner §15 step 3], [Owner §5] | Stage 4: each direction renders stage 2's real copy, not lorem or generic headlines |
| Risk validation before detailed design (hardest transition, 3D feasibility, responsive) in the target browser | [Owner §3 stage 5], [Owner §11 step 5], [Owner §12] | Stage 5 adds the risk spike next to key visuals |
| State design: buttons, inputs, lists, data cards, saving, permissions, modals | [Owner §5 table] | Stage 6 `/system` shows states per component; stage 8 map lists the states per section |
| Small design system first, three layers (base / semantic / component tokens), one owner for tokens and shared APIs, look for an existing component before creating one | [Owner §7], [Owner §15 step 4] | Stage 6 contract; lead owns `DESIGN.md` |
| Responsive as rules, not three mockups (column changes, nav collapse, long titles, zoom, no hover, virtual keyboard); mobile need not copy desktop effects | [Owner §10] | Stage 8 map carries responsive rules; QA checks intermediate widths |
| Motion role first, then a 7-step sequence (brief, states/triggers, storyboard, timing study, technical experiment, spec, real-world checks); behavioural spec like the search-panel example; a video mockup does not implement input, routing or async states | [Owner §11] | Stage 7: animatic plus a behavioural spec; motion QA in the browser |
| 3D pipeline (concept → blockout → assets → look-dev → handoff → integration → optimisation → alternatives); "is real-time 3D necessary?"; transfer cost vs render cost measured separately; semantic HTML for the actions | [Owner §12] | Stage 5 medium decision and spike; stage 11 scene QA |
| A thin end-to-end slice: one core task with normal, loading, empty, failure and permission states before the screen count grows | [Owner §15 step 5], [Owner §8] | New stage 9 Slice, with its own gate |
| Generation separated from evaluation: a review agent opens the browser; findings carry evidence | [Owner §15 step 6] | Stage 11 Independent review by an agent that did not build the page |
| Specific revision goals (element, user effect, expected state); keep good states; cap iterations; the last version is not assumed best | [Owner §15 step 7] | Stage 11 output format and the revision loop |
| Seven review types kept separate (visual, functional, responsive, accessibility, motion, performance, operational); Playwright baselines are regression checks, not design judgment; Core Web Vitals at p75 | [Owner §13] | Stage 11 checklist |
| Evidence types kept separate: agent task success, automated checks, owner visual approval, real-user validation | [Owner §15 step 8], [Owner §16] | Stage 12 evidence ledger (`decisions.md`) |
| Multi-agent roles: lead/integration, UX & content, UI & system, implementation, motion & 3D, independent review | [Owner §15 table] | Role column in the merged stage table |
| Minimum repo deliverables and ten completion criteria | [Owner §16] | Artifact list and the final gate |
| Repo and browser as the source of truth; no manual duplication of token values across documents | [Owner §14] | `DESIGN.md` stays the single source; tokens are generated |
| Content model / CMS decision; operational checks (Korean and mixed text, SEO, rights, events, rollback) | [Owner §8], [Owner §13] | Stage 10 Build-out and stage 12 |
| Per-project emphasis: ITSACHAR = message, case studies, inquiry flow, visual direction, 1–2 signature motions; portfolio = motion and 3D as a separate workstream from the start, with a mobile alternative | [Owner §16] | Decision 5 (first dry run) |

## What we add that the owner's doc lacks

| Addition | Our source | Why it stays |
| --- | --- | --- |
| Directions as stylescapes, stretched far apart (3, optional wild card) | Instrument, Blind ([designer-workflow §4](designer-workflow.md#4-concept-directions-and-stylescapes)) | The owner's doc says "a small number of distinct directions" but not how to make them visually wide; stylescapes fix the text-only failure at the decision point |
| Generated imagery and key visuals with provenance (`assets.json`) | OFF+BRAND, Instrument; `generate_image` tested 2026-11-24 | The owner's doc lists asset rights but has no asset-production stage; without one the output is type and boxes |
| Reference → principle cards with an explicit "not carried" line; originality check against picked references | COLLINS, Studio Freight, Koto, Blind | [Owner §5] asks for principles; ours adds what must not be copied and a check, which answers "references stay references" |
| Motion tokens (two registers, 6-step durations, choreography, named brand behaviours) | Carbon, Atlassian, Fluent 2, COLLINS, HSBC | [Owner §11] gives the sequence and the spec; ours gives the values and the brand layer |
| Recorded animatic as a gate artifact, recorded from a browser prototype | Basement, OFF+BRAND, Resn; `record.mjs` tested 2026-11-24 | Owners approve motion running, not described |
| Text-only check on the rendered page | Owner direction 2026-11-24 | The owner named text-only output as one of the biggest problems; his doc has no check for it |
| Gate mechanics: one decision per gate, explicit recorded approval, silence leaves it open | v0.5 `ultradesign_checkpoint`, Instrument decision sessions | Keeps the owner's judgment in the loop that [Owner §1] requires |
| Guard that bans hard-coded values but allows motion/scene modules | v0.5 guard | Enforces [Owner §15 step 4] "one owner for tokens" in code |

## Conflicts and how the merge resolves them

1. **Order: visuals first vs structure first.** Our v0.6 plan put the composition map at stage 7, after directions. The owner puts structure, flows and real copy before visual directions [Owner §3, §15 step 2]. Owner wins. Our own sources agree: "The brief should describe the visitor journey before it describes the technology" and "The first milestone is a signed scope, not a moodboard" ([Locomotive](https://locomotive.ca/en/blog/product-launch-website-webgl-budget-timeline)); Koto puts the story ahead of polished visuals ([Koto](https://seasoned.koto.studio/book/delivering-the-goods/)). No source contradiction.
2. **What a direction is.** We planned stylescape boards; the owner wants directions applied to the same content on one representative screen plus the key interaction [Owner §15 step 3]. Merged: each direction is a stylescape strip plus that screen with real copy plus a short interaction/motion sketch. Count: the owner says "a small number"; our sources give 3 (Instrument) and 3 + wild card (Blind). Compatible.
3. **Animatic as approval.** The owner notes a video mockup "does not implement actual input, routing, or asynchronous states" [Owner §11]. Our animatic is recorded from a running browser prototype, so it is the timing study (his step 4), not the spec. Merged gate: animatic plus a behavioural spec (triggers, interruption, mobile, reduced motion); motion is re-checked in the browser at stage 11.
4. **Text-only rule vs "patterns do not determine quality".** [Owner §5]: the presence of cards, radii or gradients "does not determine quality by itself"; [Owner §9]: on information sites motion supports reading. A blanket "every section needs a non-text element" would push decoration onto reading pages. Merged: every section declares a visual role in the composition map (asset, scene, motion beat, or a deliberate typographic composition); expressive pages (brand, portfolio, ITSACHAR) fail sections that are only text without an owner exception. See decision 4.
5. **Motion everywhere vs 1–2 signature sequences.** Our map gave each section a motion beat; the owner recommends concentrating on one or two signature sequences for ITSACHAR [Owner §16]. Carbon says the same ("Reserve expressive motion for occasional, important moments", [Carbon](https://carbondesignsystem.com/building-blocks/foundations/motion/overview)). Merged: one or two expressive sequences per site; other sections get productive motion or none.
6. **Real-user validation.** Our workflow had none; the owner requires it and says agent success or AI evaluation does not replace it [Owner §4, §15 step 8]. An agent cannot produce it. Merged: the evidence ledger has a real-user row the owner fills (for example, 3–5 target users given a hint-free task); if empty, the release record says so instead of claiming it.
7. **Performance evidence.** Our checks run in headless Chromium on SwiftShader. The owner's thresholds are Core Web Vitals at p75 of real visits, mobile and desktop separately [Owner §13]. Merged: lab numbers are labelled lab; device FPS needs a real GPU or phone; field CWV is a post-launch check.
8. **Size of the design system.** Our contract lists many sections; the owner says start small and expand with recurring needs [Owner §7, §16]. Merged: the stage 6 contract starts with semantic tokens, type, containers, base components with states, imagery rules and motion tokens; component tokens and more patterns are added only when reused.

No claim in the owner's doc was found to contradict our sources.

## Owner follow-up: Storybook (2026-11-24)

The owner added in the lane thread: "스토리북은 쓰면 좋을듯" (Storybook would be good to use). His doc already describes Storybook as the workbench for components in different states, with interaction, visual and accessibility checks, and allows a simple test page for a small site [Owner §7]; BILL exposed Storybook to agents through a CLI and MCP [Owner §1, §14, R04]. Merged decision: Storybook replaces the hand-built `/system` page rather than sitting beside it (one source for examples [Owner §14]). Stage 6 renders the state matrix as stories; stage 9 slice states become stories with `play` functions; stage 11 runs Storybook Test with a11y; agents query Storybook MCP for existing components before writing new ones [Owner §15 step 4]. Details, versions and limits: [v06-plan.md](v06-plan.md) item 11.

## Owner follow-up: prescriptions, not menus (2026-11-24)

The owner approved the merged workflow as the Ultradesign direction ("일단 좋아") with one change: "각 단계에 선택지를 제공하지 말고 이런이런식으로 하세요를 제공하도록 하자. 사용자가 모두 디자이너나 모든 걸 암묵지로 가지고 있는건 아닐테니." Merged result: every stage follows a fixed recipe with stated defaults; the skill still explores internally (3 directions, several references) but recommends one; each gate asks one plain question (its form was changed to an open question on 2026-11-25, below) and the skill translates vague feedback into a specific revision goal [Owner §15 step 7]. The skill also picks the depth (full or short) from the site type, and a manual dry run precedes any code change. Details: [v06-plan.md](v06-plan.md#prescriptions-not-menus), [stage recipes](v06-plan.md#stage-recipes).

## Owner follow-up: open questions (2026-11-25)

The owner changed decision 2 (#일반): "뭔가를 물을 때 단답으로 객관식이 아니라 주관식의 답을 유도하고 주관식의 답을 얻어야 해. 거기서 구체적인 걸 얻어내기." Merged result: the skill never asks multiple-choice or yes/no questions. It asks open questions that draw out situations, examples, who/when/what, and what the user dislikes and why. It follows any abstract word with a fixed ladder (situation → one example → what would look different on the screen) until the answer names an element and a visible quality. It restates the extraction as an element → effect → expected-state requirement [Owner §15 step 7] and asks which part differs. It records the raw answer next to the extraction [Owner §4]. Design decisions are still prescriptions shown for approval, and approval is read from the user's own words. Details: [v06-plan.md](v06-plan.md#open-questions-concrete-answers) and the *Ask* lines in [stage recipes](v06-plan.md#stage-recipes).

## Merged workflow at a glance

```text
1 Frame ─► 2 Structure & copy ─► 3 References → principles ─► 4 Directions (same content) ─► 5 Visual language, assets & risk spike
  ─► 6 Design-system contract (+ states) ─► 7 Motion language (animatic + spec) ─► 8 Composition map (+ responsive rules)
  ─► 9 Thin end-to-end slice ─► 10 Build-out ─► 11 Independent review & revision ─► 12 Final gate, release, evidence ledger
```

Stages 2 and 3 can run in parallel. The full table (artifacts, gates, roles, tools, completion criteria) is in [v06-plan.md](v06-plan.md#merged-workflow-stage-by-stage).
