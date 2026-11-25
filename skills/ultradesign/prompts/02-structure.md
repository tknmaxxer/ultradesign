# 2 · Structure and copy

Output: `structure.md` ([template](../assets/templates/structure.md)), a grey browser prototype, the gate `structure`. Role: UX and content ([brief](../references/roles.md#ux-and-content)). Runs in parallel with stage 3 after the brief gate.

1. **Pages.** List only the pages the core tasks need; say why each exists and what is left out. Keep what the current site has when it serves a task.
2. **Real copy.** Write every line from the owner's material in the owner's language, in one source file (for example `proto/copy.json`). No placeholder text. A fact the owner has not given (price, lead time, names) stays open and is left out; list it under "Open facts".
3. **Order and flows.** Per page, the blocks in reading order, each answering one visitor question (genre conventions from the brief apply). Map the core task with its error and recovery paths: wrong audience, unclear term, no mail app, clipboard blocked, failed submit.
4. **Grey prototype.** Plain HTML (or the A2UI renderer for a product UI), no colour, no imagery, system font, rendered from the copy source. Make it a representative screen for stage 4. Walk the core task yourself at 390 and 1440 with Playwright, exercise each error path, record console errors under "Self-walk (agent, not owner evidence)".
5. **Publish** the prototype and `structure.md` on the share.
6. **Gate `structure`.**
   - Artifact: prototype link, `structure.md`.
   - Reason: which core task from the brief the prototype completes.
   - Look at: the first screen; the core task from start to finish; one error path; the open facts.
   - Ask: "Walk through it as the person you described. Where did you stop, re-read or look for something, and what were you looking for?"

Done when the core task completes in the grey prototype with real copy. The owner's walk is recorded in `decisions.md`; the self-walk is not owner evidence.
