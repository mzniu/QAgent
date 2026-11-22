import type { DocumentConnector } from "./types.js";

function notImplemented(kind: string): DocumentConnector {
  return {
    kind: kind as DocumentConnector["kind"],
    id: `stub-${kind}`,
    async fetch() {
      throw new Error(
        `Connector "${kind}" is not wired in v0.1. Use local file upload (CLI path argument).`,
      );
    },
  };
}

/** Phase 1 placeholders — interfaces only for v0.1 DoD. */
export const httpUrlConnector = notImplemented("http-url");
export const confluenceConnector = notImplemented("confluence");
export const notionConnector = notImplemented("notion");