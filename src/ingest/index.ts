import { extname } from "node:path";
import type { ParsedDesignDoc } from "../types.js";
import { parseDocx } from "./parse-docx.js";
import { parseMarkdown } from "./parse-markdown.js";

export async function ingestDesignDocument(
  path: string,
): Promise<ParsedDesignDoc> {
  const ext = extname(path).toLowerCase();
  if (ext === ".md" || ext === ".markdown") {
    return parseMarkdown(path);
  }
  if (ext === ".docx") {
    return parseDocx(path);
  }
  throw new Error(
    `Unsupported format "${ext}". v0.1 supports .md and .docx only.`,
  );
}

export { extractRequirements } from "./extract-requirements.js";