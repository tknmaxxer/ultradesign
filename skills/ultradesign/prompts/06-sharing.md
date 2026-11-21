# 6 · Package a system for named consumers

## Input

Explicit cross-project sharing scope, verified components and tokens, catalog stories, and at least one consuming project or representative consumer.

## Work

1. Enumerate what the consumer imports, customizes, and verifies. Separate public tokens and component exports from the product-only examples. Demonstrate populated, empty, and interaction variants using common representative data.
2. Align usage docs, stories, and component contracts with the actual package API. If a design canvas is part of the handoff, map published variants and state names to its Figma or Paper components and record any differences.
3. When a shared site and package are requested and the stack is open, use an Astro system site (with the relevant component integration) and a separately consumable npm package. Use the [catalog's design system examples](../references/catalog.md) to study the split. Keep site hosting or subdomain setup and npm publication as explicit decisions; prepare local build and package artifacts, with public release performed under the owner's authorization.
4. Install the packed package into a representative consumer. Load styles and tokens, use a real component with state and keyboard interaction, and open the system site to check examples and navigation. Record version, artifact, and exact commands.

## Output

A built system preview, documented public surface, and evidence that a consumer can install and use the package. State where the site and package live and whether they were published. Leave single-project work in its existing app and catalog by completing the workflow at stage 5.
