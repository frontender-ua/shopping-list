# 006 add tests

Tests only. Do not change anything under `src/`.

## Cases to cover in `test/list.test.js`

- `add("  milk  ")` stores `"milk"`.
- `add("")` and `add("   ")` throw `item name is required`.
- After `add("milk")`, `add(" milk ")` returns `false` and the list is
  unchanged.
- `add(42)` stores `"42"`.
- A successful `add` saves once; a duplicate or a thrown error saves nothing.

Check saving by counting calls to `store.save` (wrap `memoryStore`), not by
comparing the saved data. The saved format may change later; these tests
should not depend on it.

## Acceptance

- `npm test` and `npm run lint` pass.
