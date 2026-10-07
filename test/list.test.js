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

test("count is 0 after removing the only item", () => {
  const list = createList(memoryStore(["milk"]));
  list.remove("milk");
  assert.equal(list.count(), 0);
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

// Wraps memoryStore so tests can count save() calls without depending on
// the saved format.
function countingStore(initial) {
  const store = memoryStore(initial);
  const save = store.save;
  store.saves = 0;
  store.save = (items) => {
    store.saves++;
    save(items);
  };
  return store;
}

test("add trims the name", () => {
  const list = createList(memoryStore());
  list.add("  milk  ");
  assert.deepEqual(list.items(), ["milk"]);
});

test("add rejects empty and blank names", () => {
  const list = createList(memoryStore());
  assert.throws(() => list.add(""), { message: "item name is required" });
  assert.throws(() => list.add("   "), { message: "item name is required" });
});

test("add treats a padded name as a duplicate", () => {
  const list = createList(memoryStore());
  list.add("milk");
  assert.equal(list.add(" milk "), false);
  assert.deepEqual(list.items(), ["milk"]);
});

test("add stores a number as a string", () => {
  const list = createList(memoryStore());
  list.add(42);
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
  list.add("milk");
  assert.equal(store.saves, 0);
});

test("an add that throws saves nothing", () => {
  const store = countingStore();
  const list = createList(store);
  assert.throws(() => list.add("   "));
  assert.equal(store.saves, 0);
});
