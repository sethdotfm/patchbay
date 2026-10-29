#!/usr/bin/env node
// Resolve Patchbay's colour tokens per theme and check the documented
// contrast pairs. No dependencies.
//
//   node tools/contrast.mjs                  check pairs; exit 1 on a failure
//   node tools/contrast.mjs --dump           print every resolved token, both themes
//   node tools/contrast.mjs --ratios         print every pair's ratio
//   node tools/contrast.mjs [--tokens file]  use another tokens file
//
// --dump normalises colours to #rrggbb / rgba() and rem to px, so a token
// refactor that changes no value diffs empty against an earlier dump.

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const tokensPath = args.includes("--tokens")
  ? args[args.indexOf("--tokens") + 1]
  : join(dirname(fileURLToPath(import.meta.url)), "../css/patchbay.tokens.css");

// ---- parse the first :root block into { name: rawValue } -------------------

function rootBlock(css) {
  const start = css.indexOf(":root {");
  if (start < 0) throw new Error("no :root block");
  let depth = 0;
  for (let i = css.indexOf("{", start); i < css.length; i++) {
    if (css[i] === "{") depth++;
    else if (css[i] === "}" && --depth === 0) return css.slice(css.indexOf("{", start) + 1, i);
  }
  throw new Error("unterminated :root block");
}

const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, "");
const raw = {};
for (const m of stripComments(rootBlock(readFileSync(tokensPath, "utf8")))
  .matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/g)) {
  raw[m[1]] = m[2].trim().replace(/\s+/g, " ");
}

// ---- resolution -------------------------------------------------------------

// Index of the ")" that closes the "(" at `open`.
function closeParen(s, open) {
  let depth = 0;
  for (let i = open; i < s.length; i++) {
    if (s[i] === "(") depth++;
    else if (s[i] === ")" && --depth === 0) return i;
  }
  throw new Error(`unbalanced parens in: ${s}`);
}

function splitTop(s) {
  const parts = [];
  let depth = 0, from = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === "(") depth++;
    else if (s[i] === ")") depth--;
    else if (s[i] === "," && depth === 0) { parts.push(s.slice(from, i).trim()); from = i + 1; }
  }
  parts.push(s.slice(from).trim());
  return parts;
}

function resolve(value, theme, seen = []) {
  let out = value;
  for (let guard = 0; guard < 50; guard++) {
    const v = out.indexOf("var(");
    if (v < 0) break;
    const end = closeParen(out, v + 3);
    const [name, ...fallback] = splitTop(out.slice(v + 4, end));
    if (seen.includes(name)) throw new Error(`cycle: ${[...seen, name].join(" -> ")}`);
    const target = raw[name] !== undefined
      ? resolve(raw[name], theme, [...seen, name])
      : fallback.join(",");
    out = out.slice(0, v) + target + out.slice(end + 1);
  }
  for (let guard = 0; guard < 50; guard++) {
    const ld = out.indexOf("light-dark(");
    if (ld < 0) break;
    // Resolve the innermost one first.
    const inner = out.indexOf("light-dark(", ld + 1);
    const at = inner >= 0 && inner < closeParen(out, ld + 10) ? inner : ld;
    const end = closeParen(out, at + 10);
    const [light, dark] = splitTop(out.slice(at + 11, end));
    out = out.slice(0, at) + (theme === "light" ? light : dark) + out.slice(end + 1);
  }
  return out;
}

// ---- colour maths -----------------------------------------------------------

const hex = (n) => Math.round(n).toString(16).padStart(2, "0");

function parseColor(s) {
  s = s.trim().toLowerCase();
  let m = s.match(/^#([0-9a-f]{3,8})$/);
  if (m) {
    let h = m[1];
    if (h.length === 3 || h.length === 4) h = [...h].map((c) => c + c).join("");
    const n = (i) => parseInt(h.slice(i, i + 2), 16);
    return { r: n(0), g: n(2), b: n(4), a: h.length === 8 ? n(6) / 255 : 1 };
  }
  m = s.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)$/);
  if (m) return { r: +m[1], g: +m[2], b: +m[3], a: m[4] === undefined ? 1 : +m[4] };
  return null;
}

function canonical(c) {
  return c.a === 1
    ? `#${hex(c.r)}${hex(c.g)}${hex(c.b)}`
    : `rgba(${c.r}, ${c.g}, ${c.b}, ${+c.a.toFixed(4)})`;
}

// Composite a (possibly translucent) colour over an opaque one.
const over = (fg, bg) => ({
  r: fg.r * fg.a + bg.r * (1 - fg.a),
  g: fg.g * fg.a + bg.g * (1 - fg.a),
  b: fg.b * fg.a + bg.b * (1 - fg.a),
  a: 1,
});

