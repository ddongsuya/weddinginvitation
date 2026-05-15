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

      <section className="px-6 py-28 sm:px-10 sm:py-36">
        <div className="mx-auto max-w-3xl">
          {/* 1. 식장 이름 + 홀 이름 */}
          <div className="text-center">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.9, delay: 0.1 }}
              className="font-serif text-[clamp(2rem,6vw,4rem)] font-normal leading-[1.15] tracking-[-0.025em] text-foreground"
            >
              {venue.name}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.8, delay: 0.25 }}
              className="mt-5 text-[17px] tracking-wide text-muted sm:text-lg"
            >
              {venue.hall}
            </motion.p>
          </div>

          {/* 2. 지도 */}
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

          {/* 3. 주소 + 전화번호 (지도 아래) */}
          <div className="mt-10 text-center sm:mt-12">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-[17px] leading-[1.7] tracking-[-0.01em] text-foreground sm:text-lg"
            >
              {venue.address}
            </motion.p>
            <motion.a
              href={`tel:${telDigits}`}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, delay: 0.2 }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-5 py-2.5 text-sm text-foreground transition-colors hover:border-accent/40 hover:text-accent sm:text-base"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <span className="tracking-wide">{venue.tel}</span>
            </motion.a>
          </div>
        </div>
      </section>

      <section className="px-6 pb-20 sm:px-10 sm:pb-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8 }}
          className="mx-auto max-w-3xl"
        >
          <p className="text-center text-[17px] tracking-[0.04em] text-muted sm:text-lg">
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
              className="rounded-2xl bg-emerald-500 py-5 text-center text-sm font-medium text-white shadow-[0_4px_14px_rgba(16,185,129,0.18)] sm:py-7 sm:text-base"
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
              className="rounded-2xl bg-yellow-300 py-5 text-center text-sm font-medium text-stone-900 shadow-[0_4px_14px_rgba(252,211,77,0.3)] sm:py-7 sm:text-base"
            >
              카카오맵
            </motion.a>
          </div>
          <motion.button
            onClick={copyAddress}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.985 }}
            transition={{ type: "spring", stiffness: 320, damping: 22 }}
            className="mt-3 w-full rounded-2xl border border-stone-200 bg-white py-4 text-sm text-foreground transition-colors hover:border-stone-300 sm:py-5 sm:text-base"
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

      <section className="border-t border-stone-200/70 px-6 py-20 sm:px-10 sm:py-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8 }}
          className="mx-auto grid max-w-3xl gap-10 sm:grid-cols-3 sm:gap-8"
        >
          <Detail label="교통편" body={venue.transit} />
          <Detail label="주차" body={venue.parking} />
          <Detail label="안내" body={venue.addressDetail} />
        </motion.div>
      </section>

      <SubpageNav currentHref="/location" />
    </main>
  );
}

function Detail({ label, body }: { label: string; body: string }) {
  return (
    <div>
      <p className="font-serif text-base tracking-[0.1em] text-accent sm:text-lg">
        {label}
      </p>
      <p className="mt-4 text-[15px] leading-[1.85] tracking-[-0.01em] text-foreground/85 sm:text-base">
        {body}
      </p>
    </div>
  );
}
