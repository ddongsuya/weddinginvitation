"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [pressed, setPressed] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { damping: 28, stiffness: 380, mass: 0.4 });
  const sy = useSpring(y, { damping: 28, stiffness: 380, mass: 0.4 });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!mq.matches) return;
    setEnabled(true);

    const onMove = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    const isInteractive = (el: EventTarget | null) =>
      el instanceof HTMLElement &&
      !!el.closest('button, a, [role="button"], input, textarea, select, label');
    const onOver = (e: MouseEvent) => {
      if (isInteractive(e.target)) setHovering(true);
    };
    const onOut = (e: MouseEvent) => {
      if (isInteractive(e.target)) setHovering(false);
    };
    const onDown = () => setPressed(true);
    const onUp = () => setPressed(false);

    window.addEventListener("mousemove", onMove);
    document.body.addEventListener("mouseover", onOver);
    document.body.addEventListener("mouseout", onOut);
    document.body.addEventListener("mousedown", onDown);
    document.body.addEventListener("mouseup", onUp);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.body.removeEventListener("mouseover", onOver);
      document.body.removeEventListener("mouseout", onOut);
      document.body.removeEventListener("mousedown", onDown);
      document.body.removeEventListener("mouseup", onUp);
    };
  }, [x, y]);

  if (!enabled) return null;

  const dotScale = pressed ? 0.6 : hovering ? 0.4 : 1;
  const ringScale = pressed ? 0.8 : hovering ? 2.2 : 1;
  const ringOpacity = hovering ? 0.55 : 0.2;

  return (
    <>
      <motion.div
        aria-hidden
        style={{ x: sx, y: sy }}
        className="pointer-events-none fixed left-0 top-0 z-[1000] mix-blend-difference"
      >
        <motion.div
          animate={{ scale: ringScale, opacity: ringOpacity }}
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
          className="h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white"
        />
      </motion.div>
      <motion.div
        aria-hidden
        style={{ x, y }}
        className="pointer-events-none fixed left-0 top-0 z-[1001] mix-blend-difference"
      >
        <motion.div
          animate={{ scale: dotScale }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
        />
      </motion.div>
    </>
  );
}
