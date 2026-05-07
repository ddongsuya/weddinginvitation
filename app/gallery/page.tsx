"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { SubpageHero } from "../components-home/SubpageHero";
import { SubpageNav } from "../components-home/SubpageNav";
import { weddingData } from "@/lib/data";

const PAGE_SIZE = 12;

export default function GalleryPage() {
  const [active, setActive] = useState<number | null>(null);
  const [page, setPage] = useState(0);

  const total = weddingData.gallery.length;
  const pageCount = Math.ceil(total / PAGE_SIZE);
  const start = page * PAGE_SIZE;
  const visible = weddingData.gallery.slice(start, start + PAGE_SIZE);

  return (
    <main>
      <SubpageHero
        num="04"
        label="갤러리"
        photo={weddingData.gallery[24].src}
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
            <h2 className="font-serif text-[clamp(1.8rem,5vw,3rem)] font-light text-foreground">
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
              className="mt-12 grid grid-cols-3 gap-2 sm:mt-16 sm:grid-cols-4 sm:gap-4 lg:grid-cols-4"
            >
              {visible.map((photo, i) => {
                const absoluteIndex = start + i;
                return (
                  <motion.button
                    key={absoluteIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.04 }}
                    onClick={() => setActive(absoluteIndex)}
                    className="group relative aspect-[3/4] overflow-hidden bg-stone-100"
                    aria-label={`${absoluteIndex + 1}번째 사진 보기`}
                  >
                    <Image
                      src={photo.src}
                      alt={photo.alt}
                      fill
                      sizes="(max-width: 640px) 33vw, 25vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      loading={i < 8 ? "eager" : "lazy"}
                    />
                  </motion.button>
                );
              })}
            </motion.div>
          </AnimatePresence>

          {pageCount > 1 && (
            <div className="mt-12 flex flex-col items-center gap-4 sm:mt-16">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="grid h-10 w-10 place-items-center rounded-full border border-stone-200 bg-white text-foreground transition-colors hover:bg-stone-50 disabled:opacity-30 sm:h-11 sm:w-11"
                  aria-label="이전 페이지"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                </button>
                <div className="flex items-center gap-2">
                  {Array.from({ length: pageCount }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i)}
                      className={`h-1.5 rounded-full transition-all ${
                        i === page ? "w-8 bg-accent" : "w-1.5 bg-stone-300"
                      }`}
                      aria-label={`${i + 1}페이지로 이동`}
                    />
                  ))}
                </div>
                <button
                  onClick={() =>
                    setPage((p) => Math.min(pageCount - 1, p + 1))
                  }
                  disabled={page === pageCount - 1}
                  className="grid h-10 w-10 place-items-center rounded-full border border-stone-200 bg-white text-foreground transition-colors hover:bg-stone-50 disabled:opacity-30 sm:h-11 sm:w-11"
                  aria-label="다음 페이지"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </button>
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActive(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
            role="dialog"
            aria-label="사진 크게 보기"
          >
            <button
              onClick={() => setActive(null)}
              className="absolute right-4 top-4 z-10 rounded-full bg-white/10 px-3 py-1 text-xs text-white sm:right-6 sm:top-6"
              aria-label="닫기"
            >
              닫기
            </button>
            <motion.div
              key={active}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative h-[85vh] w-full max-w-4xl"
            >
              <Image
                src={weddingData.gallery[active].src}
                alt={weddingData.gallery[active].alt}
                fill
                sizes="100vw"
                className="object-contain"
                priority
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <SubpageNav currentHref="/gallery" />
    </main>
  );
}
