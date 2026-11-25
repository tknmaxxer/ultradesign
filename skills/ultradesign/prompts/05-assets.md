# 5 · Visual language, assets and risk spike

Output: key visuals, imagery rules, `assets.json`, a working spike, the gate `assets`. Role: Motion and 3D. Needs the approved direction.

1. **Imagery rules.** From the direction: image types, grading, crop and framing, what an image must show (explain, prove, set mood), what is never used. Write them under the imagery section of `DESIGN.md` (via the Lead).
2. **Medium per moment.** For each moment that needs a visual, choose the medium and say why: real-time 3D only where the visitor changes the viewpoint or interacts; otherwise image, video, SVG/canvas or Lottie. Rive only with owner-supplied files. Shaders and generative canvas for ambient surfaces.
3. **Key visuals.** Generate with `generate_image`, passing the direction's tiles and earlier key visuals as input images for consistency. Check text in images for spelling. For every asset add a record to `assets.json` ([template](../assets/templates/assets.json)): id, file, kind, source, prompt, model, licence, createdAt. An asset without provenance is not used.
4. **Risk spike.** Build the hardest transition or scene (the one most likely not to work) in the target browser and measure it:

   ```sh
   uv run --script scripts/scene-qa --url http://127.0.0.1:PORT/spike.html \
     --profile desktop-1440 --seconds 5 --out out/spike/desktop
   uv run --script scripts/scene-qa --url http://127.0.0.1:PORT/spike.html \
     --profile phone-390 --seconds 5 --out out/spike/phone
   ```

   It reports WebGL context, console and page errors, frame-rate sample, LCP, reduced-motion still and WebGL-off fallback still. Numbers from SwiftShader or headless Chromium are **lab**; a device floor needs a real device, and the report says which was measured. Define the fallback image or behaviour for each scene and the scene budget (device, frame-rate floor, texture size) for `DESIGN.md`.
5. **Gate `assets`.**
   - Artifact: the key visuals, the imagery rules, the spike recording and its numbers in plain words.
   - Reason: what each visual does for the brief; whether the hardest moment works and at what cost.
   - Look at: the key visuals as a set; the spike recording; the fallback still; the cost in plain words (loads in N s, runs smoothly or not on the lab profile).
   - Ask: "Which image feels most like your site and which least, and what in each makes the difference?"

Done when the core experience is feasible in the target environment and every scene has a fallback. Skip this stage only when the brief needs no new imagery, 3D or scene.
