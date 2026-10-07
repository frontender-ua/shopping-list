import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileStore, memoryStore } from "../src/store.js";

function withTempDir(fn) {
  return (t) => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "store-test-"));
    t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
    return fn(dir);
  };
}

test("fileStore load on a missing file returns []", withTempDir((dir) => {
  const store = fileStore(path.join(dir, "list.json"));
  assert.deepEqual(store.load(), []);
}));

test("fileStore save then load returns the items", withTempDir((dir) => {
  const store = fileStore(path.join(dir, "list.json"));
  store.save(["milk", "bread"]);
  assert.deepEqual(store.load(), ["milk", "bread"]);
}));

test("fileStore writes JSON indented by two spaces with a trailing newline", withTempDir((dir) => {
  const file = path.join(dir, "list.json");
  fileStore(file).save(["milk", "bread"]);
  assert.equal(fs.readFileSync(file, "utf8"), '[\n  "milk",\n  "bread"\n]\n');
}));

test("fileStore second save replaces the first", withTempDir((dir) => {
  const store = fileStore(path.join(dir, "list.json"));
  store.save(["milk", "bread"]);
  store.save(["eggs"]);
  assert.deepEqual(store.load(), ["eggs"]);
}));

test("fileStore round-trips an object", withTempDir((dir) => {
  const store = fileStore(path.join(dir, "list.json"));
  store.save({ a: 1 });
  assert.deepEqual(store.load(), { a: 1 });
}));

test("memoryStore load returns the initial items", () => {
  assert.deepEqual(memoryStore(["milk"]).load(), ["milk"]);
});

test("memoryStore load returns a copy", () => {
  const store = memoryStore(["milk"]);
  store.load().push("bread");
  assert.deepEqual(store.load(), ["milk"]);
});

test("memoryStore save keeps a copy", () => {
  const store = memoryStore();
  const items = ["milk"];
  store.save(items);
  items.push("bread");
  assert.deepEqual(store.load(), ["milk"]);
});
