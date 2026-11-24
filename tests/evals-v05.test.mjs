import test from "node:test";
import assert from "node:assert/strict";
import { parseArgs } from "../evals/v05/run.mjs";

const base = ["--renderer", "app", "--url", "http://127.0.0.1:4391", "--out", "results"];

test("v0.5 eval stops at the hierarchy gate unless approved tables are supplied", () => {
  assert.equal(parseArgs(base).phase, "map");
  assert.deepEqual(parseArgs(base).selected.map(task => task.id), ["night_oncall", "landing_install"]);
  assert.throws(() => parseArgs([...base, "--phase", "generate"]), /--approved/);
  assert.equal(parseArgs([...base, "--phase", "generate", "--condition", "before"]).condition, "before");
  assert.equal(parseArgs([...base, "--phase", "generate", "--approved", "tables"]).approved, "tables");
  assert.throws(() => parseArgs([...base, "--task", "dashboard"]), /Unknown task/);
  assert.throws(() => parseArgs([...base, "--repairs", "-1"]), /non-negative/);
  assert.throws(() => parseArgs(["--renderer", "app"]), /Usage/);
});
