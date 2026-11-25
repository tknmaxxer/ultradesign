# Ultradesign v0.6 — rewrite plan

Status: implemented as v0.6 on 2026-11-25 (order-of-work steps 1–5 and 7). The owner approved the direction on 2026-11-24 ("일단 좋아") and asked for prescriptions instead of choices (see "Prescriptions, not menus"). The step-0 manual dry run stopped after stage 2 when the owner chose to rewrite the skill first; its lessons are in [lessons.md](lessons.md). Step 6 (second dry run with the rewritten skill) and the `evals/v06` metrics remain open. The research behind each stage, with sources, is in [designer-workflow.md](designer-workflow.md). This plan merges the owner's [frontend design workflow research](owner/frontend_design_workflow_research_2026-11-24_en.md) (cited as [Owner §N]) with our studio research; what came from where, and the conflicts, are in [workflow-merge.md](workflow-merge.md). Board: the owner's private research share (`/wf/index.html`).

## Why v0.5 has to change

The owner's direction (2026-11-24, Discord #일반): references must stay references, the skill must follow a designer's workflow, the design-system contract and motion design are equally important, text-only output is one of the biggest problems, and Three.js, imagery, JS effects and React should be used where they fit. v0.5 contradicts that in four places:

| v0.5 behavior | Where | Conflict |
| --- | --- | --- |
| Catalog frames "recreate that arrangement" of a picked reference and are rendered beside the source to keep its proportions. | `prompts/05-catalog.md` step 2 | Transplants a reference's layout; the owner rejects copying. |
| The section map attaches "the reference crop whose layout each section takes". | `prompts/06-map.md` step 2 | Same: layout copied section by section. |
| Motion runs "only on request", after the static flow. | `SKILL.md`, `prompts/09-motion.md`, `adapters/omp/workflow.ts` (`state.motion`) | Motion is an optional appendix, not a design stage. |
| No stage produces imagery, illustration, 3D or interactive scenes. The interview chooses type, palette, status and density only. | `prompts/03-interview.md`, catalog | Output is type + boxes + copy: the text-only, "AI-looking" result. |
| The guard rejects `.style` access and JSX `style` everywhere. | `assets/templates/guard/README.md` | GSAP, Motion and Three.js write inline transforms and canvas; the guard currently makes the required visual layer impossible. |
| No IA, flow or copy stage: the brief records real copy, but structure is first decided per screen in the hierarchy map, after the system. | `prompts/01-frame.md`, `prompts/06-map.md` | The owner puts sitemap, flows, error paths and real copy, tested in a cheap browser prototype, before visual directions [Owner §3 stage 3, §15 step 2]. |
| States appear only as "adjacent states" in the brief; `/system` shows no state matrix; generation renders full screens before one task works end to end. | `prompts/01-frame.md`, `04-system.md`, `07-generate.md` | State design [Owner §5] and a thin end-to-end slice before the screen count grows [Owner §15 step 5]. |
| Evidence is one QA record; no separation between agent success, automated checks, owner approval and real-user validation. | `prompts/08-visual-qa.md`, `10-final.md` | [Owner §15 step 8], [Owner §16] completion criteria. |

## What stays

- **Human taste gates** with `ultradesign_checkpoint`, explicit recorded approval, and "a recommendation, a resume command and silence leave the decision open". Studios work the same way: workshops are "decision session[s] rather than a presentation" (Instrument).
- **Real-site reference boards** (`reference-board`, CDP adapters, source ledger) and **palette sites** (`palette-board`). Their output changes: picks feed principles, not layouts.
- **`DESIGN.md` as the single source**, `design-tokens` and `design-lint`. It is extended, not replaced.
- **The build guard** (hex/px/font bans, product code composes system components only), extended with sanctioned motion/scene entries.
- **Hierarchy table** (one P1, P2/P3, one primary action, copy budgets) and `hierarchy-check` at three widths.
- **A2UI catalog + `a2ui-validate`** for product UI screens (dashboards, consoles, forms), where it proved itself (0-pixel re-render). For expressive landing/brand pages it becomes the layer for content sections only; hero scenes and motion set pieces are catalog `media`/`scene` components with approved assets, not free composition.
- **Visual QA** (`visual-qa.py`) and the **Remorsearch** baseline → fix → replay loop. It already matches two owner rules: the fix packet names the finding, reproduction and expected state [Owner §15 step 7], and rounds are capped at three. The read-only Remorsearch pass becomes the independent reviewer [Owner §15 step 6].
- **A board on the Tailscale share for every gate.**

