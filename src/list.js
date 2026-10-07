// The fixed categories, in store-walking order.
export const CATEGORIES = ["produce", "dairy", "bakery", "pantry", "household", "other"];

function checkCategory(category) {
  if (!CATEGORIES.includes(category)) {
    throw new Error(`unknown category: ${category}`);
  }
}

// Reads both saved formats: version 2 ({ version, items }) and the old plain
// array of names, whose items all go into "other".
function fromSaved(data) {
  if (Array.isArray(data)) {
    return data.map((name) => ({ name, category: "other" }));
  }
  return data.items.map(({ name, category }) => ({ name, category }));
}

// A shopping list backed by a store (see store.js). Every change saves the
// list in version 2 format.
export function createList(store) {
  const items = fromSaved(store.load());

  const find = (name) => items.find((item) => item.name === name);
  const save = () => store.save({ version: 2, items: items.map((item) => ({ ...item })) });

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
        items: items.filter((item) => item.category === category).map((item) => item.name),
      })).filter((group) => group.items.length > 0);
    },
  };
}
