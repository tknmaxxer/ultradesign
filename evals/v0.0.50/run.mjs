#!/usr/bin/env node
// v0.0.50 hierarchy evaluation: the same brief and catalog, generated twice.
//   before = the v0.0.40 A2UI flow: brief + catalog, validator repair loop, render.
//   after  = v0.0.50: owner-gated hierarchy table, generation against it, validator with --hierarchy,
//            render, hierarchy-check, and repair from its findings.
// Phase "map" drafts the hierarchy tables and stops at the gate. A person reviews/edits them and
// passes the approved directory to phase "generate". Nothing is auto-approved.
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { generatorSystem, tasks } from "./tasks.mjs";

const repo = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const skill = join(repo, "skills/ultradesign");
const usage = `Usage: node evals/v0.0.50/run.mjs --renderer DIR --url http://127.0.0.1:PORT --out NEW_DIR
  --phase map|generate  map drafts hierarchy tables for review; generate needs --approved DIR (default: map)
  --approved DIR        reviewed hierarchy tables named <task>.json
  --task ID[,ID]        night_oncall, landing_install (default: both)
  --condition before|after|both  (generate phase; default both)
  --model provider/model (default openai-codex/gpt-6.2-sol)  --thinking LEVEL (default low)
  --repairs N           repair rounds per check (default 2)
Runs the subscription model through the local omp CLI with tools, skills, rules and context files off.`;

export function parseArgs(argv) {
  const options = { phase: "map", task: tasks.map(task => task.id).join(","), condition: "both",
    model: "openai-codex/gpt-6.2-sol", thinking: "low", repairs: "2" };
  for (let index = 0; index < argv.length; index++) {
    const key = argv[index];
    if (key === "--help") throw new Error(usage);
    if (!key.startsWith("--") || index + 1 >= argv.length) throw new Error(usage);
    options[key.slice(2)] = argv[++index];
  }
  for (const required of ["renderer", "url", "out"]) if (!options[required]) throw new Error(usage);
  if (!["map", "generate"].includes(options.phase)) throw new Error("--phase is map or generate.");
  if (options.phase === "generate" && options.condition !== "before" && !options.approved) {
    throw new Error("The after condition needs --approved: tables pass the hierarchy gate before generation.");
  }
  if (!["before", "after", "both"].includes(options.condition)) throw new Error("--condition is before, after or both.");
  options.selected = options.task.split(",").map(id => {
    const task = tasks.find(candidate => candidate.id === id);
    if (!task) throw new Error(`Unknown task ${id}.`);
    return task;
  });
  options.repairs = Number(options.repairs);
  if (!Number.isInteger(options.repairs) || options.repairs < 0) throw new Error("--repairs is a non-negative integer.");
  return options;
}

function exec(command, args, input) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(command, args, { stdio: ["pipe", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", data => { stdout += data; });
    child.stderr.on("data", data => { stderr += data; });
    child.on("error", reject);
    child.on("close", code => resolvePromise({ code, stdout, stderr }));
    child.stdin.end(input ?? "");
  });
}

async function ask(options, dir, name, prompt) {
  const promptFile = join(dir, `${name}.prompt.txt`);
  await writeFile(promptFile, prompt);
  const { code, stdout, stderr } = await exec("omp", ["--print", "--mode", "json", "--model", options.model,
    "--thinking", options.thinking, "--service-tier", "none", "--no-session", "--no-context-files", "--no-tools",
    "--no-skills", "--no-rules", "--no-extensions", "--no-title", "--system-prompt", generatorSystem, `@${promptFile}`]);
  await writeFile(join(dir, `${name}.jsonl`), stdout);
  const message = stdout.trim().split("\n").map(line => { try { return JSON.parse(line); } catch { return null; } })
    .filter(event => event?.type === "message_end" && event.message?.role === "assistant").at(-1)?.message;
  if (code !== 0 || !message || message.stopReason === "error") {
    // Quota or auth failures stop the run; never retry on another model or account.
    throw new Error(`Model call ${name} failed (exit ${code}): ${(message?.errorMessage ?? stderr).slice(0, 400)}`);
  }
  return message.content.filter(part => part.type === "text").map(part => part.text).join("");
}

function json(text) {
  const body = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
  const start = body.indexOf("{");
  const end = body.lastIndexOf("}");
  if (start < 0 || end < start) throw new Error("No JSON object in the model response.");
  return JSON.parse(body.slice(start, end + 1));
}

async function validate(catalog, screenFile, tableFile) {
  const args = ["run", "--script", join(skill, "scripts/a2ui-validate"), "--catalog", catalog, "--screen", screenFile, "--json"];
  if (tableFile) args.push("--hierarchy", tableFile);
  const { code, stdout, stderr } = await exec("uv", args);
  if (code === 2 || !stdout.trim()) throw new Error(`a2ui-validate failed: ${stderr.slice(0, 300)}`);
  return JSON.parse(stdout).findings;
}

async function check(options, name, screen, out, tableFile) {
  await writeFile(join(options.renderer, "public/screens", `${name}.json`), JSON.stringify(screen, null, 2));
  const args = ["run", "--script", join(skill, "scripts/hierarchy-check"), "--url", `${options.url}/?screen=${name}`, "--out", out];
  if (tableFile) args.push("--hierarchy", tableFile);
  const { code, stderr } = await exec("uv", args);
  if (code === 2 || !existsSync(join(out, "hierarchy.json"))) throw new Error(`hierarchy-check failed: ${stderr.slice(0, 300)}`);
  return JSON.parse(await readFile(join(out, "hierarchy.json"), "utf8"));
}

