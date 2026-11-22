import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type {
  ArtifactKind,
  GeneratedArtifact,
  GenerationManifest,
  ParsedDesignDoc,
} from "../types.js";

const FILE_NAMES: Record<ArtifactKind, { md: string; json?: string }> = {
  "test-plan": { md: "draft-01-测试方案.md" },
  "test-cases": {
    md: "draft-02-完整测试用例.md",
    json: "draft-02-完整测试用例.json",
  },
  "automation-scheme": { md: "draft-03-自动化测试方案.md" },
};

export async function writeArtifacts(
  outDir: string,
  doc: ParsedDesignDoc,
  artifacts: GeneratedArtifact[],
): Promise<GenerationManifest> {
  await mkdir(outDir, { recursive: true });

  const manifestEntries: GenerationManifest["artifacts"] = [];

  for (const art of artifacts) {
    const names = FILE_NAMES[art.meta.kind];
    const mdPath = join(outDir, names.md);
    await writeFile(mdPath, art.markdown, "utf8");
    const entry: GenerationManifest["artifacts"][number] = {
      kind: art.meta.kind,
      markdownFile: names.md,
    };
    if (names.json && art.json !== undefined) {
      const jsonPath = join(outDir, names.json);
      await writeFile(jsonPath, JSON.stringify(art.json, null, 2), "utf8");
      entry.jsonFile = names.json;
    }
    manifestEntries.push(entry);
    await writeFile(
      join(outDir, `${names.md}.meta.json`),
      JSON.stringify(art.meta, null, 2),
      "utf8",
    );
  }

  const manifest: GenerationManifest = {
    version: "0.1",
    reviewStatus: "draft",
    draft: true,
    humanReviewRequired: true,
    autoPublish: false,
    generatedAt: new Date().toISOString(),
    source: {
      path: doc.sourcePath,
      format: doc.format,
      title: doc.title,
    },
    artifacts: manifestEntries,
    requirementTraceCount: doc.requirements.length,
  };

  await writeFile(
    join(outDir, "draft-manifest.json"),
    JSON.stringify(manifest, null, 2),
    "utf8",
  );

  return manifest;
}