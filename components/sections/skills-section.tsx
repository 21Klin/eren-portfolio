"use client";

import { motion } from "framer-motion";
import { skills } from "@/lib/data/site-content";

export function SkillsSection() {
  return (
    <section
      id="skills"
      className="flex min-h-screen scroll-mt-16 flex-col items-center gap-12 border-t border-accent/10 px-6 py-24"
    >
      <p className="font-mono text-xs uppercase tracking-[0.4em] text-accent">
        [ SKILLS ]
      </p>

      <div className="grid w-full max-w-5xl gap-4 sm:grid-cols-2">
        {skills.map((group, i) => (
          <motion.div
            key={group.category}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.5, delay: (i % 2) * 0.08, ease: "easeOut" }}
            className="border border-accent/20 bg-surface/60 p-5"
          >
            <div className="mb-3 flex items-center gap-2">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
              <h3 className="font-mono text-xs uppercase tracking-[0.25em] text-foreground">
                {group.category}
              </h3>
              <span className="ml-auto font-mono text-[0.6rem] tracking-widest text-accent/50">
                ONLINE
              </span>
            </div>

            <div className="mb-4 h-px w-full overflow-hidden bg-accent/10">
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{
                  duration: 0.8,
                  delay: (i % 2) * 0.08 + 0.1,
                  ease: "easeOut",
                }}
                className="h-full origin-left bg-accent"
              />
            </div>

            <ul className="flex flex-wrap gap-2">
              {group.items.map((item) => (
                <li
                  key={item}
                  className="border border-accent/20 px-2 py-0.5 font-mono text-[0.65rem] uppercase tracking-wide text-accent/80"
                >
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
