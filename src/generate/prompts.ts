import type { ParsedDesignDoc } from "../types.js";

const SYSTEM = `You are QAgent, a senior QA architect. Produce professional Simplified Chinese test documentation unless the source is clearly English-only.
All outputs are DRAFT for human review — state that clearly in each document header.
Never claim tests were executed. Do not reference CI or auto-merge.
Link every test case to requirement trace IDs provided in the prompt.`;

export function buildTestPlanPrompt(doc: ParsedDesignDoc): {
  system: string;
  user: string;
} {
  const reqList = doc.requirements
    .map((r) => `- ${r.id}: ${r.title}`)
    .join("\n");
  return {
    system: SYSTEM,
    user: `根据以下设计文档，编写 **测试方案**（测试策略 / test plan）。

要求：
1. 文档开头 YAML frontmatter 含 reviewStatus: draft, artifact: test-plan
2. 覆盖范围、测试层次（单元/集成/E2E/人工）、环境、入口/出口准则、风险与缓解
3. 映射到需求 ID 列表
4. 明确标注「草稿 — 需人工审核」

需求 ID：
${reqList}

设计文档标题：${doc.title}

---
${doc.body.slice(0, 120_000)}
---`,
  };
}

export function buildTestCasesPrompt(doc: ParsedDesignDoc): {
  system: string;
  user: string;
} {
  const reqList = doc.requirements
    .map((r) => `- ${r.id}: ${r.title}`)
    .join("\n");
  return {
    system: SYSTEM,
    user: `根据以下设计文档，编写 **完整测试用例**（人工可执行的用例表）。

要求：
1. Markdown 表格列：用例 ID | 需求追溯 ID | 标题 | 前置条件 | 步骤 | 期望结果 | 优先级 | 类型(功能/接口/UI/...)
2. 每个用例必须填写「需求追溯 ID」（来自下列列表）
3. 文档开头注明 draft；至少 ${Math.min(8, Math.max(4, doc.requirements.length))} 条用例
4. 文末附 JSON 代码块，数组形式，字段：caseId, requirementIds[], title, steps[], expected, priority

需求 ID：
${reqList}

设计文档标题：${doc.title}

---
${doc.body.slice(0, 120_000)}
---`,
  };
}

export function buildAutomationPrompt(doc: ParsedDesignDoc): {
  system: string;
  user: string;
} {
  return {
    system: SYSTEM,
    user: `根据以下设计文档，编写 **自动化测试方案**（不要求生成可运行代码）。

要求：
1. 分三小节：Web 应用、桌面应用、REST API——说明推荐工具栈、分层、数据与环境、哪些用例适合自动化 vs 保持手工
2. 与 v0.1 范围一致：方案级描述即可（Playwright / desktop UI driver / REST contract 等可提及）
3. 标注 draft；含实施阶段划分（Phase 1/2）
4. 引用需求 ID 做自动化优先级排序

需求概要：
${doc.requirements.map((r) => `${r.id}: ${r.title}`).join("\n")}

设计文档标题：${doc.title}

---
${doc.body.slice(0, 120_000)}
---`,
  };
}