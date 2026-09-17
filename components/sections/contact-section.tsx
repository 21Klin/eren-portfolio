"use client";

import { motion } from "framer-motion";
import { contact } from "@/lib/data/site-content";

// One row per channel — add Upwork/GitHub/etc. here later without touching layout.
const CHANNELS = [
  { label: "Email", value: contact.email, href: `mailto:${contact.email}` },
];

export function ContactSection() {
  return (
    <section
      id="contact"
      className="flex min-h-screen scroll-mt-16 flex-col items-center justify-center gap-8 border-t border-accent/10 px-6 py-24 text-center"
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="flex w-full max-w-xl flex-col items-center gap-6"
      >
        <p className="font-mono text-xs uppercase tracking-[0.4em] text-accent">
          [ CONTACT ]
        </p>

        <div className="w-full border border-accent/20 bg-surface/60 p-6 text-left font-mono text-xs text-muted">
          <p className="animate-flicker-in text-accent">
            &gt; OPENING TRANSMISSION CHANNEL...
          </p>
          <p className="mt-1">&gt; DESTINATION: EREN.SYS</p>
          <p className="mt-1 text-foreground">&gt; STATUS: READY TO RECEIVE</p>
        </div>

        <div className="flex w-full flex-col gap-3">
          {CHANNELS.map((channel) => (
            <a
              key={channel.label}
              href={channel.href}
              className="group flex items-center justify-between gap-4 border border-accent/20 px-5 py-4 transition-colors hover:border-accent/60"
            >
              <span className="font-mono text-[0.65rem] uppercase tracking-widest text-muted">
                {channel.label}
              </span>
              <span className="truncate font-mono text-sm text-foreground group-hover:text-accent sm:text-base">
                {channel.value}
              </span>
              <span className="font-mono text-xs text-accent opacity-0 transition-opacity group-hover:opacity-100">
                &gt;&gt;
              </span>
            </a>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
