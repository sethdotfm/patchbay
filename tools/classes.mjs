#!/usr/bin/env node
// Class coverage. Reports pb- classes that a page uses but patchbay.css does
// not define, and classes patchbay.css defines that a page never shows.
//
//   node tools/classes.mjs [--llms] [page.html ...]   (default: reference.html)
//   --llms  also require every defined class to appear in llms.txt

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const pages = args.filter((a) => !a.startsWith("--"));
if (!pages.length) pages.push("reference.html");

const css = readFileSync(join(root, "css/patchbay.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
const defined = new Set([...css.matchAll(/\.(pb-[a-z0-9_-]+)/g)].map((m) => m[1]));

const used = new Set();
for (const page of pages) {
  // Any pb- token in the page or its scripts counts: classes are also set by
  // JS (state toggles, toasts) and named in data attributes.
  for (const file of [page, ...(page === "reference.html" ? ["demo/demo.js"] : [])]) {
    const text = readFileSync(join(root, file), "utf8");
    for (const m of text.matchAll(/(?<![\w-])(pb-[a-z0-9]+(?:(?:__|--|-)[a-z0-9]+)*)/g)) used.add(m[1]);
  }
}

let bad = 0;
const undefinedUsed = [...used].filter((c) => !defined.has(c)).sort();
if (undefinedUsed.length) { bad++; console.error(`Used but not defined:\n  ${undefinedUsed.join("\n  ")}`); }

// Classes that exist only as part of a longer selector chain still count as
// shown if the page uses them; report the rest.
const unshown = [...defined].filter((c) => !used.has(c)).sort();
if (unshown.length) { bad++; console.error(`Defined but not shown in ${pages.join(", ")}:\n  ${unshown.join("\n  ")}`); }

if (args.includes("--llms")) {
  // llms.txt writes variants compactly ("pb-dot--ok|warn", "pb-btn + --sm",
  // "> __key + __val", "pb-level--video|01…16"), so a class counts when a line
  // names its parent and the last part follows a separator on that line.
  const lines = readFileSync(join(root, "llms.txt"), "utf8").split("\n");
  const mentioned = (c) => {
    if (lines.some((l) => l.includes(c))) return true;
    const [block, mod] = c.split(/--(.*)/s);
    if (mod && lines.some((l) => l.includes(block) && l.includes(`--${mod}`))) return true;
    const m = c.match(/^(.*?)(--|__|-)([a-z0-9]+)$/);
    if (!m) return false;
    const [, head, , tail] = m;
    const after = new RegExp(`(?:--|__|-|\\||\\[|\\s|\\()${tail}(?![\\w])`);
    return lines.some((l) => {
      if (!l.includes(head)) return false;
      if (after.test(l)) return true;
      const range = /^\d+$/.test(tail) && l.match(/(\d+)…(\d+)/);
      return Boolean(range) && +tail >= +range[1] && +tail <= +range[2];
    });
  };
  const missing = [...defined].filter((c) => !mentioned(c)).sort();
  if (missing.length) { bad++; console.error(`Not mentioned in llms.txt:\n  ${missing.join("\n  ")}`); }
}

console.log(bad ? "Coverage gaps above" : `All ${defined.size} classes defined and shown`);
process.exit(bad ? 1 : 0);
