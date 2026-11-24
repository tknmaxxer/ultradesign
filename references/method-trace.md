# Workflow provenance

This is a paraphrase of the design walkthrough behind the workflow. The private source export, participants, line numbers, and screen captures are not included.

| Workflow | Source idea | Execution detail |
| --- | --- | --- |
| [Reference study](../skills/ultradesign/prompts/02-references.md) | Browse core galleries widely, organize by need, and select what solves the actual problem. | Produce a private board with actual evidence and access gaps; the user makes the picks. |
| [System interview](../skills/ultradesign/prompts/03-interview.md) | Work out why a reference is useful and adapt its details one at a time. | Offer evidence-backed decisions with a recommendation. The user chooses before the system is built. |
| [Design system](../skills/ultradesign/prompts/04-system.md) | Set up a written system before screen work, following SEED and Horon as structural examples. | Translate the interview into DESIGN.md, generated tokens and a live, reviewable `/system`. |
| [Catalog](../skills/ultradesign/prompts/05-catalog.md) | Recreate useful parts over unstyled primitives, then adapt them to the project. | Recreated arrangements become the catalog's layout frames; generated screens can only use catalog components. The A2UI generation target and its validator came from the v0.4 experiments, not the source walkthrough. |
| [Hierarchy map](../skills/ultradesign/prompts/06-map.md) and [generation](../skills/ultradesign/prompts/07-generate.md) | Simplify the surfaces once real content is in. | Added after the experiments: an owner-approved hierarchy table per screen and a render check, because valid catalog output still put the wrong thing first. |
| [UX QA](../skills/ultradesign/prompts/08-visual-qa.md) | Ask for responsive behavior across desktop, tablet and mobile, then check the running screen. | Replay real tasks with Remorsearch, correct observed issues, and bring the result back to the user. |
| [Motion](../skills/ultradesign/prompts/09-motion.md) | Ask explicitly for motion in a separate pass. | Replay the state change and check reduced motion. |
| [System sharing](../skills/ultradesign/prompts/11-sharing.md) | Use a system subdomain, an Astro site and an npm package, following Horon's site and package split. | Run only for shared consumers. Check a consumer; publishing is separate and permission-gated. |

Plan and review are read-only entry modes for the same method, not additional source stages. Capture widths, reduced-motion checks, recorded handoffs, and access constraints are execution details.
