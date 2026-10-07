import { test } from "node:test";
import assert from "node:assert/strict";
import { createList } from "../src/list.js";
import { memoryStore } from "../src/store.js";

const v2 = (...items) => ({
  version: 2,
  items: items.map(([name, category]) => ({ name, category })),
});

test("add appends and saves", () => {
  const store = memoryStore();
  const list = createList(store);
  assert.equal(list.add("milk"), true);
  assert.equal(list.add("bread"), true);
  assert.deepEqual(list.items(), ["milk", "bread"]);
  assert.deepEqual(store.load(), v2(["milk", "other"], ["bread", "other"]));
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
  assert.deepEqual(store.load(), v2(["bread", "other"]));
});

test("remove returns false for a missing item and saves nothing", () => {
  const store = memoryStore(["milk"]);
  const list = createList(store);
  assert.equal(list.remove("eggs"), false);
  assert.deepEqual(store.load(), ["milk"]);
});

test("add trims the name and rejects an empty one", () => {
  const store = memoryStore();
  const list = createList(store);
  assert.equal(list.add("  milk  ", "dairy"), true);
  assert.deepEqual(list.items(), ["milk"]);
  assert.throws(() => list.add("   "), /item name is required/);
  assert.deepEqual(store.load(), v2(["milk", "dairy"]));
});

test("add stores the category, defaulting to other", () => {
  const store = memoryStore();
  const list = createList(store);
  list.add("milk", "dairy");
  list.add("soap");
  assert.equal(list.categoryOf("milk"), "dairy");
  assert.equal(list.categoryOf("soap"), "other");
  assert.deepEqual(store.load(), v2(["milk", "dairy"], ["soap", "other"]));
});

test("add with an unknown category throws and saves nothing", () => {
  const store = memoryStore();
  const list = createList(store);
  assert.throws(() => list.add("milk", "frozen"), { message: "unknown category: frozen" });
  assert.deepEqual(list.items(), []);
  assert.deepEqual(store.load(), []);
});

test("add of a duplicate keeps its category and saves nothing", () => {
  const store = memoryStore(v2(["milk", "dairy"]));
  const list = createList(store);
  assert.equal(list.add("milk", "pantry"), false);
  assert.equal(list.categoryOf("milk"), "dairy");
  assert.deepEqual(store.load(), v2(["milk", "dairy"]));
});

test("categoryOf is undefined for a missing item", () => {
  const list = createList(memoryStore());
  assert.equal(list.categoryOf("milk"), undefined);
});

test("setCategory changes the category and saves", () => {
  const store = memoryStore(v2(["milk", "other"]));
  const list = createList(store);
  assert.equal(list.setCategory("milk", "dairy"), true);
  assert.equal(list.categoryOf("milk"), "dairy");
  assert.deepEqual(store.load(), v2(["milk", "dairy"]));
});

test("setCategory returns false without saving for a missing item or same category", () => {
  let saves = 0;
  const store = memoryStore(v2(["milk", "dairy"]));
  const counting = { load: store.load, save: (data) => { saves++; store.save(data); } };
  const list = createList(counting);
  assert.equal(list.setCategory("eggs", "dairy"), false);
  assert.equal(list.setCategory("milk", "dairy"), false);
  assert.equal(saves, 0);
});

test("setCategory with an unknown category throws and saves nothing", () => {
  const store = memoryStore(v2(["milk", "dairy"]));
  const list = createList(store);
  assert.throws(() => list.setCategory("milk", "frozen"), { message: "unknown category: frozen" });
  assert.equal(list.categoryOf("milk"), "dairy");
  assert.deepEqual(store.load(), v2(["milk", "dairy"]));
});

test("byCategory groups in the fixed order and leaves out empty categories", () => {
  const list = createList(memoryStore());
  list.add("soap", "household");
  list.add("milk", "dairy");
  list.add("apples", "produce");
  list.add("cheese", "dairy");
  list.add("batteries");
  assert.deepEqual(list.byCategory(), [
    { category: "produce", items: ["apples"] },
    { category: "dairy", items: ["milk", "cheese"] },
    { category: "household", items: ["soap"] },
    { category: "other", items: ["batteries"] },
  ]);
});

test("byCategory of an empty list is empty", () => {
  assert.deepEqual(createList(memoryStore()).byCategory(), []);
});

test("old format loads with category other and is saved as version 2", () => {
  const store = memoryStore(["milk", "bread"]);
  const list = createList(store);
  assert.deepEqual(list.items(), ["milk", "bread"]);
  assert.equal(list.categoryOf("bread"), "other");
  list.add("apples", "produce");
  assert.deepEqual(store.load(), v2(["milk", "other"], ["bread", "other"], ["apples", "produce"]));
});

test("version 2 loads as saved", () => {
  const list = createList(memoryStore(v2(["milk", "dairy"], ["bread", "bakery"])));
  assert.deepEqual(list.items(), ["milk", "bread"]);
  assert.equal(list.categoryOf("bread"), "bakery");
});

test("memoryStore stores objects as copies", () => {
  const data = v2(["milk", "dairy"]);
  const store = memoryStore();
  store.save(data);
  data.items[0].category = "other";
  assert.deepEqual(store.load(), v2(["milk", "dairy"]));
});
