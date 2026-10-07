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
  assert.deepEqual(store.load(), {
    version: 2,
    items: [
      { name: "milk", category: "other" },
      { name: "bread", category: "other" },
    ],
  });
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
  assert.deepEqual(store.load(), {
    version: 2,
    items: [{ name: "bread", category: "other" }],
  });
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

const v2 = (...items) => ({
  version: 2,
  items: items.map(([name, category]) => ({ name, category })),
});

test("old format loads with category other and saves as version 2", () => {
  const store = memoryStore(["milk", "bread"]);
  const list = createList(store);
  assert.equal(list.categoryOf("milk"), "other");
  list.add("eggs");
  assert.deepEqual(
    store.load(),
    v2(["milk", "other"], ["bread", "other"], ["eggs", "other"]),
  );
});

test("add with a category saves it", () => {
  const store = memoryStore();
  const list = createList(store);
  assert.equal(list.add("  milk ", "dairy"), true);
  assert.equal(list.categoryOf("milk"), "dairy");
  assert.deepEqual(store.load(), v2(["milk", "dairy"]));
});

test("add with an unknown category throws and saves nothing", () => {
  const store = memoryStore();
  const list = createList(store);
  assert.throws(() => list.add("milk", "frozen"), {
    message: "unknown category: frozen",
  });
  assert.deepEqual(list.items(), []);
  assert.deepEqual(store.load(), []);
});

test("add throws on an empty name", () => {
  const list = createList(memoryStore());
  assert.throws(() => list.add("   "), { message: "item name is required" });
});

test("add of a duplicate returns false and keeps its category", () => {
  const list = createList(memoryStore(v2(["milk", "dairy"])));
  assert.equal(list.add("milk", "pantry"), false);
  assert.equal(list.categoryOf("milk"), "dairy");
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

test("setCategory throws on an unknown category", () => {
  const list = createList(memoryStore(v2(["milk", "other"])));
  assert.throws(() => list.setCategory("milk", "frozen"), {
    message: "unknown category: frozen",
  });
  assert.throws(() => list.setCategory("nope", "frozen"), {
    message: "unknown category: frozen",
  });
});

test("setCategory returns false without saving for a missing item or same category", () => {
  const store = memoryStore(v2(["milk", "dairy"]));
  let saves = 0;
  const save = store.save;
  store.save = (data) => {
    saves++;
    save(data);
  };
  const list = createList(store);
  assert.equal(list.setCategory("nope", "dairy"), false);
  assert.equal(list.setCategory("milk", "dairy"), false);
  assert.equal(saves, 0);
});

test("byCategory groups in category order and leaves out empty ones", () => {
  const list = createList(memoryStore());
  list.add("soap", "household");
  list.add("milk", "dairy");
  list.add("apple", "produce");
  list.add("cheese", "dairy");
  list.add("thing");
  assert.deepEqual(list.byCategory(), [
    { category: "produce", items: ["apple"] },
    { category: "dairy", items: ["milk", "cheese"] },
    { category: "household", items: ["soap"] },
    { category: "other", items: ["thing"] },
  ]);
  assert.deepEqual(createList(memoryStore()).byCategory(), []);
});

test("items keeps the order items were added", () => {
  const list = createList(memoryStore());
  list.add("soap", "household");
  list.add("apple", "produce");
  assert.deepEqual(list.items(), ["soap", "apple"]);
});
