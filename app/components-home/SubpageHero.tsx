"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { SplitText } from "./SplitText";

interface SubpageHeroProps {
  num: string;
  label: string;
  photo: string;
  subtitle?: string;
}

export function SubpageHero({ num, label, photo, subtitle }: SubpageHeroProps) {
  const [loaded, setLoaded] = useState(false);
  // Pixel-lock the section height on mount. Even with the globals.css
  // svh override, iOS Safari subtly re-measures the viewport while the
  // address bar collapses, which forces `object-cover` on the photo to
  // rescale frame-by-frame — that's what was reading as "the image
  // enlarges while I scroll." Capturing window.innerHeight once and
  // pinning the section to that px value decouples us from the viewport
  // entirely; the photo container is a static box from first paint on.
  const [heroHeight, setHeroHeight] = useState<string>("100svh");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const innerH = window.innerHeight;
    const visualH = window.visualViewport?.height;
    const px = visualH ? Math.min(innerH, visualH) : innerH;
    setHeroHeight(`${px}px`);
  }, []);

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ height: heroHeight }}
    >
      {/* Static photo layer — plain div with CSS opacity transition (NO
          framer-motion). Promoted to its own compositor layer via
          translateZ so scrolling never repaints. Zero transforms /
          filters / blend-modes during scroll — image renders at native
          fixed size and is composited as a static bitmap. */}
      <div
        className="absolute inset-0"
        style={{
          transform: "translateZ(0)",
          opacity: loaded ? 1 : 0,
          transition: "opacity 600ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <Image
          src={photo}
          alt=""
          fill
          sizes="100vw"
          priority
          className="object-cover"
          onLoad={() => setLoaded(true)}
        />
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/65" />

      <div className="absolute inset-0 flex flex-col justify-end px-6 pb-16 text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.5)] sm:px-10 lg:pb-24">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="font-serif text-base tracking-[0.2em] text-white/90 sm:text-lg"
        >
          {num}
        </motion.p>
        <h1 className="mt-4 font-hand text-[clamp(3rem,9vw,7rem)] font-normal leading-[0.95] tracking-[-0.03em] sm:mt-6">
          <SplitText
            text={label}
            variant="rise"
            staggerChildren={0.06}
            delay={0.3}
          />
        </h1>
        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-4 font-serif text-[17px] tracking-[0.05em] text-white/85 sm:text-lg"
          >
            {subtitle}
          </motion.p>
        )}
      </div>
    </section>
  );
}
