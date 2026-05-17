// scripts/build-og-thumbnail.mjs
//
// KakaoTalk's chat link-preview card has a FIXED landscape image area
// (≈1.91:1, same as Facebook/Twitter card). It scales any image to
// cover that slot and crops whatever doesn't fit. So:
//   - 1:1 thumbnail   → top + bottom chopped off
//   - 9:16 portrait   → top + bottom chopped off (~48% of height lost)
//   - 1.91:1 landscape → NO crop, shown in full
//
// Strategy: composite the user's 1:1 master onto a 1200×630 landscape
// canvas. The 1:1 is scaled to fit the canvas height (630×630) and
// centered horizontally; cream bars sit to its left and right. Kakao
// gets an image at the exact aspect ratio its slot expects, so it
// renders without cropping and every pixel of the user's design is
// visible in the preview.
//
// Input:  kkk/.../썸네일_1080x1080.jpg     (1080×1080, the master 1:1)
// Output: public/photos/share-card.jpg (1200×630 landscape)
//
// Run with: node scripts/build-og-thumbnail.mjs

import sharp from "sharp";
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
const OUT = path.join(ROOT, "public", "photos", "share-card.jpg");

// Page background `#f4ede4` (the cream the rest of the site uses) so
// the side bars blend into the wedding card's overall palette.
const BG = { r: 244, g: 237, b: 228, alpha: 1 };

// Canvas: Facebook/Kakao standard 1.91:1 landscape OG size. Kakao's
// preview slot fits this ratio exactly so the image renders edge-to-
// edge with no center-crop.
const CANVAS_W = 1200;
const CANVAS_H = 630;
// 1:1 design height = canvas height → 630×630 square in the middle.
const DESIGN_SIZE = CANVAS_H;

async function main() {
  if (!existsSync(SRC_MASTER)) {
    throw new Error(`Master thumbnail not found at ${SRC_MASTER}`);
  }
  const square = await sharp(SRC_MASTER)
    .resize(DESIGN_SIZE, DESIGN_SIZE)
    .toBuffer();
  const padLeft = Math.floor((CANVAS_W - DESIGN_SIZE) / 2);
  const padRight = CANVAS_W - DESIGN_SIZE - padLeft;

  await sharp({
    create: {
      width: CANVAS_W,
      height: CANVAS_H,
      channels: 3,
      background: BG,
    },
  })
    .composite([{ input: square, top: 0, left: padLeft }])
    .jpeg({ quality: 92, mozjpeg: true })
    .toFile(OUT);

  console.log(
    `✓ Wrote ${OUT}\n  ${CANVAS_W}×${CANVAS_H} landscape, 1:1 design centered, ${padLeft}px / ${padRight}px side padding.`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
