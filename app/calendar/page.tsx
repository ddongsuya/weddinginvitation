"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { weddingData } from "@/lib/data";

// HTML landing page for "캘린더에 추가" — replaces the bare .ics route
// that previously sat here. Reason: KakaoTalk's in-app browser is the
// most common entry point (guests tap the 일정 등록하기 button inside
// a chat preview), and that browser frequently saves .ics files to the
// device's Downloads folder *without* triggering the OS-native "Add to
// Calendar" handler. Guests saw a "다운로드 완료" toast and thought the
// event was added, but their calendar stayed empty.
//
// This page gives the action a clear button and a fallback for the
// KakaoTalk webview case: an "외부 브라우저로 열기" hint that uses
// KakaoTalk's documented `kakaotalk://web/openExternal` URL scheme to
// hand the page off to Safari / Chrome, where the .ics handler works
// reliably.

export default function CalendarPage() {
  const [isKakao, setIsKakao] = useState(false);

  useEffect(() => {
    if (typeof navigator === "undefined") return;
    setIsKakao(/KAKAOTALK/i.test(navigator.userAgent));
  }, []);

  const openInExternalBrowser = () => {
    if (typeof window === "undefined") return;
    const here = `${window.location.origin}/calendar`;
    // KakaoTalk URL scheme — pops the in-app webview off and reopens
    // the same URL in the system's default browser.
    window.location.href = `kakaotalk://web/openExternal?url=${encodeURIComponent(here)}`;
  };

  return (
    <main className="min-h-screen bg-background px-6 py-12 text-foreground sm:py-20">
      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="font-hand text-[clamp(2.5rem,8vw,3.5rem)] font-medium leading-[1.15]"
        >
          캘린더에 추가
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="mt-12 w-full rounded-3xl border border-stone-200 bg-white px-6 py-8 shadow-[0_4px_24px_rgba(0,0,0,0.04)] sm:px-8 sm:py-10"
        >
          <p className="font-hand text-[clamp(1.875rem,7vw,2.5rem)] font-medium tracking-[-0.02em] text-foreground">
            {weddingData.groom.name} ♥ {weddingData.bride.name}
          </p>
          <p className="mt-5 text-[clamp(1.125rem,4.5vw,1.375rem)] tracking-[0.04em] text-muted">
            {weddingData.date.display}
          </p>
          <p className="mt-2 text-[clamp(1.125rem,4.5vw,1.375rem)] tracking-wide text-accent">
            {weddingData.venue.name}
          </p>
        </motion.div>

        {/* Kakao-in-app fallback — only renders if the UA looks like the
            KakaoTalk webview. Subtle visually, prominent enough to read. */}
        {isKakao && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="mt-6 w-full rounded-2xl border border-amber-200 bg-amber-50/70 px-5 py-4 text-left text-[15px] leading-relaxed text-stone-700 sm:text-base"
          >
            카카오톡 내부 브라우저에서는 캘린더 앱이 열리지 않을 수
            있어요. 그럴 땐 아래를 눌러 외부 브라우저로 열어주세요.
            <button
              type="button"
              onClick={openInExternalBrowser}
              className="mt-3 inline-flex items-center gap-1 font-medium text-stone-900 underline underline-offset-4"
            >
              외부 브라우저로 열기 →
            </button>
          </motion.div>
        )}

        <motion.a
          href="/api/calendar"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="mt-10 grid w-full place-items-center rounded-full bg-stone-900 px-6 py-5 font-serif text-[clamp(1.125rem,5vw,1.5rem)] font-medium text-white shadow-[0_8px_24px_rgba(0,0,0,0.18)] transition-colors hover:bg-stone-800"
        >
          캘린더 앱에 추가하기
        </motion.a>

        <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted sm:text-base">
          누르면 기기의 기본 캘린더 앱이 열려요.<br />
          iOS는 캘린더, Android는 설정된 캘린더 앱.
        </p>

        <Link
          href="/"
          className="mt-12 font-serif text-base text-muted underline underline-offset-4 transition-colors hover:text-foreground sm:text-lg"
        >
          ← 청첩장으로 돌아가기
        </Link>
      </div>
    </main>
  );
}
