# QAgent

Project workspace for **QAgent** — turns development / design documents into QA artifacts with **human review before anything is published**.

v0.1 scope (per [project context](https://github.com/mzniu/QAgent/blob/main/docs/project-context.md)):

| Input | Output (all **draft**) |
|-------|------------------------|
| Local `.md` or `.docx` upload (CLI) | 1. 测试方案 · 2. 完整测试用例（含需求追溯 ID）· 3. 自动化测试方案 |

Non-goals in v0.1: security pen-test features, coverage KPI gates, auto PR comments, CI merge blocking.

Architecture notes: inspired by [NiuClaude](https://github.com/mzniu/NiuClaude) patterns (Claude backend, env-based secrets); **not** a NiuClaude plugin. GitHub PR webhooks and extra document connectors are **interface stubs** only.

## Quickstart

```bash
git clone https://github.com/mzniu/QAgent.git
cd QAgent
npm install

# Offline smoke (no API key)
npm run smoke

# Or explicitly:
npm run dev -- generate fixtures/sample-design-doc.md -o ./output --mock

# Live generation (Claude)
export ANTHROPIC_API_KEY=sk-ant-...
npm run dev -- generate fixtures/sample-design-doc.md -o ./output
```

After generation, inspect `./output/`:

- `draft-01-测试方案.md`
- `draft-02-完整测试用例.md` (+ optional `.json`)
- `draft-03-自动化测试方案.md`
- `draft-manifest.json` — `reviewStatus: draft`, `humanReviewRequired: true`, `autoPublish: false`

## CLI

```bash
npx tsx src/cli.ts generate <file.md|.docx> [-o dir] [--mock]
npx tsx src/cli.ts connectors list
npx tsx src/cli.ts webhook github-pr --dry-run
```

## Environment

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Live mode | Anthropic API key (same pattern as NiuClaude / Claude tools) |
| `QAGENT_MODEL` | No | Default `claude-sonnet-4-20250514` |
| `QAGENT_MAX_OUTPUT_TOKENS` | No | Default `8192` |
| `GITHUB_WEBHOOK_SECRET` | Phase 1 | Stub webhook only in v0.1 |

Copy `.env.example` to `.env` locally (never commit secrets).

## Repository layout

```
fixtures/           Sample design doc for smoke tests
src/
  cli.ts            CLI entrypoint
  ingest/           Markdown & Word parsing + requirement extraction
  generate/         Claude + mock pipelines, prompts
  output/           Draft artifact writer + manifest
  connectors/       File upload (v0.1) + stub connectors
  webhooks/         GitHub PR handler stub
docs/               Project context
```

## Human review principle

Every artifact filename is prefixed with `draft-` and manifest/metadata flags **`draft: true`**. Do not treat outputs as approved test baselines until a human updates review status (automation for approval is out of v0.1 scope).

## License

MIT