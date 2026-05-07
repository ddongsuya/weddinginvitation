"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { motion, useTransform, MotionValue, useMotionValue } from "framer-motion";
import { weddingData } from "@/lib/data";

export function OpeningCinematic() {
  const containerRef = useRef<HTMLDivElement>(null);
  const progress = useMotionValue(0);

  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    let bounds = { top: 0, height: 0 };
    const measure = () => {
      const rect = el.getBoundingClientRect();
      bounds = {
        top: rect.top + window.scrollY,
        height: rect.height,
      };
    };
    const update = () => {
      const span = Math.max(1, bounds.height - window.innerHeight);
      const p = Math.min(
        1,
        Math.max(0, (window.scrollY - bounds.top) / span)
      );
      progress.set(p);
    };
    measure();
    update();
    const ro = new ResizeObserver(() => {
      measure();
      update();
    });
    ro.observe(el);
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", measure);
    };
  }, [progress]);

  return (
    <section
      ref={containerRef}
      className="relative h-[300vh] bg-background"
      aria-label="오프닝"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <Scene1 progress={progress} />
        <Scene2 progress={progress} />
        <Scene3 progress={progress} />
        <ScrollHint progress={progress} />
      </div>
    </section>
  );
}

function Scene1({ progress }: { progress: MotionValue<number> }) {
  const opacity = useTransform(progress, [0, 0.22, 0.32], [1, 1, 0]);
  const scale = useTransform(progress, [0, 0.32], [1, 1.08]);
  const titleY = useTransform(progress, [0, 0.32], [0, -30]);

  return (
    <motion.div
      style={{ opacity }}
      className="absolute inset-0 flex items-center justify-center"
    >
      <motion.div
        style={{ scale }}
        className="absolute inset-0"
      >
        <Image
          src={weddingData.photos.main}
          alt="메인 웨딩 사진"
          fill
          sizes="(max-width: 480px) 100vw, 480px"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/30 to-black/60" />
      </motion.div>
      <motion.div
        style={{ y: titleY }}
        className="relative z-10 px-8 text-center text-white"
      >
        <p className="font-serif text-[11px] tracking-[0.4em] drop-shadow">
          WEDDING INVITATION
        </p>
        <div className="mt-10 font-serif text-3xl leading-tight drop-shadow-md">
          <div>{weddingData.groom.name}</div>
          <div className="my-3">&</div>
          <div>{weddingData.bride.name}</div>
        </div>
        <p className="mt-12 font-serif text-xs tracking-[0.3em] text-white/80 drop-shadow">
          2026 . 08 . 29 . SAT
        </p>
      </motion.div>
    </motion.div>
  );
}

function Scene2({ progress }: { progress: MotionValue<number> }) {
  const opacity = useTransform(
    progress,
    [0.32, 0.4, 0.6, 0.66],
    [0, 1, 1, 0]
  );
  const groomX = useTransform(progress, [0.32, 0.5], [-40, 0]);
  const brideX = useTransform(progress, [0.32, 0.5], [40, 0]);

  return (
    <motion.div
      style={{ opacity }}
      className="absolute inset-0 flex items-center justify-center bg-background"
    >
      <div className="w-full px-8">
        <p className="text-center font-serif text-[11px] tracking-[0.4em] text-accent">
          GROOM &amp; BRIDE
        </p>
        <div className="mt-12 grid grid-cols-2 gap-6">
          <motion.div style={{ x: groomX }} className="text-center">
            <div className="relative mx-auto mb-4 h-32 w-32 overflow-hidden rounded-full ring-4 ring-white shadow-lg">
              <Image
                src={weddingData.photos.groom}
                alt={`${weddingData.groom.name} 신랑`}
                fill
                sizes="128px"
                className="object-cover"
              />
            </div>
            <p className="font-serif text-[10px] tracking-[0.3em] text-muted">
              GROOM
            </p>
            <p className="mt-2 font-serif text-xl text-foreground">
              {weddingData.groom.name}
            </p>
            <p className="mt-3 px-2 text-[11px] leading-relaxed text-muted text-pretty">
              {weddingData.groom.intro}
            </p>
          </motion.div>
          <motion.div style={{ x: brideX }} className="text-center">
            <div className="relative mx-auto mb-4 h-32 w-32 overflow-hidden rounded-full ring-4 ring-white shadow-lg">
              <Image
                src={weddingData.photos.bride}
                alt={`${weddingData.bride.name} 신부`}
                fill
                sizes="128px"
                className="object-cover"
              />
            </div>
            <p className="font-serif text-[10px] tracking-[0.3em] text-muted">
              BRIDE
            </p>
            <p className="mt-2 font-serif text-xl text-foreground">
              {weddingData.bride.name}
            </p>
            <p className="mt-3 px-2 text-[11px] leading-relaxed text-muted text-pretty">
              {weddingData.bride.intro}
            </p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

function Scene3({ progress }: { progress: MotionValue<number> }) {
  const opacity = useTransform(progress, [0.66, 0.74, 1], [0, 1, 1]);
  const dayScale = useTransform(progress, [0.66, 0.85], [0.85, 1]);
  const labelOpacity = useTransform(progress, [0.78, 0.92], [0, 1]);

  return (
    <motion.div
      style={{ opacity }}
      className="absolute inset-0 flex items-center justify-center"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-[#fbf3ec] via-background to-[#fbf3ec]" />
      <div className="relative z-10 w-full px-8 text-center">
        <p className="font-serif text-[11px] tracking-[0.4em] text-accent">
          THE DATE
        </p>
        <motion.div
          style={{ scale: dayScale }}
          className="mt-10 font-serif"
        >
          <div className="text-sm tracking-[0.4em] text-muted">2026 . AUG</div>
          <div className="mt-4 text-[120px] leading-none text-foreground">
            29
          </div>
          <div className="mt-4 text-sm tracking-[0.4em] text-muted">
            SATURDAY
          </div>
        </motion.div>
        <motion.p
          style={{ opacity: labelOpacity }}
          className="mt-10 font-serif text-base text-foreground"
        >
          오후 12시 30분
        </motion.p>
        <motion.p
          style={{ opacity: labelOpacity }}
          className="mt-2 text-xs text-muted"
        >
          {weddingData.venue.name} {weddingData.venue.hall}
        </motion.p>
      </div>
    </motion.div>
  );
}

function ScrollHint({ progress }: { progress: MotionValue<number> }) {
  const opacity = useTransform(progress, [0, 0.05, 0.95, 1], [1, 1, 0, 0]);
  return (
    <motion.div
      style={{ opacity }}
      className="pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2"
      aria-hidden
    >
      <div className="flex flex-col items-center gap-2">
        <span className="font-serif text-[10px] tracking-[0.3em] text-muted">
          SCROLL
        </span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          className="h-6 w-px bg-muted/60"
        />
      </div>
    </motion.div>
  );
}
