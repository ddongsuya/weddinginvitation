"use client";

import { useState } from "react";
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

  return (
    <section className="relative h-[80vh] w-full overflow-hidden">
      <motion.div
        initial={false}
        animate={{
          filter: loaded ? "blur(0px)" : "blur(20px)",
          opacity: loaded ? 1 : 0.7,
        }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0"
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
      </motion.div>

      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/65" />

      <div className="absolute inset-0 flex flex-col justify-end px-6 pb-16 text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.5)] sm:px-10 lg:pb-24">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="font-serif text-base text-white/90 sm:text-lg"
        >
          {num}
        </motion.p>
        <h1 className="mt-4 font-serif text-[clamp(3rem,9vw,7rem)] font-normal leading-[0.95] sm:mt-6">
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
            className="mt-4 font-serif text-base text-white/85 sm:text-lg"
          >
            {subtitle}
          </motion.p>
        )}
      </div>
    </section>
  );
}
