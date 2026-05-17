"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { SubpageHero } from "../components-home/SubpageHero";
import { SubpageNav } from "../components-home/SubpageNav";
import { weddingData } from "@/lib/data";

const DAYS = ["일", "월", "화", "수", "목", "금", "토"] as const;

function buildMonth(year: number, month: number) {
  const first = new Date(year, month - 1, 1);
  const startWeekday = first.getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

interface CountdownValue {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function computeDiff(targetMs: number): CountdownValue {
  const diff = targetMs - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff / 3_600_000) % 24),
    minutes: Math.floor((diff / 60_000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function useCountdown(targetMs: number): CountdownValue {
  const [val, setVal] = useState<CountdownValue>(() => computeDiff(targetMs));
  useEffect(() => {
    setVal(computeDiff(targetMs));
    const id = setInterval(() => setVal(computeDiff(targetMs)), 1000);
    return () => clearInterval(id);
  }, [targetMs]);
  return val;
}

export default function WeddingDayPage() {
  const { year, month, day } = weddingData.date;
  const cells = useMemo(() => buildMonth(year, month), [year, month]);
  const targetMs = useMemo(
    () => new Date(weddingData.date.iso).getTime(),
    []
  );
  const countdown = useCountdown(targetMs);

  return (
    <main>
      <SubpageHero
        num="02"
        label="결혼식 안내"
        photo={weddingData.menuHeroes.weddingDay}
      />

      <section className="px-6 py-28 sm:px-10 sm:py-36">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 1, delay: 0.15 }}
            className="font-hand"
          >
            <div className="text-[19px] tracking-[0.04em] text-muted sm:text-xl">
              2026년 8월
            </div>
            <div className="mt-6 text-[clamp(7rem,22vw,18rem)] font-normal leading-[0.95] tracking-[-0.03em] text-foreground">
              29
            </div>
            <div className="mt-6 text-[19px] tracking-[0.04em] text-foreground/80 sm:text-xl">
              토요일 · 낮 12시 30분
            </div>
          </motion.div>
        </div>
      </section>

      <section className="px-6 pb-28 sm:px-10 sm:pb-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9 }}
          className="mx-auto max-w-md"
        >
          <p className="text-center font-serif text-[17px] tracking-[0.2em] text-muted sm:text-lg">
            달력
          </p>
          <div className="mt-4 text-center font-serif text-xl tracking-[0.25em] text-foreground sm:text-2xl">
            {year} . {String(month).padStart(2, "0")}
          </div>
          <div className="mt-6 grid grid-cols-7 gap-y-3 text-center text-[15px] sm:text-base">
            {DAYS.map((d, i) => (
              <div
                key={d}
                className={`pb-2 font-medium tracking-wider ${
                  i === 0
                    ? "text-rose-500"
                    : i === 6
                      ? "text-sky-500"
                      : "text-muted"
                }`}
              >
                {d}
              </div>
            ))}
            {cells.map((c, i) => {
              const weekday = i % 7;
              const isWedding = c === day;
              if (isWedding) {
                return (
                  <div
                    key={i}
                    className="relative flex h-9 items-center justify-center sm:h-10"
                  >
                    <motion.span
                      animate={{
                        scale: [1, 1.18, 1],
                        opacity: [0.5, 0, 0.5],
                      }}
                      transition={{
                        duration: 2.6,
                        repeat: Infinity,
                        ease: "easeOut",
                      }}
                      className="absolute inset-0 rounded-full bg-accent"
                    />
                    <motion.span
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{
                        duration: 2.6,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="relative grid h-9 w-9 place-items-center rounded-full bg-accent text-white shadow-[0_4px_18px_rgba(176,137,104,0.45)] sm:h-10 sm:w-10"
                    >
                      {c}
                    </motion.span>
                  </div>
                );
              }
              return (
                <div
                  key={i}
                  className={`flex h-9 items-center justify-center tabular-nums sm:h-10 ${
                    c === null
                      ? "text-transparent"
                      : weekday === 0
                        ? "text-rose-500"
                        : weekday === 6
                          ? "text-sky-500"
                          : "text-foreground"
                  }`}
                >
                  {c ?? "."}
                </div>
              );
            })}
          </div>
        </motion.div>
      </section>

      <section className="border-t border-stone-200/70 px-6 py-20 sm:px-10 sm:py-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8 }}
          className="mx-auto max-w-3xl"
        >
          <p className="text-center font-serif text-lg tracking-[0.15em] text-accent sm:text-xl">
            결혼식까지
          </p>
          <div className="mt-8 grid grid-cols-4 gap-3 text-center sm:gap-6">
            {[
              { label: "일", value: countdown.days },
              { label: "시간", value: countdown.hours },
              { label: "분", value: countdown.minutes },
              { label: "초", value: countdown.seconds },
            ].map((it) => (
              <div key={it.label}>
                <div className="font-hand text-[clamp(1.9rem,6.4vw,3.6rem)] font-normal leading-none text-foreground tabular-nums">
                  {String(it.value).padStart(2, "0")}
                </div>
                <div className="mt-2 font-serif text-[15px] tracking-[0.1em] text-muted sm:text-base">
                  {it.label}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-10 text-center font-serif text-[17px] leading-[1.8] text-foreground/85 sm:text-lg">
            <span className="font-hand font-medium text-foreground">
              {weddingData.groom.name} ♥ {weddingData.bride.name}
            </span>
            의 결혼식이{" "}
            <span className="font-medium text-accent">
              {countdown.days}일
            </span>{" "}
            남았습니다.
          </p>
        </motion.div>
      </section>

      <SubpageNav currentHref="/wedding-day" />
    </main>
  );
}
