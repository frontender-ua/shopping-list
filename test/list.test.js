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

test("moveUp swaps with the previous item", () => {
  const list = createList(memoryStore(["milk", "bread", "eggs"]));
  assert.equal(list.moveUp("eggs"), true);
  assert.deepEqual(list.items(), ["milk", "eggs", "bread"]);
});

test("moveDown swaps with the next item", () => {
  const list = createList(memoryStore(["milk", "bread", "eggs"]));
  assert.equal(list.moveDown("milk"), true);
  assert.deepEqual(list.items(), ["bread", "milk", "eggs"]);
});

test("move returns false at the ends and for missing items", () => {
  const list = createList(memoryStore(["milk", "bread", "eggs"]));
  assert.equal(list.moveUp("milk"), false);
  assert.equal(list.moveDown("eggs"), false);
  assert.equal(list.moveUp("butter"), false);
  assert.equal(list.moveDown("butter"), false);
  assert.deepEqual(list.items(), ["milk", "bread", "eggs"]);
});

test("moves are not saved", () => {
  const store = memoryStore(["milk", "bread", "eggs"]);
  const list = createList(store);
  list.moveUp("eggs");
  assert.deepEqual(store.load(), ["milk", "bread", "eggs"]);
});

test("add and remove after a move save the order items were added", () => {
  const store = memoryStore(["milk", "bread", "eggs"]);
  const list = createList(store);
  list.moveUp("eggs");
  list.add("butter");
  assert.deepEqual(list.items(), ["milk", "eggs", "bread", "butter"]);
  assert.deepEqual(store.load(), ["milk", "bread", "eggs", "butter"]);
  list.remove("bread");
  assert.deepEqual(list.items(), ["milk", "eggs", "butter"]);
  assert.deepEqual(store.load(), ["milk", "eggs", "butter"]);
});
