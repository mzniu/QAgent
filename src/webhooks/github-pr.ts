/**
 * GitHub PR webhook handler — stub for v0.1.
 * Full wiring (signature verify, doc fetch, artifact PR comments) lands in Phase 1.
 */

export interface GitHubPullRequestEvent {
  action: string;
  number: number;
  repository: { full_name: string };
  pull_request: {
    title: string;
    html_url: string;
    head: { sha: string };
  };
}

export interface GitHubPrWebhookConfig {
  /** Shared secret for `X-Hub-Signature-256` (Phase 1). */
  webhookSecret?: string;
  /** When true, still never auto-publish comments in v0.1. */
  dryRun: boolean;
}

export interface GitHubPrWebhookResult {
  handled: false;
  reason: string;
  suggestedNextSteps: string[];
}

export async function handleGitHubPullRequestWebhook(
  _payload: GitHubPullRequestEvent,
  config: GitHubPrWebhookConfig,
): Promise<GitHubPrWebhookResult> {
  return {
    handled: false,
    reason:
      "v0.1: PR webhook interface only — events are not processed; human review required before any PR comment.",
    suggestedNextSteps: [
      "Run `qagent generate <design-doc>` locally with the uploaded design artifact.",
      "Review draft outputs under `output/` before sharing.",
      config.webhookSecret
        ? "Webhook secret configured (verification stub in Phase 1)."
        : "Set GITHUB_WEBHOOK_SECRET in Phase 1.",
    ],
  };
}