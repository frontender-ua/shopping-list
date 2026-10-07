import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

const bin = path.resolve("bin/shopping-list.js");

function setup() {
  const dir = mkdtempSync(path.join(os.tmpdir(), "shopping-list-"));
  const file = path.join(dir, "list.json");
  const run = (...args) => {
    const r = spawnSync("node", [bin, ...args], {
      env: { ...process.env, SHOPPING_LIST_FILE: file },
      encoding: "utf8",
    });
    return { out: r.stdout, err: r.stderr, code: r.status };
  };
  return { file, run };
}

test("add and add with a category", () => {
  const { file, run } = setup();
  assert.deepEqual(run("add", " milk "), { out: "added milk\n", err: "", code: 0 });
  assert.equal(run("add", "bread", "--category", "bakery").out, "added bread\n");
  assert.equal(run("add", "--category", "produce", "apple").out, "added apple\n");
  assert.deepEqual(JSON.parse(readFileSync(file, "utf8")), {
    version: 2,
    items: [
      { name: "milk", category: "other" },
      { name: "bread", category: "bakery" },
      { name: "apple", category: "produce" },
    ],
  });
});

test("add of a duplicate", () => {
  const { run } = setup();
  run("add", "milk");
  assert.deepEqual(run("add", "milk"), {
    out: "already on the list: milk\n",
    err: "",
    code: 0,
  });
});

test("add with an unknown category", () => {
  const { run } = setup();
  const r = run("add", "milk", "--category", "frozen");
  assert.equal(r.out, "");
  assert.equal(r.err, "unknown category: frozen\n");
  assert.equal(r.code, 1);
});

test("remove", () => {
  const { run } = setup();
  run("add", "milk");
  assert.deepEqual(run("remove", "milk"), { out: "removed milk\n", err: "", code: 0 });
  assert.deepEqual(run("remove", "milk"), {
    out: "",
    err: "not on the list: milk\n",
    code: 1,
  });
});

test("set-category", () => {
  const { run } = setup();
  run("add", "milk");
  assert.deepEqual(run("set-category", "milk", "dairy"), {
    out: "milk is now in dairy\n",
    err: "",
    code: 0,
  });
  assert.deepEqual(run("set-category", "nope", "dairy"), {
    out: "",
    err: "not on the list: nope\n",
    code: 1,
  });
  const r = run("set-category", "milk", "frozen");
  assert.equal(r.err, "unknown category: frozen\n");
  assert.equal(r.code, 1);
});

test("list and list --by-category", () => {
  const { run } = setup();
  run("add", "soap", "--category", "household");
  run("add", "milk", "--category", "dairy");
  run("add", "cheese", "--category", "dairy");
  assert.equal(run("list").out, "soap\nmilk\ncheese\n");
  assert.equal(
    run("list", "--by-category").out,
    "dairy:\n  milk\n  cheese\nhousehold:\n  soap\n",
  );
});

test("an old format file loads", () => {
  const { file, run } = setup();
  writeFileSync(file, JSON.stringify(["milk"]));
  assert.equal(run("list", "--by-category").out, "other:\n  milk\n");
  run("add", "bread");
  assert.equal(JSON.parse(readFileSync(file, "utf8")).version, 2);
});

test("usage errors exit with 2", () => {
  const { run } = setup();
  for (const args of [[], ["bogus"], ["add"], ["remove"], ["set-category", "milk"], ["add", "milk", "--category"]]) {
    const r = run(...args);
    assert.equal(r.code, 2, args.join(" "));
    assert.match(r.err, /usage:/);
    assert.equal(r.out, "");
  }
});
