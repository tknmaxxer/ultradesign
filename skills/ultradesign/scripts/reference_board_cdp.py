"""Opt-in, fresh-tab CDP observations of explicitly authorized public pages."""

from datetime import datetime, timezone
import ipaddress
import os
from pathlib import Path
import re
import shutil
import time
from urllib.parse import urldefrag, urlsplit

from reference_board_http import AccessError, digest


PACE = 3.05


def endpoint(value):
    try:
        parts = urlsplit(value)
        address = ipaddress.ip_address(parts.hostname or "")
        if (parts.scheme == "http" and address.is_loopback and parts.port
                and not parts.username and not parts.password
                and parts.path in {"", "/"} and not parts.query and not parts.fragment):
            return value.rstrip("/")
    except ValueError:
        pass
    raise ValueError("--cdp requires a literal loopback HTTP endpoint, e.g. http://127.0.0.1:9222")


def public_url(value):
    try:
        parts = urlsplit(value)
        host = (parts.hostname or "").rstrip(".").lower()
        if parts.scheme != "https" or not host or parts.username or parts.password:
            return False
        parts.port
        try:
            return ipaddress.ip_address(host).is_global
        except ValueError:
            return ("." in host and not host.endswith((".local", ".localhost", ".internal", ".test"))
                    and host != "localhost")
    except ValueError:
        return False


def registered_source(url, sources):
    host = urlsplit(url).hostname.lower().rstrip(".")
    for source in sources:
        routes = [source.get("browse_url"), source.get("entry")]
        hosts = set(source.get("hosts", []))
        for route in routes:
            for value in route.values() if isinstance(route, dict) else route if isinstance(route, list) else [route]:
                if isinstance(value, str):
                    hosts.add(urlsplit(value).hostname or "")
        if any(host == item or host.endswith("." + item.removeprefix("www."))
               or host.removeprefix("www.") == item.removeprefix("www.") for item in hosts if item):
            return source
    return None


def target_key(value):
    parts = urlsplit(value)
    return parts._replace(netloc=parts.netloc.lower().removesuffix(":443"),
                          path=parts.path or "/", fragment="").geturl()


def owner_target(url, sources):
    if not public_url(url):
        raise ValueError("--target-url requires an explicitly authorized product's public HTTPS URL")
    url = target_key(url)
    parts = urlsplit(url)
    source = registered_source(url, sources)
    if source:
        raise ValueError(f"{source['name']} is a reference source, not an owner target; its source policy still applies")
    if re.search(r"/(?:login|signin|sign-in|account|admin|oauth)(?:/|$)", parts.path, re.I):
        raise ValueError("--target-url is for the product screen, not account or authentication routes")
    return url, parts.netloc, {
        "kind": "target", "quality": "current", "hosts": [parts.netloc],
        "policy": url, "detail": "Explicitly authorized product screen; robots policy is not consulted for this URL.",
    }


def curated_source(url, title, sources, kind):
    if not public_url(url) or not title.strip() or len(title) > 160:
        raise ValueError("--candidate requires a public HTTPS URL and a 1–160 character title")
    url = urldefrag(url)[0]
    parts = urlsplit(url)
    source = registered_source(url, sources)
    if source:
        if not source.get("browser_public") or not re.search(source.get("paths", r"(?!)"), parts.path):
            raise ValueError(f"{source['name']}: automated candidate observation is not authorized; "
                             "use its manual link and --core-note when available")
        return url, source
    if re.search(r"/(?:login|signin|sign-in|account|admin|oauth)(?:/|$)", parts.path, re.I):
        raise ValueError("--candidate is for public study pages, not account or authentication routes")
    return url, {
        "id": "curated-" + digest(url)[:12], "name": title.strip(), "kind": kind,
        "method": "curated", "quality": "variable", "entry": url, "browse_url": url,
        "hosts": [parts.netloc.lower()], "policy": f"https://{parts.netloc}/robots.txt",
        "detail": "Owner-curated public first-party target; --candidate asserts permission to observe. "
                  "Not permission to collect third-party galleries or private account pages.",
    }


