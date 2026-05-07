"use client";

import { motion } from "framer-motion";
import { weddingData } from "@/lib/data";

export function Footer() {
  const share = async () => {
    if (typeof window === "undefined") return;
    const data: ShareData = {
      title: `${weddingData.groom.name} ♥ ${weddingData.bride.name} 결혼합니다`,
      text: weddingData.date.display,
      url: window.location.href,
    };
    try {
      const nav = window.navigator as Navigator & {
        share?: (d: ShareData) => Promise<void>;
      };
      if (typeof nav.share === "function") {
        await nav.share(data);
        return;
      }
      await window.navigator.clipboard.writeText(data.url ?? "");
      alert("청첩장 링크가 복사되었습니다.");
    } catch {
      // user cancelled or share failed
    }
  };

  return (
    <footer className="px-6 pb-16 pt-8">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <button
          onClick={share}
          className="rounded-full bg-foreground px-6 py-3 text-xs tracking-wider text-background active:scale-95 transition-transform"
        >
          청첩장 공유하기
        </button>
        <p className="mt-8 font-serif text-[11px] tracking-[0.3em] text-muted">
          THANK YOU
        </p>
        <p className="mt-3 font-serif text-sm text-foreground">
          {weddingData.groom.name} &nbsp;·&nbsp; {weddingData.bride.name}
        </p>
      </motion.div>
    </footer>
  );
}
