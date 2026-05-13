"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MENU_ITEMS } from "./MenuOverlay";
import { shareInvitation } from "@/lib/kakao";

export function SubpageNav({ currentHref }: { currentHref: string }) {
  const idx = MENU_ITEMS.findIndex((m) => m.href === currentHref);
  if (idx === -1) return null;
  const prev = idx > 0 ? MENU_ITEMS[idx - 1] : null;
  const next = idx < MENU_ITEMS.length - 1 ? MENU_ITEMS[idx + 1] : null;

  return (
    <nav
      className="border-t border-stone-200/70 px-6 py-12 sm:px-10 sm:py-16"
      aria-label="페이지 네비게이션"
    >
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4">
        {prev ? (
          <NavLink
            href={prev.href}
            num={prev.num}
            label={prev.label}
            direction="prev"
          />
        ) : (
          <div />
        )}

        {next ? (
          <NavLink
            href={next.href}
            num={next.num}
            label={next.label}
            direction="next"
          />
        ) : (
          <NavAction
            num="06"
            label="카톡으로 공유"
            onClick={shareInvitation}
            direction="next"
          />
        )}
      </div>
    </nav>
  );
}

function NavLink({
  href,
  num,
  label,
  direction,
}: {
  href: string;
  num: string;
  label: string;
  direction: "prev" | "next";
}) {
  const isPrev = direction === "prev";
  const arrow = isPrev ? "←" : "→";
  const caption = isPrev ? `${arrow}  이전 · ${num}` : `다음 · ${num}  ${arrow}`;

  return (
    <Link href={href} className="group block">
      <NavCardInner direction={direction} caption={caption} label={label} />
    </Link>
  );
}

function NavAction({
  num,
  label,
  onClick,
  direction,
}: {
  num: string;
  label: string;
  onClick: () => void | Promise<void>;
  direction: "prev" | "next";
}) {
  const isPrev = direction === "prev";
  const arrow = isPrev ? "←" : "→";
  const caption = isPrev ? `${arrow}  이전 · ${num}` : `다음 · ${num}  ${arrow}`;

  return (
    <button
      type="button"
      onClick={() => {
        void onClick();
      }}
      className="group block w-full text-right"
    >
      <NavCardInner direction={direction} caption={caption} label={label} />
    </button>
  );
}

function NavCardInner({
  direction,
  caption,
  label,
}: {
  direction: "prev" | "next";
  caption: string;
  label: string;
}) {
  const isPrev = direction === "prev";
  return (
    <motion.div
      whileHover={{ x: isPrev ? -8 : 8 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 360, damping: 24 }}
      className={`flex flex-col ${isPrev ? "items-start" : "items-end"}`}
    >
      <span className="font-sans text-xs text-muted sm:text-sm">{caption}</span>
      <span className="relative mt-3 inline-block font-serif text-xl text-foreground sm:text-2xl">
        {label}
        <span
          aria-hidden
          className={`pointer-events-none absolute inset-x-0 -bottom-1 h-px scale-x-0 bg-accent transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100 ${
            isPrev ? "origin-left" : "origin-right"
          }`}
        />
      </span>
    </motion.div>
  );
}
