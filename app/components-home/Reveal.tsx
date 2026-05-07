"use client";

import { motion, Variants } from "framer-motion";
import { ReactNode } from "react";

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] },
  },
};

export function RevealGroup({
  children,
  className,
  amount = 0.25,
  staggerChildren,
  delayChildren,
}: {
  children: ReactNode;
  className?: string;
  amount?: number;
  staggerChildren?: number;
  delayChildren?: number;
}) {
  const variants: Variants =
    staggerChildren !== undefined || delayChildren !== undefined
      ? {
          hidden: {},
          visible: {
            transition: {
              staggerChildren: staggerChildren ?? 0.1,
              delayChildren: delayChildren ?? 0.05,
            },
          },
        }
      : containerVariants;

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount, margin: "-60px" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({
  children,
  className,
  variants,
}: {
  children: ReactNode;
  className?: string;
  variants?: Variants;
}) {
  return (
    <motion.div variants={variants ?? itemVariants} className={className}>
      {children}
    </motion.div>
  );
}
