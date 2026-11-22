export interface QAgentConfig {
  anthropicApiKey: string | undefined;
  model: string;
  maxOutputTokens: number;
}

export function loadConfig(): QAgentConfig {
  return {
    anthropicApiKey: process.env.ANTHROPIC_API_KEY?.trim() || undefined,
    model: process.env.QAGENT_MODEL?.trim() || "claude-sonnet-4-20250514",
    maxOutputTokens: Number(process.env.QAGENT_MAX_OUTPUT_TOKENS) || 8192,
  };
}