type ObjectValue = Record<string, unknown>;
const region = /<omp-ultradesign-policy>[\s\S]*?<\/omp-ultradesign-policy>/g;
const object = (value: unknown): value is ObjectValue => value !== null && typeof value === "object" && !Array.isArray(value);

/** Only replace our complete block in provider-owned system fields, never tools or user data. */
export function refreshPayload(payload: unknown, api: string, replacement: string): unknown {
  const text = (value: unknown): unknown => typeof value === "string"
    ? value.replace(region, () => replacement) : value;
  const field = (value: unknown, key: string, rewrite: (value: unknown) => unknown): unknown => {
    if (!object(value)) return value;
    const next = rewrite(value[key]);
    return next === value[key] ? value : { ...value, [key]: next };
  };
  const array = (value: unknown, rewrite: (value: unknown) => unknown): unknown => {
    if (!Array.isArray(value)) return value;
    const next = value.map(rewrite);
    return next.every((item, index) => item === value[index]) ? value : next;
  };
  const blocks = (value: unknown): unknown => typeof value === "string" ? text(value)
    : array(value, block => object(block) && (block.type === undefined || block.type === "text" || block.type === "input_text")
      ? field(block, "text", text) : block);
  const messages = (value: unknown): unknown => array(value, message =>
    object(message) && ["system", "developer"].includes(String(message.role))
      && (message.type === undefined || message.type === "message")
      ? field(message, "content", blocks) : message);
  const google = (value: unknown): unknown => field(value, "systemInstruction", instruction =>
    typeof instruction === "string" ? text(instruction) : field(instruction, "parts", blocks));
  switch (api) {
    case "openai-responses":
    case "openai-codex-responses":
    case "azure-openai-responses":
      return field(field(payload, "instructions", text), "input", messages);
    case "openai-completions":
    case "openrouter":
    case "ollama":
    case "ollama-chat":
      return field(payload, "messages", messages);
    case "anthropic-messages":
      return field(payload, "system", blocks);
    case "google-generative-ai":
    case "google-vertex":
      return field(google(payload), "config", google);
    case "google-gemini-cli":
    case "antigravity-cli":
      return field(payload, "request", google);
    case "bedrock-converse-stream":
      return field(field(payload, "system", blocks), "commandInput", value => field(value, "system", blocks));
    case "cursor-agent":
      return field(payload, "customSystemPrompt", text);
    default:
      return payload;
  }
}
