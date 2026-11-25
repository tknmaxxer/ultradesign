"""Shared capture boundary for the v0.0.60 visual tools (not a CLI)."""

import argparse
import json
import math
import os
from pathlib import Path
import sys
from urllib.parse import urlsplit

FLAGS = ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"]


def positive(value):
    number = float(value)
    if not math.isfinite(number) or number <= 0:
        raise argparse.ArgumentTypeError("expected a finite positive number")
    return number


def widths(value):
    try:
        result = [int(part) for part in value.split(",")]
        if not result or any(n <= 0 for n in result):
            raise ValueError()
        return list(dict.fromkeys(result))
    except ValueError:
        raise argparse.ArgumentTypeError("expected comma-separated positive integer widths") from None


def parser(doc):
    p = argparse.ArgumentParser(description=doc, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--url", required=True)
    p.add_argument("--out", type=Path, required=True)
    p.add_argument("--chromium-path", default=os.environ.get("UD_CHROMIUM_PATH"))
    p.add_argument("--timeout", type=positive, default=30000, help="bounded operation timeout in milliseconds")
    p.add_argument("--ready", help="optional readiness selector for asynchronously rendered pages")
    return p


def validate_url(url):
    if urlsplit(url).scheme not in {"http", "https", "file"}:
        raise ValueError("URL must use http, https, or file")


def context(browser, args, width, **options):
    validate_url(args.url)
    ctx = browser.new_context(
        viewport={"width": width, "height": 844 if width < 600 else 900},
        device_scale_factor=1, service_workers="block", **options)
    origin = urlsplit(args.url)

    def route(request):
        dest = urlsplit(request.request.url)
        if dest.scheme in {"data", "blob"} or (dest.scheme, dest.netloc) == (origin.scheme, origin.netloc):
            request.continue_()
        else:
            request.abort()

    ctx.route("**/*", route)
    ctx.route_web_socket("**/*", lambda socket: socket.close())
    ctx.set_default_timeout(args.timeout)
    return ctx


def load(ctx, args):
    page = ctx.new_page()
    errors = {"consoleErrors": [], "pageErrors": []}
    page.on("console", lambda msg: errors["consoleErrors"].append(msg.text) if msg.type == "error" else None)
    page.on("pageerror", lambda error: errors["pageErrors"].append(str(error)))
    response = page.goto(args.url, wait_until="load")
    if response and not response.ok:
        raise ValueError(f"HTTP {response.status}: {args.url}")
    if args.ready:
        page.locator(args.ready).wait_for()
    bounded(page, "() => document.fonts.ready", args.timeout)
    return page, errors


def bounded(page, expression, timeout):
    return page.evaluate("""async ({expression, timeout}) => {
        let timer;
        try { return await Promise.race([
            Promise.resolve().then(() => (0, eval)(expression)()),
            new Promise((_, reject) => { timer = setTimeout(() => reject(new Error("Operation timed out")), timeout); })
        ]); } finally { clearTimeout(timer); }
    }""", {"expression": expression, "timeout": timeout})


def animatic_ready(page, timeout):
    page.wait_for_function("""() => window.udAnimatic &&
        typeof udAnimatic.play === 'function' && typeof udAnimatic.settle === 'function'""", timeout=timeout)
    duration = page.evaluate("udAnimatic.duration")
    if isinstance(duration, bool) or not isinstance(duration, (int, float)) or not math.isfinite(duration) or duration <= 0:
        raise ValueError("window.udAnimatic.duration must be finite positive seconds")
    return duration


def webgl(page):
    return page.evaluate("""() => {
        const canvases = [...document.querySelectorAll('canvas')];
        const contexts = canvases.map(c => {
            const gl = c.getContext('webgl2') || c.getContext('webgl');
            return !!gl && !gl.isContextLost();
        });
        const probe = document.createElement('canvas');
        return {available: !!(probe.getContext('webgl2') || probe.getContext('webgl')),
                scene: contexts.some(Boolean), canvases: contexts};
    }""")


def report(out, name, value):
    out.mkdir(parents=True, exist_ok=True)
    (out / name).write_text(json.dumps(value, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Wrote {out / name}")
    return 0 if value.get("pass", True) else 1


def run(main):
    try:
        sys.exit(main())
    except Exception as error:
        print(f"error: {error}", file=sys.stderr)
        sys.exit(2)
