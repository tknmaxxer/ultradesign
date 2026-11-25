# 7 · Motion language

Output: motion principles, storyboard, a recorded animatic, a behavioural spec; the gate `motion`. Role: Motion and 3D. Required at full depth and when included at short depth. Needs the approved direction, `DESIGN.md` motion tokens and, when present, the spike.

1. **Role of motion.** One sentence: what motion does on this site (orient, explain, reward, set mood) and the intensity and register from the brief.
2. **Principles and tokens.** Principles from the brief and cards (one focal point, stagger by hierarchy, productive under 150 ms for what is seen dozens of times a day, exits faster than entrances). Use the `motion.*` tokens in `DESIGN.md`; add or change them through the Lead and regenerate with `design-tokens --ts`. Update the same Storybook motion specimens and affected stories; show contract changes with the motion gate, not as a parallel set of values. Use one animation owner per element, with interruption and cleanup defined; do not let two engines control the same properties.
3. **Pick 1–2 signature sequences.** Expressive motion lives only there; elsewhere motion is productive or none. List the key moments in order with trigger, element that moves, start state and end state.
4. **Storyboard** the key moments as a frame strip.
5. **Animatic.** Build the signature sequence in the real stack (GSAP or Motion; R3F for 3D). The page exposes `window.udAnimatic = { duration, play(): Promise<void>, settle() }`, driven by the timeline's own duration and completion. Record at desktop and phone:

   ```sh
   uv run --script scripts/animatic --url http://127.0.0.1:PORT/animatic.html \
     --out out/animatic --widths 1440,390
   ```

   Review `animatic.json` (errors, WebGL availability) and the reduced-motion still. Motion files go under the guard's `motionEntries` / `sceneEntries`; colours come from `tokens.ts`.
6. **Behavioural spec**, in plain sentences: what happens on interruption (fast scroll, repeated click, back, resize), focus and keyboard, touch and mobile, loading and failure, and the reduced-motion version of every motion. Real-world checks go into the review stage.
7. **Gate `motion`.**
   - Artifact: the animatic video and frame strip, the spec.
   - Reason: how the sequence expresses the brief's motion intensity and register.
   - Look at: the whole video, twice; the moment the main action appears; the reduced-motion still; the mobile version.
   - Ask: "Watch it twice. At which second does it stop feeling right, what did you feel there, and what were you trying to look at?"

Done when one or two signature sequences are timed and every motion has a reduced-motion substitute.
