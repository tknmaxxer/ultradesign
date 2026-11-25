import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { cp, mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createInterface } from "node:readline";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const temporary = await mkdtemp(join(tmpdir(), "ultradesign-omp-"));
const copied = join(temporary, "copied-package");
const work = join(temporary, "project");
const agentDir = join(temporary, "agent");
const sessionDir = join(temporary, "sessions");
const hookLog = join(temporary, "before-payload.jsonl");
await mkdir(work, { recursive: true });
await mkdir(agentDir, { recursive: true });
await mkdir(copied, { recursive: true });
for (const path of ["package.json", "adapters/omp", "skills"]) {
  await cp(join(root, path), join(copied, path), { recursive: true });
}
await writeFile(join(agentDir, "config.yml"), `
modelRoles:
  default: ultradesign-local/builder
  smol: ultradesign-local/reference
  slow: ultradesign-local/judge
task:
  batch: true
  steps: false
  perCallModel: on
  workerThreads: 0
  speculativeLaunch: false
async:
  enabled: false
eval:
  autoProvision: false
`);

const received = [];
let scenario = "initial";
const attempts = [];
let parallelSent = false;
let childrenInFlight = 0;
let maximumParallelChildren = 0;
let wireError;
const owned = /<omp-ultradesign-policy>[\s\S]*?<\/omp-ultradesign-policy>/g;
const systemText = payload => payload.messages.filter(message => ["system", "developer"].includes(message.role))
  .map(message => typeof message.content === "string" ? message.content : message.content.map(block => block.text ?? "").join("\n")).join("\n");
const tool = args => ({ name: "ultradesign_checkpoint", arguments: args });
const checkpoint = stage => tool({ action: "complete", stage, evidence: [`${stage}.json: scripted installed-host checkpoint evidence`] });
const gate = id => tool({ action: "gate", gate: {
  id, artifact: [`https://share.example/${id}.html`], reason: `The ${id} artifact serves the brief's core task.`,
  lookAt: ["The first screen", "The contact path"],
  question: "Walk through it as your visitor: where did you stop or re-read, and what were you looking for?",
} });
const gated = (stage, mode) => ["frame", "structure", "references", "directions", "assets", "system", "motion", "map", "slice", "final"].includes(stage)
  && !(mode === "plan" && stage === "system");
