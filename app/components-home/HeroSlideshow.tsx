"use client";

import { useCallback, useEffect, useRef, useState, ReactNode } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { weddingData } from "@/lib/data";
import { SplitText } from "./SplitText";

interface Slide {
  src: string;
  render: (key: number) => ReactNode;
}

const SLIDE_MS = 3500;

const SLIDES: Slide[] = [
  {
    src: weddingData.slides[0].src,
    render: (key) => (
      <SplitText
        animationKey={key}
        text="결혼식"
        as="h1"
        variant="rise"
        staggerChildren={0.12}
        delay={0.15}
        className="font-hand text-[clamp(5rem,22vw,17rem)] font-normal leading-none text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.5)]"
      />
    ),
  },
  {
    src: weddingData.slides[1].src,
    render: (key) => (
      <div className="font-hand font-normal leading-[0.95] text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
        <SplitText
          animationKey={`g-${key}`}
          text={weddingData.groom.name}
          as="p"
          variant="blur"
          staggerChildren={0.07}
          delay={0.1}
          className="text-[clamp(3.5rem,12vw,9rem)]"
        />
        <motion.p
          key={`amp-${key}`}
          initial={{ opacity: 0, scale: 0.4, rotate: -45 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{
            duration: 0.85,
            delay: 0.55,
            ease: [0.34, 1.56, 0.64, 1],
          }}
          className="my-3 text-[clamp(2rem,7vw,5rem)] text-white/85 sm:my-5"
        >
          &amp;
        </motion.p>
        <SplitText
          animationKey={`b-${key}`}
          text={weddingData.bride.name}
          as="p"
          variant="blur"
          staggerChildren={0.07}
          delay={0.85}
          className="text-[clamp(3.5rem,12vw,9rem)]"
        />
      </div>
    ),
  },
  {
    src: weddingData.slides[2].src,
    render: (key) => (
      <div className="font-hand font-normal leading-tight text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
        <SplitText
          animationKey={`d1-${key}`}
          text="2026년 08월 29일"
          as="p"
          variant="wave"
          staggerChildren={0.05}
          delay={0.1}
          className="text-[clamp(1.6rem,5.5vw,4rem)]"
        />
        <SplitText
          animationKey={`d2-${key}`}
          text="토요일 낮 12:30"
          as="p"
          variant="wave"
          staggerChildren={0.05}
          delay={0.55}
          className="mt-4 text-[clamp(1.4rem,5vw,3.6rem)] text-white/95 sm:mt-6"
        />
      </div>
    ),
  },
];

export function HeroSlideshow() {
  const [current, setCurrent] = useState(0);
  const pausedRef = useRef(false);

  const goNext = useCallback(() => {
    setCurrent((c) => (c + 1) % SLIDES.length);
  }, []);
  const goPrev = useCallback(() => {
    setCurrent((c) => (c - 1 + SLIDES.length) % SLIDES.length);
  }, []);

  useEffect(() => {
    let id: number | undefined;
    const start = () => {
      if (id != null || pausedRef.current) return;
      id = window.setInterval(() => {
        setCurrent((c) => (c + 1) % SLIDES.length);
      }, SLIDE_MS);
    };
    const stop = () => {
      if (id != null) {
        clearInterval(id);
        id = undefined;
      }
    };
    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };
    start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <section
      className="relative h-screen w-full overflow-hidden"
      aria-label="히어로 슬라이드"
    >
      <AnimatePresence>
        <motion.div
          key={`photo-${current}`}
          initial={{ opacity: 0, scale: 1.0 }}
          animate={{ opacity: 1, scale: 1.04 }}
          exit={{ opacity: 0 }}
          transition={{
            opacity: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
            scale: { duration: SLIDE_MS / 1000 + 1.2, ease: "linear" },
          }}
          className="absolute inset-0"
        >
          <Image
            src={SLIDES[current].src}
            alt=""
            fill
            sizes="100vw"
            priority={current === 0}
            className="object-cover"
          />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/35 to-black/55" />

      {/* Swipe capture layer — covers everything except dot row at bottom */}
      <motion.div
        aria-hidden
        className="absolute inset-x-0 top-0 z-10 bottom-20"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.18}
        dragSnapToOrigin
        onDragEnd={(_, info) => {
          const swipe = Math.abs(info.offset.x) * info.velocity.x;
          if (info.offset.x < -80 || swipe < -10000) goNext();
          else if (info.offset.x > 80 || swipe > 10000) goPrev();
        }}
        style={{ touchAction: "none" }}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={`text-${current}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-none absolute inset-x-0 top-[24vh] z-20 flex justify-center px-8 text-center sm:top-[26vh] sm:px-12"
        >
          <motion.div
            animate={{ y: [0, -8, 0], rotate: [-0.3, 0.3, -0.3] }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {SLIDES[current].render(current)}
          </motion.div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-10 left-1/2 z-20 -translate-x-1/2">
        <div className="flex items-center gap-2.5">
          {SLIDES.map((_, i) => (
            <motion.button
              key={i}
              type="button"
              onClick={() => setCurrent(i)}
              whileHover={{ scale: 1.3 }}
              whileTap={{ scale: 0.85 }}
              transition={{ type: "spring", stiffness: 400, damping: 18 }}
              className={`h-[3px] rounded-full origin-center transition-all duration-500 ${
                i === current ? "w-10 bg-white" : "w-2 bg-white/45"
              }`}
              aria-label={`사진 ${i + 1}로 이동`}
              aria-current={i === current ? "true" : undefined}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
