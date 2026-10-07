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

// Wraps a memory store and counts save() calls.
function countingStore(initial) {
  const inner = memoryStore(initial);
  const store = {
    saves: 0,
    load: () => inner.load(),
    save(items) {
      store.saves += 1;
      inner.save(items);
    },
  };
  return store;
}

test("remove of a missing item returns false and does not save", () => {
  const store = countingStore(["milk"]);
  const list = createList(store);
  assert.equal(list.remove("bread"), false);
  assert.equal(store.saves, 0);
  assert.deepEqual(list.items(), ["milk"]);
});

test("remove of the only item saves an empty list", () => {
  const store = countingStore(["milk"]);
  const list = createList(store);
  assert.equal(list.remove("milk"), true);
  assert.deepEqual(list.items(), []);
  assert.equal(store.saves, 1);
  assert.deepEqual(store.load(), []);
});

test("remove is case-sensitive", () => {
  const store = countingStore(["milk"]);
  const list = createList(store);
  assert.equal(list.remove("Milk"), false);
  assert.deepEqual(list.items(), ["milk"]);
  assert.equal(store.saves, 0);
});
