"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { weddingData } from "@/lib/data";
import { NaverMap } from "../components-home/NaverMap";
import { BackgroundMusic } from "../components-home/BackgroundMusic";
import { shareInvitation } from "@/lib/kakao";

const DAY_HEADS = ["일", "월", "화", "수", "목", "금", "토"] as const;
const ACCENT = "#a67d54";
const INK_ACCENT = "#8a6140";

// ── helpers ────────────────────────────────────────────────────────────
function fallbackCopy(text: string): boolean {
  if (typeof document === "undefined") return false;
  const el = document.createElement("textarea");
  el.value = text;
  el.setAttribute("readonly", "");
  el.style.position = "fixed";
  el.style.opacity = "0";
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

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return fallbackCopy(text);
  }
}

// Fade-up on scroll — the standard single-page reveal.
function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

// Small serif section label.
function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-serif text-[clamp(0.9rem,3.4vw,1.05rem)] uppercase tracking-[0.3em] text-accent">
      {children}
    </p>
  );
}

export default function OnePage() {
  const { groom, bride, venue, date, gallery, accounts, invitation } =
    weddingData;
  const targetMs = new Date(date.iso).getTime();

  // hydration-safe live clock (null until mounted → diff 0 on server + first
  // client render, then real time).
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = now === null ? 0 : Math.max(0, targetMs - now);
  const pad = (n: number) => String(n).padStart(2, "0");
  const cd = {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff / 3_600_000) % 24),
    minutes: Math.floor((diff / 60_000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };

  // calendar for the wedding month
  const startWeekday = new Date(date.year, date.month - 1, 1).getDay();
  const daysInMonth = new Date(date.year, date.month, 0).getDate();
  const calCells: (number | null)[] = [];
  for (let i = 0; i < startWeekday; i++) calCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) calCells.push(d);
  while (calCells.length % 7 !== 0) calCells.push(null);

  // lightbox
  const [lb, setLb] = useState<number | null>(null);
  const closeLb = () => setLb(null);
  const lbNext = () => setLb((v) => (v === null ? v : (v + 1) % gallery.length));
  const lbPrev = () =>
    setLb((v) => (v === null ? v : (v - 1 + gallery.length) % gallery.length));
  useEffect(() => {
    if (lb === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLb();
      else if (e.key === "ArrowRight") lbNext();
      else if (e.key === "ArrowLeft") lbPrev();
    };
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lb === null]);

  // accounts accordion
  const [openSide, setOpenSide] = useState<"groom" | "bride" | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const doCopy = async (key: string, value: string) => {
    if (await copyText(value)) {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 1500);
    }
  };

  // location copy + share
  const [addrCopied, setAddrCopied] = useState(false);
  const copyAddress = async () => {
    if (await copyText(venue.address)) {
      setAddrCopied(true);
      setTimeout(() => setAddrCopied(false), 1500);
    }
  };
  const [linkCopied, setLinkCopied] = useState(false);
  const copyLink = async () => {
    const url =
      typeof window !== "undefined" ? window.location.href : "";
    if (await copyText(url)) {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 1500);
    }
  };

  const mapQuery = encodeURIComponent(venue.name);
  const dateLine = `${date.year}. ${pad(date.month)}. ${pad(date.day)}`;

  return (
    <main className="mx-auto max-w-[480px] overflow-hidden">
      {/* ── 표지 ── */}
      <section className="relative h-[100svh] w-full overflow-hidden">
        <Image
          src={weddingData.slides[0].src}
          alt=""
          fill
          priority
          sizes="480px"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/25 to-black/60" />
        <div className="absolute inset-0 flex flex-col items-center justify-between py-[12svh] text-center text-white drop-shadow-[0_3px_20px_rgba(0,0,0,0.5)]">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <p className="font-serif text-[clamp(0.85rem,3.4vw,1rem)] tracking-[0.4em]">
              WE ARE GETTING MARRIED
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 0.5 }}
            className="flex flex-col items-center gap-3"
          >
            <h1 className="font-hand text-[clamp(3.25rem,15vw,4.75rem)] font-medium leading-[1.1]">
              {groom.name}
            </h1>
            <span className="text-[clamp(1.5rem,7vw,2.25rem)] text-white/85">
              ♥
            </span>
            <h1 className="font-hand text-[clamp(3.25rem,15vw,4.75rem)] font-medium leading-[1.1]">
              {bride.name}
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.9 }}
            className="flex flex-col items-center gap-1.5"
          >
            <p className="font-serif text-[clamp(1.1rem,4.6vw,1.4rem)] tracking-[0.15em] tabular-nums">
              {dateLine} {date.weekday.charAt(0)}
            </p>
            <p className="font-serif text-[clamp(1rem,4vw,1.2rem)] tracking-[0.05em] text-white/85">
              {venue.name}
            </p>
            <motion.svg
              animate={{ y: [0, 7, 0], opacity: [0.9, 0.5, 0.9] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mt-3"
              aria-hidden
            >
              <path d="m6 9 6 6 6-6" />
            </motion.svg>
          </motion.div>
        </div>
      </section>

      {/* ── 인사말 ── */}
      <section className="px-7 py-24 text-center sm:py-28">
        <Reveal>
          <Label>invitation</Label>
          <h2 className="mt-6 font-hand text-[clamp(2.25rem,9vw,3rem)] font-medium leading-[1.3] text-foreground">
            {invitation.title}
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mx-auto mt-9 max-w-md whitespace-pre-line font-serif text-[clamp(1.15rem,4.8vw,1.375rem)] leading-[2] tracking-[-0.005em] text-foreground/85">
            {invitation.body}
          </p>
        </Reveal>
      </section>

      {/* ── 가족 소개 ── */}
      <section className="px-7 pb-24 text-center sm:pb-28">
        <Reveal className="mx-auto max-w-md space-y-6">
          <div className="mx-auto h-px w-12 bg-stone-300/70" />
          {[
            { p: groom.parents, name: groom.name, rel: "아들" },
            { p: bride.parents, name: bride.name, rel: "딸" },
          ].map((f) => (
            <p
              key={f.name}
              className="font-serif text-[clamp(1.2rem,5vw,1.5rem)] leading-[1.7] tracking-[-0.005em] text-foreground"
            >
              <span className="text-muted">
                {f.p.father} · {f.p.mother}
              </span>
              <span className="mx-1.5 text-[0.85em] text-muted">의 {f.rel}</span>
              <span className="ml-1 font-hand text-[1.35em] font-medium">
                {f.name}
              </span>
            </p>
          ))}
          <div className="mx-auto h-px w-12 bg-stone-300/70" />
        </Reveal>
      </section>

      {/* ── 예식 안내 (일시·장소 + 달력 + 카운트다운) ── */}
      <section className="border-t border-stone-200/70 bg-white/40 px-7 py-24 text-center sm:py-28">
        <Reveal>
          <Label>the wedding day</Label>
          <p className="mt-6 font-hand text-[clamp(1.9rem,7.5vw,2.5rem)] font-medium text-foreground">
            {date.year}년 {date.month}월 {date.day}일
          </p>
          <p className="mt-2 font-serif text-[clamp(1.15rem,4.6vw,1.375rem)] tracking-[0.04em] text-muted">
            {date.weekday} 오후 {date.hour}시 {date.minute}분
          </p>
        </Reveal>

        {/* 달력 */}
        <Reveal delay={0.05} className="mx-auto mt-12 max-w-[340px]">
          <div className="grid grid-cols-7 gap-y-[14px] text-center">
            {DAY_HEADS.map((d, i) => (
              <div
                key={d}
                className="pb-1 font-serif text-[0.8rem] tracking-[0.12em]"
                style={{ color: i === 0 ? "#c08a80" : "#a8a29e" }}
              >
                {d}
              </div>
            ))}
            {calCells.map((c, i) => {
              const weekday = i % 7;
              const isWedding = c === date.day;
              return (
                <div
                  key={i}
                  className="flex h-10 items-center justify-center"
                >
                  {isWedding ? (
                    <span
                      className="relative grid h-10 w-10 place-items-center rounded-full text-white tabular-nums"
                      style={{
                        background: ACCENT,
                        boxShadow: "0 4px 14px rgba(166,125,84,0.45)",
                      }}
                    >
                      {c}
                      <span
                        aria-hidden
                        className="absolute -bottom-[15px] left-1/2 -translate-x-1/2 text-[11px] leading-none"
                        style={{ color: ACCENT }}
                      >
                        ♥
                      </span>
                    </span>
                  ) : (
                    <span
                      className="text-[1.05rem] tabular-nums"
                      style={{
                        color:
                          c === null
                            ? "transparent"
                            : weekday === 0
                              ? "#b0685c"
                              : "#44403c",
                      }}
                    >
                      {c ?? "."}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </Reveal>

        {/* 카운트다운 */}
        <Reveal delay={0.1} className="mx-auto mt-14 max-w-sm">
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "일", value: cd.days },
              { label: "시간", value: cd.hours },
              { label: "분", value: cd.minutes },
              { label: "초", value: cd.seconds },
            ].map((u) => (
              <div key={u.label}>
                <div className="font-hand text-[clamp(2.25rem,10vw,3rem)] font-medium leading-none text-foreground tabular-nums">
                  {pad(u.value)}
                </div>
                <div className="mt-2 font-serif text-[0.95rem] tracking-[0.08em] text-muted">
                  {u.label}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-8 font-serif text-[clamp(1.1rem,4.6vw,1.3rem)] text-foreground/85">
            <span className="font-hand font-medium" style={{ color: INK_ACCENT }}>
              {groom.name} ♥ {bride.name}
            </span>
            의 결혼식이{" "}
            <span className="font-medium" style={{ color: INK_ACCENT }}>
              {cd.days}일
            </span>{" "}
            남았습니다
          </p>
        </Reveal>
      </section>

      {/* ── 갤러리 ── */}
      <section className="px-5 py-24 text-center sm:py-28">
        <Reveal>
          <Label>gallery</Label>
          <h2 className="mt-6 font-hand text-[clamp(2rem,8vw,2.75rem)] font-medium text-foreground">
            우리의 순간들
          </h2>
        </Reveal>
        <Reveal delay={0.05} className="mt-10">
          <div className="grid grid-cols-3 gap-1.5">
            {gallery.map((photo, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setLb(i)}
                className="group relative aspect-square overflow-hidden bg-stone-100"
                aria-label={`${i + 1}번째 사진 크게 보기`}
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes="160px"
                  className="object-cover transition-transform duration-500 group-active:scale-95"
                  loading={i < 6 ? "eager" : "lazy"}
                  draggable={false}
                />
              </button>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ── 오시는 길 ── */}
      <section className="border-t border-stone-200/70 bg-white/40 px-7 py-24 sm:py-28">
        <Reveal className="text-center">
          <Label>location</Label>
          <h2 className="mt-6 font-hand text-[clamp(2rem,8vw,2.75rem)] font-medium text-foreground">
            {venue.name}
          </h2>
          <p className="mt-3 font-serif text-[clamp(1.05rem,4.2vw,1.25rem)] tracking-wide text-muted">
            {venue.hall}
          </p>
          <p className="mt-1.5 font-serif text-[clamp(1rem,4vw,1.15rem)] leading-[1.7] text-foreground/80">
            {venue.address}
          </p>
        </Reveal>

        <Reveal delay={0.05} className="mt-8 overflow-hidden rounded-2xl border border-stone-200/80">
          <NaverMap
            lat={venue.coordinates.lat}
            lng={venue.coordinates.lng}
            zoom={17}
            markerLabel={venue.name}
            className="block h-[300px] w-full"
          />
        </Reveal>

        {/* 길찾기 */}
        <Reveal delay={0.1} className="mx-auto mt-10 max-w-md">
          <p className="mb-1 font-serif text-[0.95rem] tracking-[0.28em] text-accent">
            길찾기
          </p>
          <WayRow
            href={`https://map.naver.com/v5/search/${mapQuery}`}
            label="네이버지도로 길찾기"
            kind="external"
            badge={
              <Badge bg="#03c75a">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff" aria-hidden>
                  <path d="M15.5 4H20v16h-4.7l-6.8-9.7V20H4V4h4.7l6.8 9.7V4z" />
                </svg>
              </Badge>
            }
          />
          <WayRow
            href={`https://map.kakao.com/?q=${mapQuery}`}
            label="카카오맵으로 길찾기"
            kind="external"
            badge={
              <Badge bg="#fae100">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#371d1e" aria-hidden>
                  <path d="M12 3C6.9 3 2.8 6.3 2.8 10.4c0 2.6 1.7 4.9 4.3 6.2l-1 3.9c-.1.3.3.6.6.4l4.5-3c.3 0 .6.1.9.1 5.1 0 9.2-3.3 9.2-7.4S17.1 3 12 3z" />
                </svg>
              </Badge>
            }
          />
          <WayRow
            onClick={copyAddress}
            kind="copy"
            last
            label={addrCopied ? "주소가 복사되었습니다" : "주소 복사하기"}
            accent={addrCopied}
            badge={
              <Badge bg="rgba(166,125,84,0.14)">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={ACCENT}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              </Badge>
            }
          />
          <p className="mt-6 font-serif text-[clamp(1rem,4vw,1.1rem)] leading-[1.8] text-muted">
            <span className="text-accent">주차</span> {venue.parking}
          </p>
        </Reveal>
      </section>

      {/* ── 마음 전하실 곳 ── */}
      <section className="px-7 py-24 text-center sm:py-28">
        <Reveal>
          <Label>account</Label>
          <h2 className="mt-6 font-hand text-[clamp(2rem,8vw,2.75rem)] font-medium text-foreground">
            마음 전하실 곳
          </h2>
          <p className="mx-auto mt-6 max-w-sm font-serif text-[clamp(1.1rem,4.4vw,1.3rem)] leading-[1.9] text-foreground/85">
            축복하는 마음이 머무는 자리
            <br />
            마음 전해 주셔서 감사합니다
          </p>
        </Reveal>

        <Reveal delay={0.05} className="mx-auto mt-10 max-w-md space-y-3">
          {(
            [
              { side: "groom", title: "신랑측", list: accounts.groom },
              { side: "bride", title: "신부측", list: accounts.bride },
            ] as const
          ).map(({ side, title, list }) => {
            const open = openSide === side;
            return (
              <div
                key={side}
                className="overflow-hidden rounded-2xl border border-stone-300/50 bg-white"
              >
                <button
                  type="button"
                  onClick={() => setOpenSide(open ? null : side)}
                  className="flex w-full items-center justify-between px-6 py-5 text-left transition-colors active:bg-stone-50"
                  aria-expanded={open}
                >
                  <span className="flex items-baseline gap-2.5">
                    <span className="font-hand text-[clamp(1.5rem,6vw,1.875rem)] font-medium text-foreground">
                      {title}
                    </span>
                    <span className="font-serif text-[0.95rem] text-stone-400">
                      {list.length}개 계좌
                    </span>
                  </span>
                  <motion.svg
                    animate={{ rotate: open ? 180 : 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="shrink-0 text-stone-400"
                    aria-hidden
                  >
                    <path d="m6 9 6 6 6-6" />
                  </motion.svg>
                </button>
                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      key="body"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-2">
                        {list.map((acc, i) => {
                          const key = `${side}-${i}`;
                          const copied = copiedKey === key;
                          return (
                            <div
                              key={key}
                              className="flex items-center justify-between gap-3 border-t border-stone-200/80 py-4 text-left"
                            >
                              <div className="min-w-0">
                                <p className="font-serif text-[0.9rem] text-stone-500">
                                  {acc.bank} · {acc.holder}
                                </p>
                                <p className="mt-0.5 text-[clamp(1.2rem,4.8vw,1.5rem)] tabular-nums text-foreground">
                                  {acc.number}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => doCopy(key, acc.number)}
                                className="flex shrink-0 items-center gap-1.5 text-stone-500 transition-colors active:text-accent"
                                aria-label={`${acc.holder} 계좌번호 복사`}
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
                                <span
                                  className={`font-serif text-[0.9rem] ${
                                    copied ? "text-accent" : ""
                                  }`}
                                >
                                  {copied ? "복사됨" : "복사"}
                                </span>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </Reveal>
      </section>

      {/* ── 공유 + 마무리 ── */}
      <section className="border-t border-stone-200/70 bg-white/40 px-7 py-24 text-center sm:py-28">
        <Reveal className="mx-auto max-w-md">
          <p className="font-hand text-[clamp(1.9rem,7.5vw,2.5rem)] font-medium leading-[1.4] text-foreground">
            {groom.name} <span style={{ color: INK_ACCENT }}>♥</span> {bride.name}
          </p>
          <p className="mt-3 font-serif text-[clamp(1.05rem,4.2vw,1.25rem)] tracking-[0.04em] text-muted tabular-nums">
            {dateLine} · {venue.name}
          </p>

          <div className="mt-9 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => void shareInvitation("/onepage", " ver.2")}
              className="flex w-full items-center justify-center gap-2 rounded-full py-4 font-serif text-[1.05rem] tracking-[0.02em] text-[#371d1e] transition-transform active:scale-[0.98]"
              style={{ background: "#fae100" }}
            >
              카카오톡으로 공유하기
            </button>
            <button
              type="button"
              onClick={copyLink}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-stone-300/70 bg-white py-4 font-serif text-[1.05rem] tracking-[0.02em] text-foreground transition-colors active:bg-stone-50"
            >
              {linkCopied ? "링크가 복사되었습니다" : "청첩장 링크 복사"}
            </button>
          </div>

          <p className="mt-14 font-serif text-[clamp(1rem,4vw,1.15rem)] leading-[1.9] text-muted">
            소중한 걸음으로 축복해 주셔서
            <br />
            진심으로 감사드립니다.
          </p>
        </Reveal>
      </section>

      {/* ── 라이트박스 ── */}
      <AnimatePresence>
        {lb !== null && (
          <motion.div
            key="lb"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex flex-col"
            style={{ background: "#0c0a09" }}
            role="dialog"
            aria-label="사진 크게 보기"
          >
            <div className="flex shrink-0 items-center justify-between px-6 pb-3 pt-5">
              <span
                className="font-serif tabular-nums"
                style={{ fontSize: 14, letterSpacing: "0.3em", color: "rgba(255,255,255,0.6)" }}
              >
                {lb + 1} / {gallery.length}
              </span>
              <button
                type="button"
                onClick={closeLb}
                aria-label="닫기"
                className="grid h-11 w-11 place-items-center"
                style={{ WebkitTapHighlightColor: "transparent" }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>
            <div className="relative min-h-0 flex-1">
              <Image
                src={gallery[lb].src}
                alt={gallery[lb].alt}
                fill
                sizes="480px"
                className="object-contain px-4"
                priority
              />
              <button
                type="button"
                onClick={lbPrev}
                aria-label="이전 사진"
                className="absolute inset-y-0 left-0 w-1/2"
                style={{ WebkitTapHighlightColor: "transparent" }}
              />
              <button
                type="button"
                onClick={lbNext}
                aria-label="다음 사진"
                className="absolute inset-y-0 right-0 w-1/2"
                style={{ WebkitTapHighlightColor: "transparent" }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <BackgroundMusic />
    </main>
  );
}

// ── 30×30 브랜드/기능 배지 ──
function Badge({ bg, children }: { bg: string; children: React.ReactNode }) {
  return (
    <span
      aria-hidden
      style={{
        width: 30,
        height: 30,
        borderRadius: 8,
        background: bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
        flexShrink: 0,
      }}
    >
      {children}
    </span>
  );
}

// ── 길찾기 행 ──
function WayRow({
  href,
  onClick,
  label,
  kind,
  last,
  badge,
  accent,
}: {
  href?: string;
  onClick?: () => void | Promise<void>;
  label: React.ReactNode;
  kind: "external" | "copy";
  last?: boolean;
  badge?: React.ReactNode;
  accent?: boolean;
}) {
  const cls = `group flex w-full items-center gap-[14px] py-[17px] text-left transition-colors active:bg-stone-100/60 ${
    last ? "" : "border-b border-stone-300/50"
  }`;
  const icon =
    kind === "external" ? (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-stone-400 group-active:text-accent" aria-hidden>
        <path d="M7 17 17 7" />
        <path d="M8 7h9v9" />
      </svg>
    ) : (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-stone-400 group-active:text-accent" aria-hidden>
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
      </svg>
    );
  const inner = (
    <>
      {badge}
      <span
        className={`flex-1 text-[clamp(1.25rem,5vw,1.5rem)] ${
          accent ? "text-accent" : "text-foreground"
        }`}
      >
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
    <button type="button" onClick={() => void onClick?.()} className={cls}>
      {inner}
    </button>
  );
}
