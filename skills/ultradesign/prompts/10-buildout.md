# 10 · Build-out

Output: the remaining screens; the gate `buildout` only when a new component appears. Roles: Implementation (parallel by screen), the Lead integrates.

1. **Build the remaining screens** from the catalog: frames from the chosen direction's key frames and the approved system, media / scene / motion components with approved assets. One subagent per screen, each in its own worktree; shared tokens, `DESIGN.md` and components change only through their owner (the Lead). Content model or CMS only if the content changes often.
2. **Per screen,** run the slice recipe: generate A2UI, `a2ui-validate`, guarded build, `hierarchy-check` at 390 / 768 / 1440, stories for new states, `text-only-lint` against the section map, Storybook Test.
3. **No question** unless a component appears that is not in the approved system. Then add its states as Storybook stories, show it on the share and open the gate `buildout`: artifact the Storybook link, reason why the screen needs it, look at the component in every state and on a phone, and ask the stage 6 question about it: "Look at the five things on your phone. Which one looks out of place next to the others, and what makes it stand out?" The owner's reply is resolved as in stage 6.
4. **Complete** the stage with no open gate: `ultradesign_checkpoint action:"complete", stage:"buildout"`.

Done when every screen is built, each passes its checks, and shared tokens and components changed only through their owner.
