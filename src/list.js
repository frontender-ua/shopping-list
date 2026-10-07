// A shopping list backed by a store (see store.js). add(), remove(),
// moveUp() and moveDown() save the list after each change.
export function createList(store) {
  let items = store.load();

  // Swaps the item with its neighbour at offset (-1 or +1) and saves.
  function move(name, offset) {
    const index = items.indexOf(name);
    const target = index + offset;
    if (index === -1 || target < 0 || target >= items.length) return false;
    [items[index], items[target]] = [items[target], items[index]];
    store.save(items);
    return true;
  }

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
      return move(name, -1);
    },

    moveDown(name) {
      return move(name, 1);
    },

    items() {
      return [...items];
    },
  };
}
