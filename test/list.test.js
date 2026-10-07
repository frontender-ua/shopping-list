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

function countingStore(initial) {
  const store = memoryStore(initial);
  const counted = { saves: 0, load: () => store.load() };
  counted.save = (items) => {
    counted.saves++;
    store.save(items);
  };
  return counted;
}

test("add trims the name", () => {
  const list = createList(countingStore());
  list.add("  milk  ");
  assert.deepEqual(list.items(), ["milk"]);
});

test("add throws on an empty or blank name and saves nothing", () => {
  for (const name of ["", "   "]) {
    const store = countingStore();
    const list = createList(store);
    assert.throws(() => list.add(name), { message: "item name is required" });
    assert.deepEqual(list.items(), []);
    assert.equal(store.saves, 0);
  }
});

test("add treats a padded duplicate as a duplicate and saves nothing", () => {
  const store = countingStore();
  const list = createList(store);
  list.add("milk");
  assert.equal(store.saves, 1);
  assert.equal(list.add(" milk "), false);
  assert.deepEqual(list.items(), ["milk"]);
  assert.equal(store.saves, 1);
});

test("add stores a number as a string", () => {
  const list = createList(countingStore());
  list.add(42);
  assert.deepEqual(list.items(), ["42"]);
});

test("a successful add saves once", () => {
  const store = countingStore();
  createList(store).add("milk");
  assert.equal(store.saves, 1);
});
