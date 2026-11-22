import { readFile } from "node:fs/promises";
import mammoth from "mammoth";
import type { ParsedDesignDoc } from "../types.js";
import { extractRequirements } from "./extract-requirements.js";

export async function parseDocx(path: string): Promise<ParsedDesignDoc> {
  const buffer = await readFile(path);
  const result = await mammoth.extractRawText({ buffer });
  const body = result.value.trim();
  const title =
    body.match(/^(.{1,120})/m)?.[1]?.trim() ||
    path.split(/[/\\]/).pop()?.replace(/\.docx$/i, "") ||
    "Untitled design doc";

  return {
    sourcePath: path,
    format: "docx",
    title,
    body,
    requirements: extractRequirements(body, title),
  };
}