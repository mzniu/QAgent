import Anthropic from "@anthropic-ai/sdk";
import type { QAgentConfig } from "../config.js";

export async function completeWithClaude(
  cfg: QAgentConfig,
  system: string,
  user: string,
): Promise<string> {
  if (!cfg.anthropicApiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set. Export it or use --mock for offline smoke tests.",
    );
  }
  const client = new Anthropic({ apiKey: cfg.anthropicApiKey });
  const message = await client.messages.create({
    model: cfg.model,
    max_tokens: cfg.maxOutputTokens,
    system,
    messages: [{ role: "user", content: user }],
  });
  const text = message.content
    .filter((b) => b.type === "text")
    .map((b) => ("text" in b ? b.text : ""))
    .join("\n")
    .trim();
  if (!text) {
    throw new Error("Claude returned empty text.");
  }
  return text;
}