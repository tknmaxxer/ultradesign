# Assemble a board; let the user pick

1. Turn `brief.md` into a task-specific search, device, and reference kind: `screen` for product UI, `mood` for landings/layout direction, or `component` for one interaction. Start with the [core sources and relevant specialist galleries](../references/catalog.md). Differentiate a shipped screen, an art-direction still, and an isolated component.
2. Use the [reference-board tool](../scripts/reference-board) from the skill root. For example:

   ```sh
   uv run --script scripts/reference-board "developer tool landing hero" \
     --kind mood --platform web --out /path/to/private/refs --screenshot
   ```

   When the owner supplies their logged-in Chrome endpoint, nominate a few exact, eligible first-party pages for the comparison. Add `--cdp http://127.0.0.1:9222` and one `--candidate URL "What to compare"` per page. This opens fresh research tabs in that profile, at human pace, with public adapters for independent sources. Treat sign-in, CAPTCHA, paywall, rate-limit and access-policy stops as source gaps. For manual-only galleries offer their normal browse links or use owner-supplied examples. If CDP is unavailable, use eligible public adapters and record where previews actually came from.

   For the actual product, pass `--target-url URL` for each exact owner-authorized page. Its capture belongs to **Current screen**, outside the reference picks. Explicit authorization substitutes for robots policy only at those target URLs. Reference sources still use their usual access policies. The target uses isolated local Chromium when no CDP endpoint is supplied.
3. Inspect the images. Keep a tight numbered comparison of real candidates with URL, preview/state, and one specific comparison note each. Mark a link-only candidate as such. Keep the board, its manifest, and captures private. Treat gallery homepages/access screens as ledger entries, not design examples.
4. Present the board and ask the user to pick **one to three numbered references** and name what to carry over. Suggest where to look; their choices are the gate. After they answer, save the numbers, rationale, exact source links, captures, and targeted design notes in `picks.md`. Carry the visual artifacts themselves into the interview, the catalog frames and the map.
