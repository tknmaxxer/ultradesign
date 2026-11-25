# Visual and interaction QA

Run this on changed routes in a real render. Compare with the brief, the approved direction and the animatic. A render must differ in layout from every picked reference; the originality check measures that, and the pixel similarity to a source is never a goal.

| Check | How to verify |
| --- | --- |
| Hierarchy and visual coherence | At each size, find the primary action and inspect type, imagery, alignment, line breaks, and token consistency. Check whether surfaces and elevation still communicate grouping. |
| Responsive layout | Start at representative widths such as 390px, 768px, and 1440px; use target device widths when known. Resize near layout transitions. Check for clipped content, unintended scrolling, blank areas, overlapping elements, and lost actions. |
| Mobile constraints | Inspect viewport configuration on the web, and test safe-area insets for edge-to-edge content and fixed controls. Verify keyboard appearance, orientation changes, thumb reach, and whether zoom is preserved where relevant. Mark inset or ergonomics checks unverified if a desktop viewport cannot reproduce them. |
| Real flows and states | Run the primary task through keyboard and touch or pointer as applicable. Check relevant loading, empty, error, disabled, and success states with realistic content and long strings. |
| Accessibility | Check observable focus order and visibility, control names, headings, contrast, and whether state changes are understandable without color alone. Exercise overlays for keyboard dismissal and focus return where applicable. |
| Motion | Trigger the interaction and replay it with reduced motion enabled. Feedback and completion must still be apparent, and animated elements must not hide or block controls. Then stress it as a user would: fast scroll, repeated clicks, back navigation, resize mid-animation, touch, keyboard. The shipped motion must match the approved animatic and spec. |
| Visual share per section | Run `text-only-lint` against `composition.json` at 390 and 1440: each section's share of area covered by image, video, canvas, SVG and result fragments must match its declared `visualRole`. 0.00 means text only. |
| Originality | Run `originality-check` against every picked reference at the same width. The score is a structural heuristic (default threshold 0.85), not a calibrated plagiarism verdict; a flagged match goes to the owner on a side-by-side board. |
| Scene and performance | Run `scene-qa`: WebGL context, console and page errors, frame-rate sample, LCP with the scene loaded, reduced-motion still, WebGL-off fallback still. Frame rates here are lab numbers (headless or SwiftShader), not device numbers; field Core Web Vitals (p75) are a post-launch check. |
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
