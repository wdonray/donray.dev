#!/usr/bin/env node
/**
 * Validates the next-intl message catalogs.
 *
 * FAILS CI when:
 * 1. Any locale is missing keys or has extra keys vs English
 *    (catches new English strings that were never propagated)
 * 2. ICU placeholders don't match the English source
 *    (catches broken translations that would crash at runtime)
 * 3. Any locale contains em dashes (repo style ban)
 *
 * WARNS (GitHub annotation, non-blocking) when a translated value is
 * identical to English and looks like a real sentence. Single words,
 * tech terms, company names, and product names often stay in English
 * intentionally, so these are warnings for a human to review.
 *
 * Usage: node scripts/check-translations.mjs
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const LOCALES = ["es", "zh", "tl"];

function load(locale) {
  const path = join(root, "messages", `${locale}.json`);
  return JSON.parse(readFileSync(path, "utf8"));
}

function flatten(obj, prefix = "", out = {}) {
  for (const [k, v] of Object.entries(obj)) {
    const p = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object") flatten(v, p, out);
    else out[p] = v;
  }
  return out;
}

function placeholders(str) {
  // Matches {name} and the {name, plural/select, ...} ICU block openers.
  const found = new Set();
  const re = /\{([a-zA-Z_][a-zA-Z0-9_]*)/g;
  let m;
  while ((m = re.exec(str)) !== null) {
    // Skip the '#' placeholder inside plural blocks; it's not a named arg.
    if (m[1] !== "#") found.add(m[1]);
  }
  return found;
}

/** Heuristic: does this look like a sentence that should have been translated? */
function looksUntranslated(value) {
  if (typeof value !== "string") return false;
  const words = value.trim().split(/\s+/);
  // Single words and short phrases are often intentionally English
  // (tech terms, product names, nav labels in some locales).
  if (words.length < 3) return false;
  // URLs, emails, and paths stay as-is.
  if (/^(https?:|mailto:|\/)/.test(value.trim())) return false;
  return true;
}

const errors = [];
const warnings = [];

const en = flatten(load("en"));
const enPaths = new Set(Object.keys(en));

for (const locale of LOCALES) {
  const messages = flatten(load(locale));
  const paths = new Set(Object.keys(messages));

  for (const p of enPaths) {
    if (!paths.has(p)) errors.push(`[${locale}] missing key: ${p}`);
  }
  for (const p of paths) {
    if (!enPaths.has(p)) errors.push(`[${locale}] extra key: ${p}`);
  }

  for (const p of enPaths) {
    if (!paths.has(p)) continue;
    const enVal = en[p];
    const val = messages[p];
    if (typeof enVal !== "string" || typeof val !== "string") continue;

    const enPh = placeholders(enVal);
    const ph = placeholders(val);
    for (const name of enPh) {
      if (!ph.has(name))
        errors.push(`[${locale}] ${p}: missing placeholder {${name}}`);
    }
    for (const name of ph) {
      if (!enPh.has(name))
        errors.push(`[${locale}] ${p}: extra placeholder {${name}}`);
    }

    if (val.includes("—")) errors.push(`[${locale}] ${p}: contains em dash`);

    if (val === enVal && looksUntranslated(val)) {
      warnings.push(
        `[${locale}] ${p}: identical to English, may need translation`,
      );
    }
  }
}

for (const w of warnings) console.log(`::warning::${w}`);
if (errors.length > 0) {
  for (const e of errors) console.log(`::error::${e}`);
  console.log(`\n${errors.length} translation check failure(s).`);
  process.exit(1);
}
console.log("Translation catalogs are consistent across all locales.");
if (warnings.length > 0) {
  console.log(`${warnings.length} warning(s) for human review.`);
}
