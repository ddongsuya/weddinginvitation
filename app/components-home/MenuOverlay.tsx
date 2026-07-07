"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { loadKakaoSdk, shareInvitation } from "@/lib/kakao";

export const MENU_ITEMS = [
  { num: "01", label: "초대의 글", labelEn: "Invitation", href: "/invitation" },
  { num: "02", label: "결혼식 안내", labelEn: "The Day", href: "/wedding-day" },
  { num: "03", label: "오시는 길", labelEn: "Location", href: "/location" },
  { num: "04", label: "갤러리", labelEn: "Gallery", href: "/gallery" },
  { num: "05", label: "마음 전하실 곳", labelEn: "Wishes", href: "/wishes" },
] as const;

const SHARE_ITEM = {
  num: "06",
  label: "카톡으로 공유",
} as const;

export function MenuOverlay({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!open) return;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    loadKakaoSdk().catch(() => {});
    return () => {
      document.documentElement.style.overflow = prev;
    };
  }, [open]);

  // FIX(반응성): 기존에는 onClose 후 setTimeout(350ms) 뒤에 push해서
  // 탭 → 이동 사이에 아무 일도 안 일어나는 공백이 있었음.
  // 즉시 push하고, 오버레이 페이드아웃(0.4s)은 새 페이지가 뜨는 동안
  // 겹쳐서 재생 — 체감 이동이 ~750ms → 즉시로.
  const handleNavClick = (href: string) => {
    router.push(href);
    onClose();
  };

  const handleShareClick = () => {
    shareInvitation();
  };

  const goHome = () => {
    router.push("/");
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="menu"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed inset-0 z-[300] bg-stone-950/95 backdrop-blur-md"
          aria-modal="true"
          role="dialog"
        >
          <header
            className="absolute inset-x-0 top-0 flex items-center justify-between px-6 pb-6 sm:px-10 sm:pb-8"
            style={{
              paddingTop:
                "max(1.5rem, calc(env(safe-area-inset-top) + 0.5rem))",
            }}
          >
            {/* REDESIGN(3a): 오버레이 헤더도 유리 필로 통일 */}
            <button
              type="button"
              onClick={goHome}
              className="rounded-full border border-white/25 bg-white/10 px-5 py-[11px] font-serif text-base tracking-[0.04em] text-white backdrop-blur-md transition-colors hover:bg-white/20 active:bg-white/25 sm:px-6 sm:py-3 sm:text-lg"
            >
              처음으로
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-5 py-[11px] font-serif text-base tracking-[0.04em] text-white backdrop-blur-md transition-colors hover:bg-white/20 active:bg-white/25 sm:px-6 sm:py-3 sm:text-lg"
              aria-label="메뉴 닫기"
            >
              <span className="relative h-[15px] w-[15px]">
                <span className="absolute left-0 top-1/2 h-[1.5px] w-[15px] -translate-y-1/2 rotate-45 bg-current" />
                <span className="absolute left-0 top-1/2 h-[1.5px] w-[15px] -translate-y-1/2 -rotate-45 bg-current" />
              </span>
              닫기
            </button>
          </header>

          <nav className="grid h-full place-items-center px-6">
            <ul className="space-y-6 sm:space-y-8">
              {MENU_ITEMS.map((item, i) => {
                const isActive = pathname === item.href;
                return (
                  <motion.li
                    key={item.href}
                    initial={{ y: 32, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 16, opacity: 0 }}
                    transition={{
                      duration: 0.55,
                      ease: [0.22, 1, 0.36, 1],
                      delay: 0.1 + i * 0.07,
                    }}
                  >
                    <motion.button
                      type="button"
                      onClick={() => handleNavClick(item.href)}
                      whileHover={{ x: 12 }}
                      whileTap={{ scale: 0.98, x: 6 }}
                      transition={{ type: "spring", stiffness: 380, damping: 24 }}
                      aria-current={isActive ? "page" : undefined}
                      className={`group flex items-baseline gap-5 text-left transition-colors sm:gap-7 ${
                        isActive
                          ? "text-white"
                          : "text-white/85 hover:text-white"
                      }`}
                    >
                      <span
                        className={`font-serif text-sm tracking-[0.15em] sm:text-base ${
                          isActive ? "text-accent" : "text-white/55"
                        }`}
                      >
                        {item.num}
                      </span>
                      <span className="font-hand text-[clamp(2.75rem,9vw,5rem)] font-medium leading-[1.1] tracking-[-0.02em]">
                        {item.label}
                      </span>
                      <motion.span
                        aria-hidden
                        initial={{ opacity: 0, x: -8 }}
                        whileHover={{ opacity: 1, x: 0 }}
                        className="hidden font-sans text-xs text-white/40 sm:inline"
                      >
                        →
                      </motion.span>
                    </motion.button>
                  </motion.li>
                );
              })}

              <motion.li
                initial={{ y: 32, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 16, opacity: 0 }}
                transition={{
                  duration: 0.55,
                  ease: [0.22, 1, 0.36, 1],
                  delay: 0.1 + MENU_ITEMS.length * 0.07,
                }}
              >
                <motion.button
                  type="button"
                  onClick={handleShareClick}
                  whileHover={{ x: 12 }}
                  whileTap={{ scale: 0.98, x: 6 }}
                  transition={{ type: "spring", stiffness: 380, damping: 24 }}
                  className="group flex items-baseline gap-5 text-left text-white/85 transition-colors hover:text-white sm:gap-7"
                >
                  <span className="font-serif text-sm tracking-[0.15em] text-white/55 sm:text-base">
                    {SHARE_ITEM.num}
                  </span>
                  <span className="font-hand text-[clamp(2.75rem,9vw,5rem)] font-medium leading-[1.1] tracking-[-0.02em]">
                    {SHARE_ITEM.label}
                  </span>
                  <motion.span
                    aria-hidden
                    initial={{ opacity: 0, x: -8 }}
                    whileHover={{ opacity: 1, x: 0 }}
                    className="hidden font-sans text-xs text-white/40 sm:inline"
                  >
                    →
                  </motion.span>
                </motion.button>
              </motion.li>
            </ul>
          </nav>

          <footer
            className="absolute inset-x-0 bottom-0 flex items-end justify-between px-6 pt-6 sm:px-10 sm:pt-8"
            style={{
              paddingBottom:
                "max(1.5rem, calc(env(safe-area-inset-bottom) + 0.5rem))",
            }}
          >
            <p className="font-serif text-lg tracking-[0.08em] text-white/85 sm:text-xl">
              2026.08.29 (토) 히든베이호텔
            </p>
          </footer>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
