#!/usr/bin/env node
import { resolve } from "node:path";
import { loadConfig } from "./config.js";
import { fileUploadConnector } from "./connectors/file-upload.js";
import { createConnectorRegistry } from "./connectors/registry.js";
import { runGenerationPipeline } from "./generate/pipeline.js";
import { writeArtifacts } from "./output/writer.js";
import { handleGitHubPullRequestWebhook } from "./webhooks/github-pr.js";

function printHelp(): void {
  console.log(`QAgent v0.1 — design doc → test artifacts (draft only)

Usage:
  qagent generate <file.md|.docx> [-o output-dir] [--mock]
  qagent connectors list
  qagent webhook github-pr --dry-run

Environment:
  ANTHROPIC_API_KEY   Required for live Claude generation (unless --mock)
  QAGENT_MODEL        Optional model id (default: claude-sonnet-4-20250514)

Outputs (all marked draft until human review):
  1. 测试方案
  2. 完整测试用例 (with requirement trace IDs)
  3. 自动化测试方案
`);
}

function parseArgs(argv: string[]): {
  command: string;
  positional: string[];
  flags: Record<string, string | boolean>;
} {
  const flags: Record<string, string | boolean> = {};
  const positional: string[] = [];
  let i = 0;
  const command = argv[i++] ?? "help";
  while (i < argv.length) {
    const a = argv[i]!;
    if (a === "--mock") {
      flags.mock = true;
      i++;
    } else if (a === "--dry-run") {
      flags.dryRun = true;
      i++;
    } else if (a === "-o" || a === "--output") {
      flags.output = argv[++i] ?? "./output";
      i++;
    } else if (a.startsWith("-")) {
      throw new Error(`Unknown flag: ${a}`);
    } else {
      positional.push(a);
      i++;
    }
  }
  return { command, positional, flags };
}

async function cmdGenerate(
  file: string,
  outDir: string,
  mock: boolean,
): Promise<void> {
  const doc = await fileUploadConnector.fetch(resolve(file));
  const cfg = loadConfig();
  if (!mock && !cfg.anthropicApiKey) {
    console.error(
      "ANTHROPIC_API_KEY not set; re-running with --mock for this demo.",
    );
    mock = true;
  }
  console.log(`Ingested: ${doc.title} (${doc.requirements.length} requirement refs)`);
  const artifacts = await runGenerationPipeline(doc, cfg, { mock });
  const manifest = await writeArtifacts(outDir, doc, artifacts);
  console.log(`Wrote draft artifacts → ${resolve(outDir)}`);
  console.log(`Manifest: ${resolve(outDir, "draft-manifest.json")}`);
  console.log(
    JSON.stringify(
      {
        reviewStatus: manifest.reviewStatus,
        humanReviewRequired: manifest.humanReviewRequired,
        artifacts: manifest.artifacts,
      },
      null,
      2,
    ),
  );
}

async function main(): Promise<void> {
  const { command, positional, flags } = parseArgs(process.argv.slice(2));

  if (command === "help" || command === "-h" || command === "--help") {
    printHelp();
    return;
  }

  if (command === "generate") {
    const file = positional[0];
    if (!file) {
      throw new Error("Missing input file. Example: qagent generate fixtures/sample-design-doc.md");
    }
    const outDir =
      typeof flags.output === "string" ? flags.output : "./output";
    await cmdGenerate(file, outDir, Boolean(flags.mock));
    return;
  }

  if (command === "connectors") {
    const sub = positional[0];
    const registry = createConnectorRegistry();
    if (sub === "list") {
      for (const c of registry.list()) {
        console.log(`${c.id}\t${c.kind}`);
      }
      return;
    }
  }

  if (command === "webhook") {
    const sub = positional[0];
    if (sub === "github-pr") {
      const result = await handleGitHubPullRequestWebhook(
        {
          action: "opened",
          number: 0,
          repository: { full_name: "example/repo" },
          pull_request: {
            title: "stub",
            html_url: "https://github.com/example/repo/pull/0",
            head: { sha: "0000" },
          },
        },
        { dryRun: true, webhookSecret: process.env.GITHUB_WEBHOOK_SECRET },
      );
      console.log(JSON.stringify(result, null, 2));
      return;
    }
  }

  printHelp();
  process.exitCode = 1;
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;
});