import test from "node:test";
import assert from "node:assert/strict";
import { access, chmod, mkdir, mkdtemp, readFile, readdir, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { briefFor, criteria, tasks, widths } from "../evals/tasks.mjs";
import { blindHtml, isolatedEnv, judgePrompt, ompArgs, parseArgs, parseJudge, rendererEnv, RpcClient, run, staticServer, validateChecks } from "../evals/run.mjs";

const modelArgs = ["--builder-model", "builder/exact", "--judge-model", "judge/exact", "--out", "/tmp/new-eval"];
const judgment = () => Object.fromEntries(["A", "B"].map(label => [label, {
  scores: Object.fromEntries(Object.keys(criteria).map(key => [key, 3])),
  reasons: Object.fromEntries(Object.keys(criteria).map(key => [key, "Visible alignment at 390px."])),
}]));
const checks = () => ({ viewports: widths.map(width => ({ width, horizontalOverflowPx: 0, pageErrors: [] })) });

test("fixed corpus contains four self-contained tasks with frozen data and existing settings tokens", () => {
  assert.deepEqual(tasks.map(task => task.id), ["dashboard", "landing", "settings", "mobile"]);
  assert.match(tasks[0].brief, /INV-1048, Acme Studio/);
  assert.match(tasks[1].brief, /Maya Chen/);
  assert.match(tasks[2].seed, /--brand:#245c50/);
  assert.match(tasks[2].brief, /Weekly digest on/);
  assert.match(tasks[3].brief, /07:30 Morning walk/);
  for (const task of tasks) {
    assert.match(briefFor(task), /self-contained index\.html/);
    assert.match(briefFor(task), /Work offline from the fixture/);
    assert.match(briefFor(task), /evaluator owns all rendered QA after this turn/);
    assert.match(briefFor(task), /Fixed pattern studies \(synthetic, supplied to both builds\)/);
  }
  assert.deepEqual(Object.keys(criteria), ["hierarchy", "spacing_consistency", "visual_consistency", "responsive", "polish"]);
});

test("CLI requires exact distinct models, a new output, and valid task/deadline", () => {
  assert.equal(parseArgs(modelArgs).task, "all");
  assert.equal(parseArgs([...modelArgs, "--task", "mobile"]).task, "mobile");
  assert.throws(() => parseArgs(["--builder-model", "flash"]), /provider\/model/);
  assert.throws(() => parseArgs([...modelArgs, "--judge-model", "builder/exact"]), /must differ/);
  assert.throws(() => parseArgs([...modelArgs, "--task", "unknown"]), /Unknown/);
  assert.throws(() => parseArgs([...modelArgs, "--timeout", "NaN"]), /positive/);
  assert.throws(() => parseArgs([...modelArgs, "--timeout", "0"]), /positive/);
  assert.throws(() => parseArgs([...modelArgs, "--profile", "host"]), /Invalid/);
  assert.deepEqual(parseArgs([...modelArgs, "--credential-env", "ONE_TOKEN", "--credential-env", "TWO_KEY"])["credential-env"], ["ONE_TOKEN", "TWO_KEY"]);
  assert.throws(() => parseArgs([...modelArgs, "--credential-env", "bad=value"]), /variable name/);
});

test("isolated environment only forwards selected-provider credentials and explicitly named extras", () => {
  const host = { PATH: "/bin", HOME: "/real", OPENAI_API_KEY: "one", INFERHUB_API_KEY: "two", EXTRA_KEY: "three",
    PI_CONFIG_FILES: "/host/config", PI_SESSION_FILE: "/host/session", OMP_PROFILE: "host", NODE_OPTIONS: "--require bad",
    ULTRADESIGN_MODELS: '{"qa":"other/model"}', UD_CHROMIUM_PATH: "/chrome", UV_OFFLINE: "1", UV_CACHE_DIR: "/uv-cache", UV_PYTHON: "/python" };
  const env = isolatedEnv(host, "/fresh", "/fresh/agent", "inferhub/exact", ["EXTRA_KEY"]);
  assert.equal(env.HOME, "/fresh");
  assert.equal(env.INFERHUB_API_KEY, "two");
  assert.equal(env.EXTRA_KEY, "three");
  assert.equal(env.OPENAI_API_KEY, undefined);
  for (const key of ["PI_CONFIG_FILES", "PI_SESSION_FILE", "OMP_PROFILE", "NODE_OPTIONS", "ULTRADESIGN_MODELS", "UD_CHROMIUM_PATH", "UV_CACHE_DIR", "UV_PYTHON"]) assert.equal(env[key], undefined);
  assert.equal(env.ULTRADESIGN_MODEL, "inferhub/exact");
  assert.equal(env.ULTRADESIGN_THINKING_LEVEL, "high");
  const rendered = rendererEnv(host, env);
  assert.equal(rendered.UD_CHROMIUM_PATH, "/chrome");
  assert.equal(rendered.UV_OFFLINE, "1");
  assert.equal(rendered.UV_CACHE_DIR, "/uv-cache");
  assert.equal(rendered.UV_PYTHON, "/python");
  for (const key of ["INFERHUB_API_KEY", "EXTRA_KEY", "PI_CODING_AGENT_DIR", "ULTRADESIGN_MODEL"]) assert.equal(rendered[key], undefined);
});

test("only treatment explicitly loads the extension; baseline cannot discover context, rules, or skills", () => {
  const baseline = ompArgs("builder/exact");
  const treatment = ompArgs("builder/exact", true);
  const toolsIndex = baseline.indexOf("--tools") + 1;
  assert.ok(toolsIndex > 0);
  assert.equal(baseline[toolsIndex], "read,write,edit");
  assert.equal(treatment[toolsIndex], baseline[toolsIndex] + ",ultradesign_checkpoint");
  assert.deepEqual(treatment.slice(0, toolsIndex), baseline.slice(0, toolsIndex));
  assert.equal(treatment.length, baseline.length + 2);
  assert.equal(treatment.at(-2), "-e");
  assert.equal(baseline.includes("-e"), false);
  for (const flag of ["--no-extensions", "--no-skills", "--no-rules", "--no-context-files", "--no-session"]) assert.ok(baseline.includes(flag));
  assert.equal(baseline[baseline.indexOf("--thinking") + 1], "high");
  assert.ok(ompArgs("judge/exact", false, true).includes("--no-tools"));
  assert.equal(ompArgs("judge/exact", false, true).includes("-e"), false);
});

test("visual judge sees fixed anonymous labels and no runtime/scoring assumptions", () => {
  const prompt = judgePrompt(tasks[0]);
  assert.match(prompt, /A at 390px, A at 768px, A at 1440px, B at 390px/);
  assert.match(prompt, /do not score functional correctness/i);
  assert.match(prompt, /not supplied to this visual judge/);
  assert.doesNotMatch(prompt, /builder\/exact|judge\/exact|\/tmp\/|baseline|treatment|ultradesign/i);
});

test("judge response must contain exactly five visual criteria, integer scores, and evidence for both sides", () => {
  assert.deepEqual(parseJudge(JSON.stringify(judgment())), judgment());
  assert.deepEqual(parseJudge("```json\n" + JSON.stringify(judgment()) + "\n```"), judgment());
  assert.throws(() => parseJudge("not JSON"), /invalid JSON/);
  const missing = judgment(); delete missing.A.scores.hierarchy;
  assert.throws(() => parseJudge(JSON.stringify(missing)), /criteria/);
  const biased = judgment(); biased.condition = "treatment";
  assert.throws(() => parseJudge(JSON.stringify(biased)), /anonymous/);
  const score = judgment(); score.A.scores.polish = 6;
  assert.throws(() => parseJudge(JSON.stringify(score)), /invalid/);
  const evidence = judgment(); evidence.B.reasons.polish = "";
  assert.throws(() => parseJudge(JSON.stringify(evidence)), /invalid/);
});

test("renderer checks must contain each fixed width exactly once, with real numeric observations", () => {
  assert.deepEqual(validateChecks(checks()), widths.map(width => ({ width, horizontalOverflowPx: 0, pageErrorCount: 0 })));
  const duplicate = checks(); duplicate.viewports[1].width = 390;
  assert.throws(() => validateChecks(duplicate), /malformed/);
  const invalid = checks(); invalid.viewports[0].horizontalOverflowPx = "0";
  assert.throws(() => validateChecks(invalid), /malformed/);
  assert.throws(() => validateChecks({ viewports: [] }), /exactly three/);
});

function rpc(code, timeout = 2) {
  return new RpcClient(process.execPath, ["-e", code], { cwd: tmpdir(), env: { PATH: process.env.PATH }, timeout });
}

test("RPC does not mistake agent_end or prompt acknowledgement for settled completion", async () => {
  const client = rpc(`require("node:readline").createInterface({input:process.stdin}).on("line",line=>{
    const command=JSON.parse(line);const emit=value=>console.log(JSON.stringify(value));
    emit({type:"response",id:command.id,success:true});
    emit({type:"agent_end"});
    emit({type:"prompt_result",id:command.id,status:"completed",sessionSettled:false});
    setTimeout(()=>{emit({type:"message_end",message:{role:"assistant",content:[{type:"text",text:"settled"}]}});emit({type:"session_settled"});},30);
  });`);
  try {
    await client.request("prompt", { message: "do work" });
    assert.equal(client.text(), "settled");
  } finally { await client.stop(); }
});

test("RPC rejects provider errors, aborted prompts, invalid JSON, premature exit, and timeout", async () => {
  for (const [code, expected, timeout] of [
    ['console.log(JSON.stringify({type:"prompt_result",id:"1",status:"error",sessionSettled:true}));setInterval(()=>{},1000)', /prompt failed/, 2],
    ['console.log(JSON.stringify({type:"prompt_result",id:"1",status:"aborted",sessionSettled:true}));setInterval(()=>{},1000)', /aborted/, 2],
    ['console.log("bad-json");setInterval(()=>{},1000)', /malformed/, 2],
    ['setTimeout(()=>process.exit(1),30)', /exited/, 2],
    ['setInterval(()=>{},1000)', /timed out/, 0.2],
  ]) {
    const client = rpc(code, timeout);
    try { await assert.rejects(client.request("prompt", { message: "work" }), expected); }
    finally { await client.stop(); }
  }
});

test("RPC validates actual model and catches a changed main-session model", async () => {
  const client = rpc(`require("node:readline").createInterface({input:process.stdin}).on("line",line=>{
    const c=JSON.parse(line); console.log(JSON.stringify({type:"response",id:c.id,success:true,data:{model:{provider:"other",id:"model"}}}));
  });`);
  try { await assert.rejects(client.assertModel("builder/exact"), /different/); }
  finally { await client.stop(); }
});

async function fixture(failure = "") {
  const root = await mkdtemp(join(tmpdir(), "ud-runner-test-"));
  const omp = join(root, "omp.mjs"), uv = join(root, "uv.mjs"), audit = join(root, "audit.jsonl");
  await writeFile(omp, `#!/usr/bin/env node
import {appendFileSync,writeFileSync} from "node:fs";import{createInterface}from"node:readline";
const args=process.argv.slice(2),model=args[args.indexOf("--model")+1],judge=args.includes("--no-tools");
const emit=value=>console.log(JSON.stringify(value));
createInterface({input:process.stdin}).on("line",line=>{
 const c=JSON.parse(line);
 if(c.type==="get_state")return emit({type:"response",id:c.id,success:true,data:{model:{provider:model.split("/")[0],id:model.slice(model.indexOf("/")+1)}}});
 if(c.type==="get_available_commands")return emit({type:"response",id:c.id,success:true,data:{commands:args.includes("-e")?[{name:"ud"}]:[]}});
 appendFileSync(${JSON.stringify(audit)},JSON.stringify({args,model,judge,cwd:process.cwd(),home:process.env.HOME,prompt:c.message,images:c.images?.map(i=>Object.keys(i)),envKeys:Object.keys(process.env)})+"\\n");
 if(${JSON.stringify(failure)}==="builder"&&!judge)return emit({type:"response",id:c.id,success:false,error:"secret-token-should-not-escape"});
 if(!judge&&${JSON.stringify(failure)}!=="unchanged")writeFileSync("index.html","<!doctype html><html lang=en><title>Fixture</title><h1>Fixture</h1></html>");
 emit({type:"response",id:c.id,success:true});
 emit({type:"message_end",message:{role:"assistant",provider:model.split("/")[0],model:model.slice(model.indexOf("/")+1),content:[{type:"text",text:judge?JSON.stringify(${JSON.stringify(judgment())}):"done"}]}});
 emit({type:"prompt_result",id:c.id,status:"completed",sessionSettled:true});
});\n`);
  await writeFile(uv, `#!/usr/bin/env node
import{writeFileSync,mkdirSync}from"node:fs";import{join}from"node:path";
const args=process.argv.slice(2),out=args[args.indexOf("--out")+1];
if(args[1].endsWith("probe.py"))writeFileSync(out,JSON.stringify({action:"Fixed action.",primaryActionPassed:true,runningAnimationObserved:true,viewportWidth:390}));
else{mkdirSync(out,{recursive:true});writeFileSync(join(out,"checks.json"),JSON.stringify(${JSON.stringify(checks())}));for(const width of [390,768,1440])writeFileSync(join(out,width+".png"),Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a7XkAAAAASUVORK5CYII=","base64"));}\n`);
  await chmod(omp, 0o700); await chmod(uv, 0o700);
  const options = parseArgs([...modelArgs, "--out", join(root, "results"), "--task", "dashboard", "--omp", omp, "--uv", uv, "--timeout", "10"]);
  return { root, audit, options };
}

test("runner integrates isolated fresh builders, anonymous fresh judge, and separated owner/model reports", async () => {
  const data = await fixture();
  try {
    const htmlPath = await run(data.options);
    const audit = (await readFile(data.audit, "utf8")).trim().split("\n").map(JSON.parse);
    assert.equal(audit.length, 3);
    assert.equal(new Set(audit.map(entry => entry.home)).size, 3);
    const builders = audit.filter(entry => !entry.judge), judge = audit.find(entry => entry.judge);
    assert.equal(builders.length, 2);
    assert.equal(builders.find(entry => entry.prompt.startsWith("/ud ")).prompt.slice(4), builders.find(entry => !entry.prompt.startsWith("/ud ")).prompt);
    assert.equal(judge.images.length, 6);
    assert.ok(judge.images.every(keys => keys.sort().join() === "data,mimeType,type"));
    assert.doesNotMatch(judge.prompt, /\/tmp\/|baseline|treatment/);
    for (const entry of audit) await assert.rejects(access(entry.home));
    const manifest = JSON.parse(await readFile(join(data.options.out, "private", "manifest.json")));
    assert.equal(manifest.status, "completed");
    assert.deepEqual(Object.values(manifest.tasks[0].mapping).sort(), ["baseline", "treatment"]);
    const owner = await readFile(htmlPath, "utf8");
    assert.match(owner, /owner-picks/);
    assert.doesNotMatch(owner, /Visible alignment|<table>|builder\/exact|judge\/exact|baseline|treatment/);
    assert.equal((owner.match(/<img /g) ?? []).length, 6);
    const scoreHtml = await readFile(join(data.options.out, "blind", "scores.html"), "utf8");
    assert.match(scoreHtml, /motion presence/);
    assert.match(scoreHtml, /component consistency \/ reuse \(visual proxy\)/);
    const scores = JSON.parse(await readFile(join(data.options.out, "blind", "scores.json")));
    assert.equal(scores[0].judgment.A.scores.motion_presence, 5);
    assert.equal(Object.keys(scores[0].judgment.A.scores).length, 6);
    await assert.rejects(run(data.options), /EEXIST/);
  } finally { await rm(data.root, { recursive: true, force: true }); }
});

test("failed builder records its phase without stderr/secrets, publishes no report, and removes temporary HOME", async () => {
  const data = await fixture("builder");
  try {
    await assert.rejects(run(data.options), /RPC prompt failed/);
    const manifestText = await readFile(join(data.options.out, "private", "manifest.json"), "utf8");
    const manifest = JSON.parse(manifestText);
    assert.equal(manifest.status, "failed");
    assert.equal(manifest.active.phase, "builder");
    assert.doesNotMatch(manifestText, /secret-token/);
    assert.deepEqual(await readdir(join(data.options.out, "blind")), []);
    const audit = JSON.parse((await readFile(data.audit, "utf8")).trim());
    await assert.rejects(access(audit.home));
  } finally { await rm(data.root, { recursive: true, force: true }); }
});

test("an unchanged settings seed is not a finished build", async () => {
  const data = await fixture("unchanged");
  try {
    await assert.rejects(run({ ...data.options, task: "settings" }), /did not produce a finished index\.html/);
    assert.deepEqual(await readdir(join(data.options.out, "blind")), []);
  } finally { await rm(data.root, { recursive: true, force: true }); }
});

test("static server serves only fixture files, including when a fixture symlink escapes its root", async () => {
  const root = await mkdtemp(join(tmpdir(), "ud-static-test-"));
  let server;
  try {
    await mkdir(join(root, "fixture"));
    await writeFile(join(root, "fixture", "index.html"), "<h1>Local</h1>");
    await writeFile(join(root, "outside.txt"), "private");
    await symlink(join(root, "outside.txt"), join(root, "fixture", "escape.txt"));
    server = await staticServer(join(root, "fixture"));
    assert.equal(await (await fetch(server.url)).text(), "<h1>Local</h1>");
    assert.equal((await fetch(server.url + "escape.txt")).status, 404);
  } finally {
    if (server) await server.close();
    await rm(root, { recursive: true, force: true });
  }
});

test("blind HTML escapes task/evidence content and keeps model evidence out until the separate page", () => {
  const judged = judgment();
  for (const label of ["A", "B"]) {
    judged[label].scores.motion_presence = 1;
    judged[label].reasons.motion_presence = "No runtime animation observed.";
    judged[label].reasons.polish = "<script>alert('judge')</script>";
  }
  const pair = { id: "dashboard", title: "<script>bad</script>", brief: "<unsafe>", judgment: judged,
    checks: { A: validateChecks(checks()), B: validateChecks(checks()) },
    behavior: { A: { action: "Search", primaryActionPassed: false }, B: { action: "Search", primaryActionPassed: true } } };
  const owner = blindHtml([pair]);
  assert.match(owner, /&lt;script&gt;bad&lt;\/script&gt;/);
  assert.doesNotMatch(owner, /alert\(&#39;judge/);
  const scored = blindHtml([pair], true);
  assert.match(scored, /&lt;script&gt;alert/);
  assert.doesNotMatch(scored, /<script>alert/);
});
