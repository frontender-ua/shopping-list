# 004 remove tests

Tests only. Do not change anything under `src/`.

## Cases to cover in `test/list.test.js`

- Removing an item that is not on the list returns `false` and does not save.
- Removing the only item leaves an empty list, and the empty list is saved.
- `remove` is case-sensitive: `remove("Milk")` does not remove `"milk"`.

## Acceptance

- `npm test` and `npm run lint` pass.
