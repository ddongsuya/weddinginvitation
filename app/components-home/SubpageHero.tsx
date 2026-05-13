"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { SplitText } from "./SplitText";

interface SubpageHeroProps {
  num: string;
  label: string;
  photo: string;
  subtitle?: string;
}

export function SubpageHero({ num, label, photo, subtitle }: SubpageHeroProps) {
  const ref = useRef<HTMLElement>(null);
  const [loaded, setLoaded] = useState(false);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const photoY = useTransform(scrollYProgress, [0, 1], ["0%", "32%"]);
  const photoScale = useTransform(scrollYProgress, [0, 1], [1.08, 1.22]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 1], [0.55, 0.85]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative h-[80vh] w-full overflow-hidden"
    >
      <motion.div
        style={{ y: photoY, scale: photoScale }}
        className="absolute inset-0"
      >
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
      </motion.div>
      <motion.div
        style={{ opacity: overlayOpacity }}
        className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/65"
      />

      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="absolute inset-0 flex flex-col justify-end px-6 pb-16 text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.5)] sm:px-10 lg:pb-24"
      >
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
      </motion.div>
    </section>
  );
}
