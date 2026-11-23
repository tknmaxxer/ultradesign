# /// script
# requires-python = ">=3.10"
# dependencies = ["playwright==1.65.1", "beautifulsoup4==4.13.4"]
# ///
"""Controlled local Chrome/HTTPS fixture; never connects to an owner's browser."""

from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from concurrent.futures import ThreadPoolExecutor
import hashlib
import json
import os
from pathlib import Path
import runpy
import ssl
import subprocess
import sys
import tempfile
import threading
import time
from types import SimpleNamespace
import unittest

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
SCRIPTS = ROOT / "skills/ultradesign/scripts"
sys.dont_write_bytecode = True
sys.path.insert(0, str(SCRIPTS))
from reference_board_cdp import PublicBrowser
from reference_board_http import AccessError


class Fixture(BaseHTTPRequestHandler):
    requests = []

    def log_message(self, *args):
        pass

    def do_GET(self):
        self.requests.append((self.path, self.headers.get("Cookie"), time.monotonic()))
        if self.path == "/quota":
            self.send_response(429)
            self.end_headers()
            return
        if self.path == "/redirect":
            self.send_response(302)
            self.send_header("Location", "https://else.example/denied")
            self.end_headers()
            return
        if self.path == "/owner-redirect":
            self.send_response(302)
            self.send_header("Location", "/unlisted")
            self.end_headers()
            return
        self.send_response(200)
        self.send_header("Content-Type", "text/html")
        self.end_headers()
        script = "<script>fetch('/write', {method:'POST'})</script>" if self.path == "/write-attempt" else ""
        self.wfile.write(("<!doctype html><title>Controlled hero</title>"
                         "<h1>A quiet research workspace</h1><p>Public fixture, no account.</p>" + script).encode())

    def do_POST(self):
        self.requests.append(("POST", None, time.monotonic()))
        self.send_response(500)
        self.end_headers()


