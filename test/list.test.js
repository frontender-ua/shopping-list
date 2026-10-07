import { test } from "node:test";
import assert from "node:assert/strict";
import { createList } from "../src/list.js";
import { memoryStore } from "../src/store.js";

test("add appends and saves", () => {
  const store = memoryStore();
  const list = createList(store);
  assert.equal(list.add("milk"), true);
  assert.equal(list.add("bread"), true);
  assert.deepEqual(list.items(), ["milk", "bread"]);
  assert.deepEqual(store.load(), ["milk", "bread"]);
});

test("add ignores duplicates", () => {
  const list = createList(memoryStore(["milk"]));
  assert.equal(list.add("milk"), false);
  assert.deepEqual(list.items(), ["milk"]);
});

test("remove deletes and saves", () => {
  const store = memoryStore(["milk", "bread"]);
  const list = createList(store);
  assert.equal(list.remove("milk"), true);
  assert.deepEqual(store.load(), ["bread"]);
});

// Wraps memoryStore and counts save() calls, so the tests below do not depend
// on the saved format.
function countingStore(initial) {
  const inner = memoryStore(initial);
  const store = {
    saves: 0,
    load: () => inner.load(),
    save(items) {
      store.saves++;
      inner.save(items);
    },
  };
  return store;
}

test("add trims the name", () => {
  const list = createList(memoryStore());
  assert.equal(list.add("  milk  "), true);
  assert.deepEqual(list.items(), ["milk"]);
});

test("add rejects empty and blank names", () => {
  const list = createList(memoryStore());
  assert.throws(() => list.add(""), { message: "item name is required" });
  assert.throws(() => list.add("   "), { message: "item name is required" });
  assert.deepEqual(list.items(), []);
});

test("add treats a padded name as a duplicate", () => {
  const list = createList(memoryStore());
  list.add("milk");
  assert.equal(list.add(" milk "), false);
  assert.deepEqual(list.items(), ["milk"]);
});

test("add stores a number as a string", () => {
  const list = createList(memoryStore());
  assert.equal(list.add(42), true);
  assert.deepEqual(list.items(), ["42"]);
});

test("a successful add saves once", () => {
  const store = countingStore();
  const list = createList(store);
  list.add("milk");
  assert.equal(store.saves, 1);
});

test("a duplicate add saves nothing", () => {
  const store = countingStore(["milk"]);
  const list = createList(store);
  assert.equal(list.add("milk"), false);
  assert.equal(list.add(" milk "), false);
  assert.equal(store.saves, 0);
});

test("an add that throws saves nothing", () => {
  const store = countingStore();
  const list = createList(store);
  assert.throws(() => list.add(""));
  assert.throws(() => list.add("   "));
  assert.equal(store.saves, 0);
});
