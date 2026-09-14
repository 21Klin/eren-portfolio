"use client";

import { hero } from "@/lib/data/site-content";

export function BootSequence() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black px-6">
      <div className="w-full max-w-xl border border-accent/30 bg-black/70 p-6 font-mono text-sm text-accent sm:p-8 sm:text-base">
        <div className="space-y-2">
          {hero.bootLines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-2">
          <span className="text-muted">&gt;</span>
          <span className="inline-block h-4 w-2.5 animate-blink bg-accent sm:h-5" />
        </div>
      </div>
    </div>
  );
}
