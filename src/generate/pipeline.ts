import type { QAgentConfig } from "../config.js";
import { completeWithClaude } from "./claude.js";
import { generateMockArtifacts } from "./mock.js";
import {
  buildAutomationPrompt,
  buildTestCasesPrompt,
  buildTestPlanPrompt,
} from "./prompts.js";
import type { GeneratedArtifact, ParsedDesignDoc } from "../types.js";

function wrapArtifact(
  kind: GeneratedArtifact["meta"]["kind"],
  doc: ParsedDesignDoc,
  markdown: string,
  model: string,
  json?: unknown,
): GeneratedArtifact {
  return {
    meta: {
      kind,
      reviewStatus: "draft",
      generatedAt: new Date().toISOString(),
      sourceDocument: doc.sourcePath,
      model,
      draft: true,
    },
    markdown:
      markdown.includes("reviewStatus: draft") ||
      markdown.includes("草稿")
        ? markdown
        : `---
reviewStatus: draft
draft: true
humanReviewRequired: true
artifact: ${kind}
---

> **草稿（Draft）** — 需人工审核。

${markdown}`,
    json,
  };
}

function tryParseCasesJson(markdown: string): unknown | undefined {
  const m = markdown.match(/```json\n([\s\S]*?)\n```/);
  if (!m) return undefined;
  try {
    return JSON.parse(m[1]!);
  } catch {
    return undefined;
  }
}

export async function runGenerationPipeline(
  doc: ParsedDesignDoc,
  cfg: QAgentConfig,
  options: { mock: boolean },
): Promise<GeneratedArtifact[]> {
  if (options.mock) {
    return generateMockArtifacts(doc);
  }

  const planPrompt = buildTestPlanPrompt(doc);
  const casesPrompt = buildTestCasesPrompt(doc);
  const autoPrompt = buildAutomationPrompt(doc);

  const [planMd, casesMd, autoMd] = await Promise.all([
    completeWithClaude(cfg, planPrompt.system, planPrompt.user),
    completeWithClaude(cfg, casesPrompt.system, casesPrompt.user),
    completeWithClaude(cfg, autoPrompt.system, autoPrompt.user),
  ]);

  return [
    wrapArtifact("test-plan", doc, planMd, cfg.model),
    wrapArtifact(
      "test-cases",
      doc,
      casesMd,
      cfg.model,
      tryParseCasesJson(casesMd),
    ),
    wrapArtifact("automation-scheme", doc, autoMd, cfg.model),
  ];
}