# /// script
# requires-python = ">=3.10"
# dependencies = []
# ///
"""A2UI validator, hierarchy check and screen-map regressions. Run: uv run --script tests/a2ui-tools-smoke.py
hierarchy-check needs Playwright Chromium (uv run --script skills/ultradesign/scripts/visual-qa.py --install-browser)."""

import copy
import json
from pathlib import Path
import subprocess
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
TOOLS = ROOT / "skills/ultradesign/scripts"
CATALOG_ID = "https://example.test/a2ui/handoff/v1/catalog.json"
BOUND = {"$ref": "#/$defs/BoundText"}
ROLE = lambda role: {"extensions": {"ud_role": role}}

CATALOG = {
    "$schema": "https://json-schema.org/draft/2020-12/schema", "$id": CATALOG_ID, "catalogId": CATALOG_ID,
    "protocolVersion": "1.0", "title": "Handoff fixture",
    "components": {
        "Frame": {"type": "object", "allowedParents": ["Surface"], "metadata": ROLE("frame"),
                  "properties": {"component": {"const": "Frame"}, "layout": {"enum": ["stack", "lead_aside"]},
                                 "children": {"$ref": "common_types.json#/$defs/ChildList"}},
                  "required": ["component", "layout", "children"]},
        "Line": {"type": "object", "allowedParents": ["Frame"], "metadata": ROLE("content"),
                 "properties": {"component": {"const": "Line"}, "text": BOUND, "emphasis": {"enum": ["p1", "p2", "p3"]},
                                "at": {"oneOf": [{"type": "string", "format": "date-time"}, {"$ref": "common_types.json#/$defs/DataBinding"}]}},
                 "required": ["component", "text", "emphasis"]},
        "Button": {"type": "object", "allowedParents": ["Frame"], "metadata": ROLE("action"),
                   "properties": {"component": {"const": "Button"}, "label": BOUND,
                                  "emphasis": {"enum": ["primary", "secondary"]},
                                  "action": {"$ref": "common_types.json#/$defs/Action"}},
                   "required": ["component", "label", "emphasis", "action"]},
    },
    "functions": {},
    "$defs": {
        "anyComponent": {"oneOf": [{"$ref": "#/components/Frame"}, {"$ref": "#/components/Line"}, {"$ref": "#/components/Button"}]},
        "anyFunction": {"not": {}},
        "BoundText": {"oneOf": [{"type": "string"}, {"$ref": "common_types.json#/$defs/DataBinding"}]},
    },
}
SCREEN = {"version": "1.0", "createSurface": {
    "surfaceId": "handoff", "catalogId": CATALOG_ID,
    "components": [
        {"id": "root", "component": "Frame", "layout": "stack", "children": ["title", "retry", "confirm"]},
        {"id": "title", "component": "Line", "text": "Night handoff", "emphasis": "p3"},
        {"id": "retry", "component": "Line", "text": {"@path": "/retry"}, "emphasis": "p1"},
        {"id": "confirm", "component": "Button", "label": "Confirm", "emphasis": "primary",
         "action": {"event": {"name": "confirm", "context": {}}}},
    ],
    "dataModel": {"retry": "Recheck 2 queue-replay retries at 22:00 KST"},
}}
TABLE = {"screen": "handoff", "frame": "stack", "primaryAction": "confirm", "items": [
    {"id": "retry", "priority": 1, "says": "Retry recheck at 22:00", "words": 10},
    {"id": "title", "priority": 3, "says": "Screen name", "words": 3},
    {"id": "confirm", "priority": "action", "says": "Confirm handoff", "words": 2},
]}
PAGE = """<!doctype html><meta charset="utf-8"><style>body{{margin:0;font-family:sans-serif}}
.p1{{font-size:{p1}px}}.p3{{font-size:13px}}button{{font-size:15px;margin-top:{gap}px}}</style>
<header>Product</header><main data-ud-surface="handoff">
<p data-ud-id="title" data-ud-component="Line" data-ud-emphasis="p3" class="p3">Night handoff</p>
<p data-ud-id="retry" data-ud-component="Line" data-ud-emphasis="p1" class="p1">Recheck 2 retries at 22:00 KST</p>
<button data-ud-id="confirm" data-ud-component="Button" data-ud-emphasis="{button}">Confirm</button></main>"""


