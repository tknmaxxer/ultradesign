import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { Type } from "@sinclair/typebox";
import { refreshPayload } from "./payload";
import {
  ask, captureReply, complete, gateIds, openGate, optionalStages, ownerCommand, pendingSummary, policy, portablePolicy,
  recordQaRound, resolve, restore, routeFor, scope, stages, start, stateType,
  type Gate, type QaRound, type Resolution, type Scope, type Stage, type State,
} from "./workflow";

// OMP 19.0.1 supplies TypeBox through its extension loader, without a package dependency.
interface Model { provider: string; id: string; api: string }
interface Context {
  agent: { kind: "main" | "sub" };
  model?: Model;
  models: { resolve(selector: string): Model | undefined };
  sessionManager: { getBranch(): Array<{ type: string; customType?: string; data?: unknown }> };
  ui: { setStatus(key: string, text: string | undefined): void };
}
type Action = "status" | "scope" | "ask" | "gate" | "resolve" | "qa_round" | "complete";
interface Params extends Scope {
  action: Action; stage?: Stage; evidence?: string[]; question?: { text: string }; gate?: Gate;
  resolution?: Resolution; qaRound?: QaRound;
}
interface Api {
  setLabel(label: string): void;
  on(event: string, handler: (event: any, ctx: Context) => any): void;
  registerCommand(name: string, options: { description: string; handler: (args: string, ctx: Context) => Promise<void> }): void;
  registerTool(tool: {
    name: string; label: string; description: string; parameters: unknown; loadMode: "essential";
    execute(id: string, params: Params, signal: AbortSignal | undefined, update: unknown, ctx: Context): Promise<unknown>;
  }): void;
  sendUserMessage(message: string): Promise<void>;
  sendMessage(message: { customType: string; content: string; display: boolean; details?: unknown }): void;
  appendEntry(type: string, data: unknown): void;
  setModel(model: Model): Promise<boolean>;
  setThinkingLevel(level: string): void;
}

const text = Type.String({ minLength: 1 });
const stageType = Type.Union(stages.map(stage => Type.Literal(stage)));

