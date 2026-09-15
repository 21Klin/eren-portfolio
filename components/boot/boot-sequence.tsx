"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { hero } from "@/lib/data/site-content";
import { hasSeenBoot, markBootSeen } from "@/lib/boot-session";

const CHAR_DELAY_MIN = 18;
const CHAR_DELAY_MAX = 55;
const LINE_PAUSE = 350;
const POST_TYPE_PAUSE = 400;
const POST_PROGRESS_PAUSE = 200;
const GLITCH_DURATION = 480;
const ESTABLISHED_DURATION = 700;
const TRANSITION_DURATION = 520;
const SKIP_APPEAR_DELAY = 1500;

type Stage =
  | "typing"
  | "progress"
  | "glitch"
  | "established"
  | "transition"
  | "done";

const NOISE_BG =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

function useTypewriterLines(lines: string[], active: boolean) {
  const [lineIndex, setLineIndex] = useState(0);
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    if (!active || lineIndex >= lines.length) return;

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
  }, [active, lineIndex, charCount, lines]);

  return { lineIndex, charCount, isComplete: lineIndex >= lines.length };
}

function useBootProgress(active: boolean) {
  const [percent, setPercent] = useState(0);
  const percentRef = useRef(0);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;

    const scheduleNext = () => {
      if (percentRef.current >= 100) return;

      const roll = Math.random();
      let delay = 90 + Math.random() * 140;
      let step = 2 + Math.random() * 5;
      if (roll < 0.15) {
        // stall: no progress, longer wait
        step = 0;
        delay = 220 + Math.random() * 260;
      } else if (roll > 0.88) {
        // spike: sudden jump forward
        step = 14 + Math.random() * 22;
        delay = 60 + Math.random() * 60;
      }

      setTimeout(() => {
        if (cancelled) return;
        const next = Math.min(100, percentRef.current + step);
        percentRef.current = next;
        setPercent(next);
        scheduleNext();
      }, delay);
    };

    scheduleNext();
    return () => {
      cancelled = true;
    };
  }, [active]);

  return Math.round(percent);
}

export function BootSequence() {
  const [stage, setStage] = useState<Stage>("typing");
  const [showSkip, setShowSkip] = useState(false);
  const { lineIndex, charCount, isComplete } = useTypewriterLines(
    hero.bootLines,
    stage === "typing",
  );
  const percent = useBootProgress(stage === "progress");

  useLayoutEffect(() => {
    if (hasSeenBoot()) setStage("done");
  }, []);

  useEffect(() => {
    if (stage === "done") markBootSeen();
  }, [stage]);

  useEffect(() => {
    const timeout = setTimeout(() => setShowSkip(true), SKIP_APPEAR_DELAY);
    return () => clearTimeout(timeout);
  }, []);

  const handleSkip = () => setStage("done");

  useEffect(() => {
    if (stage !== "typing" || !isComplete) return;
    const timeout = setTimeout(() => setStage("progress"), POST_TYPE_PAUSE);
    return () => clearTimeout(timeout);
  }, [stage, isComplete]);

  useEffect(() => {
    if (stage !== "progress" || percent < 100) return;
    const timeout = setTimeout(() => setStage("glitch"), POST_PROGRESS_PAUSE);
    return () => clearTimeout(timeout);
  }, [stage, percent]);

  useEffect(() => {
    if (stage !== "glitch") return;
    const timeout = setTimeout(() => setStage("established"), GLITCH_DURATION);
    return () => clearTimeout(timeout);
  }, [stage]);

  useEffect(() => {
    if (stage !== "established") return;
    const timeout = setTimeout(
      () => setStage("transition"),
      ESTABLISHED_DURATION,
    );
    return () => clearTimeout(timeout);
  }, [stage]);

  useEffect(() => {
    if (stage !== "transition") return;
    const timeout = setTimeout(() => setStage("done"), TRANSITION_DURATION);
    return () => clearTimeout(timeout);
  }, [stage]);

  if (stage === "done") return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black px-6 ${
        stage === "transition" ? "animate-zoom-out" : ""
      }`}
    >
      <div
        className={`w-full max-w-xl border border-accent/30 bg-black/70 p-6 font-mono text-sm text-accent sm:p-8 sm:text-base ${
          stage === "glitch" ? "animate-glitch" : ""
        }`}
      >
        <div className="space-y-2">
          {hero.bootLines.map((line, i) => {
            if (stage === "typing" && i > lineIndex) return null;
            const revealed =
              stage !== "typing" || i < lineIndex
                ? line
                : line.slice(0, charCount);
            return (
              <p key={line}>
                {revealed.split("").map((char, ci) => (
                  <span
                    key={ci}
                    className={
                      stage === "typing" &&
                      i === lineIndex &&
                      ci === revealed.length - 1
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

        {stage === "typing" && (
          <div className="mt-4 flex items-center gap-2">
            <span className="text-muted">&gt;</span>
            <span className="inline-block h-4 w-2.5 animate-blink bg-accent sm:h-5" />
          </div>
        )}

        {(stage === "progress" || stage === "glitch") && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-muted sm:text-sm">
              <span>SYNCING DATASTREAM</span>
              <span className="text-accent">{percent}%</span>
            </div>
            <div className="mt-2 h-2 w-full border border-accent/30 bg-black/60">
              <div
                className="h-full bg-accent transition-[width] duration-150 ease-out"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        )}

        {(stage === "established" || stage === "transition") && (
          <p className="mt-4 animate-established-flicker text-base font-bold tracking-widest text-accent sm:text-lg">
            CONNECTION ESTABLISHED
          </p>
        )}
      </div>

      {stage === "glitch" && (
        <div
          className="pointer-events-none absolute inset-0 mix-blend-screen animate-noise-flash"
          style={{ backgroundImage: NOISE_BG }}
        />
      )}

      {stage === "transition" && (
        <div className="pointer-events-none absolute inset-0 animate-white-flash bg-white" />
      )}

      {showSkip && (stage === "typing" || stage === "progress") && (
        <button
          type="button"
          onClick={handleSkip}
          className="animate-fade-in absolute bottom-6 right-6 font-mono text-xs uppercase tracking-widest text-muted transition-colors hover:text-accent"
        >
          skip &gt;&gt;
        </button>
      )}
    </div>
  );
}
