# /// script
# requires-python = ">=3.10"
# dependencies = ["playwright==1.65.1"]
# ///
"""Capture a viewport matrix and flag screen-level QA signals."""

import argparse
import json
import os
from pathlib import Path
import subprocess
import sys
from urllib.parse import urlsplit


PROBE = r"""grid => {
    const root = document.documentElement;
    const offGrid = [];
    const contrast = [];
    let contrastSkipped = 0;
    const spacing = [
        "marginTop", "marginRight", "marginBottom", "marginLeft",
        "paddingTop", "paddingRight", "paddingBottom", "paddingLeft",
        "rowGap", "columnGap",
    ];
    const describe = el => el.localName + (el.id ? "#" + el.id : "");
    const styles = new Map();
    function computed(el) {
        if (!styles.has(el)) styles.set(el, getComputedStyle(el));
        return styles.get(el);
    }
    function rgba(value) {
        const match = value.match(/^rgba?\((.+)\)$/);
        if (!match) return null;
        const values = match[1].split(/,\s*/).map(Number);
        return values.every(Number.isFinite) ? [values[0], values[1], values[2], values[3] ?? 1] : null;
    }
    function over(top, bottom) {
        return bottom.map((v, i) => top[i] * top[3] + v * (1 - top[3]));
    }
    function background(el) {
        const layers = [];
        for (let p = el; p; p = p.parentElement) {
            const s = computed(p);
            if (s.opacity !== "1" || s.filter !== "none" || s.backdropFilter !== "none" ||
                s.mixBlendMode !== "normal" || s.maskImage !== "none") return null;
            if (layers.at(-1)?.[3] === 1) continue;
            if (s.backgroundImage !== "none" || s.backgroundClip === "text") return null;
            const color = rgba(s.backgroundColor);
            if (!color) return null;
            layers.push(color);
        }
        return layers.reverse().reduce((under, layer) => over(layer, under), [255, 255, 255]);
    }
    function luminance(rgb) {
        return rgb.map(v => {
            const x = v / 255;
            return x <= .04045 ? x / 12.92 : ((x + .055) / 1.055) ** 2.4;
        }).reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0);
    }
    for (const el of document.querySelectorAll("body, body *")) {
        const s = computed(el);
        if (!el.getClientRects().length || s.visibility !== "visible" ||
            s.opacity === "0") continue;
        if (grid) {
            for (const property of spacing) {
                const value = s[property];
                if (!value.endsWith("px")) continue;
                const px = Number.parseFloat(value);
                if (Math.abs(px - Math.round(px / grid) * grid) > .05) {
                    offGrid.push({ element: describe(el), property, value });
                }
            }
        }
        const text = Array.from(el.childNodes).filter(n => n.nodeType === Node.TEXT_NODE)
            .map(n => n.textContent.trim()).filter(Boolean).join(" ");
        if (!text) continue;
        const fg = rgba(s.color);
        const bg = background(el);
        if (!fg || !bg || s.textShadow !== "none") {
            contrastSkipped++;
            continue;
        }
        const [lighter, darker] = [luminance(over(fg, bg)), luminance(bg)].sort((a, b) => b - a);
        const ratio = (lighter + .05) / (darker + .05);
        const size = Number.parseFloat(s.fontSize);
        const minimum = size >= 24 || (size >= 18.667 && Number(s.fontWeight) >= 700) ? 3 : 4.5;
        if (ratio < minimum) {
            contrast.push({ element: describe(el), text: text.slice(0, 80), ratio: +ratio.toFixed(2), minimum });
        }
    }
    return {
        horizontalOverflowPx: Math.max(0, root.scrollWidth - root.clientWidth),
        offGrid, contrast, contrastSkipped,
    };
}"""


def positive(value):
    number = int(value)
    if number < 1:
        raise argparse.ArgumentTypeError("expected a positive integer")
    return number


