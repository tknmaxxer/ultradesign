import { join } from "node:path";

export const stateType = "ultradesign:state";
export const stages = ["frame", "structure", "references", "directions", "assets", "system", "motion", "map", "slice", "buildout", "review", "final", "sharing"] as const;
export type Stage = typeof stages[number];
export type Mode = "implement" | "plan" | "review";
export type Depth = "full" | "short";
/** Stages a short run adds only when the brief needs them. */
export const optionalStages = ["references", "assets", "motion", "map", "buildout"] as const satisfies readonly Stage[];
const shortCore: readonly Stage[] = ["frame", "structure", "directions", "system", "slice", "review", "final"];
const planSequence: readonly Stage[] = ["frame", "structure", "references", "directions", "system"];
export const gateIds = ["frame", "structure", "references", "directions", "assets", "system", "motion", "map", "slice", "buildout", "final"] as const;
export type GateId = typeof gateIds[number];
const prompts: Record<Stage, string> = {
  frame: "01-frame.md", structure: "02-structure.md", references: "03-references.md", directions: "04-directions.md",
  assets: "05-assets.md", system: "06-system.md", motion: "07-motion.md", map: "08-map.md", slice: "09-slice.md",
  buildout: "10-buildout.md", review: "11-review.md", final: "12-final.md", sharing: "13-sharing.md",
};
/** The original question plus at most three ladder or follow-up questions per pending item. */
export const maxExchanges = 4;

export interface Gate { id: GateId; artifact: string[]; reason: string; lookAt: string[]; question: string }
export interface Reply { text: string; at: string; source: string }
export interface Exchange { question: string; replies: Reply[]; extraction?: string }
export interface Pending { kind: "gate" | "question"; stage: Stage; gate?: Gate; exchanges: Exchange[] }
export interface Answer { stage: Stage; exchanges: Exchange[] }
export interface Decision { id: GateId; gate: Gate; exchanges: Exchange[]; quote: string; by: "owner-reply" | "owner-command" }
export interface Feedback { id: GateId; gate: Gate; exchanges: Exchange[]; extraction: string; by: "owner-reply" | "owner-command" }
export interface Resolution { outcome: "answered" | "approved" | "revise" | "follow_up"; extraction: string; quote?: string; followUp?: string }
export interface Scope { mode?: Mode; depth?: Depth; include?: Stage[] }
export interface QaRound { round: number; method: "remorsearch" | "fallback"; reviewer: "independent" | "self"; report: string; openFindings: string[] }
export interface State {
  version: 3;
  active: boolean;
  mode: Mode;
  modeLocked: boolean;
  depth?: Depth;
  depthLocked: boolean;
  include: Stage[];
  brief: string;
  shared: boolean;
  stage: Stage | "done";
  checkpoints: Array<{ stage: Stage; evidence: string[] }>;
  pending?: Pending;
  answers: Answer[];
  decisions: Decision[];
  feedback: Feedback[];
  qaRounds: QaRound[];
  realUser: Array<{ note: string; at: string }>;
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
    ?? (stage === "review" ? "anthropic/claude-opus-4-6" : "openai-codex/gpt-6.2-sol");
  const thinkingLevel = (typeof entry === "object" ? entry?.thinkingLevel : undefined)
    ?? env.ULTRADESIGN_THINKING_LEVEL ?? "high";
  if (typeof model !== "string" || !model.trim()) throw new Error(`Invalid ${stage} model.`);
  if (!["off", "minimal", "low", "medium", "high", "xhigh"].includes(thinkingLevel)) {
    throw new Error(`Invalid ${stage} thinkingLevel: ${thinkingLevel}`);
  }
  return { model, thinkingLevel };
}

export function sequence(state: Pick<State, "mode" | "shared" | "depth" | "include">): Stage[] {
  if (state.mode === "plan") return [...planSequence];
  if (state.mode === "review") return ["review"];
  return stages.filter(stage => stage === "sharing" ? state.shared
    : state.depth !== "short" || shortCore.includes(stage) || state.include.includes(stage));
}

