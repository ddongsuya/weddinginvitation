"use client";

import { motion } from "framer-motion";
import { SubpageHero } from "../components-home/SubpageHero";
import { SubpageNav } from "../components-home/SubpageNav";
import { weddingData } from "@/lib/data";

export default function InvitationPage() {
  return (
    <main>
      <SubpageHero
        num="01"
        label="초대의 글"
        photo={weddingData.gallery[2].src}
      />

      <section className="px-6 py-28 sm:px-10 sm:py-40">
        <div className="mx-auto max-w-2xl">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.9, delay: 0.1 }}
            className="text-center font-serif text-[clamp(1.8rem,5vw,3rem)] font-light leading-tight text-foreground"
          >
            {weddingData.invitation.title}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 1, delay: 0.3 }}
            className="mx-auto mt-16 max-w-md whitespace-pre-line text-center text-base leading-loose text-muted sm:text-lg sm:leading-loose"
          >
            {weddingData.invitation.body}
          </motion.p>

          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mx-auto mt-20 h-px w-16 origin-center bg-accent/40 sm:w-24"
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-16 grid gap-10 sm:grid-cols-2 sm:gap-12"
          >
            <FamilyCard
              role="신랑"
              parents={weddingData.groom.parents}
              name={weddingData.groom.name}
              relationship="아들"
            />
            <FamilyCard
              role="신부"
              parents={weddingData.bride.parents}
              name={weddingData.bride.name}
              relationship="딸"
            />
          </motion.div>
        </div>
      </section>

      <SubpageNav currentHref="/invitation" />
    </main>
  );
}

function FamilyCard({
  role,
  parents,
  name,
  relationship,
}: {
  role: string;
  parents: { father: string; mother: string };
  name: string;
  relationship: string;
}) {
  return (
    <div className="text-center">
      <p className="font-serif text-base text-accent sm:text-lg">{role}</p>
      <p className="mt-6 font-sans text-sm leading-relaxed text-foreground sm:text-base">
        {parents.father} &nbsp;·&nbsp; {parents.mother}
      </p>
      <p className="mt-2 font-sans text-xs text-muted">의 {relationship}</p>
      <p className="mt-3 font-serif text-2xl text-foreground sm:text-3xl">
        {name}
      </p>
    </div>
  );
}
