import { execFile } from "node:child_process";
import { readFileSync } from "node:fs";
import { copyFile, mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { Type } from "@sinclair/typebox";
import { recordContract, staticServer, rendererEnv } from "./run.mjs";

const scripts = fileURLToPath(new URL("../skills/ultradesign/scripts/", import.meta.url));
const exec = promisify(execFile);
const text = (value: string) => ({ content: [{ type: "text", text: value }] });

export default function evaluationBrowser(pi: any) {
  const evidence = process.env.UD_EVAL_EVIDENCE;
  if (!evidence) throw new Error("Missing private evaluation evidence directory.");
  const cwd = process.cwd();
  let seed: string | null = null;
  try { seed = readFileSync(join(cwd, "index.html"), "utf8"); }
  catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; }
  const uv = process.env.UD_EVAL_UV ?? "uv";
  const env = rendererEnv(process.env, process.env);
  let reference = 0;
  let render = 0;
  let contractRecorded = false;
  const browser = (script: string, args: string[], signal?: AbortSignal) =>
    exec(uv, ["run", "--script", join(scripts, script), ...args], { cwd, env, signal, timeout: 150_000 });
  const report = async (out: string) =>
    text(`Captured files (open the PNGs with read):\n${(await readdir(out)).sort().map(file => join(out, file)).join("\n")}`);

  pi.registerTool({
    name: "ud_eval_capture_reference",
    label: "Capture private reference",
    description: "Capture an agent-selected public HTTPS reference (full pages and named CSS regions at 390/768/1440px). Returns absolute paths for image inspection and to revise the private pattern note. Does not log in or reuse assets.",
    loadMode: "essential",
    parameters: Type.Object({
      url: Type.String({ minLength: 1, maxLength: 2048 }),
      regions: Type.Array(Type.String({ minLength: 3, maxLength: 256 }), { minItems: 1, maxItems: 3, description: "Named selectors such as task=main > section:first-child" }),
      ready: Type.Optional(Type.String({ minLength: 1, maxLength: 256, description: "CSS selector that becomes visible once the real content is loaded" })),
      pattern: Type.String({ minLength: 1, maxLength: 700 }),
      why: Type.String({ minLength: 1, maxLength: 700 }),
      adapt: Type.String({ minLength: 1, maxLength: 700 }),
    }, { additionalProperties: false }),
    async execute(_id: string, params: { url: string; regions: string[]; pattern: string; why: string; adapt: string; ready?: string }, signal?: AbortSignal) {
      if (reference >= 5) throw new Error("Five candidate capture attempts used; record remaining gaps.");
      const attempt = ++reference;
      const out = join(evidence, `reference-${attempt}`);
      try {
        await browser("reference-capture.py", [`--url=${params.url}`, `--out=${out}`,
          `--pattern=${params.pattern}`, `--why=${params.why}`, `--adapt=${params.adapt}`,
          ...(params.ready ? [`--ready=${params.ready}`] : []),
          ...params.regions.map(region => `--region=${region}`)], signal);
      } catch (error: any) {
        const detail = String(error?.stderr ?? "").trim().split("\n").find(line =>
          /net::ERR_[A-Z_]+|reference did not load|no key region matched|TimeoutError|error:/.test(line));
        const summary = `Reference capture did not complete.${detail ? ` ${detail.trim().slice(0, 350)}` : ""}`;
        await writeFile(join(evidence, `reference-${attempt}-failure.txt`), `${params.url}\n${summary}\n`, { mode: 0o600 });
        throw new Error(`${summary} Choose another public candidate or selector.`);
      }
      return report(out);
    },
  });
  pi.registerTool({
    name: "ud_eval_record_contract",
    label: "Record design contract before UI",
    description: "Snapshot the written design-contract.md before any recreation or route code is written. Use the design-contract template section headings. A settings seed may remain unchanged.",
    loadMode: "essential",
    parameters: Type.Object({}, { additionalProperties: false }),
    async execute() {
      const candidates = (await readdir(evidence)).filter(name => /^reference-\d+$/.test(name));
      const captures = await Promise.all(candidates.map(async name =>
        (await stat(join(evidence, name, "pattern.md")).catch(() => null))?.isFile()));
      if (!captures.some(Boolean)) throw new Error("Finish and inspect a public reference capture at all three widths before recording the contract.");
      const recorded = await recordContract(cwd, evidence, seed);
      contractRecorded = true;
      return text(`Contract recorded before UI code: ${recorded}`);
    },
  });
  pi.registerTool({
    name: "ud_eval_render",
    label: "Render local study or route",
    description: "After recording the design contract, render study.html (private project-data recreation) or index.html (adapted route). Saves viewport PNGs and checks in private evidence; open them with read and compare at matched widths.",
    loadMode: "essential",
    parameters: Type.Object({
      view: Type.Union([Type.Literal("study"), Type.Literal("route")]),
      reducedMotion: Type.Optional(Type.Boolean()),
    }, { additionalProperties: false }),
    async execute(_id: string, params: { view: "study" | "route"; reducedMotion?: boolean }, signal?: AbortSignal) {
      if (!contractRecorded) throw new Error("Call ud_eval_record_contract before writing and rendering the study or route.");
      if (render >= 10) throw new Error("Ten local renders used; work from the captured evidence.");
      const file = params.view === "study" ? "study.html" : "index.html";
      const path = join(cwd, file);
      await readFile(path);
      const out = join(evidence, `${params.view}-${++render}`);
      await mkdir(out);
      const server = await staticServer(cwd);
      try {
        await browser("visual-qa.py", ["--url", new URL(file, server.url).href, "--out", out, "--local-only",
          "--grid", "4", "--motion", params.reducedMotion ? "reduce" : "no-preference"], signal);
        if (params.view === "study") await copyFile(path, join(out, file));
      } finally { await server.close(); }
      return report(out);
    },
  });
}
