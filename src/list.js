// A shopping list backed by a store (see store.js). add(), remove(), moveUp() and moveDown() save
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

    moveUp(name) {
      const index = items.indexOf(name);
      if (index <= 0) return false;
      [items[index - 1], items[index]] = [items[index], items[index - 1]];
      store.save(items);
      return true;
    },

    moveDown(name) {
      const index = items.indexOf(name);
      if (index === -1 || index === items.length - 1) return false;
      [items[index + 1], items[index]] = [items[index], items[index + 1]];
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
