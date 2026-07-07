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

  // Lightbox swipe — the SAME direction-locked, no-drift gesture as the
  // grid, applied to the enlarged photo. The old version used Framer's
  // `drag`, so the photo rubber-banded under the finger and could wobble
  // before snapping back. Now we just read the gesture: a clearly
  // horizontal swipe flips to the prev/next photo (the AnimatePresence
  // slide below provides the motion), a clearly vertical swipe dismisses
  // the overlay. Touch runs through the locked native listeners so the
  // photo never drifts; mouse/pen use the pointer props on the stage.
  const stageRef = useRef<HTMLDivElement | null>(null);
  const lbStart = useRef<{ x: number; y: number; t: number } | null>(null);
  // Set true when a swipe consumes the gesture (navigate/close), so the
  // transparent prev/next tap-zones over the photo don't ALSO fire on the
  // click that can follow a touch/mouse release.
  const lbNavConsumed = useRef(false);

  const applyLightboxGesture = (dx: number, dy: number, dt: number) => {
    if (Math.abs(dx) > Math.abs(dy)) {
      // Horizontal → prev / next
      if (Math.abs(dx) > 60 || (Math.abs(dx) > 30 && dt < 250)) {
        lbNavConsumed.current = true;
        if (dx < 0) goNext();
        else goPrev();
      }
    } else {
      // Vertical (either direction) → dismiss the overlay
      if (Math.abs(dy) > 90 || (Math.abs(dy) > 45 && dt < 260)) {
        lbNavConsumed.current = true;
        close();
      }
    }
  };

  // Tap on a photo half-overlay → prev/next, unless a swipe already
  // consumed this gesture (then just clear the flag and ignore the click).
  const onZoneTap = (dir: 1 | -1) => {
    if (lbNavConsumed.current) {
      lbNavConsumed.current = false;
      return;
    }
    if (dir === 1) goNext();
    else goPrev();
  };

  const onStagePointerDown = (e: React.PointerEvent) => {
    lbNavConsumed.current = false;
    if (e.pointerType === "touch") return; // touch goes through the locked path
    lbStart.current = { x: e.clientX, y: e.clientY, t: e.timeStamp };
  };
  const onStagePointerUp = (e: React.PointerEvent) => {
    if (e.pointerType === "touch") return;
    const s = lbStart.current;
    lbStart.current = null;
    if (!s) return;
    applyLightboxGesture(e.clientX - s.x, e.clientY - s.y, e.timeStamp - s.t);
  };

  useEffect(() => {
    if (!lightboxOpen) return;
    const el = stageRef.current;
    if (!el) return;

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
      lbNavConsumed.current = false;
    };
    const onMove = (e: TouchEvent) => {
      if (!tracking || e.touches.length !== 1) return;
      const t = e.touches[0];
      const dx = t.clientX - sx;
      const dy = t.clientY - sy;
      if (axis === null) {
        if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
        axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      }
      // Pin the photo — nothing should drift while swiping.
      e.preventDefault();
    };
    const onEnd = (e: TouchEvent) => {
      if (!tracking) return;
      tracking = false;
      if (axis === null) return;
      const t = e.changedTouches[0];
      applyLightboxGesture(t.clientX - sx, t.clientY - sy, e.timeStamp - st);
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
    // goNext / goPrev / close are behaviorally stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightboxOpen]);

  // Bottom filmstrip — keep the active thumbnail centered as the photo
  // changes. The FIRST centering after open jumps instantly (behavior
  // "auto"): a smooth scroll dispatched at mount is ignored before the
  // strip has laid out, so it's deferred to rAF and made instant once;
  // subsequent photo changes glide ("smooth").
  const stripRef = useRef<HTMLDivElement | null>(null);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const stripFirst = useRef(true);

  useEffect(() => {
    if (!lightboxOpen || active === null) {
      stripFirst.current = true;
      return;
    }
    const strip = stripRef.current;
    const thumb = thumbRefs.current[active];
    if (!strip || !thumb) return;
    const behavior: ScrollBehavior = stripFirst.current ? "auto" : "smooth";
    stripFirst.current = false;
    const id = requestAnimationFrame(() => {
      const left =
        thumb.offsetLeft - strip.clientWidth / 2 + thumb.offsetWidth / 2;
      strip.scrollTo({ left, behavior });
    });
    return () => cancelAnimationFrame(id);
  }, [active, lightboxOpen]);

  const jumpTo = (i: number) => {
    setDirection(i >= (active ?? 0) ? 1 : -1);
    setActive(i);
  };

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
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-50 flex flex-col"
            style={{ background: "#0c0a09" }}
            role="dialog"
            aria-label="사진 크게 보기"
          >
            {/* Top bar — counter (left) + bare close X (right) */}
            <div
              className="flex shrink-0 items-center justify-between"
              style={{ padding: "18px 10px 14px 24px" }}
            >
              <span
                className="font-serif tabular-nums"
                style={{
                  fontSize: "14px",
                  letterSpacing: "0.3em",
                  color: "rgba(255,255,255,0.6)",
                }}
              >
                {active + 1} / {total}
              </span>
              <button
                type="button"
                onClick={close}
                aria-label="닫기"
                className="grid h-11 w-11 place-items-center"
                style={{ WebkitTapHighlightColor: "transparent" }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="rgba(255,255,255,0.8)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>

            {/* Photo area — flex:1. Swipe runs through the direction-locked
                native listeners on this stage; touch-action:none keeps
                pinch-zoom off (사진 확대 방지) and lets the swipe
                preventDefault take. Prev/next are transparent tap-halves
                layered over the photo (no visible buttons on the image). */}
            <div
              ref={stageRef}
              className="relative min-h-0 flex-1 overflow-hidden"
              onPointerDown={onStagePointerDown}
              onPointerUp={onStagePointerUp}
              onPointerCancel={() => {
                lbStart.current = null;
              }}
              style={{ touchAction: "none" }}
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
                  className="absolute inset-0 flex items-center justify-center px-4 sm:px-12"
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

              {/* Transparent nav tap-zones — left half = prev, right half =
                  next. Layered over the photo; touch-action:none so the
                  stage's swipe listeners still fire and pinch-zoom stays off.
                  A swipe sets lbNavConsumed so the trailing click is ignored. */}
              <button
                type="button"
                onClick={() => onZoneTap(-1)}
                aria-label="이전 사진"
                className="absolute inset-y-0 left-0 w-1/2"
                style={{
                  touchAction: "none",
                  WebkitTapHighlightColor: "transparent",
                }}
              />
              <button
                type="button"
                onClick={() => onZoneTap(1)}
                aria-label="다음 사진"
                className="absolute inset-y-0 right-0 w-1/2"
                style={{
                  touchAction: "none",
                  WebkitTapHighlightColor: "transparent",
                }}
              />
            </div>

            {/* Bottom filmstrip — horizontal scroll, active thumbnail kept
                centered (see effect above). Scrollbar hidden. */}
            <div
              ref={stripRef}
              className="relative flex shrink-0 items-center overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              style={{ gap: "6px", padding: "16px 24px 22px" }}
            >
              {weddingData.gallery.map((photo, i) => {
                const activeThumb = i === active;
                return (
                  <button
                    key={i}
                    type="button"
                    ref={(el) => {
                      thumbRefs.current[i] = el;
                    }}
                    onClick={() => jumpTo(i)}
                    aria-label={`${i + 1}번째 사진`}
                    aria-current={activeThumb ? "true" : undefined}
                    className="relative shrink-0 overflow-hidden"
                    style={{
                      height: "56px",
                      width: activeThumb ? "42px" : "34px",
                      opacity: activeThumb ? 1 : 0.35,
                      borderRadius: "6px",
                      transition: "width 0.3s ease, opacity 0.3s ease",
                      WebkitTapHighlightColor: "transparent",
                    }}
                  >
                    <Image
                      src={photo.src}
                      alt=""
                      fill
                      sizes="48px"
                      className="object-cover"
                      draggable={false}
                    />
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <SubpageNav currentHref="/gallery" />
    </main>
  );
}
