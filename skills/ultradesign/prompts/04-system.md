# Write DESIGN.md and review it in the browser

1. Inspect existing foundations and components. Consolidate the interview's choices into one [Google Labs DESIGN.md](https://github.com/google-labs-code/design.md): alpha YAML token front matter plus Markdown rules for purpose, colors, typography, layout, elevation, shape, motion, content and components. Use [SEED and Horon](../references/catalog.md#design-systems) as structural references. Name primitive values, semantic aliases and reusable component variants in the same source. Use a 4px space grid for a new system; respect an existing system and log exceptions. Plan mode ends with this proposed contract and verification plan, without app changes.
2. Use the skill's [generator](../scripts/design-tokens) and [lint wrapper](../scripts/design-lint) with explicit paths from your working directory. Treat `tokens.css` and the specimen catalog as generated. Check freshness and lint after every revision.

   ```sh
   uv run --script /path/to/skill/scripts/design-tokens DESIGN.md \
     --out src/tokens.css --catalog src/catalog.generated.json
   uv run --script /path/to/skill/scripts/design-lint DESIGN.md
   ```

3. Render the foundations and a realistic specimen at `/system` using the components the screen will use: relevant variants, interactive controls, states, keyboard focus, and mobile density. Keep an established stack and component library where present. For a new project use Vite + React, Base UI and CSS Modules ([starter](../assets/templates/system-page/README.md)); use token variables for styling. A project's existing Storybook can host the same specimens if `/system` links to it and the review remains runnable.
4. Start the app, verify the route at desktop and phone, and give the user the URL and renders plus the decisions they can revise. Apply their feedback in `DESIGN.md` and the relevant components, regenerate and check again. Advance after they approve the current `/system` evidence.
