# 3 · References to principles

Output: reference board, three deconstruction cards ([template](../assets/templates/deconstruction-card.md)), the gate `references`. Role: UI and system. A reference stays a reference: it supplies principles, never a layout.

1. **Capture 12–20 real sites** from galleries that match the brand words and the genre in the brief. Choose the kind per [source catalog](../references/catalog.md): `screen` for product UI, `mood` for landings and layout direction, `component` for one interaction.

   ```sh
   uv run --script scripts/reference-board "<task-specific search>" \
     --kind mood --platform web --out /path/to/private/refs --screenshot
   ```

   With the owner's logged-in Chrome endpoint, add `--cdp http://127.0.0.1:9222` and one `--candidate URL "What to compare"` per eligible first-party page; sign-in, CAPTCHA, paywall and rate-limit stops are source gaps, not obstacles to route around. For the owner's own product pass `--target-url URL`; its capture is the current screen, outside the picks. Link-only candidates are marked as such; gallery homepages are ledger entries, not examples. Palette sites: [`palette-board`](../scripts/palette-board).
2. **Select three yourself.** Inspect the captures. Pick the three that give the most usable principles for the brief's observable requirements and that differ from each other. Keep the rest as the ledger.
3. **Write a card per pick** from the template: per area (composition, type, colour, imagery, motion, interaction) a principle that can be applied elsewhere and where it shows; the "Not carried" line naming its layout and its signature elements. A card with no principle, or whose principle is "use this layout", is not finished.
4. **Gate `references`.**
   - Artifact: the three cards with screenshots, the board link.
   - Reason: one line per pick tied to a brand word or requirement.
   - Look at: each card's principles; each "not carried" line; the captures; what the board left out.
   - Ask: "Which of these feels furthest from your site, and what in it makes you feel that?"
   - The owner's reaction is the source of liked and disliked sites. Extract it with the ladder; replace a pick the owner rejects and show the new card at the same gate.

Done when each pick maps to principles and none to a layout.
