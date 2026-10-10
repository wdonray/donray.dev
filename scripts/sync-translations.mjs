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
  const isArray = Array.isArray(source);
  const out = isArray ? [] : {};
  let added = 0;
  let removed = 0;
  const entries = isArray ? source.entries() : Object.entries(source);
  for (const [k, v] of entries) {
    const key = isArray ? String(k) : k;
    const p = path ? `${path}.${key}` : key;
    const t = target && typeof target === "object" ? target[key] : undefined;
    if (v && typeof v === "object") {
      const sub = syncTree(v, t && typeof t === "object" ? t : undefined, p);
      out[key] = sub.tree;
      added += sub.added;
      removed += sub.removed;
    } else if (t !== undefined) {
      out[key] = t;
    } else {
      out[key] = v;
      added++;
      console.log(`  + ${p}`);
    }
  }
  if (target && typeof target === "object") {
    const sourceKeys = new Set(
      isArray ? source.map((_, i) => String(i)) : Object.keys(source),
    );
    for (const k of Object.keys(target)) {
      if (!sourceKeys.has(k)) {
        removed++;
        console.log(`  - ${path ? `${path}.` : ""}${k}`);
      }
    }
  }
  // Convert back to array if source was an array
  if (isArray) {
    const arr = [];
    for (let i = 0; i < source.length; i++) arr.push(out[String(i)]);
    return { tree: arr, added, removed };
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
