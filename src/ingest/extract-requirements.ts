import type { RequirementRef } from "../types.js";

const HEADING_RE = /^(#{1,6})\s+(.+)$/gm;
const NUMBERED_REQ_RE =
  /^(?:\d+[.)]\s*|[-*]\s+)?(?:REQ[-_]?)?(\d+)[.:）\s]+(.+)$/gim;
function slugId(n: number, title: string): string {
  const slug = title
    .replace(/\s+/g, "-")
    .replace(/[^\w\u4e00-\u9fff-]/g, "")
    .slice(0, 40);
  return `REQ-${String(n).padStart(3, "0")}${slug ? `-${slug}` : ""}`;
}

export function extractRequirements(
  body: string,
  defaultTitle: string,
): RequirementRef[] {
  const found: RequirementRef[] = [];
  let seq = 0;

  const headings: Array<{ level: number; title: string; index: number }> = [];
  let m: RegExpExecArray | null;
  while ((m = HEADING_RE.exec(body)) !== null) {
    headings.push({
      level: m[1].length,
      title: m[2].trim(),
      index: m.index,
    });
  }

  for (let i = 0; i < headings.length; i++) {
    const h = headings[i];
  const isReqLike =
      /需求|功能|requirement|scope|验收|acceptance|场景|用户故事|user story/i.test(
        h.title,
      );
    if (!isReqLike && h.level > 2) continue;
    const start = h.index;
    const end = headings[i + 1]?.index ?? body.length;
    const sectionBody = body.slice(start, end).trim();
    const lines = sectionBody.split("\n").filter((l) => l.trim());
    const excerpt = lines.slice(1, 4).join(" ").slice(0, 240);

    seq += 1;
    found.push({
      id: slugId(seq, h.title),
      title: h.title,
      section: `§${seq}`,
      excerpt: excerpt || undefined,
    });
  }

  if (found.length === 0) {
    const blocks = body.split(/\n{2,}/).filter((b) => b.trim().length > 40);
    for (const block of blocks.slice(0, 12)) {
      const firstLine = block.split("\n")[0]?.trim() ?? defaultTitle;
      seq += 1;
      found.push({
        id: slugId(seq, firstLine),
        title: firstLine.slice(0, 120),
        excerpt: block.slice(0, 200),
      });
    }
  }

  if (found.length === 0) {
    found.push({
      id: "REQ-001",
      title: defaultTitle,
      excerpt: body.slice(0, 200),
    });
  }

  NUMBERED_REQ_RE.lastIndex = 0;
  while ((m = NUMBERED_REQ_RE.exec(body)) !== null) {
    const title = m[2].trim();
    if (found.some((r) => r.title === title)) continue;
    seq += 1;
    found.push({ id: slugId(seq, title), title, excerpt: title });
  }

  return found.slice(0, 32);
}