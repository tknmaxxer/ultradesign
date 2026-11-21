# Reference selection

## Pick a source for the question

| Question | Places to look | What to extract |
| --- | --- | --- |
| How do users complete this task in a real product? | [Mobbin](https://mobbin.com/), [UIBowl](https://uibowl.io/landing) | Screen sequence, navigation, density, and state changes. |
| How might this brand or content look and feel? | [Dribbble](https://dribbble.com/), [Behance](https://www.behance.net/), [Pinterest](https://www.pinterest.com/) | Composition, type hierarchy, imagery, and art direction. A still image is not evidence of usability. |
| How could this component or landing section work? | [Figma Community](https://www.figma.com/community), [UIArc](https://uiarc.dev/), [21st.dev](https://21st.dev/), [daisyUI](https://daisyui.com/) | A behavior, section structure, or variant worth adapting. Check the license before reusing code or assets. |
| How should system documentation be organized? | [Seed Design](https://seed-design.io/), [Horon Design](https://design.horon.ai/), [Horon source](https://github.com/horon-ai/design) | Token names, component anatomy, examples, and state documentation. |

Keep a small collection organized by decisions such as “empty states,” “dense navigation,” or “product demo.” For each saved pattern, note why it worked and where it breaks. Pull a small set for each job rather than turning the catalog into a brief.

## Choose the lightest implementation path

- **Existing product:** Build on its primitives and conventions. In React, [Base UI](https://base-ui.com/) is an example of a headless primitive library when the project needs one. Use [Storybook](https://storybook.js.org/) or an existing preview route to inspect shared variants in isolation, then check them in their real flow.
- **Content-first landing page:** When the stack is open, consider [Astro with React](https://docs.astro.build/en/guides/integrations-guide/react/) for static content with interactive parts. [Horon's site source](https://github.com/horon-ai/design/tree/main/apps/site) is a concrete reference. Do not switch frameworks to reproduce a visual treatment.
- **Shared system:** Separate the docs or preview surface from the component package when multiple products need to consume it. An Astro documentation site with a package distributed through npm is one option, not a prerequisite.
- **Prototype:** Use an existing design canvas, such as Figma or [Paper](https://paper.design/), if it helps compare directions. Keep rendered app code as the final source for QA; inspect details that the handoff might lose.
- **Native mobile:** Treat reachability, keyboard insets, safe areas, and platform conventions as part of the design. If React Native is already in use, check on the actual target devices or available simulators before recommending a stack change.

## Worked adaptations

**Dashboard.** For an onboarding dashboard whose users switch between several setup areas, keep the existing type and color tokens. Preserve persistent navigation on desktop; if it crowds the primary task on mobile, use the product's existing compact navigation. Use inline sections instead of putting summary cards inside another card. Reuse the table primitive and document loading, empty, populated, and error states. Check keyboard navigation and whether users can finish setup at smaller widths.

**Developer-tool landing.** Start from the question “What does this tool do?” Show one real before/after interaction beside the primary action; keep supporting detail quiet. Adapt the composition of a reference, not its copy or character art. Reduce the demo to a readable example on narrow screens. If it animates, show the same result without movement when reduced motion is requested.