function luminance(c) {
  const f = (v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
}

function ratio(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

// ---- dump -------------------------------------------------------------------

function normalise(value) {
  return value
    .replace(/#[0-9a-fA-F]{3,8}\b/g, (h) => canonical(parseColor(h)))
    .replace(/rgba?\([^)]*\)/g, (c) => canonical(parseColor(c)))
    .replace(/(-?[\d.]+)rem\b/g, (_, n) => `${+(parseFloat(n) * 16).toFixed(4)}px`);
}

if (flag("--dump")) {
  for (const name of Object.keys(raw)) {
    const l = normalise(resolve(raw[name], "light"));
    const d = normalise(resolve(raw[name], "dark"));
    console.log(l === d ? `${name}: ${l}` : `${name}: light=${l} | dark=${d}`);
  }
  process.exit(0);
}

// ---- pairs ------------------------------------------------------------------

const SURFACES = ["sunken", "base", "raised", "overlay", "high", "control", "hover"]
  .map((s) => `--pb-surface-${s}`);
const ROLES = ["source", "dest", "tieline"].flatMap((r) => [`--pb-${r}`, `--pb-${r}-hover`]);
// Status and accent text sits on resting surfaces, buttons included; the
// hover step is only for text and icons that are already neutral.
const RESTING = SURFACES.filter((s) => s !== "--pb-surface-hover");
const STATUS_TEXT = ["ok", "warn", "error", "info", "idle"].map((s) => `--pb-status-${s}`);
const ACCENT_TEXT = ["--pb-accent", "--pb-accent-hover", "--pb-commit", "--pb-commit-hover"];
const ON_ACCENT = ["--pb-accent", "--pb-accent-hover", "--pb-commit", "--pb-commit-hover",
  "--pb-status-error", "--pb-danger-hover", "--pb-status-ok", "--pb-status-ok-hover"]
  .filter((t) => raw[t] !== undefined);

// [label, foreground tokens, background tokens, minimum ratio]
const PAIRS = [
  ["text on surfaces", ["--pb-text", "--pb-text-strong", "--pb-text-muted"], SURFACES, 4.5],
  ["status/accent text on surfaces", [...STATUS_TEXT, ...ACCENT_TEXT], RESTING, 4.5],
  ["protect colour on surfaces", ["--pb-protect"], RESTING, 3],
  ["text on routing roles", ["--pb-text", "--pb-text-strong"], ROLES, 4.5],
  ["on-accent text on fills", ["--pb-text-on-accent"], ON_ACCENT, 4.5],
  ["control outline", ["--pb-edge"], RESTING, 3],
  ["focus ring", ["--pb-accent"], SURFACES, 3],
  ["warn fill on the track", ["--pb-status-warn-fill"], ["--pb-surface-sunken"], 3],
  ["scrollbar thumb", ["--pb-scroll-thumb"], ["--pb-surface-base", "--pb-surface-raised"], 3],
];

const colour = (token, theme) => {
  if (raw[token] === undefined) throw new Error(`unknown token ${token}`);
  const c = parseColor(resolve(raw[token], theme));
  if (!c) throw new Error(`${token} is not a colour in ${theme}: ${resolve(raw[token], theme)}`);
  return c;
};

let failures = 0;
const lowest = {};
for (const theme of ["light", "dark"]) {
  for (const [label, fgs, bgs, min] of PAIRS) {
    for (const bgToken of bgs) {
      const bg = colour(bgToken, theme);
      for (const fgToken of fgs) {
        const r = ratio(over(colour(fgToken, theme), bg), bg);
        const ok = r >= min;
        const key = `${theme}|${label}`;
        if (!lowest[key] || r < lowest[key].r) lowest[key] = { r, fgToken, bgToken, min };
        if (!ok) {
          failures++;
          console.error(`FAIL ${theme} ${label}: ${fgToken} on ${bgToken} = ${r.toFixed(2)}:1 (< ${min})`);
        } else if (flag("--ratios")) {
          console.log(`${theme.padEnd(5)} ${r.toFixed(2).padStart(6)}:1  ${fgToken} on ${bgToken}`);
        }
      }
    }
  }
}

console.log("Lowest ratio per group:");
for (const [key, { r, fgToken, bgToken, min }] of Object.entries(lowest)) {
  const [theme, label] = key.split("|");
  console.log(`  ${theme.padEnd(5)} ${r.toFixed(2).padStart(6)}:1 (min ${min})  ${label}: ${fgToken} on ${bgToken}`);
}
console.log(failures ? `${failures} failing pair(s)` : "All pairs pass");
process.exit(failures ? 1 : 0);
