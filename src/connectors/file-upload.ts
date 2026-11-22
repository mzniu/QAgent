import { ingestDesignDocument } from "../ingest/index.js";
import type { DocumentConnector } from "./types.js";

export const fileUploadConnector: DocumentConnector = {
  kind: "file-upload",
  id: "local-file",
  async fetch(localPath: string) {
    return ingestDesignDocument(localPath);
  },
};