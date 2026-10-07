// A shopping list backed by a store (see store.js). add() and remove() save
// the list after each change. The store always keeps the order items were
// added (the fridge display reads it); moveUp() and moveDown() change only
// the in-memory order returned by items() and are never saved.
export function createList(store) {
  let added = store.load();
  let order = [...added];

  function move(name, offset) {
    const index = order.indexOf(name);
    const target = index + offset;
    if (index === -1 || target < 0 || target >= order.length) return false;
    [order[index], order[target]] = [order[target], order[index]];
    return true;
  }

  return {
    add(name) {
      const trimmed = String(name).trim();
      if (!trimmed) throw new Error("item name is required");
      if (added.includes(trimmed)) return false;
      added.push(trimmed);
      order.push(trimmed);
      store.save(added);
      return true;
    },

    remove(name) {
      const index = added.indexOf(name);
      if (index === -1) return false;
      added.splice(index, 1);
      order.splice(order.indexOf(name), 1);
      store.save(added);
      return true;
    },

    moveUp(name) {
      return move(name, -1);
    },

    moveDown(name) {
      return move(name, 1);
    },

    items() {
      return [...order];
    },
  };
}
