import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileStore, memoryStore } from "../src/store.js";

function withTempFile(fn) {
  const dir = mkdtempSync(path.join(tmpdir(), "store-test-"));
  try {
    fn(path.join(dir, "list.json"));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

test("fileStore load returns [] when the file does not exist", () => {
  withTempFile((file) => {
    assert.deepEqual(fileStore(file).load(), []);
  });
});

test("fileStore save then load round-trips", () => {
  withTempFile((file) => {
    const store = fileStore(file);
    store.save(["milk", "bread"]);
    assert.deepEqual(store.load(), ["milk", "bread"]);
  });
});

test("fileStore writes JSON indented by two spaces with a trailing newline", () => {
  withTempFile((file) => {
    fileStore(file).save(["milk", "bread"]);
    assert.equal(
      readFileSync(file, "utf8"),
      '[\n  "milk",\n  "bread"\n]\n',
    );
  });
});

test("fileStore second save replaces the first", () => {
  withTempFile((file) => {
    const store = fileStore(file);
    store.save(["milk", "bread"]);
    store.save(["eggs"]);
    assert.deepEqual(store.load(), ["eggs"]);
  });
});

test("fileStore round-trips an object", () => {
  withTempFile((file) => {
    const store = fileStore(file);
    store.save({ a: 1 });
    assert.deepEqual(store.load(), { a: 1 });
  });
});

test("memoryStore load returns the initial items", () => {
  assert.deepEqual(memoryStore(["milk"]).load(), ["milk"]);
});

test("memoryStore load returns a copy", () => {
  const store = memoryStore(["milk"]);
  store.load().push("bread");
  assert.deepEqual(store.load(), ["milk"]);
});

test("memoryStore save copies the array it is given", () => {
  const store = memoryStore();
  const items = ["milk"];
  store.save(items);
  items.push("bread");
  assert.deepEqual(store.load(), ["milk"]);
});
