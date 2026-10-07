export const CATEGORIES = [
  "produce",
  "dairy",
  "bakery",
  "pantry",
  "household",
  "other",
];

function checkCategory(category) {
  if (!CATEGORIES.includes(category)) {
    throw new Error(`unknown category: ${category}`);
  }
}

// Reads the saved data: version 2 ({ version, items }) or the old format (a
// plain array of names, each of which gets the category "other").
function parse(data) {
  if (Array.isArray(data)) {
    return data.map((name) => ({ name, category: "other" }));
  }
  return data.items.map(({ name, category }) => ({ name, category }));
}

// A shopping list backed by a store (see store.js). Every change is saved
// right away, always in version 2 format.
export function createList(store) {
  const items = parse(store.load());

  const find = (name) => items.find((item) => item.name === name);
  const save = () =>
    store.save({
      version: 2,
      items: items.map(({ name, category }) => ({ name, category })),
    });

  return {
    add(name, category = "other") {
      checkCategory(category);
      const trimmed = String(name).trim();
      if (!trimmed) throw new Error("item name is required");
      if (find(trimmed)) return false;
      items.push({ name: trimmed, category });
      save();
      return true;
    },

    remove(name) {
      const index = items.findIndex((item) => item.name === name);
      if (index === -1) return false;
      items.splice(index, 1);
      save();
      return true;
    },

    items() {
      return items.map((item) => item.name);
    },

    count() {
      return items.length;
    },

    categoryOf(name) {
      return find(name)?.category;
    },

    setCategory(name, category) {
      checkCategory(category);
      const item = find(name);
      if (!item || item.category === category) return false;
      item.category = category;
      save();
      return true;
    },

    byCategory() {
      return CATEGORIES.map((category) => ({
        category,
        items: items.filter((i) => i.category === category).map((i) => i.name),
      })).filter((group) => group.items.length > 0);
    },
  };
}
