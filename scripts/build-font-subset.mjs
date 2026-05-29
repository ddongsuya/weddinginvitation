// Subsets the handwriting font down to only the glyphs this invitation
// actually renders, and re-encodes it as woff2.
//
// Why: NanumNaEuiANaeSonGeurSsi.ttf is ~4.8 MB and is the primary font
// for EVERY piece of text on the site (serif/sans/hand all map to it in
// tailwind.config.ts). Shipping the full Korean .ttf means every guest
// downloads ~4.8 MB before the intended typography appears. The site's
// copy is fixed (names, dates, the invitation body, all UI labels), so
// we can scan the source for every character that can ever render and
// keep only those glyphs — typically a ~95-98% size cut — then preload
// the result for instant premium type.
//
// IMPORTANT: if you add NEW Korean text anywhere (new copy, a renamed
// venue, etc.), re-run this script so the new glyphs get included:
//     node scripts/build-font-subset.mjs
// Any character missing from the subset still renders — it just falls
// back to Gowun Batang / system serif instead of the handwriting face.

import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, extname, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import subsetFont from "subset-font";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SRC_FONT = join(ROOT, "app/fonts/NanumNaEuiANaeSonGeurSsi.ttf");
const OUT_FONT = join(ROOT, "app/fonts/NanumNaEuiANaeSonGeurSsi.subset.woff2");

// Directories whose text literals can end up on screen.
const SCAN_DIRS = ["app", "lib"];
const SCAN_EXT = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".css"]);
const SKIP_DIR = new Set(["node_modules", ".next", ".git", "fonts"]);

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (SKIP_DIR.has(entry)) continue;
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (SCAN_EXT.has(extname(entry))) out.push(full);
  }
  return out;
}

const chars = new Set();

// 1. Every character that appears anywhere in the source (string
//    literals + comments). Code punctuation is ASCII and trivially
//    cheap, so we don't bother filtering — we just keep what's there.
for (const dir of SCAN_DIRS) {
  for (const file of walk(join(ROOT, dir))) {
    for (const ch of readFileSync(file, "utf8")) chars.add(ch);
  }
}

// 2. Baseline safety net so nothing essential can ever be missing:
//    full printable ASCII, digits, and the symbols this design leans on.
for (let c = 0x20; c <= 0x7e; c++) chars.add(String.fromCodePoint(c));
for (const ch of "♥♡·—–…“”‘’()[]{}％%℃°※™₩，、。！？～") chars.add(ch);

const text = [...chars].join("");

const original = readFileSync(SRC_FONT);
const subset = await subsetFont(original, text, { targetFormat: "woff2" });
writeFileSync(OUT_FONT, subset);

const kb = (n) => (n / 1024).toFixed(1) + " KB";
console.log(`glyphs kept       : ${chars.size} unique chars`);
console.log(`source  (.ttf)    : ${kb(original.length)}`);
console.log(`subset  (.woff2)  : ${kb(subset.length)}`);
console.log(
  `reduction         : ${(100 - (subset.length / original.length) * 100).toFixed(1)}%`
);
console.log(`written           : ${OUT_FONT}`);
