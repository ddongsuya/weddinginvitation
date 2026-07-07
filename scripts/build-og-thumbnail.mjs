// scripts/build-og-thumbnail.mjs
//
// KakaoTalk's chat preview slot is a fixed 1.91:1 landscape and crops
// any image that doesn't match. The share card is therefore an image
// sized to EXACTLY 1200×630 (that ratio), so Kakao renders it
// edge-to-edge with no crop of its own.
//
// STRATEGY — user-provided landscape photo, used AS-IS. Per the user,
// the card must be this exact photo with no adjustment: no crop, no
// re-frame, no blur bars, no re-encode. The master below is already a
// finished 1200×630 landscape file, so this script only VERIFIES the
// dimensions and copies the bytes verbatim to the public asset. (If
// you ever swap the master, it must already be exactly 1200×630 — this
// script intentionally refuses to resize/crop, to keep "no adjustment"
// guaranteed.)
//
// (Earlier versions generated the card from a 1:1 master via sharp —
// first a centered design with blurred side bars, then a full-bleed
// center-crop. Both superseded by this drop-in landscape photo.)
//
// Input:  kkk/.../썸네일_가로_1200x630.jpg  (1200×630 landscape master)
// Output: public/photos/share-card-v4.jpg   (byte-identical copy)
//         NOTE: filename is bumped v3 → v4 so KakaoTalk/OG scrapers,
//         which cache preview images per-URL, fetch the new photo
//         instead of serving the stale cached one.
//
// Run with: node scripts/build-og-thumbnail.mjs

import sharp from "sharp";
import { existsSync, copyFileSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SRC_MASTER = path.join(
  ROOT,
  "kkk",
  "모바일 청첩장_1080x1920",
  "0 썸네일 1대1",
  "썸네일_가로_1200x630.jpg"
);
const OUT = path.join(ROOT, "public", "photos", "share-card-v4.jpg");

// Kakao's preview slot. The master must already match this exactly.
const CANVAS_W = 1200;
const CANVAS_H = 630;

async function main() {
  if (!existsSync(SRC_MASTER)) {
    throw new Error(`Master thumbnail not found at ${SRC_MASTER}`);
  }

  // Guard: the master must already be exactly 1200×630. We do NOT
  // resize/crop here — "no adjustment" is the whole point.
  const { width, height } = await sharp(SRC_MASTER).metadata();
  if (width !== CANVAS_W || height !== CANVAS_H) {
    throw new Error(
      `Master must be exactly ${CANVAS_W}×${CANVAS_H} (got ${width}×${height}). ` +
        `Re-crop the source to Kakao's 1.91:1 slot before running.`
    );
  }

  // Byte-for-byte copy — no re-encode, so the photo is untouched.
  copyFileSync(SRC_MASTER, OUT);

  console.log(
    `✓ Wrote ${OUT}\n  ${CANVAS_W}×${CANVAS_H} landscape, copied verbatim from the master (no crop, no re-encode).`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
