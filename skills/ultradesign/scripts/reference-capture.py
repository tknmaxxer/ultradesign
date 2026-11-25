# /// script
# requires-python = ">=3.10"
# dependencies = ["playwright==1.65.1"]
# ///
"""Capture public reference pages for private, task-specific design studies."""

import argparse
import ipaddress
import os
from pathlib import Path
import re
import sys
from urllib.parse import urlsplit


WIDTHS = (390, 768, 1440)
NAME = re.compile(r"[a-z][a-z0-9-]{0,39}")


def permitted(url, local):
    try:
        parts = urlsplit(url)
        host = (parts.hostname or "").rstrip(".")
        if parts.username or parts.password:
            return False
        if local:
            return parts.scheme == "http" and host == "127.0.0.1"
        if parts.scheme != "https":
            return False
        try:
            return ipaddress.ip_address(host).is_global
        except ValueError:
            return "." in host and not host.endswith((".localhost", ".local", ".internal", ".test"))
    except ValueError:
        return False


def region_arg(value):
    name, _, selector = value.partition("=")
    if not NAME.fullmatch(name) or name == "page" or not selector.strip():
        raise argparse.ArgumentTypeError("use a region like hero=main > section:first-child")
    return name, selector.strip()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--url", required=True)
    parser.add_argument("--out", type=Path, required=True, help="new private capture directory")
    parser.add_argument("--region", type=region_arg, action="append", required=True)
    parser.add_argument("--ready", help="CSS selector for the loaded content, not its shell or spinner")
    parser.add_argument("--pattern", required=True)
    parser.add_argument("--why", required=True)
    parser.add_argument("--adapt", required=True)
    parser.add_argument("--local", action="store_true", help="capture a local HTTP fixture at 127.0.0.1")
    args = parser.parse_args()
    if not permitted(args.url, args.local):
        parser.error("use a public HTTPS URL (or a loopback fixture with --local)")
    if len(dict(args.region)) != len(args.region):
        parser.error("region names must be unique")
    if any(not text.strip() for text in (args.pattern, args.why, args.adapt)):
        parser.error("pattern, why and adaptation must be nonempty")

    from playwright.sync_api import sync_playwright, TimeoutError as ScreenshotTimeout

    args.out.mkdir(mode=0o700, parents=True)
    captures = {}
    notes = []
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(executable_path=os.environ.get("UD_CHROMIUM_PATH"))
        try:
            for width in WIDTHS:
                context = browser.new_context(
                    viewport={"width": width, "height": 900},
                    device_scale_factor=1,
                    has_touch=width == 390,
                    reduced_motion="reduce",
                    service_workers="block",
                    accept_downloads=False,
                )
                try:
                    def read_public_resource(route):
                        request = route.request
                        same_origin = urlsplit(request.url).netloc == urlsplit(args.url).netloc
                        if (request.method in {"GET", "HEAD", "OPTIONS"} and permitted(request.url, args.local)
                                and (not args.local or same_origin)):
                            route.continue_()
                        else:
                            route.abort()

                    context.route("**/*", read_public_resource)
                    context.route_web_socket("**/*", lambda socket: socket.close())
                    page = context.new_page()
                    response = page.goto(args.url, wait_until="domcontentloaded", timeout=25000)
                    if response is None or response.status >= 400 or not permitted(page.url, args.local):
                        raise ValueError(f"{width}px: reference did not load (HTTP {response.status if response else 'unknown'})")
                    page.wait_for_load_state("load", timeout=12000)
                    if args.ready:
                        page.locator(args.ready).filter(visible=True).first.wait_for(timeout=12000)
                    page.evaluate("() => Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 2500))])")
                    files = [f"page-{width}.png"]
                    height = page.evaluate("() => Math.max(innerHeight, document.documentElement.scrollHeight)")
                    page.screenshot(path=args.out / files[0], full_page=True, animations="disabled", timeout=12000,
                                    clip={"x": 0, "y": 0, "width": width, "height": height})
                    for name, selector in args.region:
                        locator = page.locator(selector).filter(visible=True).first
                        filename = f"{name}-{width}.png"
                        try:
                            locator.screenshot(path=args.out / filename, animations="disabled", timeout=4000)
                            files.append(filename)
                        except ScreenshotTimeout:
                            notes.append(f"- {width}px: `{name}` was not captured (selector `{selector}`).")
                    if len(files) == 1:
                        raise ValueError(f"{width}px: no key region matched; revise the selectors")
                    captures[width] = (page.url, files)
                finally:
                    context.close()
        finally:
            browser.close()

    evidence = "\n".join(
        f"- {width}px · {url}: " + ", ".join(f"[{file}]({file})" for file in files)
        for width, (url, files) in captures.items()
    )
    note = (
        f"# Private reference study\n\nSource: {args.url}\n\n"
        f"## Pattern\n\n{args.pattern.strip()}\n\n"
        f"## Why it works\n\n{args.why.strip()}\n\n"
        f"## How to adapt\n\n{args.adapt.strip()}\n\n"
        f"## Screenshots\n\n{evidence}\n" + ("\n" + "\n".join(notes) + "\n" if notes else "")
    )
    (args.out / "pattern.md").write_text(note, encoding="utf-8")
    print(args.out / "pattern.md")


if __name__ == "__main__":
    try:
        main()
    except (OSError, ValueError) as error:
        sys.exit(str(error))
