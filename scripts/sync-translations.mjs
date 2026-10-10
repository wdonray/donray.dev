#!/usr/bin/env node
/**
 * Syncs new English message keys into the other locales.
 *
 * When you add a string to messages/en.json, run:
 *   npm run translations:sync
 *
 * This adds any missing keys to es/zh/tl.json with the English value as a
 * placeholder, preserving en.json's key order. Translate the placeholders
 * afterwards; `npm run check:translations` will warn on any you miss.
 *
 * Also removes keys that no longer exist in en.json.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const LOCALES = ["es", "zh", "tl"];

function load(locale) {
  return JSON.parse(
    readFileSync(join(root, "messages", `${locale}.json`), "utf8"),
  );
}

function save(locale, data) {
  writeFileSync(
    join(root, "messages", `${locale}.json`),
    JSON.stringify(data, null, 2) + "\n",
    "utf8",
  );
}

/**
 * Rebuilds `target` to match `source`'s key structure:
 * - missing keys are added with the English value (needs translation)
 * - extra keys are removed
 * - key order follows the source
 */
function syncTree(source, target, path = "") {
  const out = {};
  let added = 0;
  let removed = 0;
  for (const [k, v] of Object.entries(source)) {
    const p = path ? `${path}.${k}` : k;
    if (v && typeof v === "object") {
      const sub = syncTree(
        v,
        target && typeof target[k] === "object" ? target[k] : {},
        p,
      );
      out[k] = sub.tree;
      added += sub.added;
      removed += sub.removed;
    } else if (target && k in target) {
      out[k] = target[k];
    } else {
      out[k] = v;
      added++;
      console.log(`  + ${p}`);
    }
  }
  if (target) {
    for (const k of Object.keys(target)) {
      if (!(k in source)) {
        removed++;
        console.log(`  - ${path ? `${path}.` : ""}${k}`);
      }
    }
  }
  return { tree: out, added, removed };
}

const en = load("en");
for (const locale of LOCALES) {
  console.log(`\n${locale}.json:`);
  const { tree, added, removed } = syncTree(en, load(locale));
  if (added === 0 && removed === 0) {
    console.log("  already in sync");
  } else {
    save(locale, tree);
    console.log(`  ${added} added, ${removed} removed`);
  }
}
console.log("\nDone. Translate the new placeholders, then run:");
console.log("  npm run check:translations");
