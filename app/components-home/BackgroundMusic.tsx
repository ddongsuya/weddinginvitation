"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

export function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const autoTriedRef = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [bottomNavVisible, setBottomNavVisible] = useState(false);
  const pathname = usePathname();

  // FIX(반응성/편의성): 자동재생 트리거에서 scroll 제거.
  // 첫 스크롤에 갑자기 음악이 나오면 놀람 — 명시적 제스처(클릭/터치/
  // 키)에서만 시도. 7 MB 트랙은 128kbps AAC로 재인코딩 권장 (~2 MB).
  useEffect(() => {
    if (typeof window === "undefined") return;

    const tryAutoplay = () => {
      if (autoTriedRef.current) return;
      autoTriedRef.current = true;
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
    window.addEventListener("keydown", tryAutoplay, { once: true });

    return () => {
      window.removeEventListener("click", tryAutoplay);
      window.removeEventListener("touchstart", tryAutoplay);
      window.removeEventListener("keydown", tryAutoplay);
    };
  }, []);

  // Hide the floating music button while near the bottom of the page
  // (unchanged from original — see original comments).
  useEffect(() => {
    if (typeof window === "undefined") return;
    setBottomNavVisible(false);

    const check = () => {
      const doc = document.documentElement;
      const distanceToBottom =
        doc.scrollHeight - (window.scrollY + window.innerHeight);
      setBottomNavVisible(distanceToBottom < 420);
    };

    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check, { passive: true });
    const raf = requestAnimationFrame(check);
    const timer = window.setTimeout(check, 500);

    return () => {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
    };
  }, [pathname]);

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
      <audio ref={audioRef} loop preload="none">
        <source src="/audio/bgm.m4a" type="audio/mp4" />
      </audio>

      <motion.div
        className="pointer-events-none fixed z-30"
        animate={{
          opacity: bottomNavVisible ? 0 : 1,
          y: bottomNavVisible ? 24 : 0,
          scale: bottomNavVisible ? 0.85 : 1,
        }}
        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
        style={{
          bottom:
            "max(1.25rem, calc(env(safe-area-inset-bottom) + 0.5rem))",
          left: "max(1.25rem, calc(env(safe-area-inset-left) + 0.5rem))",
          pointerEvents: bottomNavVisible ? "none" : undefined,
        }}
        aria-hidden={bottomNavVisible}
      >
        <div className="relative">
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
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.92 }}
            transition={{ type: "spring", stiffness: 380, damping: 18 }}
            className="pointer-events-auto relative grid h-12 w-12 place-items-center rounded-full border border-white/20 bg-stone-900/90 text-white shadow-[0_6px_20px_rgba(0,0,0,0.35)] backdrop-saturate-150 sm:h-[52px] sm:w-[52px]"
            aria-label={playing ? "음악 끄기" : "음악 켜기"}
            aria-pressed={playing}
          >
            <AnimatePresence mode="wait" initial={false}>
              {playing ? (
                <motion.svg
                  key="speaker-on"
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.6, opacity: 0 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path
                    d="M11 5L6 9H3a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h3l5 4V5z"
                    fill="currentColor"
                  />
                  <motion.path
                    d="M15.5 8.5a5 5 0 0 1 0 7"
                    animate={{ opacity: [0.55, 1, 0.55] }}
                    transition={{
                      duration: 1.8,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                  <motion.path
                    d="M18.5 5.5a9 9 0 0 1 0 13"
                    animate={{ opacity: [0.3, 0.85, 0.3] }}
                    transition={{
                      duration: 1.8,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.25,
                    }}
                  />
                </motion.svg>
              ) : (
                <motion.svg
                  key="speaker-off"
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.6, opacity: 0 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path
                    d="M11 5L6 9H3a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h3l5 4V5z"
                    fill="currentColor"
                  />
                  <line x1="22" y1="9" x2="16" y2="15" />
                  <line x1="16" y1="9" x2="22" y2="15" />
                </motion.svg>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.div>
    </>
  );
}
