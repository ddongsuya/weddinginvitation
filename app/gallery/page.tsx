"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { SubpageHero } from "../components-home/SubpageHero";
import { SubpageNav } from "../components-home/SubpageNav";
import { weddingData } from "@/lib/data";

const PAGE_SIZE = 9;

export default function GalleryPage() {
  const [active, setActive] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  // Direction of last page change (for slide-in animation between grid pages)
  const [pageDir, setPageDir] = useState<1 | -1>(1);

  const total = weddingData.gallery.length;
  const pageCount = Math.ceil(total / PAGE_SIZE);
  const start = page * PAGE_SIZE;
  const visible = weddingData.gallery.slice(start, start + PAGE_SIZE);

  const close = () => setActive(null);
  const goNext = () => {
    setDirection(1);
    setActive((a) => (a !== null ? (a + 1) % total : a));
  };
  const goPrev = () => {
    setDirection(-1);
    setActive((a) => (a !== null ? (a - 1 + total) % total : a));
  };

  // Grid pagination — used by both the dots/arrows and the swipe gesture.
  const goNextPage = () => {
    setPage((p) => {
      if (p >= pageCount - 1) return p;
      setPageDir(1);
      return p + 1;
    });
  };
  const goPrevPage = () => {
    setPage((p) => {
      if (p <= 0) return p;
      setPageDir(-1);
      return p - 1;
    });
  };

  // Grid swipe. Two deliberate paths — the old single drag-based version
  // both needed a "priming" touch AND let the page drift vertically mid-
  // swipe, so neither path uses Framer's `drag` anymore:
  //
  //  • Touch — handled by the native listeners in the effect below so we
  //    can DIRECTION-LOCK. The instant a gesture reads as horizontal we
  //    `preventDefault` the touchmove, which pins the page to the swipe
  //    (no up/down drift while flipping). A vertical-leaning gesture is
  //    never preventDefaulted, so the page scrolls with full native
  //    momentum. `touch-action: pan-y` (on the wrapper) is what keeps
  //    that vertical scroll with the browser; we only take over the x axis.
  //  • Mouse / pen — handled by the React pointer props on the wrapper.
  //    A mouse drag never scrolls the page, so it needs no lock; we just
  //    read the release. Both paths share the same distance/flick test.
  const gridWrapRef = useRef<HTMLDivElement | null>(null);
  const swipeStart = useRef<{ x: number; y: number; t: number } | null>(null);
  // Set true when a release is consumed as a swipe, so the photo's click
  // (which can still fire after a small drag) doesn't also open the lightbox.
  const swipeConsumed = useRef(false);

  // Shared decision: did this horizontal travel mean "flip the page"?
  const applySwipe = (dx: number, dt: number) => {
    const farEnough = Math.abs(dx) > 56;
    const quickFlick = Math.abs(dx) > 28 && dt < 240;
    if (!(farEnough || quickFlick)) return;
    swipeConsumed.current = true;
    if (dx < 0) goNextPage();
    else goPrevPage();
  };

  const onGridPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "touch") return; // touch goes through the locked path
    swipeStart.current = { x: e.clientX, y: e.clientY, t: e.timeStamp };
    swipeConsumed.current = false;
  };

  const onGridPointerUp = (e: React.PointerEvent) => {
    if (e.pointerType === "touch") return;
    const s = swipeStart.current;
    swipeStart.current = null;
    if (!s || pageCount <= 1) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    if (Math.abs(dx) > Math.abs(dy)) applySwipe(dx, e.timeStamp - s.t);
  };

  // Touch path with horizontal direction-lock. Registered imperatively
  // because the touchmove listener must be { passive: false } for
  // preventDefault to actually cancel the page scroll.
  useEffect(() => {
    const el = gridWrapRef.current;
    if (!el || pageCount <= 1) return;

    let sx = 0;
    let sy = 0;
    let st = 0;
    let axis: "x" | "y" | null = null;
    let tracking = false;

    const onStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) {
        tracking = false;
        return;
      }
      const t = e.touches[0];
      sx = t.clientX;
      sy = t.clientY;
      st = e.timeStamp;
      axis = null;
      tracking = true;
      swipeConsumed.current = false;
    };
    const onMove = (e: TouchEvent) => {
      if (!tracking || e.touches.length !== 1) return;
      const t = e.touches[0];
      const dx = t.clientX - sx;
      const dy = t.clientY - sy;
      if (axis === null) {
        // Wait for a few px of intent before committing to an axis.
        if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
        axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      }
      if (axis === "x") e.preventDefault(); // pin the page to the swipe
    };
    const onEnd = (e: TouchEvent) => {
      if (!tracking) return;
      tracking = false;
      if (axis !== "x") return;
      const t = e.changedTouches[0];
      applySwipe(t.clientX - sx, e.timeStamp - st);
    };
    const stop = () => {
      tracking = false;
    };

    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchmove", onMove, { passive: false });
    el.addEventListener("touchend", onEnd, { passive: true });
    el.addEventListener("touchcancel", stop, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove", onMove);
      el.removeEventListener("touchend", onEnd);
      el.removeEventListener("touchcancel", stop);
    };
    // applySwipe / goNextPage / goPrevPage are behaviorally stable
    // (pageCount is constant for the page's lifetime).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageCount]);

  // Track the OPEN/CLOSED transition of the lightbox separately from
  // which photo is showing — every effect below depends on this boolean,
  // not on `active` itself, so flipping photos with the swipe / arrow keys
  // doesn't tear down and rebuild listeners (and, critically for the
  // back-button hook, doesn't call history.back() per swipe, which used
  // to slam the lightbox shut on the first left/right gesture).
  const lightboxOpen = active !== null;

  // Keyboard navigation while the lightbox is open.
  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext();
      else if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightboxOpen]);

  // Lock body scroll while the lightbox is open.
  useEffect(() => {
    if (!lightboxOpen) return;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prev;
    };
  }, [lightboxOpen]);

  // Browser back closes the lightbox. Push one synthetic history entry
  // on OPEN; pop it on close — and only on close, never per photo swipe.
  // (Previous version keyed this effect on `active`, so swiping ran the
  // cleanup → history.back() → popstate → setActive(null) cycle and the
  // lightbox closed on first swipe.)
  useEffect(() => {
    if (!lightboxOpen) return;
    if (typeof window === "undefined") return;
    window.history.pushState({ lightbox: true }, "");
    const onPop = () => setActive(null);
    window.addEventListener("popstate", onPop);
    return () => {
      window.removeEventListener("popstate", onPop);
      if (window.history.state?.lightbox) {
        window.history.back();
      }
    };
  }, [lightboxOpen]);

  return (
    <main>
      <SubpageHero
        num="04"
        label="갤러리"
        photo={weddingData.menuHeroes.gallery}
      />

      <section className="px-4 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h2 className="font-hand text-[clamp(2.75rem,8.5vw,4.25rem)] font-medium leading-[1.15] text-foreground">
              우리의 순간들
            </h2>
            <p className="mt-5 font-serif text-[clamp(1.25rem,5vw,1.625rem)] tracking-wide text-muted">
              총 {total}장
            </p>
          </motion.div>

          {/* Swipe-paginated grid. Swipes are read directly (touch via the
              direction-locked listeners in the effect above, mouse via the
              pointer props here) so the very first swipe registers — no
              Framer `drag` priming touch needed — and a horizontal swipe
              pins the page instead of dragging it up/down. Vertical gestures
              fall through to native scroll via touch-action: pan-y. */}
          <div
            ref={gridWrapRef}
            className="mt-12 sm:mt-16"
            onPointerDown={onGridPointerDown}
            onPointerUp={onGridPointerUp}
            onPointerCancel={() => {
              swipeStart.current = null;
            }}
            style={{ touchAction: "pan-y" }}
          >
            <AnimatePresence mode="wait" custom={pageDir}>
              <motion.div
                key={page}
                custom={pageDir}
                variants={{
                  enter: (d: number) => ({ opacity: 0, x: d * 48 }),
                  center: { opacity: 1, x: 0 },
                  leave: (d: number) => ({ opacity: 0, x: d * -48 }),
                }}
                initial="enter"
                animate="center"
                exit="leave"
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="grid grid-cols-3 gap-2 sm:gap-4"
              >
                {visible.map((photo, i) => {
                  const absoluteIndex = start + i;
                  return (
                    <motion.button
                      key={absoluteIndex}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: i * 0.04 }}
                      onClick={() => {
                        // A horizontal swipe ends in a click on desktop;
                        // don't let that also open the lightbox.
                        if (swipeConsumed.current) {
                          swipeConsumed.current = false;
                          return;
                        }
                        setDirection(1);
                        setActive(absoluteIndex);
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      className="group relative aspect-[9/16] overflow-hidden bg-stone-100"
                      aria-label={`${absoluteIndex + 1}번째 사진 보기`}
                    >
                      <Image
                        src={photo.src}
                        alt={photo.alt}
                        fill
                        sizes="(min-width: 640px) 33vw, 33vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        loading={i < 6 ? "eager" : "lazy"}
                        draggable={false}
                      />
                    </motion.button>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>

          {pageCount > 1 && (
            <div className="mt-12 flex flex-col items-center gap-4 sm:mt-16">
              <div className="flex items-center gap-3">
                <motion.button
                  onClick={goPrevPage}
                  disabled={page === 0}
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.92 }}
                  className="grid h-10 w-10 place-items-center rounded-full border border-stone-200 bg-white text-foreground transition-colors hover:bg-stone-50 disabled:opacity-30 sm:h-11 sm:w-11"
                  aria-label="이전 페이지"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                </motion.button>
                <div className="flex items-center gap-2">
                  {Array.from({ length: pageCount }).map((_, i) => (
                    <motion.button
                      key={i}
                      onClick={() => {
                        setPageDir(i > page ? 1 : -1);
                        setPage(i);
                      }}
                      whileHover={{ scaleY: 1.4 }}
                      whileTap={{ scaleY: 0.7 }}
                      transition={{ type: "spring", stiffness: 380, damping: 18 }}
                      className={`h-1.5 rounded-full transition-all ${
                        i === page
                          ? "w-8 bg-accent"
                          : "w-1.5 bg-stone-300 hover:bg-stone-400"
                      }`}
                      aria-label={`${i + 1}페이지로 이동`}
                      aria-current={i === page ? "page" : undefined}
                    />
                  ))}
                </div>
                <motion.button
                  onClick={goNextPage}
                  disabled={page === pageCount - 1}
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.92 }}
                  className="grid h-10 w-10 place-items-center rounded-full border border-stone-200 bg-white text-foreground transition-colors hover:bg-stone-50 disabled:opacity-30 sm:h-11 sm:w-11"
                  aria-label="다음 페이지"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </motion.button>
              </div>
              <p className="font-serif text-[clamp(1.1rem,4.5vw,1.375rem)] tracking-[0.2em] text-muted tabular-nums">
                {page + 1} / {pageCount}
              </p>
            </div>
          )}
        </div>
      </section>

      <AnimatePresence>
        {active !== null && (
          <motion.div
            key="lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            onClick={close}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
            role="dialog"
            aria-label="사진 크게 보기"
          >
            {/* Counter */}
            <motion.p
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.15 }}
              className="absolute left-1/2 top-5 -translate-x-1/2 font-serif text-[15px] tracking-[0.25em] text-white/85 tabular-nums drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] sm:top-6 sm:text-base"
            >
              {active + 1} / {total}
            </motion.p>

            {/* Close — minimal X with hover ring */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              whileHover={{ scale: 1.08, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                close();
              }}
              className="group absolute right-3 top-3 z-10 grid h-11 w-11 place-items-center rounded-full border border-white/25 bg-white/[0.06] text-white shadow-[0_4px_14px_rgba(0,0,0,0.3)] transition-colors hover:border-white/55 hover:bg-white/15 sm:right-6 sm:top-6 sm:h-12 sm:w-12"
              aria-label="닫기"
              style={{ WebkitTapHighlightColor: "transparent" }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] sm:h-[18px] sm:w-[18px]"
                aria-hidden
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </motion.button>

            {/* Prev — elegant thin chevron with soft glow ring */}
            <motion.button
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              whileHover="hover"
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
              className="group absolute left-2 top-1/2 z-10 grid h-14 w-14 -translate-y-1/2 place-items-center sm:left-6 sm:h-20 sm:w-20"
              aria-label="이전 사진"
              style={{ WebkitTapHighlightColor: "transparent" }}
            >
              {/* Soft circular tap-target — visible on hover, ambient on rest */}
              <motion.span
                aria-hidden
                variants={{
                  rest: { scale: 0.85, opacity: 0.35 },
                  hover: { scale: 1, opacity: 1 },
                }}
                initial="rest"
                animate="rest"
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 rounded-full border border-white/30 bg-white/[0.06] shadow-[0_8px_24px_rgba(0,0,0,0.35)] group-hover:border-white/55 group-hover:bg-white/15"
              />
              {/* Thin chevron — drop-shadow for legibility on any photo */}
              <motion.svg
                variants={{
                  rest: { x: 0 },
                  hover: { x: -3 },
                }}
                initial="rest"
                transition={{ type: "spring", stiffness: 360, damping: 22 }}
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="relative text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)] sm:h-7 sm:w-7"
                aria-hidden
              >
                <path d="m15 5-7 7 7 7" />
              </motion.svg>
            </motion.button>

            {/* Next — mirrored design */}
            <motion.button
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              whileHover="hover"
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              className="group absolute right-2 top-1/2 z-10 grid h-14 w-14 -translate-y-1/2 place-items-center sm:right-6 sm:h-20 sm:w-20"
              aria-label="다음 사진"
              style={{ WebkitTapHighlightColor: "transparent" }}
            >
              <motion.span
                aria-hidden
                variants={{
                  rest: { scale: 0.85, opacity: 0.35 },
                  hover: { scale: 1, opacity: 1 },
                }}
                initial="rest"
                animate="rest"
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 rounded-full border border-white/30 bg-white/[0.06] shadow-[0_8px_24px_rgba(0,0,0,0.35)] group-hover:border-white/55 group-hover:bg-white/15"
              />
              <motion.svg
                variants={{
                  rest: { x: 0 },
                  hover: { x: 3 },
                }}
                initial="rest"
                transition={{ type: "spring", stiffness: 360, damping: 22 }}
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="relative text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)] sm:h-7 sm:w-7"
                aria-hidden
              >
                <path d="m9 5 7 7-7 7" />
              </motion.svg>
            </motion.button>

            {/* Photo (swipe + slide on prev/next) — full viewport */}
            <div
              className="absolute inset-0 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={active}
                  custom={direction}
                  variants={{
                    enter: (d: number) => ({
                      opacity: 0,
                      x: d * 60,
                      scale: 0.96,
                    }),
                    center: { opacity: 1, x: 0, scale: 1 },
                    leave: (d: number) => ({
                      opacity: 0,
                      x: d * -60,
                      scale: 0.96,
                    }),
                  }}
                  initial="enter"
                  animate="center"
                  exit="leave"
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  drag
                  // Lock to whichever axis the finger starts moving on.
                  // Without this the photo wobbles diagonally during a
                  // horizontal swipe (and vice-versa during a close
                  // gesture). With it, the photo glides cleanly along
                  // one axis at a time.
                  dragDirectionLock
                  dragConstraints={{
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0,
                  }}
                  dragElastic={0.22}
                  dragSnapToOrigin
                  onDragEnd={(_, info) => {
                    const { offset, velocity } = info;
                    const swipeX = Math.abs(offset.x) * velocity.x;
                    const swipeY = Math.abs(offset.y) * velocity.y;
                    // With dragDirectionLock, one of these will be ~0,
                    // so the comparison still correctly picks the
                    // user's intent.
                    const verticalDominant =
                      Math.abs(offset.y) > Math.abs(offset.x);

                    // Vertical (up or down) → close. Same threshold either way
                    // because the user's intent is "dismiss this overlay."
                    if (
                      verticalDominant &&
                      (Math.abs(offset.y) > 110 ||
                        Math.abs(swipeY) > 10000)
                    ) {
                      close();
                      return;
                    }

                    // Horizontal → navigate
                    if (offset.x < -80 || swipeX < -10000) goNext();
                    else if (offset.x > 80 || swipeX > 10000) goPrev();
                  }}
                  className="absolute inset-0 flex items-center justify-center px-4 sm:px-12"
                  style={{ touchAction: "none" }}
                >
                  <Image
                    src={weddingData.gallery[active].src}
                    alt={weddingData.gallery[active].alt}
                    fill
                    sizes="100vw"
                    className="object-contain"
                    loading="eager"
                    draggable={false}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <SubpageNav currentHref="/gallery" />
    </main>
  );
}
