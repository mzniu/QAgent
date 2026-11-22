import type { ArtifactKind, GeneratedArtifact, ParsedDesignDoc } from "../types.js";

function draftHeader(kind: ArtifactKind, title: string): string {
  return `---
reviewStatus: draft
artifact: ${kind}
draft: true
humanReviewRequired: true
title: ${title}
---

> **草稿（Draft）** — 未经人工审核，不得用于发布、PR 评论或 CI 门禁。
`;
}

export function generateMockArtifacts(
  doc: ParsedDesignDoc,
): GeneratedArtifact[] {
  const at = new Date().toISOString();
  const base = {
    reviewStatus: "draft" as const,
    generatedAt: at,
    sourceDocument: doc.sourcePath,
    model: "mock-v0.1",
    draft: true as const,
  };

  const planMd = `${draftHeader("test-plan", "测试方案")}
# 测试方案：${doc.title}

## 1. 目标与范围
验证设计文档「${doc.title}」中列出的功能与非功能需求。

## 2. 需求追溯
${doc.requirements.map((r) => `- **${r.id}** — ${r.title}`).join("\n")}

## 3. 测试层次
| 层次 | 说明 |
|------|------|
| 单元 | 核心领域逻辑与纯函数 |
| 集成 | 模块/API 契约 |
| E2E / 手工 | 关键用户路径、跨端场景 |

## 4. 环境与数据
- 测试环境：与生产隔离的 staging
- 测试数据：脱敏样本 + 合成数据

## 5. 入口 / 出口准则
- 入口：设计文档评审通过、构建可部署
- 出口：P0/P1 用例通过，已知缺陷已记录

## 6. 风险
- 需求变更未同步用例 → 定期对照 ${doc.requirements[0]?.id ?? "REQ-001"}
`;

  const caseRows = doc.requirements.slice(0, 8).map((r, i) => {
    const cid = `TC-${String(i + 1).padStart(3, "0")}`;
    return `| ${cid} | ${r.id} | ${r.title.slice(0, 40)} | 测试账号已就绪 | 1. 打开功能入口 2. 执行主流程 | 符合设计描述 | P1 | 功能 |`;
  });

  const casesMd = `${draftHeader("test-cases", "完整测试用例")}
# 完整测试用例 — ${doc.title}

| 用例 ID | 需求追溯 ID | 标题 | 前置条件 | 步骤 | 期望结果 | 优先级 | 类型 |
|---------|-------------|------|----------|------|----------|--------|------|
${caseRows.join("\n")}

\`\`\`json
${JSON.stringify(
    doc.requirements.slice(0, 8).map((r, i) => ({
      caseId: `TC-${String(i + 1).padStart(3, "0")}`,
      requirementIds: [r.id],
      title: r.title,
      steps: ["打开功能入口", "执行主流程"],
      expected: "行为符合设计文档",
      priority: "P1",
    })),
    null,
    2,
  )}
\`\`\`
`;

  const autoMd = `${draftHeader("automation-scheme", "自动化测试方案")}
# 自动化测试方案 — ${doc.title}

## Web 应用
- **工具**：Playwright（Chromium/Firefox）
- **范围**：冒烟 + 核心回归；页面对象分层
- **手工保留**：复杂多因素权限、视觉验收

## 桌面应用
- **工具**：WinAppDriver / 厂商 UI 自动化（按技术栈选型）
- **范围**：安装/升级、托盘、离线场景抽样
- **手工保留**：打印机/外设、OCR 误报复核

## REST API
- **工具**：pytest + requests 或 REST Client 集合；契约对照 OpenAPI（后续）
- **范围**：鉴权、CRUD、错误码、幂等
- **手工保留**：渗透类、性能基准（非 v0.1 范围）

## 自动化优先级（关联需求）
${doc.requirements
  .slice(0, 6)
  .map((r) => `- ${r.id}: API/集成优先，UI 冒烟次之`)
  .join("\n")}

## 阶段划分
- **Phase 1**：API + Web 冒烟
- **Phase 2**：桌面关键路径 + 数据驱动回归
`;

  return [
    {
      meta: { ...base, kind: "test-plan" },
      markdown: planMd,
    },
    {
      meta: { ...base, kind: "test-cases" },
      markdown: casesMd,
      json: JSON.parse(
        casesMd.match(/```json\n([\s\S]*?)\n```/)?.[1] ?? "[]",
      ),
    },
    {
      meta: { ...base, kind: "automation-scheme" },
      markdown: autoMd,
    },
  ];
}