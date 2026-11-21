# Reference catalog by design need

Build a living collection organized by questions such as “How does the user recover from an empty queue?” Save distinct examples from everyday use; for a new task, retrieve by decision rather than by visual similarity. Capture the specific screen, behavior, and source URL in a [pattern note](pattern-note.md).

| Need | Starting points | Capture |
| --- | --- | --- |
| Task flows, onboarding, navigation, recovery | [Mobbin](https://mobbin.com/), [UIBowl](https://uibowl.io/landing) | Screen sequence, decisions, content density, state changes, continuity across sizes |
| Form or component anatomy, behavior, variants | [Figma Community](https://www.figma.com/community), [UIArc](https://uiarc.dev/), [daisyUI](https://daisyui.com/) | Slots, labels, focus/keyboard behavior, state patterns; inspect a live example for interaction |
| Composition, typography, palette, imagery | [Dribbble](https://dribbble.com/), [Behance](https://www.behance.net/), [Pinterest](https://www.pinterest.com/) | Visual order, type roles, crops, and how whitespace supports the content |
| Landing sections, product demos, responsive transitions | [21st.dev](https://21st.dev/), [UIArc](https://uiarc.dev/) | User question each section answers, place of the primary action, demo fallback, stacking and reflow |
| Tokens, documentation, and sharing a system | [Seed Design](https://seed-design.io/), [Horon Design](https://design.horon.ai/), [Horon source](https://github.com/horon-ai/design) | Semantic naming, component usage and states, separation of site and consumable package |

## From study to build

- Inspect existing product variants first. [Storybook](https://storybook.js.org/) or a project preview route can make the shared states visible in isolation. For React components requiring custom styling, [Base UI](https://base-ui.com/) is an example of a headless behavior layer.
- Compare alternatives in the app, or sketch in [Figma](https://www.figma.com/) or [Paper](https://paper.design/) when the layout uncertainty warrants it. Check spacing, wraps, and state transitions again in rendered code.
- Study a whole-page reference as a set of slices to understand composition and setup. An authorized reconstruction tool such as [ai-website-cloner-template](https://github.com/JCodesMore/ai-website-cloner-template) is optional; choose the smallest study that answers the question. Use assets and source code according to their permissions and bring the resulting design into the project's own identity.
- For imagery, prefer real product evidence or project-owned art. Where suitable, generate imagery against an explicit subject, crop, intended role, and license/usage requirement. Verify target-width crops in context.

## Example adaptations

**Setup dashboard:** Study a multi-step onboarding flow to learn how people keep their place. Retain the progress signal and the primary next action. Replace nested containers with aligned inline sections, reuse the product's status and table variants, and put the action within reach when navigation compresses.

**Developer-tool landing:** Study a reference that proves its value with a before/after example. Retain the location of the evidence near the main action. Substitute an actual input and output from the product. On narrow screens, queue the copy, action and readable demo in task order.
