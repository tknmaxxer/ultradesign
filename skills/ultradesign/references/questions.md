# Open questions

Use this whenever you need something from the owner: a stage-1 fact, a ladder step, a gate answer. The owner is not necessarily a designer; the skill carries the design knowledge and the owner supplies facts and reactions.

## Rules

- **Open, never closed.** Every question asks the owner to describe: a situation, an example, who / when / what, what they would change, what bothered them and where. Never ask multiple choice, a numbered list of options, "A or B", or a question answerable with yes or no.
- **No yes/no openings.** Do not start with `Is`, `Are`, `Do`, `Does`, `Can`, `Should`, `Would`, `Will`; in Korean do not end with `…괜찮나요`, `…맞나요`, `…할까요`, `…좋을까요`. The checkpoint tool rejects these. Rephrase to `Which…`, `Where…`, `What…`, `Tell me about…`.
- **Bounded.** One pending question allows the original plus at most three ladder or follow-up questions; then restate and record what you have.
- **One question at a time**, in plain words in the owner's language, with no design vocabulary ("hierarchy", "density", "register"). Ask the next only after the previous answer is resolved.
- **Only about what tools cannot find.** Read the site, repository, assets, analytics and earlier answers first; ask about the remainder. At most three questions before the brief gate.
- **Unknown facts stay marked.** Price, lead time, numbers, names the owner has not given are written into the artifact as marked hypotheses or left out. Never invent them to fill a page.
- **The skill still decides the design.** Questions gather facts and reactions. The design call comes from the stage recipe and is shown for approval.

## Ladder for vague words

When an answer carries an abstract word (premium, clean, cheap, busy, trustworthy, "feels off"), ask in order until it can be seen or measured:

1. **Situation:** "In what situation did you feel that?"
2. **Example:** "Give one example — a site, a product, a place, a moment."
3. **Visible:** "If that showed on this screen, what would you see that is different from now?"

Stop when the answer names an element and a visible quality. Each step is its own question, one per turn. Do not skip to step 3 and do not run the ladder on words that are already concrete.

## Restate, then ask about the gap

Write what you extracted as a concrete requirement or revision goal in the form **element → user effect → expected state**, show it in one line, and ask openly about the difference:

> This is how I read it: the hero headline → a first-time visitor cannot tell what the company does → the first screen states the business in one line. Which part sounds different from what you meant?

Never ask the owner to confirm with yes/no. Apply the requirement only after the owner's reply leaves the reading standing or corrects it.

## Approval comes from the owner's own words

- A gate counts as approved only when the owner's reply says, in their words, to go ahead ("그대로 진행", "go ahead", "이대로 좋아").
- A reply that requests a change is a revision: restate it in the form above, apply it, reopen the same gate.
- A reply with no change request and no go-ahead gets one open follow-up: "Before we move on, which moment on this screen still bothers you most? Describe where."
- A recommendation from you, a resume command and silence leave the gate open.
- In OMP the extension records the owner's typed reply itself. Record approval with `resolve` and a `quote` copied verbatim from that reply; never reword it. Without a captured reply there is nothing to resolve.

## Record raw answer and extraction side by side

Keep every question in `decisions.md` (template: [decisions.md](../assets/templates/decisions.md)) as a row: question as asked | raw answer, verbatim in the owner's language | extraction as an observable requirement. Label what the owner said (fact), what you read from it (inference), and what you assumed (hypothesis). A requirement is traceable to a raw answer, or it is marked as a hypothesis.

Example (stage 1): the owner answers "일도 잘하더라" to "How would a client describe you to another owner?" The ladder asks for the moment; the owner replies "최대한 적은 횟수의 쉬운 인터뷰, 초안 먼저, 사실상 무제한 수정, 빠른 제작". Extraction: four visible behaviours, each becomes a step or visual on the page. The raw answer stays in the log beside the extraction.

## Good and bad forms

| Instead of | Ask |
| --- | --- |
| "Is this OK?" | "Imagine you are a first-time visitor: where on this screen did you hesitate or feel it was off, and why?" |
| "Do you prefer A or B?" | "Which of these feels furthest from your site, and what in it makes you feel that?" |
| "Should the tone be more premium?" | "Tell me about a moment when a business felt right to you. What did you notice?" |
| "Do you like it?" | "What do you notice first, and what do you feel there?" |
