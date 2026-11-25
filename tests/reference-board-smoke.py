"""Exercise the actual reference-board CLI with a small, offline public-catalog fixture."""

import base64
import hashlib
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import time
import unittest
from unittest.mock import patch


ROOT = Path(__file__).resolve().parents[1]
BOARD = ROOT / "scripts/reference-board"
IMAGE = base64.b64decode(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aHwQAAAAASUVORK5CYII="
)


class LocalResponse:
    status = 200

    def __enter__(self):
        return self

    def __exit__(self, *args):
        return None

    def read(self, size):
        return b"public response"


class BoardSmoke(unittest.TestCase):
    def test_offline_board_caches_only_robot_allowed_previews(self):
        with tempfile.TemporaryDirectory() as folder:
            out = Path(folder)
            responses = out / ".reference-board-cache/responses"
            responses.mkdir(parents=True)

            def cached(url, body):
                key = hashlib.sha256(url.encode()).hexdigest()[:32]
                (responses / key).write_bytes(body.encode() if isinstance(body, str) else body)

            cached("https://daisyui.com/robots.txt", "User-agent: *\nAllow: /\n")
            cached(
                "https://daisyui.com/sitemap.xml",
                '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
                "<url><loc>https://daisyui.com/components/stat/</loc></url>"
                "<url><loc>https://daisyui.com/components/table/</loc></url></urlset>",
            )
            cached(
                "https://daisyui.com/components/stat/",
                '<meta property="og:image" content="https://img.daisyui.com/images/stat.png">',
            )
            cached(
                "https://daisyui.com/components/table/",
                '<meta property="og:image" content="https://img.daisyui.com/private/table.png">',
            )
            cached(
                "https://img.daisyui.com/robots.txt",
                "User-agent: *\nAllow: /\nDisallow: /private/*\nAllow: /private/about$\n",
            )
            cached("https://img.daisyui.com/images/stat.png", IMAGE)
            cached("https://img.daisyui.com/private/table.png", IMAGE)
            completed = subprocess.run(
                [str(BOARD), "stat table <draft>", "--platform", "web", "--kind", "component",
                 "--offline", "--name", "smoke", "--out", str(out)],
                env={**os.environ, "UV_OFFLINE": "1"}, capture_output=True, text=True, timeout=60,
            )
            self.assertEqual(completed.returncode, 0, completed.stderr)
            manifest = json.loads((out / "smoke.json").read_text())
            html = (out / "smoke.html").read_text()
            self.assertIn("stat table &lt;draft&gt;", html)
            self.assertNotIn("<draft>", html)
            self.assertEqual(manifest["counts"], {"primary": 2, "related": 0, "with_images": 1})
            stat, table = manifest["primary"]
            self.assertTrue(stat["selectable"])
            self.assertTrue(stat["id"].startswith("ref-"))
            self.assertIn(f'data-reference-id="{stat["id"]}"', html)
            self.assertEqual(stat["provenance"]["route"], "anonymous_public_adapter")
            self.assertEqual(stat["kind"], "component")
            self.assertEqual((out / stat["image"]).read_bytes(), IMAGE)
            self.assertIsNone(table["image"])
            self.assertIn("robots.txt disallows", table["image_error"])
            self.assertIn("Preview unavailable", html)
            sources = {source["id"]: source for source in manifest["sources"]}
            self.assertEqual(sources["mobbin"]["state"], "manual")
            self.assertEqual(sources["daisyui"]["preview_failures"], 1)
            self.assertEqual(sources["uiarc"]["state"], "failed")
            self.assertIn("No cached response:", sources["uiarc"]["errors"][0])
            self.assertEqual((out / "smoke.html").stat().st_mode & 0o777, 0o600)

            curated = subprocess.run(
                [*completed.args, "--exclude-url", "https://daisyui.com/components/table/#example"],
                env={**os.environ, "UV_OFFLINE": "1"}, capture_output=True, text=True, timeout=60,
            )
            self.assertEqual(curated.returncode, 0, curated.stderr)
            manifest = json.loads((out / "smoke.json").read_text())
            self.assertEqual([card["url"] for card in manifest["primary"]],
                             ["https://daisyui.com/components/stat/"])

    def test_core_browse_links_come_first_without_counting_as_candidates(self):
        with tempfile.TemporaryDirectory() as folder:
            out = Path(folder)
            completed = subprocess.run(
                [str(BOARD), "mobile task/list", "--platform", "mobile", "--kind", "screen",
                 "--offline", "--name", "smoke", "--out", str(out), "--exclude-source", "fdroid",
                 "--core-note", "dribbble", "Check <status> hierarchy."],
                env={**os.environ, "UV_OFFLINE": "1"}, capture_output=True, text=True, timeout=60,
            )
            self.assertEqual(completed.returncode, 0, completed.stderr)
            html = (out / "smoke.html").read_text()
            core = html[html.index('<section aria-labelledby="core-sources-title">'):
                        html.index('<section aria-labelledby="primary">')]
            self.assertIn('href="https://mobbin.com/browse/ios/apps"', core)
            self.assertIn('href="https://dribbble.com/search/mobile%20task%20list"', core)
            self.assertIn("Check &lt;status&gt; hierarchy.", core)
            self.assertLess(core.index("Dribbble"), core.index("Mobbin"))
            self.assertNotIn("F-Droid", core)
            manifest = json.loads((out / "smoke.json").read_text())
            self.assertEqual(manifest["counts"], {"primary": 0, "related": 0, "with_images": 0})
            sources = {source["id"]: source for source in manifest["sources"]}
            self.assertEqual(sources["fdroid"]["state"], "excluded")
            self.assertEqual(sources["mobbin"]["state"], "manual")
            self.assertEqual(sources["dribbble"]["study_note"], "Check <status> hierarchy.")

    def test_throttle_is_shared_across_outputs_and_source_origins(self):
        sys.dont_write_bytecode = True
        sys.path.insert(0, str(ROOT / "skills/ultradesign/scripts"))
        from reference_board_http import INTERVAL, PublicCache

        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            left = PublicCache(root / "left", False, root / "rate")
            right = PublicCache(root / "right", False, root / "rate")
            requests = []

            def open_url(request, timeout):
                requests.append(time.monotonic())
                return LocalResponse()

            with patch("reference_board_http.build_opener") as opener:
                opener.return_value.open.side_effect = open_url
                left.request("https://fixture.example/a", "fixture.example", "one-site", INTERVAL)
                right.request("https://cdn.fixture.example/b", "cdn.fixture.example", "one-site", INTERVAL)
            self.assertEqual(len(requests), 2)
            self.assertGreaterEqual(requests[1] - requests[0], 2.0)

    def test_portable_entry_defaults_to_working_directory_and_keeps_curated_ids(self):
        canonical = ROOT / "skills/ultradesign/scripts/reference-board"
        with tempfile.TemporaryDirectory() as folder:
            command = ["uv", "run", "--script", str(canonical), "landing hero", "--kind", "screen",
                       "--platform", "web", "--offline", "--name", "curated", "--cdp",
                       "http://127.0.0.1:9222", "--candidate", "https://example.com/", "Editorial hero"]
            result = subprocess.run(command, cwd=folder, capture_output=True, text=True, timeout=60,
                                    env={**os.environ, "UV_OFFLINE": "1"})
            self.assertEqual(result.returncode, 0, result.stderr)
            out = Path(folder) / ".reference-board"
            payload = json.loads((out / "curated.json").read_text())
            card = payload["primary"][0]
            self.assertEqual(card["title"], "Editorial hero")
            self.assertEqual(payload["cdp"]["state"], "offline")
            self.assertEqual(card["provenance"]["observation"], "not_observed")
            self.assertIn("Offline", card["image_error"])
            self.assertEqual((out / "curated.html").stat().st_mode & 0o777, 0o600)
            root_result = subprocess.run(
                [str(BOARD), *command[4:], "--out", str(Path(folder) / "root")],
                capture_output=True, text=True, timeout=60, env={**os.environ, "UV_OFFLINE": "1"})
            self.assertEqual(root_result.returncode, 0, root_result.stderr)
            root_payload = json.loads((Path(folder) / "root/curated.json").read_text())
            self.assertEqual(card["id"], root_payload["primary"][0]["id"])

    def test_restricted_sources_and_nonloopback_cdp_fail_before_network(self):
        for url in ("https://mobbin.com/browse/web/apps", "https://uibowl.io/landing",
                    "https://www.figma.com/community", "https://dribbble.com/shots/1",
                    "https://www.behance.net/gallery/1", "https://www.pinterest.com/pin/1",
                    "https://21st.dev/community/components", "https://sub.dribbble.com/shots/1"):
            with self.subTest(url=url):
                result = subprocess.run(
                    [str(BOARD), "hero", "--kind", "screen", "--platform", "web",
                     "--candidate", url, "Restricted", "--offline"],
                    capture_output=True, text=True, timeout=60,
                    env={**os.environ, "UV_OFFLINE": "1"})
                self.assertEqual(result.returncode, 2)
                self.assertIn("manual", result.stderr)
        target_result = subprocess.run(
            [str(BOARD), "hero", "--kind", "mood", "--platform", "web",
             "--target-url", "https://dribbble.com/shots/1", "--offline"],
            capture_output=True, text=True, timeout=60,
            env={**os.environ, "UV_OFFLINE": "1"})
        self.assertEqual(target_result.returncode, 2)
        self.assertIn("reference source, not an owner target", target_result.stderr)
        for address in ("https://127.0.0.1:9222", "http://192.168.0.1:9222",
                        "http://127.0.0.1:9222/json", "http://user@127.0.0.1:9222"):
            result = subprocess.run(
                [str(BOARD), "hero", "--kind", "screen", "--platform", "web", "--cdp", address],
                capture_output=True, text=True, timeout=60, env={**os.environ, "UV_OFFLINE": "1"})
            self.assertEqual(result.returncode, 2)
            self.assertIn("loopback", result.stderr)


if __name__ == "__main__":
    unittest.main()
