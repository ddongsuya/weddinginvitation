"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MenuOverlay } from "./MenuOverlay";
import { ScrollProgress } from "./ScrollProgress";
import { CustomCursor } from "./CustomCursor";
import { BackgroundMusic } from "./BackgroundMusic";

export function NavShell({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

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
            className="pointer-events-none fixed inset-x-0 top-0 z-40 flex items-center justify-between px-6 pb-6 sm:px-10 sm:pb-8"
            style={{
              paddingTop:
                "max(1.5rem, calc(env(safe-area-inset-top) + 0.5rem))",
            }}
          >
            <Link
              href="/"
              className="pointer-events-auto rounded-full border border-white/25 bg-stone-900/85 px-5 py-3 font-serif text-lg tracking-wide text-white shadow-[0_4px_16px_rgba(0,0,0,0.25)] transition-colors hover:bg-stone-900 sm:px-6 sm:py-3.5 sm:text-xl"
            >
              처음으로
            </Link>
            <motion.button
              type="button"
              onClick={() => setMenuOpen(true)}
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
          </motion.header>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
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
