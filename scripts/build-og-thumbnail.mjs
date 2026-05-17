// scripts/build-og-thumbnail.mjs
//
// KakaoTalk's chat preview card has a fixed landscape image area, so a
// 1:1 thumbnail gets center-cropped — top and bottom of the design are
// chopped off. To preserve the user's full 1:1 design AND get a "long"
// (tall) preview that doesn't crop anything, we pad the square design
// onto a portrait 9:16 canvas with a neutral cream background.
//
// Input:  public/photos/og-thumbnail.jpg  (1080×1080, the master 1:1)
// Output: public/photos/og-thumbnail.jpg  (1080×1920, padded portrait)
//
// Run with: node scripts/build-og-thumbnail.mjs
// (Idempotent — running again pads from whatever the current file is,
// so KEEP a master copy in kkk/ to re-pad from if you ever edit the
// underlying design.)

import sharp from "sharp";
import { readFile, writeFile, copyFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SRC_MASTER = path.join(
  ROOT,
  "kkk",
  "모바일 청첩장_1080x1920",
  "0 썸네일 1대1",
  "썸네일_1080x1080.jpg"
);
const OUT = path.join(ROOT, "public", "photos", "og-thumbnail.jpg");
// Page background `#f4ede4` (the cream the rest of the site uses)
const BG = { r: 244, g: 237, b: 228, alpha: 1 };
// Target canvas — 9:16 portrait so Kakao renders the "long" preview.
const CANVAS_W = 1080;
const CANVAS_H = 1920;

async function main() {
  if (!existsSync(SRC_MASTER)) {
    throw new Error(`Master thumbnail not found at ${SRC_MASTER}`);
  }
  const square = await sharp(SRC_MASTER).resize(CANVAS_W, CANVAS_W).toBuffer();
  const padTop = Math.floor((CANVAS_H - CANVAS_W) / 2);
  const padBottom = CANVAS_H - CANVAS_W - padTop;

  await sharp({
    create: {
      width: CANVAS_W,
      height: CANVAS_H,
      channels: 3,
      background: BG,
    },
  })
    .composite([{ input: square, top: padTop, left: 0 }])
    .jpeg({ quality: 90, mozjpeg: true })
    .toFile(OUT);

  console.log(
    `✓ Wrote ${OUT}\n  ${CANVAS_W}×${CANVAS_H} portrait, 1:1 design centered, ${padTop}px / ${padBottom}px padding.`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
