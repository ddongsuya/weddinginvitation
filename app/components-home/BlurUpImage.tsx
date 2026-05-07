"use client";

import { useState } from "react";
import Image, { ImageProps } from "next/image";
import { motion } from "framer-motion";

interface Props extends Omit<ImageProps, "onLoad" | "placeholder" | "blurDataURL"> {
  containerClassName?: string;
}

export function BlurUpImage({ containerClassName, alt, ...props }: Props) {
  const [loaded, setLoaded] = useState(false);
  return (
    <motion.div
      initial={false}
      animate={{
        filter: loaded ? "blur(0px)" : "blur(18px)",
        scale: loaded ? 1 : 1.06,
        opacity: loaded ? 1 : 0.88,
      }}
      transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
      className={`overflow-hidden ${containerClassName ?? ""}`.trim()}
      style={{ willChange: "filter, transform" }}
    >
      <Image
        {...props}
        alt={alt}
        onLoad={() => setLoaded(true)}
        onLoadingComplete={() => setLoaded(true)}
      />
    </motion.div>
  );
}
