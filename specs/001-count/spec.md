# 001 count

## Goal

Callers need to know how many items are on the list without copying it.

## Behavior

- Add `count()` to the object returned by `createList`.
- `count()` returns the number of items currently on the list.
- It does not change the list and does not save.

## Acceptance

- Empty list: `count()` is `0`.
- After `add("milk")` and `add("bread")`: `count()` is `2`.
- After adding `"milk"` twice: `count()` is `1` (duplicates are already ignored by `add`).
- After `remove("milk")` from `["milk", "bread"]`: `count()` is `1`.
- Tests for all of the above in `test/list.test.js`. `npm test` and `npm run lint` pass.
