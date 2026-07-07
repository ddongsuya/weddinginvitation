"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MenuOverlay } from "./MenuOverlay";
import { ScrollProgress } from "./ScrollProgress";
import { CustomCursor } from "./CustomCursor";
import { BackgroundMusic } from "./BackgroundMusic";

const GUIDE_KEY = "menu-guide-seen";

export function NavShell({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  // FIX(가독성): 3b 텍스트 내비는 밝은 본문 위에서 안 보임 —
  // 히어로(≈100svh)를 지나면 잉크색으로 전환.
  const [pastHero, setPastHero] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => {
      setPastHero(window.scrollY > window.innerHeight * 0.85);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  useEffect(() => {
    if (pathname !== "/") {
      setShowGuide(false);
      return;
    }
    try {
      if (!localStorage.getItem(GUIDE_KEY)) setShowGuide(true);
    } catch {
      /* storage unavailable — skip the guide */
    }
  }, [pathname]);

  const dismissGuide = () => {
    setShowGuide(false);
    try {
      localStorage.setItem(GUIDE_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  const openMenu = () => {
    dismissGuide();
    setMenuOpen(true);
  };

  // /calendar is an interstitial — render bare (see original comment).
  if (pathname === "/calendar") {
    return <>{children}</>;
  }

  return (
    <>
      <AnimatePresence>
        {!menuOpen && (
          <motion.header
            key="topbar"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-none fixed inset-x-0 top-0 z-40 flex items-start justify-between px-6 pb-6 sm:px-10 sm:pb-8"
            style={{
              paddingTop:
                "max(1.5rem, calc(env(safe-area-inset-top) + 0.5rem))",
            }}
          >
            {/* REDESIGN(3a 채택): 프로스트 글라스 필.
                사진 위 = 흰 유리(white/16 + blur) + 흰 텍스트,
                밝은 본문 위(pastHero) = 밝은 유리(white/50) + 잉크 텍스트.
                이미 홈이면 "처음으로"는 숨김(자리 유지). */}
            {pathname === "/" ? (
              <div aria-hidden />
            ) : (
              <Link
                href="/"
                className={`pointer-events-auto rounded-full border px-5 py-[11px] font-serif text-base tracking-[0.04em] backdrop-blur-md transition-all duration-300 sm:px-6 sm:py-3 sm:text-lg ${
                  pastHero
                    ? "border-stone-400/30 bg-white/50 text-foreground [text-shadow:none] hover:bg-white/70"
                    : "border-white/40 bg-white/15 text-white [text-shadow:0_1px_6px_rgba(0,0,0,0.3)] hover:bg-white/25"
                }`}
              >
                처음으로
              </Link>
            )}

            <div className="flex flex-col items-end gap-2.5">
              <motion.button
                type="button"
                onClick={openMenu}
                whileTap={{ scale: 0.96 }}
                transition={{ type: "spring", stiffness: 400, damping: 18 }}
                className={`pointer-events-auto group flex items-center gap-2 rounded-full border px-5 py-[11px] font-serif text-base tracking-[0.04em] backdrop-blur-md transition-all duration-300 sm:px-6 sm:py-3 sm:text-lg ${
                  pastHero
                    ? "border-stone-400/30 bg-white/50 text-foreground [text-shadow:none] hover:bg-white/70"
                    : "border-white/40 bg-white/15 text-white [text-shadow:0_1px_6px_rgba(0,0,0,0.3)] hover:bg-white/25"
                }`}
                aria-label="메뉴 열기"
              >
                {/* 리뉴얼 아이콘: 비대칭 2선 (16px/10px 우측 정렬), currentColor */}
                <span className="flex flex-col items-end gap-1">
                  <span className="block h-[1.5px] w-4 bg-current transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0.5" />
                  <span className="block h-[1.5px] w-2.5 bg-current transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:w-4" />
                </span>
                안내
              </motion.button>

              <AnimatePresence>
                {showGuide && (
                  <motion.div
                    key="menu-guide"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{
                      duration: 0.6,
                      delay: 1.2,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="pointer-events-none flex flex-col items-end gap-1"
                    aria-hidden
                  >
                    {/* 박스(말풍선) 없이 사진 위 텍스트 — 히어로 텍스트와
                        같은 시각 언어(흰 글자 + 그림자)라 UI 팝업처럼
                        보이지 않음. */}
                    <motion.svg
                      animate={{ y: [0, -6, 0] }}
                      transition={{
                        duration: 1.8,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="rgba(255,255,255,0.9)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-7 drop-shadow-[0_2px_8px_rgba(0,0,0,0.55)]"
                    >
                      <path d="M12 19V5" />
                      <path d="m5 12 7-7 7 7" />
                    </motion.svg>
                    <span className="mr-1 mt-2 block text-right font-serif text-sm leading-[1.75] tracking-[0.04em] text-white/90 [text-shadow:0_2px_12px_rgba(0,0,0,0.6),0_0_2px_rgba(0,0,0,0.4)]">
                      결혼식 안내는
                      <br />
                      여기에서 보실 수 있어요
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      {/* FIX(모션): mode="wait"인데 exit이 없어 wait이 무의미했음 —
          짧은 exit(0.2s)을 줘서 이전 페이지가 살짝 사라진 뒤 새 페이지가
          페이드인. 전체 전환은 0.2 + 0.35 = 0.55s 이내. */}
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          {children}
        </motion.div>
      </AnimatePresence>

      <MenuOverlay open={menuOpen} onClose={() => setMenuOpen(false)} />
      <ScrollProgress />
      <CustomCursor />
      <BackgroundMusic />
    </>
  );
}