class A2uiTools(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory(prefix="ultradesign-a2ui-")
        self.root = Path(self.directory.name)

    def tearDown(self):
        self.directory.cleanup()

    def write(self, name, value):
        path = self.root / name
        path.write_text(value if isinstance(value, str) else json.dumps(value, ensure_ascii=False), encoding="utf-8")
        return path

    def run_cli(self, name, *args, expected=0):
        result = subprocess.run(["uv", "run", "--script", str(TOOLS / name), *map(str, args)], capture_output=True, text=True)
        self.assertEqual(result.returncode, expected, f"{result.stdout}\n{result.stderr}")
        return result.stdout

    def validate(self, screen=SCREEN, table=TABLE, catalog=CATALOG, expected=0):
        args = ["--catalog", self.write("catalog.json", catalog), "--screen", self.write("screen.json", screen), "--json"]
        if table is not None:
            args += ["--hierarchy", self.write("hierarchy.json", table)]
        return json.loads(self.run_cli("a2ui-validate", *args, expected=expected))["findings"]

    def mutate(self, change):
        screen = copy.deepcopy(SCREEN)
        change(screen["createSurface"])
        return screen

    def test_valid_screen_and_table_pass(self):
        self.assertEqual(self.validate(), [])

    def test_renderer_identifier_rule_rejects_hyphenated_ids_the_schema_allows(self):
        def hyphen(surface):
            surface["components"][2]["id"] = "queue-replay"
            surface["components"][0]["children"][1] = "queue-replay"
        findings = self.validate(self.mutate(hyphen), table=None, expected=1)
        self.assertEqual([f["kind"] for f in findings], ["identifier"])

    def test_schema_structure_and_binding_findings(self):
        cases = {
            "screen-schema": lambda s: s["components"][1].update(color="#f00"),
            "binding": lambda s: s["components"][2].update(text={"@path": "/missing"}),
            "structure": lambda s: s["components"][0]["children"].append("absent"),
        }
        renderer_rules = {
            "a data path written as text": lambda s: s["components"][1].update(text="@/title"),
            "is not a 'date-time'": lambda s: s["components"][1].update(at="20:42 KST"),
            "not a valid date-time": lambda s: (s["components"][1].update(at={"@path": "/at"}), s["dataModel"].update(at="21:00")),
            "Line has no property 'size'": lambda s: s["components"][1].update(size=99),
        }
        for message, change in renderer_rules.items():
            with self.subTest(message):
                self.assertIn(message, json.dumps(self.validate(self.mutate(change), table=None, expected=1)))
        self.assertEqual(self.validate(self.mutate(lambda s: s["components"][1].update(at="2026-11-24T21:00:00+09:00")), table=None), [])
        for kind, change in cases.items():
            with self.subTest(kind):
                self.assertIn(kind, {f["kind"] for f in self.validate(self.mutate(change), table=None, expected=1)})
        unknown = self.validate(self.mutate(lambda s: s["components"][1].update(component="Html")), table=None, expected=1)
        self.assertIn("Unknown component 'Html'", json.dumps(unknown))

    def test_hierarchy_table_enforces_emphasis_primary_frame_and_copy(self):
        cases = [
            (lambda s: s["components"][1].update(emphasis="p1"), "Emphasis 'p1' should be 'p3'"),
            (lambda s: s["components"][3].update(emphasis="secondary"), "should be 'primary'"),
            (lambda s: s["components"][0].update(layout="lead_aside"), "approved frame"),
            (lambda s: s["dataModel"].update(retry="one two three four five six seven eight nine ten eleven"), "budget of 10"),
            (lambda s: (s["components"].append({"id": "extra", "component": "Line", "text": "x", "emphasis": "p2"}),
                        s["components"][0]["children"].append("extra")), "not in the approved hierarchy table"),
        ]
        for change, message in cases:
            with self.subTest(message):
                self.assertIn(message, json.dumps(self.validate(self.mutate(change), expected=1)))
        two_p1 = copy.deepcopy(TABLE)
        two_p1["items"][1]["priority"] = 1
        self.assertIn("exactly one P1", json.dumps(self.validate(table=two_p1, expected=1)))

    def test_catalog_conventions(self):
        catalog = copy.deepcopy(CATALOG)
        catalog["components"]["Line"]["properties"]["fontSize"] = {"type": "number"}
        del catalog["components"]["Button"]["metadata"]
        catalog["components"]["Frame"]["properties"]["href"] = {"type": "string"}
        catalog["components"]["Frame"]["properties"]["children"] = {"type": "array", "items": {"type": "string"}}
        findings = json.dumps(self.validate(catalog=catalog, table=None, expected=1))
        for message in ("Style lives in the renderer", "ud_role", "enum of approved targets", "ChildList"):
            self.assertIn(message, findings)

    def test_screen_map_board(self):
        crop = self.root / "crop.png"
        crop.write_bytes(bytes.fromhex("89504e470d0a1a0a"))
        table = {**TABLE, "order": 2, "title": "Handoff", "reference": {"url": "https://example.test/ref", "crop": "crop.png"}, "motion": "None"}
        board = self.root / "map" / "index.html"
        self.run_cli("screen-map", self.write("handoff.json", table), "--out", board)
        text = board.read_text()
        self.assertIn("P1", text)
        self.assertIn("Recheck", json.dumps(SCREEN))
        self.assertIn('src="map-assets/01.png"', text)
        self.assertTrue((board.parent / "map-assets" / "01.png").is_file())

    def test_hierarchy_check_on_render(self):
        table = self.write("hierarchy.json", TABLE)
        good = self.write("good.html", PAGE.format(p1=40, gap=16, button="primary"))
        self.run_cli("hierarchy-check", "--url", good.as_uri(), "--hierarchy", table, "--out", self.root / "good",
                     "--width", 390, "--width", 1440)
        cases = {
            "does not dominate": PAGE.format(p1=12, gap=16, button="primary"),
            "outside the first viewport": PAGE.format(p1=40, gap=1200, button="primary"),
            "exactly one primary action": PAGE.format(p1=40, gap=16, button="secondary"),
        }
        for message, page in cases.items():
            with self.subTest(message):
                out = self.run_cli("hierarchy-check", "--url", self.write("bad.html", page).as_uri(), "--hierarchy", table,
                                   "--out", self.root / "bad", "--width", 390, expected=1)
                self.assertIn(message, out)


if __name__ == "__main__":
    unittest.main()
