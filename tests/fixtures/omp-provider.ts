import { appendFileSync } from "node:fs";

/** Installed-host fixture: the real OpenAI transport sends requests to our loopback SSE server. */
export default function localProvider(pi: any) {
  pi.registerProvider("ultradesign-local", {
    api: "openai-completions",
    baseUrl: process.env.ULTRADESIGN_TEST_URL,
    apiKey: "local-scripted-provider",
    models: ["builder", "reference", "architect", "judge"].map(id => ({
      id, name: `Ultradesign local ${id}`, reasoning: false, input: ["text"],
      cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
      contextWindow: 128000, maxTokens: 4096,
    })),
  });
  pi.on("before_agent_start", (event: any, ctx: any) => ({
    systemPrompt: [
      ...event.systemPrompt.filter((block: string) => !block.startsWith("<omp-host-fixture>")),
      `<omp-host-fixture>role=${ctx.agent.kind}; native permissions and task schema belong to OMP.</omp-host-fixture>`,
    ],
  }));
  // Loaded before Ultradesign: record the unrefreshed payload for exact comparison.
  pi.on("before_provider_request", (event: any, ctx: any) => {
    appendFileSync(process.env.ULTRADESIGN_TEST_LOG!, JSON.stringify({ kind: ctx.agent.kind, payload: event.payload }) + "\n");
  });
}