const fence = (label, value) => `\n<${label}>\n${typeof value === "string" ? value : JSON.stringify(value, null, 2)}\n</${label}>\n`;

async function generateValid(options, dir, prefix, task, catalogFile, prompt, tableFile) {
  let text = await ask(options, dir, `${prefix}-0`, prompt);
  let screen;
  let findings;
  const attempts = [];
  for (let round = 0; ; round++) {
    const screenFile = join(dir, `${prefix}-${round}.screen.json`);
    try {
      screen = json(text);
      await writeFile(screenFile, JSON.stringify(screen, null, 2));
      findings = await validate(catalogFile, screenFile, tableFile);
    } catch (error) {
      findings = [{ kind: "parse", where: "response", message: error.message }];
    }
    attempts.push({ round, findings });
    if (!findings.length || round >= options.repairs) break;
    text = await ask(options, dir, `${prefix}-${round + 1}`, `${prompt}${fence("previous_response", text)}`
      + `\nThe validator rejected the previous response. Fix every finding below and return the complete corrected JSON.${fence("findings", findings)}`);
  }
  return { screen, findings, attempts };
}

async function before(options, task, dir, catalog, catalogFile) {
  const prompt = `${fence("catalog", catalog)}${fence("brief", task.brief)}\nUse surfaceId "${task.surfaceId}".`;
  const generated = await generateValid(options, dir, "generate", task, catalogFile, prompt);
  const render = await check(options, `${task.id}_before`, generated.screen, join(dir, "render"));
  return { validatorAttempts: generated.attempts, render };
}

async function after(options, task, dir, catalog, catalogFile) {
  const tableFile = resolve(options.approved, `${task.id}.json`);
  const table = JSON.parse(await readFile(tableFile, "utf8"));
  // The v0.0.50 generate stage, frozen so this eval keeps measuring v0.0.50 after the v0.0.60 rewrite.
  const guide = await readFile(join(repo, "evals/v0.0.50/generate-prompt-v0.0.50.md"), "utf8");
  const prompt = `${fence("catalog", catalog)}${fence("brief", task.brief)}${fence("approved_hierarchy", table)}${fence("stage_instructions", guide)}`
    + `\nUse surfaceId "${task.surfaceId}". Return only the A2UI createSurface message.`;
  let generated = await generateValid(options, dir, "generate", task, catalogFile, prompt, tableFile);
  let render = await check(options, `${task.id}_after`, generated.screen, join(dir, "render-0"), tableFile);
  const renders = [render];
  for (let round = 1; !render.pass && round <= options.repairs; round++) {
    const failures = render.viewports.filter(viewport => !viewport.pass)
      .map(viewport => ({ width: viewport.width, failures: viewport.failures }));
    const repair = `${prompt}${fence("previous_screen", generated.screen)}\nThe rendered screen failed the hierarchy check.`
      + ` Change only the screen JSON so the approved table holds; keep IDs, emphasis and copy budgets.${fence("hierarchy_check", failures)}`;
    generated = await generateValid(options, dir, `repair${round}`, task, catalogFile, repair, tableFile);
    render = await check(options, `${task.id}_after`, generated.screen, join(dir, `render-${round}`), tableFile);
    renders.push(render);
  }
  return { table: tableFile, validatorAttempts: generated.attempts, renders, render };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  options.renderer = resolve(options.renderer);
  options.out = resolve(options.out);
  if (existsSync(options.out)) throw new Error("--out must not exist.");
  await mkdir(options.out, { recursive: true });
  const guide = await readFile(join(repo, "evals/v0.0.50/hierarchy-guide-v0.0.50.md"), "utf8");
  const results = { model: options.model, thinking: options.thinking, phase: options.phase, tasks: {} };
  for (const task of options.selected) {
    const catalogFile = join(options.renderer, task.catalog);
    const catalog = JSON.parse(await readFile(catalogFile, "utf8"));
    const result = results.tasks[task.id] = {};
    if (options.phase === "map") {
      const dir = join(options.out, task.id);
      await mkdir(dir, { recursive: true });
      const text = await ask(options, dir, "hierarchy", `${fence("catalog", catalog)}${fence("brief", task.brief)}${fence("hierarchy_guide", guide)}`
        + `\nDraft hierarchy.json for this one screen (screen "${task.surfaceId}"). Return only the JSON object.`);
      const table = json(text);
      await writeFile(join(dir, "hierarchy.json"), JSON.stringify(table, null, 2) + "\n");
      result.draft = join(dir, "hierarchy.json");
      continue;
    }
    for (const condition of options.condition === "both" ? ["before", "after"] : [options.condition]) {
      const dir = join(options.out, task.id, condition);
      await mkdir(dir, { recursive: true });
      result[condition] = await (condition === "before" ? before : after)(options, task, dir, catalog, catalogFile);
    }
  }
  await writeFile(join(options.out, "results.json"), JSON.stringify(results, null, 2) + "\n");
  console.log(JSON.stringify(results, (key, value) => key === "components" ? undefined : value, 2));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
}