const usage = "Usage: /ud [plan|review|implement] [--full|--short] [--shared] <brief>, /ud resume, /ud status, /ud off";

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
  let depth: Depth | undefined;
  for (let flag = /^--([a-z-]+)(?:\s+|$)/.exec(text); flag; flag = /^--([a-z-]+)(?:\s+|$)/.exec(text)) {
    if (flag[1] === "shared") shared = true;
    else if (flag[1] === "full" || flag[1] === "short") {
      if (depth && depth !== flag[1]) throw new Error("Choose --full or --short, not both.");
      depth = flag[1];
    } else throw new Error(`Unknown flag --${flag[1]}. ${usage}`);
    text = text.slice(flag[0].length).trim();
  }
  if (!text) throw new Error(usage);
  if (depth && mode !== "implement") throw new Error("--full and --short apply to implementation only.");
  return {
    version: 3, active: true, mode, modeLocked: !!prefix || reviewAndFix, depth, depthLocked: !!depth, include: [],
    brief: text, shared, stage: mode === "review" ? "review" : "frame",
    checkpoints: [], answers: [], decisions: [], feedback: [], qaRounds: [], realUser: [],
  };
}

function unfinished(state: State | undefined): asserts state is State {
  if (!state?.active || state.stage === "done") throw new Error("No active unfinished Ultradesign workflow.");
}

const nonblank = (value: unknown): value is string => typeof value === "string" && !!value.trim();
const evidenceList = (value: unknown): value is string[] => Array.isArray(value) && value.length > 0 && value.every(nonblank);
const approved = (state: State, id: GateId) => state.decisions.some(decision => decision.id === id);
const squash = (value: string) => value.replace(/\s+/g, " ").trim();

export function scope(state: State | undefined, request: Scope | undefined): State {
  unfinished(state);
  if (!request || (request.mode === undefined && request.depth === undefined && request.include === undefined)) {
    throw new Error("Scope needs a mode, a depth, or the optional stages to include.");
  }
  let next = state;
  if (request.mode !== undefined) {
    if (next.modeLocked) throw new Error("The workflow mode is already selected.");
    if (!["implement", "plan", "review"].includes(request.mode)) throw new Error("Select plan, review, or implement.");
    next = { ...next, mode: request.mode, modeLocked: true, stage: request.mode === "review" ? "review" : "frame" };
  }
  if (request.depth !== undefined || request.include !== undefined) {
    if (next.mode !== "implement") throw new Error("Depth applies to implementation; plan and review have fixed sequences.");
    if (next.stage !== "frame") throw new Error("State the depth during frame, before the brief is checkpointed.");
    if (next.depthLocked && request.depth !== undefined && request.depth !== next.depth) {
      throw new Error(`The owner started this run with --${next.depth}.`);
    }
    const depth = request.depth ?? next.depth;
    if (depth !== "full" && depth !== "short") throw new Error("Depth is full or short.");
    const include = request.include ?? (depth === "short" ? next.include : []);
    if (!Array.isArray(include) || include.some(stage => !(optionalStages as readonly string[]).includes(stage))
      || new Set(include).size !== include.length) {
      throw new Error(`Include lists distinct optional stages: ${optionalStages.join(", ")}.`);
    }
    if (depth === "full" && include.length) throw new Error("A full run already includes every stage.");
    next = { ...next, depth, include: stages.filter(stage => include.includes(stage)) };
  }
  return next;
}

const closedEnglish = /^\s*(?:is|are|am|was|were|do|does|did|can|could|should|would|will|shall|may|have|has|had)\b/i;
const closedKorean = /(?:괜찮(?:나요|아요|습니까|을까요|은가요|죠)|맞(?:나요|아요|습니까|죠|을까요)|(?:할|갈|될|볼|드릴|해도\s*될)까요|좋(?:나요|아요|을까요|습니까))\s*[?？]?\s*$/;
const menu = /(?:^|\s)(?:\(?[1-9][.)]\s|[1-9]번|option\s+[1-9]|pick\s+(?:one|\d)|choose\s+(?:one|between)|yes\s+or\s+no|하나를?\s*고르)/i;

/** Rejects the question shapes the workflow forbids; it cannot prove a question is a good one. */
export function openQuestion(question: unknown): string {
  if (!nonblank(question)) throw new Error("Ask one open question.");
  const text = question.trim();
  if (closedEnglish.test(text) || closedKorean.test(text)) {
    throw new Error("Ask an open question the owner answers by describing (where, what, why), not yes/no.");
  }
  if (menu.test(text)) throw new Error("Do not offer numbered options or a choice; make the call and ask an open question about it.");
  return text;
}

export function ask(state: State | undefined, question: { text?: unknown } | undefined): State {
  unfinished(state);
  if (state.pending) throw new Error(`Owner reply pending for the open ${state.pending.kind}.`);
  const text = openQuestion(question?.text);
  return { ...state, pending: { kind: "question", stage: state.stage as Stage, exchanges: [{ question: text, replies: [] }] } };
}

