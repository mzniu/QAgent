import { fileUploadConnector } from "./file-upload.js";
import {
  confluenceConnector,
  httpUrlConnector,
  notionConnector,
} from "./stubs.js";
import type { ConnectorRegistry, DocumentConnector } from "./types.js";

export function createConnectorRegistry(): ConnectorRegistry {
  const map = new Map<string, DocumentConnector>();

  const builtin = [
    fileUploadConnector,
    httpUrlConnector,
    confluenceConnector,
    notionConnector,
  ];
  for (const c of builtin) {
    map.set(c.id, c);
  }

  return {
    register(connector) {
      map.set(connector.id, connector);
    },
    get(id) {
      return map.get(id);
    },
    list() {
      return [...map.values()];
    },
  };
}