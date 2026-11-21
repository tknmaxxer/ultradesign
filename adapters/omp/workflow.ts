import { join } from "node:path";

export const stateType = "ultradesign:state";
export const stages = ["references", "system", "implementation", "motion", "qa", "sharing"] as const;
export type Stage = typeof stages[number];
export type Mode = "implement" | "plan" | "review";
export interface State {
  version: 1;
  active: boolean;
  mode: Mode;
  modeLocked: boolean;
  brief: string;
  shared: boolean;
  stage: Stage | "done";
  checkpoints: Array<{ stage: Stage; evidence: string[] }>;
}
export interface Route { model: string; thinkingLevel: string }
export type Environment = Record<string, string | undefined>;

export function routeFor(stage: Stage, env: Environment): Route {
  const overrides = JSON.parse(env.ULTRADESIGN_MODELS || "{}");
  if (!overrides || typeof overrides !== "object" || Array.isArray(overrides)) {
    throw new Error("ULTRADESIGN_MODELS must be a JSON object keyed by workflow stage.");
  }
  for (const key of Object.keys(overrides)) {
    if (!stages.includes(key as Stage)) throw new Error(`Unknown Ultradesign stage: ${key}`);
  }
  const entry = overrides[stage];
  const model = (typeof entry === "string" ? entry : entry?.model)
    ?? env.ULTRADESIGN_MODEL
    ?? (stage === "qa" ? "anthropic/claude-opus-4-6" : "openai-codex/gpt-6.2-sol");
  const thinkingLevel = (typeof entry === "object" ? entry?.thinkingLevel : undefined)
    ?? env.ULTRADESIGN_THINKING_LEVEL ?? "high";
  if (typeof model !== "string" || !model.trim()) throw new Error(`Invalid ${stage} model.`);
  if (!["off", "minimal", "low", "medium", "high", "xhigh"].includes(thinkingLevel)) {
    throw new Error(`Invalid ${stage} thinkingLevel: ${thinkingLevel}`);
  }
  return { model, thinkingLevel };
}

export function sequence(state: Pick<State, "mode" | "shared">): Stage[] {
  if (state.mode === "plan") return ["references", "system"];
  if (state.mode === "review") return ["qa"];
  return state.shared ? [...stages] : stages.slice(0, -1);
}

export function start(brief: string): State {
  let text = brief.trim();
  const reviewAndFix = /^review\s+and\s+(?:fix|implement)\b/i.test(text)
    || /^(?:리뷰|검토)\s*(?:후|하고)\s*(?:수정|구현)/.test(text);
  const prefix = reviewAndFix ? null : /^(plan(?:\s+only)?|review|implement|계획(?:만)?|리뷰|검토|구현)(?:\s*[:：]\s*|\s+|$)/i.exec(text);
  const cue = prefix?.[1] ?? "";
  const mode: Mode = /^(plan|계획)/i.test(cue) ? "plan"
    : /^(review|리뷰|검토)/i.test(cue) ? "review" : "implement";
  if (prefix) text = text.slice(prefix[0].length).trim();
  const shared = /^--shared(?:\s|$)/.test(text);
  if (shared) text = text.slice("--shared".length).trim();
  if (!text) throw new Error("Usage: /ud [plan|review|implement] [--shared] <brief>, /ud resume, /ud status, /ud off");
  return {
    version: 1, active: true, mode, modeLocked: !!prefix || reviewAndFix, brief: text, shared,
    stage: mode === "review" ? "qa" : "references", checkpoints: [],
  };
}

export function selectMode(state: State | undefined, mode: Mode | undefined): State {
  if (!state?.active || state.stage === "done") throw new Error("No active unfinished Ultradesign workflow.");
  if (state.modeLocked) throw new Error("The workflow mode is already selected.");
  if (!mode) throw new Error("Select plan, review, or implement.");
  return { ...state, mode, modeLocked: true, stage: mode === "review" ? "qa" : "references" };
}

