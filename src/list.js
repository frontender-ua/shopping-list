// A shopping list backed by a store (see store.js). add() and remove() save
// the list after each change.
export function createList(store) {
  let items = store.load();

  const list = {
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

    summary() {
      const n = list.count();
      if (n === 0) return "Your list is empty";
      return n === 1 ? "1 item" : `${n} items`;
    },
  };

  return list;
}
