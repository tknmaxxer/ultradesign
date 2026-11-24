# Add motion on request

After the static flow works, use the user's motion request to identify the trigger, states to connect and element that moves. Use or update the approved duration/easing recipes in `DESIGN.md`, regenerate tokens when needed, and implement the transition inside the catalog components that own those states, so generated screens inherit it. Rerun the guard and the hierarchy check, since motion must not move P1 or the primary action out of the first view. Replay the affected interaction and its reduced-motion equivalent. Show the current result and checks in final review.