function gatedStage(state: State, stage: Stage): boolean {
  if (!(gateIds as readonly string[]).includes(stage) || stage === "buildout") return false;
  return !(state.mode === "plan" && stage === "system");
}

export function openGate(state: State | undefined, gate: Gate | undefined): State {
  unfinished(state);
  if (state.pending) throw new Error(`Owner reply pending for the open ${state.pending.kind}.`);
  if (!gate || !gateIds.includes(gate.id) || !evidenceList(gate.artifact) || !nonblank(gate.reason)
    || !evidenceList(gate.lookAt) || gate.lookAt.length > 5) {
    throw new Error("A gate needs its ID, the artifact links, a one-line reason tied to the brief, and 1–5 things to look at.");
  }
  const stage = state.stage as Stage;
  const allowed = gate.id === stage && (gatedStage(state, stage) || stage === "buildout");
  if (!allowed) throw new Error(`Current gate: ${gatedStage(state, stage) ? stage : stage === "buildout" ? "buildout" : "none"}.`);
  if (gate.id !== "buildout" && approved(state, gate.id)) throw new Error(`The owner already approved ${gate.id}.`);
  const question = openQuestion(gate.question);
  const recorded: Gate = { id: gate.id, artifact: gate.artifact.map(squash), reason: gate.reason.trim(), lookAt: gate.lookAt.map(squash), question };
  return { ...state, pending: { kind: "gate", stage, gate: recorded, exchanges: [{ question, replies: [] }] } };
}

/** Called only by the extension's input hook with the owner's own typed text, never by the model. */
export function captureReply(state: State | undefined, text: string, source: string, at: string): State | undefined {
  if (!state?.active || !state.pending || !nonblank(text)) return undefined;
  const exchanges = state.pending.exchanges;
  const last = exchanges[exchanges.length - 1];
  const replies = [...last.replies, { text: text.trim(), at, source }];
  return { ...state, pending: { ...state.pending, exchanges: [...exchanges.slice(0, -1), { ...last, replies }] } };
}

export function resolve(state: State | undefined, resolution: Resolution | undefined): State {
  unfinished(state);
  const pending = state.pending;
  if (!pending) throw new Error("Nothing is waiting for an owner reply.");
  const exchanges = pending.exchanges;
  const last = exchanges[exchanges.length - 1];
  if (!last.replies.length) throw new Error("No owner reply has arrived; wait for the owner's own words.");
  if (!resolution || !nonblank(resolution.extraction)) {
    throw new Error("Record the extraction: what the reply means as an observable requirement or element → user effect → expected state.");
  }
  const extraction = resolution.extraction.trim();
  const closed = [...exchanges.slice(0, -1), { ...last, extraction }];
  switch (resolution.outcome) {
    case "follow_up": {
      if (exchanges.length >= maxExchanges) {
        throw new Error("Three follow-ups have been asked; restate what you extracted and resolve with the best reading.");
      }
      const question = openQuestion(resolution.followUp);
      return { ...state, pending: { ...pending, exchanges: [...closed, { question, replies: [] }] } };
    }
    case "answered":
      if (pending.kind !== "question") throw new Error("A gate resolves as approved, revise or follow_up.");
      return { ...state, pending: undefined, answers: [...state.answers, { stage: pending.stage, exchanges: closed }] };
    case "approved": {
      if (pending.kind !== "gate" || !pending.gate) throw new Error("Only a gate can be approved.");
      const quote = nonblank(resolution.quote) ? squash(resolution.quote) : "";
      const said = exchanges.flatMap(exchange => exchange.replies).some(reply => squash(reply.text).includes(quote));
      if (quote.length < 2 || !said) {
        throw new Error("Approval needs a verbatim quote from the owner's reply that tells you to go ahead.");
      }
      return { ...state, pending: undefined, decisions: [...state.decisions, { id: pending.gate.id, gate: pending.gate, exchanges: closed, quote, by: "owner-reply" }] };
    }
    case "revise":
      if (pending.kind !== "gate" || !pending.gate) throw new Error("A question resolves as answered or follow_up.");
      return { ...state, pending: undefined, feedback: [...state.feedback, { id: pending.gate.id, gate: pending.gate, exchanges: closed, extraction, by: "owner-reply" }] };
    default:
      throw new Error("Outcome is answered, approved, revise or follow_up.");
  }
}

