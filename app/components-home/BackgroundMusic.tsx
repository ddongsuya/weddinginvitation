"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

export function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const autoTriedRef = useRef(false);
  const [playing, setPlaying] = useState(false);
  // Hide the floating music button whenever the bottom page-nav scrolls
  // into view — otherwise it sits on top of the "이전 · 다음" links.
  const [bottomNavVisible, setBottomNavVisible] = useState(false);
  const pathname = usePathname();

  // First user interaction (click / touch / scroll / keydown) attempts autoplay.
  // Tracked via ref to avoid re-renders + listener re-registration.
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
    window.addEventListener("scroll", tryAutoplay, opts);
    window.addEventListener("keydown", tryAutoplay, { once: true });

    return () => {
      window.removeEventListener("click", tryAutoplay);
      window.removeEventListener("touchstart", tryAutoplay);
      window.removeEventListener("scroll", tryAutoplay);
      window.removeEventListener("keydown", tryAutoplay);
    };
  }, []);

  // Hide the floating music button while the user is near the bottom of
  // the page so it never sits on top of the "이전 · 다음" links inside
  // SubpageNav. Switched from IntersectionObserver to a plain scroll +
  // resize listener because:
  //   - querySelector("[data-bottom-nav]") sometimes fired before the new
  //     route's nav was in the DOM
  //   - IntersectionObserver's batching delayed the fade past where a
  //     fast scroll would already have the prev link on screen
  // Distance-to-bottom is dead simple, runs every scroll frame (passive),
  // and never misses. 420 px of headroom is well above the tallest
  // SubpageNav so the button is fully invisible before the prev link
  // can enter the viewport.
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
    // Re-check once after layout/font/image work settles for the new route.
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
      <audio ref={audioRef} loop preload="auto">
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
                  {/* Speaker body — filled triangle out of a slim base */}
                  <path
                    d="M11 5L6 9H3a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h3l5 4V5z"
                    fill="currentColor"
                  />
                  {/* Two sound-wave arcs, animated to pulse while playing */}
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
                  {/* Same speaker body */}
                  <path
                    d="M11 5L6 9H3a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h3l5 4V5z"
                    fill="currentColor"
                  />
                  {/* X mark to the right — unambiguous "muted" indicator */}
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