## What is replaced

| v0.5 | v0.6 |
| --- | --- |
| Frame → straight to references; structure decided per screen at stage 6. | 1 · Frame with words translated into observable requirements, then 2 · **Structure & copy**: sitemap/IA, flows with error paths, real copy, a grey browser prototype that completes the core task [Owner §3, §15 step 2]. |
| 2 · Reference board → picks carry layouts into frames and map. | 3 · References → **deconstruction cards**: per pick, what makes it work (composition, type, color, imagery, motion, interaction), stated as principles; an explicit "not carried" line for its layout and signature elements. |
| 3 · Interview, five sequential axes (direction, typography, palette, status, density). | 4 · **Concept directions on the same content**: 3 directions stretched far apart, each a stylescape strip (generated imagery, type specimen, sourced palette) plus stage 2's representative screen in real copy and a 5–8 s key-interaction/motion sketch [Owner §15 step 3]. The skill recommends one with reasons and core rules; the owner approves or redirects (see "Prescriptions, not menus"). Evidence: 3 territories (Instrument), 3 + wild card (Blind); immersive studios publish no count and do not use stylescapes, so the motion sketch and a 3D spike carry the immersive side. |
| Catalog frames recreated from references. | Frames come from the chosen direction's key frames and the approved system; originality is checked by comparing against the references (must differ), not by matching them. |
| 9 · Motion on request. | 7 · **Motion language** is a required stage: role of motion first, principles, productive/expressive easing and duration tokens, states and triggers, a storyboard of key moments, a behavioural spec (interruption, focus, mobile, reduced motion) [Owner §11], and a recorded animatic approved before build. |
| Section map with reference crops. | 8 · Composition map: hierarchy table + the **asset** each section uses + its motion beat (expressive motion in 1–2 signature sequences, productive or none elsewhere [Owner §16]) + section states + responsive rules [Owner §10]; each section declares its visual role (decision 4). |
| 7 · Generate all screens, then QA. | 9 · **Thin end-to-end slice** of one core task with all its states, gated in the browser [Owner §15 step 5]; then 10 · build-out. |
| 8 · UX QA (Remorsearch baseline → fix → replay), run in the building session. | 11 · **Independent review**: the same loop driven by a reviewer agent that did not build the page, with the seven review types kept apart [Owner §13, §15 step 6]. |
| 10 · Final check. | 12 · Final gate with the evidence ledger and the [Owner §16] completion criteria. |

## What is new

