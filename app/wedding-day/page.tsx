"use client";

import { useEffect, useRef, useState } from "react";
import { SubpageHero } from "../components-home/SubpageHero";
import { SubpageNav } from "../components-home/SubpageNav";
import { weddingData } from "@/lib/data";

const DAY_HEADS = ["일", "월", "화", "수", "목", "금", "토"] as const;

// A single digit's vertical roll strip: `2 + index` full 0-9 spins, then a
// final 0..value run so it settles on `finalChar`. Later columns spin longer.
function buildStrip(finalChar: string, index: number): string[] {
  const fin = parseInt(finalChar, 10);
  const laps = 2 + index;
  const strip: string[] = [];
  for (let l = 0; l < laps; l++) for (let d = 0; d < 10; d++) strip.push(String(d));
  for (let d = 0; d <= fin; d++) strip.push(String(d));
  return strip;
}

interface Col {
  strip: string[];
  offset: string;
  transition: string;
}

// Vertical slot-machine roll shared by the intro "29" and the D-day counter.
function SlotRoll({
  cols,
  cell,
  font,
  minW,
  label,
}: {
  cols: Col[];
  cell: number;
  font: number;
  minW: number;
  label: string;
}) {
  return (
    <>
      <span className="sr-only">{label}</span>
      <div
        aria-hidden
        style={{ display: "flex", justifyContent: "center", gap: 2 }}
      >
        {cols.map((col, i) => (
          <div key={i} style={{ height: cell, overflow: "hidden" }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                transform: `translateY(${col.offset})`,
                transition: col.transition,
              }}
            >
              {col.strip.map((d, j) => (
                <span
                  key={j}
                  className="font-hand"
                  style={{
                    display: "block",
                    height: cell,
                    lineHeight: `${cell}px`,
                    minWidth: minW,
                    fontSize: font,
                    fontWeight: 500,
                    letterSpacing: "-0.03em",
                    textAlign: "center",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {d}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default function WeddingDayPage() {
  const { year, month, day } = weddingData.date;
  const targetMs = new Date(weddingData.date.iso).getTime();

  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const calRef = useRef<HTMLDivElement>(null);
  const cdSectionRef = useRef<HTMLElement>(null);

  const [rolled, setRolled] = useState(false);
  const [cdRolled, setCdRolled] = useState(false);
  // Deterministic initial value (→ diff 0) so the statically-prerendered
  // HTML and the first client render match; the real clock kicks in on mount.
  // (Using Date.now() here hydration-mismatches: build-time vs runtime day.)
  const [now, setNow] = useState(targetMs);
  const [reduce, setReduce] = useState(false);

  const rolledRef = useRef(false);
  const cdRolledRef = useRef(false);
  const lockUntil = useRef(0);
  const metrics = useRef({ introTop: 0, stage: 1, track: 1 });

  // Respect reduced-motion.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduce(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // Reduced motion → skip the roll + the scroll lock, show finals at once.
  useEffect(() => {
    if (!reduce) return;
    rolledRef.current = true;
    cdRolledRef.current = true;
    lockUntil.current = 0;
    setRolled(true);
    setCdRolled(true);
  }, [reduce]);

  // 1s clock for the live countdown (real time starts right after mount).
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Measure the scroll track (absolute top, stage height, scrub distance).
  useEffect(() => {
    const measure = () => {
      const track = trackRef.current;
      const stage = stageRef.current;
      if (!track || !stage) return;
      const introTop = track.getBoundingClientRect().top + window.scrollY;
      const st = stage.clientHeight;
      metrics.current = {
        introTop,
        stage: st,
        track: Math.max(1, track.clientHeight - st),
      };
    };
    measure();
    window.addEventListener("resize", measure);
    // Re-measure once the hero image / fonts settle and can shift layout.
    const t = window.setTimeout(measure, 500);
    return () => {
      window.removeEventListener("resize", measure);
      clearTimeout(t);
    };
  }, []);

  // Scroll: crossfade scrubbing (via refs, no re-render), roll trigger, and a
  // 3.3s down-only lock so the roll + caption can't be scrolled past.
  useEffect(() => {
    let raf = 0;
    // Opacity/transform scrubbing is rAF-throttled (cheap, can drop frames).
    const scrub = () => {
      raf = 0;
      const { introTop, track } = metrics.current;
      const p = Math.min(1, Math.max(0, (window.scrollY - introTop) / track));
      const ease = p * p;
      if (introRef.current) {
        introRef.current.style.opacity = String(Math.max(0, 1 - p / 0.55));
        introRef.current.style.transform = `translateY(${-40 * ease}px) scale(${
          1 - 0.05 * ease
        })`;
      }
      if (calRef.current) {
        const q = Math.min(1, Math.max(0, (p - 0.45) / 0.5));
        calRef.current.style.opacity = String(q);
        calRef.current.style.transform = `translateY(${20 * (1 - q)}px)`;
      }
    };
    // Trigger + lock run synchronously on EVERY scroll event (never dropped),
    // so the clamp can't be skipped by rAF coalescing.
    const onScroll = () => {
      const { introTop, stage } = metrics.current;
      const y = window.scrollY;

      if (!rolledRef.current && y > introTop - stage * 0.5) {
        rolledRef.current = true;
        setRolled(true);
        if (!reduce) lockUntil.current = Date.now() + 3300;
      }
      // Down-lock: clamp to the intro start while the roll plays. Scrolling
      // back up (y < introTop) is always allowed.
      if (lockUntil.current && Date.now() < lockUntil.current && y > introTop) {
        window.scrollTo(0, introTop);
      }
      if (
        !cdRolledRef.current &&
        cdSectionRef.current &&
        cdSectionRef.current.getBoundingClientRect().top <
          window.innerHeight * 0.6
      ) {
        cdRolledRef.current = true;
        setCdRolled(true);
      }

      if (!raf) raf = requestAnimationFrame(scrub);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduce]);

  // ── derived: intro "29" roll ──
  const introCols: Col[] = ["2", "9"].map((ch, i) => {
    const strip = buildStrip(ch, i);
    return {
      strip,
      offset: rolled ? `${-(strip.length - 1) * 190}px` : "0px",
      transition:
        rolled && !reduce
          ? `transform ${1.8 + i * 0.6}s cubic-bezier(0.16,1,0.3,1)`
          : "none",
    };
  });

  // ── derived: live countdown ──
  const diff = Math.max(0, targetMs - now);
  const days = Math.floor(diff / 86_400_000);
  const pad = (n: number) => String(n).padStart(2, "0");
  const cdCols: Col[] = String(days)
    .padStart(2, "0")
    .split("")
    .map((ch, i) => {
      const strip = buildStrip(ch, i);
      return {
        strip,
        offset: cdRolled ? `${-(strip.length - 1) * 108}px` : "0px",
        transition:
          cdRolled && !reduce
            ? `transform ${2 + i * 0.6}s cubic-bezier(0.16,1,0.3,1)`
            : "none",
      };
    });
  const units = [
    { label: "일", value: pad(days) },
    { label: "시간", value: pad(Math.floor((diff / 3_600_000) % 24)) },
    { label: "분", value: pad(Math.floor((diff / 60_000) % 60)) },
    { label: "초", value: pad(Math.floor((diff / 1000) % 60)) },
  ];

  // ── derived: calendar cells (real weekday for the wedding month) ──
  const startWeekday = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const calCells: { label: string; color: string; wedding: boolean }[] = [];
  for (let i = 0; i < startWeekday; i++)
    calCells.push({ label: "", color: "transparent", wedding: false });
  for (let d = 1; d <= daysInMonth; d++) {
    const weekday = (startWeekday + d - 1) % 7;
    if (d === day) calCells.push({ label: String(d), color: "", wedding: true });
    else
      calCells.push({
        label: String(d),
        color: weekday === 0 ? "#b0685c" : "#44403c",
        wedding: false,
      });
  }
  while (calCells.length % 7 !== 0)
    calCells.push({ label: "", color: "transparent", wedding: false });

  const noAnim = reduce;

  return (
    <main>
      <SubpageHero
        num="02"
        label="결혼식 안내"
        photo={weddingData.menuHeroes.weddingDay}
      />

      {/* A. 날짜 인트로 → 달력 크로스페이드 (스크롤 연출).
          트랙(180svh) 안에서 sticky 스테이지(100svh)가 고정된 채, 스크롤
          진행도에 인트로 소멸 / 달력 등장을 직접 바인딩(스크러빙, 되감기 가능). */}
      <div ref={trackRef} style={{ position: "relative", height: "180svh" }}>
        <div
          ref={stageRef}
          style={{ position: "sticky", top: 0, height: "100svh", overflow: "hidden" }}
        >
          {/* 달력 레이어 — 후반부(45%~)에서 같은 자리에 나타남 */}
          <div
            ref={calRef}
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 28px",
              opacity: 0,
              transform: "translateY(20px)",
            }}
          >
            <div style={{ width: "100%", maxWidth: 360 }}>
              <p
                className="font-hand"
                style={{
                  margin: 0,
                  textAlign: "center",
                  fontWeight: 500,
                  fontSize: 34,
                  letterSpacing: "0.02em",
                }}
              >
                {year}년 {month}월
              </p>
              <div
                style={{
                  marginTop: 28,
                  display: "grid",
                  gridTemplateColumns: "repeat(7, 1fr)",
                  rowGap: 18,
                  textAlign: "center",
                }}
              >
                {DAY_HEADS.map((dh) => (
                  <div
                    key={dh}
                    style={{
                      paddingBottom: 6,
                      fontSize: 12,
                      letterSpacing: "0.18em",
                      color: "#a8a29e",
                    }}
                  >
                    {dh}
                  </div>
                ))}
                {calCells.map((c, i) => (
                  <div
                    key={i}
                    style={{
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: 44,
                    }}
                  >
                    {c.wedding ? (
                      <>
                        <span
                          style={{
                            position: "relative",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 44,
                            height: 44,
                            borderRadius: 99,
                            background: "#a67d54",
                            color: "#fff",
                            fontSize: 20,
                            boxShadow: "0 5px 18px rgba(166,125,84,0.5)",
                            fontVariantNumeric: "tabular-nums",
                          }}
                        >
                          {c.label}
                        </span>
                        <span
                          aria-hidden
                          style={{
                            position: "absolute",
                            bottom: -17,
                            left: "50%",
                            transform: "translateX(-50%)",
                            fontSize: 13,
                            lineHeight: 1,
                            color: "#a67d54",
                          }}
                        >
                          ♥
                        </span>
                      </>
                    ) : (
                      <span
                        style={{
                          fontSize: 17,
                          color: c.color,
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        {c.label}
                      </span>
                    )}
                  </div>
                ))}
              </div>
              <p
                className="font-hand"
                style={{
                  margin: "44px 0 0",
                  textAlign: "center",
                  fontWeight: 500,
                  fontSize: 28,
                  letterSpacing: "0.06em",
                }}
              >
                토요일 낮 12시 30분
              </p>
            </div>
          </div>

          {/* 인트로 레이어 — 전반부(0~55%)에서 위로 밀리며 소멸 */}
          <div
            ref={introRef}
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              opacity: 1,
              transform: "translateY(0) scale(1)",
              pointerEvents: "none",
            }}
          >
            <p
              className="font-hand"
              style={{
                margin: 0,
                fontWeight: 500,
                fontSize: 38,
                letterSpacing: "0.05em",
                color: "#524e48",
              }}
            >
              {year}년 {month}월
            </p>

            <div style={{ marginTop: 28 }}>
              <SlotRoll cols={introCols} cell={190} font={168} minW={104} label={`${day}일`} />
            </div>

            <p
              className="font-hand"
              style={{
                margin: "36px 0 0",
                fontWeight: 500,
                fontSize: 30,
                letterSpacing: "0.05em",
                color: "rgba(37,34,30,0.85)",
                opacity: rolled ? 1 : 0,
                transform: rolled ? "translateY(0)" : "translateY(12px)",
                transition: noAnim
                  ? "none"
                  : "opacity 0.7s ease 2.3s, transform 0.7s cubic-bezier(0.22,1,0.36,1) 2.3s",
              }}
            >
              토요일 · 낮 12시 30분
            </p>

            <div
              aria-hidden
              style={{
                position: "absolute",
                bottom: 28,
                left: "50%",
                transform: "translateX(-50%)",
                color: "rgba(82,78,72,0.6)",
                opacity: rolled ? 1 : 0,
                transition: noAnim ? "none" : "opacity 0.7s ease 2.8s",
              }}
            >
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* B. 카운트다운 (연출 트랙 뒤 일반 스크롤) */}
      <section
        ref={cdSectionRef}
        className="border-t border-stone-200/70"
        style={{ marginTop: 40, padding: "80px 20px 96px", textAlign: "center" }}
      >
        <p
          className="font-hand"
          style={{
            margin: 0,
            fontWeight: 500,
            fontSize: 46,
            lineHeight: 1.2,
            letterSpacing: "-0.02em",
          }}
        >
          {weddingData.groom.name}{" "}
          <span style={{ color: "#a67d54", fontSize: 28, verticalAlign: "middle" }}>
            ♥
          </span>{" "}
          {weddingData.bride.name}
        </p>
        <p
          className="font-hand"
          style={{
            margin: "16px 0 0",
            fontWeight: 500,
            fontSize: 30,
            letterSpacing: "0.15em",
            color: "#a67d54",
          }}
        >
          결혼식까지
        </p>

        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "center",
            gap: 6,
            marginTop: 18,
          }}
        >
          <SlotRoll cols={cdCols} cell={108} font={96} minW={62} label={`${days}일`} />
          <span
            className="font-hand"
            style={{ fontWeight: 500, fontSize: 44, color: "#a67d54" }}
          >
            일
          </span>
        </div>

        <p
          style={{
            margin: "14px 0 0",
            fontSize: 22,
            lineHeight: 1.7,
            color: "rgba(37,34,30,0.85)",
          }}
        >
          남았습니다.
        </p>

        <div
          style={{
            width: 48,
            height: 1,
            background: "rgba(166,125,84,0.4)",
            margin: "52px auto 0",
          }}
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 12,
            marginTop: 44,
            opacity: cdRolled ? 1 : 0,
            transform: cdRolled ? "translateY(0)" : "translateY(14px)",
            transition: noAnim
              ? "none"
              : "opacity 0.8s ease 2.4s, transform 0.8s cubic-bezier(0.22,1,0.36,1) 2.4s",
          }}
        >
          {units.map((u) => (
            <div key={u.label}>
              <div
                className="font-hand"
                style={{
                  fontWeight: 500,
                  fontSize: 46,
                  lineHeight: 1,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {u.value}
              </div>
              <div
                style={{
                  marginTop: 12,
                  fontSize: 17,
                  letterSpacing: "0.1em",
                  color: "#524e48",
                }}
              >
                {u.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      <SubpageNav currentHref="/wedding-day" />
    </main>
  );
}
