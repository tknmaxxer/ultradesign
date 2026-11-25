# 12 · Final gate and release

Output: renders, a recording of the shipped page, the evidence ledger, the completion checklist; the gate `final`. Role: Lead.

1. **Render** the shipped page at 390 and 1440 and record the page in use (the `animatic` recording of the shipped motion, or a screen recording of the core task). Apply [scope applicability](../SKILL.md#applying-scope-downstream) to the checklist: name excluded optional comparisons rather than manufacturing an animatic, map or reference approval.
2. **Fill the evidence ledger** in `decisions.md`: agent task success, automated checks (lab numbers labelled lab), owner approval (gate log with quotes), real-user validation. The agent never fills the last row; an empty row is stated as empty. In OMP the owner records it with `/ud real-user <note>`.
3. **Write the completion checklist** as plain Met / Not met / Not done lines for the 13 criteria in [SKILL.md](../SKILL.md#completion-criteria), each with its evidence or its named gap. For operational readiness, identify content/release owners, update and rollback procedures, preview/deployment differences, inquiry or other off-screen handoffs, served titles/descriptions/indexability, and asset/font usage rights. If analytics is in scope, record task start/success/failure events, duplicate-event checks and collection under each consent state. Link existing evidence or name the gap; a written plan is not an executed check. Do not deploy, change consent policy or enable analytics without authorization. Record who will examine post-launch errors, support feedback and usage against the brief's success criteria.
4. **Surface** remaining findings and unverified states plainly, and the meaningful differences from the picked references (the originality result).
5. **Gate `final`.**
   - Artifact: the two renders, the recording, the checklist, `decisions.md`.
   - Reason: which core tasks the evidence shows users can complete, and which evidence is missing.
   - Look at: the first screen on a phone; the core task; the motion once; the checklist lines marked Not met or Not done; the empty real-user row.
   - Ask: "If this went live today, what is the one thing you would still want to change, and where would a visitor notice it?"
   - A requested change is restated, applied and rechecked against the current build; changed system rules come back with their rendered effect; show the final surface again.
6. **Record** approval only with the owner's words, tied to the version and the render. Then `ultradesign_checkpoint action:"complete", stage:"final", evidence:[…]`. A later request is a new run.

Done when the completion criteria are met or their gaps are named, and the owner's reply is resolved.
