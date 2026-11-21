import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { Type } from "@sinclair/typebox";
import { refreshPayload } from "./payload";
import { complete, policy, portablePolicy, restore, routeFor, selectMode, stages, start, stateType, type Mode, type Stage, type State } from "./workflow";

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
    execute(id: string, params: { action: "status" | "scope" | "complete"; mode?: Mode; stage?: Stage; evidence?: string[] },
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
  const status = (ctx: Context) => ctx.ui.setStatus("ultradesign", state?.active ? `UD ${state.mode}: ${state.stage}` : undefined);
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
    const next = command === "resume" || (!command && state?.active) ? state : start(command);
    if (!next?.active) throw new Error("No active Ultradesign workflow to resume.");
    await route(next, ctx);
    if (next !== state) persist(next, ctx);
    // OMP owns command expansion. The queued user message is ordinary text.
    pi.sendUserMessage(`Ultradesign request. Resume stage ${next.stage}.\n\n${next.brief}`);
  };
  for (const name of ["ud", "ultradesign"]) {
    pi.registerCommand(name, { description: "Reference-led design: [plan|review|implement] [--shared] <brief>; resume, status, off", handler });
  }
  pi.registerTool({
    name: "ultradesign_checkpoint",
    label: "Ultradesign checkpoint",
    description: "Inspect the active workflow, select the user-requested scope for a provisional mode, or complete its current stage with evidence and advance once.",
    loadMode: "essential",
    parameters: Type.Object({
      action: Type.Union([Type.Literal("status"), Type.Literal("scope"), Type.Literal("complete")]),
      mode: Type.Optional(Type.Union([Type.Literal("plan"), Type.Literal("review"), Type.Literal("implement")])),
      stage: Type.Optional(Type.Union(stages.map(stage => Type.Literal(stage)))),
      evidence: Type.Optional(Type.Array(Type.String({ minLength: 1 }), { minItems: 1 })),
    }, { additionalProperties: false }),
    async execute(_id, params, _signal, _update, ctx) {
      if (ctx.agent.kind !== "main") throw new Error("Only the main session may checkpoint its workflow.");
      if (params.action !== "status") {
        const next = params.action === "scope" ? selectMode(state, params.mode) : complete(state, params.stage, params.evidence);
        await route(next, ctx);
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
