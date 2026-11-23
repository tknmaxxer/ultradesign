---
name: ultradesign
description: Design a real frontend with human-selected references, a one-question design interview, DESIGN.md and a live system page, two-shot implementation, and replayed UX QA. Use for frontend design, implementation, or review.
---

# Ultradesign

<!-- omp-policy:start -->
Start with a real product, screen and content. Bring the user a numbered visual reference board and wait for their picks. Interview them one question at a time with evidence and a recommendation. Translate their choices into DESIGN.md, generate the tokens, and get approval of the live system page. Recreate the picked reference with the project's components, then adapt it to real content and simplify. Replay real UX tasks across devices, show the resulting screen, and wait for final feedback. Add motion as a separate pass on request.
<!-- omp-policy:end -->

## Choose the requested outcome

- **Implement:** Run the workflow below with the human at each decision. Carry the chosen images, decisions and observed evidence forward.
- **Plan:** Frame, gather references, interview, and propose the system, implementation and verification plan. Keep the application unchanged; use research artifacts or the conversation for evidence.
- **Review:** Establish the real task and existing system, then run the QA baseline and report findings. Keep the application unchanged.

## Implementation order

| Stage | Evidence and next decision |
| --- | --- |
| [1 · Frame](prompts/01-frame.md) | Real product, route, audience, content/assets and primary tasks in `brief.md`. |
| [2 · Reference board](prompts/02-references.md) | Numbered captures and source ledger. User picks one to three; save `picks.md`. |
| [3 · Interview](prompts/03-interview.md) | One numbered question at a time. User chooses; save evidence, recommendation and answer in `interview.md`. |
| [4 · Design system](prompts/04-system.md) | `DESIGN.md` → generated tokens → real `/system`. User reviews and approves the current render. |
| [5 · Two-shot build](prompts/05-implementation.md) | Reference reconstruction using our components, then real content and simpler hierarchy. Compare both renders. |
| [6 · UX QA](prompts/06-visual-qa.md) | Remorsearch baseline, scoped fixes, same-scenario replay (up to three fix rounds). |
| [7 · Final check](prompts/08-final.md) | Show the current screen and QA evidence. User approves or gives specific feedback. |

Run [motion](prompts/07-motion.md) only on request, with a fresh check of the affected states before approval. [Prepare sharing](prompts/09-sharing.md) only when requested for a system with other consumers.

## Checkpoint at decisions

At a gate, show the artifact and the one decision needed, then end the turn. Record the person's explicit selection or approval before moving on. A recommendation, a resume command, and silence each leave the decision open. If the user requests a revision, keep the old evidence, update the artifact, and present the gate again.

In OMP use `ultradesign_checkpoint` and the owner commands displayed for the gate. On other hosts keep a private `progress.md` beside the run artifacts with the current stage, pending decision, completed evidence, and exact accepted choices, and read it on resume. Keep `DESIGN.md` as the source of system values; progress and interviews record how the decisions were made.
