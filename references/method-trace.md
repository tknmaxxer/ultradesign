# Workflow provenance

This is a paraphrase of the design walkthrough behind the workflow. The private source export, participants, line numbers, and screen captures are not included.

| Workflow | Source idea | Execution detail |
| --- | --- | --- |
| [Frame](../skills/ultradesign/prompts/01-frame.md) and [open questions](../skills/ultradesign/references/questions.md) | Added in v0.0.60 from the owner's direction (2026-11-25): draw out open, descriptive answers instead of short multiple-choice ones, and extract the specifics. | At most three open questions, a three-step ladder for vague words, raw answer and extraction recorded side by side; the skill decides the design, the owner approves in their own words. |
| [Reference study](../skills/ultradesign/prompts/03-references.md) | Browse core galleries widely, organize by need, and select what solves the actual problem. | Produce a private board with actual evidence and access gaps; the skill picks three and writes deconstruction cards of principles, not layouts. |
| [Directions](../skills/ultradesign/prompts/04-directions.md) | Work out why a reference is useful and adapt its details. | Three directions on the same content with one recommended; the owner approves or redirects. |
| [Design system](../skills/ultradesign/prompts/06-system.md) | Set up a written system before screen work, following SEED and Horon as structural examples. | Translate the direction into DESIGN.md, generated tokens and a reviewable Storybook. |
| [Motion](../skills/ultradesign/prompts/07-motion.md) | Ask explicitly for motion in a separate pass. | A required stage: animatic, behavioural spec and reduced-motion version. |
| [Composition map](../skills/ultradesign/prompts/08-map.md) and [slice](../skills/ultradesign/prompts/09-slice.md) | Simplify the surfaces once real content is in. | Added after the experiments: an owner-approved hierarchy table per screen and a render check, because valid catalog output still put the wrong thing first; A2UI generation and its validator came from the v0.0.40 experiments, not the source walkthrough. |
| [Independent review](../skills/ultradesign/prompts/11-review.md) | Ask for responsive behavior across desktop, tablet and mobile, then check the running screen. | A reviewer that did not build the page replays real tasks with Remorsearch, corrections follow, and the result goes back to the user. |
| [System sharing](../skills/ultradesign/prompts/13-sharing.md) | Use a system subdomain, an Astro site and an npm package, following Horon's site and package split. | Run only for shared consumers. Check a consumer; publishing is separate and permission-gated. |

Plan and review are read-only entry modes for the same method, not additional source stages. Capture widths, reduced-motion checks, recorded handoffs, and access constraints are execution details.