export default function ultradesign(pi: Api): void {
  pi.setLabel("ultradesign");
  const skillRoot = fileURLToPath(new URL("../../skills/ultradesign/", import.meta.url));
  const portable = portablePolicy(readFileSync(new URL("../../skills/ultradesign/SKILL.md", import.meta.url), "utf8"));
  let state: State | undefined;
  const status = (ctx: Context) => ctx.ui.setStatus("ultradesign", state?.active
    ? `UD ${state.mode}: ${state.pending ? `waiting for owner (${state.pending.gate?.id ?? "question"})` : state.stage}` : undefined);
  const persist = (next: State, ctx: Context) => {
    state = next;
    pi.appendEntry(stateType, next);
    status(ctx);
  };
  const route = async (next: State, ctx: Context) => {
    if (!next.active || next.stage === "done") return;
    const config = routeFor(next.stage, process.env);
    const model = ctx.models.resolve(config.model);
    if (!model) throw new Error(`Ultradesign ${next.stage}: model ${config.model} is not available. Configure ULTRADESIGN_MODEL or ULTRADESIGN_MODELS.`);
    if (ctx.model?.provider !== model.provider || ctx.model?.id !== model.id) {
      if (!await pi.setModel(model)) throw new Error(`Ultradesign could not select ${config.model}.`);
    }
    pi.setThinkingLevel(config.thinkingLevel);
  };
  for (const event of ["session_start", "session_switch", "session_branch", "session_tree", "session_compact"]) {
    pi.on(event, (_event, ctx) => {
      state = ctx.agent.kind === "main" ? restore(ctx.sessionManager.getBranch()) : undefined;
      status(ctx);
    });
  }
  // The owner's own typed words are the only source of a reply; the model never writes one.
  pi.on("input", (event: { text: string; source: string }, ctx) => {
    if (ctx.agent.kind !== "main" || event.source === "extension" || event.text.trim().startsWith("/")) return;
    const next = captureReply(state, event.text, event.source, new Date().toISOString());
    if (next) persist(next, ctx);
  });
  const handler = async (args: string, ctx: Context) => {
    if (ctx.agent.kind !== "main") throw new Error("Ultradesign commands belong to the main session.");
    const command = args.trim();
    if (command === "status") {
      pi.sendMessage({ customType: "ultradesign:status", content: JSON.stringify(state ?? null, null, 2), display: true, details: state });
      return;
    }
    if (command === "off") {
      if (state) persist({ ...state, active: false }, ctx);
      return;
    }
    if (/^real-user(?:\s|$)/.test(command)) {
      persist(ownerCommand(state, command), ctx);
      pi.sendMessage({ customType: "ultradesign:status", display: true, content: "Real-user evidence recorded.", details: state?.realUser });
      return;
    }
    const decision = /^(approve|revise)(?:\s|$)/.test(command);
    const resume = command === "resume" || (!command && state?.active);
    const next = decision ? ownerCommand(state, command) : resume ? state : start(command);
    if (!next?.active) throw new Error("No active Ultradesign workflow to resume.");
    if (resume && next.pending) {
      pi.sendMessage({ customType: "ultradesign:pending", display: true, details: next.pending, content: pendingSummary(next.pending).join("\n") });
      return;
    }
    if (resume && next.stage === "done") {
      pi.sendMessage({ customType: "ultradesign:status", display: true, content: "Ultradesign workflow is complete.", details: next });
      return;
    }
    await route(next, ctx);
    if (next !== state) persist(next, ctx);
    // OMP owns command expansion. The queued user message is ordinary text.
    pi.sendUserMessage(`Ultradesign ${decision ? "owner decision recorded in checkpoint state" : "request"}. Resume stage ${next.stage}.\n\n${next.brief}`);
  };
  for (const name of ["ud", "ultradesign"]) {
    pi.registerCommand(name, {
      description: "Designer-workflow frontend design: [plan|review|implement] [--full|--short] [--shared] <brief>; approve, revise, real-user, resume, status, off",
      handler,
    });
  }
  pi.registerTool({
    name: "ultradesign_checkpoint",
    label: "Ultradesign checkpoint",
    description: "Inspect the workflow, scope its mode and depth, ask the owner one open question, open a stage gate, resolve the owner's recorded reply, record a review round, or complete the current stage with evidence. Owner replies are recorded by the extension from the owner's own input.",
    loadMode: "essential",
    parameters: Type.Object({
      action: Type.Union(["status", "scope", "ask", "gate", "resolve", "qa_round", "complete"].map(action => Type.Literal(action))),
      mode: Type.Optional(Type.Union([Type.Literal("plan"), Type.Literal("review"), Type.Literal("implement")])),
      depth: Type.Optional(Type.Union([Type.Literal("full"), Type.Literal("short")])),
      include: Type.Optional(Type.Array(Type.Union(optionalStages.map(stage => Type.Literal(stage))), { maxItems: optionalStages.length })),
      stage: Type.Optional(stageType),
      evidence: Type.Optional(Type.Array(text, { minItems: 1 })),
      question: Type.Optional(Type.Object({ text }, { additionalProperties: false })),
      gate: Type.Optional(Type.Object({
        id: Type.Union(gateIds.map(id => Type.Literal(id))),
        artifact: Type.Array(text, { minItems: 1 }),
        reason: text,
        lookAt: Type.Array(text, { minItems: 1, maxItems: 5 }),
        question: text,
      }, { additionalProperties: false })),
      resolution: Type.Optional(Type.Object({
        outcome: Type.Union([Type.Literal("answered"), Type.Literal("approved"), Type.Literal("revise"), Type.Literal("follow_up")]),
        extraction: text,
        quote: Type.Optional(text),
        followUp: Type.Optional(text),
      }, { additionalProperties: false })),
      qaRound: Type.Optional(Type.Object({
        round: Type.Integer({ minimum: 0, maximum: 3 }),
        method: Type.Union([Type.Literal("remorsearch"), Type.Literal("fallback")]),
        reviewer: Type.Union([Type.Literal("independent"), Type.Literal("self")]),
        report: text,
        openFindings: Type.Array(text),
      }, { additionalProperties: false })),
    }, { additionalProperties: false }),
    async execute(_id, params, _signal, _update, ctx) {
      if (ctx.agent.kind !== "main") throw new Error("Only the main session may checkpoint its workflow.");
      if (params.action !== "status") {
        let next: State;
        switch (params.action) {
          case "scope": next = scope(state, { mode: params.mode, depth: params.depth, include: params.include }); break;
          case "ask": next = ask(state, params.question); break;
          case "gate": next = openGate(state, params.gate); break;
          case "resolve": next = resolve(state, params.resolution); break;
          case "qa_round": next = recordQaRound(state, params.qaRound); break;
          case "complete": next = complete(state, params.stage, params.evidence); break;
        }
        if (state?.stage !== next.stage) await route(next, ctx);
        persist(next, ctx);
      }
      return { content: [{ type: "text", text: JSON.stringify(state ?? null) }], details: state ?? null };
    },
  });
  pi.on("before_agent_start", async (event, ctx) => {
    // Child roles/assignments remain host-owned. Never activate parent routing in a child.
    const blocks = event.systemPrompt.filter((block: string) => !/^<omp-ultradesign-policy>/.test(block));
    if (ctx.agent.kind !== "main" || !state?.active) {
      return blocks.length === event.systemPrompt.length ? undefined : { systemPrompt: blocks };
    }
    await route(state, ctx);
    blocks.push(policy(state, skillRoot, portable, process.env));
    return { systemPrompt: blocks };
  });
  pi.on("before_provider_request", (event, ctx) => {
    if (ctx.agent.kind !== "main" || !ctx.model) return;
    return refreshPayload(event.payload, ctx.model.api, state?.active ? policy(state, skillRoot, portable, process.env) : "");
  });
}
