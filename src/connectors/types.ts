import type { ParsedDesignDoc } from "../types.js";

/** v0.1: only local file upload is implemented; other connectors are stubs. */
export type ConnectorKind = "file-upload" | "http-url" | "confluence" | "notion";

export interface DocumentConnector {
  readonly kind: ConnectorKind;
  /** Human-readable connector id for configuration files (Phase 1). */
  readonly id: string;
  fetch(input: string): Promise<ParsedDesignDoc>;
}

export interface ConnectorRegistry {
  register(connector: DocumentConnector): void;
  get(id: string): DocumentConnector | undefined;
  list(): DocumentConnector[];
}