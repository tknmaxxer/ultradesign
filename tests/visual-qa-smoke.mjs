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
const reference = fileURLToPath(new URL("../skills/ultradesign/scripts/reference-capture.py", import.meta.url));
const probe = fileURLToPath(new URL("../evals/probe.py", import.meta.url));
const dir = mkdtempSync(join(tmpdir(), "ud-visual-qa-"));
let foreignRequests = 0;
const foreign = createServer((_req, res) => { foreignRequests++; res.end(); });
let local;
try {
  foreign.listen(0, "127.0.0.1");
  await once(foreign, "listening");
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>QA fixture</title>
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
  const mobile = `<!doctype html><button onclick="dialog.showModal()">Add task</button>
    <dialog id="dialog"><button type="button" aria-label="Close add task form" onclick="dialog.close()">×</button>
    <form><label>Task title <input required></label><button type="submit">Add task</button></form></dialog>
    <p id="saved"></p><script>document.querySelector("form").onsubmit = event => {
      event.preventDefault(); saved.textContent = document.querySelector("input").value; dialog.close();
    };</script>`;
  local = createServer((req, res) => {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.end(req.url === "/mobile" ? mobile : html);
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
  const referenceOut = join(dir, "reference");
  const referenceUrl = `http://127.0.0.1:${local.address().port}/`;
  const referenceArgs = ["run", "--script", reference, "--url", referenceUrl, "--out", referenceOut,
    "--region", "task=#panel", "--region", "detail=#okay",
    "--pattern", "Aligned rows", "--why", "Scan matching edges", "--adapt", "Use the project text", "--ready", "#okay"];
  await assert.rejects(promisify(execFile)("uv", referenceArgs), /use a public HTTPS URL/);
  await promisify(execFile)("uv", [...referenceArgs, "--local"]);
  assert.equal(foreignRequests, 0);
  const note = readFileSync(join(referenceOut, "pattern.md"), "utf8");
  assert.ok(note.includes(referenceUrl));
  assert.match(note, /## Pattern\n\nAligned rows[\s\S]*## Why it works\n\nScan matching edges[\s\S]*## How to adapt\n\nUse the project text/);
  for (const width of [390, 768, 1440]) {
    for (const name of ["page", "task", "detail"]) {
      const file = `${name}-${width}.png`;
      assert.ok(note.includes(`[${file}](${file})`), `missing note link for ${file}`);
      const png = readFileSync(join(referenceOut, file));
      assert.equal(png.subarray(1, 4).toString(), "PNG", file);
      if (name === "page") assert.equal(png.readUInt32BE(16), width);
    }
  }
  console.log("Reference capture smoke passed: three full-page and six region PNGs with linked pattern notes.");
  const behavior = join(dir, "mobile-probe.json");
  await promisify(execFile)("uv", ["run", "--script", probe, "--url", new URL("mobile", referenceUrl).href,
    "--task", "mobile", "--out", behavior]);
  assert.equal(JSON.parse(readFileSync(behavior, "utf8")).primaryActionPassed, true);
  console.log("Mobile action probe smoke passed: submits the task without selecting the close control.");
} finally {
  local?.close();
  foreign.close();
  rmSync(dir, { recursive: true, force: true });
}
