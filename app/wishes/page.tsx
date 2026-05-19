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

      <section className="px-6 py-28 sm:px-10 sm:py-36">
        <div className="mx-auto max-w-2xl text-center">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.9, delay: 0.1 }}
            className="font-hand text-[clamp(2rem,5.4vw,3.2rem)] font-normal leading-[1.2] tracking-[-0.025em] text-foreground"
          >
            마음 전하실 곳
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="mx-auto mt-10 max-w-md text-[21px] leading-[2] tracking-[-0.01em] text-foreground/85 sm:text-2xl"
          >
            참석이 어려우신 분들을 위해
            <br />
            계좌번호를 안내드립니다.
          </motion.p>
        </div>
      </section>

      <section className="px-6 pb-28 sm:px-10 sm:pb-36">
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
    <div className="overflow-hidden rounded-3xl border border-stone-200/80 bg-white">
      <button
        onClick={onClick}
        className="flex w-full items-center justify-between px-6 py-5 text-left sm:px-8 sm:py-6"
        aria-expanded={isOpen}
      >
        <p className="font-serif text-2xl tracking-[0.05em] text-foreground sm:text-3xl">
          {label}
        </p>
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
            <div className="space-y-2 px-4 pb-5 sm:px-6 sm:pb-6">
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
    <motion.div
      whileHover={{ backgroundColor: "rgb(245 245 244)" }}
      transition={{ duration: 0.3 }}
      className="flex items-center justify-between gap-3 rounded-2xl bg-stone-50 px-4 py-4 sm:px-6"
    >
      <div className="min-w-0">
        <p className="text-[17px] tracking-wide text-muted sm:text-lg">
          {account.holder}
        </p>
        {/* Bank + account number stacked so the number isn't truncated
            by the larger type. Number sits on its own line, full width. */}
        <p className="mt-1 font-medium text-[15px] tracking-wide text-accent sm:text-base">
          {account.bank}
        </p>
        <p className="mt-0.5 truncate text-[19px] leading-relaxed tracking-[-0.005em] text-foreground tabular-nums sm:text-xl">
          {account.number}
        </p>
      </div>
      <motion.button
        onClick={copy}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.92 }}
        transition={{ type: "spring", stiffness: 380, damping: 18 }}
        className="ml-3 shrink-0 rounded-full border border-stone-200 bg-white px-4 py-2 font-sans text-base text-foreground transition-colors hover:border-accent/40 hover:text-accent"
      >
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
      </motion.button>
    </motion.div>
  );
}
