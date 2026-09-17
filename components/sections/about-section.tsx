"use client";

import { motion } from "framer-motion";
import { about } from "@/lib/data/site-content";

const paragraphs = about.split("\n\n");

export function AboutSection() {
  return (
    <section
      id="about"
      className="flex min-h-screen scroll-mt-16 flex-col items-center justify-center border-t border-accent/10 px-6 py-24"
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="w-full max-w-2xl"
      >
        <p className="mb-8 font-mono text-xs uppercase tracking-[0.4em] text-accent">
          [ ABOUT ]
        </p>
        <div className="space-y-5 text-base leading-relaxed text-foreground sm:text-lg">
          {paragraphs.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
