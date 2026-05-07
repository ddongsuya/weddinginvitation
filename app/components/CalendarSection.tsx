"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
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

function useCountdown(target: Date) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!now) return null;
  const diff = target.getTime() - now.getTime();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { days, hours, minutes, seconds };
}

export function CalendarSection() {
  const { year, month, day } = weddingData.date;
  const cells = buildMonth(year, month);
  const target = new Date(weddingData.date.iso);
  const countdown = useCountdown(target);

  return (
    <section className="px-6 py-24" aria-label="결혼식 날짜">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="text-center">
          <p className="font-serif text-[11px] tracking-[0.4em] text-accent">
            WEDDING DAY
          </p>
          <h2 className="mt-6 font-serif text-lg text-foreground">
            2026년 8월 29일 토요일
          </h2>
          <p className="mt-2 font-serif text-sm text-muted">
            오후 12시 30분
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-xs p-5">
          <div className="text-center font-serif text-base tracking-widest text-foreground">
            {year} . {String(month).padStart(2, "0")}
          </div>
          <div className="mt-4 grid grid-cols-7 gap-y-2 text-center text-[11px]">
            {DAYS.map((d, i) => (
              <div
                key={d}
                className={`pb-2 font-medium ${
                  i === 0
                    ? "text-rose-400"
                    : i === 6
                      ? "text-sky-400"
                      : "text-muted"
                }`}
              >
                {d}
              </div>
            ))}
            {cells.map((c, i) => {
              const weekday = i % 7;
              const isWedding = c === day;
              return (
                <div
                  key={i}
                  className={`flex h-8 items-center justify-center text-[13px] ${
                    isWedding
                      ? "rounded-full bg-accent text-white"
                      : c === null
                        ? "text-transparent"
                        : weekday === 0
                          ? "text-rose-400"
                          : weekday === 6
                            ? "text-sky-400"
                            : "text-foreground"
                  }`}
                >
                  {c ?? "."}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mx-auto mt-8 max-w-xs">
          <div className="grid grid-cols-4 gap-2 text-center">
            {[
              { label: "DAYS", value: countdown?.days },
              { label: "HOUR", value: countdown?.hours },
              { label: "MIN", value: countdown?.minutes },
              { label: "SEC", value: countdown?.seconds },
            ].map((it) => (
              <div key={it.label} className="py-3">
                <div className="font-serif text-xl text-foreground tabular-nums">
                  {it.value === undefined
                    ? "-"
                    : String(it.value).padStart(2, "0")}
                </div>
                <div className="mt-1 text-[9px] tracking-widest text-muted">
                  {it.label}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-center text-[12px] text-muted">
            {weddingData.groom.name}♥{weddingData.bride.name}의 결혼식이{" "}
            <span className="text-accent">
              {countdown ? countdown.days : "-"}일
            </span>{" "}
            남았습니다.
          </p>
        </div>
      </motion.div>
    </section>
  );
}
