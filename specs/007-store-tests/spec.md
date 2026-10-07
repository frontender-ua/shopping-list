# 007 store tests

Tests only. Do not change anything under `src/`.

## Cases to cover in a new file `test/store.test.js`

`fileStore`, using a temporary directory
(`fs.mkdtempSync(path.join(os.tmpdir(), "store-test-"))`, removed after the
test):

- `load()` on a file that does not exist returns `[]`.
- `save(["milk", "bread"])` then `load()` returns `["milk", "bread"]`.
- The saved file is JSON indented by two spaces and ends with a newline.
- A second `save` replaces the first.
- An object such as `{ "a": 1 }` also survives a `save`/`load` round trip.

`memoryStore` (arrays only):

- `memoryStore(["milk"]).load()` returns `["milk"]`.
- Changing the array returned by `load()` does not change what the store holds.
- Changing an array after passing it to `save()` does not change what the
  store holds.

## Acceptance

- `npm test` and `npm run lint` pass.
