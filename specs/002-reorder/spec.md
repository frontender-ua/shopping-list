# 002 reorder

## Goal

While shopping, users want to move items so the list follows their walk
through the store.

## Behavior

- Add `moveUp(name)` and `moveDown(name)` to the object returned by `createList`.
- `moveUp` swaps the item with the one before it; `moveDown` with the one after it.
- Both return `true` if the item moved, `false` if the item is missing or
  already at that end of the list.

## Context

The saved file is also read by the household's fridge display, which shows
the items in the order they were added.

## Acceptance

- `["milk", "bread", "eggs"]`, `moveUp("eggs")` gives `["milk", "eggs", "bread"]`.
- `moveUp` on the first item and `moveDown` on the last item return `false`.
- Tests in `test/list.test.js`. `npm test` and `npm run lint` pass.
