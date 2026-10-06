// A shopping list backed by a store (see store.js). add() and remove() save
// the list after each change.
export function createList(store) {
  let items = store.load();

  return {
    add(name) {
      const trimmed = String(name).trim();
      if (!trimmed) throw new Error("item name is required");
      if (items.includes(trimmed)) return false;
      items.push(trimmed);
      store.save(items);
      return true;
    },

    remove(name) {
      const index = items.indexOf(name);
      if (index === -1) return false;
      items.splice(index, 1);
      store.save(items);
      return true;
    },

    items() {
      return [...items];
    },

    count() {
      return items.length;
    },
  };
}
