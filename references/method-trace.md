# Workflow provenance

This is a paraphrase of the design walkthrough behind the workflow. The private source export, participants, line numbers, and screen captures are not included.

| Workflow | Source idea | Execution detail |
| --- | --- | --- |
| [Reference study](../skills/ultradesign/prompts/02-references.md) | Browse core galleries widely, organize by need, and select what solves the actual problem. | Produce a private board with actual evidence and access gaps; the user makes the picks. |
| [System interview](../skills/ultradesign/prompts/03-interview.md) | Work out why a reference is useful and adapt its details one at a time. | Offer evidence-backed decisions with a recommendation. The user chooses before the system is built. |
| [Design system](../skills/ultradesign/prompts/04-system.md) | Set up a written system before screen work, following SEED and Horon as structural examples. | Translate the interview into DESIGN.md, generated tokens and a live, reviewable `/system`. |
| [Two-shot implementation](../skills/ultradesign/prompts/05-implementation.md) | Recreate useful parts over unstyled primitives; apply them to the real work and simplify the surfaces. | The original prompt image is unavailable. The shipped procedure comes from the successful local experiment, not a transcription of the image. |
| [UX QA](../skills/ultradesign/prompts/06-visual-qa.md) | Ask for responsive behavior across desktop, tablet and mobile, then check the running screen. | Replay real tasks with Remorsearch, correct observed issues, and bring the result back to the user. |
| [Motion](../skills/ultradesign/prompts/07-motion.md) | Ask explicitly for motion in a separate pass. | Replay the state change and check reduced motion. |
| [System sharing](../skills/ultradesign/prompts/09-sharing.md) | Use a system subdomain, an Astro site and an npm package, following Horon's site and package split. | Run only for shared consumers. Check a consumer; publishing is separate and permission-gated. |

Plan and review are read-only entry modes for the same method, not additional source stages. Capture widths, reduced-motion checks, recorded handoffs, and access constraints are execution details.
