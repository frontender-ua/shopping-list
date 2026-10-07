import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const BIN = fileURLToPath(new URL("../bin/shopping-list.js", import.meta.url));

function tempFile() {
  return path.join(mkdtempSync(path.join(os.tmpdir(), "shopping-list-")), "list.json");
}

function cli(file, ...args) {
  const result = spawnSync(process.execPath, [BIN, ...args], {
    encoding: "utf8",
    env: { ...process.env, SHOPPING_LIST_FILE: file },
  });
  return { code: result.status, stdout: result.stdout, stderr: result.stderr };
}

test("add prints added, and already on the list for a duplicate", () => {
  const file = tempFile();
  assert.deepEqual(cli(file, "add", "  milk "), { code: 0, stdout: "added milk\n", stderr: "" });
  assert.deepEqual(cli(file, "add", "milk"), {
    code: 0,
    stdout: "already on the list: milk\n",
    stderr: "",
  });
  assert.deepEqual(JSON.parse(readFileSync(file, "utf8")), {
    version: 2,
    items: [{ name: "milk", category: "other" }],
  });
});

test("add --category stores the category", () => {
  const file = tempFile();
  assert.equal(cli(file, "add", "milk", "--category", "dairy").stdout, "added milk\n");
  assert.equal(cli(file, "add", "--category", "bakery", "bread").stdout, "added bread\n");
  assert.deepEqual(JSON.parse(readFileSync(file, "utf8")).items, [
    { name: "milk", category: "dairy" },
    { name: "bread", category: "bakery" },
  ]);
});

test("remove prints removed, or not on the list with exit 1", () => {
  const file = tempFile();
  cli(file, "add", "milk");
  assert.deepEqual(cli(file, "remove", "milk"), { code: 0, stdout: "removed milk\n", stderr: "" });
  assert.deepEqual(cli(file, "remove", "milk"), {
    code: 1,
    stdout: "",
    stderr: "not on the list: milk\n",
  });
});

test("set-category prints the new category, or not on the list with exit 1", () => {
  const file = tempFile();
  cli(file, "add", "milk");
  assert.deepEqual(cli(file, "set-category", "milk", "dairy"), {
    code: 0,
    stdout: "milk is now in dairy\n",
    stderr: "",
  });
  assert.deepEqual(cli(file, "set-category", "eggs", "dairy"), {
    code: 1,
    stdout: "",
    stderr: "not on the list: eggs\n",
  });
  assert.equal(JSON.parse(readFileSync(file, "utf8")).items[0].category, "dairy");
});

test("list prints names in the order added", () => {
  const file = tempFile();
  cli(file, "add", "soap", "--category", "household");
  cli(file, "add", "apples", "--category", "produce");
  assert.deepEqual(cli(file, "list"), { code: 0, stdout: "soap\napples\n", stderr: "" });
});

test("list of a missing file prints nothing", () => {
  assert.deepEqual(cli(tempFile(), "list"), { code: 0, stdout: "", stderr: "" });
});

test("list --by-category groups in the fixed order", () => {
  const file = tempFile();
  cli(file, "add", "soap", "--category", "household");
  cli(file, "add", "milk", "--category", "dairy");
  cli(file, "add", "apples", "--category", "produce");
  cli(file, "add", "cheese", "--category", "dairy");
  assert.deepEqual(cli(file, "list", "--by-category"), {
    code: 0,
    stdout: "produce:\n  apples\ndairy:\n  milk\n  cheese\nhousehold:\n  soap\n",
    stderr: "",
  });
});

test("unknown category prints the error and exits 1", () => {
  const file = tempFile();
  assert.deepEqual(cli(file, "add", "milk", "--category", "frozen"), {
    code: 1,
    stdout: "",
    stderr: "unknown category: frozen\n",
  });
  cli(file, "add", "milk");
  assert.deepEqual(cli(file, "set-category", "milk", "frozen"), {
    code: 1,
    stdout: "",
    stderr: "unknown category: frozen\n",
  });
});

test("unknown command or missing arguments print usage and exit 2", () => {
  const file = tempFile();
  for (const args of [
    [],
    ["fly"],
    ["add"],
    ["add", "milk", "--category"],
    ["remove"],
    ["set-category", "milk"],
    ["list", "--sideways"],
  ]) {
    const result = cli(file, ...args);
    assert.equal(result.code, 2, `args: ${args.join(" ")}`);
    assert.equal(result.stdout, "");
    assert.match(result.stderr, /^usage:/);
  }
});

test("an old-format file is migrated to version 2 on the next change", () => {
  const file = tempFile();
  writeFileSync(file, JSON.stringify(["milk", "bread"]));
  assert.equal(cli(file, "list").stdout, "milk\nbread\n");
  cli(file, "add", "apples", "--category", "produce");
  assert.deepEqual(JSON.parse(readFileSync(file, "utf8")), {
    version: 2,
    items: [
      { name: "milk", category: "other" },
      { name: "bread", category: "other" },
      { name: "apples", category: "produce" },
    ],
  });
});
