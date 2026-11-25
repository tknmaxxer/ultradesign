# 13 · Share the approved system (only with `--shared`)

Runs after the final gate is approved, only when the system has other consumers. There is no owner gate.

Follow the split in [Horon Design's `apps/site`](https://github.com/horon-ai/design/tree/main/apps/site): an Astro design-system site (with React integration where appropriate) and an independently consumable npm package for tokens and components. Generate tokens from `DESIGN.md` (`tokens.css` and `tokens.ts`) and point the site and the Storybook at the same shared variants. Build and test the package in a consumer project. Seek separate authorization for any publication or subdomain change; do not publish on your own.
