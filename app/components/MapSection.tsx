"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { weddingData } from "@/lib/data";

export function MapSection() {
  const [copied, setCopied] = useState(false);
  const { venue } = weddingData;

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(venue.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  const query = encodeURIComponent(`${venue.name} ${venue.address}`);

  return (
    <section className="px-6 py-24" aria-label="오시는 길">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="text-center">
          <p className="font-serif text-[11px] tracking-[0.4em] text-accent">
            LOCATION
          </p>
          <h2 className="mt-6 font-serif text-xl text-foreground">
            오시는 길
          </h2>
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl ring-1 ring-stone-200/60">
          <div className="relative aspect-[4/3] bg-gradient-to-br from-stone-100 via-stone-50 to-stone-100">
            <div className="absolute inset-0 grid place-items-center text-center">
              <div>
                <div className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-full bg-accent/10 text-accent">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                </div>
                <p className="font-serif text-base text-foreground">{venue.name}</p>
                <p className="mt-1 text-xs text-muted">{venue.hall}</p>
              </div>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-px bg-stone-200" />
          </div>
          <div className="bg-white px-5 py-4 text-center">
            <p className="text-sm text-foreground">{venue.address}</p>
            <p className="mt-1 text-xs text-muted">{venue.tel}</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <a
            href={`https://map.kakao.com/?q=${query}`}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl bg-yellow-300/90 py-2.5 text-center text-xs font-medium text-stone-900 active:scale-95 transition-transform"
          >
            카카오맵
          </a>
          <a
            href={`https://map.naver.com/v5/search/${query}`}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl bg-emerald-500/90 py-2.5 text-center text-xs font-medium text-white active:scale-95 transition-transform"
          >
            네이버지도
          </a>
          <a
            href={`https://map.google.com/?q=${query}`}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl bg-stone-700 py-2.5 text-center text-xs font-medium text-white active:scale-95 transition-transform"
          >
            구글맵
          </a>
        </div>

        <button
          onClick={copyAddress}
          className="mt-2 w-full rounded-xl border border-stone-200 bg-white py-2.5 text-xs text-foreground active:scale-95 transition-transform"
        >
          {copied ? "주소가 복사되었습니다" : "주소 복사"}
        </button>

        <div className="mt-8 space-y-4 text-[13px] leading-relaxed">
          <Detail label="지하철" body={venue.transit} />
          <Detail label="주차" body={venue.parking} />
          <Detail label="안내" body={venue.addressDetail} />
        </div>
      </motion.div>
    </section>
  );
}

function Detail({ label, body }: { label: string; body: string }) {
  return (
    <div className="flex gap-4">
      <div className="w-12 shrink-0 font-serif text-[11px] tracking-widest text-accent">
        {label}
      </div>
      <div className="flex-1 text-foreground/80">{body}</div>
    </div>
  );
}
