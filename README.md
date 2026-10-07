# shopping-list

Tiny test project for the agent-board prototype. No dependencies.

```sh
npm test       # node --test
npm run lint   # syntax check
```

Specs live in `specs/NNN-name/spec.md`. Agents read them from `main`.

## Command line

```sh
shopping-list add <name> [--category <category>]
shopping-list remove <name>
shopping-list set-category <name> <category>
shopping-list list
shopping-list list --by-category
```

Categories, in store order: `produce`, `dairy`, `bakery`, `pantry`,
`household`, `other` (the default).

The list is kept in the file named by `SHOPPING_LIST_FILE`, or
`./shopping-list.json` if it is not set. Run it with `node bin/shopping-list.js`
or, after `npm link`, as `shopping-list`.

Exit codes: 0 on success, 1 for an item not on the list or an unknown
category, 2 for an unknown command or missing arguments (a usage text is
printed on stderr).