class ControlledCDP(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.folder = tempfile.TemporaryDirectory()
        cls.root = Path(cls.folder.name)
        key, cert = cls.root / "key.pem", cls.root / "cert.pem"
        subprocess.run(["openssl", "req", "-x509", "-newkey", "rsa:2048", "-nodes", "-days", "1",
                        "-subj", "/CN=fixture.example", "-keyout", str(key), "-out", str(cert)],
                       check=True, capture_output=True)
        cls.server = ThreadingHTTPServer(("127.0.0.1", 0), Fixture)
        tls = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
        tls.load_cert_chain(cert, key)
        cls.server.socket = tls.wrap_socket(cls.server.socket, server_side=True)
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()
        cls.url = f"https://fixture.example:{cls.server.server_port}"
        cls.playwright = sync_playwright().start()
        cls.owner = cls.playwright.chromium.launch_persistent_context(
            str(cls.root / "chrome"), headless=True,
            executable_path=os.environ.get("UD_CHROMIUM_PATH", "/usr/bin/google-chrome"),
            args=["--remote-debugging-port=0", "--remote-debugging-address=127.0.0.1",
                  "--host-resolver-rules=MAP fixture.example 127.0.0.1", "--no-proxy-server",
                  "--ignore-certificate-errors"],
        )
        port = (cls.root / "chrome/DevToolsActivePort").read_text().splitlines()[0]
        cls.address = f"http://127.0.0.1:{port}"
        cls.sentinel = cls.owner.pages[0]
        cls.sentinel.goto("data:text/html,<title>Existing private tab</title><p>Untouched</p>")
        cls.owner.add_cookies([{"name": "owner-secret", "value": "never-read", "url": cls.url}])

    @classmethod
    def tearDownClass(cls):
        cls.owner.close()
        cls.playwright.stop()
        cls.server.shutdown()
        cls.server.server_close()
        cls.thread.join()
        cls.folder.cleanup()

    def test_fresh_tabs_use_existing_profile_without_touching_existing_tabs(self):
        policies = []
        cache = SimpleNamespace(policy=lambda url, source: policies.append(url) or 0)
        source = {"hosts": [self.url.split("//")[1]], "id": "fixture"}

        def observe():
            with PublicBrowser(self.address, self.root / "images", "web") as browser:
                first, image = browser.observe(self.url + "/hero", source, cache)
                second, _ = browser.observe(self.url + "/hero-two", source, cache)
                return first, image, second

        # The owner fixture already runs Playwright's sync loop on the main thread.
        with ThreadPoolExecutor(max_workers=1) as pool:
            first, image, second = pool.submit(observe).result()
        self.assertTrue(image.read_bytes().startswith(b"\x89PNG"))
        self.assertEqual(first["heading"], "A quiet research workspace")
        self.assertEqual(second["http_status"], 200)
        visits = [row for row in Fixture.requests if row[0] in {"/hero", "/hero-two"}]
        self.assertGreaterEqual(visits[-1][2] - visits[-2][2], 3)
        self.assertEqual(len(visits), 2)
        self.assertTrue(all(cookie == "owner-secret=never-read" for _, cookie, _ in visits))
        self.assertEqual(self.sentinel.title(), "Existing private tab")
        self.assertEqual(len(self.owner.pages), 1)
        self.assertTrue(any(url.endswith("/hero") for url in policies))

    def test_mutations_redirects_and_quota_are_not_bypassed(self):
        cache = SimpleNamespace(policy=lambda *args: 0)
        source = {"hosts": [self.url.split("//")[1]], "id": "fixture"}

        def observe(path):
            with PublicBrowser(self.address, self.root / "images", "web") as browser:
                return browser.observe(self.url + path, source, cache)

        with ThreadPoolExecutor(max_workers=1) as pool:
            observed, _ = pool.submit(observe, "/write-attempt").result()
        self.assertTrue(any("non-read-only" in entry for entry in observed["blocked_subresources"]))
        for path, reason in (("/redirect", "cross-origin"), ("/quota", "HTTP 429")):
            with self.subTest(path=path), ThreadPoolExecutor(max_workers=1) as pool:
                with self.assertRaisesRegex(AccessError, reason):
                    pool.submit(observe, path).result()
        self.assertNotIn("POST", [row[0] for row in Fixture.requests])
        self.assertEqual(self.sentinel.title(), "Existing private tab")

    def test_quota_marks_remaining_candidates_and_stops_adapter_fallback(self):
        module = runpy.run_path(str(SCRIPTS / "reference-board"))
        source = {"id": "fixture", "name": "Fixture", "kind": "screen", "method": "curated",
                  "quality": "variable", "policy": self.url + "/robots.txt", "detail": "Local fixture",
                  "hosts": [self.url.split("//")[1]]}
        cache = SimpleNamespace(policy=lambda *args: 0, images=self.root / "quota/images",
                                root=self.root / "quota")
        args = SimpleNamespace(cdp=self.address, targets=[], candidate=[
            (self.url + "/quota", "Quota", source), (self.url + "/unvisited", "Unvisited", source)],
            offline=False, platform="web", kind="screen")
        with ThreadPoolExecutor(max_workers=1) as pool:
            _, results, mode, hosts, quota = pool.submit(
                module["curated_candidates"], args, cache).result()
        self.assertTrue(quota)
        self.assertEqual(mode["state"], "quota_stopped")
        self.assertIn("fixture.example", hosts)
        self.assertEqual(results[1][0]["state"], "blocked")
        self.assertFalse(any(path == "/unvisited" for path, _, _ in Fixture.requests))

    def test_explicit_owner_target_ignores_malformed_robots_but_third_party_does_not(self):
        out = self.root / "owner-board"
        responses = out / ".reference-board-cache/responses"
        responses.mkdir(parents=True)
        cache_key = hashlib.sha256((self.url + "/robots.txt").encode()).hexdigest()[:32]
        (responses / cache_key).write_text("<html>not a robot policy</html>")
        sources = json.loads((SCRIPTS / "reference-board-sources.json").read_text())
        command = ["uv", "run", "--script", str(SCRIPTS / "reference-board"), "owner landing",
                   "--kind", "mood", "--platform", "web", "--out", str(out), "--name", "owners",
                   "--cdp", self.address, "--target-url", self.url + "/owner",
                   "--target-url", self.url + "/owner-redirect",
                   "--candidate", self.url + "/third-party", "External reference"]
        for source in sources:
            command.extend(["--exclude-source", source["id"]])
        # The fixture serves HTML at /robots.txt, reproducing the Cataly launch case.
        result = subprocess.run(command, capture_output=True, text=True, timeout=90, cwd=self.root,
                                env={**os.environ, "UV_OFFLINE": "1"})
        self.assertEqual(result.returncode, 0, result.stderr)
        board = json.loads((out / "owners.json").read_text())
        current, redirected = board["targets"]
        self.assertEqual(current["provenance"]["authorization"], "owner_target")
        self.assertTrue((out / current["image"]).is_file())
        self.assertFalse(current["selectable"])
        self.assertIsNone(current["number"])
        self.assertIn("allowlist", redirected["image_error"])
        # The redirect denial stops this origin. A fresh candidate-only run still enforces robots.
        paths = {row[0] for row in Fixture.requests}
        self.assertNotIn("/unlisted", paths)
        self.assertNotIn("/third-party", paths)

        target_start = command.index("--target-url")
        candidate_start = command.index("--candidate")
        external_only = command[:target_start] + command[candidate_start:] + ["--name", "external"]
        result = subprocess.run(external_only, capture_output=True, text=True, timeout=90, cwd=self.root,
                                env={**os.environ, "UV_OFFLINE": "1"})
        self.assertEqual(result.returncode, 0, result.stderr)
        external = json.loads((out / "external.json").read_text())["primary"][0]
        self.assertIsNone(external["image"])
        self.assertIn("Invalid robots.txt", external["image_error"])
        self.assertNotIn("/third-party", {row[0] for row in Fixture.requests})

    def test_actual_cli_manifest_and_local_board_reflow(self):
        out = self.root / "board"
        responses = out / ".reference-board-cache/responses"
        responses.mkdir(parents=True)
        robots = self.url + "/robots.txt"
        (responses / hashlib.sha256(robots.encode()).hexdigest()[:32]).write_text("User-agent: *\nAllow: /\n")
        sources = json.loads((SCRIPTS / "reference-board-sources.json").read_text())
        command = ["uv", "run", "--script", str(SCRIPTS / "reference-board"), "landing hero",
                   "--kind", "screen", "--platform", "web", "--out", str(out), "--name", "fixture",
                   "--cdp", self.address, "--candidate", self.url + "/cli-hero", "First-party landing hero",
                   "--screenshot"]
        for source in sources:
            command.extend(["--exclude-source", source["id"]])
        result = subprocess.run(command, capture_output=True, text=True, timeout=90, cwd=self.root,
                                env={**os.environ, "UV_OFFLINE": "1"})
        self.assertEqual(result.returncode, 0, result.stderr)
        payload = json.loads((out / "fixture.json").read_text())
        self.assertEqual(payload["counts"], {"primary": 1, "related": 0, "with_images": 1})
        card = payload["primary"][0]
        self.assertEqual(card["number"], 1)
        self.assertEqual(card["provenance"]["observation"], "observed")
        self.assertEqual(card["provenance"]["route"], "cdp")
        self.assertEqual(card["provenance"]["heading"], "A quiet research workspace")
        self.assertTrue((out / card["image"]).is_file())
        self.assertTrue((out / "fixture.png").is_file())
        for width in (390, 1440):
            context = self.owner.browser.new_context(viewport={"width": width, "height": 900})
            try:
                page = context.new_page()
                page.goto((out / "fixture.html").as_uri())
                self.assertFalse(page.evaluate("document.documentElement.scrollWidth > innerWidth"))
                self.assertEqual(page.locator("img").count(), 1)
                self.assertTrue(page.locator("img").evaluate("(img) => img.complete && img.naturalWidth > 0"))
                self.assertEqual(page.locator('[data-selectable="true"]').count(), 1)
                page.screenshot(path=str(out / f"preview-{width}.png"), full_page=True)
            finally:
                context.close()
        self.assertEqual(self.sentinel.title(), "Existing private tab")


if __name__ == "__main__":
    unittest.main()
