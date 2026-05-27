"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { SplitText } from "./SplitText";
import { useStableHeroHeight } from "./useStableHeroHeight";

interface SubpageHeroProps {
  num: string;
  label: string;
  photo: string;
  subtitle?: string;
}

export function SubpageHero({ num, label, photo, subtitle }: SubpageHeroProps) {
  const [loaded, setLoaded] = useState(false);
  // Shared height across all heroes in the session — see
  // useStableHeroHeight for why measuring per-mount caused the
  // number+title overlay to shift between menu navigations.
  const heroHeight = useStableHeroHeight();

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
          className="font-serif text-[clamp(1.4rem,5.5vw,1.875rem)] tracking-[0.2em] text-white/90"
        >
          {num}
        </motion.p>
        <h1 className="mt-4 font-hand text-[clamp(4.5rem,15vw,10rem)] font-medium leading-[0.95] tracking-[-0.03em] sm:mt-6">
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
            className="mt-4 font-serif text-[clamp(1.5rem,5.5vw,1.875rem)] tracking-[0.05em] text-white/85"
          >
            {subtitle}
          </motion.p>
        )}
      </div>
    </section>
  );
}
