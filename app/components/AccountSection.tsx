"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { weddingData } from "@/lib/data";

type Side = "groom" | "bride";

export function AccountSection() {
  const [open, setOpen] = useState<Side | null>(null);

  return (
    <section className="px-6 py-24" aria-label="마음 전하실 곳">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="text-center">
          <p className="font-serif text-[11px] tracking-[0.4em] text-accent">
            ACCOUNT
          </p>
          <h2 className="mt-6 font-serif text-xl text-foreground">
            마음 전하실 곳
          </h2>
          <p className="mx-auto mt-6 max-w-xs text-[13px] leading-relaxed text-muted text-pretty">
            참석이 어려우신 분들을 위해
            <br />
            계좌번호를 안내드립니다.
          </p>
        </div>

        <div className="mt-10 space-y-3">
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
        </div>
      </motion.div>
    </section>
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
  accounts: readonly { holder: string; bank: string; number: string }[];
}) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white/70 ring-1 ring-stone-200/60">
      <button
        onClick={onClick}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
        aria-expanded={isOpen}
      >
        <span className="font-serif text-[15px] text-foreground">{label}</span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          className="text-muted"
          aria-hidden
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m6 9 6 6 6-6"/>
          </svg>
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <div className="space-y-2 px-5 pb-5">
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

function AccountRow({
  account,
}: {
  account: { holder: string; bank: string; number: string };
}) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(account.number);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };
  return (
    <div className="flex items-center justify-between rounded-xl bg-stone-50 px-4 py-3">
      <div className="min-w-0">
        <p className="text-[11px] text-muted">{account.holder}</p>
        <p className="mt-0.5 truncate text-[13px] text-foreground">
          <span className="text-accent">{account.bank}</span>{" "}
          {account.number}
        </p>
      </div>
      <button
        onClick={copy}
        className="ml-3 shrink-0 rounded-lg bg-white px-3 py-1.5 text-[11px] text-foreground ring-1 ring-stone-200 active:scale-95 transition-transform"
      >
        {copied ? "복사됨" : "복사"}
      </button>
    </div>
  );
}
