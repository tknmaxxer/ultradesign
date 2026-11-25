# /// script
# requires-python = ">=3.10"
# dependencies = []
# ///
"""Public CLI regression checks. Run: uv run --script tests/design-tools-smoke.py"""

import json
from pathlib import Path
import re
import shutil
import subprocess
import tempfile
import unittest


ROOT = Path(__file__).resolve().parents[1]
TOOLS = ROOT / "skills/ultradesign/scripts"


class DesignTools(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory(prefix="ultradesign-tools-")
        self.root = Path(self.directory.name)
        self.design = self.root / "DESIGN.md"
        self.css = self.root / "tokens.css"
        self.catalog = self.root / "catalog.json"

    def tearDown(self):
        self.directory.cleanup()

    def run_cli(self, name, *args, root=TOOLS, expected=0):
        result = subprocess.run(["uv", "run", "--script", str(root / name), *map(str, args)], capture_output=True, text=True)
        self.assertEqual(result.returncode, expected, f"{result.stdout}\n{result.stderr}")
        return result

    def generate(self, body, expected=0, extra=(), root=TOOLS):
        self.design.write_text("---\nname: Regression specimen\nversion: alpha\n" + body + "\n---\n## Overview\nSource only.\n")
        return self.run_cli("design-tokens", self.design, "--out", self.css, "--catalog", self.catalog, *extra, root=root, expected=expected)

    def test_nested_chain_composite_and_virtual_leaf_are_emitted(self):
        self.generate("""colors:
  neutral:
    "0": "#ffffff"
  field: "{colors.neutral.0}"
  on: "{colors.field}"
typography:
  body:
    fontFamily: Test Sans, sans-serif
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
  alias: "{typography.body}"
components:
  button:
    typography: "{typography.alias}"
    backgroundColor: "{colors.on}"
    size: "{components.button.typography.fontSize}"
  other:
    typography: "{components.button.typography}"
""")
        css = self.css.read_text()
        self.assertIn("--color-field: var(--color-neutral-0);", css)
        self.assertIn("--color-on: var(--color-field);", css)
        self.assertIn("--component-button-typography-font-size: var(--type-alias-font-size);", css)
        self.assertIn("--component-other-typography-font-size: var(--component-button-typography-font-size);", css)
        self.assertIn("--component-button-size: var(--component-button-typography-font-size);", css)
        leaves = {token["path"]: token for group in json.loads(self.catalog.read_text()).values() for token in group}
        self.assertEqual(leaves["components.other.typography.fontSize"]["resolved"], "14px")
        self.assertEqual(leaves["typography.body.lineHeight"]["resolved"], 1.5)
        self.assertTrue(all(token["css"] + ":" in css for token in leaves.values()))

    def test_check_is_read_only_and_reports_staleness(self):
        body = 'colors:\n  primary: "#112233"'
        self.generate(body)
        before = self.css.read_bytes(), self.catalog.read_bytes()
        self.run_cli("design-tokens", self.design, "--out", self.css, "--catalog", self.catalog, "--check")
        self.assertEqual(before, (self.css.read_bytes(), self.catalog.read_bytes()))
        self.css.write_text("outdated")
        self.run_cli("design-tokens", self.design, "--out", self.css, "--catalog", self.catalog, "--check", expected=1)
        self.assertEqual(self.css.read_text(), "outdated")
        missing = self.root / "missing" / "tokens.css"
        self.run_cli("design-tokens", self.design, "--out", missing, "--catalog", self.catalog, "--check", expected=1)
        self.assertFalse(missing.parent.exists())

    def test_motion_typescript_and_freshness(self):
        ts = self.root / "tokens.ts"
        body = """colors:
  base: "#112233"
  scene: "{colors.base}"
motion:
  duration:
    instant: 70ms
    quick: 110ms
    short: 150ms
    medium: 240ms
    long: 400ms
    signature: 0.7s
  easing:
    productive:
      standard: cubic-bezier(0.2, 0, 0, 1)
    expressive:
      standard: "{motion.easing.productive.standard}"
"""
        self.generate(body, extra=("--ts", ts))
        source = ts.read_text()
        data = json.loads(source.split("export const tokens = ", 1)[1].split(" as const;", 1)[0])
        self.assertEqual(data["motion"]["duration"]["signature"], 700)
        self.assertEqual(data["motion"]["duration"]["instant"], 70)
        self.assertEqual(data["colors"]["scene"], "#112233")
        self.assertEqual(data["motion"]["easing"]["expressive"]["standard"], "cubic-bezier(0.2, 0, 0, 1)")
        self.assertIn("--motion-duration-signature: 0.7s;", self.css.read_text())
        self.generate(body, extra=("--ts", ts, "--check"))
        ts.write_text("stale")
        self.generate(body, extra=("--ts", ts, "--check"), expected=1)
        self.assertEqual(ts.read_text(), "stale")
        ts.unlink()
        self.generate(body, extra=("--ts", ts, "--check"), expected=1)
        self.assertFalse(ts.exists())
        self.generate(body, extra=("--ts", self.design), expected=2)
        for invalid in (body.replace("    quick: 110ms\n", ""), body.replace("70ms", "70"),
                        body.replace("productive:", "other:")):
            self.generate(invalid, extra=("--ts", ts), expected=2)
            self.assertFalse(ts.exists())

    def test_invalid_inputs_leave_both_outputs_untouched(self):
        bad = [
            ('colors:\n  a: "{colors.absent}"', "Missing token"),
            ('colors:\n  a: "{colors.b}"\n  b: "{colors.a}"', "Cyclic token"),
            ('colors:\n  a: "#fff"\n  a: "#000"', "Duplicate YAML"),
            ('colors:\n  a: "#fff"\n  a-b: "#000"\n  aB: "#123"', "collision"),
            ('colors:\n  a: {b: "#fff"}\n  a-b: "#000"', "collision"),
            ('colors:\n  a: "{colors.a"', "Unsafe or malformed"),
            ('colors:\n  a: "red; background: url(https://example.org)"', "Unsafe"),
            ('colors:\n  a: null', "Expected"),
            ('colors:\n  a: true', "Expected"),
            ('colors:\n  a: ["#fff"]', "Expected"),
            ('colors:\n  a: "{name.value}"', "metadata"),
            ('colors: &loop\n  nested: *loop', "Cyclic YAML"),
            ('colors:\n  primary: "#fff"\nspacing:\n  bad: .nan', "finite"),
        ]
        for body, message in bad:
            with self.subTest(body=body):
                self.css.write_text("existing css")
                self.catalog.write_text("existing catalog")
                result = self.generate(body, expected=2)
                self.assertIn(message, result.stderr)
                self.assertEqual(self.css.read_text(), "existing css")
                self.assertEqual(self.catalog.read_text(), "existing catalog")

    def test_design_cannot_be_an_output(self):
        self.design.write_text("---\nname: Source\ncolors:\n  primary: red\n---\n")
        before = self.design.read_text()
        self.run_cli("design-tokens", self.design, "--out", self.design, "--catalog", self.catalog, expected=2)
        self.assertEqual(before, self.design.read_text())

    def test_portable_copy_and_checkout_front_door_match(self):
        copied = self.root / "copied-skill" / "scripts"
        copied.mkdir(parents=True)
        shutil.copyfile(TOOLS / "design-tokens", copied / "design-tokens")
        self.generate('colors:\n  primary: "#112233"', root=copied)
        expected = self.css.read_bytes(), self.catalog.read_bytes()
        self.run_cli("design-tokens", self.design, "--out", self.css, "--catalog", self.catalog, root=ROOT / "scripts")
        self.assertEqual(expected, (self.css.read_bytes(), self.catalog.read_bytes()))

    def test_lint_preserves_upstream_findings_and_enforces_policy(self):
        binary = self.root / "designmd"
        report = {"findings": [{"severity": "warning", "path": "colors", "message": "Original upstream wording"}],
                  "summary": {"errors": 0, "warnings": 1, "infos": 0}}
        binary.write_text("#!/usr/bin/env python3\nimport json, sys\n"
                          "assert sys.argv[1:4] == ['lint', '--format', 'json']\n"
                          f"print({json.dumps(json.dumps(report))})\n")
        binary.chmod(0o755)
        self.design.write_text("# Input owned by upstream\n")
        result = self.run_cli("design-lint", self.design, "--executable", binary)
        actual = json.loads(result.stdout)
        self.assertEqual(actual["findings"], report["findings"])
        self.assertTrue(actual["ultradesign"]["policyPassed"])
        self.run_cli("design-lint", self.design, "--executable", binary, "--fail-on", "warning", expected=1)
        self.run_cli("design-lint", self.design, "--executable", str(binary) + "-missing", expected=2)
        binary.write_text("#!/usr/bin/env python3\nprint('not JSON')\n")
        self.run_cli("design-lint", self.design, "--executable", binary, expected=2)

    def test_palette_dedup_provenance_ids_and_html_boundary(self):
        path = self.root / "observed.json"
        path.write_text(json.dumps([
            {"src": "Visible palette", "colors": ["#fff", "#123456"], "url": "https://example.org/observed"},
            {"src": "</script><img src=x onerror=alert(1)>", "colors": ["#FFFFFF", "#123456"]},
            {"src": "Different order", "colors": ["#123456", "#fff"]},
        ]))
        out = self.root / "board.html"
        self.run_cli("palette-board", "--input", path, "--out", out)
        html = out.read_text()
        self.assertNotIn("<img", html)
        data = json.loads(re.search(r'id="palette-manifest">(.*?)</script>', html, re.S)[1])
        self.assertEqual(len(data["palettes"]), 2)
        self.assertEqual(len(data["palettes"][0]["sources"]), 2)
        self.assertEqual(data["palettes"][0]["colors"], ["#FFFFFF", "#123456"])
        self.assertIn("page URL not recorded", html)
        self.assertIn('href="https://example.org/observed"', html)
        ids = [palette["id"] for palette in data["palettes"]]
        path.write_text(json.dumps({"palettes": list(reversed(json.loads(path.read_text())))}))
        self.run_cli("palette-board", "--input", path, "--out", out)
        data = json.loads(re.search(r'id="palette-manifest">(.*?)</script>', out.read_text(), re.S)[1])
        self.assertEqual(set(ids), {palette["id"] for palette in data["palettes"]})
        self.assertIn("#/palettes/0", out.read_text())

    def test_palette_rejects_bad_colors_and_executable_links(self):
        path = self.root / "palettes.json"
        out = self.root / "board.html"
        for row in ({"colors": ["red"]}, {"colors": ["#fff"], "url": "javascript:alert(1)"}):
            path.write_text(json.dumps([row]))
            self.run_cli("palette-board", "--input", path, "--out", out, expected=2)
            self.assertFalse(out.exists())


if __name__ == "__main__":
    unittest.main()
