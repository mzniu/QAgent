import { readFile } from "node:fs/promises";
import matter from "gray-matter";
import type { ParsedDesignDoc } from "../types.js";
import { extractRequirements } from "./extract-requirements.js";

export async function parseMarkdown(path: string): Promise<ParsedDesignDoc> {
  const raw = await readFile(path, "utf8");
  const { content, data } = matter(raw);
  const title =
    (typeof data.title === "string" && data.title) ||
    content.match(/^#\s+(.+)/m)?.[1]?.trim() ||
    path.split(/[/\\]/).pop()?.replace(/\.md$/i, "") ||
    "Untitled design doc";

  return {
    sourcePath: path,
    format: "markdown",
    title,
    body: content.trim(),
    requirements: extractRequirements(content, title),
  };
}