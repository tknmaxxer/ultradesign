# Ultradesign

Ultradesign is an Agent Skill and workflow product for turning design references into a coherent, implemented, and visually verified frontend.

- `skills/ultradesign/SKILL.md` is the workflow source of truth. Its prompts, references, templates, and renderer travel with the skill.
- `adapters/omp/` is the OMP extension; `scripts/adapters.mjs` installs thin host-specific entry points. `evals/` contains the A/B workflow evaluation.
- `README.md` explains installation and invocation.

Use the [Agent Skills reference validator](https://github.com/agentskills/agentskills/tree/main/skills-ref) to run `skills-ref validate skills/ultradesign`. Run `git diff --check` and verify relative Markdown links. Run `bun test`, `bun run test:host`, and `node tests/visual-qa-smoke.mjs` for the relevant behavior; the renderer needs `uv` and Playwright Chromium.
