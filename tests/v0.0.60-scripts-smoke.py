# /// script
# requires-python = ">=3.10"
# dependencies = []
# ///
"""Local deterministic v0.0.60 visual-tool regressions.

Run: uv run --script tests/v0.0.60-scripts-smoke.py
Requires uv, Playwright Chromium and ffmpeg. No remote fixture dependencies.
"""

import copy
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
TOOLS = ROOT / "skills/ultradesign/scripts"
SECTION = {"id": "hero", "order": 1, "title": "Hero", "visualRole": "scene",
           "asset": "hero-canvas", "motion": "Reveal", "states": ["normal", "fallback"],
           "responsive": "Fill available width", "principles": ["One focal point"]}
SCENE = """<!doctype html><meta charset="utf-8"><style>
body{margin:0}section{height:400px;position:relative}canvas{width:100%;height:100%}
#fallback{display:none;width:100%;height:100%;background:navy;color:white}
</style><section data-ud-section="hero"><canvas></canvas><div id="fallback">Scene fallback</div></section>
<script>
const canvas=document.querySelector('canvas'), gl=canvas.getContext('webgl2') || canvas.getContext('webgl');
if(gl){gl.clearColor(.2,.4,.6,1);gl.clear(gl.COLOR_BUFFER_BIT);}
else {canvas.style.display='none';document.querySelector('#fallback').style.display='block';}
window.udAnimatic={duration:.3,play(){return new Promise(resolve=>{
    let start;
    function tick(t){start ??= t;if(t-start>=300)resolve();else requestAnimationFrame(tick);}
    requestAnimationFrame(tick);
});},settle(){document.body.dataset.settled='true';}};
</script>"""