// Called only by the native command handler, never by the model's checkpoint tool.
export function ownerCommand(state: State | undefined, command: string): State {
  const [verb, ...args] = command.trim().split(/\s+/);
  if (verb === "real-user") {
    if (!state) throw new Error("No Ultradesign workflow to record real-user evidence for.");
    const note = args.join(" ").trim();
    if (!note) throw new Error("Usage: /ud real-user <what real users did and what happened>");
    return { ...state, realUser: [...state.realUser, { note, at: new Date().toISOString() }] };
  }
  unfinished(state);
  const pending = state.pending;
  const gate = pending?.kind === "gate" ? pending.gate : undefined;
  if (!pending || !gate) throw new Error("No gate is open.");
  const [id, ...words] = args;
  if (id !== gate.id || (verb !== "approve" && verb !== "revise")) {
    throw new Error(`Gate ${gate.id} is open; reply in your own words, or use /ud approve ${gate.id} or /ud revise ${gate.id} <feedback>.`);
  }
  if (verb === "approve") {
    const quote = words.join(" ").trim() || "approve";
    return { ...state, pending: undefined, decisions: [...state.decisions, { id: gate.id, gate, exchanges: pending.exchanges, quote, by: "owner-command" }] };
  }
  const note = words.join(" ").trim();
  if (!note) throw new Error(`Usage: /ud revise ${gate.id} <feedback>`);
  return { ...state, pending: undefined, feedback: [...state.feedback, { id: gate.id, gate, exchanges: pending.exchanges, extraction: note, by: "owner-command" }] };
}

export function recordQaRound(state: State | undefined, entry: QaRound | undefined): State {
  unfinished(state);
  if (state.stage !== "review") throw new Error("QA rounds belong to the review stage.");
  const round = state.qaRounds.length;
  if (round > 3) throw new Error("Review is limited to a baseline and three fix/replay rounds.");
  if (round > 0 && state.mode === "review") throw new Error("Read-only review records the baseline only.");
  if (entry?.round !== round || !["remorsearch", "fallback"].includes(entry.method)
    || !["independent", "self"].includes(entry.reviewer) || !nonblank(entry.report)
    || !Array.isArray(entry.openFindings) || !entry.openFindings.every(nonblank)) {
    throw new Error(`Record review round ${round} with method, reviewer, report and open finding IDs.`);
  }
  return { ...state, qaRounds: [...state.qaRounds, entry] };
}

export function complete(state: State | undefined, stage: Stage | undefined, evidence: string[] | undefined): State {
  unfinished(state);
  if (state.stage !== stage) throw new Error(`Current stage is ${state.stage}; checkpoint that stage, not ${stage}.`);
  if (!evidenceList(evidence)) {
    throw new Error("Checkpoint evidence must contain concrete artifact paths, observations, or verification results.");
  }
  if (state.pending) throw new Error(`Owner reply pending for the open ${state.pending.kind}.`);
  if (stage === "frame" && state.mode === "implement" && !state.depth) {
    throw new Error("State the depth with action=\"scope\" (full or short, plus included stages) before completing frame.");
  }
  if (gatedStage(state, stage) && !approved(state, stage as GateId)) {
    throw new Error(`Checkpoint requires the owner's approval of the ${stage} gate.`);
  }
  if (stage === "review" && !state.qaRounds.length) throw new Error("Record the review baseline before completion.");
  const order = sequence(state);
  return {
    ...state,
    modeLocked: true,
    depthLocked: state.depthLocked || stage === "frame",
    stage: order[order.indexOf(stage) + 1] ?? "done",
    checkpoints: [...state.checkpoints, { stage, evidence: evidence.map(item => item.trim()) }],
  };
}

