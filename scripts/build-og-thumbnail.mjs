// scripts/build-og-thumbnail.mjs
//
// KakaoTalk's chat preview slot is a fixed 1.91:1 landscape and crops
// any image that doesn't match. We generate the share card at exactly
// that ratio (1200×630) so Kakao renders it edge-to-edge with no crop
// of its own.
//
// STRATEGY — full-bleed (per user choice): the master 1:1 photo is
// scaled to COVER the whole 1200×630 canvas and center-cropped. The
// couple fills the card edge-to-edge, sharp, with no blurred side bars.
// Center gravity keeps both faces well inside the frame with headroom;
// the only thing lost is the lower legs / dress hem and some grass at
// the very bottom (a deliberate, accepted trade — a landscape slot
// physically cannot show a full-body 1:1 without either cropping or
// padding).
//
// (A previous version padded the sides with a blurred copy so nothing
// was cropped; superseded by this full-bleed look.)
//
// Input:  kkk/.../썸네일_1080x1080.jpg  (1080×1080, the master 1:1)
// Output: public/photos/share-card-v3.jpg (1200×630 landscape)
//         NOTE: filename is bumped v2 → v3 so KakaoTalk/OG scrapers,
//         which cache preview images per-URL, fetch the new image
//         instead of serving the stale cached one.
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
const OUT = path.join(ROOT, "public", "photos", "share-card-v3.jpg");

// 1.91:1 Facebook/Kakao OG standard. Kakao's preview slot is the
// same aspect, so it renders edge-to-edge with no center-crop.
const CANVAS_W = 1200;
const CANVAS_H = 630;

async function main() {
  if (!existsSync(SRC_MASTER)) {
    throw new Error(`Master thumbnail not found at ${SRC_MASTER}`);
  }

  // Cover the full 1200×630 with the master and center-crop. `center`
  // gravity keeps both subjects framed with headroom; only the lower
  // portion (legs / grass) falls outside the slot.
  await sharp(SRC_MASTER)
    .resize(CANVAS_W, CANVAS_H, { fit: "cover", position: "center" })
    .jpeg({ quality: 92, mozjpeg: true })
    .toFile(OUT);

  console.log(
    `✓ Wrote ${OUT}\n  ${CANVAS_W}×${CANVAS_H} landscape, full-bleed center-crop of the master (no blur bars).`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
