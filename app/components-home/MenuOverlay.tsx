"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { weddingData } from "@/lib/data";
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

  const handleNavClick = (href: string) => {
    onClose();
    setTimeout(() => {
      router.push(href);
    }, 350);
  };

  const handleShareClick = () => {
    shareInvitation();
  };

  const goHome = () => {
    onClose();
    setTimeout(() => router.push("/"), 350);
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
            <button
              type="button"
              onClick={goHome}
              className="font-serif text-sm tracking-wide text-white/80 transition-colors hover:text-white sm:text-base"
            >
              {weddingData.groom.name} &nbsp;&amp;&nbsp;{" "}
              {weddingData.bride.name}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-2.5 font-sans text-xs text-white sm:text-sm"
              aria-label="메뉴 닫기"
            >
              <span className="relative h-4 w-4">
                <span className="absolute left-0 top-1/2 h-px w-4 -translate-y-1/2 rotate-45 bg-white" />
                <span className="absolute left-0 top-1/2 h-px w-4 -translate-y-1/2 -rotate-45 bg-white" />
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
            <p className="font-serif text-[13px] tracking-[0.12em] text-white/70 sm:text-sm">
              2026.08.29 (토) 히든베이호텔
            </p>
          </footer>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
