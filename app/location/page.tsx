"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SubpageHero } from "../components-home/SubpageHero";
import { SubpageNav } from "../components-home/SubpageNav";
import { NaverMap } from "../components-home/NaverMap";
import { weddingData } from "@/lib/data";

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

export default function LocationPage() {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  const { venue } = weddingData;
  const query = encodeURIComponent(venue.name);
  const { lat, lng } = venue.coordinates;
  const telDigits = venue.tel.replace(/-/g, "");

  const copyAddress = async () => {
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
      await navigator.clipboard.writeText(venue.address);
      showResult(true);
    } catch {
      showResult(fallbackCopy(venue.address));
    }
  };

  const copyLabel = failed
    ? "복사 실패"
    : copied
      ? "주소가 복사되었습니다"
      : "주소 복사하기";
  const copyKey = failed ? "f" : copied ? "y" : "n";

  return (
    <main>
      <SubpageHero
        num="03"
        label="오시는 길"
        photo={weddingData.menuHeroes.location}
      />

      <section className="px-4 py-28 sm:px-8 sm:py-36">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.9, delay: 0.1 }}
              className="font-hand text-[clamp(2.875rem,9vw,4.75rem)] font-medium leading-[1.15] tracking-[-0.025em] text-foreground"
            >
              {venue.name}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.8, delay: 0.25 }}
              className="mt-5 text-[clamp(1.5rem,5.5vw,1.875rem)] tracking-wide text-muted"
            >
              {venue.hall}
            </motion.p>
          </div>

          <motion.dl
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mx-auto mt-12 max-w-xl space-y-5 sm:mt-16"
          >
            <InfoRow label="주소" value={venue.address} />
            <InfoRow
              label="전화번호"
              value={
                <a
                  href={`tel:${telDigits}`}
                  className="underline decoration-stone-300 decoration-1 underline-offset-4 transition-colors hover:decoration-accent hover:text-accent"
                >
                  {venue.tel}
                </a>
              }
            />
            <InfoRow label="주차장 안내" value={venue.parking} />
          </motion.dl>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.9, delay: 0.3 }}
            className="mt-12 overflow-hidden rounded-2xl border border-stone-200/80 sm:mt-16"
          >
            <NaverMap
              lat={lat}
              lng={lng}
              zoom={17}
              markerLabel={venue.name}
            />
          </motion.div>
        </div>
      </section>

      {/* REDESIGN(2b 채택): "지도 앱에서 길찾기" 제목 + 브랜드 배지 카드
          3장 → 카드 없는 헤어라인 텍스트 리스트. 버튼처럼 안 보이는
          조용한 행 — 본문(InfoRow)과 같은 시각 언어. */}
      <section className="px-6 pb-20 sm:px-8 sm:pb-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8 }}
          className="mx-auto max-w-xl"
        >
          <p className="mb-1 font-serif text-[clamp(0.95rem,3.5vw,1.05rem)] tracking-[0.28em] text-accent">
            길찾기
          </p>
          <WayRow
            href={`https://map.naver.com/v5/search/${query}`}
            label="네이버지도로 길찾기"
            kind="external"
          />
          <WayRow
            href={`https://map.kakao.com/?q=${query}`}
            label="카카오맵으로 길찾기"
            kind="external"
          />
          <WayRow
            onClick={copyAddress}
            kind="copy"
            last
            label={
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={copyKey}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25 }}
                  className={`inline-block ${copied ? "text-accent" : ""}`}
                >
                  {copyLabel}
                </motion.span>
              </AnimatePresence>
            }
          />
        </motion.div>
      </section>

      <SubpageNav currentHref="/location" />
    </main>
  );
}

// 2b 스타일 공용 행 — 텍스트 + 헤어라인 + 우측 작은 아이콘.
function WayRow({
  href,
  onClick,
  label,
  kind,
  last,
}: {
  href?: string;
  onClick?: () => void | Promise<void>;
  label: React.ReactNode;
  kind: "external" | "copy";
  last?: boolean;
}) {
  const cls = `group flex w-full items-center justify-between gap-4 py-5 text-left transition-colors active:bg-stone-100/60 ${
    last ? "" : "border-b border-stone-300/50"
  }`;
  const icon =
    kind === "external" ? (
      <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="shrink-0 text-stone-400 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
        aria-hidden
      >
        <path d="M7 17 17 7" />
        <path d="M8 7h9v9" />
      </svg>
    ) : (
      <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="shrink-0 text-stone-400 transition-colors group-hover:text-accent"
        aria-hidden
      >
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
      </svg>
    );
  const inner = (
    <>
      <span className="text-[clamp(1.25rem,5vw,1.5rem)] text-foreground">
        {label}
      </span>
      {icon}
    </>
  );

  if (href) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={cls}>
        {inner}
      </a>
    );
  }
  return (
    <button
      type="button"
      onClick={() => {
        void onClick?.();
      }}
      className={cls}
    >
      {inner}
    </button>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[7.5rem_1fr] items-baseline gap-x-4 gap-y-1 border-b border-stone-200/70 pb-5 last:border-b-0 last:pb-0 sm:grid-cols-[9rem_1fr]">
      <dt className="font-serif text-[clamp(1.1rem,4.5vw,1.375rem)] tracking-[0.15em] text-accent">
        {label}
      </dt>
      <dd className="text-[clamp(1.25rem,5vw,1.625rem)] leading-[1.7] tracking-[-0.005em] text-foreground">
        {value}
      </dd>
    </div>
  );
}
