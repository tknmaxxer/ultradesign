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
let triedToSkip = false;
let parallelSent = false;
let childrenInFlight = 0;
let maximumParallelChildren = 0;
let wireError;
const owned = /<omp-ultradesign-policy>[\s\S]*?<\/omp-ultradesign-policy>/g;
const systemText = payload => payload.messages.filter(message => ["system", "developer"].includes(message.role))
  .map(message => typeof message.content === "string" ? message.content : message.content.map(block => block.text ?? "").join("\n")).join("\n");
const checkpoint = stage => ({
  name: "ultradesign_checkpoint",
  arguments: { action: "complete", stage, evidence: [`${stage}.json: scripted installed-host checkpoint evidence`] },
});
const interview = ["direction", "typography", "palette", "status", "density"];
const gate = id => ({
  name: "ultradesign_checkpoint",
  arguments: { action: "gate", gate: {
    id, question: `Review ${id}?`, evidence: [`${id}.html`],
    ...(["system", "final"].includes(id) ? {} : {
      options: [
        { number: 1, label: "First", evidence: `${id}.html#first` },
        { number: 2, label: "Second", evidence: `${id}.html#second` },
      ],
      ...(id === "references" ? {} : { recommended: 1 }),
    }),
  } },
});
const readStateField = (system, key, end) => JSON.parse(system.split(`${key}: `)[1].split(end)[0]);
const server = Bun.serve({
  hostname: "127.0.0.1", port: 0,
  async fetch(request) {
    try {
      assert(request.url.endsWith("/chat/completions"));
      const payload = await request.json();
      const system = systemText(payload);
      const child = system.includes("role=sub;");
      const stage = /Active stage: ([a-z]+)/.exec(system)?.[1];
      const pending = stage ? readStateField(system, "Open owner gate", ". Owner decisions:") : null;
      const decisions = stage ? readStateField(system, "Owner decisions", ". Owner feedback:") : [];
      const rounds = stage ? readStateField(system, "QA evidence", ".\n") : [];
      received.push({ scenario, child, stage, pending, decisions, payload });
      let tool;
      let text = `Observed ${scenario}, ${stage ?? "inactive"}.`;
      if (child) {
        childrenInFlight++;
        maximumParallelChildren = Math.max(maximumParallelChildren, childrenInFlight);
        await new Promise(resolve => setTimeout(resolve, 120));
        childrenInFlight--;
        text = `Independent ${payload.model} evidence: inspected the assigned read-only fixture.`;
      } else if (scenario === "followup" && stage === "references" && !triedToSkip) {
        triedToSkip = true;
        tool = checkpoint(stage);
      } else if (scenario === "inferred-review" && stage === "frame") {
        tool = { name: "ultradesign_checkpoint", arguments: { action: "scope", mode: "review" } };
      } else if (stage && stage !== "done" && !pending) {
        if (scenario === "resume" && stage === "qa" && !parallelSent) {
          parallelSent = true;
          tool = {
            name: "task",
            arguments: {
              context: "Installed-host transport check. Independent read-only reference and QA evidence; no edits, commands, or tests.",
              tasks: [
                { name: "References", agent: "scout", model: "ultradesign-local/reference",
                  task: "Return reference evidence from the supplied fixture context only. Do not call tools or edit.",
                  solutionSpace: "One fixed read-only evidence response." },
                { name: "VisualQA", agent: "reviewer", model: "ultradesign-local/judge",
                  task: "Return independent QA evidence from the supplied fixture context only. Do not call tools or edit.",
                  solutionSpace: "One fixed read-only evidence response." },
              ],
            },
          };
        } else if (stage === "qa" && !rounds.length) {
          tool = { name: "ultradesign_checkpoint", arguments: {
            action: "qa_round", qaRound: { round: 0, method: "fallback", report: "qa/baseline.md", openFindings: [] },
          } };
        } else {
          const nextGate = stage === "interview" ? interview.find(id => !decisions.some(decision => decision.id === id))
            : (["references", "final"].includes(stage) || (stage === "system" && scenario !== "plan")) ? stage : undefined;
          tool = nextGate && !decisions.some(decision => decision.id === nextGate) ? gate(nextGate) : checkpoint(stage);
        }
      }
      const id = `chatcmpl-${received.length}`;
      const chunk = delta => ({ id, object: "chat.completion.chunk", created: 1, model: payload.model,
        choices: [{ index: 0, delta, finish_reason: null }] });
      const start = tool ? chunk({ role: "assistant", tool_calls: [{
        index: 0, id: `call-${received.length}`, type: "function",
        function: { name: tool.name, arguments: JSON.stringify(tool.arguments) },
      }] }) : chunk({ role: "assistant", content: text });
      const end = chunk({});
      end.choices[0].finish_reason = tool ? "tool_calls" : "stop";
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
    references: "ultradesign-local/reference", system: "ultradesign-local/architect", qa: "ultradesign-local/judge",
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
  await client.prompt("/ud Build the fixture account screen");
  assert.equal(received.at(-1).stage, "references");
  assert.equal(received.at(-1).pending.id, "references");
  scenario = "followup";
  await client.prompt("Continue without a selection.");
  assert(triedToSkip);
  assert.equal(received.at(-1).pending.id, "references");
  assert.equal(received.at(-1).decisions.length, 0);
  const { sessionFile } = await client.rpc("get_state");
  assert.equal(typeof sessionFile, "string");
  await client.close();
  client = undefined;
  scenario = "resume";
  client = startClient(sessionFile);
  const beforeResume = received.length;
  await client.prompt("/ultradesign resume", false);
  assert.equal(received.length, beforeResume, "Resume at an open gate should render it without calling the model");
  await client.prompt("/ud pick 1,2 Compare the hierarchy");
  assert.equal(received.at(-1).stage, "interview");
  assert.equal(received.at(-1).pending.id, "direction");
  for (const id of interview) await client.prompt(`/ud answer ${id} 2`);
  assert.equal(received.at(-1).pending.id, "system");
  await client.prompt("/ud revise system Show the pressed state");
  assert.equal(received.at(-1).pending.id, "system");
  await client.prompt("/ultradesign approve system");
  assert.equal(received.at(-1).pending.id, "final");
  assert(!received.some(item => item.scenario === "resume" && item.stage === "motion"));
  await client.prompt("/ud approve final");
  assert.equal(received.filter(item => !item.child).at(-1).stage, "done");
  assert(received.some(item => item.child && item.payload.model === "reference"));
  assert(received.some(item => item.child && item.payload.model === "judge"));
  assert(maximumParallelChildren >= 2, "Native task batch did not run independent children concurrently");
  for (const item of received.filter(item => item.child)) {
    assert(!systemText(item.payload).includes("<omp-ultradesign-policy>"), "Parent workflow leaked into child routing");
  }
  scenario = "plan";
  await client.prompt("/ultradesign plan Plan the fixture dashboard");
  await client.prompt("/ud pick 1 Plan evidence");
  for (const id of interview) await client.prompt(`/ud answer ${id} 1`);
  const visited = name => [...new Set(received.filter(item => item.scenario === name).map(item => item.stage))];
  assert.deepEqual(visited("plan"), ["frame", "references", "interview", "system", "done"]);
  scenario = "review";
  await client.prompt("/ud review Audit the existing fixture without implementation");
  assert.deepEqual(visited("review"), ["qa", "done"]);
  scenario = "inferred-review";
  await client.prompt("/ud Tell me where the existing fixture falls short");
  assert.deepEqual(visited("inferred-review"), ["frame", "qa", "done"]);
  scenario = "shared";
  await client.prompt("/ultradesign --motion --shared Build a system for two fixture projects");
  await client.prompt("/ud pick 2");
  for (const id of interview) await client.prompt(`/ud answer ${id} 2`);
  await client.prompt("/ud approve system");
  await client.prompt("/ud approve final");
  assert.deepEqual(visited("shared"),
    ["frame", "references", "interview", "system", "implementation", "qa", "motion", "final", "sharing", "done"]);
  await client.prompt("/ud status", false);
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
  const main = received.filter(item => !item.child && item.stage);
  for (const item of main) {
    const expected = { references: "reference", system: "architect", implementation: "builder", motion: "builder", qa: "judge", sharing: "builder" }[item.stage];
    if (expected) assert.equal(item.payload.model, expected, `Wrong native model route for ${item.stage}`);
    assert(systemText(item.payload).includes(join(copied, "skills/ultradesign/SKILL.md")));
    assert.equal((systemText(item.payload).match(/<omp-ultradesign-policy>/g) || []).length, 1);
  }
  const entries = (await readFile(sessionFile, "utf8")).trim().split("\n").map(line => JSON.parse(line));
  const states = entries.filter(entry => entry.type === "custom" && entry.customType === "ultradesign:state");
  assert(states.some(entry => entry.data.pending?.id === "references" && !entry.data.decisions.length));
  assert(states.some(entry => entry.data.pending?.id === "direction" && entry.data.decisions[0]?.choices.join() === "1,2"));
  assert(states.some(entry => entry.data.checkpoints.length === 7 && entry.data.stage === "done"));
  assert(states.some(entry => entry.data.shared && entry.data.motion && entry.data.checkpoints.length === 9 && entry.data.stage === "done"));
  assert.equal(states.at(-1).data.active, false);
  console.log(`OMP installed-host checks passed: aliases, persisted owner gates, no gate skip, read-only modes, QA baseline, optional motion/sharing, model routes, native parallel task, targeted payload refresh. Evidence: ${temporary}`);
} finally {
  if (client) await client.close();
  server.stop(true);
}
