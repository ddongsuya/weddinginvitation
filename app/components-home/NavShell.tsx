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
  // FIX(메뉴 가이드): 첫 방문 1회, 홈에서만 "안내" 버튼 아래에
  // 화살표 + 말풍선을 띄워 유일한 정보 진입 경로를 알려줌.
  // 메뉴를 한 번 열면 localStorage에 기록되어 다시 나오지 않음.
  const [showGuide, setShowGuide] = useState(false);
  const pathname = usePathname();

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
            {/* FIX(편의성): 이미 홈이면 "처음으로"는 무의미 — 숨김.
                자리는 유지해 "안내"의 위치가 페이지 간에 흔들리지 않게. */}
            {pathname === "/" ? (
              <div aria-hidden />
            ) : (
              <Link
                href="/"
                className="pointer-events-auto rounded-full border border-white/25 bg-stone-900/85 px-5 py-3 font-serif text-lg tracking-wide text-white shadow-[0_4px_16px_rgba(0,0,0,0.25)] transition-colors hover:bg-stone-900 sm:px-6 sm:py-3.5 sm:text-xl"
              >
                처음으로
              </Link>
            )}

            <div className="flex flex-col items-end gap-2.5">
              <motion.button
                type="button"
                onClick={openMenu}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.94 }}
                transition={{ type: "spring", stiffness: 400, damping: 18 }}
                className="pointer-events-auto group flex items-center gap-3 rounded-full border border-white/25 bg-stone-900/85 px-5 py-3 font-serif text-lg text-white shadow-[0_4px_16px_rgba(0,0,0,0.25)] transition-colors hover:bg-stone-900 sm:gap-3.5 sm:px-6 sm:py-3.5 sm:text-xl"
                aria-label="메뉴 열기"
              >
                <span className="flex flex-col gap-[5px]">
                  <span className="block h-[2px] w-5 bg-white transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1 sm:w-6" />
                  <span className="block h-[2px] w-5 bg-white transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-x-1 sm:w-6" />
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
