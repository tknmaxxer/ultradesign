# 5 · Verify the real design

## Input

Live routes or rendered artifact, primary task and representative states, intended hierarchy and responsive transitions, and the motion specification. For a review, use the current product and record which source or contract describes its intent.

## Work

1. Set a small matrix: primary route, key states, and 390/768/1440px as starting widths. Use the layout contract, media/container queries, or an observed resize to locate transitions, then capture both sides. Capture whole views and targeted states at consistent content and data. Use the [visual QA guide](../references/visual-qa.md) to select checks and optionally collect repeatable screenshots and measurements. If the route cannot be rendered, record the missing prerequisite and label source observations separately.
2. Look at the captures, rather than counting them as a pass. At each width, locate the primary action and inspect typography, line breaks, imagery, grouping, clipping, overlap and unexpected blank space. Check real long content and narrow layout transitions. Exercise the primary task with keyboard and pointer or touch where relevant; include focus, alternative state feedback, contrast, and overlay behavior. Replay motion under normal and reduced-motion preferences. Handle device-only behavior on a device or simulator where possible.
3. Keep independent checks independent when delegating (for example, layout/reflow versus keyboard/state/motion). Give each reviewer the same contract, route, and known fixtures; integrate their findings from evidence rather than votes.
4. Record the condition, expected outcome, observed outcome, and evidence in the [QA record](../assets/templates/qa-evidence.md). In implementation, correct the owning token, variant, layout, or behavior and rerun the same check and any affected widths or states. In review, rank findings by their effect on completing the task and recommend where to correct them.

## Output

Evidence at mobile/tablet/desktop and layout transitions; task, state, accessibility, and motion results; fixes with like-for-like reruns when applicable. Distinguish rendered observation, automated signal, and a check not run. In a plan, specify this matrix and how to run it.
