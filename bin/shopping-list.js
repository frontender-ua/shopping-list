#!/usr/bin/env node
import { CATEGORIES, createList } from "../src/list.js";
import { fileStore } from "../src/store.js";

const USAGE = `usage:
  shopping-list add <name> [--category <category>]
  shopping-list remove <name>
  shopping-list set-category <name> <category>
  shopping-list list [--by-category]

The list is kept in $SHOPPING_LIST_FILE (default ./shopping-list.json).`;

function usage() {
  console.error(USAGE);
  process.exit(2);
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

function run(args) {
  const [command, ...rest] = args;
  const list = createList(fileStore(process.env.SHOPPING_LIST_FILE || "./shopping-list.json"));

  switch (command) {
    case "add": {
      let category;
      const names = [];
      for (let i = 0; i < rest.length; i++) {
        if (rest[i] === "--category") {
          if (i + 1 >= rest.length || category !== undefined) usage();
          category = rest[++i];
        } else {
          names.push(rest[i]);
        }
      }
      if (names.length !== 1) usage();
      const name = names[0].trim();
      const added = list.add(name, category);
      console.log(added ? `added ${name}` : `already on the list: ${name}`);
      return;
    }
    case "remove": {
      if (rest.length !== 1) usage();
      const name = rest[0].trim();
      if (!list.remove(name)) fail(`not on the list: ${name}`);
      console.log(`removed ${name}`);
      return;
    }
    case "set-category": {
      if (rest.length !== 2) usage();
      const name = rest[0].trim();
      const category = rest[1];
      if (!CATEGORIES.includes(category)) fail(`unknown category: ${category}`);
      if (list.categoryOf(name) === undefined) fail(`not on the list: ${name}`);
      list.setCategory(name, category);
      console.log(`${name} is now in ${category}`);
      return;
    }
    case "list": {
      if (rest.length === 0) {
        for (const name of list.items()) console.log(name);
      } else if (rest.length === 1 && rest[0] === "--by-category") {
        for (const group of list.byCategory()) {
          console.log(`${group.category}:`);
          for (const name of group.items) console.log(`  ${name}`);
        }
      } else {
        usage();
      }
      return;
    }
    default:
      usage();
  }
}

try {
  run(process.argv.slice(2));
} catch (error) {
  fail(error.message);
}
