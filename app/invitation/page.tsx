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
        photo={weddingData.menuHeroes.invitation}
      />

      <section className="px-4 py-28 sm:px-8 sm:py-40">
        <div className="mx-auto max-w-2xl">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.9, delay: 0.1 }}
            className="text-center font-hand text-[clamp(2.5rem,8vw,4rem)] font-medium leading-[1.2] tracking-[-0.025em] text-foreground"
          >
            {weddingData.invitation.title}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 1, delay: 0.3 }}
            className="mx-auto mt-16 max-w-xl whitespace-pre-line text-center text-[clamp(1.5rem,5.5vw,1.8rem)] leading-[1.9] tracking-[-0.01em] text-foreground/85"
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
      <p className="font-serif text-2xl tracking-wide text-accent sm:text-3xl">
        {role}
      </p>
      <p className="mt-6 font-serif text-[22px] leading-[1.7] text-foreground sm:text-2xl">
        {parents.father} &nbsp;·&nbsp; {parents.mother}
      </p>
      <p className="mt-2 font-serif text-[20px] tracking-wide text-muted sm:text-xl">
        의 {relationship}
      </p>
      <p className="mt-3 font-hand text-[clamp(3.5rem,12vw,6rem)] font-medium tracking-[-0.02em] text-foreground">
        {name}
      </p>
    </div>
  );
}
