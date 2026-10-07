import { existsSync, readFileSync, writeFileSync } from "node:fs";

// Persists any JSON value (the list format lives in list.js).
export function fileStore(path) {
  return {
    load() {
      return existsSync(path) ? JSON.parse(readFileSync(path, "utf8")) : [];
    },
    save(data) {
      writeFileSync(path, JSON.stringify(data, null, 2) + "\n");
    },
  };
}

// In-memory store, used by the tests.
export function memoryStore(initial = []) {
  let saved = structuredClone(initial);
  return {
    load() {
      return structuredClone(saved);
    },
    save(data) {
      saved = structuredClone(data);
    },
  };
}
