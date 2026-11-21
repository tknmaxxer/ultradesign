# Visual and interaction QA

Run this on changed routes in a real render. Compare with the brief and reference intent, not pixel similarity to the source reference.

| Check | How to verify |
| --- | --- |
| Hierarchy and visual coherence | At each size, find the primary action and inspect type, imagery, alignment, line breaks, and token consistency. Check whether surfaces and elevation still communicate grouping. |
| Responsive layout | Start at representative widths such as 390px, 768px, and 1440px; use target device widths when known. Resize near layout transitions. Check for clipped content, unintended scrolling, blank areas, overlapping elements, and lost actions. |
| Mobile constraints | Inspect viewport configuration on the web, and test safe-area insets for edge-to-edge content and fixed controls. Verify keyboard appearance, orientation changes, thumb reach, and whether zoom is preserved where relevant. Mark inset or ergonomics checks unverified if a desktop viewport cannot reproduce them. |
| Real flows and states | Run the primary task through keyboard and touch or pointer as applicable. Check relevant loading, empty, error, disabled, and success states with realistic content and long strings. |
| Accessibility | Check observable focus order and visibility, control names, headings, contrast, and whether state changes are understandable without color alone. Exercise overlays for keyboard dismissal and focus return where applicable. |
| Motion | Trigger the interaction and replay it with reduced motion enabled. Feedback and completion must still be apparent, and animated elements must not hide or block controls. |
| Landing metadata | If public sharing is in scope, inspect the served title, description, and Open Graph tags in addition to the visible page. |

An interaction review is not the same as a visual critique. For deeper UX review, use a concrete audience, task, and device for each scenario; note what blocks completion before ranking cosmetic issues. For example, on a phone held in one hand, try to reach the primary control, complete the task with the keyboard open, and recover from an invalid input.

Record each blocking issue with the route, width or device, input method, observed failure, and whether a rerun passed. Capture screen evidence when available and distinguish viewport emulation from real-device results.

## Repeatable capture

Start the project using its normal local command. With `uv`, install the pinned Playwright Chromium once and use the script from the skill directory:

```bash
uv run --script scripts/visual-qa.py --install-browser
uv run --script scripts/visual-qa.py --url http://localhost:4321/ \
  --out /tmp/ud-qa --breakpoint 640 --breakpoint 1024 --grid 4
```

By default it captures `390.png`, `768.png` and `1440.png`; each supplied breakpoint adds the widths one pixel below and above. Use `--width` for additional target widths and `--grid` to opt into a project spacing-grid probe. Use `--chromium-path` or `UD_CHROMIUM_PATH` to select a locally installed Chromium-family browser. For self-contained loopback fixtures, `--local-only` restricts resource requests to the local origin, data and blob URLs.

`checks.json` records document-level horizontal overflow, candidate spacing exceptions, possible low contrast for direct text on calculable flat backgrounds, and page errors. Background images, compositing effects and unresolved colors are counted as unmeasured. Review signals against the component contract; measure foregrounds with their actual rendered backgrounds where required. Exercise interactions, states, motion and keyboard separately and record observations in the [QA evidence record](../assets/templates/qa-evidence.md).
