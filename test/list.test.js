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

test("moveUp swaps with the previous item and saves", () => {
  const store = memoryStore(["milk", "bread", "eggs"]);
  const list = createList(store);
  assert.equal(list.moveUp("eggs"), true);
  assert.deepEqual(list.items(), ["milk", "eggs", "bread"]);
  assert.deepEqual(store.load(), ["milk", "eggs", "bread"]);
});

test("moveDown swaps with the next item and saves", () => {
  const store = memoryStore(["milk", "bread", "eggs"]);
  const list = createList(store);
  assert.equal(list.moveDown("milk"), true);
  assert.deepEqual(list.items(), ["bread", "milk", "eggs"]);
  assert.deepEqual(store.load(), ["bread", "milk", "eggs"]);
});

test("moveUp on the first item and moveDown on the last return false", () => {
  const list = createList(memoryStore(["milk", "bread"]));
  assert.equal(list.moveUp("milk"), false);
  assert.equal(list.moveDown("bread"), false);
  assert.deepEqual(list.items(), ["milk", "bread"]);
});

test("moving a missing item returns false and does not save", () => {
  const store = memoryStore(["milk"]);
  let saves = 0;
  const save = store.save;
  store.save = (items) => {
    saves += 1;
    save(items);
  };
  const list = createList(store);
  assert.equal(list.moveUp("eggs"), false);
  assert.equal(list.moveDown("eggs"), false);
  assert.equal(list.moveUp("milk"), false);
  assert.equal(saves, 0);
});
