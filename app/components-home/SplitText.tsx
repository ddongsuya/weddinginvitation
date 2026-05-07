"use client";

import { motion, Variants } from "framer-motion";
import { ReactNode } from "react";

type Variant = "rise" | "fade" | "scale" | "blur" | "wave";

interface SplitTextProps {
  text: string;
  className?: string;
  variant?: Variant;
  staggerChildren?: number;
  delay?: number;
  splitBy?: "char" | "word";
  // animationKey forces re-mount + re-animate when value changes
  animationKey?: string | number;
  as?: keyof Pick<HTMLElementTagNameMap, "h1" | "h2" | "p" | "span" | "div">;
}

const variants: Record<Variant, Variants> = {
  rise: {
    hidden: { y: "110%", opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] },
    },
  },
  fade: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
    },
  },
  scale: {
    hidden: { opacity: 0, scale: 0.4 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.75, ease: [0.34, 1.56, 0.64, 1] },
    },
  },
  blur: {
    hidden: { opacity: 0, filter: "blur(14px)" },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      transition: { duration: 0.95, ease: [0.22, 1, 0.36, 1] },
    },
  },
  wave: {
    hidden: { y: 16, opacity: 0, scale: 0.96 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
    },
  },
};

export function SplitText({
  text,
  className,
  variant = "rise",
  staggerChildren = 0.045,
  delay = 0,
  splitBy = "char",
  animationKey,
  as = "span",
}: SplitTextProps) {
  const tokens =
    splitBy === "word" ? text.split(/(\s+)/) : Array.from(text);

  const container: Variants = {
    hidden: {},
    visible: {
      transition: { staggerChildren, delayChildren: delay },
    },
  };

  const child = variants[variant];
  const Tag = motion[as] as typeof motion.span;

  return (
    <Tag
      key={animationKey}
      className={className}
      variants={container}
      initial="hidden"
      animate="visible"
      aria-label={text}
    >
      {tokens.map((token, i) =>
        token === " " || /^\s+$/.test(token) ? (
          <span key={i} aria-hidden>
            {" "}
          </span>
        ) : (
          <SplitChar key={i} variants={child} variant={variant}>
            {token}
          </SplitChar>
        )
      )}
    </Tag>
  );
}

function SplitChar({
  children,
  variants,
  variant,
}: {
  children: ReactNode;
  variants: Variants;
  variant: Variant;
}) {
  const needsClip = variant === "rise" || variant === "wave";
  return (
    <span
      aria-hidden
      style={{
        display: "inline-block",
        overflow: needsClip ? "hidden" : undefined,
        verticalAlign: "top",
        lineHeight: 1,
      }}
    >
      <motion.span
        variants={variants}
        style={{ display: "inline-block", willChange: "transform, opacity" }}
      >
        {children}
      </motion.span>
    </span>
  );
}