const between = (system, key, end) => JSON.parse(system.split(`${key}: `)[1].split(end)[0]);
const server = Bun.serve({
  hostname: "127.0.0.1", port: 0,
  async fetch(request) {
    try {
      assert(request.url.endsWith("/chat/completions"));
      const payload = await request.json();
      const system = systemText(payload);
      const child = system.includes("role=sub;");
      const stage = /Active stage: ([a-z]+)/.exec(system)?.[1];
      const mode = /Mode: ([a-z]+)/.exec(system)?.[1];
      const depth = /Depth: (not stated|full|short)/.exec(system)?.[1];
      const pending = stage ? between(system, "Waiting for the owner", ". Owner approvals:") : null;
      const decisions = stage ? between(system, "Owner approvals", ". Owner revisions:") : [];
      const feedback = stage ? between(system, "Owner revisions", ". Interview answers:") : [];
      const rounds = stage ? between(system, "Review evidence", ". Real-user validation") : [];
      const last = payload.messages.at(-1);
      const rejected = last?.role === "tool" && /Error|requires|needs|pending/.test(JSON.stringify(last.content));
      received.push({ scenario, child, stage, mode, depth, pending, decisions, feedback, payload });
      let call;
      let text = `Observed ${scenario}, ${stage ?? "inactive"}.`;
      const replies = pending?.exchanges.at(-1).replies ?? [];
      if (child) {
        childrenInFlight++;
        maximumParallelChildren = Math.max(maximumParallelChildren, childrenInFlight);
        await new Promise(resolve => setTimeout(resolve, 120));
        childrenInFlight--;
        text = `Independent ${payload.model} evidence: inspected the assigned read-only fixture.`;
      } else if (pending && replies.length) {
        const words = replies.map(reply => reply.text).join(" ");
        if (scenario === "followup" && attempts.length === 0) {
          attempts.push("complete");
          call = checkpoint(stage);
        } else if (scenario === "followup" && attempts.length === 1) {
          attempts.push("invented-approval");
          call = tool({ action: "resolve", resolution: { outcome: "approved", extraction: "Invented approval.", quote: "go ahead" } });
        } else if (words.includes("go ahead")) {
          call = tool({ action: "resolve", resolution: { outcome: "approved", extraction: "No change requested.", quote: "go ahead" } });
        } else if (words.includes("revise")) {
          call = tool({ action: "resolve", resolution: { outcome: "revise", extraction: "Pressed state → visitor unsure the tap registered → visible pressed fill." } });
        } else {
          call = tool({ action: "resolve", resolution: { outcome: "follow_up", extraction: "No change and no go-ahead.",
            followUp: "Before we move on, is there a moment on this screen that still bothers you? Describe where." } });
        }
      } else if (stage && stage !== "done" && !pending) {
        if (mode === "implement" && stage === "frame" && depth === "not stated") {
          call = scenario === "inferred-review" ? tool({ action: "scope", mode: "review" })
            : scenario === "shared" ? tool({ action: "scope", depth: "full" })
            : tool({ action: "scope", depth: "short", include: ["references"] });
        } else if (stage === "review" && !rounds.length && scenario === "owner" && !parallelSent) {
          parallelSent = true;
          call = {
            name: "task",
            arguments: {
              context: "Installed-host transport check. Independent read-only reference and review evidence; no edits, commands, or tests.",
              tasks: [
                { name: "References", agent: "scout", model: "ultradesign-local/reference",
                  task: "Return reference evidence from the supplied fixture context only. Do not call tools or edit.",
                  solutionSpace: "One fixed read-only evidence response." },
                { name: "Review", agent: "reviewer", model: "ultradesign-local/judge",
                  task: "Return independent review evidence from the supplied fixture context only. Do not call tools or edit.",
                  solutionSpace: "One fixed read-only evidence response." },
              ],
            },
          };
        } else if (stage === "review" && !rounds.length) {
          call = tool({ action: "qa_round", qaRound: { round: 0, method: "fallback", reviewer: "independent", report: "qa/baseline.md", openFindings: [] } });
        } else if (gated(stage, mode) && !decisions.some(decision => decision.id === stage) && !rejected) {
          call = gate(stage);
        } else if (!rejected) {
          call = checkpoint(stage);
        }
      }
      const id = `chatcmpl-${received.length}`;
      const chunk = delta => ({ id, object: "chat.completion.chunk", created: 1, model: payload.model,
        choices: [{ index: 0, delta, finish_reason: null }] });
      const start = call ? chunk({ role: "assistant", tool_calls: [{
        index: 0, id: `call-${received.length}`, type: "function",
        function: { name: call.name, arguments: JSON.stringify(call.arguments) },
      }] }) : chunk({ role: "assistant", content: text });
      const end = chunk({});
      end.choices[0].finish_reason = call ? "tool_calls" : "stop";
      return new Response(`data: ${JSON.stringify(start)}\n\ndata: ${JSON.stringify(end)}\n\ndata: [DONE]\n\n`,
        { headers: { "Content-Type": "text/event-stream" } });
    } catch (error) {
      wireError = error;
      return new Response(String(error), { status: 500 });
    }
  },
});
const env = {
  ...process.env,
  HOME: join(temporary, "home"),
  XDG_CONFIG_HOME: join(temporary, "config"),
  XDG_DATA_HOME: join(temporary, "data"),
  XDG_STATE_HOME: join(temporary, "state"),
  XDG_CACHE_HOME: join(temporary, "cache"),
  PI_CODING_AGENT_DIR: agentDir,
  OMP_PROFILE: "default", PI_PROFILE: "default",
  ULTRADESIGN_TEST_URL: `http://127.0.0.1:${server.port}/v1`,
  ULTRADESIGN_TEST_LOG: hookLog,
  ULTRADESIGN_MODEL: "ultradesign-local/builder",
  ULTRADESIGN_MODELS: JSON.stringify({
    references: "ultradesign-local/reference", system: "ultradesign-local/architect", review: "ultradesign-local/judge",
  }),
  ULTRADESIGN_THINKING_LEVEL: "off",
};
const args = [
  "--mode", "rpc", "--offline", "--no-title", "--no-prewalk", "--no-lsp", "--no-judge",
  "--no-skills", "--no-rules", "--no-context-files", "--auto-approve",
  "--model", "ultradesign-local/builder",
  "--session-dir", sessionDir, "--tools", "read,task,ultradesign_checkpoint",
  "-e", join(root, "tests/fixtures/omp-provider.ts"), "-e", copied,
];
let client;
function startClient(sessionFile) {
  const cliArgs = sessionFile ? [...args, "--resume", sessionFile] : args;
  const child = spawn(process.env.OMP_BIN || "omp", cliArgs, { cwd: work, env, stdio: ["pipe", "pipe", "pipe"] });
  const events = [];
  const subscribers = new Set();
  let errors = "";
  child.stderr.on("data", data => { errors += data; });
  const lines = createInterface({ input: child.stdout });
  lines.on("line", line => {
    let event;
    try { event = JSON.parse(line); } catch { errors += `${line}\n`; return; }
    events.push(event);
    for (const listener of subscribers) listener(event);
  });
  let counter = 0;
  const wait = (predicate, from = events.length) => new Promise((resolve, reject) => {
    const existing = events.slice(from).find(predicate);
    if (existing) return resolve(existing);
    const finish = (error, value) => {
      clearTimeout(timer); subscribers.delete(listener); child.off("exit", exited);
      error ? reject(error) : resolve(value);
    };
    const listener = event => { if (predicate(event)) finish(undefined, event); };
    const exited = code => finish(new Error(`OMP exited ${code}: ${errors}`));
    const timer = setTimeout(() => finish(new Error(`OMP timeout: ${errors}\n${JSON.stringify(events.slice(-8))}`)), 90000);
    subscribers.add(listener); child.once("exit", exited);
  });
  const rpc = async (type, fields = {}) => {
    const id = String(++counter);
    const pending = wait(event => event.type === "response" && event.id === id);
    child.stdin.write(JSON.stringify({ id, type, ...fields }) + "\n");
    const result = await pending;
    assert.notEqual(result.success, false, JSON.stringify(result));
    return result.data;
  };
  return {
    events, rpc,
    async prompt(message, invokesAgent = true) {
      const from = events.length;
      const result = await rpc("prompt", { message });
      if (invokesAgent) await wait(event => event.type === "agent_end", from);
      return result;
    },
    async close() {
      if (child.exitCode !== null || child.signalCode !== null) return;
      const exited = new Promise(resolve => child.once("exit", resolve));
      child.kill("SIGTERM");
      await exited;
    },
  };
}

