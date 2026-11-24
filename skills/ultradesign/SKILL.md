---
name: ultradesign
description: Design a real frontend with human-selected references, a one-question design interview, DESIGN.md and a live system page, an A2UI catalog of the system's components, an owner-approved hierarchy per screen, validated A2UI generation, and replayed UX QA. Use for frontend design, implementation, or review.
---

# Ultradesign

<!-- omp-policy:start -->
Start with a real product, screen and content. Bring the user a numbered visual reference board and wait for their picks. Interview them one question at a time with evidence and a recommendation. Translate their choices into DESIGN.md, generate the tokens, and get approval of the live system page. Expose the system's components as an A2UI catalog whose layout frames come from approved screens and picked references, and get the catalog approved. Agree a hierarchy table per screen or section — one P1, supporting P2/P3, one primary action — before generating. Generate A2UI JSON against the catalog and table, validate it, render it with the guard on, and check the hierarchy on the render. Replay real UX tasks across devices, show the resulting screen, and wait for final feedback. Add motion as a separate pass on request.
<!-- omp-policy:end -->

## Choose the requested outcome

- **Implement:** Run the workflow below with the human at each decision. Carry the chosen images, decisions and observed evidence forward.
- **Plan:** Frame, gather references, interview, and propose the system, catalog, hierarchy and verification plan. Keep the application unchanged; use research artifacts or the conversation for evidence.
- **Review:** Establish the real task and existing system, then run the QA baseline and report findings. Keep the application unchanged.

## Implementation order

| Stage | Evidence and next decision |
| --- | --- |
| [1 · Frame](prompts/01-frame.md) | Real product, route, audience, content/assets and primary tasks in `brief.md`. |
| [2 · Reference board](prompts/02-references.md) | Numbered captures from real sites and source ledger. User picks one to three; save `picks.md`. |
| [3 · Interview](prompts/03-interview.md) | One numbered question at a time; palettes from palette sites. User chooses; save evidence, recommendation and answer in `interview.md`. |
| [4 · Design system](prompts/04-system.md) | `DESIGN.md` → generated tokens → real `/system`. User approves the current render. |
| [5 · Catalog](prompts/05-catalog.md) | A2UI catalog: frames recreated from approved sources, content and actions with emphasis roles, renderer with guard. User approves the catalog `/system` and frames. |
| [6 · Hierarchy map](prompts/06-map.md) | `hierarchy.json` per screen or section, rendered as a numbered map. User approves or reorders. |
| [7 · Generate](prompts/07-generate.md) | A2UI JSON → `a2ui-validate` → guarded build → `hierarchy-check` at three widths. |
| [8 · UX QA](prompts/08-visual-qa.md) | Remorsearch baseline, scoped fixes, same-scenario replay (up to three fix rounds). |
| [10 · Final check](prompts/10-final.md) | Show the current screen, hierarchy result and QA evidence. User approves or gives specific feedback. |

Run [motion](prompts/09-motion.md) only on request, with a fresh check of the affected states before approval. [Prepare sharing](prompts/11-sharing.md) only when requested for a system with other consumers.

Guides: [reference catalog](references/catalog.md), [A2UI catalog and renderer](references/a2ui.md), [hierarchy table](references/hierarchy.md), [visual QA](references/visual-qa.md), [build guard](assets/templates/guard/README.md).

## Checkpoint at decisions

Every taste decision belongs to the user: references, each interview axis, the system, the catalog, the hierarchy map and the final screen. At a gate, show the artifact and the one decision needed, then end the turn. Record the person's explicit selection or approval before moving on. A recommendation, a resume command, and silence each leave the decision open. If the user requests a revision, keep the old evidence, update the artifact, and present the gate again.

In OMP use `ultradesign_checkpoint` and the owner commands displayed for the gate. On other hosts keep a private `progress.md` beside the run artifacts with the current stage, pending decision, completed evidence, and exact accepted choices, and read it on resume. Keep `DESIGN.md` as the source of system values and the catalog as the source of what a screen can contain; progress and interviews record how the decisions were made.
