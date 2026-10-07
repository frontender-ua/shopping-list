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
shopping-list list [--by-category]
```

Categories: `produce`, `dairy`, `bakery`, `pantry`, `household`, `other`
(the default). The list is stored in the file named by the
`SHOPPING_LIST_FILE` environment variable, or `./shopping-list.json` if it is
not set.

Exit codes: 0 on success, 1 for a missing item or unknown category, 2 for an
unknown command or missing arguments (usage is printed on stderr).
