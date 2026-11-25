# 4 · Directions on the same content

Output: three directions, one recommended, on a stylescape board; the gate `directions`. Roles: UI and system, Motion and 3D. Needs the approved brief, `structure.md`, its representative screen and the deconstruction cards. Divergence stays inside the skill: you explore three, recommend one, and show the others only as "also explored".

1. **Stretch three directions far apart** on type, density, composition and imagery, not on colour alone. Read and apply `frontend-design` when installed, following [supporting skills](../SKILL.md#supporting-skills); record which subject-specific choices it informed. Each direction applies the brief's observable requirements, genre convention and motion line, and uses the card principles; none copies a reference's layout or signature elements. Name each direction in plain words.
2. **Per direction, build:**
   - **Core rules** (5–8 lines): type roles, colour roles, density, composition, imagery, motion.
   - **Stylescape tiles:** generated imagery with `generate_image` (keep consistency by passing earlier tiles as input images; check text in images for spelling), a type specimen set in the real copy, a palette sourced from a palette site and rendered with `uv run --script scripts/palette-board --input palettes.json --out palettes.html`. Log every generated image in `assets.json` ([template](../assets/templates/assets.json)).
   - **Representative screen:** stage 2's screen in real copy, rendered as a PNG at 1440. Render from the copy source; do not retype copy.
   - **Motion sketch, 5–8 s:** a page exposing `window.udAnimatic = { duration, play(): Promise<void>, settle() }` (the timeline's own duration and completion; no fixed sleeps). Record it:

     ```sh
     uv run --script scripts/animatic --url http://127.0.0.1:PORT/direction-a.html \
       --out out/a/motion --widths 1440,390
     ```

     It writes `animatic-<width>.mp4`, `strip-<width>.png`, `end-<width>.png`, `reduced-<width>.png` and `animatic.json`; fix every page or console error it reports. For asynchronously rendered pages add `--ready <selector>`; `--timeout` and `--chromium-path` are accepted by all browser tools. WebGL on SwiftShader is lab evidence; label it so.
3. **Check each direction before showing it.**
   - Text-only: write a `composition.json` for the representative screen (`page` and a `visualRole` per `[data-ud-section]`) and run `uv run --script scripts/text-only-lint --url URL --map composition.json --widths 390,1440 --out out/a/text-only`. Per-section share 0.00 means text only; fix it before the board.
   - Originality: `uv run --script scripts/originality-check --url URL --reference REF1 --reference REF2 --reference REF3 --width 1440 --out out/a/originality`. The score is a structural heuristic (default `--threshold 0.85`), not a calibrated plagiarism verdict, and the board goes to the owner. A flagged layout match is redesigned, not defended.
4. **Recommend one.** Reasons tied to the brief's observable levels, in plain words, plus its core rules. Write `directions.json` (paths resolve beside it):

   ```json
   { "recommended": "b",
     "directions": [
       { "id": "b", "name": "…", "reasons": ["…"], "coreRules": ["…"],
         "tiles": ["b/tile-1.webp", "b/tile-2.webp"], "screen": "b/screen-1440.png",
         "motion": { "video": "b/motion/animatic-1440.mp4", "strip": "b/motion/strip-1440.png" } }
     ] }
   ```

   ```sh
   uv run --script scripts/stylescape-board --input directions.json --out board/index.html
   ```

   Short depth: one direction applied to the existing system; the same checks and gate. When the run excludes `motion` ([scope applicability](../SKILL.md#applying-scope-downstream)), skip the motion sketch, set `"motion": { "excluded": "<scope reason from the brief>" }` and state the reused motion behavior in the core rules. Any other missing motion field fails the board.
5. **Gate `directions`.**
   - Artifact: the board link.
   - Reason: why the recommended direction fits the brief, one line.
   - Look at: what you notice first on the large screen; the type and imagery; the motion sketch (play it twice) when motion is in scope; the core rules; the two "also explored" directions.
   - Ask: "Imagine this is live and your visitor lands on it. What do they notice first, what do they feel, and where on the screen does that feeling differ from what you want?"
   - Translate the reply (ladder, restatement). Approval records the direction, its reasons and core rules; a redirection revises the recommended direction or promotes an "also explored" one.

Done when the three directions differ in type, density, composition and imagery, each passes the text-only and originality checks, and the owner's reply is resolved.
