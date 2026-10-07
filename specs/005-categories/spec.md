# 005 categories

A bigger change: a new saved format with a migration, new list methods and a
command-line tool. Everything needed is in this spec; nothing here is meant to
be open.

## Goal

Users want the list grouped the way they walk through a store: produce first,
household last. They also want to edit the list from a terminal.

## Categories

The fixed list of categories, in this order:

`produce`, `dairy`, `bakery`, `pantry`, `household`, `other`

Any other value is an unknown category.

## Saved format (version 2)

`createList` saves this shape, always:

```json
{
  "version": 2,
  "items": [
    { "name": "milk", "category": "dairy" },
    { "name": "bread", "category": "bakery" }
  ]
}
```

- `items` keeps the order items were added.
- Loading the old format (a plain array of names, as saved today) must keep
  working: each old item gets the category `other`. The next save writes
  version 2.
- The fridge display has already been updated to read both formats, so
  changing the file format is safe.
- `fileStore` and `memoryStore` must store any JSON value, not just arrays.
  Today `memoryStore` copies with `[...value]`, which fails for an object; fix
  that (for example with `structuredClone`). Stores stay format-agnostic: the
  conversion lives in `createList`.

## List methods

All of these are on the object returned by `createList`.

- `add(name, category = "other")`
  - Unknown category: throws `Error("unknown category: <category>")` and saves
    nothing.
  - Otherwise behaves as today: trims the name, throws on an empty name,
    returns `false` for a name already on the list (whatever its category,
    and without changing it), returns `true` and saves after adding.
- `remove(name)`: as today.
- `items()`: as today, the names in the order they were added.
- `categoryOf(name)`: the item's category, or `undefined` if it is not on the
  list.
- `setCategory(name, category)`
  - Unknown category: throws as `add` does.
  - Returns `false` without saving if the item is not on the list or already
    has that category.
  - Otherwise changes the category, saves and returns `true`.
- `byCategory()`: an array of `{ category, items }`, one entry per category
  that has items, in the fixed category order; `items` are names in the order
  they were added. Empty categories are left out.

## Command-line tool

Add `bin/shopping-list.js` (with a `#!/usr/bin/env node` line) and register it
in `package.json` under `"bin": { "shopping-list": "bin/shopping-list.js" }`.

It uses `fileStore` on the file named by the `SHOPPING_LIST_FILE` environment
variable, or `./shopping-list.json` if that is not set.

| Command | Output (stdout) | Exit code |
|---|---|---|
| `add <name> [--category <category>]` | `added <name>` or `already on the list: <name>` | 0 |
| `remove <name>` | `removed <name>`; if missing, `not on the list: <name>` on stderr | 0; 1 if missing |
| `set-category <name> <category>` | `<name> is now in <category>`; if missing, `not on the list: <name>` on stderr | 0; 1 if missing |
| `list` | one name per line, in the order added | 0 |
| `list --by-category` | for each non-empty category: a line `<category>:`, then one line per item indented by two spaces | 0 |

- An unknown category prints the error message on stderr and exits with 1.
- An unknown command or missing arguments print a usage text on stderr and exit
  with 2.
- `<name>` is the trimmed name as stored.

## Tests

- `test/list.test.js`: every behavior in "List methods", plus loading the old
  format and saving version 2. Update the existing tests that check the saved
  data so they expect version 2.
- `test/cli.test.js`: run `node bin/shopping-list.js` with
  `child_process.execFileSync` or `spawnSync` against a temporary file
  (`fs.mkdtempSync(path.join(os.tmpdir(), "shopping-list-"))`), covering every
  row of the table above, the unknown category and the usage error.
- `npm run lint` checks `bin/shopping-list.js` too.

## Docs

Add a "Command line" section to `README.md` with the commands above and the
`SHOPPING_LIST_FILE` variable.

## Acceptance

- `npm test` and `npm run lint` pass.
- A file saved in the old format loads, and after any change it is saved as
  version 2 with every old item in category `other`.
