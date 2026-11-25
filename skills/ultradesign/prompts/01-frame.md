# 1 · Frame

Output: `brief.md` ([template](../assets/templates/brief.md)), the depth, and the gate `frame`. Questions: [open questions](../references/questions.md). Role: Lead.

1. **Read first.** Inspect the existing site or repository, the owner's assets, analytics and support data. Fill from them everything tools can find: product, route, stack, existing system, copy, assets, constraints. Create the private run folder with `decisions.md` ([template](../assets/templates/decisions.md)).
2. **Ask at most three questions, one at a time, in the owner's language.** Only about facts the material does not answer; skip any it answers. Default three:
   - "Who comes to this site? Describe one real person or a recent visitor — what were they doing just before they arrived?"
   - "After reading the site, what should that person do next, and what happens if they don't?"
   - "When someone describes this site to a friend afterwards, what do you want them to say? Use their words, not design words."

   Do not ask about liked or disliked sites; they come from the owner's reaction at the references gate. Do not ask about existing material; read it. Each answer: `ultradesign_checkpoint action:"ask"`, end the turn, then `resolve` with the extraction. Run the ladder on every abstract word (situation → example → what would be visible) until each brand word becomes an observable requirement: type contrast, density, role of imagery, composition, motion intensity.
3. **Write `brief.md`.** Raw answers and extractions side by side in `decisions.md`. In the brief:
   - 3–5 brand words, each as an observable requirement.
   - **Genre convention:** what kind of site a visitor takes this for and the conventions visitors of that genre expect, as explicit lines the owner can correct.
   - **Motion:** intensity and register as explicit lines (for example "high, crisp starts and stops, no overshoot").
   - **Hypotheses, not inventions:** price, lead time, numbers and names the owner has not given are marked as hypotheses or left open and out of the copy; the gate says so.
   - Label each line fact, inference or hypothesis.
4. **State the depth** from the site type: `full` for brand, portfolio, landing, scroll story, immersive 3D; `short` for a small page or product screens on an existing system, plus the stages (references, assets, motion, map, buildout) the brief needs. Do not ask. In OMP: `ultradesign_checkpoint action:"scope", depth, include`.
5. **Gate `frame`.**
   - Artifact: `brief.md` on the share.
   - Reason: how the brief follows from the owner's answers, one line.
   - Look at: the site's genre and conventions line; the motion intensity and register line; the marked hypotheses and open facts; the observable requirement behind each brand word; the depth.
   - Ask: "Reading this as if a stranger wrote it about your site — which line sounds unlike you, and how would you say it?"

While the gate is open, work that does not depend on the answer may run: capture a reference pool with `reference-board`, set up tooling, generate unrelated assets. Do not draft structure, cards or directions that depend on it; they would be rebuilt (dry-run lesson: stage 3 and 4 work done before the brief gate was thrown away).

Done when you can say whose problem this is, which tasks matter, what success looks like, and the owner's reply has been resolved into the brief.
