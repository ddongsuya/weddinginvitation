"use client";

import { useState, type ReactNode } from "react";
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
  const query = encodeURIComponent(`${venue.name} ${venue.address}`);
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
      : "주소 복사";
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
          {/* 1. 식장 이름 + 홀 이름 */}
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

          {/* 2. 정보 블록 — 주소 / 전화번호 / 주차장 안내 */}
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

          {/* 3. 지도 */}
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

      <section className="px-4 pb-20 sm:px-8 sm:pb-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8 }}
          className="mx-auto max-w-3xl"
        >
          <p className="text-center text-[clamp(1.5rem,5.5vw,1.875rem)] tracking-[0.04em] text-muted">
            지도 앱에서 길찾기
          </p>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4">
            <motion.a
              href={`https://map.naver.com/v5/search/${query}`}
              target="_blank"
              rel="noreferrer"
              whileHover={{ y: -3, boxShadow: "0 12px 30px rgba(16,185,129,0.25)" }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 320, damping: 22 }}
              className="rounded-2xl bg-emerald-500 py-6 text-center text-xl font-medium text-white shadow-[0_4px_14px_rgba(16,185,129,0.18)] sm:py-8 sm:text-2xl"
            >
              네이버지도
            </motion.a>
            <motion.a
              href={`https://map.kakao.com/?q=${query}`}
              target="_blank"
              rel="noreferrer"
              whileHover={{ y: -3, boxShadow: "0 12px 30px rgba(252,211,77,0.4)" }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 320, damping: 22 }}
              className="rounded-2xl bg-yellow-300 py-6 text-center text-xl font-medium text-stone-900 shadow-[0_4px_14px_rgba(252,211,77,0.3)] sm:py-8 sm:text-2xl"
            >
              카카오맵
            </motion.a>
          </div>
          <motion.button
            onClick={copyAddress}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.985 }}
            transition={{ type: "spring", stiffness: 320, damping: 22 }}
            className="mt-3 w-full rounded-2xl border border-stone-200 bg-white py-5 text-xl text-foreground transition-colors hover:border-stone-300 sm:py-6 sm:text-2xl"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={copyKey}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
                className="inline-block"
              >
                {copyLabel}
              </motion.span>
            </AnimatePresence>
          </motion.button>
        </motion.div>
      </section>

      <SubpageNav currentHref="/location" />
    </main>
  );
}

// Definition-list style row used for the 주소 / 전화번호 / 주차장 안내 block.
// Label sits left in muted serif; value flows right. On narrow screens the
// pair stacks so long Korean addresses don't get squashed.
function InfoRow({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
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
