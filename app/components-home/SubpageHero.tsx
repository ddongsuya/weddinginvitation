"use client";

import Image from "next/image";
import { motion } from "framer-motion";

interface SubpageHeroProps {
  num: string;
  label: string;
  photo: string;
  subtitle?: string;
}

export function SubpageHero({ num, label, photo, subtitle }: SubpageHeroProps) {
  return (
    <section className="relative h-[80vh] w-full overflow-hidden">
      <motion.div
        initial={{ scale: 1.06 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0"
      >
        <Image
          src={photo}
          alt=""
          fill
          sizes="100vw"
          priority
          className="object-cover"
        />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/65" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: "easeOut", delay: 0.2 }}
        className="absolute inset-0 flex flex-col justify-end px-6 pb-16 text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.5)] sm:px-10 lg:pb-24"
      >
        <p className="font-serif text-base text-white/90 sm:text-lg">
          {num}
        </p>
        <h1 className="mt-4 font-serif text-[clamp(3rem,9vw,7rem)] font-light leading-[0.95] sm:mt-6">
          {label}
        </h1>
        {subtitle && (
          <p className="mt-4 font-serif text-base text-white/85 sm:text-lg">
            {subtitle}
          </p>
        )}
      </motion.div>
    </section>
  );
}
