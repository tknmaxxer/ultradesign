import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { once } from "node:events";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const script = fileURLToPath(new URL("../skills/ultradesign/scripts/visual-qa.py", import.meta.url));
const dir = mkdtempSync(join(tmpdir(), "ud-visual-qa-"));
let foreignRequests = 0;
const foreign = createServer((_req, res) => { foreignRequests++; res.end(); });
let local;
try {
  foreign.listen(0, "127.0.0.1");
  await once(foreign, "listening");
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>QA fixture</title>
    <style>
      body { background: #fff; color: #000; margin: 0; padding: 8px }
      p { margin: 0; padding: 4px }
      #off-grid { padding-left: 5px; color: #999 }
      #unmeasured { background-image: linear-gradient(white, black) }
      @media (max-width: 640px) { #panel { width: 700px } }
    </style></head><body><main id="panel">
      <p id="off-grid">Needs a contrast check</p>
      <p id="unmeasured">Gradient is not a flat background</p>
      <p id="okay">This text passes the contrast check.</p>
      <img alt="" src="http://127.0.0.1:${foreign.address().port}/foreign.png">
    </main></body></html>`;
  local = createServer((_req, res) => {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.end(html);
  });
  local.listen(0, "127.0.0.1");
  await once(local, "listening");
  const out = join(dir, "captures");
  const { stdout } = await promisify(execFile)("uv", [
    "run", "--script", script, "--url", `http://127.0.0.1:${local.address().port}/`, "--out", out, "--local-only",
    "--breakpoint", "640", "--grid", "4", "--ready", "#panel",
  ]);
  process.stdout.write(stdout);
  assert.equal(foreignRequests, 0);
  const { spacingGrid, viewports } = JSON.parse(readFileSync(join(out, "checks.json"), "utf8"));
  assert.equal(spacingGrid, 4);
  assert.deepEqual(viewports.map(({ width }) => width), [390, 639, 641, 768, 1440]);
  for (const viewport of viewports) {
    assert.equal(viewport.horizontalOverflowPx > 0, viewport.width < 640, `overflow at ${viewport.width}`);
    assert.deepEqual(viewport.offGrid, [{ element: "p#off-grid", property: "paddingLeft", value: "5px" }]);
    assert.deepEqual(viewport.contrast.map(({ element, minimum }) => [element, minimum]), [["p#off-grid", 4.5]]);
    assert.equal(viewport.contrastSkipped, 1);
    assert.deepEqual(viewport.pageErrors, []);
    const png = readFileSync(join(out, viewport.screenshot));
    assert.equal(png.subarray(1, 4).toString(), "PNG");
    assert.equal(png.readUInt32BE(16), viewport.width);
  }
  console.log("Visual QA smoke passed: 3 defaults + both breakpoint sides, PNG dimensions, overflow, spacing and contrast.");
} finally {
  local?.close();
  foreign.close();
  rmSync(dir, { recursive: true, force: true });
}
