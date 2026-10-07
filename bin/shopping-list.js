#!/usr/bin/env node
import { createList } from "../src/list.js";
import { fileStore } from "../src/store.js";

const USAGE = `usage:
  shopping-list add <name> [--category <category>]
  shopping-list remove <name>
  shopping-list set-category <name> <category>
  shopping-list list [--by-category]`;

function usage() {
  console.error(USAGE);
  process.exit(2);
}

function missing(name) {
  console.error(`not on the list: ${name}`);
  process.exit(1);
}

const [command, ...args] = process.argv.slice(2);
const list = createList(
  fileStore(process.env.SHOPPING_LIST_FILE || "./shopping-list.json"),
);

try {
  if (command === "add") {
    let category;
    const rest = [...args];
    const flag = rest.indexOf("--category");
    if (flag !== -1) {
      if (flag === rest.length - 1) usage();
      category = rest[flag + 1];
      rest.splice(flag, 2);
    }
    if (rest.length !== 1) usage();
    const name = rest[0].trim();
    if (!name) usage();
    console.log(
      list.add(name, category) ? `added ${name}` : `already on the list: ${name}`,
    );
  } else if (command === "remove") {
    if (args.length !== 1) usage();
    const name = args[0].trim();
    if (!list.remove(name)) missing(name);
    console.log(`removed ${name}`);
  } else if (command === "set-category") {
    if (args.length !== 2) usage();
    const name = args[0].trim();
    const category = args[1];
    if (list.categoryOf(name) === undefined) {
      list.setCategory(name, category); // throws on an unknown category
      missing(name);
    }
    list.setCategory(name, category);
    console.log(`${name} is now in ${category}`);
  } else if (command === "list") {
    if (args.length === 0) {
      for (const name of list.items()) console.log(name);
    } else if (args.length === 1 && args[0] === "--by-category") {
      for (const { category, items } of list.byCategory()) {
        console.log(`${category}:`);
        for (const name of items) console.log(`  ${name}`);
      }
    } else {
      usage();
    }
  } else {
    usage();
  }
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