export function restore(branch: Array<{ type: string; customType?: string; data?: unknown }>): State | undefined {
  let state: State | undefined;
  for (const entry of branch) {
    if (entry.type !== "custom" || entry.customType !== stateType) continue;
    const candidate = entry.data as State | undefined;
    if (candidate?.version === 3 && typeof candidate.active === "boolean"
      && ["implement", "plan", "review"].includes(candidate.mode)
      && typeof candidate.modeLocked === "boolean" && typeof candidate.depthLocked === "boolean"
      && (candidate.depth === undefined || candidate.depth === "full" || candidate.depth === "short")
      && (stages.includes(candidate.stage as Stage) || candidate.stage === "done")
      && typeof candidate.brief === "string" && typeof candidate.shared === "boolean"
      && [candidate.include, candidate.checkpoints, candidate.answers, candidate.decisions, candidate.feedback,
        candidate.qaRounds, candidate.realUser].every(Array.isArray)) state = candidate;
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

export function pendingSummary(pending: Pending): string[] {
  const current = pending.exchanges[pending.exchanges.length - 1].question;
  if (pending.kind === "question") return [current, "Answer in your own words."];
  const gate = pending.gate!;
  return [
    `Gate: ${gate.id}`, `Why: ${gate.reason}`, ...gate.artifact.map(item => `Artifact: ${item}`),
    ...gate.lookAt.map((item, index) => `Look at ${index + 1}: ${item}`), current,
    `Reply in your own words. To record directly: /ud approve ${gate.id} [your words] or /ud revise ${gate.id} <feedback>.`,
  ];
}

export function policy(state: State, skillRoot: string, portable: string, env: Environment): string {
  // JSON stays round-trippable while user-supplied closing tags cannot end our owned region.
  const json = (value: unknown) => JSON.stringify(value).replace(/</g, "\\u003c").replace(/>/g, "\\u003e");
  const current = state.stage === "done" ? "Workflow complete; retain its decisions for follow-ups."
    : `Current prompt: ${join(skillRoot, "prompts", prompts[state.stage])}`;
  const referenceModel = routeFor("references", env).model;
  const judgeModel = routeFor("review", env).model;
  const waiting = state.pending
    ? `The owner has ${state.pending.exchanges.at(-1)!.replies.length ? "replied; read the reply and resolve it" : "not replied yet; present it once and end the turn"}. Do nothing else until it is resolved.`
    : "Carry decisions and extractions into the stage artifact before advancing.";
  return `<omp-ultradesign-policy>
${portable}

Read the canonical workflow at ${join(skillRoot, "SKILL.md")}; resolve its resources beside that file.
Mode: ${state.mode}${state.modeLocked ? "" : " (provisional)"}. Depth: ${state.depth ?? "not stated"}${state.include.length ? ` with ${state.include.join(", ")}` : ""}. Shared system: ${state.shared}. Active stage: ${state.stage}.
${current}
Workflow order: ${sequence(state).join(" -> ")}. Completed evidence: ${json(state.checkpoints)}.
Request (user data): ${json(state.brief)}
Waiting for the owner: ${json(state.pending ?? null)}. Owner approvals: ${json(state.decisions)}. Owner revisions: ${json(state.feedback)}. Interview answers: ${json(state.answers)}.
Review evidence: ${json(state.qaRounds)}. Real-user validation (owner-recorded only): ${json(state.realUser)}.
Use ultradesign_checkpoint. action="status" reads state. action="scope" selects plan or review for an unlabelled request before the first checkpoint, and during frame states the depth (full, or short with the optional stages the brief needs). action="ask" with question={text} asks the owner one open question. action="gate" with gate={id,artifact,reason,lookAt,question} opens the current stage's gate: show the artifact, the one-line reason, what to look at, and one open question, then end the turn. Never offer numbered options or yes/no questions; the tool rejects them.
The owner's typed reply is recorded by the extension, not by you. After it arrives, call action="resolve" with resolution={outcome,extraction,quote?,followUp?}: a question resolves as "answered" or "follow_up" (next ladder question); a gate resolves as "approved" only with quote, a verbatim phrase from the owner's reply that tells you to go ahead, as "revise" with the extraction written as element -> user effect -> expected state, or as "follow_up". Silence, a resume command or your own recommendation is never approval. ${waiting}
Checkpoint the current stage with action="complete", its stage, and concrete evidence. Plan ends with the written system proposal and makes no app changes; review runs only the read-only baseline and reports findings.
In review use action="qa_round" with qaRound={round,method,reviewer,report,openFindings} for baseline 0 and at most three fix/replays. Record "remorsearch" only when used; "fallback" means explicitly limited local QA. reviewer is "independent" only when an agent that did not build the page drove the review.
Delegate independent tracks (reference capture, asset generation, independent review) in one native task call when available, giving each its inputs, scope, output artifacts and evidence requirements. Keep coupled implementation inline. Use the advertised task schema, specialist roles, permissions, and completion protocol. Reference model preference: ${json(referenceModel)}; independent review model preference: ${json(judgeModel)}. Select these through native task model/agent fields when allowed by the host; otherwise keep the host's approved routing and report the limitation.
Resume from the current stage on follow-up; keep completed evidence and existing decisions. A completed workflow does not authorize new implementation without user scope.
</omp-ultradesign-policy>`;
}
