import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { Type } from "@sinclair/typebox";
import { refreshPayload } from "./payload";
import { complete, gateCommand, gateIds, openGate, ownerDecision, policy, portablePolicy, recordQaRound, restore, routeFor, selectMode, stages, start, stateType, type Gate, type Mode, type QaRound, type Stage, type State } from "./workflow";

// OMP 19.0.1 supplies TypeBox through its extension loader, without a package dependency.
interface Model { provider: string; id: string; api: string }
interface Context {
  agent: { kind: "main" | "sub" };
  model?: Model;
  models: { resolve(selector: string): Model | undefined };
  sessionManager: { getBranch(): Array<{ type: string; customType?: string; data?: unknown }> };
  ui: { setStatus(key: string, text: string | undefined): void };
}
interface Api {
  setLabel(label: string): void;
  on(event: string, handler: (event: any, ctx: Context) => any): void;
  registerCommand(name: string, options: { description: string; handler: (args: string, ctx: Context) => Promise<void> }): void;
  registerTool(tool: {
    name: string; label: string; description: string; parameters: unknown; loadMode: "essential";
    execute(id: string, params: { action: "status" | "scope" | "complete" | "gate" | "qa_round"; mode?: Mode; stage?: Stage; evidence?: string[]; gate?: Gate; qaRound?: QaRound },
      signal: AbortSignal | undefined, update: unknown, ctx: Context): Promise<unknown>;
  }): void;
  sendUserMessage(message: string): Promise<void>;
  sendMessage(message: { customType: string; content: string; display: boolean; details?: unknown }): void;
  appendEntry(type: string, data: unknown): void;
  setModel(model: Model): Promise<boolean>;
  setThinkingLevel(level: string): void;
}

export default function ultradesign(pi: Api): void {
  pi.setLabel("ultradesign");
  const skillRoot = fileURLToPath(new URL("../../skills/ultradesign/", import.meta.url));
  const portable = portablePolicy(readFileSync(new URL("../../skills/ultradesign/SKILL.md", import.meta.url), "utf8"));
  let state: State | undefined;
  const status = (ctx: Context) => ctx.ui.setStatus("ultradesign",
    state?.active ? `UD ${state.mode}: ${state.pending ? `waiting for ${state.pending.id}` : state.stage}` : undefined);
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
    const decision = /^(pick|answer|approve|revise)(?:\s|$)/.test(command);
    const resume = command === "resume" || (!command && state?.active);
    const next = decision ? ownerDecision(state, command) : resume ? state : start(command);
    if (!next?.active) throw new Error("No active Ultradesign workflow to resume.");
    if (resume && next.pending) {
      const gate = next.pending;
      pi.sendMessage({ customType: "ultradesign:gate", display: true, details: gate, content: [
        gate.question, ...(gate.options ?? []).map(({ number, label, evidence }) => `${number}. ${label} — ${evidence}`),
        ...(gate.recommended === undefined ? [] : [`Recommended: ${gate.recommended}`]), ...gate.evidence,
        gateCommand(gate.id), `/ud revise ${gate.id} <feedback>`,
      ].join("\n") });
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
    pi.registerCommand(name, { description: "Human-guided design: [plan|review|implement] [--motion] <brief>; pick, answer, approve, revise, resume, status, off", handler });
  }
  pi.registerTool({
    name: "ultradesign_checkpoint",
    label: "Ultradesign checkpoint",
    description: "Inspect the workflow, scope its mode, open a taste gate for the owner, record a QA round, or complete the current stage with evidence. Owner decisions arrive via native /ud commands.",
    loadMode: "essential",
    parameters: Type.Object({
      action: Type.Union([Type.Literal("status"), Type.Literal("scope"), Type.Literal("complete"), Type.Literal("gate"), Type.Literal("qa_round")]),
      mode: Type.Optional(Type.Union([Type.Literal("plan"), Type.Literal("review"), Type.Literal("implement")])),
      stage: Type.Optional(Type.Union(stages.map(stage => Type.Literal(stage)))),
      evidence: Type.Optional(Type.Array(Type.String({ minLength: 1 }), { minItems: 1 })),
      gate: Type.Optional(Type.Object({
        id: Type.Union(gateIds.map(id => Type.Literal(id))),
        question: Type.String({ minLength: 1 }),
        evidence: Type.Array(Type.String({ minLength: 1 }), { minItems: 1 }),
        options: Type.Optional(Type.Array(Type.Object({
          number: Type.Integer({ minimum: 1 }), label: Type.String({ minLength: 1 }), evidence: Type.String({ minLength: 1 }),
        }, { additionalProperties: false }), { minItems: 1, maxItems: 60 })),
        recommended: Type.Optional(Type.Integer({ minimum: 1 })),
      }, { additionalProperties: false })),
      qaRound: Type.Optional(Type.Object({
        round: Type.Integer({ minimum: 0, maximum: 3 }),
        method: Type.Union([Type.Literal("remorsearch"), Type.Literal("fallback")]),
        report: Type.String({ minLength: 1 }),
        openFindings: Type.Array(Type.String({ minLength: 1 })),
      }, { additionalProperties: false })),
    }, { additionalProperties: false }),
    async execute(_id, params, _signal, _update, ctx) {
      if (ctx.agent.kind !== "main") throw new Error("Only the main session may checkpoint its workflow.");
      if (params.action !== "status") {
        let next;
        switch (params.action) {
          case "scope": next = selectMode(state, params.mode); break;
          case "gate": next = openGate(state, params.gate); break;
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
