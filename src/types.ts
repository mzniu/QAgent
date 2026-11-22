export type ReviewStatus = "draft" | "approved";

export type ArtifactKind =
  | "test-plan"
  | "test-cases"
  | "automation-scheme";

export interface RequirementRef {
  id: string;
  title: string;
  section?: string;
  excerpt?: string;
}

export interface ParsedDesignDoc {
  sourcePath: string;
  format: "markdown" | "docx";
  title: string;
  body: string;
  requirements: RequirementRef[];
}

export interface ArtifactMeta {
  kind: ArtifactKind;
  reviewStatus: ReviewStatus;
  generatedAt: string;
  sourceDocument: string;
  model?: string;
  draft: true;
}

export interface GeneratedArtifact {
  meta: ArtifactMeta;
  markdown: string;
  json?: unknown;
}

export interface GenerationManifest {
  version: "0.1";
  reviewStatus: ReviewStatus;
  draft: true;
  humanReviewRequired: true;
  autoPublish: false;
  generatedAt: string;
  source: {
    path: string;
    format: string;
    title: string;
  };
  artifacts: Array<{
    kind: ArtifactKind;
    markdownFile: string;
    jsonFile?: string;
  }>;
  requirementTraceCount: number;
}