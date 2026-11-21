# 5 · Verify the real design

## Input

Live routes or rendered artifact, primary task and representative states, intended hierarchy and responsive transitions, and the motion specification. For a review, use the current product and record which source or contract describes its intent.

## Work

1. Set a small matrix: primary route, key states, and 390/768/1440px as starting widths. Use the layout contract, media/container queries, or an observed resize to locate transitions, then capture both sides. Capture whole views and targeted states at consistent content and data. Use the [visual QA guide](../references/visual-qa.md) to select checks and optionally collect repeatable screenshots and measurements. If the route cannot be rendered, record the missing prerequisite and label source observations separately.
2. Open final and lead-reference images side by side at the **same CSS widths**. Compare both whole pages and the same functional regions; reopen the recreation when it is unclear where an unplanned difference came from. For each width identify the first glance and action, then compare shared edges, type sizes and line breaks, density, component boundaries and reflow. List concrete differences by width and region (e.g. “390px, one invoice fits above the fold instead of three; each status wraps because the amount and status share a narrow column”). Keep a difference only if it matches an explicit adaptation and helps this task. For review without a chosen reference, compare to the current contract or neighboring route and state that basis.
3. Keep independent checks independent when delegating (for example, layout/reflow versus keyboard/state/motion). Give each reviewer the same contract, route, and known fixtures; integrate their findings from evidence rather than votes.
4. Check actual task states and long content for clipping, overlap, unexpected blank space and missing feedback. Exercise the primary task with keyboard and pointer or touch as relevant; include focus, contrast, overlay behavior and motion with reduced motion both off and on. Record the condition, expected outcome, observed outcome and evidence in the [QA record](../assets/templates/qa-evidence.md).
5. In implementation, **fix the observed differences** that undermine the task or break the contract. Change the owning token, variant, layout or behavior. Recapture the same widths and states, reopen them beside the same reference, and confirm whether each correction landed. In review, rank findings by their effect on completing the task and recommend where to correct them.
   - For a dashboard, cover up the accent mentally and check whether the major massing still reads as a single analysis surface and a supporting record ledger. At 390px find the primary plot and first invoice using the new density. If the new palette is the only obvious change, fix the grouping or alignment and compare again.

## Output

Evidence at mobile/tablet/desktop and layout transitions; task, state, accessibility, and motion results; fixes with like-for-like reruns when applicable. Distinguish rendered observation, automated signal, and a check not run. In a plan, specify this matrix and how to run it.
