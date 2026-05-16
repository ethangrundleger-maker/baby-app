import Anthropic from "@anthropic-ai/sdk";

let _client: Anthropic | null = null;
export function anthropic() {
  if (_client) return _client;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not configured");
  _client = new Anthropic({ apiKey });
  return _client;
}

export const MODEL_EXTRACT = process.env.ANTHROPIC_MODEL_EXTRACT || "claude-haiku-4-5-20251001";
export const MODEL_SUMMARIZE = process.env.ANTHROPIC_MODEL_SUMMARIZE || "claude-sonnet-4-6";
