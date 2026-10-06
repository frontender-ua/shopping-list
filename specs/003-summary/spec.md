# 003 summary

Depends on 001 (`count()`).

## Goal

Show a short status line under the list.

## Behavior

- Add `summary()` to the object returned by `createList`.
- It returns:
  - `"Your list is empty"` when there are no items,
  - `"1 item"` for one item,
  - `"<n> items"` for more than one.
- Use `count()`; do not duplicate the counting logic.

## Acceptance

- The three cases above have tests in `test/list.test.js`.
- `npm test` and `npm run lint` pass.
