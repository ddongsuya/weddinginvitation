"use client";

import { motion } from "framer-motion";
import { weddingData } from "@/lib/data";

export function InvitationSection() {
  return (
    <section className="px-6 py-24" aria-label="모시는 글">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center"
      >
        <p className="font-serif text-[11px] tracking-[0.4em] text-accent">
          INVITATION
        </p>
        <h2 className="mt-6 font-serif text-xl text-foreground">
          {weddingData.invitation.title}
        </h2>
        <p className="mx-auto mt-10 max-w-xs whitespace-pre-line font-serif text-[15px] leading-loose text-foreground/80">
          {weddingData.invitation.body}
        </p>
        <div className="mx-auto mt-12 h-px w-12 bg-accent/40" />
        <div className="mt-10 space-y-2 text-[13px] leading-relaxed text-muted">
          <p>
            <span className="text-foreground">
              {weddingData.groom.parents.father} · {weddingData.groom.parents.mother}
            </span>
            의 아들{" "}
            <span className="font-serif text-foreground">
              {weddingData.groom.name}
            </span>
          </p>
          <p>
            <span className="text-foreground">
              {weddingData.bride.parents.father} · {weddingData.bride.parents.mother}
            </span>
            의 딸{" "}
            <span className="font-serif text-foreground">
              {weddingData.bride.name}
            </span>
          </p>
        </div>
      </motion.div>
    </section>
  );
}
