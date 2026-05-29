// One-pass, idempotent recompression of the wedding photos.
//
// The originals are 1080×1920 JPEGs exported at very high quality
// (~2–2.8 MB each, 91 MB total). next/image already resizes + re-encodes
// to AVIF/WebP for delivery, so end users don't download the originals —
// but the bloated sources slow Vercel's first optimization pass, balloon
// the repo, and waste bandwidth on the optimizer's fetch. Re-encoding
// with mozjpeg at q82 keeps the same dimensions and is visually
// indistinguishable on a phone while cutting each file by ~70-80%.
//
// IDEMPOTENT: only files larger than SKIP_BELOW are touched. After one
// pass everything is well under that threshold, so re-running is a no-op
// and never double-compresses (no generation loss).
//
//     node scripts/compress-photos.mjs

import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { join, dirname, extname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIR = join(__dirname, "..", "public", "photos");
const QUALITY = 82;
const SKIP_BELOW = 1_000_000; // 1 MB — originals are far above this

const kb = (n) => (n / 1024).toFixed(0) + " KB";
let before = 0;
let after = 0;
let touched = 0;

for (const name of readdirSync(DIR)) {
  if (extname(name).toLowerCase() !== ".jpg") continue;
  const file = join(DIR, name);
  const size = statSync(file).size;
  if (size < SKIP_BELOW) {
    console.log(`skip  ${name}  (${kb(size)}, already small)`);
    continue;
  }
  const input = readFileSync(file);
  const out = await sharp(input)
    .rotate() // bake in EXIF orientation before stripping metadata
    .jpeg({ quality: QUALITY, mozjpeg: true })
    .toBuffer();
  // Only overwrite if we actually saved space.
  if (out.length < size) {
    writeFileSync(file, out);
    console.log(`ok    ${name}  ${kb(size)} -> ${kb(out.length)}`);
    before += size;
    after += out.length;
    touched++;
  } else {
    console.log(`keep  ${name}  (${kb(size)}, recompress was larger)`);
  }
}

console.log(
  `\n${touched} files  ${kb(before)} -> ${kb(after)}  (-${(100 - (after / before) * 100 || 0).toFixed(1)}%)`
);
