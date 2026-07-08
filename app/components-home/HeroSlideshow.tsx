"use client";

import { useCallback, useEffect, useRef, useState, ReactNode } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { weddingData } from "@/lib/data";
import { SplitText } from "./SplitText";
import { useStableHeroHeight } from "./useStableHeroHeight";

interface Slide {
  src: string;
  render: (key: number) => ReactNode;
}

// FIX(페이싱): 3500 → 5500ms. SplitText 등장이 끝난 뒤(마지막 딜레이
// 0.85s + stagger) 사진과 텍스트를 감상할 시간을 준 다음 전환.
const SLIDE_MS = 5500;

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
        className="font-hand text-[clamp(7.5rem,37vw,27rem)] font-medium leading-none text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.5)]"
      />
    ),
  },
  {
    src: weddingData.slides[1].src,
    render: (key) => (
      <div className="flex items-baseline justify-center gap-1 font-hand font-medium leading-[1] text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.5)] sm:gap-3">
        <SplitText
          animationKey={`g-${key}`}
          text={weddingData.groom.name}
          as="span"
          variant="blur"
          staggerChildren={0.07}
          delay={0.1}
          className="text-[clamp(3.5rem,15vw,12rem)]"
        />
        <motion.span
          key={`amp-${key}`}
          initial={{ opacity: 0, scale: 0.4, rotate: -45 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{
            duration: 0.85,
            delay: 0.55,
            ease: [0.34, 1.56, 0.64, 1],
          }}
          className="inline-block text-[clamp(2rem,8.5vw,6.5rem)] text-white/85"
        >
          &amp;
        </motion.span>
        <SplitText
          animationKey={`b-${key}`}
          text={weddingData.bride.name}
          as="span"
          variant="blur"
          staggerChildren={0.07}
          delay={0.85}
          className="text-[clamp(3.5rem,15vw,12rem)]"
        />
      </div>
    ),
  },
  {
    src: weddingData.slides[2].src,
    render: (key) => (
      <div className="font-hand font-medium leading-[0.95] text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
        <SplitText
          animationKey={`d1-${key}`}
          text="8월 29일"
          as="p"
          variant="wave"
          staggerChildren={0.06}
          delay={0.1}
          className="text-[clamp(4rem,18vw,13rem)]"
        />
        <SplitText
          animationKey={`d2-${key}`}
          text="낮 12:30"
          as="p"
          variant="wave"
          staggerChildren={0.06}
          delay={0.55}
          className="mt-3 text-[clamp(4rem,18vw,13rem)] text-white/95 sm:mt-5"
        />
      </div>
    ),
  },
];

export function HeroSlideshow() {
  const [current, setCurrent] = useState(0);
  const pausedRef = useRef(false);
  const heroHeight = useStableHeroHeight();

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
      className="relative w-full overflow-hidden"
      style={{ height: heroHeight }}
      aria-label="히어로 슬라이드"
    >
      <AnimatePresence>
        <motion.div
          key={`photo-${current}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
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
        dragDirectionLock
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

      {/* FIX(상시 모션): 텍스트를 감싸던 무한 둥둥(y±8 + rotate±0.3°)
          motion.div 제거. SplitText 등장 애니메이션은 그대로 유지 —
          등장이 끝나면 텍스트가 정지해 사진에 시선이 머물도록. */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`text-${current}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-none absolute inset-x-0 top-[24vh] z-20 flex justify-center px-1 text-center sm:top-[26vh] sm:px-6"
        >
          <div>{SLIDES[current].render(current)}</div>
        </motion.div>
      </AnimatePresence>

      {/* FIX(터치 타겟): 도트의 보이는 모양(3px 바)은 그대로, 버튼에
          투명 패딩을 둘러 실제 터치 영역을 ~44px로 확보. */}
      <div className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2">
        <div className="flex items-center">
          {SLIDES.map((_, i) => (
            <motion.button
              key={i}
              type="button"
              onClick={() => setCurrent(i)}
              whileHover={{ scale: 1.3 }}
              whileTap={{ scale: 0.85 }}
              transition={{ type: "spring", stiffness: 400, damping: 18 }}
              className="group px-[5px] py-5"
              aria-label={`사진 ${i + 1}로 이동`}
              aria-current={i === current ? "true" : undefined}
            >
              <span
                className={`block h-[3px] rounded-full origin-center transition-all duration-500 ${
                  i === current ? "w-10 bg-white" : "w-2 bg-white/45"
                }`}
              />
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}
