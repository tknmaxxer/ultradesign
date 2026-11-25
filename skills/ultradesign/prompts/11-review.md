# 11 · Independent review and revision

Output: review rounds recorded in `decisions.md`; no owner gate. Role: Independent review ([brief](../references/roles.md#independent-review)). Read-only for the reviewer; the builder fixes. Mode `review` runs only this stage's baseline and reports; it never edits the app.

1. **Reviewer.** A reviewer that did not build the page drives the browser. In OMP use a fresh subagent. Without one, do a self-pass and label it **self**.
2. **Remorsearch.** Locate `remorsearch-ux-qa` through host skill discovery or `REMORSEARCH_SKILL_DIR` (the installed folder with `SKILL.md`); record its revision. If missing, offer the [upstream install steps](https://github.com/remorser58/remorsearch_ux_qa_skill#install) and install only with the user's authorization. Otherwise run [local visual and interaction QA](../references/visual-qa.md) and label the run **fallback** with its coverage and gaps.
3. **Baseline (round 0).** Follow Remorsearch's `persona-qa` workflow: route or build ID, 3–5 concrete tasks, fixtures, approvals, design intent (`DESIGN.md`, the Storybook build, the approved animatic and spec). Desktop, tablet and phone profiles (for example `laptop-1440`, `galaxy-tab-s9`, `iphone-15`), pointer and touch paths, a keyboard-only path; probe state preservation and recovery. When the host allows, add a separate screenshot-only reader. Check reflow in the actual viewport; get a second pass on P0/P1.
4. **Keep the seven review types apart:** visual, functional, responsive, accessibility, motion, performance, operational. Run, per page:

   ```sh
   uv run --script scripts/visual-qa.py --url URL --out out/review/visual
   uv run --script scripts/hierarchy-check --url URL --hierarchy hierarchy/page.json --out out/review/hierarchy
   uv run --script scripts/text-only-lint --url URL --map composition.json --widths 390,1440 --out out/review/text-only
   uv run --script scripts/originality-check --url URL --reference REF1 --reference REF2 --reference REF3 --width 1440 --out out/review/originality
   uv run --script scripts/scene-qa --url URL --profile desktop-1440 --out out/review/scene-desktop
   uv run --script scripts/scene-qa --url URL --profile phone-390 --out out/review/scene-phone
   ```

   and Storybook Test (`vitest --project=storybook`: interaction and a11y). Motion real-world checks: fast scroll, repeated clicks, back, resize, touch, keyboard; the shipped motion against the animatic and spec; the reduced-motion version. The originality score is a structural heuristic for owner review, not a verdict. Scene numbers are lab numbers; field Core Web Vitals (p75) are a post-launch check. Operational items (preview versus deployment, rollback, content updates) are reported, not run.
5. **Findings** as element → user effect → expected state, with ID, reproduction, device and input. A text-only section on an expressive page and a flagged originality match are findings.
6. **Fix and replay (rounds 1–3).** Give the builder a fix packet of confirmed open findings: ID, reproduction, expected state, owning layer (screen JSON, catalog component or frame, `DESIGN.md`) and decisions to preserve. A change to the catalog, system or an approved table goes back through the Lead and its gate. After each fix rerun `a2ui-validate`, the guard and `hierarchy-check`, then replay the same scenarios, devices and data; repeat prior passing tasks for regressions. Stop when agreed findings are resolved, the same finding stays open two rounds, a regression persists through the next round, or three fix rounds have run. Keep the best state.
7. **Record each round** in OMP with `ultradesign_checkpoint action:"qa_round", qaRound:{ round, method:"remorsearch"|"fallback", reviewer:"independent"|"self", report, openFindings }`. On other hosts keep the same entries in the [round index](../assets/templates/qa-evidence.md). Fill the agent-success and automated-check rows of the evidence ledger; leave real-user validation empty.
8. **Report** what was fixed and what stays open, with reproducible evidence for the current build, not an aggregate score. No question.

Done when agreed findings are resolved or recorded as open.
