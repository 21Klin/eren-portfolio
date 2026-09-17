"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { achievements, type Achievement } from "@/lib/data/site-content";

export function AchievementsSection() {
  const [activeGroup, setActiveGroup] = useState(0);
  const group = achievements[activeGroup];

  return (
    <section
      id="achievements"
      className="flex min-h-screen scroll-mt-16 flex-col items-center gap-10 border-t border-accent/10 px-6 py-24"
    >
      <p className="font-mono text-xs uppercase tracking-[0.4em] text-accent">
        [ ACHIEVEMENTS ]
      </p>

      <div className="flex w-full max-w-4xl flex-wrap justify-center gap-2 border-b border-accent/10 pb-6">
        {achievements.map((g, i) => (
          <button
            key={g.group}
            type="button"
            onClick={() => setActiveGroup(i)}
            className={`border px-3 py-1.5 font-mono text-[0.6rem] uppercase tracking-widest transition-colors ${
              i === activeGroup
                ? "border-accent bg-accent/10 text-accent"
                : "border-accent/20 text-muted hover:border-accent/40 hover:text-foreground"
            }`}
          >
            [{String(i + 1).padStart(2, "0")}] {g.group}
          </button>
        ))}
      </div>

      <div className="w-full max-w-4xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={group.group}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="flex flex-col gap-3"
          >
            <p className="font-mono text-[0.65rem] uppercase tracking-widest text-muted">
              {group.entries.length} {group.entries.length === 1 ? "entry" : "entries"} logged
            </p>
            {group.entries.map((entry, i) => (
              <AchievementEntry key={i} entry={entry} />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

function AchievementEntry({ entry }: { entry: Achievement }) {
  const [expanded, setExpanded] = useState(false);
  const meta = [entry.org, entry.location].filter(Boolean).join(" — ");

  return (
    <div className="border border-accent/20 bg-surface/60 p-4 transition-colors hover:border-accent/40">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 shrink-0 font-mono text-xs text-accent">
            {entry.pending ? "…" : "✓"}
          </span>
          <div>
            <p className="font-mono text-sm text-foreground">{entry.title}</p>
            {meta && (
              <p className="mt-1 font-mono text-[0.7rem] uppercase tracking-wide text-muted">
                {meta}
              </p>
            )}
          </div>
        </div>
        {entry.pending && (
          <span className="shrink-0 border border-accent-dim/60 px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-widest text-accent-dim">
            Pending
          </span>
        )}
      </div>

      <p className="mt-2 pl-6 text-sm leading-relaxed text-foreground/90">
        {entry.result}
      </p>

      {(entry.verifyUrl || entry.certificateImage) && (
        <div className="mt-2 flex gap-4 pl-6">
          {entry.verifyUrl && (
            <a
              href={entry.verifyUrl}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-[0.65rem] uppercase tracking-widest text-accent hover:underline"
            >
              Verify &gt;&gt;
            </a>
          )}
          {entry.certificateImage && (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="font-mono text-[0.65rem] uppercase tracking-widest text-accent hover:underline"
            >
              View certificate &gt;&gt;
            </button>
          )}
        </div>
      )}

      {expanded && entry.certificateImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 p-8"
          onClick={() => setExpanded(false)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- dynamic per-achievement asset path, dimensions unknown */}
          <img
            src={entry.certificateImage}
            alt={entry.title}
            className="max-h-full max-w-full border border-accent/40"
          />
        </div>
      )}
    </div>
  );
}
