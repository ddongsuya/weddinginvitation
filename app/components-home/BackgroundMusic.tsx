"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [autoTried, setAutoTried] = useState(false);

  // First user interaction (click / touch / scroll / keydown) attempts autoplay
  useEffect(() => {
    if (typeof window === "undefined") return;

    const tryAutoplay = () => {
      if (autoTried) return;
      setAutoTried(true);
      const audio = audioRef.current;
      if (!audio) return;
      audio
        .play()
        .then(() => setPlaying(true))
        .catch(() => {
          /* autoplay blocked — user can toggle manually */
        });
    };

    const opts: AddEventListenerOptions = { once: true, passive: true };
    window.addEventListener("click", tryAutoplay, opts);
    window.addEventListener("touchstart", tryAutoplay, opts);
    window.addEventListener("scroll", tryAutoplay, opts);
    window.addEventListener("keydown", tryAutoplay);

    return () => {
      window.removeEventListener("click", tryAutoplay);
      window.removeEventListener("touchstart", tryAutoplay);
      window.removeEventListener("scroll", tryAutoplay);
      window.removeEventListener("keydown", tryAutoplay);
    };
  }, [autoTried]);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio
        .play()
        .then(() => setPlaying(true))
        .catch(() => {
          /* ignore */
        });
    }
  };

  return (
    <>
      <audio ref={audioRef} loop preload="auto">
        <source src="/audio/bgm.m4a" type="audio/mp4" />
      </audio>

      <div className="pointer-events-none fixed bottom-5 left-5 z-30 sm:bottom-7 sm:left-7">
        <div className="relative">
          {/* Pulsing ring while playing */}
          <AnimatePresence>
            {playing && (
              <motion.span
                key="pulse"
                initial={{ scale: 1, opacity: 0 }}
                animate={{ scale: [1, 1.6, 1], opacity: [0.55, 0, 0.55] }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 2.6,
                  repeat: Infinity,
                  ease: "easeOut",
                }}
                aria-hidden
                className="absolute inset-0 -z-10 rounded-full bg-accent/45"
              />
            )}
          </AnimatePresence>

          <motion.button
            type="button"
            onClick={toggle}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            transition={{ type: "spring", stiffness: 380, damping: 18 }}
            className="pointer-events-auto relative grid h-11 w-11 place-items-center rounded-full border border-white/30 bg-stone-900/60 text-white backdrop-blur-md sm:h-12 sm:w-12"
            aria-label={playing ? "음악 끄기" : "음악 켜기"}
            aria-pressed={playing}
          >
            <AnimatePresence mode="wait" initial={false}>
              {playing ? (
                <motion.svg
                  key="note-on"
                  initial={{ scale: 0.5, opacity: 0, rotate: -20 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  exit={{ scale: 0.5, opacity: 0, rotate: 20 }}
                  transition={{ duration: 0.22 }}
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden
                >
                  <path d="M9 18V6l11-2v12" stroke="currentColor" strokeWidth="0" />
                  <path d="M9 6l11-2v12.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
                  <ellipse cx="6" cy="18" rx="3" ry="2.4" />
                  <ellipse cx="17" cy="16.5" rx="3" ry="2.4" />
                </motion.svg>
              ) : (
                <motion.svg
                  key="note-off"
                  initial={{ scale: 0.5, opacity: 0, rotate: -20 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  exit={{ scale: 0.5, opacity: 0, rotate: 20 }}
                  transition={{ duration: 0.22 }}
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden
                >
                  <path d="M9 6l11-2v12.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" opacity="0.55" />
                  <ellipse cx="6" cy="18" rx="3" ry="2.4" opacity="0.55" />
                  <ellipse cx="17" cy="16.5" rx="3" ry="2.4" opacity="0.55" />
                  <line
                    x1="3"
                    y1="3"
                    x2="22"
                    y2="22"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </motion.svg>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
    </>
  );
}
