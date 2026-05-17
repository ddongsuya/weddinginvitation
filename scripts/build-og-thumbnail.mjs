// scripts/build-og-thumbnail.mjs
//
// KakaoTalk's chat preview slot is a fixed 1.91:1 landscape and crops
// any image that doesn't match. A 1:1 design can't physically fill
// that slot without losing pixels — geometric fact. We've tried:
//   - Bare 1:1 file → Kakao crops top + bottom
//   - 9:16 portrait + cream pad → Kakao crops ~48% of height
//   - 1.91:1 + cream side bars → no crop, but cream "empty" sides
//     look like the photo is missing chunks to the user
//
// Final strategy (industry standard, same as Instagram/FB feed for
// portrait photos): make the canvas 1.91:1 (so Kakao does no crop)
// and fill the side margins with a blurred, slightly-darkened copy
// of the master image itself. From the viewer's eye the sharp 1:1
// design sits at the center and the photo's own colors extend
// naturally to the canvas edges — there are no "blank" cream bars
// and nothing has been cropped.
//
// Input:  kkk/.../썸네일_1080x1080.jpg  (1080×1080, the master 1:1)
// Output: public/photos/share-card-v2.jpg (1200×630 landscape)
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
const OUT = path.join(ROOT, "public", "photos", "share-card-v2.jpg");

// 1.91:1 Facebook/Kakao OG standard. Kakao's preview slot is the
// same aspect, so renders edge-to-edge with no center-crop.
const CANVAS_W = 1200;
const CANVAS_H = 630;
// Sharp 1:1 in the middle, height-matched to canvas.
const DESIGN_SIZE = CANVAS_H;

async function main() {
  if (!existsSync(SRC_MASTER)) {
    throw new Error(`Master thumbnail not found at ${SRC_MASTER}`);
  }

  // 1. Blurred background — the master scaled to cover the full
  //    1200×630, heavily blurred, and dimmed slightly so the sharp
  //    foreground stands out.
  const blurredBg = await sharp(SRC_MASTER)
    .resize(CANVAS_W, CANVAS_H, { fit: "cover", position: "center" })
    .blur(40)
    .modulate({ brightness: 0.78, saturation: 0.85 })
    .toBuffer();

  // 2. Sharp foreground — the master at canvas height (630×630),
  //    placed centered on top of the blurred background.
  const foreground = await sharp(SRC_MASTER)
    .resize(DESIGN_SIZE, DESIGN_SIZE)
    .toBuffer();

  const padLeft = Math.floor((CANVAS_W - DESIGN_SIZE) / 2);

  await sharp(blurredBg)
    .composite([{ input: foreground, top: 0, left: padLeft }])
    .jpeg({ quality: 92, mozjpeg: true })
    .toFile(OUT);

  console.log(
    `✓ Wrote ${OUT}\n  ${CANVAS_W}×${CANVAS_H} landscape, sharp 1:1 design centered, side margins filled with a blur-extended dim copy of the master.`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