1. **Visual language and asset production stage** — key visual(s), imagery rules (types, grading, crop), illustration/3D/scene prototype. Every asset has provenance (prompt, model, source, licence) in `assets.json`.
2. **Motion tokens and scene rules in `DESIGN.md`** — `motion.duration.*` (a 6-step scale like Carbon's 70/110/150/240/400/700 ms), `motion.easing.productive|expressive.*` (Carbon's two registers; Atlassian's rule of under 150 ms for motion seen dozens of times a day and faster exits than entrances), choreography rules (one focal point, stagger by hierarchy — Fluent 2, Atlassian), 2–3 named brand behaviours derived from the brand idea (COLLINS OFFF: Attraction and Projection; HSBC: "opening"), and a reduced-motion substitute per behaviour (WCAG 2.3.3; Motion's `reducedMotion="user"`). For WebGL a performance budget: device, FPS floor, max texture size, fallback image (OFF+BRAND: 60 FPS on iPhone SE 2020; Locomotive: "Performance is a design constraint, not a cleanup task.").
3. **Animatic recorder** — Playwright video capture of an HTML/GSAP or R3F prototype → `ffmpeg` to MP4 + a frame strip PNG for the board. Prototyped on 2026-11-24 outside the repo (`~/dev/scratch/ud-animatic/record.mjs`): a Three.js + GSAP hero sketch recorded to 8.2 s WebM → MP4 + strip, WebGL2 on SwiftShader, 0 console errors; the result is on the board under stage 7. The skill version should replace the fixed recording length with the timeline's own duration (`tl.duration()`) and add a reduced-motion pass.
4. **Text-only lint** — on the rendered page, per section: share of area covered by image/video/canvas/SVG art vs text blocks, checked against the visual role the composition map declares. On expressive pages (brand, portfolio, ITSACHAR) a text-only section fails unless the map records an owner exception; on reading and product pages a deliberate typographic role passes [Owner §5, §9] (decision 4).
5. **Originality check** — render vs each picked reference at the same width: layout-structure similarity (block positions) flagged above a threshold; the owner sees both.
6. **Scene/motion QA** — WebGL context and console errors, FPS sample on the declared device profile, reduced-motion replay, LCP with the scene loaded; lab numbers are labelled lab, field Core Web Vitals (p75) are a post-launch check [Owner §13]; real-world motion checks (fast scroll, repeated clicks, back, resize, touch, keyboard) [Owner §11].
7. **Structure & copy stage** — `structure.md` (sitemap/IA, flows with error and recovery paths) and a grey browser prototype in real copy on the share, gated before directions [Owner §3 stage 3, §15 step 2].
8. **State matrix** — per component and per section, the states from [Owner §5] that the task can reach; `/system` renders them; the slice must implement them.
9. **Thin-slice gate** — one core task, normal/loading/empty/failure/permission states, real content, responsive and motion integrated, used by the owner in the browser before build-out [Owner §15 step 5].
10. **Independent reviewer and evidence ledger** — a reviewer subagent that did not generate the page drives the browser; findings use element → user effect → expected state [Owner §15 steps 6–7]. `decisions.md` keeps four evidence rows apart: agent task success, automated checks, owner approval, real-user validation (owner-run; the agent never fills it) [Owner §15 step 8].
11. **Storybook as the component workbench and the `/system` gate** (owner direction, 2026-11-24 Discord: "스토리북은 쓰면 좋을듯"). One surface instead of a hand-built `/system` page plus a separate story set, so values and examples are not duplicated [Owner §14]. Each state in the matrix is a story; slice states get `play` functions; MDX pages hold tokens, imagery and motion specimens; `storybook build` output is served on the share for the gate. Tests: Storybook Test through `@storybook/addon-vitest` (render + interaction tests in Vitest browser mode with Playwright) and `@storybook/addon-a11y` ([Storybook, testing](https://storybook.js.org/docs/writing-tests)). Agents use `@storybook/addon-mcp`: `docs-list`/`docs-show` read the components manifest (enable `features.componentsManifest`; React frameworks supported), `test-run` runs story tests with a11y ([Storybook, MCP server](https://storybook.js.org/docs/ai/mcp/overview)); this is the BILL pattern of exposing Storybook knowledge to agents [Owner §1, R04]. Versions checked on npm 2026-11-24: `storybook` and the addons are `latest` 10.6.8, `next` 11.0.0-rc.0; pin 10.x. Limits: Storybook's AI features are marked preview and "may change"; the MCP server is part of the dev server, so a non-localhost host needs `core.allowedHosts`; Chromatic visual tests are an external hosted service and are not used (no spending, no upload) — visual regression stays on local Playwright screenshots [Owner §13]. Not yet installed or run here.

## Merged workflow, stage by stage

This is the v0.6 `SKILL.md` outline. Each stage: artifact (visual) → owner gate → role → tools → done when. A gate shows the artifact on the share, asks one decision, and ends the turn. Stages 2 and 3 can run in parallel. A simple site may combine stages; the gates still happen [Owner §3].

| # | Stage | Artifact | Owner gate | Role [Owner §15] | Tools | Done when |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Frame | `brief.md`: users, core tasks, real content, constraints, success criteria; 3–5 **brand words**, each translated into an observable requirement; facts vs hypotheses; asset inventory [Owner §15 step 1] | Confirm brief and words | Lead | conversation, existing analytics/support data | Can say whose problem, which tasks, what success is |
| 2 | Structure & copy | `structure.md`: sitemap/IA, flows with error and recovery paths, real copy, sample data; grey browser prototype [Owner §3 stage 3, §4, §15 step 2] | Owner clicks through the core task | UX & content | HTML or A2UI renderer, share board | Core task completes in the grey prototype with real copy |
| 3 | References → principles | Reference board; per pick a **deconstruction card** (principles + "not carried") [Owner §5] | Approve the 3 picks the skill made (or name one that feels wrong) | UI & system | `reference-board`, CDP | Each pick maps to principles, none to a layout |
| 4 | Directions on the same content | 3 directions built by the skill, one recommended; each: stylescape strip, stage 2's representative screen in real copy, 5–8 s key-interaction sketch [Owner §15 step 3] | Approve the recommended direction or say what feels off; reasons and core rules recorded | UI & system, Motion & 3D | `generate_image`, `palette-board`, HTML board, animatic recorder | Directions differ in type, density, composition and imagery, not colour alone |
| 5 | Visual language, assets & risk spike | Key visuals, imagery rules, `assets.json` provenance; medium decision per moment ("is real-time 3D necessary?"); the hardest transition or scene working in the target browser with measured cost [Owner §3 stage 5, §12] | Approve key visuals, imagery rules and the spike result | Motion & 3D | `generate_image` (input images for consistency), Three.js/R3F, SVG/canvas, Lottie | Core experience feasible in the target environment; fallback defined |
| 6 | Design-system contract | `DESIGN.md` (semantic tokens, type, containers, base components, **state matrix**, imagery rules, motion tokens, scene budget) → `tokens.css`/`tokens.ts` → **Storybook**: one story per state in the matrix, plus MDX pages for tokens, imagery and motion specimens; its static build is the `/system` gate on the share [Owner §5, §7, §15 step 4] | Approve the Storybook `/system` build | UI & system (Lead owns `DESIGN.md`) | `design-tokens`, `design-lint`, Vite/React/Base UI, Storybook 10 (`react-vite`, `addon-vitest`, `addon-a11y`, `addon-mcp`) | Every component in use has stories for its reachable states; render and a11y tests pass |
| 7 | Motion language | Role of motion, principles, key moments, states and triggers, storyboard, recorded **animatic**, behavioural spec (interruption, focus, mobile, reduced motion) [Owner §11] | Approve animatic + spec | Motion & 3D | GSAP / Motion, R3F, Playwright video, ffmpeg | 1–2 signature sequences timed; every motion has a reduced-motion substitute |
| 8 | Composition map | Per section: hierarchy table + asset + motion beat + states + responsive rules + declared visual role [Owner §10] | Approve map | UX & content, UI & system | `screen-map`, hierarchy JSON | No section without a visual role; breakpoints written as rules |
| 9 | Thin end-to-end slice | One core task built with normal/loading/empty/failure/permission states, real content, responsive, motion integrated [Owner §15 step 5, §8] | Owner uses it in the browser | Implementation | A2UI, `a2ui-validate`, guard, Storybook stories with `play` functions for each slice state | Task completes in every state at 390/768/1440 and between |
| 10 | Build-out | Remaining screens from the catalog (frames from the direction, media/scene/motion components); content model / CMS only if content changes often [Owner §8] | Catalog gate when new components appear | Implementation, parallel by screen; Lead integrates | A2UI, guard, worktrees | Shared tokens/components changed only by their owner |
| 11 | Independent review & revision | Seven review types kept apart; findings as element → user effect → expected state; capped rounds, best state kept [Owner §13, §15 steps 6–7] | — (machine + reviewer agent) | Independent review | Remorsearch, Storybook Test (`vitest --project=storybook`, interaction + a11y), `hierarchy-check`, `visual-qa.py`, text-only lint, originality check, scene/motion QA | Agreed findings resolved or recorded as open |
| 12 | Final gate & release | 390/1440 renders, recording of the shipped page, evidence ledger (`decisions.md`), completion criteria checklist [Owner §15 step 8, §16] | Approve or specific feedback | Lead | share board | The completion criteria below are met or their gaps are named |

## Prescriptions, not menus

Owner direction (2026-11-24, Discord): "각 단계에 선택지를 제공하지 말고 이런이런식으로 하세요를 제공하도록 하자. 사용자가 모두 디자이너나 모든 걸 암묵지로 가지고 있는건 아닐테니" — do not offer choices at each stage; tell the user how it is done, because users are not all designers and do not carry the tacit knowledge.

- **The skill decides with a fixed method; the user approves or redirects.** Every stage follows the recipe below with its defaults. A gate shows what was made, the one-line reason tied to the brief, and a short plain-language "what to look at" list, then asks one open question (see "Open questions, concrete answers"). No numbered menus, no "pick 1–3", no axis-by-axis interview, no yes/no.
- **Divergence stays inside the skill.** The skill still explores (three directions, several references) because that is how studios reach a good answer, but it recommends one and shows the others only as "also explored" evidence. The user may point at one; they are never required to choose.
- **Vague feedback is the skill's job to translate.** "Feels cheap" or "too busy" is converted into element → user effect → expected state [Owner §15 step 7], shown back in one line, then applied.
- **This replaces the open decisions** in `workflow-merge-report.md`: the recommendations there become the skill's defaults (3 directions with one recommended; open brief questions + direction approval instead of the five-axis interview; A2UI for grey prototype, product screens and content sections; a declared visual role per section; first dry run on the owner's own site). The owner can override any default; the skill does not ask.

### Open questions, concrete answers

Owner direction (2026-11-25, #일반), on decision 2: "뭔가를 물을 때 단답으로 객관식이 아니라 주관식의 답을 유도하고 주관식의 답을 얻어야 해. 거기서 구체적인 걸 얻어내기" — when asking anything, draw out open, descriptive answers instead of short multiple-choice ones, and extract the specifics from them.

- **Never multiple choice, never yes/no.** Every question asks the user to describe: a situation, an example, who / when / what, what they would change, what they dislike and why. "Is this OK?" becomes "Imagine you are a first-time visitor: where on this screen did you hesitate or feel it was off, and why?"
- **One question at a time, in plain words**, only about things the skill cannot find with tools; never design vocabulary in the question.
- **Follow vague words down to something observable.** When an answer has an abstract word ("premium", "clean", "cheap", "busy", "feels off"), ask in order until it can be seen or measured: (1) "In what situation did you feel that?" (2) "Give one example — a site, a product, a place, a moment." (3) "If that showed on this screen, what would you see that is different from now?" Stop when the answer names an element and a visible quality.
- **Restate, then ask openly about the gap.** The skill writes what it extracted as a concrete requirement or revision goal (element → user effect → expected state [Owner §15 step 7]) and asks "This is how I read it — which part sounds different from what you meant?" It does not ask the user to confirm with yes/no.
- **Approval comes from the user's own words.** A gate is recorded as approved only when the answer says, in the user's words, to go ahead. An answer with no change request and no go-ahead gets one open follow-up ("Before we move on, is there a moment on this screen that still bothers you? Describe where."). Silence or a resume command leaves it open, as in v0.5.
- **Record the raw answer and the extraction** side by side in `decisions.md`, so the observable requirement can be traced to what the user actually said [Owner §4: observations and inferences labelled separately].
- **Design decisions are still prescriptions.** The open questions gather facts and reactions; the skill still makes the design call with its recipe and shows it for approval.

## Two depths

The skill picks the depth from the site type in the brief and states it; it does not ask [Owner §3: simple sites may combine stages].

- **Full (12 stages):** brand, portfolio, landing, scroll story, immersive 3D.
- **Short:** a small page or product screens on an existing system — 1 Frame → 2 Structure & copy → 4 Direction (one recommended direction applied to the existing system) → 6 System in Storybook → 9 Slice → 11 Review → 12 Final. Stages 3, 5, 7, 8 and 10 run only when the brief needs new references, assets, motion or more screens.
- Stage 12's operational items (real-user tests, CMS, deployment, rollback) are a checklist the skill reports on; the skill does not run them.
- Before any skill code changes, the merged workflow is run once by hand on the owner's site (decision 5 / order of work step 6 moves first), recording gate count, time, the text-only result and the owner's verdict.

## Stage recipes

What the skill does, what it shows, and the open question it asks. Defaults are fixed; the skill states them, not offers them. Every *Ask* is followed by the vague-word ladder and the restatement from "Open questions, concrete answers"; approval is read from the user's own words.

1. **Frame.** Read the existing site, assets and any analytics first and fill what tools can find. Then interview with open questions, one at a time, skipping any the material already answers:
   - "Who comes to this site? Describe one real person or a recent visitor — what were they doing just before they arrived?"
   - "After reading the site, what should that person do next, and what happens if they don't?"
   - "When someone describes this site to a friend afterwards, what do you want them to say? Use their words, not design words."
   - "Tell me about a site or product you like. What exactly did you notice the first time you used it?"
   - "Tell me about one you dislike. What bothered you, and at which moment?"
   - "What do you already have — text, photos, case studies, logos? Describe what is in it, not just that it exists."
   Run the ladder on every abstract word until each brand word becomes observable levels (type contrast, density, role of imagery, motion intensity). Write `brief.md` with the raw answers and the extraction side by side; choose the depth. *Show:* the one-page brief. *Ask:* "Reading this as if a stranger wrote it about your site — which line sounds unlike you, and how would you say it?"
2. **Structure & copy.** List only the pages the core tasks need. Write every line of copy from the user's material in their language; no placeholder text. Map the core task with its error and recovery paths. Build the grey prototype and walk the task yourself first. *Show:* the prototype link and "try: <core task>". *Ask:* "Walk through it as the person you described. Where did you stop, re-read or look for something, and what were you looking for?"
3. **References → principles.** Capture 12–20 real sites from galleries that match the brand words; select 3 yourself and write a deconstruction card for each (principles + "not carried"). *Show:* the 3 cards with screenshots. *Ask:* "Which of these feels furthest from your site, and what in it makes you feel that?"
4. **Directions.** Build 3 directions on stage 2's representative screen, varying type, density, composition and imagery (not colour alone); recommend one with reasons tied to the brief's observable levels. *Show:* the recommended direction large, the other two small as "also explored". *Ask:* "Imagine this is live and your visitor lands on it. What do they notice first, what do they feel, and where on the screen does that feeling differ from what you want?"
5. **Assets & spike.** Generate key visuals that follow the direction's imagery rules and log provenance. Medium rule: real-time 3D only where the visitor changes viewpoint or interacts; otherwise image or video [Owner §12]. Build the hardest moment in the browser and measure it. *Show:* key visuals, the spike recording, the numbers in plain words. *Ask:* "Which image feels most like your site and which least, and what in each makes the difference?"
6. **System (Storybook).** Derive semantic tokens and type from the direction; motion tokens use the 6-step duration scale and two registers; every reachable state has a story. *Show:* the Storybook link and 5 things to look at (headings, body text, buttons in all states, colours on images, mobile). *Ask:* "Look at the five things on your phone. Which one looks out of place next to the others, and what makes it stand out?"
7. **Motion.** State the role of motion; pick 1–2 signature sequences; record the animatic; write the behavioural spec in plain sentences with a reduced-motion version. *Show:* the video and the spec. *Ask:* "Watch it twice. At which second does it stop feeling right, what did you feel there, and what were you trying to look at?"
8. **Composition map.** Per section: one main message, one main action, the asset, the motion beat, the visual role, and how it changes on mobile. *Show:* the numbered map. *Ask:* "Tell the page's story in your own words from top to bottom. Where does the order feel different from how you would tell it?"
9. **Slice.** Build the core task with normal, loading, empty, failure and permission states. *Show:* the link and the five states to try. *Ask:* "Do the task and break it on purpose. What did the page say or do at each point, and what did you expect instead?"
10. **Build-out.** Build the remaining screens; no question unless a new component appears, then show it in Storybook and ask the stage 6 question about it.
11. **Independent review.** A reviewer agent runs the checks and the builder fixes; no question. Report what was fixed and what stays open.
12. **Final.** *Show:* renders at 390 and 1440, the page recording, and the completion criteria as a plain checklist (met / not met / not done, with the real-user row stated). *Ask:* "If this went live today, what is the one thing you would still want to change, and where would a visitor notice it?"

## Agent roles

The roles are a logical division, not one model per role; a small job runs them in sequence in one session [Owner §15].

| Role | Owns | In OMP |
| --- | --- | --- |
| Lead and integration | Scope, gates, `brief.md`, `DESIGN.md` and shared component APIs (single owner [Owner §15 step 4]), final quality, merging | The `/ud` session |
| UX and content | IA, flows, real copy, error paths, sample data | Subagent at stages 2 and 8 |
| UI and system | Directions, type, tokens, components, states | Subagent at stages 3, 4 and 6; proposals go through the Lead |
| Implementation | Slice and screens, routing, responsive behaviour | Subagents per screen in separate worktrees at stage 10 |
| Motion and 3D | Spike, assets, animatic, scene budget, fallbacks | Subagent at stages 5 and 7 |
| Independent review | Browser, accessibility, functional, visual, motion, performance review | Reviewer subagent that did not build the page; read-only |
| All building roles | Look up an existing component before creating one [Owner §15 step 4] | Storybook MCP `docs-list` / `docs-show` before writing UI; `test-run` after |

## Minimum artifacts in the project repo

Mapped from [Owner §16]. Intent and policies are written down; values live in code and are linked, not copied [Owner §14].

| Owner item | Artifact |
| --- | --- |
| Brief | `brief.md` |
| Design intent | `DESIGN.md` intent sections + deconstruction cards + direction decision |
| Flows and states | `structure.md` + state matrix in `DESIGN.md` |
| Tokens | `DESIGN.md` source → generated `tokens.css` / `tokens.ts` |
| Component examples | Storybook stories per state (the `/system` build) |
| Content and assets | real copy in the screens, `assets.json` (source, prompt/model, licence) |
| Motion specifications | motion tokens + behavioural spec + animatic |
| Review and decision records | `decisions.md`: gate decisions with reasons, review findings, evidence ledger, open risks |

## Completion criteria (final gate)

The ten criteria of [Owner §16], plus ours:

1. Users can complete the core tasks.
2. The normal path and realistic exception paths are implemented.
3. The layout holds with real, long and empty content.
4. Type, spacing, colour and component use are consistent.
5. Readable and operable on representative devices and at intermediate widths.
6. Keyboard, focus, labels and reduced motion reviewed.
7. Media, 3D and motion do not block the main actions or performance.
8. Preview vs deployment differences checked.
9. Content updates, error response and rollback exist.
10. AI evaluations and real-user evidence recorded separately; an empty real-user row is stated, not implied.
11. Every section has its declared visual role; text-only sections on expressive pages carry an owner exception.
12. The originality check shows no layout match to a picked reference.
13. The shipped motion matches the approved animatic and spec, with the reduced-motion version recorded.

## How the agent produces non-text visual work here

Checked on this machine on 2026-11-24:

| Medium | Tool | Status | QA |
| --- | --- | --- | --- |
| Generated imagery (stylescape tiles, key visuals, textures, photography stand-ins) | OMP `generate_image`, image role `openai-codex/gpt-image-2` | Works: generated a 1536×1024 stylescape (`../ultradesign-research/v04/dry-run/refs/wf/assets/agent-stylescape-test.webp`), served as `gpt-image-2-codex`, quality medium. Supports input images for edits/consistency. | Owner sees the image on the board; provenance logged; text in images checked for spelling. |
| 3D / WebGL scenes | `three` 0.187, `@react-three/fiber` 9.8, `@react-three/drei` 10.7, `ogl` 1.0 (npm, free) | `three` 0.187 rendered a physical-material ribbon scene in headless Chromium (WebGL2, SwiftShader). R3F/drei/ogl versions checked on npm only. | Playwright screenshot + video, WebGL errors, FPS sample, fallback image when WebGL is off. SwiftShader FPS is not a device FPS; the device floor needs a real GPU or phone. |
| Motion | `gsap` 3.15, `motion` 14.14, CSS/View Transitions | `gsap` 3.15 drove the sketch's timeline; `motion` checked on npm only. | Animatic recording (Playwright `recordVideo` → `ffmpeg` 8.0.1), frame strip, reduced-motion replay. |
| Vector animation | `lottie-web` 5.13, `@lottiefiles/dotlottie-web` 0.83 | Runtime installable; authoring Lottie JSON by hand is impractical beyond simple shapes. | Same recorder. |
| Rive | `@rive-app/canvas` 2.55 | Runtime only. `.riv` files need the Rive editor; an agent cannot author them. Use only with owner-supplied files. | Same recorder. |
| SVG / canvas / generative | inline SVG, Canvas 2D, shaders | Available. | Screenshot + recorder. |
| Video | `ffmpeg` 8.0.1 for encode/trim/poster; generated stills as source | Available; no video-generation model is configured. | Poster frame and first-view LCP. |

## Guard changes required

- Add `motionEntries` and `sceneEntries` to `ud-guard.config.json`: inside them, `.style` writes, `requestAnimationFrame`, `gsap`, `motion`, `three`, `@react-three/*` imports are allowed; colours still come from tokens (read through `getComputedStyle` or a generated JS token module).
- `design-tokens` emits `tokens.ts` with motion durations/easings and colour values for WebGL materials, so scene code cannot hardcode hex.
- Product code still composes system components only.

## Deletions

- `prompts/03-interview.md` five-axis order (replaced by the stage 1 fact questions and the stage 4 recommended-direction approval; palette-site sourcing moves into the direction recipe; "my pick is N, because…" becomes the default form of every gate).
- `prompts/05-catalog.md` step 2 "recreate that arrangement … keep the proportions" and the side-by-side match.
- `prompts/06-map.md` "reference crop whose layout each section takes".
- `prompts/09-motion.md` as an optional stage; `state.motion` and the "motion on request" filter in `adapters/omp/workflow.ts` (`stages`, `gateIds`, `stageGates` gain `structure`, `directions`, `assets`, `motion`, `slice`).
- `references/hierarchy.md` example field `reference.crop` (replaced by `asset` and `principles`).
- Interview axes in the OMP adapter (`interviewAxes`); type, palette, status and density become defaults inside the direction recipe, not questions.

## Order of work for the rewrite (after owner decisions)

0. Manual dry run of this workflow on the owner's site, following the stage recipes by hand; record gate count, time, the text-only result and the owner's verdict, and adjust this plan before step 1.
1. Adapter state machine and gate IDs (tests in `tests/` first), including the depth choice.
2. Stage prompts 01–12, the role briefs for subagents, and the `SKILL.md` table.
3. Templates: `structure.md`, `decisions.md` (with the evidence ledger); `DESIGN.md` gains state matrix, imagery, motion and scene sections; `design-tokens` motion + `tokens.ts` output; a Storybook 10 template (`react-vite`, `addon-vitest`, `addon-a11y`, `addon-mcp`, components manifest on) replacing the `system-page` starter.
4. Guard motion/scene entries.
5. New scripts: stylescape board, animatic recorder, text-only lint, originality check, scene QA.
6. Second dry run on the owner's site with the rewritten skill, gate by gate on the share; compare with step 0.
7. Update `docs/lessons.md`, `README.md`, `evals/v05` → `evals/v06` (adds text-only, originality and slice-state metrics).
