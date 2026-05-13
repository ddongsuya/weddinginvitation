"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MenuOverlay } from "./MenuOverlay";
import { ScrollProgress } from "./ScrollProgress";
import { CustomCursor } from "./CustomCursor";
import { BackgroundMusic } from "./BackgroundMusic";
import { weddingData } from "@/lib/data";

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
              className="pointer-events-auto font-serif text-sm tracking-wide text-white transition-opacity hover:opacity-70 sm:text-base"
              style={{ mixBlendMode: "difference" }}
            >
              {weddingData.groom.name} &nbsp;&amp;&nbsp;{" "}
              {weddingData.bride.name}
            </Link>
            <motion.button
              type="button"
              onClick={() => setMenuOpen(true)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.94 }}
              transition={{ type: "spring", stiffness: 400, damping: 18 }}
              className="pointer-events-auto group flex items-center gap-2.5 rounded-full border border-white/25 bg-black/40 px-4 py-2.5 font-sans text-xs text-white backdrop-blur-md transition-colors hover:bg-black/60 sm:text-sm"
              aria-label="메뉴 열기"
            >
              <span className="flex flex-col gap-[3px]">
                <span className="block h-px w-4 bg-white transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1" />
                <span className="block h-px w-4 bg-white transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-x-1" />
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