try {
  client = startClient();
  const { commands } = await client.rpc("get_available_commands");
  for (const name of ["ud", "ultradesign"]) {
    assert(commands.some(command => command.name === name), `Missing ${name} in native command discovery`);
  }
  const main = () => received.filter(item => !item.child);
  const visited = name => [...new Set(main().filter(item => item.scenario === name).map(item => item.stage))];
  const goAhead = async (count, words = "Reads right to me, go ahead.") => {
    for (let index = 0; index < count; index++) await client.prompt(words);
  };
  await client.prompt("/ud Build the fixture account screen");
  assert.equal(main().at(-1).stage, "frame");
  assert.equal(main().at(-1).depth, "short");
  assert.equal(main().at(-1).pending.gate.id, "frame");
  scenario = "followup";
  await client.prompt("Continue without a selection.");
  assert.deepEqual(attempts, ["complete", "invented-approval"], "Skip and invented-approval attempts were not both made");
  assert.equal(main().at(-1).pending.gate.id, "frame");
  assert.equal(main().at(-1).decisions.length, 0, "A reply without a go-ahead must not approve the gate");
  assert.equal(main().at(-1).pending.exchanges.length, 2, "The gate should carry one open follow-up");
  assert.equal(main().at(-1).pending.exchanges[0].replies[0].text, "Continue without a selection.");
  await client.prompt("/ud status", false);
  const { sessionFile } = await client.rpc("get_state");
  assert.equal(typeof sessionFile, "string");
  await client.close();
  client = undefined;
  scenario = "owner";
  client = startClient(sessionFile);
  const beforeResume = received.length;
  await client.prompt("/ultradesign resume", false);
  assert.equal(received.length, beforeResume, "Resume at an open gate should render it without calling the model");
  await goAhead(1);
  assert.equal(main().at(-1).pending.gate.id, "structure");
  assert.equal(main().at(-1).decisions[0].quote, "go ahead");
  assert.equal(main().at(-1).decisions[0].by, "owner-reply");
  await goAhead(3);
  assert.equal(main().at(-1).pending.gate.id, "system");
  await client.prompt("Please revise: the pressed state is unclear.");
  assert.equal(main().at(-1).pending.gate.id, "system");
  assert.equal(main().at(-1).feedback.at(-1).id, "system");
  await client.prompt("/ultradesign approve system the pressed state reads now");
  assert.equal(main().at(-1).pending.gate.id, "slice");
  await goAhead(1);
  assert.equal(main().at(-1).pending.gate.id, "final");
  await client.prompt("/ud real-user Two clinic directors completed the contact task on their phones.", false);
  await goAhead(1);
  assert.equal(main().at(-1).stage, "done");
  assert.deepEqual(visited("owner"), ["frame", "structure", "references", "directions", "system", "slice", "review", "final", "done"]);
  assert(received.some(item => item.child && item.payload.model === "reference"));
  assert(received.some(item => item.child && item.payload.model === "judge"));
  assert(maximumParallelChildren >= 2, "Native task batch did not run independent children concurrently");
  for (const item of received.filter(item => item.child)) {
    assert(!systemText(item.payload).includes("<omp-ultradesign-policy>"), "Parent workflow leaked into child routing");
  }
  scenario = "plan";
  await client.prompt("/ultradesign plan Plan the fixture dashboard");
  await goAhead(4);
  assert.deepEqual(visited("plan"), ["frame", "structure", "references", "directions", "system", "done"]);
  scenario = "review";
  await client.prompt("/ud review Audit the existing fixture without implementation");
  assert.deepEqual(visited("review"), ["review", "done"]);
  scenario = "inferred-review";
  await client.prompt("/ud Tell me where the existing fixture falls short");
  assert.deepEqual(visited("inferred-review"), ["frame", "review", "done"]);
  scenario = "shared";
  await client.prompt("/ultradesign --shared Build a system for two fixture projects");
  await goAhead(10);
  assert.deepEqual(visited("shared"),
    ["frame", "structure", "references", "directions", "assets", "system", "motion", "map", "slice", "buildout", "review", "final", "sharing", "done"]);
  await client.prompt("/ud off", false);
  scenario = "off";
  await client.prompt("Return ordinary session output.");
  assert(!systemText(received.at(-1).payload).includes("<omp-ultradesign-policy>"));
  assert(!wireError, String(wireError));

  const before = (await readFile(hookLog, "utf8")).trim().split("\n").map(line => JSON.parse(line));
  assert.equal(before.length, received.length, "Every transport request should pass the real provider hook");
  let refreshed = false;
  const scrub = value => JSON.parse(JSON.stringify(value).replace(owned, "<owned-policy>"));
  for (let index = 0; index < before.length; index++) {
    // JSON escaping does not escape the policy tags, so scrubbing removes only our block.
    assert.deepEqual(scrub(before[index].payload), scrub(received[index].payload), "Adapter changed non-owned provider payload");
    assert.deepEqual(before[index].payload.tools, received[index].payload.tools, "Native tool schema changed");
    if (systemText(before[index].payload) !== systemText(received[index].payload)) refreshed = true;
  }
  assert(refreshed, "No mid-turn state refresh was observed");
  for (const item of main().filter(item => item.stage)) {
    const expected = { references: "reference", system: "architect", review: "judge" }[item.stage] ?? (item.stage === "done" ? undefined : "builder");
    if (expected) assert.equal(item.payload.model, expected, `Wrong native model route for ${item.stage}`);
    assert(systemText(item.payload).includes(join(copied, "skills/ultradesign/SKILL.md")));
    assert.equal((systemText(item.payload).match(/<omp-ultradesign-policy>/g) || []).length, 1);
  }
  const entries = (await readFile(sessionFile, "utf8")).trim().split("\n").map(line => JSON.parse(line));
  const states = entries.filter(entry => entry.type === "custom" && entry.customType === "ultradesign:state").map(entry => entry.data);
  assert(states.every(state => state.version === 3));
  assert(states.some(state => state.pending?.gate?.id === "frame" && state.pending.exchanges[0].replies[0]?.source === "rpc" && !state.decisions.length));
  assert(!states.some(state => state.pending?.exchanges.some(exchange => exchange.replies.some(reply => reply.text.startsWith("/")))),
    "Slash commands must never be recorded as owner replies");
  assert(states.some(state => state.decisions.some(decision => decision.id === "system" && decision.by === "owner-command" && decision.quote === "the pressed state reads now")));
  assert(states.some(state => state.realUser[0]?.note.startsWith("Two clinic directors")));
  assert(states.some(state => state.checkpoints.length === 8 && state.stage === "done" && state.depth === "short"));
  assert(states.some(state => state.shared && state.depth === "full" && state.checkpoints.length === 13 && state.stage === "done"));
  assert.equal(states.at(-1).active, false);
  console.log(`OMP installed-host checks passed: aliases, owner replies captured from input, quote-bound approval, rejected skip and invented approval, follow-up, revise, command approval, real-user row, depth, read-only modes, review baseline, sharing, model routes, native parallel task, targeted payload refresh. Evidence: ${temporary}`);
} finally {
  if (client) await client.close();
  server.stop(true);
}