class Scripts(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="ud-v0.0.60-")
        self.root = Path(self.temp.name)

    def tearDown(self):
        self.temp.cleanup()

    def write(self, name, value):
        path = self.root / name
        path.write_text(value if isinstance(value, str) else json.dumps(value), encoding="utf-8")
        return path

    def cli(self, name, *args, expected=0, env=None):
        result = subprocess.run(["uv", "run", "--script", str(TOOLS / name), *map(str, args)],
                                capture_output=True, text=True, timeout=180, env=env)
        self.assertEqual(result.returncode, expected, f"{name}\n{result.stdout}\n{result.stderr}")
        return result

    def test_help(self):
        for name in ["stylescape-board", "animatic", "text-only-lint", "originality-check", "scene-qa", "screen-map"]:
            with self.subTest(name=name):
                self.assertIn("usage:", self.cli(name, "--help").stdout)

    def test_text_coverage_roles_and_overlap(self):
        page = self.write("coverage.html", """<style>body{margin:0}section{height:400px;position:relative}
            .visual{position:absolute;width:50%;height:100%;background-image:linear-gradient(red,blue)}
            </style><section data-ud-section="hero"><div class="visual" data-ud-visual>
            <svg width="100%" height="100%"></svg></div><h1>Headline</h1></section>""")
        table = {"page": "expressive", "sections": [copy.deepcopy(SECTION)]}
        mapping = self.write("map.json", table)
        out = self.root / "lint"
        self.cli("text-only-lint", "--url", page.as_uri(), "--map", mapping, "--out", out)
        result = json.loads((out / "text-only.json").read_text())
        self.assertEqual([v["width"] for v in result["viewports"]], [390, 1440])
        for viewport in result["viewports"]:
            self.assertAlmostEqual(viewport["sections"][0]["visualShare"], .5)
        plain = self.write("plain.html", '<section data-ud-section="hero" style="height:400px">Text only</section>')
        self.cli("text-only-lint", "--url", plain.as_uri(), "--map", mapping, "--out", out, expected=1)
        self.assertEqual(json.loads((out / "text-only.json").read_text())["viewports"][0]["sections"][0]["visualShare"], 0)
        table["sections"][0]["visualRole"] = "typographic"
        self.cli("text-only-lint", "--url", plain.as_uri(), "--map", self.write("map.json", table), "--out", out, expected=1)
        table["sections"][0]["ownerException"] = "Owner requested a quiet text interlude"
        self.cli("text-only-lint", "--url", plain.as_uri(), "--map", self.write("map.json", table), "--out", out)
        table["page"] = "reading"
        del table["sections"][0]["ownerException"]
        self.cli("text-only-lint", "--url", plain.as_uri(), "--map", self.write("map.json", table), "--out", out)
        self.cli("text-only-lint", "--url", plain.as_uri(), "--map", mapping, "--out", out, "--min-share", "nan", expected=2)

    def test_originality_structure(self):
        base = '<style>body{margin:0}section{height:300px;margin:20px;width:80%}</style><section>A</section><section>B</section>'
        original = self.write("original.html", base)
        near = self.write("near.html", base.replace("20px", "21px").replace("A", "Other text"))
        distinct = self.write("distinct.html", '<style>body{margin:0;display:flex;gap:80px}section{width:200px;height:700px;margin:80px}</style><section>A</section><section>B</section>')
        out = self.root / "originality"
        self.cli("originality-check", "--url", original.as_uri(), "--reference", near.as_uri(), "--out", out, expected=1)
        flagged = json.loads((out / "originality.json").read_text())
        self.assertGreater(flagged["references"][0]["similarity"], .85)
        self.assertIn('src="page-0.png"', (out / "index.html").read_text())
        self.cli("originality-check", "--url", original.as_uri(), "--reference", distinct.as_uri(), "--out", out)
        self.assertLess(json.loads((out / "originality.json").read_text())["references"][0]["similarity"], .85)

    def test_animatic_scene_and_board(self):
        page = self.write("scene.html", SCENE)
        out = self.root / "animation"
        missing = subprocess.run([sys.executable, str(TOOLS / "animatic"), "--url", page.as_uri(), "--out", str(out)],
                                 env={**os.environ, "PATH": ""}, capture_output=True, text=True, timeout=10)
        self.assertEqual(missing.returncode, 2)
        self.assertIn("ffmpeg is required", missing.stderr)
        self.cli("animatic", "--url", page.as_uri(), "--out", out, "--widths", "390,640")
        record = json.loads((out / "animatic.json").read_text())
        for row in record["viewports"]:
            self.assertEqual(row["duration"], .3)
            self.assertTrue(row["webgl"]["scene"])
            for key in ("strip", "endState", "reducedMotion"):
                self.assertEqual((out / row[key]).read_bytes()[1:4], b"PNG")
            self.assertIn(b"ftyp", (out / row["video"]).read_bytes()[:32])
        bad = self.write("bad.html", SCENE.replace("duration:.3", "duration:-1"))
        self.cli("animatic", "--url", bad.as_uri(), "--out", out, "--widths", "390", expected=2)
        rejected = self.write("reject.html", SCENE.replace("let start;", "throw new Error('rejected animation'); let start;"))
        self.cli("animatic", "--url", rejected.as_uri(), "--out", out, "--widths", "390", expected=2)
        qa = self.root / "scene-qa"
        self.cli("scene-qa", "--url", page.as_uri(), "--out", qa, "--seconds", ".1", "--profile", "phone-390")
        evidence = json.loads((qa / "scene-qa.json").read_text())
        self.assertTrue(evidence["webgl"]["scene"])
        self.assertFalse(evidence["fallback"]["webgl"]["available"])
        self.assertGreater(evidence["sample"]["frames"], 0)
        self.assertEqual((qa / "fallback.png").read_bytes()[1:4], b"PNG")
        self.assertIn("lab", evidence["environment"])
        error_page = self.write("error.html", SCENE + "<script>console.error('fixture failure')</script>")
        self.cli("scene-qa", "--url", error_page.as_uri(), "--out", qa, "--seconds", ".1", expected=1)
        directions = {"recommended": "a", "directions": [
            {"id": key, "name": name, "reasons": ["Fits the brief"], "coreRules": ["One focal point"],
             "tiles": ["animation/end-390.png"], "screen": "animation/end-640.png",
             "motion": {"video": "animation/animatic-390.mp4", "strip": "animation/strip-390.png"}}
            for key, name in [("a", "Quiet scene"), ("b", "Also considered")]]}
        board = self.root / "board/index.html"
        self.cli("stylescape-board", "--input", self.write("directions.json", directions), "--out", board)
        self.assertIn("Recommended direction", board.read_text())
        self.assertIn("Also explored", board.read_text())
        manifest = json.loads((board.parent / "stylescape.json").read_text())
        for asset in manifest["assets"]:
            self.assertTrue((board.parent / asset["file"]).is_file())
        directions["directions"][0]["screen"] = "https://example.com/a.png"
        self.cli("stylescape-board", "--input", self.write("directions.json", directions), "--out", board, expected=2)

    def test_composition_map(self):
        table = {"page": "expressive", "sections": [copy.deepcopy(SECTION)]}
        out = self.root / "map/index.html"
        self.cli("screen-map", self.write("composition.json", table), "--out", out)
        for text in ("hero-canvas", "Reveal", "Visual role", "fallback", "Fill available width", "One focal point"):
            self.assertIn(text, out.read_text())
        table["sections"][0]["reference"] = {"crop": "old.png"}
        result = self.cli("screen-map", self.write("composition.json", table), "--out", out, expected=2)
        self.assertIn("reference.crop was removed", result.stderr)


if __name__ == "__main__":
    unittest.main(verbosity=2)
