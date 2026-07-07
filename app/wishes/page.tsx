"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SubpageHero } from "../components-home/SubpageHero";
import { SubpageNav } from "../components-home/SubpageNav";
import { weddingData } from "@/lib/data";

type Side = "groom" | "bride";

type Account = {
  holder: string;
  bank: string;
  number: string;
};

export default function WishesPage() {
  const [open, setOpen] = useState<Side | null>(null);

  return (
    <main>
      <SubpageHero
        num="05"
        label="마음 전하실 곳"
        photo={weddingData.menuHeroes.wishes}
      />

      <section className="px-4 py-28 sm:px-8 sm:py-36">
        <div className="mx-auto max-w-2xl text-center">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.9, delay: 0.1 }}
            className="font-hand text-[clamp(2.75rem,8.5vw,4.25rem)] font-medium leading-[1.15] tracking-[-0.025em] text-foreground"
          >
            마음 전하실 곳
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="mx-auto mt-10 max-w-xl text-[clamp(1.5rem,5.5vw,1.8rem)] leading-[1.9] tracking-[-0.01em] text-foreground/85"
          >
            참석이 어려우신 분들을 위해
            <br />
            계좌번호를 안내드립니다.
          </motion.p>
        </div>
      </section>

      <section className="px-4 pb-28 sm:px-8 sm:pb-36">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8 }}
          className="mx-auto grid max-w-3xl gap-4 sm:gap-5"
        >
          <SideToggle
            label="신랑측"
            isOpen={open === "groom"}
            onClick={() => setOpen(open === "groom" ? null : "groom")}
            accounts={weddingData.accounts.groom}
          />
          <SideToggle
            label="신부측"
            isOpen={open === "bride"}
            onClick={() => setOpen(open === "bride" ? null : "bride")}
            accounts={weddingData.accounts.bride}
          />
        </motion.div>
      </section>

      <SubpageNav currentHref="/wishes" />
    </main>
  );
}

/* REDESIGN(2g 채택): 카드 속 회색 카드 → 헤어라인 리스트 한 장.
   - 헤더: 손글씨 라벨 + "N개 계좌" 캡션
   - 행: "은행 · 예금주" 한 줄 캡션 + 계좌번호(주인공, truncate 없음)
   - 복사: 알약 버튼 → 아이콘 + 텍스트 버튼 */
function SideToggle({
  label,
  isOpen,
  onClick,
  accounts,
}: {
  label: string;
  isOpen: boolean;
  onClick: () => void;
  accounts: readonly Account[];
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-stone-300/50 bg-white">
      <button
        onClick={onClick}
        className="flex w-full items-center justify-between px-6 py-5 text-left transition-colors active:bg-stone-50 sm:px-8 sm:py-6"
        aria-expanded={isOpen}
      >
        <span className="flex items-baseline gap-3">
          <span className="font-hand text-[clamp(1.75rem,7vw,2.5rem)] font-medium text-foreground">
            {label}
          </span>
          <span className="font-serif text-[clamp(0.85rem,3.2vw,1rem)] text-stone-400">
            {accounts.length}개 계좌
          </span>
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="text-muted"
          aria-hidden
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div>
              {accounts.map((acc) => (
                <AccountRow key={`${acc.bank}-${acc.number}`} account={acc} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function fallbackCopy(text: string): boolean {
  if (typeof document === "undefined") return false;
  const el = document.createElement("textarea");
  el.value = text;
  el.setAttribute("readonly", "");
  el.style.position = "fixed";
  el.style.opacity = "0";
  el.style.pointerEvents = "none";
  document.body.appendChild(el);
  el.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  document.body.removeChild(el);
  return ok;
}

function AccountRow({ account }: { account: Account }) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);

  const copy = async () => {
    const showResult = (ok: boolean) => {
      if (ok) {
        setCopied(true);
        setFailed(false);
        setTimeout(() => setCopied(false), 1500);
      } else {
        setFailed(true);
        setTimeout(() => setFailed(false), 2000);
      }
    };

    try {
      await navigator.clipboard.writeText(account.number);
      showResult(true);
    } catch {
      showResult(fallbackCopy(account.number));
    }
  };

  const buttonLabel = failed ? "복사 실패" : copied ? "복사됨" : "복사";
  const buttonKey = failed ? "f" : copied ? "y" : "n";

  return (
    <div className="flex items-center justify-between gap-3.5 border-t border-stone-200/80 px-6 py-4 transition-colors active:bg-stone-50 sm:px-8 sm:py-5">
      <div className="min-w-0">
        <p className="font-serif text-[clamp(0.9rem,3.6vw,1.05rem)] tracking-wide text-stone-500">
          {account.bank} · {account.holder}
        </p>
        <p className="mt-1.5 text-[clamp(1.2rem,4.8vw,1.5rem)] leading-relaxed tracking-[0.01em] text-foreground tabular-nums">
          {account.number}
        </p>
      </div>
      <button
        onClick={copy}
        className={`flex shrink-0 items-center gap-1.5 py-2.5 pl-1 font-serif text-[clamp(1rem,4vw,1.125rem)] transition-colors ${
          copied ? "text-accent" : "text-stone-500 hover:text-accent"
        }`}
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={buttonKey}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="inline-block"
          >
            {buttonLabel}
          </motion.span>
        </AnimatePresence>
      </button>
    </div>
  );
}