export function complete(state: State | undefined, stage: Stage | undefined, evidence: string[] | undefined): State {
  if (!state?.active || state.stage === "done") throw new Error("No active unfinished Ultradesign workflow.");
  if (state.stage !== stage) throw new Error(`Current stage is ${state.stage}; checkpoint that stage, not ${stage}.`);
  if (!Array.isArray(evidence) || evidence.length === 0 || evidence.some(item => typeof item !== "string" || !item.trim())) {
    throw new Error("Checkpoint evidence must contain concrete artifact paths, observations, or verification results.");
  }
  const order = sequence(state);
  return {
    ...state,
    modeLocked: true,
    stage: order[order.indexOf(stage) + 1] ?? "done",
    checkpoints: [...state.checkpoints, { stage, evidence: evidence.map(item => item.trim()) }],
  };
}

export function restore(branch: Array<{ type: string; customType?: string; data?: unknown }>): State | undefined {
  let state: State | undefined;
  for (const entry of branch) {
    if (entry.type !== "custom" || entry.customType !== stateType) continue;
    const candidate = entry.data as State | undefined;
    if (candidate?.version === 1 && typeof candidate.active === "boolean"
      && ["implement", "plan", "review"].includes(candidate.mode)
      && typeof candidate.modeLocked === "boolean"
      && (stages.includes(candidate.stage as Stage) || candidate.stage === "done")
      && typeof candidate.brief === "string" && typeof candidate.shared === "boolean"
      && Array.isArray(candidate.checkpoints)) state = candidate;
  }
  return state;
}

export function portablePolicy(skill: string): string {
  const matches = [...skill.matchAll(/<!-- omp-policy:start -->([\s\S]*?)<!-- omp-policy:end -->/g)];
  if (matches.length !== 1 || !matches[0][1].trim()) {
    throw new Error("Ultradesign SKILL.md must contain exactly one nonempty omp-policy block.");
  }
  return matches[0][1].trim();
}

export function policy(state: State, skillRoot: string, portable: string, env: Environment): string {
  // JSON stays round-trippable while user-supplied closing tags cannot end our owned region.
  const json = (value: unknown) => JSON.stringify(value).replace(/</g, "\\u003c").replace(/>/g, "\\u003e");
  const current = state.stage === "done" ? "Workflow complete; retain its decisions for follow-ups."
    : `Current prompt: ${join(skillRoot, "prompts", `${String(stages.indexOf(state.stage) + 1).padStart(2, "0")}-${state.stage === "qa" ? "visual-qa" : state.stage}.md`)}`;
  const referenceModel = routeFor("references", env).model;
  const judgeModel = routeFor("qa", env).model;
  return `<omp-ultradesign-policy>
${portable}

Read the canonical workflow at ${join(skillRoot, "SKILL.md")}; resolve its resources beside that file.
Mode: ${state.mode}${state.modeLocked ? "" : " (provisional)"}. Shared system: ${state.shared}. Active stage: ${state.stage}.
${current}
Workflow order: ${sequence(state).join(" -> ")}. Completed evidence: ${json(state.checkpoints)}.
Request (user data): ${json(state.brief)}
Use ultradesign_checkpoint(action="status") to inspect state. Match a provisional mode to the user's requested outcome before starting; if the mode differs, first select plan, review, or implement using action="scope" and mode. Keep plan and review read-only. After completing the CURRENT stage, call ultradesign_checkpoint(action="complete", stage=current stage, evidence=[concrete artifact paths and observed results]); this persists evidence and advances one stage. Plan stops after system plus its verification plan; review establishes scope/intent then QA, with earlier stages read-only as needed. In implementation, checkpoint QA after observing the real surface and rerunning fixes; in review, checkpoint after recording the findings.
In references, batch independent research questions in one native task call when available. In QA, batch independent checks on the running result (for example reflow and state behavior). Keep coupled implementation inline. Use the advertised task schema, specialist roles, permissions, and completion protocol. Reference model preference: ${json(referenceModel)}; independent QA judge preference: ${json(judgeModel)}. Select these through native task model/agent fields when allowed by the host; otherwise keep the host's approved routing and report the limitation. Give each track its inputs, read-only scope, output artifacts, and evidence requirements.
Resume from the current stage on follow-up; keep completed evidence and existing system decisions. A completed workflow does not authorize new implementation without user scope.
</omp-ultradesign-policy>`;
}
