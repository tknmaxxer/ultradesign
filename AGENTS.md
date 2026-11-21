# Ultradesign

Ultradesign is a documentation-only Agent Skill for turning design references into a coherent, implemented, and visually verified frontend.

- `SKILL.md` is the entry point and source of truth for the workflow.
- `references/` contains task-specific guidance loaded from `SKILL.md`.
- `README.md` explains installation and invocation.

No build or runtime dependencies are required. Use the [Agent Skills reference validator](https://github.com/agentskills/agentskills/tree/main/skills-ref) to run `skills-ref validate .` from a checkout named `ultradesign`. Run `git diff --check` and verify that relative Markdown links resolve.
