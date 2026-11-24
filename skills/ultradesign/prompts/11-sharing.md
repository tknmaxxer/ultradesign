# Share an approved system on request

For a system meant for other projects, follow the split in [Horon Design's `apps/site`](https://github.com/horon-ai/design/tree/main/apps/site): an Astro design-system site (with React integration where appropriate) and an independently consumable npm package for tokens and components. Generate tokens from `DESIGN.md` and point the site and any Storybook at the same shared variants. Build and test the package in a consumer. Seek separate authorization for any publication or subdomain change.
