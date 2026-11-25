# Frontend Design and Web Development

Professional Workflows and an AI-Native Operating Model

Research current as of November 24, 2026 · UX / UI / Figma / Design Systems / Frontend / Motion / 3D / AI Agents

## Contents

- [01. Findings and How to Read This Report](#01-findings-and-how-to-read-this-report)
- [02. How UI, UX, Frontend, and Professional Roles Relate](#02-how-ui-ux-frontend-and-professional-roles-relate)
- [03. The Complete Workflow: What Each Stage Should Produce](#03-the-complete-workflow-what-each-stage-should-produce)
- [04. How to Research and Design UX as a Distinct Discipline](#04-how-to-research-and-design-ux-as-a-distinct-discipline)
- [05. How UI Designers Develop Screens](#05-how-ui-designers-develop-screens)
- [06. When and How Figma Is Used](#06-when-and-how-figma-is-used)
- [07. How design systems are built and used](#07-how-design-systems-are-built-and-used)
- [08. How frontend developers implement a design](#08-how-frontend-developers-implement-a-design)
- [09. How to distinguish static, responsive, visually elaborate, and 3D sites](#09-how-to-distinguish-static-responsive-visually-elaborate-and-3d-sites)
- [10. Responsive design is closer to a set of rules than three mockups](#10-responsive-design-is-closer-to-a-set-of-rules-than-three-mockups)
- [11. How motion and interaction are designed and implemented](#11-how-motion-and-interaction-are-designed-and-implemented)
- [12. The production pipeline for a 3D website](#12-the-production-pipeline-for-a-3d-website)
- [13. What Skilled Teams Check Before Launch](#13-what-skilled-teams-check-before-launch)
- [14. AI-Native: A Structure That Reduces Dependence on Figma](#14-ai-native-a-structure-that-reduces-dependence-on-figma)
- [15. An Agent-Centered Execution Workflow for Boss](#15-an-agent-centered-execution-workflow-for-boss)
- [16. Minimum Deliverables and Completion Criteria You Can Apply Immediately](#16-minimum-deliverables-and-completion-criteria-you-can-apply-immediately)
- [17. Further Reading and Verification Sources](#17-further-reading-and-verification-sources)

## 01. Findings and How to Read This Report

**The approach recommended for Boss is a production workflow centered on the repository and the actual browser, with a visual canvas used when needed.** Reducing reliance on Figma should still preserve user problem definition, information architecture, art direction, state design, and testing on real devices. AI can implement these decisions in code and assets and support repeated review.

The research combined three specialist investigations—UX; UI, Figma, and design systems; and frontend, motion, and 3D—with research into AI-native case studies. Priority was given to production accounts published directly by companies and creators, official tool documentation, and public service guidance. The stage tables, selection tables, and checklists below are proposed practices synthesized from multiple sources; they do not represent a single standard followed identically by every company. Company case studies are self-reports about particular projects, not industry-wide productivity statistics.

### Key Findings

- In professional practice, the sequence of decisions matters more than the number of screens. Teams establish user tasks and content structure, develop the visual direction and behavior, and check real conditions of use in the browser.
- Figma is useful for collaborative exploration, component and variable management, screen flows, and developer handoff. When fine-tuning a product that already works, experimenting directly in code can be more straightforward.
- A design system adds usage rules, states, accessibility, documentation, and responsibility for changes to a collection of colors and buttons. Installing shadcn/ui or Tailwind alone does not complete one.
- Visually elaborate websites involve motion planning, art asset production, technical experiments, and performance tradeoffs. Detailed screen mockups alone do not replace these activities.
- AI-native quality depends on the design rationale available to agents and the review loop used to inspect actual results. Even when generation and evaluation are separated, human judgment about direction and testing with real users remain necessary. [R01](https://www.gov.uk/service-manual/user-research/user-research-in-discovery), [R02](https://linear.app/now/behind-the-latest-design-refresh), [R03](https://blogs.cisco.com/cisco-devnet/design-to-code-ai-handoff-workflow), [R04](https://www.bill.com/engineering/how-we-made-our-design-system-bilingual)

### How Professional Practice Has Evolved

| Case | Published Approach | What It Demonstrates |
|---|---|---|
| GDS, 2014 | Designers built prototypes with HTML/CSS and Git and tested them with users | Designing in code existed before AI. [R05](https://designnotes.blog.gov.uk/2014/10/13/how-designers-prototype-at-gds/) |
| SOCAR, 2022 | Problem research, wireframes, prototypes, copy, development, QA, A/B testing, and follow-up usability testing | The team checked actual understanding and operational impact beyond screen approval. [R06](https://tech.socar.kr/product/2022/06/02/reservation-funnel-improvement-with-abtest) |
| Linear, 2024 | Explored many options in Figma, then narrowed them through implementation, internal use, and beta testing | Visual exploration was connected to validation in the actual product. [R07](https://linear.app/now/how-we-redesigned-the-linear-ui) |
| Ciel Rose, 2025 | Moved between Figma and After Effects to refine motion, then implemented it with WebGL | Design, timing, and technical implementation influence one another. [R08](https://tympanus.net/codrops/2025/04/07/case-study-ciel-rose/) |
| Linear, 2026 | Used an agent to build an in-product color adjustment tool, then transferred the finalized tokens to Figma | An existing product can be designed directly in its running environment. [R02](https://linear.app/now/behind-the-latest-design-refresh) |
| Cisco DevNet, 2026 | Designers edited a working HTML prototype and handed it over for implementation with a change log | The approach reduced the cost of redrawing screens and confusion over the authoritative version. [R03](https://blogs.cisco.com/cisco-devnet/design-to-code-ai-handoff-workflow) |
| BILL, 2026 | Exposed existing Storybook knowledge to agents through a CLI and MCP | People and AI were given access to the same component knowledge. [R04](https://www.bill.com/engineering/how-we-made-our-design-system-bilingual) |

## 02. How UI, UX, Frontend, and Professional Roles Relate

UX covers the entire experience of achieving a goal, including finding necessary information, understanding wording, recovering from errors, and obtaining support. UI is the structure, presentation, and interaction of the interface that users see and operate. Frontend development connects this design to actual content, states, inputs, and data in the browser. Reducing UI to decoration or UX to planning documents makes professional practice difficult to understand.

Even on the same “download materials” screen, the questions differ. UX asks whether users can find the right materials and understand the terms of purchase. UI determines the visual hierarchy of the title, preview, price, and primary action. Frontend development implements search, permissions, download preparation, network failures, and retries. These activities overlap and require collaboration. GOV.UK advises teams to research the people who provide and support a service, as well as its different channels, from the discovery stage, with the whole team involved. [R01](https://www.gov.uk/service-manual/user-research/user-research-in-discovery)

| Area of Responsibility | Main Decisions | Typical Outputs |
|---|---|---|
| Product management and planning | Problem to solve, scope, business goals, priorities | Brief, requirements, success metrics |
| UX and research | User context, information architecture, tasks, and validation | Research findings, information architecture (IA), user flows, usability testing records |
| Product and UI design | Screen structure, states, visual hierarchy, usability | Key screens, component and state specifications |
| Visual design and art direction | Brand impression, typography, imagery, visual character | Style direction, key visuals, asset guidelines |
| Motion and 3D design | Timing, space, scene transitions, models, materials, cameras | Storyboards, motion mockups, source assets |
| Frontend development and design engineering | Actual responsive behavior, interactions, data, performance | Working screens, components, technical experiments |
| QA, accessibility, and content | Quality across conditions of use and operational readiness | Review findings, copy, operating and publishing criteria |

This table distinguishes responsibilities. In a small team, one person may hold several responsibilities, and roles such as design engineer combine design and implementation. More important than job titles is who makes each decision and how it is validated.

## 03. The Complete Workflow: What Each Stage Should Produce

### The Basic Flow

Define the problem and constraints, then understand users and content. Explore visual directions while designing the structure and key paths, and prototype the riskiest parts first. Implement the selected direction as components and working screens, review it with users and in the browser, and release it. Results from the release feed back into the next problem definition. Both GOV.UK’s prototyping guidance and GitLab’s account of improving its navigation illustrate this iterative process. [R09](https://www.gov.uk/service-manual/design/making-prototypes), [R10](https://about.gitlab.com/blog/navigation-research-blog-post/)

| Stage | Actual Work | Minimum Outputs | Criteria for Moving Forward |
|---|---|---|---|
| 1. Define the assignment | Establish target users, goals, scope, devices, and constraints | One-page brief, core tasks | Can explain whose problem is being solved and what it is |
| 2. Discover | Review existing customer support information, analytics, research, interviews, and observations | Evidence and assumptions log | Important assumptions are distinguished from established facts |
| 3. Structure | Organize content, menus, and functionality; map key flows | Sitemap, IA, user flows, actual copy | Paths to the goal are connected to the information users need |
| 4. Explore directions | Analyze references, compare styles, develop key screens | Visual direction and representative screens | Can explain distinctiveness, readability, and suitability for the purpose |
| 5. Validate risks | Experiment with complex inputs, transitions, 3D, and responsive behavior | Small working prototype | The core experience is feasible in the target environment |
| 6. Design in detail | Define tokens, components, states, motion, and content rules | State specifications and implementation criteria | Can describe both normal and exception paths |
| 7. Implement and integrate | Connect actual data, APIs, CMS, and paths | Browser build ready for review | Actual content and behavior are connected |
| 8. Review and release | Review visual, functional, accessibility, performance, and operational quality | Fix list, release and recovery plans | Major barriers to completing tasks have been resolved |
| 9. Improve in operation | Examine actual usage, errors, customer feedback, and metrics | Findings log and next experiment | Lessons inform the next change |

A simple informational website can combine several stages and move quickly. Products with permissions, payments, or editing features need more detailed specifications for states and exception paths. It is better to investigate the feasibility and cost of 3D early than to defer it to a decorative phase late in the project. Nor is it necessary to complete every screen to the same level of detail in advance.

## 04. How to Research and Design UX as a Distinct Discipline

### What You Need to Learn

Establish not only who users are, but when they visit, which devices they use, and what they want to accomplish. Examine their current alternatives and workarounds, terminology they do not understand, and the cost of failure. For an existing service, read analytics, support inquiries, and previous research before recruiting a new round of interview participants. Then decide which questions require further research. [R01](https://www.gov.uk/service-manual/user-research/user-research-in-discovery)

| What You Want to Learn | Suitable Methods | Evidence Obtained |
|---|---|---|
| Actual needs, context, and current alternatives | Interviews, field observation, observation of work | Recent real experiences and behavior |
| Whether menu categories and labels make sense | Card sorting, tree testing | How people group and find things |
| Whether people understand screens and complete tasks | Task-based usability testing | Points of difficulty, misunderstandings, recovery behavior |
| Where users drop off and how often it happens | Funnel, event, and error analysis | Location and scale of behavior |
| Whether a change affects outcomes | Appropriately designed experiments and A/B testing | Differences in outcomes between conditions |
| Whether people continue using the service over time | Repeated observation, return-visit and support records | Habits, accumulated friction, operational problems |

This is a selection guide. A small service does not need to use every method simultaneously. Distinguish stated intent to use a product in interviews from actual task performance, and recognize that A/B testing requires enough data and clear success criteria. The “five users” guideline for small qualitative studies should not be treated as the required sample size for every user group or quantitative experiment. [R11](https://www.gov.uk/service-manual/user-research/using-moderated-usability-testing), [R12](https://www.nngroup.com/articles/5-test-users-qual-quant/)

### The Differences Between IA, User Flows, and Wireframes

**Information architecture (IA)** determines what to organize, what to call it, and how it relates to other things. A **user flow** connects actions and system responses toward a particular goal. A **wireframe** establishes what information to present at each step and in what order. A **prototype** makes it possible to test whether these decisions work in actual use.

For example, in an educational materials service, deciding which filter users should select first—high school, grade, exam, or subject—is a question of IA and navigation. How users revise their criteria when there are no search results is a question of flow. How prominently a results card presents the source, coverage, and preview is a UI and content question. Guidance and recovery when payment succeeds but a file is not ready also involve how the service operates.

### What Real Cases Reveal About the Role of Research

When testing proposed navigation solutions proved insufficient, GitLab returned to earlier research and diary studies. The team explored the context in which users navigated through bookmarks or external links, then examined several concepts and menu groupings. This case shows a team looking beyond the clicks visible within its own screens to understand the problem. [R10](https://about.gitlab.com/blog/navigation-research-blog-post/)

SOCAR’s reservation improvements involved UX writing, development, and QA after wireframing, followed by further testing after the team reviewed experimental results and operational impact. Usability was not completed through one designer’s screen work alone. [R06](https://tech.socar.kr/product/2022/06/02/reservation-funnel-improvement-with-abtest)

### UX Work That AI Can Support

AI can help draft discussion guides, organize records, categorize observations, formulate hypotheses and alternatives, perform heuristic reviews, and generate test scenarios. Observed facts and model inferences should be labeled separately, with a way to trace findings back to the original research. Toss’s Hyuri bot distinguishes rapid AI review from validation with users. [R13](https://toss.tech/article/research-platform-ai)

An AI persona saying that a screen is “good,” or an agent successfully completing a task, does not establish that real users will understand or prefer it. Preserve a stage for engaging with real users. A starting point, even on a small scale, is to give target users tasks that do not hint at the answer and observe their behavior. [R11](https://www.gov.uk/service-manual/user-research/using-moderated-usability-testing), [R13](https://toss.tech/article/research-platform-ai)

## 05. How UI Designers Develop Screens

### Reference Research Needs Specific Criteria

Go beyond collecting reference screens and record the principles you intend to adopt. Examine the contrast between heading and body sizes, information density, page rhythm, the role of imagery, button emphasis, changes on mobile, and the speed and purpose of motion. The process is about selecting principles suited to the goal rather than reproducing an entire site’s appearance.

During style exploration, a single board can compare font combinations, spacing density, the roles of colors, photography and illustration approaches, and representative components. Apply these choices to key screens containing actual content. Decorating every screen first increases revision costs when the structure or content changes. Linear’s 2024 case involved extensive visual exploration while also managing the product’s practical scope and implementation risks. [R07](https://linear.app/now/how-we-redesigned-the-linear-ui)

### Expand From Representative Screens Into a System

The recommended sequence is to refine representative parts of a key screen, extract recurring typography, spacing, and component rules, and then extend them to the remaining screens. Choose screens that express the nature of the product: the hero and case study sections for a brand website, or list, detail, and editing flows for a SaaS product.

UI review should consider alignment, hierarchy, reading order, information density, consistency, and visual character together. The presence or absence of particular patterns—cards, large corner radii, or gradients—does not determine quality by itself. The criterion is whether each choice fits the content and purpose.

### Designing States Turns Screens Into a Product

| Element or Function | Representative States and Conditions |
|---|---|
| Buttons and links | Default, hover, focus-visible, pressed, disabled, processing |
| Inputs | Empty, editing, help text, validation error, success, read-only |
| Lists and search | Loading, no results, one result, many results, filters applied, partial failure |
| Data cards | Long title, missing image, slow-loading data, stale values |
| Saving and uploading | In progress, cancellation, duplicate request, failure, retry, partial success |
| Permissions and sessions | Signed out, insufficient permissions, expired session, access request |
| Modals and menus | Open and closed, Escape behavior, outside-click policy, focus entry and return |

This table does not require every screen to implement every state. It is a review tool for avoiding omissions among the conditions that can arise during the relevant task. Adopting reusable components also does not automatically make an entire page accessible. Contextual meaning, labels, reading order, and keyboard behavior must be checked separately. [R14](https://design-system.service.gov.uk/accessibility/accessibility-strategy/)

## 06. When and How Figma Is Used

### Practical Uses at Each Stage

| Stage | Main Work | Features Used | Decisions to Record |
|---|---|---|---|
| Discovery and alignment | Organize research, problems, and journeys | FigJam, notes, and flowcharts | Users, problems, hypotheses |
| Structural exploration | Wireframe and connect screens | Frames, simple shapes, flow connections | Information order and key paths |
| Visual direction | Compare typography, colors, imagery, and density | Style boards, multiple key-screen options | Visual principles and reasons for selection |
| System setup | Organize repeated values and structures | Variables, Modes, Components | Token and component rules |
| Screen development | Arrange actual content and different states | Auto Layout, Variants, Properties | Intended behavior as content and size change |
| Interaction | Review navigation and state changes | Prototypes, conditions, variables, Motion | Triggers, outcomes, timing |
| Developer handoff | Explain properties, assets, and behavior | Dev Mode, annotations, Code Connect | Implementation criteria and related code |
| Implementation review | Compare designs with the browser | Comments, side-by-side review with previews | Required fixes and final decisions |

### Auto Layout

Instead of placing each element at fixed coordinates, define direction, spacing, padding, alignment, and sizing behavior. This allows the layout to respond when content gets longer or more child elements are added. It is particularly useful for buttons, cards, menus, and page sections. Current official documentation covers grid flows as well as horizontal and vertical flows. [R15](https://help.figma.com/hc/en-us/articles/360040451373-Guide-to-auto-layout-in-Figma)

However, two screens looking correct in Figma does not mean every browser width has been validated. Check actual font rendering, line wrapping, content growth, touch, keyboard input, and browser features in code. Figma’s MCP guidance also recommends actually resizing frames before generation and using meaningful layer names and annotations. [R16](https://developers.figma.com/docs/figma-mcp-server/structure-figma-file/)

### Components, Variants, and Properties

Turn repeated buttons into components and handle semantically related variations through variants or properties. Specifying size, emphasis, state, and the presence of text or icons helps reduce inconsistent buttons across screens. Names and APIs should carry the same meaning in code. Do not force elements with different purposes into a single component merely because they look similar.

### Variables and Modes

Variables make recurring decisions, such as colors and spacing, reusable. Modes provide values for different contexts, such as light and dark themes, under the same variable names. Variables and prototype states can make a demonstration more realistic, but they should be distinguished from a product runtime with functioning authentication, live data, and network failure handling. [R17](https://help.figma.com/hc/en-us/articles/15343816063383-Modes-for-variables)

### Dev Mode, Code Connect, and MCP

Dev Mode supports property inspection, asset downloads, generated code viewing, change comparison, and developer handoff. Code Connect links Figma components to actual code imports, props, and usage examples. MCP delivers this structured information to agents. The official documentation also explains that MCP does not produce finished code in a single step; the agent writes the final code to fit the project. [R18](https://help.figma.com/hc/en-us/articles/15023124644247-Guide-to-Dev-Mode-in-Figma), [R19](https://developers.figma.com/docs/figma-mcp-server/code-connect-integration/), [R20](https://developers.figma.com/docs/figma-mcp-server/mcp-vs-agent/)

### The Product Range as of 2026

Describing Figma solely in terms of ordinary Figma Design prototypes gives an incomplete picture. Figma Motion, in open beta as of the research date, supports timelines, keyframes, motion variables, and developer handoff. Figma Sites is a product for publishing actual responsive websites. MCP also includes Code to canvas, which brings a running UI into editable design layers. However, capturing layers does not automatically restore all the meaning and connections of the original code components. [R21](https://www.figma.com/blog/introducing-figma-motion/), [R22](https://help.figma.com/hc/en-us/articles/31230436657815-Explore-Figma-Sites), [R23](https://developers.figma.com/docs/figma-mcp-server/code-to-canvas/)

If source ownership and independent deployment matter, compare the limitations of Sites as well. The official FAQ available on the research date states that exporting site code for external publishing is not supported. Features, beta status, and plan conditions should be checked again when adopting the tool. [R24](https://help.figma.com/hc/en-us/articles/31242845959703-Publish-update-or-unpublish-a-site)

## 07. How design systems are built and used

### Distinguish three layers

A **UI kit** is a collection of reusable pieces of an interface. A **component library** provides reusable implementations that work in the actual product. A **design system** adds principles, usage guidance, content, accessibility, states, and operating rules to these building blocks.

People designing screens select existing components and patterns. Developers use the corresponding code and tokens. When a new requirement emerges, the team decides whether to extend an existing API, create a new element within the product, or contribute it to the shared system. GitHub Primer describes a contribution path that begins with components used by actual product teams and considers Storybook examples, documentation, accessibility, and maintenance costs. [R25](https://primer.style/product/contribute/adding-new-components/)

| Layer | Examples | Purpose |
|---|---|---|
| Base values | blue-600, space-4, radius-2 | Reuse raw values |
| Semantic tokens | text-primary, surface-default, action-primary | Express an element’s role in the interface |
| Component tokens, where needed | button-primary-bg, dialog-radius | Provide adjustment points for specific components |
| Components | Button, Dialog, SearchField | Reuse structure and behavior |
| Patterns and templates | Search and filtering, saving settings, error recovery | Define how multiple components work together |
| Governance | Documentation, owners, reviews, release and deprecation policies | Maintain consistency over time |

Using color tokens according to their roles makes it easier to preserve meaning when changing themes. Primer also distinguishes base, functional, and component-level color tokens. A small site does not need hundreds of tokens from the outset; expand the system as recurring needs and changes warrant it. [R26](https://primer.style/product/getting-started/foundations/color-usage/)

### What Storybook does

Storybook is a workbench for viewing actual components with different props, states, and data, isolated from the complexity of the surrounding interface. Stories can go beyond a single default button to reproduce long text, errors, loading, dark mode, and other states. Interaction, visual, and accessibility checks can be connected here. For a small, single-page site, a simple component test page may be sufficient. [R27](https://storybook.js.org/docs/get-started/why-storybook)

### Where shadcn/ui and Tailwind fit

shadcn/ui provides editable component code and a structure for distribution and composition. Tailwind provides a foundation for expressing styling rules through utilities and theme variables. These are reasonable starting points for a project, but the brand’s typography, imagery, information density, states, content, and usage policies still require separate decisions. Using shadcn’s default appearance and building a design system for your own product involve different scopes of work. [R28](https://ui.shadcn.com/docs), [R29](https://tailwindcss.com/docs/theme)

### What to keep aligned and how to govern it

When changing tokens, components, or documentation, identify the source of truth, reviewer, affected screens, and migration path from the previous usage. Changes need to be tracked because the same person will not always update Figma and the code at the same time. If a design system is managed only as a rigid set of rules, product teams may work around it by copying and detaching components. A member of the Toss TDS team likewise explains that the system should be treated as an internal product and should address requests for extensions. The article explicitly states that Toss uses its own tool, Deus, so it should not be presented as a case study of Figma operations. [R30](https://toss.tech/article/rethinking-design-system)

Open formats such as DTCG 2025.10 can help exchange tokens between tools. This is a stable Community Group specification, not a formal W3C standard. Matching the JSON format alone does not automatically align component semantics or integrations across all tools. [R31](https://www.designtokens.org/tr/2025.10/format/)

## 08. How frontend developers implement a design

Implementation involves more than transferring coordinates from a mockup. Developers define the boundaries of page layouts and components, connect data and asynchronous states, and make the result usable across browsers and input environments. The following is a recommended sequence for dividing implementation into reviewable pieces.

1. Understand the existing repository’s structure, tokens, components, routing, and API contracts.
2. Build shared structures such as global typography, containers, spacing, and navigation.
3. Implement key components using realistic data shapes and representative states.
4. Connect the most important user task from beginning to end across screens.
5. Check errors, permissions, empty values, back navigation, refreshes, and direct links.
6. Refine responsive behavior and keyboard, touch, and focus interactions in actual browsers.
7. Integrate motion, media, and 3D with the application’s state and loading structure.
8. Review visuals and behavior with the designer and meet the operational criteria.

A development handoff needs more than screens: component mappings, actual copy, assets, state transitions, responsive rules, focus and keyboard policies, motion and mobile alternatives, and acceptance criteria. In the Cisco case study, HTML prototypes were delivered alongside the design system, user-specific flows, and a changelog so developers could apply incremental changes. [R03](https://blogs.cisco.com/cisco-devnet/design-to-code-ai-handoff-workflow)

### CMS and content models are also part of frontend design

For a site that changes regularly, design who can edit which content and how. For example, managing a case study page’s title, client, hero image, summary, body, tags, and publication date as fields allows both the listing and detail pages to be generated from the same data. Decide whether content blocks should be freely composable or whether constrained templates should maintain quality.

This is an operational recommendation synthesized from the research. First determine whether a CMS is needed, based on the frequency of changes and the capabilities of the people responsible for them. A small site edited only by developers does not need a complex CMS introduced upfront.

## 09. How to distinguish static, responsive, visually elaborate, and 3D sites

“Static” can refer to different things: an appearance without movement, HTML generated at build time, or content that is not personalized. Responsive design describes adaptation to screen, input, and device conditions. 3D is a technology for presentation and interaction. These dimensions can be combined. For example, a statically generated HTML page can contain a dynamic carousel or a 3D scene. Astro’s islands architecture also describes adding only the necessary interactivity to lightweight HTML. [R32](https://docs.astro.build/en/concepts/islands/)

| Type of site | Design focus | Implementation focus | Role of motion and 3D |
|---|---|---|---|
| Information, blogs, and documentation | Finding, reading, and content hierarchy | Semantic HTML, templates, and a CMS | Support reading and navigation |
| Brand and landing pages | Messaging, visual direction, and calls to action | Editorial layouts, media, and forms | Key scenes that create an impression or explain something |
| SaaS and dashboards | Tasks, data, states, and permissions | Forms, tables, asynchronous data, and error recovery | Communicate state changes and spatial continuity |
| Commerce | Discovery, comparison, purchasing, and recovery | Product, inventory, pricing, and payment states | Help people understand and choose products |
| Scroll storytelling | Scenes, reading order, and pace | Management of scrolling, media, and routing | A defining part of the page experience |
| Immersive 3D | The world, camera, input, and exploration | Assets, renderer, performance, and alternative paths | The core of the experience |

Choose rendering approaches such as SSR, SSG, and CSR according to content updates, personalization, performance, and the development architecture. Visual elaborateness alone should not determine the choice. A single project can combine approaches across pages and features.

### Three ways to build an actual site

In a custom-code workflow, choose a framework, CMS, and deployment environment that fit the project’s existing foundation and requirements. There is no reason that a React-based product interface and a content-focused page must use the same implementation approach. Define the required data, content, states, and operational ownership before choosing tools.

Visual builders offer another path. In Framer or Webflow, teams can refine layouts, components, responsive behavior, interactions, and CMS content, then publish the result. In this workflow, Figma may remain a tool for exploring the initial direction, or the builder’s canvas may handle design and implementation together. Current products also offer AI features, so a binary distinction between “traditional tools are manual” and “agent tools are AI” is inappropriate. [R53](https://www.framer.com/)

A CMS theme-based workflow organizes templates, blocks, and styles around the content management system. WordPress distinguishes block themes from classic themes. Building every screen from scratch as a separate React page is not the only way to create a website. Every path still requires requirements, actual content, and verification. Check each tool’s capabilities for external deployment, code modification, and data portability. [R54](https://developer.wordpress.org/themes/)

## 10. Responsive design is closer to a set of rules than three mockups

Desktop, tablet, and mobile mockups are important samples, but widths between them also exist. Rules must define when the layout changes its number of columns, navigation collapses, and card content wraps. MDN explains responsive design in terms of flexible grids, images, media queries, and content. [R33](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Responsive_Design)

Recommended checks include not only narrow and wide viewports but also long titles, enlarged text, missing images, the layout before and after fonts load, touch input and the absence of hover, virtual keyboards, landscape orientation, and browser zoom. For example, deciding whether a mobile table should simply shrink, retain only key columns, or use horizontal scrolling and pinned columns is a question of data and user tasks.

The mobile experience does not need to reproduce every desktop effect. The creator of Design Embraced used WebGL on desktop while building the mobile experience with CSS/JS and simpler transitions. What matters is deliberately deciding which information and tasks to preserve and which visual treatments to reduce. [R34](https://tympanus.net/codrops/2024/03/21/case-study-design-embraced-portfolio-2024/)

## 11. How motion and interaction are designed and implemented

### Define the role of motion first

Motion can communicate state changes, explain relationships between elements, tell a product’s story, or establish a brand’s character. The same movement can have different value depending on whether it slows repetitive work or directs attention where it is needed. Early decisions should cover not only movement paths and timing but also cancellation, repeated input, and alternative presentations.

### Production sequence and deliverables

1. Motion brief: Define which movements will serve which purposes.
2. States and triggers: Specify responses to hover, focus, clicks, scrolling, loading, and dragging.
3. Storyboard: Show the composition and content sequence at the beginning, middle, and end.
4. Timing study: Test the rhythm in Figma Motion, After Effects, Rive, or a browser.
5. Technical experiment: Get the hardest transition working in the target browser first.
6. Specification and integration: Connect duration, easing or spring behavior, sequence, interruption, mobile behavior, and reduced motion to the implementation.
7. Real-world checks: Test fast scrolling, repeated clicks, back navigation, resizing, touch, and keyboard input.

This sequence is a recommendation synthesized from case studies and tool documentation. The creator of Ciel Rose explored the direction in Figma, refined the motion in After Effects, and returned to Figma when new ideas emerged. A video mockup is useful for agreeing on how an experience unfolds over time, but it does not implement actual input, routing, or asynchronous states. [R08](https://tympanus.net/codrops/2025/04/07/case-study-ciel-rose/)

### What to implement it with

| Tool or technology | Suitable work | What else to check |
|---|---|---|
| CSS transitions and keyframes | Basic hover and focus effects, small entrances and transitions | States, interruption, and the cost of the properties being animated |
| Web Animations API | Control of playback and timing through a native browser API | Lifecycle, input and focus, and browser support |
| Motion for React | State and layout changes, gestures in React interfaces | Connection to actual state and reduced motion |
| GSAP and ScrollTrigger | Timelines across multiple elements and synchronization with scrolling | Resizing, control over scrolling, cleanup, and restoration |
| Figma Motion | Timeline design, reusable motion, and developer handoff | Integration into the app and checks in actual browsers |
| After Effects and Lottie | Motion graphics mockups and assets for playback on the web | Supported effects, file size, and runtime size |
| Rive | Graphics and state machines that respond to input and data | Semantic structure of the web UI and runtime integration |
| Three.js and R3F | Real-time 3D centered on scenes, cameras, and shaders | Assets, GPU load, input, and alternative experiences |

The table offers selection guidance based on each tool’s officially documented capabilities. Motion for React and Figma Motion are separate products. Lottie provides a path for playing After Effects assets on the web, while Rive handles interaction and data connections through its editor and runtime. A setup is generally easier to maintain when multiple animation engines are not controlling the same element simultaneously. [R21](https://www.figma.com/blog/introducing-figma-motion/), [R35](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API), [R36](https://motion.dev/docs/react-accessibility), [R37](https://gsap.com/docs/v3/Plugins/ScrollTrigger/), [R38](https://github.com/airbnb/lottie-web), [R39](https://rive.app/docs/getting-started/introduction)

### Example specification: a search panel

Instead of “make it open smoothly,” define the following behavior. The panel opens through a button or keyboard shortcut. When it opens, focus moves to the search input. Escape closes it and returns focus to the invoking button. Input received during a transition reverses its direction naturally from the current state. On mobile, the panel fills the screen. Under reduced-motion settings, large movements are removed. Search results and errors update without waiting for the motion to finish.

A behavioral specification at this level tells agents and developers what to build and reviewers what to check.

## 12. The production pipeline for a 3D website

### Is real-time 3D necessary?

There is a clear reason to use real-time 3D when users need to change viewpoints or interact with product options and scene states. If the goal is only to show a predetermined scene, a rendered image or video may suffice. An appearance that “looks 3D” does not establish that it is rendered in real time. This distinction provides a basis for comparing production and operating costs.

### Recommended pipeline

| Stage | Work | Deliverables and checks |
|---|---|---|
| Concept | Story, visual direction, camera, and input approach | Style frames and scene composition |
| Blockout | Test space and movement using simple shapes | A low-cost, controllable scene |
| Asset creation | Models, UVs, materials, textures, rigging, and animation | Editable source assets |
| Look development | Refine the intended lighting, color, reflections, and post-processing | Compare the target image with the browser result |
| Handoff | Prepare runtime assets such as glTF/GLB from Blender | Check size, axes, pivots, clips, and textures |
| Web integration | Use Three.js directly or compose with R3F; connect loading, input, and UI | A scene integrated into the actual page |
| Optimization | Reuse, instancing, compression, LOD, and resolution adjustment | Measure transfer size and rendering costs separately |
| Alternative experiences | Accommodate low-performance devices, errors, and reduced-motion settings | Lightweight scenes, 2D, or static versions |

With Spline, scenes and interactions are created in a visual editor and delivered through that tool’s own workflows. Do not assume that the Blender-to-glTF pipeline and every editor’s export process work the same way. Three.js is a library for 3D rendering, and R3F helps compose it with React. Neither automatically supplies finished art assets or camera direction. [R42](https://r3f.docs.pmnd.rs/getting-started/introduction), [R52](https://docs.spline.design/exporting-your-scene/web/exporting-as-code)

### Cases that balanced quality and performance

Crosswire transferred placement information from Blender and used instancing for repeated models. When real-time lighting did not consistently produce the desired reflections, the team combined several matcaps to achieve the intended appearance. The case illustrates finding an expression that could be sustained in the browser rather than insisting on reproducing an offline render exactly. [R40](https://tympanus.net/codrops/2023/04/04/case-study-crosswire/)

Stripe’s account of building its globe in 2020 explains that the team could properly assess the result only after a working initial prototype had been created. Getting the key scene into a working state early makes it easier to distinguish unfinished work from technical impossibility. [R41](https://stripe.com/blog/globe)

### Distinguish the costs involved in optimization

A small compressed download can still have a high rendering cost or consume substantial texture memory after decoding. Examine model and material reuse, draw calls, shadows and post-processing, canvas pixel count, and unnecessary frame execution separately. R3F documents performance strategies such as on-demand rendering and resource reuse, while Three.js GLTFLoader supports paths involving Draco, meshopt, and KTX2. [R42](https://r3f.docs.pmnd.rs/getting-started/introduction), [R43](https://threejs.org/docs/pages/GLTFLoader.html)

It is beneficial to provide key headings, links, forms, and action paths through semantic HTML. Pixels drawn on a canvas do not automatically acquire the same semantic structure as HTML elements. If manipulating the 3D scene is essential, separately design alternative paths for people using keyboards and assistive technologies. [R44](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/canvas)

## 13. What Skilled Teams Check Before Launch

### Separate the Types of Review

| Review | Question | Typical evidence |
|---|---|---|
| Visual QA | Do hierarchy, alignment, typography, and assets match the intent? | Comparisons of actual screens and records of revisions |
| Functional QA | Do the main tasks and error recovery work? | Browser scenarios and tests |
| Responsive QA | Does the interface remain usable as size, content, and input conditions change? | Results across viewport widths and real devices |
| Accessibility QA | Can people understand and operate it with a keyboard and assistive technology? | Automated checks, manual review, and verification with users |
| Motion QA | Are timing, interruption, repetition, and alternative presentations appropriate? | Reviews of actual interactions and video recordings |
| Performance QA | Does the necessary experience remain available under slow conditions? | Lab measurements and observations of real users |
| Operational QA | Can the team manage content, errors, inquiries, and deployment? | Checks of administrative tasks, monitoring, and recovery |

Playwright's visual comparisons are regression checks that identify differences from approved baseline images. They do not judge whether the baseline itself is good design. Results can change with the environment, fonts, and browser, so the conditions need to be reproducible. Automatically overwriting the baseline images on every run defeats the purpose of regression testing. [R45](https://playwright.dev/docs/test-snapshots)

Using accessibility tools and well-designed components does not guarantee the accessibility of the entire service. Check keyboard operation, reading order, focus, labels, and the actual user experience together. The GOV.UK Design System also explicitly states that additional research, design, development, and testing are necessary. [R14](https://design-system.service.gov.uk/accessibility/accessibility-strategy/)

### Performance Criteria

The current Core Web Vitals thresholds for a good experience are LCP of 2.5 seconds or less, INP of 200 ms or less, and CLS of 0.1 or less. They are assessed at the 75th percentile of measurements from actual page visits, with mobile and desktop evaluated separately. Before launch, measure in the lab and on target devices; after launch, verify performance using a sufficient amount of accumulated real-user data. Do not treat a single Lighthouse result as the performance experienced by all actual users. For 3D, also observe frame delays, memory, heat, and extended use. [R46](https://web.dev/articles/vitals)

### Practical Details That Are Easy to Miss

- Test with actual Korean and mixed-language content, long titles, numbers, filenames, and different translation lengths.
- Define who writes, reviews, and publishes content, as well as the process for replacing media.
- Review the titles, descriptions, URLs, and indexability of pages that need to appear in search results.
- Organize usage rights and editable source files for fonts, images, video, icons, and 3D assets.
- Define events for the start, success, and failure of key tasks, and check for incorrect duplicate records.
- Document the data collected and behavior under each consent state. Review jurisdiction-specific legal obligations separately.
- Also check service flows that continue beyond the screen, such as expired authentication, permission changes, failed downloads, inquiries, and refunds.
- Prepare for post-deployment errors, user support, content updates, and ways to roll changes back.

This is an operational checklist for issues that screen-focused work can overlook. Every item does not need to be handled with the same tool or the same amount of documentation.

## 14. AI-Native: A Structure That Reduces Dependence on Figma

### Decide What Serves as the Source of Truth

The structure proposed for Boss connects design intent and the actual UI through specifications, tokens, components, and review examples in the repository. Use the running result in the browser as the reference for implementation quality, and use a canvas when it helps with exploring directions, reviews by non-developers, or editing particular assets. Moving to a different canvas tool does not automatically reduce dependence on tools.

| Role of the traditional canvas | Repository- and browser-centered counterpart |
|---|---|
| Research and planning board | Briefs and decision records that distinguish evidence from assumptions |
| Style guide | Descriptions of design intent and visual references |
| Variables and themes | CSS or JSON tokens and generation rules |
| Component library | Actual code, usage examples, and stories for different states |
| Click-through prototype | A browser preview with working core paths |
| Motion annotations | Specifications for triggers, transitions, cancellation, and alternative presentations |
| Design comments | Review issues with a clearly identified element, screen, and expected result |
| Versioning and handoff | Git changes, previews, changelogs, and review results |

It is important to avoid manually duplicating the actual values and APIs of tokens and components across multiple documents. Document intent, policies, and reference locations, and link readers to the code for actual values and usage examples. BILL structured the knowledge in its existing Storybook and made it available through a CLI and MCP, while pointing out the risk that a separate set of AI-specific documents would become outdated. [R04](https://www.bill.com/engineering/how-we-made-our-design-system-bilingual)

### What the Actual Cases Support

For its 2026 visual refresh, Linear used Claude Code to build a token-adjustment tool inside the product. Selected values were passed to Figma as JSON, and feature flags were used to compare the before and after states. This case shows that experimenting in product code can be a useful approach for professional teams. It is not evidence that the company abandoned Figma for all design work. [R02](https://linear.app/now/behind-the-latest-design-refresh)

Cisco DevNet encountered problems with interactions and the source of truth when bringing already functional HTML back into Figma, so it iterated primarily in HTML. The designer's judgment and the development team's final integration were retained in this case, and a handoff stage still existed between the prototype and the production project. [R03](https://blogs.cisco.com/cisco-devnet/design-to-code-ai-handoff-workflow)

### Five Paths for Choosing Tools

| Path | Conditions that suit it | Costs and limitations to compare |
|---|---|---|
| Repository and browser at the center | You have access to the code and operate the product yourself | You need to establish a good environment for visual comparison and review |
| Minimal Figma + MCP | Existing collaboration with designers and component libraries | Keeping Code Connect, tokens, and documentation up to date |
| pen.dev / Pencil | You want to work with a canvas and a code project together | Request-driven reconstruction and review of changes |
| Penpot + MCP | You want an open design tool with agent integration | Operating conditions such as the actual connection and active document |
| Generation and preview tools such as v0 | You need fast implementation connected to the team's actual system | Providing real source code, APIs, and states, and reviewing the results |

The official pen.dev documentation explains that design and code change in response to agent requests; this does not establish continuous, automatic, bidirectional synchronization. Importing a page as design layers also does not preserve its JavaScript behavior. Penpot provides an official MCP integration. v0's Design Systems 2.0 guides users to apply a system by referencing actual packages, repositories, documentation, and frames. These capabilities should be distinguished from an automatic guarantee of visual quality, behavior, or operational quality. [R47](https://docs.pencil.dev/design-and-code/design-to-code), [R48](https://help.penpot.app/mcp/), [R49](https://v0.app/docs/design-systems-2)

### Can You Start Without MCP?

Yes. Local code and tokens, representative usage examples, and tools for running the browser and capturing screenshots are enough to establish a basic loop. Add a registry and MCP when the project grows and the cost of finding and installing the necessary components increases. The official shadcn MCP supports browsing, searching, and installing components from public and private registries. [R50](https://ui.shadcn.com/docs/mcp)

## 15. An Agent-Centered Execution Workflow for Boss

The following is a recommended operating approach developed from the research findings. The roles represent a logical division of work; they do not mean that a separate model must always run for every role. For small tasks, one agent can perform the stages sequentially. Parallelize the parts where doing so offers an advantage, such as independent review or exploration of alternatives.

### Step 1: Bring the Goals and Evidence Together

Record the target users, core tasks, required content, brand direction, constraints, and success criteria in the brief. Explain the principle to take from each reference. Replace vague requests such as “make it premium” with observable requirements, such as typographic contrast, information density, the role of imagery, and the intensity of motion. Label statements without user evidence as hypotheses.

### Step 2: Test the Structure and Copy First

The agent in the UX role proposes the main flows, information priorities, and error paths. Build an inexpensive browser prototype with actual copy and sample data. Check whether the goal can be completed before polishing the appearance of the screens. A person organizes observation of users and records their actual responses.

### Step 3: Compare Visual Directions

Ask the agent in the UI role to create a small number of distinct directions using the same content. Compare directions with different typography, density, composition, and approaches to imagery, rather than changing colors alone. Limit the scope so a choice can be made from one representative screen and the key interaction. After Boss selects a direction, record the reasons for the choice and the core rules.

### Step 4: Establish a Small Design System

Start with recurring semantic tokens, typography, containers, and basic components. Require agents to look for an existing component before creating a new one. Assign responsibility for changes to tokens and shared APIs to a single owner, and provide explicit extension points where product-specific characteristics are needed.

### Step 5: Implement a Core Task from End to End

The implementation agent connects the normal, loading, empty, failure, and permission states for one task. Building one complete, thin end-to-end slice first reduces the chance of discovering integration problems only after producing a large number of static screens. Reapply the quality criteria when adopting prototype code for production. [R09](https://www.gov.uk/service-manual/design/making-prototypes)

### Step 6: Separate Generation from Evaluation

In addition to reading the code, the review agent opens the browser and checks behavior, screenshots, responsiveness, keyboard operation, and errors. Evaluations should record specific findings and evidence. Anthropic's published experiment also separated the generator from the evaluator and had it explore the actual pages, while acknowledging the evaluator model's remaining leniency and the limitations of its aesthetic judgment. [R51](https://www.anthropic.com/research/harness-design-long-running-apps)

### Step 7: Narrow the Goal of Each Revision

Do not end a review with “make it prettier.” Identify the problematic element, its effect on users, and the expected state. For example: “On narrow screens, the heading wraps to four lines and pushes the main action below the first viewport. Adjust the typography and section height while preserving the meaning of the copy.” Preserve good states from each iteration and limit the number and cost of iterations. Do not assume the last version is always the best.

### Step 8: Launch After Validation with Real Users and Operational Checks

Record an agent's successful task completion, passing automated checks, human visual approval, and validation with real users as different kinds of evidence. Deploy after completing the necessary level of review, then use actual usage and error data to decide on the next changes.

### Multi-Agent Roles and Shared Rules

| Role | Responsibility | Shared references |
|---|---|---|
| Lead and integration | Scope, decisions, final quality, and merging | Brief, decision records, and completion criteria |
| UX and content | Tasks, IA, copy, and error flows | User evidence and the shape of actual data |
| UI and system | Typography, tokens, components, and states | Visual direction and existing code |
| Implementation | Screens, APIs, routing, and responsiveness | Component contracts and state specifications |
| Motion and 3D | Difficult visual effects, assets, and performance | Scene intent, technical budgets, and alternative experiences |
| Independent review | Browser, accessibility, functional, and visual review | Acceptance criteria and representative user tasks |

Apply parallel work to independent screens, research, and experiments. Define ownership so that multiple agents do not change the same tokens or shared components with different meanings. Separate branches or worktrees isolate file changes, but they do not resolve contradictions in design decisions. The integration owner checks the overall screens and tasks again. This is a proposed structure for managing multiple workstreams.

## 16. Minimum Deliverables and Completion Criteria You Can Apply Immediately

### Minimum Information to Keep in the Repository

| Item | What to include |
|---|---|
| Brief | Users, goals, core tasks, constraints, and success criteria |
| Design intent | Atmosphere, typography, density, and reasons for using each reference |
| Flows and states | Main tasks, and policies for errors, recovery, permissions, and focus |
| Tokens | Semantic names, values, themes, and the source of truth for transformations |
| Component examples | Actual APIs, correct usage examples, and representative states |
| Content and assets | Actual copy, edge-case data, images, source files, and usage rights |
| Motion specifications | Triggers, timing, interruption, and alternatives for mobile and reduced motion |
| Review and decision records | What was observed, why changes were made, and remaining risks |

Do not turn the document describing intent into an encyclopedia that copies every code API. Reference the locations of values and usage examples, and update the documentation alongside actual changes. A few files and browser previews are sufficient at the beginning; expand Storybook, registries, and MCP as reuse and team size increase.

### Final Completion Criteria

- Users can complete the core tasks.
- The normal path and the major exception paths that can realistically occur are implemented.
- The layout holds up with actual content, long content, and empty data.
- The roles of typography, spacing, and color, and the use of components, are consistent.
- People can read and operate the interface on representative devices and at intermediate viewport widths.
- Keyboard operation, focus, labels, and reduced-motion settings have been reviewed.
- Media, 3D, and motion do not interfere with the main actions or performance.
- Differences between the preview and actual deployment environments have been checked.
- There are ways to update content, respond to errors, and roll changes back.
- AI evaluations and evidence from real users are recorded separately.

### Applying This to the Nature of Boss's Projects

For the ITSACHAR introduction site, a suitable approach is to prioritize the message, case studies, inquiry flow, and visual direction, then concentrate on refining one or two signature motion sequences. For a work-oriented product such as KSATOS, prioritize lists, editing, analysis, error recovery, information density, keyboard shortcuts, and states. If strong visual expression is the goal, as with a personal portfolio, treat motion and 3D technical experiments as a separate workstream from the beginning and design the alternative mobile experience as well. These are recommendations based on the nature of the user's projects; they do not mean that the three projects should be combined into one design system.

## 17. Further Reading and Verification Sources

The materials below are public primary sources checked on the research date. Older project accounts were used as evidence of the process at that time, while current tool capabilities were checked against official documentation. Companies' reported impact or speed figures were not generalized into guarantees of results. All links lead to the original sources. Titles originally published in Korean are presented in English translation below.

### Professional Practice and UX

- **R01. GOV.UK, User research in discovery.** Users, goals, existing experiences, support staff, and team participation. [Original source](https://www.gov.uk/service-manual/user-research/user-research-in-discovery)
- **R02. Linear, A calmer interface for a product in motion, 2026-03-12.** An in-product token tool, agents, and handoff to Figma. [Original source](https://linear.app/now/behind-the-latest-design-refresh)
- **R03. Cisco DevNet, Design-to-Code: Reimagine Handoff Workflow with AI, 2026-11-02.** Design, handoff, and changelogs centered on functional HTML. [Original source](https://blogs.cisco.com/cisco-devnet/design-to-code-ai-handoff-workflow)
- **R04. BILL, How We Made Our Design System Bilingual, 2026-08-17.** A Storybook-based CLI and MCP, with documentation drawn from the same source. [Original source](https://www.bill.com/engineering/how-we-made-our-design-system-bilingual)
- **R05. GDS, How designers prototype at GDS, 2014-10-13.** A historical example of design using HTML/CSS and Git. [Original source](https://designnotes.blog.gov.uk/2014/10/13/how-designers-prototype-at-gds/)
- **R06. SOCAR, Improving the Stages of the Vehicle Reservation Funnel, 2022-06-02.** Research, copy, implementation, QA, experimentation, and follow-up usability testing. [Original source](https://tech.socar.kr/product/2022/06/02/reservation-funnel-improvement-with-abtest)
- **R07. Linear, How we redesigned the Linear UI, 2024-03-28.** Exploration in Figma, implementation, and launch validation. [Original source](https://linear.app/now/how-we-redesigned-the-linear-ui)
- **R08. Yanis Lebzar and Gabriel Foulon, Case Study: Ciel Rose, 2025-04-07.** The creators' firsthand account of their Figma, AE, and WebGL process. [Original source](https://tympanus.net/codrops/2025/04/07/case-study-ciel-rose/)
- **R09. GOV.UK, Making prototypes.** Choosing prototypes to fit the questions being asked, and distinguishing them from production code. [Original source](https://www.gov.uk/service-manual/design/making-prototypes)
- **R10. GitLab, How we overhauled GitLab navigation, 2023-08-15.** Diary studies, concepts, card sorting, and analysis. [Original source](https://about.gitlab.com/blog/navigation-research-blog-post/)
- **R11. GOV.UK, Using moderated usability testing.** Real tasks and observation of users. [Original source](https://www.gov.uk/service-manual/user-research/using-moderated-usability-testing)
- **R12. NN/g, Why 5 Participants Are Okay in a Qualitative Study, but Not in a Quantitative One.** Distinctions between qualitative and quantitative objectives and samples. [Original source](https://www.nngroup.com/articles/5-test-users-qual-quant/)
- **R13. Toss, The Hyuribot Story #1, 2024-12-02.** Distinguishing the roles of AI checks and validation with users. [Original source](https://toss.tech/article/research-platform-ai)
- **R14. GOV.UK Design System, Accessibility strategy.** Accessibility work still required after adopting components. [Original source](https://design-system.service.gov.uk/accessibility/accessibility-strategy/)

### Figma and Design Systems

- **R15. Figma, Guide to auto layout.** Layout rules that respond to content changes. [Original source](https://help.figma.com/hc/en-us/articles/360040451373-Guide-to-auto-layout-in-Figma)
- **R16. Figma, Structure your Figma file for better code.** Components, variables, naming, annotations, and resizing. [Original source](https://developers.figma.com/docs/figma-mcp-server/structure-figma-file/)
- **R17. Figma, Modes for variables.** Variable values for different contexts. [Original source](https://help.figma.com/hc/en-us/articles/15343816063383-Modes-for-variables)
- **R18. Figma, Guide to Dev Mode.** Inspection, assets, changes, and handoff. [Original source](https://help.figma.com/hc/en-us/articles/15023124644247-Guide-to-Dev-Mode-in-Figma)
- **R19. Figma, Code Connect integration.** Connecting code imports, props, and usage examples. [Original source](https://developers.figma.com/docs/figma-mcp-server/code-connect-integration/)
- **R20. Figma, What does the MCP server do, and what does my agent do?** The roles of MCP and the agent in writing final code. [Original source](https://developers.figma.com/docs/figma-mcp-server/mcp-vs-agent/)
- **R21. Figma Motion launch, 2026-06-24 / official development handoff documentation.** Motion creation and handoff in CSS, React, and JSON. [Launch article](https://www.figma.com/blog/introducing-figma-motion/) · [Development handoff](https://help.figma.com/hc/en-us/articles/41296356954263-Hand-off-animations-to-development)
- **R22. Figma, Explore Figma Sites.** Publishing actual responsive sites. [Original source](https://help.figma.com/hc/en-us/articles/31230436657815-Explore-Figma-Sites)
- **R23. Figma, Code to canvas.** The capabilities and scope of bringing running UI into editable layers. [Original source](https://developers.figma.com/docs/figma-mcp-server/code-to-canvas/)
- **R24. Figma, Publish, update, or unpublish a site.** Restrictions on exporting code for publishing elsewhere. [Original source](https://help.figma.com/hc/en-us/articles/31242845959703-Publish-update-or-unpublish-a-site)
- **R25. GitHub Primer, Adding new components.** Actual demand, documentation, Storybook, and accessibility review. [Original source](https://primer.style/product/contribute/adding-new-components/)
- **R26. GitHub Primer, Color usage.** Base, functional, and component tokens. [Original source](https://primer.style/product/getting-started/foundations/color-usage/)
- **R27. Storybook, Why Storybook.** Components in different states, documentation, and testing. [Original source](https://storybook.js.org/docs/get-started/why-storybook)
- **R28. shadcn/ui, Introduction.** Editable code, composition, and distribution. [Original source](https://ui.shadcn.com/docs)
- **R29. Tailwind CSS, Theme variables.** The connection between theme variables and utilities. [Original source](https://tailwindcss.com/docs/theme)
- **R30. Toss, Rethinking the Design System, 2026-01-08.** The system as an internal product, extensibility, and the use of Deus. [Original source](https://toss.tech/article/rethinking-design-system)
- **R31. DTCG, Design Tokens Format Module 2025.10, 2025-10-28.** The stable Community Group exchange format and the status of the document. [Original source](https://www.designtokens.org/tr/2025.10/format/)

### Frontend, Motion, 3D, and Quality

- **R32. Astro, Islands architecture.** Combining static HTML with the interactions that are needed. [Original source](https://docs.astro.build/en/concepts/islands/)
- **R33. MDN, Responsive design.** Flexible layouts, media, and responsive strategies. [Original source](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Responsive_Design)
- **R34. Davide Perozzi, Design Embraced Portfolio, 2024-03-21.** Collaboration through AE and a mobile version without WebGL. [Original source](https://tympanus.net/codrops/2024/03/21/case-study-design-embraced-portfolio-2024/)
- **R35. MDN, Web Animations API.** Timing and playback of DOM animations. [Original source](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API)
- **R36. Motion, Accessibility.** Reduced-motion options and alternative presentations. [Original source](https://motion.dev/docs/react-accessibility)
- **R37. GSAP, ScrollTrigger.** Scroll-linked animation. [Original source](https://gsap.com/docs/v3/Plugins/ScrollTrigger/)
- **R38. Airbnb, official lottie-web repository.** Playing After Effects animations on the web. [Original source](https://github.com/airbnb/lottie-web)
- **R39. Rive, Introduction.** The editor, interactions, data, and runtimes. [Original source](https://rive.app/docs/getting-started/introduction)
- **R40. Unseen Studio, Case Study: Crosswire, 2023-04-04.** Tradeoffs involving Blender, instancing, and matcaps. [Original source](https://tympanus.net/codrops/2023/04/04/case-study-crosswire/)
- **R41. Stripe, To design and develop an interactive globe, 2020-09-01.** An early working prototype and collaboration across disciplines. [Original source](https://stripe.com/blog/globe)
- **R42. React Three Fiber, Introduction / Scaling performance.** The role of the React renderer, on-demand rendering, reuse, and quality adjustment. [Introduction](https://r3f.docs.pmnd.rs/getting-started/introduction) · [Performance](https://r3f.docs.pmnd.rs/advanced/scaling-performance)
- **R43. Three.js, GLTFLoader.** Support for glTF, Draco, meshopt, and KTX2. [Original source](https://threejs.org/docs/pages/GLTFLoader.html)
- **R44. MDN, canvas element.** Canvas, alternative content, and accessibility. [Original source](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/canvas)
- **R45. Playwright, Visual comparisons.** Visual regression and differences caused by the environment. [Original source](https://playwright.dev/docs/test-snapshots)
- **R46. web.dev, Web Vitals.** LCP, INP, CLS, and the real-user p75 criteria. [Original source](https://web.dev/articles/vitals)

### AI-Native Tools and Evaluation

- **R47. pen.dev, Design ↔ Code, updated 2026-11-04.** The distinction between request-driven code and design changes and continuous synchronization. [Original source](https://docs.pencil.dev/design-and-code/design-to-code)
- **R48. Penpot, MCP server.** Connecting design documents, components, and tokens to agents. [Original source](https://help.penpot.app/mcp/)
- **R49. v0, Design Systems 2.0.** Applying a system based on actual packages, source code, and documentation. [Original source](https://v0.app/docs/design-systems-2)
- **R50. shadcn/ui, MCP Server.** Registry search, browsing, and installation. [Original source](https://ui.shadcn.com/docs/mcp)
- **R51. Anthropic, Harness design for long-running application development, 2026-03-24.** Separation of the generator and evaluator, browser review, self-evaluation bias, and limitations. [Original source](https://www.anthropic.com/research/harness-design-long-running-apps)
- **R52. Spline, Exporting as Code.** Ways to deliver scenes to web projects and differences between export options. [Original source](https://docs.spline.design/exporting-your-scene/web/exporting-as-code)
- **R53. Official product overviews from Framer / Webflow.** Visual canvases, CMS, site publishing, and agent capabilities. These provide evidence of feature scope, not independent verification of quality or productivity claims. [Framer](https://www.framer.com/) · [Webflow](https://webflow.com/platform)
- **R54. WordPress, Theme Handbook.** Block themes, classic themes, and site editing. [Original source](https://developer.wordpress.org/themes/)

### Interpreting the Evidence and the Remaining Limits

This report compares working methods and tool capabilities that can be verified in public materials. It does not verify the complete internal processes of private studios, adoption rates across companies, or costs compared under identical conditions. The Codrops project accounts were checked through the creators' text exposed in search results; some attempts to open the pages directly were blocked. The recommended combinations and checklists are proposals synthesized from the evidence. They are not the results of installing particular tools in this user's environment or implementing a project and measuring its performance.
