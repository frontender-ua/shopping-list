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

test("count is 0 for an empty list", () => {
  const list = createList(memoryStore());
  assert.equal(list.count(), 0);
});

test("count returns the number of items", () => {
  const list = createList(memoryStore());
  list.add("milk");
  list.add("bread");
  assert.equal(list.count(), 2);
});

test("count ignores duplicates", () => {
  const list = createList(memoryStore());
  list.add("milk");
  list.add("milk");
  assert.equal(list.count(), 1);
});

test("count reflects removals", () => {
  const list = createList(memoryStore(["milk", "bread"]));
  list.remove("milk");
  assert.equal(list.count(), 1);
});

test("count does not change or save the list", () => {
  const store = memoryStore(["milk"]);
  let saves = 0;
  const save = store.save;
  store.save = (items) => {
    saves++;
    save(items);
  };
  const list = createList(store);
  list.count();
  assert.equal(saves, 0);
  assert.deepEqual(list.items(), ["milk"]);
});
