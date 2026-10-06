import { existsSync, readFileSync, writeFileSync } from "node:fs";

// Persists the list as a JSON array of item names.
export function fileStore(path) {
  return {
    load() {
      return existsSync(path) ? JSON.parse(readFileSync(path, "utf8")) : [];
    },
    save(items) {
      writeFileSync(path, JSON.stringify(items, null, 2) + "\n");
    },
  };
}

// In-memory store, used by the tests.
export function memoryStore(initial = []) {
  let saved = [...initial];
  return {
    load() {
      return [...saved];
    },
    save(items) {
      saved = [...items];
    },
  };
}