class PublicBrowser:
    """Borrow the default context; close only the fresh pages we create."""

    def __init__(self, address, images, platform):
        self.address = endpoint(address) if address else None
        self.images = Path(images)
        self.platform = platform
        self.last_visit = 0
        self.playwright = None
        self.context = None
        self.local_browser = None

    def __enter__(self):
        from playwright.sync_api import sync_playwright

        self.playwright = sync_playwright().start()
        try:
            if self.address:
                browser = self.playwright.chromium.connect_over_cdp(self.address, timeout=8000)
                self.context = browser.contexts[0]
            else:
                self.local_browser = self.playwright.chromium.launch(
                    executable_path=(os.environ.get("UD_CHROMIUM_PATH") or shutil.which("google-chrome")
                                     or shutil.which("chromium")),
                )
                self.context = self.local_browser.new_context(service_workers="block", accept_downloads=False)
        except Exception:
            self.close()
            raise
        return self

    def close(self):
        self.context = None
        try:
            if self.local_browser is not None:
                self.local_browser.close()
                self.local_browser = None
        finally:
            if self.playwright is not None:
                self.playwright.stop()
                self.playwright = None

    def __exit__(self, *args):
        self.close()

    def observe(self, url, source, cache, *, owned_targets=frozenset()):
        own_product = target_key(url) in owned_targets
        # The exception is limited to exact owner URLs. References still require robots permission.
        delay = 0 if own_product else cache.policy(url, source)
        time.sleep(max(0, self.last_visit + max(PACE, delay) - time.monotonic()))
        page = self.context.new_page()
        origin = urlsplit(url).netloc
        denied = []
        blocked = set()

        def read_only(event):
            request = event["request"]
            request_id = {"requestId": event["requestId"]}
            target = urlsplit(request["url"])
            document = event["resourceType"] == "Document"
            main_document = document and event.get("frameId", main_frame) == main_frame
            reason = None
            if request["method"] not in {"GET", "HEAD", "OPTIONS"}:
                reason = "non-read-only request"
            elif document and target.netloc != origin:
                reason = "cross-origin navigation"
            elif document and own_product and target_key(request["url"]) not in owned_targets:
                reason = "document is outside the explicit owner target allowlist"
            elif not public_url(request["url"]) and not (
                target.scheme in {"data", "blob"} and event["resourceType"] in {"Image", "Font", "Media"}
            ):
                reason = "non-public request"
            if reason:
                if main_document:
                    denied.append(f"Blocked {reason}")
                else:
                    blocked.add(f"{event['resourceType']}: {reason}")
            if denied or reason:
                session.send("Fetch.failRequest", request_id | {"errorReason": "Aborted"})
            elif document and not own_product:
                try:
                    cache.policy(request["url"], source)
                    session.send("Fetch.continueRequest", request_id)
                except AccessError as error:
                    denied.append(str(error))
                    session.send("Fetch.failRequest", request_id | {"errorReason": "Aborted"})
            else:
                session.send("Fetch.continueRequest", request_id)

        try:
            page.set_viewport_size({"width": 390 if self.platform == "mobile" else 1440, "height": 900})
            page.emulate_media(reduced_motion="reduce")
            page.route_web_socket("**/*", lambda socket: socket.close())
            session = self.context.new_cdp_session(page)
            session.send("Network.setBypassServiceWorker", {"bypass": True})
            main_frame = session.send("Page.getFrameTree")["frameTree"]["frame"]["id"]
            # Fetch pauses each redirect hop; Playwright route.continue_ only gates the first hop.
            session.on("Fetch.requestPaused", read_only)
            session.send("Fetch.enable", {"patterns": [{"urlPattern": "*", "requestStage": "Request"}]})
            page.on("popup", lambda popup: popup.close())
            page.on("dialog", lambda dialog: dialog.dismiss())
            page.on("download", lambda download: download.cancel())
            def note_response(response):
                if response.status in {401, 403, 429, 451}:
                    if urlsplit(response.url).netloc == origin:
                        denied.append(f"HTTP {response.status}: {origin}")
                    else:
                        blocked.add(f"Third-party resource: HTTP {response.status}")

            page.on("response", note_response)
            try:
                response = page.goto(url, wait_until="load", timeout=25000)
            except Exception as error:
                if denied:
                    raise AccessError("; ".join(dict.fromkeys(denied))) from error
                raise
            if denied:
                raise AccessError("; ".join(dict.fromkeys(denied)))
            if response is None or response.status >= 400:
                status = response.status if response else "unknown"
                raise AccessError(f"HTTP {status}: {url}; no retry or alternate route")
            if urlsplit(page.url).netloc != origin or not public_url(page.url):
                raise AccessError("Reference redirected outside the authorized public origin")
            title = page.title()
            heading = page.locator("h1").first
            h1 = heading.inner_text(timeout=2000)[:240] if heading.count() else ""
            if re.search(r"access denied|captcha|just a moment|sign in|log in|verify you are human|"
                         r"rate limit|quota exceeded|too many requests", title + " " + h1, re.I):
                raise AccessError(f"Access challenge or account wall: {url}; manual study only")
            self.images.mkdir(parents=True, exist_ok=True, mode=0o700)
            route = "cdp" if self.address else "local-chromium"
            image = self.images / f"{route}-{digest(url)}.png"
            # Capture the initial viewport/hero only; no scrolling, clicking, login or consent mutation.
            page.screenshot(path=str(image), full_page=False, animations="allow", timeout=12000)
            if denied:
                image.unlink(missing_ok=True)
                raise AccessError("; ".join(dict.fromkeys(denied)))
            return {
                "route": route, "requested_url": url, "observed_url": page.url,
                "page_title": title[:240], "heading": h1, "http_status": response.status,
                "observed_at": datetime.now(timezone.utc).isoformat(),
                "scope": ("new tab in owner context" if self.address else "isolated local Chromium")
                         + "; initial viewport; no credential export",
                "blocked_subresources": sorted(blocked),
            }, image
        finally:
            self.last_visit = time.monotonic()
            page.close()
