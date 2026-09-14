"use client";

import { useEffect, useState } from "react";
import { hero } from "@/lib/data/site-content";

const CHAR_DELAY_MIN = 18;
const CHAR_DELAY_MAX = 55;
const LINE_PAUSE = 350;

function useTypewriterLines(lines: string[]) {
  const [lineIndex, setLineIndex] = useState(0);
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    if (lineIndex >= lines.length) return;

    const currentLine = lines[lineIndex];
    if (charCount >= currentLine.length) {
      const timeout = setTimeout(() => {
        setLineIndex((i) => i + 1);
        setCharCount(0);
      }, LINE_PAUSE);
      return () => clearTimeout(timeout);
    }

    const delay =
      CHAR_DELAY_MIN + Math.random() * (CHAR_DELAY_MAX - CHAR_DELAY_MIN);
    const timeout = setTimeout(() => {
      setCharCount((c) => c + 1);
    }, delay);
    return () => clearTimeout(timeout);
  }, [lineIndex, charCount, lines]);

  return { lineIndex, charCount };
}

export function BootSequence() {
  const { lineIndex, charCount } = useTypewriterLines(hero.bootLines);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black px-6">
      <div className="w-full max-w-xl border border-accent/30 bg-black/70 p-6 font-mono text-sm text-accent sm:p-8 sm:text-base">
        <div className="space-y-2">
          {hero.bootLines.map((line, i) => {
            if (i > lineIndex) return null;
            const revealed = i < lineIndex ? line : line.slice(0, charCount);
            return (
              <p key={line}>
                {revealed.split("").map((char, ci) => (
                  <span
                    key={ci}
                    className={
                      i === lineIndex && ci === revealed.length - 1
                        ? "animate-flicker-in"
                        : undefined
                    }
                  >
                    {char}
                  </span>
                ))}
              </p>
            );
          })}
        </div>
        <div className="mt-4 flex items-center gap-2">
          <span className="text-muted">&gt;</span>
          <span className="inline-block h-4 w-2.5 animate-blink bg-accent sm:h-5" />
        </div>
      </div>
    </div>
  );
}
