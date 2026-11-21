# /// script
# requires-python = ">=3.10"
# dependencies = ["playwright==1.65.1"]
# ///
"""Run the same user-visible primary interaction against either anonymous page."""

import argparse
import asyncio
import json
import os
import re
from pathlib import Path
from urllib.parse import urlsplit

from playwright.async_api import async_playwright


ACTIONS = {
    "dashboard": "Search invoices using a visible invoice value and clear the search.",
    "landing": "Open the signup dialog through Start your workspace.",
    "settings": "Edit Full name, cancel, and verify the saved name is restored.",
    "mobile": "Open Add task, enter a unique title, submit, and find that task.",
}

# Sample live animation objects while the real UI action happens. CSS declarations
# are not evidence that an animation actually ran, and a running animation does
# not establish whether its motion was good or whether reduced motion is correct.
ANIMATIONS = """async () => {
    let observed = false;
    const start = performance.now();
    while (performance.now() - start < 650) {
        if (document.getAnimations().some(animation =>
            animation.playState === "running" &&
            animation.effect &&
            animation.effect.getComputedTiming().progress !== null)) observed = true;
        await new Promise(requestAnimationFrame);
    }
    return observed;
}"""


async def primary_action(page, task):
    if task == "dashboard":
        search = page.get_by_role("searchbox")
        if await search.count() == 0:
            search = page.get_by_placeholder("search", exact=False)
        search = search.first
        rows = page.locator("tbody tr")
        before = await rows.count()
        if before < 5:
            return False
        await search.fill("INV-1048")
        await page.wait_for_timeout(150)
        filtered = await rows.filter(visible=True).count()
        await search.fill("")
        await page.wait_for_timeout(150)
        restored = await rows.filter(visible=True).count()
        return 0 < filtered < before and restored == before
    if task == "landing":
        control = page.get_by_role("button", name="Start your workspace", exact=False)
        if await control.count() == 0:
            control = page.get_by_role("link", name="Start your workspace", exact=False)
        await control.first.click()
        await page.get_by_role("dialog").wait_for(state="visible")
        return await page.get_by_role("dialog").get_by_role("textbox").count() > 0
    if task == "settings":
        name = page.get_by_role("textbox", name="full name", exact=False).first
        saved = await name.input_value()
        await name.fill("Temporary Probe Name")
        await page.get_by_role("button", name="Cancel", exact=True).first.click()
        return await name.input_value() == saved
    control = page.get_by_role("button", name="Add task", exact=False).first
    await control.click()
    form = page.get_by_role("dialog")
    if await form.count() == 0:
        form = page.locator("form").filter(has=page.get_by_role("textbox")).last
    title = form.get_by_role("textbox").first
    await title.fill("Review the launch checklist")
    # Prefer the form's submit control. A dialog can also expose a
    # non-submit button named "Close add task form".
    submit = form.locator("button[type=submit], input[type=submit], form button:not([type])").filter(visible=True)
    if await submit.count() == 0:
        submit = form.get_by_role("button", name=re.compile(r"^(?:add|save|create)(?:\s|$)", re.I))
    await submit.first.click()
    await page.get_by_text("Review the launch checklist", exact=True).first.wait_for(state="visible")
    return True


async def run(url, task):
    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch(
            headless=True, executable_path=os.environ.get("UD_CHROMIUM_PATH")
        )
        try:
            context = await browser.new_context(viewport={"width": 390, "height": 844})
            # The fixtures are self-contained. Do not execute unrelated remote resources.
            origin = urlsplit(url).netloc

            async def route(request_route):
                target = urlsplit(request_route.request.url)
                if target.scheme in ("data", "blob") or target.netloc == origin:
                    await request_route.continue_()
                else:
                    await request_route.abort()

            await context.route("**/*", route)
            page = await context.new_page()
            page.set_default_timeout(4000)
            await page.goto(url, wait_until="networkidle")
            await page.wait_for_timeout(100)
            animation_sample = asyncio.create_task(page.evaluate(ANIMATIONS))
            try:
                passed = await primary_action(page, task)
            except Exception:
                passed = False
            observed = await animation_sample
            return {
                "action": ACTIONS[task],
                "primaryActionPassed": bool(passed),
                "runningAnimationObserved": observed,
                "viewportWidth": 390,
                "motionScope": "Live animation objects sampled for 650ms around the action; not a motion-quality or reduced-motion test.",
            }
        finally:
            await browser.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--url", required=True)
    parser.add_argument("--task", choices=ACTIONS, required=True)
    parser.add_argument("--out", type=Path, required=True)
    args = parser.parse_args()
    result = asyncio.run(run(args.url, args.task))
    args.out.write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