def route_same_origin(context, url):
    origin = urlsplit(url)

    def guard(route):
        request = urlsplit(route.request.url)
        if request.scheme in {"data", "blob"} or (request.scheme, request.netloc) == (origin.scheme, origin.netloc):
            route.continue_()
        else:
            route.abort()

    context.route("**/*", guard)
    context.route_web_socket("**/*", lambda socket: socket.close())


def capture(args):
    from playwright.sync_api import sync_playwright

    widths = {390, 768, 1440, *args.width}
    for edge in args.breakpoint:
        widths.update(width for width in (edge - 1, edge + 1) if width > 0)
    args.out.mkdir(parents=True, exist_ok=True)
    results = []
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(executable_path=args.chromium_path)
        for width in sorted(widths):
            page = browser.new_page(
                viewport={"width": width, "height": args.height},
                device_scale_factor=1,
                reduced_motion=args.motion,
                service_workers="block" if args.local_only else "allow",
            )
            if args.local_only:
                route_same_origin(page.context, args.url)
            page_errors = []
            page.on("pageerror", lambda error: page_errors.append(str(error)))
            try:
                response = page.goto(args.url, wait_until="load", timeout=args.timeout)
                if response and not response.ok:
                    raise RuntimeError(f"HTTP {response.status} at {args.url}")
                if args.ready:
                    page.locator(args.ready).wait_for(state="visible", timeout=args.timeout)
                filename = f"{width}.png"
                height = page.evaluate("Math.max(innerHeight, document.documentElement.scrollHeight)")
                # Full-page screenshots otherwise grow horizontally to include a layout's overflow.
                page.screenshot(
                    path=args.out / filename, full_page=True, timeout=args.timeout,
                    clip={"x": 0, "y": 0, "width": width, "height": height},
                )
                results.append({
                    "width": width,
                    "height": args.height,
                    "screenshot": filename,
                    **page.evaluate(PROBE, args.grid),
                    "pageErrors": page_errors,
                })
            finally:
                page.close()
        browser.close()
    record = {"url": args.url, "spacingGrid": args.grid, "motion": args.motion, "viewports": results}
    (args.out / "checks.json").write_text(json.dumps(record, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Captured {len(results)} viewports in {args.out}")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--install-browser", action="store_true", help="install this Playwright version's Chromium")
    parser.add_argument("--url", help="route to capture (http, https, or file URL)")
    parser.add_argument("--out", type=Path, help="directory for PNGs and checks.json")
    parser.add_argument("--width", type=positive, action="append", default=[], help="add a width in CSS pixels")
    parser.add_argument("--breakpoint", type=positive, action="append", default=[], help="capture one pixel on either side")
    parser.add_argument("--height", type=positive, default=900)
    parser.add_argument("--grid", type=positive, help="report computed margin, padding and gap off a spacing increment")
    parser.add_argument("--chromium-path", default=os.environ.get("UD_CHROMIUM_PATH"))
    parser.add_argument("--ready", help="CSS selector to wait for before capture")
    parser.add_argument("--local-only", action="store_true", help="allow same-origin, data, and blob resources only")
    parser.add_argument("--motion", choices=["no-preference", "reduce"], default="no-preference")
    parser.add_argument("--timeout", type=positive, default=30000, help="per-action timeout in milliseconds")
    args = parser.parse_args()
    if args.install_browser:
        if args.url or args.out:
            parser.error("--install-browser is separate from capture")
        return subprocess.call([sys.executable, "-m", "playwright", "install", "chromium"])
    if not args.url or urlsplit(args.url).scheme not in {"http", "https", "file"} or not args.out:
        parser.error("capture requires --url (http, https, or file URL) and --out")
    if args.local_only and (urlsplit(args.url).scheme == "file" or urlsplit(args.url).hostname not in {"localhost", "127.0.0.1", "::1"}):
        parser.error("--local-only requires an HTTP(S) loopback URL")
    capture(args)
    return 0


if __name__ == "__main__":
    sys.exit(main())
