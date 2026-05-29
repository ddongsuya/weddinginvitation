"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { weddingData } from "@/lib/data";

// Calendar "Add to phone calendar" landing page.
//
// Flow the page drives on its own — no taps required for the happy path:
//
//   1. KakaoTalk webview detected via UA → fire
//      `kakaotalk://web/openExternal?url=…` so the page reopens in
//      Safari/Chrome. KakaoTalk's webview captures .ics downloads into
//      the device's Downloads folder without ever invoking the OS-
//      native "Add to Calendar" sheet, so we have to break out.
//
//   2. External browser → trigger the hidden /api/calendar download
//      link automatically. iOS WebKit / Android Chrome pass the .ics
//      response to the OS, which surfaces the "이벤트 추가" sheet of
//      whichever calendar app the user has set as default.
//
//   3. When the user returns to the browser tab (visibilitychange
//      fires as they come back from the calendar app), we render a
//      "추가됐어요" confirmation with a "이 창 닫기" button that
//      attempts window.close(). On a tab opened from a kakaotalk://
//      scheme, modern mobile browsers allow window.close() to take
//      effect — if for any reason it doesn't, the back-to-invitation
//      link is right below as a safe exit.
//
// The auto-click can be blocked by stricter user-gesture rules; in
// that case the big "캘린더 앱 열기" button on screen is the manual
// fallback (identical href + download attribute).

type Stage = "detecting" | "redirecting" | "ready" | "added";

export default function CalendarPage() {
  const [stage, setStage] = useState<Stage>("detecting");
  const downloadLinkRef = useRef<HTMLAnchorElement>(null);
  const autoFiredRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const ua = navigator.userAgent;
    const isKakao = /KAKAOTALK/i.test(ua);

    if (isKakao) {
      // Brief visible state so the redirect doesn't feel like a flash.
      setStage("redirecting");
      const t = window.setTimeout(() => {
        const here = window.location.href;
        window.location.href = `kakaotalk://web/openExternal?url=${encodeURIComponent(here)}`;
      }, 150);
      return () => window.clearTimeout(t);
    }

    // External browser — show ready UI and auto-fire the download.
    setStage("ready");

    const fireDownload = window.setTimeout(() => {
      if (autoFiredRef.current) return;
      autoFiredRef.current = true;
      downloadLinkRef.current?.click();
    }, 350);

    // When the user returns from the calendar sheet, switch to the
    // "added" confirmation card.
    const onVisible = () => {
      if (
        document.visibilityState === "visible" &&
        autoFiredRef.current
      ) {
        setStage("added");
      }
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      window.clearTimeout(fireDownload);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  const tryCloseWindow = () => {
    if (typeof window === "undefined") return;
    window.close();
  };

  return (
    <main className="grid min-h-screen place-items-center bg-background px-6 text-foreground">
      {/* Hidden anchor we click programmatically. Real, navigable target
          so user-gesture rules sometimes still let it run. */}
      <a
        ref={downloadLinkRef}
        href="/api/calendar"
        download="wedding.ics"
        className="sr-only"
        aria-hidden
        tabIndex={-1}
      >
        wedding.ics
      </a>

      <div className="w-full max-w-md text-center">
        <AnimatePresence mode="wait">
          {stage === "detecting" && (
            <motion.p
              key="detecting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="text-lg text-muted"
            >
              잠시만 기다려주세요…
            </motion.p>
          )}

          {stage === "redirecting" && (
            <motion.div
              key="redirecting"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <Spinner />
              <h1 className="mt-8 font-hand text-[clamp(1.875rem,7vw,2.5rem)] font-medium leading-[1.2]">
                외부 브라우저로 이동 중
              </h1>
              <p className="mt-4 text-[clamp(1rem,4vw,1.125rem)] leading-relaxed text-muted">
                기기의 캘린더 앱과 연결하려면<br />
                외부 브라우저가 필요해요.
              </p>
            </motion.div>
          )}

          {stage === "ready" && (
            <motion.div
              key="ready"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <h1 className="font-hand text-[clamp(2.25rem,8vw,3.25rem)] font-medium leading-[1.15]">
                캘린더에 추가
              </h1>

              <div className="mt-10 rounded-3xl border border-stone-200 bg-white px-6 py-8 shadow-[0_4px_24px_rgba(0,0,0,0.04)] sm:px-8 sm:py-10">
                <p className="font-hand text-[clamp(1.875rem,7vw,2.5rem)] font-medium tracking-[-0.02em] text-foreground">
                  {weddingData.groom.name} ♥ {weddingData.bride.name}
                </p>
                <p className="mt-5 text-[clamp(1.125rem,4.5vw,1.375rem)] tracking-[0.04em] text-muted">
                  {weddingData.date.display}
                </p>
                <p className="mt-2 text-[clamp(1.125rem,4.5vw,1.375rem)] tracking-wide text-accent">
                  {weddingData.venue.name}
                </p>
              </div>

              <motion.a
                href="/api/calendar"
                download="wedding.ics"
                onClick={() => {
                  autoFiredRef.current = true;
                }}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="mt-10 grid w-full place-items-center rounded-full bg-stone-900 px-6 py-5 font-serif text-[clamp(1.125rem,5vw,1.5rem)] font-medium text-white shadow-[0_8px_24px_rgba(0,0,0,0.18)] transition-colors hover:bg-stone-800"
              >
                캘린더 앱 열기
              </motion.a>

              <p className="mt-5 text-sm leading-relaxed text-muted sm:text-base">
                캘린더 앱이 자동으로 열리지 않으면<br />
                위 버튼을 눌러주세요.
              </p>
            </motion.div>
          )}

          {stage === "added" && (
            <motion.div
              key="added"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <CheckMark />
              <h1 className="mt-8 font-hand text-[clamp(2.25rem,8vw,3.25rem)] font-medium leading-[1.15]">
                일정이 추가됐어요
              </h1>
              <p className="mt-4 text-[clamp(1rem,4.5vw,1.25rem)] leading-relaxed text-muted">
                결혼식 날짜가 캘린더에 잘 들어갔는지<br />
                한 번만 확인해주세요.
              </p>

              <motion.button
                type="button"
                onClick={tryCloseWindow}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="mt-10 grid w-full place-items-center rounded-full bg-stone-900 px-6 py-5 font-serif text-[clamp(1.125rem,5vw,1.5rem)] font-medium text-white shadow-[0_8px_24px_rgba(0,0,0,0.18)] transition-colors hover:bg-stone-800"
              >
                이 창 닫기
              </motion.button>

              <Link
                href="/"
                className="mt-6 inline-block font-serif text-base text-muted underline underline-offset-4 transition-colors hover:text-foreground sm:text-lg"
              >
                청첩장으로 돌아가기
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

function Spinner() {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
      className="mx-auto h-10 w-10 rounded-full border-[3px] border-stone-200 border-t-accent"
    />
  );
}

function CheckMark() {
  return (
    <motion.div
      initial={{ scale: 0.4, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        type: "spring",
        stiffness: 320,
        damping: 18,
        delay: 0.05,
      }}
      className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-accent/15"
    >
      <motion.svg
        viewBox="0 0 24 24"
        width="32"
        height="32"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-accent"
        aria-hidden
      >
        <motion.path
          d="M5 12.5l4.5 4.5L19 7.5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.45, delay: 0.18, ease: [0.65, 0, 0.35, 1] }}
        />
      </motion.svg>
    </motion.div>
  );
}
