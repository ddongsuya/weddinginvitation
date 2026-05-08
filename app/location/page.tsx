"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SubpageHero } from "../components-home/SubpageHero";
import { SubpageNav } from "../components-home/SubpageNav";
import { NaverMap } from "../components-home/NaverMap";
import { weddingData } from "@/lib/data";

export default function LocationPage() {
  const [copied, setCopied] = useState(false);
  const { venue } = weddingData;
  const query = encodeURIComponent(`${venue.name} ${venue.address}`);
  const { lat, lng } = venue.coordinates;
  const telDigits = venue.tel.replace(/-/g, "");

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(venue.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <main>
      <SubpageHero
        num="03"
        label="오시는 길"
        photo={weddingData.menuHeroes.location}
      />

      <section className="px-6 py-28 sm:px-10 sm:py-36">
        <div className="mx-auto max-w-3xl text-center">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.9, delay: 0.1 }}
            className="font-serif text-[clamp(2rem,6vw,4rem)] font-light leading-tight text-foreground"
          >
            {venue.name}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="mt-4 text-base text-muted sm:text-lg"
          >
            {venue.hall}
          </motion.p>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, delay: 0.35 }}
            className="mx-auto mt-12 h-px w-12 origin-center bg-accent/40 sm:w-16"
          />
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, delay: 0.45 }}
            className="mt-12 text-base text-foreground sm:text-lg"
          >
            {venue.address}
          </motion.p>
          <motion.a
            href={`tel:${telDigits}`}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, delay: 0.55 }}
            className="mt-3 inline-block text-base text-muted transition-colors hover:text-accent sm:text-lg"
          >
            {venue.tel}
          </motion.a>
        </div>
      </section>

      <section className="px-6 pb-12 sm:px-10 sm:pb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9 }}
          className="mx-auto max-w-3xl"
        >
          <div className="overflow-hidden rounded-2xl border border-stone-200/80">
            <NaverMap
              lat={lat}
              lng={lng}
              zoom={17}
              markerLabel={venue.name}
            />
          </div>
        </motion.div>
      </section>

      <section className="px-6 pb-20 sm:px-10 sm:pb-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8 }}
          className="mx-auto max-w-3xl"
        >
          <p className="text-center text-base text-muted sm:text-lg">
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
                key={copied ? "y" : "n"}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
                className="inline-block"
              >
                {copied ? "주소가 복사되었습니다" : "주소 복사"}
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
      <p className="text-base text-accent sm:text-lg">{label}</p>
      <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
        {body}
      </p>
    </div>
  );
}
