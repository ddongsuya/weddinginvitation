"use client";

import { motion, useScroll } from "framer-motion";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed right-0 top-0 z-30 h-full w-[2px] origin-top bg-accent/45"
      style={{ scaleY: scrollYProgress, transform: "translateZ(0)" }}
    />
  );
}
