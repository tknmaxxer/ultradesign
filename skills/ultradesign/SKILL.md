---
name: ultradesign
description: Plan, implement, or visually review an interface through reference study, a written design system, component recreation, a separate motion pass, and rendered responsive QA. Use for frontend design, redesign, design systems, and visual polish.
---

# Ultradesign

<!-- omp-policy:start -->
Choose the workflow for the user's request: **plan** yields a design contract and verification plan; **review** yields prioritized findings from the current result; **implement** carries the work through rendered verification. Study many references by need, reconstruct the strongest patterns as studies, then adapt each decision to the product. Set tokens and component variants before building. Start new spacing systems on a 4px grid; follow established systems within the agreed migration scope. Let type and spacing establish hierarchy, use quiet dividers and purposeful elevation, and express repeated needs as component variants. Build with accessible primitives, give motion its own pass, and verify real tasks at desktop, tablet, mobile, and layout transitions. Prepare a shared system only when another consumer needs it.
<!-- omp-policy:end -->

## Start here

Read the user request, target route or flow, real content, and available references. In an existing project, inspect the screen, the component and token inventory it uses, and the neighboring surfaces it must fit. Record the audience, job, primary action, intended change, and scope. Resolve routine choices from the project; bring up only choices that would materially change the result. Resolve the links below relative to this skill.

Choose the mode by what the user wants back. “Improve this screen” asks for implementation; “what would you improve?” asks for review or a plan. For “review and fix,” record the initial findings and then implement within the requested scope.

- **Plan:** Run 1 → 2. Read 3–5 as planning references for implementation order, motion triggers, and the verification matrix. Include 6 in the plan when sharing is in scope. Deliver decisions, examples, and acceptance checks; keep application files unchanged.
- **Review:** Establish intent from the brief and relevant contract, source, or references. If the brief and existing UI are the only evidence, state that basis. Run 5 against the current result, using 4 to assess motion and consulting 1–2 for intent when useful. Return findings in order of impact, with evidence and a concrete correction. Keep application files unchanged and label checks that could not be run.
- **Implement:** Run 1 → 2 → 3 → 4 → 5. Use existing decisions and evidence when they meet the next stage's input contract. Iterate on the smallest stage that owns a finding and rerun the affected checks. Run 6 when the user asks to prepare a system for reuse across consumers.

## Stage handoffs

Read each prompt when its stage starts. Carry its output into the next stage as concrete decisions, links, or artifacts. Keep written handoffs together in the agreed artifact location or the conversation. Use the host's checkpoint mechanism if available, and record where the evidence lives.

| Stage | Input cue | Required handoff |
| --- | --- | --- |
| [1 · References](prompts/01-references.md) | Product job and any supplied material | Candidate scan, reconstructed patterns, chosen direction and adaptations |
| [2 · Design system](prompts/02-system.md) | Selected patterns and existing project conventions | Layout, tokens, component contracts and acceptance checks |
| [3 · Implementation](prompts/03-implementation.md) | Design contract and real content | Running route, mapped component variants and state paths |
| [4 · Motion](prompts/04-motion.md) | Usable static flow and transitions | Trigger/state motion spec and reduced-motion behavior |
| [5 · Visual QA](prompts/05-visual-qa.md) | Renderable route, tasks, states and motion spec | Recorded viewport and flow evidence, findings and fix reruns |
| [6 · Sharing](prompts/06-sharing.md) | Verified components and named consumers | System docs, preview and consumer-verified package as scoped |

## Completion

- **Plan:** A builder can implement the intended route from the design contract, tell how each layout changes, and reproduce the acceptance checks.
- **Review:** Every finding separates what happened from what is recommended. Every result names the route, state, and conditions observed; unavailable evidence is explicit.
- **Implement:** The primary task works on the real route. It has been visually inspected at representative and transition widths, with checks for applicable states, keyboard use, and reduced motion. Fix in-scope failures and record their reruns. Mark unverified checks and their specific constraints. For shared systems, include evidence from a consuming project.
