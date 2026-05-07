"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { weddingData } from "@/lib/data";

type Phase = "closed" | "opening" | "rising" | "exiting" | "done";

export function EnvelopeIntro() {
  const [phase, setPhase] = useState<Phase>("closed");

  useEffect(() => {
    if (phase === "done") {
      document.documentElement.style.overflow = "";
      return;
    }
    document.documentElement.style.overflow = "hidden";
    window.scrollTo(0, 0);
  }, [phase]);

  useEffect(() => {
    if (phase === "opening") {
      const t = setTimeout(() => setPhase("rising"), 650);
      return () => clearTimeout(t);
    }
    if (phase === "rising") {
      const t = setTimeout(() => setPhase("exiting"), 1100);
      return () => clearTimeout(t);
    }
    if (phase === "exiting") {
      const t = setTimeout(() => setPhase("done"), 600);
      return () => clearTimeout(t);
    }
  }, [phase]);

  const isOpening = phase !== "closed";
  const showCard = phase === "rising" || phase === "exiting";

  return (
    <AnimatePresence>
      {phase !== "done" && (
        <motion.div
          key="envelope-intro"
          initial={{ opacity: 1 }}
          animate={{ opacity: phase === "exiting" ? 0 : 1 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="fixed inset-0 z-[200] grid place-items-center bg-gradient-to-b from-[#f4ede4] to-[#efe4d6]"
        >
          <button
            type="button"
            onClick={() => phase === "closed" && setPhase("opening")}
            disabled={isOpening}
            className="relative h-[220px] w-[300px]"
            aria-label="청첩장 열기"
            style={{ perspective: 1200 }}
          >
            <motion.div
              animate={
                showCard
                  ? { opacity: 0.4, scale: 0.95 }
                  : { opacity: 1, scale: 1 }
              }
              transition={{ duration: 0.5 }}
              className="absolute inset-0"
            >
              <div className="absolute inset-0 rounded-md bg-[#e8d4b8] shadow-xl" />

              <motion.div
                initial={false}
                animate={isOpening ? { rotateX: -180 } : { rotateX: 0 }}
                transition={{ duration: 0.65, ease: [0.5, 0, 0.3, 1] }}
                style={{
                  transformOrigin: "top",
                  transformStyle: "preserve-3d",
                }}
                className="absolute inset-x-0 top-0 h-[120px]"
              >
                <div
                  className="h-full w-full bg-[#d4ba94] shadow-md"
                  style={{
                    clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                    backfaceVisibility: "hidden",
                  }}
                />
                <div
                  className="absolute inset-0 h-full w-full bg-[#dcc4a0]"
                  style={{
                    clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                    transform: "rotateX(180deg)",
                    backfaceVisibility: "hidden",
                  }}
                />
              </motion.div>

              <motion.div
                animate={
                  isOpening ? { opacity: 0, scale: 0.5 } : { opacity: 1, scale: 1 }
                }
                transition={{ duration: 0.3 }}
                className="absolute left-1/2 top-[100px] -translate-x-1/2 -translate-y-1/2"
              >
                <div className="grid h-11 w-11 place-items-center rounded-full bg-[#9a7148] text-sm text-white shadow-md">
                  ♥
                </div>
              </motion.div>
            </motion.div>

            <AnimatePresence>
              {showCard && (
                <motion.div
                  key="card"
                  initial={{ y: 40, opacity: 0, scale: 0.82 }}
                  animate={{ y: -50, opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{
                    duration: 0.8,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
                >
                  <div className="h-[200px] w-[150px] rounded-md bg-white shadow-[0_20px_50px_rgba(0,0,0,0.18)]">
                    <div className="grid h-full place-items-center px-3 text-center">
                      <div>
                        <p className="font-serif text-[8px] tracking-[0.4em] text-accent">
                          WEDDING
                        </p>
                        <div className="mx-auto mt-3 h-px w-6 bg-accent/40" />
                        <p className="mt-4 font-serif text-[13px] text-foreground">
                          {weddingData.groom.name}
                        </p>
                        <p className="my-1 font-serif text-[10px] text-accent">
                          &amp;
                        </p>
                        <p className="font-serif text-[13px] text-foreground">
                          {weddingData.bride.name}
                        </p>
                        <div className="mx-auto mt-4 h-px w-6 bg-accent/40" />
                        <p className="mt-3 font-serif text-[8px] tracking-widest text-muted">
                          2026 . 08 . 29
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </button>

          <AnimatePresence>
            {phase === "closed" && (
              <motion.p
                key="hint"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.4, 1, 0.4] }}
                exit={{ opacity: 0 }}
                transition={{
                  opacity: { duration: 2.2, repeat: Infinity, ease: "easeInOut" },
                }}
                className="absolute bottom-24 left-1/2 -translate-x-1/2 font-serif text-[11px] tracking-[0.4em] text-foreground/60"
              >
                TAP TO OPEN
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
