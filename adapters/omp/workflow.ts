import { join } from "node:path";

export const stateType = "ultradesign:state";
export const stages = ["frame", "references", "interview", "system", "catalog", "map", "generate", "qa", "motion", "final", "sharing"] as const;
export type Stage = typeof stages[number];
export type Mode = "implement" | "plan" | "review";
export const interviewAxes = ["direction", "typography", "palette", "status", "density"] as const;
export const gateIds = ["references", ...interviewAxes, "system", "catalog", "map", "final"] as const;
const approvalGates: readonly GateId[] = ["system", "catalog", "map", "final"];
const stageGates: readonly Stage[] = ["references", "catalog", "map", "final"];
type GateId = typeof gateIds[number];
export interface Option { number: number; label: string; evidence: string }
export interface Gate {
  id: GateId;
  question: string;
  evidence: string[];
  options?: Option[];
  recommended?: number;
}
interface Decision extends Gate { choices: number[]; note?: string }
export interface QaRound { round: number; method: "remorsearch" | "fallback"; report: string; openFindings: string[] }
export interface State {
  version: 2;
  active: boolean;
  mode: Mode;
  modeLocked: boolean;
  brief: string;
  shared: boolean;
  motion: boolean;
  stage: Stage | "done";
  checkpoints: Array<{ stage: Stage; evidence: string[] }>;
  pending?: Gate;
  decisions: Decision[];
  feedback: Array<{ id: GateId; note: string }>;
  qaRounds: QaRound[];
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

export function sequence(state: Pick<State, "mode" | "shared" | "motion">): Stage[] {
  if (state.mode === "plan") return ["frame", "references", "interview", "system"];
  if (state.mode === "review") return ["qa"];
  return stages.filter(stage => (stage !== "sharing" || state.shared) && (stage !== "motion" || state.motion));
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
  let shared = false;
  let motion = false;
  for (let flag = /^--(shared|motion)(?:\s+|$)/.exec(text); flag; flag = /^--(shared|motion)(?:\s+|$)/.exec(text)) {
    if (flag[1] === "shared") shared = true;
    else motion = true;
    text = text.slice(flag[0].length).trim();
  }
  if (!text) throw new Error("Usage: /ud [plan|review|implement] [--motion] [--shared] <brief>, /ud resume, /ud status, /ud off");
  return {
    version: 2, active: true, mode, modeLocked: !!prefix || reviewAndFix, brief: text, shared, motion,
    stage: mode === "review" ? "qa" : "frame", checkpoints: [], decisions: [], feedback: [], qaRounds: [],
  };
}

export function selectMode(state: State | undefined, mode: Mode | undefined): State {
  if (!state?.active || state.stage === "done") throw new Error("No active unfinished Ultradesign workflow.");
  if (state.modeLocked) throw new Error("The workflow mode is already selected.");
  if (!mode) throw new Error("Select plan, review, or implement.");
  return { ...state, mode, modeLocked: true, stage: mode === "review" ? "qa" : "frame" };
}

function unfinished(state: State | undefined): asserts state is State {
  if (!state?.active || state.stage === "done") throw new Error("No active unfinished Ultradesign workflow.");
}

const nonblank = (value: unknown): value is string => typeof value === "string" && !!value.trim();
const evidenceList = (value: unknown): value is string[] => Array.isArray(value) && value.length > 0 && value.every(nonblank);
const approved = (state: State, id: GateId) => state.decisions.some(decision => decision.id === id);

export function openGate(state: State | undefined, gate: Gate | undefined): State {
  unfinished(state);
  if (state.pending) throw new Error(`Owner decision pending: ${state.pending.id}.`);
  if (!gate || !gateIds.includes(gate.id) || !nonblank(gate.question) || !evidenceList(gate.evidence)) {
    throw new Error("A taste gate needs its ID, a question, and concrete evidence.");
  }
  const expects = state.stage === "interview" ? interviewAxes.find(id => !approved(state, id))
    : stageGates.includes(state.stage as Stage) || (state.stage === "system" && state.mode === "implement") ? state.stage : undefined;
  if (approved(state, gate.id)) throw new Error(`The owner already answered ${gate.id}.`);
  if (gate.id !== expects) throw new Error(`Current taste gate: ${expects ?? "none"}.`);
  const options = gate.options;
  if (approvalGates.includes(gate.id)) {
    if (options !== undefined || gate.recommended !== undefined) throw new Error("An approval gate has no numbered options.");
  } else {
    const minimum = gate.id === "references" ? 1 : 2;
    const maximum = gate.id === "references" ? 60 : 5;
    if (!Array.isArray(options) || options.length < minimum || options.length > maximum
      || options.some(option => !option || !Number.isSafeInteger(option.number) || option.number < 1 || !nonblank(option.label) || !nonblank(option.evidence))
      || new Set(options.map(option => option.number)).size !== options.length) {
      throw new Error(`Supply ${minimum}–${maximum} distinct numbered options with labels and evidence.`);
    }
    if ((gate.id !== "references" || gate.recommended !== undefined) && !options.some(option => option.number === gate.recommended)) {
      throw new Error("Recommend one of the numbered options.");
    }
  }
  return { ...state, pending: gate };
}

export function gateCommand(id: GateId): string {
  if (id === "references") return "/ud pick <n>[,<n>,<n>] [why]";
  if (approvalGates.includes(id)) return `/ud approve ${id}`;
  return `/ud answer ${id} <n> [why]`;
}

// Called only by the native command handler, never by the model's checkpoint tool.
export function ownerDecision(state: State | undefined, command: string): State {
  unfinished(state);
  const gate = state.pending;
  if (!gate) throw new Error("No taste gate is pending.");
  const [verb, ...args] = command.split(/\s+/);
  let choices: number[] = [];
  let note: string | undefined;
  const mismatch = () => new Error(`Owner decision pending for ${gate.id}; use ${gateCommand(gate.id)} or /ud revise ${gate.id} <feedback>.`);
  if (verb === "revise") {
    const [id, ...feedback] = args;
    if (id !== gate.id || !feedback.length) throw mismatch();
    return { ...state, pending: undefined, feedback: [...state.feedback, { id: gate.id, note: feedback.join(" ") }] };
  }
  if (gate.id === "references" && verb === "pick") {
    const [values, ...why] = args;
    if (!values || !/^\d+(?:,\d+)*$/.test(values)) throw mismatch();
    choices = values.split(",").map(Number);
    if (choices.length > 3) throw new Error("Pick 1–3 reference numbers.");
    if (new Set(choices).size !== choices.length) throw new Error("Pick distinct reference numbers.");
    if (choices.some(choice => !gate.options?.some(option => option.number === choice))) throw new Error("Pick numbers on the current reference board.");
    note = why.join(" ") || undefined;
  } else if (approvalGates.includes(gate.id)) {
    if (verb !== "approve" || args.length !== 1 || args[0] !== gate.id) throw mismatch();
  } else if (verb === "answer") {
    const [id, value, ...why] = args;
    if (id !== gate.id || !value || !/^\d+$/.test(value) || !gate.options?.some(option => option.number === Number(value))) throw mismatch();
    choices = [Number(value)];
    note = why.join(" ") || undefined;
  } else {
    throw mismatch();
  }
  return { ...state, pending: undefined, decisions: [...state.decisions, { ...gate, choices, note }] };
}

export function recordQaRound(state: State | undefined, entry: QaRound | undefined): State {
  unfinished(state);
  if (state.stage !== "qa") throw new Error("QA rounds belong to the QA stage.");
  const round = state.qaRounds.length;
  if (round > 3) throw new Error("QA is limited to a baseline and three fix/replay rounds.");
  if (round > 0 && state.mode === "review") throw new Error("Read-only review records the baseline only.");
  if (entry?.round !== round || !["remorsearch", "fallback"].includes(entry.method) || !nonblank(entry.report)
    || !Array.isArray(entry.openFindings) || !entry.openFindings.every(nonblank)) {
    throw new Error(`Record QA round ${round} with method, report and open finding IDs.`);
  }
  return { ...state, qaRounds: [...state.qaRounds, entry] };
}

export function complete(state: State | undefined, stage: Stage | undefined, evidence: string[] | undefined): State {
  unfinished(state);
  if (state.stage !== stage) throw new Error(`Current stage is ${state.stage}; checkpoint that stage, not ${stage}.`);
  if (!evidenceList(evidence)) {
    throw new Error("Checkpoint evidence must contain concrete artifact paths, observations, or verification results.");
  }
  if (state.pending) throw new Error(`Owner decision pending: ${state.pending.id}.`);
  const required: readonly GateId[] = stage === "interview" ? interviewAxes
    : stageGates.includes(stage) || (stage === "system" && state.mode === "implement") ? [stage as GateId] : [];
  const missing = required.find(id => !approved(state, id));
  if (missing) throw new Error(`Checkpoint requires an owner decision for ${missing}.`);
  if (stage === "qa" && !state.qaRounds.length) throw new Error("Record the QA baseline before completion.");
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
    if (candidate?.version === 2 && typeof candidate.active === "boolean"
      && ["implement", "plan", "review"].includes(candidate.mode)
      && typeof candidate.modeLocked === "boolean"
      && (stages.includes(candidate.stage as Stage) || candidate.stage === "done")
      && typeof candidate.brief === "string" && typeof candidate.shared === "boolean" && typeof candidate.motion === "boolean"
      && Array.isArray(candidate.checkpoints) && Array.isArray(candidate.decisions)
      && Array.isArray(candidate.feedback) && Array.isArray(candidate.qaRounds)) state = candidate;
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
Mode: ${state.mode}${state.modeLocked ? "" : " (provisional)"}. Shared system: ${state.shared}. Motion requested: ${state.motion}. Active stage: ${state.stage}.
${current}
Workflow order: ${sequence(state).join(" -> ")}. Completed evidence: ${json(state.checkpoints)}.
Request (user data): ${json(state.brief)}
Open owner gate: ${json(state.pending ?? null)}. Owner decisions: ${json(state.decisions)}. Owner feedback: ${json(state.feedback)}.
QA evidence: ${json(state.qaRounds)}.
Inspect persisted state with ultradesign_checkpoint(action="status"). Use action="scope" to select read-only plan or review when an unlabelled request actually asks for one. Checkpoint the current stage with action="complete", its stage, and concrete evidence. Plan ends at the system plan; review runs only the QA baseline and reports findings.
Open the reference, interview, system, catalog, map and final gates using action="gate" and a gate object with id, question and evidence array. For reference and interview choices include options ({number,label,evidence}); for each interview axis (${interviewAxes.join(", ")}, in order) include the recommended option number. Present the gate and end the turn. Only the user's native /ud decision command records a choice or approval. Use /ud revise <gate-id> <feedback> to request an updated gate. ${state.pending ? `The only active gate is ${state.pending.id}; present its evidence and ask the user to run ${gateCommand(state.pending.id)}. Wait at this gate.` : "Carry decisions into the stage artifact before advancing."}
Use action="qa_round" with qaRound={round,method,report,openFindings} for baseline 0 and at most three fix/replays. Record Remorsearch as "remorsearch" only when used; "fallback" means explicitly limited local QA.
In references, batch independent research questions in one native task call when available. In QA, batch independent checks on the running result (for example reflow and state behavior). Keep coupled implementation inline. Use the advertised task schema, specialist roles, permissions, and completion protocol. Reference model preference: ${json(referenceModel)}; independent QA judge preference: ${json(judgeModel)}. Select these through native task model/agent fields when allowed by the host; otherwise keep the host's approved routing and report the limitation. Give each track its inputs, read-only scope, output artifacts, and evidence requirements.
Resume from the current stage on follow-up; keep completed evidence and existing system decisions. A completed workflow does not authorize new implementation without user scope.
</omp-ultradesign-policy>`;
}
