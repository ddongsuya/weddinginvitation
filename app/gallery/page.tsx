"use client";

import { useEffect, useState } from "react";
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

  // Keyboard navigation when lightbox is open
  useEffect(() => {
    if (active === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext();
      else if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  // Lock body scroll while lightbox open
  useEffect(() => {
    if (active === null) return;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prev;
    };
  }, [active]);

  return (
    <main>
      <SubpageHero
        num="04"
        label="갤러리"
        photo={weddingData.menuHeroes.gallery}
      />

      <section className="px-6 py-20 sm:px-10 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h2 className="font-serif text-[clamp(1.8rem,5vw,3rem)] font-normal text-foreground">
              우리의 순간들
            </h2>
            <p className="mt-4 font-sans text-sm text-muted sm:text-base">
              총 {total}장
            </p>
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={page}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="mt-12 grid grid-cols-3 gap-2 sm:mt-16 sm:gap-4"
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
                      setDirection(1);
                      setActive(absoluteIndex);
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className="group relative aspect-[3/4] overflow-hidden bg-stone-100"
                    aria-label={`${absoluteIndex + 1}번째 사진 보기`}
                  >
                    <Image
                      src={photo.src}
                      alt={photo.alt}
                      fill
                      sizes="33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      loading={i < 6 ? "eager" : "lazy"}
                    />
                  </motion.button>
                );
              })}
            </motion.div>
          </AnimatePresence>

          {pageCount > 1 && (
            <div className="mt-12 flex flex-col items-center gap-4 sm:mt-16">
              <div className="flex items-center gap-3">
                <motion.button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
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
                      onClick={() => setPage(i)}
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
                  onClick={() =>
                    setPage((p) => Math.min(pageCount - 1, p + 1))
                  }
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
              <p className="font-serif text-sm text-muted">
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
              className="absolute left-1/2 top-5 -translate-x-1/2 font-serif text-sm tracking-wider text-white/70 sm:top-6 sm:text-base"
            >
              {active + 1} / {total}
            </motion.p>

            {/* Close */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={(e) => {
                e.stopPropagation();
                close();
              }}
              className="absolute right-4 top-4 z-10 rounded-full bg-white/10 px-4 py-2 text-xs text-white backdrop-blur sm:right-6 sm:top-6 sm:text-sm"
              aria-label="닫기"
            >
              닫기
            </motion.button>

            {/* Prev */}
            <motion.button
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.1, x: -3 }}
              whileTap={{ scale: 0.92 }}
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
              className="absolute left-3 top-1/2 z-10 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/20 sm:left-6 sm:h-14 sm:w-14"
              aria-label="이전 사진"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </motion.button>

            {/* Next */}
            <motion.button
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.1, x: 3 }}
              whileTap={{ scale: 0.92 }}
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              className="absolute right-3 top-1/2 z-10 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/20 sm:right-6 sm:h-14 sm:w-14"
              aria-label="다음 사진"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </motion.button>

            {/* Photo (slides on prev/next) */}
            <div
              className="relative h-[85vh] w-full max-w-4xl overflow-hidden"
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
                  className="absolute inset-0"
                >
                  <Image
                    src={weddingData.gallery[active].src}
                    alt={weddingData.gallery[active].alt}
                    fill
                    sizes="100vw"
                    className="object-contain"
                    loading="eager"
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
